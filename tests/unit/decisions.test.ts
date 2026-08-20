import { describe, expect, it } from "vitest";
import { buildDailyItinerary, decisionStages } from "../../lib/trips/decisions";

describe("staged trip decisions", () => {
  it("keeps the decision path bounded to place, stay, and activities", () => {
    expect(decisionStages).toEqual(["place", "stay", "activities"]);
  });

  it("builds a detailed daily itinerary from the selected directions", () => {
    const itinerary = buildDailyItinerary("Nashville", { place: "Nashville", stay: "Central base", activities: "Food first" });
    expect(itinerary.destination).toBe("Nashville");
    expect(itinerary.days).toHaveLength(3);
    expect(itinerary.days[1].afternoon).toContain("Food first");
    expect(itinerary.assumptions.length).toBeGreaterThan(0);
  });
});
