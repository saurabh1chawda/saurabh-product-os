import type { GenerateResumeCommand } from "../../commands";
import { createApplicationReference, RuntimeUseCase } from "../shared";
import type { RuntimeUseCaseDependencies, RuntimeUseCaseOutput } from "../shared";

export class GenerateResumeUseCase extends RuntimeUseCase<GenerateResumeCommand, unknown> {
  constructor(dependencies: RuntimeUseCaseDependencies<GenerateResumeCommand, unknown>) {
    super({
      useCaseName: "GenerateResumeUseCase",
      requiredReferences: (command) => [
        createApplicationReference("career-profile", command.payload.careerProfileId)
      ],
      retrievalRequests: (command) => [
        {
          requestName: "resume-supporting-context",
          command,
          references: command.references
        }
      ]
    }, dependencies);
  }
}

export type GenerateResumeUseCaseResult = RuntimeUseCaseOutput<unknown>;

