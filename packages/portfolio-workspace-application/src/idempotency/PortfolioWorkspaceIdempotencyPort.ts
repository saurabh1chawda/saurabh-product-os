import type { Result } from "@career-companion/kernel";
import type { PortfolioWorkspaceIdempotencyPortFailure } from "./PortfolioWorkspaceIdempotencyErrors";
import type { PortfolioWorkspaceIdempotencyReservationObservation, PortfolioWorkspaceIdempotencyCompletionResult } from "./PortfolioWorkspaceIdempotencyOutcomes";
import type { PortfolioWorkspaceIdempotencyReplayPayload } from "./PortfolioWorkspaceIdempotencyReplayPayload";
import type {
  PortfolioWorkspaceIdempotencyCommandBinding,
  PortfolioWorkspaceIdempotencyExpiryMetadata,
  PortfolioWorkspaceIdempotencyIdentity,
  PortfolioWorkspaceIdempotencyRequestFingerprint
} from "./PortfolioWorkspaceIdempotencyValues";

export interface PortfolioWorkspaceIdempotencyReserveInput {
  readonly identity: PortfolioWorkspaceIdempotencyIdentity;
  readonly requestFingerprint: PortfolioWorkspaceIdempotencyRequestFingerprint;
  readonly commandBinding: PortfolioWorkspaceIdempotencyCommandBinding;
  readonly expiry: PortfolioWorkspaceIdempotencyExpiryMetadata;
}

export interface PortfolioWorkspaceIdempotencyCompleteInput {
  readonly identity: PortfolioWorkspaceIdempotencyIdentity;
  readonly requestFingerprint: PortfolioWorkspaceIdempotencyRequestFingerprint;
  readonly commandBinding: PortfolioWorkspaceIdempotencyCommandBinding;
  readonly replayPayload: PortfolioWorkspaceIdempotencyReplayPayload;
  readonly expiry: PortfolioWorkspaceIdempotencyExpiryMetadata;
}

/**
 * Contract only. Public mutation safety requires a later Portfolio Workspace
 * atomic orchestration boundary that commits reservation, aggregate save, and
 * completion together in one durable transaction.
 */
export interface PortfolioWorkspaceIdempotencyPort {
  reserveOrObserve(
    input: PortfolioWorkspaceIdempotencyReserveInput
  ): Promise<Result<PortfolioWorkspaceIdempotencyReservationObservation, PortfolioWorkspaceIdempotencyPortFailure>>;

  completeSuccessfulMutation(
    input: PortfolioWorkspaceIdempotencyCompleteInput
  ): Promise<Result<PortfolioWorkspaceIdempotencyCompletionResult, PortfolioWorkspaceIdempotencyPortFailure>>;
}
