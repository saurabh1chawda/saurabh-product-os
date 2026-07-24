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
import type {
  InterviewAnswerFramework,
  InterviewAnswerPlan,
  InterviewAnswerSection,
  InterviewArtifactSection,
  InterviewEvidenceSelection,
  InterviewExplanation,
  InterviewFollowUpQuestion,
  InterviewGap,
  InterviewModel,
  InterviewQuestionClassification,
  InterviewStorySelection
} from "../models";
import { idToString, immutableArray, immutableRecord } from "../shared";

export class AnswerStructureBuilder {
  build(input: {
    readonly classification: InterviewQuestionClassification;
    readonly storySelection: InterviewStorySelection;
    readonly evidence: readonly InterviewEvidenceSelection[];
  }): InterviewAnswerPlan {
    const framework = frameworkFor(input.classification.primaryCategory);
    const story = input.storySelection.selectedStory?.story;
    const evidence = input.evidence.filter((selection) => story?.evidenceReferenceIds.some((id) => id.equals(selection.evidence.id)) === true);

    return immutableRecord({
      framework,
      sections: immutableArray([
        answerSection("opening-thesis", "Opening Thesis", story === undefined ? [] : [`Use ${story.title} as the grounded source story.`], [], story !== undefined),
        answerSection("context", "Context or Situation", story === undefined ? [] : [story.situation], evidence, story?.situation.trim().length !== 0),
        answerSection("problem", "Problem or Task", story === undefined ? [] : [story.problem], evidence, story?.problem.trim().length !== 0),
        answerSection("ownership", "Candidate Ownership", story === undefined ? [] : [story.decision], evidence, story?.decision.trim().length !== 0),
        answerSection("actions", "Actions", story?.actions ?? [], evidence, (story?.actions.length ?? 0) > 0),
        answerSection("tradeoffs", "Decisions and Trade-offs", story?.tradeoffs ?? [], evidence, (story?.tradeoffs?.length ?? 0) > 0),
        answerSection("outcomes", "Outcomes", story === undefined ? [] : [story.outcome], evidence, story?.outcome.trim().length !== 0),
        answerSection("learning", "Learning", story?.lessons ?? [], evidence, (story?.lessons?.length ?? 0) > 0)
      ])
    });
  }
}

export class FollowUpQuestionBuilder {
  build(input: {
    readonly gaps: readonly InterviewGap[];
    readonly mappedCompetencyNames: readonly string[];
    readonly followUpCount?: number;
  }): readonly InterviewFollowUpQuestion[] {
    const base = input.gaps.map((gap, index) => immutableRecord({
      followUpId: `interview-follow-up:${gap.gapType}`,
      questionText: followUpText(gap.gapType),
      purpose: "Pressure-test preparation evidence and answer completeness.",
      competencyBeingTested: input.mappedCompetencyNames[index % Math.max(input.mappedCompetencyNames.length, 1)] ?? "communication",
      supportingTrigger: gap.description,
      priority: index + 1,
      confidence: gap.confidence,
      evidenceReadinessStatus: gap.supportingEvidence.length > 0 ? "partial" : "missing"
    } satisfies InterviewFollowUpQuestion));

    return immutableArray(base.slice(0, input.followUpCount ?? 5));
  }
}

export class InterviewArtifactBuilder {
  build(input: {
    readonly model: Omit<InterviewModel, "artifact" | "sections">;
    readonly explanation: InterviewExplanation;
  }): {
    readonly artifact: CareerArtifact;
    readonly sections: readonly InterviewArtifactSection[];
  } {
    const sections = immutableArray([
      section("interview-section:context", "context", "Interview Context", 1, input.model.question, input.explanation),
      section("interview-section:question-analysis", "question-analysis", "Question Analysis", 2, input.model.classification, input.explanation),
      section("interview-section:competencies", "competencies", "Evaluated Competencies", 3, input.model.mappedCompetencies, input.explanation),
      section("interview-section:recommended-story", "recommended-story", "Recommended Story", 4, input.model.storySelection, input.explanation),
      section("interview-section:answer-plan", "answer-plan", "Structured Answer Plan", 5, input.model.answerPlan, input.explanation),
      section("interview-section:evidence", "evidence", "Evidence and Metrics", 6, input.explanation.selectedEvidence, input.explanation),
      section("interview-section:follow-ups", "follow-ups", "Likely Follow-Up Questions", 7, input.model.followUpQuestions, input.explanation),
      section("interview-section:gaps", "gaps", "Preparation Gaps", 8, input.model.gaps, input.explanation),
      section("interview-section:recommendations", "recommendations", "Recommendations", 9, input.model.recommendations, input.explanation),
      section("interview-section:score", "score", "Readiness Score", 10, input.model.readinessScore, input.explanation),
      section("interview-section:explanation", "explanation", "Explanation Summary", 11, input.explanation.explanationSummary, input.explanation)
    ]);
    const score = createArtifactScore({
      value: input.model.readinessScore.overallScore,
      scale: "zero-to-one-hundred",
      label: input.model.readinessScore.readinessBand
    });
    const artifact = createCareerArtifact({
      artifactId: `artifact:interview-guide:${input.model.question.normalizedText.replace(/[^a-z0-9]+/gu, "-")}`,
      artifactType: "InterviewGuide",
      metadata: {
        artifactId: `artifact:interview-guide:${input.model.question.normalizedText.replace(/[^a-z0-9]+/gu, "-")}`,
        artifactType: "InterviewGuide",
        title: "Interview Guide",
        createdAt: input.model.storySelection.selectedStory?.decisionTraceReference.split(":").slice(1).join(":") || "1970-01-01T00:00:00.000Z",
        source: "interview-intelligence",
        version: 1,
        references: input.explanation.selectedEvidence.map((selection) => createArtifactReference({
          referenceId: idToString(selection.evidence.id),
          referenceType: "evidence",
          label: selection.evidence.title
        }))
      },
      summary: createArtifactSummary({
        headline: "Deterministic interview guide",
        summary: `${input.model.classification.primaryCategory} question prepared with ${input.model.answerPlan.framework} structure.`,
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
}

function frameworkFor(category: InterviewQuestionClassification["primaryCategory"]): InterviewAnswerFramework {
  if (category === "Behavioral" || category === "Leadership" || category === "ConflictResolution" || category === "FailureAndLearning") {
    return "STAR";
  }

  if (category === "ProductSense") {
    return "ClarifyStructureAnalyzeRecommend";
  }

  if (category === "ProductStrategy" || category === "Prioritization") {
    return "HypothesisApproachTradeoffOutcome";
  }

  if (category === "CareerMotivation") {
    return "MotivationEvidenceAlignment";
  }

  return "PrincipleEvidenceOutcome";
}

function answerSection(
  sectionId: string,
  title: string,
  content: readonly string[],
  evidenceReferences: readonly InterviewEvidenceSelection[],
  complete: boolean
): InterviewAnswerSection {
  return immutableRecord({
    sectionId,
    title,
    content: immutableArray(content),
    evidenceReferences: immutableArray(evidenceReferences),
    complete,
    cautionNotes: immutableArray(complete ? [] : [`${title} requires validated source material before use.`])
  });
}

function followUpText(gapType: InterviewGap["gapType"]): string {
  const templates: Readonly<Record<InterviewGap["gapType"], string>> = {
    "no-relevant-story": "Which specific example would you use to support this answer?",
    "weak-competency-coverage": "Which competency does this example demonstrate most strongly?",
    "weak-ownership": "What exactly did you personally own in this situation?",
    "missing-quantified-outcome": "How did you measure the outcome?",
    "weak-baseline-measurement": "What was the baseline before your work?",
    "incomplete-actions": "What were the concrete steps you took?",
    "missing-tradeoff": "What alternatives or trade-offs did you consider?",
    "limited-leadership-evidence": "How did you lead or influence others?",
    "insufficient-technical-depth": "What technical constraints shaped the decision?",
    "weak-customer-evidence": "What customer insight informed the approach?",
    "outdated-evidence": "What more recent evidence supports this answer?",
    "low-domain-relevance": "How does this example connect to the target domain?",
    "weak-learning-reflection": "What did you learn or do differently afterward?",
    "unsupported-claim": "What evidence supports that claim?",
    "poor-follow-up-resilience": "How would you defend the decision under follow-up questioning?"
  };

  return templates[gapType];
}

function section<TContent>(
  sectionId: string,
  sectionType: InterviewArtifactSection["sectionType"],
  title: string,
  order: number,
  content: TContent,
  explanation: InterviewExplanation
): InterviewArtifactSection<TContent> {
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
        evidence: explanation.selectedEvidence.map((selection) => createArtifactEvidence({
          evidence: selection.evidence,
          reference: createArtifactReference({
            referenceId: idToString(selection.evidence.id),
            referenceType: "evidence",
            label: selection.evidence.title
          }),
          confidence: selection.confidence,
          score: selection.score
        })),
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
  }) as InterviewArtifactSection<TContent>;
}
