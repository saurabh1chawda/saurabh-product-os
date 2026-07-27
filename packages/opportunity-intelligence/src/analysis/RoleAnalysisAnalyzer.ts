import { createOpportunityExplanationSummary } from "../explainability";
import type { CompanyAnalysis, RoleAnalysis } from "../models";
import { confidenceFromScore, immutableRecord } from "../shared";
import { breakdown, dimension } from "./scoring";

export class RoleAnalysisAnalyzer {
  analyze(company: CompanyAnalysis): RoleAnalysis {
    const sourceText = `${company.jobModel.source.title ?? ""} ${company.jobModel.source.description} ${company.jobModel.responsibilities.map((item) => item.statement).join(" ")} ${company.jobModel.businessObjectives.map((item) => item.statement).join(" ")}`;
    const roleSignals = company.jobModel.signals.filter((signal) => signal.category === "role").map((signal) => ({
      signalId: signal.signalId,
      category: "role" as const,
      label: signal.category,
      value: signal.value,
      weight: signal.confidence.value
    }));
    const dimensions = {
      ownership: dimension("Ownership", sourceText, roleSignals, textDefault(sourceText, "own", 68), 0.12),
      productScope: dimension("Product Scope", sourceText, roleSignals, company.jobModel.responsibilities.length > 0 ? 70 : 45, 0.12),
      platformVsFeature: dimension("Platform Scope", sourceText, roleSignals, textDefault(sourceText, "platform", 72), 0.1),
      leadershipExpectations: dimension("Leadership Expectations", sourceText, roleSignals, textDefault(sourceText, "lead", 65), 0.1),
      technicalComplexity: dimension("Technical Complexity", sourceText, roleSignals, company.jobModel.domain.classification === "AI" ? 72 : 55, 0.1),
      crossFunctionalExposure: dimension("Cross-functional Exposure", sourceText, roleSignals, textDefault(sourceText, "cross functional", 62), 0.1),
      experimentationCulture: dimension("Experimentation Culture", sourceText, roleSignals, textDefault(sourceText, "experiment", 58), 0.08),
      aiExposure: dimension("AI Exposure", sourceText, roleSignals, company.jobModel.domain.classification === "AI" ? 82 : 40, 0.1),
      productInfluence: dimension("Product Influence", sourceText, roleSignals, company.jobModel.function.classification.includes("Product") ? 75 : 45, 0.1),
      decisionAuthority: dimension("Decision Authority", sourceText, roleSignals, textDefault(sourceText, "decision", 60), 0.08)
    };
    const scoreBreakdown = breakdown("role", Object.values(dimensions));
    const analysisId = `role-analysis:${company.analysisId}`;

    return immutableRecord({
      artifactKind: "RoleAnalysis" as const,
      analysisId,
      companyAnalysisId: company.analysisId,
      resume: company.resume,
      jobModel: company.jobModel,
      portfolio: company.portfolio,
      policy: company.policy,
      ...dimensions,
      scoreBreakdown,
      companyScore: company.scoreBreakdown,
      assumptions: company.assumptions,
      constraints: company.constraints,
      traceId: company.traceId,
      confidence: confidenceFromScore(scoreBreakdown.overallScore, "Role confidence follows deterministic role-quality dimensions."),
      explanationSummary: createOpportunityExplanationSummary({
        decisionId: analysisId,
        title: "Role Analysis",
        outcome: "WorthExploring",
        confidenceScore: scoreBreakdown.overallScore,
        evidenceReferenceIds: [company.jobModel.artifact.artifactId],
        reasonCodes: scoreBreakdown.dimensions.map((item) => item.dimension),
        assumptions: company.assumptions,
        constraints: company.constraints
      })
    });
  }
}

function textDefault(text: string, signal: string, score: number): number {
  return text.toLowerCase().includes(signal) ? score : 45;
}
