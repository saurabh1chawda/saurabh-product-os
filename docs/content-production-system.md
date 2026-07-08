# Content Production System

Status: RC1 operating model  
Last updated: July 2026

## Executive Summary

The Content Production System defines how canonical Product Leadership Platform assets become high-quality content drafts for LinkedIn, GitHub, blog, newsletter, workshops, speaking, and interview preparation.

This system does not publish content. It governs how content is selected, produced, reviewed, and handed off for publishing while keeping Product OS as the single source of truth.

## Production Workflow

```text
Source artifact
  |
Content brief
  |
Draft
  |
Evidence review
  |
Editorial review
  |
Channel adaptation
  |
Publishing handoff
```

## Step 1: Source Artifact Selection

Every content item must begin from a canonical source.

Approved source types:

- Executive Brief.
- Product Leadership Brief.
- AI Product Playbook section.
- AI Prioritization Framework artifact.
- Product Discovery Toolkit artifact.
- Decision Memo Template artifact.
- Product OS operating principle.

Decision gate:

- Does the source artifact exist?
- Is it current?
- Does it contain enough evidence to support the content idea?

If the answer is no, update the source artifact before producing derivative content.

## Step 2: Content Brief

The content brief defines the production intent.

Required fields:

- Source artifact.
- One key idea.
- Audience.
- Channel.
- CTA.
- KPI.
- Source link.
- Status.

Decision gate:

- Can the idea be explained in one sentence?
- Does the audience have a clear reason to care?
- Is there one next action?

## Step 3: Draft

Draft the content using the appropriate template from `docs/content-templates.md`.

Drafting rules:

- Use one key idea.
- Preserve source facts.
- Do not introduce new metrics.
- Use the channel's native style.
- Make the CTA explicit.

AI assistance is allowed at this stage, but AI output must be reviewed against the canonical source before handoff.

## Step 4: Evidence Review

Evidence review checks whether the draft is accurate and traceable.

Review questions:

- Does every claim map to the source artifact?
- Are metrics unchanged?
- Are company, product, and role details accurate?
- Is the distinction between Product OS and GitHub preserved?
- Are unsupported claims removed?

Decision gate:

- Pass: proceed to editorial review.
- Needs source update: update Product OS or the relevant repository first.
- Reject: archive the content idea.

## Step 5: Editorial Review

Editorial review checks clarity, tone, and audience value.

Review criteria:

- Executive clarity.
- Practical value.
- One key idea.
- Strong opening.
- Clear CTA.
- No hype.
- No duplicated long-form source content.

## Step 6: Channel Adaptation

Adapt the approved draft for the intended channel.

| Channel | Adaptation Focus |
| --- | --- |
| LinkedIn insight | Hook, lesson, short evidence, discussion prompt |
| LinkedIn carousel | Slide progression, visual clarity, one idea per slide |
| Blog | Context, examples, decision logic |
| Newsletter | Curated lesson and next read |
| GitHub release | What changed, why it matters, how to use it |
| Workshop | Learning outcome, agenda, exercise |
| Speaking | Story arc, principle, takeaway |
| Interview prep | Crisp evidence and discussion prompt |

Decision gate:

- Does the output feel native to the channel?
- Does it still link back to the canonical source?

## Step 7: Publishing Handoff

Publishing handoff provides the final package to the publishing system.

Handoff package:

- Final draft.
- Source artifact link.
- Metadata.
- CTA.
- Suggested publish date.
- KPI.
- Review status.

## Roles

| Role | Responsibility |
| --- | --- |
| Product Owner | Selects source artifact and validates product accuracy |
| Content Strategist | Defines angle, audience, and channel |
| AI Assistant | Produces first-pass drafts and format variants |
| Editorial Reviewer | Improves clarity, tone, and structure |
| Evidence Reviewer | Checks claims against Product OS and GitHub sources |
| Publisher | Schedules, publishes, and tracks performance |

## AI Assistance

AI should accelerate production, not replace judgment.

Approved AI uses:

- Summarizing source artifacts.
- Generating first drafts.
- Producing format variants.
- Creating speaking notes.
- Suggesting titles.
- Converting one source into multiple channel drafts.

AI must not:

- Invent metrics.
- Invent customer details.
- Add unsupported claims.
- Change business outcomes.
- Create new source-of-truth content.
- Publish without human review.

## Review Process

Every content item requires three reviews:

1. Source review: is the source artifact valid?
2. Evidence review: are claims accurate?
3. Editorial review: is the content useful and clear?

Use `docs/editorial-checklist.md` before publishing handoff.

## Publishing Handoff Standard

Each final content package should include:

- Title.
- Channel.
- Final copy.
- Source artifact.
- CTA.
- Metadata.
- KPI.
- Review owner.
- Status.

## Operating Principle

Production turns source artifacts into usable content. It does not create a second source of truth.
