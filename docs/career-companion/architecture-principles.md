# Career Companion Architecture Principles

## 1. Purpose

Architecture Principles define the enduring rules that govern Career Companion implementation, validation, and future architectural evolution. They preserve the intent of the completed architecture and provide a stable basis for decision-making when tradeoffs arise.

These principles are distinct from:

- Architecture: defines the platform structure, components, workflows, runtime model, interactions, and information model.
- Implementation: defines concrete code, storage, execution mechanics, and runtime behavior.
- Technology Decisions: select specific tools, frameworks, databases, providers, or infrastructure.
- Coding Standards: define implementation-level conventions and code quality rules.

This document does not introduce new architecture. It consolidates the non-negotiable intent already established across Career Companion architecture.

## 2. Governance Principles

**Career OS governs Career Companion**  
Career Companion consumes Career OS protocols, governance, privacy rules, decision gates, and operational discipline. It must not replace or bypass Career OS.

**Workflow governs execution**  
All execution must derive from explicit workflow state, allowed actions, required evidence, required approvals, and next valid states.

**Human approval cannot be bypassed**  
Consequential decisions require the defined human approval gate. Conversation history, automation, convenience, or model confidence cannot substitute for approval.

**Policies override convenience**  
Execution speed, implementation simplicity, or user convenience must not weaken privacy, approval, evidence, workflow, authorization, or audit requirements.

**No hidden progression**  
Workflow state may not advance silently. Every transition must be explicit, valid, recorded, and recoverable.

**Governance is enforced by architecture**  
Governance must be embedded in workflow, orchestration, capability boundaries, evidence validation, approvals, persistence, and audit.

## 3. Information Principles

**Evidence is authoritative**  
Evidence authorizes decisions. Claims, recommendations, approvals, and transitions must trace to valid evidence where evidence is required.

**Memory is advisory**  
Memory may assist execution but cannot authorize decisions, override evidence, create approvals, mutate artifacts, or define workflow state.

**Artifacts carry business information**  
Artifacts represent structured business information and must be versioned, referenced, validated, and approved where required.

**Approved artifacts become immutable**  
Once an artifact version is approved, that version must not be mutated. Corrections require a new version or governed recovery path.

**Every decision is traceable**  
Decisions must reference the actor, reason, timestamp, workflow state, evidence, artifacts, approval where required, and audit record.

**Reference over duplication**  
Components should exchange references to authoritative records instead of duplicating sensitive or authoritative information.

**Current state is a projection**  
Current workflow state and current views are derived from authoritative execution records, snapshots, transitions, approvals, artifacts, and audit history.

## 4. Component Principles

**Single ownership**  
Every architectural concern has one logical owner. Ownership cannot be transferred by implementation convenience.

**Single responsibility**  
Each component must own one bounded responsibility and must not absorb unrelated concerns.

**Explicit contracts**  
Components, capabilities, artifacts, interactions, and workflow states must operate through stable contracts.

**No cyclic dependencies**  
Dependencies must remain acyclic and follow approved architectural direction.

**Components do not redefine architecture**  
Components implement architecture. They do not create new workflow rules, evidence rules, approval rules, or persistence semantics.

**Capabilities are replaceable**  
Capabilities must remain stateless, contract-bound, and replaceable across implementation approaches.

**Repositories preserve truth but do not direct behavior**  
Repositories persist and retrieve architectural objects. They do not govern workflow, authorize decisions, or execute capabilities.

## 5. Runtime Principles

**Runtime Sessions are ephemeral**  
Runtime Sessions carry request-local execution context only. They do not own durable workflow state.

**Workflow Instances are durable**  
Workflow Instances own execution state for one workflow execution. Conversation history and runtime context are not execution state.

**Orchestrator coordinates**  
The Orchestrator coordinates execution. It does not own business logic, workflow definitions, artifacts, evidence, or durable state.

**Runtime executes architecture**  
Runtime behavior must preserve workflow legality, approval gates, evidence authority, persistence boundaries, recovery rules, and audit requirements.

**Failures stop safely**  
Missing evidence, missing approval, invalid artifacts, policy violations, stale state, and capability failures must stop execution in a defined state.

**Recovery appends history**  
Recovery never rewrites history. It records new events, preserves failed attempts, and resumes only through governed execution.

**Idempotency protects integrity**  
Repeated execution must not create duplicate transitions, approvals, snapshots, artifacts, capability executions, or audit records.

## 6. Quality Principles

**Technology serves architecture**  
Technology choices must preserve the architecture. Architecture must not be distorted to fit implementation convenience.

**Privacy by design**  
Sensitive career, application, recruiter, interview, compensation, and evidence data must be minimized, scoped, protected, and referenced rather than duplicated where possible.

**Security by design**  
Identity, authorization, least privilege, policy enforcement, secret handling, and auditability must be integral to execution.

**Observability by design**  
Runtime sessions, correlation IDs, execution IDs, workflow instance IDs, capability IDs, validation results, outcomes, failures, retries, and cancellations must be observable.

**Determinism by default**  
Workflow execution, validation, capability eligibility, transition legality, and approval requirements must be deterministic wherever practical.

**Replaceability by design**  
Capabilities, adapters, repositories, platform services, and future implementations must be replaceable when contracts and governance are preserved.

**Auditability by design**  
Consequential actions must leave an audit trail sufficient for review, recovery, compliance, and trust.

## 7. Evolution Principles

**Changes must preserve architectural intent**  
Future changes must be evaluated against workflow governance, evidence authority, approval gates, privacy, persistence, audit, and deterministic execution.

**New capabilities require governed introduction**  
New capabilities require a contract, workflow mapping, evidence mapping, approval requirements, compatibility review, validation, and release approval.

**New technologies require architectural fit**  
Technology adoption must demonstrate compatibility with component boundaries, runtime semantics, persistence rules, evidence authority, privacy, security, and observability.

**Deprecated behaviors require controlled retirement**  
Deprecated behavior must have a migration path, compatibility review, validation plan, and clear retirement criteria.

**Extensions must not create bypass paths**  
New workflows, components, integrations, runtime models, or platform services may not bypass workflow, approval, evidence, authorization, persistence, or audit.

**Implementation learning may inform architecture**  
Implementation findings may lead to architecture evolution, but only through deliberate review and documented decision-making.

## 8. Principle Compliance

Future Architecture Decision Records, implementation plans, tests, reviews, and release decisions should validate against these principles.

Compliance checks should ask:

- Does the change preserve Career OS governance?
- Does workflow still govern execution?
- Are required human approval gates preserved?
- Are evidence and memory kept separate?
- Are artifacts versioned and immutable after approval?
- Is every consequential decision traceable?
- Are component responsibilities and dependencies preserved?
- Does runtime remain deterministic, recoverable, and observable?
- Does recovery append history rather than rewriting it?
- Are privacy, security, and authorization preserved?
- Does the change avoid technology-specific architectural distortion?

Code reviews and architecture reviews should treat principle violations as design defects, not stylistic preferences.
