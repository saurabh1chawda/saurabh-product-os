import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  Compass,
  ExternalLink,
  FileText,
  GitBranch,
  Layers3,
  Route,
  Sparkles,
  UserRound
} from "lucide-react";

import {
  ExecutiveSectionViewed,
  ExecutiveSummaryTrackedLink,
  ExecutiveSummaryViewed
} from "@/components/executive-summary-interactions";
import { SiteHeader } from "@/components/site-header";

const metadataTitle = "Executive Summary | AI Product Operating System";
const pageDescription =
  "A two-minute executive briefing explaining Product OS, the AI Product Management operating system created by Saurabh Chawda to demonstrate product judgment through customer discovery, validation, prioritization, AI strategy, and measurable business outcomes.";
const openGraphDescription =
  "Understand Product OS in two minutes. Learn how Saurabh approaches AI Product Management through practical decision systems, product strategy, and measurable outcomes.";
const pageUrl = "https://saurabh-product-os.vercel.app/executive-summary";

export const metadata: Metadata = {
  title: metadataTitle,
  description: pageDescription,
  alternates: {
    canonical: "/executive-summary"
  },
  openGraph: {
    title: metadataTitle,
    description: openGraphDescription,
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
    title: metadataTitle,
    description: openGraphDescription,
    images: ["/og-image.png"]
  }
};

const metadataItems = [
  { label: "Reading Time", value: "2 min" },
  { label: "Version", value: "v1.0" },
  { label: "Focus", value: "Executive Briefing" },
  { label: "Updated", value: "July 2026" }
];

const findItems = [
  {
    title: "AI Product Principles",
    description:
      "The philosophy behind how I evaluate AI opportunities and build products that create measurable customer and business value.",
    href: "/ai-product-principles",
    cta: "Explore",
    icon: <Compass className="h-5 w-5 text-accent" aria-hidden="true" />
  },
  {
    title: "Decision Operating System",
    description:
      "A collection of repeatable product decision systems covering discovery, validation, prioritization, architecture, AI strategy, and measurement.",
    href: "/decision-operating-system",
    cta: "Explore",
    icon: <GitBranch className="h-5 w-5 text-accent" aria-hidden="true" />
  },
  {
    title: "Product Stories",
    description: "Real examples showing how product decisions translated into measurable outcomes.",
    href: "/stories/simplilearn-job-guarantee-growth",
    cta: "Explore",
    icon: <FileText className="h-5 w-5 text-accent" aria-hidden="true" />
  },
  {
    title: "Recruiter Tour",
    description: "A guided five-minute walkthrough designed specifically for recruiters and hiring managers.",
    href: "/recruiter-tour",
    cta: "Start Tour",
    icon: <Route className="h-5 w-5 text-accent" aria-hidden="true" />
  },
  {
    title: "Professional Profile",
    description: "Professional experience, leadership, and measurable achievements.",
    href: "/profile",
    cta: "View Profile",
    icon: <BriefcaseBusiness className="h-5 w-5 text-accent" aria-hidden="true" />
  },
  {
    title: "GitHub",
    description: "Explore the engineering implementation behind Product OS.",
    href: "https://github.com/saurabh1chawda/saurabh-product-os",
    cta: "Open GitHub",
    icon: <ExternalLink className="h-5 w-5 text-accent" aria-hidden="true" />
  }
];

const differenceItems = [
  "Decision Systems instead of feature lists.",
  "Real product experience instead of hypothetical case studies.",
  "Customer behavior connected to business outcomes.",
  "AI strategy grounded in product judgment instead of technology hype."
];

const metrics = [
  { value: "10x", label: "Revenue Growth" },
  { value: "10M+", label: "Monthly Transactions Supported" },
  { value: "40%", label: "Platform Query Latency Reduction" },
  { value: "2x", label: "Release Velocity" },
  { value: "15+", label: "Enterprise Deployments" },
  { value: "94%", label: "Customer Satisfaction" }
];

const audiences = [
  {
    title: "Recruiters",
    description: "Understand my experience in two minutes.",
    icon: <UserRound className="h-5 w-5 text-accent" aria-hidden="true" />
  },
  {
    title: "Hiring Managers",
    description: "Evaluate how I approach product decisions under uncertainty.",
    icon: <BriefcaseBusiness className="h-5 w-5 text-accent" aria-hidden="true" />
  },
  {
    title: "Product Leaders",
    description: "Assess my product philosophy, AI thinking, and leadership potential.",
    icon: <Layers3 className="h-5 w-5 text-accent" aria-hidden="true" />
  }
];

const exploreItems = [
  {
    title: "Recruiter Tour",
    description: "The fastest guided path for evaluating fit.",
    href: "/recruiter-tour",
    cta: "Start Tour"
  },
  {
    title: "Decision Operating System",
    description: "Review the complete AI Product Operating System v1.",
    href: "/decision-operating-system",
    cta: "Open Decision OS"
  },
  {
    title: "Professional Profile",
    description: "Review experience, scope, and measurable impact.",
    href: "/profile",
    cta: "View Profile"
  }
];

const breadcrumbs = [
  { name: "Home", item: "https://saurabh-product-os.vercel.app" },
  { name: "Executive Summary", item: pageUrl }
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

const sectionNames = [
  "Hero",
  "Why Product OS Exists",
  "What You'll Find",
  "What Makes Product OS Different",
  "Business Outcomes",
  "Who Should Read This",
  "Explore Product OS"
];

export default function ExecutiveSummaryPage() {
  return (
    <>
      <ExecutiveSummaryViewed />
      {sectionNames.map((sectionName) => (
        <ExecutiveSectionViewed key={sectionName} sectionName={sectionName} />
      ))}
      <SiteHeader />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbJsonLd)
          }}
        />

        <section className="border-b border-line bg-panel" aria-labelledby="executive-summary-title" data-executive-section="Hero">
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
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">AI Product Operating System</p>
              <h1 id="executive-summary-title" className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
                Executive Summary
              </h1>
              <p className="mt-6 max-w-3xl text-xl leading-8 text-ink">
                A two-minute introduction to Product OS, an AI Product Management operating system documenting how I discover customer problems, validate opportunities, prioritize investments, make AI strategy decisions, and measure product success.
              </p>
              <dl className="mt-8 grid gap-3 sm:grid-cols-4">
                {metadataItems.map((item) => (
                  <MetaItem key={item.label} label={item.label} value={item.value} />
                ))}
              </dl>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ExecutiveSummaryTrackedLink href="/recruiter-tour" ctaName="Recruiter Tour" variant="primary">
                  Recruiter Tour
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </ExecutiveSummaryTrackedLink>
                <ExecutiveSummaryTrackedLink href="/decision-operating-system" ctaName="Decision Operating System" variant="secondary">
                  Decision Operating System
                </ExecutiveSummaryTrackedLink>
              </div>
            </div>
          </div>
        </section>

        <BriefSection id="why-product-os-exists" sectionName="Why Product OS Exists" eyebrow="Why Product OS Exists" title="Profiles show history. Product OS shows judgment.">
          <div className="rounded-md border border-line bg-panel p-5">
            <Sparkles className="h-6 w-6 text-accent" aria-hidden="true" />
            <p className="mt-5 max-w-4xl text-lg leading-8 text-muted">
              Traditional profiles explain where someone worked. Interviews reveal how someone thinks. Product OS closes that gap. It documents the principles, decision systems, product stories, and AI frameworks that guide how I make product decisions across customer discovery, validation, prioritization, platform strategy, and AI products.
            </p>
          </div>
        </BriefSection>

        <BriefSection id="what-youll-find" sectionName="What You'll Find" eyebrow="What You'll Find" title="Six fast paths into the work" background="panel">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {findItems.map((item) => (
              <article key={item.title} className="rounded-md border border-line bg-paper p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-line bg-panel">
                  {item.icon}
                </div>
                <h2 className="mt-5 text-xl font-semibold leading-tight text-ink">{item.title}</h2>
                <p className="mt-3 leading-7 text-muted">{item.description}</p>
                <ExecutiveSummaryTrackedLink href={item.href} ctaName={`${item.title}: ${item.cta}`} className="mt-5">
                  {item.cta}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </ExecutiveSummaryTrackedLink>
              </article>
            ))}
          </div>
        </BriefSection>

        <BriefSection id="what-makes-product-os-different" sectionName="What Makes Product OS Different" eyebrow="What Makes Product OS Different" title="Built to make product thinking evaluable">
          <div className="grid gap-4 sm:grid-cols-2">
            {differenceItems.map((item) => (
              <article key={item} className="rounded-md border border-line bg-panel p-5">
                <CheckCircle2 className="h-5 w-5 text-accent" aria-hidden="true" />
                <h2 className="mt-5 text-xl font-semibold leading-tight text-ink">{item}</h2>
              </article>
            ))}
          </div>
          <blockquote className="mt-6 rounded-md border border-line bg-panel p-6">
            <p className="text-2xl font-semibold leading-tight text-ink">
              Product OS is designed to demonstrate how I think, not simply what I have built.
            </p>
          </blockquote>
        </BriefSection>

        <BriefSection id="business-outcomes" sectionName="Business Outcomes" eyebrow="Business Outcomes" title="Examples of product decisions becoming outcomes" background="panel">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {metrics.map((metric) => (
              <article key={metric.label} className="rounded-md border border-line bg-paper p-5">
                <p className="text-4xl font-semibold leading-none text-ink">{metric.value}</p>
                <h2 className="mt-4 text-lg font-semibold leading-tight text-ink">{metric.label}</h2>
              </article>
            ))}
          </div>
          <p className="mt-6 max-w-4xl leading-7 text-muted">
            These outcomes represent examples from growth products, enterprise SaaS, platform modernization, and transaction-scale systems.
          </p>
        </BriefSection>

        <BriefSection id="who-should-read-this" sectionName="Who Should Read This" eyebrow="Who Should Read This?" title="Designed for fast, senior evaluation">
          <div className="grid gap-4 sm:grid-cols-3">
            {audiences.map((audience) => (
              <article key={audience.title} className="rounded-md border border-line bg-panel p-5">
                {audience.icon}
                <h2 className="mt-5 text-xl font-semibold leading-tight text-ink">{audience.title}</h2>
                <p className="mt-3 leading-7 text-muted">{audience.description}</p>
              </article>
            ))}
          </div>
        </BriefSection>

        <section className="border-b border-line bg-panel" aria-labelledby="explore-product-os-title" data-executive-section="Explore Product OS">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Explore Product OS" id="explore-product-os-title" title="Continue with the highest-signal paths" />
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {exploreItems.map((item) => (
                <article key={item.title} className="rounded-md border border-line bg-paper p-6">
                  <BarChart3 className="h-6 w-6 text-accent" aria-hidden="true" />
                  <h2 className="mt-5 text-2xl font-semibold leading-tight text-ink">{item.title}</h2>
                  <p className="mt-3 leading-7 text-muted">{item.description}</p>
                  <ExecutiveSummaryTrackedLink href={item.href} ctaName={item.title} variant="primary" className="mt-6">
                    {item.cta}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </ExecutiveSummaryTrackedLink>
                </article>
              ))}
            </div>
            <blockquote className="mt-8 rounded-md border border-line bg-paper p-6">
              <p className="text-2xl font-semibold leading-tight text-ink">
                Product judgment becomes visible when decisions are documented, evidence is shared, and outcomes are measurable.
              </p>
            </blockquote>
          </div>
        </section>
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

function BriefSection({
  background,
  children,
  eyebrow,
  id,
  sectionName,
  title
}: {
  background?: "panel";
  children: ReactNode;
  eyebrow: string;
  id: string;
  sectionName: string;
  title: string;
}) {
  return (
    <section
      id={id}
      className={`border-b border-line ${background === "panel" ? "bg-panel" : ""}`}
      aria-labelledby={`${id}-title`}
      data-executive-section={sectionName}
    >
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
        <SectionHeader eyebrow={eyebrow} id={`${id}-title`} title={title} />
        <div className="mt-8">{children}</div>
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
