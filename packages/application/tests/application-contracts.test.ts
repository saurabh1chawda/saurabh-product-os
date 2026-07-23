import { describe, expect, expectTypeOf, it } from "vitest";

import type {
  ApplicationResult,
  CommandHandler,
  ExecutionContext,
  GenerateResumeCommand,
  QueryHandler,
  ResumeQuery,
  UseCase
} from "../src";

describe("application layer contracts", () => {
  it("supports immutable command and result models", () => {
    const command: GenerateResumeCommand = Object.freeze({
      commandId: "cmd-1",
      commandName: "generate-resume",
      payload: Object.freeze({
        careerProfileId: "career-profile-1",
        decisionReferences: Object.freeze([])
      }),
      references: Object.freeze([])
    });

    const result: ApplicationResult<string> = Object.freeze({
      status: "success",
      value: "resume-artifact-1",
      validation: Object.freeze({
        valid: true,
        errors: Object.freeze([]),
        warnings: Object.freeze([])
      }),
      execution: Object.freeze({
        startedAt: "2026-07-23T00:00:00.000Z",
        completedAt: "2026-07-23T00:00:01.000Z",
        status: "success"
      })
    });

    expect(Object.isFrozen(command)).toBe(true);
    expect(Object.isFrozen(command.payload)).toBe(true);
    expect(Object.isFrozen(result)).toBe(true);
    expect(result.status).toBe("success");
  });

  it("preserves command, query, handler, and use-case typing", () => {
    expectTypeOf<UseCase<GenerateResumeCommand, string>>().toHaveProperty("execute");
    expectTypeOf<CommandHandler<GenerateResumeCommand, string>>().toHaveProperty("handle");
    expectTypeOf<QueryHandler<ResumeQuery, string>>().toHaveProperty("handle");
    expectTypeOf<ExecutionContext>().toHaveProperty("correlation");
  });
});

