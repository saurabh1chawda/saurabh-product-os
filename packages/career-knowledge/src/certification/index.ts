import { AggregateRoot, Result } from "@career-companion/kernel";
import { CertificationId, createCareerKnowledgeEvent, requireNonEmpty } from "../shared";
import type { EvidenceReferenceId, ISODateString, LifecycleStatus, UrlString, VerificationStatus } from "../shared";

export interface CertificationSnapshot {
  readonly id: CertificationId;
  readonly name: string;
  readonly issuer: string;
  readonly issuedDate?: ISODateString;
  readonly expirationDate?: ISODateString;
  readonly credentialUrl?: UrlString;
  readonly verificationStatus: VerificationStatus;
  readonly status: LifecycleStatus;
  readonly evidenceReferenceIds: readonly EvidenceReferenceId[];
}

export class Certification extends AggregateRoot<CertificationId> {
  private status: LifecycleStatus = "active";
  private credentialUrl?: UrlString;
  private readonly evidenceReferenceIds: EvidenceReferenceId[] = [];

  private constructor(
    id: CertificationId,
    private readonly name: string,
    private readonly issuer: string,
    private readonly issuedDate: ISODateString | undefined,
    private readonly expirationDate: ISODateString | undefined,
    credentialUrl: UrlString | undefined,
    private readonly verificationStatus: VerificationStatus
  ) {
    super(id);
    this.credentialUrl = credentialUrl;
  }

  static create(input: {
    readonly id: CertificationId;
    readonly name: string;
    readonly issuer: string;
    readonly issuedDate?: ISODateString;
    readonly expirationDate?: ISODateString;
    readonly credentialUrl?: UrlString;
    readonly verificationStatus?: VerificationStatus;
  }): Result<Certification> {
    requireNonEmpty(input.name, "name");
    requireNonEmpty(input.issuer, "issuer");

    if (input.issuedDate !== undefined && input.expirationDate !== undefined && input.expirationDate < input.issuedDate) {
      return Result.failure({
        code: "invalid-date-range",
        message: "Certification expiration date cannot precede issued date.",
        field: "expirationDate"
      });
    }

    const certification = new Certification(
      input.id,
      input.name,
      input.issuer,
      input.issuedDate,
      input.expirationDate,
      input.credentialUrl,
      input.verificationStatus ?? "unverified"
    );
    certification.registerEvent(createCareerKnowledgeEvent("CertificationAdded", certification.id, certification.version));

    return Result.success(certification);
  }

  update(credentialUrl: UrlString): Result<this> {
    this.credentialUrl = credentialUrl;
    return Result.success(this);
  }

  archive(): Result<this> {
    if (this.status === "archived") {
      return Result.failure({
        code: "invalid-reference",
        message: "Certification cannot be archived twice."
      });
    }

    this.status = "archived";
    return Result.success(this);
  }

  toSnapshot(): CertificationSnapshot {
    return {
      id: this.id,
      name: this.name,
      issuer: this.issuer,
      issuedDate: this.issuedDate,
      expirationDate: this.expirationDate,
      credentialUrl: this.credentialUrl,
      verificationStatus: this.verificationStatus,
      status: this.status,
      evidenceReferenceIds: [...this.evidenceReferenceIds]
    };
  }
}
