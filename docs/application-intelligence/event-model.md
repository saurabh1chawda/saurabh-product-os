# Application Intelligence Event Model

Last updated: 2026-07-17

## Event Philosophy

Events describe observed application lifecycle changes. They should be factual, timestamped, and attributable to a source.

## Core Events

- `application_discovered`
- `application_saved`
- `resume_generated`
- `human_review_completed`
- `application_submitted`
- `recruiter_viewed`
- `recruiter_contacted`
- `recruiter_rejected`
- `assessment_received`
- `interview_scheduled`
- `interview_completed`
- `offer_received`
- `application_rejected`
- `application_withdrawn`
- `offer_accepted`

## Event Fields

- `event_id`
- `application_id`
- `event_type`
- `occurred_at`
- `source`
- `previous_stage`
- `new_stage`
- `notes`

## Validity Rules

- Event timestamps cannot precede application discovery.
- Terminal states cannot move backward without an explicit correction event.
- Outcome events must reconcile with the Application outcome object.
- Private recruiter notes and confidential interview questions are not stored.

