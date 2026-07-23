import { describe, expect, expectTypeOf, it } from "vitest";
import repositoriesPackage from "../../packages/repositories/package.json";
import * as repositoryContracts from "../../packages/repositories/src";
import type {
  Achievement,
  AchievementId,
  CapabilityEvidence,
  CapabilityEvidenceId,
  CareerProfile,
  CareerProfileId,
  Certification,
  CertificationId,
  Competency,
  CompetencyId,
  Education,
  EducationId,
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
} from "../../packages/career-knowledge/src";
import type {
  AchievementRepository,
  CapabilityEvidenceRepository,
  CareerProfileRepository,
  CertificationRepository,
  CompetencyRepository,
  EducationRepository,
  EmploymentRecordRepository,
  EvidenceReferenceRepository,
  MetricRepository,
  PortfolioAssetRepository,
  ProfessionalIdentityRepository,
  ProjectRepository,
  Repository,
  StoryRepository
} from "../../packages/repositories/src";

describe("repository package boundaries", () => {
  it("depends only on approved packages", () => {
    expect(packageDependencies(repositoriesPackage as PackageMetadata)).toEqual([
      "@career-companion/career-knowledge",
      "@career-companion/kernel",
      "@career-companion/persistence"
    ]);
  });

  it("does not expose retrieval-style contract vocabulary", () => {
    const exportedNames = Object.keys(repositoryContracts);
    const forbiddenFragments = ["Filter", "Sort", "Pagination", "Page", "Projection", "Query"];

    for (const exportedName of exportedNames) {
      for (const fragment of forbiddenFragments) {
        expect(exportedName).not.toContain(fragment);
      }
    }
  });

  it("exposes aggregate repository contracts only for the approved aggregate set", () => {
    expectTypeOf<CareerProfileRepository>().toMatchTypeOf<Repository<CareerProfile, CareerProfileId>>();
    expectTypeOf<EmploymentRecordRepository>().toMatchTypeOf<Repository<EmploymentRecord, EmploymentRecordId>>();
    expectTypeOf<AchievementRepository>().toMatchTypeOf<Repository<Achievement, AchievementId>>();
    expectTypeOf<CompetencyRepository>().toMatchTypeOf<Repository<Competency, CompetencyId>>();
    expectTypeOf<EvidenceReferenceRepository>().toMatchTypeOf<Repository<EvidenceReference, EvidenceReferenceId>>();
    expectTypeOf<ProjectRepository>().toMatchTypeOf<Repository<Project, ProjectId>>();
    expectTypeOf<PortfolioAssetRepository>().toMatchTypeOf<Repository<PortfolioAsset, PortfolioAssetId>>();
    expectTypeOf<EducationRepository>().toMatchTypeOf<Repository<Education, EducationId>>();
    expectTypeOf<CertificationRepository>().toMatchTypeOf<Repository<Certification, CertificationId>>();
    expectTypeOf<MetricRepository>().toMatchTypeOf<Repository<Metric, MetricId>>();
    expectTypeOf<StoryRepository>().toMatchTypeOf<Repository<Story, StoryId>>();
    expectTypeOf<ProfessionalIdentityRepository>().toMatchTypeOf<
      Repository<ProfessionalIdentity, ProfessionalIdentityId>
    >();
    expectTypeOf<CapabilityEvidenceRepository>().toMatchTypeOf<
      Repository<CapabilityEvidence, CapabilityEvidenceId>
    >();
  });
});

interface PackageMetadata {
  readonly dependencies?: Record<string, string>;
}

function packageDependencies(packageJson: PackageMetadata): readonly string[] {
  return Object.keys(packageJson.dependencies ?? {}).sort();
}
