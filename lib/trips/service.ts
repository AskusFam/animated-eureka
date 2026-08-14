import type { CreateTripInput, InviteParticipantInput, Reminder } from "./types";
import { tripRepository } from "./repository";

export async function createTrip(input: CreateTripInput) {
  if (!input.name.trim()) throw new Error("Trip name is required");
  if (!input.organizerPhone.trim()) throw new Error("Organizer phone is required");
  return tripRepository.createTrip({ ...input, name: input.name.trim(), destination: input.destination?.trim() });
}

export async function inviteParticipant(input: InviteParticipantInput) {
  if (!input.tripId) throw new Error("Trip is required");
  if (!input.phoneNumber.trim()) throw new Error("Participant phone is required");
  const participant = await tripRepository.inviteParticipant({ ...input, phoneNumber: input.phoneNumber.trim() });
  const reminder: Reminder = {
    participantId: participant.id,
    kind: "invitation",
    scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000),
    attempt: 0,
  };
  await tripRepository.scheduleReminder(reminder, input.tripId);
  return { participant, reminder };
}
