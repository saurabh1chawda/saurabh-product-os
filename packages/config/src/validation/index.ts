import type { ConfigurationKey, ConfigurationMetadata } from "../types";

export type ConfigurationErrorCode =
  | "configuration.missing"
  | "configuration.invalid"
  | "configuration.unsupported"
  | "configuration.conflict";

export interface ConfigurationError {
  readonly code: ConfigurationErrorCode;
  readonly message: string;
  readonly key?: ConfigurationKey;
  readonly metadata?: ConfigurationMetadata;
}

export interface ConfigurationValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ConfigurationError[];
}
