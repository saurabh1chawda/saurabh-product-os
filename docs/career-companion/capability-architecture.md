# Career Companion Capability Architecture

## 1. Purpose

Capability Architecture defines what a Career Companion capability is and how capabilities participate in governed execution.

This document is separate from:

- Capability Contracts: define the behavioral contract for each named capability.
- Orchestrator Architecture: defines runtime coordination.
- Workflow State Machine: defines legal execution states and transitions.
- Runtime implementation: may change without changing the architecture.

Capability Architecture defines lifecycle, registration, discovery, resolution, versioning, compatibility, isolation, execution contract, and governance. It is implementation independent and must remain valid whether a capability is implemented with an LLM, deterministic code, rules engine, external service, local engine, or future technology.

## 2. Design Principles

- Stateless: capabilities do not retain execution state.
- Replaceable: implementations can change without changing orchestration.
- Versioned: capability definitions and implementations have explicit versions.
- Deterministic interface: inputs, outputs, failures, and metadata are structured.
- Implementation independent: architecture does not depend on a language, model, framework, or vendor.
- Isolated: capabilities do not call each other or mutate workflow state.
- Governed: capabilities execute only when allowed by workflow, policy, and approval state.
- Auditable: every execution produces metadata and audit references.
- Backward compatible: compatible changes should not break existing workflows.
- Artifact-based: capabilities consume approved artifact versions and produce artifact outputs.

## 3. Core Concepts

| Concept | Definition |
| --- | --- |
| Capability | Replaceable unit of bounded work that transforms approved inputs into approved outputs. |
| Capability Definition | Architecture-level description of capability identity, supported states, inputs, outputs, and constraints. |
| Capability Registration | Governed addition of a capability definition and version to the Capability Registry. |
| Capability Resolution | Orchestrator process for selecting an eligible capability version from registry metadata. |
| Capability Version | Versioned capability definition or implementation compatibility marker. |
| Capability Execution | One invocation of a resolved capability under an Execution Context. |
| Capability Compatibility | Determination that a capability version can operate with workflow state, artifacts, and policies. |
| Capability Lifecycle | Status progression from draft through registered, enabled, deprecated, and retired. |
| Capability Registry | Authoritative catalogue of capability metadata, versions, status, compatibility, supported states, and supported artifacts. |
| Capability Adapter | Implementation-independent adapter boundary used to invoke a concrete capability implementation. |

## 4. Capability Model

Canonical capability fields:

| Field | Purpose |
| --- | --- |
| Capability ID | Stable capability identifier, such as `CAP-001`. |
| Capability Name | Human-readable capability name. |
| Description | Summary of capability purpose and boundaries. |
| Version | Capability definition or implementation compatibility version. |
| Status | Draft, registered, enabled, deprecated, or retired. |
| Owner | Accountable owner for capability behavior and lifecycle. |
| Supported Workflow States | Workflow states where the capability may be allowed or read-only. |
| Supported Artifact Types | Artifact types the capability can consume or produce. |
| Input Contract | Required structure, evidence, and artifact versions for execution. |
| Output Contract | Structured result and artifact output expectations. |
| Execution Constraints | Policy, approval, privacy, evidence, and state constraints. |
| Metadata | Compatibility, maturity, risk, audit, and operational metadata. |

The Capability Model describes architecture concepts only. It is not a TypeScript interface, Python class, JSON schema, API contract, plugin definition, or runtime framework.

## 5. Capability Registry

The Capability Registry is the authoritative catalogue for capability metadata.

Registry responsibilities:

- Maintain capability metadata.
- Maintain capability versions.
- Maintain capability lifecycle status.
- Maintain compatibility metadata.
- Maintain supported workflow states.
- Maintain supported artifact types.
- Identify deprecated or retired versions.
- Support Orchestrator capability resolution.

The registry does not execute capabilities. It does not store workflow state. It does not own artifacts. It is not an implementation registry, dependency-injection container, plugin loader, or model router.

## 6. Capability Lifecycle

Capability lifecycle:

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

| Lifecycle Status | Meaning | Allowed Use |
| --- | --- | --- |
| Draft | Capability is proposed but not approved for registry use. | Architecture review only. |
| Registered | Capability metadata and version are registered but not executable. | Compatibility review and validation. |
| Enabled | Capability may be resolved by the Orchestrator when workflow and policy allow. | Governed execution. |
| Deprecated | Capability remains available for backward compatibility but should not be selected for new workflows by default. | Existing compatible instances only. |
| Retired | Capability is no longer eligible for execution. | Audit and historical reference only. |

Lifecycle transitions require approval and audit records. Retirement must preserve historical references.

## 7. Capability Resolution

Workflow determines legal capabilities. The Orchestrator resolves capabilities. The registry supplies metadata.

Resolution process:

```text
Current Workflow State
  ↓
Allowed Capability Set
  ↓
Capability Registry Lookup
  ↓
Compatibility Check
  ↓
Policy Check
  ↓
Resolved Capability Version
```

Resolution rules:

- Capabilities never self-select.
- Capabilities never request their own execution.
- Capabilities never bypass the Orchestrator.
- The Orchestrator must reject capabilities not allowed in the current workflow state.
- The Orchestrator must reject retired capability versions.
- Deprecated versions require compatibility justification.
- Resolution returns zero or one executable capability version for an execution cycle.

## 8. Capability Compatibility

Capability compatibility has four dimensions:

| Compatibility Type | Definition |
| --- | --- |
| Workflow compatibility | Capability is allowed in the current workflow state and does not violate transitions or invariants. |
| Artifact compatibility | Required input artifact types and exact versions are available and valid. |
| Version compatibility | Capability version is compatible with Workflow Definition, Capability Contract, and Artifact Model expectations. |
| Policy compatibility | Execution satisfies approval, privacy, security, retry, and execution-limit policies. |

Compatibility does not depend on implementation technology. A capability is incompatible if any required dimension fails.

## 9. Execution Contract

Every capability execution requires:

- Execution Context.
- Approved Inputs.
- Input Artifact Versions.
- Execution Policies.
- Correlation ID.

Every capability execution returns:

- Execution Result.
- Output Artifacts.
- Execution Metadata.
- Failure Records when applicable.

Execution rules:

- No direct Workflow mutation.
- No direct approval mutation.
- No direct snapshot mutation.
- No unregistered artifact output.
- No hidden side effects.
- No external communication.
- No capability-to-capability calls.

The Orchestrator owns persistence, artifact registration, transition commit, snapshot creation, and projection update.

## 10. Isolation Principles

Capabilities cannot:

- Call other capabilities.
- Modify Workflow Instance.
- Modify Workflow State.
- Modify approvals.
- Modify snapshots.
- Communicate directly.
- Persist execution state.
- Read private data outside approved input references.
- Resolve other capabilities.
- Chain execution.

Isolation is architectural. It must hold regardless of implementation technology.

## 11. Versioning

Capability versioning follows semantic intent:

| Version Type | Meaning |
| --- | --- |
| Major | Breaking change to input contract, output contract, supported states, artifact compatibility, or safety behavior. |
| Minor | Backward-compatible capability expansion or new optional output. |
| Patch | Backward-compatible correction, clarification, or non-behavioral improvement. |

Versioning rules:

- Breaking changes require a new major version.
- Minor and patch changes must preserve existing workflow compatibility.
- Deprecated versions remain available only where needed for existing compatible instances.
- Retired versions cannot be selected for new execution.
- Historical executions must retain the exact capability version used.

## 12. Capability Adapters

A Capability Adapter is the boundary between the Orchestrator and a concrete capability implementation.

Adapter examples:

- LLM Adapter.
- Rules Adapter.
- Service Adapter.
- Local Engine Adapter.

The Orchestrator invokes adapters. Adapters invoke implementations.

Adapter rules:

- Adapters must preserve the capability execution contract.
- Adapters must not alter workflow state.
- Adapters must not bypass validation.
- Adapters must not hide implementation failures.
- Adapters must return structured execution results.
- Adapters are replaceable.

This document does not define adapter code, APIs, framework bindings, model calls, or runtime deployment.

## 13. Error Handling

Capability error types:

| Error | Meaning | Recovery |
| --- | --- | --- |
| Capability failure | Capability cannot complete execution. | Return failure record to Orchestrator. |
| Timeout | Capability execution exceeds execution policy. | Stop execution and return timeout failure. |
| Policy violation | Capability request violates privacy, approval, security, or execution policy. | Reject execution and record violation. |
| Validation failure | Input or output fails contract validation. | Reject result and return validation failure. |
| Unsupported version | Requested capability version is not compatible or eligible. | Resolve compatible version or reject request. |
| Unsupported workflow state | Capability is not allowed in current state. | Reject request and return allowed capability set. |

Recovery occurs through the Orchestrator. Capabilities do not recover by changing workflow state or invoking other capabilities.

## 14. Observability

Capability execution observability includes:

- Capability ID.
- Execution ID.
- Correlation ID.
- Capability version.
- Execution duration.
- Outcome.
- Failure type, if any.
- Input artifact versions.
- Output artifact versions.
- Policy result.
- Validation result.

This document does not define telemetry implementation.

## 15. Security Principles

- Least privilege.
- Reference-based access.
- Approved inputs only.
- No hidden memory.
- No capability discovery outside the registry.
- No unauthorized capability execution.
- No direct access to private data beyond approved references.
- No external communication.
- No implementation-specific privilege escalation.

## 16. Extension Rules

New capabilities require:

```text
Architecture Review
  ↓
Registration
  ↓
Validation
  ↓
Approval
  ↓
Compatibility Verification
  ↓
Release
```

Extension rules:

- No ad hoc capabilities.
- No unregistered execution.
- No capability may bypass the Workflow State Machine.
- No capability may bypass Capability Contracts.
- No capability may bypass Artifact Model validation.
- No capability may bypass Orchestrator resolution.
- New capabilities must define lifecycle, versioning, compatibility, isolation, execution, governance, and observability expectations.

## 17. Architectural Principles

- Workflow defines legality.
- Orchestrator coordinates.
- Capability Architecture defines execution contracts.
- Capability Contracts define behavior.
- Capabilities transform artifacts.
- Workflow Instance owns execution state.
- Artifacts own business information.
- Capability Registry supplies metadata.
- Capability resolution is orchestrator-owned.
- Capabilities are replaceable.
- Capabilities are stateless.
- Capabilities never own execution state.
- Capabilities never own workflow.
- Capabilities never call one another.
- Capabilities transform approved inputs into approved outputs.
- Capability Architecture is not plugin implementation.
- Capability Architecture is not runtime framework.
- Capability Architecture is not dependency injection.
- Capability Architecture is not Python modules.
- Capability Architecture is not TypeScript interfaces.
- Capability Architecture is not API definitions.
- Capability Architecture is not LLM prompts.
- Capability Architecture is not database schema.

