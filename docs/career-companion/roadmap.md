# Career Companion Roadmap

## Purpose

This roadmap defines the phased path from product definition to a controlled Career Companion agent pilot. Dates are intentionally omitted because phase progression should depend on evidence and readiness, not arbitrary deadlines.

## Phase A - Product Definition

### Objective

Define the product charter, MVP scope, principles, boundaries, and roadmap.

### Deliverables

- Career Companion README.
- Product Charter.
- Roadmap.
- Initial authority model.
- MVP scope definition.

### Entry Criteria

- Career OS pilot baseline is frozen.
- Career Companion workstream is isolated.
- Product direction is approved for documentation.

### Exit Criteria

- Product charter reviewed.
- MVP boundaries documented.
- Human authority model documented.
- Roadmap approved for architecture work.

### Dependencies

- Career OS governance and workflows.
- Resume OS and JD Intelligence concepts.

### Key Risks

- Defining too broad an MVP.
- Treating operating modes as autonomous agents too early.

### Explicit Non-Goals

- Runtime implementation.
- Schema changes.
- UI changes.
- Pilot baseline changes.

### Decision Checkpoint

Proceed to Phase B only if the MVP scope is narrow, governed, and isolated from the live pilot.

## Phase B - Architecture

### Objective

Design the Career Companion Orchestrator architecture and operating boundaries.

### Deliverables

- Orchestrator architecture.
- Capability model.
- State model.
- Memory model.
- Evidence and traceability architecture.
- Safety and escalation design.
- Evaluation plan.

### Entry Criteria

- Product Charter approved.
- Human authority model accepted.
- Career OS dependency map understood.

### Exit Criteria

- Architecture explains how the orchestrator uses Career OS protocols.
- State transitions are explicit.
- Approval gates are enforceable.
- Privacy boundaries are documented.
- Failure-safe behavior is defined.

### Dependencies

- Career OS workflow.
- Decision gates.
- Privacy governance.
- Resume OS data and component model.

### Key Risks

- Hidden autonomous behavior.
- Memory design that stores too much private data.
- Insufficient separation between verified facts and hypotheses.

### Explicit Non-Goals

- Building autonomous agents.
- Integrating email, calendar, or LinkedIn.
- Modifying Career OS schemas.

### Decision Checkpoint

Proceed to Phase C only if architecture can enforce human approvals and evidence traceability.

## Phase C - Resume Workflow Prototype

### Objective

Prototype the JD-to-application-package flow under one governed orchestrator.

### Deliverables

- JD intake prototype.
- Opportunity qualification recommendation.
- JD Intelligence orchestration.
- Resume Strategy recommendation.
- Evidence-backed Resume Assembly.
- Resume QA review.
- Human approval capture model.
- Traceability report.

### Entry Criteria

- Architecture approved.
- Verified evidence inputs available.
- Evaluation criteria defined.

### Exit Criteria

- Prototype completes the MVP flow without external actions.
- Claims remain evidence-backed.
- Human approvals are required at consequential gates.
- Unsupported claims are blocked.
- Privacy validation passes.

### Dependencies

- Resume OS evidence.
- JD Intelligence.
- Resume Assembly.
- Resume QA.
- Human review.

### Key Risks

- The prototype may overfit to known resume flows.
- Generated material may sound polished but weaken factual precision.
- Gate checks may become advisory instead of mandatory.

### Explicit Non-Goals

- Recruiter messaging automation.
- Interview coaching runtime.
- Application submission.
- Offer evaluation.

### Decision Checkpoint

Proceed to Phase D only if the resume workflow is safe, traceable, and useful.

## Phase D - Recruiter and Interview Support

### Objective

Extend Career Companion into communication drafting and interview preparation while preserving human authority.

### Deliverables

- Recruiter message drafting mode.
- Interview preparation mode.
- Interview coaching design.
- Interview debrief structure.
- Communication approval policy.
- Confidentiality rules for interview notes.

### Entry Criteria

- Resume Workflow Prototype is stable.
- Human approval enforcement is proven.
- Privacy model is sufficient for communication and interview data.

### Exit Criteria

- Recruiter messages require human send approval.
- Interview prep uses verified evidence.
- Debriefs avoid confidential interview content.
- Coaching output is distinguishable from factual evidence.

### Dependencies

- Career OS privacy governance.
- Recruiter communication rules.
- Interview tracking rules.
- Human review.

### Key Risks

- Drafted communication may sound too automated.
- Interview debrief may capture confidential content.
- Coaching hypotheses may be mistaken for verified facts.

### Explicit Non-Goals

- Sending messages.
- Scheduling interviews.
- Storing raw email content by default.
- Negotiating offers.

### Decision Checkpoint

Proceed to Phase E only if communication and interview support remain clearly human-controlled.

## Phase E - Evaluation and Hardening

### Objective

Evaluate Career Companion safety, usefulness, accuracy, and workflow reliability before any agent pilot.

### Deliverables

- Evaluation fixtures.
- Safety tests.
- Privacy tests.
- Factuality tests.
- Gate compliance tests.
- Traceability audits.
- Human acceptance review.
- Failure-mode report.

### Entry Criteria

- Core capabilities are prototyped.
- Evaluation metrics are defined.
- Test cases include fit, poor-fit, ambiguous, and high-risk scenarios.

### Exit Criteria

- No fabricated evidence.
- No skipped approval gates.
- No unauthorized external actions.
- Traceability checks pass.
- Human reviewer can understand recommendations.
- Known failure modes are documented.

### Dependencies

- Prototype outputs.
- Career OS validation practices.
- Human reviewer.

### Key Risks

- Evaluation set may be too narrow.
- Assistant may perform well in common cases but fail in ambiguous cases.
- Safety checks may be too manual.

### Explicit Non-Goals

- Production release.
- Autonomous external actions.
- Broad agent marketplace or multi-user support.

### Decision Checkpoint

Proceed to Phase F only if safety and usefulness are both demonstrated.

## Phase F - Controlled Agent Pilot

### Objective

Run a controlled pilot of the Career Companion Orchestrator on real application workflows under strict human approval.

### Deliverables

- Pilot plan.
- Pilot runbook.
- Human approval log.
- Recommendation quality review.
- Privacy review.
- Traceability review.
- Pilot retrospective.
- Expansion recommendation.

### Entry Criteria

- Evaluation and hardening complete.
- Human approval gates are enforceable.
- Privacy controls are accepted.
- Failure-safe stopping behavior is validated.

### Exit Criteria

- Orchestrator assists real workflows without bypassing Career OS.
- Human approval is maintained.
- No unauthorized external action occurs.
- No fabricated claim is accepted.
- User value is demonstrated with evidence.
- Expansion, revision, or stop decision is documented.

### Dependencies

- Stable orchestrator prototype.
- Career OS operating baseline.
- Human reviewer.
- Privacy review.

### Key Risks

- User may over-trust recommendations.
- Real-world urgency may pressure skipped gates.
- Private data handling risk increases with live use.

### Explicit Non-Goals

- Fully autonomous career agent.
- Public launch.
- Multi-user product.
- Unrestricted integrations.

### Decision Checkpoint

After Phase F, decide whether to expand capabilities, revise the MVP, or stop agent development.

