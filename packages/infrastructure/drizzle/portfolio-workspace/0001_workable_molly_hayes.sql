CREATE TABLE "portfolio_workspace_idempotency_records" (
	"scope_hash" text PRIMARY KEY NOT NULL,
	"record_version" integer NOT NULL,
	"operation" text NOT NULL,
	"authorization_resource_reference" text NOT NULL,
	"resource_identity" text NOT NULL,
	"idempotency_key_hash" text NOT NULL,
	"request_fingerprint_algorithm" text NOT NULL,
	"request_fingerprint_value" text NOT NULL,
	"status" text NOT NULL,
	"original_command_id" text NOT NULL,
	"original_correlation_id" text NOT NULL,
	"replay_contract_version" text,
	"replay_response_payload" jsonb,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "portfolio_workspace_idempotency_record_version_positive" CHECK ("portfolio_workspace_idempotency_records"."record_version" >= 1),
	CONSTRAINT "portfolio_workspace_idempotency_status_valid" CHECK ("portfolio_workspace_idempotency_records"."status" in ('reserved', 'succeeded')),
	CONSTRAINT "portfolio_workspace_idempotency_fingerprint_algorithm_valid" CHECK ("portfolio_workspace_idempotency_records"."request_fingerprint_algorithm" = 'sha256'),
	CONSTRAINT "portfolio_workspace_idempotency_fingerprint_value_valid" CHECK ("portfolio_workspace_idempotency_records"."request_fingerprint_value" ~ '^[a-f0-9]{64}$'),
	CONSTRAINT "portfolio_workspace_idempotency_key_hash_valid" CHECK ("portfolio_workspace_idempotency_records"."idempotency_key_hash" ~ '^[a-f0-9]{64}$'),
	CONSTRAINT "portfolio_workspace_idempotency_succeeded_payload_complete" CHECK ("portfolio_workspace_idempotency_records"."status" <> 'succeeded' or ("portfolio_workspace_idempotency_records"."replay_contract_version" is not null and "portfolio_workspace_idempotency_records"."replay_response_payload" is not null and "portfolio_workspace_idempotency_records"."completed_at" is not null))
);
--> statement-breakpoint
CREATE UNIQUE INDEX "portfolio_workspace_idempotency_scope_unique" ON "portfolio_workspace_idempotency_records" USING btree ("operation","authorization_resource_reference","resource_identity","idempotency_key_hash");--> statement-breakpoint
CREATE INDEX "portfolio_workspace_idempotency_expires_at_idx" ON "portfolio_workspace_idempotency_records" USING btree ("expires_at");
