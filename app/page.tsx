import { ArrowRight, BarChart3, BriefcaseBusiness, FileText, MessageSquare, Sparkles } from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import { SectionHeader } from "@/components/section-header";
import { SiteHeader } from "@/components/site-header";
import { StoryCard } from "@/components/story-card";
import { ButtonLink } from "@/components/ui/button-link";

const metrics = [
  {
    title: "10× Revenue Growth",
    subtitle: "₹1M → ₹10M in 4 months"
  },
  {
    title: "10M+ Monthly Transactions",
    subtitle: "Payments platform scale"
  },
  {
    title: "94% CSAT",
    subtitle: "Wallet/payment user experience"
  },
  {
    title: "25% Profit Growth",
    subtitle: "SaaS product strategy impact"
  },
  {
    title: "40% Query Latency Reduction",
    subtitle: "Platform modernization"
  },
  {
    title: "15+ Enterprise Deployments",
    subtitle: "B2B product delivery"
  }
];

const problems = [
  {
    title: "Build AI and platform products",
    description: "For teams hiring PMs who can connect AI, technical systems, and product strategy."
  },
  {
    title: "Drive growth and monetization",
    description: "For teams looking for product leaders who can move revenue, conversion, retention, and adoption."
  },
  {
    title: "Improve customer and product experience",
    description: "For teams solving customer pain points across complex product journeys."
  }
];

const stories = [
  {
    title: "How I helped grow Job Guarantee revenue 10×",
    tag: "Simplilearn · Growth & monetization",
    summary:
      "Used funnel optimization, referral loops, and product-led growth decisions to grow revenue from ₹1M to ₹10M.",
    href: "/stories/simplilearn-job-guarantee-growth"
  },
  {
    title: "How I supported payments reliability at 10M+ monthly transaction scale",
    tag: "Comviva · Payments platform",
    summary:
      "Worked on wallet and payment platform experiences focused on reliability, customer experience, and enterprise-scale deployments.",
    href: "/stories/comviva-payments-reliability"
  },
  {
    title: "How I scaled SaaS product engagement and biopharma revenue",
    tag: "JoVE · SaaS product strategy",
    summary:
      "Improved engagement, product performance, and biopharma revenue through roadmap strategy, analytics, and product discovery.",
    href: "/stories/jove-biopharma-saas-growth"
  }
];

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <section className="border-b border-line bg-panel">
        <div className="mx-auto flex min-h-[68svh] max-w-6xl flex-col justify-center px-5 py-12 sm:px-8 sm:py-14 lg:min-h-[62svh] lg:px-10 lg:py-12">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1 text-sm font-medium text-muted">
              <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
              Evidence-backed Product Decisions
            </p>
            <h1 className="text-4xl font-semibold leading-tight tracking-normal text-ink sm:text-5xl lg:text-6xl">
              Product judgment you can evaluate before the interview.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
              I&apos;m Saurabh Chawda, a Lead Product Manager with 8+ years across AI, platforms, payments, SaaS, and growth. This product decision library shows the trade-offs, evidence, and outcomes behind my work.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/how-i-think">
                Explore product judgment
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/resume" variant="secondary">
                View Resume
              </ButtonLink>
            </div>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-muted sm:text-base sm:leading-7">
              Built for hiring teams who want to evaluate how I think, not just where I worked.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
          <SectionHeader
            eyebrow="Impact Metrics"
            title="What outcomes can the work point to?"
            description="A quick read on the scale, growth, and customer outcomes behind the product stories."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {metrics.map((metric) => (
              <MetricCard key={metric.title} {...metric} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-panel">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
          <SectionHeader
            eyebrow="Hiring Question"
            title="What problem are you hiring someone to solve?"
            description="Start from the job-to-be-done, then map the evidence to the role."
          />
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {problems.map((problem) => (
              <div key={problem.title} className="flex gap-3 rounded-md border border-line bg-paper p-5">
                <BarChart3 className="mt-1 h-5 w-5 flex-none text-accent" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold leading-7 text-ink">{problem.title}</h3>
                  <p className="mt-2 leading-7 text-muted">{problem.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
          <SectionHeader
            eyebrow="Explore the decisions that shaped my product philosophy."
            title="How does Saurabh make product decisions?"
            description="A structured view into problem framing, customer evidence, prioritization, trade-offs, and launch judgment."
          />
          <div className="rounded-md border border-line bg-panel p-5 shadow-soft">
            <BriefcaseBusiness className="h-6 w-6 text-accent" aria-hidden="true" />
            <h3 className="mt-5 text-xl font-semibold">Product judgment, shown through decisions.</h3>
            <p className="mt-3 leading-7 text-muted">
              A hiring-team view into how I frame ambiguous problems, choose what not to build, and move from evidence to product decisions.
            </p>
            <ButtonLink href="/how-i-think" variant="inline" className="mt-5">
              Explore the decision system
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-panel">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
          <SectionHeader
            eyebrow="Featured Product Stories"
            title="What evidence supports the claims?"
            description="Three stories that connect product context, decisions, trade-offs, and measurable outcomes."
          />
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {stories.map((story) => (
              <StoryCard key={story.title} {...story} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-4 px-5 py-14 sm:px-8 lg:grid-cols-2 lg:px-10">
          <div className="rounded-md border border-line bg-panel p-6">
            <FileText className="h-6 w-6 text-accent" aria-hidden="true" />
            <h2 className="mt-5 text-2xl font-semibold">Resume Center</h2>
            <p className="mt-3 leading-7 text-muted">
              Resume, role context, proof points, and supporting materials in one focused place.
            </p>
            <ButtonLink href="/resume" variant="inline" className="mt-5">
              View Resume
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
          </div>
          <div className="rounded-md border border-line bg-panel p-6">
            <MessageSquare className="h-6 w-6 text-accent" aria-hidden="true" />
            <h2 className="mt-5 text-2xl font-semibold">Contact</h2>
            <p className="mt-3 leading-7 text-muted">
              Clear next steps for recruiters and hiring managers who want to start a conversation.
            </p>
            <ButtonLink href="/contact" variant="inline" className="mt-5">
              Start a conversation
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
          </div>
        </div>
      </section>
    </main>
  );
}
