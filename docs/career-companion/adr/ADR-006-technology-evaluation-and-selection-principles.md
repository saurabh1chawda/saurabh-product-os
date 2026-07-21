# ADR-006: Technology Evaluation & Selection Principles

## Status

Accepted

## Date

2026-07-21

## Authors

- Career Companion Architecture

## Decision Category

Technology Governance

## Context

Career Companion architecture is frozen. ADR-001 through ADR-005 define persistence, runtime execution, workflow coordination, information storage, and platform services strategies without selecting technologies.

Future ADRs will select concrete technologies. Those decisions must not be preference-driven, vendor-driven, or implementation-first. Technology must serve the architecture, preserve governance, and remain replaceable where contracts permit.

This ADR defines how technologies are evaluated and selected. It does not select products, vendors, frameworks, infrastructure, cloud providers, or implementation code.

## Problem Statement

Career Companion needs a repeatable technology selection process that protects the frozen architecture from accidental technology-led redesign.

Without this ADR, future technology decisions could optimize for familiarity, novelty, vendor preference, short-term convenience, or local implementation speed while weakening workflow governance, evidence authority, persistence boundaries, platform service contracts, privacy, observability, recovery, and replaceability.

The decision needed is: what principles, evaluation criteria, decision hierarchy, capability verification, lifecycle, and scoring model govern future technology selection ADRs.

## Decision

Career Companion will use architecture-driven technology evaluation.

Every future technology selection ADR must prove compatibility with the Architecture Principles and prior architectural ADRs before the technology is approved. Technology may be selected only after responsibilities, capabilities, constraints, and governance needs are understood.

## 1. Technology Philosophy

Technology serves architecture.

Career Companion must choose technology to preserve architectural intent, not to reshape the architecture around implementation convenience. A technology is acceptable only when it can support the required responsibilities, contracts, governance, privacy, security, recovery, observability, and lifecycle expectations.

Technology selection must remain:

- Architecture-led.
- Principle-compliant.
- Capability-verified.
- Replaceability-aware.
- Operationally honest.
- Privacy-conscious.
- Security-conscious.
- Testable.
- Reversible where practical.

## 2. Technology Selection Principles

- Architecture before technology.
- Governance before convenience.
- Responsibilities before tooling.
- Capability fit before preference.
- Contracts before implementation.
- Evidence before enthusiasm.
- Replaceability before lock-in.
- Operational simplicity before unnecessary sophistication.
- Security and privacy by design.
- Testability as a selection requirement.
- Cost awareness without cost-only decision-making.
- Migration path before adoption.
- Deprecation path before production dependence.

## 3. Mandatory Evaluation Criteria

Future technology ADRs must evaluate at minimum:

### Architecture Alignment

Does the technology preserve the frozen architecture, ADR-001 through ADR-005, and Architecture Principles?

### Governance Compatibility

Can the technology support workflow gates, human approvals, audit, evidence authority, policies, and operational review?

### Replaceability

Can the technology be replaced while preserving contracts, data semantics, interfaces, and operational behavior?

### Maintainability

Can the system be maintained by the expected operator and future contributors without excessive complexity?

### Scalability

Can the technology support plausible future scale without forcing premature complexity?

### Security

Can it support least privilege, access control, secret handling, safe defaults, and auditability?

### Privacy

Can it support private-by-default operation, data minimization, controlled retention, and sensitive information boundaries?

### Performance

Can it meet expected latency, throughput, and resource needs without weakening correctness?

### Operational Simplicity

Can it be operated, diagnosed, recovered, and upgraded with reasonable effort?

### Vendor Lock-in

What lock-in exists, and is it acceptable given the value and migration path?

### Cost

What cost profile is expected across development, operation, scaling, migration, and maintenance?

### Community

Is the ecosystem healthy enough to support long-term use, knowledge transfer, and issue resolution?

### Migration Complexity

How difficult would adoption, rollback, replacement, or data migration be?

### Testability

Can architecture compliance, failure behavior, recovery, security, privacy, and contract behavior be tested?

## 4. Decision Hierarchy

Future technology decisions must follow this hierarchy:

```text
Architecture
    ↓
Principles
    ↓
Responsibilities
    ↓
Capabilities
    ↓
Technology
    ↓
Implementation
```

Decision rules:

- Architecture defines what must remain true.
- Principles define what cannot be compromised.
- Responsibilities define ownership and boundaries.
- Capabilities define required behavior.
- Technology is selected only after the above are clear.
- Implementation follows the accepted technology decision.

## 5. Capability Verification

Every future technology selection ADR must prove compatibility with:

- Architecture Principles.
- ADR-001 Persistence Model & Repository Strategy.
- ADR-002 Runtime Execution Strategy.
- ADR-003 Workflow Coordination Strategy.
- ADR-004 Information Storage Strategy.
- ADR-005 Platform Services Strategy.
- Relevant architecture documents for the affected area.

Capability verification must show:

- Required responsibilities supported.
- Forbidden responsibilities avoided.
- Contract compatibility.
- Failure behavior.
- Recovery behavior.
- Security and privacy behavior.
- Observability behavior.
- Migration and rollback considerations.
- Testing approach.

If compatibility cannot be demonstrated, the technology must not be accepted.

## 6. Technology Categories

Future evaluations may consider technology categories such as:

- Runtime execution capability.
- Persistence capability.
- Information storage capability.
- Search and retrieval capability.
- Advisory memory capability.
- Evidence and audit capability.
- Identity and access capability.
- Configuration and policy capability.
- Document rendering capability.
- Model boundary capability.
- Observability and diagnostics capability.
- Scheduling and notification capability.
- Development and validation capability.

These are evaluation categories only. This ADR does not select technologies for any category.

## 7. Evaluation Workflow

Technology evaluation follows a repeatable process:

```text
Identify Need
    ↓
Define Architectural Responsibility
    ↓
Define Required Capabilities
    ↓
Identify Constraints
    ↓
Identify Candidate Technologies
    ↓
Evaluate Against Mandatory Criteria
    ↓
Score Evaluation Matrix
    ↓
Document Trade-offs
    ↓
Review Architecture Principles Impact
    ↓
Review Compatibility With Prior ADRs
    ↓
Define Migration and Rollback Considerations
    ↓
Decision Review
    ↓
Accept, Reject, or Defer
```

Evaluation rules:

- Do not begin with a preferred product.
- Do not skip alternatives.
- Do not hide trade-offs.
- Do not approve a technology that violates non-negotiable principles.
- Do not use implementation effort alone as the deciding factor.

## 8. Technology Lifecycle

Technology lifecycle:

```text
Candidate
    ↓
Evaluated
    ↓
Approved
    ↓
Implemented
    ↓
Operational
    ↓
Deprecated
    ↓
Retired
```

Lifecycle definitions:

- Candidate: identified for evaluation.
- Evaluated: assessed against mandatory criteria.
- Approved: accepted through an ADR.
- Implemented: integrated into the system.
- Operational: used in active operation.
- Deprecated: no longer preferred for new use.
- Retired: removed from active use.

Lifecycle rules:

- Approval requires an accepted ADR.
- Operational use requires validation.
- Deprecation requires migration guidance.
- Retirement requires proof that dependent behavior is no longer relying on the technology.

## 9. Technology Principles

- Technology must preserve architecture.
- Technology must not create hidden workflow paths.
- Technology must not weaken evidence authority.
- Technology must not bypass human approvals.
- Technology must not obscure audit history.
- Technology must not make recovery non-deterministic.
- Technology must not force shared mutable state where isolation is required.
- Technology must not turn derived information into authoritative truth.
- Technology must be testable.
- Technology must be observable.
- Technology must be replaceable where contracts require it.
- Technology selection must include migration and retirement thinking.

## 10. Technology Evaluation Matrix Template

Future technology ADRs must include an evaluation matrix. Suggested scoring:

- 5: Strong fit with low risk.
- 4: Good fit with manageable risk.
- 3: Acceptable fit with known trade-offs.
- 2: Weak fit requiring mitigation.
- 1: Poor fit or significant risk.
- 0: Not compatible.

| Criterion | Weight | Candidate A Score | Candidate B Score | Candidate C Score | Evidence / Notes |
| --- | ---: | ---: | ---: | ---: | --- |
| Architecture Alignment | High |  |  |  |  |
| Governance Compatibility | High |  |  |  |  |
| Replaceability | High |  |  |  |  |
| Maintainability | High |  |  |  |  |
| Scalability | Medium |  |  |  |  |
| Security | High |  |  |  |  |
| Privacy | High |  |  |  |  |
| Performance | Medium |  |  |  |  |
| Operational Simplicity | High |  |  |  |  |
| Vendor Lock-in | Medium |  |  |  |  |
| Cost | Medium |  |  |  |  |
| Community | Medium |  |  |  |  |
| Migration Complexity | High |  |  |  |  |
| Testability | High |  |  |  |  |

Matrix rules:

- Scores must include evidence or rationale.
- High-weight criteria cannot be ignored.
- A low score in Architecture Alignment, Governance Compatibility, Security, Privacy, or Testability requires explicit mitigation or rejection.
- The matrix informs the decision; it does not replace architectural judgment.

## Alternatives Considered

### Alternative A: Preference-Based Selection

Technology is selected based on familiarity, personal preference, or perceived developer comfort.

Decision: Rejected.

Reason: Preference may be useful context but cannot govern architecture. It risks optimizing for short-term convenience over long-term correctness, governance, and maintainability.

### Alternative B: Vendor-Driven Selection

Technology is selected based on vendor positioning, ecosystem momentum, or bundled offerings.

Decision: Rejected.

Reason: Vendor-driven selection can distort architecture, increase lock-in, hide migration costs, and weaken replaceability.

### Alternative C: Architecture-Driven Evaluation

Technology is selected only after architecture, principles, responsibilities, and required capabilities are defined.

Decision: Accepted.

Reason: It preserves the frozen architecture, supports transparent trade-offs, and requires future ADRs to prove compatibility before adoption.

## Trade-offs

### Advantages

- Protects architecture from technology-led drift.
- Creates repeatable selection discipline.
- Makes trade-offs explicit.
- Improves long-term maintainability.
- Encourages replacement and migration planning.
- Strengthens privacy, security, and governance review.

### Disadvantages

- Adds evaluation effort before adoption.
- May slow early implementation decisions.
- Requires discipline to avoid predetermined conclusions.

### Operational Impact

Operational needs become part of selection rather than afterthoughts. Technology must be supportable, observable, recoverable, testable, and maintainable.

### Development Impact

Developers must document compatibility and trade-offs before adopting technologies that materially shape implementation.

### Testing Impact

Technology selection ADRs must identify how selected technology will be validated against architecture, privacy, security, failure, recovery, and operational requirements.

## Consequences

### Positive

- Future technology choices will be easier to review.
- Architecture compatibility will be explicit.
- Vendor and framework lock-in risks will be visible.
- Technology lifecycle decisions will be planned.

### Negative

- Lightweight experiments may require clearer boundaries to avoid becoming implicit adoption.
- Some decisions will take longer because alternatives and trade-offs must be documented.

### Future Implications

Future technology ADRs must include evaluation criteria, capability verification, lifecycle considerations, and architecture principles impact before acceptance.

## Architecture Principles Impact

This ADR reinforces the Career Companion Architecture Principles:

- Workflow Governance: technology cannot bypass workflow state or gates.
- Evidence Authority: technology cannot make advisory or derived data authoritative.
- Human Approval: technology cannot replace required human approval.
- Immutable Artifacts: technology must preserve approved artifact immutability.
- Deterministic Recovery: technology must support recoverable and observable execution.
- Single Ownership: technology must preserve component and aggregate ownership.
- Audit: technology must preserve traceable decision and execution history.
- Replaceability: technology selection must explicitly evaluate replacement and migration paths.

## Affected Components

- Architecture governance.
- Future ADRs.
- Runtime.
- Persistence.
- Information storage.
- Platform services.
- Workflow coordination.
- Capabilities.
- Repositories.
- Integrations.
- Operations.
- Validation.

## Migration Considerations

This ADR does not migrate existing technology. It governs future technology adoption, replacement, deprecation, and retirement.

Future technology ADRs must define migration complexity, rollback options, compatibility impact, and retirement criteria.

## Operational Considerations

Operational review must evaluate supportability, observability, failure behavior, recovery behavior, privacy, security, cost, and maintenance burden before technology approval.

Operational readiness is a selection criterion, not a post-selection activity.

## Future Review Criteria

This ADR should be reviewed if:

- Technology evaluation becomes too heavyweight for low-risk decisions.
- Future technology ADRs repeatedly miss important criteria.
- Architecture Principles change.
- Accepted technology choices fail operationally despite passing the matrix.
- New categories of technology require additional mandatory criteria.

## References

- [Architecture Principles](../architecture-principles.md)
- [ADR Framework](../adr-framework.md)
- [ADR-001: Persistence Model & Repository Strategy](ADR-001-persistence-model-and-repository-strategy.md)
- [ADR-002: Runtime Execution Strategy](ADR-002-runtime-execution-strategy.md)
- [ADR-003: Workflow Coordination Strategy](ADR-003-workflow-coordination-strategy.md)
- [ADR-004: Information Storage Strategy](ADR-004-information-storage-strategy.md)
- [ADR-005: Platform Services Strategy](ADR-005-platform-services-strategy.md)
- [Reference Architecture](../reference-architecture.md)
- [Solution Architecture](../solution-architecture.md)
- [Component Architecture](../component-architecture.md)
- [Runtime Architecture](../runtime-architecture.md)
- [Persistence Architecture](../persistence-architecture.md)
