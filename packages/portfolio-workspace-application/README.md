# Portfolio Workspace Application

## Purpose

Portfolio Workspace Application coordinates Portfolio Workspace use cases above the Portfolio Workspace Domain Model.

The package currently implements the Initialize Portfolio Execution, Begin Execution, Activate Work Item, Complete Work Item, Cancel Work Item, Accept Candidate, Reject Candidate, Complete Execution, Cancel Execution, and Get Portfolio Execution application use cases.

## Architectural Position

Portfolio Workspace Application sits between the Portfolio Workspace domain package and future infrastructure or experience layers.

```text
Planning
    ↓
Execution Domain
    ↓
Application Layer
    ↓
Workspace / Experience
```

The application layer coordinates use cases. It does not own PortfolioExecution business rules.

## Inputs

The Initialize Portfolio Execution use case accepts approved Portfolio Workspace initialization references, initial work-item definitions, initial candidate definitions, and immutable command context. Behavioral use cases accept use-case-specific inputs containing execution identity, operation identity where required, and immutable command context.

## Outputs

Mutation use cases return immutable use-case-specific results containing:

- `PortfolioExecutionSummaryProjection`
- the fact returned by the aggregate operation
- `correlationId` derived from that fact

The Get Portfolio Execution query use case returns an immutable summary-only result and may carry caller-supplied correlation metadata. It does not expose facts, aggregates, entities, repository revision, or persistence metadata.

Aggregates never leave the Application Layer.

## Application Responsibilities

Behavioral application services:

- loads `PortfolioExecution` through a repository port
- invokes the relevant `PortfolioExecution` behavior with the operation command context
- saves the changed aggregate through the port
- derives a summary projection from the updated aggregate
- returns an immutable application result with correlation derived from the returned fact

The initialization application service consumes already-approved upstream references, invokes Portfolio Workspace domain initialization behavior, saves the new aggregate through repository creation semantics, derives a summary projection, and returns an immutable result with correlation derived from PortfolioExecutionInitializedFact.

The query application service loads `PortfolioExecution` through the same repository port, derives `PortfolioExecutionSummaryProjection`, and returns the projection without mutating or saving aggregate state.

## Domain Boundary

Business rules remain in the Portfolio Workspace domain package.

The application service must not duplicate lifecycle rules, mutate aggregate internals, construct domain facts manually, or bypass aggregate behavior.

## Repository Port Boundary

`PortfolioExecutionRepository` is a package-local application port. It loads a `PortfolioExecution` with persistence revision metadata and saves the aggregate with an expected revision.

Repository operations are asynchronous because repository ports represent potentially durable or remote I/O boundaries, even when an adapter completes synchronously in memory.

Creation uses no expected revision and returns revision `1`. Updates require the loaded revision and return the advanced revision. Stale saves fail with a technology-neutral repository failure.

No repository implementation is provided in this package.

## Transaction Boundary

The behavioral use-case transaction boundary is:

```text
load aggregate
    ↓
invoke domain behavior
    ↓
save aggregate
    ↓
return result
```

No transaction framework or persistence implementation is introduced.

The initialization transaction boundary is:

```text
approved initialization input
    ↓
domain initialization behavior
    ↓
save new aggregate
    ↓
return result
```

## Does Not Own

This package does not own:

- PortfolioExecution business rules
- repository adapters
- persistence
- database schemas
- controllers
- REST, GraphQL, CLI, or UI
- presentation DTOs
- messaging
- workflow engines
- AI providers
- retries
- cross-workspace orchestration

## Current Implementation Status

Package scaffold, Initialize Portfolio Execution use case, Begin Execution use case, Activate Work Item use case, Complete Work Item use case, Cancel Work Item use case, Accept Candidate use case, Reject Candidate use case, Complete Execution use case, Cancel Execution use case, Get Portfolio Execution query use case, asynchronous revision-aware repository port, repository save-result contracts, repository failure contracts, and not-found error are implemented.

Initialization creates a new PortfolioExecution in Initialized lifecycle from already-approved Portfolio Workspace references and initial owned definitions. Upstream Planning and Approval semantics remain outside this package. Presentation has no initialization handler yet.

Command context and result correlation are aligned: each application service passes the input command context to the aggregate operation, and each result derives `correlationId` from the returned fact.

## Deferred Scope

List/search query services, transaction implementations, controllers, presentation query contracts, authorization, idempotency, messaging, UI, AI, and workflow automation remain deferred. Infrastructure adapters are implemented in infrastructure packages, not in this application package.

The package exposes a test-only repository-contract subpath for adapter validation. Test doubles are not exported from the production package root.
