# Design Decisions

Last updated: 2026-07-18

## Local First

The registry uses local JSON files so it can operate without a hosted database or external SaaS dependency.

## Events Are Append-Only

Materialized application records are editable through commands, but events preserve a history of material changes.

## References, Not Resume Content

Resume OS artifacts are linked by path, hash, version, and commit. Resume content is not copied into the registry.

## Synthetic Fixtures Are Public

Committed fixtures are sanitized and marked safe to commit. Real records live only under the ignored private path.

## Stale Does Not Mean Rejected

Stale detection explains why a record needs attention but never infers rejection.

