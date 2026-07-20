# Career OS Pilot Workflow Traceability

## Purpose

Workflow traceability ensures every submitted application can be audited from initial opportunity through final pilot learning.

## End-to-End Trace

```text
Opportunity
  -> Qualification
  -> JD Snapshot
  -> JD Intelligence
  -> Resume Strategy
  -> Resume Assembly
  -> Submission
  -> Registry
  -> Interview
  -> Knowledge
  -> Pilot Report
```

## Input / Output Relationships

| Stage | Inputs | Outputs | Traceability Link |
| --- | --- | --- | --- |
| Opportunity | Source URL, role title, company, initial fit | Opportunity intake | Opportunity ID or source note |
| Qualification | Opportunity intake, pilot scope, duplicate check | Qualification decision | Gate 1 decision |
| JD Snapshot | Qualified opportunity, live posting, capture date | JD Snapshot | JD Snapshot ID |
| JD Intelligence | JD Snapshot, Resume OS evidence | JD Intelligence report | JD Snapshot ID and analysis output |
| Resume Strategy | JD Intelligence, evidence map, role archetype | Strategy artifact | Resume ID candidate and selected evidence |
| Resume Assembly | Strategy, components, bullets, evidence | Draft resume, assembly plan, evidence map | Resume ID and evidence map |
| QA Review | Draft, evidence map, JD Intelligence | QA approval or revision | Gate 3 decision |
| Submission | Approved export, portal/source channel | Submission artifact | Application ID and Export ID |
| Registry | Submission artifact, JD ID, Resume ID | Application record and lifecycle event | Application ID |
| Recruiter Interaction | Explicit response, contact reference | Interaction log and next action | Contact ID and Application ID |
| Interview | Invitation, stage, schedule | Interview log and preparation task | Application event |
| Post Interview Review | Interview log, outcome if available | Review notes and next action | Application event and observation |
| Offer / Rejection | Explicit employer outcome | Outcome update | Terminal event or offer event |
| Knowledge Capture | Metrics, friction, defects, outcomes | Pilot observation or decision-log entry | Observation ID or decision ID |
| Pilot Reporting | Registry metrics, observations, decisions | Weekly/final report | Report ID |

## Required Traceability Chain

Every submitted application must include:

- Application ID.
- JD Snapshot ID.
- Resume ID.
- Export ID where exported.
- Submission date.
- Source/channel.
- Current stage and status.
- Next action or valid waiting state.
- Lifecycle events.
- Outcome when explicitly received.

## Broken Traceability

Broken traceability occurs when:

- A submitted application lacks a JD Snapshot.
- A submitted application lacks a Resume Snapshot.
- A lifecycle stage changes without an event.
- A response is recorded without a date or source.
- A terminal outcome is inferred from silence.
- A pilot report contains rates without denominators.

Broken traceability must be treated as a pilot defect.

