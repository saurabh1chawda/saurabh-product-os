# ARCH-003 - Planning Pipeline Pattern

## Status

Accepted

## Date

2026-07-27

## Owners

Career Companion Architecture

## Context

Portfolio Planner, Learning Planner, and Interview Planner independently converged on the same deterministic planning pipeline. This pattern is no longer coincidental. It is now the canonical Planning architecture for Career Companion.

This ADR documents an existing architectural pattern. It does not introduce a new architecture, shared implementation, base class, inheritance model, or refactor.

Future planning packages, including Networking Planner and Application Planner, must conform to this ADR unless a future accepted ADR supersedes it.

## Problem

Planning packages previously evolved independently. Without a canonical pattern, future planners risk:

- Inconsistent pipelines.
- Inconsistent ownership.
- Inconsistent explainability.
- Duplicated architectural decisions.
- Tighter coupling.
- Inconsistent terminology.

Career Companion needs a durable planning pattern that preserves deterministic behavior, bounded context ownership, explainability, and review consistency across all planning packages.

## Decision

All planning bounded contexts shall follow the canonical Planning Pipeline:

```text
Context
    ↓
Needs
    ↓
Initiatives
    ↓
Evaluation
    ↓
Roadmap
    ↓
Plan
```

Each stage has a single responsibility. Every analyzer consumes only the immediate predecessor. Only the Context stage aggregates immutable upstream inputs from external bounded contexts.

## Pipeline Stages

### Context

Purpose:

Aggregate immutable upstream inputs.

Owns:

- Context.
- Assumptions.
- Constraints.
- Preferences.
- Policy.
- References.
- Explainability.
- Trace.

Must not:

- Analyze.
- Prioritize.
- Recommend.
- Plan.

### Needs

Purpose:

Identify gaps.

Must not:

- Recommend initiatives.

### Initiatives

Purpose:

Generate deterministic initiatives.

Must not:

- Execute.
- Coach.
- Schedule.

### Evaluation

Purpose:

Evaluate initiatives.

Evaluation may include:

- Impact.
- Effort.
- Coverage.
- Dependencies.
- Initiative risk.
- Confidence.

Must not:

- Execute.

### Roadmap

Purpose:

Sequence initiatives.

Must not:

- Track execution.
- Create calendar entries.
- Create reminders.

### Plan

Purpose:

Produce the final planning artifact.

Must not:

- Execute work.

## Architectural Principles

### 1. Immediate-Predecessor Rule

Every analyzer consumes only the previous stage.

No stage may skip upstream. No analyzer reaches around the pipeline. Downstream stages may carry immutable references from predecessor artifacts, but they must not accept additional external bounded context inputs.

### 2. Aggregation Boundary

Only Context aggregates external bounded contexts.

No downstream stage aggregates additional sources. This keeps dependency flow explicit and prevents hidden coupling.

### 3. Determinism

Identical inputs must produce identical outputs.

Planning packages must not depend on runtime AI reasoning, external network state, mutable clocks, persistence state, or nondeterministic ordering.

### 4. Immutability

Public planning artifacts are immutable.

Collections exposed by planning artifacts must be readonly and must not expose mutable public state.

### 5. Single Responsibility

Each stage owns one responsibility.

Planning packages must preserve stage boundaries even when implementation convenience would make cross-stage shortcuts attractive.

## Explainability Contract

Every planning artifact exposes deterministic explainability.

The canonical explainability contract includes:

- Evidence.
- Assumptions.
- Constraints.
- Confidence.
- Alternatives.
- tradeOffs.
- reasonCodes.
- Trace.

Explainability must be derived from canonical inputs and deterministic planning outputs. Runtime AI reasoning is not part of the planning explainability contract.

## Ownership

Planning packages answer:

```text
What should be done?
```

Planning packages do not answer:

```text
How should it be executed?
```

Execution belongs to separate bounded contexts.

Examples:

- Interview Planner produces readiness initiatives, not interview coaching.
- Networking Planner will produce networking initiatives, not message generation.
- Application Planner will produce application planning, not resume generation.

## Dependency Rules

Allowed dependencies:

- Upstream planning or intelligence packages required by the Context stage.
- Shared domain packages.
- Explainability.
- Decision Model.

Forbidden dependencies:

- Infrastructure.
- Persistence.
- HTTP.
- Rendering.
- Repositories.
- Runtime AI.
- Cross-stage shortcuts.

Planning packages must not depend on execution workspaces for the same domain.

## Naming Standard

Canonical planning artifacts use this naming pattern:

- `*PlanContext`
- `*Needs`
- `*Initiatives`
- `*Evaluation`
- `*Roadmap`
- `*Plan`

Future planners should reuse these names to preserve review consistency and onboarding clarity.

## Rationale

The Planning Pipeline Pattern exists because Portfolio Planner, Learning Planner, and Interview Planner independently validated the same architecture:

- A single aggregation boundary.
- Stage-by-stage deterministic transformation.
- Immutable artifacts.
- Explicit explainability.
- No execution ownership.

Benefits:

- Consistency.
- Predictability.
- Low coupling.
- Deterministic planning.
- Explainability.
- Testability.
- Reusable architecture.
- Easier onboarding.
- Simpler reviews.

## Consequences

### Positive

- Consistent planners.
- Shared review process.
- Shared tests.
- Shared terminology.
- Reduced coupling.

### Negative

- Slightly more ceremony.
- New planners must conform to the canonical stage model.

## Applies To

This ADR applies to:

- Portfolio Planner.
- Learning Planner.
- Interview Planner.
- Networking Planner.
- Application Planner.
- Future Planning packages.

## Planning Layer Completion Principles

The implemented Planning Layer has validated additional architectural rules that now form part of the canonical Planning Pipeline Pattern.

### Planning Dependency Principle

A Planning bounded context may depend only on:

- Intelligence Layer bounded contexts.
- Earlier Planning Layer bounded contexts.

Planner dependencies must form a directed acyclic graph. Planning packages must never create cyclic dependencies.

The validated planning dependency chain is:

```text
Career Strategy
    ↓
Portfolio Planner
    ↓
Learning Planner
    ↓
Interview Planner
    ↓
Networking Planner
    ↓
Application Planner
```

Reverse dependencies are prohibited. A planner must not depend on a later planner, and no planner may introduce a cycle through another planning package.

Prohibited dependency examples include:

- Networking Planner → Portfolio Planner.
- Application Planner → Learning Planner.
- Any cyclic planner dependency.

### Terminal Planner Principle

Application Planner is the terminal bounded context of the Planning Layer.

No Planning bounded context may depend upon Application Planner. Application Planner produces the final planning artifact consumed by future execution-oriented bounded contexts.

Application Planner completes the Planning Layer.

### Execution Separation Principle

Execution-oriented bounded contexts consume `*Plan` artifacts.

Planning bounded contexts never consume execution artifacts.

Planning owns:

- Planning.
- Prioritization.
- Readiness.
- Sequencing.
- Recommendations.

Execution owns:

- Execution.
- Automation.
- Workflows.
- Document generation.
- Integrations.
- Tracking.
- Operational state.

Planning packages must never depend upon execution packages.

## Do Not

This ADR must not be used to justify:

- Base classes.
- Inheritance.
- Shared implementation.
- Common code extraction.
- Planner refactoring.

This ADR documents architecture only.

## Future Review Criteria

This ADR should be reviewed if:

- A future planning package cannot preserve the six-stage pipeline.
- A future planning package requires multiple aggregation boundaries.
- Immediate-predecessor sequencing blocks a necessary planning behavior.
- Explainability requirements materially change.
- Execution ownership needs to move into a planner, which should be treated as an architectural concern.
