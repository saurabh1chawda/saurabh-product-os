export class ImmutableCollection<T> implements Iterable<T> {
  private readonly items: readonly T[];

  constructor(items: readonly T[] = []) {
    this.items = [...items];
  }

  get length(): number {
    return this.items.length;
  }

  at(index: number): T | undefined {
    return this.items[index];
  }

  toArray(): readonly T[] {
    return [...this.items];
  }

  map<Mapped>(mapper: (item: T, index: number) => Mapped): readonly Mapped[] {
    return this.items.map(mapper);
  }

  filter(predicate: (item: T, index: number) => boolean): ImmutableCollection<T> {
    return new ImmutableCollection(this.items.filter(predicate));
  }

  [Symbol.iterator](): Iterator<T> {
    return this.items[Symbol.iterator]();
  }
}
