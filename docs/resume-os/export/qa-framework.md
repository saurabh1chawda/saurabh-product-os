# Export QA Framework

Last updated: 2026-07-17

## QA Categories

- Content mutation checks.
- Section and heading checks.
- Bullet preservation.
- Metric and date preservation.
- Link preservation.
- ATS formatting checks.
- Pagination checks.
- Searchable PDF checks.
- Output-size and generation-time checks.

## Severity

- P0: content mutation, missing output, unsearchable PDF, broken structure, missing bullets.
- P1: page overflow, orphan heading, inconsistent spacing, missing optional link formatting.
- P2: visual polish improvement that does not affect ATS or factual integrity.

## Success Criteria

Export is successful only when:

- No P0 defects exist.
- Content fingerprint is unchanged.
- DOCX and PDF are generated.
- PDF text is searchable.
- Hyperlink text is preserved.
- Page count is acceptable.

