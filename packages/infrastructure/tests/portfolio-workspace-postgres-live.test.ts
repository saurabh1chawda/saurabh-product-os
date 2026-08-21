import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { definePortfolioExecutionRepositoryContract } from "@career-companion/portfolio-workspace-application/testing";
import {
  AcceptedArtifact,
  AcceptedArtifactId,
  ApprovalReference,
  ArtifactCandidate,
  ArtifactCandidateLifecycle,
  CandidateId,
  ExecutionId,
  PlanSnapshotReference,
  PortfolioExecution,
  PortfolioExecutionCommandContext,
  PortfolioExecutionLifecycle,
  PortfolioPlanReference,
  PortfolioWorkspaceAuthorizationResourceReference,
  PortfolioWorkItem,
  PortfolioWorkItemLifecycle,
  WorkItemId
} from "@career-companion/portfolio-workspace";
import {
  LoadedPortfolioExecution,
  PortfolioExecutionAlreadyExistsError,
  PortfolioExecutionConcurrencyConflictError,
  PortfolioExecutionPersistenceMappingError,
  UnsupportedPortfolioExecutionRecordVersionError
} from "@career-companion/portfolio-workspace-application";
import { PORTFOLIO_EXECUTION_RECORD_VERSION, PortfolioExecutionRecordMapper } from "../src";
import { PortfolioWorkspacePostgresTestHarness, assertSafePortfolioWorkspaceTestDatabaseUrl } from "./portfolio-workspace-postgres-test-harness";

const liveDatabaseUrl = process.env.PORTFOLIO_WORKSPACE_TEST_DATABASE_URL?.trim();
const describeLive = liveDatabaseUrl === undefined ? describe.skip : describe;

describeLive("PostgresPortfolioExecutionRepository live PostgreSQL integration", () => {
  let harness: PortfolioWorkspacePostgresTestHarness;

  beforeAll(async () => {
    if (liveDatabaseUrl === undefined) {
      throw new Error("PORTFOLIO_WORKSPACE_TEST_DATABASE_URL is required.");
    }
    assertSafePortfolioWorkspaceTestDatabaseUrl(liveDatabaseUrl);
    harness = await PortfolioWorkspacePostgresTestHarness.create(liveDatabaseUrl);
  });

  beforeEach(async () => {
    await harness.reset();
  });

  afterAll(async () => {
    await harness?.dispose();
  });

  definePortfolioExecutionRepositoryContract("PostgresPortfolioExecutionRepository live", {
    createRepository: () => harness.repository(),
    reset: async () => harness.reset()
  });

  it("applies the committed migrations and exposes only the approved Portfolio Workspace tables", async () => {
    const tables = await harness.query<{ readonly table_name: string }>(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() ORDER BY table_name"
    );
    const columns = await harness.query<{
      readonly column_name: string;
      readonly is_nullable: "YES" | "NO";
      readonly data_type: string;
    }>(
      `SELECT column_name, is_nullable, data_type
       FROM information_schema.columns
       WHERE table_schema = current_schema()
         AND table_name = 'portfolio_executions'
       ORDER BY ordinal_position`
    );
    const primaryKeys = await harness.query<{ readonly column_name: string }>(
      `SELECT kcu.column_name
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu
         ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
       WHERE tc.table_schema = current_schema()
         AND tc.table_name = 'portfolio_executions'
         AND tc.constraint_type = 'PRIMARY KEY'`
    );

    expect(tables.map((row) => row.table_name)).toEqual([
      "portfolio_executions",
      "portfolio_workspace_idempotency_records"
    ]);
    expect(columns).toEqual([
      { column_name: "execution_id", is_nullable: "NO", data_type: "text" },
      { column_name: "record_version", is_nullable: "NO", data_type: "integer" },
      { column_name: "revision", is_nullable: "NO", data_type: "integer" },
      { column_name: "aggregate_payload", is_nullable: "NO", data_type: "jsonb" }
    ]);
    expect(primaryKeys.map((row) => row.column_name)).toEqual(["execution_id"]);
  });

  it("round-trips a non-trivial aggregate through mapper, JSONB, and adapter load", async () => {
    const repository = harness.repository();
    const execution = createRichExecution();

    const save = await repository.save(execution);
    expect(save.isSuccess).toBe(true);

    const rows = await harness.query<{
      readonly execution_id: string;
      readonly record_version: number;
      readonly revision: number;
      readonly aggregate_payload: Record<string, unknown>;
    }>("SELECT execution_id, record_version, revision, aggregate_payload FROM portfolio_executions");
    expect(rows).toHaveLength(1);
    expect(rows[0]?.execution_id).toBe("execution:rich-live");
    expect(rows[0]?.record_version).toBe(PORTFOLIO_EXECUTION_RECORD_VERSION);
    expect(rows[0]?.revision).toBe(1);
    expect(rows[0]?.aggregate_payload).toEqual(PortfolioExecutionRecordMapper.toRecord(execution).aggregatePayload);
    expect(rows[0]?.aggregate_payload).toHaveProperty("authorizationResourceReference", {
      authorizationResourceReference: "portfolio-workspace:execution-owner-1"
    });
    expect(rows[0]?.aggregate_payload).not.toHaveProperty("revision");

    const loaded = expectLoaded(await repository.loadByExecutionId(execution.id));
    expect(loaded.execution.toJSON()).toEqual(execution.toJSON());
    expect(loaded.execution.workItems().map((workItem) => workItem.id.toJSON())).toEqual([
      "work-item:pending",
      "work-item:active",
      "work-item:completed"
    ]);
    expect(loaded.execution.acceptedArtifacts().map((artifact) => artifact.id.toJSON())).toEqual([
      "accepted-artifact:one"
    ]);
  });

  it("maps real duplicate-key and compare-and-swap conflicts to technology-neutral errors", async () => {
    const repository = harness.repository();
    const first = createExecution("execution:conflict");
    const second = createExecution("execution:conflict");
    second.beginExecution(commandContext("duplicate-attempt"));

    expect((await repository.save(first)).isSuccess).toBe(true);
    const duplicate = await repository.save(second);
    expect(duplicate.isFailure).toBe(true);
    expect(duplicate.error).toBeInstanceOf(PortfolioExecutionAlreadyExistsError);
    expect(JSON.stringify(duplicate.error?.toJSON())).not.toContain("23505");
    expect(JSON.stringify(duplicate.error?.toJSON())).not.toContain("portfolio_executions");

    const copyA = expectLoaded(await repository.loadByExecutionId(first.id));
    const copyB = expectLoaded(await repository.loadByExecutionId(first.id));
    copyA.execution.beginExecution(commandContext("copy-a"));
    const savedA = await repository.save(copyA.execution, copyA.revision);
    expect(savedA.isSuccess).toBe(true);
    expect(savedA.value?.revision.toJSON()).toBe(2);

    copyB.execution.beginExecution(commandContext("copy-b"));
    const stale = await repository.save(copyB.execution, copyB.revision);
    expect(stale.isFailure).toBe(true);
    expect(stale.error).toBeInstanceOf(PortfolioExecutionConcurrencyConflictError);
    expect(JSON.stringify(stale.error?.toJSON())).not.toContain("portfolio_executions");
    expect(expectLoaded(await repository.loadByExecutionId(first.id)).execution.toJSON()).toEqual(copyA.execution.toJSON());
  });

  it("rejects invalid constraints through PostgreSQL", async () => {
    const payload = PortfolioExecutionRecordMapper.toRecord(createExecution("execution:constraint")).aggregatePayload;

    await expect(harness.insertRawPortfolioExecutionRow({
      executionId: "execution:bad-revision",
      recordVersion: PORTFOLIO_EXECUTION_RECORD_VERSION,
      revision: 0,
      aggregatePayload: payload
    })).rejects.toThrow();

    await expect(harness.insertRawPortfolioExecutionRow({
      executionId: "execution:bad-record-version",
      recordVersion: 0,
      revision: 1,
      aggregatePayload: payload
    })).rejects.toThrow();

    await expect(harness.query(
      "INSERT INTO portfolio_executions (execution_id, record_version, revision, aggregate_payload) VALUES ($1, $2, $3, $4)",
      ["execution:null-payload", PORTFOLIO_EXECUTION_RECORD_VERSION, 1, null]
    )).rejects.toThrow();
  });

  it("maps corrupt payload and unsupported record versions without changing stored rows", async () => {
    const repository = harness.repository();
    const record = PortfolioExecutionRecordMapper.toRecord(createExecution("execution:corrupt-live"));
    const corruptPayload = { ...record.aggregatePayload, id: "" };
    const missingAuthorizationPayload = { ...record.aggregatePayload };
    delete (missingAuthorizationPayload as { authorizationResourceReference?: unknown }).authorizationResourceReference;

    await harness.insertRawPortfolioExecutionRow({
      executionId: "execution:corrupt-live",
      recordVersion: PORTFOLIO_EXECUTION_RECORD_VERSION,
      revision: 1,
      aggregatePayload: corruptPayload
    });
    await expect(repository.loadByExecutionId(new ExecutionId("execution:corrupt-live"))).rejects.toBeInstanceOf(PortfolioExecutionPersistenceMappingError);
    expect((await harness.query<{ readonly aggregate_payload: Record<string, unknown> }>(
      "SELECT aggregate_payload FROM portfolio_executions WHERE execution_id = $1",
      ["execution:corrupt-live"]
    ))[0]?.aggregate_payload).toEqual(corruptPayload);

    await harness.reset();
    await harness.insertRawPortfolioExecutionRow({
      executionId: "execution:missing-authorization-live",
      recordVersion: PORTFOLIO_EXECUTION_RECORD_VERSION,
      revision: 1,
      aggregatePayload: missingAuthorizationPayload
    });
    await expect(repository.loadByExecutionId(new ExecutionId("execution:missing-authorization-live"))).rejects.toBeInstanceOf(PortfolioExecutionPersistenceMappingError);

    await harness.reset();
    await harness.insertRawPortfolioExecutionRow({
      executionId: "execution:version-one-live",
      recordVersion: 1,
      revision: 1,
      aggregatePayload: record.aggregatePayload
    });
    await expect(repository.loadByExecutionId(new ExecutionId("execution:version-one-live"))).rejects.toBeInstanceOf(UnsupportedPortfolioExecutionRecordVersionError);

    await harness.reset();
    await harness.insertRawPortfolioExecutionRow({
      executionId: "execution:future-live",
      recordVersion: 99,
      revision: 1,
      aggregatePayload: record.aggregatePayload
    });
    await expect(repository.loadByExecutionId(new ExecutionId("execution:future-live"))).rejects.toBeInstanceOf(UnsupportedPortfolioExecutionRecordVersionError);
  });

  it("returns independent object graphs from repeated live loads", async () => {
    const repository = harness.repository();
    const execution = createExecution("execution:isolation");
    expect((await repository.save(execution)).isSuccess).toBe(true);

    const first = expectLoaded(await repository.loadByExecutionId(execution.id));
    const second = expectLoaded(await repository.loadByExecutionId(execution.id));

    expect(first).not.toBe(second);
    expect(first.execution).not.toBe(second.execution);
    expect(first.execution.toJSON()).toEqual(second.execution.toJSON());
    first.execution.beginExecution(commandContext("unsaved-first"));
    expect(expectLoaded(await repository.loadByExecutionId(execution.id)).execution.lifecycle).toBe(PortfolioExecutionLifecycle.Initialized);
  });
});

function createRichExecution(): PortfolioExecution {
  return new PortfolioExecution({
    id: new ExecutionId("execution:rich-live"),
    portfolioPlanReference: new PortfolioPlanReference({
      planId: "plan:rich-live",
      roadmapId: "roadmap:rich-live",
      planArtifactReference: "artifact:plan:rich-live"
    }),
    planSnapshotReference: new PlanSnapshotReference({
      snapshotReference: "snapshot:plan:rich-live:v1"
    }),
    approvalReference: new ApprovalReference({
      approvalReference: "approval:plan:rich-live"
    }),
    authorizationResourceReference: new PortfolioWorkspaceAuthorizationResourceReference({
      authorizationResourceReference: "portfolio-workspace:execution-owner-1"
    }),
    commandContext: commandContext("initialization-rich-live"),
    lifecycle: PortfolioExecutionLifecycle.Active,
    workItems: [
      new PortfolioWorkItem({
        id: new WorkItemId("work-item:pending"),
        lifecycle: PortfolioWorkItemLifecycle.Pending
      }),
      new PortfolioWorkItem({
        id: new WorkItemId("work-item:active"),
        lifecycle: PortfolioWorkItemLifecycle.Active
      }),
      new PortfolioWorkItem({
        id: new WorkItemId("work-item:completed"),
        lifecycle: PortfolioWorkItemLifecycle.Completed
      })
    ],
    candidates: [
      new ArtifactCandidate({
        id: new CandidateId("candidate:registered"),
        lifecycle: ArtifactCandidateLifecycle.Registered
      }),
      new ArtifactCandidate({
        id: new CandidateId("candidate:accepted"),
        lifecycle: ArtifactCandidateLifecycle.Accepted
      }),
      new ArtifactCandidate({
        id: new CandidateId("candidate:rejected"),
        lifecycle: ArtifactCandidateLifecycle.Rejected
      })
    ],
    acceptedArtifacts: [
      new AcceptedArtifact({
        id: new AcceptedArtifactId("accepted-artifact:one")
      })
    ]
  });
}

function createExecution(id: string): PortfolioExecution {
  return new PortfolioExecution({
    id: new ExecutionId(id),
    portfolioPlanReference: new PortfolioPlanReference({
      planId: `plan:${id}`,
      roadmapId: `roadmap:${id}`,
      planArtifactReference: `artifact:plan:${id}`
    }),
    planSnapshotReference: new PlanSnapshotReference({
      snapshotReference: `snapshot:plan:${id}:v1`
    }),
    approvalReference: new ApprovalReference({
      approvalReference: `approval:plan:${id}`
    }),
    authorizationResourceReference: new PortfolioWorkspaceAuthorizationResourceReference({
      authorizationResourceReference: "portfolio-workspace:execution-owner-1"
    }),
    commandContext: commandContext(`initialization:${id}`),
    lifecycle: PortfolioExecutionLifecycle.Initialized
  });
}

function commandContext(suffix: string): PortfolioExecutionCommandContext {
  return new PortfolioExecutionCommandContext({
    commandId: `command:${suffix}`,
    correlationId: `correlation:${suffix}`,
    actorReference: `actor:${suffix}`,
    occurredAt: "2026-08-01T00:00:00.000Z"
  });
}

function expectLoaded(loaded: LoadedPortfolioExecution | undefined): LoadedPortfolioExecution {
  if (loaded === undefined) {
    throw new Error("Expected repository to load PortfolioExecution.");
  }

  return loaded;
}
