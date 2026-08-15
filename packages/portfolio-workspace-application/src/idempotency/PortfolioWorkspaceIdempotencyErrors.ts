export const PortfolioWorkspaceIdempotencyContractErrorReason = Object.freeze({
  InvalidIdentity: "invalid-idempotency-identity",
  InvalidKeyHash: "invalid-idempotency-key-hash",
  InvalidFingerprint: "invalid-idempotency-fingerprint",
  InvalidReplayPayload: "invalid-idempotency-replay-payload",
  InvalidCommandBinding: "invalid-idempotency-command-binding",
  InvalidExpiryMetadata: "invalid-idempotency-expiry-metadata",
  InvalidObservation: "invalid-idempotency-observation"
} as const);

export type PortfolioWorkspaceIdempotencyContractErrorReasonValue =
  typeof PortfolioWorkspaceIdempotencyContractErrorReason[keyof typeof PortfolioWorkspaceIdempotencyContractErrorReason];

export class PortfolioWorkspaceIdempotencyContractError extends Error {
  readonly code = "PORTFOLIO_WORKSPACE_IDEMPOTENCY_CONTRACT_ERROR";
  readonly reason: PortfolioWorkspaceIdempotencyContractErrorReasonValue;

  constructor(reason: PortfolioWorkspaceIdempotencyContractErrorReasonValue) {
    super("Portfolio Workspace idempotency contract is invalid.");
    this.name = "PortfolioWorkspaceIdempotencyContractError";
    this.reason = reason;
    Object.freeze(this);
  }

  toJSON(): {
    readonly name: "PortfolioWorkspaceIdempotencyContractError";
    readonly code: "PORTFOLIO_WORKSPACE_IDEMPOTENCY_CONTRACT_ERROR";
    readonly reason: PortfolioWorkspaceIdempotencyContractErrorReasonValue;
  } {
    return {
      name: "PortfolioWorkspaceIdempotencyContractError",
      code: this.code,
      reason: this.reason
    };
  }
}

export abstract class PortfolioWorkspaceIdempotencyPortError extends Error {
  private readonly __portfolioWorkspaceIdempotencyPortErrorBrand!: never;

  abstract readonly code: string;

  protected constructor(message: string) {
    super(message);
  }
}

export class PortfolioWorkspaceIdempotencyPersistenceUnavailableError extends PortfolioWorkspaceIdempotencyPortError {
  readonly code = "PORTFOLIO_WORKSPACE_IDEMPOTENCY_PERSISTENCE_UNAVAILABLE";

  constructor() {
    super("Portfolio Workspace idempotency persistence is unavailable.");
    this.name = "PortfolioWorkspaceIdempotencyPersistenceUnavailableError";
    Object.freeze(this);
  }

  toJSON(): {
    readonly name: "PortfolioWorkspaceIdempotencyPersistenceUnavailableError";
    readonly code: "PORTFOLIO_WORKSPACE_IDEMPOTENCY_PERSISTENCE_UNAVAILABLE";
  } {
    return {
      name: "PortfolioWorkspaceIdempotencyPersistenceUnavailableError",
      code: this.code
    };
  }
}

export class PortfolioWorkspaceIdempotencyCorruptRecordError extends PortfolioWorkspaceIdempotencyPortError {
  readonly code = "PORTFOLIO_WORKSPACE_IDEMPOTENCY_CORRUPT_RECORD";

  constructor() {
    super("Portfolio Workspace idempotency persisted state is corrupt.");
    this.name = "PortfolioWorkspaceIdempotencyCorruptRecordError";
    Object.freeze(this);
  }

  toJSON(): {
    readonly name: "PortfolioWorkspaceIdempotencyCorruptRecordError";
    readonly code: "PORTFOLIO_WORKSPACE_IDEMPOTENCY_CORRUPT_RECORD";
  } {
    return {
      name: "PortfolioWorkspaceIdempotencyCorruptRecordError",
      code: this.code
    };
  }
}

export class UnsupportedPortfolioWorkspaceIdempotencyRecordVersionError extends PortfolioWorkspaceIdempotencyPortError {
  readonly code = "UNSUPPORTED_PORTFOLIO_WORKSPACE_IDEMPOTENCY_RECORD_VERSION";
  readonly recordVersion: number;

  constructor(recordVersion: number) {
    super("Portfolio Workspace idempotency record version is unsupported.");
    this.name = "UnsupportedPortfolioWorkspaceIdempotencyRecordVersionError";
    this.recordVersion = recordVersion;
    Object.freeze(this);
  }

  toJSON(): {
    readonly name: "UnsupportedPortfolioWorkspaceIdempotencyRecordVersionError";
    readonly code: "UNSUPPORTED_PORTFOLIO_WORKSPACE_IDEMPOTENCY_RECORD_VERSION";
    readonly recordVersion: number;
  } {
    return {
      name: "UnsupportedPortfolioWorkspaceIdempotencyRecordVersionError",
      code: this.code,
      recordVersion: this.recordVersion
    };
  }
}

export class PortfolioWorkspaceIdempotencyStateTransitionError extends PortfolioWorkspaceIdempotencyPortError {
  readonly code = "PORTFOLIO_WORKSPACE_IDEMPOTENCY_STATE_TRANSITION_CONFLICT";

  constructor() {
    super("Portfolio Workspace idempotency state transition is invalid.");
    this.name = "PortfolioWorkspaceIdempotencyStateTransitionError";
    Object.freeze(this);
  }

  toJSON(): {
    readonly name: "PortfolioWorkspaceIdempotencyStateTransitionError";
    readonly code: "PORTFOLIO_WORKSPACE_IDEMPOTENCY_STATE_TRANSITION_CONFLICT";
  } {
    return {
      name: "PortfolioWorkspaceIdempotencyStateTransitionError",
      code: this.code
    };
  }
}

export class PortfolioWorkspaceIdempotencyOrchestrationContractError extends PortfolioWorkspaceIdempotencyPortError {
  readonly code = "PORTFOLIO_WORKSPACE_IDEMPOTENCY_ORCHESTRATION_CONTRACT_ERROR";

  constructor() {
    super("Portfolio Workspace idempotency orchestration contract failed.");
    this.name = "PortfolioWorkspaceIdempotencyOrchestrationContractError";
    Object.freeze(this);
  }

  toJSON(): {
    readonly name: "PortfolioWorkspaceIdempotencyOrchestrationContractError";
    readonly code: "PORTFOLIO_WORKSPACE_IDEMPOTENCY_ORCHESTRATION_CONTRACT_ERROR";
  } {
    return {
      name: "PortfolioWorkspaceIdempotencyOrchestrationContractError",
      code: this.code
    };
  }
}

export type PortfolioWorkspaceIdempotencyPortFailure =
  | PortfolioWorkspaceIdempotencyPersistenceUnavailableError
  | PortfolioWorkspaceIdempotencyCorruptRecordError
  | UnsupportedPortfolioWorkspaceIdempotencyRecordVersionError
  | PortfolioWorkspaceIdempotencyStateTransitionError
  | PortfolioWorkspaceIdempotencyOrchestrationContractError;
