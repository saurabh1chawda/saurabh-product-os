import type { Alternative, Constraint, Decision } from "@career-companion/decision-model";
import type { DecisionNarrative } from "../models";
import { immutableArray, immutableRecord } from "../models";

export class NarrativeBuilder {
  build(input: {
    readonly decision: Decision;
    readonly alternatives?: readonly Alternative[];
    readonly constraints?: readonly Constraint[];
  }): DecisionNarrative {
    const acceptedAlternative = input.alternatives?.find((alternative) => alternative.option.status === "preferred");
    const rejectedAlternatives = input.alternatives?.filter((alternative) => alternative.option.status === "rejected") ?? [];

    return immutableRecord({
      narrativeId: `decision-narrative:${input.decision.id}`,
      decisionId: input.decision.id,
      title: input.decision.title,
      outcome: input.decision.outcome,
      reasonCodes: immutableArray(input.decision.reasons.map((reason) => reason.code)),
      acceptedAlternative: acceptedAlternative?.option.label,
      rejectedAlternatives: immutableArray(rejectedAlternatives.map((alternative) => alternative.option.label)),
      evidenceReferenceIds: immutableArray(input.decision.references.map((reference) => reference.referenceId)),
      constraintLabels: immutableArray((input.constraints ?? []).map((constraint) => constraint.label))
    });
  }
}
