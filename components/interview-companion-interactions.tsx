"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

import { ButtonLink } from "@/components/ui/button-link";
import type { AnalyticsEventName } from "@/lib/analytics";
import { trackAnalyticsEvent } from "@/lib/analytics";

type InterviewTrackedLinkProps = {
  children: ReactNode;
  className?: string;
  eventName:
    | "interview_question_clicked"
    | "interview_story_clicked"
    | "interview_resource_clicked"
    | "interview_decision_system_clicked";
  href: string;
  label: string;
  variant?: "primary" | "secondary" | "inline";
};

export function InterviewCompanionViewed() {
  useEffect(() => {
    trackAnalyticsEvent("interview_companion_viewed", {
      page_name: "Interview Companion"
    });
  }, []);

  return null;
}

export function InterviewTrackedLink({
  children,
  className,
  eventName,
  href,
  label,
  variant = "inline"
}: InterviewTrackedLinkProps) {
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
  if (eventName === "interview_story_clicked") {
    return { story_name: label };
  }

  if (eventName === "interview_decision_system_clicked") {
    return { decision_system_name: label };
  }

  if (eventName === "interview_question_clicked") {
    return { question_group: label };
  }

  return { link_text: label };
}
