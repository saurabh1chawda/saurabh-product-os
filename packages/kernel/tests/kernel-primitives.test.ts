import { describe, expect, it } from "vitest";
import {
  AggregateRoot,
  Guard,
  ImmutableCollection,
  Result,
  UniqueIdentifier,
  ValueObject
} from "../src";
import type { DomainEvent, Specification } from "../src";

class TestValueObject extends ValueObject<{ readonly name: string; readonly count: number }> {
  constructor(name: string, count: number) {
    super({ name, count });
  }
}

class TestAggregate extends AggregateRoot<UniqueIdentifier> {
  constructor(id: UniqueIdentifier, version = 0) {
    super(id, version);
  }

  record(event: DomainEvent): void {
    this.registerEvent(event);
  }
}

describe("kernel primitives", () => {
  it("represents successful and failed results without throwing", () => {
    const success = Result.success("ok");
    const failure = Result.failure("not-ok");

    expect(success.isSuccess).toBe(true);
    expect(success.isFailure).toBe(false);
    expect(success.value).toBe("ok");
    expect(failure.isSuccess).toBe(false);
    expect(failure.isFailure).toBe(true);
    expect(failure.error).toBe("not-ok");
  });

  it("validates required values through guards", () => {
    expect(Guard.isDefined("value", "field").isSuccess).toBe(true);
    expect(Guard.isDefined(undefined, "field").error).toEqual({
      argumentName: "field",
      message: "field must be defined."
    });
    expect(Guard.isNonEmptyString("  ", "name").isFailure).toBe(true);
    expect(Guard.isTrue(false, "condition").isFailure).toBe(true);
  });

  it("compares value objects structurally", () => {
    expect(new TestValueObject("alpha", 1).equals(new TestValueObject("alpha", 1))).toBe(true);
    expect(new TestValueObject("alpha", 1).equals(new TestValueObject("beta", 1))).toBe(false);
  });

  it("compares identifiers and rejects empty identifiers", () => {
    expect(new UniqueIdentifier("id-1").equals(new UniqueIdentifier("id-1"))).toBe(true);
    expect(new UniqueIdentifier("id-1").equals(new UniqueIdentifier("id-2"))).toBe(false);
    expect(() => new UniqueIdentifier(" ")).toThrow("UniqueIdentifier cannot be empty.");
  });

  it("registers aggregate events while protecting the internal event collection", () => {
    const aggregate = new TestAggregate(new UniqueIdentifier("agg-1"), 2);
    aggregate.record({
      eventId: "event-1",
      eventType: "ThingHappened",
      occurredAt: "2026-07-23T00:00:00.000Z"
    });

    const events = aggregate.domainEvents;
    expect(aggregate.version).toBe(2);
    expect(events).toHaveLength(1);

    (events as DomainEvent[]).length = 0;
    expect(aggregate.domainEvents).toHaveLength(1);

    aggregate.clearEvents();
    expect(aggregate.domainEvents).toHaveLength(0);
  });

  it("returns defensive arrays from immutable collections", () => {
    const collection = new ImmutableCollection([1, 2, 3]);
    const array = collection.toArray();

    (array as number[]).push(4);

    expect(collection.length).toBe(3);
    expect(collection.at(0)).toBe(1);
    expect(collection.map((item) => item * 2)).toEqual([2, 4, 6]);
    expect(collection.filter((item) => item > 1).toArray()).toEqual([2, 3]);
    expect([...collection]).toEqual([1, 2, 3]);
  });

  it("supports deterministic specifications", () => {
    const positive: Specification<number> = {
      isSatisfiedBy: (candidate) => candidate > 0
    };

    expect(positive.isSatisfiedBy(1)).toBe(true);
    expect(positive.isSatisfiedBy(0)).toBe(false);
  });
});
