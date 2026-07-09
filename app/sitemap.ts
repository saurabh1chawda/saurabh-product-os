import type { MetadataRoute } from "next";

import { productLeadershipBriefSummaries } from "@/data/product-leadership-briefs";
import { getEvidenceArtifactSlugs } from "@/lib/artifacts";
import { getProductStorySlugs } from "@/lib/product-stories";

const siteUrl = "https://saurabh-product-os.vercel.app";

const staticRoutes = [
  "",
  "/executive",
  "/profile",
  "/contact",
  "/case-studies",
  "/decision-operating-system",
  "/product-leadership-operating-principles",
  "/ai-product-playbook",
  "/ai-product-principles",
  "/decision-systems/customer-discovery",
  "/decision-systems/validation-experimentation",
  "/decision-systems/ai-prioritization",
  "/decision-systems/build-vs-buy-ai",
  "/decision-systems/rag-vs-agent",
  "/decision-systems/ai-success-metrics",
  "/for-recruiters",
  "/for-hiring-managers",
  "/interview-companion",
  "/interview-readiness",
  "/recruiter-tour",
  "/start-here",
  "/frameworks/product-discovery",
  "/frameworks/product-prioritization",
  "/product-operating-system",
  "/executive-summary"
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    ...staticRoutes,
    ...productLeadershipBriefSummaries.flatMap((brief) => (brief.href ? [brief.href] : [])),
    ...getProductStorySlugs().map((slug) => `/stories/${slug}`),
    ...getEvidenceArtifactSlugs().map((slug) => `/artifacts/${slug}`)
  ];

  return Array.from(new Set(routes)).map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" || route === "/executive" ? "weekly" : "monthly",
    priority: getPriority(route)
  }));
}

function getPriority(route: string) {
  if (route === "") {
    return 1;
  }

  if (["/executive", "/profile", "/contact", "/case-studies"].includes(route)) {
    return 0.9;
  }

  if (route.startsWith("/case-studies/") || route.startsWith("/ai-product-playbook")) {
    return 0.8;
  }

  return 0.6;
}
