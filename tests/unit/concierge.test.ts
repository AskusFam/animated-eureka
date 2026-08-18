import { describe, expect, it } from "vitest";
import { buildConciergeReply } from "../../lib/concierge/respond";
import { parseAttribution } from "../../lib/messaging/attribution";
import { isFreshSessionCommand } from "../../lib/concierge/session";

describe("concierge replies", () => {
  it("supports the SMS opt-out flow", () => {
    expect(buildConciergeReply("STOP")).toContain("unsubscribed");
  });

  it("starts trip intake from PLAN", () => {
    expect(buildConciergeReply("plan")).toContain("Where would you like to go");
  });

  it("does not lose the help path", () => {
    expect(buildConciergeReply("help")).toContain("Reply STOP");
  });

  it("extracts source and campaign codes from an SMS CTA", () => {
    expect(parseAttribution("RALLY WEB PLAN")).toEqual({ source: "web", campaignCode: "plan", message: "PLAN" });
  });

  it("recognizes fresh-session commands", () => {
    expect(isFreshSessionCommand("START OVER")).toBe(true);
    expect(isFreshSessionCommand("new trip")).toBe(true);
    expect(isFreshSessionCommand("please help me")).toBe(false);
  });
});
