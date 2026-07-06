# Repository Governance

Status: Draft  
Last updated: July 2026

This document defines lightweight governance for Product OS as the reference implementation for the GitHub Product Leadership Hub.

## Versioning Approach

Product OS should use simple semantic versioning for public milestones:

- `v1.x` for AI Product Operating System v1 and related stabilization.
- `v2.x` for GitHub Product Leadership Hub integration and flagship repository modernization.
- Patch versions for documentation, metadata, accessibility, and small content fixes.

Not every commit needs a version bump. Versions should mark meaningful public-facing releases.

## Changelog Expectations

`CHANGELOG.md` should be updated when a change materially affects:

- Product OS positioning
- Public routes
- Decision Systems
- AI Product Playbook
- Product Leadership Briefs
- Recruiter or hiring manager journeys
- Analytics, SEO, or production readiness
- GitHub Product Leadership Hub structure

Small copy edits and internal refactors can remain commit-level history unless they affect public interpretation.

## Documentation Ownership

Documentation should be maintained with the same care as product surfaces.

- README is the repository front door.
- `docs/architecture/` explains how the system works.
- `docs/repository-metadata.md` captures settings that cannot be changed locally.
- `docs/repository-launch-checklist.md` defines flagship readiness.
- Strategy and audit docs define long-term GitHub Hub direction.

New docs should be added only when they clarify operation, launch readiness, product strategy, or reusable standards.

## Release Readiness

A release is ready when:

- The public experience supports the intended audience.
- Links and CTAs resolve.
- Metadata and Open Graph behavior are correct.
- Analytics events remain meaningful.
- `pnpm lint`, `pnpm typecheck`, and `pnpm build` pass.
- README and changelog reflect the current product state.
- Repository launch checklist is updated.

## Maintenance Principles

- Keep Product OS evidence-first and recruiter-friendly.
- Avoid adding new routes without a clear visitor job.
- Prefer structured data for repeatable product surfaces.
- Reuse existing design language and component patterns.
- Keep GitHub artifacts reusable without duplicating the Product OS narrative.
- Treat documentation as part of the product, not an afterthought.
