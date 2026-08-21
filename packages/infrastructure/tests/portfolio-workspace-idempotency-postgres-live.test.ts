import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { Result } from "@career-companion/kernel";
import {
  ApprovalReference,
  CandidateId,
  ExecutionId,
  PlanSnapshotReference,
  PortfolioExecutionCommandContext,
  PortfolioPlanReference,
  PortfolioWorkspaceAuthorizationResourceReference,
  WorkItemId
} from "@career-companion/portfolio-workspace";
import {
  InitializeArtifactCandidateDefinition,
  InitializePortfolioExecutionApplicationService,
  InitializePortfolioExecutionInput,
  InitializePortfolioWorkItemDefinition,
  PortfolioExecutionAlreadyExistsError,
  PortfolioWorkspaceIdempotencyCommandBinding,
  PortfolioWorkspaceIdempotencyExpiryMetadata,
  PortfolioWorkspaceIdempotencyIdentity,
  PortfolioWorkspaceIdempotencyKeyHash,
  PortfolioWorkspaceIdempotencyOperation,
  PortfolioWorkspaceIdempotencyReplayPayload,
  PortfolioWorkspaceIdempotencyRequestFingerprint,
  type PortfolioExecutionRepository
} from "@career-companion/portfolio-workspace-application";
import {
  PortfolioWorkspaceIdempotentMutationResultKind,
  PortfolioWorkspaceIdempotencyPersistenceOperation,
  PortfolioWorkspaceIdempotencyReservationKind,
  PostgresPortfolioWorkspaceIdempotentMutationOrchestrator,
  PostgresPortfolioWorkspaceIdempotencyStore
} from "../src";
import { PortfolioWorkspacePostgresTestHarness, assertSafePortfolioWorkspaceTestDatabaseUrl } from "./portfolio-workspace-postgres-test-harness";

const liveDatabaseUrl = process.env.PORTFOLIO_WORKSPACE_TEST_DATABASE_URL?.trim();
const describeLive = liveDatabaseUrl === undefined ? describe.skip : describe;

describeLive("PostgresPortfolioWorkspaceIdempotencyStore live PostgreSQL integration", () => {
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

  it("applies migration, reserves first request, detects in-progress duplicate, and rejects fingerprint mismatch", async () => {
    const store = new PostgresPortfolioWorkspaceIdempotencyStore(harness.database);

    const first = await store.reserve(reservationInput());
    const duplicate = await store.reserve(reservationInput());
    const mismatch = await store.reserve(reservationInput({ fingerprint: fingerprintB }));

    expect(first.value?.kind).toBe(PortfolioWorkspaceIdempotencyReservationKind.FirstExecutionReserved);
    expect(duplicate.value?.kind).toBe(PortfolioWorkspaceIdempotencyReservationKind.InProgress);
    expect(mismatch.value?.kind).toBe(PortfolioWorkspaceIdempotencyReservationKind.ConflictFingerprintMismatch);
    expect(await tableNames()).toEqual([
      "portfolio_executions",
      "portfolio_workspace_idempotency_records"
    ]);
    expect(await idempotencyRows()).toHaveLength(1);
  });

  it("stores safe replay payload and replays it across store recreation", async () => {
    const store = new PostgresPortfolioWorkspaceIdempotencyStore(harness.database);
    expect((await store.reserve(reservationInput())).value?.kind).toBe("first-execution-reserved");
    expect((await store.completeSuccess({
      scope,
      fingerprint: fingerprintA,
      replayPayload,
      completedAt
    })).isSuccess).toBe(true);

    const recreatedStore = new PostgresPortfolioWorkspaceIdempotencyStore(harness.database);
    const replay = await recreatedStore.reserve(reservationInput());

    expect(replay.value?.kind).toBe(PortfolioWorkspaceIdempotencyReservationKind.ReplaySucceeded);
    expect(replay.value?.replayPayload).toEqual(replayPayload);
    expect(JSON.stringify(replay.value)).not.toContain("idem-key-1");
    expect(JSON.stringify(replay.value)).not.toContain("portfolio_workspace_idempotency_records");
  });

  it("release after mutation failure removes the reservation and permits a later reservation", async () => {
    const store = new PostgresPortfolioWorkspaceIdempotencyStore(harness.database);

    expect((await store.reserve(reservationInput())).value?.kind).toBe("first-execution-reserved");
    expect((await store.release({ scope, fingerprint: fingerprintA })).isSuccess).toBe(true);
    expect(await idempotencyRows()).toHaveLength(0);

    const afterRelease = await store.reserve(reservationInput());
    expect(afterRelease.value?.kind).toBe(PortfolioWorkspaceIdempotencyReservationKind.FirstExecutionReserved);
  });

  it("allows exactly one concurrent first reservation for the same scope and fingerprint", async () => {
    const store = new PostgresPortfolioWorkspaceIdempotencyStore(harness.database);

    const results = await Promise.all(Array.from({ length: 8 }, () => store.reserve(reservationInput())));
    const kinds = results.map((result) => result.value?.kind);

    expect(kinds.filter((kind) => kind === PortfolioWorkspaceIdempotencyReservationKind.FirstExecutionReserved)).toHaveLength(1);
    expect(kinds.filter((kind) => kind === PortfolioWorkspaceIdempotencyReservationKind.InProgress)).toHaveLength(7);
    expect(await idempotencyRows()).toHaveLength(1);
  });

  it("does not let concurrent different-fingerprint requests both acquire ownership", async () => {
    const store = new PostgresPortfolioWorkspaceIdempotencyStore(harness.database);

    const results = await Promise.all([
      store.reserve(reservationInput({ fingerprint: fingerprintA })),
      store.reserve(reservationInput({ fingerprint: fingerprintB }))
    ]);
    const kinds = results.map((result) => result.value?.kind);

    expect(kinds.filter((kind) => kind === PortfolioWorkspaceIdempotencyReservationKind.FirstExecutionReserved)).toHaveLength(1);
    expect(kinds.filter((kind) => kind === PortfolioWorkspaceIdempotencyReservationKind.ConflictFingerprintMismatch)).toHaveLength(1);
  });

  it("maps PostgreSQL constraint failures through safe persistence errors", async () => {
    const store = new PostgresPortfolioWorkspaceIdempotencyStore(harness.database);
    const result = await store.reserve(reservationInput({
      fingerprint: {
        algorithm: "sha256",
        value: "not-a-valid-hash"
      }
    }));

    expect(result.isFailure).toBe(true);
    expect(result.error?.reason).toBe("invalid-record");
    expect(JSON.stringify(result.error?.toJSON())).not.toContain("SQL");
    expect(JSON.stringify(result.error?.toJSON())).not.toContain("portfolio_workspace_idempotency_records");
  });

  it("atomically commits initialization, aggregate persistence, and replay completion", async () => {
    const orchestrator = new PostgresPortfolioWorkspaceIdempotentMutationOrchestrator(harness.database);

    const result = await orchestrator.execute({
      ...orchestrationInput("execution:atomic-success"),
      execute: async ({ repository }) => {
        const service = new InitializePortfolioExecutionApplicationService({ repository });
        const initialized = await service.initialize(initializeInput("execution:atomic-success"));
        if (initialized.isFailure) {
          return Result.failure(initialized.error!);
        }

        return Result.success({
          value: initialized.value!,
          replayPayload: appReplayPayload("execution:atomic-success")
        });
      }
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value?.kind).toBe(PortfolioWorkspaceIdempotentMutationResultKind.Executed);
    expect(await aggregateRows()).toHaveLength(1);
    expect(await idempotencyRows()).toMatchObject([{
      status: "succeeded",
      original_command_id: "command:original",
      original_correlation_id: "correlation:original",
      replay_contract_version: "portfolio-workspace-initialize:v1"
    }]);
  });

  it("replays a completed mutation without executing the aggregate workflow again", async () => {
    const orchestrator = new PostgresPortfolioWorkspaceIdempotentMutationOrchestrator(harness.database);
    let executionCount = 0;

    const first = await orchestrator.execute({
      ...orchestrationInput("execution:atomic-replay"),
      execute: async ({ repository }) => {
        executionCount += 1;
        const service = new InitializePortfolioExecutionApplicationService({ repository });
        const initialized = await service.initialize(initializeInput("execution:atomic-replay"));
        if (initialized.isFailure) {
          return Result.failure(initialized.error!);
        }
        return Result.success({
          value: initialized.value!,
          replayPayload: appReplayPayload("execution:atomic-replay")
        });
      }
    });
    const replay = await orchestrator.execute({
      ...orchestrationInput("execution:atomic-replay"),
      execute: async () => {
        executionCount += 1;
        return Result.failure(new Error("Replay path must not execute mutation."));
      }
    });

    expect(first.value?.kind).toBe(PortfolioWorkspaceIdempotentMutationResultKind.Executed);
    expect(replay.value?.kind).toBe(PortfolioWorkspaceIdempotentMutationResultKind.ReplayAvailable);
    expect(replay.value?.replayPayload).toEqual(appReplayPayload("execution:atomic-replay").toJSON());
    expect(executionCount).toBe(1);
    expect(await aggregateRows()).toHaveLength(1);
  });

  it("returns fingerprint mismatch without mutating aggregate state", async () => {
    const orchestrator = new PostgresPortfolioWorkspaceIdempotentMutationOrchestrator(harness.database);

    expect((await orchestrator.execute(successfulInitialization("execution:atomic-mismatch"))).value?.kind)
      .toBe(PortfolioWorkspaceIdempotentMutationResultKind.Executed);
    const mismatch = await orchestrator.execute({
      ...successfulInitialization("execution:atomic-mismatch"),
      requestFingerprint: appFingerprint("b")
    });

    expect(mismatch.value?.kind).toBe(PortfolioWorkspaceIdempotentMutationResultKind.FingerprintMismatch);
    expect(await aggregateRows()).toHaveLength(1);
    expect(await idempotencyRows()).toHaveLength(1);
  });

  it("rolls back reservation when the aggregate mutation fails", async () => {
    const orchestrator = new PostgresPortfolioWorkspaceIdempotentMutationOrchestrator(harness.database);
    const failure = new Error("simulated mutation failure");

    const result = await orchestrator.execute({
      ...orchestrationInput("execution:atomic-mutation-failure"),
      execute: async () => Result.failure(failure)
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe(failure);
    expect(await aggregateRows()).toHaveLength(0);
    expect(await idempotencyRows()).toHaveLength(0);
  });

  it("rolls back aggregate persistence when replay completion fails", async () => {
    const orchestrator = new PostgresPortfolioWorkspaceIdempotentMutationOrchestrator(harness.database);

    const result = await orchestrator.execute({
      ...orchestrationInput("execution:atomic-replay-failure"),
      execute: async ({ repository }) => {
        const service = new InitializePortfolioExecutionApplicationService({ repository });
        const initialized = await service.initialize(initializeInput("execution:atomic-replay-failure"));
        if (initialized.isFailure) {
          return Result.failure(initialized.error!);
        }

        return Result.success({
          value: initialized.value!,
          replayPayload: {
            toJSON: () => ({
              replayContractVersion: "",
              responsePayload: {}
            })
          } as PortfolioWorkspaceIdempotencyReplayPayload
        });
      }
    });

    expect(result.isFailure).toBe(true);
    expect(await aggregateRows()).toHaveLength(0);
    expect(await idempotencyRows()).toHaveLength(0);
  });

  it("rolls back reservation when aggregate optimistic creation conflicts", async () => {
    const repository = harness.repository();
    const seeded = await new InitializePortfolioExecutionApplicationService({ repository })
      .initialize(initializeInput("execution:atomic-duplicate"));
    expect(seeded.isSuccess).toBe(true);

    const result = await new PostgresPortfolioWorkspaceIdempotentMutationOrchestrator(harness.database)
      .execute(successfulInitialization("execution:atomic-duplicate"));

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(PortfolioExecutionAlreadyExistsError);
    expect(await aggregateRows()).toHaveLength(1);
    expect(await idempotencyRows()).toHaveLength(0);
  });

  it("allows at most one concurrent first execution for a shared idempotency identity", async () => {
    const orchestrator = new PostgresPortfolioWorkspaceIdempotentMutationOrchestrator(harness.database);

    const results = await Promise.all(Array.from({ length: 6 }, () => orchestrator.execute(
      successfulInitialization("execution:atomic-race")
    )));
    const kinds = results.map((result) => result.value?.kind);

    expect(kinds.filter((kind) => kind === PortfolioWorkspaceIdempotentMutationResultKind.Executed)).toHaveLength(1);
    expect(kinds.filter((kind) =>
      kind === PortfolioWorkspaceIdempotentMutationResultKind.ReplayAvailable
      || kind === PortfolioWorkspaceIdempotentMutationResultKind.InProgress
    )).toHaveLength(5);
    expect(results.every((result) => result.isSuccess)).toBe(true);
    expect(await aggregateRows()).toHaveLength(1);
    expect(await idempotencyRows()).toHaveLength(1);
  });

  async function tableNames(): Promise<readonly string[]> {
    const rows = await harness.query<{ readonly table_name: string }>(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() ORDER BY table_name"
    );
    return rows.map((row) => row.table_name);
  }

  async function idempotencyRows(): Promise<readonly Record<string, unknown>[]> {
    return harness.query("SELECT * FROM portfolio_workspace_idempotency_records");
  }

  async function aggregateRows(): Promise<readonly Record<string, unknown>[]> {
    return harness.query("SELECT * FROM portfolio_executions");
  }
});

const now = new Date("2026-08-11T00:00:00.000Z");
const completedAt = new Date("2026-08-11T00:00:01.000Z");
const expiresAt = new Date("2026-08-12T00:00:00.000Z");
const fingerprintA = {
  algorithm: "sha256" as const,
  value: "a".repeat(64)
};
const fingerprintB = {
  algorithm: "sha256" as const,
  value: "b".repeat(64)
};
const scope = {
  operation: PortfolioWorkspaceIdempotencyPersistenceOperation.InitializeExecution,
  authorizationResourceReference: "portfolio-workspace:owner-hash",
  resourceIdentity: "execution:idempotent-live",
  idempotencyKeyHash: "c".repeat(64)
};
const replayPayload = {
  replayContractVersion: "portfolio-workspace-initialize:v1",
  responsePayload: {
    v: "1",
    executionId: "execution:idempotent-live"
  }
};

function reservationInput(
  overrides: Partial<{
    readonly fingerprint: typeof fingerprintA;
  }> = {}
) {
  return {
    scope,
    fingerprint: overrides.fingerprint ?? fingerprintA,
    originalCommandId: "command:original",
    originalCorrelationId: "correlation:original",
    now,
    expiresAt
  };
}

function successfulInitialization(executionId: string) {
  return {
    ...orchestrationInput(executionId),
    execute: async ({ repository }: { readonly repository: PortfolioExecutionRepository }) => {
      const initialized = await new InitializePortfolioExecutionApplicationService({ repository })
        .initialize(initializeInput(executionId));
      if (initialized.isFailure) {
        return Result.failure(initialized.error!);
      }

      return Result.success({
        value: initialized.value!,
        replayPayload: appReplayPayload(executionId)
      });
    }
  };
}

function orchestrationInput(executionId: string) {
  return {
    identity: new PortfolioWorkspaceIdempotencyIdentity({
      authorizationResourceReference: authorizationResourceReference(),
      operation: PortfolioWorkspaceIdempotencyOperation.InitializeExecution,
      resourceIdentity: executionId,
      keyHash: new PortfolioWorkspaceIdempotencyKeyHash({
        value: "d".repeat(64)
      })
    }),
    requestFingerprint: appFingerprint("a"),
    commandBinding: new PortfolioWorkspaceIdempotencyCommandBinding({
      originalCommandId: "command:original",
      originalCorrelationId: "correlation:original"
    }),
    expiry: new PortfolioWorkspaceIdempotencyExpiryMetadata({
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      completedAt: completedAt.toISOString()
    })
  };
}

function initializeInput(executionId: string): InitializePortfolioExecutionInput {
  return new InitializePortfolioExecutionInput({
    executionId: new ExecutionId(executionId),
    portfolioPlanReference: new PortfolioPlanReference({
      planId: "plan:atomic",
      roadmapId: "roadmap:atomic",
      planArtifactReference: "artifact:atomic"
    }),
    planSnapshotReference: new PlanSnapshotReference({
      snapshotReference: "snapshot:atomic"
    }),
    approvalReference: new ApprovalReference({
      approvalReference: "approval:atomic"
    }),
    authorizationResourceReference: authorizationResourceReference(),
    commandContext: new PortfolioExecutionCommandContext({
      commandId: "command:original",
      correlationId: "correlation:original",
      actorReference: "actor:original",
      occurredAt: now.toISOString()
    }),
    workItems: [
      new InitializePortfolioWorkItemDefinition({
        workItemId: new WorkItemId("work-item:atomic")
      })
    ],
    candidates: [
      new InitializeArtifactCandidateDefinition({
        candidateId: new CandidateId("candidate:atomic")
      })
    ]
  });
}

function authorizationResourceReference(): PortfolioWorkspaceAuthorizationResourceReference {
  return new PortfolioWorkspaceAuthorizationResourceReference({
    authorizationResourceReference: "portfolio-workspace:principal:user:atomic-owner"
  });
}

function appFingerprint(prefix: string): PortfolioWorkspaceIdempotencyRequestFingerprint {
  return new PortfolioWorkspaceIdempotencyRequestFingerprint({
    value: prefix.repeat(64)
  });
}

function appReplayPayload(executionId: string): PortfolioWorkspaceIdempotencyReplayPayload {
  return new PortfolioWorkspaceIdempotencyReplayPayload({
    replayContractVersion: "portfolio-workspace-initialize:v1",
    responsePayload: {
      v: "1",
      executionId
    }
  });
}
