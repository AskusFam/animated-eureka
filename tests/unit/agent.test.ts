import { describe, expect, it } from "vitest";
import { buildAgentPlan } from "../../lib/concierge/agent";

describe("agent planning", () => {
  it("researches when the traveler is still exploring", () => {
    const plan = buildAgentPlan({ objective: "destination_ideas" }, null);
    expect(plan.action).toBe("research_destinations");
    expect(plan.needsUserInput).toBe(false);
  });

  it("moves a complete group brief toward coordination", () => {
    const plan = buildAgentPlan({ objective: "group_trip", flowVariant: "planner", destination: "Lisbon", dates: "October", groupSize: 5 }, null);
    expect(plan.action).toBe("create_review_workspace");
    expect(plan.needsUserInput).toBe(true);
  });

  it("can build an itinerary for a complete solo brief", () => {
    const plan = buildAgentPlan({ objective: "solo_trip", flowVariant: "solo", destination: "Kyoto", dates: "May", groupSize: 1 }, null);
    expect(plan.action).toBe("build_itinerary");
    expect(plan.needsUserInput).toBe(false);
  });
});
