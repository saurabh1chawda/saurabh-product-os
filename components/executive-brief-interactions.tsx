"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

import type { AnalyticsEventName } from "@/lib/analytics";
import { trackAnalyticsEvent } from "@/lib/analytics";

type ExecutiveEventName = Extract<
  AnalyticsEventName,
  | "leadership_snapshot_clicked"
  | "operating_principles_clicked"
  | "featured_decision_clicked"
  | "recruiter_toolkit_used"
  | "reading_path_selected"
  | "contact_cta_clicked"
>;

export function ExecutiveBriefViewed() {
  useEffect(() => {
    trackAnalyticsEvent("executive_brief_viewed", {
      page_name: "Executive Briefing Center"
    });
  }, []);

  return null;
}

export function ExecutiveSectionViewed({
  eventName,
  sectionName
}: {
  eventName: Extract<AnalyticsEventName, "career_snapshot_viewed" | "business_dashboard_viewed">;
  sectionName: string;
}) {
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

export function ExecutiveTrackedLink({
  children,
  className,
  eventName,
  href,
  label
}: {
  children: ReactNode;
  className?: string;
  eventName: ExecutiveEventName;
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        trackAnalyticsEvent(eventName, {
          cta_name: label,
          destination: href,
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
