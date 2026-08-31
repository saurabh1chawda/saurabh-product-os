import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, readFileSync, statSync } from "node:fs";
import os from "node:os";
import path from "node:path";

export const resumeReviewDecisionSchemaVersion = "1.0.0" as const;
export const legacyDraftReviewMigrationSchemaVersion = "1.1.0" as const;
export const legacyDraftReviewMigrationMode = "legacy-draft-1.0-revision-migration" as const;

export type ReviewLifecycleState = "revision_required" | "reviewed_not_approved";
export type StatementReviewDecision = "retain" | "revise" | "reject";
export type GapReviewDecision = "acknowledge-and-exclude" | "accept-bounded-representation" | "revise" | "require-evidence" | "reject-contradictory-content";
export type ChecklistReviewDecision = "resolved" | "unresolved";
export type SectionReviewDecision = "keep-sparse-review-draft" | "authorize-evidence-backed-expansion" | "stop-and-reconsider-scope";
export type ReviewResolutionReason =
  | "acknowledged-gap-claim-excluded"
  | "bounded-claim-verified"
  | "blocking-content-removed"
  | "evidence-verified"
  | "content-reviewed";
export type ReviewGapClass = "acknowledged-application-fit-gap" | "bounded-claim-control";
export type LegacyReviewGapClass = "legacy-unresolved-application-level-gap" | "legacy-bounded-application-level-gap";
export type LegacyDraftReviewMigrationMode = typeof legacyDraftReviewMigrationMode;

export type ResumeReviewDecisionArtifact = {
  schema_version: typeof resumeReviewDecisionSchemaVersion | typeof legacyDraftReviewMigrationSchemaVersion;
  artifact_type: "resume-review-decision";
  review_mode?: LegacyDraftReviewMigrationMode;
  migration_only?: true;
  review_decision_id: string;
  application_id: string;
  lifecycle_state: ReviewLifecycleState;
  approval_granted: false;
  reviewer: {
    reviewer_id: string;
    display_name: string;
    reviewer_role: "candidate-content-reviewer" | "independent-content-reviewer";
  };
  reviewed_at: string;
  draft: {
    draft_id: string;
    source_path: string;
    file_hash: string;
    material_hash: string;
  };
  checklist: {
    checklist_id: string;
    source_path: string;
    file_hash: string;
  };
  statement_decisions: Array<{
    statement_id: string;
    decision: StatementReviewDecision;
    reviewer_note?: string;
  }>;
  gap_decisions: Array<{
    gap_id: string;
    source_gap_class: ReviewGapClass | LegacyReviewGapClass;
    decision: GapReviewDecision;
    reviewed_statement_ids: string[];
    checklist_item_id: string;
    resolution_reason: ReviewResolutionReason;
    reviewer_note?: string;
  }>;
  checklist_decisions: Array<{
    check_id: string;
    decision: ChecklistReviewDecision;
    resolution_reason: ReviewResolutionReason;
    reviewer_note?: string;
  }>;
  section_decision: SectionReviewDecision;
  integrity: {
    material_hash: string;
  };
};

export type ReviewableDraft = {
  schema_version: string;
  artifact_type?: string;
  draft_id: string;
  references: { application_id: string };
  application_fit_gaps?: Array<{
    gap_id: string;
    gap_class: ReviewGapClass;
    allowed_review_dispositions: GapReviewDecision[];
    included_statement_ids: string[];
    excluded_from_positive_claims?: boolean;
    claim_boundary?: string;
  }>;
  application_level_gaps?: Array<{
    gap_id: string;
    status: string;
    resolution_state: string;
  }>;
  integrity: { material_hash: string };
  professional_headline?: { statement_id?: string; text: string } | null;
  professional_summary?: Array<{ statement_id?: string; text: string }>;
  core_skills?: Array<{ statement_id?: string; text: string }>;
  role_specific_experience_bullets?: Array<{ statement_id?: string; text: string }>;
  selected_achievements?: Array<{ statement_id?: string; text: string }>;
  education?: Array<{ statement_id?: string; text: string }>;
  certifications?: Array<{ statement_id?: string; text: string }>;
  projects_or_portfolio_evidence?: Array<{ statement_id?: string; text: string }>;
};

export type ReviewableChecklist = {
  schema_version: string;
  checklist_id?: string;
  draft_id: string;
  items: Array<{
    check_id: string;
    status: string;
    evidence_ids?: string[];
    applicable_gap_ids?: string[];
    required_resolution_reason_classes?: ReviewResolutionReason[];
  }>;
};

export class ResumeReviewDecisionError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export function hashResumeReviewDecisionMaterial(review: { reviewed_at?: string; integrity?: Record<string, unknown> }): string {
  return hashJson({ ...review, reviewed_at: "stable", integrity: { ...review.integrity, material_hash: "stable" } });
}

export function buildResumeReviewDecision(
  input: Omit<ResumeReviewDecisionArtifact, "integrity">,
  context: Parameters<typeof validateResumeReviewDecision>[1]
): ResumeReviewDecisionArtifact {
  const review = { ...input, integrity: { material_hash: "" } };
  review.integrity.material_hash = hashResumeReviewDecisionMaterial(review);
  validateResumeReviewDecision(review, context);
  return review;
}

export function readAndValidateResumeReviewDecision(input: {
  file: string;
  cwd: string;
  registryRoot: string;
  draft: ReviewableDraft;
  draftPath: string;
  checklist: ReviewableChecklist;
  checklistPath: string;
}): { reviewDecision: ResumeReviewDecisionArtifact; fileHash: string } {
  assertPrivatePath(input.file, input.cwd, "Resume review decision");
  assertInside(input.file, input.registryRoot, "Resume review decision");
  const reviewDecision = readJson<ResumeReviewDecisionArtifact>(input.file);
  validateResumeReviewDecision(reviewDecision, input);
  return { reviewDecision, fileHash: fileHash(input.file) };
}

export function validateResumeReviewDecision(
  review: ResumeReviewDecisionArtifact,
  input: {
    cwd: string;
    draft: ReviewableDraft;
    draftPath: string;
    checklist: ReviewableChecklist;
    checklistPath: string;
  }
): void {
  if ((review.schema_version !== resumeReviewDecisionSchemaVersion && review.schema_version !== legacyDraftReviewMigrationSchemaVersion) || review.artifact_type !== "resume-review-decision") {
    throw new ResumeReviewDecisionError("invalid-review-decision", "Input must be a resume-review-decision artifact.");
  }
  if (!["revision_required", "reviewed_not_approved"].includes(review.lifecycle_state)) {
    throw new ResumeReviewDecisionError("invalid-review-decision", "Unsupported review decision lifecycle_state.");
  }
  if (review.approval_granted !== false) {
    throw new ResumeReviewDecisionError("invalid-review-decision", "Review decision must not grant export approval.");
  }
  if (!review.review_decision_id || !review.application_id || !normalizeIdentity(review.reviewer?.reviewer_id) || !review.reviewer?.display_name?.trim()) {
    throw new ResumeReviewDecisionError("invalid-review-decision", "Review decision is missing required identity fields.");
  }
  if (!["candidate-content-reviewer", "independent-content-reviewer"].includes(review.reviewer.reviewer_role)) {
    throw new ResumeReviewDecisionError("invalid-review-decision", "Review decision reviewer role is unsupported.");
  }
  if (Number.isNaN(Date.parse(review.reviewed_at))) {
    throw new ResumeReviewDecisionError("invalid-review-decision", "Review decision reviewed_at must be a valid date.");
  }
  assertEqual(review.application_id, input.draft.references.application_id, "review decision application ID");
  assertEqual(review.draft.draft_id, input.draft.draft_id, "review decision draft ID");
  assertEqual(review.draft.file_hash, fileHash(input.draftPath), "review decision draft file hash");
  assertEqual(review.draft.material_hash, input.draft.integrity.material_hash, "review decision draft material hash");
  assertEqual(review.checklist.checklist_id, checklistId(input.checklist), "review decision checklist ID");
  assertEqual(review.checklist.file_hash, fileHash(input.checklistPath), "review decision checklist file hash");
  assertEqual(review.integrity?.material_hash, hashResumeReviewDecisionMaterial(review), "review decision material hash");
  validateResumeReviewDecisionMaterial(review);
  if (isLegacyMigrationReview(review)) {
    validateLegacyMigrationCoverage(review, input.draft, input.checklist);
  } else {
    validateCoverage(review, input.draft, input.checklist);
  }
}

export function isLegacyMigrationReview(review: ResumeReviewDecisionArtifact): boolean {
  return review.schema_version === legacyDraftReviewMigrationSchemaVersion
    && review.review_mode === legacyDraftReviewMigrationMode
    && review.migration_only === true;
}

export function allDraftStatementIds(draft: ReviewableDraft): string[] {
  return [
    draft.professional_headline,
    ...(draft.professional_summary ?? []),
    ...(draft.core_skills ?? []),
    ...(draft.role_specific_experience_bullets ?? []),
    ...(draft.selected_achievements ?? []),
    ...(draft.education ?? []),
    ...(draft.certifications ?? []),
    ...(draft.projects_or_portfolio_evidence ?? [])
  ]
    .filter((item): item is { statement_id?: string; text: string } => Boolean(item))
    .map((item) => item.statement_id)
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0);
}

export function checklistId(checklist: ReviewableChecklist): string {
  return checklist.checklist_id ?? `RCHK-${checklist.draft_id}`;
}

function validateCoverage(review: ResumeReviewDecisionArtifact, draft: ReviewableDraft, checklist: ReviewableChecklist): void {
  if (review.schema_version !== resumeReviewDecisionSchemaVersion || review.review_mode || "migration_only" in review) {
    throw new ResumeReviewDecisionError("invalid-review-decision", "Non-migration review decisions must not carry migration-only fields.");
  }
  const allStatementIds = allDraftStatementIds(draft);
  assertNoDuplicates(allStatementIds, "draft statement");
  const statementIds = new Set(allStatementIds);
  const gapById = new Map((draft.application_fit_gaps ?? []).map((gap) => [gap.gap_id, gap]));
  assertNoDuplicates(checklist.items.map((item) => item.check_id), "checklist item");
  const checkById = new Map(checklist.items.map((item) => [item.check_id, item]));
  assertNoDuplicates(review.statement_decisions.map((item) => item.statement_id), "statement decision");
  assertNoDuplicates(review.gap_decisions.map((item) => item.gap_id), "gap decision");
  assertNoDuplicates(review.checklist_decisions.map((item) => item.check_id), "checklist decision");
  for (const decision of review.statement_decisions) {
    if (!statementIds.has(decision.statement_id)) {
      throw new ResumeReviewDecisionError("invalid-review-decision", `Unknown statement decision ID: ${decision.statement_id}.`);
    }
    if (!["retain", "revise", "reject"].includes(decision.decision)) {
      throw new ResumeReviewDecisionError("invalid-review-decision", "Unsupported statement decision.");
    }
  }
  for (const statementId of statementIds) {
    if (!review.statement_decisions.some((decision) => decision.statement_id === statementId)) {
      throw new ResumeReviewDecisionError("invalid-review-decision", `Missing statement decision for ${statementId}.`);
    }
  }
  if (review.statement_decisions.length !== statementIds.size) {
    throw new ResumeReviewDecisionError("invalid-review-decision", "Statement decisions must exactly match Draft statement IDs.");
  }
  for (const gap of gapById.values()) {
    if (!review.gap_decisions.some((decision) => decision.gap_id === gap.gap_id)) {
      throw new ResumeReviewDecisionError("invalid-review-decision", `Missing gap decision for ${gap.gap_id}.`);
    }
  }
  for (const decision of review.gap_decisions) {
    const sourceGap = gapById.get(decision.gap_id);
    if (!sourceGap) {
      throw new ResumeReviewDecisionError("invalid-review-decision", `Unknown gap decision ID: ${decision.gap_id}.`);
    }
    if (decision.source_gap_class !== sourceGap.gap_class || !sourceGap.allowed_review_dispositions.includes(decision.decision)) {
      throw new ResumeReviewDecisionError("invalid-review-decision", `Incompatible gap decision for ${decision.gap_id}.`);
    }
    if (!checkById.has(decision.checklist_item_id)) {
      throw new ResumeReviewDecisionError("invalid-review-decision", `Unknown checklist item for gap ${decision.gap_id}.`);
    }
    for (const statementId of decision.reviewed_statement_ids) {
      if (!statementIds.has(statementId)) {
        throw new ResumeReviewDecisionError("invalid-review-decision", `Unknown reviewed statement ID: ${statementId}.`);
      }
    }
    if (!validResolutionReason(decision.resolution_reason)) {
      throw new ResumeReviewDecisionError("invalid-review-decision", "Unsupported gap resolution reason.");
    }
  }
  for (const item of checklist.items) {
    if (!review.checklist_decisions.some((decision) => decision.check_id === item.check_id)) {
      throw new ResumeReviewDecisionError("invalid-review-decision", `Missing checklist decision for ${item.check_id}.`);
    }
  }
  for (const decision of review.checklist_decisions) {
    const checklistItem = checkById.get(decision.check_id);
    if (!checklistItem) {
      throw new ResumeReviewDecisionError("invalid-review-decision", `Unknown checklist decision ID: ${decision.check_id}.`);
    }
    if (!["resolved", "unresolved"].includes(decision.decision) || !validResolutionReason(decision.resolution_reason)) {
      throw new ResumeReviewDecisionError("invalid-review-decision", "Unsupported checklist decision.");
    }
    if (checklistItem.required_resolution_reason_classes?.length && !checklistItem.required_resolution_reason_classes.includes(decision.resolution_reason)) {
      throw new ResumeReviewDecisionError("invalid-review-decision", `Invalid resolution reason for checklist item ${decision.check_id}.`);
    }
  }
  if (review.lifecycle_state === "reviewed_not_approved") {
    if (review.statement_decisions.some((decision) => decision.decision !== "retain")) {
      throw new ResumeReviewDecisionError("invalid-review-decision", "reviewed_not_approved requires every statement decision to retain.");
    }
    if (review.checklist_decisions.some((decision) => decision.decision !== "resolved")) {
      throw new ResumeReviewDecisionError("invalid-review-decision", "reviewed_not_approved requires every checklist decision to be resolved.");
    }
    for (const decision of review.gap_decisions) {
      const sourceGap = gapById.get(decision.gap_id);
      if (!sourceGap) continue;
      if (sourceGap.gap_class === "acknowledged-application-fit-gap" && (decision.decision !== "acknowledge-and-exclude" || decision.resolution_reason !== "acknowledged-gap-claim-excluded")) {
        throw new ResumeReviewDecisionError("invalid-review-decision", `Application-fit gap ${decision.gap_id} is not satisfactory for approval.`);
      }
      if (sourceGap.gap_class === "bounded-claim-control" && (decision.decision !== "accept-bounded-representation" || decision.resolution_reason !== "bounded-claim-verified")) {
        throw new ResumeReviewDecisionError("invalid-review-decision", `Bounded application-fit gap ${decision.gap_id} is not satisfactory for approval.`);
      }
    }
  }
  if (!["keep-sparse-review-draft", "authorize-evidence-backed-expansion", "stop-and-reconsider-scope"].includes(review.section_decision)) {
    throw new ResumeReviewDecisionError("invalid-review-decision", "Unsupported section decision.");
  }
}

function validateLegacyMigrationCoverage(review: ResumeReviewDecisionArtifact, draft: ReviewableDraft, checklist: ReviewableChecklist): void {
  if (draft.schema_version !== "1.0.0") {
    throw new ResumeReviewDecisionError("invalid-review-decision", "Legacy review migration may target only Draft schema_version 1.0.0.");
  }
  if (draft.artifact_type !== "evidence-backed-resume-draft") {
    throw new ResumeReviewDecisionError("invalid-review-decision", "Legacy review migration requires an evidence-backed resume draft.");
  }
  if (review.lifecycle_state !== "revision_required") {
    throw new ResumeReviewDecisionError("invalid-review-decision", "Legacy review migration must remain revision_required.");
  }
  const allStatementIds = allDraftStatementIds(draft);
  assertNoDuplicates(allStatementIds, "draft statement");
  const statementIds = new Set(allStatementIds);
  const legacyGaps = draft.application_level_gaps ?? [];
  if (!legacyGaps.length) {
    throw new ResumeReviewDecisionError("invalid-review-decision", "Legacy review migration requires application_level_gaps.");
  }
  assertNoDuplicates(legacyGaps.map((gap) => gap.gap_id), "legacy gap");
  assertNoDuplicates(checklist.items.map((item) => item.check_id), "checklist item");
  const gapById = new Map(legacyGaps.map((gap) => [gap.gap_id, gap]));
  const checkById = new Map(checklist.items.map((item) => [item.check_id, item]));
  assertNoDuplicates(review.statement_decisions.map((item) => item.statement_id), "statement decision");
  assertNoDuplicates(review.gap_decisions.map((item) => item.gap_id), "gap decision");
  assertNoDuplicates(review.checklist_decisions.map((item) => item.check_id), "checklist decision");
  for (const statementId of statementIds) {
    if (!review.statement_decisions.some((decision) => decision.statement_id === statementId)) {
      throw new ResumeReviewDecisionError("invalid-review-decision", `Missing statement decision for ${statementId}.`);
    }
  }
  for (const decision of review.statement_decisions) {
    if (!statementIds.has(decision.statement_id)) throw new ResumeReviewDecisionError("invalid-review-decision", `Unknown statement decision ID: ${decision.statement_id}.`);
    if (!["retain", "revise", "reject"].includes(decision.decision)) throw new ResumeReviewDecisionError("invalid-review-decision", "Unsupported statement decision.");
  }
  if (review.statement_decisions.length !== statementIds.size) {
    throw new ResumeReviewDecisionError("invalid-review-decision", "Statement decisions must exactly match Draft statement IDs.");
  }
  for (const gap of gapById.values()) {
    if (!review.gap_decisions.some((decision) => decision.gap_id === gap.gap_id)) {
      throw new ResumeReviewDecisionError("invalid-review-decision", `Missing gap decision for ${gap.gap_id}.`);
    }
  }
  for (const decision of review.gap_decisions) {
    const sourceGap = gapById.get(decision.gap_id);
    if (!sourceGap) throw new ResumeReviewDecisionError("invalid-review-decision", `Unknown gap decision ID: ${decision.gap_id}.`);
    validateLegacyGapDecision(sourceGap, decision);
    if (!checkById.has(decision.checklist_item_id)) {
      throw new ResumeReviewDecisionError("invalid-review-decision", `Unknown checklist item for gap ${decision.gap_id}.`);
    }
    if (decision.reviewed_statement_ids.some((statementId) => !statementIds.has(statementId))) {
      throw new ResumeReviewDecisionError("invalid-review-decision", `Unknown reviewed statement ID for gap ${decision.gap_id}.`);
    }
  }
  for (const item of checklist.items) {
    if (!review.checklist_decisions.some((decision) => decision.check_id === item.check_id)) {
      throw new ResumeReviewDecisionError("invalid-review-decision", `Missing checklist decision for ${item.check_id}.`);
    }
  }
  for (const decision of review.checklist_decisions) {
    const checklistItem = checkById.get(decision.check_id);
    if (!checklistItem) throw new ResumeReviewDecisionError("invalid-review-decision", `Unknown checklist decision ID: ${decision.check_id}.`);
    if (!["resolved", "unresolved"].includes(decision.decision) || !validResolutionReason(decision.resolution_reason)) {
      throw new ResumeReviewDecisionError("invalid-review-decision", "Unsupported checklist decision.");
    }
    if (checklistItem.required_resolution_reason_classes?.length && !checklistItem.required_resolution_reason_classes.includes(decision.resolution_reason)) {
      throw new ResumeReviewDecisionError("invalid-review-decision", `Invalid resolution reason for checklist item ${decision.check_id}.`);
    }
  }
  if (!["keep-sparse-review-draft", "authorize-evidence-backed-expansion", "stop-and-reconsider-scope"].includes(review.section_decision)) {
    throw new ResumeReviewDecisionError("invalid-review-decision", "Unsupported section decision.");
  }
}

function validateLegacyGapDecision(
  gap: { gap_id: string; status: string; resolution_state: string },
  decision: ResumeReviewDecisionArtifact["gap_decisions"][number]
): void {
  if (gap.status === "unresolved" && gap.resolution_state === "requires-human-review") {
    if (decision.source_gap_class !== "legacy-unresolved-application-level-gap" || !["acknowledge-and-exclude", "revise", "require-evidence"].includes(decision.decision)) {
      throw new ResumeReviewDecisionError("invalid-review-decision", `Invalid unresolved legacy gap decision for ${gap.gap_id}.`);
    }
    return;
  }
  if (gap.status === "bounded-claim" && gap.resolution_state === "bounded") {
    if (decision.source_gap_class !== "legacy-bounded-application-level-gap" || !["accept-bounded-representation", "revise", "require-evidence"].includes(decision.decision)) {
      throw new ResumeReviewDecisionError("invalid-review-decision", `Invalid bounded legacy gap decision for ${gap.gap_id}.`);
    }
    return;
  }
  throw new ResumeReviewDecisionError("invalid-review-decision", `Unsupported legacy gap state for ${gap.gap_id}.`);
}

function validateResumeReviewDecisionMaterial(review: ResumeReviewDecisionArtifact): void {
  if ((review.schema_version !== resumeReviewDecisionSchemaVersion && review.schema_version !== legacyDraftReviewMigrationSchemaVersion) || review.artifact_type !== "resume-review-decision") {
    throw new ResumeReviewDecisionError("invalid-review-decision", "Input must be a resume-review-decision artifact.");
  }
  if (review.schema_version === legacyDraftReviewMigrationSchemaVersion) {
    if (review.review_mode !== legacyDraftReviewMigrationMode || review.migration_only !== true) {
      throw new ResumeReviewDecisionError("invalid-review-decision", "Schema 1.1.0 review decisions must use the legacy migration discriminator.");
    }
    if (review.lifecycle_state !== "revision_required") {
      throw new ResumeReviewDecisionError("invalid-review-decision", "Legacy migration review decisions must remain revision_required.");
    }
  } else if (review.review_mode || "migration_only" in review) {
    throw new ResumeReviewDecisionError("invalid-review-decision", "Schema 1.0.0 review decisions must not carry migration-only fields.");
  }
  if (!review.review_decision_id || !review.application_id || !normalizeIdentity(review.reviewer?.reviewer_id) || !review.reviewer?.display_name?.trim()) {
    throw new ResumeReviewDecisionError("invalid-review-decision", "Review decision is missing required identity fields.");
  }
  if (!["candidate-content-reviewer", "independent-content-reviewer"].includes(review.reviewer.reviewer_role)) {
    throw new ResumeReviewDecisionError("invalid-review-decision", "Review decision reviewer role is unsupported.");
  }
  if (!["revision_required", "reviewed_not_approved"].includes(review.lifecycle_state)) {
    throw new ResumeReviewDecisionError("invalid-review-decision", "Unsupported review decision lifecycle_state.");
  }
  if (review.approval_granted !== false) {
    throw new ResumeReviewDecisionError("invalid-review-decision", "Review decision must not grant export approval.");
  }
  if (Number.isNaN(Date.parse(review.reviewed_at))) {
    throw new ResumeReviewDecisionError("invalid-review-decision", "Review decision reviewed_at must be a valid date.");
  }
}

export function normalizeIdentity(value: unknown): string {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").toLowerCase() : "";
}

function validResolutionReason(value: string): value is ReviewResolutionReason {
  return ["acknowledged-gap-claim-excluded", "bounded-claim-verified", "blocking-content-removed", "evidence-verified", "content-reviewed"].includes(value);
}

function assertNoDuplicates(values: string[], label: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (!value || seen.has(value)) {
      throw new ResumeReviewDecisionError("invalid-review-decision", `Duplicate or missing ${label} ID: ${value}.`);
    }
    seen.add(value);
  }
}

function readJson<T>(file: string): T {
  rejectSymlink(file);
  const stat = statSync(file);
  if (!stat.isFile()) throw new ResumeReviewDecisionError("invalid-input", `Expected a file: ${file}`);
  if (stat.size > 750_000) throw new ResumeReviewDecisionError("invalid-input", `JSON file exceeds safe size limit: ${file}`);
  const raw = readFileSync(file, "utf8");
  if (/(password|api[_-]?key|secret|token|private[_-]?key|credential)/i.test(raw)) {
    throw new ResumeReviewDecisionError("unsafe-input", `Input contains suspected credential material: ${file}`);
  }
  return JSON.parse(raw) as T;
}

function assertPrivatePath(file: string, cwd: string, label: string): void {
  if (isInside(file, os.tmpdir())) return;
  const normalized = toRelative(cwd, file);
  if (!normalized.startsWith("data/private/")) {
    throw new ResumeReviewDecisionError("unsafe-storage", `${label} must stay under data/private/ when inside the repository.`);
  }
  execFileSync("git", ["check-ignore", "-q", "--", normalized], { cwd, stdio: "ignore" });
}

function assertInside(file: string, root: string, label: string): void {
  if (!isInside(file, root)) {
    throw new ResumeReviewDecisionError("unsafe-reference", `${label} must resolve inside the private registry root.`);
  }
}

function rejectSymlink(file: string): void {
  if (existsSync(file) && lstatSync(file).isSymbolicLink()) {
    throw new ResumeReviewDecisionError("unsafe-reference", `Symlink inputs are not allowed: ${file}`);
  }
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
    throw new ResumeReviewDecisionError("integrity-mismatch", `${label} mismatch: expected ${String(expected)}, got ${String(actual)}`);
  }
}
