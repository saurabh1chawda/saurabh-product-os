import { describe, it } from "vitest";
import { PrepareInterviewUseCase } from "../../src";
import type { PrepareInterviewCommand } from "../../src";
import { createWorkflowHarness } from "./shared/workflow-builder";
import { expectSuccessfulWorkflow } from "./shared/workflow-assertions";
import { createPrepareInterviewCommand, createWorkflowContext, workflowReferences } from "./shared/workflow-fixtures";

describe("prepare interview end-to-end workflow", () => {
  it("executes from command through runtime to typed application result", () => {
    const harness = createWorkflowHarness<PrepareInterviewCommand>();
    const useCase = new PrepareInterviewUseCase(harness.dependencies);
    const result = useCase.execute(createPrepareInterviewCommand(), createWorkflowContext("PrepareInterviewUseCase"));

    expectSuccessfulWorkflow(result, harness.trace, {
      useCaseName: "PrepareInterviewUseCase",
      retrievalRequest: "interview-preparation-context",
      repositoryLoads: [
        `career-profile:${workflowReferences.careerProfileId}`,
        `opportunity:${workflowReferences.opportunityId}`
      ]
    });
  });
});
