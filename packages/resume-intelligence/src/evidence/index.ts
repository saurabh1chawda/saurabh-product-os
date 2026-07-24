import { ResumeEvidenceSelector as DeterministicResumeEvidenceSelector } from "@career-companion/career-intelligence";
import type { EvidenceReferenceSnapshot } from "@career-companion/career-knowledge";
import type { ResumeEvidence } from "../models";

export class ResumeEvidenceSelector {
  constructor(private readonly selector = new DeterministicResumeEvidenceSelector()) {}

  select(input: {
    readonly evidence: readonly EvidenceReferenceSnapshot[];
    readonly limit?: number;
  }): readonly ResumeEvidence[] {
    return Object.freeze(
      this.selector.selectEvidence(input.evidence, input.limit).map((ranking) => Object.freeze({
        evidence: ranking.subject,
        rank: ranking.rank,
        score: ranking.score,
        confidence: ranking.confidence
      }))
    );
  }
}
