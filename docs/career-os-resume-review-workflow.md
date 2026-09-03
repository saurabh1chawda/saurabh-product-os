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

Revision-input schema `1.1.0` requires construction proof schema `2.0.0` for revision-derived statements. Proof v2 adds canonical structured-metric projections for `metric-outcome` from the primary evidence record's `{ value, unit, state }` metric object. Multi-atom prose claims also carry a deterministic same-source clause projection recomputed from the current primary evidence statement; supporting evidence cannot supply or repair missing claim atoms. Proof v2 separates candidate claim atoms from non-rendered boundary-control projections for `bounded-product-work`; boundary controls are derived from the current bounded application-fit gap and register hashes, bind status, resolution, boundary, and safety flags, constrain representation, and must never render as resume facts.

Schema `1.1.0` Strategy support references are closed handles, not free-form notes. The accepted forms are `strategy.evidence_to_requirement_mapping[index]`, `strategy.supported_positioning_themes[index]`, `strategy.recommended_resume_sections_or_emphasis[index]`, and `strategy.application_level_gaps[gap-id]`. Builders canonicalize valid unique selected vectors before hashing; persisted artifacts must already store canonical syntax and ordering. Each handle must resolve in the current Strategy and remain semantically linked to the statement's primary evidence, target section, or bounded gap-control role. Section handles cannot stand alone as positive claim support, and application-gap handles are limited to bounded product-work controls. This is not automatic minimal-reference inference or one universal semantic-vector selection: the operator selects among semantically eligible references, and every selected reference must remain relevant. Draft generation, approval, and Export revalidate proof-v2 handles against the current Strategy so arbitrary, stale, unrelated, noncanonical, or review-only references fail closed.

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

Historical Draft `1.0.0` artifacts may be referenced by a schema `1.1.0` migration-only review decision only when the artifact declares `review_mode: "legacy-draft-1.0-revision-migration"`, `migration_only: true`, `lifecycle_state: "revision_required"`, and `approval_granted: false`. This mode validates statements, legacy `application_level_gaps`, and generated checklist items for complete HR provenance, but it is usable only as upstream revision-input provenance. It does not make the predecessor Draft reviewed, approved, exportable, application-ready, or compatible with Draft `1.1.0` application-fit semantics.

Draft `1.1.0` approval requires:

- empty blocking gap arrays;
- a satisfactory `reviewed_not_approved` review-decision overlay;
- every statement decision retained;
- resolved checklist decisions in the overlay;
- only fixed approvable application-fit decisions: `acknowledge-and-exclude` with `acknowledged-gap-claim-excluded`, or `accept-bounded-representation` with `bounded-claim-verified`;
- independent export approver identified by stable `--approver-id`;
- existing explicit document-export confirmations.

Approval and Export share the same compatibility validator. Draft `1.1.0` approval and Export both require an explicit current `--candidate-evidence` path, validate that it is private and trusted, and recompute construction proofs from current evidence before approval or rendering. Bounded proof v2 statements also require current application-gap register provenance so stale boundary controls fail closed independently at Draft, approval, and Export time. Current production-validated register rows are authoritative for gap and boundary semantics; Draft application-fit-gap rows supply only Draft-specific generated disposition and included-statement linkage, and approval/Export reconcile both sources before accepting bounded proof v2. Export does not trust only the approval artifact's stored evidence hash. The renderer emits only approved visible resume content and must not include application-fit gaps, review metadata, checklist controls, evidence-gap markers, proof metadata, boundary controls, or revision metadata.

Controlled operators should use the exported in-memory builders for review decisions and revision inputs with the complete validation context. The builders compute material hashes and invoke production validators before returning. Operators must not hand-author material hashes or use hash helpers as artifact builders.

All real application artifacts remain under `data/private/`, must be Git-ignored, and are not auto-migrated.
