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
import { AnswerStructureBuilder, FollowUpQuestionBuilder, InterviewArtifactBuilder } from "../builders";
import { InterviewGapAnalyzer, InterviewScoreCalculator } from "../calculators";
import { QuestionClassifier } from "../classifiers";
import type { InterviewAnalyzerContract } from "../contracts";
import { CompetencyMapper } from "../mappers";
import type {
  InterviewExplanation,
  InterviewInput,
  InterviewModel,
  InterviewRecommendation,
  InterviewSourceData
} from "../models";
import { InterviewEvidenceSelector, InterviewStorySelector } from "../selectors";
import { idToString, immutableArray, immutableRecord } from "../shared";

export class InterviewAnalyzer implements InterviewAnalyzerContract {
  private readonly classifier = new QuestionClassifier();
  private readonly competencyMapper = new CompetencyMapper();
  private readonly evidenceSelector = new InterviewEvidenceSelector();
  private readonly storySelector = new InterviewStorySelector();
  private readonly answerBuilder = new AnswerStructureBuilder();
  private readonly gapAnalyzer = new InterviewGapAnalyzer();
  private readonly followUpBuilder = new FollowUpQuestionBuilder();
  private readonly scoreCalculator = new InterviewScoreCalculator();
  private readonly explanationAssembler = new ExplanationAssembler();
  private readonly artifactBuilder = new InterviewArtifactBuilder();

  analyze(input: InterviewInput): InterviewModel {
    const question = this.classifier.normalize(input.questionText);
    const classification = this.classifier.classify(question.originalText);
    const mappedCompetencies = this.competencyMapper.map({
      classification,
      competencies: input.source.competencies,
      targetContext: input.targetContext,
      requiredCompetencyIds: input.requiredCompetencyIds
    });
    const selectedEvidence = this.evidenceSelector.select({
      evidence: input.source.evidence,
      mappedCompetencies,
      question,
      targetContext: input.targetContext
    });
    const decisionTraceReference = `${input.source.decisionTrace.pipeline}:${input.source.decisionTrace.executionTimestamp}`;
    const storySelection = this.storySelector.select({
      stories: input.source.stories,
      selectedEvidence,
      mappedCompetencies,
      classification,
      question,
      targetContext: input.targetContext,
      decisionTraceReference,
      maximumAlternatives: input.policies?.maximumAlternatives
    });
    const answerPlan = this.answerBuilder.build({ classification, storySelection, evidence: selectedEvidence });
    const gaps = this.gapAnalyzer.analyze({
      classification,
      mappedCompetencies,
      storySelection,
      answerPlan,
      selectedEvidence,
      targetContext: input.targetContext,
      metrics: input.source.metrics
    });
    const followUpQuestions = this.followUpBuilder.build({
      gaps,
      mappedCompetencyNames: mappedCompetencies.map((mapping) => mapping.competency.name),
      followUpCount: input.policies?.followUpCount
    });
    const readinessScore = this.scoreCalculator.calculate({
      classification,
      mappedCompetencies,
      storySelection,
      answerPlan,
      selectedEvidence,
      gaps,
      targetContext: input.targetContext
    });
    const explanation = createInterviewExplanation({
      selectedEvidence,
      mappedCompetencies,
      decisionTraceReference,
      explanationSummary: this.explanationAssembler.assemble({
        decision: createInterviewDecision(input.source, readinessScore.overallScore),
        alternatives: createStoryAlternatives(storySelection),
        constraints: createInterviewConstraints(input)
      }),
      confidence: readinessScore.confidence
    });
    const recommendations = immutableArray([
      createInterviewRecommendation(explanation)
    ]);
    const typedModel = immutableRecord({
      question,
      classification,
      mappedCompetencies,
      storySelection,
      answerPlan,
      followUpQuestions,
      recommendations,
      gaps,
      readinessScore,
      explanationSummary: explanation.explanationSummary
    });
    const { artifact, sections } = this.artifactBuilder.build({
      model: typedModel,
      explanation
    });

    return immutableRecord({
      artifact,
      sections,
      ...typedModel
    });
  }
}

function createInterviewExplanation(input: {
  readonly selectedEvidence: InterviewExplanation["selectedEvidence"];
  readonly mappedCompetencies: InterviewExplanation["mappedCompetencies"];
  readonly decisionTraceReference: string;
  readonly explanationSummary: InterviewExplanation["explanationSummary"];
  readonly confidence: Confidence;
}): InterviewExplanation {
  return immutableRecord({
    selectedEvidence: input.selectedEvidence,
    mappedCompetencies: input.mappedCompetencies,
    confidence: input.confidence,
    decisionTraceReference: input.decisionTraceReference,
    acceptedAlternative: input.explanationSummary.alternatives.acceptedAlternative,
    rejectedAlternatives: input.explanationSummary.alternatives.rejectedAlternatives,
    constraintSummary: input.explanationSummary.constraints,
    explanationSummary: input.explanationSummary
  });
}

function createInterviewRecommendation(explanation: InterviewExplanation): InterviewRecommendation {
  return immutableRecord({
    recommendationId: "interview-recommendation:primary",
    title: "Use selected validated story",
    reason: "The selected story provides the strongest deterministic fit for the classified question and mapped competencies.",
    selectedEvidence: explanation.selectedEvidence,
    mappedCompetencies: explanation.mappedCompetencies,
    confidence: explanation.confidence,
    decisionTraceReference: explanation.decisionTraceReference,
    acceptedAlternative: explanation.acceptedAlternative,
    rejectedAlternatives: explanation.rejectedAlternatives,
    constraintSummary: explanation.constraintSummary,
    explanationSummary: explanation.explanationSummary
  });
}

function createStoryAlternatives(storySelection: {
  readonly acceptedAlternative?: { readonly story: { readonly id: { readonly toString: () => string }; readonly title: string }; readonly totalScore: number; readonly rejectionReasons: readonly string[] };
  readonly rejectedAlternatives: readonly { readonly story: { readonly id: { readonly toString: () => string }; readonly title: string }; readonly totalScore: number; readonly rejectionReasons: readonly string[] }[];
}): readonly Alternative[] {
  return immutableArray([
    ...(storySelection.acceptedAlternative === undefined ? [] : [storyAlternative(storySelection.acceptedAlternative, "preferred")]),
    ...storySelection.rejectedAlternatives.map((alternative) => storyAlternative(alternative, "rejected"))
  ]);
}

function storyAlternative(
  alternative: { readonly story: { readonly id: { readonly toString: () => string }; readonly title: string }; readonly totalScore: number; readonly rejectionReasons: readonly string[] },
  status: Alternative["option"]["status"]
): Alternative {
  const reference = decisionReference(idToString(alternative.story.id), "story", status === "preferred" ? "authoritative" : "supporting", alternative.story.title);

  return createAlternative({
    id: `alternative:interview-story:${idToString(alternative.story.id)}`,
    option: {
      id: `alternative-option:interview-story:${idToString(alternative.story.id)}`,
      label: alternative.story.title,
      description: status === "preferred" ? "Selected story candidate." : "Rejected story candidate.",
      status,
      references: [reference]
    },
    score: createDecisionScore(alternative.totalScore),
    confidence: createDecisionConfidence(alternative.totalScore),
    reasons: alternative.rejectionReasons.map((reason) => ({
      code: status === "preferred" ? "story-selected" : "story-rejected",
      statement: reason,
      references: [reference]
    }))
  });
}

function createInterviewDecision(source: InterviewSourceData, scoreValue: number): Decision {
  const references = createDecisionReferences(source);
  const decisionScore = createDecisionScore(scoreValue);
  const decisionConfidence = createDecisionConfidence(scoreValue);
  const reasons = immutableArray([
    {
      code: "interview-story-selection",
      statement: "Interview guide is grounded in selected verified career stories and evidence.",
      weight: 0.4,
      references
    },
    {
      code: "interview-preparation-readiness",
      statement: "Interview guide readiness is derived from competency coverage, evidence, answer completeness, and gaps.",
      weight: 0.4,
      references
    }
  ]);

  return createDecision({
    id: "decision:interview-guide",
    title: "Interview guide recommendation",
    question: "Which validated story and answer structure best prepare this interview question?",
    outcome: scoreValue >= 70 ? "recommended" : "requires-review",
    status: "recommended",
    score: decisionScore,
    confidence: decisionConfidence,
    reasons,
    references,
    recommendations: [
      createRecommendation({
        id: "recommendation:interview-guide",
        recommendationType: "select",
        title: "Use deterministic interview guide",
        statement: "Construct the guide from selected story, evidence, mapped competencies, follow-ups, gaps, and score.",
        status: "recommended",
        score: decisionScore,
        confidence: decisionConfidence,
        reasons,
        references,
        explanation: createDecisionExplanation({
          summary: "Interview guide recommendation is derived from deterministic question, story, evidence, and gap analysis.",
          reasons,
          nodes: [],
          edges: [],
          paths: []
        }),
        metadata: decisionMetadata(source)
      })
    ],
    explanation: createDecisionExplanation({
      summary: "Interview guide recommendation is explainable through selected story, rejected alternatives, evidence, and preparation gaps.",
      reasons,
      nodes: [],
      edges: [],
      paths: []
    }),
    summary: {
      headline: "Deterministic interview guide",
      summary: "Validated career knowledge is transformed into an explainable InterviewGuide artifact.",
      outcome: scoreValue >= 70 ? "recommended" : "requires-review",
      reasons
    },
    metadata: decisionMetadata(source)
  });
}

function createInterviewConstraints(input: InterviewInput): readonly Constraint[] {
  return immutableArray([
    {
      id: "constraint:interview-validated-knowledge",
      constraintType: "other",
      label: "Validated career knowledge only",
      description: "Interview intelligence must not invent claims, metrics, outcomes, or responsibilities.",
      required: true,
      references: createDecisionReferences(input.source)
    }
  ]);
}

function createDecisionReferences(source: InterviewSourceData): readonly DecisionReference[] {
  return immutableArray([
    ...source.stories.map((story) => decisionReference(idToString(story.id), "story", "authoritative", story.title)),
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
    rationale: "Confidence is derived deterministically from the interview readiness score."
  });
}

function decisionMetadata(source: InterviewSourceData) {
  return Object.freeze({
    decisionId: "decision:interview-guide",
    modelVersion: 1,
    createdAt: source.decisionTrace.executionTimestamp,
    source: "interview-intelligence"
  });
}
