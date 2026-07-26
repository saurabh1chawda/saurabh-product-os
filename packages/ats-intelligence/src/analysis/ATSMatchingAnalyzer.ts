import {
  createGapClassification,
  createRankingReason,
  createScoreBreakdown,
  createScoreContribution,
  createScoreDimension,
  createScorePenalty
} from "@career-companion/product-intelligence";
import { ATSMatchingArtifactBuilder } from "../builders";
import type { ATSMatching, ATSParsing, ATSRequirementMatch } from "../models";
import { average, confidenceFromScore, immutableArray, immutableRecord, includesAlias, normalizeText, scoreBand, uniqueSorted } from "../shared";

export class ATSMatchingAnalyzer {
  private readonly artifactBuilder = new ATSMatchingArtifactBuilder();

  analyze(parsing: ATSParsing): ATSMatching {
    const job = parsing.jobContext.jobModel;
    const parsedText = [
      ...parsing.skills,
      ...parsing.competencies,
      ...parsing.achievements,
      ...parsing.quantifiedEvidence,
      ...parsing.roles,
      ...parsing.companies
    ].join(" ");
    const requiredSkillMatches = job.requiredSkills.map((skill) => requirementMatch(skill.skillId, "required-skill", skill.name, parsedText, parsing.matchingPolicy.aliasDictionary));
    const preferredSkillMatches = job.preferredSkills.map((skill) => requirementMatch(skill.skillId, "preferred-skill", skill.name, parsedText, parsing.matchingPolicy.aliasDictionary));
    const responsibilityMatches = job.responsibilities.map((responsibility) => requirementMatch(responsibility.responsibilityId, "responsibility", responsibility.statement, parsedText, parsing.matchingPolicy.aliasDictionary));
    const competencyMatches = job.requiredCompetencies.map((competency) => requirementMatch(competency.competencyId, "competency", competency.name, parsedText, parsing.matchingPolicy.aliasDictionary));
    const evidenceMatches = job.evidenceExpectations.map((expectation) => requirementMatch(expectation.expectationId, "evidence", expectation.evidenceType, parsedText, parsing.matchingPolicy.aliasDictionary));
    const educationMatches = job.educationExpectations.map((expectation, index) => requirementMatch(`education:${index}`, "education", expectation, parsing.education.join(" "), parsing.matchingPolicy.aliasDictionary));
    const certificationMatches = job.certificationExpectations.map((expectation, index) => requirementMatch(`certification:${index}`, "certification", expectation, parsing.certifications.join(" "), parsing.matchingPolicy.aliasDictionary));
    const roleMatch = requirementMatch("role", "role", job.role.classification, parsing.roles.join(" "), parsing.matchingPolicy.aliasDictionary);
    const seniorityMatch = requirementMatch("seniority", "seniority", job.seniority.classification, parsing.roles.join(" "), parsing.matchingPolicy.aliasDictionary);
    const functionMatch = requirementMatch("function", "function", job.function.classification, parsedText, parsing.matchingPolicy.aliasDictionary);
    const domainMatch = requirementMatch("domain", "domain", job.domain.classification, parsedText, parsing.matchingPolicy.aliasDictionary);
    const businessMatches = job.businessObjectives.map((objective) => requirementMatch(objective.objectiveId, "responsibility", objective.statement, parsedText, parsing.matchingPolicy.aliasDictionary));
    const allMatches = immutableArray([
      ...requiredSkillMatches,
      ...preferredSkillMatches,
      ...responsibilityMatches,
      ...competencyMatches,
      ...evidenceMatches,
      ...educationMatches,
      ...certificationMatches,
      roleMatch,
      seniorityMatch,
      functionMatch,
      domainMatch,
      ...businessMatches
    ]);
    const dimensions = {
      requiredSkillCoverage: dimension("Required Skill Coverage", requiredSkillMatches, 0.16),
      preferredSkillCoverage: dimension("Preferred Skill Coverage", preferredSkillMatches, 0.05),
      responsibilityCoverage: dimension("Responsibility Coverage", responsibilityMatches, 0.1),
      competencyCoverage: dimension("Competency Coverage", competencyMatches, 0.14),
      roleAlignment: createScoreDimension({ dimension: "Role Alignment", score: roleMatch.score, weight: 0.07, rationale: "Role alignment uses canonical JobModel role classification." }),
      seniorityAlignment: createScoreDimension({ dimension: "Seniority Alignment", score: seniorityMatch.score, weight: 0.07, rationale: "Seniority alignment uses canonical JobModel seniority classification." }),
      functionAlignment: createScoreDimension({ dimension: "Function Alignment", score: functionMatch.score, weight: 0.06, rationale: "Function alignment uses canonical JobModel function classification." }),
      domainAlignment: createScoreDimension({ dimension: "Domain Alignment", score: domainMatch.score, weight: 0.06, rationale: "Domain alignment uses canonical JobModel domain classification." }),
      experienceAlignment: createScoreDimension({ dimension: "Experience Alignment", score: parsing.roles.length > 0 ? 80 : 25, weight: 0.06, rationale: "Experience alignment requires parsed role evidence." }),
      educationAlignment: dimension("Education Alignment", educationMatches, 0.04),
      certificationAlignment: dimension("Certification Alignment", certificationMatches, 0.04),
      businessObjectiveAlignment: dimension("Business Objective Alignment", businessMatches, 0.07),
      evidenceExpectationCoverage: dimension("Evidence Expectation Coverage", evidenceMatches, 0.06),
      quantifiedImpactCoverage: createScoreDimension({ dimension: "Quantified Impact Coverage", score: parsing.quantifiedEvidence.length > 0 ? 85 : 30, weight: 0.08, rationale: "Quantified impact requires parsed metric evidence." })
    };
    const scoreDimensions = immutableArray(Object.values(dimensions));
    const overallScore = Math.round(scoreDimensions.reduce((sum, item) => sum + item.score * item.weight, 0) / scoreDimensions.reduce((sum, item) => sum + item.weight, 0));
    const missingRequiredEvidence = uniqueSorted(allMatches.filter((match) => !match.matched && (match.requirementType === "required-skill" || match.requirementType === "education" || match.requirementType === "certification")).map((match) => match.label));
    const gaps = immutableArray(allMatches.filter((match) => !match.matched).map((match) => createGapClassification({
      gapId: `ats-gap:${match.requirementId}`,
      gapType: match.label,
      severity: match.requirementType === "required-skill" ? "high" : "medium",
      priority: match.requirementType === "required-skill" ? "critical" : "high",
      rationale: `No deterministic evidence matched ${match.label}.`
    })));
    const scoreBreakdown = createScoreBreakdown({
      overallScore,
      band: scoreBand(overallScore),
      dimensions: scoreDimensions,
      contributions: scoreDimensions.map((item) => createScoreContribution({ source: item.dimension, amount: item.score, rationale: item.rationale })),
      penalties: gaps.map((gap) => createScorePenalty({ code: gap.gapType, amount: gap.severity === "high" ? 10 : 5, severity: gap.severity, rationale: gap.rationale }))
    });
    const partial = immutableRecord({
      artifactKind: "ATSMatching" as const,
      matchingId: `ats-matching:${parsing.parsingId}`,
      parsingId: parsing.parsingId,
      jobContext: parsing.jobContext,
      screeningPolicy: parsing.screeningPolicy,
      ...dimensions,
      requirementMatches: allMatches,
      missingRequiredEvidence,
      contradictoryEvidence: immutableArray(parsing.ambiguousFields),
      confidence: confidenceFromScore(Math.round(average([overallScore, parsing.confidence.value * 100])), "Matching confidence follows parse confidence and coverage."),
      scoreBreakdown,
      gaps,
      decisionTrace: parsing.decisionTrace
    });
    const built = this.artifactBuilder.build(partial);

    return immutableRecord({ ...partial, ...built });
  }
}

function requirementMatch(id: string, type: ATSRequirementMatch["requirementType"], label: string, parsedText: string, aliases: readonly { readonly canonical: string; readonly aliases: readonly string[] }[]): ATSRequirementMatch {
  const normalizedLabel = normalizeText(label);
  const aliasEntry = aliases.find((entry) => normalizedLabel.includes(normalizeText(entry.canonical)) || normalizeText(entry.canonical).includes(normalizedLabel));
  const candidateAliases = aliasEntry?.aliases ?? [label];
  const matched = includesAlias(parsedText, candidateAliases) || normalizeText(parsedText).includes(normalizedLabel);
  return immutableRecord({
    requirementId: id,
    requirementType: type,
    label,
    matched,
    score: matched ? 100 : 0,
    evidence: immutableArray(matched ? [label] : []),
    missingEvidence: immutableArray(matched ? [] : [label]),
    rankingReason: createRankingReason({
      code: `ats-match:${id}`,
      statement: matched ? `${label} matched by deterministic alias policy.` : `${label} did not match deterministic alias policy.`,
      weight: matched ? 1 : 0
    })
  });
}

function dimension(name: string, matches: readonly ATSRequirementMatch[], weight: number) {
  const score = matches.length === 0 ? 100 : Math.round(average(matches.map((match) => match.score)));
  return createScoreDimension({ dimension: name, score, weight, rationale: `${name} uses deterministic exact and alias matching.` });
}
