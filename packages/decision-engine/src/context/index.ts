import type {
  CapabilityEvidenceSnapshot,
  CompetencySnapshot,
  EvidenceReferenceSnapshot,
  MetricSnapshot,
  PortfolioAssetSnapshot,
  ProfessionalIdentitySnapshot,
  StorySnapshot
} from "@career-companion/career-knowledge";
import type { PipelineMetadata } from "../shared";

export interface CandidateProfileSnapshot {
  readonly identities: readonly ProfessionalIdentitySnapshot[];
  readonly competencies: readonly CompetencySnapshot[];
  readonly capabilityEvidence: readonly CapabilityEvidenceSnapshot[];
  readonly evidenceReferences: readonly EvidenceReferenceSnapshot[];
  readonly stories: readonly StorySnapshot[];
  readonly metrics: readonly MetricSnapshot[];
  readonly portfolioAssets: readonly PortfolioAssetSnapshot[];
}

export interface TargetProfile {
  readonly targetName?: string;
  readonly requiredCompetencyIds: readonly string[];
  readonly preferredCompetencyIds: readonly string[];
  readonly preferredEvidenceIds: readonly string[];
}

export interface SelectionCriteria {
  readonly limit?: number;
  readonly minimumScore?: number;
  readonly minimumConfidence?: number;
}

export type ExecutionMetadata = PipelineMetadata;

export interface DecisionContext {
  readonly candidate: CandidateProfileSnapshot;
  readonly target: TargetProfile;
  readonly criteria: SelectionCriteria;
  readonly metadata: ExecutionMetadata;
}

export function createDecisionContext(input: DecisionContext): DecisionContext {
  return Object.freeze({
    candidate: Object.freeze({
      identities: Object.freeze([...input.candidate.identities]),
      competencies: Object.freeze([...input.candidate.competencies]),
      capabilityEvidence: Object.freeze([...input.candidate.capabilityEvidence]),
      evidenceReferences: Object.freeze([...input.candidate.evidenceReferences]),
      stories: Object.freeze([...input.candidate.stories]),
      metrics: Object.freeze([...input.candidate.metrics]),
      portfolioAssets: Object.freeze([...input.candidate.portfolioAssets])
    }),
    target: Object.freeze({
      targetName: input.target.targetName,
      requiredCompetencyIds: Object.freeze([...input.target.requiredCompetencyIds]),
      preferredCompetencyIds: Object.freeze([...input.target.preferredCompetencyIds]),
      preferredEvidenceIds: Object.freeze([...input.target.preferredEvidenceIds])
    }),
    criteria: Object.freeze({ ...input.criteria }),
    metadata: Object.freeze({ ...input.metadata })
  });
}
