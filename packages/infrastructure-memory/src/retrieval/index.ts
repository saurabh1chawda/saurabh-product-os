import type {
  CompetencyQuery,
  CompetencyRetrievalService,
  CursorRequest,
  DecisionQuery,
  DecisionRetrievalService,
  EvidenceQuery,
  EvidenceRetrievalService,
  Filter,
  FilterGroup,
  IdentityQuery,
  IdentityRetrievalService,
  KnowledgeQuery,
  KnowledgeRetrievalService,
  MetricQuery,
  MetricRetrievalService,
  MultiSort,
  PageRequest,
  Projection,
  RetrievalContext,
  RetrievalEntityType,
  RetrievalField,
  RetrievalReference,
  RetrievalResult,
  StoryQuery,
  StoryRetrievalService
} from "@career-companion/retrieval";
import { DeepClone, ImmutableCollectionFactory, timestamp } from "../shared";

type Query =
  | KnowledgeQuery
  | IdentityQuery
  | CompetencyQuery
  | StoryQuery
  | EvidenceQuery
  | MetricQuery
  | DecisionQuery;

export class InMemoryRetrievalService<TItem extends object> {
  constructor(
    private readonly entityType: RetrievalEntityType,
    private readonly items: readonly TItem[] = []
  ) {}

  retrieve(query: Query, context?: RetrievalContext): RetrievalResult<TItem> {
    const filtered = this.applyFilters(this.items, query.filters);
    const sorted = this.applySorting(filtered, query.sorting);
    const paginated = this.applyPagination(sorted, query.pagination);
    const projected = paginated.map((item) => this.applyProjection(item, query.projection));
    const immutableItems = ImmutableCollectionFactory.create(projected);
    const references = ImmutableCollectionFactory.create(immutableItems.map((item) => this.toReference(item)));

    return Object.freeze({
      items: immutableItems,
      references,
      confidence: Object.freeze({
        value: 1,
        level: "high",
        reason: "In-memory retrieval applies deterministic contract criteria only."
      }),
      explanation: Object.freeze({
        summary: "Retrieved from deterministic in-memory projection.",
        matchedFields: Object.freeze(query.projection?.fieldMask?.fields ?? []),
        reasons: Object.freeze(["filtering", "sorting", "pagination", "projection"]),
        references
      }),
      summary: Object.freeze({
        queryName: query.queryName,
        resultCount: immutableItems.length
      }),
      metadata: Object.freeze({
        retrievalTimestamp: context?.retrievalTimestamp ?? timestamp(),
        sourceVersion: context?.modelVersion,
        context: context?.metadata
      })
    });
  }

  private applyFilters(items: readonly TItem[], group: FilterGroup | undefined): readonly TItem[] {
    if (group === undefined) {
      return [...items];
    }

    return items.filter((item) => this.evaluateGroup(item, group));
  }

  private evaluateGroup(item: TItem, group: FilterGroup): boolean {
    const evaluations = [
      ...group.filters.map((filter) => this.evaluateFilter(item, filter)),
      ...group.rangeFilters.map((filter) => {
        const value = this.fieldValue(item, filter.field);
        return compareRange(value, filter.minimum, filter.maximum, filter.includeMinimum, filter.includeMaximum);
      }),
      ...group.textFilters.map((filter) => {
        const value = String(this.fieldValue(item, filter.field) ?? "");
        const source = filter.caseSensitive ? value : value.toLowerCase();
        const text = filter.caseSensitive ? filter.text : filter.text.toLowerCase();

        if (filter.matchMode === "exact") {
          return source === text;
        }

        if (filter.matchMode === "prefix") {
          return source.startsWith(text);
        }

        if (filter.matchMode === "token") {
          return source.split(/\s+/u).includes(text);
        }

        return source.includes(text);
      }),
      ...group.tagFilters.map((filter) => {
        const rawTags = this.fieldValue(item, filter.field);
        const tags = Array.isArray(rawTags) ? rawTags.map(String) : [];

        if (filter.matchMode === "all") {
          return filter.tags.every((tag) => tags.includes(tag));
        }

        if (filter.matchMode === "none") {
          return filter.tags.every((tag) => !tags.includes(tag));
        }

        return filter.tags.some((tag) => tags.includes(tag));
      }),
      ...group.groups.map((child) => this.evaluateGroup(item, child))
    ];

    if (group.operator === "or") {
      return evaluations.some(Boolean);
    }

    if (group.operator === "not") {
      return !evaluations.every(Boolean);
    }

    return evaluations.every(Boolean);
  }

  private evaluateFilter(item: TItem, filter: Filter): boolean {
    const value = this.fieldValue(item, filter.field);

    switch (filter.operator) {
      case "equals":
        return value === filter.value;
      case "not-equals":
        return value !== filter.value;
      case "greater-than":
        return compare(value, filter.value) > 0;
      case "greater-than-or-equal":
        return compare(value, filter.value) >= 0;
      case "less-than":
        return compare(value, filter.value) < 0;
      case "less-than-or-equal":
        return compare(value, filter.value) <= 0;
      case "contains":
        return String(value ?? "").includes(String(filter.value ?? ""));
      case "starts-with":
        return String(value ?? "").startsWith(String(filter.value ?? ""));
      case "ends-with":
        return String(value ?? "").endsWith(String(filter.value ?? ""));
      case "in":
        return Array.isArray(filter.value) && filter.value.includes(value);
      case "not-in":
        return Array.isArray(filter.value) && !filter.value.includes(value);
      case "exists":
        return value !== undefined && value !== null;
    }
  }

  private applySorting(items: readonly TItem[], sorting: MultiSort | undefined): readonly TItem[] {
    if (sorting === undefined || sorting.fields.length === 0) {
      return [...items];
    }

    return [...items]
      .map((item, index) => Object.freeze({ item, index }))
      .sort((left, right) => {
        for (const sort of sorting.fields) {
          const result = compare(this.fieldValue(left.item, sort.field), this.fieldValue(right.item, sort.field));
          if (result !== 0) {
            return sort.direction === "ascending" ? result : -result;
          }
        }

        return left.index - right.index;
      })
      .map((entry) => entry.item);
  }

  private applyPagination(items: readonly TItem[], pagination: PageRequest | CursorRequest | undefined): readonly TItem[] {
    if (pagination === undefined) {
      return [...items];
    }

    if ("pageNumber" in pagination) {
      const start = Math.max(0, (pagination.pageNumber - 1) * pagination.pageSize);
      return items.slice(start, start + pagination.pageSize);
    }

    const start = pagination.cursor === undefined ? 0 : Number.parseInt(pagination.cursor, 10);
    const safeStart = Number.isFinite(start) ? Math.max(0, start) : 0;
    return items.slice(safeStart, safeStart + pagination.limit);
  }

  private applyProjection(item: TItem, projection: Projection | undefined): TItem {
    if (projection === undefined) {
      return DeepClone.clone(item);
    }

    const include = projection.fieldMask?.fields ?? projection.selectionSet?.include ?? [];
    const exclude = projection.selectionSet?.exclude ?? [];

    if (include.length === 0 && exclude.length === 0) {
      return DeepClone.clone(item);
    }

    const output: Record<string, unknown> = {};
    const source = item as Record<string, unknown>;
    const fields = include.length > 0 ? include : Object.keys(source);

    for (const field of fields) {
      if (!exclude.includes(field)) {
        output[field] = this.fieldValue(item, field);
      }
    }

    return Object.freeze(output) as TItem;
  }

  private toReference(item: TItem): RetrievalReference {
    const id = this.fieldValue(item, "id");
    const label = this.fieldValue(item, "name") ?? this.fieldValue(item, "title") ?? this.fieldValue(item, "displayName");

    return Object.freeze({
      referenceId: String(id ?? "unknown"),
      entityType: this.entityType,
      label: label === undefined ? undefined : String(label)
    });
  }

  private fieldValue(item: TItem, field: RetrievalField): unknown {
    return field.split(".").reduce<unknown>((current, part) => {
      if (current === null || current === undefined || typeof current !== "object") {
        return undefined;
      }

      return (current as Record<string, unknown>)[part];
    }, item);
  }
}

export class InMemoryKnowledgeRetrievalService<TItem extends object = Record<string, unknown>>
  implements KnowledgeRetrievalService<TItem>
{
  private readonly service: InMemoryRetrievalService<TItem>;

  constructor(items: readonly TItem[] = []) {
    this.service = new InMemoryRetrievalService("knowledge", items);
  }

  retrieveKnowledge(query: KnowledgeQuery, context?: RetrievalContext): RetrievalResult<TItem> {
    return this.service.retrieve(query, context);
  }
}

export class InMemoryIdentityRetrievalService<TItem extends object = Record<string, unknown>>
  implements IdentityRetrievalService<TItem>
{
  private readonly service: InMemoryRetrievalService<TItem>;

  constructor(items: readonly TItem[] = []) {
    this.service = new InMemoryRetrievalService("identity", items);
  }

  retrieveIdentities(query: IdentityQuery, context?: RetrievalContext): RetrievalResult<TItem> {
    return this.service.retrieve(query, context);
  }
}

export class InMemoryCompetencyRetrievalService<TItem extends object = Record<string, unknown>>
  implements CompetencyRetrievalService<TItem>
{
  private readonly service: InMemoryRetrievalService<TItem>;

  constructor(items: readonly TItem[] = []) {
    this.service = new InMemoryRetrievalService("competency", items);
  }

  retrieveCompetencies(query: CompetencyQuery, context?: RetrievalContext): RetrievalResult<TItem> {
    return this.service.retrieve(query, context);
  }
}

export class InMemoryStoryRetrievalService<TItem extends object = Record<string, unknown>>
  implements StoryRetrievalService<TItem>
{
  private readonly service: InMemoryRetrievalService<TItem>;

  constructor(items: readonly TItem[] = []) {
    this.service = new InMemoryRetrievalService("story", items);
  }

  retrieveStories(query: StoryQuery, context?: RetrievalContext): RetrievalResult<TItem> {
    return this.service.retrieve(query, context);
  }
}

export class InMemoryEvidenceRetrievalService<TItem extends object = Record<string, unknown>>
  implements EvidenceRetrievalService<TItem>
{
  private readonly service: InMemoryRetrievalService<TItem>;

  constructor(items: readonly TItem[] = []) {
    this.service = new InMemoryRetrievalService("evidence", items);
  }

  retrieveEvidence(query: EvidenceQuery, context?: RetrievalContext): RetrievalResult<TItem> {
    return this.service.retrieve(query, context);
  }
}

export class InMemoryMetricRetrievalService<TItem extends object = Record<string, unknown>>
  implements MetricRetrievalService<TItem>
{
  private readonly service: InMemoryRetrievalService<TItem>;

  constructor(items: readonly TItem[] = []) {
    this.service = new InMemoryRetrievalService("metric", items);
  }

  retrieveMetrics(query: MetricQuery, context?: RetrievalContext): RetrievalResult<TItem> {
    return this.service.retrieve(query, context);
  }
}

export class InMemoryDecisionRetrievalService<TItem extends object = Record<string, unknown>>
  implements DecisionRetrievalService<TItem>
{
  private readonly service: InMemoryRetrievalService<TItem>;

  constructor(items: readonly TItem[] = []) {
    this.service = new InMemoryRetrievalService("decision", items);
  }

  retrieveDecisions(query: DecisionQuery, context?: RetrievalContext): RetrievalResult<TItem> {
    return this.service.retrieve(query, context);
  }
}

function compare(left: unknown, right: unknown): number {
  if (left === right) {
    return 0;
  }

  if (left === undefined || left === null) {
    return -1;
  }

  if (right === undefined || right === null) {
    return 1;
  }

  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  return String(left).localeCompare(String(right));
}

function compareRange(
  value: unknown,
  minimum: string | number | undefined,
  maximum: string | number | undefined,
  includeMinimum: boolean,
  includeMaximum: boolean
): boolean {
  const minResult = minimum === undefined ? true : includeMinimum ? compare(value, minimum) >= 0 : compare(value, minimum) > 0;
  const maxResult = maximum === undefined ? true : includeMaximum ? compare(value, maximum) <= 0 : compare(value, maximum) < 0;
  return minResult && maxResult;
}
