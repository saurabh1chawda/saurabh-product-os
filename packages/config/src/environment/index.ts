import type { ConfigurationMetadata } from "../types";

export type EnvironmentName =
  | "local"
  | "development"
  | "test"
  | "staging"
  | "production";

export interface Environment {
  readonly name: EnvironmentName;
  readonly isProduction: boolean;
  readonly metadata: ConfigurationMetadata;
}
