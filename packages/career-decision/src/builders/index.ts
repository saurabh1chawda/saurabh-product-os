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
import { createDecisionExplanationSummary } from "../explainability";
import type {
  DecisionAssessment,
  DecisionContext,
  DecisionPlan,
  DecisionReport,
  DecisionStrategy,
  ProductIntelligenceSet
} from "../models";
import { artifactReference, confidenceFromScore, immutableArray } from "../shared";

type ArtifactConfidence = Parameters<typeof createArtifactExplanation>[0]["confidence"];

export class DecisionContextArtifactBuilder {
  build(input: Omit<DecisionContext, "artifact" | "explanationSummary">): Pick<DecisionContext, "artifact" | "explanationSummary"> {
    const references = input.sourceArtifactIds.map((id) => artifactReference(id, "product-intelligence-artifact", id));
    const explanationSummary = createDecisionExplanationSummary({
      decisionId: input.contextId,
      title: "Decision Context",
      references: references.map(toDecisionReference),
      confidenceScore: 100,
      reasonCodes: ["canonical-product-intelligence-aggregation"]
    });

    return {
      explanationSummary,
      artifact: artifact("decision-context", input.contextId, "Decision Context", input, references, explanationSummary, confidenceFromScore(100, "Context aggregates canonical intelligence.") as unknown as ArtifactConfidence, 100)
    };
  }
}

export class DecisionAssessmentArtifactBuilder {
  build(input: Omit<DecisionAssessment, "artifact" | "explanationSummary">): Pick<DecisionAssessment, "artifact" | "explanationSummary"> {
    const references = [artifactReference(input.contextId, "decision-context", "DecisionContext")];
    const explanationSummary = createDecisionExplanationSummary({
      decisionId: input.assessmentId,
      title: "Decision Assessment",
      references: references.map(toDecisionReference),
      confidenceScore: input.overallReadiness.overallScore,
      reasonCodes: ["readiness-assessment", "coverage-assessment", "risk-assessment"],
      rejectedAlternatives: input.riskAreas.map((risk) => risk.label)
    });

    return {
      explanationSummary,
      artifact: artifact("decision-assessment", input.assessmentId, "Decision Assessment", input, references, explanationSummary, input.confidence as unknown as ArtifactConfidence, input.overallReadiness.overallScore)
    };
  }
}

export class DecisionStrategyArtifactBuilder {
  build(input: Omit<DecisionStrategy, "artifact" | "explanationSummary">): Pick<DecisionStrategy, "artifact" | "explanationSummary"> {
    const references = [artifactReference(input.assessmentId, "decision-assessment", "DecisionAssessment")];
    const score = Math.round(input.confidence.value * 100);
    const explanationSummary = createDecisionExplanationSummary({
      decisionId: input.strategyId,
      title: "Decision Strategy",
      references: references.map(toDecisionReference),
      confidenceScore: score,
      reasonCodes: ["objective-selection", "priority-theme-selection", "tradeoff-analysis"],
      rejectedAlternatives: input.tradeoffs.map((tradeoff) => tradeoff.reduced)
    });

    return {
      explanationSummary,
      artifact: artifact("decision-strategy", input.strategyId, "Decision Strategy", input, references, explanationSummary, input.confidence as unknown as ArtifactConfidence, score)
    };
  }
}

export class DecisionPlanArtifactBuilder {
  build(input: Omit<DecisionPlan, "artifact" | "explanationSummary">): Pick<DecisionPlan, "artifact" | "explanationSummary"> {
    const references = [artifactReference(input.strategyId, "decision-strategy", "DecisionStrategy")];
    const score = Math.round(input.confidence.value * 100);
    const explanationSummary = createDecisionExplanationSummary({
      decisionId: input.planId,
      title: "Decision Plan",
      references: references.map(toDecisionReference),
      confidenceScore: score,
      reasonCodes: ["action-generation", "priority-ordering", "completion-criteria"]
    });

    return {
      explanationSummary,
      artifact: artifact("decision-plan", input.planId, "Decision Plan", input, references, explanationSummary, input.confidence as unknown as ArtifactConfidence, score)
    };
  }
}

export class DecisionReportArtifactBuilder {
  build(input: Omit<DecisionReport, "artifact" | "explanationSummary">): Pick<DecisionReport, "artifact" | "explanationSummary"> {
    const references = [
      artifactReference(input.context.contextId, "decision-context", "DecisionContext"),
      artifactReference(input.assessment.assessmentId, "decision-assessment", "DecisionAssessment"),
      artifactReference(input.strategy.strategyId, "decision-strategy", "DecisionStrategy"),
      artifactReference(input.plan.planId, "decision-plan", "DecisionPlan")
    ];
    const score = Math.round(input.confidence.value * 100);
    const explanationSummary = createDecisionExplanationSummary({
      decisionId: input.reportId,
      title: "Decision Report",
      references: references.map(toDecisionReference),
      confidenceScore: score,
      reasonCodes: ["decision-projection", "assessment-summary", "strategy-plan-alignment"],
      rejectedAlternatives: input.summary.topRisks
    });

    return {
      explanationSummary,
      artifact: artifact("decision-report", input.reportId, "Decision Report", input, references, explanationSummary, input.confidence as unknown as ArtifactConfidence, score)
    };
  }
}

export function sourceArtifactIds(input: ProductIntelligenceSet): readonly string[] {
  return immutableArray([
    input.resume.artifact.artifactId,
    input.portfolio.artifact.artifactId,
    input.interview.artifact.artifactId,
    input.jobModel.artifact.artifactId,
    input.hiringModel.artifact.artifactId,
    input.evaluationFramework.artifact.artifactId,
    input.jobMatchReport.artifact.artifactId
  ]);
}

function artifact<TContent>(
  idPrefix: string,
  artifactId: string,
  title: string,
  content: TContent,
  references: readonly ArtifactReference[],
  explanationSummary: ReturnType<typeof createDecisionExplanationSummary>,
  confidence: ArtifactConfidence,
  score: number
): CareerArtifact {
  const scoreModel = createArtifactScore({ value: score, scale: "zero-to-one-hundred", label: score >= 70 ? "strong" : "needs-review" });
  return createCareerArtifact({
    artifactId: `artifact:${idPrefix}:${artifactId}`,
    artifactType: "CareerReport",
    metadata: {
      artifactId: `artifact:${idPrefix}:${artifactId}`,
      artifactType: "CareerReport",
      title,
      createdAt: "1970-01-01T00:00:00.000Z",
      source: "career-decision",
      version: 1,
      references
    },
    summary: createArtifactSummary({
      headline: title,
      summary: "Deterministic Career Decision artifact.",
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
