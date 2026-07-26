import { ATSParsingArtifactBuilder } from "../builders";
import type { ATSDetectedSection, ATSParsedKeyword, ATSParsing, ATSPipeline } from "../models";
import { confidenceFromScore, immutableArray, immutableRecord, normalizeText, uniqueSorted } from "../shared";

export class ATSParsingAnalyzer {
  private readonly artifactBuilder = new ATSParsingArtifactBuilder();

  analyze(pipeline: ATSPipeline): ATSParsing {
    const resume = pipeline.resume;
    const detectedSections = immutableArray(pipeline.parsingPolicy.knownSectionAliases.map((entry, index): ATSDetectedSection => {
      const present = resume.sections.some((section) => {
        return section.sectionType === entry.section || entry.aliases.some((alias) => normalizeText(section.title ?? section.sectionType).includes(normalizeText(alias)));
      });
      return immutableRecord({
        sectionId: `ats-section:${entry.section}`,
        sectionType: entry.section,
        order: index + 1,
        present,
        aliasesMatched: present ? entry.aliases : immutableArray([])
      });
    }));
    const missingFields = uniqueSorted(pipeline.parsingPolicy.requiredSections.filter((section) => {
      return !detectedSections.some((detected) => detected.sectionType === section && detected.present);
    }));
    const ambiguousFields = uniqueSorted(resume.experience.flatMap((experience) => {
      const value = `${experience.employment.dateRange.startDate ?? ""} ${experience.employment.dateRange.endDate ?? ""}`;
      return experience.employment.dateRange.endDate === undefined || value.toLowerCase().includes("present") || value.trim().length === 0 ? [`employment-date:${experience.employment.id}`] : [];
    }));
    const unsupportedStructures = uniqueSorted(pipeline.parsingPolicy.unsupportedStructureSignals.filter((signal) => {
      return resume.artifact.metadata.references.some((reference) => normalizeText(reference.label ?? reference.referenceId).includes(signal));
    }));
    const skills = uniqueSorted([...resume.skills.skills.map((skill) => skill.name), ...resume.skills.technologies.map((technology) => technology.name)]);
    const competencies = uniqueSorted(resume.skills.competencies.map((competency) => competency.name));
    const quantifiedEvidence = uniqueSorted(resume.experience.flatMap((experience) => experience.metrics.map((metric) => `${metric.name}:${metric.value}${metric.unit}`)));
    const confidenceValue = Math.max(0, 100 - (missingFields.length * 15) - (ambiguousFields.length * 8) - (unsupportedStructures.length * 20));
    const partial = immutableRecord({
      artifactKind: "ATSParsing" as const,
      parsingId: `ats-parsing:${pipeline.pipelineId}`,
      pipelineId: pipeline.pipelineId,
      status: confidenceValue >= 85 ? "complete" as const : confidenceValue >= 45 ? "partial" as const : "insufficient" as const,
      jobContext: pipeline.jobContext,
      matchingPolicy: pipeline.matchingPolicy,
      screeningPolicy: pipeline.screeningPolicy,
      detectedSections,
      candidateSummaryFields: immutableArray([resume.summary.headline, resume.summary.summary].filter(Boolean)),
      roles: uniqueSorted(resume.experience.map((experience) => experience.employment.roleTitle)),
      companies: uniqueSorted(resume.experience.map((experience) => experience.employment.employerName)),
      employmentDates: uniqueSorted(resume.experience.map((experience) => `${experience.employment.dateRange.startDate}-${experience.employment.dateRange.endDate ?? "present"}`)),
      employmentDurationProjections: uniqueSorted(resume.experience.map((experience) => `${experience.employment.id}:duration-projected`)),
      skills,
      competencies,
      education: immutableArray([]),
      certifications: immutableArray([]),
      achievements: uniqueSorted([...resume.experience.flatMap((experience) => experience.achievements.map((achievement) => achievement.title)), ...resume.evidence.map((item) => item.evidence.title)]),
      quantifiedEvidence,
      contactFieldPresence: immutableArray(resume.artifact.metadata.references.some((reference) => reference.referenceType === "contact") ? ["contact-reference"] : []),
      parsedKeywords: immutableArray([...skills, ...competencies].map((keyword): ATSParsedKeyword => immutableRecord({ keyword, source: "resume-intelligence" }))),
      ambiguousFields,
      missingFields,
      unsupportedStructures,
      parsingWarnings: uniqueSorted([...missingFields.map((field) => `missing:${field}`), ...ambiguousFields.map((field) => `ambiguous:${field}`), ...unsupportedStructures.map((field) => `unsupported:${field}`)]),
      confidence: confidenceFromScore(confidenceValue, "Parsing confidence follows required section coverage and ambiguity."),
      evidenceReferences: uniqueSorted([resume.artifact.artifactId, ...resume.evidence.map((item) => item.evidence.id.toString())]),
      decisionTrace: pipeline.decisionTrace
    });
    const built = this.artifactBuilder.build(partial);

    return immutableRecord({ ...partial, ...built });
  }
}
