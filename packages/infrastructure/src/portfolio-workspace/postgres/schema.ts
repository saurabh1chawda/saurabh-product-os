import { sql } from "drizzle-orm";
import { check, integer, jsonb, pgTable, text } from "drizzle-orm/pg-core";
import type { PortfolioExecutionAggregatePayload } from "../persistence";

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
