# JD Intelligence Validation Strategy

## Purpose

This validation strategy proves that the JD Intelligence layer can classify job descriptions, retrieve verified Resume OS evidence, surface risks, and explain recommendations before the Resume Assembly Engine is built.

The goal is not to make every fixture look maximally favorable. The goal is to verify that the system is truthful, traceable, balanced, and useful.

## Scope

In scope:

- Synthetic fixture validation.
- Edge-case and contradiction validation.
- Schema and reference integrity.
- Archetype classification.
- Competency and keyword extraction.
- Hidden-signal inference.
- Achievement and bullet ranking.
- Product OS evidence selection.
- Gap and risk detection.
- Explainability and safety checks.

Out of scope:

- Final resume generation.
- DOCX or PDF export.
- Live application analysis.
- Recruiter emails or cover letters.
- Product OS content expansion.
- Canonical achievement rewriting.

## Test Levels

| Level | Name | Purpose |
| --- | --- | --- |
| A | Schema validation | Confirm JSON schemas parse and required model contracts exist. |
| B | Reference integrity | Confirm achievements, bullets, projects, and links remain traceable. |
| C | Archetype classification | Confirm each JD maps to the expected PM archetype. |
| D | Competency extraction | Confirm expected competency groups are detected. |
| E | Keyword extraction | Confirm useful keywords are prioritized and boilerplate is suppressed. |
| F | Hidden-signal inference | Confirm implied expectations are labeled as inferences. |
| G | Achievement ranking | Confirm role-relevant verified achievements rank appropriately. |
| H | Bullet-library ranking | Confirm recommended bullets map to canonical achievements. |
| I | Product OS evidence recommendation | Confirm Product OS assets are relevant and not overused. |
| J | Gap and risk detection | Confirm gaps are explicit and honest. |
| K | Explainability | Confirm every recommendation has reasons, penalties, evidence, and confidence. |
| L | Safety and factual integrity | Confirm no unsupported claim, simulation inflation, or orphan evidence appears. |
| M | Hybrid-role behavior | Confirm hybrid roles preserve both major archetypes. |
| N | Contradiction and balance checks | Confirm overfitting and unbalanced recommendations are flagged. |

## Test Fixtures

Primary fixtures:

- `ai-product-manager.md`
- `platform-product-manager.md`
- `growth-product-manager.md`
- `monetization-product-manager.md`
- `payments-product-manager.md`
- `enterprise-saas-product-manager.md`
- `hybrid-ai-platform-pm.md`

Edge-case fixtures:

- `ic-platform-overmanagement.md`
- `growth-overtechnical.md`
- `ai-overstatement-risk.md`
- `hybrid-balance.md`
- `evidence-diversity.md`

## Expected Outputs

Each validation run produces:

- One JSON result per primary fixture.
- One consolidated edge-case result.
- One validation summary.
- One human-readable validation report.
- One explainability review.

## Pass / Fail Rules

Hard failures:

- Clear fixture primary archetype is incorrect.
- Hybrid fixture misses one of its two major archetypes.
- Unsupported achievement is recommended.
- Orphan bullet appears.
- Simulation or prototype is treated as production experience.
- Product OS artifact is treated as employer work experience.
- Hard requirement gap is silently ignored.
- Validation output cannot be generated.

Warnings:

- Expected supporting evidence appears outside the preferred tolerance band.
- Low-confidence hidden signal is detected.
- Evidence is role-relevant but concentrated in one company.
- Product OS asset is useful but not essential.
- A gap is mitigable but requires careful interview framing.

## Tolerance Rules

- Expected top-tier achievements should appear in the top 5.
- Expected supporting achievements should appear in the top 10.
- Exact rank order is not required when scores are within 5 points.
- Hybrid roles may return either major archetype as primary if the other appears as a high-scoring secondary.
- Secondary archetypes may vary when the rationale is explicit and truthful.

## Regression Policy

The validation command must run before Resume OS engine changes are accepted. Any hard failure blocks SPR-017.4 readiness unless documented as a deliberate model change.

## Human Review Requirements

Human review is required when:

- Archetype confidence is medium or low.
- Required credentials or technologies are missing.
- A gap cannot be mitigated honestly.
- A project or Product OS asset is recommended for a resume body.
- A hidden signal affects positioning materially.

## Validation Limitations

- Fixtures are synthetic and cannot capture every company-specific nuance.
- The harness is deterministic and does not perform semantic reasoning beyond the documented rules.
- Validation proves readiness for assembly logic, not readiness for automated application submission.
- Small samples must not be overinterpreted as performance statistics.

