import type { DomainMetadata, DomainTimestamp, Version } from "@career-companion/kernel";

export type DecisionId = string;
export type RecommendationId = string;
export type AlternativeId = string;
export type ConstraintId = string;
export type TradeoffId = string;
export type AssumptionId = string;
export type ExplanationNodeId = string;
export type DecisionNodeId = string;
export type DecisionEdgeId = string;

export type DecisionLifecycleStatus = "draft" | "candidate" | "recommended" | "approved" | "rejected" | "archived";

export type ReferenceAuthority = "authoritative" | "supporting" | "advisory" | "derived";

export interface DecisionMetadata {
  readonly decisionId: DecisionId;
  readonly modelVersion: Version;
  readonly createdAt: DomainTimestamp;
  readonly updatedAt?: DomainTimestamp;
  readonly owner?: string;
  readonly source?: string;
  readonly metadata?: DomainMetadata;
}

export interface DecisionReference {
  readonly referenceId: string;
  readonly referenceType: string;
  readonly authority: ReferenceAuthority;
  readonly version?: Version;
  readonly label?: string;
}

export interface DecisionReason {
  readonly code: string;
  readonly statement: string;
  readonly weight?: number;
  readonly references: readonly DecisionReference[];
}

export interface DecisionScore {
  readonly value: number;
  readonly scale: "zero-to-one" | "zero-to-one-hundred" | "ordinal";
  readonly label?: string;
}

export interface DecisionConfidence {
  readonly value: number;
  readonly level: "low" | "medium" | "high" | "unknown";
  readonly rationale?: string;
}

export interface DecisionSummary {
  readonly headline: string;
  readonly summary: string;
  readonly outcome: string;
  readonly reasons: readonly DecisionReason[];
}

export function immutableArray<T>(items: readonly T[]): readonly T[] {
  return Object.freeze([...items]);
}

export function immutableRecord<T extends object>(record: T): Readonly<T> {
  return Object.freeze({ ...record });
}
