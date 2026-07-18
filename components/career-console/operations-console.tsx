import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, ListChecks, ShieldCheck } from "lucide-react";
import type { ConsoleAction, ConsoleData, LeaderboardRow, TaskRecord } from "@/lib/career-console-data";

function priorityClass(priority: ConsoleAction["priority"]) {
  if (priority === "high") {
    return "border-l-red-500 bg-red-50/70";
  }

  if (priority === "medium") {
    return "border-l-amber-500 bg-amber-50/70";
  }

  return "border-l-accent bg-accent-soft/60";
}

function ActionList({ actions, emptyText }: { actions: ConsoleAction[]; emptyText: string }) {
  if (actions.length === 0) {
    return <p className="rounded-md border border-line bg-panel p-4 text-sm text-muted">{emptyText}</p>;
  }

  return (
    <div className="space-y-2">
      {actions.map((action) => (
        <Link
          key={action.id}
          href={action.href}
          className={`block rounded-md border border-line border-l-4 p-3 transition hover:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${priorityClass(
            action.priority
          )}`}
        >
          <span className="flex items-start justify-between gap-4">
            <span>
              <span className="block text-sm font-semibold text-ink">{action.title}</span>
              <span className="mt-1 block text-xs text-muted">
                {action.company} · {action.reason}
              </span>
            </span>
            <span className="shrink-0 text-xs font-semibold text-muted">{action.dueLabel}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}

function Panel({ title, children, actionHref }: { title: string; children: React.ReactNode; actionHref?: string }) {
  return (
    <section className="rounded-md border border-line bg-panel p-4 shadow-soft">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {actionHref ? (
          <Link href={actionHref} className="text-sm font-semibold text-accent hover:text-ink">
            View all
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function MetricGrid({ metrics }: { metrics: ConsoleData["performance"] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <div key={metric.label} className="rounded-md border border-line bg-panel p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">{metric.label}</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{metric.value}</p>
          <p className="mt-1 text-xs leading-5 text-muted">{metric.detail}</p>
        </div>
      ))}
    </div>
  );
}

function Pipeline({ pipeline }: { pipeline: ConsoleData["pipeline"] }) {
  return (
    <div className="space-y-3">
      {pipeline.map((stage) => (
        <div key={stage.label} className="grid grid-cols-[130px_1fr_60px] items-center gap-3 text-sm">
          <span className="font-medium text-ink">{stage.label}</span>
          <span className="h-2 rounded-full bg-accent-soft">
            <span className="block h-2 rounded-full bg-accent" style={{ width: `${stage.percentage}%` }} />
          </span>
          <span className="text-right font-semibold text-ink">{stage.count}</span>
        </div>
      ))}
    </div>
  );
}

function Leaderboard({ rows, variant }: { rows: LeaderboardRow[]; variant: "resume" | "archetype" | "company" }) {
  const columns =
    variant === "company"
      ? ["Company", "Apps", "Response", "Interview", "Offer", "Avg Days"]
      : [variant === "resume" ? "Resume" : "Archetype", "Apps", "Interviews", "Offers", "Win Rate"];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead className="border-b border-line text-xs uppercase tracking-[0.08em] text-muted">
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col" className="py-2 pr-3 font-semibold">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.slice(0, 6).map((row) => (
            <tr key={row.name}>
              <td className="py-3 pr-3 font-medium text-ink">{row.name}</td>
              <td className="py-3 pr-3 text-muted">{row.applications}</td>
              {variant === "company" ? (
                <>
                  <td className="py-3 pr-3 text-muted">{row.responseRate}%</td>
                  <td className="py-3 pr-3 text-muted">{row.interviewRate}%</td>
                  <td className="py-3 pr-3 text-muted">{row.offerRate}%</td>
                  <td className="py-3 pr-3 text-muted">{row.averageResponseTime || "n/a"}</td>
                </>
              ) : (
                <>
                  <td className="py-3 pr-3 text-muted">{row.interviews}</td>
                  <td className="py-3 pr-3 text-muted">{row.offers}</td>
                  <td className="py-3 pr-3 font-semibold text-ink">{row.interviewRate}%</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HealthGrid({ health }: { health: ConsoleData["health"] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {health.map((item) => (
        <div key={item.label} className="rounded-md border border-line bg-panel p-3">
          <div className="flex items-center gap-2">
            {item.status === "pass" ? (
              <CheckCircle2 className="h-4 w-4 text-accent" aria-hidden="true" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" />
            )}
            <p className="text-sm font-semibold text-ink">{item.label}</p>
          </div>
          <p className="mt-2 text-xl font-semibold text-ink">{item.value}</p>
          <p className="mt-1 text-xs leading-5 text-muted">{item.detail}</p>
        </div>
      ))}
    </div>
  );
}

function TaskCenter({ tasks }: { tasks: TaskRecord[] }) {
  const groups = [
    { label: "Due Today", items: tasks.filter((task) => task.status !== "completed" && task.due_at === "2026-07-18") },
    { label: "Upcoming", items: tasks.filter((task) => task.status !== "completed" && task.due_at > "2026-07-18") },
    { label: "Overdue", items: tasks.filter((task) => task.status !== "completed" && task.due_at < "2026-07-18") },
    { label: "Completed", items: tasks.filter((task) => task.status === "completed") }
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {groups.map((group) => (
        <div key={group.label} className="rounded-md border border-line p-3">
          <p className="text-sm font-semibold text-ink">{group.label}</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{group.items.length}</p>
          <ul className="mt-3 space-y-2 text-xs text-muted">
            {group.items.slice(0, 4).map((task) => (
              <li key={task.task_id} className="flex items-center justify-between gap-2">
                <span>{task.application_id}</span>
                <span>{task.priority}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function OperationsConsole({ data }: { data: ConsoleData }) {
  return (
    <div className="space-y-6">
      <section className="rounded-md border border-accent bg-panel p-4 shadow-soft">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent">Today&apos;s Actions</p>
            <h2 className="mt-1 text-xl font-semibold text-ink">What should I do next?</h2>
          </div>
          <Link href="/career-os/applications" className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-ink">
            Open application list <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <ActionList actions={data.actions} emptyText="No operational actions are due today." />
      </section>

      <section className="rounded-md border border-line bg-accent-soft p-4">
        <div className="flex items-start gap-3">
          <ListChecks className="mt-1 h-5 w-5 text-accent" aria-hidden="true" />
          <div>
            <h2 className="text-base font-semibold text-ink">Daily Brief</h2>
            <ul className="mt-2 grid gap-2 text-sm leading-6 text-muted lg:grid-cols-2">
              {data.dailyBrief.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <MetricGrid metrics={data.performance} />

      <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
        <Panel title="Pipeline Overview">
          <Pipeline pipeline={data.pipeline} />
        </Panel>
        <Panel title="Upcoming Timeline">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
                <Clock className="h-4 w-4" aria-hidden="true" /> Today
              </p>
              <ActionList actions={data.timeline.today.slice(0, 4)} emptyText="Nothing due today." />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-ink">Tomorrow</p>
              <ActionList actions={data.timeline.tomorrow.slice(0, 4)} emptyText="Nothing due tomorrow." />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-ink">Next 7 Days</p>
              <ActionList actions={data.timeline.next7.slice(0, 4)} emptyText="No upcoming work." />
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title="Resume Performance">
          <Leaderboard rows={data.resumePerformance} variant="resume" />
        </Panel>
        <Panel title="Role Archetype Performance">
          <Leaderboard rows={data.archetypePerformance} variant="archetype" />
        </Panel>
        <Panel title="Company Performance">
          <Leaderboard rows={data.companyPerformance} variant="company" />
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Panel title="Operational Warnings">
          <ActionList actions={data.warnings} emptyText="No deterministic warnings found." />
        </Panel>
        <Panel title="Insights">
          <div className="space-y-3">
            {data.insights.map((insight) => (
              <div key={`${insight.label}-${insight.value}`} className="rounded-md border border-line p-3">
                <p className="text-sm font-semibold text-ink">{insight.label}</p>
                <p className="mt-1 text-lg font-semibold text-accent">{insight.value}</p>
                <p className="mt-1 text-xs leading-5 text-muted">{insight.evidence}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Registry Health">
        <HealthGrid health={data.health} />
      </Panel>

      <Panel title="Task Center">
        <TaskCenter tasks={data.tasks} />
      </Panel>

      <section className="rounded-md border border-line bg-panel p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 h-5 w-5 text-accent" aria-hidden="true" />
          <div>
            <h2 className="text-base font-semibold text-ink">Read-only assurance</h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              This console consumes fixture registry and Application Intelligence reports only. It does not create, edit, delete, or mutate
              application records.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
