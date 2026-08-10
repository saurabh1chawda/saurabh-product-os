# A16 - Portfolio Workspace Release Candidate and Production Readiness Review

## 1. Review Scope

This document is the A16 release-candidate and production-readiness review for the Portfolio Workspace bounded context after A10 through A15.

The review answers whether Portfolio Workspace is ready to move from architecturally complete internal capability to production-facing rollout work. It distinguishes architecture completeness, release-candidate readiness, internal deployment readiness, public read-only readiness, public mutation readiness, and full production readiness.

This review does not implement new product behavior, HTTP routes, authentication, production authorization, idempotency, observability, CI, persistence changes, retries, dependency injection, list/search, UI, or AI.

## 2. Evidence Reviewed

Reviewed repository evidence includes:

- `docs/architecture/A10*`
- `docs/architecture/A11*`
- `docs/architecture/A12*`
- `docs/architecture/A13*`
- `docs/architecture/A14*`
- `docs/architecture/A15*`
- `packages/portfolio-workspace`
- `packages/portfolio-workspace-application`
- `packages/infrastructure`
- `packages/infrastructure-memory`
- `apps/api`
- root `package.json`
- `pnpm-workspace.yaml`
- `pnpm-lock.yaml`
- package READMEs and package manifests
- `.nvmrc`
- `.npmrc`
- `.github`
- current git diff, status, and validation output

A15.8 live API host validation is accepted as authoritative manual evidence: PostgreSQL 17, 1 test file passed, 8 tests passed, 0 failed, 0 skipped.

## 3. Completed Architecture Baseline

Portfolio Workspace is architecturally complete for the approved internal capability.

Domain:

- `PortfolioExecution` is the aggregate and persistence boundary.
- Work items, artifact candidates, and accepted artifacts are aggregate-owned.
- Identifiers, references, command context, entities, lifecycle values, facts, projections, and policies are immutable or pure as appropriate.
- Domain has no persistence, infrastructure, API, UI, AI, workflow, or transport dependency.

Application:

- Application Services coordinate use cases without duplicating aggregate business rules.
- The Application-owned `PortfolioExecutionRepository` port is revision-aware and asynchronous.
- Inputs and results are immutable, deterministic, projection/fact-oriented, and do not expose aggregates.
- Query support currently includes Get Portfolio Execution by ID.

Infrastructure:

- PostgreSQL + Drizzle + node-postgres is implemented for durable persistence.
- The mapper uses explicit durable records, public constructor rehydration, record version `1`, and technology-neutral mapping failures.
- The PostgreSQL adapter implements revision-aware create/update, optimistic concurrency, duplicate-create detection, stale-save conflict detection, and no automatic retry.
- Migration readiness is Infrastructure-owned, resolves committed migrations module-relatively, validates metadata/schema, and enforces apply/verify-only policy.

Runtime:

- Runtime configuration is validated at the host boundary.
- PostgreSQL Pool and Drizzle database ownership are Infrastructure-owned.
- Runtime composition creates the database runtime, verifies migrations, constructs one PostgreSQL repository, constructs ten Application Services, exposes only services plus lifecycle/disposal, and does not expose Pool/Drizzle/repository internals.
- Lifecycle/readiness/disposal behavior is deterministic and live validated.

Presentation/API host:

- `apps/api` owns transport-neutral presentation contracts, trusted principal mapping, correlation normalization, command-context creation, internal handlers, host-local authorization boundary, and safe status/error mapping.
- The framework-neutral API host composes the runtime and handlers.
- Live API host validation passed against PostgreSQL 17.

## 4. Architecture Completeness Assessment

No remaining architectural contradiction was identified for the approved internal Portfolio Workspace boundary.

Completed and coherent:

- Domain remains inward and business-rule owning.
- Application coordinates one aggregate decision or query per use case.
- Infrastructure implements the Application port without leaking database concepts inward.
- Runtime composes concrete Infrastructure and Application pieces manually without generic DI or service locator.
- Presentation invokes runtime services and maps safe transport contracts without direct repository or aggregate access.

Important distinction: the internal boundary is complete, but public production rollout still requires authentication, production authorization policy, durable idempotency for public mutation, concrete transport routing, observability, Node 22 parity, and CI/live gate decisions.

## 5. Release-Candidate Validation Assessment

Database-free validation is green under the current local environment, with the known Node version warning.

Current explicit validation posture:

| Area | Status |
| --- | --- |
| Package build/lint/typecheck/test | Passing for reviewed Portfolio Workspace packages and API |
| Root build/lint/typecheck/test | Passing |
| Live PostgreSQL repository suite | Implemented as opt-in command; prior A12.10 live PostgreSQL 17 result accepted |
| Live runtime suite | Implemented as opt-in command; prior A14.6 live PostgreSQL 17 result accepted |
| Live API host suite | Implemented as opt-in command; A15.8 manual PostgreSQL 17 result accepted, 8/8 passed |

The release candidate is ready for merge only with release hygiene conditions: isolate commit groups, validate under Node 22, and decide CI live gate policy before production release.

## 6. Node Runtime Parity

Repository requirements:

- `package.json` engines: Node `>=22 <23`
- `.nvmrc`: `22`

Current local environment:

- `node --version`: `v24.14.0`
- visible node path: `C:\Program Files\nodejs\node.exe`

Assessment: Node 22 is not currently visible locally. All recent validation has run on Node 24 with warnings. This is not evidence of functional failure, but it is a release parity gap.

Classification: REQUIRED BEFORE PRODUCTION RELEASE and REQUIRED BEFORE MERGE if the merge policy requires engine-parity validation.

## 7. pnpm and Tooling Assessment

Repository tooling:

- `packageManager`: `pnpm@11.9.0`
- `engines.pnpm`: `11.9.0`
- `.npmrc`: local store and relaxed peer dependency strictness

Observed issue:

- Root scripts invoke nested `pnpm`.
- Without a PATH shim, nested commands may resolve global pnpm `11.16.0` and fail engine checks.
- With Corepack and a temporary pnpm 11.9.0 shim, root scripts pass.

Assessment: tooling is deterministic when Corepack pnpm 11.9.0 is active for nested invocations. Developer onboarding/CI should ensure Corepack activation or PATH resolution uses pnpm 11.9.0.

Classification: P1 before public production; P2 for developer-experience hygiene.

## 8. expect-type Override Assessment

Current override:

```yaml
overrides:
  expect-type: 1.3.0
```

Reason:

- `expect-type@1.4.0` is present in the install tree and lacks `dist/branding.js`.
- `expect-type@1.3.0` contains `dist/branding.js`.
- The override stabilized Vitest execution after the missing file defect was observed.

Scope and risk:

- The override affects test dependency resolution.
- It is narrow and does not affect production runtime code.

Decision: retain temporarily and document as tooling debt. Remove only after a clean pinned-pnpm install proves Vitest no longer needs it.

Classification: P2 follow-up.

## 9. Test-only pg Dependency Assessment

`apps/api` dev dependencies include:

- `pg`
- `@types/pg`

Review:

- `pg` is imported by `apps/api/tests/portfolio-workspace-api-host-live.test.ts`.
- Production `apps/api/src` does not import `pg`.
- The live harness uses `pg.Client` only for test-only PostgreSQL schema setup, cleanup, and validation.
- API production code does not import Drizzle, schema, migration internals, PostgreSQL repository, or Pool.

Classification: ACCEPTABLE TEST DEPENDENCY.

## 10. CI Readiness Assessment

Repository `.github` originally contained templates but no validation workflow file.

Current CI evidence after A16.2:

- `.github/workflows/portfolio-workspace-release-validation.yml` implements the release gate.
- The `Release Validation` job runs Node 22, pnpm 11.9.0, frozen install, build, lint, typecheck, and root tests without a live database URL.
- The `Portfolio Workspace PostgreSQL Integration` job runs PostgreSQL 17 and the explicit repository, runtime, and API host live integration commands.
- Workflow permissions are read-only and no production database credentials are used.
- First GitHub-hosted execution is still pending.

Assessment: CI gate implementation is complete, but production release should wait for the first hosted workflow run to pass before treating CI as operationally proven.

Classification: READY WITH CONDITIONS. Required before production release: observe a green hosted workflow run and configure required checks as appropriate.

## 11. Migration Readiness Assessment

Implemented:

- Drizzle migration and journal are committed under Infrastructure.
- Migration folder discovery is Infrastructure-owned and module-relative.
- Runtime migration readiness validates connectivity, migration metadata, and schema shape.
- `apply` is allowed in development/test composition.
- `apply` is rejected for staging/production; staging/production use verify-only startup.

Deferred:

- Production migration execution workflow.
- Rollback/recovery runbook.
- CI migration gate.
- Managed database operational process.

Assessment: architecture and runtime readiness are sound; production deployment needs an external migration execution plan.

Classification: P1 before production deployment.

## 12. Database Production Readiness Assessment

Implemented:

- PostgreSQL connection URL validation and secret redaction.
- Configurable pool sizing/timeouts.
- Drizzle database construction from Infrastructure-owned Pool.
- Deterministic disposal.
- Schema compatibility checks.
- Revision-aware optimistic concurrency.
- Technology-neutral repository errors.

Deferred or not proven:

- Provider-specific SSL/TLS configuration.
- Least-privilege database role definition.
- Backup/restore runbooks.
- Migration execution ownership.
- Production availability/retry policy.
- Database observability.
- Managed PostgreSQL provider selection/configuration.

Assessment: durable persistence is internally correct and live validated. Production database operations remain release conditions.

## 13. Secrets and Configuration Assessment

Implemented:

- Runtime configuration parses explicit environment-like maps.
- Secret-bearing database URL is redacted from JSON/string/inspection/errors.
- API host owns environment parsing boundary.
- Lower layers do not read `process.env`.

Deferred:

- Deployment secret management path.
- Provider-specific database SSL and credential rotation.
- Environment provisioning documentation.

Assessment: secret redaction and configuration boundaries are strong; deployment secret operations remain required before production.

## 14. Authentication Assessment

Implemented:

- Trusted presentation principal contract.
- Principal-to-actor-reference mapping.
- Handler receives an already-authenticated principal.

Not implemented:

- Provider authentication.
- Token/session validation.
- Middleware or route integration.

Assessment: internal handler tests can supply trusted principals safely. Production-facing exposure is blocked until provider authentication is implemented.

Classification: P1 before public production.

## 15. Authorization Assessment

Implemented:

- Host-local authorization boundary contract.
- Handlers invoke authorization before Application Service calls.
- Tests validate authorization denial and correlation behavior.

Not implemented:

- Production authorization policy.
- Ownership/capability model.
- Role/permission integration.

Assessment: internal architecture is correct. Public access is blocked until production authorization exists.

Classification: P1 before public production; especially required before public mutation.

## 16. Idempotency Assessment

Current state:

- `commandId` is operation audit/correlation context, not durable idempotency.
- `correlationId` is request tracing/correlation, not idempotency.
- Optimistic concurrency prevents stale overwrites, not duplicate public retries.
- Duplicate initialization maps to conflict, but no idempotent response replay exists.

Assessment: durable idempotency is not required for internal deterministic validation, but it is required before public mutation exposure.

Classification: BLOCKING PUBLIC MUTATION.

## 17. Public Transport Assessment

Implemented:

- Framework-neutral internal handlers.
- Host-local internal transport request/response contracts.
- API host composition and lifecycle.

Not implemented:

- Public HTTP routes.
- Server startup integration.
- OpenAPI.
- Rate limiting.
- Public DTO/router binding.

Assessment: public transport is not ready. Internal host capability is ready for the next production-facing design slice.

Classification: P1 before public read/write exposure.

## 18. Query-Side Assessment

Implemented:

- Get Portfolio Execution by ID query service.
- Runtime exposure.
- Internal get-by-ID handler.
- Live PostgreSQL host validation.

Deferred:

- List/search/pagination.
- Query/read model store.
- Reporting indexes.

Assessment: lack of list/search is a product limitation, not a release blocker for the approved internal capability or get-by-ID exposure.

Classification: P2 follow-up.

## 19. Observability Assessment

Implemented:

- Correlation ID propagation.
- Safe startup/readiness/lifecycle state.
- Safe error categories and codes.

Not implemented:

- Logging strategy.
- Metrics.
- Tracing.
- Alerting.
- Audit logs.
- Production dashboards.

Assessment: correlation plumbing exists; production observability does not. Minimum production deployment should define logging, metrics, tracing, readiness endpoints at the concrete host layer, and persistence error monitoring.

Classification: P1 before public production.

## 20. Operational Readiness Assessment

Implemented:

- Runtime startup sequence.
- Migration readiness verification.
- Partial-startup cleanup.
- Runtime/API host liveness/readiness state.
- Idempotent disposal.

Deferred:

- Process signal handling.
- In-flight request draining.
- Concrete server lifecycle.
- Deployment health endpoints.
- Operational runbooks.

Assessment: runtime primitives are ready; process/server operational integration remains future work.

Classification: P1 before production deployment.

## 21. Error Contract Assessment

Implemented:

- Domain, Application, Infrastructure, Presentation, and Host errors are separated.
- Repository errors are technology-neutral across the port.
- Host-safe startup errors preserve name/code without leaking nested details.
- Presentation maps conflict, not-found, invalid-input, forbidden, unavailable, and internal categories.
- Live API host tests validate privacy/error behavior.

Assessment: no unresolved error-contract ambiguity was found for the internal boundary.

## 22. Security and Privacy Assessment

Strengths:

- Secret-bearing database URL is redacted.
- Host errors do not leak SQL, SQLSTATE, stack, cause, repository names, revision, command context, or database metadata.
- Production API source does not import PostgreSQL libraries.
- Presentation responses do not expose aggregate entities, facts, command context, or revision.

Gaps:

- Provider authentication absent.
- Production authorization absent.
- Least-privilege DB role not defined.
- Artifact/content sensitivity and audit retention policy not defined.
- Public rate limiting and abuse controls absent.

Assessment: privacy boundaries are strong in code; production security controls remain release conditions.

## 23. Data, Audit, and Fact Persistence Assessment

Current architecture intentionally does not persist:

- Domain facts.
- Audit records.
- Projections/read models.
- Artifact content.

Technical correctness: this is acceptable for aggregate persistence and current internal capability.

Compliance/audit readiness: production use may require audit persistence, retention/deletion policy, and fact or command audit trails depending on product/security requirements.

Classification: P1 before regulated/public production if audit requirements apply; P2 otherwise.

## 24. Dependency Boundary Assessment

Confirmed architecture:

```text
Domain <- Application <- Infrastructure <- API Host
```

Review results:

- Domain does not depend on Application/Infrastructure/API.
- Application does not depend on Infrastructure/API.
- Infrastructure depends inward on Application/Domain and owns PostgreSQL/Drizzle.
- API host depends on Infrastructure runtime and Presentation contracts.
- Production API source does not import `pg`, Drizzle, PostgreSQL repository, schema, or migration internals.
- Infrastructure does not depend on API.

Assessment: dependency boundaries are release-candidate clean.

## 25. Documentation Assessment

Current A10-A15 documentation is generally consistent after A15.8 final closure.

Resolved:

- Infrastructure README records module-relative migration resolution and A15.8 live validation.
- API README records live internal host validation and remaining public exposure deferrals.
- A15 architecture records completion with release conditions.

Remaining:

- A16 review artifact now becomes the current production-readiness source of truth.
- Future docs should avoid presenting internal readiness as public production readiness.

## 26. Release Tree and Commit Hygiene

Current worktree is very large and dirty with many untracked files.

Observed categories:

- Portfolio Workspace Domain/Application/Infrastructure/API source and tests.
- Architecture documents A10-A16.
- Drizzle migration/schema files.
- Lockfile and workspace tooling changes.
- Infrastructure-memory adapter changes.
- Unrelated or broader bounded-context changes, including resume-intelligence and additional packages.

Recommended release grouping:

1. Portfolio Workspace Domain/Application core and architecture docs.
2. Persistence/infrastructure-memory/infrastructure PostgreSQL changes and lockfile changes.
3. Runtime composition and live validation harnesses.
4. API presentation/internal host changes and A15/A16 docs.
5. Tooling-only changes: `expect-type` override and pnpm lockfile evidence.
6. Unrelated bounded-context changes should be reviewed and committed separately or removed from this release candidate if not intended.

Do not merge as one opaque commit unless the project intentionally wants a large milestone squash.

## 27. Technical Debt Register

| Item | Priority | Classification | Required action |
| --- | --- | --- | --- |
| Node 22 validation | P0/P1 | Required before production release; before merge if engine parity is merge policy | Run full validation under Node 22 |
| CI live PostgreSQL gate | P1 | Required before production release | Add CI job with safe disposable PostgreSQL |
| Corepack/pnpm nested script parity | P1 | Tooling release risk | Ensure CI/developer scripts use pnpm 11.9.0 for nested commands |
| Production authentication | P1 | Public exposure blocker | Implement provider auth before public routes |
| Production authorization policy | P1 | Public exposure blocker | Define and implement ownership/capability checks |
| Durable idempotency | P1 | Public mutation blocker | Design durable idempotency before public mutation |
| Public HTTP/server routes | P1 | Public transport blocker | Design and implement concrete route layer |
| Observability | P1 | Production operations blocker | Add logging/metrics/tracing/readiness endpoint strategy |
| Process shutdown/draining | P1 | Production operations blocker | Add concrete host lifecycle handling |
| Database ops runbook | P1 | Production database blocker | Define migration execution, backup/restore, least privilege, SSL/TLS |
| expect-type override | P2 | Tooling debt | Remove only after clean install no longer reproduces missing file |
| List/search queries | P2 | Product capability | Add only after repository/query architecture is approved |
| Audit/fact persistence | P2/P1 | Product/compliance dependent | Decide audit requirements before regulated production |
| Release tree cleanup | P1 | Merge hygiene | Split or explicitly approve large worktree |

## 28. Production Readiness Scorecard

| Area | Score | Rationale |
| --- | ---: | --- |
| Architecture | 9 | Clean inward dependency direction and coherent boundaries |
| Domain | 9 | Aggregate model, facts, projections, policies are complete for scope |
| Application | 9 | Use cases and query service coordinate without business-rule duplication |
| Persistence | 8 | PostgreSQL adapter and concurrency live validated; ops runbooks deferred |
| Runtime | 8 | Composition/lifecycle/readiness live validated; process host lifecycle deferred |
| Presentation | 8 | Internal handlers and host validated; public routes deferred |
| Live validation | 8 | Repository, runtime, API-host live suites exist and passed manually/locally |
| Security | 5 | Privacy/redaction good; auth/authz/least privilege/rate limits absent |
| Authentication | 3 | Trusted principal boundary exists; provider auth absent |
| Authorization | 4 | Boundary exists and tests pass; production policy absent |
| Idempotency | 3 | Duplicate conflict exists; durable public retry semantics absent |
| Observability | 4 | Correlation/readiness exists; telemetry/logging/metrics absent |
| Operations | 5 | Runtime cleanup exists; server/process/DB ops deferred |
| CI | 2 | No validation workflow/live gate found |
| Tooling | 6 | pnpm pinned; nested/global mismatch and expect-type override remain |
| Documentation | 8 | A10-A16 are detailed; must preserve readiness distinctions |
| Release hygiene | 4 | Worktree is broad and dirty; commit grouping required |

## 29. Go / No-Go Decision Matrix

| Decision | Result | Conditions |
| --- | --- | --- |
| Architecture complete? | GO | Complete for approved internal boundary |
| Release-candidate ready for merge? | GO WITH CONDITIONS | Node 22 parity and release-tree hygiene must be addressed according to merge policy |
| Ready for internal deployment? | GO WITH CONDITIONS | Requires operational deployment configuration, secret provisioning, and Node 22 validation |
| Ready for public read-only exposure? | GO WITH CONDITIONS | Requires auth, authz, public routes, observability, and operational controls |
| Ready for public mutation exposure? | NO-GO | Durable idempotency, production auth/authz, public transport, and operations are missing |
| Ready for full production release? | NO-GO | CI live gate, Node 22 parity, auth/authz, idempotency, observability, DB ops, and release hygiene remain |

## 30. Production Blockers

Blockers before public mutation:

- Durable idempotency.
- Production authentication.
- Production authorization.
- Concrete public transport routes/server.
- Public operational controls.

Blockers before full production release:

- Node 22 validation.
- CI validation and live PostgreSQL gate.
- Database production runbook: migrations, backup/restore, least privilege, SSL/TLS.
- Observability/logging/metrics/tracing.
- Process lifecycle/shutdown/draining.
- Release tree cleanup.

## 31. Release Conditions

The current release candidate may proceed toward production-facing rollout work only with these conditions:

- Validate under Node 22.
- Stabilize pnpm/Corepack execution in CI and developer docs.
- Add CI or explicitly approved manual release gate for live PostgreSQL suites.
- Keep public mutation blocked until durable idempotency and production auth/authz exist.
- Keep public routes blocked until concrete transport architecture is approved.
- Preserve PostgreSQL secrets and error privacy boundaries.
- Split or approve the large release tree before merge.

## 32. Recommended Next Slice

Recommended next slice: A16.1 - Node 22 and Toolchain Release Validation.

Reasoning:

- The repository explicitly requires Node `>=22 <23`.
- Current validation is under Node 24.
- Toolchain execution depends on pnpm 11.9.0 and Corepack/PATH behavior.
- Node/tooling parity is prerequisite evidence for any merge, CI gate, or production-facing rollout.

The next after A16.1 should likely be A16.2 - CI Live PostgreSQL Release Gate.

## 33. Final A16 Decision

GO WITH CONDITIONS.

Portfolio Workspace is architecturally complete for the approved internal boundary and ready to proceed to production-facing rollout work. It is not yet production deployable as a public capability, and it is not public mutation ready.
