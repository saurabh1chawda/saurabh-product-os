import { describe, it } from "vitest";
import { GeneratePortfolioUseCase } from "../../src";
import type { GeneratePortfolioCommand } from "../../src";
import { createWorkflowHarness } from "./shared/workflow-builder";
import { expectSuccessfulWorkflow } from "./shared/workflow-assertions";
import { createGeneratePortfolioCommand, createWorkflowContext, workflowReferences } from "./shared/workflow-fixtures";

describe("generate portfolio end-to-end workflow", () => {
  it("executes from command through runtime to typed application result", () => {
    const harness = createWorkflowHarness<GeneratePortfolioCommand>();
    const useCase = new GeneratePortfolioUseCase(harness.dependencies);
    const result = useCase.execute(createGeneratePortfolioCommand(), createWorkflowContext("GeneratePortfolioUseCase"));

    expectSuccessfulWorkflow(result, harness.trace, {
      useCaseName: "GeneratePortfolioUseCase",
      retrievalRequest: "portfolio-supporting-context",
      repositoryLoads: [
        `career-profile:${workflowReferences.careerProfileId}`,
        `portfolio-asset:${workflowReferences.portfolioAssetId}`
      ]
    });
  });
});
