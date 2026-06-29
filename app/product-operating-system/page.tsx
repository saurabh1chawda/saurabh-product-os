import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ArrowRight, Brain, CheckCircle2, Compass, GitBranch } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = {
  title: "Product Operating System",
  description:
    "Saurabh Chawda's Product Operating System: product philosophy, operating principles, decision frameworks, mental models, and product review checklist."
};

const operatingPrinciples = [
  {
    title: "Evidence before conviction",
    explanation: "Strong product judgment starts with visible evidence, not confident storytelling.",
    stories: [
      { title: "Job Guarantee revenue growth", href: "/stories/simplilearn-job-guarantee-growth" },
      { title: "Customer discovery before build", href: "/stories/product-discovery-jove" }
    ]
  },
  {
    title: "Trust is a product feature",
    explanation: "In high-stakes journeys, reliability, clarity, and recovery shape the customer experience as much as functionality.",
    stories: [
      { title: "Payments reliability at scale", href: "/stories/payments-reliability-comviva" },
      { title: "Platform modernization", href: "/stories/platform-modernization-logix" }
    ]
  },
  {
    title: "Fix the system before scaling it",
    explanation: "Growth compounds when the product journey earns confidence before acquisition increases.",
    stories: [
      { title: "Job Guarantee revenue growth", href: "/stories/simplilearn-job-guarantee-growth" }
    ]
  },
  {
    title: "Modernization must create value continuously",
    explanation: "Technical foundations should improve customer and business outcomes throughout the work, not only after a final migration.",
    stories: [
      { title: "Platform modernization", href: "/stories/platform-modernization-logix" }
    ]
  },
  {
    title: "Discovery protects delivery",
    explanation: "The fastest team is the one that spends less time building the wrong thing.",
    stories: [
      { title: "Customer discovery before build", href: "/stories/product-discovery-jove" }
    ]
  },
  {
    title: "Roadmaps are trade-off documents",
    explanation: "A roadmap should make choices, sequencing, risk, and opportunity cost visible.",
    stories: [
      { title: "Payments reliability at scale", href: "/stories/payments-reliability-comviva" },
      { title: "Platform modernization", href: "/stories/platform-modernization-logix" }
    ]
  },
  {
    title: "Measure the behavior you need to change",
    explanation: "Metrics matter most when they reveal whether the product decision changed customer, business, or system behavior.",
    stories: [
      { title: "Job Guarantee revenue growth", href: "/stories/simplilearn-job-guarantee-growth" },
      { title: "Payments reliability at scale", href: "/stories/payments-reliability-comviva" }
    ]
  },
  {
    title: "Leadership is alignment under uncertainty",
    explanation: "Product leadership turns ambiguity into a decision path that teams can understand, challenge, and execute.",
    stories: [
      { title: "Platform modernization", href: "/stories/platform-modernization-logix" },
      { title: "Customer discovery before build", href: "/stories/product-discovery-jove" }
    ]
  }
];

const decisionFrameworks = [
  { title: "Build vs Buy AI" },
  { title: "RAG vs Agent" },
  { title: "Product Prioritization", href: "/frameworks/product-prioritization" },
  { title: "Product Discovery", href: "/frameworks/product-discovery" },
  { title: "Experiment Framework" },
  { title: "Product Health Scorecard" }
];

const mentalModels = [
  { title: "Systems Thinking" },
  { title: "Customer Trust" },
  { title: "Opportunity Cost" },
  { title: "Learning Velocity" },
  { title: "Second-order Effects" }
];

const checklist = [
  "What customer behavior are we trying to change?",
  "What evidence says this problem matters now?",
  "What options did we reject, and why?",
  "What is the smallest decision that creates useful learning?",
  "What trade-off are we asking the business to accept?",
  "What metric would prove the product decision worked?",
  "What could fail, and how would customers experience that failure?",
  "What does this decision make easier or harder six months from now?"
];

const relatedStories = [
  {
    title: "How I Helped Grow Job Guarantee Revenue 10x",
    tag: "Growth & Monetization",
    href: "/stories/simplilearn-job-guarantee-growth"
  },
  {
    title: "How We Improved Payment Reliability at 10M+ Monthly Transaction Scale",
    tag: "Payments & Reliability",
    href: "/stories/payments-reliability-comviva"
  },
  {
    title: "How I Modernized a Growing Platform Without Slowing the Business",
    tag: "Platform Strategy",
    href: "/stories/platform-modernization-logix"
  },
  {
    title: "How We Discovered the Right Product Before Building It",
    tag: "Customer Discovery",
    href: "/stories/product-discovery-jove"
  }
];

export default function ProductOperatingSystemPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-line bg-panel" aria-labelledby="pos-title">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Product Operating System</p>
              <h1 id="pos-title" className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
                Product judgment made explicit.
              </h1>
              <p className="mt-6 max-w-3xl text-xl leading-8 text-ink">
                I build products by turning ambiguity into evidence-backed decisions that customers, teams, and businesses can trust.
              </p>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
                This operating system captures the principles, frameworks, mental models, and review habits behind the flagship product stories in this decision library.
              </p>
            </div>
          </div>
        </section>

        <TextSection
          eyebrow="Product Philosophy"
          title="The philosophy behind the work"
          icon={<Compass className="h-6 w-6 text-accent" aria-hidden="true" />}
        >
          <p>
            Product management is the discipline of making better decisions under uncertainty. My approach starts by clarifying the customer problem, exposing the trade-offs, and identifying the evidence that should change the team&apos;s mind.
          </p>
          <p>
            The goal is not to look decisive early. The goal is to improve the quality of the decision before the cost of being wrong becomes expensive.
          </p>
        </TextSection>

        <section className="border-b border-line bg-panel" aria-labelledby="principles-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Operating Principles" id="principles-title" title="Eight Operating Principles" />
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {operatingPrinciples.map((principle) => (
                <article key={principle.title} className="rounded-md border border-line bg-paper p-5">
                  <h3 className="text-xl font-semibold text-ink">{principle.title}</h3>
                  <p className="mt-3 leading-7 text-muted">{principle.explanation}</p>
                  <div className="mt-5 border-t border-line pt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Supporting flagship stories</p>
                    <div className="mt-3 flex flex-col gap-2">
                      {principle.stories.map((story) => (
                        <ButtonLink key={story.href} href={story.href} variant="inline">
                          {story.title}
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </ButtonLink>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <CardGrid
          eyebrow="Decision Frameworks"
          icon={<GitBranch className="h-5 w-5 text-accent" aria-hidden="true" />}
          items={decisionFrameworks}
          title="Reusable decision tools"
        />

        <CardGrid
          background="panel"
          eyebrow="Mental Models"
          icon={<Brain className="h-5 w-5 text-accent" aria-hidden="true" />}
          items={mentalModels}
          title="How I reason through product ambiguity"
        />

        <section className="border-b border-line" aria-labelledby="checklist-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Product Review Checklist" id="checklist-title" title="Questions I use before committing product work" />
            <div className="mt-8 grid gap-3 lg:grid-cols-2">
              {checklist.map((item) => (
                <div key={item} className="flex gap-3 rounded-md border border-line bg-panel p-5">
                  <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-accent" aria-hidden="true" />
                  <p className="leading-7 text-muted">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-panel" aria-labelledby="related-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Related Stories" id="related-title" title="Product judgment in practice" />
            <div className="mt-8 grid gap-4 lg:grid-cols-4">
              {relatedStories.map((story) => (
                <article key={story.href} className="rounded-md border border-line bg-paper p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">{story.tag}</p>
                  <h3 className="mt-4 text-xl font-semibold leading-tight text-ink">{story.title}</h3>
                  <ButtonLink href={story.href} variant="inline" className="mt-5">
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

function TextSection({
  children,
  eyebrow,
  icon,
  title
}: {
  children: ReactNode;
  eyebrow: string;
  icon: ReactNode;
  title: string;
}) {
  const headingId = `${eyebrow.toLowerCase().replaceAll(" ", "-")}-title`;

  return (
    <section className="border-b border-line" aria-labelledby={headingId}>
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
        <div>
          {icon}
          <SectionHeader eyebrow={eyebrow} id={headingId} title={title} />
        </div>
        <div className="space-y-5 text-lg leading-8 text-muted">{children}</div>
      </div>
    </section>
  );
}

function CardGrid({
  background,
  eyebrow,
  icon,
  items,
  title
}: {
  background?: "panel";
  eyebrow: string;
  icon: ReactNode;
  items: Array<{
    href?: string;
    title: string;
  }>;
  title: string;
}) {
  return (
    <section className={`border-b border-line ${background === "panel" ? "bg-panel" : ""}`} aria-labelledby={`${eyebrow.toLowerCase().replaceAll(" ", "-")}-title`}>
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
        <SectionHeader eyebrow={eyebrow} id={`${eyebrow.toLowerCase().replaceAll(" ", "-")}-title`} title={title} />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article key={item.title} className={`rounded-md border border-line p-5 ${background === "panel" ? "bg-paper" : "bg-panel"}`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-line bg-paper">
                {icon}
              </div>
              <h3 className="mt-5 text-xl font-semibold text-ink">{item.title}</h3>
              <p className="mt-3 leading-7 text-muted">Placeholder framework to be expanded with examples, prompts, and representative evidence.</p>
              {item.href ? (
                <ButtonLink href={item.href} variant="inline" className="mt-5">
                  Open framework
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </ButtonLink>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  id,
  title
}: {
  eyebrow: string;
  id: string;
  title: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">{eyebrow}</p>
      <h2 id={id} className="mt-3 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
        {title}
      </h2>
    </div>
  );
}
