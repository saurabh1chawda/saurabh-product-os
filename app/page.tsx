import { ArrowRight, BarChart3, BriefcaseBusiness, FileText, MessageSquare, Sparkles } from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import { SectionHeader } from "@/components/section-header";
import { SiteHeader } from "@/components/site-header";
import { StoryCard } from "@/components/story-card";
import { ButtonLink } from "@/components/ui/button-link";

const metrics = [
  {
    value: "Metric 01",
    label: "Business outcome",
    evidence: "Evidence link placeholder"
  },
  {
    value: "Metric 02",
    label: "Customer or user outcome",
    evidence: "Evidence link placeholder"
  },
  {
    value: "Metric 03",
    label: "Execution or operating outcome",
    evidence: "Evidence link placeholder"
  }
];

const problems = [
  "Turn ambiguous customer pain into a prioritized product bet.",
  "Align teams around evidence, tradeoffs, and a clear launch path.",
  "Improve an existing product motion without adding avoidable complexity."
];

const stories = [
  {
    title: "Product Story 01",
    question: "How did Saurabh define the right problem?",
    summary: "Placeholder for a story with context, decision, evidence, and measurable outcome."
  },
  {
    title: "Product Story 02",
    question: "How did Saurabh make tradeoffs under constraints?",
    summary: "Placeholder for a story that shows judgment, sequencing, and stakeholder alignment."
  },
  {
    title: "Product Story 03",
    question: "How did Saurabh learn from the market?",
    summary: "Placeholder for a story grounded in customer signals and shipped product impact."
  }
];

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <section className="border-b border-line bg-panel">
        <div className="mx-auto flex min-h-[78svh] max-w-6xl flex-col justify-center px-5 py-16 sm:px-8 lg:px-10">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1 text-sm font-medium text-muted">
              <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
              Evidence-backed Product Manager portfolio
            </p>
            <h1 className="text-4xl font-semibold leading-tight tracking-normal text-ink sm:text-5xl lg:text-6xl">
              Decide whether Saurabh is the Product Manager your team should interview.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
              A portfolio designed around hiring decisions: product judgment, measurable impact, and the operating habits behind the work.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/stories">
                View product stories
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/resume" variant="secondary">
                Open resume center
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
          <SectionHeader
            eyebrow="Impact Metrics"
            title="What outcomes can the work point to?"
            description="Metrics will connect to supporting evidence as stories are added."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
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
          <div className="mt-8 grid gap-3">
            {problems.map((problem) => (
              <div key={problem} className="flex gap-3 rounded-md border border-line bg-paper p-4">
                <BarChart3 className="mt-1 h-5 w-5 flex-none text-accent" aria-hidden="true" />
                <p className="text-base leading-7 text-ink">{problem}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
          <SectionHeader
            eyebrow="Explore How I Think"
            title="How does Saurabh make product decisions?"
            description="A structured view into problem framing, customer evidence, prioritization, and launch judgment."
          />
          <div className="rounded-md border border-line bg-panel p-5 shadow-soft">
            <BriefcaseBusiness className="h-6 w-6 text-accent" aria-hidden="true" />
            <h3 className="mt-5 text-xl font-semibold">Product judgment, shown through decisions.</h3>
            <p className="mt-3 leading-7 text-muted">
              Placeholder for principles, operating rituals, and examples that help a hiring team understand how Saurabh thinks before the first conversation.
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
            description="Each story will connect context, decisions, artifacts, and outcomes."
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
              Role-specific resume, proof points, and supporting materials in one focused place.
            </p>
            <ButtonLink href="/resume" variant="inline" className="mt-5">
              View resume center
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
