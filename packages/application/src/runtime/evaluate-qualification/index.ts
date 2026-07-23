import type { EvaluateQualificationCommand } from "../../commands";
import { createApplicationReference, RuntimeUseCase } from "../shared";
import type { RuntimeUseCaseDependencies, RuntimeUseCaseOutput } from "../shared";

export class EvaluateQualificationUseCase extends RuntimeUseCase<EvaluateQualificationCommand, unknown> {
  constructor(dependencies: RuntimeUseCaseDependencies<EvaluateQualificationCommand, unknown>) {
    super({
      useCaseName: "EvaluateQualificationUseCase",
      requiredReferences: (command) => [
        createApplicationReference("career-profile", command.payload.careerProfileId)
      ],
      retrievalRequests: (command) => [
        {
          requestName: "qualification-context",
          command,
          references: [command.payload.jobDescriptionReference, ...command.references]
        }
      ]
    }, dependencies);
  }
}

export type EvaluateQualificationUseCaseResult = RuntimeUseCaseOutput<unknown>;

