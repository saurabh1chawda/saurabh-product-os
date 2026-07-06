import type { Metadata } from "next";
import { ArrowRight, Compass, GitBranch, Layers3 } from "lucide-react";

import {
  OperatingPrincipleCard,
  OperatingPrinciplesSectionViewed,
  OperatingPrinciplesViewed,
  TrackedPrincipleLink
} from "@/components/operating-principles-interactions";
import { SiteHeader } from "@/components/site-header";
import {
  leadershipCompass,
  operatingModelSteps,
  operatingPrinciples,
  operatingPrinciplesContinue,
  principleEvolution,
  principleMatrix
} from "@/data/operating-principles";

const pageDescription =
  "The operating principles that guide how Saurabh Chawda evaluates opportunities, makes product decisions, prioritizes roadmaps, and scales AI, platform, payments, and growth products.";

export const metadata: Metadata = {
  title: "Product Leadership Operating Principles | Saurabh Chawda",
  description: pageDescription,
  alternates: {
    canonical: "/product-leadership-operating-principles"
  },
  openGraph: {
    title: "Product Leadership Operating Principles | Saurabh Chawda",
    description: pageDescription,
    url: "https://saurabh-product-os.vercel.app/product-leadership-operating-principles",
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
    title: "Product Leadership Operating Principles | Saurabh Chawda",
    description: pageDescription,
    images: ["/og-image.png"]
  }
};

export default function ProductLeadershipOperatingPrinciplesPage() {
  return (
    <>
      <OperatingPrinciplesViewed />
      <SiteHeader />
      <main>
        <section className="border-b border-line bg-panel" aria-labelledby="principles-title">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Product Leadership Operating Principles</p>
              <h1 id="principles-title" className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
                The operating principles that consistently guide how I evaluate opportunities, prioritize roadmaps, and build products across AI, enterprise platforms, payments, and growth systems.
              </h1>
              <div className="mt-6 max-w-3xl space-y-4 text-lg leading-8 text-muted">
                <p>Every Product Leadership Brief inside Product OS reflects a real product decision.</p>
                <p>Over time I noticed something surprising.</p>
                <p>Although each decision came from a different industry, they all followed the same operating philosophy.</p>
                <p>These principles are not aspirational values. They are the heuristics I repeatedly use when making difficult product decisions.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-line" aria-labelledby="operating-model-title">
          <OperatingPrinciplesSectionViewed eventName="operating_model_viewed" sectionName="How My Product Leadership Works" />
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Operating Model" id="operating-model-title" title="How my product leadership works" />
            <div className="mt-8 grid gap-3">
              {operatingModelSteps.map((step, index) => (
                <div key={step}>
                  <div className="rounded-md border border-line bg-panel p-4 text-center font-semibold leading-7 text-ink">{step}</div>
                  {index < operatingModelSteps.length - 1 ? (
                    <div className="flex justify-center py-2 text-accent" aria-hidden="true">
                      <ArrowRight className="h-4 w-4 rotate-90" />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-panel" aria-labelledby="leadership-compass-title">
          <OperatingPrinciplesSectionViewed eventName="leadership_compass_viewed" sectionName="Leadership Compass" />
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Leadership Compass" id="leadership-compass-title" title="The product tensions I repeatedly navigate" />
            <div className="mt-8 rounded-md border border-line bg-paper p-6 shadow-soft">
              <div className="mx-auto grid max-w-3xl gap-4 text-center sm:grid-cols-3">
                <div className="sm:col-start-2">
                  <CompassLink direction="Customer" />
                </div>
                <div className="sm:col-start-1 sm:row-start-2">
                  <CompassLink direction="Growth" />
                </div>
                <div className="flex items-center justify-center rounded-md border border-line bg-panel p-6 sm:col-start-2 sm:row-start-2">
                  <div>
                    <Compass className="mx-auto h-6 w-6 text-accent" aria-hidden="true" />
                    <p className="mt-3 text-xl font-semibold text-ink">Leadership</p>
                  </div>
                </div>
                <div className="sm:col-start-3 sm:row-start-2">
                  <CompassLink direction="Platform" />
                </div>
                <div className="sm:col-start-2 sm:row-start-3">
                  <CompassLink direction="Trust" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-line" aria-labelledby="operating-principles-list-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Operating Principles" id="operating-principles-list-title" title="The heuristics behind my product decisions" />
            <div className="mt-8 grid gap-4">
              {operatingPrinciples.map((principle) => (
                <OperatingPrincipleCard key={principle.title} principle={principle} />
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-panel" aria-labelledby="evolution-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="How These Principles Evolved" id="evolution-title" title="Experience came first. Principles came later." />
            <div className="mt-8 grid gap-3">
              {principleEvolution.map((step, index) => (
                <div key={step}>
                  <div className="rounded-md border border-line bg-paper p-4 text-center font-semibold leading-7 text-ink">{step}</div>
                  {index < principleEvolution.length - 1 ? (
                    <div className="flex justify-center py-2 text-accent" aria-hidden="true">
                      <ArrowRight className="h-4 w-4 rotate-90" />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
            <p className="mt-8 max-w-3xl text-lg leading-8 text-muted">
              These principles emerged from experience rather than being predefined. Analytics taught me to look for signal. Payments taught me trust. Growth taught me leverage. Enterprise SaaS taught me adoption. AI platforms taught me foundations.
            </p>
          </div>
        </section>

        <section className="border-b border-line" aria-labelledby="joined-team-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <div className="rounded-md border border-line bg-panel p-6 shadow-soft">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Applying These Principles Today</p>
              <h2 id="joined-team-title" className="mt-3 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
                If I Joined Your Team Tomorrow
              </h2>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
                These principles are not retrospective observations. They are the same decision heuristics I would use on day one to evaluate product opportunities, prioritize roadmaps, align cross-functional teams, and scale customer value.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-panel" aria-labelledby="principle-matrix-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Where Each Principle Was Demonstrated" id="principle-matrix-title" title="Evidence mapped to operating philosophy" />
            <div className="mt-8 grid gap-4">
              {principleMatrix.map((row) => (
                <article key={row.principle} className="rounded-md border border-line bg-paper p-5">
                  <h3 className="text-xl font-semibold leading-tight text-ink">{row.principle}</h3>
                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <MatrixLink label="Primary Evidence" resource={row.primaryEvidence} />
                    <MatrixLink label="Supporting Evidence" resource={row.supportingEvidence} />
                    <div className="rounded-md border border-line bg-panel p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Example</p>
                      <p className="mt-3 leading-7 text-muted">{row.example}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line" aria-labelledby="continue-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Continue Exploring" id="continue-title" title="See the evidence behind the operating principles" />
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {operatingPrinciplesContinue.map((item) => (
                <TrackedPrincipleLink
                  key={item.title}
                  href={item.href}
                  label={item.title}
                  className="rounded-md border border-line bg-panel p-5 transition hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-paper"
                >
                  <Layers3 className="h-5 w-5 text-accent" aria-hidden="true" />
                  <h3 className="mt-5 text-xl font-semibold leading-tight text-ink">{item.title}</h3>
                  <p className="mt-3 leading-7 text-muted">{item.description}</p>
                  <p className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent">
                    Continue exploring
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </p>
                </TrackedPrincipleLink>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function CompassLink({ direction }: { direction: "Customer" | "Growth" | "Platform" | "Trust" }) {
  const item = leadershipCompass.find((compassItem) => compassItem.direction === direction);

  if (!item) {
    return null;
  }

  return (
    <TrackedPrincipleLink
      href={item.href}
      eventName="principle_evidence_clicked"
      label={item.label}
      className="block rounded-md border border-line bg-panel p-5 transition hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-paper"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{item.direction}</p>
      <p className="mt-2 text-xl font-semibold text-ink">{item.label}</p>
    </TrackedPrincipleLink>
  );
}

function MatrixLink({ label, resource }: { label: string; resource: { href: string; title: string } }) {
  return (
    <TrackedPrincipleLink
      href={resource.href}
      eventName="principle_evidence_clicked"
      label={resource.title}
      className="rounded-md border border-line bg-panel p-4 transition hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-paper"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{label}</p>
      <p className="mt-3 flex items-center gap-2 font-semibold leading-7 text-ink">
        <GitBranch className="h-4 w-4 text-accent" aria-hidden="true" />
        {resource.title}
      </p>
    </TrackedPrincipleLink>
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
