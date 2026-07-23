import { describe, expect, it } from "vitest";
import { GenerateResumeUseCase } from "../../src";
import type { GenerateResumeCommand } from "../../src";
import { createWorkflowHarness } from "./shared/workflow-builder";
import { expectFailureWorkflow, expectSuccessfulWorkflow } from "./shared/workflow-assertions";
import { createGenerateResumeCommand, createWorkflowContext, workflowReferences } from "./shared/workflow-fixtures";

describe("generate resume end-to-end workflow", () => {
  it("executes from command through runtime to typed application result", () => {
    const harness = createWorkflowHarness<GenerateResumeCommand>();
    const useCase = new GenerateResumeUseCase(harness.dependencies);
    const result = useCase.execute(createGenerateResumeCommand(), createWorkflowContext("GenerateResumeUseCase"));

    expectSuccessfulWorkflow(result, harness.trace, {
      useCaseName: "GenerateResumeUseCase",
      retrievalRequest: "resume-supporting-context",
      repositoryLoads: [`career-profile:${workflowReferences.careerProfileId}`]
    });
  });

  it("returns a typed validation failure without opening runtime infrastructure", () => {
    const harness = createWorkflowHarness<GenerateResumeCommand>();
    const useCase = new GenerateResumeUseCase(harness.dependencies);
    const result = useCase.execute(createGenerateResumeCommand(""), createWorkflowContext("GenerateResumeUseCase"));

    expect(result.status).toBe("validation-failed");
    expect(result.validation.valid).toBe(false);
    expect(harness.trace.calls).toEqual([]);
  });

  it("rolls back and returns a typed failure when repository loading fails", () => {
    const harness = createWorkflowHarness<GenerateResumeCommand>({ repositoryFailure: true });
    const useCase = new GenerateResumeUseCase(harness.dependencies);
    const result = useCase.execute(createGenerateResumeCommand(), createWorkflowContext("GenerateResumeUseCase"));

    expectFailureWorkflow(result, harness.trace, {
      status: "failure",
      failureCode: "application.aggregate-not-found",
      rolledBack: true,
      decisionExecutions: 0
    });
  });

  it("rolls back and returns a typed failure when retrieval fails", () => {
    const harness = createWorkflowHarness<GenerateResumeCommand>({ retrievalFailure: true });
    const useCase = new GenerateResumeUseCase(harness.dependencies);
    const result = useCase.execute(createGenerateResumeCommand(), createWorkflowContext("GenerateResumeUseCase"));

    expectFailureWorkflow(result, harness.trace, {
      status: "failure",
      failureCode: "application.runtime-failure",
      rolledBack: true,
      decisionExecutions: 0
    });
  });

  it("rolls back and returns a typed failure when decision execution fails", () => {
    const harness = createWorkflowHarness<GenerateResumeCommand>({ decisionFailure: true });
    const useCase = new GenerateResumeUseCase(harness.dependencies);
    const result = useCase.execute(createGenerateResumeCommand(), createWorkflowContext("GenerateResumeUseCase"));

    expectFailureWorkflow(result, harness.trace, {
      status: "failure",
      failureCode: "application.runtime-failure",
      rolledBack: true,
      decisionExecutions: 1
    });
  });

  it("rolls back and returns a typed failure when persistence commit fails", () => {
    const harness = createWorkflowHarness<GenerateResumeCommand>({ persistenceFailure: true });
    const useCase = new GenerateResumeUseCase(harness.dependencies);
    const result = useCase.execute(createGenerateResumeCommand(), createWorkflowContext("GenerateResumeUseCase"));

    expectFailureWorkflow(result, harness.trace, {
      status: "failure",
      failureCode: "application.commit-failed",
      rolledBack: true,
      decisionExecutions: 1
    });
  });
});
