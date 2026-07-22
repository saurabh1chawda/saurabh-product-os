import { UniqueIdentifier } from "../primitives";

export abstract class Entity<Id extends UniqueIdentifier = UniqueIdentifier> {
  readonly id: Id;

  protected constructor(id: Id) {
    this.id = id;
  }

  equals(other: Entity<Id> | undefined): boolean {
    return other instanceof Entity && this.id.equals(other.id);
  }
}
