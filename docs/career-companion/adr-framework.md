# Career Companion Architecture Decision Record Framework

## 1. Purpose

The Architecture Decision Record framework defines how Career Companion records, reviews, approves, supersedes, and governs significant architecture decisions after the architectural baseline is frozen.

This framework exists to preserve architectural intent while allowing deliberate evolution. It does not make architecture decisions, select technology, change implementation, or modify the platform architecture.

## 2. Why ADRs Exist

Architecture Decision Records exist to preserve the reasoning behind important decisions.

ADRs are required when a decision:

- Changes or clarifies architecture.
- Affects architecture principles.
- Adds, replaces, or retires a major component.
- Changes workflow, capability, artifact, persistence, runtime, interaction, or evidence behavior.
- Introduces a new integration boundary.
- Changes governance, privacy, approval, audit, or recovery behavior.
- Selects a technology that materially shapes implementation.
- Creates a migration path or deprecation path.

ADRs are not meeting notes, task plans, bug reports, release notes, or implementation tickets. They record why a decision was made, what alternatives were considered, and how the decision affects the architecture.

## 3. ADR Lifecycle

ADRs move through a controlled lifecycle:

```text
Proposed
    ↓
Under Review
    ↓
Accepted
    ↓
Implemented
    ↓
Superseded or Retired
```

Additional statuses:

- Rejected: the decision was reviewed and not accepted.
- Deferred: the decision requires more evidence or is not yet necessary.
- Superseded: a later ADR replaces the decision.
- Retired: the decision no longer applies because the affected architecture has been removed or replaced.

Lifecycle rules:

- Proposed ADRs may be drafted before implementation.
- Accepted ADRs authorize the architectural direction.
- Implemented ADRs indicate the approved decision has been applied.
- Superseded ADRs remain in history and must link to the replacement ADR.
- Rejected and Deferred ADRs remain useful as architectural history.

## 4. ADR Numbering

ADR numbering must be stable, sequential, and never reused.

Recommended format:

```text
ADR-0001-short-decision-title.md
ADR-0002-short-decision-title.md
ADR-0003-short-decision-title.md
```

Numbering rules:

- Use four digits.
- Assign the next available number when the ADR is created.
- Never renumber existing ADRs.
- Never reuse a number from a rejected, deferred, superseded, or retired ADR.
- Use a short lowercase filename slug after the number.
- Keep the ADR title human-readable inside the document.

## 5. ADR Categories

ADRs should identify one primary category and any relevant secondary categories.

Categories:

- Governance: decisions affecting decision rights, approval gates, policy, audit, or compliance.
- Workflow: decisions affecting states, transitions, gates, lifecycle, or workflow invariants.
- Capability: decisions affecting capability contracts, capability lifecycle, capability resolution, or capability behavior.
- Artifact: decisions affecting artifact types, lifecycle, validation, versioning, or approval.
- Evidence: decisions affecting evidence authority, evidence chains, validation, or traceability.
- Memory: decisions affecting memory scope, retention, isolation, or use.
- Persistence: decisions affecting persistence semantics, repository responsibilities, snapshots, recovery, or retention.
- Runtime: decisions affecting runtime sessions, execution lifecycle, concurrency, retries, timeouts, or recovery execution.
- Component: decisions affecting component ownership, boundaries, dependency direction, or collaboration.
- Integration: decisions affecting external services, model boundaries, document rendering, imports, or exports.
- Privacy and Security: decisions affecting access, least privilege, data minimization, sensitive data handling, or secrets.
- Technology: decisions selecting technology that materially affects architecture.
- Operations: decisions affecting observability, supportability, release governance, validation, or operational readiness.

## 6. ADR Template

Each ADR must use the following template.

```markdown
# ADR-0000: Title

## Status

Proposed | Under Review | Accepted | Implemented | Rejected | Deferred | Superseded | Retired

## Date

YYYY-MM-DD

## Authors

- Name or role

## Context

Describe the architectural context and why the decision is being considered now.

## Problem Statement

State the problem clearly. Explain what must be decided and what happens if no decision is made.

## Decision

State the decision directly.

## Alternatives Considered

List meaningful alternatives, including the option to do nothing where relevant.

## Trade-offs

Explain benefits, costs, constraints, reversibility, and operational impact.

## Consequences

Describe expected architectural, operational, privacy, security, validation, and maintenance consequences.

## Architecture Principles Impact

Describe how the decision aligns with, strengthens, weakens, or creates tension with Architecture Principles.

## Affected Components

List affected workflows, components, capabilities, artifacts, repositories, integrations, runtime behavior, or governance areas.

## Migration Considerations

Describe migration, compatibility, deprecation, rollback, or transition needs.

## Operational Considerations

Describe validation, observability, support, recovery, release, and documentation impacts.

## Future Review Criteria

Define what evidence would cause this ADR to be reviewed, superseded, or retired.

## References

Link related ADRs, architecture documents, validation reports, or supporting evidence.
```

Template rules:

- Do not omit sections.
- Use "Not applicable" when a section truly does not apply.
- Keep decision language specific and testable.
- Separate decision from implementation detail.
- Link to superseding or related ADRs where relevant.

## 7. Decision Quality Criteria

A high-quality ADR must satisfy the following criteria:

- The problem is clear.
- The decision is explicit.
- Alternatives are fairly represented.
- Trade-offs are visible.
- Consequences are concrete.
- Architecture Principles impact is assessed.
- Affected components are identified.
- Migration and rollback considerations are addressed.
- Operational impact is considered.
- Privacy, security, evidence, approval, audit, and workflow implications are evaluated where relevant.
- Future review criteria are stated.
- The ADR does not hide uncertainty.

An ADR should not be accepted if it lacks enough information to evaluate architectural impact.

## 8. ADR Review Workflow

ADR review follows a governed workflow:

```text
Draft ADR
    ↓
Architecture Self-Review
    ↓
Principles Compliance Review
    ↓
Affected Component Review
    ↓
Operational and Privacy Review
    ↓
Decision
    ↓
Implementation Planning
    ↓
Validation
    ↓
Status Update
```

Review responsibilities:

- Author drafts the ADR and identifies affected areas.
- Architecture reviewer validates fit with the architectural baseline.
- Product owner validates product and governance impact.
- Privacy reviewer evaluates sensitive data and access implications where relevant.
- Implementation owner validates feasibility without turning the ADR into implementation design.
- Validation owner confirms test and review implications.

Decision outcomes:

- Accept: approve the architectural direction.
- Reject: decline the decision and preserve reasoning.
- Defer: postpone until more evidence exists.
- Request revision: require clarification before a decision.

## 9. Superseding ADRs

Superseding preserves architectural history while allowing evolution.

Superseding rules:

- A superseded ADR is never deleted.
- A superseding ADR must reference the ADR it replaces.
- A superseded ADR must be marked Superseded.
- The superseded ADR must link to the superseding ADR.
- The new ADR must explain why the previous decision is no longer sufficient.
- Superseding must include migration and operational considerations.

An ADR may be partially superseded when only part of the decision changes. Partial supersession must clearly identify what remains valid and what is replaced.

## 10. Governance

ADRs are mandatory for significant architecture changes after baseline freeze.

Governance rules:

- Architecture changes require an accepted ADR before implementation.
- Technology choices with architectural impact require an accepted ADR.
- ADRs must be reviewed against Architecture Principles.
- ADRs must not bypass Career OS governance, workflow gates, evidence authority, human approvals, privacy, persistence, or audit.
- ADRs must remain technology-neutral until a technology decision is explicitly required.
- ADRs must preserve traceability from decision to implementation and validation.
- ADRs must be updated when status changes.
- ADRs are part of architectural history and should not be rewritten to hide previous reasoning.

The ADR framework protects Career Companion from accidental architecture drift while allowing deliberate, evidence-driven evolution.
