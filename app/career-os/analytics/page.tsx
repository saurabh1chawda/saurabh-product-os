import type { Metadata } from "next";
import { CareerShell, PlaceholderModule } from "@/components/career-console/career-shell";

export const metadata: Metadata = {
  title: "Analytics | Career OS",
  description: "Future Career OS analytics module placeholder."
};

export default function AnalyticsPage() {
  return (
    <CareerShell
      active="Analytics"
      title="Analytics"
      subtitle="Future module for deeper cohort analysis after the operational console is stable."
      breadcrumbs={["Career OS", "Analytics"]}
    >
      <PlaceholderModule moduleName="Analytics" purpose="Planned surface for deeper application intelligence, cohort trends, and long-horizon performance analysis." />
    </CareerShell>
  );
}
