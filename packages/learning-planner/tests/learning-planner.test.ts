import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { CareerArtifact } from "@career-companion/career-artifacts";
import type { CareerStrategy } from "@career-companion/career-strategy";
import type { OpportunityDecision } from "@career-companion/opportunity-intelligence";
import type { PortfolioPlan } from "@career-companion/portfolio-planner";
import { describe, expect, it } from "vitest";
import {
  CapabilityNeedsAnalyzer,
  LearningEvaluationAnalyzer,
  LearningInitiativesAnalyzer,
  LearningPlanAnalyzer,
  LearningPlanContextAnalyzer,
  LearningRoadmapAnalyzer
} from "../src";
import packageJson from "../package.json";

describe("learning planner", () => {
  it("creates the canonical deterministic learning planning pipeline", () => {
    const result = runPipeline();

    expect(result.context.artifactKind).toBe("LearningPlanContext");
    expect(result.needs.artifactKind).toBe("CapabilityNeeds");
    expect(result.initiatives.artifactKind).toBe("LearningInitiatives");
    expect(result.evaluation.artifactKind).toBe("LearningEvaluation");
    expect(result.roadmap.artifactKind).toBe("LearningRoadmap");
    expect(result.plan.artifactKind).toBe("LearningPlan");
    expect(["CapabilityFocusedGrowth", "StrategicCapabilityAcceleration", "EvidenceLedLearning", "FoundationBuilding"]).toContain(result.plan.outcome);
  });

  it("keeps LearningPlanContext descriptive and as the only aggregation boundary", () => {
    const context = new LearningPlanContextAnalyzer().analyze(input());

    expect(context.sourceReferences.map((reference) => reference.referenceId)).toEqual(["artifact:career-strategy", "artifact:portfolio-plan", "artifact:opportunity"]);
    expect(context.sequence.map((stage) => stage.stage)).toEqual(["LearningPlanContext", "CapabilityNeeds", "LearningInitiatives", "LearningEvaluation", "LearningRoadmap", "LearningPlan"]);
    expect(context).not.toHaveProperty("needs");
    expect(context).not.toHaveProperty("initiatives");
    expect(context).not.toHaveProperty("recommendations");
  });

  it("identifies capability needs without initiatives or roadmap", () => {
    const { needs } = runPipeline({ weakCapability: true });

    expect(needs.needs.length).toBeGreaterThan(4);
    expect(needs.needs.map((need) => need.category)).toContain("AIProductManagement");
    expect(needs).not.toHaveProperty("initiatives");
    expect(needs).not.toHaveProperty("roadmap");
  });

  it("generates learning initiatives without resources or evaluation", () => {
    const { initiatives } = runPipeline();

    expect(initiatives.initiatives.map((item) => item.kind)).toContain("BuildAIPrototype");
    expect(initiatives.initiatives.map((item) => item.kind)).toContain("CreateDecisionFramework");
    expect(initiatives).not.toHaveProperty("course");
    expect(initiatives).not.toHaveProperty("evaluations");
  });

  it("evaluates initiatives without creating a roadmap", () => {
    const { evaluation } = runPipeline();

    expect(evaluation.evaluations.length).toBeGreaterThan(1);
    expect(evaluation.evaluations[0]?.scoreBreakdown.overallScore).toBeGreaterThanOrEqual(0);
    expect(evaluation).not.toHaveProperty("items");
    expect(evaluation).not.toHaveProperty("schedule");
  });

  it("creates a roadmap without scheduling or execution tracking", () => {
    const { roadmap } = runPipeline();

    expect(roadmap.items.map((item) => item.sequence)).toEqual(roadmap.items.map((_, index) => index + 1));
    expect(roadmap.items[1]?.dependencyIds).toEqual([roadmap.items[0]?.initiativeId]);
    expect(roadmap).not.toHaveProperty("calendar");
    expect(roadmap).not.toHaveProperty("completedAt");
    expect(roadmap).not.toHaveProperty("progress");
  });

  it("creates a learning plan without execution or coaching", () => {
    const { plan } = runPipeline();

    expect(plan.prioritizedInitiatives.length).toBeGreaterThan(0);
    expect(plan.capabilityOutcomes.length).toBe(plan.prioritizedInitiatives.length);
    expect(plan).not.toHaveProperty("reminders");
    expect(plan).not.toHaveProperty("coachingNotes");
    expect(plan).not.toHaveProperty("tasks");
  });

  it("enforces immediate predecessor analyzer signatures", () => {
    const source = readSource(sourceDirectory());

    expect(source).toContain("analyze(input: LearningPlanContextInput): LearningPlanContext");
    expect(source).toContain("analyze(context: LearningPlanContext): CapabilityNeeds");
    expect(source).toContain("analyze(needs: CapabilityNeeds): LearningInitiatives");
    expect(source).toContain("analyze(initiatives: LearningInitiatives): LearningEvaluation");
    expect(source).toContain("analyze(evaluation: LearningEvaluation): LearningRoadmap");
    expect(source).toContain("analyze(roadmap: LearningRoadmap): LearningPlan");
    expect(source).not.toContain("analyze(input: CareerStrategy");
  });

  it("produces immutable deterministic output", () => {
    const first = runPipeline();
    const second = runPipeline();

    expect(first.plan).toEqual(second.plan);
    expect(Object.isFrozen(first.plan)).toBe(true);
    expect(Object.isFrozen(first.plan.prioritizedInitiatives)).toBe(true);
    expect(first.roadmap.careerStrategy).toBe(first.context.careerStrategy);
    expect(first.evaluation.portfolioPlan).toBe(first.context.portfolioPlan);
  });

  it("reuses Product Intelligence vocabulary", () => {
    const { needs, evaluation, plan } = runPipeline();

    expect(needs.needs.every((need) => ["low", "medium", "high"].includes(need.gap.severity))).toBe(true);
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
    expect(dependencies).toContain("@career-companion/portfolio-planner");
    expect(dependencies).toContain("@career-companion/opportunity-intelligence");
    expect(dependencies).not.toContain("@career-companion/ats-intelligence");
    expect(dependencies).not.toContain("@career-companion/hiring-intelligence");
    expect(dependencies).not.toContain("@career-companion/infrastructure");
    expect(dependencies).not.toContain("@career-companion/persistence");
  });

  it("keeps source free of forbidden technologies and resource ownership leaks", () => {
    const source = readSource(sourceDirectory()).toLowerCase();

    expect(source).not.toContain("@career-companion/ats-intelligence");
    expect(source).not.toContain("@career-companion/hiring-intelligence");
    expect(source).not.toContain("@career-companion/persistence");
    expect(source).not.toContain("@career-companion/infrastructure");
    expect(source).not.toContain("fetch(");
    expect(source).not.toContain("openai");
    expect(source).not.toContain("coursera");
    expect(source).not.toContain("udemy");
    expect(source).not.toContain("youtube");
    expect(source).not.toContain("certification");
    expect(source).not.toContain("calendar");
    expect(source).not.toContain("reminder");
  });
});

function runPipeline(options: FixtureOptions = {}) {
  const context = new LearningPlanContextAnalyzer().analyze(input(options));
  const needs = new CapabilityNeedsAnalyzer().analyze(context);
  const initiatives = new LearningInitiativesAnalyzer().analyze(needs);
  const evaluation = new LearningEvaluationAnalyzer().analyze(initiatives);
  const roadmap = new LearningRoadmapAnalyzer().analyze(evaluation);
  const plan = new LearningPlanAnalyzer().analyze(roadmap);

  return { context, needs, initiatives, evaluation, roadmap, plan };
}

interface FixtureOptions {
  readonly weakCapability?: boolean;
}

function input(options: FixtureOptions = {}) {
  return {
    careerStrategy: careerStrategy(options),
    portfolioPlan: portfolioPlan(options),
    opportunityDecision: opportunityDecision(options),
    assumptions: ["learning planning uses canonical intelligence"],
    constraints: [{ constraintId: "constraint:no-execution", label: "Planner does not execute", value: "true" }],
    traceId: "trace:learning-planner-test"
  };
}

function careerStrategy(options: FixtureOptions): CareerStrategy {
  const weak = options.weakCapability === true;
  return {
    artifactKind: "CareerStrategy",
    strategyId: "career-strategy-1",
    evaluationId: "strategy-evaluation-1",
    profile: weak ? "LeadershipFirst" : "AITransformation",
    selectedOptionId: "strategy-option:AIFirst",
    confidence: { value: weak ? 0.6 : 0.86, band: weak ? "medium" : "high" },
    supportingEvidence: ["leadership", "ai", "platform"],
    assumptions: ["strategy fixture"],
    constraints: [],
    risks: weak ? ["ai capability gap", "leadership capability gap"] : ["market visibility gap"],
    strategicMilestones: [],
    decisionTrace: "trace:strategy",
    scoreSummary: scoreBreakdown(weak ? 58 : 86),
    recommendationPriority: weak ? "High" : "Low",
    expectedImpact: weak ? "Moderate" : "Significant",
    confidenceFactors: [],
    alternativeStrategiesConsidered: ["BalancedGrowth"],
    artifact: artifact("artifact:career-strategy"),
    explanationSummary: {}
  } as unknown as CareerStrategy;
}

function portfolioPlan(options: FixtureOptions): PortfolioPlan {
  const weak = options.weakCapability === true;
  return {
    artifactKind: "PortfolioPlan",
    planId: "portfolio-plan-1",
    roadmapId: "portfolio-roadmap-1",
    outcome: weak ? "BuildCriticalEvidence" : "ImproveBeforePublishing",
    orderedInitiatives: [
      { roadmapItemId: "portfolio-roadmap-item-1", initiativeId: "portfolio-initiative:ai", sequence: 1, priority: weak ? "Critical" : "High", dependencyIds: [], expectedImpact: "Significant", completionSignal: "fixture", confidence: { value: 0.8, band: "high" } },
      { roadmapItemId: "portfolio-roadmap-item-2", initiativeId: "portfolio-initiative:leadership", sequence: 2, priority: "High", dependencyIds: ["portfolio-initiative:ai"], expectedImpact: "Moderate", completionSignal: "fixture", confidence: { value: 0.7, band: "medium" } }
    ],
    recommendations: [],
    confidenceFactors: [],
    supportingEvidence: ["portfolio-initiative:ai", "portfolio-initiative:leadership"],
    assumptions: [],
    constraints: [],
    decisionTrace: "trace:portfolio-plan",
    artifact: artifact("artifact:portfolio-plan"),
    explanationSummary: {}
  } as unknown as PortfolioPlan;
}

function opportunityDecision(options: FixtureOptions): OpportunityDecision {
  const weak = options.weakCapability === true;
  return {
    artifactKind: "OpportunityDecision",
    decisionId: "opportunity-decision-1",
    fitId: "fit-1",
    outcome: weak ? "WorthExploring" : "PursueImmediately",
    confidence: { value: weak ? 0.55 : 0.88, band: weak ? "medium" : "high" },
    supportingEvidence: weak ? ["market-signal"] : ["company-context", "role-quality", "ai", "platform"],
    risks: weak ? ["capability-uncertainty"] : [],
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
  if (existsSync(join(packageLocal, "package.json")) && packageLocal.endsWith("learning-planner")) return packageLocal;
  return join(process.cwd(), "packages", "learning-planner");
}

function sourceDirectory(): string {
  return join(packageRoot(), "src");
}
