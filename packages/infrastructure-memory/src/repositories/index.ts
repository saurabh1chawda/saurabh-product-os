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
} from "@career-companion/career-knowledge";
import type { AggregateRoot, DomainMetadata, UniqueIdentifier, Version } from "@career-companion/kernel";
import type { VersionToken } from "@career-companion/persistence";
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
  RemovalIntent,
  Repository,
  RepositoryConflict,
  RepositoryContext,
  RepositoryDescriptor,
  RepositoryExistenceResult,
  RepositoryMetadata,
  RepositoryOperation,
  RepositoryRemoveResult,
  RepositoryResult,
  RepositorySaveResult,
  RemovalMode,
  StoryRepository
} from "@career-companion/repositories";
import { InMemoryUnitOfWork, createPersistenceMetadata } from "../persistence";
import { RepositoryStore, timestamp } from "../shared";

export class InMemoryRepository<TAggregate extends AggregateRoot<TId>, TId extends UniqueIdentifier>
  implements Repository<TAggregate, TId>
{
  readonly descriptor: RepositoryDescriptor;
  protected readonly store: RepositoryStore<TAggregate, TId>;

  constructor(
    repositoryName: string,
    aggregateName: string,
    aggregateType: string,
    initialAggregates: readonly TAggregate[] = []
  ) {
    this.descriptor = Object.freeze({
      repositoryName,
      aggregateName,
      aggregateType,
      capabilities: Object.freeze({
        supportedOperations: Object.freeze(["get-by-id", "exists", "save", "remove"] satisfies readonly RepositoryOperation[]),
        supportedRemovalModes: Object.freeze(["archive-only", "soft-delete"] satisfies readonly RemovalMode[]),
        batch: Object.freeze({ supported: false })
      })
    });
    this.store = new RepositoryStore<TAggregate, TId>(initialAggregates);
  }

  getById(id: TId, context: RepositoryContext): RepositoryResult<TAggregate, TId> {
    const record = this.store.get(id);
    const metadata = this.repositoryMetadata("get-by-id", context.metadata, record?.versionToken);

    if (record === undefined) {
      return Object.freeze({
        status: "not-found",
        id,
        metadata
      });
    }

    return Object.freeze({
      status: "success",
      value: record.aggregate,
      metadata
    });
  }

  exists(id: TId, context: RepositoryContext): RepositoryExistenceResult {
    return Object.freeze({
      status: "success",
      value: this.store.has(id),
      metadata: this.repositoryMetadata("exists", context.metadata, this.store.get(id)?.versionToken)
    });
  }

  save(aggregate: TAggregate, context: RepositoryContext, expectedVersion?: VersionToken): RepositorySaveResult<TId> {
    const current = this.store.get(aggregate.id);
    const conflict = this.detectConflict(aggregate.id, expectedVersion, current?.version);

    if (conflict !== undefined) {
      return conflict;
    }

    const nextVersion = (current?.version ?? aggregate.version) + 1;
    const metadata = createPersistenceMetadata(
      `${this.descriptor.repositoryName}:${aggregate.id.toString()}`,
      nextVersion,
      context.metadata
    );

    const commit = (): void => {
      this.store.set(aggregate, nextVersion);
    };

    if (context.unitOfWork instanceof InMemoryUnitOfWork) {
      const saveResult = context.unitOfWork.stage(`${this.descriptor.repositoryName}.save`, commit, metadata);
      if (!saveResult.accepted) {
        return this.failure("repository.save-rejected", "Repository save was rejected by the unit of work.", context.metadata);
      }
    } else {
      context.unitOfWork?.save(`${this.descriptor.repositoryName}.save`, metadata);
      commit();
    }

    return Object.freeze({
      status: "success",
      value: aggregate.id,
      metadata: this.repositoryMetadata("save", context.metadata, {
        value: `${aggregate.id.toString()}:${nextVersion}`,
        version: nextVersion
      })
    });
  }

  remove(
    id: TId,
    intent: RemovalIntent,
    context: RepositoryContext,
    expectedVersion?: VersionToken
  ): RepositoryRemoveResult<TId> {
    const current = this.store.get(id);

    if (current === undefined) {
      return Object.freeze({
        status: "not-found",
        id,
        metadata: this.repositoryMetadata("remove", context.metadata)
      });
    }

    const conflict = this.detectConflict(id, expectedVersion, current.version);
    if (conflict !== undefined) {
      return conflict;
    }

    const metadata = createPersistenceMetadata(
      `${this.descriptor.repositoryName}:${id.toString()}:remove`,
      current.version,
      { ...context.metadata, removalMode: intent.mode, deletionReason: intent.reason }
    );
    const commit = (): void => {
      if (intent.mode === "soft-delete") {
        this.store.delete(id);
      }
    };

    if (context.unitOfWork instanceof InMemoryUnitOfWork) {
      const saveResult = context.unitOfWork.stage(`${this.descriptor.repositoryName}.remove`, commit, metadata);
      if (!saveResult.accepted) {
        return this.failure("repository.remove-rejected", "Repository remove was rejected by the unit of work.", context.metadata);
      }
    } else {
      context.unitOfWork?.save(`${this.descriptor.repositoryName}.remove`, metadata);
      commit();
    }

    return Object.freeze({
      status: "success",
      value: id,
      metadata: this.repositoryMetadata("remove", context.metadata, current.versionToken)
    });
  }

  protected repositoryMetadata(
    operationName: string,
    metadata?: DomainMetadata,
    versionToken?: VersionToken
  ): RepositoryMetadata {
    return Object.freeze({
      operationId: `${this.descriptor.repositoryName}:${operationName}`,
      repositoryName: this.descriptor.repositoryName,
      aggregateType: this.descriptor.aggregateType,
      occurredAt: timestamp(),
      versionToken,
      metadata
    });
  }

  private detectConflict(id: TId, expectedVersion: VersionToken | undefined, actualVersion: Version | undefined):
    | RepositoryConflict<TId>
    | undefined {
    if (expectedVersion === undefined || actualVersion === undefined || expectedVersion.version === actualVersion) {
      return undefined;
    }

    return Object.freeze({
      status: "conflict",
      id,
      expectedVersion: expectedVersion.version,
      actualVersion,
      versionToken: {
        value: `${id.toString()}:${actualVersion}`,
        version: actualVersion
      },
      conflict: Object.freeze({
        aggregateId: id.toString(),
        aggregateType: this.descriptor.aggregateType,
        expectedVersion: expectedVersion.version,
        actualVersion,
        detectedAt: timestamp()
      }),
      metadata: this.repositoryMetadata("conflict")
    });
  }

  private failure<T>(code: string, message: string, metadata?: DomainMetadata): RepositorySaveResult<T> {
    return Object.freeze({
      status: "failure",
      code,
      message,
      metadata: this.repositoryMetadata("failure", metadata)
    });
  }
}

export class InMemoryCareerProfileRepository
  extends InMemoryRepository<CareerProfile, CareerProfileId>
  implements CareerProfileRepository
{
  constructor(initialAggregates: readonly CareerProfile[] = []) {
    super("InMemoryCareerProfileRepository", "CareerProfile", "career-profile", initialAggregates);
  }
}

export class InMemoryEmploymentRepository
  extends InMemoryRepository<EmploymentRecord, EmploymentRecordId>
  implements EmploymentRecordRepository
{
  constructor(initialAggregates: readonly EmploymentRecord[] = []) {
    super("InMemoryEmploymentRepository", "EmploymentRecord", "employment-record", initialAggregates);
  }
}

export class InMemoryAchievementRepository
  extends InMemoryRepository<Achievement, AchievementId>
  implements AchievementRepository
{
  constructor(initialAggregates: readonly Achievement[] = []) {
    super("InMemoryAchievementRepository", "Achievement", "achievement", initialAggregates);
  }
}

export class InMemoryCompetencyRepository
  extends InMemoryRepository<Competency, CompetencyId>
  implements CompetencyRepository
{
  constructor(initialAggregates: readonly Competency[] = []) {
    super("InMemoryCompetencyRepository", "Competency", "competency", initialAggregates);
  }
}

export class InMemoryEvidenceRepository
  extends InMemoryRepository<EvidenceReference, EvidenceReferenceId>
  implements EvidenceReferenceRepository
{
  constructor(initialAggregates: readonly EvidenceReference[] = []) {
    super("InMemoryEvidenceRepository", "EvidenceReference", "evidence-reference", initialAggregates);
  }
}

export class InMemoryProjectRepository extends InMemoryRepository<Project, ProjectId> implements ProjectRepository {
  constructor(initialAggregates: readonly Project[] = []) {
    super("InMemoryProjectRepository", "Project", "project", initialAggregates);
  }
}

export class InMemoryPortfolioRepository
  extends InMemoryRepository<PortfolioAsset, PortfolioAssetId>
  implements PortfolioAssetRepository
{
  constructor(initialAggregates: readonly PortfolioAsset[] = []) {
    super("InMemoryPortfolioRepository", "PortfolioAsset", "portfolio-asset", initialAggregates);
  }
}

export class InMemoryEducationRepository
  extends InMemoryRepository<Education, EducationId>
  implements EducationRepository
{
  constructor(initialAggregates: readonly Education[] = []) {
    super("InMemoryEducationRepository", "Education", "education", initialAggregates);
  }
}

export class InMemoryCertificationRepository
  extends InMemoryRepository<Certification, CertificationId>
  implements CertificationRepository
{
  constructor(initialAggregates: readonly Certification[] = []) {
    super("InMemoryCertificationRepository", "Certification", "certification", initialAggregates);
  }
}

export class InMemoryMetricRepository extends InMemoryRepository<Metric, MetricId> implements MetricRepository {
  constructor(initialAggregates: readonly Metric[] = []) {
    super("InMemoryMetricRepository", "Metric", "metric", initialAggregates);
  }
}

export class InMemoryStoryRepository extends InMemoryRepository<Story, StoryId> implements StoryRepository {
  constructor(initialAggregates: readonly Story[] = []) {
    super("InMemoryStoryRepository", "Story", "story", initialAggregates);
  }
}

export class InMemoryProfessionalIdentityRepository
  extends InMemoryRepository<ProfessionalIdentity, ProfessionalIdentityId>
  implements ProfessionalIdentityRepository
{
  constructor(initialAggregates: readonly ProfessionalIdentity[] = []) {
    super("InMemoryProfessionalIdentityRepository", "ProfessionalIdentity", "professional-identity", initialAggregates);
  }
}

export class InMemoryCapabilityEvidenceRepository
  extends InMemoryRepository<CapabilityEvidence, CapabilityEvidenceId>
  implements CapabilityEvidenceRepository
{
  constructor(initialAggregates: readonly CapabilityEvidence[] = []) {
    super("InMemoryCapabilityEvidenceRepository", "CapabilityEvidence", "capability-evidence", initialAggregates);
  }
}
