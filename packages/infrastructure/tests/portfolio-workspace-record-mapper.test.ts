import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
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
  PortfolioExecutionSummaryProjection,
  PortfolioPlanReference,
  PortfolioWorkItem,
  PortfolioWorkItemLifecycle,
  WorkItemId
} from "@career-companion/portfolio-workspace";
import {
  PortfolioExecutionPersistenceMappingError,
  UnsupportedPortfolioExecutionRecordVersionError
} from "@career-companion/portfolio-workspace-application";
import {
  PORTFOLIO_EXECUTION_RECORD_VERSION,
  PortfolioExecutionRecordMapper
} from "../src";
import * as publicApi from "../src";

describe("PortfolioExecutionRecordMapper", () => {
  it("round-trips initialized, active, completed, and cancelled aggregates", () => {
    const executions = [
      createExecution("execution:initialized", PortfolioExecutionLifecycle.Initialized),
      createExecution("execution:active", PortfolioExecutionLifecycle.Active),
      createExecution("execution:completed", PortfolioExecutionLifecycle.Completed),
      createExecution("execution:cancelled", PortfolioExecutionLifecycle.Cancelled)
    ];

    for (const execution of executions) {
      const record = PortfolioExecutionRecordMapper.toRecord(execution);
      const mapped = PortfolioExecutionRecordMapper.fromRecord(record);

      expect(mapped.isSuccess).toBe(true);
      expect(expectSuccess(mapped.value).toJSON()).toEqual(execution.toJSON());
      expect(expectSuccess(mapped.value)).not.toBe(execution);
      expect(expectSuccess(mapped.value).workItems()[0]).not.toBe(execution.workItems()[0]);
      expect(expectSuccess(mapped.value).candidates()[0]).not.toBe(execution.candidates()[0]);
      expect(expectSuccess(mapped.value).acceptedArtifacts()[0]).not.toBe(execution.acceptedArtifacts()[0]);
    }
  });

  it("maps only canonical primitive aggregate state to an immutable durable record", () => {
    const execution = createExecution("execution:record", PortfolioExecutionLifecycle.Active);
    const before = execution.toJSON();

    const record = PortfolioExecutionRecordMapper.toRecord(execution);

    expect(record).toEqual({
      recordVersion: PORTFOLIO_EXECUTION_RECORD_VERSION,
      executionId: "execution:record",
      aggregatePayload: before
    });
    expect(Object.isFrozen(record)).toBe(true);
    expect(Object.isFrozen(record.aggregatePayload)).toBe(true);
    expect(Object.isFrozen(record.aggregatePayload.workItems)).toBe(true);
    expect(Object.isFrozen(record.aggregatePayload.workItems[0])).toBe(true);
    expect(execution.toJSON()).toEqual(before);
    expect(record).not.toHaveProperty("revision");
    expect(record).not.toHaveProperty("facts");
    expect(record).not.toHaveProperty("projections");
    expect(record).not.toHaveProperty("policies");
    expect(record).not.toHaveProperty("applicationResult");
    expect(record).not.toHaveProperty("transaction");
    expect(record).not.toHaveProperty("database");
    expect(record).not.toHaveProperty("operationCommandContexts");
    expect(JSON.stringify(record)).not.toContain("PortfolioExecutionStarted");
  });

  it("preserves identifiers, references, initialization context, lifecycles, and collection ordering", () => {
    const execution = createExecution("execution:ordered", PortfolioExecutionLifecycle.Active);

    const mapped = PortfolioExecutionRecordMapper.fromRecord(PortfolioExecutionRecordMapper.toRecord(execution));

    expect(expectSuccess(mapped.value).toJSON()).toEqual({
      id: "execution:ordered",
      portfolioPlanReference: {
        planId: "plan:execution:ordered",
        roadmapId: "roadmap:execution:ordered",
        planArtifactReference: "artifact:plan:execution:ordered"
      },
      planSnapshotReference: {
        snapshotReference: "snapshot:execution:ordered:v1"
      },
      approvalReference: {
        approvalReference: "approval:execution:ordered"
      },
      commandContext: commandContext("initialization:execution:ordered").toJSON(),
      lifecycle: PortfolioExecutionLifecycle.Active,
      workItems: [
        { id: "work-item:pending", lifecycle: PortfolioWorkItemLifecycle.Pending },
        { id: "work-item:active", lifecycle: PortfolioWorkItemLifecycle.Active },
        { id: "work-item:blocked", lifecycle: PortfolioWorkItemLifecycle.Blocked },
        { id: "work-item:ready", lifecycle: PortfolioWorkItemLifecycle.ReadyForReview },
        { id: "work-item:completed", lifecycle: PortfolioWorkItemLifecycle.Completed },
        { id: "work-item:cancelled", lifecycle: PortfolioWorkItemLifecycle.Cancelled }
      ],
      candidates: [
        { id: "candidate:registered", lifecycle: ArtifactCandidateLifecycle.Registered },
        { id: "candidate:accepted", lifecycle: ArtifactCandidateLifecycle.Accepted },
        { id: "candidate:rejected", lifecycle: ArtifactCandidateLifecycle.Rejected }
      ],
      acceptedArtifacts: [
        { id: "accepted-artifact:one" },
        { id: "accepted-artifact:two" }
      ]
    });
  });

  it("rehydrates without replaying behavior, producing facts, evaluating policies, or deriving projections", () => {
    const execution = createExecution("execution:no-replay", PortfolioExecutionLifecycle.Active);
    const mapped = PortfolioExecutionRecordMapper.fromRecord(PortfolioExecutionRecordMapper.toRecord(execution));
    const aggregate = expectSuccess(mapped.value);

    expect(aggregate.toJSON()).toEqual(execution.toJSON());
    expect(PortfolioExecutionSummaryProjection.fromExecution(aggregate).factTypes).toEqual([]);
    expect(aggregate).not.toHaveProperty("pendingFacts");
    expect(aggregate).not.toHaveProperty("recordedFacts");
    expect(aggregate).not.toHaveProperty("events");
    expect(aggregate).not.toHaveProperty("policy");
  });

  it("returns unsupported-version failure for noncanonical record versions", () => {
    const record = mutableRecord(createExecution("execution:version", PortfolioExecutionLifecycle.Initialized));
    record.recordVersion = 2;

    const result = PortfolioExecutionRecordMapper.fromUnknownRecord(record);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnsupportedPortfolioExecutionRecordVersionError);
    expect(result.error?.toJSON()).toEqual({
      name: "UnsupportedPortfolioExecutionRecordVersionError",
      code: "UNSUPPORTED_PORTFOLIO_EXECUTION_RECORD_VERSION",
      recordVersion: 2
    });
  });

  it.each([
    ["missing version", (record: MutablePortfolioExecutionRecord) => { delete record.recordVersion; }],
    ["missing execution identity", (record: MutablePortfolioExecutionRecord) => { record.executionId = ""; }],
    ["mismatched execution identity", (record: MutablePortfolioExecutionRecord) => { record.aggregatePayload.id = "execution:other"; }],
    ["invalid portfolio plan reference", (record: MutablePortfolioExecutionRecord) => { record.aggregatePayload.portfolioPlanReference.planId = ""; }],
    ["invalid plan snapshot reference", (record: MutablePortfolioExecutionRecord) => { record.aggregatePayload.planSnapshotReference.snapshotReference = ""; }],
    ["invalid approval reference", (record: MutablePortfolioExecutionRecord) => { record.aggregatePayload.approvalReference.approvalReference = ""; }],
    ["invalid initialization context", (record: MutablePortfolioExecutionRecord) => { record.aggregatePayload.commandContext.commandId = ""; }],
    ["unknown execution lifecycle", (record: MutablePortfolioExecutionRecord) => { record.aggregatePayload.lifecycle = "Started"; }],
    ["unknown work-item lifecycle", (record: MutablePortfolioExecutionRecord) => { record.aggregatePayload.workItems[0].lifecycle = "Waiting"; }],
    ["unknown candidate lifecycle", (record: MutablePortfolioExecutionRecord) => { record.aggregatePayload.candidates[0].lifecycle = "Promoted"; }],
    ["duplicate WorkItemId", (record: MutablePortfolioExecutionRecord) => { record.aggregatePayload.workItems[1].id = record.aggregatePayload.workItems[0].id; }],
    ["duplicate CandidateId", (record: MutablePortfolioExecutionRecord) => { record.aggregatePayload.candidates[1].id = record.aggregatePayload.candidates[0].id; }],
    ["duplicate AcceptedArtifactId", (record: MutablePortfolioExecutionRecord) => { record.aggregatePayload.acceptedArtifacts[1].id = record.aggregatePayload.acceptedArtifacts[0].id; }],
    ["missing child identity", (record: MutablePortfolioExecutionRecord) => { record.aggregatePayload.workItems[0].id = ""; }],
    ["missing work-item collection", (record: MutablePortfolioExecutionRecord) => { delete (record.aggregatePayload as { workItems?: unknown }).workItems; }],
    ["malformed child collection", (record: MutablePortfolioExecutionRecord) => { record.aggregatePayload.candidates = {} as never; }]
  ])("rejects corrupt records: %s", (_caseName, mutate) => {
    const record = mutableRecord(createExecution("execution:corrupt", PortfolioExecutionLifecycle.Active));
    mutate(record);

    const result = PortfolioExecutionRecordMapper.fromUnknownRecord(record);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(PortfolioExecutionPersistenceMappingError);
    expect(result.error).not.toHaveProperty("sqlState");
    expect(result.error).not.toHaveProperty("tableName");
    expect(result.error).not.toHaveProperty("connectionString");
  });

  it("keeps source free of database, repository adapter, transaction, and framework concerns", () => {
    const source = [
      readFileSync(join(packageRoot(), "src", "portfolio-workspace", "persistence", "PortfolioExecutionRecord.ts"), "utf8"),
      readFileSync(join(packageRoot(), "src", "portfolio-workspace", "persistence", "PortfolioExecutionRecordMapper.ts"), "utf8")
    ].join("\n").toLowerCase();

    expect(source).not.toContain("drizzle");
    expect(source).not.toContain("postgres");
    expect(source).not.toContain("node-postgres");
    expect(source).not.toContain("from \"pg\"");
    expect(source).not.toContain("sql`");
    expect(source).not.toContain("create table");
    expect(source).not.toContain("migration");
    expect(source).not.toContain("connection");
    expect(source).not.toContain("transaction");
    expect(source).not.toContain("repository implements");
    expect(source).not.toContain("beginexecution(");
    expect(source).not.toContain("activateworkitem(");
    expect(source).not.toContain("completeworkitem(");
    expect(source).not.toContain("cancelworkitem(");
    expect(source).not.toContain("acceptcandidate(");
    expect(source).not.toContain("rejectcandidate(");
    expect(source).not.toContain("completeexecution(");
    expect(source).not.toContain("cancelexecution(");
    expect(source).not.toContain("genericmapper");
    expect(source).not.toContain("mapperregistry");
  });

  it("keeps the package API and dependency direction narrow", () => {
    expect(Object.keys(publicApi).sort()).toEqual([
      "InvalidPortfolioWorkspaceRuntimeConfigurationError",
      "PORTFOLIO_EXECUTION_RECORD_VERSION",
      "PORTFOLIO_WORKSPACE_RUNTIME_ENVIRONMENT_VARIABLES",
      "PortfolioExecutionRecordMapper",
      "PortfolioWorkspaceMigrationMode",
      "PortfolioWorkspaceMigrationReadinessError",
      "PortfolioWorkspaceMigrationReadinessResult",
      "PortfolioWorkspacePostgresDatabaseRuntime",
      "PortfolioWorkspaceRuntime",
      "PortfolioWorkspaceRuntimeCompositionError",
      "PortfolioWorkspaceRuntimeConfiguration",
      "PortfolioWorkspaceRuntimeConstructionError",
      "PortfolioWorkspaceRuntimeDisposalError",
      "PortfolioWorkspaceRuntimeEnvironment",
      "PortfolioWorkspaceRuntimeLifecycle",
      "PortfolioWorkspaceRuntimeStatus",
      "PostgresPortfolioExecutionRepository",
      "createPortfolioWorkspacePostgresDatabaseRuntime",
      "createPortfolioWorkspaceRuntime",
      "verifyPortfolioWorkspaceMigrationReadiness"
    ]);

    const domainSource = readSourceTree(join(workspaceRoot(), "packages", "portfolio-workspace", "src"));
    const applicationSource = readSourceTree(join(workspaceRoot(), "packages", "portfolio-workspace-application", "src"));

    expect(domainSource).not.toContain("@career-companion/infrastructure");
    expect(applicationSource).not.toContain("@career-companion/infrastructure");
    expect(domainSource).not.toContain("PortfolioExecutionRecordMapper");
    expect(applicationSource).not.toContain("PortfolioExecutionRecordMapper");
  });
});

type MutablePortfolioExecutionRecord = {
  recordVersion?: number;
  executionId: string;
  aggregatePayload: {
    id: string;
    portfolioPlanReference: {
      planId: string;
      roadmapId: string;
      planArtifactReference: string;
    };
    planSnapshotReference: {
      snapshotReference: string;
    };
    approvalReference: {
      approvalReference: string;
    };
    commandContext: {
      commandId: string;
      correlationId: string;
      actorReference: string;
      occurredAt: string;
    };
    lifecycle: string;
    workItems: {
      id: string;
      lifecycle: string;
    }[];
    candidates: {
      id: string;
      lifecycle: string;
    }[];
    acceptedArtifacts: {
      id: string;
    }[];
  };
};

function createExecution(
  id: string,
  lifecycle: ConstructorParameters<typeof PortfolioExecution>[0]["lifecycle"]
): PortfolioExecution {
  return new PortfolioExecution({
    id: new ExecutionId(id),
    portfolioPlanReference: new PortfolioPlanReference({
      planId: `plan:${id}`,
      roadmapId: `roadmap:${id}`,
      planArtifactReference: `artifact:plan:${id}`
    }),
    planSnapshotReference: new PlanSnapshotReference({
      snapshotReference: `snapshot:${id}:v1`
    }),
    approvalReference: new ApprovalReference({
      approvalReference: `approval:${id}`
    }),
    commandContext: commandContext(`initialization:${id}`),
    lifecycle,
    workItems: [
      workItem("work-item:pending", PortfolioWorkItemLifecycle.Pending),
      workItem("work-item:active", PortfolioWorkItemLifecycle.Active),
      workItem("work-item:blocked", PortfolioWorkItemLifecycle.Blocked),
      workItem("work-item:ready", PortfolioWorkItemLifecycle.ReadyForReview),
      workItem("work-item:completed", PortfolioWorkItemLifecycle.Completed),
      workItem("work-item:cancelled", PortfolioWorkItemLifecycle.Cancelled)
    ],
    candidates: [
      candidate("candidate:registered", ArtifactCandidateLifecycle.Registered),
      candidate("candidate:accepted", ArtifactCandidateLifecycle.Accepted),
      candidate("candidate:rejected", ArtifactCandidateLifecycle.Rejected)
    ],
    acceptedArtifacts: [
      acceptedArtifact("accepted-artifact:one"),
      acceptedArtifact("accepted-artifact:two")
    ]
  });
}

function workItem(
  id: string,
  lifecycle: ConstructorParameters<typeof PortfolioWorkItem>[0]["lifecycle"]
): PortfolioWorkItem {
  return new PortfolioWorkItem({
    id: new WorkItemId(id),
    lifecycle
  });
}

function candidate(
  id: string,
  lifecycle: ConstructorParameters<typeof ArtifactCandidate>[0]["lifecycle"]
): ArtifactCandidate {
  return new ArtifactCandidate({
    id: new CandidateId(id),
    lifecycle
  });
}

function acceptedArtifact(id: string): AcceptedArtifact {
  return new AcceptedArtifact({
    id: new AcceptedArtifactId(id)
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

function mutableRecord(execution: PortfolioExecution): MutablePortfolioExecutionRecord {
  return JSON.parse(JSON.stringify(PortfolioExecutionRecordMapper.toRecord(execution))) as MutablePortfolioExecutionRecord;
}

function expectSuccess<T>(value: T | undefined): T {
  if (value === undefined) {
    throw new Error("Expected successful result value.");
  }

  return value;
}

function packageRoot(): string {
  const packageLocal = process.cwd();
  if (packageLocal.endsWith("infrastructure")) return packageLocal;
  return join(process.cwd(), "packages", "infrastructure");
}

function workspaceRoot(): string {
  const packageLocal = process.cwd();
  if (packageLocal.endsWith("infrastructure")) return join(packageLocal, "..", "..");
  return process.cwd();
}

function readSourceTree(directory: string): string {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = join(directory, entry.name);
      if (entry.isDirectory()) return readSourceTree(entryPath);
      if (!entry.name.endsWith(".ts")) return [];
      return readFileSync(entryPath, "utf8");
    })
    .join("\n");
}
