# ADR-003: Workflow Coordination Strategy

## Status

Accepted

## Date

2026-07-21

## Authors

- Career Companion Architecture

## Decision Category

Runtime / Coordination

## Context

Career Companion has a frozen architectural baseline and two accepted implementation-governing ADRs. ADR-001 defines the Persistence Model and Repository Strategy. ADR-002 defines the Runtime Execution Strategy, including ephemeral Runtime Sessions and exactly one capability execution per governed execution cycle.

The remaining coordination decision is how execution is coordinated across Runtime, Workflow Instance, Orchestrator, Capabilities, and Repositories without selecting a workflow technology or framework.

Workflow coordination must preserve the authority model:

- Workflow State Machine defines legal execution.
- Workflow Instance owns durable execution state.
- Runtime creates the execution envelope.
- Orchestrator coordinates one governed execution cycle.
- Capabilities transform approved inputs into approved outputs.
- Repositories persist aggregate-owned truth.
- Audit preserves consequential history.

## Problem Statement

Career Companion needs a canonical workflow coordination strategy that defines what the coordination layer owns, what it never owns, how execution pauses, how execution resumes, and how failures are routed.

Without this decision, implementation could drift into stateful coordination, capability-to-capability orchestration, UI-driven workflow, shared mutable execution context, or runtime-memory-based resume behavior. Those patterns would weaken workflow authority, persistence boundaries, evidence traceability, approval gates, and deterministic recovery.

## Decision

Career Companion will use stateless governed workflow coordination.

The coordination layer sequences execution, resolves capability eligibility, coordinates runtime orchestration, handles waiting states, initiates resume and retry, coordinates cancellation and timeout behavior, and preserves correlation. It does not own workflow state, artifacts, evidence, approvals, policies, persistence, business rules, or memory.

Coordination always resumes from the latest governed commit and authoritative Workflow Instance projection, never from runtime memory.

### 1. Coordination Philosophy

Workflow coordination exists to move execution safely through the architecture without owning the architecture.

Coordination provides deterministic sequencing across:

- Runtime Session.
- Workflow Instance.
- Workflow State Machine.
- Orchestrator.
- Capability resolution and execution.
- Repository-owned persistence.
- Waiting and resume behavior.
- Failure and recovery routing.

Coordination is not planning, business decision-making, persistence, approval, evidence interpretation, or artifact authorship.

### 2. Coordinator Responsibilities

The coordination layer owns:

- Execution sequencing.
- Capability resolution initiation.
- Runtime orchestration.
- Waiting state coordination.
- Resume initiation.
- Retry coordination.
- Cancellation coordination.
- Timeout coordination.
- Correlation across execution records.
- Routing failures to recovery.
- Ensuring one capability execution per governed execution cycle.
- Ensuring workflow state is loaded from the Workflow Instance before execution.
- Ensuring commits occur only through repository-owned persistence boundaries.
- Ensuring current projection is returned after completion, waiting, failure, timeout, or cancellation.

### 3. Coordinator Non-Responsibilities

The coordination layer never owns:

- Workflow state.
- Workflow definitions.
- Workflow transition legality.
- Artifacts.
- Evidence.
- Approvals.
- Policies.
- Persistence.
- Business rules.
- Memory.
- Capability behavior.
- Human decision authority.
- Repository state.
- Audit history.

The coordinator may request, validate, route, and sequence these concerns through their owning components. It must not become their owner.

### 4. Coordination Boundary

Coordination operates across architectural boundaries without collapsing them.

Runtime:

- Creates and disposes Runtime Sessions.
- Owns timeout, cancellation intake, and execution envelope behavior.

Workflow Instance:

- Provides durable execution state and current projection.
- Owns transitions and execution status.

Orchestrator:

- Coordinates one governed execution cycle.
- Invokes validators, capability resolution, capability execution, artifact registration, commit, snapshot creation, and projection return.

Capabilities:

- Receive approved inputs.
- Return structured outputs.
- Never coordinate workflow or call one another.

Repositories:

- Persist aggregate-owned truth.
- Reject stale writes.
- Preserve references, versions, snapshots, and audit records.

Coordination is the behavioral stitching among these components, not a new authority over them.

### 5. Waiting Strategy

Execution may pause when required inputs, approvals, responses, feedback, or external dependencies are not available.

Human approval:

- Coordination stops at required gates.
- The Workflow Instance records the waiting state or current gate.
- Resume occurs only after an approval record exists and is valid.

User input:

- Coordination returns a missing-input result.
- No workflow progression occurs until the user supplies required information.

Recruiter response:

- Coordination may record a valid waiting state or next action.
- Silence must not be interpreted as a response, rejection, or stage transition.

Interview feedback:

- Coordination waits for explicit human-entered feedback or outcome.
- Interview debrief and downstream analysis must not proceed from inferred feedback.

External dependency:

- Coordination records the dependency and safe waiting state where workflow allows.
- Resume requires explicit evidence that the dependency is satisfied.

Waiting is an explicit governed result, not hidden runtime continuation.

### 6. Resume Strategy

Resume always starts from the latest governed commit.

Resume rules:

- Load the latest authoritative Workflow Instance projection.
- Load the current state, current gate, artifact references, evidence references, approvals, snapshots, and audit history.
- Revalidate workflow state, policies, evidence, approvals, and expected versions.
- Resume through a new governed execution cycle.
- Do not resume from Runtime Session memory.
- Do not resume from conversation history.
- Do not resume from shared mutable execution context.

Resume must preserve idempotency and must not duplicate transitions, snapshots, artifacts, approvals, capability executions, or audit records.

### 7. Failure Strategy

The coordinator is responsible for routing failures, not redefining them.

Retry initiation:

- Coordinator initiates retry only where retry policy allows and the attempted action remains valid against the latest projection.

Cancellation:

- Coordinator routes cancellation through workflow and policy validation.
- Cancellation records actor or trigger, reason, timestamp, and affected execution.

Timeout:

- Coordinator routes timeout to explicit failure or waiting behavior.
- Timeout does not silently continue execution.

Recovery initiation:

- Coordinator routes recoverable failures to the Recovery Coordinator.
- Recovery resumes only through governed execution.

Conflict routing:

- Coordinator routes stale versions, state conflicts, gate conflicts, artifact version conflicts, and snapshot conflicts to recovery or human review.

Failure routing never rewrites history. It appends audit and recovery records where required.

### 8. Execution Flow

Canonical coordination flow:

```text
Receive Governed Request
    ↓
Create Runtime Session
    ↓
Load Workflow Instance Projection
    ↓
Resolve Current Workflow State
    ↓
Validate Request, Policy, Evidence, Artifacts, Approvals, and Version
    ↓
Resolve Eligible Capability
    ↓
Execute One Capability
    ↓
Validate Capability Output
    ↓
Register Artifacts Where Valid
    ↓
Evaluate Transition
    ↓
Commit Through Repositories
    ↓
Create Snapshot
    ↓
Record Audit
    ↓
Return Updated Projection
```

If waiting, failure, timeout, cancellation, or conflict occurs, coordination stops the normal flow and returns the appropriate governed result.

### 9. Technology Independence

The workflow coordination strategy must be compatible with multiple future workflow implementations. It must not depend on any vendor, framework, runtime platform, infrastructure mechanism, programming language, or workflow engine.

Any future implementation must preserve:

- Stateless coordination.
- Workflow Instance authority.
- One capability execution per governed execution cycle.
- Explicit waiting.
- Resume from latest governed commit.
- Recovery through appended history.
- Repository-owned persistence.
- Human approval gates.
- Evidence authority.
- Auditability.

### 10. Coordination Principles

- Coordination sequences execution.
- Coordination does not own state.
- Coordination is stateless.
- Workflow Instance is authoritative.
- Resume starts from governed commit.
- Waiting is explicit.
- Capabilities do not coordinate one another.
- UI does not drive workflow.
- Runtime memory is not execution state.
- Shared mutable execution context is prohibited.
- Failures route to recovery or human review.
- Recovery appends history.
- Technology must preserve coordination boundaries.

## Alternatives Considered

### Alternative A: Stateful Coordinator

A stateful coordinator would hold workflow progress and resume information internally.

Decision: Rejected.

Reason: It conflicts with Workflow Instance authority, risks stale state, and makes recovery dependent on coordinator memory rather than persisted governed commits.

### Alternative B: Stateless Coordinator

A stateless coordinator loads the latest Workflow Instance projection for each execution cycle and coordinates work without retaining durable execution state.

Decision: Accepted.

Reason: It preserves Workflow Instance authority, supports deterministic recovery, limits hidden state, and remains compatible with multiple future implementations.

### Alternative C: Capability-to-Capability Orchestration

Capabilities would directly invoke other capabilities to complete multi-step work.

Decision: Rejected.

Reason: It bypasses Orchestrator coordination, obscures approval gates, weakens auditability, and violates capability isolation.

### Alternative D: UI-Driven Workflow

The UI would decide workflow progression based on user actions and presentation state.

Decision: Rejected.

Reason: Presentation state is not workflow state. UI-driven workflow risks invalid transitions, skipped validation, and untraceable progression.

### Alternative E: Shared Mutable Execution Context

Multiple sessions or capabilities would share mutable context across execution cycles.

Decision: Rejected.

Reason: It weakens isolation, creates privacy risk, complicates concurrency, and makes execution less deterministic.

## Trade-offs

### Advantages

- Strong Workflow Instance authority.
- Clear responsibility boundaries.
- Deterministic resume behavior.
- Better recovery and audit.
- Reduced risk of hidden workflow progression.
- Technology independence.
- Compatibility with ADR-001 and ADR-002.

### Disadvantages

- More explicit load and validation steps per execution cycle.
- Multi-step work requires multiple governed cycles.
- Waiting and resume behavior must be modeled carefully.

### Operational Impact

Operators can inspect where execution paused, why it paused, what evidence is missing, which approval is required, and from which governed commit resume will occur.

### Development Impact

Implementation must avoid storing durable workflow progress in coordination runtime. Developers must route all state, artifact, evidence, approval, and persistence changes through owning components.

### Testing Impact

Tests must validate stateless coordination, waiting behavior, resume from latest commit, retry routing, cancellation routing, timeout routing, and rejection of capability-to-capability orchestration.

## Consequences

### Positive

- Coordination behavior preserves the frozen architecture.
- Runtime and workflow responsibilities remain distinct.
- Capabilities remain isolated and replaceable.
- Recovery remains deterministic.
- Human pauses remain explicit.

### Negative

- Coordination may require more structured implementation discipline.
- Some user flows may require more visible intermediate states.
- Shared-context convenience patterns are prohibited.

### Future Implications

Future workflow implementation choices must support stateless coordination, explicit waiting, authoritative Workflow Instance projection loading, governed resume, and isolation between capabilities.

## Architecture Principles Impact

This ADR reinforces the Career Companion Architecture Principles:

- Workflow Governance: workflow state and transitions remain controlled by Workflow State Machine and Workflow Instance.
- Evidence Authority: coordination cannot authorize decisions without evidence validation.
- Human Approval: coordinator pauses at required human approval gates.
- Immutable Artifacts: artifacts are registered only through governed commit.
- Deterministic Recovery: resume starts from the latest governed commit.
- Single Ownership: coordination does not absorb state, persistence, evidence, policy, or approval ownership.
- Audit: coordination routes consequential events through audit recording.
- Replaceability: coordination remains technology-neutral and compatible with multiple implementations.

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
- Application Service.
- UI.

## Migration Considerations

This ADR defines baseline coordination before implementation. Future migration considerations may include coordination policy versioning, resume behavior changes, retry behavior changes, waiting state evolution, and capability execution sequencing changes.

Migration must preserve Workflow Instance authority, audit history, waiting records, snapshots, artifact versions, evidence chains, approval records, and idempotency.

## Operational Considerations

Operational checks should verify:

- Coordination remains stateless.
- Resume starts from latest governed commit.
- Waiting states are explicit.
- Human approvals are not inferred.
- Capabilities do not call one another.
- UI does not drive workflow progression.
- Runtime memory is not treated as execution state.
- Failures route to recovery or human review.
- Audit records exist for consequential coordination events.

Operational review should focus on pause clarity, resume correctness, failure routing, and coordination boundary preservation.

## Future Review Criteria

This ADR should be reviewed if:

- Stateless coordination prevents required workflow behavior.
- Waiting states become ambiguous or operationally hard to manage.
- Resume cannot reliably start from the latest governed commit.
- Capability isolation prevents a necessary future capability pattern.
- Coordination responsibilities become ambiguous in implementation.
- A future workflow implementation cannot preserve these coordination boundaries.
- Architecture Principles are updated in a way that changes coordination expectations.

## References

- [Architecture Principles](../architecture-principles.md)
- [ADR Framework](../adr-framework.md)
- [ADR-001: Persistence Model & Repository Strategy](ADR-001-persistence-model-and-repository-strategy.md)
- [ADR-002: Runtime Execution Strategy](ADR-002-runtime-execution-strategy.md)
- [Workflow State Machine](../workflow-state-machine.md)
- [Workflow Instance](../workflow-instance.md)
- [Runtime Architecture](../runtime-architecture.md)
- [Orchestrator Architecture](../orchestrator-architecture.md)
- [Capability Architecture](../capability-architecture.md)
- [Capability Contracts](../capability-contracts.md)
- [Interaction Architecture](../interaction-architecture.md)
- [Component Architecture](../component-architecture.md)
