"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

import { ButtonLink } from "@/components/ui/button-link";
import { trackAnalyticsEvent } from "@/lib/analytics";

type RecruiterJourneyViewedProps = {
  eventName: "resume_page_viewed" | "contact_page_viewed";
  pageName: string;
};

type RecruiterJourneyTrackedLinkProps = {
  children: ReactNode;
  className?: string;
  eventName: "resume_download_clicked" | "contact_link_clicked";
  href: string;
  label: string;
  variant?: "primary" | "secondary" | "inline";
};

export function RecruiterJourneyViewed({ eventName, pageName }: RecruiterJourneyViewedProps) {
  useEffect(() => {
    trackAnalyticsEvent(eventName, {
      page_name: pageName
    });
  }, [eventName, pageName]);

  return null;
}

export function RecruiterJourneyTrackedLink({
  children,
  className,
  eventName,
  href,
  label,
  variant = "inline"
}: RecruiterJourneyTrackedLinkProps) {
  function trackClick() {
    trackAnalyticsEvent(eventName, {
      cta_name: label,
      destination: href,
      link_text: label,
      link_url: href
    });
  }

  return (
    <ButtonLink href={href} variant={variant} className={className} onClick={trackClick}>
      {children}
    </ButtonLink>
  );
}
