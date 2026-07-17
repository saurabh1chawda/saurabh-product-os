# Resume OS Narrative Layer Architecture

## Purpose

The Narrative Layer is a deterministic post-processing layer that improves how verified resume evidence reads after assembly. It does not retrieve evidence, rank evidence, or create new claims.

## Pipeline Position

JD -> JD Intelligence -> Resume Plan -> Resume Assembly -> Narrative Layer -> Human Review -> DOCX/PDF

## Inputs

- Resume Assembly draft JSON and Markdown.
- Resume Plan.
- Evidence map.
- Canonical achievement IDs.
- Selected bullet IDs.
- Pilot scorecard.

## Outputs

- Narrative-transformed draft JSON.
- Narrative-transformed draft Markdown.
- Before/after transform report.
- Narrative validation report.
- Score update for recruiter, hiring manager, and human writing quality.

## Deterministic Processing Stages

1. Preserve identity, chronology, companies, titles, dates, metrics, evidence IDs, and Product OS links.
2. Transform only headline, summary, and bullet text.
3. Apply reversible rules with a rule ID.
4. Compare source and transformed text for protected tokens.
5. Validate that evidence IDs and chronology are unchanged.
6. Score readability, tone, rhythm, and scanability.
7. Emit human-review warnings.

## Reversibility

Every rewrite is recorded with:

- Original text.
- Transformed text.
- Transformation rule.
- Reason.
- Risk level.

No transformation is accepted without a before/after record.

## Failure States

- Metric changed.
- Date changed.
- Company or title changed.
- Evidence ID changed.
- New unsupported technology introduced.
- Ownership claim strengthened.
- Chronology changed.
- Product OS reference changed.

Any failure is a P0 narrative defect.

