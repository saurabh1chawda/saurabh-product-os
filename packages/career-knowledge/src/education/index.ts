import { AggregateRoot, Result } from "@career-companion/kernel";
import { EducationId, requireNonEmpty } from "../shared";
import type { DateRange, EvidenceReferenceId, LifecycleStatus, VerificationStatus } from "../shared";

export interface EducationSnapshot {
  readonly id: EducationId;
  readonly institutionName: string;
  readonly credentialName?: string;
  readonly fieldOfStudy?: string;
  readonly location?: string;
  readonly dateRange?: DateRange;
  readonly verificationStatus: VerificationStatus;
  readonly status: LifecycleStatus;
  readonly evidenceReferenceIds: readonly EvidenceReferenceId[];
}

export class Education extends AggregateRoot<EducationId> {
  private status: LifecycleStatus = "active";
  private credentialName?: string;
  private readonly evidenceReferenceIds: EvidenceReferenceId[] = [];

  private constructor(
    id: EducationId,
    private readonly institutionName: string,
    credentialName: string | undefined,
    private readonly fieldOfStudy: string | undefined,
    private readonly location: string | undefined,
    private readonly dateRange: DateRange | undefined,
    private readonly verificationStatus: VerificationStatus
  ) {
    super(id);
    this.credentialName = credentialName;
  }

  static create(input: {
    readonly id: EducationId;
    readonly institutionName: string;
    readonly credentialName?: string;
    readonly fieldOfStudy?: string;
    readonly location?: string;
    readonly dateRange?: DateRange;
    readonly verificationStatus?: VerificationStatus;
  }): Result<Education> {
    requireNonEmpty(input.institutionName, "institutionName");

    return Result.success(
      new Education(
        input.id,
        input.institutionName,
        input.credentialName,
        input.fieldOfStudy,
        input.location,
        input.dateRange,
        input.verificationStatus ?? "unverified"
      )
    );
  }

  update(credentialName: string): Result<this> {
    requireNonEmpty(credentialName, "credentialName");
    this.credentialName = credentialName;
    return Result.success(this);
  }

  archive(): Result<this> {
    if (this.status === "archived") {
      return Result.failure({
        code: "invalid-reference",
        message: "Education cannot be archived twice."
      });
    }

    this.status = "archived";
    return Result.success(this);
  }

  toSnapshot(): EducationSnapshot {
    return {
      id: this.id,
      institutionName: this.institutionName,
      credentialName: this.credentialName,
      fieldOfStudy: this.fieldOfStudy,
      location: this.location,
      dateRange: this.dateRange,
      verificationStatus: this.verificationStatus,
      status: this.status,
      evidenceReferenceIds: [...this.evidenceReferenceIds]
    };
  }
}
