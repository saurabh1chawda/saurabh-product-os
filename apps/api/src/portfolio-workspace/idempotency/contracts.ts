import { createHash } from "node:crypto";
import { Result } from "@career-companion/kernel";
import { PortfolioWorkspaceAuthorizationResourceReference } from "@career-companion/portfolio-workspace";
import type { PortfolioWorkspacePresentationOutcomeValue } from "../presentation";
import type { PortfolioWorkspacePresentationVersion } from "../presentation/version";

const INSPECT_SYMBOL = Symbol.for("nodejs.util.inspect.custom");
const MAX_IDEMPOTENCY_KEY_LENGTH = 128;
const MAX_RESOURCE_IDENTITY_LENGTH = 256;
const SAFE_IDEMPOTENCY_TOKEN_PATTERN = /^[A-Za-z0-9._:-]+$/u;
const FINGERPRINT_ALGORITHM = "sha256";
const FINGERPRINT_ENCODING = "utf8";

export const PortfolioWorkspaceIdempotencyOperation = Object.freeze({
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

export type PortfolioWorkspaceIdempotencyOperationValue =
  typeof PortfolioWorkspaceIdempotencyOperation[keyof typeof PortfolioWorkspaceIdempotencyOperation];

export const PortfolioWorkspaceIdempotencyRecordStatus = Object.freeze({
  Reserved: "reserved",
  Succeeded: "succeeded",
  FailedReleased: "failed-released",
  FailedFinal: "failed-final",
  Expired: "expired"
} as const);

export type PortfolioWorkspaceIdempotencyRecordStatusValue =
  typeof PortfolioWorkspaceIdempotencyRecordStatus[keyof typeof PortfolioWorkspaceIdempotencyRecordStatus];

export const PortfolioWorkspaceIdempotencyOutcomeKind = Object.freeze({
  FirstExecutionReserved: "first-execution-reserved",
  ReplaySucceeded: "replay-succeeded",
  ConflictFingerprintMismatch: "conflict-fingerprint-mismatch",
  InProgress: "in-progress",
  StorageUnavailable: "storage-unavailable",
  ReleasedAfterFailure: "released-after-failure",
  ExpiredNewReservation: "expired-new-reservation"
} as const);

export type PortfolioWorkspaceIdempotencyOutcomeKindValue =
  typeof PortfolioWorkspaceIdempotencyOutcomeKind[keyof typeof PortfolioWorkspaceIdempotencyOutcomeKind];

export const PortfolioWorkspaceIdempotencyErrorReason = Object.freeze({
  InvalidIdempotencyKey: "invalid-idempotency-key",
  InvalidIdempotencyScope: "invalid-idempotency-scope",
  InvalidFingerprintInput: "invalid-fingerprint-input",
  FingerprintMismatch: "fingerprint-mismatch",
  IdempotencyInProgress: "idempotency-in-progress",
  ReplayPayloadInvalid: "replay-payload-invalid",
  StorageUnavailable: "storage-unavailable",
  InternalContractFailure: "internal-idempotency-contract-failure"
} as const);

export type PortfolioWorkspaceIdempotencyErrorReasonValue =
  typeof PortfolioWorkspaceIdempotencyErrorReason[keyof typeof PortfolioWorkspaceIdempotencyErrorReason];

export class PortfolioWorkspaceIdempotencyContractError extends Error {
  readonly code = "PORTFOLIO_WORKSPACE_IDEMPOTENCY_CONTRACT_ERROR";
  readonly reason: PortfolioWorkspaceIdempotencyErrorReasonValue;

  constructor(reason: PortfolioWorkspaceIdempotencyErrorReasonValue) {
    super("Portfolio Workspace idempotency contract error.");
    this.name = "PortfolioWorkspaceIdempotencyContractError";
    this.reason = reason;
    Object.freeze(this);
  }

  toJSON(): PortfolioWorkspaceIdempotencyContractErrorJson {
    return {
      name: "PortfolioWorkspaceIdempotencyContractError",
      code: this.code,
      reason: this.reason
    };
  }

  [INSPECT_SYMBOL](): PortfolioWorkspaceIdempotencyContractErrorJson {
    return this.toJSON();
  }
}

export interface PortfolioWorkspaceIdempotencyContractErrorJson {
  readonly name: "PortfolioWorkspaceIdempotencyContractError";
  readonly code: "PORTFOLIO_WORKSPACE_IDEMPOTENCY_CONTRACT_ERROR";
  readonly reason: PortfolioWorkspaceIdempotencyErrorReasonValue;
}

export class PortfolioWorkspaceIdempotencyKey {
  private readonly __portfolioWorkspaceIdempotencyKeyBrand!: never;

  readonly value: string;

  private constructor(value: string) {
    this.value = value;
    Object.freeze(this);
  }

  static create(value: string): Result<PortfolioWorkspaceIdempotencyKey, PortfolioWorkspaceIdempotencyContractError> {
    if (typeof value !== "string") {
      return invalid(PortfolioWorkspaceIdempotencyErrorReason.InvalidIdempotencyKey);
    }

    const normalized = value.trim();
    if (
      normalized.length === 0
      || normalized.length > MAX_IDEMPOTENCY_KEY_LENGTH
      || !SAFE_IDEMPOTENCY_TOKEN_PATTERN.test(normalized)
    ) {
      return invalid(PortfolioWorkspaceIdempotencyErrorReason.InvalidIdempotencyKey);
    }

    return Result.success(new PortfolioWorkspaceIdempotencyKey(normalized));
  }

  equals(other: PortfolioWorkspaceIdempotencyKey | undefined): boolean {
    return other instanceof PortfolioWorkspaceIdempotencyKey
      && this.value === other.value;
  }

  toJSON(): string {
    return this.value;
  }
}

export class PortfolioWorkspaceIdempotencyScope {
  private readonly __portfolioWorkspaceIdempotencyScopeBrand!: never;

  readonly operation: PortfolioWorkspaceIdempotencyOperationValue;
  readonly authorizationResourceReference: PortfolioWorkspaceAuthorizationResourceReference;
  readonly resourceIdentity: string;
  readonly idempotencyKey: PortfolioWorkspaceIdempotencyKey;

  constructor(input: {
    readonly operation: PortfolioWorkspaceIdempotencyOperationValue;
    readonly authorizationResourceReference: PortfolioWorkspaceAuthorizationResourceReference;
    readonly resourceIdentity: string;
    readonly idempotencyKey: PortfolioWorkspaceIdempotencyKey;
  }) {
    assertOperation(input.operation, PortfolioWorkspaceIdempotencyErrorReason.InvalidIdempotencyScope);
    assertAuthorizationResourceReference(input.authorizationResourceReference, PortfolioWorkspaceIdempotencyErrorReason.InvalidIdempotencyScope);
    assertSafeResourceIdentity(input.resourceIdentity, PortfolioWorkspaceIdempotencyErrorReason.InvalidIdempotencyScope);
    if (!(input.idempotencyKey instanceof PortfolioWorkspaceIdempotencyKey)) {
      throw new PortfolioWorkspaceIdempotencyContractError(PortfolioWorkspaceIdempotencyErrorReason.InvalidIdempotencyScope);
    }

    this.operation = input.operation;
    this.authorizationResourceReference = input.authorizationResourceReference;
    this.resourceIdentity = input.resourceIdentity;
    this.idempotencyKey = input.idempotencyKey;
    Object.freeze(this);
  }

  equals(other: PortfolioWorkspaceIdempotencyScope | undefined): boolean {
    return other instanceof PortfolioWorkspaceIdempotencyScope
      && this.operation === other.operation
      && this.authorizationResourceReference.equals(other.authorizationResourceReference)
      && this.resourceIdentity === other.resourceIdentity
      && this.idempotencyKey.equals(other.idempotencyKey);
  }

  toJSON(): PortfolioWorkspaceIdempotencyScopeJson {
    return {
      operation: this.operation,
      authorizationResourceReference: this.authorizationResourceReference.toJSON(),
      resourceIdentity: this.resourceIdentity,
      idempotencyKey: this.idempotencyKey.toJSON()
    };
  }
}

export interface PortfolioWorkspaceIdempotencyScopeJson {
  readonly operation: PortfolioWorkspaceIdempotencyOperationValue;
  readonly authorizationResourceReference: ReturnType<PortfolioWorkspaceAuthorizationResourceReference["toJSON"]>;
  readonly resourceIdentity: string;
  readonly idempotencyKey: string;
}

export class PortfolioWorkspaceIdempotencyFingerprintInput {
  private readonly __portfolioWorkspaceIdempotencyFingerprintInputBrand!: never;

  readonly scope: PortfolioWorkspaceIdempotencyScope;
  readonly presentationVersion: PortfolioWorkspacePresentationVersion;
  readonly requestIntent: JsonValue;

  constructor(input: {
    readonly scope: PortfolioWorkspaceIdempotencyScope;
    readonly presentationVersion: PortfolioWorkspacePresentationVersion;
    readonly requestIntent: JsonValue;
  }) {
    assertInstance(input.scope, PortfolioWorkspaceIdempotencyScope, PortfolioWorkspaceIdempotencyErrorReason.InvalidFingerprintInput);
    assertSafeResourceIdentity(input.presentationVersion, PortfolioWorkspaceIdempotencyErrorReason.InvalidFingerprintInput);
    if (!isJsonValue(input.requestIntent)) {
      throw new PortfolioWorkspaceIdempotencyContractError(PortfolioWorkspaceIdempotencyErrorReason.InvalidFingerprintInput);
    }

    this.scope = input.scope;
    this.presentationVersion = input.presentationVersion;
    this.requestIntent = deepFreezeJson(input.requestIntent);
    Object.freeze(this);
  }

  equals(other: PortfolioWorkspaceIdempotencyFingerprintInput | undefined): boolean {
    return other instanceof PortfolioWorkspaceIdempotencyFingerprintInput
      && canonicalize(this.toJSON()) === canonicalize(other.toJSON());
  }

  toJSON(): PortfolioWorkspaceIdempotencyFingerprintInputJson {
    return {
      scope: this.scope.toJSON(),
      presentationVersion: this.presentationVersion,
      requestIntent: this.requestIntent
    };
  }
}

export interface PortfolioWorkspaceIdempotencyFingerprintInputJson {
  readonly scope: PortfolioWorkspaceIdempotencyScopeJson;
  readonly presentationVersion: PortfolioWorkspacePresentationVersion;
  readonly requestIntent: JsonValue;
}

export class PortfolioWorkspaceIdempotencyFingerprint {
  private readonly __portfolioWorkspaceIdempotencyFingerprintBrand!: never;

  readonly algorithm: typeof FINGERPRINT_ALGORITHM;
  readonly value: string;

  constructor(input: {
    readonly algorithm?: typeof FINGERPRINT_ALGORITHM;
    readonly value: string;
  }) {
    if ((input.algorithm ?? FINGERPRINT_ALGORITHM) !== FINGERPRINT_ALGORITHM || !/^[a-f0-9]{64}$/u.test(input.value)) {
      throw new PortfolioWorkspaceIdempotencyContractError(PortfolioWorkspaceIdempotencyErrorReason.InvalidFingerprintInput);
    }

    this.algorithm = FINGERPRINT_ALGORITHM;
    this.value = input.value;
    Object.freeze(this);
  }

  static calculate(
    input: PortfolioWorkspaceIdempotencyFingerprintInput
  ): PortfolioWorkspaceIdempotencyFingerprint {
    const canonical = canonicalize(input.toJSON());
    return new PortfolioWorkspaceIdempotencyFingerprint({
      value: createHash(FINGERPRINT_ALGORITHM).update(canonical, FINGERPRINT_ENCODING).digest("hex")
    });
  }

  equals(other: PortfolioWorkspaceIdempotencyFingerprint | undefined): boolean {
    return other instanceof PortfolioWorkspaceIdempotencyFingerprint
      && this.algorithm === other.algorithm
      && this.value === other.value;
  }

  toJSON(): PortfolioWorkspaceIdempotencyFingerprintJson {
    return {
      algorithm: this.algorithm,
      value: this.value
    };
  }
}

export interface PortfolioWorkspaceIdempotencyFingerprintJson {
  readonly algorithm: typeof FINGERPRINT_ALGORITHM;
  readonly value: string;
}

export class PortfolioWorkspaceIdempotencyReplayPayload {
  private readonly __portfolioWorkspaceIdempotencyReplayPayloadBrand!: never;

  readonly presentationVersion: PortfolioWorkspacePresentationVersion;
  readonly outcome: PortfolioWorkspacePresentationOutcomeValue;
  readonly originalCorrelationId: string;
  readonly status: number;
  readonly body: JsonObject;
  readonly headers: JsonObject;

  constructor(input: {
    readonly presentationVersion: PortfolioWorkspacePresentationVersion;
    readonly outcome: PortfolioWorkspacePresentationOutcomeValue;
    readonly originalCorrelationId: string;
    readonly status: number;
    readonly body: JsonObject;
    readonly headers?: JsonObject;
  }) {
    assertSafeResourceIdentity(input.presentationVersion, PortfolioWorkspaceIdempotencyErrorReason.ReplayPayloadInvalid);
    assertSafeResourceIdentity(input.outcome, PortfolioWorkspaceIdempotencyErrorReason.ReplayPayloadInvalid);
    assertSafeResourceIdentity(input.originalCorrelationId, PortfolioWorkspaceIdempotencyErrorReason.ReplayPayloadInvalid);
    if (!Number.isInteger(input.status) || input.status < 200 || input.status > 299) {
      throw new PortfolioWorkspaceIdempotencyContractError(PortfolioWorkspaceIdempotencyErrorReason.ReplayPayloadInvalid);
    }
    if (!isJsonObject(input.body) || !isJsonObject(input.headers ?? {})) {
      throw new PortfolioWorkspaceIdempotencyContractError(PortfolioWorkspaceIdempotencyErrorReason.ReplayPayloadInvalid);
    }

    this.presentationVersion = input.presentationVersion;
    this.outcome = input.outcome;
    this.originalCorrelationId = input.originalCorrelationId;
    this.status = input.status;
    this.body = deepFreezeJson(input.body) as JsonObject;
    this.headers = deepFreezeJson(input.headers ?? {}) as JsonObject;
    Object.freeze(this);
  }

  equals(other: PortfolioWorkspaceIdempotencyReplayPayload | undefined): boolean {
    return other instanceof PortfolioWorkspaceIdempotencyReplayPayload
      && canonicalize(this.toJSON()) === canonicalize(other.toJSON());
  }

  toJSON(): PortfolioWorkspaceIdempotencyReplayPayloadJson {
    return {
      presentationVersion: this.presentationVersion,
      outcome: this.outcome,
      originalCorrelationId: this.originalCorrelationId,
      status: this.status,
      body: this.body,
      headers: this.headers
    };
  }
}

export interface PortfolioWorkspaceIdempotencyReplayPayloadJson {
  readonly presentationVersion: PortfolioWorkspacePresentationVersion;
  readonly outcome: PortfolioWorkspacePresentationOutcomeValue;
  readonly originalCorrelationId: string;
  readonly status: number;
  readonly body: JsonObject;
  readonly headers: JsonObject;
}

export class PortfolioWorkspaceIdempotencyOutcome {
  private readonly __portfolioWorkspaceIdempotencyOutcomeBrand!: never;

  readonly kind: PortfolioWorkspaceIdempotencyOutcomeKindValue;
  readonly replayPayload: PortfolioWorkspaceIdempotencyReplayPayload | undefined;

  constructor(input: {
    readonly kind: PortfolioWorkspaceIdempotencyOutcomeKindValue;
    readonly replayPayload?: PortfolioWorkspaceIdempotencyReplayPayload;
  }) {
    if (!Object.values(PortfolioWorkspaceIdempotencyOutcomeKind).includes(input.kind)) {
      throw new PortfolioWorkspaceIdempotencyContractError(PortfolioWorkspaceIdempotencyErrorReason.InternalContractFailure);
    }
    if (input.replayPayload !== undefined) {
      assertInstance(input.replayPayload, PortfolioWorkspaceIdempotencyReplayPayload, PortfolioWorkspaceIdempotencyErrorReason.ReplayPayloadInvalid);
    }

    this.kind = input.kind;
    this.replayPayload = input.replayPayload;
    Object.freeze(this);
  }

  toJSON(): PortfolioWorkspaceIdempotencyOutcomeJson {
    return {
      kind: this.kind,
      ...(this.replayPayload === undefined ? {} : { replayPayload: this.replayPayload.toJSON() })
    };
  }
}

export interface PortfolioWorkspaceIdempotencyOutcomeJson {
  readonly kind: PortfolioWorkspaceIdempotencyOutcomeKindValue;
  readonly replayPayload?: PortfolioWorkspaceIdempotencyReplayPayloadJson;
}

export function createInitializePortfolioExecutionFingerprintInput(input: {
  readonly scope: PortfolioWorkspaceIdempotencyScope;
  readonly presentationVersion: PortfolioWorkspacePresentationVersion;
  readonly executionId: string;
  readonly portfolioPlanReference: JsonObject;
  readonly planSnapshotReference: JsonObject;
  readonly approvalReference: JsonObject;
  readonly initialWorkItems?: readonly JsonObject[];
  readonly initialCandidates?: readonly JsonObject[];
}): PortfolioWorkspaceIdempotencyFingerprintInput {
  return new PortfolioWorkspaceIdempotencyFingerprintInput({
    scope: input.scope,
    presentationVersion: input.presentationVersion,
    requestIntent: {
      executionId: input.executionId,
      portfolioPlanReference: input.portfolioPlanReference,
      planSnapshotReference: input.planSnapshotReference,
      approvalReference: input.approvalReference,
      initialWorkItems: [...(input.initialWorkItems ?? [])],
      initialCandidates: [...(input.initialCandidates ?? [])]
    }
  });
}

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export interface JsonObject {
  readonly [key: string]: JsonValue;
}
export type JsonArray = readonly JsonValue[];

function invalid<T>(
  reason: PortfolioWorkspaceIdempotencyErrorReasonValue
): Result<T, PortfolioWorkspaceIdempotencyContractError> {
  return Result.failure(new PortfolioWorkspaceIdempotencyContractError(reason));
}

function assertOperation(
  value: unknown,
  reason: PortfolioWorkspaceIdempotencyErrorReasonValue
): asserts value is PortfolioWorkspaceIdempotencyOperationValue {
  if (!Object.values(PortfolioWorkspaceIdempotencyOperation).includes(value as PortfolioWorkspaceIdempotencyOperationValue)) {
    throw new PortfolioWorkspaceIdempotencyContractError(reason);
  }
}

function assertAuthorizationResourceReference(
  value: unknown,
  reason: PortfolioWorkspaceIdempotencyErrorReasonValue
): asserts value is PortfolioWorkspaceAuthorizationResourceReference {
  if (!(value instanceof PortfolioWorkspaceAuthorizationResourceReference)) {
    throw new PortfolioWorkspaceIdempotencyContractError(reason);
  }
}

function assertSafeResourceIdentity(
  value: unknown,
  reason: PortfolioWorkspaceIdempotencyErrorReasonValue
): asserts value is string {
  if (
    typeof value !== "string"
    || value.trim() !== value
    || value.length === 0
    || value.length > MAX_RESOURCE_IDENTITY_LENGTH
    || /[\u0000-\u001f\u007f]/u.test(value)
  ) {
    throw new PortfolioWorkspaceIdempotencyContractError(reason);
  }
}

function assertInstance<T>(
  value: unknown,
  constructor: new (...args: never[]) => T,
  reason: PortfolioWorkspaceIdempotencyErrorReasonValue
): asserts value is T {
  if (!(value instanceof constructor)) {
    throw new PortfolioWorkspaceIdempotencyContractError(reason);
  }
}

function isJsonValue(value: unknown): value is JsonValue {
  return value === null
    || typeof value === "string"
    || typeof value === "boolean"
    || (typeof value === "number" && Number.isFinite(value))
    || (Array.isArray(value) && value.every(isJsonValue))
    || isJsonObject(value);
}

function isJsonObject(value: unknown): value is JsonObject {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.getPrototypeOf(value) === Object.prototype
    && Object.values(value).every(isJsonValue);
}

function deepFreezeJson<T extends JsonValue>(value: T): T {
  if (Array.isArray(value)) {
    return Object.freeze(value.map((entry) => deepFreezeJson(entry))) as T;
  }

  if (isJsonObject(value)) {
    const entries = Object.entries(value).map(([key, entry]) => [key, deepFreezeJson(entry)] as const);
    return Object.freeze(Object.fromEntries(entries)) as T;
  }

  return value;
}

function canonicalize(value: unknown): string {
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(canonicalize).join(",")}]`;
  }

  if (!isJsonObject(value)) {
    throw new PortfolioWorkspaceIdempotencyContractError(PortfolioWorkspaceIdempotencyErrorReason.InvalidFingerprintInput);
  }

  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`).join(",")}}`;
}
