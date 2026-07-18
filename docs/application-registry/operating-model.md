# Operating Model

Last updated: 2026-07-18

## Daily Use

1. Initialize the registry once.
2. Create an application record from a local JSON input.
3. Link JD and Resume OS artifacts.
4. Track stage transitions as events.
5. Add contacts only when voluntarily known.
6. Add tasks for follow-ups, interviews, assessments, and outcome recording.
7. Run the daily view to decide what needs attention.
8. Run stale detection without inferring rejection.
9. Archive only terminal or explicitly abandoned records.

## Source of Truth

Materialized application records are the working state. Event records are the immutable history. Derived indexes are rebuildable and are not source of truth.

