import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { conversationSessions } from "@/lib/db/schema";
import type { TripIntake } from "./intake";

export type ConversationState = "new" | "collecting_trip_brief" | "inviting_participants" | "collecting_preferences" | "planning";
export type TravelerProfile = {
  name: string;
  email: string;
  homeBase: string;
  timeZone: string;
  travelStyles: string[];
  budgetRange: string;
  typicalTripLength: string;
  passportCountry: string;
  accessibilityNeeds: string;
  dietaryNeeds: string;
  avoid: string;
  planningStyle: "flexible" | "structured" | "surprise_me";
  reminderStyle: "light" | "standard" | "persistent";
  approvalPreference: "ask_first" | "suggest_and_move";
};
export type SessionIntake = Partial<TripIntake> & {
  profile?: TravelerProfile;
  onboardingOffered?: boolean;
};
export type ConversationSession = {
  id: string;
  phoneNumber: string;
  tripId: string | null;
  participantId: string | null;
  state: ConversationState;
  intake: SessionIntake;
};

const freshSessionCommands = new Set([
  "new",
  "new trip",
  "restart",
  "reset",
  "start over",
  "plan another trip",
]);

export function isFreshSessionCommand(message: string) {
  return freshSessionCommands.has(message.trim().toLowerCase());
}

export function getTravelerProfile(session: ConversationSession | null): TravelerProfile | null {
  const profile = session?.intake.profile;
  return profile?.name ? profile : null;
}

export async function saveTravelerProfile(phoneNumber: string, profile: TravelerProfile) {
  const session = await getSession(phoneNumber);
  const intake = { ...(session?.intake ?? {}), profile };
  return saveSession({
    id: session?.id,
    phoneNumber,
    tripId: session?.tripId ?? null,
    participantId: session?.participantId ?? null,
    state: session?.state ?? "new",
    intake,
  });
}

const memorySessions = new Map<string, ConversationSession>();

export async function getSession(phoneNumber: string): Promise<ConversationSession | null> {
  if (!db) return memorySessions.get(phoneNumber) ?? null;
  const [session] = await db.select().from(conversationSessions).where(eq(conversationSessions.phoneNumber, phoneNumber)).limit(1);
  if (!session) return null;
  return {
    id: session.id,
    phoneNumber: session.phoneNumber,
    tripId: session.tripId,
    participantId: session.participantId,
    state: session.state as ConversationState,
    intake: session.intake as Partial<TripIntake>,
  };
}

export async function saveSession(input: Omit<ConversationSession, "id"> & { id?: string }) {
  if (!db) {
    const session = { ...input, id: input.id ?? randomUUID() };
    memorySessions.set(input.phoneNumber, session);
    return session;
  }

  const values = {
    phoneNumber: input.phoneNumber,
    tripId: input.tripId,
    participantId: input.participantId,
    state: input.state,
    intake: input.intake,
    updatedAt: new Date(),
  };
  const [session] = input.id
    ? await db.update(conversationSessions).set(values).where(eq(conversationSessions.id, input.id)).returning()
    : await db.insert(conversationSessions).values(values).onConflictDoUpdate({ target: conversationSessions.phoneNumber, set: values }).returning();
  return {
    id: session.id,
    phoneNumber: session.phoneNumber,
    tripId: session.tripId,
    participantId: session.participantId,
    state: session.state as ConversationState,
    intake: session.intake as Partial<TripIntake>,
  };
}
