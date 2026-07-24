import { Confidence } from "@career-companion/career-intelligence";
import type { CompetencySnapshot } from "@career-companion/career-knowledge";
import type {
  InterviewCompetencyMapping,
  InterviewQuestionClassification,
  InterviewQuestionCategory,
  InterviewTargetContext
} from "../models";
import { idToString, immutableArray, immutableRecord, normalizeText } from "../shared";

const CATEGORY_COMPETENCY_HINTS: Readonly<Record<InterviewQuestionCategory, readonly string[]>> = Object.freeze({
  Behavioral: ["ownership", "communication", "execution"],
  Leadership: ["leadership", "influence", "ownership"],
  ProductSense: ["customer", "discovery", "strategy", "product"],
  ProductExecution: ["execution", "prioritization", "delivery"],
  ProductStrategy: ["strategy", "commercial", "market", "platform"],
  Analytical: ["analytics", "metric", "experimentation"],
  TechnicalProduct: ["platform", "technical", "ai", "architecture"],
  StakeholderManagement: ["stakeholder", "influence", "communication"],
  CustomerDiscovery: ["customer", "discovery", "research"],
  Prioritization: ["prioritization", "trade", "execution"],
  FailureAndLearning: ["learning", "ownership", "execution"],
  ConflictResolution: ["conflict", "stakeholder", "communication"],
  CareerMotivation: ["motivation", "alignment", "ownership"],
  DomainSpecific: ["payments", "domain", "platform", "risk"],
  CaseStudy: ["story", "portfolio", "impact", "execution"],
  Unknown: ["communication", "ownership"]
});

export class CompetencyMapper {
  map(input: {
    readonly classification: InterviewQuestionClassification;
    readonly competencies: readonly CompetencySnapshot[];
    readonly targetContext?: InterviewTargetContext;
    readonly requiredCompetencyIds?: readonly string[];
  }): readonly InterviewCompetencyMapping[] {
    const categoryHints = [
      ...CATEGORY_COMPETENCY_HINTS[input.classification.primaryCategory],
      ...input.classification.secondaryCategories.flatMap((category) => CATEGORY_COMPETENCY_HINTS[category])
    ];
    const targetHints = contextHints(input.targetContext);
    const required = new Set(input.requiredCompetencyIds ?? []);
    const mappings = input.competencies.map((competency) => {
      const text = normalizeText(`${competency.name} ${competency.category} ${competency.description ?? ""}`);
      const categoryWeight = categoryHints.filter((hint) => text.includes(hint)).length * 14;
      const targetWeight = targetHints.filter((hint) => text.includes(hint)).length * 10;
      const requiredWeight = required.has(idToString(competency.id)) ? 20 : 0;
      const verificationWeight = competency.verificationStatus === "verified" ? 10 : 0;
      const relevanceWeight = Math.min(categoryWeight + targetWeight + requiredWeight + verificationWeight, 100);

      return immutableRecord({
        competency,
        relevanceWeight,
        rationale: `${competency.name} matched deterministic question, target, or required competency signals.`,
        supportingClassificationSignals: immutableArray(input.classification.detectedSignals),
        confidence: Confidence.from(relevanceWeight / 100)
      });
    })
      .filter((mapping) => mapping.relevanceWeight > 0)
      .sort((left, right) => {
        const weightDifference = right.relevanceWeight - left.relevanceWeight;
        return weightDifference === 0
          ? idToString(left.competency.id).localeCompare(idToString(right.competency.id))
          : weightDifference;
      });

    return immutableArray(mappings);
  }
}

function contextHints(context: InterviewTargetContext | undefined): readonly string[] {
  const text = normalizeText(`${context?.targetRole ?? ""} ${context?.targetSeniority ?? ""} ${context?.targetDomain ?? ""}`);
  const hints: string[] = [];

  if (text.includes("lead") || text.includes("senior")) {
    hints.push("leadership", "influence", "stakeholder");
  }

  if (text.includes("ai")) {
    hints.push("ai", "technical", "experimentation", "platform");
  }

  if (text.includes("payment") || text.includes("fintech")) {
    hints.push("payments", "risk", "platform", "domain");
  }

  return immutableArray(hints);
}
