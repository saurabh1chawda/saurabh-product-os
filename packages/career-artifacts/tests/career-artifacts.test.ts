import { describe, expect, it } from "vitest";
import { Confidence, RecommendationScore } from "@career-companion/career-intelligence";
import { EvidenceReferenceId } from "@career-companion/career-knowledge";
import type { EvidenceReferenceSnapshot } from "@career-companion/career-knowledge";
import type { Alternative } from "@career-companion/decision-model";
import type { ExplanationSummary } from "@career-companion/explainability";
import {
  createArtifactBlock,
  createArtifactEvidence,
  createArtifactExplanation,
  createArtifactFragment,
  createArtifactMetadata,
  createArtifactReference,
  createArtifactScore,
  createArtifactSection,
  createArtifactSummary,
  createCareerArtifact
} from "../src";
import packageJson from "../package.json";

describe("career artifacts", () => {
  it("composes immutable career artifacts from ordered sections and blocks", () => {
    const artifact = createCareerArtifact({
      artifactId: "artifact-1",
      artifactType: "Resume",
      metadata: createArtifactMetadata({
        artifactId: "artifact-1",
        artifactType: "Resume",
        title: "Resume artifact",
        createdAt: "2026-01-01T00:00:00.000Z",
        source: "career-artifacts-test",
        version: 1,
        references: [createArtifactReference({ referenceId: "profile-1", referenceType: "career-profile" })]
      }),
      summary: createArtifactSummary({
        headline: "AI Product Leader",
        summary: "Structured artifact summary.",
        score: createArtifactScore({ value: 92, scale: "zero-to-one-hundred", label: "strong" }),
        references: []
      }),
      sections: [
        createArtifactSection({
          sectionId: "section-2",
          sectionType: "experience",
          title: "Experience",
          order: 2,
          ordering: { order: 2 },
          blocks: [createBlock("block-2", 2)],
          content: { label: "experience" }
        }),
        createArtifactSection({
          sectionId: "section-1",
          sectionType: "summary",
          title: "Summary",
          order: 1,
          ordering: { order: 1 },
          blocks: [createBlock("block-1", 1)],
          content: { label: "summary" }
        })
      ],
      score: createArtifactScore({ value: 92, scale: "zero-to-one-hundred", label: "strong" }),
      explanation: createArtifactExplanation({
        explanationSummary: createExplanationSummary(),
        confidence: Confidence.from(0.92),
        decisionTraceReference: "pipeline:timestamp",
        acceptedAlternative: createAlternative("accepted", "preferred"),
        rejectedAlternatives: [createAlternative("rejected", "rejected")]
      })
    });

    expect(artifact.artifactType).toBe("Resume");
    expect(artifact.sections.map((section) => section.order)).toEqual([2, 1]);
    expect(artifact.sections[0]?.blocks[0]?.fragments[0]?.content).toEqual({ text: "fragment" });
    expect(artifact.explanation?.acceptedAlternative?.option.status).toBe("preferred");
    expect(artifact.explanation?.rejectedAlternatives[0]?.option.status).toBe("rejected");
    expect(Object.isFrozen(artifact)).toBe(true);
    expect(Object.isFrozen(artifact.sections)).toBe(true);
    expect(Object.isFrozen(artifact.sections[0]?.blocks)).toBe(true);
  });

  it("keeps artifact block explanation and evidence support immutable", () => {
    const block = createBlock("block-evidence", 1);

    expect(block.evidence[0]?.reference.referenceId).toBe("evidence-1");
    expect(block.explanation?.decisionTraceReference).toBe("pipeline:timestamp");
    expect(block.acceptedAlternative?.option.label).toBe("Accepted option");
    expect(block.rejectedAlternatives[0]?.option.label).toBe("Rejected option");
    expect(block.confidence.value).toBe(0.9);
    expect(Object.isFrozen(block.evidence)).toBe(true);
    expect(Object.isFrozen(block.rejectedAlternatives)).toBe(true);
  });

  it("keeps package dependencies within the approved artifact boundary", () => {
    const dependencies = Object.keys(packageJson.dependencies).sort();

    expect(dependencies).toEqual([
      "@career-companion/career-intelligence",
      "@career-companion/career-knowledge",
      "@career-companion/decision-model",
      "@career-companion/explainability",
      "@career-companion/kernel"
    ].sort());
    expect(dependencies).not.toContain("@career-companion/application");
    expect(dependencies).not.toContain("@career-companion/resume-intelligence");
  });
});

function createBlock(blockId: string, order: number) {
  const evidence = createEvidence();
  const acceptedAlternative = createAlternative("accepted", "preferred");
  const rejectedAlternative = createAlternative("rejected", "rejected");

  return createArtifactBlock({
    blockId,
    blockType: "summary",
    title: "Summary block",
    content: { text: "content" },
    ordering: { order },
    fragments: [
      createArtifactFragment({
        fragmentId: `${blockId}:fragment`,
        fragmentType: "text",
        content: { text: "fragment" },
        ordering: { order: 1 },
        references: [createArtifactReference({ referenceId: "profile-1", referenceType: "career-profile" })],
        annotations: []
      })
    ],
    evidence: [
      createArtifactEvidence({
        evidence,
        reference: createArtifactReference({
          referenceId: evidence.id.toString(),
          referenceType: "evidence",
          label: evidence.title
        }),
        confidence: Confidence.from(0.9),
        score: RecommendationScore.from(90)
      })
    ],
    explanation: createArtifactExplanation({
      explanationSummary: createExplanationSummary(),
      confidence: Confidence.from(0.9),
      decisionTraceReference: "pipeline:timestamp",
      acceptedAlternative,
      rejectedAlternatives: [rejectedAlternative]
    }),
    confidence: Confidence.from(0.9),
    decisionTraceReference: "pipeline:timestamp",
    acceptedAlternative,
    rejectedAlternatives: [rejectedAlternative],
    annotations: [],
    score: createArtifactScore({ value: 90, scale: "zero-to-one-hundred" })
  });
}

function createEvidence(): EvidenceReferenceSnapshot {
  return {
    id: new EvidenceReferenceId("evidence-1"),
    evidenceType: "document",
    title: "Verified evidence",
    strength: "primary",
    verificationStatus: "verified",
    status: "active"
  };
}

function createAlternative(id: string, status: Alternative["option"]["status"]): Alternative {
  return {
    id: `alternative:${id}`,
    option: {
      id: `alternative-option:${id}`,
      label: status === "preferred" ? "Accepted option" : "Rejected option",
      description: "Deterministic alternative.",
      status,
      references: []
    },
    reasons: []
  };
}

function createExplanationSummary(): ExplanationSummary {
  return {
    decisionId: "decision-1",
    graph: {
      graphId: "graph-1",
      nodes: [],
      edges: [],
      createdAt: "2026-01-01T00:00:00.000Z"
    },
    evidenceTrace: {
      traceId: "trace-1",
      decisionId: "decision-1",
      evidenceNodes: [],
      edges: [],
      references: []
    },
    confidence: {
      aggregateConfidence: {
        value: 0.9,
        level: "high"
      },
      components: []
    },
    constraints: {
      constraints: [],
      satisfied: [],
      violated: [],
      blockingCount: 0
    },
    alternatives: {
      acceptedAlternative: createAlternative("accepted", "preferred"),
      rejectedAlternatives: [createAlternative("rejected", "rejected")],
      orderedAlternatives: [],
      rejectionReasons: ["Out of scope."]
    },
    narrative: {
      narrativeId: "narrative-1",
      decisionId: "decision-1",
      title: "Deterministic narrative",
      outcome: "recommended",
      reasonCodes: [],
      acceptedAlternative: "accepted",
      rejectedAlternatives: ["rejected"],
      evidenceReferenceIds: [],
      constraintLabels: []
    }
  };
}
