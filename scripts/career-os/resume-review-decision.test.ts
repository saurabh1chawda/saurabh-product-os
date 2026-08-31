import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildResumeReviewDecision,
  hashResumeReviewDecisionMaterial,
  legacyDraftReviewMigrationMode,
  legacyDraftReviewMigrationSchemaVersion,
  readAndValidateResumeReviewDecision,
  type ReviewableChecklist,
  type ReviewableDraft,
  type ResumeReviewDecisionArtifact
} from "./resume-review-decision";

const now = "2026-08-25T11:00:00.000Z";

describe("career-os resume review decision", () => {
  it("accepts a reviewed-not-approved immutable overlay", () => {
    const fixture = createFixture();

    const result = readAndValidateResumeReviewDecision({
      file: fixture.paths.review,
      cwd: fixture.workspace,
      registryRoot: fixture.registryRoot,
      draft: fixture.draft,
      draftPath: fixture.paths.draft,
      checklist: fixture.checklist,
      checklistPath: fixture.paths.checklist
    });

    expect(result.reviewDecision.lifecycle_state).toBe("reviewed_not_approved");
    expect(result.reviewDecision.approval_granted).toBe(false);
    expect(result.reviewDecision.reviewer.reviewer_role).toBe("candidate-content-reviewer");
  });

  it("accepts a revision-required overlay without export approval", () => {
    const fixture = createFixture({ lifecycle_state: "revision_required" });

    const result = readAndValidateResumeReviewDecision({
      file: fixture.paths.review,
      cwd: fixture.workspace,
      registryRoot: fixture.registryRoot,
      draft: fixture.draft,
      draftPath: fixture.paths.draft,
      checklist: fixture.checklist,
      checklistPath: fixture.paths.checklist
    });

    expect(result.reviewDecision.lifecycle_state).toBe("revision_required");
    expect(result.reviewDecision.approval_granted).toBe(false);
  });

  it("rejects stale draft and checklist hashes", () => {
    const staleDraft = createFixture({ reviewPatch: { draft: { file_hash: "0".repeat(64) } } });
    expect(() =>
      readAndValidateResumeReviewDecision({
        file: staleDraft.paths.review,
        cwd: staleDraft.workspace,
        registryRoot: staleDraft.registryRoot,
        draft: staleDraft.draft,
        draftPath: staleDraft.paths.draft,
        checklist: staleDraft.checklist,
        checklistPath: staleDraft.paths.checklist
      })
    ).toThrow(/draft file hash/u);

    const staleChecklist = createFixture({ reviewPatch: { checklist: { file_hash: "0".repeat(64) } } });
    expect(() =>
      readAndValidateResumeReviewDecision({
        file: staleChecklist.paths.review,
        cwd: staleChecklist.workspace,
        registryRoot: staleChecklist.registryRoot,
        draft: staleChecklist.draft,
        draftPath: staleChecklist.paths.draft,
        checklist: staleChecklist.checklist,
        checklistPath: staleChecklist.paths.checklist
      })
    ).toThrow(/checklist file hash/u);
  });

  it("rejects missing, duplicate and unknown decisions", () => {
    const missing = createFixture({ reviewPatch: { gap_decisions: [] } });
    expect(() => validateFixture(missing)).toThrow(/Missing gap decision/u);

    const missingStatement = createFixture({ reviewPatch: { statement_decisions: [] } });
    expect(() => validateFixture(missingStatement)).toThrow(/Missing statement decision/u);

    const duplicate = createFixture({
      reviewPatch: {
        statement_decisions: [
          { statement_id: "stmt:EV-summary", decision: "retain" },
          { statement_id: "stmt:EV-summary", decision: "retain" }
        ]
      }
    });
    expect(() => validateFixture(duplicate)).toThrow(/Duplicate/u);

    const unknown = createFixture({ reviewPatch: { checklist_decisions: [{ check_id: "missing", decision: "resolved", resolution_reason: "content-reviewed" }] } });
    expect(() => validateFixture(unknown)).toThrow(/Missing checklist decision|Unknown checklist decision/u);
  });

  it("rejects invalid gap compatibility, resolution reasons and material hashes", () => {
    const incompatible = createFixture({ reviewPatch: { gap_decisions: [{ gap_id: "G01", source_gap_class: "bounded-claim-control", decision: "accept-bounded-representation", reviewed_statement_ids: [], checklist_item_id: "application-gap-g01", resolution_reason: "bounded-claim-verified" }] } });
    expect(() => validateFixture(incompatible)).toThrow(/Incompatible gap decision/u);

    const invalidReason = createFixture({
      reviewPatch: {
        checklist_decisions: [
          { check_id: "claim-verification", decision: "resolved", resolution_reason: "acknowledged-gap-claim-excluded" },
          { check_id: "application-gap-g01", decision: "resolved", resolution_reason: "acknowledged-gap-claim-excluded" }
        ]
      }
    });
    expect(() => validateFixture(invalidReason)).toThrow(/Invalid resolution reason/u);

    const invalidHash = createFixture({ preserveReviewHash: true, reviewPatch: { section_decision: "authorize-evidence-backed-expansion" } });
    expect(() => validateFixture(invalidHash)).toThrow(/material hash/u);
  });

  it("rejects approval-like review decisions", () => {
    const fixture = createFixture({ reviewPatch: { approval_granted: true } });

    expect(() => validateFixture(fixture)).toThrow(/must not grant export approval/u);
  });

  it("validated builder computes the material hash and rejects invalid coverage", () => {
    const fixture = createFixture();
    const current = readJson<ResumeReviewDecisionArtifact>(fixture.paths.review);
    const input = { ...current } as Omit<ResumeReviewDecisionArtifact, "integrity"> & { integrity?: unknown };
    delete input.integrity;
    const built = buildResumeReviewDecision(input, reviewContext(fixture));

    expect(built.integrity.material_hash).toBe(hashResumeReviewDecisionMaterial(built));

    const duplicateDraft = {
      ...fixture,
      draft: { ...fixture.draft, selected_achievements: [{ statement_id: "stmt:EV-summary", text: "Duplicate ID." }] }
    };
    expect(() => buildResumeReviewDecision(input, reviewContext(duplicateDraft))).toThrow(/Duplicate or missing draft statement/u);
  });

  it("rejects unsafe review-decision storage, symlinks and credential-like content", () => {
    const publicInput = createFixture();
    expect(() =>
      readAndValidateResumeReviewDecision({
        file: path.join(process.cwd(), "package.json"),
        cwd: process.cwd(),
        registryRoot: publicInput.registryRoot,
        draft: publicInput.draft,
        draftPath: publicInput.paths.draft,
        checklist: publicInput.checklist,
        checklistPath: publicInput.paths.checklist
      })
    ).toThrow(/data\/private|private registry root/u);

    const credential = createFixture();
    writeFileSync(credential.paths.review, "{\"api_key\":\"secret\"}\n");
    expect(() => validateFixture(credential)).toThrow(/credential material/u);

    const symlink = createFixture();
    const link = path.join(symlink.registryRoot, "resume-review-decisions", "review-link.json");
    try {
      symlinkSync(symlink.paths.review, link);
      expect(() =>
        readAndValidateResumeReviewDecision({
          file: link,
          cwd: symlink.workspace,
          registryRoot: symlink.registryRoot,
          draft: symlink.draft,
          draftPath: symlink.paths.draft,
          checklist: symlink.checklist,
          checklistPath: symlink.paths.checklist
        })
      ).toThrow(/Symlink/u);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EPERM") throw error;
    }
  });

  it("rejects reviewed-not-approved overlays with non-satisfactory statement or gap decisions", () => {
    const reviseStatement = createFixture({ reviewPatch: { statement_decisions: [{ statement_id: "stmt:EV-summary", decision: "revise" }] } });
    expect(() => validateFixture(reviseStatement)).toThrow(/requires every statement decision to retain/u);

    const requireEvidenceGap = createFixture({
      reviewPatch: {
        gap_decisions: [{ gap_id: "G01", source_gap_class: "acknowledged-application-fit-gap", decision: "require-evidence", reviewed_statement_ids: [], checklist_item_id: "application-gap-g01", resolution_reason: "content-reviewed" }]
      }
    });
    expect(() => validateFixture(requireEvidenceGap)).toThrow(/Incompatible gap decision|not satisfactory/u);
  });

  it("accepts a valid Draft 1.0.0 legacy migration-only review", () => {
    const fixture = createLegacyMigrationFixture();

    const result = validateFixture(fixture);

    expect(result.reviewDecision.schema_version).toBe("1.1.0");
    expect(result.reviewDecision.review_mode).toBe(legacyDraftReviewMigrationMode);
    expect(result.reviewDecision.migration_only).toBe(true);
    expect(result.reviewDecision.lifecycle_state).toBe("revision_required");
    expect(result.reviewDecision.statement_decisions).toHaveLength(3);
    expect(result.reviewDecision.gap_decisions).toHaveLength(2);
    expect(result.reviewDecision.checklist_decisions).toHaveLength(3);
  });

  it("rejects malformed legacy migration discriminators and approval-like states", () => {
    const wrongDraftSchema = createLegacyMigrationFixture({ draftPatch: { schema_version: "1.1.0" } });
    expect(() => validateFixture(wrongDraftSchema)).toThrow(/only Draft schema_version 1\.0\.0/u);

    const missingMode = createLegacyMigrationFixture({ reviewPatch: { review_mode: undefined } });
    expect(() => validateFixture(missingMode)).toThrow(/legacy migration discriminator/u);

    const wrongMode = createLegacyMigrationFixture({ reviewPatch: { review_mode: "ordinary-review" } });
    expect(() => validateFixture(wrongMode)).toThrow(/legacy migration discriminator/u);

    const missingMigrationOnly = createLegacyMigrationFixture({ reviewPatch: { migration_only: undefined } });
    expect(() => validateFixture(missingMigrationOnly)).toThrow(/legacy migration discriminator/u);

    const wrongLifecycle = createLegacyMigrationFixture({ reviewPatch: { lifecycle_state: "reviewed_not_approved" } });
    expect(() => validateFixture(wrongLifecycle)).toThrow(/revision_required/u);

    const approvalGranted = createLegacyMigrationFixture({ reviewPatch: { approval_granted: true } });
    expect(() => validateFixture(approvalGranted)).toThrow(/must not grant export approval/u);
  });

  it("rejects incomplete legacy migration statement, gap and checklist coverage", () => {
    const duplicateDraftStatement = createLegacyMigrationFixture({
      draftPatch: { selected_achievements: [{ statement_id: "stmt:S1", text: "Duplicate synthetic statement." }] }
    });
    expect(() => validateFixture(duplicateDraftStatement)).toThrow(/Duplicate or missing draft statement/u);

    const missingStatement = createLegacyMigrationFixture({ reviewPatch: { statement_decisions: [{ statement_id: "stmt:S1", decision: "revise" }, { statement_id: "stmt:S2", decision: "revise" }] } });
    expect(() => validateFixture(missingStatement)).toThrow(/Missing statement decision/u);

    const duplicateStatement = createLegacyMigrationFixture({ reviewPatch: { statement_decisions: [{ statement_id: "stmt:S1", decision: "revise" }, { statement_id: "stmt:S1", decision: "revise" }] } });
    expect(() => validateFixture(duplicateStatement)).toThrow(/Duplicate/u);

    const unknownStatement = createLegacyMigrationFixture({ reviewPatch: { statement_decisions: [...legacyStatementDecisions(), { statement_id: "stmt:missing", decision: "revise" }] } });
    expect(() => validateFixture(unknownStatement)).toThrow(/Unknown statement|exactly match/u);

    const duplicateGap = createLegacyMigrationFixture({ draftPatch: { application_level_gaps: [...legacyGaps(), legacyGaps()[0]] } });
    expect(() => validateFixture(duplicateGap)).toThrow(/Duplicate or missing legacy gap/u);

    const missingGap = createLegacyMigrationFixture({ reviewPatch: { gap_decisions: [legacyGapDecisions()[0]] } });
    expect(() => validateFixture(missingGap)).toThrow(/Missing gap decision/u);

    const duplicateGapDecision = createLegacyMigrationFixture({ reviewPatch: { gap_decisions: [legacyGapDecisions()[0], legacyGapDecisions()[0]] } });
    expect(() => validateFixture(duplicateGapDecision)).toThrow(/Duplicate/u);

    const unknownGap = createLegacyMigrationFixture({ reviewPatch: { gap_decisions: [...legacyGapDecisions(), { ...legacyGapDecisions()[0], gap_id: "G99" }] } });
    expect(() => validateFixture(unknownGap)).toThrow(/Unknown gap decision/u);

    const missingChecklist = createLegacyMigrationFixture({ reviewPatch: { checklist_decisions: legacyChecklistDecisions().slice(0, 2) } });
    expect(() => validateFixture(missingChecklist)).toThrow(/Missing checklist decision/u);

    const duplicateChecklist = createLegacyMigrationFixture({ reviewPatch: { checklist_decisions: [legacyChecklistDecisions()[0], legacyChecklistDecisions()[0]] } });
    expect(() => validateFixture(duplicateChecklist)).toThrow(/Duplicate/u);

    const unknownChecklist = createLegacyMigrationFixture({ reviewPatch: { checklist_decisions: [...legacyChecklistDecisions(), { check_id: "missing", decision: "resolved", resolution_reason: "content-reviewed" }] } });
    expect(() => validateFixture(unknownChecklist)).toThrow(/Unknown checklist decision/u);
  });

  it("rejects invalid legacy gap matrix, stale hashes and material tampering", () => {
    const invalidUnresolved = createLegacyMigrationFixture({ reviewPatch: { gap_decisions: [{ ...legacyGapDecisions()[0], decision: "accept-bounded-representation", resolution_reason: "bounded-claim-verified" }, legacyGapDecisions()[1]] } });
    expect(() => validateFixture(invalidUnresolved)).toThrow(/Invalid unresolved legacy gap decision/u);

    const invalidBounded = createLegacyMigrationFixture({ reviewPatch: { gap_decisions: [legacyGapDecisions()[0], { ...legacyGapDecisions()[1], decision: "acknowledge-and-exclude", resolution_reason: "acknowledged-gap-claim-excluded" }] } });
    expect(() => validateFixture(invalidBounded)).toThrow(/Invalid bounded legacy gap decision/u);

    const unsupportedGapState = createLegacyMigrationFixture({ draftPatch: { application_level_gaps: [{ ...legacyGaps()[0], status: "resolved", resolution_state: "resolved" }, legacyGaps()[1]] } });
    expect(() => validateFixture(unsupportedGapState)).toThrow(/Unsupported legacy gap state/u);

    const staleDraft = createLegacyMigrationFixture({ reviewPatch: { draft: { file_hash: "0".repeat(64) } } });
    expect(() => validateFixture(staleDraft)).toThrow(/draft file hash/u);

    const staleChecklist = createLegacyMigrationFixture({ reviewPatch: { checklist: { file_hash: "0".repeat(64) } } });
    expect(() => validateFixture(staleChecklist)).toThrow(/checklist file hash/u);

    const invalidHash = createLegacyMigrationFixture({ preserveReviewHash: true, reviewPatch: { section_decision: "stop-and-reconsider-scope" } });
    expect(() => validateFixture(invalidHash)).toThrow(/material hash/u);
  });
});

function validateFixture(fixture: ReturnType<typeof createFixture>) {
  return readAndValidateResumeReviewDecision({ file: fixture.paths.review, registryRoot: fixture.registryRoot, ...reviewContext(fixture) });
}

function reviewContext(fixture: ReturnType<typeof createFixture>) {
  return {
    cwd: fixture.workspace,
    draft: fixture.draft,
    draftPath: fixture.paths.draft,
    checklist: fixture.checklist,
    checklistPath: fixture.paths.checklist
  };
}

function createFixture(options: { lifecycle_state?: "revision_required" | "reviewed_not_approved"; reviewPatch?: Record<string, unknown>; preserveReviewHash?: boolean } = {}) {
  const workspace = mkdtempSync(path.join(os.tmpdir(), "career-os-review-decision-"));
  const registryRoot = path.join(workspace, "registry");
  const paths = {
    draft: path.join(registryRoot, "resume-drafts", "RDRAFT-synthetic", "resume-draft.json"),
    checklist: path.join(registryRoot, "resume-drafts", "RDRAFT-synthetic", "review-checklist.json"),
    review: path.join(registryRoot, "resume-review-decisions", "RREVIEW-synthetic", "resume-review-decision.json")
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
    application_fit_gaps: [
      {
        gap_id: "G01",
        gap_class: "acknowledged-application-fit-gap",
        allowed_review_dispositions: ["acknowledge-and-exclude"],
        included_statement_ids: []
      }
    ],
    integrity: { material_hash: "draft-material" }
  };
  const checklist: ReviewableChecklist = {
    schema_version: "1.1.0",
    checklist_id: "RCHK-RDRAFT-synthetic",
    draft_id: "RDRAFT-synthetic",
    items: [
      { check_id: "claim-verification", status: "pending", evidence_ids: ["EV-summary"], applicable_gap_ids: [], required_resolution_reason_classes: ["content-reviewed"] },
      { check_id: "application-gap-g01", status: "pending", evidence_ids: ["EV-summary"], applicable_gap_ids: ["G01"], required_resolution_reason_classes: ["acknowledged-gap-claim-excluded"] }
    ]
  };
  writeJson(paths.draft, draft);
  writeJson(paths.checklist, checklist);
  const reviewBase: ResumeReviewDecisionArtifact = mergeRecord(
    {
      schema_version: "1.0.0",
      artifact_type: "resume-review-decision",
      review_decision_id: "RREVIEW-synthetic",
      application_id: "APP-synthetic",
      lifecycle_state: options.lifecycle_state ?? "reviewed_not_approved",
      approval_granted: false,
      reviewer: { reviewer_id: "candidate:synthetic", display_name: "Synthetic Candidate", reviewer_role: "candidate-content-reviewer" },
      reviewed_at: now,
      draft: { draft_id: "RDRAFT-synthetic", source_path: paths.draft, file_hash: fileHash(paths.draft), material_hash: "draft-material" },
      checklist: { checklist_id: "RCHK-RDRAFT-synthetic", source_path: paths.checklist, file_hash: fileHash(paths.checklist) },
      statement_decisions: [{ statement_id: "stmt:EV-summary", decision: "retain" }],
      gap_decisions: [{ gap_id: "G01", source_gap_class: "acknowledged-application-fit-gap", decision: "acknowledge-and-exclude", reviewed_statement_ids: [], checklist_item_id: "application-gap-g01", resolution_reason: "acknowledged-gap-claim-excluded" }],
      checklist_decisions: [
        { check_id: "claim-verification", decision: "resolved", resolution_reason: "content-reviewed" },
        { check_id: "application-gap-g01", decision: "resolved", resolution_reason: "acknowledged-gap-claim-excluded" }
      ],
      section_decision: "keep-sparse-review-draft",
      integrity: { material_hash: "" }
    },
    options.reviewPatch
  ) as ResumeReviewDecisionArtifact;
  if (!options.preserveReviewHash) {
    reviewBase.integrity.material_hash = hashResumeReviewDecisionMaterial(reviewBase);
  }
  writeJson(paths.review, reviewBase);
  return { workspace, registryRoot, paths, draft, checklist };
}

function createLegacyMigrationFixture(options: { draftPatch?: Record<string, unknown>; reviewPatch?: Record<string, unknown>; preserveReviewHash?: boolean } = {}) {
  const workspace = mkdtempSync(path.join(os.tmpdir(), "career-os-legacy-review-decision-"));
  const registryRoot = path.join(workspace, "registry");
  const paths = {
    draft: path.join(registryRoot, "resume-drafts", "RDRAFT-legacy", "resume-draft.json"),
    checklist: path.join(registryRoot, "resume-drafts", "RDRAFT-legacy", "review-checklist.json"),
    review: path.join(registryRoot, "resume-review-decisions", "RREVIEW-legacy", "resume-review-decision.json")
  };
  const draft = mergeRecord(
    {
      schema_version: "1.0.0",
      artifact_type: "evidence-backed-resume-draft",
      draft_id: "RDRAFT-legacy",
      references: { application_id: "APP-synthetic" },
      professional_summary: [
        { statement_id: "stmt:S1", text: "Synthetic reviewed statement one." },
        { statement_id: "stmt:S2", text: "Synthetic reviewed statement two." },
        { statement_id: "stmt:S3", text: "Synthetic reviewed statement three." }
      ],
      core_skills: [],
      role_specific_experience_bullets: [],
      selected_achievements: [],
      education: [],
      certifications: [],
      projects_or_portfolio_evidence: [],
      application_level_gaps: legacyGaps(),
      integrity: { material_hash: "legacy-draft-material" }
    },
    options.draftPatch
  ) as ReviewableDraft;
  const checklist: ReviewableChecklist = {
    schema_version: "1.0.0",
    draft_id: "RDRAFT-legacy",
    items: [
      { check_id: "claim-verification", status: "pending", required_resolution_reason_classes: ["content-reviewed", "evidence-verified"] },
      { check_id: "application-gap-g01", status: "pending", applicable_gap_ids: ["G01"], required_resolution_reason_classes: ["acknowledged-gap-claim-excluded"] },
      { check_id: "application-gap-g02", status: "pending", applicable_gap_ids: ["G02"], required_resolution_reason_classes: ["bounded-claim-verified", "content-reviewed"] }
    ]
  };
  writeJson(paths.draft, draft);
  writeJson(paths.checklist, checklist);
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
      statement_decisions: legacyStatementDecisions(),
      gap_decisions: legacyGapDecisions(),
      checklist_decisions: legacyChecklistDecisions(),
      section_decision: "authorize-evidence-backed-expansion",
      integrity: { material_hash: "" }
    },
    options.reviewPatch
  ) as ResumeReviewDecisionArtifact;
  if (!options.preserveReviewHash) review.integrity.material_hash = hashResumeReviewDecisionMaterial(review);
  writeJson(paths.review, review);
  return { workspace, registryRoot, paths, draft, checklist };
}

function legacyStatementDecisions(): ResumeReviewDecisionArtifact["statement_decisions"] {
  return [
    { statement_id: "stmt:S1", decision: "revise" },
    { statement_id: "stmt:S2", decision: "revise" },
    { statement_id: "stmt:S3", decision: "revise" }
  ];
}

function legacyGapDecisions(): ResumeReviewDecisionArtifact["gap_decisions"] {
  return [
    { gap_id: "G01", source_gap_class: "legacy-unresolved-application-level-gap", decision: "acknowledge-and-exclude", reviewed_statement_ids: [], checklist_item_id: "application-gap-g01", resolution_reason: "acknowledged-gap-claim-excluded" },
    { gap_id: "G02", source_gap_class: "legacy-bounded-application-level-gap", decision: "revise", reviewed_statement_ids: [], checklist_item_id: "application-gap-g02", resolution_reason: "content-reviewed" }
  ];
}

function legacyChecklistDecisions(): ResumeReviewDecisionArtifact["checklist_decisions"] {
  return [
    { check_id: "claim-verification", decision: "resolved", resolution_reason: "content-reviewed" },
    { check_id: "application-gap-g01", decision: "resolved", resolution_reason: "acknowledged-gap-claim-excluded" },
    { check_id: "application-gap-g02", decision: "unresolved", resolution_reason: "content-reviewed" }
  ];
}

function legacyGaps(): NonNullable<ReviewableDraft["application_level_gaps"]> {
  return [
    { gap_id: "G01", status: "unresolved", resolution_state: "requires-human-review" },
    { gap_id: "G02", status: "bounded-claim", resolution_state: "bounded" }
  ];
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
