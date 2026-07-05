import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  ConstraintMapping,
  ContinueExploring,
  DecisionHero,
  DecisionMatrix,
  ExecutiveSnapshot,
  ImpactDashboard,
  LeadershipPanel,
  ProductPrinciples,
  ReflectionSection,
  RelatedResources,
  SignaturePrincipleSection,
  TradeoffSection,
  VisualFlowSection
} from "@/components/product-leadership-brief";
import { PlbSectionViewed, PlbViewed } from "@/components/product-leadership-brief-interactions";
import { SiteHeader } from "@/components/site-header";
import { getProductLeadershipBrief } from "@/data/product-leadership-briefs";

const brief = getProductLeadershipBrief("logix");

export const metadata: Metadata = {
  title: "Building an AI-Ready Platform | Product Leadership Brief | Saurabh Chawda",
  description:
    "How platform modernization, mobile-first strategy, and product sequencing created the foundation for scalable AI capabilities, measurable customer value, and commercial growth.",
  alternates: {
    canonical: "/case-studies/logix"
  },
  openGraph: {
    title: "Building an AI-Ready Platform | Product Leadership Brief | Saurabh Chawda",
    description:
      "How platform modernization, mobile-first strategy, and product sequencing created the foundation for scalable AI capabilities, measurable customer value, and commercial growth.",
    url: "https://saurabh-product-os.vercel.app/case-studies/logix",
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
    title: "Building an AI-Ready Platform | Product Leadership Brief | Saurabh Chawda",
    description:
      "How platform modernization, mobile-first strategy, and product sequencing created the foundation for scalable AI capabilities, measurable customer value, and commercial growth.",
    images: ["/og-image.png"]
  }
};

export default function LogixProductLeadershipBriefPage() {
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
        {brief.constraintMapping ? <ConstraintMapping items={brief.constraintMapping} /> : null}
        <LeadershipPanel id="product-decision" panel={brief.productDecision} />
        <LeadershipPanel id="product-strategy" panel={brief.productStrategy} />
        {brief.architectureEvolution ? <VisualFlowSection flow={brief.architectureEvolution} /> : null}
        {brief.platformFlywheel ? <VisualFlowSection flow={brief.platformFlywheel} variant="cycle" /> : null}
        <LeadershipPanel id="execution" panel={brief.execution} />
        <TradeoffSection tradeoffs={brief.tradeoffs} />
        <ImpactDashboard categories={brief.impactDashboard} />
        {brief.stakeholderAlignment ? <LeadershipPanel id="stakeholder-alignment" panel={brief.stakeholderAlignment} /> : null}
        <ReflectionSection reflection={brief.reflection} />
        {brief.signaturePrinciple ? <SignaturePrincipleSection principle={brief.signaturePrinciple} /> : null}
        <ProductPrinciples principles={brief.productPrinciples} />
        <RelatedResources resources={brief.relatedResources} />
        <ContinueExploring items={brief.continueExploring} />
      </main>
    </>
  );
}
