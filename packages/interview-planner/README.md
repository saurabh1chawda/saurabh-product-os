# Interview Planner

`@career-companion/interview-planner` deterministically plans interview readiness initiatives from canonical strategy, portfolio planning, learning planning, and opportunity intelligence.

## Purpose

Interview Planner answers: "Given the selected Career Strategy, Portfolio Plan, Learning Plan, and target opportunities, what interview readiness initiatives should be undertaken?"

## Inputs

- Canonical `CareerStrategy` from Career Strategy.
- Canonical `PortfolioPlan` from Portfolio Planner.
- Canonical `LearningPlan` from Learning Planner.
- Canonical `OpportunityDecision` from Opportunity Intelligence.
- Explicit readiness assumptions, constraints, preferences, and policy overrides supplied by the caller.

## Outputs

- `InterviewPlanContext`
- `InterviewNeeds`
- `InterviewInitiatives`
- `InterviewEvaluation`
- `InterviewRoadmap`
- `InterviewPlan`

## Owns

- Interview readiness planning context.
- Readiness gap representation.
- Deterministic readiness initiatives.
- Readiness initiative evaluation.
- Interview readiness roadmap.
- Interview readiness plan.
- Deterministic interview-planning explainability.

## Does NOT Own

- Interview coaching.
- Interview preparation execution.
- Mock interviews.
- AI interviewer.
- Answer generation.
- Answer evaluation.
- Speech analysis.
- Behavioral coaching.
- Interview scheduling.
- Reminders.
- Execution.
- Progress tracking.
- Interview scoring.
- Interview feedback.
- Persistence.
- Rendering.
- AI inference.

## Pipeline

`InterviewPlanContext -> InterviewNeeds -> InterviewInitiatives -> InterviewEvaluation -> InterviewRoadmap -> InterviewPlan`

## Aggregation Boundary

`InterviewPlanContext` is the only aggregation boundary. It consumes canonical outputs from Career Strategy, Portfolio Planner, Learning Planner, and Opportunity Intelligence.

## Dependency Boundaries

Interview Planner may depend on Career Strategy, Portfolio Planner, Learning Planner, Opportunity Intelligence, Career Artifacts, Decision Model, Explainability, and Product Intelligence vocabulary.

It must not depend on Interview Intelligence, ATS Intelligence, Hiring Intelligence, infrastructure, persistence, repositories, HTTP, rendering, AI packages, or future workspace execution contexts.

## Explainability

Every Interview Planner artifact exposes deterministic explainability, including evidence references, assumptions, constraints, confidence, alternatives considered, trade-offs, trace linkage, and reason codes.

## Determinism Guarantee

Every analyzer consumes immutable input, produces immutable output, and uses deterministic ordering and scoring. Every analyzer after `InterviewPlanContext` consumes only its immediate predecessor.
