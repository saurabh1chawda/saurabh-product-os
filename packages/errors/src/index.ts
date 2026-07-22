export type PlatformErrorCategory =
  | "domain"
  | "validation"
  | "configuration"
  | "workflow"
  | "capability"
  | "policy"
  | "infrastructure"
  | "not-found"
  | "conflict"
  | "unauthorized"
  | "forbidden";

export type PlatformErrorMetadata = Readonly<Record<string, unknown>>;

export interface PlatformErrorOptions {
  readonly code: string;
  readonly message: string;
  readonly category: PlatformErrorCategory;
  readonly metadata?: PlatformErrorMetadata;
  readonly cause?: unknown;
  readonly timestamp?: string;
}

export class PlatformError extends Error {
  readonly code: string;
  readonly category: PlatformErrorCategory;
  readonly metadata?: PlatformErrorMetadata;
  readonly cause?: unknown;
  readonly timestamp: string;

  constructor(options: PlatformErrorOptions) {
    super(options.message);
    this.name = "PlatformError";
    this.code = options.code;
    this.category = options.category;
    this.metadata = options.metadata;
    this.cause = options.cause;
    this.timestamp = options.timestamp ?? new Date().toISOString();
  }
}

export class DomainError extends PlatformError {
  constructor(options: Omit<PlatformErrorOptions, "category">) {
    super({ ...options, category: "domain" });
    this.name = "DomainError";
  }
}

export class ValidationError extends PlatformError {
  constructor(options: Omit<PlatformErrorOptions, "category">) {
    super({ ...options, category: "validation" });
    this.name = "ValidationError";
  }
}

export class ConfigurationError extends PlatformError {
  constructor(options: Omit<PlatformErrorOptions, "category">) {
    super({ ...options, category: "configuration" });
    this.name = "ConfigurationError";
  }
}

export class WorkflowError extends PlatformError {
  constructor(options: Omit<PlatformErrorOptions, "category">) {
    super({ ...options, category: "workflow" });
    this.name = "WorkflowError";
  }
}

export class CapabilityError extends PlatformError {
  constructor(options: Omit<PlatformErrorOptions, "category">) {
    super({ ...options, category: "capability" });
    this.name = "CapabilityError";
  }
}

export class PolicyViolationError extends PlatformError {
  constructor(options: Omit<PlatformErrorOptions, "category">) {
    super({ ...options, category: "policy" });
    this.name = "PolicyViolationError";
  }
}

export class InfrastructureError extends PlatformError {
  constructor(options: Omit<PlatformErrorOptions, "category">) {
    super({ ...options, category: "infrastructure" });
    this.name = "InfrastructureError";
  }
}

export class NotFoundError extends PlatformError {
  constructor(options: Omit<PlatformErrorOptions, "category">) {
    super({ ...options, category: "not-found" });
    this.name = "NotFoundError";
  }
}

export class ConflictError extends PlatformError {
  constructor(options: Omit<PlatformErrorOptions, "category">) {
    super({ ...options, category: "conflict" });
    this.name = "ConflictError";
  }
}

export class UnauthorizedError extends PlatformError {
  constructor(options: Omit<PlatformErrorOptions, "category">) {
    super({ ...options, category: "unauthorized" });
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends PlatformError {
  constructor(options: Omit<PlatformErrorOptions, "category">) {
    super({ ...options, category: "forbidden" });
    this.name = "ForbiddenError";
  }
}
