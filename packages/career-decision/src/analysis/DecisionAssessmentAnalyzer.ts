import {
  createConfidenceFactor,
  createGapClassification,
  createScoreBreakdown,
  createScoreContribution,
  createScoreDimension,
  createScorePenalty
} from "@career-companion/product-intelligence";
import { DecisionAssessmentArtifactBuilder } from "../builders";
import type { DecisionAssessment, DecisionContext, DecisionFinding } from "../models";
import { average, confidenceFromScore, immutableArray, immutableRecord, scoreBand, uniqueSorted } from "../shared";

export class DecisionAssessmentAnalyzer {
  private readonly artifactBuilder = new DecisionAssessmentArtifactBuilder();

  analyze(context: DecisionContext): DecisionAssessment {
    const resumeScore = context.resume.score.value;
    const portfolioScore = context.portfolio.score.value;
    const interviewScore = context.interview.readinessScore.overallScore;
    const jobFitScore = context.jobMatchReport.overallFit.overallScore;
    const evidenceScore = average([context.resume.score.evidenceScore, context.portfolio.score.evidenceStrength, context.jobMatchReport.evidenceCoverage.score]);
    const competencyScore = average([context.resume.score.competencyScore, context.jobMatchReport.competencyCoverage.score]);
    const overallScore = Math.round(average([resumeScore, portfolioScore, interviewScore, jobFitScore]));
    const coverage = immutableArray([
      createScoreDimension({ dimension: "Resume", score: resumeScore, weight: 0.2, rationale: "ResumeModel deterministic score." }),
      createScoreDimension({ dimension: "Portfolio", score: portfolioScore, weight: 0.2, rationale: "PortfolioModel deterministic score." }),
      createScoreDimension({ dimension: "Interview", score: interviewScore, weight: 0.2, rationale: "InterviewModel readiness score." }),
      createScoreDimension({ dimension: "JobMatch", score: jobFitScore, weight: 0.25, rationale: "JobMatchReport overall fit." }),
      createScoreDimension({ dimension: "Evidence", score: evidenceScore, weight: 0.1, rationale: "Evidence coverage across canonical outputs." }),
      createScoreDimension({ dimension: "Competency", score: competencyScore, weight: 0.05, rationale: "Competency coverage across canonical outputs." })
    ]);
    const evidenceSufficiency = createScoreDimension({
      dimension: "Evidence Sufficiency",
      score: evidenceScore,
      weight: 0.3,
      rationale: "Evidence sufficiency is derived from Resume, Portfolio, and JobMatch evidence signals."
    });
    const gaps = immutableArray([
      ...context.jobMatchReport.gaps,
      ...context.resume.gaps.map((gap) => createGapClassification({
        gapId: `resume:${gap.gapId}`,
        gapType: gap.reason,
        severity: gap.severity,
        priority: gap.severity === "high" ? "high" : gap.severity,
        rationale: gap.reason
      })),
      ...context.portfolio.gaps.map((gap) => createGapClassification({
        gapId: `portfolio:${gap.gapId}`,
        gapType: gap.description,
        severity: gap.severity,
        priority: gap.severity === "high" ? "high" : gap.severity,
        rationale: gap.recommendedImprovement
      })),
      ...context.interview.gaps.map((gap) => createGapClassification({
        gapId: `interview:${gap.gapId}`,
        gapType: gap.description,
        severity: gap.severity,
        priority: gap.severity === "high" ? "high" : gap.severity,
        rationale: gap.rationale
      }))
    ]);
    const strengths = findings("strength", context.jobMatchReport.strengthAreas, "JobMatch", 82);
    const weaknesses = findings("weakness", gaps.map((gap) => gap.gapType), "Evidence", 58);
    const risks = findings("risk", context.jobMatchReport.riskAreas, "JobMatch", 55);
    const opportunities = findings("opportunity", context.jobModel.requiredCompetencies.map((competency) => competency.name), "Competency", 70);
    const overallReadiness = createScoreBreakdown({
      overallScore,
      band: scoreBand(overallScore),
      dimensions: coverage,
      contributions: [
        createScoreContribution({ source: "resume", amount: resumeScore, rationale: "Resume readiness contribution." }),
        createScoreContribution({ source: "portfolio", amount: portfolioScore, rationale: "Portfolio readiness contribution." }),
        createScoreContribution({ source: "interview", amount: interviewScore, rationale: "Interview readiness contribution." }),
        createScoreContribution({ source: "job-match", amount: jobFitScore, rationale: "Job fit contribution." })
      ],
      penalties: gaps.map((gap) => createScorePenalty({
        code: gap.gapId,
        amount: gap.severity === "high" ? 10 : gap.severity === "medium" ? 6 : 3,
        severity: gap.severity,
        rationale: gap.rationale
      }))
    });
    const confidence = confidenceFromScore(overallScore, "Assessment confidence follows deterministic readiness score.");
    const partial = immutableRecord({
      artifactKind: "DecisionAssessment" as const,
      assessmentId: `decision-assessment:${context.contextId}`,
      contextId: context.contextId,
      overallReadiness,
      strengthAreas: strengths,
      weaknessAreas: weaknesses,
      riskAreas: risks,
      opportunityAreas: opportunities,
      coverage,
      confidence,
      confidenceFactors: immutableArray([
        createConfidenceFactor({ factor: "job-fit", value: jobFitScore / 100, weight: 0.35, rationale: "JobMatch fit confidence." }),
        createConfidenceFactor({ factor: "evidence", value: evidenceScore / 100, weight: 0.3, rationale: "Evidence sufficiency confidence." }),
        createConfidenceFactor({ factor: "interview", value: interviewScore / 100, weight: 0.2, rationale: "Interview readiness confidence." }),
        createConfidenceFactor({ factor: "portfolio", value: portfolioScore / 100, weight: 0.15, rationale: "Portfolio readiness confidence." })
      ]),
      evidenceSufficiency,
      gaps
    });
    const built = this.artifactBuilder.build(partial);

    return immutableRecord({ ...partial, ...built });
  }
}

function findings(prefix: string, labels: readonly string[], area: DecisionFinding["area"], score: number): readonly DecisionFinding[] {
  return immutableArray(uniqueSorted(labels).slice(0, 5).map((label) => immutableRecord({
    findingId: `${prefix}:${label.toLowerCase().replace(/[^a-z0-9]+/gu, "-")}`,
    area,
    label,
    rationale: `${label} was derived from canonical Product Intelligence outputs.`,
    confidence: confidenceFromScore(score, `${prefix} confidence is deterministic.`)
  } satisfies DecisionFinding)));
}
