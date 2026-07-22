import type {
  EvidenceReferenceId,
  EvidenceStrength,
  ISODateString,
  UrlString,
  VerificationStatus
} from "../shared";

export type EvidenceReferenceType =
  | "document"
  | "portfolio-link"
  | "public-profile"
  | "manager-feedback"
  | "performance-record"
  | "credential"
  | "other";

export interface EvidenceReference {
  readonly id: EvidenceReferenceId;
  readonly evidenceType: EvidenceReferenceType;
  readonly title: string;
  readonly description?: string;
  readonly sourceName?: string;
  readonly sourceUrl?: UrlString;
  readonly capturedDate?: ISODateString;
  readonly strength: EvidenceStrength;
  readonly verificationStatus: VerificationStatus;
}
