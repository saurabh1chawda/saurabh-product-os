# Career OS Pilot Workflow Diagram

## ASCII Workflow

```text
[Opportunity]
      |
      v
[Gate 1: Proceed / Reject Opportunity]
      |
      v
[Qualification]
      |
      v
[JD Snapshot] --> [JD Snapshot Artifact]
      |
      v
[JD Intelligence] --> [JD Intelligence Report]
      |
      v
[Gate 2: Proceed with Resume Generation]
      |
      v
[Resume Strategy] --> [Resume Strategy Artifact]
      |
      v
[Resume Assembly] --> [Resume Draft + Evidence Map]
      |
      v
[Gate 3: QA Approval]
      | revise
      +-------> [Resume Strategy / Resume Assembly]
      |
      v
[Gate 4: Ready for Submission]
      |
      v
[Application Submission] --> [Submission Artifact]
      |
      v
[Application Registry Update] --> [Application Record + Lifecycle Event]
      |
      v
[Recruiter Interaction] --> [Interaction Log]
      |
      v
[Interview Tracking] --> [Interview Log]
      |
      v
[Gate 5: Interview Complete]
      |
      v
[Post Interview Review] --> [Pilot Observation]
      |
      v
[Offer / Rejection] --> [Outcome Update]
      |
      v
[Knowledge Capture] --> [Decision Log Entry when needed]
      |
      v
[Gate 6: Pilot Learning Captured]
      |
      v
[Pilot Reporting] --> [Weekly / Final Pilot Report]
```

## Stage Relationships

- Qualification depends on Opportunity.
- JD Intelligence depends on JD Snapshot.
- Resume Strategy depends on JD Intelligence.
- Resume Assembly depends on Resume Strategy.
- Application Submission depends on QA approval.
- Registry Update depends on submission details and artifact traceability.
- Pilot Reporting depends on registry metrics, observations, and decision logs.

## Decision Points

- Gate 1: Proceed / Reject Opportunity.
- Gate 2: Proceed with Resume Generation.
- Gate 3: QA Approval.
- Gate 4: Ready for Submission.
- Gate 5: Interview Complete.
- Gate 6: Pilot Learning Captured.

## Artifact Generation

- Opportunity creates opportunity intake.
- Qualification creates qualification decision.
- JD Snapshot creates JD artifact.
- JD Intelligence creates analysis report.
- Resume Strategy creates positioning plan.
- Resume Assembly creates draft and evidence map.
- QA Review creates approval or revision notes.
- Submission creates submission record.
- Registry creates lifecycle event.
- Interview creates interview log.
- Knowledge Capture creates observation or decision-log entry.
- Pilot Reporting creates weekly or final reports.

## Feedback Loops

- QA Review can return to Resume Strategy or Resume Assembly.
- Interview Tracking can return to Recruiter Interaction when scheduling changes.
- Knowledge Capture can create Pilot Corrections or Deferred Enhancements.
- Pilot Reporting can update future Opportunity qualification criteria.

## Escalation Paths

- Privacy issue: STOP and follow privacy incident response.
- Broken traceability: REVISE before reporting.
- Unsupported resume claim: return to Resume Strategy or reject application.
- Runtime defect: classify severity through pilot governance.
- Data corruption: treat as P0.

## Knowledge Capture Loop

```text
Observation -> Metrics -> Decision Log -> Roadmap -> Future Workflow Improvement
```

Knowledge capture is complete only when learning is evidence-based, privacy-safe, and connected to a future action or explicit no-change decision.

