import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

type Stage =
  | "Discovered"
  | "Saved"
  | "Resume Generated"
  | "Human Reviewed"
  | "Applied"
  | "Recruiter Viewed"
  | "Recruiter Contact"
  | "Recruiter Reject"
  | "Online Assessment"
  | "Hiring Manager Interview"
  | "Product Interview"
  | "System Design"
  | "Final Round"
  | "Offer"
  | "Rejected"
  | "Withdrawn"
  | "Accepted";

type Application = {
  application_id: string;
  company: string;
  role: string;
  role_archetype: string;
  job_url: string;
  location: string;
  employment_type: string;
  application_source: string;
  application_date: string;
  status: "active" | "closed" | "accepted" | "withdrawn";
  current_stage: Stage;
  notes: string;
  resume_snapshot: {
    resume_version: string;
    resume_plan_version: string;
    narrative_version: string;
    export_version: string;
    commit_hash: string;
    resume_file_path: string;
    pdf_path: string;
    docx_path: string;
    human_review_timestamp: string;
  };
  jd_snapshot: {
    jd_path: string;
    jd_hash: string;
    jd_version: string;
    primary_archetype: string;
    secondary_archetypes: string[];
    keywords: string[];
    competencies: string[];
  };
  manual_overrides: Array<{
    override_type: string;
    reason: string;
    section: string;
    time_spent_minutes: number;
    frequency: number;
    future_automation_opportunity: boolean;
  }>;
  outcome: {
    application_date: string;
    response_date: string | null;
    response_type: string | null;
    interview_count: number;
    offer: boolean;
    salary: number | null;
    rejection_reason: string | null;
    candidate_withdrawal: boolean;
  };
  experiment: {
    experiment_id: string | null;
    variant: string | null;
    headline_variant: string;
    summary_variant: string;
    project_included: boolean;
    product_os_module: string;
  };
};

const root = process.cwd();
const outRoot = path.join(root, "docs", "application-intelligence");
const dataRoot = path.join(outRoot, "data");
const reportRoot = path.join(outRoot, "reports");
const registryFixtureApplications = path.join(root, "docs", "application-registry", "fixtures", "synthetic-registry", "applications");

const stages: Stage[] = [
  "Discovered",
  "Saved",
  "Resume Generated",
  "Human Reviewed",
  "Applied",
  "Recruiter Viewed",
  "Recruiter Contact",
  "Recruiter Reject",
  "Online Assessment",
  "Hiring Manager Interview",
  "Product Interview",
  "System Design",
  "Final Round",
  "Offer",
  "Rejected",
  "Withdrawn",
  "Accepted",
];

const archetypes = [
  "AI PM",
  "Platform",
  "Payments",
  "Growth",
  "Marketplace",
  "Enterprise SaaS",
];

const companies = [
  "Northstar AI",
  "Atlas Platform",
  "RiverPay",
  "GrowthLoop",
  "MarketGrid",
  "CloudDesk",
  "Vector Labs",
  "StackForge",
  "TrustWallet",
  "Lifecycle Co",
];

const roleByArchetype: Record<string, string> = {
  "AI PM": "AI Product Manager",
  Platform: "Platform Product Manager",
  Payments: "Payments Product Manager",
  Growth: "Growth Product Manager",
  Marketplace: "Marketplace Product Manager",
  "Enterprise SaaS": "Enterprise SaaS Product Manager",
};

const moduleByArchetype: Record<string, string> = {
  "AI PM": "AI Product Playbook",
  Platform: "Product OS",
  Payments: "Product Leadership Briefs",
  Growth: "Product Leadership Briefs",
  Marketplace: "AI Prioritization Framework",
  "Enterprise SaaS": "Product Discovery Toolkit",
};

const keywordsByArchetype: Record<string, string[]> = {
  "AI PM": ["AI workflows", "model evaluation", "responsible AI"],
  Platform: ["APIs", "reliability", "technical roadmap"],
  Payments: ["payments", "trust", "transaction success"],
  Growth: ["conversion", "retention", "experimentation"],
  Marketplace: ["marketplace", "pricing", "loyalty"],
  "Enterprise SaaS": ["enterprise", "integrations", "adoption"],
};

const competencyByArchetype: Record<string, string[]> = {
  "AI PM": ["AI/ML", "product discovery", "trust and risk"],
  Platform: ["architecture", "cross-team leadership", "scalability"],
  Payments: ["risk management", "reliability", "customer trust"],
  Growth: ["experimentation", "funnel analysis", "commercial ownership"],
  Marketplace: ["monetization", "customer experience", "business cases"],
  "Enterprise SaaS": ["customer discovery", "portfolio strategy", "workflow adoption"],
};

function dateAdd(base: Date, days: number): string {
  const value = new Date(base);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function hashFor(id: string): string {
  let hash = 0;
  for (const char of id) hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
  return Math.abs(hash).toString(16).padStart(8, "0");
}

function buildApplications(): Application[] {
  const start = new Date("2026-01-01T00:00:00Z");
  const finalStages: Stage[] = [
    "Applied",
    "Recruiter Viewed",
    "Recruiter Contact",
    "Recruiter Reject",
    "Online Assessment",
    "Hiring Manager Interview",
    "Product Interview",
    "System Design",
    "Final Round",
    "Offer",
    "Rejected",
    "Withdrawn",
    "Accepted",
  ];

  return Array.from({ length: 50 }, (_, index) => {
    const n = index + 1;
    const id = `APP-${String(n).padStart(3, "0")}`;
    const archetype = archetypes[index % archetypes.length];
    const company = companies[index % companies.length];
    const finalStage = finalStages[index % finalStages.length];
    const applied = dateAdd(start, index * 2);
    const responded = ["Applied", "Recruiter Viewed"].includes(finalStage) ? null : dateAdd(start, index * 2 + 5 + (index % 8));
    const offer = ["Offer", "Accepted"].includes(finalStage);
    const withdrawn = finalStage === "Withdrawn";
    const rejected = ["Rejected", "Recruiter Reject"].includes(finalStage);
    const interviewCount = stages.indexOf(finalStage) >= stages.indexOf("Hiring Manager Interview") ? Math.min(5, 1 + (index % 5)) : 0;
    const experiment = index % 4 === 0 ? "EXP-HEADLINE-001" : index % 5 === 0 ? "EXP-PROJECT-001" : null;

    return {
      application_id: id,
      company,
      role: roleByArchetype[archetype],
      role_archetype: archetype,
      job_url: `https://example.com/jobs/${id.toLowerCase()}`,
      location: index % 3 === 0 ? "Remote" : index % 3 === 1 ? "San Francisco, CA" : "New York, NY",
      employment_type: "Full-time",
      application_source: index % 4 === 0 ? "Referral" : index % 4 === 1 ? "LinkedIn" : index % 4 === 2 ? "Company site" : "Recruiter outreach",
      application_date: applied,
      status: offer ? (finalStage === "Accepted" ? "accepted" : "active") : withdrawn ? "withdrawn" : rejected ? "closed" : "active",
      current_stage: finalStage,
      notes: "Synthetic fixture for Application Intelligence validation.",
      resume_snapshot: {
        resume_version: `resume-v${1 + (index % 3)}.0`,
        resume_plan_version: `plan-v${1 + (index % 4)}.0`,
        narrative_version: `narrative-v${1 + (index % 2)}.0`,
        export_version: "export-v1.0",
        commit_hash: hashFor(id),
        resume_file_path: `docs/resume-os/applications/${id}/resume.json`,
        pdf_path: `docs/resume-os/applications/${id}/resume.pdf`,
        docx_path: `docs/resume-os/applications/${id}/resume.docx`,
        human_review_timestamp: `${applied}T18:00:00+05:30`,
      },
      jd_snapshot: {
        jd_path: `docs/resume-os/job-descriptions/${id}.md`,
        jd_hash: hashFor(`${id}-jd`),
        jd_version: "jd-v1",
        primary_archetype: archetype,
        secondary_archetypes: archetype === "AI PM" ? ["Platform"] : archetype === "Marketplace" ? ["Growth"] : ["Senior PM"],
        keywords: keywordsByArchetype[archetype],
        competencies: competencyByArchetype[archetype],
      },
      manual_overrides: [
        {
          override_type: index % 3 === 0 ? "headline" : index % 3 === 1 ? "summary" : "bullet",
          reason: index % 2 === 0 ? "Improve company relevance" : "Reduce wording risk",
          section: index % 3 === 0 ? "headline" : index % 3 === 1 ? "summary" : "experience",
          time_spent_minutes: 5 + (index % 6) * 3,
          frequency: 1 + (index % 4),
          future_automation_opportunity: index % 2 === 0,
        },
      ],
      outcome: {
        application_date: applied,
        response_date: responded,
        response_type: responded ? (offer ? "offer" : rejected ? "reject" : "interview") : null,
        interview_count: interviewCount,
        offer,
        salary: offer ? 180000 + (index % 5) * 10000 : null,
        rejection_reason: rejected ? (index % 2 === 0 ? "Role fit" : "Timing") : null,
        candidate_withdrawal: withdrawn,
      },
      experiment: {
        experiment_id: experiment,
        variant: experiment ? (index % 2 === 0 ? "A" : "B") : null,
        headline_variant: index % 2 === 0 ? "impact-led" : "domain-led",
        summary_variant: index % 3 === 0 ? "metrics-first" : "archetype-first",
        project_included: index % 2 === 0,
        product_os_module: moduleByArchetype[archetype],
      },
    };
  });
}

function pct(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Number(((numerator / denominator) * 100).toFixed(1));
}

function groupBy<T>(items: T[], key: (item: T) => string): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const value = key(item);
    acc[value] = acc[value] ?? [];
    acc[value].push(item);
    return acc;
  }, {});
}

function daysBetween(start: string, end: string | null): number | null {
  if (!end) return null;
  return Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000);
}

function computeAnalytics(applications: Application[]): Record<string, unknown> {
  const responded = applications.filter((app) => app.outcome.response_date);
  const interviewed = applications.filter((app) => app.outcome.interview_count > 0);
  const offers = applications.filter((app) => app.outcome.offer);
  const responseTimes = responded.map((app) => daysBetween(app.application_date, app.outcome.response_date)).filter((days): days is number => days !== null);
  const byArchetype = Object.fromEntries(Object.entries(groupBy(applications, (app) => app.role_archetype)).map(([key, values]) => [
    key,
    {
      applications: values.length,
      response_rate: pct(values.filter((app) => app.outcome.response_date).length, values.length),
      interview_rate: pct(values.filter((app) => app.outcome.interview_count > 0).length, values.length),
      offer_rate: pct(values.filter((app) => app.outcome.offer).length, values.length),
    },
  ]));
  const byModule = Object.fromEntries(Object.entries(groupBy(applications, (app) => app.experiment.product_os_module)).map(([key, values]) => [
    key,
    {
      applications: values.length,
      interview_rate: pct(values.filter((app) => app.outcome.interview_count > 0).length, values.length),
      offer_rate: pct(values.filter((app) => app.outcome.offer).length, values.length),
    },
  ]));
  return {
    applications: applications.length,
    response_rate: pct(responded.length, applications.length),
    interview_rate: pct(interviewed.length, applications.length),
    offer_rate: pct(offers.length, applications.length),
    average_response_time_days: Number((responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length).toFixed(1)),
    applications_per_archetype: byArchetype,
    applications_per_company: Object.fromEntries(Object.entries(groupBy(applications, (app) => app.company)).map(([key, values]) => [key, values.length])),
    applications_per_role: Object.fromEntries(Object.entries(groupBy(applications, (app) => app.role)).map(([key, values]) => [key, values.length])),
    applications_per_role_pack: Object.fromEntries(Object.entries(groupBy(applications, (app) => app.role_archetype)).map(([key, values]) => [key, values.length])),
    applications_per_resume_version: Object.fromEntries(Object.entries(groupBy(applications, (app) => app.resume_snapshot.resume_version)).map(([key, values]) => [key, values.length])),
    applications_per_product_os_module: byModule,
  };
}

function computeInsights(applications: Application[]): Array<Record<string, unknown>> {
  const analytics = computeAnalytics(applications) as { applications_per_archetype: Record<string, { interview_rate: number }>; applications_per_product_os_module: Record<string, { interview_rate: number }> };
  const topArchetype = Object.entries(analytics.applications_per_archetype).sort((a, b) => b[1].interview_rate - a[1].interview_rate)[0];
  const topModule = Object.entries(analytics.applications_per_product_os_module).sort((a, b) => b[1].interview_rate - a[1].interview_rate)[0];
  const overrideGroups = groupBy(applications.flatMap((app) => app.manual_overrides), (override) => override.section);
  const mostOverridden = Object.entries(overrideGroups).sort((a, b) => b[1].length - a[1].length)[0];
  const responded = applications.filter((app) => app.outcome.response_date);
  const fastest = responded.sort((a, b) => (daysBetween(a.application_date, a.outcome.response_date) ?? 99) - (daysBetween(b.application_date, b.outcome.response_date) ?? 99))[0];
  return [
    { insight: "highest-performing-archetype", value: topArchetype[0], evidence: topArchetype[1] },
    { insight: "highest-performing-product-os-module", value: topModule[0], evidence: topModule[1] },
    { insight: "most-overridden-section", value: mostOverridden[0], evidence: { override_count: mostOverridden[1].length } },
    { insight: "fastest-response-company", value: fastest.company, evidence: { application_id: fastest.application_id, response_days: daysBetween(fastest.application_date, fastest.outcome.response_date) } },
  ];
}

function validate(applications: Application[]): { failures: string[]; warnings: string[] } {
  const failures: string[] = [];
  const warnings: string[] = [];
  const ids = new Set<string>();
  for (const app of applications) {
    if (ids.has(app.application_id)) failures.push(`Duplicate application ID: ${app.application_id}`);
    ids.add(app.application_id);
    if (!stages.includes(app.current_stage)) failures.push(`${app.application_id}: invalid stage ${app.current_stage}`);
    if (Date.parse(app.application_date) > Date.now()) warnings.push(`${app.application_id}: application date is in the future relative to runtime.`);
    if (app.outcome.response_date && Date.parse(app.outcome.response_date) < Date.parse(app.application_date)) failures.push(`${app.application_id}: response before application date.`);
    if (app.outcome.offer && !["Offer", "Accepted"].includes(app.current_stage)) failures.push(`${app.application_id}: offer outcome conflicts with stage.`);
    if (app.current_stage === "Accepted" && app.status !== "accepted") failures.push(`${app.application_id}: accepted stage must use accepted status.`);
    if (app.resume_snapshot.resume_file_path.endsWith(".md")) failures.push(`${app.application_id}: resume snapshot must reference files, not duplicate content.`);
  }
  return { failures, warnings };
}

function renderMarkdown(applications: Application[], analytics: Record<string, unknown>, insights: Array<Record<string, unknown>>, validation: { failures: string[]; warnings: string[] }): string {
  return [
    "# Application Intelligence Synthetic Results",
    "",
    `Applications: ${applications.length}`,
    `Validation failures: ${validation.failures.length}`,
    `Validation warnings: ${validation.warnings.length}`,
    "",
    "## Portfolio Metrics",
    "",
    `- Response rate: ${analytics.response_rate}%`,
    `- Interview rate: ${analytics.interview_rate}%`,
    `- Offer rate: ${analytics.offer_rate}%`,
    `- Average response time: ${analytics.average_response_time_days} days`,
    "",
    "## Deterministic Insights",
    "",
    ...insights.map((item) => `- ${item.insight}: ${item.value} (${JSON.stringify(item.evidence)})`),
    "",
  ].join("\n");
}

type RegistryApplication = {
  application_id: string;
  company_name: string;
  role_title: string;
  role_pack?: string | null;
  job_url?: string | null;
  location?: string | null;
  employment_type?: string | null;
  application_source?: string | null;
  application_date?: string | null;
  current_stage: string;
  current_status: string;
  resume_version?: string | null;
  resume_plan_path?: string | null;
  narrative_output_path?: string | null;
  export_commit_hash?: string | null;
  pdf_path?: string | null;
  docx_path?: string | null;
  jd_path?: string | null;
  jd_hash?: string | null;
  product_os_modules?: string[];
  response_received?: boolean;
  response_date?: string | null;
  interview_count?: number;
  offer_received?: boolean;
  final_outcome?: string | null;
};

function titleStage(stage: string): Stage {
  const mapped: Record<string, Stage> = {
    discovered: "Discovered",
    saved: "Saved",
    resume_generated: "Resume Generated",
    human_reviewed: "Human Reviewed",
    applied: "Applied",
    recruiter_contact: "Recruiter Contact",
    recruiter_screen: "Recruiter Contact",
    recruiter_viewed: "Recruiter Viewed",
    online_assessment: "Online Assessment",
    hiring_manager_interview: "Hiring Manager Interview",
    product_interview: "Product Interview",
    system_design: "System Design",
    final_round: "Final Round",
    offer: "Offer",
    rejected: "Rejected",
    withdrawn: "Withdrawn",
    accepted: "Accepted",
    closed: "Rejected",
  };
  return mapped[stage] ?? "Applied";
}

function registryStatus(app: RegistryApplication): Application["status"] {
  if (app.current_stage === "accepted") return "accepted";
  if (app.current_stage === "withdrawn") return "withdrawn";
  if (["rejected", "closed"].includes(app.current_stage)) return "closed";
  return "active";
}

function loadRegistryProjection(): Application[] {
  if (!existsSync(registryFixtureApplications)) return [];
  return readdirSync(registryFixtureApplications)
    .filter((name) => name.endsWith(".json"))
    .map((name) => JSON.parse(readFileSync(path.join(registryFixtureApplications, name), "utf8")) as RegistryApplication)
    .filter((app) => !["discovered", "saved"].includes(app.current_stage))
    .map((app) => ({
      application_id: app.application_id,
      company: app.company_name,
      role: app.role_title,
      role_archetype: app.role_pack ?? "Unknown",
      job_url: app.job_url ?? "",
      location: app.location ?? "",
      employment_type: app.employment_type ?? "",
      application_source: app.application_source ?? "unknown",
      application_date: app.application_date ?? "2026-01-01",
      status: registryStatus(app),
      current_stage: titleStage(app.current_stage),
      notes: "Sanitized registry projection.",
      resume_snapshot: {
        resume_version: app.resume_version ?? "unknown",
        resume_plan_version: app.resume_plan_path ?? "unknown",
        narrative_version: app.narrative_output_path ?? "unknown",
        export_version: app.export_commit_hash ?? "unknown",
        commit_hash: app.export_commit_hash ?? "unknown",
        resume_file_path: app.resume_plan_path ?? "",
        pdf_path: app.pdf_path ?? "",
        docx_path: app.docx_path ?? "",
        human_review_timestamp: app.application_date ?? "2026-01-01",
      },
      jd_snapshot: {
        jd_path: app.jd_path ?? "",
        jd_hash: app.jd_hash ?? "",
        jd_version: "registry-projection",
        primary_archetype: app.role_pack ?? "Unknown",
        secondary_archetypes: [],
        keywords: [],
        competencies: [],
      },
      manual_overrides: [],
      outcome: {
        application_date: app.application_date ?? "2026-01-01",
        response_date: app.response_date ?? null,
        response_type: app.final_outcome ?? (app.response_received ? "response" : null),
        interview_count: app.interview_count ?? 0,
        offer: app.offer_received ?? false,
        salary: null,
        rejection_reason: null,
        candidate_withdrawal: app.current_stage === "withdrawn",
      },
      experiment: {
        experiment_id: null,
        variant: null,
        headline_variant: "registry-projection",
        summary_variant: "registry-projection",
        project_included: Boolean(app.product_os_modules?.length),
        product_os_module: app.product_os_modules?.[0] ?? "none",
      },
    }));
}

function main(): void {
  mkdirSync(dataRoot, { recursive: true });
  mkdirSync(reportRoot, { recursive: true });
  const applications = buildApplications();
  const analytics = computeAnalytics(applications);
  const insights = computeInsights(applications);
  const validation = validate(applications);
  writeFileSync(path.join(dataRoot, "applications.synthetic.json"), `${JSON.stringify(applications, null, 2)}\n`);
  writeFileSync(path.join(reportRoot, "analytics.synthetic.json"), `${JSON.stringify(analytics, null, 2)}\n`);
  writeFileSync(path.join(reportRoot, "insights.synthetic.json"), `${JSON.stringify(insights, null, 2)}\n`);
  writeFileSync(path.join(reportRoot, "validation-summary.json"), `${JSON.stringify({ status: validation.failures.length ? "fail" : "pass", ...validation }, null, 2)}\n`);
  writeFileSync(path.join(reportRoot, "synthetic-results.md"), renderMarkdown(applications, analytics, insights, validation));
  const registryProjection = loadRegistryProjection();
  if (registryProjection.length) {
    const projectionAnalytics = computeAnalytics(registryProjection);
    writeFileSync(path.join(reportRoot, "registry-projection.synthetic.json"), `${JSON.stringify(registryProjection, null, 2)}\n`);
    writeFileSync(path.join(reportRoot, "registry-projection-analytics.synthetic.json"), `${JSON.stringify(projectionAnalytics, null, 2)}\n`);
  }
  console.log(`Application Intelligence generated ${applications.length} synthetic applications.`);
  console.log(`Validation failures: ${validation.failures.length}; warnings: ${validation.warnings.length}.`);
  if (validation.failures.length) process.exitCode = 1;
}

main();
