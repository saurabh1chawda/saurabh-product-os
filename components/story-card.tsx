import { ArrowRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";

type StoryCardProps = {
  title: string;
  question: string;
  summary: string;
};

export function StoryCard({ title, question, summary }: StoryCardProps) {
  return (
    <article className="flex h-full flex-col rounded-md border border-line bg-paper p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">{title}</p>
      <h3 className="mt-4 text-xl font-semibold leading-tight text-ink">{question}</h3>
      <p className="mt-3 flex-1 leading-7 text-muted">{summary}</p>
      <ButtonLink href="/stories" variant="inline" className="mt-5">
        Read story
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </ButtonLink>
    </article>
  );
}
