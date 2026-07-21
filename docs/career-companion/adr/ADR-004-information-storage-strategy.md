# ADR-004: Information Storage Strategy

## Status

Accepted

## Date

2026-07-21

## Authors

- Career Companion Architecture

## Decision Category

Information Architecture / Storage

## Context

Career Companion has a frozen architectural baseline and three accepted ADRs. ADR-001 defines aggregate-owned persistence and repository strategy. ADR-002 defines runtime execution strategy. ADR-003 defines stateless governed workflow coordination.

The platform now needs an implementation-governing information storage strategy that classifies information by architectural role. Different kinds of information have different authority, lifecycle, mutability, versioning, durability, and recovery needs. Treating all information as the same kind of persisted data would weaken evidence authority, immutable history, cache safety, memory boundaries, and search reliability.

This ADR defines storage roles and information classes. It does not select storage products, vendors, infrastructure, frameworks, or implementation code.

## Problem Statement

Career Companion must store workflow state, artifacts, evidence, audit records, search material, caches, advisory memory, and configuration without confusing their authority or lifecycle.

The problem is not where information is stored. The problem is how each class of information should be treated architecturally:

- Which information is authoritative.
- Which information is derived.
- Which information is disposable.
- Which information is immutable.
- Which information may evolve.
- Which information supports recovery.
- Which information may assist execution but never authorize it.

Without a canonical information storage strategy, future implementation could let search become authoritative, cache become durable truth, memory override evidence, audit records become mutable, or configuration behave like business state.

## Decision

Career Companion will use an information-class-driven storage strategy.

Information storage is governed by architectural characteristics rather than technology. Each information class has a defined purpose, authority, lifecycle, durability, versioning, mutability, and recovery expectation.

Storage boundaries must preserve the existing authority model:

- Workflow governs.
- Workflow Instance records.
- Evidence authorizes.
- Artifacts carry business information.
- Audit preserves history.
- Search is derived.
- Cache is disposable.
- Advisory memory is never authoritative.
- Configuration constrains behavior but does not become business state.

## 1. Storage Philosophy

Storage exists to preserve the meaning, authority, and lifecycle of information.

Storage must not redefine workflow behavior, evidence authority, approval requirements, business rules, runtime execution, or capability behavior. Storage serves architecture.

Career Companion stores information according to information class:

- Authoritative information must be durable, versioned where needed, protected, and recoverable.
- Immutable information must not be rewritten after approval or audit creation.
- Derived information must be reproducible from authoritative sources.
- Disposable information may be safely discarded and recreated.
- Advisory information may assist execution but cannot authorize decisions.
- Configuration may guide execution but cannot replace policy, evidence, approval, or workflow validation.

## 2. Information Classification

### Transactional Business State

- Purpose: preserve current and historical business execution state.
- Authority: authoritative for workflow execution when persisted through the owning aggregate and repository.
- Lifecycle: created, active, waiting, blocked, completed, archived.
- Durability: durable.
- Versioning: required through aggregate versions and expected-version checks.
- Mutability: mutable only through governed transitions and repository-owned writes.
- Recovery expectations: must support recovery to the latest valid Workflow Instance projection and transition history.

Examples include Workflow Instance state, current gate, instance status, terminal outcome, and transition references.

### Immutable Business Artifacts

- Purpose: preserve versioned business outputs and inputs used by workflow execution.
- Authority: authoritative for business content when validated, registered, and approved where required.
- Lifecycle: draft, validated, approved, superseded, archived.
- Durability: durable.
- Versioning: required.
- Mutability: draft versions may evolve; approved versions are immutable.
- Recovery expectations: recovery must reference exact artifact versions and preserve approved history.

Examples include job description snapshots, strategy artifacts, resume artifacts, QA artifacts, and other approved workflow outputs.

### Evidence

- Purpose: authorize decisions, claims, recommendations, approvals, and transitions.
- Authority: authoritative when validated and approved where required.
- Lifecycle: created, validated, approved, immutable, archived.
- Durability: durable.
- Versioning: required.
- Mutability: immutable after approval.
- Recovery expectations: recovery must preserve evidence chains and must not substitute memory, search, or cache for evidence.

Evidence includes references to artifacts, approvals, capability executions, snapshots, audit records, and external document references.

### Audit

- Purpose: preserve consequential execution history.
- Authority: authoritative for historical execution facts.
- Lifecycle: appended, retained, archived.
- Durability: durable.
- Versioning: append sequence or record identity required.
- Mutability: append-only.
- Recovery expectations: recovery must preserve failed attempts, actor, timestamp, reason, transition, evidence references, and recovery actions.

Audit records must not be edited to hide previous reasoning, failures, or decisions.

### Search

- Purpose: support retrieval, navigation, discovery, and review across authorized information.
- Authority: derived, never authoritative.
- Lifecycle: generated, refreshed, rebuilt, retired.
- Durability: optional based on operational needs.
- Versioning: tied to source versions or refresh metadata.
- Mutability: mutable and rebuildable.
- Recovery expectations: search can be rebuilt from authoritative sources and must not be required for recovery.

Search results may assist discovery but must not authorize workflow transitions or evidence claims.

### Cache

- Purpose: improve execution or retrieval efficiency.
- Authority: none; cache is disposable.
- Lifecycle: created, refreshed, expired, invalidated, discarded.
- Durability: not required.
- Versioning: optional and used only for invalidation or freshness.
- Mutability: mutable and disposable.
- Recovery expectations: cache must not be required for recovery and may be discarded at any time.

Cache must never become business truth.

### Advisory Memory

- Purpose: assist execution with scoped context, preferences, prior observations, or learned patterns.
- Authority: advisory only.
- Lifecycle: created, referenced, updated, expired, archived.
- Durability: governed by memory scope and retention policy.
- Versioning: required where memory changes affect traceability or review.
- Mutability: mutable within governed memory rules.
- Recovery expectations: recovery must not depend solely on advisory memory.

Advisory memory may influence recommendations but cannot authorize decisions, replace evidence, approve gates, mutate artifacts, or determine workflow state.

### Configuration

- Purpose: provide governed settings, defaults, thresholds, policy references, and component availability.
- Authority: authoritative for configuration values within its defined scope, not for business state.
- Lifecycle: proposed, active, superseded, retired.
- Durability: durable.
- Versioning: required for governed configuration.
- Mutability: mutable only through approved configuration change.
- Recovery expectations: recovery must know which configuration version applied to consequential execution where configuration affected behavior.

Configuration constrains execution but does not substitute for workflow, evidence, approval, or policy validation.

## 3. Storage Responsibilities

Storage owns:

- Durable preservation of authoritative information classes.
- Version identity and lifecycle status where required.
- Immutability enforcement for approved artifacts, evidence, snapshots, and audit.
- Derived information refresh boundaries.
- Disposable cache invalidation boundaries.
- Reference integrity between information classes.
- Recovery support from authoritative records.
- Access to the correct version of information.

Storage never owns:

- Workflow legality.
- Workflow transitions.
- Capability behavior.
- Human approval decisions.
- Evidence interpretation.
- Business rule creation.
- Runtime execution.
- Orchestration.
- Coordination.
- User interaction.
- Memory authority.

Storage preserves information. It does not decide what the information means beyond its storage class and lifecycle rules.

## 4. Information Lifecycles

Transactional Business State lifecycle:

```text
Created
    ↓
Active
    ↓
Waiting | Blocked | Paused
    ↓
Completed
    ↓
Archived
```

Immutable Business Artifact lifecycle:

```text
Draft
    ↓
Validated
    ↓
Approved
    ↓
Superseded
    ↓
Archived
```

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

Audit lifecycle:

```text
Appended
    ↓
Retained
    ↓
Archived
```

Search lifecycle:

```text
Generated
    ↓
Refreshed
    ↓
Rebuilt
    ↓
Retired
```

Cache lifecycle:

```text
Created
    ↓
Refreshed
    ↓
Expired | Invalidated
    ↓
Discarded
```

Advisory Memory lifecycle:

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

Configuration lifecycle:

```text
Proposed
    ↓
Active
    ↓
Superseded
    ↓
Retired
```

## 5. Storage Principles

- One authoritative storage boundary per information class.
- Authoritative information is durable.
- Derived information is reproducible.
- Search is derived.
- Cache is disposable.
- Advisory memory is never authoritative.
- Audit is append-only.
- Evidence is immutable after approval.
- Approved artifact versions are immutable.
- Configuration is versioned and governed.
- Runtime Sessions are not business storage.
- Recovery uses authoritative records, not cache, search, or memory.
- Storage does not create workflow authority.
- Storage does not create approval authority.
- Storage does not create evidence authority.
- Cross-class references use exact IDs and versions where authority matters.

## 6. Future Technology Mapping

Future implementation may map information classes to storage capability categories. This ADR does not select technologies.

Storage capability categories include:

- Transactional state storage for aggregate-owned business state.
- Immutable artifact storage for approved versioned business artifacts.
- Evidence record storage for evidence chains and authority references.
- Append-only history storage for audit records.
- Derived retrieval storage for search indexes.
- Ephemeral acceleration storage for cache.
- Governed memory storage for scoped advisory memory.
- Versioned configuration storage for governed settings.

Technology selection must preserve the authority, lifecycle, durability, versioning, mutability, and recovery expectations of each information class.

## Alternatives Considered

### Alternative A: Single Storage Model

All information would be treated as one kind of stored record with similar lifecycle and authority.

Decision: Rejected.

Reason: It blurs the difference between authoritative state, immutable evidence, append-only audit, derived search, disposable cache, advisory memory, and governed configuration.

### Alternative B: Information-Class-Driven Storage

Information is classified by architectural role, authority, lifecycle, durability, versioning, mutability, and recovery needs.

Decision: Accepted.

Reason: It preserves evidence authority, audit immutability, cache disposability, search derivation, memory boundaries, and configuration governance while remaining technology-neutral.

### Alternative C: Technology-First Storage Design

Storage decisions would begin with preferred tools or products and then map architecture into them.

Decision: Rejected.

Reason: It risks distorting architecture around implementation convenience and may weaken storage semantics for evidence, audit, recovery, and memory.

## Trade-offs

### Advantages

- Clear authority boundaries.
- Better recovery reliability.
- Stronger evidence and audit protection.
- Safer use of search, cache, and memory.
- More deliberate technology selection later.
- Stronger alignment with ADR-001 repository ownership.

### Disadvantages

- Requires more careful storage design.
- Future implementation must maintain multiple information-class semantics.
- Developers must avoid treating all stored data as equivalent.

### Operational Impact

Operational review can distinguish authoritative records from derived, disposable, or advisory information. Recovery procedures can rely on durable sources and ignore cache or search where necessary.

### Development Impact

Developers must map information to the correct class before implementing storage behavior. Convenience use of cache, search, or memory as truth is prohibited.

### Testing Impact

Tests must verify immutability, append-only audit behavior, cache disposability, search rebuildability, memory non-authority, configuration versioning, and recovery from authoritative sources.

## Consequences

### Positive

- Information authority remains explicit.
- Evidence and audit semantics are protected.
- Derived and disposable stores cannot accidentally become truth.
- Future technology mapping can happen without changing architecture.
- Recovery can be tested against authoritative records.

### Negative

- More upfront classification work is required.
- Implementation must enforce different lifecycle rules per information class.
- Future migrations must preserve class-specific semantics.

### Future Implications

Future technology ADRs must map selected storage mechanisms to these information classes and explain how each class's authority, lifecycle, durability, versioning, mutability, and recovery expectations are preserved.

## Architecture Principles Impact

This ADR reinforces the Career Companion Architecture Principles:

- Workflow Governance: transactional business state remains authoritative for execution only through governed records.
- Evidence Authority: evidence remains immutable and authoritative.
- Human Approval: approval-related records remain durable and traceable through authoritative storage.
- Immutable Artifacts: approved artifact versions are protected from mutation.
- Deterministic Recovery: recovery uses authoritative records, snapshots, evidence, and audit rather than search, cache, or memory.
- Single Ownership: each information class has a defined storage role and authority boundary.
- Audit: audit is append-only and durable.
- Replaceability: future technologies may change if information-class semantics are preserved.

## Affected Components

- Workflow Repository.
- Artifact Repository.
- Evidence Repository.
- Snapshot Repository.
- Audit Repository.
- Policy Repository.
- Capability Repository.
- Search.
- Configuration.
- Memory.
- Runtime.
- Orchestrator.
- Recovery Coordinator.
- Validation Engine.
- Policy Engine.
- Authorization.
- Observability.

## Migration Considerations

This ADR defines baseline storage semantics before implementation. Future migration must preserve information class identity, authority, lifecycle, versioning, immutability, and recovery expectations.

Migration must not convert authoritative records into derived records, treat cache as truth, treat memory as evidence, rewrite audit history, or mutate approved artifacts.

## Operational Considerations

Operational checks should verify:

- Transactional business state remains authoritative.
- Search can be rebuilt from authoritative sources.
- Cache can be discarded safely.
- Advisory memory is not used as evidence.
- Evidence is immutable after approval.
- Audit records are append-only.
- Configuration changes are versioned.
- Recovery does not depend on search, cache, or memory.

Operational review should focus on information authority, lifecycle correctness, privacy impact, and recovery readiness.

## Future Review Criteria

This ADR should be reviewed if:

- A new information class is introduced.
- Existing information classes become ambiguous.
- Recovery requires information currently treated as derived, disposable, or advisory.
- Search, cache, or memory begins to influence authoritative decisions.
- Evidence or audit immutability creates an operational defect.
- Future technology selection cannot preserve information-class semantics.
- Architecture Principles are updated in a way that changes storage expectations.

## References

- [Architecture Principles](../architecture-principles.md)
- [ADR Framework](../adr-framework.md)
- [ADR-001: Persistence Model & Repository Strategy](ADR-001-persistence-model-and-repository-strategy.md)
- [ADR-002: Runtime Execution Strategy](ADR-002-runtime-execution-strategy.md)
- [ADR-003: Workflow Coordination Strategy](ADR-003-workflow-coordination-strategy.md)
- [Persistence Architecture](../persistence-architecture.md)
- [Memory & Evidence Architecture](../memory-evidence-architecture.md)
- [Artifact Model](../artifact-model.md)
- [Workflow Instance](../workflow-instance.md)
- [Reference Architecture](../reference-architecture.md)
- [Solution Architecture](../solution-architecture.md)
- [Component Architecture](../component-architecture.md)
