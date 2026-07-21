# ADR-005: Platform Services Strategy

## Status

Accepted

## Date

2026-07-21

## Authors

- Career Companion Architecture

## Decision Category

Platform Architecture

## Context

Career Companion has a frozen architectural baseline and four accepted ADRs. ADR-001 defines aggregate-owned persistence and repository strategy. ADR-002 defines runtime execution strategy. ADR-003 defines stateless governed workflow coordination. ADR-004 defines information-class-driven storage.

The platform now needs an implementation-governing strategy for shared platform services. Career Companion and Career OS require common services for identity, authorization, configuration, policy evaluation, runtime support, operations, governance registries, and observability. These services must support business execution without becoming business capabilities or bypassing workflow governance.

This ADR defines service responsibilities, dependency rules, replaceability expectations, and service contract requirements. It does not select implementation technologies, vendors, frameworks, infrastructure, or service products.

## Problem Statement

Career Companion needs a canonical platform services strategy that separates shared platform concerns from business capabilities.

Without this decision, future implementation could duplicate shared concerns inside capabilities, allow platform services to call business capabilities, mix workflow behavior into operational services, or create hidden side effects through utility code. That would weaken replaceability, auditability, governance, authorization, and architectural boundaries.

The decision needed is: which platform service categories exist, what they own, who consumes them, what authority they have, what dependencies are allowed, and what contracts every service must expose.

## Decision

Career Companion will use a governed platform service layer.

Platform services provide reusable, replaceable, business-agnostic shared capabilities that support workflow execution, runtime coordination, governance, operations, and integration boundaries. Platform services do not own business workflow semantics, do not execute business capabilities, do not mutate workflow state directly, and do not bypass evidence, approval, policy, authorization, persistence, or audit requirements.

### 1. Platform Service Philosophy

Platform services exist to provide shared non-business concerns across Career Companion and Career OS.

Platform services are different from business capabilities:

- Business capabilities transform domain-specific inputs into domain-specific outputs under capability contracts.
- Platform services provide reusable support functions such as identity, authorization, configuration, policies, scheduling, search, audit, observability, registries, and rendering.

Platform services serve architecture. They do not define product behavior, workflow legality, evidence authority, or human approval decisions.

### 2. Service Classification

#### Foundation Services

##### Identity

- Purpose: identify human and system actors.
- Responsibilities: provide actor identity for authorization, audit, workflow requests, and operational records.
- Consumers: UI, Application Service, Authorization, Audit, Workflow, Runtime, Platform Services.
- Authority: authoritative for actor identity within the execution context.
- Replaceability: replaceable when actor identity semantics and audit compatibility are preserved.

##### Authentication

- Purpose: establish that an actor is who they claim to be.
- Responsibilities: validate actor authentication state before protected actions.
- Consumers: UI, Application Service, Authorization, Identity.
- Authority: authoritative for authentication status, not business authorization.
- Replaceability: replaceable when authentication outcomes remain compatible with Identity and Authorization.

##### Authorization

- Purpose: determine whether an actor may perform an action or access a resource.
- Responsibilities: evaluate permissions for workflow instances, artifacts, evidence, approvals, audit records, configuration, and platform actions.
- Consumers: UI, Application Service, Workflow, Repositories, Search, Model Gateway, Document Rendering, Audit.
- Authority: authoritative for access decisions.
- Replaceability: replaceable when authorization decisions remain deterministic, auditable, and policy-compatible.

##### Configuration

- Purpose: provide governed settings, defaults, thresholds, and component availability.
- Responsibilities: serve versioned configuration values and preserve configuration scope.
- Consumers: Application Service, Workflow, Runtime, Orchestrator, Capabilities, Platform Services.
- Authority: authoritative for configuration values within defined scope.
- Replaceability: replaceable when versioning, scope, and retrieval semantics are preserved.

##### Secrets

- Purpose: protect sensitive credentials or tokens required by future integrations.
- Responsibilities: provide authorized secret access under policy and audit boundaries.
- Consumers: Integration Components, Model Gateway, Document Rendering, Notification, Platform Services.
- Authority: authoritative for secret access, not business decisions.
- Replaceability: replaceable when least privilege, authorization, audit, and rotation compatibility are preserved.

##### Policy Evaluation

- Purpose: evaluate governed execution, privacy, approval, retry, extension, and eligibility policies.
- Responsibilities: return deterministic policy decisions with reasons and references.
- Consumers: Workflow, Runtime, Orchestrator, Capability Resolver, Authorization, Repositories, Integration Components.
- Authority: authoritative for policy decisions within policy scope.
- Replaceability: replaceable when policy behavior, versioning, and auditability are preserved.

#### Runtime Support Services

##### Scheduling

- Purpose: coordinate deferred execution, review cadence, reminders, and time-based checks.
- Responsibilities: create scheduled action references and trigger permitted requests under policy.
- Consumers: Runtime, Application Service, Notification, Workflow.
- Authority: authoritative for schedule metadata, not workflow progression.
- Replaceability: replaceable when scheduled action semantics and policy boundaries are preserved.

##### Notifications

- Purpose: surface permitted alerts or reminders.
- Responsibilities: notify actors about required attention without causing workflow progression.
- Consumers: Application Service, Workflow, Scheduling, Operations.
- Authority: authoritative for notification delivery status only.
- Replaceability: replaceable when notification records, authorization, and no-progression rules are preserved.

##### Search

- Purpose: support authorized retrieval and discovery.
- Responsibilities: retrieve derived references across approved information within authorization and privacy boundaries.
- Consumers: UI, Application Service, View Composer, Workflow Review, Operations.
- Authority: derived and never authoritative for business decisions.
- Replaceability: replaceable when derived-search semantics and source traceability are preserved.

##### Document Rendering

- Purpose: render approved document artifacts without changing business meaning.
- Responsibilities: transform approved artifacts into presentation or export formats while preserving content, chronology, metrics, links, and evidence references.
- Consumers: UI, Export Coordinator, Application Service, QA Review.
- Authority: authoritative for rendering result, not source content.
- Replaceability: replaceable when content preservation and validation behavior are preserved.

##### File Management

- Purpose: manage file references and file lifecycle where artifacts or operational records require files.
- Responsibilities: preserve file metadata, references, lifecycle status, and access boundaries.
- Consumers: Artifact Repository, Document Rendering, Export Coordinator, Import Coordinator, UI.
- Authority: authoritative for file reference metadata, not artifact meaning.
- Replaceability: replaceable when file identity, access, and reference integrity are preserved.

##### Model Gateway

- Purpose: provide a governed boundary for model-facing execution.
- Responsibilities: isolate model-facing implementations behind capability adapters, policies, and observability.
- Consumers: Capability Adapter, Capability Executor, Validation Engine, Observability.
- Authority: authoritative for model-boundary execution metadata, not workflow, evidence, or approval.
- Replaceability: replaceable when capability contracts, policies, observability, and no-hidden-side-effect rules are preserved.

#### Operational Services

##### Audit

- Purpose: preserve consequential execution history.
- Responsibilities: record actor, timestamp, action, reason, evidence, artifacts, approvals, failures, transitions, and recovery events.
- Consumers: Workflow, Runtime, Orchestrator, Repositories, Authorization, Operations.
- Authority: authoritative for historical execution facts.
- Replaceability: replaceable when append-only semantics and traceability are preserved.

##### Logging

- Purpose: support operational diagnostics.
- Responsibilities: record operational events required for support and troubleshooting while respecting privacy boundaries.
- Consumers: Runtime, Platform Services, Integration Components, Operations.
- Authority: operational, not authoritative for business truth.
- Replaceability: replaceable when diagnostic utility and privacy controls are preserved.

##### Metrics

- Purpose: measure operational and product behavior.
- Responsibilities: capture counts, durations, outcomes, failures, retries, and usage signals from authoritative or observed sources.
- Consumers: Operations, Observability, Product Review, Governance Review.
- Authority: derived from source events and not business state itself.
- Replaceability: replaceable when metric definitions and source traceability are preserved.

##### Health

- Purpose: report service and platform readiness.
- Responsibilities: expose whether platform services and required dependencies are operationally available.
- Consumers: Operations, Runtime, Application Service.
- Authority: authoritative for health status within defined scope.
- Replaceability: replaceable when health semantics and failure behavior are preserved.

##### Diagnostics

- Purpose: support issue investigation and recovery analysis.
- Responsibilities: correlate execution records, failures, validation results, logs, audit records, and runtime session data.
- Consumers: Operations, Recovery Coordinator, Architecture Review, Support.
- Authority: diagnostic and derived, not business authority.
- Replaceability: replaceable when correlation and privacy boundaries are preserved.

##### Observability

- Purpose: provide runtime and operational visibility.
- Responsibilities: capture runtime sessions, correlation IDs, execution IDs, duration, outcomes, failures, retries, cancellations, and validation results.
- Consumers: Runtime, Orchestrator, Capability Executor, Recovery Coordinator, Operations.
- Authority: authoritative for observed execution metadata.
- Replaceability: replaceable when correlation, traceability, and privacy semantics are preserved.

#### Governance Services

##### Capability Registry

- Purpose: preserve capability metadata, versions, lifecycle, compatibility, and supported states.
- Responsibilities: register capabilities, track status, support resolution, and enforce capability lifecycle.
- Consumers: Capability Resolver, Orchestrator, Workflow, Architecture Review.
- Authority: authoritative for capability metadata.
- Replaceability: replaceable when capability identity, versioning, and compatibility semantics are preserved.

##### Policy Registry

- Purpose: preserve policy definitions and lifecycle.
- Responsibilities: register policy versions, status, scope, owner, and review metadata.
- Consumers: Policy Evaluation, Authorization, Runtime, Workflow, Governance Review.
- Authority: authoritative for policy definitions.
- Replaceability: replaceable when policy versioning, scope, and lifecycle semantics are preserved.

##### Prompt Registry

- Purpose: preserve governed prompt templates where future model-facing capabilities require them.
- Responsibilities: register prompt identity, version, status, scope, owner, and approved usage.
- Consumers: Model Gateway, Capability Adapter, Validation Engine, Governance Review.
- Authority: authoritative for prompt metadata and approved usage, not model output truth.
- Replaceability: replaceable when versioning, approval, and traceability are preserved.

##### Template Registry

- Purpose: preserve governed operational, artifact, or document templates.
- Responsibilities: register template identity, version, status, scope, owner, and usage rules.
- Consumers: Document Rendering, Artifact workflows, Application Service, Governance Review.
- Authority: authoritative for template metadata and lifecycle.
- Replaceability: replaceable when template versioning and approval semantics are preserved.

##### Feature Flags

- Purpose: govern availability of capabilities, components, services, or behavior.
- Responsibilities: provide controlled enablement decisions by scope, version, and policy.
- Consumers: Application Service, Workflow, Runtime, Platform Services.
- Authority: authoritative for feature availability, not business decisions.
- Replaceability: replaceable when flag scope, versioning, and audit compatibility are preserved.

##### Version Registry

- Purpose: preserve version relationships across architecture, contracts, capabilities, policies, templates, and services.
- Responsibilities: record version identity, compatibility, lifecycle, and supersession references.
- Consumers: Runtime, Capability Resolver, Policy Evaluation, Configuration, Governance Review.
- Authority: authoritative for version metadata.
- Replaceability: replaceable when compatibility and lifecycle semantics are preserved.

## 3. Dependency Rules

Allowed dependencies:

- Capabilities may depend on Platform Services.
- Workflow may depend on Platform Services.
- Runtime may depend on Platform Services.
- Orchestrator may depend on Platform Services.
- Repositories may depend on Platform Services for authorization, audit, configuration, policy, and observability.
- Integration Components may depend on Platform Services.
- Presentation and Application components may depend on Platform Services.

Forbidden dependencies:

- Platform Services must not depend on business capabilities.
- Platform Services must not own workflow progression.
- Platform Services must not mutate Workflow Instance state directly.
- Platform Services must not approve gates.
- Platform Services must not interpret evidence as business authority unless they are the explicit evidence-owning component.
- Platform Services must not rewrite artifacts.
- Platform Services must not bypass repositories.
- Platform Services must not bypass authorization, policy, audit, privacy, evidence, or approval requirements.

Dependency principle:

Platform Services support business execution. They do not direct business execution.

## 4. Cross-Cutting Responsibilities

Platform Services handle shared concerns that cut across workflow, runtime, capabilities, repositories, integrations, and operations.

Shared concerns include:

- Actor identity.
- Authentication state.
- Authorization decisions.
- Configuration values.
- Secret access.
- Policy evaluation.
- Scheduling and reminders.
- Notifications.
- Search and retrieval.
- Document rendering.
- File reference management.
- Model boundary governance.
- Audit history.
- Operational logging.
- Metrics.
- Health checks.
- Diagnostics.
- Observability.
- Capability registration.
- Policy registration.
- Prompt registration.
- Template registration.
- Feature availability.
- Version compatibility.

These concerns are shared services, not business capabilities.

## 5. Service Contracts

Every platform service must expose a service contract with:

- Deterministic interface.
- Versioned contract.
- Explicit inputs.
- Explicit outputs.
- Defined authority.
- Defined consumers.
- Defined failure modes.
- Defined audit requirements where consequential.
- No hidden side effects.
- No implicit workflow progression.
- No undocumented persistence.

Service contract rules:

- Inputs must identify required references and actor context.
- Outputs must be structured and inspectable.
- Failures must be explicit.
- Side effects must be documented and authorized.
- Service versions must preserve compatibility or require governed migration.
- Services must be replaceable when contracts are preserved.

## 6. Platform Service Principles

- Reusable.
- Replaceable.
- Stateless where practical.
- Observable.
- Governed.
- Business-agnostic.
- Contract-first.
- Versioned.
- Authorized.
- Auditable where consequential.
- Privacy-preserving.
- No hidden workflow progression.
- No approval bypass.
- No direct business state mutation unless explicitly owned.

## 7. Future Technology Mapping

Future implementation may map platform services to service capability categories. This ADR does not select technologies.

Service capability categories include:

- Identity and access capability.
- Configuration and policy capability.
- Secret protection capability.
- Scheduling and notification capability.
- Retrieval and search capability.
- Document and file handling capability.
- Model boundary capability.
- Audit and operational history capability.
- Logging, metrics, health, diagnostics, and observability capability.
- Registry and version management capability.

Technology selection must preserve service contracts, dependency rules, replaceability, observability, governance, and privacy.

## Alternatives Considered

### Alternative A: Platform Service Layer

A platform service layer provides reusable shared services with explicit contracts and dependency rules.

Decision: Accepted.

Reason: It preserves separation between shared concerns and business capabilities, improves replaceability, reduces duplication, and supports governance without selecting technology.

### Alternative B: Shared Utilities

Shared utilities would provide helper functions for common concerns without strong service contracts or ownership.

Decision: Rejected.

Reason: Utilities tend to hide side effects, blur ownership, weaken versioning, and can become ungoverned dependency paths.

### Alternative C: Capabilities Implementing Shared Concerns

Each business capability would implement its own identity, authorization, configuration, search, logging, or policy behavior as needed.

Decision: Rejected.

Reason: It duplicates shared responsibilities, creates inconsistent governance, weakens auditability, and makes capabilities less replaceable.

## Trade-offs

### Advantages

- Clear shared-service ownership.
- Stronger dependency governance.
- Better replaceability.
- Reduced duplicated concerns inside capabilities.
- More consistent audit, policy, authorization, and observability behavior.
- Cleaner technology mapping in future ADRs.

### Disadvantages

- Requires explicit service contracts.
- Adds upfront platform design discipline.
- Future implementation must avoid overloading services with business behavior.

### Operational Impact

Operational review can inspect platform service health, auditability, version compatibility, and service behavior separately from business workflow behavior.

### Development Impact

Developers must consume shared concerns through platform service contracts rather than creating local shortcuts inside capabilities or UI code.

### Testing Impact

Tests must verify service contracts, forbidden dependencies, no hidden side effects, authorization behavior, policy behavior, observability, and service replaceability boundaries.

## Consequences

### Positive

- Shared concerns are reusable and governed.
- Capabilities stay focused on business transformations.
- Platform services remain replaceable.
- Service behavior is inspectable and versioned.
- Governance and observability are more consistent.

### Negative

- More service contracts must be maintained.
- Poorly designed services could become too broad if governance is weak.
- Implementation must resist treating platform services as business workflow owners.

### Future Implications

Future ADRs may select technologies for specific service capability categories. Those ADRs must preserve service contracts, dependency rules, replaceability, and governance boundaries.

## Architecture Principles Impact

This ADR reinforces the Career Companion Architecture Principles:

- Workflow Governance: platform services support workflow but do not control progression.
- Evidence Authority: platform services cannot replace evidence authority.
- Human Approval: platform services cannot approve gates or infer approval.
- Immutable Artifacts: rendering and file services preserve artifact meaning and versions.
- Deterministic Recovery: platform services provide observable, versioned, and auditable support.
- Single Ownership: each shared concern has a defined service owner.
- Audit: audit is a first-class operational service.
- Replaceability: platform services are contract-bound and replaceable.

## Affected Components

- Identity.
- Authentication.
- Authorization.
- Configuration.
- Secrets.
- Policy Evaluation.
- Scheduling.
- Notifications.
- Search.
- Document Rendering.
- File Management.
- Model Gateway.
- Audit.
- Logging.
- Metrics.
- Health.
- Diagnostics.
- Observability.
- Capability Registry.
- Policy Registry.
- Prompt Registry.
- Template Registry.
- Feature Flags.
- Version Registry.
- UI.
- Application Service.
- Workflow.
- Runtime.
- Orchestrator.
- Capabilities.
- Repositories.
- Integration Components.

## Migration Considerations

This ADR defines baseline platform service strategy before implementation. Future migration considerations may include service contract versioning, service replacement, registry evolution, policy migration, prompt and template lifecycle migration, and operational service compatibility.

Migration must preserve service authority, versioning, dependency rules, audit records, policy behavior, authorization behavior, and privacy boundaries.

## Operational Considerations

Operational checks should verify:

- Platform services do not own business workflow progression.
- Platform services expose explicit contracts.
- Service outputs are structured and inspectable.
- Forbidden dependencies are not introduced.
- Service failures are explicit.
- Service behavior is observable.
- Authorization, policy, audit, and privacy boundaries are preserved.
- Registries remain versioned and governed.

Operational review should focus on service health, service contract stability, dependency drift, governance violations, and hidden side effects.

## Future Review Criteria

This ADR should be reviewed if:

- A new platform service category is introduced.
- A platform service begins to own business behavior.
- Capabilities duplicate shared platform concerns.
- Service dependency direction becomes ambiguous.
- Hidden side effects are discovered.
- Service replacement becomes difficult despite stable contracts.
- Future technology selection cannot preserve service contracts and dependency rules.
- Architecture Principles are updated in a way that changes platform service expectations.

## References

- [Architecture Principles](../architecture-principles.md)
- [ADR Framework](../adr-framework.md)
- [ADR-001: Persistence Model & Repository Strategy](ADR-001-persistence-model-and-repository-strategy.md)
- [ADR-002: Runtime Execution Strategy](ADR-002-runtime-execution-strategy.md)
- [ADR-003: Workflow Coordination Strategy](ADR-003-workflow-coordination-strategy.md)
- [ADR-004: Information Storage Strategy](ADR-004-information-storage-strategy.md)
- [Solution Architecture](../solution-architecture.md)
- [Component Architecture](../component-architecture.md)
- [Reference Architecture](../reference-architecture.md)
- [Runtime Architecture](../runtime-architecture.md)
- [Interaction Architecture](../interaction-architecture.md)
