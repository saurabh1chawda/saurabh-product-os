import { ArrowRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";

type StoryCardProps = {
  title: string;
  tag: string;
  summary: string;
  href: string;
  outcome: string;
  readingTime: string;
};

export function StoryCard({ title, tag, summary, href, outcome, readingTime }: StoryCardProps) {
  return (
    <article className="flex h-full flex-col rounded-md border border-line bg-paper p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">{tag}</p>
        <span className="shrink-0 rounded-full border border-line bg-panel px-2.5 py-1 text-xs font-semibold text-muted">
          {readingTime}
        </span>
      </div>
      <p className="mt-4 inline-flex w-fit rounded-full border border-line bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
        {outcome}
      </p>
      <h3 className="mt-3 text-xl font-semibold leading-tight text-ink">{title}</h3>
      <p className="mt-3 flex-1 leading-7 text-muted">{summary}</p>
      <ButtonLink href={href} variant="inline" className="mt-5">
        Read story
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </ButtonLink>
    </article>
  );
}
