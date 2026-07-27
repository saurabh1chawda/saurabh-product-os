import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { CareerArtifact } from "@career-companion/career-artifacts";
import type { DecisionReport } from "@career-companion/career-decision";
import type { OpportunityDecision } from "@career-companion/opportunity-intelligence";
import { describe, expect, it } from "vitest";
import {
  CareerGapAnalyzer,
  CareerGoalAnalyzer,
  CareerStrategyAnalyzer,
  CurrentStateAnalyzer,
  StrategyEvaluationAnalyzer,
  StrategyOptionsAnalyzer
} from "../src";
import packageJson from "../package.json";

describe("career strategy", () => {
  it("creates the canonical deterministic career strategy pipeline", () => {
    const result = runPipeline();

    expect(result.goal.artifactKind).toBe("CareerGoal");
    expect(result.state.artifactKind).toBe("CurrentState");
    expect(result.gap.artifactKind).toBe("CareerGap");
    expect(result.options.artifactKind).toBe("StrategyOptions");
    expect(result.evaluation.artifactKind).toBe("StrategyEvaluation");
    expect(result.strategy.artifactKind).toBe("CareerStrategy");
    expect(["AggressiveGrowth", "BalancedGrowth", "OpportunityFirst", "SkillFirst", "LeadershipFirst", "AITransformation", "MarketPivot"]).toContain(result.strategy.profile);
  });

  it("keeps CareerGoal descriptive and as the only aggregation boundary", () => {
    const goal = new CareerGoalAnalyzer().analyze(input());

    expect(goal.sourceReferences.map((reference) => reference.referenceId)).toEqual(["artifact:opportunity", "artifact:decision-report"]);
    expect(goal.sequence.map((stage) => stage.stage)).toEqual(["CareerGoal", "CurrentState", "CareerGap", "StrategyOptions", "StrategyEvaluation", "CareerStrategy"]);
    expect(goal).not.toHaveProperty("score");
    expect(goal).not.toHaveProperty("recommendations");
    expect(goal).not.toHaveProperty("gaps");
  });

  it("represents current strategic state without recommendations", () => {
    const state = new CurrentStateAnalyzer().analyze(new CareerGoalAnalyzer().analyze(input()));

    expect(state.aiCapability.score.score).toBeGreaterThan(50);
    expect(state.marketPositioning.score.score).toBeGreaterThan(50);
    expect(state).not.toHaveProperty("recommendations");
    expect(state).not.toHaveProperty("strategyOptions");
  });

  it("represents career gaps without planning", () => {
    const { gap } = runPipeline({ weakReadiness: true });

    expect(gap.gaps.length).toBe(8);
    expect(gap.evidenceGap.gapType).toBe("Evidence Gap");
    expect(gap).not.toHaveProperty("actions");
    expect(gap).not.toHaveProperty("plan");
  });

  it("generates strategy options without evaluation or ranking", () => {
    const { options } = runPipeline();

    expect(options.options.map((option) => option.kind)).toContain("BalancedGrowth");
    expect(options.options.map((option) => option.kind)).toContain("AIFirst");
    expect(options).not.toHaveProperty("selectedOptionId");
    expect(options).not.toHaveProperty("ranking");
  });

  it("evaluates strategy options without final strategy selection", () => {
    const { evaluation } = runPipeline();

    expect(evaluation.evaluations.length).toBeGreaterThan(1);
    expect(evaluation.evaluations[0]?.scoreBreakdown.overallScore).toBeGreaterThanOrEqual(0);
    expect(evaluation).not.toHaveProperty("profile");
    expect(evaluation).not.toHaveProperty("selectedOptionId");
  });

  it("selects a long-term strategy without execution actions", () => {
    const { strategy } = runPipeline();

    expect(strategy.selectedOptionId).toContain("strategy-option:");
    expect(strategy.strategicMilestones.length).toBe(3);
    expect(strategy).not.toHaveProperty("actions");
    expect(strategy).not.toHaveProperty("atsOutcome");
    expect(strategy).not.toHaveProperty("hiringDecision");
  });

  it("enforces immediate predecessor analyzer signatures", () => {
    const source = readSource(sourceDirectory());

    expect(source).toContain("analyze(input: CareerGoalInput): CareerGoal");
    expect(source).toContain("analyze(goal: CareerGoal): CurrentState");
    expect(source).toContain("analyze(state: CurrentState): CareerGap");
    expect(source).toContain("analyze(gapArtifact: CareerGap): StrategyOptions");
    expect(source).toContain("analyze(options: StrategyOptions): StrategyEvaluation");
    expect(source).toContain("analyze(evaluation: StrategyEvaluation): CareerStrategy");
    expect(source).not.toContain("analyze(input: OpportunityDecision");
  });

  it("produces immutable deterministic output", () => {
    const first = runPipeline();
    const second = runPipeline();

    expect(first.strategy).toEqual(second.strategy);
    expect(Object.isFrozen(first.strategy)).toBe(true);
    expect(Object.isFrozen(first.strategy.supportingEvidence)).toBe(true);
    expect(first.state.opportunityDecision).toBe(first.goal.opportunityDecision);
    expect(first.evaluation.opportunityDecision).toBe(first.goal.opportunityDecision);
  });

  it("reuses canonical Product Intelligence vocabulary", () => {
    const { strategy, gap, evaluation } = runPipeline();

    expect(strategy.scoreSummary).toHaveProperty("dimensions");
    expect(strategy.confidence).toHaveProperty("band");
    expect(gap.gaps.every((item) => ["low", "medium", "high"].includes(item.severity))).toBe(true);
    expect(evaluation.evaluations[0]?.impact).toHaveProperty("rationale");
    expect(["Critical", "High", "Medium", "Low"]).toContain(strategy.recommendationPriority);
  });

  it("adds deterministic explainability for every stage", () => {
    const result = runPipeline();

    expect(result.goal.explanationSummary.decisionId).toBe(result.goal.goalId);
    expect(result.state.explanationSummary.decisionId).toBe(result.state.stateId);
    expect(result.gap.explanationSummary.decisionId).toBe(result.gap.gapId);
    expect(result.options.explanationSummary.decisionId).toBe(result.options.optionsId);
    expect(result.evaluation.explanationSummary.decisionId).toBe(result.evaluation.evaluationId);
    expect(result.strategy.explanationSummary.decisionId).toBe(result.strategy.strategyId);
  });

  it("documents the bounded context architecture contract", () => {
    const readme = readFileSync(join(packageRoot(), "README.md"), "utf8");

    expect(readme).toContain("## INPUTS");
    expect(readme).toContain("## OUTPUTS");
    expect(readme).toContain("## OWNS");
    expect(readme).toContain("## DOES NOT OWN");
  });

  it("keeps dependency boundaries clean", () => {
    const dependencies = Object.keys(packageJson.dependencies);

    expect(dependencies).toContain("@career-companion/opportunity-intelligence");
    expect(dependencies).toContain("@career-companion/career-decision");
    expect(dependencies).toContain("@career-companion/product-intelligence");
    expect(dependencies).not.toContain("@career-companion/ats-intelligence");
    expect(dependencies).not.toContain("@career-companion/hiring-intelligence");
    expect(dependencies).not.toContain("@career-companion/infrastructure");
    expect(dependencies).not.toContain("@career-companion/persistence");
  });

  it("keeps source free of forbidden technologies and execution planning ownership", () => {
    const source = readSource(sourceDirectory()).toLowerCase();

    expect(source).not.toContain("@career-companion/ats-intelligence");
    expect(source).not.toContain("@career-companion/hiring-intelligence");
    expect(source).not.toContain("@career-companion/persistence");
    expect(source).not.toContain("@career-companion/infrastructure");
    expect(source).not.toContain("fetch(");
    expect(source).not.toContain("openai");
    expect(source).not.toContain("embedding");
    expect(source).not.toContain("execution plan");
    expect(source).not.toContain("resume optimization");
  });
});

function runPipeline(options: FixtureOptions = {}) {
  const goal = new CareerGoalAnalyzer().analyze(input(options));
  const state = new CurrentStateAnalyzer().analyze(goal);
  const gap = new CareerGapAnalyzer().analyze(state);
  const strategyOptions = new StrategyOptionsAnalyzer().analyze(gap);
  const evaluation = new StrategyEvaluationAnalyzer().analyze(strategyOptions);
  const strategy = new CareerStrategyAnalyzer().analyze(evaluation);

  return { goal, state, gap, options: strategyOptions, evaluation, strategy };
}

interface FixtureOptions {
  readonly weakReadiness?: boolean;
}

function input(options: FixtureOptions = {}) {
  return {
    opportunityDecision: opportunityDecision(options),
    decisionReport: decisionReport(options),
    targetRole: "AI Platform Product Leader",
    targetLevel: "Director",
    targetDomains: ["AI", "Platform"],
    preferredCompanies: ["ExampleAI"],
    preferredIndustries: ["SaaS"],
    preferredLocations: ["Remote"],
    timeline: "12 months",
    compensationObjective: "market competitive",
    constraints: ["no execution planning"],
    assumptions: ["strategy uses existing canonical intelligence"],
    traceId: "trace:career-strategy-test"
  };
}

function opportunityDecision(options: FixtureOptions): OpportunityDecision {
  const weak = options.weakReadiness === true;
  return {
    artifactKind: "OpportunityDecision",
    decisionId: "opportunity-decision-1",
    fitId: "fit-1",
    outcome: weak ? "WorthExploring" : "PursueImmediately",
    confidence: { value: weak ? 0.55 : 0.88, band: weak ? "medium" : "high" },
    supportingEvidence: weak ? ["market-signal"] : ["company-context", "role-quality", "market-signal", "Leadership", "AI Capability"],
    risks: weak ? ["portfolio-uncertainty", "evidence-gap"] : [],
    assumptions: ["caller supplied opportunity evidence"],
    constraints: ["no ats evaluation"],
    opportunityStrengths: weak ? ["market-signal"] : ["company-context", "role-quality", "market-signal"],
    opportunityWeaknesses: weak ? ["company-uncertainty"] : [],
    candidateStrengths: weak ? ["Experience"] : ["Leadership", "AI Capability", "Portfolio Maturity"],
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

function decisionReport(options: FixtureOptions): DecisionReport {
  const weak = options.weakReadiness === true;
  const readiness = weak ? 48 : 84;
  return {
    artifactKind: "DecisionReport",
    reportId: "decision-report-1",
    context: {
      resume: { artifact: artifact("artifact:resume") },
      portfolio: { artifact: artifact("artifact:portfolio") },
      interview: { artifact: artifact("artifact:interview") }
    },
    assessment: {
      assessmentId: "assessment-1",
      overallReadiness: scoreBreakdown(readiness),
      coverage: [
        { dimension: "Resume", score: weak ? 45 : 82, weight: 1, rationale: "fixture" },
        { dimension: "Portfolio", score: weak ? 40 : 80, weight: 1, rationale: "fixture" },
        { dimension: "Interview", score: weak ? 38 : 76, weight: 1, rationale: "fixture" }
      ],
      evidenceSufficiency: { dimension: "Evidence", score: weak ? 35 : 82, weight: 1, rationale: "fixture" }
    },
    summary: {
      headline: weak ? "Developing candidate" : "AI platform product leader",
      readinessBand: weak ? "medium" : "high",
      topStrengths: weak ? ["Experience"] : ["Leadership", "AI Capability", "Platform Product Depth"],
      topRisks: weak ? ["Evidence", "Portfolio"] : [],
      nextActions: []
    },
    confidence: { value: weak ? 0.5 : 0.85, band: weak ? "medium" : "high" },
    recommendations: [],
    decisionTrace: {},
    artifact: artifact("artifact:decision-report"),
    explanationSummary: {}
  } as unknown as DecisionReport;
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
  if (existsSync(join(packageLocal, "package.json")) && packageLocal.endsWith("career-strategy")) return packageLocal;
  return join(process.cwd(), "packages", "career-strategy");
}

function sourceDirectory(): string {
  return join(packageRoot(), "src");
}
