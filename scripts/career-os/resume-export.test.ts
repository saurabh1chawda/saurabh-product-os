import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runCareerOsResumeApprove } from "./resume-approve";
import { runCareerOsResumeExport } from "./resume-export";
import { CareerOsExportError, countPdfPages, renderDocx, renderPdf, requiredConfirmations, resumeLines } from "./resume-export-shared";
import type { ResumeDraft } from "./resume-export-shared";

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

function exportResume(fixture: ReturnType<typeof createFixture>, approvalPath: string, mode: "--dry-run" | "--apply") {
  return runCareerOsResumeExport({ cwd: fixture.workspace, now, argv: ["--approval", approvalPath, mode] });
}

function confirmationFlags(): string[] {
  return requiredConfirmations.map((confirmation) => `--confirm-${confirmation}`);
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
    [paths.strategy, { schema_version: "1.0.0", strategy_id: "RSTRAT-APP-synthetic" }],
    [paths.evidence, { schema_version: "1.0.0", evidence_source_id: "CEV-synthetic" }],
    [paths.application, { schema_version: "1.0.0", application_id: "APP-synthetic" }],
    [paths.opportunity, { schema_version: "1.0.0", opportunity_id: "OPP-synthetic" }],
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
