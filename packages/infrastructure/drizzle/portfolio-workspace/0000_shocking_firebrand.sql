CREATE TABLE "portfolio_executions" (
	"execution_id" text PRIMARY KEY NOT NULL,
	"record_version" integer NOT NULL,
	"revision" integer NOT NULL,
	"aggregate_payload" jsonb NOT NULL,
	CONSTRAINT "portfolio_executions_record_version_positive" CHECK ("portfolio_executions"."record_version" >= 1),
	CONSTRAINT "portfolio_executions_revision_positive" CHECK ("portfolio_executions"."revision" >= 1)
);
