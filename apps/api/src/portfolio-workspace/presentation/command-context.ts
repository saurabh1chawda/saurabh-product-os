import { Result } from "@career-companion/kernel";
import { PortfolioExecutionCommandContext } from "@career-companion/portfolio-workspace";

import { PortfolioWorkspacePresentationContextError } from "./command-context-errors";
import {
  normalizePortfolioWorkspaceCorrelationId,
  type PortfolioWorkspaceCorrelationIdGenerator
} from "./correlation";
import {
  PortfolioWorkspacePresentationPrincipal,
  type PortfolioWorkspacePresentationPrincipalJson
} from "./principals";

export interface PortfolioWorkspaceCommandIdGenerator {
  generate(): string;
}

export interface PortfolioWorkspacePresentationClock {
  now(): Date;
}

export interface PortfolioWorkspaceActorReferenceMapper {
  map(
    principal: PortfolioWorkspacePresentationPrincipal
  ): Result<string, PortfolioWorkspacePresentationContextError>;
}

export interface PortfolioWorkspaceCommandContextFactoryInput {
  readonly principal: PortfolioWorkspacePresentationPrincipal | PortfolioWorkspacePresentationPrincipalJson;
  readonly incomingCorrelationId?: string;
}

export interface PortfolioWorkspaceCommandContextFactoryDependencies {
  readonly commandIdGenerator: PortfolioWorkspaceCommandIdGenerator;
  readonly correlationIdGenerator: PortfolioWorkspaceCorrelationIdGenerator;
  readonly clock: PortfolioWorkspacePresentationClock;
  readonly actorReferenceMapper?: PortfolioWorkspaceActorReferenceMapper;
}

const MAX_CONTEXT_IDENTIFIER_LENGTH = 128;
const SAFE_CONTEXT_IDENTIFIER_PATTERN = /^[A-Za-z0-9._:-]+$/u;

export class DefaultPortfolioWorkspaceActorReferenceMapper implements PortfolioWorkspaceActorReferenceMapper {
  map(
    principal: PortfolioWorkspacePresentationPrincipal
  ): Result<string, PortfolioWorkspacePresentationContextError> {
    const actorReference = [
      principal.principalType,
      principal.authenticationProvider,
      principal.principalId
    ].join(":");

    if (!isSafeContextIdentifier(actorReference)) {
      return Result.failure(PortfolioWorkspacePresentationContextError.invalidActorReference());
    }

    return Result.success(actorReference);
  }
}

export class PortfolioWorkspaceCommandContextFactory {
  private readonly commandIdGenerator: PortfolioWorkspaceCommandIdGenerator;
  private readonly correlationIdGenerator: PortfolioWorkspaceCorrelationIdGenerator;
  private readonly clock: PortfolioWorkspacePresentationClock;
  private readonly actorReferenceMapper: PortfolioWorkspaceActorReferenceMapper;

  constructor(dependencies: PortfolioWorkspaceCommandContextFactoryDependencies) {
    this.commandIdGenerator = dependencies.commandIdGenerator;
    this.correlationIdGenerator = dependencies.correlationIdGenerator;
    this.clock = dependencies.clock;
    this.actorReferenceMapper = dependencies.actorReferenceMapper ?? new DefaultPortfolioWorkspaceActorReferenceMapper();

    Object.freeze(this);
  }

  createCommandContext(
    input: PortfolioWorkspaceCommandContextFactoryInput
  ): Result<PortfolioExecutionCommandContext, PortfolioWorkspacePresentationContextError> {
    const principalResult = input.principal instanceof PortfolioWorkspacePresentationPrincipal
      ? Result.success(input.principal)
      : PortfolioWorkspacePresentationPrincipal.create(input.principal);

    if (principalResult.isFailure) {
      return Result.failure(principalResult.error as PortfolioWorkspacePresentationContextError);
    }

    const principal = principalResult.value as PortfolioWorkspacePresentationPrincipal;
    const actorReferenceResult = this.actorReferenceMapper.map(principal);

    if (actorReferenceResult.isFailure) {
      return Result.failure(actorReferenceResult.error as PortfolioWorkspacePresentationContextError);
    }

    const commandIdResult = this.generateCommandId();

    if (commandIdResult.isFailure) {
      return Result.failure(commandIdResult.error as PortfolioWorkspacePresentationContextError);
    }

    const correlationIdResult = normalizePortfolioWorkspaceCorrelationId({
      incomingCorrelationId: input.incomingCorrelationId,
      generator: this.correlationIdGenerator
    });

    if (correlationIdResult.isFailure) {
      return Result.failure(correlationIdResult.error as PortfolioWorkspacePresentationContextError);
    }

    const occurredAtResult = this.captureOccurredAt();

    if (occurredAtResult.isFailure) {
      return Result.failure(occurredAtResult.error as PortfolioWorkspacePresentationContextError);
    }

    try {
      return Result.success(new PortfolioExecutionCommandContext({
        commandId: commandIdResult.value as string,
        correlationId: correlationIdResult.value as string,
        actorReference: actorReferenceResult.value as string,
        occurredAt: occurredAtResult.value as string
      }));
    } catch {
      return Result.failure(PortfolioWorkspacePresentationContextError.commandContextConstructionFailed());
    }
  }

  private generateCommandId(): Result<string, PortfolioWorkspacePresentationContextError> {
    let commandId: string;

    try {
      commandId = this.commandIdGenerator.generate();
    } catch {
      return Result.failure(PortfolioWorkspacePresentationContextError.commandIdGenerationFailed());
    }

    if (!isSafeContextIdentifier(commandId)) {
      return Result.failure(PortfolioWorkspacePresentationContextError.commandIdGenerationFailed());
    }

    return Result.success(commandId);
  }

  private captureOccurredAt(): Result<string, PortfolioWorkspacePresentationContextError> {
    let occurredAt: Date;

    try {
      occurredAt = this.clock.now();
    } catch {
      return Result.failure(PortfolioWorkspacePresentationContextError.clockFailed());
    }

    if (!(occurredAt instanceof Date) || Number.isNaN(occurredAt.getTime())) {
      return Result.failure(PortfolioWorkspacePresentationContextError.clockFailed());
    }

    return Result.success(occurredAt.toISOString());
  }
}

function isSafeContextIdentifier(value: string): boolean {
  if (typeof value !== "string") {
    return false;
  }

  const normalized = value.trim();

  return normalized === value
    && normalized.length > 0
    && normalized.length <= MAX_CONTEXT_IDENTIFIER_LENGTH
    && SAFE_CONTEXT_IDENTIFIER_PATTERN.test(normalized);
}
