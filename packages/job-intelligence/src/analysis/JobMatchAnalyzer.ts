import {
  createConfidenceFactor,
  createGapClassification,
  createGapEvidence,
  createMissingEvidenceDescriptor,
  createScoreBreakdown,
  createScoreContribution,
  createScoreDimension,
  createScorePenalty,
  type GapClassification,
  type MissingEvidenceDescriptor
} from "@career-companion/product-intelligence";
import { JobMatchArtifactBuilder } from "../builders";
import type {
  CandidateIntelligence,
  DimensionMatch,
  EvaluationDimension,
  EvaluationFramework,
  HiringModel,
  JobMatchReport,
  JobModel
} from "../models";
import { createJobRecommendations } from "../recommendations";
import { artifactReference, clamp, confidenceFromScore, immutableArray, immutableRecord, normalizeText, scoreBand, uniqueSorted } from "../shared";

export class JobMatchAnalyzer {
  private readonly artifactBuilder = new JobMatchArtifactBuilder();

  analyze(input: {
    readonly candidate: CandidateIntelligence;
    readonly jobModel: JobModel;
    readonly hiringModel: HiringModel;
    readonly evaluationFramework: EvaluationFramework;
  }): JobMatchReport {
    const dimensionScores = immutableArray(input.evaluationFramework.dimensions.map((dimension) => {
      return matchDimension(dimension, input.candidate);
    }));
    const missingEvidence = uniqueSorted(dimensionScores.flatMap((dimension) => dimension.missingEvidence));
    const gaps = immutableArray(dimensionScores
      .filter((dimension) => dimension.score < 70)
      .map((dimension) => gapFor(dimension)));
    const gapEvidence = immutableArray(dimensionScores.map((dimension) => dimension.gapEvidence));
    const evidenceCoverageValue = average(dimensionScores.map((dimension) => dimension.evidenceCoverage));
    const competencyCoverageValue = average(dimensionScores.map((dimension) => dimension.competencyCoverage));
    const overall = Math.round(average(dimensionScores.map((dimension) => dimension.score)));
    const evidenceCoverage = createScoreDimension({
      dimension: "Evidence Coverage",
      score: evidenceCoverageValue,
      weight: 0.45,
      rationale: "Coverage of expected evidence across evaluation dimensions."
    });
    const competencyCoverage = createScoreDimension({
      dimension: "Competency Coverage",
      score: competencyCoverageValue,
      weight: 0.55,
      rationale: "Coverage of required role competencies."
    });
    const overallFit = createScoreBreakdown({
      overallScore: overall,
      band: scoreBand(overall),
      dimensions: [evidenceCoverage, competencyCoverage, ...dimensionScores.map((dimension) => {
        return createScoreDimension({
          dimension: dimension.dimension,
          score: dimension.score,
          weight: input.evaluationFramework.dimensions.find((item) => item.dimensionId === dimension.dimensionId)?.weight ?? 0,
          rationale: "Dimension score derived from deterministic evidence and competency coverage."
        });
      })],
      contributions: [
        createScoreContribution({ source: "competencies", amount: competencyCoverageValue, rationale: "Candidate competency overlap." }),
        createScoreContribution({ source: "evidence", amount: evidenceCoverageValue, rationale: "Candidate evidence overlap." })
      ],
      penalties: gaps.map((gap) => createScorePenalty({
        code: gap.gapType,
        amount: gap.severity === "high" ? 10 : gap.severity === "medium" ? 6 : 3,
        severity: gap.severity,
        rationale: gap.rationale
      }))
    });
    const recommendations = createJobRecommendations(dimensionScores);
    const confidence = confidenceFromScore(overall, "Job match confidence is derived from deterministic dimension scores.");
    const partial = immutableRecord({
      artifactKind: "JobMatchReport" as const,
      candidateId: input.candidate.candidateId,
      jobModelId: input.jobModel.source.jobDescriptionId,
      hiringModelId: input.hiringModel.jobModelId,
      evaluationFrameworkId: input.evaluationFramework.jobModelId,
      overallFit,
      dimensionScores,
      evidenceCoverage,
      competencyCoverage,
      missingEvidence,
      gaps,
      gapEvidence,
      recommendations,
      riskAreas: immutableArray(gaps.map((gap) => gap.gapType)),
      strengthAreas: immutableArray(dimensionScores.filter((dimension) => dimension.score >= 75).map((dimension) => dimension.dimension)),
      confidence,
      confidenceFactors: immutableArray([
        createConfidenceFactor({ factor: "evidence-coverage", value: evidenceCoverage.score / 100, weight: 0.45, rationale: "Expected evidence coverage." }),
        createConfidenceFactor({ factor: "competency-coverage", value: competencyCoverage.score / 100, weight: 0.55, rationale: "Required competency coverage." })
      ])
    });
    const built = this.artifactBuilder.build(partial, input.jobModel.source);

    return immutableRecord({ ...partial, ...built });
  }
}

function matchDimension(dimension: EvaluationDimension, candidate: CandidateIntelligence): DimensionMatch {
  const dimensionText = normalizeText(dimension.dimension);
  const competencyHit = candidate.competencies.some((competency) => dimensionText.includes(normalizeText(competency)) || normalizeText(competency).includes(dimensionText));
  const skillHit = candidate.skills.some((skill) => dimensionText.includes(normalizeText(skill)) || normalizeText(skill).includes(dimensionText));
  const expectedEvidence = dimension.expectedEvidence.map((expectation) => expectation.evidenceType);
  const evidenceHits = expectedEvidence.filter((expected) => {
    return candidate.evidence.some((evidence) => normalizeText(evidence).includes(normalizeText(expected)) || normalizeText(evidence).includes(normalizeText(dimension.dimension)));
  });
  const competencyCoverage = competencyHit ? 100 : skillHit ? 65 : 25;
  const evidenceCoverage = expectedEvidence.length === 0 ? 80 : (evidenceHits.length / expectedEvidence.length) * 100;
  const score = Math.round(clamp((competencyCoverage * 0.55) + (evidenceCoverage * 0.45)));
  const missingEvidence = uniqueSorted(expectedEvidence.filter((expected) => !evidenceHits.includes(expected)));
  const gapEvidence = createGapEvidence({
    supportingEvidence: [],
    missingEvidence: missingEvidence.map((missing) => missingDescriptor(dimension, missing)),
    confidence: confidenceFromScore(score, "Gap evidence confidence derived from dimension fit score."),
    constraintReferences: [artifactReference(dimension.dimensionId, "evaluation-dimension", dimension.dimension)],
    explanationReference: artifactReference(`explanation:${dimension.dimensionId}`, "explanation", dimension.dimension)
  });

  return immutableRecord({
    dimensionId: dimension.dimensionId,
    dimension: dimension.dimension,
    score,
    evidenceCoverage: Math.round(evidenceCoverage),
    competencyCoverage,
    missingEvidence,
    confidence: confidenceFromScore(score, "Dimension confidence derived from deterministic candidate overlap."),
    gapEvidence
  });
}

function missingDescriptor(dimension: EvaluationDimension, evidenceType: string): MissingEvidenceDescriptor {
  return createMissingEvidenceDescriptor({
    descriptorId: `missing:${dimension.dimensionId}:${evidenceType}`,
    evidenceType,
    description: `${dimension.dimension} expects ${evidenceType} evidence.`,
    reference: artifactReference(dimension.dimensionId, "evaluation-dimension", dimension.dimension)
  });
}

function gapFor(match: DimensionMatch): GapClassification {
  return createGapClassification({
    gapId: `gap:${match.dimensionId}`,
    gapType: match.dimension,
    severity: match.score < 40 ? "high" : match.score < 65 ? "medium" : "low",
    priority: match.score < 40 ? "critical" : match.score < 65 ? "high" : "medium",
    rationale: `Dimension ${match.dimension} scored ${match.score}.`
  });
}

function average(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
