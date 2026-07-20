# Career OS Phase 1 Controlled Live Pilot Charter

## Executive Summary

Career OS has completed Phase 0 foundation work and is ready for controlled production use. Phase 1 validates the operating system through exactly five real job applications while preserving the stable architecture, workflow, templates, governance, privacy rules, and repository structure.

The pilot is not a redesign sprint. It is an operating sprint. Every application must follow the established Career OS workflow, pass decision gates, preserve traceability, and produce evidence that can guide future improvements.

## Purpose

The purpose of the controlled live pilot is to validate whether Career OS can reliably support real job-search operations from opportunity intake through application tracking, recruiter interaction, interview tracking, outcome capture, and learning review.

The pilot should answer:

- Can Career OS replace ad hoc application tracking?
- Can every application remain traceable from job description to resume to registry record?
- Can the workflow be followed without excessive friction?
- Can operational metrics be captured consistently?
- Can useful improvement opportunities be identified without destabilizing the system?

## Background

Career OS has completed:

- Phase 0 Foundation
- Release Freeze
- Governance
- Pilot Workspace
- Privacy Governance
- Pilot Operating Model
- Operational Templates
- Operational Readiness Review
- Operational Readiness Certification

The operational-ready baseline is represented by Git tag `career-os-v1.0-operational-ready`. Phase 1 begins from that stable baseline.

## Pilot Objectives

Objectives are ranked by priority.

1. Validate end-to-end workflow execution across five live applications.
2. Preserve 100% traceability from opportunity through pilot learning.
3. Confirm privacy and repository safety during real-world use.
4. Measure operating effort, friction, and quality gates.
5. Validate whether Career OS replaces external spreadsheets for pilot applications.
6. Identify evidence-backed improvements for Phase 2.
7. Observe recruiting outcomes directionally without making statistical claims.

## Scope

### In Scope

- Exactly five live job applications.
- Real opportunities that Saurabh is genuinely willing to pursue.
- Opportunity qualification.
- JD snapshot capture.
- JD Intelligence.
- Resume strategy.
- Resume assembly.
- QA review.
- Manual application submission.
- Application registry update.
- Recruiter interaction tracking.
- Interview tracking.
- Outcome recording.
- Knowledge capture.
- Pilot observations.
- Backlog creation.
- Pilot retrospective.

### Out of Scope

- Workflow redesign.
- Template redesign.
- Governance redesign.
- Repository restructuring.
- Runtime code changes.
- Schema changes.
- UI changes.
- Business logic changes.
- Automated application submission.
- Gmail, LinkedIn, or calendar integration.
- AI-generated application recommendations.
- Autonomous stage transitions.
- Statistical claims from five applications.
- Public reporting of private application data.

## Pilot Success Criteria

The pilot succeeds if:

- Five live applications are completed through the approved workflow.
- Every application has a unique application ID.
- Every application has a JD snapshot reference.
- Every application has resume traceability.
- Every decision gate is completed.
- Every submission is manual and human-approved.
- Every employer response received during the pilot is recorded.
- Privacy validation remains clean.
- Repository integrity is preserved.
- Operational friction is captured.
- Pilot metrics are collected.
- Improvement backlog items are evidence-backed.
- A final retrospective is completed.

## Pilot Exit Criteria

Phase 1 exits when:

- Five applications have been submitted or explicitly stopped with documented rationale.
- Each application has complete traceability.
- Open applications have valid next actions or valid waiting states.
- Known received outcomes are recorded.
- Pilot observations are complete.
- Improvement backlog is reviewed.
- Final retrospective is completed.
- Phase 2 readiness decision is documented.

## Expected Deliverables

- Five application workflow packets.
- Five JD snapshots.
- Five JD Intelligence outputs.
- Five resume strategy records.
- Five resume assembly and QA records.
- Five application registry records.
- Recruiter or interaction logs where applicable.
- Interview logs where applicable.
- Pilot observations for each application.
- Updated improvement backlog.
- Final Phase 1 retrospective.
- Phase 2 readiness recommendation.

## Pilot Principles

- Evidence over opinion.
- Consistency over speed.
- Every application follows the workflow.
- No undocumented shortcuts.
- Documentation first.
- Operational discipline.
- Privacy by default.
- Small reversible improvements.
- Continuous learning.
- Directional interpretation of small samples.
- External actions require human approval.
- Findings go to backlog before implementation.

## Roles and Responsibilities

| Role | Responsibilities | Boundaries |
| --- | --- | --- |
| Candidate | Chooses opportunities, approves resumes, submits applications, owns truthful representation. | Does not delegate external application decisions. |
| Career OS | Provides workflow, templates, registry, validation, metrics, and operating structure. | Does not make hiring decisions or infer outcomes from silence. |
| Product Owner | Owns pilot scope, acceptance, priorities, privacy decisions, and Phase 2 readiness. | Does not bypass governance for convenience. |
| AI Assistant | Advises on product, operations, structure, and review quality. | Does not independently make product-policy decisions. |
| Future AI Agents | May assist with controlled workflow steps if approved in a future phase. | No autonomous external actions during Phase 1. |
| Reviewer | Reviews evidence, QA results, friction, and pilot learnings where needed. | Does not alter canonical facts or approve unsupported claims. |

## Pilot Constraints

- Exactly five live applications.
- No workflow redesign during execution.
- No repository restructuring.
- No template redesign during execution.
- No skipped decision gates.
- Every artifact retained.
- Every application must have traceability.
- All findings go to the improvement backlog.
- Only P0/P1 operational defects may interrupt the pilot.
- Private application data must remain private and uncommitted.
- No real application record is created outside the approved pilot workflow.

## Operational Rules

- Every application receives a unique application ID.
- Every opportunity receives a unique opportunity ID.
- Every JD snapshot receives a unique JD Snapshot ID.
- Every resume variant receives a unique Resume ID.
- Every decision is documented at the appropriate gate.
- Every workflow stage is completed or explicitly stopped.
- Evidence must be attached before approval.
- Decision gates cannot be bypassed.
- Manual overrides must be recorded.
- Employer outcomes must be explicit.
- Rejections must not be inferred from silence.
- Retrospective capture is required for every application.

## Success Metrics

### Operational KPIs

| KPI | Definition | Target | Measurement | Success Threshold |
| --- | --- | --- | --- | --- |
| Workflow Completion | Applications completing required workflow stages. | 5 of 5 | Completed stage artifacts. | 100% or documented stop rationale. |
| Decision Gate Completion | Required gates completed per application. | All gates applicable | Gate artifacts and checklist review. | 100% |
| Traceability Coverage | Applications with JD, resume, registry, and observation links. | 5 of 5 | Traceability review. | 100% |

### Efficiency KPIs

| KPI | Definition | Target | Measurement | Success Threshold |
| --- | --- | --- | --- | --- |
| Registry Administration Time | Time to create/update application record after submission. | Below 10 minutes median | Operator timing notes. | Median below 10 minutes |
| Submission Cycle Time | Intake-to-submission elapsed time. | Track baseline | Workflow timestamps. | Baseline captured for 5 applications |
| QA Completion Time | Time spent on QA review. | Track baseline | QA notes. | Baseline captured for 5 applications |

### Quality KPIs

| KPI | Definition | Target | Measurement | Success Threshold |
| --- | --- | --- | --- | --- |
| QA Pass Rate | Resumes passing QA without major rework. | Directional | QA checklist. | No unresolved P0/P1 QA issue |
| Evidence Completeness | Required evidence present before approval. | 5 of 5 | Gate review. | 100% |
| Privacy Validation | No private data committed or exposed. | Clean | Privacy checks and git review. | 100% pass |

### Recruiting KPIs

| KPI | Definition | Target | Measurement | Success Threshold |
| --- | --- | --- | --- | --- |
| Explicit Employer Response Rate | Responses divided by eligible submitted applications. | Directional | Registry events. | Rate reported with sample size |
| Recruiter Screen Rate | Recruiter screens divided by eligible submitted applications. | Directional | Registry events. | Rate reported with sample size |
| Interview Rate | Substantive interviews divided by eligible submitted applications. | Directional | Registry events. | Rate reported with sample size |

### Learning KPIs

| KPI | Definition | Target | Measurement | Success Threshold |
| --- | --- | --- | --- | --- |
| Observation Completion | Applications with pilot observations. | 5 of 5 | Observation artifacts. | 100% |
| Backlog Quality | Findings converted into evidence-backed backlog items. | All material findings | Backlog review. | 100% material findings captured |
| Retrospective Completion | Final Phase 1 review completed. | Complete | Retrospective artifact. | 100% |

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Review Cadence |
| --- | --- | --- | --- | --- | --- |
| Workflow feels too heavy for live applications. | Medium | Medium | Capture friction; batch improvements after five applications. | Product Owner | After each application |
| Private application data is accidentally committed. | Low | High | Follow privacy checklist and git review before commit. | Product Owner | Before every commit |
| Decision gates are skipped under time pressure. | Medium | High | Treat gates as mandatory pilot acceptance criteria. | Product Owner | Per application |
| Traceability breaks between resume and registry. | Medium | High | Verify IDs during registry update and weekly review. | Product Owner | Per application |
| Metrics are incomplete due to missing timestamps. | Medium | Medium | Capture timing notes manually during each workflow stage. | Product Owner | Weekly |
| Five-application sample is overinterpreted. | Medium | Medium | Label results as directional only. | Product Owner | Final retrospective |
| Backlog becomes a wishlist instead of evidence-backed. | Medium | Medium | Require evidence and affected document for each backlog item. | Product Owner | Weekly |
| Live opportunity urgency pressures shortcuts. | Medium | High | Use documented stop/hold paths rather than skipping stages. | Product Owner | Per application |

## Change Control

### Allowed Changes

- Documentation corrections that fix broken links or factual errors.
- Privacy or safety corrections required to prevent exposure.
- Emergency fixes for P0/P1 operational defects.
- Backlog entries based on observed pilot friction.
- Retrospective findings.

### Prohibited Changes

- Workflow redesign.
- Template redesign.
- Governance redesign.
- Repository restructuring.
- Runtime code changes.
- Schema changes.
- UI changes.
- Business logic changes.
- New integrations.
- New automation.

### Observation, Backlog, and Implementation

| Type | Meaning | Phase 1 Handling |
| --- | --- | --- |
| Observation | A fact noticed during pilot operation. | Record in pilot observation. |
| Backlog | A proposed improvement grounded in evidence. | Add to improvement backlog. |
| Implementation | A change to docs, code, workflow, templates, or systems. | Defer to Phase 2 unless P0/P1. |

Improvements are implemented only after review. Phase 1 prioritizes stable operation over feature velocity.

## Pilot Timeline

```text
Pilot Initialization
  |
Application #1
  |
Review
  |
Application #2
  |
Review
  |
Application #3
  |
Review
  |
Application #4
  |
Review
  |
Application #5
  |
Pilot Retrospective
  |
Phase Completion
```

## Pilot Governance

### Decision Hierarchy

Observed evidence

↓

Pilot metrics

↓

Product review

↓

Architecture review

↓

Implementation decision

↓

Validation

### Escalation

Escalate immediately for privacy exposure, corrupted records, skipped gates, broken traceability, or any P0/P1 defect.

### Weekly Review

Weekly review checks active applications, next actions, privacy posture, validation status, friction, metrics, and backlog.

### Evidence Review

Evidence review confirms every claim, artifact, decision, and metric has a traceable source.

### Backlog Review

Backlog review verifies that every proposed improvement has evidence, priority, affected document or system, and status.

### Completion Review

Completion review determines whether Phase 1 met success criteria and whether Career OS can enter Phase 2.

## Definition of Success

The pilot is successful when:

- Five applications are completed or explicitly stopped with documented rationale.
- Workflow execution is complete.
- Metrics are collected.
- Evidence is captured.
- Backlog is maintained.
- Privacy remains intact.
- Repository integrity remains intact.
- Retrospective is completed.
- Career OS improvements are identified.
- Phase 2 readiness can be evaluated with evidence.

## Definition of Failure

The pilot fails if:

- Workflow is abandoned.
- Decision gates are skipped.
- Required evidence is missing.
- Applications are incomplete without documented rationale.
- Repository integrity is compromised.
- Private application data is committed or exposed.
- Outcomes are inferred without evidence.
- Pilot is terminated early without a documented decision.
- No usable learning is captured.

## Readiness to Enter Phase 2

Phase 2, Career OS Continuous Improvement, may begin when:

- Phase 1 exit criteria are complete.
- Final retrospective is complete.
- Improvement backlog is prioritized.
- P0 defects are closed.
- P1 defects are closed or explicitly accepted with mitigation.
- Privacy validation is clean.
- Repository status is clean.
- Product Owner approves Phase 2 scope.

