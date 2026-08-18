const recentInbound = new Map<string, number[]>();

export function allowInbound(phoneNumber: string, limit = Number(process.env.INBOUND_RATE_LIMIT_PER_HOUR ?? 8), now = Date.now()) {
  const cutoff = now - 60 * 60 * 1000;
  const recent = (recentInbound.get(phoneNumber) ?? []).filter((timestamp) => timestamp > cutoff);
  if (recent.length >= limit) {
    recentInbound.set(phoneNumber, recent);
    return false;
  }
  recentInbound.set(phoneNumber, [...recent, now]);
  return true;
}

