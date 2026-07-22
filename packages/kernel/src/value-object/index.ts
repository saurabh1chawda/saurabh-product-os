type ComparableRecord = Readonly<Record<string, unknown>>;

export abstract class ValueObject<Props extends ComparableRecord = ComparableRecord> {
  readonly props: Props;

  protected constructor(props: Props) {
    this.props = props;
  }

  equals(other: ValueObject<Props> | undefined): boolean {
    return other instanceof ValueObject && areStructurallyEqual(this.props, other.props);
  }
}

function areStructurallyEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) {
    return true;
  }

  if (!isComparableRecord(left) || !isComparableRecord(right)) {
    return false;
  }

  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  return leftKeys.every((key) => areStructurallyEqual(left[key], right[key]));
}

function isComparableRecord(value: unknown): value is ComparableRecord {
  return typeof value === "object" && value !== null;
}
