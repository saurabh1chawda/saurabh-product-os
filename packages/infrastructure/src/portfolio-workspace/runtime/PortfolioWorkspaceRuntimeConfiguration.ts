import { Result } from "@career-companion/kernel";

const INSPECT_SYMBOL = Symbol.for("nodejs.util.inspect.custom");

export const PORTFOLIO_WORKSPACE_RUNTIME_ENVIRONMENT_VARIABLES = Object.freeze({
  databaseUrl: "PORTFOLIO_WORKSPACE_DATABASE_URL",
  poolMax: "PORTFOLIO_WORKSPACE_DB_POOL_MAX",
  idleTimeoutMs: "PORTFOLIO_WORKSPACE_DB_IDLE_TIMEOUT_MS",
  connectionTimeoutMs: "PORTFOLIO_WORKSPACE_DB_CONNECTION_TIMEOUT_MS",
  shutdownTimeoutMs: "PORTFOLIO_WORKSPACE_SHUTDOWN_TIMEOUT_MS",
  environment: "PORTFOLIO_WORKSPACE_ENVIRONMENT",
  migrationMode: "PORTFOLIO_WORKSPACE_MIGRATION_MODE"
});

export const PortfolioWorkspaceRuntimeEnvironment = Object.freeze({
  Development: "development",
  Test: "test",
  Staging: "staging",
  Production: "production"
} as const);

export type PortfolioWorkspaceRuntimeEnvironment =
  typeof PortfolioWorkspaceRuntimeEnvironment[keyof typeof PortfolioWorkspaceRuntimeEnvironment];

export const PortfolioWorkspaceMigrationMode = Object.freeze({
  VerifyOnly: "verify-only",
  Apply: "apply"
} as const);

export type PortfolioWorkspaceMigrationMode =
  typeof PortfolioWorkspaceMigrationMode[keyof typeof PortfolioWorkspaceMigrationMode];

export interface PortfolioWorkspaceRuntimeConfigurationInput {
  readonly databaseUrl: unknown;
  readonly poolMax?: unknown;
  readonly idleTimeoutMs?: unknown;
  readonly connectionTimeoutMs?: unknown;
  readonly shutdownTimeoutMs?: unknown;
  readonly environment?: unknown;
  readonly migrationMode?: unknown;
}

export type PortfolioWorkspaceRuntimeEnvironmentInput = Readonly<Record<string, string | undefined>>;

export type PortfolioWorkspaceRuntimeConfigurationIssueCode =
  | "configuration.missing"
  | "configuration.invalid"
  | "configuration.unsupported";

export interface PortfolioWorkspaceRuntimeConfigurationIssue {
  readonly code: PortfolioWorkspaceRuntimeConfigurationIssueCode;
  readonly field: keyof PortfolioWorkspaceRuntimeConfigurationInput;
  readonly message: string;
}

export class InvalidPortfolioWorkspaceRuntimeConfigurationError extends Error {
  readonly code = "INVALID_PORTFOLIO_WORKSPACE_RUNTIME_CONFIGURATION";
  readonly issues: readonly PortfolioWorkspaceRuntimeConfigurationIssue[];

  constructor(issues: readonly PortfolioWorkspaceRuntimeConfigurationIssue[]) {
    super("Portfolio Workspace runtime configuration is invalid.");
    this.name = "InvalidPortfolioWorkspaceRuntimeConfigurationError";
    this.issues = Object.freeze([...issues]);
    Object.freeze(this);
  }

  toJSON(): {
    readonly name: "InvalidPortfolioWorkspaceRuntimeConfigurationError";
    readonly code: "INVALID_PORTFOLIO_WORKSPACE_RUNTIME_CONFIGURATION";
    readonly issues: readonly PortfolioWorkspaceRuntimeConfigurationIssue[];
  } {
    return {
      name: "InvalidPortfolioWorkspaceRuntimeConfigurationError",
      code: this.code,
      issues: this.issues.map((issue) => ({ ...issue }))
    };
  }
}

export interface PortfolioWorkspaceRuntimeConfigurationJSON {
  readonly databaseUrlConfigured: true;
  readonly poolMax: number;
  readonly idleTimeoutMs: number;
  readonly connectionTimeoutMs: number;
  readonly shutdownTimeoutMs: number;
  readonly environment: PortfolioWorkspaceRuntimeEnvironment;
  readonly migrationMode: PortfolioWorkspaceMigrationMode;
}

export class PortfolioWorkspaceRuntimeConfiguration {
  static readonly defaultPoolMax = 10;
  static readonly defaultIdleTimeoutMs = 30_000;
  static readonly defaultConnectionTimeoutMs = 5_000;
  static readonly defaultShutdownTimeoutMs = 10_000;
  static readonly defaultEnvironment = PortfolioWorkspaceRuntimeEnvironment.Development;
  static readonly defaultMigrationMode = PortfolioWorkspaceMigrationMode.VerifyOnly;

  readonly poolMax: number;
  readonly idleTimeoutMs: number;
  readonly connectionTimeoutMs: number;
  readonly shutdownTimeoutMs: number;
  readonly environment: PortfolioWorkspaceRuntimeEnvironment;
  readonly migrationMode: PortfolioWorkspaceMigrationMode;

  readonly #databaseUrl: string;

  private constructor(input: {
    readonly databaseUrl: string;
    readonly poolMax: number;
    readonly idleTimeoutMs: number;
    readonly connectionTimeoutMs: number;
    readonly shutdownTimeoutMs: number;
    readonly environment: PortfolioWorkspaceRuntimeEnvironment;
    readonly migrationMode: PortfolioWorkspaceMigrationMode;
  }) {
    this.#databaseUrl = input.databaseUrl;
    this.poolMax = input.poolMax;
    this.idleTimeoutMs = input.idleTimeoutMs;
    this.connectionTimeoutMs = input.connectionTimeoutMs;
    this.shutdownTimeoutMs = input.shutdownTimeoutMs;
    this.environment = input.environment;
    this.migrationMode = input.migrationMode;
    Object.freeze(this);
  }

  static create(
    input: PortfolioWorkspaceRuntimeConfigurationInput
  ): Result<PortfolioWorkspaceRuntimeConfiguration, InvalidPortfolioWorkspaceRuntimeConfigurationError> {
    const issues: PortfolioWorkspaceRuntimeConfigurationIssue[] = [];

    const databaseUrl = parseDatabaseUrl(input.databaseUrl, issues);
    const poolMax = parseOptionalInteger(input.poolMax, {
      field: "poolMax",
      defaultValue: PortfolioWorkspaceRuntimeConfiguration.defaultPoolMax,
      min: 1,
      issues
    });
    const idleTimeoutMs = parseOptionalInteger(input.idleTimeoutMs, {
      field: "idleTimeoutMs",
      defaultValue: PortfolioWorkspaceRuntimeConfiguration.defaultIdleTimeoutMs,
      min: 0,
      issues
    });
    const connectionTimeoutMs = parseOptionalInteger(input.connectionTimeoutMs, {
      field: "connectionTimeoutMs",
      defaultValue: PortfolioWorkspaceRuntimeConfiguration.defaultConnectionTimeoutMs,
      min: 1,
      issues
    });
    const shutdownTimeoutMs = parseOptionalInteger(input.shutdownTimeoutMs, {
      field: "shutdownTimeoutMs",
      defaultValue: PortfolioWorkspaceRuntimeConfiguration.defaultShutdownTimeoutMs,
      min: 1,
      issues
    });
    const environment = parseOptionalVocabulary(input.environment, {
      field: "environment",
      defaultValue: PortfolioWorkspaceRuntimeConfiguration.defaultEnvironment,
      values: Object.values(PortfolioWorkspaceRuntimeEnvironment),
      issues
    });
    const migrationMode = parseOptionalVocabulary(input.migrationMode, {
      field: "migrationMode",
      defaultValue: PortfolioWorkspaceRuntimeConfiguration.defaultMigrationMode,
      values: Object.values(PortfolioWorkspaceMigrationMode),
      issues
    });

    if (issues.length > 0 || databaseUrl === undefined) {
      return Result.failure(new InvalidPortfolioWorkspaceRuntimeConfigurationError(issues));
    }

    return Result.success(new PortfolioWorkspaceRuntimeConfiguration({
      databaseUrl,
      poolMax,
      idleTimeoutMs,
      connectionTimeoutMs,
      shutdownTimeoutMs,
      environment,
      migrationMode
    }));
  }

  static fromEnvironment(
    environment: PortfolioWorkspaceRuntimeEnvironmentInput
  ): Result<PortfolioWorkspaceRuntimeConfiguration, InvalidPortfolioWorkspaceRuntimeConfigurationError> {
    return PortfolioWorkspaceRuntimeConfiguration.create({
      databaseUrl: environment[PORTFOLIO_WORKSPACE_RUNTIME_ENVIRONMENT_VARIABLES.databaseUrl],
      poolMax: environment[PORTFOLIO_WORKSPACE_RUNTIME_ENVIRONMENT_VARIABLES.poolMax],
      idleTimeoutMs: environment[PORTFOLIO_WORKSPACE_RUNTIME_ENVIRONMENT_VARIABLES.idleTimeoutMs],
      connectionTimeoutMs: environment[PORTFOLIO_WORKSPACE_RUNTIME_ENVIRONMENT_VARIABLES.connectionTimeoutMs],
      shutdownTimeoutMs: environment[PORTFOLIO_WORKSPACE_RUNTIME_ENVIRONMENT_VARIABLES.shutdownTimeoutMs],
      environment: environment[PORTFOLIO_WORKSPACE_RUNTIME_ENVIRONMENT_VARIABLES.environment],
      migrationMode: environment[PORTFOLIO_WORKSPACE_RUNTIME_ENVIRONMENT_VARIABLES.migrationMode]
    });
  }

  databaseConnectionUrlForRuntime(): string {
    return this.#databaseUrl;
  }

  equals(other: PortfolioWorkspaceRuntimeConfiguration | undefined): boolean {
    return other instanceof PortfolioWorkspaceRuntimeConfiguration
      && this.#databaseUrl === other.#databaseUrl
      && this.poolMax === other.poolMax
      && this.idleTimeoutMs === other.idleTimeoutMs
      && this.connectionTimeoutMs === other.connectionTimeoutMs
      && this.shutdownTimeoutMs === other.shutdownTimeoutMs
      && this.environment === other.environment
      && this.migrationMode === other.migrationMode;
  }

  toJSON(): PortfolioWorkspaceRuntimeConfigurationJSON {
    return {
      databaseUrlConfigured: true,
      poolMax: this.poolMax,
      idleTimeoutMs: this.idleTimeoutMs,
      connectionTimeoutMs: this.connectionTimeoutMs,
      shutdownTimeoutMs: this.shutdownTimeoutMs,
      environment: this.environment,
      migrationMode: this.migrationMode
    };
  }

  toString(): string {
    return JSON.stringify(this.toJSON());
  }

  [INSPECT_SYMBOL](): PortfolioWorkspaceRuntimeConfigurationJSON {
    return this.toJSON();
  }
}

function parseDatabaseUrl(
  value: unknown,
  issues: PortfolioWorkspaceRuntimeConfigurationIssue[]
): string | undefined {
  if (value === undefined || value === null) {
    issues.push(issue("configuration.missing", "databaseUrl", "Portfolio Workspace database URL is required."));
    return undefined;
  }

  if (typeof value !== "string" || value.trim().length === 0) {
    issues.push(issue("configuration.invalid", "databaseUrl", "Portfolio Workspace database URL must be a non-empty string."));
    return undefined;
  }

  const trimmed = value.trim();
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    issues.push(issue("configuration.invalid", "databaseUrl", "Portfolio Workspace database URL must be a valid URL."));
    return undefined;
  }

  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    issues.push(issue("configuration.unsupported", "databaseUrl", "Portfolio Workspace database URL must use postgres or postgresql protocol."));
    return undefined;
  }

  if (parsed.pathname.replaceAll("/", "").trim().length === 0) {
    issues.push(issue("configuration.invalid", "databaseUrl", "Portfolio Workspace database URL must include a database name."));
    return undefined;
  }

  return trimmed;
}

function parseOptionalInteger(
  value: unknown,
  input: {
    readonly field: "poolMax" | "idleTimeoutMs" | "connectionTimeoutMs" | "shutdownTimeoutMs";
    readonly defaultValue: number;
    readonly min: number;
    readonly issues: PortfolioWorkspaceRuntimeConfigurationIssue[];
  }
): number {
  if (value === undefined || value === null || value === "") {
    return input.defaultValue;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(parsed)) {
    input.issues.push(issue("configuration.invalid", input.field, `${input.field} must be an integer.`));
    return input.defaultValue;
  }

  if (parsed < input.min) {
    input.issues.push(issue("configuration.invalid", input.field, `${input.field} is outside the supported range.`));
    return input.defaultValue;
  }

  return parsed;
}

function parseOptionalVocabulary<T extends string>(
  value: unknown,
  input: {
    readonly field: "environment" | "migrationMode";
    readonly defaultValue: T;
    readonly values: readonly T[];
    readonly issues: PortfolioWorkspaceRuntimeConfigurationIssue[];
  }
): T {
  if (value === undefined || value === null || value === "") {
    return input.defaultValue;
  }

  if (typeof value !== "string" || !input.values.includes(value as T)) {
    input.issues.push(issue("configuration.unsupported", input.field, `${input.field} is unsupported.`));
    return input.defaultValue;
  }

  return value as T;
}

function issue(
  code: PortfolioWorkspaceRuntimeConfigurationIssueCode,
  field: keyof PortfolioWorkspaceRuntimeConfigurationInput,
  message: string
): PortfolioWorkspaceRuntimeConfigurationIssue {
  return Object.freeze({ code, field, message });
}
