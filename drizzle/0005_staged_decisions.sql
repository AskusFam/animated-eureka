ALTER TABLE "trip_options" ADD COLUMN "stage" text DEFAULT 'place' NOT NULL;
--> statement-breakpoint
DROP INDEX IF EXISTS "trip_options_trip_code_unique";
--> statement-breakpoint
CREATE UNIQUE INDEX "trip_options_trip_stage_code_unique" ON "trip_options" USING btree ("trip_id","stage","code");
--> statement-breakpoint
CREATE TABLE "trip_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"stage" text NOT NULL,
	"voter_key" text NOT NULL,
	"option_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "trip_votes_trip_stage_voter_unique" ON "trip_votes" USING btree ("trip_id","stage","voter_key");
--> statement-breakpoint
CREATE TABLE "itineraries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL UNIQUE,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "trip_votes" ADD CONSTRAINT "trip_votes_trip_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id");
--> statement-breakpoint
ALTER TABLE "trip_votes" ADD CONSTRAINT "trip_votes_option_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."trip_options"("id");
--> statement-breakpoint
ALTER TABLE "itineraries" ADD CONSTRAINT "itineraries_trip_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id");
