import { createPortfolioPlannerExplanationSummary } from "../explainability";
import type { EvidenceNeeds, PortfolioInitiatives } from "../models";
import { confidenceFromScore, immutableArray, immutableRecord, uniqueSorted } from "../shared";
import { initiative } from "./scoring";

export class PortfolioInitiativesAnalyzer {
  analyze(needs: EvidenceNeeds): PortfolioInitiatives {
    const groupedNeedIds = needs.needs.map((need) => need.needId);
    const references = uniqueSorted([
      needs.portfolio.artifact.artifactId,
      ...needs.needs.flatMap((need) => need.supportingReferences)
    ]);
    const initiatives = immutableArray([
      initiative("BuildEvidence", "Build missing strategic evidence", groupedNeedIds.filter((id) => id.includes("technical") || id.includes("leadership")), references, 72),
      initiative("ImproveEvidence", "Improve existing portfolio evidence", groupedNeedIds, references, 76),
      initiative("QuantifyImpact", "Quantify business outcomes", groupedNeedIds.filter((id) => id.includes("impact") || id.includes("evidence")), references, 78),
      initiative("StrengthenCaseStudy", "Strengthen flagship case studies", groupedNeedIds, references, 74),
      initiative("PublishEvidence", "Prepare publish-ready evidence", groupedNeedIds.filter((id) => id.includes("portfolio")), references, needs.portfolio.score.value >= 80 ? 84 : 64),
      initiative("IncreaseStrategicCoverage", "Increase strategic coverage", groupedNeedIds, references, 70)
    ]);
    const initiativesId = `portfolio-initiatives:${needs.needsId}`;
    const confidenceScore = Math.round(initiatives.reduce((sum, item) => sum + item.confidence.value * 100, 0) / initiatives.length);

    return immutableRecord({
      artifactKind: "PortfolioInitiatives" as const,
      initiativesId,
      needsId: needs.needsId,
      careerStrategy: needs.careerStrategy,
      portfolio: needs.portfolio,
      opportunityDecision: needs.opportunityDecision,
      initiatives,
      policy: needs.policy,
      assumptions: needs.assumptions,
      constraints: needs.constraints,
      traceId: needs.traceId,
      confidence: confidenceFromScore(confidenceScore, "PortfolioInitiatives confidence follows deterministic evidence initiatives."),
      explanationSummary: createPortfolioPlannerExplanationSummary({
        decisionId: initiativesId,
        title: "Portfolio Initiatives",
        outcome: "InitiativesRepresented",
        confidenceScore,
        evidenceReferenceIds: references,
        reasonCodes: initiatives.map((item) => item.kind),
        tradeOffs: immutableArray(["initiative breadth is balanced against portfolio evidence focus"]),
        assumptions: needs.assumptions,
        constraints: needs.constraints.map((constraint) => constraint.label)
      })
    });
  }
}
