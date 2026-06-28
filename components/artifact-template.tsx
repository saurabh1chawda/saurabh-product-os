import { ArrowLeft, ArrowRight, Download, FileText, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import type { EvidenceArtifact } from "@/data/artifacts";
import { SiteHeader } from "@/components/site-header";
import { ButtonLink } from "@/components/ui/button-link";

type ArtifactTemplateProps = {
  artifact: EvidenceArtifact;
};

export function ArtifactTemplate({ artifact }: ArtifactTemplateProps) {
  return (
    <>
      <SiteHeader />
      <main>
        <ArtifactHero artifact={artifact} />
        <ArtifactTextSection eyebrow="Context" title="Why this artifact exists">
          {artifact.context.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </ArtifactTextSection>
        <ArtifactPreview items={artifact.preview} />
        <KeyDecisions decisions={artifact.keyDecisions} />
        <DownloadSection artifact={artifact} />
        <RelatedStory artifact={artifact} />
      </main>
    </>
  );
}

function ArtifactHero({ artifact }: ArtifactTemplateProps) {
  return (
    <section className="border-b border-line bg-panel" aria-labelledby="artifact-title">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <ButtonLink href={artifact.relatedStory.href} variant="inline">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Product Story
        </ButtonLink>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Evidence Artifact</p>
            <h1 id="artifact-title" className="mt-4 max-w-4xl text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
              {artifact.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">{artifact.subtitle}</p>
          </div>
          <aside className="rounded-md border border-line bg-paper p-5" aria-label="Artifact details">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Artifact type</p>
            <p className="mt-3 text-2xl font-semibold leading-tight text-ink">{artifact.type}</p>
            <dl className="mt-6 grid gap-4 text-sm">
              <div>
                <dt className="font-semibold text-ink">Company</dt>
                <dd className="mt-1 leading-6 text-muted">{artifact.company}</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Status</dt>
                <dd className="mt-1 leading-6 text-muted">Representative reconstruction</dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </section>
  );
}

function ArtifactPreview({ items }: { items: EvidenceArtifact["preview"] }) {
  return (
    <section className="border-b border-line bg-panel" aria-labelledby="artifact-preview-title">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
        <ArtifactSectionHeader
          eyebrow="Artifact Preview"
          id="artifact-preview-title"
          title="What the artifact captures"
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <article key={item.label} className="rounded-md border border-line bg-paper p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">{item.label}</h3>
              <p className="mt-4 leading-7 text-muted">{item.value}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function KeyDecisions({ decisions }: { decisions: EvidenceArtifact["keyDecisions"] }) {
  return (
    <section className="border-b border-line" aria-labelledby="key-decisions-title">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
        <ArtifactSectionHeader eyebrow="Key Decisions" id="key-decisions-title" title="Product judgment visible in the artifact" />
        <div className="mt-8 grid gap-4">
          {decisions.map((decision) => (
            <article key={decision} className="flex gap-3 rounded-md border border-line bg-panel p-5">
              <ShieldCheck className="mt-1 h-5 w-5 flex-none text-accent" aria-hidden="true" />
              <p className="leading-7 text-muted">{decision}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function DownloadSection({ artifact }: ArtifactTemplateProps) {
  return (
    <section className="border-b border-line bg-panel" aria-labelledby="download-title">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="rounded-md border border-line bg-paper p-5">
          <FileText className="h-6 w-6 text-accent" aria-hidden="true" />
          <h2 id="download-title" className="mt-5 text-2xl font-semibold text-ink">Download</h2>
          <p className="mt-3 leading-7 text-muted">{artifact.download.status}</p>
          <ButtonLink href={artifact.download.href} variant="inline" className="mt-5">
            {artifact.download.label}
            <Download className="h-4 w-4" aria-hidden="true" />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

function RelatedStory({ artifact }: ArtifactTemplateProps) {
  return (
    <section className="border-b border-line" aria-labelledby="related-story-title">
      <div className="mx-auto grid max-w-6xl gap-4 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_1fr] lg:px-10">
        <div className="rounded-md border border-line bg-panel p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Related Product Story</p>
          <h2 id="related-story-title" className="mt-3 text-2xl font-semibold leading-tight text-ink">
            {artifact.relatedStory.title}
          </h2>
          <ButtonLink href={artifact.relatedStory.href} variant="inline" className="mt-5">
            View story
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </ButtonLink>
        </div>
        <div className="rounded-md border border-line bg-panel p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Disclaimer</p>
          <p className="mt-4 leading-7 text-muted">{artifact.disclaimer}</p>
        </div>
      </div>
    </section>
  );
}

function ArtifactTextSection({
  children,
  eyebrow,
  title
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
}) {
  const headingId = `${eyebrow.toLowerCase().replaceAll(" ", "-")}-title`;

  return (
    <section className="border-b border-line" aria-labelledby={headingId}>
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
        <ArtifactSectionHeader eyebrow={eyebrow} id={headingId} title={title} />
        <div className="space-y-5 text-lg leading-8 text-muted">{children}</div>
      </div>
    </section>
  );
}

function ArtifactSectionHeader({
  eyebrow,
  id,
  title
}: {
  eyebrow: string;
  id?: string;
  title: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">{eyebrow}</p>
      <h2 id={id} className="mt-3 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
        {title}
      </h2>
    </div>
  );
}
