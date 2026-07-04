export type ProductLeadershipBriefStatus = "Available" | "Coming Soon";

export type BriefMetric = {
  label: string;
  value: string;
};

export type BriefSummary = {
  businessImpact: string;
  company: string;
  coreDecision: string;
  domain: string;
  href?: string;
  readingTime: string;
  status: ProductLeadershipBriefStatus;
};

export type BriefPanel = {
  eyebrow: string;
  title: string;
  body: string[];
  bullets?: string[];
};

export type DecisionOption = {
  label: string;
  title: string;
  description: string;
  tradeoff: string;
  selected?: boolean;
};

export type ImpactCategory = {
  title: string;
  metrics: BriefMetric[];
  note: string;
};

export type ProductLeadershipBrief = BriefSummary & {
  slug: string;
  hero: {
    headline: string;
    supportingCopy: string[];
    kpis: BriefMetric[];
  };
  executiveSnapshot: Array<{
    label: string;
    value: string;
  }>;
  situation: BriefPanel;
  complication: BriefPanel;
  question: BriefPanel;
  discovery: BriefPanel;
  strategicOptions: DecisionOption[];
  productDecision: BriefPanel;
  productStrategy: BriefPanel;
  execution: BriefPanel;
  tradeoffs: Array<{
    decision: string;
    tradeoff: string;
    leadershipSignal: string;
  }>;
  impactDashboard: ImpactCategory[];
  reflection: Array<{
    prompt: string;
    response: string;
  }>;
  productPrinciples: Array<{
    title: string;
    description: string;
  }>;
  relatedResources: Array<{
    title: string;
    description: string;
    href: string;
  }>;
  continueExploring: Array<{
    title: string;
    description: string;
    href: string;
  }>;
};
