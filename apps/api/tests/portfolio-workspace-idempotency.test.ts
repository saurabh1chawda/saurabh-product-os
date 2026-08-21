import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PortfolioWorkspaceAuthorizationResourceReference } from "@career-companion/portfolio-workspace";
import {
  PORTFOLIO_WORKSPACE_PRESENTATION_VERSION,
  PortfolioWorkspaceIdempotencyContractError,
  PortfolioWorkspaceIdempotencyErrorReason,
  PortfolioWorkspaceIdempotencyFingerprint,
  PortfolioWorkspaceIdempotencyFingerprintInput,
  PortfolioWorkspaceIdempotencyKey,
  PortfolioWorkspaceIdempotencyOperation,
  PortfolioWorkspaceIdempotencyOutcome,
  PortfolioWorkspaceIdempotencyOutcomeKind,
  PortfolioWorkspaceIdempotencyRecordStatus,
  PortfolioWorkspaceIdempotencyReplayPayload,
  PortfolioWorkspaceIdempotencyScope,
  PortfolioWorkspacePresentationOutcome,
  createInitializePortfolioExecutionFingerprintInput
} from "../src";

describe("Portfolio Workspace idempotency key contract", () => {
  it("creates immutable opaque keys with deterministic serialization and equality", () => {
    const created = PortfolioWorkspaceIdempotencyKey.create("  key:client-request-1  ");
    const same = PortfolioWorkspaceIdempotencyKey.create("key:client-request-1");

    expect(created.isSuccess).toBe(true);
    expect(Object.isFrozen(created.value)).toBe(true);
    expect(created.value!.toJSON()).toBe("key:client-request-1");
    expect(created.value!.equals(same.value)).toBe(true);
    expect(JSON.stringify(created.value)).not.toContain("principal");
    expect(JSON.stringify(created.value)).not.toContain("token");
  });

  it("rejects blank, over-length, control-character, and unsafe keys through Result failures", () => {
    const invalid = [
      "",
      "   ",
      "a".repeat(129),
      "key\nline",
      "key with spaces",
      "key/with/slashes"
    ].map((value) => PortfolioWorkspaceIdempotencyKey.create(value));

    for (const result of invalid) {
      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(PortfolioWorkspaceIdempotencyContractError);
      expect(result.error?.reason).toBe(PortfolioWorkspaceIdempotencyErrorReason.InvalidIdempotencyKey);
    }
  });
});

describe("Portfolio Workspace mutation operation and scope contracts", () => {
  it("defines all nine mutation operation identifiers without Domain fact names", () => {
    expect(Object.values(PortfolioWorkspaceIdempotencyOperation)).toEqual([
      "initialize-execution",
      "begin-execution",
      "activate-work-item",
      "complete-work-item",
      "cancel-work-item",
      "accept-candidate",
      "reject-candidate",
      "complete-execution",
      "cancel-execution"
    ]);
    expect(JSON.stringify(PortfolioWorkspaceIdempotencyOperation)).not.toContain("Fact");
  });

  it("scopes idempotency by operation, authorization resource, resource identity, and key only", () => {
    const scope = idempotencyScope({
      operation: PortfolioWorkspaceIdempotencyOperation.InitializeExecution,
      authorizationResourceReference: authorizationResourceReference("owner"),
      resourceIdentity: "execution:one",
      key: "key:one"
    });
    const same = idempotencyScope({
      operation: PortfolioWorkspaceIdempotencyOperation.InitializeExecution,
      authorizationResourceReference: authorizationResourceReference("owner"),
      resourceIdentity: "execution:one",
      key: "key:one"
    });

    expect(Object.isFrozen(scope)).toBe(true);
    expect(scope.equals(same)).toBe(true);
    expect(scope.toJSON()).toEqual({
      operation: "initialize-execution",
      authorizationResourceReference: {
        authorizationResourceReference: "portfolio-workspace:principal:user:owner"
      },
      resourceIdentity: "execution:one",
      idempotencyKey: "key:one"
    });
    const serialized = JSON.stringify(scope);
    expect(serialized).not.toContain("actorReference");
    expect(serialized).not.toContain("correlationId");
    expect(serialized).not.toContain("commandId");
    expect(serialized).not.toContain("session");
    expect(serialized).not.toContain("jwt");
  });
});

describe("Portfolio Workspace idempotency fingerprint contracts", () => {
  it("calculates deterministic fingerprints for semantically identical initialization intent", () => {
    const first = initializeFingerprint({
      correlationId: "correlation:first",
      commandId: "command:first",
      occurredAt: "2026-08-11T00:00:00.000Z",
      actorReference: "actor:first"
    });
    const retry = initializeFingerprint({
      correlationId: "correlation:retry",
      commandId: "command:retry",
      occurredAt: "2026-08-11T01:00:00.000Z",
      actorReference: "actor:retry"
    });

    expect(first.equals(retry)).toBe(true);
    expect(first.toJSON()).toMatchObject({
      algorithm: "sha256"
    });
    expect(first.toJSON().value).toMatch(/^[a-f0-9]{64}$/u);
  });

  it("changes fingerprints when meaningful request identity changes", () => {
    const baseline = initializeFingerprint();
    const changedOperation = fingerprint({
      scope: idempotencyScope({ operation: PortfolioWorkspaceIdempotencyOperation.BeginExecution }),
      requestIntent: { executionId: "execution:one" }
    });
    const changedAuthorization = initializeFingerprint({
      authorizationResourceReference: authorizationResourceReference("other")
    });
    const changedExecution = initializeFingerprint({ executionId: "execution:two" });
    const changedIntent = initializeFingerprint({ approvalReference: { approvalReference: "approval:other" } });

    expect(baseline.equals(changedOperation)).toBe(false);
    expect(baseline.equals(changedAuthorization)).toBe(false);
    expect(baseline.equals(changedExecution)).toBe(false);
    expect(baseline.equals(changedIntent)).toBe(false);
  });

  it("represents work-item, candidate, and execution-level mutation intent without special cases", () => {
    const workItem = fingerprint({
      scope: idempotencyScope({ operation: PortfolioWorkspaceIdempotencyOperation.ActivateWorkItem }),
      requestIntent: { executionId: "execution:one", workItemId: "work-item:one" }
    });
    const candidate = fingerprint({
      scope: idempotencyScope({ operation: PortfolioWorkspaceIdempotencyOperation.AcceptCandidate }),
      requestIntent: {
        executionId: "execution:one",
        candidateId: "candidate:one",
        acceptedArtifactId: "accepted-artifact:one"
      }
    });
    const executionLevel = fingerprint({
      scope: idempotencyScope({ operation: PortfolioWorkspaceIdempotencyOperation.CancelExecution }),
      requestIntent: { executionId: "execution:one" }
    });

    expect(workItem.equals(candidate)).toBe(false);
    expect(candidate.equals(executionLevel)).toBe(false);
    expect(executionLevel.equals(workItem)).toBe(false);
  });

  it("rejects non-deterministic or non-JSON fingerprint input", () => {
    expect(() => new PortfolioWorkspaceIdempotencyFingerprintInput({
      scope: idempotencyScope(),
      presentationVersion: PORTFOLIO_WORKSPACE_PRESENTATION_VERSION,
      requestIntent: { executionId: undefined } as never
    })).toThrow(PortfolioWorkspaceIdempotencyContractError);
  });
});

describe("Portfolio Workspace idempotency replay and outcome contracts", () => {
  it("keeps replay payload versioned, immutable, safe, and tied to original correlation", () => {
    const payload = replayPayload();

    expect(Object.isFrozen(payload)).toBe(true);
    expect(Object.isFrozen(payload.body)).toBe(true);
    expect(payload.toJSON()).toMatchObject({
      presentationVersion: "v1",
      outcome: PortfolioWorkspacePresentationOutcome.ExecutionInitialized,
      originalCorrelationId: "correlation:original",
      status: 201
    });
    expect(JSON.stringify(payload)).not.toContain("commandContext");
    expect(JSON.stringify(payload)).not.toContain("actorReference");
    expect(JSON.stringify(payload)).not.toContain("revision");
    expect(JSON.stringify(payload)).not.toContain("SQLSTATE");
    expect(JSON.stringify(payload)).not.toContain("token");
    expect(JSON.stringify(payload)).not.toContain("principalId");
  });

  it("represents coordination outcomes without HTTP status mapping", () => {
    const replay = new PortfolioWorkspaceIdempotencyOutcome({
      kind: PortfolioWorkspaceIdempotencyOutcomeKind.ReplaySucceeded,
      replayPayload: replayPayload()
    });
    const inProgress = new PortfolioWorkspaceIdempotencyOutcome({
      kind: PortfolioWorkspaceIdempotencyOutcomeKind.InProgress
    });

    expect(Object.values(PortfolioWorkspaceIdempotencyRecordStatus)).toEqual([
      "reserved",
      "succeeded",
      "failed-released",
      "failed-final",
      "expired"
    ]);
    expect(replay.toJSON().kind).toBe("replay-succeeded");
    expect(inProgress.toJSON()).toEqual({ kind: "in-progress" });
    expect(JSON.stringify(replay)).not.toContain("statusCode");
    expect(JSON.stringify(inProgress)).not.toContain("http");
  });

  it("serializes errors safely", () => {
    const error = new PortfolioWorkspaceIdempotencyContractError(PortfolioWorkspaceIdempotencyErrorReason.FingerprintMismatch);

    expect(error.toJSON()).toEqual({
      name: "PortfolioWorkspaceIdempotencyContractError",
      code: "PORTFOLIO_WORKSPACE_IDEMPOTENCY_CONTRACT_ERROR",
      reason: "fingerprint-mismatch"
    });
    expect(JSON.stringify(error)).not.toContain("stack");
    expect(JSON.stringify(error)).not.toContain("cause");
    expect(JSON.stringify(error)).not.toContain("sql");
  });
});

describe("Portfolio Workspace idempotency architecture boundaries", () => {
  it("keeps Domain clean while Application owns semantic idempotency contracts only", () => {
    const domain = readSource(join(packageRoot(), "packages", "portfolio-workspace", "src"));
    const application = readSource(join(packageRoot(), "packages", "portfolio-workspace-application", "src"));

    expect(domain).not.toContain("Idempotency");
    expect(domain).not.toContain("idempotency");
    expect(application).toContain("PortfolioWorkspaceIdempotencyIdentity");
    expect(application).toContain("PortfolioWorkspaceIdempotencyPort");
    expect(application).not.toContain("Idempotency-Key");
    expect(application).not.toContain("HttpRequest");
    expect(application).not.toContain("statusCode");
    expect(application).not.toContain("drizzle-orm");
    expect(application).not.toContain("from \"pg\"");
    expect(application).not.toContain("Pool");
    expect(application).not.toContain("schema.ts");
    expect(application).not.toContain("TransactionManager");
    expect(application).not.toContain("UnitOfWork");
  });

  it("does not introduce storage, transactions, framework routing, process environment, or generic orchestration", () => {
    const source = readSource(join(packageRoot(), "apps", "api", "src", "portfolio-workspace", "idempotency"));

    expect(source).not.toContain("Postgres");
    expect(source).not.toContain("Drizzle");
    expect(source).not.toContain("Pool");
    expect(source).not.toContain("transaction");
    expect(source).not.toContain("process.env");
    expect(source).not.toContain("express");
    expect(source).not.toContain("fastify");
    expect(source).not.toContain("next/");
    expect(source).not.toContain("ServiceLocator");
    expect(source).not.toContain("CommandBus");
    expect(source).not.toContain("Repository");
  });
});

function initializeFingerprint(input: {
  readonly correlationId?: string;
  readonly commandId?: string;
  readonly occurredAt?: string;
  readonly actorReference?: string;
  readonly authorizationResourceReference?: PortfolioWorkspaceAuthorizationResourceReference;
  readonly executionId?: string;
  readonly approvalReference?: { readonly approvalReference: string };
} = {}): PortfolioWorkspaceIdempotencyFingerprint {
  return PortfolioWorkspaceIdempotencyFingerprint.calculate(createInitializePortfolioExecutionFingerprintInput({
    scope: idempotencyScope({
      operation: PortfolioWorkspaceIdempotencyOperation.InitializeExecution,
      authorizationResourceReference: input.authorizationResourceReference,
      resourceIdentity: input.executionId ?? "execution:one"
    }),
    presentationVersion: PORTFOLIO_WORKSPACE_PRESENTATION_VERSION,
    executionId: input.executionId ?? "execution:one",
    portfolioPlanReference: {
      planId: "plan:one",
      roadmapId: "roadmap:one",
      planArtifactReference: "artifact:one"
    },
    planSnapshotReference: {
      snapshotReference: "snapshot:one"
    },
    approvalReference: input.approvalReference ?? {
      approvalReference: "approval:one"
    },
    initialWorkItems: [{ workItemId: "work-item:one" }],
    initialCandidates: [{ candidateId: "candidate:one" }]
  }));
}

function fingerprint(input: {
  readonly scope: PortfolioWorkspaceIdempotencyScope;
  readonly requestIntent: Record<string, unknown>;
}): PortfolioWorkspaceIdempotencyFingerprint {
  return PortfolioWorkspaceIdempotencyFingerprint.calculate(new PortfolioWorkspaceIdempotencyFingerprintInput({
    scope: input.scope,
    presentationVersion: PORTFOLIO_WORKSPACE_PRESENTATION_VERSION,
    requestIntent: input.requestIntent as never
  }));
}

function idempotencyScope(input: {
  readonly operation?: typeof PortfolioWorkspaceIdempotencyOperation[keyof typeof PortfolioWorkspaceIdempotencyOperation];
  readonly authorizationResourceReference?: PortfolioWorkspaceAuthorizationResourceReference;
  readonly resourceIdentity?: string;
  readonly key?: string;
} = {}): PortfolioWorkspaceIdempotencyScope {
  const keyResult = PortfolioWorkspaceIdempotencyKey.create(input.key ?? "key:one");
  if (keyResult.isFailure || keyResult.value === undefined) {
    throw new Error("Expected idempotency key.");
  }

  return new PortfolioWorkspaceIdempotencyScope({
    operation: input.operation ?? PortfolioWorkspaceIdempotencyOperation.InitializeExecution,
    authorizationResourceReference: input.authorizationResourceReference ?? authorizationResourceReference("owner"),
    resourceIdentity: input.resourceIdentity ?? "execution:one",
    idempotencyKey: keyResult.value
  });
}

function authorizationResourceReference(suffix: string): PortfolioWorkspaceAuthorizationResourceReference {
  return new PortfolioWorkspaceAuthorizationResourceReference({
    authorizationResourceReference: `portfolio-workspace:principal:user:${suffix}`
  });
}

function replayPayload(): PortfolioWorkspaceIdempotencyReplayPayload {
  return new PortfolioWorkspaceIdempotencyReplayPayload({
    presentationVersion: PORTFOLIO_WORKSPACE_PRESENTATION_VERSION,
    outcome: PortfolioWorkspacePresentationOutcome.ExecutionInitialized,
    originalCorrelationId: "correlation:original",
    status: 201,
    body: {
      version: "v1",
      correlationId: "correlation:original",
      outcome: PortfolioWorkspacePresentationOutcome.ExecutionInitialized,
      execution: {
        executionId: "execution:one",
        lifecycle: "Initialized"
      }
    },
    headers: {
      "x-correlation-id": "correlation:original"
    }
  });
}

function readSource(directory: string): string {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) {
      return readSource(path);
    }

    return entry.endsWith(".ts") ? readFileSync(path, "utf8") : "";
  }).join("\n");
}

function packageRoot(): string {
  const cwd = process.cwd();
  if (cwd.endsWith(`${join("apps", "api")}`)) {
    return join(cwd, "..", "..");
  }

  return cwd;
}
