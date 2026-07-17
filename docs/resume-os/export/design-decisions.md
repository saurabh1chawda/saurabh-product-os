# Export Design Decisions

Last updated: 2026-07-17

## Decision 1: Renderer, Not Author

The Export Engine intentionally operates after human review. It cannot rewrite or optimize wording.

## Decision 2: Dependency-Light Generation

The initial implementation uses deterministic local document writers so Resume OS export validation does not depend on a hosted service.

## Decision 3: ATS Before Decoration

The default design is intentionally conservative: single column, no tables, no graphics, and standard headings.

## Decision 4: Warn Instead of Rewrite

If pagination or density is risky, the exporter records warnings. It does not shorten summaries or bullets.

## Decision 5: Fixture Outputs Are Sanitized

Fixture exports use synthetic or redacted contact data and remain safe to commit.

