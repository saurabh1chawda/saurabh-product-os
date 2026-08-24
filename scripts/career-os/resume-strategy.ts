import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

type Mode = "dry-run" | "apply";
type DecisionOutcome = "proceed" | "pause" | "decline";
type RecommendationStatus = "evidence-backed" | "gap" | "human-review-required";
type ReadinessState = "human_review_required" | "blocked";

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
  integrity: {
    jd_content_hash: string;
    source_identity_hash: string;
    linkage_hash: string;
  };
};

type DecisionRecord = {
  schema_version: "1.0.0";
  decision_id: string;
  outcome: DecisionOutcome;
  reasons: string[];
  evidence_used: string[];
  missing_evidence: string[];
  risks_or_gaps: string[];
  stable_ids: {
    jdSnapshotId: string;
    opportunityId: string;
    applicationId: string;
  };
};

type OpportunityRecord = {
  schema_version: "1.0.0";
  opportunity_id: string;
  company_name: string;
  role_title: string;
  jd_snapshot_id: string;
  decision_id: string;
  decision_outcome: DecisionOutcome;
  job_model_id: string;
  hiring_model_id: string;
  evaluation_framework_id: string;
  status: string;
  reasons: string[];
  missing_evidence: string[];
  risks_or_gaps: string[];
};

type JdSnapshot = {
  schema_version: "1.0.0";
  jd_snapshot_id: string;
  content_hash: string;
  source_identity_hash: string;
  linkage_hash: string;
  company_name: string;
  role_title: string;
  normalized_jd_text: string;
  deterministic_analysis: {
    job_model_id: string;
    role: string;
    seniority: string;
    function: string;
    domain: string;
    required_competencies: string[];
    evidence_expectations: string[];
  };
};

type ApplicationRecord = {
  schema_version: "1.0.0";
  application_id: string;
  company_name: string;
  role_title: string;
  current_stage: string;
  current_status: string;
  active: boolean;
  jd_snapshot_id: string | null;
  jd_path: string | null;
  jd_hash: string | null;
  confidentiality: "private" | "sanitized" | "public-fixture";
  contains_personal_data: boolean;
  safe_to_commit: boolean;
};

type TrustedEvidenceSource = {
  schema_version: "1.0.0";
  evidence_source_id: string;
  source_type: "trusted-candidate-profile";
  trust: {
    verified: true;
    verified_at: string;
    verified_by: string;
    basis: string;
  };
  candidate_profile: {
    candidate_name: string;
    current_positioning?: string;
  };
  evidence_items: EvidenceItem[];
};

type EvidenceItem = {
  evidence_id: string;
  statement: string;
  tags: string[];
  status: "verified" | "human-review-required";
  source_reference: string;
};

type ResumeStrategy = {
  schema_version: "1.0.0";
  strategy_id: string;
  created_at: string;
  artifact_type: "human-review-only-resume-strategy";
  application: {
    application_id: string;
    current_stage: string;
    current_status: string;
  };
  opportunity: {
    opportunity_id: string;
    job_model_id: string;
    hiring_model_id: string;
    evaluation_framework_id: string;
  };
  jd: {
    jd_snapshot_id: string;
    content_hash: string;
  };
  handoff: {
    resume_os_handoff_id: string;
    generated_at: string;
    source_path: string;
  };
  target: {
    company: string;
    role: string;
  };
  decision_state: {
    outcome: DecisionOutcome;
    readiness_state: ReadinessState;
    blocking_reasons: string[];
  };
  role_requirements: Array<{
    requirement: string;
    priority: number;
    source: string;
  }>;
  prioritized_signals: string[];
  evidence_to_requirement_mapping: Array<{
    requirement: string;
    status: RecommendationStatus;
    evidence_ids: string[];
    notes: string;
  }>;
  supported_positioning_themes: Array<{
    theme: string;
    status: RecommendationStatus;
    evidence_ids: string[];
  }>;
  evidence_gaps_and_unsupported_claims: Array<{
    claim_or_requirement: string;
    status: "gap" | "unsupported";
    handling: string;
  }>;
  recommended_resume_sections_or_emphasis: Array<{
    section: string;
    recommendation: string;
    status: RecommendationStatus;
    evidence_ids: string[];
  }>;
  human_review_checklist: string[];
  candidate_evidence_source: {
    evidence_source_id: string;
    source_hash: string;
    verified_by: string;
    verified_at: string;
  };
  integrity: {
    handoff_hash: string;
    decision_hash: string;
    opportunity_hash: string;
    jd_snapshot_hash: string;
    application_hash: string;
    candidate_evidence_hash: string;
    material_hash: string;
  };
  limitations: string[];
};

type StrategyResult = {
  schema_version: "1.0.0";
  mode: Mode;
  status: "planned" | "created" | "duplicate";
  dry_run: boolean;
  output_path: string;
  strategy: ResumeStrategy;
};

type RunOptions = {
  argv?: string[];
  cwd?: string;
  now?: string;
  simulateWriteFailure?: boolean;
};

const MAX_JSON_BYTES = 500_000;
const schemaVersion = "1.0.0";
const credentialPattern = /(password|api[_-]?key|secret|token|private[_-]?key|credential)/i;

export class ResumeStrategyError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export function runCareerOsResumeStrategy(options: RunOptions = {}): StrategyResult {
  const cwd = options.cwd ?? process.cwd();
  const flags = parseArgs(options.argv ?? process.argv.slice(2));
  const mode = resolveMode(flags);
  const nowValue = flags.now ?? options.now ?? new Date().toISOString();
  assertValidDate(nowValue, "now");

  if (!flags.handoff) {
    throw new ResumeStrategyError("invalid-input", "--handoff is required.");
  }
  if (!flags["candidate-evidence"]) {
    throw new ResumeStrategyError("untrusted-candidate-evidence", "--candidate-evidence is required and must point to a trusted evidence source.");
  }

  const handoffPath = resolveExistingJsonPath(cwd, flags.handoff);
  const registryRoot = inferRegistryRoot(handoffPath);
  assertPrivateRoot(registryRoot, cwd);

  const handoff = readJson<ResumeHandoff>(handoffPath);
  validateHandoff(handoff);

  const decisionPath = resolveRegistryReference(cwd, registryRoot, handoff.fit_qualification_artifact_references.decision_path);
  const opportunityPath = resolveRegistryReference(cwd, registryRoot, handoff.fit_qualification_artifact_references.opportunity_path);
  const jdPath = resolveRegistryReference(cwd, registryRoot, handoff.fit_qualification_artifact_references.jd_snapshot_path);
  const applicationPath = path.join(registryRoot, "applications", `${handoff.application_id}.json`);
  const candidateEvidencePath = resolveExistingJsonPath(cwd, flags["candidate-evidence"]);

  assertPrivatePath(candidateEvidencePath, cwd, "Candidate evidence source");

  const decision = readJson<DecisionRecord>(decisionPath);
  const opportunity = readJson<OpportunityRecord>(opportunityPath);
  const jd = readJson<JdSnapshot>(jdPath);
  const application = readJson<ApplicationRecord>(applicationPath);
  const evidence = readJson<TrustedEvidenceSource>(candidateEvidencePath);

  validateLinkedRecords({ handoff, decision, opportunity, jd, application });
  validateTrustedEvidence(evidence);

  if (decision.outcome === "decline") {
    throw new ResumeStrategyError("decision-declined", "COS-2 declined this opportunity. Resume strategy generation is not permitted.");
  }

  const hashes = {
    handoffHash: fileHash(handoffPath),
    decisionHash: fileHash(decisionPath),
    opportunityHash: fileHash(opportunityPath),
    jdSnapshotHash: fileHash(jdPath),
    applicationHash: fileHash(applicationPath),
    candidateEvidenceHash: fileHash(candidateEvidencePath)
  };
  const outputPath = path.join(registryRoot, "resume-strategies", `${strategyId(handoff, hashes.candidateEvidenceHash)}.json`);
  assertPrivatePath(outputPath, cwd, "Resume strategy output");

  const strategy = buildStrategy({
    cwd,
    nowValue,
    handoffPath,
    handoff,
    decision,
    opportunity,
    jd,
    application,
    evidence,
    hashes
  });

  if (mode === "dry-run") {
    return { schema_version: schemaVersion, mode, status: "planned", dry_run: true, output_path: outputPath, strategy };
  }

  const existing = existsSync(outputPath) ? readJson<ResumeStrategy>(outputPath) : null;
  if (existing) {
    if (existing.integrity?.material_hash === strategy.integrity.material_hash) {
      return { schema_version: schemaVersion, mode, status: "duplicate", dry_run: false, output_path: outputPath, strategy: existing };
    }
    throw new ResumeStrategyError("strategy-conflict", `Existing resume strategy has different material content: ${outputPath}`);
  }

  if (options.simulateWriteFailure) {
    throw new ResumeStrategyError("strategy-write-failure", "Simulated strategy write failure.");
  }

  atomicWriteJson(outputPath, strategy);
  return { schema_version: schemaVersion, mode, status: "created", dry_run: false, output_path: outputPath, strategy };
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
    throw new ResumeStrategyError("invalid-input", "Use either --apply or --dry-run, not both.");
  }
  if (flags.apply) {
    return "apply";
  }
  if (flags["dry-run"]) {
    return "dry-run";
  }
  throw new ResumeStrategyError("invalid-input", "Choose --dry-run or --apply.");
}

function readJson<T>(file: string): T {
  if (!existsSync(file)) {
    throw new ResumeStrategyError("missing-record", `File not found: ${file}`);
  }
  const stat = statSync(file);
  if (!stat.isFile()) {
    throw new ResumeStrategyError("invalid-input", `Expected a file: ${file}`);
  }
  if (stat.size > MAX_JSON_BYTES) {
    throw new ResumeStrategyError("invalid-input", `JSON file exceeds safe size limit: ${file}`);
  }
  const raw = readFileSync(file, "utf8");
  if (credentialPattern.test(raw)) {
    throw new ResumeStrategyError("unsafe-input", `Input contains suspected credential material: ${file}`);
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new ResumeStrategyError("malformed-json", `Malformed JSON: ${file}`);
  }
}

function resolveExistingJsonPath(cwd: string, input: string): string {
  const resolved = path.resolve(cwd, input);
  if (!existsSync(resolved)) {
    throw new ResumeStrategyError("missing-record", `File not found: ${resolved}`);
  }
  if (path.extname(resolved).toLowerCase() !== ".json") {
    throw new ResumeStrategyError("invalid-input", "Only JSON files are supported for COS-3.");
  }
  return resolved;
}

function resolveRegistryReference(cwd: string, registryRoot: string, reference: string): string {
  if (containsTraversal(reference)) {
    throw new ResumeStrategyError("unsafe-reference", `Path traversal is not allowed: ${reference}`);
  }
  const resolved = path.resolve(cwd, reference);
  assertInside(resolved, registryRoot, "Referenced record");
  if (!existsSync(resolved)) {
    throw new ResumeStrategyError("missing-record", `Referenced record not found: ${reference}`);
  }
  return resolved;
}

function inferRegistryRoot(handoffPath: string): string {
  const parent = path.basename(path.dirname(handoffPath));
  if (parent !== "resume-handoffs") {
    throw new ResumeStrategyError("invalid-handoff", "Handoff manifest must live under a resume-handoffs directory.");
  }
  return path.dirname(path.dirname(handoffPath));
}

function validateHandoff(handoff: ResumeHandoff): void {
  requireSchema(handoff, "handoff");
  for (const [field, value] of Object.entries({
    resume_os_handoff_id: handoff.resume_os_handoff_id,
    application_id: handoff.application_id,
    opportunity_id: handoff.opportunity_id,
    jd_snapshot_id: handoff.jd_snapshot_id,
    normalized_role: handoff.normalized_role,
    normalized_company: handoff.normalized_company
  })) {
    if (typeof value !== "string" || !value.trim()) {
      throw new ResumeStrategyError("invalid-handoff", `Missing required handoff field: ${field}`);
    }
  }
  if (!["proceed", "pause", "decline"].includes(handoff.decision_outcome)) {
    throw new ResumeStrategyError("invalid-handoff", "Unsupported handoff decision outcome.");
  }
}

function validateLinkedRecords(input: {
  handoff: ResumeHandoff;
  decision: DecisionRecord;
  opportunity: OpportunityRecord;
  jd: JdSnapshot;
  application: ApplicationRecord;
}): void {
  const { handoff, decision, opportunity, jd, application } = input;
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
    throw new ResumeStrategyError("privacy-contract", "Application record must remain private, personal-data-bearing, and unsafe to commit.");
  }
}

function validateTrustedEvidence(evidence: TrustedEvidenceSource): void {
  requireSchema(evidence, "candidate evidence");
  if (evidence.source_type !== "trusted-candidate-profile" || evidence.trust?.verified !== true) {
    throw new ResumeStrategyError("untrusted-candidate-evidence", "Candidate evidence source must be explicitly trusted and verified.");
  }
  assertValidDate(evidence.trust.verified_at, "candidate evidence verification date");
  if (!evidence.evidence_source_id || !evidence.trust.verified_by || !evidence.trust.basis) {
    throw new ResumeStrategyError("untrusted-candidate-evidence", "Candidate evidence trust metadata is incomplete.");
  }
  if (!Array.isArray(evidence.evidence_items) || evidence.evidence_items.length === 0) {
    throw new ResumeStrategyError("untrusted-candidate-evidence", "Candidate evidence must contain verified evidence items.");
  }
  for (const item of evidence.evidence_items) {
    if (!item.evidence_id || !item.statement || !Array.isArray(item.tags) || item.tags.length === 0 || !item.source_reference) {
      throw new ResumeStrategyError("untrusted-candidate-evidence", "Candidate evidence item is incomplete.");
    }
    if (!["verified", "human-review-required"].includes(item.status)) {
      throw new ResumeStrategyError("untrusted-candidate-evidence", "Candidate evidence item has unsupported status.");
    }
  }
}

function buildStrategy(input: {
  cwd: string;
  nowValue: string;
  handoffPath: string;
  handoff: ResumeHandoff;
  decision: DecisionRecord;
  opportunity: OpportunityRecord;
  jd: JdSnapshot;
  application: ApplicationRecord;
  evidence: TrustedEvidenceSource;
  hashes: {
    handoffHash: string;
    decisionHash: string;
    opportunityHash: string;
    jdSnapshotHash: string;
    applicationHash: string;
    candidateEvidenceHash: string;
  };
}): ResumeStrategy {
  const requirements = roleRequirements(input.jd, input.decision);
  const mappings = requirements.map((requirement) => mapRequirement(requirement.requirement, input.evidence.evidence_items));
  const supported = mappings.filter((mapping) => mapping.status === "evidence-backed");
  const gaps = mappings.filter((mapping) => mapping.status !== "evidence-backed");
  const blockingReasons = [
    ...(input.decision.outcome === "pause" ? ["COS-2 paused this opportunity before resume preparation; this strategy is blocked until human evidence review clears the pause."] : []),
    ...input.decision.risks_or_gaps,
    ...gaps.map((gap) => `Evidence gap remains for ${gap.requirement}.`)
  ];
  const readinessState: ReadinessState = input.decision.outcome === "proceed" && gaps.length === 0 ? "human_review_required" : "blocked";
  const strategy: ResumeStrategy = {
    schema_version: schemaVersion,
    strategy_id: strategyId(input.handoff, input.hashes.candidateEvidenceHash),
    created_at: input.nowValue,
    artifact_type: "human-review-only-resume-strategy",
    application: {
      application_id: input.application.application_id,
      current_stage: input.application.current_stage,
      current_status: input.application.current_status
    },
    opportunity: {
      opportunity_id: input.opportunity.opportunity_id,
      job_model_id: input.opportunity.job_model_id,
      hiring_model_id: input.opportunity.hiring_model_id,
      evaluation_framework_id: input.opportunity.evaluation_framework_id
    },
    jd: {
      jd_snapshot_id: input.jd.jd_snapshot_id,
      content_hash: input.jd.content_hash
    },
    handoff: {
      resume_os_handoff_id: input.handoff.resume_os_handoff_id,
      generated_at: input.handoff.generated_at,
      source_path: toRelative(input.cwd, input.handoffPath)
    },
    target: {
      company: input.handoff.normalized_company,
      role: input.handoff.normalized_role
    },
    decision_state: {
      outcome: input.decision.outcome,
      readiness_state: readinessState,
      blocking_reasons: [...new Set(blockingReasons)]
    },
    role_requirements: requirements,
    prioritized_signals: prioritizedSignals(input.jd),
    evidence_to_requirement_mapping: mappings,
    supported_positioning_themes: supported.slice(0, 5).map((mapping) => ({
      theme: `Emphasize ${mapping.requirement} only where the resume can cite verified evidence.`,
      status: "evidence-backed",
      evidence_ids: mapping.evidence_ids
    })),
    evidence_gaps_and_unsupported_claims: gaps.map((gap) => ({
      claim_or_requirement: gap.requirement,
      status: gap.status === "gap" ? "gap" : "unsupported",
      handling: "Do not convert this requirement into a resume claim until a human reviewer supplies verified evidence."
    })),
    recommended_resume_sections_or_emphasis: recommendedSections(supported, gaps),
    human_review_checklist: [
      "Confirm the COS-2 pause or proceed state before any resume assembly.",
      "Approve every evidence-backed mapping before converting it into resume language.",
      "Reject unsupported claims, missing metrics, unverified employers, unverified dates, and inferred skills.",
      "Confirm gaps remain visible in the next Resume OS stage.",
      "Confirm this artifact is not used as a final resume, DOCX, PDF, or application submission."
    ],
    candidate_evidence_source: {
      evidence_source_id: input.evidence.evidence_source_id,
      source_hash: input.hashes.candidateEvidenceHash,
      verified_by: input.evidence.trust.verified_by,
      verified_at: input.evidence.trust.verified_at
    },
    integrity: {
      handoff_hash: input.hashes.handoffHash,
      decision_hash: input.hashes.decisionHash,
      opportunity_hash: input.hashes.opportunityHash,
      jd_snapshot_hash: input.hashes.jdSnapshotHash,
      application_hash: input.hashes.applicationHash,
      candidate_evidence_hash: input.hashes.candidateEvidenceHash,
      material_hash: ""
    },
    limitations: [
      "Human-review-only strategy; not application-ready.",
      "No DOCX, PDF, resume draft, cover letter, submission, LLM call, provider call, browser action, or network action was produced.",
      "Missing evidence remains a gap, never a positive claim."
    ]
  };
  return {
    ...strategy,
    integrity: {
      ...strategy.integrity,
      material_hash: hashJson({ ...strategy, created_at: "stable", integrity: { ...strategy.integrity, material_hash: "stable" } })
    }
  };
}

function roleRequirements(jd: JdSnapshot, decision: DecisionRecord): ResumeStrategy["role_requirements"] {
  const competencies = jd.deterministic_analysis.required_competencies.map((requirement, index) => ({
    requirement,
    priority: index + 1,
    source: "jd.deterministic_analysis.required_competencies"
  }));
  const missing = decision.missing_evidence
    .filter((item) => !competencies.some((competency) => normalize(competency.requirement) === normalize(item)))
    .map((requirement, index) => ({
      requirement,
      priority: competencies.length + index + 1,
      source: "decision.missing_evidence"
    }));
  return [...competencies, ...missing];
}

function prioritizedSignals(jd: JdSnapshot): string[] {
  return [
    jd.deterministic_analysis.role,
    jd.deterministic_analysis.seniority,
    jd.deterministic_analysis.function,
    jd.deterministic_analysis.domain,
    ...jd.deterministic_analysis.required_competencies
  ].filter((item) => item && item !== "Unknown");
}

function mapRequirement(requirement: string, evidenceItems: EvidenceItem[]): ResumeStrategy["evidence_to_requirement_mapping"][number] {
  const normalizedRequirement = normalize(requirement);
  const matched = evidenceItems.filter((item) => item.tags.some((tag) => normalizedRequirement.includes(normalize(tag)) || normalize(tag).includes(normalizedRequirement)));
  const verified = matched.filter((item) => item.status === "verified");
  if (verified.length > 0) {
    return {
      requirement,
      status: "evidence-backed",
      evidence_ids: verified.map((item) => item.evidence_id),
      notes: "Verified candidate evidence supports this requirement."
    };
  }
  if (matched.length > 0) {
    return {
      requirement,
      status: "human-review-required",
      evidence_ids: matched.map((item) => item.evidence_id),
      notes: "Candidate evidence exists, but a human reviewer must approve it before resume use."
    };
  }
  return {
    requirement,
    status: "gap",
    evidence_ids: [],
    notes: "No trusted candidate evidence supports this requirement yet."
  };
}

function recommendedSections(
  supported: ResumeStrategy["evidence_to_requirement_mapping"],
  gaps: ResumeStrategy["evidence_to_requirement_mapping"]
): ResumeStrategy["recommended_resume_sections_or_emphasis"] {
  return [
    {
      section: "Headline",
      recommendation: supported[0]
        ? `Use a role-aligned headline anchored in ${supported[0].requirement}.`
        : "Keep headline conservative until evidence gaps are resolved.",
      status: supported[0] ? "evidence-backed" : "gap",
      evidence_ids: supported[0]?.evidence_ids ?? []
    },
    {
      section: "Summary",
      recommendation: "Summarize only verified strengths and keep unresolved requirements out of positive claims.",
      status: gaps.length > 0 ? "human-review-required" : "evidence-backed",
      evidence_ids: supported.flatMap((item) => item.evidence_ids).slice(0, 5)
    },
    {
      section: "Experience",
      recommendation: "Prioritize bullets that directly map to verified role requirements; preserve gaps for review.",
      status: supported.length > 0 ? "evidence-backed" : "gap",
      evidence_ids: supported.flatMap((item) => item.evidence_ids).slice(0, 8)
    },
    {
      section: "Skills",
      recommendation: "List skills only when backed by verified evidence or approved by human review.",
      status: gaps.length > 0 ? "human-review-required" : "evidence-backed",
      evidence_ids: supported.flatMap((item) => item.evidence_ids).slice(0, 8)
    }
  ];
}

function atomicWriteJson(file: string, value: unknown): void {
  mkdirSync(path.dirname(file), { recursive: true });
  if (existsSync(file)) {
    throw new ResumeStrategyError("strategy-conflict", `Refusing to overwrite existing strategy: ${file}`);
  }
  const temp = `${file}.tmp-${process.pid}-${Date.now()}`;
  try {
    writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });
    renameSync(temp, file);
  } catch (error) {
    rmSync(temp, { force: true });
    if ((error as NodeJS.ErrnoException).code === "EEXIST") {
      throw new ResumeStrategyError("strategy-conflict", `Refusing to overwrite existing strategy: ${file}`);
    }
    throw error;
  }
}

function requireSchema(value: { schema_version?: string }, label: string): void {
  if (value.schema_version !== schemaVersion) {
    throw new ResumeStrategyError("unsupported-schema", `Unsupported ${label} schema_version: ${String(value.schema_version)}`);
  }
}

function assertEqual(actual: unknown, expected: unknown, label: string): void {
  if (actual !== expected) {
    throw new ResumeStrategyError("integrity-mismatch", `${label} mismatch: expected ${String(expected)}, got ${String(actual)}`);
  }
}

function assertValidDate(value: string, label: string): void {
  if (Number.isNaN(Date.parse(value))) {
    throw new ResumeStrategyError("invalid-input", `Invalid ${label}: ${value}`);
  }
}

function assertPrivateRoot(root: string, cwd: string): void {
  if (isInside(root, os.tmpdir())) {
    return;
  }
  const normalized = toRelative(cwd, root);
  if (!normalized.startsWith("data/private/")) {
    throw new ResumeStrategyError("unsafe-storage", "Resume strategy records must stay under data/private/ when inside the repository.");
  }
  assertGitIgnores(cwd, `${normalized.replace(/\/$/u, "")}/.resume-strategy-probe`);
}

function assertPrivatePath(file: string, cwd: string, label: string): void {
  if (isInside(file, os.tmpdir())) {
    return;
  }
  const normalized = toRelative(cwd, file);
  if (!normalized.startsWith("data/private/")) {
    throw new ResumeStrategyError("unsafe-storage", `${label} must stay under data/private/ when inside the repository.`);
  }
  assertGitIgnores(cwd, normalized);
}

function assertGitIgnores(cwd: string, relativePath: string): void {
  try {
    execFileSync("git", ["check-ignore", "-q", "--", relativePath], { cwd, stdio: "ignore" });
  } catch {
    throw new ResumeStrategyError("unsafe-storage", `Private path is not ignored by Git: ${relativePath}`);
  }
}

function assertInside(file: string, root: string, label: string): void {
  if (!isInside(file, root)) {
    throw new ResumeStrategyError("unsafe-reference", `${label} must resolve inside the handoff registry root.`);
  }
}

function isInside(file: string, root: string): boolean {
  const relative = path.relative(root, file);
  return Boolean(relative) && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function containsTraversal(reference: string): boolean {
  return reference.split(/[\\/]+/u).some((part) => part === "..");
}

function strategyId(handoff: ResumeHandoff, evidenceHash: string): string {
  return `RSTRAT-${handoff.application_id}-${hash(`${handoff.resume_os_handoff_id}:${evidenceHash}`, 8)}`;
}

function hash(input: string, length: number): string {
  return createHash("sha256").update(input).digest("hex").slice(0, length);
}

function fileHash(file: string): string {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
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

function printHumanSummary(result: StrategyResult): void {
  const label = result.dry_run ? "DRY RUN - no files written" : result.status === "duplicate" ? "DUPLICATE - existing strategy preserved" : "APPLY COMPLETE";
  console.log(label);
  console.log(`Company: ${result.strategy.target.company}`);
  console.log(`Role: ${result.strategy.target.role}`);
  console.log(`Decision: ${result.strategy.decision_state.outcome}`);
  console.log(`Readiness: ${result.strategy.decision_state.readiness_state}`);
  console.log(`Strategy: ${result.output_path}`);
}

function main(): void {
  try {
    const result = runCareerOsResumeStrategy();
    if (process.argv.includes("--format") && process.argv[process.argv.indexOf("--format") + 1] === "json") {
      console.log(JSON.stringify(result, null, 2));
    } else {
      printHumanSummary(result);
    }
  } catch (error) {
    if (error instanceof ResumeStrategyError) {
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
