import { PortfolioExecution } from "../aggregate/PortfolioExecution";
import type { PortfolioExecutionFact } from "../facts/PortfolioExecutionFacts";
import { PortfolioExecutionLifecycle } from "../models/PortfolioExecutionLifecycle";
import { NoActionDecision, PolicyDecision, RecommendationDecision } from "./PolicyDecision";

export class ExecutionCompletionPolicy {
  private readonly __executionCompletionPolicyBrand!: never;

  constructor() {
    Object.freeze(this);
  }

  evaluate(
    execution: PortfolioExecution,
    facts: readonly PortfolioExecutionFact[] = []
  ): PolicyDecision {
    const factTypes = facts.map((fact) => fact.type);
    const references = [execution.id.toJSON()];

    if (execution.lifecycle === PortfolioExecutionLifecycle.Completed) {
      return new NoActionDecision({
        decisionName: "PortfolioExecutionCompletion",
        reason: "Portfolio execution is already completed.",
        references,
        factTypes
      });
    }

    if (execution.lifecycle === PortfolioExecutionLifecycle.Cancelled) {
      return new NoActionDecision({
        decisionName: "PortfolioExecutionCompletion",
        reason: "Portfolio execution is cancelled and remains terminal.",
        references,
        factTypes
      });
    }

    if (execution.lifecycle !== PortfolioExecutionLifecycle.Active) {
      return new NoActionDecision({
        decisionName: "PortfolioExecutionCompletion",
        reason: "Portfolio execution is not active.",
        references,
        factTypes
      });
    }

    const workItems = execution.workItems();
    if (workItems.length === 0) {
      return new NoActionDecision({
        decisionName: "PortfolioExecutionCompletion",
        reason: "Portfolio execution has no work items to complete.",
        references,
        factTypes
      });
    }

    const unresolvedWorkItem = workItems.find((workItem) => workItem.lifecycle !== "Completed" && workItem.lifecycle !== "Cancelled");
    if (unresolvedWorkItem !== undefined) {
      return new NoActionDecision({
        decisionName: "PortfolioExecutionCompletion",
        reason: "Portfolio execution still has unresolved work items.",
        references: [...references, unresolvedWorkItem.id.toJSON()],
        factTypes
      });
    }

    return new RecommendationDecision({
      decisionName: "PortfolioExecutionCompletion",
      reason: "Portfolio execution can be reviewed for completion because all work items are resolved.",
      references,
      factTypes
    });
  }
}
