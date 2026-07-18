# Privacy and Security

Last updated: 2026-07-18

## Non-Negotiables

- No passwords.
- No authentication tokens.
- No confidential interview questions.
- No private recruiter notes in public fixtures.
- No private application records committed to Git.
- No resume content duplicated inside application records.

## Safeguards

- Private storage path is ignored by Git.
- Fixtures are synthetic and marked `safe_to_commit: true`.
- Privacy validation scans public fixtures and registry records for credential-like patterns.
- Commands print storage context and do not use external services.

