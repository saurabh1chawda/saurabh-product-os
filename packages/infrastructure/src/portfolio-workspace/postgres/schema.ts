import { sql } from "drizzle-orm";
import { check, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import type { PortfolioExecutionAggregatePayload } from "../persistence";
import type { PortfolioWorkspaceIdempotencyReplayPayloadJson } from "../idempotency";

export const portfolioExecutions = pgTable("portfolio_executions", {
  executionId: text("execution_id").primaryKey().notNull(),
  recordVersion: integer("record_version").notNull(),
  revision: integer("revision").notNull(),
  aggregatePayload: jsonb("aggregate_payload").$type<PortfolioExecutionAggregatePayload>().notNull()
}, (table) => [
  check("portfolio_executions_record_version_positive", sql`${table.recordVersion} >= 1`),
  check("portfolio_executions_revision_positive", sql`${table.revision} >= 1`)
]);

export type PortfolioExecutionRow = typeof portfolioExecutions.$inferSelect;
export type NewPortfolioExecutionRow = typeof portfolioExecutions.$inferInsert;

export const portfolioWorkspaceIdempotencyRecords = pgTable("portfolio_workspace_idempotency_records", {
  scopeHash: text("scope_hash").primaryKey().notNull(),
  recordVersion: integer("record_version").notNull(),
  operation: text("operation").notNull(),
  authorizationResourceReference: text("authorization_resource_reference").notNull(),
  resourceIdentity: text("resource_identity").notNull(),
  idempotencyKeyHash: text("idempotency_key_hash").notNull(),
  requestFingerprintAlgorithm: text("request_fingerprint_algorithm").notNull(),
  requestFingerprintValue: text("request_fingerprint_value").notNull(),
  status: text("status").notNull(),
  originalCommandId: text("original_command_id").notNull(),
  originalCorrelationId: text("original_correlation_id").notNull(),
  replayContractVersion: text("replay_contract_version"),
  replayResponsePayload: jsonb("replay_response_payload").$type<PortfolioWorkspaceIdempotencyReplayPayloadJson["responsePayload"]>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull()
}, (table) => [
  uniqueIndex("portfolio_workspace_idempotency_scope_unique").on(
    table.operation,
    table.authorizationResourceReference,
    table.resourceIdentity,
    table.idempotencyKeyHash
  ),
  index("portfolio_workspace_idempotency_expires_at_idx").on(table.expiresAt),
  check("portfolio_workspace_idempotency_record_version_positive", sql`${table.recordVersion} >= 1`),
  check("portfolio_workspace_idempotency_status_valid", sql`${table.status} in ('reserved', 'succeeded')`),
  check("portfolio_workspace_idempotency_fingerprint_algorithm_valid", sql`${table.requestFingerprintAlgorithm} = 'sha256'`),
  check("portfolio_workspace_idempotency_fingerprint_value_valid", sql`${table.requestFingerprintValue} ~ '^[a-f0-9]{64}$'`),
  check("portfolio_workspace_idempotency_key_hash_valid", sql`${table.idempotencyKeyHash} ~ '^[a-f0-9]{64}$'`),
  check("portfolio_workspace_idempotency_succeeded_payload_complete", sql`${table.status} <> 'succeeded' or (${table.replayContractVersion} is not null and ${table.replayResponsePayload} is not null and ${table.completedAt} is not null)`)
]);

export type PortfolioWorkspaceIdempotencyRow = typeof portfolioWorkspaceIdempotencyRecords.$inferSelect;
export type NewPortfolioWorkspaceIdempotencyRow = typeof portfolioWorkspaceIdempotencyRecords.$inferInsert;
