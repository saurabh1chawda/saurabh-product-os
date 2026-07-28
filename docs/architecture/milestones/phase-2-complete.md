# Phase 2 Architecture Milestone

Phase 2 completed the Intelligence and Planning layers of Career Companion. The repository now contains a deterministic, bounded-context architecture for interpreting career signals, producing intelligence artifacts, and transforming those artifacts into planning outputs.

This milestone is an architectural snapshot. It documents the architecture that exists at Phase 2 completion.

## 1. Scope Completed

Phase 2 completed the core architectural foundation required for future execution-oriented bounded contexts.

Completed scope includes:

- Foundation packages for domain primitives, decision models, explainability, and canonical artifacts.
- Intelligence Layer bounded contexts for opportunity evaluation, career decision orchestration, and career strategy.
- Planning Layer bounded contexts for portfolio, learning, interview, networking, and application planning.
- Architecture Decision Records documenting the canonical planning pattern.
- Deterministic explainability contracts across planning artifacts.
- Bounded-context ownership boundaries.
- Deterministic architecture conventions for analyzers, models, and pipelines.

## 2. Architecture Overview

The current architecture is layered:

```text
Foundation Layer
    ↓
Intelligence Layer
    ↓
Planning Layer
    ↓
Execution Layer (Future)
    ↓
Experience Layer (Future)
```

Only the Foundation, Intelligence, and Planning layers currently exist in the architecture.

The Execution Layer and Experience Layer are intentionally deferred. They are not part of the completed Phase 2 implementation.

## 3. Intelligence Layer

The Intelligence Layer interprets canonical career and opportunity signals into deterministic intelligence artifacts.

The canonical intelligence pipeline is:

```text
Context
    ↓
Analysis
    ↓
Evaluation
    ↓
Decision
```

Completed Intelligence Layer bounded contexts include:

- Opportunity Intelligence.
- Career Strategy.
- Career Decision.

Opportunity Intelligence evaluates whether an opportunity should be pursued. Career Decision orchestrates existing intelligence into deterministic decision artifacts. Career Strategy synthesizes prior intelligence into long-term strategic direction.

## 4. Planning Layer

The Planning Layer transforms intelligence artifacts into deterministic planning artifacts.

The canonical planning pipeline is:

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

Completed Planning Layer bounded contexts include:

- Portfolio Planner.
- Learning Planner.
- Interview Planner.
- Networking Planner.
- Application Planner.

Each planner owns one planning domain. Each planner produces planning artifacts only. No planner owns execution, automation, tracking, scheduling, document generation, or AI-assisted execution.

## 5. Architectural Principles

The repository is governed by the following architectural principles:

- Bounded Context ownership: each package owns a specific domain responsibility.
- Determinism: identical inputs produce identical outputs.
- Immutable artifacts: public artifacts expose readonly data and no mutable runtime state.
- Single aggregation boundary: only the Context stage aggregates external bounded-context inputs.
- Immediate-predecessor rule: every downstream analyzer consumes only the previous stage.
- Planning dependency DAG: planner dependencies move forward only and do not create cycles.
- Execution separation: planning packages do not consume execution artifacts or depend on execution packages.
- Explainability: every planning artifact exposes deterministic explanation data.
- No shared planner inheritance: the planning pattern is a convention, not a base class hierarchy.
- Convention over framework: shared architecture is documented through ADRs and package conventions, not extracted into shared planner implementations.

## 6. Explainability Contract

Planning bounded contexts expose a standardized deterministic explainability contract:

- Evidence.
- Assumptions.
- Constraints.
- Confidence.
- Alternatives.
- TradeOffs.
- ReasonCodes.
- Trace.

All Planning bounded contexts conform to this contract.

Explainability is derived from canonical inputs and deterministic planning outputs. Runtime AI reasoning is not part of the Planning Layer explainability contract.

## 7. Architecture Decision Records

The repository uses ADRs to document accepted architectural decisions.

Existing ADR coverage:

- ARCH-001: not present in the inspected architecture ADR directory at this milestone.
- ARCH-002: not present in the inspected architecture ADR directory at this milestone.
- ARCH-003: Planning Pipeline Pattern.

ARCH-003 is the source of truth for Planning Layer structure, including the canonical six-stage pipeline, immediate-predecessor rule, aggregation boundary, explainability contract, dependency DAG, terminal Application Planner principle, and execution separation principle.

## 8. Intentional Deferrals

The following architecture is intentionally deferred to future phases:

- Execution Layer.
- Workspace bounded contexts.
- Automation.
- Document generation.
- Integrations.
- Tracking.
- Scheduling.
- CRM.
- AI-assisted execution.
- Browser automation.

These deferrals are not architectural gaps. They are excluded from the completed Phase 2 architecture by design.

## 9. Repository Characteristics

The repository currently exhibits the following architectural characteristics:

- Domain-Driven Design.
- Deterministic bounded contexts.
- Infrastructure-free domain logic.
- Immutable models and canonical artifacts.
- Layered architecture.
- Forward-only planner dependencies.
- Explicit ownership boundaries.
- Test-first architecture validation.
- ADR-driven development.
- Explainable planning outputs.

## 10. Current Architecture Status

Phase 2 status: COMPLETE.

Architecture quality: stable and consistent, with Planning Layer harmonization completed against ARCH-003.

Planning Layer: COMPLETE.

Intelligence Layer: COMPLETE for the current architecture scope.

ADR coverage: sufficient for the completed Planning Layer.

Readiness for Execution Layer: READY.

## 11. Looking Ahead

The next architectural family is the Execution Layer.

The completed Planning Layer now provides stable `*Plan` artifacts that future execution-oriented bounded contexts can consume. This milestone does not design the Execution Layer, define future bounded contexts, or introduce future pipelines.
