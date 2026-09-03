import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  atomicWriteFiles,
  assertInside,
  assertPrivatePath,
  CareerOsExportError,
  countPdfPages,
  existingFiles,
  extractDocxText,
  extractPdfText,
  fileHash,
  hashJson,
  normalizeText,
  parseArgs,
  readJson,
  renderDocx,
  renderPdf,
  resolveExistingJsonPath,
  resolveMode,
  resumeLines,
  safeSlug,
  schemaVersion,
  shortHash,
  toRelative,
  validateOfficeOpenXml
} from "./resume-export-shared.ts";
import type { ResumeApproval, ResumeDraft } from "./resume-export-shared.ts";
import { validateResumeApprovalCompatibility } from "./resume-approve.ts";
import type { TrustedEvidenceItem } from "./resume-construction-proof.ts";
import { readAndValidateResumeReviewDecision } from "./resume-review-decision.ts";
import type { GapRegisterReferenceLike } from "./resume-construction-proof.ts";
import { readAndValidateApplicationGapRegister, type ApplicationLevelGap } from "./application-gap-register.ts";
import type { StrategySupportReferenceStrategy } from "./resume-strategy-support-reference.ts";

type ExportState = "export_pending" | "export_generated" | "export_validation_failed" | "export_validated";

type ExportManifest = {
  schema_version: "1.0.0";
  export_id: string;
  artifact_type: "validated-resume-document-export";
  lifecycle_state: ExportState;
  created_at: string;
  references: ResumeDraft["references"] & { draft_id: string; approval_id: string };
  source_hashes: { draft_hash: string; approval_hash: string; candidate_evidence_hash: string };
  outputs: {
    docx_path: string;
    pdf_path: string;
    docx_size_bytes: number;
    pdf_size_bytes: number;
    docx_sha256: string;
    pdf_sha256: string;
  };
  validation: { status: "pass" | "fail"; failures: string[]; warnings: string[]; page_count: number };
  renderer: { name: string; version: string; mode: string };
  integrity: { manifest_material_hash: string };
};

type ExportResult = {
  schema_version: "1.0.0";
  mode: "dry-run" | "apply";
  status: "planned" | "created" | "duplicate";
  dry_run: boolean;
  output_dir: string;
  outputs: { docx: string; pdf: string; manifest: string };
  summary: { export_id: string; lifecycle_state: ExportState; validation_status: "pass" | "fail" };
  manifest?: ExportManifest;
};

type RunOptions = {
  argv?: string[];
  cwd?: string;
  now?: string;
  simulateWriteFailure?: boolean;
};

type TrustedEvidenceSource = {
  schema_version: "1.0.0";
  evidence_source_id: string;
  source_type: "trusted-candidate-profile";
  trust: { verified: true; verified_at: string; verified_by: string; basis: string };
  evidence_items: TrustedEvidenceItem[];
};

export function runCareerOsResumeExport(options: RunOptions = {}): ExportResult {
  const cwd = options.cwd ?? process.cwd();
  const flags = parseArgs(options.argv ?? process.argv.slice(2));
  const mode = resolveMode(flags);
  const now = typeof flags.now === "string" ? flags.now : options.now ?? new Date().toISOString();
  if (Number.isNaN(Date.parse(now))) throw new CareerOsExportError("invalid-input", `Invalid export timestamp: ${now}`);
  const approvalPath = resolveExistingJsonPath(cwd, stringFlag(flags.approval, "--approval is required."));
  const registryRoot = inferRegistryRootFromApproval(approvalPath);
  assertPrivatePath(registryRoot, cwd, "Export registry root");
  const approval = readJson<ResumeApproval>(approvalPath);
  validateApproval(approval);
  const draftPath = path.resolve(cwd, approval.draft.source_path);
  assertInside(draftPath, registryRoot, "Approved draft");
  const draft = readJson<ResumeDraft>(draftPath);
  validateDraftAgainstApproval({ cwd, registryRoot, draft, approval, draftPath, candidateEvidencePathFlag: flags["candidate-evidence"] });

  const lines = resumeLines(draft);
  const docx = renderDocx(lines);
  const pdf = renderPdf(lines);
  const exportId = `REXPORT-${draft.references.application_id}-${shortHash(`${approval.approval_id}:${approval.integrity.approval_material_hash}`)}`;
  const filename = safeSlug(`${draft.target.company}-${draft.target.role}-${exportId}`);
  const outputDir = path.join(registryRoot, "resume-exports", exportId);
  const outputs = {
    docx: path.join(outputDir, `${filename}.docx`),
    pdf: path.join(outputDir, `${filename}.pdf`),
    manifest: path.join(outputDir, "resume-export-manifest.json")
  };
  assertPrivatePath(outputDir, cwd, "Resume export output");

  const validation = validateExport({ draft, docx, pdf });
  const manifest = buildManifest({ cwd, now, exportId, approval, approvalPath, draft, outputs, docx, pdf, validation });
  const result = createResult(mode, outputDir, outputs, manifest);
  if (mode === "dry-run") return { ...result, status: "planned", dry_run: true, manifest: undefined };
  if (manifest.lifecycle_state !== "export_validated") throw new CareerOsExportError("export-validation-failed", validation.failures.join("; "));

  const manifestValue = `${JSON.stringify(manifest, null, 2)}\n`;
  const writes = [
    { file: outputs.docx, value: docx },
    { file: outputs.pdf, value: pdf },
    { file: outputs.manifest, value: manifestValue }
  ];
  const existing = existingFiles(writes.map((write) => write.file));
  if (existing.length) {
    if (existing.length === writes.length && existingManifestMatches(outputs.manifest, manifest.integrity.manifest_material_hash)) {
      return { ...result, status: "duplicate", dry_run: false };
    }
    throw new CareerOsExportError("export-conflict", `Existing export output conflicts with this approval: ${outputDir}`);
  }
  atomicWriteFiles(writes, options.simulateWriteFailure ? outputs.pdf : null);
  return { ...result, status: "created", dry_run: false };
}

function validateApproval(approval: ResumeApproval): void {
  if (!["1.0.0", "1.1.0"].includes(approval.schema_version) || approval.artifact_type !== "human-approved-resume-export-approval") {
    throw new CareerOsExportError("invalid-approval", "Input must be a COS-5 resume export approval.");
  }
  if (approval.lifecycle_state !== "approved_for_export") {
    throw new CareerOsExportError("approval-not-exportable", "Only approved_for_export approvals may be exported.");
  }
  if (approval.approval_scope !== "document_export_only_not_application_submission") {
    throw new CareerOsExportError("invalid-approval", "Approval scope must authorize document export only.");
  }
}

function validateDraftAgainstApproval(input: { cwd: string; registryRoot: string; draft: ResumeDraft; approval: ResumeApproval; draftPath: string; candidateEvidencePathFlag: string | boolean | undefined }): void {
  const { cwd, registryRoot, draft, approval, draftPath } = input;
  if (draft.draft_id !== approval.draft.draft_id) throw new CareerOsExportError("integrity-mismatch", "Draft ID does not match approval.");
  if (existsSync(draftPath) && fileHash(draftPath) !== approval.draft.draft_hash) throw new CareerOsExportError("stale-approval", "Draft file hash changed after approval.");
  if (draft.integrity.material_hash !== approval.draft.material_hash) throw new CareerOsExportError("stale-approval", "Draft material hash changed after approval.");
  if (hashJson({ ...approval, approved_at: "stable", integrity: { ...approval.integrity, approval_material_hash: "stable" } }) !== approval.integrity.approval_material_hash) {
    throw new CareerOsExportError("stale-approval", "Approval integrity hash is invalid.");
  }
  if (draft.evidence_gaps.length || draft.excluded_unsupported_claims.length) throw new CareerOsExportError("unsupported-content", "Approved export cannot include unresolved evidence gaps.");
  if (draft.schema_version === "1.1.0") {
    if (!approval.review_decision) throw new CareerOsExportError("missing-review-decision", "Draft 1.1.0 export requires review-decision linkage.");
    const candidateEvidence = loadCandidateEvidenceForExport({ cwd, registryRoot, draft, approval, explicitPath: input.candidateEvidencePathFlag });
    const checklistPath = path.resolve(cwd, approval.checklist.source_path);
    const reviewDecisionPath = path.resolve(cwd, approval.review_decision.source_path);
    assertInside(checklistPath, registryRoot, "Approved checklist");
    assertInside(reviewDecisionPath, registryRoot, "Approved review decision");
    const checklist = readJson<import("./resume-export-shared.ts").ReviewChecklist>(checklistPath);
    const { reviewDecision, fileHash: reviewDecisionFileHash } = readAndValidateResumeReviewDecision({
      file: reviewDecisionPath,
      cwd,
      registryRoot,
      draft,
      draftPath,
      checklist,
      checklistPath
    });
    if (fileHash(checklistPath) !== approval.checklist.checklist_hash) throw new CareerOsExportError("stale-approval", "Checklist file hash changed after approval.");
    if (reviewDecisionFileHash !== approval.review_decision.file_hash || reviewDecisionFileHash !== approval.integrity.review_decision_hash) {
      throw new CareerOsExportError("stale-approval", "Review decision file hash changed after approval.");
    }
    if (reviewDecision.integrity.material_hash !== approval.review_decision.material_hash) {
      throw new CareerOsExportError("stale-approval", "Review decision material hash changed after approval.");
    }
    if (reviewDecision.lifecycle_state !== "reviewed_not_approved" || reviewDecision.approval_granted !== false) {
      throw new CareerOsExportError("approval-not-exportable", "Review decision is not satisfactory for export.");
    }
    if (!approval.approver) throw new CareerOsExportError("missing-approver-id", "Draft 1.1.0 export requires stable approver identity.");
    validateResumeApprovalCompatibility({
      draft,
      checklist,
      reviewDecision,
      approver: approval.approver,
      candidateEvidence,
      gapRegisterContext: loadGapRegisterContext({ cwd, registryRoot, draft, candidateEvidence }),
      strategy: loadStrategyForDraft({ cwd, registryRoot, draft })
    });
  } else if (approval.review_decision) {
    throw new CareerOsExportError("invalid-approval", "Draft 1.0.0 export approval must not include review-decision compatibility linkage.");
  }
}

function loadStrategyForDraft(input: { cwd: string; registryRoot: string; draft: ResumeDraft }): StrategySupportReferenceStrategy {
  const strategyPath = path.resolve(input.cwd, input.draft.source_provenance.strategy_path);
  assertInside(strategyPath, input.registryRoot, "Resume strategy");
  if (fileHash(strategyPath) !== input.draft.integrity.strategy_hash) {
    throw new CareerOsExportError("stale-draft", "Strategy hash changed after draft generation.");
  }
  return readJson<StrategySupportReferenceStrategy>(strategyPath);
}

function loadGapRegisterContext(input: { cwd: string; registryRoot: string; draft: ResumeDraft; candidateEvidence: TrustedEvidenceSource }): { reference: GapRegisterReferenceLike; currentRegisterGaps: ApplicationLevelGap[] } | null {
  if (!input.draft.application_fit_gaps?.length) return null;
  const sourcePath = input.draft.source_provenance.application_gap_register_path;
  if (!sourcePath) return null;
  const registerPath = path.resolve(input.cwd, sourcePath);
  assertInside(registerPath, input.registryRoot, "Application gap register");
  const strategyPath = path.resolve(input.cwd, input.draft.source_provenance.strategy_path);
  assertInside(strategyPath, input.registryRoot, "Resume strategy");
  const strategy = readJson<{ decision_state?: { decision_reconciliation_id?: string | null } }>(strategyPath);
  const opportunityPath = path.join(input.registryRoot, "opportunities", `${input.draft.references.opportunity_id}.json`);
  assertInside(opportunityPath, input.registryRoot, "Opportunity record");
  const opportunity = readJson<{ decision_id?: string }>(opportunityPath);
  const result = readAndValidateApplicationGapRegister({
    file: registerPath,
    cwd: input.cwd,
    registryRoot: input.registryRoot,
    expected: {
      application_id: input.draft.references.application_id,
      jd_snapshot_id: input.draft.references.jd_snapshot_id,
      opportunity_id: input.draft.references.opportunity_id,
      handoff_id: input.draft.references.handoff_id,
      decision_id: String(opportunity.decision_id ?? ""),
      decision_reconciliation_id: strategy.decision_state?.decision_reconciliation_id ?? null,
      candidate_evidence_id: input.draft.candidate_identity.evidence_source_id,
      candidate_evidence_hash: input.draft.integrity.candidate_evidence_hash,
      candidate_evidence_ids: input.candidateEvidence.evidence_items.map((item) => item.evidence_id)
    }
  });
  if (result.register.gap_register_id !== input.draft.references.application_gap_register_id) throw new CareerOsExportError("integrity-mismatch", "Application gap register ID does not match draft.");
  return {
    reference: {
      gap_register_id: result.register.gap_register_id,
      file_hash: result.fileHash,
      material_hash: result.register.integrity.material_hash
    },
    currentRegisterGaps: result.register.gaps
  };
}

function loadCandidateEvidenceForExport(input: { cwd: string; registryRoot: string; draft: ResumeDraft; approval: ResumeApproval; explicitPath: string | boolean | undefined }): TrustedEvidenceSource {
  if (typeof input.explicitPath !== "string") throw new CareerOsExportError("untrusted-candidate-evidence", "Draft 1.1.0 export requires --candidate-evidence.");
  const evidencePath = resolveExistingJsonPath(input.cwd, input.explicitPath);
  assertPrivatePath(evidencePath, input.cwd, "Candidate evidence source");
  assertInside(evidencePath, input.registryRoot, "Candidate evidence source");
  const evidence = readJson<TrustedEvidenceSource>(evidencePath);
  const evidenceHash = fileHash(evidencePath);
  if (evidenceHash !== input.draft.integrity.candidate_evidence_hash || evidenceHash !== input.approval.integrity.evidence_hash) {
    throw new CareerOsExportError("stale-approval", "Candidate evidence hash changed after approval.");
  }
  if (evidence.evidence_source_id !== input.draft.candidate_identity.evidence_source_id) {
    throw new CareerOsExportError("integrity-mismatch", "Candidate evidence source ID does not match draft.");
  }
  validateTrustedCandidateEvidence(evidence);
  return evidence;
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

function validateExport(input: { draft: ResumeDraft; docx: Buffer; pdf: Buffer }): ExportManifest["validation"] {
  const failures: string[] = [];
  const warnings: string[] = [];
  const docxText = extractDocxText(input.docx);
  const pdfText = extractPdfText(input.pdf);
  const expected = resumeLines(input.draft).map((line) => line.text).filter(Boolean);
  if (!validateOfficeOpenXml(input.docx)) failures.push("DOCX is not a valid Office Open XML archive.");
  if (!input.pdf.subarray(0, 5).equals(Buffer.from("%PDF-"))) failures.push("PDF signature is invalid.");
  if (!input.docx.length || !input.pdf.length) failures.push("DOCX/PDF output is empty.");
  for (const value of expected) {
    if (!normalizeText(docxText).includes(normalizeText(value))) failures.push(`DOCX missing approved content: ${value}`);
    if (!normalizeText(pdfText).includes(normalizeText(value).slice(0, Math.min(24, normalizeText(value).length)))) failures.push(`PDF missing approved content: ${value}`);
  }
  const forbidden = ["DRAFT", "NOT FOR APPLICATION USE", "data/private", "integrity", "material_hash", "evidence_record_id", "password", "api_key", "secret"];
  forbidden.push("application_fit_gaps", "review_decision", "checklist", "revision_input", "application-fit gap");
  for (const marker of forbidden) {
    if (docxText.includes(marker) || pdfText.includes(marker)) failures.push(`Export leaked internal marker: ${marker}`);
  }
  const pageCount = countPdfPages(input.pdf);
  if (pageCount === 0) failures.push("PDF page tree is invalid.");
  if (pageCount > 2) failures.push("Page count exceeds approved two-page limit.");
  if (normalizeText(docxText).includes("unsupported")) failures.push("Unsupported claim text leaked into export.");
  if (!semanticEquivalent(docxText, pdfText, expected)) failures.push("DOCX/PDF semantic content is not equivalent.");
  return { status: failures.length ? "fail" : "pass", failures, warnings, page_count: pageCount };
}

function buildManifest(input: {
  cwd: string;
  now: string;
  exportId: string;
  approval: ResumeApproval;
  approvalPath: string;
  draft: ResumeDraft;
  outputs: ExportResult["outputs"];
  docx: Buffer;
  pdf: Buffer;
  validation: ExportManifest["validation"];
}): ExportManifest {
  const manifestBase = {
    schema_version: schemaVersion,
    export_id: input.exportId,
    artifact_type: "validated-resume-document-export" as const,
    lifecycle_state: input.validation.status === "pass" ? "export_validated" as const : "export_validation_failed" as const,
    created_at: input.now,
    references: { ...input.draft.references, draft_id: input.draft.draft_id, approval_id: input.approval.approval_id },
    source_hashes: {
      draft_hash: input.approval.draft.draft_hash,
      approval_hash: fileHash(input.approvalPath),
      candidate_evidence_hash: input.approval.integrity.evidence_hash
    },
    outputs: {
      docx_path: toRelative(input.cwd, input.outputs.docx),
      pdf_path: toRelative(input.cwd, input.outputs.pdf),
      docx_size_bytes: input.docx.length,
      pdf_size_bytes: input.pdf.length,
      docx_sha256: sha256(input.docx),
      pdf_sha256: sha256(input.pdf)
    },
    validation: input.validation,
    renderer: { name: "career-os-deterministic-ooxml-pdf-renderer", version: "1.0.0", mode: "single-column-ats-readable" },
    integrity: { manifest_material_hash: "" }
  };
  return {
    ...manifestBase,
    integrity: {
      manifest_material_hash: hashJson({ ...manifestBase, created_at: "stable", integrity: { manifest_material_hash: "stable" } })
    }
  };
}

function createResult(mode: "dry-run" | "apply", outputDir: string, outputs: ExportResult["outputs"], manifest: ExportManifest): ExportResult {
  return {
    schema_version: schemaVersion,
    mode,
    status: "planned",
    dry_run: mode === "dry-run",
    output_dir: outputDir,
    outputs,
    summary: { export_id: manifest.export_id, lifecycle_state: manifest.lifecycle_state, validation_status: manifest.validation.status },
    manifest
  };
}

function inferRegistryRootFromApproval(approvalPath: string): string {
  const artifactDir = path.dirname(approvalPath);
  if (path.basename(artifactDir) === "resume-approvals") {
    return path.dirname(artifactDir);
  }
  const collectionDir = path.dirname(artifactDir);
  if (path.basename(collectionDir) === "resume-approvals") {
    return path.dirname(collectionDir);
  }
  throw new CareerOsExportError("invalid-approval", "Approval artifact must live under a resume-approvals directory.");
}

function existingManifestMatches(manifestPath: string, materialHash: string): boolean {
  try {
    return readJson<ExportManifest>(manifestPath).integrity?.manifest_material_hash === materialHash;
  } catch {
    return false;
  }
}

function semanticEquivalent(docxText: string, pdfText: string, expected: string[]): boolean {
  const docx = normalizeText(docxText);
  const pdf = normalizeText(pdfText);
  return expected.every((value) => {
    const token = normalizeText(value).split(" ").filter((part) => part.length > 3 || /\d/u.test(part))[0];
    return !token || (docx.includes(token) && pdf.includes(token));
  });
}

function sha256(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

function stringFlag(value: string | boolean | undefined, message: string): string {
  if (typeof value === "string") return value;
  throw new CareerOsExportError("invalid-input", message);
}

function printSummary(result: ExportResult): void {
  console.log(result.dry_run ? "DRY RUN - no export written" : result.status === "duplicate" ? "DUPLICATE - existing export preserved" : "EXPORT COMPLETE");
  console.log(`Export ID: ${result.summary.export_id}`);
  console.log(`Lifecycle: ${result.summary.lifecycle_state}`);
  console.log(`Validation: ${result.summary.validation_status}`);
  console.log(`Output: ${result.output_dir}`);
}

function main(): void {
  try {
    const result = runCareerOsResumeExport();
    if (process.argv.includes("--format") && process.argv[process.argv.indexOf("--format") + 1] === "json") console.log(JSON.stringify(result, null, 2));
    else printSummary(result);
  } catch (error) {
    console.error(error instanceof CareerOsExportError ? `${error.code}: ${error.message}` : error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
