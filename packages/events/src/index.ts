export type EventVersion = number;

export type EventType = string;

export interface EventMetadata {
  readonly correlationId?: string;
  readonly causationId?: string;
  readonly actorId?: string;
  readonly source?: string;
  readonly occurredAt: string;
  readonly attributes?: Readonly<Record<string, unknown>>;
}

export interface DomainEvent<
  Payload extends Readonly<Record<string, unknown>> = Readonly<Record<string, unknown>>
> {
  readonly eventId: string;
  readonly type: EventType;
  readonly version: EventVersion;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly payload: Payload;
  readonly metadata: EventMetadata;
}

export interface EventEnvelope<
  Event extends DomainEvent = DomainEvent
> {
  readonly event: Event;
  readonly publishedAt?: string;
  readonly sequence?: number;
}

export interface EventPublisher<Event extends DomainEvent = DomainEvent> {
  publish(event: Event): Promise<void>;
  publishMany(events: readonly Event[]): Promise<void>;
}

export interface EventSubscriber {
  subscribe(eventType: EventType, subscriberId: string): Promise<void>;
  unsubscribe(eventType: EventType, subscriberId: string): Promise<void>;
}

export interface DomainEventFactory<Event extends DomainEvent = DomainEvent> {
  create(input: Omit<Event, "eventId" | "metadata"> & {
    readonly metadata: Omit<EventMetadata, "occurredAt"> & {
      readonly occurredAt?: string;
    };
  }): Event;
}
