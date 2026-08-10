import { Result } from "@career-companion/kernel";

import { PortfolioWorkspacePresentationContextError } from "./command-context-errors";

export interface PortfolioWorkspaceCorrelationIdGenerator {
  generate(): string;
}

const MAX_CORRELATION_ID_LENGTH = 128;
const SAFE_CORRELATION_ID_PATTERN = /^[A-Za-z0-9._:-]+$/u;

export function normalizePortfolioWorkspaceCorrelationId(input: {
  readonly incomingCorrelationId?: string;
  readonly generator: PortfolioWorkspaceCorrelationIdGenerator;
}): Result<string, PortfolioWorkspacePresentationContextError> {
  if (input.incomingCorrelationId !== undefined) {
    const normalized = normalizeSafeCorrelationId(input.incomingCorrelationId);

    if (normalized !== undefined) {
      return Result.success(normalized);
    }
  }

  let generated: string;

  try {
    generated = input.generator.generate();
  } catch {
    return Result.failure(PortfolioWorkspacePresentationContextError.correlationIdGenerationFailed());
  }

  const normalizedGenerated = normalizeSafeCorrelationId(generated);

  if (normalizedGenerated === undefined) {
    return Result.failure(PortfolioWorkspacePresentationContextError.correlationIdGenerationFailed());
  }

  return Result.success(normalizedGenerated);
}

function normalizeSafeCorrelationId(value: string): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();

  if (normalized.length === 0 || normalized.length > MAX_CORRELATION_ID_LENGTH) {
    return undefined;
  }

  if (!SAFE_CORRELATION_ID_PATTERN.test(normalized)) {
    return undefined;
  }

  return normalized;
}
