import { InvalidExecutionOperationError } from "../errors/PortfolioWorkspaceDomainErrors";

export const PolicyDecisionKind = Object.freeze({
  Recommendation: "Recommendation",
  NoAction: "NoAction"
} as const);

export type PolicyDecisionKindValue =
  typeof PolicyDecisionKind[keyof typeof PolicyDecisionKind];

export interface PolicyDecisionJson {
  readonly decisionName: string;
  readonly kind: PolicyDecisionKindValue;
  readonly reason: string;
  readonly references: readonly string[];
  readonly factTypes: readonly string[];
}

export class PolicyDecision {
  private readonly __policyDecisionBrand!: never;

  readonly decisionName: string;
  readonly kind: PolicyDecisionKindValue;
  readonly reason: string;
  readonly references: readonly string[];
  readonly factTypes: readonly string[];

  constructor(input: PolicyDecisionJson) {
    assertRequiredString(input.decisionName);
    assertRequiredString(input.reason);
    if (!isPolicyDecisionKind(input.kind)) {
      throw new InvalidExecutionOperationError();
    }

    this.decisionName = input.decisionName;
    this.kind = input.kind;
    this.reason = input.reason;
    this.references = Object.freeze([...input.references]);
    this.factTypes = Object.freeze([...input.factTypes]);
    Object.freeze(this);
  }

  equals(other: PolicyDecision | undefined): boolean {
    return other instanceof PolicyDecision
      && this.decisionName === other.decisionName
      && this.kind === other.kind
      && this.reason === other.reason
      && arrayEquals(this.references, other.references)
      && arrayEquals(this.factTypes, other.factTypes);
  }

  toJSON(): PolicyDecisionJson {
    return {
      decisionName: this.decisionName,
      kind: this.kind,
      reason: this.reason,
      references: [...this.references],
      factTypes: [...this.factTypes]
    };
  }
}

export class RecommendationDecision extends PolicyDecision {
  constructor(input: Omit<PolicyDecisionJson, "kind">) {
    super({
      ...input,
      kind: PolicyDecisionKind.Recommendation
    });
  }
}

export class NoActionDecision extends PolicyDecision {
  constructor(input: Omit<PolicyDecisionJson, "kind">) {
    super({
      ...input,
      kind: PolicyDecisionKind.NoAction
    });
  }
}

function assertRequiredString(value: string): void {
  if (value.trim().length === 0) {
    throw new InvalidExecutionOperationError();
  }
}

function isPolicyDecisionKind(value: string): value is PolicyDecisionKindValue {
  return Object.values(PolicyDecisionKind).includes(value as PolicyDecisionKindValue);
}

function arrayEquals(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length
    && left.every((value, index) => value === right[index]);
}
