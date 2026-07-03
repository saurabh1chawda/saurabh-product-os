"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

import { ButtonLink } from "@/components/ui/button-link";
import { trackAnalyticsEvent } from "@/lib/analytics";

type ProfileTrackedLinkProps = {
  children: ReactNode;
  className?: string;
  destination: string;
  eventName: "business_outcome_clicked" | "certification_link_clicked" | "contact_clicked" | "contact_link_clicked";
  label: string;
  outcomeName?: string;
  variant?: "primary" | "secondary" | "inline";
};

export function ProfessionalProfileViewed() {
  useEffect(() => {
    trackAnalyticsEvent("professional_profile_viewed", {
      page_name: "Professional Profile"
    });
  }, []);

  return null;
}

export function ProfessionalProfileSectionViewed({
  eventName,
  sectionName
}: {
  eventName: "career_timeline_viewed" | "product_os_journey_viewed";
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

export function ProfessionalProfileTrackedLink({
  children,
  className,
  destination,
  eventName,
  label,
  outcomeName,
  variant = "inline"
}: ProfileTrackedLinkProps) {
  function trackClick() {
    trackAnalyticsEvent(eventName, {
      cta_name: label,
      destination,
      link_text: label,
      link_url: destination,
      ...(outcomeName ? { outcome_name: outcomeName } : {})
    });
  }

  return (
    <ButtonLink href={destination} variant={variant} className={className} onClick={trackClick}>
      {children}
    </ButtonLink>
  );
}
