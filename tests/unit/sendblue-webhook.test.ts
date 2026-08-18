import { describe, expect, it } from "vitest";
import { isValidSendblueWebhook } from "../../lib/messaging/sendblue-webhook";
import { claimInboundMessage } from "../../lib/messaging/inbound-idempotency";

describe("Sendblue webhook authentication", () => {
  it("accepts the configured signing secret", () => {
    expect(isValidSendblueWebhook("shared-secret", "shared-secret")).toBe(true);
  });

  it("rejects missing or incorrect secrets", () => {
    expect(isValidSendblueWebhook("shared-secret", null)).toBe(false);
    expect(isValidSendblueWebhook("shared-secret", "wrong-secret")).toBe(false);
  });
});

describe("Sendblue inbound idempotency", () => {
  it("claims a provider message once and ignores a duplicate", () => {
    const claims = new Map<string, number>();
    expect(claimInboundMessage(claims, "msg-123", 1000)).toBe(true);
    expect(claimInboundMessage(claims, "msg-123", 1100)).toBe(false);
  });

  it("expires old claims so the store stays bounded", () => {
    const claims = new Map<string, number>();
    expect(claimInboundMessage(claims, "old", 1000)).toBe(true);
    expect(claimInboundMessage(claims, "new", 1000 + 86_400_001)).toBe(true);
    expect(claims.has("old")).toBe(false);
  });
});
