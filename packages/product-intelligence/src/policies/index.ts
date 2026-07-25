import type {
  ConfidenceBand,
  EvidenceStrength,
  GapPriority,
  GapSeverity,
  OrderingDirection,
  ScoreBand,
  ScoreWeight
} from "../models";
import { immutableArray, immutableRecord } from "../shared";

export interface ClassificationPolicy {
  readonly policyId: string;
  readonly minimumConfidence?: ConfidenceBand;
  readonly acceptedCategories?: readonly string[];
  readonly fallbackCategory?: string;
}

export interface ScoringPolicy {
  readonly policyId: string;
  readonly scoreScale: "zero-to-one" | "zero-to-one-hundred";
  readonly weights: readonly ScoreWeight[];
  readonly passingBand?: ScoreBand;
}

export interface EvidenceStrengthPolicy {
  readonly policyId: string;
  readonly minimumStrength: EvidenceStrength;
  readonly preferredStrengths: readonly EvidenceStrength[];
}

export interface GapSeverityPolicy {
  readonly policyId: string;
  readonly defaultSeverity: GapSeverity;
  readonly escalationPriority: GapPriority;
}

export interface OrderingCriterion {
  readonly criterion: string;
  readonly direction: OrderingDirection;
  readonly priority: number;
  readonly rationale: string;
}

export interface OrderingPolicy {
  readonly policyId: string;
  readonly criteria: readonly OrderingCriterion[];
  readonly stableTieBreakRequired: boolean;
  readonly tieBreakRationale?: string;
}

export interface ConfidencePolicy {
  readonly policyId: string;
  readonly minimumConfidence: ConfidenceBand;
  readonly requireRationale: boolean;
}

export function createClassificationPolicy(input: ClassificationPolicy): ClassificationPolicy {
  return immutableRecord({
    ...input,
    acceptedCategories: immutableArray(input.acceptedCategories ?? [])
  });
}

export function createScoringPolicy(input: ScoringPolicy): ScoringPolicy {
  return immutableRecord({
    ...input,
    weights: immutableArray(input.weights)
  });
}

export function createEvidenceStrengthPolicy(input: EvidenceStrengthPolicy): EvidenceStrengthPolicy {
  return immutableRecord({
    ...input,
    preferredStrengths: immutableArray(input.preferredStrengths)
  });
}

export function createGapSeverityPolicy(input: GapSeverityPolicy): GapSeverityPolicy {
  return immutableRecord(input);
}

export function createOrderingPolicy(input: OrderingPolicy): OrderingPolicy {
  return immutableRecord({
    ...input,
    criteria: immutableArray(input.criteria)
  });
}

export function createConfidencePolicy(input: ConfidencePolicy): ConfidencePolicy {
  return immutableRecord(input);
}
