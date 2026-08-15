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

export const PORTFOLIO_WORKSPACE_IDEMPOTENCY_OPERATIONS: readonly PortfolioWorkspaceIdempotencyOperationValue[] =
  Object.freeze(Object.values(PortfolioWorkspaceIdempotencyOperation));

export function isPortfolioWorkspaceIdempotencyOperation(
  value: unknown
): value is PortfolioWorkspaceIdempotencyOperationValue {
  return PORTFOLIO_WORKSPACE_IDEMPOTENCY_OPERATIONS.includes(value as PortfolioWorkspaceIdempotencyOperationValue);
}
