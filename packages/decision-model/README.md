# Decision Model

Decision Model defines the canonical Decision Domain Language for Career Companion.

It provides immutable models, value objects, enums, and contracts used by decision pipelines and future decision consumers. It contains no algorithms, orchestration, persistence, repositories, infrastructure, APIs, workflows, or AI execution.

## Boundary

- Owns decision vocabulary only.
- Depends only on the shared kernel.
- Exposes immutable decision language contracts.
- Does not depend on Career Knowledge, Career Intelligence, or Decision Engine.

