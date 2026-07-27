import { createOpportunityExplanationSummary } from "../explainability";
import type { CandidateFit, MarketAnalysis } from "../models";
import { confidenceFromScore, immutableRecord, textMatch } from "../shared";
import { breakdown, dimension, gapsFromDimensions } from "./scoring";

export class CandidateFitAnalyzer {
  analyze(market: MarketAnalysis): CandidateFit {
    const resumeText = [
      market.resume.summary.headline,
      market.resume.summary.summary,
      ...market.resume.skills.skills.map((skill) => skill.name),
      ...market.resume.skills.technologies.map((technology) => technology.name),
      ...market.resume.skills.competencies.map((competency) => competency.name),
      ...market.resume.experience.flatMap((experience) => [experience.employment.roleTitle, ...experience.achievements.map((achievement) => achievement.title)])
    ].join(" ");
    const jobText = [
      market.jobModel.role.classification,
      market.jobModel.domain.classification,
      market.jobModel.function.classification,
      ...market.jobModel.requiredSkills.map((skill) => skill.name),
      ...market.jobModel.requiredCompetencies.map((competency) => competency.name),
      ...market.jobModel.responsibilities.map((responsibility) => responsibility.statement)
    ].join(" ");
    const candidateSignals = [
      ...market.jobModel.requiredSkills.map((skill) => ({ signalId: skill.skillId, category: "candidate" as const, label: skill.name, value: skill.name, weight: skill.required ? 0.9 : 0.5 })),
      ...market.jobModel.requiredCompetencies.map((competency) => ({ signalId: competency.competencyId, category: "candidate" as const, label: competency.name, value: competency.name, weight: competency.weight }))
    ];
    const dimensions = {
      experienceAlignment: dimension("Experience Alignment", resumeText, candidateSignals, market.resume.experience.length > 0 ? 70 : 30, 0.14),
      skillAlignment: dimension("Skill Alignment", resumeText, candidateSignals, coverageScore(market.jobModel.requiredSkills.map((skill) => skill.name), resumeText), 0.16),
      leadershipAlignment: dimension("Leadership Alignment", resumeText, candidateSignals, textMatch(resumeText, "lead") ? 72 : 45, 0.12),
      domainAlignment: dimension("Domain Alignment", resumeText, candidateSignals, textMatch(resumeText, market.jobModel.domain.classification) ? 75 : 45, 0.12),
      platformAlignment: dimension("Platform Alignment", `${resumeText} ${jobText}`, candidateSignals, textMatch(`${resumeText} ${jobText}`, "platform") ? 70 : 45, 0.1),
      growthAlignment: dimension("Growth Alignment", `${resumeText} ${jobText}`, candidateSignals, textMatch(`${resumeText} ${jobText}`, "growth") ? 65 : 50, 0.1),
      learningOpportunity: dimension("Learning Opportunity", jobText, candidateSignals, market.scoreBreakdown.overallScore >= 60 ? 70 : 45, 0.1),
      evidenceSufficiency: dimension("Evidence Sufficiency", resumeText, candidateSignals, market.resume.evidence.length > 0 ? 76 : 35, 0.16)
    };
    const scoreBreakdown = breakdown("candidate-fit", Object.values(dimensions));
    const gaps = gapsFromDimensions("opportunity-fit-gap", Object.values(dimensions));
    const fitId = `candidate-fit:${market.analysisId}`;

    return immutableRecord({
      artifactKind: "CandidateFit" as const,
      fitId,
      marketAnalysisId: market.analysisId,
      resume: market.resume,
      portfolio: market.portfolio,
      jobModel: market.jobModel,
      policy: market.policy,
      ...dimensions,
      scoreBreakdown,
      marketScore: market.scoreBreakdown,
      roleScore: market.roleScore,
      companyScore: market.companyScore,
      gaps,
      assumptions: market.assumptions,
      constraints: market.constraints,
      traceId: market.traceId,
      confidence: confidenceFromScore(scoreBreakdown.overallScore, "Candidate fit confidence follows deterministic alignment dimensions."),
      explanationSummary: createOpportunityExplanationSummary({
        decisionId: fitId,
        title: "Candidate Fit",
        outcome: "WorthExploring",
        confidenceScore: scoreBreakdown.overallScore,
        evidenceReferenceIds: [market.resume.artifact.artifactId, market.portfolio.artifact.artifactId, market.jobModel.artifact.artifactId],
        reasonCodes: scoreBreakdown.dimensions.map((item) => item.dimension),
        assumptions: market.assumptions,
        constraints: market.constraints
      })
    });
  }
}

function coverageScore(required: readonly string[], text: string): number {
  if (required.length === 0) return 70;
  return Math.round(required.filter((item) => textMatch(text, item)).length / required.length * 100);
}
