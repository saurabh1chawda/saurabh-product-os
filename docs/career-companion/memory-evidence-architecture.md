# Career Companion Memory & Evidence Architecture

## 1. Purpose

Memory and Evidence are separate architectural concepts in Career Companion.

Memory assists execution by carrying useful context, preferences, observations, and prior learning. Evidence authorizes execution by proving that a decision, claim, artifact, transition, or approval is justified.

Memory may influence recommendations. Evidence must justify decisions.

Workflow execution must never depend solely on memory. If memory and evidence conflict, evidence takes precedence. If evidence is missing, workflow progression must pause, fail safely, or request human review.

This architecture remains implementation independent. It does not depend on vector databases, embeddings, knowledge graphs, retrieval-augmented generation, prompt engineering, storage engines, APIs, frameworks, or model providers.

## 2. Design Principles

- Evidence over memory.
- Reference over duplication.
- Immutable evidence.
- Governed memory.
- Least privilege.
- Deterministic execution.
- Implementation independent.
- Privacy first.
- Memory assists execution.
- Evidence authorizes execution.
- Memory cannot override approvals.
- Evidence must be traceable.
- Sensitive information should be referenced rather than copied.
- Conversation history is not memory by default.
- Conversation history is not evidence.

## 3. Core Concepts

| Concept | Definition |
| --- | --- |
| Memory | Governed retained context that may assist execution but cannot authorize decisions by itself. |
| Evidence | Authoritative, traceable, verifiable information that justifies decisions, claims, approvals, and transitions. |
| Evidence Reference | Pointer to a specific artifact, approval, transition, execution, audit record, snapshot, or external source. |
| Memory Scope | Boundary within which memory may be used. |
| Evidence Scope | Boundary within which evidence is valid and authoritative. |
| Memory Context | Relevant memory made available for a specific execution context. |
| Evidence Chain | Directed trace from a decision or artifact back to supporting evidence. |
| Knowledge | Human-reviewed information that may be retained as memory or evidence depending on approval and traceability. |
| Projection | Current view derived from authoritative records, not from memory alone. |
| Retention | Policy-governed persistence, expiration, archival, or deletion of information. |

## 4. Memory Model

Memory is optional and scoped. It may improve execution quality, but it does not authorize workflow progression.

| Memory Category | Purpose | Authority |
| --- | --- | --- |
| Session Memory | Supports continuity within a bounded working session. | Advisory only. |
| Workflow Memory | Supports one Workflow Instance with context such as preferences, observations, and unresolved questions. | Advisory only; Workflow Instance remains authoritative. |
| Capability Memory | Supports a capability execution with bounded context from prior approved artifacts or user preferences. | Advisory only; capability contract remains authoritative. |
| Platform Memory | Supports cross-workflow patterns, user preferences, and operating learnings. | Advisory only; must not override evidence. |
| Reference Memory | Points to reusable approved references, definitions, or public-safe guidance. | Advisory unless backed by evidence references. |

Memory rules:

- Memory may be incomplete.
- Memory may be stale.
- Memory may be wrong.
- Memory must be scoped.
- Memory must be inspectable where used for meaningful decisions.
- Memory must not silently become evidence.

## 5. Evidence Model

Evidence is authoritative when it is traceable, attributed, versioned, approved where required, and auditable.

| Evidence Category | Purpose | Authority |
| --- | --- | --- |
| Approved Artifact | Supports downstream decisions and capability execution. | Authoritative for the approved version. |
| Workflow Transition | Proves state movement and transition rationale. | Authoritative execution history. |
| Approval Record | Proves human decision at a gate or consequential action. | Authoritative approval evidence. |
| Capability Execution | Proves bounded capability invocation, inputs, outputs, and result. | Authoritative execution evidence. |
| Audit Record | Proves who did what, when, why, and with which evidence. | Authoritative audit evidence. |
| Snapshot | Proves point-in-time Workflow Instance projection. | Authoritative historical view. |
| External Document Reference | Points to external or source material such as a job description or official posting. | Authoritative only within its verified scope. |

Evidence remains immutable after approval. If evidence changes, a new version or new evidence reference is required.

## 6. Memory Scope

Memory must never leak across scopes.

| Scope | Boundary | Rules |
| --- | --- | --- |
| User Session | One bounded interaction session. | Must not become durable by default. |
| Workflow Instance | One execution, such as one application. | Must not affect other instances unless approved as reusable learning. |
| Capability Execution | One capability invocation. | Must not persist unless returned as an approved artifact or learning proposal. |
| Platform | Career Companion operating context. | Must be governed, inspectable, and privacy-safe. |
| Organization | Future multi-user or team context. | Out of current scope; would require explicit governance. |

Memory crossing scope boundaries requires review, validation, and approval.

## 7. Evidence Chain

Every consequential decision should trace to evidence.

Canonical chain:

```text
Decision
  ↓
Artifact
  ↓
Approval
  ↓
Execution
  ↓
Audit
```

Example:

```text
Resume claim
  ↓
Resume Draft artifact
  ↓
Resume Strategy approval
  ↓
Resume Assembly execution
  ↓
Canonical achievement evidence
  ↓
Audit record
```

Evidence chain rules:

- Evidence chains must be complete for consequential decisions.
- Evidence chains must reference exact artifact versions.
- Evidence chains must preserve approval records.
- Evidence chains must distinguish facts from hypotheses.
- Broken evidence chains block downstream consumption.

## 8. Retrieval Principles

### Memory Retrieval

Memory retrieval may return incomplete, stale, or advisory context. Retrieved memory must be treated as assistive until validated against evidence.

Memory retrieval may support:

- User preferences.
- Prior observations.
- Known friction patterns.
- Reusable writing guidance.
- Non-authoritative context.

### Evidence Retrieval

Evidence retrieval must be authoritative for the requested decision or artifact. It must return exact references, versions, approval status, and auditability.

Evidence retrieval must support:

- Claim validation.
- Gate approval.
- Artifact consumption.
- Workflow transitions.
- Audit review.

### Reference Retrieval

Reference retrieval may return external documents, standards, templates, or definitions. References become evidence only when captured, attributed, and linked into an evidence chain.

## 9. Authority Model

Authority flows as follows:

```text
Workflow
  ↓
Workflow Instance
  ↓
Evidence
  ↓
Memory
  ↓
Execution
```

Authority rules:

- Workflow governs legal execution.
- Workflow Instance records execution state.
- Evidence authorizes decisions and claims.
- Memory assists execution.
- Execution uses memory only within state, evidence, policy, and approval constraints.
- Evidence always overrides memory.
- Missing evidence cannot be replaced by memory.

## 10. Memory Lifecycle

Memory lifecycle:

```text
Created
  ↓
Referenced
  ↓
Updated
  ↓
Expired
  ↓
Archived
```

Memory may evolve. Updates must preserve scope, source, privacy classification, and confidence where relevant.

Memory may be:

- Promoted to evidence only through validation and approval.
- Expired when stale.
- Archived when historically useful.
- Deleted according to governance.

## 11. Evidence Lifecycle

Evidence lifecycle:

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

Evidence never mutates silently.

Evidence changes require:

- New version.
- New evidence reference.
- New approval when required.
- New audit record.

## 12. Memory Isolation

Memory cannot:

- Change Workflow.
- Create approvals.
- Override evidence.
- Modify artifacts.
- Modify snapshots.
- Modify Workflow Instance state.
- Trigger transitions.
- Authorize external actions.
- Persist unverified facts as evidence.

Memory only informs execution. Any memory-derived suggestion must be validated against evidence before it can influence a consequential action.

## 13. Evidence Validation

Evidence must be:

- Traceable.
- Approved where required.
- Versioned.
- Attributed.
- Auditable.
- Verifiable.
- Scoped.
- Linked to source artifacts or source references.

Invalid evidence includes:

- Unattributed claims.
- Stale references without review.
- Conversation-only statements.
- Unapproved memory.
- Broken artifact references.
- Unsupported metrics.
- Unverified external documents.

Invalid evidence cannot authorize decisions, claims, transitions, approvals, or downstream artifacts.

## 14. Retention Principles

Retention is governed conceptually and remains implementation independent.

| Information Type | Retention Principle |
| --- | --- |
| Session Memory | Short-lived unless explicitly converted into governed memory. |
| Workflow Memory | Retained only within the Workflow Instance unless approved for broader use. |
| Platform Memory | Retained only when useful, scoped, and privacy-safe. |
| Approved Evidence | Retained for auditability and traceability. |
| Sensitive Evidence | Referenced with least privilege and minimized duplication. |
| Archived Evidence | Preserved when needed for audit, learning, or compliance. |

Expiration, archival, and deletion must follow governance. Retention must not preserve sensitive data without purpose.

## 15. Privacy Principles

- Least privilege.
- Need-to-know access.
- Reference over duplication.
- Data minimization.
- Sensitive evidence handling.
- Memory redaction.
- Private by default.
- No scope leakage.
- No exposure of private career, recruiter, application, interview, or offer data without explicit approval.
- Public-safe reporting must use summaries, redaction, or aggregate information.

## 16. Recovery

| Condition | Required Behavior |
| --- | --- |
| Missing memory | Continue if evidence exists; otherwise request context or proceed without memory. |
| Corrupted memory | Ignore memory, mark invalid, and rely on evidence. |
| Stale memory | Validate against evidence or mark advisory only. |
| Evidence unavailable | Pause, block, or fail safely; do not substitute memory. |
| Evidence conflict | Use approved evidence and escalate for review. |
| Memory conflict | Treat memory as advisory and defer to evidence. |

Recovery rules:

- Evidence is preferred.
- Memory cannot repair missing evidence.
- Recovery creates new records where material.
- History is not rewritten.

## 17. Extension Rules

Future memory types and evidence types require:

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

Extension requirements:

- Define scope.
- Define authority.
- Define retention.
- Define privacy classification.
- Define validation rules.
- Define evidence-chain behavior.
- Define audit requirements.

No uncontrolled memory or evidence type may be introduced.

## 18. Architectural Principles

- Memory assists.
- Evidence authorizes.
- Workflow governs.
- Workflow Instance records.
- Capabilities transform.
- Orchestrator coordinates.
- Artifacts carry business information.
- Evidence takes precedence over memory.
- Memory is not source of truth.
- Memory is not workflow state.
- Memory is not approval.
- Memory is not artifact.
- Memory is not evidence.
- Memory is not conversation history.
- Evidence is not memory cache.
- Evidence is not prompt context.
- Evidence is not conversation transcript.
- Memory and Evidence remain implementation independent.

