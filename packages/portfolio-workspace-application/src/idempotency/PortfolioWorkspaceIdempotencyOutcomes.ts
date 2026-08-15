import {
  PortfolioWorkspaceIdempotencyContractError,
  PortfolioWorkspaceIdempotencyContractErrorReason
} from "./PortfolioWorkspaceIdempotencyErrors";
import { PortfolioWorkspaceIdempotencyReplayPayload } from "./PortfolioWorkspaceIdempotencyReplayPayload";

export const PortfolioWorkspaceIdempotencyDurableState = Object.freeze({
  Reserved: "reserved",
  Completed: "completed"
} as const);

export type PortfolioWorkspaceIdempotencyDurableStateValue =
  typeof PortfolioWorkspaceIdempotencyDurableState[keyof typeof PortfolioWorkspaceIdempotencyDurableState];

export const PortfolioWorkspaceIdempotencyObservationKind = Object.freeze({
  AcquiredForFirstExecution: "acquired-for-first-execution",
  ReplayAvailable: "replay-available",
  InProgress: "in-progress",
  FingerprintMismatch: "fingerprint-mismatch"
} as const);

export type PortfolioWorkspaceIdempotencyObservationKindValue =
  typeof PortfolioWorkspaceIdempotencyObservationKind[keyof typeof PortfolioWorkspaceIdempotencyObservationKind];

export class PortfolioWorkspaceIdempotencyReservationObservation {
  private readonly __portfolioWorkspaceIdempotencyReservationObservationBrand!: never;

  readonly kind: PortfolioWorkspaceIdempotencyObservationKindValue;
  readonly replayPayload: PortfolioWorkspaceIdempotencyReplayPayload | undefined;

  constructor(input: {
    readonly kind: PortfolioWorkspaceIdempotencyObservationKindValue;
    readonly replayPayload?: PortfolioWorkspaceIdempotencyReplayPayload;
  }) {
    if (!Object.values(PortfolioWorkspaceIdempotencyObservationKind).includes(input.kind)) {
      throw new PortfolioWorkspaceIdempotencyContractError(PortfolioWorkspaceIdempotencyContractErrorReason.InvalidObservation);
    }
    if (
      input.kind === PortfolioWorkspaceIdempotencyObservationKind.ReplayAvailable
      && !(input.replayPayload instanceof PortfolioWorkspaceIdempotencyReplayPayload)
    ) {
      throw new PortfolioWorkspaceIdempotencyContractError(PortfolioWorkspaceIdempotencyContractErrorReason.InvalidObservation);
    }
    if (
      input.kind !== PortfolioWorkspaceIdempotencyObservationKind.ReplayAvailable
      && input.replayPayload !== undefined
    ) {
      throw new PortfolioWorkspaceIdempotencyContractError(PortfolioWorkspaceIdempotencyContractErrorReason.InvalidObservation);
    }

    this.kind = input.kind;
    this.replayPayload = input.replayPayload;
    Object.freeze(this);
  }

  toJSON(): {
    readonly kind: PortfolioWorkspaceIdempotencyObservationKindValue;
    readonly replayPayload?: ReturnType<PortfolioWorkspaceIdempotencyReplayPayload["toJSON"]>;
  } {
    return {
      kind: this.kind,
      ...(this.replayPayload === undefined ? {} : { replayPayload: this.replayPayload.toJSON() })
    };
  }
}

export class PortfolioWorkspaceIdempotencyCompletionResult {
  private readonly __portfolioWorkspaceIdempotencyCompletionResultBrand!: never;

  readonly completed = true;

  constructor() {
    Object.freeze(this);
  }

  toJSON(): {
    readonly completed: true;
  } {
    return {
      completed: true
    };
  }
}
