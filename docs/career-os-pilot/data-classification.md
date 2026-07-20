# Career OS Pilot Data Classification

## Purpose

This document defines how Career OS pilot data should be classified, stored, retained, and handled in Git.

## Classification Categories

| Category | Description | Examples | Storage Location | Git Policy | Retention Guidance |
| --- | --- | --- | --- | --- | --- |
| Public | Information safe to publish or commit. | Governance docs, release docs, public README files, public Product OS links. | `docs/`, `README.md`, public content folders. | May be committed. | Retain as normal repository documentation. |
| Internal | Non-sensitive working knowledge that helps operate Career OS but should not be presented as public product evidence without review. | Workspace standards, pilot operating procedures, anonymized review summaries. | `docs/career-os-pilot/`. | May be committed after review. | Retain while useful; archive when superseded. |
| Pilot Operational | Pilot process data that may be public-safe if anonymized but can become sensitive when tied to real applications. | Weekly review summaries, defect summaries, friction logs, validation summaries. | `docs/career-os-pilot/pilot-workspace/` for public-safe summaries; ignored private folders for sensitive versions. | Commit only if anonymized and reviewed. | Retain summaries; delete or archive raw notes after final review. |
| Confidential | Real job-search information that should remain local-first. | Real application URLs, recruiter notes, interview notes, employer outcomes, company-specific strategy notes. | `data/private/` or ignored `private/` folders. | Must not be committed. | Retain only as long as operationally necessary. |
| Sensitive Personal Data | Personal or highly sensitive data about Saurabh, recruiters, interviewers, or employers. | Resumes with contact details, recruiter email addresses, compensation, offer details, raw email content, phone numbers, private screenshots. | Local private storage outside committed paths or ignored private folders. | Must not be committed. | Minimize retention; delete when no longer needed. |

## Handling Rules

- Classify data before creating the file.
- If classification is uncertain, treat the file as Sensitive Personal Data.
- Do not store raw email content unless strictly necessary.
- Do not store confidential interview content.
- Do not infer rejection reasons or application outcomes.
- Do not publish screenshots unless they use synthetic or anonymized data.
- Do not commit real resume exports.
- Do not commit private validation outputs.

## Storage Rules

Preferred private storage:

- `data/private/`
- `docs/career-os-pilot/pilot-workspace/**/private/`
- local files with `.local.*`, `.private.*`, or `*-private.*` naming.

Preferred public-safe storage:

- `docs/career-os-pilot/`
- `docs/career-os-pilot/pilot-workspace/reports/`
- `docs/career-os-pilot/pilot-workspace/templates/`
- existing synthetic fixture locations.

## Git Review Rules

Before staging a file, ask:

- Does it contain real company, recruiter, compensation, interview, application, or resume data?
- Was it generated from real pilot data?
- Does it include screenshots or exports?
- Could it identify a specific job application?
- Could it expose private contact details?

If any answer is yes, do not commit unless the file is anonymized and explicitly approved.

