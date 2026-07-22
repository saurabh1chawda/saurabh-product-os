export enum LogLevel {
  Debug = "debug",
  Info = "info",
  Warn = "warn",
  Error = "error",
  Fatal = "fatal"
}

export type CorrelationId = string;

export interface LogContext {
  readonly correlationId?: CorrelationId;
  readonly workflowInstanceId?: string;
  readonly executionId?: string;
  readonly capabilityId?: string;
  readonly actorId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface LogEntry {
  readonly level: LogLevel;
  readonly message: string;
  readonly timestamp: string;
  readonly context?: LogContext;
  readonly error?: unknown;
}

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext, error?: unknown): void;
  fatal(message: string, context?: LogContext, error?: unknown): void;
}

export interface ExecutionLogger extends Logger {
  executionStarted(context: LogContext): void;
  executionCompleted(context: LogContext): void;
  executionFailed(context: LogContext, error: unknown): void;
}

export interface WorkflowLogger extends Logger {
  workflowTransitionEvaluated(context: LogContext): void;
  workflowTransitionCommitted(context: LogContext): void;
  workflowBlocked(context: LogContext): void;
}

export interface CapabilityLogger extends Logger {
  capabilityResolved(context: LogContext): void;
  capabilityExecutionStarted(context: LogContext): void;
  capabilityExecutionCompleted(context: LogContext): void;
  capabilityExecutionFailed(context: LogContext, error: unknown): void;
}

export interface AuditLogger extends Logger {
  auditEventRecorded(entry: LogEntry): void;
}
