import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
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
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
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
