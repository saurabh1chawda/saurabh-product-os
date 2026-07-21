# Career Companion Interaction Architecture

## 1. Purpose

Interaction Architecture defines the behavioral model for how Career Companion architectural components collaborate during governed execution. It specifies interaction patterns, interaction contracts, sequencing expectations, failure behavior, recovery behavior, governance behavior, and ownership-preserving rules.

Interaction Architecture is distinct from:

- Component Architecture: defines components, responsibilities, ownership, dependencies, and contracts.
- Runtime Architecture: defines runtime sessions, execution lifecycle, execution boundaries, concurrency, retries, and recovery execution.
- Implementation: defines concrete code, frameworks, protocols, storage, and runtime mechanics.
- Sequence diagrams: visualize specific examples of interaction order.

This document defines behavior. It does not define implementation technology.

## 2. Interaction Principles

- Deterministic execution: interactions must follow explicit state, policy, evidence, approval, and validation rules.
- Governed interactions: workflow, evidence, approval, policy, authorization, and audit requirements remain mandatory.
- Explicit ownership: each interaction preserves the owning component's responsibilities.
- Validation before transition: no transition may occur before required validation succeeds.
- Evidence before decision: decisions must trace to approved evidence or explicitly identify missing evidence.
- Human approval where required: consequential progression requires the defined human approval gate.
- Audit preservation: consequential interactions must leave an audit trail.
- No hidden progression: interaction outcomes must not silently advance workflow state.
- Reference over duplication: components exchange references to authoritative objects when possible.
- Failure-safe behavior: missing prerequisites, invalid outputs, or conflicts stop execution in a defined state.

## 3. Interaction Model

Every significant architectural interaction uses an Interaction Contract.

**Interaction Contract**

- Purpose: why the interaction exists.
- Participants: components or actors involved.
- Initiator: the participant that starts the interaction.
- Preconditions: required state, evidence, approval, policy, authorization, or artifact conditions.
- Interaction Sequence: ordered behavioral steps.
- Expected Outcomes: valid successful results.
- Failure Modes: expected ways the interaction can fail.
- Recovery Rules: how failure is handled without rewriting history.
- Audit Requirements: what must be recorded for traceability.

Interaction contracts preserve deterministic behavior across replaceable implementations.

## 4. Request Interactions

### User Request

- Purpose: capture human intent and initiate governed execution.
- Participants: UI, Request Mapper, Application Service, Authorization, Audit.
- Initiator: human user.
- Preconditions: identified actor, selected workflow instance or permitted creation context, requested action.
- Interaction Sequence:
  1. User expresses intent.
  2. UI captures the request.
  3. Request Mapper creates an application request.
  4. Request Validator checks request shape.
  5. Authorization checks actor permission.
  6. Application Service accepts or rejects the request.
- Expected Outcomes: accepted request, validation warning, authorization rejection, or missing information response.
- Failure Modes: missing actor, invalid request, unauthorized action, missing workflow instance, incomplete context.
- Recovery Rules: request missing information, return validation failure, or stop without workflow mutation.
- Audit Requirements: record actor, requested action, authorization result, and rejection reason when consequential.

### System Request

- Purpose: initiate governed work from a permitted platform service.
- Participants: Scheduling, Notification, Application Service, Policy Engine, Authorization.
- Initiator: authorized platform service.
- Preconditions: permitted scheduled or platform-triggered action, policy allowance, valid workflow reference.
- Interaction Sequence:
  1. Platform service prepares request.
  2. Policy Engine evaluates whether the request is permitted.
  3. Authorization validates system actor permission.
  4. Application Service accepts or rejects the request.
- Expected Outcomes: accepted governed request, deferred request, or policy rejection.
- Failure Modes: stale schedule, invalid workflow reference, policy denial, unauthorized service actor.
- Recovery Rules: record failure, reschedule only where policy allows, or require human review.
- Audit Requirements: record service actor, trigger, policy result, and action taken.

### Internal Request

- Purpose: allow one component to request work from another through an approved boundary.
- Participants: initiating component, receiving component, Policy Engine, Audit where required.
- Initiator: authorized component.
- Preconditions: allowed dependency, valid input references, policy allowance.
- Interaction Sequence:
  1. Initiating component prepares structured request.
  2. Receiving component validates ownership and input contract.
  3. Policy Engine evaluates constraints where required.
  4. Receiving component returns structured result.
- Expected Outcomes: accepted internal result, validation error, or policy rejection.
- Failure Modes: forbidden dependency, malformed request, missing reference, policy violation.
- Recovery Rules: return failure to initiator and stop the current interaction.
- Audit Requirements: record consequential internal requests that affect workflow, artifacts, approvals, evidence, or audit.

## 5. Workflow Interactions

### State Evaluation

- Purpose: determine the current legal workflow context.
- Participants: Workflow Resolver, Workflow Repository, Workflow Validator, Policy Engine.
- Initiator: Orchestrator or Application Service.
- Preconditions: valid Workflow Instance reference and current projection.
- Interaction Sequence:
  1. Load Workflow Instance projection.
  2. Resolve workflow definition and current state contract.
  3. Validate current state and required invariants.
  4. Return legal state context.
- Expected Outcomes: resolved current state, allowed actions, required gate, or validation failure.
- Failure Modes: missing instance, invalid state, orphan references, version mismatch.
- Recovery Rules: block execution and route to governed recovery.
- Audit Requirements: record validation failure where execution cannot proceed.

### Transition

- Purpose: move from one legal workflow state to another.
- Participants: Transition Evaluator, Workflow Validator, Orchestrator, Workflow Repository, Snapshot Repository, Audit Repository.
- Initiator: Orchestrator.
- Preconditions: legal from-state, legal to-state, satisfied gate where required, valid artifacts, valid evidence, policy approval.
- Interaction Sequence:
  1. Transition Evaluator checks legality.
  2. Workflow Validator confirms invariants.
  3. Orchestrator coordinates governed commit.
  4. Workflow Repository records transition.
  5. Snapshot Repository records snapshot.
  6. Audit Repository records transition audit.
- Expected Outcomes: committed transition, snapshot, updated projection.
- Failure Modes: illegal transition, failed invariant, missing approval, stale version, persistence conflict.
- Recovery Rules: reject transition and preserve attempted action through audit where consequential.
- Audit Requirements: record from-state, to-state, actor, reason, trigger, evidence, approvals, artifacts, and timestamp.

### Gate Evaluation

- Purpose: determine whether a required approval gate can be passed.
- Participants: Gate Evaluator, Approval Evaluator, Evidence Repository, Artifact Repository, Policy Engine.
- Initiator: Orchestrator or Workflow Engine.
- Preconditions: active gate, required artifacts, required evidence, approval record where applicable.
- Interaction Sequence:
  1. Gate Evaluator identifies gate requirements.
  2. Approval Evaluator validates approval record.
  3. Evidence Repository resolves required evidence.
  4. Policy Engine evaluates gate policy.
  5. Gate Evaluator returns pass, fail, or waiting result.
- Expected Outcomes: gate pass, gate fail, waiting for approval, or missing evidence.
- Failure Modes: invalid approval, missing evidence, policy denial, artifact mismatch.
- Recovery Rules: stop progression and request missing evidence or human decision.
- Audit Requirements: record gate, decision, approver where present, evidence references, artifact versions, and reason.

### Approval

- Purpose: capture a human decision at a required gate.
- Participants: User Interaction Coordinator, Approval Evaluator, Authorization, Audit Repository.
- Initiator: human approver.
- Preconditions: active approval gate, authorized approver, artifact versions available for review.
- Interaction Sequence:
  1. User Interaction Coordinator presents gate context.
  2. Human approver records decision.
  3. Authorization verifies approver authority.
  4. Approval Evaluator validates decision shape and artifact references.
  5. Audit Repository records approval event.
- Expected Outcomes: approved, rejected, deferred, or human review required.
- Failure Modes: unauthorized approver, missing artifact reference, ambiguous decision, stale artifact version.
- Recovery Rules: reject approval record and request corrected human decision.
- Audit Requirements: record approver, decision, timestamp, reason, gate, and artifact versions.

### Completion

- Purpose: close a workflow or workflow stage when completion criteria are satisfied.
- Participants: Workflow Validator, Transition Evaluator, Workflow Repository, Snapshot Repository, Audit Repository.
- Initiator: Orchestrator.
- Preconditions: completion criteria met, no blocking conditions, required evidence and approvals present.
- Interaction Sequence:
  1. Workflow Validator confirms completion criteria.
  2. Transition Evaluator confirms terminal or next-state legality.
  3. Workflow Repository records completion state.
  4. Snapshot Repository records final stage snapshot.
  5. Audit Repository records completion event.
- Expected Outcomes: completed stage, terminal workflow state, or updated projection.
- Failure Modes: incomplete criteria, missing evidence, unresolved gate, invalid terminal outcome.
- Recovery Rules: keep workflow in current or blocked state with required next action.
- Audit Requirements: record completion criteria, evidence, artifacts, approvals, and outcome.

## 6. Capability Interactions

### Resolution

- Purpose: select the eligible capability for the current workflow state and requested action.
- Participants: Capability Resolver, Capability Registry, Workflow Resolver, Policy Engine.
- Initiator: Orchestrator.
- Preconditions: resolved workflow state, requested action, capability metadata, policy context.
- Interaction Sequence:
  1. Workflow Resolver provides current state context.
  2. Capability Registry provides available capability metadata.
  3. Capability Resolver filters by state, artifact compatibility, version, and policy.
  4. Capability Resolver returns one eligible capability or no eligible capability.
- Expected Outcomes: resolved capability execution plan or capability unavailable result.
- Failure Modes: no eligible capability, unsupported state, incompatible artifact type, policy denial.
- Recovery Rules: stop execution and return required next action or configuration issue.
- Audit Requirements: record capability ID, version, selection reason, and rejection reason where consequential.

### Execution

- Purpose: execute a resolved capability through the approved boundary.
- Participants: Capability Executor, Capability Adapter, Capability Validator, Observability.
- Initiator: Orchestrator.
- Preconditions: resolved capability execution plan, approved inputs, valid artifact versions, execution policy.
- Interaction Sequence:
  1. Capability Executor prepares approved execution input.
  2. Capability Adapter invokes implementation boundary.
  3. Capability Adapter returns structured output.
  4. Observability records execution metadata.
- Expected Outcomes: structured output, failure record, or timeout result.
- Failure Modes: invalid input, adapter failure, timeout, unsupported version, malformed output.
- Recovery Rules: retry where policy allows, otherwise record failure and stop.
- Audit Requirements: record capability ID, version, execution ID, inputs, outputs, duration, outcome, and failure.

### Validation

- Purpose: verify capability outputs before they can affect workflow or artifacts.
- Participants: Capability Validator, Artifact Repository, Evidence Repository, Policy Engine, Workflow Validator.
- Initiator: Orchestrator.
- Preconditions: capability output exists and capability contract is known.
- Interaction Sequence:
  1. Capability Validator checks output contract.
  2. Artifact Repository verifies artifact references.
  3. Evidence Repository verifies evidence references.
  4. Policy Engine evaluates forbidden actions.
  5. Workflow Validator verifies invariant preservation.
- Expected Outcomes: valid output or validation failure.
- Failure Modes: unsupported claim, missing evidence, invalid artifact type, policy violation, invariant violation.
- Recovery Rules: reject output, preserve failure record, and avoid transition.
- Audit Requirements: record validation result and rejected output references where required.

### Completion

- Purpose: finalize capability execution outcome.
- Participants: Capability Executor, Orchestrator, Artifact Repository, Audit Repository.
- Initiator: Orchestrator.
- Preconditions: valid capability output and artifact registration eligibility.
- Interaction Sequence:
  1. Orchestrator accepts validated output.
  2. Artifact Repository registers produced artifacts.
  3. Audit Repository records capability completion.
  4. Orchestrator continues to transition evaluation where allowed.
- Expected Outcomes: registered artifacts, execution audit, and next evaluation step.
- Failure Modes: artifact registration failure, stale version, audit failure.
- Recovery Rules: route to governed recovery without losing execution metadata.
- Audit Requirements: record produced artifacts, capability execution result, actor, and timestamp.

## 7. Artifact Interactions

### Creation

- Purpose: create a new artifact through a valid producing component or capability.
- Participants: producing capability or component, Capability Validator, Artifact Repository, Audit Repository.
- Initiator: capability or authorized component.
- Preconditions: allowed artifact type, valid producer, approved inputs.
- Interaction Sequence:
  1. Producer creates structured artifact output.
  2. Validator checks artifact contract.
  3. Artifact Repository prepares registration.
  4. Audit Repository records creation context.
- Expected Outcomes: artifact ready for registration.
- Failure Modes: malformed artifact, forbidden content, missing evidence, unsupported artifact type.
- Recovery Rules: reject artifact and record validation failure.
- Audit Requirements: record producer, input references, artifact type, and validation result.

### Validation

- Purpose: determine whether an artifact satisfies its contract.
- Participants: Artifact Repository, Validation Engine, Evidence Repository, Policy Engine.
- Initiator: Orchestrator or Validation Engine.
- Preconditions: artifact exists or is pending registration.
- Interaction Sequence:
  1. Validate artifact type and required fields.
  2. Validate version and lifecycle state.
  3. Validate evidence references.
  4. Validate policy compliance.
- Expected Outcomes: artifact valid, artifact invalid, or human review required.
- Failure Modes: missing required fields, broken evidence reference, invalid lifecycle status, policy violation.
- Recovery Rules: block registration or consumption until corrected through governed process.
- Audit Requirements: record validation result for consequential artifacts.

### Registration

- Purpose: add a valid artifact version to the authoritative artifact registry.
- Participants: Orchestrator, Artifact Repository, Audit Repository.
- Initiator: Orchestrator.
- Preconditions: artifact validated, producer known, evidence references valid where required.
- Interaction Sequence:
  1. Orchestrator submits artifact registration request.
  2. Artifact Repository records artifact version.
  3. Audit Repository records registration.
  4. Workflow Instance references the artifact version where allowed.
- Expected Outcomes: registered artifact version and audit reference.
- Failure Modes: duplicate artifact version, stale producer reference, persistence conflict.
- Recovery Rules: apply idempotency rules or route to recovery.
- Audit Requirements: record artifact ID, version, producer, timestamp, and source execution.

### Versioning

- Purpose: preserve artifact evolution without mutating prior approved versions.
- Participants: Artifact Repository, Audit Repository, Workflow Repository.
- Initiator: Orchestrator or authorized component.
- Preconditions: valid artifact lineage, version policy, producer reference.
- Interaction Sequence:
  1. Create new artifact version.
  2. Validate new version.
  3. Register new version.
  4. Preserve previous versions.
  5. Update references only through governed workflow.
- Expected Outcomes: new artifact version and preserved history.
- Failure Modes: version conflict, unauthorized replacement, invalid lineage.
- Recovery Rules: reject new version or require human review.
- Audit Requirements: record prior version, new version, reason, and actor.

### Consumption

- Purpose: use an artifact as input to workflow, capability, evidence, or presentation.
- Participants: consuming component, Artifact Repository, Authorization, Validation Engine.
- Initiator: consuming component.
- Preconditions: authorized access, valid artifact version, compatible artifact type.
- Interaction Sequence:
  1. Consumer requests artifact reference.
  2. Authorization verifies access.
  3. Artifact Repository returns valid version reference.
  4. Consumer uses artifact within allowed contract.
- Expected Outcomes: authorized artifact consumption or rejection.
- Failure Modes: unauthorized access, stale version, incompatible artifact, invalid lifecycle status.
- Recovery Rules: stop consumption and request correct artifact or authorization.
- Audit Requirements: record access when sensitive, consequential, or policy-required.

## 8. Evidence Interactions

### Resolution

- Purpose: locate evidence required for a decision, artifact, claim, or transition.
- Participants: Evidence Repository, Artifact Repository, Workflow Repository, Audit Repository.
- Initiator: Orchestrator, Gate Evaluator, Validation Engine, or capability component.
- Preconditions: evidence requirement or evidence reference.
- Interaction Sequence:
  1. Identify required evidence.
  2. Resolve evidence references.
  3. Resolve related artifacts, approvals, executions, snapshots, or audit records.
  4. Return evidence chain.
- Expected Outcomes: complete evidence chain, partial evidence, or missing evidence result.
- Failure Modes: missing reference, invalid version, broken chain, unauthorized access.
- Recovery Rules: block decision or mark human review required.
- Audit Requirements: record evidence resolution for consequential decisions.

### Validation

- Purpose: confirm evidence is authoritative enough to support the requested action.
- Participants: Evidence Repository, Validation Engine, Policy Engine, Authorization.
- Initiator: Orchestrator or Validation Engine.
- Preconditions: evidence chain exists.
- Interaction Sequence:
  1. Validate evidence traceability.
  2. Validate approval status where required.
  3. Validate version and attribution.
  4. Validate policy constraints.
- Expected Outcomes: evidence valid, evidence insufficient, or evidence unauthorized.
- Failure Modes: unapproved evidence, stale evidence, missing attribution, policy violation.
- Recovery Rules: reject decision and request approved evidence or human review.
- Audit Requirements: record validation result and evidence references.

### Reference

- Purpose: attach evidence references to decisions, artifacts, transitions, and audit records.
- Participants: Orchestrator, Evidence Repository, Artifact Repository, Audit Repository.
- Initiator: Orchestrator or authorized component.
- Preconditions: valid evidence reference and compatible target.
- Interaction Sequence:
  1. Component requests evidence attachment.
  2. Evidence Repository verifies reference.
  3. Target record stores evidence reference.
  4. Audit records attachment where required.
- Expected Outcomes: evidence reference attached.
- Failure Modes: invalid reference, incompatible target, unauthorized attachment.
- Recovery Rules: reject attachment and block dependent decision.
- Audit Requirements: record evidence ID, target, actor, and reason where consequential.

### Authorization

- Purpose: determine whether evidence may authorize the requested action.
- Participants: Evidence Repository, Policy Engine, Authorization, Gate Evaluator.
- Initiator: Orchestrator or Gate Evaluator.
- Preconditions: evidence resolved and action known.
- Interaction Sequence:
  1. Evidence Repository provides evidence chain.
  2. Authorization validates actor access.
  3. Policy Engine evaluates action-specific authority.
  4. Gate Evaluator or Orchestrator uses result.
- Expected Outcomes: evidence authorized, evidence insufficient, or access denied.
- Failure Modes: privacy restriction, policy denial, incomplete chain.
- Recovery Rules: stop decision or require alternate evidence.
- Audit Requirements: record evidence authorization decision for gate or transition actions.

## 9. Persistence Interactions

### Read

- Purpose: retrieve authoritative records for execution or presentation.
- Participants: Repository, Authorization, requesting component.
- Initiator: authorized component.
- Preconditions: valid reference and access permission.
- Interaction Sequence:
  1. Requesting component submits reference.
  2. Authorization verifies access.
  3. Repository returns authoritative record or reference.
- Expected Outcomes: record returned, not found, or access denied.
- Failure Modes: missing record, unauthorized access, stale reference.
- Recovery Rules: stop execution or request valid reference.
- Audit Requirements: record sensitive or consequential reads where required.

### Register

- Purpose: add a validated record without committing a workflow transition by itself.
- Participants: Orchestrator, Repository, Audit Repository.
- Initiator: Orchestrator.
- Preconditions: valid record, authorized registration, idempotency context.
- Interaction Sequence:
  1. Orchestrator submits registration.
  2. Repository validates uniqueness and version.
  3. Repository registers record.
  4. Audit Repository records registration.
- Expected Outcomes: registered record or idempotent existing record.
- Failure Modes: duplicate conflict, invalid version, persistence failure.
- Recovery Rules: apply idempotency or route to recovery.
- Audit Requirements: record registration metadata.

### Commit

- Purpose: persist a governed execution result as authoritative.
- Participants: Orchestrator, Workflow Repository, Artifact Repository, Snapshot Repository, Audit Repository.
- Initiator: Orchestrator.
- Preconditions: validation passed, approvals satisfied, evidence valid, transition legal.
- Interaction Sequence:
  1. Register valid artifacts.
  2. Record legal transition.
  3. Create snapshot.
  4. Record audit.
  5. Return updated projection.
- Expected Outcomes: committed execution and updated projection.
- Failure Modes: stale version, partial persistence, audit failure, snapshot failure.
- Recovery Rules: preserve known completed steps and resume through governed recovery.
- Audit Requirements: record commit context, actor, evidence, artifacts, approvals, and transition.

### Snapshot

- Purpose: preserve immutable point-in-time execution state.
- Participants: Snapshot Repository, Workflow Repository, Audit Repository.
- Initiator: Orchestrator.
- Preconditions: successful governed transition or required recovery checkpoint.
- Interaction Sequence:
  1. Gather current Workflow Instance projection references.
  2. Create snapshot record.
  3. Store snapshot sequence.
  4. Record audit reference.
- Expected Outcomes: immutable snapshot.
- Failure Modes: sequence conflict, missing reference, persistence failure.
- Recovery Rules: route to recovery before returning success.
- Audit Requirements: record snapshot ID, sequence, trigger, and timestamp.

### Recovery

- Purpose: restore governed execution after persistence or runtime failure.
- Participants: Recovery Coordinator, Repositories, Snapshot Repository, Audit Repository, Orchestrator.
- Initiator: Runtime or Orchestrator.
- Preconditions: failure record or incomplete execution.
- Interaction Sequence:
  1. Load latest valid projection.
  2. Locate last valid snapshot.
  3. Resolve audit and transition history.
  4. Determine recovery action.
  5. Resume, retry, block, or cancel through governed execution.
- Expected Outcomes: recovered execution path, blocked instance, retry, or cancellation.
- Failure Modes: missing snapshot, corrupted reference, unresolved conflict.
- Recovery Rules: escalate to human review or mark blocked.
- Audit Requirements: record failure, recovery decision, actor, and outcome.

## 10. Human Interactions

### Approval

- Purpose: authorize consequential progression.
- Participants: human approver, User Interaction Coordinator, Approval Evaluator, Audit Repository.
- Initiator: human approver.
- Preconditions: active gate and complete review context.
- Interaction Sequence:
  1. Present evidence, artifacts, risks, and decision options.
  2. Human records decision.
  3. Approval Evaluator validates decision.
  4. Audit records approval.
- Expected Outcomes: approve, reject, defer, or request more information.
- Failure Modes: incomplete context, unauthorized approver, ambiguous decision.
- Recovery Rules: request corrected approval or additional evidence.
- Audit Requirements: record gate, approver, decision, reason, artifacts, and timestamp.

### Override

- Purpose: record an authorized human correction or exception.
- Participants: human operator, User Interaction Coordinator, Policy Engine, Audit Repository.
- Initiator: human operator.
- Preconditions: override policy permits action and affected artifacts or decisions are identified.
- Interaction Sequence:
  1. Human identifies override.
  2. Policy Engine evaluates whether override is permitted.
  3. Override reason and scope are recorded.
  4. Audit records override.
- Expected Outcomes: accepted override, rejected override, or human review required.
- Failure Modes: unsupported override, missing reason, policy denial.
- Recovery Rules: reject override or route to governance review.
- Audit Requirements: record actor, reason, affected records, and policy result.

### Review

- Purpose: allow human inspection of artifacts, evidence, risks, and recommendations.
- Participants: human reviewer, UI, View Composer, Authorization.
- Initiator: human reviewer or workflow gate.
- Preconditions: authorized access and reviewable material.
- Interaction Sequence:
  1. Reviewer opens review context.
  2. View Composer presents artifacts and references.
  3. Reviewer records findings or decision.
- Expected Outcomes: findings, approval decision, request for changes, or no action.
- Failure Modes: missing artifacts, unauthorized access, stale projection.
- Recovery Rules: refresh projection or request missing material.
- Audit Requirements: record review outcome when consequential.

### Decision

- Purpose: capture a human or governed decision that affects workflow or future action.
- Participants: human decision-maker, Application Service, Audit Repository, Policy Engine.
- Initiator: human decision-maker or required gate.
- Preconditions: decision options defined and required evidence available.
- Interaction Sequence:
  1. Present options and evidence.
  2. Human selects decision.
  3. Policy Engine validates decision constraints.
  4. Audit records decision.
- Expected Outcomes: decision accepted, rejected, deferred, or requires more evidence.
- Failure Modes: undefined option, missing evidence, policy violation.
- Recovery Rules: request valid decision or additional evidence.
- Audit Requirements: record decision, actor, evidence, reason, and timestamp.

## 11. Projection Interactions

### Projection Creation

- Purpose: create a current view from authoritative workflow history.
- Participants: Workflow Repository, Snapshot Repository, Audit Repository, Application Service.
- Initiator: Application Service or Orchestrator.
- Preconditions: valid Workflow Instance and readable history.
- Interaction Sequence:
  1. Load Workflow Instance.
  2. Resolve latest snapshot and transition history.
  3. Compose current projection.
  4. Return projection.
- Expected Outcomes: current projection.
- Failure Modes: missing snapshot, invalid history, stale reference.
- Recovery Rules: route to recovery or human review.
- Audit Requirements: record projection creation only when policy requires.

### Projection Refresh

- Purpose: refresh a view after execution or external user action.
- Participants: Application Service, Workflow Repository, View Composer.
- Initiator: Application Service or UI.
- Preconditions: valid workflow reference and authorized access.
- Interaction Sequence:
  1. Request latest projection.
  2. Validate access.
  3. Return refreshed projection.
  4. Compose user-facing view.
- Expected Outcomes: refreshed view.
- Failure Modes: stale reference, access denied, missing workflow instance.
- Recovery Rules: request valid reference or show access failure.
- Audit Requirements: record sensitive projection access where required.

### Projection Consumption

- Purpose: use projection data for presentation, decision support, validation, or next action display.
- Participants: UI, Application Service, View Composer, Authorization.
- Initiator: consuming component.
- Preconditions: authorized projection and compatible use.
- Interaction Sequence:
  1. Consume projection reference.
  2. Compose needed view or validation context.
  3. Present or use projection within allowed boundary.
- Expected Outcomes: display, validation, next action, or decision context.
- Failure Modes: unauthorized use, stale projection, missing referenced artifact.
- Recovery Rules: refresh projection or stop access.
- Audit Requirements: record when projection includes sensitive or consequential material.

## 12. Recovery Interactions

### Failure

- Purpose: handle failed execution without hidden mutation.
- Participants: Runtime, Orchestrator, Recovery Coordinator, Audit Repository.
- Initiator: failing component or Runtime.
- Preconditions: detected failure.
- Interaction Sequence:
  1. Stop current execution path.
  2. Record failure.
  3. Identify affected records.
  4. Determine recovery route.
- Expected Outcomes: failure record and recovery decision.
- Failure Modes: incomplete failure data, unknown state, missing audit reference.
- Recovery Rules: mark blocked and require human review if recovery cannot be determined.
- Audit Requirements: record failure, actor, context, and reason.

### Retry

- Purpose: repeat a recoverable interaction without duplication.
- Participants: Runtime, Recovery Coordinator, Orchestrator, Observability.
- Initiator: Runtime or Recovery Coordinator.
- Preconditions: retry policy allows retry and idempotency context exists.
- Interaction Sequence:
  1. Validate retry eligibility.
  2. Load latest projection.
  3. Re-execute allowed interaction.
  4. Record retry result.
- Expected Outcomes: successful retry, retry failure, or retry exhausted.
- Failure Modes: stale state, policy denial, repeated failure.
- Recovery Rules: stop retry and mark blocked or failed when exhausted.
- Audit Requirements: record retry count, original failure, and outcome.

### Resume

- Purpose: continue execution from a valid recovery point.
- Participants: Recovery Coordinator, Snapshot Repository, Workflow Repository, Orchestrator.
- Initiator: Recovery Coordinator or human-approved action.
- Preconditions: valid recovery point and legal workflow state.
- Interaction Sequence:
  1. Load recovery point.
  2. Validate current projection.
  3. Resume through Orchestrator.
  4. Record resumed execution.
- Expected Outcomes: resumed governed execution.
- Failure Modes: invalid recovery point, conflicting state, missing evidence.
- Recovery Rules: block and request human review.
- Audit Requirements: record recovery point, actor, reason, and resumed action.

### Cancellation

- Purpose: stop execution or workflow progression through a governed action.
- Participants: human actor or Runtime, Orchestrator, Workflow Repository, Audit Repository.
- Initiator: human actor, Runtime, or policy.
- Preconditions: cancellation allowed by workflow and policy.
- Interaction Sequence:
  1. Cancellation request is validated.
  2. Orchestrator determines legal cancellation effect.
  3. Workflow Repository records state or status update where allowed.
  4. Audit records cancellation.
- Expected Outcomes: cancelled execution or cancelled workflow state.
- Failure Modes: unauthorized cancellation, illegal state, missing reason.
- Recovery Rules: reject cancellation or require human review.
- Audit Requirements: record actor, reason, timestamp, and affected execution.

### Conflict Resolution

- Purpose: resolve conflicting execution attempts or stale updates.
- Participants: Orchestrator, Workflow Repository, Recovery Coordinator, Audit Repository.
- Initiator: Runtime or Repository conflict detection.
- Preconditions: detected version conflict, state conflict, or reference conflict.
- Interaction Sequence:
  1. Detect conflict.
  2. Stop current commit.
  3. Load latest authoritative projection.
  4. Compare attempted action with current state.
  5. Reject, retry, resume, or require human review.
- Expected Outcomes: conflict resolved without history rewrite.
- Failure Modes: unresolved conflict, contradictory approvals, missing records.
- Recovery Rules: mark blocked and require human decision.
- Audit Requirements: record conflict type, attempted action, current state, and resolution.

## 13. Interaction Rules

Allowed interactions:

- Presentation may request work through Application components.
- Application may invoke Workflow components.
- Orchestrator may coordinate Capability, Persistence, Validation, Policy, Snapshot, and Audit interactions.
- Capabilities may receive approved inputs and return structured outputs.
- Repositories may persist and retrieve authoritative records.
- Platform services may support identity, authorization, policies, scheduling, search, notifications, observability, and secrets.
- Human actors may approve, reject, defer, review, override where policy allows, or cancel where workflow allows.

Forbidden interactions:

- UI directly mutates workflow state.
- Capabilities directly transition workflow.
- Capabilities directly persist authoritative records.
- Capabilities call other capabilities.
- Memory overrides evidence.
- Notifications infer approval.
- Search modifies artifacts.
- Repositories decide workflow progression.
- Model-facing implementations approve, submit, or communicate externally without human approval.
- Any component bypasses workflow, evidence, approval, authorization, persistence, or audit.

Ownership preservation:

- Each component keeps authority over its owned concepts.
- Other components may request, reference, validate, or consume owned concepts through contracts.
- Ownership cannot be transferred through implementation convenience.

Isolation:

- Interactions remain scoped to the current Workflow Instance, Runtime Session, actor authorization, and evidence boundary.
- Cross-instance interaction requires explicit relationship and authorization.

Governance:

- Consequential interactions require audit.
- Approval-gated interactions require human approval.
- Evidence-dependent interactions require evidence validation.
- Failed interactions stop safely and produce defined results.

## 14. Architectural Principles

- Components own responsibilities.
- Interactions define behavior.
- Interaction contracts preserve deterministic collaboration.
- Workflow governs interaction legality.
- Evidence authorizes decisions.
- Artifacts carry business information.
- Approvals gate consequential progression.
- Audit preserves history.
- Runtime coordinates execution boundaries.
- Orchestrator coordinates interaction flow.
- Capabilities transform approved inputs only.
- Persistence preserves authoritative records.
- Memory assists but does not authorize.
- Humans remain authoritative at required gates.
- Failures stop safely.
- Recovery never rewrites history.
- Implementation choices must preserve these interaction rules.
