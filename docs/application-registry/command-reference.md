# Command Reference

Last updated: 2026-07-18

## Registry

- `pnpm application-registry:init`
- `pnpm application-registry:validate`
- `pnpm application-registry:validate-privacy`
- `pnpm application-registry:rebuild-indexes`

## Applications

- `pnpm application-registry:create -- --input <path>`
- `pnpm application-registry:update -- --id <application_id> --input <path>`
- `pnpm application-registry:transition -- --id <application_id> --stage <stage> --reason "<reason>"`
- `pnpm application-registry:link-resume -- --id <application_id> --resume-snapshot <path>`
- `pnpm application-registry:archive -- --id <application_id>`

## Contacts

- `pnpm application-registry:create-contact -- --input <path>`
- `pnpm application-registry:update-contact -- --id <contact_id> --input <path>`
- `pnpm application-registry:link-contact -- --id <application_id> --contact <contact_id>`

## Tasks

- `pnpm application-registry:create-task -- --input <path>`
- `pnpm application-registry:complete-task -- --id <task_id>`
- `pnpm application-registry:list-tasks`

## Operations

- `pnpm application-registry:list`
- `pnpm application-registry:search`
- `pnpm application-registry:show -- --id <application_id>`
- `pnpm application-registry:daily`
- `pnpm application-registry:stale`

