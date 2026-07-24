export function immutableArray<T>(items: readonly T[]): readonly T[] {
  return Object.freeze([...items]);
}

export function immutableRecord<T extends object>(record: T): Readonly<T> {
  return Object.freeze({ ...record });
}

export function idToString(value: { readonly toString: () => string }): string {
  return value.toString();
}

export function clamp(value: number, minimum: number, maximum: number): number {
  if (!Number.isFinite(value)) {
    return minimum;
  }

  return Math.min(Math.max(value, minimum), maximum);
}

export function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function tokenize(value: string): readonly string[] {
  return Object.freeze(normalizeText(value).split(/[^a-z0-9]+/u).filter((token) => token.length > 0));
}
