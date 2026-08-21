import { describe, expect, it } from "vitest";
import {
  createAssumption,
  createDecision,
  createDecisionExplanation,
  createDecisionGraph,
  createRecommendation,
  createTradeoffAnalysis
} from "../src";
import type {
  Decision,
  DecisionSerializer,
  DecisionVisitor
} from "../src";

describe("decision model DSL", () => {
  it("creates immutable decision metadata, explanations, and decisions", () => {
    const decision = createTestDecision();

    expect(Object.isFrozen(decision)).toBe(true);
    expect(Object.isFrozen(decision.reasons)).toBe(true);
    expect(Object.isFrozen(decision.references)).toBe(true);
    expect(decision.metadata.modelVersion).toBe(1);
    expect(decision.summary.outcome).toBe("recommended");
  });

  it("models recommendation, assumption, tradeoff, and graph values immutably", () => {
    const recommendation = createRecommendation(createTestDecision().recommendations[0]!);
    const assumption = createAssumption({
      id: "assumption-1",
      category: "role-fit",
      statement: "Target role requires AI product depth.",
      confidence: "high",
      status: "supported",
      references: []
    });
    const tradeoffs = createTradeoffAnalysis({
      summary: "Increase AI emphasis and reduce payments emphasis.",
      tradeoffs: []
    });
    const graph = createDecisionGraph({
      nodes: [],
      edges: [],
      dependencies: []
    });

    expect(Object.isFrozen(recommendation)).toBe(true);
    expect(Object.isFrozen(assumption.references)).toBe(true);
    expect(Object.isFrozen(tradeoffs.tradeoffs)).toBe(true);
    expect(Object.isFrozen(graph.nodes)).toBe(true);
  });

  it("supports serializer and visitor contracts without implementation coupling", () => {
    const decision = createTestDecision();
    const serializer: DecisionSerializer<Decision> = {
      serialize: (input) => input,
      deserialize: (input) => input
    };
    const visitor: DecisionVisitor<string> = {
      visitDecision: (input) => input.id,
      visitRecommendation: (input) => input.id,
      visitAlternative: (input) => input.id,
      visitConstraint: (input) => input.id,
      visitTradeoff: (input) => input.id,
      visitAssumption: (input) => input.id,
      visitGraph: (input) => `${input.nodes.length}`
    };

    expect(serializer.deserialize(serializer.serialize(decision))).toBe(decision);
    expect(visitor.visitDecision(decision)).toBe("decision-1");
  });
});

function createTestDecision(): Decision {
  const reason = {
    code: "evidence-strength",
    statement: "Evidence supports the recommendation.",
    references: []
  };
  const explanation = createDecisionExplanation({
    summary: "Recommendation is explainable.",
    reasons: [reason],
    nodes: [],
    edges: [],
    paths: []
  });
  const recommendation = createRecommendation({
    id: "recommendation-1",
    recommendationType: "select",
    title: "Select AI positioning",
    statement: "AI positioning is strongest.",
    status: "recommended",
    score: { value: 90, scale: "zero-to-one-hundred" },
    confidence: { value: 0.9, level: "high" },
    reasons: [reason],
    references: [],
    explanation,
    metadata: {
      decisionId: "decision-1",
      modelVersion: 1,
      createdAt: "2026-07-23T00:00:00.000Z"
    }
  });

  return createDecision({
    id: "decision-1",
    title: "Positioning decision",
    question: "Which positioning should be used?",
    outcome: "recommended",
    status: "recommended",
    score: { value: 90, scale: "zero-to-one-hundred" },
    confidence: { value: 0.9, level: "high" },
    reasons: [reason],
    references: [],
    recommendations: [recommendation],
    explanation,
    summary: {
      headline: "Use AI positioning",
      summary: "AI evidence is strongest.",
      outcome: "recommended",
      reasons: [reason]
    },
    metadata: {
      decisionId: "decision-1",
      modelVersion: 1,
      createdAt: "2026-07-23T00:00:00.000Z"
    }
  });
}
