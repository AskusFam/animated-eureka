import { describe, expect, it } from "vitest";
import { buildTripOptionDrafts, optionAssetCacheKey } from "../../lib/trips/options";
import { parseSendblueReaction } from "../../lib/messaging/sendblue-reaction";

describe("trip option carousels", () => {
  it("creates three stable, heartable option cards", () => {
    const options = buildTripOptionDrafts("Lisbon", "food-focused");
    expect(options).toHaveLength(3);
    expect(options.map((option) => option.code)).toEqual(["01", "02", "03"]);
    expect(options.every((option) => option.imageUrl.startsWith("https://"))).toBe(true);
    expect(options[0].cacheKey).toBe(optionAssetCacheKey("Lisbon", "Slow + beautiful"));
  });

  it("accepts a reaction payload and preserves the provider handle", () => {
    expect(parseSendblueReaction({
      is_reaction: true,
      from_number: "+15551234567",
      reaction_message_handle: "msg-option-02",
      reaction_type: "love",
    })).toEqual({ from: "+15551234567", messageHandle: "msg-option-02", reactionType: "love" });
  });

  it("ignores ordinary inbound messages", () => {
    expect(parseSendblueReaction({ from_number: "+15551234567", content: "hello" })).toBeNull();
  });
});
