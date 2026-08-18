import { describe, expect, it } from "vitest";
import { extractTripIntake, fallbackTripIntake, hasCoreTripBrief } from "../../lib/concierge/intake";

describe("trip intake", () => {
  it("starts with the most important missing question", async () => {
    const intake = await extractTripIntake("PLAN", {});
    expect(intake.objective).toBe("unknown");
    expect(intake.destination).toBeNull();
    expect(intake.nextQuestion).toContain("place in mind");
  });

  it("extracts a simple destination and group size", async () => {
    const intake = await extractTripIntake("We want to go to Lisbon for 5 people", {});
    expect(intake.objective).toBe("group_trip");
    expect(intake.destination).toBe("Lisbon");
    expect(intake.groupSize).toBe(5);
    expect(hasCoreTripBrief(intake)).toBe(false);
  });

  it("keeps a bounded fallback available when model providers are unavailable", () => {
    const intake = fallbackTripIntake("We want to go to Lisbon for 5 people", {});
    expect(intake.destination).toBe("Lisbon");
    expect(intake.groupSize).toBe(5);
    expect(intake.reply.length).toBeLessThanOrEqual(240);
  });
});
