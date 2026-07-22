# Career Companion Local Development

## 1. Executive Summary

This document defines the local development operating model for Career Companion.

It describes how engineers should run, validate, and safely exercise the system locally once implementation begins.

This document does not define source code, runtime framework, CI/CD, or deployment topology.

## 2. Local Development Principles

- Local development must be safe by default.
- Local state must be isolated from production.
- Local data must be synthetic unless privacy rules explicitly allow otherwise.
- Local services should match architectural boundaries.
- Local test runs should be repeatable.
- Local AI execution must use the approved AI Execution Platform boundary.
- Local search must remain derived.

## 3. Local Workspace Expectations

The local workspace should contain:

- Source code organized according to Project Structure.
- Documentation under `docs/career-companion`.
- Local configuration excluded from source control.
- Test fixtures separated from production-like data.
- Generated temporary files excluded when appropriate.
- Clear commands for install, test, lint, architecture checks, and local run once tooling is selected.

## 4. Local Services

Local development may require these service categories:

- PostgreSQL-compatible transactional store.
- S3-compatible object storage.
- OpenSearch-compatible derived search store.
- LiteLLM-compatible AI execution gateway.
- Local observability output.

These services may run locally or be provided through approved shared development environments.

## 5. Local Data Rules

Local data should be:

- Synthetic by default.
- Small enough to reset quickly.
- Isolated by developer or test namespace.
- Safe to delete.
- Free of private candidate data unless explicitly permitted by privacy controls.

Do not commit:

- Local database dumps.
- Artifact binaries.
- Generated private resumes.
- Screenshots containing sensitive information.
- Secrets or tokens.
- Provider credentials.

## 6. Local Execution Flow

Once implementation exists, a local execution rehearsal should verify:

1. API or application request is accepted.
2. Runtime session is created.
3. Workflow instance is loaded.
4. Capability is resolved.
5. AI execution routes through LiteLLM when AI is required.
6. Outputs are validated.
7. Artifacts are registered.
8. Workflow transition is committed.
9. Snapshot is created.
10. Projection is returned.
11. Audit record is available.
12. Search projection is updated or marked pending.

## 7. Local Validation Checklist

Before handing off work:

- Unit tests pass.
- Contract tests pass for changed boundaries.
- Integration tests pass for changed adapters.
- Architecture dependency checks pass.
- Markdown checks pass if documentation changed.
- No secrets appear in source control status.
- No private data appears in tracked files.
- Local service state can be reset.
- Failure path was tested when relevant.

## 8. Reset and Cleanup

Local reset procedures should be documented when implementation tooling is selected.

Reset should safely handle:

- Transactional test data.
- Object storage test artifacts.
- Search projections.
- AI execution test records.
- Temporary files.
- Logs.

Reset must not target production or shared authoritative environments.

## 9. Local AI Development

Local AI work must preserve ADR-010:

- Use the AI Execution Platform.
- Use governed prompt versions.
- Validate structured outputs.
- Record AI execution metadata.
- Avoid direct provider SDK calls from capabilities.
- Avoid raw LLM responses entering workflow state.
- Use synthetic test context where possible.

## 10. Future Evolution

This document should be updated after implementation decisions define:

- Local orchestration tooling.
- Standard development commands.
- Test framework.
- Service startup model.
- Seed data approach.
- Local observability workflow.

Updates must remain aligned with the Architecture Blueprint and Engineering Standards.

