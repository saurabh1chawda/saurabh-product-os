import { describe, expect, it } from "vitest";
import {
  DecisionAssessmentAnalyzer,
  DecisionContextAnalyzer,
  DecisionPlanAnalyzer,
  DecisionReportAnalyzer,
  DecisionStrategyAnalyzer
} from "../src";
import type { CareerArtifact } from "@career-companion/career-artifacts";
import type { DecisionTrace } from "@career-companion/decision-engine";
import type { InterviewModel } from "@career-companion/interview-intelligence";
import type { EvaluationFramework, HiringModel, JobMatchReport, JobModel } from "@career-companion/job-intelligence";
import type { PortfolioModel } from "@career-companion/portfolio-intelligence";
import type { ProductIntelligenceSet } from "../src";
import type { ResumeModel } from "@career-companion/resume-intelligence";
import packageJson from "../package.json";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

describe("career decision", () => {
  it("creates the canonical deterministic decision pipeline", () => {
    const result = runPipeline();

    expect(result.context.artifactKind).toBe("DecisionContext");
    expect(result.assessment.artifactKind).toBe("DecisionAssessment");
    expect(result.strategy.artifactKind).toBe("DecisionStrategy");
    expect(result.plan.artifactKind).toBe("DecisionPlan");
    expect(result.report.artifactKind).toBe("DecisionReport");
    expect(result.report.artifact.artifactType).toBe("CareerReport");
    expect(result.report.recommendations.length).toBe(result.plan.actions.length);
  });

  it("aggregates canonical product intelligence without scoring in DecisionContext", () => {
    const context = new DecisionContextAnalyzer().analyze(productSet());

    expect(context.sourceArtifactIds).toEqual([
      "artifact:resume",
      "artifact:portfolio",
      "artifact:interview",
      "artifact:job-model",
      "artifact:hiring-model",
      "artifact:evaluation-framework",
      "artifact:job-match"
    ]);
    expect(context.resume.score.value).toBe(82);
    expect(context.explanationSummary.narrative.reasonCodes).toContain("canonical-product-intelligence-aggregation");
  });

  it("assesses readiness without prioritizing actions", () => {
    const context = new DecisionContextAnalyzer().analyze(productSet());
    const assessment = new DecisionAssessmentAnalyzer().analyze(context);

    expect(assessment.overallReadiness.overallScore).toBe(77);
    expect(assessment.coverage.map((dimension) => dimension.dimension)).toEqual(["Resume", "Portfolio", "Interview", "JobMatch", "Evidence", "Competency"]);
    expect(assessment.evidenceSufficiency.score).toBe(74);
    expect(assessment.weaknessAreas.length).toBeGreaterThan(0);
    expect(assessment).not.toHaveProperty("actions");
  });

  it("creates strategy and plan from assessment priorities", () => {
    const { strategy, plan } = runPipeline();

    expect(strategy.strategicObjectives.length).toBeGreaterThan(0);
    expect(strategy.priorityThemes).toContain("Evidence");
    expect(strategy.tradeoffs[0]?.accepted).toBe(strategy.strategicObjectives[0]?.label);
    expect(plan.actions[0]?.priority).toBe("Critical");
    expect(plan.actions[0]?.completionCriteria[0]).toContain("canonical product artifact");
    expect(plan.recommendations[0]?.targetActionIds).toEqual([plan.actions[0]?.actionId]);
  });

  it("projects a DecisionReport with explainability and decision trace", () => {
    const { context, report } = runPipeline();

    expect(report.context.contextId).toBe(context.contextId);
    expect(report.summary.topStrengths).toContain("Product Strategy");
    expect(report.explanationSummary.evidenceTrace.references.length).toBe(4);
    expect(report.decisionTrace.pipeline).toBe("career-decision-pipeline");
    expect(report.artifact.explanation?.decisionTraceReference).toBe(report.explanationSummary.decisionId);
  });

  it("preserves immutability and deterministic output", () => {
    const first = runPipeline().report;
    const second = runPipeline().report;

    expect(first).toEqual(second);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.plan.actions)).toBe(true);
    expect(Object.isFrozen(first.assessment.coverage)).toBe(true);
  });

  it("keeps dependency boundaries clean", () => {
    const forbidden = [
      "@career-companion/application",
      "@career-companion/infrastructure",
      "@career-companion/persistence",
      "@career-companion/repositories",
      "@career-companion/retrieval"
    ];
    const dependencies = Object.keys(packageJson.dependencies);

    for (const dependency of forbidden) {
      expect(dependencies).not.toContain(dependency);
    }
  });

  it("keeps production source free of forbidden runtime technologies", () => {
    const source = readSource(sourceDirectory()).toLowerCase();

    expect(source).not.toContain("@career-companion/application");
    expect(source).not.toContain("@career-companion/infrastructure");
    expect(source).not.toContain("@career-companion/persistence");
    expect(source).not.toContain("@career-companion/repositories");
    expect(source).not.toContain("@career-companion/retrieval");
    expect(source).not.toContain("openai");
    expect(source).not.toContain("anthropic");
    expect(source).not.toContain("fetch(");
    expect(source).not.toContain("prisma");
  });
});

function runPipeline() {
  const context = new DecisionContextAnalyzer().analyze(productSet());
  const assessment = new DecisionAssessmentAnalyzer().analyze(context);
  const strategy = new DecisionStrategyAnalyzer().analyze(assessment);
  const plan = new DecisionPlanAnalyzer().analyze(strategy);
  const report = new DecisionReportAnalyzer().analyze({ context, assessment, strategy, plan });

  return { context, assessment, strategy, plan, report };
}

function productSet(): ProductIntelligenceSet {
  return {
    resume: {
      artifact: artifact("artifact:resume"),
      score: { value: 82, evidenceScore: 72, competencyScore: 84, impactScore: 80, gapPenalty: 4 },
      gaps: [{ gapId: "resume-gap:metrics", competencyId: "analytics", reason: "weak quantified evidence", severity: "medium" }]
    } as unknown as ResumeModel,
    portfolio: {
      artifact: artifact("artifact:portfolio"),
      score: { value: 78, projectQuality: 80, businessImpact: 76, technicalDepth: 72, leadershipEvidence: 68, domainDiversity: 70, recency: 88, evidenceStrength: 75, coverage: 79, consistency: 82 },
      gaps: [{ gapId: "portfolio-gap:leadership", description: "limited leadership evidence", severity: "medium", supportingEvidence: [], recommendedImprovement: "Add stronger leadership proof.", confidence: confidence(0.62) }]
    } as unknown as PortfolioModel,
    interview: {
      artifact: artifact("artifact:interview"),
      readinessScore: { overallScore: 73, readinessBand: "medium", dimensions: [], deductions: [], confidence: confidence(0.73) },
      gaps: [{ gapId: "interview-gap:tradeoff", gapType: "missing-tradeoff", description: "missing tradeoff example", severity: "medium", affectedQuestionOrCompetency: "Strategy", supportingEvidence: [], missingEvidence: ["tradeoff"], rationale: "Trade-off evidence is thin.", recommendedImprovement: "Prepare tradeoff example.", confidence: confidence(0.58) }]
    } as unknown as InterviewModel,
    jobModel: {
      artifact: artifact("artifact:job-model"),
      source: { jobDescriptionId: "job-1", description: "Lead product role", capturedAt: "2026-01-01T00:00:00.000Z" },
      requiredCompetencies: [
        { competencyId: "product-strategy", name: "Product Strategy", required: true, weight: 0.4, evidenceExpectationIds: [] },
        { competencyId: "leadership", name: "Leadership", required: true, weight: 0.35, evidenceExpectationIds: [] }
      ]
    } as unknown as JobModel,
    hiringModel: {
      artifact: artifact("artifact:hiring-model")
    } as unknown as HiringModel,
    evaluationFramework: {
      artifact: artifact("artifact:evaluation-framework")
    } as unknown as EvaluationFramework,
    jobMatchReport: {
      artifact: artifact("artifact:job-match"),
      candidateId: "candidate-1",
      overallFit: { overallScore: 76, band: "high", dimensions: [], contributions: [], penalties: [] },
      evidenceCoverage: { dimension: "Evidence Coverage", score: 74, weight: 0.45, rationale: "coverage" },
      competencyCoverage: { dimension: "Competency Coverage", score: 81, weight: 0.55, rationale: "coverage" },
      gaps: [{ gapId: "job-gap:evidence", gapType: "weak evidence coverage", severity: "medium", priority: "high", rationale: "Expected evidence is partial." }],
      riskAreas: ["weak evidence coverage"],
      strengthAreas: ["Product Strategy", "Leadership"]
    } as unknown as JobMatchReport,
    decisionTrace: {
      pipeline: "career-decision-pipeline"
    } as unknown as DecisionTrace
  };
}

function artifact(artifactId: string): CareerArtifact {
  return { artifactId, artifactType: "CareerReport" } as unknown as CareerArtifact;
}

function confidence(value: number) {
  return {
    value,
    band: value >= 0.75 ? "high" : value >= 0.5 ? "medium" : "low",
    rationale: "fixture"
  };
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

function sourceDirectory(): string {
  const packageLocal = join(process.cwd(), "src");
  if (existsSync(packageLocal)) return packageLocal;
  return join(process.cwd(), "packages", "career-decision", "src");
}
