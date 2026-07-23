import type { DecisionReason, DecisionReference, ExplanationNodeId } from "../shared";
import { immutableArray, immutableRecord } from "../shared";

export type ExplanationNodeType = "input" | "constraint" | "assumption" | "alternative" | "tradeoff" | "recommendation" | "outcome";

export interface ExplanationNode {
  readonly id: ExplanationNodeId;
  readonly nodeType: ExplanationNodeType;
  readonly label: string;
  readonly statement: string;
  readonly references: readonly DecisionReference[];
}

export interface ExplanationEdge {
  readonly fromNodeId: ExplanationNodeId;
  readonly toNodeId: ExplanationNodeId;
  readonly relationship: "supports" | "conflicts" | "depends-on" | "explains" | "qualifies";
  readonly reason?: DecisionReason;
}

export interface ExplanationPath {
  readonly pathId: string;
  readonly nodes: readonly ExplanationNode[];
  readonly edges: readonly ExplanationEdge[];
  readonly summary: string;
}

export interface DecisionExplanation {
  readonly summary: string;
  readonly reasons: readonly DecisionReason[];
  readonly nodes: readonly ExplanationNode[];
  readonly edges: readonly ExplanationEdge[];
  readonly paths: readonly ExplanationPath[];
}

export function createDecisionExplanation(input: DecisionExplanation): DecisionExplanation {
  return immutableRecord({
    ...input,
    reasons: immutableArray(input.reasons),
    nodes: immutableArray(input.nodes),
    edges: immutableArray(input.edges),
    paths: immutableArray(input.paths)
  });
}
