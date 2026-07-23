import type { GenerateLinkedInProfileCommand } from "../../commands";
import { createApplicationReference, RuntimeUseCase } from "../shared";
import type { RuntimeUseCaseDependencies, RuntimeUseCaseOutput } from "../shared";

export class GenerateLinkedInProfileUseCase extends RuntimeUseCase<GenerateLinkedInProfileCommand, unknown> {
  constructor(dependencies: RuntimeUseCaseDependencies<GenerateLinkedInProfileCommand, unknown>) {
    super({
      useCaseName: "GenerateLinkedInProfileUseCase",
      requiredReferences: (command) => [
        createApplicationReference("career-profile", command.payload.careerProfileId)
      ],
      retrievalRequests: (command) => [
        {
          requestName: "linkedin-positioning-context",
          command,
          references: command.references
        }
      ]
    }, dependencies);
  }
}

export type GenerateLinkedInProfileUseCaseResult = RuntimeUseCaseOutput<unknown>;

