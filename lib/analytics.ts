export type AnalyticsEventName =
  | "for_recruiters_view"
  | "start_here_view"
  | "story_open"
  | "framework_open"
  | "resume_download"
  | "linkedin_click"
  | "email_click"
  | "contact_click"
  | "external_link_click"
  | "decision_system_viewed"
  | "decision_questions_expanded"
  | "framework_example_clicked"
  | "next_module_clicked"
  | "dos_home_viewed"
  | "tour_started"
  | "tour_step_viewed"
  | "tour_completed"
  | "decision_system_clicked"
  | "decision_journal_clicked"
  | "for_recruiters_clicked"
  | "validation_system_viewed"
  | "validation_question_expanded"
  | "validation_scorecard_interaction"
  | "validation_example_clicked"
  | "validation_next_module_clicked"
  | "validation_confidence_meter_interaction"
  | "validation_decision_quality_score_checked"
  | "validation_stop_criteria_viewed"
  | "validation_review_started"
  | "ai_prioritization_viewed"
  | "ai_matrix_interacted"
  | "ai_question_expanded"
  | "ai_scorecard_completed"
  | "ai_example_clicked"
  | "ai_next_module_clicked"
  | "ai_principles_viewed"
  | "principle_expanded"
  | "principle_example_clicked"
  | "continue_learning_clicked"
  | "build_buy_viewed"
  | "build_buy_question_expanded"
  | "build_buy_matrix_interacted"
  | "build_buy_scorecard_completed"
  | "build_buy_example_clicked"
  | "build_buy_next_module_clicked"
  | "rag_agent_viewed"
  | "rag_agent_question_expanded"
  | "rag_agent_matrix_interacted"
  | "rag_agent_scorecard_completed"
  | "rag_agent_example_clicked"
  | "rag_agent_next_module_clicked"
  | "ai_metrics_viewed"
  | "ai_metrics_question_expanded"
  | "ai_metrics_matrix_interacted"
  | "ai_metrics_scorecard_completed"
  | "ai_metrics_example_clicked"
  | "ai_metrics_next_module_clicked"
  | "v1_release_viewed"
  | "learning_path_clicked"
  | "module_clicked_from_release"
  | "recruiter_path_clicked"
  | "executive_summary_viewed"
  | "executive_summary_section_viewed"
  | "executive_summary_cta_clicked"
  | "hiring_manager_page_viewed"
  | "hiring_manager_section_viewed"
  | "hiring_manager_story_clicked"
  | "hiring_manager_decision_system_clicked"
  | "working_together_viewed"
  | "contact_cta_clicked"
  | "interview_companion_viewed"
  | "interview_question_clicked"
  | "interview_story_clicked"
  | "interview_resource_clicked"
  | "interview_decision_system_clicked";

type AnalyticsEventParams = {
  cta_name?: string;
  confidence_level?: string;
  decision_system_name?: string;
  decision_journal_name?: string;
  destination?: string;
  example_name?: string;
  framework_name?: string;
  matrix_quadrant?: string;
  module_name?: string;
  page_name?: string;
  path_name?: string;
  principle_name?: string;
  question_group?: string;
  recommendation?: string;
  scorecard_item?: string;
  scorecard_value?: string;
  score_total?: number;
  section_name?: string;
  stop_criteria_name?: string;
  story_name?: string;
  tour_step?: number;
  tour_step_name?: string;
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
