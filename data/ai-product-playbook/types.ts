export type PlaybookStatus = "Coming Soon" | "In Progress";

export type PlaybookFramework = {
  category?: string;
  description: string;
  href?: string;
  status: PlaybookStatus;
  title: string;
};

export type PlaybookPart = {
  description: string;
  frameworks: PlaybookFramework[];
  id: string;
  title: string;
};

export type PlaybookResource = {
  cta: string;
  description: string;
  href: string;
  status?: PlaybookStatus;
  title: string;
};

export type PlaybookContinueItem = {
  description: string;
  href: string;
  status?: PlaybookStatus;
  title: string;
};

export type StudioStepId = "customer-problem" | "ai-opportunity" | "automation-depth" | "trust" | "recommendation";

export type StudioField = {
  description: string;
  title: string;
};

export type StudioCriterion = {
  description: string;
  title: string;
};

export type AutomationLadderItem = {
  description: string;
  id: string;
  isDefault?: boolean;
  level: string;
  title: string;
};

export type TrustChecklistItem = {
  description: string;
  title: string;
};

export type StudioRecommendation = {
  aiFit: string;
  architecture: string;
  nextStep: string;
  primaryRisks: string[];
  successMetrics: string[];
  trustModel: string;
};

export type StudioRelatedEvidence = {
  cta: string;
  description: string;
  href: string;
  title: string;
};

export type StudioStep = {
  criteria?: StudioCriterion[];
  decisionFactors?: string[];
  fields?: StudioField[];
  framework?: string;
  guidance?: string;
  id: StudioStepId;
  output: string;
  outputExamples?: string[];
  purpose: string;
  question?: string;
  status: string;
  step: string;
  title: string;
};

export type AIProductStudioData = {
  automationLadder: AutomationLadderItem[];
  relatedEvidence: StudioRelatedEvidence[];
  recommendation: StudioRecommendation;
  steps: StudioStep[];
  subtitle: string;
  title: string;
  trustChecklist: TrustChecklistItem[];
};

export type AiProductPlaybook = {
  featuredFrameworks: PlaybookFramework[];
  hero: {
    headline: string;
    primaryCta: {
      href: string;
      label: string;
    };
    secondaryCta: {
      href: string;
      label: string;
    };
    supportingCopy: string;
    title: string;
  };
  parts: PlaybookPart[];
  relatedResources: PlaybookResource[];
  continueExploring: PlaybookContinueItem[];
};
