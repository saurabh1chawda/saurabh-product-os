# Career Companion Reference Architecture

## 1. Purpose

The Reference Architecture explains how Career Companion's architectural components work together as a complete platform. It integrates the conceptual and logical architecture into a single end-to-end view of execution, information flow, governance, recovery, and extension.

This document explains architecture. It does not redefine architecture, introduce new business concepts, select technologies, or prescribe implementation.

The Reference Architecture is distinct from:

- Product Charter: defines product purpose, scope, principles, and success criteria.
- Runtime Architecture: defines runtime execution semantics and execution boundaries.
- Deployment Architecture: would describe where and how a system is deployed.
- Technology Decisions: would select languages, frameworks, storage systems, or infrastructure.

## 2. Architectural Overview

Career Companion is a governed workflow platform that operates on top of Career OS. Career OS provides operational protocols, decision gates, privacy principles, and governance. Career Companion consumes those protocols through a deterministic architecture made of workflow definitions, workflow instances, orchestrated capability execution, artifacts, evidence, persistence, memory, and audit.

At a high level:

1. A workflow defines legal execution.
2. A Workflow Instance records one execution of that workflow.
3. The Runtime creates a bounded Runtime Session for each execution request.
4. The Orchestrator coordinates the execution cycle.
5. Capabilities transform approved inputs into approved outputs.
6. Artifacts carry business information.
7. Evidence authorizes decisions.
8. Approvals gate consequential progression.
9. Persistence preserves system truth.
10. Snapshots and audit records preserve history.

Career Companion does not replace Career OS. It executes within Career OS boundaries.

## 3. System Context View

**Career OS**  
Career OS is the operational protocol layer. It defines governance, privacy expectations, operating procedures, decision gates, and pilot discipline. Career Companion must conform to Career OS rather than bypass it.

**Career Companion**  
Career Companion is the governed execution platform. It coordinates workflow execution, capability use, artifact production, evidence validation, approval tracking, persistence, and recovery.

**External Actors**  
External actors include the candidate, product owner, reviewer, and authorized assistant. Human actors retain authority over consequential decisions, approvals, external actions, and acceptance of outputs.

**External Services**  
External services may provide source information, communication channels, document export destinations, or future implementation support. They remain outside the architectural core and cannot override workflow, evidence, approval, or privacy requirements.

**Boundaries**  
The core boundary of Career Companion contains Workflow, Workflow Instance, Orchestrator, Capabilities, Artifacts, Evidence, Memory, Persistence, Runtime, Snapshots, Approvals, and Audit. External actors and services interact through governed requests and approved artifacts.

## 4. Logical Architecture View

The logical architecture is organized by responsibility:

**Workflow**  
Defines legal states, allowed transitions, approval gates, and capability availability.

**Workflow Instance**  
Records execution state for one workflow execution. It owns current state, previous state, current gate, artifact references, approval references, capability execution references, transitions, snapshots, and current projection.

**Orchestrator**  
Coordinates one execution cycle. It loads the Workflow Instance, evaluates the current state, resolves allowed capability execution, validates outputs, registers artifacts, coordinates transition commit, creates snapshots, persists results, and returns the updated projection.

**Capabilities**  
Transform approved inputs into approved outputs. Capabilities are stateless, replaceable, versioned, isolated, and governed by contracts. They do not own workflow state and do not transition workflow.

**Repositories**  
Provide conceptual persistence access to Workflow Instances, artifacts, evidence, snapshots, approvals, audit records, and capability metadata. Repositories are infrastructure-facing and do not define business meaning.

**Memory**  
Assists execution through scoped, governed context. Memory may improve execution but cannot authorize decisions, override evidence, or define workflow state.

**Evidence**  
Authorizes decisions. Evidence is authoritative, traceable, versioned, approved, auditable, and preferred over memory.

**Persistence**  
Preserves system truth, immutable history, recoverable execution, snapshots, artifact references, approvals, and audit records.

## 5. Information Architecture View

Career Companion information flows through references rather than uncontrolled duplication.

**Artifacts**  
Artifacts carry business information, such as a job description snapshot, qualification recommendation, resume strategy, resume assembly output, or QA result. Artifacts are versioned and referenced by Workflow Instances.

**Evidence**  
Evidence supports decisions and validates claims. Evidence may include approved artifacts, workflow transitions, approval records, capability executions, audit records, snapshots, or external document references.

**Snapshots**  
Snapshots preserve immutable point-in-time views of the Workflow Instance after successful governed transitions.

**Workflow Instance**  
The Workflow Instance references artifacts, approvals, capability executions, transitions, snapshots, and audit records. It is the authoritative execution record.

**Memory**  
Memory contains scoped context that may assist execution. It is never the source of truth for evidence, approvals, workflow state, or artifacts.

**Audit**  
Audit records preserve execution facts, transition history, actor, reason, evidence references, artifacts created, and approval references.

**Approvals**  
Approvals record human decisions at required gates. They reference exact artifact versions and drive legal progression when the Workflow State Machine allows it.

The information architecture follows this authority order:

```text
Workflow
    ↓
Workflow Instance
    ↓
Evidence
    ↓
Artifacts
    ↓
Approvals
    ↓
Audit
    ↓
Memory
```

## 6. Runtime View

Runtime execution is bounded and deterministic.

**Request**  
An execution request enters the runtime with an intended action, Workflow Instance reference, actor, and correlation context.

**Runtime Session**  
The runtime creates a bounded session for one execution request. The session carries request-local execution context but does not own durable workflow state.

**Execution**  
The Orchestrator loads the Workflow Instance, validates current state and policies, resolves one allowed capability, invokes the capability through an adapter, and validates the result.

**Capability**  
The capability receives approved inputs and produces structured outputs. It cannot call other capabilities, persist directly, approve decisions, or transition workflow.

**Commit**  
The Orchestrator coordinates governed commit only after validation, approval satisfaction, artifact registration, and transition legality checks.

**Projection**  
The current projection is updated from authoritative execution history and returned as the post-execution view.

**Return**  
The runtime returns the execution result, updated projection, produced artifact references, warnings, failures, or required next action.

## 7. Execution Flow

Canonical execution sequence:

```text
Receive Request
    ↓
Create Runtime Session
    ↓
Load Workflow Instance
    ↓
Validate Workflow, Evidence, Artifacts, Approvals, and Policies
    ↓
Resolve Allowed Capability
    ↓
Execute Capability Through Adapter
    ↓
Validate Capability Outputs
    ↓
Register Output Artifacts
    ↓
Commit Legal Transition
    ↓
Create Immutable Snapshot
    ↓
Persist Architectural Truth
    ↓
Return Updated Projection
```

No step may silently advance workflow state. Any rejected gate, missing evidence, invalid artifact, failed validation, timeout, cancellation, or conflict must produce a defined execution result.

## 8. Dependency View

Dependency direction preserves governance and prevents uncontrolled execution.

```text
Workflow
    ↓
Orchestrator
    ↓
Capabilities
    ↓
Adapters
    ↓
Implementations
```

Repositories remain infrastructure-facing and provide persistence access to architectural objects. They do not control workflow, authorize decisions, or define capability behavior.

Dependency rules:

- Workflow defines legal execution.
- Orchestrator coordinates legal execution.
- Capabilities perform bounded transformations.
- Adapters isolate capability implementations.
- Implementations remain replaceable.
- Repositories preserve and retrieve architectural truth.
- No implementation may bypass Workflow, Orchestrator, Evidence, Approval, Persistence, or Audit requirements.

## 9. Governance View

Governance is enforced through the architecture rather than by convention alone.

**Workflow governs**  
Workflow defines legal states, transitions, gates, and capability availability.

**Evidence authorizes**  
Evidence justifies decisions and recommendations. Memory cannot authorize progression.

**Artifacts represent business information**  
Artifacts carry business content and are versioned, referenced, validated, and approved where required.

**Approvals gate progression**  
Human approvals are required at consequential decision points. Approval records reference exact artifacts and decisions.

**Audit preserves history**  
Audit records capture transitions, actor, timestamp, trigger, decision, reason, evidence used, artifacts created, and approval references.

Governance is preserved when every transition is explicit, every decision is traceable, every claim is evidence-backed, and every consequential action requires the appropriate approval.

## 10. Recovery View

Recovery coordinates Runtime, Persistence, Workflow Instance, Snapshots, and Audit.

Recovery begins when execution cannot complete normally because of failure, timeout, cancellation, missing evidence, missing approval, policy violation, persistence conflict, or stale update.

Recovery interaction:

1. Runtime detects a failure or interruption.
2. Orchestrator stops normal execution.
3. Workflow Instance remains authoritative.
4. Persistence provides the latest valid projection, history, snapshots, artifacts, approvals, and audit references.
5. Snapshot records identify the last known governed state.
6. Audit records preserve the failure, reason, actor, and attempted action.
7. Recovery resumes only through a new governed execution cycle.

Recovery never rewrites history. It records new events, preserves failed attempts, and prevents silent state mutation.

## 11. Extension View

Extensions must fit the existing architecture without modifying core principles.

**New capabilities**  
New capabilities require capability contracts, workflow mapping, evidence mapping, approval requirements, validation, registration, and release approval.

**New workflows**  
New workflows must define states, transitions, gates, capability availability, invariants, failure states, and audit requirements.

**New artifact types**  
New artifact types must define purpose, lifecycle, ownership, versioning, evidence role, approval requirements, and validation rules.

**New runtime implementations**  
New runtime implementations must preserve deterministic execution, Runtime Session semantics, Orchestrator coordination, persistence boundaries, isolation, recovery, observability, and governance.

Extensions are acceptable only when they preserve the authority model: Workflow governs, Workflow Instance records, Orchestrator coordinates, Runtime executes, Capabilities transform, Artifacts carry business information, Evidence authorizes, Persistence preserves, Memory assists, and Audit preserves history.

## 12. Architectural Principles

- Career OS remains the operational protocol.
- Career Companion consumes Career OS.
- Reference Architecture explains architecture and does not redefine it.
- Workflow governs legal execution.
- Workflow Instance records execution state.
- Runtime executes architecture.
- Orchestrator coordinates execution.
- Capabilities transform approved inputs into approved outputs.
- Artifacts carry business information.
- Evidence authorizes decisions.
- Memory assists execution but never authorizes decisions.
- Persistence preserves system truth.
- Snapshots preserve point-in-time execution history.
- Approvals gate consequential progression.
- Audit preserves history.
- Repositories are infrastructure-facing.
- Implementations are replaceable.
- No component may bypass workflow, evidence, approvals, persistence, or audit.
