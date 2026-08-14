import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { participants, reminders, trips } from "@/lib/db/schema";
import type { CreateTripInput, InviteParticipantInput, Reminder } from "./types";

export type TripRecord = {
  id: string;
  name: string;
  destination: string | null;
  organizerId: string;
};

export interface TripRepository {
  createTrip(input: CreateTripInput): Promise<TripRecord>;
  inviteParticipant(input: InviteParticipantInput): Promise<{ id: string; tripId: string; phoneNumber: string }>;
  scheduleReminder(reminder: Reminder, tripId: string): Promise<void>;
}

const memoryTrips = new Map<string, TripRecord>();
const memoryParticipants = new Map<string, { id: string; tripId: string; phoneNumber: string }>();
const memoryReminders: Array<Reminder & { tripId: string }> = [];

class InMemoryTripRepository implements TripRepository {
  async createTrip(input: CreateTripInput) {
    const tripId = randomUUID();
    const organizerId = randomUUID();
    memoryTrips.set(tripId, {
      id: tripId,
      name: input.name,
      destination: input.destination ?? null,
      organizerId,
    });
    memoryParticipants.set(organizerId, { id: organizerId, tripId, phoneNumber: input.organizerPhone });
    return memoryTrips.get(tripId)!;
  }

  async inviteParticipant(input: InviteParticipantInput) {
    const participant = { id: randomUUID(), tripId: input.tripId, phoneNumber: input.phoneNumber };
    memoryParticipants.set(participant.id, participant);
    return participant;
  }

  async scheduleReminder(reminder: Reminder, tripId: string) {
    memoryReminders.push({ ...reminder, tripId });
  }
}

class PostgresTripRepository implements TripRepository {
  async createTrip(input: CreateTripInput) {
    if (!db) throw new Error("Database is not configured");
    const [trip] = await db.insert(trips).values({ name: input.name, destination: input.destination }).returning();
    const [organizer] = await db.insert(participants).values({
      tripId: trip.id,
      name: input.organizerName,
      phoneNumber: input.organizerPhone,
      role: "organizer",
      status: "active",
      smsOptIn: true,
    }).returning();
    return { id: trip.id, name: trip.name, destination: trip.destination, organizerId: organizer.id };
  }

  async inviteParticipant(input: InviteParticipantInput) {
    const [participant] = await db!.insert(participants).values({
      tripId: input.tripId,
      name: input.name,
      phoneNumber: input.phoneNumber,
    }).returning();
    return { id: participant.id, tripId: participant.tripId, phoneNumber: participant.phoneNumber };
  }

  async scheduleReminder(reminder: Reminder, tripId: string) {
    await db!.insert(reminders).values({
      tripId,
      participantId: reminder.participantId,
      kind: reminder.kind,
      attempt: reminder.attempt,
      scheduledFor: reminder.scheduledFor,
    });
  }
}

export const tripRepository: TripRepository = db ? new PostgresTripRepository() : new InMemoryTripRepository();
