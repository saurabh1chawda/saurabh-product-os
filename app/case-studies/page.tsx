import type { Metadata } from "next";
import { ArrowRight, BarChart3, BriefcaseBusiness, Compass, Layers3 } from "lucide-react";

import {
  CaseStudiesHubTrackedButton,
  CaseStudiesHubTrackedLink,
  CaseStudiesHubViewed
} from "@/components/case-studies-hub-interactions";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Case Studies | Product Operating System",
  description:
    "Product Leadership Briefs documenting customer problems, strategic decisions, trade-offs, execution, measurable outcomes, and lessons behind significant product initiatives.",
  alternates: {
    canonical: "/case-studies"
  },
  openGraph: {
    title: "Case Studies | Product Operating System",
    description:
      "Product Leadership Briefs documenting product judgment through customer problems, strategic decisions, trade-offs, execution, outcomes, and lessons.",
    url: "https://saurabh-product-os.vercel.app/case-studies",
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
    title: "Case Studies | Product Operating System",
    description:
      "Product Leadership Briefs documenting product judgment through customer problems, strategic decisions, trade-offs, execution, outcomes, and lessons.",
    images: ["/og-image.png"]
  }
};

const featuredBrief = {
  title: "Workflow Adoption > Content Expansion",
  company: "JoVE",
  businessOutcome: "+30% Portfolio Revenue",
  competencies: ["Discovery", "Product Strategy", "AI", "Stakeholder Leadership"],
  readingTime: "~12 minutes",
  href: "/case-studies/jove"
};

const upcomingBriefs = [
  {
    company: "Logix",
    decision: "Platform Modernization > Feature Expansion",
    href: "/case-studies/logix",
    status: "Available"
  },
  {
    company: "Simplilearn",
    decision: "Conversion Optimization > Acquisition Spend",
    href: "/case-studies/simplilearn",
    status: "Available"
  },
  {
    company: "Mahindra Comviva",
    decision: "Reliability > Platform Expansion",
    status: "Planned"
  }
];

const leadershipThemes = [
  { title: "Customer Discovery", href: "/decision-systems/customer-discovery" },
  { title: "Platform Thinking", href: "/stories/platform-modernization-logix" },
  { title: "Growth", href: "/stories/simplilearn-job-guarantee-growth" },
  { title: "AI Products", href: "/ai-product-principles" },
  { title: "Payments", href: "/stories/payments-reliability-comviva" }
];

const careerOutcomes = [
  { value: "₹1M+ ARR", label: "Zero-to-one platform products" },
  { value: "10× Revenue", label: "Growth and monetization" },
  { value: "+30% Portfolio Revenue", label: "JoVE portfolio strategy" },
  { value: "10M+ Monthly Transactions", label: "Payments platform scale" },
  { value: "15+ Enterprise Deployments", label: "B2B delivery and advisory" }
];

const continueLinks = [
  {
    title: "Professional Profile",
    description: "Review career context, capabilities, and business outcomes.",
    href: "/profile",
    status: "Available"
  },
  {
    title: "Decision Operating System",
    description: "Explore the decision systems behind Product OS.",
    href: "/decision-operating-system",
    status: "Available"
  },
  {
    title: "AI Product Playbook",
    description: "A practical operating guide for AI product execution.",
    href: "/ai-product-playbook",
    status: "In Progress"
  }
];

export default function CaseStudiesPage() {
  return (
    <>
      <CaseStudiesHubViewed />
      <SiteHeader />
      <main>
        <section className="border-b border-line bg-panel" aria-labelledby="case-studies-title">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Executive Evidence Hub</p>
              <h1 id="case-studies-title" className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
                Case Studies
              </h1>
              <p className="mt-6 max-w-3xl text-xl leading-8 text-ink">
                Product Leadership Briefs documenting the customer problems, strategic decisions, trade-offs, execution, measurable outcomes, and lessons behind significant product initiatives.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-line" aria-labelledby="start-here-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Start Here" id="start-here-title" title="Begin with the strongest evidence" />
            <article className="mt-8 rounded-md border border-line bg-panel p-6 shadow-soft">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">{featuredBrief.company}</p>
                  <h2 className="mt-4 text-3xl font-semibold leading-tight text-ink">{featuredBrief.title}</h2>
                  <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                    <DetailBlock label="Business Outcome" value={featuredBrief.businessOutcome} />
                    <DetailBlock label="Reading Time" value={featuredBrief.readingTime} />
                  </dl>
                  <div className="mt-6 flex flex-wrap gap-2" aria-label="Competencies demonstrated">
                    {featuredBrief.competencies.map((competency) => (
                      <span key={competency} className="rounded-full border border-line bg-paper px-3 py-1 text-sm font-semibold text-ink">
                        {competency}
                      </span>
                    ))}
                  </div>
                </div>
                <CaseStudiesHubTrackedLink
                  href={featuredBrief.href}
                  eventName="featured_brief_clicked"
                  label={featuredBrief.title}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-white transition hover:bg-ink"
                >
                  Read Product Leadership Brief
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </CaseStudiesHubTrackedLink>
              </div>
            </article>
          </div>
        </section>

        <section className="border-b border-line bg-panel" aria-labelledby="upcoming-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Upcoming Product Leadership Briefs" id="upcoming-title" title="Additional evidence being shaped" />
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {upcomingBriefs.map((brief) => (
                brief.href ? (
                  <CaseStudiesHubTrackedLink
                    key={brief.company}
                    href={brief.href}
                    className="min-h-11 rounded-md border border-line bg-paper p-5 text-left transition hover:border-accent"
                    eventName="upcoming_brief_clicked"
                    label={brief.company}
                    aria-label={`${brief.company} brief ${brief.status}`}
                  >
                    <UpcomingBriefCard brief={brief} />
                  </CaseStudiesHubTrackedLink>
                ) : (
                  <CaseStudiesHubTrackedButton
                    key={brief.company}
                    className="min-h-11 rounded-md border border-line bg-paper p-5 text-left"
                    eventName="upcoming_brief_clicked"
                    label={brief.company}
                    aria-label={`${brief.company} brief ${brief.status}`}
                  >
                    <UpcomingBriefCard brief={brief} />
                  </CaseStudiesHubTrackedButton>
                )
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line" aria-labelledby="themes-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Leadership Themes" id="themes-title" title="The product capabilities these briefs demonstrate" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {leadershipThemes.map((theme) => (
                <CaseStudiesHubTrackedLink
                  key={theme.title}
                  href={theme.href}
                  eventName="leadership_theme_clicked"
                  label={theme.title}
                  className="rounded-md border border-line bg-panel p-5 transition hover:border-accent"
                >
                  <Compass className="h-5 w-5 text-accent" aria-hidden="true" />
                  <h3 className="mt-5 text-lg font-semibold leading-tight text-ink">{theme.title}</h3>
                  <p className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent">
                    View evidence
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </p>
                </CaseStudiesHubTrackedLink>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-panel" aria-labelledby="outcomes-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Career Outcomes" id="outcomes-title" title="Aggregate business signals across Product OS" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {careerOutcomes.map((outcome) => (
                <article key={outcome.value} className="rounded-md border border-line bg-paper p-5">
                  <BarChart3 className="h-5 w-5 text-accent" aria-hidden="true" />
                  <p className="mt-5 text-3xl font-semibold leading-tight text-ink">{outcome.value}</p>
                  <p className="mt-3 leading-7 text-muted">{outcome.label}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line" aria-labelledby="continue-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Continue Exploring" id="continue-title" title="Choose the next review path" />
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {continueLinks.map((item) => (
                <CaseStudiesHubTrackedLink
                  key={item.title}
                  href={item.href}
                  eventName="continue_exploring_clicked"
                  label={item.title}
                  className="rounded-md border border-line bg-panel p-5 transition hover:border-accent"
                >
                  <div className="flex items-start justify-between gap-4">
                    <Layers3 className="h-5 w-5 text-accent" aria-hidden="true" />
                    <span className="rounded-full border border-line bg-paper px-3 py-1 text-xs font-semibold text-muted">{item.status}</span>
                  </div>
                  <h3 className="mt-5 text-xl font-semibold leading-tight text-ink">{item.title}</h3>
                  <p className="mt-3 leading-7 text-muted">{item.description}</p>
                  <p className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent">
                    Continue exploring
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </p>
                </CaseStudiesHubTrackedLink>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function UpcomingBriefCard({ brief }: { brief: { company: string; decision: string; status: string } }) {
  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <BriefcaseBusiness className="h-5 w-5 text-accent" aria-hidden="true" />
        <span className="rounded-full border border-line bg-panel px-3 py-1 text-xs font-semibold text-muted">{brief.status}</span>
      </div>
      <h3 className="mt-5 text-xl font-semibold leading-tight text-ink">{brief.company}</h3>
      <p className="mt-4 text-sm font-semibold uppercase tracking-[0.14em] text-accent">Decision</p>
      <p className="mt-2 leading-7 text-muted">{brief.decision}</p>
    </>
  );
}

function SectionHeader({ eyebrow, id, title }: { eyebrow: string; id: string; title: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">{eyebrow}</p>
      <h2 id={id} className="mt-3 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
        {title}
      </h2>
    </div>
  );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-paper p-4">
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{label}</dt>
      <dd className="mt-2 font-semibold leading-7 text-ink">{value}</dd>
    </div>
  );
}
