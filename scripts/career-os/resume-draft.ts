import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  unresolvedApplicationGaps,
  validateApplicationGapStrategyFields,
  type ApplicationGapRegisterReference,
  type ApplicationLevelGap
} from "./application-gap-register.ts";
import { hashResumeStrategyMaterial } from "./resume-strategy.ts";

type Mode = "dry-run" | "apply";
type ReviewState = "draft" | "human_review_required";
type ConfidenceCategory = "complete" | "partial" | "requires-human-review";
type EvidenceStatus = "verified" | "human-review-required";
type TransformationType = "verbatim" | "condensed" | "grouped" | "selected";

type CliFlags = {
  strategy?: string;
  "candidate-evidence"?: string;
  apply?: boolean;
  "dry-run"?: boolean;
  format?: string;
  now?: string;
};

type StrategyArtifact = {
  schema_version: "1.0.0";
  strategy_id: string;
  created_at: string;
  artifact_type: "human-review-only-resume-strategy";
  application: { application_id: string; current_stage: string; current_status: string };
  opportunity: { opportunity_id: string; job_model_id: string; hiring_model_id: string; evaluation_framework_id: string };
  jd: { jd_snapshot_id: string; content_hash: string };
  handoff: { resume_os_handoff_id: string; generated_at: string; source_path: string };
  target: { company: string; role: string };
  decision_state: { outcome: "proceed" | "pause" | "decline"; readiness_state: "human_review_required" | "blocked"; blocking_reasons: string[] };
  role_requirements: Array<{ requirement: string; priority: number; source: string }>;
  prioritized_signals: string[];
  evidence_to_requirement_mapping: Array<{ requirement: string; status: "evidence-backed" | "gap" | "human-review-required"; evidence_ids: string[]; notes: string }>;
  supported_positioning_themes: Array<{ theme: string; status: "evidence-backed" | "gap" | "human-review-required"; evidence_ids: string[] }>;
  evidence_gaps_and_unsupported_claims: Array<{ claim_or_requirement: string; status: "gap" | "unsupported"; handling: string }>;
  recommended_resume_sections_or_emphasis: Array<{ section: string; recommendation: string; status: string; evidence_ids: string[] }>;
  human_review_checklist: string[];
  candidate_evidence_source: { evidence_source_id: string; source_hash: string; verified_by: string; verified_at: string };
  application_level_gap_register?: ApplicationGapRegisterReference;
  application_level_gaps?: ApplicationLevelGap[];
  integrity: {
    handoff_hash: string;
    decision_hash: string;
    opportunity_hash: string;
    jd_snapshot_hash: string;
    application_hash: string;
    candidate_evidence_hash: string;
    application_gap_register_hash?: string;
    application_level_gaps_hash?: string;
    material_hash: string;
  };
  limitations: string[];
};

type TrustedEvidenceSource = {
  schema_version: "1.0.0";
  evidence_source_id: string;
  source_type: "trusted-candidate-profile";
  trust: { verified: true; verified_at: string; verified_by: string; basis: string };
  candidate_profile: {
    candidate_name: string;
    current_positioning?: string;
    contact_links?: Array<{ label: string; value: string; url?: string | null; evidence_id?: string }>;
  };
  evidence_items: EvidenceItem[];
};

type EvidenceItem = {
  evidence_id: string;
  statement: string;
  tags: string[];
  status: EvidenceStatus;
  source_reference: string;
  evidence_classification?: string;
  source_field?: string;
  employer?: string;
  title?: string;
  dates?: string;
  category?: "headline" | "summary" | "skill" | "employment" | "achievement" | "education" | "certification" | "project";
  metric_state?: "achieved" | "projected" | "estimated" | "target";
  collaboration_scope?: "individual" | "team" | "partnered" | "supported";
};

type Provenance = {
  evidence_record_id: string;
  source_field: string;
  source_fragment_reference: string;
  evidence_classification: string;
  transformation_type: TransformationType;
  confidence_category: ConfidenceCategory;
  human_review_required: boolean;
  integrity_hash: string;
};

type DraftStatement = {
  statement_id: string;
  text: string;
  provenance: Provenance;
};

type ResumeDraft = {
  schema_version: "1.0.0";
  draft_id: string;
  created_at: string;
  artifact_type: "evidence-backed-resume-draft";
  lifecycle_state: ReviewState;
  readiness_state: "human_review_required";
  label: "DRAFT - HUMAN REVIEW REQUIRED - NOT FOR APPLICATION USE";
  candidate_identity: {
    evidence_source_id: string;
    candidate_name_reference: Provenance;
  };
  target: { company: string; role: string };
  references: {
    strategy_id: string;
    application_id: string;
    opportunity_id: string;
    jd_snapshot_id: string;
    handoff_id: string;
    application_gap_register_id?: string;
  };
  professional_headline: DraftStatement | null;
  professional_summary: DraftStatement[];
  core_skills: DraftStatement[];
  employment_history: Array<{ employer: string; title: string; dates: string; provenance: Provenance; review_flags: string[] }>;
  role_specific_experience_bullets: DraftStatement[];
  selected_achievements: DraftStatement[];
  education: DraftStatement[];
  certifications: DraftStatement[];
  projects_or_portfolio_evidence: DraftStatement[];
  evidence_gaps: Array<{ requirement: string; reason: string; source: string }>;
  application_level_gaps: ApplicationLevelGap[];
  excluded_unsupported_claims: Array<{ claim: string; reason: string }>;
  review_flags: string[];
  source_provenance: { strategy_path: string; candidate_evidence_path: string; application_gap_register_path?: string };
  integrity: {
    strategy_hash: string;
    candidate_evidence_hash: string;
    material_hash: string;
  };
};

type ReviewChecklist = {
  schema_version: "1.0.0";
  draft_id: string;
  approval_state: "human_review_required";
  items: Array<{ check_id: string; category: string; prompt: string; status: "pending"; evidence_ids: string[] }>;
};

type DraftResult = {
  schema_version: "1.0.0";
  mode: Mode;
  status: "planned" | "created" | "duplicate";
  dry_run: boolean;
  output_dir: string;
  outputs: { json: string; markdown: string; checklist: string };
  summary: {
    draft_id: string;
    strategy_id: string;
    target_company: string;
    target_role: string;
    lifecycle_state: ReviewState;
    statement_count: number;
    evidence_gap_count: number;
    review_flag_count: number;
  };
  draft?: ResumeDraft;
  checklist?: ReviewChecklist;
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

export class ResumeDraftError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export function runCareerOsResumeDraft(options: RunOptions = {}): DraftResult {
  const cwd = options.cwd ?? process.cwd();
  const flags = parseArgs(options.argv ?? process.argv.slice(2));
  const mode = resolveMode(flags);
  const nowValue = flags.now ?? options.now ?? new Date().toISOString();
  assertValidDate(nowValue, "now");

  if (!flags.strategy) {
    throw new ResumeDraftError("invalid-input", "--strategy is required.");
  }
  if (!flags["candidate-evidence"]) {
    throw new ResumeDraftError("untrusted-candidate-evidence", "--candidate-evidence is required.");
  }

  const strategyPath = resolveExistingJsonPath(cwd, flags.strategy);
  const registryRoot = inferRegistryRoot(strategyPath);
  assertPrivateRoot(registryRoot, cwd);
  const evidencePath = resolveExistingJsonPath(cwd, flags["candidate-evidence"]);
  assertPrivatePath(evidencePath, cwd, "Candidate evidence source");

  const strategy = readJson<StrategyArtifact>(strategyPath);
  const evidence = readJson<TrustedEvidenceSource>(evidencePath);
  validateTrustedEvidence(evidence);
  validateStrategy(strategy, evidence);

  const strategyHash = fileHash(strategyPath);
  const evidenceHash = fileHash(evidencePath);
  assertEqual(strategy.candidate_evidence_source.evidence_source_id, evidence.evidence_source_id, "candidate evidence source ID");
  assertEqual(strategy.candidate_evidence_source.source_hash, evidenceHash, "candidate evidence source hash");
  assertEqual(strategy.integrity.candidate_evidence_hash, evidenceHash, "strategy candidate evidence hash");

  validateLinkedPrivateRecords(cwd, registryRoot, strategy);

  const draft = buildDraft({
    cwd,
    nowValue,
    strategyPath,
    evidencePath,
    strategy,
    evidence,
    hashes: { strategyHash, evidenceHash }
  });
  const checklist = buildChecklist(draft);
  const markdown = renderMarkdown(draft);
  const outputDir = path.join(registryRoot, "resume-drafts", draft.draft_id);
  const outputs = {
    json: path.join(outputDir, "resume-draft.json"),
    markdown: path.join(outputDir, "resume-draft.md"),
    checklist: path.join(outputDir, "review-checklist.json")
  };
  assertPrivatePath(outputDir, cwd, "Resume draft output");

  const result = createResult(mode, outputDir, outputs, draft, checklist);
  if (mode === "dry-run") {
    return { ...result, status: "planned", dry_run: true, draft: undefined, checklist: undefined };
  }

  const writes = [
    { file: outputs.json, value: `${JSON.stringify(draft, null, 2)}\n` },
    { file: outputs.markdown, value: markdown },
    { file: outputs.checklist, value: `${JSON.stringify(checklist, null, 2)}\n` }
  ];
  const existing = existingOutputs(writes.map((write) => write.file));
  if (existing.length > 0) {
    if (existing.length === writes.length && existingDraftMatches(outputs.json, draft.integrity.material_hash)) {
      return { ...result, status: "duplicate", dry_run: false };
    }
    throw new ResumeDraftError("draft-conflict", `Existing resume draft output conflicts with this material: ${outputDir}`);
  }
  if (options.simulateWriteFailure) {
    writes[1] = { ...writes[1], value: "__SIMULATE_WRITE_FAILURE__" };
  }
  atomicWriteFiles(writes, options.simulateWriteFailure ? outputs.markdown : null);
  return { ...result, status: "created", dry_run: false };
}

function parseArgs(argv: string[]): CliFlags {
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      continue;
    }
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      flags[key] = true;
    } else {
      flags[key] = next;
      i += 1;
    }
  }
  return flags as CliFlags;
}

function resolveMode(flags: CliFlags): Mode {
  if (flags.apply && flags["dry-run"]) {
    throw new ResumeDraftError("invalid-input", "Use either --apply or --dry-run, not both.");
  }
  if (flags.apply) {
    return "apply";
  }
  if (flags["dry-run"]) {
    return "dry-run";
  }
  throw new ResumeDraftError("invalid-input", "Choose --dry-run or --apply.");
}

function buildDraft(input: {
  cwd: string;
  nowValue: string;
  strategyPath: string;
  evidencePath: string;
  strategy: StrategyArtifact;
  evidence: TrustedEvidenceSource;
  hashes: { strategyHash: string; evidenceHash: string };
}): ResumeDraft {
  const usableEvidence = input.evidence.evidence_items.filter((item) => item.status === "verified");
  const byCategory = (category: EvidenceItem["category"]) => usableEvidence.filter((item) => item.category === category);
  const headlineSource = byCategory("headline")[0] ?? usableEvidence.find((item) => item.tags.some((tag) => normalize(tag).includes("headline"))) ?? null;
  const employment = byCategory("employment").map((item) => ({
    employer: requiredEvidenceField(item.employer, item.evidence_id, "employer"),
    title: requiredEvidenceField(item.title, item.evidence_id, "title"),
    dates: requiredEvidenceField(item.dates, item.evidence_id, "dates"),
    provenance: provenance(item, "selected"),
    review_flags: chronologyFlags(item, byCategory("employment"))
  }));
  const bullets = byCategory("achievement").map((item) => statement(item, "verbatim"));
  const summarySources = byCategory("summary").length > 0 ? byCategory("summary") : usableEvidence.filter((item) => ["Product Strategy", "Analytics", "Leadership"].some((tag) => item.tags.includes(tag))).slice(0, 3);
  const gapRequirements = new Set(input.strategy.evidence_gaps_and_unsupported_claims.map((gap) => normalize(gap.claim_or_requirement)));
  const applicationLevelGaps = input.strategy.application_level_gaps ?? [];
  const unresolvedGaps = unresolvedApplicationGaps(applicationLevelGaps);
  const applicationGapsNotInStrategy = unresolvedGaps.filter((gap) => !gapRequirements.has(normalize(gap.requirement)));
  for (const gap of unresolvedGaps) {
    gapRequirements.add(normalize(gap.requirement));
  }
  const allStatements = [
    ...(headlineSource ? [statement(headlineSource, "condensed")] : []),
    ...summarySources.map((item) => statement(item, "condensed")),
    ...byCategory("skill").map((item) => statement(item, "selected")),
    ...bullets,
    ...byCategory("education").map((item) => statement(item, "verbatim")),
    ...byCategory("certification").map((item) => statement(item, "verbatim")),
    ...byCategory("project").map((item) => statement(item, "verbatim"))
  ];
  const reviewFlags = [
    ...chronologyConflictFlags(employment),
    ...projectedMetricFlags(usableEvidence),
    ...collaborationFlags(usableEvidence),
    ...repetitionFlags(allStatements),
    ...superlativeFlags(allStatements)
  ];
  const draft: ResumeDraft = {
    schema_version: schemaVersion,
    draft_id: draftId(input.strategy, input.hashes.evidenceHash),
    created_at: input.nowValue,
    artifact_type: "evidence-backed-resume-draft",
    lifecycle_state: "human_review_required",
    readiness_state: "human_review_required",
    label: "DRAFT - HUMAN REVIEW REQUIRED - NOT FOR APPLICATION USE",
    candidate_identity: {
      evidence_source_id: input.evidence.evidence_source_id,
      candidate_name_reference: provenance(
        {
          evidence_id: `${input.evidence.evidence_source_id}:candidate-profile`,
          statement: input.evidence.candidate_profile.candidate_name,
          tags: ["candidate identity"],
          status: "verified",
          source_reference: "candidate_profile.candidate_name",
          evidence_classification: "candidate_identity",
          source_field: "candidate_profile.candidate_name"
        },
        "selected"
      )
    },
    target: input.strategy.target,
    references: {
      strategy_id: input.strategy.strategy_id,
      application_id: input.strategy.application.application_id,
      opportunity_id: input.strategy.opportunity.opportunity_id,
      jd_snapshot_id: input.strategy.jd.jd_snapshot_id,
      handoff_id: input.strategy.handoff.resume_os_handoff_id,
      ...(input.strategy.application_level_gap_register
        ? { application_gap_register_id: input.strategy.application_level_gap_register.gap_register_id }
        : {})
    },
    professional_headline: headlineSource ? statement(headlineSource, "condensed") : null,
    professional_summary: summarySources.map((item) => statement(item, "condensed")),
    core_skills: byCategory("skill").map((item) => statement(item, "selected")),
    employment_history: employment,
    role_specific_experience_bullets: bullets,
    selected_achievements: bullets,
    education: byCategory("education").map((item) => statement(item, "verbatim")),
    certifications: byCategory("certification").map((item) => statement(item, "verbatim")),
    projects_or_portfolio_evidence: byCategory("project").map((item) => statement(item, "verbatim")),
    evidence_gaps: [
      ...input.strategy.evidence_gaps_and_unsupported_claims.map((gap) => ({
        requirement: gap.claim_or_requirement,
        reason: gap.handling,
        source: "strategy.evidence_gaps_and_unsupported_claims"
      })),
      ...applicationGapsNotInStrategy.map((gap) => ({
        requirement: gap.requirement,
        reason: `Application-level gap ${gap.gap_id}: ${gap.explanation} ${gap.claim_boundary}`,
        source: "strategy.application_level_gaps"
      }))
    ],
    application_level_gaps: applicationLevelGaps,
    excluded_unsupported_claims: input.strategy.evidence_to_requirement_mapping
      .filter((mapping) => mapping.status !== "evidence-backed" || gapRequirements.has(normalize(mapping.requirement)))
      .map((mapping) => ({ claim: mapping.requirement, reason: mapping.notes }))
      .concat(unresolvedGaps.map((gap) => ({ claim: gap.requirement, reason: `Application-level gap ${gap.gap_id}: ${gap.claim_boundary}` }))),
    review_flags: [
      ...new Set([
        ...reviewFlags,
        ...unresolvedGaps.map((gap) => `${gap.gap_id}: application-level gap requires human review before any positive resume claim.`)
      ])
    ],
    source_provenance: {
      strategy_path: toRelative(input.cwd, input.strategyPath),
      candidate_evidence_path: toRelative(input.cwd, input.evidencePath),
      ...(input.strategy.application_level_gap_register
        ? { application_gap_register_path: input.strategy.application_level_gap_register.source_path }
        : {})
    },
    integrity: {
      strategy_hash: input.hashes.strategyHash,
      candidate_evidence_hash: input.hashes.evidenceHash,
      material_hash: ""
    }
  };
  return {
    ...draft,
    integrity: {
      ...draft.integrity,
      material_hash: hashJson({ ...draft, created_at: "stable", integrity: { ...draft.integrity, material_hash: "stable" } })
    }
  };
}

function validateStrategy(strategy: StrategyArtifact, evidence: TrustedEvidenceSource): void {
  requireSchema(strategy, "strategy");
  if (strategy.artifact_type !== "human-review-only-resume-strategy") {
    throw new ResumeDraftError("invalid-strategy", "Input must be a COS-3 human-review-only resume strategy.");
  }
  if (typeof strategy.integrity?.material_hash !== "string" || !/^[a-f0-9]{64}$/u.test(strategy.integrity.material_hash)) {
    throw new ResumeDraftError("invalid-strategy", "Strategy material hash is missing or malformed.");
  }
  assertEqual(strategy.integrity.material_hash, hashResumeStrategyMaterial(strategy), "strategy material hash");
  if (!strategy.strategy_id || !strategy.application?.application_id || !strategy.opportunity?.opportunity_id || !strategy.jd?.jd_snapshot_id || !strategy.handoff?.resume_os_handoff_id) {
    throw new ResumeDraftError("invalid-strategy", "Strategy is missing required identifiers.");
  }
  if (strategy.decision_state.readiness_state === "blocked") {
    throw new ResumeDraftError("strategy-blocked", "Blocked strategies cannot be assembled into resume drafts.");
  }
  if (strategy.decision_state.readiness_state !== "human_review_required") {
    throw new ResumeDraftError("invalid-strategy", "Only human_review_required strategies can be assembled.");
  }
  if (containsForbiddenFinalState(strategy)) {
    throw new ResumeDraftError("invalid-strategy", "Strategy contains a final application/export state outside COS-4 scope.");
  }
  validateApplicationGapStrategyFields(strategy, evidence.evidence_items.map((item) => item.evidence_id));
}

function containsForbiddenFinalState(value: unknown): boolean {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "application_ready"
      || normalized === "application-ready"
      || normalized === "application ready"
      || normalized === "submitted"
      || normalized === "approved_for_export";
  }
  if (Array.isArray(value)) {
    return value.some((item) => containsForbiddenFinalState(item));
  }
  if (value && typeof value === "object") {
    return Object.values(value).some((item) => containsForbiddenFinalState(item));
  }
  return false;
}

function validateLinkedPrivateRecords(cwd: string, registryRoot: string, strategy: StrategyArtifact): void {
  const handoffPath = resolveRegistryPath(cwd, registryRoot, strategy.handoff.source_path);
  const applicationPath = path.join(registryRoot, "applications", `${strategy.application.application_id}.json`);
  const opportunityPath = path.join(registryRoot, "opportunities", `${strategy.opportunity.opportunity_id}.json`);
  const jdPath = path.join(registryRoot, "jd-snapshots", `${strategy.jd.jd_snapshot_id}.json`);
  assertEqual(fileHash(handoffPath), strategy.integrity.handoff_hash, "handoff integrity hash");
  assertEqual(fileHash(applicationPath), strategy.integrity.application_hash, "application integrity hash");
  assertEqual(fileHash(opportunityPath), strategy.integrity.opportunity_hash, "opportunity integrity hash");
  assertEqual(fileHash(jdPath), strategy.integrity.jd_snapshot_hash, "JD snapshot integrity hash");
  assertEqual(readJson<Record<string, unknown>>(applicationPath).application_id, strategy.application.application_id, "application ID");
  assertEqual(readJson<Record<string, unknown>>(opportunityPath).opportunity_id, strategy.opportunity.opportunity_id, "opportunity ID");
  assertEqual(readJson<Record<string, unknown>>(jdPath).jd_snapshot_id, strategy.jd.jd_snapshot_id, "JD snapshot ID");
}

function validateTrustedEvidence(evidence: TrustedEvidenceSource): void {
  requireSchema(evidence, "candidate evidence");
  if (evidence.source_type !== "trusted-candidate-profile" || evidence.trust?.verified !== true) {
    throw new ResumeDraftError("untrusted-candidate-evidence", "Candidate evidence source must be explicitly trusted and verified.");
  }
  assertValidDate(evidence.trust.verified_at, "candidate evidence verification date");
  if (!evidence.evidence_source_id || !evidence.trust.verified_by || !evidence.trust.basis || !evidence.candidate_profile?.candidate_name) {
    throw new ResumeDraftError("untrusted-candidate-evidence", "Candidate evidence trust metadata is incomplete.");
  }
  if (!Array.isArray(evidence.evidence_items) || evidence.evidence_items.length === 0) {
    throw new ResumeDraftError("untrusted-candidate-evidence", "Candidate evidence must include evidence items.");
  }
  for (const item of evidence.evidence_items) {
    if (!item.evidence_id || !item.statement || !Array.isArray(item.tags) || item.tags.length === 0 || !item.source_reference) {
      throw new ResumeDraftError("untrusted-candidate-evidence", "Candidate evidence item is incomplete.");
    }
    if (!["verified", "human-review-required"].includes(item.status)) {
      throw new ResumeDraftError("untrusted-candidate-evidence", "Candidate evidence item has unsupported status.");
    }
  }
}

function buildChecklist(draft: ResumeDraft): ReviewChecklist {
  const applicationGapItems = unresolvedApplicationGaps(draft.application_level_gaps).map((gap) => [
    `application-gap-${gap.gap_id.toLowerCase().replace(/[^a-z0-9]+/gu, "-")}`,
    "Application-level gap review",
    `Review application-level gap ${gap.gap_id}: ${gap.requirement}. Preserve the claim boundary. Do not convert it into a positive resume claim.`
  ]);
  return {
    schema_version: schemaVersion,
    draft_id: draft.draft_id,
    approval_state: "human_review_required",
    items: [
      ["claim-verification", "Claim verification", "Verify every statement against its evidence record."],
      ["chronology-review", "Chronology review", "Review dates, sequencing, overlaps, and current-role representation."],
      ["metric-verification", "Metric verification", "Confirm metrics remain attached to the correct employer and evidence record."],
      ["jd-alignment", "JD alignment review", "Confirm alignment without inserting unsupported JD keywords."],
      ["unsupported-gap-review", "Unsupported/gap review", "Approve all exclusions and unresolved evidence gaps."],
      ...applicationGapItems,
      ["duplication-review", "Duplication review", "Reduce repeated phrasing or repeated evidence if needed."],
      ["formatting-review", "Spelling and formatting review", "Review readability, spelling, and section order before export."]
    ].map(([check_id, category, prompt]) => ({
      check_id,
      category,
      prompt,
      status: "pending" as const,
      evidence_ids: statementEvidenceIds(draft)
    }))
  };
}

function renderMarkdown(draft: ResumeDraft): string {
  const lines = [
    "# Resume Draft",
    "",
    draft.label,
    "",
    `Target: ${draft.target.role} at ${draft.target.company}`,
    `Draft ID: ${draft.draft_id}`,
    `Review state: ${draft.lifecycle_state}`,
    "",
    "## Headline",
    "",
    draft.professional_headline?.text ?? "[No verified headline evidence supplied]",
    "",
    "## Professional Summary",
    "",
    ...draft.professional_summary.map((item) => `- ${item.text}`),
    "",
    "## Core Skills",
    "",
    ...draft.core_skills.map((item) => `- ${item.text}`),
    "",
    "## Employment History",
    "",
    ...draft.employment_history.map((item) => `- ${item.title}, ${item.employer} (${item.dates})`),
    "",
    "## Role-Specific Experience",
    "",
    ...draft.role_specific_experience_bullets.map((item) => `- ${item.text}`),
    "",
    "## Education",
    "",
    ...draft.education.map((item) => `- ${item.text}`),
    "",
    "## Certifications",
    "",
    ...draft.certifications.map((item) => `- ${item.text}`),
    "",
    "## Projects / Portfolio Evidence",
    "",
    ...draft.projects_or_portfolio_evidence.map((item) => `- ${item.text}`),
    "",
    "## Evidence Gaps",
    "",
    ...draft.evidence_gaps.map((gap) => `- ${gap.requirement}: ${gap.reason}`),
    "",
    "## Application-Level Gaps",
    "",
    ...draft.application_level_gaps.map((gap) => `- ${gap.gap_id}: ${gap.requirement} (${gap.status}) - ${gap.claim_boundary}`),
    "",
    "## Excluded Unsupported Claims",
    "",
    ...draft.excluded_unsupported_claims.map((claim) => `- ${claim.claim}: ${claim.reason}`),
    "",
    "## Human Review Flags",
    "",
    ...draft.review_flags.map((flag) => `- ${flag}`),
    ""
  ];
  return `${lines.join("\n")}\n`;
}

function statement(item: EvidenceItem, transformation: TransformationType): DraftStatement {
  return {
    statement_id: `stmt:${item.evidence_id}`,
    text: sanitizeStatement(item),
    provenance: provenance(item, transformation)
  };
}

function sanitizeStatement(item: EvidenceItem): string {
  if (item.metric_state && item.metric_state !== "achieved") {
    return item.statement;
  }
  if (item.collaboration_scope && item.collaboration_scope !== "individual" && /^\s*(owned|led)\b/iu.test(item.statement)) {
    return item.statement.replace(/^\s*owned\b/iu, "Contributed to").replace(/^\s*led\b/iu, "Partnered on");
  }
  return item.statement.trim();
}

function provenance(item: EvidenceItem, transformation: TransformationType): Provenance {
  return {
    evidence_record_id: item.evidence_id,
    source_field: item.source_field ?? "statement",
    source_fragment_reference: item.source_reference,
    evidence_classification: item.evidence_classification ?? item.category ?? "candidate_evidence",
    transformation_type: transformation,
    confidence_category: item.status === "verified" ? "complete" : "requires-human-review",
    human_review_required: item.status !== "verified",
    integrity_hash: hashJson({
      evidence_id: item.evidence_id,
      statement: item.statement,
      source_reference: item.source_reference,
      status: item.status
    })
  };
}

function statementEvidenceIds(draft: ResumeDraft): string[] {
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
    .filter((item): item is DraftStatement => Boolean(item))
    .map((item) => item.provenance.evidence_record_id);
}

function chronologyFlags(item: EvidenceItem, employment: EvidenceItem[]): string[] {
  if (!item.dates) {
    return [`${item.evidence_id}: employment dates missing; human review required.`];
  }
  const sameEmployer = employment.filter((candidate) => candidate.employer === item.employer && candidate.evidence_id !== item.evidence_id);
  return sameEmployer.some((candidate) => candidate.dates === item.dates)
    ? [`${item.evidence_id}: duplicate employer/date evidence requires human review.`]
    : [];
}

function chronologyConflictFlags(employment: ResumeDraft["employment_history"]): string[] {
  const flags: string[] = [];
  for (let i = 0; i < employment.length; i += 1) {
    for (let j = i + 1; j < employment.length; j += 1) {
      if (employment[i].employer === employment[j].employer && employment[i].dates === employment[j].dates && employment[i].title !== employment[j].title) {
        flags.push(`Potential overlapping or contradictory dates for ${employment[i].employer}; human chronology review required.`);
      }
    }
  }
  return flags;
}

function projectedMetricFlags(evidence: EvidenceItem[]): string[] {
  return evidence
    .filter((item) => item.metric_state && item.metric_state !== "achieved")
    .map((item) => `${item.evidence_id}: ${item.metric_state} metric preserved as non-achieved.`);
}

function collaborationFlags(evidence: EvidenceItem[]): string[] {
  return evidence
    .filter((item) => item.collaboration_scope && item.collaboration_scope !== "individual")
    .map((item) => `${item.evidence_id}: collaborative scope preserved; do not rewrite as sole ownership.`);
}

function repetitionFlags(statements: DraftStatement[]): string[] {
  const normalized = statements.map((item) => normalize(item.text)).filter(Boolean);
  return new Set(normalized).size < normalized.length ? ["Repeated statement text detected; human duplication review required."] : [];
}

function superlativeFlags(statements: DraftStatement[]): string[] {
  return statements.some((item) => /\b(best|world[-\s]?class|unmatched|unparalleled|industry[-\s]?leading)\b/iu.test(item.text))
    ? ["Unverifiable superlative detected; human claim review required."]
    : [];
}

function createResult(mode: Mode, outputDir: string, outputs: DraftResult["outputs"], draft: ResumeDraft, checklist: ReviewChecklist): DraftResult {
  return {
    schema_version: schemaVersion,
    mode,
    status: "planned",
    dry_run: mode === "dry-run",
    output_dir: outputDir,
    outputs,
    summary: {
      draft_id: draft.draft_id,
      strategy_id: draft.references.strategy_id,
      target_company: draft.target.company,
      target_role: draft.target.role,
      lifecycle_state: draft.lifecycle_state,
      statement_count: statementEvidenceIds(draft).length,
      evidence_gap_count: draft.evidence_gaps.length,
      review_flag_count: draft.review_flags.length
    },
    draft,
    checklist
  };
}

function atomicWriteFiles(writes: Array<{ file: string; value: string }>, failOnFile: string | null): void {
  const written: string[] = [];
  try {
    for (const write of writes) {
      if (existsSync(write.file)) {
        throw new ResumeDraftError("draft-conflict", `Refusing to overwrite existing draft output: ${write.file}`);
      }
      if (failOnFile === write.file) {
        throw new ResumeDraftError("draft-write-failure", "Simulated draft write failure.");
      }
      atomicWriteFile(write.file, write.value);
      written.push(write.file);
    }
  } catch (error) {
    for (const file of written.reverse()) {
      rmSync(file, { force: true });
    }
    throw error;
  }
}

function atomicWriteFile(file: string, value: string): void {
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

function existingOutputs(files: string[]): string[] {
  return files.filter((file) => existsSync(file));
}

function existingDraftMatches(draftPath: string, materialHash: string): boolean {
  try {
    const existing = readJson<ResumeDraft>(draftPath);
    return existing.integrity?.material_hash === materialHash;
  } catch {
    return false;
  }
}

function resolveExistingJsonPath(cwd: string, input: string): string {
  if (containsTraversal(input)) {
    throw new ResumeDraftError("unsafe-reference", `Path traversal is not allowed: ${input}`);
  }
  const resolved = path.resolve(cwd, input);
  if (!existsSync(resolved)) {
    throw new ResumeDraftError("missing-record", `File not found: ${resolved}`);
  }
  rejectSymlink(resolved);
  if (path.extname(resolved).toLowerCase() !== ".json") {
    throw new ResumeDraftError("invalid-input", "Only JSON files are supported for COS-4.");
  }
  return resolved;
}

function resolveRegistryPath(cwd: string, registryRoot: string, reference: string): string {
  if (containsTraversal(reference)) {
    throw new ResumeDraftError("unsafe-reference", `Path traversal is not allowed: ${reference}`);
  }
  const resolved = path.resolve(cwd, reference);
  assertInside(resolved, registryRoot, "Referenced record");
  if (!existsSync(resolved)) {
    throw new ResumeDraftError("missing-record", `Referenced record not found: ${reference}`);
  }
  rejectSymlink(resolved);
  return resolved;
}

function inferRegistryRoot(strategyPath: string): string {
  const parent = path.basename(path.dirname(strategyPath));
  if (parent !== "resume-strategies") {
    throw new ResumeDraftError("invalid-strategy", "Strategy artifact must live under a resume-strategies directory.");
  }
  return path.dirname(path.dirname(strategyPath));
}

function readJson<T>(file: string): T {
  const stat = statSync(file);
  if (!stat.isFile()) {
    throw new ResumeDraftError("invalid-input", `Expected a file: ${file}`);
  }
  if (stat.size > maxJsonBytes) {
    throw new ResumeDraftError("invalid-input", `JSON file exceeds safe size limit: ${file}`);
  }
  const raw = readFileSync(file, "utf8");
  if (credentialPattern.test(raw)) {
    throw new ResumeDraftError("unsafe-input", `Input contains suspected credential material: ${file}`);
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new ResumeDraftError("malformed-json", `Malformed JSON: ${file}`);
  }
}

function requiredEvidenceField(value: string | undefined, evidenceId: string, field: string): string {
  if (!value?.trim()) {
    throw new ResumeDraftError("untrusted-candidate-evidence", `${evidenceId} is missing required ${field} field.`);
  }
  return value.trim();
}

function requireSchema(value: { schema_version?: string }, label: string): void {
  if (value.schema_version !== schemaVersion) {
    throw new ResumeDraftError("unsupported-schema", `Unsupported ${label} schema_version: ${String(value.schema_version)}`);
  }
}

function assertEqual(actual: unknown, expected: unknown, label: string): void {
  if (actual !== expected) {
    throw new ResumeDraftError("integrity-mismatch", `${label} mismatch: expected ${String(expected)}, got ${String(actual)}`);
  }
}

function assertValidDate(value: string, label: string): void {
  if (Number.isNaN(Date.parse(value))) {
    throw new ResumeDraftError("invalid-input", `Invalid ${label}: ${value}`);
  }
}

function assertPrivateRoot(root: string, cwd: string): void {
  if (isInside(root, os.tmpdir())) {
    return;
  }
  const normalized = toRelative(cwd, root);
  if (!normalized.startsWith("data/private/")) {
    throw new ResumeDraftError("unsafe-storage", "Resume drafts must stay under data/private/ when inside the repository.");
  }
  assertGitIgnores(cwd, `${normalized.replace(/\/$/u, "")}/.resume-draft-probe`);
}

function assertPrivatePath(file: string, cwd: string, label: string): void {
  if (isInside(file, os.tmpdir())) {
    return;
  }
  const normalized = toRelative(cwd, file);
  if (!normalized.startsWith("data/private/")) {
    throw new ResumeDraftError("unsafe-storage", `${label} must stay under data/private/ when inside the repository.`);
  }
  assertGitIgnores(cwd, normalized);
}

function assertGitIgnores(cwd: string, relativePath: string): void {
  try {
    execFileSync("git", ["check-ignore", "-q", "--", relativePath], { cwd, stdio: "ignore" });
  } catch {
    throw new ResumeDraftError("unsafe-storage", `Private path is not ignored by Git: ${relativePath}`);
  }
}

function assertInside(file: string, root: string, label: string): void {
  if (!isInside(file, root)) {
    throw new ResumeDraftError("unsafe-reference", `${label} must resolve inside the private registry root.`);
  }
}

function isInside(file: string, root: string): boolean {
  const relative = path.relative(root, file);
  return Boolean(relative) && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectSymlink(file: string): void {
  if (lstatSync(file).isSymbolicLink()) {
    throw new ResumeDraftError("unsafe-reference", `Symlink inputs are not allowed: ${file}`);
  }
}

function containsTraversal(reference: string): boolean {
  return reference.split(/[\\/]+/u).some((part) => part === "..");
}

function draftId(strategy: StrategyArtifact, evidenceHash: string): string {
  return `RDRAFT-${strategy.application.application_id}-${hash(`${strategy.strategy_id}:${evidenceHash}`, 8)}`;
}

function fileHash(file: string): string {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function hash(input: string, length: number): string {
  return createHash("sha256").update(input).digest("hex").slice(0, length);
}

function hashJson(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function normalize(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/gu, " ").trim();
}

function toRelative(cwd: string, file: string): string {
  const relative = path.relative(cwd, file);
  if (relative && !relative.startsWith("..") && !path.isAbsolute(relative)) {
    return relative.replace(/\\/g, "/");
  }
  return file;
}

function printHumanSummary(result: DraftResult): void {
  const label = result.dry_run ? "DRY RUN - no files written" : result.status === "duplicate" ? "DUPLICATE - existing draft preserved" : "APPLY COMPLETE";
  console.log(label);
  console.log(`Draft ID: ${result.summary.draft_id}`);
  console.log(`Strategy ID: ${result.summary.strategy_id}`);
  console.log(`Lifecycle: ${result.summary.lifecycle_state}`);
  console.log(`Statements: ${result.summary.statement_count}`);
  console.log(`Evidence gaps: ${result.summary.evidence_gap_count}`);
  console.log(`Review flags: ${result.summary.review_flag_count}`);
  console.log(`Output: ${result.output_dir}`);
}

function main(): void {
  try {
    const result = runCareerOsResumeDraft();
    if (process.argv.includes("--format") && process.argv[process.argv.indexOf("--format") + 1] === "json") {
      console.log(JSON.stringify(result, null, 2));
    } else {
      printHumanSummary(result);
    }
  } catch (error) {
    if (error instanceof ResumeDraftError) {
      console.error(`${error.code}: ${error.message}`);
    } else {
      console.error(error instanceof Error ? error.message : String(error));
    }
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
