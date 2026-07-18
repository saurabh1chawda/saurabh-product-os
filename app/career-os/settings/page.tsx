import type { Metadata } from "next";
import { CareerShell, PlaceholderModule } from "@/components/career-console/career-shell";

export const metadata: Metadata = {
  title: "Settings | Career OS",
  description: "Future Career OS settings module placeholder."
};

export default function SettingsPage() {
  return (
    <CareerShell
      active="Settings"
      title="Settings"
      subtitle="Future module for local-first preferences and validation configuration."
      breadcrumbs={["Career OS", "Settings"]}
    >
      <PlaceholderModule moduleName="Settings" purpose="Planned area for display preferences, validation thresholds, and module configuration." />
    </CareerShell>
  );
}
