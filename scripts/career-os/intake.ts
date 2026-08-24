import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

type Stage = "discovered" | "saved" | "withdrawn";
type Status = "active" | "action_required" | "on_hold" | "withdrawn";
type DecisionOutcome = "proceed" | "pause" | "decline";
type IntakeMode = "dry-run" | "apply";

type IntakeCliFlags = {
  input?: string;
  apply?: boolean;
  "dry-run"?: boolean;
  "registry-root"?: string;
  company?: string;
  "role-title"?: string;
  "source-url"?: string;
  "source-reference"?: string;
  "captured-at"?: string;
  owner?: string;
  "candidate-evidence-reference"?: string;
  format?: string;
  now?: string;
};

type NormalizedInput = {
  company: string;
  roleTitle: string;
  jobDescription: string;
  sourceUrl: string | null;
  sourceReference: string;
  capturedAt: string;
  location: string | null;
  employmentType: string | null;
  owner: string;
  candidateEvidenceReference: string | null;
  sourceFile: string;
  inputFormat: "json" | "markdown";
};

type StableIds = {
  contentHash: string;
  sourceIdentityHash: string;
  linkageHash: string;
  companySlug: string;
  roleSlug: string;
  year: string;
  jdSnapshotId: string;
  opportunityId: string;
  applicationId: string;
  decisionId: string;
  handoffId: string;
  jobPostingId: string;
};

type IntakeJobModel = {
  artifactId: string;
  hiringModelId: string;
  evaluationFrameworkId: string;
  role: string;
  seniority: string;
  function: string;
  domain: string;
  location: string;
  employmentType: string;
  requiredCompetencies: Array<{ name: string; required: boolean }>;
  evidenceExpectations: string[];
};

type IntakeDecision = {
  schema_version: "1.0.0";
  decision_id: string;
  outcome: DecisionOutcome;
  reasons: string[];
  evidence_used: string[];
  missing_evidence: string[];
  risks_or_gaps: string[];
  confidence: { status: "not-calculated"; reason: string };
  created_at: string;
  stable_ids: Pick<StableIds, "jdSnapshotId" | "opportunityId" | "applicationId">;
  analyzer_version: "career-os-intake:v1";
};

type ApplicationRecord = {
  application_id: string;
  schema_version: "1.0.0";
  created_at: string;
  updated_at: string;
  company_name: string;
  company_slug: string;
  role_title: string;
  role_level: string | null;
  department: string | null;
  employment_type: string | null;
  work_mode: string | null;
  location: string | null;
  country: string | null;
  relocation_required: boolean | null;
  visa_sponsorship_status: string | null;
  job_url: string | null;
  application_source: string | null;
  referral_source: string | null;
  job_posting_id: string;
  job_discovered_at: string;
  job_closing_date: string | null;
  application_date: string | null;
  current_stage: Stage;
  current_status: Status;
  active: boolean;
  priority: "medium";
  fit_score: null;
  application_channel: string | null;
  jd_snapshot_id: string;
  jd_path: string;
  jd_hash: string;
  resume_snapshot_id: null;
  resume_plan_path: null;
  narrative_output_path: null;
  docx_path: null;
  pdf_path: null;
  export_commit_hash: null;
  resume_version: null;
  role_pack: string | null;
  product_os_modules: string[];
  manual_override_ids: string[];
  response_received: false;
  response_date: null;
  interview_count: 0;
  final_outcome: string | null;
  rejection_stage: null;
  rejection_reason: string | null;
  offer_received: false;
  offer_id: null;
  withdrawal_reason: string | null;
  owner: string;
  next_action: string | null;
  next_action_due_at: null;
  follow_up_status: string | null;
  last_contact_at: null;
  last_activity_at: string;
  tags: string[];
  notes_summary: string;
  confidentiality: "private";
  contains_personal_data: true;
  safe_to_commit: false;
  archived_at: null;
};

type IntakeResult = {
  schema_version: "1.0.0";
  mode: IntakeMode;
  status: "planned" | "created" | "duplicate";
  dry_run: boolean;
  summary: {
    company: string;
    role_title: string;
    decision_outcome: DecisionOutcome;
    application_id: string;
    jd_snapshot_id: string;
    opportunity_id: string;
    resume_handoff_id: string;
  };
  paths: {
    registry_root: string;
    jd_snapshot: string;
    opportunity: string;
    decision: string;
    application: string;
    handoff_manifest: string;
  };
  decision: IntakeDecision;
  analysis: {
    job_model_id: string;
    hiring_model_id: string;
    evaluation_framework_id: string;
    role: string;
    seniority: string;
    function: string;
    domain: string;
    required_competencies: string[];
    evidence_expectations: string[];
  };
  duplicate?: {
    existing_application_id: string;
    reason: string;
  };
};

type RunOptions = {
  argv?: string[];
  cwd?: string;
  now?: string;
  simulateRegistryFailure?: boolean;
  simulateHandoffFailure?: boolean;
};

const MAX_INPUT_BYTES = 200_000;
const credentialPattern = /(password|api[_-]?key|secret|token|private[_-]?key|credential)/i;

export function runCareerOsIntake(options: RunOptions = {}): IntakeResult {
  const cwd = options.cwd ?? process.cwd();
  const flags = parseArgs(options.argv ?? process.argv.slice(2));
  const mode = resolveMode(flags);
  const nowValue = flags.now ?? options.now ?? new Date().toISOString();

  assertValidDate(nowValue, "now");

  if (!flags.input) {
    throw new OperatorError("invalid-input", "--input is required.");
  }

  const inputPath = path.resolve(cwd, flags.input);
  const registryRoot = path.resolve(cwd, flags["registry-root"] ?? path.join("data", "private", "application-registry"));

  assertSafeRegistryRoot(registryRoot, cwd);

  const input = readAndNormalizeInput(inputPath, flags, nowValue, cwd);
  const ids = createStableIds(input);
  const paths = createRegistryPaths(registryRoot, ids);

  const jobModel = analyzeJobDescription(input, ids);
  const decision = createDecision(input, ids, jobModel, nowValue);
  const application = createApplicationRecord(input, ids, decision, jobModel, paths, nowValue, cwd);
  const jdSnapshot = createJdSnapshot(input, ids, jobModel, nowValue);
  const opportunity = createOpportunityRecord(input, ids, jobModel, decision, nowValue);
  const event = createRegistryEvent(application, decision, nowValue);
  const handoff = createResumeHandoff(input, ids, decision, paths, nowValue, cwd);
  const analysis = createAnalysisSummary(jobModel);
  const duplicate = findDuplicate(registryRoot, application);

  if (duplicate && duplicate.jd_hash !== application.jd_hash) {
    throw new OperatorError(
      "duplicate-application",
      `Existing application has the same company, role, and source but a materially different JD: ${duplicate.application_id}.`
    );
  }

  if (duplicate) {
    return createResult({
      mode,
      status: "duplicate",
      input,
      ids,
      paths,
      decision,
      analysis,
      registryRoot,
      duplicate: { existing_application_id: duplicate.application_id, reason: "Identical JD hash already exists." }
    });
  }

  if (mode === "dry-run") {
    return createResult({ mode, status: "planned", input, ids, paths, decision, analysis, registryRoot });
  }

  if (options.simulateRegistryFailure) {
    throw new OperatorError("registry-failure", "Simulated registry failure.");
  }

  applyRecords({
    registryRoot,
    writes: [
      { file: paths.jdSnapshot, value: jdSnapshot },
      { file: paths.opportunity, value: opportunity },
      { file: paths.decision, value: decision },
      { file: paths.application, value: application },
      { file: paths.event, value: event },
      { file: paths.handoff, value: handoff, fail: options.simulateHandoffFailure }
    ]
  });

  return createResult({ mode, status: "created", input, ids, paths, decision, analysis, registryRoot });
}

export class OperatorError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

function parseArgs(argv: string[]): IntakeCliFlags {
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
  return flags as IntakeCliFlags;
}

function resolveMode(flags: IntakeCliFlags): IntakeMode {
  if (flags.apply && flags["dry-run"]) {
    throw new OperatorError("invalid-input", "Use either --apply or --dry-run, not both.");
  }
  if (flags.apply) {
    return "apply";
  }
  if (flags["dry-run"]) {
    return "dry-run";
  }
  throw new OperatorError("invalid-input", "Choose --dry-run or --apply.");
}

function readAndNormalizeInput(inputPath: string, flags: IntakeCliFlags, nowValue: string, cwd: string): NormalizedInput {
  if (!existsSync(inputPath)) {
    throw new OperatorError("input-not-found", `Input file not found: ${inputPath}`);
  }
  const stat = statSync(inputPath);
  if (!stat.isFile()) {
    throw new OperatorError("invalid-input", "Input path must be a file.");
  }
  if (stat.size > MAX_INPUT_BYTES) {
    throw new OperatorError("invalid-input", `Input exceeds safe size limit of ${MAX_INPUT_BYTES} bytes.`);
  }

  const extension = path.extname(inputPath).toLowerCase();
  const raw = readFileSync(inputPath, "utf8");
  if (credentialPattern.test(raw)) {
    throw new OperatorError("invalid-input", "Input contains suspected credential material.");
  }

  if (extension === ".json") {
    return normalizeJsonInput(raw, inputPath, flags, nowValue, cwd);
  }
  if (extension === ".md" || extension === ".markdown") {
    return normalizeMarkdownInput(raw, inputPath, flags, nowValue, cwd);
  }

  throw new OperatorError("unsupported-format", "Unsupported input format. Use .json, .md, or .markdown.");
}

function normalizeJsonInput(raw: string, inputPath: string, flags: IntakeCliFlags, nowValue: string, cwd: string): NormalizedInput {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new OperatorError("invalid-input", "Input JSON is malformed.");
  }

  const company = stringField(parsed, "company", "company_name");
  const roleTitle = stringField(parsed, "roleTitle", "role_title", "title");
  const jobDescription = stringField(parsed, "jobDescription", "job_description", "description");
  const capturedAt = optionalString(parsed, "capturedAt", "captured_at") ?? flags["captured-at"] ?? nowValue;
  const sourceUrl = optionalString(parsed, "sourceUrl", "source_url", "job_url") ?? flags["source-url"] ?? null;
  const sourceReference = optionalString(parsed, "sourceReference", "source_reference", "source") ?? flags["source-reference"] ?? inputReference(inputPath, cwd);

  return validateNormalized({
    company,
    roleTitle,
    jobDescription: normalizeBody(jobDescription),
    sourceUrl,
    sourceReference,
    capturedAt,
    location: optionalString(parsed, "location") ?? null,
    employmentType: optionalString(parsed, "employmentType", "employment_type") ?? null,
    owner: optionalString(parsed, "owner") ?? flags.owner ?? "Saurabh Chawda",
    candidateEvidenceReference: optionalString(parsed, "candidateEvidenceReference", "candidate_evidence_reference") ?? flags["candidate-evidence-reference"] ?? null,
    sourceFile: inputReference(inputPath, cwd),
    inputFormat: "json"
  });
}

function normalizeMarkdownInput(raw: string, inputPath: string, flags: IntakeCliFlags, nowValue: string, cwd: string): NormalizedInput {
  return validateNormalized({
    company: flags.company ?? "",
    roleTitle: flags["role-title"] ?? "",
    jobDescription: normalizeBody(raw),
    sourceUrl: flags["source-url"] ?? null,
    sourceReference: flags["source-reference"] ?? inputReference(inputPath, cwd),
    capturedAt: flags["captured-at"] ?? nowValue,
    location: null,
    employmentType: null,
    owner: flags.owner ?? "Saurabh Chawda",
    candidateEvidenceReference: flags["candidate-evidence-reference"] ?? null,
    sourceFile: inputReference(inputPath, cwd),
    inputFormat: "markdown"
  });
}

function validateNormalized(input: NormalizedInput): NormalizedInput {
  if (!input.company.trim()) {
    throw new OperatorError("invalid-input", "company is required.");
  }
  if (!input.roleTitle.trim()) {
    throw new OperatorError("invalid-input", "role title is required.");
  }
  if (!input.jobDescription.trim()) {
    throw new OperatorError("invalid-input", "job-description text is required.");
  }
  assertValidDate(input.capturedAt, "captured date");
  if (input.sourceUrl) {
    assertValidUrl(input.sourceUrl, "source URL");
  }
  return Object.freeze({
    ...input,
    company: input.company.trim(),
    roleTitle: input.roleTitle.trim(),
    sourceReference: input.sourceReference.trim()
  });
}

function stringField(parsed: Record<string, unknown>, ...keys: string[]): string {
  const value = optionalString(parsed, ...keys);
  return value ?? "";
}

function optionalString(parsed: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = parsed[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function normalizeBody(value: string): string {
  return value.replace(/\r\n/g, "\n").replace(/[ \t]+\n/g, "\n").trim();
}

function assertValidDate(value: string, label: string): void {
  if (Number.isNaN(Date.parse(value))) {
    throw new OperatorError("invalid-input", `Invalid ${label}: ${value}`);
  }
}

function assertValidUrl(value: string, label: string): void {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("invalid protocol");
    }
  } catch {
    throw new OperatorError("invalid-input", `Malformed ${label}: ${value}`);
  }
}

function assertSafeRegistryRoot(registryRoot: string, cwd: string): void {
  const relative = path.relative(cwd, registryRoot);
  const insideRepo = relative && !relative.startsWith("..") && !path.isAbsolute(relative);
  const tempRelative = path.relative(os.tmpdir(), registryRoot);
  const insideTemp = tempRelative && !tempRelative.startsWith("..") && !path.isAbsolute(tempRelative);

  if (insideTemp) {
    return;
  }

  if (!insideRepo) {
    throw new OperatorError("unsafe-storage", "Registry root must be inside the repository private data path or the system temporary directory.");
  }

  const normalized = relative.replace(/\\/g, "/");
  if (!normalized.startsWith("data/private/")) {
    throw new OperatorError("unsafe-storage", "Registry root must be under data/private/ when inside the repository.");
  }

  assertGitIgnoresPrivateDestination(cwd, normalized);
}

function assertGitIgnoresPrivateDestination(cwd: string, normalizedRegistryRoot: string): void {
  const probePath = `${normalizedRegistryRoot.replace(/\/$/u, "")}/.career-os-intake-probe`;
  try {
    execFileSync("git", ["check-ignore", "-q", "--", probePath], { cwd, stdio: "ignore" });
  } catch {
    throw new OperatorError("unsafe-storage", `Private registry path is not ignored by Git: ${normalizedRegistryRoot}`);
  }
}

function createStableIds(input: NormalizedInput): StableIds {
  const contentHash = hash(`${input.company}\n${input.roleTitle}\n${input.sourceUrl ?? ""}\n${input.jobDescription}`, 12);
  const sourceIdentityHash = hash(input.sourceUrl ?? input.sourceReference, 8);
  const linkageHash = hash(`${sourceIdentityHash}\n${contentHash}`, 8);
  const companySlug = slug(input.company);
  const roleSlug = slug(input.roleTitle);
  const year = new Date(input.capturedAt).getUTCFullYear().toString();
  return {
    contentHash,
    sourceIdentityHash,
    linkageHash,
    companySlug,
    roleSlug,
    year,
    jdSnapshotId: `JD-${year}-${contentHash}`,
    opportunityId: `OPP-${year}-${linkageHash}`,
    applicationId: `APP-${companySlug}-${roleSlug}-${sourceIdentityHash}`,
    decisionId: `DEC-${year}-${linkageHash}`,
    handoffId: `HANDOFF-${year}-${linkageHash}`,
    jobPostingId: sourceIdentityHash
  };
}

function createRegistryPaths(registryRoot: string, ids: StableIds) {
  return {
    jdSnapshot: path.join(registryRoot, "jd-snapshots", `${ids.jdSnapshotId}.json`),
    opportunity: path.join(registryRoot, "opportunities", `${ids.opportunityId}.json`),
    decision: path.join(registryRoot, "decisions", `${ids.decisionId}.json`),
    application: path.join(registryRoot, "applications", `${ids.applicationId}.json`),
    event: path.join(registryRoot, "events", `${ids.applicationId}.EVT-${ids.linkageHash}.json`),
    handoff: path.join(registryRoot, "resume-handoffs", `${ids.handoffId}.json`)
  };
}

function analyzeJobDescription(input: NormalizedInput, ids: StableIds): IntakeJobModel {
  const text = normalizeForSignals(`${input.roleTitle}\n${input.jobDescription}`);
  const competencies = [
    ["Product Strategy", ["strategy", "market", "roadmap"], true],
    ["Execution", ["execute", "execution", "delivery", "launch"], true],
    ["Analytics", ["data", "metric", "metrics", "analytics", "experiment"], true],
    ["Customer Discovery", ["customer", "research", "user", "discovery"], true],
    ["Platform Thinking", ["platform", "api", "architecture"], false],
    ["AI Product Management", ["ai", "llm", "machine learning", "model"], false],
    ["Leadership", ["lead", "mentor", "stakeholder", "cross-functional"], false]
  ] as const;
  const requiredCompetencies = competencies
    .filter(([, signals]) => signals.some((signal) => text.includes(signal)))
    .map(([name, , required]) => ({ name, required }));
  const selectedCompetencies = requiredCompetencies.length > 0 ? requiredCompetencies : competencies.slice(0, 2).map(([name, , required]) => ({ name, required }));

  return {
    artifactId: `job-model:${ids.jdSnapshotId}`,
    hiringModelId: `hiring-model:${ids.jdSnapshotId}`,
    evaluationFrameworkId: `evaluation-framework:${ids.jdSnapshotId}`,
    role: classify(text, [
      ["ProductLeader", ["head of product", "director product", "vp product", "product lead", "lead product", "lead ai", "group product manager"]],
      ["ProductManager", ["product manager", "pm", "product owner", "product management"]],
      ["ProgramManager", ["program manager", "technical program", "tpm", "program management"]],
      ["ProductOperations", ["product operations", "product ops", "operating model"]]
    ]),
    seniority: classify(text, [
      ["Executive", ["chief product", "cpo", "vp product"]],
      ["Director", ["director"]],
      ["Principal", ["principal"]],
      ["Lead", ["lead", "group product manager"]],
      ["Senior", ["senior", "sr."]],
      ["MidLevel", ["product manager", "pm"]]
    ]),
    function: classify(text, [
      ["Platform", ["platform", "api", "infrastructure", "architecture"]],
      ["Growth", ["growth", "activation", "conversion", "retention"]],
      ["DataProduct", ["data", "analytics", "metric"]],
      ["TechnicalProduct", ["technical", "engineering", "system"]],
      ["ProductManagement", ["product", "roadmap", "strategy"]]
    ]),
    domain: classify(text, [
      ["AI", ["ai", "llm", "machine learning", "model"]],
      ["Payments", ["payment", "payments", "wallet", "fintech", "transaction"]],
      ["SaaS", ["saas", "enterprise", "workflow"]],
      ["Enterprise", ["enterprise", "b2b"]],
      ["Marketplace", ["marketplace"]],
      ["Consumer", ["consumer", "mobile"]]
    ]),
    location: input.location ?? classify(text, [
      ["Mixed", ["hybrid remote"]],
      ["Remote", ["remote"]],
      ["Hybrid", ["hybrid"]],
      ["OnSite", ["onsite", "on-site", "office"]]
    ]),
    employmentType: input.employmentType ?? classify(text, [
      ["Contract", ["contract", "contractor"]],
      ["Internship", ["intern", "internship"]],
      ["PartTime", ["part-time", "part time"]],
      ["FullTime", ["full-time", "full time"]]
    ]),
    requiredCompetencies: selectedCompetencies,
    evidenceExpectations: selectedCompetencies.map((competency) => `Evidence should demonstrate ${competency.name}.`)
  };
}

function classify(text: string, options: Array<[string, string[]]>): string {
  const matched = options
    .map(([label, signals]) => ({ label, score: signals.filter((signal) => text.includes(signal)).length }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score || left.label.localeCompare(right.label));
  return matched[0]?.label ?? "Unknown";
}

function normalizeForSignals(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9+#.\s-]/gu, " ").replace(/\s+/gu, " ").trim();
}

function createDecision(input: NormalizedInput, ids: StableIds, jobModel: IntakeJobModel, nowValue: string): IntakeDecision {
  const risks = [
    ...(jobModel.role === "Unknown" ? ["Role classification is unknown."] : []),
    ...(jobModel.requiredCompetencies.length === 0 ? ["No role competencies were detected from the JD."] : []),
    ...(input.candidateEvidenceReference ? ["Candidate evidence reference was supplied but not validated by a trusted evidence contract."] : [])
  ];

  if (jobModel.role === "Unknown" || jobModel.requiredCompetencies.length === 0) {
    return {
      schema_version: "1.0.0",
      decision_id: ids.decisionId,
      outcome: "decline",
      reasons: ["The JD does not contain enough deterministic role signal to justify pursuing this opportunity."],
      evidence_used: [],
      missing_evidence: jobModel.evidenceExpectations,
      risks_or_gaps: risks,
      confidence: { status: "not-calculated", reason: "COS-2 does not calculate numerical candidate fit." },
      created_at: nowValue,
      stable_ids: pickStableIds(ids),
      analyzer_version: "career-os-intake:v1"
    };
  }

  return {
    schema_version: "1.0.0",
    decision_id: ids.decisionId,
    outcome: "pause",
    reasons: [
      input.candidateEvidenceReference
        ? "Candidate evidence reference was supplied, but COS-2 cannot load and validate it yet, so Career OS cannot honestly produce a proceed decision."
        : "Candidate evidence reference was not supplied, so Career OS cannot honestly produce a positive fit decision."
    ],
    evidence_used: [],
    missing_evidence: jobModel.evidenceExpectations,
    risks_or_gaps: risks,
    confidence: { status: "not-calculated", reason: "No trusted production candidate evidence was validated." },
    created_at: nowValue,
    stable_ids: pickStableIds(ids),
    analyzer_version: "career-os-intake:v1"
  };
}

function createApplicationRecord(
  input: NormalizedInput,
  ids: StableIds,
  decision: IntakeDecision,
  jobModel: IntakeJobModel,
  paths: ReturnType<typeof createRegistryPaths>,
  nowValue: string,
  cwd: string
): ApplicationRecord {
  const statusByOutcome: Record<DecisionOutcome, Status> = {
    proceed: "action_required",
    pause: "on_hold",
    decline: "withdrawn"
  };
  const stageByOutcome: Record<DecisionOutcome, Stage> = {
    proceed: "saved",
    pause: "saved",
    decline: "withdrawn"
  };
  return {
    application_id: ids.applicationId,
    schema_version: "1.0.0",
    created_at: nowValue,
    updated_at: nowValue,
    company_name: input.company,
    company_slug: ids.companySlug,
    role_title: input.roleTitle,
    role_level: jobModel.seniority === "Unknown" ? null : jobModel.seniority,
    department: null,
    employment_type: input.employmentType ?? (jobModel.employmentType === "Unknown" ? null : jobModel.employmentType),
    work_mode: jobModel.location === "Unknown" ? null : jobModel.location,
    location: input.location,
    country: null,
    relocation_required: null,
    visa_sponsorship_status: null,
    job_url: input.sourceUrl,
    application_source: input.sourceUrl ? "job_url" : "local_file",
    referral_source: null,
    job_posting_id: ids.jobPostingId,
    job_discovered_at: toDate(input.capturedAt),
    job_closing_date: null,
    application_date: null,
    current_stage: stageByOutcome[decision.outcome],
    current_status: statusByOutcome[decision.outcome],
    active: decision.outcome !== "decline",
    priority: "medium",
    fit_score: null,
    application_channel: null,
    jd_snapshot_id: ids.jdSnapshotId,
    jd_path: toRelative(cwd, paths.jdSnapshot),
    jd_hash: ids.contentHash,
    resume_snapshot_id: null,
    resume_plan_path: null,
    narrative_output_path: null,
    docx_path: null,
    pdf_path: null,
    export_commit_hash: null,
    resume_version: null,
    role_pack: createRolePack(jobModel),
    product_os_modules: [],
    manual_override_ids: [],
    response_received: false,
    response_date: null,
    interview_count: 0,
    final_outcome: decision.outcome === "decline" ? "declined_at_intake" : null,
    rejection_stage: null,
    rejection_reason: decision.outcome === "decline" ? decision.reasons.join(" ") : null,
    offer_received: false,
    offer_id: null,
    withdrawal_reason: decision.outcome === "decline" ? "Declined during Career OS intake decision." : null,
    owner: input.owner,
    next_action: decision.outcome === "proceed" ? "prepare_resume_os_handoff" : decision.outcome === "pause" ? "supply_candidate_evidence" : null,
    next_action_due_at: null,
    follow_up_status: decision.outcome === "proceed" ? "resume_os_handoff_ready" : decision.outcome === "pause" ? "paused_before_resume_generation" : "closed_before_submission",
    last_contact_at: null,
    last_activity_at: nowValue,
    tags: ["career-os-intake", createRolePack(jobModel)].filter(Boolean),
    notes_summary: `COS-2 intake decision: ${decision.outcome}. ${decision.reasons[0]}`,
    confidentiality: "private",
    contains_personal_data: true,
    safe_to_commit: false,
    archived_at: null
  };
}

function createJdSnapshot(input: NormalizedInput, ids: StableIds, jobModel: IntakeJobModel, nowValue: string) {
  return {
    schema_version: "1.0.0",
    jd_snapshot_id: ids.jdSnapshotId,
    immutable: true,
    content_hash: ids.contentHash,
    source_identity_hash: ids.sourceIdentityHash,
    linkage_hash: ids.linkageHash,
    source_reference: input.sourceReference,
    source_url: input.sourceUrl,
    source_file: input.sourceFile,
    captured_at: input.capturedAt,
    created_at: nowValue,
    company_name: input.company,
    role_title: input.roleTitle,
    location: input.location,
    employment_type: input.employmentType,
    normalized_jd_text: input.jobDescription,
    deterministic_analysis: {
      job_model_id: jobModel.artifactId,
      role: jobModel.role,
      seniority: jobModel.seniority,
      function: jobModel.function,
      domain: jobModel.domain,
      required_competencies: jobModel.requiredCompetencies.map((competency) => competency.name),
      evidence_expectations: jobModel.evidenceExpectations
    }
  };
}

function createOpportunityRecord(
  input: NormalizedInput,
  ids: StableIds,
  jobModel: IntakeJobModel,
  decision: IntakeDecision,
  nowValue: string
) {
  return {
    schema_version: "1.0.0",
    opportunity_id: ids.opportunityId,
    created_at: nowValue,
    company_name: input.company,
    role_title: input.roleTitle,
    jd_snapshot_id: ids.jdSnapshotId,
    decision_id: decision.decision_id,
    decision_outcome: decision.outcome,
    job_model_id: jobModel.artifactId,
    hiring_model_id: jobModel.hiringModelId,
    evaluation_framework_id: jobModel.evaluationFrameworkId,
    status: decision.outcome === "proceed" ? "qualified_for_resume_handoff" : decision.outcome === "pause" ? "paused_for_evidence" : "declined_at_intake",
    reasons: decision.reasons,
    missing_evidence: decision.missing_evidence,
    risks_or_gaps: decision.risks_or_gaps
  };
}

function createRegistryEvent(application: ApplicationRecord, decision: IntakeDecision, nowValue: string) {
  return {
    event_id: `EVT-${hash(`${application.application_id}-${decision.decision_id}`, 8)}`,
    application_id: application.application_id,
    event_type: "career_os_intake_completed",
    occurred_at: nowValue,
    recorded_at: nowValue,
    previous_value: null,
    new_value: {
      current_stage: application.current_stage,
      current_status: application.current_status,
      decision_outcome: decision.outcome
    },
    reason: "Career OS intake created the private application record.",
    source: "career-os:intake",
    actor: application.owner,
    metadata: {
      decision_id: decision.decision_id,
      jd_snapshot_id: application.jd_snapshot_id
    },
    schema_version: "1.0.0"
  };
}

function createResumeHandoff(
  input: NormalizedInput,
  ids: StableIds,
  decision: IntakeDecision,
  paths: ReturnType<typeof createRegistryPaths>,
  nowValue: string,
  cwd: string
) {
  return {
    schema_version: "1.0.0",
    resume_os_handoff_id: ids.handoffId,
    generated_at: nowValue,
    application_id: ids.applicationId,
    opportunity_id: ids.opportunityId,
    jd_snapshot_id: ids.jdSnapshotId,
    normalized_role: input.roleTitle,
    normalized_company: input.company,
    decision_outcome: decision.outcome,
    fit_qualification_artifact_references: {
      decision_path: toRelative(cwd, paths.decision),
      opportunity_path: toRelative(cwd, paths.opportunity),
      jd_snapshot_path: toRelative(cwd, paths.jdSnapshot)
    },
    candidate_evidence_reference: input.candidateEvidenceReference,
    requested_next_workflow_stage: decision.outcome === "proceed" ? "resume_strategy" : "human_evidence_review",
    output_location: toRelative(cwd, paths.handoff),
    integrity: {
      jd_content_hash: ids.contentHash,
      source_identity_hash: ids.sourceIdentityHash,
      linkage_hash: ids.linkageHash
    },
    limitations: ["No resume content, DOCX, PDF, or application submission is generated by COS-2."]
  };
}

function createAnalysisSummary(jobModel: IntakeJobModel): IntakeResult["analysis"] {
  return {
    job_model_id: jobModel.artifactId,
    hiring_model_id: jobModel.hiringModelId,
    evaluation_framework_id: jobModel.evaluationFrameworkId,
    role: jobModel.role,
    seniority: jobModel.seniority,
    function: jobModel.function,
    domain: jobModel.domain,
    required_competencies: jobModel.requiredCompetencies.map((competency) => competency.name),
    evidence_expectations: jobModel.evidenceExpectations
  };
}

function applyRecords(input: { registryRoot: string; writes: Array<{ file: string; value: unknown; fail?: boolean }> }): void {
  ensureRegistryDirectories(input.registryRoot);
  const written: string[] = [];
  try {
    for (const write of input.writes) {
      if (write.fail) {
        throw new OperatorError("handoff-failure", "Simulated handoff write failure.");
      }
      atomicWriteJson(write.file, write.value);
      written.push(write.file);
    }
  } catch (error) {
    for (const file of written.reverse()) {
      rmSync(file, { force: true });
    }
    throw error;
  }
}

function ensureRegistryDirectories(registryRoot: string): void {
  for (const dir of ["applications", "contacts", "events", "tasks", "notes", "indexes", "archive", "jd-snapshots", "opportunities", "decisions", "resume-handoffs"]) {
    mkdirSync(path.join(registryRoot, dir), { recursive: true });
  }
  const config = path.join(registryRoot, "registry-config.json");
  if (!existsSync(config)) {
    atomicWriteJson(config, {
      schema_version: "1.0.0",
      private_registry_root: "data/private/application-registry",
      lifecycle_stages: ["discovered", "saved", "resume_generated", "human_reviewed", "ready_to_apply", "applied", "recruiter_viewed", "recruiter_contact", "recruiter_screen", "online_assessment", "hiring_manager_interview", "product_interview", "technical_interview", "system_design", "case_study", "panel_interview", "final_round", "offer", "accepted", "rejected", "withdrawn", "closed"],
      lifecycle_statuses: ["active", "waiting", "action_required", "on_hold", "successful", "unsuccessful", "withdrawn", "archived"],
      privacy_policy: "private-local-first"
    });
  }
}

function atomicWriteJson(file: string, value: unknown): void {
  mkdirSync(path.dirname(file), { recursive: true });
  if (existsSync(file)) {
    throw new OperatorError("duplicate-application", `Refusing to overwrite existing record: ${file}`);
  }
  const temp = `${file}.tmp-${process.pid}-${Date.now()}`;
  try {
    writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });
    renameSync(temp, file);
  } catch (error) {
    rmSync(temp, { force: true });
    if ((error as NodeJS.ErrnoException).code === "EEXIST") {
      throw new OperatorError("duplicate-application", `Refusing to overwrite existing record: ${file}`);
    }
    throw error;
  }
}

function findDuplicate(registryRoot: string, application: ApplicationRecord): ApplicationRecord | null {
  const appDir = path.join(registryRoot, "applications");
  if (!existsSync(appDir)) {
    return null;
  }
  for (const file of readdirSync(appDir).filter((entry) => entry.endsWith(".json"))) {
    const current = JSON.parse(readFileSync(path.join(appDir, file), "utf8")) as ApplicationRecord;
    const sameIdentity =
      current.application_id === application.application_id ||
      (current.company_slug === application.company_slug &&
        current.role_title === application.role_title &&
        current.job_posting_id === application.job_posting_id);
    if (sameIdentity) {
      return current;
    }
  }
  return null;
}

function createResult(input: {
  mode: IntakeMode;
  status: IntakeResult["status"];
  input: NormalizedInput;
  ids: StableIds;
  paths: ReturnType<typeof createRegistryPaths>;
  decision: IntakeDecision;
  analysis: IntakeResult["analysis"];
  registryRoot: string;
  duplicate?: IntakeResult["duplicate"];
}): IntakeResult {
  return {
    schema_version: "1.0.0",
    mode: input.mode,
    status: input.status,
    dry_run: input.mode === "dry-run",
    summary: {
      company: input.input.company,
      role_title: input.input.roleTitle,
      decision_outcome: input.decision.outcome,
      application_id: input.ids.applicationId,
      jd_snapshot_id: input.ids.jdSnapshotId,
      opportunity_id: input.ids.opportunityId,
      resume_handoff_id: input.ids.handoffId
    },
    paths: {
      registry_root: input.registryRoot,
      jd_snapshot: input.paths.jdSnapshot,
      opportunity: input.paths.opportunity,
      decision: input.paths.decision,
      application: input.paths.application,
      handoff_manifest: input.paths.handoff
    },
    decision: input.decision,
    analysis: input.analysis,
    duplicate: input.duplicate
  };
}

function pickStableIds(ids: StableIds) {
  return {
    jdSnapshotId: ids.jdSnapshotId,
    opportunityId: ids.opportunityId,
    applicationId: ids.applicationId
  };
}

function createRolePack(jobModel: IntakeJobModel): string {
  if (jobModel.domain !== "Unknown") {
    return slug(jobModel.domain);
  }
  if (jobModel.function !== "Unknown") {
    return slug(jobModel.function);
  }
  return "unknown";
}

function toDate(value: string): string {
  return new Date(value).toISOString().slice(0, 10);
}

function slug(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unknown";
}

function hash(input: string, length: number): string {
  return createHash("sha256").update(input).digest("hex").slice(0, length);
}

function inputReference(inputPath: string, cwd: string): string {
  const relative = path.relative(cwd, inputPath);
  if (relative && !relative.startsWith("..") && !path.isAbsolute(relative)) {
    return relative.replace(/\\/g, "/");
  }
  return path.basename(inputPath);
}

function toRelative(cwd: string, file: string): string {
  const relative = path.relative(cwd, file);
  if (relative && !relative.startsWith("..") && !path.isAbsolute(relative)) {
    return relative.replace(/\\/g, "/");
  }
  return file;
}

function printHumanSummary(result: IntakeResult): void {
  const label = result.dry_run ? "DRY RUN - no files written" : result.status === "duplicate" ? "DUPLICATE - no new files written" : "APPLY COMPLETE";
  console.log(label);
  console.log(`Company: ${result.summary.company}`);
  console.log(`Role: ${result.summary.role_title}`);
  console.log(`Decision: ${result.summary.decision_outcome}`);
  console.log(`Application ID: ${result.summary.application_id}`);
  console.log(`JD Snapshot ID: ${result.summary.jd_snapshot_id}`);
  console.log(`Opportunity ID: ${result.summary.opportunity_id}`);
  console.log(`Resume OS Handoff: ${result.paths.handoff_manifest}`);
  if (result.duplicate) {
    console.log(`Existing Application: ${result.duplicate.existing_application_id}`);
  }
}

function main(): void {
  try {
    const result = runCareerOsIntake();
    if (process.argv.includes("--format") && process.argv[process.argv.indexOf("--format") + 1] === "json") {
      console.log(JSON.stringify(result, null, 2));
    } else {
      printHumanSummary(result);
    }
  } catch (error) {
    if (error instanceof OperatorError) {
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
