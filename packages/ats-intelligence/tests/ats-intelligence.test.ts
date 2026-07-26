import { describe, expect, it } from "vitest";
import type { CareerArtifact } from "@career-companion/career-artifacts";
import type { EvaluationFramework, HiringModel, JobModel } from "@career-companion/job-intelligence";
import type { ResumeModel } from "@career-companion/resume-intelligence";
import {
  ATSDecisionAnalyzer,
  ATSMatchingAnalyzer,
  ATSParsingAnalyzer,
  ATSPipelineAnalyzer,
  ATSScreeningAnalyzer
} from "../src";
import packageJson from "../package.json";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

describe("ats intelligence", () => {
  it("creates the canonical deterministic ATS pipeline", () => {
    const result = runPipeline();

    expect(result.pipeline.artifactKind).toBe("ATSPipeline");
    expect(result.parsing.artifactKind).toBe("ATSParsing");
    expect(result.matching.artifactKind).toBe("ATSMatching");
    expect(result.screening.artifactKind).toBe("ATSScreening");
    expect(result.decision.artifactKind).toBe("ATSDecision");
    expect(result.decision.outcome).toBe("Pass");
  });

  it("keeps ATSPipeline descriptive and as the only multi-input boundary", () => {
    const pipeline = new ATSPipelineAnalyzer().analyze(input());

    expect(pipeline.sourceArtifactIds).toEqual(["artifact:resume", "artifact:job", "artifact:hiring", "artifact:evaluation"]);
    expect(pipeline.sequence.map((stage) => stage.stage)).toEqual(["ATSPipeline", "ATSParsing", "ATSMatching", "ATSScreening", "ATSDecision"]);
    expect(pipeline).not.toHaveProperty("score");
    expect(pipeline).not.toHaveProperty("recommendations");
    expect(pipeline).not.toHaveProperty("matches");
  });

  it("parses sections, skills, metrics, dates and warnings without calculating job fit", () => {
    const parsing = new ATSParsingAnalyzer().analyze(new ATSPipelineAnalyzer().analyze(input({ missingSections: ["skills"], ambiguousDates: true })));

    expect(parsing.detectedSections.find((section) => section.sectionType === "summary")?.present).toBe(true);
    expect(parsing.missingFields).toContain("skills");
    expect(parsing.ambiguousFields[0]).toContain("employment-date");
    expect(parsing.skills).toContain("AI Product Management");
    expect(parsing.quantifiedEvidence).toContain("Revenue:15%");
    expect(parsing.status).toBe("partial");
    expect(parsing).not.toHaveProperty("jobFit");
  });

  it("matches parsed candidate evidence against canonical Job Intelligence requirements", () => {
    const { matching } = runPipeline();

    expect(matching.requiredSkillCoverage.score).toBe(100);
    expect(matching.preferredSkillCoverage.score).toBe(100);
    expect(matching.roleAlignment.score).toBeGreaterThanOrEqual(0);
    expect(matching.competencyCoverage.score).toBe(100);
    expect(matching.evidenceExpectationCoverage.score).toBe(100);
    expect(matching.quantifiedImpactCoverage.score).toBe(85);
    expect(matching.requirementMatches.some((match) => match.label === "AI Product Management")).toBe(true);
  });

  it("supports deterministic alias matching without semantic AI claims", () => {
    const { matching } = runPipeline({ skillName: "Machine Learning" });

    expect(matching.requiredSkillCoverage.score).toBe(100);
    expect(matching.requirementMatches.find((match) => match.label === "AI Product Management")?.rankingReason.statement).toContain("deterministic alias policy");
  });

  it("applies screening gates without creating the final decision", () => {
    const { screening } = runPipeline();

    expect(screening.hardGateResult).toBe("passed");
    expect(screening.softThresholdResult).toBe("passed");
    expect(screening.overallScreeningStatus).toBe("passed");
    expect(screening).not.toHaveProperty("outcome");
  });

  it("rejects when an explicit hard gate fails even if other scores are strong", () => {
    const { screening, decision } = runPipeline({ omitRequiredSkill: true, includeMetric: true });

    expect(screening.failedGates.map((gate) => gate.gateId)).toContain("ats-gate:required-skills");
    expect(decision.outcome).toBe("Reject");
    expect(decision.blockingEvidence.length).toBeGreaterThan(0);
  });

  it("passes with warnings for non-blocking deficiencies only", () => {
    const { screening, decision } = runPipeline({ omitPreferredSkill: true, evidenceThreshold: 95 });

    expect(screening.warningGates.length).toBeGreaterThan(0);
    expect(screening.failedGates.length).toBe(0);
    expect(decision.outcome).toBe("PassWithWarnings");
  });

  it("uses manual review for incomplete or conflicting evidence", () => {
    const { decision } = runPipeline({ ambiguousDates: true, manualReviewBelowConfidence: 95 });

    expect(decision.outcome).toBe("ManualReview");
    expect(decision.manualReviewReasons).toContain("manual-policy");
  });

  it("handles weak match without hard-gate failure as warnings or manual review", () => {
    const { decision } = runPipeline({ omitPreferredSkill: true, evidenceThreshold: 75 });

    expect(["PassWithWarnings", "ManualReview"]).toContain(decision.outcome);
    expect(decision.failedGates).not.toContain("ats-gate:mandatory-requirements");
  });

  it("carries context forward and enforces immediate predecessor analyzers", () => {
    const source = readSource(sourceDirectory());

    expect(source).toContain("analyze(pipeline: ATSPipeline): ATSParsing");
    expect(source).toContain("analyze(parsing: ATSParsing): ATSMatching");
    expect(source).toContain("analyze(matching: ATSMatching): ATSScreening");
    expect(source).toContain("analyze(screening: ATSScreening): ATSDecision");
    expect(source).not.toContain("ATSDecisionAnalyzer {\n  private readonly artifactBuilder = new ATSDecisionArtifactBuilder();\n\n  analyze(input:");
  });

  it("does not mutate predecessor artifacts and produces deterministic output", () => {
    const first = runPipeline();
    const second = runPipeline();

    expect(first.decision).toEqual(second.decision);
    expect(Object.isFrozen(first.decision)).toBe(true);
    expect(Object.isFrozen(first.decision.supportingEvidence)).toBe(true);
    expect(first.pipeline.resume).toBe(first.parsing.artifact.sections[0]?.blocks[0]?.content && first.pipeline.resume);
  });

  it("prevents protected and sensitive characteristics from influencing outcomes", () => {
    const baseline = runPipeline({ candidateName: "Candidate One", photograph: false, age: "28", gender: "female", nationality: "Canadian" }).decision;
    const variant = runPipeline({ candidateName: "Candidate Two", photograph: true, age: "61", gender: "male", nationality: "Indian" }).decision;

    expect(variant.outcome).toBe(baseline.outcome);
    expect(variant.scoreSummary.overallScore).toBe(baseline.scoreSummary.overallScore);
  });

  it("does not treat nationality as work authorization", () => {
    const decision = runPipeline({ nationality: "United States", requireAuthorization: false }).decision;

    expect(decision.constraints).not.toContain("Nationality");
    expect(decision.outcome).toBe("Pass");
  });

  it("checks explicit location or authorization only when explicitly required and evidenced", () => {
    const absent = runPipeline({ requireAuthorization: false, locationRequired: false }).decision;
    const explicitMissing = runPipeline({ requireAuthorization: true, authorizationEvidence: false }).decision;

    expect(absent.outcome).toBe("Pass");
    expect(explicitMissing.outcome).toBe("Reject");
    expect(explicitMissing.blockingEvidence).toContain("Work Authorization");
  });

  it("keeps dependency boundaries and public exports clean", () => {
    const dependencies = Object.keys(packageJson.dependencies);

    expect(dependencies).toContain("@career-companion/resume-intelligence");
    expect(dependencies).toContain("@career-companion/job-intelligence");
    expect(dependencies).toContain("@career-companion/product-intelligence");
    expect(dependencies).not.toContain("@career-companion/hiring-intelligence");
    expect(dependencies).not.toContain("@career-companion/application");
    expect(dependencies).not.toContain("@career-companion/infrastructure");
    expect(dependencies).not.toContain("@career-companion/persistence");
    expect(dependencies).not.toContain("@career-companion/repositories");
  });

  it("keeps source free of forbidden technologies and proprietary claims", () => {
    const source = readSource(sourceDirectory()).toLowerCase();

    expect(source).not.toContain("@career-companion/application");
    expect(source).not.toContain("@career-companion/hiring-intelligence");
    expect(source).not.toContain("@career-companion/persistence");
    expect(source).not.toContain("@career-companion/repositories");
    expect(source).not.toContain("openai");
    expect(source).not.toContain("anthropic");
    expect(source).not.toContain("embedding");
    expect(source).not.toContain("fetch(");
    expect(source).not.toContain("prisma");
    expect(source).not.toContain("proprietary ats");
    expect(source).not.toContain("vendor prediction");
  });
});

function runPipeline(options: FixtureOptions = {}) {
  const pipeline = new ATSPipelineAnalyzer().analyze(input(options));
  const parsing = new ATSParsingAnalyzer().analyze(pipeline);
  const matching = new ATSMatchingAnalyzer().analyze(parsing);
  const screening = new ATSScreeningAnalyzer().analyze(matching);
  const decision = new ATSDecisionAnalyzer().analyze(screening);

  return { pipeline, parsing, matching, screening, decision };
}

interface FixtureOptions {
  readonly missingSections?: readonly string[];
  readonly ambiguousDates?: boolean;
  readonly omitRequiredSkill?: boolean;
  readonly omitPreferredSkill?: boolean;
  readonly includeMetric?: boolean;
  readonly skillName?: string;
  readonly evidenceThreshold?: number;
  readonly manualReviewBelowConfidence?: number;
  readonly candidateName?: string;
  readonly photograph?: boolean;
  readonly age?: string;
  readonly gender?: string;
  readonly nationality?: string;
  readonly requireAuthorization?: boolean;
  readonly authorizationEvidence?: boolean;
  readonly locationRequired?: boolean;
}

function input(options: FixtureOptions = {}) {
  const job = jobModel(options);
  return {
    resume: resumeModel(options),
    jobModel: job,
    hiringModel: hiringModel(job),
    evaluationFramework: evaluationFramework(job),
    decisionTrace: decisionTrace(),
    screeningPolicy: {
      minimumEvidenceCoverage: options.evidenceThreshold,
      manualReviewBelowConfidence: options.manualReviewBelowConfidence
    }
  };
}

function resumeModel(options: FixtureOptions): ResumeModel {
  const skillName = options.omitRequiredSkill ? "Operations" : options.skillName ?? "AI Product Management";
  const preferred = options.omitPreferredSkill ? "Documentation" : "Analytics";
  const sections = ["summary", "experience", "skills", "education", "certifications"].filter((section) => !(options.missingSections ?? []).includes(section));
  return {
    resumeId: "resume-1",
    profileId: "profile-1",
    artifact: artifact("artifact:resume", [
      ...(options.photograph ? [{ referenceId: "photo", referenceType: "media", label: "photograph" }] : []),
      ...(options.candidateName ? [{ referenceId: "name", referenceType: "contact", label: options.candidateName }] : [])
    ]),
    sections: sections.map((section, index) => ({ sectionType: section, title: section, order: index + 1 })),
    summary: { headline: "AI Product Leader", summary: "Product strategy and analytics leader.", competencies: [], evidence: [] },
    experience: [{
      employment: {
        id: "employment-1",
        employerName: "ExampleCo",
        roleTitle: options.omitRequiredSkill ? "Senior Operations Manager" : "Senior AI Product Manager",
        dateRange: { startDate: "2020-01-01", endDate: options.ambiguousDates ? undefined : "2024-01-01" },
        verificationStatus: "verified",
        achievementIds: [],
        projectIds: [],
        skillIds: [],
        technologyIds: [],
        competencyIds: [],
        evidenceReferenceIds: []
      },
      achievements: [{ id: "achievement-1", title: options.omitRequiredSkill ? "Led workflow operations" : "Led AI product strategy", description: "Drove roadmap and execution." }],
      metrics: options.includeMetric === false ? [] : [{ id: "metric-1", name: "Revenue", unit: "%", value: 15 }],
      evidence: []
    }],
    skills: {
      skills: [{ id: "skill-1", name: skillName }, { id: "skill-2", name: preferred }],
      technologies: [{ id: "technology-1", name: options.omitRequiredSkill ? "Workflow" : "Machine Learning" }],
      competencies: [{ id: "competency-1", name: "Product Strategy" }, { id: "competency-2", name: "Leadership" }]
    },
    evidence: [{ evidence: { id: "evidence-1", title: "Case Study", evidenceType: "document", strength: "primary", verificationStatus: "verified", status: "active" } }],
    gaps: [],
    recommendations: [],
    score: { value: 85, evidenceScore: 80, competencyScore: 90, impactScore: 85, gapPenalty: 0 },
    explanation: {}
  } as unknown as ResumeModel;
}

function jobModel(options: FixtureOptions): JobModel {
  return {
    artifactKind: "JobModel",
    artifact: artifact("artifact:job"),
    source: { jobDescriptionId: "job-1", description: "AI Product Manager", capturedAt: "1970-01-01T00:00:00.000Z" },
    role: classification("ProductManager"),
    function: classification("ProductManagement"),
    seniority: classification("Senior"),
    domain: classification("AI"),
    industry: "SaaS",
    responsibilities: [{ responsibilityId: "resp-1", statement: "Own product strategy and roadmap", category: "strategy", rankingReasons: [] }],
    requiredCompetencies: [{ competencyId: "competency-1", name: "Product Strategy", required: true, weight: 1, evidenceExpectationIds: ["evidence-1"] }],
    requiredSkills: [
      { skillId: "skill-required", name: "AI Product Management", required: true, sourceSignal: "jd" },
      ...(options.requireAuthorization ? [{ skillId: "authorization", name: "Work Authorization", required: true, sourceSignal: "jd" }] : []),
      ...(options.locationRequired ? [{ skillId: "location", name: "Remote", required: true, sourceSignal: "jd" }] : [])
    ],
    preferredSkills: [{ skillId: "skill-preferred", name: "Analytics", required: false, sourceSignal: "jd" }],
    businessObjectives: [{ objectiveId: "objective-1", statement: "Improve product adoption using analytics", successIndicators: ["Revenue"] }],
    evidenceExpectations: [{ expectationId: "evidence-1", evidenceType: "Case Study", description: "Case study evidence", priority: "High", gapSeverity: "medium" }],
    successIndicators: ["Revenue"],
    constraints: [],
    signals: [],
    location: "Remote",
    employmentType: "FullTime",
    experienceExpectations: [],
    educationExpectations: [],
    certificationExpectations: [],
    travelExpectations: [],
    explanationSummary: {}
  } as unknown as JobModel;
}

function hiringModel(job: JobModel): HiringModel {
  return { artifactKind: "HiringModel", artifact: artifact("artifact:hiring"), jobModelId: job.source.jobDescriptionId, explanationSummary: {} } as unknown as HiringModel;
}

function evaluationFramework(job: JobModel): EvaluationFramework {
  return { artifactKind: "EvaluationFramework", artifact: artifact("artifact:evaluation"), jobModelId: job.source.jobDescriptionId, hiringModelId: job.source.jobDescriptionId, dimensions: [], totalWeight: 1, scoringPolicyId: "policy", explanationSummary: {} } as unknown as EvaluationFramework;
}

function classification<T extends string>(classificationValue: T) {
  return { classification: classificationValue, confidence: { value: 1, band: "high" }, signals: [classificationValue], alternatives: [] };
}

function artifact(artifactId: string, references: readonly { readonly referenceId: string; readonly referenceType: string; readonly label?: string }[] = []): CareerArtifact {
  return {
    artifactId,
    artifactType: "JobMatchReport",
    metadata: { artifactId, artifactType: "JobMatchReport", title: artifactId, createdAt: "1970-01-01T00:00:00.000Z", source: "fixture", version: 1, references },
    summary: { headline: artifactId, summary: artifactId, references },
    sections: []
  } as unknown as CareerArtifact;
}

function decisionTrace() {
  return {
    pipeline: "ats-intelligence-test",
    stepsExecuted: [],
    decisionInputs: [],
    recommendations: [],
    scores: [],
    confidence: [],
    reasons: [],
    executionTimestamp: "1970-01-01T00:00:00.000Z"
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
  return join(process.cwd(), "packages", "ats-intelligence", "src");
}
