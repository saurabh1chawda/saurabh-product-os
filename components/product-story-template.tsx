import { ArrowLeft, ArrowRight, CheckCircle2, FileText } from "lucide-react";
import type { ReactNode } from "react";

import type { ProductStory } from "@/data/product-stories";
import { SiteHeader } from "@/components/site-header";
import { ButtonLink } from "@/components/ui/button-link";
import { cn } from "@/lib/utils";

type ProductStoryTemplateProps = {
  story: ProductStory;
};

export function ProductStoryTemplate({ story }: ProductStoryTemplateProps) {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-line bg-panel">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
            <ButtonLink href="/" variant="inline">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Product OS
            </ButtonLink>
            <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px] lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
                  Product Story
                </p>
                <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
                  {story.hero.title}
                </h1>
                <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">{story.hero.summary}</p>
              </div>
              <aside className="rounded-md border border-line bg-paper p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Hero metric</p>
                <p className="mt-3 text-3xl font-semibold text-ink">{story.hero.metric}</p>
                <dl className="mt-6 grid gap-4 text-sm">
                  <StoryFact label="Company" value={story.hero.company} />
                  <StoryFact label="Timeline" value={story.hero.timeline} />
                  <StoryFact label="Role" value={story.hero.role} />
                </dl>
              </aside>
            </div>
          </div>
        </section>

      <section className="border-b border-line bg-paper">
        <div className="mx-auto max-w-6xl px-5 py-5 sm:px-8 lg:px-10">
          <div className="rounded-md border border-line bg-panel px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Key Takeaway</p>
            <p className="mt-2 text-base leading-7 text-ink">{story.hero.keyTakeaway}</p>
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
          <StorySectionHeader eyebrow="Executive Snapshot" title="The decision in one page" />
          <div className="mt-8 grid gap-4 lg:grid-cols-4">
            {story.snapshot.map((item) => (
              <article key={item.label} className="rounded-md border border-line bg-panel p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">{item.label}</p>
                <p className="mt-4 leading-7 text-muted">{item.value}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <StoryTextSection eyebrow="Why This Problem Mattered" title="The job was bigger than a conversion lift">
        {story.whyItMattered.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </StoryTextSection>

      <section className="border-b border-line bg-panel">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
          <StorySectionHeader eyebrow="Context" title="What shaped the product decision" />
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {story.context.map((item) => (
              <article key={item.label} className="rounded-md border border-line bg-paper p-5">
                <h3 className="text-xl font-semibold text-ink">{item.label}</h3>
                <p className="mt-3 leading-7 text-muted">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
          <StorySectionHeader
            eyebrow="Options Considered"
            title="The trade-offs before choosing a path"
            description="The decision was not whether to grow. It was which growth lever gave the team the best odds of durable revenue."
          />
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {story.options.map((option) => (
              <article
                key={option.label}
                className={cn(
                  "rounded-md border bg-panel p-5",
                  option.chosen ? "border-accent shadow-soft" : "border-line"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">
                    {option.label}
                  </p>
                  {option.chosen ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Chosen
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-4 text-xl font-semibold text-ink">{option.title}</h3>
                <p className="mt-3 leading-7 text-muted">{option.description}</p>
                <p className="mt-5 border-t border-line pt-4 text-sm leading-6 text-muted">
                  <span className="font-semibold text-ink">Trade-off: </span>
                  {option.tradeoff}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-panel">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
          <StorySectionHeader
            eyebrow="Decision Framework"
            title="How I evaluated the path forward"
            description={story.decisionFramework.explanation}
          />
          <div className="mt-8">
            <div className="rounded-md border border-line bg-paper p-5">
              <div className="grid gap-4">
                {story.decisionFramework.criteria.map((criterion) => (
                  <div key={criterion.label} className="flex items-center justify-between gap-4 border-b border-line pb-4 last:border-b-0 last:pb-0">
                    <p className="font-semibold text-ink">{criterion.label}</p>
                    <RatingBar score={criterion.score} />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5">
              <DecisionFlow steps={story.decisionFlow} />
            </div>
          </div>
        </div>
      </section>

      <StoryTextSection eyebrow="My Decision" title="Why I chose the conversion system first">
        {story.decision.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </StoryTextSection>

      <section className="border-b border-line bg-panel">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
          <StorySectionHeader eyebrow="Execution Timeline" title="How the work moved from diagnosis to scale" />
          <div className="mt-8 grid gap-4">
            {story.timeline.map((item) => (
              <article key={item.step} className="grid gap-4 rounded-md border border-line bg-paper p-5 sm:grid-cols-[72px_1fr]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-ink">{item.title}</h3>
                  <p className="mt-2 leading-7 text-muted">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
          <StorySectionHeader eyebrow="Results" title="What changed for customers, the business, and the product" />
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {story.results.map((group) => (
              <article key={group.label} className="rounded-md border border-line bg-panel p-5">
                <h3 className="text-xl font-semibold text-ink">{group.label}</h3>
                <ul className="mt-4 space-y-3">
                  {group.outcomes.map((outcome) => (
                    <li key={outcome} className="flex gap-3 leading-7 text-muted">
                      <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-accent" aria-hidden="true" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-panel">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
          <StorySectionHeader eyebrow="Reflection" title="What I learned from the work" />
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {story.reflection.map((item) => (
              <article key={item.question} className="rounded-md border border-line bg-paper p-5">
                <h3 className="text-xl font-semibold text-ink">{item.question}</h3>
                <p className="mt-3 leading-7 text-muted">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <StoryTextSection
        eyebrow="Why This Matters Beyond This Project"
        title="The principle I still use when evaluating growth"
      >
        <p>{story.beyondProject}</p>
      </StoryTextSection>

      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
          <StorySectionHeader
            eyebrow="Supporting Evidence"
            title="Artifacts to attach as the evidence library matures"
            description="These placeholders define the proof system future stories should use."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {story.evidence.map((item) => (
              <article key={item.title} className="rounded-md border border-dashed border-line bg-panel p-5">
                <FileText className="h-6 w-6 text-accent" aria-hidden="true" />
                <h3 className="mt-4 font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-accent">
                  Representative artifact — to be published
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-panel">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
          <StorySectionHeader eyebrow="Related Stories" title="More product judgment to evaluate" />
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {story.relatedStories.map((related) => (
              <article key={related.href} className="rounded-md border border-line bg-paper p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">{related.tag}</p>
                <h3 className="mt-4 text-xl font-semibold leading-tight text-ink">{related.title}</h3>
                <ButtonLink href={related.href} variant="inline" className="mt-5">
                  View story
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </ButtonLink>
              </article>
            ))}
          </div>
        </div>
      </section>
      </main>
    </>
  );
}

function StoryFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold text-ink">{label}</dt>
      <dd className="mt-1 leading-6 text-muted">{value}</dd>
    </div>
  );
}

function StorySectionHeader({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-semibold leading-tight text-ink sm:text-3xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-7 text-muted">{description}</p> : null}
    </div>
  );
}

function RatingBar({ score }: { score: number }) {
  const maxScore = 5;
  const clampedScore = Math.max(0, Math.min(score, maxScore));
  const percentage = `${(clampedScore / maxScore) * 100}%`;

  return (
    <div
      className="flex min-w-[128px] items-center gap-3"
      role="meter"
      aria-label={`Rating: ${clampedScore} out of ${maxScore}`}
      aria-valuemin={0}
      aria-valuemax={maxScore}
      aria-valuenow={clampedScore}
    >
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-accent" style={{ width: percentage }} />
      </div>
      <span className="w-8 text-right text-sm font-semibold text-ink">{clampedScore}/5</span>
    </div>
  );
}

function DecisionFlow({ steps }: { steps: string[] }) {
  return (
    <div className="rounded-md border border-line bg-paper p-5">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr] sm:items-center">
        {steps.map((step, index) => (
          <FragmentWithArrow key={step} showArrow={index < steps.length - 1}>
            <div className="rounded-md border border-line bg-panel px-4 py-3 text-center text-sm font-semibold text-ink">
              {step}
            </div>
          </FragmentWithArrow>
        ))}
      </div>
    </div>
  );
}

function FragmentWithArrow({
  children,
  showArrow
}: {
  children: ReactNode;
  showArrow: boolean;
}) {
  return (
    <>
      {children}
      {showArrow ? (
        <div className="flex justify-center text-accent sm:px-1" aria-hidden="true">
          <span className="sm:hidden">↓</span>
          <span className="hidden sm:inline">→</span>
        </div>
      ) : null}
    </>
  );
}

function StoryTextSection({
  eyebrow,
  title,
  children
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-line">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
        <StorySectionHeader eyebrow={eyebrow} title={title} />
        <div className="space-y-5 text-lg leading-8 text-muted">{children}</div>
      </div>
    </section>
  );
}
