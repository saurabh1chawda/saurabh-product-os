# Career OS Pilot Template Validation

## Purpose

This document validates the operational templates in `docs/career-os-pilot/operational-templates/` using the synthetic ORR rehearsal.

## Evaluation Summary

| Template | Purpose | Ease of Use | Missing Fields | Duplicate Fields | Field Clarity | Evidence Requirements | Completion Effort | Recommendations |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `01-opportunity-intake.md` | Clear | High | None material | Low | Clear | Sufficient | Low | Keep as-is. |
| `02-qualification.md` | Clear | High | None material | Low | Clear | Sufficient | Low | Keep as-is. |
| `03-jd-snapshot.md` | Clear | Medium | Storage privacy classification could be explicit | Medium | Clear | Sufficient | Medium | Observe whether operators need a path picker or stronger storage examples. |
| `04-jd-intelligence.md` | Clear | Medium | No explicit validation command field | Low | Clear | Strong | Medium | Consider adding validation result reference later if repeated friction appears. |
| `05-resume-strategy.md` | Clear | Medium | None material | Medium | Clear | Strong | Medium | Keep; watch for overlap with assembly plan. |
| `06-resume-assembly-plan.md` | Clear | Medium | No explicit narrative review handoff field | Medium | Clear | Strong | Medium | Defer unless live pilot shows handoff ambiguity. |
| `07-qa-checklist.md` | Clear | Medium | None material | Medium | Clear | Strong | Medium-high | Time-consuming but appropriate for first pilot. |
| `08-application-submission.md` | Clear | High | None material | Low | Clear | Sufficient | Low | Keep as-is. |
| `09-registry-update.md` | Clear | Medium | None material | Medium | Clear | Strong | Medium | Watch for duplicate artifact IDs across submission and registry. |
| `10-recruiter-interaction-log.md` | Clear | High | None material | Low | Clear | Sufficient | Low | Keep as-is. |
| `11-interview-log.md` | Clear | High | None material | Low | Clear | Sufficient | Low | Keep as-is. |
| `12-weekly-review.md` | Clear | Medium | None material | Low | Clear | Strong | Medium | Useful at cadence, not per application. |
| `13-pilot-observation.md` | Clear | High | None material | Low | Clear | Strong | Low | Keep as-is. |
| `14-decision-log-entry.md` | Clear | Medium | None material | Low | Clear | Strong | Medium | Use only for significant decisions. |
| `15-postmortem.md` | Clear | Medium | None material | Low | Clear | Strong | Medium | Keep for P0/P1/P2 events. |
| `16-final-pilot-report.md` | Clear | Medium | None material | Low | Clear | Strong | Medium-high | Good final roll-up; avoid premature use. |

## Cross-Template Findings

- The template set supports a complete end-to-end rehearsal.
- Required fields are generally clear and measurable.
- Completion checklists make stage exits concrete.
- Evidence sections reinforce privacy-safe traceability.
- Several templates repeat company, role, JD ID, resume ID, and application ID. This is acceptable for auditability but creates manual copy risk.

## Recommendations

- Do not change template structure before the first live pilot cohort.
- Observe whether stage timing should become a standard field across all templates.
- Observe whether `03-jd-snapshot.md` needs clearer private storage examples.
- Observe whether `05-resume-strategy.md` and `06-resume-assembly-plan.md` overlap in live operation.

## Validation Decision

PASS WITH OBSERVATIONS

