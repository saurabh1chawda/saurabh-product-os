import type { DomainMetadata } from "@career-companion/kernel";

export type ApplicationCapability =
  | "generate-resume"
  | "generate-portfolio"
  | "prepare-interview"
  | "analyze-job-description"
  | "evaluate-qualification"
  | "generate-linkedin-profile";

export type ApplicationRequestId = string;

export type ApplicationUseCaseName = string;

export type ApplicationFailureCategory =
  | "validation"
  | "authorization"
  | "policy"
  | "conflict"
  | "not-found"
  | "execution"
  | "unknown";

export interface ApplicationReference {
  readonly referenceType: string;
  readonly referenceId: string;
  readonly version?: string;
  readonly metadata?: DomainMetadata;
}

