import { Result } from "@career-companion/kernel";

import {
  PortfolioWorkspacePresentationPrincipal,
  createPortfolioWorkspaceUnavailablePresentationError,
  createUnauthenticatedPresentationError,
  isPortfolioWorkspacePresentationPrincipalType,
  type PortfolioWorkspacePresentationError,
  type PortfolioWorkspacePresentationPrincipalTypeValue
} from "../presentation";

const INSPECT_SYMBOL = Symbol.for("nodejs.util.inspect.custom");

export interface PortfolioWorkspaceExternalAuthenticationContext {
  readonly credential?: unknown;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export const PortfolioWorkspaceAuthenticationFailureReason = {
  AuthenticationRequired: "authentication-required",
  AuthenticationInvalid: "authentication-invalid",
  AuthenticationUnavailable: "authentication-unavailable",
  CredentialMalformed: "credential-malformed",
  VerificationFailed: "verification-failed",
  IssuerMismatch: "issuer-mismatch",
  AudienceMismatch: "audience-mismatch",
  AlgorithmRejected: "algorithm-rejected",
  SubjectMissingOrInvalid: "subject-missing-or-invalid",
  CredentialExpired: "credential-expired",
  CredentialNotYetValid: "credential-not-yet-valid",
  InvalidAuthenticationConfiguration: "invalid-authentication-configuration",
  VerifierUnavailable: "verifier-unavailable",
  InvalidAuthenticatedIdentity: "invalid-authenticated-identity",
  TrustedPrincipalMappingFailed: "trusted-principal-mapping-failed"
} as const;

export type PortfolioWorkspaceAuthenticationFailureReasonValue =
  typeof PortfolioWorkspaceAuthenticationFailureReason[keyof typeof PortfolioWorkspaceAuthenticationFailureReason];

export interface PortfolioWorkspaceAuthenticatedIdentityJson {
  readonly provider: string;
  readonly subject: string;
  readonly principalType: PortfolioWorkspacePresentationPrincipalTypeValue;
  readonly displayName?: string;
}

export class PortfolioWorkspaceAuthenticatedIdentity {
  readonly provider: string;
  readonly subject: string;
  readonly principalType: PortfolioWorkspacePresentationPrincipalTypeValue;
  readonly displayName: string | undefined;

  private constructor(input: PortfolioWorkspaceAuthenticatedIdentityJson) {
    this.provider = input.provider;
    this.subject = input.subject;
    this.principalType = input.principalType;
    this.displayName = input.displayName;

    Object.freeze(this);
  }

  static create(
    input: PortfolioWorkspaceAuthenticatedIdentityJson
  ): Result<PortfolioWorkspaceAuthenticatedIdentity, PortfolioWorkspaceAuthenticationError> {
    const provider = normalizeRequiredIdentityField(input.provider);
    const subject = normalizeRequiredIdentityField(input.subject);
    const displayName = normalizeOptionalIdentityField(input.displayName, 256);

    if (
      provider === undefined
      || subject === undefined
      || !isPortfolioWorkspacePresentationPrincipalType(input.principalType)
      || displayName === false
    ) {
      return Result.failure(PortfolioWorkspaceAuthenticationError.invalidAuthenticatedIdentity());
    }

    return Result.success(new PortfolioWorkspaceAuthenticatedIdentity({
      provider,
      subject,
      principalType: input.principalType,
      ...(displayName === undefined ? {} : { displayName })
    }));
  }

  equals(other: PortfolioWorkspaceAuthenticatedIdentity | undefined): boolean {
    return other instanceof PortfolioWorkspaceAuthenticatedIdentity
      && this.provider === other.provider
      && this.subject === other.subject
      && this.principalType === other.principalType
      && this.displayName === other.displayName;
  }

  toJSON(): PortfolioWorkspaceAuthenticatedIdentityJson {
    return Object.freeze({
      provider: this.provider,
      subject: this.subject,
      principalType: this.principalType,
      ...(this.displayName === undefined ? {} : { displayName: this.displayName })
    });
  }

  [INSPECT_SYMBOL](): PortfolioWorkspaceAuthenticatedIdentityJson {
    return this.toJSON();
  }
}

export interface PortfolioWorkspaceAuthenticationAdapter {
  authenticate(
    context: PortfolioWorkspaceExternalAuthenticationContext
  ): Promise<Result<PortfolioWorkspaceAuthenticatedIdentity, PortfolioWorkspaceAuthenticationError>>;
}

export type PortfolioWorkspaceAuthenticationErrorJson = {
  readonly name: "PortfolioWorkspaceAuthenticationError";
  readonly code: "PORTFOLIO_WORKSPACE_AUTHENTICATION_FAILED";
  readonly reason: PortfolioWorkspaceAuthenticationFailureReasonValue;
  readonly retryable: boolean;
  readonly causeName?: string;
  readonly causeCode?: string;
};

export class PortfolioWorkspaceAuthenticationError extends Error {
  readonly code = "PORTFOLIO_WORKSPACE_AUTHENTICATION_FAILED";
  readonly reason: PortfolioWorkspaceAuthenticationFailureReasonValue;
  readonly retryable: boolean;
  readonly causeName: string | undefined;
  readonly causeCode: string | undefined;

  private constructor(input: {
    readonly reason: PortfolioWorkspaceAuthenticationFailureReasonValue;
    readonly retryable?: boolean;
    readonly cause?: unknown;
  }) {
    super("Portfolio Workspace authentication failed.");
    this.name = "PortfolioWorkspaceAuthenticationError";
    this.reason = input.reason;
    this.retryable = input.retryable ?? false;
    this.causeName = safeFailureName(input.cause);
    this.causeCode = safeFailureCode(input.cause);

    Object.freeze(this);
  }

  static authenticationRequired(): PortfolioWorkspaceAuthenticationError {
    return new PortfolioWorkspaceAuthenticationError({
      reason: PortfolioWorkspaceAuthenticationFailureReason.AuthenticationRequired
    });
  }

  static authenticationInvalid(): PortfolioWorkspaceAuthenticationError {
    return new PortfolioWorkspaceAuthenticationError({
      reason: PortfolioWorkspaceAuthenticationFailureReason.AuthenticationInvalid
    });
  }

  static authenticationUnavailable(cause?: unknown): PortfolioWorkspaceAuthenticationError {
    return new PortfolioWorkspaceAuthenticationError({
      reason: PortfolioWorkspaceAuthenticationFailureReason.AuthenticationUnavailable,
      retryable: true,
      cause
    });
  }

  static credentialMalformed(): PortfolioWorkspaceAuthenticationError {
    return new PortfolioWorkspaceAuthenticationError({
      reason: PortfolioWorkspaceAuthenticationFailureReason.CredentialMalformed
    });
  }

  static verificationFailed(cause?: unknown): PortfolioWorkspaceAuthenticationError {
    return new PortfolioWorkspaceAuthenticationError({
      reason: PortfolioWorkspaceAuthenticationFailureReason.VerificationFailed,
      cause
    });
  }

  static issuerMismatch(): PortfolioWorkspaceAuthenticationError {
    return new PortfolioWorkspaceAuthenticationError({
      reason: PortfolioWorkspaceAuthenticationFailureReason.IssuerMismatch
    });
  }

  static audienceMismatch(): PortfolioWorkspaceAuthenticationError {
    return new PortfolioWorkspaceAuthenticationError({
      reason: PortfolioWorkspaceAuthenticationFailureReason.AudienceMismatch
    });
  }

  static algorithmRejected(): PortfolioWorkspaceAuthenticationError {
    return new PortfolioWorkspaceAuthenticationError({
      reason: PortfolioWorkspaceAuthenticationFailureReason.AlgorithmRejected
    });
  }

  static subjectMissingOrInvalid(): PortfolioWorkspaceAuthenticationError {
    return new PortfolioWorkspaceAuthenticationError({
      reason: PortfolioWorkspaceAuthenticationFailureReason.SubjectMissingOrInvalid
    });
  }

  static credentialExpired(): PortfolioWorkspaceAuthenticationError {
    return new PortfolioWorkspaceAuthenticationError({
      reason: PortfolioWorkspaceAuthenticationFailureReason.CredentialExpired
    });
  }

  static credentialNotYetValid(): PortfolioWorkspaceAuthenticationError {
    return new PortfolioWorkspaceAuthenticationError({
      reason: PortfolioWorkspaceAuthenticationFailureReason.CredentialNotYetValid
    });
  }

  static invalidAuthenticationConfiguration(): PortfolioWorkspaceAuthenticationError {
    return new PortfolioWorkspaceAuthenticationError({
      reason: PortfolioWorkspaceAuthenticationFailureReason.InvalidAuthenticationConfiguration
    });
  }

  static verifierUnavailable(cause?: unknown): PortfolioWorkspaceAuthenticationError {
    return new PortfolioWorkspaceAuthenticationError({
      reason: PortfolioWorkspaceAuthenticationFailureReason.VerifierUnavailable,
      retryable: true,
      cause
    });
  }

  static invalidAuthenticatedIdentity(): PortfolioWorkspaceAuthenticationError {
    return new PortfolioWorkspaceAuthenticationError({
      reason: PortfolioWorkspaceAuthenticationFailureReason.InvalidAuthenticatedIdentity
    });
  }

  static trustedPrincipalMappingFailed(): PortfolioWorkspaceAuthenticationError {
    return new PortfolioWorkspaceAuthenticationError({
      reason: PortfolioWorkspaceAuthenticationFailureReason.TrustedPrincipalMappingFailed
    });
  }

  toJSON(): PortfolioWorkspaceAuthenticationErrorJson {
    return Object.freeze({
      name: "PortfolioWorkspaceAuthenticationError",
      code: this.code,
      reason: this.reason,
      retryable: this.retryable,
      ...(this.causeName === undefined ? {} : { causeName: this.causeName }),
      ...(this.causeCode === undefined ? {} : { causeCode: this.causeCode })
    });
  }

  [INSPECT_SYMBOL](): PortfolioWorkspaceAuthenticationErrorJson {
    return this.toJSON();
  }
}

export async function authenticatePortfolioWorkspacePrincipal(input: {
  readonly adapter: PortfolioWorkspaceAuthenticationAdapter;
  readonly context: PortfolioWorkspaceExternalAuthenticationContext;
}): Promise<Result<PortfolioWorkspacePresentationPrincipal, PortfolioWorkspaceAuthenticationError>> {
  let authenticationResult: Result<PortfolioWorkspaceAuthenticatedIdentity, PortfolioWorkspaceAuthenticationError>;

  try {
    authenticationResult = await input.adapter.authenticate(input.context);
  } catch (error) {
    return Result.failure(PortfolioWorkspaceAuthenticationError.authenticationUnavailable(error));
  }

  if (authenticationResult.isFailure) {
    return Result.failure(authenticationResult.error!);
  }

  return mapAuthenticatedIdentityToPresentationPrincipal(authenticationResult.value!);
}

export function mapAuthenticatedIdentityToPresentationPrincipal(
  identity: PortfolioWorkspaceAuthenticatedIdentity
): Result<PortfolioWorkspacePresentationPrincipal, PortfolioWorkspaceAuthenticationError> {
  const principalResult = PortfolioWorkspacePresentationPrincipal.create({
    principalId: identity.subject,
    principalType: identity.principalType,
    authenticationProvider: identity.provider,
    ...(identity.displayName === undefined ? {} : { displayName: identity.displayName })
  });

  if (principalResult.isFailure) {
    return Result.failure(PortfolioWorkspaceAuthenticationError.trustedPrincipalMappingFailed());
  }

  return Result.success(principalResult.value!);
}

export function mapPortfolioWorkspaceAuthenticationErrorToPresentationError(
  error: PortfolioWorkspaceAuthenticationError,
  correlationId: string
): PortfolioWorkspacePresentationError {
  if (
    error.reason === PortfolioWorkspaceAuthenticationFailureReason.AuthenticationUnavailable
    || error.reason === PortfolioWorkspaceAuthenticationFailureReason.VerifierUnavailable
  ) {
    return createPortfolioWorkspaceUnavailablePresentationError(correlationId);
  }

  return createUnauthenticatedPresentationError(correlationId);
}

function normalizeRequiredIdentityField(value: unknown, maxLength = 128): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  if (normalized.length === 0 || normalized.length > maxLength || containsUnsafeControlCharacters(normalized)) {
    return undefined;
  }

  return normalized;
}

function normalizeOptionalIdentityField(value: unknown, maxLength: number): string | undefined | false {
  if (value === undefined) {
    return undefined;
  }

  const normalized = normalizeRequiredIdentityField(value, maxLength);
  if (normalized === undefined) {
    return false;
  }

  return normalized;
}

function containsUnsafeControlCharacters(value: string): boolean {
  return /[\u0000-\u001F\u007F]/u.test(value);
}

function safeFailureName(failure: unknown): string | undefined {
  if (failure instanceof Error) {
    return failure.name;
  }

  return undefined;
}

function safeFailureCode(failure: unknown): string | undefined {
  if (typeof failure === "object" && failure !== null && "code" in failure) {
    const code = (failure as { readonly code?: unknown }).code;
    return typeof code === "string" ? code : undefined;
  }

  return undefined;
}
