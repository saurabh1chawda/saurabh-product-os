# Career OS Pilot Workspace Review

## Current Repository Structure

The repository is organized as a Product OS application plus Career OS documentation and operating systems.

Top-level folders observed:

- `.agents/`: agent-related local metadata.
- `.codex/`: Codex-related local metadata.
- `.github/`: GitHub repository automation and metadata.
- `.next/`: generated Next.js build output.
- `.pnpm-store/`: package-manager cache.
- `.qa/`: local QA artifacts.
- `app/`: Next.js App Router routes.
- `blueprint/`: product blueprint assets.
- `components/`: reusable React components.
- `content/`: MDX/content assets rendered by the Product OS application.
- `data/`: app data and private local data.
- `docs/`: documentation, operating systems, release notes, fixtures, reports, and pilot materials.
- `lib/`: application utility and data-loading code.
- `node_modules/`: installed dependencies.
- `public/`: static public assets.
- `repositories/`: standalone flagship product package sources retained in the monorepo.
- `scripts/`: local operational and validation scripts.
- `styles/`: global styles.

## Current Artifact Locations

- Resume OS architecture and canonical data: `docs/resume-os/`.
- JD Intelligence outputs and fixtures: `docs/resume-os/jd-intelligence/`.
- Resume Assembly samples and generated outputs: `docs/resume-os/assembly/`.
- Resume Export outputs: `docs/resume-os/export/outputs/`.
- eBay live pilot artifacts: `docs/resume-os/pilots/ebay/`.
- Application Registry fixtures and reports: `docs/application-registry/fixtures/` and `docs/application-registry/reports/`.
- Application Intelligence reports: `docs/application-intelligence/reports/`.
- Career Operations Console docs: `docs/career-console/`.
- Release documentation: `docs/releases/`.
- Pilot governance: `docs/career-os-pilot/`.

## Documentation Locations

- Product and release documentation lives under `docs/`.
- Runtime route documentation is embedded in App Router pages under `app/`.
- Career OS module documentation is split by module:
  - `docs/resume-os/`
  - `docs/application-registry/`
  - `docs/application-intelligence/`
  - `docs/career-console/`
  - `docs/career-os-pilot/`

## Data Locations

- Public app data: `data/`.
- Private local data: `data/private/`.
- Public-safe synthetic fixtures: `docs/application-registry/fixtures/synthetic-registry/`.
- Resume OS canonical YAML data: `docs/resume-os/data/`.
- Application Intelligence synthetic data: `docs/application-intelligence/data/`.

## Validation Locations

- Resume OS validation scripts: `scripts/resume-os/`.
- Application Registry validation scripts: `scripts/application-registry/`.
- Application Intelligence validation script: `scripts/application-intelligence/`.
- Career Console validation script: `scripts/career-console/`.
- Validation reports:
  - `docs/application-registry/reports/`
  - `docs/application-intelligence/reports/`
  - `docs/resume-os/**/validation-summary.json`
  - `docs/resume-os/export/export-validation-summary.*`

## Generated-Output Locations

- Next.js build output: `.next/`.
- Resume Assembly generated outputs: `docs/resume-os/assembly/generated/`.
- Resume Export fixture outputs: `docs/resume-os/export/outputs/fixtures/`.
- eBay pilot generated outputs: `docs/resume-os/pilots/ebay/generated/`.
- eBay pilot export outputs: `docs/resume-os/pilots/ebay/export/`.
- Application Intelligence generated reports: `docs/application-intelligence/reports/`.

## Existing Strengths

- Major Career OS modules already have dedicated documentation folders.
- Runtime app code and operating-system documentation are separated.
- Private data has an explicit `data/private/` location.
- Public-safe fixtures are clearly labelled as synthetic.
- Validation scripts are grouped by operational system.
- Release and governance documentation are separated from module implementation docs.
- Live pilot artifacts are isolated under `docs/resume-os/pilots/`.

## Gaps

- There was no dedicated Career OS pilot workspace for cross-module pilot artifacts.
- Pilot observations, pilot-level reports, screenshots, logs, and validation snapshots did not have a single documented home.
- Naming conventions for real pilot IDs were not centralized.
- Archive expectations for completed pilot material were not documented.
- The difference between module-specific generated outputs and pilot-level operating artifacts needed clearer guidance.

## Recommended Workspace

Career OS pilot materials should use:

```text
docs/career-os-pilot/
├── README.md
├── pilot-charter.md
├── pilot-governance.md
├── operating-procedures.md
├── success-metrics.md
├── glossary.md
├── pilot-decision-log.md
├── workspace-review.md
├── workspace-standards.md
├── workspace-guide.md
└── pilot-workspace/
    ├── artifacts/
    ├── archive/
    ├── logs/
    ├── reports/
    ├── screenshots/
    ├── templates/
    └── validation-outputs/
```

The `pilot-workspace/` directory is for pilot-level organization only. It must not replace existing module-specific folders such as `docs/resume-os/`, `docs/application-registry/`, or `docs/application-intelligence/`.

## Rationale

Keeping the pilot workspace under `docs/career-os-pilot/` avoids creating broad top-level folders that could be confused with runtime application code, generated build output, or public website content. It also keeps pilot governance and pilot operations together while preserving existing module boundaries.

## Items Intentionally Left Unchanged

- `app/`: runtime routes remain unchanged.
- `components/`: UI components remain unchanged.
- `lib/`: runtime data-loading and utility code remain unchanged.
- `scripts/`: validation and operations commands remain unchanged.
- `docs/resume-os/`: Resume OS module artifacts remain in place.
- `docs/application-registry/`: registry docs, schemas, fixtures, and reports remain in place.
- `docs/application-intelligence/`: intelligence docs and reports remain in place.
- `docs/career-console/`: console documentation remains in place.
- `data/private/`: private data remains in its existing local-first location.
- `docs/releases/`: frozen release documentation remains unchanged.

