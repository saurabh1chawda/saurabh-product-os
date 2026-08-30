import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  atomicWriteFiles,
  assertInside,
  assertPrivatePath,
  CareerOsExportError,
  existingFiles,
  fileHash,
  hashJson,
  inferRegistryRootFromDraft,
  parseArgs,
  readJson,
  requiredConfirmations,
  resolveExistingJsonPath,
  resolveMode,
  schemaVersion,
  shortHash,
  toRelative
} from "./resume-export-shared.ts";
import type { ResumeApproval, ResumeDraft, ReviewChecklist } from "./resume-export-shared.ts";
import { validateDraftStatementConstruction, type RevisionBoundaryClass, type TrustedEvidenceItem } from "./resume-construction-proof.ts";
import { checklistId, normalizeIdentity, readAndValidateResumeReviewDecision, type ResumeReviewDecisionArtifact } from "./resume-review-decision.ts";

type ApprovalResult = {
  schema_version: "1.0.0";
  mode: "dry-run" | "apply";
  status: "planned" | "created" | "duplicate";
  dry_run: boolean;
  output_dir: string;
  output: string;
  summary: {
    approval_id: string;
    draft_id: string;
    reviewer: string;
    lifecycle_state: "approved_for_export";
    approval_scope: "document_export_only_not_application_submission";
  };
  approval?: ResumeApproval;
};

type RunOptions = {
  argv?: string[];
  cwd?: string;
  now?: string;
};

type TrustedEvidenceSource = {
  schema_version: "1.0.0";
  evidence_source_id: string;
  source_type: "trusted-candidate-profile";
  trust: { verified: true; verified_at: string; verified_by: string; basis: string };
  evidence_items: TrustedEvidenceItem[];
};

export function runCareerOsResumeApprove(options: RunOptions = {}): ApprovalResult {
  const cwd = options.cwd ?? process.cwd();
  const flags = parseArgs(options.argv ?? process.argv.slice(2));
  const mode = resolveMode(flags);
  const reviewer = stringFlag(flags.reviewer, "--reviewer is required.");
  const approverId = typeof flags["approver-id"] === "string" ? normalizeIdentity(flags["approver-id"]) : "";
  const now = stringFlag(flags.now, "") || options.now || new Date().toISOString();
  if (Number.isNaN(Date.parse(now))) throw new CareerOsExportError("invalid-input", `Invalid approval timestamp: ${now}`);
  if (!reviewer.trim()) throw new CareerOsExportError("missing-reviewer", "--reviewer must name the human reviewer.");

  const draftPath = resolveExistingJsonPath(cwd, stringFlag(flags.draft, "--draft is required."));
  const registryRoot = inferRegistryRootFromDraft(draftPath);
  assertPrivatePath(registryRoot, cwd, "Approval registry root");
  const checklistPath = resolveChecklistPath(cwd, registryRoot, draftPath, flags.review);
  assertInside(checklistPath, registryRoot, "Review checklist");

  const draft = readJson<ResumeDraft>(draftPath);
  const checklist = readJson<ReviewChecklist>(checklistPath);
  const candidateEvidence = draft.schema_version === "1.1.0" ? loadCandidateEvidenceForDraft({ cwd, registryRoot, draft, explicitPath: flags["candidate-evidence"] }) : null;
  const reviewDecisionContext = loadReviewDecisionForApproval({ cwd, registryRoot, flags, draft, draftPath, checklist, checklistPath });
  validateDraft(draft, Boolean(reviewDecisionContext));
  validateChecklist(draft, checklist, reviewDecisionContext?.reviewDecision ?? null);
  const approver = approverForDraft(draft, reviewer, approverId);
  validateResumeApprovalCompatibility({ draft, checklist, reviewDecision: reviewDecisionContext?.reviewDecision ?? null, approver, candidateEvidence: candidateEvidence?.evidence ?? null });
  validateConfirmations(flags);
  validateLinkedHashes(cwd, registryRoot, draft);

  const approval = buildApproval({ cwd, now, reviewer: reviewer.trim(), approver, draft, draftPath, checklist, checklistPath, reviewDecisionContext });
  const outputDir = path.join(registryRoot, "resume-approvals", approval.approval_id);
  const output = path.join(outputDir, "resume-approval.json");
  assertPrivatePath(outputDir, cwd, "Resume approval output");
  const result = createResult(mode, outputDir, output, approval);
  if (mode === "dry-run") return { ...result, status: "planned", dry_run: true, approval: undefined };

  const value = `${JSON.stringify(approval, null, 2)}\n`;
  const existing = existingFiles([output]);
  if (existing.length) {
    const current = readJson<ResumeApproval>(output);
    if (current.integrity?.approval_material_hash === approval.integrity.approval_material_hash) {
      return { ...result, status: "duplicate", dry_run: false };
    }
    throw new CareerOsExportError("approval-conflict", `Existing approval conflicts with this draft: ${outputDir}`);
  }
  atomicWriteFiles([{ file: output, value }]);
  return { ...result, status: "created", dry_run: false };
}

function buildApproval(input: {
  cwd: string;
  now: string;
  reviewer: string;
  approver: { approver_id: string; display_name: string };
  draft: ResumeDraft;
  draftPath: string;
  checklist: ReviewChecklist;
  checklistPath: string;
  reviewDecisionContext: { reviewDecision: ResumeReviewDecisionArtifact; reviewDecisionPath: string; reviewDecisionFileHash: string } | null;
}): ResumeApproval {
  const draftHash = fileHash(input.draftPath);
  const checklistHash = fileHash(input.checklistPath);
  const approvalBase = {
    schema_version: input.draft.schema_version === "1.1.0" ? "1.1.0" as const : schemaVersion,
    approval_id: `RAPPROVAL-${input.draft.draft_id}-${shortHash(`${input.draft.integrity.material_hash}:${input.reviewer}`)}`,
    artifact_type: "human-approved-resume-export-approval" as const,
    lifecycle_state: "approved_for_export" as const,
    approval_scope: "document_export_only_not_application_submission" as const,
    approved_at: input.now,
    reviewer: input.reviewer,
    ...(input.draft.schema_version === "1.1.0" ? { approver: input.approver } : {}),
    draft: {
      draft_id: input.draft.draft_id,
      source_path: toRelative(input.cwd, input.draftPath),
      draft_hash: draftHash,
      material_hash: input.draft.integrity.material_hash
    },
    checklist: {
      ...(input.draft.schema_version === "1.1.0" ? { checklist_id: checklistId(input.checklist) } : {}),
      source_path: toRelative(input.cwd, input.checklistPath),
      checklist_hash: checklistHash,
      resolved_item_count: input.reviewDecisionContext
        ? input.reviewDecisionContext.reviewDecision.checklist_decisions.filter((decision) => decision.decision === "resolved").length
        : input.checklist.items.length
    },
    ...(input.reviewDecisionContext
      ? {
          review_decision: {
            review_decision_id: input.reviewDecisionContext.reviewDecision.review_decision_id,
            source_path: toRelative(input.cwd, input.reviewDecisionContext.reviewDecisionPath),
            file_hash: input.reviewDecisionContext.reviewDecisionFileHash,
            material_hash: input.reviewDecisionContext.reviewDecision.integrity.material_hash,
            reviewer: input.reviewDecisionContext.reviewDecision.reviewer.display_name,
            reviewer_id: input.reviewDecisionContext.reviewDecision.reviewer.reviewer_id
          }
        }
      : {}),
    references: input.draft.references,
    confirmations: Object.fromEntries(requiredConfirmations.map((confirmation) => [confirmation, true])) as Record<string, true>,
    integrity: {
      draft_hash: draftHash,
      checklist_hash: checklistHash,
      ...(input.reviewDecisionContext ? { review_decision_hash: input.reviewDecisionContext.reviewDecisionFileHash } : {}),
      evidence_hash: input.draft.integrity.candidate_evidence_hash,
      approval_material_hash: ""
    }
  };
  return {
    ...approvalBase,
    integrity: {
      ...approvalBase.integrity,
      approval_material_hash: hashJson({ ...approvalBase, approved_at: "stable", integrity: { ...approvalBase.integrity, approval_material_hash: "stable" } })
    }
  };
}

function validateDraft(draft: ResumeDraft, hasReviewDecision: boolean): void {
  if (draft.schema_version !== schemaVersion || draft.artifact_type !== "evidence-backed-resume-draft") {
    if (draft.schema_version !== "1.1.0" || draft.artifact_type !== "evidence-backed-resume-draft") {
      throw new CareerOsExportError("invalid-draft", "Input must be a COS evidence-backed resume draft.");
    }
  }
  if (draft.lifecycle_state !== "human_review_required" || draft.readiness_state !== "human_review_required") {
    throw new CareerOsExportError("blocked-draft", "Draft still requires review and cannot be approved automatically.");
  }
  if (!draft.candidate_identity.candidate_name_reference.statement.trim()) {
    throw new CareerOsExportError("invalid-draft", "Draft must include an approved candidate display name.");
  }
  if (draft.evidence_gaps.length || draft.excluded_unsupported_claims.length) {
    throw new CareerOsExportError("unresolved-evidence-gap", "Evidence gaps or unsupported claims must be resolved before export approval.");
  }
  if (draft.schema_version === "1.1.0") {
    if (!hasReviewDecision) throw new CareerOsExportError("missing-review-decision", "Draft 1.1.0 requires a review-decision overlay for approval.");
    validateApplicationFitGaps(draft);
  } else if (hasReviewDecision) {
    throw new CareerOsExportError("invalid-review-decision", "Draft 1.0.0 cannot gain application-fit semantics through a review decision.");
  }
}

function validateChecklist(draft: ResumeDraft, checklist: ReviewChecklist, reviewDecision: ResumeReviewDecisionArtifact | null): void {
  if (checklist.schema_version !== schemaVersion || checklist.draft_id !== draft.draft_id) {
    if (checklist.schema_version !== "1.1.0" || checklist.draft_id !== draft.draft_id) {
      throw new CareerOsExportError("invalid-checklist", "Review checklist does not match draft.");
    }
  }
  if (draft.schema_version === "1.1.0") {
    if (!reviewDecision) throw new CareerOsExportError("missing-review-decision", "Review decision is required for Draft 1.1.0 checklist resolution.");
    if (reviewDecision.lifecycle_state !== "reviewed_not_approved") throw new CareerOsExportError("review-not-approvable", "Only reviewed_not_approved review decisions can be approved for export.");
    if (reviewDecision.approval_granted !== false) throw new CareerOsExportError("invalid-review-decision", "Review decision must not grant approval.");
    if (checklist.items.some((item) => !reviewDecision.checklist_decisions.some((decision) => decision.check_id === item.check_id && decision.decision === "resolved"))) {
      throw new CareerOsExportError("incomplete-checklist", "Every generated checklist item must have a resolved review-decision overlay.");
    }
    return;
  }
  if (!checklist.items.length || checklist.items.some((item) => item.status !== "resolved")) {
    throw new CareerOsExportError("incomplete-checklist", "Every review checklist item must be resolved before approval.");
  }
}

function validateConfirmations(flags: Record<string, string | boolean>): void {
  const missing = requiredConfirmations.filter((confirmation) => flags[`confirm-${confirmation}`] !== true);
  if (missing.length) throw new CareerOsExportError("missing-confirmation", `Missing explicit approval confirmations: ${missing.join(", ")}`);
}

function validateLegacyReviewer(reviewer: string, draft: ResumeDraft): void {
  if (normalizeName(reviewer) === normalizeName(draft.candidate_identity.candidate_name_reference.statement)) {
    throw new CareerOsExportError("self-approval", "Resume export approval must come from a reviewer other than the candidate.");
  }
}

function approverForDraft(draft: ResumeDraft, displayName: string, approverId: string): { approver_id: string; display_name: string } {
  if (draft.schema_version === "1.1.0") {
    if (!approverId) throw new CareerOsExportError("missing-approver-id", "Draft 1.1.0 approval requires --approver-id.");
    return { approver_id: approverId, display_name: displayName.trim() };
  }
  validateLegacyReviewer(displayName, draft);
  return { approver_id: normalizeName(displayName), display_name: displayName.trim() };
}

function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function validateLinkedHashes(cwd: string, registryRoot: string, draft: ResumeDraft): void {
  const strategy = path.resolve(cwd, draft.source_provenance.strategy_path);
  const candidateEvidence = path.resolve(cwd, draft.source_provenance.candidate_evidence_path);
  const application = path.join(registryRoot, "applications", `${draft.references.application_id}.json`);
  const opportunity = path.join(registryRoot, "opportunities", `${draft.references.opportunity_id}.json`);
  const jd = path.join(registryRoot, "jd-snapshots", `${draft.references.jd_snapshot_id}.json`);
  assertInside(strategy, registryRoot, "Resume strategy");
  assertInside(candidateEvidence, registryRoot, "Candidate evidence");
  assertInside(application, registryRoot, "Application record");
  assertInside(opportunity, registryRoot, "Opportunity record");
  assertInside(jd, registryRoot, "JD snapshot");
  if (fileHash(strategy) !== draft.integrity.strategy_hash) {
    throw new CareerOsExportError("stale-draft", "Strategy hash changed after draft generation.");
  }
  if (fileHash(candidateEvidence) !== draft.integrity.candidate_evidence_hash) {
    throw new CareerOsExportError("stale-draft", "Candidate evidence hash changed after draft generation.");
  }
  const applicationRecord = readJson<Record<string, unknown>>(application);
  const opportunityRecord = readJson<Record<string, unknown>>(opportunity);
  const jdRecord = readJson<Record<string, unknown>>(jd);
  assertRecordId(applicationRecord.application_id, draft.references.application_id, "Application");
  assertRecordId(opportunityRecord.opportunity_id, draft.references.opportunity_id, "Opportunity");
  assertRecordId(jdRecord.jd_snapshot_id, draft.references.jd_snapshot_id, "JD snapshot");
}

function loadReviewDecisionForApproval(input: {
  cwd: string;
  registryRoot: string;
  flags: Record<string, string | boolean>;
  draft: ResumeDraft;
  draftPath: string;
  checklist: ReviewChecklist;
  checklistPath: string;
}): { reviewDecision: ResumeReviewDecisionArtifact; reviewDecisionPath: string; reviewDecisionFileHash: string } | null {
  if (!input.flags["review-decision"]) return null;
  if (input.draft.schema_version === "1.0.0") {
    throw new CareerOsExportError("invalid-review-decision", "Draft 1.0.0 cannot gain application-fit semantics through a review decision.");
  }
  const reviewDecisionPath = resolveExistingJsonPath(input.cwd, String(input.flags["review-decision"]));
  assertInside(reviewDecisionPath, input.registryRoot, "Resume review decision");
  const { reviewDecision, fileHash: reviewDecisionFileHash } = readAndValidateResumeReviewDecision({
    file: reviewDecisionPath,
    cwd: input.cwd,
    registryRoot: input.registryRoot,
    draft: input.draft,
    draftPath: input.draftPath,
    checklist: input.checklist,
    checklistPath: input.checklistPath
  });
  return { reviewDecision, reviewDecisionPath, reviewDecisionFileHash };
}

export function validateResumeApprovalCompatibility(input: {
  draft: ResumeDraft;
  checklist: ReviewChecklist;
  reviewDecision: ResumeReviewDecisionArtifact | null;
  approver: { approver_id: string; display_name: string };
  candidateEvidence?: TrustedEvidenceSource | null;
}): void {
  const { draft, checklist, reviewDecision, approver, candidateEvidence } = input;
  if (draft.evidence_gaps.length || draft.excluded_unsupported_claims.length) throw new CareerOsExportError("unsupported-content", "Approved export cannot include unresolved evidence gaps.");
  if (draft.schema_version !== "1.1.0") {
    validateLegacyReviewer(approver.display_name, draft);
    return;
  }
  if (!reviewDecision) throw new CareerOsExportError("missing-review-decision", "Draft 1.1.0 requires a review-decision overlay for approval.");
  if (!candidateEvidence) throw new CareerOsExportError("untrusted-candidate-evidence", "Draft 1.1.0 approval requires current candidate evidence.");
  if (reviewDecision.lifecycle_state !== "reviewed_not_approved") throw new CareerOsExportError("review-not-approvable", "Only reviewed_not_approved review decisions can be approved for export.");
  if (reviewDecision.approval_granted !== false) throw new CareerOsExportError("invalid-review-decision", "Review decision must not grant approval.");
  validateStableApprover(approver, draft, reviewDecision);
  validateChecklistCoverage(checklist, reviewDecision);
  validateStatementCoverage(draft, reviewDecision);
  validateAllConstructedStatements(draft, candidateEvidence);
  validateReviewDecisionCompatibility(draft, reviewDecision, candidateEvidence);
}

function validateStableApprover(approver: { approver_id: string; display_name: string }, draft: ResumeDraft, reviewDecision: ResumeReviewDecisionArtifact): void {
  const approverId = normalizeIdentity(approver.approver_id);
  const candidateId = normalizeIdentity(draft.candidate_identity.evidence_source_id);
  if (!approverId) throw new CareerOsExportError("missing-approver-id", "Draft 1.1.0 approval requires a stable approver ID.");
  if (approverId === candidateId || normalizeName(approver.display_name) === normalizeName(draft.candidate_identity.candidate_name_reference.statement)) {
    throw new CareerOsExportError("self-approval", "Resume export approval must come from a stable identity other than the candidate.");
  }
  if (approverId === normalizeIdentity(reviewDecision.reviewer.reviewer_id)) {
    throw new CareerOsExportError("reviewer-approver-overlap", "Resume export approver must differ from the review-decision reviewer.");
  }
}

function validateChecklistCoverage(checklist: ReviewChecklist, reviewDecision: ResumeReviewDecisionArtifact): void {
  for (const item of checklist.items) {
    const decision = reviewDecision.checklist_decisions.find((entry) => entry.check_id === item.check_id);
    if (!decision || decision.decision !== "resolved") throw new CareerOsExportError("incomplete-checklist", "Every generated checklist item must have a resolved review-decision overlay.");
    if (item.required_resolution_reason_classes?.length && !item.required_resolution_reason_classes.includes(decision.resolution_reason)) {
      throw new CareerOsExportError("invalid-review-decision", `Invalid resolution reason for checklist item ${item.check_id}.`);
    }
  }
}

function validateStatementCoverage(draft: ResumeDraft, reviewDecision: ResumeReviewDecisionArtifact): void {
  const allStatementIds = statementIdsFromDraft(draft);
  assertNoDuplicates(allStatementIds, "draft statement");
  const statementIds = new Set(allStatementIds);
  assertNoDuplicates(reviewDecision.statement_decisions.map((entry) => entry.statement_id), "statement decision");
  for (const statementId of statementIds) {
    const decision = reviewDecision.statement_decisions.find((entry) => entry.statement_id === statementId);
    if (!decision) throw new CareerOsExportError("invalid-review-decision", `Missing statement decision for ${statementId}.`);
    if (decision.decision !== "retain") throw new CareerOsExportError("review-not-approvable", `Statement ${statementId} is not retained for approval.`);
  }
  for (const decision of reviewDecision.statement_decisions) {
    if (!statementIds.has(decision.statement_id)) throw new CareerOsExportError("invalid-review-decision", `Unknown statement decision ID: ${decision.statement_id}.`);
  }
}

function validateReviewDecisionCompatibility(draft: ResumeDraft, reviewDecision: ResumeReviewDecisionArtifact, candidateEvidence: TrustedEvidenceSource): void {
  const statements = statementsFromDraft(draft);
  assertNoDuplicates(reviewDecision.gap_decisions.map((item) => item.gap_id), "gap decision");
  for (const gap of draft.application_fit_gaps ?? []) {
    const decision = reviewDecision.gap_decisions.find((item) => item.gap_id === gap.gap_id);
    if (!decision) throw new CareerOsExportError("invalid-review-decision", `Missing review decision for application-fit gap ${gap.gap_id}.`);
    if (gap.gap_class === "acknowledged-application-fit-gap") {
      if (decision.decision !== "acknowledge-and-exclude" || decision.resolution_reason !== "acknowledged-gap-claim-excluded") {
        throw new CareerOsExportError("invalid-review-decision", `Application-fit gap ${gap.gap_id} is not approvable.`);
      }
      if (gap.excluded_from_positive_claims !== true || gap.included_statement_ids.length || decision.reviewed_statement_ids.length) {
        throw new CareerOsExportError("unsupported-content", `Acknowledged application-fit gap ${gap.gap_id} must not approve positive statements.`);
      }
      if (statements.some((statement) => statement.construction?.related_application_fit_gap_ids.includes(gap.gap_id))) {
        throw new CareerOsExportError("unsupported-content", `Acknowledged application-fit gap ${gap.gap_id} is linked to a positive statement.`);
      }
    }
    if (gap.gap_class === "bounded-claim-control") {
      if (decision.decision !== "accept-bounded-representation" || decision.resolution_reason !== "bounded-claim-verified") {
        throw new CareerOsExportError("invalid-review-decision", `Bounded application-fit gap ${gap.gap_id} is not approvable.`);
      }
      if (!gap.claim_boundary.trim()) throw new CareerOsExportError("invalid-draft", `Bounded application-fit gap ${gap.gap_id} must include a claim boundary.`);
      assertExactNonEmptySet(gap.included_statement_ids, decision.reviewed_statement_ids, `bounded statements for ${gap.gap_id}`);
      for (const statementId of gap.included_statement_ids) {
        const statement = statements.find((item) => item.statement_id === statementId);
        if (!statement) throw new CareerOsExportError("unsupported-content", `Bounded statement ${statementId} is missing from draft.`);
        validateEvidenceTemplateStatement(statement, candidateEvidence, gap.gap_id, "bounded-claim-control");
      }
    }
  }
}

function validateEvidenceTemplateStatement(statement: NonNullable<ReturnType<typeof statementsFromDraft>[number]>, candidateEvidence: TrustedEvidenceSource, gapId?: string, boundaryClass?: RevisionBoundaryClass): void {
  try {
    validateDraftStatementConstruction({ statement, evidenceItems: candidateEvidence.evidence_items, requiredGapId: gapId, requiredBoundaryClass: boundaryClass });
  } catch (error) {
    throw new CareerOsExportError("unsupported-content", error instanceof Error ? error.message : String(error));
  }
}

function validateApplicationFitGaps(draft: ResumeDraft): void {
  const seen = new Set<string>();
  const draftStatementIds = statementIdsFromDraft(draft);
  assertNoDuplicates(draftStatementIds, "draft statement");
  const statementIds = new Set(draftStatementIds);
  for (const gap of draft.application_fit_gaps ?? []) {
    if (!gap.gap_id || seen.has(gap.gap_id)) throw new CareerOsExportError("invalid-draft", "Application-fit gaps must have unique IDs.");
    seen.add(gap.gap_id);
    if (!["acknowledged-application-fit-gap", "bounded-claim-control"].includes(gap.gap_class)) {
      throw new CareerOsExportError("invalid-draft", "Blocking classes are not allowed in application_fit_gaps.");
    }
    if (!["pending-human-review", "generated-exclusion", "generated-bounded-control"].includes(gap.generated_disposition)) {
      throw new CareerOsExportError("invalid-draft", "Unknown generated application-fit disposition.");
    }
    if (gap.gap_class === "bounded-claim-control" && gap.generated_disposition !== "generated-bounded-control") {
      throw new CareerOsExportError("invalid-draft", "Bounded controls require generated-bounded-control disposition.");
    }
    if (!gap.claim_boundary.trim()) throw new CareerOsExportError("invalid-draft", "Application-fit gap must include a concrete claim boundary.");
    for (const statementId of gap.included_statement_ids) {
      if (!statementIds.has(statementId)) throw new CareerOsExportError("invalid-draft", `Unknown application-fit statement ID: ${statementId}.`);
    }
  }
}

function validateAllConstructedStatements(draft: ResumeDraft, candidateEvidence: TrustedEvidenceSource): void {
  for (const statement of statementsFromDraft(draft)) {
    if (statement.construction?.construction_mode === "evidence-template") validateEvidenceTemplateStatement(statement, candidateEvidence);
  }
}

function loadCandidateEvidenceForDraft(input: { cwd: string; registryRoot: string; draft: ResumeDraft; explicitPath: string | boolean | undefined }): { evidence: TrustedEvidenceSource; evidencePath: string; evidenceHash: string } {
  if (typeof input.explicitPath !== "string") throw new CareerOsExportError("untrusted-candidate-evidence", "Draft 1.1.0 approval requires --candidate-evidence.");
  const evidencePath = resolveExistingJsonPath(input.cwd, input.explicitPath);
  assertPrivatePath(evidencePath, input.cwd, "Candidate evidence source");
  assertInside(evidencePath, input.registryRoot, "Candidate evidence source");
  const evidence = readJson<TrustedEvidenceSource>(evidencePath);
  const evidenceHash = fileHash(evidencePath);
  if (evidenceHash !== input.draft.integrity.candidate_evidence_hash) throw new CareerOsExportError("stale-draft", "Candidate evidence hash changed after draft generation.");
  if (evidence.evidence_source_id !== input.draft.candidate_identity.evidence_source_id) throw new CareerOsExportError("integrity-mismatch", "Candidate evidence source ID does not match draft.");
  validateTrustedCandidateEvidence(evidence);
  return { evidence, evidencePath, evidenceHash };
}

function validateTrustedCandidateEvidence(evidence: TrustedEvidenceSource): void {
  if (evidence.schema_version !== "1.0.0" || evidence.source_type !== "trusted-candidate-profile" || evidence.trust?.verified !== true) {
    throw new CareerOsExportError("untrusted-candidate-evidence", "Candidate evidence source must be explicitly trusted and verified.");
  }
  if (Number.isNaN(Date.parse(evidence.trust.verified_at)) || !evidence.trust.verified_by.trim() || !evidence.trust.basis.trim()) {
    throw new CareerOsExportError("untrusted-candidate-evidence", "Candidate evidence trust metadata is incomplete.");
  }
  if (!Array.isArray(evidence.evidence_items) || evidence.evidence_items.length === 0) throw new CareerOsExportError("untrusted-candidate-evidence", "Candidate evidence must include evidence items.");
}

function assertExactNonEmptySet(left: string[], right: string[], label: string): void {
  assertNoDuplicates(left, label);
  assertNoDuplicates(right, label);
  if (!left.length || !right.length) throw new CareerOsExportError("unsupported-content", `${label} must be non-empty.`);
  const sortedLeft = [...left].sort();
  const sortedRight = [...right].sort();
  if (JSON.stringify(sortedLeft) !== JSON.stringify(sortedRight)) throw new CareerOsExportError("unsupported-content", `${label} must match exactly.`);
}

function assertNoDuplicates(values: string[], label: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (!value || seen.has(value)) throw new CareerOsExportError("invalid-draft", `Duplicate or missing ${label} ID: ${value}.`);
    seen.add(value);
  }
}

function statementIdsFromDraft(draft: ResumeDraft): string[] {
  return statementsFromDraft(draft).map((item) => item.statement_id).filter((value): value is string => typeof value === "string");
}

function statementsFromDraft(draft: ResumeDraft): Array<ResumeDraft["professional_summary"][number] | NonNullable<ResumeDraft["professional_headline"]>> {
  return [
    draft.professional_headline,
    ...draft.professional_summary,
    ...draft.core_skills,
    ...draft.role_specific_experience_bullets,
    ...draft.selected_achievements,
    ...draft.education,
    ...draft.certifications,
    ...draft.projects_or_portfolio_evidence
  ]
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .filter((item) => typeof item.statement_id === "string");
}

function assertRecordId(actual: unknown, expected: string, label: string): void {
  if (actual !== expected) {
    throw new CareerOsExportError("integrity-mismatch", `${label} record does not match the draft reference.`);
  }
}

function resolveChecklistPath(cwd: string, registryRoot: string, draftPath: string, explicit: string | boolean | undefined): string {
  const checklistPath = explicit ? resolveExistingJsonPath(cwd, String(explicit)) : path.join(path.dirname(draftPath), "review-checklist.json");
  if (!existsSync(checklistPath)) throw new CareerOsExportError("missing-record", "Review checklist is required.");
  assertInside(checklistPath, registryRoot, "Review checklist");
  return checklistPath;
}

function createResult(mode: "dry-run" | "apply", outputDir: string, output: string, approval: ResumeApproval): ApprovalResult {
  return {
    schema_version: schemaVersion,
    mode,
    status: "planned",
    dry_run: mode === "dry-run",
    output_dir: outputDir,
    output,
    summary: {
      approval_id: approval.approval_id,
      draft_id: approval.draft.draft_id,
      reviewer: approval.reviewer,
      lifecycle_state: "approved_for_export",
      approval_scope: "document_export_only_not_application_submission"
    },
    approval
  };
}

function stringFlag(value: string | boolean | undefined, message: string): string {
  if (typeof value === "string") return value;
  if (message) throw new CareerOsExportError("invalid-input", message);
  return "";
}

function printSummary(result: ApprovalResult): void {
  console.log(result.dry_run ? "DRY RUN - no approval written" : result.status === "duplicate" ? "DUPLICATE - existing approval preserved" : "APPROVAL COMPLETE");
  console.log(`Approval ID: ${result.summary.approval_id}`);
  console.log(`Draft ID: ${result.summary.draft_id}`);
  console.log(`Lifecycle: ${result.summary.lifecycle_state}`);
  console.log(`Scope: ${result.summary.approval_scope}`);
  console.log(`Output: ${result.output}`);
}

function main(): void {
  try {
    const result = runCareerOsResumeApprove();
    if (process.argv.includes("--format") && process.argv[process.argv.indexOf("--format") + 1] === "json") console.log(JSON.stringify(result, null, 2));
    else printSummary(result);
  } catch (error) {
    console.error(error instanceof CareerOsExportError ? `${error.code}: ${error.message}` : error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
