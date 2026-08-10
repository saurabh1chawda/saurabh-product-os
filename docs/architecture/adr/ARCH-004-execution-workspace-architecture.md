# ARCH-004 - Execution and Workspace Architecture

## Status

Accepted

## Date

2026-07-28

## Owners

Career Companion Architecture

## Context

Phase 2 completed the deterministic Intelligence and Planning architecture for Career Companion.

The completed architecture is layered:

```text
Foundation
    ↓
Intelligence
    ↓
Planning
```

The Planning Layer produces immutable approved `*Plan` artifacts. These artifacts describe what should be done. They do not execute work, track progress, generate documents, automate external systems, or own operational state.

Execution begins after Planning ends.

The next architectural family must support controlled operationalization of approved plans while preserving all Phase 2 boundaries:

- Planning never depends on Execution.
- Planning never consumes execution artifacts.
- Execution consumes immutable Plan artifacts.
- Execution does not mutate Planning artifacts.
- Runtime AI reasoning remains outside deterministic domain models.
- Infrastructure does not own domain policy.

## Problem

Planning answers:

```text
What should be done?
```

Execution answers:

```text
How are approved plans carried out safely and observably?
```

Execution introduces concerns that are fundamentally different from deterministic planning:

- Mutable state.
- Human interaction.
- External side effects.
- Approvals.
- Drafts and accepted artifacts.
- Progress tracking.
- Retries.
- Failure recovery.
- Cancellation.
- Outcomes.
- Feedback.

ARCH-003 cannot simply be extended to cover Execution. Planning is a deterministic transformation pipeline. Execution is stateful, approval-sensitive, and side-effect-aware.

Execution therefore requires a separate architectural decision.

## Decision

The Execution Layer owns operationalization of approved plans.

Execution owns:

- Execution state.
- Work items.
- Progress.
- Accepted artifacts.
- Approvals.
- Outcomes.
- Feedback records.

Execution does not own:

- Planning.
- Strategy.
- Intelligence.
- Plan generation.
- Plan prioritization.
- Planning rationale.
- Infrastructure implementation.
- Presentation.

Execution must preserve the approved Plan artifact as an immutable input. It may derive execution state from a Plan, but it must not become the source of canonical Planning artifacts.

## Workspace Decision

Workspace is an interaction surface over an Execution domain.

Workspace is not the domain.

Workspace never owns:

- Lifecycle policy.
- Approval policy.
- Execution rules.
- Domain state transitions.

Rendering is not domain logic. User interfaces may present execution state and collect user intent, but lifecycle and approval decisions remain owned by the Execution domain and application orchestration.

## Lifecycle Principles

ARCH-004 does not define one shared execution lifecycle.

Every execution domain owns its own lifecycle.

Lifecycle transitions must be:

- Explicit.
- Deterministic.
- Validated.
- Auditable.
- Version-aware.
- Idempotent where commands may be retried.
- Preserving of immutable history.

Execution domains may model partial completion, cancellation, retries, terminal states, failure recovery, and accepted artifacts according to their own bounded-context needs.

No generic lifecycle framework is introduced by this ADR.

## Human Approval Principle

No externally visible or irreversible action is implicitly approved.

Explicit human approval is required before:

- AI-generated content becomes accepted.
- Browser automation performs an external action.
- Content is published.
- Applications are submitted.
- External messages are sent.
- Actions involving personal data are executed.
- Automated actions create externally visible effects.

This ADR does not define a universal approval state machine. Each execution domain may define the approval states required by its own risk profile.

## AI Boundary

AI-assisted execution may exist outside deterministic domain models.

The architecture separates:

- AI generation.
- Validation.
- Human review.
- Accepted artifacts.
- External execution.

AI-generated output is never canonical by default.

Only accepted artifacts become domain truth.

AI providers, prompts, model calls, and provider-specific responses remain outside deterministic domain models. Domain models may reference accepted artifacts and validation results, but they must not contain runtime AI behavior.

## Dependency Rules

The dependency direction is:

```text
Foundation
    ↓
Intelligence
    ↓
Planning
    ↓
Execution
    ↓
Workspace / Experience
```

Dependency rules:

- Planning never depends on Execution.
- Execution consumes immutable Plan artifacts.
- Execution never mutates Planning artifacts.
- Execution may define execution-input contracts derived from approved plans.
- Infrastructure implements contracts.
- Infrastructure does not own domain policy.
- UI owns presentation only.
- UI does not own lifecycle policy.
- UI does not own approval policy.
- No dependency cycles are permitted.

Execution packages should depend on published Plan contracts or explicit execution-input contracts. They should not depend on planner analyzers or planning internals.

## Feedback Boundary

Execution produces outcomes.

Execution never directly modifies plans.

Execution may publish:

- Outcomes.
- Feedback records.
- Immutable execution history.

Feedback enters later Intelligence and Planning runs through orchestration. Execution publishes; Planning may consume later through an explicit orchestration path.

Execution must not directly invoke Planning to revise a Plan.

This ADR does not introduce an event bus, queue, or messaging implementation.

## Pilot Strategy

ARCH-004 does not standardize a universal execution pipeline.

The Phase 3 strategy is:

1. Define execution principles.
2. Implement one pilot Workspace.
3. Review the pilot architecture.
4. Extract reusable patterns only after implementation evidence exists.

This differs from ARCH-003. ARCH-003 documented a planning pattern that had already emerged across multiple implemented planners. Execution does not yet have that evidence. A universal execution pipeline would be premature.

## Consequences

### Positive

- Preserves Phase 2 Planning boundaries.
- Keeps mutable execution state out of Planning packages.
- Prevents UI from owning domain lifecycle policy.
- Creates a clear approval boundary for external side effects.
- Allows AI-assisted execution without making AI output canonical.
- Supports future auditability and outcome feedback.
- Avoids premature workflow centralization.

### Trade-offs

- Execution domains may initially have different lifecycle shapes.
- Reusable execution patterns will emerge more slowly.
- Architecture review is required before extracting shared execution abstractions.
- More explicit approval and lifecycle modeling is required.

### Deferred

The following are intentionally deferred until implementation evidence exists:

- A canonical execution pattern.
- Execution kernel.
- Shared approval services.
- Shared artifact services.
- Generic workflow engine.
- Automation framework.

These are not architectural gaps. They require evidence from at least one pilot execution domain.

## Relationship to ARCH-003

ARCH-003 defines Planning.

ARCH-004 begins where Planning ends.

ARCH-003 standardizes deterministic planning transformations:

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

ARCH-004 standardizes execution principles.

ARCH-004 intentionally does not define a universal execution pipeline.

The ADRs are complementary:

- ARCH-003 governs what Planning packages produce.
- ARCH-004 governs how approved Plan artifacts may be operationalized.
