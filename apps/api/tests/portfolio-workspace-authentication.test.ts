import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { Result } from "@career-companion/kernel";
import { SignJWT, generateKeyPair, type JWTVerifyGetKey } from "jose";
import { describe, expect, it } from "vitest";
import {
  PortfolioWorkspaceAuthenticatedIdentity,
  PortfolioWorkspaceAuthenticationError,
  PortfolioWorkspaceAuthenticationFailureReason,
  PortfolioWorkspaceBearerTokenCredential,
  PortfolioWorkspaceCommandContextFactory,
  PortfolioWorkspaceJoseJwtVerifier,
  PortfolioWorkspaceJoseJwtVerifierConfiguration,
  PortfolioWorkspaceOidcJwtAuthenticationAdapter,
  PortfolioWorkspaceOidcJwtAuthenticationConfiguration,
  PortfolioWorkspacePresentationErrorCategory,
  PortfolioWorkspacePresentationErrorCode,
  PortfolioWorkspacePresentationPrincipalType,
  authenticatePortfolioWorkspacePrincipal,
  authorizationResourceReferenceForPrincipal,
  createPortfolioWorkspaceOidcJwtAuthenticationAdapter,
  mapAuthenticatedIdentityToPresentationPrincipal,
  mapPortfolioWorkspaceAuthenticationErrorToPresentationError,
  type PortfolioWorkspaceAuthenticationAdapter,
  type PortfolioWorkspaceAuthenticationFailureReasonValue,
  type PortfolioWorkspaceExternalAuthenticationContext,
  type PortfolioWorkspaceJwtVerifier,
  type PortfolioWorkspaceJwtVerifierInput,
  type PortfolioWorkspaceVerifiedJwtClaims
} from "../src";

describe("Portfolio Workspace provider-neutral authentication boundary", () => {
  it("maps valid human identity into a trusted presentation principal", async () => {
    const identity = expectIdentity(PortfolioWorkspaceAuthenticatedIdentity.create({
      provider: "career-auth",
      subject: "user-123",
      principalType: PortfolioWorkspacePresentationPrincipalType.User,
      displayName: "User One"
    }));

    const principalResult = mapAuthenticatedIdentityToPresentationPrincipal(identity);

    expect(principalResult.isSuccess).toBe(true);
    expect(principalResult.value!.toJSON()).toEqual({
      principalId: "user-123",
      principalType: "user",
      authenticationProvider: "career-auth",
      displayName: "User One"
    });
    expect(Object.isFrozen(principalResult.value!)).toBe(true);

    const authenticated = await authenticatePortfolioWorkspacePrincipal({
      adapter: new FixedAuthenticationAdapter(Result.success(identity)),
      context: externalContext()
    });

    expect(authenticated.isSuccess).toBe(true);
    expect(authenticated.value!.equals(principalResult.value!)).toBe(true);
  });

  it("maps valid service identity into a trusted presentation principal without privilege data", () => {
    const identity = expectIdentity(PortfolioWorkspaceAuthenticatedIdentity.create({
      provider: "career-auth",
      subject: "service-worker",
      principalType: PortfolioWorkspacePresentationPrincipalType.Service
    }));

    const principal = mapAuthenticatedIdentityToPresentationPrincipal(identity).value!;

    expect(principal.toJSON()).toEqual({
      principalId: "service-worker",
      principalType: "service",
      authenticationProvider: "career-auth"
    });
    expect(principal).not.toHaveProperty("roles");
    expect(principal).not.toHaveProperty("permissions");
    expect(principal).not.toHaveProperty("authorizationResourceReference");
  });

  it("returns safe authentication-required and invalid-authentication failures", async () => {
    const required = await authenticatePortfolioWorkspacePrincipal({
      adapter: new FixedAuthenticationAdapter(Result.failure(PortfolioWorkspaceAuthenticationError.authenticationRequired())),
      context: {}
    });
    const invalid = await authenticatePortfolioWorkspacePrincipal({
      adapter: new FixedAuthenticationAdapter(Result.failure(PortfolioWorkspaceAuthenticationError.authenticationInvalid())),
      context: externalContext()
    });

    expect(required.isFailure).toBe(true);
    expect(required.error!.reason).toBe(PortfolioWorkspaceAuthenticationFailureReason.AuthenticationRequired);
    expect(invalid.isFailure).toBe(true);
    expect(invalid.error!.reason).toBe(PortfolioWorkspaceAuthenticationFailureReason.AuthenticationInvalid);

    const requiredPresentation = mapPortfolioWorkspaceAuthenticationErrorToPresentationError(
      required.error!,
      "correlation:auth-required"
    );
    const invalidPresentation = mapPortfolioWorkspaceAuthenticationErrorToPresentationError(
      invalid.error!,
      "correlation:auth-invalid"
    );

    expect(requiredPresentation.toJSON()).toMatchObject({
      category: PortfolioWorkspacePresentationErrorCategory.Unauthenticated,
      code: PortfolioWorkspacePresentationErrorCode.Unauthenticated,
      correlationId: "correlation:auth-required"
    });
    expect(invalidPresentation.toJSON()).toMatchObject({
      category: PortfolioWorkspacePresentationErrorCategory.Unauthenticated,
      code: PortfolioWorkspacePresentationErrorCode.Unauthenticated,
      correlationId: "correlation:auth-invalid"
    });
  });

  it("rejects malformed authenticated identity before it can become trusted", () => {
    const malformed = PortfolioWorkspaceAuthenticatedIdentity.create({
      provider: " ",
      subject: "user-123",
      principalType: PortfolioWorkspacePresentationPrincipalType.User
    });
    const malformedType = PortfolioWorkspaceAuthenticatedIdentity.create({
      provider: "career-auth",
      subject: "user-123",
      principalType: "admin" as never
    });

    expect(malformed.isFailure).toBe(true);
    expect(malformed.error!.reason).toBe(PortfolioWorkspaceAuthenticationFailureReason.InvalidAuthenticatedIdentity);
    expect(malformedType.isFailure).toBe(true);
    expect(malformedType.error!.reason).toBe(PortfolioWorkspaceAuthenticationFailureReason.InvalidAuthenticatedIdentity);
    expect(JSON.stringify(malformed.error)).not.toContain("user-123");
  });

  it("contains provider failures behind a safe unavailable error", async () => {
    const providerError = new Error("provider failed for raw-token:super-secret");
    providerError.name = "ProviderUnavailable";
    (providerError as { code?: string }).code = "PROVIDER_DOWN";

    const result = await authenticatePortfolioWorkspacePrincipal({
      adapter: new ThrowingAuthenticationAdapter(providerError),
      context: externalContext()
    });

    expect(result.isFailure).toBe(true);
    expect(result.error!.reason).toBe(PortfolioWorkspaceAuthenticationFailureReason.AuthenticationUnavailable);
    expect(result.error!.retryable).toBe(true);
    expect(result.error!.toJSON()).toEqual({
      name: "PortfolioWorkspaceAuthenticationError",
      code: "PORTFOLIO_WORKSPACE_AUTHENTICATION_FAILED",
      reason: "authentication-unavailable",
      retryable: true,
      causeName: "ProviderUnavailable",
      causeCode: "PROVIDER_DOWN"
    });
    expect(JSON.stringify(result.error)).not.toMatch(/raw-token|super-secret|provider failed/i);

    const presentation = mapPortfolioWorkspaceAuthenticationErrorToPresentationError(
      result.error!,
      "correlation:provider-down"
    );
    expect(presentation.toJSON()).toMatchObject({
      category: PortfolioWorkspacePresentationErrorCategory.Unavailable,
      code: PortfolioWorkspacePresentationErrorCode.PortfolioWorkspaceUnavailable,
      correlationId: "correlation:provider-down"
    });
  });

  it("does not carry raw tokens or provider claims into the trusted principal or safe errors", async () => {
    const context = externalContext();
    const identity = expectIdentity(PortfolioWorkspaceAuthenticatedIdentity.create({
      provider: "career-auth",
      subject: "user-privacy",
      principalType: PortfolioWorkspacePresentationPrincipalType.User
    }));

    const authenticated = await authenticatePortfolioWorkspacePrincipal({
      adapter: new FixedAuthenticationAdapter(Result.success(identity)),
      context
    });
    const rejected = await authenticatePortfolioWorkspacePrincipal({
      adapter: new FixedAuthenticationAdapter(Result.failure(PortfolioWorkspaceAuthenticationError.authenticationInvalid())),
      context
    });

    expect(JSON.stringify(authenticated.value)).not.toMatch(/raw-token|refresh-secret|claim-secret|email/i);
    expect(JSON.stringify(rejected.error)).not.toMatch(/raw-token|refresh-secret|claim-secret|email/i);
    expect(authenticated.value).not.toHaveProperty("credential");
    expect(authenticated.value).not.toHaveProperty("claims");
  });

  it("keeps authentication distinct from authorization for human and service principals", () => {
    const human = mapAuthenticatedIdentityToPresentationPrincipal(expectIdentity(PortfolioWorkspaceAuthenticatedIdentity.create({
      provider: "career-auth",
      subject: "same-subject",
      principalType: PortfolioWorkspacePresentationPrincipalType.User
    }))).value!;
    const service = mapAuthenticatedIdentityToPresentationPrincipal(expectIdentity(PortfolioWorkspaceAuthenticatedIdentity.create({
      provider: "career-auth",
      subject: "same-subject",
      principalType: PortfolioWorkspacePresentationPrincipalType.Service
    }))).value!;

    const humanResource = authorizationResourceReferenceForPrincipal(human);
    const serviceResource = authorizationResourceReferenceForPrincipal(service);

    expect(humanResource.equals(serviceResource)).toBe(false);
    expect(humanResource.toJSON().authorizationResourceReference).toMatch(/^portfolio-workspace:principal:user:/u);
    expect(serviceResource.toJSON().authorizationResourceReference).toMatch(/^portfolio-workspace:principal:service:/u);
    expect(JSON.stringify(service)).not.toMatch(/allow|bypass|admin|permission/i);
  });

  it("remains compatible with existing command-context and handler principal inputs", () => {
    const principal = mapAuthenticatedIdentityToPresentationPrincipal(expectIdentity(PortfolioWorkspaceAuthenticatedIdentity.create({
      provider: "career-auth",
      subject: "user-handler",
      principalType: PortfolioWorkspacePresentationPrincipalType.User
    }))).value!;
    const factory = new PortfolioWorkspaceCommandContextFactory({
      commandIdGenerator: { generate: () => "command:auth" },
      correlationIdGenerator: { generate: () => "correlation:auth" },
      clock: { now: () => new Date("2026-01-01T00:00:00.000Z") }
    });

    const context = factory.createCommandContext({
      principal,
      incomingCorrelationId: "correlation:incoming-auth"
    });

    expect(context.isSuccess).toBe(true);
    expect(context.value!.toJSON()).toMatchObject({
      commandId: "command:auth",
      correlationId: "correlation:incoming-auth",
      actorReference: "user:career-auth:user-handler"
    });
  });

  it("keeps authentication source provider-neutral and outside Domain/Application", () => {
    const authenticationSource = readSource(join(packageRoot(), "apps", "api", "src", "portfolio-workspace", "authentication"));
    const domainSource = readSource(join(packageRoot(), "packages", "portfolio-workspace", "src"));
    const applicationSource = readSource(join(packageRoot(), "packages", "portfolio-workspace-application", "src"));

    expect(domainSource).not.toContain("PortfolioWorkspaceAuthentication");
    expect(applicationSource).not.toContain("PortfolioWorkspaceAuthentication");
    expect(authenticationSource).not.toContain("@career-companion/infrastructure");
    expect(authenticationSource).not.toContain("@career-companion/portfolio-workspace-application");
    expect(authenticationSource).not.toContain("Postgres");
    expect(authenticationSource).not.toContain("Drizzle");
    expect(authenticationSource).not.toContain("Pool");
    expect(authenticationSource).not.toContain("express");
    expect(authenticationSource).not.toContain("fastify");
    expect(authenticationSource).not.toContain("next/");
    expect(authenticationSource).not.toContain(["json", "webtoken"].join(""));
    expect(authenticationSource).not.toContain(["OAuth"].join(""));
    expect(authenticationSource).not.toContain(["Auth", "0"].join(""));
    expect(authenticationSource).not.toContain(["Cl", "erk"].join(""));
    expect(authenticationSource).not.toContain(["Cog", "nito"].join(""));
    expect(authenticationSource).not.toContain(["Ok", "ta"].join(""));
  });
});

describe("Portfolio Workspace generic OIDC/JWT authentication adapter", () => {
  it("authenticates valid user JWT claims and passes verification requirements", async () => {
    const verifier = new RecordingJwtVerifier(Result.success(validClaims()));
    const adapter = oidcAdapter(verifier);

    const result = await authenticatePortfolioWorkspacePrincipal({
      adapter,
      context: bearerContext("Bearer jwt-user")
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value!.toJSON()).toEqual({
      principalId: "user-oidc",
      principalType: "user",
      authenticationProvider: "career-oidc",
      displayName: "User OIDC"
    });
    expect(verifier.calls).toHaveLength(1);
    expect(verifier.calls[0]).toEqual({
      token: "jwt-user",
      requirements: {
        issuer: "https://issuer.example.test",
        audiences: ["portfolio-workspace-api"],
        allowedAlgorithms: ["RS256"]
      }
    });
  });

  it("authenticates valid service JWT claims without authorization privileges", async () => {
    const configuration = expectConfiguration(PortfolioWorkspaceOidcJwtAuthenticationConfiguration.create({
      issuer: "https://issuer.example.test",
      audiences: ["portfolio-workspace-api"],
      allowedAlgorithms: ["RS256"],
      authenticationProvider: "career-oidc",
      principalTypeStrategy: {
        kind: "claim",
        claimName: "principal_type"
      }
    }));
    const adapter = new PortfolioWorkspaceOidcJwtAuthenticationAdapter({
      configuration,
      verifier: new RecordingJwtVerifier(Result.success(validClaims({
        subject: "service-oidc",
        principalType: "service",
        displayName: undefined
      }))),
      clock: fixedClock()
    });

    const result = await authenticatePortfolioWorkspacePrincipal({
      adapter,
      context: bearerContext("jwt-service")
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value!.toJSON()).toEqual({
      principalId: "service-oidc",
      principalType: "service",
      authenticationProvider: "career-oidc"
    });
    expect(result.value).not.toHaveProperty("roles");
    expect(result.value).not.toHaveProperty("permissions");
  });

  it("fails closed for issuer, audience, algorithm, subject, expiry, and not-before violations", async () => {
    await expectAuthenticationFailure(validClaims({ issuer: "https://other.example.test" }), PortfolioWorkspaceAuthenticationFailureReason.IssuerMismatch);
    await expectAuthenticationFailure(validClaims({ audiences: ["other-api"] }), PortfolioWorkspaceAuthenticationFailureReason.AudienceMismatch);
    await expectAuthenticationFailure(validClaims({ algorithm: "HS256" }), PortfolioWorkspaceAuthenticationFailureReason.AlgorithmRejected);
    await expectAuthenticationFailure(validClaims({ subject: " " }), PortfolioWorkspaceAuthenticationFailureReason.SubjectMissingOrInvalid);
    await expectAuthenticationFailure(validClaims({ expiresAtEpochSeconds: 1_767_225_599 }), PortfolioWorkspaceAuthenticationFailureReason.CredentialExpired);
    await expectAuthenticationFailure(validClaims({ notBeforeEpochSeconds: 1_767_225_661 }), PortfolioWorkspaceAuthenticationFailureReason.CredentialNotYetValid);
  });

  it("honors bounded clock tolerance at expiry and not-before boundaries", async () => {
    const configuration = expectConfiguration(PortfolioWorkspaceOidcJwtAuthenticationConfiguration.create({
      issuer: "https://issuer.example.test",
      audiences: ["portfolio-workspace-api"],
      allowedAlgorithms: ["RS256"],
      clockToleranceSeconds: 60,
      authenticationProvider: "career-oidc"
    }));
    const adapter = new PortfolioWorkspaceOidcJwtAuthenticationAdapter({
      configuration,
      verifier: new RecordingJwtVerifier(Result.success(validClaims({
        expiresAtEpochSeconds: 1_767_225_540,
        notBeforeEpochSeconds: 1_767_225_660
      }))),
      clock: fixedClock()
    });

    const result = await adapter.authenticate(bearerContext("jwt-tolerated"));

    expect(result.isSuccess).toBe(true);
  });

  it("rejects malformed bearer credentials without invoking the verifier", async () => {
    const verifier = new RecordingJwtVerifier(Result.success(validClaims()));
    const adapter = oidcAdapter(verifier);

    const result = await adapter.authenticate(bearerContext("   "));

    expect(result.isFailure).toBe(true);
    expect(result.error!.reason).toBe(PortfolioWorkspaceAuthenticationFailureReason.CredentialMalformed);
    expect(verifier.calls).toHaveLength(0);
  });

  it("maps verifier rejection and verifier infrastructure failure safely", async () => {
    const rejected = await oidcAdapter(new RecordingJwtVerifier(
      Result.failure(PortfolioWorkspaceAuthenticationError.authenticationInvalid())
    )).authenticate(bearerContext("jwt-rejected"));
    const unavailable = await oidcAdapter(new RecordingJwtVerifier(
      Result.failure(PortfolioWorkspaceAuthenticationError.authenticationUnavailable(new Error("jwks failed for raw-token")))
    )).authenticate(bearerContext("jwt-unavailable"));
    const thrown = await oidcAdapter(new ThrowingJwtVerifier()).authenticate(bearerContext("jwt-throw"));

    expect(rejected.isFailure).toBe(true);
    expect(rejected.error!.reason).toBe(PortfolioWorkspaceAuthenticationFailureReason.VerificationFailed);
    expect(rejected.error!.retryable).toBe(false);
    expect(unavailable.isFailure).toBe(true);
    expect(unavailable.error!.reason).toBe(PortfolioWorkspaceAuthenticationFailureReason.VerifierUnavailable);
    expect(unavailable.error!.retryable).toBe(true);
    expect(JSON.stringify(unavailable.error)).not.toMatch(/raw-token|jwks failed/i);
    expect(thrown.isFailure).toBe(true);
    expect(thrown.error!.reason).toBe(PortfolioWorkspaceAuthenticationFailureReason.VerifierUnavailable);
    expect(JSON.stringify(thrown.error)).not.toMatch(/jwt-throw|network secret/i);
  });

  it("rejects invalid generic authentication configuration", () => {
    const noneAlgorithm = PortfolioWorkspaceOidcJwtAuthenticationConfiguration.create({
      issuer: "https://issuer.example.test",
      audiences: ["portfolio-workspace-api"],
      allowedAlgorithms: ["none"],
      authenticationProvider: "career-oidc"
    });
    const missingAudience = PortfolioWorkspaceOidcJwtAuthenticationConfiguration.create({
      issuer: "https://issuer.example.test",
      audiences: [],
      allowedAlgorithms: ["RS256"],
      authenticationProvider: "career-oidc"
    });
    const excessiveTolerance = PortfolioWorkspaceOidcJwtAuthenticationConfiguration.create({
      issuer: "https://issuer.example.test",
      audiences: ["portfolio-workspace-api"],
      allowedAlgorithms: ["RS256"],
      clockToleranceSeconds: 301,
      authenticationProvider: "career-oidc"
    });

    expect(noneAlgorithm.isFailure).toBe(true);
    expect(missingAudience.isFailure).toBe(true);
    expect(excessiveTolerance.isFailure).toBe(true);
    expect(noneAlgorithm.error!.reason).toBe(PortfolioWorkspaceAuthenticationFailureReason.InvalidAuthenticationConfiguration);
  });

  it("keeps raw bearer tokens and verified claims out of serialization and trusted principals", async () => {
    const credential = PortfolioWorkspaceBearerTokenCredential.create("Bearer raw-token-super-secret").value!;
    const adapter = oidcAdapter(new RecordingJwtVerifier(Result.success(validClaims({
      subject: "privacy-subject",
      displayName: "Privacy User"
    }))));

    const result = await authenticatePortfolioWorkspacePrincipal({
      adapter,
      context: { credential }
    });

    expect(JSON.stringify(credential)).toEqual("{\"credentialType\":\"bearer-token\",\"redacted\":true}");
    expect(JSON.stringify(result.value)).not.toMatch(/raw-token-super-secret|issuer|audiences|RS256|expiresAt/i);
    expect(result.value).not.toHaveProperty("claims");
    expect(result.value).not.toHaveProperty("credential");
  });

  it("does not retain token or identity state across repeated calls", async () => {
    const verifier = new SequenceJwtVerifier([
      validClaims({ subject: "first-user" }),
      validClaims({ subject: "second-user" })
    ]);
    const adapter = oidcAdapter(verifier);

    const first = await authenticatePortfolioWorkspacePrincipal({ adapter, context: bearerContext("jwt-first") });
    const second = await authenticatePortfolioWorkspacePrincipal({ adapter, context: bearerContext("jwt-second") });

    expect(first.value!.principalId).toBe("first-user");
    expect(second.value!.principalId).toBe("second-user");
    expect(verifier.calls.map((call) => call.token)).toEqual(["jwt-first", "jwt-second"]);
  });

  it("keeps generic OIDC/JWT authentication source provider-neutral and API-local", () => {
    const authenticationSource = readSource(join(packageRoot(), "apps", "api", "src", "portfolio-workspace", "authentication"));
    const domainSource = readSource(join(packageRoot(), "packages", "portfolio-workspace", "src"));
    const applicationSource = readSource(join(packageRoot(), "packages", "portfolio-workspace-application", "src"));

    expect(domainSource).not.toContain("PortfolioWorkspaceOidcJwt");
    expect(applicationSource).not.toContain("PortfolioWorkspaceOidcJwt");
    expect(authenticationSource).not.toContain("@career-companion/infrastructure");
    expect(authenticationSource).not.toContain("@career-companion/portfolio-workspace-application");
    expect(authenticationSource).not.toContain("process.env");
    expect(authenticationSource).not.toContain("fetch(");
    expect(authenticationSource).not.toContain(["create", "Verify"].join(""));
    expect(authenticationSource).not.toContain(["create", "PublicKey"].join(""));
    expect(authenticationSource).not.toContain(["json", "webtoken"].join(""));
    expect(authenticationSource).not.toContain(["Auth", "0"].join(""));
    expect(authenticationSource).not.toContain(["Cl", "erk"].join(""));
    expect(authenticationSource).not.toContain(["Cog", "nito"].join(""));
    expect(authenticationSource).not.toContain(["Ok", "ta"].join(""));
    expect(authenticationSource).not.toContain("express");
    expect(authenticationSource).not.toContain("fastify");
    expect(authenticationSource).not.toContain("next/");
  });
});

describe("Portfolio Workspace concrete JOSE JWT verifier", () => {
  it("verifies a signed user JWT and composes with the generic authentication adapter", async () => {
    const keyPair = await testKeyPair();
    const token = await signedToken({
      key: keyPair.privateKey,
      kid: "kid-user",
      claims: signedClaims({ subject: "user-jose", displayName: "JOSE User" })
    });
    const adapter = new PortfolioWorkspaceOidcJwtAuthenticationAdapter({
      configuration: oidcConfiguration(),
      verifier: joseVerifier(keyResolverFor("kid-user", keyPair.publicKey)),
      clock: fixedClock()
    });

    const result = await authenticatePortfolioWorkspacePrincipal({
      adapter,
      context: bearerContext(`Bearer ${token}`)
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value!.toJSON()).toEqual({
      principalId: "user-jose",
      principalType: "user",
      authenticationProvider: "career-oidc",
      displayName: "JOSE User"
    });
  });

  it("verifies a signed service JWT through explicit principal-type claims", async () => {
    const keyPair = await testKeyPair();
    const token = await signedToken({
      key: keyPair.privateKey,
      kid: "kid-service",
      claims: signedClaims({
        subject: "service-jose",
        displayName: undefined,
        principalType: "service"
      })
    });
    const adapter = new PortfolioWorkspaceOidcJwtAuthenticationAdapter({
      configuration: oidcConfiguration({
        principalTypeStrategy: {
          kind: "claim",
          claimName: "principal_type"
        }
      }),
      verifier: joseVerifier(keyResolverFor("kid-service", keyPair.publicKey)),
      clock: fixedClock()
    });

    const result = await authenticatePortfolioWorkspacePrincipal({
      adapter,
      context: bearerContext(token)
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value!.toJSON()).toEqual({
      principalId: "service-jose",
      principalType: "service",
      authenticationProvider: "career-oidc"
    });
    expect(result.value).not.toHaveProperty("roles");
    expect(result.value).not.toHaveProperty("permissions");
  });

  it("fails safely for malformed token, invalid signature, missing kid, unknown kid, and disallowed algorithm", async () => {
    const keyPair = await testKeyPair();
    const otherKeyPair = await testKeyPair();
    const valid = await signedToken({
      key: keyPair.privateKey,
      kid: "kid-valid",
      claims: signedClaims()
    });
    const invalidSignature = await signedToken({
      key: otherKeyPair.privateKey,
      kid: "kid-valid",
      claims: signedClaims()
    });
    const missingKid = await new SignJWT(signedClaims())
      .setProtectedHeader({ alg: "RS256" })
      .sign(keyPair.privateKey);

    await expectJoseFailure("not-a-jwt", PortfolioWorkspaceAuthenticationFailureReason.CredentialMalformed, keyResolverFor("kid-valid", keyPair.publicKey));
    await expectJoseFailure(invalidSignature, PortfolioWorkspaceAuthenticationFailureReason.VerificationFailed, keyResolverFor("kid-valid", keyPair.publicKey));
    await expectJoseFailure(missingKid, PortfolioWorkspaceAuthenticationFailureReason.VerificationFailed, keyResolverFor("kid-valid", keyPair.publicKey));
    await expectJoseFailure(valid, PortfolioWorkspaceAuthenticationFailureReason.VerifierUnavailable, keyResolverFor("other-kid", keyPair.publicKey));
    await expectJoseFailure(valid, PortfolioWorkspaceAuthenticationFailureReason.AlgorithmRejected, keyResolverFor("kid-valid", keyPair.publicKey), ["ES256"]);
  });

  it("maps key-resolution and verifier infrastructure failures without leaking token material", async () => {
    const keyPair = await testKeyPair();
    const token = await signedToken({
      key: keyPair.privateKey,
      kid: "kid-down",
      claims: signedClaims()
    });
    const verifier = joseVerifier(async () => {
      throw new Error("jwks response includes raw-token-secret");
    });

    const result = await verifier.verify({
      token,
      requirements: {
        issuer: "https://issuer.example.test",
        audiences: ["portfolio-workspace-api"],
        allowedAlgorithms: ["RS256"]
      }
    });

    expect(result.isFailure).toBe(true);
    expect(result.error!.reason).toBe(PortfolioWorkspaceAuthenticationFailureReason.VerifierUnavailable);
    expect(result.error!.retryable).toBe(true);
    expect(JSON.stringify(result.error)).not.toMatch(/raw-token-secret|jwks response/i);
  });

  it("validates concrete verifier configuration for HTTPS JWKS and bounded cache settings", () => {
    const valid = PortfolioWorkspaceJoseJwtVerifierConfiguration.create({
      jwksUri: "https://issuer.example.test/.well-known/jwks.json",
      requestTimeoutMs: 5_000,
      cacheMaxAgeMs: 300_000,
      cooldownDurationMs: 30_000
    });
    const http = PortfolioWorkspaceJoseJwtVerifierConfiguration.create({
      jwksUri: "http://issuer.example.test/.well-known/jwks.json"
    });
    const credentialUrl = PortfolioWorkspaceJoseJwtVerifierConfiguration.create({
      jwksUri: "https://user:secret@issuer.example.test/.well-known/jwks.json"
    });
    const excessiveTimeout = PortfolioWorkspaceJoseJwtVerifierConfiguration.create({
      jwksUri: "https://issuer.example.test/.well-known/jwks.json",
      requestTimeoutMs: 10_001
    });

    expect(valid.isSuccess).toBe(true);
    expect(Object.isFrozen(valid.value!)).toBe(true);
    expect(http.isFailure).toBe(true);
    expect(credentialUrl.isFailure).toBe(true);
    expect(excessiveTimeout.isFailure).toBe(true);
  });

  it("creates the host authentication adapter from explicit configuration without environment access", () => {
    const result = createPortfolioWorkspaceOidcJwtAuthenticationAdapter({
      authentication: {
        issuer: "https://issuer.example.test",
        audiences: ["portfolio-workspace-api"],
        allowedAlgorithms: ["RS256"],
        authenticationProvider: "career-oidc"
      },
      verifier: {
        jwksUri: "https://issuer.example.test/.well-known/jwks.json"
      }
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBeInstanceOf(PortfolioWorkspaceOidcJwtAuthenticationAdapter);
  });

  it("keeps concrete JOSE verifier source provider-neutral, route-free, and storage-free", () => {
    const joseSource = readFileSync(
      join(packageRoot(), "apps", "api", "src", "portfolio-workspace", "authentication", "jose-jwt-verifier.ts"),
      "utf8"
    );
    const domainSource = readSource(join(packageRoot(), "packages", "portfolio-workspace", "src"));
    const applicationSource = readSource(join(packageRoot(), "packages", "portfolio-workspace-application", "src"));

    expect(domainSource).not.toContain("PortfolioWorkspaceJoseJwtVerifier");
    expect(applicationSource).not.toContain("PortfolioWorkspaceJoseJwtVerifier");
    expect(joseSource).not.toContain("@career-companion/infrastructure");
    expect(joseSource).not.toContain("@career-companion/portfolio-workspace-application");
    expect(joseSource).not.toContain("process.env");
    expect(joseSource).not.toContain("express");
    expect(joseSource).not.toContain("fastify");
    expect(joseSource).not.toContain("next/");
    expect(joseSource).not.toContain("localStorage");
    expect(joseSource).not.toContain("sessionStorage");
    expect(joseSource).not.toContain(["Auth", "0"].join(""));
    expect(joseSource).not.toContain(["Cl", "erk"].join(""));
    expect(joseSource).not.toContain(["Cog", "nito"].join(""));
    expect(joseSource).not.toContain(["Ok", "ta"].join(""));
    expect(joseSource).not.toContain(["create", "Verify"].join(""));
    expect(joseSource).not.toContain(["create", "PublicKey"].join(""));
  });
});

class FixedAuthenticationAdapter implements PortfolioWorkspaceAuthenticationAdapter {
  constructor(
    private readonly result: Result<PortfolioWorkspaceAuthenticatedIdentity, PortfolioWorkspaceAuthenticationError>
  ) {}

  async authenticate(
    context: PortfolioWorkspaceExternalAuthenticationContext
  ): Promise<Result<PortfolioWorkspaceAuthenticatedIdentity, PortfolioWorkspaceAuthenticationError>> {
    void context;

    return this.result;
  }
}

class ThrowingAuthenticationAdapter implements PortfolioWorkspaceAuthenticationAdapter {
  constructor(private readonly error: Error) {}

  async authenticate(
    context: PortfolioWorkspaceExternalAuthenticationContext
  ): Promise<Result<PortfolioWorkspaceAuthenticatedIdentity, PortfolioWorkspaceAuthenticationError>> {
    void context;

    throw this.error;
  }
}

class RecordingJwtVerifier implements PortfolioWorkspaceJwtVerifier {
  readonly calls: PortfolioWorkspaceJwtVerifierInput[] = [];

  constructor(
    private readonly result: Result<PortfolioWorkspaceVerifiedJwtClaims, PortfolioWorkspaceAuthenticationError>
  ) {}

  async verify(
    input: PortfolioWorkspaceJwtVerifierInput
  ): Promise<Result<PortfolioWorkspaceVerifiedJwtClaims, PortfolioWorkspaceAuthenticationError>> {
    this.calls.push(input);

    return this.result;
  }
}

class SequenceJwtVerifier implements PortfolioWorkspaceJwtVerifier {
  readonly calls: PortfolioWorkspaceJwtVerifierInput[] = [];

  constructor(private readonly claims: PortfolioWorkspaceVerifiedJwtClaims[]) {}

  async verify(
    input: PortfolioWorkspaceJwtVerifierInput
  ): Promise<Result<PortfolioWorkspaceVerifiedJwtClaims, PortfolioWorkspaceAuthenticationError>> {
    this.calls.push(input);
    const claims = this.claims.shift();
    if (claims === undefined) {
      throw new Error("Unexpected verifier call.");
    }

    return Result.success(claims);
  }
}

class ThrowingJwtVerifier implements PortfolioWorkspaceJwtVerifier {
  async verify(
    input: PortfolioWorkspaceJwtVerifierInput
  ): Promise<Result<PortfolioWorkspaceVerifiedJwtClaims, PortfolioWorkspaceAuthenticationError>> {
    void input;

    throw new Error("network secret failure");
  }
}

function expectIdentity(
  result: Result<PortfolioWorkspaceAuthenticatedIdentity, PortfolioWorkspaceAuthenticationError>
): PortfolioWorkspaceAuthenticatedIdentity {
  if (result.isFailure) {
    throw new Error("Expected authenticated identity fixture.");
  }

  return result.value!;
}

function expectConfiguration(
  result: Result<PortfolioWorkspaceOidcJwtAuthenticationConfiguration, PortfolioWorkspaceAuthenticationError>
): PortfolioWorkspaceOidcJwtAuthenticationConfiguration {
  if (result.isFailure) {
    throw new Error("Expected OIDC/JWT configuration fixture.");
  }

  return result.value!;
}

function oidcAdapter(verifier: PortfolioWorkspaceJwtVerifier): PortfolioWorkspaceOidcJwtAuthenticationAdapter {
  return new PortfolioWorkspaceOidcJwtAuthenticationAdapter({
    configuration: oidcConfiguration(),
    verifier,
    clock: fixedClock()
  });
}

function oidcConfiguration(
  overrides: Partial<Parameters<typeof PortfolioWorkspaceOidcJwtAuthenticationConfiguration.create>[0]> = {}
): PortfolioWorkspaceOidcJwtAuthenticationConfiguration {
  return expectConfiguration(PortfolioWorkspaceOidcJwtAuthenticationConfiguration.create({
      issuer: "https://issuer.example.test",
      audiences: ["portfolio-workspace-api"],
      allowedAlgorithms: ["RS256"],
      authenticationProvider: "career-oidc",
      ...overrides
  }));
}

function fixedClock(): { readonly now: () => Date } {
  return {
    now: () => new Date("2026-01-01T00:00:00.000Z")
  };
}

function bearerContext(token: unknown): PortfolioWorkspaceExternalAuthenticationContext {
  return Object.freeze({
    credential: Object.freeze({
      bearerToken: token
    })
  });
}

function validClaims(
  overrides: Partial<PortfolioWorkspaceVerifiedJwtClaims> = {}
): PortfolioWorkspaceVerifiedJwtClaims {
  return Object.freeze({
    issuer: "https://issuer.example.test",
    audiences: ["portfolio-workspace-api"],
    subject: "user-oidc",
    algorithm: "RS256",
    expiresAtEpochSeconds: 1_767_225_900,
    notBeforeEpochSeconds: 1_767_225_500,
    issuedAtEpochSeconds: 1_767_225_000,
    displayName: "User OIDC",
    ...overrides
  });
}

async function expectAuthenticationFailure(
  claims: PortfolioWorkspaceVerifiedJwtClaims,
  reason: PortfolioWorkspaceAuthenticationFailureReasonValue
): Promise<void> {
  const result = await oidcAdapter(new RecordingJwtVerifier(Result.success(claims))).authenticate(bearerContext("jwt"));

  expect(result.isFailure).toBe(true);
  expect(result.error!.reason).toBe(reason);
}

async function testKeyPair(): Promise<{ readonly publicKey: CryptoKey; readonly privateKey: CryptoKey }> {
  return generateKeyPair("RS256");
}

function joseVerifier(keyResolver: JWTVerifyGetKey): PortfolioWorkspaceJoseJwtVerifier {
  return new PortfolioWorkspaceJoseJwtVerifier({
    configuration: PortfolioWorkspaceJoseJwtVerifierConfiguration.create({
      jwksUri: "https://issuer.example.test/.well-known/jwks.json"
    }).value!,
    keyResolver
  });
}

function keyResolverFor(kid: string, key: CryptoKey): JWTVerifyGetKey {
  return async (protectedHeader) => {
    if (protectedHeader.kid !== kid) {
      throw new Error("Signing key unavailable.");
    }

    return key;
  };
}

async function signedToken(input: {
  readonly key: CryptoKey;
  readonly kid: string;
  readonly claims: Record<string, unknown>;
}): Promise<string> {
  return new SignJWT(input.claims)
    .setProtectedHeader({ alg: "RS256", kid: input.kid })
    .sign(input.key);
}

function signedClaims(input: {
  readonly subject?: string;
  readonly displayName?: string;
  readonly principalType?: string;
  readonly issuer?: string;
  readonly audiences?: readonly string[];
  readonly expiresAtEpochSeconds?: number;
  readonly notBeforeEpochSeconds?: number;
} = {}): Record<string, unknown> {
  return {
    iss: input.issuer ?? "https://issuer.example.test",
    aud: input.audiences ?? ["portfolio-workspace-api"],
    sub: input.subject ?? "user-jose",
    exp: input.expiresAtEpochSeconds ?? 1_893_456_000,
    nbf: input.notBeforeEpochSeconds ?? 1_767_225_500,
    iat: 1_767_225_000,
    ...(input.displayName === undefined ? {} : { name: input.displayName }),
    ...(input.principalType === undefined ? {} : { principal_type: input.principalType })
  };
}

async function expectJoseFailure(
  token: string,
  reason: PortfolioWorkspaceAuthenticationFailureReasonValue,
  keyResolver: JWTVerifyGetKey,
  allowedAlgorithms: readonly string[] = ["RS256"]
): Promise<void> {
  const result = await joseVerifier(keyResolver).verify({
    token,
    requirements: {
      issuer: "https://issuer.example.test",
      audiences: ["portfolio-workspace-api"],
      allowedAlgorithms
    }
  });

  expect(result.isFailure).toBe(true);
  expect(result.error!.reason).toBe(reason);
}

function externalContext(): PortfolioWorkspaceExternalAuthenticationContext {
  return Object.freeze({
    credential: Object.freeze({
      bearerToken: "raw-token:super-secret",
      refreshToken: "refresh-secret"
    }),
    metadata: Object.freeze({
      claims: Object.freeze({
        email: "person@example.test",
        custom: "claim-secret"
      })
    })
  });
}

function packageRoot(): string {
  return join(__dirname, "..", "..", "..");
}

function readSource(directory: string): string {
  return sourceEntriesByFile(directory).map((entry) => entry.source).join("\n");
}

function sourceEntriesByFile(directory: string): ReadonlyArray<{ readonly file: string; readonly source: string }> {
  return readdirSync(directory)
    .flatMap((entry) => {
      const path = join(directory, entry);
      const stat = statSync(path);
      if (stat.isDirectory()) {
        return sourceEntriesByFile(path);
      }
      if (!entry.endsWith(".ts")) {
        return [];
      }

      return [{
        file: path,
        source: readFileSync(path, "utf8")
      }];
    });
}
