# ADR-009: Derived Search & Retrieval Platform

## 1. Executive Summary

Status: Accepted

Date: 2026-07-21

Authors:

- Career Companion Architecture

Decision Category: Technology / Derived Search

Selected Technology: OpenSearch

Career Companion will use OpenSearch as the derived search and retrieval platform. Search indexes are derived projections from PostgreSQL metadata, immutable artifact content, approved text extraction, registries, reports, and portfolio exports. Search must never become authoritative for workflow state, artifact authority, metadata authority, evidence authority, approval state, or audit truth.

This ADR selects technology for derived search and retrieval only. It does not select cache, analytics, workflow authority, metadata authority, artifact authority, vector memory, or object storage.

## 2. Context

Career Companion architecture is frozen. ADR-007 selected PostgreSQL as the authoritative transactional store. ADR-008 selected S3-compatible object storage for immutable artifact content. ADR-004 defines search as derived and rebuildable.

Career Companion needs a retrieval layer that can index and search:

- Workflow metadata.
- Artifact metadata.
- Evidence metadata.
- Registry metadata.
- Resume text.
- JD text.
- Reports.
- Portfolio exports.

Search supports discovery, review, operational navigation, evidence lookup, and future retrieval-assisted workflows. It must remain downstream from authoritative records.

## 3. Problem Statement

Career Companion needs a search platform that can provide fast, relevant retrieval across structured metadata and unstructured text while preserving the principle that search is derived.

The platform must support:

- Full-text search across resumes, JDs, reports, and exports.
- Metadata filtering across workflow, artifact, evidence, and registry fields.
- Relevance ranking.
- Rebuildable indexes.
- Search document versioning.
- Future hybrid retrieval where justified.
- Clear separation from authoritative PostgreSQL metadata and immutable artifact storage.

The decision needed is which search platform best supports derived search without becoming the system of record.

## 4. Architectural Constraints

ADR-001: repositories own authoritative persistence. Search must not become a repository of record.

ADR-002: runtime execution must commit through governed boundaries. Search indexing must happen after authoritative commit and must not cause workflow progression.

ADR-003: coordination resumes from latest governed commit, not search index state.

ADR-004: search is derived, mutable, rebuildable, and never authoritative.

ADR-005: Search is a platform service, not a business capability.

ADR-006: technology selection must be architecture-driven and evaluation-based.

ADR-007: PostgreSQL remains authoritative for transactional metadata.

ADR-008: object storage remains authoritative for immutable artifact content paired with PostgreSQL metadata.

## 5. Capability Requirements

Required capabilities:

- Full-text search over extracted document text.
- Metadata filters for workflow, artifact, evidence, registry, and lifecycle fields.
- Ranking and relevance tuning.
- Index aliases or equivalent blue-green rebuild support.
- Bulk indexing and reindexing.
- Derived document IDs that reference authoritative records.
- Fielded search across structured and unstructured content.
- Access-control filtering using indexed authorization-relevant metadata.
- Index rebuild from PostgreSQL and artifact text extraction.
- Observability for indexing failures and stale projections.
- Future-compatible support for hybrid keyword and semantic retrieval.

Non-requirements:

- Authoritative workflow state.
- Authoritative artifact metadata.
- Authoritative evidence.
- Cache.
- Analytics warehouse behavior.
- Vector memory as an authoritative store.

## 6. Candidate Technologies

### OpenSearch

OpenSearch provides Lucene-backed full-text queries and supports vector and hybrid search techniques. Its documentation describes full-text query types such as match, phrase, multi-field, query string, and interval queries. It also documents hybrid search that combines traditional keyword search with vector-based semantic search through search pipelines.

### Elasticsearch

Elasticsearch provides mature full-text search and supports combining full-text and semantic/vector approaches. Elastic documentation describes full-text search as analyzed text indexing and notes that it can be combined with semantic search using vectors for hybrid search.

### PostgreSQL Full-text Search

PostgreSQL provides native full-text search through `tsvector` and `tsquery`. PostgreSQL documentation describes these as types designed to support full-text search over natural-language documents. This is attractive for simplicity but risks overloading the authoritative transactional store and blurring derived search from system-of-record metadata.

### Meilisearch

Meilisearch is developer-friendly and supports fast user-facing search. Its current product documentation describes hybrid search that combines keyword precision with semantic search. It is strong for simple product-style search experiences but less aligned with enterprise-derived indexing, rebuild pipelines, and governance-heavy retrieval requirements.

### Typesense

Typesense provides typo-tolerant search, filtering, faceting, sorting, and vector search. Its documentation describes query fields, filters, facets, and vector/semantic/hybrid search. It is strong for lightweight operational search but less mature than OpenSearch for enterprise-scale derived search and advanced operational indexing patterns.

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

| Criterion | Weight | OpenSearch | Elasticsearch | PostgreSQL FTS | Meilisearch | Typesense |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Architecture Alignment | 3 | 5 | 4 | 3 | 3 | 3 |
| Derived Search Boundary | 3 | 5 | 5 | 2 | 4 | 4 |
| Full-text Retrieval | 3 | 5 | 5 | 3 | 4 | 4 |
| Metadata Filtering | 3 | 5 | 5 | 4 | 4 | 4 |
| Relevance Tuning | 3 | 5 | 5 | 3 | 3 | 4 |
| Rebuild and Reindex Support | 3 | 5 | 5 | 3 | 3 | 3 |
| Future Hybrid Retrieval | 2 | 5 | 5 | 2 | 4 | 4 |
| Operational Observability | 2 | 4 | 4 | 3 | 3 | 3 |
| Governance Compatibility | 3 | 5 | 4 | 3 | 3 | 3 |
| Maintainability | 3 | 4 | 4 | 4 | 4 | 4 |
| Operational Simplicity | 3 | 3 | 3 | 5 | 5 | 5 |
| Security and Privacy Fit | 3 | 4 | 4 | 4 | 3 | 3 |
| Migration Complexity | 3 | 4 | 4 | 3 | 3 | 3 |
| Testability | 3 | 4 | 4 | 4 | 4 | 4 |
| Ecosystem Maturity | 2 | 5 | 5 | 5 | 4 | 4 |

Weighted totals:

| Candidate | Weighted Score | Result |
| --- | ---: | --- |
| OpenSearch | 196 | Selected |
| Elasticsearch | 190 | Strong but not selected |
| Typesense | 153 | Rejected for canonical platform |
| Meilisearch | 151 | Rejected for canonical platform |
| PostgreSQL Full-text Search | 139 | Rejected for derived platform |

## 8. Trade-off Analysis

### OpenSearch

Advantages:

- Strong full-text search and filtering.
- Clear derived-search separation from PostgreSQL.
- Mature index, alias, reindex, and operational search patterns.
- Strong fit for metadata plus document text retrieval.
- Supports future hybrid retrieval without forcing vector memory authority.
- Open and portable enough for architecture-led implementation.

Disadvantages:

- Higher operational complexity than PostgreSQL full-text search, Meilisearch, or Typesense.
- Requires indexing pipeline discipline.
- Requires careful access-control filtering and stale-index monitoring.

### Elasticsearch

Advantages:

- Mature search platform with strong full-text, relevance, filtering, and hybrid search capabilities.
- Strong ecosystem and operational tooling.

Disadvantages:

- More vendor-product-oriented decision surface.
- Similar capability profile to OpenSearch but less aligned with an open derived-search platform strategy for this project.

### PostgreSQL Full-text Search

Advantages:

- Operationally simple because PostgreSQL is already selected for authoritative metadata.
- Native full-text primitives are strong for basic text search.
- Easy consistency with authoritative metadata.

Disadvantages:

- Risks turning the authoritative transactional store into the derived search platform.
- Weakens ADR-004's separation between authoritative and derived information classes.
- Less suitable for future hybrid retrieval and large text search evolution.
- Search workload could interfere with system-of-record workload.

### Meilisearch

Advantages:

- Very simple developer experience.
- Good user-facing search ergonomics.
- Supports hybrid search in current product direction.

Disadvantages:

- Less aligned with governance-heavy derived index operations.
- Less mature for advanced enterprise search operations and reindex governance.
- Better suited for simple application search than canonical platform retrieval.

### Typesense

Advantages:

- Strong typo-tolerant search, filtering, faceting, and sorting.
- Good developer ergonomics.
- Supports vector and hybrid search.

Disadvantages:

- Less mature than OpenSearch for enterprise derived-search platform governance.
- Better fit for lightweight product search than broad artifact/evidence/report retrieval.

## 9. Selected Technology

OpenSearch is selected as the derived search and retrieval platform for Career Companion.

OpenSearch will index derived projections from:

- PostgreSQL authoritative metadata.
- Extracted text from immutable artifacts.
- Approved report text.
- Registry metadata.
- Evidence metadata.
- Portfolio export text.

OpenSearch will not be authoritative for:

- Workflow state.
- Artifact metadata.
- Artifact content.
- Evidence authority.
- Approval status.
- Audit truth.
- Policy truth.
- Configuration truth.

## 10. Search Authority Rule

Search is derived.

Search results may help users and capabilities locate information, but search results never authorize decisions.

Rules:

- PostgreSQL remains authoritative for metadata.
- S3-compatible object storage remains the artifact content store.
- Search indexes may be deleted and rebuilt without loss of business truth.
- Search staleness must not block recovery from authoritative records.
- Search results must reference authoritative IDs and versions.
- Search must not infer workflow state, approval state, evidence authority, or artifact validity.
- Any consequential decision must rehydrate authoritative records before use.

## 11. Search Projection Pipeline

Canonical search projection flow:

```text
Authoritative Commit
    ↓
Projection Event or Indexing Request
    ↓
Load Authoritative Metadata
    ↓
Extract Approved Text Where Needed
    ↓
Build Search Document
    ↓
Index Derived Projection
    ↓
Record Indexing Result
    ↓
Expose Search Result With Authoritative References
```

Pipeline rules:

- Indexing occurs after authoritative commit.
- Failed indexing does not roll back the authoritative commit.
- Failed indexing creates an operational warning.
- Reindex can rebuild from authoritative sources.
- Search document content must include source IDs and versions.

## 12. Search Consistency Model

Search is eventually consistent with authoritative sources.

Consistency rules:

- Authoritative records win over search documents.
- Search staleness must be detectable.
- Search documents must include source versions.
- Search reads used for consequential actions must be revalidated against authoritative records.
- Rebuilds must be possible from PostgreSQL and immutable artifact text extraction.
- Missing search index entries are operational defects, not missing business records.

## 13. Search Document Contract

Every search document must include:

- Search document ID.
- Source type.
- Source ID.
- Source version.
- Source updated timestamp.
- Index schema version.
- Visibility or authorization scope fields.
- Lifecycle status where relevant.
- Text fields for retrieval.
- Structured metadata fields for filtering.
- Artifact references where relevant.
- Evidence references where relevant.
- Generated timestamp.

Search documents must not include unnecessary private data. Sensitive content must be minimized, scoped, and indexed only where policy allows.

## 14. Search Rebuild Contract

Search indexes must be rebuildable.

Rebuild rules:

- Rebuild from authoritative PostgreSQL metadata and immutable artifact content.
- Preserve source IDs and versions.
- Use index schema versioning.
- Support blue-green or alias-based cutover where implementation permits.
- Validate document counts and source version coverage.
- Record rebuild start, completion, failures, and warnings.
- Treat rebuild failures as operational issues, not authoritative data loss.

## 15. Risks

- Search may be mistakenly treated as authoritative.
- Index staleness may surface outdated records.
- Sensitive data may be over-indexed.
- OpenSearch operational complexity may be higher than lightweight alternatives.
- Future vector or hybrid search features could blur memory/evidence/search boundaries.

Mitigations:

- Enforce Search Authority Rule.
- Store source IDs and versions in every search document.
- Rehydrate authoritative records before consequential use.
- Implement search rebuild validation.
- Minimize sensitive indexed fields.
- Keep vector and semantic retrieval derived, never authoritative.

## 16. Migration Strategy

Initial migration strategy:

- Create derived indexes from PostgreSQL metadata and approved artifact text extraction.
- Keep authoritative metadata in PostgreSQL.
- Keep artifact content in S3-compatible object storage.
- Version search document schemas.
- Support index rebuild from authoritative sources.

Future migration strategy:

- Export search schema and source reference mappings.
- Rebuild target search platform from authoritative sources.
- Validate source coverage, document counts, and version alignment.
- Decommission old indexes only after validation.

## 17. Future Evolution

Future ADRs may define:

- OpenSearch deployment model.
- Index schema strategy.
- Access-control filtering strategy.
- Hybrid retrieval strategy.
- Semantic reranking strategy.
- Search observability strategy.
- Search retention and privacy policy.

This ADR should be reviewed if:

- Search requirements remain simple enough that OpenSearch operational complexity is unjustified.
- Hybrid retrieval becomes central and requires a different platform.
- Privacy constraints materially reduce searchable content.
- Search staleness creates repeated operational defects.
- PostgreSQL full-text search becomes sufficient for all actual usage.

## 18. Alternatives Rejected

### Elasticsearch

Rejected as the default selection despite strong search capabilities. It remains a viable alternative, but OpenSearch better fits the project preference for an open derived-search platform strategy.

### PostgreSQL Full-text Search

Rejected for canonical derived search because it risks coupling search workload and derived projections to the authoritative transactional store.

### Meilisearch

Rejected for the canonical platform because it is optimized for simpler application search and has less enterprise-derived indexing depth than OpenSearch.

### Typesense

Rejected for the canonical platform because it is strong for lightweight product search but less aligned with broad artifact/evidence/report retrieval governance.

## 19. Validation Checklist

Future implementation must validate:

- Search documents include authoritative source IDs and versions.
- Search index can be rebuilt from PostgreSQL and immutable artifact text.
- Search results are rehydrated from authoritative records before consequential use.
- Search does not store workflow authority.
- Search does not store artifact authority.
- Search does not store evidence authority.
- Search indexing failures produce operational warnings.
- Search staleness is detectable.
- Sensitive fields are minimized.
- Access-control filters apply to search queries.
- Index schema versions are tracked.
- Search can be deleted and rebuilt without business data loss.

## 20. Architecture Review Board Decision

Architecture Alignment: PASS

Governance Compliance: PASS

Operational Risk: ACCEPTABLE WITH CONTROLS

Migration Complexity: ACCEPTABLE

Decision: Accepted. OpenSearch is approved as Career Companion's derived search and retrieval platform.

## References

- [ADR-004: Information Storage Strategy](ADR-004-information-storage-strategy.md)
- [ADR-006: Technology Evaluation & Selection Principles](ADR-006-technology-evaluation-and-selection-principles.md)
- [ADR-007: Authoritative Transactional Store Technology](ADR-007-authoritative-transactional-store-technology.md)
- [ADR-008: Immutable Artifact Storage Technology](ADR-008-immutable-artifact-storage-technology.md)
- [Architecture Principles](../architecture-principles.md)
- [Component Architecture](../component-architecture.md)
- [OpenSearch Full-text Queries](https://docs.opensearch.org/latest/query-dsl/full-text/index/)
- [OpenSearch Vector Search Techniques](https://docs.opensearch.org/latest/vector-search/vector-search-techniques/index/)
- [Elasticsearch Full-text Search](https://www.elastic.co/docs/solutions/search/full-text)
- [PostgreSQL Text Search Types](https://www.postgresql.org/docs/current/datatype-textsearch.html)
- [Typesense Search](https://typesense.org/docs/latest/api/search.html)
- [Typesense Vector Search](https://typesense.org/docs/latest/api/vector-search.html)
