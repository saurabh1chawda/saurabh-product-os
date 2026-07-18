import type { Metadata } from "next";
import Link from "next/link";
import { CareerShell } from "@/components/career-console/career-shell";
import { getCareerConsoleData } from "@/lib/career-console-data";

export const metadata: Metadata = {
  title: "Career OS | Product OS",
  description: "Read-only Career OS command center for managing job-search operations."
};

export default function CareerOsHomePage() {
  const data = getCareerConsoleData();

  return (
    <CareerShell
      active="Home"
      title="Career OS"
      subtitle="A local-first command center for deciding what to do next across applications, tasks, evidence, and outcomes."
      breadcrumbs={["Career OS", "Home"]}
    >
      <section className="rounded-md border border-line bg-panel p-6 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-muted">Start here</p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">Operations is the primary working surface.</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          The console currently renders {data.applications.length} public-safe application records, {data.tasks.length} tasks, and deterministic
          Application Intelligence metrics. Other modules are present as navigation placeholders for the broader Career OS architecture.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/career-os/operations"
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Open Operations Console
          </Link>
          <Link
            href="/career-os/applications"
            className="rounded-md border border-line px-4 py-2 text-sm font-semibold text-muted transition hover:border-accent hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            View Applications
          </Link>
        </div>
      </section>
    </CareerShell>
  );
}
