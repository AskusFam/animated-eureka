import { describe, expect, it } from "vitest";
import { createTrip, inviteParticipant } from "../../lib/trips/service";

describe("trip workflow", () => {
  it("creates a trip and organizer record", async () => {
    const trip = await createTrip({
      name: "Lisbon fall trip",
      destination: "Lisbon, Portugal",
      organizerName: "Alex",
      organizerPhone: "+15551234567",
    });

    expect(trip.id).toBeTruthy();
    expect(trip.organizerId).toBeTruthy();
    expect(trip.destination).toBe("Lisbon, Portugal");
  });

  it("schedules an invitation reminder when adding a participant", async () => {
    const trip = await createTrip({ name: "Test trip", organizerName: "Alex", organizerPhone: "+15551234567" });
    const result = await inviteParticipant({ tripId: trip.id, name: "Sam", phoneNumber: "+15557654321" });

    expect(result.participant.phoneNumber).toBe("+15557654321");
    expect(result.reminder.kind).toBe("invitation");
    expect(result.reminder.scheduledFor.getTime()).toBeGreaterThan(Date.now());
  });
});
