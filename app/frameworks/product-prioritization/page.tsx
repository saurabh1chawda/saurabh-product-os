import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ArrowRight, CheckCircle2, GitBranch, Layers, ListChecks } from "lucide-react";

import { AnalyticsRouteEvent } from "@/components/analytics-route-event";
import { SiteHeader } from "@/components/site-header";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = {
  title: "Product Prioritization Framework",
  description:
    "A product prioritization framework for making product decisions under uncertainty with evidence, trade-offs, and learning velocity."
};

const frameworkSteps = [
  {
    step: "Step 1",
    title: "Identify the Highest-Leverage Problem",
    description: "Start by naming the problem that creates the most customer, business, or system leverage if solved."
  },
  {
    step: "Step 2",
    title: "Gather Evidence",
    description: "Use customer signals, product data, support patterns, stakeholder input, and operational evidence to reduce guesswork."
  },
  {
    step: "Step 3",
    title: "Evaluate Second-Order Effects",
    description: "Look beyond the immediate feature or fix and ask what the decision makes easier, harder, riskier, or more durable."
  },
  {
    step: "Step 4",
    title: "Define Explicit Trade-offs",
    description: "Make the cost of the decision visible: time, focus, opportunity cost, technical risk, and customer expectation."
  },
  {
    step: "Step 5",
    title: "Find the Smallest Decision That Creates Learning",
    description: "Choose the smallest meaningful step that creates evidence, not just motion."
  },
  {
    step: "Step 6",
    title: "Reinforce the Product Operating System",
    description: "Convert the learning back into principles, artifacts, metrics, and review habits that improve future decisions."
  }
];

const actionStories = [
  {
    title: "Simplilearn",
    href: "/stories/simplilearn-job-guarantee-growth",
    description:
      "The framework pushed the decision away from simply buying more traffic and toward the higher-leverage problem: fixing the conversion system before scaling acquisition."
  },
  {
    title: "Logix",
    href: "/stories/platform-modernization-logix",
    description:
      "The framework helped sequence modernization work around customer value, release velocity, and continuity instead of treating infrastructure as a delayed payoff."
  },
  {
    title: "Comviva",
    href: "/stories/payments-reliability-comviva",
    description:
      "The framework made the trade-off explicit: pause major feature work so reliability could protect trust at payment transaction scale."
  }
];

const relatedFrameworks = [
  "Build vs Buy AI",
  "RAG vs Agent",
  "Product Health Scorecard",
  "Experiment Design",
  "Discovery Framework"
];

export default function ProductPrioritizationFrameworkPage() {
  return (
    <>
      <AnalyticsRouteEvent eventName="framework_open" frameworkName="Product Prioritization Framework" />
      <SiteHeader />
      <main>
        <section className="border-b border-line bg-panel" aria-labelledby="framework-title">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Product Framework</p>
              <h1 id="framework-title" className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
                How I Prioritize Product Decisions Under Uncertainty
              </h1>
              <p className="mt-6 max-w-3xl text-xl leading-8 text-ink">
                A practical framework for deciding which product problem deserves attention before every other problem.
              </p>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
                This framework turns prioritization into an evidence-backed operating habit: identify leverage, expose trade-offs, and choose the smallest decision that creates useful learning.
              </p>
            </div>
          </div>
        </section>

        <TextSection
          eyebrow="Why Prioritization Matters"
          icon={<ListChecks className="h-6 w-6 text-accent" aria-hidden="true" />}
          title="Prioritization is the first product decision"
        >
          <p>
            Product teams rarely fail because they have no ideas. They fail because they spend scarce attention on the wrong problem, or because the cost of a decision stays invisible until delivery is already underway.
          </p>
          <p>
            I use prioritization to clarify where the product has the most leverage, what evidence supports the decision, and what the team must deliberately choose not to do.
          </p>
        </TextSection>

        <section className="border-b border-line bg-panel" aria-labelledby="six-step-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Six-Step Framework" id="six-step-title" title="A repeatable decision path" />
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {frameworkSteps.map((item) => (
                <article key={item.step} className="rounded-md border border-line bg-paper p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
                      {item.step.replace("Step ", "")}
                    </div>
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">{item.step}</p>
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-ink">{item.title}</h3>
                  <p className="mt-3 leading-7 text-muted">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line" aria-labelledby="action-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Framework in Action" id="action-title" title="How the framework shows up in flagship stories" />
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {actionStories.map((story) => (
                <article key={story.href} className="rounded-md border border-line bg-panel p-5">
                  <GitBranch className="h-6 w-6 text-accent" aria-hidden="true" />
                  <h3 className="mt-5 text-xl font-semibold text-ink">{story.title}</h3>
                  <p className="mt-3 leading-7 text-muted">{story.description}</p>
                  <ButtonLink href={story.href} variant="inline" className="mt-5">
                    View story
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </ButtonLink>
                </article>
              ))}
            </div>
          </div>
        </section>

        <TextSection
          background="panel"
          eyebrow="Reflection"
          icon={<Layers className="h-6 w-6 text-accent" aria-hidden="true" />}
          title="The point of prioritization"
        >
          <p>
            Prioritization is not deciding what to build next. It is deciding which problem deserves the team&apos;s attention before every other problem.
          </p>
        </TextSection>

        <section className="border-b border-line" aria-labelledby="related-frameworks-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Related Frameworks" id="related-frameworks-title" title="Coming Soon" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedFrameworks.map((framework) => (
                <article key={framework} className="rounded-md border border-line bg-panel p-5">
                  <CheckCircle2 className="h-5 w-5 text-accent" aria-hidden="true" />
                  <h3 className="mt-5 text-xl font-semibold text-ink">{framework}</h3>
                  <p className="mt-3 leading-7 text-muted">Coming soon in the Product Operating System.</p>
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
  background,
  children,
  eyebrow,
  icon,
  title
}: {
  background?: "panel";
  children: ReactNode;
  eyebrow: string;
  icon: ReactNode;
  title: string;
}) {
  const headingId = `${eyebrow.toLowerCase().replaceAll(" ", "-")}-title`;

  return (
    <section className={`border-b border-line ${background === "panel" ? "bg-panel" : ""}`} aria-labelledby={headingId}>
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
