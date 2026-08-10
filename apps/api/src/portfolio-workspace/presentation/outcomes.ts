export const PortfolioWorkspacePresentationOutcome = {
  ExecutionInitialized: "execution-initialized",
  ExecutionStarted: "execution-started",
  WorkItemActivated: "work-item-activated",
  WorkItemCompleted: "work-item-completed",
  WorkItemCancelled: "work-item-cancelled",
  CandidateAccepted: "candidate-accepted",
  CandidateRejected: "candidate-rejected",
  ExecutionCompleted: "execution-completed",
  ExecutionCancelled: "execution-cancelled"
} as const;

export type PortfolioWorkspacePresentationOutcomeValue =
  typeof PortfolioWorkspacePresentationOutcome[keyof typeof PortfolioWorkspacePresentationOutcome];
