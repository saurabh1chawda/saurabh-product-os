import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ArrowDown, ArrowRight, Boxes, ClipboardList, Compass, FileText, GitBranch, Layers3, Route } from "lucide-react";

import { AnalyticsViewed, TrackedDecisionLink } from "@/components/decision-system-interactions";
import { SiteHeader } from "@/components/site-header";
import { ButtonLink } from "@/components/ui/button-link";

const pageDescription =
  "Explore the Decision Operating System—a living collection of Decision Systems, Decision Journals and Operating Principles that document how I build AI-powered products and make product decisions under uncertainty.";
const pageUrl = "https://saurabh-product-os.vercel.app/decision-operating-system";

export const metadata: Metadata = {
  title: "Decision Operating System | Product Decision Frameworks by Saurabh Chawda",
  description: pageDescription,
  alternates: {
    canonical: "/decision-operating-system"
  },
  openGraph: {
    title: "Decision Operating System | Product Decision Frameworks by Saurabh Chawda",
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
    title: "Decision Operating System | Product Decision Frameworks by Saurabh Chawda",
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
    description: "Practical canvases, scorecards and templates.",
    badge: "Coming Soon",
    icon: <ClipboardList className="h-5 w-5 text-accent" aria-hidden="true" />
  }
];

const journey = [
  { title: "Understand", href: "/decision-systems/customer-discovery" },
  { title: "Discover", href: "/decision-systems/customer-discovery" },
  { title: "Validate", href: "/decision-systems/validation-experimentation" },
  { title: "Prioritize", href: "/frameworks/product-prioritization" },
  { title: "Architect", href: "/decision-systems/build-vs-buy-ai" },
  { title: "Measure", href: "/decision-systems/ai-success-metrics" }
];

const releaseStats = [
  { label: "Version", value: "v1.0" },
  { label: "Decision Systems", value: "1 / 6 Published" },
  { label: "Decision Journals", value: "4 Planned" },
  { label: "Toolkit", value: "Coming Soon" },
  { label: "Release Status", value: "Active Development" }
];

const roadmap = [
  { label: "Now", items: ["Customer Discovery"] },
  { label: "Next", items: ["Validation & Experimentation"] },
  { label: "Upcoming", items: ["AI Prioritization", "Build vs Buy AI", "RAG vs Agent", "AI Success Metrics"] },
  { label: "Toolkit", items: ["Canvases", "Scorecards", "Templates"] }
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
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Decision Operating System</p>
              <h1 id="dos-title" className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
                Decision Operating System
              </h1>
              <p className="mt-6 max-w-3xl text-xl leading-8 text-ink">
                A living collection of Decision Systems, Decision Journals and Operating Principles that document how I make high-quality product decisions under uncertainty.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <TrackedDecisionLink href="/recruiter-tour" eventName="next_module_clicked" label="Recruiter Guided Tour" variant="primary">
                  Start the 5-Minute Tour
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </TrackedDecisionLink>
                <ButtonLink href="#decision-systems" variant="secondary">
                  Browse Decision Systems
                </ButtonLink>
              </div>
              <dl className="mt-8 grid gap-3 sm:grid-cols-3">
                <MetaItem label="Reading Time" value="5 minutes" />
                <MetaItem label="Version" value="v1.0" />
                <MetaItem label="Status" value="Living Product" />
              </dl>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[240px_1fr] lg:px-10">
          <aside className="hidden lg:block">
            <div className="sticky top-24 py-10">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Decision OS</p>
              <nav aria-label="Decision Operating System sections" className="mt-4 grid gap-2 text-sm text-muted">
                <a href="#why-this-exists" className="rounded-md px-3 py-2 transition hover:bg-panel hover:text-ink">Why This Exists</a>
                <a href="#four-pillars" className="rounded-md px-3 py-2 transition hover:bg-panel hover:text-ink">The Four Pillars</a>
                <a href="#learning-journey" className="rounded-md px-3 py-2 transition hover:bg-panel hover:text-ink">Learning Journey</a>
                <a href="#current-release" className="rounded-md px-3 py-2 transition hover:bg-panel hover:text-ink">Current Release</a>
                <a href="#roadmap" className="rounded-md px-3 py-2 transition hover:bg-panel hover:text-ink">Roadmap</a>
                <a href="#recruiter-tour" className="rounded-md px-3 py-2 transition hover:bg-panel hover:text-ink">Recruiter Tour</a>
              </nav>
            </div>
          </aside>

          <article className="min-w-0">
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
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-line bg-panel">
                        {pillar.icon}
                      </div>
                      {pillar.badge ? (
                        <span className="rounded-full border border-line bg-panel px-2.5 py-1 text-xs font-semibold text-muted">{pillar.badge}</span>
                      ) : null}
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-ink">{pillar.title}</h3>
                    <p className="mt-3 leading-7 text-muted">{pillar.description}</p>
                  </article>
                ))}
              </div>
            </DocSection>

            <DocSection id="learning-journey" eyebrow="Learning Journey" title="A roadmap for product decision quality">
              <div className="grid gap-3">
                {journey.map((stage, index) => (
                  <div key={stage.title}>
                    <TrackedDecisionLink
                      href={stage.href}
                      eventName="decision_system_clicked"
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

            <DocSection id="current-release" eyebrow="Current Release" title="Decision Operating System v1.0" background="panel">
              <div className="rounded-md border border-line bg-paper p-5">
                <div className="flex items-center gap-3">
                  <Layers3 className="h-6 w-6 text-accent" aria-hidden="true" />
                  <h3 className="text-2xl font-semibold text-ink">Decision Operating System</h3>
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

            <DocSection id="roadmap" eyebrow="Roadmap" title="Public roadmap">
              <div className="grid gap-4">
                {roadmap.map((group) => (
                  <article key={group.label} className="rounded-md border border-line bg-panel p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">{group.label}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <span key={item} className="rounded-full border border-line bg-paper px-3 py-1.5 text-sm font-semibold text-muted">
                          {item}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
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
                <TrackedDecisionLink href="/recruiter-tour" eventName="next_module_clicked" label="Recruiter Guided Tour" variant="primary" className="mt-6">
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
