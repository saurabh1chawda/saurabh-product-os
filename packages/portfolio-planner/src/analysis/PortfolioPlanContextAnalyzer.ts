import { createPortfolioPlannerExplanationSummary } from "../explainability";
import type { PortfolioPlanContext, PortfolioPlanContextInput, PortfolioPlannerStageDefinition } from "../models";
import { defaultPortfolioPlannerPolicy, defaultPortfolioPlanningConstraints } from "../policies";
import { artifactReference, confidenceFromScore, immutableArray, immutableRecord } from "../shared";

export class PortfolioPlanContextAnalyzer {
  analyze(input: PortfolioPlanContextInput): PortfolioPlanContext {
    const sourceReferences = immutableArray([
      artifactReference(input.careerStrategy.artifact),
      artifactReference(input.portfolio.artifact),
      artifactReference(input.opportunityDecision.artifact)
    ]);
    const contextId = `portfolio-plan-context:${input.careerStrategy.strategyId}`.replace(/\s+/g, "-").toLowerCase();
    const assumptions = immutableArray(input.assumptions ?? input.careerStrategy.assumptions);
    const constraints = defaultPortfolioPlanningConstraints(input.constraints);

    return immutableRecord({
      artifactKind: "PortfolioPlanContext" as const,
      contextId,
      careerStrategy: input.careerStrategy,
      portfolio: input.portfolio,
      opportunityDecision: input.opportunityDecision,
      sourceReferences,
      sequence: stageSequence(),
      currentStage: "EvidenceNeeds" as const,
      policy: defaultPortfolioPlannerPolicy(input.policy),
      assumptions,
      constraints,
      traceId: input.traceId,
      confidence: confidenceFromScore(100, "PortfolioPlanContext aggregates canonical inputs without planning analysis."),
      explanationSummary: createPortfolioPlannerExplanationSummary({
        decisionId: contextId,
        title: "Portfolio Plan Context",
        outcome: "Aggregation",
        confidenceScore: 100,
        evidenceReferenceIds: sourceReferences.map((reference) => reference.referenceId),
        reasonCodes: immutableArray(["aggregation-only", "portfolio-planning-context"]),
        tradeOffs: immutableArray(["aggregation defers portfolio trade-offs to downstream stages"]),
        assumptions,
        constraints: constraints.map((constraint) => constraint.label)
      })
    });
  }
}

function stageSequence(): readonly PortfolioPlannerStageDefinition[] {
  return immutableArray([
    stage("PortfolioPlanContext", 0, [], ["Portfolio planning context is available."], []),
    stage("EvidenceNeeds", 1, ["PortfolioPlanContext is available."], ["Portfolio evidence needs are represented."], ["PortfolioPlanContext"]),
    stage("PortfolioInitiatives", 2, ["EvidenceNeeds is available."], ["Portfolio initiatives are represented."], ["EvidenceNeeds"]),
    stage("InitiativeEvaluation", 3, ["PortfolioInitiatives is available."], ["Initiatives are evaluated."], ["PortfolioInitiatives"]),
    stage("PortfolioRoadmap", 4, ["InitiativeEvaluation is available."], ["Initiatives are sequenced."], ["InitiativeEvaluation"]),
    stage("PortfolioPlan", 5, ["PortfolioRoadmap is available."], ["Portfolio plan is selected."], ["PortfolioRoadmap"])
  ]);
}

function stage(stageName: PortfolioPlannerStageDefinition["stage"], order: number, entryCriteria: readonly string[], exitCriteria: readonly string[], dependencies: readonly PortfolioPlannerStageDefinition["stage"][]): PortfolioPlannerStageDefinition {
  return immutableRecord({
    stage: stageName,
    order,
    entryCriteria: immutableArray(entryCriteria),
    exitCriteria: immutableArray(exitCriteria),
    dependencies: immutableArray(dependencies)
  });
}
