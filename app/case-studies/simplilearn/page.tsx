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

const brief = getProductLeadershipBrief("simplilearn");

export const metadata: Metadata = {
  title: "Scaling Growth Through Product-Led Optimization | Product Leadership Brief | Saurabh Chawda",
  description:
    "How funnel optimization, experimentation, referral systems, and product-led growth transformed a ₹1M portfolio into a ₹10M business while improving conversion efficiency and engineering velocity.",
  alternates: {
    canonical: "/case-studies/simplilearn"
  },
  openGraph: {
    title: "Scaling Growth Through Product-Led Optimization | Product Leadership Brief | Saurabh Chawda",
    description:
      "How funnel optimization, experimentation, referral systems, and product-led growth transformed a ₹1M portfolio into a ₹10M business while improving conversion efficiency and engineering velocity.",
    url: "https://saurabh-product-os.vercel.app/case-studies/simplilearn",
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
    title: "Scaling Growth Through Product-Led Optimization | Product Leadership Brief | Saurabh Chawda",
    description:
      "How funnel optimization, experimentation, referral systems, and product-led growth transformed a ₹1M portfolio into a ₹10M business while improving conversion efficiency and engineering velocity.",
    images: ["/og-image.png"]
  }
};

export default function SimplilearnProductLeadershipBriefPage() {
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
        {brief.constraintMapping ? (
          <ConstraintMapping
            eventName="growth_constraint_mapping_viewed"
            eyebrow="Growth Constraint Mapping"
            id="growth-constraint-mapping"
            items={brief.constraintMapping}
            title="Growth was constrained by conversion system quality, not demand alone."
          />
        ) : null}
        <LeadershipPanel id="product-decision" panel={brief.productDecision} />
        <LeadershipPanel id="product-strategy" panel={brief.productStrategy} />
        {brief.visualSections?.map((flow, index) => (
          <VisualFlowSection
            key={flow.id}
            flow={flow}
            variant={index === 0 ? "linear" : "cycle"}
          />
        ))}
        <LeadershipPanel id="execution" panel={brief.execution} />
        <TradeoffSection tradeoffs={brief.tradeoffs} />
        <ImpactDashboard
          categories={brief.impactDashboard}
          eventName="growth_metrics_viewed"
          eyebrow="Growth Metrics Dashboard"
          id="growth-metrics-dashboard"
          title="What changed after the growth system improved"
        />
        {brief.stakeholderAlignment ? <LeadershipPanel id="stakeholder-alignment" panel={brief.stakeholderAlignment} /> : null}
        <ReflectionSection reflection={brief.reflection} />
        {brief.signaturePrinciple ? <SignaturePrincipleSection principle={brief.signaturePrinciple} /> : null}
        {brief.leadershipToday ? <LeadershipPanel id="leadership-today" panel={brief.leadershipToday} /> : null}
        <ProductPrinciples principles={brief.productPrinciples} />
        <RelatedResources resources={brief.relatedResources} />
        <ContinueExploring items={brief.continueExploring} />
      </main>
    </>
  );
}
