import type {
  AlternativeSummary,
  ConfidenceBreakdown,
  ConstraintSummary,
  DecisionNarrative,
  EvidenceTrace,
  ExplanationGraph,
  ExplanationSummary
} from "@career-companion/explainability";
import type { DecisionConfidence, DecisionReference } from "@career-companion/decision-model";
import { immutableArray, immutableRecord } from "../shared";

export function createHiringExplanationSummary(input: {
  readonly decisionId: string;
  readonly title: string;
  readonly references: readonly DecisionReference[];
  readonly confidenceScore: number;
  readonly reasonCodes: readonly string[];
  readonly rejectedAlternatives?: readonly string[];
  readonly constraints?: readonly string[];
}): ExplanationSummary {
  const confidence = decisionConfidence(input.confidenceScore);
  const graph: ExplanationGraph = immutableRecord({
    graphId: `graph:${input.decisionId}`,
    createdAt: "1970-01-01T00:00:00.000Z",
    nodes: immutableArray([{
      id: `node:${input.decisionId}`,
      nodeType: "decision",
      label: input.title,
      references: input.references,
      outcome: input.confidenceScore >= 70 ? "recommended" : "requires-review",
      score: {
        value: input.confidenceScore,
        scale: "zero-to-one-hundred",
        label: input.confidenceScore >= 70 ? "strong" : "needs-review"
      },
      confidence
    }]),
    edges: immutableArray([])
  });
  const evidenceTrace: EvidenceTrace = immutableRecord({
    traceId: `trace:${input.decisionId}`,
    decisionId: input.decisionId,
    evidenceNodes: immutableArray([]),
    edges: immutableArray([]),
    references: immutableArray(input.references)
  });
  const confidenceBreakdown: ConfidenceBreakdown = immutableRecord({
    aggregateConfidence: confidence,
    components: immutableArray([{
      component: "coverage",
      score: input.confidenceScore,
      weight: 1,
      reasons: immutableArray(input.reasonCodes)
    }])
  });
  const constraints: ConstraintSummary = immutableRecord({
    constraints: immutableArray([]),
    satisfied: immutableArray([]),
    violated: immutableArray([]),
    blockingCount: 0
  });
  const alternatives: AlternativeSummary = immutableRecord({
    acceptedAlternative: undefined,
    rejectedAlternatives: immutableArray([]),
    orderedAlternatives: immutableArray([]),
    rejectionReasons: immutableArray(input.rejectedAlternatives ?? [])
  });
  const narrative: DecisionNarrative = immutableRecord({
    narrativeId: `narrative:${input.decisionId}`,
    decisionId: input.decisionId,
    title: input.title,
    outcome: input.confidenceScore >= 70 ? "recommended" : "requires-review",
    reasonCodes: immutableArray(input.reasonCodes),
    rejectedAlternatives: immutableArray(input.rejectedAlternatives ?? []),
    evidenceReferenceIds: immutableArray(input.references.map((reference) => reference.referenceId)),
    constraintLabels: immutableArray(input.constraints ?? [])
  });

  return immutableRecord({
    decisionId: input.decisionId,
    graph,
    evidenceTrace,
    confidence: confidenceBreakdown,
    constraints,
    alternatives,
    narrative
  });
}

function decisionConfidence(score: number): DecisionConfidence {
  return immutableRecord({
    value: Math.max(Math.min(score, 100), 0) / 100,
    level: score >= 75 ? "high" : score >= 50 ? "medium" : "low",
    rationale: "Derived from deterministic Hiring Intelligence pipeline."
  });
}
