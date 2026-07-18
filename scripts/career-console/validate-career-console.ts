import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const fixtureRoot = path.join(ROOT, "docs", "application-registry", "fixtures", "synthetic-registry");
const appDir = path.join(fixtureRoot, "applications");
const contactDir = path.join(fixtureRoot, "contacts");
const taskDir = path.join(fixtureRoot, "tasks");
const careerRoutes = [
  "app/career-os/page.tsx",
  "app/career-os/operations/page.tsx",
  "app/career-os/applications/page.tsx",
  "app/career-os/applications/[id]/page.tsx",
  "app/career-os/analytics/page.tsx",
  "app/career-os/resume-os/page.tsx",
  "app/career-os/settings/page.tsx"
];
const docs = [
  "docs/career-console/architecture.md",
  "docs/career-console/navigation.md",
  "docs/career-console/component-library.md",
  "docs/career-console/dashboard-model.md",
  "docs/career-console/design-principles.md",
  "docs/career-console/accessibility.md",
  "docs/career-console/performance.md",
  "docs/career-console/roadmap.md"
];

type Application = {
  application_id: string;
  company_name: string;
  jd_snapshot_id: string | null;
  resume_snapshot_id: string | null;
  safe_to_commit: boolean;
  contains_personal_data: boolean;
};

type Task = {
  task_id: string;
  application_id: string;
};

type Contact = {
  contact_id: string;
  related_application_ids: string[];
  safe_to_commit: boolean;
};

const failures: string[] = [];
const warnings: string[] = [];

function readJsonDir<T>(dir: string): T[] {
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => JSON.parse(fs.readFileSync(path.join(dir, file), "utf8")) as T);
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    failures.push(message);
  }
}

function warn(condition: boolean, message: string) {
  if (!condition) {
    warnings.push(message);
  }
}

for (const route of careerRoutes) {
  assert(fs.existsSync(path.join(ROOT, route)), `Missing Career OS route: ${route}`);
}

for (const doc of docs) {
  assert(fs.existsSync(path.join(ROOT, doc)), `Missing Career Console documentation: ${doc}`);
}

const applications = readJsonDir<Application>(appDir);
const contacts = readJsonDir<Contact>(contactDir);
const tasks = readJsonDir<Task>(taskDir);
const applicationIds = new Set(applications.map((application) => application.application_id));

assert(applications.length === 30, `Expected 30 synthetic applications, found ${applications.length}`);
assert(contacts.length > 0, "Expected synthetic contacts to be available");
assert(tasks.length > 0, "Expected synthetic tasks to be available");

for (const application of applications) {
  assert(application.safe_to_commit === true, `${application.application_id} is not marked safe to commit`);
  assert(application.contains_personal_data === false, `${application.application_id} contains personal data`);
  warn(Boolean(application.jd_snapshot_id), `${application.application_id} is missing JD traceability`);
  warn(Boolean(application.resume_snapshot_id), `${application.application_id} is missing resume traceability`);
}

for (const contact of contacts) {
  assert(contact.safe_to_commit === true, `${contact.contact_id} is not marked safe to commit`);
  for (const applicationId of contact.related_application_ids) {
    assert(applicationIds.has(applicationId), `${contact.contact_id} references missing application ${applicationId}`);
  }
}

for (const task of tasks) {
  assert(applicationIds.has(task.application_id), `${task.task_id} references missing application ${task.application_id}`);
}

const sourceFiles = [
  "lib/career-console-data.ts",
  "components/career-console/career-shell.tsx",
  "components/career-console/operations-console.tsx",
  "components/career-console/application-table.tsx",
  ...careerRoutes
];

for (const source of sourceFiles) {
  const text = fs.readFileSync(path.join(ROOT, source), "utf8");
  assert(!text.includes("data/private"), `${source} references private registry data`);
  assert(!text.includes("createApplication"), `${source} appears to import mutation behavior`);
  assert(!text.includes("updateApplication"), `${source} appears to import mutation behavior`);
  assert(!text.includes("deleteApplication"), `${source} appears to import mutation behavior`);
}

const operationsSource = fs.readFileSync(path.join(ROOT, "components/career-console/operations-console.tsx"), "utf8");
assert(operationsSource.includes("Today&apos;s Actions"), "Operations Console does not prioritize Today's Actions");
assert(operationsSource.includes("Read-only assurance"), "Operations Console is missing read-only assurance");
assert(operationsSource.includes("Registry Health"), "Operations Console is missing Registry Health");
assert(operationsSource.includes("Daily Brief"), "Operations Console is missing Daily Brief");

const tableSource = fs.readFileSync(path.join(ROOT, "components/career-console/application-table.tsx"), "utf8");
assert(tableSource.includes("label"), "Application table controls must remain labeled");
assert(tableSource.includes("tabIndex"), "Application table should preserve keyboard row navigation");
assert(tableSource.includes("PAGE_SIZE"), "Application table should preserve pagination");

console.log("Career Console validation");
console.log(`Applications: ${applications.length}`);
console.log(`Contacts: ${contacts.length}`);
console.log(`Tasks: ${tasks.length}`);
console.log(`Warnings: ${warnings.length}`);
console.log(`Failures: ${failures.length}`);

for (const warning of warnings) {
  console.warn(`WARN: ${warning}`);
}

for (const failure of failures) {
  console.error(`FAIL: ${failure}`);
}

if (failures.length > 0) {
  process.exit(1);
}
