import type { ArtifactEvidence, ArtifactExplanation, ArtifactReference, ArtifactScore } from "@career-companion/career-artifacts";
import type { ExplanationSummary } from "@career-companion/explainability";
import type { UniqueIdentifier } from "@career-companion/kernel";
import type {
  Confidence,
  GapClassification,
  RankingReason,
  ScoreBreakdown
} from "../models";

export interface Scored {
  readonly score: ArtifactScore | ScoreBreakdown;
}

export interface Ranked {
  readonly rank: number;
  readonly rankingReasons: readonly RankingReason[];
}

export interface Explained {
  readonly explanationSummary: ExplanationSummary;
}

export interface ConfidenceAware {
  readonly confidence: Confidence;
}

export interface GapAware {
  readonly gaps: readonly GapClassification[];
}

export interface Ordered {
  readonly order: number;
}

export interface EvidenceAware {
  readonly evidence: readonly ArtifactEvidence[];
}

export interface ArtifactSupporting {
  readonly artifactReferences: readonly ArtifactReference[];
  readonly artifactExplanation?: ArtifactExplanation;
}

export interface ProductIntelligenceReference {
  readonly id: UniqueIdentifier | string;
  readonly referenceType: string;
  readonly label: string;
}
