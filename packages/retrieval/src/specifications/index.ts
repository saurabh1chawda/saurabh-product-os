import type { Specification } from "@career-companion/kernel";

export type RetrievalSpecificationOperator = "and" | "or" | "not";

export interface RetrievalSpecification<TCandidate = unknown> extends Specification<TCandidate> {
  readonly specificationId: string;
  readonly description: string;
}

export interface CompositeRetrievalSpecification<TCandidate = unknown> {
  readonly operator: RetrievalSpecificationOperator;
  readonly specifications: readonly RetrievalSpecification<TCandidate>[];
}

export type StorySpecification<TCandidate = unknown> = RetrievalSpecification<TCandidate>;

export type CompetencySpecification<TCandidate = unknown> = RetrievalSpecification<TCandidate>;

export type EvidenceSpecification<TCandidate = unknown> = RetrievalSpecification<TCandidate>;

export type IdentitySpecification<TCandidate = unknown> = RetrievalSpecification<TCandidate>;

export type DecisionSpecification<TCandidate = unknown> = RetrievalSpecification<TCandidate>;
