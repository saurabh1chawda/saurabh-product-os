export type ProductStory = {
  slug: string;
  metadata: {
    description: string;
  };
  hero: {
    title: string;
    company: string;
    timeline: string;
    role: string;
    metric: string;
    summary: string;
    keyTakeaway: string;
  };
  snapshot: Array<{
    label: string;
    value: string;
  }>;
  whyItMattered: string[];
  context: Array<{
    label: string;
    description: string;
  }>;
  options: Array<{
    label: string;
    title: string;
    description: string;
    tradeoff: string;
    chosen?: boolean;
  }>;
  decisionFramework: {
    explanation: string;
    criteria: Array<{
      label: string;
      score: number;
    }>;
  };
  decisionFlow: string[];
  decision: string[];
  timeline: Array<{
    step: string;
    title: string;
    description: string;
  }>;
  results: Array<{
    label: string;
    outcomes: string[];
  }>;
  reflection: Array<{
    question: string;
    answer: string;
  }>;
  beyondProject: string;
  evidence: Array<{
    title: string;
    description: string;
  }>;
  relatedStories: Array<{
    title: string;
    tag: string;
    href: string;
  }>;
};
