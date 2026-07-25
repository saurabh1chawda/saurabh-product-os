import { JobArtifactBuilder } from "../builders";
import { DomainClassifier, FunctionClassifier, RoleClassifier, SeniorityClassifier } from "../classification";
import {
  BusinessObjectiveMapper,
  CompetencyMapper,
  EvidenceExpectationMapper,
  ResponsibilityMapper,
  SkillMapper,
  mapConstraints,
  mapSignals
} from "../mapping";
import type { EmploymentType, JobModel, LocationExpectation, RawJobDescription } from "../models";
import { containsAny, immutableArray, immutableRecord, normalizeText, uniqueSorted } from "../shared";

export class JobAnalyzer {
  private readonly roleClassifier = new RoleClassifier();
  private readonly seniorityClassifier = new SeniorityClassifier();
  private readonly domainClassifier = new DomainClassifier();
  private readonly functionClassifier = new FunctionClassifier();
  private readonly responsibilityMapper = new ResponsibilityMapper();
  private readonly competencyMapper = new CompetencyMapper();
  private readonly skillMapper = new SkillMapper();
  private readonly businessObjectiveMapper = new BusinessObjectiveMapper();
  private readonly evidenceExpectationMapper = new EvidenceExpectationMapper();
  private readonly artifactBuilder = new JobArtifactBuilder();

  analyze(source: RawJobDescription): JobModel {
    const role = this.roleClassifier.classify(source.description);
    const seniority = this.seniorityClassifier.classify(source.description);
    const domain = this.domainClassifier.classify(source.description);
    const productFunction = this.functionClassifier.classify(source.description);
    const responsibilities = this.responsibilityMapper.map(source.description);
    const requiredCompetencies = this.competencyMapper.map(source.description);
    const requiredSkills = this.skillMapper.mapRequired(source.description);
    const preferredSkills = this.skillMapper.mapPreferred(source.description);
    const businessObjectives = this.businessObjectiveMapper.map(source.description);
    const expectations = this.evidenceExpectationMapper.map(requiredCompetencies);
    const partial = immutableRecord({
      artifactKind: "JobModel" as const,
      source,
      role,
      function: productFunction,
      seniority,
      domain,
      industry: inferIndustry(source.description),
      responsibilities,
      requiredCompetencies,
      requiredSkills,
      preferredSkills,
      businessObjectives,
      successIndicators: uniqueSorted(businessObjectives.flatMap((objective) => objective.successIndicators)),
      constraints: mapConstraints(source.description),
      signals: mapSignals(source.description),
      location: inferLocation(source.description),
      employmentType: inferEmploymentType(source.description),
      experienceExpectations: immutableArray(extractExpectations(source.description, ["years", "experience"])),
      educationExpectations: immutableArray(extractExpectations(source.description, ["degree", "bachelor", "mba"])),
      certificationExpectations: immutableArray(extractExpectations(source.description, ["certification", "certified"])),
      travelExpectations: immutableArray(extractExpectations(source.description, ["travel"])),
      evidenceExpectations: expectations
    });
    const built = this.artifactBuilder.build(partial);

    return immutableRecord({ ...partial, ...built });
  }
}

function inferIndustry(description: string): string {
  if (containsAny(description, ["fintech", "banking", "payments"])) return "Financial Technology";
  if (containsAny(description, ["healthcare", "clinical"])) return "Healthcare";
  if (containsAny(description, ["saas", "enterprise"])) return "Software";
  return "Unspecified";
}

function inferLocation(description: string): LocationExpectation {
  const normalized = normalizeText(description);
  const remote = normalized.includes("remote");
  const hybrid = normalized.includes("hybrid");
  const office = normalized.includes("office") || normalized.includes("onsite") || normalized.includes("on-site");
  if ((remote && office) || (hybrid && remote)) return "Mixed";
  if (remote) return "Remote";
  if (hybrid) return "Hybrid";
  if (office) return "OnSite";
  return "Unspecified";
}

function inferEmploymentType(description: string): EmploymentType {
  if (containsAny(description, ["contract", "contractor"])) return "Contract";
  if (containsAny(description, ["intern", "internship"])) return "Internship";
  if (containsAny(description, ["part-time", "part time"])) return "PartTime";
  if (containsAny(description, ["full-time", "full time"])) return "FullTime";
  return "Unknown";
}

function extractExpectations(description: string, signals: readonly string[]): readonly string[] {
  const sentences = description.split(/[.\n]/u).map((sentence) => sentence.trim()).filter((sentence) => sentence.length > 0);
  return uniqueSorted(sentences.filter((sentence) => containsAny(sentence, signals)).slice(0, 4));
}
