import { describe, expect, it } from "vitest";
import {
  CompetencyCoverageAnalyzer,
  EvidenceRanker,
  IdentitySelector,
  MetricStrengthCalculator,
  StorySelector
} from "../src";
import {
  CompetencyId,
  EvidenceReferenceId,
  MetricId,
  ProfessionalIdentityId,
  StoryId
} from "@career-companion/career-knowledge";
import type {
  CompetencySnapshot,
  EvidenceReferenceSnapshot,
  MetricSnapshot,
  ProfessionalIdentitySnapshot,
  StorySnapshot
} from "@career-companion/career-knowledge";

describe("career intelligence deterministic services", () => {
  it("selects identities with stable ranking and deterministic tie-breaks", () => {
    const identities: readonly ProfessionalIdentitySnapshot[] = [
      identity("identity-b", "B", 1, 0, 0),
      identity("identity-a", "A", 1, 0, 0)
    ];
    const selector = new IdentitySelector();

    expect(selector.select(identities).map((ranking) => ranking.subject.id.toString())).toEqual(["identity-b", "identity-a"]);
    expect(selector.select(identities)).toEqual(selector.select(identities));
  });

  it("ranks stories by evidence, metrics, competencies, and completeness", () => {
    const stories: readonly StorySnapshot[] = [
      story("story-weak", 0, 0, 0),
      story("story-strong", 2, 2, 2)
    ];

    const rankings = new StorySelector().select(stories);

    expect(rankings[0]?.subject.id.toString()).toBe("story-strong");
    expect(rankings[0]?.confidence.value).toBeGreaterThan(rankings[1]?.confidence.value ?? 0);
  });

  it("ranks evidence by strength and verification", () => {
    const evidence: readonly EvidenceReferenceSnapshot[] = [
      evidenceReference("evidence-supporting", "supporting", "candidate"),
      evidenceReference("evidence-primary", "primary", "verified")
    ];

    const rankings = new EvidenceRanker().rank(evidence);

    expect(rankings[0]?.subject.id.toString()).toBe("evidence-primary");
    expect(rankings[0]?.score.value).toBeGreaterThan(rankings[1]?.score.value ?? 0);
  });

  it("calculates metric strength from value, verification, and confidence", () => {
    const calculator = new MetricStrengthCalculator();
    const verified = calculator.calculate(metric("metric-verified", 10, "verified", "high"));
    const unverified = calculator.calculate(metric("metric-unverified", 10, "unverified", "low"));

    expect(verified.score.value).toBeGreaterThan(unverified.score.value);
    expect(verified.confidence.value).toBe(0.9);
  });

  it("calculates competency coverage and gaps deterministically", () => {
    const analyzer = new CompetencyCoverageAnalyzer();
    const coverage = analyzer.analyze({
      requiredCompetencyIds: ["competency-1", "competency-2"],
      demonstratedCompetencyIds: ["competency-1"]
    });
    const gaps = analyzer.identifyGaps({
      requiredCompetencyIds: ["competency-1", "competency-2"],
      demonstratedCompetencyIds: ["competency-1"]
    });

    expect(coverage).toMatchObject({ present: 1, required: 2, missing: 1, ratio: 0.5 });
    expect(gaps).toEqual([{ competencyId: "competency-2", reason: "Required competency has no demonstrated supporting reference." }]);
  });
});

function identity(id: string, name: string, competencyCount: number, storyCount: number, metricCount: number): ProfessionalIdentitySnapshot {
  return {
    id: new ProfessionalIdentityId(id),
    name,
    status: "active",
    competencyIds: Array.from({ length: competencyCount }, (_, index) => new CompetencyId(`competency-${id}-${index}`)),
    storyIds: Array.from({ length: storyCount }, (_, index) => new StoryId(`story-${id}-${index}`)),
    metricIds: Array.from({ length: metricCount }, (_, index) => new MetricId(`metric-${id}-${index}`))
  };
}

function story(id: string, evidenceCount: number, metricCount: number, competencyCount: number): StorySnapshot {
  return {
    id: new StoryId(id),
    title: id,
    status: "active",
    situation: "Situation",
    problem: "Problem",
    decision: "Decision",
    actions: ["Action"],
    outcome: "Outcome",
    evidenceReferenceIds: Array.from({ length: evidenceCount }, (_, index) => new EvidenceReferenceId(`evidence-${id}-${index}`)),
    metricIds: Array.from({ length: metricCount }, (_, index) => new MetricId(`metric-${id}-${index}`)),
    competencyIds: Array.from({ length: competencyCount }, (_, index) => new CompetencyId(`competency-${id}-${index}`))
  };
}

function evidenceReference(
  id: string,
  strength: EvidenceReferenceSnapshot["strength"],
  verificationStatus: EvidenceReferenceSnapshot["verificationStatus"]
): EvidenceReferenceSnapshot {
  return {
    id: new EvidenceReferenceId(id),
    evidenceType: "document",
    title: id,
    strength,
    verificationStatus,
    status: "active"
  };
}

function metric(
  id: string,
  value: number,
  verificationStatus: MetricSnapshot["verificationStatus"],
  confidence: MetricSnapshot["confidence"]
): MetricSnapshot {
  return {
    id: new MetricId(id),
    name: id,
    unit: "count",
    value,
    confidence,
    verificationStatus,
    status: "active"
  };
}

const competency: CompetencySnapshot = {
  id: new CompetencyId("unused"),
  name: "Unused",
  category: "other",
  status: "active",
  verificationStatus: "unverified",
  achievementIds: [],
  projectIds: [],
  evidenceReferenceIds: [],
  skillIds: [],
  technologyIds: []
};
void competency;
