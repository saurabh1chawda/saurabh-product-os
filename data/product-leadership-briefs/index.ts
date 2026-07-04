import { joveBrief } from "./jove";
import type { BriefSummary, ProductLeadershipBrief } from "./types";

export const productLeadershipBriefs: ProductLeadershipBrief[] = [joveBrief];

export const productLeadershipBriefSummaries: BriefSummary[] = [
  {
    company: "JoVE",
    domain: "SaaS product strategy",
    coreDecision: "Prioritized workflow adoption over content expansion.",
    businessImpact: "+30% portfolio revenue, +40% session duration, +15% page views.",
    readingTime: "10 min read",
    status: "Available",
    href: "/case-studies/jove"
  },
  {
    company: "Logix",
    domain: "AI products and platform strategy",
    coreDecision: "Modernization and growth system brief.",
    businessImpact: "₹1M+ ARR and platform engagement outcomes.",
    readingTime: "Coming soon",
    status: "Coming Soon"
  },
  {
    company: "Simplilearn",
    domain: "Growth and monetization",
    coreDecision: "Job Guarantee revenue growth brief.",
    businessImpact: "10× revenue growth.",
    readingTime: "Coming soon",
    status: "Coming Soon"
  },
  {
    company: "Mahindra Comviva",
    domain: "Payments and reliability",
    coreDecision: "Reliability at transaction scale brief.",
    businessImpact: "10M+ monthly transactions and 94% CSAT.",
    readingTime: "Coming soon",
    status: "Coming Soon"
  }
];

export function getProductLeadershipBrief(slug: string) {
  return productLeadershipBriefs.find((brief) => brief.slug === slug);
}

export type { BriefMetric, BriefPanel, BriefSummary, DecisionOption, ImpactCategory, ProductLeadershipBrief } from "./types";
