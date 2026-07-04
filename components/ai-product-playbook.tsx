import { ArrowRight, BookOpen, CheckCircle2, Compass, Route } from "lucide-react";

import {
  PlaybookPartViewed,
  PlaybookTrackedButton,
  PlaybookTrackedLink
} from "@/components/ai-product-playbook-interactions";
import { ButtonLink } from "@/components/ui/button-link";
import type {
  PlaybookContinueItem,
  PlaybookFramework,
  PlaybookPart as PlaybookPartType,
  PlaybookResource,
  PlaybookStatus
} from "@/data/ai-product-playbook/types";
import { cn } from "@/lib/utils";

type PlaybookHeroProps = {
  headline: string;
  primaryCta: {
    href: string;
    label: string;
  };
  secondaryCta: {
    href: string;
    label: string;
  };
  supportingCopy: string;
  title: string;
};

export function PlaybookHero({ headline, primaryCta, secondaryCta, supportingCopy, title }: PlaybookHeroProps) {
  return (
    <section className="border-b border-line bg-panel" aria-labelledby="playbook-title">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <div className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">{title}</p>
          <h1 id="playbook-title" className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
            {headline}
          </h1>
          <p className="mt-6 max-w-3xl text-xl leading-8 text-ink">{supportingCopy}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={primaryCta.href}>
              {primaryCta.label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
            <ButtonLink href={secondaryCta.href} variant="secondary">
              {secondaryCta.label}
            </ButtonLink>
          </div>
          <dl className="mt-8 grid gap-3 sm:grid-cols-3">
            <MetaItem label="Format" value="Interactive playbook" />
            <MetaItem label="Status" value="Architecture ready" />
            <MetaItem label="Focus" value="AI product execution" />
          </dl>
        </div>
      </div>
    </section>
  );
}

export function PlaybookPart({ part }: { part: PlaybookPartType }) {
  return (
    <section id={part.id} className="scroll-mt-24 border-b border-line py-12 sm:py-14" aria-labelledby={`${part.id}-title`}>
      <PlaybookPartViewed name={part.title} />
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Playbook Part</p>
        <h2 id={`${part.id}-title`} className="mt-3 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
          {part.title}
        </h2>
        <p className="mt-4 leading-7 text-muted">{part.description}</p>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {part.frameworks.map((framework) => (
          <FrameworkCard key={framework.title} framework={framework} />
        ))}
      </div>
    </section>
  );
}

export function FrameworkCard({ framework }: { framework: PlaybookFramework }) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-line bg-paper">
          <BookOpen className="h-5 w-5 text-accent" aria-hidden="true" />
        </div>
        <StatusBadge status={framework.status} />
      </div>
      {framework.category ? (
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-accent">{framework.category}</p>
      ) : null}
      <h3 className="mt-2 text-xl font-semibold leading-tight text-ink">{framework.title}</h3>
      <p className="mt-3 leading-7 text-muted">{framework.description}</p>
      <p className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent">
        {framework.href ? "Open related system" : "Preview framework"}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </p>
    </>
  );

  const className =
    "h-full w-full rounded-md border border-line bg-panel p-5 text-left shadow-soft transition hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-paper";

  if (framework.href) {
    return (
      <PlaybookTrackedLink
        href={framework.href}
        eventName="framework_card_clicked"
        label={framework.title}
        className={className}
      >
        {content}
      </PlaybookTrackedLink>
    );
  }

  return (
    <PlaybookTrackedButton eventName="framework_card_clicked" label={framework.title} className={className}>
      {content}
    </PlaybookTrackedButton>
  );
}

export function FeaturedFrameworkCard({ framework }: { framework: PlaybookFramework }) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-line bg-panel">
          <CheckCircle2 className="h-5 w-5 text-accent" aria-hidden="true" />
        </div>
        <StatusBadge status={framework.status} />
      </div>
      {framework.category ? (
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-accent">{framework.category}</p>
      ) : null}
      <h3 className="mt-2 text-xl font-semibold leading-tight text-ink">{framework.title}</h3>
      <p className="mt-3 leading-7 text-muted">{framework.description}</p>
      <p className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent">
        Preview framework
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </p>
    </>
  );

  const className =
    "h-full w-full rounded-md border border-line bg-paper p-5 text-left transition hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-panel";

  if (framework.href) {
    return (
      <PlaybookTrackedLink
        href={framework.href}
        eventName="featured_framework_clicked"
        label={framework.title}
        className={className}
      >
        {content}
      </PlaybookTrackedLink>
    );
  }

  return (
    <PlaybookTrackedButton eventName="featured_framework_clicked" label={framework.title} className={className}>
      {content}
    </PlaybookTrackedButton>
  );
}

export function RelatedResourceCard({ resource }: { resource: PlaybookResource }) {
  return (
    <PlaybookTrackedLink
      href={resource.href}
      eventName="playbook_related_clicked"
      label={resource.title}
      className="rounded-md border border-line bg-paper p-5 transition hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-panel"
    >
      <div className="flex items-start justify-between gap-4">
        <Compass className="h-5 w-5 text-accent" aria-hidden="true" />
        {resource.status ? <StatusBadge status={resource.status} /> : null}
      </div>
      <h3 className="mt-5 text-xl font-semibold leading-tight text-ink">{resource.title}</h3>
      <p className="mt-3 leading-7 text-muted">{resource.description}</p>
      <p className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent">
        {resource.cta}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </p>
    </PlaybookTrackedLink>
  );
}

export function ContinueExploring({ items }: { items: PlaybookContinueItem[] }) {
  return (
    <section className="border-b border-line" aria-labelledby="continue-title">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
        <SectionHeader eyebrow="Continue Exploring" id="continue-title" title="Move from playbook architecture into evidence" />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {items.map((item) => (
            <PlaybookTrackedLink
              key={item.title}
              href={item.href}
              eventName="playbook_continue_clicked"
              label={item.title}
              className="rounded-md border border-line bg-panel p-5 transition hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-paper"
            >
              <div className="flex items-start justify-between gap-4">
                <Route className="h-5 w-5 text-accent" aria-hidden="true" />
                {item.status ? <StatusBadge status={item.status} /> : null}
              </div>
              <h3 className="mt-5 text-xl font-semibold leading-tight text-ink">{item.title}</h3>
              <p className="mt-3 leading-7 text-muted">{item.description}</p>
              <p className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent">
                Continue the journey
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </p>
            </PlaybookTrackedLink>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({ eyebrow, id, title }: { eyebrow: string; id: string; title: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">{eyebrow}</p>
      <h2 id={id} className="mt-3 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
        {title}
      </h2>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-paper p-4">
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{label}</dt>
      <dd className="mt-2 font-semibold text-ink">{value}</dd>
    </div>
  );
}

function StatusBadge({ status }: { status: PlaybookStatus }) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full border px-2.5 text-xs font-semibold",
        status === "In Progress" ? "border-accent/30 bg-accent/10 text-accent" : "border-line bg-panel text-muted"
      )}
    >
      {status}
    </span>
  );
}
