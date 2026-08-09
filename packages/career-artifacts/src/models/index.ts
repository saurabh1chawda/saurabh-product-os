import type { Confidence, RecommendationScore } from "@career-companion/career-intelligence";
import type { EvidenceReferenceSnapshot } from "@career-companion/career-knowledge";
import type { Alternative } from "@career-companion/decision-model";
import type { ExplanationSummary } from "@career-companion/explainability";
import type { DomainMetadata, DomainTimestamp, Version } from "@career-companion/kernel";

export type ArtifactType =
  | "Resume"
  | "Portfolio"
  | "LinkedIn"
  | "InterviewGuide"
  | "CoverLetter"
  | "CareerReport"
  | "RecruiterBrief"
  | "JobMatchReport";

export interface ArtifactOrdering {
  readonly order: number;
  readonly group?: string;
  readonly priority?: number;
}

export interface ArtifactReference {
  readonly referenceId: string;
  readonly referenceType: string;
  readonly label?: string;
  readonly version?: Version;
}

export interface ArtifactMetadata {
  readonly artifactId: string;
  readonly artifactType: ArtifactType;
  readonly title: string;
  readonly createdAt: DomainTimestamp;
  readonly source: string;
  readonly version: Version;
  readonly references: readonly ArtifactReference[];
  readonly metadata?: DomainMetadata;
}

export interface ArtifactEvidence {
  readonly evidence: EvidenceReferenceSnapshot;
  readonly reference: ArtifactReference;
  readonly confidence: Confidence;
  readonly score: RecommendationScore;
}

export interface ArtifactExplanation {
  readonly explanationSummary: ExplanationSummary;
  readonly confidence: Confidence;
  readonly decisionTraceReference: string;
  readonly acceptedAlternative?: Alternative;
  readonly rejectedAlternatives: readonly Alternative[];
}

export interface ArtifactScore {
  readonly value: number;
  readonly scale: "zero-to-one" | "zero-to-one-hundred" | "ordinal";
  readonly label?: string;
}

export interface ArtifactAnnotation {
  readonly annotationId: string;
  readonly annotationType: "evidence" | "explanation" | "warning" | "review" | "metadata";
  readonly text: string;
  readonly references: readonly ArtifactReference[];
}

export interface ArtifactFragment<TContent = unknown> {
  readonly fragmentId: string;
  readonly fragmentType: string;
  readonly content: TContent;
  readonly ordering: ArtifactOrdering;
  readonly references: readonly ArtifactReference[];
  readonly annotations: readonly ArtifactAnnotation[];
}

export interface ArtifactBlock<TContent = unknown> {
  readonly blockId: string;
  readonly blockType: string;
  readonly title?: string;
  readonly content: TContent;
  readonly ordering: ArtifactOrdering;
  readonly fragments: readonly ArtifactFragment[];
  readonly evidence: readonly ArtifactEvidence[];
  readonly explanation?: ArtifactExplanation;
  readonly confidence: Confidence;
  readonly decisionTraceReference: string;
  readonly acceptedAlternative?: Alternative;
  readonly rejectedAlternatives: readonly Alternative[];
  readonly annotations: readonly ArtifactAnnotation[];
  readonly score?: ArtifactScore;
}

export interface ArtifactSection<TContent = unknown> {
  readonly sectionId: string;
  readonly sectionType: string;
  readonly title: string;
  readonly order: number;
  readonly ordering: ArtifactOrdering;
  readonly blocks: readonly ArtifactBlock[];
  readonly content: TContent;
}

export interface ArtifactSummary {
  readonly headline: string;
  readonly summary: string;
  readonly score?: ArtifactScore;
  readonly references: readonly ArtifactReference[];
}

export interface CareerArtifact {
  readonly artifactId: string;
  readonly artifactType: ArtifactType;
  readonly metadata: ArtifactMetadata;
  readonly summary: ArtifactSummary;
  readonly sections: readonly ArtifactSection[];
  readonly score?: ArtifactScore;
  readonly explanation?: ArtifactExplanation;
}

export function createCareerArtifact(input: CareerArtifact): CareerArtifact {
  return immutableRecord({
    ...input,
    sections: immutableArray(input.sections),
    metadata: createArtifactMetadata(input.metadata),
    summary: createArtifactSummary(input.summary)
  });
}

export function createArtifactSection<TContent>(input: ArtifactSection<TContent>): ArtifactSection<TContent> {
  return immutableRecord({
    ...input,
    ordering: createArtifactOrdering(input.ordering),
    blocks: immutableArray(input.blocks)
  });
}

export function createArtifactBlock<TContent>(input: ArtifactBlock<TContent>): ArtifactBlock<TContent> {
  return immutableRecord({
    ...input,
    ordering: createArtifactOrdering(input.ordering),
    fragments: immutableArray(input.fragments),
    evidence: immutableArray(input.evidence),
    rejectedAlternatives: immutableArray(input.rejectedAlternatives),
    annotations: immutableArray(input.annotations)
  });
}

export function createArtifactFragment<TContent>(input: ArtifactFragment<TContent>): ArtifactFragment<TContent> {
  return immutableRecord({
    ...input,
    ordering: createArtifactOrdering(input.ordering),
    references: immutableArray(input.references),
    annotations: immutableArray(input.annotations)
  });
}

export function createArtifactMetadata(input: ArtifactMetadata): ArtifactMetadata {
  return immutableRecord({
    ...input,
    references: immutableArray(input.references)
  });
}

export function createArtifactSummary(input: ArtifactSummary): ArtifactSummary {
  return immutableRecord({
    ...input,
    references: immutableArray(input.references)
  });
}

export function createArtifactOrdering(input: ArtifactOrdering): ArtifactOrdering {
  return immutableRecord(input);
}

export function createArtifactReference(input: ArtifactReference): ArtifactReference {
  return immutableRecord(input);
}

export function createArtifactEvidence(input: ArtifactEvidence): ArtifactEvidence {
  return immutableRecord(input);
}

export function createArtifactExplanation(input: ArtifactExplanation): ArtifactExplanation {
  return immutableRecord({
    ...input,
    rejectedAlternatives: immutableArray(input.rejectedAlternatives)
  });
}

export function createArtifactScore(input: ArtifactScore): ArtifactScore {
  return immutableRecord(input);
}

export function createArtifactAnnotation(input: ArtifactAnnotation): ArtifactAnnotation {
  return immutableRecord({
    ...input,
    references: immutableArray(input.references)
  });
}

export function immutableArray<T>(items: readonly T[]): readonly T[] {
  return Object.freeze([...items]);
}

export function immutableRecord<T extends object>(record: T): Readonly<T> {
  return Object.freeze({ ...record });
}
