import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { CareerArtifact } from "@career-companion/career-artifacts";
import type { CareerStrategy } from "@career-companion/career-strategy";
import type { OpportunityDecision } from "@career-companion/opportunity-intelligence";
import type { PortfolioModel } from "@career-companion/portfolio-intelligence";
import { describe, expect, it } from "vitest";
import {
  EvidenceNeedsAnalyzer,
  InitiativeEvaluationAnalyzer,
  PortfolioInitiativesAnalyzer,
  PortfolioPlanAnalyzer,
  PortfolioPlanContextAnalyzer,
  PortfolioRoadmapAnalyzer
} from "../src";
import packageJson from "../package.json";

describe("portfolio planner", () => {
  it("creates the canonical deterministic portfolio planning pipeline", () => {
    const result = runPipeline();

    expect(result.context.artifactKind).toBe("PortfolioPlanContext");
    expect(result.needs.artifactKind).toBe("EvidenceNeeds");
    expect(result.initiatives.artifactKind).toBe("PortfolioInitiatives");
    expect(result.evaluation.artifactKind).toBe("InitiativeEvaluation");
    expect(result.roadmap.artifactKind).toBe("PortfolioRoadmap");
    expect(result.plan.artifactKind).toBe("PortfolioPlan");
    expect(["PublishReady", "ImproveBeforePublishing", "BuildCriticalEvidence", "SequenceStrategicInitiatives"]).toContain(result.plan.outcome);
  });

  it("keeps PortfolioPlanContext descriptive and as the only aggregation boundary", () => {
    const context = new PortfolioPlanContextAnalyzer().analyze(input());

    expect(context.sourceReferences.map((reference) => reference.referenceId)).toEqual(["artifact:career-strategy", "artifact:portfolio", "artifact:opportunity"]);
    expect(context.sequence.map((stage) => stage.stage)).toEqual(["PortfolioPlanContext", "EvidenceNeeds", "PortfolioInitiatives", "InitiativeEvaluation", "PortfolioRoadmap", "PortfolioPlan"]);
    expect(context).not.toHaveProperty("needs");
    expect(context).not.toHaveProperty("initiatives");
    expect(context).not.toHaveProperty("recommendations");
  });

  it("represents evidence needs without initiatives or sequencing", () => {
    const { needs } = runPipeline({ weakPortfolio: true });

    expect(needs.needs.length).toBeGreaterThan(0);
    expect(needs.portfolioGaps.length).toBeGreaterThan(0);
    expect(needs).not.toHaveProperty("initiatives");
    expect(needs).not.toHaveProperty("roadmap");
  });

  it("creates portfolio initiatives without evaluation", () => {
    const { initiatives } = runPipeline();

    expect(initiatives.initiatives.map((item) => item.kind)).toContain("ImproveEvidence");
    expect(initiatives.initiatives.map((item) => item.kind)).toContain("PublishEvidence");
    expect(initiatives).not.toHaveProperty("evaluations");
    expect(initiatives).not.toHaveProperty("orderedInitiatives");
  });

  it("evaluates initiatives without creating a roadmap or final plan", () => {
    const { evaluation } = runPipeline();

    expect(evaluation.evaluations.length).toBeGreaterThan(1);
    expect(evaluation.evaluations[0]?.scoreBreakdown.overallScore).toBeGreaterThanOrEqual(0);
    expect(evaluation).not.toHaveProperty("items");
    expect(evaluation).not.toHaveProperty("outcome");
  });

  it("creates a roadmap without execution tracking", () => {
    const { roadmap } = runPipeline();

    expect(roadmap.items.map((item) => item.sequence)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(roadmap.items[1]?.dependencyIds).toEqual([roadmap.items[0]?.initiativeId]);
    expect(roadmap).not.toHaveProperty("status");
    expect(roadmap).not.toHaveProperty("completedAt");
  });

  it("creates a portfolio plan without writing, editing, publishing, or project management", () => {
    const { plan } = runPipeline();

    expect(plan.orderedInitiatives.length).toBeGreaterThan(0);
    expect(plan.recommendations.length).toBe(1);
    expect(plan).not.toHaveProperty("caseStudyDraft");
    expect(plan).not.toHaveProperty("publishingJob");
    expect(plan).not.toHaveProperty("tasks");
  });

  it("enforces immediate predecessor analyzer signatures", () => {
    const source = readSource(sourceDirectory());

    expect(source).toContain("analyze(input: PortfolioPlanContextInput): PortfolioPlanContext");
    expect(source).toContain("analyze(context: PortfolioPlanContext): EvidenceNeeds");
    expect(source).toContain("analyze(needs: EvidenceNeeds): PortfolioInitiatives");
    expect(source).toContain("analyze(initiatives: PortfolioInitiatives): InitiativeEvaluation");
    expect(source).toContain("analyze(evaluation: InitiativeEvaluation): PortfolioRoadmap");
    expect(source).toContain("analyze(roadmap: PortfolioRoadmap): PortfolioPlan");
    expect(source).not.toContain("analyze(input: CareerStrategy");
  });

  it("produces immutable deterministic output", () => {
    const first = runPipeline();
    const second = runPipeline();

    expect(first.plan).toEqual(second.plan);
    expect(Object.isFrozen(first.plan)).toBe(true);
    expect(Object.isFrozen(first.plan.orderedInitiatives)).toBe(true);
    expect(first.roadmap.careerStrategy).toBe(first.context.careerStrategy);
    expect(first.evaluation.portfolio).toBe(first.context.portfolio);
  });

  it("reuses Product Intelligence vocabulary", () => {
    const { needs, evaluation, plan } = runPipeline();

    expect(needs.portfolioGaps.every((gap) => ["low", "medium", "high"].includes(gap.severity))).toBe(true);
    expect(evaluation.evaluations[0]?.scoreBreakdown).toHaveProperty("dimensions");
    expect(plan.confidenceFactors[0]).toHaveProperty("factor");
    expect(["Critical", "High", "Medium", "Low"]).toContain(plan.recommendations[0]?.priority);
  });

  it("adds deterministic explainability for every stage", () => {
    const result = runPipeline();

    expect(result.context.explanationSummary.decisionId).toBe(result.context.contextId);
    expect(result.needs.explanationSummary.decisionId).toBe(result.needs.needsId);
    expect(result.initiatives.explanationSummary.decisionId).toBe(result.initiatives.initiativesId);
    expect(result.evaluation.explanationSummary.decisionId).toBe(result.evaluation.evaluationId);
    expect(result.roadmap.explanationSummary.decisionId).toBe(result.roadmap.roadmapId);
    expect(result.plan.explanationSummary.decisionId).toBe(result.plan.planId);
  });

  it("documents the bounded context architecture contract", () => {
    const readme = readFileSync(join(packageRoot(), "README.md"), "utf8");

    expect(readme).toContain("## INPUTS");
    expect(readme).toContain("## OUTPUTS");
    expect(readme).toContain("## OWNS");
    expect(readme).toContain("## DOES NOT OWN");
    expect(readme).toContain("## PIPELINE");
    expect(readme).toContain("## AGGREGATION BOUNDARY");
    expect(readme).toContain("## DEPENDENCY BOUNDARIES");
    expect(readme).toContain("## DETERMINISM GUARANTEE");
  });

  it("keeps dependency boundaries clean", () => {
    const dependencies = Object.keys(packageJson.dependencies);

    expect(dependencies).toContain("@career-companion/career-strategy");
    expect(dependencies).toContain("@career-companion/portfolio-intelligence");
    expect(dependencies).toContain("@career-companion/opportunity-intelligence");
    expect(dependencies).not.toContain("@career-companion/resume-intelligence");
    expect(dependencies).not.toContain("@career-companion/ats-intelligence");
    expect(dependencies).not.toContain("@career-companion/hiring-intelligence");
    expect(dependencies).not.toContain("@career-companion/infrastructure");
    expect(dependencies).not.toContain("@career-companion/persistence");
  });

  it("keeps source free of forbidden technologies and ownership leaks", () => {
    const source = readSource(sourceDirectory()).toLowerCase();

    expect(source).not.toContain("@career-companion/resume-intelligence");
    expect(source).not.toContain("@career-companion/ats-intelligence");
    expect(source).not.toContain("@career-companion/hiring-intelligence");
    expect(source).not.toContain("@career-companion/persistence");
    expect(source).not.toContain("@career-companion/infrastructure");
    expect(source).not.toContain("fetch(");
    expect(source).not.toContain("openai");
    expect(source).not.toContain("embedding");
    expect(source).not.toContain("case study draft");
    expect(source).not.toContain("publishing job");
  });
});

function runPipeline(options: FixtureOptions = {}) {
  const context = new PortfolioPlanContextAnalyzer().analyze(input(options));
  const needs = new EvidenceNeedsAnalyzer().analyze(context);
  const initiatives = new PortfolioInitiativesAnalyzer().analyze(needs);
  const evaluation = new InitiativeEvaluationAnalyzer().analyze(initiatives);
  const roadmap = new PortfolioRoadmapAnalyzer().analyze(evaluation);
  const plan = new PortfolioPlanAnalyzer().analyze(roadmap);

  return { context, needs, initiatives, evaluation, roadmap, plan };
}

interface FixtureOptions {
  readonly weakPortfolio?: boolean;
}

function input(options: FixtureOptions = {}) {
  return {
    careerStrategy: careerStrategy(options),
    portfolio: portfolio(options),
    opportunityDecision: opportunityDecision(options),
    assumptions: ["portfolio planning uses canonical intelligence"],
    constraints: [{ constraintId: "constraint:no-publishing", label: "Planner does not publish", value: "true" }],
    traceId: "trace:portfolio-planner-test"
  };
}

function careerStrategy(options: FixtureOptions): CareerStrategy {
  const weak = options.weakPortfolio === true;
  return {
    artifactKind: "CareerStrategy",
    strategyId: "career-strategy-1",
    evaluationId: "strategy-evaluation-1",
    profile: weak ? "LeadershipFirst" : "AITransformation",
    selectedOptionId: "strategy-option:AIFirst",
    confidence: { value: weak ? 0.62 : 0.86, band: weak ? "medium" : "high" },
    supportingEvidence: ["leadership", "ai", "platform"],
    assumptions: ["strategy fixture"],
    constraints: [],
    risks: weak ? ["portfolio evidence gap", "leadership evidence gap"] : ["market visibility gap"],
    strategicMilestones: [],
    decisionTrace: "trace:strategy",
    scoreSummary: scoreBreakdown(weak ? 61 : 86),
    recommendationPriority: weak ? "High" : "Low",
    expectedImpact: weak ? "Moderate" : "Significant",
    confidenceFactors: [],
    alternativeStrategiesConsidered: ["BalancedGrowth"],
    artifact: artifact("artifact:career-strategy"),
    explanationSummary: {}
  } as unknown as CareerStrategy;
}

function portfolio(options: FixtureOptions): PortfolioModel {
  const weak = options.weakPortfolio === true;
  return {
    artifact: artifact("artifact:portfolio"),
    caseStudies: [],
    projects: [],
    recommendations: [],
    gaps: weak
      ? [
          { gapId: "gap:leadership", description: "insufficient leadership evidence", severity: "high", supportingEvidence: [], recommendedImprovement: "add leadership case study", confidence: { value: 0.8, band: "high" } },
          { gapId: "gap:impact", description: "weak quantified outcomes", severity: "medium", supportingEvidence: [], recommendedImprovement: "quantify outcomes", confidence: { value: 0.7, band: "medium" } }
        ]
      : [
          { gapId: "gap:publish", description: "portfolio publication readiness", severity: "low", supportingEvidence: [], recommendedImprovement: "prepare publishing sequence", confidence: { value: 0.7, band: "medium" } }
        ],
    score: {
      value: weak ? 48 : 82,
      projectQuality: weak ? 50 : 82,
      businessImpact: weak ? 42 : 84,
      technicalDepth: weak ? 58 : 86,
      leadershipEvidence: weak ? 35 : 78,
      domainDiversity: weak ? 55 : 76,
      recency: weak ? 62 : 80,
      evidenceStrength: weak ? 40 : 82,
      coverage: weak ? 44 : 80,
      consistency: weak ? 50 : 78
    },
    explanationSummary: {},
    sections: []
  } as unknown as PortfolioModel;
}

function opportunityDecision(options: FixtureOptions): OpportunityDecision {
  const weak = options.weakPortfolio === true;
  return {
    artifactKind: "OpportunityDecision",
    decisionId: "opportunity-decision-1",
    fitId: "fit-1",
    outcome: weak ? "WorthExploring" : "PursueImmediately",
    confidence: { value: weak ? 0.55 : 0.88, band: weak ? "medium" : "high" },
    supportingEvidence: weak ? ["market-signal"] : ["company-context", "role-quality", "market-signal"],
    risks: weak ? ["portfolio-uncertainty"] : [],
    assumptions: ["caller supplied opportunity evidence"],
    constraints: ["no ats evaluation"],
    opportunityStrengths: [],
    opportunityWeaknesses: [],
    candidateStrengths: [],
    candidateGaps: [],
    scoreSummary: scoreBreakdown(weak ? 55 : 88),
    recommendationPriority: weak ? "Medium" : "Low",
    recommendations: [],
    alternativeOutcomesConsidered: ["HighPriority", "WorthExploring", "Monitor", "Decline"],
    confidenceFactors: [],
    traceId: "trace:opportunity",
    artifact: artifact("artifact:opportunity"),
    explanationSummary: {}
  } as unknown as OpportunityDecision;
}

function scoreBreakdown(score: number) {
  return {
    overallScore: score,
    band: score >= 85 ? "strong" : score >= 70 ? "high" : score >= 50 ? "medium" : "needs-review",
    dimensions: [{ dimension: "Readiness", score, weight: 1, rationale: "fixture" }],
    contributions: [],
    penalties: []
  };
}

function artifact(artifactId: string): CareerArtifact {
  return {
    artifactId,
    artifactType: "CareerReport",
    metadata: { artifactId, artifactType: "CareerReport", title: artifactId, createdAt: "1970-01-01T00:00:00.000Z", source: "fixture", version: 1, references: [] },
    summary: { headline: artifactId, summary: artifactId, references: [] },
    sections: []
  } as unknown as CareerArtifact;
}

function readSource(directory: string): string {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) return readSource(path);
    if (!entry.endsWith(".ts")) return "";
    return readFileSync(path, "utf8");
  }).join("\n");
}

function packageRoot(): string {
  const packageLocal = process.cwd();
  if (existsSync(join(packageLocal, "package.json")) && packageLocal.endsWith("portfolio-planner")) return packageLocal;
  return join(process.cwd(), "packages", "portfolio-planner");
}

function sourceDirectory(): string {
  return join(packageRoot(), "src");
}
