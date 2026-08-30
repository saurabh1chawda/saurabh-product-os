# Career OS Resume Review Overlay

COS-6 keeps generated resume artifacts immutable and moves human decisions into append-only overlays.

## Boundaries

- Blocking evidence defects stay in `evidence_gaps`.
- Attempted unsupported positive claims stay in `excluded_unsupported_claims`.
- Unmet application-fit requirements that are not claimed in the resume stay in `application_fit_gaps`.
- Human acknowledgement of an application-fit gap does not verify missing evidence.
- No artifact in this workflow represents an application-ready or submitted state.

## Immutable Draft And Checklist

Draft schema `1.1.0` may include `application_fit_gaps` with only these classes:

- `acknowledged-application-fit-gap`
- `bounded-claim-control`

Generated checklists remain `pending` forever. They capture required controls and allowed resolution-reason classes, but they are not edited after review and do not contain review-decision IDs.

## Review Decision Overlay

`resume-review-decision` is a private, non-approval artifact. It references the Draft file/material hash and checklist file hash, then records statement, gap, checklist, and section decisions. A review decision must cover every Draft statement exactly once.

Allowed review lifecycles are:

- `revision_required`
- `reviewed_not_approved`

`approval_granted` must always be `false`.

Candidate self-review is allowed only for content review decisions. Export approval requires a stable approver ID that differs from the candidate evidence source ID and from the review-decision reviewer ID.

## Revision Input

`resume-revision-input` references the predecessor Draft, predecessor checklist, prior review decision, Strategy, candidate evidence, and application-gap register. Revised or expanded statements are structured inputs, not executable human prose: each statement uses a closed `template_id`, a single `primary_evidence_id`, optional supporting evidence IDs, and evidence-derived claim atoms. Every executable claim atom must validate against the single primary evidence record; supporting evidence can corroborate but cannot supply missing material atoms. Draft generation renders the final text deterministically and stores a construction proof, including the template, section, primary evidence record hash, supporting IDs, atom projection hash, Strategy references, related application-fit gaps, rendered text hash, and construction-proof hash.

Successor Draft generation must use an explicit `--revision-input` path. Earlier review decisions are upstream inputs to the successor Draft; the successor Draft must not embed its later second review decision.

Human review still assesses wording quality and contextual accuracy. Templates enforce atom and boundary constraints; they do not replace final human review.

## Successor Gap Registers

Application-gap register schema `1.1.0` adds optional successor lineage:

- `predecessor_gap_register_id`
- `predecessor_file_hash`
- `predecessor_material_hash`
- `revision_reason`
- `revision_number`

Legacy schema `1.0.0` registers may omit lineage. A register carrying lineage must use schema `1.1.0`, must not reference itself, and must validate predecessor hashes when checked as a successor.

## Approval And Export

Draft `1.0.0` keeps the existing COS-5 behavior. Non-empty legacy gap arrays remain blocking, and a review-decision overlay cannot add Draft `1.1.0` semantics to a legacy Draft.

Draft `1.1.0` approval requires:

- empty blocking gap arrays;
- a satisfactory `reviewed_not_approved` review-decision overlay;
- every statement decision retained;
- resolved checklist decisions in the overlay;
- only fixed approvable application-fit decisions: `acknowledge-and-exclude` with `acknowledged-gap-claim-excluded`, or `accept-bounded-representation` with `bounded-claim-verified`;
- independent export approver identified by stable `--approver-id`;
- existing explicit document-export confirmations.

Approval and Export share the same compatibility validator. Draft `1.1.0` approval and Export both require an explicit current `--candidate-evidence` path, validate that it is private and trusted, and recompute construction proofs from current evidence before approval or rendering. Export does not trust only the approval artifact's stored evidence hash. The renderer emits only approved visible resume content and must not include application-fit gaps, review metadata, checklist controls, evidence-gap markers, or revision metadata.

Controlled operators should use the exported in-memory builders for review decisions and revision inputs with the complete validation context. The builders compute material hashes and invoke production validators before returning. Operators must not hand-author material hashes or use hash helpers as artifact builders.

All real application artifacts remain under `data/private/`, must be Git-ignored, and are not auto-migrated.
