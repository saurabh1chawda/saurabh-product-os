# Versioning Policy

Status: v1.0 release policy  
Last updated: July 2026

## Executive Summary

The Product Leadership Platform uses semantic versioning to manage platform maturity across Product OS, documentation systems, and flagship repository products.

Versioning should communicate the degree of change, protect the v1.0 production baseline, and help future work avoid uncontrolled scope expansion.

## Semantic Versioning

Version format:

```text
MAJOR.MINOR.PATCH
```

Example:

```text
1.0.0
```

## Major Releases

Major releases introduce material changes to platform architecture, public positioning, or product model.

Examples:

- New platform architecture.
- New primary audience strategy.
- Replacement of Product OS as canonical destination.
- Major restructuring of flagship products.
- New release model across repositories.

Approval expectation:

- Requires release review and documented migration notes.

## Minor Releases

Minor releases add meaningful improvements without breaking the v1 architecture.

Examples:

- New Product Leadership Brief.
- New worked example in a flagship repository.
- New downloadable template.
- New launch playbook.
- New visual assets.
- Improved acquisition or publishing system.

Approval expectation:

- Requires documentation update and changelog entry.

## Patch Releases

Patch releases fix or clarify existing functionality, content, links, metadata, or documentation.

Examples:

- Broken link fixes.
- Copy corrections.
- Metadata updates.
- README refinements.
- Analytics naming clarification.
- Typo fixes.

Approval expectation:

- Requires focused validation and changelog entry when public-facing.

## Repository Version Alignment

The platform version and repository versions do not need to match exactly.

Recommended model:

| Asset | Versioning Model |
| --- | --- |
| Product OS | Platform-aligned |
| GitHub profile | Platform-aligned when positioning changes |
| Flagship repositories | Independent semver with platform compatibility note |
| Documentation systems | Platform-aligned |
| Templates and frameworks | Repository-level versioning |

Repository README files should state:

- Repository status.
- Last updated.
- Compatible Product Leadership Platform version when relevant.

## Documentation Versioning

Each major documentation system should include:

- Status.
- Last updated.
- Applicable platform version when needed.

Recommended status values:

- Draft.
- RC.
- v1.0 baseline.
- Active.
- Archived.

## Changelog Requirements

Every release should document:

- Version.
- Date.
- Summary.
- Major changes.
- Validation.
- Known risks.
- Next release direction.

## Release Tags

Recommended tag format:

```text
v1.0.0
v1.1.0
v1.1.1
```

If repository-specific tags are needed:

```text
product-os-v1.0.0
ai-product-playbook-v1.0.0
```

## Operating Principle

Version numbers should communicate trust: what changed, how much changed, and whether the baseline remains stable.
