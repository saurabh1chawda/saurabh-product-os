import { describe, expect, it } from "vitest";
import { CareerProfileId } from "@career-companion/career-knowledge";
import type { FilterGroup } from "@career-companion/retrieval";
import {
  InMemoryCareerProfileRepository,
  InMemoryPersistenceSession,
  InMemoryStoryRetrievalService,
  InMemoryUnitOfWork,
  VersionTokenFactory,
  createCareerKnowledgeFixtures,
  createCareerKnowledgeProjectionFixtures,
  createCareerProfileFixture
} from "../src";

describe("in-memory persistence", () => {
  it("commits and rolls back unit-of-work changes deterministically", () => {
    const session = new InMemoryPersistenceSession("session-1");
    const committed = new InMemoryUnitOfWork(session.context, "uow-commit");
    let committedValue = false;

    committed.stage("commit-change", () => {
      committedValue = true;
    });

    expect(committed.commit().state).toBe("committed");
    expect(committedValue).toBe(true);

    const rolledBack = new InMemoryUnitOfWork(session.context, "uow-rollback");
    let rolledBackValue = false;

    rolledBack.stage("rollback-change", () => {
      rolledBackValue = true;
    });

    expect(rolledBack.rollback("test rollback").state).toBe("rolled-back");
    expect(rolledBackValue).toBe(false);
  });
});

describe("in-memory repositories", () => {
  it("supports aggregate lifecycle operations through commit", () => {
    const session = new InMemoryPersistenceSession("repo-session");
    const unitOfWork = new InMemoryUnitOfWork(session.context, "repo-uow");
    const context = Object.freeze({
      persistenceContext: session.context,
      session,
      unitOfWork
    });
    const profile = createCareerProfileFixture();
    const repository = new InMemoryCareerProfileRepository();

    const saveResult = repository.save(profile, context);
    const existsBeforeCommit = repository.exists(profile.id, context);

    expect(saveResult.status).toBe("success");
    expect(existsBeforeCommit.status === "success" ? existsBeforeCommit.value : undefined).toBe(false);
    expect(unitOfWork.commit().state).toBe("committed");
    const existsAfterCommit = repository.exists(profile.id, context);
    expect(existsAfterCommit.status === "success" ? existsAfterCommit.value : undefined).toBe(true);

    const loaded = repository.getById(profile.id, context);
    expect(loaded.status).toBe("success");
    expect(loaded.status === "success" ? loaded.value.toSnapshot().displayName : undefined).toBe(
      "Career Companion Candidate"
    );
  });

  it("detects optimistic concurrency conflicts", () => {
    const session = new InMemoryPersistenceSession("conflict-session");
    const context = Object.freeze({
      persistenceContext: session.context,
      session
    });
    const profile = createCareerProfileFixture();
    const repository = new InMemoryCareerProfileRepository([profile]);

    const result = repository.save(profile, context, VersionTokenFactory.create(profile.id.toString(), 99));

    expect(result.status).toBe("conflict");
    expect(result.status === "conflict" ? result.actualVersion : undefined).toBe(1);
  });

  it("rolls back staged repository writes", () => {
    const session = new InMemoryPersistenceSession("rollback-session");
    const unitOfWork = new InMemoryUnitOfWork(session.context, "rollback-uow");
    const context = Object.freeze({
      persistenceContext: session.context,
      session,
      unitOfWork
    });
    const profile = createCareerProfileFixture();
    const repository = new InMemoryCareerProfileRepository();

    repository.save(profile, context);
    unitOfWork.rollback("do not persist");

    const existsAfterRollback = repository.exists(profile.id, context);
    expect(existsAfterRollback.status === "success" ? existsAfterRollback.value : undefined).toBe(false);
  });

  it("removes aggregates only when the removal intent is soft delete", () => {
    const session = new InMemoryPersistenceSession("remove-session");
    const context = Object.freeze({
      persistenceContext: session.context,
      session
    });
    const profile = createCareerProfileFixture();
    const repository = new InMemoryCareerProfileRepository([profile]);

    const archiveOnly = repository.remove(
      profile.id,
      Object.freeze({ mode: "archive-only", reason: "governance-cleanup" }),
      context
    );
    expect(archiveOnly.status).toBe("success");
    const existsAfterArchiveOnly = repository.exists(profile.id, context);
    expect(existsAfterArchiveOnly.status === "success" ? existsAfterArchiveOnly.value : undefined).toBe(true);

    const softDelete = repository.remove(
      profile.id,
      Object.freeze({ mode: "soft-delete", reason: "duplicate-record" }),
      context
    );
    expect(softDelete.status).toBe("success");
    const existsAfterSoftDelete = repository.exists(profile.id, context);
    expect(existsAfterSoftDelete.status === "success" ? existsAfterSoftDelete.value : undefined).toBe(false);
  });
});

describe("in-memory retrieval", () => {
  it("applies filtering, sorting, pagination, and projection deterministically", () => {
    const items = Object.freeze([
      Object.freeze({ id: "story-1", title: "Beta", score: 2, tags: Object.freeze(["ai", "platform"]) }),
      Object.freeze({ id: "story-2", title: "Alpha", score: 4, tags: Object.freeze(["growth"]) }),
      Object.freeze({ id: "story-3", title: "Gamma", score: 3, tags: Object.freeze(["ai"]) })
    ]);
    const service = new InMemoryStoryRetrievalService(items);
    const filters: FilterGroup = Object.freeze({
      operator: "and",
      filters: Object.freeze([]),
      rangeFilters: Object.freeze([{ field: "score", minimum: 2, maximum: 4, includeMinimum: true, includeMaximum: true }]),
      textFilters: Object.freeze([]),
      tagFilters: Object.freeze([{ field: "tags", tags: Object.freeze(["ai"]), matchMode: "any" as const }]),
      groups: Object.freeze([])
    });

    const result = service.retrieveStories({
      queryName: "story-selection",
      criteria: Object.freeze({}),
      filters,
      sorting: Object.freeze({ fields: Object.freeze([{ field: "score", direction: "descending" as const }]) }),
      pagination: Object.freeze({ pageNumber: 1, pageSize: 1 }),
      projection: Object.freeze({ fieldMask: Object.freeze({ fields: Object.freeze(["id", "title"]) }) })
    });

    expect(result.items).toEqual([Object.freeze({ id: "story-3", title: "Gamma" })]);
    expect(Object.isFrozen(result.items)).toBe(true);
    expect(result.references[0]?.referenceId).toBe("story-3");
  });
});

describe("in-memory fixtures", () => {
  it("creates deterministic aggregate and projection fixtures", () => {
    const first = createCareerKnowledgeFixtures();
    const second = createCareerKnowledgeFixtures();
    const projections = createCareerKnowledgeProjectionFixtures();

    expect(first.careerProfile.id.equals(new CareerProfileId("career-profile-fixture-1"))).toBe(true);
    expect(first.story.toSnapshot().title).toBe(second.story.toSnapshot().title);
    expect(Object.isFrozen(projections.stories)).toBe(true);
    expect(projections.professionalIdentities[0]?.name).toBe("AI Product Leader");
  });
});
