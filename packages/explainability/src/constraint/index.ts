import type { Constraint, ConstraintViolation } from "@career-companion/decision-model";
import type { ConstraintSummary } from "../models";
import { immutableArray, immutableRecord } from "../models";

export class ConstraintAnalyzer {
  analyze(input: {
    readonly constraints: readonly Constraint[];
    readonly violations?: readonly ConstraintViolation[];
  }): ConstraintSummary {
    const violationIds = new Set((input.violations ?? []).map((violation) => violation.constraintId));
    const violated = immutableArray(input.constraints.filter((constraint) => violationIds.has(constraint.id)));
    const satisfied = immutableArray(input.constraints.filter((constraint) => !violationIds.has(constraint.id)));
    const blockingCount = (input.violations ?? []).filter((violation) => violation.severity === "blocking").length;

    return immutableRecord({
      constraints: immutableArray(input.constraints),
      satisfied,
      violated,
      blockingCount
    });
  }
}
