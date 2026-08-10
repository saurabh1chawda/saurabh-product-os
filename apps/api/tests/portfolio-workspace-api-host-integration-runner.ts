import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const testDatabaseUrl = process.env.PORTFOLIO_WORKSPACE_TEST_DATABASE_URL;

if (testDatabaseUrl === undefined || testDatabaseUrl.trim().length === 0) {
  console.error("PORTFOLIO_WORKSPACE_TEST_DATABASE_URL is required for Portfolio Workspace API host integration tests.");
  process.exit(1);
}

try {
  assertSafeTestDatabaseUrl(testDatabaseUrl);
} catch (error) {
  console.error(error instanceof Error ? error.message : "Unsafe Portfolio Workspace PostgreSQL test database URL.");
  process.exit(1);
}

const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const result = spawnSync(pnpm, [
  "exec",
  "vitest",
  "run",
  "tests/portfolio-workspace-api-host-live.test.ts",
  "--passWithNoTests"
], {
  cwd: packageRoot,
  env: process.env,
  shell: process.platform === "win32",
  stdio: "inherit"
});

process.exit(result.status ?? 1);

function assertSafeTestDatabaseUrl(value: string): void {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("PORTFOLIO_WORKSPACE_TEST_DATABASE_URL must be a valid PostgreSQL connection URL.");
  }

  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    throw new Error("PORTFOLIO_WORKSPACE_TEST_DATABASE_URL must use the postgres or postgresql protocol.");
  }

  const databaseName = decodeURIComponent(parsed.pathname.replace(/^\//, "")).toLowerCase();
  if (!databaseName.includes("test")) {
    throw new Error("Refusing to run PostgreSQL API host integration tests: database name must contain 'test'.");
  }
  if (databaseName.includes("prod") || databaseName.includes("production")) {
    throw new Error("Refusing to run PostgreSQL API host integration tests against a database name that appears production-related.");
  }
}
