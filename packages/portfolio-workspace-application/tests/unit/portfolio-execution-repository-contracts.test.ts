import { describe, expect, it } from "vitest";
import { ExecutionId, PortfolioExecution } from "@career-companion/portfolio-workspace";
import {
  LoadedPortfolioExecution,
  PortfolioExecutionAlreadyExistsError,
  PortfolioExecutionConcurrencyConflictError,
  PortfolioExecutionPersistenceMappingError,
  PortfolioExecutionPersistenceUnavailableError,
  PortfolioExecutionRepositoryError,
  PortfolioExecutionRevision,
  PortfolioExecutionSaveResult,
  UnsupportedPortfolioExecutionRecordVersionError
} from "../../src";

describe("PortfolioExecution durable repository contracts", () => {
  it("represents persistence revision as immutable positive integer metadata", async () => {
    const revision = new PortfolioExecutionRevision(1);
    const equivalent = new PortfolioExecutionRevision(1);

    expect(Object.isFrozen(revision)).toBe(true);
    expect(revision.value).toBe(1);
    expect(revision.toJSON()).toBe(1);
    expect(revision.equals(equivalent)).toBe(true);
    expect(revision.next().toJSON()).toBe(2);
    expect(() => new PortfolioExecutionRevision(0)).toThrow("positive integer");
    expect(() => new PortfolioExecutionRevision(-1)).toThrow("positive integer");
    expect(() => new PortfolioExecutionRevision(1.5)).toThrow("positive integer");
  });

  it("keeps loaded aggregate envelopes immutable and free of persistence records", async () => {
    const execution = Object.create(PortfolioExecution.prototype) as PortfolioExecution;
    const loaded = new LoadedPortfolioExecution({
      execution,
      revision: new PortfolioExecutionRevision(3)
    });

    expect(Object.isFrozen(loaded)).toBe(true);
    expect(loaded.execution).toBe(execution);
    expect(loaded.revision.toJSON()).toBe(3);
    expect(loaded).not.toHaveProperty("record");
    expect(loaded).not.toHaveProperty("row");
    expect(loaded).not.toHaveProperty("payload");
    expect(loaded).not.toHaveProperty("sql");
    expect(loaded).not.toHaveProperty("transaction");
  });

  it("returns only the advanced revision from save results", async () => {
    const result = new PortfolioExecutionSaveResult({
      revision: new PortfolioExecutionRevision(4)
    });

    expect(Object.isFrozen(result)).toBe(true);
    expect(result.toJSON()).toEqual({ revision: 4 });
    expect(result.equals(new PortfolioExecutionSaveResult({
      revision: new PortfolioExecutionRevision(4)
    }))).toBe(true);
    expect(result).not.toHaveProperty("execution");
    expect(result).not.toHaveProperty("fact");
    expect(result).not.toHaveProperty("projection");
    expect(result).not.toHaveProperty("row");
    expect(result).not.toHaveProperty("affectedRows");
  });

  it("defines safe technology-neutral repository failures", async () => {
    const executionId = new ExecutionId("execution:errors");
    const conflict = new PortfolioExecutionConcurrencyConflictError({
      executionId,
      expectedRevision: new PortfolioExecutionRevision(2),
      actualRevision: new PortfolioExecutionRevision(3)
    });
    const alreadyExists = new PortfolioExecutionAlreadyExistsError({
      executionId,
      currentRevision: new PortfolioExecutionRevision(1)
    });
    const unavailable = new PortfolioExecutionPersistenceUnavailableError();
    const mapping = new PortfolioExecutionPersistenceMappingError();
    const unsupported = new UnsupportedPortfolioExecutionRecordVersionError(99);

    for (const error of [conflict, alreadyExists, unavailable, mapping, unsupported]) {
      expect(error).toBeInstanceOf(PortfolioExecutionRepositoryError);
      expect(Object.isFrozen(error)).toBe(true);
      expect(error.toJSON()).not.toHaveProperty("sqlState");
      expect(error.toJSON()).not.toHaveProperty("tableName");
      expect(error.toJSON()).not.toHaveProperty("connectionString");
      expect(error.toJSON()).not.toHaveProperty("driver");
    }

    expect(conflict.toJSON()).toEqual({
      name: "PortfolioExecutionConcurrencyConflictError",
      code: "PORTFOLIO_EXECUTION_CONCURRENCY_CONFLICT",
      executionId: "execution:errors",
      expectedRevision: 2,
      actualRevision: 3
    });
    expect(alreadyExists.toJSON()).toEqual({
      name: "PortfolioExecutionAlreadyExistsError",
      code: "PORTFOLIO_EXECUTION_ALREADY_EXISTS",
      executionId: "execution:errors",
      currentRevision: 1
    });
    expect(unavailable.code).toBe("PORTFOLIO_EXECUTION_PERSISTENCE_UNAVAILABLE");
    expect(mapping.code).toBe("PORTFOLIO_EXECUTION_PERSISTENCE_MAPPING_ERROR");
    expect(unsupported.toJSON()).toEqual({
      name: "UnsupportedPortfolioExecutionRecordVersionError",
      code: "UNSUPPORTED_PORTFOLIO_EXECUTION_RECORD_VERSION",
      recordVersion: 99
    });
  });
});
