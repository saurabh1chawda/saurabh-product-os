# Career Companion Component Architecture

## 1. Purpose

Component Architecture decomposes the Career Companion Solution Architecture into architectural components with clear responsibilities, ownership, dependencies, contracts, and collaboration rules.

Components implement architecture. They do not redefine architecture, introduce new workflow rules, change capability behavior, alter evidence authority, or choose implementation technology.

Component Architecture is distinct from:

- Solution Architecture: defines logical layers, major solution components, and dependency direction.
- Implementation: defines concrete code, runtime mechanics, storage, and execution behavior.
- Packages: define physical grouping in a future codebase.
- Modules: define implementation-level organization.
- Classes: define programming constructs.

This document describes architectural components only.

## 2. Design Principles

- Single responsibility: each component owns one bounded architectural concern.
- High cohesion: component responsibilities belong together and should not be split across unrelated owners.
- Loose coupling: components collaborate through stable contracts and references.
- Replaceability: components can evolve or be replaced when their contracts remain intact.
- Deterministic ownership: every architectural concept has one owning component.
- Dependency inversion: components depend on contracts, policies, and architectural abstractions rather than concrete implementations.
- Technology independence: component boundaries remain valid without selecting programming languages, frameworks, databases, infrastructure, or APIs.

## 3. Component Model

Every architectural component uses a common Component Contract.

**Component Contract**

- Purpose: why the component exists.
- Responsibilities: what the component owns and performs.
- Inputs: what the component may receive.
- Outputs: what the component may produce.
- Dependencies: components or architectural concepts it may depend on.
- Forbidden Dependencies: components or concerns it must not depend on.
- Owned Concepts: architectural concepts for which the component is authoritative.
- Lifecycle: how the component is introduced, evolved, replaced, or retired.

Component contracts preserve ownership and prevent architectural drift.

## 4. Presentation Components

### UI

- Purpose: present Career Companion state, projections, artifacts, approvals, warnings, and results to human users.
- Responsibilities: display workflow status, request human input, show artifacts, surface approvals, and present execution outcomes.
- Inputs: projections, artifact references, approval requests, warnings, validation results, execution results.
- Outputs: user intent, human approval decisions, user-supplied information.
- Dependencies: Application Service, View Composer, User Interaction Coordinator.
- Forbidden Dependencies: Workflow Repository, Artifact Repository, Evidence Repository, Capability Executor, direct persistence.
- Owned Concepts: user-facing presentation state.
- Lifecycle: evolves with user experience needs while preserving workflow and approval boundaries.

### Request Mapper

- Purpose: translate user-facing intent into application-level requests.
- Responsibilities: map UI actions to governed requests and attach required context.
- Inputs: user intent, selected workflow instance, selected action, user-provided fields.
- Outputs: application request.
- Dependencies: Request Validator, Application Service.
- Forbidden Dependencies: repositories, capability implementations, workflow transition mutation.
- Owned Concepts: presentation-to-application request mapping.
- Lifecycle: evolves when presentation actions change.

### View Composer

- Purpose: compose read-ready views from projections and references.
- Responsibilities: prepare display structures for workflow status, artifacts, approvals, warnings, and next actions.
- Inputs: current projection, artifact summaries, validation results, audit summaries.
- Outputs: view model for presentation.
- Dependencies: Application Service, Search, Authorization.
- Forbidden Dependencies: workflow mutation, capability execution, direct artifact modification.
- Owned Concepts: composed user-facing views.
- Lifecycle: evolves as presentation needs change.

### User Interaction Coordinator

- Purpose: coordinate human interaction points without owning workflow.
- Responsibilities: request missing information, present approval gates, collect decisions, and route user responses.
- Inputs: approval requests, missing evidence prompts, validation warnings, user response.
- Outputs: human approval decision, user-supplied information, cancellation request.
- Dependencies: Application Service, Authorization, Audit.
- Forbidden Dependencies: direct transition commit, direct persistence, capability execution.
- Owned Concepts: user interaction flow.
- Lifecycle: evolves with interaction patterns while preserving human authority.

## 5. Application Components

### Application Service

- Purpose: coordinate application-level work between presentation and workflow layers.
- Responsibilities: receive requests, validate intent, invoke workflow execution, return projections, and coordinate response assembly.
- Inputs: application request, user identity, workflow instance reference.
- Outputs: execution result, current projection, validation response, next action.
- Dependencies: Command Coordinator, Request Validator, Response Builder, Workflow Resolver, Authorization.
- Forbidden Dependencies: direct capability implementation, direct state mutation, direct artifact rewriting.
- Owned Concepts: application-level coordination.
- Lifecycle: evolves as supported user actions expand.

### Command Coordinator

- Purpose: coordinate one requested action through validation and workflow invocation.
- Responsibilities: determine command type, prepare execution context, call workflow components, and handle high-level outcomes.
- Inputs: validated request, user identity, policy context.
- Outputs: workflow execution request, command result.
- Dependencies: Request Validator, Workflow Resolver, Policy Engine.
- Forbidden Dependencies: direct repository writes, capability self-selection, approval bypass.
- Owned Concepts: command coordination.
- Lifecycle: evolves with new command types.

### Request Validator

- Purpose: validate request shape and required application-level fields.
- Responsibilities: detect missing inputs, invalid references, unauthorized request shape, and incomplete command context.
- Inputs: application request, user context.
- Outputs: validation result.
- Dependencies: Authorization, Configuration.
- Forbidden Dependencies: workflow transition mutation, capability execution.
- Owned Concepts: request validity.
- Lifecycle: evolves with request contract changes.

### Response Builder

- Purpose: assemble user-facing responses from execution results.
- Responsibilities: format projections, warnings, errors, next actions, and artifact references for presentation.
- Inputs: execution result, projection, validation result, failure record.
- Outputs: response object for presentation.
- Dependencies: View Composer, Audit, Authorization.
- Forbidden Dependencies: workflow mutation, artifact mutation, capability execution.
- Owned Concepts: response assembly.
- Lifecycle: evolves with presentation needs.

## 6. Workflow Components

### Workflow Resolver

- Purpose: resolve the applicable workflow definition and current workflow context.
- Responsibilities: load workflow definition metadata, determine current state contract, and identify legal next evaluations.
- Inputs: workflow instance reference, current projection.
- Outputs: resolved workflow context.
- Dependencies: Workflow Repository, Configuration.
- Forbidden Dependencies: capability implementation, presentation state, direct approval creation.
- Owned Concepts: workflow definition resolution.
- Lifecycle: evolves with workflow definition versions.

### Transition Evaluator

- Purpose: evaluate whether a requested transition is legal.
- Responsibilities: check from-state, to-state, preconditions, gate result, policy constraints, and state invariants.
- Inputs: current state, proposed transition, gate result, policy result.
- Outputs: transition validation result.
- Dependencies: Workflow Resolver, Gate Evaluator, Policy Engine, Workflow Validator.
- Forbidden Dependencies: direct persistence commit, capability implementation.
- Owned Concepts: transition legality evaluation.
- Lifecycle: evolves with transition rules.

### Gate Evaluator

- Purpose: evaluate workflow gate requirements.
- Responsibilities: identify required approval gate, decision options, required evidence, valid outcomes, and resulting transitions.
- Inputs: current state, gate definition, approval record, artifact references.
- Outputs: gate evaluation result.
- Dependencies: Approval Evaluator, Evidence Repository, Policy Engine.
- Forbidden Dependencies: human decision fabrication, approval mutation, capability execution.
- Owned Concepts: gate requirement evaluation.
- Lifecycle: evolves with gate definitions.

### Approval Evaluator

- Purpose: validate approval records against gate requirements.
- Responsibilities: verify approver, decision, timestamp, referenced artifact versions, and gate alignment.
- Inputs: approval record, gate definition, artifact references.
- Outputs: approval validation result.
- Dependencies: Authorization, Audit Repository, Artifact Repository.
- Forbidden Dependencies: approval creation, user interaction, capability execution.
- Owned Concepts: approval validity evaluation.
- Lifecycle: evolves with approval policy changes.

### Workflow Validator

- Purpose: validate workflow integrity and state invariants.
- Responsibilities: confirm legal current state, valid transition path, complete required evidence, no orphan references, and invariant preservation.
- Inputs: workflow instance, transition proposal, artifact references, approval references, evidence references.
- Outputs: workflow validation result.
- Dependencies: Workflow Resolver, Evidence Repository, Artifact Repository, Snapshot Repository.
- Forbidden Dependencies: direct mutation, presentation, capability implementation.
- Owned Concepts: workflow validation.
- Lifecycle: evolves with workflow rules.

## 7. Capability Components

### Capability Registry

- Purpose: maintain capability metadata and versions.
- Responsibilities: register capabilities, track status, supported workflow states, supported artifact types, compatibility, and lifecycle.
- Inputs: capability definition, capability version, status update.
- Outputs: capability metadata, compatibility result.
- Dependencies: Configuration, Policy Engine.
- Forbidden Dependencies: workflow transition mutation, artifact mutation, direct capability execution.
- Owned Concepts: capability metadata.
- Lifecycle: draft, registered, enabled, deprecated, retired.

### Capability Resolver

- Purpose: select the eligible capability for a workflow state and requested action.
- Responsibilities: evaluate workflow allowance, capability availability, compatibility, policy constraints, and version selection.
- Inputs: resolved workflow context, requested action, capability metadata, artifact references.
- Outputs: resolved capability execution plan.
- Dependencies: Capability Registry, Workflow Resolver, Policy Engine.
- Forbidden Dependencies: capability self-selection, direct implementation invocation, workflow mutation.
- Owned Concepts: capability resolution.
- Lifecycle: evolves with capability selection policy.

### Capability Executor

- Purpose: coordinate execution of a resolved capability through an adapter.
- Responsibilities: pass approved inputs, enforce execution boundaries, receive structured outputs, and return execution result.
- Inputs: resolved capability execution plan, approved inputs, execution context.
- Outputs: capability execution result, output artifact references, failure record.
- Dependencies: Capability Adapter, Capability Validator, Observability.
- Forbidden Dependencies: workflow state mutation, direct persistence commit, approval creation.
- Owned Concepts: bounded capability execution coordination.
- Lifecycle: evolves with execution policies.

### Capability Adapter

- Purpose: isolate capability implementation from orchestration.
- Responsibilities: translate approved execution context into implementation-specific execution and return structured output.
- Inputs: approved capability inputs, execution policies, correlation context.
- Outputs: structured capability output, execution metadata, failure record.
- Dependencies: Model Gateway where model-facing execution is permitted, Configuration, Observability.
- Forbidden Dependencies: Workflow Repository writes, approval mutation, direct transition commit.
- Owned Concepts: implementation boundary.
- Lifecycle: evolves or is replaced without changing capability contracts.

### Capability Validator

- Purpose: validate capability inputs and outputs.
- Responsibilities: verify required inputs, artifact versions, output structure, evidence references, policy compliance, and forbidden action absence.
- Inputs: capability contract, input artifacts, output artifacts, execution metadata.
- Outputs: capability validation result.
- Dependencies: Artifact Repository, Evidence Repository, Policy Engine.
- Forbidden Dependencies: output rewriting, evidence fabrication, workflow mutation.
- Owned Concepts: capability validation.
- Lifecycle: evolves with contracts and validation rules.

## 8. Persistence Components

### Workflow Repository

- Purpose: persist and retrieve Workflow Instances and workflow definition references.
- Responsibilities: provide authoritative workflow instance state and current projection references.
- Inputs: workflow instance reference, transition record, snapshot reference.
- Outputs: workflow instance, current projection, version metadata.
- Dependencies: Authorization, Audit.
- Forbidden Dependencies: capability execution, workflow rule definition, approval decision creation.
- Owned Concepts: workflow instance persistence access.
- Lifecycle: evolves with persistence requirements.

### Artifact Repository

- Purpose: persist and retrieve artifact references and artifact versions.
- Responsibilities: preserve artifact identity, type, lifecycle status, version, producer, and approval status.
- Inputs: artifact registration, artifact reference, artifact version.
- Outputs: artifact metadata, artifact version reference.
- Dependencies: Authorization, Audit.
- Forbidden Dependencies: workflow transition decisions, evidence fabrication, content rewriting.
- Owned Concepts: artifact persistence access.
- Lifecycle: evolves with artifact model changes.

### Evidence Repository

- Purpose: persist and retrieve evidence references.
- Responsibilities: maintain evidence chain references, versioning, approval status, traceability, and authority markers.
- Inputs: evidence reference, evidence chain, validation result.
- Outputs: evidence record, evidence chain.
- Dependencies: Authorization, Audit.
- Forbidden Dependencies: memory substitution, approval creation, artifact content mutation.
- Owned Concepts: evidence persistence access.
- Lifecycle: evolves with evidence model changes.

### Snapshot Repository

- Purpose: persist and retrieve immutable Workflow Instance snapshots.
- Responsibilities: store point-in-time references to state, artifacts, approvals, executions, transitions, and timestamp.
- Inputs: snapshot record, workflow instance reference.
- Outputs: snapshot, snapshot sequence.
- Dependencies: Workflow Repository, Audit.
- Forbidden Dependencies: snapshot mutation, workflow transition evaluation, capability execution.
- Owned Concepts: snapshot persistence access.
- Lifecycle: evolves with snapshot requirements.

### Audit Repository

- Purpose: persist and retrieve audit records.
- Responsibilities: preserve actor, timestamp, transition, reason, artifacts, evidence, approvals, failures, and execution references.
- Inputs: audit record, execution metadata, transition record.
- Outputs: audit record, audit trail.
- Dependencies: Authorization, Observability.
- Forbidden Dependencies: workflow rule evaluation, capability implementation, approval decision creation.
- Owned Concepts: audit persistence access.
- Lifecycle: evolves with audit requirements.

## 9. Platform Components

### Identity

- Purpose: identify human and system actors.
- Responsibilities: provide actor identity to authorization, audit, workflow, and application components.
- Inputs: actor reference.
- Outputs: actor identity.
- Dependencies: Configuration.
- Forbidden Dependencies: workflow mutation, artifact mutation, capability execution.
- Owned Concepts: actor identity.
- Lifecycle: evolves with identity needs.

### Authorization

- Purpose: determine whether an actor may perform an action or access a resource.
- Responsibilities: evaluate access to workflow instances, artifacts, evidence, approvals, audit records, and execution actions.
- Inputs: actor identity, action, resource reference.
- Outputs: authorization decision.
- Dependencies: Identity, Policy Engine.
- Forbidden Dependencies: workflow transition creation, capability execution, artifact rewriting.
- Owned Concepts: access decisions.
- Lifecycle: evolves with policy requirements.

### Policy Engine

- Purpose: evaluate governed policies.
- Responsibilities: evaluate approval, privacy, execution, retry, extension, and eligibility policies.
- Inputs: policy context, actor, workflow state, requested action, artifact references.
- Outputs: policy decision.
- Dependencies: Configuration, Authorization.
- Forbidden Dependencies: direct workflow mutation, artifact mutation, approval creation.
- Owned Concepts: policy evaluation.
- Lifecycle: evolves with policy definitions.

### Configuration

- Purpose: provide governed configuration.
- Responsibilities: supply settings, thresholds, defaults, feature availability, and component configuration.
- Inputs: configuration request.
- Outputs: configuration value or configuration set.
- Dependencies: Authorization.
- Forbidden Dependencies: workflow state mutation, evidence modification.
- Owned Concepts: configuration access.
- Lifecycle: evolves through controlled configuration change.

### Observability

- Purpose: record runtime visibility.
- Responsibilities: capture runtime session, correlation ID, execution ID, duration, outcome, failure, retry count, and validation status.
- Inputs: execution metadata, validation result, failure record.
- Outputs: observability record.
- Dependencies: Audit Repository.
- Forbidden Dependencies: workflow decision creation, approval creation, artifact mutation.
- Owned Concepts: operational visibility.
- Lifecycle: evolves with monitoring needs.

### Notification

- Purpose: surface permitted alerts or reminders.
- Responsibilities: notify human users about required attention without causing workflow progression.
- Inputs: notification request, actor, message context.
- Outputs: notification result.
- Dependencies: Authorization, Policy Engine, Scheduling.
- Forbidden Dependencies: workflow transition mutation, approval inference, external action without approval.
- Owned Concepts: notification delivery coordination.
- Lifecycle: evolves with communication policies.

### Scheduling

- Purpose: coordinate time-based execution requests and reminders.
- Responsibilities: manage deferred execution, review cadence, reminders, and scheduled checks.
- Inputs: schedule request, policy context, workflow reference.
- Outputs: scheduled action reference.
- Dependencies: Policy Engine, Authorization.
- Forbidden Dependencies: direct workflow progression, approval inference, capability chaining.
- Owned Concepts: scheduling coordination.
- Lifecycle: evolves with timing policies.

### Search

- Purpose: retrieve authorized references across approved information.
- Responsibilities: search workflow projections, artifacts, evidence, audit records, and configuration where authorized.
- Inputs: search query, actor, scope.
- Outputs: authorized search results.
- Dependencies: Authorization, Artifact Repository, Evidence Repository, Audit Repository.
- Forbidden Dependencies: workflow mutation, evidence alteration, memory override.
- Owned Concepts: authorized retrieval.
- Lifecycle: evolves with retrieval needs.

### Model Gateway

- Purpose: provide a governed boundary for model-facing execution.
- Responsibilities: isolate model-assisted implementations behind approved capability adapters and policies.
- Inputs: approved capability input, policy context, execution context.
- Outputs: model-facing execution result to adapter.
- Dependencies: Capability Adapter, Policy Engine, Observability.
- Forbidden Dependencies: workflow state mutation, approval bypass, evidence fabrication, direct artifact registration.
- Owned Concepts: model-facing boundary.
- Lifecycle: evolves with model implementation choices while preserving contracts.

### Secrets

- Purpose: protect sensitive credentials or tokens where future integrations require them.
- Responsibilities: provide authorized secret access to approved components under policy.
- Inputs: authorized secret request.
- Outputs: secret access result.
- Dependencies: Authorization, Policy Engine, Audit.
- Forbidden Dependencies: business decision-making, workflow mutation, artifact mutation.
- Owned Concepts: secret access boundary.
- Lifecycle: evolves with integration needs.

## 10. Integration Components

### External Connector

- Purpose: isolate external service interaction.
- Responsibilities: exchange information with external services only through approved boundaries and policies.
- Inputs: approved integration request, authorization decision, policy context.
- Outputs: integration result, failure record.
- Dependencies: Authorization, Policy Engine, Observability.
- Forbidden Dependencies: workflow bypass, unapproved external action, artifact mutation without registration.
- Owned Concepts: external interaction boundary.
- Lifecycle: evolves with external integration requirements.

### Import Coordinator

- Purpose: coordinate governed import of external information.
- Responsibilities: validate source material, classify information, create artifact registration requests, and preserve provenance.
- Inputs: external source reference, imported content, actor.
- Outputs: import result, artifact registration request, provenance reference.
- Dependencies: Artifact Repository, Evidence Repository, Policy Engine, Authorization.
- Forbidden Dependencies: evidence fabrication, workflow progression, approval creation.
- Owned Concepts: import coordination.
- Lifecycle: evolves with source types.

### Export Coordinator

- Purpose: coordinate governed export of approved artifacts.
- Responsibilities: prepare approved artifacts for external use, verify approvals, preserve references, and record audit.
- Inputs: approved artifact reference, export request, actor.
- Outputs: export result, audit reference.
- Dependencies: Artifact Repository, Approval Evaluator, Audit Repository, Authorization.
- Forbidden Dependencies: content rewriting, approval bypass, external submission without approval.
- Owned Concepts: export coordination.
- Lifecycle: evolves with export needs.

### Document Renderer

- Purpose: render approved document artifacts without changing business meaning.
- Responsibilities: transform approved artifacts into readable or exportable formats while preserving content, chronology, metrics, links, and evidence references.
- Inputs: approved document artifact, rendering policy.
- Outputs: rendered document artifact or rendering result.
- Dependencies: Artifact Repository, Policy Engine, Validation Engine.
- Forbidden Dependencies: claim rewriting, metric changes, chronology changes, evidence changes.
- Owned Concepts: document rendering.
- Lifecycle: evolves with rendering requirements.

### Model Integration

- Purpose: isolate model-facing implementation details behind the Model Gateway.
- Responsibilities: execute approved model-facing work under capability adapter control and policy constraints.
- Inputs: approved model request, execution context, policy context.
- Outputs: structured model result.
- Dependencies: Model Gateway, Observability.
- Forbidden Dependencies: workflow mutation, direct persistence, approval decisions, evidence authority.
- Owned Concepts: model implementation boundary.
- Lifecycle: evolves independently when contracts are preserved.

## 11. Component Dependency Rules

Allowed dependencies follow the Solution Architecture dependency direction:

```text
Presentation
    ↓
Application
    ↓
Workflow
    ↓
Capability
    ↓
Platform
    ↓
Persistence
```

Dependency rules:

- Components may depend only on lower layers, shared contracts, and approved platform services.
- Workflow components may depend on capability contracts and metadata, not capability implementations.
- Capability components may depend on approved inputs, adapters, validators, and platform services.
- Persistence components may not depend on presentation, application, workflow, or capability execution behavior.
- Platform components must not own business workflow semantics.
- Integration components must remain behind authorization, policy, evidence, and audit boundaries.
- Cyclic dependencies are prohibited.
- Direct persistence access from Presentation components is prohibited.
- Direct capability execution from Presentation components is prohibited.
- Direct workflow state mutation from Capability components is prohibited.
- Direct approval creation by non-human or unauthorized components is prohibited.

## 12. Component Collaboration Rules

Components collaborate through explicit requests, references, validation results, policy decisions, projections, and audit records.

Collaboration rules:

- Ownership remains with the owning component.
- Components exchange references instead of duplicating authoritative records.
- Components validate inputs before acting.
- Components return structured outputs.
- Components do not infer approvals from conversation, silence, or missing data.
- Components do not silently advance workflow state.
- Components do not call forbidden dependencies.
- Components must preserve auditability for consequential actions.
- Components must preserve privacy and authorization boundaries.
- Components must stop safely when required evidence, approvals, or policies are missing.

Allowed collaboration examples:

- UI sends user intent to Application Service.
- Application Service invokes Workflow Resolver through Command Coordinator.
- Orchestrator uses Capability Resolver to select an eligible capability.
- Capability Executor invokes Capability Adapter.
- Capability Validator validates capability outputs.
- Workflow Validator verifies transition legality.
- Audit Service records transition and execution history.
- Repositories persist architectural truth.

Forbidden collaboration examples:

- Capability directly commits a workflow transition.
- UI directly writes to Workflow Repository.
- Model Integration directly registers artifacts.
- Notification infers human approval.
- Memory overrides evidence.
- Search modifies artifacts.
- Repository directs workflow progression.

## 13. Extension Model

**Adding Components**  
New components require purpose, responsibilities, inputs, outputs, dependencies, forbidden dependencies, owned concepts, lifecycle, validation requirements, and architecture approval.

**Replacing Components**  
Replacement is allowed when the component contract, owned concepts, dependency rules, collaboration rules, validation behavior, audit behavior, and privacy boundaries remain intact.

**Deprecating Components**  
Deprecation requires owner approval, migration path, compatibility review, dependent component review, validation plan, and retirement criteria.

**Version Evolution**  
Version changes must identify compatibility impact, changed responsibilities, dependency impact, validation impact, and rollback considerations.

Extensions must not redefine workflow legality, bypass approvals, weaken evidence authority, mutate immutable history, or introduce cyclic dependencies.

## 14. Architectural Principles

- Components implement architecture.
- Components never redefine architecture.
- One component owns one concern.
- Ownership is explicit and deterministic.
- Components collaborate through stable contracts and references.
- Dependency direction is explicit and acyclic.
- Presentation never owns workflow state.
- Application services coordinate intent but do not own workflow legality.
- Workflow components own legal execution evaluation.
- Capability components transform approved inputs only.
- Persistence components preserve architectural truth.
- Platform components provide shared services, not business capabilities.
- Integration components isolate external systems.
- Evidence remains authoritative.
- Memory remains assistive.
- Audit remains mandatory.
- Human approval remains required for consequential decisions.
- Technology choices must preserve component contracts.
