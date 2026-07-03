import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Compass,
  Download,
  Sparkles
} from "lucide-react";

import { RecruiterJourneyTrackedLink, RecruiterJourneyViewed } from "@/components/recruiter-journey-interactions";
import { SiteHeader } from "@/components/site-header";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = {
  title: "Resume | Saurabh Chawda",
  description:
    "Resume center for Saurabh Chawda, Lead Product Manager focused on AI products, platform strategy, payments, enterprise SaaS, and growth systems.",
  alternates: {
    canonical: "/resume"
  },
  openGraph: {
    title: "Resume | Saurabh Chawda",
    description:
      "Review Saurabh Chawda's positioning, strengths, metrics, experience summary, and Product OS links.",
    url: "https://saurabh-product-os.vercel.app/resume",
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
    title: "Resume | Saurabh Chawda",
    description:
      "Review Saurabh Chawda's positioning, strengths, metrics, experience summary, and Product OS links.",
    images: ["/og-image.png"]
  }
};

const strengths = [
  "AI product strategy",
  "Customer discovery",
  "Platform modernization",
  "Payments and reliability",
  "Growth and monetization",
  "Cross-functional leadership"
];

const metrics = [
  { value: "10x", label: "Revenue Growth" },
  { value: "10M+", label: "Monthly Transactions" },
  { value: "94%", label: "Customer Satisfaction" },
  { value: "40%", label: "Query Latency Reduction" },
  { value: "2x", label: "Release Velocity" },
  { value: "15+", label: "Enterprise Deployments" }
];

const experience = [
  {
    title: "Growth & Monetization",
    description: "Built product-led growth decisions across funnel quality, referral loops, pricing, and conversion.",
    href: "/stories/simplilearn-job-guarantee-growth"
  },
  {
    title: "Payments & Reliability",
    description: "Worked on wallet and payment experiences where reliability directly shaped customer trust.",
    href: "/stories/payments-reliability-comviva"
  },
  {
    title: "Enterprise SaaS & Discovery",
    description: "Used product discovery to shift focus from more content to better customer workflows.",
    href: "/stories/product-discovery-jove"
  },
  {
    title: "Platform Strategy",
    description: "Sequenced modernization work around customer value, release velocity, and reliability.",
    href: "/stories/platform-modernization-logix"
  }
];

const productOsLinks = [
  {
    title: "Executive Summary",
    description: "Understand Product OS in two minutes.",
    href: "/executive-summary"
  },
  {
    title: "Decision Operating System",
    description: "Review the complete AI Product Operating System v1.",
    href: "/decision-operating-system"
  },
  {
    title: "For Hiring Managers",
    description: "Evaluate ownership, operating style, and product judgment.",
    href: "/for-hiring-managers"
  },
  {
    title: "Interview Companion",
    description: "Prepare for a deeper product conversation.",
    href: "/interview-companion"
  }
];

export default function ResumePage() {
  return (
    <>
      <RecruiterJourneyViewed eventName="resume_page_viewed" pageName="Resume" />
      <SiteHeader />
      <main>
        <section className="border-b border-line bg-panel" aria-labelledby="resume-title">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Resume Center</p>
              <h1 id="resume-title" className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
                Resume
              </h1>
              <p className="mt-6 max-w-3xl text-xl leading-8 text-ink">
                Lead Product Manager focused on AI products, platform strategy, payments, enterprise SaaS, and growth systems.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <span className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-line bg-paper px-4 text-sm font-semibold text-muted">
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Resume PDF coming soon
                </span>
                <RecruiterJourneyTrackedLink
                  href="https://www.linkedin.com/in/saurabhchawda5"
                  eventName="contact_link_clicked"
                  label="View LinkedIn"
                  variant="secondary"
                >
                  View LinkedIn
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </RecruiterJourneyTrackedLink>
              </div>
            </div>
          </div>
        </section>

        <PageSection eyebrow="Current Positioning" id="positioning-title" title="Senior product judgment across AI, platforms, SaaS, payments, and growth">
          <div className="rounded-md border border-line bg-panel p-6">
            <Sparkles className="h-6 w-6 text-accent" aria-hidden="true" />
            <p className="mt-5 max-w-4xl text-lg leading-8 text-muted">
              I am targeting Senior or Lead Product Manager roles where product judgment, technical fluency, customer discovery, and measurable execution matter. Product OS is designed to make that judgment visible before the interview.
            </p>
          </div>
        </PageSection>

        <PageSection eyebrow="Core Strengths" id="strengths-title" title="Where I create leverage" background="panel">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {strengths.map((strength) => (
              <div key={strength} className="flex items-center gap-3 rounded-md border border-line bg-paper p-4">
                <CheckCircle2 className="h-5 w-5 flex-none text-accent" aria-hidden="true" />
                <p className="font-semibold text-ink">{strength}</p>
              </div>
            ))}
          </div>
        </PageSection>

        <PageSection eyebrow="Key Metrics" id="metrics-title" title="Representative outcomes">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {metrics.map((metric) => (
              <article key={metric.label} className="rounded-md border border-line bg-panel p-5">
                <p className="text-4xl font-semibold leading-none text-ink">{metric.value}</p>
                <h2 className="mt-4 text-lg font-semibold leading-tight text-ink">{metric.label}</h2>
              </article>
            ))}
          </div>
        </PageSection>

        <PageSection eyebrow="Experience Summary" id="experience-title" title="Product work worth reviewing" background="panel">
          <div className="grid gap-4 lg:grid-cols-2">
            {experience.map((item) => (
              <article key={item.title} className="rounded-md border border-line bg-paper p-5">
                <BriefcaseBusiness className="h-5 w-5 text-accent" aria-hidden="true" />
                <h2 className="mt-5 text-xl font-semibold leading-tight text-ink">{item.title}</h2>
                <p className="mt-3 leading-7 text-muted">{item.description}</p>
                <ButtonLink href={item.href} variant="inline" className="mt-5">
                  Read story
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </ButtonLink>
              </article>
            ))}
          </div>
        </PageSection>

        <PageSection eyebrow="Product OS Links" id="product-os-links-title" title="Fast paths for recruiters and hiring managers">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {productOsLinks.map((item) => (
              <article key={item.title} className="rounded-md border border-line bg-panel p-5">
                <Compass className="h-5 w-5 text-accent" aria-hidden="true" />
                <h2 className="mt-5 text-xl font-semibold leading-tight text-ink">{item.title}</h2>
                <p className="mt-3 leading-7 text-muted">{item.description}</p>
                <ButtonLink href={item.href} variant="inline" className="mt-5">
                  Open
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </ButtonLink>
              </article>
            ))}
          </div>
        </PageSection>
      </main>
    </>
  );
}

function PageSection({
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
    <section className={`border-b border-line ${background === "panel" ? "bg-panel" : ""}`} aria-labelledby={id}>
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">{eyebrow}</p>
          <h2 id={id} className="mt-3 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
            {title}
          </h2>
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}
