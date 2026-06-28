import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

import { EvidenceLibrary } from "@/components/evidence-library";
import type { ProductStory } from "@/data/product-stories";
import { SiteHeader } from "@/components/site-header";
import { ButtonLink } from "@/components/ui/button-link";
import { cn } from "@/lib/utils";

type ProductStoryTemplateProps = {
  story: ProductStory;
};

export function ProductStoryTemplate({ story }: ProductStoryTemplateProps) {
  return (
    <StoryLayout>
      <StoryHero story={story} />
      <KeyTakeaway>{story.hero.keyTakeaway}</KeyTakeaway>
      <ExecutiveSnapshot items={story.snapshot} />
      <StoryTextSection
        eyebrow={story.sectionLabels?.whyEyebrow ?? "Why This Problem Mattered"}
        title={story.sectionLabels?.whyTitle ?? "The job was bigger than a conversion lift"}
      >
        {story.whyItMattered.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </StoryTextSection>
      <ContextGrid
        eyebrow={story.sectionLabels?.contextEyebrow ?? "Context"}
        items={story.context}
        title={story.sectionLabels?.contextTitle ?? "What shaped the product decision"}
      />
      <OptionsConsidered options={story.options} />
      <DecisionFramework framework={story.decisionFramework} flowSteps={story.decisionFlow} />
      <StoryTextSection
        eyebrow="My Decision"
        title={story.sectionLabels?.decisionTitle ?? "Why I chose the conversion system first"}
      >
        {story.decision.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </StoryTextSection>
      {story.stakeholderAlignment ? (
        <StakeholderAlignment
          eyebrow={story.sectionLabels?.stakeholderEyebrow ?? "Stakeholder Alignment"}
          items={story.stakeholderAlignment}
          title={story.sectionLabels?.stakeholderTitle ?? "How I kept momentum while trade-offs stayed visible"}
        />
      ) : null}
      <ExecutionTimeline
        eyebrow={story.sectionLabels?.executionEyebrow ?? "Execution Timeline"}
        items={story.timeline}
        title={story.sectionLabels?.executionTitle ?? "How the work moved from diagnosis to scale"}
      />
      <ResultsGrid groups={story.results} />
      <Reflection items={story.reflection} />
      <ProductPrinciple
        category={story.principleCategory}
        relatedHref="#related-by-capability"
        summary={story.principleSummary}
        title={story.productPrinciple}
      />
      <EvidenceLibrary artifacts={story.evidence} />
      <StoryDemonstrates story={story} />
      <RelatedByCapability stories={story.relatedByCapability} />
    </StoryLayout>
  );
}

export function StoryLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
    </>
  );
}

function StoryHero({ story }: { story: ProductStory }) {
  return (
    <section className="border-b border-line bg-panel" aria-labelledby="story-title">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <ButtonLink href="/" variant="inline">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Product OS
        </ButtonLink>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Product Story</p>
            <h1 id="story-title" className="mt-4 max-w-4xl text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
              {story.hero.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">{story.hero.summary}</p>
          </div>
          <aside className="rounded-md border border-line bg-paper p-5" aria-label="Story details">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">
              {story.hero.metrics ? "Hero metrics" : "Hero metric"}
            </p>
            {story.hero.metrics ? (
              <ul className="mt-3 grid gap-3">
                {story.hero.metrics.map((metric) => (
                  <li key={metric} className="border-b border-line pb-3 text-2xl font-semibold leading-tight text-ink last:border-b-0 last:pb-0">
                    {metric}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-3xl font-semibold text-ink">{story.hero.metric}</p>
            )}
            <dl className="mt-6 grid gap-4 text-sm">
              <StoryFact label="Company" value={story.hero.company} />
              <StoryFact label="Timeline" value={story.hero.timeline} />
              <StoryFact label="Role" value={story.hero.role} />
            </dl>
          </aside>
        </div>
      </div>
    </section>
  );
}

function KeyTakeaway({ children }: { children: ReactNode }) {
  return (
    <section className="border-b border-line bg-paper" aria-labelledby="key-takeaway-title">
      <div className="mx-auto max-w-6xl px-5 py-5 sm:px-8 lg:px-10">
        <div className="rounded-md border border-line bg-panel px-5 py-4">
          <h2 id="key-takeaway-title" className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            Key Takeaway
          </h2>
          <p className="mt-2 text-base leading-7 text-ink">{children}</p>
        </div>
      </div>
    </section>
  );
}

export function ExecutiveSnapshot({ items }: { items: ProductStory["snapshot"] }) {
  return (
    <section className="border-b border-line" aria-labelledby="executive-snapshot-title">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
        <StorySectionHeader
          id="executive-snapshot-title"
          eyebrow="Executive Snapshot"
          title="The decision in one page"
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          {items.map((item) => (
            <article key={item.label} className="rounded-md border border-line bg-panel p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">{item.label}</h3>
              <p className="mt-4 leading-7 text-muted">{item.value}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContextGrid({
  eyebrow,
  items,
  title
}: {
  eyebrow: string;
  items: ProductStory["context"];
  title: string;
}) {
  return (
    <section className="border-b border-line bg-panel" aria-labelledby="context-title">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
        <StorySectionHeader id="context-title" eyebrow={eyebrow} title={title} />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {items.map((item) => (
            <article key={item.label} className="rounded-md border border-line bg-paper p-5">
              <h3 className="text-xl font-semibold text-ink">{item.label}</h3>
              <p className="mt-3 leading-7 text-muted">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function OptionsConsidered({ options }: { options: ProductStory["options"] }) {
  return (
    <section className="border-b border-line" aria-labelledby="options-considered-title">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
        <StorySectionHeader
          id="options-considered-title"
          eyebrow="Options Considered"
          title="The trade-offs before choosing a path"
          description="The decision was not whether to grow. It was which growth lever gave the team the best odds of durable revenue."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {options.map((option) => (
            <article
              key={option.label}
              className={cn("rounded-md border bg-panel p-5", option.chosen ? "border-accent shadow-soft" : "border-line")}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">{option.label}</p>
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
  );
}

export function DecisionFramework({
  framework,
  flowSteps
}: {
  framework: ProductStory["decisionFramework"];
  flowSteps: ProductStory["decisionFlow"];
}) {
  return (
    <section className="border-b border-line bg-panel" aria-labelledby="decision-framework-title">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
        <StorySectionHeader
          id="decision-framework-title"
          eyebrow="Decision Framework"
          title="How I evaluated the path forward"
          description={framework.explanation}
        />
        <div className="mt-8">
          <div className="rounded-md border border-line bg-paper p-5">
            <div className="grid gap-4">
              {framework.criteria.map((criterion) => (
                <div
                  key={criterion.label}
                  className="flex items-center justify-between gap-4 border-b border-line pb-4 last:border-b-0 last:pb-0"
                >
                  <h3 className="font-semibold text-ink">{criterion.label}</h3>
                  <RatingBar label={criterion.label} score={criterion.score} />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5">
            <DecisionFlow steps={flowSteps} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function DecisionFlow({ steps }: { steps: ProductStory["decisionFlow"] }) {
  return (
    <div className="rounded-md border border-line bg-paper p-5" aria-label="Decision flow">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr] sm:items-center" role="list">
        {steps.map((step, index) => (
          <FragmentWithArrow key={step} showArrow={index < steps.length - 1}>
            <div className="rounded-md border border-line bg-panel px-4 py-3 text-center text-sm font-semibold text-ink" role="listitem">
              {step}
            </div>
          </FragmentWithArrow>
        ))}
      </div>
    </div>
  );
}

function StakeholderAlignment({
  eyebrow,
  items,
  title
}: {
  eyebrow: string;
  items: NonNullable<ProductStory["stakeholderAlignment"]>;
  title: string;
}) {
  return (
    <section className="border-b border-line" aria-labelledby="stakeholder-alignment-title">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
        <StorySectionHeader
          id="stakeholder-alignment-title"
          eyebrow={eyebrow}
          title={title}
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {items.map((item) => (
            <article key={item.label} className="rounded-md border border-line bg-panel p-5">
              <h3 className="text-xl font-semibold text-ink">{item.label}</h3>
              <p className="mt-3 leading-7 text-muted">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExecutionTimeline({
  eyebrow,
  items,
  title
}: {
  eyebrow: string;
  items: ProductStory["timeline"];
  title: string;
}) {
  return (
    <section className="border-b border-line bg-panel" aria-labelledby="execution-timeline-title">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
        <StorySectionHeader
          id="execution-timeline-title"
          eyebrow={eyebrow}
          title={title}
        />
        <div className="mt-8 grid gap-4">
          {items.map((item) => (
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
  );
}

export function ResultsGrid({ groups }: { groups: ProductStory["results"] }) {
  return (
    <section className="border-b border-line" aria-labelledby="results-title">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
        <StorySectionHeader
          id="results-title"
          eyebrow="Results"
          title="What changed for customers, the business, and the product"
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {groups.map((group) => (
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
  );
}

export function Reflection({ items }: { items: ProductStory["reflection"] }) {
  return (
    <section className="border-b border-line bg-panel" aria-labelledby="reflection-title">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
        <StorySectionHeader id="reflection-title" eyebrow="Reflection" title="What I learned from the work" />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {items.map((item) => (
            <article key={item.question} className="rounded-md border border-line bg-paper p-5">
              <h3 className="text-xl font-semibold text-ink">{item.question}</h3>
              <p className="mt-3 leading-7 text-muted">{item.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProductPrinciple({
  category,
  relatedHref,
  summary,
  title
}: {
  category: ProductStory["principleCategory"];
  relatedHref: string;
  summary: string;
  title: string;
}) {
  return (
    <section className="border-b border-line" aria-labelledby="product-principle-title">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
        <StorySectionHeader
          eyebrow="Principle System"
          id="product-principle-title"
          title="Product Principle"
        />
        <article className="rounded-md border border-line bg-panel p-5 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">{category}</p>
          <h3 className="mt-4 text-2xl font-semibold leading-tight text-ink">{title}</h3>
          <p className="mt-4 text-lg leading-8 text-muted">{summary}</p>
          <ButtonLink href={relatedHref} variant="inline" className="mt-5">
            View related stories
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </ButtonLink>
        </article>
      </div>
    </section>
  );
}

export function StoryDemonstrates({ story }: { story: ProductStory }) {
  return (
    <section className="border-b border-line bg-panel" aria-labelledby="story-demonstrates-title">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
        <StorySectionHeader
          eyebrow="Capability Signal"
          id="story-demonstrates-title"
          title="What This Story Demonstrates"
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          <article className="rounded-md border border-line bg-paper p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Primary Capability</h3>
            <p className="mt-4 leading-7 text-muted">{story.primaryCapability}</p>
          </article>
          <article className="rounded-md border border-line bg-paper p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Secondary Capability</h3>
            <p className="mt-4 leading-7 text-muted">{story.secondaryCapability}</p>
          </article>
          <article className="rounded-md border border-line bg-paper p-5 lg:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Product Principle</h3>
            <p className="mt-4 font-semibold leading-7 text-ink">{story.productPrinciple}</p>
            <p className="mt-2 leading-7 text-muted">{story.principleSummary}</p>
          </article>
          <article className="rounded-md border border-line bg-paper p-5 lg:col-span-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">
              Hiring Questions Answered
            </h3>
            <ul className="mt-4 grid gap-3 lg:grid-cols-2">
              {story.hiringQuestionsAnswered.map((question) => (
                <li key={question} className="flex gap-3 leading-7 text-muted">
                  <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-accent" aria-hidden="true" />
                  <span>{question}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}

export function RelatedByCapability({ stories }: { stories: ProductStory["relatedByCapability"] }) {
  return (
    <section
      id="related-by-capability"
      className="scroll-mt-20 border-b border-line bg-panel"
      aria-labelledby="related-stories-title"
    >
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
        <StorySectionHeader
          eyebrow="Related by Capability"
          id="related-stories-title"
          title="More product judgment to evaluate"
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {stories.map((related) => (
            <article key={related.href} className="rounded-md border border-line bg-paper p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">
                {related.capability}
              </p>
              <h3 className="mt-4 text-xl font-semibold leading-tight text-ink">{related.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{related.tag}</p>
              <ButtonLink href={related.href} variant="inline" className="mt-5">
                View story
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
            </article>
          ))}
        </div>
      </div>
    </section>
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
  description,
  id
}: {
  eyebrow: string;
  title: string;
  description?: string;
  id?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">{eyebrow}</p>
      <h2 id={id} className="mt-3 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
        {title}
      </h2>
      {description ? <p className="mt-4 text-base leading-7 text-muted">{description}</p> : null}
    </div>
  );
}

function RatingBar({ label, score }: { label: string; score: number }) {
  const maxScore = 5;
  const clampedScore = Math.max(0, Math.min(score, maxScore));
  const percentage = `${(clampedScore / maxScore) * 100}%`;

  return (
    <div
      className="flex min-w-[128px] items-center gap-3"
      role="meter"
      aria-label={`${label} rating: ${clampedScore} out of ${maxScore}`}
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
  const headingId = `${eyebrow.toLowerCase().replaceAll(" ", "-")}-title`;

  return (
    <section className="border-b border-line" aria-labelledby={headingId}>
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
        <StorySectionHeader id={headingId} eyebrow={eyebrow} title={title} />
        <div className="space-y-5 text-lg leading-8 text-muted">{children}</div>
      </div>
    </section>
  );
}
