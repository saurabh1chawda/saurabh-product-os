import type { Metadata } from "next";
import { ApplicationTable } from "@/components/career-console/application-table";
import { CareerShell } from "@/components/career-console/career-shell";
import { getCareerConsoleData } from "@/lib/career-console-data";

export const metadata: Metadata = {
  title: "Applications | Career OS",
  description: "Read-only searchable application registry view."
};

export default function ApplicationsPage() {
  const data = getCareerConsoleData();

  return (
    <CareerShell
      active="Applications"
      title="Applications"
      subtitle="Search and inspect application records without mutating the registry."
      breadcrumbs={["Career OS", "Applications"]}
    >
      <ApplicationTable applications={data.applications} />
    </CareerShell>
  );
}
