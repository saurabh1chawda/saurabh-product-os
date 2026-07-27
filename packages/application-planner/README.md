# Application Planner

`@career-companion/application-planner` deterministically plans application initiatives from canonical strategy, portfolio planning, learning planning, interview planning, networking planning, and opportunity intelligence.

## Purpose

Application Planner answers: "Given the selected Career Strategy, Portfolio Plan, Learning Plan, Interview Plan, Networking Plan, and target opportunities, what application initiatives should be undertaken?"

## Inputs

- Canonical `CareerStrategy` from Career Strategy.
- Canonical `PortfolioPlan` from Portfolio Planner.
- Canonical `LearningPlan` from Learning Planner.
- Canonical `InterviewPlan` from Interview Planner.
- Canonical `NetworkingPlan` from Networking Planner.
- Canonical `OpportunityDecision` from Opportunity Intelligence.
- Explicit application assumptions, constraints, preferences, and policy overrides supplied by the caller.

## Outputs

- `ApplicationPlanContext`
- `ApplicationNeeds`
- `ApplicationInitiatives`
- `ApplicationEvaluation`
- `ApplicationRoadmap`
- `ApplicationPlan`

## Owns

- Application planning context.
- Application readiness gap representation.
- Deterministic application initiatives.
- Application initiative evaluation.
- Application roadmap.
- Application plan.
- Deterministic application-planning explainability.

## Does NOT Own

- Resume generation.
- Resume tailoring.
- ATS optimization.
- Cover-letter generation.
- Recruiter email generation.
- Application submission.
- Application tracking.
- Browser automation.
- Job board integrations.
- Workflow automation.
- Document generation.
- AI writing.
- Persistence.
- Rendering.

## Pipeline

`ApplicationPlanContext -> ApplicationNeeds -> ApplicationInitiatives -> ApplicationEvaluation -> ApplicationRoadmap -> ApplicationPlan`

## Aggregation Boundary

`ApplicationPlanContext` is the only aggregation boundary. It consumes canonical outputs from Career Strategy, Portfolio Planner, Learning Planner, Interview Planner, Networking Planner, and Opportunity Intelligence.

## Dependency Boundaries

Application Planner may depend on Career Strategy, Portfolio Planner, Learning Planner, Interview Planner, Networking Planner, Opportunity Intelligence, Career Artifacts, Decision Model, Explainability, and Product Intelligence vocabulary.

It must not depend on infrastructure, persistence, repositories, HTTP, rendering, AI packages, ATS services, job board APIs, browser automation, workflow engines, or future workspace execution contexts.

## Determinism Guarantee

Every analyzer consumes immutable input, produces immutable output, and uses deterministic ordering and scoring. Every analyzer after `ApplicationPlanContext` consumes only its immediate predecessor.

## Explainability

Every Application Planner artifact exposes deterministic explainability, including evidence references, assumptions, constraints, confidence, alternatives considered, trade-offs, trace linkage, and reason codes.
