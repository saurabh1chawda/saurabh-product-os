import { describe, expect, it } from "vitest";
import {
  IdentitySelectionPipeline,
  ResumeRecommendationPipeline,
  createDecisionContext
} from "../src";
import {
  CompetencyId,
  EvidenceReferenceId,
  MetricId,
  ProfessionalIdentityId,
  StoryId
} from "@career-companion/career-knowledge";
import type { DecisionContext } from "../src";

describe("decision engine pipelines", () => {
  it("executes pipeline steps in order and records a decision trace", () => {
    const context = createContext();
    const result = ResumeRecommendationPipeline.execute(context);

    expect(result.summary.status).toBe("completed");
    expect(result.trace.pipeline).toBe("ResumeRecommendationPipeline");
    expect(result.trace.stepsExecuted.map((step) => step.stepName)).toEqual([
      "EvidenceSelectionStep",
      "CompetencyAnalysisStep",
      "ResumeRecommendationStep"
    ]);
    expect(result.trace.reasons.length).toBeGreaterThan(0);
    expect(result.trace.executionTimestamp).toBe("2026-07-23T00:00:00.000Z");
  });

  it("returns immutable execution context and decision results", () => {
    const context = createContext();
    const result = IdentitySelectionPipeline.execute(context);

    expect(Object.isFrozen(context)).toBe(true);
    expect(Object.isFrozen(context.candidate.identities)).toBe(true);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.summary)).toBe(true);
  });

  it("does not mutate domain snapshot inputs", () => {
    const context = createContext();
    const identitiesBefore = [...context.candidate.identities];

    IdentitySelectionPipeline.execute(context);

    expect(context.candidate.identities).toEqual(identitiesBefore);
  });
});

function createContext(): DecisionContext {
  return createDecisionContext({
    candidate: {
      identities: [
        {
          id: new ProfessionalIdentityId("identity-1"),
          name: "AI Product Leader",
          status: "active",
          competencyIds: [new CompetencyId("competency-1")],
          storyIds: [new StoryId("story-1")],
          metricIds: [new MetricId("metric-1")]
        }
      ],
      competencies: [
        {
          id: new CompetencyId("competency-1"),
          name: "AI Product Management",
          category: "ai-product-management",
          status: "active",
          verificationStatus: "verified",
          achievementIds: [],
          projectIds: [],
          evidenceReferenceIds: [new EvidenceReferenceId("evidence-1")],
          skillIds: [],
          technologyIds: []
        }
      ],
      capabilityEvidence: [],
      evidenceReferences: [
        {
          id: new EvidenceReferenceId("evidence-1"),
          evidenceType: "document",
          title: "Case study",
          strength: "primary",
          verificationStatus: "verified",
          status: "active"
        }
      ],
      stories: [],
      metrics: [],
      portfolioAssets: []
    },
    target: {
      requiredCompetencyIds: ["competency-1"],
      preferredCompetencyIds: [],
      preferredEvidenceIds: []
    },
    criteria: {
      limit: 3
    },
    metadata: {
      pipelineName: "TestPipeline",
      executionTimestamp: "2026-07-23T00:00:00.000Z",
      correlationId: "correlation-1"
    }
  });
}
