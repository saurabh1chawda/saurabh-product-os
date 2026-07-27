import { immutableArray, immutableRecord } from "../shared";

export type ApplicationPlannerStage =
  | "ApplicationPlanContext"
  | "ApplicationNeeds"
  | "ApplicationInitiatives"
  | "ApplicationEvaluation"
  | "ApplicationRoadmap"
  | "ApplicationPlan";

export type ApplicationNeedCategory =
  | "ResumeReadiness"
  | "PortfolioCompleteness"
  | "ApplicationPrioritization"
  | "RecruiterEngagementReadiness"
  | "ReferralReadiness"
  | "SupportingDocumentation"
  | "RoleAlignment"
  | "CompanyResearch"
  | "ApplicationEvidence"
  | "InterviewPipelineReadiness";

export type ApplicationInitiativeKind =
  | "PrioritizeTargetCompanies"
  | "PrepareRoleSpecificAssets"
  | "CompletePortfolioEvidence"
  | "ValidateResumeCoverage"
  | "PrepareCompanyResearch"
  | "OrganizeSupportingDocumentation"
  | "VerifyInterviewReadiness"
  | "PrioritizeReferrals";

export type ApplicationPlanOutcome =
  | "ApplicationReadinessAcceleration"
  | "OpportunityFocusedReadiness"
  | "ReferralLedApplications"
  | "FoundationApplicationReadiness";

export interface ApplicationPlannerPolicy {
  readonly policyId: string;
  readonly strategicImpactWeight: number;
  readonly opportunityAlignmentWeight: number;
  readonly readinessImprovementWeight: number;
  readonly recruiterRelevanceWeight: number;
  readonly hiringManagerRelevanceWeight: number;
  readonly effortRiskWeight: number;
  readonly accelerationThreshold: number;
  readonly foundationThreshold: number;
}

export interface ApplicationPlanningPreference {
  readonly preferenceId: string;
  readonly label: string;
  readonly value: string;
  readonly weight: number;
}

export interface ApplicationPlanningConstraint {
  readonly constraintId: string;
  readonly label: string;
  readonly value: string;
}

export function defaultApplicationPlannerPolicy(input: Partial<ApplicationPlannerPolicy> = {}): ApplicationPlannerPolicy {
  return immutableRecord({
    policyId: input.policyId ?? "application-planner-policy:default",
    strategicImpactWeight: input.strategicImpactWeight ?? 0.2,
    opportunityAlignmentWeight: input.opportunityAlignmentWeight ?? 0.18,
    readinessImprovementWeight: input.readinessImprovementWeight ?? 0.18,
    recruiterRelevanceWeight: input.recruiterRelevanceWeight ?? 0.14,
    hiringManagerRelevanceWeight: input.hiringManagerRelevanceWeight ?? 0.14,
    effortRiskWeight: input.effortRiskWeight ?? 0.16,
    accelerationThreshold: input.accelerationThreshold ?? 82,
    foundationThreshold: input.foundationThreshold ?? 58
  });
}

export function defaultApplicationPreferences(input: readonly ApplicationPlanningPreference[] = []): readonly ApplicationPlanningPreference[] {
  if (input.length > 0) return immutableArray(input);
  return immutableArray([
    preference("application-preference:role-alignment", "Role alignment", "RoleAlignment", 0.9),
    preference("application-preference:evidence", "Application evidence", "ApplicationEvidence", 0.85),
    preference("application-preference:referrals", "Referral readiness", "ReferralReadiness", 0.8)
  ]);
}

export function defaultApplicationConstraints(input: readonly ApplicationPlanningConstraint[] = []): readonly ApplicationPlanningConstraint[] {
  return immutableArray(input);
}

function preference(preferenceId: string, label: string, value: string, weight: number): ApplicationPlanningPreference {
  return immutableRecord({ preferenceId, label, value, weight });
}
