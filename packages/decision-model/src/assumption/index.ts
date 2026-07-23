import type { AssumptionId, DecisionReference } from "../shared";
import { immutableArray, immutableRecord } from "../shared";

export type AssumptionCategory = "role-fit" | "candidate-positioning" | "evidence-quality" | "market-context" | "constraint" | "other";

export type AssumptionConfidence = "low" | "medium" | "high" | "unknown";

export type AssumptionStatus = "unverified" | "supported" | "challenged" | "invalidated" | "accepted";

export interface Assumption {
  readonly id: AssumptionId;
  readonly category: AssumptionCategory;
  readonly statement: string;
  readonly confidence: AssumptionConfidence;
  readonly status: AssumptionStatus;
  readonly references: readonly DecisionReference[];
}

export function createAssumption(input: Assumption): Assumption {
  return immutableRecord({
    ...input,
    references: immutableArray(input.references)
  });
}
