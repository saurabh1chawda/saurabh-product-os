import type {
  AnalyzeJobDescriptionCommand,
  EvaluateQualificationCommand,
  GenerateLinkedInProfileCommand,
  GeneratePortfolioCommand,
  GenerateResumeCommand,
  PrepareInterviewCommand,
  UseCaseContext
} from "../../../src";
import { fixtureIds } from "@career-companion/infrastructure-memory";

export const workflowReferences = Object.freeze({
  careerProfileId: fixtureIds.careerProfile.toString(),
  portfolioAssetId: fixtureIds.portfolioAsset.toString(),
  opportunityId: "opportunity-fixture-1",
  jobDescriptionId: "job-description-fixture-1",
  interviewContextId: "interview-context-fixture-1"
});

export function createWorkflowContext(useCaseName: string): UseCaseContext {
  return Object.freeze({
    actor: Object.freeze({
      actorId: "workflow-e2e-actor",
      actorType: "system",
      roles: Object.freeze(["tester"])
    }),
    request: Object.freeze({
      requestId: `${useCaseName}:request`,
      requestedAt: "2026-07-23T00:00:00.000Z",
      source: "end-to-end-test"
    }),
    correlation: Object.freeze({
      correlationId: `${useCaseName}:correlation`,
      traceId: `${useCaseName}:trace`
    }),
    execution: Object.freeze({
      useCaseName
    })
  });
}

export function createGenerateResumeCommand(commandId = "generate-resume-command"): GenerateResumeCommand {
  return Object.freeze({
    commandId,
    commandName: "generate-resume",
    payload: Object.freeze({
      careerProfileId: workflowReferences.careerProfileId,
      targetOpportunityId: workflowReferences.opportunityId,
      decisionReferences: Object.freeze([])
    }),
    references: Object.freeze([])
  });
}

export function createGeneratePortfolioCommand(commandId = "generate-portfolio-command"): GeneratePortfolioCommand {
  return Object.freeze({
    commandId,
    commandName: "generate-portfolio",
    payload: Object.freeze({
      careerProfileId: workflowReferences.careerProfileId,
      portfolioAssetIds: Object.freeze([workflowReferences.portfolioAssetId]),
      decisionReferences: Object.freeze([])
    }),
    references: Object.freeze([])
  });
}

export function createPrepareInterviewCommand(commandId = "prepare-interview-command"): PrepareInterviewCommand {
  return Object.freeze({
    commandId,
    commandName: "prepare-interview",
    payload: Object.freeze({
      careerProfileId: workflowReferences.careerProfileId,
      opportunityId: workflowReferences.opportunityId,
      interviewContextReference: Object.freeze({
        referenceType: "interview-context",
        referenceId: workflowReferences.interviewContextId
      })
    }),
    references: Object.freeze([])
  });
}

export function createAnalyzeJobDescriptionCommand(
  commandId = "analyze-job-description-command"
): AnalyzeJobDescriptionCommand {
  return Object.freeze({
    commandId,
    commandName: "analyze-job-description",
    payload: Object.freeze({
      careerProfileId: workflowReferences.careerProfileId,
      jobDescriptionReference: Object.freeze({
        referenceType: "job-description",
        referenceId: workflowReferences.jobDescriptionId
      })
    }),
    references: Object.freeze([])
  });
}

export function createEvaluateQualificationCommand(commandId = "evaluate-qualification-command"): EvaluateQualificationCommand {
  return Object.freeze({
    commandId,
    commandName: "evaluate-qualification",
    payload: Object.freeze({
      careerProfileId: workflowReferences.careerProfileId,
      jobDescriptionReference: Object.freeze({
        referenceType: "job-description",
        referenceId: workflowReferences.jobDescriptionId
      })
    }),
    references: Object.freeze([])
  });
}

export function createGenerateLinkedInProfileCommand(
  commandId = "generate-linkedin-profile-command"
): GenerateLinkedInProfileCommand {
  return Object.freeze({
    commandId,
    commandName: "generate-linkedin-profile",
    payload: Object.freeze({
      careerProfileId: workflowReferences.careerProfileId,
      positioningDecisionReferences: Object.freeze([])
    }),
    references: Object.freeze([])
  });
}
