# Release Governance

Status: v1.0 governance model  
Last updated: July 2026

## Executive Summary

Release governance defines how Product Leadership Platform changes are approved, documented, validated, and maintained after v1.0.

The goal is to protect the production baseline while allowing deliberate improvements.

## Release Cadence

Recommended cadence:

| Release Type | Cadence | Examples |
| --- | --- | --- |
| Patch | As needed | Link fixes, copy corrections, metadata updates |
| Minor | Monthly or milestone-based | New brief, repository maturity update, new worked example |
| Major | Rare | Architecture, positioning, or flagship product model changes |

## Approval Process

Every release should answer:

- What changed?
- Why does it matter?
- Which source artifacts are affected?
- Does it change public positioning?
- Does it affect recruiter or hiring manager journeys?
- What validation was completed?

## Documentation Ownership

| Area | Owner Role |
| --- | --- |
| Product OS pages | Product Owner |
| Product Leadership Briefs | Product Owner + Evidence Reviewer |
| GitHub repositories | Maintainer |
| Publishing system | Product Marketing Owner |
| Content production system | Content Operations Owner |
| Acquisition engine | Growth Owner |
| Release docs | Release Manager |

## Maintenance Expectations

Monthly:

- Review broken links.
- Review recruiter path metrics.
- Review Contact conversion paths.
- Review GitHub README consistency.

Quarterly:

- Review public positioning.
- Review flagship product maturity.
- Review publishing and acquisition performance.
- Update release roadmap.

Per release:

- Update changelog.
- Validate affected links.
- Confirm source-of-truth alignment.
- Document known risks.

## Change Control

### Low-Risk Changes

Examples:

- Typo fixes.
- Link fixes.
- Minor copy clarity.
- Metadata corrections.

Required:

- Focused review.
- Commit with clear message.

### Medium-Risk Changes

Examples:

- CTA changes.
- Navigation changes.
- New documentation systems.
- Repository README updates.
- Product Leadership Brief refinements.

Required:

- Product review.
- Link and journey validation.
- Changelog entry if public-facing.

### High-Risk Changes

Examples:

- Product OS positioning changes.
- Executive Brief structure changes.
- New flagship product model.
- Major information architecture changes.
- Removing or renaming public routes.

Required:

- Release review.
- Migration notes.
- Validation plan.
- Changelog entry.

## Release Readiness Gates

Before releasing:

- Scope is documented.
- Affected docs or pages are updated.
- Links are checked.
- Metadata is reviewed if public-facing.
- Validation is completed.
- Changelog is updated.
- Known risks are recorded.

## Documentation Standards

Every durable release document should include:

- Title.
- Status.
- Last updated.
- Executive summary.
- Clear tables where useful.
- Operating principle or release recommendation.

## Operating Principle

Release governance should make change safer without slowing down meaningful product improvement.
