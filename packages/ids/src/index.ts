export type Brand<Value, Name extends string> = Value & {
  readonly __brand: Name;
};

export interface Identifier<Name extends string = string> {
  readonly value: string;
  readonly kind: Name;
}

export interface IdentifierFactory<Id extends string> {
  from(value: string): Id;
  is(value: string): value is Id;
}

export type WorkflowId = Brand<string, "WorkflowId">;
export type CapabilityId = Brand<string, "CapabilityId">;
export type ExecutionId = Brand<string, "ExecutionId">;
export type ArtifactId = Brand<string, "ArtifactId">;
export type EvidenceId = Brand<string, "EvidenceId">;
export type CompetencyId = Brand<string, "CompetencyId">;
export type StoryId = Brand<string, "StoryId">;
export type MetricId = Brand<string, "MetricId">;
export type ProfessionalIdentityId = Brand<string, "ProfessionalIdentityId">;
export type CareerProfileId = Brand<string, "CareerProfileId">;
export type DomainEventId = Brand<string, "DomainEventId">;
export type AggregateId = Brand<string, "AggregateId">;
export type EntityId = Brand<string, "EntityId">;
