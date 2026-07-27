import type { CareerArtifact } from "@career-companion/career-artifacts";
import { createOpportunityExplanationSummary } from "../explainability";
import type { CandidateFit, OpportunityDecision } from "../models";
import { confidenceFromScore, immutableArray, immutableRecord, uniqueSorted } from "../shared";
import { alternativesFor, confidenceFactors, outcomeFor, priorityForDecision, recommendationsFromGaps } from "./scoring";

export class OpportunityDecisionAnalyzer {
  analyze(fit: CandidateFit): OpportunityDecision {
    const weightedScore = Math.round(
      fit.companyScore.overallScore * fit.policy.companySignalWeight +
      fit.roleScore.overallScore * fit.policy.roleSignalWeight +
      fit.marketScore.overallScore * fit.policy.marketSignalWeight +
      fit.scoreBreakdown.overallScore * fit.policy.fitSignalWeight
    );
    const outcome = outcomeFor(weightedScore, fit.policy);
    const decisionId = `opportunity-decision:${fit.fitId}`;
    const risks = uniqueSorted([
      ...fit.gaps.map((gap) => gap.gapType),
      ...(fit.marketScore.overallScore < 50 ? ["weak-market-signal"] : []),
      ...(fit.companyScore.overallScore < 50 ? ["weak-company-signal"] : [])
    ]);
    const opportunityStrengths = uniqueSorted([
      ...(fit.companyScore.overallScore >= 70 ? ["company-context"] : []),
      ...(fit.roleScore.overallScore >= 70 ? ["role-quality"] : []),
      ...(fit.marketScore.overallScore >= 70 ? ["market-signal"] : [])
    ]);
    const candidateStrengths = uniqueSorted(fit.scoreBreakdown.dimensions.filter((dimension) => dimension.score >= 70).map((dimension) => dimension.dimension));
    const opportunityWeaknesses = uniqueSorted([
      ...(fit.companyScore.overallScore < 55 ? ["company-uncertainty"] : []),
      ...(fit.roleScore.overallScore < 55 ? ["role-uncertainty"] : []),
      ...(fit.marketScore.overallScore < 55 ? ["market-uncertainty"] : [])
    ]);
    const recommendations = recommendationsFromGaps(fit.gaps);
    const partial = immutableRecord({
      artifactKind: "OpportunityDecision" as const,
      decisionId,
      fitId: fit.fitId,
      outcome,
      confidence: confidenceFromScore(weightedScore, "Opportunity decision confidence follows weighted company, role, market and candidate-fit scores."),
      supportingEvidence: uniqueSorted([...opportunityStrengths, ...candidateStrengths]),
      risks,
      assumptions: fit.assumptions,
      constraints: fit.constraints,
      opportunityStrengths,
      opportunityWeaknesses,
      candidateStrengths,
      candidateGaps: fit.gaps,
      scoreSummary: immutableRecord({
        ...fit.scoreBreakdown,
        overallScore: weightedScore,
        band: fit.scoreBreakdown.band
      }),
      recommendationPriority: recommendations[0]?.priority ?? priorityForDecision(outcome, weightedScore),
      recommendations,
      alternativeOutcomesConsidered: alternativesFor(outcome),
      confidenceFactors: immutableArray([]),
      traceId: fit.traceId,
      artifact: opportunityArtifact(decisionId, outcome, weightedScore),
      explanationSummary: createOpportunityExplanationSummary({
        decisionId,
        title: "Opportunity Decision",
        outcome,
        confidenceScore: weightedScore,
        evidenceReferenceIds: [fit.resume.artifact.artifactId, fit.portfolio.artifact.artifactId, fit.jobModel.artifact.artifactId],
        reasonCodes: uniqueSorted([outcome, ...opportunityStrengths, ...risks]),
        assumptions: fit.assumptions,
        constraints: fit.constraints
      })
    });

    return immutableRecord({ ...partial, confidenceFactors: confidenceFactors(partial) });
  }
}

function opportunityArtifact(decisionId: string, outcome: string, score: number): CareerArtifact {
  return immutableRecord({
    artifactId: `artifact:${decisionId}`,
    artifactType: "CareerReport",
    metadata: immutableRecord({
      artifactId: `artifact:${decisionId}`,
      artifactType: "CareerReport",
      title: "Opportunity Decision",
      createdAt: "1970-01-01T00:00:00.000Z",
      source: "opportunity-intelligence",
      version: 1,
      references: immutableArray([])
    }),
    summary: immutableRecord({
      headline: outcome,
      summary: `Opportunity decision score ${score}.`,
      references: immutableArray([])
    }),
    sections: immutableArray([])
  });
}
