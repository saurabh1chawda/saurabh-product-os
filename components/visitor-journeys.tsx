"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { ArrowRight, Boxes, Code2, GitBranch, Layers3, Timer, UserRound } from "lucide-react";

import type { ContinueExploringItem, JourneyStatus, VisitorJourney } from "@/data/journeys";
import { trackAnalyticsEvent } from "@/lib/analytics";

const iconMap: Record<string, ReactNode> = {
  background: <UserRound className="h-5 w-5 text-accent" aria-hidden="true" />,
  "product-building": <Layers3 className="h-5 w-5 text-accent" aria-hidden="true" />,
  "decision-systems": <GitBranch className="h-5 w-5 text-accent" aria-hidden="true" />,
  "engineering-partnership": <Code2 className="h-5 w-5 text-accent" aria-hidden="true" />
};

export function JourneyGrid({ journeys }: { journeys: VisitorJourney[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {journeys.map((journey, index) => (
        <JourneyCard key={journey.id} journey={journey} position={index + 1} total={journeys.length} />
      ))}
    </div>
  );
}

export function JourneySectionViewed() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          trackAnalyticsEvent("visitor_journey_viewed", {
            section_name: "Start with what matters to you"
          });
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return <div ref={ref} aria-hidden="true" className="sr-only" />;
}

export function ContinueExploring({
  eyebrow = "Continue Exploring",
  items,
  title
}: {
  eyebrow?: string;
  items: ContinueExploringItem[];
  title: string;
}) {
  return (
    <section className="border-b border-line bg-panel" aria-labelledby="continue-exploring-title">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-14 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">{eyebrow}</p>
          <h2 id="continue-exploring-title" className="mt-3 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
            {title}
          </h2>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <article key={item.title} className="rounded-md border border-line bg-paper p-5">
              <Boxes className="h-5 w-5 text-accent" aria-hidden="true" />
              <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
                <h3 className="text-xl font-semibold leading-tight text-ink">{item.title}</h3>
                <JourneyBadge status={item.destination.status} />
              </div>
              <p className="mt-3 leading-7 text-muted">{item.description}</p>
              {item.destination.href ? (
                <Link
                  href={item.destination.href}
                  className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 text-sm font-semibold text-accent transition hover:text-ink"
                  onClick={() => trackContinueClick(item)}
                  aria-label={`Continue the journey to ${item.destination.label}`}
                >
                  Continue the journey
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              ) : (
                <button
                  type="button"
                  className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 text-sm font-semibold text-accent transition hover:text-ink"
                  onClick={() => trackFutureClick(item.destination.label)}
                >
                  {item.destination.label}
                  <JourneyBadge status={item.destination.status} />
                </button>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function JourneyCard({ journey, position, total }: { journey: VisitorJourney; position: number; total: number }) {
  const progress = `${(position / total) * 100}%`;

  return (
    <article className="flex h-full flex-col rounded-md border border-line bg-panel p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-line bg-paper">
          {iconMap[journey.id] ?? <Boxes className="h-5 w-5 text-accent" aria-hidden="true" />}
        </div>
        <JourneyBadge status={journey.status} />
      </div>
      <h3 className="mt-5 text-xl font-semibold leading-tight text-ink">{journey.title}</h3>
      <p className="mt-3 leading-7 text-muted">{journey.description}</p>
      <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-muted">
        <Timer className="h-4 w-4 text-accent" aria-hidden="true" />
        <span>{journey.estimatedTime}</span>
      </div>
      <div className="mt-5" aria-label={`Journey ${position} of ${total}`}>
        <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          <span>Path {position}</span>
          <span>{total} paths</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-accent" style={{ width: progress }} />
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        {journey.destination.href ? (
          <Link
            href={journey.destination.href}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-white transition hover:bg-ink"
            onClick={() => trackJourneySelection(journey)}
          >
            Start Journey
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : null}
        {journey.futureDestination ? (
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-line bg-paper px-3 text-sm font-semibold text-ink transition hover:border-accent"
            onClick={() => trackFutureClick(journey.futureDestination?.label ?? journey.title)}
          >
            {journey.futureDestination.label}
            <JourneyBadge status={journey.futureDestination.status} />
          </button>
        ) : null}
      </div>
    </article>
  );
}

export function JourneyBadge({ status }: { status: JourneyStatus }) {
  return (
    <span className="inline-flex min-h-7 items-center rounded-full border border-line bg-paper px-2.5 text-xs font-semibold text-muted">
      {status}
    </span>
  );
}

function trackJourneySelection(journey: VisitorJourney) {
  const params = {
    destination: journey.destination.href,
    journey_id: journey.id,
    journey_title: journey.title,
    link_text: "Start Journey",
    link_url: journey.destination.href
  };

  trackAnalyticsEvent("visitor_journey_selected", params);
  trackAnalyticsEvent("journey_destination_opened", params);
}

function trackContinueClick(item: ContinueExploringItem) {
  trackAnalyticsEvent("continue_exploring_clicked", {
    destination: item.destination.href,
    link_text: item.destination.label,
    link_url: item.destination.href,
    module_name: item.title
  });
}

function trackFutureClick(label: string) {
  trackAnalyticsEvent("future_content_clicked", {
    future_content_name: label,
    link_text: label
  });
}
