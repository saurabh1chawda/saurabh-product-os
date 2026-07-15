# Resume OS

## Executive Summary

Resume OS is a reusable operating system for producing company-specific, role-specific resumes from canonical Product OS evidence.

The goal is not to create one generic resume. The goal is to make high-quality customization faster, more consistent, more defensible, and easier to measure.

Core principle:

> Product OS is the proof layer. Resume OS is the relevance and routing layer.

Product OS shows the evidence: career history, product decisions, metrics, frameworks, GitHub artifacts, and public proof. Resume OS selects the most relevant evidence for a specific company, role, and hiring context.

## Product Vision

Help Saurabh Chawda produce tailored, ATS-compatible, recruiter-readable resumes in 20 to 30 minutes without compromising factual integrity.

## User Problem

Senior Product Manager, Lead Product Manager, and AI Product Manager roles evaluate different signals:

- AI roles look for AI product judgment, technical credibility, trust, metrics, and lifecycle thinking.
- Platform roles look for scalability, architecture sequencing, reliability, and cross-functional leadership.
- Growth roles look for funnel judgment, experimentation, monetization, and measurable business outcomes.
- Payments and FinTech roles look for trust, reliability, compliance sensitivity, and transaction-scale ownership.
- Enterprise SaaS roles look for customer adoption, discovery, stakeholder alignment, and commercial outcomes.

A generic resume either becomes too broad to be convincing or too narrow to match the role. Manual tailoring solves relevance but creates risk: inconsistent claims, duplicated effort, unsupported metrics, broken links, and slow application cycles.

## Primary User

Saurabh Chawda applying to:

- Senior Product Manager roles
- Lead Product Manager roles
- AI Product Manager roles
- Platform, growth, payments, enterprise SaaS, and AI product roles

## Secondary Users

| User | What They Need Resume OS To Support |
| --- | --- |
| Recruiters | Fast relevance, clean scanability, clear role fit |
| Hiring managers | Evidence of product judgment, leadership scope, and outcomes |
| ATS and AI screening systems | Parseable structure, relevant keywords, consistent dates and titles |
| Referrers | A role-aligned resume they can confidently forward |
| Interview panels | Claims that can be defended through Product OS evidence |

## Jobs To Be Done

| Job | Outcome |
| --- | --- |
| Tailor a resume to a company and role | Produce a relevant two-page resume quickly |
| Preserve factual accuracy | Keep titles, dates, metrics, and scope consistent with canonical evidence |
| Show role fit | Select the strongest evidence for the target archetype |
| Support ATS parsing | Use clean structure, keywords, and standard section labels |
| Support recruiter scanning | Make role fit visible in 10 to 15 seconds |
| Support interview defense | Ensure every claim maps back to an evidence source |
| Learn from outcomes | Track which resume variants and components lead to interviews |

## Value Proposition

Resume OS provides:

- Faster tailoring without starting from scratch.
- Better relevance through role archetype classification.
- Better consistency through canonical evidence.
- Better recruiter readability through reusable components.
- Better interview defensibility through evidence mapping.
- Better iteration through versioning and outcome analytics.

## Scope

Resume OS includes:

- Resume strategy
- Resume philosophy
- Resume architecture
- Canonical data model
- Component model
- Role archetype taxonomy
- Assembly workflow
- Product OS integration rules
- Governance
- Quality scorecard
- Success metrics
- Roadmap

## Non-Goals

Resume OS does not:

- Invent achievements.
- Rewrite career history.
- Replace final human review.
- Create a one-size-fits-all resume.
- Automatically submit applications.
- Scrape job descriptions without review.
- Claim prototypes as production deployments.
- Expose confidential employer information.
- Duplicate Product OS content inside the resume.

## Relationship With Product OS

Product OS remains the canonical source of truth for:

- Career history
- Verified achievements
- Product Leadership Briefs
- AI frameworks
- Product decision systems
- GitHub artifacts
- Public evidence
- Metrics and outcomes

Resume OS uses Product OS evidence selectively. It should route hiring teams to Product OS when more proof is useful, but it should not force the resume to carry the entire Product OS narrative.

## Relationship With LinkedIn

LinkedIn is the professional identity and social validation layer.

Resume OS should keep LinkedIn aligned with:

- Titles
- Dates
- Role positioning
- Publicly safe metrics
- Product OS and GitHub links

LinkedIn does not need every resume variant. It should remain stable while resumes adapt per application.

## Relationship With GitHub

GitHub is the reusable artifact layer.

Resume OS should link to GitHub when a role benefits from:

- Open product frameworks
- Templates
- Technical documentation
- AI product artifacts
- Decision-system evidence

GitHub links should be used sparingly. A resume should not become a repository directory.

## Resume OS Success Metrics

| Metric | Definition |
| --- | --- |
| Qualified Interview Rate | Percentage of submitted tailored resumes that lead to relevant recruiter or hiring-manager conversations |
| Tailoring Time | Time from JD intake to final reviewed resume |
| ATS Pass Rate | Percentage of resumes with no structural or keyword blockers |
| Recruiter Response Rate | Percentage of applications that receive recruiter engagement |
| Hiring Manager Interview Rate | Percentage of applications that reach hiring-manager review or interview |
| Product OS Click-Through | Measurable visits from resume links where available |
| Component Conversion | Interview performance by headline, summary, project, bullet group, or archetype |

## Roadmap From Architecture To Implementation

| Phase | Purpose | Output |
| --- | --- | --- |
| SPR-017.1 | Define the architecture | Resume OS architecture documents |
| SPR-017.2 | Build the component library | Canonical evidence and reusable resume modules |
| SPR-017.3 | Add JD intelligence | Role archetype and competency extraction |
| SPR-017.4 | Add assembly rules | Two-page resume generation workflow |
| SPR-017.5 | Add QA engine | Factual, ATS, recruiter, and interview-defensibility checks |
| SPR-017.6 | Add analytics | Application outcome and component performance tracking |
| SPR-017.7 | Add role playbooks | Archetype-specific resume playbooks |
| SPR-017.8 | Launch v1.0 | Production-ready Resume OS workflow |

## Reference Implementation Note

The eBay resume was treated as a reference implementation for structure only. Its visible pattern is:

- Company-specific headline
- Role-specific summary
- Selective experience bullets
- Role-specific project
- Role-specific skills and terminology
- Stable career history, education, awards, and credentials

Resume OS should preserve that pattern while making it repeatable, governed, and measurable.
