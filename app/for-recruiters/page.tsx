import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ArrowRight, BriefcaseBusiness, Clock3, FileText, Mail, Sparkles, UserRound } from "lucide-react";

import { AnalyticsRouteEvent } from "@/components/analytics-route-event";
import { SiteHeader } from "@/components/site-header";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = {
  title: "For Recruiters",
  description:
    "A recruiter-first landing page for quickly evaluating Saurabh Chawda as a Senior or Lead Product Manager."
};

const snapshotItems = [
  {
    title: "8+ years",
    description: "Product leadership across complex customer, platform, and commercial problems."
  },
  {
    title: "AI, Platforms, Payments, SaaS",
    description: "Experience across technical systems, growth, enterprise products, and reliability."
  },
  {
    title: "Senior/Lead PM focus",
    description: "Best fit for roles that need product judgment, ambiguity handling, and execution."
  },
  {
    title: "Key impact metrics",
    description: "10x revenue growth, 10M+ monthly transactions, 94% CSAT, and 40% lower query latency."
  }
];

const evaluationPath = [
  {
    step: "1",
    title: "Resume",
    time: "2 min",
    href: "/resume"
  },
  {
    step: "2",
    title: "Product Operating System",
    time: "5 min",
    href: "/product-operating-system"
  },
  {
    step: "3",
    title: "Three Flagship Stories",
    time: "12 min",
    href: "/stories/simplilearn-job-guarantee-growth"
  },
  {
    step: "4",
    title: "Representative PRD",
    time: "5 min",
    href: "/artifacts/simplilearn-growth-prd"
  }
];

const differentiators = [
  {
    title: "I make product judgment visible.",
    description: "The Product Operating System makes my principles, trade-offs, and decision habits easy to evaluate.",
    href: "/product-operating-system"
  },
  {
    title: "I connect growth to product systems.",
    description: "The Simplilearn story shows how I approached revenue growth through funnel quality, referrals, and product-led decisions.",
    href: "/stories/simplilearn-job-guarantee-growth"
  },
  {
    title: "I can lead platform work without losing customer value.",
    description: "The platform modernization story shows how I sequenced technical change around business continuity and release velocity.",
    href: "/stories/platform-modernization-logix"
  },
  {
    title: "I understand trust-critical product journeys.",
    description: "The payments story shows how reliability, recovery paths, and customer confidence shaped product priorities.",
    href: "/stories/payments-reliability-comviva"
  },
  {
    title: "I use evidence to align teams under uncertainty.",
    description: "The prioritization framework shows how I clarify leverage, trade-offs, and learning before committing teams.",
    href: "/frameworks/product-prioritization"
  }
];

const faqs = [
  {
    question: "Why AI Product Management?",
    answer:
      "AI Product Management is the natural next step in my product career because my work has consistently sat at the intersection of customer problems, technical systems, data, and business outcomes. I am especially interested in building AI products where the value is not the model itself, but how intelligently it improves user workflows, decision-making, automation, and measurable business impact."
  },
  {
    question: "Why now?",
    answer:
      "Over the last eight years, I have built products across growth, platforms, payments, enterprise SaaS, and technical modernization. The common thread has been identifying high-leverage product decisions under uncertainty. AI now amplifies that kind of product judgment, and I want to apply my experience to products where AI meaningfully changes how users work, decide, and create value."
  },
  {
    question: "IC vs Leadership",
    answer:
      "I am targeting Senior or Lead Product Manager roles where I can operate as a strong individual contributor while also bringing leadership through influence, mentoring, roadmap clarity, and cross-functional alignment. I am comfortable leading teams and mentoring PMs, but my current focus is on high-impact product ownership close to strategy, customers, data, and execution."
  },
  {
    question: "Relocation",
    answer:
      "I am open to relocation for the right Senior or Lead Product Manager opportunity, especially where the role offers strong product scope, technical depth, and long-term growth potential. I am also comfortable working with distributed teams across geographies and time zones."
  },
  {
    question: "Working style",
    answer:
      "My working style is structured, evidence-driven, and collaborative. I prefer writing before debating, making trade-offs explicit, aligning stakeholders around clear product decisions, and translating ambiguity into execution. I work closely with engineering, design, data, sales, customer success, and leadership to keep product decisions grounded in customer value and business outcomes."
  }
];

const contactActions = [
  {
    title: "LinkedIn",
    description: "Open the contact center for current profile details.",
    href: "/contact",
    icon: <UserRound className="h-5 w-5 text-accent" aria-hidden="true" />
  },
  {
    title: "Email",
    description: "Use the contact center for the latest email and availability.",
    href: "/contact",
    icon: <Mail className="h-5 w-5 text-accent" aria-hidden="true" />
  },
  {
    title: "Resume download",
    description: "Open the resume center for the recruiter-ready resume.",
    href: "/resume",
    icon: <FileText className="h-5 w-5 text-accent" aria-hidden="true" />
  }
];

export default function ForRecruitersPage() {
  return (
    <>
      <AnalyticsRouteEvent eventName="for_recruiters_view" />
      <SiteHeader />
      <main>
        <section className="border-b border-line bg-panel" aria-labelledby="recruiters-title">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Recruiter Evaluation Path</p>
              <h1 id="recruiters-title" className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
                Welcome, Recruiters & Hiring Managers
              </h1>
              <p className="mt-6 max-w-3xl text-xl leading-8 text-ink">
                If you have five minutes, this page will help you understand how I think, what I&apos;ve built, and where to explore next.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-line" aria-labelledby="snapshot-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Quick Snapshot" id="snapshot-title" title="The fastest read on fit" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {snapshotItems.map((item) => (
                <article key={item.title} className="rounded-md border border-line bg-panel p-5">
                  <Sparkles className="h-5 w-5 text-accent" aria-hidden="true" />
                  <h2 className="mt-5 text-xl font-semibold leading-tight text-ink">{item.title}</h2>
                  <p className="mt-3 leading-7 text-muted">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-panel" aria-labelledby="why-interview-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Why Interview Me?" id="why-interview-title" title="A strong fit for Senior and Lead Product roles" />
            <div className="mt-8 rounded-md border border-line bg-paper p-5">
              <BriefcaseBusiness className="h-6 w-6 text-accent" aria-hidden="true" />
              <p className="mt-5 max-w-4xl text-lg leading-8 text-muted">
                I bring senior product judgment across AI, platforms, enterprise SaaS, payments, and growth: the ability to clarify ambiguous problems, make trade-offs visible, align technical and business stakeholders, and connect product decisions to measurable customer and commercial outcomes.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/product-operating-system" variant="inline">
                  View Product Operating System
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </ButtonLink>
                <ButtonLink href="/stories/simplilearn-job-guarantee-growth" variant="inline">
                  Explore flagship stories
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </ButtonLink>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-panel" aria-labelledby="path-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Recommended Evaluation Path" id="path-title" title="A practical review sequence" />
            <div className="mt-8 grid gap-4 lg:grid-cols-4">
              {evaluationPath.map((item) => (
                <article key={item.title} className="rounded-md border border-line bg-paper p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
                      {item.step}
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-muted">
                      <Clock3 className="h-4 w-4" aria-hidden="true" />
                      {item.time}
                    </span>
                  </div>
                  <h2 className="mt-5 text-xl font-semibold leading-tight text-ink">{item.title}</h2>
                  <ButtonLink href={item.href} variant="inline" className="mt-5">
                    Open
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </ButtonLink>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line" aria-labelledby="hire-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Why Teams Hire Me" id="hire-title" title="Concise signals with supporting evidence" />
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {differentiators.map((item) => (
                <article key={item.title} className="rounded-md border border-line bg-panel p-5">
                  <BriefcaseBusiness className="h-5 w-5 text-accent" aria-hidden="true" />
                  <h2 className="mt-5 text-xl font-semibold leading-tight text-ink">{item.title}</h2>
                  <p className="mt-3 leading-7 text-muted">{item.description}</p>
                  <ButtonLink href={item.href} variant="inline" className="mt-5">
                    View support
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </ButtonLink>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-panel" aria-labelledby="faq-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Frequently Asked Questions" id="faq-title" title="Conversation prompts for screening calls" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {faqs.map((item) => (
                <article key={item.question} className="rounded-md border border-line bg-paper p-5">
                  <h2 className="text-xl font-semibold leading-tight text-ink">{item.question}</h2>
                  <p className="mt-3 leading-7 text-muted">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line" aria-labelledby="contact-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Contact" id="contact-title" title="Ready to continue the conversation?" />
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {contactActions.map((action) => (
                <article key={action.title} className="rounded-md border border-line bg-panel p-5">
                  {action.icon}
                  <h2 className="mt-5 text-xl font-semibold leading-tight text-ink">{action.title}</h2>
                  <p className="mt-3 leading-7 text-muted">{action.description}</p>
                  <ButtonLink href={action.href} variant="inline" className="mt-5">
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
