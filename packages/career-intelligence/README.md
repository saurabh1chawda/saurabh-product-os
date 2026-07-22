# Career Intelligence

Career Intelligence is a deterministic reasoning bounded context for Career Companion.

It consumes read-only Career Knowledge snapshots and returns immutable recommendation objects. It does not own aggregates, persistence, repositories, workflow execution, APIs, infrastructure, AI execution, prompts, embeddings, retrieval, or external integrations.

## Boundary

- Reads Career Knowledge domain snapshots.
- Produces recommendations, rankings, coverage summaries, gaps, and explanations.
- Does not mutate input objects.
- Does not create authoritative career facts.
- Does not call AI providers or platform infrastructure.

