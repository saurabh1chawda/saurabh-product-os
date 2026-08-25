# Career OS Resume Approval and Export

COS-5 moves a private evidence-backed resume draft into a human-approved document export. It does not submit applications.

## Approval

Run approval only after a human reviewer has resolved every checklist item.

```bash
pnpm career-os:resume-approve -- \
  --draft data/private/application-registry/resume-drafts/<DRAFT-ID>/resume-draft.json \
  --reviewer "<human reviewer name>" \
  --confirm-factual-accuracy \
  --confirm-chronology \
  --confirm-employer-title-accuracy \
  --confirm-metric-accuracy \
  --confirm-ownership-collaboration-wording \
  --confirm-projected-versus-achieved-wording \
  --confirm-contact-information \
  --confirm-absence-of-unsupported-claims \
  --confirm-approval-for-export \
  --apply
```

Use `--dry-run` instead of `--apply` to validate the approval path without writing files.

The command writes a private approval record under:

```text
data/private/application-registry/resume-approvals/<APPROVAL-ID>/resume-approval.json
```

Approval authorizes document export only. It does not authorize job submission.

## Export

Run export only from a current `approved_for_export` approval record.

```bash
pnpm career-os:resume-export -- \
  --approval data/private/application-registry/resume-approvals/<APPROVAL-ID>/resume-approval.json \
  --apply
```

Use `--dry-run` instead of `--apply` to validate the export path without writing files.

The command writes private DOCX/PDF exports and a manifest under:

```text
data/private/application-registry/resume-exports/<EXPORT-ID>/
```

The export manifest must reach `export_validated` before the documents are considered ready for operator review.
