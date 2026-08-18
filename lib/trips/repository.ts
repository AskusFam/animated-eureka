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

export type TripWorkspace = TripRecord & {
  status: string;
  participants: Array<{ id: string; name: string | null; phoneNumber: string; role: string; status: string }>;
};

export interface TripRepository {
  createTrip(input: CreateTripInput): Promise<TripRecord>;
  getTrip(tripId: string): Promise<TripWorkspace | null>;
  inviteParticipant(input: InviteParticipantInput): Promise<{ id: string; tripId: string; phoneNumber: string }>;
  scheduleReminder(reminder: Reminder, tripId: string): Promise<void>;
}

type MemoryStore = {
  trips: Map<string, TripRecord>;
  participants: Map<string, { id: string; tripId: string; phoneNumber: string }>;
  reminders: Array<Reminder & { tripId: string }>;
};

const runtime = globalThis as typeof globalThis & { __rallyTripMemory?: MemoryStore };
const memoryStore: MemoryStore = runtime.__rallyTripMemory ??= {
  trips: new Map(),
  participants: new Map(),
  reminders: [],
};
const memoryTrips = memoryStore.trips;
const memoryParticipants = memoryStore.participants;
const memoryReminders = memoryStore.reminders;

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

  async getTrip(tripId: string) {
    const trip = memoryTrips.get(tripId);
    if (!trip) return null;
    return {
      ...trip,
      status: "collecting",
      participants: [...memoryParticipants.values()].filter((participant) => participant.tripId === tripId).map((participant) => ({
        ...participant,
        name: null,
        role: participant.id === trip.organizerId ? "organizer" : "participant",
        status: participant.id === trip.organizerId ? "active" : "invited",
      })),
    };
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

  async getTrip(tripId: string) {
    const trip = await db!.query.trips.findFirst({ where: (table, operators) => operators.eq(table.id, tripId) });
    if (!trip) return null;
    const tripParticipants = await db!.query.participants.findMany({ where: (table, operators) => operators.eq(table.tripId, tripId) });
    return {
      id: trip.id,
      name: trip.name,
      destination: trip.destination,
      status: trip.status,
      organizerId: tripParticipants.find((participant) => participant.role === "organizer")?.id ?? "",
      participants: tripParticipants.map((participant) => ({
        id: participant.id,
        name: participant.name,
        phoneNumber: participant.phoneNumber,
        role: participant.role,
        status: participant.status,
      })),
    };
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
