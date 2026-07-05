import type { ReactNode } from "react";
import { ArrowRight, BarChart3, CheckCircle2, Compass, GitBranch, Layers3 } from "lucide-react";

import { PlbSectionViewed, PlbTrackedLink } from "@/components/product-leadership-brief-interactions";
import type {
  BriefMetric,
  BriefPanel,
  ConstraintMapItem,
  DecisionOption,
  ImpactCategory,
  ProductLeadershipBrief,
  SignaturePrinciple,
  VisualFlow
} from "@/data/product-leadership-briefs";

export function DecisionHero({ brief }: { brief: ProductLeadershipBrief }) {
  return (
    <section className="border-b border-line bg-panel" aria-labelledby="plb-title">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <div className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">The Decision</p>
          <h1 id="plb-title" className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
            {brief.hero.headline}
          </h1>
          <div className="mt-6 max-w-3xl space-y-4 text-lg leading-8 text-muted">
            {brief.hero.supportingCopy.map((copy) => (
              <p key={copy}>{copy}</p>
            ))}
          </div>
          <KpiStrip metrics={brief.hero.kpis} className="mt-8" />
        </div>
      </div>
    </section>
  );
}

export function ExecutiveSnapshot({ items }: { items: ProductLeadershipBrief["executiveSnapshot"] }) {
  return (
    <BriefSection eyebrow="Executive Snapshot" title="The operating context behind the decision" id="executive-snapshot">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article key={item.label} className="rounded-md border border-line bg-panel p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{item.label}</p>
            <p className="mt-3 font-semibold leading-7 text-ink">{item.value}</p>
          </article>
        ))}
      </div>
    </BriefSection>
  );
}

export function LeadershipPanel({ panel, id }: { id: string; panel: BriefPanel }) {
  return (
    <BriefSection eyebrow={panel.eyebrow} title={panel.title} id={id}>
      <div className="rounded-md border border-line bg-panel p-6">
        <div className="max-w-4xl space-y-4 text-lg leading-8 text-muted">
          {panel.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        {panel.bullets ? (
          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {panel.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3 rounded-md border border-line bg-paper p-4 leading-7 text-muted">
                <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-accent" aria-hidden="true" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </BriefSection>
  );
}

export function DecisionMatrix({ options }: { options: DecisionOption[] }) {
  return (
    <BriefSection eyebrow="Strategic Options" title="The options were not feature choices. They were product direction choices." id="strategic-options" background="panel">
      <div className="grid gap-4 lg:grid-cols-3">
        {options.map((option) => (
          <article key={option.label} className="rounded-md border border-line bg-paper p-5">
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">{option.label}</p>
              {option.selected ? (
                <span className="rounded-full border border-line bg-panel px-3 py-1 text-xs font-semibold text-ink">Chosen</span>
              ) : null}
            </div>
            <h3 className="mt-4 text-xl font-semibold leading-tight text-ink">{option.title}</h3>
            <p className="mt-3 leading-7 text-muted">{option.description}</p>
            {option.benefits ? (
              <OptionList title="Benefits" items={option.benefits} />
            ) : null}
            {option.risks ? (
              <OptionList title="Risks" items={option.risks} />
            ) : null}
            {option.decision ? (
              <>
                <p className="mt-5 text-sm font-semibold uppercase tracking-[0.14em] text-accent">Decision</p>
                <p className="mt-2 font-semibold leading-7 text-ink">{option.decision}</p>
              </>
            ) : (
              <>
                <p className="mt-5 text-sm font-semibold uppercase tracking-[0.14em] text-accent">Trade-off</p>
                <p className="mt-2 leading-7 text-muted">{option.tradeoff}</p>
              </>
            )}
          </article>
        ))}
      </div>
    </BriefSection>
  );
}

function OptionList({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="mt-5">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">{title}</p>
      <ul className="mt-2 grid gap-2">
        {items.map((item) => (
          <li key={item} className="leading-7 text-muted">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ConstraintMapping({ items }: { items: ConstraintMapItem[] }) {
  return (
    <BriefSection eyebrow="Constraint Mapping" title="The product decision was shaped by business constraints, not preference." id="constraint-mapping">
      <PlbSectionViewed eventName="constraint_mapping_viewed" sectionName="Constraint Mapping" />
      <div className="overflow-hidden rounded-md border border-line bg-panel shadow-soft">
        <div className="hidden grid-cols-3 border-b border-line bg-paper text-xs font-semibold uppercase tracking-[0.14em] text-accent md:grid">
          <div className="p-4">Constraint</div>
          <div className="border-l border-line p-4">Business Impact</div>
          <div className="border-l border-line p-4">Decision</div>
        </div>
        <div className="divide-y divide-line">
          {items.map((item) => (
            <article key={item.constraint} className="grid gap-4 p-5 md:grid-cols-3 md:gap-0 md:p-0">
              <div className="md:p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent md:hidden">Constraint</p>
                <p className="mt-1 font-semibold leading-7 text-ink md:mt-0">{item.constraint}</p>
              </div>
              <div className="md:border-l md:border-line md:p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent md:hidden">Business Impact</p>
                <p className="mt-1 leading-7 text-muted md:mt-0">{item.businessImpact}</p>
              </div>
              <div className="md:border-l md:border-line md:p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent md:hidden">Decision</p>
                <p className="mt-1 font-semibold leading-7 text-ink md:mt-0">{item.decision}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </BriefSection>
  );
}

export function VisualFlowSection({ flow, variant = "linear" }: { flow: VisualFlow; variant?: "linear" | "cycle" }) {
  const eventName = flow.id === "architecture-evolution" ? "architecture_evolution_viewed" : "flywheel_viewed";

  return (
    <BriefSection eyebrow={flow.eyebrow} title={flow.title} id={flow.id} background={variant === "cycle" ? "panel" : undefined}>
      <PlbSectionViewed eventName={eventName} sectionName={flow.eyebrow} />
      <div className="rounded-md border border-line bg-paper p-6">
        <p className="max-w-3xl leading-7 text-muted">{flow.description}</p>
        <div className={variant === "cycle" ? "mt-8 grid gap-3 lg:grid-cols-3" : "mt-8 grid gap-3"}>
          {flow.steps.map((step, index) => (
            <div key={step}>
              <div className="rounded-md border border-line bg-panel p-4 text-center font-semibold leading-7 text-ink">{step}</div>
              {index < flow.steps.length - 1 ? (
                <div className="flex justify-center py-2 text-accent" aria-hidden="true">
                  <ArrowRight className={variant === "cycle" ? "h-4 w-4 rotate-90 lg:rotate-0" : "h-4 w-4 rotate-90"} />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </BriefSection>
  );
}

export function TradeoffSection({ tradeoffs }: { tradeoffs: ProductLeadershipBrief["tradeoffs"] }) {
  return (
    <BriefSection eyebrow="Trade-offs" title="The leadership work was deciding what not to optimize for first." id="trade-offs" background="panel">
      <div className="grid gap-4">
        {tradeoffs.map((item) => (
          <article key={item.decision} className="rounded-md border border-line bg-paper p-5">
            <h3 className="text-xl font-semibold leading-tight text-ink">{item.decision}</h3>
            <p className="mt-3 leading-7 text-muted">{item.tradeoff}</p>
            <p className="mt-4 rounded-md border border-line bg-panel p-4 font-semibold leading-7 text-ink">{item.leadershipSignal}</p>
          </article>
        ))}
      </div>
    </BriefSection>
  );
}

export function ImpactDashboard({ categories }: { categories: ImpactCategory[] }) {
  return (
    <BriefSection eyebrow="Impact Dashboard" title="What changed after the decision" id="impact-dashboard">
      <PlbSectionViewed eventName="impact_dashboard_viewed" sectionName="Impact Dashboard" />
      <div className="grid gap-4 lg:grid-cols-3">
        {categories.map((category) => (
          <article key={category.title} className="rounded-md border border-line bg-panel p-5">
            <BarChart3 className="h-5 w-5 text-accent" aria-hidden="true" />
            <h3 className="mt-5 text-xl font-semibold leading-tight text-ink">{category.title}</h3>
            <div className="mt-5 grid gap-3">
              {category.metrics.map((metric) => (
                <MetricBlock key={`${category.title}-${metric.label}`} metric={metric} />
              ))}
            </div>
            <p className="mt-5 leading-7 text-muted">{category.note}</p>
          </article>
        ))}
      </div>
    </BriefSection>
  );
}

export function ReflectionSection({ reflection }: { reflection: ProductLeadershipBrief["reflection"] }) {
  return (
    <BriefSection eyebrow="Reflection" title="What this decision taught me about product leadership" id="reflection" background="panel">
      <PlbSectionViewed eventName="reflection_viewed" sectionName="Reflection" />
      <div className="grid gap-4 lg:grid-cols-3">
        {reflection.map((item) => (
          <article key={item.prompt} className="rounded-md border border-line bg-paper p-5">
            <h3 className="text-xl font-semibold leading-tight text-ink">{item.prompt}</h3>
            <p className="mt-3 leading-7 text-muted">{item.response}</p>
          </article>
        ))}
      </div>
    </BriefSection>
  );
}

export function ProductPrinciples({ principles }: { principles: ProductLeadershipBrief["productPrinciples"] }) {
  return (
    <BriefSection eyebrow="Product Principles" title="The principles this brief demonstrates" id="product-principles">
      <div className="grid gap-4 lg:grid-cols-3">
        {principles.map((principle) => (
          <article key={principle.title} className="rounded-md border border-line bg-panel p-5">
            <Compass className="h-5 w-5 text-accent" aria-hidden="true" />
            <h3 className="mt-5 text-xl font-semibold leading-tight text-ink">{principle.title}</h3>
            <p className="mt-3 leading-7 text-muted">{principle.description}</p>
          </article>
        ))}
      </div>
    </BriefSection>
  );
}

export function RelatedResources({ resources }: { resources: ProductLeadershipBrief["relatedResources"] }) {
  return (
    <BriefSection eyebrow="Related Product OS" title="Where this decision connects to the broader system" id="related-product-os" background="panel">
      <div className="grid gap-4 lg:grid-cols-4">
        {resources.map((resource) => (
          <article key={resource.title} className="rounded-md border border-line bg-paper p-5">
            <GitBranch className="h-5 w-5 text-accent" aria-hidden="true" />
            <h3 className="mt-5 text-xl font-semibold leading-tight text-ink">{resource.title}</h3>
            <p className="mt-3 leading-7 text-muted">{resource.description}</p>
            <PlbTrackedLink
              href={resource.href}
              eventName="related_resource_clicked"
              label={resource.title}
              className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent transition hover:text-ink"
            >
              Open resource
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </PlbTrackedLink>
          </article>
        ))}
      </div>
    </BriefSection>
  );
}

export function SignaturePrincipleSection({ principle }: { principle: SignaturePrinciple }) {
  return (
    <BriefSection eyebrow="Signature Product Principle" title="The product leadership principle behind the decision" id="signature-principle" background="panel">
      <PlbSectionViewed eventName="signature_principle_viewed" sectionName="Signature Product Principle" />
      <figure className="rounded-md border border-line bg-paper p-6 shadow-soft">
        <blockquote className="text-3xl font-semibold leading-tight text-ink sm:text-4xl">
          “{principle.quote}”
        </blockquote>
        {principle.supportingCopy ? <figcaption className="mt-6 max-w-3xl leading-7 text-muted">{principle.supportingCopy}</figcaption> : null}
      </figure>
    </BriefSection>
  );
}

export function ContinueExploring({ items }: { items: ProductLeadershipBrief["continueExploring"] }) {
  return (
    <BriefSection eyebrow="Continue Exploring" title="Continue from this brief into the broader Product OS" id="continue-exploring">
      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((item) => (
          <article key={item.title} className="rounded-md border border-line bg-panel p-5">
            <Layers3 className="h-5 w-5 text-accent" aria-hidden="true" />
            <h3 className="mt-5 text-xl font-semibold leading-tight text-ink">{item.title}</h3>
            <p className="mt-3 leading-7 text-muted">{item.description}</p>
            <PlbTrackedLink
              href={item.href}
              eventName="continue_exploring_clicked"
              label={item.title}
              className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent transition hover:text-ink"
            >
              Continue exploring
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </PlbTrackedLink>
          </article>
        ))}
      </div>
    </BriefSection>
  );
}

function BriefSection({
  background,
  children,
  eyebrow,
  id,
  title
}: {
  background?: "panel";
  children: ReactNode;
  eyebrow: string;
  id: string;
  title: string;
}) {
  return (
    <section id={id} className={`border-b border-line ${background === "panel" ? "bg-panel" : ""}`} aria-labelledby={`${id}-title`}>
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-14 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">{eyebrow}</p>
          <h2 id={`${id}-title`} className="mt-3 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
            {title}
          </h2>
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

function KpiStrip({ className, metrics }: { className?: string; metrics: BriefMetric[] }) {
  return (
    <div className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-4 ${className ?? ""}`}>
      {metrics.map((metric) => (
        <MetricBlock key={metric.label} metric={metric} />
      ))}
    </div>
  );
}

function MetricBlock({ metric }: { metric: BriefMetric }) {
  return (
    <div className="rounded-md border border-line bg-paper p-4">
      <p className="text-3xl font-semibold leading-none text-ink">{metric.value}</p>
      <p className="mt-3 text-sm font-semibold text-muted">{metric.label}</p>
    </div>
  );
}
