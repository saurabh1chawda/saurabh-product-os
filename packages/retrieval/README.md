# Retrieval

Retrieval defines technology-agnostic retrieval contracts for Career Companion.

It describes what can be retrieved, how retrieval intent is expressed, and how retrieval results are shaped. It does not define how retrieval is executed.

## Boundary

- Owns query models, filters, sorting, pagination, specifications, retrieval contracts, and result models.
- Depends only on the shared kernel.
- Does not contain SQL, ORM mappings, repositories, persistence, infrastructure, AI, HTTP, GraphQL, OpenSearch, Qdrant, Neo4j, or implementations.

