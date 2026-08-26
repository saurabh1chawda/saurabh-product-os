import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

type Mode = "dry-run" | "apply";
type DecisionOutcome = "proceed" | "pause" | "decline";
type EffectiveOutcome = "proceed" | "pause";
type EvidenceStatus = "verified" | "human-review-required";

type CliFlags = {
  handoff?: string;
  "candidate-evidence"?: string;
  apply?: boolean;
  "dry-run"?: boolean;
  format?: string;
  now?: string;
};

type ResumeHandoff = {
  schema_version: "1.0.0";
  resume_os_handoff_id: string;
  generated_at: string;
  application_id: string;
  opportunity_id: string;
  jd_snapshot_id: string;
  normalized_role: string;
  normalized_company: string;
  decision_outcome: DecisionOutcome;
  fit_qualification_artifact_references: {
    decision_path: string;
    opportunity_path: string;
    jd_snapshot_path: string;
  };
  candidate_evidence_reference?: string | null;
  requested_next_workflow_stage: string;
  output_location: string;
  integrity: { jd_content_hash: string; source_identity_hash: string; linkage_hash: string };
};

type DecisionRecord = {
  schema_version: "1.0.0";
  decision_id: string;
  outcome: DecisionOutcome;
  reasons: string[];
  evidence_used: string[];
  missing_evidence: string[];
  risks_or_gaps: string[];
  stable_ids: { jdSnapshotId: string; opportunityId: string; applicationId: string };
};

type OpportunityRecord = {
  schema_version: "1.0.0";
  opportunity_id: string;
  jd_snapshot_id: string;
  decision_id: string;
  decision_outcome: DecisionOutcome;
};

type JdSnapshot = {
  schema_version: "1.0.0";
  jd_snapshot_id: string;
  content_hash: string;
  source_identity_hash: string;
  linkage_hash: string;
  deterministic_analysis: { required_competencies: string[]; evidence_expectations: string[] };
};

type ApplicationRecord = {
  schema_version: "1.0.0";
  application_id: string;
  jd_snapshot_id: string | null;
  jd_hash: string | null;
  confidentiality: "private" | "sanitized" | "public-fixture";
  contains_personal_data: boolean;
  safe_to_commit: boolean;
};

type TrustedEvidenceSource = {
  schema_version: "1.0.0";
  evidence_source_id: string;
  source_type: "trusted-candidate-profile";
  trust: { verified: true; verified_at: string; verified_by: string; basis: string };
  candidate_profile: { candidate_name: string; current_positioning?: string };
  evidence_items: EvidenceItem[];
};

type EvidenceItem = {
  evidence_id: string;
  statement: string;
  category?: string;
  tags: string[];
  status: EvidenceStatus;
  source_reference: string;
};

export type DecisionReconciliation = {
  schema_version: "1.0.0";
  reconciliation_id: string;
  artifact_type: "trusted-evidence-decision-reconciliation";
  created_at: string;
  application_id: string;
  opportunity_id: string;
  jd_snapshot_id: string;
  handoff_id: string;
  original_decision_id: string;
  original_decision_outcome: DecisionOutcome;
  effective_reconciled_outcome: EffectiveOutcome;
  trusted_candidate_evidence_source_id: string;
  candidate_evidence_hash: string;
  linked_hashes: {
    handoff_hash: string;
    decision_hash: string;
    opportunity_hash: string;
    jd_snapshot_hash: string;
    application_hash: string;
    candidate_evidence_hash: string;
  };
  requirement_to_evidence_mapping: Array<{ requirement: string; status: "supported" | "gap"; evidence_ids: string[]; notes: string }>;
  supported_requirements: Array<{ requirement: string; evidence_ids: string[] }>;
  unresolved_gaps: Array<{ requirement: string; reason: string }>;
  reasons: string[];
  limitations: string[];
  requested_next_workflow_stage: "resume_strategy" | "human_evidence_review";
  integrity: { material_hash: string };
};

type ReconciliationResult = {
  schema_version: "1.0.0";
  mode: Mode;
  status: "planned" | "created" | "duplicate";
  dry_run: boolean;
  output_path: string;
  summary: {
    reconciliation_id: string;
    application_id: string;
    original_decision_outcome: DecisionOutcome;
    effective_reconciled_outcome: EffectiveOutcome;
    requested_next_workflow_stage: string;
    supported_requirement_count: number;
    unresolved_gap_count: number;
  };
  reconciliation?: DecisionReconciliation;
};

type RunOptions = {
  argv?: string[];
  cwd?: string;
  now?: string;
  simulateWriteFailure?: boolean;
};

const schemaVersion = "1.0.0";
const maxJsonBytes = 750_000;
const credentialPattern = /(password|api[_-]?key|secret|token|private[_-]?key|credential)/i;

export class DecisionReconciliationError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export function runCareerOsDecisionReconciliation(options: RunOptions = {}): ReconciliationResult {
  const cwd = options.cwd ?? process.cwd();
  const flags = parseArgs(options.argv ?? process.argv.slice(2));
  const mode = resolveMode(flags);
  const nowValue = flags.now ?? options.now ?? new Date().toISOString();
  assertValidDate(nowValue, "now");
  if (!flags.handoff) throw new DecisionReconciliationError("invalid-input", "--handoff is required.");
  if (!flags["candidate-evidence"]) throw new DecisionReconciliationError("invalid-input", "--candidate-evidence is required.");

  const handoffPath = resolveExistingJsonPath(cwd, flags.handoff);
  const registryRoot = inferRegistryRootFromHandoff(handoffPath);
  assertPrivateRoot(registryRoot, cwd);
  const evidencePath = resolveExistingJsonPath(cwd, flags["candidate-evidence"]);
  assertPrivatePath(evidencePath, cwd, "Candidate evidence source");
  assertInside(evidencePath, registryRoot, "Candidate evidence source");

  const handoff = readJson<ResumeHandoff>(handoffPath);
  const decisionPath = resolveRegistryReference(cwd, registryRoot, handoff.fit_qualification_artifact_references.decision_path);
  const opportunityPath = resolveRegistryReference(cwd, registryRoot, handoff.fit_qualification_artifact_references.opportunity_path);
  const jdPath = resolveRegistryReference(cwd, registryRoot, handoff.fit_qualification_artifact_references.jd_snapshot_path);
  const applicationPath = path.join(registryRoot, "applications", `${handoff.application_id}.json`);
  assertInside(applicationPath, registryRoot, "Application record");

  const decision = readJson<DecisionRecord>(decisionPath);
  const opportunity = readJson<OpportunityRecord>(opportunityPath);
  const jd = readJson<JdSnapshot>(jdPath);
  const application = readJson<ApplicationRecord>(applicationPath);
  const evidence = readJson<TrustedEvidenceSource>(evidencePath);
  validateLinkedRecords({ handoff, decision, opportunity, jd, application });
  validateTrustedEvidence(evidence);
  if (decision.outcome === "decline") {
    throw new DecisionReconciliationError("decision-declined", "Original decline decisions cannot be reactivated by evidence reconciliation.");
  }

  const hashes = {
    handoff_hash: fileHash(handoffPath),
    decision_hash: fileHash(decisionPath),
    opportunity_hash: fileHash(opportunityPath),
    jd_snapshot_hash: fileHash(jdPath),
    application_hash: fileHash(applicationPath),
    candidate_evidence_hash: fileHash(evidencePath)
  };
  const reconciliation = buildReconciliation({ nowValue, handoff, decision, jd, evidence, hashes });
  const outputPath = path.join(registryRoot, "decision-reconciliations", `${reconciliation.reconciliation_id}.json`);
  assertPrivatePath(outputPath, cwd, "Decision reconciliation output");
  const result = createResult(mode, outputPath, reconciliation);
  if (mode === "dry-run") return { ...result, status: "planned", dry_run: true };

  if (options.simulateWriteFailure) throw new DecisionReconciliationError("reconciliation-write-failure", "Simulated reconciliation write failure.");
  const value = `${JSON.stringify(reconciliation, null, 2)}\n`;
  const existing = existsSync(outputPath) ? readJson<DecisionReconciliation>(outputPath) : null;
  if (existing) {
    if (existing.integrity?.material_hash === reconciliation.integrity.material_hash) {
      return { ...result, status: "duplicate", dry_run: false, reconciliation: existing };
    }
    throw new DecisionReconciliationError("reconciliation-conflict", `Existing decision reconciliation conflicts with this material: ${outputPath}`);
  }
  atomicWriteJson(outputPath, value);
  return { ...result, status: "created", dry_run: false };
}

function buildReconciliation(input: {
  nowValue: string;
  handoff: ResumeHandoff;
  decision: DecisionRecord;
  jd: JdSnapshot;
  evidence: TrustedEvidenceSource;
  hashes: DecisionReconciliation["linked_hashes"];
}): DecisionReconciliation {
  const requirements = roleRequirements(input.jd, input.decision);
  const mapping = requirements.map((requirement) => mapRequirement(requirement, input.evidence.evidence_items));
  const supported = mapping.filter((item) => item.status === "supported").map((item) => ({ requirement: item.requirement, evidence_ids: item.evidence_ids }));
  const gaps = mapping.filter((item) => item.status === "gap").map((item) => ({ requirement: item.requirement, reason: item.notes }));
  const effective: EffectiveOutcome = gaps.length === 0 ? "proceed" : "pause";
  const base: DecisionReconciliation = {
    schema_version: schemaVersion,
    reconciliation_id: reconciliationId(input.handoff, input.hashes.candidate_evidence_hash),
    artifact_type: "trusted-evidence-decision-reconciliation" as const,
    created_at: input.nowValue,
    application_id: input.handoff.application_id,
    opportunity_id: input.handoff.opportunity_id,
    jd_snapshot_id: input.handoff.jd_snapshot_id,
    handoff_id: input.handoff.resume_os_handoff_id,
    original_decision_id: input.decision.decision_id,
    original_decision_outcome: input.decision.outcome,
    effective_reconciled_outcome: effective,
    trusted_candidate_evidence_source_id: input.evidence.evidence_source_id,
    candidate_evidence_hash: input.hashes.candidate_evidence_hash,
    linked_hashes: input.hashes,
    requirement_to_evidence_mapping: mapping,
    supported_requirements: supported,
    unresolved_gaps: gaps,
    reasons: [
      effective === "proceed"
        ? "Every deterministic required competency has verified trusted evidence."
        : "One or more deterministic required competencies still lacks verified trusted evidence.",
      "No numerical fit score was calculated.",
      "Original COS-2 decision and historical records were preserved."
    ],
    limitations: [
      "Append-only reconciliation artifact; does not rewrite COS-2 records.",
      "No resume content, DOCX, PDF, application submission, LLM call, provider call, browser action, or network action was produced.",
      "Partial evidence remains a gap and unsupported claims remain excluded."
    ],
    requested_next_workflow_stage: effective === "proceed" ? "resume_strategy" as const : "human_evidence_review" as const,
    integrity: { material_hash: "" }
  };
  return {
    ...base,
    integrity: {
      material_hash: hashDecisionReconciliationMaterial(base)
    }
  };
}

function validateLinkedRecords(input: {
  handoff: ResumeHandoff;
  decision: DecisionRecord;
  opportunity: OpportunityRecord;
  jd: JdSnapshot;
  application: ApplicationRecord;
}): void {
  const { handoff, decision, opportunity, jd, application } = input;
  requireSchema(handoff, "handoff");
  requireSchema(decision, "decision");
  requireSchema(opportunity, "opportunity");
  requireSchema(jd, "JD snapshot");
  requireSchema(application, "application");
  assertEqual(decision.stable_ids.applicationId, handoff.application_id, "decision/application ID");
  assertEqual(decision.stable_ids.opportunityId, handoff.opportunity_id, "decision/opportunity ID");
  assertEqual(decision.stable_ids.jdSnapshotId, handoff.jd_snapshot_id, "decision/JD ID");
  assertEqual(opportunity.opportunity_id, handoff.opportunity_id, "opportunity ID");
  assertEqual(opportunity.jd_snapshot_id, handoff.jd_snapshot_id, "opportunity/JD ID");
  assertEqual(opportunity.decision_id, decision.decision_id, "opportunity/decision ID");
  assertEqual(opportunity.decision_outcome, decision.outcome, "opportunity decision outcome");
  assertEqual(jd.jd_snapshot_id, handoff.jd_snapshot_id, "JD snapshot ID");
  assertEqual(application.application_id, handoff.application_id, "application ID");
  assertEqual(application.jd_snapshot_id, handoff.jd_snapshot_id, "application/JD ID");
  assertEqual(application.jd_hash, jd.content_hash, "application JD hash");
  assertEqual(handoff.decision_outcome, decision.outcome, "handoff decision outcome");
  assertEqual(handoff.integrity.jd_content_hash, jd.content_hash, "JD content hash");
  assertEqual(handoff.integrity.source_identity_hash, jd.source_identity_hash, "source identity hash");
  assertEqual(handoff.integrity.linkage_hash, jd.linkage_hash, "linkage hash");
  if (application.confidentiality !== "private" || application.safe_to_commit !== false || application.contains_personal_data !== true) {
    throw new DecisionReconciliationError("privacy-contract", "Application record must remain private, personal-data-bearing, and unsafe to commit.");
  }
}

function validateTrustedEvidence(evidence: TrustedEvidenceSource): void {
  requireSchema(evidence, "candidate evidence");
  if (evidence.source_type !== "trusted-candidate-profile" || evidence.trust?.verified !== true) {
    throw new DecisionReconciliationError("untrusted-candidate-evidence", "Candidate evidence source must be explicitly trusted and verified.");
  }
  assertValidDate(evidence.trust.verified_at, "candidate evidence verification date");
  if (!evidence.evidence_source_id || !evidence.trust.verified_by?.trim() || !evidence.trust.basis?.trim() || !evidence.candidate_profile?.candidate_name?.trim()) {
    throw new DecisionReconciliationError("untrusted-candidate-evidence", "Candidate evidence trust metadata is incomplete.");
  }
  if (!Array.isArray(evidence.evidence_items) || evidence.evidence_items.length === 0) {
    throw new DecisionReconciliationError("untrusted-candidate-evidence", "Candidate evidence must contain verified evidence items.");
  }
  for (const item of evidence.evidence_items) {
    if (!item.evidence_id?.trim() || !item.statement?.trim() || !Array.isArray(item.tags) || item.tags.length === 0 || !item.source_reference?.trim()) {
      throw new DecisionReconciliationError("untrusted-candidate-evidence", "Candidate evidence item is incomplete.");
    }
    if (item.status !== "verified") {
      throw new DecisionReconciliationError("untrusted-candidate-evidence", "Decision reconciliation requires verified evidence items only.");
    }
    if (item.tags.some((tag) => !tag.trim())) {
      throw new DecisionReconciliationError("untrusted-candidate-evidence", "Candidate evidence item contains an invalid tag.");
    }
  }
}

function roleRequirements(jd: JdSnapshot, decision: DecisionRecord): string[] {
  const values = [...jd.deterministic_analysis.required_competencies, ...decision.missing_evidence.map((item) => item.replace(/^Evidence should demonstrate\s+/iu, "").replace(/\.$/u, ""))];
  return [...new Map(values.filter(Boolean).map((item) => [normalize(item), item.trim()])).values()];
}

function mapRequirement(requirement: string, items: EvidenceItem[]): DecisionReconciliation["requirement_to_evidence_mapping"][number] {
  const matches = items.filter((item) => item.tags.some((tag) => normalize(tag) === normalize(requirement)));
  if (matches.length) {
    return {
      requirement,
      status: "supported",
      evidence_ids: matches.map((item) => item.evidence_id),
      notes: "Verified trusted candidate evidence directly maps to this required competency tag."
    };
  }
  return {
    requirement,
    status: "gap",
    evidence_ids: [],
    notes: "No verified trusted candidate evidence directly maps to this required competency tag."
  };
}

function parseArgs(argv: string[]): CliFlags {
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) flags[key] = true;
    else {
      flags[key] = next;
      i += 1;
    }
  }
  return flags as CliFlags;
}

function resolveMode(flags: CliFlags): Mode {
  if (flags.apply && flags["dry-run"]) throw new DecisionReconciliationError("invalid-input", "Use either --apply or --dry-run, not both.");
  if (flags.apply) return "apply";
  if (flags["dry-run"]) return "dry-run";
  throw new DecisionReconciliationError("invalid-input", "Choose --dry-run or --apply.");
}

function resolveExistingJsonPath(cwd: string, input: string): string {
  if (containsTraversal(input)) throw new DecisionReconciliationError("unsafe-reference", `Path traversal is not allowed: ${input}`);
  const resolved = path.resolve(cwd, input);
  if (!existsSync(resolved)) throw new DecisionReconciliationError("missing-record", `File not found: ${resolved}`);
  if (path.extname(resolved).toLowerCase() !== ".json") throw new DecisionReconciliationError("invalid-input", "Only JSON inputs are supported.");
  rejectSymlink(resolved);
  return resolved;
}

function resolveRegistryReference(cwd: string, registryRoot: string, reference: string): string {
  if (containsTraversal(reference)) throw new DecisionReconciliationError("unsafe-reference", `Path traversal is not allowed: ${reference}`);
  const resolved = path.resolve(cwd, reference);
  assertInside(resolved, registryRoot, "Referenced record");
  if (!existsSync(resolved)) throw new DecisionReconciliationError("missing-record", `Referenced record not found: ${reference}`);
  rejectSymlink(resolved);
  return resolved;
}

function inferRegistryRootFromHandoff(handoffPath: string): string {
  const parent = path.basename(path.dirname(handoffPath));
  if (parent !== "resume-handoffs") throw new DecisionReconciliationError("invalid-handoff", "Handoff manifest must live under a resume-handoffs directory.");
  return path.dirname(path.dirname(handoffPath));
}

function readJson<T>(file: string): T {
  rejectSymlink(file);
  const stat = statSync(file);
  if (!stat.isFile()) throw new DecisionReconciliationError("invalid-input", `Expected a file: ${file}`);
  if (stat.size > maxJsonBytes) throw new DecisionReconciliationError("invalid-input", `JSON file exceeds safe size limit: ${file}`);
  const raw = readFileSync(file, "utf8");
  if (credentialPattern.test(raw)) throw new DecisionReconciliationError("unsafe-input", `Input contains suspected credential material: ${file}`);
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new DecisionReconciliationError("malformed-json", `Malformed JSON: ${file}`);
  }
}

function atomicWriteJson(file: string, value: string): void {
  mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.tmp-${process.pid}-${Date.now()}`;
  try {
    writeFileSync(temp, value, { flag: "wx" });
    renameSync(temp, file);
  } catch (error) {
    rmSync(temp, { force: true });
    throw error;
  }
}

function createResult(mode: Mode, outputPath: string, reconciliation: DecisionReconciliation): ReconciliationResult {
  return {
    schema_version: schemaVersion,
    mode,
    status: "planned",
    dry_run: mode === "dry-run",
    output_path: outputPath,
    summary: {
      reconciliation_id: reconciliation.reconciliation_id,
      application_id: reconciliation.application_id,
      original_decision_outcome: reconciliation.original_decision_outcome,
      effective_reconciled_outcome: reconciliation.effective_reconciled_outcome,
      requested_next_workflow_stage: reconciliation.requested_next_workflow_stage,
      supported_requirement_count: reconciliation.supported_requirements.length,
      unresolved_gap_count: reconciliation.unresolved_gaps.length
    },
    reconciliation
  };
}

function requireSchema(value: { schema_version?: string }, label: string): void {
  if (value.schema_version !== schemaVersion) throw new DecisionReconciliationError("unsupported-schema", `Unsupported ${label} schema_version: ${String(value.schema_version)}`);
}

function assertEqual(actual: unknown, expected: unknown, label: string): void {
  if (actual !== expected) throw new DecisionReconciliationError("integrity-mismatch", `${label} mismatch: expected ${String(expected)}, got ${String(actual)}`);
}

function assertValidDate(value: string, label: string): void {
  if (Number.isNaN(Date.parse(value))) throw new DecisionReconciliationError("invalid-input", `Invalid ${label}: ${value}`);
}

function assertPrivateRoot(root: string, cwd: string): void {
  if (isInside(root, os.tmpdir())) return;
  const normalized = toRelative(cwd, root);
  if (!normalized.startsWith("data/private/")) throw new DecisionReconciliationError("unsafe-storage", "Decision reconciliations must stay under data/private/ when inside the repository.");
  assertGitIgnores(cwd, `${normalized.replace(/\/$/u, "")}/.decision-reconciliation-probe`);
}

function assertPrivatePath(file: string, cwd: string, label: string): void {
  if (isInside(file, os.tmpdir())) return;
  const normalized = toRelative(cwd, file);
  if (!normalized.startsWith("data/private/")) throw new DecisionReconciliationError("unsafe-storage", `${label} must stay under data/private/ when inside the repository.`);
  assertGitIgnores(cwd, normalized);
}

function assertGitIgnores(cwd: string, relativePath: string): void {
  try {
    execFileSync("git", ["check-ignore", "-q", "--", relativePath], { cwd, stdio: "ignore" });
  } catch {
    throw new DecisionReconciliationError("unsafe-storage", `Private path is not ignored by Git: ${relativePath}`);
  }
}

function assertInside(file: string, root: string, label: string): void {
  if (!isInside(file, root)) throw new DecisionReconciliationError("unsafe-reference", `${label} must resolve inside the private registry root.`);
}

function rejectSymlink(file: string): void {
  if (existsSync(file) && lstatSync(file).isSymbolicLink()) throw new DecisionReconciliationError("unsafe-reference", `Symlink inputs are not allowed: ${file}`);
}

function containsTraversal(reference: string): boolean {
  return reference.split(/[\\/]+/u).some((part) => part === "..");
}

function isInside(file: string, root: string): boolean {
  const relative = path.relative(root, file);
  return Boolean(relative) && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function reconciliationId(handoff: ResumeHandoff, evidenceHash: string): string {
  return `DREC-${handoff.application_id}-${hash(`${handoff.resume_os_handoff_id}:${evidenceHash}`, 8)}`;
}

function fileHash(file: string): string {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function hash(input: string, length: number): string {
  return createHash("sha256").update(input).digest("hex").slice(0, length);
}

export function hashDecisionReconciliationMaterial(reconciliation: DecisionReconciliation): string {
  return hashJson({ ...reconciliation, created_at: "stable", integrity: { material_hash: "stable" } });
}

function hashJson(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function normalize(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/gu, " ").trim();
}

function toRelative(cwd: string, file: string): string {
  const relative = path.relative(cwd, file);
  if (relative && !relative.startsWith("..") && !path.isAbsolute(relative)) return relative.replace(/\\/g, "/");
  return file;
}

function printSummary(result: ReconciliationResult): void {
  console.log(result.dry_run ? "DRY RUN - no reconciliation written" : result.status === "duplicate" ? "DUPLICATE - existing reconciliation preserved" : "APPLY COMPLETE");
  console.log(`Reconciliation ID: ${result.summary.reconciliation_id}`);
  console.log(`Application ID: ${result.summary.application_id}`);
  console.log(`Original decision: ${result.summary.original_decision_outcome}`);
  console.log(`Effective decision: ${result.summary.effective_reconciled_outcome}`);
  console.log(`Next stage: ${result.summary.requested_next_workflow_stage}`);
  console.log(`Supported requirements: ${result.summary.supported_requirement_count}`);
  console.log(`Unresolved gaps: ${result.summary.unresolved_gap_count}`);
  console.log(`Output: ${result.output_path}`);
}

function main(): void {
  try {
    const result = runCareerOsDecisionReconciliation();
    if (process.argv.includes("--format") && process.argv[process.argv.indexOf("--format") + 1] === "json") console.log(JSON.stringify(result, null, 2));
    else printSummary(result);
  } catch (error) {
    console.error(error instanceof DecisionReconciliationError ? `${error.code}: ${error.message}` : error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
