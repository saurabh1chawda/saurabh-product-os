import { Result } from "@career-companion/kernel";

const INSPECT_SYMBOL = Symbol.for("nodejs.util.inspect.custom");

export const PORTFOLIO_WORKSPACE_IDEMPOTENCY_RECORD_VERSION = 1;
export const PORTFOLIO_WORKSPACE_IDEMPOTENCY_FINGERPRINT_ALGORITHM = "sha256";

export const PortfolioWorkspaceIdempotencyPersistenceOperation = Object.freeze({
  InitializeExecution: "initialize-execution",
  BeginExecution: "begin-execution",
  ActivateWorkItem: "activate-work-item",
  CompleteWorkItem: "complete-work-item",
  CancelWorkItem: "cancel-work-item",
  AcceptCandidate: "accept-candidate",
  RejectCandidate: "reject-candidate",
  CompleteExecution: "complete-execution",
  CancelExecution: "cancel-execution"
} as const);

export type PortfolioWorkspaceIdempotencyPersistenceOperationValue =
  typeof PortfolioWorkspaceIdempotencyPersistenceOperation[keyof typeof PortfolioWorkspaceIdempotencyPersistenceOperation];

export const PortfolioWorkspaceIdempotencyPersistenceStatus = Object.freeze({
  Reserved: "reserved",
  Succeeded: "succeeded"
} as const);

export type PortfolioWorkspaceIdempotencyPersistenceStatusValue =
  typeof PortfolioWorkspaceIdempotencyPersistenceStatus[keyof typeof PortfolioWorkspaceIdempotencyPersistenceStatus];

export const PortfolioWorkspaceIdempotencyReservationKind = Object.freeze({
  FirstExecutionReserved: "first-execution-reserved",
  ReplaySucceeded: "replay-succeeded",
  ConflictFingerprintMismatch: "conflict-fingerprint-mismatch",
  InProgress: "in-progress"
} as const);

export type PortfolioWorkspaceIdempotencyReservationKindValue =
  typeof PortfolioWorkspaceIdempotencyReservationKind[keyof typeof PortfolioWorkspaceIdempotencyReservationKind];

export type PortfolioWorkspaceIdempotencyPersistenceFailureReason =
  | "invalid-record"
  | "unsupported-record-version"
  | "storage-unavailable"
  | "state-transition-conflict";

export class PortfolioWorkspaceIdempotencyPersistenceError extends Error {
  readonly code = "PORTFOLIO_WORKSPACE_IDEMPOTENCY_PERSISTENCE_ERROR";
  readonly reason: PortfolioWorkspaceIdempotencyPersistenceFailureReason;

  constructor(reason: PortfolioWorkspaceIdempotencyPersistenceFailureReason) {
    super("Portfolio Workspace idempotency persistence failed.");
    this.name = "PortfolioWorkspaceIdempotencyPersistenceError";
    this.reason = reason;
    Object.freeze(this);
  }

  toJSON(): PortfolioWorkspaceIdempotencyPersistenceErrorJson {
    return {
      name: "PortfolioWorkspaceIdempotencyPersistenceError",
      code: this.code,
      reason: this.reason
    };
  }

  [INSPECT_SYMBOL](): PortfolioWorkspaceIdempotencyPersistenceErrorJson {
    return this.toJSON();
  }
}

export interface PortfolioWorkspaceIdempotencyPersistenceErrorJson {
  readonly name: "PortfolioWorkspaceIdempotencyPersistenceError";
  readonly code: "PORTFOLIO_WORKSPACE_IDEMPOTENCY_PERSISTENCE_ERROR";
  readonly reason: PortfolioWorkspaceIdempotencyPersistenceFailureReason;
}

export interface PortfolioWorkspaceIdempotencyScopeInput {
  readonly operation: PortfolioWorkspaceIdempotencyPersistenceOperationValue;
  readonly authorizationResourceReference: string;
  readonly resourceIdentity: string;
  readonly idempotencyKeyHash: string;
}

export interface PortfolioWorkspaceIdempotencyFingerprintInput {
  readonly algorithm?: typeof PORTFOLIO_WORKSPACE_IDEMPOTENCY_FINGERPRINT_ALGORITHM;
  readonly value: string;
}

export interface PortfolioWorkspaceIdempotencyReplayPayloadJson {
  readonly replayContractVersion: string;
  readonly responsePayload: JsonObject;
}

export interface PortfolioWorkspaceIdempotencyReservationInput {
  readonly scope: PortfolioWorkspaceIdempotencyScopeInput;
  readonly fingerprint: PortfolioWorkspaceIdempotencyFingerprintInput;
  readonly originalCommandId: string;
  readonly originalCorrelationId: string;
  readonly now: Date;
  readonly expiresAt: Date;
}

export interface PortfolioWorkspaceIdempotencyCompleteSuccessInput {
  readonly scope: PortfolioWorkspaceIdempotencyScopeInput;
  readonly fingerprint: PortfolioWorkspaceIdempotencyFingerprintInput;
  readonly replayPayload: PortfolioWorkspaceIdempotencyReplayPayloadJson;
  readonly completedAt: Date;
}

export interface PortfolioWorkspaceIdempotencyReleaseInput {
  readonly scope: PortfolioWorkspaceIdempotencyScopeInput;
  readonly fingerprint: PortfolioWorkspaceIdempotencyFingerprintInput;
}

export class PortfolioWorkspaceIdempotencyReservationResult {
  readonly kind: PortfolioWorkspaceIdempotencyReservationKindValue;
  readonly replayPayload: PortfolioWorkspaceIdempotencyReplayPayloadJson | undefined;

  constructor(input: {
    readonly kind: PortfolioWorkspaceIdempotencyReservationKindValue;
    readonly replayPayload?: PortfolioWorkspaceIdempotencyReplayPayloadJson;
  }) {
    this.kind = input.kind;
    this.replayPayload = input.replayPayload === undefined ? undefined : deepFreezeReplayPayload(input.replayPayload);
    Object.freeze(this);
  }

  toJSON(): PortfolioWorkspaceIdempotencyReservationResultJson {
    return {
      kind: this.kind,
      ...(this.replayPayload === undefined ? {} : { replayPayload: this.replayPayload })
    };
  }
}

export interface PortfolioWorkspaceIdempotencyReservationResultJson {
  readonly kind: PortfolioWorkspaceIdempotencyReservationKindValue;
  readonly replayPayload?: PortfolioWorkspaceIdempotencyReplayPayloadJson;
}

export class PortfolioWorkspaceIdempotencyCompletionResult {
  readonly completed = true;

  constructor() {
    Object.freeze(this);
  }

  toJSON(): { readonly completed: true } {
    return { completed: true };
  }
}

export class PortfolioWorkspaceIdempotencyReleaseResult {
  readonly released = true;

  constructor() {
    Object.freeze(this);
  }

  toJSON(): { readonly released: true } {
    return { released: true };
  }
}

export interface PortfolioWorkspaceIdempotencyStore {
  reserve(input: PortfolioWorkspaceIdempotencyReservationInput): Promise<Result<PortfolioWorkspaceIdempotencyReservationResult, PortfolioWorkspaceIdempotencyPersistenceError>>;
  completeSuccess(input: PortfolioWorkspaceIdempotencyCompleteSuccessInput): Promise<Result<PortfolioWorkspaceIdempotencyCompletionResult, PortfolioWorkspaceIdempotencyPersistenceError>>;
  release(input: PortfolioWorkspaceIdempotencyReleaseInput): Promise<Result<PortfolioWorkspaceIdempotencyReleaseResult, PortfolioWorkspaceIdempotencyPersistenceError>>;
}

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export interface JsonObject {
  readonly [key: string]: JsonValue;
}
export type JsonArray = readonly JsonValue[];

export function success<T>(value: T): Result<T, PortfolioWorkspaceIdempotencyPersistenceError> {
  return Result.success(value);
}

export function failure<T>(
  reason: PortfolioWorkspaceIdempotencyPersistenceFailureReason
): Result<T, PortfolioWorkspaceIdempotencyPersistenceError> {
  return Result.failure(new PortfolioWorkspaceIdempotencyPersistenceError(reason));
}

function cloneJson<T extends JsonValue>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function deepFreezeReplayPayload(
  payload: PortfolioWorkspaceIdempotencyReplayPayloadJson
): PortfolioWorkspaceIdempotencyReplayPayloadJson {
  return Object.freeze({
    replayContractVersion: payload.replayContractVersion,
    responsePayload: deepFreezeJson(cloneJson(payload.responsePayload))
  });
}

function deepFreezeJson<T extends JsonValue>(value: T): T {
  if (Array.isArray(value)) {
    return Object.freeze(value.map((entry) => deepFreezeJson(entry))) as T;
  }

  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value).map(([key, entry]) => [key, deepFreezeJson(entry)] as const);
    return Object.freeze(Object.fromEntries(entries)) as T;
  }

  return value;
}
