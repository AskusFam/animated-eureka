CREATE TABLE "trip_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"destination" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "trip_options_trip_code_unique" ON "trip_options" USING btree ("trip_id","code");
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cache_key" text NOT NULL UNIQUE,
	"url" text NOT NULL,
	"kind" text DEFAULT 'trip_option' NOT NULL,
	"source" text DEFAULT 'curated_fallback' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trip_option_assets" (
	"trip_option_id" uuid NOT NULL,
	"media_asset_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "trip_option_assets_unique" ON "trip_option_assets" USING btree ("trip_option_id","media_asset_id");
--> statement-breakpoint
CREATE TABLE "message_option_map" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" uuid NOT NULL,
	"trip_option_id" uuid NOT NULL,
	"participant_id" uuid,
	"provider_message_handle" text NOT NULL UNIQUE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "option_reactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_option_id" uuid NOT NULL,
	"participant_id" uuid,
	"provider_message_handle" text NOT NULL,
	"reaction_type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "trip_options" ADD CONSTRAINT "trip_options_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id");
--> statement-breakpoint
ALTER TABLE "trip_option_assets" ADD CONSTRAINT "trip_option_assets_trip_option_id_fk" FOREIGN KEY ("trip_option_id") REFERENCES "public"."trip_options"("id");
--> statement-breakpoint
ALTER TABLE "trip_option_assets" ADD CONSTRAINT "trip_option_assets_media_asset_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id");
--> statement-breakpoint
ALTER TABLE "message_option_map" ADD CONSTRAINT "message_option_map_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id");
--> statement-breakpoint
ALTER TABLE "message_option_map" ADD CONSTRAINT "message_option_map_trip_option_id_fk" FOREIGN KEY ("trip_option_id") REFERENCES "public"."trip_options"("id");
--> statement-breakpoint
ALTER TABLE "message_option_map" ADD CONSTRAINT "message_option_map_participant_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id");
--> statement-breakpoint
ALTER TABLE "option_reactions" ADD CONSTRAINT "option_reactions_trip_option_id_fk" FOREIGN KEY ("trip_option_id") REFERENCES "public"."trip_options"("id");
--> statement-breakpoint
ALTER TABLE "option_reactions" ADD CONSTRAINT "option_reactions_participant_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id");
