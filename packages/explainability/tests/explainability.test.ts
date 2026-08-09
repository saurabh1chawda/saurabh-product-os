import { describe, expect, it } from "vitest";
import type { Alternative, Constraint, ConstraintViolation, Decision } from "@career-companion/decision-model";
import { createDecisionExplanation } from "@career-companion/decision-model";
import {
  AlternativeAnalyzer,
  ConfidenceAnalyzer,
  ConstraintAnalyzer,
  DecisionGraphBuilder,
  EvidenceTraceBuilder,
  ExplanationAssembler,
  NarrativeBuilder
} from "../src";

describe("explainability graph", () => {
  it("creates a deterministic directed acyclic explanation graph", () => {
    const graph = new DecisionGraphBuilder().build({
      decision: createDecisionFixture(),
      alternatives: createAlternatives(),
      constraints: createConstraints()
    });

    expect(graph.graphId).toBe("explanation-graph:decision-1");
    expect(graph.nodes.map((node) => node.id)).toEqual([
      "decision:decision-1",
      "evidence:evidence-1",
      "evidence:metric-1",
      "constraint:constraint-1",
      "alternative:alternative-1",
      "alternative:alternative-2"
    ]);
    expect(graph.edges.every((edge) => edge.fromNodeId !== edge.toNodeId)).toBe(true);
    expect(graph.edges.map((edge) => edge.edgeType)).toContain("rejects");
    expect(Object.isFrozen(graph.nodes)).toBe(true);
  });
});

describe("evidence tracing", () => {
  it("creates immutable evidence traces from decision references", () => {
    const trace = new EvidenceTraceBuilder().build(createDecisionFixture());

    expect(trace.traceId).toBe("evidence-trace:decision-1");
    expect(trace.evidenceNodes).toHaveLength(2);
    expect(trace.evidenceNodes[0]?.strength).toBe("primary");
    expect(trace.edges[0]?.edgeType).toBe("derivedFrom");
    expect(Object.isFrozen(trace.evidenceNodes)).toBe(true);
  });
});

describe("confidence analysis", () => {
  it("breaks confidence into deterministic weighted components", () => {
    const breakdown = new ConfidenceAnalyzer().analyze(createDecisionFixture());

    expect(breakdown.components.map((component) => component.component)).toEqual([
      "evidence-strength",
      "coverage",
      "consistency",
      "constraint-satisfaction"
    ]);
    expect(breakdown.aggregateConfidence.value).toBe(0.823);
    expect(breakdown.aggregateConfidence.level).toBe("high");
  });
});

describe("alternative analysis", () => {
  it("orders alternatives by score and extracts rejection reasons", () => {
    const summary = new AlternativeAnalyzer().analyze(createAlternatives());

    expect(summary.acceptedAlternative?.id).toBe("alternative-1");
    expect(summary.orderedAlternatives.map((alternative) => alternative.id)).toEqual(["alternative-1", "alternative-2"]);
    expect(summary.rejectedAlternatives.map((alternative) => alternative.id)).toEqual(["alternative-2"]);
    expect(summary.rejectionReasons).toEqual(["Evidence coverage was weaker."]);
  });
});

describe("constraint analysis", () => {
  it("separates satisfied and violated constraints", () => {
    const summary = new ConstraintAnalyzer().analyze({
      constraints: createConstraints(),
      violations: createViolations()
    });

    expect(summary.satisfied).toHaveLength(0);
    expect(summary.violated.map((constraint) => constraint.id)).toEqual(["constraint-1"]);
    expect(summary.blockingCount).toBe(1);
  });
});

describe("narrative and assembly", () => {
  it("assembles stable structured narratives without generating prose", () => {
    const decision = createDecisionFixture();
    const alternatives = createAlternatives();
    const constraints = createConstraints();
    const narrative = new NarrativeBuilder().build({ decision, alternatives, constraints });
    const summary = new ExplanationAssembler().assemble({
      decision,
      alternatives,
      constraints,
      violations: createViolations()
    });
    const repeated = new ExplanationAssembler().assemble({
      decision,
      alternatives,
      constraints,
      violations: createViolations()
    });

    expect(narrative.reasonCodes).toEqual(["evidence.primary", "metric.outcome"]);
    expect(narrative.acceptedAlternative).toBe("AI Product Leader");
    expect(summary).toEqual(repeated);
    expect(Object.isFrozen(summary)).toBe(true);
    expect(Object.isFrozen(summary.narrative.evidenceReferenceIds)).toBe(true);
  });
});

describe("dependency boundaries", () => {
  it("uses only approved workspace dependencies", async () => {
    const packageJson = await import("../package.json");
    const dependencies = Object.keys(packageJson.default.dependencies);

    expect(dependencies.sort()).toEqual([
      "@career-companion/career-intelligence",
      "@career-companion/career-knowledge",
      "@career-companion/decision-engine",
      "@career-companion/decision-model",
      "@career-companion/kernel"
    ].sort());
    expect(dependencies.some((dependency) => dependency.includes("infrastructure"))).toBe(false);
  });
});

function createDecisionFixture(): Decision {
  const references = Object.freeze([
    Object.freeze({
      referenceId: "evidence-1",
      referenceType: "evidence",
      authority: "authoritative" as const,
      label: "Launch Review",
      version: 1
    }),
    Object.freeze({
      referenceId: "metric-1",
      referenceType: "metric",
      authority: "supporting" as const,
      label: "Cycle Time Reduction",
      version: 1
    })
  ]);
  const reasons = Object.freeze([
    Object.freeze({
      code: "evidence.primary",
      statement: "Primary evidence supports the recommendation.",
      weight: 0.8,
      references
    }),
    Object.freeze({
      code: "metric.outcome",
      statement: "The metric indicates measurable outcome.",
      weight: 0.7,
      references: Object.freeze([references[1]])
    })
  ]);

  return Object.freeze({
    id: "decision-1",
    title: "Positioning Decision",
    question: "Which positioning should be used?",
    outcome: "recommended",
    status: "recommended",
    score: Object.freeze({ value: 87, scale: "zero-to-one-hundred" }),
    confidence: Object.freeze({ value: 0.72, level: "medium", rationale: "Fixture confidence." }),
    reasons,
    references,
    recommendations: Object.freeze([]),
    explanation: createDecisionExplanation({
      summary: "Structured fixture explanation.",
      reasons,
      nodes: Object.freeze([]),
      edges: Object.freeze([]),
      paths: Object.freeze([])
    }),
    summary: Object.freeze({
      headline: "AI Product Leader",
      summary: "Use AI product leadership positioning.",
      outcome: "recommended",
      reasons
    }),
    metadata: Object.freeze({
      decisionId: "decision-1",
      modelVersion: 1,
      createdAt: "2026-07-23T00:00:00.000Z"
    })
  });
}

function createAlternatives(): readonly Alternative[] {
  return Object.freeze([
    Object.freeze({
      id: "alternative-1",
      option: Object.freeze({
        id: "alternative-1",
        label: "AI Product Leader",
        description: "Emphasize AI product leadership.",
        status: "preferred",
        references: Object.freeze([])
      }),
      score: Object.freeze({ value: 92, scale: "zero-to-one-hundred" }),
      confidence: Object.freeze({ value: 0.9, level: "high" }),
      reasons: Object.freeze([])
    }),
    Object.freeze({
      id: "alternative-2",
      option: Object.freeze({
        id: "alternative-2",
        label: "Payments Product Manager",
        description: "Emphasize payments background.",
        status: "rejected",
        references: Object.freeze([])
      }),
      score: Object.freeze({ value: 75, scale: "zero-to-one-hundred" }),
      confidence: Object.freeze({ value: 0.8, level: "high" }),
      reasons: Object.freeze([
        Object.freeze({
          code: "coverage.weaker",
          statement: "Evidence coverage was weaker.",
          weight: 0.5,
          references: Object.freeze([])
        })
      ])
    })
  ]);
}

function createConstraints(): readonly Constraint[] {
  return Object.freeze([
    Object.freeze({
      id: "constraint-1",
      constraintType: "target-role",
      label: "Target Role",
      description: "Role must emphasize AI product leadership.",
      required: true,
      references: Object.freeze([
        Object.freeze({
          referenceId: "target-role-1",
          referenceType: "target-role",
          authority: "authoritative",
          version: 1
        })
      ])
    })
  ]);
}

function createViolations(): readonly ConstraintViolation[] {
  return Object.freeze([
    Object.freeze({
      constraintId: "constraint-1",
      severity: "blocking",
      description: "Target role evidence was incomplete.",
      references: Object.freeze([])
    })
  ]);
}
