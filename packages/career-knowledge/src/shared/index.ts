export type Brand<Value, Name extends string> = Value & {
  readonly __brand: Name;
};

export type Identifier<Name extends string> = Brand<string, Name>;

export type ISODateString = Brand<string, "ISODateString">;
export type UrlString = Brand<string, "UrlString">;
export type Version = Brand<string, "Version">;

export interface DateRange {
  readonly startDate: ISODateString;
  readonly endDate?: ISODateString;
  readonly isCurrent?: boolean;
}

export interface NamedReference<Id extends string = string> {
  readonly id: Id;
  readonly label?: string;
}

export interface VersionedReference<Id extends string = string> extends NamedReference<Id> {
  readonly version?: Version;
}

export interface EvidenceBackedReference {
  readonly evidenceReferenceIds: readonly EvidenceReferenceId[];
}

export type CareerProfileId = Identifier<"CareerProfileId">;
export type EmploymentRecordId = Identifier<"EmploymentRecordId">;
export type AchievementId = Identifier<"AchievementId">;
export type CompetencyId = Identifier<"CompetencyId">;
export type SkillId = Identifier<"SkillId">;
export type TechnologyId = Identifier<"TechnologyId">;
export type ProjectId = Identifier<"ProjectId">;
export type PortfolioAssetId = Identifier<"PortfolioAssetId">;
export type EducationId = Identifier<"EducationId">;
export type CertificationId = Identifier<"CertificationId">;
export type EvidenceReferenceId = Identifier<"EvidenceReferenceId">;

export type VerificationStatus = "unverified" | "candidate" | "verified" | "rejected";

export type EvidenceStrength = "primary" | "supporting" | "contextual";

export type DomainErrorCode =
  | "missing-required-field"
  | "invalid-reference"
  | "invalid-date-range"
  | "unsupported-claim"
  | "unverified-evidence";

export interface DomainError {
  readonly code: DomainErrorCode;
  readonly message: string;
  readonly field?: string;
}
