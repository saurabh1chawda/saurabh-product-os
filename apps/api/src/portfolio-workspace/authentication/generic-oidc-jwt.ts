import { Result } from "@career-companion/kernel";

import {
  PortfolioWorkspacePresentationPrincipalType,
  isPortfolioWorkspacePresentationPrincipalType,
  type PortfolioWorkspacePresentationPrincipalTypeValue
} from "../presentation";
import {
  PortfolioWorkspaceAuthenticatedIdentity,
  PortfolioWorkspaceAuthenticationError,
  PortfolioWorkspaceAuthenticationFailureReason,
  mapAuthenticatedIdentityToPresentationPrincipal,
  type PortfolioWorkspaceAuthenticationAdapter,
  type PortfolioWorkspaceExternalAuthenticationContext
} from "./contracts";

const INSPECT_SYMBOL = Symbol.for("nodejs.util.inspect.custom");
const MAX_FIELD_LENGTH = 128;
const MAX_ISSUER_LENGTH = 512;
const MAX_CLOCK_TOLERANCE_SECONDS = 300;
const BEARER_PREFIX = "Bearer ";

export type PortfolioWorkspaceOidcJwtPrincipalTypeStrategy =
  | { readonly kind: "fixed"; readonly principalType: PortfolioWorkspacePresentationPrincipalTypeValue }
  | { readonly kind: "claim"; readonly claimName: string; readonly defaultPrincipalType?: PortfolioWorkspacePresentationPrincipalTypeValue };

export interface PortfolioWorkspaceOidcJwtAuthenticationConfigurationInput {
  readonly issuer: string;
  readonly audiences: readonly string[];
  readonly allowedAlgorithms: readonly string[];
  readonly clockToleranceSeconds?: number;
  readonly authenticationProvider?: string;
  readonly principalTypeStrategy?: PortfolioWorkspaceOidcJwtPrincipalTypeStrategy;
  readonly displayNameClaim?: string;
}

export interface PortfolioWorkspaceOidcJwtAuthenticationConfigurationJson {
  readonly issuer: string;
  readonly audiences: readonly string[];
  readonly allowedAlgorithms: readonly string[];
  readonly clockToleranceSeconds: number;
  readonly authenticationProvider: string;
  readonly principalTypeStrategy: PortfolioWorkspaceOidcJwtPrincipalTypeStrategy;
  readonly displayNameClaim?: string;
}

export class PortfolioWorkspaceOidcJwtAuthenticationConfiguration {
  readonly issuer: string;
  readonly audiences: readonly string[];
  readonly allowedAlgorithms: readonly string[];
  readonly clockToleranceSeconds: number;
  readonly authenticationProvider: string;
  readonly principalTypeStrategy: PortfolioWorkspaceOidcJwtPrincipalTypeStrategy;
  readonly displayNameClaim: string | undefined;

  private constructor(input: PortfolioWorkspaceOidcJwtAuthenticationConfigurationJson) {
    this.issuer = input.issuer;
    this.audiences = Object.freeze([...input.audiences]);
    this.allowedAlgorithms = Object.freeze([...input.allowedAlgorithms]);
    this.clockToleranceSeconds = input.clockToleranceSeconds;
    this.authenticationProvider = input.authenticationProvider;
    this.principalTypeStrategy = Object.freeze({ ...input.principalTypeStrategy });
    this.displayNameClaim = input.displayNameClaim;

    Object.freeze(this);
  }

  static create(
    input: PortfolioWorkspaceOidcJwtAuthenticationConfigurationInput
  ): Result<PortfolioWorkspaceOidcJwtAuthenticationConfiguration, PortfolioWorkspaceAuthenticationError> {
    const issuer = normalizeRequiredField(input.issuer, MAX_ISSUER_LENGTH);
    const audiences = normalizeUniqueFields(input.audiences);
    const allowedAlgorithms = normalizeAllowedAlgorithms(input.allowedAlgorithms);
    const clockToleranceSeconds = normalizeClockTolerance(input.clockToleranceSeconds);
    const authenticationProvider = normalizeRequiredField(input.authenticationProvider ?? input.issuer, MAX_FIELD_LENGTH);
    const principalTypeStrategy = normalizePrincipalTypeStrategy(input.principalTypeStrategy);
    const displayNameClaim = normalizeOptionalField(input.displayNameClaim, MAX_FIELD_LENGTH);

    if (
      issuer === undefined
      || audiences === undefined
      || allowedAlgorithms === undefined
      || clockToleranceSeconds === undefined
      || authenticationProvider === undefined
      || principalTypeStrategy === undefined
      || displayNameClaim === false
    ) {
      return Result.failure(PortfolioWorkspaceAuthenticationError.invalidAuthenticationConfiguration());
    }

    return Result.success(new PortfolioWorkspaceOidcJwtAuthenticationConfiguration({
      issuer,
      audiences,
      allowedAlgorithms,
      clockToleranceSeconds,
      authenticationProvider,
      principalTypeStrategy,
      ...(displayNameClaim === undefined ? {} : { displayNameClaim })
    }));
  }

  toJSON(): PortfolioWorkspaceOidcJwtAuthenticationConfigurationJson {
    return Object.freeze({
      issuer: this.issuer,
      audiences: this.audiences,
      allowedAlgorithms: this.allowedAlgorithms,
      clockToleranceSeconds: this.clockToleranceSeconds,
      authenticationProvider: this.authenticationProvider,
      principalTypeStrategy: this.principalTypeStrategy,
      ...(this.displayNameClaim === undefined ? {} : { displayNameClaim: this.displayNameClaim })
    });
  }

  [INSPECT_SYMBOL](): PortfolioWorkspaceOidcJwtAuthenticationConfigurationJson {
    return this.toJSON();
  }
}

export interface PortfolioWorkspaceBearerTokenCredentialJson {
  readonly credentialType: "bearer-token";
  readonly redacted: true;
}

export class PortfolioWorkspaceBearerTokenCredential {
  readonly credentialType = "bearer-token";
  readonly #token: string;

  private constructor(token: string) {
    this.#token = token;

    Object.freeze(this);
  }

  static create(value: unknown): Result<PortfolioWorkspaceBearerTokenCredential, PortfolioWorkspaceAuthenticationError> {
    const token = readBearerToken(value);

    if (token === undefined) {
      return Result.failure(PortfolioWorkspaceAuthenticationError.credentialMalformed());
    }

    return Result.success(new PortfolioWorkspaceBearerTokenCredential(token));
  }

  token(): string {
    return this.#token;
  }

  toJSON(): PortfolioWorkspaceBearerTokenCredentialJson {
    return Object.freeze({
      credentialType: "bearer-token",
      redacted: true
    });
  }

  [INSPECT_SYMBOL](): PortfolioWorkspaceBearerTokenCredentialJson {
    return this.toJSON();
  }
}

export interface PortfolioWorkspaceJwtVerificationRequirements {
  readonly issuer: string;
  readonly audiences: readonly string[];
  readonly allowedAlgorithms: readonly string[];
}

export interface PortfolioWorkspaceJwtVerifierInput {
  readonly token: string;
  readonly requirements: PortfolioWorkspaceJwtVerificationRequirements;
}

export interface PortfolioWorkspaceVerifiedJwtClaims {
  readonly issuer: string;
  readonly audiences: readonly string[];
  readonly subject: string;
  readonly algorithm: string;
  readonly expiresAtEpochSeconds: number;
  readonly notBeforeEpochSeconds?: number;
  readonly issuedAtEpochSeconds?: number;
  readonly displayName?: string;
  readonly principalType?: string;
}

export interface PortfolioWorkspaceJwtVerifier {
  verify(
    input: PortfolioWorkspaceJwtVerifierInput
  ): Promise<Result<PortfolioWorkspaceVerifiedJwtClaims, PortfolioWorkspaceAuthenticationError>>;
}

export interface PortfolioWorkspaceOidcJwtAuthenticationAdapterInput {
  readonly configuration: PortfolioWorkspaceOidcJwtAuthenticationConfiguration;
  readonly verifier: PortfolioWorkspaceJwtVerifier;
  readonly clock?: PortfolioWorkspaceAuthenticationClock;
}

export interface PortfolioWorkspaceAuthenticationClock {
  now(): Date;
}

export class PortfolioWorkspaceOidcJwtAuthenticationAdapter implements PortfolioWorkspaceAuthenticationAdapter {
  readonly #configuration: PortfolioWorkspaceOidcJwtAuthenticationConfiguration;
  readonly #verifier: PortfolioWorkspaceJwtVerifier;
  readonly #clock: PortfolioWorkspaceAuthenticationClock;

  constructor(input: PortfolioWorkspaceOidcJwtAuthenticationAdapterInput) {
    this.#configuration = input.configuration;
    this.#verifier = input.verifier;
    this.#clock = input.clock ?? { now: () => new Date() };

    Object.freeze(this);
  }

  async authenticate(
    context: PortfolioWorkspaceExternalAuthenticationContext
  ): Promise<Result<PortfolioWorkspaceAuthenticatedIdentity, PortfolioWorkspaceAuthenticationError>> {
    if (context.credential === undefined) {
      return Result.failure(PortfolioWorkspaceAuthenticationError.authenticationRequired());
    }

    const credential = PortfolioWorkspaceBearerTokenCredential.create(context.credential);
    if (credential.isFailure) {
      return Result.failure(credential.error!);
    }

    let verification: Result<PortfolioWorkspaceVerifiedJwtClaims, PortfolioWorkspaceAuthenticationError>;
    try {
      verification = await this.#verifier.verify({
        token: credential.value!.token(),
        requirements: {
          issuer: this.#configuration.issuer,
          audiences: this.#configuration.audiences,
          allowedAlgorithms: this.#configuration.allowedAlgorithms
        }
      });
    } catch (error) {
      return Result.failure(PortfolioWorkspaceAuthenticationError.verifierUnavailable(error));
    }

    if (verification.isFailure) {
      return Result.failure(sanitizeVerifierError(verification.error!));
    }

    const claimsValidation = validateVerifiedClaims({
      claims: verification.value!,
      configuration: this.#configuration,
      nowEpochSeconds: Math.floor(this.#clock.now().getTime() / 1000)
    });

    if (claimsValidation.isFailure) {
      return Result.failure(claimsValidation.error!);
    }

    return PortfolioWorkspaceAuthenticatedIdentity.create({
      provider: this.#configuration.authenticationProvider,
      subject: claimsValidation.value!.subject,
      principalType: claimsValidation.value!.principalType,
      ...(claimsValidation.value!.displayName === undefined ? {} : { displayName: claimsValidation.value!.displayName })
    });
  }

  async authenticatePrincipal(
    context: PortfolioWorkspaceExternalAuthenticationContext
  ): Promise<ReturnType<typeof mapAuthenticatedIdentityToPresentationPrincipal>> {
    const identity = await this.authenticate(context);
    if (identity.isFailure) {
      return Result.failure(identity.error!);
    }

    return mapAuthenticatedIdentityToPresentationPrincipal(identity.value!);
  }
}

function validateVerifiedClaims(input: {
  readonly claims: PortfolioWorkspaceVerifiedJwtClaims;
  readonly configuration: PortfolioWorkspaceOidcJwtAuthenticationConfiguration;
  readonly nowEpochSeconds: number;
}): Result<{
  readonly subject: string;
  readonly principalType: PortfolioWorkspacePresentationPrincipalTypeValue;
  readonly displayName?: string;
}, PortfolioWorkspaceAuthenticationError> {
  if (input.claims.issuer !== input.configuration.issuer) {
    return Result.failure(PortfolioWorkspaceAuthenticationError.issuerMismatch());
  }

  if (!hasAcceptedAudience(input.claims.audiences, input.configuration.audiences)) {
    return Result.failure(PortfolioWorkspaceAuthenticationError.audienceMismatch());
  }

  if (!input.configuration.allowedAlgorithms.includes(input.claims.algorithm)) {
    return Result.failure(PortfolioWorkspaceAuthenticationError.algorithmRejected());
  }

  const subject = normalizeRequiredField(input.claims.subject, MAX_FIELD_LENGTH);
  if (subject === undefined) {
    return Result.failure(PortfolioWorkspaceAuthenticationError.subjectMissingOrInvalid());
  }

  const tolerance = input.configuration.clockToleranceSeconds;
  if (!Number.isInteger(input.claims.expiresAtEpochSeconds) || input.claims.expiresAtEpochSeconds + tolerance < input.nowEpochSeconds) {
    return Result.failure(PortfolioWorkspaceAuthenticationError.credentialExpired());
  }

  if (
    input.claims.notBeforeEpochSeconds !== undefined
    && (!Number.isInteger(input.claims.notBeforeEpochSeconds) || input.claims.notBeforeEpochSeconds - tolerance > input.nowEpochSeconds)
  ) {
    return Result.failure(PortfolioWorkspaceAuthenticationError.credentialNotYetValid());
  }

  const principalType = resolvePrincipalType(input.claims, input.configuration.principalTypeStrategy);
  if (principalType === undefined) {
    return Result.failure(PortfolioWorkspaceAuthenticationError.subjectMissingOrInvalid());
  }

  const displayName = normalizeOptionalField(input.claims.displayName, 256);
  if (displayName === false) {
    return Result.failure(PortfolioWorkspaceAuthenticationError.subjectMissingOrInvalid());
  }

  return Result.success(Object.freeze({
    subject,
    principalType,
    ...(displayName === undefined ? {} : { displayName })
  }));
}

function sanitizeVerifierError(
  error: PortfolioWorkspaceAuthenticationError
): PortfolioWorkspaceAuthenticationError {
  if (error.reason === PortfolioWorkspaceAuthenticationFailureReason.AuthenticationUnavailable) {
    return PortfolioWorkspaceAuthenticationError.verifierUnavailable(error);
  }

  if (error.reason === PortfolioWorkspaceAuthenticationFailureReason.VerifierUnavailable) {
    return error;
  }

  return PortfolioWorkspaceAuthenticationError.verificationFailed(error);
}

function readBearerToken(value: unknown): string | undefined {
  if (value instanceof PortfolioWorkspaceBearerTokenCredential) {
    return value.token();
  }

  if (typeof value === "string") {
    return normalizeBearerToken(value);
  }

  if (typeof value === "object" && value !== null && "bearerToken" in value) {
    return normalizeBearerToken((value as { readonly bearerToken?: unknown }).bearerToken);
  }

  return undefined;
}

function normalizeBearerToken(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const withoutPrefix = value.startsWith(BEARER_PREFIX) ? value.slice(BEARER_PREFIX.length) : value;
  const normalized = withoutPrefix.trim();

  if (normalized.length === 0 || normalized.length > 4096 || containsUnsafeControlCharacters(normalized)) {
    return undefined;
  }

  return normalized;
}

function normalizeRequiredField(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  if (normalized.length === 0 || normalized.length > maxLength || containsUnsafeControlCharacters(normalized)) {
    return undefined;
  }

  return normalized;
}

function normalizeOptionalField(value: unknown, maxLength: number): string | undefined | false {
  if (value === undefined) {
    return undefined;
  }

  const normalized = normalizeRequiredField(value, maxLength);
  return normalized ?? false;
}

function normalizeUniqueFields(values: readonly string[] | undefined): readonly string[] | undefined {
  if (!Array.isArray(values) || values.length === 0) {
    return undefined;
  }

  const normalized = values.map((value) => normalizeRequiredField(value, MAX_FIELD_LENGTH));
  if (normalized.some((value) => value === undefined)) {
    return undefined;
  }

  return Object.freeze([...new Set(normalized as string[])]);
}

function normalizeAllowedAlgorithms(values: readonly string[] | undefined): readonly string[] | undefined {
  const algorithms = normalizeUniqueFields(values);
  if (algorithms === undefined || algorithms.some((algorithm) => algorithm.toLowerCase() === "none")) {
    return undefined;
  }

  return algorithms;
}

function normalizeClockTolerance(value: number | undefined): number | undefined {
  const tolerance = value ?? 0;
  if (!Number.isInteger(tolerance) || tolerance < 0 || tolerance > MAX_CLOCK_TOLERANCE_SECONDS) {
    return undefined;
  }

  return tolerance;
}

function normalizePrincipalTypeStrategy(
  value: PortfolioWorkspaceOidcJwtPrincipalTypeStrategy | undefined
): PortfolioWorkspaceOidcJwtPrincipalTypeStrategy | undefined {
  if (value === undefined) {
    return Object.freeze({
      kind: "fixed",
      principalType: PortfolioWorkspacePresentationPrincipalType.User
    });
  }

  if (value.kind === "fixed" && isPortfolioWorkspacePresentationPrincipalType(value.principalType)) {
    return Object.freeze({
      kind: "fixed",
      principalType: value.principalType
    });
  }

  if (value.kind === "claim") {
    const claimName = normalizeRequiredField(value.claimName, MAX_FIELD_LENGTH);
    const defaultPrincipalType = value.defaultPrincipalType;

    if (
      claimName !== undefined
      && (defaultPrincipalType === undefined || isPortfolioWorkspacePresentationPrincipalType(defaultPrincipalType))
    ) {
      return Object.freeze({
        kind: "claim",
        claimName,
        ...(defaultPrincipalType === undefined ? {} : { defaultPrincipalType })
      });
    }
  }

  return undefined;
}

function resolvePrincipalType(
  claims: PortfolioWorkspaceVerifiedJwtClaims,
  strategy: PortfolioWorkspaceOidcJwtPrincipalTypeStrategy
): PortfolioWorkspacePresentationPrincipalTypeValue | undefined {
  if (strategy.kind === "fixed") {
    return strategy.principalType;
  }

  if (claims.principalType !== undefined && isPortfolioWorkspacePresentationPrincipalType(claims.principalType)) {
    return claims.principalType;
  }

  return strategy.defaultPrincipalType;
}

function hasAcceptedAudience(tokenAudiences: readonly string[], acceptedAudiences: readonly string[]): boolean {
  return tokenAudiences.some((audience) => acceptedAudiences.includes(audience));
}

function containsUnsafeControlCharacters(value: string): boolean {
  return /[\u0000-\u001F\u007F]/u.test(value);
}
