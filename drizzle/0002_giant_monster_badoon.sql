CREATE TABLE "conversation_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone_number" text NOT NULL,
	"trip_id" uuid,
	"participant_id" uuid,
	"state" text DEFAULT 'new' NOT NULL,
	"intake" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "conversation_sessions_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
ALTER TABLE "conversation_sessions" ADD CONSTRAINT "conversation_sessions_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_sessions" ADD CONSTRAINT "conversation_sessions_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE no action ON UPDATE no action;