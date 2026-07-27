import { createNetworkingPlannerExplanationSummary } from "../explainability";
import type { NetworkingInitiatives, NetworkingNeeds } from "../models";
import { confidenceFromScore, immutableArray, immutableRecord, uniqueSorted } from "../shared";
import { networkingInitiative } from "./scoring";

export class NetworkingInitiativesAnalyzer {
  analyze(needs: NetworkingNeeds): NetworkingInitiatives {
    const evidence = uniqueSorted([
      needs.careerStrategy.strategyId,
      needs.portfolioPlan.planId,
      needs.learningPlan.planId,
      needs.interviewPlan.planId,
      needs.opportunityDecision.decisionId,
      ...needs.needs.flatMap((need) => need.evidence)
    ]);
    const initiatives = immutableArray([
      networkingInitiative("IncreaseProfessionalVisibility", "Increase professional visibility", needIdsFor(needs, "ProfessionalVisibility", "ThoughtLeadership"), evidence, 80),
      networkingInitiative("PublishAIProductContent", "Publish AI product content", needIdsFor(needs, "AICommunityParticipation", "ThoughtLeadership"), evidence, 76),
      networkingInitiative("AttendProductMeetups", "Attend product meetups", needIdsFor(needs, "IndustryRelationships", "PeerNetwork"), evidence, 68),
      networkingInitiative("StrengthenRecruiterNetwork", "Strengthen recruiter network", needIdsFor(needs, "RecruiterExposure"), evidence, 72),
      networkingInitiative("ExpandHiringManagerNetwork", "Expand hiring manager network", needIdsFor(needs, "HiringManagerExposure"), evidence, 74),
      networkingInitiative("ContributeToCommunities", "Contribute to communities", needIdsFor(needs, "AICommunityParticipation", "PeerNetwork", "DomainCredibility"), evidence, 70),
      networkingInitiative("PublishPortfolio", "Publish portfolio", needIdsFor(needs, "PortfolioAwareness"), evidence, 78),
      networkingInitiative("EngageIndustryDiscussions", "Engage industry discussions", needIdsFor(needs, "IndustryRelationships", "DomainCredibility"), evidence, 70),
      networkingInitiative("BuildReferralNetwork", "Build referral network", needIdsFor(needs, "Referrals"), evidence, 76),
      networkingInitiative("ParticipateInConferences", "Participate in conferences", needIdsFor(needs, "ConferenceParticipation", "DomainCredibility"), evidence, 66)
    ].filter((item) => item.networkingNeedIds.length > 0 || item.kind === "IncreaseProfessionalVisibility"));
    const initiativesId = `networking-initiatives:${needs.needsId}`;
    const confidenceScore = Math.round(initiatives.reduce((sum, item) => sum + item.confidence.value * 100, 0) / Math.max(1, initiatives.length));

    return immutableRecord({
      artifactKind: "NetworkingInitiatives" as const,
      initiativesId,
      needsId: needs.needsId,
      careerStrategy: needs.careerStrategy,
      portfolioPlan: needs.portfolioPlan,
      learningPlan: needs.learningPlan,
      interviewPlan: needs.interviewPlan,
      opportunityDecision: needs.opportunityDecision,
      initiatives,
      policy: needs.policy,
      preferences: needs.preferences,
      assumptions: needs.assumptions,
      constraints: needs.constraints,
      traceId: needs.traceId,
      confidence: confidenceFromScore(confidenceScore, "NetworkingInitiatives confidence follows deterministic networking initiatives."),
      explanationSummary: createNetworkingPlannerExplanationSummary({
        decisionId: initiativesId,
        title: "Networking Initiatives",
        outcome: "InitiativesRepresented",
        confidenceScore,
        evidenceReferenceIds: evidence,
        reasonCodes: initiatives.map((item) => item.kind),
        assumptions: needs.assumptions,
        constraints: needs.constraints.map((constraint) => constraint.label),
        tradeOffs: immutableArray(["initiative breadth is balanced against networking focus"])
      })
    });
  }
}

function needIdsFor(needs: NetworkingNeeds, ...categories: readonly string[]): readonly string[] {
  return immutableArray(needs.needs.filter((need) => categories.includes(need.category)).map((need) => need.needId));
}
