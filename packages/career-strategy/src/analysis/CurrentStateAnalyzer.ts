import { createCareerStrategyExplanationSummary } from "../explainability";
import type { CareerGoal, CurrentState } from "../models";
import { confidenceFromScore, immutableRecord, textMatch } from "../shared";
import { breakdown, dimension } from "./scoring";

export class CurrentStateAnalyzer {
  analyze(goal: CareerGoal): CurrentState {
    const report = goal.decisionReport;
    const decision = goal.opportunityDecision;
    const summaryText = `${report.summary.headline} ${report.summary.topStrengths.join(" ")} ${report.summary.topRisks.join(" ")} ${decision.candidateStrengths.join(" ")} ${decision.supportingEvidence.join(" ")}`;
    const dimensions = {
      experience: dimension("Experience", scoreFromReadiness(report.assessment.overallReadiness.overallScore), 0.12, [report.assessment.assessmentId]),
      leadership: dimension("Leadership", textMatch(summaryText, "leadership") ? 78 : 52, 0.1, report.summary.topStrengths),
      aiCapability: dimension("AI Capability", textMatch(`${summaryText} ${goal.targetDomains.join(" ")}`, "ai") ? 82 : 45, 0.12, goal.targetDomains),
      portfolioMaturity: dimension("Portfolio Maturity", coverageScore(report.assessment.coverage, "Portfolio"), 0.1, [report.context.portfolio.artifact.artifactId]),
      resumeMaturity: dimension("Resume Maturity", coverageScore(report.assessment.coverage, "Resume"), 0.1, [report.context.resume.artifact.artifactId]),
      interviewReadiness: dimension("Interview Readiness", coverageScore(report.assessment.coverage, "Interview"), 0.1, [report.context.interview.artifact.artifactId]),
      marketPositioning: dimension("Market Positioning", decision.scoreSummary.overallScore, 0.12, [decision.decisionId]),
      productBreadth: dimension("Product Breadth", textMatch(summaryText, "product") ? 76 : 52, 0.08, report.summary.topStrengths),
      productDepth: dimension("Product Depth", textMatch(summaryText, "platform") ? 78 : 52, 0.08, report.summary.topStrengths),
      evidenceMaturity: dimension("Evidence Maturity", report.assessment.evidenceSufficiency.score, 0.08, [report.assessment.assessmentId])
    };
    const scoreBreakdown = breakdown("current-state", Object.values(dimensions));
    const stateId = `current-state:${goal.goalId}`;

    return immutableRecord({
      artifactKind: "CurrentState" as const,
      stateId,
      goalId: goal.goalId,
      opportunityDecision: goal.opportunityDecision,
      decisionReport: goal.decisionReport,
      targetRole: goal.targetRole,
      targetDomains: goal.targetDomains,
      policy: goal.policy,
      ...dimensions,
      scoreBreakdown,
      assumptions: goal.assumptions,
      constraints: goal.constraints,
      traceId: goal.traceId,
      confidence: confidenceFromScore(scoreBreakdown.overallScore, "CurrentState confidence follows Career Decision readiness and Opportunity Intelligence signal."),
      explanationSummary: createCareerStrategyExplanationSummary({
        decisionId: stateId,
        title: "Current State",
        outcome: "BalancedGrowth",
        confidenceScore: scoreBreakdown.overallScore,
        evidenceReferenceIds: [report.artifact.artifactId, decision.artifact.artifactId],
        reasonCodes: scoreBreakdown.dimensions.map((item) => item.dimension),
        assumptions: goal.assumptions,
        constraints: goal.constraints
      })
    });
  }
}

function scoreFromReadiness(score: number): number {
  return Math.max(0, Math.min(100, score));
}

function coverageScore(coverage: readonly { readonly dimension: string; readonly score: number }[], label: string): number {
  return coverage.find((item) => item.dimension.toLowerCase().includes(label.toLowerCase()))?.score ?? 55;
}
