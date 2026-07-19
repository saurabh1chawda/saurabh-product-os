# Career OS Pilot Baseline

## Purpose

Freeze Career OS at a known, validated baseline before the first real-world pilot. This document defines what is included, what is out of scope, and how the pilot baseline should be protected.

## Pilot Goals

- Validate Career OS against real job-search operations.
- Confirm Resume OS remains factually grounded and traceable.
- Confirm Application Registry can track applications, contacts, tasks, and outcomes.
- Confirm Application Intelligence produces useful deterministic metrics.
- Confirm the Career Operations Console reduces cognitive load by surfacing next actions.
- Confirm private pilot data can be managed without leaking into committed public fixtures.

## Out-of-Scope

- Runtime feature changes.
- Schema changes.
- UI redesign.
- Business-logic changes.
- Resume generation for a new company.
- Application creation, updates, or deletion.
- Gmail, LinkedIn, Calendar, or notification integrations.
- Authentication, multi-user support, or cloud sync.
- AI recommendations.

## Success Criteria

- All validation gates pass.
- Real pilot data remains private.
- Console loads successfully.
- Console remains read-only.
- Registry and privacy validation remain clean.
- Resume artifacts remain traceable to canonical evidence.
- No P0 pilot-blocking defects are found.
- Pilot user can identify next actions without inspecting raw files.

## Freeze Policy

- Freeze commit: `d745d001b8429be8e2c2bdcee77471a14bcbf6f5`
- Freeze tag candidate: `career-os-v1.0.0-pilot`
- No runtime, schema, business-logic, or UI change is allowed after freeze unless a P0 pilot blocker is discovered.
- Documentation-only corrections may be made if they improve traceability without changing product behavior.
- Pilot data must not be committed unless explicitly sanitized and marked safe to commit.
- A patch baseline must be created for any pilot-blocking defect fix.

## Release Checklist

- [x] Build passes.
- [x] Typecheck passes.
- [x] Lint passes.
- [x] Privacy validation passes.
- [x] Registry validation passes.
- [x] Application Intelligence validation passes.
- [x] Console validation passes.
- [ ] Git working tree clean after release documentation is committed.

## Recommended Git Tag Commands

```bash
git tag -a career-os-v1.0.0-pilot -m "Career OS v1.0.0 Pilot Baseline"
git show career-os-v1.0.0-pilot
```
