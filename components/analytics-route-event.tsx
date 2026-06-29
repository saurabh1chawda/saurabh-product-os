"use client";

import { useEffect } from "react";

import type { AnalyticsEventName } from "@/lib/analytics";
import { trackRouteView } from "@/lib/analytics";

type AnalyticsRouteEventProps = {
  eventName: Extract<AnalyticsEventName, "for_recruiters_view" | "start_here_view" | "story_open" | "framework_open">;
  frameworkName?: string;
  storyName?: string;
};

export function AnalyticsRouteEvent({ eventName, frameworkName, storyName }: AnalyticsRouteEventProps) {
  useEffect(() => {
    trackRouteView({
      eventName,
      frameworkName,
      storyName
    });
  }, [eventName, frameworkName, storyName]);

  return null;
}
