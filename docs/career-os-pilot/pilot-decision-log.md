# Career OS Pilot Decision Log

## Purpose

The Career OS Pilot Decision Log records significant product decisions made during the pilot and explains why those decisions were made.

Every significant product decision during the pilot should be documented here when it affects pilot scope, governance, workflow, architecture, metrics, privacy, validation, or roadmap prioritization.

This is not:

- Meeting notes.
- Bug tracking.
- Feature backlog.

It is a historical record of why product decisions were made.

## Decision Template

### Decision ID

### Date

### Pilot Phase

### Problem Statement

### Observed Evidence

### Supporting Metrics

### Alternatives Considered

### Decision

### Reasoning

### Expected Impact

### Risks

### Validation Plan

### Review Date

### Status

Possible status values:

- Proposed.
- Approved.
- Implemented.
- Deferred.
- Rejected.
- Superseded.

## Example Placeholder Decisions

The following examples are illustrative only. They do not include real application data.

## Decision 001

### Decision ID

PILOT-DEC-001

### Date

TBD

### Pilot Phase

Phase 0

### Problem Statement

The Product Owner needs a single operating system for tracking applications, artifacts, tasks, outcomes, and learning during the pilot.

### Observed Evidence

Prior job-search workflows required separate documents or spreadsheets for tracking applications, resume variants, follow-ups, and outcomes.

### Supporting Metrics

No pilot metrics yet. This decision establishes the pilot operating model.

### Alternatives Considered

- Continue using external spreadsheets.
- Use Career OS as the primary operating system.
- Use both systems in parallel.

### Decision

Use Career OS instead of spreadsheets as the primary pilot operating system.

### Reasoning

Using one system improves traceability and reduces duplicated administration. Parallel spreadsheet tracking would weaken the adoption signal.

### Expected Impact

Career OS should replace external spreadsheet dependency for pilot applications.

### Risks

If Career OS misses critical information, the Product Owner may need temporary manual workarounds.

### Validation Plan

Track external spreadsheet usage and workflow confidence during the pilot.

### Review Date

After the first 5 submitted applications.

### Status

Approved.

## Decision 002

### Decision ID

PILOT-DEC-002

### Date

TBD

### Pilot Phase

Phase 0

### Problem Statement

The system has many completed modules, but continued architecture changes could obscure whether the current baseline works in practice.

### Observed Evidence

Career OS includes Resume OS, JD Intelligence, Resume Assembly, Narrative Layer, Export Engine, Application Registry, Career CRM, Application Intelligence, Career Operations Console, and Validation Framework.

### Supporting Metrics

Validation gates passed at baseline freeze.

### Alternatives Considered

- Continue adding architecture before real-world use.
- Freeze architecture and run a controlled pilot.
- Run an uncontrolled pilot while continuing feature development.

### Decision

Freeze architecture during the pilot.

### Reasoning

A stable baseline makes pilot findings easier to interpret. If the system changes constantly, defects and workflow friction become harder to attribute.

### Expected Impact

Pilot findings should map cleanly to the frozen baseline and inform a focused roadmap.

### Risks

Some known limitations may remain during the pilot and require manual workaround.

### Validation Plan

Review pilot defects and friction against the frozen baseline before approving changes.

### Review Date

Weekly pilot review and final pilot review.

### Status

Approved.

## Decision 003

### Decision ID

PILOT-DEC-003

### Date

TBD

### Pilot Phase

Phase 0

### Problem Statement

Automation could reduce manual work, but premature automation may encode unvalidated workflows or create privacy risk.

### Observed Evidence

The governance framework requires human approval for all external actions and deterministic analytics during the pilot.

### Supporting Metrics

No automation-specific pilot metrics yet. Manual workaround count and friction incidents will be collected during the pilot.

### Alternatives Considered

- Add automation before pilot usage.
- Delay automation until pilot evidence exists.
- Add limited automation for all workflows immediately.

### Decision

Delay automation until sufficient operational evidence exists.

### Reasoning

Real-world usage should identify which manual steps are genuinely repetitive, safe, and worth automating. Privacy-sensitive actions should remain human-approved.

### Expected Impact

The pilot should produce stronger evidence for future automation priorities.

### Risks

Manual administration may remain slower during the initial pilot.

### Validation Plan

Track manual workaround count, repeated-friction count, and time spent per workflow step.

### Review Date

Final pilot review.

### Status

Approved.

