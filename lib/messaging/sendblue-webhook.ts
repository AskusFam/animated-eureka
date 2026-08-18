import { timingSafeEqual } from "node:crypto";

export function isValidSendblueWebhook(secret: string | undefined, received: string | null) {
  if (!secret || !received) return false;
  const expected = Buffer.from(secret);
  const actual = Buffer.from(received);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

