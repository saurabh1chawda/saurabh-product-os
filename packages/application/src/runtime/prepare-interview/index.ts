import type { PrepareInterviewCommand } from "../../commands";
import { createApplicationReference, RuntimeUseCase } from "../shared";
import type { RuntimeUseCaseDependencies, RuntimeUseCaseOutput } from "../shared";

export class PrepareInterviewUseCase extends RuntimeUseCase<PrepareInterviewCommand, unknown> {
  constructor(dependencies: RuntimeUseCaseDependencies<PrepareInterviewCommand, unknown>) {
    super({
      useCaseName: "PrepareInterviewUseCase",
      requiredReferences: (command) => [
        createApplicationReference("career-profile", command.payload.careerProfileId),
        createApplicationReference("opportunity", command.payload.opportunityId)
      ],
      retrievalRequests: (command) => [
        {
          requestName: "interview-preparation-context",
          command,
          references: command.payload.interviewContextReference === undefined
            ? command.references
            : [command.payload.interviewContextReference, ...command.references]
        }
      ]
    }, dependencies);
  }
}

export type PrepareInterviewUseCaseResult = RuntimeUseCaseOutput<unknown>;

