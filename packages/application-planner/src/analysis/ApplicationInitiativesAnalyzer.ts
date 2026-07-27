import { createApplicationPlannerExplanationSummary } from "../explainability";
import type { ApplicationInitiatives, ApplicationNeeds } from "../models";
import { confidenceFromScore, immutableArray, immutableRecord, uniqueSorted } from "../shared";
import { applicationInitiative } from "./scoring";

export class ApplicationInitiativesAnalyzer {
  analyze(needs: ApplicationNeeds): ApplicationInitiatives {
    const evidence = uniqueSorted([
      needs.careerStrategy.strategyId,
      needs.portfolioPlan.planId,
      needs.learningPlan.planId,
      needs.interviewPlan.planId,
      needs.networkingPlan.planId,
      needs.opportunityDecision.decisionId,
      ...needs.needs.flatMap((need) => need.evidence)
    ]);
    const initiatives = immutableArray([
      applicationInitiative("PrioritizeTargetCompanies", "Prioritize target companies", needIdsFor(needs, "ApplicationPrioritization", "RoleAlignment"), evidence, 80),
      applicationInitiative("PrepareRoleSpecificAssets", "Prepare role-specific application assets", needIdsFor(needs, "RoleAlignment", "ApplicationEvidence"), evidence, 76),
      applicationInitiative("CompletePortfolioEvidence", "Complete portfolio evidence", needIdsFor(needs, "PortfolioCompleteness", "ApplicationEvidence"), evidence, 78),
      applicationInitiative("ValidateResumeCoverage", "Validate resume coverage", needIdsFor(needs, "ResumeReadiness", "RoleAlignment"), evidence, 74),
      applicationInitiative("PrepareCompanyResearch", "Prepare company research", needIdsFor(needs, "CompanyResearch", "RoleAlignment"), evidence, 70),
      applicationInitiative("OrganizeSupportingDocumentation", "Organize supporting documentation", needIdsFor(needs, "SupportingDocumentation", "ApplicationEvidence"), evidence, 72),
      applicationInitiative("VerifyInterviewReadiness", "Verify interview readiness", needIdsFor(needs, "InterviewPipelineReadiness"), evidence, 74),
      applicationInitiative("PrioritizeReferrals", "Prioritize referrals", needIdsFor(needs, "ReferralReadiness", "RecruiterEngagementReadiness"), evidence, 76)
    ].filter((item) => item.applicationNeedIds.length > 0 || item.kind === "PrioritizeTargetCompanies"));
    const initiativesId = `application-initiatives:${needs.needsId}`;
    const confidenceScore = Math.round(initiatives.reduce((sum, item) => sum + item.confidence.value * 100, 0) / Math.max(1, initiatives.length));

    return immutableRecord({
      artifactKind: "ApplicationInitiatives" as const,
      initiativesId,
      needsId: needs.needsId,
      careerStrategy: needs.careerStrategy,
      portfolioPlan: needs.portfolioPlan,
      learningPlan: needs.learningPlan,
      interviewPlan: needs.interviewPlan,
      networkingPlan: needs.networkingPlan,
      opportunityDecision: needs.opportunityDecision,
      initiatives,
      policy: needs.policy,
      preferences: needs.preferences,
      assumptions: needs.assumptions,
      constraints: needs.constraints,
      traceId: needs.traceId,
      confidence: confidenceFromScore(confidenceScore, "ApplicationInitiatives confidence follows deterministic application initiatives."),
      explanationSummary: createApplicationPlannerExplanationSummary({
        decisionId: initiativesId,
        title: "Application Initiatives",
        outcome: "InitiativesRepresented",
        confidenceScore,
        evidenceReferenceIds: evidence,
        reasonCodes: initiatives.map((item) => item.kind),
        assumptions: needs.assumptions,
        constraints: needs.constraints.map((constraint) => constraint.label),
        tradeOffs: immutableArray(["initiative breadth is balanced against application focus"])
      })
    });
  }
}

function needIdsFor(needs: ApplicationNeeds, ...categories: readonly string[]): readonly string[] {
  return immutableArray(needs.needs.filter((need) => categories.includes(need.category)).map((need) => need.needId));
}
