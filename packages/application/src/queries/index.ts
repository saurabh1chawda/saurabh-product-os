import type {
  DecisionQuery as RetrievalDecisionQuery,
  EvidenceQuery as RetrievalEvidenceQuery,
  KnowledgeQuery,
  RetrievalQuery
} from "@career-companion/retrieval";
import type { ApplicationRequestId } from "../shared";

export interface ApplicationQuery<TCriteria = unknown> {
  readonly queryId: ApplicationRequestId;
  readonly queryName: string;
  readonly retrieval: RetrievalQuery<TCriteria>;
}

export type CareerProfileQuery = ApplicationQuery<{
  readonly careerProfileId: string;
  readonly knowledge?: KnowledgeQuery;
}>;

export type EvidenceQuery = ApplicationQuery<{
  readonly evidenceId?: string;
  readonly retrieval?: RetrievalEvidenceQuery;
}>;

export type DecisionHistoryQuery = ApplicationQuery<{
  readonly careerProfileId?: string;
  readonly retrieval?: RetrievalDecisionQuery;
}>;

export type PortfolioQuery = ApplicationQuery<{
  readonly portfolioAssetId?: string;
  readonly careerProfileId?: string;
}>;

export type ResumeQuery = ApplicationQuery<{
  readonly resumeArtifactId?: string;
  readonly careerProfileId?: string;
}>;

