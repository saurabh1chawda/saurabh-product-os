import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ArrowDown, ArrowRight, BookOpen, FileText, GitBranch, MessageSquare, Route } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = {
  title: "Start Here",
  description:
    "A 15-minute onboarding path for hiring teams evaluating Saurabh Chawda's product judgment, flagship stories, frameworks, and representative artifacts."
};

const learningCards = [
  {
    title: "My Product Operating System",
    description: "The principles, mental models, and review habits behind how I make product decisions.",
    icon: <Route className="h-5 w-5 text-accent" aria-hidden="true" />
  },
  {
    title: "Product Decision Frameworks",
    description: "Reusable tools for prioritization, trade-offs, discovery, experimentation, and product health.",
    icon: <GitBranch className="h-5 w-5 text-accent" aria-hidden="true" />
  },
  {
    title: "Three Flagship Stories",
    description: "Evidence-backed product decisions across growth, platform modernization, and payment reliability.",
    icon: <BookOpen className="h-5 w-5 text-accent" aria-hidden="true" />
  },
  {
    title: "Representative Product Artifacts",
    description: "Reconstructed artifacts that show product thinking while respecting confidentiality.",
    icon: <FileText className="h-5 w-5 text-accent" aria-hidden="true" />
  }
];

const journeySteps = [
  {
    step: "Step 1",
    title: "Operating System",
    detail: "5 min",
    href: "/product-operating-system"
  },
  {
    step: "Step 2",
    title: "Growth Story",
    detail: "Simplilearn",
    href: "/stories/simplilearn-job-guarantee-growth"
  },
  {
    step: "Step 2",
    title: "Platform Story",
    detail: "Logix",
    href: "/stories/platform-modernization-logix"
  },
  {
    step: "Step 2",
    title: "Payments Story",
    detail: "Comviva",
    href: "/stories/payments-reliability-comviva"
  },
  {
    step: "Step 3",
    title: "Representative PRD",
    detail: "Evidence artifact",
    href: "/artifacts/simplilearn-growth-prd"
  },
  {
    step: "Step 4",
    title: "Frameworks",
    detail: "Prioritization",
    href: "/frameworks/product-prioritization"
  }
];

const conversationCards = [
  "Product prioritization",
  "Platform modernization",
  "Payment reliability",
  "AI product strategy",
  "Biggest product failure"
];

export default function StartHerePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-line bg-panel" aria-labelledby="start-here-title">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">First-Time Visitor Guide</p>
              <h1 id="start-here-title" className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
                Start Here
              </h1>
              <p className="mt-6 max-w-3xl text-xl leading-8 text-ink">
                If you&apos;re evaluating me for a Product role, this page will help you understand how I think in about 15 minutes.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-line" aria-labelledby="learn-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="What You'll Learn" id="learn-title" title="A fast path through product judgment, evidence, and artifacts" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {learningCards.map((card) => (
                <article key={card.title} className="rounded-md border border-line bg-panel p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-line bg-paper">
                    {card.icon}
                  </div>
                  <h2 className="mt-5 text-xl font-semibold text-ink">{card.title}</h2>
                  <p className="mt-3 leading-7 text-muted">{card.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-panel" aria-labelledby="journey-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Recommended Reading Journey" id="journey-title" title="The 15-minute evaluation path" />
            <div className="mt-8 grid gap-3 lg:grid-cols-6">
              {journeySteps.map((item, index) => (
                <JourneyCard key={`${item.title}-${item.detail}`} item={item} showArrow={index < journeySteps.length - 1} />
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line" aria-labelledby="conversations-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Five Conversations I'd Love To Have" id="conversations-title" title="Where the discussion can go deeper" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {conversationCards.map((conversation) => (
                <article key={conversation} className="rounded-md border border-line bg-panel p-5">
                  <MessageSquare className="h-5 w-5 text-accent" aria-hidden="true" />
                  <h2 className="mt-5 text-xl font-semibold leading-tight text-ink">{conversation}</h2>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-panel" aria-labelledby="start-cta-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Continue</p>
              <h2 id="start-cta-title" className="mt-3 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
                Begin with the system behind the stories.
              </h2>
              <ButtonLink href="/product-operating-system" className="mt-6">
                Continue to Product Operating System
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function JourneyCard({
  item,
  showArrow
}: {
  item: {
    detail: string;
    href: string;
    step: string;
    title: string;
  };
  showArrow: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <article className="h-full rounded-md border border-line bg-paper p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{item.step}</p>
        <h2 className="mt-4 text-xl font-semibold leading-tight text-ink">{item.title}</h2>
        <p className="mt-2 text-sm font-medium text-muted">{item.detail}</p>
        <ButtonLink href={item.href} variant="inline" className="mt-5">
          Open
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </ButtonLink>
      </article>
      {showArrow ? (
        <div className="flex justify-center text-accent lg:hidden" aria-hidden="true">
          <ArrowDown className="h-5 w-5" />
        </div>
      ) : null}
    </div>
  );
}

function SectionHeader({
  eyebrow,
  id,
  title
}: {
  eyebrow: string;
  id: string;
  title: ReactNode;
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
