# Career Companion Workflow State Machine

## 1. Purpose

The Career Companion Workflow State Machine defines how Career Companion executes work. It is the canonical execution model for workflow state, valid transitions, capability availability, evidence requirements, human approvals, auditability, and future implementation behavior.

Career Companion must operate as a deterministic workflow engine, not as a free-form conversational AI. At every point in time the system must know:

```text
Current State
  ↓
Allowed Actions
  ↓
Required Evidence
  ↓
Required Human Approval
  ↓
Next Valid State
```

The state machine exists to ensure:

- Deterministic execution.
- Governed workflow behavior.
- Repeatable application processing.
- Full traceability from input to output.
- Auditability of every transition.
- Safety at consequential decision points.
- Predictable behavior across capabilities.
- Clear boundaries for future implementations.

## 2. Design Principles

- Explicit workflow state: every workflow instance has exactly one current state.
- Deterministic execution: valid actions are derived from the current state contract.
- Stateless Orchestrator: the Orchestrator must never remember workflow state.
- Evidence-first execution: evidence must exist before generation or recommendation.
- Human approval before consequential actions: approval gates must block progression.
- No hidden transitions: every transition must be explicit and audited.
- Private-by-default execution: private career and application data remains private unless explicitly approved.
- Artifact traceability: every generated artifact must link to source evidence.
- Failure-safe stopping: uncertainty, missing evidence, or unsupported claims stop progression.
- Replaceable capabilities: capabilities may evolve as long as they honor state contracts.
- Stable workflow contracts: state contracts govern capability behavior.

## 3. Core Concepts

| Concept | Definition |
| --- | --- |
| Workflow Instance | Isolated execution record for one application or career workflow. |
| State | Named point in the workflow with a contract defining allowed behavior. |
| Transition | Explicit movement from one state to another after conditions are satisfied. |
| Capability | Bounded function available in one or more states. |
| Approval Gate | Human-controlled checkpoint required before consequential progression. |
| Evidence | Verified or reviewable input used to justify analysis, generation, or transition. |
| Artifact | Produced output such as qualification report, JD analysis, resume strategy, draft, QA report, or debrief. |
| Terminal State | End state that closes the workflow instance. |
| Paused State | Non-terminal hold state caused by missing input, waiting, or human delay. |
| Failure State | Defined state entered when required conditions are not met. |
| Human Approval | Explicit human decision recorded before a gated transition. |
| Decision Record | Auditable record of a decision, its evidence, owner, timestamp, and result. |

## 4. Workflow Lifecycle

Standard lifecycle:

```text
Workflow Created
  ↓
State Active
  ↓
Waiting for Approval
  ↓
Approved
  ↓
Transition
  ↓
Next State
```

Additional lifecycle statuses:

| Status | Meaning |
| --- | --- |
| Paused | Workflow is intentionally waiting for input, evidence, or human action. |
| Cancelled | Workflow was stopped before completion by human decision. |
| Failed | Workflow cannot continue because required conditions failed. |
| Completed | Workflow reached a successful terminal state. |
| Closed | Workflow ended with any terminal outcome and no further action is expected. |

Conversation history is not workflow state. A conversation may discuss a workflow, but the Workflow Instance stores the execution state.

## 5. Workflow Instance Model

Every application creates an isolated Workflow Instance.

Example: `APP-2026-002`

The Workflow Instance contains:

| Field | Purpose |
| --- | --- |
| Workflow Instance ID | Unique identifier, usually matching or linking to the application ID. |
| Current State | One state from the state catalogue. |
| Current Status | Active, paused, waiting for approval, failed, completed, or closed. |
| Current Gate | Active approval gate if applicable. |
| Artifacts | Links to generated or attached artifacts. |
| Evidence | Evidence available for the current state. |
| History | Ordered state-transition history. |
| Approvals | Human approvals, rejections, and decision rationale. |
| Audit Log | Immutable transition and action log. |
| Failure Records | Structured failure reasons and recovery options. |
| Privacy Classification | Data handling classification for the instance. |

The Workflow Instance, not conversation memory, stores execution state.

Orchestrator execution loop:

```text
Load Workflow Instance
  ↓
Determine Current State
  ↓
Read State Contract
  ↓
Execute Allowed Capability
  ↓
Persist Updated Workflow Instance
  ↓
Exit
```

The Orchestrator is stateless. It must never rely on conversation history as system state.

## 6. Complete State Catalogue

| State ID | State Name | Type | Summary |
| --- | --- | --- | --- |
| S0 | Idle | Active | No workflow instance is active. |
| S1 | Opportunity Intake | Active | Capture opportunity details. |
| S2 | Qualification | Active | Evaluate role fit and Gate 1 readiness. |
| G1 | Gate 1 | Approval Gate | Human decision to proceed, reject, or hold opportunity. |
| S3 | JD Intelligence | Active | Analyze JD after Gate 1 pass. |
| G2 | Gate 2 | Approval Gate | Human approval to proceed with resume strategy. |
| S4 | Resume Strategy | Active | Recommend evidence-backed positioning. |
| G3 | Gate 3 | Approval Gate | Human approval of resume strategy. |
| S5 | Resume Assembly | Active | Assemble resume from verified evidence. |
| S6 | Resume QA | Active | Validate factuality, ATS, readability, and traceability. |
| G4 | Gate 4 | Approval Gate | Human approval of final resume/application package readiness. |
| S7 | Application Package Ready | Active | Approved materials ready for manual submission. |
| G5 | Gate 5 | Approval Gate | Human approval before external submission or communication. |
| S8 | Application Submitted | Active | Application has been manually submitted. |
| S9 | Recruiter Engagement | Active | Track recruiter or employer communication. |
| S10 | Interview Preparation | Active | Prepare for interview using verified evidence. |
| S11 | Interview Active | Active | Interview is scheduled, underway, or awaiting result. |
| S12 | Interview Debrief | Active | Capture privacy-safe learning after interview. |
| S13 | Offer Evaluation | Active | Evaluate explicit offer with human authority. |
| S14 | Closed | Terminal | Workflow ended without further action. |
| T1 | Rejected | Terminal | Explicit employer rejection recorded. |
| T2 | Withdrawn | Terminal | Human withdrew application. |
| T3 | Cancelled | Terminal | Workflow cancelled before submission or completion. |
| T4 | Offer Accepted | Terminal | Human accepted offer. |
| T5 | Offer Declined | Terminal | Human declined offer. |
| F1 | Failed | Failure | Workflow cannot proceed due to blocking condition. |
| P1 | Paused | Paused | Workflow is waiting for input, evidence, or human action. |

## 7. State Contract

Every state uses the same contract:

```text
State Name
Purpose
Entry Criteria
Required Inputs
Allowed Capabilities
Forbidden Capabilities
Produced Artifacts
Required Evidence
Human Approval Required
Exit Criteria
Failure Conditions
Next Valid States
```

### S0 Idle

| Contract Field | Definition |
| --- | --- |
| State Name | S0 Idle |
| Purpose | Represent no active workflow instance. |
| Entry Criteria | No workflow selected or prior workflow closed. |
| Required Inputs | None. |
| Allowed Capabilities | Career Intelligence read-only, workflow creation. |
| Forbidden Capabilities | JD Intelligence, Resume Strategy, Resume Assembly, Resume QA, Recruiter Communication, Interview Preparation, Interview Debrief. |
| Produced Artifacts | None unless a new workflow is created. |
| Required Evidence | None. |
| Human Approval Required | No. |
| Exit Criteria | Human starts or selects a Workflow Instance. |
| Failure Conditions | None. |
| Next Valid States | S1 Opportunity Intake, P1 Paused. |

### S1 Opportunity Intake

| Contract Field | Definition |
| --- | --- |
| State Name | S1 Opportunity Intake |
| Purpose | Capture opportunity, company, role, source, and initial context. |
| Entry Criteria | Workflow Instance created. |
| Required Inputs | Company, role title, source URL or reference, location/work model if available. |
| Allowed Capabilities | Qualification preparation, Career Intelligence read-only. |
| Forbidden Capabilities | JD Intelligence, Resume Strategy, Resume Assembly, Resume QA, Recruiter Communication, Interview Preparation, Interview Debrief. |
| Produced Artifacts | Opportunity intake artifact. |
| Required Evidence | Opportunity source or credible reference. |
| Human Approval Required | No. |
| Exit Criteria | Opportunity intake complete. |
| Failure Conditions | Missing source, duplicate opportunity, role not real. |
| Next Valid States | S2 Qualification, T3 Cancelled, F1 Failed, P1 Paused. |

### S2 Qualification

| Contract Field | Definition |
| --- | --- |
| State Name | S2 Qualification |
| Purpose | Evaluate whether the opportunity is worth pursuing. |
| Entry Criteria | Opportunity intake artifact exists. |
| Required Inputs | Opportunity details, role source, pilot/application criteria, duplicate check. |
| Allowed Capabilities | Qualification, Career Intelligence read-only. |
| Forbidden Capabilities | JD Intelligence before Gate 1 pass, Resume Strategy, Resume Assembly, Resume QA, Recruiter Communication, Interview Preparation, Interview Debrief. |
| Produced Artifacts | Qualification artifact and recommendation. |
| Required Evidence | Opportunity intake, role source, qualification rationale. |
| Human Approval Required | Yes, through G1. |
| Exit Criteria | Qualification recommendation prepared. |
| Failure Conditions | Role not in scope, missing JD, duplicate application, title-to-role-content mismatch, poor fit. |
| Next Valid States | G1 Gate 1, T3 Cancelled, F1 Failed, P1 Paused. |

### G1 Gate 1

| Contract Field | Definition |
| --- | --- |
| State Name | G1 Gate 1 |
| Purpose | Human approval to proceed beyond qualification. |
| Entry Criteria | Qualification artifact exists. |
| Required Inputs | Qualification recommendation and evidence. |
| Allowed Capabilities | Qualification review, Career Intelligence read-only. |
| Forbidden Capabilities | JD Intelligence unless Gate 1 passes; all resume generation capabilities. |
| Produced Artifacts | Gate 1 decision record. |
| Required Evidence | Opportunity intake and qualification rationale. |
| Human Approval Required | Yes. |
| Exit Criteria | Human records pass, fail, or hold. |
| Failure Conditions | No human decision, insufficient evidence. |
| Next Valid States | S3 JD Intelligence, S14 Closed, T3 Cancelled, P1 Paused. |

### S3 JD Intelligence

| Contract Field | Definition |
| --- | --- |
| State Name | S3 JD Intelligence |
| Purpose | Analyze job description, role shape, competencies, keywords, risks, and evidence fit. |
| Entry Criteria | Gate 1 passed. |
| Required Inputs | JD snapshot or stable JD text, source, qualification approval. |
| Allowed Capabilities | JD Intelligence, Career Intelligence read-only. |
| Forbidden Capabilities | Resume Assembly, Resume QA, Recruiter Communication, Interview Preparation, Interview Debrief. |
| Produced Artifacts | JD Intelligence output and report. |
| Required Evidence | Stable JD snapshot or approved JD input. |
| Human Approval Required | Yes, through G2 before strategy work proceeds. |
| Exit Criteria | JD Intelligence report complete. |
| Failure Conditions | Incomplete JD, unsupported mandatory requirements, unresolvable ambiguity. |
| Next Valid States | G2 Gate 2, F1 Failed, P1 Paused. |

### G2 Gate 2

| Contract Field | Definition |
| --- | --- |
| State Name | G2 Gate 2 |
| Purpose | Human approval to proceed from JD analysis to resume strategy. |
| Entry Criteria | JD Intelligence report exists. |
| Required Inputs | JD Intelligence report, gaps, risks, fit recommendation. |
| Allowed Capabilities | JD Intelligence review, Qualification review, Career Intelligence read-only. |
| Forbidden Capabilities | Resume Assembly, Recruiter Communication, Interview Preparation. |
| Produced Artifacts | Gate 2 decision record. |
| Required Evidence | JD Intelligence report and evidence-fit analysis. |
| Human Approval Required | Yes. |
| Exit Criteria | Human records pass, fail, or hold. |
| Failure Conditions | No decision, unresolved P0 gap, unsupported mandatory requirement. |
| Next Valid States | S4 Resume Strategy, S14 Closed, T3 Cancelled, P1 Paused. |

### S4 Resume Strategy

| Contract Field | Definition |
| --- | --- |
| State Name | S4 Resume Strategy |
| Purpose | Recommend evidence-backed positioning, headline, summary direction, achievements, skills, and Product OS proof. |
| Entry Criteria | Gate 2 passed. |
| Required Inputs | JD Intelligence report, verified evidence, role archetype, gaps. |
| Allowed Capabilities | Resume Strategy, Career Intelligence read-only. |
| Forbidden Capabilities | Resume Assembly until strategy is approved, Resume QA, Recruiter Communication, Interview Preparation. |
| Produced Artifacts | Resume strategy artifact. |
| Required Evidence | JD Intelligence output, canonical evidence, Product OS references. |
| Human Approval Required | Yes, through G3. |
| Exit Criteria | Strategy recommendation complete. |
| Failure Conditions | Strategy requires unsupported claims, inflated scope, or unverified facts. |
| Next Valid States | G3 Gate 3, F1 Failed, P1 Paused. |

### G3 Gate 3

| Contract Field | Definition |
| --- | --- |
| State Name | G3 Gate 3 |
| Purpose | Human approval of resume strategy before assembly. |
| Entry Criteria | Resume strategy artifact exists. |
| Required Inputs | Resume strategy, evidence map, gaps and mitigations. |
| Allowed Capabilities | Resume Strategy review, Career Intelligence read-only. |
| Forbidden Capabilities | Resume Assembly until approved; external communication. |
| Produced Artifacts | Gate 3 decision record. |
| Required Evidence | Strategy artifact and evidence references. |
| Human Approval Required | Yes. |
| Exit Criteria | Human records approve, revise, reject, or hold. |
| Failure Conditions | No human decision, unsupported strategy, missing evidence. |
| Next Valid States | S5 Resume Assembly, S4 Resume Strategy, S14 Closed, P1 Paused. |

### S5 Resume Assembly

| Contract Field | Definition |
| --- | --- |
| State Name | S5 Resume Assembly |
| Purpose | Assemble resume from approved strategy and verified evidence. |
| Entry Criteria | Gate 3 approved. |
| Required Inputs | Approved strategy, resume components, bullet library, evidence map. |
| Allowed Capabilities | Resume Assembly, Career Intelligence read-only. |
| Forbidden Capabilities | Recruiter Communication, Interview Preparation, external submission. |
| Produced Artifacts | Resume plan, resume draft, evidence map. |
| Required Evidence | Approved strategy and verified source evidence for every claim. |
| Human Approval Required | No at entry; required later through G4. |
| Exit Criteria | Resume draft and evidence map complete. |
| Failure Conditions | Untraceable bullet, unsupported claim, page-length blocker, missing component. |
| Next Valid States | S6 Resume QA, F1 Failed, P1 Paused. |

### S6 Resume QA

| Contract Field | Definition |
| --- | --- |
| State Name | S6 Resume QA |
| Purpose | Validate factuality, ATS compatibility, recruiter readability, hiring-manager relevance, links, and traceability. |
| Entry Criteria | Resume draft and evidence map exist. |
| Required Inputs | Resume draft, evidence map, JD Intelligence report, approved strategy. |
| Allowed Capabilities | Resume QA, Resume Assembly review, Career Intelligence read-only. |
| Forbidden Capabilities | External submission, Recruiter Communication unless package is approved, Interview Preparation. |
| Produced Artifacts | QA report and revised draft if needed. |
| Required Evidence | Resume draft, evidence map, link checks, QA criteria. |
| Human Approval Required | Yes, through G4. |
| Exit Criteria | QA result prepared. |
| Failure Conditions | Unsupported claims, broken links, ATS blocker, factual mismatch, privacy risk. |
| Next Valid States | G4 Gate 4, S5 Resume Assembly, F1 Failed, P1 Paused. |

### G4 Gate 4

| Contract Field | Definition |
| --- | --- |
| State Name | G4 Gate 4 |
| Purpose | Human approval that final application package is ready. |
| Entry Criteria | Resume QA report exists. |
| Required Inputs | QA report, final resume draft/export, evidence map, privacy review. |
| Allowed Capabilities | Resume QA review, Resume Assembly review, Career Intelligence read-only. |
| Forbidden Capabilities | External submission until approved; Recruiter Communication until package approval. |
| Produced Artifacts | Gate 4 decision record. |
| Required Evidence | QA pass, evidence map, final package artifacts. |
| Human Approval Required | Yes. |
| Exit Criteria | Human records approve, revise, reject, or hold. |
| Failure Conditions | QA fail, unsupported claim, privacy issue, missing final artifact. |
| Next Valid States | S7 Application Package Ready, S6 Resume QA, S14 Closed, P1 Paused. |

### S7 Application Package Ready

| Contract Field | Definition |
| --- | --- |
| State Name | S7 Application Package Ready |
| Purpose | Hold approved materials ready for manual external action. |
| Entry Criteria | Gate 4 approved. |
| Required Inputs | Approved application package. |
| Allowed Capabilities | Recruiter Communication drafting, Career Intelligence read-only. |
| Forbidden Capabilities | Autonomous submission, autonomous recruiter messaging, Interview Preparation before interview context exists. |
| Produced Artifacts | Application package record, optional draft message. |
| Required Evidence | Approved resume/package and submission context. |
| Human Approval Required | Yes, through G5 before external action. |
| Exit Criteria | Human approves manual submission or communication. |
| Failure Conditions | Package becomes stale, submission requirements change, privacy concern. |
| Next Valid States | G5 Gate 5, S6 Resume QA, T3 Cancelled, P1 Paused. |

### G5 Gate 5

| Contract Field | Definition |
| --- | --- |
| State Name | G5 Gate 5 |
| Purpose | Human approval before external submission or communication. |
| Entry Criteria | Application package ready. |
| Required Inputs | Application package, target external action, privacy review. |
| Allowed Capabilities | Application package review, Recruiter Communication draft review. |
| Forbidden Capabilities | Autonomous submission, autonomous message sending. |
| Produced Artifacts | Gate 5 decision record. |
| Required Evidence | Approved package, action target, privacy review. |
| Human Approval Required | Yes. |
| Exit Criteria | Human approves, rejects, or holds external action. |
| Failure Conditions | No human approval, target action unclear, privacy concern. |
| Next Valid States | S8 Application Submitted, S9 Recruiter Engagement, S7 Application Package Ready, T3 Cancelled, P1 Paused. |

### S8 Application Submitted

| Contract Field | Definition |
| --- | --- |
| State Name | S8 Application Submitted |
| Purpose | Track submitted application state after manual submission. |
| Entry Criteria | Gate 5 approved and human completed submission. |
| Required Inputs | Submission confirmation or submission record. |
| Allowed Capabilities | Recruiter Communication drafting, Career Intelligence read-only. |
| Forbidden Capabilities | Resume Assembly except through approved revision workflow; autonomous communication. |
| Produced Artifacts | Submission record, registry update. |
| Required Evidence | Submission date, channel, package reference. |
| Human Approval Required | No for tracking; yes for external follow-up. |
| Exit Criteria | Employer response, interview, rejection, withdrawal, or waiting state. |
| Failure Conditions | Missing submission evidence, registry inconsistency. |
| Next Valid States | S9 Recruiter Engagement, T1 Rejected, T2 Withdrawn, S14 Closed, P1 Paused. |

### S9 Recruiter Engagement

| Contract Field | Definition |
| --- | --- |
| State Name | S9 Recruiter Engagement |
| Purpose | Track recruiter or employer communication and draft human-approved responses. |
| Entry Criteria | Application submitted or recruiter interaction exists. |
| Required Inputs | Interaction context and application state. |
| Allowed Capabilities | Recruiter Communication, Career Intelligence read-only. |
| Forbidden Capabilities | Autonomous message sending, Interview Coaching without scheduled interview, Offer Evaluation without explicit offer. |
| Produced Artifacts | Interaction log, draft response, next action. |
| Required Evidence | Employer response or interaction record. |
| Human Approval Required | Yes before sending any message or accepting interview. |
| Exit Criteria | Interview scheduled, rejection recorded, withdrawal recorded, or waiting state set. |
| Failure Conditions | Ambiguous response, privacy-sensitive content, unapproved external action. |
| Next Valid States | S10 Interview Preparation, T1 Rejected, T2 Withdrawn, S14 Closed, P1 Paused. |

### S10 Interview Preparation

| Contract Field | Definition |
| --- | --- |
| State Name | S10 Interview Preparation |
| Purpose | Prepare evidence-backed interview stories, questions, and practice material. |
| Entry Criteria | Interview or substantive screen is scheduled or expected with sufficient context. |
| Required Inputs | Role context, resume package, JD Intelligence, interview stage. |
| Allowed Capabilities | Interview Preparation, Career Intelligence read-only. |
| Forbidden Capabilities | Resume Assembly unless formal revision workflow is opened; Offer Evaluation; autonomous communication. |
| Produced Artifacts | Interview prep plan, story bank, questions, practice prompts. |
| Required Evidence | Locked resume, JD Intelligence, application context. |
| Human Approval Required | No for preparation; yes for external messages or schedule decisions. |
| Exit Criteria | Interview prep complete or interview begins. |
| Failure Conditions | Missing interview context, confidential data risk, resume not locked. |
| Next Valid States | S11 Interview Active, S9 Recruiter Engagement, P1 Paused, F1 Failed. |

### S11 Interview Active

| Contract Field | Definition |
| --- | --- |
| State Name | S11 Interview Active |
| Purpose | Represent interview scheduled, active, completed, or awaiting explicit outcome. |
| Entry Criteria | Interview is scheduled or in progress. |
| Required Inputs | Interview stage, date, format, application context. |
| Allowed Capabilities | Interview Preparation read-only, Career Intelligence read-only. |
| Forbidden Capabilities | Interview Debrief before interview completion; Offer Evaluation without offer; storing confidential interview questions. |
| Produced Artifacts | Interview tracking record. |
| Required Evidence | Interview schedule or completion record. |
| Human Approval Required | Yes for schedule acceptance or changes. |
| Exit Criteria | Interview completed, cancelled, withdrawn, rejection, or offer. |
| Failure Conditions | Interview withdrawn, unclear status, confidential content risk. |
| Next Valid States | S12 Interview Debrief, S9 Recruiter Engagement, S13 Offer Evaluation, T1 Rejected, T2 Withdrawn, P1 Paused. |

### S12 Interview Debrief

| Contract Field | Definition |
| --- | --- |
| State Name | S12 Interview Debrief |
| Purpose | Capture privacy-safe interview learning and next actions. |
| Entry Criteria | Interview completed. |
| Required Inputs | Interview tracking record and privacy-safe user reflection. |
| Allowed Capabilities | Interview Debrief, Career Intelligence update proposal. |
| Forbidden Capabilities | Storing confidential interview questions, autonomous follow-up messaging, Offer Evaluation without offer. |
| Produced Artifacts | Debrief, learning notes, follow-up draft if requested. |
| Required Evidence | Interview completion and user-approved debrief notes. |
| Human Approval Required | Yes before persisting new facts or sending follow-up. |
| Exit Criteria | Learning captured and next action set. |
| Failure Conditions | Confidential content risk, unsupported interpretation, missing outcome state. |
| Next Valid States | S9 Recruiter Engagement, S13 Offer Evaluation, T1 Rejected, T2 Withdrawn, P1 Paused, S14 Closed. |

### S13 Offer Evaluation

| Contract Field | Definition |
| --- | --- |
| State Name | S13 Offer Evaluation |
| Purpose | Evaluate explicit offer information for human decision support. |
| Entry Criteria | Explicit offer exists. |
| Required Inputs | Offer details, constraints, preferences, risk factors. |
| Allowed Capabilities | Career Intelligence read-only, offer analysis support. |
| Forbidden Capabilities | Autonomous acceptance, rejection, negotiation, or external communication. |
| Produced Artifacts | Offer evaluation summary and decision options. |
| Required Evidence | Explicit offer information and user-provided preferences. |
| Human Approval Required | Yes for any offer decision or communication. |
| Exit Criteria | Human accepts, declines, negotiates manually, or pauses. |
| Failure Conditions | Missing offer details, privacy risk, inferred offer. |
| Next Valid States | T4 Offer Accepted, T5 Offer Declined, S9 Recruiter Engagement, P1 Paused. |

### S14 Closed

| Contract Field | Definition |
| --- | --- |
| State Name | S14 Closed |
| Purpose | Close workflow with no further action expected. |
| Entry Criteria | Human closes workflow or terminal state has been reached. |
| Required Inputs | Closure reason. |
| Allowed Capabilities | Career Intelligence read-only, audit review. |
| Forbidden Capabilities | All generation and external-action capabilities. |
| Produced Artifacts | Closure record. |
| Required Evidence | Decision record, terminal outcome, or closure rationale. |
| Human Approval Required | Yes if closure is voluntary. |
| Exit Criteria | Workflow marked closed. |
| Failure Conditions | Missing closure reason. |
| Next Valid States | None. |

### Terminal States

| Contract Field | T1 Rejected | T2 Withdrawn | T3 Cancelled | T4 Offer Accepted | T5 Offer Declined |
| --- | --- | --- | --- | --- | --- |
| State Name | T1 Rejected | T2 Withdrawn | T3 Cancelled | T4 Offer Accepted | T5 Offer Declined |
| Purpose | Employer rejection recorded. | Human withdrawal recorded. | Workflow cancelled before completion. | Offer accepted by human. | Offer declined by human. |
| Entry Criteria | Explicit rejection exists. | Human withdrawal decision exists. | Human cancellation or unrecoverable pre-submission stop. | Explicit human acceptance. | Explicit human decline. |
| Required Inputs | Rejection record. | Withdrawal reason. | Cancellation reason. | Offer and acceptance record. | Offer and decline record. |
| Allowed Capabilities | Audit review, Career Intelligence learning proposal. | Audit review, Career Intelligence learning proposal. | Audit review. | Audit review, Career Intelligence learning proposal. | Audit review, Career Intelligence learning proposal. |
| Forbidden Capabilities | Generation, submission, external communication. | Generation, submission, external communication. | Generation, submission, external communication. | Generation, submission, external communication. | Generation, submission, external communication. |
| Produced Artifacts | Terminal outcome record. | Terminal outcome record. | Cancellation record. | Terminal outcome record. | Terminal outcome record. |
| Required Evidence | Explicit employer response. | Human decision. | Human decision or failure record. | Explicit offer and human approval. | Explicit offer and human approval. |
| Human Approval Required | No if explicit employer rejection; yes to close. | Yes. | Yes. | Yes. | Yes. |
| Exit Criteria | Workflow closed. | Workflow closed. | Workflow closed. | Workflow closed. | Workflow closed. |
| Failure Conditions | Rejection inferred from silence. | Missing withdrawal reason. | Missing cancellation reason. | Acceptance not human-approved. | Decline not human-approved. |
| Next Valid States | S14 Closed. | S14 Closed. | S14 Closed. | S14 Closed. | S14 Closed. |

### P1 Paused

| Contract Field | Definition |
| --- | --- |
| State Name | P1 Paused |
| Purpose | Hold workflow while waiting for input, evidence, approval, or external response. |
| Entry Criteria | Current state cannot progress but is not failed or terminal. |
| Required Inputs | Pause reason and return state. |
| Allowed Capabilities | Read-only review, evidence intake, Career Intelligence read-only. |
| Forbidden Capabilities | Generation beyond current approved state, hidden transition. |
| Produced Artifacts | Pause record. |
| Required Evidence | Pause reason. |
| Human Approval Required | Depends on return state. |
| Exit Criteria | Missing input or approval arrives. |
| Failure Conditions | No return state, stale pause without review. |
| Next Valid States | Return to prior valid active state, F1 Failed, T3 Cancelled. |

### F1 Failed

| Contract Field | Definition |
| --- | --- |
| State Name | F1 Failed |
| Purpose | Stop workflow due to blocking error or unmet condition. |
| Entry Criteria | Required condition fails and no safe progression exists. |
| Required Inputs | Failure reason and source state. |
| Allowed Capabilities | Failure review, evidence intake, audit review. |
| Forbidden Capabilities | Hidden retries, generation, external action. |
| Produced Artifacts | Failure record. |
| Required Evidence | Failure trigger and affected artifacts. |
| Human Approval Required | Yes to recover, cancel, or close. |
| Exit Criteria | Human chooses recover, cancel, or close. |
| Failure Conditions | Missing failure reason. |
| Next Valid States | Prior recoverable state, T3 Cancelled, S14 Closed. |

## 8. Transition Rules

| From | To | Rule |
| --- | --- | --- |
| S0 Idle | S1 Opportunity Intake | Human starts a new Workflow Instance. |
| S1 Opportunity Intake | S2 Qualification | Opportunity intake artifact is complete. |
| S2 Qualification | G1 Gate 1 | Qualification recommendation is prepared. |
| G1 Gate 1 | S3 JD Intelligence | Gate 1 decision is PASS. |
| G1 Gate 1 | S14 Closed | Gate 1 decision is FAIL and disposition is closed. |
| G1 Gate 1 | P1 Paused | Gate 1 decision is HOLD. |
| S3 JD Intelligence | G2 Gate 2 | JD Intelligence report is complete. |
| G2 Gate 2 | S4 Resume Strategy | Gate 2 decision is PASS. |
| G2 Gate 2 | S14 Closed | Gate 2 decision is FAIL and application is not pursued. |
| G2 Gate 2 | P1 Paused | Gate 2 decision is HOLD. |
| S4 Resume Strategy | G3 Gate 3 | Resume strategy is prepared. |
| G3 Gate 3 | S5 Resume Assembly | Strategy is approved. |
| G3 Gate 3 | S4 Resume Strategy | Strategy requires revision. |
| G3 Gate 3 | S14 Closed | Strategy is rejected and workflow closed. |
| S5 Resume Assembly | S6 Resume QA | Resume draft and evidence map are complete. |
| S6 Resume QA | G4 Gate 4 | QA report is complete. |
| S6 Resume QA | S5 Resume Assembly | QA requires revision. |
| G4 Gate 4 | S7 Application Package Ready | QA/package approved. |
| G4 Gate 4 | S6 Resume QA | Package requires QA revision. |
| G4 Gate 4 | S14 Closed | Package rejected and workflow closed. |
| S7 Application Package Ready | G5 Gate 5 | Human is asked to approve external submission or communication. |
| G5 Gate 5 | S8 Application Submitted | Human approves and manually submits application. |
| G5 Gate 5 | S9 Recruiter Engagement | Human approves recruiter communication path. |
| G5 Gate 5 | S7 Application Package Ready | Human holds or requests change without returning to QA. |
| G5 Gate 5 | T3 Cancelled | Human cancels. |
| S8 Application Submitted | S9 Recruiter Engagement | Employer or recruiter response exists. |
| S8 Application Submitted | T1 Rejected | Explicit employer rejection exists. |
| S8 Application Submitted | T2 Withdrawn | Human withdraws. |
| S9 Recruiter Engagement | S10 Interview Preparation | Interview or substantive screen is scheduled. |
| S9 Recruiter Engagement | T1 Rejected | Explicit employer rejection exists. |
| S9 Recruiter Engagement | T2 Withdrawn | Human withdraws. |
| S10 Interview Preparation | S11 Interview Active | Interview begins or enters active tracking. |
| S11 Interview Active | S12 Interview Debrief | Interview is completed. |
| S11 Interview Active | S13 Offer Evaluation | Explicit offer exists. |
| S11 Interview Active | T1 Rejected | Explicit employer rejection exists. |
| S11 Interview Active | T2 Withdrawn | Human withdraws. |
| S12 Interview Debrief | S9 Recruiter Engagement | Follow-up or next recruiter interaction is needed. |
| S12 Interview Debrief | S13 Offer Evaluation | Explicit offer exists. |
| S12 Interview Debrief | T1 Rejected | Explicit employer rejection exists. |
| S12 Interview Debrief | T2 Withdrawn | Human withdraws. |
| S12 Interview Debrief | S14 Closed | No further action remains. |
| S13 Offer Evaluation | T4 Offer Accepted | Human accepts explicit offer. |
| S13 Offer Evaluation | T5 Offer Declined | Human declines explicit offer. |
| S13 Offer Evaluation | S9 Recruiter Engagement | Human chooses manual negotiation or follow-up. |
| T1 Rejected | S14 Closed | Terminal record is complete. |
| T2 Withdrawn | S14 Closed | Terminal record is complete. |
| T3 Cancelled | S14 Closed | Terminal record is complete. |
| T4 Offer Accepted | S14 Closed | Terminal record is complete. |
| T5 Offer Declined | S14 Closed | Terminal record is complete. |
| Any active state | P1 Paused | Required input, evidence, or approval is missing. |
| Any active state | F1 Failed | Blocking condition prevents safe continuation. |
| P1 Paused | Prior valid state | Missing input or approval is supplied. |
| F1 Failed | Prior recoverable state | Human approves recovery and failure is resolved. |
| F1 Failed | T3 Cancelled | Human cancels failed workflow. |
| F1 Failed | S14 Closed | Human closes failed workflow. |

No undefined transitions are valid.

Circular transitions are allowed only for explicit revision loops:

- G3 Gate 3 to S4 Resume Strategy.
- S6 Resume QA to S5 Resume Assembly.
- G4 Gate 4 to S6 Resume QA.
- S13 Offer Evaluation to S9 Recruiter Engagement for human-led follow-up.

## 9. Approval Gates

| Gate | Purpose | Owner | Required Evidence | Decision Options | Valid Outcomes | Resulting Transition |
| --- | --- | --- | --- | --- | --- | --- |
| Gate 1 | Decide whether to pursue opportunity. | Human user | Opportunity intake, qualification rationale. | Pass, fail, hold. | Proceed, close, pause. | G1 to S3, S14, or P1. |
| Gate 2 | Decide whether JD Intelligence supports resume strategy work. | Human user | JD Intelligence report, gaps, risks, fit evidence. | Pass, fail, hold. | Proceed, close, pause. | G2 to S4, S14, or P1. |
| Gate 3 | Approve resume strategy before assembly. | Human user | Strategy artifact, evidence mapping, known gaps. | Approve, revise, reject, hold. | Assemble, revise, close, pause. | G3 to S5, S4, S14, or P1. |
| Gate 4 | Approve final package readiness after QA. | Human user | QA report, evidence map, privacy review, final package. | Approve, revise, reject, hold. | Package ready, revise QA, close, pause. | G4 to S7, S6, S14, or P1. |
| Gate 5 | Approve external submission or communication. | Human user | Approved package, target action, privacy review. | Approve, revise, cancel, hold. | Submitted, recruiter engagement, package ready, cancelled, paused. | G5 to S8, S9, S7, T3, or P1. |

## 10. Capability Availability Matrix

Legend:

- Allowed: capability may execute and produce artifacts.
- Read Only: capability may inspect or summarize but not change state or produce final artifacts.
- Forbidden: capability must not execute in this state.

| State | Qualification | JD Intelligence | Resume Strategy | Resume Assembly | Resume QA | Recruiter Communication | Interview Preparation | Interview Debrief | Career Intelligence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S0 Idle | Forbidden | Forbidden | Forbidden | Forbidden | Forbidden | Forbidden | Forbidden | Forbidden | Read Only |
| S1 Opportunity Intake | Read Only | Forbidden | Forbidden | Forbidden | Forbidden | Forbidden | Forbidden | Forbidden | Read Only |
| S2 Qualification | Allowed | Forbidden | Forbidden | Forbidden | Forbidden | Forbidden | Forbidden | Forbidden | Read Only |
| G1 Gate 1 | Read Only | Forbidden | Forbidden | Forbidden | Forbidden | Forbidden | Forbidden | Forbidden | Read Only |
| S3 JD Intelligence | Read Only | Allowed | Forbidden | Forbidden | Forbidden | Forbidden | Forbidden | Forbidden | Read Only |
| G2 Gate 2 | Read Only | Read Only | Forbidden | Forbidden | Forbidden | Forbidden | Forbidden | Forbidden | Read Only |
| S4 Resume Strategy | Read Only | Read Only | Allowed | Forbidden | Forbidden | Forbidden | Forbidden | Forbidden | Read Only |
| G3 Gate 3 | Read Only | Read Only | Read Only | Forbidden | Forbidden | Forbidden | Forbidden | Forbidden | Read Only |
| S5 Resume Assembly | Read Only | Read Only | Read Only | Allowed | Forbidden | Forbidden | Forbidden | Forbidden | Read Only |
| S6 Resume QA | Read Only | Read Only | Read Only | Read Only | Allowed | Forbidden | Forbidden | Forbidden | Read Only |
| G4 Gate 4 | Read Only | Read Only | Read Only | Read Only | Read Only | Forbidden | Forbidden | Forbidden | Read Only |
| S7 Application Package Ready | Read Only | Read Only | Read Only | Read Only | Read Only | Allowed | Forbidden | Forbidden | Read Only |
| G5 Gate 5 | Read Only | Read Only | Read Only | Read Only | Read Only | Read Only | Forbidden | Forbidden | Read Only |
| S8 Application Submitted | Read Only | Read Only | Read Only | Forbidden | Forbidden | Allowed | Forbidden | Forbidden | Read Only |
| S9 Recruiter Engagement | Read Only | Read Only | Read Only | Forbidden | Forbidden | Allowed | Forbidden | Forbidden | Read Only |
| S10 Interview Preparation | Read Only | Read Only | Read Only | Forbidden | Forbidden | Read Only | Allowed | Forbidden | Read Only |
| S11 Interview Active | Read Only | Read Only | Read Only | Forbidden | Forbidden | Read Only | Read Only | Forbidden | Read Only |
| S12 Interview Debrief | Read Only | Read Only | Read Only | Forbidden | Forbidden | Read Only | Read Only | Allowed | Read Only |
| S13 Offer Evaluation | Read Only | Read Only | Read Only | Forbidden | Forbidden | Read Only | Read Only | Read Only | Read Only |
| S14 Closed | Forbidden | Forbidden | Forbidden | Forbidden | Forbidden | Forbidden | Forbidden | Forbidden | Read Only |
| Terminal States | Forbidden | Forbidden | Forbidden | Forbidden | Forbidden | Forbidden | Forbidden | Forbidden | Read Only |
| P1 Paused | Read Only | Read Only | Read Only | Forbidden unless return state allows | Forbidden unless return state allows | Forbidden unless return state allows | Forbidden unless return state allows | Forbidden unless return state allows | Read Only |
| F1 Failed | Read Only | Read Only | Read Only | Forbidden | Forbidden | Forbidden | Forbidden | Forbidden | Read Only |

## 11. Failure Model

| Failure | Detection | Required State | Recovery |
| --- | --- | --- | --- |
| Missing evidence | Required evidence absent. | P1 Paused or F1 Failed. | Provide evidence, return to prior valid state, or cancel. |
| Failed QA | QA report fails factuality, ATS, links, privacy, or traceability. | S5 Resume Assembly or F1 Failed. | Revise assembly or cancel. |
| Rejected Gate | Human rejects at approval gate. | S14 Closed or prior revision state. | Close or revise only if transition allows. |
| Cancelled application | Human cancels workflow. | T3 Cancelled. | Close workflow. |
| Incomplete JD | JD lacks required role information. | P1 Paused or F1 Failed. | Provide complete JD or cancel. |
| Unsupported claims | Claim lacks verified evidence. | S5 Resume Assembly, S6 Resume QA, or F1 Failed. | Remove claim, provide evidence, or cancel. |
| Interview withdrawn | Interview is cancelled or withdrawn. | S9 Recruiter Engagement, T2 Withdrawn, or S14 Closed. | Record explicit state and next action. |
| Recruiter ghosting | No response after defined waiting period. | P1 Paused. | Keep waiting, follow up with human approval, withdraw, or close. |
| Privacy risk | Private data exposure risk detected. | F1 Failed. | Stop, review, remediate, and require human approval. |
| Undefined action request | Requested action not allowed in current state. | Current state remains unchanged. | Explain forbidden action and list valid actions. |

Every failure must transition into a defined workflow state. No undefined failures are valid.

## 12. State Invariants

| State | Invariant |
| --- | --- |
| S0 Idle | No active workflow action may occur without selecting or creating a Workflow Instance. |
| S1 Opportunity Intake | Resume generation is prohibited. |
| S2 Qualification | JD Intelligence and resume generation are prohibited before Gate 1 pass. |
| G1 Gate 1 | Human decision is required before proceeding. |
| S3 JD Intelligence | Stable JD input is required. |
| G2 Gate 2 | Human decision is required before Resume Strategy. |
| S4 Resume Strategy | Strategy must use verified evidence or explicitly labeled gaps. |
| G3 Gate 3 | Resume Assembly is prohibited before strategy approval. |
| S5 Resume Assembly | Every bullet references verified evidence. |
| S6 Resume QA | No unsupported claims may pass. |
| G4 Gate 4 | Final package cannot proceed without human approval. |
| S7 Application Package Ready | External submission remains manual. |
| G5 Gate 5 | No external action occurs without human approval. |
| S8 Application Submitted | Submission must have been performed by a human. |
| S9 Recruiter Engagement | Messages may be drafted but not sent autonomously. |
| S10 Interview Preparation | Resume is locked unless a formal revision workflow is opened. |
| S11 Interview Active | Confidential interview content must not be stored. |
| S12 Interview Debrief | Learning is privacy-safe and distinguishes fact from interpretation. |
| S13 Offer Evaluation | Offer decisions are human-only. |
| S14 Closed | No generation or external-action capability is available. |
| Terminal States | Terminal outcome cannot silently reopen workflow. |
| P1 Paused | Return state must be known. |
| F1 Failed | Failure reason must be recorded. |

## 13. Audit Requirements

Every transition must record:

- Timestamp.
- Previous State.
- Next State.
- Trigger.
- Decision.
- Human Approval.
- Artifacts Created.
- Evidence Used.
- Actor.
- Reason.

Audit rules:

- No silent transitions.
- No transition without source and destination state.
- No approval gate result without human owner.
- No generated artifact without source evidence.
- No recovery from failure without decision record.
- Audit history is immutable.

## 14. Extension Rules

Future capabilities must not be added ad hoc.

Extension process:

```text
Capability Proposal
  ↓
Capability Contract
  ↓
Workflow Mapping
  ↓
Evidence Mapping
  ↓
Approval Requirements
  ↓
Validation
  ↓
Release
```

Every new capability must define:

- States where it is allowed.
- States where it is read-only.
- States where it is forbidden.
- Required evidence.
- Produced artifacts.
- Approval requirements.
- Failure behavior.
- Audit events.
- Privacy handling.

If a capability cannot be mapped to the state machine, it cannot be implemented.

## 15. Architectural Principles

- Workflow controls capabilities.
- Capabilities never control workflow.
- Workflow contracts are stable.
- Capabilities are replaceable.
- Orchestrator is stateless.
- Workflow Instance stores execution state.
- Conversation history is not system state.
- Evidence precedes generation.
- Human approval precedes consequential actions.
- Private data remains private.
- Audit history is immutable.
- Undefined transitions are forbidden.
- Failure-safe stopping is mandatory.
- Future agents must conform to the Workflow State Machine.

