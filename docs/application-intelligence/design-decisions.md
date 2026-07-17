# Application Intelligence Design Decisions

Last updated: 2026-07-17

## Decision 1: Measurement, Not Prediction

The system reports actual outcomes. It does not predict hiring decisions.

## Decision 2: Reference Resume OS Outputs

Application records store immutable references to Resume OS artifacts and commits. They do not duplicate resume text.

## Decision 3: Deterministic Insights

Insights are computed from recorded data and must include supporting evidence.

## Decision 4: Configurable Lifecycle

The first lifecycle uses standard stages, but future states can be configured if they map cleanly to funnel reporting.

## Decision 5: Synthetic Fixtures First

The initial dataset is synthetic so validation can be developed without exposing private application history.

