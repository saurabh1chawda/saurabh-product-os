import type { RecommendationPriority } from "@career-companion/product-intelligence";
import { immutableArray, immutableRecord } from "../shared";

export type ATSStage = "ATSPipeline" | "ATSParsing" | "ATSMatching" | "ATSScreening" | "ATSDecision";
export type ATSDecisionOutcome = "Pass" | "PassWithWarnings" | "ManualReview" | "Reject";
export type ATSGateType = "hard" | "soft" | "warning" | "manual-review";
export type ATSGateResult = "passed" | "failed" | "warning" | "manual-review";
export type ATSParsingStatus = "complete" | "partial" | "insufficient";
export type ATSReviewReason = "ambiguous-evidence" | "conflicting-evidence" | "insufficient-parsing" | "manual-policy" | "eligibility-unclear";

export interface ATSParsingPolicy {
  readonly policyId: string;
  readonly requiredSections: readonly string[];
  readonly knownSectionAliases: readonly SectionAlias[];
  readonly unsupportedStructureSignals: readonly string[];
}

export interface SectionAlias {
  readonly section: string;
  readonly aliases: readonly string[];
}

export interface ATSMatchingPolicy {
  readonly policyId: string;
  readonly aliasDictionary: readonly AliasEntry[];
  readonly requiredSkillThreshold: number;
  readonly preferredSkillThreshold: number;
}

export interface AliasEntry {
  readonly canonical: string;
  readonly aliases: readonly string[];
}

export interface ATSScreeningPolicy {
  readonly policyId: string;
  readonly minimumParsingConfidence: number;
  readonly minimumMatchScore: number;
  readonly minimumRequiredSkillCoverage: number;
  readonly minimumEvidenceCoverage: number;
  readonly manualReviewBelowConfidence: number;
  readonly explicitManualReview: boolean;
}

export interface ATSRecommendationPolicy {
  readonly defaultPriority: RecommendationPriority;
  readonly allowOptimizationText: false;
}

export function defaultParsingPolicy(): ATSParsingPolicy {
  return immutableRecord({
    policyId: "ats-parsing-policy:default",
    requiredSections: immutableArray(["summary", "experience", "skills"]),
    knownSectionAliases: immutableArray([
      { section: "summary", aliases: immutableArray(["summary", "profile", "professional summary"]) },
      { section: "experience", aliases: immutableArray(["experience", "work history", "employment"]) },
      { section: "skills", aliases: immutableArray(["skills", "technologies", "core skills"]) },
      { section: "education", aliases: immutableArray(["education", "academic"]) },
      { section: "certifications", aliases: immutableArray(["certification", "certifications"]) }
    ]),
    unsupportedStructureSignals: immutableArray(["image-only", "table-only", "scanned"])
  });
}

export function defaultMatchingPolicy(): ATSMatchingPolicy {
  return immutableRecord({
    policyId: "ats-matching-policy:default",
    requiredSkillThreshold: 80,
    preferredSkillThreshold: 40,
    aliasDictionary: immutableArray([
      { canonical: "ai", aliases: immutableArray(["ai", "artificial intelligence", "machine learning", "ml"]) },
      { canonical: "analytics", aliases: immutableArray(["analytics", "data analysis", "metrics", "measurement"]) },
      { canonical: "product strategy", aliases: immutableArray(["product strategy", "strategy", "roadmap"]) },
      { canonical: "leadership", aliases: immutableArray(["leadership", "led", "managed", "mentored"]) },
      { canonical: "payments", aliases: immutableArray(["payments", "fintech", "transactions"]) }
    ])
  });
}

export function defaultScreeningPolicy(input: Partial<ATSScreeningPolicy> = {}): ATSScreeningPolicy {
  return immutableRecord({
    policyId: input.policyId ?? "ats-screening-policy:default",
    minimumParsingConfidence: input.minimumParsingConfidence ?? 55,
    minimumMatchScore: input.minimumMatchScore ?? 65,
    minimumRequiredSkillCoverage: input.minimumRequiredSkillCoverage ?? 70,
    minimumEvidenceCoverage: input.minimumEvidenceCoverage ?? 55,
    manualReviewBelowConfidence: input.manualReviewBelowConfidence ?? 50,
    explicitManualReview: input.explicitManualReview ?? false
  });
}
