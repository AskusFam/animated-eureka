import { describe, expect, it } from "vitest";
import { allowInbound } from "../../lib/messaging/rate-limit";

describe("inbound rate limit", () => {
  it("allows a bounded burst and blocks the next message", () => {
    const now = Date.now();
    expect(allowInbound("+15550000001", 2, now)).toBe(true);
    expect(allowInbound("+15550000001", 2, now + 1)).toBe(true);
    expect(allowInbound("+15550000001", 2, now + 2)).toBe(false);
  });
});
