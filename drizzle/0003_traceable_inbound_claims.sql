ALTER TABLE "messages" ADD COLUMN "trace_id" text;
--> statement-breakpoint
WITH ranked_messages AS (
	SELECT "id", ROW_NUMBER() OVER (PARTITION BY "provider_message_id" ORDER BY "created_at", "id") AS row_number
	FROM "messages"
	WHERE "provider_message_id" IS NOT NULL
)
UPDATE "messages"
SET "provider_message_id" = NULL
WHERE "id" IN (SELECT "id" FROM ranked_messages WHERE row_number > 1);
--> statement-breakpoint
CREATE UNIQUE INDEX "messages_provider_message_id_unique" ON "messages" USING btree ("provider_message_id");
