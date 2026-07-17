# eBay Live Pilot Input Discovery

Status: BLOCKED - real eBay job description not found

## Search Summary

The repository was searched across tracked and ignored files for eBay, loyalty, marketplace, monetization, resume, JD, job, and application-related paths and text.

## Files Searched

- `docs/resume-os/`
- `docs/resume-os/reference-resumes/`
- `docs/resume-os/data/`
- `docs/resume-os/evidence/`
- `docs/resume-os/components/`
- `docs/resume-os/bullet-library/`
- `docs/resume-os/jd-intelligence/`
- `docs/resume-os/assembly/`
- `scripts/resume-os/`
- `app/`
- `content/`
- `repositories/`

## eBay-Related Files Found

| Type | Path | Git status | Notes |
| --- | --- | --- | --- |
| Benchmark resume text extract | `docs/resume-os/reference-resumes/ebay-spm-monetization-loyalty-reference.docx.txt` | Ignored | Contains the manually tailored benchmark resume text extracted from the private resume. |
| Benchmark resume PDF | `docs/resume-os/reference-resumes/ebay-spm-monetization-loyalty-reference.docx.pdf` | Ignored | Private benchmark artifact. Not committed. |
| Canonical project mapping | `docs/resume-os/data/projects.yaml` | Tracked | Contains `LOYALTYIQ` as a simulation-only eBay target application project. |
| Link reference | `docs/resume-os/data/links.yaml` | Tracked | Marks the eBay reference resume as local-only and never-commit. |
| Resume OS component model | `docs/resume-os/resume-components.md` | Tracked | Uses the eBay resume as a structural reference model. |
| Evidence indexes | `docs/resume-os/evidence/*` | Tracked | Map eBay reference resume evidence to canonical IDs where verified. |

## Candidate JD Files

No real eBay job description file was found.

Searches found synthetic JD fixtures for monetization, growth, platform, AI, payments, enterprise SaaS, and hybrid roles, but no real eBay JD. Synthetic fixtures were not used as substitutes.

## Candidate Benchmark Resume Files

| Candidate | Path | Selected | Reason |
| --- | --- | --- | --- |
| eBay manually tailored resume text extract | `docs/resume-os/reference-resumes/ebay-spm-monetization-loyalty-reference.docx.txt` | Yes | Most complete available benchmark content. It includes headline, summary, experience bullets, project section, skills, credentials, awards, publications, and education. |
| eBay benchmark PDF | `docs/resume-os/reference-resumes/ebay-spm-monetization-loyalty-reference.docx.pdf` | No direct extraction | Private PDF is available but the text extract is easier to inspect without copying the source artifact. |

## Candidate Project Files

| Candidate | Path | Selection | Notes |
| --- | --- | --- | --- |
| LoyaltyIQ project mapping | `docs/resume-os/data/projects.yaml` | Selected as associated proof | The project is explicitly marked simulation-only and requires clear labeling. |
| Project evidence index | `docs/resume-os/evidence/project-index.md` | Selected as supporting map | Confirms LoyaltyIQ is simulation-only and must not be presented as production work. |
| Metric evidence index | `docs/resume-os/evidence/metric-index.md` | Selected as safety source | Confirms simulation metrics must not be used as real business outcomes. |

## Selected Inputs

- Selected JD: none. The real eBay JD is missing.
- Selected benchmark resume: `docs/resume-os/reference-resumes/ebay-spm-monetization-loyalty-reference.docx.txt`
- Selected associated project proof: `LOYALTYIQ` from `docs/resume-os/data/projects.yaml`

## Reasons For Selection

The benchmark resume text extract is the only complete eBay application artifact available locally. The LoyaltyIQ project is selected only as associated proof because canonical Resume OS data already classifies it as a simulation-only company-specific proof-of-work artifact.

## Missing Inputs

- Real eBay job description.
- Any explicit eBay application notes, gap assessment, or JD analysis.
- Any live JD source URL.

## Ambiguities

- The target role appears to be Senior Product Manager, monetization and loyalty oriented, based on the benchmark resume filename and content.
- The exact eBay JD requirements, team, location, and level cannot be verified without the missing JD.
- The role may combine monetization, growth, consumer marketplace, loyalty, and platform signals, but that cannot be treated as JD evidence.

## Confidentiality Classification

| Input | Classification | Commit policy |
| --- | --- | --- |
| Reference resume text extract | Private application benchmark | Do not commit source file. Use sanitized analysis only. |
| Reference resume PDF | Private application benchmark | Do not commit. |
| LoyaltyIQ canonical mapping | Public-safe metadata | Already tracked. Keep simulation label. |
| Missing eBay JD | Unknown | Must be added locally or sanitized before analysis. |

## Git Ignore Status

The reference resume files are ignored by the root `.gitignore` rule:

`docs/resume-os/reference-resumes/`

This pilot commits only sanitized scaffold and analysis artifacts.

