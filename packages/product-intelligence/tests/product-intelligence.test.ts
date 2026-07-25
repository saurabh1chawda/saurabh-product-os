import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import * as publicApi from "@career-companion/product-intelligence";
import {
  RECOMMENDATION_CATEGORIES,
  RECOMMENDATION_IMPACTS,
  RECOMMENDATION_PRIORITIES,
  RECOMMENDATION_TYPES,
  createClassificationPolicy,
  createConfidence,
  createConfidenceFactor,
  createEvidenceStrengthPolicy,
  createGapClassification,
  createGapEvidence,
  createGapSeverityPolicy,
  createMissingEvidenceDescriptor,
  createOrderingPolicy,
  createRankingReason,
  createScoreBreakdown,
  createScoreContribution,
  createScoreDimension,
  createScorePenalty,
  createScoreWeight,
  createScoringPolicy,
  createWeightedScore
} from "@career-companion/product-intelligence";
import type {
  ArtifactSupporting,
  ConfidenceAware,
  EvidenceAware,
  Explained,
  GapAware,
  Ordered,
  Ranked,
  Scored
} from "@career-companion/product-intelligence";
import type { ArtifactEvidence } from "@career-companion/career-artifacts";
import type { ExplanationSummary } from "@career-companion/explainability";
import packageJson from "../package.json";

describe("product intelligence foundation", () => {
  it("exposes only stable public domain vocabulary from the package root", () => {
    expect(publicApi.createScoreWeight).toBeTypeOf("function");
    expect(publicApi.createScoringPolicy).toBeTypeOf("function");
    expect(publicApi.createGapEvidence).toBeTypeOf("function");
    expect(publicApi.RECOMMENDATION_PRIORITIES).toEqual(["Critical", "High", "Medium", "Low"]);
    expect(publicApi.RECOMMENDATION_CATEGORIES).toContain("Evidence");
    expect(publicApi.RECOMMENDATION_IMPACTS).toContain("Significant");
    expect(publicApi.RECOMMENDATION_TYPES).toContain("Quantify");
  });

  it("does not expose generic comparator or low-level ordering mechanics publicly", () => {
    expect("Comparator" in publicApi).toBe(false);
    expect("CompositeComparator" in publicApi).toBe(false);
    expect("ComparisonCriterion" in publicApi).toBe(false);
    expect("OrderingSpecification" in publicApi).toBe(false);
    expect("OrderingKey" in publicApi).toBe(false);
    expect("OrderingResult" in publicApi).toBe(false);
    expect("createCompositeComparator" in publicApi).toBe(false);
    expect("createOrderingSpecification" in publicApi).toBe(false);
  });

  it("keeps package exports limited to the root public API", () => {
    expect(Object.keys(packageJson.exports)).toEqual(["."]);
    expect(JSON.stringify(packageJson.exports)).not.toContain("internal");
    expect(JSON.stringify(packageJson.exports)).not.toContain("comparators");
    expect(JSON.stringify(packageJson.exports)).not.toContain("ordering");
  });

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
    expect(() => (breakdown.dimensions as unknown as unknown[]).push(dimension)).toThrow(TypeError);
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

  it("exposes immutable recommendation vocabulary without a recommendation engine", () => {
    expect(RECOMMENDATION_PRIORITIES).toEqual(["Critical", "High", "Medium", "Low"]);
    expect(RECOMMENDATION_CATEGORIES).toEqual([
      "Evidence",
      "Positioning",
      "Clarity",
      "Coverage",
      "Impact",
      "Readiness",
      "Alignment",
      "RiskMitigation"
    ]);
    expect(RECOMMENDATION_IMPACTS).toEqual(["Transformational", "Significant", "Moderate", "Minor"]);
    expect(RECOMMENDATION_TYPES).toEqual(["Add", "Strengthen", "Clarify", "Quantify", "Reframe", "Validate", "Remove", "Replace", "Prepare"]);
    expect(Object.isFrozen(RECOMMENDATION_PRIORITIES)).toBe(true);
    expect(Object.isFrozen(RECOMMENDATION_CATEGORIES)).toBe(true);
    expect(Object.isFrozen(RECOMMENDATION_IMPACTS)).toBe(true);
    expect(Object.isFrozen(RECOMMENDATION_TYPES)).toBe(true);
  });

  it("creates immutable GapEvidence from canonical evidence and reference models", () => {
    const supportingEvidence = [Object.freeze({ evidence: {}, reference: {}, confidence: {}, score: {} }) as ArtifactEvidence];
    const missingEvidence = [createMissingEvidenceDescriptor({
      descriptorId: "missing:metric",
      evidenceType: "metric",
      description: "A verified quantified outcome is missing.",
      reference: {
        referenceId: "artifact-reference:metric",
        referenceType: "metric",
        label: "Verified metric"
      }
    })];
    const gapEvidence = createGapEvidence({
      supportingEvidence,
      missingEvidence,
      confidence: createConfidence({ value: 0.7, band: "medium", rationale: "Partial evidence exists." }),
      constraintReferences: [{
        referenceId: "constraint:validated-evidence",
        referenceType: "constraint",
        label: "Validated evidence only"
      }],
      explanationReference: {
        referenceId: "explanation:gap",
        referenceType: "explanation",
        label: "Gap explanation"
      }
    });

    expect(gapEvidence.supportingEvidence).toHaveLength(1);
    expect(gapEvidence.missingEvidence[0]?.evidenceType).toBe("metric");
    expect(gapEvidence.confidence.band).toBe("medium");
    expect(gapEvidence.constraintReferences[0]?.referenceType).toBe("constraint");
    expect(gapEvidence.explanationReference?.referenceType).toBe("explanation");
    expect(Object.isFrozen(gapEvidence)).toBe(true);
    expect(Object.isFrozen(gapEvidence.supportingEvidence)).toBe(true);
    expect(Object.isFrozen(gapEvidence.missingEvidence)).toBe(true);
    expect(Object.isFrozen(gapEvidence.constraintReferences)).toBe(true);
    expect(() => (gapEvidence.missingEvidence as unknown as unknown[]).push(missingEvidence[0])).toThrow(TypeError);
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
      criteria: [{
        criterion: "score",
        direction: "descending",
        priority: 1,
        rationale: "Higher score appears first."
      }],
      stableTieBreakRequired: true,
      tieBreakRationale: "Canonical stable ordering is required for deterministic outputs."
    });

    expect(Object.isFrozen(classification.acceptedCategories)).toBe(true);
    expect(Object.isFrozen(scoring.weights)).toBe(true);
    expect(Object.isFrozen(evidence.preferredStrengths)).toBe(true);
    expect(gap.escalationPriority).toBe("critical");
    expect(ordering.stableTieBreakRequired).toBe(true);
    expect(Object.isFrozen(ordering.criteria)).toBe(true);
    expect("compare" in ordering).toBe(false);
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

  it("produces deterministic structural outputs for equivalent inputs", () => {
    const first = createGapEvidence({
      supportingEvidence: [],
      missingEvidence: [createMissingEvidenceDescriptor({
        descriptorId: "missing:evidence",
        evidenceType: "evidence",
        description: "Evidence is missing."
      })],
      confidence: createConfidence({ value: 0.5, band: "medium" }),
      constraintReferences: []
    });
    const second = createGapEvidence({
      supportingEvidence: [],
      missingEvidence: [createMissingEvidenceDescriptor({
        descriptorId: "missing:evidence",
        evidenceType: "evidence",
        description: "Evidence is missing."
      })],
      confidence: createConfidence({ value: 0.5, band: "medium" }),
      constraintReferences: []
    });

    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });

  it("keeps dependency boundaries free of product-specific and infrastructure modules", () => {
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
    expect(dependencies).not.toContain("@career-companion/persistence");
    expect(dependencies).not.toContain("@career-companion/repositories");
    expect(dependencies).not.toContain("@career-companion/retrieval");
  });

  it("keeps production source free of product-specific terminology", () => {
    const productionSource = readProductionSource(join(__dirname, "../src"));

    expect(productionSource).not.toMatch(/\bResume\b/u);
    expect(productionSource).not.toMatch(/\bPortfolio\b/u);
    expect(productionSource).not.toMatch(/\bInterview\b/u);
    expect(productionSource).not.toMatch(/\bJob\b/u);
  });

  it("has no external import usage of protected internal paths", () => {
    const workspaceSource = readProductionSource(join(__dirname, "../../"));

    expect(workspaceSource).not.toContain("@career-companion/product-intelligence/internal");
    expect(workspaceSource).not.toContain("@career-companion/product-intelligence/comparators");
    expect(workspaceSource).not.toContain("@career-companion/product-intelligence/ordering");
  });
});

function readProductionSource(directory: string): string {
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = join(directory, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      if (entry === "tests" || entry === "dist" || entry === "node_modules" || entry === ".turbo") {
        return [];
      }

      return [readProductionSource(fullPath)];
    }

    if (!entry.endsWith(".ts")) {
      return [];
    }

    return [readFileSync(fullPath, "utf8")];
  }).join("\n");
}
