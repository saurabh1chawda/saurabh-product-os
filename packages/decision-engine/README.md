# Decision Engine

Decision Engine coordinates deterministic Career Intelligence services into immutable decision pipelines.

It owns pipeline orchestration only. It does not own business algorithms, aggregates, persistence, repositories, workflow execution, APIs, infrastructure, AI, retrieval, logging, telemetry, or external integrations.

## Boundary

- Reads Career Knowledge snapshots through pipeline context.
- Coordinates Career Intelligence services.
- Produces immutable decision results and traces.
- Does not mutate domain objects or recommendation inputs.

