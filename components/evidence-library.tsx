import {
  BadgeCheck,
  Beaker,
  CalendarDays,
  CircleAlert,
  FileText,
  GitBranch,
  LayoutTemplate,
  ListChecks,
  Map,
  Monitor,
  Network,
  NotebookText,
  Route,
  ShieldCheck,
  Workflow
} from "lucide-react";

import type { EvidenceArtifactStatus, EvidenceArtifactType, ProductStory } from "@/data/product-stories";
import { cn } from "@/lib/utils";

type EvidenceLibraryProps = {
  artifacts: ProductStory["evidence"];
};

const artifactIcons: Record<EvidenceArtifactType, typeof FileText> = {
  PRD: FileText,
  Roadmap: GitBranch,
  Wireframe: LayoutTemplate,
  Dashboard: Monitor,
  Experiment: Beaker,
  "User Journey": Map,
  "Architecture Diagram": Network,
  "Prioritization Matrix": ListChecks,
  "Release Timeline": CalendarDays,
  "Stakeholder Memo": NotebookText,
  "Payment Journey": Route,
  "Transaction Funnel": Workflow,
  "Reliability Dashboard": ShieldCheck,
  "Failure Analysis": CircleAlert,
  "Sequence Diagram": Network
};

const statusStyles: Record<EvidenceArtifactStatus, string> = {
  Published: "border-accent bg-accent-soft text-accent",
  Representative: "border-line bg-paper text-muted",
  "Coming Soon": "border-line bg-panel text-muted"
};

export function EvidenceLibrary({ artifacts }: EvidenceLibraryProps) {
  return (
    <section className="border-b border-line" aria-labelledby="evidence-library-title">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="flex max-w-3xl flex-col gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Supporting Evidence</p>
            <h2 id="evidence-library-title" className="mt-3 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
              Evidence Library
            </h2>
            <p className="mt-4 text-base leading-7 text-muted">
              Artifacts that connect the narrative to product decisions, trade-offs, and operating evidence.
            </p>
          </div>
          <div className="inline-flex max-w-3xl items-start gap-3 rounded-md border border-line bg-panel p-4">
            <BadgeCheck className="mt-0.5 h-5 w-5 flex-none text-accent" aria-hidden="true" />
            <p className="text-sm leading-6 text-muted">
              <span className="font-semibold text-ink">Evidence Quality: </span>
              Some artifacts are representative reconstructions created to demonstrate product thinking while respecting confidentiality.
            </p>
          </div>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {artifacts.map((artifact) => (
            <EvidenceArtifactCard key={`${artifact.type}-${artifact.title}`} artifact={artifact} />
          ))}
        </div>
      </div>
    </section>
  );
}

function EvidenceArtifactCard({ artifact }: { artifact: ProductStory["evidence"][number] }) {
  const Icon = artifactIcons[artifact.type];

  return (
    <article className="rounded-md border border-line bg-panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-md border border-line bg-paper">
            <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{artifact.type}</p>
            <h3 className="mt-1 font-semibold leading-6 text-ink">{artifact.title}</h3>
          </div>
        </div>
        <span className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", statusStyles[artifact.status])}>
          {artifact.status}
        </span>
      </div>
      <div className="mt-5 rounded-md border border-dashed border-line bg-paper p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">Preview</p>
        <p className="mt-2 text-sm leading-6 text-muted">{artifact.preview}</p>
      </div>
      <p className="mt-4 text-sm leading-6 text-muted">{artifact.description}</p>
    </article>
  );
}
