import { Result } from "@career-companion/kernel";
import {
  AcceptedArtifact,
  AcceptedArtifactId,
  ApprovalReference,
  ArtifactCandidate,
  ArtifactCandidateLifecycle,
  CandidateId,
  ExecutionId,
  PlanSnapshotReference,
  PortfolioExecution,
  PortfolioExecutionCommandContext,
  PortfolioExecutionLifecycle,
  PortfolioPlanReference,
  PortfolioWorkItem,
  PortfolioWorkItemLifecycle,
  WorkItemId,
  type ArtifactCandidateLifecycleValue,
  type PortfolioExecutionLifecycleValue,
  type PortfolioWorkItemLifecycleValue
} from "@career-companion/portfolio-workspace";
import {
  PortfolioExecutionPersistenceMappingError,
  UnsupportedPortfolioExecutionRecordVersionError
} from "@career-companion/portfolio-workspace-application";
import {
  PORTFOLIO_EXECUTION_RECORD_VERSION,
  type PortfolioExecutionAggregatePayload,
  type PortfolioExecutionRecord
} from "./PortfolioExecutionRecord";

type PortfolioExecutionMapperFailure =
  | PortfolioExecutionPersistenceMappingError
  | UnsupportedPortfolioExecutionRecordVersionError;

export class PortfolioExecutionRecordMapper {
  private readonly __portfolioExecutionRecordMapperBrand!: never;

  private constructor() {}

  static toRecord(execution: PortfolioExecution): PortfolioExecutionRecord {
    const json = execution.toJSON();

    return freezeRecord({
      recordVersion: PORTFOLIO_EXECUTION_RECORD_VERSION,
      executionId: json.id,
      aggregatePayload: {
        id: json.id,
        portfolioPlanReference: Object.freeze({ ...json.portfolioPlanReference }),
        planSnapshotReference: Object.freeze({ ...json.planSnapshotReference }),
        approvalReference: Object.freeze({ ...json.approvalReference }),
        commandContext: Object.freeze({ ...json.commandContext }),
        lifecycle: json.lifecycle,
        workItems: Object.freeze(json.workItems.map((workItem) => Object.freeze({ ...workItem }))),
        candidates: Object.freeze(json.candidates.map((candidate) => Object.freeze({ ...candidate }))),
        acceptedArtifacts: Object.freeze(json.acceptedArtifacts.map((acceptedArtifact) => Object.freeze({ ...acceptedArtifact })))
      }
    });
  }

  static fromUnknownRecord(value: unknown): Result<PortfolioExecution, PortfolioExecutionMapperFailure> {
    return this.fromRecord(value as PortfolioExecutionRecord);
  }

  static fromRecord(record: PortfolioExecutionRecord): Result<PortfolioExecution, PortfolioExecutionMapperFailure> {
    const validation = validateRecord(record);
    if (validation !== undefined) {
      return Result.failure(validation);
    }

    try {
      const payload = record.aggregatePayload;
      return Result.success(new PortfolioExecution({
        id: new ExecutionId(payload.id),
        portfolioPlanReference: new PortfolioPlanReference({
          planId: payload.portfolioPlanReference.planId,
          roadmapId: payload.portfolioPlanReference.roadmapId,
          planArtifactReference: payload.portfolioPlanReference.planArtifactReference
        }),
        planSnapshotReference: new PlanSnapshotReference({
          snapshotReference: payload.planSnapshotReference.snapshotReference
        }),
        approvalReference: new ApprovalReference({
          approvalReference: payload.approvalReference.approvalReference
        }),
        commandContext: new PortfolioExecutionCommandContext({
          commandId: payload.commandContext.commandId,
          correlationId: payload.commandContext.correlationId,
          actorReference: payload.commandContext.actorReference,
          occurredAt: payload.commandContext.occurredAt
        }),
        lifecycle: payload.lifecycle,
        workItems: payload.workItems.map((workItem) => new PortfolioWorkItem({
          id: new WorkItemId(workItem.id),
          lifecycle: workItem.lifecycle
        })),
        candidates: payload.candidates.map((candidate) => new ArtifactCandidate({
          id: new CandidateId(candidate.id),
          lifecycle: candidate.lifecycle
        })),
        acceptedArtifacts: payload.acceptedArtifacts.map((acceptedArtifact) => new AcceptedArtifact({
          id: new AcceptedArtifactId(acceptedArtifact.id)
        }))
      }));
    } catch (error) {
      if (error instanceof UnsupportedPortfolioExecutionRecordVersionError) {
        return Result.failure(error);
      }

      return Result.failure(new PortfolioExecutionPersistenceMappingError());
    }
  }
}

function validateRecord(record: PortfolioExecutionRecord): PortfolioExecutionMapperFailure | undefined {
  if (!isRecordObject(record)) {
    return new PortfolioExecutionPersistenceMappingError();
  }
  if (!("recordVersion" in record)) {
    return new PortfolioExecutionPersistenceMappingError();
  }
  if (typeof record.recordVersion !== "number") {
    return new PortfolioExecutionPersistenceMappingError();
  }
  if (record.recordVersion !== PORTFOLIO_EXECUTION_RECORD_VERSION) {
    return new UnsupportedPortfolioExecutionRecordVersionError(record.recordVersion);
  }
  if (!isNonEmptyString(record.executionId)) {
    return new PortfolioExecutionPersistenceMappingError();
  }
  if (!isAggregatePayload(record.aggregatePayload)) {
    return new PortfolioExecutionPersistenceMappingError();
  }
  if (record.executionId !== record.aggregatePayload.id) {
    return new PortfolioExecutionPersistenceMappingError();
  }
  if (hasDuplicateStrings(record.aggregatePayload.workItems.map((workItem) => workItem.id))) {
    return new PortfolioExecutionPersistenceMappingError();
  }
  if (hasDuplicateStrings(record.aggregatePayload.candidates.map((candidate) => candidate.id))) {
    return new PortfolioExecutionPersistenceMappingError();
  }
  if (hasDuplicateStrings(record.aggregatePayload.acceptedArtifacts.map((artifact) => artifact.id))) {
    return new PortfolioExecutionPersistenceMappingError();
  }

  return undefined;
}

function isAggregatePayload(value: unknown): value is PortfolioExecutionAggregatePayload {
  if (!isRecordObject(value)) return false;

  return isNonEmptyString(value.id)
    && isPortfolioPlanReferenceRecord(value.portfolioPlanReference)
    && isPlanSnapshotReferenceRecord(value.planSnapshotReference)
    && isApprovalReferenceRecord(value.approvalReference)
    && isCommandContextRecord(value.commandContext)
    && isPortfolioExecutionLifecycle(value.lifecycle)
    && isWorkItemRecords(value.workItems)
    && isCandidateRecords(value.candidates)
    && isAcceptedArtifactRecords(value.acceptedArtifacts);
}

function isPortfolioPlanReferenceRecord(value: unknown): value is PortfolioExecutionAggregatePayload["portfolioPlanReference"] {
  return isRecordObject(value)
    && isNonEmptyString(value.planId)
    && isNonEmptyString(value.roadmapId)
    && isNonEmptyString(value.planArtifactReference);
}

function isPlanSnapshotReferenceRecord(value: unknown): value is PortfolioExecutionAggregatePayload["planSnapshotReference"] {
  return isRecordObject(value)
    && isNonEmptyString(value.snapshotReference);
}

function isApprovalReferenceRecord(value: unknown): value is PortfolioExecutionAggregatePayload["approvalReference"] {
  return isRecordObject(value)
    && isNonEmptyString(value.approvalReference);
}

function isCommandContextRecord(value: unknown): value is PortfolioExecutionAggregatePayload["commandContext"] {
  return isRecordObject(value)
    && isNonEmptyString(value.commandId)
    && isNonEmptyString(value.correlationId)
    && isNonEmptyString(value.actorReference)
    && isNonEmptyString(value.occurredAt);
}

function isWorkItemRecords(value: unknown): value is PortfolioExecutionAggregatePayload["workItems"] {
  return Array.isArray(value)
    && value.every((workItem) => isRecordObject(workItem)
      && isNonEmptyString(workItem.id)
      && isPortfolioWorkItemLifecycle(workItem.lifecycle));
}

function isCandidateRecords(value: unknown): value is PortfolioExecutionAggregatePayload["candidates"] {
  return Array.isArray(value)
    && value.every((candidate) => isRecordObject(candidate)
      && isNonEmptyString(candidate.id)
      && isArtifactCandidateLifecycle(candidate.lifecycle));
}

function isAcceptedArtifactRecords(value: unknown): value is PortfolioExecutionAggregatePayload["acceptedArtifacts"] {
  return Array.isArray(value)
    && value.every((acceptedArtifact) => isRecordObject(acceptedArtifact)
      && isNonEmptyString(acceptedArtifact.id));
}

function isPortfolioExecutionLifecycle(value: unknown): value is PortfolioExecutionLifecycleValue {
  return typeof value === "string"
    && Object.values(PortfolioExecutionLifecycle).includes(value as PortfolioExecutionLifecycleValue);
}

function isPortfolioWorkItemLifecycle(value: unknown): value is PortfolioWorkItemLifecycleValue {
  return typeof value === "string"
    && Object.values(PortfolioWorkItemLifecycle).includes(value as PortfolioWorkItemLifecycleValue);
}

function isArtifactCandidateLifecycle(value: unknown): value is ArtifactCandidateLifecycleValue {
  return typeof value === "string"
    && Object.values(ArtifactCandidateLifecycle).includes(value as ArtifactCandidateLifecycleValue);
}

function isRecordObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object"
    && value !== null
    && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function hasDuplicateStrings(values: readonly string[]): boolean {
  return new Set(values).size !== values.length;
}

function freezeRecord(record: PortfolioExecutionRecord): PortfolioExecutionRecord {
  return Object.freeze({
    recordVersion: record.recordVersion,
    executionId: record.executionId,
    aggregatePayload: Object.freeze({
      id: record.aggregatePayload.id,
      portfolioPlanReference: Object.freeze({ ...record.aggregatePayload.portfolioPlanReference }),
      planSnapshotReference: Object.freeze({ ...record.aggregatePayload.planSnapshotReference }),
      approvalReference: Object.freeze({ ...record.aggregatePayload.approvalReference }),
      commandContext: Object.freeze({ ...record.aggregatePayload.commandContext }),
      lifecycle: record.aggregatePayload.lifecycle,
      workItems: Object.freeze(record.aggregatePayload.workItems.map((workItem) => Object.freeze({ ...workItem }))),
      candidates: Object.freeze(record.aggregatePayload.candidates.map((candidate) => Object.freeze({ ...candidate }))),
      acceptedArtifacts: Object.freeze(record.aggregatePayload.acceptedArtifacts.map((acceptedArtifact) => Object.freeze({ ...acceptedArtifact })))
    })
  });
}
