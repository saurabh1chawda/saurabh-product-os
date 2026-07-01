# Saurabh Product OS

Evidence-backed Product Decision Library for evaluating Saurabh Chawda as a Senior or Lead Product Manager across AI, platforms, payments, enterprise SaaS, and growth systems.

Live site: https://saurabh-product-os.vercel.app

## Product OS v1 Overview

Saurabh Product OS is not a traditional portfolio site. It is a recruiter-facing decision-support product that shows how product judgment turns into strategy, trade-offs, execution, evidence, and measurable outcomes.

Product OS v1 includes:

- AI Product Operating System v1
- Flagship Product Stories
- Representative Product Artifacts
- Recruiter Tour
- For Recruiters landing page
- Interview Readiness Kit

## AI Product Operating System v1

AI Product Operating System v1 documents the end-to-end decision system I use to evaluate, validate, prioritize, architect, and measure AI products.

Completed modules:

- AI Product Principles
- Customer Discovery
- Validation & Experimentation
- AI Prioritization
- Build vs Buy AI
- RAG vs Agent
- AI Success Metrics

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- MDX
- Lucide icons
- Google Analytics 4
- Microsoft Clarity
- Vercel-ready deployment

## Setup

Install dependencies:

```bash
pnpm install
```

Start the local development server:

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

Create a local `.env.local` file using `.env.example` as the reference.

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-8K7TJ088G0
NEXT_PUBLIC_CLARITY_PROJECT_ID=xemq5rsgrr
```

Set the same variables in Vercel for production.

## Analytics

Google Analytics 4 is integrated through `@next/third-parties/google` and reads the measurement ID from `NEXT_PUBLIC_GA_MEASUREMENT_ID`.

Microsoft Clarity loads globally in production only and reads the project ID from `NEXT_PUBLIC_CLARITY_PROJECT_ID`.

Recruiter-focused events track key Product OS behaviors such as recruiter views, story opens, framework opens, Decision System interactions, learning path clicks, resume clicks, LinkedIn clicks, email clicks, and external link clicks.

## Useful Commands

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm build
```
