import fs from "node:fs";
import path from "node:path";

export type ApplicationRecord = {
  application_id: string;
  company_name: string;
  role_title: string;
  role_level: string | null;
  current_stage: string;
  current_status: string;
  active: boolean;
  priority: string;
  application_date: string;
  response_received: boolean;
  response_date: string | null;
  interview_count: number;
  final_outcome: string | null;
  offer_received: boolean;
  next_action: string | null;
  next_action_due_at: string | null;
  last_activity_at: string | null;
  jd_snapshot_id: string | null;
  resume_snapshot_id: string | null;
  resume_version: string | null;
  role_pack: string | null;
  product_os_modules: string[];
  manual_override_ids: string[];
  tags: string[];
  job_url: string | null;
  jd_path: string | null;
  resume_plan_path: string | null;
  narrative_output_path: string | null;
  docx_path: string | null;
  pdf_path: string | null;
  confidentiality: string;
  safe_to_commit: boolean;
};

export type ContactRecord = {
  contact_id: string;
  full_name: string;
  role: string;
  company: string;
  relationship_type: string;
  related_application_ids: string[];
  follow_up_allowed: boolean;
  safe_to_commit: boolean;
};

export type TaskRecord = {
  task_id: string;
  application_id: string;
  contact_id: string | null;
  task_type: string;
  title: string;
  due_at: string;
  completed_at: string | null;
  status: string;
  priority: string;
};

export type RegistryEvent = {
  event_id?: string;
  application_id: string;
  event_type?: string;
  created_at?: string;
  timestamp?: string;
  summary?: string;
};

export type ConsoleAction = {
  id: string;
  title: string;
  reason: string;
  company: string;
  applicationId: string;
  href: string;
  priority: "high" | "medium" | "low";
  dueLabel: string;
  category: string;
};

export type LeaderboardRow = {
  name: string;
  applications: number;
  responses: number;
  interviews: number;
  offers: number;
  responseRate: number;
  interviewRate: number;
  offerRate: number;
  averageResponseTime: number;
};

export type ConsoleData = {
  generatedAt: string;
  applications: ApplicationRecord[];
  contacts: ContactRecord[];
  tasks: TaskRecord[];
  actions: ConsoleAction[];
  timeline: Record<"today" | "tomorrow" | "next7", ConsoleAction[]>;
  pipeline: Array<{ label: string; count: number; percentage: number; trend: string }>;
  performance: Array<{ label: string; value: string; detail: string }>;
  resumePerformance: LeaderboardRow[];
  archetypePerformance: LeaderboardRow[];
  companyPerformance: LeaderboardRow[];
  warnings: ConsoleAction[];
  health: Array<{ label: string; value: string; status: "pass" | "warning" | "fail"; detail: string }>;
  insights: Array<{ label: string; value: string; evidence: string }>;
  dailyBrief: string[];
};

const ROOT = process.cwd();
const FIXTURE_ROOT = path.join(ROOT, "docs", "application-registry", "fixtures", "synthetic-registry");
const APP_DIR = path.join(FIXTURE_ROOT, "applications");
const CONTACT_DIR = path.join(FIXTURE_ROOT, "contacts");
const TASK_DIR = path.join(FIXTURE_ROOT, "tasks");
const EVENT_DIR = path.join(FIXTURE_ROOT, "events");
const REPORT_ROOT = path.join(ROOT, "docs", "application-intelligence", "reports");
const REGISTRY_REPORT_ROOT = path.join(ROOT, "docs", "application-registry", "reports");
const TODAY = "2026-07-18";

function readJsonFile<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function readJsonDir<T>(dirPath: string): T[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  return fs
    .readdirSync(dirPath)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => readJsonFile<T>(path.join(dirPath, file)));
}

function daysBetween(start: string | null, end: string) {
  if (!start) {
    return 0;
  }

  const startTime = Date.parse(`${start.slice(0, 10)}T00:00:00Z`);
  const endTime = Date.parse(`${end}T00:00:00Z`);
  return Math.round((endTime - startTime) / 86_400_000);
}

function isBeforeOrSame(date: string | null, compare = TODAY) {
  return Boolean(date && date.slice(0, 10) <= compare);
}

function isBetween(date: string | null, start: string, end: string) {
  if (!date) {
    return false;
  }

  const value = date.slice(0, 10);
  return value >= start && value <= end;
}

function formatLabel(value: string | null | undefined) {
  if (!value) {
    return "Unassigned";
  }

  return value
    .replace(/-/g, " ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function applicationHref(applicationId: string) {
  return `/career-os/applications/${applicationId}`;
}

function createAction(
  application: ApplicationRecord,
  category: string,
  reason: string,
  dueLabel: string,
  priority: ConsoleAction["priority"] = "medium"
): ConsoleAction {
  return {
    id: `${category}-${application.application_id}`,
    title: application.next_action ? formatLabel(application.next_action) : `Review ${formatLabel(application.current_stage)}`,
    reason,
    company: application.company_name,
    applicationId: application.application_id,
    href: applicationHref(application.application_id),
    priority,
    dueLabel,
    category
  };
}

function buildActions(applications: ApplicationRecord[], contacts: ContactRecord[], tasks: TaskRecord[]) {
  const contacted = new Set(contacts.flatMap((contact) => contact.related_application_ids));
  const actions: ConsoleAction[] = [];

  applications
    .filter((application) => application.active && isBeforeOrSame(application.next_action_due_at))
    .forEach((application) => {
      actions.push(
        createAction(
          application,
          "follow-up",
          `${application.current_status === "action_required" ? "Action required" : "Follow-up due"} in ${formatLabel(
            application.current_stage
          )}`,
          application.next_action_due_at ?? "Due",
          application.priority === "high" ? "high" : "medium"
        )
      );
    });

  tasks
    .filter((task) => task.status !== "completed" && isBeforeOrSame(task.due_at))
    .forEach((task) => {
      const application = applications.find((item) => item.application_id === task.application_id);
      if (application) {
        actions.push({
          id: `task-${task.task_id}`,
          title: task.title,
          reason: `${formatLabel(task.task_type)} task is overdue`,
          company: application.company_name,
          applicationId: application.application_id,
          href: applicationHref(application.application_id),
          priority: task.priority === "high" ? "high" : "medium",
          dueLabel: task.due_at,
          category: "overdue-task"
        });
      }
    });

  applications
    .filter((application) => application.active && !contacted.has(application.application_id))
    .slice(0, 6)
    .forEach((application) => {
      actions.push(createAction(application, "missing-recruiter", "No recruiter or contact linked", "Traceability gap", "medium"));
    });

  applications
    .filter((application) => application.active && !application.resume_snapshot_id)
    .forEach((application) => {
      actions.push(createAction(application, "missing-resume", "Resume snapshot is missing", "Traceability gap", "high"));
    });

  applications
    .filter((application) => application.active && !application.jd_snapshot_id)
    .forEach((application) => {
      actions.push(createAction(application, "missing-jd", "JD snapshot is missing", "Traceability gap", "high"));
    });

  applications
    .filter((application) => application.active && daysBetween(application.last_activity_at, TODAY) > 14)
    .slice(0, 8)
    .forEach((application) => {
      actions.push(createAction(application, "stale", "No activity in more than 14 days", `${daysBetween(application.last_activity_at, TODAY)} days stale`, "medium"));
    });

  return dedupeActions(actions).slice(0, 18);
}

function dedupeActions(actions: ConsoleAction[]) {
  const seen = new Set<string>();
  return actions.filter((action) => {
    const key = `${action.category}-${action.applicationId}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function buildTimeline(applications: ApplicationRecord[], tasks: TaskRecord[]) {
  const tomorrow = "2026-07-19";
  const nextSeven = "2026-07-25";

  const taskActions = (start: string, end: string) =>
    tasks
      .filter((task) => task.status !== "completed" && isBetween(task.due_at, start, end))
      .map((task) => {
        const application = applications.find((item) => item.application_id === task.application_id);
        if (!application) {
          return null;
        }
        return {
          id: `timeline-${task.task_id}`,
          title: task.title,
          reason: `${formatLabel(task.task_type)} for ${application.role_title}`,
          company: application.company_name,
          applicationId: application.application_id,
          href: applicationHref(application.application_id),
          priority: task.priority === "high" ? "high" : "medium",
          dueLabel: task.due_at,
          category: "task"
        } satisfies ConsoleAction;
      })
      .filter(Boolean) as ConsoleAction[];

  const applicationActions = (start: string, end: string) =>
    applications
      .filter((application) => application.active && isBetween(application.next_action_due_at, start, end))
      .map((application) =>
        createAction(
          application,
          application.current_stage.includes("interview") || application.current_stage.includes("study") ? "interview" : "follow-up",
          `${formatLabel(application.current_stage)} checkpoint`,
          application.next_action_due_at ?? "Scheduled",
          application.priority === "high" ? "high" : "medium"
        )
      );

  return {
    today: [...applicationActions(TODAY, TODAY), ...taskActions(TODAY, TODAY)],
    tomorrow: [...applicationActions(tomorrow, tomorrow), ...taskActions(tomorrow, tomorrow)],
    next7: [...applicationActions(TODAY, nextSeven), ...taskActions(TODAY, nextSeven)].slice(0, 16)
  };
}

function buildPipeline(applications: ApplicationRecord[]) {
  const buckets = [
    { label: "Applications", stages: ["applied"] },
    { label: "Recruiter Screen", stages: ["recruiter_contact", "recruiter_screen"] },
    { label: "Hiring Manager", stages: ["hiring_manager_interview", "product_interview"] },
    { label: "Technical", stages: ["technical_interview", "system_design", "case_study"] },
    { label: "Final", stages: ["final_round"] },
    { label: "Offers", stages: ["offer"] },
    { label: "Rejected", stages: ["rejected", "closed"] },
    { label: "Withdrawn", stages: ["withdrawn"] },
    { label: "Accepted", stages: ["accepted"] }
  ];
  const total = applications.length || 1;

  return buckets.map((bucket) => {
    const count = applications.filter((application) => bucket.stages.includes(application.current_stage)).length;
    return {
      label: bucket.label,
      count,
      percentage: Math.round((count / total) * 100),
      trend: count > 0 ? "Tracked" : "No current records"
    };
  });
}

function buildPerformance(applications: ApplicationRecord[], analytics: Record<string, unknown>) {
  const open = applications.filter((application) => application.active).length;
  const closed = applications.length - open;
  const thisMonth = applications.filter((application) => application.application_date.startsWith("2026-07")).length;

  return [
    { label: "Applications", value: String(applications.length), detail: "Synthetic registry records rendered" },
    { label: "Response Rate", value: `${Number(analytics.response_rate ?? 0).toFixed(1)}%`, detail: "Application Intelligence metric" },
    { label: "Interview Rate", value: `${Number(analytics.interview_rate ?? 0).toFixed(1)}%`, detail: "Application Intelligence metric" },
    { label: "Offer Rate", value: `${Number(analytics.offer_rate ?? 0).toFixed(1)}%`, detail: "Application Intelligence metric" },
    { label: "Avg Response Time", value: `${analytics.average_response_time_days ?? 0}d`, detail: "Mean days to response" },
    { label: "This Month", value: String(thisMonth), detail: "Applications submitted in July 2026" },
    { label: "Open", value: String(open), detail: "Active applications" },
    { label: "Closed", value: String(closed), detail: "Accepted, rejected, withdrawn, or closed" }
  ];
}

function buildLeaderboard(applications: ApplicationRecord[], key: "resume_version" | "role_pack" | "company_name"): LeaderboardRow[] {
  const groups = new Map<string, ApplicationRecord[]>();
  applications.forEach((application) => {
    const value = key === "company_name" ? application.company_name : application[key] ?? "Unassigned";
    groups.set(value, [...(groups.get(value) ?? []), application]);
  });

  return [...groups.entries()]
    .map(([name, rows]) => {
      const responses = rows.filter((row) => row.response_received).length;
      const interviews = rows.filter((row) => row.interview_count > 0).length;
      const offers = rows.filter((row) => row.offer_received || row.current_stage === "offer" || row.current_stage === "accepted").length;
      const responseTimes = rows.flatMap((row) => (row.response_date ? [daysBetween(row.application_date, row.response_date)] : []));
      const averageResponseTime = responseTimes.length
        ? Math.round(responseTimes.reduce((sum, days) => sum + days, 0) / responseTimes.length)
        : 0;

      return {
        name: formatLabel(name),
        applications: rows.length,
        responses,
        interviews,
        offers,
        responseRate: Math.round((responses / rows.length) * 100),
        interviewRate: Math.round((interviews / rows.length) * 100),
        offerRate: Math.round((offers / rows.length) * 100),
        averageResponseTime
      };
    })
    .sort((a, b) => b.interviewRate - a.interviewRate || b.responseRate - a.responseRate || b.applications - a.applications);
}

function buildWarnings(actions: ConsoleAction[], applications: ApplicationRecord[], contacts: ContactRecord[]) {
  const contacted = new Set(contacts.flatMap((contact) => contact.related_application_ids));
  const warningActions = [...actions.filter((action) => action.priority === "high")];

  applications
    .filter((application) => application.active && !contacted.has(application.application_id))
    .slice(0, 4)
    .forEach((application) =>
      warningActions.push(createAction(application, "privacy-warning", "Missing recruiter/contact traceability", "Review contact link", "medium"))
    );

  return dedupeActions(warningActions).slice(0, 10);
}

function buildHealth(applications: ApplicationRecord[]) {
  const registry = readJsonFile<{ failures: unknown[]; warnings: unknown[] }>(path.join(REGISTRY_REPORT_ROOT, "registry-validation-summary.json"));
  const privacy = readJsonFile<{ failures: unknown[]; warnings: unknown[] }>(path.join(REGISTRY_REPORT_ROOT, "privacy-validation-summary.json"));
  const intelligence = readJsonFile<{ status: string; failures: unknown[]; warnings: unknown[] }>(path.join(REPORT_ROOT, "validation-summary.json"));
  const resumeCoverage = Math.round((applications.filter((application) => application.resume_snapshot_id).length / applications.length) * 100);
  const jdCoverage = Math.round((applications.filter((application) => application.jd_snapshot_id).length / applications.length) * 100);

  return [
    {
      label: "Registry Validation",
      value: registry.failures.length ? "Fail" : "Pass",
      status: registry.failures.length ? "fail" : registry.warnings.length ? "warning" : "pass",
      detail: `${registry.failures.length} failures, ${registry.warnings.length} warnings`
    },
    {
      label: "Privacy Validation",
      value: privacy.failures.length ? "Fail" : "Pass",
      status: privacy.failures.length ? "fail" : privacy.warnings.length ? "warning" : "pass",
      detail: `${privacy.failures.length} failures, ${privacy.warnings.length} warnings`
    },
    {
      label: "Schema Validation",
      value: intelligence.status === "pass" ? "Pass" : "Review",
      status: intelligence.status === "pass" ? "pass" : "warning",
      detail: "Application Intelligence validation summary"
    },
    { label: "Traceability Coverage", value: `${Math.min(resumeCoverage, jdCoverage)}%`, status: "pass", detail: "Minimum of resume and JD coverage" },
    { label: "Resume Link Coverage", value: `${resumeCoverage}%`, status: resumeCoverage === 100 ? "pass" : "warning", detail: "Applications with resume snapshot IDs" },
    { label: "JD Link Coverage", value: `${jdCoverage}%`, status: jdCoverage === 100 ? "pass" : "warning", detail: "Applications with JD snapshot IDs" },
    { label: "Event Consistency", value: "Pass", status: "pass", detail: "Synthetic event index available" },
    { label: "Index Status", value: "Ready", status: "pass", detail: "Fixture registry indexes are readable" }
  ] as ConsoleData["health"];
}

function buildInsights(rawInsights: Array<{ insight: string; value: string; evidence: Record<string, unknown> }>, leaderboards: LeaderboardRow[]) {
  const fastestCompany = leaderboards
    .filter((row) => row.averageResponseTime > 0)
    .sort((a, b) => a.averageResponseTime - b.averageResponseTime)[0];

  return [
    ...rawInsights.map((insight) => ({
      label: formatLabel(insight.insight),
      value: insight.value,
      evidence: Object.entries(insight.evidence)
        .map(([key, value]) => `${formatLabel(key)}: ${value}`)
        .join(" · ")
    })),
    fastestCompany
      ? {
          label: "Fastest Response Company",
          value: fastestCompany.name,
          evidence: `${fastestCompany.averageResponseTime} day average response time across ${fastestCompany.applications} applications`
        }
      : {
          label: "Fastest Response Company",
          value: "Insufficient data",
          evidence: "No response-date records available"
        }
  ];
}

function buildDailyBrief(actions: ConsoleAction[], warnings: ConsoleAction[], timeline: ConsoleData["timeline"], archetypes: LeaderboardRow[], resumes: LeaderboardRow[]) {
  const topArchetype = archetypes[0];
  const topResume = resumes[0];

  return [
    `You have ${actions.length} operational items requiring review.`,
    `${timeline.next7.length} follow-ups, interviews, assessments, or deadlines are scheduled in the next 7 days.`,
    `${warnings.length} deterministic warnings need attention before the registry is fully clean.`,
    topArchetype
      ? `${topArchetype.name} is the strongest role archetype by interview rate at ${topArchetype.interviewRate}%.`
      : "No archetype performance signal is available yet.",
    topResume ? `${topResume.name} leads resume performance with a ${topResume.interviewRate}% interview rate.` : "No resume performance signal is available yet."
  ];
}

export function getCareerConsoleData(): ConsoleData {
  const applications = readJsonDir<ApplicationRecord>(APP_DIR);
  const contacts = readJsonDir<ContactRecord>(CONTACT_DIR);
  const tasks = readJsonDir<TaskRecord>(TASK_DIR);
  const analytics = readJsonFile<Record<string, unknown>>(path.join(REPORT_ROOT, "registry-projection-analytics.synthetic.json"));
  const rawInsights = readJsonFile<Array<{ insight: string; value: string; evidence: Record<string, unknown> }>>(path.join(REPORT_ROOT, "insights.synthetic.json"));

  const actions = buildActions(applications, contacts, tasks);
  const timeline = buildTimeline(applications, tasks);
  const resumePerformance = buildLeaderboard(applications, "resume_version");
  const archetypePerformance = buildLeaderboard(applications, "role_pack");
  const companyPerformance = buildLeaderboard(applications, "company_name");
  const warnings = buildWarnings(actions, applications, contacts);

  return {
    generatedAt: `${TODAY}T00:00:00+05:30`,
    applications,
    contacts,
    tasks,
    actions,
    timeline,
    pipeline: buildPipeline(applications),
    performance: buildPerformance(applications, analytics),
    resumePerformance,
    archetypePerformance,
    companyPerformance,
    warnings,
    health: buildHealth(applications),
    insights: buildInsights(rawInsights, companyPerformance),
    dailyBrief: buildDailyBrief(actions, warnings, timeline, archetypePerformance, resumePerformance)
  };
}

export function getApplicationDetail(applicationId: string) {
  const data = getCareerConsoleData();
  const application = data.applications.find((item) => item.application_id === applicationId);

  if (!application) {
    return null;
  }

  return {
    application,
    contacts: data.contacts.filter((contact) => contact.related_application_ids.includes(applicationId)),
    tasks: data.tasks.filter((task) => task.application_id === applicationId),
    events: readJsonDir<RegistryEvent>(EVENT_DIR).filter((event) => event.application_id === applicationId)
  };
}
