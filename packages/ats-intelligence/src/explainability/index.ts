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
import type { ATSExplanationInput } from "../models";
import { decisionReference, immutableArray, immutableRecord } from "../shared";

export function createATSExplanationSummary(input: ATSExplanationInput): ExplanationSummary {
  const references = immutableArray(input.evidenceReferenceIds.map((id) => decisionReference(id, "ats-evidence", id)));
  const confidence = decisionConfidence(input.confidenceScore);
  const graph: ExplanationGraph = immutableRecord({
    graphId: `graph:${input.decisionId}`,
    createdAt: "1970-01-01T00:00:00.000Z",
    nodes: immutableArray([{
      id: `node:${input.decisionId}`,
      nodeType: "decision",
      label: input.title,
      references,
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
    references
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
    rejectionReasons: immutableArray(input.rejectedSignals ?? [])
  });
  const narrative: DecisionNarrative = immutableRecord({
    narrativeId: `narrative:${input.decisionId}`,
    decisionId: input.decisionId,
    title: input.title,
    outcome: input.confidenceScore >= 70 ? "recommended" : "requires-review",
    reasonCodes: immutableArray(input.reasonCodes),
    rejectedAlternatives: immutableArray(input.rejectedSignals ?? []),
    evidenceReferenceIds: immutableArray(references.map((reference: DecisionReference) => reference.referenceId)),
    constraintLabels: immutableArray(input.constraints ?? [])
  });

  return immutableRecord({ decisionId: input.decisionId, graph, evidenceTrace, confidence: confidenceBreakdown, constraints, alternatives, narrative });
}

function decisionConfidence(score: number): DecisionConfidence {
  return immutableRecord({
    value: Math.max(Math.min(score, 100), 0) / 100,
    level: score >= 75 ? "high" : score >= 50 ? "medium" : "low",
    rationale: "Derived from deterministic ATS Intelligence."
  });
}
