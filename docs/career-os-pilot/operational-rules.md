# Career OS Pilot Operational Rules

## Naming Standards

Use the naming conventions defined in [workspace-standards.md](workspace-standards.md). Core IDs:

- Application ID: `APP-YYYY-NNN`
- JD Snapshot ID: `JD-YYYY-NNN`
- Resume ID: `RESUME-YYYY-NNN`
- Export ID: `EXPORT-YYYY-NNN`

## Required Metadata

Every operational artifact should include:

- Artifact ID.
- Related Application ID when available.
- Related JD Snapshot ID when available.
- Related Resume ID when available.
- Date.
- Owner.
- Privacy classification.
- Status.
- Source or evidence references.

## Versioning

- Version material artifacts when wording, evidence, or decision state changes.
- Do not reuse Resume IDs for materially different wording.
- Do not reuse JD Snapshot IDs for materially changed postings.
- Keep DOCX and PDF exports for the same wording under the same Export ID.

## Traceability

Every submitted application must connect:

```text
Opportunity -> Qualification -> JD Snapshot -> JD Intelligence -> Resume Strategy -> Resume Assembly -> Submission -> Registry -> Outcome -> Knowledge Capture
```

Missing traceability is a pilot defect.

## Document Ownership

- Product Owner: Saurabh Chawda.
- Product/Architecture Advisor: ChatGPT.
- Implementation Engineer: Codex.
- Automated quality gate: Career OS validation framework.

The Product Owner is the acceptance authority for external actions and policy decisions.

## Evidence Standards

Evidence must be labelled as:

- Observed fact.
- User-entered fact.
- Employer-provided outcome.
- Derived deterministic metric.
- User interpretation.
- Hypothesis.

Hypotheses must not be presented as facts.

## Review Frequency

- Per-application review after each submitted application.
- Daily operations review on active search days.
- Weekly pilot review.
- Five-application review gate.
- Final pilot review.

## Approval Rules

- External actions require human approval.
- Resume submission requires QA approval.
- Architecture changes require product and architecture review.
- Pilot corrections require validation before release.
- Privacy exceptions require Product Owner approval.

## Document Lifecycle

| State | Meaning |
| --- | --- |
| Draft | Artifact is incomplete or under review. |
| Ready | Artifact is complete enough for workflow use. |
| Approved | Product Owner has accepted the artifact. |
| Superseded | A newer artifact replaces it. |
| Archived | Artifact is retained for history but no longer active. |

## Archive Policy

- Archive only public-safe summaries or anonymized artifacts.
- Do not archive raw private application data into public documentation.
- Use `docs/career-os-pilot/pilot-workspace/archive/` for pilot-level archive summaries.
- Retain source-of-truth links where safe.

