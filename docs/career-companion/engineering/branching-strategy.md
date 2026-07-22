# Career Companion Branching Strategy

## 1. Executive Summary

This document defines the branching strategy for Career Companion implementation.

The strategy favors short-lived, reviewable branches that preserve architecture traceability and reduce integration risk.

## 2. Branching Principles

- Mainline remains stable.
- Work happens on focused branches.
- Branch names communicate scope.
- Architecture-impacting changes are explicitly identified.
- Implementation changes and ADR changes are not casually mixed.
- Experimental work remains isolated.
- Branches should be short-lived unless they represent a planned integration effort.

## 3. Branch Types

| Branch Type | Purpose | Naming Pattern |
| --- | --- | --- |
| Feature | Product or platform behavior | `codex/feature-short-description` |
| Architecture documentation | Architecture or ADR documentation | `codex/docs-short-description` |
| Engineering documentation | Bootstrap, standards, workflow docs | `codex/eng-short-description` |
| Fix | Defect correction | `codex/fix-short-description` |
| Refactor | Internal restructuring without behavior change | `codex/refactor-short-description` |
| Spike | Time-boxed investigation | `codex/spike-short-description` |
| Release preparation | Release coordination | `codex/release-version-or-name` |

Branch names should be lowercase, hyphenated, and concise.

## 4. Mainline Rules

The main branch should contain only reviewed, validated work.

Mainline must not accept:

- Broken builds.
- Failing tests.
- Architecture violations.
- Secret leakage.
- Unapproved technology decisions.
- Direct provider calls from capabilities.
- Repository boundary violations.
- Search authority violations.

## 5. Feature Branch Rules

Feature branches should:

- Start from current mainline.
- Represent one clear change.
- Include implementation and tests together.
- Update documentation when behavior or setup changes.
- Reference affected ADRs and specs in review notes.
- Avoid unrelated formatting churn.

## 6. Architecture and ADR Branches

Architecture branches should be used for:

- New ADRs.
- Architecture principle changes.
- Implementation specification changes.
- Material dependency boundary changes.

Architecture and ADR branches must be reviewed against:

- ADR Framework.
- Architecture Principles.
- Architecture Traceability Matrix.
- Affected implementation specs.

## 7. Merge Readiness

A branch is ready to merge when:

- Scope is clear.
- Required tests pass.
- Architecture checks pass.
- Documentation is updated where required.
- Review is complete.
- No prohibited dependencies are introduced.
- No secrets or private data are present.

## 8. Release Branching

Release branches may be used when release stabilization requires controlled changes.

Release branches should accept only:

- Release-critical fixes.
- Documentation corrections required for release.
- Validation updates.
- Approved release notes.

Feature expansion should wait for the next development branch or mainline cycle.

## 9. Exceptions

Exceptions require explicit review when a branch:

- Changes architecture.
- Changes approved technology.
- Changes persistence behavior.
- Changes AI execution boundaries.
- Changes security or privacy behavior.
- Adds cross-cutting infrastructure.

Exceptions should be documented in the pull request and, when material, governed through an ADR.

## 10. Future Evolution

Branching rules may evolve when CI/CD, release automation, or environment promotion tooling is selected.

Any evolution must preserve mainline stability and architecture traceability.

