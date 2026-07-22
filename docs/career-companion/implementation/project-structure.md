# Career Companion Project Structure

## 1. Executive Summary

Career Companion v1 should be implemented as a modular monolith.

The modular monolith approach gives the project strong internal boundaries, explicit dependency direction, fast local development, simpler operational deployment, and lower coordination overhead while preserving a clean path to future extraction if scale or team boundaries require it.

This specification defines the physical organization of the codebase, module boundaries, dependency rules, shared libraries, infrastructure organization, testing strategy, and build boundaries. It aligns with:

- [Architecture Blueprint v1.0](../architecture/architecture-blueprint-v1.md)
- [Implementation Roadmap](implementation-roadmap.md)
- [Domain Model](domain-model.md)
- [Repository Specification](repository-specification.md)
- [Component Specification](component-specification.md)
- [API Specification](api-specification.md)
- ADR-001 through ADR-010

This document does not define source code, CI/CD pipelines, database schema, or deployment topology.

## 2. Repository Layout

Recommended physical structure:

```text
career-companion/
    apps/
        console/
        api/

    packages/
        domain/
        application/
        workflow/
        capabilities/
        ai-platform/
        repositories/
        platform-services/
        infrastructure/
        search/
        artifacts/
        api-contracts/
        validation/
        observability/
        testing/

    config/
        policies/
        prompts/
        capabilities/
        workflows/

    docs/
        architecture/
        adr/
        implementation/

    tests/
        architecture/
        integration/
        contract/
        fixtures/
```

The exact folder names may adapt to the repository's existing build system, but the boundaries must remain intact.

### `apps/console`

Purpose:

User-facing or operator-facing interface.

Responsibilities:

- Render workflow projections.
- Display approval gates.
- Display artifact and evidence references.
- Submit commands through API contracts.
- Query derived and authoritative projections through application APIs.

Forbidden:

- Direct repository access.
- Direct provider access.
- Direct workflow state mutation.
- Direct artifact storage writes.

### `apps/api`

Purpose:

Application API boundary.

Responsibilities:

- Expose architectural API surface.
- Accept commands and queries.
- Apply request validation.
- Invoke application services.
- Return structured responses.

Forbidden:

- Business logic.
- Direct LLM provider calls.
- Direct storage access except through approved application components.

### `packages/domain`

Purpose:

Pure domain model and invariants.

Responsibilities:

- Aggregate definitions.
- Value objects.
- Domain events.
- Lifecycle rules.
- Aggregate invariants.
- Domain validation primitives.

Forbidden:

- Infrastructure imports.
- Repository implementation.
- API transport concepts.
- AI provider concepts.
- Search index concepts.

### `packages/application`

Purpose:

Use-case coordination.

Responsibilities:

- Application services.
- Command coordinators.
- Request validation orchestration.
- Response building.
- Use-case-level authorization and policy invocation.

Forbidden:

- Persistence implementation.
- Provider SDK usage.
- Business invariant ownership.

### `packages/workflow`

Purpose:

Workflow execution and coordination.

Responsibilities:

- Runtime Session.
- Orchestrator.
- Workflow resolver.
- Transition evaluator.
- Gate evaluator.
- Recovery coordinator.
- Projection service.

Forbidden:

- Capability business logic.
- Provider calls.
- Direct infrastructure access except through repository and platform contracts.

### `packages/capabilities`

Purpose:

Business capability implementations.

Responsibilities:

- Qualification capability.
- JD Intelligence capability.
- Resume Strategy capability.
- Resume QA capability.
- Future governed capabilities.

Forbidden:

- Direct repository persistence.
- Direct provider SDK usage.
- Workflow state mutation.
- Calling other capabilities directly.

### `packages/ai-platform`

Purpose:

AI execution boundary.

Responsibilities:

- AI Execution Platform.
- Prompt Registry interface.
- Model router.
- Model gateway.
- Structured output validator.
- AI Execution Record coordination.
- LiteLLM adapter boundary.

Forbidden:

- Business capability logic.
- Workflow orchestration.
- Artifact approval.
- Evidence authority.

### `packages/repositories`

Purpose:

Repository contracts and repository orchestration helpers.

Responsibilities:

- Workflow Repository contract.
- Artifact Repository contract.
- Evidence Repository contract.
- Snapshot Repository contract.
- Audit Repository contract.
- Policy Repository contract.
- Capability Repository contract.
- Configuration Repository contract.
- AI Execution Record Repository contract.

Forbidden:

- Business logic.
- UI logic.
- Provider calls.
- Search ranking.

### `packages/platform-services`

Purpose:

Shared platform services.

Responsibilities:

- Identity.
- Authentication.
- Authorization.
- Policy service.
- Configuration service.
- Secrets service.
- Audit service.
- Scheduling service.
- Notification service.
- Version registry.

Forbidden:

- Business workflow ownership.
- Capability execution.
- Artifact mutation.

### `packages/infrastructure`

Purpose:

Adapters for selected technologies and external boundaries.

Responsibilities:

- PostgreSQL adapter.
- S3-compatible object storage adapter.
- OpenSearch adapter.
- LiteLLM adapter.
- Secrets adapter.
- External integration adapters.

Forbidden:

- Domain decision-making.
- Workflow transition logic.
- Capability business logic.

### `packages/search`

Purpose:

Derived search projection and retrieval.

Responsibilities:

- Search document contracts.
- Projection pipeline.
- Index rebuild.
- Search query composition.
- Source rehydration helpers.

Forbidden:

- Authoritative state.
- Workflow mutation.
- Evidence authority.

### `packages/artifacts`

Purpose:

Artifact content coordination and rendering boundaries.

Responsibilities:

- Artifact content storage coordination.
- Hash verification.
- Document rendering contracts.
- Artifact retrieval references.

Forbidden:

- Artifact approval decisions.
- Workflow transition logic.

### `packages/api-contracts`

Purpose:

Shared command, query, response, and error contracts.

Responsibilities:

- API command contracts.
- API query contracts.
- Response envelopes.
- Error categories.
- Version metadata.

Forbidden:

- Business logic.
- Persistence.
- Runtime execution.

### `packages/validation`

Purpose:

Cross-cutting validation utilities.

Responsibilities:

- Schema validation.
- Architecture invariant checks.
- Capability output validation helpers.
- Artifact metadata validation helpers.

Forbidden:

- Ownership of domain invariants.
- Persistence side effects.

### `packages/observability`

Purpose:

Shared observability contracts.

Responsibilities:

- Correlation ID model.
- Execution telemetry contracts.
- Audit event shapes.
- Metric event shapes.
- Failure category metadata.

Forbidden:

- Business decisions.
- Workflow state.

### `packages/testing`

Purpose:

Reusable testing support.

Responsibilities:

- Test fixtures.
- Architecture compliance helpers.
- Repository contract test helpers.
- Capability test harness utilities.
- AI gateway mock boundaries.

Forbidden:

- Production behavior.

## 3. Layering Rules

Allowed dependency direction:

```text
apps
    ↓
application
    ↓
workflow
    ↓
capabilities
    ↓
ai-platform
    ↓
platform-services
    ↓
repositories
    ↓
infrastructure

domain may be used by application, workflow, capabilities, repositories, and validation.
api-contracts may be used by apps and application.
observability may be used across layers as a shared contract package.
testing may be used only by tests.
```

Layering constraints:

- `domain` must not depend on any other runtime package.
- `application` must not depend on infrastructure adapters.
- `workflow` must not depend on UI or transport concerns.
- `capabilities` must not depend on repositories or infrastructure.
- `capabilities` must call AI only through `ai-platform`.
- `repositories` must not depend on application or workflow.
- `infrastructure` must not depend on application, workflow, or capabilities.
- `search` must depend on authoritative contracts and adapters but must not be authority.
- `testing` must not be imported by production packages.

No cyclic dependencies are allowed.

## 4. Package Responsibilities

Package ownership rules:

- Domain owns business language and invariants.
- Application owns use-case coordination.
- Workflow owns execution legality and orchestration.
- Capabilities own bounded business transformations.
- AI Platform owns provider-facing AI execution.
- Repositories own persistence contracts.
- Infrastructure owns technology adapters.
- Search owns derived retrieval.
- Artifacts owns artifact content coordination.
- Platform Services own shared support concerns.
- API Contracts own API shapes.
- Validation owns reusable validation mechanics.
- Observability owns telemetry contract shapes.
- Testing owns non-production utilities.

Package review checklist:

- Does the package have one clear responsibility?
- Does it depend only on allowed packages?
- Does it expose contracts rather than leaking implementation?
- Does it avoid duplicating another package's concern?
- Does it preserve ADR-001 through ADR-010?

## 5. Shared Libraries

Shared libraries must be small and contract-focused.

Approved shared concerns:

- IDs and reference value objects.
- Version value objects.
- Correlation IDs.
- Result and error envelopes.
- Validation result contracts.
- Observability event contracts.
- Test fixture builders.

Discouraged shared concerns:

- Generic utility bags.
- Cross-layer helpers with hidden side effects.
- Shared persistence shortcuts.
- Shared AI provider wrappers outside `ai-platform`.
- Shared workflow mutation helpers outside `workflow`.

Shared library rules:

- Shared code must not own business behavior.
- Shared code must not introduce hidden dependencies.
- Shared code must be dependency-light.
- Shared code must have clear ownership.

## 6. Infrastructure Organization

Infrastructure is organized by adapter boundary, not by business use case.

Recommended adapter groups:

```text
packages/infrastructure/
    postgres/
    object-storage/
    opensearch/
    litellm/
    secrets/
    clock/
    ids/
```

Infrastructure responsibilities:

- Implement repository storage behavior.
- Implement object storage behavior.
- Implement search platform behavior.
- Implement AI provider gateway calls through LiteLLM.
- Implement secrets retrieval.
- Implement technical boundaries.

Infrastructure rules:

- Infrastructure adapters implement contracts from inner packages.
- Infrastructure must not define domain rules.
- Infrastructure must not mutate workflow directly.
- Infrastructure must not expose provider-specific behavior to capabilities.
- Infrastructure failures must map to canonical error categories.

## 7. Testing Strategy

Testing follows architecture boundaries.

### Unit Tests

Scope:

- Domain invariants.
- Value objects.
- Validators.
- Capability validators.
- Policy evaluation.
- Response builders.

Rules:

- No real infrastructure.
- Fast and deterministic.
- Focus on business rules and contract behavior.

### Contract Tests

Scope:

- Repository contracts.
- AI Execution Platform contract.
- Search adapter contract.
- Object storage adapter contract.
- API command/query contracts.

Rules:

- Verify adapters preserve architectural contracts.
- Verify error mapping.
- Verify versioning behavior.
- Verify idempotency where required.

### Integration Tests

Scope:

- PostgreSQL repository integration.
- Object storage artifact registration.
- OpenSearch projection and rebuild.
- LiteLLM gateway boundary.
- Workflow runtime with repositories.

Rules:

- Exercise real or representative infrastructure boundaries.
- Validate recovery and failure behavior.

### Architecture Tests

Scope:

- Dependency direction.
- No cyclic dependencies.
- No provider SDK imports inside capabilities.
- No repository imports inside capabilities.
- No infrastructure imports inside domain.
- No search authority usage.

Rules:

- Architecture tests are release gates.
- Violations are design defects.

### End-to-End Tests

Scope:

- First governed vertical slice.
- AI capability execution.
- Artifact registration.
- Approval gate.
- Search projection.
- Recovery behavior.

Rules:

- Validate user-observable behavior.
- Validate audit and observability records.
- Validate no architecture bypass.

## 8. Build & Deployment Boundaries

This specification does not define CI/CD pipelines or deployment topology.

Build organization should support:

- Independent package validation.
- Type and contract checking across package boundaries.
- Architecture dependency checks.
- Test selection by package.
- Separate build outputs for apps and packages where supported.

Build boundaries:

- `apps/console` builds user-facing surfaces.
- `apps/api` builds API entry points.
- `packages/domain` builds independently from infrastructure.
- `packages/application` builds without infrastructure dependencies.
- `packages/workflow` builds without UI dependencies.
- `packages/capabilities` builds without provider SDK dependencies.
- `packages/infrastructure` builds technology adapters.

Deployment boundary for v1:

- Modular monolith deployment is preferred.
- Packages remain physically separated in source but deploy together unless future ADR changes deployment architecture.
- Extraction into separate services is deferred until operational need is proven.

## 9. Dependency Governance

Dependency governance enforces architecture.

Required checks:

- No cyclic dependencies.
- No forbidden imports.
- No direct provider SDK usage outside LiteLLM adapter boundary.
- No repository imports inside capability implementations.
- No infrastructure imports inside domain.
- No search imports used as authoritative source.
- No object storage metadata authority outside Artifact Repository.
- No API transport concerns inside domain.

Dependency review triggers:

- New package.
- New infrastructure adapter.
- New capability.
- New platform service.
- New shared library.
- New dependency crossing a layer boundary.

Dependency exception policy:

- Exceptions require architecture review.
- Material exceptions require ADR review.
- Temporary exceptions must include expiration and mitigation.

## 10. Future Evolution

Potential future structural evolution:

- Extract `ai-platform` into a separate deployable unit.
- Extract `search` into a search worker package.
- Add `memory` package after advisory memory ADR.
- Add `analytics` package after analytics ADR.
- Add `notifications` package if scheduling/notification scope grows.
- Add `identity-access` package after identity provider decision.
- Add `evaluation` package for model and prompt evaluation.

Evolution rules:

- Start modular monolith.
- Extract only when operational need is proven.
- Preserve package contracts during extraction.
- Keep domain independent.
- Keep capabilities provider-independent.
- Keep repositories aggregate-owned.
- Keep search derived.
- Keep AI execution gateway centralized.
- Future restructuring requires ADR review when it changes architecture, deployment, ownership, or technology boundaries.
