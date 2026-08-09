import type { DomainMetadata, DomainTimestamp } from "@career-companion/kernel";
import type {
  Alternative,
  Constraint,
  Decision,
  DecisionConfidence,
  DecisionReference,
  DecisionScore
} from "@career-companion/decision-model";

export type ExplanationNodeType =
  | "decision"
  | "evidence"
  | "competency"
  | "metric"
  | "story"
  | "constraint"
  | "alternative";

export type ExplanationEdgeType = "supports" | "dependsOn" | "rejects" | "derivedFrom";

export interface ExplanationNode {
  readonly id: string;
  readonly nodeType: ExplanationNodeType;
  readonly label: string;
  readonly references: readonly DecisionReference[];
  readonly metadata?: DomainMetadata;
}

export interface DecisionNode extends ExplanationNode {
  readonly nodeType: "decision";
  readonly outcome: Decision["outcome"];
  readonly score: DecisionScore;
  readonly confidence: DecisionConfidence;
}

export interface EvidenceNode extends ExplanationNode {
  readonly nodeType: "evidence";
  readonly strength: "primary" | "supporting" | "contextual" | "unknown";
}

export interface ConstraintNode extends ExplanationNode {
  readonly nodeType: "constraint";
  readonly required: boolean;
  readonly satisfied: boolean;
}

export interface AlternativeNode extends ExplanationNode {
  readonly nodeType: "alternative";
  readonly status: Alternative["option"]["status"];
  readonly rank: number;
}

export interface ExplanationEdge {
  readonly id: string;
  readonly fromNodeId: string;
  readonly toNodeId: string;
  readonly edgeType: ExplanationEdgeType;
  readonly references: readonly DecisionReference[];
}

export interface ExplanationGraph {
  readonly graphId: string;
  readonly nodes: readonly ExplanationNode[];
  readonly edges: readonly ExplanationEdge[];
  readonly createdAt: DomainTimestamp;
}

export interface EvidenceTrace {
  readonly traceId: string;
  readonly decisionId: string;
  readonly evidenceNodes: readonly EvidenceNode[];
  readonly edges: readonly ExplanationEdge[];
  readonly references: readonly DecisionReference[];
}

export interface ConfidenceComponent {
  readonly component: "evidence-strength" | "coverage" | "consistency" | "constraint-satisfaction";
  readonly score: number;
  readonly weight: number;
  readonly reasons: readonly string[];
}

export interface ConfidenceBreakdown {
  readonly aggregateConfidence: DecisionConfidence;
  readonly components: readonly ConfidenceComponent[];
}

export interface ConstraintSummary {
  readonly constraints: readonly Constraint[];
  readonly satisfied: readonly Constraint[];
  readonly violated: readonly Constraint[];
  readonly blockingCount: number;
}

export interface AlternativeSummary {
  readonly acceptedAlternative?: Alternative;
  readonly rejectedAlternatives: readonly Alternative[];
  readonly orderedAlternatives: readonly Alternative[];
  readonly rejectionReasons: readonly string[];
}

export interface DecisionNarrative {
  readonly narrativeId: string;
  readonly decisionId: string;
  readonly title: string;
  readonly outcome: Decision["outcome"];
  readonly reasonCodes: readonly string[];
  readonly acceptedAlternative?: string;
  readonly rejectedAlternatives: readonly string[];
  readonly evidenceReferenceIds: readonly string[];
  readonly constraintLabels: readonly string[];
}

export interface ExplanationSummary {
  readonly decisionId: string;
  readonly graph: ExplanationGraph;
  readonly evidenceTrace: EvidenceTrace;
  readonly confidence: ConfidenceBreakdown;
  readonly constraints: ConstraintSummary;
  readonly alternatives: AlternativeSummary;
  readonly narrative: DecisionNarrative;
}

export function immutableArray<T>(items: readonly T[]): readonly T[] {
  return Object.freeze([...items]);
}

export function immutableRecord<T extends object>(record: T): Readonly<T> {
  return Object.freeze({ ...record });
}

export function deterministicTimestamp(): DomainTimestamp {
  return "1970-01-01T00:00:00.000Z";
}
