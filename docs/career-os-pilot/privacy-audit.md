# Career OS Pilot Privacy Audit

## Executive Summary

Career OS is ready for controlled real-world pilot use only if real application data remains private, local-first, and outside committed repository history. The repository already separates public documentation, synthetic fixtures, and private data, but the previous `.gitignore` coverage was too narrow for the pilot stage.

This audit strengthens the privacy boundary by documenting the data model and expanding `.gitignore` coverage for private Career OS artifacts, local exports, screenshots, drafts, logs, temporary files, and local JSON/CSV/DOCX/PDF outputs.

## Scope

This audit covers:

- Repository privacy boundaries.
- `.gitignore` coverage.
- Sensitive data storage strategy.
- Synthetic vs real data separation.
- Generated artifacts.
- Reports.
- Exports.
- Screenshots.
- Logs.
- Validation outputs.
- Temporary files.
- Future automation outputs.

This audit does not change runtime code, schemas, UI, validation logic, or business logic.

## Audit Methodology

The audit reviewed:

- Current `.gitignore` entries.
- Pilot governance documents under `docs/career-os-pilot/`.
- Application Registry fixture and report locations.
- Resume OS generated-output and export locations.
- Application Intelligence report locations.
- Pilot workspace structure under `docs/career-os-pilot/pilot-workspace/`.
- Existing privacy validation command output.

The audit looked for whether real-world application data could be accidentally staged or committed once the pilot begins.

## Repository Privacy Model

Career OS uses five privacy zones:

1. Public product documentation.
2. Public-safe synthetic fixtures.
3. Generated outputs safe for committed test fixtures.
4. Pilot operational documentation.
5. Private local pilot data.

Only zones 1-4 may be committed when they contain no real private data. Zone 5 must remain local-first and uncommitted.

## Public Content

Public content includes:

- Governance documents.
- Architecture documents.
- Release documents.
- Synthetic examples.
- Public Product OS content.
- Public-safe README files.

Public content may be committed when it contains no real recruiter, compensation, application, interview, or private company data.

## Private Content

Private content includes:

- Real application records.
- Real recruiter names, emails, notes, and relationship context.
- Real company application URLs when tied to a private application.
- Real resumes and company-specific resume drafts.
- Interview notes, interview preparation, and interview outcomes.
- Compensation, offer details, and negotiation notes.
- Raw email content.
- Non-anonymized screenshots.
- Local exports containing private data.

Private content must remain local-first and uncommitted.

## Synthetic Content

Synthetic content includes:

- Public-safe Application Registry fixtures.
- Synthetic Application Intelligence data.
- Test fixtures.
- Example records clearly marked as synthetic.

Synthetic content may be committed when it cannot be mistaken for real application data.

## Generated Content

Generated content may be public or private depending on its source data.

Generated content is public-safe only when it is produced from synthetic fixtures or anonymized inputs. Generated content from real pilot data is private by default, including DOCX, PDF, JSON, CSV, screenshots, reports, logs, and validation outputs.

## Operational Content

Operational content includes:

- Pilot observations.
- Weekly reviews.
- Five-application review notes.
- Privacy reviews.
- Defect summaries.
- Validation summaries.

Operational content may be committed only when private data has been removed or anonymized.

## Risk Assessment

| Risk | Severity | Assessment | Mitigation |
| --- | --- | --- | --- |
| Real application records committed | P0 | High impact if private data is staged. | Expanded `.gitignore`; require pre-commit privacy review. |
| Resume DOCX/PDF committed | P0 | Real resumes can expose personal and company-specific information. | Ignore local exports and private artifact folders. |
| Recruiter notes committed | P0 | Personal recruiter data is sensitive. | Store only local-first; do not store raw email content. |
| Screenshots with private data committed | P0 | Screenshots can leak recruiter/company/outcome data. | Use private screenshot folders and anonymize before commit. |
| Synthetic and real data confused | P1 | Metrics and privacy can be compromised. | Keep synthetic fixtures separate and clearly labelled. |
| Generated reports include private fields | P1 | Reports may look harmless but carry sensitive data. | Treat real-data reports as private by default. |
| Temporary files staged accidentally | P2 | Temp files may bypass normal review. | Ignore `tmp/`, `temp/`, and local file suffixes. |
| Future automation outputs leak data | P1 | Automation can generate files faster than humans review. | Require automation outputs to default to private paths. |

## Recommendations

- Keep real pilot data under ignored private locations.
- Use `data/private/` for local-first private records.
- Use `docs/career-os-pilot/pilot-workspace/**/private/` for private pilot workspace material.
- Use `.local.*`, `.private.*`, or `*-private.*` suffixes for sensitive local files.
- Do not commit real DOCX, PDF, CSV, JSON, screenshots, logs, or validation outputs unless anonymized.
- Run privacy validation before every commit.
- Run `git status --short` and inspect every staged file before committing.
- Treat screenshots as private by default.
- Treat generated reports from real data as private by default.
- Document any privacy exception in the pilot decision log.

## Overall Verdict

GO with strengthened `.gitignore` coverage and mandatory operator discipline. The repository is suitable for controlled pilot use only if real pilot data remains in ignored private paths and all commits go through privacy review.

