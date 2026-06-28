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
  | "Stakeholder Memo";

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
    whyEyebrow?: string;
    whyTitle?: string;
    decisionTitle?: string;
    executionEyebrow?: string;
    executionTitle?: string;
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
  }>;
  relatedByCapability: Array<{
    title: string;
    tag: string;
    capability: CapabilityName;
    href: string;
  }>;
};
