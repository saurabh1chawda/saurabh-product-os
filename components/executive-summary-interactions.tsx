"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

import { ButtonLink } from "@/components/ui/button-link";
import { trackAnalyticsEvent } from "@/lib/analytics";

type ExecutiveSectionViewedProps = {
  sectionName: string;
};

type ExecutiveSummaryTrackedLinkProps = {
  children: ReactNode;
  className?: string;
  ctaName: string;
  href: string;
  variant?: "primary" | "secondary" | "inline";
};

export function ExecutiveSummaryViewed() {
  useEffect(() => {
    trackAnalyticsEvent("executive_summary_viewed", {
      page_name: "Executive Summary"
    });
  }, []);

  return null;
}

export function ExecutiveSectionViewed({ sectionName }: ExecutiveSectionViewedProps) {
  useEffect(() => {
    const element = document.querySelector(`[data-executive-section="${sectionName}"]`);

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          trackAnalyticsEvent("executive_summary_section_viewed", {
            section_name: sectionName
          });
          observer.disconnect();
        }
      },
      { threshold: 0.45 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [sectionName]);

  return null;
}

export function ExecutiveSummaryTrackedLink({
  children,
  className,
  ctaName,
  href,
  variant = "inline"
}: ExecutiveSummaryTrackedLinkProps) {
  function trackClick() {
    trackAnalyticsEvent("executive_summary_cta_clicked", {
      cta_name: ctaName,
      destination: href
    });
  }

  return (
    <ButtonLink href={href} variant={variant} className={className} onClick={trackClick}>
      {children}
    </ButtonLink>
  );
}
