import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { productLeadershipBriefSummaries } from "@/data/product-leadership-briefs";

export const metadata: Metadata = {
  title: "Case Studies | Product Operating System",
  description:
    "Product Leadership Briefs documenting customer problems, product decisions, execution strategy, measurable outcomes, and reflections behind significant product initiatives.",
  alternates: {
    canonical: "/case-studies"
  },
  openGraph: {
    title: "Case Studies | Product Operating System",
    description:
      "Executive Product Leadership Briefs showing product judgment through customer problems, trade-offs, strategy, execution, and measurable outcomes.",
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
      "Executive Product Leadership Briefs showing product judgment through customer problems, trade-offs, strategy, execution, and measurable outcomes.",
    images: ["/og-image.png"]
  }
};

export default function CaseStudiesPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-line bg-panel" aria-labelledby="case-studies-title">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Product Leadership Briefs</p>
              <h1 id="case-studies-title" className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
                Case Studies
              </h1>
              <p className="mt-6 max-w-3xl text-xl leading-8 text-ink">
                Every case study is presented as a Product Leadership Brief, documenting the customer problem, product decisions, execution strategy, measurable outcomes, and reflections behind significant product initiatives.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-line" aria-labelledby="briefs-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Brief Library</p>
              <h2 id="briefs-title" className="mt-3 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
                Executive product reviews, not traditional case studies
              </h2>
            </div>
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {productLeadershipBriefSummaries.map((brief) => (
                <article key={brief.company} className="rounded-md border border-line bg-panel p-5">
                  <div className="flex items-start justify-between gap-4">
                    <BriefcaseBusiness className="h-5 w-5 text-accent" aria-hidden="true" />
                    <span className="rounded-full border border-line bg-paper px-3 py-1 text-xs font-semibold text-muted">
                      {brief.status}
                    </span>
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold leading-tight text-ink">{brief.company}</h3>
                  <dl className="mt-5 grid gap-3">
                    <CaseStudyDetail label="Domain" value={brief.domain} />
                    <CaseStudyDetail label="Core decision" value={brief.coreDecision} />
                    <CaseStudyDetail label="Business impact" value={brief.businessImpact} />
                    <CaseStudyDetail label="Reading time" value={brief.readingTime} />
                  </dl>
                  {brief.href ? (
                    <Link href={brief.href} className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent transition hover:text-ink">
                      Read Product Leadership Brief
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function CaseStudyDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-paper p-4">
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{label}</dt>
      <dd className="mt-2 leading-7 text-muted">{value}</dd>
    </div>
  );
}
