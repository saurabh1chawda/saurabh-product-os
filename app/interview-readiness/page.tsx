import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, FileText, GitBranch, MessageSquare, Route, Sparkles, UserRound } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = {
  title: "Interview Readiness Kit",
  description:
    "A recruiter and hiring manager resource summarizing how Saurabh Chawda works, what he brings to a team, and why he is ready for Senior and Lead Product Manager roles."
};

const hiringStatements = [
  "I turn ambiguous product problems into structured, evidence-backed decisions.",
  "I connect customer behavior, business goals, and technical constraints before recommending a roadmap path.",
  "I bring breadth across AI, platforms, payments, SaaS, enterprise products, and growth.",
  "I can work with engineering on technical trade-offs without losing sight of customer and commercial outcomes.",
  "I help teams move from feature output toward measurable product behavior and operating confidence.",
  "I make product judgment visible through stories, artifacts, principles, and decision frameworks."
];

const timeline = [
  {
    period: "First 30 Days",
    title: "Understand the system",
    items: [
      "Map the product, customer, business, and technical context.",
      "Review roadmap decisions, product metrics, customer signals, and operating rituals.",
      "Identify where the team needs more evidence before committing product capacity."
    ]
  },
  {
    period: "Days 30-60",
    title: "Clarify priorities",
    items: [
      "Separate urgent requests from high-leverage product problems.",
      "Align stakeholders around trade-offs, sequencing, and decision criteria.",
      "Ship or shape a focused discovery, experiment, or roadmap decision."
    ]
  },
  {
    period: "Days 60-90",
    title: "Build momentum",
    items: [
      "Turn early learning into a clear product direction and execution rhythm.",
      "Strengthen product health metrics, review habits, and cross-functional alignment.",
      "Create a repeatable decision system the team can keep using."
    ]
  }
];

const leadershipPrinciples = [
  "Evidence before opinion",
  "Customer behavior over feature output",
  "Prototype before scale",
  "Structured decision making",
  "Cross-functional alignment"
];

const topics = [
  {
    title: "Product Discovery",
    description: "How I validate the right problem before committing build capacity.",
    href: "/stories/product-discovery-jove"
  },
  {
    title: "Growth",
    description: "How I connect funnel quality, customer trust, and monetization.",
    href: "/stories/simplilearn-job-guarantee-growth"
  },
  {
    title: "Platform Modernization",
    description: "How I sequence technical change around customer value and business continuity.",
    href: "/stories/platform-modernization-logix"
  },
  {
    title: "Payments",
    description: "How I treat payment reliability as a customer experience.",
    href: "/stories/payments-reliability-comviva"
  },
  {
    title: "AI Strategy",
    description: "How I evaluate AI product opportunities through workflow fit, trust, and operating leverage.",
    href: "/product-operating-system"
  },
  {
    title: "Product Prioritization",
    description: "How I make trade-offs visible under uncertainty.",
    href: "/frameworks/product-prioritization"
  }
];

const downloads = [
  {
    title: "Resume",
    description: "Open the resume center for role context and recruiter-ready materials.",
    href: "/resume",
    icon: <FileText className="h-5 w-5 text-accent" aria-hidden="true" />
  },
  {
    title: "Product OS",
    description: "Review the operating principles, frameworks, and mental models behind the stories.",
    href: "/product-operating-system",
    icon: <Route className="h-5 w-5 text-accent" aria-hidden="true" />
  },
  {
    title: "LinkedIn",
    description: "Use the contact center for current profile details.",
    href: "/contact",
    icon: <UserRound className="h-5 w-5 text-accent" aria-hidden="true" />
  },
  {
    title: "Contact",
    description: "Find the next step for recruiter or hiring-manager conversations.",
    href: "/contact",
    icon: <MessageSquare className="h-5 w-5 text-accent" aria-hidden="true" />
  }
];

export default function InterviewReadinessPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-line bg-panel" aria-labelledby="interview-readiness-title">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Interview Readiness Kit</p>
              <h1 id="interview-readiness-title" className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
                A concise guide to how I work and where I create product leverage.
              </h1>
              <p className="mt-6 max-w-3xl text-xl leading-8 text-ink">
                Built for recruiters and hiring managers evaluating Senior or Lead Product Manager fit across AI, platforms, enterprise SaaS, fintech, and growth.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-line" aria-labelledby="why-hire-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Why Companies Hire Me" id="why-hire-title" title="Six signals of product fit" />
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {hiringStatements.map((statement) => (
                <article key={statement} className="flex gap-3 rounded-md border border-line bg-panel p-5">
                  <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-accent" aria-hidden="true" />
                  <p className="leading-7 text-muted">{statement}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-panel" aria-labelledby="first-90-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="What I Bring in the First 90 Days" id="first-90-title" title="A practical ramp plan" />
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {timeline.map((phase) => (
                <article key={phase.period} className="rounded-md border border-line bg-paper p-5">
                  <CalendarDays className="h-5 w-5 text-accent" aria-hidden="true" />
                  <p className="mt-5 text-sm font-semibold uppercase tracking-[0.14em] text-accent">{phase.period}</p>
                  <h2 className="mt-3 text-xl font-semibold leading-tight text-ink">{phase.title}</h2>
                  <ul className="mt-4 space-y-3">
                    {phase.items.map((item) => (
                      <li key={item} className="flex gap-3 leading-7 text-muted">
                        <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-accent" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line" aria-labelledby="leadership-style-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="My Product Leadership Style" id="leadership-style-title" title="Principles I use in product work" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {leadershipPrinciples.map((principle) => (
                <article key={principle} className="rounded-md border border-line bg-panel p-5">
                  <Sparkles className="h-5 w-5 text-accent" aria-hidden="true" />
                  <h2 className="mt-5 text-xl font-semibold leading-tight text-ink">{principle}</h2>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-panel" aria-labelledby="topics-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Frequently Discussed Topics" id="topics-title" title="Good interview entry points" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topics.map((topic) => (
                <article key={topic.title} className="rounded-md border border-line bg-paper p-5">
                  <GitBranch className="h-5 w-5 text-accent" aria-hidden="true" />
                  <h2 className="mt-5 text-xl font-semibold leading-tight text-ink">{topic.title}</h2>
                  <p className="mt-3 leading-7 text-muted">{topic.description}</p>
                  <ButtonLink href={topic.href} variant="inline" className="mt-5">
                    Open
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </ButtonLink>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line" aria-labelledby="download-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Download Center" id="download-title" title="Fast links for evaluation" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {downloads.map((item) => (
                <article key={item.title} className="rounded-md border border-line bg-panel p-5">
                  {item.icon}
                  <h2 className="mt-5 text-xl font-semibold leading-tight text-ink">{item.title}</h2>
                  <p className="mt-3 leading-7 text-muted">{item.description}</p>
                  <ButtonLink href={item.href} variant="inline" className="mt-5">
                    Open
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
