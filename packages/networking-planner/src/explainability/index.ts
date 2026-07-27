import type {
  AlternativeSummary,
  ConfidenceBreakdown,
  ConstraintSummary,
  DecisionNarrative,
  EvidenceTrace,
  ExplanationGraph,
  ExplanationSummary
} from "@career-companion/explainability";
import type { NetworkingPlannerExplanationInput } from "../models";
import { immutableArray, immutableRecord } from "../shared";

export function createNetworkingPlannerExplanationSummary(input: NetworkingPlannerExplanationInput): ExplanationSummary {
  const references = immutableArray(input.evidenceReferenceIds.map((id) => immutableRecord({
    referenceId: id,
    referenceType: "networking-planner-evidence",
    label: id,
    authority: "derived" as const
  })));
  const confidence = immutableRecord({
    value: Math.max(0, Math.min(100, input.confidenceScore)) / 100,
    level: input.confidenceScore >= 75 ? "high" as const : input.confidenceScore >= 50 ? "medium" as const : "low" as const
  });
  const score = immutableRecord({ value: Math.max(0, Math.min(100, input.confidenceScore)), scale: "zero-to-one-hundred" as const });
  const graph: ExplanationGraph = immutableRecord({
    graphId: `networking-planner-graph:${input.decisionId}`,
    nodes: immutableArray([
      immutableRecord({
        id: `networking-planner-node:${input.decisionId}`,
        nodeType: "decision" as const,
        label: input.title,
        outcome: input.confidenceScore >= 50 ? "recommended" as const : "requires-review" as const,
        score,
        confidence,
        references
      })
    ]),
    edges: immutableArray([]),
    createdAt: "1970-01-01T00:00:00.000Z"
  });
  const evidenceTrace: EvidenceTrace = immutableRecord({
    traceId: `networking-planner-trace:${input.decisionId}`,
    decisionId: input.decisionId,
    evidenceNodes: immutableArray([]),
    edges: immutableArray([]),
    references
  });
  const confidenceBreakdown: ConfidenceBreakdown = immutableRecord({
    aggregateConfidence: confidence,
    components: immutableArray([
      immutableRecord({
        component: "coverage" as const,
        score: input.confidenceScore,
        weight: 1,
        reasons: immutableArray(input.reasonCodes)
      })
    ])
  });
  const constraints: ConstraintSummary = immutableRecord({
    constraints: immutableArray([]),
    satisfied: immutableArray([]),
    violated: immutableArray([]),
    blockingCount: 0
  });
  const alternatives: AlternativeSummary = immutableRecord({
    rejectedAlternatives: immutableArray([]),
    orderedAlternatives: immutableArray([]),
    rejectionReasons: immutableArray([...input.reasonCodes, ...input.tradeOffs])
  });
  const narrative: DecisionNarrative = immutableRecord({
    narrativeId: `networking-planner-narrative:${input.decisionId}`,
    decisionId: input.decisionId,
    title: input.title,
    outcome: input.confidenceScore >= 50 ? "recommended" as const : "requires-review" as const,
    reasonCodes: immutableArray([...input.reasonCodes, ...input.tradeOffs]),
    rejectedAlternatives: immutableArray([]),
    evidenceReferenceIds: immutableArray(input.evidenceReferenceIds),
    constraintLabels: immutableArray(input.constraints)
  });

  return immutableRecord({ decisionId: input.decisionId, graph, evidenceTrace, confidence: confidenceBreakdown, constraints, alternatives, narrative });
}
