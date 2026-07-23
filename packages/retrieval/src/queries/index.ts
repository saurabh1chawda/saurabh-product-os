import type { FilterGroup } from "../filters";
import type { CursorRequest, PageRequest } from "../pagination";
import type { Projection } from "../shared";
import type { MultiSort } from "../sorting";

export interface RetrievalQuery<TCriteria = unknown> {
  readonly queryName?: string;
  readonly criteria: TCriteria;
  readonly filters?: FilterGroup;
  readonly sorting?: MultiSort;
  readonly pagination?: PageRequest | CursorRequest;
  readonly projection?: Projection;
}

export type KnowledgeQuery<TCriteria = unknown> = RetrievalQuery<TCriteria>;

export type IdentityQuery<TCriteria = unknown> = RetrievalQuery<TCriteria>;

export type CompetencyQuery<TCriteria = unknown> = RetrievalQuery<TCriteria>;

export type StoryQuery<TCriteria = unknown> = RetrievalQuery<TCriteria>;

export type EvidenceQuery<TCriteria = unknown> = RetrievalQuery<TCriteria>;

export type MetricQuery<TCriteria = unknown> = RetrievalQuery<TCriteria>;

export type DecisionQuery<TCriteria = unknown> = RetrievalQuery<TCriteria>;
