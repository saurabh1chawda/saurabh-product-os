import { createHash } from "node:crypto";
import type {
  NewPortfolioWorkspaceIdempotencyRow,
  PortfolioWorkspaceIdempotencyRow
} from "../postgres/schema";
import {
  failure,
  PORTFOLIO_WORKSPACE_IDEMPOTENCY_FINGERPRINT_ALGORITHM,
  PORTFOLIO_WORKSPACE_IDEMPOTENCY_RECORD_VERSION,
  PortfolioWorkspaceIdempotencyPersistenceOperation,
  PortfolioWorkspaceIdempotencyPersistenceStatus,
  PortfolioWorkspaceIdempotencyPersistenceError,
  type PortfolioWorkspaceIdempotencyCompleteSuccessInput,
  type PortfolioWorkspaceIdempotencyReplayPayloadJson,
  type PortfolioWorkspaceIdempotencyReservationInput,
  type PortfolioWorkspaceIdempotencyScopeInput,
  type JsonObject
} from "./PortfolioWorkspaceIdempotencyPersistenceContracts";
import { Result } from "@career-companion/kernel";

const HASH_ALGORITHM = "sha256";

export interface PortfolioWorkspaceIdempotencyRecord {
  readonly scopeHash: string;
  readonly recordVersion: typeof PORTFOLIO_WORKSPACE_IDEMPOTENCY_RECORD_VERSION;
  readonly operation: string;
  readonly authorizationResourceReference: string;
  readonly resourceIdentity: string;
  readonly idempotencyKeyHash: string;
  readonly requestFingerprintAlgorithm: typeof PORTFOLIO_WORKSPACE_IDEMPOTENCY_FINGERPRINT_ALGORITHM;
  readonly requestFingerprintValue: string;
  readonly status: string;
  readonly originalCorrelationId: string | null;
  readonly originalCommandId: string | null;
  readonly replayContractVersion: string | null;
  readonly replayResponsePayload: JsonObject | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly completedAt: Date | null;
  readonly expiresAt: Date;
}

export class PortfolioWorkspaceIdempotencyRecordMapper {
  static reservationToRow(input: PortfolioWorkspaceIdempotencyReservationInput): NewPortfolioWorkspaceIdempotencyRow {
    assertReservationInput(input);
    const identity = scopedIdentity(input.scope);

    return {
      scopeHash: identity.scopeHash,
      recordVersion: PORTFOLIO_WORKSPACE_IDEMPOTENCY_RECORD_VERSION,
      operation: input.scope.operation,
      authorizationResourceReference: input.scope.authorizationResourceReference,
      resourceIdentity: input.scope.resourceIdentity,
      idempotencyKeyHash: identity.idempotencyKeyHash,
      requestFingerprintAlgorithm: PORTFOLIO_WORKSPACE_IDEMPOTENCY_FINGERPRINT_ALGORITHM,
      requestFingerprintValue: input.fingerprint.value,
      status: PortfolioWorkspaceIdempotencyPersistenceStatus.Reserved,
      originalCommandId: input.originalCommandId,
      originalCorrelationId: input.originalCorrelationId,
      replayContractVersion: null,
      replayResponsePayload: null,
      createdAt: new Date(input.now),
      updatedAt: new Date(input.now),
      completedAt: null,
      expiresAt: new Date(input.expiresAt)
    };
  }

  static successUpdate(input: PortfolioWorkspaceIdempotencyCompleteSuccessInput): Pick<
    NewPortfolioWorkspaceIdempotencyRow,
    "status" | "replayContractVersion" | "replayResponsePayload" | "updatedAt" | "completedAt"
  > {
    assertFingerprint(input.fingerprint);
    assertReplayPayload(input.replayPayload);

    return {
      status: PortfolioWorkspaceIdempotencyPersistenceStatus.Succeeded,
      replayContractVersion: input.replayPayload.replayContractVersion,
      replayResponsePayload: cloneJsonObject(input.replayPayload.responsePayload),
      updatedAt: new Date(input.completedAt),
      completedAt: new Date(input.completedAt)
    };
  }

  static fromRow(
    row: PortfolioWorkspaceIdempotencyRow
  ): Result<PortfolioWorkspaceIdempotencyRecord, PortfolioWorkspaceIdempotencyPersistenceError> {
    if (row.recordVersion !== PORTFOLIO_WORKSPACE_IDEMPOTENCY_RECORD_VERSION) {
      return failure("unsupported-record-version");
    }
    if (!isHexHash(row.scopeHash) || !isHexHash(row.idempotencyKeyHash) || !isHexHash(row.requestFingerprintValue)) {
      return failure("invalid-record");
    }
    if (row.requestFingerprintAlgorithm !== PORTFOLIO_WORKSPACE_IDEMPOTENCY_FINGERPRINT_ALGORITHM) {
      return failure("invalid-record");
    }
    if (!Object.values(PortfolioWorkspaceIdempotencyPersistenceOperation).includes(row.operation as never)) {
      return failure("invalid-record");
    }
    if (!Object.values(PortfolioWorkspaceIdempotencyPersistenceStatus).includes(row.status as never)) {
      return failure("invalid-record");
    }
    if (!isSafeText(row.authorizationResourceReference) || !isSafeText(row.resourceIdentity)) {
      return failure("invalid-record");
    }
    if (!(row.createdAt instanceof Date) || !(row.updatedAt instanceof Date) || !(row.expiresAt instanceof Date)) {
      return failure("invalid-record");
    }
    if (
      row.status === PortfolioWorkspaceIdempotencyPersistenceStatus.Succeeded
      && (
        !isSafeText(row.originalCorrelationId)
        || !isSafeText(row.originalCommandId)
        || !isSafeText(row.replayContractVersion)
        || !isJsonObject(row.replayResponsePayload)
        || !(row.completedAt instanceof Date)
      )
    ) {
      return failure("invalid-record");
    }

    return Result.success(Object.freeze({
      scopeHash: row.scopeHash,
      recordVersion: PORTFOLIO_WORKSPACE_IDEMPOTENCY_RECORD_VERSION,
      operation: row.operation,
      authorizationResourceReference: row.authorizationResourceReference,
      resourceIdentity: row.resourceIdentity,
      idempotencyKeyHash: row.idempotencyKeyHash,
      requestFingerprintAlgorithm: PORTFOLIO_WORKSPACE_IDEMPOTENCY_FINGERPRINT_ALGORITHM,
      requestFingerprintValue: row.requestFingerprintValue,
      status: row.status,
      originalCorrelationId: row.originalCorrelationId,
      originalCommandId: row.originalCommandId,
      replayContractVersion: row.replayContractVersion,
      replayResponsePayload: row.replayResponsePayload === null ? null : cloneJsonObject(row.replayResponsePayload),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      completedAt: row.completedAt === null ? null : new Date(row.completedAt),
      expiresAt: new Date(row.expiresAt)
    }));
  }

  static scopeHash(scope: PortfolioWorkspaceIdempotencyScopeInput): string {
    return scopedIdentity(scope).scopeHash;
  }
}

function scopedIdentity(scope: PortfolioWorkspaceIdempotencyScopeInput): {
  readonly scopeHash: string;
  readonly idempotencyKeyHash: string;
} {
  assertScope(scope);
  const idempotencyKeyHash = scope.idempotencyKeyHash;
  return {
    idempotencyKeyHash,
    scopeHash: digest(JSON.stringify({
      operation: scope.operation,
      authorizationResourceReference: scope.authorizationResourceReference,
      resourceIdentity: scope.resourceIdentity,
      idempotencyKeyHash
    }))
  };
}

function assertReservationInput(input: PortfolioWorkspaceIdempotencyReservationInput): void {
  assertScope(input.scope);
  assertFingerprint(input.fingerprint);
  if (!isSafeText(input.originalCommandId) || !isSafeText(input.originalCorrelationId)) {
    throw new PortfolioWorkspaceIdempotencyPersistenceError("invalid-record");
  }
  if (!(input.now instanceof Date) || Number.isNaN(input.now.getTime())) {
    throw new PortfolioWorkspaceIdempotencyPersistenceError("invalid-record");
  }
  if (!(input.expiresAt instanceof Date) || Number.isNaN(input.expiresAt.getTime()) || input.expiresAt <= input.now) {
    throw new PortfolioWorkspaceIdempotencyPersistenceError("invalid-record");
  }
}

function assertScope(scope: PortfolioWorkspaceIdempotencyScopeInput): void {
  if (!Object.values(PortfolioWorkspaceIdempotencyPersistenceOperation).includes(scope.operation)) {
    throw new PortfolioWorkspaceIdempotencyPersistenceError("invalid-record");
  }
  if (!isSafeText(scope.authorizationResourceReference) || !isSafeText(scope.resourceIdentity) || !isHexHash(scope.idempotencyKeyHash)) {
    throw new PortfolioWorkspaceIdempotencyPersistenceError("invalid-record");
  }
}

function assertFingerprint(
  fingerprint: PortfolioWorkspaceIdempotencyReservationInput["fingerprint"]
): void {
  if (
    (fingerprint.algorithm ?? PORTFOLIO_WORKSPACE_IDEMPOTENCY_FINGERPRINT_ALGORITHM) !== PORTFOLIO_WORKSPACE_IDEMPOTENCY_FINGERPRINT_ALGORITHM
    || !isHexHash(fingerprint.value)
  ) {
    throw new PortfolioWorkspaceIdempotencyPersistenceError("invalid-record");
  }
}

function assertReplayPayload(payload: PortfolioWorkspaceIdempotencyReplayPayloadJson): void {
  if (
    !isSafeText(payload.replayContractVersion)
    || !isJsonObject(payload.responsePayload)
  ) {
    throw new PortfolioWorkspaceIdempotencyPersistenceError("invalid-record");
  }
}

function isSafeText(value: unknown): value is string {
  return typeof value === "string"
    && value.trim() === value
    && value.length > 0
    && value.length <= 256
    && !/[\u0000-\u001f\u007f]/u.test(value);
}

function isHexHash(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/u.test(value);
}

function isJsonObject(value: unknown): value is JsonObject {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.getPrototypeOf(value) === Object.prototype;
}

function cloneJsonObject(value: JsonObject): JsonObject {
  return JSON.parse(JSON.stringify(value)) as JsonObject;
}

function digest(value: string): string {
  return createHash(HASH_ALGORITHM).update(value, "utf8").digest("hex");
}
