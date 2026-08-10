# Infrastructure Memory

Canonical in-memory implementations of Career Companion platform contracts.

This package exists for deterministic tests, runtime validation, and future adapter comparison. It does not provide production persistence, network access, AI execution, database clients, filesystem access, or external infrastructure integrations.

The Portfolio Workspace in-memory repository implements the asynchronous Application-owned repository port and simulates revision-aware optimistic concurrency for contract tests while remaining non-durable infrastructure. It resolves operations immediately without timers, background work, database clients, or durable storage.
