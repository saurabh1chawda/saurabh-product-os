import { describe, it } from "vitest";
import { AnalyzeJobDescriptionUseCase } from "../../src";
import type { AnalyzeJobDescriptionCommand } from "../../src";
import { createWorkflowHarness } from "./shared/workflow-builder";
import { expectSuccessfulWorkflow } from "./shared/workflow-assertions";
import { createAnalyzeJobDescriptionCommand, createWorkflowContext, workflowReferences } from "./shared/workflow-fixtures";

describe("analyze job description end-to-end workflow", () => {
  it("executes from command through runtime to typed application result", () => {
    const harness = createWorkflowHarness<AnalyzeJobDescriptionCommand>();
    const useCase = new AnalyzeJobDescriptionUseCase(harness.dependencies);
    const result = useCase.execute(
      createAnalyzeJobDescriptionCommand(),
      createWorkflowContext("AnalyzeJobDescriptionUseCase")
    );

    expectSuccessfulWorkflow(result, harness.trace, {
      useCaseName: "AnalyzeJobDescriptionUseCase",
      retrievalRequest: "job-description-context",
      repositoryLoads: [`career-profile:${workflowReferences.careerProfileId}`]
    });
  });
});
