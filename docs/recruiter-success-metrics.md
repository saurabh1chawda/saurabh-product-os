# Recruiter Success Metrics

Status: RC1 metrics plan  
Last updated: July 2026

## Executive Summary

Recruiter success should be measured by time-to-conviction, evidence engagement, and interview intent.

The goal is not raw page views. The goal is qualified visitors understanding Saurabh's product leadership value quickly enough to continue the hiring conversation.

## North Star Metric

Qualified interview-intent actions from recruiter and hiring-manager visitors.

Examples:

- Contact click.
- Email click.
- LinkedIn click.
- Recruiter path completion.
- Executive Brief to Contact flow.

## Launch KPIs

| KPI | Definition | Why It Matters |
| --- | --- | --- |
| Executive Brief view rate | Share of visitors who reach `/executive` | Measures fast overview adoption |
| Contact click rate | Share of relevant visitors who click Contact, Email, or LinkedIn | Measures interview intent |
| Profile engagement | Visits to `/profile` from recruiter paths | Measures career-fit evaluation |
| Product Leadership Brief engagement | Visits to case-study/brief pages | Measures evidence inspection |
| GitHub outbound rate | Clicks to GitHub from Product OS | Measures artifact credibility interest |
| Return from GitHub | Visitors returning to Product OS after GitHub | Measures ecosystem coherence |
| Time-to-contact | Time from first Product OS page to contact click | Measures friction |
| Recruiter path selection | Clicks on recruiter-specific guided paths | Measures navigation clarity |

## Supporting Metrics

- Homepage to Executive Brief click-through.
- Executive Brief to Product Leadership Brief click-through.
- Executive Brief to Contact click-through.
- Professional Profile to Contact click-through.
- Case Studies Hub to featured brief click-through.
- Product Leadership Brief to Contact click-through.
- GitHub profile to Product OS click-through.

## Qualitative Signals

- Recruiters mention Product OS in outreach.
- Hiring managers reference a specific Product Leadership Brief.
- Interviewers ask about operating principles or AI Playbook.
- Recruiters ask for tailored resume after viewing Professional Profile.
- GitHub repositories are referenced as evidence, not only code.

## Suggested Event Names

Existing events already cover many paths. Recommended audit-level grouping:

| Event Group | Example Event |
| --- | --- |
| Awareness | `executive_brief_viewed`, `v1_release_viewed` |
| Evidence engagement | `featured_decision_clicked`, `plb_viewed` |
| Recruiter navigation | `recruiter_path_clicked`, `reading_path_selected` |
| Toolkit usage | `recruiter_toolkit_used` |
| Conversion | `contact_cta_clicked`, `contact_link_clicked` |

## Conversion Benchmarks

Initial targets should be directional until traffic volume is meaningful.

| Metric | Initial Target |
| --- | --- |
| Executive Brief from homepage | 25%+ of recruiter-intent visitors |
| Contact / LinkedIn click from Executive Brief | 8-12% |
| Profile view after Executive Brief | 20%+ |
| Product Leadership Brief engagement after Executive Brief | 15%+ |
| GitHub outbound from Executive Brief or Profile | 5-10% |

## Reporting Cadence

- Weekly during launch.
- Monthly after baseline stabilizes.
- Review by journey segment: recruiter, hiring manager, product leader, GitHub visitor.

## Success Definition

The recruiter experience is working when a new visitor can answer within five minutes:

- Who is Saurabh?
- What role level does he operate at?
- What business impact has he created?
- How does he think?
- What evidence proves it?
- How do I contact him?
