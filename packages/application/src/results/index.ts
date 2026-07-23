import type { DecisionResult } from "@career-companion/decision-engine";
import type { DomainMetadata, DomainTimestamp } from "@career-companion/kernel";
import type { ApplicationFailureCategory, ApplicationReference } from "../shared";

export type ApplicationResultStatus = "success" | "validation-failed" | "policy-denied" | "failure";

export interface ValidationSummary {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

export interface FailureSummary {
  readonly category: ApplicationFailureCategory;
  readonly code: string;
  readonly message: string;
  readonly references: readonly ApplicationReference[];
  readonly metadata?: DomainMetadata;
}

export interface ExecutionSummary {
  readonly startedAt: DomainTimestamp;
  readonly completedAt?: DomainTimestamp;
  readonly status: ApplicationResultStatus;
  readonly decisionResult?: DecisionResult;
  readonly metadata?: DomainMetadata;
}

export interface ApplicationResult<T> {
  readonly status: ApplicationResultStatus;
  readonly value?: T;
  readonly validation: ValidationSummary;
  readonly execution: ExecutionSummary;
  readonly failure?: FailureSummary;
}

export type UseCaseResult<T> = ApplicationResult<T>;

