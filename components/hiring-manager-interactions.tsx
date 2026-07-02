"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

import { ButtonLink } from "@/components/ui/button-link";
import type { AnalyticsEventName } from "@/lib/analytics";
import { trackAnalyticsEvent } from "@/lib/analytics";

type HiringManagerSectionViewedProps = {
  sectionName: string;
};

type HiringManagerTrackedLinkProps = {
  children: ReactNode;
  className?: string;
  eventName:
    | "hiring_manager_story_clicked"
    | "hiring_manager_decision_system_clicked"
    | "contact_cta_clicked";
  href: string;
  label: string;
  variant?: "primary" | "secondary" | "inline";
};

export function HiringManagerViewed() {
  useEffect(() => {
    trackAnalyticsEvent("hiring_manager_page_viewed", {
      page_name: "For Hiring Managers"
    });
  }, []);

  return null;
}

export function HiringManagerSectionViewed({ sectionName }: HiringManagerSectionViewedProps) {
  useEffect(() => {
    const element = document.querySelector(`[data-hiring-manager-section="${sectionName}"]`);

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          trackAnalyticsEvent("hiring_manager_section_viewed", {
            section_name: sectionName
          });

          if (sectionName === "Working Together") {
            trackAnalyticsEvent("working_together_viewed", {
              section_name: sectionName
            });
          }

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

export function HiringManagerTrackedLink({
  children,
  className,
  eventName,
  href,
  label,
  variant = "inline"
}: HiringManagerTrackedLinkProps) {
  function trackClick() {
    trackAnalyticsEvent(eventName, {
      ...getEventPayload(eventName, label),
      cta_name: label,
      destination: href
    });
  }

  return (
    <ButtonLink href={href} variant={variant} className={className} onClick={trackClick}>
      {children}
    </ButtonLink>
  );
}

function getEventPayload(eventName: AnalyticsEventName, label: string) {
  if (eventName === "hiring_manager_story_clicked") {
    return { story_name: label };
  }

  if (eventName === "hiring_manager_decision_system_clicked") {
    return { decision_system_name: label };
  }

  return {};
}
