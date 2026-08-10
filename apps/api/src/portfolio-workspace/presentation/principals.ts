import { Result } from "@career-companion/kernel";

import { PortfolioWorkspacePresentationContextError } from "./command-context-errors";

export const PortfolioWorkspacePresentationPrincipalType = {
  User: "user",
  Service: "service"
} as const;

export type PortfolioWorkspacePresentationPrincipalTypeValue =
  (typeof PortfolioWorkspacePresentationPrincipalType)[keyof typeof PortfolioWorkspacePresentationPrincipalType];

export interface PortfolioWorkspacePresentationPrincipalJson {
  readonly principalId: string;
  readonly principalType: PortfolioWorkspacePresentationPrincipalTypeValue;
  readonly authenticationProvider: string;
  readonly displayName?: string;
}

const MAX_PRINCIPAL_FIELD_LENGTH = 128;
const MAX_DISPLAY_NAME_LENGTH = 256;

export class PortfolioWorkspacePresentationPrincipal {
  readonly principalId: string;
  readonly principalType: PortfolioWorkspacePresentationPrincipalTypeValue;
  readonly authenticationProvider: string;
  readonly displayName?: string;

  private constructor(input: PortfolioWorkspacePresentationPrincipalJson) {
    this.principalId = input.principalId;
    this.principalType = input.principalType;
    this.authenticationProvider = input.authenticationProvider;
    this.displayName = input.displayName;

    Object.freeze(this);
  }

  static create(
    input: PortfolioWorkspacePresentationPrincipalJson
  ): Result<PortfolioWorkspacePresentationPrincipal, PortfolioWorkspacePresentationContextError> {
    const principalId = normalizeTrustedField(input.principalId);
    const authenticationProvider = normalizeTrustedField(input.authenticationProvider);
    const displayName = normalizeOptionalTrustedField(input.displayName);

    if (principalId === undefined || principalId.length > MAX_PRINCIPAL_FIELD_LENGTH) {
      return Result.failure(PortfolioWorkspacePresentationContextError.invalidPrincipal("Invalid authenticated principal."));
    }

    if (!isPortfolioWorkspacePresentationPrincipalType(input.principalType)) {
      return Result.failure(PortfolioWorkspacePresentationContextError.invalidPrincipal("Invalid authenticated principal type."));
    }

    if (authenticationProvider === undefined || authenticationProvider.length > MAX_PRINCIPAL_FIELD_LENGTH) {
      return Result.failure(PortfolioWorkspacePresentationContextError.invalidPrincipal("Invalid authentication provider."));
    }

    if (displayName !== undefined && displayName.length > MAX_DISPLAY_NAME_LENGTH) {
      return Result.failure(PortfolioWorkspacePresentationContextError.invalidPrincipal("Invalid principal display name."));
    }

    return Result.success(new PortfolioWorkspacePresentationPrincipal({
      principalId,
      principalType: input.principalType,
      authenticationProvider,
      displayName
    }));
  }

  equals(other: PortfolioWorkspacePresentationPrincipal | undefined): boolean {
    return other instanceof PortfolioWorkspacePresentationPrincipal
      && this.principalId === other.principalId
      && this.principalType === other.principalType
      && this.authenticationProvider === other.authenticationProvider
      && this.displayName === other.displayName;
  }

  toJSON(): PortfolioWorkspacePresentationPrincipalJson {
    return {
      principalId: this.principalId,
      principalType: this.principalType,
      authenticationProvider: this.authenticationProvider,
      ...(this.displayName === undefined ? {} : { displayName: this.displayName })
    };
  }
}

export function isPortfolioWorkspacePresentationPrincipalType(
  value: string
): value is PortfolioWorkspacePresentationPrincipalTypeValue {
  return Object.values(PortfolioWorkspacePresentationPrincipalType).includes(
    value as PortfolioWorkspacePresentationPrincipalTypeValue
  );
}

function normalizeTrustedField(value: string): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();

  if (normalized.length === 0 || containsUnsafeControlCharacters(normalized)) {
    return undefined;
  }

  return normalized;
}

function normalizeOptionalTrustedField(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return normalizeTrustedField(value);
}

function containsUnsafeControlCharacters(value: string): boolean {
  return /[\u0000-\u001F\u007F]/u.test(value);
}
