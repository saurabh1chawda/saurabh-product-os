# Opportunity Intelligence

`@career-companion/opportunity-intelligence` deterministically evaluates whether a candidate should invest time pursuing an opportunity.

## INPUTS

- Canonical `ResumeModel` from Resume Intelligence.
- Canonical `PortfolioModel` from Portfolio Intelligence.
- Canonical `JobModel`, `HiringModel`, and `EvaluationFramework` from Job Intelligence.
- Explicit opportunity evidence supplied by the caller.

## OUTPUTS

- `OpportunityContext`
- `CompanyAnalysis`
- `RoleAnalysis`
- `MarketAnalysis`
- `CandidateFit`
- `OpportunityDecision`

## OWNS

- Opportunity evaluation context.
- Company evaluation.
- Role quality evaluation.
- Supplied market signal evaluation.
- Candidate-opportunity fit.
- Opportunity prioritization.
- Deterministic opportunity explainability.

## DOES NOT OWN

- Resume optimization.
- ATS evaluation.
- Hiring evaluation.
- Interview evaluation.
- Career planning.
- Application tracking.
- Company knowledge ingestion.
- Market data collection.
- Salary negotiation.
- AI inference.
- Persistence.
- Rendering.

## Pipeline Rule

`OpportunityContext` is the only aggregation boundary. Every later analyzer consumes only its immediate predecessor and carries required context forward immutably.
