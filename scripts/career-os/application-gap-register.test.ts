import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  hashApplicationGapRegisterMaterial,
  readAndValidateApplicationGapRegister,
  validateApplicationGapRegisterSuccessor,
  type ApplicationGapRegister
} from "./application-gap-register";

const expected = {
  application_id: "APP-synthetic",
  jd_snapshot_id: "JD-synthetic",
  opportunity_id: "OPP-synthetic",
  handoff_id: "HANDOFF-synthetic",
  decision_id: "DEC-synthetic",
  decision_reconciliation_id: null,
  candidate_evidence_id: "CEV-synthetic",
  candidate_evidence_hash: "evidence-hash",
  candidate_evidence_ids: ["EV-summary"]
};

describe("career-os application gap register lineage", () => {
  it("accepts a valid schema 1.1.0 successor lineage", () => {
    const fixture = createFixture();

    const predecessor = readAndValidateApplicationGapRegister({ file: fixture.paths.predecessor, cwd: fixture.workspace, registryRoot: fixture.registryRoot, expected });
    const successor = readAndValidateApplicationGapRegister({ file: fixture.paths.successor, cwd: fixture.workspace, registryRoot: fixture.registryRoot, expected });

    validateApplicationGapRegisterSuccessor({
      predecessor: predecessor.register,
      predecessorFileHash: predecessor.fileHash,
      successor: successor.register
    });
    expect(successor.register.lineage?.revision_number).toBe(1);
  });

  it("rejects partial lineage, self-lineage and stale predecessor hashes", () => {
    const partial = createFixture({ successorPatch: { lineage: { predecessor_file_hash: "" } } });
    expect(() => readAndValidateApplicationGapRegister({ file: partial.paths.successor, cwd: partial.workspace, registryRoot: partial.registryRoot, expected })).toThrow(/lineage/u);

    const self = createFixture({ successorPatch: { lineage: { predecessor_gap_register_id: "GAPREG-successor" } } });
    expect(() => readAndValidateApplicationGapRegister({ file: self.paths.successor, cwd: self.workspace, registryRoot: self.registryRoot, expected })).toThrow(/lineage cannot reference itself/u);

    const stale = createFixture({ successorPatch: { lineage: { predecessor_file_hash: "0".repeat(64) } } });
    const predecessor = readAndValidateApplicationGapRegister({ file: stale.paths.predecessor, cwd: stale.workspace, registryRoot: stale.registryRoot, expected });
    const successor = readAndValidateApplicationGapRegister({ file: stale.paths.successor, cwd: stale.workspace, registryRoot: stale.registryRoot, expected });
    expect(() => validateApplicationGapRegisterSuccessor({ predecessor: predecessor.register, predecessorFileHash: predecessor.fileHash, successor: successor.register })).toThrow(/predecessor gap register file hash/u);
  });

  it("rejects legacy schema registers that try to carry lineage", () => {
    const fixture = createFixture({ successorPatch: { schema_version: "1.0.0" } });

    expect(() => readAndValidateApplicationGapRegister({ file: fixture.paths.successor, cwd: fixture.workspace, registryRoot: fixture.registryRoot, expected })).toThrow(/lineage requires schema_version 1.1.0/u);
  });

  it("rejects successor registers with mismatched reconciliation lineage", () => {
    const fixture = createFixture();
    const predecessor = readAndValidateApplicationGapRegister({ file: fixture.paths.predecessor, cwd: fixture.workspace, registryRoot: fixture.registryRoot, expected });
    const successor = readAndValidateApplicationGapRegister({ file: fixture.paths.successor, cwd: fixture.workspace, registryRoot: fixture.registryRoot, expected });

    expect(() =>
      validateApplicationGapRegisterSuccessor({
        predecessor: { ...predecessor.register, decision_reconciliation_id: "REC-expected" },
        predecessorFileHash: predecessor.fileHash,
        successor: { ...successor.register, decision_reconciliation_id: "REC-other" }
      })
    ).toThrow(/decision_reconciliation_id/u);
  });

  it("normalizes successor decision reconciliation identity boundaries", () => {
    const cases: Array<[string, string | null | undefined, string | null | undefined, boolean]> = [
      ["absent/absent", undefined, undefined, true],
      ["null/null", null, null, true],
      ["absent/null", undefined, null, true],
      ["same/same", "REC-expected", "REC-expected", true],
      ["absent/unexpected", undefined, "REC-unexpected", false],
      ["expected/absent", "REC-expected", undefined, false],
      ["expected/different", "REC-expected", "REC-other", false],
      ["whitespace invalid", " ", " ", false]
    ];
    for (const [, predecessorId, successorId, shouldPass] of cases) {
      const fixture = createFixture();
      const predecessor = readAndValidateApplicationGapRegister({ file: fixture.paths.predecessor, cwd: fixture.workspace, registryRoot: fixture.registryRoot, expected });
      const successor = readAndValidateApplicationGapRegister({ file: fixture.paths.successor, cwd: fixture.workspace, registryRoot: fixture.registryRoot, expected });
      const run = () =>
        validateApplicationGapRegisterSuccessor({
          predecessor: { ...predecessor.register, decision_reconciliation_id: predecessorId },
          predecessorFileHash: predecessor.fileHash,
          successor: { ...successor.register, decision_reconciliation_id: successorId }
        });
      if (shouldPass) run();
      else expect(run).toThrow(/decision reconciliation ID|decision_reconciliation_id/u);
    }
  });
});

function createFixture(options: { successorPatch?: Record<string, unknown> } = {}) {
  const workspace = mkdtempSync(path.join(os.tmpdir(), "career-os-gap-lineage-"));
  const registryRoot = path.join(workspace, "registry");
  const paths = {
    predecessor: path.join(registryRoot, "application-gap-registers", "GAPREG-base.json"),
    successor: path.join(registryRoot, "application-gap-registers", "GAPREG-successor.json")
  };
  const predecessor = withMaterialHash(register("1.0.0", "GAPREG-base"));
  writeJson(paths.predecessor, predecessor);
  const successorBase = mergeRecord(register("1.1.0", "GAPREG-successor"), {
      lineage: {
        predecessor_gap_register_id: "GAPREG-base",
        predecessor_file_hash: fileHash(paths.predecessor),
        predecessor_material_hash: predecessor.integrity.material_hash,
        revision_reason: "claim-boundary-correction",
        revision_number: 1
      }
    }) as ApplicationGapRegister
  const successor = withMaterialHash(mergeRecord(successorBase, options.successorPatch ?? {}) as ApplicationGapRegister);
  writeJson(paths.successor, successor);
  return { workspace, registryRoot, paths };
}

function register(schemaVersion: "1.0.0" | "1.1.0", gapRegisterId: string): ApplicationGapRegister {
  return {
    schema_version: schemaVersion,
    artifact_type: "application-level-gap-register",
    gap_register_id: gapRegisterId,
    application_id: "APP-synthetic",
    jd_snapshot_id: "JD-synthetic",
    opportunity_id: "OPP-synthetic",
    handoff_id: "HANDOFF-synthetic",
    decision_id: "DEC-synthetic",
    decision_reconciliation_id: null,
    candidate_evidence_id: "CEV-synthetic",
    candidate_evidence_hash: "evidence-hash",
    created_at: "2026-08-25T12:00:00.000Z",
    created_by: "Synthetic Reviewer",
    source_reference: "synthetic",
    gaps: [
      {
        gap_id: "G01",
        requirement: "Direct domain experience",
        normalized_requirement_key: "direct-domain-experience",
        status: "unresolved",
        resolution_state: "requires-human-review",
        explanation: "Synthetic gap.",
        closest_supported_evidence_ids: ["EV-summary"],
        source_reference: "synthetic:g01",
        human_review_required: true,
        positive_claim_prohibited: true,
        claim_boundary: "Do not claim direct domain experience."
      }
    ],
    integrity: { material_hash: "" }
  };
}

function withMaterialHash(registerValue: ApplicationGapRegister): ApplicationGapRegister {
  return {
    ...registerValue,
    integrity: { material_hash: hashApplicationGapRegisterMaterial(registerValue) }
  };
}

function writeJson(file: string, value: unknown): void {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function fileHash(file: string): string {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function mergeRecord(base: Record<string, unknown>, patch: Record<string, unknown>): Record<string, unknown> {
  const next = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    next[key] = isPlainObject(value) && isPlainObject(next[key]) ? mergeRecord(next[key] as Record<string, unknown>, value) : value;
  }
  return next;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
