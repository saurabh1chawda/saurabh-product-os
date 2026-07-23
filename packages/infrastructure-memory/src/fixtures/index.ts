import {
  CapabilityEvidence,
  CapabilityEvidenceId,
  CareerProfile,
  CareerProfileId,
  Competency,
  CompetencyId,
  DateRange,
  EmploymentRecord,
  EmploymentRecordId,
  EvidenceReference,
  EvidenceReferenceId,
  Metric,
  MetricId,
  PortfolioAsset,
  PortfolioAssetId,
  ProfessionalIdentity,
  ProfessionalIdentityId,
  Project,
  ProjectId,
  Story,
  StoryId
} from "@career-companion/career-knowledge";
import type {
  CapabilityEvidenceSnapshot,
  CareerProfileSnapshot,
  CompetencySnapshot,
  EvidenceReferenceSnapshot,
  ISODateString,
  MetricSnapshot,
  PortfolioAssetSnapshot,
  ProfessionalIdentitySnapshot,
  ProjectSnapshot,
  StorySnapshot
} from "@career-companion/career-knowledge";
import { ImmutableCollectionFactory } from "../shared";

export const fixtureIds = Object.freeze({
  careerProfile: new CareerProfileId("career-profile-fixture-1"),
  employment: new EmploymentRecordId("employment-fixture-1"),
  competency: new CompetencyId("competency-fixture-1"),
  evidence: new EvidenceReferenceId("evidence-fixture-1"),
  metric: new MetricId("metric-fixture-1"),
  story: new StoryId("story-fixture-1"),
  project: new ProjectId("project-fixture-1"),
  portfolioAsset: new PortfolioAssetId("portfolio-fixture-1"),
  professionalIdentity: new ProfessionalIdentityId("identity-fixture-1"),
  capabilityEvidence: new CapabilityEvidenceId("capability-evidence-fixture-1")
});

export function createCareerProfileFixture(): CareerProfile {
  const profile = requireValue(CareerProfile.create({
    id: fixtureIds.careerProfile,
    displayName: "Career Companion Candidate",
    headline: "AI Product Leader",
    summary: "Builds governed AI products and platform systems.",
    location: "Remote",
    verificationStatus: "candidate"
  }));
  profile.addEmployment(fixtureIds.employment);
  return profile;
}

export function createEmploymentFixture(): EmploymentRecord {
  return requireValue(EmploymentRecord.start({
    id: fixtureIds.employment,
    employerName: "Example Company",
    roleTitle: "Senior Product Manager",
    dateRange: requireValue(DateRange.create({
      startDate: "2024-01-01" as ISODateString,
      isCurrent: true
    })),
    verificationStatus: "candidate"
  }));
}

export function createCompetencyFixture(): Competency {
  const competency = requireValue(Competency.create({
    id: fixtureIds.competency,
    name: "AI Product Management",
    category: "ai-product-management",
    description: "Demonstrated ability to ship governed AI product capabilities.",
    verificationStatus: "candidate"
  }));
  competency.attachEvidence(fixtureIds.evidence);
  return competency;
}

export function createEvidenceFixture(): EvidenceReference {
  return requireValue(EvidenceReference.attach({
    id: fixtureIds.evidence,
    evidenceType: "document",
    title: "Launch Review",
    description: "Approved launch review artifact.",
    sourceName: "Career Companion Fixture",
    capturedDate: "2026-01-01" as ISODateString,
    strength: "primary"
  }));
}

export function createMetricFixture(): Metric {
  return requireValue(Metric.create({
    id: fixtureIds.metric,
    name: "Cycle Time Reduction",
    unit: "percent",
    value: 18,
    source: "Launch Review",
    confidence: "high",
    measurementDate: "2026-01-01" as ISODateString
  }));
}

export function createStoryFixture(): Story {
  const story = requireValue(Story.create({
    id: fixtureIds.story,
    title: "Governed AI Launch",
    content: {
      situation: "A platform team needed reliable AI-assisted workflows.",
      problem: "Execution lacked traceability and validation.",
      decision: "Introduce governed architecture and deterministic validation.",
      actions: Object.freeze(["Defined contracts", "Added validation", "Created review evidence"]),
      outcome: "Reduced review cycle time.",
      lessons: Object.freeze(["Governance works best when it is built into execution."])
    }
  }));
  story.attachMetric(fixtureIds.metric);
  story.attachCompetency(fixtureIds.competency);
  story.attachEvidence(fixtureIds.evidence);
  return story;
}

export function createProjectFixture(): Project {
  return requireValue(Project.create({
    id: fixtureIds.project,
    name: "Career Companion Architecture",
    description: "Governed modular monolith architecture.",
    role: "Product Platform Architect",
    verificationStatus: "candidate"
  }));
}

export function createPortfolioAssetFixture(): PortfolioAsset {
  const asset = requireValue(PortfolioAsset.create({
    id: fixtureIds.portfolioAsset,
    title: "Architecture Blueprint",
    assetType: "product-artifact",
    description: "Implementation-ready architecture blueprint.",
    verificationStatus: "candidate"
  }));
  asset.publish();
  return asset;
}

export function createProfessionalIdentityFixture(): ProfessionalIdentity {
  const identity = requireValue(ProfessionalIdentity.create({
    id: fixtureIds.professionalIdentity,
    name: "AI Product Leader",
    description: "Product leader focused on governed AI platforms."
  }));
  identity.attachCompetency(fixtureIds.competency);
  identity.attachStory(fixtureIds.story);
  identity.attachMetric(fixtureIds.metric);
  identity.activate();
  return identity;
}

export function createCapabilityEvidenceFixture(): CapabilityEvidence {
  const evidence = requireValue(CapabilityEvidence.create({
    id: fixtureIds.capabilityEvidence,
    competencyId: fixtureIds.competency,
    description: "Evidence connecting competency to outcomes."
  }));
  evidence.attachStory(fixtureIds.story);
  evidence.attachMetric(fixtureIds.metric);
  evidence.verify();
  return evidence;
}

export function createCareerKnowledgeFixtures(): {
  readonly careerProfile: CareerProfile;
  readonly employment: EmploymentRecord;
  readonly competency: Competency;
  readonly evidence: EvidenceReference;
  readonly metric: Metric;
  readonly story: Story;
  readonly project: Project;
  readonly portfolioAsset: PortfolioAsset;
  readonly professionalIdentity: ProfessionalIdentity;
  readonly capabilityEvidence: CapabilityEvidence;
} {
  return Object.freeze({
    careerProfile: createCareerProfileFixture(),
    employment: createEmploymentFixture(),
    competency: createCompetencyFixture(),
    evidence: createEvidenceFixture(),
    metric: createMetricFixture(),
    story: createStoryFixture(),
    project: createProjectFixture(),
    portfolioAsset: createPortfolioAssetFixture(),
    professionalIdentity: createProfessionalIdentityFixture(),
    capabilityEvidence: createCapabilityEvidenceFixture()
  });
}

export function createCareerKnowledgeProjectionFixtures(): {
  readonly careerProfiles: readonly CareerProfileSnapshot[];
  readonly competencies: readonly CompetencySnapshot[];
  readonly evidence: readonly EvidenceReferenceSnapshot[];
  readonly metrics: readonly MetricSnapshot[];
  readonly stories: readonly StorySnapshot[];
  readonly projects: readonly ProjectSnapshot[];
  readonly portfolioAssets: readonly PortfolioAssetSnapshot[];
  readonly professionalIdentities: readonly ProfessionalIdentitySnapshot[];
  readonly capabilityEvidence: readonly CapabilityEvidenceSnapshot[];
} {
  const fixtures = createCareerKnowledgeFixtures();

  return Object.freeze({
    careerProfiles: ImmutableCollectionFactory.create([fixtures.careerProfile.toSnapshot()]),
    competencies: ImmutableCollectionFactory.create([fixtures.competency.toSnapshot()]),
    evidence: ImmutableCollectionFactory.create([fixtures.evidence.toSnapshot()]),
    metrics: ImmutableCollectionFactory.create([fixtures.metric.toSnapshot()]),
    stories: ImmutableCollectionFactory.create([fixtures.story.toSnapshot()]),
    projects: ImmutableCollectionFactory.create([fixtures.project.toSnapshot()]),
    portfolioAssets: ImmutableCollectionFactory.create([fixtures.portfolioAsset.toSnapshot()]),
    professionalIdentities: ImmutableCollectionFactory.create([fixtures.professionalIdentity.toSnapshot()]),
    capabilityEvidence: ImmutableCollectionFactory.create([fixtures.capabilityEvidence.toSnapshot()])
  });
}

function requireValue<T>(result: { readonly value?: T }): T {
  if (result.value === undefined) {
    throw new Error("Fixture creation failed.");
  }

  return result.value;
}
