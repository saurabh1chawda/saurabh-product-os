# Career Companion API

This directory is reserved for the future Career Companion application API boundary.

Portfolio Workspace transport-neutral presentation contracts are implemented under the API host boundary.

Implemented:

- versioned Portfolio Workspace presentation request contracts;
- versioned presentation response contracts;
- presentation-owned outcome vocabulary;
- safe presentation error contract;
- explicit Application Result to response mappers;
- immutable initialization request and response contracts;
- explicit initialization request to Application input mapper;
- explicit Application/Domain/Repository failure to presentation error mapper;
- trusted authenticated principal contract;
- trusted principal to actor-reference mapping;
- safe correlation normalization with trusted fallback generation;
- command-context factory for operation-specific `PortfolioExecutionCommandContext`;
- internal Initialize Portfolio Execution handler;
- internal Get Portfolio Execution by ID handler;
- host-local internal transport request/response contracts;
- host-local authorization boundary contract;
- host-local presentation error to status mapping;
- database-free Portfolio Workspace presentation integration coverage for the internal initialize and get-by-ID pipelines;
- framework-neutral Portfolio Workspace API host lifecycle composition;
- live PostgreSQL 17 host integration coverage for the internal initialize and get-by-ID flows.

No public mutation endpoint, HTTP framework route, controller, provider authentication, production authorization policy, durable idempotency, list/search endpoint, persistence logic, provider integration, UI, or AI is implemented.

Initialization presentation contracts map trusted primitive request data plus an already-created command context into `InitializePortfolioExecutionInput`. Responses expose the `execution-initialized` presentation outcome and execution summary only; raw domain facts, command context, repository revision, authorization, and durable idempotency remain outside this boundary.

The internal initialization handler receives an already-authenticated `PortfolioWorkspacePresentationPrincipal`, checks local runtime readiness, invokes the host authorization boundary, creates trusted command context through A15.2, calls `runtime.initializePortfolioExecution`, and maps success or failure to a safe internal transport response. It is internal-only; `commandId` is not durable idempotency, automatic retries are not promised, and public mutation exposure remains blocked until durable idempotency and production authorization are implemented.

The internal get-by-ID handler receives an already-authenticated principal, checks local runtime readiness, authorizes read access, calls `runtime.getPortfolioExecution`, and returns only version, correlation, and execution summary. It does not expose facts, repository revision, aggregates, entities, or persistence metadata.

The presentation integration suite validates the complete database-free internal handler pipeline across transport parsing, trusted principal handling, authorization seams, A15.2 command-context creation, presentation mappers, runtime service seams, status mapping, correlation propagation, privacy, readiness handling, and request isolation. It intentionally does not exercise PostgreSQL or host framework routing.

The Portfolio Workspace API host consumes environment maps only at the host boundary, creates one `PortfolioWorkspaceRuntime` through Infrastructure composition, requires an explicit authorization dependency, assembles the internal initialize/get handlers once, exposes safe readiness/liveness status, and disposes the runtime deterministically during shutdown. It does not register process signals or create HTTP routes.

Live API host validation passed against a disposable PostgreSQL 17 database. The live suite validates clean-schema startup with apply mode, verify-only failure before migration and success after apply, initialize plus get through real host handlers and PostgreSQL persistence, duplicate initialization conflict mapping, missing execution not-found mapping, invalid-input mapping, authorization denial, safe correlation/privacy behavior, host readiness/liveness/disposal/partial-startup cleanup, unsafe migration-policy rejection, and persistence across host recreation. A15.8a corrected cwd-dependent Infrastructure migration resolution, and A15.8b/A15.8c corrected test-contract/source-scan defects.

Real authorization policy, durable idempotency, public endpoint exposure, list/search, OpenAPI, rate limiting, telemetry, framework-specific adapters, and in-flight request draining remain deferred.
