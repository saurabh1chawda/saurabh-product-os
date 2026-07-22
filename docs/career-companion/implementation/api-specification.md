# Career Companion API Specification

## 1. Executive Summary

This document defines the architectural API surface for Career Companion. It specifies API responsibilities, command/query separation, long-running operation behavior, versioning, validation, error handling, security boundaries, AI conversation integration, and future evolution.

This is not an OpenAPI specification. It does not define HTTP handlers, transport-specific routes, code, or protocol bindings.

The API model aligns with:

- [Architecture Blueprint v1.0](../architecture/architecture-blueprint-v1.md)
- [Implementation Roadmap](implementation-roadmap.md)
- [Domain Model](domain-model.md)
- [Repository Specification](repository-specification.md)
- [Component Specification](component-specification.md)
- ADR-001 through ADR-010

API purpose:

- Provide controlled entry points into Career Companion.
- Preserve workflow-governed execution.
- Separate commands from queries.
- Ensure AI execution remains behind the AI Execution Platform.
- Ensure all consequential actions are validated, authorized, observable, and auditable.

## 2. API Design Principles

- APIs expose use cases, not repositories.
- Commands may request state change; queries must not mutate state.
- APIs do not expose persistence implementation details.
- APIs do not expose provider-specific AI details to clients.
- APIs return projections and references, not mutable aggregate internals.
- APIs require explicit actor context.
- APIs require correlation IDs for consequential operations.
- APIs validate before invoking workflow execution.
- APIs preserve one governed execution cycle per command.
- APIs do not allow clients to bypass approval gates.
- APIs do not allow raw AI responses into workflow.
- APIs must be versioned.
- APIs must return structured errors.
- APIs must preserve privacy and least privilege.

## 3. API Surface

The architectural API surface is grouped by use case boundary.

### Workflow APIs

Purpose:

Create, inspect, and execute Workflow Instances.

Command responsibilities:

- Create Workflow Instance.
- Execute governed workflow command.
- Cancel workflow execution.
- Pause or resume workflow where allowed.
- Submit gate decision.

Query responsibilities:

- Get Workflow Instance projection.
- Get workflow state.
- Get current gate.
- Get next valid actions.
- Get workflow history summary.

### Artifact APIs

Purpose:

Expose approved artifact metadata, artifact versions, and artifact retrieval references.

Command responsibilities:

- Register artifact candidate through governed execution.
- Approve artifact version.
- Supersede artifact version.

Query responsibilities:

- Get artifact metadata by ID and version.
- List artifacts for Workflow Instance.
- Get artifact download reference where authorized.
- Verify artifact content hash metadata.

### Evidence APIs

Purpose:

Expose evidence chains and evidence validation state.

Command responsibilities:

- Register evidence reference through governed execution.
- Approve evidence where allowed.

Query responsibilities:

- Get evidence by ID and version.
- Get evidence chain.
- List evidence for artifact.
- List evidence for Workflow Instance.

### Approval APIs

Purpose:

Capture and inspect human approval decisions.

Command responsibilities:

- Submit approval decision.
- Reject approval gate.
- Defer approval gate.

Query responsibilities:

- Get approval request context.
- Get approval history.
- Get required evidence for gate.

### Capability APIs

Purpose:

Expose capability availability and execution entry points through workflow.

Command responsibilities:

- Request capability execution through Workflow Runtime.

Query responsibilities:

- List enabled capabilities.
- Get capability metadata.
- Get capability compatibility for current workflow state.

Capability APIs must not allow direct capability execution outside workflow state.

### AI Execution APIs

Purpose:

Expose AI execution metadata and approved AI conversation surfaces.

Command responsibilities:

- Submit AI conversation turn where allowed by workflow and capability.
- Request AI-assisted capability execution through governed workflow.

Query responsibilities:

- Get AI Execution Record.
- List AI Execution Records by Workflow Instance.
- Get token and cost summary.
- Get validation result.

AI APIs must not expose provider credentials, raw provider controls, or direct provider SDK behavior.

### Search APIs

Purpose:

Expose derived retrieval over authorized projections.

Command responsibilities:

- Request search rebuild where authorized.
- Request reindex for source reference where authorized.

Query responsibilities:

- Search workflow metadata.
- Search artifact metadata.
- Search evidence metadata.
- Search resume text.
- Search JD text.
- Search report text.

Search APIs must return authoritative source IDs and versions. Consequential follow-up actions must rehydrate authoritative records.

### Registry APIs

Purpose:

Expose governed metadata for capabilities, policies, prompts, templates, configuration, and versions.

Command responsibilities:

- Register or update registry metadata through governed administrative flows.

Query responsibilities:

- Get capability registry metadata.
- Get policy registry metadata.
- Get prompt version metadata.
- Get configuration metadata.
- Get version compatibility metadata.

### Audit APIs

Purpose:

Expose authorized audit and history views.

Command responsibilities:

- None for external clients except governed audit annotation where explicitly approved.

Query responsibilities:

- Get audit trail for Workflow Instance.
- Get audit record by ID.
- Get failure and recovery history.

## 4. Command vs Query Model

Career Companion APIs follow command/query separation.

### Commands

Commands request change.

Command examples:

- Create Workflow Instance.
- Execute Workflow Command.
- Submit Approval Decision.
- Cancel Workflow.
- Register Artifact Candidate.
- Approve Artifact.
- Request Search Rebuild.
- Submit AI Conversation Turn.

Command rules:

- Must include actor context.
- Must include correlation ID.
- Must validate input shape.
- Must check authorization.
- Must check policy.
- Must route through application and workflow components.
- Must return execution result, waiting result, validation result, or failure.
- Must not return raw aggregate internals.
- Must not directly mutate repositories from presentation layer.

### Queries

Queries retrieve information.

Query examples:

- Get Workflow Projection.
- Get Artifact Metadata.
- Get Evidence Chain.
- Get Current Gate.
- Search Derived Index.
- Get AI Execution Record.
- Get Audit Trail.

Query rules:

- Must not mutate state.
- Must apply authorization.
- Must return projection or record views.
- Must include source IDs and versions where relevant.
- Must minimize sensitive data.
- Must not treat search as authoritative.

## 5. Long-Running Operations

Long-running operations are represented as governed execution outcomes, not hidden background state.

Long-running examples:

- AI-assisted capability execution.
- Artifact generation and storage.
- Search indexing or rebuild.
- Workflow recovery.
- Document rendering.

Operation model:

```text
Command Accepted
    ↓
Runtime Session Created
    ↓
Execution Started
    ↓
Completed | Waiting | Failed | Cancelled | Timed Out
    ↓
Projection Updated
```

API requirements:

- Return operation reference or execution result.
- Expose operation status through query APIs.
- Preserve correlation ID.
- Record failures explicitly.
- Support cancellation where workflow and policy allow.
- Never infer approval from long-running completion.

Waiting states:

- Human approval required.
- User input required.
- External response pending.
- Validation correction required.
- Recovery required.

## 6. Versioning Strategy

API versioning must protect clients and preserve architecture contracts.

Versioning dimensions:

- API contract version.
- Workflow definition version.
- Capability version.
- Artifact version.
- Evidence version.
- Prompt version.
- Model route version.
- Policy version.
- Search document schema version.

Rules:

- Breaking API changes require a new API version.
- Domain version changes must preserve historical record readability.
- Prompt and model changes must not silently change AI behavior.
- Search schema changes must support rebuild.
- Historical projections must remain explainable.
- Deprecated API versions require migration guidance.

API responses should include version references where relevant to validation, audit, or recovery.

## 7. Validation Strategy

Validation occurs in layers.

### Request Validation

Checks:

- Required fields.
- Identifier format.
- Command/query compatibility.
- Correlation ID.
- Actor context.

### Authorization Validation

Checks:

- Actor permission.
- Resource access.
- Action eligibility.
- Sensitive data access.

### Policy Validation

Checks:

- Workflow policy.
- Approval policy.
- AI execution policy.
- Search and privacy policy.
- Retry and fallback policy.

### Domain Validation

Checks:

- Aggregate invariants.
- Artifact lifecycle.
- Evidence references.
- Approval state.
- Workflow state.

### Capability Validation

Checks:

- Input contract.
- Output contract.
- Evidence sufficiency.
- Unsupported claims.

### AI Output Validation

Checks:

- Structured output schema.
- Capability validation.
- Policy compliance.
- Artifact eligibility.

Validation failures must be structured, actionable, and auditable where consequential.

## 8. Error Model

APIs return structured errors.

Canonical error categories:

- ValidationError.
- AuthorizationError.
- PolicyDenied.
- NotFound.
- Conflict.
- StaleVersion.
- ImmutableRecordViolation.
- MissingApproval.
- MissingEvidence.
- MissingInput.
- CapabilityUnavailable.
- CapabilityExecutionFailed.
- AIExecutionFailed.
- AIOutputInvalid.
- PersistenceUnavailable.
- SearchUnavailable.
- ArtifactStorageUnavailable.
- Timeout.
- Cancelled.
- RecoveryRequired.
- InternalError.

Error response requirements:

- Error code.
- Human-readable message.
- Category.
- Correlation ID.
- Workflow Instance ID where applicable.
- Affected reference where safe.
- Retryable flag.
- Required next action where applicable.
- Audit reference where applicable.

Privacy rule:

Errors must not reveal sensitive record existence to unauthorized actors.

## 9. Security Considerations

Security requirements:

- Every command requires actor context.
- Protected queries require authorization.
- Least privilege applies to all APIs.
- Provider credentials are never exposed.
- Artifact storage keys are not guessable user-facing authority.
- Sensitive data is minimized in responses.
- Raw prompts and raw LLM responses are not returned unless policy explicitly allows.
- Search results must apply authorization filters.
- Audit queries require elevated authorization.
- Administrative registry commands require explicit authorization.

Security boundaries:

- Human approval gates.
- Artifact content retrieval.
- Evidence chain access.
- AI execution.
- Search over sensitive text.
- Audit trail access.
- Policy and configuration updates.

## 10. AI Conversation Contract

AI conversation is an API-mediated interaction pattern, not free-form workflow authority.

Rules:

- Conversation turns must be attached to a Workflow Instance or approved context.
- Conversation turns must route through the AI Execution Platform.
- Conversation must identify capability or operating mode.
- Prompt version must be resolved by Prompt Registry.
- Model route must be policy-governed.
- AI output must be schema validated.
- Capability validation must occur before output affects workflow.
- Raw model responses must not enter workflow.
- Conversation history is not execution state.
- Conversation memory is not evidence.
- Human approval remains required at gates.

Conversation command responsibilities:

- Submit user message.
- Provide context references.
- Request AI-assisted response.
- Return structured assistant output and validation status.

Conversation query responsibilities:

- Retrieve conversation projection where authorized.
- Retrieve AI Execution Records.
- Retrieve cost and token summaries.

AI conversation output states:

- Validated response.
- Requires human review.
- Schema invalid.
- Policy denied.
- Provider failed.
- Timeout.

## 11. Future Evolution

Potential future API areas:

- Advisory Memory APIs.
- Cache administration APIs.
- Analytics APIs.
- Interview workflow APIs.
- Offer evaluation APIs.
- Prompt evaluation APIs.
- Model evaluation APIs.
- Deployment operations APIs.
- Notification APIs.
- Scheduling APIs.

Evolution rules:

- New command APIs must define validation, authorization, policy, failure, audit, and observability behavior.
- New query APIs must define authorization, privacy, projection, and version behavior.
- New AI APIs must pass through AI Execution Platform.
- New search APIs must remain derived.
- New workflow APIs must not bypass Workflow Instance authority.
- Breaking changes require versioning and migration guidance.
- Material architectural changes require ADR review.
