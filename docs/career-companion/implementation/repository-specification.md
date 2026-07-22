# Career Companion Repository Specification

## 1. Executive Summary

This specification defines the repository contracts, responsibilities, transaction boundaries, concurrency rules, query strategy, and persistence principles for Career Companion.

It implements the repository-per-aggregate strategy from [ADR-001: Persistence Model & Repository Strategy](../adr/ADR-001-persistence-model-and-repository-strategy.md), while aligning with [ADR-004: Information Storage Strategy](../adr/ADR-004-information-storage-strategy.md), [ADR-007: Authoritative Transactional Store Technology](../adr/ADR-007-authoritative-transactional-store-technology.md), and the [Domain Model](domain-model.md).

Repositories are persistence boundaries. They are not business logic owners, workflow engines, capability executors, policy engines, validators, or AI gateways.

Repository purpose:

- Persist and retrieve aggregate-owned authoritative records.
- Preserve aggregate ownership.
- Enforce expected-version persistence rules.
- Support idempotency.
- Preserve immutable and append-only records.
- Support recovery from authoritative records.
- Provide repository-level query access without becoming a search platform.

## 2. Repository Principles

- One repository owns one aggregate.
- Repositories are the only persistence boundary for authoritative aggregate state.
- Repositories do not contain business workflow logic.
- Repositories do not evaluate workflow transition legality.
- Repositories do not approve gates.
- Repositories do not interpret evidence authority.
- Repositories do not execute capabilities.
- Repositories do not call LLM providers.
- Repositories do not index derived search projections directly.
- Repositories enforce persistence integrity, not business policy.
- Repositories accept and return aggregate records, references, versions, and persistence results.
- Cross-aggregate relationships use IDs and versions.
- Repositories reject stale expected versions.
- Repositories preserve immutable approved artifacts, evidence, snapshots, and append-oriented audit records.
- Repositories expose deterministic contracts and explicit errors.

Repository dependency rules:

- Application, Workflow, Runtime, Orchestrator, Validation, Recovery, and Platform Services may call repositories through approved contracts.
- Capabilities may not persist directly.
- AI Execution Platform may not persist directly except through approved execution-record repository boundaries.
- Search projection jobs may read authoritative repositories but must not write authoritative state.

## 3. Repository Catalogue

### Workflow Repository

Aggregate:

Workflow Instance.

Responsibilities:

- Persist Workflow Instance state.
- Retrieve current Workflow Instance projection.
- Persist transitions through governed commit.
- Persist instance status changes.
- Persist current gate and blocking condition references.
- Reject stale expected versions.
- Support recovery reads.

Does not own:

- Workflow transition legality.
- Gate approval decisions.
- Capability execution.
- Artifact validation.

Core operations:

- Create Workflow Instance.
- Get Workflow Instance by ID.
- Get current projection by Workflow Instance ID.
- Commit transition with expected version.
- Record waiting, blocked, paused, completed, archived status.
- Register references to artifacts, approvals, capability executions, snapshots, and audit records.

### Artifact Repository

Aggregate:

Artifact.

Responsibilities:

- Persist artifact metadata.
- Persist artifact versions.
- Register storage keys and content hashes.
- Preserve approved artifact version immutability.
- Track artifact lifecycle and approval status.
- Return artifact metadata by ID and version.

Does not own:

- Artifact content bytes.
- Artifact business validation.
- Artifact approval decision.
- Object storage implementation.

Core operations:

- Register artifact draft metadata.
- Register validated artifact version.
- Mark artifact version approved.
- Mark artifact version superseded.
- Retrieve artifact metadata by ID and version.
- Verify artifact version and content hash metadata.

### Evidence Repository

Aggregate:

Evidence.

Responsibilities:

- Persist evidence metadata.
- Persist evidence chains.
- Persist evidence validation and approval status.
- Preserve approved evidence immutability.
- Retrieve evidence by ID and version.

Does not own:

- Evidence interpretation.
- Business decision-making.
- Claim validation logic.
- Memory substitution.

Core operations:

- Create evidence record.
- Validate evidence reference set.
- Mark evidence approved.
- Retrieve evidence chain.
- Retrieve evidence by source reference.

### Snapshot Repository

Aggregate:

Snapshot.

Responsibilities:

- Persist immutable Workflow Instance snapshots.
- Preserve snapshot sequence.
- Retrieve latest snapshot for recovery.
- Retrieve snapshot by ID or sequence.

Does not own:

- Workflow projection creation logic.
- Transition legality.
- Recovery decision-making.

Core operations:

- Create snapshot.
- Get snapshot by ID.
- Get latest snapshot for Workflow Instance.
- List snapshots for Workflow Instance.

### Audit Repository

Aggregate:

Audit Record.

Responsibilities:

- Append consequential audit records.
- Preserve audit history.
- Retrieve audit trail by Workflow Instance or aggregate reference.
- Preserve failure and recovery metadata.

Does not own:

- Business decisions.
- Transition approval.
- Policy evaluation.
- Operational metrics calculation.

Core operations:

- Append audit record.
- Retrieve audit record by ID.
- List audit trail by Workflow Instance.
- List audit records by affected aggregate reference.

### Policy Repository

Aggregate:

Policy.

Responsibilities:

- Persist policy metadata.
- Persist policy versions and lifecycle.
- Retrieve active policy by category and scope.
- Preserve superseded policies for historical execution.

Does not own:

- Policy evaluation result.
- Authorization decisions.
- Workflow logic.

Core operations:

- Register policy.
- Activate policy version.
- Supersede policy version.
- Retire policy.
- Retrieve active policy metadata.
- Retrieve policy by ID and version.

### Capability Repository

Aggregate:

Capability Registry.

Responsibilities:

- Persist capability metadata.
- Persist capability versions and lifecycle status.
- Retrieve enabled capabilities by workflow state and artifact compatibility.
- Preserve deprecated and retired capability metadata.

Does not own:

- Capability execution.
- Capability selection policy.
- Capability validation logic.

Core operations:

- Register capability.
- Enable capability version.
- Deprecate capability version.
- Retire capability version.
- Retrieve capability metadata by ID and version.
- List eligible capability metadata by state and artifact type.

### Configuration Repository

Aggregate:

Configuration metadata.

Responsibilities:

- Persist versioned configuration metadata.
- Retrieve configuration by scope and key.
- Preserve configuration version history.

Does not own:

- Business policy.
- Feature governance.
- Secret values.

Core operations:

- Register configuration value.
- Activate configuration version.
- Supersede configuration version.
- Retrieve active configuration.
- Retrieve configuration by version.

### AI Execution Record Repository

Aggregate:

AI Execution Record.

Responsibilities:

- Persist immutable AI execution metadata.
- Retrieve AI execution records by execution ID.
- Retrieve AI execution records by Workflow Instance.
- Retrieve AI execution records by Capability ID.
- Preserve validation result, token, cost, latency, retry, fallback, provider, model, and prompt metadata.

Does not own:

- AI execution.
- Prompt rendering.
- Model routing.
- Structured output validation.
- Capability validation.
- Raw response storage unless policy explicitly permits.

Core operations:

- Create AI Execution Record.
- Mark execution completed.
- Mark execution failed.
- Retrieve AI Execution Record by ID.
- List AI Execution Records by Workflow Instance.

## 4. Transaction Strategy

Repository transactions must preserve aggregate ownership and governed commit semantics.

### Single-Aggregate Transactions

Used when only one aggregate changes.

Examples:

- Register policy version.
- Enable capability version.
- Append audit record.
- Create snapshot.

Rules:

- Validate expected version where aggregate is mutable.
- Preserve immutable records.
- Return explicit persistence result.

### Governed Multi-Repository Commit

Used when workflow execution produces coordinated state changes across aggregates.

Example:

```text
Validated capability output
    ↓
Artifact metadata registration
    ↓
Workflow transition commit
    ↓
Snapshot creation
    ↓
Audit append
```

Rules:

- Orchestrator coordinates the commit.
- Repositories own their aggregate writes.
- Expected versions are checked before commit.
- Idempotency keys prevent duplicate records.
- Audit must record consequential changes.
- Recovery must identify partial or failed persistence.

### Artifact Registration Transaction

Coordinates artifact metadata with immutable object content reference.

Rules:

- Artifact content must be stored or verified before metadata approval.
- Metadata must include storage key and content hash.
- Approved artifact version cannot be overwritten.
- Corrections require new artifact version.

### AI Execution Transaction

Coordinates AI Execution Record creation with capability execution lifecycle.

Rules:

- AI Execution Record must exist for every AI execution.
- Completion or failure must be recorded.
- Validation result must be recorded.
- AI output cannot become artifact metadata until capability validation passes.

## 5. Concurrency Strategy

Concurrency follows optimistic concurrency with expected versions.

### Expected Version

Mutable aggregate writes must include the expected aggregate version.

If the current version differs:

- Reject the write.
- Return stale update error.
- Do not merge automatically.
- Route to recovery or retry policy.

### Idempotency

Operations that may be retried must include idempotency context.

Idempotency must prevent duplicate:

- Workflow transitions.
- Artifact registrations.
- Evidence records.
- Snapshots.
- Audit records.
- AI Execution Records.
- Policy versions.
- Capability versions.

### Immutable Records

Immutable records reject update attempts.

Immutable records include:

- Approved artifact versions.
- Approved evidence.
- Snapshots.
- Audit records.
- AI Execution Records after completion.

### Append-Oriented Records

Append-oriented records must not be updated to rewrite history.

Audit records are append-oriented.

### Conflict Handling

Repository conflicts must be explicit:

- StaleVersion.
- DuplicateIdempotencyKey.
- ImmutableRecordViolation.
- MissingReference.
- InvalidReferenceVersion.
- PersistenceConflict.

Repositories report conflicts. They do not decide recovery.

## 6. Query Strategy

Repositories support authoritative queries only.

Repository queries are for:

- Loading aggregates by ID.
- Loading exact versions.
- Loading current projection metadata.
- Loading recovery records.
- Loading references for validation.
- Loading audit history.
- Loading registry metadata.

Repositories are not responsible for:

- Full-text search.
- Derived search ranking.
- Analytics.
- Reporting dashboards.
- Semantic retrieval.
- Cache.

Search and retrieval strategy:

- OpenSearch indexes derived projections.
- Search documents reference authoritative IDs and versions.
- Consequential use must rehydrate authoritative records through repositories.

Query rules:

- Query results must include version metadata where relevant.
- Read models must not mutate aggregate state.
- Cross-aggregate reads must preserve ownership boundaries.
- Sensitive data must be minimized.
- Access control must be applied before returning protected records.

## 7. Error Handling

Repositories must return explicit persistence errors.

Canonical error categories:

- NotFound.
- AlreadyExists.
- StaleVersion.
- DuplicateIdempotencyKey.
- ImmutableRecordViolation.
- MissingRequiredReference.
- InvalidReferenceVersion.
- Unauthorized.
- PersistenceUnavailable.
- PersistenceConflict.
- ValidationFailedAtPersistenceBoundary.

Error handling rules:

- Repositories do not swallow errors.
- Repositories do not retry business operations by themselves.
- Transient persistence errors may be retried by runtime policy.
- Stale version errors route to recovery or retry evaluation.
- Immutable record violations are hard failures.
- Unauthorized errors must not reveal sensitive record existence unless policy allows.
- Every consequential persistence failure should be auditable.

## 8. Performance Guidelines

Performance must preserve correctness.

Guidelines:

- Optimize aggregate retrieval by ID and version.
- Keep aggregate boundaries clear before optimizing cross-aggregate reads.
- Use projections for workflow views where appropriate.
- Use OpenSearch for derived text retrieval, not repository queries.
- Avoid loading artifact content through transactional repositories.
- Avoid embedding large documents in PostgreSQL metadata.
- Keep audit append operations efficient.
- Design recovery queries intentionally.
- Track query latency for critical runtime paths.
- Avoid premature denormalization that weakens ownership.

Critical paths:

- Load Workflow Instance projection.
- Validate expected version.
- Commit workflow transition.
- Append audit record.
- Create snapshot.
- Retrieve artifact metadata by exact ID and version.
- Retrieve evidence chain for validation.
- Create AI Execution Record.

## 9. Future Evolution

Potential future repository additions:

- Advisory Memory Repository.
- Search Projection Registry Repository.
- Notification Repository.
- Scheduling Repository.
- Identity Repository.
- Authorization Policy Repository.
- Cost Budget Repository.
- Prompt Registry Repository.

Evolution rules:

- New repositories require aggregate ownership clarity.
- New repositories must not share write ownership with existing repositories.
- New repositories must define transaction boundaries.
- New repositories must define concurrency behavior.
- New repositories must define query scope.
- New repositories require ADR review if they alter persistence strategy, information authority, or storage classification.

Repository implementation may evolve, but repository contracts must preserve ADR-001 through ADR-010.
