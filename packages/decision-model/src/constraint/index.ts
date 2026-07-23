import type { ConstraintId, DecisionReference } from "../shared";
import { immutableArray, immutableRecord } from "../shared";

export type ConstraintType =
  | "target-role"
  | "industry"
  | "company-size"
  | "location"
  | "language"
  | "experience-level"
  | "work-arrangement"
  | "compensation"
  | "timeline"
  | "other";

export interface Constraint {
  readonly id: ConstraintId;
  readonly constraintType: ConstraintType;
  readonly label: string;
  readonly description: string;
  readonly required: boolean;
  readonly references: readonly DecisionReference[];
}

export interface ConstraintSet {
  readonly constraints: readonly Constraint[];
}

export interface ConstraintViolation {
  readonly constraintId: ConstraintId;
  readonly severity: "low" | "medium" | "high" | "blocking";
  readonly description: string;
  readonly references: readonly DecisionReference[];
}

export function createConstraintSet(input: ConstraintSet): ConstraintSet {
  return immutableRecord({
    constraints: immutableArray(input.constraints)
  });
}
