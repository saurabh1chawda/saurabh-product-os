import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  DomainClassifier,
  EvaluationAnalyzer,
  FunctionClassifier,
  HiringAnalyzer,
  JobAnalyzer,
  JobMatchAnalyzer,
  RoleClassifier,
  SeniorityClassifier,
  BusinessObjectiveMapper,
  CompetencyMapper,
  EvidenceExpectationMapper,
  ResponsibilityMapper,
  SkillMapper
} from "@career-companion/job-intelligence";
import type { CandidateIntelligence, RawJobDescription } from "@career-companion/job-intelligence";
import packageJson from "../package.json";

describe("job intelligence", () => {
  it("builds immutable JobModel, HiringModel, EvaluationFramework, and JobMatchReport", () => {
    const result = runPipeline(strongJob(), strongCandidate());

    expect(result.jobModel.artifactKind).toBe("JobModel");
    expect(result.hiringModel.artifactKind).toBe("HiringModel");
    expect(result.framework.artifactKind).toBe("EvaluationFramework");
    expect(result.report.artifactKind).toBe("JobMatchReport");
    expect(result.jobModel.role.classification).toBe("ProductLeader");
    expect(result.jobModel.domain.classification).toBe("AI");
    expect(result.jobModel.location).toBe("Mixed");
    expect(result.jobModel.artifact.artifactType).toBe("JobMatchReport");
    expect(Object.isFrozen(result.jobModel.responsibilities)).toBe(true);
    expect(Object.isFrozen(result.framework.dimensions)).toBe(true);
    expect(Object.isFrozen(result.report.dimensionScores)).toBe(true);
  });

  it("classifies role, seniority, function, and domain deterministically", () => {
    const description = strongJob().description;

    expect(new RoleClassifier().classify(description).classification).toBe("ProductLeader");
    expect(new SeniorityClassifier().classify(description).classification).toBe("Lead");
    expect(new FunctionClassifier().classify(description).classification).toBe("Platform");
    expect(new DomainClassifier().classify(description).classification).toBe("AI");
    expect(new DomainClassifier().classify("Payments fintech checkout role.").classification).toBe("Payments");
  });

  it("maps responsibilities, competencies, skills, objectives, and evidence expectations", () => {
    const description = strongJob().description;
    const responsibilities = new ResponsibilityMapper().map(description);
    const competencies = new CompetencyMapper().map(description);
    const requiredSkills = new SkillMapper().mapRequired(description);
    const preferredSkills = new SkillMapper().mapPreferred(description);
    const objectives = new BusinessObjectiveMapper().map(description);
    const expectations = new EvidenceExpectationMapper().map(competencies);

    expect(responsibilities.map((item) => item.category)).toEqual(expect.arrayContaining(["strategy", "execution", "analytics", "technical"]));
    expect(competencies.map((item) => item.name)).toEqual(expect.arrayContaining(["Product Strategy", "Execution", "Analytics", "AI Product Management"]));
    expect(requiredSkills.length).toBeGreaterThan(0);
    expect(preferredSkills.length).toBeGreaterThan(0);
    expect(objectives.map((item) => item.objectiveId)).toContain("objective:ai");
    expect(expectations[0]?.priority).toMatch(/High|Medium/u);
  });

  it("creates HiringModel expectations without candidate reasoning", () => {
    const jobModel = new JobAnalyzer().analyze(strongJob());
    const hiringModel = new HiringAnalyzer().analyze(jobModel);

    expect(hiringModel.leadershipExpectations[0]?.dimension).toBe("Leadership");
    expect(hiringModel.technicalDepth.expectation).toContain("technical trade-offs");
    expect(hiringModel.evidenceExpectations.length).toBe(jobModel.evidenceExpectations.length);
    expect(JSON.stringify(hiringModel)).not.toContain("candidate-1");
  });

  it("creates EvaluationFramework dimensions and reuses Product Intelligence vocabulary", () => {
    const jobModel = new JobAnalyzer().analyze(strongJob());
    const hiringModel = new HiringAnalyzer().analyze(jobModel);
    const framework = new EvaluationAnalyzer().analyze(jobModel, hiringModel);

    expect(framework.dimensions.length).toBe(jobModel.requiredCompetencies.length);
    expect(framework.dimensions[0]?.recommendationPriority).toMatch(/High|Medium/u);
    expect(framework.dimensions[0]?.gapSeverity).toMatch(/high|medium/u);
    expect(framework.totalWeight).toBeGreaterThan(0);
  });

  it("creates deterministic JobMatchReport fit scoring, gaps, recommendations, and explainability", () => {
    const strong = runPipeline(strongJob(), strongCandidate()).report;
    const weak = runPipeline(strongJob(), weakCandidate()).report;

    expect(strong.overallFit.overallScore).toBeGreaterThan(weak.overallFit.overallScore);
    expect(weak.gaps.length).toBeGreaterThan(0);
    expect(weak.gapEvidence[0]?.missingEvidence.length).toBeGreaterThan(0);
    expect(weak.recommendations[0]?.priority).toMatch(/Critical|High|Medium/u);
    expect(weak.recommendations[0]?.recommendationType).toMatch(/Quantify|Strengthen|Clarify/u);
    expect(weak.explanationSummary.decisionId).toContain("job-match");
    expect(strong.confidence.value).toBeGreaterThan(0);
  });

  it("handles edge cases: minimal, incomplete, conflicting, and mixed-signal job descriptions", () => {
    const minimal = new JobAnalyzer().analyze({
      jobDescriptionId: "jd-minimal",
      title: "Product Manager",
      description: "Product Manager.",
      capturedAt: "2026-01-01T00:00:00.000Z"
    });
    const incomplete = new JobAnalyzer().analyze({
      jobDescriptionId: "jd-incomplete",
      description: "We need someone great.",
      capturedAt: "2026-01-01T00:00:00.000Z"
    });
    const conflicting = new JobAnalyzer().analyze({
      jobDescriptionId: "jd-conflicting",
      description: "Director product manager intern remote office hybrid payments ai role.",
      capturedAt: "2026-01-01T00:00:00.000Z"
    });

    expect(minimal.role.classification).toBe("ProductManager");
    expect(incomplete.role.classification).toBe("Unknown");
    expect(conflicting.location).toBe("Mixed");
    expect(conflicting.seniority.alternatives.length).toBeGreaterThan(0);
    expect(conflicting.domain.alternatives.length).toBeGreaterThan(0);
  });

  it("produces deterministic output for equivalent inputs and immutable collections", () => {
    const first = runPipeline(strongJob(), strongCandidate());
    const second = runPipeline(strongJob(), strongCandidate());

    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    expect(() => (first.report.recommendations as unknown as unknown[]).push(first.report.recommendations[0])).toThrow(TypeError);
    expect(() => (first.report.gapEvidence[0]?.missingEvidence as unknown as unknown[]).push({})).toThrow(TypeError);
  });

  it("keeps dependency boundaries clean", () => {
    const dependencies = Object.keys(packageJson.dependencies).sort();

    expect(dependencies).toEqual([
      "@career-companion/career-artifacts",
      "@career-companion/decision-engine",
      "@career-companion/decision-model",
      "@career-companion/explainability",
      "@career-companion/kernel",
      "@career-companion/product-intelligence"
    ].sort());
    expect(dependencies).not.toContain("@career-companion/resume-intelligence");
    expect(dependencies).not.toContain("@career-companion/portfolio-intelligence");
    expect(dependencies).not.toContain("@career-companion/interview-intelligence");
    expect(dependencies).not.toContain("@career-companion/application");
    expect(dependencies).not.toContain("@career-companion/persistence");
    expect(dependencies).not.toContain("@career-companion/repositories");
    expect(dependencies).not.toContain("@career-companion/retrieval");
  });

  it("keeps production source free of forbidden implementation technology", () => {
    const source = readProductionSource(join(__dirname, "../src"));

    expect(source).not.toMatch(/\bOpenAI\b|\bLLM\b|\bprompt\b|\bReact\b|\bNext\b|\bHTTP\b|\bSQL\b|\bPrisma\b|\bRepository\b/u);
    expect(source).not.toContain("@career-companion/resume-intelligence");
    expect(source).not.toContain("@career-companion/portfolio-intelligence");
    expect(source).not.toContain("@career-companion/interview-intelligence");
  });

  it("exports the public API", async () => {
    const api = await import("@career-companion/job-intelligence");

    expect(api.JobAnalyzer).toBeTypeOf("function");
    expect(api.HiringAnalyzer).toBeTypeOf("function");
    expect(api.EvaluationAnalyzer).toBeTypeOf("function");
    expect(api.JobMatchAnalyzer).toBeTypeOf("function");
    expect(api.RoleClassifier).toBeTypeOf("function");
  });
});

function runPipeline(job: RawJobDescription, candidate: CandidateIntelligence) {
  const jobAnalyzer = new JobAnalyzer();
  const hiringAnalyzer = new HiringAnalyzer();
  const evaluationAnalyzer = new EvaluationAnalyzer();
  const matchAnalyzer = new JobMatchAnalyzer();
  const jobModel = jobAnalyzer.analyze(job);
  const hiringModel = hiringAnalyzer.analyze(jobModel);
  const framework = evaluationAnalyzer.analyze(jobModel, hiringModel);
  const report = matchAnalyzer.analyze({ candidate, jobModel, hiringModel, evaluationFramework: framework });

  return { jobModel, hiringModel, framework, report };
}

function strongJob(): RawJobDescription {
  return {
    jobDescriptionId: "jd-ai-platform-lead",
    title: "Lead AI Platform Product Manager",
    company: "ExampleCo",
    capturedAt: "2026-01-01T00:00:00.000Z",
    description: [
      "Lead AI Platform Product Manager full-time remote office hybrid role.",
      "Own product strategy, roadmap, execution, launch delivery, and customer discovery.",
      "Partner with engineering on APIs, platform architecture, machine learning, LLM quality, and technical trade-offs.",
      "Use data, metrics, analytics, and experimentation to improve activation and reliability.",
      "Must influence stakeholders and mentor teams with 7+ years of experience.",
      "Bachelor degree preferred. Some travel may be required."
    ].join(" ")
  };
}

function strongCandidate(): CandidateIntelligence {
  return {
    candidateId: "candidate-1",
    competencies: ["Product Strategy", "Execution", "Analytics", "AI Product Management", "Platform Thinking", "Leadership"],
    skills: ["Roadmapping", "Analytics", "AI Product", "API Product", "Stakeholder Management"],
    evidence: ["metric evidence for Analytics", "work-sample evidence for Product Strategy", "work-sample evidence for Execution", "work-sample evidence for AI Product Management", "behavioral-example evidence for Leadership"],
    domains: ["AI", "Enterprise"],
    senioritySignals: ["Lead"]
  };
}

function weakCandidate(): CandidateIntelligence {
  return {
    candidateId: "candidate-weak",
    competencies: ["Execution"],
    skills: ["Roadmapping"],
    evidence: ["general project note"],
    domains: ["Consumer"],
    senioritySignals: ["MidLevel"]
  };
}

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

    if (!entry.endsWith(".ts")) return [];
    return [readFileSync(fullPath, "utf8")];
  }).join("\n");
}
