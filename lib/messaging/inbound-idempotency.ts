const defaultTtlMs = 86_400_000;

export function claimInboundMessage(
  claims: Map<string, number>,
  messageHandle: string,
  now = Date.now(),
  ttlMs = defaultTtlMs,
) {
  for (const [claim, claimedAt] of claims) {
    if (now - claimedAt > ttlMs) claims.delete(claim);
  }
  if (!messageHandle || claims.has(messageHandle)) return false;
  claims.set(messageHandle, now);
  return true;
}
