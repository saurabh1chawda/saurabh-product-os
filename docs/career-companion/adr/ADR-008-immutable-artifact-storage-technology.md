# ADR-008: Immutable Artifact Storage Technology

## 1. Executive Summary

Status: Accepted

Date: 2026-07-21

Authors:

- Career Companion Architecture

Decision Category: Technology / Artifact Storage

Selected Technology: S3-compatible Object Storage

Career Companion will use S3-compatible object storage for immutable business artifact content. PostgreSQL remains the authoritative store for artifact metadata, workflow references, approval status, evidence metadata, lifecycle state, storage keys, content hashes, retention metadata, and audit metadata.

This ADR governs immutable artifact content only. It does not select technology for workflow state, metadata, search, cache, vector storage, analytics, or binary content embedded in PostgreSQL.

## 2. Context

Career Companion architecture is frozen. ADR-007 selected PostgreSQL as the authoritative transactional store for business state and metadata. ADR-008 selects the complementary storage technology for immutable artifact content.

Artifact content includes:

- Resume PDFs.
- Resume DOCX files.
- Cover letters.
- Application packages.
- JD snapshots.
- Generated reports.
- Evidence attachments.
- Portfolio exports.
- Screenshots.

The architecture requires artifact metadata and artifact content to remain separate:

- PostgreSQL stores authoritative metadata, references, versions, approvals, evidence links, storage keys, hashes, and lifecycle status.
- Immutable artifact storage stores the binary or document content addressed by those metadata records.

## 3. Problem Statement

Career Companion needs a durable storage technology for immutable artifact content that preserves artifact integrity, supports content immutability, scales independently from transactional metadata, and avoids overloading PostgreSQL with binary document storage.

The selected technology must support:

- Immutable or WORM-style retention where configured.
- Versioned object content.
- Content-addressable or deterministic key strategy.
- Large binary and document files.
- Strong access control boundaries.
- Retention and deletion governance.
- Hash verification.
- Metadata-to-content traceability through PostgreSQL.
- Future portability across providers or local-compatible implementations.

The decision needed is which artifact-content storage technology best satisfies the frozen architecture and ADR-006 evaluation principles.

## 4. Architectural Constraints

ADR-001 requires repository-owned persistence and aggregate boundaries. Artifact metadata belongs to the Artifact Repository; object content storage must not become the artifact metadata authority.

ADR-002 requires governed runtime execution and explicit commits. Artifact content storage must participate through governed artifact registration and must not silently create approved artifacts.

ADR-003 requires stateless workflow coordination and resume from latest governed commit. Artifact content must be referenced from authoritative metadata, not runtime memory.

ADR-004 classifies immutable business artifacts separately from transactional business state, search, cache, advisory memory, and configuration.

ADR-005 defines platform services and document/file management as shared support services, not business capabilities.

ADR-006 requires architecture-driven technology evaluation.

ADR-007 keeps PostgreSQL authoritative for metadata and excludes binary document storage from the transactional store decision.

## 5. Capability Requirements

Required capabilities:

- Store immutable binary and document artifacts.
- Support object-level identity and exact version references.
- Support retention controls or WORM-style immutability.
- Support legal hold or equivalent retention protection where available.
- Support durable storage for PDFs, DOCX, reports, snapshots, images, and evidence attachments.
- Support object metadata sufficient for operational verification without replacing PostgreSQL metadata.
- Support content hash validation.
- Support least-privilege access patterns.
- Support lifecycle and retention policies.
- Support migration/export to another compatible store.
- Support local-first or development-compatible options.
- Scale independently from transactional metadata.

Non-requirements for this ADR:

- Workflow state storage.
- Artifact metadata authority.
- Search indexing.
- Cache.
- Vector similarity.
- Analytics.
- Relational queries.

## 6. Candidate Technologies

### S3-compatible Object Storage

S3-compatible object storage is an object-storage capability category based on widely adopted S3 semantics. Amazon S3 Object Lock documentation describes WORM behavior that can prevent object versions from being deleted or overwritten for a fixed period or indefinitely, with retention periods and legal holds. The broader S3-compatible API ecosystem also supports provider portability and local-compatible development options.

### Azure Blob Storage

Azure Blob Storage supports immutable storage for blob data in a WORM state, including time-based retention policies and legal hold policies. It is a strong managed object storage option with mature immutability features, but its API and operational model are more provider-specific than an S3-compatible strategy.

### Google Cloud Storage

Google Cloud Storage supports Object Retention Lock, including per-object retention configurations and locked retention behavior. It is a strong managed object storage option, but it is provider-specific and less aligned with the desired S3-compatible portability strategy.

### Network File System

Network file systems provide file-like access and can be simple to understand. They are weaker for object-level immutability, content-addressable artifact patterns, provider portability, and cloud/object lifecycle controls.

### PostgreSQL Large Objects / Binary Storage

PostgreSQL Large Objects support stream-style access to large user data. PostgreSQL documentation describes Large Objects as stored in PostgreSQL system tables and accessible through a read/write API. This is useful for some database-contained binary data, but it conflicts with ADR-007's scope separation and would couple binary artifact scale to the transactional metadata store.

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

| Criterion | Weight | S3-compatible Object Storage | Azure Blob Storage | Google Cloud Storage | Network File System | PostgreSQL Large Objects |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Architecture Alignment | 3 | 5 | 4 | 4 | 2 | 2 |
| Governance Compatibility | 3 | 5 | 5 | 5 | 2 | 3 |
| Immutability / Retention Fit | 3 | 5 | 5 | 5 | 2 | 2 |
| Metadata Separation | 3 | 5 | 5 | 5 | 3 | 1 |
| Artifact Versioning Fit | 3 | 5 | 5 | 5 | 2 | 2 |
| Provider / Implementation Portability | 3 | 5 | 3 | 3 | 3 | 2 |
| Operational Simplicity | 3 | 4 | 4 | 4 | 3 | 3 |
| Security and Access Control Fit | 3 | 5 | 5 | 5 | 3 | 3 |
| Lifecycle Policy Fit | 2 | 5 | 5 | 5 | 2 | 2 |
| Large Binary / Document Fit | 3 | 5 | 5 | 5 | 4 | 2 |
| Local Development Compatibility | 2 | 4 | 3 | 3 | 5 | 3 |
| Migration Complexity | 3 | 4 | 3 | 3 | 2 | 2 |
| Cost Flexibility | 2 | 4 | 4 | 4 | 3 | 2 |
| Testability | 3 | 4 | 4 | 4 | 3 | 3 |
| Ecosystem Maturity | 2 | 5 | 5 | 5 | 4 | 4 |

Weighted totals:

| Candidate | Weighted Score | Result |
| --- | ---: | --- |
| S3-compatible Object Storage | 212 | Selected |
| Azure Blob Storage | 192 | Strong but provider-specific |
| Google Cloud Storage | 192 | Strong but provider-specific |
| Network File System | 112 | Rejected |
| PostgreSQL Large Objects / Binary Storage | 99 | Rejected |

## 8. Trade-off Analysis

### S3-compatible Object Storage

Advantages:

- Strong fit for immutable artifact content.
- Mature object-storage model for PDFs, DOCX, reports, screenshots, exports, and attachments.
- Supports WORM-style object locking in implementations that provide Object Lock.
- Preserves clean separation between PostgreSQL metadata and artifact content.
- Strong portability across multiple compatible implementations.
- Good local development and migration options.
- Aligns with content-addressable and deterministic key strategies.

Disadvantages:

- Immutability behavior may vary across S3-compatible implementations.
- Requires explicit validation that the selected implementation supports required retention, versioning, and lock behavior.
- Not a metadata authority; PostgreSQL must still track lifecycle, approval, and evidence references.

### Azure Blob Storage

Advantages:

- Strong immutable storage support.
- Mature managed object storage model.
- Good lifecycle and access control capabilities.

Disadvantages:

- Provider-specific API and operational model.
- Less portable than an S3-compatible strategy.
- Better considered if the broader platform later standardizes on its ecosystem.

### Google Cloud Storage

Advantages:

- Strong object retention lock capability.
- Mature managed object storage model.
- Good lifecycle and access control capabilities.

Disadvantages:

- Provider-specific API and operational model.
- Less portable than an S3-compatible strategy.
- Better considered if the broader platform later standardizes on its ecosystem.

### Network File System

Advantages:

- Simple file semantics.
- Easy local inspection.
- Good for simple local-only prototypes.

Disadvantages:

- Weak artifact immutability model.
- Weaker lifecycle and retention governance.
- Poor fit for object-level versioned artifact references.
- Harder to make provider-portable and recovery-safe.

### PostgreSQL Large Objects / Binary Storage

Advantages:

- Keeps binary data near transactional metadata.
- Can be transactionally coordinated with metadata.
- Familiar if PostgreSQL is already selected.

Disadvantages:

- Violates ADR-007's separation of authoritative metadata from binary artifact content.
- Couples binary file growth to transactional store operations.
- Weaker fit for object retention, lifecycle, and artifact portability.
- Increases backup, restore, and operational load on the system of record.

## 9. Selected Technology

S3-compatible Object Storage is selected for immutable artifact content.

It will store:

- Resume PDFs.
- Resume DOCX files.
- Cover letters.
- Application packages.
- JD snapshots.
- Generated reports.
- Evidence attachments.
- Portfolio exports.
- Screenshots.

PostgreSQL remains authoritative for:

- Artifact ID.
- Artifact type.
- Artifact version.
- Storage key.
- Content hash.
- Content size.
- MIME type.
- Approval status.
- Lifecycle status.
- Evidence references.
- Workflow references.
- Retention metadata.
- Audit metadata.

## 10. Artifact Immutability Contract

Artifact content is immutable after registration.

Rules:

- Registered artifact content must not be overwritten.
- Approved artifact content must not be mutated.
- Corrections require a new artifact version and new storage key.
- PostgreSQL stores the authoritative artifact metadata and lifecycle state.
- Object storage stores content bytes only.
- Content hash must be calculated before or during registration and stored in PostgreSQL.
- Reads must verify the expected artifact version and storage key.
- Deletion must follow retention policy, lifecycle policy, audit requirements, and privacy governance.
- Legal hold or retention lock must be supported by the selected implementation where required.

Artifact content authority is established by the pair:

```text
PostgreSQL Artifact Metadata
    +
Immutable Object Content
```

Neither side alone is sufficient for artifact authority.

## 11. Storage Key Strategy

Storage keys must be deterministic, version-aware, and non-sensitive.

Recommended key shape:

```text
career-companion/artifacts/{artifact_type}/{artifact_id}/v{artifact_version}/{content_hash}.{extension}
```

Rules:

- Do not include recruiter names, private notes, compensation, personal identifiers, or sensitive application details in keys.
- Use artifact IDs and versions rather than human-readable private content.
- Include content hash or checksum where practical.
- Store original filename only in PostgreSQL metadata if needed and privacy-approved.
- Never overwrite an existing key for a registered artifact version.
- New content requires a new version or new artifact ID.
- Store storage provider, bucket/container equivalent, key, version ID where available, content hash, size, MIME type, and created timestamp in PostgreSQL.

## 12. Risks

- S3-compatible implementations may differ in retention lock, legal hold, versioning, and policy behavior.
- Misconfigured buckets or equivalent storage scopes could allow overwrites or deletes.
- Sensitive information could leak through object keys if naming rules are ignored.
- Object content and PostgreSQL metadata could drift if registration is not governed.
- Artifact deletion and retention may conflict with privacy or legal requirements.

Mitigations:

- Require implementation capability verification before production use.
- Keep keys non-sensitive.
- Store content hashes in PostgreSQL.
- Validate object existence and hash during artifact QA.
- Use versioning and retention controls where required.
- Treat artifact registration as a governed commit.
- Audit creation, approval, access where required, deletion, and retention changes.

## 13. Migration Strategy

Initial migration strategy:

- Store new immutable artifact content in S3-compatible object storage.
- Store all authoritative metadata in PostgreSQL.
- Use deterministic, version-aware storage keys.
- Calculate and store content hashes.
- Do not migrate existing local artifacts unless a future migration plan is approved.

Future migration strategy:

- Export object content by storage key and version.
- Preserve artifact IDs, versions, hashes, MIME types, sizes, lifecycle status, and evidence references.
- Rehydrate metadata references in PostgreSQL if storage location changes.
- Verify migrated content through hashes.
- Preserve audit history for migration events.

## 14. Future Evolution

Future ADRs may define:

- Specific S3-compatible implementation.
- Retention and legal hold policy.
- Artifact encryption strategy.
- Artifact access URL strategy.
- Artifact backup and archival strategy.
- Cross-region replication or redundancy strategy.
- Object lifecycle and deletion policy.

This ADR should be reviewed if:

- Immutable artifact storage requirements exceed S3-compatible behavior.
- The platform standardizes on a provider-specific ecosystem.
- Retention lock behavior differs materially across selected implementations.
- Binary artifact volume or compliance requirements change significantly.
- Privacy requirements require a different artifact handling model.

## 15. Alternatives Rejected

### Azure Blob Storage

Rejected as the default strategy because it is provider-specific. It remains a strong option if a future provider-specific platform decision justifies it.

### Google Cloud Storage

Rejected as the default strategy because it is provider-specific. It remains a strong option if a future provider-specific platform decision justifies it.

### Network File System

Rejected because it is weaker for immutable, versioned, governed artifact storage and lifecycle policy.

### PostgreSQL Large Objects / Binary Storage

Rejected because binary artifact content should not be coupled to the authoritative transactional metadata store selected in ADR-007.

## 16. Validation Checklist

Future implementation must validate:

- Artifact metadata is stored in PostgreSQL.
- Artifact content is stored in S3-compatible object storage.
- Registered artifact keys are never overwritten.
- Approved artifacts require new versions for changes.
- Content hash is stored and verified.
- Object version ID or equivalent is stored where available.
- Storage keys contain no sensitive human-readable content.
- Retention lock or equivalent is enabled where required.
- Legal hold or equivalent is available where required.
- Artifact registration is audited.
- Artifact retrieval verifies artifact ID, version, storage key, and hash.
- PostgreSQL Large Objects are not used for artifact content by default.
- Object storage is not treated as metadata authority.

## 17. Architecture Review Board Decision

Architecture Alignment: PASS

Governance Compliance: PASS

Operational Risk: ACCEPTABLE

Migration Complexity: ACCEPTABLE

Decision: Accepted. S3-compatible Object Storage is approved for immutable Career Companion artifact content.

## References

- [ADR-001: Persistence Model & Repository Strategy](ADR-001-persistence-model-and-repository-strategy.md)
- [ADR-004: Information Storage Strategy](ADR-004-information-storage-strategy.md)
- [ADR-006: Technology Evaluation & Selection Principles](ADR-006-technology-evaluation-and-selection-principles.md)
- [ADR-007: Authoritative Transactional Store Technology](ADR-007-authoritative-transactional-store-technology.md)
- [Architecture Principles](../architecture-principles.md)
- [Artifact Model](../artifact-model.md)
- [Persistence Architecture](../persistence-architecture.md)
- [Memory & Evidence Architecture](../memory-evidence-architecture.md)
- [Amazon S3 Object Lock](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html)
- [Azure Blob Storage Immutable Storage Overview](https://learn.microsoft.com/en-us/azure/storage/blobs/immutable-storage-overview)
- [Google Cloud Storage Object Retention Lock](https://docs.cloud.google.com/storage/docs/object-lock)
- [PostgreSQL Large Objects](https://www.postgresql.org/docs/current/lo-intro.html)
