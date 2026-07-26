import {
  createArtifactBlock,
  createArtifactExplanation,
  createArtifactScore,
  createArtifactSection,
  createArtifactSummary,
  createCareerArtifact,
  type CareerArtifact
} from "@career-companion/career-artifacts";
import type { Alternative } from "@career-companion/decision-model";
import { createATSExplanationSummary } from "../explainability";
import type { ATSDecision, ATSExplanationInput, ATSMatching, ATSParsing, ATSPipeline, ATSScreening } from "../models";
import { artifactReference, immutableArray } from "../shared";

type ArtifactConfidence = Parameters<typeof createArtifactExplanation>[0]["confidence"];

export class ATSPipelineArtifactBuilder {
  build(input: Omit<ATSPipeline, "artifact" | "explanationSummary">) {
    return build("ats-pipeline", input.pipelineId, "ATS Pipeline", input, input.sourceArtifactIds, Math.round(input.confidence.value * 100), ["ats-pipeline-context", "canonical-artifact-aggregation"]);
  }
}

export class ATSParsingArtifactBuilder {
  build(input: Omit<ATSParsing, "artifact" | "explanationSummary">) {
    return build("ats-parsing", input.parsingId, "ATS Parsing", input, input.evidenceReferences, Math.round(input.confidence.value * 100), ["section-extraction", "candidate-fact-projection", "parsing-policy"]);
  }
}

export class ATSMatchingArtifactBuilder {
  build(input: Omit<ATSMatching, "artifact" | "explanationSummary">) {
    return build("ats-matching", input.matchingId, "ATS Matching", input, input.requirementMatches.flatMap((match) => match.evidence), input.scoreBreakdown.overallScore, ["requirement-matching", "alias-policy", "coverage-calculation"]);
  }
}

export class ATSScreeningArtifactBuilder {
  build(input: Omit<ATSScreening, "artifact" | "explanationSummary">) {
    return build("ats-screening", input.screeningId, "ATS Screening", input, input.evaluatedGates.flatMap((gate) => gate.evidence), Math.round(input.confidence.value * 100), ["gate-evaluation", "threshold-policy", "manual-review-policy"], input.blockingEvidence);
  }
}

export class ATSDecisionArtifactBuilder {
  build(input: Omit<ATSDecision, "artifact" | "explanationSummary">) {
    return build("ats-decision", input.decisionId, "ATS Decision", input, [...input.supportingEvidence, ...input.blockingEvidence], Math.round(input.confidence.value * 100), ["ats-outcome-selection", "screening-summary", "alternative-outcome-review"], input.blockingEvidence);
  }
}

function build<TContent>(
  idPrefix: string,
  id: string,
  title: string,
  content: TContent,
  evidenceIds: readonly string[],
  confidenceScore: number,
  reasonCodes: readonly string[],
  rejectedSignals: readonly string[] = []
): { readonly artifact: CareerArtifact; readonly explanationSummary: ReturnType<typeof createATSExplanationSummary> } {
  const explanationInput: ATSExplanationInput = {
    decisionId: id,
    title,
    confidenceScore,
    reasonCodes,
    evidenceReferenceIds: immutableArray(evidenceIds),
    rejectedSignals
  };
  const explanationSummary = createATSExplanationSummary(explanationInput);
  const references = immutableArray(evidenceIds.map((evidenceId) => artifactReference(evidenceId, "ats-evidence", evidenceId)));
  const confidence = {
    value: Math.max(Math.min(confidenceScore, 100), 0) / 100,
    band: confidenceScore >= 75 ? "high" : confidenceScore >= 50 ? "medium" : "low",
    rationale: `${title} confidence.`
  } as ArtifactConfidence;
  const score = createArtifactScore({
    value: confidenceScore,
    scale: "zero-to-one-hundred",
    label: confidenceScore >= 70 ? "strong" : "needs-review"
  });
  const artifact = createCareerArtifact({
    artifactId: `artifact:${idPrefix}:${id}`,
    artifactType: "JobMatchReport",
    metadata: {
      artifactId: `artifact:${idPrefix}:${id}`,
      artifactType: "JobMatchReport",
      title,
      createdAt: "1970-01-01T00:00:00.000Z",
      source: "ats-intelligence",
      version: 1,
      references
    },
    summary: createArtifactSummary({
      headline: title,
      summary: "Deterministic ATS Intelligence artifact.",
      score,
      references
    }),
    sections: [
      createArtifactSection({
        sectionId: `artifact:${idPrefix}:${id}:section:primary`,
        sectionType: idPrefix,
        title,
        order: 1,
        ordering: { order: 1 },
        blocks: [
          createArtifactBlock({
            blockId: `artifact:${idPrefix}:${id}:block:primary`,
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
            score
          })
        ],
        content
      })
    ],
    score,
    explanation: createArtifactExplanation({
      explanationSummary,
      confidence,
      decisionTraceReference: explanationSummary.decisionId,
      rejectedAlternatives: immutableArray([]),
      acceptedAlternative: undefined as Alternative | undefined
    })
  });

  return { artifact, explanationSummary };
}
