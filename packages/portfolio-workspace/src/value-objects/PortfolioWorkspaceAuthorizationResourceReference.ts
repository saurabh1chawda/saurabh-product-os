import { InvalidPortfolioWorkspaceIdentifierError } from "../errors/InvalidPortfolioWorkspaceIdentifierError";

export interface PortfolioWorkspaceAuthorizationResourceReferenceJson {
  readonly authorizationResourceReference: string;
}

export class PortfolioWorkspaceAuthorizationResourceReference {
  private readonly __portfolioWorkspaceAuthorizationResourceReferenceBrand!: never;

  readonly authorizationResourceReference: string;

  constructor(input: PortfolioWorkspaceAuthorizationResourceReferenceJson) {
    assertSafeReference(
      input.authorizationResourceReference,
      "PortfolioWorkspaceAuthorizationResourceReference.authorizationResourceReference"
    );

    this.authorizationResourceReference = input.authorizationResourceReference;
    Object.freeze(this);
  }

  equals(other: PortfolioWorkspaceAuthorizationResourceReference | undefined): boolean {
    return other instanceof PortfolioWorkspaceAuthorizationResourceReference
      && this.authorizationResourceReference === other.authorizationResourceReference;
  }

  toJSON(): PortfolioWorkspaceAuthorizationResourceReferenceJson {
    return {
      authorizationResourceReference: this.authorizationResourceReference
    };
  }
}

function assertSafeReference(value: string, name: string): void {
  if (typeof value !== "string"
    || value.trim().length === 0
    || value.length > 160
    || /[\u0000-\u001F\u007F]/u.test(value)
    || !/^[A-Za-z0-9._:/-]+$/u.test(value)) {
    throw new InvalidPortfolioWorkspaceIdentifierError(name);
  }
}
