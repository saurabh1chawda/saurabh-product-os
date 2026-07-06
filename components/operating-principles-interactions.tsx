"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Compass } from "lucide-react";

import type { OperatingPrinciple } from "@/data/operating-principles";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type SectionViewedProps = {
  eventName: "leadership_compass_viewed" | "operating_model_viewed";
  sectionName: string;
};

export function OperatingPrinciplesViewed() {
  useEffect(() => {
    trackAnalyticsEvent("operating_principles_viewed", {
      page_name: "Product Leadership Operating Principles"
    });
  }, []);

  return null;
}

export function OperatingPrinciplesSectionViewed({ eventName, sectionName }: SectionViewedProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          trackAnalyticsEvent(eventName, {
            section_name: sectionName
          });
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [eventName, sectionName]);

  return <div ref={ref} aria-hidden="true" className="sr-only" />;
}

export function OperatingPrincipleCard({ principle }: { principle: OperatingPrinciple }) {
  const [isOpen, setIsOpen] = useState(false);

  function toggleOpen() {
    const nextOpen = !isOpen;

    setIsOpen(nextOpen);

    if (nextOpen) {
      trackAnalyticsEvent("principle_card_opened", {
        principle_name: principle.title
      });
    }
  }

  return (
    <article className="rounded-md border border-line bg-panel shadow-soft">
      <button
        type="button"
        className="flex min-h-14 w-full items-start justify-between gap-4 p-5 text-left focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-paper"
        aria-expanded={isOpen}
        onClick={toggleOpen}
      >
        <span>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{principle.principleType}</span>
          <span className="mt-2 block text-xl font-semibold leading-tight text-ink">{principle.title}</span>
          <span className="mt-3 block leading-7 text-muted">{principle.summary}</span>
        </span>
        <ChevronDown className={cn("h-5 w-5 flex-none text-accent transition", isOpen ? "rotate-180" : "")} aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className="border-t border-line p-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <DetailBlock title="Explanation" value={principle.explanation} />
            <DetailBlock title="Why it matters" value={principle.whyItMatters} />
          </div>
          <ResourceGroup title="Evidence" resources={principle.evidence} eventName="principle_evidence_clicked" principleName={principle.title} />
          <ResourceGroup title="Related Product OS resources" resources={principle.relatedResources} eventName="related_resource_clicked" principleName={principle.title} />
        </div>
      ) : null}
    </article>
  );
}

export function TrackedPrincipleLink({
  children,
  className,
  eventName = "related_resource_clicked",
  href,
  label
}: {
  children: ReactNode;
  className?: string;
  eventName?: "principle_evidence_clicked" | "related_resource_clicked";
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        trackAnalyticsEvent(eventName, {
          link_text: label,
          link_url: href,
          module_name: label
        });
      }}
    >
      {children}
    </Link>
  );
}

function DetailBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-paper p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{title}</p>
      <p className="mt-3 leading-7 text-muted">{value}</p>
    </div>
  );
}

function ResourceGroup({
  eventName,
  principleName,
  resources,
  title
}: {
  eventName: "principle_evidence_clicked" | "related_resource_clicked";
  principleName: string;
  resources: Array<{ href: string; title: string }>;
  title: string;
}) {
  return (
    <div className="mt-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {resources.map((resource) => (
          <Link
            key={`${principleName}-${resource.title}`}
            href={resource.href}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-paper px-3 text-sm font-semibold text-ink transition hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-panel"
            onClick={() => {
              trackAnalyticsEvent(eventName, {
                link_text: resource.title,
                link_url: resource.href,
                principle_name: principleName
              });
            }}
          >
            <Compass className="h-4 w-4 text-accent" aria-hidden="true" />
            {resource.title}
            <ArrowRight className="h-4 w-4 text-accent" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </div>
  );
}
