# Career OS Pilot Glossary

## Opportunity

A potential role that may be evaluated for fit. An Opportunity is not a submitted Application until the operator submits to the employer.

## Qualified Opportunity

An Opportunity that meets the minimum eligibility rules in [operating-procedures.md](operating-procedures.md#sop-1--qualify-an-opportunity).

## Application

A Career OS record representing a role that is being tracked through the application lifecycle.

## Submitted Application

An Application that has been manually submitted to an employer and has a submission date.

## Active Application

A submitted Application that is still in progress and has not reached a terminal outcome.

## Open Application

An Application that is active or waiting for explicit employer response.

## Closed Application

An Application with a terminal outcome, including Offer accepted, Rejection, Withdrawal, or another explicit closed state.

## Mature Outcome

A submitted Application with a terminal outcome or enough observation time to be included in mature-outcome review according to pilot rules.

## Immature Application

A submitted Application that is still too recent or still in progress and should not be treated as a terminal outcome.

## Terminal Outcome

An explicit final state such as Offer, Rejection, Withdrawal, Accepted, or Closed.

## Explicit Employer Response

A response directly received from an employer, recruiter, recruiting system, or authorized representative. Silence is not an explicit response.

## Recruiter Screen

An initial screening conversation or scheduled screening step with a recruiter or talent representative.

## Substantive Interview

An interview that evaluates product judgment, role fit, domain knowledge, technical understanding, leadership, or case performance beyond basic recruiter screening.

## Hiring Manager Interview

An interview with the hiring manager or equivalent decision-maker for the role.

## Offer

An explicit employer offer or offer-stage communication. Compensation details are private by default.

## Rejection

An explicit employer-provided rejection or closure. Rejection must not be inferred from silence.

## Withdrawal

An operator-initiated decision to stop pursuing an application, with date, stage, and reason recorded.

## Stale Application

An open Application with no meaningful activity or next action for a defined review period.

## Next Action

The next explicit operational step required from the operator, such as follow-up, preparation, update, or review.

## Valid Waiting State

A state where no immediate operator action is required because the application is awaiting explicit employer response or a scheduled future event.

## JD Snapshot

A stable local capture of the job description, including source URL, capture date, role identifiers, and posting ID when available.

## Resume Snapshot

A stable reference to the resume version or exported artifact used for a submitted Application.

## Resume Variant

A distinct resume version used for one or more Applications, traceable to Resume OS components and evidence.

## Role Archetype

A high-level product-management role pattern, such as Senior Product Manager, Lead Product Manager, Senior AI Product Manager, or Platform Product Manager.

## Role Pack

A reusable Resume OS positioning package aligned to a role type, such as AI, Platform, Payments, Growth, Marketplace, Consumer, FinTech, or Enterprise SaaS.

## Manual Override

A human-approved change to a generated or assembled resume artifact, recorded with section, category, reason, summary, time spent, and reusable-learning flag.

## Traceability

The ability to connect a submitted Application to its JD Snapshot, Resume Snapshot, application events, tasks, contacts, and relevant evidence.

## Application Event

A recorded lifecycle event, such as creation, submission, stage transition, response, interview, rejection, withdrawal, or offer.

## Synthetic Data

Public-safe artificial data used for testing, validation, demos, or committed fixtures.

## Private Data

Real application, recruiter, compensation, note, interview, company, or outcome information that must remain local-first and must not be committed unless explicitly anonymized and approved.

## Pilot Defect

A bug, inconsistency, privacy issue, validation failure, or workflow problem found during pilot operation.

## Pilot Friction

A repeated or notable difficulty that slows operation, creates confusion, increases manual work, or reduces trust without necessarily being a software defect.

## Directional Signal

A pattern observed from the 10-20 application pilot that may inform decisions but is not statistically conclusive.

## Hypothesis

An unproven explanation or belief. Hypotheses must be labelled and must not be presented as observed facts.

## Deterministic Metric

A metric calculated from recorded fields using documented rules, without LLM interpretation or hidden manual adjustment.

## P0

Privacy breach, destructive behavior, corrupted or lost records.

## P1

Core workflow cannot be completed or results are materially wrong.

## P2

Substantial friction, confusing workflow, or recoverable inconsistency.

## P3

Cosmetic, minor accessibility, or low-impact usability issue.

## GO

Continue the pilot because privacy validation passes, no unresolved P0 exists, core workflows are usable, and traceability is intact.

## REVISE

Pause or adjust the pilot because P1 defects, repeated P2 friction, misleading metrics, or incomplete traceability reduce confidence but can be corrected.

## STOP

Stop the pilot because there is an unresolved P0, repeated data corruption, private data exposure, destructive behavior, or a workflow failure that prevents reliable operation.
