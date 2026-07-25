import { IntelligenceAggregator } from "../aggregation";
import type { DecisionContext, ProductIntelligenceSet } from "../models";

export class DecisionContextAnalyzer {
  private readonly aggregator = new IntelligenceAggregator();

  analyze(input: ProductIntelligenceSet): DecisionContext {
    return this.aggregator.aggregate(input);
  }
}
