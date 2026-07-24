import { Confidence } from "@career-companion/career-intelligence";
import type { PortfolioGap, PortfolioProject, PortfolioScore, PortfolioSourceData } from "../models";
import { clamp } from "../shared";

export class ImpactCalculator {
  calculateBusinessImpact(source: PortfolioSourceData): number {
    const metricScore = Math.min(source.metrics.filter((metric) => Math.abs(metric.value) > 0).length * 20, 60);
    const outcomeScore = Math.min(source.stories.filter((story) => story.outcome.trim().length > 0).length * 10, 40);

    return metricScore + outcomeScore;
  }

  calculateTechnicalDepth(source: PortfolioSourceData): number {
    const technicalCompetencies = source.competencies.filter((competency) => {
      return competency.category === "platform-thinking" || competency.category === "ai-product-management";
    }).length;
    const technologyReferences = source.projects.reduce((count, project) => count + project.technologyIds.length, 0);

    return Math.min((technicalCompetencies * 25) + (technologyReferences * 10), 100);
  }
}

export class PortfolioGapAnalyzer {
  analyze(input: {
    readonly source: PortfolioSourceData;
    readonly selectedEvidence: readonly import("../models").PortfolioEvidence[];
  }): readonly PortfolioGap[] {
    const gaps: PortfolioGap[] = [];
    const { source } = input;

    if (source.competencies.filter((competency) => competency.category === "leadership").length === 0) {
      gaps.push(createGap("leadership-evidence", "Insufficient leadership evidence.", "Add a case study showing leadership scope and decision ownership.", "high", input.selectedEvidence));
    }

    if (source.metrics.filter((metric) => Math.abs(metric.value) > 0 && metric.verificationStatus === "verified").length === 0) {
      gaps.push(createGap("quantified-outcomes", "Weak quantified outcomes.", "Attach verified metrics to priority projects.", "high", input.selectedEvidence));
    }

    if (new Set(source.competencies.map((competency) => competency.category)).size < 2) {
      gaps.push(createGap("domain-diversity", "Limited domain diversity.", "Include projects that demonstrate breadth across product domains.", "medium", input.selectedEvidence));
    }

    if (new ImpactCalculator().calculateTechnicalDepth(source) < 40) {
      gaps.push(createGap("technical-depth", "Missing technical depth.", "Add evidence for platform, data, AI, or technical product work.", "medium", input.selectedEvidence));
    }

    if (source.projects.filter((project) => project.verificationStatus === "verified").length === 0) {
      gaps.push(createGap("business-impact", "Weak business impact validation.", "Verify at least one project with strong business outcome evidence.", "medium", input.selectedEvidence));
    }

    return Object.freeze(gaps);
  }
}

export class PortfolioScoreCalculator {
  private readonly impactCalculator = new ImpactCalculator();

  calculate(input: {
    readonly source: PortfolioSourceData;
    readonly selectedProjects: readonly PortfolioProject[];
    readonly gaps: readonly PortfolioGap[];
  }): PortfolioScore {
    const projectQuality = average(input.selectedProjects.map((project) => project.score.value));
    const businessImpact = this.impactCalculator.calculateBusinessImpact(input.source);
    const technicalDepth = this.impactCalculator.calculateTechnicalDepth(input.source);
    const leadershipEvidence = input.source.competencies.some((competency) => competency.category === "leadership") ? 90 : 30;
    const domainDiversity = Math.min(new Set(input.source.competencies.map((competency) => competency.category)).size * 25, 100);
    const recency = input.source.projects.some((project) => project.dateRange?.isCurrent === true) ? 90 : 60;
    const evidenceStrength = average(input.source.evidence.map((evidence) => {
      const strength = evidence.strength === "primary" ? 45 : evidence.strength === "supporting" ? 30 : 15;
      const verification = evidence.verificationStatus === "verified" ? 45 : evidence.verificationStatus === "candidate" ? 25 : 10;
      return strength + verification;
    }));
    const coverage = input.source.requiredCompetencyIds.length === 0
      ? 100
      : clamp((input.source.competencies.length / input.source.requiredCompetencyIds.length) * 100, 0, 100);
    const consistency = input.gaps.length === 0 ? 100 : clamp(100 - (input.gaps.length * 12), 0, 100);
    const value = Math.round(
      (projectQuality * 0.18)
      + (businessImpact * 0.16)
      + (technicalDepth * 0.12)
      + (leadershipEvidence * 0.1)
      + (domainDiversity * 0.1)
      + (recency * 0.08)
      + (evidenceStrength * 0.14)
      + (coverage * 0.07)
      + (consistency * 0.05)
    );

    return Object.freeze({
      value: clamp(value, 0, 100),
      projectQuality: Math.round(projectQuality),
      businessImpact,
      technicalDepth,
      leadershipEvidence,
      domainDiversity,
      recency,
      evidenceStrength: Math.round(evidenceStrength),
      coverage: Math.round(coverage),
      consistency
    });
  }
}

function createGap(
  gapId: string,
  description: string,
  recommendedImprovement: string,
  severity: PortfolioGap["severity"],
  selectedEvidence: readonly import("../models").PortfolioEvidence[]
): PortfolioGap {
  return Object.freeze({
    gapId: `portfolio-gap:${gapId}`,
    description,
    severity,
    supportingEvidence: Object.freeze([...selectedEvidence.slice(0, 2)]),
    recommendedImprovement,
    confidence: Confidence.from(severity === "high" ? 0.85 : 0.7)
  });
}

function average(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
