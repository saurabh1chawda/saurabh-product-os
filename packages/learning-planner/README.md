# Learning Planner

`@career-companion/learning-planner` deterministically plans intentional capability development from canonical strategy, portfolio planning, and opportunity intelligence.

## INPUTS

- Canonical `CareerStrategy` from Career Strategy.
- Canonical `PortfolioPlan` from Portfolio Planner.
- Canonical `OpportunityDecision` from Opportunity Intelligence.
- Explicit learning assumptions, constraints, preferences, and policy overrides supplied by the caller.

## OUTPUTS

- `LearningPlanContext`
- `CapabilityNeeds`
- `LearningInitiatives`
- `LearningEvaluation`
- `LearningRoadmap`
- `LearningPlan`

## OWNS

- Capability-development planning context.
- Capability need representation.
- Capability-building initiatives.
- Deterministic initiative evaluation.
- Capability-development roadmap.
- Learning plan.
- Deterministic learning-plan explainability.

## DOES NOT OWN

- Educational resources.
- Courses.
- Books.
- Certifications.
- Video recommendations.
- Learning schedules.
- Reminders.
- Progress tracking.
- Coaching.
- Execution.
- Portfolio content generation.
- Resume optimization.
- ATS optimization.
- Interview coaching.
- Persistence.
- Rendering.
- AI inference.

## PIPELINE

`LearningPlanContext -> CapabilityNeeds -> LearningInitiatives -> LearningEvaluation -> LearningRoadmap -> LearningPlan`

## AGGREGATION BOUNDARY

`LearningPlanContext` is the only aggregation boundary. It consumes canonical outputs from Career Strategy, Portfolio Planner, and Opportunity Intelligence.

## DEPENDENCY BOUNDARIES

Learning Planner may depend on Career Strategy, Portfolio Planner, Opportunity Intelligence, Career Artifacts, Decision Model, Explainability, and Product Intelligence vocabulary.

It must not depend on ATS Intelligence, Hiring Intelligence, infrastructure, persistence, repositories, HTTP, rendering, AI packages, or future workspace execution contexts.

## DETERMINISM GUARANTEE

Every analyzer consumes immutable input, produces immutable output, and uses deterministic ordering and scoring. Every analyzer after `LearningPlanContext` consumes only its immediate predecessor.

## EXPLAINABILITY

Every Learning Planner artifact exposes deterministic explainability with:

- Evidence.
- Assumptions.
- Constraints.
- Confidence.
- Alternatives.
- tradeOffs.
- reasonCodes.
- Trace.

Explainability is derived from canonical inputs and deterministic planning outputs. Runtime AI reasoning is not part of Learning Planner.
