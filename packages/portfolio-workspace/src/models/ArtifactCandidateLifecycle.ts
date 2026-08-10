export const ArtifactCandidateLifecycle = Object.freeze({
  Registered: "Registered",
  Accepted: "Accepted",
  Rejected: "Rejected"
} as const);

export type ArtifactCandidateLifecycleValue =
  typeof ArtifactCandidateLifecycle[keyof typeof ArtifactCandidateLifecycle];
