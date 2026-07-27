# Career Strategy

`@career-companion/career-strategy` deterministically selects the best long-term strategic direction for achieving a career goal.

## INPUTS

- Canonical `OpportunityDecision` from Opportunity Intelligence.
- Canonical `DecisionReport` from Career Decision.
- Explicit strategic goal preferences supplied by the caller.

## OUTPUTS

- `CareerGoal`
- `CurrentState`
- `CareerGap`
- `StrategyOptions`
- `StrategyEvaluation`
- `CareerStrategy`

## OWNS

- Long-term career goal definition.
- Current strategic-state representation.
- Career gap representation.
- Deterministic strategic alternatives.
- Strategy evaluation.
- Recommended long-term career strategy.
- Deterministic career-strategy explainability.

## DOES NOT OWN

- Resume optimization.
- Execution planning.
- ATS evaluation.
- Hiring evaluation.
- Interview evaluation.
- Application tracking.
- Opportunity evaluation.
- Persistence.
- Rendering.
- AI inference.

## Pipeline Rule

`CareerGoal` is the only aggregation boundary. Every later analyzer consumes only its immediate predecessor and carries required context forward immutably.
