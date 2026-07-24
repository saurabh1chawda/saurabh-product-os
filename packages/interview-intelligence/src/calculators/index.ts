import { Confidence } from "@career-companion/career-intelligence";
import type { MetricSnapshot } from "@career-companion/career-knowledge";
import type {
  InterviewAnswerPlan,
  InterviewCompetencyMapping,
  InterviewEvidenceSelection,
  InterviewGap,
  InterviewQuestionClassification,
  InterviewScore,
  InterviewScoreDeduction,
  InterviewScoreDimension,
  InterviewStorySelection,
  InterviewTargetContext
} from "../models";
import { clamp, idToString, immutableArray, immutableRecord, normalizeText } from "../shared";

const SCORE_WEIGHTS = Object.freeze({
  questionUnderstanding: 0.08,
  competencyCoverage: 0.12,
  storyRelevance: 0.13,
  evidenceStrength: 0.12,
  ownershipClarity: 0.08,
  actionCompleteness: 0.08,
  quantifiedImpact: 0.08,
  narrativeCompleteness: 0.08,
  seniorityAlignment: 0.06,
  targetRoleAlignment: 0.06,
  followUpResilience: 0.06,
  consistency: 0.03,
  constraintSatisfaction: 0.02
});

export class InterviewGapAnalyzer {
  analyze(input: {
    readonly classification: InterviewQuestionClassification;
    readonly mappedCompetencies: readonly InterviewCompetencyMapping[];
    readonly storySelection: InterviewStorySelection;
    readonly answerPlan: InterviewAnswerPlan;
    readonly selectedEvidence: readonly InterviewEvidenceSelection[];
    readonly targetContext?: InterviewTargetContext;
    readonly metrics?: readonly MetricSnapshot[];
  }): readonly InterviewGap[] {
    const gaps: InterviewGap[] = [];
    const selected = input.storySelection.selectedStory;
    const story = selected?.story;

    if (selected === undefined) gaps.push(gap("no-relevant-story", "No relevant story was selected.", "high", "question", [], ["story"], "Add a validated story that answers this question."));
    if (input.mappedCompetencies.length === 0) gaps.push(gap("weak-competency-coverage", "No mapped competency has sufficient relevance.", "high", input.classification.primaryCategory, input.selectedEvidence, ["competency"], "Clarify which competency the example proves."));
    if (selected !== undefined && selected.scoreBreakdown.ownershipClarity < 70) gaps.push(gap("weak-ownership", "Candidate ownership is not explicit enough.", "medium", story?.title ?? "selected story", input.selectedEvidence, ["ownership evidence"], "Clarify personal ownership and decision rights."));
    if (hasNoAvailableMetric(story?.metricIds ?? [], input.metrics ?? [])) gaps.push(gap("missing-quantified-outcome", "Selected story has no quantified metric.", "high", story?.title ?? "selected story", input.selectedEvidence, ["metric"], "Attach a verified metric or baseline measurement."));
    if (!input.answerPlan.sections.some((section) => section.sectionId === "tradeoffs" && section.complete)) gaps.push(gap("missing-tradeoff", "Trade-offs are not documented.", "medium", story?.title ?? "selected story", input.selectedEvidence, ["trade-off"], "Add validated alternatives or trade-offs considered."));
    if (!input.answerPlan.sections.some((section) => section.sectionId === "learning" && section.complete)) gaps.push(gap("weak-learning-reflection", "Learning reflection is weak or missing.", "medium", story?.title ?? "selected story", input.selectedEvidence, ["learning"], "Add a validated learning or what-changed-afterward note."));

    const targetText = normalizeText(`${input.targetContext?.targetRole ?? ""} ${input.targetContext?.targetDomain ?? ""}`);
    if (targetText.includes("lead") && !input.mappedCompetencies.some((mapping) => mapping.competency.category === "leadership")) {
      gaps.push(gap("limited-leadership-evidence", "Leadership evidence is limited for the target context.", "medium", "leadership", input.selectedEvidence, ["leadership evidence"], "Add a story with explicit leadership or influence evidence."));
    }

    if ((input.classification.primaryCategory === "TechnicalProduct" || targetText.includes("ai")) && !input.mappedCompetencies.some((mapping) => mapping.competency.category === "platform-thinking" || mapping.competency.category === "ai-product-management")) {
      gaps.push(gap("insufficient-technical-depth", "Technical product depth is insufficient for the question context.", "medium", "technical product", input.selectedEvidence, ["technical evidence"], "Add validated technical, platform, AI, or architecture evidence."));
    }

    if (input.classification.primaryCategory === "CustomerDiscovery" && !input.selectedEvidence.some((selection) => normalizeText(selection.evidence.title).includes("customer"))) {
      gaps.push(gap("weak-customer-evidence", "Customer evidence is weak for a discovery question.", "medium", "customer discovery", input.selectedEvidence, ["customer evidence"], "Attach customer discovery notes, research evidence, or insight artifacts."));
    }

    if (selected !== undefined && selected.scoreBreakdown.followUpResilience < 50) {
      gaps.push(gap("poor-follow-up-resilience", "The selected story may not withstand detailed follow-up questioning.", "medium", selected.story.title, input.selectedEvidence, ["alternatives", "trade-offs", "lessons"], "Prepare validated details for decisions, trade-offs, and learning."));
    }

    return immutableArray(gaps);
  }
}

function hasNoAvailableMetric(
  metricIds: readonly { readonly toString: () => string }[],
  metrics: readonly MetricSnapshot[]
): boolean {
  if (metricIds.length === 0) {
    return true;
  }

  const availableMetricIds = new Set(metrics.map((metric) => idToString(metric.id)));
  return metricIds.every((metricId) => !availableMetricIds.has(idToString(metricId)));
}

export class InterviewScoreCalculator {
  calculate(input: {
    readonly classification: InterviewQuestionClassification;
    readonly mappedCompetencies: readonly InterviewCompetencyMapping[];
    readonly storySelection: InterviewStorySelection;
    readonly answerPlan: InterviewAnswerPlan;
    readonly selectedEvidence: readonly InterviewEvidenceSelection[];
    readonly gaps: readonly InterviewGap[];
    readonly targetContext?: InterviewTargetContext;
  }): InterviewScore {
    const selected = input.storySelection.selectedStory;
    const dimensions = immutableArray([
      dimension("question-understanding", input.classification.primaryCategory === "Unknown" ? 30 : Math.round(input.classification.confidence.value * 100), SCORE_WEIGHTS.questionUnderstanding, "Derived from deterministic classification confidence."),
      dimension("competency-coverage", Math.min(input.mappedCompetencies.length * 25, 100), SCORE_WEIGHTS.competencyCoverage, "Derived from mapped competency count and relevance."),
      dimension("story-relevance", selected?.totalScore ?? 0, SCORE_WEIGHTS.storyRelevance, "Derived from selected story score."),
      dimension("evidence-strength", average(input.selectedEvidence.map((evidence) => evidence.score.value)), SCORE_WEIGHTS.evidenceStrength, "Derived from selected evidence ranking."),
      dimension("ownership-clarity", selected?.scoreBreakdown.ownershipClarity ?? 0, SCORE_WEIGHTS.ownershipClarity, "Derived from explicit ownership signals."),
      dimension("action-completeness", selected?.scoreBreakdown.actionClarity ?? 0, SCORE_WEIGHTS.actionCompleteness, "Derived from available action details."),
      dimension("quantified-impact", selected?.scoreBreakdown.quantifiedImpact ?? 0, SCORE_WEIGHTS.quantifiedImpact, "Derived from attached metrics."),
      dimension("narrative-completeness", completeness(input.answerPlan), SCORE_WEIGHTS.narrativeCompleteness, "Derived from complete answer sections."),
      dimension("seniority-alignment", selected?.scoreBreakdown.seniorityAlignment ?? 50, SCORE_WEIGHTS.seniorityAlignment, "Derived from target seniority signals."),
      dimension("target-role-alignment", selected?.scoreBreakdown.domainRelevance ?? 50, SCORE_WEIGHTS.targetRoleAlignment, "Derived from target role and domain relevance."),
      dimension("follow-up-resilience", selected?.scoreBreakdown.followUpResilience ?? 0, SCORE_WEIGHTS.followUpResilience, "Derived from alternatives, trade-offs, and lessons."),
      dimension("consistency", Math.max(100 - input.gaps.length * 8, 0), SCORE_WEIGHTS.consistency, "Reduced by preparation gaps."),
      dimension("constraint-satisfaction", input.gaps.some((gapItem) => gapItem.severity === "high") ? 65 : 95, SCORE_WEIGHTS.constraintSatisfaction, "Reduced by high-severity gaps.")
    ]);
    const deductions = immutableArray(input.gaps.map((gapItem) => immutableRecord({
      code: gapItem.gapType,
      amount: gapItem.severity === "high" ? 8 : gapItem.severity === "medium" ? 5 : 2,
      rationale: gapItem.description
    } satisfies InterviewScoreDeduction)));
    const weighted = dimensions.reduce((sum, item) => sum + item.score * item.weight, 0);
    const deductionTotal = deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
    const overallScore = Math.round(clamp(weighted - deductionTotal, 0, 100));

    return immutableRecord({
      overallScore,
      readinessBand: overallScore >= 75 ? "high" : overallScore >= 50 ? "medium" : "low",
      dimensions,
      deductions,
      confidence: Confidence.from(overallScore / 100)
    });
  }
}

function gap(
  gapType: InterviewGap["gapType"],
  description: string,
  severity: InterviewGap["severity"],
  affectedQuestionOrCompetency: string,
  supportingEvidence: readonly InterviewEvidenceSelection[],
  missingEvidence: readonly string[],
  recommendedImprovement: string
): InterviewGap {
  return immutableRecord({
    gapId: `interview-gap:${gapType}`,
    gapType,
    description,
    severity,
    affectedQuestionOrCompetency,
    supportingEvidence: immutableArray(supportingEvidence.slice(0, 2)),
    missingEvidence: immutableArray(missingEvidence),
    rationale: "Gap was detected by deterministic preparation rules.",
    recommendedImprovement,
    confidence: Confidence.from(severity === "high" ? 0.85 : 0.7)
  });
}

function dimension(
  dimensionName: string,
  score: number,
  weight: number,
  rationale: string
): InterviewScoreDimension {
  return immutableRecord({
    dimension: dimensionName,
    score: Math.round(clamp(score, 0, 100)),
    weight,
    rationale
  });
}

function completeness(answerPlan: InterviewAnswerPlan): number {
  if (answerPlan.sections.length === 0) {
    return 0;
  }

  return answerPlan.sections.filter((section) => section.complete).length / answerPlan.sections.length * 100;
}

function average(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
