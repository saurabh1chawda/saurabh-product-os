# Source Map

## Purpose

The source map records where Resume OS facts came from.

## Sources

| Source ID | Source | Type | Commit Policy | Used For |
| --- | --- | --- | --- | --- |
| reference_resume_ebay_pdf | `docs/resume-os/reference-resumes/ebay-spm-monetization-loyalty-reference.docx.pdf` | Local reference resume PDF | Never commit | Career facts, selected bullets, awards, certifications, LoyaltyIQ structure |
| product_os_profile | `app/profile/page.tsx` | Product OS page source | Commit allowed | Career timeline, business outcomes, awards |
| product_leadership_brief_logix | `repositories/product-leadership-briefs/briefs/logix.md` | Public artifact source | Commit allowed | Logix decisions, metrics, evidence |
| product_leadership_brief_jove | `repositories/product-leadership-briefs/briefs/jove.md` | Public artifact source | Commit allowed | JoVE decisions, metrics, evidence |
| product_leadership_brief_simplilearn | `repositories/product-leadership-briefs/briefs/simplilearn.md` | Public artifact source | Commit allowed | Simplilearn decisions, metrics, evidence |
| product_leadership_brief_comviva | `repositories/product-leadership-briefs/briefs/mahindra-comviva.md` | Public artifact source | Commit allowed | Comviva decisions, metrics, evidence |
| ai_product_playbook | `repositories/ai-product-playbook/README.md` | Public artifact source | Commit allowed | AI Product Playbook project mapping |
| ai_prioritization_framework | `repositories/ai-prioritization-framework/README.md` | Public artifact source | Commit allowed | AI Prioritization project mapping |
| product_discovery_toolkit | `repositories/product-discovery-toolkit/README.md` | Public artifact source | Commit allowed | Discovery Toolkit project mapping |
| decision_memo_template | `repositories/decision-memo-template/README.md` | Public artifact source | Commit allowed | Decision Memo Template project mapping |

## Traceability Pattern

```text
Resume Bullet
-> Achievement ID
-> Metric
-> Project ID
-> GitHub Repository
-> Portfolio URL
-> Supporting Evidence Source
```

## Current Evidence Quality

| Evidence Level | Meaning |
| --- | --- |
| Product OS verified | Supported by public Product OS or GitHub artifacts |
| Reference verified | Present in the local reference resume |
| Simulation only | Valid as proof-of-work only when labeled |
| Needs review | Do not use in submitted resumes until reviewed |

## Reference Resume Policy

The reference resume and extracted text are local-only source material. They must not be committed to Git.
