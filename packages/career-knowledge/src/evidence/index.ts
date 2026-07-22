import { AggregateRoot, Result } from "@career-companion/kernel";
import {
  EvidenceReferenceId,
  createCareerKnowledgeEvent,
  requireNonEmpty
} from "../shared";
import type { EvidenceStrength, ISODateString, LifecycleStatus, UrlString, VerificationStatus } from "../shared";

export type EvidenceReferenceType =
  | "document"
  | "portfolio-link"
  | "public-profile"
  | "manager-feedback"
  | "performance-record"
  | "credential"
  | "other";

export interface EvidenceReferenceSnapshot {
  readonly id: EvidenceReferenceId;
  readonly evidenceType: EvidenceReferenceType;
  readonly title: string;
  readonly description?: string;
  readonly sourceName?: string;
  readonly sourceUrl?: UrlString;
  readonly capturedDate?: ISODateString;
  readonly strength: EvidenceStrength;
  readonly verificationStatus: VerificationStatus;
  readonly status: LifecycleStatus;
}

export class EvidenceReference extends AggregateRoot<EvidenceReferenceId> {
  private status: LifecycleStatus = "draft";
  private verificationStatus: VerificationStatus = "unverified";

  private constructor(
    id: EvidenceReferenceId,
    private readonly evidenceType: EvidenceReferenceType,
    private readonly title: string,
    private readonly description: string | undefined,
    private readonly sourceName: string | undefined,
    private readonly sourceUrl: UrlString | undefined,
    private readonly capturedDate: ISODateString | undefined,
    private readonly strength: EvidenceStrength
  ) {
    super(id);
  }

  static attach(input: {
    readonly id: EvidenceReferenceId;
    readonly evidenceType: EvidenceReferenceType;
    readonly title: string;
    readonly description?: string;
    readonly sourceName?: string;
    readonly sourceUrl?: UrlString;
    readonly capturedDate?: ISODateString;
    readonly strength?: EvidenceStrength;
  }): Result<EvidenceReference> {
    requireNonEmpty(input.title, "title");

    const evidence = new EvidenceReference(
      input.id,
      input.evidenceType,
      input.title,
      input.description,
      input.sourceName,
      input.sourceUrl,
      input.capturedDate,
      input.strength ?? "supporting"
    );
    evidence.status = "active";
    evidence.registerEvent(createCareerKnowledgeEvent("EvidenceAttached", evidence.id, evidence.version));

    return Result.success(evidence);
  }

  verify(): Result<this> {
    if (this.verificationStatus === "rejected") {
      return Result.failure({
        code: "unverified-evidence",
        message: "Invalid evidence cannot be verified."
      });
    }

    this.verificationStatus = "verified";
    return Result.success(this);
  }

  invalidate(): Result<this> {
    if (this.verificationStatus === "rejected") {
      return Result.failure({
        code: "unverified-evidence",
        message: "Evidence cannot be invalidated twice."
      });
    }

    this.verificationStatus = "rejected";
    this.status = "inactive";
    return Result.success(this);
  }

  toSnapshot(): EvidenceReferenceSnapshot {
    return {
      id: this.id,
      evidenceType: this.evidenceType,
      title: this.title,
      description: this.description,
      sourceName: this.sourceName,
      sourceUrl: this.sourceUrl,
      capturedDate: this.capturedDate,
      strength: this.strength,
      verificationStatus: this.verificationStatus,
      status: this.status
    };
  }
}
