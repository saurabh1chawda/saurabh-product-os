# Data Storage

Last updated: 2026-07-18

## Private Path

Private registry data is stored under:

`data/private/application-registry/`

Subdirectories:

- `applications/`
- `contacts/`
- `events/`
- `tasks/`
- `notes/`
- `indexes/`
- `archive/`

## Git Safety

The private registry path is ignored by Git. Synthetic fixtures live under `docs/application-registry/fixtures/` and are safe to commit.

## Initialization

`pnpm application-registry:init` creates the private directories and default config idempotently. It does not create real application records.

