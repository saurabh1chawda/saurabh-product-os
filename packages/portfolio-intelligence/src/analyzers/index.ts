import { Confidence } from "@career-companion/career-intelligence";
import {
  createAlternative,
  createDecision,
  createDecisionExplanation,
  createRecommendation
} from "@career-companion/decision-model";
import type {
  Alternative,
  Constraint,
  Decision,
  DecisionConfidence,
  DecisionReference,
  DecisionScore
} from "@career-companion/decision-model";
import { ExplanationAssembler } from "@career-companion/explainability";
import { PortfolioArtifactBuilder, StoryAssembler } from "../builders";
import { PortfolioGapAnalyzer, PortfolioScoreCalculator } from "../calculators";
import type { PortfolioAnalyzerContract, PortfolioAnalyzerInput } from "../contracts";
import type { PortfolioExplanation, PortfolioModel, PortfolioRecommendation, PortfolioScore, PortfolioSourceData } from "../models";
import { CaseStudyPrioritizer, EvidenceSelector, ProjectSelector } from "../selectors";
import { idToString, immutableArray, immutableRecord } from "../shared";

export class PortfolioAnalyzer implements PortfolioAnalyzerContract {
  private readonly projectSelector = new ProjectSelector();
  private readonly caseStudyPrioritizer = new CaseStudyPrioritizer();
  private readonly evidenceSelector = new EvidenceSelector();
  private readonly storyAssembler = new StoryAssembler();
  private readonly gapAnalyzer = new PortfolioGapAnalyzer();
  private readonly scoreCalculator = new PortfolioScoreCalculator();
  private readonly artifactBuilder = new PortfolioArtifactBuilder();
  private readonly explanationAssembler = new ExplanationAssembler();

  analyze(input: PortfolioAnalyzerInput): PortfolioModel {
    const selectedProjects = this.projectSelector.select(input.source.projects);
    const selectedStories = this.caseStudyPrioritizer.prioritize(input.source.stories).map((ranking) => ranking.subject);
    const selectedEvidence = this.evidenceSelector.select(input.source.evidence);
    const preliminaryGaps = this.gapAnalyzer.analyze({ source: input.source, selectedEvidence });
    const score = this.scoreCalculator.calculate({
      source: input.source,
      selectedProjects,
      gaps: preliminaryGaps
    });
    const explanation = this.createExplanation(input.source, score);
    const caseStudies = this.storyAssembler.assemble({
      source: input.source,
      selectedStories,
      selectedEvidence,
      explanation
    });
    const recommendations = immutableArray([
      createPortfolioRecommendation(input.source, selectedEvidence, explanation)
    ]);
    const { artifact, sections } = this.artifactBuilder.build({
      source: input.source,
      caseStudies,
      gaps: preliminaryGaps,
      recommendations,
      score,
      explanation
    });

    return immutableRecord({
      artifact,
      caseStudies,
      projects: selectedProjects,
      recommendations,
      gaps: preliminaryGaps,
      score,
      explanationSummary: explanation.explanationSummary,
      sections
    });
  }

  private createExplanation(source: PortfolioSourceData, score: PortfolioScore): PortfolioExplanation {
    const alternatives = createPortfolioAlternatives();
    const constraints = createPortfolioConstraints(source);
    const explanationSummary = this.explanationAssembler.assemble({
      decision: createPortfolioDecision(source, score.value),
      alternatives,
      constraints
    });

    return immutableRecord({
      selectedEvidence: this.evidenceSelector.select(source.evidence),
      competencies: immutableArray(source.competencies),
      confidence: Confidence.from(score.value / 100),
      decisionTraceReference: `${source.decisionTrace.pipeline}:${source.decisionTrace.executionTimestamp}`,
      acceptedAlternative: explanationSummary.alternatives.acceptedAlternative,
      rejectedAlternatives: explanationSummary.alternatives.rejectedAlternatives,
      constraintSummary: explanationSummary.constraints,
      explanationSummary
    });
  }
}

function createPortfolioRecommendation(
  source: PortfolioSourceData,
  selectedEvidence: PortfolioExplanation["selectedEvidence"],
  explanation: PortfolioExplanation
): PortfolioRecommendation {
  return immutableRecord({
    recommendationId: "portfolio-recommendation:primary",
    title: "Assemble evidence-led portfolio",
    reason: "Selected projects, case studies, metrics, and evidence provide deterministic portfolio support.",
    selectedEvidence,
    competencies: immutableArray(source.competencies),
    confidence: explanation.confidence,
    decisionTraceReference: explanation.decisionTraceReference,
    acceptedAlternative: explanation.acceptedAlternative,
    rejectedAlternatives: explanation.rejectedAlternatives,
    constraintSummary: explanation.constraintSummary,
    explanationSummary: explanation.explanationSummary
  });
}

function createPortfolioDecision(source: PortfolioSourceData, scoreValue: number): Decision {
  const references = createDecisionReferences(source);
  const decisionScore = createDecisionScore(scoreValue);
  const decisionConfidence = createDecisionConfidence(scoreValue);
  const reasons = immutableArray([
    {
      code: "portfolio-project-selection",
      statement: "Portfolio model is based on selected validated projects and case studies.",
      weight: 0.4,
      references
    },
    {
      code: "portfolio-evidence-strength",
      statement: "Portfolio model prioritizes evidence strength, quantified outcomes, and competency coverage.",
      weight: 0.4,
      references
    }
  ]);

  return createDecision({
    id: "decision:portfolio",
    title: "Portfolio model recommendation",
    question: "Which validated career knowledge should shape the portfolio model?",
    outcome: scoreValue >= 70 ? "recommended" : "requires-review",
    status: "recommended",
    score: decisionScore,
    confidence: decisionConfidence,
    reasons,
    references,
    recommendations: [
      createRecommendation({
        id: "recommendation:portfolio",
        recommendationType: "select",
        title: "Use deterministic portfolio model",
        statement: "Construct the portfolio model from selected projects, stories, metrics, and evidence.",
        status: "recommended",
        score: decisionScore,
        confidence: decisionConfidence,
        reasons,
        references,
        explanation: createDecisionExplanation({
          summary: "Portfolio recommendation is derived from project quality, evidence, outcomes, and gaps.",
          reasons,
          nodes: [],
          edges: [],
          paths: []
        }),
        metadata: decisionMetadata(source)
      })
    ],
    explanation: createDecisionExplanation({
      summary: "Portfolio model recommendation is explainable through selected projects, stories, and evidence.",
      reasons,
      nodes: [],
      edges: [],
      paths: []
    }),
    summary: {
      headline: "Deterministic portfolio model",
      summary: "Validated career knowledge is transformed into an explainable portfolio artifact.",
      outcome: scoreValue >= 70 ? "recommended" : "requires-review",
      reasons
    },
    metadata: decisionMetadata(source)
  });
}

function createPortfolioAlternatives(): readonly Alternative[] {
  const reference = decisionReference("portfolio-model", "portfolio-model", "derived", "Deterministic PortfolioModel");

  return immutableArray([
    createAlternative({
      id: "alternative:portfolio-model",
      option: {
        id: "alternative-option:portfolio-model",
        label: "Evidence-led PortfolioModel",
        description: "Use validated career knowledge to construct an explainable portfolio model.",
        status: "preferred",
        references: [reference]
      },
      score: createDecisionScore(90),
      confidence: createDecisionConfidence(90),
      reasons: [{
        code: "preferred-deterministic-portfolio",
        statement: "This option preserves deterministic behavior and defers rendering.",
        references: [reference]
      }]
    }),
    createAlternative({
      id: "alternative:rendered-portfolio",
      option: {
        id: "alternative-option:rendered-portfolio",
        label: "Rendered portfolio output",
        description: "Generate portfolio presentation output directly.",
        status: "rejected",
        references: [reference]
      },
      score: createDecisionScore(20),
      confidence: createDecisionConfidence(80),
      reasons: [{
        code: "rendering-out-of-scope",
        statement: "Rendering is outside the portfolio intelligence package boundary.",
        references: [reference]
      }]
    })
  ]);
}

function createPortfolioConstraints(source: PortfolioSourceData): readonly Constraint[] {
  return immutableArray([
    {
      id: "constraint:portfolio-validated-knowledge",
      constraintType: "other",
      label: "Validated career knowledge only",
      description: "Portfolio intelligence must transform existing career knowledge without generating rendered output.",
      required: true,
      references: createDecisionReferences(source)
    }
  ]);
}

function createDecisionReferences(source: PortfolioSourceData): readonly DecisionReference[] {
  return immutableArray([
    ...source.projects.map((project) => decisionReference(idToString(project.id), "project", "authoritative", project.name)),
    ...source.stories.map((story) => decisionReference(idToString(story.id), "story", "supporting", story.title)),
    ...source.evidence.map((evidence) => decisionReference(idToString(evidence.id), "evidence", "supporting", evidence.title)),
    ...source.competencies.map((competency) => decisionReference(idToString(competency.id), "competency", "supporting", competency.name))
  ]);
}

function decisionReference(
  referenceId: string,
  referenceType: string,
  authority: DecisionReference["authority"],
  label: string
): DecisionReference {
  return Object.freeze({ referenceId, referenceType, authority, label });
}

function createDecisionScore(value: number): DecisionScore {
  return Object.freeze({
    value,
    scale: "zero-to-one-hundred",
    label: value >= 70 ? "strong" : "needs-review"
  });
}

function createDecisionConfidence(scoreValue: number): DecisionConfidence {
  return Object.freeze({
    value: scoreValue / 100,
    level: scoreValue >= 80 ? "high" : scoreValue >= 50 ? "medium" : "low",
    rationale: "Confidence is derived deterministically from the portfolio score."
  });
}

function decisionMetadata(source: PortfolioSourceData) {
  return Object.freeze({
    decisionId: "decision:portfolio",
    modelVersion: 1,
    createdAt: source.decisionTrace.executionTimestamp,
    source: "portfolio-intelligence"
  });
}
