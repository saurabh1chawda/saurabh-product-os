"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect } from "react";

import { trackAnalyticsEvent } from "@/lib/analytics";

type HubEventName = "featured_brief_clicked" | "upcoming_brief_clicked" | "leadership_theme_clicked" | "continue_exploring_clicked";

type CaseStudiesHubTrackedLinkProps = {
  children: ReactNode;
  className?: string;
  eventName: HubEventName;
  href: string;
  label: string;
};

type CaseStudiesHubTrackedButtonProps = {
  children: ReactNode;
  className?: string;
  eventName: Extract<HubEventName, "upcoming_brief_clicked">;
  label: string;
};

export function CaseStudiesHubViewed() {
  useEffect(() => {
    trackAnalyticsEvent("case_studies_hub_viewed", {
      page_name: "Case Studies"
    });
  }, []);

  return null;
}

export function CaseStudiesHubTrackedLink({ children, className, eventName, href, label }: CaseStudiesHubTrackedLinkProps) {
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

export function CaseStudiesHubTrackedButton({ children, className, eventName, label }: CaseStudiesHubTrackedButtonProps) {
  function trackClick() {
    trackAnalyticsEvent(eventName, {
      link_text: label
    });
  }

  return (
    <button type="button" className={className} onClick={trackClick}>
      {children}
    </button>
  );
}
