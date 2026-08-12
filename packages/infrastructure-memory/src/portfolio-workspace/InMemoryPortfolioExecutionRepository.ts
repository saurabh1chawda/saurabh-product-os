import {
  AcceptedArtifact,
  AcceptedArtifactId,
  ApprovalReference,
  ArtifactCandidate,
  CandidateId,
  ExecutionId,
  PlanSnapshotReference,
  PortfolioExecution,
  PortfolioExecutionCommandContext,
  PortfolioPlanReference,
  PortfolioWorkspaceAuthorizationResourceReference,
  PortfolioWorkItem,
  WorkItemId
} from "@career-companion/portfolio-workspace";
import { Result } from "@career-companion/kernel";
import {
  LoadedPortfolioExecution,
  PortfolioExecutionAlreadyExistsError,
  PortfolioExecutionConcurrencyConflictError,
  PortfolioExecutionRevision,
  PortfolioExecutionSaveResult,
  type PortfolioExecutionRepository,
  type PortfolioExecutionRepositorySaveFailure
} from "@career-companion/portfolio-workspace-application";

type PortfolioExecutionRecord = ReturnType<PortfolioExecution["toJSON"]>;
type VersionedPortfolioExecutionRecord = {
  readonly record: PortfolioExecutionRecord;
  readonly revision: PortfolioExecutionRevision;
};

export class InMemoryPortfolioExecutionRepository implements PortfolioExecutionRepository {
  private readonly records = new Map<string, VersionedPortfolioExecutionRecord>();

  constructor(initialExecutions: readonly PortfolioExecution[] = []) {
    for (const execution of initialExecutions) {
      this.createInitialRecord(execution);
    }
  }

  async loadByExecutionId(executionId: ExecutionId): Promise<LoadedPortfolioExecution | undefined> {
    const stored = this.records.get(executionId.toJSON());
    if (stored === undefined) {
      return undefined;
    }

    return new LoadedPortfolioExecution({
      execution: rehydratePortfolioExecution(stored.record),
      revision: stored.revision
    });
  }

  async save(
    execution: PortfolioExecution,
    expectedRevision?: PortfolioExecutionRevision
  ): Promise<Result<PortfolioExecutionSaveResult, PortfolioExecutionRepositorySaveFailure>> {
    const executionId = execution.id.toJSON();
    const current = this.records.get(executionId);

    if (expectedRevision === undefined) {
      if (current !== undefined) {
        return Result.failure(new PortfolioExecutionAlreadyExistsError({
          executionId: execution.id,
          currentRevision: current.revision
        }));
      }

      const revision = new PortfolioExecutionRevision(1);
      this.records.set(executionId, freezeVersionedRecord({
        record: toRecord(execution),
        revision
      }));
      return Result.success(new PortfolioExecutionSaveResult({ revision }));
    }

    if (current === undefined || !current.revision.equals(expectedRevision)) {
      return Result.failure(new PortfolioExecutionConcurrencyConflictError({
        executionId: execution.id,
        expectedRevision,
        actualRevision: current?.revision
      }));
    }

    const revision = current.revision.next();
    this.records.set(executionId, freezeVersionedRecord({
      record: toRecord(execution),
      revision
    }));
    return Result.success(new PortfolioExecutionSaveResult({ revision }));
  }

  private createInitialRecord(execution: PortfolioExecution): void {
    const revision = new PortfolioExecutionRevision(1);
    this.records.set(execution.id.toJSON(), freezeVersionedRecord({
      record: toRecord(execution),
      revision
    }));
  }
}

function toRecord(execution: PortfolioExecution): PortfolioExecutionRecord {
  return cloneRecord({
    id: execution.id.toJSON(),
    portfolioPlanReference: execution.portfolioPlanReference.toJSON(),
    planSnapshotReference: execution.planSnapshotReference.toJSON(),
    approvalReference: execution.approvalReference.toJSON(),
    authorizationResourceReference: execution.authorizationResourceReference.toJSON(),
    commandContext: execution.commandContext.toJSON(),
    lifecycle: execution.lifecycle,
    workItems: execution.workItems().map((workItem) => workItem.toJSON()),
    candidates: execution.candidates().map((candidate) => candidate.toJSON()),
    acceptedArtifacts: execution.acceptedArtifacts().map((acceptedArtifact) => acceptedArtifact.toJSON())
  });
}

function rehydratePortfolioExecution(record: PortfolioExecutionRecord): PortfolioExecution {
  return new PortfolioExecution({
    id: new ExecutionId(record.id),
    portfolioPlanReference: new PortfolioPlanReference({
      planId: record.portfolioPlanReference.planId,
      roadmapId: record.portfolioPlanReference.roadmapId,
      planArtifactReference: record.portfolioPlanReference.planArtifactReference
    }),
    planSnapshotReference: new PlanSnapshotReference({
      snapshotReference: record.planSnapshotReference.snapshotReference
    }),
    approvalReference: new ApprovalReference({
      approvalReference: record.approvalReference.approvalReference
    }),
    authorizationResourceReference: new PortfolioWorkspaceAuthorizationResourceReference({
      authorizationResourceReference: record.authorizationResourceReference.authorizationResourceReference
    }),
    commandContext: new PortfolioExecutionCommandContext({
      commandId: record.commandContext.commandId,
      correlationId: record.commandContext.correlationId,
      actorReference: record.commandContext.actorReference,
      occurredAt: record.commandContext.occurredAt
    }),
    lifecycle: record.lifecycle,
    workItems: record.workItems.map((workItem) => new PortfolioWorkItem({
      id: new WorkItemId(workItem.id),
      lifecycle: workItem.lifecycle
    })),
    candidates: record.candidates.map((candidate) => new ArtifactCandidate({
      id: new CandidateId(candidate.id),
      lifecycle: candidate.lifecycle
    })),
    acceptedArtifacts: record.acceptedArtifacts.map((acceptedArtifact) => new AcceptedArtifact({
      id: new AcceptedArtifactId(acceptedArtifact.id)
    }))
  });
}

function cloneRecord(record: PortfolioExecutionRecord): PortfolioExecutionRecord {
  return Object.freeze({
    id: record.id,
    portfolioPlanReference: Object.freeze({ ...record.portfolioPlanReference }),
    planSnapshotReference: Object.freeze({ ...record.planSnapshotReference }),
    approvalReference: Object.freeze({ ...record.approvalReference }),
    authorizationResourceReference: Object.freeze({ ...record.authorizationResourceReference }),
    commandContext: Object.freeze({ ...record.commandContext }),
    lifecycle: record.lifecycle,
    workItems: Object.freeze(record.workItems.map((workItem) => Object.freeze({ ...workItem }))),
    candidates: Object.freeze(record.candidates.map((candidate) => Object.freeze({ ...candidate }))),
    acceptedArtifacts: Object.freeze(record.acceptedArtifacts.map((acceptedArtifact) => Object.freeze({ ...acceptedArtifact })))
  });
}

function freezeVersionedRecord(record: VersionedPortfolioExecutionRecord): VersionedPortfolioExecutionRecord {
  return Object.freeze({
    record: cloneRecord(record.record),
    revision: record.revision
  });
}
