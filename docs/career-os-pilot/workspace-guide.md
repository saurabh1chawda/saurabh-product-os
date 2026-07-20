# Career OS Pilot Workspace Guide

## Purpose

The Career OS Pilot Workspace provides a clear home for pilot-level artifacts that do not belong inside a single module. It keeps pilot operations organized while preserving the existing module architecture.

## Workspace Layout

```text
docs/career-os-pilot/
├── workspace-review.md
├── workspace-standards.md
├── workspace-guide.md
└── pilot-workspace/
    ├── artifacts/
    ├── archive/
    ├── logs/
    ├── reports/
    ├── screenshots/
    ├── templates/
    └── validation-outputs/
```

## Private vs Public Content

Public-safe content may be committed when it is synthetic, anonymized, or purely governance-oriented.

Private content must remain local-first and uncommitted by default. Private content includes:

- Real application records.
- Real company application URLs.
- Recruiter names or contact details.
- Compensation details.
- Interview notes or interview questions.
- Raw email content.
- Employer-provided confidential information.
- Non-anonymized outcomes or notes.

When in doubt, treat pilot material as private.

## Where Every Artifact Belongs

| Artifact | Location |
| --- | --- |
| Pilot governance docs | `docs/career-os-pilot/` |
| Pilot-level operating artifacts | `docs/career-os-pilot/pilot-workspace/artifacts/` |
| Pilot-level logs | `docs/career-os-pilot/pilot-workspace/logs/` |
| Pilot-level reports | `docs/career-os-pilot/pilot-workspace/reports/` |
| Pilot screenshots | `docs/career-os-pilot/pilot-workspace/screenshots/` |
| Reusable pilot templates | `docs/career-os-pilot/pilot-workspace/templates/` |
| Validation snapshots | `docs/career-os-pilot/pilot-workspace/validation-outputs/` |
| Archived pilot summaries | `docs/career-os-pilot/pilot-workspace/archive/` |
| Resume OS generated artifacts | Existing `docs/resume-os/` locations |
| Application Registry outputs | Existing `docs/application-registry/` locations |
| Application Intelligence outputs | Existing `docs/application-intelligence/` locations |
| Runtime app code | Existing `app/`, `components/`, `lib/`, `styles/` locations |
| Private pilot data | Local-first private storage, not committed |

## How to Archive Completed Pilot Material

Archive only governed summaries or anonymized aggregate artifacts.

Archive process:

1. Confirm the material is no longer active.
2. Remove or anonymize private data.
3. Write a short archive summary.
4. Link to retained source-of-truth artifacts when safe.
5. Store the archive summary in `docs/career-os-pilot/pilot-workspace/archive/`.
6. Run privacy review before committing.

Do not archive private raw application records into public documentation.

## How Future Contributors Should Organize Files

- Keep runtime source files out of the pilot workspace.
- Keep schemas in their existing module folders.
- Keep validation commands in `scripts/`.
- Put pilot-wide docs in `docs/career-os-pilot/`.
- Put module-specific outputs in the module folder that owns them.
- Put cross-module pilot observations, reports, logs, and screenshots in `docs/career-os-pilot/pilot-workspace/`.
- Use the naming standards in [workspace-standards.md](workspace-standards.md).
- Avoid creating new folders until a recurring need is observed and approved.

