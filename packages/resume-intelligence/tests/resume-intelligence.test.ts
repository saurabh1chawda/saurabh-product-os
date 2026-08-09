import { describe, expect, it } from "vitest";
import type {
  AchievementSnapshot,
  CareerProfileSnapshot,
  CompetencySnapshot,
  EmploymentRecordSnapshot,
  EvidenceReferenceSnapshot,
  ISODateString,
  MetricSnapshot,
  SkillSnapshot,
  TechnologySnapshot
} from "@career-companion/career-knowledge";
import {
  AchievementId,
  CareerProfileId,
  CompetencyId,
  DateRange,
  EmploymentRecordId,
  EvidenceReferenceId,
  MetricId,
  SkillId,
  TechnologyId
} from "@career-companion/career-knowledge";
import { createDecisionTrace } from "@career-companion/decision-engine";
import {
  ResumeAnalyzer,
  ResumeEvidenceSelector,
  ResumeGapAnalyzer,
  ResumeScoreCalculator,
  SectionBuilder
} from "../src";
import type { ResumeSourceData } from "../src";
import packageJson from "../package.json";

describe("resume intelligence", () => {
  it("constructs deterministic resume sections without rendering output", () => {
    const model = new ResumeAnalyzer().analyze({ source: createSourceData() });

    expect(model.resumeId).toBe("resume:career-profile-1");
    expect(model.sections.map((section) => section.sectionType)).toEqual([
      "summary",
      "experience",
      "skills",
      "evidence",
      "gaps",
      "recommendations"
    ]);
    expect(model.sections.map((section) => section.order)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(model.summary.headline).toBe("AI Product Leader");
    expect(model.artifact.artifactType).toBe("Resume");
    expect(model.artifact.sections).toEqual(model.sections);
    expect(model.experience).toHaveLength(1);
    expect(model.skills.skills).toHaveLength(1);
    expect(Object.isFrozen(model.sections)).toBe(true);
  });

  it("prioritizes evidence and preserves stable ordering", () => {
    const source = createSourceData();
    const selector = new ResumeEvidenceSelector();
    const first = selector.select({ evidence: source.evidence });
    const second = selector.select({ evidence: source.evidence });

    expect(first.map((evidence) => evidence.evidence.id.toString())).toEqual([
      "evidence-primary",
      "evidence-supporting",
      "evidence-candidate"
    ]);
    expect(second.map((evidence) => evidence.evidence.id.toString())).toEqual(first.map((evidence) => evidence.evidence.id.toString()));
    expect(first[0]?.score.value).toBeGreaterThan(first[1]?.score.value ?? 0);
  });

  it("identifies competency gaps from required target coverage", () => {
    const gaps = new ResumeGapAnalyzer().analyze({
      requiredCompetencyIds: ["competency-ai", "competency-payments"],
      demonstratedCompetencies: [createCompetency("competency-ai", "AI Product Management")]
    });

    expect(gaps).toEqual([
      {
        gapId: "resume-gap:competency-payments",
        competencyId: "competency-payments",
        reason: "Required competency competency-payments is not represented in the resume evidence set.",
        severity: "high"
      }
    ]);
  });

  it("calculates resume scores from evidence, competency coverage, impact, and gaps", () => {
    const source = createSourceData();
    const selectedEvidence = new ResumeEvidenceSelector().select({ evidence: source.evidence });
    const gaps = new ResumeGapAnalyzer().analyze({
      requiredCompetencyIds: source.requiredCompetencyIds,
      demonstratedCompetencies: source.competencies
    });

    const score = new ResumeScoreCalculator().calculate({
      selectedEvidence,
      demonstratedCompetencyCount: source.competencies.length,
      requiredCompetencyCount: source.requiredCompetencyIds.length,
      impactCount: source.achievements.length + source.metrics.length,
      gaps
    });

    expect(score.value).toBeGreaterThan(0);
    expect(score.evidenceScore).toBeGreaterThan(0);
    expect(score.gapPenalty).toBe(10);
    expect(Object.isFrozen(score)).toBe(true);
  });

  it("attaches explainability to every recommendation", () => {
    const model = new ResumeAnalyzer().analyze({ source: createSourceData() });
    const recommendation = model.recommendations[0];

    expect(recommendation?.selectedEvidence).toHaveLength(3);
    expect(recommendation?.competencies.map((competency) => competency.id.toString())).toEqual(["competency-ai"]);
    expect(recommendation?.decisionTraceReference).toBe("ResumeRecommendationPipeline:2026-01-01T00:00:00.000Z");
    expect(recommendation?.alternativeConsideration.acceptedAlternative?.option.label).toBe("Evidence-led ResumeModel");
    expect(recommendation?.alternativeConsideration.rejectedAlternatives[0]?.option.label).toBe("Rendered resume output");
    expect(recommendation?.explanation.explanationSummary.graph.nodes.length).toBeGreaterThan(0);
    expect(Object.isFrozen(recommendation)).toBe(true);
  });

  it("produces deterministic output for the same input", () => {
    const source = createSourceData();
    const analyzer = new ResumeAnalyzer();

    expect(JSON.stringify(analyzer.analyze({ source }))).toBe(JSON.stringify(analyzer.analyze({ source })));
  });

  it("keeps package dependencies inside the approved resume intelligence boundary", () => {
    const dependencies = Object.keys(packageJson.dependencies);

    expect(dependencies.sort()).toEqual([
      "@career-companion/application",
      "@career-companion/career-artifacts",
      "@career-companion/career-intelligence",
      "@career-companion/career-knowledge",
      "@career-companion/decision-engine",
      "@career-companion/decision-model",
      "@career-companion/explainability",
      "@career-companion/kernel"
    ].sort());
    expect(dependencies).not.toContain("@career-companion/infrastructure");
    expect(dependencies).not.toContain("@career-companion/infrastructure-memory");
  });

  it("builds sections from an existing resume model", () => {
    const model = new ResumeAnalyzer().analyze({ source: createSourceData() });

    expect(new SectionBuilder().fromModel(model)).toEqual(model.sections);
  });
});

function createSourceData(): ResumeSourceData {
  const employmentId = new EmploymentRecordId("employment-1");
  const achievementId = new AchievementId("achievement-1");
  const evidencePrimaryId = new EvidenceReferenceId("evidence-primary");
  const evidenceSupportingId = new EvidenceReferenceId("evidence-supporting");
  const evidenceCandidateId = new EvidenceReferenceId("evidence-candidate");
  const competencyId = new CompetencyId("competency-ai");
  const metricId = new MetricId("metric-1");

  return {
    careerProfile: {
      id: new CareerProfileId("career-profile-1"),
      displayName: "Saurabh",
      headline: "AI Product Leader",
      summary: "Leads AI product strategy with measurable platform outcomes.",
      status: "published",
      verificationStatus: "verified",
      employmentRecordIds: [employmentId],
      achievementIds: [achievementId],
      competencyIds: [competencyId],
      skillIds: [new SkillId("skill-1")],
      technologyIds: [new TechnologyId("technology-1")],
      projectIds: [],
      portfolioAssetIds: [],
      educationIds: [],
      certificationIds: [],
      evidenceReferenceIds: [evidencePrimaryId, evidenceSupportingId, evidenceCandidateId]
    } satisfies CareerProfileSnapshot,
    employmentRecords: [createEmployment(employmentId, achievementId, evidencePrimaryId)],
    achievements: [createAchievement(achievementId, employmentId, competencyId, evidencePrimaryId)],
    competencies: [createCompetency(competencyId.toString(), "AI Product Management")],
    skills: [createSkill()],
    technologies: [createTechnology()],
    stories: [],
    metrics: [createMetric(metricId)],
    evidence: [
      createEvidence(evidenceSupportingId, "supporting", "verified", "Supporting launch evidence"),
      createEvidence(evidenceCandidateId, "primary", "candidate", "Candidate AI evidence"),
      createEvidence(evidencePrimaryId, "primary", "verified", "Verified AI evidence")
    ],
    requiredCompetencyIds: ["competency-ai", "competency-payments"],
    decisionTrace: createDecisionTrace({
      metadata: {
        pipelineName: "ResumeRecommendationPipeline",
        executionTimestamp: "2026-01-01T00:00:00.000Z"
      },
      stepsExecuted: [],
      decisionInputs: ["career-profile-1"],
      recommendations: ["resume-model"]
    })
  };
}

function createEmployment(
  id: EmploymentRecordId,
  achievementId: AchievementId,
  evidenceReferenceId: EvidenceReferenceId
): EmploymentRecordSnapshot {
  return {
    id,
    employerName: "Company X",
    roleTitle: "Senior Product Manager",
    dateRange: DateRange.create({
      startDate: "2024-01-01" as ISODateString,
      isCurrent: true
    }).value as EmploymentRecordSnapshot["dateRange"],
    verificationStatus: "verified",
    achievementIds: [achievementId],
    projectIds: [],
    skillIds: [],
    technologyIds: [],
    competencyIds: [],
    evidenceReferenceIds: [evidenceReferenceId]
  };
}

function createAchievement(
  id: AchievementId,
  employmentRecordId: EmploymentRecordId,
  competencyId: CompetencyId,
  evidenceReferenceId: EvidenceReferenceId
): AchievementSnapshot {
  return {
    id,
    title: "Launched AI platform capability",
    description: "Led customer discovery and shipped AI workflow improvements.",
    outcome: "Improved activation and reduced manual review.",
    metricText: "25% faster workflow completion",
    verificationStatus: "verified",
    employmentRecordId,
    projectIds: [],
    competencyIds: [competencyId],
    skillIds: [],
    technologyIds: [],
    evidenceReferenceIds: [evidenceReferenceId],
    status: "active"
  };
}

function createCompetency(id: string, name: string): CompetencySnapshot {
  return {
    id: new CompetencyId(id),
    name,
    category: "ai-product-management",
    description: "Demonstrated capability in AI product management.",
    status: "active",
    verificationStatus: "verified",
    achievementIds: [],
    projectIds: [],
    evidenceReferenceIds: [],
    skillIds: [],
    technologyIds: []
  };
}

function createSkill(): SkillSnapshot {
  return {
    id: new SkillId("skill-1"),
    name: "Product Strategy",
    category: "product",
    status: "active",
    verificationStatus: "verified",
    competencyIds: [],
    achievementIds: [],
    projectIds: [],
    evidenceReferenceIds: []
  };
}

function createTechnology(): TechnologySnapshot {
  return {
    id: new TechnologyId("technology-1"),
    name: "AI Workflow Platform",
    category: "ai",
    status: "active",
    verificationStatus: "verified",
    competencyIds: [],
    achievementIds: [],
    projectIds: [],
    evidenceReferenceIds: []
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
