# Career Companion Persistence Architecture

## 1. Purpose

Persistence Architecture defines what information survives execution, what can be recovered, what remains ephemeral, what is immutable, who owns persistence, and how consistency is maintained.

This document defines persistence semantics, not storage technology.

Persistence Architecture is separate from:

- Storage: physical or logical data storage mechanisms.
- Databases: database products, schemas, indexes, tables, collections, or queries.
- Infrastructure: cloud, deployment, backup, replication, or runtime hosting.
- Repositories: conceptual access boundaries, not implementation classes.
- Caching: temporary performance optimization.
- Runtime: execution environment or framework.

Persistence preserves system truth. Persistence never changes business meaning. Persistence serves architecture; architecture does not serve persistence.

## 2. Design Principles

- Single source of truth.
- Reference over duplication.
- Immutable history.
- Recoverable execution.
- Explicit transaction boundaries.
- Consistency.
- Auditability.
- Privacy.
- Implementation independence.
- Durable business meaning.
- Idempotent persistence operations.
- Version-aware references.
- No persistence-owned business logic.
- No storage-driven architecture.

## 3. Core Concepts

| Concept | Definition |
| --- | --- |
| Persistence | Durable retention of architecture-significant information beyond one execution cycle. |
| Persistent Object | Object that must survive execution and remain available for audit, recovery, or future workflow use. |
| Persistence Boundary | Conceptual ownership boundary for what is persisted together and why. |
| Persistence Unit | Minimal coherent set of records that must be persisted atomically for semantic correctness. |
| Recoverability | Ability to resume, review, or repair workflow execution after interruption or failure. |
| Durability | Requirement that persisted truth survives beyond runtime execution. |
| Projection | Current view derived from persistent records. |
| Snapshot | Immutable point-in-time representation of execution state. |
| Repository | Conceptual boundary for persisting and retrieving one class of architecture object. |
| Recovery Point | Known consistent point from which workflow execution can resume or be reviewed. |

## 4. Persistence Categories

| Category | Definition | Examples |
| --- | --- | --- |
| Persistent | Must survive execution and remain authoritative or auditable. | Workflow Instances, approved artifacts, evidence, approvals, snapshots, audit records. |
| Recoverable | May be regenerated or retried but should be retained long enough for recovery and audit. | Capability executions, execution results, execution metadata, retry records. |
| Ephemeral | Exists only during execution and should not be treated as system truth. | Execution context, adapter state, prompt assembly, working buffers, temporary validation. |

Category rules:

- Persistent information owns durable system truth.
- Recoverable information supports fault tolerance and inspection.
- Ephemeral information must not authorize decisions or workflow progression by itself.

## 5. Persistent Objects

| Persistent Object | Persistence Purpose | Authority |
| --- | --- | --- |
| Workflow Instance | Records execution state, registries, projection, lifecycle, and terminal outcome. | Authoritative execution state. |
| Artifacts | Persist business information and exact versions consumed by capabilities. | Authoritative business information for approved versions. |
| Evidence | Persists authority for claims, decisions, approvals, and transitions. | Authoritative proof. |
| Snapshots | Persist point-in-time workflow projections. | Authoritative historical view. |
| Approval Records | Persist human decisions and referenced artifact versions. | Authoritative approval trail. |
| Audit Records | Persist who did what, when, why, and with which references. | Authoritative audit trail. |
| Capability Metadata | Persists capability IDs, versions, status, compatibility, and supported states/artifacts. | Authoritative capability catalogue. |

Persistent objects must use references and exact versions rather than duplicate mutable business content across boundaries.

## 6. Recoverable Objects

Recoverable objects support retry, recovery, diagnostics, and audit, but they are not always permanent business truth.

| Recoverable Object | Purpose |
| --- | --- |
| Capability Executions | Records one bounded capability invocation. |
| Execution Results | Captures returned result before or during artifact registration. |
| Execution Metadata | Captures duration, correlation, policy result, and validation outcome. |
| Temporary Context | Supports recovery when an execution cycle is interrupted. |
| Retry Records | Prevents duplicate operations and supports idempotency. |

Recoverable objects may become persistent audit records when required by policy, failure handling, or workflow significance.

## 7. Ephemeral Objects

Ephemeral objects exist only inside an execution cycle.

| Ephemeral Object | Purpose |
| --- | --- |
| Execution Context | Provides current bounded execution inputs to the Orchestrator. |
| Adapter State | Supports one capability adapter invocation. |
| Prompt Assembly | Temporary implementation detail if a model-based implementation exists. |
| Runtime Projection | In-memory view used during one execution cycle. |
| Temporary Validation | Intermediate validation result before persistence. |
| Working Buffers | Temporary transformation space. |

Ephemeral objects must not be treated as evidence, approval, artifact, workflow state, or memory unless explicitly persisted through the governed model.

## 8. Persistence Ownership

| Architecture Element | Persistence Ownership |
| --- | --- |
| Workflow Instance | Owns execution state and current projection. |
| Artifacts | Own business information and versioned content. |
| Evidence | Owns authority for claims, decisions, and transitions. |
| Repositories | Persist and retrieve architecture objects inside conceptual boundaries. |
| Orchestrator | Coordinates persistence during execution cycles. |
| Capabilities | Never persist directly. |

Ownership rules:

- Capabilities return outputs; the Orchestrator coordinates persistence.
- Artifacts do not own workflow state.
- Workflow Instances do not duplicate mutable artifact bodies.
- Evidence references must remain stable and version-aware.
- Repositories serve architecture boundaries; they do not define business meaning.

## 9. Transaction Boundaries

Transaction boundaries are conceptual atomic operations required to preserve semantic consistency.

| Transaction Boundary | Atomic Meaning |
| --- | --- |
| Artifact Registration | Artifact reference, exact version, producer, lifecycle status, and audit reference are recorded together. |
| Workflow Transition | From state, to state, trigger, preconditions, gate, result, reason, and audit reference are recorded together. |
| Snapshot Creation | Snapshot sequence, current state, registries, timestamp, and trigger are recorded together. |
| Approval Recording | Approval decision, approver, gate, reason, timestamp, and referenced artifact versions are recorded together. |
| Audit Recording | Actor, action, reason, references, timestamp, and result are recorded together. |

Transaction rules:

- A successful transition must not exist without required approval and audit references.
- A downstream artifact must not reference an unregistered parent artifact.
- A snapshot must not claim a state that was not committed.
- Partial persistence must enter recovery rather than being reported as success.

## 10. Consistency Model

Persistence consistency requires:

- Consistency between Workflow Instance current state and transition history.
- Recovery from partial or interrupted execution.
- Idempotency for repeated requests.
- Replayability or reviewability of execution history.
- Version consistency between artifacts and consumers.
- Reference integrity across Workflow Instances, artifacts, evidence, approvals, snapshots, capability executions, and audit records.

Consistency rules:

- Current projection must match durable records.
- Exact artifact versions must be referenced.
- Approved versions are immutable.
- Stale updates must be rejected or explicitly reconciled.
- Orphan references are invalid.
- Duplicate IDs are invalid.

## 11. Repository Model

Repositories are conceptual persistence boundaries.

| Repository | Responsibility |
| --- | --- |
| Workflow Repository | Persists Workflow Instances, projections, transitions, and lifecycle status. |
| Artifact Repository | Persists artifact records, versions, lifecycle status, and relationships. |
| Evidence Repository | Persists evidence references, validation status, authority, and traceability. |
| Snapshot Repository | Persists immutable Workflow Instance snapshots. |
| Capability Registry Repository | Persists capability metadata, versions, status, compatibility, supported states, and supported artifacts. |
| Audit Repository | Persists audit records, exception records, actor, reason, references, and timestamps. |

Repository rules:

- Repositories are architecture concepts, not database tables or implementation classes.
- Repositories do not change business meaning.
- Repositories must preserve references and versions.
- Repositories must support audit and recovery.

## 12. Recovery Model

Recovery is required after:

- Failure.
- Timeout.
- Partial persistence.
- Interrupted execution.
- Replay or review request.
- Checkpoint restoration.
- Recovery Point selection.

Recovery rules:

- Recovery resumes from a known consistent Recovery Point.
- Recovery never rewrites history.
- Recovery records new events.
- Recovery must validate current Workflow Instance version.
- Recovery must preserve artifact version references.
- Recovery must not duplicate transitions, snapshots, approvals, artifacts, or capability executions.
- Recovery must return the instance to a valid workflow state or terminal state.

Recovery Point examples:

- Last committed transition.
- Last immutable snapshot.
- Last valid approval record.
- Last registered artifact version.
- Last completed capability execution.

## 13. Retention

Retention is conceptual and policy-governed.

| Object Type | Retention Principle |
| --- | --- |
| Business Records | Retained while operationally or historically relevant. |
| Evidence | Retained to preserve claim, decision, and transition authority. |
| Audit | Retained for accountability and review. |
| Snapshots | Retained according to recovery and review needs. |
| Memory | Retained only when scoped, useful, privacy-safe, and governed. |

Retention rules:

- Retention should minimize sensitive information.
- Archived records must preserve auditability where required.
- Deletion governance must account for privacy, audit, and legal constraints.
- Retention policy is not defined by storage technology.

## 14. Privacy

Privacy principles:

- Least privilege.
- Retention minimization.
- Reference-based persistence.
- Sensitive information handled through scoped references.
- Right to deletion where applicable.
- Public-safe reporting through summaries, redaction, or aggregate records.
- Private information must not be duplicated across repositories without need.
- Sensitive artifacts should be referenced, not copied.

Persistence must support privacy by reducing unnecessary copies and making sensitive references explicit.

## 15. Extension Rules

Extensions requiring governance:

- New persistent objects.
- New recoverable objects.
- New repository boundaries.
- Migration of persistent meaning.
- Version evolution.
- New retention classes.
- New recovery semantics.

Extension process:

```text
Proposal
  ↓
Architecture Review
  ↓
Validation
  ↓
Approval
  ↓
Release
```

Extension rules:

- No uncontrolled persistent objects.
- No repository additions without ownership and consistency rules.
- Migrations must preserve business meaning.
- Version evolution must preserve auditability.
- Backward compatibility must be reviewed.

## 16. Architectural Principles

- Workflow governs.
- Workflow Instance records.
- Artifacts persist business information.
- Evidence persists authority.
- Repositories persist architecture.
- Capabilities never own persistence.
- Orchestrator coordinates persistence.
- Persistence preserves system truth.
- Persistence never changes business meaning.
- Persistence serves architecture.
- Architecture does not serve persistence.
- Persistent objects must be version-aware.
- Recoverable objects support safe execution.
- Ephemeral objects are not system truth.
- Persistence Architecture is not database schema.
- Persistence Architecture is not ORM.
- Persistence Architecture is not PostgreSQL.
- Persistence Architecture is not MongoDB.
- Persistence Architecture is not Redis.
- Persistence Architecture is not Kafka.
- Persistence Architecture is not S3.
- Persistence Architecture is not blob storage.
- Persistence Architecture is not event sourcing implementation.
- Persistence Architecture is not SQL.
- Persistence Architecture is not JSON.
- Persistence Architecture is not APIs.
- Persistence Architecture is not code.

