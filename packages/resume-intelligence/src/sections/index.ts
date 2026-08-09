import { Confidence } from "@career-companion/career-intelligence";
import {
  createArtifactBlock,
  createArtifactSection
} from "@career-companion/career-artifacts";
import type { ArtifactBlock } from "@career-companion/career-artifacts";
import type {
  ResumeModel,
  ResumeRecommendation,
  ResumeSection,
  ResumeEvidence,
  ResumeExperience,
  ResumeGap,
  ResumeSkillSection,
  ResumeSummary
} from "../models";
import { immutableArray, immutableRecord } from "../models";

export class SectionBuilder {
  build(input: {
    readonly summary: ResumeSummary;
    readonly experience: readonly ResumeExperience[];
    readonly skills: ResumeSkillSection;
    readonly evidence: readonly ResumeEvidence[];
    readonly gaps: readonly ResumeGap[];
    readonly recommendations: readonly ResumeRecommendation[];
  }): readonly ResumeSection[] {
    return immutableArray([
      createSection("resume-section:summary", "summary", "Summary", 1, input.summary, []),
      createSection("resume-section:experience", "experience", "Experience", 2, input.experience, []),
      createSection("resume-section:skills", "skills", "Skills", 3, input.skills, []),
      createSection("resume-section:evidence", "evidence", "Evidence", 4, input.evidence, input.evidence),
      createSection("resume-section:gaps", "gaps", "Gaps", 5, input.gaps, []),
      createSection("resume-section:recommendations", "recommendations", "Recommendations", 6, input.recommendations, [])
    ]);
  }

  fromModel(model: ResumeModel): readonly ResumeSection[] {
    return this.build({
      summary: model.summary,
      experience: model.experience,
      skills: model.skills,
      evidence: model.evidence,
      gaps: model.gaps,
      recommendations: model.recommendations
    });
  }
}

function createSection<TContent>(
  sectionId: string,
  sectionType: ResumeSection["sectionType"],
  title: string,
  order: number,
  content: TContent,
  evidence: readonly ResumeEvidence[]
): ResumeSection<TContent> {
  return createArtifactSection(immutableRecord({
    sectionId,
    sectionType,
    title,
    order,
    ordering: {
      order
    },
    blocks: [
      createSectionBlock(sectionId, sectionType, title, order, content, evidence)
    ],
    content
  })) as ResumeSection<TContent>;
}

function createSectionBlock<TContent>(
  sectionId: string,
  sectionType: ResumeSection["sectionType"],
  title: string,
  order: number,
  content: TContent,
  evidence: readonly ResumeEvidence[]
): ArtifactBlock<TContent> {
  return createArtifactBlock({
    blockId: `${sectionId}:block:primary`,
    blockType: sectionType,
    title,
    content,
    ordering: {
      order
    },
    fragments: [],
    evidence: evidence.map((selectedEvidence) => {
      return {
        evidence: selectedEvidence.evidence,
        reference: {
          referenceId: selectedEvidence.evidence.id.toString(),
          referenceType: "evidence",
          label: selectedEvidence.evidence.title
        },
        confidence: selectedEvidence.confidence,
        score: selectedEvidence.score
      };
    }),
    confidence: evidence[0]?.confidence ?? Confidence.none(),
    decisionTraceReference: "",
    rejectedAlternatives: [],
    annotations: []
  });
}
