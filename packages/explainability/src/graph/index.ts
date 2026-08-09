import type { Alternative, Constraint, Decision } from "@career-companion/decision-model";
import type {
  AlternativeNode,
  ConstraintNode,
  DecisionNode,
  EvidenceNode,
  ExplanationEdge,
  ExplanationGraph,
  ExplanationNode
} from "../models";
import { deterministicTimestamp, immutableArray, immutableRecord } from "../models";

export interface DecisionGraphInput {
  readonly decision: Decision;
  readonly constraints?: readonly Constraint[];
  readonly alternatives?: readonly Alternative[];
}

export class DecisionGraphBuilder {
  build(input: DecisionGraphInput): ExplanationGraph {
    const decisionNode = createDecisionNode(input.decision);
    const evidenceNodes = input.decision.references.map((reference): EvidenceNode => immutableRecord({
      id: `evidence:${reference.referenceId}`,
      nodeType: "evidence",
      label: reference.label ?? reference.referenceId,
      strength: reference.authority === "authoritative" ? "primary" : reference.authority === "supporting" ? "supporting" : "contextual",
      references: immutableArray([reference])
    }));
    const constraintNodes = (input.constraints ?? []).map((constraint): ConstraintNode => immutableRecord({
      id: `constraint:${constraint.id}`,
      nodeType: "constraint",
      label: constraint.label,
      required: constraint.required,
      satisfied: input.decision.references.some((reference) =>
        constraint.references.some((constraintReference) => constraintReference.referenceId === reference.referenceId)
      ),
      references: immutableArray(constraint.references)
    }));
    const alternativeNodes = orderAlternatives(input.alternatives ?? []).map((alternative, index): AlternativeNode => immutableRecord({
      id: `alternative:${alternative.id}`,
      nodeType: "alternative",
      label: alternative.option.label,
      status: alternative.option.status,
      rank: index + 1,
      references: immutableArray(alternative.option.references)
    }));
    const nodes: readonly ExplanationNode[] = immutableArray([
      decisionNode,
      ...evidenceNodes,
      ...constraintNodes,
      ...alternativeNodes
    ]);
    const edges = createEdges(decisionNode, evidenceNodes, constraintNodes, alternativeNodes);

    return immutableRecord({
      graphId: `explanation-graph:${input.decision.id}`,
      nodes,
      edges,
      createdAt: deterministicTimestamp()
    });
  }
}

function createDecisionNode(decision: Decision): DecisionNode {
  return immutableRecord({
    id: `decision:${decision.id}`,
    nodeType: "decision",
    label: decision.title,
    outcome: decision.outcome,
    score: decision.score,
    confidence: decision.confidence,
    references: immutableArray(decision.references)
  });
}

function createEdges(
  decisionNode: DecisionNode,
  evidenceNodes: readonly EvidenceNode[],
  constraintNodes: readonly ConstraintNode[],
  alternativeNodes: readonly AlternativeNode[]
): readonly ExplanationEdge[] {
  return immutableArray([
    ...evidenceNodes.map((node): ExplanationEdge => immutableRecord({
      id: `${node.id}->${decisionNode.id}:supports`,
      fromNodeId: node.id,
      toNodeId: decisionNode.id,
      edgeType: "supports",
      references: node.references
    })),
    ...constraintNodes.map((node): ExplanationEdge => immutableRecord({
      id: `${decisionNode.id}->${node.id}:dependsOn`,
      fromNodeId: decisionNode.id,
      toNodeId: node.id,
      edgeType: "dependsOn",
      references: node.references
    })),
    ...alternativeNodes.map((node): ExplanationEdge => immutableRecord({
      id: `${node.id}->${decisionNode.id}:${node.status === "rejected" ? "rejects" : "supports"}`,
      fromNodeId: node.id,
      toNodeId: decisionNode.id,
      edgeType: node.status === "rejected" ? "rejects" : "supports",
      references: node.references
    }))
  ]);
}

function orderAlternatives(alternatives: readonly Alternative[]): readonly Alternative[] {
  return immutableArray([...alternatives].sort((left, right) => {
    const scoreDifference = (right.score?.value ?? 0) - (left.score?.value ?? 0);
    if (scoreDifference !== 0) {
      return scoreDifference;
    }

    return left.option.label.localeCompare(right.option.label);
  }));
}
