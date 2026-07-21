# Career Companion Orchestrator Architecture

## 1. Purpose

The Orchestrator is the runtime coordination layer for Career Companion. It coordinates one governed execution cycle at a time.

The Orchestrator exists because workflow legality, execution state, capability behavior, artifact data, memory, and model implementation must remain separate concerns.

The Orchestrator is separated from:

- Workflow: the Workflow State Machine defines legal states, transitions, gates, and capability availability.
- Workflow Instance: the Workflow Instance owns execution state.
- Capabilities: capabilities perform bounded work under contract.
- Artifacts: artifacts carry business information.
- Memory: memory is not execution state and must not drive workflow progression.
- LLMs: model choice is an implementation detail and must not change orchestration semantics.

The Orchestrator does not perform business work. It coordinates governed execution, validates boundaries, persists results, and returns the updated projection.

## 2. Design Principles

- Coordinator only.
- Stateless.
- Deterministic.
- Governed.
- Auditable.
- Replaceable.
- Policy-driven.
- Implementation independent.
- Single responsibility.
- No hidden memory.
- No business logic ownership.
- No artifact content ownership.
- No workflow definition ownership.
- No execution state ownership.
- No autonomous capability chaining.

## 3. Core Concepts

| Concept | Definition |
| --- | --- |
| Execution Cycle | One orchestrated request from instance load through returned projection. |
| Execution Context | Bounded context loaded for one execution cycle. |
| Capability Selection | Determination of which capability may run based on workflow state and policy. |
| Validation | Pre- and post-execution checks for legality, evidence, approvals, artifacts, and policies. |
| Execution Result | Structured result returned by a capability and validated by the Orchestrator. |
| Transition Commit | Governed persistence of a legal transition after validation. |
| Projection Update | Update to the Workflow Instance current projection after accepted changes. |
| Snapshot Creation | Immutable point-in-time capture after successful transition. |
| Recovery | Governed execution path that records new events without rewriting history. |

## 4. Responsibilities

Allowed responsibilities:

| Responsibility | Description |
| --- | --- |
| Load Workflow Instance | Retrieve the authoritative execution state for the requested workflow instance. |
| Evaluate Workflow | Read current state, gates, transitions, and capability availability from the Workflow State Machine. |
| Select Capability | Determine the single eligible capability for the requested action. |
| Invoke Capability | Execute the selected capability with approved inputs and policies. |
| Validate Output | Check structure, evidence, artifacts, and policy compliance. |
| Register Artifacts | Register produced artifact references and exact versions. |
| Update Workflow Instance | Persist approved execution records, registries, and projection updates. |
| Commit Transition | Commit legal state transition only after validation and approval. |
| Create Snapshot | Create immutable snapshot after successful transition. |
| Persist | Persist execution records, audit records, artifact references, transitions, and snapshots. |
| Return Projection | Return updated current projection and next valid actions. |

The Orchestrator is not allowed to:

- Perform business work.
- Generate resumes.
- Evaluate qualifications.
- Write recruiter messages.
- Prepare interviews.
- Create artifacts itself.
- Own workflow definitions.
- Own execution state.
- Own artifact content.
- Change workflow state directly outside transition rules.
- Bypass human approval.
- Chain capabilities autonomously.
- Use conversation history as execution state.
- Communicate externally.
- Invent evidence or facts.

## 5. Authority Model

Authority flows downward:

```text
Workflow State Machine
  ↓
Workflow Instance
  ↓
Orchestrator
  ↓
Capability
  ↓
Artifact
  ↓
Audit
```

| Layer | Ownership Boundary |
| --- | --- |
| Workflow State Machine | Owns legal execution definitions: states, transitions, gates, invariants, and capability availability. |
| Workflow Instance | Owns execution state, current projection, registries, transitions, approvals, and snapshots. |
| Orchestrator | Owns coordination of one execution cycle. |
| Capability | Owns bounded transformation or analysis defined by its contract. |
| Artifact | Owns business information and evidence references. |
| Audit | Owns immutable records of what occurred. |

The Orchestrator may update a Workflow Instance only by applying validated records according to workflow legality. It does not decide legality independently.

## 6. Execution Context

The Execution Context is the canonical context for one Orchestrator cycle.

It includes:

| Field | Purpose |
| --- | --- |
| Workflow Instance | Authoritative instance being executed. |
| Current Projection | Current operational view derived from the instance. |
| Current State | Current state from the Workflow State Machine. |
| Current Gate | Active approval gate, if any. |
| Artifact Registry | Artifact references and exact versions available to the instance. |
| Approval Registry | Approval records available to the instance. |
| Capability Registry | Capability contracts and versions available for execution. |
| Execution Policies | Policies governing eligibility, retry, approval, privacy, security, and limits. |
| Correlation ID | Identifier linking logs, audit records, and execution telemetry. |
| Execution Timestamp | Timestamp for the execution cycle. |

The Execution Context must not include conversational state as execution state.

## 7. Execution Lifecycle

One execution cycle:

```text
Load Instance
  ↓
Validate
  ↓
Evaluate State
  ↓
Determine Allowed Capability
  ↓
Execute Capability
  ↓
Validate Output
  ↓
Register Artifact
  ↓
Commit Transition
  ↓
Create Snapshot
  ↓
Persist
  ↓
Return Projection
```

Lifecycle rules:

- Loading must retrieve the current Workflow Instance version.
- Validation occurs before and after capability execution.
- State evaluation uses the Workflow State Machine.
- Capability selection must produce zero or one executable capability.
- Artifact registration precedes transition commit when transition depends on produced artifacts.
- Snapshot creation follows successful transition.
- Returned projection must reflect persisted state.

## 8. Capability Selection

Only workflow determines eligible capabilities.

Capability selection rules:

- Capabilities cannot self-select.
- Capabilities cannot request their own execution.
- Capabilities cannot call each other directly.
- Capabilities cannot chain autonomously.
- Exactly one capability execution is allowed per Orchestrator cycle unless an explicit policy defines a deterministic exception.
- A requested capability must be allowed in the current workflow state.
- A requested capability must satisfy entry criteria in its Capability Contract.
- Read-only capability access must not produce state-changing outputs.

If no capability is valid, the Orchestrator must reject the request and return valid next actions.

## 9. Validation Pipeline

### Validation Before Execution

| Validation | Purpose |
| --- | --- |
| Workflow validity | Confirm current state exists and requested action is legal. |
| Artifact validity | Confirm required artifacts exist, validate, and use exact versions. |
| Approval validity | Confirm required approvals exist and match current gate. |
| Evidence validity | Confirm evidence exists and supports requested capability. |
| Policy validity | Confirm security, privacy, retry, and execution policies allow the request. |
| Concurrency validity | Confirm caller expected version matches current instance version. |
| Capability validity | Confirm capability is allowed and contract-compatible. |

### Validation After Execution

| Validation | Purpose |
| --- | --- |
| Output structure | Confirm result matches expected structured output. |
| Artifact integrity | Confirm produced artifacts conform to Artifact Model requirements. |
| Transition legality | Confirm next state is a legal transition. |
| Invariant preservation | Confirm workflow, instance, artifact, approval, and policy invariants remain true. |
| Audit completeness | Confirm execution can be fully audited. |
| Privacy validation | Confirm outputs do not expose private data improperly. |

Failed validation stops execution and creates a failure record.

## 10. Transition Management

Transitions are committed only after:

1. Pre-execution validation passes.
2. Capability execution completes or required approval is recorded.
3. Output validation passes.
4. Produced artifacts are registered.
5. Approval requirements are satisfied.
6. Transition legality is confirmed.
7. Invariants are preserved.

No direct state mutation is allowed.

Transition commit rules:

- The Orchestrator commits transitions through Workflow Instance records.
- Transition history is immutable.
- Gate transitions must reference approval records.
- Artifact-dependent transitions must reference exact artifact versions.
- Failed transitions produce failure records, not silent state changes.

## 11. Snapshot Creation

The Orchestrator creates a snapshot after every successful transition.

Snapshot rules:

- Snapshots are immutable.
- Snapshots reference exact artifact versions.
- Snapshots include current state, instance status, current gate, artifact registry, approval registry, execution registry, timestamp, and trigger.
- Snapshots do not replace transition history.
- Snapshots support recovery, audit, and projection validation.

No successful transition is complete until the snapshot requirement is satisfied or an explicit recovery path records the persistence failure.

## 12. Error Handling

Failure types:

| Failure | Meaning | Required Behavior |
| --- | --- | --- |
| Capability failure | Capability returns failure or cannot complete. | Record failure, preserve current state, return recovery options. |
| Validation failure | Pre- or post-execution validation fails. | Stop execution, record validation result, return valid next actions. |
| Policy violation | Execution violates privacy, security, approval, or workflow policy. | Stop execution, record exception, require review. |
| Concurrency conflict | Requested update uses stale instance version. | Reject execution attempt and return current projection. |
| Missing evidence | Required evidence is absent or invalid. | Pause or block according to Workflow Instance rules. |
| Approval missing | Required human approval is absent. | Enter or remain in waiting state; do not execute consequential action. |
| Persistence failure | State, artifact, audit, or snapshot cannot be persisted. | Record failure where possible; do not report success. |

Recovery never rewrites history.

## 13. Idempotency

Repeated execution requests must not duplicate:

- Transitions.
- Snapshots.
- Artifacts.
- Capability executions.
- Approvals.
- Failure records.
- Recovery records.

Idempotency rules:

- Each execution request should have a stable intent.
- Retrying the same intent returns the existing result or records a no-op.
- Unknown completion state must be resolved through Workflow Instance history.
- Idempotency never permits silent mutation.

## 14. Concurrency

The Orchestrator supports conceptual optimistic concurrency.

Concurrency rules:

- Execution requests must include the expected current Workflow Instance version.
- The Orchestrator rejects stale execution attempts.
- Successful execution creates a new current version.
- Concurrent requests cannot commit conflicting transitions.
- Concurrent requests cannot duplicate artifacts, approvals, snapshots, or capability executions.
- Conflict resolution must be explicit and auditable.

This specification remains implementation independent and does not define storage mechanics.

## 15. Policies

Execution obeys policies.

Policy categories:

| Policy | Purpose |
| --- | --- |
| Approval policies | Define when human approval is required. |
| Capability eligibility | Define which capabilities may execute in each state. |
| Transition rules | Define legal state movement. |
| Retry policies | Define safe retry behavior. |
| Security policies | Define access and least-privilege constraints. |
| Privacy policies | Define private-data handling. |
| Execution limits | Define bounded execution scope. |

Policies guide orchestration. Policies do not grant authority to bypass workflow, approval, evidence, or audit requirements.

## 16. Observability

The Orchestrator emits execution telemetry.

Telemetry includes:

- Execution IDs.
- Correlation IDs.
- Execution duration.
- Validation results.
- Capability execution.
- Transition results.
- Failure records.
- Policy decisions.
- Snapshot creation.
- Projection version.

This specification does not define telemetry implementation.

## 17. Recovery

Recovery creates new execution records.

Recovery rules:

- Recovery never edits history.
- Recovery never deletes failed records.
- Recovery records cause, actor, timestamp, and result.
- Blocked instances resume only through governed execution.
- Recovery must validate against current Workflow Instance version.
- Recovery must preserve auditability.

Examples:

- Missing evidence supplied after pause.
- Human approval supplied after waiting state.
- Capability retried idempotently after failure.
- Stale update rejected and retried against current projection.

## 18. Security Principles

- Least privilege.
- No hidden state.
- Reference-based data access.
- No unauthorized capability execution.
- Audit before persistence.
- No autonomous external communication.
- No private data expansion beyond required context.
- No capability access outside current state permissions.
- No direct artifact mutation.
- No direct workflow-state mutation.

## 19. Extension Rules

Future orchestration features require:

```text
Architecture Review
  ↓
Validation
  ↓
Approval
  ↓
Backward Compatibility Review
  ↓
Release
```

Extension rules:

- No ad hoc orchestration paths.
- New orchestration behavior must preserve state-machine legality.
- New behavior must preserve Workflow Instance authority.
- New behavior must preserve capability statelessness.
- New behavior must preserve artifact immutability.
- New behavior must preserve auditability.
- New behavior must not create hidden memory.

## 20. Architectural Principles

- Orchestrator coordinates.
- Workflow defines legality.
- Workflow Instance owns execution state.
- Capabilities transform artifacts.
- Artifacts carry business information.
- Policies constrain execution.
- Snapshots preserve history.
- Implementations evolve.
- Architecture remains stable.
- Orchestrator is not an AI agent.
- Orchestrator is not a planner.
- Orchestrator is not a memory system.
- Orchestrator is not a workflow definition.
- Orchestrator is not a business logic engine.
- Orchestrator is not a prompt engine.
- Orchestrator is not a state machine.
- Orchestrator is not a capability.
- Orchestrator is not a database.
- Orchestrator is not a runtime framework.
- Orchestrator is not a LangGraph graph.
- Orchestrator is not a CrewAI flow.
- Orchestrator is not a Temporal workflow.
- Orchestrator is not a BPMN implementation.
- Orchestrator is a runtime coordination layer.

