# A15 - Portfolio Workspace Presentation Boundary Architecture

## 1. Document Control

| Field | Value |
| --- | --- |
| Document | A15 - Portfolio Workspace Presentation Boundary Architecture |
| Bounded context | Portfolio Workspace |
| Status | Canonical presentation-boundary architecture |
| Scope | Architecture only |
| Supersedes | None |
| Enables | A15.1 - Presentation Contract and Error Boundaries |

## 2. Purpose

This document defines how future external hosts invoke the completed Portfolio Workspace runtime without leaking transport, authentication, framework, persistence, infrastructure, UI, or AI concerns into the Domain or Application layers.

The presentation boundary transforms an external request into one Application Service call, then transforms the Application Result into a transport-specific response.

Canonical flow:

```text
external request
  -> presentation input parsing
  -> authentication and authorization boundary
  -> command context creation
  -> Application input construction
  -> Portfolio Workspace runtime service invocation
  -> Application Result handling
  -> presentation response mapping
```

This document does not implement endpoints, controllers, route handlers, DTO classes, authentication, authorization, idempotency storage, OpenAPI, middleware, telemetry, UI, or AI integration.

A15.1 implements the first transport-neutral presentation contracts under `apps/api`. It adds request contracts, response contracts, presentation outcome vocabulary, safe presentation error contracts, and explicit mappers from Application Results and known failures. It does not implement handlers, framework bindings, auth, command-context construction, initialization, queries, runtime wiring, or public mutation idempotency.

A15.2 implements trusted principal and command-context mapping under `apps/api`. It adds a presentation-owned authenticated principal contract, principal-to-actor-reference mapping, safe incoming correlation normalization with trusted fallback generation, host-supplied command ID and clock contracts, and a narrow factory that constructs operation-specific `PortfolioExecutionCommandContext` values. It does not implement authentication providers, authorization decisions, handlers, framework bindings, Application Service invocation, runtime wiring, initialization, queries, or idempotency.

A15.3a implements the legitimate Application-owned PortfolioExecution initialization use case in `packages/portfolio-workspace-application`, backed by an intention-revealing Portfolio Workspace domain initialization path and `PortfolioExecutionInitializedFact`. A15.3b exposes that initialization service through the Portfolio Workspace runtime composition with the same shared PostgreSQL repository as the behavioral services. A15.3c adds transport-neutral initialization presentation contracts, request-to-Application input mapping, and the `execution-initialized` response mapping. Presentation still has no handler or route, and authorization plus durable idempotency remain required before public mutation exposure.

A15.4 implements the Application-owned Get Portfolio Execution query service over the existing `PortfolioExecutionRepository`. A15.4b exposes that query service through the Portfolio Workspace runtime composition with the same shared PostgreSQL repository as initialization and behavioral services, unblocking the internal get-by-id handler path.

A15.5 implements the first framework-neutral internal API handlers in `apps/api`: Initialize Portfolio Execution and Get Portfolio Execution by ID. The handlers receive already-authenticated presentation principals, enforce local runtime readiness, invoke a host-local authorization boundary, use A15.2 command-context creation for initialization, call the approved `PortfolioWorkspaceRuntime` services, and map results/errors to host-local internal transport responses. Initialization remains internal-only; production authorization policy, durable idempotency, framework routes, host startup wiring, public mutation exposure, list/search, CQRS infrastructure, projection persistence, and query databases remain deferred.

A15.6 adds database-free presentation integration coverage for the internal initialize and get-by-ID handlers. The suite exercises internal transport request handling, trusted principal input, authorization seams, deterministic A15.2 command-context creation, initialization and query presentation mappers, controlled runtime service seams, safe status/error mapping, correlation propagation, runtime readiness, privacy boundaries, and sequential/concurrent request isolation. It does not re-test PostgreSQL, live runtime composition, framework routes, production authorization, durable idempotency, or public mutation exposure.

A15.7 adds framework-neutral `apps/api` host runtime integration for Portfolio Workspace. The API host consumes an environment map at the host boundary, validates `PortfolioWorkspaceRuntimeConfiguration`, creates exactly one `PortfolioWorkspaceRuntime` through the approved Infrastructure factory, requires an explicit authorization dependency, assembles the internal initialize/get handlers once, exposes safe readiness/liveness status, and delegates deterministic shutdown to `runtime.dispose()`. It does not add HTTP routes, process signal handlers, provider authentication, production authorization semantics, idempotency, retries, telemetry, or in-flight request draining.

A15.8 validates the framework-neutral API host against a disposable PostgreSQL 17 database. The live suite passed 8/8 scenarios: clean-schema startup with apply mode, verify-only failure before migration and success after apply, initialize plus get through real host handlers and PostgreSQL persistence, duplicate initialization conflict mapping, missing execution not-found mapping, invalid-input mapping, authorization denial, safe correlation/privacy behavior, host readiness/liveness/disposal/partial-startup cleanup, unsafe migration-policy rejection, persistence across host recreation, and architecture-boundary validation. A15.8a corrected cwd-dependent Infrastructure migration resolution; A15.8b and A15.8c corrected test-contract/source-scan defects. No remaining A15 production defect is identified.

## 3. Sources Reviewed

| Source | Relevance |
| --- | --- |
| ARCH-004 | PortfolioExecution is the execution/workspace aggregate boundary. |
| A10.2.1d-A10.2.1g | Canonical vocabulary, policy, projection, and domain service boundaries. |
| A11.1 | Application Services coordinate use cases and do not own presentation. |
| A11.2 | Application Results are Application boundary contracts, not transport DTOs. |
| A11.11 | Operation command context and result correlation are aligned through Domain facts. |
| A12.1-A12.10 | Infrastructure owns repository adapters, persistence, PostgreSQL, migrations, and live validation. |
| A13 and A13.1 | Release review and hygiene status for the completed Domain/Application/Infrastructure stack. |
| A14 and A14.1-A14.6 | Runtime configuration, database runtime, migration readiness, composition, lifecycle, and live runtime validation. |
| `packages/portfolio-workspace` | Domain exports: identifiers, aggregate, errors, facts, policies, projections. |
| `packages/portfolio-workspace-application` | Eight Application Services, inputs, results, repository port, repository failures. |
| `packages/infrastructure` | Runtime factory and PostgreSQL adapter remain Infrastructure-owned. |
| `apps/api` | Reserved API host shell with no handlers implemented. |
| `apps/worker` | Reserved worker host shell with no handlers implemented. |
| `apps/web` | Reserved future web application migration target. |
| `docs/career-companion/implementation/api-specification.md` | Existing high-level API principles: use-case APIs, command/query separation, actor context, versioning, structured errors. |
| `packages/errors`, `packages/logging`, `packages/observability`, `packages/config` | Reserved boundary packages, no active shared implementation. |

## 4. Current Architecture Baseline

### Domain

Portfolio Workspace Domain currently owns:

- `PortfolioExecution` aggregate;
- immutable identifiers, references, command context, entities, lifecycle values;
- Domain errors;
- immutable Domain facts;
- pure Domain policies;
- pure Domain projections.

It has no persistence, presentation, transport, framework, UI, or AI dependencies.

### Application

Portfolio Workspace Application currently owns eight use cases:

- Begin Execution;
- Activate Work Item;
- Complete Work Item;
- Cancel Work Item;
- Accept Candidate;
- Reject Candidate;
- Complete Execution;
- Cancel Execution.

Application contracts include immutable inputs, immutable results, operation-specific `PortfolioExecutionCommandContext`, fact-derived `correlationId`, asynchronous revision-aware `PortfolioExecutionRepository`, and technology-neutral repository failures.

### Infrastructure

Infrastructure currently owns:

- in-memory repository adapter;
- durable record and mapper;
- PostgreSQL schema and migration;
- PostgreSQL repository adapter;
- runtime configuration;
- PostgreSQL Pool and Drizzle runtime;
- migration readiness;
- runtime composition;
- runtime lifecycle, readiness, and disposal;
- live PostgreSQL persistence and runtime-composition validation.

A14 is complete. The next concern is the outer presentation boundary.

## 5. Existing Presentation and Host Conventions

Repository inspection shows:

| Area | Current state | A15 implication |
| --- | --- | --- |
| `apps/api` | Reserved API host package. `src/index.ts` exports nothing; README states no handlers or provider integrations are implemented. | Best initial host shell for Portfolio Workspace HTTP presentation. |
| `apps/worker` | Reserved worker host package with no handlers. | Valid future host for background execution, not first presentation target. |
| `apps/web` | Reserved future migration target for web application. | Not the first Portfolio Workspace API boundary. |
| `packages/api` | No implemented package found. | Do not invent a reusable API package yet. |
| root Next.js routes | No active route-handler convention found for Portfolio Workspace. | Do not place initial Portfolio Workspace endpoints in root route handlers. |
| `packages/application/src/handlers/index.ts` | Empty handler index. | Not evidence for a generic presentation framework. |
| shared errors/logging/observability/config packages | Reserved only. | Presentation architecture may reference these future boundaries but must not depend on nonexistent implementations. |

The repository favors reserved host shells and package-level boundaries over an already active controller or route-handler framework.

## 6. Presentation Boundary Definition

The Presentation Layer is an outer adapter responsible for:

- accepting transport-specific input;
- parsing request shape;
- enforcing content type and payload limits;
- obtaining authenticated actor identity;
- applying authorization decisions;
- generating trusted command and correlation identifiers;
- constructing `PortfolioExecutionCommandContext`;
- constructing use-case-specific Application inputs;
- invoking exactly one Portfolio Workspace Application Service;
- mapping successful Application Results to transport response models;
- mapping failures to transport-specific response models;
- preserving safe correlation metadata;
- preventing secret, infrastructure, aggregate, and internal error leakage.

The Presentation Layer must not:

- own Domain rules;
- inspect aggregate internals;
- mutate lifecycle state;
- construct Domain facts;
- construct repositories;
- perform SQL;
- invoke Drizzle;
- access PostgreSQL Pool;
- run migrations;
- retry Domain operations automatically;
- publish facts unless a later approved integration slice defines it;
- bypass Application Services.

## 7. First Presentation Host Decision

Decision: the first Portfolio Workspace presentation host should be `apps/api`.

Rationale:

- `apps/api` already exists as the reserved Career Companion API boundary.
- It is a host shell, so it can own framework lifecycle, request/response objects, authentication, configuration, and runtime access.
- A14 defines host-level composition as the place where future API or worker adapters receive the runtime.
- No reusable `packages/api` implementation exists today.
- A worker-first or CLI-first adapter does not match the initial external presentation need.
- Root Next.js route handlers are not established as the current Portfolio Workspace convention.

This is a host decision, not an endpoint implementation.

## 8. Package Placement Decision

Initial future placement:

| Concern | Placement |
| --- | --- |
| HTTP host handlers | `apps/api/src/portfolio-workspace/` |
| Host startup/runtime access | `apps/api` |
| Transport-specific request/response handling | `apps/api/src/portfolio-workspace/` |
| Reusable presentation mapping | Host-local at first; extract later only if multiple hosts require it. |
| Application inputs/results | Stay in `packages/portfolio-workspace-application`. |
| Runtime factory | Stays in `packages/infrastructure`. |
| Domain identifiers/projections/facts | Stay in `packages/portfolio-workspace`. |

Do not create a new `portfolio-workspace-presentation` package for the first slice. A reusable package may be justified only after API, CLI, worker, or desktop adapters need shared transport-agnostic mapping.

## 9. Transport-Agnostic and Transport-Specific Boundary

Transport-agnostic presentation mapping may include:

- safe extraction of request fields;
- conversion of external identifier strings through Domain constructors;
- construction of Application input contracts;
- mapping Application Results into approved response models;
- mapping known Application, Domain, and repository failures into presentation error categories.

Transport-specific host code owns:

- HTTP methods;
- route paths;
- headers;
- cookies;
- status codes;
- framework request/response objects;
- host lifecycle and readiness checks.

Application Results are not public API response contracts. They must be mapped explicitly.

## 10. Use-Case Exposure Assessment

| Use case | Likely external intent | Required external inputs | Auth and authorization | Idempotency | Success response | Failure categories | Direct exposure |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Begin Execution | Start a prepared execution. | `executionId`; correlation header optional. | Actor must be allowed to operate on execution. | Required before public mutation API. | Correlation ID and execution summary. | Not found, invalid lifecycle, persistence, concurrency. | Internal first; public after initialization/idempotency decisions. |
| Activate Work Item | Mark an owned work item active. | `executionId`, `workItemId`. | Actor must access execution and mutate work item. | Required before public mutation API. | Correlation ID, execution summary, optional work-item summary. | Not found, unknown work item, invalid lifecycle, persistence, concurrency. | Internal first. |
| Complete Work Item | Complete an active/reviewable work item. | `executionId`, `workItemId`. | Actor must access execution and mutate work item. | Required before public mutation API. | Correlation ID, execution summary, optional work-item summary. | Not found, unknown work item, invalid lifecycle, persistence, concurrency. | Internal first. |
| Cancel Work Item | Cancel a work item. | `executionId`, `workItemId`. | Actor must access execution and cancel work item. | Required before public mutation API. | Correlation ID, execution summary, optional work-item summary. | Not found, unknown work item, invalid lifecycle, persistence, concurrency. | Internal first. |
| Accept Candidate | Accept a registered artifact candidate and create an accepted artifact. | `executionId`, `candidateId`, caller-supplied `acceptedArtifactId`. | Actor must have approval authority for candidate acceptance. | Required before public mutation API. | Correlation ID, execution summary, safe acceptance outcome, accepted artifact identifier if approved. | Not found, unknown candidate, invalid lifecycle, duplicate accepted artifact, persistence, concurrency. | Not public until approval and idempotency boundaries exist. |
| Reject Candidate | Reject a registered artifact candidate. | `executionId`, `candidateId`. | Actor must have review authority. | Required before public mutation API. | Correlation ID, execution summary, safe rejection outcome. | Not found, unknown candidate, invalid lifecycle, persistence, concurrency. | Internal first. |
| Complete Execution | Finish an execution once all completion rules pass. | `executionId`. | Actor must have completion authority. | Required before public mutation API. | Correlation ID and completed execution summary. | Not found, unresolved work items, invalid lifecycle, persistence, concurrency. | Not public until query/idempotency support exists. |
| Cancel Execution | Cancel an execution. | `executionId`. | Actor must have cancellation authority. | Required before public mutation API. | Correlation ID and cancelled execution summary. | Not found, invalid lifecycle, persistence, concurrency. | Internal first. |

## 11. Initialization Use-Case Assessment

Current Application does not include Create Portfolio Execution or Initialize Portfolio Execution.

Presentation implementation cannot seed aggregates through Infrastructure. A host may receive an `ExecutionId` from another bounded context only after an approved initialization path exists.

Classification:

| Missing capability | Classification | Reason |
| --- | --- | --- |
| Initialize/Create Portfolio Execution | BLOCKING BEFORE FIRST ENDPOINT | The eight implemented use cases load existing aggregates; no presentation handler may create or seed `PortfolioExecution` directly. |
| Start from approved Portfolio Plan | BLOCKING BEFORE FIRST COMPLETE API WORKFLOW | `PortfolioPlanReference`, `PlanSnapshotReference`, and `ApprovalReference` must originate from an approved planning/approval boundary. |

Recommended next architecture correction: define the initialization use case before exposing behavior that assumes persisted executions already exist.

## 12. Query-Side Assessment

Current Application does not include:

- Get Portfolio Execution;
- List Portfolio Executions;
- Get Work Item;
- Get Candidate;
- Get Accepted Artifact.

Mutation results expose summary projections after state changes, but they do not support reload-after-conflict, initial screen rendering, or inspection without mutation.

Classification:

| Query capability | Classification | Reason |
| --- | --- | --- |
| Get Execution Summary | REQUIRED FOR COMPLETE API EXPERIENCE | Needed to display current execution state and recover from concurrency conflict. |
| List Executions | REQUIRED FOR COMPLETE API EXPERIENCE | Needed for user navigation unless another context supplies execution references. |
| Get Work Item/Candidate/Accepted Artifact | DEFERRED | Useful for detail screens, but summary responses may support the first internal mutation tests. |

Presentation must not call repositories directly for queries. Query Application Services or approved read ports are required before query endpoints.

## 13. Request Model Decision

Future request models are presentation-owned and may contain:

- path identifiers;
- body fields required by the use case;
- optional idempotency key;
- optional correlation header;
- authenticated principal reference supplied by the host boundary.

They must not contain:

- Domain entities;
- Domain facts;
- repositories;
- runtime objects;
- Pool or Drizzle types;
- framework session objects inside Application inputs;
- arbitrary command context supplied directly by untrusted clients;
- client-controlled actor references;
- client-controlled `occurredAt` for normal commands.

## 14. Identifier Parsing

External identifier flow:

```text
external string
  -> presentation field extraction
  -> Domain identifier constructor
  -> safe presentation input failure if invalid
  -> Application input
```

Relevant identifiers:

- `ExecutionId`;
- `WorkItemId`;
- `CandidateId`;
- `AcceptedArtifactId`.

The presentation layer must use Domain constructors for identifier validation. Invalid identifier text is a presentation input failure, not a Domain behavioral rejection. Presentation must not duplicate Domain identifier rules.

## 15. Command Context Creation

Command context is host-created and operation-specific.

Rules:

- `commandId` is generated by a trusted host boundary per attempted operation.
- `commandId` is not accepted blindly from request body.
- `correlationId` may be accepted from a validated header or generated by the host.
- `correlationId` must have safe format and length limits.
- `actorReference` is derived from the authenticated principal.
- `actorReference` is never trusted as an arbitrary public request field.
- `occurredAt` is generated by the host clock once before invoking the Application Service.
- The Application Service passes the context to the aggregate.
- The returned Domain fact carries the same context.
- The Application Result `correlationId` derives from the returned fact.
- The response exposes only safe correlation metadata, not the full command context.

## 16. Authentication Boundary

Authentication is host/presentation-owned.

The host must either provide an authenticated principal to the Portfolio Workspace presentation handler or reject the request before Application invocation.

Domain and Application must not depend on:

- sessions;
- JWTs;
- OAuth tokens;
- cookies;
- framework user objects;
- provider identities.

Future narrow mapping:

```text
authenticated principal
  -> authorized actor
  -> PortfolioExecutionCommandContext.actorReference
```

Provider-specific authentication remains deferred.

## 17. Authorization Boundary

Authorization answers: can this actor invoke this use case on this execution?

Domain rules answer: is this operation valid in the current business lifecycle?

Authorization should occur before Application Service invocation where possible. Domain behavior must not be reused as access control.

Future authorization needs include:

- execution ownership;
- tenant membership;
- reviewer role;
- completion authority;
- cancellation authority;
- admin capability;
- service account behavior.

No roles, policies, or provider-specific authorization implementation are defined in A15.

## 18. Idempotency Decision

`commandId` is not durable idempotency.

Optimistic concurrency prevents lost updates but does not prevent duplicate command submission.

Decision:

| Scope | Classification | Rule |
| --- | --- | --- |
| Public mutation API | REQUIRED BEFORE PUBLIC MUTATION ENDPOINTS | Define idempotency key ownership, storage, conflict semantics, and response replay behavior first. |
| Internal controlled host | DEFERRED FOR INTERNAL HOST | Internal first slices may proceed without durable idempotency if clients are controlled and tests do not promise retry safety. |
| High-retry clients | REQUIRED BEFORE HIGH-RETRY CLIENTS | Retryable clients need durable idempotency before state-changing commands. |

Do not implement idempotency in presentation handlers without a dedicated architecture slice.

## 19. Request Validation

Validation layers:

| Category | Owner | Examples |
| --- | --- | --- |
| Shape validation | Presentation | Required fields, unknown fields, string length, content type, body size, malformed JSON. |
| Domain value validation | Domain constructors | Identifier representation, references, command context values. |
| Business validation | Aggregate | Lifecycle eligibility, unknown child identity within aggregate, terminal-state behavior, duplicate accepted artifact identity. |
| Authorization validation | Presentation/host policy boundary | Actor can access or mutate the execution. |

Presentation must not duplicate aggregate invariants.

## 20. Response Model Decision

Application Results must not be serialized automatically as public transport contracts.

Presentation should map approved fields into explicit versioned response models. Potential safe fields:

- `correlationId`;
- execution summary;
- work-item summary where intentionally exposed;
- accepted-artifact summary where intentionally exposed;
- safe operation outcome code.

Do not expose:

- `PortfolioExecution`;
- entity instances;
- repository revision;
- database metadata;
- command actor details by default;
- internal class names;
- stack traces;
- raw infrastructure errors;
- complete facts by default.

## 21. Fact Exposure Decision

Initial decision: do not expose complete Domain facts as public API contracts.

Facts are immutable business outcomes and internal audit evidence. They are not automatically client DTOs.

Presentation may expose:

- safe operation outcome code;
- safe fact type where justified;
- safe identifiers already present in response projections;
- `correlationId`.

Complete fact serialization remains internal unless a later audit or integration architecture approves it.

## 22. Projection Exposure Decision

Domain projections are transport-neutral read models, but they are not automatically permanent public API schemas.

Initial decision: map projections into versioned response models.

Current projections contain concise summaries and no infrastructure details, so they are suitable inputs to response mapping. They should not be declared the external API contract without explicit versioning and privacy review.

## 23. Error Taxonomy

Presentation-visible categories:

| Category | Examples | External posture |
| --- | --- | --- |
| Input error | Malformed JSON, missing field, invalid identifier, unsupported content type. | Safe client correction. |
| Authentication error | Unauthenticated request. | Safe rejection without Domain/Application invocation. |
| Authorization error | Authenticated actor lacks access or capability. | Forbidden; avoid leaking unauthorized resource details. |
| Not found | `PortfolioExecutionNotFoundError`. | Safe not-found where authorization permits disclosure. |
| Domain conflict | `InvalidExecutionOperationError`, unknown work item/candidate, duplicate accepted artifact, unresolved completion. | Conflict or semantic rejection without internal details. |
| Concurrency conflict | `PortfolioExecutionConcurrencyConflictError`. | Conflict; client should reload. |
| Persistence failure | Persistence unavailable, mapping failure, unsupported record version. | Service unavailable or internal safe failure depending category. |
| Internal presentation error | Unexpected mapping or host failure. | Internal failure with safe correlation. |

## 24. Transport Error-Mapping Strategy

For the first HTTP host, conceptual status mapping:

| Presentation category | HTTP status | Notes |
| --- | --- | --- |
| Malformed or invalid transport input | 400 | Includes invalid identifiers and shape errors. |
| Unauthenticated | 401 | Host-owned. |
| Unauthorized | 403 | May mask resource existence when required. |
| Portfolio execution not found | 404 | Only after authorization allows existence disclosure. |
| Domain conflict | 409 | Lifecycle, duplicate, unresolved completion, unknown child within known execution. |
| Optimistic concurrency conflict | 409 | No automatic replay. |
| Persistence unavailable | 503 | Retryable only where idempotency exists. |
| Unexpected internal failure | 500 | Safe message only. |

HTTP status does not enter Domain or Application errors.

Future error response fields:

- stable `code`;
- safe `message`;
- `correlationId`;
- field issues for input errors;
- `retryable` only where accurately known.

Do not expose stack traces, SQLSTATE, SQL, database names, migration internals, record payloads, actor secrets, or raw internal messages.

## 25. Correlation Flow

Canonical correlation flow:

```text
incoming correlation header or generated value
  -> PortfolioExecutionCommandContext
  -> Domain fact
  -> Application Result correlationId
  -> presentation response
  -> safe logs
```

Rules:

- successful operations use fact/result correlation as authoritative;
- failures before fact production use host correlation;
- safe error responses include correlation ID;
- no response returns the full command context;
- correlation is not authentication;
- correlation is not idempotency.

## 26. Concurrency and Retry Semantics

When optimistic concurrency fails:

- return a conflict response;
- do not retry automatically;
- do not reload and replay the command;
- preserve correlation;
- instruct clients to reload state where appropriate;
- do not expose expected or actual revision unless a later presentation contract approves it.

Safe client retries may apply to read operations and temporary persistence unavailability only when idempotency exists.

Unsafe automatic retry includes state-changing commands without idempotency, concurrency conflicts, and Domain rejections.

## 27. Versioning Decision

Existing API architecture requires versioned APIs, but no implemented host convention exists.

Decision for first API slice:

- define explicit versioned response and error contracts;
- prefer route or package-level versioning in `apps/api` unless later host conventions choose headers;
- do not add version fields to Domain or Application objects;
- do not treat Domain projections or Application Results as external version contracts;
- defer OpenAPI generation library selection.

## 28. Content-Type and Payload Limits

HTTP hosts own:

- JSON content type enforcement;
- body-size limits;
- unknown-field behavior;
- duplicate-key policy;
- malformed encoding handling;
- request timeout behavior.

These concerns must not enter Application inputs or Domain value objects.

## 29. Security and Privacy Boundary

Minimum controls before public exposure:

- authenticated principal-derived `actorReference`;
- authorization before mutation;
- tenant/resource boundary checks;
- bounded identifier and correlation lengths;
- no trusted client command IDs;
- no trusted client timestamps;
- no aggregate JSON logging by default;
- no raw request-body logging by default;
- no database URL, password, SQL, Pool, Drizzle, migration, or record leakage;
- sanitized errors;
- rate limiting at host/middleware boundary for public APIs.

Provider-specific authentication, authorization, and rate limiting remain deferred.

## 30. Runtime Access and Handler Lifetime

Future host runtime access rules:

- create `PortfolioWorkspaceRuntime` once during host startup;
- handlers receive or close over the runtime;
- handlers access only named Application Services;
- handlers do not access repository, Pool, Drizzle, schema, mapper, or migration internals;
- handlers do not dispose runtime per request;
- host disposes runtime during shutdown;
- handlers check host readiness before accepting work;
- no service locator or global mutable singleton unless a future host convention explicitly requires it.

Handlers should be stateless. Per-request state is limited to parsed input, principal, correlation, command context, Application Result, and response mapping.

Handlers must not store aggregates, repositories, revisions, sessions, or mutable service state between requests.

## 31. Presentation Mapper Design

Future mappers should be explicit and use-case-specific:

- request to Application input;
- Application Result to response;
- error to response.

Do not introduce:

- generic automapper;
- reflection-based DTO mapping;
- decorator-based serialization;
- universal controller base class;
- command bus;
- handler registry.

Explicit mapping is required because response contracts are security-sensitive.

## 32. Cross-Bounded-Context Ownership

Portfolio Workspace requires:

- `PortfolioPlanReference`;
- `PlanSnapshotReference`;
- `ApprovalReference`.

Future initialization should receive these through an approved Planning/Approval boundary, not by presentation inventing references.

Potential future flow:

```text
Portfolio Planner / approval bounded context
  -> approved application orchestration
  -> Portfolio Workspace initialization
  -> behavioral Portfolio Workspace use cases
```

Cross-context orchestration does not belong inside a generic presentation handler. It may require an outer Application orchestration slice or a host-specific orchestration decision.

## 33. Internal Versus Public API Decision

Recommendation: first implement an internal API boundary.

Reason:

- initialization use case is missing;
- query Application Services are missing;
- authorization contract is missing;
- durable idempotency is missing;
- response/error contracts are not yet implemented.

Internal first means controlled clients, explicit non-public scope, and no retry/idempotency promises. Public mutation endpoints require stronger prerequisites.

## 34. OpenAPI and Schema Generation

OpenAPI is deferred.

Do not derive public schema automatically from Domain classes, Application inputs, Application Results, or Domain projections.

Future options:

- handwritten OpenAPI from approved presentation contracts;
- generated schemas from presentation-owned contracts;
- framework-derived docs only after contracts are stable.

No schema library is selected in A15.

## 35. Query-Side Architecture

Preferred next query approach:

- add query Application Services over the existing `PortfolioExecutionRepository` for initial summary reads;
- defer separate read repositories, CQRS, projection persistence, and search indexes until query volume or read-model needs justify them;
- never let presentation load aggregates directly from repositories.

Mutation-only responses are enough for live handler smoke tests, but not enough for a complete user-facing API.

## 36. API Error Logging Boundary

Future internal logs may include:

- safe error code;
- correlation ID;
- use-case name;
- execution ID where authorization and privacy policy permit;
- sanitized technical category;
- timing.

Logs must not include:

- database URL;
- SQL;
- aggregate JSON;
- passwords or tokens;
- full request body;
- actor secrets;
- stack traces in client responses.

Logging implementation remains deferred.

## 37. Test Strategy

Future test layers:

| Layer | Coverage |
| --- | --- |
| Unit | Request mapping, response mapping, error mapping, command-context construction, auth/authorization fakes. |
| Application integration | Handlers invoke real Application Services with in-memory repository/runtime. |
| HTTP/transport integration | Route or handler request/response behavior without requiring live PostgreSQL for every case. |
| Live host integration | Real runtime and PostgreSQL for selected critical paths: startup, readiness, one or more persisted command flows, shutdown. |
| Security | Invalid IDs, spoofed actor, leaked errors, oversized payloads, unauthorized access, concurrency conflict mapping. |

No tests are implemented in A15.

## 38. Presentation Architecture Findings

| Identifier | Classification | Affected area | Evidence | Impact | Required action | Owning future slice |
| --- | --- | --- | --- | --- | --- | --- |
| A15-F-001 | NO ISSUE | Domain/Application/Infrastructure boundaries | Portfolio Workspace Domain, Application, Infrastructure, and runtime are complete and inward-facing boundaries remain clean. | Presentation can be designed as an outer adapter without contract changes. | Preserve dependency direction. | A15.1+ |
| A15-F-002 | NO ISSUE FOR PRESENTATION CONTRACTS | Initialization | A15.3a adds `InitializePortfolioExecutionApplicationService` and domain initialization behavior; A15.3b exposes the service through runtime composition; A15.3c adds primitive initialization request, response, and request-to-input mapping contracts. | Presentation no longer needs to seed aggregates directly, but public endpoint exposure still needs authorization, durable idempotency, and a handler/route slice. | Implement the approved handler only after authorization and idempotency boundaries are settled. | Future A15 |
| A15-F-003 | RESOLVED FOR GET-BY-ID | Query side | A15.4 adds Get Portfolio Execution as an Application-owned query service over the existing aggregate repository, A15.4b exposes it through runtime, A15.5 adds the internal get-by-ID handler, and A15.8 validates the real host/runtime/repository/PostgreSQL path live. List/search queries remain deferred because no approved repository capability exists. | Internal get-by-ID reload is validated; list/search remains outside the approved scope. | Preserve the approved get-by-ID boundary; defer listing until repository/query architecture justifies it. | Completed for get-by-ID |
| A15-F-004 | REQUIRED BEFORE PUBLIC MUTATION ENDPOINTS | Idempotency | A14 states `commandId` is not durable idempotency. | Public retries could duplicate state-changing business decisions. | Define idempotency key ownership, store, replay/conflict behavior, and response semantics. | Future idempotency slice |
| A15-F-005 | REQUIRED DURING PRESENTATION IMPLEMENTATION | Response models | A11.2 states Application Results are not transport DTOs. | Direct serialization would overexpose internal contracts and version Domain/Application types as API schema. | Define explicit presentation response models. | A15.1 |
| A15-F-006 | REQUIRED DURING PRESENTATION IMPLEMENTATION | Error mapping | Known Domain/Application/repository errors exist, but no presentation error contract is implemented. | Endpoint behavior would be inconsistent or leak internals. | Define presentation error taxonomy and safe mapping. | A15.1 |
| A15-F-007 | NO ISSUE | Command context/principal mapping | A15.2 defines trusted principal mapping and operation-specific command-context construction in `apps/api`. | Handlers have a trusted way to create `actorReference`, `commandId`, `correlationId`, and `occurredAt` without trusting request-body command metadata. | Preserve mapping boundary; provider-specific authentication and authorization remain deferred. | Completed in A15.2 |
| A15-F-008 | RESOLVED FOR INTERNAL HOST | Host runtime integration | A15.7 adds framework-neutral API host lifecycle composition with one runtime instance, handler assembly, readiness/liveness, and disposal. A15.8 validates the host object live against PostgreSQL 17 across startup, migration readiness, initialize/get handlers, failure mapping, authorization denial, correlation/privacy, lifecycle cleanup, and cross-host persistence. | Internal host composition is validated; concrete public HTTP/server routes remain deferred. | Preserve the internal host boundary; add concrete public transport only in an approved future slice. | Completed for internal host |
| A15-F-009 | REQUIRED BEFORE PUBLIC MUTATION ENDPOINTS | Authorization | A15.5 defines a host-local authorization boundary, but no execution ownership or production capability model exists. | Public endpoints cannot determine whether an actor may mutate an execution. | Implement production authorization policy before public exposure. | Future authz slice |
| A15-F-010 | NON-BLOCKING | Node release parity | Repository requires Node `>=22 <23`; recent validation ran under Node 24. | Release confidence still needs Node 22 parity. | Validate presentation and runtime slices under Node 22. | Release validation |
| A15-F-011 | NON-BLOCKING | CI live runtime gate | A14.6 live validation passed locally, but CI gate implementation is deferred. | Future regressions may not be caught automatically in CI. | Add CI live PostgreSQL gate when CI environment is ready. | Future CI slice |

## 39. Recommended Implementation Sequence

1. A15.1 - Presentation Contract and Error Boundaries.
2. A15.2 - Command Context and Principal Mapping.
3. A15.3 - Portfolio Execution Initialization Use Case and Reference Source Boundary.
4. A15.4 - Query Application Services for Execution Summary and Reload.
5. A15.5 - First Internal API Handler in `apps/api/src/portfolio-workspace/`.
6. A15.6 - Presentation Integration Tests.
7. A15.7 - Host Runtime Integration.
8. A15.8 - Live Host/API Integration Validation. Completed for the approved internal host boundary.
9. Future public API hardening: authorization, idempotency, rate limiting, OpenAPI, observability.

## 40. Deferred Topics

Explicitly deferred:

- REST endpoint implementation;
- GraphQL;
- controllers;
- route handlers;
- CLI commands;
- worker handlers;
- DTO classes;
- OpenAPI schemas;
- authentication provider integration;
- authorization roles and policies;
- idempotency storage;
- rate limiting;
- telemetry;
- framework middleware;
- UI;
- AI integration;
- query repositories;
- projection persistence;
- cross-context orchestration implementation;
- CI live runtime gate.

## 41. Architecture Score

Score: 8 out of 10.

The boundary is sound and aligns with A10-A14. The main readiness constraints are missing initialization, query, authorization, idempotency, and presentation error/response contracts before public endpoint exposure.

## 42. Final Readiness Decision

GO WITH CONDITIONS
