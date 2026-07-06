# Product OS Architecture

Status: Reference  
Last updated: July 2026

## System Overview

Product OS is a Next.js App Router application that presents Saurabh Chawda's product leadership system as a production web experience. It combines executive-facing pages, decision systems, AI product frameworks, product leadership briefs, professional profile content, and recruiter journeys.

The system is designed around structured product evidence rather than chronological portfolio browsing.

## Folder Responsibilities

| Folder | Responsibility |
| --- | --- |
| `app/` | Route segments, page metadata, layout composition, and page-level rendering |
| `components/` | Reusable visual components, interaction wrappers, analytics event components, and Product OS page primitives |
| `data/` | Structured content for journeys, playbooks, Product Leadership Briefs, decision systems, and reusable page models |
| `content/` | Content assets and supporting materials where a page uses authored content |
| `lib/` | Analytics helpers, shared utilities, and product data access |
| `public/` | Static public assets, including `og-image.png` |
| `styles/` | Global styles and design-system-level CSS |
| `docs/` | Repository strategy, architecture, governance, launch, and GitHub Hub documentation |

## Content Architecture

Product OS uses structured content where repeatability matters.

- Decision Systems define repeatable product decision frameworks.
- Product Leadership Briefs use structured data and reusable components to keep case-study pages consistent.
- AI Product Playbook content is organized into parts, frameworks, studio steps, and related evidence.
- Recruiter and executive journeys connect audience intent to the most relevant evidence.
- Professional Profile content provides career context without becoming an ATS resume.

This content model keeps the site maintainable as new flagship briefs, frameworks, and GitHub artifacts are added.

## Build and Deployment Flow

1. Install dependencies with `pnpm install`.
2. Run local development with `pnpm dev`.
3. Validate changes with `pnpm lint`, `pnpm typecheck`, and `pnpm build`.
4. Deploy through Vercel from the production branch.
5. Confirm production metadata, analytics scripts, and Open Graph assets after deployment.

## Analytics and SEO

Product OS uses Google Analytics 4 and Microsoft Clarity through environment variables.

- GA4 measurement ID is read from `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
- Microsoft Clarity project ID is read from `NEXT_PUBLIC_CLARITY_PROJECT_ID`.
- Clarity is intended to load only in production.
- Page-specific events track recruiter journeys, decision-system engagement, case-study clicks, contact intent, and executive briefing behavior.

SEO is handled through the Next.js App Router Metadata API:

- Global metadata lives in `app/layout.tsx`.
- Page-level metadata defines titles, descriptions, canonical URLs, Open Graph metadata, and Twitter card metadata.
- Structured data is used where appropriate for breadcrumbs and profile context.
- `public/og-image.png` is the canonical Open Graph image.

## Relationship to Product OS Pages

The application is organized around visitor intent:

- `/executive` gives the fastest executive overview.
- `/profile` provides the canonical Professional Profile.
- `/decision-operating-system` organizes decision systems.
- `/ai-product-playbook` explains the AI product operating model.
- `/case-studies` launches Product Leadership Briefs.
- `/product-leadership-operating-principles` synthesizes the operating philosophy.

Each surface should reduce cognitive load and link to evidence rather than duplicating every piece of content.

## Relationship to GitHub Artifacts

Product OS is the executive and narrative layer. GitHub is the artifact and implementation layer.

Future flagship repositories should extract reusable assets from Product OS into standalone products:

- AI Product Playbook
- Product Leadership Briefs
- AI Prioritization Framework
- Product Discovery Toolkit
- Decision Memo Template

Every GitHub artifact should link back to the relevant Product OS page, and every Product OS page should point to reusable artifacts only when those artifacts are ready.
