import { PortfolioWorkspaceAuthorizationResourceReference } from "@career-companion/portfolio-workspace";
import {
  PortfolioWorkspaceIdempotencyContractError,
  PortfolioWorkspaceIdempotencyContractErrorReason,
  type PortfolioWorkspaceIdempotencyContractErrorReasonValue
} from "./PortfolioWorkspaceIdempotencyErrors";
import {
  isPortfolioWorkspaceIdempotencyOperation,
  type PortfolioWorkspaceIdempotencyOperationValue
} from "./PortfolioWorkspaceIdempotencyOperation";

const SHA_256 = "sha256";
const SAFE_TEXT_MAX_LENGTH = 256;
const SAFE_TEXT_PATTERN = /^[^\u0000-\u001f\u007f]+$/u;
const HASH_PATTERN = /^[a-f0-9]{64}$/u;

export type PortfolioWorkspaceIdempotencyHashAlgorithm = typeof SHA_256;

export class PortfolioWorkspaceIdempotencyKeyHash {
  private readonly __portfolioWorkspaceIdempotencyKeyHashBrand!: never;

  readonly algorithm: PortfolioWorkspaceIdempotencyHashAlgorithm;
  readonly value: string;

  constructor(input: {
    readonly algorithm?: PortfolioWorkspaceIdempotencyHashAlgorithm;
    readonly value: string;
  }) {
    if ((input.algorithm ?? SHA_256) !== SHA_256 || !HASH_PATTERN.test(input.value)) {
      throw new PortfolioWorkspaceIdempotencyContractError(PortfolioWorkspaceIdempotencyContractErrorReason.InvalidKeyHash);
    }

    this.algorithm = SHA_256;
    this.value = input.value;
    Object.freeze(this);
  }

  equals(other: PortfolioWorkspaceIdempotencyKeyHash | undefined): boolean {
    return other instanceof PortfolioWorkspaceIdempotencyKeyHash
      && this.algorithm === other.algorithm
      && this.value === other.value;
  }

  toJSON(): {
    readonly algorithm: PortfolioWorkspaceIdempotencyHashAlgorithm;
    readonly value: string;
  } {
    return {
      algorithm: this.algorithm,
      value: this.value
    };
  }
}

export class PortfolioWorkspaceIdempotencyIdentity {
  private readonly __portfolioWorkspaceIdempotencyIdentityBrand!: never;

  readonly authorizationResourceReference: PortfolioWorkspaceAuthorizationResourceReference;
  readonly operation: PortfolioWorkspaceIdempotencyOperationValue;
  readonly resourceIdentity: string;
  readonly keyHash: PortfolioWorkspaceIdempotencyKeyHash;

  constructor(input: {
    readonly authorizationResourceReference: PortfolioWorkspaceAuthorizationResourceReference;
    readonly operation: PortfolioWorkspaceIdempotencyOperationValue;
    readonly resourceIdentity: string;
    readonly keyHash: PortfolioWorkspaceIdempotencyKeyHash;
  }) {
    if (!(input.authorizationResourceReference instanceof PortfolioWorkspaceAuthorizationResourceReference)) {
      throw new PortfolioWorkspaceIdempotencyContractError(PortfolioWorkspaceIdempotencyContractErrorReason.InvalidIdentity);
    }
    if (!isPortfolioWorkspaceIdempotencyOperation(input.operation)) {
      throw new PortfolioWorkspaceIdempotencyContractError(PortfolioWorkspaceIdempotencyContractErrorReason.InvalidIdentity);
    }
    assertSafeText(input.resourceIdentity, PortfolioWorkspaceIdempotencyContractErrorReason.InvalidIdentity);
    if (!(input.keyHash instanceof PortfolioWorkspaceIdempotencyKeyHash)) {
      throw new PortfolioWorkspaceIdempotencyContractError(PortfolioWorkspaceIdempotencyContractErrorReason.InvalidIdentity);
    }

    this.authorizationResourceReference = input.authorizationResourceReference;
    this.operation = input.operation;
    this.resourceIdentity = input.resourceIdentity;
    this.keyHash = input.keyHash;
    Object.freeze(this);
  }

  equals(other: PortfolioWorkspaceIdempotencyIdentity | undefined): boolean {
    return other instanceof PortfolioWorkspaceIdempotencyIdentity
      && this.authorizationResourceReference.equals(other.authorizationResourceReference)
      && this.operation === other.operation
      && this.resourceIdentity === other.resourceIdentity
      && this.keyHash.equals(other.keyHash);
  }

  toJSON(): {
    readonly authorizationResourceReference: ReturnType<PortfolioWorkspaceAuthorizationResourceReference["toJSON"]>;
    readonly operation: PortfolioWorkspaceIdempotencyOperationValue;
    readonly resourceIdentity: string;
    readonly keyHash: ReturnType<PortfolioWorkspaceIdempotencyKeyHash["toJSON"]>;
  } {
    return {
      authorizationResourceReference: this.authorizationResourceReference.toJSON(),
      operation: this.operation,
      resourceIdentity: this.resourceIdentity,
      keyHash: this.keyHash.toJSON()
    };
  }
}

export class PortfolioWorkspaceIdempotencyRequestFingerprint {
  private readonly __portfolioWorkspaceIdempotencyRequestFingerprintBrand!: never;

  readonly algorithm: PortfolioWorkspaceIdempotencyHashAlgorithm;
  readonly value: string;

  constructor(input: {
    readonly algorithm?: PortfolioWorkspaceIdempotencyHashAlgorithm;
    readonly value: string;
  }) {
    if ((input.algorithm ?? SHA_256) !== SHA_256 || !HASH_PATTERN.test(input.value)) {
      throw new PortfolioWorkspaceIdempotencyContractError(PortfolioWorkspaceIdempotencyContractErrorReason.InvalidFingerprint);
    }

    this.algorithm = SHA_256;
    this.value = input.value;
    Object.freeze(this);
  }

  equals(other: PortfolioWorkspaceIdempotencyRequestFingerprint | undefined): boolean {
    return other instanceof PortfolioWorkspaceIdempotencyRequestFingerprint
      && this.algorithm === other.algorithm
      && this.value === other.value;
  }

  toJSON(): {
    readonly algorithm: PortfolioWorkspaceIdempotencyHashAlgorithm;
    readonly value: string;
  } {
    return {
      algorithm: this.algorithm,
      value: this.value
    };
  }
}

export class PortfolioWorkspaceIdempotencyCommandBinding {
  private readonly __portfolioWorkspaceIdempotencyCommandBindingBrand!: never;

  readonly originalCommandId: string;
  readonly originalCorrelationId: string;

  constructor(input: {
    readonly originalCommandId: string;
    readonly originalCorrelationId: string;
  }) {
    assertSafeText(input.originalCommandId, PortfolioWorkspaceIdempotencyContractErrorReason.InvalidCommandBinding);
    assertSafeText(input.originalCorrelationId, PortfolioWorkspaceIdempotencyContractErrorReason.InvalidCommandBinding);

    this.originalCommandId = input.originalCommandId;
    this.originalCorrelationId = input.originalCorrelationId;
    Object.freeze(this);
  }

  equals(other: PortfolioWorkspaceIdempotencyCommandBinding | undefined): boolean {
    return other instanceof PortfolioWorkspaceIdempotencyCommandBinding
      && this.originalCommandId === other.originalCommandId
      && this.originalCorrelationId === other.originalCorrelationId;
  }

  toJSON(): {
    readonly originalCommandId: string;
    readonly originalCorrelationId: string;
  } {
    return {
      originalCommandId: this.originalCommandId,
      originalCorrelationId: this.originalCorrelationId
    };
  }
}

export class PortfolioWorkspaceIdempotencyExpiryMetadata {
  private readonly __portfolioWorkspaceIdempotencyExpiryMetadataBrand!: never;

  readonly createdAt: string;
  readonly expiresAt: string;
  readonly completedAt: string | undefined;

  constructor(input: {
    readonly createdAt: string;
    readonly expiresAt: string;
    readonly completedAt?: string;
  }) {
    assertIsoInstant(input.createdAt);
    assertIsoInstant(input.expiresAt);
    if (Date.parse(input.expiresAt) <= Date.parse(input.createdAt)) {
      throw new PortfolioWorkspaceIdempotencyContractError(PortfolioWorkspaceIdempotencyContractErrorReason.InvalidExpiryMetadata);
    }
    if (input.completedAt !== undefined) {
      assertIsoInstant(input.completedAt);
      if (Date.parse(input.completedAt) < Date.parse(input.createdAt)) {
        throw new PortfolioWorkspaceIdempotencyContractError(PortfolioWorkspaceIdempotencyContractErrorReason.InvalidExpiryMetadata);
      }
    }

    this.createdAt = input.createdAt;
    this.expiresAt = input.expiresAt;
    this.completedAt = input.completedAt;
    Object.freeze(this);
  }

  equals(other: PortfolioWorkspaceIdempotencyExpiryMetadata | undefined): boolean {
    return other instanceof PortfolioWorkspaceIdempotencyExpiryMetadata
      && this.createdAt === other.createdAt
      && this.expiresAt === other.expiresAt
      && this.completedAt === other.completedAt;
  }

  toJSON(): {
    readonly createdAt: string;
    readonly expiresAt: string;
    readonly completedAt?: string;
  } {
    return {
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      ...(this.completedAt === undefined ? {} : { completedAt: this.completedAt })
    };
  }
}

function assertSafeText(
  value: string,
  reason: PortfolioWorkspaceIdempotencyContractErrorReasonValue
): void {
  if (
    typeof value !== "string"
    || value.trim() !== value
    || value.length === 0
    || value.length > SAFE_TEXT_MAX_LENGTH
    || !SAFE_TEXT_PATTERN.test(value)
  ) {
    throw new PortfolioWorkspaceIdempotencyContractError(reason);
  }
}

function assertIsoInstant(value: string): void {
  assertSafeText(value, PortfolioWorkspaceIdempotencyContractErrorReason.InvalidExpiryMetadata);
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed) || new Date(parsed).toISOString() !== value) {
    throw new PortfolioWorkspaceIdempotencyContractError(PortfolioWorkspaceIdempotencyContractErrorReason.InvalidExpiryMetadata);
  }
}
