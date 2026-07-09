# Product OS

Status: Production reference implementation  
Last updated: July 2026  
Live site: https://saurabh-product-os.vercel.app

Product OS is an evidence-backed product leadership system for evaluating Saurabh Chawda as a Senior or Lead Product Manager across AI products, enterprise SaaS, platform strategy, payments, and growth systems.

It is not a traditional portfolio. It is a decision-support product that makes product judgment visible through executive briefings, decision systems, product leadership briefs, operating principles, measurable outcomes, and reusable product artifacts.

## Executive Summary

Product OS helps recruiters, hiring managers, and product leaders answer a practical question quickly:

Can this person make high-quality product decisions under uncertainty?

The site does this by connecting career context, product philosophy, decision frameworks, flagship product decisions, and business outcomes into one navigable operating system. GitHub extends that system by making the underlying product architecture, documentation standards, and reusable artifacts inspectable.

## Problem Statement

Resumes summarize roles and outcomes, but they rarely show how a product leader thinks. Case studies often show narrative, but not the decision structure behind the work. Product OS closes that gap by documenting the principles, trade-offs, evidence, and execution patterns behind product leadership decisions.

## Target Audience

**Primary**

- Recruiters evaluating Senior, Lead, or AI Product Manager candidates
- Hiring managers assessing product judgment and operating maturity
- Directors and VPs of Product evaluating leadership signals

**Secondary**

- Product managers studying portfolio and case-study architecture
- Engineering leaders assessing cross-functional product partnership
- Founders and operators interested in AI product decision systems

## Key Capabilities

- Executive Briefing Center for a five-minute product leadership overview
- Professional Profile with career context, business outcomes, and product capabilities
- Decision Operating System covering AI product discovery, validation, prioritization, architecture, ownership, and measurement
- AI Product Playbook with a guided AI Product Studio
- Product Leadership Briefs for JoVE, Logix, Mahindra Comviva, and Simplilearn
- Product Leadership Operating Principles that synthesize patterns across briefs
- Recruiter and hiring manager paths designed to reduce time-to-conviction
- Production metadata, Open Graph support, analytics instrumentation, and responsive design

## Screenshots

Public launch preview assets should use the existing Product OS Open Graph image until repository-specific screenshots are captured.

Recommended captures:

- Executive Briefing Center
- Professional Profile
- Decision Operating System
- AI Product Playbook
- Product Leadership Brief: JoVE
- Product Leadership Brief: Logix

## Repository Structure

```text
/
  app/                 Next.js App Router routes and metadata
  components/          Reusable UI, analytics, and page-level components
  content/             Structured content assets where applicable
  data/                Structured page, playbook, journey, and brief data
  docs/                Repository strategy, architecture, governance, and launch docs
  lib/                 Analytics helpers, utilities, and shared product data access
  public/              Static assets including Open Graph image
  styles/              Global CSS and design tokens
```

## Local Development

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

Run lint:

```bash
pnpm lint
```

Run TypeScript checks:

```bash
pnpm typecheck
```

Create a production build:

```bash
pnpm build
```

## Environment Variables

Create `.env.local` from `.env.example`.

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-8K7TJ088G0
NEXT_PUBLIC_CLARITY_PROJECT_ID=xemq5rsgrr
```

Set the same variables in Vercel for production.

## High-Level Architecture

Product OS is a Next.js App Router application built with TypeScript and Tailwind CSS.

- Routes in `app/` define the executive, recruiter, decision-system, playbook, profile, and case-study experiences.
- Structured content in `data/` powers repeatable page systems such as journeys, Product Leadership Briefs, and playbook sections.
- Reusable components in `components/` maintain a consistent Product OS visual language.
- Analytics helpers in `lib/analytics.ts` support recruiter-focused and product-experience events.
- Global metadata, Open Graph, Twitter card, robots, and canonical behavior are managed through the App Router Metadata API.
- The project is designed for Vercel deployment.

For more detail, see [Product OS Architecture](docs/architecture/product-os-architecture.md).

## Product OS <-> GitHub Relationship

Product OS is the executive narrative layer. It explains the product leadership system, shows the evidence, and guides visitors through the strongest material.

GitHub is the implementation and artifact layer. It should expose how Product OS is structured, how flagship repositories are maintained, and how reusable product frameworks can be adopted independently.

The long-term GitHub Product Leadership Hub is organized around flagship products:

- Product OS
- AI Product Playbook
- Product Leadership Briefs
- AI Prioritization Framework
- Product Discovery Toolkit
- Decision Memo Template

See [Flagship Product Specifications](docs/flagship-product-specifications.md) for the product definitions behind these repositories.

## Documentation

Current documentation:

- [GitHub Product Leadership Hub Strategy](docs/github-product-leadership-hub-strategy.md)
- [GitHub Repository Audit](docs/github-repository-audit.md)
- [Flagship Product Specifications](docs/flagship-product-specifications.md)
- [Repository Metadata Checklist](docs/repository-metadata.md)
- [Product OS Architecture](docs/architecture/product-os-architecture.md)
- [Repository Launch Checklist](docs/repository-launch-checklist.md)
- [Repository Governance](docs/governance.md)

Recommended scalable documentation hierarchy:

```text
docs/
  architecture/        System architecture and implementation notes
  roadmap/             Product and repository roadmap docs
  decisions/           Repository and product decision records
  contributing/        Contribution and maintenance guidance
  assets/              Screenshots, diagrams, and launch assets
  releases/            Release notes and launch records
```

Existing documentation is intentionally not moved yet. The hierarchy above should guide future cleanup once the flagship repository set is stable.

## Roadmap

**Version 1**

- Production Product OS website
- Executive and recruiter journeys
- Decision Operating System v1
- AI Product Playbook foundation
- Product Leadership Brief framework

**Version 2**

- Modernized GitHub Product Leadership Hub
- Standalone flagship repositories
- Reusable templates and product artifacts
- Stronger repo-to-site evidence links

**Version 3**

- Portable Product OS kits
- Expanded Product Leadership Brief library
- Downloadable and workshop-ready product tools
- Public framework examples for AI, platform, growth, discovery, and decision documentation

## Contributing

This repository is currently maintained as Saurabh Chawda's canonical Product OS implementation. External contributions are limited to documentation corrections, broken link reports, accessibility issues, and clarity improvements.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the current contribution boundary.

Personal career evidence, company-specific metrics, and Product OS positioning are not open for external edits.

## License

Product OS uses a mixed license boundary because it contains application code, reusable frameworks, personal career evidence, and brand assets.

- Application code: MIT License.
- Reusable frameworks, templates, and documentation patterns: reusable with attribution.
- Personal career evidence, company-specific metrics, Product OS positioning, screenshots, and brand assets: all rights reserved unless explicitly marked reusable.

See [LICENSE.md](LICENSE.md), [NOTICE.md](NOTICE.md), and [Licensing Strategy](docs/licensing-strategy.md).

## Status

Production reference implementation for the GitHub Product Leadership Hub.

Launch readiness is tracked in [Repository Launch Checklist](docs/repository-launch-checklist.md).

## Connect

- Executive Brief: https://saurabh-product-os.vercel.app/executive
- Product OS: https://saurabh-product-os.vercel.app
- Contact: https://saurabh-product-os.vercel.app/contact
