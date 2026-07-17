# Application Intelligence Data Model

Last updated: 2026-07-17

## Application

Required fields:

- `application_id`
- `company`
- `role`
- `job_url`
- `location`
- `employment_type`
- `application_source`
- `application_date`
- `status`
- `current_stage`
- `notes`

## Resume Snapshot

Immutable references only:

- `resume_version`
- `resume_plan_version`
- `narrative_version`
- `export_version`
- `commit_hash`
- `resume_file_path`
- `pdf_path`
- `docx_path`
- `human_review_timestamp`

Resume content must not be duplicated in Application Intelligence.

## JD Snapshot

Fields:

- `jd_path`
- `jd_hash`
- `jd_version`
- `primary_archetype`
- `secondary_archetypes`
- `keywords`
- `competencies`

## Manual Override

Fields:

- `override_type`
- `reason`
- `section`
- `time_spent_minutes`
- `frequency`
- `future_automation_opportunity`

## Outcome

Fields:

- `application_date`
- `response_date`
- `response_type`
- `interview_count`
- `offer`
- `salary`
- `rejection_reason`
- `candidate_withdrawal`

## Experiment

Fields:

- `experiment_id`
- `variant`
- `headline_variant`
- `summary_variant`
- `project_included`
- `product_os_module`

