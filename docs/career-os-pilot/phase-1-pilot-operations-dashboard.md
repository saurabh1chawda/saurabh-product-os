# Career OS Phase 1 Pilot Operations Dashboard

## Purpose

This dashboard is the operational command center for the Phase 1 controlled live pilot. It is used to monitor, execute, and review pilot activity across five live applications.

This is an operational dashboard, not a retrospective report. It should stay current enough to answer: what should happen next?

Related operating references:

- [Phase 1 Live Pilot Charter](phase-1-live-pilot-charter.md)
- [Phase 1 Live Pilot Runbook](phase-1-live-pilot-runbook.md)
- [Pilot Workflow](pilot-workflow.md)
- [Decision Gates](decision-gates.md)
- [Pilot Improvement Backlog](pilot-improvement-backlog.md)

## Status Legend

| Status | Meaning |
| --- | --- |
| Green | Healthy; no action required. |
| Yellow | Watch item; action may be needed soon. |
| Red | Blocked or at risk; action required. |
| Grey | Not started or not yet measurable. |

## Executive Command Center

| Field | Current | Notes |
| --- | --- | --- |
| Current Pilot Status | Grey | Not started. |
| Current Phase | Phase 1 - Controlled Live Pilot | Stable operating baseline. |
| Applications Started | 0 / 5 | Count only real pilot applications. |
| Applications Submitted | 0 / 5 | Count only manually submitted applications. |
| Recruiter Responses | 0 | Count explicit employer responses only. |
| Interviews | 0 | Count substantive interviews only. |
| Offers | 0 | Count explicit offers only. |
| Average Cycle Time | Not available | Measure after submitted applications exist. |
| Current Active Application | None | Update when application workflow starts. |
| Open Risks | 0 | See Risk Register. |
| Open Issues | 0 | See Issue Register. |
| Open Observations | 0 | See pilot observations. |
| Open Backlog Items | 0 | See improvement backlog. |
| Overall Health | Grey | Not started. |
| Today's Priority | Initialize first qualified application. | Update daily. |
| Action Required | Select Application #1 opportunity. | Update daily. |

## Application Pipeline

| Application ID | Company | Role | Current Stage | Current Status | Days in Stage | Priority | Owner | Next Action | Blocker | Last Updated |
| --- | --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- |
| Not started | Not started | Not started | Opportunity | Not started | 0 | Not set | Saurabh Chawda | Select qualified opportunity | None | Not started |

Use one row per live pilot application. Do not add synthetic or draft applications to this table.

## Operational Metrics

### Throughput

| Metric | Current | Target | Trend | Status |
| --- | ---: | ---: | --- | --- |
| Applications started | 0 | 5 | Not available | Grey |
| Applications submitted | 0 | 5 | Not available | Grey |
| Applications with complete workflow | 0 | 5 | Not available | Grey |
| Median registry administration time | Not available | Below 10 minutes | Not available | Grey |
| Average submission cycle time | Not available | Baseline captured | Not available | Grey |

### Quality

| Metric | Current | Target | Trend | Status |
| --- | ---: | ---: | --- | --- |
| Decision gate completion | 0 / 0 | 100% | Not available | Grey |
| Traceability coverage | 0 / 0 | 100% | Not available | Grey |
| Evidence completeness | 0 / 0 | 100% | Not available | Grey |
| QA pass rate | Not available | No unresolved P0/P1 QA issues | Not available | Grey |
| Privacy validation | Not run | Clean | Not available | Grey |

### Outcome

| Metric | Current | Target | Trend | Status |
| --- | ---: | --- | --- | --- |
| Explicit employer response rate | Not available | Directional | Not available | Grey |
| Recruiter screen rate | Not available | Directional | Not available | Grey |
| Interview rate | Not available | Directional | Not available | Grey |
| Offer rate | Not available | Directional | Not available | Grey |

All outcome rates must display sample size and remain directional during Phase 1.

### Learning

| Metric | Current | Target | Trend | Status |
| --- | ---: | ---: | --- | --- |
| Pilot observations completed | 0 / 5 | 5 / 5 | Not available | Grey |
| Material findings captured | 0 | All material findings | Not available | Grey |
| Backlog items reviewed | 0 | Weekly | Not available | Grey |
| Retrospective status | Not started | Complete | Not available | Grey |

## Operational Health

| Area | Status | Evidence | Action |
| --- | --- | --- | --- |
| Repository | Green | Clean baseline expected before use. | Check status before and after active work. |
| Workflow | Green | Approved pilot workflow exists. | Follow runbook without skipping stages. |
| Templates | Green | Operational templates exist. | Use templates in workflow order. |
| Decision Gates | Green | Six gates documented. | Record each gate outcome. |
| Privacy | Green | Privacy governance exists. | Review before commits, sharing, and screenshots. |
| Metrics | Yellow | Definitions exist; no live data yet. | Capture timestamps and denominators. |
| Traceability | Green | Traceability model exists. | Verify IDs at every handoff. |
| Backlog | Green | Improvement backlog exists. | Add findings only with evidence. |
| Overall Pilot | Grey | Not started. | Begin Application #1. |

## Risk Register

| Risk | Likelihood | Impact | Owner | Status | Mitigation | Review Date |
| --- | --- | --- | --- | --- | --- | --- |
| Workflow feels too heavy during live use. | Medium | Medium | Saurabh Chawda | Open | Record friction; do not redesign during execution. | Weekly |
| Private data is accidentally staged or committed. | Low | High | Saurabh Chawda | Open | Run privacy and repository checks before commit. | Every commit |
| Decision gates skipped under time pressure. | Medium | High | Saurabh Chawda | Open | Use runbook and stop if a gate is missed. | Per application |
| Traceability breaks between JD, resume, and registry. | Medium | High | Saurabh Chawda | Open | Verify IDs during registry update. | Per application |
| Time-based metrics are incomplete. | Medium | Medium | Saurabh Chawda | Open | Capture timing notes during each stage. | Daily wrap-up |

## Issue Register

| Issue | Impact | Owner | Status | Mitigation | Review Date |
| --- | --- | --- | --- | --- | --- |
| None currently open. | Not applicable | Saurabh Chawda | Closed | Not applicable | Not applicable |

Issues are active problems that have occurred. Risks are potential problems that may occur.

## Decision Snapshot

| Decision Needed | Evidence Required | Owner | Due | Status |
| --- | --- | --- | --- | --- |
| Select Application #1 opportunity. | Opportunity source, qualification fit, duplicate check. | Saurabh Chawda | Before pilot start | Open |

This section summarizes active decisions only. Historical decisions belong in the decision log.

## Daily Operations Panel

### Today's Priorities

- [ ] Select or continue current active application.
- [ ] Complete next workflow stage.
- [ ] Resolve blockers before advancing.
- [ ] Update dashboard after material state changes.

### Applications Awaiting Action

| Application ID | Stage | Action | Due |
| --- | --- | --- | --- |
| None | Not started | Select Application #1 opportunity | Before pilot start |

### Upcoming Decision Gates

| Gate | Application ID | Required Evidence | Status |
| --- | --- | --- | --- |
| Gate 1 | Not started | Opportunity intake and qualification | Pending |

### Metrics Missing

- [ ] Application start count.
- [ ] Submission count.
- [ ] Stage timestamps.
- [ ] Decision gate completion.
- [ ] Traceability coverage.

### Evidence Missing

- [ ] Application #1 opportunity source.
- [ ] Application #1 qualification artifact.
- [ ] Application #1 JD Snapshot.

### Repository Check

- [ ] Working tree reviewed.
- [ ] Private data not staged.
- [ ] Only approved documentation changes staged when committing.

### Definition of Success Today

Today's work is successful if the current application advances by one complete workflow stage without skipped gates, broken traceability, or privacy risk.

## Dashboard Maintenance

### Update Cadence

- Before starting active pilot work.
- After every stage transition.
- After every decision gate.
- After application submission.
- After employer response.
- After interview scheduling or completion.
- During daily wrap-up.
- During weekly review.
- During final retrospective.

### Update Triggers

- New application started.
- Application submitted.
- Stage changes.
- Status changes.
- Next action changes.
- Blocker appears or clears.
- New risk or issue appears.
- Observation is recorded.
- Backlog item is added.
- Metric changes.

### Ownership

Saurabh Chawda owns dashboard updates. AI assistants may help review consistency but do not own pilot state or make external decisions.

### Stale Information

Information is stale if:

- `Last Updated` is older than the most recent application event.
- Next action is missing.
- Status does not match the registry.
- Metrics do not match the latest completed stage.
- A blocker is resolved but still listed.
- An application is open without a valid waiting state.

## Usage Guide

1. Start each active pilot day at the Executive Command Center.
2. Review Today's Priority and Action Required.
3. Check the Application Pipeline for the active application.
4. Complete only the next workflow stage from the runbook.
5. Record decision gates immediately after they occur.
6. Update metrics only when evidence exists.
7. Add risks before they become issues.
8. Add issues only when the problem has occurred.
9. Add backlog items only when supported by observed evidence.
10. End each day with the Daily Operations Panel and Repository Check.

Do not use this dashboard as a substitute for the Application Registry. The dashboard points to operational state; the registry remains the source of truth for application records.

