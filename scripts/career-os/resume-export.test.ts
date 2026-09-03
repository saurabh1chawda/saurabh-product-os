import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runCareerOsResumeApprove } from "./resume-approve";
import { runCareerOsResumeExport } from "./resume-export";
import { hashApplicationGapRegisterMaterial, type ApplicationGapRegister, type ApplicationLevelGap } from "./application-gap-register";
import { buildEvidenceConstructionProof, constructionProofSchemaVersion, renderRevisionStatementText, type TrustedEvidenceItem } from "./resume-construction-proof";
import { CareerOsExportError, countPdfPages, hashJson, renderDocx, renderPdf, requiredConfirmations, resumeLines } from "./resume-export-shared";
import type { ResumeApproval, ResumeDraft } from "./resume-export-shared";
import { hashResumeReviewDecisionMaterial, legacyDraftReviewMigrationMode, legacyDraftReviewMigrationSchemaVersion, type ResumeReviewDecisionArtifact } from "./resume-review-decision";

const now = "2026-08-25T10:00:00.000Z";

describe("career-os controlled resume approval and export", () => {
  it("creates a human approval record for a reviewed draft", () => {
    const fixture = createFixture();
    const result = approve(fixture, "--apply");

    expect(result.status).toBe("created");
    expect(result.approval?.lifecycle_state).toBe("approved_for_export");
    expect(result.approval?.approval_scope).toBe("document_export_only_not_application_submission");
    expect(existsSync(result.output)).toBe(true);
  });

  it("approval dry-run produces zero writes", () => {
    const fixture = createFixture();
    const result = approve(fixture, "--dry-run");

    expect(result.status).toBe("planned");
    expect(existsSync(result.output_dir)).toBe(false);
  });

  it("rejects approval without a reviewer", () => {
    const fixture = createFixture();

    expect(() => runCareerOsResumeApprove({ cwd: fixture.workspace, now, argv: ["--draft", fixture.paths.draft, "--dry-run", ...confirmationFlags()] })).toThrow(/reviewer/u);
  });

  it("rejects candidate self-approval", () => {
    const fixture = createFixture();

    expect(() => runCareerOsResumeApprove({ cwd: fixture.workspace, now, argv: ["--draft", fixture.paths.draft, "--reviewer", "Synthetic Candidate", "--dry-run", ...confirmationFlags()] })).toThrow(/other than the candidate/u);
  });

  it("rejects incomplete review checklists", () => {
    const fixture = createFixture({ checklistStatus: "pending" });

    expect(() => approve(fixture, "--dry-run")).toThrow(/Every review checklist item/u);
  });

  it("rejects unresolved evidence gaps", () => {
    const fixture = createFixture({ draftPatch: { evidence_gaps: [{ requirement: "Unsupported domain", reason: "No evidence.", source: "test" }] } });

    expect(() => approve(fixture, "--dry-run")).toThrow(/Evidence gaps/u);
  });

  it("rejects stale draft evidence hashes", () => {
    const fixture = createFixture();
    writeJson(fixture.paths.evidence, { changed: true });

    expect(() => approve(fixture, "--dry-run")).toThrow(/Candidate evidence hash changed/u);
  });

  it("rejects missing approval confirmations", () => {
    const fixture = createFixture();

    expect(() =>
      runCareerOsResumeApprove({
        cwd: fixture.workspace,
        now,
        argv: ["--draft", fixture.paths.draft, "--reviewer", "Synthetic Reviewer", "--dry-run"]
      })
    ).toThrow(/Missing explicit approval confirmations/u);
  });

  it("keeps duplicate approval idempotent", () => {
    const fixture = createFixture();
    const first = approve(fixture, "--apply");
    const second = approve(fixture, "--apply");

    expect(first.status).toBe("created");
    expect(second.status).toBe("duplicate");
  });

  it("rejects conflicting approval output", () => {
    const fixture = createFixture();
    const first = approve(fixture, "--apply");
    writeJson(first.output, { conflict: true });

    expect(() => approve(fixture, "--apply")).toThrow(/conflicts/u);
  });

  it("approval output does not authorize submission", () => {
    const fixture = createFixture();
    const result = approve(fixture, "--apply");

    expect(JSON.stringify(result.approval)).not.toMatch(/submitted|application-complete/u);
    expect(result.approval?.approval_scope).toBe("document_export_only_not_application_submission");
  });

  it("approves Draft 1.1.0 only with a satisfactory review-decision overlay and independent approver", () => {
    const fixture = createOverlayFixture();
    const result = approveOverlay(fixture, "--apply");

    expect(result.status).toBe("created");
    expect(result.approval?.schema_version).toBe("1.1.0");
    expect(result.approval?.review_decision?.review_decision_id).toBe("RREVIEW-APP-synthetic");
    expect(result.approval?.review_decision?.reviewer).toBe("Synthetic Candidate");
    expect(result.approval?.reviewer).toBe("Synthetic Reviewer");
  });

  it("rejects Draft 1.1.0 approval without a satisfactory overlay", () => {
    const missing = createOverlayFixture({ skipReview: true });
    expect(() =>
      runCareerOsResumeApprove({
        cwd: missing.workspace,
        now,
        argv: ["--draft", missing.paths.draft, "--candidate-evidence", missing.paths.evidence, "--reviewer", "Synthetic Reviewer", "--approver-id", "reviewer:synthetic-reviewer", "--dry-run", ...confirmationFlags()]
      })
    ).toThrow(/review-decision/u);

    const revisionRequired = createOverlayFixture({ reviewPatch: { lifecycle_state: "revision_required" } });
    expect(() => approveOverlay(revisionRequired, "--dry-run")).toThrow(/reviewed_not_approved/u);
  });

  it("does not let Draft 1.0.0 gain compatibility through a review overlay", () => {
    const fixture = createFixture();
    const overlay = createOverlayFixture();

    expect(() =>
      runCareerOsResumeApprove({
        cwd: fixture.workspace,
        now,
        argv: ["--draft", fixture.paths.draft, "--reviewer", "Synthetic Reviewer", "--review-decision", overlay.paths.review, "--dry-run", ...confirmationFlags()]
      })
    ).toThrow(/Draft 1.0.0 cannot gain/u);
  });

  it("does not let Draft 1.0.0 gain compatibility through a migration-only review overlay", () => {
    const fixture = createFixture();
    const overlay = createOverlayFixture({
      reviewPatch: {
        schema_version: legacyDraftReviewMigrationSchemaVersion,
        review_mode: legacyDraftReviewMigrationMode,
        migration_only: true,
        lifecycle_state: "revision_required"
      }
    });

    expect(() =>
      runCareerOsResumeApprove({
        cwd: fixture.workspace,
        now,
        argv: ["--draft", fixture.paths.draft, "--reviewer", "Synthetic Reviewer", "--review-decision", overlay.paths.review, "--dry-run", ...confirmationFlags()]
      })
    ).toThrow(/Draft 1.0.0 cannot gain/u);
  });

  it("rejects Draft 1.1.0 approval when reviewer and approver stable IDs overlap", () => {
    const fixture = createOverlayFixture();
    expect(() =>
      runCareerOsResumeApprove({
        cwd: fixture.workspace,
        now,
        argv: ["--draft", fixture.paths.draft, "--candidate-evidence", fixture.paths.evidence, "--reviewer", "Synthetic Candidate", "--approver-id", "candidate:synthetic", "--review-decision", fixture.paths.review, "--dry-run", ...confirmationFlags()]
      })
    ).toThrow(/candidate|reviewer/i);
  });

  it("rejects non-satisfactory application-fit decisions during approval", () => {
    const fixture = createOverlayFixture({
      reviewPatch: {
        gap_decisions: [{ gap_id: "G01", source_gap_class: "acknowledged-application-fit-gap", decision: "require-evidence", reviewed_statement_ids: [], checklist_item_id: "application-gap-g01", resolution_reason: "content-reviewed" }]
      }
    });
    expect(() => approveOverlay(fixture, "--dry-run")).toThrow(/Incompatible gap decision|not satisfactory|not approvable/u);
  });

  it("requires exact non-empty bounded statement review sets", () => {
    const fixture = createBoundedOverlayFixture();
    expect(approveOverlay(fixture, "--dry-run").summary.draft_id).toBe("RDRAFT-APP-synthetic");

    const empty = createBoundedOverlayFixture({
      reviewPatch: {
        gap_decisions: [{ gap_id: "G02", source_gap_class: "bounded-claim-control", decision: "accept-bounded-representation", reviewed_statement_ids: [], checklist_item_id: "application-gap-g02", resolution_reason: "bounded-claim-verified" }]
      }
    });
    expect(() => approveOverlay(empty, "--dry-run")).toThrow(/non-empty|match exactly/u);

    const superset = createBoundedOverlayFixture({
      reviewPatch: {
        gap_decisions: [{ gap_id: "G02", source_gap_class: "bounded-claim-control", decision: "accept-bounded-representation", reviewed_statement_ids: ["stmt:bounded-g02", "stmt:missing"], checklist_item_id: "application-gap-g02", resolution_reason: "bounded-claim-verified" }]
      }
    });
    expect(() => approveOverlay(superset, "--dry-run")).toThrow(/Unknown reviewed statement|match exactly/u);
  });

  it("approval rejects current bounded register row drift with refreshed hashes and stale Draft row", () => {
    const fixture = createBoundedOverlayFixture();
    rewriteCurrentRegisterGap(fixture, { claim_boundary: "Altered current boundary.", explanation: "Synthetic boundary mutation." });

    expect(() => approveOverlay(fixture, "--dry-run")).toThrow(/Draft\/current-register gap mismatch/u);
    expect(existsSync(path.join(fixture.registryRoot, "resume-approvals"))).toBe(false);
  });

  it("approval rejects stale proof when current bounded row and Draft row are aligned", () => {
    const fixture = createBoundedOverlayFixture();
    const register = rewriteCurrentRegisterGap(fixture, { claim_boundary: "Altered current boundary.", explanation: "Synthetic boundary mutation." });
    alignDraftGapWithCurrentRegister(fixture, register.gaps[0]);
    relinkReviewToCurrentDraft(fixture);

    expect(() => approveOverlay(fixture, "--dry-run")).toThrow(/stale or forged/u);
    expect(existsSync(path.join(fixture.registryRoot, "resume-approvals"))).toBe(false);
  });

  it("approval rejects current Strategy gap-reference drift after refreshed outer hashes", () => {
    const fixture = createBoundedOverlayFixture();
    rewriteStrategyApplicationGap(fixture, { closest_supported_evidence_ids: ["EV-other"] });
    relinkReviewToCurrentDraft(fixture);

    expect(() => approveOverlay(fixture, "--dry-run")).toThrow(/Strategy gap reference must include the primary evidence ID/u);
    expect(existsSync(path.join(fixture.registryRoot, "resume-approvals"))).toBe(false);
  });

  it("export rejects current bounded register row drift after approval with refreshed hashes and stale Draft row", () => {
    const fixture = createBoundedOverlayFixture();
    const approval = approveOverlay(fixture, "--apply");
    rewriteCurrentRegisterGap(fixture, { status: "unresolved", resolution_state: "requires-human-review", explanation: "Synthetic status mutation." });

    expect(() => exportResume(fixture, approval.output, "--dry-run")).toThrow(/Draft\/current-register gap mismatch|not a bounded claim/u);
    expect(existsSync(path.join(fixture.registryRoot, "resume-exports"))).toBe(false);
  });

  it("export rejects stale proof when current bounded row and approval linkage are refreshed", () => {
    const fixture = createBoundedOverlayFixture();
    const approval = approveOverlay(fixture, "--apply");
    const register = rewriteCurrentRegisterGap(fixture, { claim_boundary: "Altered current boundary.", explanation: "Synthetic boundary mutation." });
    alignDraftGapWithCurrentRegister(fixture, register.gaps[0]);
    relinkReviewAndApprovalToCurrentDraft(fixture, approval.output);

    expect(() => exportResume(fixture, approval.output, "--dry-run")).toThrow(/stale or forged/u);
    expect(existsSync(path.join(fixture.registryRoot, "resume-exports"))).toBe(false);
  });

  it("export rejects post-approval Strategy-reference drift after refreshed outer hashes", () => {
    const fixture = createBoundedOverlayFixture();
    const approval = approveOverlay(fixture, "--apply");
    rewriteStrategyApplicationGap(fixture, { human_review_required: false });
    relinkReviewAndApprovalToCurrentDraft(fixture, approval.output);

    expect(() => exportResume(fixture, approval.output, "--dry-run")).toThrow(/Strategy gap reference is missing bounded safety flags/u);
    expect(existsSync(path.join(fixture.registryRoot, "resume-exports"))).toBe(false);
  });

  it("export rejects forged construction proofs against current evidence", () => {
    const fixture = createBoundedOverlayFixture();
    const approval = approveOverlay(fixture, "--apply");
    const draft = readJson<ResumeDraft>(fixture.paths.draft);
    draft.role_specific_experience_bullets[0].construction!.primary_evidence_record_hash = "0".repeat(64);
    draft.integrity.material_hash = "forged-material";
    writeJson(fixture.paths.draft, draft);
    const forgedReview = readJson<ResumeReviewDecisionArtifact>(fixture.paths.review);
    forgedReview.draft.file_hash = fileHash(fixture.paths.draft);
    forgedReview.draft.material_hash = "forged-material";
    forgedReview.integrity.material_hash = hashResumeReviewDecisionMaterial(forgedReview);
    writeJson(fixture.paths.review, forgedReview);
    const forgedApproval = readJson<ResumeApproval>(approval.output);
    forgedApproval.draft.draft_hash = fileHash(fixture.paths.draft);
    forgedApproval.draft.material_hash = "forged-material";
    forgedApproval.review_decision!.file_hash = fileHash(fixture.paths.review);
    forgedApproval.review_decision!.material_hash = forgedReview.integrity.material_hash;
    forgedApproval.integrity.draft_hash = forgedApproval.draft.draft_hash;
    forgedApproval.integrity.review_decision_hash = forgedApproval.review_decision!.file_hash;
    forgedApproval.integrity.approval_material_hash = hashJson({ ...forgedApproval, approved_at: "stable", integrity: { ...forgedApproval.integrity, approval_material_hash: "stable" } });
    writeJson(approval.output, forgedApproval);

    expect(() => exportResume(fixture, approval.output, "--dry-run")).toThrow(/construction proof|stale or forged/u);
  });

  it("exports approved DOCX and PDF with a validated manifest", () => {
    const fixture = createFixture();
    const approval = approve(fixture, "--apply");
    const result = exportResume(fixture, approval.output, "--apply");

    expect(result.status).toBe("created");
    expect(result.manifest?.lifecycle_state).toBe("export_validated");
    expect(existsSync(result.outputs.docx)).toBe(true);
    expect(existsSync(result.outputs.pdf)).toBe(true);
    expect(existsSync(result.outputs.manifest)).toBe(true);
    expect(readFileSync(result.outputs.pdf).subarray(0, 5).toString()).toBe("%PDF-");
    expect(result.manifest?.validation.page_count).toBe(countPdfPages(readFileSync(result.outputs.pdf)));
  });

  it("exports approved Draft 1.1.0 without leaking review or application-fit metadata", () => {
    const fixture = createOverlayFixture();
    const approval = approveOverlay(fixture, "--apply");
    const result = exportResume(fixture, approval.output, "--apply");
    const docx = readFileSync(result.outputs.docx, "utf8");
    const pdf = readFileSync(result.outputs.pdf, "latin1");

    expect(result.manifest?.lifecycle_state).toBe("export_validated");
    expect(docx).not.toContain("application_fit_gaps");
    expect(docx).not.toContain("review_decision");
    expect(pdf).not.toContain("application-fit gap");
  });

  it("rejects stale Draft 1.1.0 review-decision linkage at export", () => {
    const fixture = createOverlayFixture();
    const approval = approveOverlay(fixture, "--apply");
    const review = readJson<Record<string, unknown>>(fixture.paths.review);
    writeJson(fixture.paths.review, { ...review, section_decision: "stop-and-reconsider-scope" });

    expect(() => exportResume(fixture, approval.output, "--dry-run")).toThrow(/Review decision file hash changed|material hash/u);
  });

  it("export reruns compatibility and rejects a forged approval with reviewer overlap", () => {
    const fixture = createOverlayFixture();
    const approval = approveOverlay(fixture, "--apply").approval;
    if (!approval) throw new Error("expected approval");
    approval.approver = { approver_id: "candidate:synthetic", display_name: "Synthetic Candidate" };
    approval.integrity.approval_material_hash = hashJson({ ...approval, approved_at: "stable", integrity: { ...approval.integrity, approval_material_hash: "stable" } });
    writeJson(fixture.paths.approval, approval);

    expect(() => exportResume(fixture, fixture.paths.approval, "--dry-run")).toThrow(/candidate|reviewer/i);
  });

  it("renders the approved candidate name from the draft", () => {
    const fixture = createFixture();
    const approval = approve(fixture, "--apply");
    const result = exportResume(fixture, approval.output, "--apply");

    expect(readFileSync(result.outputs.docx, "utf8")).toContain("Synthetic Candidate");
    expect(readFileSync(result.outputs.docx, "utf8")).not.toContain("Saurabh Chawda");
  });

  it("uses standards-compliant DOCX numbering for visible bullets", () => {
    const fixture = createFixture();
    const draft = readJson<ResumeDraft>(fixture.paths.draft);
    const docx = renderDocx(resumeLines(draft));
    const body = docx.toString("utf8");

    expect(body).toContain("word/numbering.xml");
    expect(body).toContain("officeDocument/2006/relationships/numbering");
    expect(body).toContain("<w:numFmt w:val=\"bullet\"/>");
    expect(body).toContain("<w:lvlText w:val=\"•\"/>");
    expect(body).toContain("w:ascii=\"Arial\"");
    expect(body).not.toContain("w:ascii=\"Symbol\"");
    expect(body).toContain("<w:numPr><w:ilvl w:val=\"0\"/><w:numId w:val=\"1\"/></w:numPr>");
  });

  it("renders PDF hierarchy with explicit fonts and neutral spacing", () => {
    const fixture = createFixture();
    const draft = readJson<ResumeDraft>(fixture.paths.draft);
    const pdf = renderPdf(resumeLines(draft));
    const source = pdf.toString("latin1");

    expect(source).toContain("/BaseFont /Helvetica-Bold");
    expect(source).toContain("/F2 16 Tf");
    expect(source).toContain("/F2 11 Tf");
    expect(source).toContain("/F2 10.5 Tf");
    for (const match of source.matchAll(/(-?\d+(?:\.\d+)?)\s+T[wc]/gu)) {
      expect(Number(match[1])).toBe(0);
    }
  });

  it("renders visible PDF bullet markers without rewriting approved bullet text", () => {
    const fixture = createFixture();
    const draft = readJson<ResumeDraft>(fixture.paths.draft);
    const pdf = renderPdf(resumeLines(draft)).toString("latin1");

    expect(pdf).toContain("(\\225 Reduced synthetic platform latency by 42% through focused roadmap execution.)");
    expect(pdf).not.toContain("(- Reduced synthetic platform latency");
  });

  it("aligns wrapped PDF bullet continuation lines with bullet text", () => {
    const fixture = createFixture({
      draftPatch: {
        role_specific_experience_bullets: [
          statement(
            "Delivered a long synthetic product result that wraps across multiple PDF lines while preserving a readable hanging indent for continuation text and keeping the approved wording unchanged across the exported document.",
            "EV-long-wrapped-bullet"
          )
        ]
      }
    });
    const draft = readJson<ResumeDraft>(fixture.paths.draft);
    const pdf = renderPdf(resumeLines(draft)).toString("latin1");

    expect(pdf).toContain("1 0 0 1 72.00");
    expect(pdf).toContain("(\\225 Delivered a long synthetic product result");
    expect(pdf).toContain("1 0 0 1 84.00");
    expect(pdf).not.toContain("(\\225 preserving a readable hanging indent");
  });

  it("rejects generated PDFs over the approved two-page limit", () => {
    const fixture = createFixture({
      draftPatch: {
        role_specific_experience_bullets: Array.from({ length: 110 }, (_, index) =>
          statement(`Delivered synthetic evidence-backed product outcome number ${index + 1} with measurable customer and business value.`, `EV-long-${index}`)
        )
      }
    });
    const approval = approve(fixture, "--apply");

    expect(() => exportResume(fixture, approval.output, "--apply")).toThrow(/Page count exceeds/u);
  });

  it("export dry-run produces zero writes", () => {
    const fixture = createFixture();
    const approval = approve(fixture, "--apply");
    const result = exportResume(fixture, approval.output, "--dry-run");

    expect(result.status).toBe("planned");
    expect(existsSync(result.output_dir)).toBe(false);
  });

  it("exports only approved records", () => {
    const fixture = createFixture();
    writeJson(fixture.paths.approval, { schema_version: "1.0.0", artifact_type: "human-approved-resume-export-approval", lifecycle_state: "review_required" });

    expect(() => exportResume(fixture, fixture.paths.approval, "--dry-run")).toThrow(/approved_for_export/u);
  });

  it("rejects Draft 1.0.0 export approvals with migration-only review linkage", () => {
    const fixture = createFixture();
    const approval = approve(fixture, "--apply");
    const overlay = createOverlayFixture({
      reviewPatch: {
        schema_version: legacyDraftReviewMigrationSchemaVersion,
        review_mode: legacyDraftReviewMigrationMode,
        migration_only: true,
        lifecycle_state: "revision_required"
      }
    });
    const approvalRecord = readJson<ResumeApproval>(approval.output);
    const forgedApproval = {
      ...approvalRecord,
      review_decision: {
        review_decision_id: "RREVIEW-migration",
        source_path: overlay.paths.review,
        file_hash: fileHash(overlay.paths.review),
        material_hash: readJson<ResumeReviewDecisionArtifact>(overlay.paths.review).integrity.material_hash,
        reviewer: "Synthetic Candidate",
        reviewer_id: "candidate:synthetic"
      }
    };
    forgedApproval.integrity.approval_material_hash = hashJson({ ...forgedApproval, approved_at: "stable", integrity: { ...forgedApproval.integrity, approval_material_hash: "stable" } });
    writeJson(approval.output, forgedApproval);

    expect(() => exportResume(fixture, approval.output, "--dry-run")).toThrow(/Draft 1.0.0 export approval must not include review-decision/u);
  });

  it("changed draft invalidates approval", () => {
    const fixture = createFixture();
    const approval = approve(fixture, "--apply");
    const draft = readJson<Record<string, unknown>>(fixture.paths.draft);
    writeJson(fixture.paths.draft, { ...draft, professional_summary: [] });

    expect(() => exportResume(fixture, approval.output, "--dry-run")).toThrow(/Draft file hash changed/u);
  });

  it("identical export is idempotent", () => {
    const fixture = createFixture();
    const approval = approve(fixture, "--apply");
    const first = exportResume(fixture, approval.output, "--apply");
    const second = exportResume(fixture, approval.output, "--apply");

    expect(first.status).toBe("created");
    expect(second.status).toBe("duplicate");
  });

  it("rejects conflicting export output", () => {
    const fixture = createFixture();
    const approval = approve(fixture, "--apply");
    const first = exportResume(fixture, approval.output, "--apply");
    writeJson(first.outputs.manifest, { conflict: true });

    expect(() => exportResume(fixture, approval.output, "--apply")).toThrow(/conflicts/u);
  });

  it("rollback preserves pre-existing files on export failure", () => {
    const fixture = createFixture();
    const approval = approve(fixture, "--apply");
    const marker = path.join(fixture.registryRoot, "resume-exports", "pre-existing.json");
    writeJson(marker, { preserved: true });

    expect(() =>
      runCareerOsResumeExport({
        cwd: fixture.workspace,
        now,
        simulateWriteFailure: true,
        argv: ["--approval", approval.output, "--apply"]
      })
    ).toThrow(CareerOsExportError);
    expect(readFileSync(marker, "utf8")).toContain("preserved");
  });

  it("rejects path traversal approval input", () => {
    const fixture = createFixture();

    expect(() => runCareerOsResumeApprove({ cwd: fixture.workspace, now, argv: ["--draft", "../draft.json", "--reviewer", "Synthetic Reviewer", "--dry-run", ...confirmationFlags()] })).toThrow(/Path traversal/u);
  });

  it("handles symlink rejection portably", () => {
    const fixture = createFixture();
    const link = path.join(fixture.workspace, "approval-link.json");
    const approval = approve(fixture, "--apply");
    try {
      symlinkSync(approval.output, link);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "EPERM") {
        const source = readFileSync(path.join(process.cwd(), "scripts", "career-os", "resume-export-shared.ts"), "utf8");

        expect(source).toContain("lstatSync(file).isSymbolicLink()");
        return;
      }
      throw error;
    }

    expect(() => exportResume(fixture, link, "--dry-run")).toThrow(/Symlink inputs/u);
  });

  it("rejects credential-like input", () => {
    const fixture = createFixture();
    const draft = readJson<Record<string, unknown>>(fixture.paths.draft);
    writeJson(fixture.paths.draft, { ...draft, unsafe: "api_key=synthetic" });

    expect(() => approve(fixture, "--dry-run")).toThrow(/credential/u);
  });

  it("normal CLI output does not emit resume content", () => {
    const fixture = createFixture();
    const stdout = execFileSync(
      process.execPath,
      [
        "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
        "--experimental-strip-types",
        path.join(process.cwd(), "scripts", "career-os", "resume-approve.ts"),
        "--draft",
        fixture.paths.draft,
        "--reviewer",
        "Synthetic Reviewer",
        "--dry-run",
        ...confirmationFlags()
      ],
      { cwd: fixture.workspace, encoding: "utf8" }
    );

    expect(stdout).toContain("Approval ID:");
    expect(stdout).not.toContain("Sensitive Resume Marker");
    expect(stdout).not.toContain("synthetic@example.invalid");
  });

  it("does not use provider, LLM, browser or network primitives", () => {
    const source = [
      readFileSync(path.join(process.cwd(), "scripts", "career-os", "resume-approve.ts"), "utf8"),
      readFileSync(path.join(process.cwd(), "scripts", "career-os", "resume-export.ts"), "utf8"),
      readFileSync(path.join(process.cwd(), "scripts", "career-os", "resume-export-shared.ts"), "utf8")
    ].join("\n");

    expect(source).not.toMatch(/fetch\(|OpenAI|streamText|generateText|api\.openai|puppeteer|playwright|https?\.request/u);
  });
});

type FixtureOptions = {
  checklistStatus?: "pending" | "resolved";
  draftPatch?: Record<string, unknown>;
};

function approve(fixture: ReturnType<typeof createFixture>, mode: "--dry-run" | "--apply") {
  return runCareerOsResumeApprove({
    cwd: fixture.workspace,
    now,
    argv: ["--draft", fixture.paths.draft, "--reviewer", "Synthetic Reviewer", mode, ...confirmationFlags()]
  });
}

function approveOverlay(fixture: ReturnType<typeof createOverlayFixture>, mode: "--dry-run" | "--apply") {
  return runCareerOsResumeApprove({
    cwd: fixture.workspace,
    now,
    argv: ["--draft", fixture.paths.draft, "--candidate-evidence", fixture.paths.evidence, "--reviewer", "Synthetic Reviewer", "--approver-id", "reviewer:synthetic-reviewer", "--review-decision", fixture.paths.review, mode, ...confirmationFlags()]
  });
}

function exportResume(fixture: ReturnType<typeof createFixture>, approvalPath: string, mode: "--dry-run" | "--apply") {
  return runCareerOsResumeExport({ cwd: fixture.workspace, now, argv: ["--approval", approvalPath, "--candidate-evidence", fixture.paths.evidence, mode] });
}

function confirmationFlags(): string[] {
  return requiredConfirmations.map((confirmation) => `--confirm-${confirmation}`);
}

function createOverlayFixture(options: { reviewPatch?: Record<string, unknown>; skipReview?: boolean } = {}) {
  const fixture = createFixture({
    draftPatch: {
      schema_version: "1.1.0",
      professional_summary: [{ statement_id: "stmt:EV-summary", text: "Sensitive Resume Marker: led synthetic product strategy with measurable outcomes.", provenance: { evidence_record_id: "EV-summary" } }],
      core_skills: [{ statement_id: "stmt:EV-skill", text: "Product Strategy", provenance: { evidence_record_id: "EV-skill" } }],
      role_specific_experience_bullets: [{ statement_id: "stmt:EV-bullet", text: "Reduced synthetic platform latency by 42% through focused roadmap execution.", provenance: { evidence_record_id: "EV-bullet" } }],
      selected_achievements: [{ statement_id: "stmt:EV-achievement", text: "Reduced synthetic platform latency by 42% through focused roadmap execution.", provenance: { evidence_record_id: "EV-achievement" } }],
      evidence_gaps: [],
      excluded_unsupported_claims: [],
      application_fit_gaps: [
        {
          gap_id: "G01",
          gap_register_id: "GAPREG-synthetic",
          requirement: "Direct restaurant technology experience",
          normalized_requirement_key: "direct-restaurant-technology-experience",
          gap_class: "acknowledged-application-fit-gap",
          generated_disposition: "generated-exclusion",
          allowed_review_dispositions: ["acknowledge-and-exclude"],
          claim_boundary: "Do not claim direct restaurant technology experience.",
          closest_supported_evidence_ids: ["EV-summary"],
          included_statement_ids: [],
          excluded_from_positive_claims: true,
          human_review_required: true,
          positive_claim_prohibited: true,
          source_reference: "synthetic.application_fit_gaps:G01"
        }
      ]
    }
  });
  const checklist = {
    schema_version: "1.1.0",
    checklist_id: "RCHK-RDRAFT-APP-synthetic",
    draft_id: "RDRAFT-APP-synthetic",
    approval_state: "human_review_required",
    draft: { material_hash: "draft-material" },
    items: [
      {
        check_id: "claim-verification",
        category: "Claim verification",
        prompt: "Verify every statement against its evidence record.",
        status: "pending",
            evidence_ids: ["EV-summary", "EV-bullet", "EV-achievement"],
        applicable_gap_ids: [],
        required_resolution_reason_classes: ["content-reviewed"]
      },
      {
        check_id: "application-gap-g01",
        category: "Application-fit gap review",
        prompt: "Review synthetic application-fit gap.",
        status: "pending",
        evidence_ids: ["EV-summary"],
        applicable_gap_ids: ["G01"],
        required_resolution_reason_classes: ["acknowledged-gap-claim-excluded"]
      }
    ]
  };
  writeJson(fixture.paths.checklist, checklist);
  const paths = {
    ...fixture.paths,
    review: path.join(fixture.registryRoot, "resume-review-decisions", "RREVIEW-APP-synthetic", "resume-review-decision.json")
  };
  const review: ResumeReviewDecisionArtifact = mergeRecord(
    {
      schema_version: "1.0.0",
      artifact_type: "resume-review-decision",
      review_decision_id: "RREVIEW-APP-synthetic",
      application_id: "APP-synthetic",
      lifecycle_state: "reviewed_not_approved",
      approval_granted: false,
      reviewer: { reviewer_id: "candidate:synthetic", display_name: "Synthetic Candidate", reviewer_role: "candidate-content-reviewer" },
      reviewed_at: now,
      draft: { draft_id: "RDRAFT-APP-synthetic", source_path: fixture.paths.draft, file_hash: fileHash(fixture.paths.draft), material_hash: "draft-material" },
      checklist: { checklist_id: "RCHK-RDRAFT-APP-synthetic", source_path: fixture.paths.checklist, file_hash: fileHash(fixture.paths.checklist) },
      statement_decisions: [
        { statement_id: "stmt:EV-summary", decision: "retain" },
        { statement_id: "stmt:EV-skill", decision: "retain" },
        { statement_id: "stmt:EV-bullet", decision: "retain" },
        { statement_id: "stmt:EV-achievement", decision: "retain" }
      ],
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
  review.integrity.material_hash = hashResumeReviewDecisionMaterial(review);
  if (!options.skipReview) writeJson(paths.review, review);
  return { ...fixture, paths, checklist, review };
}

function createBoundedOverlayFixture(options: { reviewPatch?: Record<string, unknown> } = {}) {
  const fixture = createOverlayFixture({ skipReview: true });
  const paths = { ...fixture.paths, register: path.join(fixture.registryRoot, "application-gap-registers", "GAPREG-synthetic.json") };
  const registerPath = paths.register;
  const evidence = readJson<{ evidence_items: TrustedEvidenceItem[] }>(fixture.paths.evidence);
  const boundedEvidence = {
    evidence_id: "EV-bounded",
    statement: "Restaurant-adjacent platform workflows at Synthetic Labs.",
    status: "verified",
    employer: "Synthetic Labs"
  } as const;
  evidence.evidence_items.push(boundedEvidence);
  writeJson(fixture.paths.evidence, evidence);
  const evidenceHash = fileHash(fixture.paths.evidence);
  const registerGap: ApplicationLevelGap = {
    gap_id: "G02",
    requirement: "Direct restaurant technology experience",
    normalized_requirement_key: "direct-restaurant-technology-experience",
    status: "bounded-claim",
    resolution_state: "bounded",
    explanation: "Synthetic evidence supports adjacent platform workflow experience only.",
    claim_boundary: "May describe bounded adjacent platform experience, not direct restaurant technology ownership.",
    closest_supported_evidence_ids: ["EV-bounded"],
    source_reference: "synthetic.application_fit_gaps:G02",
    human_review_required: true,
    positive_claim_prohibited: true
  };
  const register = withRegisterMaterialHash({
    schema_version: "1.1.0",
    artifact_type: "application-level-gap-register",
    gap_register_id: "GAPREG-synthetic",
    application_id: "APP-synthetic",
    jd_snapshot_id: "JD-synthetic",
    opportunity_id: "OPP-synthetic",
    handoff_id: "HANDOFF-synthetic",
    decision_id: "DEC-synthetic",
    decision_reconciliation_id: null,
    candidate_evidence_id: "CEV-synthetic",
    candidate_evidence_hash: evidenceHash,
    created_at: now,
    created_by: "Synthetic Reviewer",
    source_reference: "synthetic.application_gap_register",
    gaps: [registerGap],
    integrity: { material_hash: "" }
  });
  writeJson(registerPath, register);
  const strategy = readJson<Record<string, unknown>>(fixture.paths.strategy);
  writeJson(fixture.paths.strategy, {
    ...strategy,
    evidence_to_requirement_mapping: [{ requirement: "Synthetic bounded platform work", status: "evidence-backed", evidence_ids: ["EV-bounded"], notes: "Synthetic bounded support." }],
    supported_positioning_themes: [{ theme: "Synthetic bounded platform work", status: "evidence-backed", evidence_ids: ["EV-bounded"] }],
    recommended_resume_sections_or_emphasis: [{ section: "experience", recommendation: "Synthetic experience emphasis.", status: "evidence-backed", evidence_ids: ["EV-bounded"] }],
    application_level_gaps: [registerGap]
  });
  const boundedStatement = {
    statement_id: "stmt:bounded-g02",
    target_section: "experience-bullets" as const,
    template_id: "bounded-product-work" as const,
    claim_atoms: { action: "Restaurant-adjacent", object: "platform workflows", employer: "Synthetic Labs" },
    primary_evidence_id: "EV-bounded",
    supporting_evidence_ids: [],
    trusted_evidence_ids: ["EV-bounded"],
    strategy_support_references: ["strategy.application_level_gaps[G02]"],
    related_application_fit_gap_ids: ["G02"],
    boundary_class: "bounded-claim-control" as const,
    human_review_required: true as const
  };
  const boundedGap = {
    ...draftGapFromRegister(registerGap, "GAPREG-synthetic"),
    included_statement_ids: ["stmt:bounded-g02"]
  };
  const draft = readJson<ResumeDraft>(fixture.paths.draft);
  draft.integrity.candidate_evidence_hash = evidenceHash;
  draft.integrity.strategy_hash = fileHash(fixture.paths.strategy);
  draft.references.application_gap_register_id = "GAPREG-synthetic";
  draft.source_provenance.application_gap_register_path = registerPath;
  draft.role_specific_experience_bullets = [
    {
      statement_id: "stmt:bounded-g02",
      text: renderRevisionStatementText(boundedStatement, { proofSchemaVersion: constructionProofSchemaVersion }),
      provenance: { evidence_record_id: "EV-bounded" },
      construction: buildEvidenceConstructionProof(boundedStatement, evidence.evidence_items, {
        proofSchemaVersion: constructionProofSchemaVersion,
        currentRegisterGaps: [registerGap],
        gapRegisterReference: { gap_register_id: "GAPREG-synthetic", file_hash: fileHash(registerPath), material_hash: register.integrity.material_hash }
      })
    }
  ];
  draft.application_fit_gaps = [boundedGap];
  writeJson(fixture.paths.draft, draft);
  const checklist = {
    ...fixture.checklist,
    items: [
      fixture.checklist.items[0],
      {
        check_id: "application-gap-g02",
        category: "Application-fit gap review",
        prompt: "Review bounded synthetic application-fit gap.",
        status: "pending",
        evidence_ids: ["EV-bounded"],
        applicable_gap_ids: ["G02"],
        required_resolution_reason_classes: ["bounded-claim-verified"]
      }
    ]
  };
  writeJson(fixture.paths.checklist, checklist);
  const review = mergeRecord(fixture.review, {
    draft: { file_hash: fileHash(fixture.paths.draft) },
    checklist: { file_hash: fileHash(fixture.paths.checklist) },
    statement_decisions: [
      { statement_id: "stmt:EV-summary", decision: "retain" },
      { statement_id: "stmt:EV-skill", decision: "retain" },
      { statement_id: "stmt:bounded-g02", decision: "retain" },
      { statement_id: "stmt:EV-achievement", decision: "retain" }
    ],
    gap_decisions: [{ gap_id: "G02", source_gap_class: "bounded-claim-control", decision: "accept-bounded-representation", reviewed_statement_ids: ["stmt:bounded-g02"], checklist_item_id: "application-gap-g02", resolution_reason: "bounded-claim-verified" }],
    checklist_decisions: [
      { check_id: "claim-verification", decision: "resolved", resolution_reason: "content-reviewed" },
      { check_id: "application-gap-g02", decision: "resolved", resolution_reason: "bounded-claim-verified" }
    ],
    ...(options.reviewPatch ?? {})
  }) as ResumeReviewDecisionArtifact;
  review.integrity.material_hash = hashResumeReviewDecisionMaterial(review);
  writeJson(fixture.paths.review, review);
  return { ...fixture, paths, checklist, review };
}

function draftGapFromRegister(gap: ApplicationLevelGap, gapRegisterId: string): NonNullable<ResumeDraft["application_fit_gaps"]>[number] {
  return {
    gap_id: "G02",
    gap_register_id: gapRegisterId,
    requirement: gap.requirement,
    normalized_requirement_key: gap.normalized_requirement_key,
    gap_class: "bounded-claim-control" as const,
    generated_disposition: "generated-bounded-control" as const,
    allowed_review_dispositions: ["accept-bounded-representation" as const],
    claim_boundary: gap.claim_boundary,
    closest_supported_evidence_ids: gap.closest_supported_evidence_ids,
    included_statement_ids: [],
    excluded_from_positive_claims: true,
    human_review_required: true as const,
    positive_claim_prohibited: true as const,
    source_reference: gap.source_reference
  };
}

function rewriteCurrentRegisterGap(fixture: ReturnType<typeof createBoundedOverlayFixture>, patch: Partial<ApplicationLevelGap>): ApplicationGapRegister {
  const register = readJson<ApplicationGapRegister>(fixture.paths.register);
  const next = withRegisterMaterialHash({
    ...register,
    gaps: [{ ...register.gaps[0], ...patch }],
    integrity: { material_hash: "" }
  });
  writeJson(fixture.paths.register, next);
  return next;
}

function alignDraftGapWithCurrentRegister(fixture: ReturnType<typeof createBoundedOverlayFixture>, gap: ApplicationLevelGap): void {
  const draft = readJson<ResumeDraft>(fixture.paths.draft);
  draft.application_fit_gaps = [{ ...draftGapFromRegister(gap, "GAPREG-synthetic"), included_statement_ids: ["stmt:bounded-g02"] }];
  writeJson(fixture.paths.draft, draft);
}

function rewriteStrategyApplicationGap(fixture: ReturnType<typeof createBoundedOverlayFixture>, patch: Partial<ApplicationLevelGap>): void {
  const strategy = readJson<{ application_level_gaps: ApplicationLevelGap[] } & Record<string, unknown>>(fixture.paths.strategy);
  strategy.application_level_gaps = [{ ...strategy.application_level_gaps[0], ...patch }];
  writeJson(fixture.paths.strategy, strategy);
  const draft = readJson<ResumeDraft>(fixture.paths.draft);
  draft.integrity.strategy_hash = fileHash(fixture.paths.strategy);
  writeJson(fixture.paths.draft, draft);
}

function relinkReviewAndApprovalToCurrentDraft(fixture: ReturnType<typeof createBoundedOverlayFixture>, approvalPath: string): void {
  const review = relinkReviewToCurrentDraft(fixture);

  const approval = readJson<ResumeApproval>(approvalPath);
  approval.draft.draft_hash = fileHash(fixture.paths.draft);
  approval.integrity.draft_hash = approval.draft.draft_hash;
  approval.review_decision!.file_hash = fileHash(fixture.paths.review);
  approval.review_decision!.material_hash = review.integrity.material_hash;
  approval.integrity.review_decision_hash = approval.review_decision!.file_hash;
  approval.integrity.approval_material_hash = hashJson({
    ...approval,
    approved_at: "stable",
    integrity: { ...approval.integrity, approval_material_hash: "stable" }
  });
  writeJson(approvalPath, approval);
}

function relinkReviewToCurrentDraft(fixture: ReturnType<typeof createBoundedOverlayFixture>): ResumeReviewDecisionArtifact {
  const review = readJson<ResumeReviewDecisionArtifact>(fixture.paths.review);
  review.draft.file_hash = fileHash(fixture.paths.draft);
  review.integrity.material_hash = hashResumeReviewDecisionMaterial(review);
  writeJson(fixture.paths.review, review);
  return review;
}

function withRegisterMaterialHash(register: ApplicationGapRegister): ApplicationGapRegister {
  return { ...register, integrity: { material_hash: hashApplicationGapRegisterMaterial(register) } };
}

function createFixture(options: FixtureOptions = {}) {
  const workspace = mkdtempSync(path.join(os.tmpdir(), "career-os-resume-export-"));
  const registryRoot = path.join(workspace, "registry");
  const paths = {
    strategy: path.join(registryRoot, "resume-strategies", "RSTRAT-APP-synthetic.json"),
    evidence: path.join(registryRoot, "candidate-evidence", "CEV-synthetic.json"),
    application: path.join(registryRoot, "applications", "APP-synthetic.json"),
    opportunity: path.join(registryRoot, "opportunities", "OPP-synthetic.json"),
    jd: path.join(registryRoot, "jd-snapshots", "JD-synthetic.json"),
    draftDir: path.join(registryRoot, "resume-drafts", "RDRAFT-APP-synthetic"),
    draft: path.join(registryRoot, "resume-drafts", "RDRAFT-APP-synthetic", "resume-draft.json"),
    checklist: path.join(registryRoot, "resume-drafts", "RDRAFT-APP-synthetic", "review-checklist.json"),
    approval: path.join(registryRoot, "resume-approvals", "manual.json")
  };
  for (const [file, value] of [
    [paths.strategy, { schema_version: "1.0.0", strategy_id: "RSTRAT-APP-synthetic", decision_state: { decision_reconciliation_id: null } }],
    [paths.evidence, {
      schema_version: "1.0.0",
      evidence_source_id: "CEV-synthetic",
      source_type: "trusted-candidate-profile",
      trust: { verified: true, verified_at: now, verified_by: "synthetic-reviewer", basis: "synthetic fixture" },
      candidate_profile: { candidate_name: "Synthetic Candidate" },
      evidence_items: [
        { evidence_id: "EV-summary", statement: "Sensitive Resume Marker: led synthetic product strategy with measurable outcomes.", status: "verified", employer: "Synthetic Labs" },
        { evidence_id: "EV-skill", statement: "Product Strategy", status: "verified" },
        { evidence_id: "EV-bullet", statement: "Reduced synthetic platform latency by 42% through focused roadmap execution.", status: "verified", employer: "Synthetic Labs", metric_state: "achieved" },
        { evidence_id: "EV-achievement", statement: "Reduced synthetic platform latency by 42% through focused roadmap execution.", status: "verified", employer: "Synthetic Labs", metric_state: "achieved" }
      ]
    }],
    [paths.application, { schema_version: "1.0.0", application_id: "APP-synthetic" }],
    [paths.opportunity, { schema_version: "1.0.0", opportunity_id: "OPP-synthetic", decision_id: "DEC-synthetic" }],
    [paths.jd, { schema_version: "1.0.0", jd_snapshot_id: "JD-synthetic" }]
  ] as Array<[string, unknown]>) writeJson(file, value);

  const strategyHash = fileHash(paths.strategy);
  const evidenceHash = fileHash(paths.evidence);
  const draftBase = createDraftShape(paths, strategyHash, evidenceHash);
  writeJson(paths.draft, { ...draftBase, ...options.draftPatch });
  writeJson(paths.checklist, {
    schema_version: "1.0.0",
    draft_id: "RDRAFT-APP-synthetic",
    approval_state: "human_review_required",
    items: [{ check_id: "claim-verification", category: "Claim", prompt: "Verify.", status: options.checklistStatus ?? "resolved", evidence_ids: ["EV-bullet"] }]
  });
  return { workspace, registryRoot, paths };
}

function createDraftShape(paths: { strategy: string; evidence: string }, strategyHash = "strategy-hash", evidenceHash = "evidence-hash"): ResumeDraft {
  return {
    schema_version: "1.0.0",
    draft_id: "RDRAFT-APP-synthetic",
    created_at: now,
    artifact_type: "evidence-backed-resume-draft",
    lifecycle_state: "human_review_required",
    readiness_state: "human_review_required",
    label: "DRAFT - HUMAN REVIEW REQUIRED - NOT FOR APPLICATION USE",
    candidate_identity: { evidence_source_id: "CEV-synthetic", candidate_name_reference: { evidence_record_id: "EV-name", statement: "Synthetic Candidate" } },
    target: { company: "Synthetic Labs", role: "Lead Product Manager" },
    references: { strategy_id: "RSTRAT-APP-synthetic", application_id: "APP-synthetic", opportunity_id: "OPP-synthetic", jd_snapshot_id: "JD-synthetic", handoff_id: "HANDOFF-synthetic" },
    professional_headline: statement("Senior product leader for evidence-backed platform strategy.", "EV-headline"),
    professional_summary: [statement("Sensitive Resume Marker: led synthetic product strategy with measurable outcomes.", "EV-summary")],
    core_skills: [statement("Product Strategy", "EV-skill")],
    employment_history: [{ employer: "Synthetic Labs", title: "Lead Product Manager", dates: "2024-Present", provenance: { evidence_record_id: "EV-role" }, review_flags: [] }],
    role_specific_experience_bullets: [statement("Reduced synthetic platform latency by 42% through focused roadmap execution.", "EV-bullet")],
    selected_achievements: [statement("Reduced synthetic platform latency by 42% through focused roadmap execution.", "EV-bullet")],
    education: [statement("MBA, Synthetic School.", "EV-education")],
    certifications: [statement("Certified Synthetic Product Practitioner.", "EV-cert")],
    projects_or_portfolio_evidence: [statement("Product OS decision journal for platform modernization.", "EV-project")],
    evidence_gaps: [],
    excluded_unsupported_claims: [],
    review_flags: [],
    source_provenance: { strategy_path: paths.strategy, candidate_evidence_path: paths.evidence },
    integrity: { strategy_hash: strategyHash, candidate_evidence_hash: evidenceHash, material_hash: "draft-material" }
  };
}

function statement(text: string, evidenceId: string) {
  return { text, provenance: { evidence_record_id: evidenceId } };
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
