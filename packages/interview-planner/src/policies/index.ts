import { immutableArray, immutableRecord } from "../shared";

export type InterviewPlannerStage =
  | "InterviewPlanContext"
  | "InterviewNeeds"
  | "InterviewInitiatives"
  | "InterviewEvaluation"
  | "InterviewRoadmap"
  | "InterviewPlan";

export type InterviewReadinessCategory =
  | "ProductStrategy"
  | "ProductSense"
  | "Metrics"
  | "ProductExecution"
  | "AIProductDesign"
  | "CustomerDiscovery"
  | "LeadershipStories"
  | "BehavioralReadiness"
  | "TechnicalFluency"
  | "Communication"
  | "StakeholderManagement"
  | "Pricing"
  | "Growth"
  | "SystemsThinking"
  | "ExecutiveCommunication";

export type InterviewInitiativeKind =
  | "PrepareSTAREvidenceMatrix"
  | "PrepareProductStrategyNarratives"
  | "PrepareExecutionStories"
  | "PrepareArchitectureWalkthrough"
  | "PrepareMetricsFramework"
  | "PreparePortfolioWalkthrough"
  | "PrepareLeadershipEvidence"
  | "PreparePricingFramework"
  | "PrepareProductTeardownDiscussion"
  | "PrepareProductSenseFramework"
  | "PrepareEstimationFramework";

export type InterviewPlanOutcome =
  | "ReadinessAcceleration"
  | "EvidenceFocusedReadiness"
  | "StrategicInterviewReadiness"
  | "FoundationReadiness";

export interface InterviewPlannerPolicy {
  readonly policyId: string;
  readonly strategicImpactWeight: number;
  readonly interviewCoverageWeight: number;
  readonly capabilityReinforcementWeight: number;
  readonly evidenceContributionWeight: number;
  readonly relevanceWeight: number;
  readonly effortRiskWeight: number;
  readonly accelerationThreshold: number;
  readonly foundationThreshold: number;
}

export interface InterviewPlanningPreference {
  readonly preferenceId: string;
  readonly label: string;
  readonly value: string;
  readonly weight: number;
}

export interface InterviewPlanningConstraint {
  readonly constraintId: string;
  readonly label: string;
  readonly value: string;
}

export function defaultInterviewPlannerPolicy(input: Partial<InterviewPlannerPolicy> = {}): InterviewPlannerPolicy {
  return immutableRecord({
    policyId: input.policyId ?? "interview-planner-policy:default",
    strategicImpactWeight: input.strategicImpactWeight ?? 0.2,
    interviewCoverageWeight: input.interviewCoverageWeight ?? 0.2,
    capabilityReinforcementWeight: input.capabilityReinforcementWeight ?? 0.18,
    evidenceContributionWeight: input.evidenceContributionWeight ?? 0.16,
    relevanceWeight: input.relevanceWeight ?? 0.16,
    effortRiskWeight: input.effortRiskWeight ?? 0.1,
    accelerationThreshold: input.accelerationThreshold ?? 82,
    foundationThreshold: input.foundationThreshold ?? 58
  });
}

export function defaultInterviewPreferences(input: readonly InterviewPlanningPreference[] = []): readonly InterviewPlanningPreference[] {
  if (input.length > 0) return immutableArray(input);
  return immutableArray([
    preference("interview-preference:strategy", "Product strategy readiness", "ProductStrategy", 0.9),
    preference("interview-preference:leadership", "Leadership story readiness", "LeadershipStories", 0.85),
    preference("interview-preference:metrics", "Metrics readiness", "Metrics", 0.8)
  ]);
}

export function defaultInterviewConstraints(input: readonly InterviewPlanningConstraint[] = []): readonly InterviewPlanningConstraint[] {
  return immutableArray(input);
}

function preference(preferenceId: string, label: string, value: string, weight: number): InterviewPlanningPreference {
  return immutableRecord({ preferenceId, label, value, weight });
}
