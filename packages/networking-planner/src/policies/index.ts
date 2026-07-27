import { immutableArray, immutableRecord } from "../shared";

export type NetworkingPlannerStage =
  | "NetworkingPlanContext"
  | "NetworkingNeeds"
  | "NetworkingInitiatives"
  | "NetworkingEvaluation"
  | "NetworkingRoadmap"
  | "NetworkingPlan";

export type NetworkingNeedCategory =
  | "ProfessionalVisibility"
  | "IndustryRelationships"
  | "HiringManagerExposure"
  | "RecruiterExposure"
  | "PeerNetwork"
  | "AICommunityParticipation"
  | "ConferenceParticipation"
  | "ThoughtLeadership"
  | "Referrals"
  | "MentorNetwork"
  | "DomainCredibility"
  | "PortfolioAwareness";

export type NetworkingInitiativeKind =
  | "IncreaseProfessionalVisibility"
  | "PublishAIProductContent"
  | "AttendProductMeetups"
  | "StrengthenRecruiterNetwork"
  | "ExpandHiringManagerNetwork"
  | "ContributeToCommunities"
  | "PublishPortfolio"
  | "EngageIndustryDiscussions"
  | "BuildReferralNetwork"
  | "ParticipateInConferences";

export type NetworkingPlanOutcome =
  | "VisibilityAcceleration"
  | "RelationshipFocusedGrowth"
  | "ReferralReadiness"
  | "FoundationNetworking";

export interface NetworkingPlannerPolicy {
  readonly policyId: string;
  readonly strategicImpactWeight: number;
  readonly opportunityAlignmentWeight: number;
  readonly visibilityImprovementWeight: number;
  readonly relationshipLeverageWeight: number;
  readonly relevanceWeight: number;
  readonly effortRiskWeight: number;
  readonly accelerationThreshold: number;
  readonly foundationThreshold: number;
}

export interface NetworkingPlanningPreference {
  readonly preferenceId: string;
  readonly label: string;
  readonly value: string;
  readonly weight: number;
}

export interface NetworkingPlanningConstraint {
  readonly constraintId: string;
  readonly label: string;
  readonly value: string;
}

export function defaultNetworkingPlannerPolicy(input: Partial<NetworkingPlannerPolicy> = {}): NetworkingPlannerPolicy {
  return immutableRecord({
    policyId: input.policyId ?? "networking-planner-policy:default",
    strategicImpactWeight: input.strategicImpactWeight ?? 0.2,
    opportunityAlignmentWeight: input.opportunityAlignmentWeight ?? 0.18,
    visibilityImprovementWeight: input.visibilityImprovementWeight ?? 0.18,
    relationshipLeverageWeight: input.relationshipLeverageWeight ?? 0.16,
    relevanceWeight: input.relevanceWeight ?? 0.18,
    effortRiskWeight: input.effortRiskWeight ?? 0.1,
    accelerationThreshold: input.accelerationThreshold ?? 82,
    foundationThreshold: input.foundationThreshold ?? 58
  });
}

export function defaultNetworkingPreferences(input: readonly NetworkingPlanningPreference[] = []): readonly NetworkingPlanningPreference[] {
  if (input.length > 0) return immutableArray(input);
  return immutableArray([
    preference("networking-preference:visibility", "Professional visibility", "ProfessionalVisibility", 0.9),
    preference("networking-preference:relationships", "Industry relationships", "IndustryRelationships", 0.85),
    preference("networking-preference:referrals", "Referral readiness", "Referrals", 0.8)
  ]);
}

export function defaultNetworkingConstraints(input: readonly NetworkingPlanningConstraint[] = []): readonly NetworkingPlanningConstraint[] {
  return immutableArray(input);
}

function preference(preferenceId: string, label: string, value: string, weight: number): NetworkingPlanningPreference {
  return immutableRecord({ preferenceId, label, value, weight });
}
