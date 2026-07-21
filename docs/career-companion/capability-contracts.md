# Career Companion Capability Contracts

## 1. Purpose

Capability Contracts define the contractual interface between the Career Companion Workflow State Machine, the Orchestrator, and individual capabilities.

The contracts exist to separate workflow from implementation. The Workflow State Machine determines current state, allowed behavior, evidence requirements, approval requirements, and next valid states. Capabilities perform bounded work inside that contract.

Capability implementations may change over time. A capability may eventually be implemented with GPT, Claude, Gemini, local models, traditional software, or future AI systems. The contract must remain implementation independent.

Capability Contracts improve maintainability by making each capability:

- Replaceable without changing workflow semantics.
- Testable against stable inputs and outputs.
- Auditable through consistent execution records.
- Constrained by evidence, approvals, and state.
- Safe to evolve without bypassing Career OS governance.

## 2. Design Principles

- Capabilities are stateless.
- Capabilities are replaceable.
- Capabilities never control workflow.
- Workflow controls capabilities.
- Capabilities consume artifacts.
- Capabilities produce artifacts.
- Evidence precedes generation.
- Human approval precedes consequential actions.
- Capabilities never invent facts.
- Capabilities return structured outputs.
- Capabilities remain deterministic where practical.
- Capabilities do not transition workflow state.
- Capabilities do not modify approvals.
- Capabilities do not communicate externally.
- Capabilities fail closed when required evidence is missing.

## 3. Capability Model

| Concept | Definition |
| --- | --- |
| Capability | Bounded unit of work available only in approved workflow states. |
| Capability Contract | Stable specification defining what a capability is allowed to do. |
| Capability Execution | One invocation of a capability by the Orchestrator. |
| Capability Result | Structured result returned to the Orchestrator. |
| Capability Input | State-approved artifacts, evidence, and parameters supplied by the Orchestrator. |
| Capability Output | Structured recommendation, draft, review, or analysis produced by the capability. |
| Capability Failure | Defined inability to complete because evidence, state, approval, or safety requirements are not met. |
| Capability Version | Version identifier for contract and implementation traceability. |
| Capability Owner | Accountable owner for capability behavior and contract compliance. |
| Capability Maturity | Lifecycle maturity from concept to production readiness. |
| Capability Lifecycle | Execution lifecycle from request through returned result. |

## 4. Capability Inventory

| Capability ID | Capability Name | Domain | Primary Purpose |
| --- | --- | --- | --- |
| CAP-001 | Qualification | Core Workflow | Recommend proceed, reject, or hold for an opportunity. |
| CAP-002 | JD Intelligence | Core Workflow | Analyze job description structure, role shape, competencies, and gaps. |
| CAP-003 | Resume Strategy | Core Workflow | Recommend evidence-backed resume positioning. |
| CAP-004 | Resume Assembly | Core Workflow | Assemble approved resume components from verified evidence. |
| CAP-005 | Resume QA | Core Workflow | Validate factuality, relevance, ATS readiness, and traceability. |
| CAP-006 | Recruiter Communication | Recruiter | Draft and review recruiter communication for human approval. |
| CAP-007 | Interview Preparation | Interview | Prepare evidence-backed interview material. |
| CAP-008 | Interview Coaching | Interview | Conduct practice interactions and coaching feedback. |
| CAP-009 | Interview Debrief | Interview | Capture privacy-safe interview learning. |
| CAP-010 | Career Intelligence | Intelligence | Provide read-only career context and learning proposals. |

## 5. Common Capability Contract

Every capability must use exactly this structure:

```text
Capability ID
Capability Name
Purpose
Responsibilities
Owner
Version
Current Maturity Level
Allowed Workflow States
Forbidden Workflow States
Entry Criteria
Required Inputs
Optional Inputs
Required Evidence
Produced Outputs
Output Artifacts
Side Effects
Forbidden Actions
Human Approval Required
Failure Modes
Recovery Strategy
Audit Requirements
Success Criteria
Future Extension Points
```

### CAP-001 Qualification

| Contract Field | Definition |
| --- | --- |
| Capability ID | CAP-001 |
| Capability Name | Qualification |
| Purpose | Evaluate whether an opportunity should proceed, be rejected, or be held. |
| Responsibilities | Compare opportunity details against Career OS scope, role fit, duplicate status, location/work model, and strategic fit. |
| Owner | Career Companion Product Owner |
| Version | v0.1 |
| Current Maturity Level | L1 Specification |
| Allowed Workflow States | S2 Qualification; G1 Gate 1 as Read Only. |
| Forbidden Workflow States | S0, S1, S3, G2, S4, G3, S5, S6, G4, S7, G5, S8, S9, S10, S11, S12, S13, S14, T1, T2, T3, T4, T5, F1 except failure review, P1 except return-state review. |
| Entry Criteria | Opportunity intake artifact exists. |
| Required Inputs | Company, role title, source, location/work model, duplicate check, pilot or application scope. |
| Optional Inputs | Requisition ID, posting date, compensation availability, referral context, preliminary role-shape notes. |
| Required Evidence | Opportunity source or credible reference and qualification criteria. |
| Produced Outputs | Qualification recommendation: proceed, reject, or hold; rationale; risks; evidence gaps. |
| Output Artifacts | Qualification artifact and Gate 1 evidence packet. |
| Side Effects | None. |
| Forbidden Actions | Run JD Intelligence, generate resume strategy, assemble resume, submit application, infer unavailable facts. |
| Human Approval Required | Yes for Gate 1 progression. |
| Failure Modes | Missing role source, duplicate application, insufficient role information, unsupported fit recommendation. |
| Recovery Strategy | Pause for missing evidence, reject with rationale, or return to Opportunity Intake. |
| Audit Requirements | Record workflow instance, inputs, evidence references, recommendation, rationale, actor, timestamp, and Gate 1 readiness. |
| Success Criteria | Recommendation is explainable, evidence-backed, and ready for human Gate 1 decision. |
| Future Extension Points | Title-versus-role-shape detection, role-fit scoring, recurring mismatch signals. |

### CAP-002 JD Intelligence

| Contract Field | Definition |
| --- | --- |
| Capability ID | CAP-002 |
| Capability Name | JD Intelligence |
| Purpose | Analyze a job description after Gate 1 approval. |
| Responsibilities | Extract role metadata, responsibilities, competencies, keywords, hidden signals, risks, gaps, and evidence-fit implications. |
| Owner | Career Companion Product Owner |
| Version | v0.1 |
| Current Maturity Level | L1 Specification |
| Allowed Workflow States | S3 JD Intelligence; G2 Gate 2 as Read Only. |
| Forbidden Workflow States | S0, S1, S2, G1, S4, G3, S5, S6, G4, S7, G5, S8, S9, S10, S11, S12, S13, S14, T1, T2, T3, T4, T5, F1 except failure review, P1 except return-state review. |
| Entry Criteria | Gate 1 decision is PASS and stable JD input exists. |
| Required Inputs | JD snapshot or stable JD text, source context, Gate 1 decision record, workflow instance. |
| Optional Inputs | Company context, posting date, requisition ID, known application constraints. |
| Required Evidence | Stable JD source and Gate 1 approval. |
| Produced Outputs | JD Intelligence report, role archetype, competencies, keywords, hidden signals, evidence gaps, risks. |
| Output Artifacts | JD Intelligence output and analysis report. |
| Side Effects | None. |
| Forbidden Actions | Generate resume, approve strategy, infer unstated compensation, infer employer intent as fact, modify workflow state. |
| Human Approval Required | Yes for Gate 2 progression. |
| Failure Modes | Missing JD, incomplete JD, unsupported mandatory requirement, ambiguous role shape. |
| Recovery Strategy | Pause for JD clarification, return to Qualification review, or fail closed. |
| Audit Requirements | Record JD source, inputs, evidence, extracted signals, risks, outputs, actor, timestamp, and Gate 2 readiness. |
| Success Criteria | Report is structured, explainable, and sufficient for human decision on strategy work. |
| Future Extension Points | Multi-JD comparison, company-context enrichment, requirement severity calibration. |

### CAP-003 Resume Strategy

| Contract Field | Definition |
| --- | --- |
| Capability ID | CAP-003 |
| Capability Name | Resume Strategy |
| Purpose | Recommend evidence-backed resume positioning. |
| Responsibilities | Select positioning, headline direction, summary direction, achievement emphasis, skills ordering, and Product OS proof strategy. |
| Owner | Career Companion Product Owner |
| Version | v0.1 |
| Current Maturity Level | L1 Specification |
| Allowed Workflow States | S4 Resume Strategy; G3 Gate 3 as Read Only. |
| Forbidden Workflow States | S0, S1, S2, G1, S3, G2, S5, S6, G4, S7, G5, S8, S9, S10, S11, S12, S13, S14, T1, T2, T3, T4, T5, F1 except failure review, P1 except return-state review. |
| Entry Criteria | Gate 2 decision is PASS and JD Intelligence report exists. |
| Required Inputs | JD Intelligence report, verified evidence index, role archetype, gap analysis, Career OS evidence references. |
| Optional Inputs | Human preferences, page-length constraints, known resume variant history. |
| Required Evidence | Verified Career OS evidence and JD Intelligence output. |
| Produced Outputs | Resume strategy recommendation, evidence selection, positioning rationale, risk notes. |
| Output Artifacts | Resume strategy artifact and Gate 3 evidence packet. |
| Side Effects | None. |
| Forbidden Actions | Assemble resume before strategy approval, invent metrics, modify career facts, approve unsupported claims. |
| Human Approval Required | Yes for Gate 3 progression. |
| Failure Modes | Unsupported positioning, insufficient evidence, strategy depends on unverifiable claims. |
| Recovery Strategy | Revise strategy, remove unsupported claims, pause for evidence, or close workflow. |
| Audit Requirements | Record selected evidence, rejected alternatives where material, risks, rationale, actor, timestamp, and Gate 3 readiness. |
| Success Criteria | Strategy is evidence-backed, role-relevant, and ready for human approval. |
| Future Extension Points | Strategy scoring, variant comparison, historical performance signals. |

### CAP-004 Resume Assembly

| Contract Field | Definition |
| --- | --- |
| Capability ID | CAP-004 |
| Capability Name | Resume Assembly |
| Purpose | Assemble resume content from approved strategy and verified evidence. |
| Responsibilities | Select approved components, bullets, skills, links, and sections without modifying canonical facts. |
| Owner | Career Companion Product Owner |
| Version | v0.1 |
| Current Maturity Level | L1 Specification |
| Allowed Workflow States | S5 Resume Assembly; S6 Resume QA as Read Only for revision context. |
| Forbidden Workflow States | S0, S1, S2, G1, S3, G2, S4, G3 before approval, G4, S7, G5, S8, S9, S10, S11, S12, S13, S14, T1, T2, T3, T4, T5, F1 except failure review, P1 except return-state review. |
| Entry Criteria | Gate 3 approved and resume strategy artifact exists. |
| Required Inputs | Approved strategy, component library, bullet library, canonical evidence, page constraints. |
| Optional Inputs | Human formatting preferences, prior approved variants, target export constraints. |
| Required Evidence | Verified source evidence for every selected claim. |
| Produced Outputs | Resume plan, resume draft, evidence map. |
| Output Artifacts | Resume assembly artifact, draft resume artifact, evidence map. |
| Side Effects | None. |
| Forbidden Actions | Rewrite canonical facts, invent bullets, fabricate metrics, change titles/dates, submit application. |
| Human Approval Required | Required later through Gate 4 after Resume QA. |
| Failure Modes | Missing evidence, orphan bullet, page-length overflow, unsupported claim, component unavailable. |
| Recovery Strategy | Return to strategy, remove unsupported content, pause for evidence, or fail closed. |
| Audit Requirements | Record selected components, evidence IDs, draft outputs, excluded claims, actor, timestamp, and QA readiness. |
| Success Criteria | Draft is complete, traceable, and ready for Resume QA. |
| Future Extension Points | Layout variants, export-aware assembly, component performance feedback. |

### CAP-005 Resume QA

| Contract Field | Definition |
| --- | --- |
| Capability ID | CAP-005 |
| Capability Name | Resume QA |
| Purpose | Validate resume quality, factuality, and readiness before external use. |
| Responsibilities | Check factual accuracy, evidence coverage, ATS compatibility, recruiter readability, hiring-manager relevance, links, and unsupported claims. |
| Owner | Career Companion Product Owner |
| Version | v0.1 |
| Current Maturity Level | L1 Specification |
| Allowed Workflow States | S6 Resume QA; G4 Gate 4 as Read Only. |
| Forbidden Workflow States | S0, S1, S2, G1, S3, G2, S4, G3, S5 except read-only input, S7 before Gate 4 approval, G5, S8, S9, S10, S11, S12, S13, S14, T1, T2, T3, T4, T5, F1 except failure review, P1 except return-state review. |
| Entry Criteria | Resume draft and evidence map exist. |
| Required Inputs | Resume draft, evidence map, JD Intelligence report, approved strategy, QA criteria. |
| Optional Inputs | Export preview, ATS scan result, human reviewer notes. |
| Required Evidence | Draft content, evidence references, link references, strategy artifact. |
| Produced Outputs | QA report, pass/fail/revise recommendation, issue list, Gate 4 readiness. |
| Output Artifacts | Resume QA artifact and Gate 4 evidence packet. |
| Side Effects | None. |
| Forbidden Actions | Approve final output autonomously, modify facts, hide unsupported claims, submit application. |
| Human Approval Required | Yes for Gate 4 progression. |
| Failure Modes | Unsupported claim, factual mismatch, broken link, ATS blocker, privacy issue. |
| Recovery Strategy | Return to Resume Assembly, pause for evidence, remove claim, or fail closed. |
| Audit Requirements | Record checks performed, issues found, evidence used, recommendation, actor, timestamp, and Gate 4 readiness. |
| Success Criteria | QA result is complete, explainable, and ready for human approval. |
| Future Extension Points | Automated export inspection, ATS compatibility scoring, readability scoring. |

### CAP-006 Recruiter Communication

| Contract Field | Definition |
| --- | --- |
| Capability ID | CAP-006 |
| Capability Name | Recruiter Communication |
| Purpose | Draft and review recruiter or employer communication for human approval. |
| Responsibilities | Prepare messages, response options, follow-up drafts, and communication risk notes using approved application context. |
| Owner | Career Companion Product Owner |
| Version | v0.1 |
| Current Maturity Level | L1 Specification |
| Allowed Workflow States | S7 Application Package Ready, G5 Gate 5 as Read Only, S8 Application Submitted, S9 Recruiter Engagement; S10, S11, S12, S13 as Read Only for context-specific communication drafts. |
| Forbidden Workflow States | S0, S1, S2, G1, S3, G2, S4, G3, S5, S6, G4 before package approval, S14, T1, T2, T3, T4, T5 except closure review, F1 except failure review, P1 except return-state review. |
| Entry Criteria | Approved package or active recruiter/employer interaction exists. |
| Required Inputs | Application context, target communication purpose, approved evidence, human-provided recipient context. |
| Optional Inputs | Prior interaction summary, tone preference, deadline, recruiter-provided instructions. |
| Required Evidence | Approved package or interaction record; privacy-safe communication context. |
| Produced Outputs | Draft message, options, risk notes, approval checklist. |
| Output Artifacts | Communication draft artifact and approval evidence packet. |
| Side Effects | None. |
| Forbidden Actions | Send messages, schedule interviews, accept or reject interviews, infer recruiter intent as fact, expose private data. |
| Human Approval Required | Yes before any external communication. |
| Failure Modes | Missing recipient context, privacy risk, unsupported claim, ambiguous requested action. |
| Recovery Strategy | Pause for clarification, remove sensitive content, revise draft, or fail closed. |
| Audit Requirements | Record draft purpose, inputs, evidence references, privacy review, approval requirement, actor, and timestamp. |
| Success Criteria | Draft is accurate, privacy-safe, human-reviewable, and clearly not sent automatically. |
| Future Extension Points | Tone variants, follow-up library, communication effectiveness review. |

### CAP-007 Interview Preparation

| Contract Field | Definition |
| --- | --- |
| Capability ID | CAP-007 |
| Capability Name | Interview Preparation |
| Purpose | Prepare evidence-backed interview material for a scheduled or expected interview. |
| Responsibilities | Build story banks, likely themes, prep questions, evidence reminders, and role-specific practice material. |
| Owner | Career Companion Product Owner |
| Version | v0.1 |
| Current Maturity Level | L1 Specification |
| Allowed Workflow States | S10 Interview Preparation; S11 Interview Active as Read Only. |
| Forbidden Workflow States | S0, S1, S2, G1, S3, G2, S4, G3, S5, S6, G4, S7, G5, S8 unless interview context exists, S9 unless interview scheduled, S12, S13, S14, T1, T2, T3, T4, T5, F1 except failure review, P1 except return-state review. |
| Entry Criteria | Interview or substantive screen is scheduled or expected with sufficient context. |
| Required Inputs | Interview stage, JD Intelligence report, approved resume package, application context. |
| Optional Inputs | Interview format, interviewer role, user concerns, prior debriefs, time available. |
| Required Evidence | Locked resume, JD context, verified career evidence. |
| Produced Outputs | Interview preparation plan, story bank, questions, practice prompts, risk notes. |
| Output Artifacts | Interview prep artifact. |
| Side Effects | None. |
| Forbidden Actions | Modify resume, invent stories, store confidential interview content, schedule interviews, send follow-ups. |
| Human Approval Required | Required before external scheduling or communication, not for private prep. |
| Failure Modes | Missing interview context, unlocked resume, insufficient evidence, confidentiality risk. |
| Recovery Strategy | Pause for context, use read-only existing evidence, or fail closed if preparation would misrepresent facts. |
| Audit Requirements | Record interview context, evidence references, produced prep artifacts, actor, and timestamp. |
| Success Criteria | Prep material is defensible, evidence-backed, private, and aligned to the interview stage. |
| Future Extension Points | Role-specific prep packs, mock interview scenario selection, readiness scoring. |

### CAP-008 Interview Coaching

| Contract Field | Definition |
| --- | --- |
| Capability ID | CAP-008 |
| Capability Name | Interview Coaching |
| Purpose | Conduct practice interactions and provide coaching feedback. |
| Responsibilities | Simulate interview questions, evaluate answer structure, identify gaps, and suggest practice improvements without altering facts. |
| Owner | Career Companion Product Owner |
| Version | v0.1 |
| Current Maturity Level | L1 Specification |
| Allowed Workflow States | S10 Interview Preparation; S11 Interview Active as Read Only before or between interview events. |
| Forbidden Workflow States | S0, S1, S2, G1, S3, G2, S4, G3, S5, S6, G4, S7, G5, S8, S9 without interview context, S12, S13, S14, T1, T2, T3, T4, T5, F1 except failure review, P1 except return-state review. |
| Entry Criteria | Interview preparation context exists and user requests coaching. |
| Required Inputs | Interview prep artifact, role context, approved resume, user answer or practice mode. |
| Optional Inputs | Target competency, difficulty level, time limit, feedback preference. |
| Required Evidence | Verified career evidence and approved interview preparation context. |
| Produced Outputs | Coaching feedback, practice notes, gap list, suggested next practice action. |
| Output Artifacts | Interview coaching artifact. |
| Side Effects | None. |
| Forbidden Actions | Invent stories, modify career facts, store confidential real interview questions, evaluate offer decisions. |
| Human Approval Required | Required before any learning is persisted as career memory or external communication is drafted. |
| Failure Modes | User asks to practice unsupported claim, confidential content risk, insufficient evidence for answer. |
| Recovery Strategy | Redirect to verified evidence, mark uncertainty, pause for clarification, or fail closed. |
| Audit Requirements | Record practice context, evidence used, feedback generated, unsupported-claim warnings, actor, and timestamp. |
| Success Criteria | Feedback improves answer quality without creating unsupported claims. |
| Future Extension Points | Competency-specific coaching rubrics, answer scoring, longitudinal practice trends. |

### CAP-009 Interview Debrief

| Contract Field | Definition |
| --- | --- |
| Capability ID | CAP-009 |
| Capability Name | Interview Debrief |
| Purpose | Capture privacy-safe learning after an interview. |
| Responsibilities | Structure user reflection, record outcome status, capture follow-up actions, and propose learning without storing confidential interview content. |
| Owner | Career Companion Product Owner |
| Version | v0.1 |
| Current Maturity Level | L1 Specification |
| Allowed Workflow States | S12 Interview Debrief; S11 Interview Active as Read Only after completion. |
| Forbidden Workflow States | S0, S1, S2, G1, S3, G2, S4, G3, S5, S6, G4, S7, G5, S8, S9 without completed interview, S10 before completion, S13 except offer context read-only, S14, T1, T2, T3, T4, T5 except closure learning proposal, F1 except failure review, P1 except return-state review. |
| Entry Criteria | Interview completed or explicit post-interview reflection is available. |
| Required Inputs | Interview tracking record, user reflection, privacy constraints. |
| Optional Inputs | Follow-up deadline, outcome status, preparation artifact, coaching notes. |
| Required Evidence | Interview completion record and user-approved debrief content. |
| Produced Outputs | Debrief summary, learning proposal, follow-up options, next-action recommendation. |
| Output Artifacts | Interview debrief artifact and learning proposal. |
| Side Effects | None. |
| Forbidden Actions | Store confidential interview questions, infer rejection from silence, send follow-up, persist unverified facts. |
| Human Approval Required | Yes before persisting new career facts or sending follow-up communication. |
| Failure Modes | Confidential content included, unclear outcome, unsupported interpretation, missing completion record. |
| Recovery Strategy | Remove sensitive content, label interpretation, pause for clarification, or fail closed. |
| Audit Requirements | Record debrief inputs, privacy review, learning proposals, next actions, actor, and timestamp. |
| Success Criteria | Debrief is privacy-safe, useful, and separates facts from interpretations. |
| Future Extension Points | Interview pattern analysis, learning taxonomy, follow-up effectiveness review. |

### CAP-010 Career Intelligence

| Contract Field | Definition |
| --- | --- |
| Capability ID | CAP-010 |
| Capability Name | Career Intelligence |
| Purpose | Provide read-only career context and propose structured learning updates. |
| Responsibilities | Summarize verified evidence, surface prior patterns, identify gaps, and propose memory updates for human approval. |
| Owner | Career Companion Product Owner |
| Version | v0.1 |
| Current Maturity Level | L1 Specification |
| Allowed Workflow States | S0, S1, S2, G1, S3, G2, S4, G3, S5, S6, G4, S7, G5, S8, S9, S10, S11, S12, S13, S14, T1, T2, T3, T4, T5, P1, F1 as Read Only unless future contract grants approved write proposals. |
| Forbidden Workflow States | None for read-only use; write behavior is forbidden in all states until separately approved. |
| Entry Criteria | Workflow Instance or career context is available. |
| Required Inputs | Approved Career OS evidence or workflow artifacts. |
| Optional Inputs | User preference, historical application summaries, approved pilot observations. |
| Required Evidence | Verified or explicitly labeled source material. |
| Produced Outputs | Context summary, evidence gaps, pattern observations, learning proposals. |
| Output Artifacts | Career intelligence summary or learning proposal artifact. |
| Side Effects | None. |
| Forbidden Actions | Persist unverified facts, modify canonical evidence, change workflow state, expose private data, make consequential decisions. |
| Human Approval Required | Yes before any memory or canonical evidence update. |
| Failure Modes | Evidence ambiguity, privacy risk, hypothesis presented as fact, stale context. |
| Recovery Strategy | Label uncertainty, request human review, withhold memory update, or fail closed. |
| Audit Requirements | Record sources consulted, output summary, proposed updates, confidence, actor, and timestamp. |
| Success Criteria | Context is useful, traceable, private, and clearly separated from workflow authority. |
| Future Extension Points | Private memory model, evidence-gap trends, application-performance learning. |

## 6. Capability Lifecycle

Standard lifecycle:

```text
Requested
  ↓
Validated
  ↓
Executing
  ↓
Completed
  ↓
Persisted
  ↓
Returned
```

Additional lifecycle outcomes:

| Outcome | Meaning |
| --- | --- |
| Rejected | Capability request is not allowed in the current state or violates contract. |
| Failed | Capability could not complete due to missing evidence, safety issue, or execution failure. |
| Cancelled | Human or Orchestrator cancelled execution before completion. |

Lifecycle rules:

- Requested capabilities must be checked against current workflow state.
- Validation must occur before execution.
- Completed output must be structured.
- Persistence is performed by the Orchestrator, not the capability.
- Returned results must include audit metadata.

## 7. Capability Interaction Rules

- Capabilities never call each other directly.
- Capabilities never transition workflow state.
- Capabilities never modify workflow state.
- Capabilities never bypass the Orchestrator.
- Capabilities communicate only through workflow artifacts.
- Capabilities cannot modify evidence.
- Capabilities cannot modify approvals.
- Capabilities cannot create hidden side effects.
- Capabilities cannot perform external actions.
- Capabilities cannot treat conversation history as system state.

## 8. Capability Maturity Model

| Level | Name | Criteria |
| --- | --- | --- |
| L0 | L0 Concept | Capability idea exists but has no approved contract. |
| L1 | L1 Specification | Capability contract is documented and reviewed. |
| L2 | L2 Manual Assisted | Capability can be executed manually using approved workflow artifacts. |
| L3 | L3 AI Assisted | Capability may use AI to draft or analyze under human review. |
| L4 | L4 Governed Automation | Capability can execute deterministic portions with enforced state and approval constraints. |
| L5 | L5 Production Ready | Capability is validated, monitored, audited, privacy-reviewed, and safe for controlled production use. |

Maturity can advance only when validation evidence exists. Higher maturity does not remove human authority requirements.

## 9. Capability Interface

Conceptual execution interface:

```text
Input
  ↓
Validation
  ↓
Execution
  ↓
Structured Output
  ↓
Audit Record
  ↓
Return
```

Interface rules:

- Input is supplied by the Orchestrator.
- Validation checks state, evidence, approval, and contract permissions.
- Execution performs only the allowed capability work.
- Structured Output contains recommendations, drafts, checks, or analysis.
- Audit Record captures execution metadata.
- Return sends the result to the Orchestrator.

This is conceptual only. It does not define code, APIs, databases, or implementation frameworks.

## 10. Capability Constraints

Universal constraints:

- No fabricated metrics.
- No fabricated experience.
- No fabricated employers.
- No fabricated education.
- No unsupported achievements.
- No unsupported recommendations.
- No workflow modifications.
- No approval bypass.
- No hidden execution.
- No side-channel communication.
- No autonomous external actions.
- No modification of canonical evidence.
- No persistence of hypotheses as facts.
- No private data exposure.
- No undefined state behavior.

## 11. Audit Requirements

Every capability execution records:

- Timestamp.
- Workflow Instance.
- Capability ID.
- Capability Version.
- Inputs.
- Outputs.
- Evidence References.
- Execution Result.
- Actor.
- Reason.
- Approval Reference.

Audit rules:

- No silent execution.
- No output without capability ID and version.
- No generated claim without evidence reference.
- No consequential output without approval requirement.
- No failed execution without failure reason.
- No persistence without Orchestrator audit record.

## 12. Extension Rules

Future capabilities must follow this process:

```text
Capability Proposal
  ↓
Contract Draft
  ↓
Architecture Review
  ↓
Workflow Mapping
  ↓
Evidence Mapping
  ↓
Validation
  ↓
Approval
  ↓
Release
```

No capability may bypass this process.

Every new or expanded capability must define:

- Capability ID.
- Capability name.
- Purpose.
- Responsibilities.
- Allowed states.
- Forbidden states.
- Inputs.
- Outputs.
- Evidence.
- Constraints.
- Approval requirements.
- Failure behavior.
- Recovery strategy.
- Audit requirements.
- Success criteria.
- Future extension points.

If a capability cannot be mapped to the Workflow State Machine, it cannot be released.

## 13. Architectural Principles

- Workflow controls capabilities.
- Capabilities never control workflow.
- Capabilities are replaceable.
- Contracts remain stable.
- Implementations evolve.
- Evidence precedes generation.
- Human approval precedes action.
- Audit history is immutable.
- Capabilities remain stateless.
- Capabilities produce structured outputs.
- Capabilities do not persist state.
- Orchestrator owns persistence.
- Workflow Instance owns execution state.
- Career OS remains the operational protocol.
