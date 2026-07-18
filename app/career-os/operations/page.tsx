import type { Metadata } from "next";
import { CareerShell } from "@/components/career-console/career-shell";
import { OperationsConsole } from "@/components/career-console/operations-console";
import { getCareerConsoleData } from "@/lib/career-console-data";

export const metadata: Metadata = {
  title: "Operations Console | Career OS",
  description: "Action-first operational console for Career OS."
};

export default function OperationsPage() {
  const data = getCareerConsoleData();

  return (
    <CareerShell
      active="Operations"
      title="Operations Console"
      subtitle="Action-first command center for follow-ups, interviews, warnings, registry health, and deterministic job-search performance."
      breadcrumbs={["Career OS", "Operations"]}
    >
      <OperationsConsole data={data} />
    </CareerShell>
  );
}
