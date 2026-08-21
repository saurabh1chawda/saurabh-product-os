import {
  PortfolioWorkspaceIdempotencyContractError,
  PortfolioWorkspaceIdempotencyContractErrorReason
} from "./PortfolioWorkspaceIdempotencyErrors";

export type PortfolioWorkspaceIdempotencyReplayJsonPrimitive = string | number | boolean | null;
export type PortfolioWorkspaceIdempotencyReplayJsonValue =
  | PortfolioWorkspaceIdempotencyReplayJsonPrimitive
  | PortfolioWorkspaceIdempotencyReplayJsonObject
  | PortfolioWorkspaceIdempotencyReplayJsonArray;
export interface PortfolioWorkspaceIdempotencyReplayJsonObject {
  readonly [key: string]: PortfolioWorkspaceIdempotencyReplayJsonValue;
}
export type PortfolioWorkspaceIdempotencyReplayJsonArray = readonly PortfolioWorkspaceIdempotencyReplayJsonValue[];

export class PortfolioWorkspaceIdempotencyReplayPayload {
  private readonly __portfolioWorkspaceIdempotencyReplayPayloadBrand!: never;

  readonly replayContractVersion: string;
  readonly responsePayload: PortfolioWorkspaceIdempotencyReplayJsonObject;

  constructor(input: {
    readonly replayContractVersion: string;
    readonly responsePayload: PortfolioWorkspaceIdempotencyReplayJsonObject;
  }) {
    assertSafeVersion(input.replayContractVersion);
    if (!isJsonObject(input.responsePayload)) {
      throw new PortfolioWorkspaceIdempotencyContractError(PortfolioWorkspaceIdempotencyContractErrorReason.InvalidReplayPayload);
    }

    this.replayContractVersion = input.replayContractVersion;
    this.responsePayload = deepFreezeJson(cloneJson(input.responsePayload)) as PortfolioWorkspaceIdempotencyReplayJsonObject;
    Object.freeze(this);
  }

  equals(other: PortfolioWorkspaceIdempotencyReplayPayload | undefined): boolean {
    return other instanceof PortfolioWorkspaceIdempotencyReplayPayload
      && canonicalize(this.toJSON()) === canonicalize(other.toJSON());
  }

  toJSON(): {
    readonly replayContractVersion: string;
    readonly responsePayload: PortfolioWorkspaceIdempotencyReplayJsonObject;
  } {
    return {
      replayContractVersion: this.replayContractVersion,
      responsePayload: this.responsePayload
    };
  }
}

function assertSafeVersion(value: string): void {
  if (typeof value !== "string" || !/^[a-z0-9][a-z0-9._:-]{0,63}$/u.test(value)) {
    throw new PortfolioWorkspaceIdempotencyContractError(PortfolioWorkspaceIdempotencyContractErrorReason.InvalidReplayPayload);
  }
}

function isJsonObject(value: unknown): value is PortfolioWorkspaceIdempotencyReplayJsonObject {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.getPrototypeOf(value) === Object.prototype
    && Object.values(value).every(isJsonValue);
}

function isJsonValue(value: unknown): value is PortfolioWorkspaceIdempotencyReplayJsonValue {
  return value === null
    || typeof value === "string"
    || typeof value === "boolean"
    || (typeof value === "number" && Number.isFinite(value))
    || (Array.isArray(value) && value.every(isJsonValue))
    || isJsonObject(value);
}

function cloneJson<T extends PortfolioWorkspaceIdempotencyReplayJsonValue>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function deepFreezeJson<T extends PortfolioWorkspaceIdempotencyReplayJsonValue>(value: T): T {
  if (Array.isArray(value)) {
    return Object.freeze(value.map((entry) => deepFreezeJson(entry))) as T;
  }

  if (isJsonObject(value)) {
    const entries = Object.entries(value).map(([key, entry]) => [key, deepFreezeJson(entry)] as const);
    return Object.freeze(Object.fromEntries(entries)) as T;
  }

  return value;
}

function canonicalize(value: unknown): string {
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(canonicalize).join(",")}]`;
  }

  if (!isJsonObject(value)) {
    throw new PortfolioWorkspaceIdempotencyContractError(PortfolioWorkspaceIdempotencyContractErrorReason.InvalidReplayPayload);
  }

  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`).join(",")}}`;
}
