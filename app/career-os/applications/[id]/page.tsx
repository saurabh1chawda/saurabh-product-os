import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CareerShell } from "@/components/career-console/career-shell";
import { getApplicationDetail, getCareerConsoleData } from "@/lib/career-console-data";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const detail = getApplicationDetail(id);

  return {
    title: detail ? `${detail.application.company_name} | Career OS` : "Application | Career OS",
    description: "Read-only Career OS application detail."
  };
}

export function generateStaticParams() {
  return getCareerConsoleData().applications.map((application) => ({
    id: application.application_id
  }));
}

export default async function ApplicationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const detail = getApplicationDetail(id);

  if (!detail) {
    notFound();
  }

  const { application, contacts, tasks, events } = detail;

  return (
    <CareerShell
      active="Applications"
      title={application.company_name}
      subtitle={`${application.role_title} · ${application.current_stage.replace(/_/g, " ")} · read-only application detail`}
      breadcrumbs={["Career OS", "Applications", application.application_id]}
    >
      <div className="space-y-5">
        <Link href="/career-os/applications" className="text-sm font-semibold text-accent hover:text-ink">
          Back to applications
        </Link>
        <section className="grid gap-4 lg:grid-cols-3">
          <DetailPanel title="Application Metadata">
            <Definition label="Application ID" value={application.application_id} />
            <Definition label="Role level" value={application.role_level ?? "Not set"} />
            <Definition label="Stage" value={application.current_stage} />
            <Definition label="Status" value={application.current_status} />
            <Definition label="Priority" value={application.priority} />
            <Definition label="Applied" value={application.application_date} />
          </DetailPanel>
          <DetailPanel title="Resume Snapshot">
            <Definition label="Resume version" value={application.resume_version ?? "Missing"} />
            <Definition label="Resume snapshot" value={application.resume_snapshot_id ?? "Missing"} />
            <Definition label="Resume plan" value={application.resume_plan_path ?? "Missing"} />
            <Definition label="DOCX" value={application.docx_path ?? "Not exported"} />
            <Definition label="PDF" value={application.pdf_path ?? "Not exported"} />
          </DetailPanel>
          <DetailPanel title="JD Snapshot">
            <Definition label="JD snapshot" value={application.jd_snapshot_id ?? "Missing"} />
            <Definition label="JD path" value={application.jd_path ?? "Missing"} />
            <Definition label="Role pack" value={application.role_pack ?? "Missing"} />
            <Definition label="Product OS modules" value={application.product_os_modules.join(", ") || "None"} />
          </DetailPanel>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <DetailPanel title="Contacts">
            {contacts.length ? (
              contacts.map((contact) => (
                <div key={contact.contact_id} className="rounded-md border border-line p-3">
                  <p className="font-semibold text-ink">{contact.full_name}</p>
                  <p className="text-sm text-muted">
                    {contact.role} · {contact.relationship_type} · Follow-up {contact.follow_up_allowed ? "allowed" : "not allowed"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted">No linked contacts.</p>
            )}
          </DetailPanel>
          <DetailPanel title="Tasks">
            {tasks.length ? (
              tasks.map((task) => (
                <div key={task.task_id} className="rounded-md border border-line p-3">
                  <p className="font-semibold text-ink">{task.title}</p>
                  <p className="text-sm text-muted">
                    {task.status} · {task.priority} · Due {task.due_at}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted">No linked tasks.</p>
            )}
          </DetailPanel>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <DetailPanel title="Events">
            {events.length ? (
              <ol className="space-y-2">
                {events.map((event, index) => (
                  <li key={`${event.application_id}-${index}`} className="rounded-md border border-line p-3 text-sm text-muted">
                    {event.event_type ?? "event"} · {event.created_at ?? event.timestamp ?? "timestamp unavailable"}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted">No event records found.</p>
            )}
          </DetailPanel>
          <DetailPanel title="Outcome">
            <Definition label="Response received" value={application.response_received ? "Yes" : "No"} />
            <Definition label="Response date" value={application.response_date ?? "Not received"} />
            <Definition label="Interviews" value={String(application.interview_count)} />
            <Definition label="Offer received" value={application.offer_received ? "Yes" : "No"} />
            <Definition label="Final outcome" value={application.final_outcome ?? "Open"} />
            <Definition label="Safe to commit" value={application.safe_to_commit ? "Yes" : "No"} />
          </DetailPanel>
        </section>
      </div>
    </CareerShell>
  );
}

function DetailPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-line bg-panel p-4 shadow-soft">
      <h2 className="mb-3 text-base font-semibold text-ink">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Definition({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-line pb-2 last:border-b-0 last:pb-0">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">{label}</p>
      <p className="mt-1 break-words text-sm text-ink">{value}</p>
    </div>
  );
}
