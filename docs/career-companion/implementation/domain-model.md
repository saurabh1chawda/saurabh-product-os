# Career Companion Domain Model

## 1. Executive Summary

This domain model translates the approved Career Companion architecture into implementation-ready domain aggregates, entities, value objects, relationships, invariants, lifecycle models, domain events, and transaction boundaries.

The model follows the authority and persistence decisions from:

- [Architecture Blueprint v1.0](../architecture/architecture-blueprint-v1.md)
- [Implementation Roadmap](implementation-roadmap.md)
- [ADR-001: Persistence Model & Repository Strategy](../adr/ADR-001-persistence-model-and-repository-strategy.md)
- [ADR-002: Runtime Execution Strategy](../adr/ADR-002-runtime-execution-strategy.md)
- [ADR-003: Workflow Coordination Strategy](../adr/ADR-003-workflow-coordination-strategy.md)
- [ADR-004: Information Storage Strategy](../adr/ADR-004-information-storage-strategy.md)
- [ADR-007: Authoritative Transactional Store Technology](../adr/ADR-007-authoritative-transactional-store-technology.md)
- [ADR-008: Immutable Artifact Storage Technology](../adr/ADR-008-immutable-artifact-storage-technology.md)
- [ADR-009: Derived Search & Retrieval Platform](../adr/ADR-009-derived-search-and-retrieval-platform.md)
- [ADR-010: AI Execution Platform & Model Gateway Strategy](../adr/ADR-010-ai-execution-platform-and-model-gateway-strategy.md)

The model is designed to guide repository design, API design, validation, runtime execution, and future implementation. It does not define source code or database tables.

## 2. Domain Overview

Career Companion's core domain is governed workflow execution for career operations. The domain centers on one Workflow Instance executing through explicit states, producing artifacts, referencing evidence, recording approvals, executing capabilities, and preserving audit history.

Primary domain responsibilities:

- Represent one workflow execution.
- Preserve authoritative state and metadata.
- Enforce aggregate ownership.
- Distinguish authoritative records from derived projections.
- Preserve artifact immutability.
- Preserve evidence authority.
- Preserve human approval gates.
- Record AI execution metadata.
- Support deterministic recovery.
- Produce derived search projections without making search authoritative.

Domain authority model:

```text
Workflow Instance
    owns execution state

Artifact
    owns business output metadata

Evidence
    owns decision support authority

Snapshot
    owns point-in-time execution view

Audit Record
    owns consequential history

Policy
    owns governed rule metadata

Capability Registry
    owns capability metadata
```

Aggregates reference one another by ID and version. They do not embed mutable copies of one another.

## 3. Aggregate Catalogue

### Workflow Instance

Purpose:

Represents one execution of one workflow.

Owner:

Workflow Repository.

Owned concepts:

- Workflow Instance ID.
- Workflow Definition ID and version.
- Current state.
- Previous state.
- Current gate.
- Instance status.
- Terminal outcome.
- Current projection metadata.
- Blocking conditions.
- Transition references.
- Artifact references.
- Approval references.
- Capability execution references.
- Snapshot references.
- Audit references.

External references:

- Artifact ID and version.
- Evidence ID and version.
- Approval ID.
- Snapshot ID.
- Audit Record ID.
- Capability Execution ID.
- Policy version.

Authority:

Authoritative for workflow execution state.

### Artifact

Purpose:

Represents versioned business information produced or consumed by workflow execution.

Owner:

Artifact Repository.

Owned concepts:

- Artifact ID.
- Artifact type.
- Artifact version.
- Lifecycle status.
- Approval status.
- Producer capability.
- Storage key.
- Content hash.
- Content size.
- MIME type.
- Evidence references.
- Workflow Instance reference.
- Created timestamp.
- Approved timestamp where applicable.

External references:

- Workflow Instance ID.
- Evidence IDs.
- Capability Execution ID.
- Storage object reference.
- Audit Record ID.

Authority:

Authoritative for artifact metadata. Artifact content authority is established jointly by Artifact metadata and immutable object content.

### Evidence

Purpose:

Represents authoritative support for decisions, claims, recommendations, transitions, approvals, and artifacts.

Owner:

Evidence Repository.

Owned concepts:

- Evidence ID.
- Evidence type.
- Evidence version.
- Evidence chain.
- Source references.
- Validation status.
- Approval status.
- Attribution.
- Authority marker.
- Created timestamp.
- Approved timestamp where applicable.

External references:

- Artifact IDs and versions.
- Approval IDs.
- Capability Execution IDs.
- Snapshot IDs.
- Audit Record IDs.
- External document references.

Authority:

Authoritative for evidence references and decision support.

### Snapshot

Purpose:

Represents an immutable point-in-time view of a Workflow Instance.

Owner:

Snapshot Repository.

Owned concepts:

- Snapshot ID.
- Workflow Instance ID.
- Sequence.
- Workflow state.
- Instance status.
- Current gate.
- Artifact registry references.
- Approval registry references.
- Capability execution registry references.
- Timestamp.
- Trigger.

External references:

- Workflow Instance ID.
- Artifact IDs and versions.
- Approval IDs.
- Capability Execution IDs.
- Audit Record IDs.

Authority:

Authoritative for immutable historical projection references.

### Audit Record

Purpose:

Represents consequential execution history.

Owner:

Audit Repository.

Owned concepts:

- Audit Record ID.
- Actor.
- Timestamp.
- Action.
- Trigger.
- Reason.
- Previous state.
- Next state.
- Affected aggregate references.
- Evidence references.
- Artifact references.
- Approval references.
- Execution references.
- Failure metadata.
- Recovery metadata.

External references:

- Workflow Instance ID.
- Artifact IDs and versions.
- Evidence IDs and versions.
- Approval IDs.
- AI Execution Record ID.
- Capability Execution ID.

Authority:

Authoritative for historical execution facts.

### Policy

Purpose:

Represents governed rule metadata used by workflow, runtime, capabilities, AI execution, privacy, retry, fallback, authorization, and approval decisions.

Owner:

Policy Repository.

Owned concepts:

- Policy ID.
- Policy category.
- Policy version.
- Policy status.
- Scope.
- Owner.
- Effective rule metadata.
- Review metadata.
- Created timestamp.
- Retired timestamp where applicable.

External references:

- Workflow Definition ID.
- Capability ID.
- Prompt ID.
- Model route ID.
- Audit Record ID.

Authority:

Authoritative for policy metadata and lifecycle.

### Capability Registry

Purpose:

Represents registered capability metadata and compatibility.

Owner:

Capability Repository.

Owned concepts:

- Capability ID.
- Capability name.
- Capability version.
- Status.
- Owner.
- Supported workflow states.
- Supported artifact types.
- Input contract reference.
- Output contract reference.
- Maturity level.
- Compatibility metadata.

External references:

- Workflow states.
- Artifact types.
- Policy IDs and versions.
- Prompt IDs and versions.
- Audit Record ID.

Authority:

Authoritative for capability metadata and lifecycle.

### AI Execution Record

Purpose:

Represents immutable metadata for one AI execution through the approved AI Execution Platform.

Owner:

AI execution metadata is persisted through the appropriate repository boundary defined by implementation. It must remain a first-class domain record and must be referenceable by Workflow Instance, Artifact, Evidence, and Audit.

Owned concepts:

- Execution ID.
- Capability ID.
- Workflow Instance ID.
- Provider.
- Model.
- Prompt version.
- Context version.
- Tokens in.
- Tokens out.
- Cost.
- Latency.
- Retry count.
- Validation result.
- Timestamp.
- Output schema version.
- Policy version.
- Error class where applicable.
- Correlation ID.

External references:

- Workflow Instance ID.
- Capability ID and version.
- Prompt ID and version.
- Policy ID and version.
- Artifact ID where produced.
- Audit Record ID.

Authority:

Authoritative for AI execution metadata, not AI output truth.

## 4. Supporting Entities

Supporting entities live inside aggregate boundaries and do not have independent repository ownership unless a future ADR changes that.

### Workflow Transition

Belongs to:

Workflow Instance.

Purpose:

Records movement from one workflow state to another.

Key fields:

- From state.
- To state.
- Trigger.
- Actor.
- Timestamp.
- Preconditions.
- Gate.
- Result.
- Reason.

### Approval Record

Belongs to:

Workflow Instance or approval registry within the Workflow Instance boundary.

Purpose:

Records human approval decisions at workflow gates.

Key fields:

- Approval ID.
- Gate.
- Decision.
- Approver.
- Timestamp.
- Reason.
- Referenced artifact versions.

### Blocking Condition

Belongs to:

Workflow Instance.

Purpose:

Represents why workflow execution cannot proceed.

Key fields:

- Blocking condition ID.
- Category.
- Severity.
- Description.
- Required resolution.
- Created timestamp.
- Resolved timestamp.

### Artifact Version

Belongs to:

Artifact.

Purpose:

Represents a specific immutable or draft version of an artifact.

Key fields:

- Version.
- Lifecycle status.
- Storage key.
- Content hash.
- Producer.
- Created timestamp.
- Approved timestamp.

### Evidence Chain Item

Belongs to:

Evidence.

Purpose:

Represents one link in an evidence chain.

Key fields:

- Source type.
- Source ID.
- Source version.
- Authority level.
- Validation status.

### Capability Execution

Belongs to:

Workflow Instance execution registry.

Purpose:

Records one capability execution attempt.

Key fields:

- Execution ID.
- Capability ID.
- Capability version.
- Input artifact versions.
- Output artifact versions.
- Execution result.
- Started timestamp.
- Completed timestamp.
- Failure reference.

## 5. Value Objects

Value objects are immutable conceptual values compared by value rather than identity.

Core value objects:

- WorkflowInstanceId.
- WorkflowDefinitionId.
- WorkflowState.
- WorkflowGate.
- InstanceStatus.
- TerminalOutcome.
- ArtifactId.
- ArtifactType.
- ArtifactVersion.
- EvidenceId.
- EvidenceType.
- SnapshotId.
- AuditRecordId.
- ApprovalId.
- CapabilityId.
- CapabilityVersion.
- PolicyId.
- PolicyVersion.
- PromptId.
- PromptVersion.
- ModelRoute.
- ProviderId.
- ModelId.
- StorageKey.
- ContentHash.
- CorrelationId.
- ExecutionId.
- ActorRef.
- Timestamp.
- LifecycleStatus.
- ValidationResult.
- MoneyAmount.
- TokenCount.
- Latency.

Rules:

- IDs must be globally unique within their domain boundary.
- Versions must be explicit where records are mutable or supersedable.
- Storage keys must be non-sensitive.
- Content hashes must identify artifact content integrity.
- Validation results must be structured and inspectable.

## 6. Relationships

Relationship model:

```text
Workflow Instance
    references Artifact versions
    references Approval Records
    references Capability Executions
    references Snapshots
    references Audit Records

Artifact
    references Workflow Instance
    references Evidence
    references Storage Object
    references Producer Capability Execution

Evidence
    references Artifacts
    references Approvals
    references Capability Executions
    references Snapshots
    references Audit Records

Snapshot
    references Workflow Instance
    references exact aggregate versions

Audit Record
    references affected aggregates

AI Execution Record
    references Workflow Instance
    references Capability
    references Prompt Version
    references Model Route
```

Relationship rules:

- Aggregates reference other aggregates by ID and version.
- Aggregates do not embed mutable state from other aggregates.
- Cross-aggregate consistency is validated through references.
- Search documents reference aggregates but do not own relationships.
- AI outputs reference execution records but do not become artifacts until validated.

## 7. Aggregate Invariants

### Workflow Instance Invariants

- Exactly one current workflow state.
- Exactly one current projection.
- Every transition is recorded.
- Every transition has a valid previous and next state.
- A required gate cannot be bypassed.
- Workflow state cannot be inferred from conversation.
- Capabilities cannot directly mutate workflow state.
- Runtime Sessions are never durable workflow state.
- Current projection is reproducible from authoritative records.

### Artifact Invariants

- Artifact ID is stable.
- Artifact version is explicit.
- Approved artifact versions are immutable.
- Registered artifact content cannot be overwritten.
- Storage key must be non-sensitive.
- Content hash must match artifact content.
- Artifact metadata is authoritative in PostgreSQL.
- Artifact content is authoritative only with immutable object content and matching metadata.

### Evidence Invariants

- Evidence must be traceable.
- Evidence must reference source records by ID and version.
- Approved evidence is immutable.
- Memory cannot replace evidence.
- Search cannot replace evidence.
- Evidence validation status must be explicit.

### Snapshot Invariants

- Snapshots are immutable.
- Snapshot sequence is ordered.
- Snapshot references exact aggregate versions.
- Snapshots never rewrite history.

### Audit Record Invariants

- Audit records are append-oriented.
- Consequential actions require audit.
- Audit records must include actor, action, timestamp, reason, and affected references where applicable.
- Audit history is not rewritten.

### Policy Invariants

- Policy version is explicit.
- Active policy scope is explicit.
- Superseded policies remain referenceable for historical execution.
- Policy changes do not rewrite historical execution records.

### Capability Registry Invariants

- Capability ID and version are explicit.
- Capability status is explicit.
- Capability state compatibility is explicit.
- Capability cannot execute outside allowed workflow state.

### AI Execution Record Invariants

- Every AI execution creates one AI Execution Record.
- Provider and model are recorded.
- Prompt version is recorded.
- Token counts and cost are recorded where available.
- Validation result is recorded.
- AI output cannot bypass schema validation.
- Capabilities cannot call providers directly.

## 8. Transaction Boundaries

Transaction boundaries follow ADR-001 and ADR-002.

### Workflow Commit Boundary

Coordinates:

- Validated transition.
- Artifact metadata registration where applicable.
- Approval reference where applicable.
- Snapshot creation.
- Audit record creation.

Rules:

- Commit requires valid expected Workflow Instance version.
- Commit must reject stale state.
- Commit must preserve audit.
- Commit must not persist unvalidated capability outputs.

### Artifact Registration Boundary

Coordinates:

- Artifact metadata.
- Artifact version.
- Storage key.
- Content hash.
- Producer capability reference.
- Evidence references where applicable.

Rules:

- Content must be stored before or atomically coordinated with metadata registration.
- Metadata must include content hash.
- Registered content cannot be overwritten.

### AI Execution Boundary

Coordinates:

- Prompt version.
- Model route.
- Provider call through LiteLLM.
- Structured output validation.
- AI Execution Record.
- Capability validation.

Rules:

- AI Execution Record is created for every AI call.
- Schema-invalid output cannot become an artifact.
- Raw LLM response cannot enter workflow.

### Search Projection Boundary

Coordinates:

- Authoritative source read.
- Search document build.
- OpenSearch index write.
- Indexing result.

Rules:

- Search indexing occurs after authoritative commit.
- Search failures do not roll back authoritative commits.
- Search is rebuildable.

## 9. Lifecycle Models

### Workflow Instance Lifecycle

```text
Created
    ↓
Active
    ↓
Waiting | Blocked | Paused
    ↓
Completed
    ↓
Archived
```

Terminal outcomes:

- Accepted.
- Rejected.
- Declined.
- Withdrawn.
- Cancelled.

### Artifact Lifecycle

```text
Draft
    ↓
Validated
    ↓
Approved
    ↓
Superseded
    ↓
Archived
```

### Evidence Lifecycle

```text
Created
    ↓
Validated
    ↓
Approved
    ↓
Immutable
    ↓
Archived
```

### Snapshot Lifecycle

```text
Created
    ↓
Immutable
    ↓
Archived
```

### Audit Record Lifecycle

```text
Appended
    ↓
Retained
    ↓
Archived
```

### Policy Lifecycle

```text
Proposed
    ↓
Active
    ↓
Superseded
    ↓
Retired
```

### Capability Lifecycle

```text
Draft
    ↓
Registered
    ↓
Enabled
    ↓
Deprecated
    ↓
Retired
```

### Prompt Lifecycle

```text
Draft
    ↓
Reviewed
    ↓
Approved
    ↓
Deprecated
    ↓
Retired
```

## 10. Domain Events

Domain events are factual records of meaningful domain occurrences. They do not replace aggregate state or audit records.

Recommended domain events:

- WorkflowInstanceCreated.
- WorkflowStateChanged.
- WorkflowGateEntered.
- WorkflowGateApproved.
- WorkflowGateRejected.
- WorkflowPaused.
- WorkflowBlocked.
- WorkflowCompleted.
- ArtifactDraftCreated.
- ArtifactValidated.
- ArtifactApproved.
- ArtifactSuperseded.
- EvidenceCreated.
- EvidenceValidated.
- EvidenceApproved.
- SnapshotCreated.
- AuditRecordAppended.
- PolicyActivated.
- PolicySuperseded.
- CapabilityRegistered.
- CapabilityEnabled.
- CapabilityDeprecated.
- AIExecutionRequested.
- AIExecutionCompleted.
- AIExecutionFailed.
- SearchProjectionRequested.
- SearchProjectionIndexed.
- SearchProjectionFailed.

Event rules:

- Events must reference aggregate IDs and versions.
- Events must not contain unnecessary sensitive data.
- Events must not be treated as the only source of truth unless a future ADR changes persistence strategy.
- Consequential events must correlate with audit records.

## 11. Future Evolution

Potential future domain model extensions:

- Advisory Memory aggregate.
- Search Projection aggregate or registry.
- Notification aggregate.
- Scheduling aggregate.
- Identity and Authorization domain model.
- Interview-specific workflow aggregates.
- Offer evaluation artifact types.
- Model evaluation records.
- Prompt quality records.
- Cost budget aggregate.

Evolution rules:

- New aggregates require ADR review when they change ownership or persistence boundaries.
- New entities must belong to an aggregate boundary.
- New value objects must preserve immutability.
- New lifecycle states must not bypass workflow gates.
- New domain events must preserve privacy and traceability.
- New AI-related records must preserve ADR-010 provider independence and validation rules.
