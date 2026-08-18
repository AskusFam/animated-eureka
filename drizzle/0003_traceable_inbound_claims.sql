ALTER TABLE "messages" ADD COLUMN "trace_id" text;
--> statement-breakpoint
CREATE UNIQUE INDEX "messages_provider_message_id_unique" ON "messages" USING btree ("provider_message_id");
