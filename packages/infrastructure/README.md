# Career Companion Infrastructure Package

This package is reserved for infrastructure adapter boundaries.

Portfolio Workspace infrastructure is implemented here for durable aggregate persistence. PostgreSQL, Drizzle schema/migration, durable mapper, and repository adapter concerns remain package-local infrastructure details and do not enter Domain or Application contracts.

Object storage, OpenSearch, LiteLLM, cloud SDK composition, APIs, UI, messaging, workflow automation, and production runtime database composition remain outside the current Portfolio Workspace infrastructure scope.

## Portfolio Workspace Persistence Mapping

PortfolioExecution durable record and mapper contracts are implemented as database-neutral infrastructure code.

The mapper uses explicit `recordVersion` value `2`, keeps optimistic-concurrency revision outside the aggregate payload, persists the execution authorization resource in the aggregate payload, and rejects corrupt or unsupported records through technology-neutral repository mapping failures.

The initial PostgreSQL/Drizzle schema and migration for the PortfolioExecution aggregate snapshot are implemented under the Infrastructure package.

The schema stores `execution_id`, `record_version`, `revision`, and `aggregate_payload` only. The JSONB payload is validated by the mapper; revision and record version remain distinct infrastructure concepts.

The PostgreSQL PortfolioExecution repository adapter is implemented against the Application-owned asynchronous repository port. It uses the mapper, the `portfolio_executions` schema, revision-aware create/update semantics, and optimistic compare-and-swap updates without automatic retry.

Transaction orchestration, public idempotency-key enforcement, projection tables, fact persistence, and artifact storage remain unimplemented.

## Portfolio Workspace Runtime Configuration

Portfolio Workspace runtime configuration is implemented as an Infrastructure-owned contract.

The configuration requires an explicit PostgreSQL database URL, validates non-secret runtime settings deterministically, and redacts the secret-bearing URL from JSON serialization, string conversion, inspection, and validation errors. Environment parsing is pure and accepts an explicit environment-like map; it does not read `process.env`.

PostgreSQL Pool creation, Drizzle database construction, and deterministic Pool disposal are implemented as narrow Infrastructure runtime primitives. The runtime database object exposes the Drizzle database for future repository composition and keeps the Pool owned internally.

Migration readiness verification is implemented as a database-runtime check that verifies connectivity, interprets `verify-only` and `apply` migration modes, validates Drizzle migration metadata, and confirms the expected PortfolioExecution schema shape without constructing repositories or services. The committed Portfolio Workspace migration folder is resolved by Infrastructure relative to its own module location, not from the caller working directory, so API hosts and package-local tests use the same migration source.

Portfolio Workspace runtime composition is implemented as explicit Infrastructure construction. It validates migration policy, creates the PostgreSQL database runtime, verifies migration readiness, constructs the PostgreSQL PortfolioExecution repository, constructs the ten Portfolio Workspace Application Services plus the authorization-resource resolver, and exposes only those services plus deterministic disposal. Initialize Portfolio Execution, Get Portfolio Execution, and authorization-resource resolution are composed through the same shared repository as the behavioral services.

Production and staging runtime startup use `verify-only` migration mode. `apply` mode is reserved for development and test composition; no production in-memory fallback is provided.

Runtime lifecycle and readiness status are implemented as local runtime state. A ready runtime reports live and ready after migration readiness has completed; a disposing runtime remains live but not ready; disposed or disposal-failed runtimes are neither live nor ready. Status reporting performs no database probes, opens no transactions, and exposes no secrets.

Deterministic runtime disposal is idempotent, shares concurrent disposal calls, closes the database runtime once, and reports safe Infrastructure-owned disposal failures without leaking PostgreSQL or credential details. Host signal handling, shutdown timeouts, request draining, observability, presentation mapping, idempotency, retries, and transaction orchestration remain deferred. The next runtime-composition slice is A14.6 - Runtime Composition Integration Tests.

## Portfolio Workspace PostgreSQL Integration Tests

Live PostgreSQL validation is available through the package-local integration command:

```powershell
$env:PORTFOLIO_WORKSPACE_TEST_DATABASE_URL = "postgresql://<user>:<password>@localhost:<port>/<test_database>"
pnpm --filter @career-companion/infrastructure test:integration:portfolio-workspace
```

Live Portfolio Workspace runtime composition validation is available through the separate A14.6 command:

```powershell
$env:PORTFOLIO_WORKSPACE_TEST_DATABASE_URL = "postgresql://<user>:<password>@localhost:<port>/<test_database>"
pnpm --filter @career-companion/infrastructure test:integration:portfolio-workspace-runtime
```

The database URL must point to a dedicated disposable test database. The database name must contain `test` and must not contain `prod` or `production`; the runner refuses unsafe targets before executing migrations or cleanup.

The integration harness creates a unique temporary PostgreSQL schema, sets the suite search path to that schema, applies the committed Portfolio Workspace migration, truncates `portfolio_executions` between cases, and drops the temporary schema after the suite. It does not create production connections, read production environment variables, retry operations, or manage application composition.

The runtime composition suite creates unique temporary PostgreSQL schemas, exercises migration apply and verify-only behavior, composes the real runtime, initializes PortfolioExecution through the runtime-exposed Application Service, drives the behavioral services through durable PostgreSQL persistence, validates lifecycle/readiness/disposal, and cleans up test schemas afterward. The command fails when the safe test database URL is absent; it does not silently skip.

Default `pnpm test` runs database-free validation and skips live PostgreSQL tests when `PORTFOLIO_WORKSPACE_TEST_DATABASE_URL` is absent. A12.10 live PostgreSQL 17 validation passed against a disposable test database. A14.6 live runtime validation passed against a disposable PostgreSQL 17 test database through Docker, including migration apply/verify-only behavior, runtime composition, runtime-exposed initialization, get-by-id query, behavioral Application Services, durable persistence, optimistic concurrency, lifecycle/readiness, disposal, partial-startup cleanup, and safe error/privacy checks. A15.8 live API host validation passed against PostgreSQL 17 through the real API host -> runtime -> repository -> PostgreSQL path for internal initialize and get-by-id flows, failure mapping, authorization denial, correlation/privacy, lifecycle cleanup, migration policy, and cross-host persistence. Node `>=22 <23` remains the repository runtime requirement.
