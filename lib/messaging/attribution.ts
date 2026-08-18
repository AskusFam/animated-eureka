export type Attribution = { source: string; campaignCode: string; message: string };

const SOURCE_PATTERN = /^RALLY\s+([A-Z0-9_-]+)(?:\s+([A-Z0-9_-]+))?/i;

export function parseAttribution(body: string): Attribution {
  const normalized = body.trim();
  const match = normalized.match(SOURCE_PATTERN);
  if (!match) return { source: "unknown", campaignCode: "organic", message: normalized };
  return {
    source: match[1].toLowerCase(),
    campaignCode: match[2]?.toLowerCase() ?? "default",
    message: normalized.slice(match[0].length).trim() || "PLAN",
  };
}

