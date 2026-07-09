import type { Metadata } from "next";
import { ArrowRight, BarChart3, BriefcaseBusiness, FileText, MessageSquare, Sparkles } from "lucide-react";

import { AnalyticsRouteEvent } from "@/components/analytics-route-event";
import { MetricCard } from "@/components/metric-card";
import { SectionHeader } from "@/components/section-header";
import { SiteHeader } from "@/components/site-header";
import { StoryCard } from "@/components/story-card";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = {
  title: "Product OS | Saurabh Chawda",
  description:
    "Product OS is Saurabh Chawda's executive product leadership platform for AI product judgment, Product Leadership Briefs, business outcomes, and reusable decision systems.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Product OS | Saurabh Chawda",
    description:
      "Explore Saurabh Chawda's Product OS: executive brief, professional profile, Product Leadership Briefs, AI Product Playbook, and measurable product outcomes.",
    url: "https://saurabh-product-os.vercel.app",
    type: "website",
    siteName: "Product Operating System",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Saurabh Chawda Product Operating System"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Product OS | Saurabh Chawda",
    description:
      "Executive product leadership evidence, AI product decision systems, Product Leadership Briefs, and reusable frameworks.",
    images: ["/og-image.png"]
  }
};

const metrics = [
  {
    metric: "10×",
    title: "Revenue Growth",
    subtitle: "₹1M → ₹10M in 4 months"
  },
  {
    metric: "10M+",
    title: "Monthly Transactions",
    subtitle: "Payments platform scale"
  },
  {
    metric: "40%",
    title: "Query Latency Reduction",
    subtitle: "Platform modernization"
  },
  {
    metric: "15+",
    title: "Enterprise Deployments",
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
    title: "Scaling Growth Through Product-Led Optimization",
    tag: "Simplilearn · Growth & Product-Led Growth",
    summary:
      "Optimized funnel quality, referrals, and product-led growth before scaling acquisition.",
    href: "/case-studies/simplilearn",
    outcome: "10× Revenue",
    readingTime: "12 min read"
  },
  {
    title: "Improving Reliability at Transaction Scale",
    tag: "Mahindra Comviva · Payments & Reliability",
    summary:
      "Prioritized reliability, recovery paths, and customer trust across payments-scale systems.",
    href: "/case-studies",
    outcome: "10M+ Transactions",
    readingTime: "Planned"
  },
  {
    title: "Workflow Adoption Before Content Expansion",
    tag: "JoVE · Discovery & Enterprise SaaS",
    summary:
      "Used discovery to reframe adoption from content volume to workflow execution.",
    href: "/case-studies/jove",
    outcome: "+30% Portfolio Revenue",
    readingTime: "12 min read"
  },
  {
    title: "Building an AI-Ready Platform",
    tag: "Logix · AI Platforms & Modernization",
    summary:
      "Modernized the platform before scaling AI capability, release velocity, and product-led growth.",
    href: "/case-studies/logix",
    outcome: "₹1M+ ARR",
    readingTime: "12 min read"
  }
];

const capabilities = [
  {
    name: "Growth & Monetization",
    description: "Revenue, conversion, and product-led growth decisions.",
    storyCount: "2 stories"
  },
  {
    name: "Platform Strategy",
    description: "Scale, latency, and architecture trade-offs.",
    storyCount: "1 story"
  },
  {
    name: "Payments & Reliability",
    description: "Trust-critical journeys at transaction scale.",
    storyCount: "1 story"
  },
  {
    name: "SaaS Product Strategy",
    description: "Engagement, roadmap, and enterprise value creation.",
    storyCount: "1 story"
  },
  {
    name: "AI Product Strategy",
    description: "AI judgment, workflow design, and adoption.",
    storyCount: "Coming soon"
  },
  {
    name: "Leadership & Execution",
    description: "Prioritization, delivery rhythm, and ownership.",
    storyCount: "2 stories"
  }
];

export default function Home() {
  return (
    <main>
      <AnalyticsRouteEvent eventName="homepage_viewed" />
      <SiteHeader />

      <section className="border-b border-line bg-panel">
        <div className="mx-auto flex min-h-[62svh] max-w-6xl flex-col justify-center px-5 py-10 sm:px-8 sm:py-12 lg:min-h-[58svh] lg:px-10 lg:py-10">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1 text-sm font-medium text-muted">
              <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
              Evidence-backed Product Decisions
            </p>
            <h1 className="text-4xl font-semibold leading-tight tracking-normal text-ink sm:text-5xl lg:text-6xl">
              Product judgment you can evaluate before the interview.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
              I&apos;m Saurabh Chawda, a Lead PM across AI, platforms, payments, SaaS, and growth. See the trade-offs, evidence, and outcomes behind my work.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/executive">
                Read the Executive Brief
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/profile" variant="secondary">
                Professional Profile
              </ButtonLink>
            </div>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-muted sm:text-base sm:leading-7">
              Built for hiring teams who want to evaluate how I think, not just where I worked.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-14 lg:px-10">
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
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-14 lg:px-10">
          <SectionHeader
            eyebrow="Hiring Question"
            title="What problem are you hiring someone to solve?"
            description="Start from the job-to-be-done, then map the evidence to the role."
          />
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {problems.map((problem) => (
              <div key={problem.title} className="flex min-h-11 gap-3 rounded-md border border-line bg-paper p-5">
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
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-12 sm:px-8 sm:py-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 lg:px-10">
          <SectionHeader
            eyebrow="Explore the decisions that shaped my product philosophy."
            title="Need the fastest overview first?"
            description="Start with the Executive Brief, then use the deeper decision systems when you want to inspect how the work was done."
          />
          <div className="rounded-md border border-line bg-panel p-5 shadow-soft">
            <BriefcaseBusiness className="h-6 w-6 text-accent" aria-hidden="true" />
            <h3 className="mt-5 text-xl font-semibold">Five-minute recruiter briefing.</h3>
            <p className="mt-3 leading-7 text-muted">
              A hiring-team view of who I am, what I have delivered, how I think, and which evidence is worth reviewing next.
            </p>
            <ButtonLink href="/executive" variant="inline" className="mt-5">
              Read the Executive Brief
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-panel">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-14 lg:px-10">
          <SectionHeader
            eyebrow="Capability Overview"
            title="Capabilities Demonstrated"
            description="A concise map of the product judgment areas supported by the story library."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((capability) => (
              <a
                key={capability.name}
                href="#featured-product-stories"
                className="min-h-11 rounded-md border border-line bg-paper p-5 shadow-soft"
                aria-label={`View product stories related to ${capability.name}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-semibold leading-7 text-ink">{capability.name}</h3>
                  <span className="rounded-full border border-line bg-panel px-2.5 py-1 text-xs font-semibold text-muted">
                    {capability.storyCount}
                  </span>
                </div>
                <p className="mt-3 leading-7 text-muted">{capability.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="featured-product-stories" className="scroll-mt-20 border-b border-line bg-panel">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-14 lg:px-10">
          <SectionHeader
            eyebrow="Featured Product Leadership Briefs"
            title="What evidence supports the claims?"
            description="Decision-first evidence that connects product context, trade-offs, execution, and measurable outcomes."
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
            <h2 className="mt-5 text-2xl font-semibold">Professional Profile</h2>
            <p className="mt-3 leading-7 text-muted">
              Career context, product capabilities, proof points, and supporting materials in one focused place.
            </p>
            <ButtonLink href="/profile" variant="inline" className="mt-5">
              View Professional Profile
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
              Start an interview conversation
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
          </div>
        </div>
      </section>
    </main>
  );
}
