# Career OS Intake Command

`career-os:intake` creates the first executable link between a local job description and the private Career OS workflow.

## Accepted Input

Use JSON as the canonical structured format:

```json
{
  "company": "Example Company",
  "roleTitle": "Senior Product Manager",
  "jobDescription": "Full job description text...",
  "sourceUrl": "https://example.com/job",
  "capturedAt": "2026-08-24T10:00:00.000Z",
  "location": "Remote",
  "employmentType": "FullTime"
}
```

Markdown is supported as JD body only. Supply required metadata as CLI flags.

## Dry Run

```bash
pnpm career-os:intake -- --input path/to/job.json --dry-run
```

Dry run validates the input, previews stable IDs, runs deterministic JD analysis, and writes nothing.

## Apply

```bash
pnpm career-os:intake -- --input path/to/job.json --apply
```

Apply writes private records under `data/private/application-registry/` only.

## Outputs

The command writes:

- `jd-snapshots/<JD-ID>.json`
- `opportunities/<OPP-ID>.json`
- `decisions/<DEC-ID>.json`
- `applications/<APP-ID>.json`
- `events/<APP-ID>.<EVENT-ID>.json`
- `resume-handoffs/<HANDOFF-ID>.json`

The Resume OS handoff contains references only. It does not generate resume content, DOCX, PDF, or application submissions.

## Decisions

- `pause`: deterministic JD signal exists, but trusted candidate evidence has not been loaded and validated.
- `proceed`: reserved for a future trusted candidate-evidence validation flow. COS-2 does not emit `proceed` from a reference string alone.
- `decline`: the JD lacks enough deterministic role signal to pursue.

## Duplicate Behavior

Identical repeat applies return the existing application identity and create no duplicate records. A materially changed JD with the same company, role, and source fails with an explicit conflict. Stable application identity is based on the company, role, and source identity; snapshot identity is based on normalized JD content.

## Privacy Boundary

Real records must stay under ignored private storage. The command rejects in-repository registry roots outside `data/private/` and verifies the destination is ignored by Git before writing.

## Resume OS Handoff

The handoff manifest is a contract boundary for the next workflow. It is not yet consumed by Resume OS. It carries the application, opportunity, decision, and JD snapshot references plus any candidate evidence reference supplied by the operator. In COS-2, that reference is preserved for human review but is not treated as validated evidence.

## Current Limitations

COS-2 does not generate resumes, submit applications, calculate numerical fit scores, call AI providers, or expose writable UI behavior. Apply mode rolls back durable record files if a later record write fails, but registry directory/config creation is a recoverable setup boundary rather than a cross-file transaction.
