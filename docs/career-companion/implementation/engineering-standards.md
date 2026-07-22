# Career Companion Engineering Standards

## 1. Executive Summary

This document defines engineering standards for Career Companion implementation. It establishes governance for coding, testing, AI engineering, repositories, APIs, pull requests, architecture compliance, and definition of done.

These standards preserve the approved architecture defined by:

- [Architecture Blueprint v1.0](../architecture/architecture-blueprint-v1.md)
- [Implementation Roadmap](implementation-roadmap.md)
- [Domain Model](domain-model.md)
- [Repository Specification](repository-specification.md)
- [Component Specification](component-specification.md)
- [API Specification](api-specification.md)
- [Project Structure](project-structure.md)
- ADR-001 through ADR-010

Engineering work is acceptable only when it preserves architecture integrity, evidence authority, workflow governance, AI execution boundaries, artifact immutability, repository ownership, and auditability.

## 2. Engineering Principles

- Architecture comes before implementation convenience.
- Workflow governs execution.
- Domain invariants are protected by design and tests.
- Repositories are persistence boundaries, not business services.
- Capabilities never persist directly.
- Capabilities never call LLM providers directly.
- AI execution always goes through the AI Execution Platform.
- Search remains derived.
- Human approval gates cannot be bypassed.
- Consequential actions must be auditable.
- Sensitive data is minimized by default.
- Failures must be explicit and recoverable.
- Tests must verify architecture, not only behavior.

Engineering judgment rule:

If implementation convenience conflicts with Architecture Principles, ADRs, or the blueprint, the architecture wins.

## 3. Coding Standards

Coding standards are language-agnostic and apply to all implementation work.

Required practices:

- Keep modules aligned to the Project Structure.
- Keep functions and modules cohesive.
- Name code using domain language from the Domain Model.
- Prefer explicit contracts over implicit behavior.
- Preserve dependency direction.
- Return structured results and errors.
- Avoid hidden side effects.
- Keep validation close to boundaries.
- Keep business invariants in domain or workflow components, not infrastructure.
- Keep provider-specific logic inside approved adapter boundaries.

Forbidden practices:

- Importing infrastructure into domain.
- Importing repositories into capabilities.
- Calling provider SDKs from capabilities.
- Mutating workflow state outside Workflow Runtime and Orchestrator.
- Treating search results as authoritative.
- Treating memory as evidence.
- Hardcoding prompts inside capability logic.
- Silently swallowing errors.
- Adding cross-layer shared utilities with hidden side effects.

Code review should reject architectural shortcuts even when they appear to work.

## 4. Testing Standards

Testing must cover behavior, contracts, architecture, failure, and recovery.

### Unit Tests

Required for:

- Domain invariants.
- Value objects.
- Validators.
- Capability validators.
- Policy evaluation.
- Response builders.
- Error mapping.

Expectations:

- Fast.
- Deterministic.
- No real infrastructure.
- Clear failure cases.

### Contract Tests

Required for:

- Repository contracts.
- API commands and queries.
- AI Execution Platform.
- Model Gateway boundary.
- Object storage adapter.
- Search adapter.
- Platform service contracts.

Expectations:

- Verify contract inputs and outputs.
- Verify explicit error categories.
- Verify version behavior.
- Verify idempotency where relevant.

### Integration Tests

Required for:

- PostgreSQL repository integration.
- S3-compatible artifact storage behavior.
- OpenSearch projection indexing and rebuild.
- LiteLLM gateway boundary.
- Workflow Runtime with repositories.
- Artifact metadata/content coordination.

Expectations:

- Exercise real or representative infrastructure boundaries.
- Include failure paths.
- Include recovery paths.

### Architecture Tests

Required gates:

- No cyclic dependencies.
- No provider SDK imports inside capabilities.
- No repository imports inside capabilities.
- No infrastructure imports inside domain.
- No direct workflow mutation outside workflow components.
- No search-authority usage.
- No hardcoded prompts.

Architecture violations are design defects.

### End-to-End Tests

Required for:

- First governed vertical slice.
- AI capability execution.
- Structured output validation.
- Artifact candidate creation.
- Human approval gate.
- PostgreSQL commit.
- Audit record.
- Derived search projection.

End-to-end tests must verify that architecture boundaries are preserved.

## 5. AI Engineering Standards

AI engineering must follow ADR-010.

Required practices:

- All AI execution goes through the AI Execution Platform.
- LiteLLM is the provider-facing gateway.
- Capabilities submit AI requests through approved contracts.
- Prompt ID and prompt version are required.
- Prompt templates are governed assets.
- Prompt versions are immutable after approval.
- Model routing is policy-governed.
- Every AI response is schema validated.
- Capability validation follows schema validation.
- AI Execution Record is created for every AI execution.
- Token counts, cost, latency, retry count, and validation result are recorded.
- Provider credentials are never available to capabilities.

Forbidden practices:

- Direct OpenAI, Gemini, Anthropic, OpenRouter, or provider SDK calls from capabilities.
- Hardcoded prompts in business logic.
- Provider-specific business logic.
- Raw LLM responses entering workflow.
- AI output becoming authoritative without validation.
- AI output creating artifacts without capability validation.
- Silent fallback to a different model without policy.

AI review checklist:

- Is the prompt versioned?
- Is the model route governed?
- Is the output schema explicit?
- Is the output schema validated?
- Is capability validation present?
- Is AI execution observable?
- Is cost tracked?
- Is sensitive data minimized?
- Is human review required where appropriate?

## 6. Repository & Database Standards

Repository work must follow ADR-001, ADR-004, ADR-007, and the Repository Specification.

Required practices:

- One repository per aggregate.
- Repository contracts before repository implementation.
- Expected-version checks for mutable aggregates.
- Idempotency for retryable operations.
- Immutable records reject updates.
- Audit records are append-oriented.
- Artifact metadata is stored separately from artifact content.
- Search indexing occurs after authoritative commit.
- Repository errors are explicit.

Forbidden practices:

- Shared writes across repositories.
- Business logic inside repositories.
- Workflow transition legality inside repositories.
- Direct persistence from capabilities.
- Binary artifact content in PostgreSQL by default.
- Treating PostgreSQL as cache, search, vector store, or analytics store by default.

Database review checklist:

- Is aggregate ownership clear?
- Is expected version handled?
- Is idempotency handled?
- Are immutable records protected?
- Are references exact by ID and version?
- Is recovery possible from persisted records?

## 7. API Standards

API work must follow the API Specification.

Required practices:

- Separate commands and queries.
- Commands include actor context and correlation ID.
- Queries do not mutate state.
- APIs expose use cases, not repositories.
- APIs return projections and references, not mutable aggregate internals.
- Errors are structured.
- Authorization is applied before protected data access.
- Long-running operations return explicit status or execution reference.
- AI conversation routes through AI Execution Platform.
- Search results include authoritative source IDs and versions.

Forbidden practices:

- API handlers directly mutating repositories.
- API handlers calling providers directly.
- Query endpoints causing hidden mutations.
- Exposing provider credentials or provider-specific controls.
- Returning raw AI responses into workflow.
- Treating search results as authoritative.

API review checklist:

- Is this a command or query?
- What validation applies?
- What authorization applies?
- What error categories apply?
- What audit or observability records are required?
- What version references are returned?

## 8. Pull Request Standards

Every pull request should be reviewable against architecture and quality gates.

Required PR content:

- Purpose.
- Scope.
- Affected components.
- Architecture impact.
- ADR references.
- Tests added or updated.
- Security and privacy considerations.
- AI impact where applicable.
- Migration impact where applicable.
- Known limitations.

Required PR checks:

- Unit tests.
- Contract tests where contracts changed.
- Integration tests where infrastructure boundaries changed.
- Architecture dependency checks.
- Type or schema checks where applicable.
- Lint or formatting checks where applicable.
- Privacy and sensitive data review where applicable.

PRs must be rejected when they:

- Bypass approved architecture.
- Skip required validation.
- Add provider calls outside AI Platform.
- Add persistence shortcuts.
- Add search-authority behavior.
- Add unversioned prompts.
- Lack tests for changed behavior.
- Introduce unreviewed architectural decisions.

## 9. Architecture Compliance

Architecture compliance is mandatory.

Compliance checks:

- Conforms to Architecture Blueprint v1.0.
- Conforms to ADR-001 through ADR-010.
- Preserves modular monolith boundaries.
- Preserves dependency direction.
- Preserves repository-per-aggregate.
- Preserves one-capability-per-cycle execution.
- Preserves AI Execution Platform boundary.
- Preserves derived search boundary.
- Preserves artifact immutability.
- Preserves evidence authority.
- Preserves human approval gates.
- Preserves auditability.

Architecture compliance should be enforced through:

- Code review.
- Architecture tests.
- Contract tests.
- ADR review for material changes.
- Release readiness checks.

Material architecture changes require ADR review before implementation.

## 10. Definition of Done

Work is done only when:

- Implementation matches approved architecture.
- Required tests pass.
- Architecture dependency checks pass.
- Errors are structured.
- Observability is present for consequential paths.
- Audit is present for consequential actions.
- Authorization is applied where required.
- Sensitive data is minimized.
- Documentation is updated where behavior or contracts changed.
- ADR review is completed if architecture changed.
- No forbidden dependency is introduced.
- No AI provider bypass is introduced.
- No repository ownership violation is introduced.
- No search authority violation is introduced.

For AI work, done also requires:

- Prompt version is registered.
- Model route is governed.
- Output schema is validated.
- AI Execution Record is created.
- Token and cost metadata are captured.
- Capability validation is present.

For persistence work, done also requires:

- Expected-version behavior is tested.
- Idempotency is tested where relevant.
- Immutability behavior is tested.
- Recovery read path is considered.

## 11. Future Evolution

These standards should evolve through deliberate governance.

Future additions may include:

- Language-specific coding standards.
- Framework-specific style guides.
- Security review checklist.
- AI safety review checklist.
- Prompt engineering standards.
- Migration standards.
- Operational readiness checklist.
- Release checklist.

Evolution rules:

- Standards may become stricter as implementation matures.
- Standards must not weaken approved architecture.
- Material changes to architecture compliance require ADR review.
- Engineering standards should remain practical and enforceable.
