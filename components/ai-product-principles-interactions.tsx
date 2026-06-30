"use client";

import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { ButtonLink } from "@/components/ui/button-link";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type PrincipleCardProps = {
  commonMistake: string;
  example: {
    href: string;
    label: string;
    title: string;
  };
  index: number;
  statement: string;
  whyItMatters: string;
};

type PrinciplesViewedProps = {
  pageName: string;
};

type PrinciplesTrackedLinkProps = {
  children: ReactNode;
  className?: string;
  eventName: "principle_example_clicked" | "continue_learning_clicked";
  href: string;
  label: string;
  principleName?: string;
  variant?: "primary" | "secondary" | "inline";
};

export function AiPrinciplesViewed({ pageName }: PrinciplesViewedProps) {
  useEffect(() => {
    trackAnalyticsEvent("ai_principles_viewed", {
      page_name: pageName
    });
  }, [pageName]);

  return null;
}

export function PrincipleCard({ commonMistake, example, index, statement, whyItMatters }: PrincipleCardProps) {
  const [isOpen, setIsOpen] = useState(index === 1);

  function toggleOpen() {
    const nextIsOpen = !isOpen;

    setIsOpen(nextIsOpen);

    if (nextIsOpen) {
      trackAnalyticsEvent("principle_expanded", {
        principle_name: statement
      });
    }
  }

  return (
    <article className="rounded-md border border-line bg-paper">
      <button
        type="button"
        className="flex min-h-14 w-full items-start justify-between gap-4 px-5 py-5 text-left"
        aria-expanded={isOpen}
        onClick={toggleOpen}
      >
        <span>
          <span className="block text-sm font-semibold uppercase tracking-[0.14em] text-accent">Principle {index}</span>
          <span className="mt-2 block text-xl font-semibold leading-tight text-ink">{statement}</span>
        </span>
        <ChevronDown className={cn("mt-1 h-5 w-5 flex-none text-accent transition", isOpen ? "rotate-180" : "")} aria-hidden="true" />
      </button>
      {isOpen ? (
        <div className="border-t border-line px-5 py-5">
          <div className="grid gap-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Why it matters</p>
              <p className="mt-2 leading-7 text-muted">{whyItMatters}</p>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Common mistake</p>
              <p className="mt-2 leading-7 text-muted">{commonMistake}</p>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Product OS example</p>
              <p className="mt-2 leading-7 text-muted">{example.label}</p>
              <PrinciplesTrackedLink
                href={example.href}
                eventName="principle_example_clicked"
                label={example.title}
                principleName={statement}
                className="mt-3"
              >
                Open example
              </PrinciplesTrackedLink>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function PrinciplesTrackedLink({
  children,
  className,
  eventName,
  href,
  label,
  principleName,
  variant = "inline"
}: PrinciplesTrackedLinkProps) {
  function trackClick() {
    trackAnalyticsEvent(eventName, {
      ...(eventName === "principle_example_clicked" ? { example_name: label, principle_name: principleName } : {}),
      ...(eventName === "continue_learning_clicked" ? { module_name: label } : {}),
      link_url: href
    });
  }

  return (
    <ButtonLink href={href} variant={variant} className={className} onClick={trackClick}>
      {children}
    </ButtonLink>
  );
}
