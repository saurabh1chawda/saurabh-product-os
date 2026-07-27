import { createOpportunityExplanationSummary } from "../explainability";
import type { CompanyAnalysis, OpportunityContext } from "../models";
import { confidenceFromScore, immutableRecord } from "../shared";
import { breakdown, dimension } from "./scoring";

export class CompanyAnalysisAnalyzer {
  analyze(context: OpportunityContext): CompanyAnalysis {
    const sourceText = `${context.jobModel.source.company ?? ""} ${context.jobModel.industry} ${context.jobModel.source.description} ${context.opportunitySignals.map((signal) => `${signal.label} ${signal.value}`).join(" ")}`;
    const companySignals = context.opportunitySignals.filter((signal) => signal.category === "company");
    const dimensions = {
      companySize: dimension("Company Size", sourceText, companySignals, 55, 0.12),
      fundingStage: dimension("Funding Stage", sourceText, companySignals, 50, 0.1),
      businessModel: dimension("Business Model", sourceText, companySignals, 60, 0.14),
      productMaturity: dimension("Product Maturity", sourceText, companySignals, 55, 0.16),
      engineeringMaturity: dimension("Engineering Maturity", sourceText, companySignals, 50, 0.14),
      aiMaturityIndicators: dimension("AI Maturity", sourceText, companySignals, context.jobModel.domain.classification === "AI" ? 72 : 45, 0.14),
      remotePolicy: dimension("Remote Policy", `${sourceText} ${context.jobModel.location}`, companySignals, context.jobModel.location === "Remote" ? 75 : 50, 0.1),
      publicStabilityIndicators: dimension("Public Stability", sourceText, companySignals, 55, 0.1)
    };
    const scoreBreakdown = breakdown("company", Object.values(dimensions));
    const analysisId = `company-analysis:${context.contextId}`;

    return immutableRecord({
      artifactKind: "CompanyAnalysis" as const,
      analysisId,
      contextId: context.contextId,
      resume: context.resume,
      jobModel: context.jobModel,
      portfolio: context.portfolio,
      policy: context.policy,
      ...dimensions,
      scoreBreakdown,
      assumptions: context.assumptions,
      constraints: context.constraints,
      traceId: context.traceId,
      confidence: confidenceFromScore(scoreBreakdown.overallScore, "Company confidence follows supplied deterministic company signals."),
      explanationSummary: createOpportunityExplanationSummary({
        decisionId: analysisId,
        title: "Company Analysis",
        outcome: "WorthExploring",
        confidenceScore: scoreBreakdown.overallScore,
        evidenceReferenceIds: context.sourceReferences.map((reference) => reference.referenceId),
        reasonCodes: scoreBreakdown.dimensions.map((item) => item.dimension),
        assumptions: context.assumptions,
        constraints: context.constraints
      })
    });
  }
}
