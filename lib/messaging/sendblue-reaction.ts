export type SendblueReaction = { from: string; messageHandle: string; reactionType: string };

export function parseSendblueReaction(payload: Record<string, unknown>): SendblueReaction | null {
  const rawType = payload.reaction_type ?? payload.reaction;
  const messageHandle = String(payload.reaction_message_handle ?? payload.message_handle ?? "");
  const from = String(payload.from_number ?? payload.number ?? "");
  if (!from || !messageHandle || (payload.is_reaction !== true && typeof rawType !== "string")) return null;
  return { from, messageHandle, reactionType: String(rawType || "unknown").toLowerCase() };
}
