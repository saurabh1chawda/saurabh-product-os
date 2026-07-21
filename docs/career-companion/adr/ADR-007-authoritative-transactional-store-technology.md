# ADR-007: Authoritative Transactional Store Technology

## 1. Executive Summary

Status: Accepted

Date: 2026-07-21

Authors:

- Career Companion Architecture

Decision Category: Technology / Transactional Storage

Selected Technology: PostgreSQL

Career Companion will use PostgreSQL as the authoritative transactional store for persisted business state and metadata. PostgreSQL is selected because it best satisfies Career Companion's architecture-first requirements for relational aggregate ownership, transactional consistency, optimistic concurrency, reference integrity, metadata flexibility, auditability, maintainability, operational maturity, and future portability.

This ADR selects the system-of-record transactional database only. It does not select object storage, search, vector storage, cache, analytics, binary document storage, cloud providers, infrastructure, APIs, or implementation code.

## 2. Context

Career Companion architecture is frozen. The accepted ADRs establish the constraints for this technology decision:

- ADR-001 requires aggregate-owned repositories and repository-per-aggregate persistence boundaries.
- ADR-002 requires governed runtime execution with explicit commit, failure, timeout, cancellation, and recovery behavior.
- ADR-003 requires stateless workflow coordination that resumes from the latest governed commit.
- ADR-004 requires information-class-driven storage where transactional business state is authoritative, search is derived, cache is disposable, and advisory memory is never authoritative.
- ADR-005 requires platform services with deterministic, versioned, explicit contracts.
- ADR-006 requires architecture-driven technology evaluation.

The authoritative transactional store must persist:

- Workflow Instances.
- Artifact metadata.
- Evidence metadata.
- Approval registry.
- Audit metadata.
- Capability registry.
- Policy registry.
- Configuration metadata.

The authoritative transactional store must not be treated as the final storage answer for every information class. Search, cache, object storage, vector storage, analytics, and binary documents remain separate future decisions.

## 3. Problem Statement

Career Companion needs a durable system of record for authoritative business state and metadata.

The transactional store must support:

- Strong consistency for Workflow Instance state.
- Aggregate-owned repository boundaries.
- Optimistic concurrency.
- Idempotency.
- Immutable approved artifact metadata.
- Immutable evidence metadata.
- Append-oriented audit metadata.
- Versioned registries.
- Transactional integrity across governed commits.
- Recovery from the latest authoritative projection and snapshot metadata.

The decision needed is which storage technology should serve as the authoritative transactional store without distorting the frozen architecture.

## 4. Architectural Constraints

### ADR-001: Persistence Model & Repository Strategy

The store must support aggregate-owned repositories, exact IDs, exact versions, no shared writes, optimistic concurrency, idempotency, and repository-owned persistence boundaries.

### ADR-002: Runtime Execution Strategy

The store must support explicit commit boundaries, failure-safe persistence, stale update rejection, retry behavior, and recovery from authoritative records.

### ADR-003: Workflow Coordination Strategy

The store must support resume from the latest governed commit, not runtime memory.

### ADR-004: Information Storage Strategy

The store must support authoritative transactional business state while keeping search, cache, advisory memory, and binary artifact storage conceptually separate.

### ADR-005: Platform Services Strategy

The store must support service metadata for policies, capabilities, configuration, audit, and version registries without forcing platform services to own business workflow behavior.

### ADR-006: Technology Evaluation & Selection Principles

Selection must be architecture-driven, evidence-based, replaceability-aware, testable, operationally honest, and migration-conscious.

## 5. Capability Requirements

Required capabilities:

- ACID transactions.
- Strong referential integrity.
- Relational modeling for aggregate metadata and references.
- Optimistic concurrency through version fields or equivalent expected-version checks.
- Idempotency records or unique operation keys.
- Append-oriented audit metadata.
- Snapshot metadata persistence.
- Structured and semi-structured metadata support.
- Indexing for workflow, registry, policy, evidence, and audit queries.
- Mature backup, restore, migration, and operational tooling.
- Strong ecosystem support.
- Compatibility with repository-per-aggregate implementation.
- Local-first development feasibility.
- Clear future migration path.

Non-requirements for this ADR:

- Full-text search as the primary search architecture.
- Vector similarity.
- Binary document storage.
- Object storage.
- Analytics warehouse behavior.
- Disposable cache behavior.

## 6. Candidate Technologies

### PostgreSQL

PostgreSQL is a relational database with mature transaction isolation, indexing, constraints, structured data modeling, and support for semi-structured metadata through JSON types. PostgreSQL's current documentation describes transaction isolation levels including Serializable and notes that applications using Serializable must be prepared to retry transactions on serialization failures.

### MySQL

MySQL with InnoDB provides ACID-oriented transactional behavior, row-level locking, MVCC, and a mature operational ecosystem. MySQL documentation describes InnoDB as ACID-oriented and its transaction model as combining multi-versioning with row-level locking. MySQL supports JSON metadata, though JSON indexing patterns are less direct than PostgreSQL's JSONB indexing model.

### MongoDB

MongoDB provides a document model with atomic single-document writes and supports multi-document ACID transactions. It is strong where aggregate data naturally fits document boundaries. Career Companion's authoritative transactional store, however, requires rich cross-aggregate metadata relationships, references, version checks, registries, and audit trails that are more naturally represented relationally.

### Distributed SQL Technology Category

Distributed SQL offers relational semantics with distributed consistency and horizontal scalability. It is a strong future option if Career Companion needs multi-region resilience, high write scale, or distributed transactional guarantees. It adds operational and conceptual complexity that is not justified for the initial authoritative transactional store.

## 7. Weighted Evaluation Matrix

Scoring:

- 5: Strong fit with low risk.
- 4: Good fit with manageable risk.
- 3: Acceptable fit with known trade-offs.
- 2: Weak fit requiring mitigation.
- 1: Poor fit or significant risk.
- 0: Not compatible.

Weights:

- High = 3
- Medium = 2
- Low = 1

| Criterion | Weight | PostgreSQL | MySQL | MongoDB | Distributed SQL Category |
| --- | ---: | ---: | ---: | ---: | ---: |
| Architecture Alignment | 3 | 5 | 4 | 3 | 4 |
| Governance Compatibility | 3 | 5 | 4 | 3 | 4 |
| Repository-per-Aggregate Fit | 3 | 5 | 4 | 3 | 4 |
| Transactional Integrity | 3 | 5 | 4 | 4 | 5 |
| Reference Integrity | 3 | 5 | 4 | 2 | 4 |
| Optimistic Concurrency Fit | 3 | 5 | 4 | 4 | 4 |
| Metadata Flexibility | 2 | 5 | 4 | 5 | 4 |
| Audit and Snapshot Metadata | 3 | 5 | 4 | 3 | 4 |
| Recovery Support | 3 | 5 | 4 | 3 | 4 |
| Maintainability | 3 | 5 | 4 | 3 | 3 |
| Operational Simplicity | 3 | 4 | 4 | 4 | 2 |
| Security and Privacy Fit | 3 | 5 | 4 | 4 | 4 |
| Performance for Expected Scale | 2 | 4 | 4 | 4 | 4 |
| Migration Complexity | 3 | 4 | 4 | 3 | 2 |
| Testability | 3 | 5 | 4 | 3 | 3 |
| Community and Ecosystem | 2 | 5 | 5 | 5 | 3 |
| Cost and Operational Burden | 2 | 4 | 4 | 4 | 2 |

Weighted totals:

| Candidate | Weighted Score | Result |
| --- | ---: | --- |
| PostgreSQL | 221 | Selected |
| MySQL | 185 | Acceptable but not preferred |
| MongoDB | 157 | Rejected for authoritative transactional store |
| Distributed SQL Category | 169 | Deferred for future scale requirement |

## 8. Trade-off Analysis

### PostgreSQL

Advantages:

- Strong fit for relational aggregate metadata and cross-reference integrity.
- Mature transaction model with isolation levels suitable for expected-version checks and retry-aware concurrency.
- Strong support for constraints, indexes, and structured metadata.
- JSONB support allows controlled semi-structured metadata without abandoning relational integrity.
- Strong operational maturity and broad ecosystem.
- Good balance between architecture fit and operational simplicity.

Disadvantages:

- Requires deliberate schema and migration discipline.
- Not a substitute for dedicated search, cache, vector, object, or binary storage.
- Horizontal distributed transactional scale is not the initial optimization target.

### MySQL

Advantages:

- Mature relational database with ACID-capable InnoDB.
- Strong ecosystem and operational familiarity.
- Good fit for structured metadata and repository boundaries.

Disadvantages:

- Less attractive than PostgreSQL for mixed relational plus semi-structured metadata.
- JSON indexing and metadata flexibility are less clean for Career Companion's expected registry and artifact metadata use.
- Comparable relational strengths but weaker overall fit for this architecture.

### MongoDB

Advantages:

- Strong document model for flexible aggregate documents.
- Multi-document transactions are available.
- Good fit when data primarily follows document boundaries.

Disadvantages:

- Career Companion's system of record depends heavily on cross-aggregate references, versioned registries, audit metadata, approval references, and recovery metadata.
- It increases the risk of embedding mutable business structures or weakening explicit relational reference integrity.
- Better suited for some document storage use cases than the authoritative transactional metadata store.

### Distributed SQL Technology Category

Advantages:

- Strong fit for future distributed consistency and scale scenarios.
- Relational model can align with aggregate repositories.
- Strong potential for high availability and geographic resilience.

Disadvantages:

- Higher operational complexity.
- Retry and transaction behavior can be more demanding.
- Premature for expected Career Companion pilot and early production scale.
- Better deferred until scale, resilience, or distribution needs become concrete.

## 9. Selected Technology

PostgreSQL is selected as the authoritative transactional store technology for Career Companion.

PostgreSQL will be used for:

- Workflow Instance records.
- Artifact metadata.
- Evidence metadata.
- Approval registry records.
- Audit metadata.
- Capability registry records.
- Policy registry records.
- Configuration metadata.

PostgreSQL is not selected for:

- Binary document storage.
- Object storage.
- Dedicated search.
- Vector storage.
- Cache.
- Analytics.

## 10. Decision Rationale

PostgreSQL best satisfies the architecture-first decision criteria:

- It supports aggregate-owned repository implementation.
- It supports transactional consistency and rollback semantics required for governed commits.
- It supports reference integrity for cross-aggregate metadata.
- It supports optimistic concurrency through explicit version fields and transaction checks.
- It supports idempotency through unique keys and transactional writes.
- It supports append-oriented audit metadata.
- It supports structured registry data and semi-structured metadata.
- It has broad operational maturity and strong ecosystem support.
- It keeps the system simple enough for early implementation while preserving future migration options.

The selected technology aligns with the Career Companion principle that technology serves architecture.

## 11. Why Event Sourcing Was Not Selected

Event sourcing was not selected as the primary persistence model for the authoritative transactional store.

Reason:

- ADR-001 already defines aggregate-owned repositories, immutable audit, snapshots, and recovery records without requiring event sourcing.
- Career Companion needs inspectable current state, strict repository boundaries, and operational simplicity for early implementation.
- Event sourcing would add modeling, replay, migration, and operational complexity before the platform has proven the need.
- Audit and recovery requirements can be satisfied through append-oriented audit records, snapshots, aggregate versions, and governed recovery without making the entire persistence model event-sourced.

Event sourcing remains a future option for specific aggregates only if a later ADR proves the need and preserves ADR-001 through ADR-006.

## 12. Risks

- Schema design could become too rigid if metadata evolution is not handled carefully.
- JSONB fields could be overused and weaken relational clarity.
- PostgreSQL could become overloaded with search, cache, document, or analytics responsibilities outside this ADR's scope.
- Poor migration discipline could weaken versioning and recovery.
- Concurrency behavior must be tested carefully for governed commit and retry cases.

Mitigations:

- Use repository-per-aggregate boundaries.
- Keep authoritative metadata relational where meaning is stable.
- Use semi-structured metadata only where flexibility is justified.
- Keep search, cache, object storage, vector storage, and analytics as separate future decisions.
- Add validation for optimistic concurrency, idempotency, audit append behavior, and recovery.

## 13. Migration Strategy

Initial migration strategy:

- Define aggregate-owned schemas from ADR-001.
- Establish explicit version fields for optimistic concurrency.
- Establish unique operation keys for idempotency where needed.
- Store exact artifact, evidence, approval, snapshot, audit, policy, capability, and configuration references.
- Keep binary document content out of PostgreSQL unless a future ADR explicitly changes scope.
- Treat schema migrations as governed implementation changes.

Future migration strategy:

- Preserve aggregate IDs and version history.
- Preserve approved artifact metadata and evidence metadata immutability.
- Preserve audit metadata append history.
- Preserve Workflow Instance recovery state.
- Maintain export paths for future technology migration.

## 14. Future Evolution

Future ADRs may select additional technologies for:

- Object or binary document storage.
- Dedicated search.
- Cache.
- Vector memory.
- Analytics.
- Backup and archival strategy.

PostgreSQL may continue to serve as the authoritative transactional metadata store even when specialized storage technologies are added for derived, disposable, advisory, or binary information classes.

This ADR should be reviewed if:

- Career Companion requires distributed transactional scale.
- Multi-region write requirements become concrete.
- Transactional metadata volume grows beyond PostgreSQL's practical operational profile.
- Repository boundaries cannot be implemented cleanly.
- Recovery requirements require a different persistence pattern.

## 15. Alternatives Rejected

### MySQL

Rejected as the selected technology, though acceptable as a relational fallback. PostgreSQL provides a stronger fit for Career Companion's combined relational integrity, metadata flexibility, JSONB support, and architecture-governed repository strategy.

### MongoDB

Rejected for authoritative transactional metadata storage. MongoDB remains potentially useful for document-shaped information in future decisions, but Career Companion's system-of-record metadata is more relational and reference-heavy.

### Distributed SQL Technology Category

Deferred. Distributed SQL is attractive for future high-availability or distributed transactional scale, but its complexity is not justified for the initial authoritative transactional store.

### Event Sourcing

Rejected as the primary persistence model. Audit, snapshots, aggregate versions, and recovery records satisfy current architectural needs with less operational complexity.

## 16. Validation Checklist

Future implementation must validate:

- Workflow Instance repository supports expected-version checks.
- Artifact metadata repository preserves approved version immutability.
- Evidence metadata repository preserves evidence immutability.
- Approval registry references exact gates and artifact versions.
- Audit metadata is append-oriented.
- Snapshot metadata records exact projection references.
- Capability registry supports versioned capability metadata.
- Policy registry supports versioned policy metadata.
- Configuration metadata supports versioning and scope.
- Idempotency keys prevent duplicate governed commits.
- Stale commits are rejected.
- Recovery can locate latest valid projection and snapshot metadata.
- PostgreSQL is not used as cache, search, vector store, analytics store, or binary document store by default.

## 17. Architecture Review Board Decision

Architecture Alignment: PASS

Governance Compliance: PASS

Operational Risk: ACCEPTABLE

Migration Complexity: ACCEPTABLE

Decision: Accepted. PostgreSQL is approved as the authoritative transactional store technology for Career Companion.

## References

- [ADR-001: Persistence Model & Repository Strategy](ADR-001-persistence-model-and-repository-strategy.md)
- [ADR-002: Runtime Execution Strategy](ADR-002-runtime-execution-strategy.md)
- [ADR-003: Workflow Coordination Strategy](ADR-003-workflow-coordination-strategy.md)
- [ADR-004: Information Storage Strategy](ADR-004-information-storage-strategy.md)
- [ADR-005: Platform Services Strategy](ADR-005-platform-services-strategy.md)
- [ADR-006: Technology Evaluation & Selection Principles](ADR-006-technology-evaluation-and-selection-principles.md)
- [Architecture Principles](../architecture-principles.md)
- [Persistence Architecture](../persistence-architecture.md)
- [Runtime Architecture](../runtime-architecture.md)
- [Workflow Instance](../workflow-instance.md)
- [PostgreSQL Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [PostgreSQL JSON Types and JSONB Indexing](https://www.postgresql.org/docs/current/datatype-json.html)
- [MySQL InnoDB and the ACID Model](https://dev.mysql.com/doc/refman/8.0/en/mysql-acid.html)
- [MySQL JSON Data Type](https://dev.mysql.com/doc/refman/8.4/en/json.html)
- [MongoDB Transactions](https://www.mongodb.com/docs/manual/core/transactions/)
