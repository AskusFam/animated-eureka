import { db } from "@/lib/db";
import { messageOptionMap, messages } from "@/lib/db/schema";
import { buildTripOptionDrafts, persistTripOptionAssets } from "@/lib/trips/options";
import { sendblueCarousel, sendblueMessage } from "./sendblue-provider";

export type OptionCarouselResult = { sent: boolean; optionCount: number; providerMessageIds: string[] };

export async function sendTripOptionCarousel(input: {
  tripId: string;
  participantId?: string | null;
  to: string;
  destination: string;
  tripStyle?: string | null;
  traceId?: string;
}): Promise<OptionCarouselResult> {
  const drafts = buildTripOptionDrafts(input.destination, input.tripStyle);
  const persisted = await persistTripOptionAssets(input.tripId, drafts);
  const ids = new Map(persisted.map((item) => [item.draft.code, item.id]));
  const preview = process.env.MESSAGING_PROVIDER !== "sendblue";
  if (preview) {
    console.info("Sendblue option carousel preview", { to: input.to, tripId: input.tripId, options: drafts.map((draft) => draft.code) });
    return { sent: false, optionCount: drafts.length, providerMessageIds: [] };
  }

  const carousel = await sendblueCarousel({
    to: input.to,
    body: "I found three directions for the trip. Swipe through them, then I’ll send each one separately so you can heart your favorite.",
    mediaUrls: drafts.map((draft) => draft.imageUrl),
  });
  const providerMessageIds = carousel.providerMessageId ? [carousel.providerMessageId] : [];
  if (db) {
    const [carouselMessage] = await db.insert(messages).values({
      tripId: input.tripId,
      participantId: input.participantId ?? undefined,
      senderPhone: process.env.SENDBLUE_FROM_NUMBER,
      direction: "outbound",
      body: "I found three directions for the trip. Swipe through them, then I’ll send each one separately so you can heart your favorite.",
      providerMessageId: carousel.providerMessageId,
      traceId: input.traceId,
    }).returning({ id: messages.id });
    if (carouselMessage && carousel.providerMessageId && persisted[0]) {
      await db.insert(messageOptionMap).values({ messageId: carouselMessage.id, tripOptionId: persisted[0].id, participantId: input.participantId ?? undefined, providerMessageHandle: carousel.providerMessageId }).onConflictDoNothing();
    }
  }

  for (const draft of drafts) {
    const result = await sendblueMessage({
      to: input.to,
      body: `${draft.code} · ${draft.title}\n${draft.summary}\nHeart this message if you’d pick it.`,
      mediaUrl: draft.imageUrl,
    });
    if (!result.providerMessageId) continue;
    providerMessageIds.push(result.providerMessageId);
    if (db) {
      const [message] = await db.insert(messages).values({
        tripId: input.tripId,
        participantId: input.participantId ?? undefined,
        senderPhone: process.env.SENDBLUE_FROM_NUMBER,
        direction: "outbound",
        body: `${draft.code} · ${draft.title}\n${draft.summary}\nHeart this message if you’d pick it.`,
        providerMessageId: result.providerMessageId,
        traceId: input.traceId,
      }).returning({ id: messages.id });
      const optionId = ids.get(draft.code);
      if (message && optionId) await db.insert(messageOptionMap).values({ messageId: message.id, tripOptionId: optionId, participantId: input.participantId ?? undefined, providerMessageHandle: result.providerMessageId }).onConflictDoNothing();
    }
  }
  return { sent: true, optionCount: drafts.length, providerMessageIds };
}
