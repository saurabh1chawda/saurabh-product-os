# Career Companion Development Environment

## 1. Executive Summary

This document defines the baseline development environment expectations for Career Companion.

It prepares engineers to begin implementation consistently while preserving architecture, dependency direction, and local development repeatability.

This document does not select programming languages, frameworks, package managers, or deployment tooling.

## 2. Environment Principles

- Local setup must be reproducible.
- Developer machines must not contain untracked production secrets.
- Local services must mirror approved architectural boundaries.
- Development tools must not bypass domain, workflow, repository, AI, or audit boundaries.
- Environment setup must support architecture tests, contract tests, integration tests, and local end-to-end rehearsal.
- Private data must remain private by default.

## 3. Required Local Capabilities

Every engineer should be able to run or access:

- Source control client.
- Markdown editor or IDE.
- Local runtime for the selected implementation language once chosen.
- PostgreSQL-compatible local or remote development database.
- S3-compatible local or remote development object storage.
- OpenSearch-compatible local or remote search environment.
- LiteLLM-compatible local or remote AI gateway environment.
- Test runner once selected.
- Architecture dependency checker once selected.
- Documentation validation tooling once selected.

## 4. Configuration Model

Configuration must be environment-specific and must not be hardcoded.

Expected configuration categories:

- Runtime environment.
- PostgreSQL connection.
- Object storage endpoint and bucket.
- OpenSearch endpoint and index namespace.
- LiteLLM gateway endpoint.
- Provider credentials managed outside capabilities.
- Audit and observability settings.
- Feature flags.
- Local-only development toggles.

Configuration files containing secrets must not be committed.

## 5. Secrets Handling

Secrets must be available only to infrastructure adapters or platform services that require them.

Capabilities must not receive:

- Database credentials.
- Object storage credentials.
- Search credentials.
- AI provider credentials.
- User private tokens.

Local secret files must be ignored by source control. Example names may include `.env`, `.env.local`, `.env.development.local`, and tool-specific secret files.

## 6. Local Service Expectations

Local services should support:

- Fast startup.
- Clear reset procedure.
- Test data isolation.
- Repeatable teardown.
- No accidental use of production resources.
- No storage of real personal career data unless explicitly permitted by privacy controls.

Local dependencies may be containerized, installed directly, or accessed remotely when approved by future engineering decisions.

## 7. Bootstrap Checklist

Before implementation work:

- Repository is up to date.
- Working tree is clean or intentionally dirty.
- Required documentation has been reviewed.
- Local configuration is present.
- Secrets are stored outside tracked files.
- Required local services are reachable.
- Test command is known.
- Architecture validation command is known.
- Branch is created for the change.
- Scope is traceable to the Architecture Traceability Matrix.

## 8. Environment Validation

A development environment is ready when:

- The project can be installed or prepared using approved tooling.
- Local services can be reached.
- Tests can run.
- Markdown and documentation checks can run.
- Architecture checks can run.
- No secrets appear in source control status.
- No production resource is required for ordinary development.

## 9. Troubleshooting Principles

When setup fails:

- Confirm required services are running.
- Confirm local configuration is present.
- Confirm credentials are scoped to development.
- Confirm no capability is attempting direct provider access.
- Confirm repository paths match the Project Structure.
- Record recurring setup friction for future improvement.

## 10. Future Evolution

This document should be updated after future ADRs select:

- Programming language.
- Package manager.
- Test framework.
- Local service orchestration.
- CI validation commands.
- Deployment tooling.

Updates must preserve the approved architecture.

