import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

type Stage =
  | "discovered" | "saved" | "resume_generated" | "human_reviewed" | "ready_to_apply" | "applied"
  | "recruiter_viewed" | "recruiter_contact" | "recruiter_screen" | "online_assessment"
  | "hiring_manager_interview" | "product_interview" | "technical_interview" | "system_design"
  | "case_study" | "panel_interview" | "final_round" | "offer" | "accepted" | "rejected"
  | "withdrawn" | "closed";

type Status = "active" | "waiting" | "action_required" | "on_hold" | "successful" | "unsuccessful" | "withdrawn" | "archived";

type ApplicationRecord = {
  application_id: string;
  schema_version: string;
  created_at: string;
  updated_at: string;
  company_name: string;
  company_slug: string;
  role_title: string;
  role_level?: string | null;
  department?: string | null;
  employment_type?: string | null;
  work_mode?: string | null;
  location?: string | null;
  country?: string | null;
  relocation_required?: boolean | null;
  visa_sponsorship_status?: string | null;
  job_url?: string | null;
  application_source?: string | null;
  referral_source?: string | null;
  job_posting_id?: string | null;
  job_discovered_at?: string | null;
  job_closing_date?: string | null;
  application_date?: string | null;
  current_stage: Stage;
  current_status: Status;
  active: boolean;
  priority: "low" | "medium" | "high" | "urgent";
  fit_score?: number | null;
  application_channel?: string | null;
  jd_snapshot_id?: string | null;
  jd_path?: string | null;
  jd_hash?: string | null;
  resume_snapshot_id?: string | null;
  resume_plan_path?: string | null;
  narrative_output_path?: string | null;
  docx_path?: string | null;
  pdf_path?: string | null;
  export_commit_hash?: string | null;
  resume_version?: string | null;
  role_pack?: string | null;
  product_os_modules: string[];
  manual_override_ids: string[];
  response_received: boolean;
  response_date?: string | null;
  interview_count: number;
  final_outcome?: string | null;
  rejection_stage?: string | null;
  rejection_reason?: string | null;
  offer_received: boolean;
  offer_id?: string | null;
  withdrawal_reason?: string | null;
  owner: string;
  next_action?: string | null;
  next_action_due_at?: string | null;
  follow_up_status?: string | null;
  last_contact_at?: string | null;
  last_activity_at: string;
  tags: string[];
  notes_summary?: string | null;
  confidentiality: "private" | "sanitized" | "public-fixture";
  contains_personal_data: boolean;
  safe_to_commit: boolean;
  archived_at?: string | null;
};

type RegistryEvent = {
  event_id: string;
  application_id: string;
  event_type: string;
  occurred_at: string;
  recorded_at: string;
  previous_value?: unknown;
  new_value?: unknown;
  reason: string;
  source: string;
  actor: string;
  metadata: Record<string, unknown>;
  schema_version: string;
};

type ContactRecord = {
  contact_id: string;
  full_name: string;
  role?: string | null;
  company?: string | null;
  relationship_type: string;
  email?: string | null;
  linkedin_url?: string | null;
  source?: string | null;
  first_contact_at?: string | null;
  last_contact_at?: string | null;
  related_application_ids: string[];
  notes?: string | null;
  follow_up_allowed: boolean;
  confidentiality: "private" | "sanitized" | "public-fixture";
  safe_to_commit: boolean;
  schema_version: string;
  created_at: string;
  updated_at: string;
};

type TaskRecord = {
  task_id: string;
  application_id?: string | null;
  contact_id?: string | null;
  task_type: string;
  title: string;
  description?: string | null;
  due_at?: string | null;
  completed_at?: string | null;
  status: "open" | "completed" | "cancelled" | "overdue";
  priority: "low" | "medium" | "high" | "urgent";
  source: string;
  recurrence?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  schema_version: string;
};

const root = process.cwd();
const privateRoot = path.join(root, "data", "private", "application-registry");
const docsRoot = path.join(root, "docs", "application-registry");
const fixtureRoot = path.join(docsRoot, "fixtures", "synthetic-registry");
const appDirs = ["applications", "contacts", "events", "tasks", "notes", "indexes", "archive"] as const;
const stages: Stage[] = ["discovered", "saved", "resume_generated", "human_reviewed", "ready_to_apply", "applied", "recruiter_viewed", "recruiter_contact", "recruiter_screen", "online_assessment", "hiring_manager_interview", "product_interview", "technical_interview", "system_design", "case_study", "panel_interview", "final_round", "offer", "accepted", "rejected", "withdrawn", "closed"];
const terminalStages = new Set<Stage>(["accepted", "rejected", "withdrawn", "closed"]);
const statuses: Status[] = ["active", "waiting", "action_required", "on_hold", "successful", "unsuccessful", "withdrawn", "archived"];
const credentialPattern = /(password|api[_-]?key|secret|token|private[_-]?key|credential)/i;

function now(): string {
  return "2026-07-18T00:00:00+05:30";
}

function today(): string {
  return "2026-07-18";
}

function slug(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unknown";
}

function hash(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex").slice(0, 12);
}

function parseArgs(argv = process.argv.slice(2)): { command: string; flags: Record<string, string | boolean> } {
  const [command = "help", ...rest] = argv;
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < rest.length; i += 1) {
    const token = rest[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = rest[i + 1];
    if (!next || next.startsWith("--")) {
      flags[key] = true;
    } else {
      flags[key] = next;
      i += 1;
    }
  }
  return { command, flags };
}

function json<T>(file: string): T {
  return JSON.parse(readFileSync(file, "utf8")) as T;
}

function writeJson(file: string, value: unknown): void {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function registryPath(kind: (typeof appDirs)[number], id?: string, base = privateRoot): string {
  return path.join(base, kind, id ? `${id}.json` : "");
}

function ensureInitialized(base = privateRoot): void {
  mkdirSync(base, { recursive: true });
  for (const dir of appDirs) mkdirSync(path.join(base, dir), { recursive: true });
  const config = path.join(base, "registry-config.json");
  if (!existsSync(config)) {
    writeJson(config, {
      schema_version: "1.0.0",
      private_registry_root: "data/private/application-registry",
      default_timezone: "Asia/Calcutta",
      default_currency: "USD",
      lifecycle_stages: stages,
      lifecycle_statuses: statuses,
      priority_values: ["low", "medium", "high", "urgent"],
      follow_up_defaults: { applied_no_response_days: 10, interview_no_update_days: 5, offer_open_days: 7, inactive_days: 21 },
      stale_application_thresholds: { applied_no_response_days: 10, interview_no_update_days: 5, offer_open_days: 7, inactive_days: 21 },
      allowed_tags: ["ai-pm", "platform", "payments", "growth", "marketplace", "enterprise-saas", "referral", "priority"],
      archive_policy: "terminal-or-explicit-abandoned-only",
      privacy_policy: "private-local-first",
      analytics_inclusion_rules: { exclude_stages: ["discovered", "saved"], avoid_reopened_double_counting: true },
    });
  }
}

function gitignoreCoversPrivate(): boolean {
  const file = path.join(root, ".gitignore");
  const body = existsSync(file) ? readFileSync(file, "utf8") : "";
  return body.includes("data/private/application-registry/");
}

function listJson<T>(dir: string): T[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((name) => name.endsWith(".json")).map((name) => json<T>(path.join(dir, name)));
}

function loadApplication(id: string, base = privateRoot): ApplicationRecord {
  const file = registryPath("applications", id, base);
  if (!existsSync(file)) throw new Error(`Application not found: ${id}`);
  return json<ApplicationRecord>(file);
}

function saveApplication(record: ApplicationRecord, base = privateRoot): void {
  writeJson(registryPath("applications", record.application_id, base), record);
}

function eventFile(event: RegistryEvent, base = privateRoot): string {
  return path.join(base, "events", `${event.application_id}.${event.event_id}.json`);
}

function appendEvent(applicationId: string, eventType: string, reason: string, previousValue: unknown, newValue: unknown, metadata: Record<string, unknown> = {}, base = privateRoot): RegistryEvent {
  const event: RegistryEvent = {
    event_id: `EVT-${hash(`${applicationId}-${eventType}-${reason}-${JSON.stringify(newValue)}-${Date.now()}`)}`,
    application_id: applicationId,
    event_type: eventType,
    occurred_at: String(metadata.occurred_at ?? now()),
    recorded_at: now(),
    previous_value: previousValue,
    new_value: newValue,
    reason,
    source: String(metadata.source ?? "application-registry-cli"),
    actor: String(metadata.actor ?? "Saurabh Chawda"),
    metadata,
    schema_version: "1.0.0",
  };
  writeJson(eventFile(event, base), event);
  return event;
}

function normalizeApplication(input: Partial<ApplicationRecord>): ApplicationRecord {
  const company = String(input.company_name ?? "");
  const role = String(input.role_title ?? "");
  if (!company || !role) throw new Error("company_name and role_title are required.");
  const companySlug = input.company_slug ?? slug(company);
  const posting = input.job_posting_id ?? hash(`${company}-${role}-${input.job_url ?? "no-url"}`).slice(0, 8);
  const id = input.application_id ?? `APP-${companySlug}-${slug(role)}-${posting}`;
  const created = input.created_at ?? now();
  const stage = (input.current_stage ?? "discovered") as Stage;
  const status = (input.current_status ?? "active") as Status;
  return {
    application_id: id,
    schema_version: input.schema_version ?? "1.0.0",
    created_at: created,
    updated_at: input.updated_at ?? created,
    company_name: company,
    company_slug: companySlug,
    role_title: role,
    role_level: input.role_level ?? null,
    department: input.department ?? null,
    employment_type: input.employment_type ?? "Full-time",
    work_mode: input.work_mode ?? null,
    location: input.location ?? null,
    country: input.country ?? null,
    relocation_required: input.relocation_required ?? null,
    visa_sponsorship_status: input.visa_sponsorship_status ?? null,
    job_url: input.job_url ?? null,
    application_source: input.application_source ?? null,
    referral_source: input.referral_source ?? null,
    job_posting_id: posting,
    job_discovered_at: input.job_discovered_at ?? today(),
    job_closing_date: input.job_closing_date ?? null,
    application_date: input.application_date ?? null,
    current_stage: stage,
    current_status: status,
    active: input.active ?? !terminalStages.has(stage),
    priority: input.priority ?? "medium",
    fit_score: input.fit_score ?? null,
    application_channel: input.application_channel ?? null,
    jd_snapshot_id: input.jd_snapshot_id ?? null,
    jd_path: input.jd_path ?? null,
    jd_hash: input.jd_hash ?? null,
    resume_snapshot_id: input.resume_snapshot_id ?? null,
    resume_plan_path: input.resume_plan_path ?? null,
    narrative_output_path: input.narrative_output_path ?? null,
    docx_path: input.docx_path ?? null,
    pdf_path: input.pdf_path ?? null,
    export_commit_hash: input.export_commit_hash ?? null,
    resume_version: input.resume_version ?? null,
    role_pack: input.role_pack ?? null,
    product_os_modules: input.product_os_modules ?? [],
    manual_override_ids: input.manual_override_ids ?? [],
    response_received: input.response_received ?? false,
    response_date: input.response_date ?? null,
    interview_count: input.interview_count ?? 0,
    final_outcome: input.final_outcome ?? null,
    rejection_stage: input.rejection_stage ?? null,
    rejection_reason: input.rejection_reason ?? null,
    offer_received: input.offer_received ?? false,
    offer_id: input.offer_id ?? null,
    withdrawal_reason: input.withdrawal_reason ?? null,
    owner: input.owner ?? "Saurabh Chawda",
    next_action: input.next_action ?? null,
    next_action_due_at: input.next_action_due_at ?? null,
    follow_up_status: input.follow_up_status ?? null,
    last_contact_at: input.last_contact_at ?? null,
    last_activity_at: input.last_activity_at ?? created,
    tags: input.tags ?? [],
    notes_summary: input.notes_summary ?? null,
    confidentiality: input.confidentiality ?? "private",
    contains_personal_data: input.contains_personal_data ?? true,
    safe_to_commit: input.safe_to_commit ?? false,
    archived_at: input.archived_at ?? null,
  };
}

function validateTransition(from: Stage, to: Stage, reason?: string): string[] {
  const failures: string[] = [];
  if (!stages.includes(to)) failures.push(`Invalid stage: ${to}`);
  if (terminalStages.has(from) && !["recruiter_contact", "applied", "saved"].includes(to) && from !== to) {
    failures.push(`Reopening from ${from} requires transition to recruiter_contact, applied, or saved.`);
  }
  if (stages.indexOf(to) < stages.indexOf(from) && !terminalStages.has(from)) {
    failures.push(`Backward transition from ${from} to ${to} rejected.`);
  }
  if (from !== to && !reason) failures.push("Transition reason is required.");
  return failures;
}

function applyStage(record: ApplicationRecord, stage: Stage, status?: Status): ApplicationRecord {
  const next = { ...record, current_stage: stage, updated_at: now(), last_activity_at: now() };
  if (status) next.current_status = status;
  if (stage === "applied" && !next.application_date) next.application_date = today();
  if (["recruiter_contact", "recruiter_screen", "hiring_manager_interview", "product_interview", "technical_interview", "system_design", "case_study", "panel_interview", "final_round"].includes(stage)) {
    next.response_received = true;
    next.response_date = next.response_date ?? today();
    if (stage.includes("interview") || ["system_design", "case_study", "panel_interview", "final_round"].includes(stage)) next.interview_count = Math.max(1, next.interview_count);
  }
  if (stage === "offer") {
    next.offer_received = true;
    next.response_received = true;
    next.response_date = next.response_date ?? today();
    next.current_status = "action_required";
  }
  if (stage === "accepted") {
    next.offer_received = true;
    next.final_outcome = "accepted";
    next.active = false;
    next.current_status = "successful";
  }
  if (stage === "rejected") {
    next.final_outcome = "rejected";
    next.active = false;
    next.current_status = "unsuccessful";
    next.rejection_stage = record.current_stage;
    next.response_received = true;
    next.response_date = next.response_date ?? today();
  }
  if (stage === "withdrawn") {
    next.final_outcome = "withdrawn";
    next.active = false;
    next.current_status = "withdrawn";
  }
  if (stage === "closed") {
    next.active = false;
    next.current_status = record.final_outcome === "accepted" ? "successful" : "archived";
  }
  return next;
}

function createApplication(inputPath: string, dryRun = false, base = privateRoot): ApplicationRecord {
  ensureInitialized(base);
  const input = json<Partial<ApplicationRecord>>(path.resolve(inputPath));
  const record = normalizeApplication(input);
  const file = registryPath("applications", record.application_id, base);
  const existing = listJson<ApplicationRecord>(path.join(base, "applications"));
  const duplicate = existing.find((app) => app.company_slug === record.company_slug && app.role_title === record.role_title && app.job_posting_id === record.job_posting_id);
  if (existsSync(file) || duplicate) throw new Error(`Duplicate application identity: ${record.application_id}`);
  if (!dryRun) {
    saveApplication(record, base);
    appendEvent(record.application_id, "application_created", "Application record created.", null, record, {}, base);
  }
  return record;
}

function updateApplication(id: string, inputPath: string, dryRun = false, base = privateRoot): ApplicationRecord {
  ensureInitialized(base);
  const current = loadApplication(id, base);
  const patch = json<Partial<ApplicationRecord>>(path.resolve(inputPath));
  if (patch.application_id && patch.application_id !== id) throw new Error("application_id mutation is prohibited.");
  const stage = patch.current_stage ?? current.current_stage;
  const transitionFailures = stage !== current.current_stage ? validateTransition(current.current_stage, stage, "application update") : [];
  if (transitionFailures.length) throw new Error(transitionFailures.join("; "));
  const next = normalizeApplication({ ...current, ...patch, application_id: id, created_at: current.created_at, updated_at: now(), last_activity_at: now() });
  if (!dryRun) {
    saveApplication(next, base);
    appendEvent(id, "application_updated", "Application record updated.", current, patch, { changed_fields: Object.keys(patch) }, base);
  }
  return next;
}

function transitionApplication(id: string, stage: Stage, reason: string, status?: Status, dryRun = false, base = privateRoot): ApplicationRecord {
  ensureInitialized(base);
  const current = loadApplication(id, base);
  const failures = validateTransition(current.current_stage, stage, reason);
  if (status && !statuses.includes(status)) failures.push(`Invalid status: ${status}`);
  if (failures.length) throw new Error(failures.join("; "));
  const next = applyStage(current, stage, status);
  if (!dryRun) {
    saveApplication(next, base);
    appendEvent(id, "stage_changed", reason, current.current_stage, stage, { status }, base);
  }
  return next;
}

function linkResume(id: string, snapshotPath: string, dryRun = false, base = privateRoot): ApplicationRecord {
  ensureInitialized(base);
  const current = loadApplication(id, base);
  const snapshot = json<Partial<ApplicationRecord>>(path.resolve(snapshotPath));
  const localPaths = [snapshot.jd_path, snapshot.resume_plan_path, snapshot.narrative_output_path, snapshot.docx_path, snapshot.pdf_path].filter((item): item is string => Boolean(item));
  const missing = localPaths.filter((item) => !/^https?:\/\//.test(item) && !existsSync(path.resolve(item)));
  if (missing.length) throw new Error(`Missing linked artifact path(s): ${missing.join(", ")}`);
  const next = normalizeApplication({ ...current, ...snapshot, application_id: id, created_at: current.created_at, updated_at: now(), last_activity_at: now() });
  if (!dryRun) {
    saveApplication(next, base);
    appendEvent(id, "resume_linked", "Resume OS artifacts linked by reference.", null, snapshot, {}, base);
    if (snapshot.jd_path) appendEvent(id, "jd_linked", "JD snapshot linked by reference.", null, { jd_path: snapshot.jd_path, jd_hash: snapshot.jd_hash }, {}, base);
  }
  return next;
}

function createContact(inputPath: string, dryRun = false, base = privateRoot): ContactRecord {
  ensureInitialized(base);
  const input = json<Partial<ContactRecord>>(path.resolve(inputPath));
  if (!input.full_name) throw new Error("full_name is required.");
  const id = input.contact_id ?? `CON-${slug(input.company ?? "unknown")}-${slug(input.full_name)}-${hash(input.full_name).slice(0, 6)}`;
  const record: ContactRecord = {
    contact_id: id,
    full_name: input.full_name,
    role: input.role ?? null,
    company: input.company ?? null,
    relationship_type: input.relationship_type ?? "unknown",
    email: input.email ?? null,
    linkedin_url: input.linkedin_url ?? null,
    source: input.source ?? "manual",
    first_contact_at: input.first_contact_at ?? null,
    last_contact_at: input.last_contact_at ?? null,
    related_application_ids: input.related_application_ids ?? [],
    notes: input.notes ?? null,
    follow_up_allowed: input.follow_up_allowed ?? true,
    confidentiality: input.confidentiality ?? "private",
    safe_to_commit: input.safe_to_commit ?? false,
    schema_version: input.schema_version ?? "1.0.0",
    created_at: input.created_at ?? now(),
    updated_at: input.updated_at ?? now(),
  };
  if (existsSync(registryPath("contacts", id, base))) throw new Error(`Contact already exists: ${id}`);
  if (!dryRun) writeJson(registryPath("contacts", id, base), record);
  return record;
}

function updateContact(id: string, inputPath: string, dryRun = false, base = privateRoot): ContactRecord {
  const file = registryPath("contacts", id, base);
  if (!existsSync(file)) throw new Error(`Contact not found: ${id}`);
  const current = json<ContactRecord>(file);
  const patch = json<Partial<ContactRecord>>(path.resolve(inputPath));
  if (patch.contact_id && patch.contact_id !== id) throw new Error("contact_id mutation is prohibited.");
  const next = { ...current, ...patch, contact_id: id, updated_at: now() };
  if (!dryRun) writeJson(file, next);
  return next;
}

function linkContact(applicationId: string, contactId: string, dryRun = false, base = privateRoot): void {
  const app = loadApplication(applicationId, base);
  const contactFile = registryPath("contacts", contactId, base);
  if (!existsSync(contactFile)) throw new Error(`Contact not found: ${contactId}`);
  const contact = json<ContactRecord>(contactFile);
  const nextContact = { ...contact, related_application_ids: [...new Set([...contact.related_application_ids, applicationId])], updated_at: now() };
  const nextApp = { ...app, last_contact_at: app.last_contact_at ?? today(), last_activity_at: now(), updated_at: now() };
  if (!dryRun) {
    writeJson(contactFile, nextContact);
    saveApplication(nextApp, base);
    appendEvent(applicationId, "recruiter_contacted", "Contact linked to application.", null, { contact_id: contactId }, {}, base);
  }
}

function createTask(inputPath: string, dryRun = false, base = privateRoot): TaskRecord {
  ensureInitialized(base);
  const input = json<Partial<TaskRecord>>(path.resolve(inputPath));
  if (!input.title) throw new Error("task title is required.");
  if (input.application_id) loadApplication(input.application_id, base);
  const id = input.task_id ?? `TSK-${hash(`${input.application_id ?? "general"}-${input.title}-${input.due_at ?? ""}`)}`;
  const record: TaskRecord = {
    task_id: id,
    application_id: input.application_id ?? null,
    contact_id: input.contact_id ?? null,
    task_type: input.task_type ?? "other",
    title: input.title,
    description: input.description ?? null,
    due_at: input.due_at ?? null,
    completed_at: input.completed_at ?? null,
    status: input.status ?? "open",
    priority: input.priority ?? "medium",
    source: input.source ?? "manual",
    recurrence: input.recurrence ?? null,
    notes: input.notes ?? null,
    created_at: input.created_at ?? now(),
    updated_at: input.updated_at ?? now(),
    schema_version: input.schema_version ?? "1.0.0",
  };
  if (!dryRun) {
    writeJson(registryPath("tasks", id, base), record);
    if (record.application_id) appendEvent(record.application_id, "follow_up_due", "Task created.", null, { task_id: id }, {}, base);
  }
  return record;
}

function completeTask(id: string, dryRun = false, base = privateRoot): TaskRecord {
  const file = registryPath("tasks", id, base);
  if (!existsSync(file)) throw new Error(`Task not found: ${id}`);
  const current = json<TaskRecord>(file);
  const next = { ...current, status: "completed" as const, completed_at: today(), updated_at: now() };
  if (!dryRun) {
    writeJson(file, next);
    if (next.application_id) appendEvent(next.application_id, "follow_up_completed", "Task completed.", current.status, next.status, { task_id: id }, base);
  }
  return next;
}

function applications(base = privateRoot): ApplicationRecord[] {
  return listJson<ApplicationRecord>(path.join(base, "applications"));
}

function contacts(base = privateRoot): ContactRecord[] {
  return listJson<ContactRecord>(path.join(base, "contacts"));
}

function tasks(base = privateRoot): TaskRecord[] {
  return listJson<TaskRecord>(path.join(base, "tasks"));
}

function events(base = privateRoot): RegistryEvent[] {
  return listJson<RegistryEvent>(path.join(base, "events"));
}

function filterApplications(apps: ApplicationRecord[], flags: Record<string, string | boolean>): ApplicationRecord[] {
  return apps.filter((app) => {
    if (flags.stage && app.current_stage !== flags.stage) return false;
    if (flags.status && app.current_status !== flags.status) return false;
    if (flags.company && !app.company_name.toLowerCase().includes(String(flags.company).toLowerCase())) return false;
    if (flags.role && !app.role_title.toLowerCase().includes(String(flags.role).toLowerCase())) return false;
    if (flags["role-pack"] && app.role_pack !== flags["role-pack"]) return false;
    if (flags.priority && app.priority !== flags.priority) return false;
    if (flags.active && !app.active) return false;
    if (flags.tag && !app.tags.includes(String(flags.tag))) return false;
    if (flags["missing-resume"] && !app.resume_snapshot_id) return false;
    if (flags["missing-jd"] && !app.jd_snapshot_id) return false;
    return true;
  });
}

function staleReasons(app: ApplicationRecord, relatedTasks: TaskRecord[]): string[] {
  const reasons: string[] = [];
  const appDate = app.application_date ? Date.parse(app.application_date) : null;
  const last = Date.parse(app.last_activity_at);
  const todayMs = Date.parse(today());
  if (app.current_stage === "applied" && !app.response_received && appDate && (todayMs - appDate) / 86_400_000 > 10) reasons.push("applied with no response after threshold");
  if (app.current_stage.includes("interview") && (todayMs - last) / 86_400_000 > 5) reasons.push("interview completed or scheduled with no recent update");
  if (app.current_stage === "offer" && last && (todayMs - last) / 86_400_000 > 7) reasons.push("offer open beyond threshold");
  if (app.active && (todayMs - last) / 86_400_000 > 21) reasons.push("active record with no recent activity");
  if (relatedTasks.some((task) => task.status === "open" && task.due_at && Date.parse(task.due_at) < todayMs)) reasons.push("next action overdue");
  return reasons;
}

function validateRegistry(base = privateRoot): { failures: string[]; warnings: string[]; counts: Record<string, number> } {
  ensureInitialized(base);
  const apps = applications(base);
  const evts = events(base);
  const allContacts = contacts(base);
  const allTasks = tasks(base);
  const failures: string[] = [];
  const warnings: string[] = [];
  const ids = new Set<string>();
  for (const app of apps) {
    if (ids.has(app.application_id)) failures.push(`Duplicate application ID: ${app.application_id}`);
    ids.add(app.application_id);
    if (!stages.includes(app.current_stage)) failures.push(`${app.application_id}: invalid stage`);
    if (!statuses.includes(app.current_status)) failures.push(`${app.application_id}: invalid status`);
    if (app.application_date && app.response_date && Date.parse(app.response_date) < Date.parse(app.application_date)) failures.push(`${app.application_id}: response before application date`);
    if (app.offer_received && !["offer", "accepted", "closed"].includes(app.current_stage)) failures.push(`${app.application_id}: offer inconsistent with stage`);
    if (app.current_stage === "accepted" && app.current_status !== "successful") failures.push(`${app.application_id}: accepted must be successful`);
    if (app.current_stage === "rejected" && app.active) failures.push(`${app.application_id}: rejected cannot remain active`);
    if (!app.safe_to_commit && app.confidentiality !== "private") warnings.push(`${app.application_id}: non-private record marked unsafe to commit`);
    if (credentialPattern.test(JSON.stringify(app))) failures.push(`${app.application_id}: suspected credential pattern`);
    if (!app.resume_snapshot_id) warnings.push(`${app.application_id}: missing resume link`);
    if (!app.jd_snapshot_id) warnings.push(`${app.application_id}: missing JD link`);
  }
  for (const evt of evts) {
    if (!ids.has(evt.application_id)) failures.push(`${evt.event_id}: orphan event application reference`);
  }
  for (const contact of allContacts) {
    for (const appId of contact.related_application_ids) if (!ids.has(appId)) failures.push(`${contact.contact_id}: broken application reference ${appId}`);
    if (credentialPattern.test(JSON.stringify(contact))) failures.push(`${contact.contact_id}: suspected credential pattern`);
  }
  for (const task of allTasks) {
    if (task.application_id && !ids.has(task.application_id)) failures.push(`${task.task_id}: broken application reference ${task.application_id}`);
    if (task.status === "completed" && !task.completed_at) failures.push(`${task.task_id}: completed task missing completed_at`);
  }
  if (!gitignoreCoversPrivate()) failures.push("Private registry path is not covered by .gitignore.");
  return { failures, warnings, counts: { applications: apps.length, events: evts.length, contacts: allContacts.length, tasks: allTasks.length } };
}

function privacyValidation(base = privateRoot): { failures: string[]; warnings: string[] } {
  ensureInitialized(base);
  const failures: string[] = [];
  const warnings: string[] = [];
  if (!gitignoreCoversPrivate()) failures.push("data/private/application-registry/ missing from .gitignore");
  const publicFiles = [
    ...listFiles(path.join(docsRoot, "fixtures")),
    ...listFiles(path.join(docsRoot, "reports")),
  ];
  for (const file of publicFiles) {
    const body = readFileSync(file, "utf8");
    if (credentialPattern.test(body)) failures.push(`Public fixture contains suspected credential pattern: ${path.relative(root, file)}`);
    if (/"safe_to_commit"\s*:\s*false/.test(body)) failures.push(`Unsafe private record in public fixture: ${path.relative(root, file)}`);
  }
  return { failures, warnings };
}

function listFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? listFiles(full) : [full];
  });
}

function rebuildIndexes(base = privateRoot): Record<string, Record<string, string[]>> {
  ensureInitialized(base);
  const apps = applications(base);
  const indexDefs: Record<string, (app: ApplicationRecord) => string | string[] | null | undefined> = {
    by_company: (app) => app.company_slug,
    by_stage: (app) => app.current_stage,
    by_status: (app) => app.current_status,
    by_application_date: (app) => app.application_date,
    by_priority: (app) => app.priority,
    by_next_action: (app) => app.next_action,
    by_outcome: (app) => app.final_outcome,
    by_role_pack: (app) => app.role_pack,
    by_archetype: (app) => app.role_pack,
    by_product_os_module: (app) => app.product_os_modules,
    by_tag: (app) => app.tags,
  };
  const indexes: Record<string, Record<string, string[]>> = {};
  for (const [name, getter] of Object.entries(indexDefs)) {
    indexes[name] = {};
    for (const app of apps) {
      const raw = getter(app);
      for (const key of Array.isArray(raw) ? raw : [raw]) {
        if (!key) continue;
        indexes[name][key] = indexes[name][key] ?? [];
        indexes[name][key].push(app.application_id);
      }
    }
    writeJson(path.join(base, "indexes", `${name}.json`), indexes[name]);
  }
  return indexes;
}

function syntheticApps(): ApplicationRecord[] {
  const archetypes = ["ai-pm", "platform", "payments", "growth", "marketplace", "enterprise-saas", "monetization"];
  const companies = ["Northstar AI", "Atlas Platform", "RiverPay", "GrowthLoop", "MarketGrid", "CloudDesk", "Vector Labs", "StackForge", "TrustWallet", "Lifecycle Co", "SignalCart", "DataNest"];
  const stagesFixture: Stage[] = ["applied", "recruiter_contact", "recruiter_screen", "hiring_manager_interview", "product_interview", "technical_interview", "final_round", "offer", "accepted", "rejected", "withdrawn", "applied", "closed", "case_study", "system_design"];
  return Array.from({ length: 30 }, (_, i) => {
    const archetype = archetypes[i % archetypes.length];
    const company = companies[i % companies.length];
    const stage = stagesFixture[i % stagesFixture.length];
    const appliedDay = String(1 + (i % 25)).padStart(2, "0");
    return normalizeApplication({
      application_id: `FIX-APP-${String(i + 1).padStart(3, "0")}`,
      created_at: `2026-06-${appliedDay}T09:00:00+05:30`,
      updated_at: `2026-06-${appliedDay}T09:00:00+05:30`,
      company_name: company,
      company_slug: slug(company),
      role_title: `${archetype.replace(/-/g, " ")} Product Manager`,
      role_level: i % 4 === 0 ? "Lead" : "Senior",
      employment_type: "Full-time",
      work_mode: i % 3 === 0 ? "remote" : "hybrid",
      location: i % 3 === 0 ? "Remote" : "San Francisco, CA",
      country: "United States",
      job_url: `https://example.com/jobs/${i + 1}`,
      application_source: i % 5 === 0 ? "referral" : "company_site",
      referral_source: i % 5 === 0 ? "sanitized referrer" : null,
      job_posting_id: `POST-${String((i % 18) + 1).padStart(3, "0")}`,
      application_date: `2026-06-${appliedDay}`,
      current_stage: stage,
      current_status: terminalStages.has(stage) ? (stage === "accepted" ? "successful" : stage === "withdrawn" ? "withdrawn" : "unsuccessful") : i % 4 === 0 ? "action_required" : "waiting",
      active: !terminalStages.has(stage),
      priority: i % 4 === 0 ? "high" : "medium",
      jd_snapshot_id: `JD-${i + 1}`,
      jd_path: `docs/application-registry/fixtures/jds/FIX-APP-${String(i + 1).padStart(3, "0")}.md`,
      jd_hash: hash(`jd-${i}`),
      resume_snapshot_id: `RS-${i + 1}`,
      resume_plan_path: "docs/resume-os/assembly/samples/ai-product-manager/resume-plan.json",
      narrative_output_path: "docs/resume-os/pilots/ebay/narrative/resume-draft.narrative.json",
      docx_path: "docs/resume-os/pilots/ebay/export/ebay-live-pilot.docx",
      pdf_path: "docs/resume-os/pilots/ebay/export/ebay-live-pilot.pdf",
      export_commit_hash: "fixture-export",
      resume_version: `resume-v${(i % 3) + 1}`,
      role_pack: archetype,
      product_os_modules: [i % 2 === 0 ? "AI Product Playbook" : "Product Leadership Briefs"],
      manual_override_ids: [`OVR-${String(i + 1).padStart(3, "0")}`],
      response_received: stages.indexOf(stage) >= stages.indexOf("recruiter_contact"),
      response_date: stages.indexOf(stage) >= stages.indexOf("recruiter_contact") ? `2026-06-${String(Math.min(28, Number(appliedDay) + 4)).padStart(2, "0")}` : null,
      interview_count: stages.indexOf(stage) >= stages.indexOf("hiring_manager_interview") ? 1 + (i % 4) : 0,
      offer_received: ["offer", "accepted"].includes(stage),
      final_outcome: stage === "accepted" ? "accepted" : stage === "rejected" ? "rejected" : stage === "withdrawn" ? "withdrawn" : null,
      next_action: terminalStages.has(stage) ? null : i % 3 === 0 ? "follow up" : "monitor",
      next_action_due_at: terminalStages.has(stage) ? null : i % 7 === 0 ? "2026-06-15" : "2026-07-20",
      last_activity_at: `2026-06-${appliedDay}T09:00:00+05:30`,
      tags: [archetype, i % 5 === 0 ? "referral" : "direct"],
      confidentiality: "public-fixture",
      contains_personal_data: false,
      safe_to_commit: true,
      archived_at: stage === "closed" ? "2026-07-01T00:00:00+05:30" : null,
    });
  });
}

function writeSyntheticFixtures(): void {
  const base = fixtureRoot;
  for (const dir of appDirs) mkdirSync(path.join(base, dir), { recursive: true });
  const apps = syntheticApps();
  for (const app of apps) {
    writeJson(path.join(base, "applications", `${app.application_id}.json`), app);
    writeJson(path.join(base, "events", `${app.application_id}.created.json`), {
      event_id: `FIX-EVT-${app.application_id}`,
      application_id: app.application_id,
      event_type: "application_created",
      occurred_at: app.created_at,
      recorded_at: app.created_at,
      reason: "Synthetic fixture creation.",
      source: "synthetic-fixture",
      actor: "fixture",
      metadata: {},
      schema_version: "1.0.0",
    } satisfies RegistryEvent);
  }
  const fixtureContacts: ContactRecord[] = Array.from({ length: 8 }, (_, i) => ({
    contact_id: `FIX-CON-${String(i + 1).padStart(3, "0")}`,
    full_name: `Sanitized Contact ${i + 1}`,
    role: i % 2 === 0 ? "Recruiter" : "Hiring Manager",
    company: apps[i].company_name,
    relationship_type: i % 2 === 0 ? "recruiter" : "hiring_manager",
    email: null,
    linkedin_url: null,
    source: "synthetic",
    first_contact_at: "2026-06-10",
    last_contact_at: "2026-06-12",
    related_application_ids: [apps[i].application_id],
    notes: "Sanitized synthetic contact.",
    follow_up_allowed: true,
    confidentiality: "public-fixture",
    safe_to_commit: true,
    schema_version: "1.0.0",
    created_at: now(),
    updated_at: now(),
  }));
  fixtureContacts.forEach((contact) => writeJson(path.join(base, "contacts", `${contact.contact_id}.json`), contact));
  const fixtureTasks: TaskRecord[] = apps.slice(0, 12).map((app, i) => ({
    task_id: `FIX-TSK-${String(i + 1).padStart(3, "0")}`,
    application_id: app.application_id,
    contact_id: i < fixtureContacts.length ? fixtureContacts[i].contact_id : null,
    task_type: i % 3 === 0 ? "follow_up" : i % 3 === 1 ? "prepare_interview" : "record_outcome",
    title: i % 4 === 0 ? "Follow up on application" : "Update application record",
    description: "Synthetic operational task.",
    due_at: i % 4 === 0 ? "2026-06-15" : "2026-07-22",
    completed_at: i % 5 === 0 ? "2026-06-16" : null,
    status: i % 5 === 0 ? "completed" : "open",
    priority: i % 4 === 0 ? "high" : "medium",
    source: "synthetic",
    recurrence: null,
    notes: null,
    created_at: now(),
    updated_at: now(),
    schema_version: "1.0.0",
  }));
  fixtureTasks.forEach((task) => writeJson(path.join(base, "tasks", `${task.task_id}.json`), task));
  writeJson(path.join(base, "registry-config.json"), { schema_version: "1.0.0", fixture: true, lifecycle_stages: stages, lifecycle_statuses: statuses });
}

function commandOutput(value: unknown, format?: string): void {
  if (format === "json") {
    console.log(JSON.stringify(value, null, 2));
  } else {
    console.log(typeof value === "string" ? value : JSON.stringify(value, null, 2));
  }
}

function archiveApplication(id: string, dryRun = false, base = privateRoot): ApplicationRecord {
  const app = loadApplication(id, base);
  if (!terminalStages.has(app.current_stage) && app.current_status !== "on_hold") throw new Error("Only terminal or explicitly abandoned applications may be archived.");
  const next = { ...app, current_status: "archived" as Status, active: false, archived_at: now(), updated_at: now() };
  if (!dryRun) {
    saveApplication(next, base);
    appendEvent(id, "application_archived", "Application archived without deletion.", app.current_status, next.current_status, {}, base);
  }
  return next;
}

function run(): void {
  const { command, flags } = parseArgs();
  try {
    if (command === "init") {
      ensureInitialized();
      commandOutput({ initialized: privateRoot, gitignore_covered: gitignoreCoversPrivate() });
    } else if (command === "create") {
      commandOutput(createApplication(String(flags.input), Boolean(flags["dry-run"])));
    } else if (command === "update") {
      commandOutput(updateApplication(String(flags.id), String(flags.input), Boolean(flags["dry-run"])));
    } else if (command === "transition") {
      commandOutput(transitionApplication(String(flags.id), String(flags.stage) as Stage, String(flags.reason ?? ""), flags.status as Status | undefined, Boolean(flags["dry-run"])));
    } else if (command === "link-resume") {
      commandOutput(linkResume(String(flags.id), String(flags["resume-snapshot"]), Boolean(flags["dry-run"])));
    } else if (command === "create-contact") {
      commandOutput(createContact(String(flags.input), Boolean(flags["dry-run"])));
    } else if (command === "update-contact") {
      commandOutput(updateContact(String(flags.id), String(flags.input), Boolean(flags["dry-run"])));
    } else if (command === "link-contact") {
      linkContact(String(flags.id), String(flags.contact), Boolean(flags["dry-run"]));
      commandOutput({ linked: true, application_id: flags.id, contact_id: flags.contact });
    } else if (command === "create-task") {
      commandOutput(createTask(String(flags.input), Boolean(flags["dry-run"])));
    } else if (command === "complete-task") {
      commandOutput(completeTask(String(flags.id), Boolean(flags["dry-run"])));
    } else if (command === "list-tasks") {
      commandOutput(tasks().filter((task) => !flags.status || task.status === flags.status), flags.format as string | undefined);
    } else if (command === "list" || command === "search") {
      commandOutput(filterApplications(applications(), flags), flags.format as string | undefined);
    } else if (command === "show") {
      commandOutput(loadApplication(String(flags.id)), flags.format as string | undefined);
    } else if (command === "daily") {
      const allTasks = tasks();
      const apps = applications();
      commandOutput({
        action_required: apps.filter((app) => app.current_status === "action_required"),
        overdue_tasks: allTasks.filter((task) => task.status === "open" && task.due_at && Date.parse(task.due_at) < Date.parse(today())),
        stalled: apps.map((app) => ({ application_id: app.application_id, reasons: staleReasons(app, allTasks.filter((task) => task.application_id === app.application_id)) })).filter((item) => item.reasons.length),
        missing_traceability: apps.filter((app) => !app.resume_snapshot_id || !app.jd_snapshot_id),
      });
    } else if (command === "stale") {
      const allTasks = tasks();
      commandOutput(applications().map((app) => ({ application_id: app.application_id, company: app.company_name, reasons: staleReasons(app, allTasks.filter((task) => task.application_id === app.application_id)) })).filter((item) => item.reasons.length));
    } else if (command === "archive") {
      commandOutput(archiveApplication(String(flags.id), Boolean(flags["dry-run"])));
    } else if (command === "rebuild-indexes") {
      commandOutput(rebuildIndexes());
    } else if (command === "validate") {
      writeSyntheticFixtures();
      const result = validateRegistry();
      writeJson(path.join(docsRoot, "reports", "registry-validation-summary.json"), result);
      commandOutput(result);
      if (result.failures.length) process.exitCode = 1;
    } else if (command === "validate-privacy") {
      writeSyntheticFixtures();
      const result = privacyValidation();
      writeJson(path.join(docsRoot, "reports", "privacy-validation-summary.json"), result);
      commandOutput(result);
      if (result.failures.length) process.exitCode = 1;
    } else {
      commandOutput("Application Registry commands: init, create, update, transition, link-resume, create-contact, update-contact, link-contact, create-task, complete-task, list-tasks, list, search, show, daily, stale, archive, rebuild-indexes, validate, validate-privacy");
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

run();
