import { describe, it } from "vitest";
import { GenerateLinkedInProfileUseCase } from "../../src";
import type { GenerateLinkedInProfileCommand } from "../../src";
import { createWorkflowHarness } from "./shared/workflow-builder";
import { expectSuccessfulWorkflow } from "./shared/workflow-assertions";
import { createGenerateLinkedInProfileCommand, createWorkflowContext, workflowReferences } from "./shared/workflow-fixtures";

describe("generate LinkedIn profile end-to-end workflow", () => {
  it("executes from command through runtime to typed application result", () => {
    const harness = createWorkflowHarness<GenerateLinkedInProfileCommand>();
    const useCase = new GenerateLinkedInProfileUseCase(harness.dependencies);
    const result = useCase.execute(
      createGenerateLinkedInProfileCommand(),
      createWorkflowContext("GenerateLinkedInProfileUseCase")
    );

    expectSuccessfulWorkflow(result, harness.trace, {
      useCaseName: "GenerateLinkedInProfileUseCase",
      retrievalRequest: "linkedin-positioning-context",
      repositoryLoads: [`career-profile:${workflowReferences.careerProfileId}`]
    });
  });
});
