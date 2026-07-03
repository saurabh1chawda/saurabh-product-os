import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  ArrowDown,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Compass,
  FileText,
  GitBranch,
  Layers3,
  Route
} from "lucide-react";

import { AnalyticsViewed, TrackedDecisionLink } from "@/components/decision-system-interactions";
import { SiteHeader } from "@/components/site-header";
import { ButtonLink } from "@/components/ui/button-link";

const pageDescription =
  "AI Product Operating System v1 is complete: an end-to-end decision system for evaluating, validating, prioritizing, architecting, and measuring AI products.";
const pageUrl = "https://saurabh-product-os.vercel.app/decision-operating-system";

export const metadata: Metadata = {
  title: "AI Product Operating System v1 | Product Decision Systems by Saurabh Chawda",
  description: pageDescription,
  alternates: {
    canonical: "/decision-operating-system"
  },
  openGraph: {
    title: "AI Product Operating System v1 | Product Decision Systems by Saurabh Chawda",
    description: pageDescription,
    url: pageUrl,
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
    title: "AI Product Operating System v1 | Product Decision Systems by Saurabh Chawda",
    description: pageDescription,
    images: ["/og-image.png"]
  }
};

const whyStages = [
  "Technology evolves",
  "Customer problems persist",
  "Decision quality compounds",
  "Great products follow"
];

const pillars = [
  {
    title: "Decision Systems",
    description: "Reusable product decision frameworks.",
    icon: <GitBranch className="h-5 w-5 text-accent" aria-hidden="true" />
  },
  {
    title: "Decision Journals",
    description: "Real product decisions with context, trade-offs and outcomes.",
    icon: <FileText className="h-5 w-5 text-accent" aria-hidden="true" />
  },
  {
    title: "Operating Principles",
    description: "The beliefs that guide every product decision.",
    icon: <Compass className="h-5 w-5 text-accent" aria-hidden="true" />
  },
  {
    title: "Decision Toolkit",
    description: "Practical canvases, scorecards and templates that support the operating system.",
    icon: <CheckCircle2 className="h-5 w-5 text-accent" aria-hidden="true" />
  }
];

const completedModules = [
  {
    title: "AI Product Principles",
    href: "/ai-product-principles",
    description: "The executive philosophy behind the AI Product Operating System."
  },
  {
    title: "Customer Discovery",
    href: "/decision-systems/customer-discovery",
    description: "Start with the customer and let evidence determine whether AI belongs in the solution."
  },
  {
    title: "Validation & Experimentation",
    href: "/decision-systems/validation-experimentation",
    description: "Build evidence before confidence and reduce the most expensive uncertainty."
  },
  {
    title: "AI Prioritization",
    href: "/decision-systems/ai-prioritization",
    description: "Prioritize AI where customer value, business value and execution readiness intersect."
  },
  {
    title: "Build vs Buy AI",
    href: "/decision-systems/build-vs-buy-ai",
    description: "Own what differentiates you and buy what does not."
  },
  {
    title: "RAG vs Agent",
    href: "/decision-systems/rag-vs-agent",
    description: "Choose the simplest architecture that reliably solves the customer problem."
  },
  {
    title: "AI Success Metrics",
    href: "/decision-systems/ai-success-metrics",
    description: "Measure customer outcomes first and AI performance second."
  }
];

const journey = [
  { title: "Discover", href: "/decision-systems/customer-discovery" },
  { title: "Validate", href: "/decision-systems/validation-experimentation" },
  { title: "Prioritize", href: "/decision-systems/ai-prioritization" },
  { title: "Own", href: "/decision-systems/build-vs-buy-ai" },
  { title: "Architect", href: "/decision-systems/rag-vs-agent" },
  { title: "Measure", href: "/decision-systems/ai-success-metrics" }
];

const releaseStats = [
  { label: "Version", value: "v1.0" },
  { label: "Release Status", value: "v1 complete" },
  { label: "Completed Modules", value: "7 / 7" },
  { label: "Decision Systems", value: "6 complete" },
  { label: "Core Philosophy", value: "Customer value before AI novelty" },
  { label: "Audience", value: "Recruiters, hiring managers and product leaders" }
];

const releaseNotes = [
  {
    area: "Philosophy",
    modules: [{ title: "AI Product Principles", href: "/ai-product-principles" }]
  },
  {
    area: "Discovery",
    modules: [{ title: "Customer Discovery", href: "/decision-systems/customer-discovery" }]
  },
  {
    area: "Validation",
    modules: [{ title: "Validation & Experimentation", href: "/decision-systems/validation-experimentation" }]
  },
  {
    area: "Strategy",
    modules: [
      { title: "AI Prioritization", href: "/decision-systems/ai-prioritization" },
      { title: "Build vs Buy AI", href: "/decision-systems/build-vs-buy-ai" }
    ]
  },
  {
    area: "Architecture",
    modules: [{ title: "RAG vs Agent", href: "/decision-systems/rag-vs-agent" }]
  },
  {
    area: "Measurement",
    modules: [{ title: "AI Success Metrics", href: "/decision-systems/ai-success-metrics" }]
  }
];

const learningPaths = [
  {
    title: "AI PM in 15 minutes",
    description: "A fast review of the AI product judgment behind the operating system.",
    eventName: "learning_path_clicked" as const,
    links: [
      { title: "AI Product Principles", href: "/ai-product-principles" },
      { title: "AI Prioritization", href: "/decision-systems/ai-prioritization" },
      { title: "RAG vs Agent", href: "/decision-systems/rag-vs-agent" },
      { title: "AI Success Metrics", href: "/decision-systems/ai-success-metrics" }
    ]
  },
  {
    title: "Lead PM / Senior PM Review",
    description: "A deeper path through discovery, validation, ownership and measurement.",
    eventName: "learning_path_clicked" as const,
    links: [
      { title: "Customer Discovery", href: "/decision-systems/customer-discovery" },
      { title: "Validation & Experimentation", href: "/decision-systems/validation-experimentation" },
      { title: "Build vs Buy AI", href: "/decision-systems/build-vs-buy-ai" },
      { title: "AI Success Metrics", href: "/decision-systems/ai-success-metrics" }
    ]
  },
  {
    title: "Recruiter Quick Review",
    description: "The shortest path to evaluate scope, fit, profile and contact readiness.",
    eventName: "recruiter_path_clicked" as const,
    links: [
      { title: "Recruiter Tour", href: "/recruiter-tour" },
      { title: "AI Product Principles", href: "/ai-product-principles" },
      { title: "For Recruiters", href: "/for-recruiters" },
      { title: "Professional Profile", href: "/profile" }
    ]
  }
];

const breadcrumbs = [
  { name: "Product Operating System", item: "https://saurabh-product-os.vercel.app/product-operating-system" },
  { name: "Decision Operating System", item: pageUrl }
];

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: breadcrumbs.map((breadcrumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: breadcrumb.name,
    item: breadcrumb.item
  }))
};

export default function DecisionOperatingSystemPage() {
  return (
    <>
      <AnalyticsViewed eventName="dos_home_viewed" name="Decision Operating System" />
      <AnalyticsViewed eventName="v1_release_viewed" name="AI Product Operating System v1" />
      <SiteHeader />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbJsonLd)
          }}
        />

        <section className="border-b border-line bg-panel" aria-labelledby="dos-title">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
            <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm font-medium text-muted">
              {breadcrumbs.map((breadcrumb, index) => (
                <span key={breadcrumb.name} className="flex items-center gap-2">
                  {index > 0 ? <span aria-hidden="true">/</span> : null}
                  <span className={index === breadcrumbs.length - 1 ? "text-ink" : ""}>{breadcrumb.name}</span>
                </span>
              ))}
            </nav>
            <div className="mt-8 max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">AI Product Operating System v1</p>
              <h1 id="dos-title" className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
                Decision quality for AI products, made explicit.
              </h1>
              <p className="mt-6 max-w-3xl text-xl leading-8 text-ink">
                A completed v1 decision system for evaluating, validating, prioritizing, architecting and measuring AI products without chasing novelty.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <TrackedDecisionLink href="/recruiter-tour" eventName="recruiter_path_clicked" label="Recruiter Guided Tour" pathName="Recruiter Quick Review" variant="primary">
                  Start the 5-Minute Tour
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </TrackedDecisionLink>
                <ButtonLink href="#start-here-paths" variant="secondary">
                  Choose a Learning Path
                </ButtonLink>
              </div>
              <dl className="mt-8 grid gap-3 sm:grid-cols-3">
                <MetaItem label="Reading Time" value="5 minutes" />
                <MetaItem label="Version" value="v1 complete" />
                <MetaItem label="Modules" value="7 complete" />
              </dl>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[240px_1fr] lg:px-10">
          <aside className="hidden lg:block">
            <div className="sticky top-24 py-10">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Decision OS</p>
              <nav aria-label="Decision Operating System sections" className="mt-4 grid gap-2 text-sm text-muted">
                <a href="#v1-complete" className="rounded-md px-3 py-2 transition hover:bg-panel hover:text-ink">v1 Complete</a>
                <a href="#release-notes" className="rounded-md px-3 py-2 transition hover:bg-panel hover:text-ink">Release Notes</a>
                <a href="#start-here-paths" className="rounded-md px-3 py-2 transition hover:bg-panel hover:text-ink">Start Here</a>
                <a href="#why-this-exists" className="rounded-md px-3 py-2 transition hover:bg-panel hover:text-ink">Why This Exists</a>
                <a href="#four-pillars" className="rounded-md px-3 py-2 transition hover:bg-panel hover:text-ink">The Four Pillars</a>
                <a href="#learning-journey" className="rounded-md px-3 py-2 transition hover:bg-panel hover:text-ink">Decision Flow</a>
                <a href="#current-release" className="rounded-md px-3 py-2 transition hover:bg-panel hover:text-ink">Release Status</a>
                <a href="#recruiter-tour" className="rounded-md px-3 py-2 transition hover:bg-panel hover:text-ink">Recruiter Tour</a>
              </nav>
            </div>
          </aside>

          <article className="min-w-0">
            <DocSection id="v1-complete" eyebrow="Release Complete" title="AI Product Operating System v1 is complete" background="panel">
              <div className="rounded-md border border-line bg-paper p-6">
                <Layers3 className="h-6 w-6 text-accent" aria-hidden="true" />
                <p className="mt-5 text-lg leading-8 text-ink">
                  This version documents the end-to-end decision system I use to evaluate, validate, prioritize, architect, and measure AI products.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {completedModules.map((module) => (
                    <article key={module.title} className="rounded-md border border-line bg-panel p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-accent" aria-hidden="true" />
                        <div>
                          <h3 className="font-semibold leading-6 text-ink">{module.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-muted">{module.description}</p>
                          <TrackedDecisionLink
                            href={module.href}
                            eventName="module_clicked_from_release"
                            label={module.title}
                            className="mt-3 text-sm"
                          >
                            Open module
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                          </TrackedDecisionLink>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </DocSection>

            <DocSection id="release-notes" eyebrow="Release Notes" title="AI Product Operating System v1">
              <div className="grid gap-4">
                {releaseNotes.map((note) => (
                  <article key={note.area} className="rounded-md border border-line bg-panel p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">{note.area}</p>
                    <div className="mt-4 grid gap-3">
                      {note.modules.map((module) => (
                        <TrackedDecisionLink
                          key={module.title}
                          href={module.href}
                          eventName="module_clicked_from_release"
                          label={module.title}
                          className="w-full rounded-md border border-line bg-paper p-4 text-left font-semibold text-ink hover:bg-panel"
                        >
                          {module.title}
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </TrackedDecisionLink>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </DocSection>

            <DocSection id="start-here-paths" eyebrow="Start Here" title="Recruiter-friendly learning paths" background="panel">
              <div className="grid gap-4">
                {learningPaths.map((path) => (
                  <article key={path.title} className="rounded-md border border-line bg-paper p-5">
                    <h3 className="text-xl font-semibold leading-tight text-ink">{path.title}</h3>
                    <p className="mt-3 leading-7 text-muted">{path.description}</p>
                    <div className="mt-5 grid gap-3">
                      {path.links.map((link, index) => (
                        <TrackedDecisionLink
                          key={link.title}
                          href={link.href}
                          eventName={path.eventName}
                          label={link.title}
                          pathName={path.title}
                          className="w-full rounded-md border border-line bg-panel p-4 text-left font-semibold text-ink hover:bg-paper"
                        >
                          <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full border border-line bg-paper text-sm text-accent">
                            {index + 1}
                          </span>
                          {link.title}
                          <ArrowRight className="ml-auto h-4 w-4" aria-hidden="true" />
                        </TrackedDecisionLink>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </DocSection>

            <DocSection id="why-this-exists" eyebrow="Why This Exists" title="Decision quality is the durable advantage">
              <div className="rounded-md border border-line bg-panel p-5">
                <div className="grid gap-3">
                  {whyStages.map((stage, index) => (
                    <div key={stage}>
                      <div className="rounded-md border border-line bg-paper p-4 text-lg font-semibold text-ink">{stage}</div>
                      {index < whyStages.length - 1 ? (
                        <div className="flex justify-center py-2 text-accent" aria-hidden="true">
                          <ArrowDown className="h-5 w-5" />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
                <p className="mt-6 leading-7 text-muted">Most AI resources explain technology.</p>
                <p className="mt-2 leading-7 text-muted">
                  This Product Operating System explains how experienced Product Managers make product decisions.
                </p>
              </div>
            </DocSection>

            <DocSection id="four-pillars" eyebrow="The Four Pillars" title="The knowledge product structure" background="panel">
              <div id="decision-systems" className="grid gap-4 sm:grid-cols-2">
                {pillars.map((pillar) => (
                  <article key={pillar.title} className="rounded-md border border-line bg-paper p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md border border-line bg-panel">
                      {pillar.icon}
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-ink">{pillar.title}</h3>
                    <p className="mt-3 leading-7 text-muted">{pillar.description}</p>
                  </article>
                ))}
              </div>
            </DocSection>

            <DocSection id="learning-journey" eyebrow="Decision Flow" title="The v1 system from problem to measurement">
              <div className="grid gap-3">
                {journey.map((stage, index) => (
                  <div key={stage.title}>
                    <TrackedDecisionLink
                      href={stage.href}
                      eventName="module_clicked_from_release"
                      label={stage.title}
                      className="w-full rounded-md border border-line bg-panel p-4 text-left text-lg font-semibold text-ink hover:bg-paper"
                    >
                      <Route className="h-5 w-5 text-accent" aria-hidden="true" />
                      {stage.title}
                    </TrackedDecisionLink>
                    {index < journey.length - 1 ? (
                      <div className="flex justify-center py-2 text-accent" aria-hidden="true">
                        <ArrowDown className="h-5 w-5" />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </DocSection>

            <DocSection id="current-release" eyebrow="Release Status" title="v1 complete" background="panel">
              <div className="rounded-md border border-line bg-paper p-5">
                <div className="flex items-center gap-3">
                  <Layers3 className="h-6 w-6 text-accent" aria-hidden="true" />
                  <h3 className="text-2xl font-semibold text-ink">AI Product Operating System</h3>
                </div>
                <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                  {releaseStats.map((item) => (
                    <div key={item.label} className="rounded-md border border-line bg-panel p-4">
                      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{item.label}</dt>
                      <dd className="mt-2 font-semibold text-ink">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </DocSection>

            <section id="recruiter-tour" className="border-b border-line py-12 sm:py-14" aria-labelledby="tour-title">
              <div className="rounded-md border border-line bg-panel p-6">
                <Boxes className="h-6 w-6 text-accent" aria-hidden="true" />
                <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-accent">Start the Recruiter Tour</p>
                <h2 id="tour-title" className="mt-3 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
                  New to the Product Operating System?
                </h2>
                <p className="mt-3 max-w-2xl leading-7 text-muted">
                  Take a guided five-minute tour designed specifically for recruiters and hiring managers.
                </p>
                <TrackedDecisionLink href="/recruiter-tour" eventName="recruiter_path_clicked" label="Recruiter Guided Tour" pathName="Recruiter Quick Review" variant="primary" className="mt-6">
                  Start Tour
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </TrackedDecisionLink>
              </div>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-paper p-4">
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{label}</dt>
      <dd className="mt-2 text-lg font-semibold text-ink">{value}</dd>
    </div>
  );
}

function DocSection({
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
    <section id={id} className={`scroll-mt-24 border-b border-line py-12 sm:py-14 ${background === "panel" ? "bg-panel -mx-5 px-5 sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10" : ""}`} aria-labelledby={`${id}-title`}>
      <div className="max-w-3xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">{eyebrow}</p>
          <h2 id={`${id}-title`} className="mt-3 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </section>
  );
}
