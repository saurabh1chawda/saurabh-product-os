# Record Lifecycle

Last updated: 2026-07-18

## Default Stages

`discovered`, `saved`, `resume_generated`, `human_reviewed`, `ready_to_apply`, `applied`, `recruiter_viewed`, `recruiter_contact`, `recruiter_screen`, `online_assessment`, `hiring_manager_interview`, `product_interview`, `technical_interview`, `system_design`, `case_study`, `panel_interview`, `final_round`, `offer`, `accepted`, `rejected`, `withdrawn`, `closed`.

## Default Statuses

`active`, `waiting`, `action_required`, `on_hold`, `successful`, `unsuccessful`, `withdrawn`, `archived`.

## Transition Rules

- Forward movement is valid.
- Skipped stages are allowed with a reason.
- Backward movement is rejected unless reopening from a terminal stage.
- Terminal stages require outcome consistency.
- Archive does not delete records or events.
