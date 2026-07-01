"use client";

import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { ButtonLink } from "@/components/ui/button-link";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type ReadingProgressProps = {
  label: string;
};

type DecisionSystemViewedProps = {
  name: string;
};

type AnalyticsViewedProps = {
  eventName: "decision_system_viewed" | "dos_home_viewed" | "v1_release_viewed";
  name: string;
};

type DecisionQuestionGroupProps = {
  questions: string[];
  title: string;
};

type TrackedDecisionLinkProps = {
  children: ReactNode;
  className?: string;
  eventName:
    | "framework_example_clicked"
    | "next_module_clicked"
    | "decision_system_clicked"
    | "decision_journal_clicked"
    | "for_recruiters_clicked"
    | "learning_path_clicked"
    | "module_clicked_from_release"
    | "recruiter_path_clicked"
    | "resume_download"
    | "linkedin_click"
    | "email_click";
  href: string;
  label: string;
  pathName?: string;
  variant?: "primary" | "secondary" | "inline";
};

export function ReadingProgress({ label }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function updateProgress() {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;

      setProgress(Math.min(100, Math.max(0, nextProgress)));
    }

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return (
    <div className="fixed left-0 right-0 top-0 z-30 h-1 bg-line" aria-label={label} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
      <div className="h-full bg-accent transition-[width]" style={{ width: `${progress}%` }} />
    </div>
  );
}

export function DecisionSystemViewed({ name }: DecisionSystemViewedProps) {
  useEffect(() => {
    trackAnalyticsEvent("decision_system_viewed", {
      decision_system_name: name
    });
  }, [name]);

  return null;
}

export function AnalyticsViewed({ eventName, name }: AnalyticsViewedProps) {
  useEffect(() => {
    trackAnalyticsEvent(eventName, {
      ...(eventName === "decision_system_viewed" ? { decision_system_name: name } : {}),
      ...(eventName === "dos_home_viewed" ? { module_name: name } : {}),
      ...(eventName === "v1_release_viewed" ? { page_name: name } : {})
    });
  }, [eventName, name]);

  return null;
}

export function DecisionQuestionGroup({ questions, title }: DecisionQuestionGroupProps) {
  const [isOpen, setIsOpen] = useState(false);

  function toggleOpen() {
    const nextIsOpen = !isOpen;

    setIsOpen(nextIsOpen);

    if (nextIsOpen) {
      trackAnalyticsEvent("decision_questions_expanded", {
        question_group: title
      });
    }
  }

  return (
    <div className="rounded-md border border-line bg-paper">
      <button
        type="button"
        className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={isOpen}
        onClick={toggleOpen}
      >
        <span className="text-lg font-semibold text-ink">{title}</span>
        <ChevronDown className={cn("h-5 w-5 flex-none text-accent transition", isOpen ? "rotate-180" : "")} aria-hidden="true" />
      </button>
      {isOpen ? (
        <div className="border-t border-line px-5 py-5">
          <ul className="grid gap-3">
            {questions.map((question) => (
              <li key={question} className="leading-7 text-muted">
                {question}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function TrackedDecisionLink({ children, className, eventName, href, label, pathName, variant = "inline" }: TrackedDecisionLinkProps) {
  function trackClick() {
    trackAnalyticsEvent(eventName, {
      ...(eventName === "framework_example_clicked" ? { example_name: label } : {}),
      ...(eventName === "next_module_clicked" ? { module_name: label } : {}),
      ...(eventName === "decision_system_clicked" ? { decision_system_name: label } : {}),
      ...(eventName === "decision_journal_clicked" ? { decision_journal_name: label } : {}),
      ...(eventName === "for_recruiters_clicked" ? { link_text: label } : {}),
      ...(eventName === "learning_path_clicked" ? { module_name: label } : {}),
      ...(eventName === "module_clicked_from_release" ? { module_name: label } : {}),
      ...(eventName === "recruiter_path_clicked" ? { module_name: label } : {}),
      ...(pathName ? { path_name: pathName } : {}),
      link_url: href
    });
  }

  return (
    <ButtonLink href={href} variant={variant} className={className} onClick={trackClick}>
      {children}
    </ButtonLink>
  );
}
