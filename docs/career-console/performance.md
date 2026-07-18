# Career Console Performance

## Performance Model

The console is local-first and reads committed JSON files at render time. The only client-side interactive surface is the application table.

## Implemented Controls

- Server-side read model for registry and intelligence data.
- Client-side filtering limited to the application table.
- Memoized filtering and option generation.
- Pagination with a default page size of 10.
- No third-party charting dependency.
- CSS-based pipeline visualization.
- No private data fetches from runtime storage.

## Scale Target

The interface should remain usable with thousands of applications by keeping filters local, avoiding expensive visualizations, and paginating table output.

## Future Improvements

- Virtualized rows if registry size grows beyond browser-comfortable limits.
- Browser performance tests for large synthetic datasets.
- Optional static precomputation of console summaries.

