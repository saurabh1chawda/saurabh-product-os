export type AnalyticsEventName =
  | "for_recruiters_view"
  | "start_here_view"
  | "story_open"
  | "framework_open"
  | "resume_download"
  | "linkedin_click"
  | "email_click"
  | "contact_click"
  | "external_link_click";

type AnalyticsEventParams = {
  story_name?: string;
  framework_name?: string;
  link_url?: string;
  link_text?: string;
};

declare global {
  interface Window {
    gtag?: (command: "event", eventName: AnalyticsEventName, params?: AnalyticsEventParams) => void;
  }
}

const siteHost = "saurabh-product-os.vercel.app";

export function trackAnalyticsEvent(eventName: AnalyticsEventName, params?: AnalyticsEventParams) {
  if (typeof window === "undefined" || !window.gtag) {
    return;
  }

  window.gtag("event", eventName, params);
}

export function trackRouteView({
  eventName,
  frameworkName,
  storyName
}: {
  eventName: Extract<AnalyticsEventName, "for_recruiters_view" | "start_here_view" | "story_open" | "framework_open">;
  frameworkName?: string;
  storyName?: string;
}) {
  trackAnalyticsEvent(eventName, {
    ...(storyName ? { story_name: storyName } : {}),
    ...(frameworkName ? { framework_name: frameworkName } : {})
  });
}

export function trackLinkClick({ href, text }: { href: string; text?: string }) {
  const url = parseUrl(href);
  const linkParams = {
    link_url: href,
    ...(text ? { link_text: text } : {})
  };

  if (url.protocol === "mailto:") {
    trackAnalyticsEvent("email_click", linkParams);
    return;
  }

  if (isLinkedInUrl(url)) {
    trackAnalyticsEvent("linkedin_click", linkParams);
  }

  if (isResumeUrl(url)) {
    trackAnalyticsEvent("resume_download", linkParams);
  }

  if (url.pathname === "/contact") {
    trackAnalyticsEvent("contact_click", linkParams);
  }

  if (isExternalUrl(url)) {
    trackAnalyticsEvent("external_link_click", linkParams);
  }
}

function parseUrl(href: string) {
  return new URL(href, window.location.origin);
}

function isExternalUrl(url: URL) {
  return url.protocol.startsWith("http") && url.hostname !== window.location.hostname && url.hostname !== siteHost;
}

function isLinkedInUrl(url: URL) {
  return url.hostname.includes("linkedin.com");
}

function isResumeUrl(url: URL) {
  return url.pathname === "/resume" || url.pathname.toLowerCase().endsWith(".pdf");
}
