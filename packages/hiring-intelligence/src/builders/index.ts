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
import { createHiringExplanationSummary } from "../explainability";
import type {
  HiringDecision,
  HiringManagerEvaluation,
  HiringPipeline,
  InterviewEvaluation,
  RecruiterEvaluation
} from "../models";
import { artifactReference, immutableArray } from "../shared";

type ArtifactConfidence = Parameters<typeof createArtifactExplanation>[0]["confidence"];

export class HiringPipelineArtifactBuilder {
  build(input: Omit<HiringPipeline, "artifact" | "explanationSummary">): Pick<HiringPipeline, "artifact" | "explanationSummary"> {
    const references = [artifactReference(input.decisionReport.artifact.artifactId, "career-decision-report", "DecisionReport")];
    const explanationSummary = createHiringExplanationSummary({
      decisionId: input.pipelineId,
      title: "Hiring Pipeline",
      references: references.map(toDecisionReference),
      confidenceScore: Math.round(input.pipelineConfidence.value * 100),
      reasonCodes: ["pipeline-sequencing", "stage-dependency-preservation"],
      constraints: input.evaluationConstraints
    });

    return {
      explanationSummary,
      artifact: artifact("hiring-pipeline", input.pipelineId, "Hiring Pipeline", input, references, explanationSummary, input.pipelineConfidence as unknown as ArtifactConfidence, Math.round(input.pipelineConfidence.value * 100))
    };
  }
}

export class RecruiterArtifactBuilder {
  build(input: Omit<RecruiterEvaluation, "artifact" | "explanationSummary">): Pick<RecruiterEvaluation, "artifact" | "explanationSummary"> {
    const references = [artifactReference(input.pipelineId, "hiring-pipeline", "HiringPipeline")];
    const explanationSummary = createHiringExplanationSummary({
      decisionId: input.evaluationId,
      title: "Recruiter Evaluation",
      references: references.map(toDecisionReference),
      confidenceScore: input.score.overallScore,
      reasonCodes: ["recruiter-screen", "resume-clarity", "risk-signal-review"],
      rejectedAlternatives: input.gaps.map((gap) => gap.gapType)
    });

    return {
      explanationSummary,
      artifact: artifact("recruiter-evaluation", input.evaluationId, "Recruiter Evaluation", input, references, explanationSummary, input.confidence as unknown as ArtifactConfidence, input.score.overallScore)
    };
  }
}

export class HiringManagerArtifactBuilder {
  build(input: Omit<HiringManagerEvaluation, "artifact" | "explanationSummary">): Pick<HiringManagerEvaluation, "artifact" | "explanationSummary"> {
    const references = [artifactReference(input.recruiterEvaluationId, "recruiter-evaluation", "RecruiterEvaluation")];
    const explanationSummary = createHiringExplanationSummary({
      decisionId: input.evaluationId,
      title: "Hiring Manager Evaluation",
      references: references.map(toDecisionReference),
      confidenceScore: input.score.overallScore,
      reasonCodes: ["manager-screen", "product-thinking", "execution-quality"],
      rejectedAlternatives: input.gaps.map((gap) => gap.gapType)
    });

    return {
      explanationSummary,
      artifact: artifact("hiring-manager-evaluation", input.evaluationId, "Hiring Manager Evaluation", input, references, explanationSummary, input.confidence as unknown as ArtifactConfidence, input.score.overallScore)
    };
  }
}

export class InterviewArtifactBuilder {
  build(input: Omit<InterviewEvaluation, "artifact" | "explanationSummary">): Pick<InterviewEvaluation, "artifact" | "explanationSummary"> {
    const references = [artifactReference(input.hiringManagerEvaluationId, "hiring-manager-evaluation", "HiringManagerEvaluation")];
    const explanationSummary = createHiringExplanationSummary({
      decisionId: input.evaluationId,
      title: "Interview Evaluation",
      references: references.map(toDecisionReference),
      confidenceScore: input.score.overallScore,
      reasonCodes: ["interview-validation", "behavioral-evidence", "assumption-validation"],
      rejectedAlternatives: input.gaps.map((gap) => gap.gapType)
    });

    return {
      explanationSummary,
      artifact: artifact("interview-evaluation", input.evaluationId, "Interview Evaluation", input, references, explanationSummary, input.confidence as unknown as ArtifactConfidence, input.score.overallScore)
    };
  }
}

export class HiringDecisionArtifactBuilder {
  build(input: Omit<HiringDecision, "artifact" | "explanationSummary">): Pick<HiringDecision, "artifact" | "explanationSummary"> {
    const references = [
      artifactReference(input.interviewEvaluation.evaluationId, "interview-evaluation", "InterviewEvaluation")
    ];
    const score = Math.round(input.confidence.value * 100);
    const explanationSummary = createHiringExplanationSummary({
      decisionId: input.decisionId,
      title: "Hiring Decision",
      references: references.map(toDecisionReference),
      confidenceScore: score,
      reasonCodes: ["pipeline-aggregation", "decision-outcome-selection", "evidence-reconciliation"],
      rejectedAlternatives: input.contradictingEvidence
    });

    return {
      explanationSummary,
      artifact: artifact("hiring-decision", input.decisionId, "Hiring Decision", input, references, explanationSummary, input.confidence as unknown as ArtifactConfidence, score)
    };
  }
}

function artifact<TContent>(
  idPrefix: string,
  artifactId: string,
  title: string,
  content: TContent,
  references: readonly ArtifactReference[],
  explanationSummary: ReturnType<typeof createHiringExplanationSummary>,
  confidence: ArtifactConfidence,
  score: number
): CareerArtifact {
  const scoreModel = createArtifactScore({ value: score, scale: "zero-to-one-hundred", label: score >= 70 ? "strong" : "needs-review" });
  return createCareerArtifact({
    artifactId: `artifact:${idPrefix}:${artifactId}`,
    artifactType: "RecruiterBrief",
    metadata: {
      artifactId: `artifact:${idPrefix}:${artifactId}`,
      artifactType: "RecruiterBrief",
      title,
      createdAt: "1970-01-01T00:00:00.000Z",
      source: "hiring-intelligence",
      version: 1,
      references
    },
    summary: createArtifactSummary({
      headline: title,
      summary: "Deterministic Hiring Intelligence artifact.",
      score: scoreModel,
      references
    }),
    sections: [
      createArtifactSection({
        sectionId: `artifact:${idPrefix}:${artifactId}:section:primary`,
        sectionType: idPrefix,
        title,
        order: 1,
        ordering: { order: 1 },
        blocks: [
          createArtifactBlock({
            blockId: `artifact:${idPrefix}:${artifactId}:block:primary`,
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
            score: scoreModel
          })
        ],
        content
      })
    ],
    score: scoreModel,
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
