import type { DateRange, EducationId, EvidenceReferenceId, VerificationStatus } from "../shared";

export interface Education {
  readonly id: EducationId;
  readonly institutionName: string;
  readonly credentialName?: string;
  readonly fieldOfStudy?: string;
  readonly location?: string;
  readonly dateRange?: DateRange;
  readonly verificationStatus: VerificationStatus;
  readonly evidenceReferenceIds: readonly EvidenceReferenceId[];
}
