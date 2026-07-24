import { Confidence, EvidenceRanker, RecommendationScore } from "@career-companion/career-intelligence";
import type { EvidenceReferenceSnapshot, StorySnapshot } from "@career-companion/career-knowledge";
import type {
  InterviewCompetencyMapping,
  InterviewEvidenceSelection,
  InterviewQuestion,
  InterviewQuestionClassification,
  InterviewStoryCandidate,
  InterviewStoryScoreBreakdown,
  InterviewStorySelection,
  InterviewTargetContext
} from "../models";
import { idToString, immutableArray, immutableRecord, normalizeText } from "../shared";

export class InterviewEvidenceSelector {
  constructor(private readonly evidenceRanker = new EvidenceRanker()) {}

  select(input: {
    readonly evidence: readonly EvidenceReferenceSnapshot[];
    readonly mappedCompetencies: readonly InterviewCompetencyMapping[];
    readonly question: InterviewQuestion;
    readonly targetContext?: InterviewTargetContext;
  }): readonly InterviewEvidenceSelection[] {
    const ranked = this.evidenceRanker.rank(input.evidence);
    const questionText = input.question.normalizedText;
    const contextText = normalizeText(`${input.targetContext?.targetRole ?? ""} ${input.targetContext?.targetDomain ?? ""}`);

    return immutableArray(ranked
      .map((ranking) => {
        const text = normalizeText(`${ranking.subject.title} ${ranking.subject.description ?? ""} ${ranking.subject.sourceName ?? ""}`);
        const relevanceBonus = questionText.split(" ").filter((token) => token.length > 3 && text.includes(token)).length * 3;
        const contextBonus = contextText.split(" ").filter((token) => token.length > 3 && text.includes(token)).length * 3;
        const competencyBonus = input.mappedCompetencies.length > 0 ? 5 : 0;

        return immutableRecord({
          evidence: ranking.subject,
          rank: ranking.rank,
          score: RecommendationScore.from(ranking.score.value + relevanceBonus + contextBonus + competencyBonus),
          confidence: ranking.confidence
        });
      })
      .sort((left, right) => {
        const scoreDifference = right.score.value - left.score.value;
        return scoreDifference === 0
          ? idToString(left.evidence.id).localeCompare(idToString(right.evidence.id))
          : scoreDifference;
      })
      .map((selection, index) => immutableRecord({ ...selection, rank: index + 1 })));
  }
}

export class InterviewStorySelector {
  select(input: {
    readonly stories: readonly StorySnapshot[];
    readonly selectedEvidence: readonly InterviewEvidenceSelection[];
    readonly mappedCompetencies: readonly InterviewCompetencyMapping[];
    readonly classification: InterviewQuestionClassification;
    readonly question: InterviewQuestion;
    readonly targetContext?: InterviewTargetContext;
    readonly decisionTraceReference: string;
    readonly maximumAlternatives?: number;
  }): InterviewStorySelection {
    const candidates = input.stories.map((story) => createCandidate(story, input))
      .sort(compareCandidates)
      .map((candidate, index) => immutableRecord({ ...candidate, rank: index + 1 }));
    const selectedStory = candidates[0];
    const alternatives = candidates.slice(0, input.maximumAlternatives ?? 3).map((candidate) => immutableRecord({
      story: candidate.story,
      rank: candidate.rank,
      totalScore: candidate.totalScore,
      rejectionReasons: candidate.rank === 1
        ? immutableArray(["Selected as the strongest deterministic story candidate."])
        : immutableArray([`Ranked below ${selectedStory?.story.title ?? "the selected story"} on relevance, evidence, or completeness.`])
    }));

    return immutableRecord({
      selectedStory,
      acceptedAlternative: alternatives[0],
      rejectedAlternatives: immutableArray(alternatives.slice(1)),
      candidates: immutableArray(candidates)
    });
  }
}

function createCandidate(
  story: StorySnapshot,
  input: {
    readonly selectedEvidence: readonly InterviewEvidenceSelection[];
    readonly mappedCompetencies: readonly InterviewCompetencyMapping[];
    readonly classification: InterviewQuestionClassification;
    readonly question: InterviewQuestion;
    readonly targetContext?: InterviewTargetContext;
    readonly decisionTraceReference: string;
  }
): InterviewStoryCandidate {
  const storyText = normalizeText(`${story.title} ${story.situation} ${story.problem} ${story.decision} ${story.actions.join(" ")} ${story.outcome} ${(story.lessons ?? []).join(" ")}`);
  const questionRelevance = Math.min(input.question.tokens.filter((token) => token.length > 3 && storyText.includes(token)).length * 12, 100);
  const mappedIds = new Set(input.mappedCompetencies.map((mapping) => idToString(mapping.competency.id)));
  const competencyCoverage = input.mappedCompetencies.length === 0
    ? 50
    : Math.min(story.competencyIds.filter((id) => mappedIds.has(idToString(id))).length / input.mappedCompetencies.length * 100, 100);
  const storyEvidence = input.selectedEvidence.filter((evidence) => story.evidenceReferenceIds.some((id) => id.equals(evidence.evidence.id)));
  const evidenceStrength = average(storyEvidence.map((evidence) => evidence.score.value));
  const ownershipClarity = /(^|\s)(i|led|owned|drove|decided|prioritized)(\s|$)/u.test(storyText) ? 90 : 45;
  const problemClarity = story.problem.trim().length > 0 ? 90 : 20;
  const actionClarity = Math.min(story.actions.length * 25, 100);
  const outcomeStrength = story.outcome.trim().length > 0 ? 85 : 20;
  const quantifiedImpact = story.metricIds.length > 0 ? 90 : 25;
  const seniorityAlignment = normalizeText(`${input.targetContext?.targetSeniority ?? ""} ${input.targetContext?.targetRole ?? ""}`).includes("lead") && storyText.includes("led") ? 90 : 60;
  const domainRelevance = input.targetContext?.targetDomain === undefined || storyText.includes(normalizeText(input.targetContext.targetDomain)) ? 80 : 45;
  const recency = 50 + Math.min(story.evidenceReferenceIds.length * 10, 30);
  const followUpResilience = Math.min((story.alternatives?.length ?? 0) * 20 + (story.tradeoffs?.length ?? 0) * 20 + (story.lessons?.length ?? 0) * 15, 100);
  const scoreBreakdown = immutableRecord({
    questionRelevance,
    competencyCoverage,
    evidenceStrength,
    ownershipClarity,
    problemClarity,
    actionClarity,
    outcomeStrength,
    quantifiedImpact,
    seniorityAlignment,
    domainRelevance,
    recency,
    followUpResilience
  } satisfies InterviewStoryScoreBreakdown);
  const totalScore = Math.round(
    (questionRelevance * 0.13)
    + (competencyCoverage * 0.13)
    + (evidenceStrength * 0.13)
    + (ownershipClarity * 0.1)
    + (problemClarity * 0.08)
    + (actionClarity * 0.08)
    + (outcomeStrength * 0.1)
    + (quantifiedImpact * 0.08)
    + (seniorityAlignment * 0.06)
    + (domainRelevance * 0.04)
    + (recency * 0.03)
    + (followUpResilience * 0.04)
  );

  return immutableRecord({
    story,
    rank: 0,
    totalScore,
    evidenceStrength,
    recency,
    scoreBreakdown,
    rankingRationale: immutableArray([
      `${story.title} was scored against ${input.classification.primaryCategory} intent.`,
      "Ranking uses relevance, competency coverage, evidence, ownership, completeness, and follow-up resilience."
    ]),
    confidence: Confidence.from(totalScore / 100),
    decisionTraceReference: input.decisionTraceReference
  });
}

function compareCandidates(left: InterviewStoryCandidate, right: InterviewStoryCandidate): number {
  const scoreDifference = right.totalScore - left.totalScore;
  if (scoreDifference !== 0) {
    return scoreDifference;
  }

  const evidenceDifference = right.evidenceStrength - left.evidenceStrength;
  if (evidenceDifference !== 0) {
    return evidenceDifference;
  }

  const recencyDifference = right.recency - left.recency;
  if (recencyDifference !== 0) {
    return recencyDifference;
  }

  return idToString(left.story.id).localeCompare(idToString(right.story.id));
}

function average(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
