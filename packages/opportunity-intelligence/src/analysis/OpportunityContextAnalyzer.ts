import type { OpportunityContext, OpportunityContextInput, OpportunityStageDefinition } from "../models";
import { defaultOpportunityPolicy } from "../policies";
import { createOpportunityExplanationSummary } from "../explainability";
import { artifactReference, confidenceFromScore, immutableArray, immutableRecord } from "../shared";

export class OpportunityContextAnalyzer {
  analyze(input: OpportunityContextInput): OpportunityContext {
    const sequence = stageSequence();
    const sourceReferences = immutableArray([
      artifactReference(input.resume.artifact),
      artifactReference(input.portfolio.artifact),
      artifactReference(input.jobModel.artifact),
      artifactReference(input.hiringModel.artifact),
      artifactReference(input.evaluationFramework.artifact)
    ]);
    const contextId = `opportunity-context:${input.resume.resumeId}:${input.jobModel.source.jobDescriptionId}`;

    return immutableRecord({
      artifactKind: "OpportunityContext" as const,
      contextId,
      resume: input.resume,
      portfolio: input.portfolio,
      jobModel: input.jobModel,
      hiringModel: input.hiringModel,
      evaluationFramework: input.evaluationFramework,
      sourceReferences,
      sequence,
      currentStage: "CompanyAnalysis" as const,
      policy: defaultOpportunityPolicy(input.policy),
      opportunitySignals: immutableArray(input.opportunitySignals),
      assumptions: immutableArray(input.assumptions ?? []),
      constraints: immutableArray(input.constraints ?? []),
      traceId: input.traceId,
      confidence: confidenceFromScore(100, "OpportunityContext aggregates canonical opportunity inputs without evaluation."),
      explanationSummary: createOpportunityExplanationSummary({
        decisionId: contextId,
        title: "Opportunity Context",
        outcome: "WorthExploring",
        confidenceScore: 100,
        evidenceReferenceIds: sourceReferences.map((reference) => reference.referenceId),
        reasonCodes: immutableArray(["aggregation-only", "canonical-inputs"]),
        assumptions: input.assumptions ?? [],
        constraints: input.constraints ?? []
      })
    });
  }
}

function stageSequence(): readonly OpportunityStageDefinition[] {
  return immutableArray([
    stage("OpportunityContext", 0, [], ["Canonical opportunity inputs are available."], []),
    stage("CompanyAnalysis", 1, ["OpportunityContext is available."], ["Company characteristics are evaluated."], ["OpportunityContext"]),
    stage("RoleAnalysis", 2, ["CompanyAnalysis is available."], ["Role quality is evaluated."], ["CompanyAnalysis"]),
    stage("MarketAnalysis", 3, ["RoleAnalysis is available."], ["Supplied market signals are evaluated."], ["RoleAnalysis"]),
    stage("CandidateFit", 4, ["MarketAnalysis is available."], ["Candidate-opportunity fit is evaluated."], ["MarketAnalysis"]),
    stage("OpportunityDecision", 5, ["CandidateFit is available."], ["Opportunity decision is selected."], ["CandidateFit"])
  ]);
}

function stage(stageName: OpportunityStageDefinition["stage"], order: number, entryCriteria: readonly string[], exitCriteria: readonly string[], dependencies: readonly OpportunityStageDefinition["stage"][]): OpportunityStageDefinition {
  return immutableRecord({
    stage: stageName,
    order,
    entryCriteria: immutableArray(entryCriteria),
    exitCriteria: immutableArray(exitCriteria),
    dependencies: immutableArray(dependencies)
  });
}
