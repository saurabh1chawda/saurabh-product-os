import { describe, expect, it } from "vitest";
import type {
  CompetencySnapshot,
  EvidenceReferenceSnapshot,
  ISODateString,
  MetricSnapshot,
  StorySnapshot
} from "@career-companion/career-knowledge";
import {
  CompetencyId,
  EvidenceReferenceId,
  MetricId,
  StoryId
} from "@career-companion/career-knowledge";
import { createDecisionTrace } from "@career-companion/decision-engine";
import {
  CompetencyMapper,
  InterviewAnalyzer,
  InterviewGapAnalyzer,
  InterviewScoreCalculator,
  InterviewStorySelector,
  QuestionClassifier
} from "../src";
import type { InterviewInput, InterviewSourceData } from "../src";
import packageJson from "../package.json";

describe("interview intelligence", () => {
  it("classifies representative question taxonomy deterministically", () => {
    const classifier = new QuestionClassifier();

    expect(classifier.classify("Tell me about a time you owned a difficult product decision.").primaryCategory).toBe("Behavioral");
    expect(classifier.classify("Describe a time you led a team through ambiguity.").primaryCategory).toBe("Leadership");
    expect(classifier.classify("How would you improve a product for new users?").primaryCategory).toBe("ProductSense");
    expect(classifier.classify("How do you execute a roadmap launch?").primaryCategory).toBe("ProductExecution");
    expect(classifier.classify("What strategy would you use for market growth?").primaryCategory).toBe("ProductStrategy");
    expect(classifier.classify("How would you measure success with data and metrics?").primaryCategory).toBe("Analytical");
    expect(classifier.classify("How do you work with technical architecture and APIs?").primaryCategory).toBe("TechnicalProduct");
    expect(classifier.classify("How do you align stakeholders without authority?").primaryCategory).toBe("StakeholderManagement");
    expect(classifier.classify("Tell me about a failed experiment and what you learned.").primaryCategory).toBe("FailureAndLearning");
    expect(classifier.classify("Why do you want this role at this stage of your career?").primaryCategory).toBe("CareerMotivation");
    expect(classifier.classify("Blue triangle coffee?").primaryCategory).toBe("Unknown");
  });

  it("maps competencies with stable weights and bounded target context influence", () => {
    const source = createSourceData();
    const classifier = new QuestionClassifier();
    const classification = classifier.classify("How did you lead an AI platform decision with stakeholders?");
    const mappings = new CompetencyMapper().map({
      classification,
      competencies: source.competencies,
      targetContext: {
        targetRole: "Lead AI Product Manager",
        targetSeniority: "Lead",
        targetDomain: "AI Platform"
      },
      requiredCompetencyIds: ["competency-leadership"]
    });

    expect(mappings.map((mapping) => mapping.competency.id.toString())).toEqual([
      "competency-leadership",
      "competency-ai",
      "competency-platform",
      "competency-stakeholder"
    ]);
    expect(mappings[0]?.relevanceWeight).toBeGreaterThan(mappings[1]?.relevanceWeight ?? 0);
    expect(mappings[0]?.supportingClassificationSignals.length).toBeGreaterThan(0);
  });

  it("selects the strongest relevant story and retains rejected alternatives with stable tie-breaking", () => {
    const input = createInterviewInput();
    const analyzer = new InterviewAnalyzer();
    const result = analyzer.analyze(input);
    const shuffledResult = analyzer.analyze({
      ...input,
      source: {
        ...input.source,
        stories: [...input.source.stories].reverse()
      }
    });

    expect(result.storySelection.selectedStory?.story.id.toString()).toBe("story-conflict");
    expect(result.storySelection.acceptedAlternative?.story.id.toString()).toBe("story-conflict");
    expect(result.storySelection.rejectedAlternatives.map((alternative) => alternative.story.id.toString())).toContain("story-growth");
    expect(result.storySelection.selectedStory?.scoreBreakdown.evidenceStrength).toBeGreaterThan(0);
    expect(shuffledResult.storySelection.selectedStory?.story.id.toString()).toBe("story-conflict");
  });

  it("builds structured answer plans without inventing missing material", () => {
    const behavioral = new InterviewAnalyzer().analyze(createInterviewInput());
    const productSense = new InterviewAnalyzer().analyze(createInterviewInput({
      questionText: "How would you improve onboarding for a new product?"
    }));
    const incomplete = new InterviewAnalyzer().analyze(createInterviewInput({
      source: createSourceData({
        stories: [createStory({
          id: "story-incomplete",
          title: "Incomplete story",
          problem: "A product issue existed.",
          actions: [],
          outcome: "",
          competencyIds: [new CompetencyId("competency-ai")],
          evidenceReferenceIds: []
        })]
      })
    }));

    expect(behavioral.answerPlan.framework).toBe("STAR");
    expect(productSense.answerPlan.framework).toBe("ClarifyStructureAnalyzeRecommend");
    expect(incomplete.answerPlan.sections.some((section) => !section.complete)).toBe(true);
    expect(behavioral.answerPlan.sections.some((section) => section.evidenceReferences.length > 0)).toBe(true);
  });

  it("creates grounded follow-up questions and respects maximum count policy", () => {
    const result = new InterviewAnalyzer().analyze(createInterviewInput({
      policies: {
        maximumAlternatives: 3,
        followUpCount: 2
      },
      source: createSourceData({
        metrics: [],
        competencies: [createCompetency("competency-ai", "AI Product Management", "ai-product-management")]
      })
    }));

    expect(result.followUpQuestions).toHaveLength(2);
    expect(result.followUpQuestions[0]?.questionText).toBe("How did you measure the outcome?");
    expect(result.followUpQuestions[0]?.evidenceReadinessStatus).toMatch(/partial|missing/u);
  });

  it("detects preparation gaps for weak source material", () => {
    const source = createSourceData({
      metrics: [],
      competencies: [createCompetency("competency-ai", "AI Product Management", "ai-product-management")],
      stories: [createStory({
        id: "story-weak-gap",
        title: "Weak preparation story",
        problem: "A product issue existed.",
        actions: ["Helped the team assess options."],
        outcome: "The situation improved.",
        competencyIds: [new CompetencyId("competency-ai")],
        evidenceReferenceIds: [new EvidenceReferenceId("evidence-conflict")],
        metricIds: [new MetricId("metric-missing")]
      })]
    });
    const analyzer = new InterviewAnalyzer();
    const result = analyzer.analyze(createInterviewInput({ source }));

    expect(result.gaps.map((gap) => gap.gapType)).toEqual(expect.arrayContaining([
      "missing-quantified-outcome",
      "missing-tradeoff",
      "weak-learning-reflection",
      "limited-leadership-evidence"
    ]));
  });

  it("calculates bounded readiness scores and rewards stronger evidence", () => {
    const strong = new InterviewAnalyzer().analyze(createInterviewInput());
    const weakInput = createInterviewInput({
      source: createSourceData({
        metrics: [],
        evidence: [createEvidence("evidence-weak", "contextual", "unverified", "Weak evidence")],
        stories: [createStory({
          id: "story-weak",
          title: "Weak story",
          problem: "A vague problem existed.",
          actions: ["Helped the team."],
          outcome: "Some improvement.",
          competencyIds: [new CompetencyId("competency-ai")],
          evidenceReferenceIds: []
        })]
      })
    });
    const weak = new InterviewAnalyzer().analyze(weakInput);

    expect(strong.readinessScore.overallScore).toBeGreaterThan(weak.readinessScore.overallScore);
    expect(strong.readinessScore.overallScore).toBeLessThanOrEqual(100);
    expect(strong.readinessScore.dimensions.map((dimension) => dimension.dimension)).toContain("story-relevance");
    expect(weak.readinessScore.deductions.length).toBeGreaterThan(0);
  });

  it("builds canonical InterviewGuide artifact with explanation and evidence", () => {
    const model = new InterviewAnalyzer().analyze(createInterviewInput());

    expect(model.artifact.artifactType).toBe("InterviewGuide");
    expect(model.sections.map((section) => section.sectionType)).toEqual([
      "context",
      "question-analysis",
      "competencies",
      "recommended-story",
      "answer-plan",
      "evidence",
      "follow-ups",
      "gaps",
      "recommendations",
      "score",
      "explanation"
    ]);
    expect(model.artifact.sections).toEqual(model.sections);
    expect(model.sections[0]?.blocks[0]?.evidence.length).toBeGreaterThan(0);
    expect(model.sections[0]?.blocks[0]?.explanation?.decisionTraceReference).toBe("InterviewQuestionPipeline:2026-01-01T00:00:00.000Z");
  });

  it("surfaces explainability for selected and rejected story alternatives", () => {
    const model = new InterviewAnalyzer().analyze(createInterviewInput());

    expect(model.explanationSummary.alternatives.acceptedAlternative?.option.label).toBe("Stakeholder Conflict Resolution");
    expect(model.explanationSummary.alternatives.rejectedAlternatives.length).toBeGreaterThan(0);
    expect(model.recommendations[0]?.constraintSummary.constraints[0]?.label).toBe("Validated career knowledge only");
    expect(model.recommendations[0]?.confidence.value).toBeGreaterThan(0);
    expect(model.recommendations[0]?.decisionTraceReference).toBe("InterviewQuestionPipeline:2026-01-01T00:00:00.000Z");
  });

  it("keeps public output immutable and deterministic", () => {
    const analyzer = new InterviewAnalyzer();
    const input = createInterviewInput();
    const first = analyzer.analyze(input);
    const second = analyzer.analyze(input);

    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.mappedCompetencies)).toBe(true);
    expect(Object.isFrozen(first.storySelection.rejectedAlternatives)).toBe(true);
    expect(Object.isFrozen(first.answerPlan.sections)).toBe(true);
    expect(Object.isFrozen(first.followUpQuestions)).toBe(true);
    expect(Object.isFrozen(first.gaps)).toBe(true);
    expect(Object.isFrozen(first.artifact.sections)).toBe(true);
  });

  it("keeps dependency boundaries clean", () => {
    const dependencies = Object.keys(packageJson.dependencies).sort();

    expect(dependencies).toEqual([
      "@career-companion/career-artifacts",
      "@career-companion/career-intelligence",
      "@career-companion/career-knowledge",
      "@career-companion/decision-engine",
      "@career-companion/decision-model",
      "@career-companion/explainability",
      "@career-companion/kernel"
    ].sort());
    expect(dependencies).not.toContain("@career-companion/application");
    expect(dependencies).not.toContain("@career-companion/resume-intelligence");
    expect(dependencies).not.toContain("@career-companion/portfolio-intelligence");
  });

  it("allows lower-level components to be tested directly", () => {
    const source = createSourceData();
    const analyzer = new InterviewAnalyzer().analyze(createInterviewInput({ source }));
    const gaps = new InterviewGapAnalyzer().analyze({
      classification: analyzer.classification,
      mappedCompetencies: analyzer.mappedCompetencies,
      storySelection: analyzer.storySelection,
      answerPlan: analyzer.answerPlan,
      selectedEvidence: analyzer.recommendations[0]?.selectedEvidence ?? [],
      targetContext: createInterviewInput().targetContext
    });
    const score = new InterviewScoreCalculator().calculate({
      classification: analyzer.classification,
      mappedCompetencies: analyzer.mappedCompetencies,
      storySelection: analyzer.storySelection,
      answerPlan: analyzer.answerPlan,
      selectedEvidence: analyzer.recommendations[0]?.selectedEvidence ?? [],
      gaps,
      targetContext: createInterviewInput().targetContext
    });
    const storySelection = new InterviewStorySelector().select({
      stories: source.stories,
      selectedEvidence: analyzer.recommendations[0]?.selectedEvidence ?? [],
      mappedCompetencies: analyzer.mappedCompetencies,
      classification: analyzer.classification,
      question: analyzer.question,
      targetContext: createInterviewInput().targetContext,
      decisionTraceReference: "trace"
    });

    expect(score.overallScore).toBeGreaterThan(0);
    expect(storySelection.candidates.length).toBe(source.stories.length);
  });
});

function createInterviewInput(overrides: Partial<InterviewInput> = {}): InterviewInput {
  return {
    questionText: "Tell me about a time you led stakeholders through conflict on an AI platform decision.",
    targetContext: {
      targetRole: "Lead AI Product Manager",
      targetSeniority: "Lead",
      targetDomain: "AI Platform",
      interviewFormat: "behavioral"
    },
    requiredCompetencyIds: ["competency-leadership", "competency-stakeholder", "competency-ai"],
    source: createSourceData(),
    policies: {
      maximumAlternatives: 3,
      followUpCount: 5
    },
    ...overrides
  };
}

function createSourceData(overrides: Partial<InterviewSourceData> = {}): InterviewSourceData {
  const primaryEvidenceId = new EvidenceReferenceId("evidence-conflict");
  const metricId = new MetricId("metric-conflict");
  const leadershipId = new CompetencyId("competency-leadership");
  const stakeholderId = new CompetencyId("competency-stakeholder");
  const aiId = new CompetencyId("competency-ai");
  const platformId = new CompetencyId("competency-platform");

  const source = {
    competencies: [
      createCompetency("competency-leadership", "Leadership", "leadership"),
      createCompetency("competency-stakeholder", "Stakeholder Management", "execution"),
      createCompetency("competency-ai", "AI Product Management", "ai-product-management"),
      createCompetency("competency-platform", "Platform Thinking", "platform-thinking")
    ],
    stories: [
      createStory({
        id: "story-growth",
        title: "Growth Experiment",
        problem: "Activation was below target.",
        actions: ["Analyzed funnel data", "Prioritized onboarding changes"],
        outcome: "Improved activation.",
        competencyIds: [aiId],
        evidenceReferenceIds: [new EvidenceReferenceId("evidence-growth")],
        metricIds: [new MetricId("metric-growth")]
      }),
      createStory({
        id: "story-conflict",
        title: "Stakeholder Conflict Resolution",
        problem: "Engineering and operations disagreed on launch risk.",
        decision: "I led the group through a risk-based decision and prioritized an incremental AI platform rollout.",
        actions: ["Led stakeholder alignment", "Clarified trade-offs", "Owned launch decision"],
        outcome: "Reduced review time while protecting launch reliability.",
        alternatives: ["Delay launch", "Ship the full workflow at once"],
        tradeoffs: ["Reduced scope to lower reliability risk"],
        lessons: ["Earlier risk framing improves stakeholder trust."],
        competencyIds: [leadershipId, stakeholderId, aiId, platformId],
        evidenceReferenceIds: [primaryEvidenceId],
        metricIds: [metricId]
      }),
      createStory({
        id: "story-failure",
        title: "Failed Experiment Learning",
        problem: "A discovery experiment did not produce expected conversion gains.",
        actions: ["Reviewed customer feedback", "Changed the validation approach"],
        outcome: "Improved future discovery quality.",
        lessons: ["Define a stronger baseline before launch."],
        competencyIds: [new CompetencyId("competency-ai")],
        evidenceReferenceIds: [],
        metricIds: []
      })
    ],
    metrics: [
      createMetric(metricId, "Review time reduction", 25),
      createMetric(new MetricId("metric-growth"), "Activation lift", 12)
    ],
    evidence: [
      createEvidence("evidence-conflict", "primary", "verified", "Stakeholder conflict decision record"),
      createEvidence("evidence-growth", "supporting", "verified", "Growth experiment report"),
      createEvidence("evidence-customer", "supporting", "candidate", "Customer discovery notes")
    ],
    decisionTrace: createDecisionTrace({
      metadata: {
        pipelineName: "InterviewQuestionPipeline",
        executionTimestamp: "2026-01-01T00:00:00.000Z"
      },
      stepsExecuted: [],
      decisionInputs: ["interview-question"],
      recommendations: ["interview-guide"]
    })
  } satisfies InterviewSourceData;

  return {
    ...source,
    ...overrides
  };
}

function createCompetency(
  id: string,
  name: string,
  category: CompetencySnapshot["category"]
): CompetencySnapshot {
  return {
    id: new CompetencyId(id),
    name,
    category,
    description: `${name} capability`,
    status: "active",
    verificationStatus: "verified",
    achievementIds: [],
    projectIds: [],
    evidenceReferenceIds: [],
    skillIds: [],
    technologyIds: []
  };
}

function createStory(input: {
  readonly id: string;
  readonly title: string;
  readonly problem: string;
  readonly actions: readonly string[];
  readonly outcome: string;
  readonly competencyIds: readonly CompetencyId[];
  readonly evidenceReferenceIds: readonly EvidenceReferenceId[];
  readonly metricIds?: readonly MetricId[];
  readonly decision?: string;
  readonly alternatives?: readonly string[];
  readonly tradeoffs?: readonly string[];
  readonly lessons?: readonly string[];
}): StorySnapshot {
  return {
    id: new StoryId(input.id),
    title: input.title,
    status: "active",
    situation: "A product team needed a better decision path.",
    problem: input.problem,
    decision: input.decision ?? "I helped the team choose an evidence-backed path.",
    alternatives: input.alternatives,
    tradeoffs: input.tradeoffs,
    actions: input.actions,
    outcome: input.outcome,
    lessons: input.lessons,
    metricIds: input.metricIds ?? [],
    competencyIds: input.competencyIds,
    evidenceReferenceIds: input.evidenceReferenceIds
  };
}

function createMetric(id: MetricId, name: string, value: number): MetricSnapshot {
  return {
    id,
    name,
    unit: "percent",
    value,
    source: "Product analytics",
    confidence: "high",
    measurementDate: "2025-01-01" as ISODateString,
    verificationStatus: "verified",
    status: "active"
  };
}

function createEvidence(
  id: string,
  strength: EvidenceReferenceSnapshot["strength"],
  verificationStatus: EvidenceReferenceSnapshot["verificationStatus"],
  title: string
): EvidenceReferenceSnapshot {
  return {
    id: new EvidenceReferenceId(id),
    evidenceType: "document",
    title,
    sourceName: "Career Knowledge",
    capturedDate: "2025-01-01" as ISODateString,
    strength,
    verificationStatus,
    status: "active"
  };
}
