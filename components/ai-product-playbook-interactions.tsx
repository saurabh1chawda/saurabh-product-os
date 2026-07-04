"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

import type { AnalyticsEventName } from "@/lib/analytics";
import { trackAnalyticsEvent } from "@/lib/analytics";

type PlaybookViewedProps = {
  name: string;
};

type PlaybookPartViewedProps = {
  name: string;
};

type PlaybookTrackedLinkProps = {
  children: ReactNode;
  className?: string;
  eventName: Extract<
    AnalyticsEventName,
    "framework_card_clicked" | "featured_framework_clicked" | "playbook_related_clicked" | "playbook_continue_clicked"
  >;
  href: string;
  label: string;
};

type PlaybookTrackedButtonProps = {
  children: ReactNode;
  className?: string;
  eventName: Extract<AnalyticsEventName, "framework_card_clicked" | "featured_framework_clicked">;
  label: string;
};

export function PlaybookViewed({ name }: PlaybookViewedProps) {
  useEffect(() => {
    trackAnalyticsEvent("ai_product_playbook_viewed", {
      page_name: name
    });
  }, [name]);

  return null;
}

export function PlaybookPartViewed({ name }: PlaybookPartViewedProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          trackAnalyticsEvent("playbook_part_viewed", {
            section_name: name
          });
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [name]);

  return <div ref={ref} aria-hidden="true" className="sr-only" />;
}

export function PlaybookTrackedLink({ children, className, eventName, href, label }: PlaybookTrackedLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        trackAnalyticsEvent(eventName, {
          framework_name:
            eventName === "framework_card_clicked" || eventName === "featured_framework_clicked" ? label : undefined,
          module_name:
            eventName === "playbook_related_clicked" || eventName === "playbook_continue_clicked" ? label : undefined,
          link_text: label,
          link_url: href
        });
      }}
    >
      {children}
    </Link>
  );
}

export function PlaybookTrackedButton({ children, className, eventName, label }: PlaybookTrackedButtonProps) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        trackAnalyticsEvent(eventName, {
          framework_name: label,
          link_text: label
        });
      }}
    >
      {children}
    </button>
  );
}
