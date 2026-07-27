import { immutableArray, immutableRecord } from "../shared";

export type PortfolioPlannerStage =
  | "PortfolioPlanContext"
  | "EvidenceNeeds"
  | "PortfolioInitiatives"
  | "InitiativeEvaluation"
  | "PortfolioRoadmap"
  | "PortfolioPlan";

export type PortfolioInitiativeKind =
  | "BuildEvidence"
  | "ImproveEvidence"
  | "PublishEvidence"
  | "QuantifyImpact"
  | "StrengthenCaseStudy"
  | "IncreaseStrategicCoverage";

export type PortfolioPlanOutcome =
  | "PublishReady"
  | "ImproveBeforePublishing"
  | "BuildCriticalEvidence"
  | "SequenceStrategicInitiatives";

export interface PortfolioPlannerPolicy {
  readonly policyId: string;
  readonly publishReadyThreshold: number;
  readonly improvementThreshold: number;
  readonly strategicAlignmentWeight: number;
  readonly evidenceUrgencyWeight: number;
  readonly opportunityWeight: number;
  readonly feasibilityWeight: number;
}

export interface PortfolioPlanningConstraint {
  readonly constraintId: string;
  readonly label: string;
  readonly value: string;
}

export function defaultPortfolioPlannerPolicy(input: Partial<PortfolioPlannerPolicy> = {}): PortfolioPlannerPolicy {
  return immutableRecord({
    policyId: input.policyId ?? "portfolio-planner-policy:default",
    publishReadyThreshold: input.publishReadyThreshold ?? 82,
    improvementThreshold: input.improvementThreshold ?? 62,
    strategicAlignmentWeight: input.strategicAlignmentWeight ?? 0.3,
    evidenceUrgencyWeight: input.evidenceUrgencyWeight ?? 0.3,
    opportunityWeight: input.opportunityWeight ?? 0.2,
    feasibilityWeight: input.feasibilityWeight ?? 0.2
  });
}

export function defaultPortfolioPlanningConstraints(input: readonly PortfolioPlanningConstraint[] = []): readonly PortfolioPlanningConstraint[] {
  return immutableArray(input);
}
