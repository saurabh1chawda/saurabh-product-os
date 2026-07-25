import { describe, expect, it } from "vitest";
import {
  createClassificationPolicy,
  createCompositeComparator,
  createConfidence,
  createConfidenceFactor,
  createEvidenceStrengthPolicy,
  createGapClassification,
  createGapSeverityPolicy,
  createOrderingKey,
  createOrderingPolicy,
  createOrderingResult,
  createOrderingSpecification,
  createRankingReason,
  createScoreBreakdown,
  createScoreContribution,
  createScoreDimension,
  createScorePenalty,
  createScoreWeight,
  createScoringPolicy,
  createTieBreakRule,
  createWeightedScore
} from "../src";
import type {
  ArtifactSupporting,
  Comparator,
  ConfidenceAware,
  EvidenceAware,
  Explained,
  GapAware,
  Ordered,
  Ranked,
  Scored
} from "../src";
import type { ExplanationSummary } from "@career-companion/explainability";
import packageJson from "../package.json";

describe("product intelligence foundation", () => {
  it("creates immutable score primitives without scoring engines", () => {
    const weight = createScoreWeight({ key: "evidence-strength", weight: 1.5, rationale: "bounded" });
    const dimension = createScoreDimension({
      dimension: "evidence-strength",
      score: 130,
      weight: 0.4,
      rationale: "Selected evidence strength."
    });
    const contribution = createScoreContribution({
      source: "evidence",
      amount: 12,
      rationale: "Evidence contributed to readiness."
    });
    const penalty = createScorePenalty({
      code: "missing-evidence",
      amount: 5,
      severity: "high",
      rationale: "Gap reduces readiness."
    });
    const breakdown = createScoreBreakdown({
      overallScore: 120,
      band: "strong",
      dimensions: [dimension],
      contributions: [contribution],
      penalties: [penalty]
    });
    const weighted = createWeightedScore({ value: 80, weight: 0.25, band: "high" });

    expect(weight.weight).toBe(1);
    expect(dimension.score).toBe(100);
    expect(breakdown.overallScore).toBe(100);
    expect(weighted.weightedValue).toBe(20);
    expect(Object.isFrozen(breakdown)).toBe(true);
    expect(Object.isFrozen(breakdown.dimensions)).toBe(true);
  });

  it("creates immutable confidence and gap models with shared enums", () => {
    const confidence = createConfidence({ value: 0.81, band: "low", rationale: "Input is normalized." });
    const factor = createConfidenceFactor({ factor: "coverage", value: 2, weight: 1.5, rationale: "bounded factor" });
    const gap = createGapClassification({
      gapId: "gap:coverage",
      gapType: "coverage",
      severity: "medium",
      priority: "high",
      rationale: "Coverage is incomplete."
    });

    expect(confidence.band).toBe("high");
    expect(factor.value).toBe(1);
    expect(factor.weight).toBe(1);
    expect(gap.severity).toBe("medium");
    expect(Object.isFrozen(confidence)).toBe(true);
    expect(Object.isFrozen(gap)).toBe(true);
  });

  it("creates immutable policies that hold configuration only", () => {
    const classification = createClassificationPolicy({
      policyId: "classification:default",
      minimumConfidence: "medium",
      acceptedCategories: ["product", "leadership"],
      fallbackCategory: "unknown"
    });
    const scoring = createScoringPolicy({
      policyId: "scoring:default",
      scoreScale: "zero-to-one-hundred",
      weights: [createScoreWeight({ key: "coverage", weight: 0.4 })],
      passingBand: "medium"
    });
    const evidence = createEvidenceStrengthPolicy({
      policyId: "evidence:default",
      minimumStrength: "supporting",
      preferredStrengths: ["primary", "authoritative"]
    });
    const gap = createGapSeverityPolicy({
      policyId: "gap:default",
      defaultSeverity: "medium",
      escalationPriority: "critical"
    });
    const ordering = createOrderingPolicy({
      policyId: "ordering:default",
      defaultDirection: "descending",
      stableTieBreakRequired: true
    });

    expect(Object.isFrozen(classification.acceptedCategories)).toBe(true);
    expect(Object.isFrozen(scoring.weights)).toBe(true);
    expect(Object.isFrozen(evidence.preferredStrengths)).toBe(true);
    expect(gap.escalationPriority).toBe("critical");
    expect(ordering.stableTieBreakRequired).toBe(true);
  });

  it("defines deterministic ordering contracts without ranking algorithms", () => {
    const scoreKey = createOrderingKey({ key: "score", direction: "descending", priority: 1 });
    const idKey = createOrderingKey({ key: "id", direction: "ascending", priority: 2 });
    const specification = createOrderingSpecification<{ readonly id: string; readonly score: number }>({
      specificationId: "ordering:score-then-id",
      rules: [{
        ruleId: "score",
        key: scoreKey,
        describe: (item) => item.score
      }],
      tieBreakRules: [idKey]
    });
    const result = createOrderingResult({
      orderedItems: [{ id: "a", score: 10 }],
      appliedRules: [scoreKey, idKey],
      stable: true
    });

    expect(specification.rules[0]?.describe({ id: "a", score: 10 })).toBe(10);
    expect(result.stable).toBe(true);
    expect(Object.isFrozen(specification.rules)).toBe(true);
    expect(Object.isFrozen(result.orderedItems)).toBe(true);
  });

  it("defines comparator contracts and composite tie-break metadata", () => {
    const numericComparator: Comparator<number> = {
      compare: (left, right) => left === right ? 0 : left > right ? -1 : 1
    };
    const tieBreak = createTieBreakRule({
      ruleId: "canonical-id",
      priority: 1,
      comparator: numericComparator,
      reason: createRankingReason({
        code: "stable-tie-break",
        statement: "Stable ordering requires a canonical tie-break."
      })
    });
    const composite = createCompositeComparator({
      compare: numericComparator.compare,
      criteria: [{
        criterionId: "score",
        description: "Higher score first.",
        comparator: numericComparator
      }],
      tieBreakRules: [tieBreak]
    });

    expect(composite.compare(2, 1)).toBe(-1);
    expect(composite.tieBreakRules[0]?.reason.code).toBe("stable-tie-break");
    expect(Object.isFrozen(composite.criteria)).toBe(true);
  });

  it("supports shared compositional contracts", () => {
    const model = {
      score: createScoreBreakdown({
        overallScore: 70,
        band: "medium",
        dimensions: [],
        contributions: [],
        penalties: []
      }),
      rank: 1,
      rankingReasons: [createRankingReason({ code: "score", statement: "Higher score first." })],
      explanationSummary: {} as ExplanationSummary,
      confidence: createConfidence({ value: 0.7, band: "medium" }),
      gaps: [],
      order: 1,
      evidence: [],
      artifactReferences: []
    } satisfies Scored & Ranked & Explained & ConfidenceAware & GapAware & Ordered & EvidenceAware & ArtifactSupporting;

    expect(model.rank).toBe(1);
    expect(model.confidence.band).toBe("medium");
    expect(model.artifactReferences).toEqual([]);
  });

  it("keeps dependency boundaries free of product-specific modules", () => {
    const dependencies = Object.keys(packageJson.dependencies).sort();

    expect(dependencies).toEqual([
      "@career-companion/career-artifacts",
      "@career-companion/explainability",
      "@career-companion/kernel"
    ].sort());
    expect(dependencies).not.toContain("@career-companion/resume-intelligence");
    expect(dependencies).not.toContain("@career-companion/portfolio-intelligence");
    expect(dependencies).not.toContain("@career-companion/interview-intelligence");
    expect(dependencies).not.toContain("@career-companion/application");
  });

  it("exports the public API from the package root", async () => {
    const api = await import("../src");

    expect(api.createScoreWeight).toBeTypeOf("function");
    expect(api.createScoringPolicy).toBeTypeOf("function");
    expect(api.createOrderingSpecification).toBeTypeOf("function");
    expect(api.createCompositeComparator).toBeTypeOf("function");
  });
});
