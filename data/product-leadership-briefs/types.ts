export type ProductLeadershipBriefStatus = "Available" | "Coming Soon" | "In Progress";

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
  benefits?: string[];
  decision?: string;
  description: string;
  risks?: string[];
  tradeoff: string;
  selected?: boolean;
};

export type ImpactCategory = {
  title: string;
  metrics: BriefMetric[];
  note: string;
};

export type ConstraintMapItem = {
  constraint: string;
  businessImpact: string;
  decision: string;
};

export type VisualFlow = {
  eyebrow: string;
  id: string;
  title: string;
  description: string;
  steps: string[];
};

export type SignaturePrinciple = {
  quote: string;
  supportingCopy?: string;
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
  constraintMapping?: ConstraintMapItem[];
  productDecision: BriefPanel;
  productStrategy: BriefPanel;
  architectureEvolution?: VisualFlow;
  platformFlywheel?: VisualFlow;
  execution: BriefPanel;
  tradeoffs: Array<{
    decision: string;
    tradeoff: string;
    leadershipSignal: string;
  }>;
  impactDashboard: ImpactCategory[];
  stakeholderAlignment?: BriefPanel;
  reflection: Array<{
    prompt: string;
    response: string;
  }>;
  signaturePrinciple?: SignaturePrinciple;
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
