# Career Companion Product Charter

## 1. Executive Summary

Career Companion is a proposed AI-powered career operating assistant that works inside the rules of Career OS. Its first executable MVP should help transform a job description into an evidence-backed application package while preserving human authority, privacy, traceability, and factual integrity.

The MVP begins with one governed Career Companion Orchestrator. The orchestrator exposes specialized operating modes, but those modes are not independent autonomous agents.

## 2. Product Vision

Career Companion should become a trusted operating partner for high-quality career moves. It should help the user evaluate opportunities, prepare materials, communicate clearly, interview effectively, and convert learning into durable career intelligence.

## 3. User Problem

Company-specific applications require careful judgment, evidence selection, resume tailoring, communication prep, and follow-through. Without a governed assistant, this work is slow, inconsistent, cognitively heavy, and vulnerable to either over-customization or weak fit assessment.

## 4. Target User

Primary user: Saurabh Chawda, operating a high-quality product-management job-search pipeline.

Secondary users affected by output quality:

- Recruiters
- Hiring managers
- Interviewers
- Referrers
- Future reviewers of Career OS artifacts

## 5. Jobs to Be Done

- When evaluating a role, help determine whether it is worth pursuing.
- When given a JD, extract the role shape, competencies, keywords, gaps, and hidden signals.
- When preparing a resume, recommend evidence-backed positioning.
- When assembling a resume, use verified evidence only.
- When reviewing a draft, detect unsupported claims, weak relevance, ATS issues, and unclear writing.
- When communicating with recruiters, draft messages for human approval.
- When preparing for interviews, convert evidence into defensible stories and practice prompts.
- When debriefing, capture structured learning without storing confidential information.

## 6. Product Value Proposition

Career Companion reduces application effort while improving fit discipline, evidence quality, factual safety, and learning capture. It helps the user avoid poor-fit applications, prepare stronger materials, and preserve Career OS traceability.

## 7. Product Principles

- One orchestrator for the MVP.
- Specialized capabilities before specialized autonomous agents.
- Evidence-first generation.
- Explicit application state.
- Deterministic decision gates.
- Human approval before consequential actions.
- Private-by-default memory.
- Separation of verified facts from hypotheses.
- Full artifact traceability.
- No silent workflow progression.
- No autonomous external communication.
- Failure-safe stopping behavior.
- Capability evaluation before automation expansion.

## 8. Relationship to Career OS

Career OS is the operating protocol and proof system. Career Companion is an assistant that uses those protocols.

Career Companion must:

- Follow Career OS workflows.
- Use Career OS decision gates.
- Respect Career OS privacy rules.
- Use verified Career OS evidence.
- Preserve Career OS traceability.
- Record uncertainty instead of inventing certainty.

Career Companion must not change Career OS governance, workflows, templates, metrics, schemas, or facts without explicit human-approved product work.

## 9. Relationship to the Controlled Live Pilot

The controlled live pilot baseline is frozen. Career Companion must remain isolated from the pilot baseline.

Career Companion may learn from pilot findings only after they are reviewed and approved. It must not modify live-pilot artifacts, dashboards, runbooks, operational templates, decision gates, or governance documents during product definition.

## 10. MVP Definition

The first executable MVP should support:

- User provides a JD.
- Opportunity record is initialized.
- Qualification recommendation is generated.
- Human approves Gate 1.
- JD Intelligence is completed.
- Resume Strategy is generated.
- Human approves strategy.
- Resume is assembled only from verified evidence.
- Resume QA is performed.
- Human approves final output.
- Application package is prepared.
- External submission remains manual.

Interview support is part of the product vision but should be treated as a later MVP extension unless validated inputs exist to support it safely.

## 11. MVP User Journey

1. User provides a job description and source context.
2. Career Companion initializes the opportunity context.
3. Opportunity Qualification mode recommends proceed, reject, or hold.
4. Human reviews and approves Gate 1.
5. JD Intelligence mode analyzes the job description.
6. Resume Strategy mode recommends positioning and evidence.
7. Human approves or revises the strategy.
8. Resume Assembly mode assembles from verified components only.
9. Resume QA mode checks factuality, ATS fit, readability, and traceability.
10. Human approves final materials.
11. Application package is prepared for manual submission.
12. Career Companion captures learning and next actions after human review.

## 12. Supported Operating Modes

| Mode | Purpose | MVP Status |
| --- | --- | --- |
| Opportunity Qualification | Recommend proceed, reject, or hold. | MVP core |
| JD Intelligence | Analyze role shape, competencies, keywords, and gaps. | MVP core |
| Resume Strategy | Recommend evidence-backed positioning. | MVP core |
| Resume Assembly | Assemble approved resume components. | MVP core |
| Resume QA | Review factuality, traceability, ATS, and readability. | MVP core |
| Recruiter Communication | Draft human-approved messages. | Later extension |
| Interview Preparation | Prepare stories, questions, and research. | Later extension |
| Interview Coaching | Conduct mock interviews and feedback. | Later extension |
| Interview Debrief | Capture learning and follow-up. | Later extension |
| Career Intelligence | Maintain private career memory and patterns. | Later extension |

## 13. Capability Boundaries

Career Companion may:

- Analyze information.
- Recommend decisions.
- Draft artifacts.
- Identify evidence gaps.
- Apply approved Career OS rules.
- Prepare interview material.
- Conduct mock interviews.
- Capture structured learning.
- Recommend next actions.

Career Companion must not:

- Submit job applications.
- Send recruiter messages.
- Schedule interviews.
- Accept or reject interviews.
- Accept, reject, or negotiate offers.
- Invent career evidence.
- Modify verified career facts.
- Approve unsupported resume claims.
- Change Career OS governance.
- Change decision-gate definitions.
- Persist unverified information as fact.
- Expose private career or application data.
- Bypass required human approval gates.

## 14. Human Authority Model

The human is the authority for all consequential actions, factual approvals, external communication, application submission, interview decisions, and offer decisions.

Career Companion is advisory by default. It may prepare artifacts and recommendations, but it must stop for human approval at required gates.

## 15. Decision Rights

| Decision | Career Companion Role | Human Role |
| --- | --- | --- |
| Pursue opportunity | Recommend | Approve or reject |
| Approve Gate 1 | Prepare evidence | Decide |
| Resume positioning | Recommend | Approve or revise |
| Use a claim | Check evidence | Approve final truthfulness |
| Send recruiter message | Draft | Send or reject |
| Submit application | Prepare package | Submit manually |
| Accept interview | Prepare context | Accept or reject |
| Offer decision | Analyze factors | Decide |

## 16. Required Human Approval Gates

- Gate 1: proceed with the opportunity.
- Resume strategy approval.
- Resume final QA approval.
- External message approval.
- Application submission approval.
- Interview acceptance or rejection.
- Offer acceptance, rejection, or negotiation.
- Persistence of new career facts into canonical evidence.

## 17. Career Evidence Policy

Career Companion must use verified Career OS evidence as the source of truth. It may identify possible evidence gaps, but it must not fill those gaps with invented claims.

Evidence states:

- Verified fact
- Publicly verified fact
- Self-reported fact
- Hypothesis
- Simulation
- Prototype
- Unknown

Only verified or explicitly approved facts may appear as factual claims in final materials.

## 18. Factuality and Non-Fabrication Policy

Career Companion must never invent employers, dates, titles, metrics, technologies, responsibilities, outcomes, credentials, interviews, offers, or references.

When evidence is incomplete, the correct behavior is to stop, ask for clarification, mark uncertainty, or recommend exclusion.

## 19. Privacy and Data Handling Principles

- Private career and application data is private by default.
- Recruiter, compensation, interview, and application details require careful handling.
- Raw email content should not be stored unless necessary and approved.
- Confidential interview content must not be stored.
- Private memory must be explicit, inspectable, and removable.
- No private data should be exposed in public documentation.

## 20. Memory Principles

Career Companion memory should be:

- Private by default.
- Separated into verified facts, user preferences, observations, and hypotheses.
- Traceable to source artifacts.
- Editable by the human.
- Resistant to accidental promotion of hypotheses into facts.
- Minimal enough to avoid collecting unnecessary sensitive data.

No memory system exists yet.

## 21. Explainability and Traceability Requirements

Every recommendation should explain:

- Source inputs used.
- Career OS rules applied.
- Evidence IDs or artifact references.
- Confidence level.
- Risks and gaps.
- Required human review.
- Why alternatives were not selected when material.

No final claim should be untraceable.

## 22. Failure and Escalation Behaviour

Career Companion should stop and escalate when:

- Required evidence is missing.
- A claim is unsupported.
- A privacy risk appears.
- A decision gate has not been approved.
- The JD conflicts with the role title.
- The user asks for an external action requiring approval.
- The system cannot distinguish fact from hypothesis.
- Output could materially misrepresent the candidate.

## 23. In-Scope Features

- JD intake.
- Opportunity qualification recommendation.
- JD Intelligence summary.
- Resume strategy recommendation.
- Evidence-backed resume assembly.
- Resume QA.
- Application package preparation.
- Human approval checkpoints.
- Traceability report.
- Structured learning capture.

## 24. Out-of-Scope Features

- Autonomous applications.
- Autonomous recruiter outreach.
- Calendar or email integration.
- LinkedIn automation.
- Offer negotiation automation.
- Multi-user support.
- Public release.
- Runtime UI changes.
- Schema changes during product definition.
- Independent autonomous agents.
- Unverified memory persistence.

## 25. Functional Requirements

- Accept a JD and source context.
- Initialize application context.
- Recommend qualification disposition.
- Produce explainable JD Intelligence.
- Recommend resume strategy from verified evidence.
- Assemble only approved evidence-backed components.
- Run resume QA checks.
- Identify gaps, risks, and unsupported claims.
- Prepare a final package for manual submission.
- Record required human approval points.

## 26. Non-Functional Requirements

- Privacy-first.
- Explainable.
- Deterministic where gates and rules are involved.
- Auditable.
- Human-controllable.
- Local-first by default.
- Failure-safe.
- Minimal data retention.
- Compatible with Career OS protocols.
- Clear separation between facts and hypotheses.

## 27. Success Metrics

Initial values are baselines to be measured. No arbitrary targets are set before evidence exists.

### Operational Efficiency

- Time from JD intake to qualification.
- Time from Gate 1 approval to resume draft.
- Manual corrections required.
- Workflow stages completed correctly.

### Decision Quality

- Qualification agreement with human reviewer.
- False pursue rate.
- False reject rate.
- Gate compliance.

### Resume Quality

- Factual accuracy.
- Evidence coverage.
- ATS compatibility.
- Recruiter readability.
- Hiring-manager relevance.
- Unsupported claim rate.

### Trust and Safety

- Fabricated evidence count.
- Privacy incidents.
- Skipped approval gates.
- Untraceable claims.
- Unauthorized external actions.

### User Value

- Time saved.
- Applications avoided due to poor fit.
- Application packages completed.
- User acceptance rate.
- Interview-preparation usefulness.

## 28. Risks

- Assistant overreaches into decision-making.
- User treats drafts as final without review.
- Hypotheses become stored as facts.
- Resume claims become optimized for keywords over truth.
- Privacy-sensitive data is stored unnecessarily.
- External actions are triggered without clear approval.
- MVP scope expands into too many modes too early.
- Controlled live pilot findings are applied without governance review.

## 29. Assumptions

- Career OS remains the source of truth.
- Human approval remains available at gates.
- Verified evidence exists for core resume claims.
- The first MVP can operate without autonomous integrations.
- Interview support requires additional validation before runtime implementation.

## 30. Dependencies

- Career OS canonical evidence.
- Career OS workflows.
- Career OS decision gates.
- Resume OS component library.
- JD Intelligence rules.
- Resume Assembly and QA protocols.
- Privacy governance.
- Human approval and review.

## 31. MVP Exit Criteria

The MVP may exit when:

- It completes the JD-to-application-package flow without bypassing gates.
- Every generated claim is traceable.
- Human approvals are captured.
- No autonomous external actions occur.
- Privacy review passes.
- The user can identify time saved or quality improvement.
- Failure cases are documented.

## 32. Definition of Success

Career Companion succeeds if it makes Career OS easier to operate while improving fit discipline, factuality, traceability, and user confidence.

## 33. Definition of Failure

Career Companion fails if it bypasses human authority, fabricates evidence, exposes private data, changes Career OS protocols without approval, or produces untraceable application claims.

## 34. Future Product Direction

Future phases may introduce recruiter communication support, interview preparation, interview coaching, debriefs, offer evaluation, career memory, and specialized agents. Each expansion must be evaluated before automation increases.

