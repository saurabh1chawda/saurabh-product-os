import type { DecisionEdgeId, DecisionNodeId, DecisionReference } from "../shared";
import { immutableArray, immutableRecord } from "../shared";

export type DecisionNodeType = "decision" | "recommendation" | "alternative" | "constraint" | "assumption" | "tradeoff" | "evidence";

export interface DecisionNode {
  readonly id: DecisionNodeId;
  readonly nodeType: DecisionNodeType;
  readonly label: string;
  readonly references: readonly DecisionReference[];
}

export interface DecisionEdge {
  readonly id: DecisionEdgeId;
  readonly fromNodeId: DecisionNodeId;
  readonly toNodeId: DecisionNodeId;
  readonly relationship: "depends-on" | "supports" | "constrains" | "conflicts" | "explains";
  readonly references: readonly DecisionReference[];
}

export interface DecisionDependency {
  readonly sourceDecisionId: string;
  readonly dependentDecisionId: string;
  readonly dependencyType: "required-before" | "informs" | "blocks" | "supersedes";
  readonly references: readonly DecisionReference[];
}

export interface DecisionGraph {
  readonly nodes: readonly DecisionNode[];
  readonly edges: readonly DecisionEdge[];
  readonly dependencies: readonly DecisionDependency[];
}

export function createDecisionGraph(input: DecisionGraph): DecisionGraph {
  return immutableRecord({
    nodes: immutableArray(input.nodes),
    edges: immutableArray(input.edges),
    dependencies: immutableArray(input.dependencies)
  });
}
