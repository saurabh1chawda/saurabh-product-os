# Content Metadata Standard

Status: RC1 metadata model  
Last updated: July 2026

## Executive Summary

The Content Metadata Standard defines the required fields for every content production item.

Metadata keeps the publishing system searchable, measurable, and tied to the Product Leadership Platform's canonical sources.

## Required Metadata Fields

| Field | Description | Example |
| --- | --- | --- |
| Source artifact | Canonical Product OS or GitHub source | Logix Product Leadership Brief |
| Category | Content taxonomy category | Case Study |
| Audience | Primary reader or viewer | Hiring Manager |
| Channel | Intended distribution channel | LinkedIn |
| Status | Production state | Draft |
| CTA | Primary next action | Review the Logix brief |
| KPI | Metric to monitor | Product Leadership Brief click-through |
| Publish date | Planned or actual date | 2026-07-15 |
| Last updated | Last production update | 2026-07-08 |

## Recommended Optional Fields

| Field | Description |
| --- | --- |
| Working title | Draft title or post hook |
| Key idea | One-sentence thesis |
| Related assets | Secondary sources |
| Reviewer | Evidence or editorial reviewer |
| Owner | Person responsible for handoff |
| Notes | Production notes |

## Category Values

Use values from `docs/content-taxonomy.md`:

- Insights.
- Frameworks.
- Toolkits.
- Case Studies.
- Announcements.

## Audience Values

Recommended values:

- Recruiter.
- Hiring Manager.
- VP Product / CPO.
- Product Leader.
- Product Manager.
- AI Product Manager.
- Engineering Leader.
- Founder.

## Channel Values

Recommended values:

- LinkedIn insight.
- LinkedIn carousel.
- LinkedIn article.
- Newsletter.
- Blog.
- GitHub release.
- Workshop.
- Conference.
- Podcast.
- Interview preparation.

## Status Values

| Status | Meaning |
| --- | --- |
| Idea | Potential content item |
| Briefed | Source, audience, CTA, and KPI defined |
| Draft | Draft exists |
| Evidence Review | Claims being checked |
| Editorial Review | Clarity and quality review |
| Ready | Approved for publishing handoff |
| Published | Published |
| Archived | No longer active |

## CTA Values

Preferred CTA patterns:

- Read the Executive Brief.
- Review the Product Leadership Brief.
- Explore the AI Product Playbook.
- Use the Product Discovery Toolkit.
- Explore the AI Prioritization Framework.
- Use the Decision Memo Template.
- Contact Saurabh.

## KPI Values

Recommended KPI patterns:

- Executive Brief views.
- Product Leadership Brief click-through.
- GitHub profile visits.
- Repository stars.
- Contact conversions.
- LinkedIn profile visits.
- Returning visitors.
- Content reuse rate.
- Qualified Interview Opportunities.

## Metadata Example

```yaml
source_artifact: Logix Product Leadership Brief
category: Case Studies
audience: Hiring Manager
channel: LinkedIn insight
status: Briefed
cta: Review the Logix Product Leadership Brief
kpi: Product Leadership Brief click-through
publish_date: TBD
last_updated: 2026-07-08
working_title: Platform before intelligence
key_idea: AI features scale only when the platform foundation can support them.
```

## Operating Principle

Metadata should make every content item traceable, measurable, and reusable.
