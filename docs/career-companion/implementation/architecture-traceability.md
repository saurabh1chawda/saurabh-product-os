# Career Companion Architecture Traceability Matrix

## 1. Executive Summary

This document provides end-to-end traceability across Career Companion business objectives, architecture documents, accepted ADRs, implementation specifications, and future code modules.

It is the governance artifact used to:

- Understand why each architectural element exists.
- Locate the source of truth for each implementation concern.
- Evaluate change impact.
- Guide onboarding.
- Support Architecture Review Board review.
- Prevent architectural drift during implementation.

This matrix references existing architecture and implementation documents. It does not replace them.

## 2. Traceability Principles

- Every implementation module must trace to an approved architecture concern.
- Every material technology decision must trace to an accepted ADR.
- Every aggregate must trace to the Domain Model and ADR-001.
- Every repository must trace to ADR-001, ADR-004, ADR-007, and the Repository Specification.
- Every AI execution path must trace to ADR-010.
- Every search path must trace to ADR-009.
- Every artifact content path must trace to ADR-008.
- Every API command/query must trace to the API Specification.
- Every dependency boundary must trace to the Component Specification and Project Structure.
- Every change must identify affected architecture, ADRs, specifications, and modules.

## 3. Business -> Architecture Mapping

| Business Objective | Architecture Source | Implementation Spec | Future Modules |
| --- | --- | --- | --- |
| Governed AI career assistant | [Product Charter](../product-charter.md), [Architecture Blueprint](../architecture/architecture-blueprint-v1.md) | [Implementation Roadmap](implementation-roadmap.md) | `apps/api`, `apps/console`, `packages/application` |
| Workflow-controlled execution | [Workflow State Machine](../workflow-state-machine.md), [Workflow Instance](../workflow-instance.md) | [Domain Model](domain-model.md), [Component Specification](component-specification.md) | `packages/workflow`, `packages/domain` |
| Human approval before consequential actions | [Architecture Principles](../architecture-principles.md), [Interaction Architecture](../interaction-architecture.md) | [API Specification](api-specification.md), [Engineering Standards](engineering-standards.md) | `packages/workflow`, `packages/application`, `apps/console` |
| Evidence-backed decisions | [Memory & Evidence Architecture](../memory-evidence-architecture.md), [Artifact Model](../artifact-model.md) | [Domain Model](domain-model.md), [Repository Specification](repository-specification.md) | `packages/domain`, `packages/repositories`, `packages/capabilities` |
| Immutable artifacts | [Artifact Model](../artifact-model.md), ADR-008 | [Domain Model](domain-model.md), [Repository Specification](repository-specification.md) | `packages/artifacts`, `packages/infrastructure/object-storage` |
| Provider-independent AI execution | ADR-010, [Capability Architecture](../capability-architecture.md) | [Component Specification](component-specification.md), [Engineering Standards](engineering-standards.md) | `packages/ai-platform`, `packages/infrastructure/litellm` |
| Derived search and retrieval | ADR-009, [Information Architecture](../memory-evidence-architecture.md) | [Component Specification](component-specification.md), [Project Structure](project-structure.md) | `packages/search`, `packages/infrastructure/opensearch` |
| Authoritative transactional state | ADR-001, ADR-007, [Persistence Architecture](../persistence-architecture.md) | [Repository Specification](repository-specification.md) | `packages/repositories`, `packages/infrastructure/postgres` |
| Architecture-governed implementation | [Architecture Principles](../architecture-principles.md), [ADR Framework](../adr-framework.md) | [Engineering Standards](engineering-standards.md), [Project Structure](project-structure.md) | `tests/architecture`, `packages/testing` |

## 4. ADR -> Implementation Mapping

| ADR | Decision | Implementation Specification | Future Module Boundary |
| --- | --- | --- | --- |
| [ADR-001](../adr/ADR-001-persistence-model-and-repository-strategy.md) | Repository-per-aggregate persistence | [Repository Specification](repository-specification.md), [Domain Model](domain-model.md) | `packages/repositories` |
| [ADR-002](../adr/ADR-002-runtime-execution-strategy.md) | One capability per governed execution cycle | [Component Specification](component-specification.md), [API Specification](api-specification.md) | `packages/workflow` |
| [ADR-003](../adr/ADR-003-workflow-coordination-strategy.md) | Stateless governed coordination | [Component Specification](component-specification.md) | `packages/workflow` |
| [ADR-004](../adr/ADR-004-information-storage-strategy.md) | Information-class-driven storage | [Domain Model](domain-model.md), [Repository Specification](repository-specification.md) | `packages/domain`, `packages/repositories`, `packages/search` |
| [ADR-005](../adr/ADR-005-platform-services-strategy.md) | Governed platform service layer | [Component Specification](component-specification.md), [Project Structure](project-structure.md) | `packages/platform-services` |
| [ADR-006](../adr/ADR-006-technology-evaluation-and-selection-principles.md) | Architecture-driven technology selection | [Engineering Standards](engineering-standards.md) | Architecture review process |
| [ADR-007](../adr/ADR-007-authoritative-transactional-store-technology.md) | PostgreSQL for authoritative metadata | [Repository Specification](repository-specification.md), [Project Structure](project-structure.md) | `packages/infrastructure/postgres` |
| [ADR-008](../adr/ADR-008-immutable-artifact-storage-technology.md) | S3-compatible object storage for artifact content | [Domain Model](domain-model.md), [Component Specification](component-specification.md) | `packages/artifacts`, `packages/infrastructure/object-storage` |
| [ADR-009](../adr/ADR-009-derived-search-and-retrieval-platform.md) | OpenSearch for derived search | [API Specification](api-specification.md), [Project Structure](project-structure.md) | `packages/search`, `packages/infrastructure/opensearch` |
| [ADR-010](../adr/ADR-010-ai-execution-platform-and-model-gateway-strategy.md) | LiteLLM as AI execution gateway | [Component Specification](component-specification.md), [Engineering Standards](engineering-standards.md) | `packages/ai-platform`, `packages/infrastructure/litellm` |

## 5. Implementation -> Code Module Mapping

| Implementation Spec | Primary Concern | Future Code Modules | Required Checks |
| --- | --- | --- | --- |
| [Implementation Roadmap](implementation-roadmap.md) | Build sequence and readiness | All modules | Phase exit criteria |
| [Domain Model](domain-model.md) | Aggregates, invariants, events | `packages/domain` | Domain invariant tests |
| [Repository Specification](repository-specification.md) | Persistence contracts | `packages/repositories`, `packages/infrastructure/postgres` | Repository contract tests |
| [Component Specification](component-specification.md) | Component boundaries | `packages/application`, `packages/workflow`, `packages/capabilities`, `packages/ai-platform` | Dependency tests |
| [API Specification](api-specification.md) | Command/query surface | `apps/api`, `packages/api-contracts` | API contract tests |
| [Project Structure](project-structure.md) | Physical module layout | All packages | No cyclic dependencies |
| [Engineering Standards](engineering-standards.md) | Development governance | All modules | PR and DoD checks |

## 6. Cross-Cutting Concerns

| Concern | Source of Truth | Implementation Location | Governance Rule |
| --- | --- | --- | --- |
| Authorization | ADR-005, API Specification | `packages/platform-services` | Apply before protected access |
| Audit | ADR-001, ADR-005, Engineering Standards | `packages/platform-services`, `packages/repositories` | Consequential actions audited |
| Observability | ADR-005, ADR-010, Component Specification | `packages/observability` | Correlation IDs required |
| Validation | Domain Model, Engineering Standards | `packages/validation`, `packages/domain` | Validate before commit |
| AI execution | ADR-010 | `packages/ai-platform` | No direct provider calls |
| Search | ADR-009 | `packages/search` | Derived only |
| Artifact content | ADR-008 | `packages/artifacts`, `packages/infrastructure/object-storage` | Immutable after registration |
| Persistence | ADR-001, ADR-007 | `packages/repositories`, `packages/infrastructure/postgres` | Repository-per-aggregate |
| Privacy | Architecture Principles, Engineering Standards | All modules | Minimize sensitive data |
| Error model | API Specification, Repository Specification | `packages/api-contracts`, `packages/repositories` | Structured errors |

## 7. Change Impact Analysis

Use this checklist before making implementation or architecture changes.

### Domain Change

Review:

- Domain Model.
- ADR-001.
- ADR-004.
- Repository Specification.
- API Specification.
- Tests in `tests/architecture` and domain tests.

Likely affected modules:

- `packages/domain`
- `packages/repositories`
- `packages/application`

### Repository Change

Review:

- ADR-001.
- ADR-007.
- Repository Specification.
- Engineering Standards.

Likely affected modules:

- `packages/repositories`
- `packages/infrastructure/postgres`
- `packages/testing`

### AI Change

Review:

- ADR-010.
- Capability Contracts.
- Component Specification.
- API Specification.
- Engineering Standards.

Likely affected modules:

- `packages/ai-platform`
- `packages/capabilities`
- `packages/infrastructure/litellm`

### Search Change

Review:

- ADR-004.
- ADR-009.
- API Specification.
- Project Structure.

Likely affected modules:

- `packages/search`
- `packages/infrastructure/opensearch`
- `apps/console`

### API Change

Review:

- API Specification.
- Component Specification.
- Domain Model.
- Engineering Standards.

Likely affected modules:

- `apps/api`
- `packages/api-contracts`
- `packages/application`

### Project Structure Change

Review:

- Project Structure.
- Component Specification.
- Architecture Principles.
- ADR Framework.

Likely affected modules:

- All packages.

Material changes require ADR review when ownership, dependency direction, technology, persistence, workflow, AI execution, or authority boundaries change.

## 8. Repository Navigation Guide

Recommended navigation by task:

| Task | Start Here | Then Review |
| --- | --- | --- |
| Understand platform architecture | [Architecture Blueprint](../architecture/architecture-blueprint-v1.md) | [ADR Index](../adr/index.md) |
| Implement domain object | [Domain Model](domain-model.md) | ADR-001, ADR-004 |
| Implement repository | [Repository Specification](repository-specification.md) | ADR-001, ADR-007 |
| Implement capability | [Capability Contracts](../capability-contracts.md) | Component Specification, ADR-010 |
| Implement API command | [API Specification](api-specification.md) | Component Specification, Domain Model |
| Implement search | ADR-009 | API Specification, Project Structure |
| Implement AI gateway | ADR-010 | Component Specification, Engineering Standards |
| Review PR | [Engineering Standards](engineering-standards.md) | Architecture Blueprint, affected ADRs |
| Evaluate architecture change | [ADR Framework](../adr-framework.md) | Architecture Principles |

## 9. Architecture Review Checklist

Architecture Review Board checks:

- Does the change trace to a business objective or approved architecture concern?
- Which ADRs are affected?
- Which implementation specifications are affected?
- Which future modules are affected?
- Does the change preserve dependency direction?
- Does the change preserve repository-per-aggregate?
- Does the change preserve Workflow Instance authority?
- Does the change preserve AI Execution Platform boundary?
- Does the change preserve search as derived?
- Does the change preserve artifact immutability?
- Does the change preserve evidence authority?
- Does the change preserve human approval gates?
- Does the change preserve auditability?
- Does the change require a new ADR?
- Are tests or review gates updated?

Approval rule:

If traceability cannot be established, the change is not ready.

## 10. Future Evolution

This matrix should evolve as implementation begins.

Future updates may add:

- Concrete source paths once modules are created.
- Test suite references.
- ADR-011 and later mappings.
- API version mappings.
- Prompt registry mappings.
- Search index schema mappings.
- Deployment and operational mappings.

Evolution rules:

- Keep mappings concise.
- Do not duplicate source documents.
- Prefer links to authoritative documents.
- Update the matrix when a new ADR, implementation spec, or major module is added.
- Treat stale traceability as an architecture governance defect.
