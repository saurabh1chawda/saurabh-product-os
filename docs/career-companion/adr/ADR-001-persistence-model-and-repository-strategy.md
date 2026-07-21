# ADR-001: Persistence Model & Repository Strategy

## Status

Accepted

## Date

2026-07-21

## Authors

- Career Companion Architecture

## Decision Category

Persistence

## Context

Career Companion has a frozen architectural baseline that defines Workflow State Machine, Capability Contracts, Artifact Model, Workflow Instance, Orchestrator Architecture, Capability Architecture, Memory & Evidence Architecture, Persistence Architecture, Runtime Architecture, Reference Architecture, Solution Architecture, Component Architecture, Interaction Architecture, Architecture Principles, and ADR Framework.

The Persistence Architecture defines persistence semantics but intentionally avoids implementation details. This ADR records the first implementation-governing decision: how Career Companion business state is persisted and how repositories own persistence boundaries.

The persistence model must preserve the relationship between:

- Workflow Instance: the durable execution state for one workflow execution.
- Artifacts: versioned business information produced and consumed by governed execution.
- Evidence: authoritative decision support and traceability.
- Snapshots: immutable point-in-time Workflow Instance views.
- Audit: append-only history of consequential execution facts.
- Recovery: governed continuation after failure, timeout, conflict, cancellation, or interruption.
- Repositories: the only persistence boundary for aggregates.

This ADR defines how business state is persisted. It does not define where business state is persisted.

## Problem Statement

Career Companion needs a persistence model that preserves business truth, supports deterministic recovery, prevents accidental shared writes, protects immutable history, and keeps capabilities from bypassing workflow governance.

Persistence is critical because Workflow Instances, artifacts, evidence, approvals, snapshots, audit records, policies, and capability metadata must remain consistent across execution cycles. If persistence boundaries are unclear, the platform risks state corruption, duplicated records, orphan references, untraceable decisions, weakened evidence authority, and recovery paths that cannot be trusted.

The decision needed is: which business aggregates own persisted state, which repositories persist them, and what consistency, transaction, idempotency, immutability, and recovery rules govern persistence.

## Decision

Career Companion will use an aggregate-owned repository model.

Each canonical aggregate owns its business state and lifecycle. Each repository owns persistence for exactly one aggregate. Repositories are the only persistence boundary. Runtime, Orchestrator, capabilities, platform services, and integrations may coordinate with repositories but may not persist aggregate state directly.

### Business Truth

Business truth is persisted through aggregate roots and repository-owned records. The authoritative state of Career Companion is derived from Workflow Instances, artifacts, evidence, snapshots, audit records, policies, and capability registry records.

Runtime Sessions, execution context, transient projections, temporary validation results, and working buffers are not business truth.

### Durability

Durable records are persisted through aggregate repositories. Durable records must survive execution boundaries, support recovery, and preserve traceability.

Durability applies to:

- Workflow Instance state and transitions.
- Artifact versions and lifecycle status.
- Evidence records and evidence chains.
- Snapshot records.
- Audit records.
- Policy records.
- Capability registry records.

### Aggregate Ownership

Each aggregate has one owner and one repository. No aggregate may share write ownership with another aggregate. Cross-aggregate relationships use references, not embedded mutable copies.

### Repository Ownership

Repositories own persistence mechanics for their aggregate. They do not own workflow legality, capability behavior, approval decisions, evidence interpretation, or runtime execution.

### Transaction Boundaries

A governed commit may coordinate multiple repository operations, but each aggregate remains independently owned. Commit boundaries must preserve reference integrity, version consistency, idempotency, auditability, and recoverability.

### Persistence Responsibilities

Persistence responsibilities include:

- Persisting aggregate state.
- Preserving immutable versions.
- Maintaining aggregate lifecycle status.
- Enforcing aggregate version consistency.
- Preventing duplicate writes through idempotency.
- Returning authoritative records and references.
- Supporting recovery from the latest valid records.

Persistence responsibilities do not include:

- Selecting capabilities.
- Approving gates.
- Creating evidence meaning.
- Advancing workflow state without Orchestrator coordination.
- Rewriting immutable history.

### Consistency Model

Career Companion requires strong consistency within a single aggregate operation and governed consistency across coordinated aggregate operations. Cross-aggregate consistency is maintained through explicit references, version checks, idempotency keys, validation, snapshots, and audit records.

The platform must reject stale updates and preserve the latest authoritative aggregate version.

### Recovery Expectations

Recovery uses the latest valid Workflow Instance projection, immutable snapshots, artifact references, evidence records, and audit history. Recovery appends new records. It never rewrites or hides failed attempts.

### Immutability Expectations

Approved artifact versions are immutable. Evidence is immutable once validated and approved. Snapshots never rewrite history. Audit records are append-only. Corrections require new versions, new evidence references, new recovery records, or new audit entries.

## Aggregate Roots

### Workflow Instance

- Purpose: record execution state for one workflow execution.
- Owner: Workflow Repository.
- Persistence Responsibility: current state, previous state, current gate, instance status, terminal outcome, transitions, related artifact references, approval references, capability execution references, blocking conditions, and current projection metadata.
- Lifecycle: created, active, waiting, blocked, paused, completed, archived.

### Artifact

- Purpose: carry versioned business information produced or consumed by governed execution.
- Owner: Artifact Repository.
- Persistence Responsibility: artifact ID, artifact type, version, lifecycle status, approval status, producer, timestamps, references, and immutable approved versions.
- Lifecycle: draft, validated, approved, superseded, archived.

### Evidence

- Purpose: authorize decisions and provide traceability.
- Owner: Evidence Repository.
- Persistence Responsibility: evidence ID, evidence type, evidence chain, source references, validation status, approval status, attribution, version, and authority markers.
- Lifecycle: created, validated, approved, immutable, archived.

### Snapshot

- Purpose: preserve immutable point-in-time Workflow Instance state.
- Owner: Snapshot Repository.
- Persistence Responsibility: snapshot ID, sequence, workflow state, instance status, current gate, artifact registry references, approval registry references, execution registry references, timestamp, and trigger.
- Lifecycle: created, immutable, archived.

### Audit Record

- Purpose: preserve consequential execution history.
- Owner: Audit Repository.
- Persistence Responsibility: actor, timestamp, action, previous state, next state, reason, trigger, evidence references, artifact references, approval references, execution references, failure records, and recovery records.
- Lifecycle: appended, retained, archived.

### Policy

- Purpose: preserve governed execution constraints.
- Owner: Policy Repository.
- Persistence Responsibility: policy ID, category, version, status, scope, owner, effective rules, lifecycle status, and review metadata.
- Lifecycle: proposed, active, superseded, retired.

### Capability Registry

- Purpose: preserve capability metadata and compatibility.
- Owner: Capability Repository.
- Persistence Responsibility: capability ID, name, version, status, supported workflow states, supported artifact types, compatibility metadata, owner, and lifecycle status.
- Lifecycle: draft, registered, enabled, deprecated, retired.

## Repository Strategy

Career Companion will use one repository per aggregate.

### Workflow Repository

Owns persistence for Workflow Instance.

### Artifact Repository

Owns persistence for Artifact.

### Evidence Repository

Owns persistence for Evidence.

### Snapshot Repository

Owns persistence for Snapshot.

### Audit Repository

Owns persistence for Audit Record.

### Policy Repository

Owns persistence for Policy.

### Capability Repository

Owns persistence for Capability Registry.

Repository rules:

- Each repository owns exactly one aggregate.
- Repositories are the only persistence boundary.
- Capabilities never persist directly.
- Runtime Sessions are never persisted as business truth.
- Orchestrator coordinates persistence but does not own repository state.
- Cross-aggregate references must use exact IDs and versions.
- No shared writes across repositories.
- No repository may redefine workflow, evidence, approval, capability, or artifact semantics.

## Transaction Model

### Commit Boundary

A commit boundary is the governed point where validated changes become authoritative. A commit may coordinate repository operations for artifacts, workflow transitions, snapshots, and audit records, but ownership remains with each aggregate repository.

### Optimistic Concurrency

Persistence uses expected versions to reject stale updates. A write must identify the expected aggregate version. If the current version differs, the write is rejected and recovery determines the next valid action.

### Idempotency

Repeated operations must not duplicate:

- Workflow transitions.
- Artifact registrations.
- Evidence references.
- Snapshots.
- Audit records.
- Capability registry updates.
- Policy updates.

Idempotency must be scoped to the aggregate, operation, actor or execution, and intended result.

### Retry Behaviour

Retries are allowed only for recoverable persistence conflicts or interruptions. Retry behavior must preserve idempotency, version checks, evidence integrity, auditability, and approval requirements.

### Consistency Expectations

Single aggregate writes must be internally consistent. Coordinated commits must preserve cross-aggregate reference integrity. Incomplete commits must be recoverable from the last valid authoritative state.

### Rollback Philosophy

Career Companion does not rely on rewriting history as rollback. Recovery appends corrective records, creates new versions where needed, or blocks execution for human review. Immutable records remain preserved.

### Recovery Guarantees

Recovery must be able to identify:

- Latest valid Workflow Instance projection.
- Last valid snapshot.
- Committed artifact versions.
- Valid evidence chain.
- Approval records.
- Audit trail.
- Failed or interrupted execution record.

## Persistence Principles

- Single aggregate ownership.
- No shared writes.
- Repositories own persistence.
- Runtime Sessions are not persisted as business truth.
- Evidence is immutable after approval.
- Audit is append-only.
- Snapshots never rewrite history.
- Approved artifact versions are immutable.
- Capabilities never persist.
- Workflow owns workflow state.
- Orchestrator coordinates persistence through repositories.
- Cross-aggregate relationships use references.
- Stale updates are rejected.
- Recovery appends history.

## Alternatives Considered

### Alternative A: Generic CRUD Persistence

Generic CRUD persistence would allow broad read and write operations across records without aggregate-specific ownership.

Decision: Rejected.

Reason: It weakens business ownership, increases risk of shared writes, makes workflow state easier to mutate incorrectly, and does not naturally protect immutable evidence, snapshots, and audit history.

### Alternative B: Repository per Aggregate

Repository per Aggregate assigns each canonical aggregate to one repository and one persistence owner.

Decision: Accepted.

Reason: It reinforces single ownership, protects aggregate boundaries, prevents direct capability persistence, supports deterministic recovery, and aligns with Workflow Instance, Artifact, Evidence, Snapshot, Audit, Policy, and Capability Registry ownership.

### Alternative C: Shared Persistence Service

A Shared Persistence Service would provide one centralized persistence boundary for multiple aggregate types.

Decision: Rejected.

Reason: It may simplify access but risks mixing aggregate responsibilities, hiding ownership boundaries, and creating an overly broad persistence authority that can weaken component contracts.

## Trade-offs

### Advantages

- Clear aggregate ownership.
- Stronger workflow governance.
- Reduced risk of accidental shared writes.
- Better recovery traceability.
- Clearer testing boundaries.
- Stronger audit and immutability enforcement.
- Improved replaceability of repository implementations.

### Disadvantages

- More repository contracts to maintain.
- Cross-aggregate commits require careful coordination.
- Developers must understand aggregate ownership before writing persistence logic.
- Reference integrity requires explicit validation.

### Operational Impact

Operational review can trace persistence issues to a specific aggregate and repository. Recovery can use snapshots, audit, and aggregate versions to identify safe continuation points.

### Development Impact

Future implementation must respect repository ownership, expected versions, idempotency, and immutable records. Convenience writes across aggregate boundaries are prohibited.

### Testing Impact

Tests must validate aggregate ownership, repository boundaries, optimistic concurrency, idempotency, immutable records, recovery paths, and cross-aggregate reference integrity.

## Consequences

### Positive

- Persistence semantics align with the frozen architecture.
- Workflow state remains protected.
- Evidence authority remains clear.
- Recovery is more deterministic.
- Capabilities cannot bypass persistence governance.
- Audit and snapshots remain trustworthy.

### Negative

- Initial implementation requires more deliberate repository contracts.
- Coordinated commits are more complex than simple record updates.
- Strict ownership may feel slower during early development.

### Future Implications

Future technology selection must support aggregate ownership, repository boundaries, immutable records, idempotency, version checks, snapshots, audit, and recovery expectations.

## Architecture Principles Impact

This ADR reinforces the Career Companion Architecture Principles:

- Workflow Governance: Workflow Instance persistence remains owned and protected.
- Evidence Authority: Evidence has its own immutable aggregate and repository.
- Human Approval: Approval references remain explicit and cannot be inferred through persistence side effects.
- Immutable Artifacts: approved artifact versions cannot be overwritten.
- Deterministic Recovery: recovery uses snapshots, audit, versions, and authoritative aggregate records.
- Single Ownership: each aggregate has one owning repository.
- Audit: audit records are append-only and owned by the Audit Repository.
- Replaceability: repository implementations can change when aggregate contracts are preserved.

## Affected Components

- Workflow Repository.
- Artifact Repository.
- Evidence Repository.
- Snapshot Repository.
- Audit Repository.
- Policy Repository.
- Capability Repository.
- Workflow Instance.
- Artifact.
- Evidence.
- Snapshot.
- Audit Record.
- Policy.
- Capability Registry.
- Orchestrator.
- Runtime.
- Recovery Coordinator.
- Validation Engine.
- Policy Engine.
- Capability Executor.
- Capability Adapter.

## Migration Considerations

This ADR defines the baseline strategy before implementation. Future migration considerations may include aggregate version evolution, repository contract evolution, artifact version migration, policy version migration, and capability registry lifecycle changes.

Migration must preserve immutable history, audit records, snapshots, evidence chains, approved artifact versions, and Workflow Instance state.

## Operational Considerations

Operational checks should verify:

- No direct capability persistence.
- No shared writes across repositories.
- Stale updates are rejected.
- Audit records are appended for consequential actions.
- Snapshots are created after governed transitions.
- Evidence chains remain valid.
- Approved artifact versions remain immutable.
- Recovery can locate the latest valid projection and snapshot.

Operational monitoring and validation should focus on persistence integrity, repository boundaries, idempotency, and recovery readiness.

## Future Review Criteria

This ADR should be reviewed if:

- A new aggregate is introduced.
- Repository ownership becomes ambiguous.
- Recovery cannot be completed from persisted records.
- Evidence immutability or artifact immutability creates an operational defect.
- Cross-aggregate consistency cannot be preserved through references and version checks.
- Future implementation cannot support required idempotency or optimistic concurrency.
- Capability execution requires a new persistence boundary.
- Architecture Principles are updated in a way that changes persistence expectations.

## References

- [Architecture Principles](../architecture-principles.md)
- [ADR Framework](../adr-framework.md)
- [Persistence Architecture](../persistence-architecture.md)
- [Workflow Instance](../workflow-instance.md)
- [Artifact Model](../artifact-model.md)
- [Memory & Evidence Architecture](../memory-evidence-architecture.md)
- [Runtime Architecture](../runtime-architecture.md)
- [Orchestrator Architecture](../orchestrator-architecture.md)
- [Capability Architecture](../capability-architecture.md)
- [Component Architecture](../component-architecture.md)
- [Interaction Architecture](../interaction-architecture.md)
