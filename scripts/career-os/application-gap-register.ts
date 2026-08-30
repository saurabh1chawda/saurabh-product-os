import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, readFileSync, statSync } from "node:fs";
import os from "node:os";
import path from "node:path";

export const applicationGapRegisterSchemaVersion = "1.1.0";

export type ApplicationGapStatus = "unresolved" | "resolved-with-verified-evidence" | "waived-by-human-reviewer" | "bounded-claim";
export type ApplicationGapResolutionState = "requires-human-review" | "resolved" | "waived" | "bounded";

export type ApplicationLevelGap = {
  gap_id: string;
  requirement: string;
  normalized_requirement_key: string;
  status: ApplicationGapStatus;
  resolution_state: ApplicationGapResolutionState;
  explanation: string;
  closest_supported_evidence_ids: string[];
  source_reference: string;
  human_review_required: boolean;
  positive_claim_prohibited: boolean;
  claim_boundary: string;
};

export type ApplicationGapRegisterLineage = {
  predecessor_gap_register_id: string;
  predecessor_file_hash: string;
  predecessor_material_hash: string;
  revision_reason: "claim-boundary-correction" | "evidence-update" | "human-review-correction" | "workflow-correction";
  revision_number: number;
};

export type ApplicationGapRegister = {
  schema_version: "1.0.0" | "1.1.0";
  artifact_type: "application-level-gap-register";
  gap_register_id: string;
  application_id: string;
  jd_snapshot_id: string;
  opportunity_id: string;
  handoff_id: string;
  decision_id: string;
  decision_reconciliation_id?: string | null;
  candidate_evidence_id: string;
  candidate_evidence_hash: string;
  created_at: string;
  created_by: string;
  source_reference: string;
  lineage?: ApplicationGapRegisterLineage;
  gaps: ApplicationLevelGap[];
  integrity: {
    material_hash: string;
  };
};

export type ApplicationGapRegisterReference = {
  gap_register_id: string;
  source_path: string;
  material_hash: string;
  file_hash: string;
  gap_count: number;
  unresolved_gap_count: number;
  gaps_hash: string;
};

type ExpectedLinks = {
  application_id: string;
  jd_snapshot_id: string;
  opportunity_id: string;
  handoff_id: string;
  decision_id: string;
  decision_reconciliation_id?: string | null;
  candidate_evidence_id: string;
  candidate_evidence_hash: string;
  candidate_evidence_ids: string[];
};

const maxJsonBytes = 750_000;
const credentialPattern = /(password|api[_-]?key|secret|token|private[_-]?key|credential)/i;
const activeGapStatuses = new Set<ApplicationGapStatus>(["unresolved", "bounded-claim"]);

export class ApplicationGapRegisterError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export function readAndValidateApplicationGapRegister(input: {
  file: string;
  cwd: string;
  registryRoot: string;
  expected: ExpectedLinks;
}): { register: ApplicationGapRegister; fileHash: string } {
  assertPrivatePath(input.file, input.cwd, "Application gap register");
  assertInside(input.file, input.registryRoot, "Application gap register");
  const register = readJson<ApplicationGapRegister>(input.file);
  validateApplicationGapRegister(register, input.expected);
  return { register, fileHash: fileHash(input.file) };
}

export function validateApplicationGapRegister(register: ApplicationGapRegister, expected: ExpectedLinks): void {
  requireSchema(register, "application gap register");
  if (register.artifact_type !== "application-level-gap-register") {
    throw new ApplicationGapRegisterError("invalid-gap-register", "Input must be an application-level-gap-register artifact.");
  }
  for (const [field, value] of Object.entries({
    gap_register_id: register.gap_register_id,
    application_id: register.application_id,
    jd_snapshot_id: register.jd_snapshot_id,
    opportunity_id: register.opportunity_id,
    handoff_id: register.handoff_id,
    decision_id: register.decision_id,
    candidate_evidence_id: register.candidate_evidence_id,
    candidate_evidence_hash: register.candidate_evidence_hash,
    created_at: register.created_at,
    created_by: register.created_by,
    source_reference: register.source_reference
  })) {
    if (typeof value !== "string" || !value.trim()) {
      throw new ApplicationGapRegisterError("invalid-gap-register", `Missing required application gap register field: ${field}.`);
    }
  }
  assertEqual(register.application_id, expected.application_id, "application gap register application ID");
  assertEqual(register.jd_snapshot_id, expected.jd_snapshot_id, "application gap register JD ID");
  assertEqual(register.opportunity_id, expected.opportunity_id, "application gap register opportunity ID");
  assertEqual(register.handoff_id, expected.handoff_id, "application gap register handoff ID");
  assertEqual(register.decision_id, expected.decision_id, "application gap register decision ID");
  assertEqual(register.candidate_evidence_id, expected.candidate_evidence_id, "application gap register candidate evidence ID");
  assertEqual(register.candidate_evidence_hash, expected.candidate_evidence_hash, "application gap register candidate evidence hash");
  const registerDecisionReconciliationId = normalizeOptionalId(register.decision_reconciliation_id, "application gap register decision reconciliation ID");
  const expectedDecisionReconciliationId = normalizeOptionalId(expected.decision_reconciliation_id, "expected decision reconciliation ID");
  if (registerDecisionReconciliationId !== expectedDecisionReconciliationId) {
    throw new ApplicationGapRegisterError("integrity-mismatch", "application gap register decision reconciliation ID mismatch.");
  }
  if (Number.isNaN(Date.parse(register.created_at))) {
    throw new ApplicationGapRegisterError("invalid-gap-register", "Application gap register created_at must be a valid date.");
  }
  if (!Array.isArray(register.gaps) || register.gaps.length === 0) {
    throw new ApplicationGapRegisterError("invalid-gap-register", "Application gap register must include at least one gap.");
  }
  validateLineage(register);
  validateApplicationLevelGaps(register.gaps, expected.candidate_evidence_ids);
  assertEqual(register.integrity?.material_hash, hashApplicationGapRegisterMaterial(register), "application gap register material hash");
}

export function validateApplicationGapRegisterSuccessor(input: {
  successor: ApplicationGapRegister;
  predecessor: ApplicationGapRegister;
  predecessorFileHash: string;
}): void {
  const lineage = input.successor.lineage;
  if (!lineage) {
    throw new ApplicationGapRegisterError("invalid-gap-register", "Successor application gap register must include lineage.");
  }
  assertEqual(lineage.predecessor_gap_register_id, input.predecessor.gap_register_id, "predecessor gap register ID");
  assertEqual(lineage.predecessor_file_hash, input.predecessorFileHash, "predecessor gap register file hash");
  assertEqual(lineage.predecessor_material_hash, input.predecessor.integrity.material_hash, "predecessor gap register material hash");
  if (input.successor.gap_register_id === input.predecessor.gap_register_id) {
    throw new ApplicationGapRegisterError("invalid-gap-register", "Successor gap register ID must differ from predecessor.");
  }
  for (const field of ["application_id", "jd_snapshot_id", "opportunity_id", "handoff_id", "decision_id", "candidate_evidence_id", "candidate_evidence_hash"] as const) {
    assertEqual(input.successor[field], input.predecessor[field], `successor ${field}`);
  }
  assertEqual(
    normalizeOptionalId(input.successor.decision_reconciliation_id, "successor decision reconciliation ID"),
    normalizeOptionalId(input.predecessor.decision_reconciliation_id, "predecessor decision reconciliation ID"),
    "successor decision_reconciliation_id"
  );
}

export function validateApplicationGapStrategyFields(input: {
  application_level_gap_register?: ApplicationGapRegisterReference;
  application_level_gaps?: ApplicationLevelGap[];
  integrity?: {
    application_gap_register_hash?: string;
    application_level_gaps_hash?: string;
  };
}, candidateEvidenceIds: string[]): void {
  const reference = input.application_level_gap_register;
  const gaps = input.application_level_gaps;
  if (!reference && !gaps) {
    return;
  }
  if (!reference || !gaps) {
    throw new ApplicationGapRegisterError("invalid-gap-register", "Application gap register reference and embedded gaps must be present together.");
  }
  if (!reference.gap_register_id || !reference.material_hash || !reference.file_hash || !reference.source_path) {
    throw new ApplicationGapRegisterError("invalid-gap-register", "Application gap register reference is incomplete.");
  }
  validateApplicationLevelGaps(gaps, candidateEvidenceIds);
  assertEqual(reference.gap_count, gaps.length, "application gap register gap count");
  assertEqual(reference.unresolved_gap_count, unresolvedApplicationGaps(gaps).length, "application gap register unresolved gap count");
  assertEqual(reference.gaps_hash, hashApplicationLevelGaps(gaps), "application gap register embedded gaps hash");
  assertEqual(input.integrity?.application_gap_register_hash, reference.file_hash, "application gap register file hash");
  assertEqual(input.integrity?.application_level_gaps_hash, reference.gaps_hash, "application level gaps hash");
}

export function applicationGapRegisterReference(input: {
  cwd: string;
  registerPath: string;
  register: ApplicationGapRegister;
  fileHash: string;
}): ApplicationGapRegisterReference {
  return {
    gap_register_id: input.register.gap_register_id,
    source_path: toRelative(input.cwd, input.registerPath),
    material_hash: input.register.integrity.material_hash,
    file_hash: input.fileHash,
    gap_count: input.register.gaps.length,
    unresolved_gap_count: unresolvedApplicationGaps(input.register.gaps).length,
    gaps_hash: hashApplicationLevelGaps(input.register.gaps)
  };
}

export function unresolvedApplicationGaps(gaps: ApplicationLevelGap[]): ApplicationLevelGap[] {
  return gaps.filter((gap) => activeGapStatuses.has(gap.status));
}

export function hashApplicationGapRegisterMaterial(register: ApplicationGapRegister): string {
  return hashJson({
    ...register,
    created_at: "stable",
    integrity: {
      material_hash: "stable"
    }
  });
}

export function hashApplicationLevelGaps(gaps: ApplicationLevelGap[]): string {
  return hashJson(gaps);
}

export function normalizeApplicationRequirement(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/gu, " ").trim().replace(/\s+/gu, "-");
}

function validateApplicationLevelGaps(gaps: ApplicationLevelGap[], candidateEvidenceIds: string[]): void {
  const seen = new Set<string>();
  const validEvidenceIds = new Set(candidateEvidenceIds);
  for (const gap of gaps) {
    if (!gap.gap_id || seen.has(gap.gap_id)) {
      throw new ApplicationGapRegisterError("invalid-gap-register", `Duplicate or missing application gap ID: ${gap.gap_id ?? ""}.`);
    }
    seen.add(gap.gap_id);
    for (const [field, value] of Object.entries({
      requirement: gap.requirement,
      normalized_requirement_key: gap.normalized_requirement_key,
      explanation: gap.explanation,
      source_reference: gap.source_reference,
      claim_boundary: gap.claim_boundary
    })) {
      if (typeof value !== "string" || !value.trim()) {
        throw new ApplicationGapRegisterError("invalid-gap-register", `${gap.gap_id} is missing required ${field}.`);
      }
    }
    if (gap.normalized_requirement_key !== normalizeApplicationRequirement(gap.requirement)) {
      throw new ApplicationGapRegisterError("invalid-gap-register", `${gap.gap_id} normalized requirement key is stale.`);
    }
    if (!["unresolved", "resolved-with-verified-evidence", "waived-by-human-reviewer", "bounded-claim"].includes(gap.status)) {
      throw new ApplicationGapRegisterError("invalid-gap-register", `${gap.gap_id} has unsupported status.`);
    }
    if (!["requires-human-review", "resolved", "waived", "bounded"].includes(gap.resolution_state)) {
      throw new ApplicationGapRegisterError("invalid-gap-register", `${gap.gap_id} has unsupported resolution state.`);
    }
    if (!Array.isArray(gap.closest_supported_evidence_ids)) {
      throw new ApplicationGapRegisterError("invalid-gap-register", `${gap.gap_id} closest_supported_evidence_ids must be an array.`);
    }
    const seenEvidenceIds = new Set<string>();
    for (const evidenceId of gap.closest_supported_evidence_ids) {
      if (seenEvidenceIds.has(evidenceId)) {
        throw new ApplicationGapRegisterError("invalid-gap-register", `${gap.gap_id} contains a duplicate candidate evidence ID reference.`);
      }
      seenEvidenceIds.add(evidenceId);
      if (!validEvidenceIds.has(evidenceId)) {
        throw new ApplicationGapRegisterError("invalid-gap-register", `${gap.gap_id} references unknown candidate evidence ID: ${evidenceId}.`);
      }
    }
    if (gap.status === "resolved-with-verified-evidence" && (gap.resolution_state !== "resolved" || gap.closest_supported_evidence_ids.length === 0)) {
      throw new ApplicationGapRegisterError("invalid-gap-register", `${gap.gap_id} cannot be resolved without verified evidence.`);
    }
    if (gap.status === "unresolved" && (gap.resolution_state !== "requires-human-review" || !gap.human_review_required || !gap.positive_claim_prohibited)) {
      throw new ApplicationGapRegisterError("invalid-gap-register", `${gap.gap_id} unresolved gaps must require human review and prohibit positive-claim conversion.`);
    }
    if (gap.status === "bounded-claim" && (gap.resolution_state !== "bounded" || !gap.human_review_required || !gap.positive_claim_prohibited)) {
      throw new ApplicationGapRegisterError("invalid-gap-register", `${gap.gap_id} bounded claims must require human review and prohibit positive-claim conversion.`);
    }
    if (gap.status === "waived-by-human-reviewer" && gap.resolution_state !== "waived") {
      throw new ApplicationGapRegisterError("invalid-gap-register", `${gap.gap_id} waived gaps must carry waived resolution state.`);
    }
  }
}

function readJson<T>(file: string): T {
  rejectSymlink(file);
  if (!existsSync(file)) {
    throw new ApplicationGapRegisterError("missing-record", `File not found: ${file}`);
  }
  const stat = statSync(file);
  if (!stat.isFile()) {
    throw new ApplicationGapRegisterError("invalid-input", `Expected a file: ${file}`);
  }
  if (stat.size > maxJsonBytes) {
    throw new ApplicationGapRegisterError("invalid-input", `JSON file exceeds safe size limit: ${file}`);
  }
  const raw = readFileSync(file, "utf8");
  if (credentialPattern.test(raw)) {
    throw new ApplicationGapRegisterError("unsafe-input", `Input contains suspected credential material: ${file}`);
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new ApplicationGapRegisterError("malformed-json", `Malformed JSON: ${file}`);
  }
}

function requireSchema(value: { schema_version?: string }, label: string): void {
  if (!["1.0.0", applicationGapRegisterSchemaVersion].includes(String(value.schema_version))) {
    throw new ApplicationGapRegisterError("unsupported-schema", `Unsupported ${label} schema_version: ${String(value.schema_version)}`);
  }
}

function validateLineage(register: ApplicationGapRegister): void {
  if (register.schema_version === "1.0.0" && register.lineage) {
    throw new ApplicationGapRegisterError("unsupported-schema", "Application gap register lineage requires schema_version 1.1.0.");
  }
  if (!register.lineage) {
    return;
  }
  if (register.lineage.predecessor_gap_register_id === register.gap_register_id) {
    throw new ApplicationGapRegisterError("invalid-gap-register", "Application gap register lineage cannot reference itself.");
  }
  for (const [field, value] of Object.entries({
    predecessor_gap_register_id: register.lineage.predecessor_gap_register_id,
    predecessor_file_hash: register.lineage.predecessor_file_hash,
    predecessor_material_hash: register.lineage.predecessor_material_hash,
    revision_reason: register.lineage.revision_reason
  })) {
    if (typeof value !== "string" || !value.trim()) {
      throw new ApplicationGapRegisterError("invalid-gap-register", `Missing required lineage field: ${field}.`);
    }
  }
  if (!/^[a-f0-9]{64}$/u.test(register.lineage.predecessor_file_hash) || !/^[a-f0-9]{64}$/u.test(register.lineage.predecessor_material_hash)) {
    throw new ApplicationGapRegisterError("invalid-gap-register", "Lineage predecessor hashes must be SHA-256 values.");
  }
  if (!["claim-boundary-correction", "evidence-update", "human-review-correction", "workflow-correction"].includes(register.lineage.revision_reason)) {
    throw new ApplicationGapRegisterError("invalid-gap-register", "Unsupported lineage revision_reason.");
  }
  if (!Number.isInteger(register.lineage.revision_number) || register.lineage.revision_number < 1) {
    throw new ApplicationGapRegisterError("invalid-gap-register", "Lineage revision_number must be a positive integer.");
  }
}

function assertEqual(actual: unknown, expected: unknown, label: string): void {
  if (actual !== expected) {
    throw new ApplicationGapRegisterError("integrity-mismatch", `${label} mismatch: expected ${String(expected)}, got ${String(actual)}`);
  }
}

function normalizeOptionalId(value: unknown, label: string): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value !== "string" || !value.trim()) {
    throw new ApplicationGapRegisterError("invalid-gap-register", `${label} must be a non-empty string when present.`);
  }
  return value;
}

function assertPrivatePath(file: string, cwd: string, label: string): void {
  if (isInside(file, os.tmpdir())) {
    return;
  }
  const normalized = toRelative(cwd, file);
  if (!normalized.startsWith("data/private/")) {
    throw new ApplicationGapRegisterError("unsafe-storage", `${label} must stay under data/private/ when inside the repository.`);
  }
  assertGitIgnores(cwd, normalized);
}

function assertGitIgnores(cwd: string, relativePath: string): void {
  try {
    execFileSync("git", ["check-ignore", "-q", "--", relativePath], { cwd, stdio: "ignore" });
  } catch {
    throw new ApplicationGapRegisterError("unsafe-storage", `Private path is not ignored by Git: ${relativePath}`);
  }
}

function assertInside(file: string, root: string, label: string): void {
  if (!isInside(file, root)) {
    throw new ApplicationGapRegisterError("unsafe-reference", `${label} must resolve inside the private registry root.`);
  }
}

function rejectSymlink(file: string): void {
  if (existsSync(file) && lstatSync(file).isSymbolicLink()) {
    throw new ApplicationGapRegisterError("unsafe-reference", `Symlink inputs are not allowed: ${file}`);
  }
}

function isInside(file: string, root: string): boolean {
  const relative = path.relative(root, file);
  return Boolean(relative) && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function fileHash(file: string): string {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function hashJson(value: unknown): string {
  return createHash("sha256").update(stableStringify(value)).digest("hex");
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function toRelative(cwd: string, file: string): string {
  const relative = path.relative(cwd, file);
  if (relative && !relative.startsWith("..") && !path.isAbsolute(relative)) {
    return relative.replace(/\\/g, "/");
  }
  return file;
}
