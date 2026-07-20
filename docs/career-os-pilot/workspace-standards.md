# Career OS Pilot Workspace Standards

## Purpose

This document defines naming and organization standards for Career OS pilot artifacts. The goal is to make real-world pilot work traceable without adding runtime complexity or changing existing schemas.

## Directory Naming

- Use lowercase words separated by hyphens.
- Use plural nouns for folders that contain multiple artifacts.
- Keep pilot-level operational folders under `docs/career-os-pilot/pilot-workspace/`.
- Keep module-specific outputs in their existing module folders.

Examples:

- `docs/career-os-pilot/pilot-workspace/reports/`
- `docs/career-os-pilot/pilot-workspace/validation-outputs/`
- `docs/resume-os/pilots/<company-slug>/`

## File Naming

- Use lowercase words separated by hyphens for Markdown and report files.
- Use uppercase IDs only inside record IDs, not ordinary filenames.
- Include a date when the artifact is time-bound.
- Use a company slug only when the file relates to one company.

Examples:

- `pilot-review-2026-08-01.md`
- `five-application-review.md`
- `privacy-review-2026-08-01.md`

## Date Format

Use ISO date format:

```text
YYYY-MM-DD
```

Examples:

- `2026-07-20`
- `2026-08-01`

## Application IDs

Use:

```text
APP-YYYY-NNN
```

Example:

```text
APP-2026-001
```

Rules:

- `YYYY` is the year the application is submitted.
- `NNN` is a three-digit sequence number.
- Do not reuse an ID after withdrawal, rejection, or deletion of a draft record.

## JD Snapshot IDs

Use:

```text
JD-YYYY-NNN
```

Example:

```text
JD-2026-001
```

Rules:

- A JD Snapshot must be stable and local.
- A live URL alone is not a JD Snapshot.
- If the posting changes materially, create a new JD Snapshot ID.

## Resume IDs

Use:

```text
RESUME-YYYY-NNN
```

Example:

```text
RESUME-2026-001
```

Rules:

- A Resume ID identifies the resume version used or prepared for an application.
- Do not reuse a Resume ID for materially different wording.
- Minor export-format changes may share the same Resume ID if wording is unchanged.

## Artifact Naming

Use:

```text
<artifact-type>-<company-slug>-<role-slug>-YYYY-MM-DD.md
```

Example:

```text
jd-review-example-ai-pm-2026-07-20.md
```

Common artifact types:

- `jd-review`
- `resume-plan`
- `manual-override-log`
- `application-review`
- `pilot-observation`

## Export Naming

Use:

```text
EXPORT-YYYY-NNN-<company-slug>-<role-slug>.<ext>
```

Examples:

```text
EXPORT-2026-001-example-ai-pm.docx
EXPORT-2026-001-example-ai-pm.pdf
```

Rules:

- Export IDs should map to the Resume ID and Application ID in the application record.
- DOCX and PDF exports for the same resume should share the same export ID.
- Sensitive exports must remain private and must not be committed.

## Archive Naming

Use:

```text
archive-YYYY-MM-DD-<topic>.md
```

Example:

```text
archive-2026-09-15-pilot-closeout.md
```

Rules:

- Archive files should summarize what moved, why it moved, and where the retained source of truth lives.
- Do not archive private application data into public documentation.

## Temporary Files

Use:

```text
tmp-<purpose>-YYYY-MM-DD.<ext>
```

Rules:

- Temporary files must stay local.
- Temporary files should not be committed.
- Temporary files should be deleted or promoted to a governed artifact during weekly review.

## Generated Reports

Use:

```text
<system>-validation-YYYY-MM-DD.json
<system>-validation-YYYY-MM-DD.md
```

Examples:

```text
registry-validation-2026-07-20.json
privacy-validation-2026-07-20.md
console-validation-2026-07-20.md
```

Rules:

- Generated reports should identify the command used.
- Public reports must not include private application data.
- Private reports belong outside committed public docs unless anonymized.

## Screenshots

Use:

```text
screen-YYYY-MM-DD-<surface>-<viewport>.png
```

Examples:

```text
screen-2026-07-20-operations-desktop.png
screen-2026-07-20-application-detail-mobile.png
```

Rules:

- Screenshots containing real company, recruiter, compensation, interview, or application details are private by default.
- Public screenshots must use synthetic or anonymized data.

## Validation Outputs

Use:

```text
validation-YYYY-MM-DD-<system>.<ext>
```

Examples:

```text
validation-2026-07-20-privacy.json
validation-2026-07-20-registry.md
```

Rules:

- Validation outputs should be linked from pilot reviews when relevant.
- Validation outputs containing private data must remain local-first and uncommitted.

