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

export function runCareerOsResumeApprove(options: RunOptions = {}): ApprovalResult {
  const cwd = options.cwd ?? process.cwd();
  const flags = parseArgs(options.argv ?? process.argv.slice(2));
  const mode = resolveMode(flags);
  const reviewer = stringFlag(flags.reviewer, "--reviewer is required.");
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
  validateDraft(draft);
  validateReviewer(reviewer, draft);
  validateChecklist(draft, checklist);
  validateConfirmations(flags);
  validateLinkedHashes(cwd, registryRoot, draft);

  const approval = buildApproval({ cwd, now, reviewer: reviewer.trim(), draft, draftPath, checklist, checklistPath });
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
  draft: ResumeDraft;
  draftPath: string;
  checklist: ReviewChecklist;
  checklistPath: string;
}): ResumeApproval {
  const draftHash = fileHash(input.draftPath);
  const checklistHash = fileHash(input.checklistPath);
  const approvalBase = {
    schema_version: schemaVersion,
    approval_id: `RAPPROVAL-${input.draft.draft_id}-${shortHash(`${input.draft.integrity.material_hash}:${input.reviewer}`)}`,
    artifact_type: "human-approved-resume-export-approval" as const,
    lifecycle_state: "approved_for_export" as const,
    approval_scope: "document_export_only_not_application_submission" as const,
    approved_at: input.now,
    reviewer: input.reviewer,
    draft: {
      draft_id: input.draft.draft_id,
      source_path: toRelative(input.cwd, input.draftPath),
      draft_hash: draftHash,
      material_hash: input.draft.integrity.material_hash
    },
    checklist: {
      source_path: toRelative(input.cwd, input.checklistPath),
      checklist_hash: checklistHash,
      resolved_item_count: input.checklist.items.length
    },
    references: input.draft.references,
    confirmations: Object.fromEntries(requiredConfirmations.map((confirmation) => [confirmation, true])) as Record<string, true>,
    integrity: {
      draft_hash: draftHash,
      checklist_hash: checklistHash,
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

function validateDraft(draft: ResumeDraft): void {
  if (draft.schema_version !== schemaVersion || draft.artifact_type !== "evidence-backed-resume-draft") {
    throw new CareerOsExportError("invalid-draft", "Input must be a COS-4 evidence-backed resume draft.");
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
}

function validateChecklist(draft: ResumeDraft, checklist: ReviewChecklist): void {
  if (checklist.schema_version !== schemaVersion || checklist.draft_id !== draft.draft_id) {
    throw new CareerOsExportError("invalid-checklist", "Review checklist does not match draft.");
  }
  if (!checklist.items.length || checklist.items.some((item) => item.status !== "resolved")) {
    throw new CareerOsExportError("incomplete-checklist", "Every review checklist item must be resolved before approval.");
  }
}

function validateConfirmations(flags: Record<string, string | boolean>): void {
  const missing = requiredConfirmations.filter((confirmation) => flags[`confirm-${confirmation}`] !== true);
  if (missing.length) throw new CareerOsExportError("missing-confirmation", `Missing explicit approval confirmations: ${missing.join(", ")}`);
}

function validateReviewer(reviewer: string, draft: ResumeDraft): void {
  if (normalizeName(reviewer) === normalizeName(draft.candidate_identity.candidate_name_reference.statement)) {
    throw new CareerOsExportError("self-approval", "Resume export approval must come from a reviewer other than the candidate.");
  }
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
