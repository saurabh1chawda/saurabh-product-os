import { readFileSync } from "node:fs";
import { inspect } from "node:util";
import { join } from "node:path";
import { Result } from "@career-companion/kernel";
import { describe, expect, it } from "vitest";
import {
  PORTFOLIO_WORKSPACE_AUTHORIZATION_HEADER_MAX_LENGTH,
  PORTFOLIO_WORKSPACE_BEARER_CHALLENGE,
  PORTFOLIO_WORKSPACE_PUBLIC_CORRELATION_HEADER,
  PORTFOLIO_WORKSPACE_WWW_AUTHENTICATE_HEADER,
  PortfolioWorkspaceAuthenticatedIdentity,
  PortfolioWorkspaceAuthenticationError,
  PortfolioWorkspaceAuthenticationFailureReason,
  PortfolioWorkspacePresentationErrorCategory,
  PortfolioWorkspacePresentationErrorCode,
  PortfolioWorkspacePresentationPrincipalType,
  PortfolioWorkspacePublicAuthenticationBoundary,
  extractPortfolioWorkspacePublicBearerCredential,
  mapPortfolioWorkspaceAuthenticationErrorToPublicFailure,
  type PortfolioWorkspaceAuthenticationAdapter,
  type PortfolioWorkspaceExternalAuthenticationContext,
  type PortfolioWorkspacePublicAuthenticationRequest
} from "../src";

const DISTINCTIVE_SECRET = "secret-token-a16-3g-never-leak";

describe("Portfolio Workspace public bearer credential extraction", () => {
  it("extracts a valid bearer credential from Authorization only", () => {
    const credential = extractPortfolioWorkspacePublicBearerCredential(request({
      Authorization: `Bearer ${DISTINCTIVE_SECRET}`
    }));

    expect(credential.isSuccess).toBe(true);
    expect(credential.value!.token()).toBe(DISTINCTIVE_SECRET);
    expect(JSON.stringify(credential.value)).toBe("{\"credentialType\":\"bearer-token\",\"redacted\":true}");
    expect(inspect(credential.value)).not.toContain(DISTINCTIVE_SECRET);
  });

  it("rejects missing and blank Authorization headers without fallback credentials", () => {
    const missing = extractPortfolioWorkspacePublicBearerCredential(request({}));
    const queryFallback = extractPortfolioWorkspacePublicBearerCredential({
      headers: {},
      incomingCorrelationId: "correlation:query-token",
      token: DISTINCTIVE_SECRET
    } as never);
    const blank = extractPortfolioWorkspacePublicBearerCredential(request({
      authorization: " "
    }));

    expect(missing.isFailure).toBe(true);
    expect(missing.error!.reason).toBe(PortfolioWorkspaceAuthenticationFailureReason.AuthenticationRequired);
    expect(queryFallback.isFailure).toBe(true);
    expect(queryFallback.error!.reason).toBe(PortfolioWorkspaceAuthenticationFailureReason.AuthenticationRequired);
    expect(blank.isFailure).toBe(true);
    expect(blank.error!.reason).toBe(PortfolioWorkspaceAuthenticationFailureReason.CredentialMalformed);
  });

  it("rejects malformed bearer syntax and unsupported auth schemes", () => {
    const invalid = [
      DISTINCTIVE_SECRET,
      `Basic ${DISTINCTIVE_SECRET}`,
      "Bearer",
      "Bearer ",
      `Bearer  ${DISTINCTIVE_SECRET}`,
      `Bearer\t${DISTINCTIVE_SECRET}`,
      `Bearer ${DISTINCTIVE_SECRET} extra`,
      `Bearer ${DISTINCTIVE_SECRET},Bearer second`
    ];

    for (const authorization of invalid) {
      const result = extractPortfolioWorkspacePublicBearerCredential(request({ authorization }));

      expect(result.isFailure).toBe(true);
      expect(result.error!.reason).toBe(PortfolioWorkspaceAuthenticationFailureReason.CredentialMalformed);
    }
  });

  it("rejects duplicate Authorization headers rather than selecting one", () => {
    const duplicateArray = extractPortfolioWorkspacePublicBearerCredential(request({
      authorization: [`Bearer ${DISTINCTIVE_SECRET}`, "Bearer other"]
    }));
    const duplicateCase = extractPortfolioWorkspacePublicBearerCredential(request({
      Authorization: `Bearer ${DISTINCTIVE_SECRET}`,
      authorization: "Bearer other"
    }));

    expect(duplicateArray.isFailure).toBe(true);
    expect(duplicateArray.error!.reason).toBe(PortfolioWorkspaceAuthenticationFailureReason.CredentialMalformed);
    expect(duplicateCase.isFailure).toBe(true);
    expect(duplicateCase.error!.reason).toBe(PortfolioWorkspaceAuthenticationFailureReason.CredentialMalformed);
  });

  it("rejects control characters, line breaks, and oversized values before authentication", () => {
    const withLineBreak = extractPortfolioWorkspacePublicBearerCredential(request({
      authorization: `Bearer ${DISTINCTIVE_SECRET}\nInjected: value`
    }));
    const oversized = extractPortfolioWorkspacePublicBearerCredential(request({
      authorization: `Bearer ${"a".repeat(PORTFOLIO_WORKSPACE_AUTHORIZATION_HEADER_MAX_LENGTH + 1)}`
    }));

    expect(withLineBreak.isFailure).toBe(true);
    expect(withLineBreak.error!.reason).toBe(PortfolioWorkspaceAuthenticationFailureReason.CredentialMalformed);
    expect(oversized.isFailure).toBe(true);
    expect(oversized.error!.reason).toBe(PortfolioWorkspaceAuthenticationFailureReason.CredentialMalformed);
  });
});

describe("Portfolio Workspace public authentication boundary", () => {
  it("normalizes safe incoming correlation before authentication", async () => {
    const adapter = new RecordingAuthenticationAdapter(Result.success(identity("user-public")));
    const boundary = publicBoundary(adapter);

    const result = await boundary.authenticate(request({
      authorization: `Bearer ${DISTINCTIVE_SECRET}`,
      [PORTFOLIO_WORKSPACE_PUBLIC_CORRELATION_HEADER]: " correlation:incoming "
    }));

    expect(result.isSuccess).toBe(true);
    expect(result.value!.correlationId).toBe("correlation:incoming");
    expect(result.value!.headers).toEqual({
      [PORTFOLIO_WORKSPACE_PUBLIC_CORRELATION_HEADER]: "correlation:incoming"
    });
    expect(adapter.contexts).toHaveLength(1);
    expect((adapter.contexts[0]!.credential as { token(): string }).token()).toBe(DISTINCTIVE_SECRET);
    expect(JSON.stringify(result.value)).not.toContain(DISTINCTIVE_SECRET);
    expect(inspect(result.value)).not.toContain(DISTINCTIVE_SECRET);
  });

  it("replaces unsafe incoming correlation and includes safe correlation on auth failure", async () => {
    const adapter = new RecordingAuthenticationAdapter(
      Result.failure(PortfolioWorkspaceAuthenticationError.authenticationInvalid())
    );
    const boundary = publicBoundary(adapter);

    const result = await boundary.authenticate(request({
      authorization: `Bearer ${DISTINCTIVE_SECRET}`,
      [PORTFOLIO_WORKSPACE_PUBLIC_CORRELATION_HEADER]: "bad correlation with spaces and \n newline"
    }));

    expect(result.isFailure).toBe(true);
    expect(result.error!.error.correlationId).toBe("correlation:generated-1");
    expect(result.error!.headers[PORTFOLIO_WORKSPACE_PUBLIC_CORRELATION_HEADER]).toBe("correlation:generated-1");
    expect(JSON.stringify(result.error)).not.toMatch(/bad correlation|newline|secret-token/i);
  });

  it("returns a trusted principal and no raw credential or claim data on success", async () => {
    const adapter = new RecordingAuthenticationAdapter(Result.success(identity("user-trusted")));
    const boundary = publicBoundary(adapter);

    const result = await boundary.authenticate(request({
      authorization: `Bearer ${DISTINCTIVE_SECRET}`
    }));

    expect(result.isSuccess).toBe(true);
    expect(result.value!.principal.toJSON()).toEqual({
      principalId: "user-trusted",
      principalType: "user",
      authenticationProvider: "career-oidc",
      displayName: "Public User"
    });
    expect(result.value).not.toHaveProperty("credential");
    expect(result.value).not.toHaveProperty("claims");
    expect(result.value).not.toHaveProperty("token");
    expect(JSON.stringify(result.value)).not.toMatch(/secret-token|issuer|audience|claim/i);
  });

  it("short-circuits missing and malformed credentials before invoking authentication", async () => {
    const adapter = new RecordingAuthenticationAdapter(Result.success(identity("unused")));
    const boundary = publicBoundary(adapter);

    const missing = await boundary.authenticate(request({}));
    const malformed = await boundary.authenticate(request({ authorization: `Bearer  ${DISTINCTIVE_SECRET}` }));

    expect(missing.isFailure).toBe(true);
    expect(malformed.isFailure).toBe(true);
    expect(adapter.contexts).toHaveLength(0);
  });

  it("maps client authentication failures to 401 with a minimal bearer challenge", async () => {
    const failure = await publicBoundary(new RecordingAuthenticationAdapter(
      Result.failure(PortfolioWorkspaceAuthenticationError.credentialExpired())
    )).authenticate(request({ authorization: `Bearer ${DISTINCTIVE_SECRET}` }));

    expect(failure.isFailure).toBe(true);
    expect(failure.error!.status).toBe(401);
    expect(failure.error!.headers).toEqual({
      [PORTFOLIO_WORKSPACE_PUBLIC_CORRELATION_HEADER]: "correlation:generated-1",
      [PORTFOLIO_WORKSPACE_WWW_AUTHENTICATE_HEADER]: PORTFOLIO_WORKSPACE_BEARER_CHALLENGE
    });
    expect(failure.error!.error.toJSON()).toMatchObject({
      category: PortfolioWorkspacePresentationErrorCategory.Unauthenticated,
      code: PortfolioWorkspacePresentationErrorCode.Unauthenticated,
      correlationId: "correlation:generated-1",
      retryable: false
    });
    expect(JSON.stringify(failure.error)).not.toContain("expired");
    expect(JSON.stringify(failure.error)).not.toContain(DISTINCTIVE_SECRET);
  });

  it("maps temporary verifier failures to 503 without a bearer challenge", async () => {
    const failure = await publicBoundary(new RecordingAuthenticationAdapter(
      Result.failure(PortfolioWorkspaceAuthenticationError.verifierUnavailable(new Error("jwks unavailable for secret-token")))
    )).authenticate(request({ authorization: `Bearer ${DISTINCTIVE_SECRET}` }));

    expect(failure.isFailure).toBe(true);
    expect(failure.error!.status).toBe(503);
    expect(failure.error!.headers).toEqual({
      [PORTFOLIO_WORKSPACE_PUBLIC_CORRELATION_HEADER]: "correlation:generated-1"
    });
    expect(failure.error!.error.toJSON()).toMatchObject({
      category: PortfolioWorkspacePresentationErrorCategory.Unavailable,
      code: PortfolioWorkspacePresentationErrorCode.PortfolioWorkspaceUnavailable,
      retryable: true
    });
    expect(JSON.stringify(failure.error)).not.toMatch(/jwks|secret-token/i);
  });

  it("maps internal authentication boundary failures to 500 without leaking details", () => {
    const failure = mapPortfolioWorkspaceAuthenticationErrorToPublicFailure({
      error: PortfolioWorkspaceAuthenticationError.invalidAuthenticationConfiguration(),
      correlationId: "correlation:internal"
    });

    expect(failure.status).toBe(500);
    expect(failure.headers).toEqual({
      [PORTFOLIO_WORKSPACE_PUBLIC_CORRELATION_HEADER]: "correlation:internal"
    });
    expect(failure.error.toJSON()).toMatchObject({
      category: PortfolioWorkspacePresentationErrorCategory.Internal,
      code: PortfolioWorkspacePresentationErrorCode.PortfolioWorkspaceInternalError,
      correlationId: "correlation:internal"
    });
  });

  it("does not leak credential, principal, correlation, or error state across calls", async () => {
    const adapter = new SequenceAuthenticationAdapter([
      Result.success(identity("first-user")),
      Result.success(identity("second-user"))
    ]);
    const boundary = publicBoundary(adapter);

    const [first, second] = await Promise.all([
      boundary.authenticate({
        headers: { authorization: "Bearer first-token" },
        incomingCorrelationId: "correlation:first"
      }),
      boundary.authenticate({
        headers: { authorization: "Bearer second-token" },
        incomingCorrelationId: "correlation:second"
      })
    ]);

    expect(first.value!.principal.principalId).toBe("first-user");
    expect(second.value!.principal.principalId).toBe("second-user");
    expect(first.value!.correlationId).toBe("correlation:first");
    expect(second.value!.correlationId).toBe("correlation:second");
    expect(adapter.contexts.map((context) => (context.credential as { token(): string }).token()).sort()).toEqual([
      "first-token",
      "second-token"
    ]);
  });

  it("keeps public authentication source framework-neutral, route-free, and storage-free", () => {
    const publicSource = readFileSync(
      join(packageRoot(), "apps", "api", "src", "portfolio-workspace", "public", "authentication.ts"),
      "utf8"
    );

    expect(publicSource).not.toContain("@career-companion/infrastructure");
    expect(publicSource).not.toContain("@career-companion/portfolio-workspace-application");
    expect(publicSource).not.toContain("@career-companion/portfolio-workspace\"");
    expect(publicSource).not.toContain("Postgres");
    expect(publicSource).not.toContain("Drizzle");
    expect(publicSource).not.toContain("Repository");
    expect(publicSource).not.toContain("PortfolioExecution");
    expect(publicSource).not.toContain("ApplicationService");
    expect(publicSource).not.toContain("PortfolioWorkspaceRuntime");
    expect(publicSource).not.toContain("process.env");
    expect(publicSource).not.toContain("cookie");
    expect(publicSource).not.toContain("query");
    expect(publicSource).not.toContain("Idempotency");
    expect(publicSource).not.toContain("authorize");
    expect(publicSource).not.toContain(["Retry", "Policy"].join(""));
    expect(publicSource).not.toContain(["retry", "Loop"].join(""));
    expect(publicSource).not.toContain(["automatic", "Retry"].join(""));
    expect(publicSource).not.toContain("express");
    expect(publicSource).not.toContain("fastify");
    expect(publicSource).not.toContain("next/");
    expect(publicSource).not.toContain(["Service", "Locator"].join(""));
    expect(publicSource).not.toContain(["Command", "Bus"].join(""));
  });
});

class RecordingAuthenticationAdapter implements PortfolioWorkspaceAuthenticationAdapter {
  readonly contexts: PortfolioWorkspaceExternalAuthenticationContext[] = [];

  constructor(
    private readonly result: Result<PortfolioWorkspaceAuthenticatedIdentity, PortfolioWorkspaceAuthenticationError>
  ) {}

  async authenticate(
    context: PortfolioWorkspaceExternalAuthenticationContext
  ): Promise<Result<PortfolioWorkspaceAuthenticatedIdentity, PortfolioWorkspaceAuthenticationError>> {
    this.contexts.push(context);

    return this.result;
  }
}

class SequenceAuthenticationAdapter implements PortfolioWorkspaceAuthenticationAdapter {
  readonly contexts: PortfolioWorkspaceExternalAuthenticationContext[] = [];

  constructor(
    private readonly results: Result<PortfolioWorkspaceAuthenticatedIdentity, PortfolioWorkspaceAuthenticationError>[]
  ) {}

  async authenticate(
    context: PortfolioWorkspaceExternalAuthenticationContext
  ): Promise<Result<PortfolioWorkspaceAuthenticatedIdentity, PortfolioWorkspaceAuthenticationError>> {
    this.contexts.push(context);
    const result = this.results.shift();
    if (result === undefined) {
      throw new Error("Unexpected authentication call.");
    }

    return result;
  }
}

function publicBoundary(
  adapter: PortfolioWorkspaceAuthenticationAdapter
): PortfolioWorkspacePublicAuthenticationBoundary {
  let sequence = 0;

  return new PortfolioWorkspacePublicAuthenticationBoundary({
    adapter,
    correlationIdGenerator: {
      generate: () => {
        sequence += 1;
        return `correlation:generated-${sequence}`;
      }
    }
  });
}

function request(
  headers: Record<string, string | readonly string[] | undefined>
): PortfolioWorkspacePublicAuthenticationRequest {
  return Object.freeze({
    headers: Object.freeze(headers)
  });
}

function identity(subject: string): PortfolioWorkspaceAuthenticatedIdentity {
  const result = PortfolioWorkspaceAuthenticatedIdentity.create({
    provider: "career-oidc",
    subject,
    principalType: PortfolioWorkspacePresentationPrincipalType.User,
    displayName: "Public User"
  });

  if (result.isFailure) {
    throw new Error("Expected valid identity fixture.");
  }

  return result.value!;
}

function packageRoot(): string {
  return join(__dirname, "..", "..", "..");
}
