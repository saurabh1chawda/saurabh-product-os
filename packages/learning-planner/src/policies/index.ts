import { immutableArray, immutableRecord } from "../shared";

export type LearningPlannerStage =
  | "LearningPlanContext"
  | "CapabilityNeeds"
  | "LearningInitiatives"
  | "LearningEvaluation"
  | "LearningRoadmap"
  | "LearningPlan";

export type CapabilityCategory =
  | "ProductStrategy"
  | "AIProductManagement"
  | "CustomerDiscovery"
  | "ProductAnalytics"
  | "Experimentation"
  | "PlatformThinking"
  | "TechnicalFluency"
  | "ProductLeadership"
  | "StakeholderManagement"
  | "ExecutiveCommunication"
  | "ProductVision"
  | "SystemsThinking"
  | "Pricing"
  | "Growth"
  | "DomainExpertise"
  | "DecisionMaking"
  | "ProductOperations";

export type LearningInitiativeKind =
  | "BuildAIPrototype"
  | "PerformProductTeardown"
  | "ConductCustomerInterviews"
  | "WriteStrategyMemo"
  | "CreatePRD"
  | "DesignExperimentationFramework"
  | "AnalyzeProductionMetrics"
  | "PublishTechnicalArticle"
  | "ContributeToOpenSource"
  | "BuildAnalyticsDashboard"
  | "PerformCompetitiveAnalysis"
  | "DesignAIWorkflow"
  | "CreateDecisionFramework";

export type LearningPlanOutcome =
  | "CapabilityFocusedGrowth"
  | "StrategicCapabilityAcceleration"
  | "EvidenceLedLearning"
  | "FoundationBuilding";

export interface LearningPlannerPolicy {
  readonly policyId: string;
  readonly strategicImpactWeight: number;
  readonly capabilityCoverageWeight: number;
  readonly evidenceContributionWeight: number;
  readonly opportunityValueWeight: number;
  readonly effortRiskWeight: number;
  readonly accelerationThreshold: number;
  readonly foundationThreshold: number;
}

export interface LearningPreference {
  readonly preferenceId: string;
  readonly label: string;
  readonly value: string;
  readonly weight: number;
}

export interface LearningPlanningConstraint {
  readonly constraintId: string;
  readonly label: string;
  readonly value: string;
}

export function defaultLearningPlannerPolicy(input: Partial<LearningPlannerPolicy> = {}): LearningPlannerPolicy {
  return immutableRecord({
    policyId: input.policyId ?? "learning-planner-policy:default",
    strategicImpactWeight: input.strategicImpactWeight ?? 0.25,
    capabilityCoverageWeight: input.capabilityCoverageWeight ?? 0.2,
    evidenceContributionWeight: input.evidenceContributionWeight ?? 0.2,
    opportunityValueWeight: input.opportunityValueWeight ?? 0.2,
    effortRiskWeight: input.effortRiskWeight ?? 0.15,
    accelerationThreshold: input.accelerationThreshold ?? 82,
    foundationThreshold: input.foundationThreshold ?? 58
  });
}

export function defaultLearningPreferences(input: readonly LearningPreference[] = []): readonly LearningPreference[] {
  if (input.length > 0) return immutableArray(input);
  return immutableArray([
    preference("learning-preference:ai", "AI capability", "AIProductManagement", 0.9),
    preference("learning-preference:platform", "Platform capability", "PlatformThinking", 0.8),
    preference("learning-preference:leadership", "Leadership capability", "ProductLeadership", 0.8)
  ]);
}

export function defaultLearningConstraints(input: readonly LearningPlanningConstraint[] = []): readonly LearningPlanningConstraint[] {
  return immutableArray(input);
}

function preference(preferenceId: string, label: string, value: string, weight: number): LearningPreference {
  return immutableRecord({ preferenceId, label, value, weight });
}
