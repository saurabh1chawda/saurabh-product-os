# Career OS Pilot Privacy Checklist

## Before Adding a File

- [ ] Classify the file using [data-classification.md](data-classification.md).
- [ ] Confirm whether it contains real application, recruiter, compensation, interview, resume, or outcome data.
- [ ] Confirm whether it was generated from real pilot data.
- [ ] Use a private ignored location if the file is sensitive.
- [ ] Use synthetic or anonymized examples for public docs.
- [ ] Avoid raw email content unless strictly necessary.
- [ ] Avoid confidential interview content entirely.

## Before Committing

- [ ] Run `git status --short`.
- [ ] Inspect every staged file.
- [ ] Confirm no private records are staged.
- [ ] Confirm no real resumes, DOCX/PDF exports, screenshots, logs, JSON/CSV exports, or drafts are staged.
- [ ] Run privacy validation.
- [ ] Run `git diff --check`.
- [ ] Confirm committed pilot reports are anonymized.
- [ ] Confirm no `.local.*`, `.private.*`, or `*-private.*` files are staged.

## Before Pushing

- [ ] Confirm the commit contains only intended files.
- [ ] Re-run `git status --short`.
- [ ] Review the latest commit diff.
- [ ] Confirm no private data appears in commit history.
- [ ] Confirm no Git tag points to a privacy-unsafe commit.

## Before Publishing

- [ ] Confirm the audience and destination.
- [ ] Remove real company, recruiter, compensation, and interview details.
- [ ] Convert detailed records to anonymized aggregate findings.
- [ ] Label small-sample findings as directional.
- [ ] Confirm public documentation contains no private application URLs.
- [ ] Confirm public screenshots use synthetic or anonymized data.

## Before Sharing Screenshots

- [ ] Confirm screenshots do not show real company names unless explicitly approved.
- [ ] Confirm no recruiter names, emails, messages, interview details, compensation, or application URLs are visible.
- [ ] Confirm no browser tabs, file paths, or local private folders expose sensitive context.
- [ ] Use synthetic data whenever possible.
- [ ] Store private screenshots in ignored private locations.

## Before Creating GitHub Releases

- [ ] Review all release notes for private data.
- [ ] Confirm attached assets are public-safe.
- [ ] Do not attach real resumes or pilot exports.
- [ ] Do not attach screenshots with private data.
- [ ] Confirm the release tag points to a privacy-safe commit.
- [ ] Confirm the release describes pilot findings directionally if sample size is small.

