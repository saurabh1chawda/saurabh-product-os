# Career OS Pilot Operating Procedures

## SOP 1 — Qualify an Opportunity

Minimum eligibility:

- Real role.
- Genuine willingness to interview.
- Suitable location and work mode.
- Sufficient JD information.
- Broadly relevant experience.
- Role not known to be closed.
- No duplicate application.

If an opportunity fails eligibility, do not enter it as a submitted application.

## SOP 2 — Capture the JD

Require:

- Stable local snapshot.
- Source URL.
- Capture date.
- Posting ID when available.
- Company and role identifiers.
- Version-safe filename.
- No reliance on live URL alone.

The JD Snapshot must support later review even if the live posting changes or disappears.

## SOP 3 — Run JD Intelligence

Validate:

- Archetype.
- Seniority.
- Mandatory requirements.
- Competencies.
- Keywords.
- Evidence gaps.

Do not continue to resume generation if JD Intelligence identifies a P0 qualification or evidence issue that cannot be honestly mitigated.

## SOP 4 — Generate and Review Resume

Use five review gates:

- Factual review.
- Relevance review.
- Human-writing review.
- ATS review.
- Recruiter first-impression review.

The resume must remain traceable to canonical evidence and must not invent metrics, titles, technologies, scope, or outcomes.

## SOP 5 — Record Manual Overrides

Required override fields:

- Section.
- Category.
- Reason.
- Change summary.
- Time spent.
- Reusable-learning flag.

Standard override taxonomy:

- Factual correction.
- Relevance improvement.
- Human-writing improvement.
- ATS formatting improvement.
- Recruiter first-impression improvement.
- Role-archetype positioning.
- Company-specific language.
- Evidence traceability.
- Export formatting.
- Other documented reason.

## SOP 6 — Create Application Record

Require:

- Dry run.
- Creation.
- Artifact linking.
- Current stage.
- Status.
- Priority.
- Tags.
- Next action or valid waiting state.

Do not create a real application record unless the opportunity is qualified and the Product Owner approves submission.

## SOP 7 — Submit Application

Require:

- Manual submission.
- Submission date.
- Source/channel.
- Confirmation where available.
- Stage transition.
- Follow-up task where appropriate.

Career OS records the submission; it does not submit applications automatically.

## SOP 8 — Update Recruiter Response

Require:

- Response date.
- Explicit stage transition.
- Contact reference.
- Next action.
- No unnecessary raw communication storage.

Only explicit employer responses count for response metrics.

## SOP 9 — Record Interview

Require:

- Interview stage.
- Scheduled date.
- Format.
- Preparation task.
- Completion event.
- Outcome status.
- No confidential interview-question storage.

Do not store confidential interview content or private employer materials.

## SOP 10 — Record Rejection

Require explicit rejection.

Prohibit rejection inference from silence. Silence may support a stale or waiting state, but it is not a rejection.

## SOP 11 — Record Withdrawal

Require:

- Withdrawal date.
- Stage at withdrawal.
- Reason.

Withdrawal reasons should be recorded as private by default.

## SOP 12 — Record Offer

Require private handling of:

- Compensation.
- Deadlines.
- Negotiation notes.
- Offer documents.

Offer existence may be recorded in Career OS, but sensitive offer details must remain private and local-first.

## SOP 13 — Daily Operations Review

Review in this order:

1. Today's Actions.
2. Upcoming Timeline.
3. Overdue items.
4. Stale applications.
5. Missing traceability.
6. New responses.
7. Validation status.

Daily review is required on active search days.

## SOP 14 — Weekly Pilot Review

Include:

- Registry validation.
- Privacy validation.
- Stale review.
- Application and outcome updates.
- Friction review.
- Defect triage.
- Metric review.
- Working-tree privacy check.

Weekly review determines whether the pilot remains GO, should REVISE, or must STOP according to [pilot-governance.md](pilot-governance.md#decision-gates).

## SOP 15 — Defect Reporting

Use fields:

- Defect ID.
- Date.
- Application ID or anonymized reference.
- Severity.
- Reproduction steps.
- Expected behavior.
- Actual behavior.
- Privacy impact.
- Workaround.
- Evidence.
- Resolution status.

Severity definitions:

- P0: Privacy breach, destructive behavior, corrupted or lost records.
- P1: Core workflow cannot be completed or results are materially wrong.
- P2: Substantial friction, confusing workflow, or recoverable inconsistency.
- P3: Cosmetic, minor accessibility, or low-impact usability issue.

## SOP 16 — Pilot Observation

After each application capture:

- Time spent.
- Friction.
- Repetitive commands.
- Difficult fields.
- Missing console information.
- Unused information.
- Errors.
- Suggested improvement.
- Severity.

Observations should be used for roadmap prioritization, not immediate feature expansion unless a P0 or P1 issue appears.

## SOP 17 — Five-Application Review Gate

After the first 5 submitted applications:

- GO: Continue if privacy validation passes, traceability is complete, no unresolved P0 exists, and core workflows are usable.
- REVISE: Pause or adjust if P1 defects, repeated P2 friction, misleading metrics, or incomplete traceability reduce confidence but can be corrected.
- STOP: Stop if there is an unresolved P0, repeated data corruption, private data exposure, destructive behavior, or a workflow failure that prevents reliable operation.

Document the decision and rationale.

## SOP 18 — Final Pilot Review

The final review should:

- Confirm pilot scope completion.
- Review [success-metrics.md](success-metrics.md).
- Review all P0, P1, P2, and P3 defects.
- Review workflow-friction patterns.
- Review privacy and registry validation outcomes.
- Review funnel signals with sample sizes.
- Review resume and positioning signals as directional.
- Identify roadmap priorities grounded in observed usage.
- Decide whether Career OS is ready for a pilot patch, broader pilot, or deeper redesign.

