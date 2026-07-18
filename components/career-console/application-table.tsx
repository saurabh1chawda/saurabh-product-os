"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ApplicationRecord } from "@/lib/career-console-data";

type ApplicationTableProps = {
  applications: ApplicationRecord[];
};

const PAGE_SIZE = 10;

function uniqueValues(applications: ApplicationRecord[], key: keyof ApplicationRecord) {
  return [...new Set(applications.map((application) => String(application[key] ?? "")).filter(Boolean))].sort();
}

function contains(value: unknown, query: string) {
  return String(value ?? "")
    .toLowerCase()
    .includes(query.toLowerCase());
}

export function ApplicationTable({ applications }: ApplicationTableProps) {
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [archetype, setArchetype] = useState("");
  const [resumeVersion, setResumeVersion] = useState("");
  const [sortKey, setSortKey] = useState<"application_date" | "company_name" | "current_stage" | "priority">("application_date");
  const [page, setPage] = useState(1);

  const stages = useMemo(() => uniqueValues(applications, "current_stage"), [applications]);
  const statuses = useMemo(() => uniqueValues(applications, "current_status"), [applications]);
  const priorities = useMemo(() => uniqueValues(applications, "priority"), [applications]);
  const archetypes = useMemo(() => uniqueValues(applications, "role_pack"), [applications]);
  const resumeVersions = useMemo(() => uniqueValues(applications, "resume_version"), [applications]);

  const filtered = useMemo(() => {
    const rows = applications.filter((application) => {
      const searchMatch =
        !query ||
        contains(application.company_name, query) ||
        contains(application.role_title, query) ||
        contains(application.role_pack, query) ||
        contains(application.product_os_modules.join(" "), query) ||
        contains(application.tags.join(" "), query);

      return (
        searchMatch &&
        (!stage || application.current_stage === stage) &&
        (!status || application.current_status === status) &&
        (!priority || application.priority === priority) &&
        (!archetype || application.role_pack === archetype) &&
        (!resumeVersion || application.resume_version === resumeVersion)
      );
    });

    return rows.sort((a, b) => {
      const left = String(a[sortKey] ?? "");
      const right = String(b[sortKey] ?? "");
      return sortKey === "application_date" ? right.localeCompare(left) : left.localeCompare(right);
    });
  }, [applications, archetype, priority, query, resumeVersion, sortKey, stage, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function resetFilters() {
    setQuery("");
    setStage("");
    setStatus("");
    setPriority("");
    setArchetype("");
    setResumeVersion("");
    setPage(1);
  }

  return (
    <section className="rounded-md border border-line bg-panel p-4 shadow-soft">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Application List</h2>
          <p className="mt-1 text-sm text-muted">Search, filter, sort, and open read-only application details.</p>
        </div>
        <button
          type="button"
          onClick={resetFilters}
          className="rounded-md border border-line px-3 py-2 text-sm font-semibold text-muted transition hover:border-accent hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Reset filters
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="text-sm font-medium text-ink">
          Search
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            placeholder="Company, role, tag, module"
          />
        </label>
        <Select label="Stage" value={stage} onChange={setStage} options={stages} />
        <Select label="Status" value={status} onChange={setStatus} options={statuses} />
        <Select label="Priority" value={priority} onChange={setPriority} options={priorities} />
        <Select label="Archetype" value={archetype} onChange={setArchetype} options={archetypes} />
        <Select label="Resume Version" value={resumeVersion} onChange={setResumeVersion} options={resumeVersions} />
        <label className="text-sm font-medium text-ink">
          Sort
          <select
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as typeof sortKey)}
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <option value="application_date">Application date</option>
            <option value="company_name">Company</option>
            <option value="current_stage">Stage</option>
            <option value="priority">Priority</option>
          </select>
        </label>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-[0.08em] text-muted">
            <tr>
              <th scope="col" className="py-2 pr-3 font-semibold">
                Company
              </th>
              <th scope="col" className="py-2 pr-3 font-semibold">
                Role
              </th>
              <th scope="col" className="py-2 pr-3 font-semibold">
                Stage
              </th>
              <th scope="col" className="py-2 pr-3 font-semibold">
                Status
              </th>
              <th scope="col" className="py-2 pr-3 font-semibold">
                Priority
              </th>
              <th scope="col" className="py-2 pr-3 font-semibold">
                Archetype
              </th>
              <th scope="col" className="py-2 pr-3 font-semibold">
                Resume
              </th>
              <th scope="col" className="py-2 pr-3 font-semibold">
                Applied
              </th>
              <th scope="col" className="py-2 pr-3 font-semibold">
                Outcome
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((application) => (
              <tr key={application.application_id} tabIndex={0} className="focus:outline-none focus-visible:bg-accent-soft">
                <td className="py-3 pr-3 font-semibold text-ink">
                  <Link className="rounded-sm text-accent hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent" href={`/career-os/applications/${application.application_id}`}>
                    {application.company_name}
                  </Link>
                </td>
                <td className="py-3 pr-3 text-muted">{application.role_title}</td>
                <td className="py-3 pr-3 text-muted">{application.current_stage.replace(/_/g, " ")}</td>
                <td className="py-3 pr-3 text-muted">{application.current_status.replace(/_/g, " ")}</td>
                <td className="py-3 pr-3 text-muted">{application.priority}</td>
                <td className="py-3 pr-3 text-muted">{application.role_pack}</td>
                <td className="py-3 pr-3 text-muted">{application.resume_version}</td>
                <td className="py-3 pr-3 text-muted">{application.application_date}</td>
                <td className="py-3 pr-3 text-muted">{application.final_outcome ?? application.current_stage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-3 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <p>
          Showing {rows.length} of {filtered.length} applications
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={currentPage === 1}
            className="rounded-md border border-line px-3 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            disabled={currentPage === totalPages}
            className="rounded-md border border-line px-3 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}

function Select({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="text-sm font-medium text-ink">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replace(/_/g, " ")}
          </option>
        ))}
      </select>
    </label>
  );
}
