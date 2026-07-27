import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { CareerArtifact } from "@career-companion/career-artifacts";
import type { EvaluationFramework, HiringModel, JobModel } from "@career-companion/job-intelligence";
import type { PortfolioModel } from "@career-companion/portfolio-intelligence";
import type { ResumeModel } from "@career-companion/resume-intelligence";
import { describe, expect, it } from "vitest";
import {
  CandidateFitAnalyzer,
  CompanyAnalysisAnalyzer,
  MarketAnalysisAnalyzer,
  OpportunityContextAnalyzer,
  OpportunityDecisionAnalyzer,
  RoleAnalysisAnalyzer
} from "../src";
import packageJson from "../package.json";

describe("opportunity intelligence", () => {
  it("creates the canonical deterministic opportunity pipeline", () => {
    const result = runPipeline();

    expect(result.context.artifactKind).toBe("OpportunityContext");
    expect(result.company.artifactKind).toBe("CompanyAnalysis");
    expect(result.role.artifactKind).toBe("RoleAnalysis");
    expect(result.market.artifactKind).toBe("MarketAnalysis");
    expect(result.fit.artifactKind).toBe("CandidateFit");
    expect(result.decision.artifactKind).toBe("OpportunityDecision");
    expect(result.decision.outcome).toBe("PursueImmediately");
  });

  it("keeps OpportunityContext descriptive and as the only aggregation boundary", () => {
    const context = new OpportunityContextAnalyzer().analyze(input());

    expect(context.sourceReferences.map((reference) => reference.referenceId)).toEqual(["artifact:resume", "artifact:portfolio", "artifact:job", "artifact:hiring", "artifact:evaluation"]);
    expect(context.sequence.map((stage) => stage.stage)).toEqual(["OpportunityContext", "CompanyAnalysis", "RoleAnalysis", "MarketAnalysis", "CandidateFit", "OpportunityDecision"]);
    expect(context).not.toHaveProperty("score");
    expect(context).not.toHaveProperty("recommendations");
    expect(context).not.toHaveProperty("companySize");
  });

  it("evaluates company characteristics without candidate fit", () => {
    const company = new CompanyAnalysisAnalyzer().analyze(new OpportunityContextAnalyzer().analyze(input()));

    expect(company.companySize.score.score).toBeGreaterThanOrEqual(0);
    expect(company.aiMaturityIndicators.score.score).toBeGreaterThan(50);
    expect(company).not.toHaveProperty("candidateFit");
    expect(company).not.toHaveProperty("recommendations");
  });

  it("evaluates role quality only after company analysis", () => {
    const { role } = runPipeline();

    expect(role.companyAnalysisId).toContain("company-analysis:");
    expect(role.productScope.score.score).toBeGreaterThan(50);
    expect(role.aiExposure.score.score).toBeGreaterThan(50);
    expect(role).not.toHaveProperty("candidateGaps");
  });

  it("evaluates only supplied market evidence without fetching data", () => {
    const { market } = runPipeline();

    expect(market.hiringDemandIndicator.score.score).toBeGreaterThanOrEqual(0);
    expect(market.industryGrowth.score.score).toBeGreaterThan(50);
    expect(market).not.toHaveProperty("fetchedAt");
  });

  it("compares the opportunity against the candidate without ATS or hiring logic", () => {
    const { fit } = runPipeline();

    expect(fit.skillAlignment.score.score).toBe(100);
    expect(fit.evidenceSufficiency.score.score).toBeGreaterThan(50);
    expect(fit).not.toHaveProperty("atsOutcome");
    expect(fit).not.toHaveProperty("hiringDecision");
  });

  it("produces supported opportunity decisions", () => {
    const strong = runPipeline().decision;
    const weak = runPipeline({ weakResume: true, weakSignals: true, weakRole: true }).decision;

    expect(["PursueImmediately", "HighPriority", "WorthExploring", "Monitor", "Decline"]).toContain(strong.outcome);
    expect(["PursueImmediately", "HighPriority", "WorthExploring", "Monitor", "Decline"]).toContain(weak.outcome);
    expect(weak.scoreSummary.overallScore).toBeLessThan(strong.scoreSummary.overallScore);
    expect(strong.alternativeOutcomesConsidered).not.toContain(strong.outcome);
  });

  it("enforces immediate predecessor analyzer signatures", () => {
    const source = readSource(sourceDirectory());

    expect(source).toContain("analyze(context: OpportunityContext): CompanyAnalysis");
    expect(source).toContain("analyze(company: CompanyAnalysis): RoleAnalysis");
    expect(source).toContain("analyze(role: RoleAnalysis): MarketAnalysis");
    expect(source).toContain("analyze(market: MarketAnalysis): CandidateFit");
    expect(source).toContain("analyze(fit: CandidateFit): OpportunityDecision");
    expect(source).not.toContain("analyze(input: ResumeModel");
  });

  it("carries context forward immutably and produces deterministic output", () => {
    const first = runPipeline();
    const second = runPipeline();

    expect(first.decision).toEqual(second.decision);
    expect(Object.isFrozen(first.decision)).toBe(true);
    expect(Object.isFrozen(first.decision.supportingEvidence)).toBe(true);
    expect(first.company.resume).toBe(first.context.resume);
    expect(first.fit.resume).toBe(first.context.resume);
  });

  it("reuses Product Intelligence vocabulary", () => {
    const { decision, fit } = runPipeline();

    expect(fit.scoreBreakdown).toHaveProperty("dimensions");
    expect(fit.gaps.every((gap) => ["low", "medium", "high"].includes(gap.severity))).toBe(true);
    expect(["Critical", "High", "Medium", "Low"]).toContain(decision.recommendationPriority);
    expect(decision.confidence).toHaveProperty("band");
  });

  it("adds deterministic explainability for every stage", () => {
    const result = runPipeline();

    expect(result.context.explanationSummary.decisionId).toBe(result.context.contextId);
    expect(result.company.explanationSummary.decisionId).toBe(result.company.analysisId);
    expect(result.role.explanationSummary.decisionId).toBe(result.role.analysisId);
    expect(result.market.explanationSummary.decisionId).toBe(result.market.analysisId);
    expect(result.fit.explanationSummary.decisionId).toBe(result.fit.fitId);
    expect(result.decision.explanationSummary.decisionId).toBe(result.decision.decisionId);
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

    expect(dependencies).toContain("@career-companion/resume-intelligence");
    expect(dependencies).toContain("@career-companion/portfolio-intelligence");
    expect(dependencies).toContain("@career-companion/job-intelligence");
    expect(dependencies).not.toContain("@career-companion/ats-intelligence");
    expect(dependencies).not.toContain("@career-companion/hiring-intelligence");
    expect(dependencies).not.toContain("@career-companion/career-decision");
    expect(dependencies).not.toContain("@career-companion/infrastructure");
    expect(dependencies).not.toContain("@career-companion/persistence");
  });

  it("keeps source free of forbidden technologies and candidate optimization ownership", () => {
    const source = readSource(sourceDirectory()).toLowerCase();

    expect(source).not.toContain("@career-companion/ats-intelligence");
    expect(source).not.toContain("@career-companion/hiring-intelligence");
    expect(source).not.toContain("@career-companion/career-decision");
    expect(source).not.toContain("@career-companion/persistence");
    expect(source).not.toContain("@career-companion/infrastructure");
    expect(source).not.toContain("fetch(");
    expect(source).not.toContain("openai");
    expect(source).not.toContain("embedding");
    expect(source).not.toContain("rewrite resume");
  });
});

function runPipeline(options: FixtureOptions = {}) {
  const context = new OpportunityContextAnalyzer().analyze(input(options));
  const company = new CompanyAnalysisAnalyzer().analyze(context);
  const role = new RoleAnalysisAnalyzer().analyze(company);
  const market = new MarketAnalysisAnalyzer().analyze(role);
  const fit = new CandidateFitAnalyzer().analyze(market);
  const decision = new OpportunityDecisionAnalyzer().analyze(fit);

  return { context, company, role, market, fit, decision };
}

interface FixtureOptions {
  readonly weakResume?: boolean;
  readonly weakSignals?: boolean;
  readonly weakRole?: boolean;
}

function input(options: FixtureOptions = {}) {
  const job = jobModel(options);
  return {
    resume: resumeModel(options),
    portfolio: portfolioModel(options),
    jobModel: job,
    hiringModel: hiringModel(job),
    evaluationFramework: evaluationFramework(job),
    opportunitySignals: opportunitySignals(options),
    assumptions: ["market evidence is caller supplied"],
    constraints: ["no external market fetch"],
    traceId: "trace:opportunity-test"
  };
}

function resumeModel(options: FixtureOptions): ResumeModel {
  const weak = options.weakResume === true;
  return {
    resumeId: "resume-1",
    profileId: "profile-1",
    artifact: artifact("artifact:resume", "Resume"),
    sections: [{ sectionId: "section:summary", sectionType: "summary", title: "Summary", order: 1, ordering: { order: 1 }, blocks: [], content: {} }],
    summary: { headline: weak ? "Operations Generalist" : "AI Platform Product Leader", summary: weak ? "Operations background." : "Led AI platform product strategy and growth.", competencies: [], evidence: [] },
    experience: [{
      employment: { id: "employment-1", roleTitle: weak ? "Operations Manager" : "Senior AI Platform Product Manager", employerName: "ExampleCo", dateRange: { startDate: "2020", endDate: "2024" }, verificationStatus: "verified", achievementIds: [], projectIds: [], skillIds: [], technologyIds: [], competencyIds: [], evidenceReferenceIds: [] },
      achievements: [{ id: "achievement-1", title: weak ? "Managed operations queue" : "Owned AI platform roadmap", description: "Deterministic fixture." }],
      metrics: weak ? [] : [{ id: "metric-1", name: "Revenue", value: 15, unit: "%" }],
      evidence: []
    }],
    skills: {
      skills: weak ? [{ id: "skill-1", name: "Operations" }] : [{ id: "skill-1", name: "AI Product Management" }, { id: "skill-2", name: "Product Strategy" }],
      technologies: weak ? [{ id: "tech-1", name: "Spreadsheets" }] : [{ id: "tech-1", name: "Machine Learning" }],
      competencies: weak ? [{ id: "competency-1", name: "Execution" }] : [{ id: "competency-1", name: "Leadership" }, { id: "competency-2", name: "Platform Thinking" }]
    },
    evidence: weak ? [] : [{ evidence: { id: "evidence-1", title: "AI Platform Case Study", evidenceType: "document", strength: "primary", verificationStatus: "verified", status: "active" } }],
    gaps: [],
    recommendations: [],
    score: { value: weak ? 45 : 88, evidenceScore: weak ? 35 : 82, competencyScore: weak ? 40 : 90, impactScore: weak ? 35 : 88, gapPenalty: weak ? 20 : 0 },
    explanation: {}
  } as unknown as ResumeModel;
}

function portfolioModel(options: FixtureOptions): PortfolioModel {
  return {
    artifact: artifact("artifact:portfolio", "Portfolio"),
    caseStudies: [],
    projects: [],
    recommendations: [],
    gaps: [],
    score: { value: options.weakResume ? 45 : 82, projectQuality: 80, businessImpact: 80, technicalDepth: 75, leadershipEvidence: 80, domainDiversity: 70, recency: 80, evidenceStrength: 80, coverage: 75, consistency: 80 },
    explanationSummary: {},
    sections: []
  } as unknown as PortfolioModel;
}

function jobModel(options: FixtureOptions): JobModel {
  const weakRole = options.weakRole === true;
  return {
    artifactKind: "JobModel",
    artifact: artifact("artifact:job", "JobMatchReport"),
    source: {
      jobDescriptionId: "job-1",
      title: weakRole ? "Operations Coordinator" : "Senior AI Platform Product Manager",
      company: "ExampleAI",
      description: weakRole ? "Maintain workflows." : "Own AI platform strategy, roadmap, product growth, cross functional execution and experimentation in a high growth market."
    },
    role: classification("ProductManager"),
    function: classification("ProductManagement"),
    seniority: classification("Senior"),
    domain: classification("AI"),
    industry: "SaaS",
    responsibilities: [{ responsibilityId: "responsibility-1", statement: weakRole ? "Maintain workflows" : "Own product strategy and platform roadmap", category: "strategy", rankingReasons: [] }],
    requiredCompetencies: [{ competencyId: "competency-1", name: "Leadership", required: true, weight: 0.8, evidenceExpectationIds: ["evidence-1"] }],
    requiredSkills: [{ skillId: "skill-1", name: "AI Product Management", required: true, sourceSignal: "jd" }],
    preferredSkills: [{ skillId: "skill-2", name: "Product Strategy", required: false, sourceSignal: "jd" }],
    businessObjectives: [{ objectiveId: "objective-1", statement: "Increase product adoption and revenue growth", successIndicators: ["Revenue"] }],
    evidenceExpectations: [{ expectationId: "evidence-1", evidenceType: "Case Study", description: "Product case study", priority: "High", gapSeverity: "medium" }],
    successIndicators: ["Revenue"],
    constraints: [],
    signals: [
      { signalId: "role:ownership", category: "role", value: weakRole ? "maintain" : "own platform decision authority", confidence: { value: 0.9, band: "high" } },
      { signalId: "market:growth", category: "market", value: options.weakSignals ? "flat market" : "growth demand velocity", confidence: { value: options.weakSignals ? 0.3 : 0.9, band: options.weakSignals ? "low" : "high" } }
    ],
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
  return { artifactKind: "HiringModel", artifact: artifact("artifact:hiring", "JobMatchReport"), jobModelId: job.source.jobDescriptionId, explanationSummary: {} } as unknown as HiringModel;
}

function evaluationFramework(job: JobModel): EvaluationFramework {
  return { artifactKind: "EvaluationFramework", artifact: artifact("artifact:evaluation", "JobMatchReport"), jobModelId: job.source.jobDescriptionId, hiringModelId: job.source.jobDescriptionId, dimensions: [], totalWeight: 1, scoringPolicyId: "policy", explanationSummary: {} } as unknown as EvaluationFramework;
}

function opportunitySignals(options: FixtureOptions) {
  if (options.weakSignals) {
    return [
      { signalId: "company:unclear", category: "company" as const, label: "Company Stability", value: "unclear", weight: 0.2 },
      { signalId: "market:flat", category: "market" as const, label: "Market Growth", value: "flat", weight: 0.2 }
    ];
  }
  return [
    { signalId: "company:growth", category: "company" as const, label: "Company Size", value: "growth", weight: 0.8 },
    { signalId: "company:mature", category: "company" as const, label: "Product Maturity", value: "mature", weight: 0.85 },
    { signalId: "company:remote", category: "company" as const, label: "Remote Policy", value: "remote", weight: 0.7 },
    { signalId: "market:demand", category: "market" as const, label: "Hiring Demand", value: "demand", weight: 0.85 },
    { signalId: "market:growth", category: "market" as const, label: "Industry Growth", value: "growth", weight: 0.85 }
  ];
}

function classification<T extends string>(classificationValue: T) {
  return { classification: classificationValue, confidence: { value: 1, band: "high" }, signals: [classificationValue], alternatives: [] };
}

function artifact(artifactId: string, artifactType: CareerArtifact["artifactType"]): CareerArtifact {
  return {
    artifactId,
    artifactType,
    metadata: { artifactId, artifactType, title: artifactId, createdAt: "1970-01-01T00:00:00.000Z", source: "fixture", version: 1, references: [] },
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
  if (existsSync(join(packageLocal, "package.json")) && packageLocal.endsWith("opportunity-intelligence")) return packageLocal;
  return join(process.cwd(), "packages", "opportunity-intelligence");
}

function sourceDirectory(): string {
  return join(packageRoot(), "src");
}
