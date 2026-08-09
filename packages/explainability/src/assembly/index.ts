import type { Alternative, Constraint, ConstraintViolation, Decision } from "@career-companion/decision-model";
import { AlternativeAnalyzer } from "../alternative";
import { ConfidenceAnalyzer } from "../confidence";
import { ConstraintAnalyzer } from "../constraint";
import { EvidenceTraceBuilder } from "../evidence";
import { DecisionGraphBuilder } from "../graph";
import type { ExplanationSummary } from "../models";
import { immutableRecord } from "../models";
import { NarrativeBuilder } from "../narrative";

export interface ExplanationAssemblyInput {
  readonly decision: Decision;
  readonly alternatives?: readonly Alternative[];
  readonly constraints?: readonly Constraint[];
  readonly violations?: readonly ConstraintViolation[];
}

export class ExplanationAssembler {
  private readonly graphBuilder = new DecisionGraphBuilder();
  private readonly evidenceTraceBuilder = new EvidenceTraceBuilder();
  private readonly confidenceAnalyzer = new ConfidenceAnalyzer();
  private readonly alternativeAnalyzer = new AlternativeAnalyzer();
  private readonly constraintAnalyzer = new ConstraintAnalyzer();
  private readonly narrativeBuilder = new NarrativeBuilder();

  assemble(input: ExplanationAssemblyInput): ExplanationSummary {
    return immutableRecord({
      decisionId: input.decision.id,
      graph: this.graphBuilder.build({
        decision: input.decision,
        alternatives: input.alternatives,
        constraints: input.constraints
      }),
      evidenceTrace: this.evidenceTraceBuilder.build(input.decision),
      confidence: this.confidenceAnalyzer.analyze(input.decision),
      constraints: this.constraintAnalyzer.analyze({
        constraints: input.constraints ?? [],
        violations: input.violations
      }),
      alternatives: this.alternativeAnalyzer.analyze(input.alternatives ?? []),
      narrative: this.narrativeBuilder.build({
        decision: input.decision,
        alternatives: input.alternatives,
        constraints: input.constraints
      })
    });
  }
}
