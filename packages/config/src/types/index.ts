export type ConfigurationKey = string;

export type ConfigurationScalar = string | number | boolean;

export type ConfigurationValue =
  | ConfigurationScalar
  | readonly ConfigurationScalar[]
  | Readonly<Record<string, ConfigurationScalar>>;

export type ConfigurationNamespace = string;

export type ConfigurationMetadata = Readonly<Record<string, unknown>>;
