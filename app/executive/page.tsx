import type { Metadata } from "next";
import { ArrowRight, BarChart3, BriefcaseBusiness, Compass, FileText, Route, ShieldCheck } from "lucide-react";

import {
  ExecutiveBriefViewed,
  ExecutiveSectionViewed,
  ExecutiveTrackedLink
} from "@/components/executive-brief-interactions";
import { SiteHeader } from "@/components/site-header";
import {
  businessImpactMetrics,
  careerMilestones,
  executivePrinciples,
  featuredDecisions,
  hiringReasons,
  leadershipDomains,
  readingPaths,
  recruiterResources
} from "@/data/executive-brief";

const pageDescription =
  "A five-minute executive overview of Saurabh Chawda's product leadership experience, operating philosophy, flagship decisions, measurable business impact and AI product expertise.";

export const metadata: Metadata = {
  title: "Executive Briefing Center | Saurabh Chawda | AI Product Leader",
  description: pageDescription,
  alternates: {
    canonical: "/executive"
  },
  openGraph: {
    title: "Executive Briefing Center | Saurabh Chawda | AI Product Leader",
    description: pageDescription,
    url: "https://saurabh-product-os.vercel.app/executive",
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
    title: "Executive Briefing Center | Saurabh Chawda | AI Product Leader",
    description: pageDescription,
    images: ["/og-image.png"]
  }
};

export default function ExecutiveBriefingCenterPage() {
  return (
    <>
      <ExecutiveBriefViewed />
      <SiteHeader />
      <main>
        <section className="border-b border-line bg-panel" aria-labelledby="executive-title">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Executive Summary</p>
              <h1 id="executive-title" className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
                Executive Brief
              </h1>
              <p className="mt-6 max-w-3xl text-xl leading-8 text-ink">
                A five-minute overview of my product leadership experience, operating philosophy, flagship decisions and measurable business outcomes.
              </p>
              <div className="mt-8 max-w-3xl rounded-md border border-line bg-paper p-6 shadow-soft">
                <p className="text-lg leading-8 text-muted">
                  I am Saurabh Chawda, a Lead / Senior AI Product Manager with 8+ years across AI platforms, enterprise SaaS, payments, growth products, platform strategy, and product leadership. Product OS documents how I evaluate opportunities, prioritize roadmaps, align teams, and connect product decisions to measurable customer and business outcomes.
                </p>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ExecutiveTrackedLink
                  href="/contact"
                  eventName="contact_cta_clicked"
                  label="Contact Saurabh"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-white transition hover:bg-ink"
                >
                  Contact Saurabh
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </ExecutiveTrackedLink>
                <ExecutiveTrackedLink
                  href="/product-leadership-operating-principles"
                  eventName="operating_principles_clicked"
                  label="See how I think"
                  className="inline-flex min-h-11 items-center justify-center rounded-md border border-line bg-panel px-4 text-sm font-semibold text-ink transition hover:border-accent"
                >
                  See how I think
                </ExecutiveTrackedLink>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-line" aria-labelledby="career-title">
          <ExecutiveSectionViewed eventName="career_snapshot_viewed" sectionName="Career at a Glance" />
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-14 lg:px-10">
            <SectionHeader eyebrow="Career Snapshot" id="career-title" title="Career at a Glance" />
            <div className="mt-8 grid gap-3 lg:grid-cols-6">
              {careerMilestones.map((milestone, index) => (
                <div key={milestone.label}>
                  <ExecutiveTrackedLink
                    href={milestone.href}
                    eventName="featured_decision_clicked"
                    label={milestone.label}
                    className="flex min-h-24 items-center justify-center rounded-md border border-line bg-panel p-4 text-center font-semibold leading-7 text-ink transition hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-paper"
                  >
                    {milestone.label}
                  </ExecutiveTrackedLink>
                  {index < careerMilestones.length - 1 ? (
                    <div className="flex justify-center py-2 text-accent lg:hidden" aria-hidden="true">
                      <ArrowRight className="h-4 w-4 rotate-90" />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-panel" aria-labelledby="leadership-title">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-14 lg:px-10">
            <SectionHeader eyebrow="Leadership Snapshot" id="leadership-title" title="Leadership Domains" />
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {leadershipDomains.map((domain) => (
                <ExecutiveTrackedLink
                  key={domain.title}
                  href={domain.href}
                  eventName="leadership_snapshot_clicked"
                  label={domain.title}
                  className="rounded-md border border-line bg-paper p-5 shadow-soft transition hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-panel"
                >
                  <Compass className="h-5 w-5 text-accent" aria-hidden="true" />
                  <h3 className="mt-5 text-xl font-semibold leading-tight text-ink">{domain.title}</h3>
                  <p className="mt-3 text-sm font-semibold uppercase tracking-[0.14em] text-accent">Evidence: {domain.evidence}</p>
                  <p className="mt-3 leading-7 text-muted">{domain.description}</p>
                </ExecutiveTrackedLink>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line" aria-labelledby="impact-title">
          <ExecutiveSectionViewed eventName="business_dashboard_viewed" sectionName="Business Impact" />
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-14 lg:px-10">
            <SectionHeader eyebrow="Business Impact Dashboard" id="impact-title" title="Business Impact" />
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {businessImpactMetrics.map((metric) => (
                <ExecutiveTrackedLink
                  key={`${metric.value}-${metric.label}`}
                  href={metric.href}
                  eventName="featured_decision_clicked"
                  label={`${metric.value} ${metric.label}`}
                  className="rounded-md border border-line bg-panel p-5 transition hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-paper"
                >
                  <BarChart3 className="h-5 w-5 text-accent" aria-hidden="true" />
                  <p className="mt-5 text-3xl font-semibold leading-none text-ink">{metric.value}</p>
                  <p className="mt-3 text-sm font-semibold uppercase tracking-[0.12em] text-muted">{metric.label}</p>
                </ExecutiveTrackedLink>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-panel" aria-labelledby="principles-title">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-14 lg:px-10">
            <SectionHeader eyebrow="How I Think" id="principles-title" title="Product Leadership Operating Principles" />
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {executivePrinciples.map((principle) => (
                <ExecutiveTrackedLink
                  key={principle.title}
                  href={principle.href}
                  eventName="operating_principles_clicked"
                  label={principle.title}
                  className="rounded-md border border-line bg-paper p-5 transition hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-panel"
                >
                  <ShieldCheck className="h-5 w-5 text-accent" aria-hidden="true" />
                  <h3 className="mt-5 text-xl font-semibold leading-tight text-ink">{principle.title}</h3>
                  <p className="mt-3 leading-7 text-muted">{principle.summary}</p>
                </ExecutiveTrackedLink>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line" aria-labelledby="decisions-title">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-14 lg:px-10">
            <SectionHeader eyebrow="Featured Decisions" id="decisions-title" title="Flagship Product Decisions" />
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {featuredDecisions.map((decision) => (
                <ExecutiveTrackedLink
                  key={decision.title}
                  href={decision.href}
                  eventName="featured_decision_clicked"
                  label={decision.title}
                  className="rounded-md border border-line bg-panel p-5 shadow-soft transition hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-paper"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">{decision.title}</p>
                  <h3 className="mt-4 text-2xl font-semibold leading-tight text-ink">{decision.decision}</h3>
                  <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                    <DetailBlock label="Role Fit" value={decision.roleFit} />
                    <DetailBlock label="Business Impact" value={decision.businessImpact} />
                    <DetailBlock label="Product Principle" value={decision.principle} />
                  </dl>
                  <p className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent">
                    Review role-fit evidence
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </p>
                </ExecutiveTrackedLink>
              ))}
            </div>
            <div className="mt-8 rounded-md border border-line bg-paper p-6">
              <h3 className="text-xl font-semibold leading-tight text-ink">Ready to discuss role fit?</h3>
              <p className="mt-3 max-w-3xl leading-7 text-muted">
                If this evidence maps to a Senior / Lead PM, AI PM, platform, growth, or enterprise product role, the fastest next step is LinkedIn or email.
              </p>
              <ExecutiveTrackedLink
                href="/contact"
                eventName="contact_cta_clicked"
                label="Start interview conversation"
                className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-white transition hover:bg-ink"
              >
                Start an interview conversation
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ExecutiveTrackedLink>
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-panel" aria-labelledby="hire-title">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-14 lg:px-10">
            <SectionHeader eyebrow="Why Teams Hire Me" id="hire-title" title="Evidence-backed reasons to continue the conversation" />
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {hiringReasons.map((reason) => (
                <article key={reason.title} className="rounded-md border border-line bg-paper p-5">
                  <BriefcaseBusiness className="h-5 w-5 text-accent" aria-hidden="true" />
                  <h3 className="mt-5 text-xl font-semibold leading-tight text-ink">{reason.title}</h3>
                  <p className="mt-3 leading-7 text-muted">{reason.summary}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {reason.evidence.map((evidence) => (
                      <ExecutiveTrackedLink
                        key={evidence.label}
                        href={evidence.href}
                        eventName="featured_decision_clicked"
                        label={evidence.label}
                        className="inline-flex min-h-11 items-center rounded-full border border-line bg-panel px-3 text-sm font-semibold text-ink transition hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-panel"
                      >
                        {evidence.label}
                      </ExecutiveTrackedLink>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line" aria-labelledby="toolkit-title">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-14 lg:px-10">
            <SectionHeader eyebrow="Recruiter Toolkit" id="toolkit-title" title="Recruiter Resources" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recruiterResources.map((resource) => (
                <ExecutiveTrackedLink
                  key={resource.title}
                  href={resource.href}
                  eventName={resource.title === "Email" ? "contact_cta_clicked" : "recruiter_toolkit_used"}
                  label={resource.title}
                  className="rounded-md border border-line bg-panel p-5 transition hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-paper"
                >
                  <FileText className="h-5 w-5 text-accent" aria-hidden="true" />
                  <h3 className="mt-5 text-xl font-semibold leading-tight text-ink">{resource.title}</h3>
                  <p className="mt-3 leading-7 text-muted">{resource.description}</p>
                  <p className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent">
                    {resource.cta}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </p>
                </ExecutiveTrackedLink>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-panel" aria-labelledby="reading-title">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-14 lg:px-10">
            <SectionHeader eyebrow="Recommended Reading" id="reading-title" title="Explore Product OS" />
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {readingPaths.map((path) => (
                <ExecutiveTrackedLink
                  key={path.audience}
                  href={path.href}
                  eventName="reading_path_selected"
                  label={path.audience}
                  className="rounded-md border border-line bg-paper p-5 transition hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-panel"
                >
                  <div className="flex items-start justify-between gap-4">
                    <Route className="h-5 w-5 text-accent" aria-hidden="true" />
                    <span className="rounded-full border border-line bg-panel px-3 py-1 text-xs font-semibold text-muted">
                      {path.time}
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl font-semibold leading-tight text-ink">{path.audience}</h3>
                  <ol className="mt-5 space-y-3">
                    {path.steps.map((step) => (
                      <li key={step} className="flex gap-3 text-sm font-medium text-muted">
                        <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-accent" aria-hidden="true" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </ExecutiveTrackedLink>
              ))}
            </div>
          </div>
        </section>
      </main>
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
      <dd className="mt-2 text-sm font-semibold leading-6 text-ink">{value}</dd>
    </div>
  );
}
