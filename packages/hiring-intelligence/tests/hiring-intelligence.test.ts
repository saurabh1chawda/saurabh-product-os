import { describe, expect, it } from "vitest";
import type { CareerArtifact } from "@career-companion/career-artifacts";
import type { DecisionReport } from "@career-companion/career-decision";
import {
  HiringDecisionAnalyzer,
  HiringManagerAnalyzer,
  HiringPipelineAnalyzer,
  InterviewAnalyzer,
  RecruiterAnalyzer
} from "../src";
import packageJson from "../package.json";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

describe("hiring intelligence", () => {
  it("creates the canonical deterministic hiring pipeline", () => {
    const result = runPipeline();

    expect(result.pipeline.artifactKind).toBe("HiringPipeline");
    expect(result.recruiter.artifactKind).toBe("RecruiterEvaluation");
    expect(result.manager.artifactKind).toBe("HiringManagerEvaluation");
    expect(result.interview.artifactKind).toBe("InterviewEvaluation");
    expect(result.decision.artifactKind).toBe("HiringDecision");
    expect(result.decision.decision).toBe("Hire");
    expect(result.decision.artifact.artifactType).toBe("RecruiterBrief");
  });

  it("keeps HiringPipeline descriptive without scoring or recommendations", () => {
    const pipeline = new HiringPipelineAnalyzer().analyze(decisionReport());

    expect(pipeline.currentStage).toBe("RecruiterEvaluation");
    expect(pipeline.sequence.map((stage) => stage.stage)).toEqual([
      "CareerDecision",
      "RecruiterEvaluation",
      "HiringManagerEvaluation",
      "InterviewEvaluation",
      "HiringDecision"
    ]);
    expect(pipeline.sequence[2]?.dependencies).toEqual(["RecruiterEvaluation"]);
    expect(pipeline).not.toHaveProperty("score");
    expect(pipeline).not.toHaveProperty("recommendations");
  });

  it("evaluates recruiter and manager stages using only previous stage outputs", () => {
    const pipeline = new HiringPipelineAnalyzer().analyze(decisionReport());
    const recruiter = new RecruiterAnalyzer().analyze(pipeline);
    const manager = new HiringManagerAnalyzer().analyze(recruiter);

    expect(recruiter.proceedToHiringManager).toBe(true);
    expect(recruiter.score.dimensions.map((dimension) => dimension.dimension)).toContain("Resume clarity");
    expect(manager.recruiterEvaluationId).toBe(recruiter.evaluationId);
    expect(manager.spendInterviewTime).toBe(true);
    expect(manager).not.toHaveProperty("interviewScore");
  });

  it("validates interview assumptions before final hiring decision", () => {
    const { manager, interview, decision } = runPipeline();

    expect(interview.hiringManagerEvaluationId).toBe(manager.evaluationId);
    expect(interview.assumptionsValidated).toBe(true);
    expect(decision.interviewEvaluation.evaluationId).toBe(interview.evaluationId);
    expect(decision.pipelineSummary.stageScores.map((score) => score.dimension)).toEqual([
      "Recruiter Evaluation",
      "Hiring Manager Evaluation",
      "Interview Evaluation"
    ]);
  });

  it("handles weak recruiter signal as pipeline termination", () => {
    const pipeline = new HiringPipelineAnalyzer().analyze(decisionReport({ resumeScore: 38, jobFit: 41, evidenceScore: 35, readiness: 42 }));
    const recruiter = new RecruiterAnalyzer().analyze(pipeline);
    const manager = new HiringManagerAnalyzer().analyze(recruiter);
    const interview = new InterviewAnalyzer().analyze(manager);
    const decision = new HiringDecisionAnalyzer().analyze({ pipeline, recruiterEvaluation: recruiter, hiringManagerEvaluation: manager, interviewEvaluation: interview });

    expect(recruiter.proceedToHiringManager).toBe(false);
    expect(decision.decision).toBe("NoHire");
    expect(decision.pipelineSummary.terminationStage).toBe("RecruiterEvaluation");
    expect(decision.recommendationPriority).toBe("Critical");
  });

  it("handles strong recruiter and weak manager as hold", () => {
    const pipeline = new HiringPipelineAnalyzer().analyze(decisionReport({ resumeScore: 90, jobFit: 55, evidenceScore: 60, readiness: 88 }));
    const recruiter = new RecruiterAnalyzer().analyze(pipeline);
    const manager = new HiringManagerAnalyzer().analyze(recruiter);
    const interview = new InterviewAnalyzer().analyze(manager);
    const decision = new HiringDecisionAnalyzer().analyze({ pipeline, recruiterEvaluation: recruiter, hiringManagerEvaluation: manager, interviewEvaluation: interview });

    expect(recruiter.proceedToHiringManager).toBe(true);
    expect(manager.spendInterviewTime).toBe(false);
    expect(decision.decision).toBe("Hold");
    expect(decision.pipelineSummary.terminationStage).toBe("HiringManagerEvaluation");
  });

  it("handles strong manager and weak interview as lean hire or hold", () => {
    const pipeline = new HiringPipelineAnalyzer().analyze(decisionReport({ resumeScore: 84, jobFit: 82, evidenceScore: 78, readiness: 84, interviewScore: 35 }));
    const recruiter = new RecruiterAnalyzer().analyze(pipeline);
    const manager = new HiringManagerAnalyzer().analyze(recruiter);
    const interview = new InterviewAnalyzer().analyze(manager);
    const decision = new HiringDecisionAnalyzer().analyze({ pipeline, recruiterEvaluation: recruiter, hiringManagerEvaluation: manager, interviewEvaluation: interview });

    expect(manager.spendInterviewTime).toBe(true);
    expect(interview.assumptionsValidated).toBe(false);
    expect(["LeanHire", "Hold"]).toContain(decision.decision);
    expect(decision.pipelineSummary.terminationStage).toBe("InterviewEvaluation");
  });

  it("preserves explainability, confidence, and deterministic output", () => {
    const first = runPipeline().decision;
    const second = runPipeline().decision;

    expect(first).toEqual(second);
    expect(first.explanationSummary.narrative.reasonCodes).toContain("pipeline-aggregation");
    expect(first.explanationSummary.evidenceTrace.references.length).toBe(4);
    expect(first.confidence.band).toBe("high");
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.pipelineSummary.stageScores)).toBe(true);
    expect(Object.isFrozen(first.recommendations)).toBe(true);
  });

  it("reuses Product Intelligence vocabulary and avoids duplicate package dependencies", () => {
    const dependencies = Object.keys(packageJson.dependencies);

    expect(dependencies).toContain("@career-companion/product-intelligence");
    expect(dependencies).toContain("@career-companion/career-decision");
    expect(dependencies).not.toContain("@career-companion/application");
    expect(dependencies).not.toContain("@career-companion/infrastructure");
    expect(dependencies).not.toContain("@career-companion/persistence");
    expect(dependencies).not.toContain("@career-companion/repositories");
    expect(dependencies).not.toContain("@career-companion/resume-intelligence");
    expect(dependencies).not.toContain("@career-companion/portfolio-intelligence");
    expect(dependencies).not.toContain("@career-companion/interview-intelligence");
    expect(dependencies).not.toContain("@career-companion/job-intelligence");
  });

  it("keeps production source free of forbidden runtime technologies", () => {
    const source = readSource(sourceDirectory()).toLowerCase();

    expect(source).not.toContain("@career-companion/application");
    expect(source).not.toContain("@career-companion/infrastructure");
    expect(source).not.toContain("@career-companion/persistence");
    expect(source).not.toContain("@career-companion/repositories");
    expect(source).not.toContain("openai");
    expect(source).not.toContain("anthropic");
    expect(source).not.toContain("fetch(");
    expect(source).not.toContain("prisma");
    expect(source).not.toContain("react");
    expect(source).not.toContain("next");
  });
});

function runPipeline(input: Partial<DecisionInputs> = {}) {
  const pipeline = new HiringPipelineAnalyzer().analyze(decisionReport(input));
  const recruiter = new RecruiterAnalyzer().analyze(pipeline);
  const manager = new HiringManagerAnalyzer().analyze(recruiter);
  const interview = new InterviewAnalyzer().analyze(manager);
  const decision = new HiringDecisionAnalyzer().analyze({ pipeline, recruiterEvaluation: recruiter, hiringManagerEvaluation: manager, interviewEvaluation: interview });

  return { pipeline, recruiter, manager, interview, decision };
}

interface DecisionInputs {
  readonly resumeScore: number;
  readonly portfolioScore: number;
  readonly interviewScore: number;
  readonly jobFit: number;
  readonly evidenceScore: number;
  readonly readiness: number;
}

function decisionReport(input: Partial<DecisionInputs> = {}): DecisionReport {
  const values = {
    resumeScore: input.resumeScore ?? 84,
    portfolioScore: input.portfolioScore ?? 80,
    interviewScore: input.interviewScore ?? 78,
    jobFit: input.jobFit ?? 82,
    evidenceScore: input.evidenceScore ?? 76,
    readiness: input.readiness ?? 81
  };

  return {
    reportId: "decision-report:candidate-1:job-1",
    confidence: confidence(values.readiness),
    decisionTrace: { pipeline: "career-decision-pipeline" },
    artifact: artifact("artifact:decision-report"),
    summary: {
      topStrengths: ["Product Thinking", "Execution", "Leadership"],
      topRisks: values.readiness < 70 ? ["Evidence Quality"] : [],
      nextActions: ["decision-action:evidence"],
      headline: "Deterministic career decision report",
      readinessBand: "high"
    },
    assessment: {
      overallReadiness: { overallScore: values.readiness, band: "high", dimensions: [], contributions: [], penalties: [] },
      evidenceSufficiency: { dimension: "Evidence Sufficiency", score: values.evidenceScore, weight: 1, rationale: "fixture" },
      riskAreas: values.readiness < 70 ? [{ label: "Evidence Quality" }] : []
    },
    context: {
      resume: {
        artifact: artifact("artifact:resume"),
        score: { value: values.resumeScore }
      },
      portfolio: {
        artifact: artifact("artifact:portfolio"),
        score: { value: values.portfolioScore }
      },
      interview: {
        artifact: artifact("artifact:interview"),
        readinessScore: { overallScore: values.interviewScore }
      },
      jobMatchReport: {
        artifact: artifact("artifact:job-match"),
        overallFit: { overallScore: values.jobFit },
        evidenceCoverage: { score: values.evidenceScore },
        competencyCoverage: { score: values.jobFit }
      }
    }
  } as unknown as DecisionReport;
}

function artifact(artifactId: string): CareerArtifact {
  return {
    artifactId,
    artifactType: "CareerReport",
    metadata: {
      artifactId,
      artifactType: "CareerReport",
      title: artifactId,
      createdAt: "1970-01-01T00:00:00.000Z",
      source: "fixture",
      version: 1,
      references: []
    },
    summary: {
      headline: artifactId,
      summary: artifactId,
      references: []
    },
    sections: []
  };
}

function confidence(score: number) {
  return {
    value: score / 100,
    band: score >= 75 ? "high" : score >= 50 ? "medium" : "low",
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
  return join(process.cwd(), "packages", "hiring-intelligence", "src");
}
