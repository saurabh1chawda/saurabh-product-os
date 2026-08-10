import type { ExecutionId } from "@career-companion/portfolio-workspace";
import { PortfolioExecutionRevision } from "../persistence/PortfolioExecutionRevision";

export abstract class PortfolioExecutionRepositoryError extends Error {
  private readonly __portfolioExecutionRepositoryErrorBrand!: never;

  abstract readonly code: string;

  protected constructor(message: string) {
    super(message);
  }
}

export class PortfolioExecutionConcurrencyConflictError extends PortfolioExecutionRepositoryError {
  readonly code = "PORTFOLIO_EXECUTION_CONCURRENCY_CONFLICT";

  readonly executionId: ExecutionId;
  readonly expectedRevision: PortfolioExecutionRevision;
  readonly actualRevision: PortfolioExecutionRevision | undefined;

  constructor(input: {
    readonly executionId: ExecutionId;
    readonly expectedRevision: PortfolioExecutionRevision;
    readonly actualRevision?: PortfolioExecutionRevision;
  }) {
    super("Portfolio execution persistence revision conflict.");
    this.name = "PortfolioExecutionConcurrencyConflictError";
    this.executionId = input.executionId;
    this.expectedRevision = input.expectedRevision;
    this.actualRevision = input.actualRevision;
    Object.freeze(this);
  }

  toJSON(): {
    readonly name: "PortfolioExecutionConcurrencyConflictError";
    readonly code: "PORTFOLIO_EXECUTION_CONCURRENCY_CONFLICT";
    readonly executionId: string;
    readonly expectedRevision: number;
    readonly actualRevision?: number;
  } {
    return {
      name: "PortfolioExecutionConcurrencyConflictError",
      code: this.code,
      executionId: this.executionId.toJSON(),
      expectedRevision: this.expectedRevision.toJSON(),
      ...(this.actualRevision === undefined ? {} : { actualRevision: this.actualRevision.toJSON() })
    };
  }
}

export class PortfolioExecutionAlreadyExistsError extends PortfolioExecutionRepositoryError {
  readonly code = "PORTFOLIO_EXECUTION_ALREADY_EXISTS";

  readonly executionId: ExecutionId;
  readonly currentRevision: PortfolioExecutionRevision;

  constructor(input: {
    readonly executionId: ExecutionId;
    readonly currentRevision: PortfolioExecutionRevision;
  }) {
    super("Portfolio execution already exists.");
    this.name = "PortfolioExecutionAlreadyExistsError";
    this.executionId = input.executionId;
    this.currentRevision = input.currentRevision;
    Object.freeze(this);
  }

  toJSON(): {
    readonly name: "PortfolioExecutionAlreadyExistsError";
    readonly code: "PORTFOLIO_EXECUTION_ALREADY_EXISTS";
    readonly executionId: string;
    readonly currentRevision: number;
  } {
    return {
      name: "PortfolioExecutionAlreadyExistsError",
      code: this.code,
      executionId: this.executionId.toJSON(),
      currentRevision: this.currentRevision.toJSON()
    };
  }
}

export class PortfolioExecutionPersistenceUnavailableError extends PortfolioExecutionRepositoryError {
  readonly code = "PORTFOLIO_EXECUTION_PERSISTENCE_UNAVAILABLE";

  constructor() {
    super("Portfolio execution persistence is unavailable.");
    this.name = "PortfolioExecutionPersistenceUnavailableError";
    Object.freeze(this);
  }

  toJSON(): {
    readonly name: "PortfolioExecutionPersistenceUnavailableError";
    readonly code: "PORTFOLIO_EXECUTION_PERSISTENCE_UNAVAILABLE";
  } {
    return {
      name: "PortfolioExecutionPersistenceUnavailableError",
      code: this.code
    };
  }
}

export class PortfolioExecutionPersistenceMappingError extends PortfolioExecutionRepositoryError {
  readonly code = "PORTFOLIO_EXECUTION_PERSISTENCE_MAPPING_ERROR";

  constructor() {
    super("Portfolio execution persisted state could not be mapped.");
    this.name = "PortfolioExecutionPersistenceMappingError";
    Object.freeze(this);
  }

  toJSON(): {
    readonly name: "PortfolioExecutionPersistenceMappingError";
    readonly code: "PORTFOLIO_EXECUTION_PERSISTENCE_MAPPING_ERROR";
  } {
    return {
      name: "PortfolioExecutionPersistenceMappingError",
      code: this.code
    };
  }
}

export class UnsupportedPortfolioExecutionRecordVersionError extends PortfolioExecutionRepositoryError {
  readonly code = "UNSUPPORTED_PORTFOLIO_EXECUTION_RECORD_VERSION";

  readonly recordVersion: number;

  constructor(recordVersion: number) {
    super("Portfolio execution record version is unsupported.");
    this.name = "UnsupportedPortfolioExecutionRecordVersionError";
    this.recordVersion = recordVersion;
    Object.freeze(this);
  }

  toJSON(): {
    readonly name: "UnsupportedPortfolioExecutionRecordVersionError";
    readonly code: "UNSUPPORTED_PORTFOLIO_EXECUTION_RECORD_VERSION";
    readonly recordVersion: number;
  } {
    return {
      name: "UnsupportedPortfolioExecutionRecordVersionError",
      code: this.code,
      recordVersion: this.recordVersion
    };
  }
}

export type PortfolioExecutionRepositorySaveFailure =
  | PortfolioExecutionConcurrencyConflictError
  | PortfolioExecutionAlreadyExistsError
  | PortfolioExecutionPersistenceUnavailableError
  | PortfolioExecutionPersistenceMappingError
  | UnsupportedPortfolioExecutionRecordVersionError;
