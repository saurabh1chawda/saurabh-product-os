# Networking Planner

`@career-companion/networking-planner` deterministically plans networking initiatives from canonical strategy, portfolio planning, learning planning, interview planning, and opportunity intelligence.

## Purpose

Networking Planner answers: "Given the selected Career Strategy, Portfolio Plan, Learning Plan, Interview Plan, and target opportunities, what networking initiatives should be undertaken?"

## Inputs

- Canonical `CareerStrategy` from Career Strategy.
- Canonical `PortfolioPlan` from Portfolio Planner.
- Canonical `LearningPlan` from Learning Planner.
- Canonical `InterviewPlan` from Interview Planner.
- Canonical `OpportunityDecision` from Opportunity Intelligence.
- Explicit networking assumptions, constraints, preferences, and policy overrides supplied by the caller.

## Outputs

- `NetworkingPlanContext`
- `NetworkingNeeds`
- `NetworkingInitiatives`
- `NetworkingEvaluation`
- `NetworkingRoadmap`
- `NetworkingPlan`

## Owns

- Networking planning context.
- Networking gap representation.
- Deterministic networking initiatives.
- Networking initiative evaluation.
- Networking roadmap.
- Networking plan.
- Deterministic networking-planning explainability.

## Does NOT Own

- LinkedIn message generation.
- Cold email generation.
- Connection request generation.
- Outreach copy.
- Comments.
- Social content.
- CRM.
- Scheduling.
- Reminders.
- Follow-up automation.
- Campaign management.
- Execution tracking.
- Messaging services.
- AI writing.
- Persistence.
- Rendering.

## Pipeline

`NetworkingPlanContext -> NetworkingNeeds -> NetworkingInitiatives -> NetworkingEvaluation -> NetworkingRoadmap -> NetworkingPlan`

## Aggregation Boundary

`NetworkingPlanContext` is the only aggregation boundary. It consumes canonical outputs from Career Strategy, Portfolio Planner, Learning Planner, Interview Planner, and Opportunity Intelligence.

## Dependency Boundaries

Networking Planner may depend on Career Strategy, Portfolio Planner, Learning Planner, Interview Planner, Opportunity Intelligence, Career Artifacts, Decision Model, Explainability, and Product Intelligence vocabulary.

It must not depend on infrastructure, persistence, repositories, HTTP, rendering, AI packages, CRM, messaging services, social APIs, or future workspace execution contexts.

## Determinism Guarantee

Every analyzer consumes immutable input, produces immutable output, and uses deterministic ordering and scoring. Every analyzer after `NetworkingPlanContext` consumes only its immediate predecessor.

## Explainability

Every Networking Planner artifact exposes deterministic explainability, including evidence references, assumptions, constraints, confidence, alternatives considered, trade-offs, trace linkage, and reason codes.
