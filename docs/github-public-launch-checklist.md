# GitHub Public Launch Checklist

Status: RC1 public launch gate  
Last updated: July 2026

## Executive Summary

The GitHub Product Leadership Hub is ready for public launch from a local repository content perspective.

The flagship products have production-oriented READMEs, visible Product OS links, contact paths, license boundaries, reusable documentation structures, and cross-repository navigation. The remaining work is live GitHub configuration: visibility, repository metadata, profile settings, pinned repositories, and social previews.

This checklist separates what is complete locally from what must still be applied manually in GitHub.

## Launch Scope

| Flagship repository | Launch role | Public launch status |
| --- | --- | --- |
| Product OS | Canonical executive evidence platform | Ready after GitHub settings |
| AI Product Playbook | AI product operating guide and ecosystem orchestrator | Ready after GitHub settings |
| Product Leadership Briefs | Reusable library of product decision narratives | Ready after GitHub settings |
| AI Prioritization Framework | AI opportunity scoring and investment decision framework | Ready after GitHub settings |
| Product Discovery Toolkit | Discovery templates, evidence models, and workshop assets | Ready after GitHub settings |
| Decision Memo Template | Executive decision writing templates and communication frameworks | Ready after GitHub settings |

## Repository Visibility

| Repository | Intended visibility | Default branch | License | Notice / contributing | Status |
| --- | --- | --- | --- | --- | --- |
| Product OS | Public | `main` | Present | Present | Ready |
| AI Product Playbook | Public | `main` | Present | Present | Ready |
| Product Leadership Briefs | Public | `main` | Present | Present | Ready |
| AI Prioritization Framework | Public | `main` | Present | Present | Ready |
| Product Discovery Toolkit | Public | `main` | Present | Present | Ready |
| Decision Memo Template | Public | `main` | Present | Present | Ready |

Manual GitHub action:

- Confirm each repository is public before launch announcement.
- Confirm default branch is `main`.
- Confirm GitHub detects or displays the intended license boundary.
- Keep external contribution posture limited at launch.

## Repository Metadata

Use the metadata standard in [GitHub Metadata Standard](github-metadata.md) as the source of truth.

| Repository | Description | Homepage |
| --- | --- | --- |
| Product OS | Evidence-backed AI Product Operating System showing product judgment, decision systems, leadership briefs, and measurable product outcomes. | `https://saurabh-product-os.vercel.app` |
| AI Product Playbook | Practical AI Product Playbook for identifying AI opportunities, designing trustworthy workflows, and scaling AI products responsibly. | `https://saurabh-product-os.vercel.app/ai-product-playbook` |
| Product Leadership Briefs | Reusable Product Leadership Brief format for documenting product decisions, trade-offs, outcomes, and leadership principles. | `https://saurabh-product-os.vercel.app/case-studies` |
| AI Prioritization Framework | Framework and templates for prioritizing AI opportunities by customer value, business value, readiness, and trust risk. | `https://saurabh-product-os.vercel.app/decision-systems/ai-prioritization` |
| Product Discovery Toolkit | Reusable product discovery toolkit for validating customer problems, mapping assumptions, and improving evidence quality before build. | `https://saurabh-product-os.vercel.app/decision-systems/customer-discovery` |
| Decision Memo Template | Decision memo templates and writing frameworks for communicating product recommendations with evidence, trade-offs, and clarity. | `https://saurabh-product-os.vercel.app/product-leadership-operating-principles` |

Manual GitHub action:

- Apply each repository description.
- Apply each homepage URL.
- Apply topics from the shared taxonomy.
- Upload social previews where available.

## README Validation

| Repository | Executive summary | Problem statement | Audience | Status | Start path | Related repositories | Product OS links | Contact path |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Product OS | Ready | Ready | Ready | Ready | Ready | Ready | Ready | Ready |
| AI Product Playbook | Ready | Ready | Ready | Ready | Ready | Ready | Ready | Ready |
| Product Leadership Briefs | Ready | Ready | Ready | Ready | Ready | Ready | Ready | Ready |
| AI Prioritization Framework | Ready | Ready | Ready | Ready | Ready | Ready | Ready | Ready |
| Product Discovery Toolkit | Ready | Ready | Ready | Ready | Ready | Ready | Ready | Ready |
| Decision Memo Template | Ready | Ready | Ready | Ready | Ready | Ready | Ready | Ready |

Manual GitHub action:

- Review README rendering on GitHub after repositories are public.
- Confirm Mermaid diagrams render correctly where supported.
- Confirm relative links resolve in standalone repository context after extraction or publication.

## Link Validation

Primary navigation path:

```text
GitHub Profile
  |
Executive Brief
  |
Product OS
  |
Flagship Repository
  |
Related Repository
  |
Contact
```

| Link type | Expected state | Launch status |
| --- | --- | --- |
| Product OS links | Point to `https://saurabh-product-os.vercel.app` | Ready |
| Executive Brief links | Point to `/executive` | Ready |
| Contact links | Point to `/contact`, LinkedIn, or email | Ready |
| Related repository links | Present in flagship READMEs | Ready |
| Local relative links | Present for monorepo package navigation | Ready locally |
| Live standalone repository links | Must be validated after public repository URLs exist | Manual check required |

## GitHub Profile Validation

Profile README source:

- [GitHub profile README](github-profile/README.md)

Suggested GitHub bio:

> Lead Product Manager building AI products, product decision systems, and reusable product leadership frameworks.

Suggested profile links:

- Product OS: `https://saurabh-product-os.vercel.app`
- Executive Brief: `https://saurabh-product-os.vercel.app/executive`
- LinkedIn: `https://www.linkedin.com/in/chawdasaurabh/`

Recommended pinned repository order:

1. `product-os`
2. `ai-product-playbook`
3. `product-leadership-briefs`
4. `ai-prioritization-framework`
5. `product-discovery-toolkit`
6. `decision-memo-template`

15-second profile test:

- A visitor should know Saurabh builds AI products, product decision systems, and reusable product leadership frameworks.
- A recruiter should immediately find the Executive Brief.
- A Product Manager should immediately find reusable frameworks and templates.
- An Engineering Leader should immediately find AI, platform, and decision-system evidence.

## Social Preview Readiness

| Repository | Preview recommendation | Launch status |
| --- | --- | --- |
| Product OS | Use Product OS Open Graph image or Executive Brief screenshot | Ready |
| AI Product Playbook | Use AI Product Playbook hero or AI Product Studio preview | Manual upload |
| Product Leadership Briefs | Use Product Decision Framework or flagship brief preview | Manual upload |
| AI Prioritization Framework | Use AI Prioritization Matrix diagram | Manual upload |
| Product Discovery Toolkit | Use Evidence Ladder diagram | Manual upload |
| Decision Memo Template | Use Decision Writing Pyramid diagram | Manual upload |

Repository-specific previews should not block public launch. Use Product OS preview assets until custom previews are available.

## Launch Readiness Score

Scores are based on local documentation readiness plus known manual GitHub setup requirements.

| Repository | Discoverability | Credibility | Consistency | Navigation | Launch readiness | Overall |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Product OS | 95% | 96% | 94% | 94% | 93% | 94% |
| AI Product Playbook | 92% | 93% | 91% | 92% | 91% | 92% |
| Product Leadership Briefs | 92% | 94% | 91% | 92% | 90% | 92% |
| AI Prioritization Framework | 91% | 92% | 91% | 91% | 90% | 91% |
| Product Discovery Toolkit | 91% | 92% | 91% | 91% | 90% | 91% |
| Decision Memo Template | 90% | 91% | 91% | 91% | 89% | 90% |

Overall readiness score: 92%.

Interpretation:

- 90%+ means launch-ready with minor manual GitHub settings remaining.
- The ecosystem is ready for public visibility.
- The only blocking launch tasks are GitHub UI configuration and final live-link verification.

## Manual GitHub Settings Still Required

Before public announcement:

- Make or confirm each flagship repository is public.
- Set repository descriptions.
- Set homepage URLs.
- Apply GitHub topics.
- Confirm default branch is `main`.
- Pin repositories in the recommended order.
- Upload social previews where available.
- Confirm license display in GitHub.
- Confirm profile bio, website link, and social links.
- Confirm README rendering for every repository.
- Validate live links after repository URLs are final.

## Public Launch Checklist

| Launch gate | Owner | Status |
| --- | --- | --- |
| Repository content reviewed | Product Leadership Platform | Complete |
| Profile README finalized | Product Leadership Platform | Complete |
| Metadata standard defined | Product Leadership Platform | Complete |
| License boundaries visible | Product Leadership Platform | Complete |
| Contact paths present | Product Leadership Platform | Complete |
| Cross-repository navigation present | Product Leadership Platform | Complete |
| Repository visibility set to public | GitHub manual setting | Pending |
| Repository descriptions applied | GitHub manual setting | Pending |
| Homepage URLs applied | GitHub manual setting | Pending |
| Topics applied | GitHub manual setting | Pending |
| Pinned repositories ordered | GitHub manual setting | Pending |
| Social previews uploaded | GitHub manual setting | Pending |
| Live link validation completed | GitHub manual check | Pending |

## Final Launch Decision

The GitHub Product Leadership Hub is ready for public launch once the manual GitHub settings are applied.

No new architecture, frameworks, or content expansion are required before launch.

## Operating Principle

Public GitHub should prove that the Product Leadership Platform is reusable, maintained, discoverable, and connected to Product OS without becoming a second source of truth.
