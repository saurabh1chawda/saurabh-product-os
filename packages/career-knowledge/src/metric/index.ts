import { AggregateRoot, Guard, Result } from "@career-companion/kernel";
import { MetricId, createCareerKnowledgeEvent, requireNonEmpty } from "../shared";
import type { DomainError, ISODateString, LifecycleStatus, VerificationStatus } from "../shared";

export const MetricCreated = "MetricCreated";
export const MetricVerified = "MetricVerified";

export type MetricConfidence = "low" | "medium" | "high";

export interface MetricSnapshot {
  readonly id: MetricId;
  readonly name: string;
  readonly unit: string;
  readonly value: number;
  readonly source?: string;
  readonly confidence?: MetricConfidence;
  readonly measurementDate?: ISODateString;
  readonly verificationStatus: VerificationStatus;
  readonly status: LifecycleStatus;
}

export class Metric extends AggregateRoot<MetricId> {
  private status: LifecycleStatus = "active";
  private verificationStatus: VerificationStatus = "unverified";
  private value: number;

  private constructor(
    id: MetricId,
    private readonly name: string,
    private readonly unit: string,
    value: number,
    private readonly source: string | undefined,
    private readonly confidence: MetricConfidence | undefined,
    private readonly measurementDate: ISODateString | undefined
  ) {
    super(id);
    this.value = value;
  }

  static create(input: {
    readonly id: MetricId;
    readonly name: string;
    readonly unit: string;
    readonly value: number;
    readonly source?: string;
    readonly confidence?: MetricConfidence;
    readonly measurementDate?: ISODateString;
  }): Result<Metric, DomainError> {
    requireNonEmpty(input.name, "name");
    requireNonEmpty(input.unit, "unit");

    const valueResult = validateMetricValue(input.value);
    if (valueResult.isFailure) {
      return Result.failure(valueResult.error ?? invalidMetricValueError());
    }

    const metric = new Metric(
      input.id,
      input.name,
      input.unit,
      input.value,
      input.source,
      input.confidence,
      input.measurementDate
    );
    metric.registerEvent(createCareerKnowledgeEvent(MetricCreated, metric.id, metric.version));

    return Result.success(metric);
  }

  updateValue(value: number): Result<this, DomainError> {
    const valueResult = validateMetricValue(value);
    if (valueResult.isFailure) {
      return Result.failure(valueResult.error ?? invalidMetricValueError());
    }

    this.value = value;
    return Result.success(this);
  }

  verify(): Result<this, DomainError> {
    if (this.verificationStatus === "verified") {
      return Result.failure({
        code: "invalid-reference",
        message: "Metric cannot be verified twice."
      });
    }

    this.verificationStatus = "verified";
    this.registerEvent(createCareerKnowledgeEvent(MetricVerified, this.id, this.version));
    return Result.success(this);
  }

  deprecate(): Result<this, DomainError> {
    if (this.status === "inactive") {
      return Result.failure({
        code: "invalid-reference",
        message: "Metric cannot be deprecated twice."
      });
    }

    this.status = "inactive";
    return Result.success(this);
  }

  toSnapshot(): MetricSnapshot {
    return {
      id: this.id,
      name: this.name,
      unit: this.unit,
      value: this.value,
      source: this.source,
      confidence: this.confidence,
      measurementDate: this.measurementDate,
      verificationStatus: this.verificationStatus,
      status: this.status
    };
  }
}

function validateMetricValue(value: number): Result<number, DomainError> {
  const defined = Guard.isDefined(value, "value");
  if (defined.isFailure) {
    return Result.failure({
      code: "invalid-metric-value",
      message: "Metric value is required.",
      field: "value"
    });
  }

  if (!Number.isFinite(value)) {
    return Result.failure({
      code: "invalid-metric-value",
      message: "Metric value must be a finite number.",
      field: "value"
    });
  }

  return Result.success(value);
}

function invalidMetricValueError(): DomainError {
  return {
    code: "invalid-metric-value",
    message: "Metric value is invalid.",
    field: "value"
  };
}
