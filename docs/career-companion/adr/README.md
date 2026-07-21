# Career Companion Architecture Decision Records

## Purpose

Architecture Decision Records document significant Career Companion architecture and implementation-governing decisions after the architectural baseline freeze. ADRs preserve the reason a decision was made, the alternatives considered, the trade-offs accepted, and the expected consequences.

ADRs are not architecture documents, implementation plans, task tickets, release notes, or meeting notes. They are durable decision records.

## Folder Structure

This folder contains:

- `README.md`: purpose and operating guidance for ADRs.
- `index.md`: canonical ADR register.
- `ADR-0000-short-decision-title.md`: individual ADR files.

## Naming Convention

ADR files use stable sequential numbering:

```text
ADR-0001-short-decision-title.md
ADR-0002-short-decision-title.md
ADR-0003-short-decision-title.md
```

Numbering rules:

- Use four digits.
- Never reuse an ADR number.
- Never renumber accepted, rejected, deferred, superseded, or retired ADRs.
- Use a short lowercase filename slug after the number.
- Keep the full title inside the ADR document.

## Lifecycle

ADR statuses follow the Career Companion ADR Framework:

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

- Rejected
- Deferred
- Superseded
- Retired

## Review Process

ADR review should include:

1. Architecture self-review.
2. Architecture Principles compliance review.
3. Affected component review.
4. Operational and privacy review where relevant.
5. Decision review.
6. Implementation planning after acceptance.
7. Validation after implementation.
8. Status update when the decision changes lifecycle state.

Accepted ADRs authorize implementation direction but do not replace validation.

## Relationship With Architecture Principles

Every ADR must explain its impact on Career Companion Architecture Principles. Decisions must preserve governance, evidence authority, human approval, traceability, immutable history, deterministic recovery, privacy, security, observability, and replaceability.

Architecture Principle violations are design defects and must be corrected or explicitly rejected.

## Relationship With Architecture Documents

ADRs govern changes and implementation decisions after the baseline architecture is frozen. They must reference existing architecture documents where relevant and must not silently redefine architecture.

If an ADR supersedes or clarifies part of the architecture, the relationship must be explicit in the ADR and reflected in the ADR index.
