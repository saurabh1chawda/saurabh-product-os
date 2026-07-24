import { MetricStrengthCalculator } from "@career-companion/career-intelligence";
import type { AchievementSnapshot, MetricSnapshot } from "@career-companion/career-knowledge";
import { AchievementPrioritizer } from "../achievement";
import type {
  ResumeEvidence,
  ResumeExperience,
  ResumeSkillSection,
  ResumeSourceData,
  ResumeSummary,
  RankedAchievement
} from "../models";
import { immutableArray, immutableRecord } from "../models";

export class SummaryBuilder {
  build(input: {
    readonly source: ResumeSourceData;
    readonly selectedEvidence: readonly ResumeEvidence[];
  }): ResumeSummary {
    return immutableRecord({
      headline: input.source.careerProfile.headline ?? input.source.careerProfile.displayName,
      summary: input.source.careerProfile.summary ?? "",
      competencies: immutableArray(input.source.competencies.slice(0, 5)),
      evidence: immutableArray(input.selectedEvidence.slice(0, 3))
    });
  }
}

export class ExperienceBuilder {
  build(input: {
    readonly source: ResumeSourceData;
    readonly selectedEvidence: readonly ResumeEvidence[];
  }): readonly ResumeExperience[] {
    return immutableArray(input.source.employmentRecords.map((employment) => immutableRecord({
      employment,
      achievements: immutableArray(input.source.achievements.filter((achievement) => {
        return achievement.employmentRecordId?.equals(employment.id) === true;
      })),
      metrics: immutableArray(input.source.metrics),
      evidence: immutableArray(input.selectedEvidence.filter((selectedEvidence) => {
        return employment.evidenceReferenceIds.some((id) => id.equals(selectedEvidence.evidence.id));
      }))
    })));
  }
}

export class SkillsBuilder {
  build(source: ResumeSourceData): ResumeSkillSection {
    return immutableRecord({
      skills: immutableArray(source.skills),
      technologies: immutableArray(source.technologies),
      competencies: immutableArray(source.competencies)
    });
  }
}

export class ImpactPrioritizer {
  private readonly achievementPrioritizer = new AchievementPrioritizer();
  private readonly metricCalculator = new MetricStrengthCalculator();

  prioritizeAchievements(achievements: readonly AchievementSnapshot[]): readonly RankedAchievement[] {
    return this.achievementPrioritizer.prioritize(achievements);
  }

  prioritizeMetrics(metrics: readonly MetricSnapshot[]): readonly MetricSnapshot[] {
    return immutableArray(
      [...metrics].sort((left, right) => {
        const scoreDifference = this.metricCalculator.calculate(right).score.value - this.metricCalculator.calculate(left).score.value;
        if (scoreDifference !== 0) {
          return scoreDifference;
        }

        return left.name.localeCompare(right.name);
      })
    );
  }
}
