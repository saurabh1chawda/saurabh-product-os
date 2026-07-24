import { Confidence } from "@career-companion/career-intelligence";
import {
  createArtifactBlock,
  createArtifactEvidence,
  createArtifactExplanation,
  createArtifactReference,
  createArtifactScore,
  createArtifactSection,
  createArtifactSummary,
  createCareerArtifact
} from "@career-companion/career-artifacts";
import type { CareerArtifact } from "@career-companion/career-artifacts";
import type { StorySnapshot } from "@career-companion/career-knowledge";
import type {
  PortfolioCaseStudy,
  PortfolioEvidence,
  PortfolioExplanation,
  PortfolioGap,
  PortfolioRecommendation,
  PortfolioScore,
  PortfolioSection,
  PortfolioSourceData
} from "../models";
import { idToString, immutableArray, immutableRecord } from "../shared";

export class StoryAssembler {
  assemble(input: {
    readonly source: PortfolioSourceData;
    readonly selectedStories: readonly StorySnapshot[];
    readonly selectedEvidence: readonly PortfolioEvidence[];
    readonly explanation: PortfolioExplanation;
  }): readonly PortfolioCaseStudy[] {
    const caseStudies = input.selectedStories.map((story, index) => {
      const project = input.source.projects.find((candidate) => {
        return story.competencyIds.some((competencyId) => candidate.competencyIds.some((id) => id.equals(competencyId)));
      }) ?? input.source.projects[index] ?? input.source.projects[0];
      const metrics = input.source.metrics.filter((metric) => story.metricIds.some((metricId) => metricId.equals(metric.id)));
      const competencies = input.source.competencies.filter((competency) => {
        return story.competencyIds.some((competencyId) => competencyId.equals(competency.id));
      });
      const evidence = input.selectedEvidence.filter((selectedEvidence) => {
        return story.evidenceReferenceIds.some((evidenceId) => evidenceId.equals(selectedEvidence.evidence.id));
      });

      return immutableRecord({
        caseStudyId: `portfolio-case-study:${idToString(story.id)}`,
        project,
        problem: story.problem,
        actions: immutableArray(story.actions),
        outcomes: immutableArray([story.outcome]),
        metrics: immutableArray(metrics),
        evidence: immutableArray(evidence),
        competencies: immutableArray(competencies),
        explanation: input.explanation,
        confidence: evidence[0]?.confidence ?? Confidence.none(),
        decisionTraceReference: input.explanation.decisionTraceReference,
        acceptedAlternative: input.explanation.acceptedAlternative,
        rejectedAlternatives: input.explanation.rejectedAlternatives,
        explanationSummary: input.explanation.explanationSummary
      } satisfies PortfolioCaseStudy);
    });

    return immutableArray(caseStudies);
  }
}

export class OutcomeBuilder {
  build(caseStudies: readonly PortfolioCaseStudy[]): readonly string[] {
    return immutableArray(caseStudies.flatMap((caseStudy) => caseStudy.outcomes));
  }
}

export class PortfolioArtifactBuilder {
  build(input: {
    readonly source: PortfolioSourceData;
    readonly caseStudies: readonly PortfolioCaseStudy[];
    readonly gaps: readonly PortfolioGap[];
    readonly recommendations: readonly PortfolioRecommendation[];
    readonly score: PortfolioScore;
    readonly explanation: PortfolioExplanation;
  }): {
    readonly artifact: CareerArtifact;
    readonly sections: readonly PortfolioSection[];
  } {
    const sections = this.buildSections(input);
    const score = createArtifactScore({
      value: input.score.value,
      scale: "zero-to-one-hundred",
      label: input.score.value >= 70 ? "strong" : "needs-review"
    });
    const artifact = createCareerArtifact({
      artifactId: "artifact:portfolio",
      artifactType: "Portfolio",
      metadata: {
        artifactId: "artifact:portfolio",
        artifactType: "Portfolio",
        title: "Portfolio",
        createdAt: input.source.decisionTrace.executionTimestamp,
        source: "portfolio-intelligence",
        version: 1,
        references: input.source.projects.map((project) => {
          return createArtifactReference({
            referenceId: idToString(project.id),
            referenceType: "project",
            label: project.name
          });
        })
      },
      summary: createArtifactSummary({
        headline: "Deterministic portfolio model",
        summary: `${input.caseStudies.length} case studies selected for portfolio evidence.`,
        score,
        references: []
      }),
      sections,
      score,
      explanation: createArtifactExplanation({
        explanationSummary: input.explanation.explanationSummary,
        confidence: input.explanation.confidence,
        decisionTraceReference: input.explanation.decisionTraceReference,
        acceptedAlternative: input.explanation.acceptedAlternative,
        rejectedAlternatives: input.explanation.rejectedAlternatives
      })
    });

    return immutableRecord({ artifact, sections });
  }

  private buildSections(input: {
    readonly caseStudies: readonly PortfolioCaseStudy[];
    readonly gaps: readonly PortfolioGap[];
    readonly recommendations: readonly PortfolioRecommendation[];
    readonly explanation: PortfolioExplanation;
  }): readonly PortfolioSection[] {
    return immutableArray([
      createPortfolioSection("portfolio-section:overview", "overview", "Overview", 1, input.explanation, input.explanation.selectedEvidence, input.explanation),
      createPortfolioSection("portfolio-section:case-studies", "case-studies", "Case Studies", 2, input.caseStudies, input.explanation.selectedEvidence, input.explanation),
      createPortfolioSection("portfolio-section:evidence", "evidence", "Evidence", 3, input.explanation.selectedEvidence, input.explanation.selectedEvidence, input.explanation),
      createPortfolioSection("portfolio-section:gaps", "gaps", "Gaps", 4, input.gaps, input.explanation.selectedEvidence, input.explanation),
      createPortfolioSection("portfolio-section:recommendations", "recommendations", "Recommendations", 5, input.recommendations, input.explanation.selectedEvidence, input.explanation)
    ]);
  }
}

function createPortfolioSection<TContent>(
  sectionId: string,
  sectionType: PortfolioSection["sectionType"],
  title: string,
  order: number,
  content: TContent,
  evidence: readonly PortfolioEvidence[],
  explanation: PortfolioExplanation
): PortfolioSection<TContent> {
  return createArtifactSection({
    sectionId,
    sectionType,
    title,
    order,
    ordering: { order },
    blocks: [
      createArtifactBlock({
        blockId: `${sectionId}:block:primary`,
        blockType: sectionType,
        title,
        content,
        ordering: { order },
        fragments: [],
        evidence: evidence.map((selectedEvidence) => {
          return createArtifactEvidence({
            evidence: selectedEvidence.evidence,
            reference: createArtifactReference({
              referenceId: idToString(selectedEvidence.evidence.id),
              referenceType: "evidence",
              label: selectedEvidence.evidence.title
            }),
            confidence: selectedEvidence.confidence,
            score: selectedEvidence.score
          });
        }),
        explanation: createArtifactExplanation({
          explanationSummary: explanation.explanationSummary,
          confidence: explanation.confidence,
          decisionTraceReference: explanation.decisionTraceReference,
          acceptedAlternative: explanation.acceptedAlternative,
          rejectedAlternatives: explanation.rejectedAlternatives
        }),
        confidence: explanation.confidence,
        decisionTraceReference: explanation.decisionTraceReference,
        acceptedAlternative: explanation.acceptedAlternative,
        rejectedAlternatives: explanation.rejectedAlternatives,
        annotations: []
      })
    ],
    content
  }) as PortfolioSection<TContent>;
}
