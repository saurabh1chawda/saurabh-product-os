import type {
  CompetencyQuery,
  DecisionQuery,
  EvidenceQuery,
  IdentityQuery,
  KnowledgeQuery,
  MetricQuery,
  StoryQuery
} from "../queries";
import type { RetrievalResult } from "../results";
import type { RetrievalContext } from "../shared";

export interface KnowledgeRetrievalService<TItem = unknown> {
  retrieveKnowledge(query: KnowledgeQuery, context?: RetrievalContext): RetrievalResult<TItem>;
}

export interface IdentityRetrievalService<TItem = unknown> {
  retrieveIdentities(query: IdentityQuery, context?: RetrievalContext): RetrievalResult<TItem>;
}

export interface CompetencyRetrievalService<TItem = unknown> {
  retrieveCompetencies(query: CompetencyQuery, context?: RetrievalContext): RetrievalResult<TItem>;
}

export interface StoryRetrievalService<TItem = unknown> {
  retrieveStories(query: StoryQuery, context?: RetrievalContext): RetrievalResult<TItem>;
}

export interface EvidenceRetrievalService<TItem = unknown> {
  retrieveEvidence(query: EvidenceQuery, context?: RetrievalContext): RetrievalResult<TItem>;
}

export interface MetricRetrievalService<TItem = unknown> {
  retrieveMetrics(query: MetricQuery, context?: RetrievalContext): RetrievalResult<TItem>;
}

export interface DecisionRetrievalService<TItem = unknown> {
  retrieveDecisions(query: DecisionQuery, context?: RetrievalContext): RetrievalResult<TItem>;
}
