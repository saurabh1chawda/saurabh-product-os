import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { hashApplicationGapRegisterMaterial, normalizeApplicationRequirement } from "./application-gap-register";
import { ResumeStrategyError, runCareerOsResumeStrategy } from "./resume-strategy";

const now = "2026-08-24T11:00:00.000Z";

describe("career-os resume strategy", () => {
  it("consumes a valid COS-2 handoff and produces a blocked human-review dry run without durable writes", () => {
    const fixture = createFixture({ outcome: "proceed" });

    const result = runCareerOsResumeStrategy({
      cwd: fixture.workspace,
      now,
      argv: ["--handoff", fixture.paths.handoff, "--candidate-evidence", fixture.paths.evidence, "--dry-run"]
    });

    expect(result.status).toBe("planned");
    expect(result.dry_run).toBe(true);
    expect(result.strategy.target.company).toBe("Acme AI");
    expect(result.strategy.target.role).toBe("Senior Product Manager, AI Platform");
    expect(result.strategy.decision_state.outcome).toBe("proceed");
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

  it("rejects symlink inputs", () => {
    const fixture = createFixture({ outcome: "proceed" });
    const link = path.join(fixture.workspace, "handoff-link.json");
    try {
      symlinkSync(fixture.paths.handoff, link);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "EPERM") {
        const source = readFileSync(path.join(process.cwd(), "scripts", "career-os", "resume-strategy.ts"), "utf8");
        expect(source).toContain("lstatSync(file).isSymbolicLink()");
        return;
      }
      throw error;
    }

    expect(() =>
      runCareerOsResumeStrategy({
        cwd: fixture.workspace,
        now,
        argv: ["--handoff", link, "--candidate-evidence", fixture.paths.evidence, "--dry-run"]
      })
    ).toThrow(/Symlink inputs/u);
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

  it("requires reconciliation before a paused decision can reach resume strategy", () => {
    const fixture = createFixture({ outcome: "pause" });

    expect(() =>
      runCareerOsResumeStrategy({
        cwd: fixture.workspace,
        now,
        argv: ["--handoff", fixture.paths.handoff, "--candidate-evidence", fixture.paths.evidence, "--dry-run"]
      })
    ).toThrow(/require a valid decision reconciliation/u);
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
    const fixture = createFixture({ outcome: "proceed" });
    const argv = ["--handoff", fixture.paths.handoff, "--candidate-evidence", fixture.paths.evidence, "--dry-run"];

    const first = runCareerOsResumeStrategy({ cwd: fixture.workspace, now, argv });
    const second = runCareerOsResumeStrategy({ cwd: fixture.workspace, now, argv });

    expect(first.output_path).toBe(second.output_path);
    expect(first.strategy).toEqual(second.strategy);
    expect(first.strategy.integrity.material_hash).toBe(second.strategy.integrity.material_hash);
  });

  it("preserves evidence gaps and unsupported claims", () => {
    const fixture = createFixture({ outcome: "proceed" });
    const result = runCareerOsResumeStrategy({
      cwd: fixture.workspace,
      now,
      argv: ["--handoff", fixture.paths.handoff, "--candidate-evidence", fixture.paths.evidence, "--dry-run"]
    });

    expect(result.strategy.evidence_gaps_and_unsupported_claims.length).toBeGreaterThan(0);
    expect(result.strategy.evidence_gaps_and_unsupported_claims.every((gap) => gap.handling.includes("Do not convert"))).toBe(true);
  });

  it("preserves application-level gaps as structured, hashed human-review constraints", () => {
    const fixture = createFixture({
      outcome: "proceed",
      withApplicationGapRegister: true,
      evidence: {
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
            statement: "Verified customer discovery evidence.",
            tags: ["Customer Discovery"],
            status: "verified",
            source_reference: "private-profile"
          },
          {
            evidence_id: "EV-platform-thinking",
            statement: "Verified platform thinking evidence.",
            tags: ["Platform Thinking"],
            status: "verified",
            source_reference: "private-profile"
          }
        ]
      }
    });
    const result = runCareerOsResumeStrategy({
      cwd: fixture.workspace,
      now,
      argv: [
        "--handoff",
        fixture.paths.handoff,
        "--candidate-evidence",
        fixture.paths.evidence,
        "--application-gap-register",
        fixture.paths.gapRegister,
        "--dry-run"
      ]
    });

    expect(result.strategy.decision_state.readiness_state).toBe("human_review_required");
    expect(result.strategy.application_level_gap_register?.gap_register_id).toBe("GAPREG-APP-acme-ai");
    expect(result.strategy.application_level_gap_register?.gap_count).toBe(2);
    expect(result.strategy.application_level_gap_register?.unresolved_gap_count).toBe(1);
    expect(result.strategy.application_level_gaps?.map((gap) => gap.gap_id)).toEqual(["G01", "G02"]);
    expect(result.strategy.integrity.application_gap_register_hash).toMatch(/^[a-f0-9]{64}$/u);
    expect(result.strategy.integrity.application_level_gaps_hash).toBe(result.strategy.application_level_gap_register?.gaps_hash);
    expect(result.strategy.evidence_gaps_and_unsupported_claims.some((gap) => gap.claim_or_requirement === "Ten years of product management experience")).toBe(true);
    expect(result.strategy.evidence_to_requirement_mapping.every((mapping) => mapping.requirement !== "Ten years of product management experience" || mapping.status !== "evidence-backed")).toBe(true);
    expect(result.strategy.decision_state.blocking_reasons.every((reason) => !reason.includes("Application-level gap"))).toBe(true);
    expect(result.strategy.human_review_checklist.some((item) => item.includes("application-level gap"))).toBe(true);
    expect(existsSync(result.output_path)).toBe(false);
  });

  it("rejects stale or malformed application-level gap registers", () => {
    const stale = createFixture({ outcome: "proceed", withApplicationGapRegister: true, gapRegisterPatch: { candidate_evidence_hash: "stale-hash" } });
    expect(() =>
      runCareerOsResumeStrategy({
        cwd: stale.workspace,
        now,
        argv: ["--handoff", stale.paths.handoff, "--candidate-evidence", stale.paths.evidence, "--application-gap-register", stale.paths.gapRegister, "--dry-run"]
      })
    ).toThrow(/candidate evidence hash mismatch/u);

    const resolvedWithoutEvidence = createFixture({
      outcome: "proceed",
      withApplicationGapRegister: true,
      gapRegisterPatch: {
        gaps: [
          {
            gap_id: "G01",
            requirement: "Ten years of product management experience",
            normalized_requirement_key: normalizeApplicationRequirement("Ten years of product management experience"),
            status: "resolved-with-verified-evidence",
            resolution_state: "resolved",
            explanation: "Synthetic invalid resolved gap.",
            closest_supported_evidence_ids: [],
            source_reference: "synthetic-gap-register",
            human_review_required: false,
            positive_claim_prohibited: false,
            claim_boundary: "Do not claim ten years unless verified."
          }
        ]
      }
    });
    expect(() =>
      runCareerOsResumeStrategy({
        cwd: resolvedWithoutEvidence.workspace,
        now,
        argv: [
          "--handoff",
          resolvedWithoutEvidence.paths.handoff,
          "--candidate-evidence",
          resolvedWithoutEvidence.paths.evidence,
          "--application-gap-register",
          resolvedWithoutEvidence.paths.gapRegister,
          "--dry-run"
        ]
      })
    ).toThrow(/cannot be resolved without verified evidence/u);
  });

  it("rejects invalid application-level gap register contract metadata", () => {
    const cases: Array<[string, Record<string, unknown>, RegExp]> = [
      ["unsupported schema", { schema_version: "2.0.0" }, /Unsupported application gap register schema_version/u],
      ["unsupported artifact type", { artifact_type: "pilot-gap-review" }, /application-level-gap-register/u],
      ["cross application", { application_id: "APP-other" }, /application gap register application ID mismatch/u],
      ["cross JD", { jd_snapshot_id: "JD-other" }, /application gap register JD ID mismatch/u],
      ["cross opportunity", { opportunity_id: "OPP-other" }, /application gap register opportunity ID mismatch/u],
      ["cross handoff", { handoff_id: "HANDOFF-other" }, /application gap register handoff ID mismatch/u],
      ["cross decision", { decision_id: "DEC-other" }, /application gap register decision ID mismatch/u],
      ["stale candidate evidence hash", { candidate_evidence_hash: "stale-hash" }, /candidate evidence hash mismatch/u]
    ];

    for (const [, gapRegisterPatch, expected] of cases) {
      const fixture = createFixture({ outcome: "proceed", withApplicationGapRegister: true, gapRegisterPatch });
      expect(() =>
        runCareerOsResumeStrategy({
          cwd: fixture.workspace,
          now,
          argv: ["--handoff", fixture.paths.handoff, "--candidate-evidence", fixture.paths.evidence, "--application-gap-register", fixture.paths.gapRegister, "--dry-run"]
        })
      ).toThrow(expected);
    }
  });

  it("validates application-level gap register reconciliation linkage semantics", () => {
    const noReconciliation = createFixture({ outcome: "proceed", withApplicationGapRegister: true });
    expect(runCareerOsResumeStrategy({
      cwd: noReconciliation.workspace,
      now,
      argv: ["--handoff", noReconciliation.paths.handoff, "--candidate-evidence", noReconciliation.paths.evidence, "--application-gap-register", noReconciliation.paths.gapRegister, "--dry-run"]
    }).strategy.application_level_gaps?.map((gap) => gap.gap_id)).toEqual(["G01", "G02"]);

    const matchingReconciliation = createFixture({
      outcome: "proceed",
      withApplicationGapRegister: true,
      withDecisionReconciliation: true,
      gapRegisterPatch: { decision_reconciliation_id: "DREC-2026-link" }
    });
    expect(runCareerOsResumeStrategy({
      cwd: matchingReconciliation.workspace,
      now,
      argv: [
        "--handoff",
        matchingReconciliation.paths.handoff,
        "--candidate-evidence",
        matchingReconciliation.paths.evidence,
        "--decision-reconciliation",
        matchingReconciliation.paths.reconciliation,
        "--application-gap-register",
        matchingReconciliation.paths.gapRegister,
        "--dry-run"
      ]
    }).strategy.decision_reconciliation?.reconciliation_id).toBe("DREC-2026-link");

    const unexpectedReconciliation = createFixture({
      outcome: "proceed",
      withApplicationGapRegister: true,
      gapRegisterPatch: { decision_reconciliation_id: "DREC-unexpected" }
    });
    expect(() =>
      runCareerOsResumeStrategy({
        cwd: unexpectedReconciliation.workspace,
        now,
        argv: ["--handoff", unexpectedReconciliation.paths.handoff, "--candidate-evidence", unexpectedReconciliation.paths.evidence, "--application-gap-register", unexpectedReconciliation.paths.gapRegister, "--dry-run"]
      })
    ).toThrow(/application gap register decision reconciliation ID mismatch/u);

    const missingReconciliation = createFixture({
      outcome: "proceed",
      withApplicationGapRegister: true,
      withDecisionReconciliation: true,
      gapRegisterPatch: { decision_reconciliation_id: null }
    });
    expect(() =>
      runCareerOsResumeStrategy({
        cwd: missingReconciliation.workspace,
        now,
        argv: [
          "--handoff",
          missingReconciliation.paths.handoff,
          "--candidate-evidence",
          missingReconciliation.paths.evidence,
          "--decision-reconciliation",
          missingReconciliation.paths.reconciliation,
          "--application-gap-register",
          missingReconciliation.paths.gapRegister,
          "--dry-run"
        ]
      })
    ).toThrow(/application gap register decision reconciliation ID mismatch/u);

    const differentReconciliation = createFixture({
      outcome: "proceed",
      withApplicationGapRegister: true,
      withDecisionReconciliation: true,
      gapRegisterPatch: { decision_reconciliation_id: "DREC-other" }
    });
    expect(() =>
      runCareerOsResumeStrategy({
        cwd: differentReconciliation.workspace,
        now,
        argv: [
          "--handoff",
          differentReconciliation.paths.handoff,
          "--candidate-evidence",
          differentReconciliation.paths.evidence,
          "--decision-reconciliation",
          differentReconciliation.paths.reconciliation,
          "--application-gap-register",
          differentReconciliation.paths.gapRegister,
          "--dry-run"
        ]
      })
    ).toThrow(/application gap register decision reconciliation ID mismatch/u);
  });

  it("rejects invalid application-level gap structures without weakening valid empty or bounded cases", () => {
    const invalidGapCases: Array<[string, Record<string, unknown>, RegExp]> = [
      ["duplicate gap IDs", { gaps: [baseApplicationGap(), { ...baseApplicationGap(), requirement: "Second requirement", normalized_requirement_key: normalizeApplicationRequirement("Second requirement") }] }, /Duplicate or missing application gap ID/u],
      ["duplicate evidence IDs", { gaps: [{ ...baseApplicationGap(), closest_supported_evidence_ids: ["EV-product-strategy", "EV-product-strategy"] }] }, /duplicate candidate evidence ID/u],
      ["invalid status", { gaps: [{ ...baseApplicationGap(), status: "needs-review" }] }, /unsupported status/u],
      ["invalid resolution state", { gaps: [{ ...baseApplicationGap(), resolution_state: "maybe" }] }, /unsupported resolution state/u],
      ["invalid status resolution combination", { gaps: [{ ...baseApplicationGap(), status: "unresolved", resolution_state: "bounded" }] }, /unresolved gaps must require human review/u],
      ["missing requirement", { gaps: [{ ...baseApplicationGap(), requirement: "", normalized_requirement_key: "" }] }, /missing required requirement/u],
      ["malformed gap missing boundary", { gaps: [{ ...baseApplicationGap(), claim_boundary: "" }] }, /missing required claim_boundary/u],
      ["invalid evidence ID", { gaps: [{ ...baseApplicationGap(), closest_supported_evidence_ids: ["EV-missing"] }] }, /unknown candidate evidence ID/u],
      ["resolved without evidence", { gaps: [{ ...baseApplicationGap(), status: "resolved-with-verified-evidence", resolution_state: "resolved", closest_supported_evidence_ids: [], human_review_required: false, positive_claim_prohibited: false }] }, /cannot be resolved without verified evidence/u]
    ];

    for (const [, gapRegisterPatch, expected] of invalidGapCases) {
      const fixture = createFixture({ outcome: "proceed", withApplicationGapRegister: true, gapRegisterPatch });
      expect(() =>
        runCareerOsResumeStrategy({
          cwd: fixture.workspace,
          now,
          argv: ["--handoff", fixture.paths.handoff, "--candidate-evidence", fixture.paths.evidence, "--application-gap-register", fixture.paths.gapRegister, "--dry-run"]
        })
      ).toThrow(expected);
    }

    const unresolvedWithEmptyEvidence = createFixture({ outcome: "proceed", withApplicationGapRegister: true, gapRegisterPatch: { gaps: [{ ...baseApplicationGap(), closest_supported_evidence_ids: [] }] } });
    expect(runCareerOsResumeStrategy({
      cwd: unresolvedWithEmptyEvidence.workspace,
      now,
      argv: ["--handoff", unresolvedWithEmptyEvidence.paths.handoff, "--candidate-evidence", unresolvedWithEmptyEvidence.paths.evidence, "--application-gap-register", unresolvedWithEmptyEvidence.paths.gapRegister, "--dry-run"]
    }).strategy.application_level_gaps?.[0].closest_supported_evidence_ids).toEqual([]);

    const bounded = createFixture({
      outcome: "proceed",
      withApplicationGapRegister: true,
      gapRegisterPatch: {
        gaps: [{
          ...baseApplicationGap(),
          status: "bounded-claim",
          resolution_state: "bounded",
          closest_supported_evidence_ids: ["EV-product-strategy"],
          claim_boundary: "May claim adjacent synthetic product leadership, not direct ownership of the unsupported requirement."
        }]
      }
    });
    expect(runCareerOsResumeStrategy({
      cwd: bounded.workspace,
      now,
      argv: ["--handoff", bounded.paths.handoff, "--candidate-evidence", bounded.paths.evidence, "--application-gap-register", bounded.paths.gapRegister, "--dry-run"]
    }).strategy.application_level_gaps?.[0].status).toBe("bounded-claim");
  });

  it("rejects application-level gap register material and storage safety failures", () => {
    const materialMismatch = createFixture({
      outcome: "proceed",
      withApplicationGapRegister: true,
      preserveGapRegisterMaterialHash: true,
      gapRegisterPatch: { integrity: { material_hash: "0".repeat(64) } }
    });
    expect(() =>
      runCareerOsResumeStrategy({
        cwd: materialMismatch.workspace,
        now,
        argv: ["--handoff", materialMismatch.paths.handoff, "--candidate-evidence", materialMismatch.paths.evidence, "--application-gap-register", materialMismatch.paths.gapRegister, "--dry-run"]
      })
    ).toThrow(/application gap register material hash mismatch/u);

    const traversal = createFixture({ outcome: "proceed", withApplicationGapRegister: true });
    expect(() =>
      runCareerOsResumeStrategy({
        cwd: traversal.workspace,
        now,
        argv: ["--handoff", traversal.paths.handoff, "--candidate-evidence", traversal.paths.evidence, "--application-gap-register", "../gap-register.json", "--dry-run"]
      })
    ).toThrow(/Path traversal/u);

    const unsafePublic = createFixture({ outcome: "proceed", withApplicationGapRegister: true });
    const publicGapRegister = path.join(unsafePublic.workspace, "public-gap-register.json");
    writeJson(publicGapRegister, JSON.parse(readFileSync(unsafePublic.paths.gapRegister, "utf8")) as Record<string, unknown>);
    expect(() =>
      runCareerOsResumeStrategy({
        cwd: unsafePublic.workspace,
        now,
        argv: ["--handoff", unsafePublic.paths.handoff, "--candidate-evidence", unsafePublic.paths.evidence, "--application-gap-register", publicGapRegister, "--dry-run"]
      })
    ).toThrow(/must stay under data\/private|must resolve inside/u);

    const credentialLike = createFixture({ outcome: "proceed", withApplicationGapRegister: true });
    writeJson(credentialLike.paths.gapRegister, { api_key: "synthetic-test-only" });
    expect(() =>
      runCareerOsResumeStrategy({
        cwd: credentialLike.workspace,
        now,
        argv: ["--handoff", credentialLike.paths.handoff, "--candidate-evidence", credentialLike.paths.evidence, "--application-gap-register", credentialLike.paths.gapRegister, "--dry-run"]
      })
    ).toThrow(/suspected credential material/u);
  });

  it("rejects a symlinked application-level gap register input", () => {
    const fixture = createFixture({ outcome: "proceed", withApplicationGapRegister: true });
    const link = path.join(fixture.registryRoot, "application-gap-registers", "gap-register-link.json");
    try {
      symlinkSync(fixture.paths.gapRegister, link);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "EPERM") {
        const source = readFileSync(path.join(process.cwd(), "scripts", "career-os", "application-gap-register.ts"), "utf8");
        expect(source).toContain("lstatSync(file).isSymbolicLink()");
        return;
      }
      throw error;
    }

    expect(() =>
      runCareerOsResumeStrategy({
        cwd: fixture.workspace,
        now,
        argv: ["--handoff", fixture.paths.handoff, "--candidate-evidence", fixture.paths.evidence, "--application-gap-register", link, "--dry-run"]
      })
    ).toThrow(/Symlink inputs/u);
  });

  it("apply writes the approved private output", () => {
    const fixture = createFixture({ outcome: "proceed" });
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
    const fixture = createFixture({ outcome: "proceed" });
    const argv = ["--handoff", fixture.paths.handoff, "--candidate-evidence", fixture.paths.evidence, "--apply"];

    const first = runCareerOsResumeStrategy({ cwd: fixture.workspace, now, argv });
    const second = runCareerOsResumeStrategy({ cwd: fixture.workspace, now, argv });

    expect(first.status).toBe("created");
    expect(second.status).toBe("duplicate");
    expect(second.strategy.integrity.material_hash).toBe(first.strategy.integrity.material_hash);
  });

  it("rejects conflicting existing output without overwriting it", () => {
    const fixture = createFixture({ outcome: "proceed" });
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
    const fixture = createFixture({ outcome: "proceed" });
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
  withDecisionReconciliation?: boolean;
  reconciliation?: Record<string, unknown>;
  withApplicationGapRegister?: boolean;
  gapRegisterPatch?: Record<string, unknown>;
  preserveReconciliationMaterialHash?: boolean;
  preserveGapRegisterMaterialHash?: boolean;
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
    evidence: path.join(workspace, "private", "trusted-candidate-evidence.json"),
    reconciliation: path.join(registryRoot, "decision-reconciliations", "DREC-2026-link.json"),
    gapRegister: path.join(registryRoot, "application-gap-registers", "GAPREG-APP-acme-ai.json")
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
  const hashes = {
    handoffHash: fileHash(paths.handoff),
    decisionHash: fileHash(paths.decision),
    opportunityHash: fileHash(paths.opportunity),
    jdSnapshotHash: fileHash(paths.jd),
    applicationHash: fileHash(paths.application),
    candidateEvidenceHash: fileHash(paths.evidence)
  };
  if (options.withDecisionReconciliation || options.reconciliation) {
    const reconciliation = mergeRecord(
      {
        schema_version: "1.0.0",
        reconciliation_id: "DREC-2026-link",
        artifact_type: "trusted-evidence-decision-reconciliation",
        created_at: now,
        application_id: "APP-acme-ai-senior-product-manager-ai-platform-source",
        opportunity_id: "OPP-2026-link",
        jd_snapshot_id: "JD-2026-content",
        handoff_id: "HANDOFF-2026-link",
        original_decision_id: "DEC-2026-link",
        original_decision_outcome: outcome,
        effective_reconciled_outcome: "proceed",
        trusted_candidate_evidence_source_id: "CEV-trusted-profile",
        candidate_evidence_hash: hashes.candidateEvidenceHash,
        linked_hashes: {
          handoff_hash: hashes.handoffHash,
          decision_hash: hashes.decisionHash,
          opportunity_hash: hashes.opportunityHash,
          jd_snapshot_hash: hashes.jdSnapshotHash,
          application_hash: hashes.applicationHash,
          candidate_evidence_hash: hashes.candidateEvidenceHash
        },
        requirement_to_evidence_mapping: [
          { requirement: "Product Strategy", status: "supported", evidence_ids: ["EV-product-strategy"], notes: "Synthetic trusted evidence supports this requirement." }
        ],
        unresolved_gaps: [],
        requested_next_workflow_stage: "resume_strategy",
        integrity: {
          material_hash: ""
        }
      },
      options.reconciliation
    );
    if (!options.preserveReconciliationMaterialHash) {
      const typedReconciliation = reconciliation as { created_at?: string; integrity: { material_hash: string } };
      typedReconciliation.integrity.material_hash = hashJson({ ...typedReconciliation, created_at: "stable", integrity: { material_hash: "stable" } });
    }
    writeJson(paths.reconciliation, reconciliation);
  }
  if (options.withApplicationGapRegister || options.gapRegisterPatch) {
    const evidenceHash = fileHash(paths.evidence);
    const gapRegister = mergeRecord(
      {
        schema_version: "1.0.0",
        artifact_type: "application-level-gap-register",
        gap_register_id: "GAPREG-APP-acme-ai",
        application_id: "APP-acme-ai-senior-product-manager-ai-platform-source",
        jd_snapshot_id: "JD-2026-content",
        opportunity_id: "OPP-2026-link",
        handoff_id: "HANDOFF-2026-link",
        decision_id: "DEC-2026-link",
        decision_reconciliation_id: null,
        candidate_evidence_id: "CEV-trusted-profile",
        candidate_evidence_hash: evidenceHash,
        created_at: now,
        created_by: "synthetic-reviewer",
        source_reference: "synthetic-gap-review",
        gaps: [
          {
            gap_id: "G01",
            requirement: "Ten years of product management experience",
            normalized_requirement_key: normalizeApplicationRequirement("Ten years of product management experience"),
            status: "unresolved",
            resolution_state: "requires-human-review",
            explanation: "Synthetic evidence supports less than the stated requirement.",
            closest_supported_evidence_ids: ["EV-product-strategy"],
            source_reference: "synthetic-gap-review:G01",
            human_review_required: true,
            positive_claim_prohibited: true,
            claim_boundary: "Do not claim ten years of experience unless verified evidence is added."
          },
          {
            gap_id: "G02",
            requirement: "Restaurant technology experience",
            normalized_requirement_key: normalizeApplicationRequirement("Restaurant technology experience"),
            status: "waived-by-human-reviewer",
            resolution_state: "waived",
            explanation: "Synthetic reviewer waived direct domain experience in favor of adjacent platform evidence.",
            closest_supported_evidence_ids: ["EV-product-strategy"],
            source_reference: "synthetic-gap-review:G02",
            human_review_required: false,
            positive_claim_prohibited: false,
            claim_boundary: "May discuss adjacent platform experience, not direct restaurant technology ownership."
          }
        ],
        integrity: {
          material_hash: ""
        }
      },
      options.gapRegisterPatch
    );
    const typedGapRegister = gapRegister as Parameters<typeof hashApplicationGapRegisterMaterial>[0];
    if (!options.preserveGapRegisterMaterialHash) {
      typedGapRegister.integrity.material_hash = hashApplicationGapRegisterMaterial(typedGapRegister);
    }
    writeJson(paths.gapRegister, typedGapRegister);
  }

  return { workspace, registryRoot, paths };
}

function fileHash(file: string): string {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function hashJson(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function writeJson(file: string, value: unknown): void {
  writeFileSyncWithDir(file, `${JSON.stringify(value, null, 2)}\n`);
}

function baseApplicationGap() {
  return {
    gap_id: "G01",
    requirement: "Ten years of product management experience",
    normalized_requirement_key: normalizeApplicationRequirement("Ten years of product management experience"),
    status: "unresolved",
    resolution_state: "requires-human-review",
    explanation: "Synthetic evidence supports less than the stated requirement.",
    closest_supported_evidence_ids: ["EV-product-strategy"],
    source_reference: "synthetic-gap-review:G01",
    human_review_required: true,
    positive_claim_prohibited: true,
    claim_boundary: "Do not claim ten years of experience unless verified evidence is added."
  };
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
