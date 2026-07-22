import {
  DomainRuleViolation,
  Result,
  UniqueIdentifier,
  ValueObject
} from "@career-companion/kernel";
import type { DomainEvent, DomainMetadata, Version } from "@career-companion/kernel";

export type Brand<Value, Name extends string> = Value & {
  readonly __brand: Name;
};

export type ISODateString = Brand<string, "ISODateString">;
export type UrlString = Brand<string, "UrlString">;

export interface NamedReference<Id extends UniqueIdentifier = UniqueIdentifier> {
  readonly id: Id;
  readonly label?: string;
}

export interface VersionedReference<Id extends UniqueIdentifier = UniqueIdentifier> extends NamedReference<Id> {
  readonly version?: Version;
}

export interface EvidenceBackedReference {
  readonly evidenceReferenceIds: readonly EvidenceReferenceId[];
}

export class CareerProfileId extends UniqueIdentifier {}
export class EmploymentRecordId extends UniqueIdentifier {}
export class AchievementId extends UniqueIdentifier {}
export class CompetencyId extends UniqueIdentifier {}
export class SkillId extends UniqueIdentifier {}
export class TechnologyId extends UniqueIdentifier {}
export class ProjectId extends UniqueIdentifier {}
export class PortfolioAssetId extends UniqueIdentifier {}
export class EducationId extends UniqueIdentifier {}
export class CertificationId extends UniqueIdentifier {}
export class EvidenceReferenceId extends UniqueIdentifier {}
export class MetricId extends UniqueIdentifier {}
export class StoryId extends UniqueIdentifier {}
export class ProfessionalIdentityId extends UniqueIdentifier {}
export class CapabilityEvidenceId extends UniqueIdentifier {}

export type VerificationStatus = "unverified" | "candidate" | "verified" | "rejected";

export type EvidenceStrength = "primary" | "supporting" | "contextual";

export type DomainErrorCode =
  | "missing-required-field"
  | "invalid-reference"
  | "invalid-date-range"
  | "invalid-metric-value"
  | "unsupported-claim"
  | "unverified-evidence";

export interface DomainError {
  readonly code: DomainErrorCode;
  readonly message: string;
  readonly field?: string;
}

export type LifecycleStatus = "draft" | "active" | "published" | "archived" | "inactive";

export class DateRange extends ValueObject<{
  readonly startDate: ISODateString;
  readonly endDate?: ISODateString;
  readonly isCurrent?: boolean;
}> {
  private constructor(
    readonly startDate: ISODateString,
    readonly endDate?: ISODateString,
    readonly isCurrent?: boolean
  ) {
    super({ startDate, endDate, isCurrent });
  }

  static create(input: {
    readonly startDate: ISODateString;
    readonly endDate?: ISODateString;
    readonly isCurrent?: boolean;
  }): Result<DateRange, DomainError> {
    if (input.endDate !== undefined && input.endDate < input.startDate) {
      return Result.failure({
        code: "invalid-date-range",
        message: "End date cannot precede start date.",
        field: "endDate"
      });
    }

    return Result.success(new DateRange(input.startDate, input.endDate, input.isCurrent));
  }
}

export function requireNonEmpty(value: string, field: string): void {
  if (value.trim().length === 0) {
    throw new DomainRuleViolation("career-knowledge.required", `${field} is required.`, { field });
  }
}

export function addUniqueId<Id extends UniqueIdentifier>(
  ids: readonly Id[],
  id: Id,
  duplicateMessage: string
): Result<readonly Id[], DomainError> {
  if (ids.some((existing) => existing.equals(id))) {
    return Result.failure({
      code: "invalid-reference",
      message: duplicateMessage
    });
  }

  return Result.success([...ids, id]);
}

export function removeExistingId<Id extends UniqueIdentifier>(
  ids: readonly Id[],
  id: Id,
  missingMessage: string
): Result<readonly Id[], DomainError> {
  if (!ids.some((existing) => existing.equals(id))) {
    return Result.failure({
      code: "invalid-reference",
      message: missingMessage
    });
  }

  return Result.success(ids.filter((existing) => !existing.equals(id)));
}

export function hasId<Id extends UniqueIdentifier>(ids: readonly Id[], id: Id): boolean {
  return ids.some((existing) => existing.equals(id));
}

export function createCareerKnowledgeEvent(
  eventType: string,
  aggregateId: UniqueIdentifier,
  aggregateVersion: Version,
  payload?: DomainMetadata
): DomainEvent {
  return {
    eventId: `${eventType}:${aggregateId.toString()}:${aggregateVersion}`,
    eventType,
    aggregateId: aggregateId.toString(),
    aggregateVersion,
    occurredAt: new Date().toISOString(),
    payload
  };
}
