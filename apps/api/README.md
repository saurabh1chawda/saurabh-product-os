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
- provider-agnostic production authorization policy and durable resource resolver;
- host-local presentation error to status mapping;
- database-free Portfolio Workspace presentation integration coverage for the internal initialize and get-by-ID pipelines;
- framework-neutral Portfolio Workspace API host lifecycle composition;
- framework-neutral public bearer authentication boundary;
- framework-neutral authenticated public Get Portfolio Execution by ID binding;
- generic Node built-in HTTP server primitives and transport contracts;
- concrete public read-only Portfolio Workspace HTTP route for `GET /v1/portfolio-workspace/executions/:executionId`;
- executable Portfolio Workspace HTTP host shell with `/health/live`, `/health/ready`, and the public GET route;
- live PostgreSQL 17 host integration coverage for the internal initialize and get-by-ID flows;
- live PostgreSQL 17 executable HTTP-host integration coverage for health/readiness and public Get Portfolio Execution by ID.

No public mutation endpoint, controller framework, durable idempotency route binding, list/search endpoint, persistence logic, provider integration, final deployment bootstrap, UI, or AI is implemented.

Initialization presentation contracts map trusted primitive request data plus an already-created command context and trusted authorization resource into `InitializePortfolioExecutionInput`. Responses expose the `execution-initialized` presentation outcome and execution summary only; raw domain facts, command context, repository revision, authorization resource, production authorization policy, and durable idempotency remain outside this boundary.

The internal initialization handler receives an already-authenticated `PortfolioWorkspacePresentationPrincipal`, checks local runtime readiness, invokes the host authorization boundary to obtain the trusted execution authorization resource, creates trusted command context through A15.2, calls `runtime.initializePortfolioExecution`, and maps success or failure to a safe internal transport response. It is internal-only; request JSON cannot assert ownership, `commandId` is not durable idempotency, automatic retries are not promised, and public mutation exposure remains blocked until durable idempotency and production authorization are implemented.

The internal get-by-ID handler receives an already-authenticated principal, checks local runtime readiness, authorizes read access, calls `runtime.getPortfolioExecution`, and returns only version, correlation, and execution summary. It does not expose facts, repository revision, aggregates, entities, or persistence metadata.

The presentation integration suite validates the complete database-free internal handler pipeline across transport parsing, trusted principal handling, authorization seams, A15.2 command-context creation, presentation mappers, runtime service seams, status mapping, correlation propagation, privacy, readiness handling, and request isolation. It intentionally does not exercise PostgreSQL or host framework routing.

The Portfolio Workspace API host consumes environment maps only at the host boundary, creates one `PortfolioWorkspaceRuntime` through Infrastructure composition, composes the provider-agnostic production authorization policy by default, assembles the internal initialize/get handlers once, exposes safe readiness/liveness status, and disposes the runtime deterministically during shutdown. It does not register process signals or create HTTP routes.

The public authentication boundary accepts only framework-neutral headers and
an optional correlation hint. It extracts bearer credentials strictly from the
`Authorization` header, rejects duplicate, malformed, unsafe, and oversized
values, normalizes or generates correlation before authentication, invokes the
existing authentication adapter, returns only a trusted
`PortfolioWorkspacePresentationPrincipal` on success, and maps authentication
failures to safe public 401/503/500 outcomes. Only 401 failures include the
minimal `WWW-Authenticate: Bearer` challenge. The boundary does not authorize,
invoke runtime services, call repositories, or bind a public route.

The public Get Portfolio Execution binding composes the public authentication
boundary with the existing internal get handler. It accepts a primitive
execution ID plus framework-neutral headers, authenticates first, passes only
the trusted principal into the internal authorization/get flow, and returns the
existing versioned safe Get presentation response or presentation error. It does
not create a concrete HTTP route, construct runtime services, access
repositories, expose credentials, or implement public initialize.

The generic Node HTTP host primitives under `src/http` provide the concrete
transport shell selected for future public routes. They normalize method, path,
search, and headers; invoke an injected async request handler; serialize safe
JSON responses; contain unexpected handler failures; and own start/stop server
lifecycle. They do not implement Portfolio Workspace route matching,
authentication, authorization, runtime composition, health endpoints, signal
handling, body parsing, or process startup.

The concrete Portfolio Workspace public HTTP route under
`src/portfolio-workspace/http` binds only
`GET /v1/portfolio-workspace/executions/:executionId`. It decodes the execution
ID from the path, resolves an already-trusted principal through an injected host
boundary, invokes the existing internal get handler, preserves safe correlation,
and maps the result to the generic Node HTTP response contract. It does not
parse provider credentials, expose public mutation, construct runtime services,
access repositories, or implement executable startup.

The executable Portfolio Workspace HTTP host composes one
`PortfolioWorkspaceApiHost`, one `NodeHttpApiServer`, the public GET route, and
minimal `/health/live` and `/health/ready` endpoints. It requires an injected
trusted-principal resolver, validates listen configuration, starts on an
explicit host/port, and shuts down by closing HTTP resources before disposing the
API host/runtime. It does not read process environment, register process
signals, expose runtime/repository/database objects, or provide a permissive
anonymous principal default.

Live API host validation passed against a disposable PostgreSQL 17 database. The live suite validates clean-schema startup with apply mode, verify-only failure before migration and success after apply, initialize plus get through real host handlers and PostgreSQL persistence, duplicate initialization conflict mapping, missing execution not-found mapping, invalid-input mapping, authorization denial, safe correlation/privacy behavior, host readiness/liveness/disposal/partial-startup cleanup, unsafe migration-policy rejection, and persistence across host recreation. A15.8a corrected cwd-dependent Infrastructure migration resolution, and A15.8b/A15.8c corrected test-contract/source-scan defects.

A16.3 public-access source was committed in `05203eabaee75b381a807573cf48f191b1e911a2`. The executable HTTP-host live suite passed against PostgreSQL 17 with 1 test file and 1 scenario: health/readiness and public GET are served through `NodeHttpApiServer`, `PortfolioWorkspaceExecutableHttpHost`, `PortfolioWorkspaceApiHost`, runtime query service, and PostgreSQL-backed persistence. The evidence does not prove public mutation, provider deployment, durable public-route idempotency, OpenAPI, telemetry, rate limiting, or final deployment startup.

Final deployment bootstrap, signal ownership, public mutation exposure, provider deployment, durable idempotency route binding, list/search, OpenAPI, rate limiting, telemetry, framework-specific adapters, and in-flight request draining remain deferred.
