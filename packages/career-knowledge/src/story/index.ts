import { AggregateRoot, Result } from "@career-companion/kernel";
import {
  CompetencyId,
  EvidenceReferenceId,
  MetricId,
  StoryId,
  addUniqueId,
  createCareerKnowledgeEvent,
  removeExistingId,
  requireNonEmpty
} from "../shared";
import type { DomainError, LifecycleStatus } from "../shared";

export const StoryCreated = "StoryCreated";
export const StoryArchived = "StoryArchived";

export interface StoryContent {
  readonly situation: string;
  readonly problem: string;
  readonly decision: string;
  readonly alternatives?: readonly string[];
  readonly tradeoffs?: readonly string[];
  readonly actions: readonly string[];
  readonly outcome: string;
  readonly lessons?: readonly string[];
}

export interface StorySnapshot extends StoryContent {
  readonly id: StoryId;
  readonly title: string;
  readonly status: LifecycleStatus;
  readonly metricIds: readonly MetricId[];
  readonly competencyIds: readonly CompetencyId[];
  readonly evidenceReferenceIds: readonly EvidenceReferenceId[];
}

export class Story extends AggregateRoot<StoryId> {
  private status: LifecycleStatus = "active";
  private content: StoryContent;
  private readonly metricIds: MetricId[] = [];
  private readonly competencyIds: CompetencyId[] = [];
  private readonly evidenceReferenceIds: EvidenceReferenceId[] = [];

  private constructor(
    id: StoryId,
    private readonly title: string,
    content: StoryContent
  ) {
    super(id);
    this.content = content;
  }

  static create(input: {
    readonly id: StoryId;
    readonly title: string;
    readonly content: StoryContent;
  }): Result<Story> {
    requireNonEmpty(input.title, "title");
    validateContent(input.content);

    const story = new Story(input.id, input.title, input.content);
    story.registerEvent(createCareerKnowledgeEvent(StoryCreated, story.id, story.version));

    return Result.success(story);
  }

  update(content: StoryContent): Result<this> {
    validateContent(content);
    this.content = content;
    return Result.success(this);
  }

  attachMetric(metricId: MetricId): Result<this, DomainError> {
    return attach(this.metricIds, metricId, "Metric is already attached to this story.", this);
  }

  detachMetric(metricId: MetricId): Result<this, DomainError> {
    return detach(this.metricIds, metricId, "Metric is not attached to this story.", this);
  }

  attachCompetency(competencyId: CompetencyId): Result<this, DomainError> {
    return attach(this.competencyIds, competencyId, "Competency is already attached to this story.", this);
  }

  detachCompetency(competencyId: CompetencyId): Result<this, DomainError> {
    return detach(this.competencyIds, competencyId, "Competency is not attached to this story.", this);
  }

  attachEvidence(evidenceReferenceId: EvidenceReferenceId): Result<this, DomainError> {
    return attach(this.evidenceReferenceIds, evidenceReferenceId, "Evidence is already attached to this story.", this);
  }

  detachEvidence(evidenceReferenceId: EvidenceReferenceId): Result<this, DomainError> {
    return detach(this.evidenceReferenceIds, evidenceReferenceId, "Evidence is not attached to this story.", this);
  }

  archive(): Result<this, DomainError> {
    if (this.status === "archived") {
      return Result.failure({
        code: "invalid-reference",
        message: "Story cannot be archived twice."
      });
    }

    this.status = "archived";
    this.registerEvent(createCareerKnowledgeEvent(StoryArchived, this.id, this.version));
    return Result.success(this);
  }

  toSnapshot(): StorySnapshot {
    return {
      id: this.id,
      title: this.title,
      status: this.status,
      ...this.content,
      metricIds: [...this.metricIds],
      competencyIds: [...this.competencyIds],
      evidenceReferenceIds: [...this.evidenceReferenceIds]
    };
  }
}

function validateContent(content: StoryContent): void {
  requireNonEmpty(content.situation, "situation");
  requireNonEmpty(content.problem, "problem");
  requireNonEmpty(content.decision, "decision");
  requireNonEmpty(content.outcome, "outcome");

  if (content.actions.length === 0) {
    requireNonEmpty("", "actions");
  }
}

function attach<Id extends MetricId | CompetencyId | EvidenceReferenceId, Owner>(
  collection: Id[],
  id: Id,
  duplicateMessage: string,
  owner: Owner
): Result<Owner, DomainError> {
  const result = addUniqueId(collection, id, duplicateMessage);
  if (result.isFailure) {
    return Result.failure(result.error ?? {
      code: "invalid-reference",
      message: duplicateMessage
    });
  }

  collection.splice(0, collection.length, ...(result.value ?? []));
  return Result.success(owner);
}

function detach<Id extends MetricId | CompetencyId | EvidenceReferenceId, Owner>(
  collection: Id[],
  id: Id,
  missingMessage: string,
  owner: Owner
): Result<Owner, DomainError> {
  const result = removeExistingId(collection, id, missingMessage);
  if (result.isFailure) {
    return Result.failure(result.error ?? {
      code: "invalid-reference",
      message: missingMessage
    });
  }

  collection.splice(0, collection.length, ...(result.value ?? []));
  return Result.success(owner);
}
