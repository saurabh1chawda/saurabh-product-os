import type { Alternative } from "@career-companion/decision-model";
import type { AlternativeSummary } from "../models";
import { immutableArray, immutableRecord } from "../models";

export class AlternativeAnalyzer {
  analyze(alternatives: readonly Alternative[]): AlternativeSummary {
    const orderedAlternatives = immutableArray([...alternatives].sort(compareAlternatives));
    const acceptedAlternative = orderedAlternatives.find((alternative) => alternative.option.status === "preferred");
    const rejectedAlternatives = immutableArray(orderedAlternatives.filter((alternative) => alternative.option.status === "rejected"));

    return immutableRecord({
      acceptedAlternative,
      rejectedAlternatives,
      orderedAlternatives,
      rejectionReasons: immutableArray(rejectedAlternatives.flatMap((alternative) =>
        alternative.reasons.length === 0
          ? [`${alternative.option.label} was rejected without an explicit reason.`]
          : alternative.reasons.map((reason) => reason.statement)
      ))
    });
  }
}

function compareAlternatives(left: Alternative, right: Alternative): number {
  const scoreDifference = (right.score?.value ?? 0) - (left.score?.value ?? 0);
  if (scoreDifference !== 0) {
    return scoreDifference;
  }

  const confidenceDifference = (right.confidence?.value ?? 0) - (left.confidence?.value ?? 0);
  if (confidenceDifference !== 0) {
    return confidenceDifference;
  }

  return left.option.label.localeCompare(right.option.label);
}
