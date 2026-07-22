import type {
  ConfigurationKey,
  ConfigurationMetadata,
  ConfigurationNamespace,
  ConfigurationValue
} from "../types";
import type { ConfigurationValidationResult } from "../validation";

export interface ConfigurationSource {
  readonly name: string;
  readonly namespace?: ConfigurationNamespace;
  readonly priority: number;
  has(key: ConfigurationKey): boolean;
  get(key: ConfigurationKey): ConfigurationValue | undefined;
  describe(): ConfigurationMetadata;
}

export interface ConfigurationProvider {
  has(key: ConfigurationKey): boolean;
  get(key: ConfigurationKey): ConfigurationValue | undefined;
  require(key: ConfigurationKey): ConfigurationValue;
  validate(): ConfigurationValidationResult;
}
