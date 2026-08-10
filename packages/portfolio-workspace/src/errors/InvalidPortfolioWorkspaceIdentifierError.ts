export class InvalidPortfolioWorkspaceIdentifierError extends Error {
  constructor(identifierName: string) {
    super(`${identifierName} cannot be empty.`);
    this.name = "InvalidPortfolioWorkspaceIdentifierError";
  }
}
