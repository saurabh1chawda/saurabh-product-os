"use client";

import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { ButtonLink } from "@/components/ui/button-link";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type ValidationViewedProps = {
  name: string;
};

type ValidationQuestionGroupProps = {
  questions: string[];
  title: string;
};

type ValidationTrackedLinkProps = {
  children: ReactNode;
  className?: string;
  eventName: "validation_example_clicked" | "validation_next_module_clicked";
  href: string;
  label: string;
  variant?: "primary" | "secondary" | "inline";
};

type ConfidenceMeterProps = {
  levels: Array<{
    action: string;
    description: string;
    level: string;
  }>;
};

type DecisionScorecardProps = {
  items: string[];
};

type DecisionQualityScoreProps = {
  bands: Array<{
    description: string;
    range: string;
    title: string;
  }>;
};

type StopCriteriaGridProps = {
  criteria: Array<{
    description: string;
    title: string;
  }>;
};

export function ValidationSystemViewed({ name }: ValidationViewedProps) {
  useEffect(() => {
    trackAnalyticsEvent("validation_system_viewed", {
      decision_system_name: name
    });
  }, [name]);

  return null;
}

export function ValidationQuestionGroup({ questions, title }: ValidationQuestionGroupProps) {
  const [isOpen, setIsOpen] = useState(false);

  function toggleOpen() {
    const nextIsOpen = !isOpen;

    setIsOpen(nextIsOpen);

    if (nextIsOpen) {
      trackAnalyticsEvent("validation_question_expanded", {
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

export function ValidationTrackedLink({ children, className, eventName, href, label, variant = "inline" }: ValidationTrackedLinkProps) {
  function trackClick() {
    trackAnalyticsEvent(eventName, {
      ...(eventName === "validation_example_clicked" ? { example_name: label } : {}),
      ...(eventName === "validation_next_module_clicked" ? { module_name: label } : {}),
      link_url: href
    });
  }

  return (
    <ButtonLink href={href} variant={variant} className={className} onClick={trackClick}>
      {children}
    </ButtonLink>
  );
}

export function ConfidenceMeter({ levels }: ConfidenceMeterProps) {
  const [selectedLevel, setSelectedLevel] = useState(levels[0]?.level ?? "");

  function selectLevel(level: string) {
    setSelectedLevel(level);
    trackAnalyticsEvent("validation_confidence_meter_interaction", {
      confidence_level: level
    });
  }

  return (
    <div className="rounded-md border border-line bg-paper p-5">
      <div className="grid gap-3 sm:grid-cols-4">
        {levels.map((level) => (
          <button
            key={level.level}
            type="button"
            className={cn(
              "min-h-11 rounded-md border px-3 py-3 text-left transition",
              selectedLevel === level.level ? "border-accent bg-accent-soft text-ink" : "border-line bg-panel text-muted hover:border-accent hover:text-ink"
            )}
            onClick={() => selectLevel(level.level)}
          >
            <span className="block text-sm font-semibold uppercase tracking-[0.12em] text-accent">{level.level}</span>
            <span className="mt-2 block text-sm leading-6">{level.action}</span>
          </button>
        ))}
      </div>
      {levels.map((level) =>
        level.level === selectedLevel ? (
          <p key={level.level} className="mt-5 leading-7 text-muted">
            {level.description}
          </p>
        ) : null
      )}
    </div>
  );
}

export function DecisionScorecard({ items }: DecisionScorecardProps) {
  const [answers, setAnswers] = useState<Record<string, "Yes" | "No">>({});

  function answerItem(item: string, value: "Yes" | "No") {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [item]: value
    }));
    trackAnalyticsEvent("validation_scorecard_interaction", {
      scorecard_item: item,
      scorecard_value: value
    });
  }

  const yesCount = Object.values(answers).filter((answer) => answer === "Yes").length;

  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <div key={item} className="rounded-md border border-line bg-panel p-5">
          <p className="leading-7 text-muted">{item}</p>
          <div className="mt-4 flex gap-2">
            {(["Yes", "No"] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={cn(
                  "min-h-11 rounded-md border px-4 text-sm font-semibold transition",
                  answers[item] === value ? "border-accent bg-accent-soft text-accent" : "border-line bg-paper text-muted hover:border-accent hover:text-ink"
                )}
                onClick={() => answerItem(item, value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className="rounded-md border border-line bg-paper p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Current score</p>
        <p className="mt-2 text-2xl font-semibold text-ink">
          {yesCount} / {items.length} Yes
        </p>
      </div>
    </div>
  );
}

export function DecisionQualityScore({ bands }: DecisionQualityScoreProps) {
  function trackBand(range: string) {
    trackAnalyticsEvent("validation_decision_quality_score_checked", {
      scorecard_value: range
    });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {bands.map((band) => (
        <button key={band.range} type="button" className="rounded-md border border-line bg-paper p-5 text-left transition hover:border-accent" onClick={() => trackBand(band.range)}>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">{band.range}</p>
          <h3 className="mt-3 text-xl font-semibold text-ink">{band.title}</h3>
          <p className="mt-3 leading-7 text-muted">{band.description}</p>
        </button>
      ))}
    </div>
  );
}

export function StopCriteriaGrid({ criteria }: StopCriteriaGridProps) {
  useEffect(() => {
    criteria.forEach((criterion) => {
      trackAnalyticsEvent("validation_stop_criteria_viewed", {
        stop_criteria_name: criterion.title
      });
    });
  }, [criteria]);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {criteria.map((criterion) => (
        <article key={criterion.title} className="rounded-md border border-line bg-paper p-5">
          <h3 className="text-xl font-semibold leading-tight text-ink">{criterion.title}</h3>
          <p className="mt-3 leading-7 text-muted">{criterion.description}</p>
        </article>
      ))}
    </div>
  );
}

export function DecisionReviewStarted({ name }: { name: string }) {
  function trackReview() {
    trackAnalyticsEvent("validation_review_started", {
      module_name: name
    });
  }

  return (
    <button
      type="button"
      className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md border border-line bg-paper px-4 text-sm font-semibold text-ink transition hover:border-accent"
      onClick={trackReview}
    >
      Mark review started
    </button>
  );
}
