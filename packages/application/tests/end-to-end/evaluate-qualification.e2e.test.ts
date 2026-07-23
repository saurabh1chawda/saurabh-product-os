import { describe, it } from "vitest";
import { EvaluateQualificationUseCase } from "../../src";
import type { EvaluateQualificationCommand } from "../../src";
import { createWorkflowHarness } from "./shared/workflow-builder";
import { expectSuccessfulWorkflow } from "./shared/workflow-assertions";
import { createEvaluateQualificationCommand, createWorkflowContext, workflowReferences } from "./shared/workflow-fixtures";

describe("evaluate qualification end-to-end workflow", () => {
  it("executes from command through runtime to typed application result", () => {
    const harness = createWorkflowHarness<EvaluateQualificationCommand>();
    const useCase = new EvaluateQualificationUseCase(harness.dependencies);
    const result = useCase.execute(
      createEvaluateQualificationCommand(),
      createWorkflowContext("EvaluateQualificationUseCase")
    );

    expectSuccessfulWorkflow(result, harness.trace, {
      useCaseName: "EvaluateQualificationUseCase",
      retrievalRequest: "qualification-context",
      repositoryLoads: [`career-profile:${workflowReferences.careerProfileId}`]
    });
  });
});
