# Career OS Pilot Operational Friction Log

## Purpose

This log records friction observed during the synthetic ORR rehearsal. It documents improvements for later prioritization without implementing them during validation.

## Friction Items

| ID | Severity | Category | Finding | Evidence | Impact |
| --- | --- | --- | --- | --- | --- |
| FRIC-001 | Medium | Duplicate work | Company, role, JD ID, resume ID, and application ID repeat across multiple templates. | Synthetic rehearsal required repeated ID copying. | Creates manual entry risk. |
| FRIC-002 | Medium | Timing | Time-based KPIs need start/end timestamps, but not every stage template has explicit timing fields. | Metrics validation for Resume Generation Time and Submission Cycle Time. | Could weaken efficiency measurement. |
| FRIC-003 | Low | Navigation | The pilot folder now contains many top-level documents. | Repository validation. | New operator may rely heavily on README. |
| FRIC-004 | Low | Template friction | QA Review is intentionally comprehensive and may be the slowest stage. | Template validation and Gate 3 validation. | Could extend application preparation time. |
| FRIC-005 | Low | Evidence storage | JD Snapshot storage location is governed generally but not prescribed in the template. | Template validation for `03-jd-snapshot.md`. | Operator must choose the right private or operational location. |
| FRIC-006 | Low | Gate ambiguity | Gate 6 depends on whether enough product learning has been captured. | Decision gate validation. | May require calibration after five applications. |

## Summary

No critical or high-severity friction was observed. Medium friction centers on repeated IDs and timestamp discipline. Low friction centers on navigation, QA effort, storage examples, and learning threshold calibration.

