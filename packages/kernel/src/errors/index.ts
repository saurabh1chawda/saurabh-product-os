import type { DomainMetadata } from "../primitives";

export class DomainException extends Error {
  readonly code: string;
  readonly metadata?: DomainMetadata;
  readonly cause?: unknown;

  constructor(
    code: string,
    message: string,
    metadata?: DomainMetadata,
    cause?: unknown
  ) {
    super(message);
    this.name = "DomainException";
    this.code = code;
    this.metadata = metadata;
    this.cause = cause;
  }
}

export class DomainRuleViolation extends DomainException {
  constructor(code: string, message: string, metadata?: DomainMetadata) {
    super(code, message, metadata);
    this.name = "DomainRuleViolation";
  }
}

export class InvariantViolation extends DomainException {
  constructor(code: string, message: string, metadata?: DomainMetadata) {
    super(code, message, metadata);
    this.name = "InvariantViolation";
  }
}

export class InvalidDomainArgument extends DomainException {
  constructor(code: string, message: string, metadata?: DomainMetadata) {
    super(code, message, metadata);
    this.name = "InvalidDomainArgument";
  }
}
