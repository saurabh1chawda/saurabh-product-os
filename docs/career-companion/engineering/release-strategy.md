# Career Companion Release Strategy

## 1. Executive Summary

This document defines the release operating model for Career Companion.

The strategy supports controlled, traceable releases from a modular monolith while preserving architectural governance, safety, and rollback readiness.

This document does not define CI/CD pipelines, deployment platforms, or infrastructure.

## 2. Release Principles

- Release only validated work.
- Preserve architecture integrity.
- Keep release scope explicit.
- Separate release readiness from development completion.
- Favor small, reversible releases.
- Require evidence for release decisions.
- Maintain traceability from release content to ADRs, specs, and code modules.

## 3. Release Types

| Release Type | Purpose | Governance |
| --- | --- | --- |
| Documentation release | Architecture, ADR, or engineering documentation | Documentation validation and review |
| Internal development release | Engineering milestone for local or internal use | Tests, architecture checks, known risks |
| Controlled pilot release | Limited operator-facing functionality | Full validation and manual approval |
| Production release | Stable user-facing release | Release review, rollback plan, monitoring |
| Hotfix release | Urgent correction | Focused approval and post-release review |

## 4. Release Readiness Gates

Release readiness requires:

- Scope defined.
- Changed modules identified.
- ADR impact reviewed.
- Architecture traceability confirmed.
- Tests passing.
- Documentation updated.
- Security and privacy reviewed.
- Observability expectations met.
- Known risks documented.
- Rollback or recovery path identified.

## 5. Versioning Guidance

Versioning should communicate compatibility and release intent.

Until a formal versioning ADR exists:

- Use human-readable release names for planning documents.
- Use semantic versioning principles for externally visible software releases.
- Document compatibility impact for any public contract change.
- Avoid implying production readiness before validation is complete.

## 6. Release Notes

Release notes should include:

- Summary.
- Included changes.
- Affected modules.
- User impact.
- Architecture or ADR impact.
- Migration notes.
- Known risks.
- Validation performed.
- Rollback or recovery guidance.

Release notes should not expose private career data, prompts containing private context, secrets, or sensitive operational records.

## 7. Environment Promotion

Environment promotion should be explicit and controlled.

Recommended promotion path:

1. Local development.
2. Internal validation.
3. Controlled pilot validation.
4. Production release.

Each promotion should use the same architectural boundaries and validation expectations.

## 8. Rollback and Recovery

Every release should identify:

- What can be rolled back.
- What data changes may require recovery.
- Whether migrations are reversible.
- Whether artifacts are immutable.
- Whether search projections require rebuild.
- Whether AI prompt versions require deprecation.

Recovery must preserve audit history.

## 9. Release Freeze

A release freeze may be declared when stabilization matters more than feature development.

During freeze:

- No unrelated feature work enters the release.
- Architecture changes require explicit approval.
- Bug fixes must be scoped.
- Validation results must be retained.
- Known risks must be reviewed before release.

## 10. Future Evolution

This release strategy should evolve after decisions are made for:

- CI/CD tooling.
- Environment management.
- Release automation.
- Versioning policy.
- Deployment platform.
- Operational monitoring.

Future changes must preserve architecture governance and traceability.

