import { Confidence } from "@career-companion/career-intelligence";
import type { InterviewQuestion, InterviewQuestionCategory, InterviewQuestionClassification } from "../models";
import { immutableArray, immutableRecord, normalizeText, tokenize } from "../shared";

type SignalDefinition = Readonly<{
  category: InterviewQuestionCategory;
  signals: readonly string[];
  weight: number;
}>;

const SIGNALS: readonly SignalDefinition[] = Object.freeze([
  { category: "Behavioral", signals: ["tell me about a time", "tell me about", "describe a time", "example", "experience"], weight: 16 },
  { category: "Leadership", signals: ["lead", "led", "leadership", "mentor", "team"], weight: 12 },
  { category: "ProductSense", signals: ["design", "improve", "users", "customer problem", "product sense"], weight: 13 },
  { category: "ProductExecution", signals: ["execute", "launch", "roadmap", "prioritize", "delivery"], weight: 12 },
  { category: "ProductStrategy", signals: ["strategy", "market", "positioning", "growth", "competitive"], weight: 12 },
  { category: "Analytical", signals: ["metric", "measure", "analyze", "data", "success"], weight: 12 },
  { category: "TechnicalProduct", signals: ["technical", "platform", "api", "architecture", "ai", "ml"], weight: 12 },
  { category: "StakeholderManagement", signals: ["stakeholder", "stakeholders", "cross-functional", "align", "alignment", "influence", "authority"], weight: 12 },
  { category: "CustomerDiscovery", signals: ["customer", "discovery", "interview", "research", "insight"], weight: 12 },
  { category: "Prioritization", signals: ["prioritize", "trade-off", "tradeoff", "scope", "backlog"], weight: 13 },
  { category: "FailureAndLearning", signals: ["failure", "failed", "mistake", "learn", "learned", "differently"], weight: 18 },
  { category: "ConflictResolution", signals: ["conflict", "disagreement", "pushback", "difficult stakeholder"], weight: 14 },
  { category: "CareerMotivation", signals: ["why this role", "motivation", "career", "why do you want"], weight: 14 },
  { category: "DomainSpecific", signals: ["payments", "fintech", "domain", "compliance", "risk"], weight: 12 },
  { category: "CaseStudy", signals: ["case study", "walk me through", "project", "portfolio"], weight: 11 }
]);

export class QuestionClassifier {
  classify(questionText: string): InterviewQuestionClassification {
    const normalized = normalizeText(questionText);
    const tokens = tokenize(questionText);
    const scores = new Map<InterviewQuestionCategory, number>();
    const detectedSignals: string[] = [];

    for (const definition of SIGNALS) {
      for (const signal of definition.signals) {
        if (matchesSignal(normalized, tokens, signal)) {
          scores.set(definition.category, (scores.get(definition.category) ?? 0) + definition.weight);
          detectedSignals.push(signal);
        }
      }
    }

    const ranked = [...scores.entries()]
      .sort((left, right) => {
        const scoreDifference = right[1] - left[1];
        return scoreDifference === 0 ? left[0].localeCompare(right[0]) : scoreDifference;
      });
    const primaryCategory = ranked[0]?.[0] ?? "Unknown";
    const secondaryCategories = ranked.slice(1, 4).map(([category]) => category);
    const total = ranked.reduce((sum, [, score]) => sum + score, 0);

    return immutableRecord({
      primaryCategory,
      secondaryCategories: immutableArray(secondaryCategories),
      detectedSignals: immutableArray([...new Set(detectedSignals)].sort((left, right) => left.localeCompare(right))),
      confidence: Confidence.from(primaryCategory === "Unknown" ? 0.2 : Math.min((ranked[0]?.[1] ?? 0) / Math.max(total, 1), 0.95)),
      rationale: immutableArray(primaryCategory === "Unknown"
        ? ["No stable interview taxonomy signal exceeded the deterministic threshold."]
        : [`${primaryCategory} received the strongest deterministic signal score.`])
    });
  }

  normalize(questionText: string): InterviewQuestion {
    const originalText = questionText.trim();
    if (originalText.length === 0) {
      throw new Error("Interview question is required.");
    }

    return immutableRecord({
      originalText,
      normalizedText: normalizeText(originalText),
      tokens: tokenize(originalText)
    });
  }
}

function matchesSignal(normalized: string, tokens: readonly string[], signal: string): boolean {
  const normalizedSignal = normalizeText(signal);
  if (normalizedSignal.includes(" ")) {
    return normalized.includes(normalizedSignal);
  }

  return tokens.includes(normalizedSignal);
}
