export type Primitive = string | number | boolean | bigint | symbol | null | undefined;

export type DomainMetadata = Readonly<Record<string, unknown>>;

export type DomainTimestamp = string;

export type Version = number;

export class UniqueIdentifier {
  readonly value: string;

  constructor(value: string) {
    if (value.trim().length === 0) {
      throw new InvalidIdentifierError("UniqueIdentifier cannot be empty.");
    }

    this.value = value;
  }

  equals(other: UniqueIdentifier | undefined): boolean {
    return other instanceof UniqueIdentifier && this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

export class InvalidIdentifierError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidIdentifierError";
  }
}
