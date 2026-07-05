"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

import { trackAnalyticsEvent } from "@/lib/analytics";

type PlbViewedProps = {
  company: string;
  slug: string;
};

type PlbSectionViewedProps = {
  eventName:
    | "decision_section_viewed"
    | "impact_dashboard_viewed"
    | "reflection_viewed"
    | "constraint_mapping_viewed"
    | "architecture_evolution_viewed"
    | "flywheel_viewed"
    | "signature_principle_viewed";
  sectionName: string;
};

type PlbTrackedLinkProps = {
  children: ReactNode;
  className?: string;
  eventName: "continue_exploring_clicked" | "related_resource_clicked";
  href: string;
  label: string;
};

export function PlbViewed({ company, slug }: PlbViewedProps) {
  useEffect(() => {
    trackAnalyticsEvent("plb_viewed", {
      page_name: `${company} Product Leadership Brief`,
      story_name: slug
    });

    if (slug === "logix") {
      trackAnalyticsEvent("plb_logix_viewed", {
        page_name: `${company} Product Leadership Brief`,
        story_name: slug
      });
    }
  }, [company, slug]);

  return null;
}

export function PlbSectionViewed({ eventName, sectionName }: PlbSectionViewedProps) {
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

export function PlbTrackedLink({ children, className, eventName, href, label }: PlbTrackedLinkProps) {
  function trackClick() {
    trackAnalyticsEvent(eventName, {
      destination: href,
      link_text: label,
      link_url: href
    });
  }

  return (
    <Link href={href} className={className} onClick={trackClick}>
      {children}
    </Link>
  );
}
