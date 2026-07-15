# Canonical Data Model

## Executive Summary

Resume OS requires a structured data model that separates facts, reusable wording, role intelligence, resume versions, and outcomes.

The most important rule: facts must never be inferred. Tailored language can vary, but canonical evidence remains stable.

## Field Classification

| Classification | Meaning |
| --- | --- |
| Required | Must exist before the entity can be used |
| Optional | Helpful but not mandatory |
| Never inferred | Must come from Saurabh, Product OS, public evidence, or reviewed source material |

## CandidateProfile

Purpose: define stable identity and contact information.

| Field | Status | Notes |
| --- | --- | --- |
| name | Required, never inferred | Stable |
| location | Required, never inferred | Current location only |
| email | Required, never inferred | Submission-safe email |
| phone | Required, never inferred | Submission-safe phone |
| LinkedIn | Required, never inferred | Canonical profile URL |
| GitHub | Required, never inferred | Canonical profile URL |
| Product OS | Required, never inferred | Canonical Product OS URL |
| target locations | Optional | Can vary by search strategy |
| relocation preferences | Optional, never inferred | Must be explicit |
| work authorization | Optional, never inferred | Include only when relevant and approved |

## Role

Purpose: define each canonical career role.

| Field | Status | Notes |
| --- | --- | --- |
| company | Required, never inferred | Legal or public company name |
| canonical title | Required, never inferred | Must match approved career history |
| start date | Required, never inferred | Month/year or approved format |
| end date | Required, never inferred | Use Present only when true |
| location | Optional, never inferred | City or remote context |
| role type | Required | PM, SPM, Head of Product, etc. |
| scope | Required | Product, portfolio, domain, or platform scope |
| team | Optional | Include if verified |
| reporting context | Optional, never inferred | Avoid if unclear |
| domains | Required | AI, SaaS, payments, growth, etc. |
| technologies | Optional | Must be explainable |
| verified achievements | Required | Links to Achievement records |

## Achievement

Purpose: store evidence-backed outcomes and decisions.

| Field | Status | Notes |
| --- | --- | --- |
| achievement ID | Required | Stable identifier |
| company | Required, never inferred | Maps to Role |
| role | Required, never inferred | Maps to Role |
| problem | Required | Customer, business, platform, or growth problem |
| action | Required | What was done |
| decision | Required | Product decision or trade-off |
| result | Required | Outcome |
| metric | Optional, never inferred | Use only if verified |
| metric unit | Optional | ARR, MRR, CSAT, conversion, traffic, etc. |
| baseline | Optional, never inferred | Use only if verified |
| final value | Optional, never inferred | Use only if verified |
| timeframe | Optional, never inferred | Include when known |
| evidence source | Required | Product OS, resume source, public artifact, or approved note |
| confidentiality status | Required | Public, resume-safe, restricted, confidential |
| approved wording | Required | Canonical claim language |
| role archetypes | Required | Relevant archetypes |
| competencies | Required | Discovery, platform, AI, growth, etc. |
| keywords | Optional | ATS-aligned terms |
| Product OS link | Optional | Use when public proof exists |

## ResumeBullet

Purpose: convert achievements into reusable bullet variants.

| Field | Status | Notes |
| --- | --- | --- |
| bullet ID | Required | Stable identifier |
| source achievement IDs | Required, never inferred | Must map back to evidence |
| canonical claim | Required | What the bullet claims |
| role archetype | Required | Best-fit archetype |
| company context | Optional | Marketplace, AI platform, enterprise SaaS, etc. |
| competency tags | Required | Product skills demonstrated |
| keyword tags | Optional | ATS terms |
| seniority signal | Required | Scope, decision, leadership, ambiguity |
| technical depth | Optional | Low, medium, high |
| leadership depth | Optional | Low, medium, high |
| word count | Required | Supports page-length control |
| approved variants | Required | Role-specific versions |
| interview story reference | Optional | Product OS or private prep note |

## SummaryModule

Purpose: reusable summary blocks by archetype and seniority.

| Field | Status | Notes |
| --- | --- | --- |
| archetype | Required | Primary role fit |
| level | Required | Senior PM, Lead PM, AI PM |
| domains | Required | AI, SaaS, platform, payments, growth |
| strengths | Required | Evidence-backed strengths |
| metrics | Optional, never inferred | Use only verified metrics |
| Product OS sentence | Optional | One concise sentence maximum |
| maximum word count | Required | Prevents summary sprawl |

## Project

Purpose: represent company-specific or public proof-of-work modules.

| Field | Status | Notes |
| --- | --- | --- |
| name | Required | Project name |
| type | Required | Simulation, case study, prototype, open-source, Product OS artifact |
| status | Required, never inferred | Draft, live, archived, production, prototype |
| target company | Optional | Company-specific only when applicable |
| problem | Required | Problem addressed |
| scope | Required | Product scope |
| technical implementation | Optional | Must be explainable |
| product decisions | Required | Decisions or trade-offs |
| metrics | Optional, never inferred | Do not invent simulated metrics |
| disclaimer requirements | Required | Clear labeling rules |
| live link | Optional | Verified before submission |
| GitHub link | Optional | Verified before submission |

## JobDescription

Purpose: represent the target role.

| Field | Status | Notes |
| --- | --- | --- |
| company | Required, never inferred | From JD or recruiter |
| role | Required, never inferred | Role title |
| level | Optional | Infer only as recommendation, not fact |
| location | Optional | From JD |
| requirements | Required | Parsed from JD |
| responsibilities | Required | Parsed from JD |
| preferred qualifications | Optional | Parsed from JD |
| competencies | Required | Extracted and reviewed |
| keywords | Required | Extracted and reviewed |
| hidden signals | Optional | Human-reviewed interpretation |
| PM archetype | Required | Primary plus up to two secondary |
| domain | Optional | Marketplace, AI, SaaS, payments, etc. |
| risks | Optional | Gaps or weak evidence areas |

## ResumeVersion

Purpose: store each generated resume.

| Field | Status | Notes |
| --- | --- | --- |
| resume ID | Required | Stable version identifier |
| company | Required | Target company |
| role | Required | Target role |
| date | Required | Generation or submission date |
| selected components | Required | Component IDs |
| keyword coverage | Required | Coverage score and gaps |
| QA scores | Required | Quality scorecard outputs |
| file name | Required | Must follow naming convention |
| Product OS links | Optional | URLs included in resume |
| application status | Required | Draft, final, submitted, archived |

## ApplicationOutcome

Purpose: measure resume performance.

| Field | Status | Notes |
| --- | --- | --- |
| resume ID | Required | Maps to ResumeVersion |
| applied date | Required, never inferred | Actual submission date |
| referral | Optional, never inferred | Yes/no/referrer if approved |
| recruiter response | Optional | Response received |
| interview stages | Optional | Screen, HM, panel, onsite, etc. |
| rejection reason | Optional | Only if known |
| offer | Optional, never inferred | Actual result only |
| notes | Optional | Qualitative learning |

## Data Integrity Rules

- Employment facts must never be inferred.
- Metrics must never be inferred.
- Work authorization must never be inferred.
- Confidentiality status must be explicit.
- Generated bullets are drafts until evidence-verified.
- Every submitted resume must map back to ResumeVersion.
