# A14 - Portfolio Workspace Runtime Composition Architecture

## 1. Document Control

| Field | Value |
| --- | --- |
| Document | A14 - Portfolio Workspace Runtime Composition Architecture |
| Bounded context | Portfolio Workspace |
| Status | Canonical runtime-composition architecture |
| Scope | Architecture only |
| Supersedes | None |
| Enables | A14.1 - Runtime Configuration Contract |

## 2. Purpose

This document defines how the completed Portfolio Workspace Domain,
Application, and Infrastructure pieces are composed at runtime.

The composition architecture must connect:

1. runtime configuration;
2. PostgreSQL connection ownership;
3. Drizzle database construction;
4. migration readiness;
5. `PostgresPortfolioExecutionRepository`;
6. Portfolio Workspace Application Services;
7. future presentation or host adapters.

It does not implement runtime composition.

## 3. Authoritative Sources Reviewed

| Source | Runtime relevance |
| --- | --- |
| ARCH-004 | PortfolioExecution is the execution/workspace aggregate boundary. |
| A10.2.1b-A10.2.1g | Domain vocabulary, policies, projections, and service boundaries. |
| A11.1 | Application Services coordinate use cases and own transaction boundaries. |
| A11.2 | Application Results expose projection/fact results, not aggregates. |
| A11.10 | Application Layer review findings for boundary safety. |
| A11.11 | Operation-specific command context and correlation alignment. |
| A12.1 | Infrastructure boundary and adapter ownership. |
| A12.2 | Repository adapter contract-test boundary. |
| A12.3 | In-memory adapter as non-durable test/local adapter. |
| A12.4 | Durable record mapping and safe rehydration boundaries. |
| A12.5 | PostgreSQL + Drizzle + node-postgres selected for durable storage. |
| A12.6 | Revision-aware repository contracts and persistence errors. |
| A12.7 | Durable PortfolioExecution record and mapper. |
| A12.8 | PostgreSQL schema and initial migration. |
| A12.9 | PostgreSQL repository adapter. |
| A12.9a | Asynchronous repository-contract alignment. |
| A12.10 | Live PostgreSQL integration validation. |
| A13 | Release Candidate architecture review. |
| A13.1 | Release hygiene and documentation reconciliation. |
| `apps/api` | Reserved future API host; no runtime composition implemented. |
| `apps/worker` | Reserved future worker host; no runtime composition implemented. |
| `packages/config` | Reserved for configuration contracts and access boundaries. |
| `packages/persistence` | Technology-agnostic persistence primitives; no storage implementation. |
| `packages/infrastructure` | Owns PostgreSQL schema, mapper, adapter, migration, and live tests. |
| `packages/portfolio-workspace-application` | Owns Application Services and `PortfolioExecutionRepository` port. |
| `packages/portfolio-workspace` | Owns Domain model and must remain inward of Application and Infrastructure. |

## 4. Current Runtime Assets

| Asset | Current status | Runtime implication |
| --- | --- | --- |
| Portfolio Workspace Domain | Implemented | No runtime infrastructure dependency may enter it. |
| Portfolio Workspace Application Services | Implemented | Services are constructed with `PortfolioExecutionRepository`. |
| `PortfolioExecutionRepository` port | Implemented | Application-owned persistence boundary. |
| In-memory repository adapter | Implemented | Test/local adapter; not durable. |
| PostgreSQL repository adapter | Implemented | Durable adapter; requires Drizzle database instance. |
| Drizzle schema and migration | Implemented | Infrastructure-owned database shape. |
| Live PostgreSQL validation | Implemented | Durable adapter has passed repository contract coverage against PostgreSQL. |
| API host | Reserved | Future presentation composition root candidate. |
| Worker host | Reserved | Future background composition root candidate. |
| Runtime configuration contract | Implemented in A14.1 | Infrastructure-owned validated configuration. |
| PostgreSQL Pool and Drizzle factory | Implemented in A14.2 | Infrastructure-owned Pool, Drizzle database, and deterministic disposal; no repository, services, migrations, or full runtime composition. |
| Migration readiness verification | Implemented in A14.3 | Infrastructure-owned connectivity, migration-mode, Drizzle metadata, and schema compatibility verification; no repository, services, host readiness, or full runtime composition. |
| Portfolio Workspace runtime composition | Implemented in A14.4 and extended in A15.3b/A15.4b | Explicit Infrastructure runtime factory composing configuration, database runtime, migration readiness, PostgreSQL repository, and ten Application Services including Initialize Portfolio Execution and Get Portfolio Execution; no host adapter, DI, API, health endpoint, or in-memory fallback. |
| Runtime lifecycle and readiness status | Implemented in A14.5 | Local runtime lifecycle, liveness, readiness, and deterministic disposal reporting; no active database health probe, host signal handling, request draining, endpoint, telemetry, or timeout orchestration. |
| Runtime composition integration validation | Implemented and live validated in A14.6; updated in A15.3b/A15.4b | Dedicated live PostgreSQL runtime composition command validates migration apply/verify, ten services, initialization and get-by-id query through the composed runtime, durable persistence, lifecycle/readiness, disposal, partial-startup cleanup, and safe error/privacy behavior against a safe PostgreSQL test environment. |

## 5. Runtime Composition Definition

Runtime composition is the outer-layer assembly of configuration,
infrastructure resources, repository adapters, Application Services, and host
adapters.

It is not:

- Domain logic;
- Application business orchestration;
- repository behavior;
- migration authoring;
- dependency-injection framework;
- command bus;
- workflow engine;
- presentation mapping;
- persistence mapping.

Runtime composition may create and dispose technical resources. It must not
make Portfolio Workspace business decisions.

## 6. Composition Root Options Evaluated

| Option | Classification | Decision |
| --- | --- | --- |
| A. API host (`apps/api`) | Valid host-level root when API arrives | Defer concrete use until presentation slice. |
| B. Worker host (`apps/worker`) | Valid host-level root for background work | Defer; no worker use case currently exists. |
| C. Application package | Rejected for infrastructure composition | Application must not depend on PostgreSQL, Drizzle, or Pool. |
| D. Bounded-context runtime module under Infrastructure | Approved reusable factory location | Use for future Portfolio Workspace infrastructure composition helpers. |
| E. Dedicated runtime/composition package | Not currently justified | Defer until multiple hosts or contexts require independent package ownership. |

## 7. Composition Root Decision

The first concrete host-level composition root must live in the outer host that
receives the request or job, such as `apps/api` for an API endpoint or
`apps/worker` for background execution.

Reusable Portfolio Workspace infrastructure wiring may be implemented under:

`packages/infrastructure/src/portfolio-workspace/runtime`

This module may construct PostgreSQL-backed Portfolio Workspace runtime objects
because it is outside the Domain and Application packages and may depend on
both the Application port and Infrastructure adapter.

The Application package must not become the runtime composition root for
PostgreSQL-backed execution.

## 8. Dependency Direction

Required dependency direction:

`Host -> Infrastructure runtime composition -> Infrastructure adapter -> Application port -> Domain`

Allowed package dependency shape:

| Package or layer | May depend on | Must not depend on |
| --- | --- | --- |
| Host apps | Application, Infrastructure, Config, Persistence primitives | Domain internals, adapter internals outside public runtime contract |
| Infrastructure runtime module | Application, Infrastructure adapter/schema/migrations, Config contracts | Presentation framework semantics |
| Infrastructure adapter | Application repository port, Domain public API, Drizzle | Host apps, controllers, UI |
| Application package | Domain, Kernel | Infrastructure, Drizzle, PostgreSQL, host apps |
| Domain package | Kernel only as approved | Application, Infrastructure, PostgreSQL, Drizzle, host apps |

## 9. Manual Composition Decision

Portfolio Workspace runtime composition must use explicit manual construction.

Approved pattern:

1. validate configuration;
2. create technical resources;
3. construct repository adapter;
4. construct use-case services;
5. expose a narrow runtime object;
6. dispose resources explicitly.

Do not introduce:

- DI container;
- service locator;
- command bus;
- handler registry;
- workflow engine;
- generic use-case framework;
- global singleton runtime.

Manual composition should be revisited only if the number of bounded contexts,
resource lifetimes, or host variants makes explicit assembly materially harder
to govern.

## 10. Runtime Object Graph

Canonical durable runtime graph:

```text
PortfolioWorkspaceRuntimeConfiguration
  -> pg Pool
  -> Drizzle NodePgDatabase
  -> Migration readiness check / migration runner
  -> PostgresPortfolioExecutionRepository
  -> InitializePortfolioExecutionApplicationService
  -> BeginExecutionApplicationService
  -> CompleteWorkItemApplicationService
  -> AcceptCandidateApplicationService
  -> RejectCandidateApplicationService
  -> CompleteExecutionApplicationService
  -> CancelExecutionApplicationService
  -> ActivateWorkItemApplicationService
  -> CancelWorkItemApplicationService
  -> PortfolioWorkspaceRuntime
```

`PortfolioWorkspaceRuntime` may expose Application Services and `dispose()`.

It must not expose:

- `Pool`;
- Drizzle database instance;
- schema objects;
- repository adapter by default;
- migration internals;
- mapper internals.

## 11. Configuration Contract

The future runtime configuration contract must include only technical runtime
inputs required to build the durable Portfolio Workspace runtime.

Minimum expected concepts:

| Concept | Purpose |
| --- | --- |
| database URL | PostgreSQL connection target. |
| environment | Determines migration and safety policy. |
| migration mode | Verifies or applies committed migrations according to environment. |
| pool settings | Controls process-level PostgreSQL connection behavior. |
| startup timeout | Bounds readiness checks. |
| shutdown timeout | Bounds graceful disposal. |

Configuration must be validated before resources are created.

Configuration validation may use the existing `packages/config` boundary when
implemented. Until then, validation belongs to the runtime composition layer,
not Domain or Application.

## 12. Secret Handling

Database credentials are runtime secrets.

Rules:

- secrets are read only at the host or runtime composition boundary;
- secrets are never stored in Domain, Application inputs, Application Results,
  Domain Facts, or projections;
- logs must not include passwords or full database URLs;
- validation errors may identify a missing or invalid configuration key without
  exposing the secret value;
- tests must use explicitly test-scoped database URLs.

## 13. Database Connection Ownership

The runtime composition root owns the PostgreSQL `Pool` lifecycle.

Rules:

- the repository adapter does not create a `Pool`;
- Application Services do not receive a `Pool`;
- Domain objects do not know a `Pool` exists;
- the host or infrastructure runtime module closes the `Pool` during shutdown;
- the `Pool` is process-scoped unless a host-specific platform requires a
  narrower lifecycle.

The first durable runtime should use one Portfolio Workspace PostgreSQL pool per
process/runtime instance.

## 14. Drizzle Database Ownership

The Drizzle `NodePgDatabase` is infrastructure runtime state.

Rules:

- it is constructed from the owned PostgreSQL `Pool`;
- it is passed to `PostgresPortfolioExecutionRepository`;
- it is not exposed to Application Services;
- it is not exported through Application Results;
- it is not imported by Domain or Application packages.

Drizzle remains an Infrastructure access technology, not an Application
contract.

## 15. Repository Adapter Ownership

`PostgresPortfolioExecutionRepository` is an Infrastructure adapter that
implements the Application-owned `PortfolioExecutionRepository` port.

Runtime composition may construct it. Application Services may depend only on
the port interface.

The repository adapter lifetime is tied to the runtime. It should remain
stateless except for its database dependency.

## 16. Application Service Construction

The runtime composition layer constructs the ten implemented Application
Services with the same `PortfolioExecutionRepository` instance:

| Service | Runtime dependency |
| --- | --- |
| `InitializePortfolioExecutionApplicationService` | `PortfolioExecutionRepository` |
| `GetPortfolioExecutionApplicationService` | `PortfolioExecutionRepository` |
| `BeginExecutionApplicationService` | `PortfolioExecutionRepository` |
| `CompleteWorkItemApplicationService` | `PortfolioExecutionRepository` |
| `AcceptCandidateApplicationService` | `PortfolioExecutionRepository` |
| `RejectCandidateApplicationService` | `PortfolioExecutionRepository` |
| `CompleteExecutionApplicationService` | `PortfolioExecutionRepository` |
| `CancelExecutionApplicationService` | `PortfolioExecutionRepository` |
| `ActivateWorkItemApplicationService` | `PortfolioExecutionRepository` |
| `CancelWorkItemApplicationService` | `PortfolioExecutionRepository` |

Services are stateless and may be reused for the lifetime of the runtime.

## 17. Runtime Factory Design

Future implementation should introduce a narrowly scoped factory, conceptually:

```text
createPortfolioWorkspaceRuntime(configuration)
  -> PortfolioWorkspaceRuntime
```

The returned runtime may contain:

- `services`;
- `dispose()`;
- optional readiness metadata that does not expose credentials or database
  objects.

The factory must not:

- read transport requests;
- create command contexts;
- map HTTP errors;
- expose Pool or Drizzle;
- create generic application frameworks;
- select an adapter silently based on production fallback.

## 18. Startup Sequence

Canonical durable startup sequence:

1. read host-provided configuration;
2. validate configuration and secret presence;
3. create PostgreSQL `Pool`;
4. create Drizzle database instance;
5. verify database connectivity;
6. verify or apply migrations according to migration policy;
7. construct `PostgresPortfolioExecutionRepository`;
8. construct Application Services;
9. expose runtime to the host;
10. mark host readiness.

Any failure before step 9 fails startup.

## 19. Shutdown Sequence

Canonical shutdown sequence:

1. host stops accepting new work;
2. host allows in-flight work to finish within its shutdown timeout;
3. Portfolio Workspace runtime `dispose()` is called once;
4. runtime closes the PostgreSQL `Pool`;
5. telemetry or logs are flushed by the host, if implemented.

`dispose()` must be idempotent.

Shutdown must not mutate Domain state or attempt domain retries.

## 20. Migration Ownership and Policy

Migration files are owned by Infrastructure.

Migration execution is owned by the runtime/deployment boundary, not the
repository adapter and not Application Services.

| Environment | Policy |
| --- | --- |
| Local development | Explicit developer migration command or local startup mode may apply committed migrations. |
| Automated tests | Test harness applies committed migrations to an isolated test database/schema. |
| CI live gate | CI applies committed migrations to isolated test PostgreSQL before live integration tests. |
| Staging | Release/deployment migration job applies migrations before application readiness. Startup verifies compatibility. |
| Production | Dedicated release migration command/job applies migrations. Application startup verifies compatibility and fails closed if incompatible. |

Production application startup should not compete across multiple instances to
run migrations automatically.

## 21. Adapter Selection

Approved adapter selection:

| Scenario | Adapter |
| --- | --- |
| Production durable runtime | PostgreSQL adapter. |
| Staging durable runtime | PostgreSQL adapter. |
| Live integration tests | PostgreSQL adapter against isolated PostgreSQL. |
| Unit tests | In-memory adapter or test double. |
| Domain tests | No repository adapter. |
| Application service tests | In-memory or test-local fake implementing the port. |

Do not silently fall back from PostgreSQL to in-memory in production or staging.

Adapter selection must be explicit in host/test composition.

## 22. Service and Repository Lifetime

| Runtime object | Lifetime | Concurrency expectation |
| --- | --- | --- |
| PostgreSQL `Pool` | Process/runtime instance | Safe for concurrent requests according to node-postgres behavior. |
| Drizzle database | Process/runtime instance | Shares pool-backed database access. |
| Repository adapter | Process/runtime instance | Stateless wrapper over Drizzle database. |
| Application Services | Process/runtime instance | Stateless use-case coordinators. |
| Domain aggregate | Per load/use-case invocation | Never cached as mutable runtime singleton. |

Loaded aggregates must remain request/use-case local.

## 23. Presentation Boundary

Future API, CLI, or worker adapters may:

- parse transport input;
- authenticate and authorize actors;
- create `PortfolioExecutionCommandContext`;
- construct Application input contracts;
- invoke one Application Service;
- map `Result` values to presentation-specific responses;
- attach presentation-level logging and metrics.

They must not:

- call Domain aggregates directly;
- construct Domain Facts;
- bypass Application Services;
- receive or return `PortfolioExecution`;
- access Pool, Drizzle, schema, or repository internals;
- persist projections independently.

## 24. Command Context Creation

Operation-specific command context is created at the presentation/host boundary.

Rules:

- `commandId` is generated or accepted by the host according to future
  idempotency policy;
- `correlationId` follows the incoming request/job correlation when available
  or is generated by the host;
- `actorReference` is derived from authenticated/authorized host context, not
  trusted directly from arbitrary request payloads;
- `occurredAt` is captured once for the operation before the Application Service
  is invoked;
- the Application Service passes the same context to the aggregate;
- the returned Domain Fact carries the same context;
- the Application Result correlation ID is derived from the returned fact.

## 25. Error Flow

Canonical error flow:

| Error source | Examples | Propagation |
| --- | --- | --- |
| Domain | lifecycle rejection, unknown work item, duplicate candidate | Returned through use-case `Result` unchanged as domain rejection. |
| Application | aggregate not found | Returned through use-case `Result` as Application failure. |
| Repository port | concurrency conflict, already exists, persistence unavailable, mapping failure, unsupported record version | Returned through use-case `Result` using technology-neutral repository errors. |
| Infrastructure adapter internals | PostgreSQL, Drizzle, driver details | Wrapped or translated before crossing the repository port. |
| Presentation | bad request, auth, transport mapping | Future host concern only. |

No SQLSTATE, table name, connection string, raw SQL, or vendor object may cross
into Domain or Application contracts.

## 26. Transaction Boundary

Current Portfolio Workspace use cases require one aggregate load, one aggregate
decision, and one revision-aware aggregate save.

The PostgreSQL adapter's compare-and-swap save is the current atomic
persistence boundary.

Do not introduce a transaction manager until one of the following appears:

- multi-aggregate use case;
- multiple durable writes in one Application Service;
- outbox/integration event storage;
- projection persistence in the same consistency boundary;
- cross-resource coordination.

The existing `packages/persistence` transaction primitives are not required for
the first Portfolio Workspace runtime composition.

## 27. Retry and Idempotency

Automatic retry is not approved for Application Services or the repository
adapter.

Rules:

- stale revision conflicts fail deterministically;
- Application Services must not reload and replay domain operations;
- repository adapters must not blindly retry failed saves;
- PostgreSQL transient connection recovery may be handled by the Pool/driver,
  but business operations are not replayed automatically.

`commandId` is not yet a durable idempotency key. Public mutation endpoints
must receive a separate idempotency decision before they allow client retries
that could duplicate business decisions.

## 28. Health and Readiness

Host liveness and readiness are separate.

| Check | Meaning |
| --- | --- |
| Liveness | Process is running and the local Portfolio Workspace runtime is not terminally disposed. |
| Readiness | Configuration is valid, PostgreSQL is reachable during startup, schema/migrations are compatible, Portfolio Workspace runtime is constructed, and the runtime lifecycle is `ready`. |

Readiness checks must use technical database checks or migration metadata. They
must not create, mutate, or save PortfolioExecution aggregates.

A14.5 implements the reusable runtime-local status contract:

- `ready`: live and ready;
- `disposing`: live but not ready;
- `disposed`: not live and not ready;
- `disposal-failed`: not live and not ready.

The runtime status is derived from startup readiness evidence plus local
lifecycle state. It does not perform active database probes, open transactions,
execute queries, schedule polling, install signal handlers, drain host requests,
or expose an HTTP health endpoint. Host adapters remain responsible for turning
this local status into platform-specific liveness and readiness checks.

## 29. Observability

Observability belongs to host and infrastructure wrappers, not Domain or
Application business objects.

Approved future signals:

- runtime startup success/failure;
- migration verification status;
- repository load/save latency;
- save conflict count;
- persistence unavailable count;
- mapping/version failure count;
- Application Service success/failure count;
- Pool health metrics.

Do not log:

- database passwords;
- full connection URLs;
- aggregate payloads by default;
- artifact evidence contents;
- raw SQL with sensitive parameters.

## 30. Multi-Host Reuse

The same Portfolio Workspace infrastructure runtime factory may be reused by:

- API host;
- worker host;
- future CLI host;
- integration-test harness.

Host adapters remain responsible for transport-specific input, authentication,
authorization, and response mapping.

The reusable runtime factory must remain host-neutral.

## 31. Serverless and Long-Running Hosts

Long-running hosts:

- create one runtime during process startup;
- reuse services and repository across requests/jobs;
- dispose the runtime during shutdown.

Serverless hosts:

- may cache the runtime per warm execution environment;
- must not run migrations per invocation;
- must bound pool size for platform limits;
- must dispose only when the platform exposes a reliable lifecycle hook or when
  a test/runtime harness explicitly owns disposal.

The first implementation should optimize for long-running process correctness
while keeping serverless constraints visible.

## 32. Local Development and Test Composition

Local development may use either:

- PostgreSQL adapter against a local/test database; or
- in-memory adapter for non-durable developer workflows.

Tests must select adapters explicitly.

Rules:

- unit tests should not require PostgreSQL unless specifically marked live;
- live integration tests must require a test-scoped PostgreSQL URL;
- test database names must remain safety-checked;
- in-memory adapter must not be used as a production fallback.

## 33. CI and Deployment Composition

CI should include:

- static package validation;
- mapper and schema tests;
- in-memory repository contract tests;
- PostgreSQL live integration tests when a test PostgreSQL service is available;
- migration check against committed migration files.

Deployment should include:

- secret injection by host platform;
- migration command/job before new runtime readiness;
- startup readiness verification;
- shutdown disposal behavior.

No CI or deployment implementation is introduced by this document.

## 34. Security Boundaries

Security rules:

- runtime secrets remain outside Domain and Application packages;
- database permissions should be scoped to Portfolio Workspace persistence needs;
- migration credentials may be distinct from application runtime credentials;
- error messages crossing Application boundaries must be technology-neutral;
- logs must avoid aggregate payloads and evidence contents unless a future
  redaction policy approves them;
- future host adapters own authentication and authorization.

## 35. Failure Modes

| Failure mode | Required behavior |
| --- | --- |
| Missing configuration | Startup fails before resource creation. |
| Invalid database URL | Startup fails with sanitized configuration error. |
| PostgreSQL unavailable | Startup/readiness fails or use case returns persistence unavailable through repository port. |
| Migration incompatible | Startup readiness fails closed. |
| Unsupported record version | Repository load fails through technology-neutral error. |
| Mapping failure | Repository load/save fails without exposing database row details. |
| Stale revision | Save returns concurrency conflict; no replay. |
| Pool shutdown failure | Runtime dispose reports technical failure without mutating domain state. |

## 36. Package Placement Decision

Future implementation placement:

| Concern | Placement |
| --- | --- |
| Runtime configuration contract | `packages/infrastructure/src/portfolio-workspace/runtime` or `packages/config` contract if shared validation is ready. |
| PostgreSQL Pool factory | `packages/infrastructure/src/portfolio-workspace/runtime`. |
| Drizzle database factory | `packages/infrastructure/src/portfolio-workspace/runtime`. |
| Migration readiness helper | Implemented in `packages/infrastructure/src/portfolio-workspace/runtime` using existing migration assets. |
| Portfolio Workspace runtime factory | `packages/infrastructure/src/portfolio-workspace/runtime`. |
| Host invocation | future `apps/api`, `apps/worker`, or CLI host. |
| Presentation mapping | future host/presentation layer, not Infrastructure runtime module. |

Do not move `PortfolioExecutionRepository` from the Application package.

## 37. Public API Decision

Future public API should expose only stable runtime composition contracts needed
by hosts.

Potential Infrastructure exports:

- `PortfolioWorkspaceRuntimeConfiguration`;
- `PortfolioWorkspaceRuntime`;
- `createPortfolioWorkspaceRuntime`;
- sanitized runtime startup error types, if required.

Do not export:

- Pool;
- Drizzle database;
- Drizzle schema;
- migration SQL internals;
- repository adapter as part of host-facing runtime object;
- mapper internals;
- generic composition framework.

Existing direct adapter export may remain for infrastructure tests and explicit
advanced composition until a narrower runtime export replaces host usage.

## 38. Findings

| ID | Severity | Affected concepts/files | Issue | Required action |
| --- | --- | --- | --- | --- |
| A14-F-001 | NO ISSUE | Runtime configuration | A14.1 implements the canonical Portfolio Workspace runtime configuration contract with sanitized validation and environment policy fields. | No further action for runtime configuration before A14.6. |
| A14-F-002 | NO ISSUE | PostgreSQL Pool and Drizzle ownership | A14.2 implements Infrastructure-owned Pool and Drizzle runtime database construction with deterministic disposal. | No further action for Pool/Drizzle ownership before A14.6. |
| A14-F-003 | NO ISSUE | Migration readiness | A14.3 implements migration verification/apply interpretation, Drizzle metadata compatibility, and schema compatibility checks. | No further action for migration readiness before A14.6. |
| A14-F-004 | NO ISSUE | Runtime object graph | A14.4 implements explicit runtime composition for the PostgreSQL repository, A15.3b extends it with initialization, and A15.4b extends it with Get Portfolio Execution for ten Portfolio Workspace Application Services. | No further action for object graph composition before A15.5. |
| A14-F-005 | NO ISSUE | Runtime lifecycle and readiness status | A14.5 implements local lifecycle, liveness, readiness, disposal idempotency, concurrent disposal sharing, and safe disposal-failure reporting. | Validate the composed runtime against live PostgreSQL in A14.6. |
| A14-F-006 | NO ISSUE | Live runtime validation environment | A14.6 live suite passed against a disposable PostgreSQL 17 test database through Docker and is updated in A15.3b/A15.4b to initialize and query through the composed runtime. | No further A14.6 environment action is required. |
| A14-F-007 | REQUIRED BEFORE PUBLIC MUTATION ENDPOINTS | Idempotency | `commandId` is not a durable idempotency mechanism. | Define idempotency policy before public retryable mutation endpoints. |
| A14-F-008 | DEFERRED | Presentation/API/CLI | No presentation adapter exists. | Implement in later host-specific slices. |
| A14-F-009 | NON-BLOCKING HYGIENE | Release validation | Node 22 validation remains the repository runtime target. | Continue validating release candidates under Node `>=22 <23`. |

A14-F-006 is resolved by live PostgreSQL runtime validation.

## 39. Prerequisites for First Host

Before the first API, CLI, or worker host can use Portfolio Workspace durable
persistence, implement:

1. create the host-specific runtime composition entrypoint using the validated A14 runtime factory;
2. host-specific command-context creation;
3. host-specific error/result mapping;
4. production secret injection policy;
5. idempotency decision for public mutation endpoints.

## 40. Recommended Implementation Sequence

1. A14.1 - Runtime Configuration Contract. Complete.
2. A14.2 - PostgreSQL Pool and Drizzle Runtime Factory. Complete.
3. A14.3 - Migration Readiness Contract. Complete.
4. A14.4 - Portfolio Workspace Runtime Factory. Complete.
5. A14.5 - Runtime Shutdown and Health Checks. Complete.
6. A14.6 - Runtime Composition Integration Tests. Complete; live PostgreSQL validation passed against a disposable test database.
7. A15 - First presentation or host adapter.

## 41. Final Decision

GO WITH CONDITIONS - A14.6 LIVE RUNTIME COMPOSITION VALIDATED; NODE 22 RELEASE VALIDATION REMAINS REQUIRED
