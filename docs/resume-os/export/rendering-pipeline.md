# Rendering Pipeline

Last updated: 2026-07-17

## Pipeline

1. Load approved draft JSON.
2. Normalize into an internal render model.
3. Create a source fingerprint containing headings, bullets, dates, metrics, links, and evidence IDs.
4. Render DOCX blocks.
5. Render PDF blocks.
6. Write metadata report.
7. Run export QA.
8. Compare output metadata against the source fingerprint.
9. Fail on any renderer-induced mutation.

## Component Mapping

| Resume Component | DOCX Block | PDF Block | Mutation Allowed |
| --- | --- | --- | --- |
| Header | Paragraph | Text line | No |
| Headline | Heading paragraph | Text line | No |
| Summary | Paragraph | Wrapped text | No |
| Experience role | Heading paragraph | Text line | No |
| Bullet | Numbering paragraph | Bullet text line | No |
| Project | Paragraph | Text block | No |
| Product OS module | Paragraph with link | Text block with link | No |
| Skills | Paragraph | Wrapped text | No |
| Credentials | Paragraphs | Wrapped text | No |

## Determinism

Rendering is deterministic by design:

- Stable file names.
- Stable section order.
- Stable typography.
- Stable generated reports.
- No timestamp-driven content inside resume bodies.

