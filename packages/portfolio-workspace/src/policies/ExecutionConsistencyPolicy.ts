import { PortfolioExecution } from "../aggregate/PortfolioExecution";
import type { PortfolioExecutionFact } from "../facts/PortfolioExecutionFacts";
import { NoActionDecision, PolicyDecision, RecommendationDecision } from "./PolicyDecision";

export class ExecutionConsistencyPolicy {
  private readonly __executionConsistencyPolicyBrand!: never;

  constructor() {
    Object.freeze(this);
  }

  evaluate(
    execution: PortfolioExecution,
    facts: readonly PortfolioExecutionFact[] = []
  ): PolicyDecision {
    const factTypes = facts.map((fact) => fact.type);
    const references = [execution.id.toJSON()];
    const duplicateReference = firstDuplicate(execution.workItems().map((workItem) => workItem.id.toJSON()))
      ?? firstDuplicate(execution.candidates().map((candidate) => candidate.id.toJSON()))
      ?? firstDuplicate(execution.acceptedArtifacts().map((acceptedArtifact) => acceptedArtifact.id.toJSON()));

    if (duplicateReference !== undefined) {
      return new RecommendationDecision({
        decisionName: "PortfolioExecutionConsistency",
        reason: "Portfolio execution contains duplicate owned entity identity references.",
        references: [...references, duplicateReference],
        factTypes
      });
    }

    return new NoActionDecision({
      decisionName: "PortfolioExecutionConsistency",
      reason: "Portfolio execution owned entity identities are internally consistent.",
      references,
      factTypes
    });
  }
}

function firstDuplicate(values: readonly string[]): string | undefined {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) return value;
    seen.add(value);
  }

  return undefined;
}
