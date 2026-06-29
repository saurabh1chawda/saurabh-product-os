import type { RelatedCapabilityLink } from "@/data/capability-links";

export type ArtifactType =
  | "Product Requirements Document (PRD)"
  | "Roadmap"
  | "Dashboard"
  | "Experiment Plan"
  | "User Research"
  | "Opportunity Solution Tree"
  | "Architecture Diagram"
  | "Wireframes";

export type EvidenceArtifact = {
  slug: string;
  metadata: {
    description: string;
  };
  type: ArtifactType;
  title: string;
  subtitle: string;
  company: string;
  context: string[];
  preview: Array<{
    label: string;
    value: string;
  }>;
  keyDecisions: string[];
  download: {
    label: string;
    href: string;
    status: string;
  };
  relatedStory: {
    title: string;
    href: string;
  };
  operatingSystem?: {
    title: string;
    href: string;
  };
  relatedCapability?: RelatedCapabilityLink[];
  disclaimer: string;
};
