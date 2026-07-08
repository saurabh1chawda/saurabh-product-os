# Navigation Audit

Status: RC1 audit  
Last updated: July 2026

## Executive Summary

Navigation is broad and mostly healthy. The current global header supports exploration, while the footer includes the stronger executive routes. The biggest recruiter-navigation issue is not broken links; it is path prioritization.

Recruiters need fewer choices earlier and stronger "what next" guidance after evidence pages.

## Primary Navigation Observations

| Area | Current State | Risk | Recommendation |
| --- | --- | --- | --- |
| Header | Decision OS, Case Studies, Recruiter Tour, For Recruiters, Professional Profile, Contact | Executive Brief is absent from primary header despite being the fastest recruiter overview | Consider adding Executive Brief or replacing a lower-priority recruiter route if navigation capacity allows |
| Footer | Includes Executive Brief, Profile, Decision OS, Operating Principles, AI Playbook, Case Studies, Contact | Stronger than header for executive navigation | Keep footer as evidence map; ensure every major page uses it |
| Homepage primary CTA | "Explore product judgment" points to `/how-i-think` redirecting to Decision OS | Recruiter may land in a deep system before the executive summary | Prefer "Read the Executive Brief" for recruiter conversion |
| Product Leadership Briefs | Evidence-rich pages with related resources | Recruiter may not know which brief maps to role | Add audience or competency labels near CTAs |
| GitHub Profile | Audience paths point to Executive Brief, Profile, Case Studies, Contact | Strong | Keep synchronized with local repository maturity |

## Dead Ends

No hard dead ends were identified from the audited entry points. The main risk is soft dead ends: pages that educate but do not clearly tell recruiters what to do next.

Soft dead-end risks:

- Decision OS can absorb time without pushing a recruiter to contact.
- Case Studies Hub can lead to deep reading without an interview CTA.
- GitHub can send visitors into repositories without a direct return to Product OS / Contact.

## Missing Cross-Links

| Location | Missing / Weak Link | Recommended Link |
| --- | --- | --- |
| Homepage hero | Executive Brief | `/executive` |
| Product Leadership Brief pages | Contact / interview request | `/contact` with recruiter-oriented CTA |
| GitHub repositories | Executive Brief and Contact | Product OS Executive Brief, Contact |
| Professional Profile | Executive Brief | Add "Read the Executive Brief" near top or Continue Exploring |
| Contact page | Best evidence for role fit | Executive Brief, Professional Profile, Case Studies |

## Weak Calls To Action

| CTA | Issue | Suggested Improvement |
| --- | --- | --- |
| Explore product judgment | Accurate but broad | Read the Executive Brief |
| Case Studies | General | Review Product Leadership Briefs |
| Contact | Functional | Start an interview conversation |
| GitHub | Destination unclear to recruiters | Inspect reusable product artifacts |

## Navigation Improvements

1. Add Executive Brief as a top-level recruiter path where space allows.
2. Use "Professional Profile" consistently instead of "Resume" in public Product OS.
3. Add "Continue to Contact" after Executive Brief, Profile, and top Product Leadership Briefs.
4. Add "Return to Executive Brief" from GitHub profile and flagship repository READMEs.
5. Add role-fit routes:
   - AI/platform role -> Logix + AI Product Playbook.
   - Growth role -> Simplilearn.
   - Payments/reliability role -> Mahindra Comviva.
   - Discovery/SaaS role -> JoVE.

## Validation

- No repository architecture changes recommended.
- No content duplication recommended.
- Recommendations focus on linking, CTA clarity, and journey sequencing.
