import { joveBrief } from "./jove";
import { logixBrief } from "./logix";
import { simplilearnBrief } from "./simplilearn";
import type { BriefSummary, ProductLeadershipBrief } from "./types";

export const productLeadershipBriefs: ProductLeadershipBrief[] = [joveBrief, logixBrief, simplilearnBrief];

export const productLeadershipBriefSummaries: BriefSummary[] = [
  {
    company: "JoVE",
    domain: "SaaS product strategy",
    roleFit: "Discovery & Enterprise SaaS",
    coreDecision: "Prioritized workflow adoption over content expansion.",
    businessImpact: "+30% portfolio revenue, +40% session duration, +15% page views.",
    readingTime: "10 min read",
    status: "Available",
    href: "/case-studies/jove"
  },
  {
    company: "Logix",
    domain: "AI products and platform strategy",
    roleFit: "AI Platforms & Modernization",
    coreDecision: "Modernized the platform before expanding visible AI capability.",
    businessImpact: "₹1M+ ARR, +20% MRR, +25% engagement, 3× delivery velocity.",
    readingTime: "12 min read",
    status: "Available",
    href: "/case-studies/logix"
  },
  {
    company: "Simplilearn",
    domain: "Growth and monetization",
    roleFit: "Growth & Product-Led Growth",
    coreDecision: "Optimized the funnel before scaling acquisition.",
    businessImpact: "10× revenue growth, 62% traffic-to-lead, 40% lead-to-customer.",
    readingTime: "12 min read",
    status: "Available",
    href: "/case-studies/simplilearn"
  },
  {
    company: "Mahindra Comviva",
    domain: "Payments and reliability",
    roleFit: "Payments & Reliability",
    coreDecision: "Reliability at transaction scale brief.",
    businessImpact: "10M+ monthly transactions and 94% CSAT.",
    readingTime: "Coming soon",
    status: "Coming Soon"
  }
];

export function getProductLeadershipBrief(slug: string) {
  return productLeadershipBriefs.find((brief) => brief.slug === slug);
}

export type {
  BriefMetric,
  BriefPanel,
  BriefSummary,
  ConstraintMapItem,
  DecisionOption,
  ImpactCategory,
  ProductLeadershipBrief,
  SignaturePrinciple,
  VisualFlow
} from "./types";
