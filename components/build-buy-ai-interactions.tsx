"use client";

import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import { ButtonLink } from "@/components/ui/button-link";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type BuildBuyViewedProps = {
  name: string;
};

type BuildBuyQuestionGroupProps = {
  questions: string[];
  title: string;
};

type BuildBuyTrackedLinkProps = {
  children: ReactNode;
  className?: string;
  eventName: "build_buy_example_clicked" | "build_buy_next_module_clicked";
  href: string;
  label: string;
  variant?: "primary" | "secondary" | "inline";
};

type OwnershipMatrixProps = {
  quadrants: Array<{
    action: string;
    description: string;
    quadrant: string;
    risk: string;
  }>;
};

type OwnershipScorecardProps = {
  dimensions: Array<{
    question?: string;
    title: string;
  }>;
};

export function BuildBuyViewed({ name }: BuildBuyViewedProps) {
  useEffect(() => {
    trackAnalyticsEvent("build_buy_viewed", {
      decision_system_name: name
    });
  }, [name]);

  return null;
}

export function BuildBuyQuestionGroup({ questions, title }: BuildBuyQuestionGroupProps) {
  const [isOpen, setIsOpen] = useState(false);

  function toggleOpen() {
    const nextIsOpen = !isOpen;

    setIsOpen(nextIsOpen);

    if (nextIsOpen) {
      trackAnalyticsEvent("build_buy_question_expanded", {
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

export function BuildBuyTrackedLink({ children, className, eventName, href, label, variant = "inline" }: BuildBuyTrackedLinkProps) {
  function trackClick() {
    trackAnalyticsEvent(eventName, {
      ...(eventName === "build_buy_example_clicked" ? { example_name: label } : {}),
      ...(eventName === "build_buy_next_module_clicked" ? { module_name: label } : {}),
      link_url: href
    });
  }

  return (
    <ButtonLink href={href} variant={variant} className={className} onClick={trackClick}>
      {children}
    </ButtonLink>
  );
}

export function OwnershipMatrix({ quadrants }: OwnershipMatrixProps) {
  const [selectedQuadrant, setSelectedQuadrant] = useState(quadrants[0]?.quadrant ?? "");

  function selectQuadrant(quadrant: string) {
    setSelectedQuadrant(quadrant);
    trackAnalyticsEvent("build_buy_matrix_interacted", {
      matrix_quadrant: quadrant
    });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {quadrants.map((quadrant) => (
        <button
          key={quadrant.quadrant}
          type="button"
          className={cn(
            "min-h-11 rounded-md border p-5 text-left transition",
            selectedQuadrant === quadrant.quadrant
              ? "border-accent bg-accent-soft text-ink"
              : "border-line bg-paper text-muted hover:border-accent hover:text-ink"
          )}
          onClick={() => selectQuadrant(quadrant.quadrant)}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">{quadrant.quadrant}</p>
          <h3 className="mt-3 text-xl font-semibold leading-tight text-ink">{quadrant.action}</h3>
          <p className="mt-3 leading-7">{quadrant.description}</p>
          <p className="mt-3 text-sm leading-6 text-muted">Risk to watch: {quadrant.risk}</p>
        </button>
      ))}
    </div>
  );
}

export function OwnershipScorecard({ dimensions }: OwnershipScorecardProps) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const totalScore = useMemo(() => Object.values(scores).reduce((total, score) => total + score, 0), [scores]);
  const isComplete = dimensions.every((dimension) => scores[dimension.title]);
  const recommendation = getRecommendation(totalScore);

  function selectScore(dimension: string, score: number) {
    const nextScores = {
      ...scores,
      [dimension]: score
    };
    const nextTotal = Object.values(nextScores).reduce((total, value) => total + value, 0);
    const nextIsComplete = dimensions.every((item) => nextScores[item.title]);
    const nextRecommendation = getRecommendation(nextTotal);

    setScores(nextScores);

    if (nextIsComplete) {
      trackAnalyticsEvent("build_buy_scorecard_completed", {
        recommendation: nextRecommendation,
        score_total: nextTotal
      });
    }
  }

  return (
    <div className="grid gap-4">
      {dimensions.map((dimension) => (
        <div key={dimension.title} className="rounded-md border border-line bg-panel p-5">
          <p className="font-semibold leading-7 text-ink">{dimension.title}</p>
          {dimension.question ? <p className="mt-2 text-sm leading-6 text-muted">{dimension.question}</p> : null}
          <div className="mt-4 grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                type="button"
                className={cn(
                  "min-h-11 rounded-md border text-sm font-semibold transition",
                  scores[dimension.title] === score
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-line bg-paper text-muted hover:border-accent hover:text-ink"
                )}
                aria-label={`${dimension.title}: ${score} out of 5`}
                onClick={() => selectScore(dimension.title, score)}
              >
                {score}
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className="rounded-md border border-line bg-paper p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Current score</p>
        <p className="mt-2 text-2xl font-semibold text-ink">
          {totalScore} / 55
        </p>
        <p className="mt-3 leading-7 text-muted">
          {isComplete ? `Recommendation: ${recommendation}` : "Score every dimension to generate an ownership recommendation."}
        </p>
      </div>
    </div>
  );
}

function getRecommendation(score: number) {
  if (score >= 47) {
    return "Build or Platform";
  }

  if (score >= 38) {
    return "Extend or Build Selectively";
  }

  if (score >= 29) {
    return "Configure or Prototype";
  }

  if (score >= 20) {
    return "Buy or Park";
  }

  return "Reject or Reframe";
}
