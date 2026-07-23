import { describe, expect, it } from "vitest";

import type {
  RepositoryConflict,
  RepositoryFailure,
  RepositoryMetadata,
  RepositoryNotFound,
  RepositorySuccess
} from "../src";

describe("repository result contracts", () => {
  const metadata: RepositoryMetadata = Object.freeze({
    operationId: "repo-op-1",
    repositoryName: "CareerProfileRepository",
    aggregateType: "CareerProfile",
    occurredAt: "2026-07-23T00:00:00.000Z"
  });

  it("discriminates success, not found, conflict, and failure results", () => {
    const success: RepositorySuccess<string> = Object.freeze({
      status: "success",
      value: "career-profile-1",
      metadata
    });
    const notFound: RepositoryNotFound<string> = Object.freeze({
      status: "not-found",
      id: "career-profile-2",
      metadata
    });
    const conflict: RepositoryConflict<string> = Object.freeze({
      status: "conflict",
      id: "career-profile-3",
      expectedVersion: 1,
      actualVersion: 2,
      metadata
    });
    const failure: RepositoryFailure = Object.freeze({
      status: "failure",
      code: "repository.failure",
      message: "Repository operation failed.",
      metadata
    });

    expect(success.status).toBe("success");
    expect(notFound.status).toBe("not-found");
    expect(conflict.status).toBe("conflict");
    expect(failure.status).toBe("failure");
  });

  it("supports immutable metadata and version-token references", () => {
    const result: RepositoryConflict<string> = Object.freeze({
      status: "conflict",
      id: "achievement-1",
      versionToken: Object.freeze({
        value: "achievement-1:3",
        version: 3
      }),
      metadata
    });

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.versionToken)).toBe(true);
    expect(result.versionToken?.version).toBe(3);
  });
});

