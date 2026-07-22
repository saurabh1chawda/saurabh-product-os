# Career Companion Tech Stack

## 1. Executive Summary

This document defines the approved technology stack baseline for Career Companion engineering bootstrap.

The stack follows the Architecture Blueprint v1.0 and ADR-001 through ADR-010. It identifies technology selections that have already been accepted and keeps all unselected implementation choices open until governed by future ADRs.

This document is an engineering onboarding guide. It does not replace architecture, ADRs, or implementation specifications.

## 2. Source of Truth

Engineers should use these documents as the authority for technology decisions:

- [Architecture Blueprint v1.0](../architecture/architecture-blueprint-v1.md)
- [ADR Index](../adr/index.md)
- [Implementation Roadmap](../implementation/implementation-roadmap.md)
- [Project Structure](../implementation/project-structure.md)
- [Engineering Standards](../implementation/engineering-standards.md)
- [Architecture Traceability Matrix](../implementation/architecture-traceability.md)

When this document conflicts with an ADR, the ADR wins.

## 3. Approved Technology Selections

| Concern | Approved Selection | Authority |
| --- | --- | --- |
| Authoritative transactional state and metadata | PostgreSQL | [ADR-007](../adr/ADR-007-authoritative-transactional-store-technology.md) |
| Immutable artifact content | S3-compatible object storage | [ADR-008](../adr/ADR-008-immutable-artifact-storage-technology.md) |
| Derived search and retrieval | OpenSearch | [ADR-009](../adr/ADR-009-derived-search-and-retrieval-platform.md) |
| AI execution platform and model gateway | LiteLLM | [ADR-010](../adr/ADR-010-ai-execution-platform-and-model-gateway-strategy.md) |

## 4. Technology Boundaries

PostgreSQL is authoritative for workflow instances, artifact metadata, evidence metadata, approvals, audit metadata, capability registry metadata, policy registry metadata, and configuration metadata.

S3-compatible object storage is authoritative for immutable artifact content, including generated documents, JD snapshots, reports, exports, screenshots, and evidence attachments.

OpenSearch is a derived projection. Search indexes must be rebuildable from authoritative sources and must never become the system of record.

LiteLLM is the approved AI execution gateway. Capabilities must not call model providers directly.

## 5. Explicitly Deferred Decisions

The following choices are not selected by this document:

- Programming language.
- Web framework.
- API framework.
- ORM or database migration tool.
- Test runner.
- Package manager.
- UI framework.
- Deployment platform.
- CI/CD platform.
- Observability vendor.
- Secrets provider.
- Authentication provider.

Deferred decisions require future ADRs when they materially affect architecture, operations, security, portability, or long-term maintainability.

## 6. Engineering Use

Engineers should use the approved stack to guide local environment planning, module design, integration boundaries, testing strategy, and future ADR proposals.

Technology use must preserve:

- Modular monolith structure for v1.
- Repository-per-aggregate persistence.
- Derived-only search.
- Immutable artifact content.
- Provider-independent AI execution.
- Human approval before consequential actions.
- Auditability and traceability.

## 7. Prohibited Technology Patterns

- Direct provider SDK calls from capabilities.
- Search as authoritative storage.
- Artifact binaries embedded in transactional metadata records.
- Runtime sessions persisted as business truth.
- Shared mutable state across modules.
- Technology-specific business logic inside domain components.
- Infrastructure dependencies inside domain modules.
- Unapproved replacement of accepted ADR technology selections.

## 8. Future Evolution

Future technology decisions should follow [ADR-006](../adr/ADR-006-technology-evaluation-and-selection-principles.md).

Each future technology ADR should state:

- Architecture alignment.
- Affected modules.
- Evaluation criteria.
- Alternatives considered.
- Migration considerations.
- Operational impact.
- Security and privacy implications.
- Exit or replacement strategy.

