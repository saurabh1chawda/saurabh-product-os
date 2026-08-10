export const PortfolioExecutionLifecycle = Object.freeze({
  Initialized: "Initialized",
  Active: "Active",
  Completed: "Completed",
  Cancelled: "Cancelled"
} as const);

export type PortfolioExecutionLifecycleValue =
  typeof PortfolioExecutionLifecycle[keyof typeof PortfolioExecutionLifecycle];
