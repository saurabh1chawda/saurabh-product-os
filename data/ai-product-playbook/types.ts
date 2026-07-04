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
