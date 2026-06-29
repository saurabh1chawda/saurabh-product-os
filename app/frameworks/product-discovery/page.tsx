import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ArrowRight, ClipboardCheck, GitBranch, SearchCheck } from "lucide-react";

import { RelatedCapabilityNav } from "@/components/related-capability-nav";
import { SiteHeader } from "@/components/site-header";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = {
  title: "Product Discovery Framework",
  description:
    "A placeholder Product Discovery framework for the Customer Discovery capability bundle."
};

const relatedCapabilityLinks = [
  {
    label: "Framework",
    title: "Product Discovery",
    description: "Placeholder framework for validating product direction before build commitment.",
    href: "/frameworks/product-discovery"
  },
  {
    label: "Story",
    title: "JoVE Discovery Story",
    description: "Placeholder flagship story for customer discovery and SaaS product strategy.",
    href: "/stories/product-discovery-jove"
  },
  {
    label: "Artifact",
    title: "Discovery Memo",
    description: "Placeholder representative memo for discovery synthesis and decision framing.",
    href: "/artifacts/discovery-memo"
  },
  {
    label: "Artifact",
    title: "Opportunity Solution Tree",
    description: "Placeholder representative opportunity map for discovery options.",
    href: "/artifacts/opportunity-solution-tree"
  },
  {
    label: "Artifact",
    title: "Customer Interview Summary",
    description: "Placeholder representative summary for customer interview evidence.",
    href: "/artifacts/customer-interview-summary"
  }
];

const frameworkSteps = [
  "Clarify the customer problem",
  "Identify assumptions",
  "Gather customer evidence",
  "Map opportunities",
  "Compare solution paths",
  "Choose the smallest validation step"
];

export default function ProductDiscoveryFrameworkPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-line bg-panel" aria-labelledby="discovery-framework-title">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Customer Discovery</p>
              <h1 id="discovery-framework-title" className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
                Product Discovery Framework
              </h1>
              <p className="mt-6 max-w-3xl text-xl leading-8 text-ink">Supporting Principle: Validate before building.</p>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
                Placeholder framework for showing how customer evidence, opportunity quality, and explicit trade-offs shape product direction before delivery work begins.
              </p>
            </div>
          </div>
        </section>

        <TextSection
          eyebrow="Framework Purpose"
          icon={<SearchCheck className="h-6 w-6 text-accent" aria-hidden="true" />}
          title="Reduce the risk of building the wrong thing"
        >
          <p>
            Placeholder content for how this framework helps teams validate the problem, understand customer behavior, and decide whether an idea deserves build investment.
          </p>
          <p>
            Placeholder content for how the framework connects discovery evidence to product decisions, artifacts, and the broader Product Operating System.
          </p>
        </TextSection>

        <section className="border-b border-line bg-panel" aria-labelledby="discovery-steps-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Discovery Steps" id="discovery-steps-title" title="Placeholder discovery sequence" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {frameworkSteps.map((step, index) => (
                <article key={step} className="rounded-md border border-line bg-paper p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
                    {index + 1}
                  </div>
                  <h2 className="mt-5 text-xl font-semibold leading-tight text-ink">{step}</h2>
                  <p className="mt-3 leading-7 text-muted">Placeholder detail to be completed when the framework is finalized.</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line" aria-labelledby="framework-links-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Framework in Context" id="framework-links-title" title="How this connects to the discovery story" />
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              <article className="rounded-md border border-line bg-panel p-5">
                <GitBranch className="h-6 w-6 text-accent" aria-hidden="true" />
                <h2 className="mt-5 text-xl font-semibold text-ink">Discovery story</h2>
                <p className="mt-3 leading-7 text-muted">
                  Placeholder link to the JoVE customer discovery story where this framework will be shown through product decision evidence.
                </p>
                <ButtonLink href="/stories/product-discovery-jove" variant="inline" className="mt-5">
                  View story
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </ButtonLink>
              </article>
              <article className="rounded-md border border-line bg-panel p-5">
                <ClipboardCheck className="h-6 w-6 text-accent" aria-hidden="true" />
                <h2 className="mt-5 text-xl font-semibold text-ink">Product Operating System</h2>
                <p className="mt-3 leading-7 text-muted">
                  Placeholder link back to the operating principles and review habits that this discovery framework supports.
                </p>
                <ButtonLink href="/product-operating-system" variant="inline" className="mt-5">
                  View operating system
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </ButtonLink>
              </article>
            </div>
          </div>
        </section>

        <RelatedCapabilityNav links={relatedCapabilityLinks} />
      </main>
    </>
  );
}

function TextSection({
  children,
  eyebrow,
  icon,
  title
}: {
  children: ReactNode;
  eyebrow: string;
  icon: ReactNode;
  title: string;
}) {
  const headingId = `${eyebrow.toLowerCase().replaceAll(" ", "-")}-title`;

  return (
    <section className="border-b border-line" aria-labelledby={headingId}>
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
        <div>
          {icon}
          <SectionHeader eyebrow={eyebrow} id={headingId} title={title} />
        </div>
        <div className="space-y-5 text-lg leading-8 text-muted">{children}</div>
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
  title: string;
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
