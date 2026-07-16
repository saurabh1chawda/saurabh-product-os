# JD Segmentation and Normalization

## Segmentation Goals

The engine separates the job description into meaningful sections before classification. This prevents company marketing language and legal boilerplate from overpowering role requirements.

## Segments

| Segment | Purpose | Include | Exclude |
| --- | --- | --- | --- |
| Company overview | Context and industry language | Mission, product area, customers | Recruiting slogans unless role-relevant |
| Role overview | Role intent | Team, product area, scope | Benefits and generic values |
| Responsibilities | What the person will do | Ownership, roadmap, discovery, launch, metrics | Repeated qualification bullets |
| Required qualifications | Hard filters | Years, domain, technical, leadership requirements | Preferred language |
| Preferred qualifications | Differentiators | Nice-to-have domains, tools, depth | Required qualifications |
| Technical requirements | Technical fit | APIs, data, AI/ML, analytics, architecture | Vague "tech savvy" claims |
| Leadership expectations | Seniority fit | Influence, executive communication, alignment | Generic collaboration filler |
| Benefits and legal boilerplate | Ignored for fit unless location/work model matters | Compensation range, EEO language, benefits | N/A |
| Equal-opportunity language | Compliance-only | EEO statements | Do not use for keyword matching |
| Application instructions | Submission requirements | Portfolio, work authorization, location | Role fit scoring |

## Normalization Rules

The engine preserves original wording and creates normalized labels.

| Original Variants | Normalized Label |
| --- | --- |
| Senior, Sr., SPM | Senior Product Manager |
| Lead, Principal, Staff | Lead or Principal Product Manager |
| Product Manager II, PM II | Product Manager II |
| Product Manager III, PM III | Senior Product Manager |
| AI, ML, GenAI, LLM | AI Product |
| Platform, Infrastructure, Developer Platform | Platform Product |
| Growth, Monetization, Lifecycle, Retention | Growth or Monetization Product |
| Payments, Wallets, FinTech | Payments / FinTech Product |
| B2B, Enterprise, SaaS | Enterprise SaaS |
| Consumer, Marketplace, Mobile | Consumer Product |
| Zero-to-one, 0->1, incubation | Zero-to-one |
| Scale, optimization, maturity | Scale and optimization |

## Preservation Rule

Every normalized label must retain a link to the original JD phrase. The engine should never replace the JD wording permanently.

## Boilerplate Suppression

Boilerplate should receive low or zero fit weight unless it includes a real requirement:

- Work authorization.
- Location or travel requirement.
- Portfolio submission requirement.
- Required certification or credential.
- Specific legal or regulated-domain requirement.

## Ambiguous Section Handling

When section headings are missing:

- Use phrase patterns such as "you will", "responsibilities", "must have", "preferred", and "nice to have".
- Mark ambiguous bullets with `section_confidence: low`.
- Require human review if required and preferred qualifications cannot be separated.

