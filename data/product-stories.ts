import type { CapabilityName } from "@/data/capabilities";

export type EvidenceArtifactType =
  | "PRD"
  | "Roadmap"
  | "Wireframe"
  | "Dashboard"
  | "Experiment"
  | "User Journey"
  | "Architecture Diagram"
  | "Prioritization Matrix"
  | "Release Timeline"
  | "Stakeholder Memo"
  | "Payment Journey"
  | "Transaction Funnel"
  | "Reliability Dashboard"
  | "Failure Analysis"
  | "Sequence Diagram"
  | "User Interview Summary"
  | "Discovery Notes"
  | "Opportunity Solution Tree"
  | "Experiment Plan"
  | "Product Metrics Dashboard";

export type EvidenceArtifactStatus = "Published" | "Representative" | "Coming Soon";

export type ProductStory = {
  slug: string;
  metadata: {
    description: string;
  };
  primaryCapability: CapabilityName;
  secondaryCapability: CapabilityName;
  productPrinciple: string;
  principleSummary: string;
  principleCategory: CapabilityName;
  keyDecision: string;
  hiringQuestionsAnswered: string[];
  hero: {
    title: string;
    company: string;
    timeline: string;
    role: string;
    metric: string;
    metrics?: string[];
    summary: string;
    keyTakeaway: string;
  };
  sectionLabels?: {
    snapshotEyebrow?: string;
    snapshotTitle?: string;
    whyEyebrow?: string;
    whyTitle?: string;
    contextEyebrow?: string;
    contextTitle?: string;
    optionsEyebrow?: string;
    optionsTitle?: string;
    optionsDescription?: string;
    roleEyebrow?: string;
    roleTitle?: string;
    decisionTitle?: string;
    stakeholderEyebrow?: string;
    stakeholderTitle?: string;
    executionEyebrow?: string;
    executionTitle?: string;
    resultsEyebrow?: string;
    resultsTitle?: string;
    reflectionEyebrow?: string;
    reflectionTitle?: string;
    evidenceEyebrow?: string;
    evidenceTitle?: string;
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
  role?: string[];
  decision: string[];
  stakeholderAlignment?: Array<{
    label: string;
    description: string;
  }>;
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
  evidence: Array<{
    type: EvidenceArtifactType;
    title: string;
    preview: string;
    status: EvidenceArtifactStatus;
    description: string;
    href?: string;
  }>;
  relatedByCapability: Array<{
    title: string;
    tag: string;
    capability: CapabilityName;
    href: string;
  }>;
};
