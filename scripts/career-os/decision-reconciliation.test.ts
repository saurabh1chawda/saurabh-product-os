import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { DecisionReconciliationError, hashDecisionReconciliationMaterial, runCareerOsDecisionReconciliation } from "./decision-reconciliation";
import type { DecisionReconciliation } from "./decision-reconciliation";
import { runCareerOsResumeDraft } from "./resume-draft";
import { runCareerOsResumeStrategy } from "./resume-strategy";

const now = "2026-08-25T12:00:00.000Z";

describe("career-os trusted evidence decision reconciliation", () => {
  it("turns a paused decision into effective proceed when every required competency has verified evidence", () => {
    const fixture = createFixture();
    const result = reconcile(fixture, "--apply");

    expect(result.status).toBe("created");
    expect(result.summary.original_decision_outcome).toBe("pause");
    expect(result.summary.effective_reconciled_outcome).toBe("proceed");
    expect(result.summary.unresolved_gap_count).toBe(0);
    expect(existsSync(result.output_path)).toBe(true);
  });

  it("keeps a paused decision paused when any required competency lacks evidence", () => {
    const fixture = createFixture({ evidenceTags: ["Product Strategy", "Analytics", "Customer Discovery"], sensitiveEvidence: true });
    const result = reconcile(fixture, "--dry-run");
    const stdout = execFileSync(
      process.execPath,
      [
        "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
        "--experimental-strip-types",
        path.join(process.cwd(), "scripts", "career-os", "decision-reconciliation.ts"),
        "--handoff",
        fixture.paths.handoff,
        "--candidate-evidence",
        fixture.paths.evidence,
        "--dry-run"
      ],
      { cwd: fixture.workspace, encoding: "utf8" }
    );

    expect(result.reconciliation).toBeDefined();
    expect(result.summary.original_decision_outcome).toBe("pause");
    expect(result.summary.effective_reconciled_outcome).toBe("pause");
    expect(result.reconciliation?.original_decision_outcome).toBe("pause");
    expect(result.reconciliation?.effective_reconciled_outcome).toBe("pause");
    expect(result.reconciliation?.unresolved_gaps.map((gap) => gap.requirement)).toContain("Platform Thinking");
    expect(result.reconciliation?.effective_reconciled_outcome).not.toBe("proceed");
    expect(existsSync(path.dirname(result.output_path))).toBe(false);
    expect(stdout).toContain("DRY RUN - no reconciliation written");
    expect(stdout).not.toContain("Sensitive Evidence Marker");
    expect(stdout).not.toContain("sensitive@example.invalid");
  });

  it("rejects original decline decisions", () => {
    const fixture = createFixture({ outcome: "decline" });

    expect(() => reconcile(fixture, "--dry-run")).toThrow(/cannot be reactivated/u);
  });

  it("preserves original proceed decisions after validating evidence and record linkage", () => {
    const fixture = createFixture({ outcome: "proceed" });
    const result = reconcile(fixture, "--dry-run");

    expect(result.summary.original_decision_outcome).toBe("proceed");
    expect(result.summary.effective_reconciled_outcome).toBe("proceed");
  });

  it("rejects missing, untrusted, malformed and incomplete trust metadata", () => {
    const missing = createFixture();
    rmSync(missing.paths.evidence);
    expect(() => reconcile(missing, "--dry-run")).toThrow(/File not found/u);

    const untrusted = createFixture({ evidencePatch: { trust: { verified: false } } });
    expect(() => reconcile(untrusted, "--dry-run")).toThrow(/explicitly trusted/u);

    const malformed = createFixture();
    writeFileSync(malformed.paths.evidence, "{");
    expect(() => reconcile(malformed, "--dry-run")).toThrow(/Malformed JSON/u);

    const incomplete = createFixture({ evidencePatch: { trust: { verified: true, verified_at: now, verified_by: "", basis: "" } } });
    expect(() => reconcile(incomplete, "--dry-run")).toThrow(/metadata is incomplete/u);
  });

  it("rejects unsupported evidence status", () => {
    const fixture = createFixture({ evidenceStatus: "human-review-required" });

    expect(() => reconcile(fixture, "--dry-run")).toThrow(/verified evidence items only/u);
  });

  it("maps each supported requirement to exact evidence IDs", () => {
    const fixture = createFixture();
    const result = reconcile(fixture, "--dry-run");
    const mapping = result.reconciliation?.requirement_to_evidence_mapping ?? [];

    expect(mapping).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ requirement: "Product Strategy", status: "supported", evidence_ids: ["EV-product-strategy"] }),
        expect.objectContaining({ requirement: "Analytics", status: "supported", evidence_ids: ["EV-analytics"] }),
        expect.objectContaining({ requirement: "Customer Discovery", status: "supported", evidence_ids: ["EV-customer-discovery"] }),
        expect.objectContaining({ requirement: "Platform Thinking", status: "supported", evidence_ids: ["EV-platform-thinking"] })
      ])
    );
  });

  it("does not let partial or unrelated tags clear a requirement", () => {
    const fixture = createFixture({ evidenceTags: ["Strategy", "Analytic", "Customer", "Platform"] });
    const result = reconcile(fixture, "--dry-run");

    expect(result.summary.effective_reconciled_outcome).toBe("pause");
    expect(result.reconciliation?.unresolved_gaps.map((gap) => gap.requirement)).toContain("Product Strategy");
  });

  it("rejects cross-record ID mismatches", () => {
    const fixture = createFixture({ opportunityPatch: { jd_snapshot_id: "JD-wrong" } });

    expect(() => reconcile(fixture, "--dry-run")).toThrow(/opportunity\/JD ID mismatch/u);
  });

  it("COS-3 rejects every stale linked hash in a reconciliation", () => {
    const fields = ["handoff_hash", "decision_hash", "opportunity_hash", "jd_snapshot_hash", "application_hash", "candidate_evidence_hash"] as const;

    for (const field of fields) {
      const fixture = createFixture();
      const result = reconcile(fixture, "--apply");
      const record = readJson<Record<string, unknown>>(result.output_path);
      record.linked_hashes = { ...(record.linked_hashes as Record<string, string>), [field]: "wrong" };
      writeJson(result.output_path, record);

      expect(() => strategy(fixture, result.output_path, "--dry-run")).toThrow(/reconciliation .* hash mismatch|candidate evidence hash mismatch/u);
    }
  });

  it("COS-3 rejects stale reconciliation identifiers and candidate evidence hash mismatches", () => {
    const fixture = createFixture();
    const result = reconcile(fixture, "--apply");
    const record = readJson<Record<string, unknown>>(result.output_path);
    writeJson(result.output_path, { ...record, application_id: "APP-wrong" });
    expect(() => strategy(fixture, result.output_path, "--dry-run")).toThrow(/reconciliation material hash mismatch/u);

    const recomputedIdentifier: DecisionReconciliation = { ...(record as DecisionReconciliation), application_id: "APP-wrong" };
    recomputedIdentifier.integrity = { material_hash: hashDecisionReconciliationMaterial(recomputedIdentifier) };
    writeJson(result.output_path, recomputedIdentifier);
    expect(() => strategy(fixture, result.output_path, "--dry-run")).toThrow(/reconciliation\/application ID mismatch/u);

    const second = createFixture();
    const secondResult = reconcile(second, "--apply");
    const stale = readJson<Record<string, unknown>>(secondResult.output_path);
    const recomputedEvidenceHash: DecisionReconciliation = { ...(stale as DecisionReconciliation), candidate_evidence_hash: "wrong" };
    recomputedEvidenceHash.integrity = { material_hash: hashDecisionReconciliationMaterial(recomputedEvidenceHash) };
    writeJson(secondResult.output_path, recomputedEvidenceHash);
    expect(() => strategy(second, secondResult.output_path, "--dry-run")).toThrow(/candidate evidence hash mismatch/u);

    const third = createFixture();
    const thirdResult = reconcile(third, "--apply");
    const staleMaterial = readJson<Record<string, unknown>>(thirdResult.output_path);
    writeJson(thirdResult.output_path, { ...staleMaterial, requested_next_workflow_stage: "resume-os-export" });
    expect(() => strategy(third, thirdResult.output_path, "--dry-run")).toThrow(/reconciliation material hash mismatch/u);
  });

  it("rejects path traversal and symlink inputs", () => {
    const traversal = createFixture();
    expect(() =>
      runCareerOsDecisionReconciliation({
        cwd: traversal.workspace,
        now,
        argv: ["--handoff", "../handoff.json", "--candidate-evidence", traversal.paths.evidence, "--dry-run"]
      })
    ).toThrow(/Path traversal/u);

    const fixture = createFixture();
    const link = path.join(fixture.workspace, "handoff-link.json");
    try {
      symlinkSync(fixture.paths.handoff, link);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "EPERM") {
        const source = readFileSync(path.join(process.cwd(), "scripts", "career-os", "decision-reconciliation.ts"), "utf8");
        expect(source).toContain("lstatSync(file).isSymbolicLink()");
        return;
      }
      throw error;
    }
    expect(() =>
      runCareerOsDecisionReconciliation({
        cwd: fixture.workspace,
        now,
        argv: ["--handoff", link, "--candidate-evidence", fixture.paths.evidence, "--dry-run"]
      })
    ).toThrow(/Symlink inputs/u);
  });

  it("rejects unsafe in-repository private destinations", () => {
    const workspace = mkdtempSync(path.join(os.tmpdir(), "career-os-public-reconciliation-"));
    const publicRoot = path.join(process.cwd(), "public-reconciliation-test");
    mkdirSync(publicRoot, { recursive: true });
    const registryRoot = mkdtempSync(path.join(publicRoot, "registry-"));

    try {
      const fixture = createFixture({ workspace, registryRoot });

      expect(() => reconcile(fixture, "--dry-run")).toThrow(/data\/private/u);
    } finally {
      rmSync(publicRoot, { recursive: true, force: true });
    }
  });

  it("dry-run writes nothing and apply writes only append-only reconciliation output", () => {
    const dry = createFixture();
    const dryRun = reconcile(dry, "--dry-run");
    expect(existsSync(path.dirname(dryRun.output_path))).toBe(false);

    const apply = createFixture();
    const result = reconcile(apply, "--apply");
    expect(existsSync(result.output_path)).toBe(true);
    expect(readJson<Record<string, unknown>>(result.output_path).artifact_type).toBe("trusted-evidence-decision-reconciliation");
  });

  it("is deterministic, idempotent, refuses conflicts and preserves pre-existing files", () => {
    const fixture = createFixture();
    const first = reconcile(fixture, "--apply");
    const second = reconcile(fixture, "--apply");
    expect(second.status).toBe("duplicate");
    expect(second.reconciliation?.integrity.material_hash).toBe(first.reconciliation?.integrity.material_hash);

    writeJson(first.output_path, { conflict: true, integrity: { material_hash: "different" } });
    expect(() => reconcile(fixture, "--apply")).toThrow(/conflicts/u);

    const failure = createFixture();
    const marker = path.join(failure.registryRoot, "decision-reconciliations", "pre-existing.json");
    writeJson(marker, { preserved: true });
    expect(() =>
      runCareerOsDecisionReconciliation({
        cwd: failure.workspace,
        now,
        simulateWriteFailure: true,
        argv: ["--handoff", failure.paths.handoff, "--candidate-evidence", failure.paths.evidence, "--apply"]
      })
    ).toThrow(DecisionReconciliationError);
    expect(readFileSync(marker, "utf8")).toContain("preserved");
  });

  it("COS-3 accepts valid reconciliation and records original plus effective outcomes", () => {
    const fixture = createFixture();
    const reconciliation = reconcile(fixture, "--apply");
    const result = strategy(fixture, reconciliation.output_path, "--dry-run");

    expect(result.strategy.decision_state.original_outcome).toBe("pause");
    expect(result.strategy.decision_state.effective_outcome).toBe("proceed");
    expect(result.strategy.decision_state.readiness_state).toBe("human_review_required");
    expect(result.strategy.decision_reconciliation?.reconciliation_id).toBe(reconciliation.summary.reconciliation_id);
  });

  it("COS-3 blocks paused reconciliation with gaps and rejects missing reconciliation for original pause", () => {
    const gap = createFixture({ evidenceTags: ["Product Strategy"] });
    const reconciliation = reconcile(gap, "--apply");
    const blocked = strategy(gap, reconciliation.output_path, "--dry-run");
    expect(blocked.strategy.decision_state.readiness_state).toBe("blocked");

    const missing = createFixture();
    expect(() =>
      runCareerOsResumeStrategy({
        cwd: missing.workspace,
        now,
        argv: ["--handoff", missing.paths.handoff, "--candidate-evidence", missing.paths.evidence, "--dry-run"]
      })
    ).toThrow(/require a valid decision reconciliation/u);
  });

  it("COS-4 consumes a strategy activated through reconciliation", () => {
    const fixture = createFixture();
    const reconciliation = reconcile(fixture, "--apply");
    const strategyResult = strategy(fixture, reconciliation.output_path, "--apply");
    const draft = runCareerOsResumeDraft({
      cwd: fixture.workspace,
      now,
      argv: ["--strategy", strategyResult.output_path, "--candidate-evidence", fixture.paths.evidence, "--dry-run"]
    });

    expect(draft.summary.lifecycle_state).toBe("human_review_required");
    expect(draft.summary.evidence_gap_count).toBe(0);
  });

  it("does not use provider, LLM, browser or network primitives", () => {
    const source = [
      readFileSync(path.join(process.cwd(), "scripts", "career-os", "decision-reconciliation.ts"), "utf8"),
      readFileSync(path.join(process.cwd(), "scripts", "career-os", "resume-strategy.ts"), "utf8")
    ].join("\n");

    expect(source).not.toMatch(/fetch\(|OpenAI|streamText|generateText|api\.openai|puppeteer|playwright|https?\.request/u);
  });

  it("normal CLI output does not expose private evidence statements", () => {
    const fixture = createFixture({ sensitiveEvidence: true });
    const stdout = execFileSync(
      process.execPath,
      [
        "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
        "--experimental-strip-types",
        path.join(process.cwd(), "scripts", "career-os", "decision-reconciliation.ts"),
        "--handoff",
        fixture.paths.handoff,
        "--candidate-evidence",
        fixture.paths.evidence,
        "--dry-run"
      ],
      { cwd: fixture.workspace, encoding: "utf8" }
    );

    expect(stdout).toContain("Reconciliation ID:");
    expect(stdout).toContain("Effective decision:");
    expect(stdout).not.toContain("Sensitive Evidence Marker");
    expect(stdout).not.toContain("sensitive@example.invalid");
  });
});

type FixtureOptions = {
  outcome?: "proceed" | "pause" | "decline";
  workspace?: string;
  registryRoot?: string;
  evidenceTags?: string[];
  evidenceStatus?: "verified" | "human-review-required" | "unsupported";
  sensitiveEvidence?: boolean;
  handoffPatch?: Record<string, unknown>;
  decisionPatch?: Record<string, unknown>;
  opportunityPatch?: Record<string, unknown>;
  jdPatch?: Record<string, unknown>;
  applicationPatch?: Record<string, unknown>;
  evidencePatch?: Record<string, unknown>;
};

function reconcile(fixture: ReturnType<typeof createFixture>, mode: "--dry-run" | "--apply") {
  return runCareerOsDecisionReconciliation({
    cwd: fixture.workspace,
    now,
    argv: ["--handoff", fixture.paths.handoff, "--candidate-evidence", fixture.paths.evidence, mode]
  });
}

function strategy(fixture: ReturnType<typeof createFixture>, reconciliationPath: string, mode: "--dry-run" | "--apply") {
  return runCareerOsResumeStrategy({
    cwd: fixture.workspace,
    now,
    argv: ["--handoff", fixture.paths.handoff, "--candidate-evidence", fixture.paths.evidence, "--decision-reconciliation", reconciliationPath, mode]
  });
}

function createFixture(options: FixtureOptions = {}) {
  const workspace = options.workspace ?? mkdtempSync(path.join(os.tmpdir(), "career-os-decision-reconciliation-"));
  const registryRoot = options.registryRoot ?? path.join(workspace, "registry");
  const paths = {
    handoff: path.join(registryRoot, "resume-handoffs", "HANDOFF-2026-link.json"),
    decision: path.join(registryRoot, "decisions", "DEC-2026-link.json"),
    opportunity: path.join(registryRoot, "opportunities", "OPP-2026-link.json"),
    jd: path.join(registryRoot, "jd-snapshots", "JD-2026-content.json"),
    application: path.join(registryRoot, "applications", "APP-synthetic-ai-lead-product-manager-source.json"),
    evidence: path.join(registryRoot, "candidate-evidence", "CEV-trusted-profile.json")
  };
  const outcome = options.outcome ?? "pause";
  const competencies = ["Product Strategy", "Analytics", "Customer Discovery", "Platform Thinking"];
  const evidenceTags = options.evidenceTags ?? competencies;
  const handoff = mergeRecord(
    {
      schema_version: "1.0.0",
      resume_os_handoff_id: "HANDOFF-2026-link",
      generated_at: now,
      application_id: "APP-synthetic-ai-lead-product-manager-source",
      opportunity_id: "OPP-2026-link",
      jd_snapshot_id: "JD-2026-content",
      normalized_role: "Lead Product Manager, AI Platform",
      normalized_company: "Synthetic AI",
      decision_outcome: outcome,
      fit_qualification_artifact_references: {
        decision_path: "registry/decisions/DEC-2026-link.json",
        opportunity_path: "registry/opportunities/OPP-2026-link.json",
        jd_snapshot_path: "registry/jd-snapshots/JD-2026-content.json"
      },
      candidate_evidence_reference: "CEV-trusted-profile",
      requested_next_workflow_stage: outcome === "proceed" ? "resume_strategy" : "human_evidence_review",
      output_location: "registry/resume-handoffs/HANDOFF-2026-link.json",
      integrity: { jd_content_hash: "jdhash123456", source_identity_hash: "source12", linkage_hash: "link1234" }
    },
    options.handoffPatch
  );
  const decision = mergeRecord(
    {
      schema_version: "1.0.0",
      decision_id: "DEC-2026-link",
      outcome,
      reasons: ["Candidate evidence needs deterministic reconciliation."],
      evidence_used: [],
      missing_evidence: competencies.map((item) => `Evidence should demonstrate ${item}.`),
      risks_or_gaps: ["Candidate evidence must be approved before resume assembly."],
      stable_ids: {
        jdSnapshotId: "JD-2026-content",
        opportunityId: "OPP-2026-link",
        applicationId: "APP-synthetic-ai-lead-product-manager-source"
      }
    },
    options.decisionPatch
  );
  const opportunity = mergeRecord(
    {
      schema_version: "1.0.0",
      opportunity_id: "OPP-2026-link",
      jd_snapshot_id: "JD-2026-content",
      decision_id: "DEC-2026-link",
      decision_outcome: outcome,
      job_model_id: "job-model:JD-2026-content",
      hiring_model_id: "hiring-model:JD-2026-content",
      evaluation_framework_id: "evaluation-framework:JD-2026-content",
      status: outcome === "proceed" ? "qualified_for_resume_handoff" : "paused_for_evidence"
    },
    options.opportunityPatch
  );
  const jd = mergeRecord(
    {
      schema_version: "1.0.0",
      jd_snapshot_id: "JD-2026-content",
      content_hash: "jdhash123456",
      source_identity_hash: "source12",
      linkage_hash: "link1234",
      deterministic_analysis: {
        required_competencies: competencies,
        evidence_expectations: competencies.map((item) => `Evidence should demonstrate ${item}.`)
      }
    },
    options.jdPatch
  );
  const application = mergeRecord(
    {
      schema_version: "1.0.0",
      application_id: "APP-synthetic-ai-lead-product-manager-source",
      jd_snapshot_id: "JD-2026-content",
      jd_hash: "jdhash123456",
      company_name: "Synthetic AI",
      role_title: "Lead Product Manager, AI Platform",
      current_stage: "saved",
      current_status: "on_hold",
      active: true,
      confidentiality: "private",
      contains_personal_data: true,
      safe_to_commit: false
    },
    options.applicationPatch
  );
  const evidence = mergeRecord(
    {
      schema_version: "1.0.0",
      evidence_source_id: "CEV-trusted-profile",
      source_type: "trusted-candidate-profile",
      trust: { verified: true, verified_at: now, verified_by: "synthetic-reviewer", basis: "Synthetic verified evidence." },
      candidate_profile: { candidate_name: "Synthetic Candidate", current_positioning: "Lead Product Manager" },
      evidence_items: evidenceTags.map((tag) => ({
        evidence_id: `EV-${slug(tag)}`,
        statement: options.sensitiveEvidence ? `Sensitive Evidence Marker for ${tag} sensitive@example.invalid` : `Verified synthetic evidence for ${tag}.`,
        tags: [tag],
        status: options.evidenceStatus ?? "verified",
        source_reference: `synthetic.${slug(tag)}`,
        category: tag === "Product Strategy" ? "summary" : tag === "Platform Thinking" ? "achievement" : "skill",
        ...(tag === "Platform Thinking" ? { metric_state: "achieved", collaboration_scope: "individual" } : {})
      }))
    },
    options.evidencePatch
  );

  for (const [file, value] of [
    [paths.handoff, handoff],
    [paths.decision, decision],
    [paths.opportunity, opportunity],
    [paths.jd, jd],
    [paths.application, application],
    [paths.evidence, evidence]
  ] as Array<[string, unknown]>) writeJson(file, value);
  return { workspace, registryRoot, paths };
}

function writeJson(file: string, value: unknown): void {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, "utf8")) as T;
}

function mergeRecord(base: Record<string, unknown>, patch: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!patch) return base;
  const next = { ...base };
  for (const [key, value] of Object.entries(patch)) next[key] = isPlainObject(value) && isPlainObject(next[key]) ? mergeRecord(next[key], value) : value;
  return next;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function slug(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, "");
}
