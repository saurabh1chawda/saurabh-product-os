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
      createSection("resume-section:summary", "summary", "Summary", 1, input.summary),
      createSection("resume-section:experience", "experience", "Experience", 2, input.experience),
      createSection("resume-section:skills", "skills", "Skills", 3, input.skills),
      createSection("resume-section:evidence", "evidence", "Evidence", 4, input.evidence),
      createSection("resume-section:gaps", "gaps", "Gaps", 5, input.gaps),
      createSection("resume-section:recommendations", "recommendations", "Recommendations", 6, input.recommendations)
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
  content: TContent
): ResumeSection<TContent> {
  return immutableRecord({
    sectionId,
    sectionType,
    title,
    order,
    content
  });
}
