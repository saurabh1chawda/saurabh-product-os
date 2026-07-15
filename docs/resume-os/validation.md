# Resume OS Validation

## Purpose

This document defines the validation rules for SPR-017.2 and future Resume OS automation.

## Current Validation Scope

SPR-017.2 validates:

- Canonical profile and employment history exists.
- Achievements have IDs.
- Achievements have evidence sources.
- Achievements have role archetype mappings.
- Metrics appear in the metric index.
- Product OS artifacts have project IDs.
- Resume bullets map to exactly one achievement ID.
- Reference resumes remain local and uncommitted.

## Manual Validation Checklist

| Check | Status |
| --- | --- |
| Every metric has evidence | Complete in `evidence/metric-index.md` |
| Every bullet has an achievement ID | Complete in `bullet-library/*.md` |
| Every Product OS project has a project ID | Complete in `data/projects.yaml` and `evidence/project-index.md` |
| Every achievement has role mappings | Complete in `data/achievements.yaml` |
| Every achievement has evidence mappings | Complete in `data/achievements.yaml` |
| No duplicate achievements exist | IDs are unique in the current inventory |
| No orphan bullets exist | Bullet tables include one Achievement ID per row |
| No fabricated claims exist | Claims are sourced from reference resume or Product OS artifacts |
| Product OS links resolve | Must be checked before release |
| Reference resume remains local | Protected by root `.gitignore` rule |

## Bullet Traceability Rule

Every bullet must follow:

```text
Bullet ID
-> exactly one Achievement ID
-> metric in Achievement record
-> source in Source Map
-> optional Project ID
-> optional GitHub URL
-> optional Product OS URL
```

## Achievement ID Rule

Achievement IDs use:

```text
<COMPANY>-<CATEGORY>-<NUMBER>
```

Examples:

- SIM-REV-001
- COM-PAY-003
- JOV-ENG-002
- LOG-PLG-003

Category codes may be two or three letters where the shorter form is clearer, such as `JOV-AI-003`.

## Evidence Statuses

| Status | Meaning | Resume Use |
| --- | --- | --- |
| product_os_verified | Public Product OS or GitHub evidence exists | Safe to use |
| reference_verified | Present in local reference resume | Safe to use after human review |
| needs_review | Not yet approved | Do not use |
| simulation_only | Proof-of-work only | Must be labeled clearly |

## P0 Validation Failures

- Unsupported metric.
- Missing achievement ID.
- Bullet maps to zero achievement IDs.
- Bullet maps to multiple achievement IDs.
- Product OS project lacks project ID.
- Reference resume file staged for commit.
- Employment date changed without evidence.
- Title changed without evidence.
- Simulation project presented as production.

## Future Automated Validation

SPR-017.3 or later should add validators for:

- YAML schema compliance.
- Duplicate achievement IDs.
- Bullet achievement ID existence.
- Metric index coverage.
- Product OS URL status.
- GitHub URL status.
- Reference-resume ignore protection.
