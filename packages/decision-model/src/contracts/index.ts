import type { Version } from "@career-companion/kernel";
import type { Alternative } from "../alternative";
import type { Assumption } from "../assumption";
import type { Constraint } from "../constraint";
import type { Decision } from "../decision";
import type { DecisionGraph } from "../graph";
import type { Recommendation } from "../recommendation";
import type { Tradeoff } from "../tradeoff";

export interface DecisionModelVersion {
  readonly version: Version;
  readonly label: string;
  readonly status: "draft" | "active" | "deprecated" | "retired";
}

export interface DecisionLanguage {
  readonly modelVersion: DecisionModelVersion;
  readonly supportedOutcomes: readonly string[];
  readonly supportedConstraintTypes: readonly string[];
  readonly supportedTradeoffCategories: readonly string[];
}

export interface DecisionSerializer<TSerialized = string> {
  serialize(decision: Decision): TSerialized;
  deserialize(serialized: TSerialized): Decision;
}

export interface DecisionVisitor<TResult = void> {
  visitDecision(decision: Decision): TResult;
  visitRecommendation(recommendation: Recommendation): TResult;
  visitAlternative(alternative: Alternative): TResult;
  visitConstraint(constraint: Constraint): TResult;
  visitTradeoff(tradeoff: Tradeoff): TResult;
  visitAssumption(assumption: Assumption): TResult;
  visitGraph(graph: DecisionGraph): TResult;
}
