import type { PortfolioModel, PortfolioSourceData } from "../models";

export interface PortfolioAnalyzerContract {
  analyze(input: PortfolioAnalyzerInput): PortfolioModel;
}

export interface PortfolioAnalyzerInput {
  readonly source: PortfolioSourceData;
}
