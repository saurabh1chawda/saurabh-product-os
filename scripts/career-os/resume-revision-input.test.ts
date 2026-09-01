import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { hashResumeReviewDecisionMaterial, legacyDraftReviewMigrationMode, legacyDraftReviewMigrationSchemaVersion, type ResumeReviewDecisionArtifact, type ReviewableChecklist, type ReviewableDraft } from "./resume-review-decision";
import {
  buildResumeRevisionInput,
  hashResumeRevisionInputMaterial,
  readAndValidateResumeRevisionInput,
  type ResumeRevisionInputArtifact,
  type TrustedEvidenceSource
} from "./resume-revision-input";
import { canonicalMetricProjection } from "./resume-construction-proof";

const now = "2026-08-25T12:00:00.000Z";

describe("career-os resume revision input", () => {
  it("accepts evidence-backed revised statements and expansion items", () => {
    const fixture = createFixture();

    const result = validateFixture(fixture);

    expect(result.revisionInput.lifecycle_state).toBe("human_review_required");
    expect(result.revisionInput.revised_statements[0].target_section).toBe("summary");
    expect(result.revisionInput.revised_statements[0].template_id).toBe("action-outcome");
    expect(result.revisionInput.expansion_items[0].target_section).toBe("experience-bullets");
  });

  it("rejects unsupported sections and duplicate statement IDs", () => {
    const unsupported = createFixture({ revisionPatch: { revised_statements: [{ ...validStatement(), target_section: "education" }] } });
    expect(() => validateFixture(unsupported)).toThrow(/Unsupported revision target section/u);

    const duplicate = createFixture({
      revisionPatch: {
        expansion_items: [{ ...validStatement(), statement_id: "stmt:revision-summary", target_section: "experience-bullets", predecessor_statement_id: undefined }]
      }
    });
    expect(() => validateFixture(duplicate)).toThrow(/Duplicate/u);
  });

  it("rejects unknown evidence and predecessor statement IDs", () => {
    const unknownEvidence = createFixture({ revisionPatch: { revised_statements: [{ ...validStatement(), trusted_evidence_ids: ["EV-missing"] }] } });
    expect(() => validateFixture(unknownEvidence)).toThrow(/Trusted evidence IDs|Unknown/u);

    const unknownPredecessor = createFixture({ revisionPatch: { revised_statements: [{ ...validStatement(), predecessor_statement_id: "stmt:missing" }] } });
    expect(() => validateFixture(unknownPredecessor)).toThrow(/Unknown predecessor/u);
  });

  it("rejects stale linked hashes", () => {
    const staleDraft = createFixture({ revisionPatch: { predecessor_draft: { file_hash: "0".repeat(64) } } });
    expect(() => validateFixture(staleDraft)).toThrow(/predecessor draft file hash/u);

    const staleReview = createFixture({ revisionPatch: { prior_review_decision: { material_hash: "0".repeat(64) } } });
    expect(() => validateFixture(staleReview)).toThrow(/prior review decision material hash/u);
  });

  it("rejects unsupported employer, dates, active-gap contradiction and bounded strengthening", () => {
    const employer = createFixture({ revisionPatch: { revised_statements: [{ ...validStatement(), claim_atoms: { ...validStatement().claim_atoms, employer: "Wrong Employer" } }] } });
    expect(() => validateFixture(employer)).toThrow(/Unsupported employer/u);

    const dates = createFixture({ revisionPatch: { revised_statements: [{ ...validStatement(), claim_atoms: { ...validStatement().claim_atoms, dates: "1999-2001" } }] } });
    expect(() => validateFixture(dates)).toThrow(/Unsupported dates/u);

    const contradiction = createFixture({ revisionPatch: { revised_statements: [{ ...validStatement(), boundary_class: "acknowledged-application-fit-gap", related_application_fit_gap_ids: ["G01"] }] } });
    expect(() => validateFixture(contradiction)).toThrow(/cannot generate positive|acknowledged-application-fit-gap/u);

    const strengthening = createFixture({ revisionPatch: { revised_statements: [{ ...validStatement(), boundary_class: "bounded-claim-control", template_id: "metric-outcome" }] } });
    expect(() => validateFixture(strengthening)).toThrow(/bounded template|bounded-claim-control|metric_value/u);
  });

  it("rejects arbitrary prose, unsupported metrics and unsupported action atoms", () => {
    const arbitrary = createFixture({ revisionPatch: { revised_statements: [{ ...validStatement(), text: "Unrelated positive prose with a valid evidence ID." }] } });
    expect(() => validateFixture(arbitrary)).toThrow(/templates, not free-form text/u);

    const metric = createFixture({
      revisionPatch: {
        revised_statements: [
          {
            ...validStatement(),
            template_id: "metric-outcome",
            claim_atoms: { action: "Improved", object: "synthetic product strategy", metric_value: "900", metric_unit: "%" }
          }
        ]
      }
    });
    expect(() => validateFixture(metric)).toThrow(/Unsupported metric_value/u);

    const action = createFixture({ revisionPatch: { revised_statements: [{ ...validStatement(), claim_atoms: { ...validStatement().claim_atoms, action: "Invented" } }] } });
    expect(() => validateFixture(action)).toThrow(/Unsupported action/u);
  });

  it("accepts revision-input 1.1 structured metrics without granting them to schema 1.0", () => {
    const fixture = createFixture({
      evidencePatch: {
        evidence_items: [
          {
            evidence_id: "EV-summary",
            statement: "Improved synthetic product strategy at Synthetic Labs during 2024-Present with measurable outcomes.",
            employer: "Synthetic Labs",
            dates: "2024-Present",
            status: "verified",
            metric: { value: "42", unit: "%", state: "claimed in source" }
          }
        ]
      }
    });
    const metricKey = canonicalMetricProjection(fixture.evidence.evidence_items[0]).metric_key;
    const metricStatement = {
      ...validStatement(),
      template_id: "metric-outcome",
      claim_atoms: { ...validStatement().claim_atoms, metric_value: "42", metric_unit: "%" },
      selected_metric_key: metricKey
    };
    const valid = createFixture({
      evidencePatch: fixture.evidence,
      revisionPatch: {
        schema_version: "1.1.0",
        revised_statements: [metricStatement],
        expansion_items: []
      }
    });
    expect(validateFixture(valid).revisionInput.schema_version).toBe("1.1.0");

    const downgraded = createFixture({
      evidencePatch: fixture.evidence,
      revisionPatch: {
        revised_statements: [metricStatement],
        expansion_items: []
      }
    });
    expect(() => validateFixture(downgraded)).toThrow(/1\.0\.0 cannot use proof v2/u);
  });

  it("rejects cross-record atom composition and supporting evidence substitutes", () => {
    const crossEmployer = createFixture({
      evidencePatch: {
        evidence_items: [
          { evidence_id: "EV-summary", statement: "Improved synthetic product strategy with measurable outcomes.", employer: "Other Labs", dates: "2024-Present", status: "verified" },
          { evidence_id: "EV-employer", statement: "Synthetic Labs profile context.", employer: "Synthetic Labs", status: "verified" }
        ]
      },
      revisionPatch: { revised_statements: [{ ...validStatement(), supporting_evidence_ids: ["EV-employer"], trusted_evidence_ids: ["EV-summary", "EV-employer"] }] }
    });
    expect(() => validateFixture(crossEmployer)).toThrow(/Unsupported employer/u);

    const duplicateSupporting = createFixture({ revisionPatch: { revised_statements: [{ ...validStatement(), supporting_evidence_ids: ["EV-support", "EV-support"], trusted_evidence_ids: ["EV-summary", "EV-support", "EV-support"] }] } });
    expect(() => validateFixture(duplicateSupporting)).toThrow(/Duplicate supporting evidence/u);

    const primaryRepeated = createFixture({ revisionPatch: { revised_statements: [{ ...validStatement(), supporting_evidence_ids: ["EV-summary"], trusted_evidence_ids: ["EV-summary", "EV-summary"] }] } });
    expect(() => validateFixture(primaryRepeated)).toThrow(/Primary evidence cannot be repeated/u);
  });

  it("rejects material hash mismatch and approval-like lifecycle", () => {
    const badHash = createFixture({ preserveRevisionHash: true, revisionPatch: { created_by: "Altered Reviewer" } });
    expect(() => validateFixture(badHash)).toThrow(/material hash/u);

    const approvalLifecycle = createFixture({ revisionPatch: { lifecycle_state: "approved_for_export" } });
    expect(() => validateFixture(approvalLifecycle)).toThrow(/human_review_required/u);
  });

  it("validated builder computes the material hash and rejects invalid revision inputs", () => {
    const fixture = createFixture();
    const current = readJson<ResumeRevisionInputArtifact>(fixture.paths.revision);
    const input = { ...current } as Omit<ResumeRevisionInputArtifact, "integrity"> & { integrity?: unknown };
    delete input.integrity;
    const built = buildResumeRevisionInput(input, revisionContext(fixture));

    expect(built.integrity.material_hash).toBe(hashResumeRevisionInputMaterial(built));

    const invalid = {
      ...input,
      revised_statements: [{ ...input.revised_statements[0], claim_atoms: { ...input.revised_statements[0].claim_atoms, employer: "Other Labs" } }]
    };
    expect(() => buildResumeRevisionInput(invalid, revisionContext(fixture))).toThrow(/Unsupported employer/u);
  });

  it("rejects unsafe revision-input storage, symlinks and credential-like content", () => {
    const publicInput = createFixture();
    expect(() =>
      readAndValidateResumeRevisionInput({
        file: path.join(process.cwd(), "package.json"),
        cwd: process.cwd(),
        registryRoot: publicInput.registryRoot,
        predecessorDraft: publicInput.draft,
        predecessorDraftPath: publicInput.paths.draft,
        predecessorChecklist: publicInput.checklist,
        predecessorChecklistPath: publicInput.paths.checklist,
        priorReviewDecision: publicInput.review,
        priorReviewDecisionPath: publicInput.paths.review,
        strategy: publicInput.strategy,
        strategyPath: publicInput.paths.strategy,
        candidateEvidence: publicInput.evidence,
        candidateEvidencePath: publicInput.paths.evidence,
        applicationGapRegister: publicInput.register,
        applicationGapRegisterPath: publicInput.paths.register
      })
    ).toThrow(/data\/private|private registry root/u);

    const credential = createFixture();
    writeFileSync(credential.paths.revision, "{\"token\":\"secret\"}\n");
    expect(() => validateFixture(credential)).toThrow(/credential material/u);

    const symlink = createFixture();
    const link = path.join(symlink.registryRoot, "resume-revision-inputs", "revision-link.json");
    try {
      symlinkSync(symlink.paths.revision, link);
      expect(() =>
        readAndValidateResumeRevisionInput({
          file: link,
          cwd: symlink.workspace,
          registryRoot: symlink.registryRoot,
          predecessorDraft: symlink.draft,
          predecessorDraftPath: symlink.paths.draft,
          predecessorChecklist: symlink.checklist,
          predecessorChecklistPath: symlink.paths.checklist,
          priorReviewDecision: symlink.review,
          priorReviewDecisionPath: symlink.paths.review,
          strategy: symlink.strategy,
          strategyPath: symlink.paths.strategy,
          candidateEvidence: symlink.evidence,
          candidateEvidencePath: symlink.paths.evidence,
          applicationGapRegister: symlink.register,
          applicationGapRegisterPath: symlink.paths.register
        })
      ).toThrow(/Symlink/u);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EPERM") throw error;
    }
  });

  it("accepts a legacy migration review as Draft 1.0.0 revision provenance", () => {
    const fixture = createLegacyRevisionFixture();

    const result = validateFixture(fixture);

    expect(result.revisionInput.prior_review_decision.review_decision_id).toBe("RREVIEW-legacy");
    expect(result.revisionInput.lifecycle_state).toBe("human_review_required");
  });

  it("rejects ordinary Draft 1.0.0 reviews and migration reviews targeting Draft 1.1.0", () => {
    const ordinary = createLegacyRevisionFixture({
      reviewPatch: { schema_version: "1.0.0", review_mode: undefined, migration_only: undefined }
    });
    expect(() => validateFixture(ordinary)).toThrow(/requires a legacy migration review decision/u);

    const wrongTarget = createFixture({
      reviewPatch: {
        schema_version: legacyDraftReviewMigrationSchemaVersion,
        review_mode: legacyDraftReviewMigrationMode,
        migration_only: true
      }
    });
    expect(() => validateFixture(wrongTarget)).toThrow(/cannot target Draft 1\.1\.0/u);
  });

  it("rejects stale legacy migration review linkage and approval-like revision lifecycle", () => {
    const staleFileHash = createLegacyRevisionFixture({ revisionPatch: { prior_review_decision: { file_hash: "0".repeat(64) } } });
    expect(() => validateFixture(staleFileHash)).toThrow(/prior review decision file hash/u);

    const staleMaterialHash = createLegacyRevisionFixture({ revisionPatch: { prior_review_decision: { material_hash: "0".repeat(64) } } });
    expect(() => validateFixture(staleMaterialHash)).toThrow(/prior review decision material hash/u);

    const wrongDraft = createLegacyRevisionFixture({ revisionPatch: { predecessor_draft: { draft_id: "RDRAFT-other" } } });
    expect(() => validateFixture(wrongDraft)).toThrow(/predecessor draft ID/u);

    const wrongChecklist = createLegacyRevisionFixture({ revisionPatch: { predecessor_checklist: { checklist_id: "RCHK-other" } } });
    expect(() => validateFixture(wrongChecklist)).toThrow(/predecessor checklist ID/u);

    const approvalLifecycle = createLegacyRevisionFixture({ revisionPatch: { lifecycle_state: "approved_for_export" } });
    expect(() => validateFixture(approvalLifecycle)).toThrow(/human_review_required/u);
  });
});

function validateFixture(fixture: ReturnType<typeof createFixture>) {
  return readAndValidateResumeRevisionInput({ file: fixture.paths.revision, cwd: fixture.workspace, registryRoot: fixture.registryRoot, ...revisionContext(fixture) });
}

function revisionContext(fixture: ReturnType<typeof createFixture>) {
  return {
    predecessorDraft: fixture.draft,
    predecessorDraftPath: fixture.paths.draft,
    predecessorChecklist: fixture.checklist,
    predecessorChecklistPath: fixture.paths.checklist,
    priorReviewDecision: fixture.review,
    priorReviewDecisionPath: fixture.paths.review,
    strategy: fixture.strategy,
    strategyPath: fixture.paths.strategy,
    candidateEvidence: fixture.evidence,
    candidateEvidencePath: fixture.paths.evidence,
    applicationGapRegister: fixture.register,
    applicationGapRegisterPath: fixture.paths.register
  };
}

function validStatement() {
  return {
    statement_id: "stmt:revision-summary",
    predecessor_statement_id: "stmt:EV-summary",
    target_section: "summary",
    template_id: "action-outcome",
    claim_atoms: {
      employer: "Synthetic Labs",
      dates: "2024-Present",
      action: "Improved",
      object: "synthetic product strategy",
      outcome: "measurable outcomes"
    },
    primary_evidence_id: "EV-summary",
    supporting_evidence_ids: [],
    trusted_evidence_ids: ["EV-summary"],
    strategy_support_references: ["strategy.mapping:product"],
    related_application_fit_gap_ids: [],
    boundary_class: "ordinary-evidence-backed",
    human_review_required: true
  };
}

function createFixture(options: { revisionPatch?: Record<string, unknown>; reviewPatch?: Record<string, unknown>; evidencePatch?: Record<string, unknown>; preserveRevisionHash?: boolean } = {}) {
  const workspace = mkdtempSync(path.join(os.tmpdir(), "career-os-revision-input-"));
  const registryRoot = path.join(workspace, "registry");
  const paths = {
    draft: path.join(registryRoot, "resume-drafts", "RDRAFT-synthetic", "resume-draft.json"),
    checklist: path.join(registryRoot, "resume-drafts", "RDRAFT-synthetic", "review-checklist.json"),
    review: path.join(registryRoot, "resume-review-decisions", "RREVIEW-synthetic", "resume-review-decision.json"),
    strategy: path.join(registryRoot, "resume-strategies", "RSTRAT-synthetic.json"),
    evidence: path.join(registryRoot, "candidate-evidence", "CEV-synthetic.json"),
    register: path.join(registryRoot, "application-gap-registers", "GAPREG-synthetic.json"),
    revision: path.join(registryRoot, "resume-revision-inputs", "RREVINPUT-synthetic", "resume-revision-input.json")
  };
  const draft: ReviewableDraft = {
    schema_version: "1.1.0",
    draft_id: "RDRAFT-synthetic",
    references: { application_id: "APP-synthetic" },
    professional_summary: [{ statement_id: "stmt:EV-summary", text: "Evidence-backed synthetic summary." }],
    core_skills: [],
    role_specific_experience_bullets: [],
    selected_achievements: [],
    education: [],
    certifications: [],
    projects_or_portfolio_evidence: [],
    application_fit_gaps: [{ gap_id: "G01", gap_class: "acknowledged-application-fit-gap", allowed_review_dispositions: ["acknowledge-and-exclude"], included_statement_ids: [] }],
    integrity: { material_hash: "draft-material" }
  };
  const checklist: ReviewableChecklist = { schema_version: "1.1.0", checklist_id: "RCHK-RDRAFT-synthetic", draft_id: "RDRAFT-synthetic", items: [{ check_id: "claim-verification", status: "pending", applicable_gap_ids: [] }] };
  const strategy = { strategy_id: "RSTRAT-synthetic", integrity: { material_hash: "strategy-material" } };
  const evidence = mergeRecord(
    {
      evidence_source_id: "CEV-synthetic",
      evidence_items: [
        { evidence_id: "EV-summary", statement: "Improved synthetic product strategy at Synthetic Labs during 2024-Present with 42% measurable outcomes.", employer: "Synthetic Labs", dates: "2024-Present", status: "verified" },
        { evidence_id: "EV-support", statement: "Synthetic Labs supporting context.", employer: "Synthetic Labs", status: "verified" }
      ]
    },
    options.evidencePatch
  ) as TrustedEvidenceSource;
  const register = { gap_register_id: "GAPREG-synthetic", integrity: { material_hash: "register-material" } };
  writeJson(paths.draft, draft);
  writeJson(paths.checklist, checklist);
  writeJson(paths.strategy, strategy);
  writeJson(paths.evidence, evidence);
  writeJson(paths.register, register);
  const review: ResumeReviewDecisionArtifact = mergeRecord(
    {
      schema_version: "1.0.0",
      artifact_type: "resume-review-decision",
      review_decision_id: "RREVIEW-synthetic",
      application_id: "APP-synthetic",
      lifecycle_state: "revision_required",
      approval_granted: false,
      reviewer: { reviewer_id: "candidate:synthetic", display_name: "Synthetic Candidate", reviewer_role: "candidate-content-reviewer" },
      reviewed_at: now,
      draft: { draft_id: "RDRAFT-synthetic", source_path: paths.draft, file_hash: fileHash(paths.draft), material_hash: "draft-material" },
      checklist: { checklist_id: "RCHK-RDRAFT-synthetic", source_path: paths.checklist, file_hash: fileHash(paths.checklist) },
      statement_decisions: [{ statement_id: "stmt:EV-summary", decision: "revise" }],
      gap_decisions: [{ gap_id: "G01", source_gap_class: "acknowledged-application-fit-gap", decision: "acknowledge-and-exclude", reviewed_statement_ids: [], checklist_item_id: "claim-verification", resolution_reason: "acknowledged-gap-claim-excluded" }],
      checklist_decisions: [{ check_id: "claim-verification", decision: "resolved", resolution_reason: "content-reviewed" }],
      section_decision: "authorize-evidence-backed-expansion",
      integrity: { material_hash: "" }
    },
    options.reviewPatch
  ) as ResumeReviewDecisionArtifact;
  review.integrity.material_hash = hashResumeReviewDecisionMaterial(review);
  writeJson(paths.review, review);
  const revisionBase: ResumeRevisionInputArtifact = mergeRecord(
    {
      schema_version: "1.0.0",
      artifact_type: "resume-revision-input",
      revision_input_id: "RREVINPUT-synthetic",
      application_id: "APP-synthetic",
      created_at: now,
      created_by: "Synthetic Candidate",
      lifecycle_state: "human_review_required",
      predecessor_draft: { draft_id: "RDRAFT-synthetic", source_path: paths.draft, file_hash: fileHash(paths.draft), material_hash: "draft-material" },
      predecessor_checklist: { checklist_id: "RCHK-RDRAFT-synthetic", source_path: paths.checklist, file_hash: fileHash(paths.checklist) },
      prior_review_decision: { review_decision_id: "RREVIEW-synthetic", source_path: paths.review, file_hash: fileHash(paths.review), material_hash: review.integrity.material_hash },
      strategy: { strategy_id: "RSTRAT-synthetic", source_path: paths.strategy, file_hash: fileHash(paths.strategy), material_hash: "strategy-material" },
      candidate_evidence: { evidence_source_id: "CEV-synthetic", source_path: paths.evidence, file_hash: fileHash(paths.evidence) },
      application_gap_register: { gap_register_id: "GAPREG-synthetic", source_path: paths.register, file_hash: fileHash(paths.register), material_hash: "register-material" },
      revised_statements: [validStatement()],
      expansion_items: [{ ...validStatement(), statement_id: "stmt:expansion", predecessor_statement_id: undefined, target_section: "experience-bullets" }],
      integrity: { material_hash: "" }
    },
    options.revisionPatch
  ) as ResumeRevisionInputArtifact;
  if (!options.preserveRevisionHash) revisionBase.integrity.material_hash = hashResumeRevisionInputMaterial(revisionBase);
  writeJson(paths.revision, revisionBase);
  return { workspace, registryRoot, paths, draft, checklist, review, strategy, evidence, register };
}

function createLegacyRevisionFixture(options: { revisionPatch?: Record<string, unknown>; reviewPatch?: Record<string, unknown>; preserveRevisionHash?: boolean } = {}) {
  const workspace = mkdtempSync(path.join(os.tmpdir(), "career-os-legacy-revision-input-"));
  const registryRoot = path.join(workspace, "registry");
  const paths = {
    draft: path.join(registryRoot, "resume-drafts", "RDRAFT-legacy", "resume-draft.json"),
    checklist: path.join(registryRoot, "resume-drafts", "RDRAFT-legacy", "review-checklist.json"),
    review: path.join(registryRoot, "resume-review-decisions", "RREVIEW-legacy", "resume-review-decision.json"),
    strategy: path.join(registryRoot, "resume-strategies", "RSTRAT-synthetic.json"),
    evidence: path.join(registryRoot, "candidate-evidence", "CEV-synthetic.json"),
    register: path.join(registryRoot, "application-gap-registers", "GAPREG-synthetic-successor.json"),
    revision: path.join(registryRoot, "resume-revision-inputs", "RREVINPUT-legacy", "resume-revision-input.json")
  };
  const draft: ReviewableDraft = {
    schema_version: "1.0.0",
    artifact_type: "evidence-backed-resume-draft",
    draft_id: "RDRAFT-legacy",
    references: { application_id: "APP-synthetic" },
    professional_summary: [{ statement_id: "stmt:S1", text: "Synthetic predecessor statement." }],
    core_skills: [],
    role_specific_experience_bullets: [],
    selected_achievements: [],
    education: [],
    certifications: [],
    projects_or_portfolio_evidence: [],
    application_level_gaps: [{ gap_id: "G01", status: "unresolved", resolution_state: "requires-human-review" }],
    integrity: { material_hash: "legacy-draft-material" }
  };
  const checklist: ReviewableChecklist = { schema_version: "1.0.0", draft_id: "RDRAFT-legacy", items: [{ check_id: "claim-verification", status: "pending", applicable_gap_ids: [] }] };
  const strategy = { strategy_id: "RSTRAT-synthetic", integrity: { material_hash: "strategy-material" } };
  const evidence = {
    evidence_source_id: "CEV-synthetic",
    evidence_items: [
      { evidence_id: "EV-summary", statement: "Improved synthetic product strategy at Synthetic Labs during 2024-Present with measurable outcomes.", employer: "Synthetic Labs", dates: "2024-Present", status: "verified" }
    ]
  } as TrustedEvidenceSource;
  const register = { gap_register_id: "GAPREG-synthetic-successor", integrity: { material_hash: "register-material" }, gaps: [{ gap_id: "G01" }] };
  writeJson(paths.draft, draft);
  writeJson(paths.checklist, checklist);
  writeJson(paths.strategy, strategy);
  writeJson(paths.evidence, evidence);
  writeJson(paths.register, register);
  const review = mergeRecord(
    {
      schema_version: legacyDraftReviewMigrationSchemaVersion,
      artifact_type: "resume-review-decision",
      review_mode: legacyDraftReviewMigrationMode,
      migration_only: true,
      review_decision_id: "RREVIEW-legacy",
      application_id: "APP-synthetic",
      lifecycle_state: "revision_required",
      approval_granted: false,
      reviewer: { reviewer_id: "candidate:synthetic", display_name: "Synthetic Candidate", reviewer_role: "candidate-content-reviewer" },
      reviewed_at: now,
      draft: { draft_id: "RDRAFT-legacy", source_path: paths.draft, file_hash: fileHash(paths.draft), material_hash: "legacy-draft-material" },
      checklist: { checklist_id: "RCHK-RDRAFT-legacy", source_path: paths.checklist, file_hash: fileHash(paths.checklist) },
      statement_decisions: [{ statement_id: "stmt:S1", decision: "revise" }],
      gap_decisions: [{ gap_id: "G01", source_gap_class: "legacy-unresolved-application-level-gap", decision: "acknowledge-and-exclude", reviewed_statement_ids: [], checklist_item_id: "claim-verification", resolution_reason: "acknowledged-gap-claim-excluded" }],
      checklist_decisions: [{ check_id: "claim-verification", decision: "resolved", resolution_reason: "content-reviewed" }],
      section_decision: "authorize-evidence-backed-expansion",
      integrity: { material_hash: "" }
    },
    options.reviewPatch
  ) as ResumeReviewDecisionArtifact;
  review.integrity.material_hash = hashResumeReviewDecisionMaterial(review);
  writeJson(paths.review, review);
  const revisionBase = mergeRecord(
    {
      schema_version: "1.0.0",
      artifact_type: "resume-revision-input",
      revision_input_id: "RREVINPUT-legacy",
      application_id: "APP-synthetic",
      created_at: now,
      created_by: "Synthetic Candidate",
      lifecycle_state: "human_review_required",
      predecessor_draft: { draft_id: "RDRAFT-legacy", source_path: paths.draft, file_hash: fileHash(paths.draft), material_hash: "legacy-draft-material" },
      predecessor_checklist: { checklist_id: "RCHK-RDRAFT-legacy", source_path: paths.checklist, file_hash: fileHash(paths.checklist) },
      prior_review_decision: { review_decision_id: "RREVIEW-legacy", source_path: paths.review, file_hash: fileHash(paths.review), material_hash: review.integrity.material_hash },
      strategy: { strategy_id: "RSTRAT-synthetic", source_path: paths.strategy, file_hash: fileHash(paths.strategy), material_hash: "strategy-material" },
      candidate_evidence: { evidence_source_id: "CEV-synthetic", source_path: paths.evidence, file_hash: fileHash(paths.evidence) },
      application_gap_register: { gap_register_id: "GAPREG-synthetic-successor", source_path: paths.register, file_hash: fileHash(paths.register), material_hash: "register-material" },
      revised_statements: [{ ...validStatement(), predecessor_statement_id: "stmt:S1" }],
      expansion_items: [],
      integrity: { material_hash: "" }
    },
    options.revisionPatch
  ) as ResumeRevisionInputArtifact;
  if (!options.preserveRevisionHash) revisionBase.integrity.material_hash = hashResumeRevisionInputMaterial(revisionBase);
  writeJson(paths.revision, revisionBase);
  return { workspace, registryRoot, paths, draft, checklist, review, strategy, evidence, register };
}

function writeJson(file: string, value: unknown): void {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, "utf8")) as T;
}

function fileHash(file: string): string {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function mergeRecord(base: Record<string, unknown>, patch: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!patch) return base;
  const next = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    next[key] = isPlainObject(value) && isPlainObject(next[key]) ? mergeRecord(next[key] as Record<string, unknown>, value) : value;
  }
  return next;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
