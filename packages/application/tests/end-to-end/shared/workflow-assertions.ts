import { expect } from "vitest";
import type { ApplicationResult } from "../../../src";
import type { RuntimeUseCaseOutput } from "../../../src";
import type { WorkflowDecisionOutput, WorkflowTrace } from "./workflow-builder";

export function expectSuccessfulWorkflow(
  result: ApplicationResult<RuntimeUseCaseOutput<unknown>>,
  trace: WorkflowTrace,
  input: {
    readonly useCaseName: string;
    readonly retrievalRequest: string;
    readonly repositoryLoads: readonly string[];
  }
): void {
  expect(result.status).toBe("success");
  expect(result.validation.valid).toBe(true);
  expect(result.execution.status).toBe("success");
  expect(trace.decisionExecutions).toBe(1);
  expect(trace.committed).toBe(true);
  expect(trace.rolledBack).toBe(false);
  expect(trace.repositoryLoads).toEqual(input.repositoryLoads);
  expect(trace.retrievalRequests).toEqual([input.retrievalRequest]);
  expect(trace.calls).toEqual([
    "session.open",
    "unit.create",
    ...input.repositoryLoads.map((load) => `repository:${load}`),
    `retrieval:${input.retrievalRequest}`,
    "decision.execute",
    `unit.save:${input.useCaseName}`,
    "unit.commit"
  ]);

  const output = result.status === "success"
    ? result.value as RuntimeUseCaseOutput<WorkflowDecisionOutput> | undefined
    : undefined;

  if (output !== undefined) {
    expect(output.useCaseName).toBe(input.useCaseName);
    expect(output.retrievalCount).toBe(1);
    expect(output.decisionResult.output).toEqual({
      accepted: true,
      pipelineName: "WorkflowE2EPipeline",
      aggregateLoadCount: 0,
      retrievalCount: 1
    } satisfies WorkflowDecisionOutput);
    expect(output.decisionResult.trace.executionTimestamp).toBe("2026-07-23T00:00:00.000Z");
  }
}

export function expectFailureWorkflow(
  result: ApplicationResult<RuntimeUseCaseOutput<unknown>>,
  trace: WorkflowTrace,
  input: {
    readonly status: ApplicationResult<unknown>["status"];
    readonly failureCode: string;
    readonly rolledBack: boolean;
    readonly decisionExecutions: number;
  }
): void {
  expect(result.status).toBe(input.status);
  expect(result.failure?.code).toBe(input.failureCode);
  expect(trace.decisionExecutions).toBe(input.decisionExecutions);
  expect(trace.rolledBack).toBe(input.rolledBack);
  expect(trace.committed).toBe(false);
}
