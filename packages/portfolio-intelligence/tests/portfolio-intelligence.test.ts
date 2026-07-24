import { describe, expect, it } from "vitest";
import type {
  AchievementSnapshot,
  CompetencySnapshot,
  EvidenceReferenceSnapshot,
  ISODateString,
  MetricSnapshot,
  PortfolioAssetSnapshot,
  ProjectSnapshot,
  StorySnapshot
} from "@career-companion/career-knowledge";
import {
  AchievementId,
  CompetencyId,
  DateRange,
  EvidenceReferenceId,
  MetricId,
  PortfolioAssetId,
  ProjectId,
  StoryId,
  TechnologyId
} from "@career-companion/career-knowledge";
import { createDecisionTrace } from "@career-companion/decision-engine";
import {
  CaseStudyPrioritizer,
  EvidenceSelector,
  PortfolioAnalyzer,
  PortfolioGapAnalyzer,
  PortfolioScoreCalculator,
  ProjectSelector
} from "../src";
import type { PortfolioSourceData } from "../src";
import packageJson from "../package.json";

describe("portfolio intelligence", () => {
  it("selects strongest projects with stable ordering", () => {
    const source = createSourceData();
    const selected = new ProjectSelector().select(source.projects);

    expect(selected.map((project) => project.project.id.toString())).toEqual(["project-ai", "project-legacy"]);
    expect(selected[0]?.score.value).toBeGreaterThan(selected[1]?.score.value ?? 0);
  });

  it("prioritizes case studies using existing story reasoning", () => {
    const source = createSourceData();
    const selected = new CaseStudyPrioritizer().prioritize(source.stories);

    expect(selected.map((story) => story.subject.id.toString())).toEqual(["story-ai", "story-ops"]);
    expect(selected[0]?.score.value).toBeGreaterThan(selected[1]?.score.value ?? 0);
  });

  it("assembles a canonical Portfolio CareerArtifact", () => {
    const model = new PortfolioAnalyzer().analyze({ source: createSourceData() });

    expect(model.artifact.artifactType).toBe("Portfolio");
    expect(model.sections.map((section) => section.sectionType)).toEqual([
      "overview",
      "case-studies",
      "evidence",
      "gaps",
      "recommendations"
    ]);
    expect(model.sections[0]?.blocks[0]?.explanation?.decisionTraceReference).toBe("PortfolioRecommendationPipeline:2026-01-01T00:00:00.000Z");
    expect(model.caseStudies).toHaveLength(2);
    expect(Object.isFrozen(model)).toBe(true);
    expect(Object.isFrozen(model.sections)).toBe(true);
  });

  it("attaches evidence and explainability to case studies and recommendations", () => {
    const model = new PortfolioAnalyzer().analyze({ source: createSourceData() });
    const caseStudy = model.caseStudies[0];
    const recommendation = model.recommendations[0];

    expect(caseStudy?.evidence[0]?.evidence.id.toString()).toBe("evidence-primary");
    expect(caseStudy?.acceptedAlternative?.option.label).toBe("Evidence-led PortfolioModel");
    expect(caseStudy?.rejectedAlternatives[0]?.option.label).toBe("Rendered portfolio output");
    expect(recommendation?.selectedEvidence).toHaveLength(3);
    expect(recommendation?.constraintSummary.constraints[0]?.label).toBe("Validated career knowledge only");
    expect(recommendation?.explanationSummary.graph.nodes.length).toBeGreaterThan(0);
  });

  it("detects portfolio gaps deterministically", () => {
    const source = createSourceData({
      competencies: [createCompetency("competency-ai", "AI Product Management", "ai-product-management")],
      metrics: [],
      projects: [createProject("project-legacy", "Legacy Project", "candidate", [])]
    });
    const selectedEvidence = new EvidenceSelector().select(source.evidence);
    const gaps = new PortfolioGapAnalyzer().analyze({ source, selectedEvidence });

    expect(gaps.map((gap) => gap.gapId)).toEqual([
      "portfolio-gap:leadership-evidence",
      "portfolio-gap:quantified-outcomes",
      "portfolio-gap:domain-diversity",
      "portfolio-gap:technical-depth",
      "portfolio-gap:business-impact"
    ]);
    expect(gaps[0]?.severity).toBe("high");
  });

  it("calculates deterministic portfolio scores", () => {
    const source = createSourceData();
    const selectedProjects = new ProjectSelector().select(source.projects);
    const selectedEvidence = new EvidenceSelector().select(source.evidence);
    const gaps = new PortfolioGapAnalyzer().analyze({ source, selectedEvidence });
    const score = new PortfolioScoreCalculator().calculate({ source, selectedProjects, gaps });

    expect(score.value).toBeGreaterThanOrEqual(60);
    expect(score.projectQuality).toBeGreaterThan(0);
    expect(score.businessImpact).toBeGreaterThan(0);
    expect(score.evidenceStrength).toBeGreaterThan(0);
    expect(Object.isFrozen(score)).toBe(true);
  });

  it("produces deterministic output for the same input", () => {
    const source = createSourceData();
    const analyzer = new PortfolioAnalyzer();

    expect(JSON.stringify(analyzer.analyze({ source }))).toBe(JSON.stringify(analyzer.analyze({ source })));
  });

  it("keeps package dependencies within the approved portfolio intelligence boundary", () => {
    const dependencies = Object.keys(packageJson.dependencies).sort();

    expect(dependencies).toEqual([
      "@career-companion/career-artifacts",
      "@career-companion/career-intelligence",
      "@career-companion/career-knowledge",
      "@career-companion/decision-engine",
      "@career-companion/decision-model",
      "@career-companion/explainability",
      "@career-companion/kernel"
    ].sort());
    expect(dependencies).not.toContain("@career-companion/application");
    expect(dependencies).not.toContain("@career-companion/resume-intelligence");
  });
});

function createSourceData(overrides: Partial<PortfolioSourceData> = {}): PortfolioSourceData {
  const primaryEvidenceId = new EvidenceReferenceId("evidence-primary");
  const supportingEvidenceId = new EvidenceReferenceId("evidence-supporting");
  const candidateEvidenceId = new EvidenceReferenceId("evidence-candidate");
  const aiCompetencyId = new CompetencyId("competency-ai");
  const leadershipCompetencyId = new CompetencyId("competency-leadership");
  const metricId = new MetricId("metric-1");
  const projectId = new ProjectId("project-ai");

  const source = {
    projects: [
      createProject("project-ai", "AI Workflow Platform", "verified", [primaryEvidenceId, supportingEvidenceId]),
      createProject("project-legacy", "Legacy Operations Project", "candidate", [])
    ],
    portfolioAssets: [createPortfolioAsset(projectId, primaryEvidenceId)],
    stories: [
      createStory("story-ai", "AI Platform Launch", [metricId], [aiCompetencyId, leadershipCompetencyId], [primaryEvidenceId]),
      createStory("story-ops", "Operational Cleanup", [], [aiCompetencyId], [])
    ],
    achievements: [createAchievement(primaryEvidenceId, aiCompetencyId)],
    competencies: [
      createCompetency("competency-ai", "AI Product Management", "ai-product-management"),
      createCompetency("competency-leadership", "Leadership", "leadership")
    ],
    metrics: [createMetric(metricId)],
    evidence: [
      createEvidence(supportingEvidenceId, "supporting", "verified", "Supporting launch evidence"),
      createEvidence(candidateEvidenceId, "primary", "candidate", "Candidate platform evidence"),
      createEvidence(primaryEvidenceId, "primary", "verified", "Verified launch evidence")
    ],
    requiredCompetencyIds: ["competency-ai", "competency-leadership"],
    decisionTrace: createDecisionTrace({
      metadata: {
        pipelineName: "PortfolioRecommendationPipeline",
        executionTimestamp: "2026-01-01T00:00:00.000Z"
      },
      stepsExecuted: [],
      decisionInputs: ["portfolio"],
      recommendations: ["portfolio-model"]
    })
  } satisfies PortfolioSourceData;

  return {
    ...source,
    ...overrides
  };
}

function createProject(
  id: string,
  name: string,
  verificationStatus: ProjectSnapshot["verificationStatus"],
  evidenceReferenceIds: readonly EvidenceReferenceId[]
): ProjectSnapshot {
  return {
    id: new ProjectId(id),
    name,
    description: `${name} description`,
    role: "Product Lead",
    dateRange: DateRange.create({
      startDate: "2025-01-01" as ISODateString,
      isCurrent: id === "project-ai"
    }).value as ProjectSnapshot["dateRange"],
    status: "active",
    verificationStatus,
    achievementIds: [],
    competencyIds: [new CompetencyId("competency-ai")],
    skillIds: [],
    technologyIds: id === "project-ai" ? [new TechnologyId("technology-ai")] : [],
    portfolioAssetIds: id === "project-ai" ? [new PortfolioAssetId("portfolio-asset-1")] : [],
    evidenceReferenceIds
  };
}

function createPortfolioAsset(projectId: ProjectId, evidenceReferenceId: EvidenceReferenceId): PortfolioAssetSnapshot {
  return {
    id: new PortfolioAssetId("portfolio-asset-1"),
    title: "AI Platform Case Study",
    assetType: "case-study",
    description: "Structured case study asset.",
    status: "published",
    verificationStatus: "verified",
    projectIds: [projectId],
    achievementIds: [],
    competencyIds: [new CompetencyId("competency-ai")],
    skillIds: [],
    technologyIds: [new TechnologyId("technology-ai")],
    evidenceReferenceIds: [evidenceReferenceId]
  };
}

function createStory(
  id: string,
  title: string,
  metricIds: readonly MetricId[],
  competencyIds: readonly CompetencyId[],
  evidenceReferenceIds: readonly EvidenceReferenceId[]
): StorySnapshot {
  return {
    id: new StoryId(id),
    title,
    status: "active",
    situation: "A product workflow required modernization.",
    problem: "Manual review slowed customer activation.",
    decision: "Prioritize deterministic workflow automation.",
    alternatives: ["Manual triage", "Vendor-only automation"],
    tradeoffs: ["More platform investment", "Less short-term feature breadth"],
    actions: ["Validated user needs", "Prioritized workflow changes", "Measured activation impact"],
    outcome: "Improved activation and review throughput.",
    lessons: ["Evidence improves prioritization quality."],
    metricIds,
    competencyIds,
    evidenceReferenceIds
  };
}

function createAchievement(evidenceReferenceId: EvidenceReferenceId, competencyId: CompetencyId): AchievementSnapshot {
  return {
    id: new AchievementId("achievement-1"),
    title: "Improved activation workflow",
    description: "Reduced manual product operations work.",
    outcome: "Faster activation",
    metricText: "25% faster workflow completion",
    verificationStatus: "verified",
    projectIds: [new ProjectId("project-ai")],
    competencyIds: [competencyId],
    skillIds: [],
    technologyIds: [],
    evidenceReferenceIds: [evidenceReferenceId],
    status: "active"
  };
}

function createCompetency(
  id: string,
  name: string,
  category: CompetencySnapshot["category"]
): CompetencySnapshot {
  return {
    id: new CompetencyId(id),
    name,
    category,
    description: `${name} capability`,
    status: "active",
    verificationStatus: "verified",
    achievementIds: [],
    projectIds: [new ProjectId("project-ai")],
    evidenceReferenceIds: [],
    skillIds: [],
    technologyIds: []
  };
}

function createMetric(id: MetricId): MetricSnapshot {
  return {
    id,
    name: "Workflow completion speed",
    unit: "percent",
    value: 25,
    source: "Product analytics",
    confidence: "high",
    measurementDate: "2025-01-01" as ISODateString,
    verificationStatus: "verified",
    status: "active"
  };
}

function createEvidence(
  id: EvidenceReferenceId,
  strength: EvidenceReferenceSnapshot["strength"],
  verificationStatus: EvidenceReferenceSnapshot["verificationStatus"],
  title: string
): EvidenceReferenceSnapshot {
  return {
    id,
    evidenceType: "document",
    title,
    sourceName: "Career Knowledge",
    strength,
    verificationStatus,
    status: "active"
  };
}
