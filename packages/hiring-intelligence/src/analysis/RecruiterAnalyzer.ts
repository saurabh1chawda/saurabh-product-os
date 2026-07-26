import {
  createConfidenceFactor,
  createGapClassification,
  createRankingReason,
  createScoreBreakdown,
  createScoreContribution,
  createScoreDimension,
  createScorePenalty
} from "@career-companion/product-intelligence";
import { RecruiterArtifactBuilder } from "../builders";
import type { HiringPipeline, HiringSignal, RecruiterEvaluation } from "../models";
import { createHiringRecommendations } from "../recommendations";
import { average, confidenceFromScore, immutableArray, immutableRecord, scoreBand } from "../shared";

export class RecruiterAnalyzer {
  private readonly artifactBuilder = new RecruiterArtifactBuilder();

  analyze(pipeline: HiringPipeline): RecruiterEvaluation {
    const report = pipeline.decisionReport;
    const resumeScore = report.context.resume.score.value;
    const jobFit = report.context.jobMatchReport.overallFit.overallScore;
    const evidenceScore = report.assessment.evidenceSufficiency.score;
    const readiness = report.assessment.overallReadiness.overallScore;
    const riskPenalty = Math.min(report.assessment.riskAreas.length * 8, 24);
    const signals = immutableArray([
      signal("career-progression", "CareerProgression", "Career progression", readiness, ["decision-assessment"]),
      signal("resume-clarity", "ResumeClarity", "Resume clarity", resumeScore, [report.context.resume.artifact.artifactId]),
      signal("business-impact", "BusinessImpact", "Business impact", report.context.jobMatchReport.evidenceCoverage.score, ["job-match:evidence"]),
      signal("evidence-quality", "EvidenceQuality", "Evidence quality", evidenceScore, ["decision-assessment:evidence"]),
      signal("risk-signals", "RiskSignals", "Risk signals", 100 - riskPenalty, report.assessment.riskAreas.map((risk) => risk.label)),
      signal("communication", "Communication", "Communication", report.context.interview.readinessScore.overallScore, [report.context.interview.artifact.artifactId]),
      signal("stability", "Stability", "Stability", Math.round(average([readiness, resumeScore])), ["decision-report"]),
      signal("transferability", "Transferability", "Transferability", jobFit, [report.context.jobMatchReport.artifact.artifactId])
    ]);
    const score = scoreFor("Recruiter Evaluation", signals);
    const gaps = gapsFor(signals);
    const confidence = confidenceFromScore(score.overallScore, "Recruiter confidence is derived from deterministic screen dimensions.");
    const partial = immutableRecord({
      artifactKind: "RecruiterEvaluation" as const,
      evaluationId: `recruiter-evaluation:${pipeline.pipelineId}`,
      pipelineId: pipeline.pipelineId,
      decisionTrace: pipeline.decisionTrace,
      proceedToHiringManager: score.overallScore >= 60 && jobFit >= 55,
      careerProgression: signals[0],
      resumeClarity: signals[1],
      businessImpact: signals[2],
      evidenceQuality: signals[3],
      riskSignals: signals[4],
      communication: signals[5],
      stability: signals[6],
      transferability: signals[7],
      score,
      gaps,
      recommendations: createHiringRecommendations(signals),
      confidence,
      confidenceFactors: immutableArray(signals.map((item) => createConfidenceFactor({
        factor: item.area,
        value: item.score.score / 100,
        weight: item.score.weight,
        rationale: item.rankingReason.statement
      })))
    });
    const built = this.artifactBuilder.build(partial);

    return immutableRecord({ ...partial, ...built });
  }
}

export function signal(
  id: string,
  area: HiringSignal["area"],
  label: string,
  score: number,
  evidence: readonly string[],
  weight = 0.125
): HiringSignal {
  const dimension = createScoreDimension({
    dimension: label,
    score,
    weight,
    rationale: `${label} derived from canonical Career Decision inputs.`
  });

  return immutableRecord({
    signalId: `hiring-signal:${id}`,
    area,
    label,
    evidence: immutableArray(evidence),
    score: dimension,
    confidence: confidenceFromScore(dimension.score, `${label} confidence follows deterministic signal score.`),
    rankingReason: createRankingReason({
      code: `hiring:${id}`,
      statement: `${label} contributes to the hiring pipeline stage.`,
      weight
    })
  });
}

export function scoreFor(source: string, signals: readonly HiringSignal[]) {
  const overallScore = Math.round(average(signals.map((item) => item.score.score * item.score.weight)) / average(signals.map((item) => item.score.weight || 1)));
  const gaps = gapsFor(signals);
  return createScoreBreakdown({
    overallScore,
    band: scoreBand(overallScore),
    dimensions: signals.map((item) => item.score),
    contributions: signals.map((item) => createScoreContribution({
      source: item.area,
      amount: item.score.score,
      rationale: `${item.label} score contribution for ${source}.`
    })),
    penalties: gaps.map((gap) => createScorePenalty({
      code: gap.gapType,
      amount: gap.severity === "high" ? 10 : gap.severity === "medium" ? 6 : 3,
      severity: gap.severity,
      rationale: gap.rationale
    }))
  });
}

export function gapsFor(signals: readonly HiringSignal[]) {
  return immutableArray(signals
    .filter((item) => item.score.score < 70)
    .map((item) => createGapClassification({
      gapId: `hiring-gap:${item.signalId}`,
      gapType: item.label,
      severity: item.score.score < 45 ? "high" : item.score.score < 65 ? "medium" : "low",
      priority: item.score.score < 45 ? "critical" : item.score.score < 65 ? "high" : "medium",
      rationale: `${item.label} scored ${item.score.score}.`
    })));
}
