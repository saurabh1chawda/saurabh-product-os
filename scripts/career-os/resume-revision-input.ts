import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, readFileSync, statSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { allDraftStatementIds, checklistId, isLegacyMigrationReview, type ResumeReviewDecisionArtifact, type ReviewableChecklist, type ReviewableDraft } from "./resume-review-decision.ts";
import {
  buildEvidenceConstructionProof,
  constructionProofSchemaVersion,
  hashRenderedRevisionStatement,
  renderRevisionStatementText,
  type ApplicationFitGapLike,
  type ConstructionProofSchemaVersion,
  type GapRegisterReferenceLike,
  type RevisionBoundaryClass,
  type RevisionClaimAtoms,
  type RevisionTargetSection,
  type RevisionTemplateId,
  type TrustedEvidenceItem
} from "./resume-construction-proof.ts";

export const resumeRevisionInputSchemaVersion = "1.0.0" as const;
export const resumeRevisionInputSchemaVersionV2 = "1.1.0" as const;

export type { ConstructionProofSchemaVersion, RevisionBoundaryClass, RevisionClaimAtoms, RevisionTargetSection, RevisionTemplateId };

export type ResumeRevisionInputArtifact = {
  schema_version: typeof resumeRevisionInputSchemaVersion | typeof resumeRevisionInputSchemaVersionV2;
  artifact_type: "resume-revision-input";
  revision_input_id: string;
  application_id: string;
  created_at: string;
  created_by: string;
  lifecycle_state: "human_review_required";
  predecessor_draft: {
    draft_id: string;
    source_path: string;
    file_hash: string;
    material_hash: string;
  };
  predecessor_checklist: {
    checklist_id: string;
    source_path: string;
    file_hash: string;
  };
  prior_review_decision: {
    review_decision_id: string;
    source_path: string;
    file_hash: string;
    material_hash: string;
  };
  strategy: {
    strategy_id: string;
    source_path: string;
    file_hash: string;
    material_hash: string;
  };
  candidate_evidence: {
    evidence_source_id: string;
    source_path: string;
    file_hash: string;
  };
  application_gap_register: {
    gap_register_id: string;
    source_path: string;
    file_hash: string;
    material_hash: string;
  };
  revised_statements: RevisionStatement[];
  expansion_items: RevisionStatement[];
  integrity: {
    material_hash: string;
  };
};

export type RevisionStatement = {
  statement_id: string;
  predecessor_statement_id?: string;
  target_section: RevisionTargetSection;
  template_id: RevisionTemplateId;
  claim_atoms: RevisionClaimAtoms;
  primary_evidence_id: string;
  supporting_evidence_ids: string[];
  trusted_evidence_ids: string[];
  strategy_support_references: string[];
  related_application_fit_gap_ids: string[];
  boundary_class: RevisionBoundaryClass;
  human_review_required: true;
  selected_metric_key?: string;
};

export type TrustedEvidenceSource = {
  evidence_source_id: string;
  evidence_items: TrustedEvidenceItem[];
};

export class ResumeRevisionInputError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export function hashResumeRevisionInputMaterial(revision: { created_at?: string; integrity?: Record<string, unknown> }): string {
  return hashJson({ ...revision, created_at: "stable", integrity: { ...revision.integrity, material_hash: "stable" } });
}

export { hashRenderedRevisionStatement, renderRevisionStatementText };

export function buildResumeRevisionInput(
  input: Omit<ResumeRevisionInputArtifact, "integrity">,
  context: Parameters<typeof validateResumeRevisionInput>[1]
): ResumeRevisionInputArtifact {
  const revision = { ...input, integrity: { material_hash: "" } };
  revision.integrity.material_hash = hashResumeRevisionInputMaterial(revision);
  validateResumeRevisionInput(revision, context);
  return revision;
}

export function readAndValidateResumeRevisionInput(input: {
  file: string;
  cwd: string;
  registryRoot: string;
  predecessorDraft: ReviewableDraft;
  predecessorDraftPath: string;
  predecessorChecklist: ReviewableChecklist;
  predecessorChecklistPath: string;
  priorReviewDecision: ResumeReviewDecisionArtifact;
  priorReviewDecisionPath: string;
  strategy: { strategy_id: string; integrity: { material_hash: string } };
  strategyPath: string;
  candidateEvidence: TrustedEvidenceSource;
  candidateEvidencePath: string;
  applicationGapRegister: { gap_register_id: string; integrity: { material_hash: string }; gaps?: ApplicationFitGapLike[] };
  applicationGapRegisterPath: string;
}): { revisionInput: ResumeRevisionInputArtifact; fileHash: string } {
  assertPrivatePath(input.file, input.cwd, "Resume revision input");
  assertInside(input.file, input.registryRoot);
  const revisionInput = readJson<ResumeRevisionInputArtifact>(input.file);
  validateResumeRevisionInput(revisionInput, input);
  return { revisionInput, fileHash: fileHash(input.file) };
}

export function validateResumeRevisionInput(
  revision: ResumeRevisionInputArtifact,
  input: {
    predecessorDraft: ReviewableDraft;
    predecessorDraftPath: string;
    predecessorChecklist: ReviewableChecklist;
    predecessorChecklistPath: string;
    priorReviewDecision: ResumeReviewDecisionArtifact;
    priorReviewDecisionPath: string;
    strategy: { strategy_id: string; integrity: { material_hash: string } };
    strategyPath: string;
    candidateEvidence: TrustedEvidenceSource;
    candidateEvidencePath: string;
    applicationGapRegister: { gap_register_id: string; integrity: { material_hash: string }; gaps?: ApplicationFitGapLike[] };
    applicationGapRegisterPath: string;
  }
): void {
  if (![resumeRevisionInputSchemaVersion, resumeRevisionInputSchemaVersionV2].includes(revision.schema_version) || revision.artifact_type !== "resume-revision-input") {
    throw new ResumeRevisionInputError("invalid-revision-input", "Input must be a resume-revision-input artifact.");
  }
  if (revision.lifecycle_state !== "human_review_required") {
    throw new ResumeRevisionInputError("invalid-revision-input", "Revision input must remain human_review_required.");
  }
  if (!revision.revision_input_id || !revision.application_id || !revision.created_by.trim() || Number.isNaN(Date.parse(revision.created_at))) {
    throw new ResumeRevisionInputError("invalid-revision-input", "Revision input identity metadata is incomplete.");
  }
  assertEqual(revision.application_id, input.predecessorDraft.references.application_id, "revision input application ID");
  assertEqual(revision.predecessor_draft.draft_id, input.predecessorDraft.draft_id, "predecessor draft ID");
  assertEqual(revision.predecessor_draft.file_hash, fileHash(input.predecessorDraftPath), "predecessor draft file hash");
  assertEqual(revision.predecessor_draft.material_hash, input.predecessorDraft.integrity.material_hash, "predecessor draft material hash");
  assertEqual(revision.predecessor_checklist.checklist_id, checklistId(input.predecessorChecklist), "predecessor checklist ID");
  assertEqual(revision.predecessor_checklist.file_hash, fileHash(input.predecessorChecklistPath), "predecessor checklist file hash");
  assertEqual(revision.prior_review_decision.review_decision_id, input.priorReviewDecision.review_decision_id, "prior review decision ID");
  if (input.priorReviewDecision.lifecycle_state !== "revision_required") {
    throw new ResumeRevisionInputError("invalid-revision-input", "Revision input must be based on a revision_required review decision.");
  }
  validatePriorReviewCompatibility(input.predecessorDraft, input.priorReviewDecision);
  assertEqual(revision.prior_review_decision.file_hash, fileHash(input.priorReviewDecisionPath), "prior review decision file hash");
  assertEqual(revision.prior_review_decision.material_hash, input.priorReviewDecision.integrity.material_hash, "prior review decision material hash");
  assertEqual(revision.strategy.strategy_id, input.strategy.strategy_id, "revision input strategy ID");
  assertEqual(revision.strategy.file_hash, fileHash(input.strategyPath), "revision input strategy file hash");
  assertEqual(revision.strategy.material_hash, input.strategy.integrity.material_hash, "revision input strategy material hash");
  assertEqual(revision.candidate_evidence.evidence_source_id, input.candidateEvidence.evidence_source_id, "revision input candidate evidence ID");
  assertEqual(revision.candidate_evidence.file_hash, fileHash(input.candidateEvidencePath), "revision input candidate evidence hash");
  assertEqual(revision.application_gap_register.gap_register_id, input.applicationGapRegister.gap_register_id, "revision input gap register ID");
  assertEqual(revision.application_gap_register.file_hash, fileHash(input.applicationGapRegisterPath), "revision input gap register file hash");
  assertEqual(revision.application_gap_register.material_hash, input.applicationGapRegister.integrity.material_hash, "revision input gap register material hash");
  assertEqual(revision.integrity?.material_hash, hashResumeRevisionInputMaterial(revision), "revision input material hash");
  validateStatements(revision, input);
}

function validateStatements(
  revision: ResumeRevisionInputArtifact,
  input: {
    predecessorDraft: ReviewableDraft;
    applicationGapRegister: { gap_register_id?: string; integrity?: { material_hash?: string }; gaps?: ApplicationFitGapLike[] };
    applicationGapRegisterPath?: string;
    candidateEvidence: TrustedEvidenceSource;
  }
): void {
  const statementIds = [...revision.revised_statements, ...revision.expansion_items].map((item) => item.statement_id);
  assertNoDuplicates(statementIds, "revision statement");
  const predecessorStatementIds = new Set(allDraftStatementIds(input.predecessorDraft));
  const gapIds = new Set(
    input.predecessorDraft.schema_version === "1.0.0"
      ? (input.applicationGapRegister.gaps ?? []).map((gap) => gap.gap_id)
      : (input.predecessorDraft.application_fit_gaps ?? []).map((gap) => gap.gap_id)
  );
  const proofVersion = revision.schema_version === resumeRevisionInputSchemaVersionV2 ? constructionProofSchemaVersion : "1.0.0";
  const gapRegisterReference: GapRegisterReferenceLike | undefined = revision.schema_version === resumeRevisionInputSchemaVersionV2
    ? {
        gap_register_id: revision.application_gap_register.gap_register_id,
        file_hash: revision.application_gap_register.file_hash,
        material_hash: revision.application_gap_register.material_hash
      }
    : undefined;
  for (const item of [...revision.revised_statements, ...revision.expansion_items]) {
    if (!["headline", "summary", "core-skills", "experience-bullets", "achievements", "projects"].includes(item.target_section)) {
      throw new ResumeRevisionInputError("invalid-revision-input", `Unsupported revision target section: ${item.target_section}.`);
    }
    if ("text" in (item as unknown as Record<string, unknown>)) {
      throw new ResumeRevisionInputError("invalid-revision-input", "Revision statements must use evidence-bound templates, not free-form text.");
    }
    if (item.human_review_required !== true) {
      throw new ResumeRevisionInputError("invalid-revision-input", "Revision statements must require human review.");
    }
    if (item.predecessor_statement_id && !predecessorStatementIds.has(item.predecessor_statement_id)) {
      throw new ResumeRevisionInputError("invalid-revision-input", `Unknown predecessor statement ID: ${item.predecessor_statement_id}.`);
    }
    if (!item.trusted_evidence_ids.length) {
      throw new ResumeRevisionInputError("invalid-revision-input", "Revision statements must cite trusted evidence.");
    }
    if (!item.strategy_support_references.length) {
      throw new ResumeRevisionInputError("invalid-revision-input", "Revision statements must cite Strategy support references.");
    }
    if (revision.schema_version === resumeRevisionInputSchemaVersion && (item.selected_metric_key || (item.template_id === "bounded-product-work" && !item.claim_atoms.bounded_qualifier))) {
      throw new ResumeRevisionInputError("invalid-revision-input", "Revision input 1.0.0 cannot use proof v2 metric or boundary semantics.");
    }
    if (revision.schema_version === resumeRevisionInputSchemaVersionV2) {
      if (item.template_id === "metric-outcome" && !item.selected_metric_key) {
        throw new ResumeRevisionInputError("invalid-revision-input", "Revision input 1.1.0 metric statements require a selected metric key.");
      }
      if (item.template_id === "bounded-product-work" && item.claim_atoms.bounded_qualifier) {
        throw new ResumeRevisionInputError("invalid-revision-input", "Revision input 1.1.0 bounded statements must use non-rendered boundary controls.");
      }
    }
    try {
      buildEvidenceConstructionProof(item, input.candidateEvidence.evidence_items, {
        proofSchemaVersion: proofVersion,
        currentRegisterGaps: revision.schema_version === resumeRevisionInputSchemaVersionV2 ? input.applicationGapRegister.gaps : undefined,
        gapRegisterReference
      });
    } catch (error) {
      throw new ResumeRevisionInputError("invalid-revision-input", error instanceof Error ? error.message : String(error));
    }
    for (const gapId of item.related_application_fit_gap_ids) {
      if (!gapIds.has(gapId)) {
        throw new ResumeRevisionInputError("invalid-revision-input", `Unknown related application-fit gap ID: ${gapId}.`);
      }
    }
    if (!["ordinary-evidence-backed", "acknowledged-application-fit-gap", "bounded-claim-control"].includes(item.boundary_class)) {
      throw new ResumeRevisionInputError("invalid-revision-input", "Unsupported revision boundary class.");
    }
    if (item.boundary_class === "acknowledged-application-fit-gap" && item.related_application_fit_gap_ids.length) {
      throw new ResumeRevisionInputError("invalid-revision-input", "Acknowledged application-fit gaps cannot generate positive revision statements.");
    }
    if (item.boundary_class === "bounded-claim-control" && item.template_id !== "bounded-product-work") {
      throw new ResumeRevisionInputError("invalid-revision-input", "Bounded claim controls must use a bounded template.");
    }
  }
}

function validatePriorReviewCompatibility(predecessorDraft: ReviewableDraft, reviewDecision: ResumeReviewDecisionArtifact): void {
  if (predecessorDraft.schema_version === "1.0.0") {
    if (!isLegacyMigrationReview(reviewDecision)) {
      throw new ResumeRevisionInputError("invalid-revision-input", "Draft 1.0.0 revision input requires a legacy migration review decision.");
    }
    if (reviewDecision.lifecycle_state !== "revision_required" || reviewDecision.approval_granted !== false) {
      throw new ResumeRevisionInputError("invalid-revision-input", "Legacy migration review decision must remain non-approval revision provenance.");
    }
    return;
  }
  if (isLegacyMigrationReview(reviewDecision)) {
    throw new ResumeRevisionInputError("invalid-revision-input", "Legacy migration review decisions cannot target Draft 1.1.0 revision inputs.");
  }
}

function readJson<T>(file: string): T {
  rejectSymlink(file);
  const stat = statSync(file);
  if (!stat.isFile()) throw new ResumeRevisionInputError("invalid-input", `Expected a file: ${file}`);
  if (stat.size > 750_000) throw new ResumeRevisionInputError("invalid-input", `JSON file exceeds safe size limit: ${file}`);
  const raw = readFileSync(file, "utf8");
  if (/(password|api[_-]?key|secret|token|private[_-]?key|credential)/i.test(raw)) {
    throw new ResumeRevisionInputError("unsafe-input", `Input contains suspected credential material: ${file}`);
  }
  return JSON.parse(raw) as T;
}

function assertNoDuplicates(values: string[], label: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (!value || seen.has(value)) throw new ResumeRevisionInputError("invalid-revision-input", `Duplicate or missing ${label} ID: ${value}.`);
    seen.add(value);
  }
}

function assertPrivatePath(file: string, cwd: string, label: string): void {
  if (isInside(file, os.tmpdir())) return;
  const normalized = toRelative(cwd, file);
  if (!normalized.startsWith("data/private/")) {
    throw new ResumeRevisionInputError("unsafe-storage", `${label} must stay under data/private/ when inside the repository.`);
  }
  execFileSync("git", ["check-ignore", "-q", "--", normalized], { cwd, stdio: "ignore" });
}

function assertInside(file: string, root: string): void {
  if (!isInside(file, root)) throw new ResumeRevisionInputError("unsafe-reference", "Revision input must resolve inside the private registry root.");
}

function rejectSymlink(file: string): void {
  if (existsSync(file) && lstatSync(file).isSymbolicLink()) throw new ResumeRevisionInputError("unsafe-reference", `Symlink inputs are not allowed: ${file}`);
}

function isInside(file: string, root: string): boolean {
  const relative = path.relative(root, file);
  return Boolean(relative) && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function toRelative(cwd: string, file: string): string {
  const relative = path.relative(cwd, file);
  if (relative && !relative.startsWith("..") && !path.isAbsolute(relative)) return relative.replace(/\\/g, "/");
  return file;
}

function fileHash(file: string): string {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function hashJson(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function assertEqual(actual: unknown, expected: unknown, label: string): void {
  if (actual !== expected) {
    throw new ResumeRevisionInputError("integrity-mismatch", `${label} mismatch: expected ${String(expected)}, got ${String(actual)}`);
  }
}
