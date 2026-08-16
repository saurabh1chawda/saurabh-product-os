import { Result } from "@career-companion/kernel";
import {
  createRemoteJWKSet,
  decodeProtectedHeader,
  errors as joseErrors,
  jwtVerify,
  type JWTPayload,
  type JWTVerifyGetKey,
  type ProtectedHeaderParameters
} from "jose";

import {
  PortfolioWorkspaceAuthenticationError
} from "./contracts";
import type {
  PortfolioWorkspaceOidcJwtAuthenticationConfigurationInput,
  PortfolioWorkspaceJwtVerifier,
  PortfolioWorkspaceJwtVerifierInput,
  PortfolioWorkspaceOidcJwtAuthenticationAdapterInput,
  PortfolioWorkspaceVerifiedJwtClaims
} from "./generic-oidc-jwt";
import {
  PortfolioWorkspaceOidcJwtAuthenticationAdapter,
  PortfolioWorkspaceOidcJwtAuthenticationConfiguration
} from "./generic-oidc-jwt";

const INSPECT_SYMBOL = Symbol.for("nodejs.util.inspect.custom");
const MAX_JWKS_URI_LENGTH = 2048;
const MAX_TIMEOUT_MS = 10_000;
const MAX_CACHE_MAX_AGE_MS = 86_400_000;
const MAX_COOLDOWN_MS = 300_000;

export interface PortfolioWorkspaceJoseJwtVerifierConfigurationInput {
  readonly jwksUri: string;
  readonly requestTimeoutMs?: number;
  readonly cacheMaxAgeMs?: number;
  readonly cooldownDurationMs?: number;
}

export interface PortfolioWorkspaceJoseJwtVerifierConfigurationJson {
  readonly jwksUri: string;
  readonly requestTimeoutMs: number;
  readonly cacheMaxAgeMs: number;
  readonly cooldownDurationMs: number;
}

export class PortfolioWorkspaceJoseJwtVerifierConfiguration {
  readonly jwksUri: string;
  readonly requestTimeoutMs: number;
  readonly cacheMaxAgeMs: number;
  readonly cooldownDurationMs: number;

  private constructor(input: PortfolioWorkspaceJoseJwtVerifierConfigurationJson) {
    this.jwksUri = input.jwksUri;
    this.requestTimeoutMs = input.requestTimeoutMs;
    this.cacheMaxAgeMs = input.cacheMaxAgeMs;
    this.cooldownDurationMs = input.cooldownDurationMs;

    Object.freeze(this);
  }

  static create(
    input: PortfolioWorkspaceJoseJwtVerifierConfigurationInput
  ): Result<PortfolioWorkspaceJoseJwtVerifierConfiguration, PortfolioWorkspaceAuthenticationError> {
    const jwksUri = normalizeJwksUri(input.jwksUri);
    const requestTimeoutMs = normalizeDuration(input.requestTimeoutMs ?? 5_000, MAX_TIMEOUT_MS);
    const cacheMaxAgeMs = normalizeDuration(input.cacheMaxAgeMs ?? 300_000, MAX_CACHE_MAX_AGE_MS);
    const cooldownDurationMs = normalizeDuration(input.cooldownDurationMs ?? 30_000, MAX_COOLDOWN_MS);

    if (
      jwksUri === undefined
      || requestTimeoutMs === undefined
      || cacheMaxAgeMs === undefined
      || cooldownDurationMs === undefined
    ) {
      return Result.failure(PortfolioWorkspaceAuthenticationError.invalidAuthenticationConfiguration());
    }

    return Result.success(new PortfolioWorkspaceJoseJwtVerifierConfiguration({
      jwksUri,
      requestTimeoutMs,
      cacheMaxAgeMs,
      cooldownDurationMs
    }));
  }

  toJSON(): PortfolioWorkspaceJoseJwtVerifierConfigurationJson {
    return Object.freeze({
      jwksUri: this.jwksUri,
      requestTimeoutMs: this.requestTimeoutMs,
      cacheMaxAgeMs: this.cacheMaxAgeMs,
      cooldownDurationMs: this.cooldownDurationMs
    });
  }

  [INSPECT_SYMBOL](): PortfolioWorkspaceJoseJwtVerifierConfigurationJson {
    return this.toJSON();
  }
}

export interface PortfolioWorkspaceJoseJwtVerifierInput {
  readonly configuration: PortfolioWorkspaceJoseJwtVerifierConfiguration;
  readonly keyResolver?: JWTVerifyGetKey;
}

export interface PortfolioWorkspaceOidcJwtHostAuthenticationInput {
  readonly authentication: PortfolioWorkspaceOidcJwtAuthenticationConfigurationInput;
  readonly verifier: PortfolioWorkspaceJoseJwtVerifierConfigurationInput;
}

export class PortfolioWorkspaceJoseJwtVerifier implements PortfolioWorkspaceJwtVerifier {
  readonly #keyResolver: JWTVerifyGetKey;

  constructor(input: PortfolioWorkspaceJoseJwtVerifierInput) {
    this.#keyResolver = input.keyResolver ?? createRemoteJWKSet(new URL(input.configuration.jwksUri), {
      cacheMaxAge: input.configuration.cacheMaxAgeMs,
      cooldownDuration: input.configuration.cooldownDurationMs,
      timeoutDuration: input.configuration.requestTimeoutMs
    });

    Object.freeze(this);
  }

  async verify(
    input: PortfolioWorkspaceJwtVerifierInput
  ): Promise<Result<PortfolioWorkspaceVerifiedJwtClaims, PortfolioWorkspaceAuthenticationError>> {
    const headerResult = validateProtectedHeader({
      token: input.token,
      allowedAlgorithms: input.requirements.allowedAlgorithms
    });

    if (headerResult.isFailure) {
      return Result.failure(headerResult.error!);
    }

    try {
      const verified = await jwtVerify(input.token, this.#keyResolver, {
        algorithms: [...input.requirements.allowedAlgorithms]
      });

      return mapVerifiedPayload({
        header: verified.protectedHeader,
        payload: verified.payload
      });
    } catch (error) {
      return Result.failure(mapJoseFailure(error));
    }
  }
}

export function createPortfolioWorkspaceOidcJwtAuthenticationAdapter(
  input: PortfolioWorkspaceOidcJwtHostAuthenticationInput
): Result<PortfolioWorkspaceOidcJwtAuthenticationAdapter, PortfolioWorkspaceAuthenticationError> {
  const authenticationConfiguration = PortfolioWorkspaceOidcJwtAuthenticationConfiguration.create(input.authentication);
  if (authenticationConfiguration.isFailure) {
    return Result.failure(authenticationConfiguration.error!);
  }

  const verifierConfiguration = PortfolioWorkspaceJoseJwtVerifierConfiguration.create(input.verifier);
  if (verifierConfiguration.isFailure) {
    return Result.failure(verifierConfiguration.error!);
  }

  const adapterInput: PortfolioWorkspaceOidcJwtAuthenticationAdapterInput = {
    configuration: authenticationConfiguration.value!,
    verifier: new PortfolioWorkspaceJoseJwtVerifier({
      configuration: verifierConfiguration.value!
    })
  };

  return Result.success(new PortfolioWorkspaceOidcJwtAuthenticationAdapter(adapterInput));
}

function validateProtectedHeader(input: {
  readonly token: string;
  readonly allowedAlgorithms: readonly string[];
}): Result<ProtectedHeaderParameters, PortfolioWorkspaceAuthenticationError> {
  let header: ProtectedHeaderParameters;
  try {
    header = decodeProtectedHeader(input.token);
  } catch {
    return Result.failure(PortfolioWorkspaceAuthenticationError.credentialMalformed());
  }

  if (header.kid === undefined || typeof header.kid !== "string" || header.kid.trim().length === 0) {
    return Result.failure(PortfolioWorkspaceAuthenticationError.verificationFailed());
  }

  if (header.alg === undefined || !input.allowedAlgorithms.includes(header.alg)) {
    return Result.failure(PortfolioWorkspaceAuthenticationError.algorithmRejected());
  }

  return Result.success(header);
}

function mapVerifiedPayload(input: {
  readonly header: ProtectedHeaderParameters;
  readonly payload: JWTPayload;
}): Result<PortfolioWorkspaceVerifiedJwtClaims, PortfolioWorkspaceAuthenticationError> {
  const issuer = stringClaim(input.payload.iss);
  const subject = stringClaim(input.payload.sub);
  const algorithm = stringClaim(input.header.alg);
  const audiences = audienceClaims(input.payload.aud);

  if (
    issuer === undefined
    || subject === undefined
    || algorithm === undefined
    || audiences.length === 0
    || typeof input.payload.exp !== "number"
  ) {
    return Result.failure(PortfolioWorkspaceAuthenticationError.verificationFailed());
  }

  return Result.success(Object.freeze({
    issuer,
    audiences,
    subject,
    algorithm,
    expiresAtEpochSeconds: input.payload.exp,
    ...(typeof input.payload.nbf === "number" ? { notBeforeEpochSeconds: input.payload.nbf } : {}),
    ...(typeof input.payload.iat === "number" ? { issuedAtEpochSeconds: input.payload.iat } : {}),
    ...(stringClaim(input.payload.name) === undefined ? {} : { displayName: stringClaim(input.payload.name) }),
    ...(stringClaim(input.payload.principal_type) === undefined ? {} : { principalType: stringClaim(input.payload.principal_type) })
  }));
}

function mapJoseFailure(error: unknown): PortfolioWorkspaceAuthenticationError {
  if (
    error instanceof joseErrors.JWKSNoMatchingKey
    || error instanceof joseErrors.JWKSInvalid
    || error instanceof joseErrors.JWKSMultipleMatchingKeys
    || error instanceof joseErrors.JWKSTimeout
  ) {
    return PortfolioWorkspaceAuthenticationError.verifierUnavailable(error);
  }

  if (error instanceof joseErrors.JWTExpired) {
    return PortfolioWorkspaceAuthenticationError.credentialExpired();
  }

  if (error instanceof joseErrors.JWTClaimValidationFailed) {
    return PortfolioWorkspaceAuthenticationError.verificationFailed(error);
  }

  if (
    error instanceof joseErrors.JWSInvalid
    || error instanceof joseErrors.JWTInvalid
    || error instanceof joseErrors.JWSSignatureVerificationFailed
    || error instanceof joseErrors.JOSEAlgNotAllowed
  ) {
    return PortfolioWorkspaceAuthenticationError.verificationFailed(error);
  }

  return PortfolioWorkspaceAuthenticationError.verifierUnavailable(error);
}

function normalizeJwksUri(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  if (normalized.length === 0 || normalized.length > MAX_JWKS_URI_LENGTH || containsUnsafeControlCharacters(normalized)) {
    return undefined;
  }

  let url: URL;
  try {
    url = new URL(normalized);
  } catch {
    return undefined;
  }

  if (url.protocol !== "https:" || url.username !== "" || url.password !== "" || url.hash !== "") {
    return undefined;
  }

  return url.toString();
}

function normalizeDuration(value: unknown, max: number): number | undefined {
  if (!Number.isInteger(value) || (value as number) < 0 || (value as number) > max) {
    return undefined;
  }

  return value as number;
}

function stringClaim(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function audienceClaims(value: unknown): readonly string[] {
  if (typeof value === "string") {
    return Object.freeze([value]);
  }

  if (Array.isArray(value)) {
    return Object.freeze(value.filter((audience): audience is string => typeof audience === "string" && audience.trim().length > 0));
  }

  return Object.freeze([]);
}

function containsUnsafeControlCharacters(value: string): boolean {
  return /[\u0000-\u001F\u007F]/u.test(value);
}
