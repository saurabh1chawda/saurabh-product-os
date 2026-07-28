# Portfolio Planner

`@career-companion/portfolio-planner` deterministically plans portfolio evidence development from canonical strategy, portfolio, and opportunity intelligence.

## INPUTS

- Canonical `CareerStrategy` from Career Strategy.
- Canonical `PortfolioModel` from Portfolio Intelligence.
- Canonical `OpportunityDecision` from Opportunity Intelligence.
- Explicit planning assumptions and constraints supplied by the caller.

## OUTPUTS

- `PortfolioPlanContext`
- `EvidenceNeeds`
- `PortfolioInitiatives`
- `InitiativeEvaluation`
- `PortfolioRoadmap`
- `PortfolioPlan`

## OWNS

- Portfolio-development objectives.
- Evidence need representation.
- Evidence initiatives.
- Strategic initiative prioritization.
- Initiative sequencing.
- Portfolio roadmap.
- Portfolio plan.
- Deterministic portfolio-planning explainability.

## DOES NOT OWN

- Evaluation of raw portfolio content.
- Writing case studies.
- Generating portfolio content.
- Editing portfolio content.
- Publishing artifacts.
- Project management.
- Execution tracking.
- Resume optimization.
- ATS optimization.
- Interview coaching.
- Application planning.
- Persistence.
- Rendering.
- AI inference.

## PIPELINE

`PortfolioPlanContext -> EvidenceNeeds -> PortfolioInitiatives -> InitiativeEvaluation -> PortfolioRoadmap -> PortfolioPlan`

## AGGREGATION BOUNDARY

`PortfolioPlanContext` is the only aggregation boundary. It consumes canonical outputs from Career Strategy, Portfolio Intelligence, and Opportunity Intelligence.

## DEPENDENCY BOUNDARIES

Portfolio Planner may depend on Career Strategy, Portfolio Intelligence, Opportunity Intelligence, Career Artifacts, Decision Model, Explainability, and Product Intelligence vocabulary.

It must not depend on Resume Intelligence, ATS Intelligence, Hiring Intelligence, infrastructure, persistence, repositories, HTTP, rendering, or AI packages.

## DETERMINISM GUARANTEE

Every analyzer consumes immutable input, produces immutable output, and uses deterministic ordering and scoring. Every analyzer after `PortfolioPlanContext` consumes only its immediate predecessor.

## EXPLAINABILITY

Every Portfolio Planner artifact exposes deterministic explainability with:

- Evidence.
- Assumptions.
- Constraints.
- Confidence.
- Alternatives.
- tradeOffs.
- reasonCodes.
- Trace.

Explainability is derived from canonical inputs and deterministic planning outputs. Runtime AI reasoning is not part of Portfolio Planner.
