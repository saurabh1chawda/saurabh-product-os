import type { DomainMetadata } from "@career-companion/kernel";
import type { ExecutionContext } from "../context";

export interface PolicyDecision {
  readonly allowed: boolean;
  readonly reason?: string;
  readonly metadata?: DomainMetadata;
}

export interface AuthorizationPolicy<TRequest = unknown> {
  evaluateAuthorization(request: TRequest, context: ExecutionContext): PolicyDecision;
}

export interface ExecutionPolicy<TRequest = unknown> {
  evaluateExecution(request: TRequest, context: ExecutionContext): PolicyDecision;
}

export interface ValidationPolicy<TRequest = unknown> {
  evaluateValidation(request: TRequest, context: ExecutionContext): PolicyDecision;
}

export interface RetryPolicy<TFailure = unknown> {
  shouldRetry(failure: TFailure, context: ExecutionContext): PolicyDecision;
}

export type UseCasePolicy<TRequest = unknown> =
  | AuthorizationPolicy<TRequest>
  | ExecutionPolicy<TRequest>
  | ValidationPolicy<TRequest>
  | RetryPolicy;

