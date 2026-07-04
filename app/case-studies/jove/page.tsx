import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  ContinueExploring,
  DecisionHero,
  DecisionMatrix,
  ExecutiveSnapshot,
  ImpactDashboard,
  LeadershipPanel,
  ProductPrinciples,
  ReflectionSection,
  RelatedResources,
  TradeoffSection
} from "@/components/product-leadership-brief";
import { PlbSectionViewed, PlbViewed } from "@/components/product-leadership-brief-interactions";
import { SiteHeader } from "@/components/site-header";
import { getProductLeadershipBrief } from "@/data/product-leadership-briefs";

const brief = getProductLeadershipBrief("jove");

export const metadata: Metadata = {
  title: "JoVE Product Leadership Brief | Product Operating System",
  description:
    "A Product Leadership Brief about prioritizing workflow adoption over content expansion at JoVE, including discovery, trade-offs, strategy, execution, and measurable outcomes.",
  alternates: {
    canonical: "/case-studies/jove"
  },
  openGraph: {
    title: "JoVE Product Leadership Brief | Product Operating System",
    description:
      "How Saurabh prioritized workflow adoption over content expansion and connected product decisions to measurable business outcomes.",
    url: "https://saurabh-product-os.vercel.app/case-studies/jove",
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
    title: "JoVE Product Leadership Brief | Product Operating System",
    description:
      "How Saurabh prioritized workflow adoption over content expansion and connected product decisions to measurable business outcomes.",
    images: ["/og-image.png"]
  }
};

export default function JoveProductLeadershipBriefPage() {
  if (!brief) {
    notFound();
  }

  return (
    <>
      <PlbViewed company={brief.company} slug={brief.slug} />
      <SiteHeader />
      <main>
        <PlbSectionViewed eventName="decision_section_viewed" sectionName="The Decision" />
        <DecisionHero brief={brief} />
        <ExecutiveSnapshot items={brief.executiveSnapshot} />
        <LeadershipPanel id="situation" panel={brief.situation} />
        <LeadershipPanel id="complication" panel={brief.complication} />
        <LeadershipPanel id="question" panel={brief.question} />
        <LeadershipPanel id="discovery" panel={brief.discovery} />
        <DecisionMatrix options={brief.strategicOptions} />
        <LeadershipPanel id="product-decision" panel={brief.productDecision} />
        <LeadershipPanel id="product-strategy" panel={brief.productStrategy} />
        <LeadershipPanel id="execution" panel={brief.execution} />
        <TradeoffSection tradeoffs={brief.tradeoffs} />
        <ImpactDashboard categories={brief.impactDashboard} />
        <ReflectionSection reflection={brief.reflection} />
        <ProductPrinciples principles={brief.productPrinciples} />
        <RelatedResources resources={brief.relatedResources} />
        <ContinueExploring items={brief.continueExploring} />
      </main>
    </>
  );
}
