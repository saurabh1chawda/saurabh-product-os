import type { DomainEvent } from "../contracts";
import { Entity } from "../entity";
import type { UniqueIdentifier, Version } from "../primitives";

export abstract class AggregateRoot<
  Id extends UniqueIdentifier = UniqueIdentifier
> extends Entity<Id> {
  readonly version: Version;
  private readonly registeredEvents: DomainEvent[] = [];

  protected constructor(id: Id, version: Version = 0) {
    super(id);
    this.version = version;
  }

  get domainEvents(): readonly DomainEvent[] {
    return [...this.registeredEvents];
  }

  protected registerEvent(event: DomainEvent): void {
    this.registeredEvents.push(event);
  }

  clearEvents(): void {
    this.registeredEvents.length = 0;
  }
}
