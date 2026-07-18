import type { Metadata } from "next";
import { CareerShell, PlaceholderModule } from "@/components/career-console/career-shell";

export const metadata: Metadata = {
  title: "Resume OS | Career OS",
  description: "Future Resume OS console module placeholder."
};

export default function ResumeOsConsolePage() {
  return (
    <CareerShell
      active="Resume OS"
      title="Resume OS"
      subtitle="Future module for resume pipeline visibility after export and human-review flows are operationalized."
      breadcrumbs={["Career OS", "Resume OS"]}
    >
      <PlaceholderModule moduleName="Resume OS" purpose="Planned read-only interface for approved drafts, exports, evidence maps, and version performance." />
    </CareerShell>
  );
}
