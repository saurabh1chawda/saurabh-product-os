# Portfolio Workspace

## Purpose

Portfolio Workspace is the first Phase 3 execution pilot for Career Companion. It establishes the bounded context that will operationalize approved portfolio plans without changing the Planning Layer.

## Architectural Position

The architectural direction is:

Foundation -> Intelligence -> Planning -> Execution -> Workspace/Experience

Portfolio Workspace consumes an approved immutable PortfolioPlan from Portfolio Planner and derives mutable PortfolioExecution state inside the execution bounded context.

## Aggregate Boundary

PortfolioExecution is the aggregate root for the pilot. PortfolioExecution owns PortfolioWorkItem, ArtifactCandidate, and AcceptedArtifact entities directly. One approved Portfolio Plan roadmap item maps to one work item in the pilot.

Progress is derived. Terminal outcomes remain deferred. Execution facts are immutable.

## Planning Boundary

PortfolioPlan is immutable upstream input. Planning artifacts are never modified by Portfolio Workspace.

Portfolio Workspace must not add execution state to Planning. Execution does not directly revise, re-run, or invoke Planning.

## Human Approval Boundary

Artifact candidates are noncanonical. Accepted artifacts require explicit human acceptance. Accepted artifacts are immutable once accepted.

## AI Boundary

AI providers remain outside the domain. AI output may only enter the domain as an artifact candidate. AI output cannot become accepted automatically.

## Dependency Rules

Allowed dependency direction:

Foundation -> Intelligence -> Planning -> Execution -> Workspace/Experience

Prohibited dependencies and coupling:

- Planning depending on Portfolio Workspace
- UI inside the domain
- infrastructure inside domain decisions
- AI-provider imports
- browser dependencies
- workflow-engine dependencies
- dependency cycles

## Pilot Scope

This package does not introduce:

- a universal execution pipeline
- a shared execution kernel
- a workflow engine
- a shared approval framework
- a shared artifact framework
- a generic task-management framework

## Planned Internal Structure

- `aggregate`: PortfolioExecution aggregate root.
- `entities`: PortfolioWorkItem, artifact candidate, and accepted artifact entities owned by the aggregate.
- `value-objects`: immutable identifiers, source references, snapshot references, approval references, and command context objects.
- `facts`: immutable execution facts produced by successful transitions.
- `models`: lifecycle and outcome models.
- `projections`: derived execution progress and summary views.
- `policies`: deterministic invariant helpers.
- `errors`: Portfolio Workspace domain errors.
- `shared`: package-local helpers only.

These directories describe the package organization used by the domain model. Application commands, repository ports, and persistence adapters live outside this domain package.

## Current Implementation Status

Package scaffolding is complete. Core domain identifiers are implemented for ExecutionId, WorkItemId, CandidateId, and AcceptedArtifactId. Planning-to-execution references and command context are implemented for PortfolioPlanReference, PlanSnapshotReference, ApprovalReference, and PortfolioExecutionCommandContext. Lifecycle vocabulary is implemented for PortfolioExecutionLifecycle, PortfolioWorkItemLifecycle, and ArtifactCandidateLifecycle. The Portfolio Workspace domain error catalog is implemented. Supporting entities are implemented for PortfolioWorkItem, ArtifactCandidate, and AcceptedArtifact. The structural and behavioral PortfolioExecution aggregate is implemented. PortfolioExecution initialization now has an intention-revealing domain creation path that starts in Initialized lifecycle, rejects duplicate initial owned entities, creates no accepted artifacts, and returns PortfolioExecutionInitializedFact. Candidate acceptance now atomically creates and records one immutable AcceptedArtifact. Immutable domain facts are implemented for successful aggregate operations, including initialization and the execution-start fact returned by beginExecution(). Pure domain policies and immutable policy decisions are implemented. Pure domain projections are implemented for read-oriented execution, work-item, candidate, and accepted-artifact summaries.

Behavioral aggregate operations receive operation-specific PortfolioExecutionCommandContext values. Returned facts carry the exact context supplied to the operation.

No supporting Domain Services are currently justified. Structural collection registration is constructor/internal aggregate behavior only; external callers must use intention-revealing aggregate operations such as `acceptCandidate()` rather than direct accepted-artifact recording.

Application services, repository ports, durable persistence adapters, and live PostgreSQL validation are implemented in separate packages. This domain package still has no persistence, UI, AI, HTTP, messaging, workflow, or infrastructure dependencies.

## Deferred Scope

- UI
- runtime composition
- AI providers
- prompts
- artifact content storage
- rendering
- publishing
- deployment adapters
- notifications
- scheduling
- analytics
- shared execution abstractions
- cross-workspace orchestration
