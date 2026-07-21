# Career Companion Workflow Instance

## 1. Purpose

The Workflow Instance is the canonical runtime domain model for one execution of one Career Companion workflow.

A Workflow Definition defines reusable behavior: legal states, allowed transitions, approval gates, capability availability, and invariants.

A Workflow Instance records a specific execution of that definition. For example, `APP-2026-001` represents one opportunity lifecycle for one company and role.

Execution state belongs to the Workflow Instance because:

- Conversation history is not reliable execution state.
- Capabilities are stateless and do not own workflow progression.
- Artifacts carry business information but do not decide current state.
- The Orchestrator loads, evaluates, updates, and persists the instance.
- Auditability requires a durable execution record.

Workflow Instances are authoritative. Every current state, transition, approval, artifact reference, capability execution, blocking condition, and terminal outcome must be derived from the Workflow Instance.

## 2. Design Principles

- Instances are authoritative.
- Instances are auditable.
- Instances are deterministic.
- Instances are immutable through events.
- Instances never infer state from conversation.
- Instances reference artifacts.
- Instances reference approvals.
- Instances reference capability executions.
- Instances are implementation independent.
- Instances own execution state.
- Instances preserve history.
- Instances expose a current projection.
- Instances fail safely when validation cannot prove state.

## 3. Core Concepts

| Concept | Definition |
| --- | --- |
| Workflow Definition | Reusable workflow specification defining legal states, transitions, gates, and invariants. |
| Workflow Instance | One execution of a Workflow Definition for one application or career workflow. |
| Workflow Projection | Current computed view of the instance derived from history, snapshots, and registries. |
| Transition | Immutable record of movement from one workflow state to another. |
| Snapshot | Immutable point-in-time capture of instance state and registries. |
| Execution State | Current state, status, gate, blockers, and terminal outcome for the instance. |
| Terminal Outcome | Final business outcome such as accepted, rejected, declined, withdrawn, or cancelled. |
| Blocking Condition | Condition preventing valid progression. |
| Recovery Event | Event that resolves or routes around a blocking condition without rewriting history. |
| Current Projection | Current operational view used by the Orchestrator to determine valid next actions. |

## 4. Authority Model

Authority flows downward:

```text
Workflow State Machine
  ↓
Workflow Instance
  ↓
Orchestrator
  ↓
Capabilities
  ↓
Artifacts
```

| Layer | Responsibility |
| --- | --- |
| Workflow State Machine | Defines legal execution: states, transitions, gates, invariants, and capability availability. |
| Workflow Instance | Owns execution state for one workflow run and records history, approvals, artifacts, transitions, and current projection. |
| Orchestrator | Loads the instance, reads current state, invokes allowed capabilities, validates results, and persists updates. |
| Capabilities | Perform bounded work allowed by current state and return structured outputs. |
| Artifacts | Carry business information exchanged between capabilities and workflow stages. |

Capabilities do not own execution state. Artifacts do not own execution state. Conversation history is never execution state.

Workflow Instance state references must use the Workflow State Machine catalogue, including active states such as `S1 Opportunity Intake` and `S2 Qualification`, approval gates such as `G1 Gate 1`, closed state `S14 Closed`, and terminal states `T1 Rejected`, `T2 Withdrawn`, `T3 Cancelled`, `T4 Offer Accepted`, and `T5 Offer Declined`.

## 5. Universal Workflow Instance Model

The Workflow Instance model is implementation independent. It is not a database schema, JSON model, class, interface, API resource, or UI object.

Canonical fields:

| Field Group | Field | Purpose |
| --- | --- | --- |
| Identity | Workflow Instance ID | Unique ID for the execution, such as `APP-2026-001`. |
| Identity | Workflow Definition ID | Reusable workflow definition being executed. |
| Identity | Workflow Definition Version | Version of the workflow definition used by the instance. |
| Ownership | Owner | Human owner accountable for the instance. |
| Timestamps | Created Timestamp | Time the instance was created. |
| Timestamps | Updated Timestamp | Time the current projection was last updated. |
| Context | Opportunity Context | Company, role, source, location, and other non-sensitive context references. |
| Execution State | Current State | Exactly one state from the Workflow State Machine. |
| Execution State | Previous State | Prior state before the latest transition. |
| Execution State | Current Gate | Active approval gate if one is waiting. |
| Execution State | Instance Status | Created, active, waiting, blocked, paused, completed, archived, or closed. |
| Execution State | Terminal Outcome | Accepted, rejected, declined, withdrawn, cancelled, or none. |
| Projection | Current Projection | Current operational view derived from history and registries. |
| Blockers | Blocking Conditions | Active blockers preventing valid progression. |
| Relationships | Related Instances | Parent, child, or related workflow instance references. |
| Metadata | Metadata | Implementation-independent operational metadata. |

## 6. Artifact Registry

The Workflow Instance maintains references to artifacts. It does not embed mutable artifacts.

Each artifact registry entry includes:

| Field | Purpose |
| --- | --- |
| Artifact ID | Referenced artifact instance. |
| Artifact Type | Artifact type such as ART-001 Opportunity or ART-005 Resume Draft. |
| Exact Version | Specific artifact version consumed or produced. |
| Approval Status | Current approval state for that version. |
| Lifecycle Status | Created, draft, validated, approved, immutable, superseded, cancelled, failed, or archived. |
| Producer Capability | Capability that produced the artifact, if applicable. |
| Timestamp | Time the artifact reference was registered. |

Registry rules:

- Artifact references must use exact versions.
- Approved artifact versions are immutable.
- Superseded artifacts remain referenced in history.
- No artifact may be consumed downstream without validation.
- No orphan artifact reference is valid.

## 7. Approval Registry

The Workflow Instance tracks approvals separately from artifacts and transitions.

Each approval entry includes:

| Field | Purpose |
| --- | --- |
| Approval ID | Unique approval record ID. |
| Gate | Gate associated with the approval. |
| Decision | Pass, fail, hold, approve, revise, reject, cancel, or other gate-defined decision. |
| Approver | Human approver. |
| Timestamp | Approval decision time. |
| Reason | Decision rationale. |
| Referenced Artifact Versions | Exact artifact versions used as approval evidence. |

Approval rules:

- Consequential transitions require explicit human approval.
- Approval records cannot be modified silently.
- Revised decisions require new approval records.
- Approval records must reference exact artifact versions.

## 8. Capability Execution Registry

The Workflow Instance tracks capability executions.

Each execution entry includes:

| Field | Purpose |
| --- | --- |
| Execution ID | Unique execution record ID. |
| Capability ID | Capability invoked, such as CAP-001 Qualification. |
| Capability Version | Version of the capability contract or implementation used. |
| Input Artifact Versions | Exact artifact versions supplied as input. |
| Output Artifact Versions | Exact artifact versions produced as output. |
| Execution Result | Completed, rejected, failed, or cancelled. |
| Started | Execution start timestamp. |
| Completed | Execution completion timestamp. |
| Failure Reference | Failure record if execution failed. |

Execution rules:

- Capabilities never change workflow state directly.
- Capability outputs must be registered as artifacts before downstream use.
- Failed executions require failure references.
- Duplicate executions must be prevented through idempotency rules.

## 9. Transition Model

Every transition is immutable.

Each transition records:

| Field | Purpose |
| --- | --- |
| From State | State before transition. |
| To State | State after transition. |
| Trigger | Event or decision causing transition. |
| Actor | Human, Orchestrator, or system actor initiating transition. |
| Timestamp | Transition time. |
| Preconditions | Preconditions evaluated before transition. |
| Gate | Approval gate if required. |
| Result | Transition result. |
| Reason | Human-readable transition rationale. |

Transition rules:

- Transitions never mutate history.
- Undefined transitions are invalid.
- Transitions must align with the Workflow State Machine.
- Gate transitions must reference approval records.
- Artifact-dependent transitions must reference exact artifact versions.
- Failed transitions create failure events rather than rewriting prior records.

## 10. Workflow Instance Snapshot

Snapshots are immutable point-in-time captures of a Workflow Instance.

Each snapshot includes:

| Field | Purpose |
| --- | --- |
| Snapshot ID | Unique snapshot identifier. |
| Sequence | Monotonic snapshot sequence. |
| Workflow State | Current state at snapshot time. |
| Instance Status | Instance lifecycle status at snapshot time. |
| Current Gate | Active gate at snapshot time, if any. |
| Artifact Registry | Artifact references at snapshot time. |
| Approval Registry | Approval records at snapshot time. |
| Execution Registry | Capability execution records at snapshot time. |
| Timestamp | Snapshot creation time. |
| Trigger | Event that caused the snapshot. |

Snapshot rules:

- Snapshots are immutable.
- Snapshot sequence is ordered.
- Snapshots do not replace transition history.
- Snapshots support review, recovery, and projection validation.

## 11. Event History and Current Projection

The Workflow Instance preserves immutable event history and exposes a current projection.

```text
Immutable Event History
  ↓
Current Projection
```

Event history includes transitions, approvals, artifact registrations, capability executions, validation results, failures, recoveries, and snapshots.

Current projection is the current operational view of the instance. It includes current state, current status, active gate, active blockers, artifact registry, approval status, terminal outcome, and next valid actions.

Current state is a projection because it is derived from durable records. This does not require event sourcing. Implementations may use any storage approach as long as history remains auditable and the current projection can be validated.

## 12. Instance Lifecycle

Lifecycle:

```text
Created
  ↓
Active
  ↓
Waiting
  ↓
Blocked
  ↓
Paused
  ↓
Completed
  ↓
Archived
```

Instance Status describes operational state.

Terminal Outcome describes final business result.

| Instance Status | Meaning |
| --- | --- |
| Created | Instance exists but workflow has not actively progressed. |
| Active | Instance is executing a valid workflow state. |
| Waiting | Instance is waiting for approval, evidence, or external response. |
| Blocked | Instance cannot progress until a blocking condition is resolved. |
| Paused | Instance is intentionally paused by human or workflow rule. |
| Completed | Workflow reached a terminal result. |
| Archived | Instance is retained for history and no active work remains. |

| Terminal Outcome | Meaning |
| --- | --- |
| Accepted | Offer or final positive outcome accepted by human. |
| Rejected | Explicit employer rejection recorded. |
| Declined | Human declined an offer or opportunity. |
| Withdrawn | Human withdrew application. |
| Cancelled | Workflow cancelled before completion. |
| None | No terminal outcome yet. |

## 13. Versioning and Concurrency

The Workflow Instance maintains version concepts without requiring a specific implementation.

| Concept | Definition |
| --- | --- |
| Instance Version | Monotonic version of the Workflow Instance projection. |
| Optimistic Concurrency | Updates are valid only if the caller used the expected current version. |
| Expected Version | Version the caller believes is current before update. |
| Current Version | Actual latest instance version. |
| Stale Update | Update based on an older version than the current instance version. |

Concurrency rules:

- Stale updates must be rejected or reconciled explicitly.
- Valid updates create a new instance version.
- Transition history is not rewritten.
- Concurrent changes must not create duplicate transitions, approvals, snapshots, or artifact registrations.

## 14. Idempotency

Repeated operations must not create duplicates.

Idempotency applies to:

- Transitions.
- Snapshots.
- Approvals.
- Capability executions.
- Artifact registrations.
- Failure records.
- Recovery records.

Conceptual rules:

- Each operation has a stable intent.
- Repeating the same intent returns the existing result or records a no-op.
- Retrying after unknown completion must not duplicate history.
- Idempotency does not allow silent mutation.

## 15. Validation Rules

Workflow Instance validation requires:

- Exactly one current state.
- Exactly one current projection.
- Current state exists in the Workflow State Machine.
- Artifacts reference valid versions.
- Approvals reference valid gates.
- Capability executions reference valid capability IDs.
- No orphan artifacts.
- No invalid transitions.
- No duplicate snapshots.
- No duplicate approval records for the same gate decision intent.
- No stale updates.
- No terminal outcome while active states remain open.
- No closed instance with unresolved blockers.
- Current gate aligns with current state.
- Terminal outcome aligns with terminal state.

Invalid instances must enter blocked, failed, paused, or review status rather than silently progressing.

## 16. Invariants

- One current workflow state.
- One current projection.
- Every transition recorded.
- Every approval recorded.
- Every capability execution recorded.
- Every artifact registration references an exact artifact version.
- Approved artifact versions are immutable.
- Capability cannot change state directly.
- Artifact cannot change state directly.
- Conversation cannot determine execution state.
- Snapshots are ordered.
- Audit history is immutable.
- Current projection is reproducible from durable records.
- Terminal outcomes cannot be inferred from silence.
- Human approval is required for consequential transitions.

## 17. Failure and Recovery

Failure types:

| Failure | Meaning | Recovery |
| --- | --- | --- |
| Validation failure | Instance violates validation rules. | Record failure, block progression, resolve with new event. |
| Approval failure | Required approval missing or rejected. | Pause, revise, close, or record rejection. |
| Capability failure | Capability execution failed or was rejected. | Record failure, retry idempotently, revise inputs, or close. |
| Transition conflict | Requested transition is invalid or stale. | Reject transition and retain current projection. |
| Missing artifact | Required artifact reference is absent. | Pause for artifact creation or close workflow. |
| Missing evidence | Artifact or approval lacks required evidence. | Pause, request evidence, or remove unsupported output. |
| Policy violation | Privacy, authority, or governance rule violated. | Stop workflow, record exception, require human review. |

Recovery records new events. History is never rewritten.

## 18. Parent and Related Instances

Workflow Instances may relate to other instances without defining orchestration.

Relationship fields:

| Field | Meaning |
| --- | --- |
| Parent Instance | Instance that originated or governs this instance. |
| Child Instance | Instance created from this instance. |
| Related Instance | Instance linked for context, duplicate detection, or learning. |
| Relationship Type | Parent, child, duplicate, follow-up, related opportunity, related interview, or related offer. |

Relationship rules:

- Relationships are references, not embedded instances.
- Related instances keep independent execution state.
- Relationship changes require audit records.

## 19. Audit Requirements

Every Workflow Instance references:

- Audit Records.
- Snapshots.
- Transition History.
- Validation Results.
- Approval References.
- Exception References.
- Artifact Registrations.
- Capability Execution Records.
- Recovery Events.

Audit requirements:

- No silent state changes.
- No unrecorded capability execution.
- No approval without approver, timestamp, reason, and referenced artifacts.
- No terminal outcome without explicit evidence or human decision.
- No history rewrite.

## 20. Privacy and Access Principles

Workflow Instances contain references rather than duplicated sensitive information.

Principles:

- Least privilege access.
- Private data remains private by default.
- Public-safe reporting uses summaries or redacted references.
- Sensitive artifacts are referenced, not duplicated.
- Retention policy is handled outside this specification.
- Access control is handled outside this specification.
- Privacy classification is visible in instance metadata.

## 21. Extension Rules

Future Workflow Instance extensions require:

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

- No uncontrolled extensions.
- New fields must preserve implementation independence.
- New registries must define ownership, validation, and audit rules.
- Extensions must not bypass the Workflow State Machine.
- Extensions must not give capabilities execution-state ownership.
- Extensions must preserve privacy and traceability.

## 22. Architectural Principles

- Workflow Instance owns execution state.
- Workflow Definition defines legality.
- Workflow State Machine defines legal states and transitions.
- Capabilities transform artifacts.
- Artifacts carry business information.
- Conversation history is never execution state.
- Capabilities do not own execution state.
- Artifacts do not own execution state.
- Orchestrator persists instance updates.
- Implementations evolve.
- The Workflow Instance model remains stable.
- Workflow Instance is not a database schema.
- Workflow Instance is not a JSON model.
- Workflow Instance is not a Python class.
- Workflow Instance is not a TypeScript interface.
- Workflow Instance is not a REST resource.
- Workflow Instance is not an API contract.
- Workflow Instance is not a UI object.
- Workflow Instance is not runtime implementation.
- Workflow Instance is the canonical runtime domain model.
