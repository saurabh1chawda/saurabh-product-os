export const PortfolioWorkItemLifecycle = Object.freeze({
  Pending: "Pending",
  Active: "Active",
  Blocked: "Blocked",
  ReadyForReview: "ReadyForReview",
  Completed: "Completed",
  Cancelled: "Cancelled"
} as const);

export type PortfolioWorkItemLifecycleValue =
  typeof PortfolioWorkItemLifecycle[keyof typeof PortfolioWorkItemLifecycle];
