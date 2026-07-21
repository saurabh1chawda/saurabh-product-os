# ADR-002: Runtime Execution Strategy

## Status

Accepted

## Date

2026-07-21

## Authors

- Career Companion Architecture

## Decision Category

Runtime

## Context

Career Companion has a frozen architectural baseline that defines Workflow State Machine, Capability Contracts, Artifact Model, Workflow Instance, Orchestrator Architecture, Capability Architecture, Memory & Evidence Architecture, Persistence Architecture, Runtime Architecture, Reference Architecture, Solution Architecture, Component Architecture, Interaction Architecture, Architecture Principles, ADR Framework, and ADR-001 Persistence Model & Repository Strategy.

The Runtime Architecture defines runtime execution semantics without selecting implementation technology. ADR-001 defines how persisted business truth is owned by aggregates and repositories. ADR-002 records the implementation-governing runtime execution strategy that coordinates those architectural pieces during execution.

This decision is necessary because Career Companion must execute work predictably without turning runtime into a state owner, business logic owner, approval authority, or capability planner. Runtime execution must preserve workflow legality, evidence authority, human approval, auditability, persistence boundaries, and recoverability.

## Problem Statement

Career Companion needs a canonical runtime execution strategy that defines how execution occurs inside the platform.

Without a runtime execution strategy, implementation could accidentally allow multi-step hidden execution, long-lived mutable runtime state, direct workflow mutation by capabilities, shared execution context leakage, duplicated transitions, skipped approvals, untraceable failures, or recovery that rewrites history.

The decision needed is: what is the unit of execution, who owns execution coordination, where execution starts and ends, how runtime sessions behave, how transitions are committed, and how failures, recovery, concurrency, and human pauses are handled.

## Decision

Career Companion will use a governed single-capability execution cycle.

Each runtime execution request creates one Runtime Session. The Orchestrator coordinates one governed execution cycle. Each governed execution cycle may execute exactly one resolved capability. The Workflow Instance owns workflow state and transitions. Capabilities transform approved inputs into approved outputs. Repositories persist aggregate-owned business truth. Runtime Sessions are ephemeral and disposed after completion, failure, timeout, cancellation, or handoff to a waiting state.

### 1. Execution Philosophy

Execution is the governed act of advancing work through a valid runtime cycle under the current Workflow Instance state, workflow rules, policies, evidence, approvals, artifact versions, and repository boundaries.

Execution is owned by the runtime coordination model:

- Runtime owns the execution envelope.
- Orchestrator owns execution coordination.
- Workflow State Machine owns legal execution rules.
- Workflow Instance owns durable execution state.
- Capabilities own bounded transformation.
- Repositories own persistence.
- Audit records execution history.

Execution is not free-form conversation, autonomous planning, background mutation, or capability chaining. Execution must be explicit, validated, auditable, and recoverable.

### 2. Runtime Session Model

A Runtime Session is the ephemeral envelope for one execution request.

Session lifecycle:

```text
Created
    ↓
Correlated
    ↓
Validated
    ↓
Executing
    ↓
Completed | Failed | Timed Out | Cancelled | Waiting
    ↓
Disposed
```

Creation:

- Created when a governed execution request enters runtime.
- Bound to a Workflow Instance reference, actor, requested action, correlation ID, and execution timestamp.

Correlation:

- Every Runtime Session receives or carries a correlation ID.
- The correlation ID links validation, capability execution, repository coordination, audit records, failure records, and returned projection.

Ownership:

- Runtime owns the Runtime Session.
- Runtime Session does not own workflow state, artifact content, evidence, approvals, snapshots, or durable memory.

Timeout:

- Runtime owns timeout handling.
- Timeout produces an explicit execution result and failure record.
- Timeout must not silently continue execution.

Cancellation:

- Cancellation may be requested by an authorized actor, policy, or runtime condition.
- Cancellation records actor or trigger, reason, timestamp, and affected execution.
- Cancellation does not rewrite completed history.

Disposal:

- Runtime Session is disposed after execution reaches a terminal runtime result.
- Durable truth remains in Workflow Instance, artifacts, evidence, approvals, snapshots, audit records, policies, and capability registry records.

### 3. Execution Unit

The execution unit is exactly one capability execution per governed execution cycle.

This means:

- One request creates one Runtime Session.
- One Runtime Session coordinates one governed execution cycle.
- One governed execution cycle may resolve and execute one capability.
- Additional capability work requires a new governed execution cycle.

Reason:

- Preserves explicit workflow state.
- Prevents hidden capability chaining.
- Makes approval boundaries visible.
- Keeps failure diagnosis simple.
- Keeps recovery scoped and deterministic.
- Makes audit records easier to review.
- Prevents one capability result from silently triggering another consequential action.

Read-only validation, policy evaluation, authorization, repository reads, projection refresh, and audit recording may occur within the same cycle because they are supporting interactions, not separate capability executions.

### 4. Execution Boundary

Start:

- Execution starts when runtime accepts a governed request and creates a Runtime Session.

Validation:

- Runtime validates request shape, actor authority, Workflow Instance version, current state, artifact references, evidence requirements, approval status, policy constraints, and capability eligibility before execution.

Commit:

- Commit occurs only after capability output is validated, required approvals are satisfied, artifacts are eligible for registration, transition legality is confirmed, and repository operations preserve aggregate ownership.

Completion:

- Completion occurs when runtime returns an execution result and current projection after successful commit, waiting state, failure, timeout, or cancellation.

Failure:

- Failure occurs when validation, capability execution, policy, approval, timeout, persistence, conflict, or cancellation prevents normal completion.

### 5. State Transition Strategy

Workflow Instance owns transitions.

Runtime does not own transitions. Runtime creates the execution envelope and coordinates execution.

Orchestrator does not own transitions. Orchestrator coordinates transition evaluation and commit.

Capabilities do not own transitions. Capabilities return structured outputs only.

UI does not own transitions. UI captures human intent and approval decisions.

Repositories do not own transitions. Repositories persist transition records for the owning aggregate.

No component may mutate workflow state directly outside the governed transition path.

### 6. Failure Strategy

Capability failure:

- Stop execution.
- Record capability failure, execution ID, capability ID, version, input references, and failure reason.
- Retry only where policy allows.

Validation failure:

- Stop before commit.
- Return validation result and required correction.
- Preserve failure audit where consequential.

Policy failure:

- Stop execution.
- Return policy denial or required human review.
- Do not attempt capability execution or transition commit.

Approval missing:

- Move to or remain in waiting state where workflow allows.
- Request human approval.
- Do not infer approval from conversation, silence, or prior intent.

Timeout:

- Stop runtime execution.
- Record timeout result and correlation context.
- Resume only through governed recovery.

Cancellation:

- Stop execution when authorized and allowed.
- Record cancellation reason, actor or trigger, timestamp, and affected execution.

Persistence failure:

- Stop before returning success.
- Use recovery to determine latest valid persisted state.
- Do not hide partial persistence.

Conflict:

- Reject stale update or conflicting commit.
- Load latest authoritative projection.
- Retry, resume, block, or require human review based on policy and workflow state.

### 7. Recovery Strategy

Recovery is owned by the Runtime and Recovery Coordinator under Orchestrator coordination.

Resume point:

- Recovery resumes from the latest valid Workflow Instance projection and last valid snapshot.
- Recovery uses artifact versions, evidence chains, approval records, capability execution records, and audit records.

Retry:

- Retry is allowed only for recoverable failures.
- Retry must preserve idempotency and expected version checks.
- Retry must not duplicate transitions, snapshots, artifacts, approvals, capability executions, or audit records.

Recovery ownership:

- Runtime detects recovery need.
- Recovery Coordinator determines recovery route.
- Orchestrator coordinates valid recovery execution.
- Workflow Instance remains authoritative.
- Repositories provide persisted records.

History preservation:

- Recovery appends new records.
- Failed attempts remain visible.
- Snapshots and audit records are not rewritten.

Audit behavior:

- Recovery records original failure, recovery action, actor or trigger, reason, affected records, and outcome.

### 8. Concurrency Strategy

Concurrent Runtime Sessions may exist, but only one valid commit may succeed for a given expected Workflow Instance version.

Conflict detection:

- Expected Workflow Instance version mismatch.
- Current state mismatch.
- Current gate mismatch.
- Artifact version mismatch.
- Approval status mismatch.
- Evidence reference mismatch.
- Policy result mismatch.
- Snapshot sequence conflict.

Optimistic concurrency:

- Runtime validates expected versions before commit.
- Repository writes reject stale expected versions.
- Recovery handles rejected commits.

Retry philosophy:

- Retry only when the attempted action remains valid against the latest projection.
- Retry does not weaken validation, policy, evidence, approval, or audit requirements.

Consistency:

- Each aggregate operation must be internally consistent.
- Coordinated commits must preserve cross-aggregate references and exact versions.
- Current projection must be reproducible from authoritative records.

### 9. Human Interaction Strategy

Runtime may pause execution for human interaction when workflow, policy, or evidence requires it.

Approval:

- Runtime stops at approval gates until authorized human approval is recorded.

User input:

- Runtime requests missing information and waits without advancing workflow.

Recruiter response:

- Runtime records waiting state or required next action. It must not infer recruiter response from silence.

Interview feedback:

- Runtime waits for explicit human-entered feedback or outcome before downstream analysis.

Resume behavior:

- Runtime does not treat generated resume content as approved until required human review and approval are recorded.

Human pauses are explicit execution outcomes, not runtime failures.

### 10. Execution Principles

- Execution is governed.
- Runtime Sessions are ephemeral.
- Workflow Instances are durable.
- Orchestrator coordinates.
- Capabilities transform one bounded input set into one bounded output set.
- One governed execution cycle executes at most one capability.
- Workflow Instance owns transitions.
- Runtime does not own workflow state.
- Capabilities do not persist.
- Capabilities do not transition workflow.
- UI does not mutate workflow state.
- Evidence precedes decisions.
- Human approval precedes consequential progression.
- Failures stop safely.
- Recovery appends history.
- Audit is mandatory for consequential execution.
- Concurrency is resolved through expected versions and recovery.
- Current projection is derived from authoritative records.

## Alternatives Considered

### Alternative A: Multi-Capability Execution

This approach would allow one runtime cycle to execute multiple capabilities sequentially.

Decision: Rejected.

Reason: It risks hidden progression, unclear failure boundaries, implicit chaining, harder audit review, and approval ambiguity between capability outputs.

### Alternative B: Long-Running Mutable Runtime

This approach would keep runtime sessions alive as mutable execution state across long pauses.

Decision: Rejected.

Reason: It conflicts with Workflow Instance authority, increases risk of stale state, complicates recovery, and blurs the difference between runtime context and durable execution state.

### Alternative C: Stateful Runtime

This approach would allow runtime to remember workflow state across requests.

Decision: Rejected.

Reason: Conversation or runtime memory must not become execution state. Workflow Instance remains the durable authority.

### Alternative D: Workflow Mutation by Capabilities

This approach would allow capabilities to update workflow state directly after producing outputs.

Decision: Rejected.

Reason: It bypasses Orchestrator coordination, transition validation, approval gates, repository ownership, and audit controls.

### Alternative E: Shared Execution Context

This approach would allow multiple workflow instances or capability executions to share mutable execution context.

Decision: Rejected.

Reason: It weakens isolation, risks privacy leakage, complicates audit, and can make execution non-deterministic.

## Trade-offs

### Advantages

- Clear execution boundaries.
- Easier audit and recovery.
- Stronger approval gate protection.
- Lower risk of hidden workflow progression.
- Better isolation between capability executions.
- Simpler concurrency and idempotency reasoning.
- Better alignment with Workflow Instance authority.

### Disadvantages

- More execution cycles may be required for multi-step work.
- Runtime may feel more deliberate than a free-form assistant.
- Implementation must carefully manage projections and waiting states.

### Operational Impact

Operators and reviewers can inspect each capability execution, approval pause, failure, retry, and transition as a separate governed event.

### Development Impact

Developers must implement capability execution as bounded units and avoid shortcuts that chain capabilities or mutate workflow state directly.

### Testing Impact

Tests must verify one-capability-per-cycle execution, transition ownership, timeout behavior, cancellation behavior, failure handling, waiting states, concurrency conflicts, and recovery paths.

## Consequences

### Positive

- Runtime behavior aligns with the frozen architecture.
- Workflow state remains authoritative.
- Recovery is deterministic.
- Human approval gates remain visible.
- Capability behavior remains bounded and replaceable.
- Auditing is simpler and more trustworthy.

### Negative

- Some workflows require multiple explicit execution cycles.
- Waiting states and human pauses must be modeled carefully.
- Runtime implementation must preserve strict boundaries even when automation could appear convenient.

### Future Implications

Future runtime implementation decisions must preserve Runtime Session ephemerality, one-capability execution cycles, Workflow Instance transition ownership, safe failure behavior, recovery through appended history, and concurrency through expected versions.

## Architecture Principles Impact

This ADR reinforces the Career Companion Architecture Principles:

- Workflow Governance: execution follows explicit workflow state and valid transitions.
- Evidence Authority: evidence must be validated before decisions and commits.
- Human Approval: runtime pauses rather than bypasses required approvals.
- Immutable Artifacts: capability outputs are validated and registered through governed commit.
- Deterministic Recovery: recovery resumes from authoritative projections, snapshots, and audit.
- Single Ownership: Workflow Instance owns transitions; Runtime Session owns only ephemeral execution context.
- Audit: each consequential execution, failure, recovery, and transition is auditable.
- Replaceability: runtime strategy remains technology-neutral and preserves replaceable capabilities.

## Affected Components

- Runtime.
- Runtime Session.
- Orchestrator.
- Workflow Instance.
- Workflow State Machine.
- Capability Resolver.
- Capability Executor.
- Capability Adapter.
- Capability Validator.
- Recovery Coordinator.
- Validation Engine.
- Policy Engine.
- Workflow Repository.
- Artifact Repository.
- Evidence Repository.
- Snapshot Repository.
- Audit Repository.
- UI.
- Application Service.

## Migration Considerations

This ADR defines the baseline runtime strategy before implementation. Future migration considerations may include runtime session versioning, execution result versioning, retry policy evolution, recovery behavior refinement, and projection model evolution.

Migration must preserve Workflow Instance authority, audit history, snapshot history, artifact version integrity, evidence chains, approval records, and idempotency.

## Operational Considerations

Operational checks should verify:

- One capability execution per governed execution cycle.
- Runtime Sessions are not persisted as durable business state.
- Required approvals pause execution.
- Missing input pauses execution rather than causing inference.
- Failures stop safely.
- Recovery appends history.
- Timeouts and cancellations are explicit.
- Concurrent commits reject stale versions.
- Audit records exist for consequential execution.

Operational review should focus on execution traceability, failed execution diagnosis, retry safety, waiting state clarity, and recovery confidence.

## Future Review Criteria

This ADR should be reviewed if:

- Single-capability execution prevents required workflow behavior.
- Human approval pauses become ambiguous or hard to audit.
- Recovery cannot reliably resume from authoritative records.
- Runtime Session ephemerality creates an operational defect.
- Concurrency conflicts cannot be resolved through expected versions and recovery.
- New capability types require a different execution unit.
- Future Architecture Principles alter runtime expectations.

## References

- [Architecture Principles](../architecture-principles.md)
- [ADR Framework](../adr-framework.md)
- [ADR-001: Persistence Model & Repository Strategy](ADR-001-persistence-model-and-repository-strategy.md)
- [Runtime Architecture](../runtime-architecture.md)
- [Workflow State Machine](../workflow-state-machine.md)
- [Workflow Instance](../workflow-instance.md)
- [Orchestrator Architecture](../orchestrator-architecture.md)
- [Capability Architecture](../capability-architecture.md)
- [Capability Contracts](../capability-contracts.md)
- [Persistence Architecture](../persistence-architecture.md)
- [Interaction Architecture](../interaction-architecture.md)
