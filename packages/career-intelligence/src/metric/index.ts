import type { MetricSnapshot } from "@career-companion/career-knowledge";
import { createReason, createRecommendation, idToString, rankRecommendations } from "../shared";
import type { Coverage, Ranking, Recommendation } from "../shared";

export interface MetricCoverage extends Coverage {
  readonly verifiedMetricCount: number;
  readonly measurableOutcomeCount: number;
}

export type MetricRecommendation = Recommendation<MetricSnapshot>;

export class MetricStrengthCalculator {
  calculate(metric: MetricSnapshot): MetricRecommendation {
    const metricId = idToString(metric.id);
    const measurableWeight = Math.abs(metric.value) > 0 ? 30 : 0;
    const verificationWeight = metric.verificationStatus === "verified" ? 40 : 15;
    const confidenceWeight = metric.confidence === "high" ? 25 : metric.confidence === "medium" ? 15 : 5;
    const reasons = [
      createReason("measurable-outcome", "Non-zero metric values provide measurable outcome support.", measurableWeight, [metricId]),
      createReason("metric-verification", `${metric.verificationStatus} metric status contributes to confidence.`, verificationWeight, [metricId]),
      createReason("metric-confidence", `${metric.confidence ?? "low"} confidence contributes to ranking.`, confidenceWeight, [metricId])
    ];

    return createRecommendation({
      subject: metric,
      score: measurableWeight + verificationWeight + confidenceWeight,
      confidence: metric.verificationStatus === "verified" ? 0.9 : 0.55,
      reasons,
      summary: `Metric ${metric.name} is ranked by measurement, verification, and confidence.`
    });
  }

  rank(metrics: readonly MetricSnapshot[]): readonly Ranking<MetricSnapshot>[] {
    return rankRecommendations(metrics.map((metric) => this.calculate(metric)));
  }
}

export function calculateMetricCoverage(metrics: readonly MetricSnapshot[]): MetricCoverage {
  const verifiedMetricCount = metrics.filter((metric) => metric.verificationStatus === "verified").length;
  const measurableOutcomeCount = metrics.filter((metric) => Math.abs(metric.value) > 0).length;

  return {
    present: metrics.length,
    required: metrics.length,
    missing: 0,
    ratio: metrics.length === 0 ? 0 : verifiedMetricCount / metrics.length,
    verifiedMetricCount,
    measurableOutcomeCount,
    reasons: [
      createReason("metric-coverage", `${verifiedMetricCount} verified metrics are available.`, verifiedMetricCount)
    ]
  };
}
