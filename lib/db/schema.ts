import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const tripStatus = pgEnum("trip_status", [
  "collecting",
  "planning",
  "review",
  "confirmed",
  "completed",
]);

export const participantRole = pgEnum("participant_role", ["organizer", "participant"]);

export const participantStatus = pgEnum("participant_status", [
  "invited",
  "active",
  "declined",
  "removed",
]);

export const messageDirection = pgEnum("message_direction", ["inbound", "outbound"]);

export const trips = pgTable("trips", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  destination: text("destination"),
  status: tripStatus("status").default("collecting").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const participants = pgTable("participants", {
  id: uuid("id").defaultRandom().primaryKey(),
  tripId: uuid("trip_id").references(() => trips.id).notNull(),
  name: text("name"),
  phoneNumber: text("phone_number").notNull(),
  role: participantRole("role").default("participant").notNull(),
  status: participantStatus("status").default("invited").notNull(),
  smsOptIn: boolean("sms_opt_in").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  tripId: uuid("trip_id").references(() => trips.id),
  participantId: uuid("participant_id").references(() => participants.id),
  senderPhone: text("sender_phone"),
  source: text("source"),
  campaignCode: text("campaign_code"),
  direction: messageDirection("direction").notNull(),
  body: text("body").notNull(),
  providerMessageId: text("provider_message_id"),
  traceId: text("trace_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  providerMessageIdUnique: uniqueIndex("messages_provider_message_id_unique").on(table.providerMessageId),
}));

export const conversationSessions = pgTable("conversation_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  phoneNumber: text("phone_number").notNull().unique(),
  tripId: uuid("trip_id").references(() => trips.id),
  participantId: uuid("participant_id").references(() => participants.id),
  state: text("state").notNull().default("new"),
  intake: jsonb("intake").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const reminders = pgTable("reminders", {
  id: uuid("id").defaultRandom().primaryKey(),
  tripId: uuid("trip_id").references(() => trips.id).notNull(),
  participantId: uuid("participant_id").references(() => participants.id).notNull(),
  kind: text("kind").notNull(),
  attempt: integer("attempt").default(0).notNull(),
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }).notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const tripOptions = pgTable("trip_options", {
  id: uuid("id").defaultRandom().primaryKey(),
  tripId: uuid("trip_id").references(() => trips.id).notNull(),
  stage: text("stage").default("place").notNull(),
  code: text("code").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  destination: text("destination"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  tripStageCodeUnique: uniqueIndex("trip_options_trip_stage_code_unique").on(table.tripId, table.stage, table.code),
}));

export const tripVotes = pgTable("trip_votes", {
  id: uuid("id").defaultRandom().primaryKey(),
  tripId: uuid("trip_id").references(() => trips.id).notNull(),
  stage: text("stage").notNull(),
  voterKey: text("voter_key").notNull(),
  optionId: uuid("option_id").references(() => tripOptions.id).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  tripStageVoterUnique: uniqueIndex("trip_votes_trip_stage_voter_unique").on(table.tripId, table.stage, table.voterKey),
}));

export const itineraries = pgTable("itineraries", {
  id: uuid("id").defaultRandom().primaryKey(),
  tripId: uuid("trip_id").references(() => trips.id).notNull().unique(),
  content: jsonb("content").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const mediaAssets = pgTable("media_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  cacheKey: text("cache_key").notNull().unique(),
  url: text("url").notNull(),
  kind: text("kind").notNull().default("trip_option"),
  source: text("source").notNull().default("curated_fallback"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const tripOptionAssets = pgTable("trip_option_assets", {
  tripOptionId: uuid("trip_option_id").references(() => tripOptions.id).notNull(),
  mediaAssetId: uuid("media_asset_id").references(() => mediaAssets.id).notNull(),
}, (table) => ({
  optionAssetUnique: uniqueIndex("trip_option_assets_unique").on(table.tripOptionId, table.mediaAssetId),
}));

export const messageOptionMap = pgTable("message_option_map", {
  id: uuid("id").defaultRandom().primaryKey(),
  messageId: uuid("message_id").references(() => messages.id).notNull(),
  tripOptionId: uuid("trip_option_id").references(() => tripOptions.id).notNull(),
  participantId: uuid("participant_id").references(() => participants.id),
  providerMessageHandle: text("provider_message_handle").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const optionReactions = pgTable("option_reactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  tripOptionId: uuid("trip_option_id").references(() => tripOptions.id).notNull(),
  participantId: uuid("participant_id").references(() => participants.id),
  providerMessageHandle: text("provider_message_handle").notNull(),
  reactionType: text("reaction_type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
