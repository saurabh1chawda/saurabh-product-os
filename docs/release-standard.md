# Release Standard

Status: RC1 launch standard  
Last updated: July 2026

## Purpose

This document defines portfolio-wide release standards for the six flagship products in the Product Leadership Platform.

The goal is to make the ecosystem feel like a professionally managed software product portfolio rather than a collection of disconnected repositories.

## Repository Status Model

Use one of five statuses.

| Status | Meaning | Usage Guidance |
| --- | --- | --- |
| Production | Public-facing, validated, actively maintained, and ready to represent the platform | Use for Product OS after GA criteria are met |
| Foundation | Repository structure, README, docs, and initial artifacts exist, but deeper examples or assets are still pending | Use for v1 standalone repository launches |
| Active | Useful and actively being expanded with meaningful content or assets | Use after v1 foundations begin receiving depth improvements |
| Experimental | Exploratory, incomplete, or not yet part of the flagship experience | Do not use for the six flagship products unless a product is intentionally demoted |
| Archived | No longer maintained or superseded | Use only when a repository is intentionally retired |

Current recommended statuses:

| Product | Status |
| --- | --- |
| Product OS | Production candidate |
| AI Product Playbook | Foundation |
| Product Leadership Briefs | Foundation |
| AI Prioritization Framework | Foundation |
| Product Discovery Toolkit | Foundation |
| Decision Memo Template | Foundation |

## Versioning Standard

Use semantic versioning for public milestones.

### v0.x: Pre-Foundation

Use for drafts, experiments, and internal-only prototypes.

### v1.0: Repository Foundation

Use when the repository has:

- README
- Structure
- Architecture doc
- Governance doc
- Roadmap
- Product specification
- Initial frameworks, templates, or examples

### v1.1: Content Expansion

Use when the repository adds:

- Completed examples
- More complete templates
- Evidence packs
- Workshop guidance
- Improved cross-links

### v1.2: Visual Release

Use when the repository adds:

- Diagrams
- Screenshots
- Social preview assets
- Visual README improvements

### v1.3: GA Candidate

Use when the repository passes all GA quality gates except final public configuration.

### v2.0: GA or Major Product Maturity

Use when the product is public-ready, visibly useful, and stable enough to promote.

Future major versions should reflect meaningful product maturity, not routine documentation updates.

## GA Definition

A flagship product reaches GA when it is:

- Clearly positioned.
- Independently useful.
- Licensed or reuse-bounded.
- Cross-linked with Product OS and sibling products.
- Supported by examples or templates.
- Supported by at least one visual asset or screenshot.
- Maintained with visible status and last updated metadata.
- Free of confusing placeholder language.

## Launch Checklist

- [ ] README follows canonical structure.
- [ ] License or reuse boundary is visible.
- [ ] Repository description is configured.
- [ ] Homepage URL is configured.
- [ ] Topics follow taxonomy.
- [ ] Social preview is configured.
- [ ] Status is accurate.
- [ ] Last updated metadata is present.
- [ ] Roadmap is current.
- [ ] Product OS relationship is clear.
- [ ] Related products are linked.
- [ ] Examples or templates are immediately useful.
- [ ] Visual assets are present where helpful.
- [ ] Links are validated.

## Quality Gates

### Documentation Quality

- Clear audience.
- Clear problem statement.
- Clear first action for visitor.
- No unnecessary jargon.
- No duplicated Product OS narrative.
- No unsupported claims.

### Artifact Quality

- Templates are copyable.
- Frameworks are usable without Product OS.
- Examples teach application rather than biography.
- Diagrams clarify decisions rather than decorate pages.

### Portfolio Quality

- Every repository has a distinct purpose.
- Cross-links guide visitors deeper.
- Product OS remains the executive layer.
- GitHub remains the reusable artifact layer.
- No new repositories are introduced without portfolio review.

## Documentation Quality Standard

Every framework, template, roadmap, and architecture document should include:

- Title
- Status
- Last updated
- Purpose
- Practical usage guidance
- Related Product OS or repository link where useful

Avoid writing documents that only describe what will exist later. If a document is a placeholder, it should still explain the intended use and next maturity step.

## Last Updated Convention

Use `Last updated: Month YYYY`.

Apply to:

- README files
- Frameworks
- Templates
- Roadmaps
- Architecture docs
- Governance docs
- Product specifications

Do not update the date for trivial formatting changes unless the document meaning changes.

## Maintenance Expectations

- Review repository metadata before public launch.
- Review links after route changes.
- Review licensing before enabling public reuse.
- Update changelog for meaningful public-facing changes.
- Keep README status aligned with actual maturity.
- Prefer improving existing products over adding new products.

## Validation

These standards apply to all six flagship products:

- Product OS
- AI Product Playbook
- Product Leadership Briefs
- AI Prioritization Framework
- Product Discovery Toolkit
- Decision Memo Template

No new products or repositories are introduced by this standard.
