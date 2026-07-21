# Career Companion Artifact Model

## 1. Purpose

The Artifact Model defines the canonical data exchanged across Career Companion. Artifacts separate workflow execution, capability behavior, memory, and implementation details.

Career Companion capabilities do not communicate directly. Capabilities consume artifacts, produce artifacts, and return those artifacts to the Orchestrator. The Orchestrator routes artifacts according to the Workflow State Machine.

Artifacts are the source of truth for execution outputs. Prompts, conversations, hidden memory, and model-specific intermediate reasoning are not artifacts and are not system state.

Artifacts exist to provide:

- Stable workflow data.
- Implementation-independent capability exchange.
- Evidence traceability.
- Auditability.
- Versioning.
- Approval control.
- Safe downstream consumption.
- Long-term maintainability.

## 2. Design Principles

- Artifacts are first-class architectural objects.
- Artifacts are immutable after approval.
- Artifacts are versioned.
- Artifacts are traceable.
- Artifacts reference evidence.
- Artifacts never contain fabricated information.
- Artifacts have explicit ownership.
- Artifacts are implementation independent.
- Artifacts are auditable.
- Artifacts remain deterministic where practical.
- Artifacts communicate between capabilities.
- Workflow controls artifact movement.
- Capabilities transform artifacts.
- Conversation history is not an artifact.
- Conversation history is not system state.

## 3. Core Concepts

| Concept | Definition |
| --- | --- |
| Artifact | First-class data object produced or consumed during workflow execution. |
| Artifact Type | Canonical category of artifact, such as Opportunity or Resume Draft. |
| Artifact Instance | Concrete artifact created within one Workflow Instance. |
| Artifact Version | Immutable version number for a specific artifact instance. |
| Artifact Lifecycle | State of an artifact from creation through archive. |
| Artifact Relationship | Directed connection between artifacts. |
| Artifact Producer | Capability or human actor that creates the artifact. |
| Artifact Consumer | Capability or workflow state that reads the artifact. |
| Evidence Reference | Pointer to source evidence supporting artifact content. |
| Approval Status | Human or workflow approval state of the artifact. |
| Metadata | Structured operational fields describing artifact context. |
| Audit Record | Immutable record of artifact creation, validation, approval, or supersession. |
| Artifact Graph | Directed graph connecting artifacts, evidence, versions, and workflow states. |

## 4. Universal Artifact Schema

Every artifact must inherit this base structure.

| Field | Purpose |
| --- | --- |
| Artifact ID | Unique artifact instance identifier. |
| Artifact Type | Canonical artifact type ID and name. |
| Artifact Version | Version number for the artifact instance. |
| Workflow Instance ID | Workflow instance that owns the artifact. |
| Source Capability | Capability or human process that produced the artifact. |
| Parent Artifact(s) | Upstream artifacts used to create this artifact. |
| Child Artifact(s) | Downstream artifacts produced from this artifact. |
| Created By | Actor or capability that created the artifact. |
| Created Timestamp | Creation timestamp. |
| Modified Timestamp | Last modification timestamp before approval or supersession. |
| Approval Status | Draft, validated, approved, rejected, superseded, archived, or not required. |
| Lifecycle Status | Created, draft, validated, approved, immutable, superseded, cancelled, failed, or archived. |
| Evidence References | Explicit references to supporting evidence. |
| Metadata | Type-specific structured metadata. |
| Content | Artifact body or payload. |
| Audit Reference | Link to audit record for creation, modification, approval, or supersession. |

Every artifact must inherit this structure even when some fields are empty or marked not applicable.

## 5. Artifact Inventory

| Artifact ID | Artifact Name | Primary Producer | Primary Consumer |
| --- | --- | --- | --- |
| ART-001 | Opportunity | CAP-001 Qualification or human intake | CAP-001 Qualification |
| ART-002 | Qualification | CAP-001 Qualification | Gate 1, CAP-002 JD Intelligence |
| ART-003 | JD Intelligence | CAP-002 JD Intelligence | Gate 2, CAP-003 Resume Strategy |
| ART-004 | Resume Strategy | CAP-003 Resume Strategy | Gate 3, CAP-004 Resume Assembly |
| ART-005 | Resume Draft | CAP-004 Resume Assembly | CAP-005 Resume QA |
| ART-006 | Resume QA | CAP-005 Resume QA | Gate 4, CAP-004 Resume Assembly if revision required |
| ART-007 | Application Package | CAP-005 Resume QA or human package preparation | Gate 5, CAP-006 Recruiter Communication |
| ART-008 | Recruiter Communication | CAP-006 Recruiter Communication | Human approval, S9 Recruiter Engagement |
| ART-009 | Interview Preparation | CAP-007 Interview Preparation or CAP-008 Interview Coaching | S11 Interview Active, CAP-009 Interview Debrief |
| ART-010 | Interview Debrief | CAP-009 Interview Debrief | CAP-010 Career Intelligence |
| ART-011 | Career Insight | CAP-010 Career Intelligence | Human review, future workflow context |
| ART-012 | Offer Evaluation | Future offer evaluation support or CAP-010 read-only context | Human offer decision |

## 6. Artifact Specifications

Every artifact specification uses exactly this template:

```text
Artifact ID
Artifact Name
Purpose
Produced By Capability
Consumed By Capability
Allowed Workflow States
Required Inputs
Produced Outputs
Metadata
Required Evidence
Approval Requirement
Lifecycle
Validation Rules
Relationships
Version Rules
Immutability Rules
Audit Requirements
Extension Points
```

### ART-001 Opportunity

| Specification Field | Definition |
| --- | --- |
| Artifact ID | ART-001 |
| Artifact Name | Opportunity |
| Purpose | Capture a potential role before qualification. |
| Produced By Capability | CAP-001 Qualification or human intake. |
| Consumed By Capability | CAP-001 Qualification. |
| Allowed Workflow States | S1 Opportunity Intake, S2 Qualification, G1 Gate 1 as Read Only. |
| Required Inputs | Company, role title, source, location/work model if available. |
| Produced Outputs | Opportunity artifact. |
| Metadata | Opportunity ID, company, role, source URL/reference, capture date, location, work model, duplicate status. |
| Required Evidence | Role source or credible reference. |
| Approval Requirement | No approval required to create; human approval required at Gate 1 to proceed. |
| Lifecycle | Created, draft, validated, archived, or superseded. |
| Validation Rules | Source required; duplicate check required before Gate 1; no private contact details unless approved. |
| Relationships | Parent: none. Child: ART-002 Qualification. References: source posting. |
| Version Rules | New version required if source, role, or company changes. |
| Immutability Rules | Approved Gate 1 evidence version is immutable. |
| Audit Requirements | Record creator, timestamp, source, duplicate check, and workflow instance. |
| Extension Points | Role-shape tags, source reliability, title-versus-role-content indicators. |

### ART-002 Qualification

| Specification Field | Definition |
| --- | --- |
| Artifact ID | ART-002 |
| Artifact Name | Qualification |
| Purpose | Record opportunity fit recommendation and Gate 1 evidence. |
| Produced By Capability | CAP-001 Qualification. |
| Consumed By Capability | Gate 1, CAP-002 JD Intelligence after approval. |
| Allowed Workflow States | S2 Qualification, G1 Gate 1, S3 JD Intelligence as Read Only. |
| Required Inputs | ART-001 Opportunity, qualification criteria, duplicate check. |
| Produced Outputs | Proceed, reject, or hold recommendation with rationale. |
| Metadata | Qualification date, role fit, location fit, experience relevance, decision owner, disposition. |
| Required Evidence | Opportunity artifact and role source. |
| Approval Requirement | Human Gate 1 approval required to proceed. |
| Lifecycle | Created, draft, validated, approved, rejected, immutable, archived. |
| Validation Rules | Recommendation must include rationale; reject and hold must include reason. |
| Relationships | Parent: ART-001. Child: ART-003 if Gate 1 passes. |
| Version Rules | New version required if role evidence or fit rationale changes. |
| Immutability Rules | Gate 1 decision version is immutable. |
| Audit Requirements | Record recommendation, evidence, human decision, timestamp, and actor. |
| Extension Points | Fit scoring, mismatch categories, false pursue/false reject learning. |

### ART-003 JD Intelligence

| Specification Field | Definition |
| --- | --- |
| Artifact ID | ART-003 |
| Artifact Name | JD Intelligence |
| Purpose | Analyze job description structure, role shape, competencies, keywords, gaps, and risks. |
| Produced By Capability | CAP-002 JD Intelligence. |
| Consumed By Capability | Gate 2, CAP-003 Resume Strategy. |
| Allowed Workflow States | S3 JD Intelligence, G2 Gate 2, S4 Resume Strategy as Read Only. |
| Required Inputs | Approved ART-002 Qualification, stable JD snapshot or JD text. |
| Produced Outputs | JD Intelligence report, archetype, competencies, keywords, hidden signals, gaps, risks. |
| Metadata | JD source, capture date, company, role, archetype, confidence, analysis date. |
| Required Evidence | Stable JD source and Gate 1 approval. |
| Approval Requirement | Human Gate 2 approval required before Resume Strategy. |
| Lifecycle | Created, draft, validated, approved, immutable, superseded, archived. |
| Validation Rules | Stable JD required; inferred signals labeled; unsupported requirements flagged. |
| Relationships | Parent: ART-002 and JD source. Child: ART-004. |
| Version Rules | New version required if JD changes or analysis is materially revised. |
| Immutability Rules | Approved Gate 2 version is immutable. |
| Audit Requirements | Record JD source, inputs, extraction result, risks, and approval reference. |
| Extension Points | Company context enrichment, multi-JD comparison, role-shape scoring. |

### ART-004 Resume Strategy

| Specification Field | Definition |
| --- | --- |
| Artifact ID | ART-004 |
| Artifact Name | Resume Strategy |
| Purpose | Define evidence-backed positioning before resume assembly. |
| Produced By Capability | CAP-003 Resume Strategy. |
| Consumed By Capability | Gate 3, CAP-004 Resume Assembly. |
| Allowed Workflow States | S4 Resume Strategy, G3 Gate 3, S5 Resume Assembly as Read Only. |
| Required Inputs | ART-003 JD Intelligence, verified evidence, role archetype, gaps. |
| Produced Outputs | Positioning, headline direction, summary direction, achievement selection, skills priority, risk notes. |
| Metadata | Strategy ID, archetype, selected evidence IDs, selected Product OS asset, page constraints. |
| Required Evidence | JD Intelligence artifact and verified Career OS evidence. |
| Approval Requirement | Human Gate 3 approval required before Resume Assembly. |
| Lifecycle | Created, draft, validated, approved, immutable, superseded, archived. |
| Validation Rules | No unsupported claims; gaps must remain visible; evidence IDs required. |
| Relationships | Parent: ART-003. Child: ART-005. |
| Version Rules | New version required for material positioning or evidence selection change. |
| Immutability Rules | Approved strategy version is immutable. |
| Audit Requirements | Record selected evidence, excluded alternatives where material, approval, and rationale. |
| Extension Points | Strategy scoring, variant learning, role-pack recommendations. |

### ART-005 Resume Draft

| Specification Field | Definition |
| --- | --- |
| Artifact ID | ART-005 |
| Artifact Name | Resume Draft |
| Purpose | Represent assembled resume content before or after QA. |
| Produced By Capability | CAP-004 Resume Assembly. |
| Consumed By Capability | CAP-005 Resume QA, Gate 4. |
| Allowed Workflow States | S5 Resume Assembly, S6 Resume QA, G4 Gate 4 as Read Only. |
| Required Inputs | Approved ART-004 Resume Strategy, component library, evidence map. |
| Produced Outputs | Resume draft and evidence map. |
| Metadata | Resume ID, target role, version, page estimate, section list, link list. |
| Required Evidence | Verified evidence for every claim and bullet. |
| Approval Requirement | Human Gate 4 approval required after QA. |
| Lifecycle | Created, draft, validated, approved, immutable, superseded, archived. |
| Validation Rules | Every claim traceable; no fabricated metrics; dates and titles unchanged. |
| Relationships | Parent: ART-004. Child: ART-006 and ART-007. |
| Version Rules | New version required for any wording, ordering, claim, or link change after validation. |
| Immutability Rules | Approved resume draft version is immutable. |
| Audit Requirements | Record component IDs, evidence IDs, generated content, validation status, and approval. |
| Extension Points | Export-ready versions, formatting metadata, resume variant performance. |

### ART-006 Resume QA

| Specification Field | Definition |
| --- | --- |
| Artifact ID | ART-006 |
| Artifact Name | Resume QA |
| Purpose | Validate resume factuality, ATS compatibility, readability, relevance, links, and traceability. |
| Produced By Capability | CAP-005 Resume QA. |
| Consumed By Capability | Gate 4, CAP-004 Resume Assembly if revision required. |
| Allowed Workflow States | S6 Resume QA, G4 Gate 4, S5 Resume Assembly as revision input. |
| Required Inputs | ART-005 Resume Draft, evidence map, ART-003 JD Intelligence, ART-004 Resume Strategy. |
| Produced Outputs | QA pass/fail/revise result, issue list, Gate 4 readiness. |
| Metadata | QA ID, review date, check categories, result, issue count, reviewer. |
| Required Evidence | Resume draft, evidence map, source artifacts, link references. |
| Approval Requirement | Human Gate 4 approval required for final package readiness. |
| Lifecycle | Created, draft, validated, approved, immutable, superseded, archived. |
| Validation Rules | Unsupported claims fail; broken links fail; factual mismatch fails. |
| Relationships | Parent: ART-005. Child: ART-007 if approved; ART-005 revision if failed. |
| Version Rules | New QA version required after any resume draft revision. |
| Immutability Rules | Gate 4 QA evidence version is immutable. |
| Audit Requirements | Record checks, issues, recommendation, actor, timestamp, and approval reference. |
| Extension Points | Automated ATS checks, export QA, readability scoring. |

### ART-007 Application Package

| Specification Field | Definition |
| --- | --- |
| Artifact ID | ART-007 |
| Artifact Name | Application Package |
| Purpose | Bundle approved application materials for manual external submission. |
| Produced By Capability | CAP-005 Resume QA or human package preparation. |
| Consumed By Capability | Gate 5, CAP-006 Recruiter Communication. |
| Allowed Workflow States | S7 Application Package Ready, G5 Gate 5, S8 Application Submitted as Read Only. |
| Required Inputs | Approved ART-005 Resume Draft, ART-006 Resume QA, submission context. |
| Produced Outputs | Package record, submission-ready materials, link references. |
| Metadata | Package ID, resume version, export references, target company, target role, package status. |
| Required Evidence | Approved resume, QA approval, privacy review. |
| Approval Requirement | Human Gate 5 approval required before external action. |
| Lifecycle | Created, draft, validated, approved, immutable, submitted, superseded, archived. |
| Validation Rules | Approved resume required; package cannot include unsupported or stale materials. |
| Relationships | Parent: ART-005 and ART-006. Child: ART-008 or submission record. |
| Version Rules | New version required for any material package change. |
| Immutability Rules | Submitted package version is immutable. |
| Audit Requirements | Record package contents, approvals, target action, timestamp, and actor. |
| Extension Points | Export bundles, portal requirement checklist, package readiness scoring. |

### ART-008 Recruiter Communication

| Specification Field | Definition |
| --- | --- |
| Artifact ID | ART-008 |
| Artifact Name | Recruiter Communication |
| Purpose | Represent draft or approved recruiter/employer communication. |
| Produced By Capability | CAP-006 Recruiter Communication. |
| Consumed By Capability | Human approval, S9 Recruiter Engagement, CAP-007 Interview Preparation when relevant. |
| Allowed Workflow States | S7 Application Package Ready, G5 Gate 5, S8 Application Submitted, S9 Recruiter Engagement, S10-S13 as Read Only when relevant. |
| Required Inputs | Application context, communication purpose, approved evidence, recipient context. |
| Produced Outputs | Draft message, alternatives, risk notes, approval checklist. |
| Metadata | Communication ID, type, intended recipient category, tone, status, approval state. |
| Required Evidence | Approved package or interaction record; no raw private content unless approved. |
| Approval Requirement | Human approval required before sending. |
| Lifecycle | Created, draft, validated, approved, sent by human, superseded, archived. |
| Validation Rules | Must not claim unsupported facts; must not expose private data; must not send autonomously. |
| Relationships | Parent: ART-007 or interaction record. Child: ART-009 if interview scheduled. |
| Version Rules | New version required for any message content change after approval. |
| Immutability Rules | Human-sent communication version is immutable. |
| Audit Requirements | Record draft source, evidence, approval, intended action, and send status. |
| Extension Points | Tone variants, follow-up templates, communication outcome learning. |

### ART-009 Interview Preparation

| Specification Field | Definition |
| --- | --- |
| Artifact ID | ART-009 |
| Artifact Name | Interview Preparation |
| Purpose | Prepare evidence-backed interview material. |
| Produced By Capability | CAP-007 Interview Preparation or CAP-008 Interview Coaching. |
| Consumed By Capability | S11 Interview Active, CAP-009 Interview Debrief, CAP-010 Career Intelligence as Read Only. |
| Allowed Workflow States | S10 Interview Preparation, S11 Interview Active as Read Only. |
| Required Inputs | Interview context, ART-003 JD Intelligence, approved resume/package, stage information. |
| Produced Outputs | Prep plan, story bank, likely themes, questions, practice prompts, coaching notes. |
| Metadata | Interview prep ID, interview stage, date if known, focus areas, confidence, privacy status. |
| Required Evidence | Locked resume, verified career evidence, interview context. |
| Approval Requirement | Human approval required before persisting new facts or sending follow-ups. |
| Lifecycle | Created, draft, validated, active, superseded, archived. |
| Validation Rules | Stories must be evidence-backed; confidential interview content must not be stored. |
| Relationships | Parent: ART-003, ART-005, ART-007, ART-008 if applicable. Child: ART-010. |
| Version Rules | New version required when interview stage, role context, or prep content changes materially. |
| Immutability Rules | Prep version used for an interview is immutable after the interview. |
| Audit Requirements | Record source artifacts, preparation content, actor, timestamp, and privacy review. |
| Extension Points | Practice scoring, competency rubrics, interview readiness trends. |

### ART-010 Interview Debrief

| Specification Field | Definition |
| --- | --- |
| Artifact ID | ART-010 |
| Artifact Name | Interview Debrief |
| Purpose | Capture privacy-safe learning after an interview. |
| Produced By Capability | CAP-009 Interview Debrief. |
| Consumed By Capability | CAP-010 Career Intelligence, S9 Recruiter Engagement as follow-up context. |
| Allowed Workflow States | S12 Interview Debrief, S9 Recruiter Engagement as follow-up input, S13 Offer Evaluation as Read Only. |
| Required Inputs | Interview completion record, user-approved reflection, privacy constraints. |
| Produced Outputs | Debrief summary, learning proposal, follow-up options, next-action recommendation. |
| Metadata | Debrief ID, interview stage, date, outcome status, privacy status, learning category. |
| Required Evidence | Interview completion record and user-approved reflection. |
| Approval Requirement | Human approval required before persisting new career facts or sending follow-up. |
| Lifecycle | Created, draft, validated, approved, immutable, archived. |
| Validation Rules | No confidential interview questions; facts and interpretations separated. |
| Relationships | Parent: ART-009 and interview record. Child: ART-011. |
| Version Rules | New version required for any material learning or outcome update. |
| Immutability Rules | Approved debrief version is immutable. |
| Audit Requirements | Record reflection source, privacy review, learning proposals, approval, and timestamp. |
| Extension Points | Interview pattern analysis, question taxonomy, follow-up quality review. |

### ART-011 Career Insight

| Specification Field | Definition |
| --- | --- |
| Artifact ID | ART-011 |
| Artifact Name | Career Insight |
| Purpose | Represent structured learning, pattern, or evidence gap proposed by Career Intelligence. |
| Produced By Capability | CAP-010 Career Intelligence. |
| Consumed By Capability | Human review, future workflow context as Read Only. |
| Allowed Workflow States | S0-S14, T1, T2, T3, T4, T5, P1, F1 as Read Only; write proposal only where human review is available. |
| Required Inputs | Approved artifacts, verified evidence, pilot observations, debriefs, or workflow history. |
| Produced Outputs | Insight, pattern, hypothesis, evidence gap, or memory update proposal. |
| Metadata | Insight ID, category, confidence, source artifacts, privacy classification, approval status. |
| Required Evidence | Source artifacts or explicit user-approved observation. |
| Approval Requirement | Human approval required before persistence as memory or canonical evidence. |
| Lifecycle | Created, draft, validated, approved, immutable, superseded, archived. |
| Validation Rules | Hypotheses labeled; no unverified fact persistence; source artifacts required. |
| Relationships | Parent: any approved artifact. Child: future workflow context or memory proposal. |
| Version Rules | New version required for changed insight, source, confidence, or status. |
| Immutability Rules | Approved insight version is immutable. |
| Audit Requirements | Record source artifacts, confidence, approval, actor, and timestamp. |
| Extension Points | Private memory model, longitudinal trend analysis, capability evaluation feedback. |

### ART-012 Offer Evaluation

| Specification Field | Definition |
| --- | --- |
| Artifact ID | ART-012 |
| Artifact Name | Offer Evaluation |
| Purpose | Analyze explicit offer information for human decision support. |
| Produced By Capability | Future offer evaluation support or CAP-010 Career Intelligence read-only context. |
| Consumed By Capability | Human offer decision, CAP-010 Career Intelligence as approved learning. |
| Allowed Workflow States | S13 Offer Evaluation, T4 Offer Accepted as Read Only, T5 Offer Declined as Read Only. |
| Required Inputs | Explicit offer details, user preferences, constraints, risk factors. |
| Produced Outputs | Offer evaluation summary, trade-offs, questions, decision options. |
| Metadata | Offer evaluation ID, company, role, offer status, privacy classification, decision status. |
| Required Evidence | Explicit offer information and user-provided constraints. |
| Approval Requirement | Human approval required for every offer decision or communication. |
| Lifecycle | Created, draft, validated, approved, immutable, accepted, declined, archived. |
| Validation Rules | No inferred offer; compensation private by default; no autonomous negotiation. |
| Relationships | Parent: application workflow, interview artifacts, explicit offer record. Child: terminal outcome and ART-011 if learning captured. |
| Version Rules | New version required when offer terms, preferences, or decision options change. |
| Immutability Rules | Offer decision version is immutable after human decision. |
| Audit Requirements | Record offer source, analysis, approval, decision, actor, timestamp, and privacy classification. |
| Extension Points | Offer comparison, negotiation prep, acceptance criteria modeling. |

## 7. Artifact Lifecycle

Standard lifecycle:

```text
Created
  ↓
Draft
  ↓
Validated
  ↓
Approved
  ↓
Immutable
  ↓
Archived
```

Failure paths:

- Failed validation: artifact remains draft or failed and cannot be consumed downstream.
- Cancelled: artifact is closed without downstream consumption.
- Superseded: a newer version replaces the artifact for future use while preserving history.
- Rejected: human rejects the artifact for progression.

Artifacts must validate before downstream consumption.

## 8. Artifact Relationships

Artifacts form a directed graph.

| Relationship | Meaning |
| --- | --- |
| Parent | Upstream artifact required to create the current artifact. |
| Child | Downstream artifact derived from the current artifact. |
| Derived From | Current artifact was produced using a prior artifact. |
| Consumes | Capability reads an artifact as input. |
| Produces | Capability creates an artifact as output. |
| Supersedes | Current version replaces a prior version for future use. |
| References | Artifact points to evidence, source, or audit record. |

Traceability is maintained by preserving parent-child relationships, evidence references, version history, and audit references.

## 9. Versioning Strategy

Versioning sequence:

```text
Version 1
  ↓
Version 2
  ↓
Version 3
```

Rules:

- Every artifact starts at version 1.
- Approved versions are immutable.
- Updates create new versions.
- Superseded versions remain in history.
- Downstream artifacts must reference the exact version consumed.
- Version history must preserve approval status and audit references.

## 10. Immutability Rules

Approved artifacts cannot be edited.

Changes require:

```text
New Version
  ↓
New Approval
  ↓
New Audit Entry
```

No silent mutation is allowed.

Immutability applies to:

- Gate evidence versions.
- Approved resume drafts.
- Submitted application packages.
- Sent communication records.
- Interview debriefs approved for learning.
- Offer decisions.

## 11. Evidence Traceability

Every artifact must explicitly reference supporting evidence.

Example:

```text
Resume Draft
  ↓
Achievement
  ↓
Evidence Reference
  ↓
Verified Metric
```

Rules:

- Artifacts never contain unsupported information.
- Evidence references must be explicit.
- Hypotheses must be labeled.
- Simulations must not be represented as production facts.
- Downstream artifacts inherit relevant upstream evidence references.
- Missing evidence blocks downstream consumption.

## 12. Validation Rules

Every artifact must validate before downstream consumption.

Validation checks:

- Required fields present.
- Required evidence present.
- References valid.
- No circular references unless explicitly allowed for version supersession.
- No orphan artifacts.
- No duplicate artifact IDs.
- Version sequence valid.
- Metadata complete.
- Approval status compatible with lifecycle status.
- Produced-by capability is allowed for the workflow state.
- Consumed-by capability is allowed for the workflow state.
- No unsupported claims.
- No silent mutation.

Invalid artifacts must enter draft, failed, cancelled, or superseded status and cannot be consumed by downstream capabilities until resolved.

## 13. Audit Requirements

Every artifact records:

- Timestamp.
- Producer Capability.
- Workflow Instance.
- Evidence References.
- Version.
- Approval.
- Actor.
- Reason.

Audit rules:

- No hidden modifications.
- No artifact without source capability or human creator.
- No approved artifact without approval record where approval is required.
- No version change without audit entry.
- No downstream consumption without validation.
- Audit history is immutable.

## 14. Extension Rules

Future artifacts must follow:

```text
Proposal
  ↓
Artifact Specification
  ↓
Workflow Mapping
  ↓
Capability Mapping
  ↓
Validation
  ↓
Approval
  ↓
Release
```

No ad hoc artifacts are allowed.

Every new artifact type must define:

- Universal schema inheritance.
- Artifact specification.
- Workflow states.
- Producing capabilities.
- Consuming capabilities.
- Evidence requirements.
- Approval requirements.
- Versioning rules.
- Immutability rules.
- Audit requirements.
- Extension points.

## 15. Architectural Principles

- Artifacts are the canonical data model.
- Workflow controls artifact movement.
- Capabilities transform artifacts.
- Artifacts never control workflow.
- Artifacts remain immutable after approval.
- Artifacts are versioned.
- Artifacts are traceable.
- Evidence precedes generation.
- Audit history is immutable.
- Implementations are replaceable.
- The Artifact Model is implementation independent.
- Conversation history is not an artifact.
- Conversation history is not system state.
- No artifact may bypass the Workflow State Machine.
- No artifact may bypass human approval requirements.
