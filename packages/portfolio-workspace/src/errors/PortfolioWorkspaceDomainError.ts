export abstract class PortfolioWorkspaceDomainError extends Error {
  readonly code: string;

  protected constructor(name: string, code: string, message: string) {
    super(message);
    this.name = name;
    this.code = code;
    Object.freeze(this);
  }
}
