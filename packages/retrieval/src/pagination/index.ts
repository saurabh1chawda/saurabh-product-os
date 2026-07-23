export interface PageRequest {
  readonly pageNumber: number;
  readonly pageSize: number;
}

export interface CursorRequest {
  readonly cursor?: string;
  readonly limit: number;
}

export interface PageMetadata {
  readonly pageNumber: number;
  readonly pageSize: number;
  readonly totalItems?: number;
  readonly totalPages?: number;
  readonly hasPreviousPage: boolean;
  readonly hasNextPage: boolean;
}

export interface CursorMetadata {
  readonly cursor?: string;
  readonly nextCursor?: string;
  readonly previousCursor?: string;
  readonly limit: number;
  readonly hasMore: boolean;
}

export interface Page<TItem> {
  readonly items: readonly TItem[];
  readonly metadata: PageMetadata;
}

export interface CursorPage<TItem> {
  readonly items: readonly TItem[];
  readonly metadata: CursorMetadata;
}
