export type ReferenceId = string;

export interface Reason {
  readonly code: string;
  readonly message: string;
  readonly weight: number;
  readonly supportingReferenceIds: readonly ReferenceId[];
}

export class RecommendationScore {
  private constructor(readonly value: number) {}

  static from(value: number): RecommendationScore {
    return new RecommendationScore(clamp(value, 0, 100));
  }

  static zero(): RecommendationScore {
    return new RecommendationScore(0);
  }
}

export class Confidence {
  private constructor(readonly value: number) {}

  static from(value: number): Confidence {
    return new Confidence(clamp(value, 0, 1));
  }

  static none(): Confidence {
    return new Confidence(0);
  }
}

export interface Coverage {
  readonly present: number;
  readonly required: number;
  readonly missing: number;
  readonly ratio: number;
  readonly reasons: readonly Reason[];
}

export interface DecisionExplanation {
  readonly summary: string;
  readonly reasons: readonly Reason[];
}

export interface Recommendation<TReference> {
  readonly subject: TReference;
  readonly score: RecommendationScore;
  readonly confidence: Confidence;
  readonly reasons: readonly Reason[];
  readonly supportingReferenceIds: readonly ReferenceId[];
  readonly explanation: DecisionExplanation;
}

export interface Ranking<TReference> extends Recommendation<TReference> {
  readonly rank: number;
}

export function createReason(
  code: string,
  message: string,
  weight: number,
  supportingReferenceIds: readonly ReferenceId[] = []
): Reason {
  return Object.freeze({
    code,
    message,
    weight,
    supportingReferenceIds: Object.freeze([...supportingReferenceIds])
  });
}

export function createRecommendation<TReference>(input: {
  readonly subject: TReference;
  readonly score: number;
  readonly confidence: number;
  readonly reasons: readonly Reason[];
  readonly supportingReferenceIds?: readonly ReferenceId[];
  readonly summary: string;
}): Recommendation<TReference> {
  const reasons = [...input.reasons];
  const supportingReferenceIds = input.supportingReferenceIds ?? collectSupportingReferences(reasons);

  return Object.freeze({
    subject: input.subject,
    score: RecommendationScore.from(input.score),
    confidence: Confidence.from(input.confidence),
    reasons: Object.freeze(reasons),
    supportingReferenceIds: Object.freeze([...supportingReferenceIds]),
    explanation: Object.freeze({
      summary: input.summary,
      reasons: Object.freeze(reasons)
    })
  });
}

export function rankRecommendations<TReference>(
  recommendations: readonly Recommendation<TReference>[]
): readonly Ranking<TReference>[] {
  return [...recommendations]
    .sort((left, right) => compareRecommendation(right, left))
    .map((recommendation, index) => ({
      ...recommendation,
      rank: index + 1
    }));
}

export function calculateCoverage(
  presentReferenceIds: readonly ReferenceId[],
  requiredReferenceIds: readonly ReferenceId[],
  reasonCode: string
): Coverage {
  const present = new Set(presentReferenceIds);
  const required = new Set(requiredReferenceIds);
  const presentCount = [...required].filter((id) => present.has(id)).length;
  const missing = Math.max(required.size - presentCount, 0);

  return {
    present: presentCount,
    required: required.size,
    missing,
    ratio: required.size === 0 ? 1 : presentCount / required.size,
    reasons: [
      createReason(
        reasonCode,
        `${presentCount} of ${required.size} required references are covered.`,
        presentCount
      )
    ]
  };
}

export function uniqueByReference<TReference>(
  references: readonly TReference[],
  getReferenceId: (reference: TReference) => ReferenceId
): readonly TReference[] {
  const seen = new Set<ReferenceId>();
  const unique: TReference[] = [];

  for (const reference of references) {
    const referenceId = getReferenceId(reference);
    if (!seen.has(referenceId)) {
      seen.add(referenceId);
      unique.push(reference);
    }
  }

  return unique;
}

export function idToString(value: { readonly toString: () => string }): ReferenceId {
  return value.toString();
}

function compareRecommendation<TReference>(
  left: Recommendation<TReference>,
  right: Recommendation<TReference>
): number {
  const scoreDifference = left.score.value - right.score.value;
  if (scoreDifference !== 0) {
    return scoreDifference;
  }

  const confidenceDifference = left.confidence.value - right.confidence.value;
  if (confidenceDifference !== 0) {
    return confidenceDifference;
  }

  return collectSupportingReferences(left.reasons).join("|").localeCompare(collectSupportingReferences(right.reasons).join("|"));
}

function collectSupportingReferences(reasons: readonly Reason[]): readonly ReferenceId[] {
  return [...new Set(reasons.flatMap((reason) => reason.supportingReferenceIds))];
}

function clamp(value: number, minimum: number, maximum: number): number {
  if (!Number.isFinite(value)) {
    return minimum;
  }

  return Math.min(Math.max(value, minimum), maximum);
}
