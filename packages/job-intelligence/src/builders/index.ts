import {
  createArtifactBlock,
  createArtifactExplanation,
  createArtifactScore,
  createArtifactSection,
  createArtifactSummary,
  createCareerArtifact,
  type ArtifactReference,
  type CareerArtifact
} from "@career-companion/career-artifacts";
import type { Alternative } from "@career-companion/decision-model";
import { createJobExplanationSummary } from "../explainability";
import type {
  EvaluationFramework,
  HiringModel,
  JobMatchReport,
  JobModel,
  RawJobDescription
} from "../models";
import { artifactReference, confidenceFromScore, immutableArray } from "../shared";

type ArtifactConfidence = Parameters<typeof createArtifactExplanation>[0]["confidence"];

export class JobArtifactBuilder {
  build(input: Omit<JobModel, "artifact" | "explanationSummary">): Pick<JobModel, "artifact" | "explanationSummary"> {
    const references = [artifactReference(input.source.jobDescriptionId, "job-description", input.source.title)];
    const explanationSummary = createJobExplanationSummary({
      decisionId: `job-model:${input.source.jobDescriptionId}`,
      title: "Job Model",
      references: references.map(toDecisionReference),
      confidenceScore: Math.round((input.role.confidence.value + input.function.confidence.value + input.seniority.confidence.value + input.domain.confidence.value) * 25),
      reasonCodes: ["role-classification", "responsibility-mapping", "competency-mapping"]
    });

    return {
      explanationSummary,
      artifact: artifact("job-model", input.source, "Job Model", input, references, explanationSummary, input.role.confidence as unknown as ArtifactConfidence)
    };
  }
}

export class HiringArtifactBuilder {
  build(input: Omit<HiringModel, "artifact" | "explanationSummary">, source: RawJobDescription): Pick<HiringModel, "artifact" | "explanationSummary"> {
    const references = [artifactReference(input.jobModelId, "job-model", "JobModel")];
    const explanationSummary = createJobExplanationSummary({
      decisionId: `hiring-model:${input.jobModelId}`,
      title: "Hiring Model",
      references: references.map(toDecisionReference),
      confidenceScore: 78,
      reasonCodes: ["hiring-expectation-mapping", "evidence-expectation-mapping"]
    });

    return {
      explanationSummary,
      artifact: artifact("hiring-model", source, "Hiring Model", input, references, explanationSummary, confidenceFromScore(78, "Hiring model confidence is deterministic.") as unknown as ArtifactConfidence)
    };
  }
}

export class EvaluationFrameworkArtifactBuilder {
  build(input: Omit<EvaluationFramework, "artifact" | "explanationSummary">, source: RawJobDescription): Pick<EvaluationFramework, "artifact" | "explanationSummary"> {
    const references = [artifactReference(input.jobModelId, "job-model", "JobModel"), artifactReference(input.hiringModelId, "hiring-model", "HiringModel")];
    const explanationSummary = createJobExplanationSummary({
      decisionId: `evaluation-framework:${input.jobModelId}`,
      title: "Evaluation Framework",
      references: references.map(toDecisionReference),
      confidenceScore: Math.round(Math.min(input.totalWeight, 1) * 100),
      reasonCodes: ["evaluation-dimension-weighting", "minimum-expectation-mapping"]
    });

    return {
      explanationSummary,
      artifact: artifact("evaluation-framework", source, "Evaluation Framework", input, references, explanationSummary, confidenceFromScore(input.totalWeight * 100, "Framework confidence is derived from total dimension coverage.") as unknown as ArtifactConfidence)
    };
  }
}

export class JobMatchArtifactBuilder {
  build(input: Omit<JobMatchReport, "artifact" | "explanationSummary">, source: RawJobDescription): Pick<JobMatchReport, "artifact" | "explanationSummary"> {
    const references = [
      artifactReference(input.jobModelId, "job-model", "JobModel"),
      artifactReference(input.hiringModelId, "hiring-model", "HiringModel"),
      artifactReference(input.evaluationFrameworkId, "evaluation-framework", "EvaluationFramework")
    ];
    const explanationSummary = createJobExplanationSummary({
      decisionId: `job-match:${input.candidateId}:${input.jobModelId}`,
      title: "Job Match Report",
      references: references.map(toDecisionReference),
      confidenceScore: input.overallFit.overallScore,
      reasonCodes: ["dimension-scoring", "evidence-coverage", "gap-analysis"],
      rejectedAlternatives: input.riskAreas
    });

    return {
      explanationSummary,
      artifact: artifact("job-match-report", source, "Job Match Report", input, references, explanationSummary, input.confidence as unknown as ArtifactConfidence, input.overallFit.overallScore)
    };
  }
}

function artifact<TContent>(
  idPrefix: string,
  source: RawJobDescription,
  title: string,
  content: TContent,
  references: readonly ArtifactReference[],
  explanationSummary: ReturnType<typeof createJobExplanationSummary>,
  confidence: ArtifactConfidence,
  score = 75
): CareerArtifact {
  const artifactId = `artifact:${idPrefix}:${source.jobDescriptionId}`;
  const artifactScore = createArtifactScore({ value: score, scale: "zero-to-one-hundred", label: score >= 70 ? "strong" : "needs-review" });
  return createCareerArtifact({
    artifactId,
    artifactType: "JobMatchReport",
    metadata: {
      artifactId,
      artifactType: "JobMatchReport",
      title,
      createdAt: source.capturedAt,
      source: "job-intelligence",
      version: 1,
      references
    },
    summary: createArtifactSummary({
      headline: title,
      summary: "Deterministic Job Intelligence artifact.",
      score: artifactScore,
      references
    }),
    sections: [
      createArtifactSection({
        sectionId: `${artifactId}:section:primary`,
        sectionType: idPrefix,
        title,
        order: 1,
        ordering: { order: 1 },
        blocks: [
          createArtifactBlock({
            blockId: `${artifactId}:block:primary`,
            blockType: idPrefix,
            title,
            content,
            ordering: { order: 1 },
            fragments: [],
            evidence: [],
            explanation: createArtifactExplanation({
              explanationSummary,
              confidence,
              decisionTraceReference: explanationSummary.decisionId,
              rejectedAlternatives: immutableArray([]),
              acceptedAlternative: undefined as Alternative | undefined
            }),
            confidence,
            decisionTraceReference: explanationSummary.decisionId,
            rejectedAlternatives: immutableArray([]),
            annotations: [],
            score: artifactScore
          })
        ],
        content
      })
    ],
    score: artifactScore,
    explanation: createArtifactExplanation({
      explanationSummary,
      confidence,
      decisionTraceReference: explanationSummary.decisionId,
      rejectedAlternatives: immutableArray([]),
      acceptedAlternative: undefined as Alternative | undefined
    })
  });
}

function toDecisionReference(reference: ArtifactReference) {
  return {
    referenceId: reference.referenceId,
    referenceType: reference.referenceType,
    label: reference.label,
    authority: "derived" as const
  };
}
