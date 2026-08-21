import { describe, expect, it } from "vitest";
import { PortfolioWorkspaceAuthorizationResourceReference } from "@career-companion/portfolio-workspace";
import {
  PORTFOLIO_WORKSPACE_IDEMPOTENCY_OPERATIONS,
  PortfolioWorkspaceIdempotencyCommandBinding,
  PortfolioWorkspaceIdempotencyCompletionResult,
  PortfolioWorkspaceIdempotencyContractError,
  PortfolioWorkspaceIdempotencyContractErrorReason,
  PortfolioWorkspaceIdempotencyCorruptRecordError,
  PortfolioWorkspaceIdempotencyDurableState,
  PortfolioWorkspaceIdempotencyExpiryMetadata,
  PortfolioWorkspaceIdempotencyIdentity,
  PortfolioWorkspaceIdempotencyKeyHash,
  PortfolioWorkspaceIdempotencyObservationKind,
  PortfolioWorkspaceIdempotencyOperation,
  PortfolioWorkspaceIdempotencyOrchestrationContractError,
  PortfolioWorkspaceIdempotencyPersistenceUnavailableError,
  PortfolioWorkspaceIdempotencyReplayPayload,
  PortfolioWorkspaceIdempotencyRequestFingerprint,
  PortfolioWorkspaceIdempotencyReservationObservation,
  PortfolioWorkspaceIdempotencyStateTransitionError,
  UnsupportedPortfolioWorkspaceIdempotencyRecordVersionError
} from "../../src";

const HASH = "a".repeat(64);
const OTHER_HASH = "b".repeat(64);

describe("portfolio workspace idempotency application contracts", () => {
  it("defines exactly the nine mutation operations and excludes queries", () => {
    expect(PORTFOLIO_WORKSPACE_IDEMPOTENCY_OPERATIONS).toEqual([
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
    expect(PORTFOLIO_WORKSPACE_IDEMPOTENCY_OPERATIONS).not.toContain("get-portfolio-execution");
    expect(PortfolioWorkspaceIdempotencyOperation.InitializeExecution).toBe("initialize-execution");
  });

  it("represents identity using authorization resource, operation, resource identity, and key hash only", () => {
    const identity = new PortfolioWorkspaceIdempotencyIdentity({
      authorizationResourceReference: authorizationResource(),
      operation: PortfolioWorkspaceIdempotencyOperation.InitializeExecution,
      resourceIdentity: "execution:execution-123",
      keyHash: new PortfolioWorkspaceIdempotencyKeyHash({ value: HASH })
    });

    expect(Object.isFrozen(identity)).toBe(true);
    expect(identity.toJSON()).toEqual({
      authorizationResourceReference: {
        authorizationResourceReference: "portfolio-workspace/principal/user-123"
      },
      operation: "initialize-execution",
      resourceIdentity: "execution:execution-123",
      keyHash: {
        algorithm: "sha256",
        value: HASH
      }
    });
    expect(JSON.stringify(identity.toJSON())).not.toContain("raw-key");
    expect(identity.equals(new PortfolioWorkspaceIdempotencyIdentity({
      authorizationResourceReference: authorizationResource(),
      operation: PortfolioWorkspaceIdempotencyOperation.InitializeExecution,
      resourceIdentity: "execution:execution-123",
      keyHash: new PortfolioWorkspaceIdempotencyKeyHash({ value: HASH })
    }))).toBe(true);
  });

  it("rejects raw or malformed key material at the application boundary", () => {
    expect(() => new PortfolioWorkspaceIdempotencyKeyHash({ value: "raw-client-key" }))
      .toThrow(PortfolioWorkspaceIdempotencyContractError);
    expect(() => new PortfolioWorkspaceIdempotencyKeyHash({ algorithm: "sha1" as never, value: HASH }))
      .toThrow(PortfolioWorkspaceIdempotencyContractError);
  });

  it("represents request fingerprint as an opaque algorithm-tagged hash", () => {
    const fingerprint = new PortfolioWorkspaceIdempotencyRequestFingerprint({ value: OTHER_HASH });

    expect(Object.isFrozen(fingerprint)).toBe(true);
    expect(fingerprint.toJSON()).toEqual({
      algorithm: "sha256",
      value: OTHER_HASH
    });
    expect(fingerprint.equals(new PortfolioWorkspaceIdempotencyRequestFingerprint({ value: OTHER_HASH }))).toBe(true);
  });

  it("defines the minimal durable state vocabulary", () => {
    expect(PortfolioWorkspaceIdempotencyDurableState).toEqual({
      Reserved: "reserved",
      Completed: "completed"
    });
  });

  it("stores replay as a versioned safe payload without status or domain objects", () => {
    const payload = new PortfolioWorkspaceIdempotencyReplayPayload({
      replayContractVersion: "portfolio-workspace-initialize-response:v1",
      responsePayload: {
        outcome: "execution-initialized",
        correlationId: "correlation-123",
        execution: {
          executionId: "execution-123"
        }
      }
    });

    expect(Object.isFrozen(payload)).toBe(true);
    expect(payload.toJSON().responsePayload).toEqual({
      outcome: "execution-initialized",
      correlationId: "correlation-123",
      execution: {
        executionId: "execution-123"
      }
    });
    expect(JSON.stringify(payload.toJSON()).toLowerCase()).not.toContain("portfolioexecution");
    expect(JSON.stringify(payload.toJSON()).toLowerCase()).not.toContain("repository");
    expect(JSON.stringify(payload.toJSON()).toLowerCase()).not.toContain("commandcontext");
  });

  it("makes reserve and observe outcomes explicit", () => {
    const replayPayload = new PortfolioWorkspaceIdempotencyReplayPayload({
      replayContractVersion: "portfolio-workspace-response:v1",
      responsePayload: { outcome: "execution-initialized" }
    });

    expect(new PortfolioWorkspaceIdempotencyReservationObservation({
      kind: PortfolioWorkspaceIdempotencyObservationKind.AcquiredForFirstExecution
    }).toJSON()).toEqual({ kind: "acquired-for-first-execution" });
    expect(new PortfolioWorkspaceIdempotencyReservationObservation({
      kind: PortfolioWorkspaceIdempotencyObservationKind.InProgress
    }).toJSON()).toEqual({ kind: "in-progress" });
    expect(new PortfolioWorkspaceIdempotencyReservationObservation({
      kind: PortfolioWorkspaceIdempotencyObservationKind.FingerprintMismatch
    }).toJSON()).toEqual({ kind: "fingerprint-mismatch" });
    expect(new PortfolioWorkspaceIdempotencyReservationObservation({
      kind: PortfolioWorkspaceIdempotencyObservationKind.ReplayAvailable,
      replayPayload
    }).toJSON()).toEqual({
      kind: "replay-available",
      replayPayload: replayPayload.toJSON()
    });
    expect(() => new PortfolioWorkspaceIdempotencyReservationObservation({
      kind: PortfolioWorkspaceIdempotencyObservationKind.ReplayAvailable
    })).toThrow(PortfolioWorkspaceIdempotencyContractError);
  });

  it("defines safe errors without vendor metadata", () => {
    expect(new PortfolioWorkspaceIdempotencyPersistenceUnavailableError().toJSON()).toEqual({
      name: "PortfolioWorkspaceIdempotencyPersistenceUnavailableError",
      code: "PORTFOLIO_WORKSPACE_IDEMPOTENCY_PERSISTENCE_UNAVAILABLE"
    });
    expect(new PortfolioWorkspaceIdempotencyCorruptRecordError().toJSON().code).toBe("PORTFOLIO_WORKSPACE_IDEMPOTENCY_CORRUPT_RECORD");
    expect(new UnsupportedPortfolioWorkspaceIdempotencyRecordVersionError(99).toJSON()).toEqual({
      name: "UnsupportedPortfolioWorkspaceIdempotencyRecordVersionError",
      code: "UNSUPPORTED_PORTFOLIO_WORKSPACE_IDEMPOTENCY_RECORD_VERSION",
      recordVersion: 99
    });
    expect(new PortfolioWorkspaceIdempotencyStateTransitionError().toJSON().code).toBe("PORTFOLIO_WORKSPACE_IDEMPOTENCY_STATE_TRANSITION_CONFLICT");
    expect(new PortfolioWorkspaceIdempotencyOrchestrationContractError().toJSON().code).toBe("PORTFOLIO_WORKSPACE_IDEMPOTENCY_ORCHESTRATION_CONTRACT_ERROR");
    expect(new PortfolioWorkspaceIdempotencyContractError(PortfolioWorkspaceIdempotencyContractErrorReason.InvalidIdentity).toJSON()).toEqual({
      name: "PortfolioWorkspaceIdempotencyContractError",
      code: "PORTFOLIO_WORKSPACE_IDEMPOTENCY_CONTRACT_ERROR",
      reason: "invalid-idempotency-identity"
    });
  });

  it("binds original trusted command and correlation without accepting whole command context", () => {
    const binding = new PortfolioWorkspaceIdempotencyCommandBinding({
      originalCommandId: "command-123",
      originalCorrelationId: "correlation-123"
    });

    expect(binding.toJSON()).toEqual({
      originalCommandId: "command-123",
      originalCorrelationId: "correlation-123"
    });
    expect(JSON.stringify(binding.toJSON())).not.toContain("actorReference");
    expect(JSON.stringify(binding.toJSON())).not.toContain("occurredAt");
  });

  it("captures expiry metadata without cleanup behavior", () => {
    const expiry = new PortfolioWorkspaceIdempotencyExpiryMetadata({
      createdAt: "2026-08-15T00:00:00.000Z",
      completedAt: "2026-08-15T00:00:01.000Z",
      expiresAt: "2026-08-16T00:00:00.000Z"
    });

    expect(expiry.toJSON()).toEqual({
      createdAt: "2026-08-15T00:00:00.000Z",
      completedAt: "2026-08-15T00:00:01.000Z",
      expiresAt: "2026-08-16T00:00:00.000Z"
    });
    expect(() => new PortfolioWorkspaceIdempotencyExpiryMetadata({
      createdAt: "2026-08-15T00:00:00.000Z",
      expiresAt: "2026-08-14T00:00:00.000Z"
    })).toThrow(PortfolioWorkspaceIdempotencyContractError);
  });

  it("defines completion as an explicit immutable result", () => {
    expect(Object.isFrozen(new PortfolioWorkspaceIdempotencyCompletionResult())).toBe(true);
    expect(new PortfolioWorkspaceIdempotencyCompletionResult().toJSON()).toEqual({ completed: true });
  });
});

function authorizationResource(): PortfolioWorkspaceAuthorizationResourceReference {
  return new PortfolioWorkspaceAuthorizationResourceReference({
    authorizationResourceReference: "portfolio-workspace/principal/user-123"
  });
}
