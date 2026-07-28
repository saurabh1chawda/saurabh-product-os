import { createLearningPlannerExplanationSummary } from "../explainability";
import type { CapabilityNeeds, LearningInitiatives } from "../models";
import { confidenceFromScore, immutableArray, immutableRecord, uniqueSorted } from "../shared";
import { learningInitiative } from "./scoring";

export class LearningInitiativesAnalyzer {
  analyze(needs: CapabilityNeeds): LearningInitiatives {
    const allNeedIds = needs.needs.map((need) => need.needId);
    const evidence = uniqueSorted([
      needs.careerStrategy.strategyId,
      needs.portfolioPlan.planId,
      needs.opportunityDecision.decisionId,
      ...needs.needs.flatMap((need) => need.supportingEvidence)
    ]);
    const initiatives = immutableArray([
      learningInitiative("BuildAIPrototype", "Build AI prototype", needIdsFor(needs, "AIProductManagement"), evidence, 78),
      learningInitiative("PerformProductTeardown", "Perform product teardown", allNeedIds, evidence, 70),
      learningInitiative("ConductCustomerInterviews", "Conduct customer interviews", needIdsFor(needs, "CustomerDiscovery"), evidence, 72),
      learningInitiative("WriteStrategyMemo", "Write strategy memo", needIdsFor(needs, "ProductStrategy"), evidence, 76),
      learningInitiative("CreatePRD", "Create PRD", allNeedIds, evidence, 68),
      learningInitiative("DesignExperimentationFramework", "Design experimentation framework", needIdsFor(needs, "Experimentation"), evidence, 66),
      learningInitiative("AnalyzeProductionMetrics", "Analyze production metrics", needIdsFor(needs, "ProductAnalytics"), evidence, 74),
      learningInitiative("PublishTechnicalArticle", "Publish technical article", needIdsFor(needs, "TechnicalFluency"), evidence, 64),
      learningInitiative("BuildAnalyticsDashboard", "Build analytics dashboard", needIdsFor(needs, "ProductAnalytics"), evidence, 68),
      learningInitiative("PerformCompetitiveAnalysis", "Perform competitive analysis", needIdsFor(needs, "DomainExpertise"), evidence, 70),
      learningInitiative("DesignAIWorkflow", "Design AI workflow", needIdsFor(needs, "AIProductManagement"), evidence, 76),
      learningInitiative("CreateDecisionFramework", "Create decision framework", needIdsFor(needs, "DecisionMaking"), evidence, 78)
    ].filter((item) => item.capabilityNeedIds.length > 0));
    const initiativesId = `learning-initiatives:${needs.needsId}`;
    const confidenceScore = Math.round(initiatives.reduce((sum, item) => sum + item.confidence.value * 100, 0) / Math.max(1, initiatives.length));

    return immutableRecord({
      artifactKind: "LearningInitiatives" as const,
      initiativesId,
      needsId: needs.needsId,
      careerStrategy: needs.careerStrategy,
      portfolioPlan: needs.portfolioPlan,
      opportunityDecision: needs.opportunityDecision,
      initiatives,
      policy: needs.policy,
      preferences: needs.preferences,
      assumptions: needs.assumptions,
      constraints: needs.constraints,
      traceId: needs.traceId,
      confidence: confidenceFromScore(confidenceScore, "LearningInitiatives confidence follows deterministic capability initiatives."),
      explanationSummary: createLearningPlannerExplanationSummary({
        decisionId: initiativesId,
        title: "Learning Initiatives",
        outcome: "InitiativesRepresented",
        confidenceScore,
        evidenceReferenceIds: evidence,
        reasonCodes: initiatives.map((item) => item.kind),
        tradeOffs: immutableArray(["initiative breadth is balanced against capability-development focus"]),
        assumptions: needs.assumptions,
        constraints: needs.constraints.map((constraint) => constraint.label)
      })
    });
  }
}

function needIdsFor(needs: CapabilityNeeds, category: string): readonly string[] {
  return immutableArray(needs.needs.filter((need) => need.category === category).map((need) => need.needId));
}
