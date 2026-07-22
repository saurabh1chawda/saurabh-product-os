import type { CertificationId, EvidenceReferenceId, ISODateString, UrlString, VerificationStatus } from "../shared";

export interface Certification {
  readonly id: CertificationId;
  readonly name: string;
  readonly issuer: string;
  readonly issuedDate?: ISODateString;
  readonly expirationDate?: ISODateString;
  readonly credentialUrl?: UrlString;
  readonly verificationStatus: VerificationStatus;
  readonly evidenceReferenceIds: readonly EvidenceReferenceId[];
}
