import { createInterviewPlannerExplanationSummary } from "../explainability";
import type { InterviewInitiatives, InterviewNeeds } from "../models";
import { confidenceFromScore, immutableArray, immutableRecord, uniqueSorted } from "../shared";
import { interviewInitiative } from "./scoring";

export class InterviewInitiativesAnalyzer {
  analyze(needs: InterviewNeeds): InterviewInitiatives {
    const allNeedIds = needs.needs.map((need) => need.needId);
    const evidence = uniqueSorted([
      needs.careerStrategy.strategyId,
      needs.portfolioPlan.planId,
      needs.learningPlan.planId,
      needs.opportunityDecision.decisionId,
      ...needs.needs.flatMap((need) => need.evidence)
    ]);
    const initiatives = immutableArray([
      interviewInitiative("PrepareSTAREvidenceMatrix", "Prepare STAR evidence matrix", needIdsFor(needs, "LeadershipStories", "BehavioralReadiness"), evidence, 82),
      interviewInitiative("PrepareProductStrategyNarratives", "Prepare product strategy narratives", needIdsFor(needs, "ProductStrategy", "ExecutiveCommunication"), evidence, 78),
      interviewInitiative("PrepareExecutionStories", "Prepare execution stories", needIdsFor(needs, "ProductExecution"), evidence, 74),
      interviewInitiative("PrepareArchitectureWalkthrough", "Prepare architecture walkthrough", needIdsFor(needs, "TechnicalFluency", "SystemsThinking", "AIProductDesign"), evidence, 70),
      interviewInitiative("PrepareMetricsFramework", "Prepare metrics framework", needIdsFor(needs, "Metrics", "Growth"), evidence, 76),
      interviewInitiative("PreparePortfolioWalkthrough", "Prepare portfolio walkthrough", allNeedIds, evidence, 72),
      interviewInitiative("PrepareLeadershipEvidence", "Prepare leadership evidence", needIdsFor(needs, "LeadershipStories", "StakeholderManagement"), evidence, 80),
      interviewInitiative("PreparePricingFramework", "Prepare pricing framework", needIdsFor(needs, "Pricing"), evidence, 66),
      interviewInitiative("PrepareProductTeardownDiscussion", "Prepare product teardown discussion", needIdsFor(needs, "ProductSense", "CustomerDiscovery"), evidence, 70),
      interviewInitiative("PrepareProductSenseFramework", "Prepare product sense framework", needIdsFor(needs, "ProductSense", "CustomerDiscovery"), evidence, 74),
      interviewInitiative("PrepareEstimationFramework", "Prepare estimation framework", needIdsFor(needs, "Metrics", "Growth"), evidence, 68)
    ].filter((item) => item.readinessNeedIds.length > 0));
    const initiativesId = `interview-initiatives:${needs.needsId}`;
    const confidenceScore = Math.round(initiatives.reduce((sum, item) => sum + item.confidence.value * 100, 0) / Math.max(1, initiatives.length));

    return immutableRecord({
      artifactKind: "InterviewInitiatives" as const,
      initiativesId,
      needsId: needs.needsId,
      careerStrategy: needs.careerStrategy,
      portfolioPlan: needs.portfolioPlan,
      learningPlan: needs.learningPlan,
      opportunityDecision: needs.opportunityDecision,
      initiatives,
      policy: needs.policy,
      preferences: needs.preferences,
      assumptions: needs.assumptions,
      constraints: needs.constraints,
      traceId: needs.traceId,
      confidence: confidenceFromScore(confidenceScore, "InterviewInitiatives confidence follows deterministic readiness initiatives."),
      explanationSummary: createInterviewPlannerExplanationSummary({
        decisionId: initiativesId,
        title: "Interview Initiatives",
        outcome: "InitiativesRepresented",
        confidenceScore,
        evidenceReferenceIds: evidence,
        reasonCodes: initiatives.map((item) => item.kind),
        assumptions: needs.assumptions,
        constraints: needs.constraints.map((constraint) => constraint.label),
        tradeOffs: immutableArray(["initiative breadth is balanced against readiness focus"])
      })
    });
  }
}

function needIdsFor(needs: InterviewNeeds, ...categories: readonly string[]): readonly string[] {
  return immutableArray(needs.needs.filter((need) => categories.includes(need.category)).map((need) => need.needId));
}
