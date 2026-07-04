import type { Metadata } from "next";

import { PlaybookViewed } from "@/components/ai-product-playbook-interactions";
import {
  ContinueExploring,
  FeaturedFrameworkCard,
  PlaybookHero,
  PlaybookPart,
  RelatedResourceCard,
  SectionHeader
} from "@/components/ai-product-playbook";
import { SiteHeader } from "@/components/site-header";
import { aiProductPlaybook } from "@/data/ai-product-playbook";

const pageDescription =
  "A practical AI Product Playbook by Saurabh Chawda for identifying AI opportunities, validating workflows, designing trustworthy AI experiences, measuring success, and scaling AI products responsibly.";
const pageUrl = "https://saurabh-product-os.vercel.app/ai-product-playbook";

export const metadata: Metadata = {
  title: "AI Product Playbook | Saurabh Chawda",
  description: pageDescription,
  alternates: {
    canonical: "/ai-product-playbook"
  },
  openGraph: {
    title: "AI Product Playbook | Saurabh Chawda",
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
    title: "AI Product Playbook | Saurabh Chawda",
    description: pageDescription,
    images: ["/og-image.png"]
  }
};

const breadcrumbs = [
  { name: "Product Operating System", item: "https://saurabh-product-os.vercel.app" },
  { name: "AI Product Playbook", item: pageUrl }
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

export default function AiProductPlaybookPage() {
  return (
    <>
      <PlaybookViewed name="AI Product Playbook" />
      <SiteHeader />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbJsonLd)
          }}
        />

        <PlaybookHero {...aiProductPlaybook.hero} />

        <section className="border-b border-line" aria-labelledby="playbook-overview-title">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-14 lg:px-10">
            <SectionHeader eyebrow="Operating Guide" id="playbook-overview-title" title="A practical structure for AI product judgment" />
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <article className="rounded-md border border-line bg-panel p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Identify</p>
                <h3 className="mt-3 text-xl font-semibold leading-tight text-ink">Find problems where AI should matter.</h3>
                <p className="mt-3 leading-7 text-muted">Start with workflow pain, data readiness, trust risk, and business value before choosing an AI approach.</p>
              </article>
              <article className="rounded-md border border-line bg-panel p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Validate</p>
                <h3 className="mt-3 text-xl font-semibold leading-tight text-ink">Reduce uncertainty before scaling.</h3>
                <p className="mt-3 leading-7 text-muted">Use focused experiments and measurable success criteria to decide whether to build, iterate, pause, or stop.</p>
              </article>
              <article className="rounded-md border border-line bg-panel p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Scale</p>
                <h3 className="mt-3 text-xl font-semibold leading-tight text-ink">Measure outcomes beyond model quality.</h3>
                <p className="mt-3 leading-7 text-muted">Connect AI performance to customer outcomes, workflow adoption, trust, economics, and durable business impact.</p>
              </article>
            </div>
          </div>
        </section>

        <div id="playbook-parts" className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          {aiProductPlaybook.parts.map((part) => (
            <PlaybookPart key={part.id} part={part} />
          ))}
        </div>

        <section className="border-b border-line bg-panel" aria-labelledby="featured-frameworks-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="Featured Frameworks" id="featured-frameworks-title" title="Original frameworks being shaped inside Product OS" />
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {aiProductPlaybook.featuredFrameworks.map((framework) => (
                <FeaturedFrameworkCard key={framework.title} framework={framework} />
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-panel" aria-labelledby="related-product-os-title">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
            <SectionHeader eyebrow="How This Connects To Product OS" id="related-product-os-title" title="Move from playbook architecture into evidence" />
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {aiProductPlaybook.relatedResources.map((resource) => (
                <RelatedResourceCard key={resource.title} resource={resource} />
              ))}
            </div>
          </div>
        </section>

        <ContinueExploring items={aiProductPlaybook.continueExploring} />
      </main>
    </>
  );
}
