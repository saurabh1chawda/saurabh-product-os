# JD Intelligence Implementation Plan

## Objective

SPR-017.4 should implement the JD Intelligence Engine as a deterministic, local-first evidence retrieval system with optional LLM assistance.

## Recommended Implementation Language

Use TypeScript.

Rationale:

- Product OS already uses TypeScript and Next.js.
- JSON schema validation and YAML parsing are mature.
- Future UI/API integration will be easier.
- Deterministic tests can run in the existing validation workflow.

## Proposed File Layout

```text
tools/resume-os/
  jd-intelligence/
    parse-jd.ts
    normalize-jd.ts
    classify-archetype.ts
    extract-competencies.ts
    extract-keywords.ts
    infer-hidden-signals.ts
    match-evidence.ts
    rank-bullets.ts
    recommend-components.ts
    analyze-gaps.ts
    generate-report.ts
    schemas.ts
    fixtures/
    tests/
```

No Product OS application page should depend on this engine in SPR-017.4.

## YAML and JSON Parsing

- Read canonical YAML from `docs/resume-os/data/`.
- Read bullet libraries from `docs/resume-os/bullet-library/`.
- Read components from `docs/resume-os/components/`.
- Validate JSON schemas before analysis.
- Fail closed if canonical evidence cannot be parsed.

## Schema Validation

Required validators:

- Achievement schema.
- Project schema.
- Employment schema.
- JD Intelligence output schema.

Validation should run before fixture tests.

## JD Text Ingestion

Accepted inputs:

- Markdown file.
- Plain text file.
- Pasted text saved locally.

Rejected inputs:

- Untrusted remote scraping in the baseline implementation.
- PDF or DOCX parsing unless explicitly added later.

## Rule-Based Baseline

The first version should be deterministic:

- Regex and phrase dictionaries for segmentation.
- Weighted signal tables for archetype classification.
- Competency taxonomy mappings.
- Keyword weighting rules.
- Evidence scoring formula.
- Gap rules.

## Optional LLM-Assisted Analysis

LLM assistance may be added later for:

- Ambiguous JD segmentation.
- Hidden-signal explanation drafts.
- Human-readable report summarization.

Boundaries:

- LLM output must be constrained by canonical evidence.
- LLM cannot create achievements, metrics, titles, dates, or technologies.
- LLM cannot write directly into canonical evidence.
- LLM output must be marked as draft until reviewed.

## Deterministic Safeguards

- Every recommendation must reference evidence IDs.
- Unknown claims become gaps.
- Unsupported keywords are flagged.
- Simulations and prototypes keep their status.
- Confidence scores are visible.
- Human-review flags are mandatory for inferred fields.

## Prompt Boundaries

If LLM assistance is used:

- Provide only relevant JD segments and canonical evidence summaries.
- Instruct the model to return structured JSON.
- Forbid new facts.
- Require source phrases for every inference.
- Validate output against `jd-intelligence-output.schema.json`.

## Confidence Scoring

Use explicit confidence scores for:

- Role metadata extraction.
- Archetype classification.
- Competency extraction.
- Hidden signals.
- Evidence matching.
- Final recommendation.

Low-confidence outputs require human review.

## Human-in-the-Loop Review

Human review is required before:

- Resume assembly.
- Claim selection.
- Project inclusion.
- Product OS block inclusion.
- Application submission.

## Logging

Log:

- Input file name.
- JD ID.
- Parsed sections.
- Archetype scores.
- Top evidence matches.
- Gaps.
- Human-review items.

Do not log:

- Private recruiter messages.
- Personal contact details beyond existing canonical profile fields.
- Unredacted confidential job details if the user marks them sensitive.

## Testing

Minimum tests:

- Fixture classification.
- Keyword extraction.
- Hidden-signal inference.
- Evidence matching.
- Bullet ID integrity.
- Schema validation.
- Gap analysis.
- No orphan evidence recommendations.

## Error Handling

Fail with actionable messages when:

- JD text is too short.
- Required canonical files are missing.
- YAML or JSON parsing fails.
- Schema validation fails.
- No primary archetype can be assigned.
- Required evidence is missing.
- Unsupported required credential is found.

## Security and Privacy

- Run locally by default.
- Do not send JD text externally unless the user explicitly enables LLM assistance.
- Do not store active application data in public docs.
- Keep reference resumes ignored.

## Future UI/API Possibilities

- Local CLI.
- Resume OS dashboard.
- Job description paste-and-analyze screen.
- JSON report export.
- Human review workflow.
- Application analytics integration.

## SPR-017.4 Acceptance Criteria

- Rule-based baseline implemented.
- Fixtures pass validation matrix.
- Output schema generated successfully.
- No unsupported evidence recommended.
- No final resume generated.
- Human review remains mandatory.

