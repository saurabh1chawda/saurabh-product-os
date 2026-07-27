import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { CareerArtifact } from "@career-companion/career-artifacts";
import type { CareerStrategy } from "@career-companion/career-strategy";
import type { LearningPlan } from "@career-companion/learning-planner";
import type { OpportunityDecision } from "@career-companion/opportunity-intelligence";
import type { PortfolioPlan } from "@career-companion/portfolio-planner";
import { describe, expect, it } from "vitest";
import {
  InterviewEvaluationAnalyzer,
  InterviewInitiativesAnalyzer,
  InterviewNeedsAnalyzer,
  InterviewPlanAnalyzer,
  InterviewPlanContextAnalyzer,
  InterviewRoadmapAnalyzer
} from "../src";
import packageJson from "../package.json";

describe("interview planner", () => {
  it("creates the canonical deterministic interview readiness planning pipeline", () => {
    const result = runPipeline();

    expect(result.context.artifactKind).toBe("InterviewPlanContext");
    expect(result.needs.artifactKind).toBe("InterviewNeeds");
    expect(result.initiatives.artifactKind).toBe("InterviewInitiatives");
    expect(result.evaluation.artifactKind).toBe("InterviewEvaluation");
    expect(result.roadmap.artifactKind).toBe("InterviewRoadmap");
    expect(result.plan.artifactKind).toBe("InterviewPlan");
    expect(["ReadinessAcceleration", "EvidenceFocusedReadiness", "StrategicInterviewReadiness", "FoundationReadiness"]).toContain(result.plan.outcome);
  });

  it("keeps InterviewPlanContext descriptive and as the only aggregation boundary", () => {
    const context = new InterviewPlanContextAnalyzer().analyze(input());

    expect(context.sourceReferences.map((reference) => reference.referenceId)).toEqual(["artifact:career-strategy", "artifact:portfolio-plan", "artifact:learning-plan", "artifact:opportunity"]);
    expect(context.sequence.map((stage) => stage.stage)).toEqual(["InterviewPlanContext", "InterviewNeeds", "InterviewInitiatives", "InterviewEvaluation", "InterviewRoadmap", "InterviewPlan"]);
    expect(context).not.toHaveProperty("needs");
    expect(context).not.toHaveProperty("initiatives");
    expect(context).not.toHaveProperty("recommendations");
    expect(context).not.toHaveProperty("roadmap");
  });

  it("identifies interview needs without initiatives or roadmap", () => {
    const { needs } = runPipeline({ weakReadiness: true });

    expect(needs.needs.length).toBeGreaterThan(5);
    expect(needs.needs.map((need) => need.category)).toContain("BehavioralReadiness");
    expect(needs.needs.map((need) => need.category)).toContain("LeadershipStories");
    expect(needs).not.toHaveProperty("initiatives");
    expect(needs).not.toHaveProperty("roadmap");
  });

  it("generates readiness initiatives without coaching artifacts", () => {
    const { initiatives } = runPipeline();

    expect(initiatives.initiatives.map((item) => item.kind)).toContain("PrepareSTAREvidenceMatrix");
    expect(initiatives.initiatives.map((item) => item.kind)).toContain("PrepareProductSenseFramework");
    expect(initiatives).not.toHaveProperty("questions");
    expect(initiatives).not.toHaveProperty("answers");
    expect(initiatives).not.toHaveProperty("sessions");
  });

  it("evaluates initiatives without evaluating candidate performance", () => {
    const { evaluation } = runPipeline();

    expect(evaluation.evaluations.length).toBeGreaterThan(1);
    expect(evaluation.evaluations[0]?.scoreBreakdown.overallScore).toBeGreaterThanOrEqual(0);
    expect(evaluation).not.toHaveProperty("candidatePerformance");
    expect(evaluation).not.toHaveProperty("speakingAbility");
    expect(evaluation).not.toHaveProperty("simulations");
  });

  it("creates a readiness roadmap without timing or tracking ownership", () => {
    const { roadmap } = runPipeline();

    expect(roadmap.items.map((item) => item.sequence)).toEqual(roadmap.items.map((_, index) => index + 1));
    expect(roadmap.items[1]?.dependencyIds).toEqual([roadmap.items[0]?.initiativeId]);
    expect(roadmap).not.toHaveProperty("calendar");
    expect(roadmap).not.toHaveProperty("scheduledAt");
    expect(roadmap).not.toHaveProperty("progress");
  });

  it("creates an interview plan without preparation execution", () => {
    const { plan } = runPipeline();

    expect(plan.prioritizedReadinessInitiatives.length).toBeGreaterThan(0);
    expect(plan.expectedReadinessOutcomes.length).toBe(plan.prioritizedReadinessInitiatives.length);
    expect(plan).not.toHaveProperty("practiceSessions");
    expect(plan).not.toHaveProperty("responseTemplates");
    expect(plan).not.toHaveProperty("speakerFeedback");
  });

  it("enforces immediate predecessor analyzer signatures", () => {
    const source = readSource(sourceDirectory());

    expect(source).toContain("analyze(input: InterviewPlanContextInput): InterviewPlanContext");
    expect(source).toContain("analyze(context: InterviewPlanContext): InterviewNeeds");
    expect(source).toContain("analyze(needs: InterviewNeeds): InterviewInitiatives");
    expect(source).toContain("analyze(initiatives: InterviewInitiatives): InterviewEvaluation");
    expect(source).toContain("analyze(evaluation: InterviewEvaluation): InterviewRoadmap");
    expect(source).toContain("analyze(roadmap: InterviewRoadmap): InterviewPlan");
    expect(source).not.toContain("analyze(input: CareerStrategy");
  });

  it("produces immutable deterministic output", () => {
    const first = runPipeline();
    const second = runPipeline();

    expect(first.plan).toEqual(second.plan);
    expect(Object.isFrozen(first.plan)).toBe(true);
    expect(Object.isFrozen(first.plan.prioritizedReadinessInitiatives)).toBe(true);
    expect(first.roadmap.careerStrategy).toBe(first.context.careerStrategy);
    expect(first.evaluation.learningPlan).toBe(first.context.learningPlan);
  });

  it("reuses Product Intelligence vocabulary", () => {
    const { needs, evaluation, plan } = runPipeline();

    expect(needs.needs.every((need) => ["low", "medium", "high"].includes(need.gap.severity))).toBe(true);
    expect(evaluation.evaluations[0]?.scoreBreakdown).toHaveProperty("dimensions");
    expect(plan.confidenceFactors[0]).toHaveProperty("factor");
    expect(["Critical", "High", "Medium", "Low"]).toContain(plan.recommendations[0]?.priority);
    expect(["Prepare", "Strengthen", "Clarify", "Quantify", "Validate"]).toContain(plan.recommendations[0]?.recommendationType);
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

    expect(readme).toContain("## Inputs");
    expect(readme).toContain("## Outputs");
    expect(readme).toContain("## Owns");
    expect(readme).toContain("## Does NOT Own");
    expect(readme).toContain("## Pipeline");
    expect(readme).toContain("## Aggregation Boundary");
    expect(readme).toContain("## Dependency Boundaries");
    expect(readme).toContain("## Determinism Guarantee");
  });

  it("keeps dependency boundaries clean", () => {
    const dependencies = Object.keys(packageJson.dependencies);

    expect(dependencies).toContain("@career-companion/career-strategy");
    expect(dependencies).toContain("@career-companion/portfolio-planner");
    expect(dependencies).toContain("@career-companion/learning-planner");
    expect(dependencies).toContain("@career-companion/opportunity-intelligence");
    expect(dependencies).not.toContain("@career-companion/interview-intelligence");
    expect(dependencies).not.toContain("@career-companion/ats-intelligence");
    expect(dependencies).not.toContain("@career-companion/hiring-intelligence");
    expect(dependencies).not.toContain("@career-companion/persistence");
    expect(dependencies).not.toContain("@career-companion/infrastructure");
  });

  it("keeps source free of forbidden technologies and execution ownership leaks", () => {
    const source = readSource(sourceDirectory()).toLowerCase();

    expect(source).not.toContain("@career-companion/interview-intelligence");
    expect(source).not.toContain("@career-companion/ats-intelligence");
    expect(source).not.toContain("@career-companion/hiring-intelligence");
    expect(source).not.toContain("@career-companion/persistence");
    expect(source).not.toContain("@career-companion/infrastructure");
    expect(source).not.toContain("fetch(");
    expect(source).not.toContain("openai");
    expect(source).not.toContain("mock interview");
    expect(source).not.toContain("ai interviewer");
    expect(source).not.toContain("answer generation");
    expect(source).not.toContain("answer evaluation");
    expect(source).not.toContain("speech analysis");
    expect(source).not.toContain("behavioral coaching");
    expect(source).not.toContain("scoring rubric");
    expect(source).not.toContain("calendar");
    expect(source).not.toContain("reminder");
  });
});

function runPipeline(options: FixtureOptions = {}) {
  const context = new InterviewPlanContextAnalyzer().analyze(input(options));
  const needs = new InterviewNeedsAnalyzer().analyze(context);
  const initiatives = new InterviewInitiativesAnalyzer().analyze(needs);
  const evaluation = new InterviewEvaluationAnalyzer().analyze(initiatives);
  const roadmap = new InterviewRoadmapAnalyzer().analyze(evaluation);
  const plan = new InterviewPlanAnalyzer().analyze(roadmap);

  return { context, needs, initiatives, evaluation, roadmap, plan };
}

interface FixtureOptions {
  readonly weakReadiness?: boolean;
}

function input(options: FixtureOptions = {}) {
  return {
    careerStrategy: careerStrategy(options),
    portfolioPlan: portfolioPlan(options),
    learningPlan: learningPlan(options),
    opportunityDecision: opportunityDecision(options),
    assumptions: ["interview planning uses canonical planner inputs"],
    constraints: [{ constraintId: "constraint:no-execution", label: "Planner does not execute", value: "true" }],
    traceId: "trace:interview-planner-test"
  };
}

function careerStrategy(options: FixtureOptions): CareerStrategy {
  const weak = options.weakReadiness === true;
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
    risks: weak ? ["interview readiness gap", "leadership readiness gap"] : ["market visibility gap"],
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
  const weak = options.weakReadiness === true;
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

function learningPlan(options: FixtureOptions): LearningPlan {
  const weak = options.weakReadiness === true;
  return {
    artifactKind: "LearningPlan",
    planId: "learning-plan-1",
    roadmapId: "learning-roadmap-1",
    outcome: weak ? "EvidenceLedLearning" : "StrategicCapabilityAcceleration",
    prioritizedInitiatives: [
      { roadmapItemId: "learning-roadmap-item-1", initiativeId: "learning-initiative:ai", sequence: 1, dependencyIds: [], milestone: "AI capability milestone", completionCriteria: ["fixture"], priority: "High", expectedOutcome: "AI capability evidence", confidence: { value: 0.8, band: "high" } },
      { roadmapItemId: "learning-roadmap-item-2", initiativeId: "learning-initiative:leadership", sequence: 2, dependencyIds: ["learning-initiative:ai"], milestone: "Leadership capability milestone", completionCriteria: ["fixture"], priority: "High", expectedOutcome: "Leadership capability evidence", confidence: { value: 0.74, band: "medium" } }
    ],
    capabilityOutcomes: ["AI capability evidence", "Leadership capability evidence"],
    strategicRationale: ["AITransformation", "PursueImmediately"],
    recommendations: [],
    confidenceFactors: [],
    evidenceReferences: ["learning-initiative:ai", "learning-initiative:leadership"],
    assumptions: [],
    constraints: [],
    milestones: ["AI capability milestone", "Leadership capability milestone"],
    decisionTrace: "trace:learning-plan",
    artifact: artifact("artifact:learning-plan"),
    explanationSummary: {}
  } as unknown as LearningPlan;
}

function opportunityDecision(options: FixtureOptions): OpportunityDecision {
  const weak = options.weakReadiness === true;
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
  if (existsSync(join(packageLocal, "package.json")) && packageLocal.endsWith("interview-planner")) return packageLocal;
  return join(process.cwd(), "packages", "interview-planner");
}

function sourceDirectory(): string {
  return join(packageRoot(), "src");
}
