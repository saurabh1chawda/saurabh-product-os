# Career OS Phase 1 Controlled Live Pilot Runbook

## Purpose

This runbook is the operator execution guide for every application processed during the Phase 1 controlled live pilot. It is designed for day-to-day use and should be sufficient to run a complete application workflow without referencing other governance documents unless clarification is needed.

This document does not redesign Career OS. It operationalizes the approved workflow, decision gates, privacy rules, and pilot charter.

## Operator Preparation

Complete this checklist before starting work on an active pilot day.

- [ ] Repository is up to date.
- [ ] Working directory is clean or only expected documentation changes are present.
- [ ] Latest operational templates are available.
- [ ] Pilot dashboard or operations console is available.
- [ ] Improvement backlog is available.
- [ ] Privacy checklist has been reviewed.
- [ ] Time tracking method is ready.
- [ ] Application IDs, JD Snapshot IDs, and Resume IDs can be assigned.
- [ ] No private application data is staged for commit.
- [ ] Today’s application capacity is realistic.

## Pre-Application Checklist

Complete this checklist before beginning a new application.

- [ ] Opportunity is selected.
- [ ] Role is real and open.
- [ ] Candidate is genuinely willing to interview.
- [ ] Qualification criteria are reviewed.
- [ ] JD source URL is available.
- [ ] JD can be archived as a stable snapshot.
- [ ] No duplicate application exists.
- [ ] Application ID is assigned.
- [ ] Opportunity ID is assigned.
- [ ] JD Snapshot ID is assigned.
- [ ] Working folder or artifact location is prepared.
- [ ] Timeline tracking has started.
- [ ] Required operational templates are identified.

## Execution Checklist

### 1. Opportunity

**Objective:** Capture the role before qualification.

**Required Inputs**

- Role source.
- Company name.
- Role title.
- Location or work model.
- Initial source/channel.

**Checklist**

- [ ] Complete opportunity intake.
- [ ] Record source URL or source reference.
- [ ] Record capture date.
- [ ] Check for obvious duplicate.
- [ ] Decide whether qualification is worthwhile.

**Required Outputs**

- Opportunity intake artifact.
- Opportunity ID.

**Stop Condition**

Stop if the role is not real, not accessible, clearly closed, or outside pilot scope.

**Decision Gate**

None. Proceed to Qualification.

**Expected Evidence**

- Source URL or stable reference.
- Capture date.

### 2. Qualification

**Objective:** Decide whether the opportunity should enter the pilot workflow.

**Required Inputs**

- Opportunity intake.
- Role posting.
- Pilot scope.
- Location and work model.
- Duplicate check.

**Checklist**

- [ ] Confirm role fits Phase 1 target scope.
- [ ] Confirm broad experience relevance.
- [ ] Confirm location and work model are acceptable.
- [ ] Confirm role is not known to be closed.
- [ ] Confirm no duplicate application exists.
- [ ] Record proceed, reject, or hold recommendation.

**Required Outputs**

- Qualification artifact.
- Gate 1 decision.

**Stop Condition**

Stop if the role is not worth applying to or required information is unavailable.

**Decision Gate**

Gate 1: Proceed / Reject Opportunity.

**Expected Evidence**

- Qualification rationale.
- Source reference.
- Duplicate check result.

### 3. JD Snapshot

**Objective:** Preserve a stable version of the job description.

**Required Inputs**

- Qualified opportunity.
- JD source URL.
- Company and role identifiers.

**Checklist**

- [ ] Capture stable JD snapshot.
- [ ] Record source URL.
- [ ] Record capture date.
- [ ] Record posting ID if available.
- [ ] Store the snapshot in the correct private or operational location.
- [ ] Confirm the live URL is not the only source of truth.

**Required Outputs**

- JD Snapshot artifact.
- JD Snapshot ID.

**Stop Condition**

Stop if the JD cannot be captured or the role source is too incomplete for analysis.

**Decision Gate**

None. Proceed to JD Intelligence.

**Expected Evidence**

- Stable JD snapshot.
- Source URL.
- Capture date.

### 4. JD Intelligence

**Objective:** Analyze the JD and identify role archetype, competencies, keywords, gaps, and evidence fit.

**Required Inputs**

- JD Snapshot.
- Resume OS evidence.
- Product OS proof assets.

**Checklist**

- [ ] Run JD Intelligence.
- [ ] Confirm primary archetype.
- [ ] Confirm secondary archetypes.
- [ ] Review required competencies.
- [ ] Review preferred competencies.
- [ ] Review must-cover keywords.
- [ ] Review hidden hiring signals.
- [ ] Review top achievement recommendations.
- [ ] Review Product OS asset recommendation.
- [ ] Review gaps and risks.
- [ ] Mark human review required.

**Required Outputs**

- JD Intelligence output.
- JD Intelligence report.
- Recommended evidence set.
- Gaps and risks.

**Stop Condition**

Stop if JD Intelligence shows an unmitigable P0 fit gap or unsupported mandatory requirement.

**Decision Gate**

None. Proceed to Resume Strategy.

**Expected Evidence**

- JD Intelligence report.
- Evidence-backed recommendations.
- Gap analysis.

### 5. Resume Strategy

**Objective:** Approve the positioning strategy before assembly.

**Required Inputs**

- JD Intelligence report.
- Canonical evidence.
- Role archetype.
- Gap analysis.

**Checklist**

- [ ] Select target headline.
- [ ] Select summary direction.
- [ ] Select primary achievement set.
- [ ] Select bullet libraries.
- [ ] Select one primary project or Product OS asset.
- [ ] Order skills priorities.
- [ ] Document known gaps and mitigations.
- [ ] Confirm all positioning is evidence-backed.

**Required Outputs**

- Resume Strategy artifact.
- Gate 2 decision.

**Stop Condition**

Stop if the strategy requires unsupported claims, inflated scope, or unverified metrics.

**Decision Gate**

Gate 2: Proceed with Resume Generation.

**Expected Evidence**

- JD Intelligence report.
- Evidence IDs.
- Product OS asset mapping.

### 6. Resume Assembly

**Objective:** Assemble the approved resume plan without changing facts or evidence.

**Required Inputs**

- Approved Resume Strategy.
- Resume component library.
- Bullet library.
- Canonical evidence map.

**Checklist**

- [ ] Create Resume Plan.
- [ ] Select headline module.
- [ ] Select summary module.
- [ ] Select experience role blocks.
- [ ] Select bullet IDs.
- [ ] Confirm each bullet maps to one achievement ID.
- [ ] Select skills modules.
- [ ] Confirm Product OS links.
- [ ] Estimate page count.
- [ ] Confirm no unsupported claims are introduced.

**Required Outputs**

- Resume Plan.
- Resume draft.
- Evidence map.

**Stop Condition**

Stop if selected content breaks evidence traceability or exceeds acceptable page length without approval.

**Decision Gate**

None. Proceed to QA Review.

**Expected Evidence**

- Resume Plan.
- Resume draft.
- Bullet-to-achievement traceability.

### 7. QA Review

**Objective:** Verify the resume before external use.

**Required Inputs**

- Resume draft.
- Evidence map.
- JD Intelligence report.
- Resume Strategy.

**Checklist**

- [ ] Factual integrity review complete.
- [ ] Relevance review complete.
- [ ] Human-writing review complete.
- [ ] ATS review complete.
- [ ] Recruiter first-impression review complete.
- [ ] Link QA complete.
- [ ] Manual overrides recorded if used.
- [ ] No unsupported claims remain.

**Required Outputs**

- QA Checklist.
- Approved or revised resume.
- Gate 3 decision.

**Stop Condition**

Stop if factual integrity fails, links are broken, or unsupported claims remain.

**Decision Gate**

Gate 3: QA Approval.

**Expected Evidence**

- QA checklist.
- Evidence map.
- Link review.

### 8. Submission

**Objective:** Manually submit the approved application.

**Required Inputs**

- Approved resume.
- JD Snapshot.
- Submission channel.
- Application portal or recruiter channel.

**Checklist**

- [ ] Confirm resume is final.
- [ ] Confirm metadata is correct.
- [ ] Confirm links are correct.
- [ ] Confirm PDF export is available where needed.
- [ ] Confirm QA passed.
- [ ] Confirm Gate 4 approval.
- [ ] Complete privacy review.
- [ ] Submit manually.
- [ ] Capture confirmation where available.

**Required Outputs**

- Submission artifact.
- Submission date.
- Submission confirmation or note.

**Stop Condition**

Stop if the portal requires unsupported information, the resume is not approved, or privacy concerns appear.

**Decision Gate**

Gate 4: Ready for Submission.

**Expected Evidence**

- Approved resume export.
- Submission confirmation where available.
- Submission timestamp.

### 9. Registry Update

**Objective:** Update the Application Registry after submission.

**Required Inputs**

- Submission artifact.
- JD Snapshot ID.
- Resume ID.
- Application ID.
- Source/channel.

**Checklist**

- [ ] Create or update application registry record.
- [ ] Record current stage.
- [ ] Record current status.
- [ ] Link JD Snapshot.
- [ ] Link Resume ID.
- [ ] Link submission artifact.
- [ ] Set next action or valid waiting state.
- [ ] Run or note registry validation where applicable.

**Required Outputs**

- Registry update artifact.
- Application record.
- Next action or valid waiting state.

**Stop Condition**

Stop if traceability cannot be established.

**Decision Gate**

None. Proceed to Recruiter Interaction or waiting state.

**Expected Evidence**

- Application ID.
- Linked JD Snapshot.
- Linked Resume ID.
- Submission date.

### 10. Recruiter Interaction

**Objective:** Track explicit recruiter or employer interaction without storing unnecessary private communication.

**Required Inputs**

- Application record.
- Employer response or interaction.
- Contact reference if appropriate.

**Checklist**

- [ ] Record interaction date.
- [ ] Record interaction type.
- [ ] Record stage before interaction.
- [ ] Record stage after interaction if changed.
- [ ] Record explicit employer response.
- [ ] Record next action.
- [ ] Avoid unnecessary raw communication storage.

**Required Outputs**

- Recruiter interaction log.
- Updated application stage or waiting state.

**Stop Condition**

Stop if a privacy concern appears or the response cannot be classified.

**Decision Gate**

None unless interaction leads to interview completion or terminal outcome.

**Expected Evidence**

- Employer response summary.
- Stage transition reason.
- Next action.

### 11. Interview Tracking

**Objective:** Track interview scheduling, completion, and outcome status.

**Required Inputs**

- Application record.
- Interview invitation.
- Stage information.

**Checklist**

- [ ] Record interview stage.
- [ ] Record scheduled date.
- [ ] Record format.
- [ ] Create preparation task.
- [ ] Record completion event.
- [ ] Record explicit outcome when available.
- [ ] Avoid storing confidential interview questions.
- [ ] Set next action or waiting state.

**Required Outputs**

- Interview log.
- Updated application stage.
- Gate 5 decision when complete.

**Stop Condition**

Stop if confidential information would need to be stored or the interview status is unclear.

**Decision Gate**

Gate 5: Interview Complete.

**Expected Evidence**

- Interview invitation or scheduling reference.
- Completion event.
- Explicit outcome where available.

### 12. Knowledge Capture

**Objective:** Convert the application into pilot learning.

**Required Inputs**

- Application artifacts.
- Metrics.
- Friction notes.
- Outcome information.
- Manual override notes.

**Checklist**

- [ ] Complete pilot observation.
- [ ] Record time spent.
- [ ] Record friction.
- [ ] Record reusable learning.
- [ ] Add backlog item if warranted.
- [ ] Add decision-log entry only for significant product decisions.
- [ ] Confirm privacy-safe language.
- [ ] Complete Gate 6.

**Required Outputs**

- Pilot observation.
- Backlog item if needed.
- Decision-log entry if needed.

**Stop Condition**

Stop if learning depends on unsupported assumptions or private data.

**Decision Gate**

Gate 6: Pilot Learning Captured.

**Expected Evidence**

- Observation artifact.
- Metrics.
- Friction log.
- Backlog references where applicable.

## Decision Gate Checklist

### Gate 1: Proceed / Reject Opportunity

- [ ] Role is real.
- [ ] Role fits pilot scope.
- [ ] Location and work model are acceptable.
- [ ] No duplicate application exists.
- [ ] Required JD information is available.

Approval criteria: proceed only if the opportunity is worth a full workflow cycle.

Evidence required: opportunity intake and qualification artifact.

Pass action: proceed to JD Snapshot.

Fail action: reject or hold with rationale.

Escalation rule: escalate if duplicate or eligibility status is unclear.

### Gate 2: Proceed with Resume Generation

- [ ] JD Intelligence is complete.
- [ ] Archetype is clear enough.
- [ ] Evidence fit is sufficient.
- [ ] Gaps are honest and mitigable.
- [ ] Strategy does not require unsupported claims.

Approval criteria: resume generation is justified by verified evidence.

Evidence required: JD Intelligence report and Resume Strategy.

Pass action: proceed to Resume Assembly.

Fail action: revise strategy, reject application, or hold.

Escalation rule: escalate any unsupported claim pressure.

### Gate 3: QA Approval

- [ ] Factual integrity passed.
- [ ] Relevance passed.
- [ ] Human writing passed.
- [ ] ATS review passed.
- [ ] Recruiter first impression passed.
- [ ] Links passed.

Approval criteria: resume is safe for external use.

Evidence required: QA checklist, resume draft, evidence map.

Pass action: proceed to Submission.

Fail action: revise resume or strategy.

Escalation rule: any factual or privacy issue blocks submission.

### Gate 4: Ready for Submission

- [ ] Resume verified.
- [ ] Metadata correct.
- [ ] Links verified.
- [ ] PDF exported if required.
- [ ] QA passed.
- [ ] Privacy review complete.
- [ ] Submission channel ready.

Approval criteria: all external materials are final and privacy-safe.

Evidence required: approved resume export and submission artifact.

Pass action: submit manually.

Fail action: defer, cancel, or return to QA.

Escalation rule: privacy concern blocks submission.

### Gate 5: Interview Complete

- [ ] Interview stage recorded.
- [ ] Date recorded.
- [ ] Format recorded.
- [ ] Completion status recorded.
- [ ] Outcome status recorded or valid waiting state set.
- [ ] No confidential interview content stored.

Approval criteria: interview record is complete and next action is clear.

Evidence required: interview log.

Pass action: proceed to post-interview review or waiting state.

Fail action: complete missing interview information.

Escalation rule: unclear status or confidential information concern requires review.

### Gate 6: Pilot Learning Captured

- [ ] Observation completed.
- [ ] Metrics updated.
- [ ] Friction logged if any.
- [ ] Backlog updated if needed.
- [ ] Decision log updated if needed.
- [ ] Privacy-safe language confirmed.

Approval criteria: the application produced usable operational learning.

Evidence required: pilot observation, metrics, and backlog references where applicable.

Pass action: close workflow cycle for the application.

Fail action: complete observation or backlog entry.

Escalation rule: repeat friction or P0/P1 defect requires governance review.

## Submission Checklist

Before submitting:

- [ ] Resume verified.
- [ ] Metadata correct.
- [ ] Links verified.
- [ ] PDF exported if required.
- [ ] QA passed.
- [ ] Decision Gate 4 approved.
- [ ] Privacy review complete.
- [ ] Submission channel confirmed.
- [ ] No unsupported portal claims required.
- [ ] Time of submission is ready to capture.

## Post-Submission Checklist

Immediately after submission:

- [ ] Confirmation captured if available.
- [ ] Registry updated.
- [ ] Submission timestamp recorded.
- [ ] Metrics updated.
- [ ] Evidence archived.
- [ ] Next action or waiting state set.
- [ ] Observations recorded.
- [ ] Friction logged if any.
- [ ] No private data staged for commit.

## Daily Wrap-Up

Complete this checklist at the end of each active pilot day.

- [ ] All evidence stored.
- [ ] Metrics complete.
- [ ] Pilot dashboard or operations console updated.
- [ ] Backlog updated.
- [ ] Notes completed.
- [ ] Next actions are clear.
- [ ] Privacy checklist reviewed.
- [ ] Repository status reviewed.
- [ ] No private data staged.

## Incident Response

### Missing JD

Action: stop the application workflow, mark the opportunity as hold, and do not run JD Intelligence until a stable JD snapshot exists.

### Broken Template

Action: complete the workflow using the closest approved template, record friction, and add a backlog item. Do not redesign the template during Phase 1 unless it blocks a P0/P1 workflow.

### Privacy Concern

Action: stop work, identify the affected file or artifact, remove sensitive data from working material, run privacy review, and escalate before commit or sharing.

### Skipped Workflow Stage

Action: stop, return to the skipped stage, complete the missing artifact, and record the incident as friction. Do not continue with missing gates.

### Duplicate Application

Action: stop, compare against existing applications, and either link to the existing application or reject the duplicate with rationale.

### Repository Issue

Action: stop application processing, inspect repository status, avoid staging private data, and resolve repository safety before continuing.

### Recruiter Withdrawal

Action: record explicit withdrawal interaction, update the registry, set terminal or waiting state as appropriate, and capture learning.

### Application Withdrawn

Action: record withdrawal date, stage, reason, registry update, and pilot observation. Do not delete artifacts.

## Pilot Freeze Reminder

During Phase 1 execution, do not:

- Redesign workflow.
- Redesign templates.
- Redesign governance.
- Restructure repository.
- Modify runtime behavior.
- Modify schemas.
- Add automation.
- Skip decision gates.

Record observations only. Convert material findings into backlog items.

## Definition of Done

An application is complete only when:

- [ ] Workflow is complete or explicitly stopped with rationale.
- [ ] Decision gates are completed.
- [ ] Registry is updated.
- [ ] Metrics are captured.
- [ ] Evidence is archived.
- [ ] Observations are documented.
- [ ] Friction is logged if present.
- [ ] Retrospective learning is captured.
- [ ] Next action or terminal outcome is clear.
- [ ] Privacy status is clean.

## Operator Quick Reference

Use this condensed checklist when processing an application.

1. Prepare
   - [ ] Repository and workspace ready.
   - [ ] Privacy reminder reviewed.
   - [ ] Time tracking ready.

2. Intake
   - [ ] Select opportunity.
   - [ ] Assign Opportunity ID.
   - [ ] Capture source.

3. Qualify
   - [ ] Check scope, fit, location, duplicate status.
   - [ ] Complete Gate 1.

4. Snapshot
   - [ ] Assign JD Snapshot ID.
   - [ ] Archive JD.
   - [ ] Record source and capture date.

5. Analyze
   - [ ] Run JD Intelligence.
   - [ ] Review archetype, competencies, keywords, gaps.

6. Strategize
   - [ ] Select headline, evidence, skills, Product OS asset.
   - [ ] Complete Gate 2.

7. Assemble
   - [ ] Build resume plan.
   - [ ] Confirm bullet evidence.
   - [ ] Create draft.

8. QA
   - [ ] Run factual, relevance, human-writing, ATS, recruiter, and link checks.
   - [ ] Complete Gate 3.

9. Submit
   - [ ] Verify resume, metadata, links, PDF, privacy.
   - [ ] Complete Gate 4.
   - [ ] Submit manually.

10. Register
    - [ ] Update registry.
    - [ ] Link JD and resume.
    - [ ] Set next action or waiting state.

11. Track
    - [ ] Record recruiter interactions.
    - [ ] Record interviews and outcomes.
    - [ ] Complete Gate 5 when applicable.

12. Learn
    - [ ] Capture observation.
    - [ ] Update metrics.
    - [ ] Log friction and backlog items.
    - [ ] Complete Gate 6.

13. Wrap
    - [ ] Archive evidence.
    - [ ] Review repository status.
    - [ ] Confirm no private data is staged.

