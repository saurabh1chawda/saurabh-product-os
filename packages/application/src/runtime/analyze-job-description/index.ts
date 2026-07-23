import type { AnalyzeJobDescriptionCommand } from "../../commands";
import { createApplicationReference, RuntimeUseCase } from "../shared";
import type { RuntimeUseCaseDependencies, RuntimeUseCaseOutput } from "../shared";

export class AnalyzeJobDescriptionUseCase extends RuntimeUseCase<AnalyzeJobDescriptionCommand, unknown> {
  constructor(dependencies: RuntimeUseCaseDependencies<AnalyzeJobDescriptionCommand, unknown>) {
    super({
      useCaseName: "AnalyzeJobDescriptionUseCase",
      requiredReferences: (command) => command.payload.careerProfileId === undefined
        ? []
        : [createApplicationReference("career-profile", command.payload.careerProfileId)],
      retrievalRequests: (command) => [
        {
          requestName: "job-description-context",
          command,
          references: [command.payload.jobDescriptionReference, ...command.references]
        }
      ]
    }, dependencies);
  }
}

export type AnalyzeJobDescriptionUseCaseResult = RuntimeUseCaseOutput<unknown>;

