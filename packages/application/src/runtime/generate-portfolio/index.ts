import type { GeneratePortfolioCommand } from "../../commands";
import { createApplicationReference, RuntimeUseCase } from "../shared";
import type { RuntimeUseCaseDependencies, RuntimeUseCaseOutput } from "../shared";

export class GeneratePortfolioUseCase extends RuntimeUseCase<GeneratePortfolioCommand, unknown> {
  constructor(dependencies: RuntimeUseCaseDependencies<GeneratePortfolioCommand, unknown>) {
    super({
      useCaseName: "GeneratePortfolioUseCase",
      requiredReferences: (command) => [
        createApplicationReference("career-profile", command.payload.careerProfileId),
        ...command.payload.portfolioAssetIds.map((id) => createApplicationReference("portfolio-asset", id))
      ],
      retrievalRequests: (command) => [
        {
          requestName: "portfolio-supporting-context",
          command,
          references: command.references
        }
      ]
    }, dependencies);
  }
}

export type GeneratePortfolioUseCaseResult = RuntimeUseCaseOutput<unknown>;

