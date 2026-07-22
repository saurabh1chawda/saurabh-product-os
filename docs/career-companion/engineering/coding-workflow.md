# Career Companion Coding Workflow

## 1. Executive Summary

This document defines the standard coding workflow for Career Companion engineers.

The workflow translates approved architecture into daily implementation behavior. It is designed to keep changes small, traceable, testable, and aligned with the modular monolith structure.

## 2. Workflow Principles

- Start from architecture and ADRs.
- Keep changes scoped to one coherent concern.
- Preserve dependency direction.
- Implement through approved modules.
- Add tests with the change.
- Validate before review.
- Document architecture impact.
- Do not mix unrelated refactors with feature work.

## 3. Standard Coding Flow

1. Identify the change objective.
2. Map the change using the Architecture Traceability Matrix.
3. Review affected ADRs and implementation specifications.
4. Create or switch to a feature branch.
5. Implement inside the correct module boundary.
6. Add or update tests.
7. Run local validation.
8. Review architecture compliance.
9. Prepare a pull request.
10. Address review findings.
11. Merge only after required gates pass.

## 4. Change Classification

| Change Type | Required Source Review | Typical Modules |
| --- | --- | --- |
| Domain behavior | Domain Model, ADR-001, ADR-004 | `packages/domain` |
| Repository behavior | Repository Specification, ADR-001, ADR-007 | `packages/repositories`, `packages/infrastructure/postgres` |
| Workflow behavior | Workflow State Machine, Workflow Instance, ADR-002, ADR-003 | `packages/workflow` |
| Capability behavior | Capability Contracts, Capability Architecture, ADR-010 | `packages/capabilities`, `packages/ai-platform` |
| API behavior | API Specification, Component Specification | `apps/api`, `packages/api-contracts`, `packages/application` |
| Search behavior | ADR-009, API Specification | `packages/search`, `packages/infrastructure/opensearch` |
| Artifact behavior | Artifact Model, ADR-008 | `packages/artifacts`, `packages/infrastructure/object-storage` |
| Platform service behavior | ADR-005, Component Specification | `packages/platform-services` |

## 5. Implementation Rules

- Domain modules must not depend on infrastructure.
- Application services coordinate use cases and must not own persistence.
- Repositories persist aggregates and must not contain business logic.
- Capabilities transform approved inputs into approved outputs.
- Capabilities must not call other capabilities.
- AI execution must go through the AI Execution Platform.
- Search must return derived references only.
- Artifact content must be immutable after registration.
- Runtime sessions must not be treated as durable business state.

## 6. Testing Workflow

For each change, choose the smallest test set that proves the change without weakening architecture coverage.

Expected test categories:

- Unit tests for domain and pure logic.
- Contract tests for repositories, APIs, capabilities, and AI execution.
- Integration tests for infrastructure adapters and persistence behavior.
- Architecture tests for dependency direction.
- End-to-end tests for complete governed flows.

Testing should include failure cases when the change touches validation, approval, persistence, recovery, AI execution, or security.

## 7. Documentation Workflow

Documentation updates are required when:

- Public behavior changes.
- A module boundary changes.
- An ADR decision is affected.
- A new architectural risk is discovered.
- Onboarding instructions become stale.
- A new setup step is required.

Material architecture changes require ADR review before implementation.

## 8. Review Preparation

Before opening a pull request:

- Confirm changed files are scoped.
- Confirm tests pass.
- Confirm architecture checks pass.
- Confirm no secrets are present.
- Confirm no direct AI provider usage was introduced.
- Confirm repository boundaries are preserved.
- Confirm search remains derived.
- Confirm audit expectations are met.
- Confirm documentation is updated if required.

## 9. Done Criteria

A coding change is done only when:

- It satisfies the requested behavior.
- It preserves approved architecture.
- It includes required tests.
- It passes validation.
- It is documented where appropriate.
- It has a clear architecture trace.
- It has no unapproved technology or dependency changes.

## 10. Future Evolution

This workflow may evolve as implementation tooling is selected. Changes must preserve Engineering Standards and must not weaken architecture governance.

