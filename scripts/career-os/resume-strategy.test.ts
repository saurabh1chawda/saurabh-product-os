import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ResumeStrategyError, runCareerOsResumeStrategy } from "./resume-strategy";

const now = "2026-08-24T11:00:00.000Z";

describe("career-os resume strategy", () => {
  it("consumes a valid COS-2 handoff and produces a blocked human-review dry run without durable writes", () => {
    const fixture = createFixture();

    const result = runCareerOsResumeStrategy({
      cwd: fixture.workspace,
      now,
      argv: ["--handoff", fixture.paths.handoff, "--candidate-evidence", fixture.paths.evidence, "--dry-run"]
    });

    expect(result.status).toBe("planned");
    expect(result.dry_run).toBe(true);
    expect(result.strategy.target.company).toBe("Acme AI");
    expect(result.strategy.target.role).toBe("Senior Product Manager, AI Platform");
    expect(result.strategy.decision_state.outcome).toBe("pause");
    expect(result.strategy.decision_state.readiness_state).toBe("blocked");
    expect(result.strategy.evidence_to_requirement_mapping.some((item) => item.status === "evidence-backed")).toBe(true);
    expect(result.strategy.evidence_to_requirement_mapping.some((item) => item.status === "gap")).toBe(true);
    expect(existsSync(result.output_path)).toBe(false);
  });

  it("rejects malformed or unsupported schema inputs", () => {
    const fixture = createFixture({ handoff: { schema_version: "2.0.0" } });

    expect(() =>
      runCareerOsResumeStrategy({
        cwd: fixture.workspace,
        now,
        argv: ["--handoff", fixture.paths.handoff, "--candidate-evidence", fixture.paths.evidence, "--dry-run"]
      })
    ).toThrow(/Unsupported handoff schema_version/u);
  });

  it("rejects missing referenced records", () => {
    const fixture = createFixture();
    rmSync(fixture.paths.jd);

    expect(() =>
      runCareerOsResumeStrategy({
        cwd: fixture.workspace,
        now,
        argv: ["--handoff", fixture.paths.handoff, "--candidate-evidence", fixture.paths.evidence, "--dry-run"]
      })
    ).toThrow(/Referenced record not found/u);
  });

  it("rejects cross-record ID mismatches", () => {
    const fixture = createFixture({ opportunity: { jd_snapshot_id: "JD-wrong" } });

    expect(() =>
      runCareerOsResumeStrategy({
        cwd: fixture.workspace,
        now,
        argv: ["--handoff", fixture.paths.handoff, "--candidate-evidence", fixture.paths.evidence, "--dry-run"]
      })
    ).toThrow(/opportunity\/JD ID mismatch/u);
  });

  it("rejects integrity hash mismatches", () => {
    const fixture = createFixture({ jd: { content_hash: "wrong-hash" } });

    expect(() =>
      runCareerOsResumeStrategy({
        cwd: fixture.workspace,
        now,
        argv: ["--handoff", fixture.paths.handoff, "--candidate-evidence", fixture.paths.evidence, "--dry-run"]
      })
    ).toThrow(/application JD hash mismatch|JD content hash mismatch/u);
  });

  it("rejects path traversal references", () => {
    const fixture = createFixture({
      handoff: {
        fit_qualification_artifact_references: {
          decision_path: "../decisions/DEC-2026-link.json",
          opportunity_path: "registry/opportunities/OPP-2026-link.json",
          jd_snapshot_path: "registry/jd-snapshots/JD-2026-content.json"
        }
      }
    });

    expect(() =>
      runCareerOsResumeStrategy({
        cwd: fixture.workspace,
        now,
        argv: ["--handoff", fixture.paths.handoff, "--candidate-evidence", fixture.paths.evidence, "--dry-run"]
      })
    ).toThrow(/Path traversal/u);
  });

  it("rejects decline decisions", () => {
    const fixture = createFixture({ outcome: "decline" });

    expect(() =>
      runCareerOsResumeStrategy({
        cwd: fixture.workspace,
        now,
        argv: ["--handoff", fixture.paths.handoff, "--candidate-evidence", fixture.paths.evidence, "--dry-run"]
      })
    ).toThrow(/declined this opportunity/u);
  });

  it("allows pause decisions only as clearly blocked strategies", () => {
    const fixture = createFixture({ outcome: "pause" });
    const result = runCareerOsResumeStrategy({
      cwd: fixture.workspace,
      now,
      argv: ["--handoff", fixture.paths.handoff, "--candidate-evidence", fixture.paths.evidence, "--dry-run"]
    });

    expect(result.strategy.decision_state.readiness_state).toBe("blocked");
    expect(result.strategy.limitations.join(" ")).toMatch(/not application-ready/u);
  });

  it("rejects missing or untrusted candidate evidence", () => {
    const missingEvidence = createFixture();
    expect(() =>
      runCareerOsResumeStrategy({
        cwd: missingEvidence.workspace,
        now,
        argv: ["--handoff", missingEvidence.paths.handoff, "--dry-run"]
      })
    ).toThrow(/--candidate-evidence is required/u);

    const untrusted = createFixture({ evidence: { trust: { verified: false } } });
    expect(() =>
      runCareerOsResumeStrategy({
        cwd: untrusted.workspace,
        now,
        argv: ["--handoff", untrusted.paths.handoff, "--candidate-evidence", untrusted.paths.evidence, "--dry-run"]
      })
    ).toThrow(/explicitly trusted/u);
  });

  it("is deterministic for identical inputs", () => {
    const fixture = createFixture();
    const argv = ["--handoff", fixture.paths.handoff, "--candidate-evidence", fixture.paths.evidence, "--dry-run"];

    const first = runCareerOsResumeStrategy({ cwd: fixture.workspace, now, argv });
    const second = runCareerOsResumeStrategy({ cwd: fixture.workspace, now, argv });

    expect(first.output_path).toBe(second.output_path);
    expect(first.strategy).toEqual(second.strategy);
    expect(first.strategy.integrity.material_hash).toBe(second.strategy.integrity.material_hash);
  });

  it("preserves evidence gaps and unsupported claims", () => {
    const fixture = createFixture();
    const result = runCareerOsResumeStrategy({
      cwd: fixture.workspace,
      now,
      argv: ["--handoff", fixture.paths.handoff, "--candidate-evidence", fixture.paths.evidence, "--dry-run"]
    });

    expect(result.strategy.evidence_gaps_and_unsupported_claims.length).toBeGreaterThan(0);
    expect(result.strategy.evidence_gaps_and_unsupported_claims.every((gap) => gap.handling.includes("Do not convert"))).toBe(true);
  });

  it("apply writes the approved private output", () => {
    const fixture = createFixture();
    const result = runCareerOsResumeStrategy({
      cwd: fixture.workspace,
      now,
      argv: ["--handoff", fixture.paths.handoff, "--candidate-evidence", fixture.paths.evidence, "--apply"]
    });

    expect(result.status).toBe("created");
    expect(existsSync(result.output_path)).toBe(true);
    const written = JSON.parse(readFileSync(result.output_path, "utf8")) as typeof result.strategy;
    expect(written.strategy_id).toBe(result.strategy.strategy_id);
  });

  it("duplicate identical apply is idempotent", () => {
    const fixture = createFixture();
    const argv = ["--handoff", fixture.paths.handoff, "--candidate-evidence", fixture.paths.evidence, "--apply"];

    const first = runCareerOsResumeStrategy({ cwd: fixture.workspace, now, argv });
    const second = runCareerOsResumeStrategy({ cwd: fixture.workspace, now, argv });

    expect(first.status).toBe("created");
    expect(second.status).toBe("duplicate");
    expect(second.strategy.integrity.material_hash).toBe(first.strategy.integrity.material_hash);
  });

  it("rejects conflicting existing output without overwriting it", () => {
    const fixture = createFixture();
    const first = runCareerOsResumeStrategy({
      cwd: fixture.workspace,
      now,
      argv: ["--handoff", fixture.paths.handoff, "--candidate-evidence", fixture.paths.evidence, "--apply"]
    });
    const original = readFileSync(first.output_path, "utf8");
    const parsed = JSON.parse(original) as Record<string, unknown>;
    parsed.integrity = { material_hash: "conflicting-material" };
    writeFileSync(first.output_path, `${JSON.stringify(parsed, null, 2)}\n`);

    expect(() =>
      runCareerOsResumeStrategy({
        cwd: fixture.workspace,
        now,
        argv: ["--handoff", fixture.paths.handoff, "--candidate-evidence", fixture.paths.evidence, "--apply"]
      })
    ).toThrow(/different material content/u);
    expect(readFileSync(first.output_path, "utf8")).toContain("conflicting-material");
  });

  it("preserves pre-existing files when write fails before persistence", () => {
    const fixture = createFixture();
    const marker = path.join(fixture.registryRoot, "resume-strategies", "pre-existing.json");
    writeJson(marker, { preserved: true });

    expect(() =>
      runCareerOsResumeStrategy({
        cwd: fixture.workspace,
        now,
        simulateWriteFailure: true,
        argv: ["--handoff", fixture.paths.handoff, "--candidate-evidence", fixture.paths.evidence, "--apply"]
      })
    ).toThrow(ResumeStrategyError);
    expect(readFileSync(marker, "utf8")).toContain("preserved");
  });

  it("does not use provider, LLM, browser or network primitives", () => {
    const source = readFileSync(path.join(process.cwd(), "scripts", "career-os", "resume-strategy.ts"), "utf8");

    expect(source).not.toMatch(/fetch\(|OpenAI|streamText|generateText|api\.openai|puppeteer|playwright|https?\.request/u);
  });
});

type FixtureOptions = {
  outcome?: "proceed" | "pause" | "decline";
  handoff?: Record<string, unknown>;
  decision?: Record<string, unknown>;
  opportunity?: Record<string, unknown>;
  jd?: Record<string, unknown>;
  application?: Record<string, unknown>;
  evidence?: Record<string, unknown>;
};

function createFixture(options: FixtureOptions = {}) {
  const workspace = mkdtempSync(path.join(os.tmpdir(), "career-os-resume-strategy-"));
  const registryRoot = path.join(workspace, "registry");
  const paths = {
    handoff: path.join(registryRoot, "resume-handoffs", "HANDOFF-2026-link.json"),
    decision: path.join(registryRoot, "decisions", "DEC-2026-link.json"),
    opportunity: path.join(registryRoot, "opportunities", "OPP-2026-link.json"),
    jd: path.join(registryRoot, "jd-snapshots", "JD-2026-content.json"),
    application: path.join(registryRoot, "applications", "APP-acme-ai-senior-product-manager-ai-platform-source.json"),
    evidence: path.join(workspace, "private", "trusted-candidate-evidence.json")
  };
  const outcome = options.outcome ?? "pause";
  const handoff = mergeRecord(
    {
      schema_version: "1.0.0",
      resume_os_handoff_id: "HANDOFF-2026-link",
      generated_at: now,
      application_id: "APP-acme-ai-senior-product-manager-ai-platform-source",
      opportunity_id: "OPP-2026-link",
      jd_snapshot_id: "JD-2026-content",
      normalized_role: "Senior Product Manager, AI Platform",
      normalized_company: "Acme AI",
      decision_outcome: outcome,
      fit_qualification_artifact_references: {
        decision_path: "registry/decisions/DEC-2026-link.json",
        opportunity_path: "registry/opportunities/OPP-2026-link.json",
        jd_snapshot_path: "registry/jd-snapshots/JD-2026-content.json"
      },
      candidate_evidence_reference: "trusted-candidate-evidence",
      requested_next_workflow_stage: outcome === "proceed" ? "resume_strategy" : "human_evidence_review",
      output_location: "registry/resume-handoffs/HANDOFF-2026-link.json",
      integrity: {
        jd_content_hash: "jdhash123456",
        source_identity_hash: "source12",
        linkage_hash: "link1234"
      },
      limitations: ["No resume content, DOCX, PDF, or application submission is generated by COS-2."]
    },
    options.handoff
  );
  const decision = mergeRecord(
    {
      schema_version: "1.0.0",
      decision_id: "DEC-2026-link",
      outcome,
      reasons: ["Candidate evidence needs human review."],
      evidence_used: [],
      missing_evidence: ["Evidence should demonstrate Platform Thinking."],
      risks_or_gaps: ["Candidate evidence must be approved before resume assembly."],
      confidence: { status: "not-calculated", reason: "No trusted production candidate evidence was validated." },
      created_at: now,
      stable_ids: {
        jdSnapshotId: "JD-2026-content",
        opportunityId: "OPP-2026-link",
        applicationId: "APP-acme-ai-senior-product-manager-ai-platform-source"
      },
      analyzer_version: "career-os-intake:v1"
    },
    options.decision
  );
  const opportunity = mergeRecord(
    {
      schema_version: "1.0.0",
      opportunity_id: "OPP-2026-link",
      created_at: now,
      company_name: "Acme AI",
      role_title: "Senior Product Manager, AI Platform",
      jd_snapshot_id: "JD-2026-content",
      decision_id: "DEC-2026-link",
      decision_outcome: outcome,
      job_model_id: "job-model:JD-2026-content",
      hiring_model_id: "hiring-model:JD-2026-content",
      evaluation_framework_id: "evaluation-framework:JD-2026-content",
      status: outcome === "proceed" ? "qualified_for_resume_handoff" : "paused_for_evidence",
      reasons: ["Candidate evidence needs human review."],
      missing_evidence: ["Evidence should demonstrate Platform Thinking."],
      risks_or_gaps: ["Candidate evidence must be approved before resume assembly."]
    },
    options.opportunity
  );
  const jd = mergeRecord(
    {
      schema_version: "1.0.0",
      jd_snapshot_id: "JD-2026-content",
      immutable: true,
      content_hash: "jdhash123456",
      source_identity_hash: "source12",
      linkage_hash: "link1234",
      source_reference: "fixture",
      source_url: "https://example.com/jobs/acme",
      source_file: "fixture.json",
      captured_at: now,
      created_at: now,
      company_name: "Acme AI",
      role_title: "Senior Product Manager, AI Platform",
      location: "Remote",
      employment_type: "FullTime",
      normalized_jd_text: "Own AI platform strategy, customer discovery, analytics, and technical delivery.",
      deterministic_analysis: {
        job_model_id: "job-model:JD-2026-content",
        role: "ProductManager",
        seniority: "Senior",
        function: "Platform",
        domain: "AI",
        required_competencies: ["Product Strategy", "Analytics", "Customer Discovery", "Platform Thinking"],
        evidence_expectations: [
          "Evidence should demonstrate Product Strategy.",
          "Evidence should demonstrate Analytics.",
          "Evidence should demonstrate Customer Discovery.",
          "Evidence should demonstrate Platform Thinking."
        ]
      }
    },
    options.jd
  );
  const application = mergeRecord(
    {
      application_id: "APP-acme-ai-senior-product-manager-ai-platform-source",
      schema_version: "1.0.0",
      created_at: now,
      updated_at: now,
      company_name: "Acme AI",
      company_slug: "acme-ai",
      role_title: "Senior Product Manager, AI Platform",
      current_stage: "saved",
      current_status: "on_hold",
      active: true,
      priority: "medium",
      jd_snapshot_id: "JD-2026-content",
      jd_path: "registry/jd-snapshots/JD-2026-content.json",
      jd_hash: "jdhash123456",
      product_os_modules: [],
      manual_override_ids: [],
      response_received: false,
      interview_count: 0,
      offer_received: false,
      owner: "Synthetic Candidate",
      last_activity_at: now,
      tags: ["career-os-intake"],
      confidentiality: "private",
      contains_personal_data: true,
      safe_to_commit: false
    },
    options.application
  );
  const evidence = mergeRecord(
    {
      schema_version: "1.0.0",
      evidence_source_id: "CEV-trusted-profile",
      source_type: "trusted-candidate-profile",
      trust: {
        verified: true,
        verified_at: now,
        verified_by: "human-reviewer",
        basis: "Private candidate profile reviewed by owner."
      },
      candidate_profile: {
        candidate_name: "Synthetic Candidate",
        current_positioning: "Senior Product Manager"
      },
      evidence_items: [
        {
          evidence_id: "EV-product-strategy",
          statement: "Verified product strategy evidence.",
          tags: ["Product Strategy"],
          status: "verified",
          source_reference: "private-profile"
        },
        {
          evidence_id: "EV-analytics",
          statement: "Verified analytics evidence.",
          tags: ["Analytics"],
          status: "verified",
          source_reference: "private-profile"
        },
        {
          evidence_id: "EV-customer-discovery",
          statement: "Discovery evidence needs review.",
          tags: ["Customer Discovery"],
          status: "human-review-required",
          source_reference: "private-profile"
        }
      ]
    },
    options.evidence
  );

  for (const [file, value] of [
    [paths.handoff, handoff],
    [paths.decision, decision],
    [paths.opportunity, opportunity],
    [paths.jd, jd],
    [paths.application, application],
    [paths.evidence, evidence]
  ] as Array<[string, unknown]>) {
    writeJson(file, value);
  }

  return { workspace, registryRoot, paths };
}

function writeJson(file: string, value: unknown): void {
  writeFileSyncWithDir(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeFileSyncWithDir(file: string, value: string): void {
  const dir = path.dirname(file);
  mkdirSync(dir, { recursive: true });
  writeFileSync(file, value);
}

function mergeRecord(base: Record<string, unknown>, patch: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!patch) {
    return base;
  }
  return deepMerge(base, patch);
}

function deepMerge(base: Record<string, unknown>, patch: Record<string, unknown>): Record<string, unknown> {
  const next = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    const current = next[key];
    if (isPlainObject(current) && isPlainObject(value)) {
      next[key] = deepMerge(current, value);
    } else {
      next[key] = value;
    }
  }
  return next;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
