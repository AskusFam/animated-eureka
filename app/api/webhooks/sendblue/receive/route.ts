import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { messageOptionMap, messages, optionReactions, participants } from "@/lib/db/schema";
import { buildConciergeReply } from "@/lib/concierge/respond";
import { extractTripIntake, fallbackTripIntake, hasCoreTripBrief, intakeReply } from "@/lib/concierge/intake";
import { buildAgentPlan } from "@/lib/concierge/agent";
import { getSession, getTravelerProfile, isFreshSessionCommand, saveSession } from "@/lib/concierge/session";
import { parseAttribution } from "@/lib/messaging/attribution";
import { allowInbound } from "@/lib/messaging/rate-limit";
import { sendblueMessage } from "@/lib/messaging/sendblue-provider";
import { sendTripOptionCarousel } from "@/lib/messaging/option-carousel";
import { parseSendblueReaction } from "@/lib/messaging/sendblue-reaction";
import { createTrip } from "@/lib/trips/service";
import { isValidSendblueWebhook } from "@/lib/messaging/sendblue-webhook";
import { claimInboundMessage } from "@/lib/messaging/inbound-idempotency";

const intakeTimeoutMs = 16_000;
const progressAckDelayMs = 2_500;
const runtime = globalThis as typeof globalThis & { __rallyInboundMessageClaims?: Map<string, number> };
const inboundMessageClaims = runtime.__rallyInboundMessageClaims ??= new Map();

async function withTimeout<T>(work: Promise<T>, timeoutMs: number): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<T>((_, reject) => {
        timeout = setTimeout(() => reject(new Error(`AI intake timed out after ${timeoutMs}ms`)), timeoutMs);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

async function withProgressAck<T>(work: Promise<T>, sendProgressAck: () => Promise<void>): Promise<T> {
  let progressAck: Promise<void> | undefined;
  const progressTimer = setTimeout(() => {
    progressAck = sendProgressAck().catch(() => undefined);
  }, progressAckDelayMs);
  try {
    const result = await work;
    if (progressAck) await progressAck;
    return result;
  } finally {
    clearTimeout(progressTimer);
  }
}

export async function POST(request: Request) {
  const secret = request.headers.get("sb-signing-secret");
  if (!isValidSendblueWebhook(process.env.SENDBLUE_WEBHOOK_SECRET, secret)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const payload = await request.json();
  const traceId = randomUUID();
  const from = String(payload.from_number ?? payload.number ?? "");
  const body = String(payload.content ?? "");
  const messageHandle = String(payload.message_handle ?? "");

  const reaction = parseSendblueReaction(payload as Record<string, unknown>);
  if (reaction) {
    if (db) {
      const [mapped] = await db.select({ tripOptionId: messageOptionMap.tripOptionId, participantId: messageOptionMap.participantId })
        .from(messageOptionMap)
        .where(eq(messageOptionMap.providerMessageHandle, reaction.messageHandle))
        .limit(1);
      if (mapped) {
        await db.insert(optionReactions).values({
          tripOptionId: mapped.tripOptionId,
          participantId: mapped.participantId,
          providerMessageHandle: reaction.messageHandle,
          reactionType: reaction.reactionType,
        });
        console.info("Rally option reaction recorded", { traceId, from: reaction.from, optionId: mapped.tripOptionId, reactionType: reaction.reactionType });
      } else {
        console.info("Rally option reaction could not be matched", { traceId, from: reaction.from, messageHandle: reaction.messageHandle });
      }
    }
    return NextResponse.json({ ok: true, reaction: true });
  }

  if (!from || !body || payload.is_outbound === true) return NextResponse.json({ ok: true });
  if (payload.service && payload.service !== "iMessage") return NextResponse.json({ ok: true, ignored: "iMessage only" });
  if (!allowInbound(from)) return NextResponse.json({ ok: true, ignored: "rate limited" });

  console.info("Rally inbound received", { traceId, from, providerMessageId: messageHandle || undefined, bodyLength: body.length });

  const attribution = parseAttribution(body);
  let session = await getSession(from);
  const normalizedMessage = attribution.message.trim().toLowerCase();
  let nextState = session?.state ?? "new";
  let reply = buildConciergeReply(attribution.message);
  let inboundMessageId: string | undefined;

  if (db) {
    const [claimedMessage] = await db.insert(messages).values({
      senderPhone: from,
      source: attribution.source,
      campaignCode: attribution.campaignCode,
      direction: "inbound",
      body: attribution.message,
      providerMessageId: messageHandle || undefined,
      traceId,
    }).onConflictDoNothing({ target: messages.providerMessageId }).returning({ id: messages.id });
    if (messageHandle && !claimedMessage) {
      console.info("Rally duplicate inbound ignored", { traceId, providerMessageId: messageHandle });
      return NextResponse.json({ ok: true, duplicate: true });
    }
    inboundMessageId = claimedMessage?.id;
  } else if (messageHandle) {
    if (!claimInboundMessage(inboundMessageClaims, messageHandle)) {
      console.info("Rally duplicate inbound ignored", { traceId, providerMessageId: messageHandle });
      return NextResponse.json({ ok: true, duplicate: true });
    }
  }

  let participant: { id: string; tripId: string } | undefined;
  const sendAndRecord = async (bodyToSend: string, kind: "progress_ack" | "final_reply") => {
    const result = process.env.MESSAGING_PROVIDER === "sendblue"
      ? await sendblueMessage({ to: from, body: bodyToSend })
      : (console.info("Sendblue messaging preview", { provider: process.env.MESSAGING_PROVIDER ?? "preview", to: from, body: bodyToSend }), {});
    if (db) await db.insert(messages).values({
      tripId: participant?.tripId,
      participantId: participant?.id,
      senderPhone: process.env.SENDBLUE_FROM_NUMBER,
      direction: "outbound",
      body: bodyToSend,
      providerMessageId: result.providerMessageId,
      traceId,
    });
    console.info("Rally outbound sent", { traceId, kind, providerMessageId: result.providerMessageId, status: result.status });
  };

  if (isFreshSessionCommand(attribution.message)) {
    session = await saveSession({
      id: session?.id,
      phoneNumber: from,
      tripId: null,
      participantId: null,
      state: "new",
      intake: {},
    });
    nextState = "new";
    reply = "Fresh start. Where are you thinking of going, and when?";
  } else if (!["stop", "help", "start"].includes(normalizedMessage)) {
    const recentMessages = db
      ? await db.select({ direction: messages.direction, body: messages.body })
        .from(messages)
        .where(eq(messages.senderPhone, from))
        .orderBy(desc(messages.createdAt))
        .limit(8)
      : [];
    const context = recentMessages.reverse().map((item) => `${item.direction}: ${item.body}`).join("\n");
    let intake;
    let intakeFailed = false;
    try {
      intake = await withProgressAck(
        withTimeout(extractTripIntake(attribution.message, session?.intake ?? {}, context, traceId), intakeTimeoutMs),
        () => sendAndRecord("I’m on it — give me a moment to think this through.", "progress_ack"),
      );
    } catch (error) {
      intakeFailed = true;
      console.error("Rally intake failed; using bounded fallback", {
        traceId,
        message: error instanceof Error ? error.message : String(error),
      });
      intake = fallbackTripIntake(attribution.message, session?.intake ?? {});
      reply = "I hit a slow moment, but I’m still with you. Tell me the destination or timing you have in mind.";
    }
    nextState = hasCoreTripBrief(intake) ? "inviting_participants" : "collecting_trip_brief";

    if (hasCoreTripBrief(intake) && !session?.tripId) {
      const trip = await createTrip({
        name: `${intake.destination} trip`,
        destination: intake.destination ?? undefined,
        organizerName: "Organizer",
        organizerPhone: from,
      });
      session = await saveSession({
        id: session?.id,
        phoneNumber: from,
        tripId: trip.id,
        participantId: trip.organizerId,
        state: nextState,
        intake,
      });
      reply = intakeReply(intake, nextState);
    } else {
      session = await saveSession({
        id: session?.id,
        phoneNumber: from,
        tripId: session?.tripId ?? null,
        participantId: session?.participantId ?? null,
        state: nextState,
        intake,
      });
      reply = intakeReply(intake, nextState);
    }
    if (intakeFailed) {
      reply = "I hit a slow moment, but I’m still with you. Tell me the destination or timing you have in mind.";
    }
    const agentPlan = buildAgentPlan(intake, getTravelerProfile(session));
    const onboardingOffered = Boolean(session.intake.onboardingOffered);
    if (agentPlan.action === "create_review_workspace" && !onboardingOffered && process.env.PUBLIC_APP_URL) {
      reply = `${reply.slice(0, 150).trim()} Quick setup: ${process.env.PUBLIC_APP_URL}/onboarding?phone=${encodeURIComponent(from)}&tripId=${encodeURIComponent(session.tripId ?? "")}`;
      await saveSession({
        id: session.id,
        phoneNumber: from,
        tripId: session.tripId,
        participantId: session.participantId,
        state: session.state,
        intake: { ...session.intake, onboardingOffered: true },
      });
    }
    console.info("Rally intake processed", {
      traceId,
      hasSession: Boolean(session),
      state: nextState,
      provider: process.env.GEMINI_API_KEY ? "gemini" : "fallback",
      agentObjective: agentPlan.objective,
      agentAction: agentPlan.action,
    });
  }

  if (db && session?.tripId) {
    [participant] = await db.select({ id: participants.id, tripId: participants.tripId })
      .from(participants)
      .where(eq(participants.phoneNumber, from))
      .limit(1);
  }

  if (session?.tripId && session.intake.destination && session.intake.dates && session.intake.groupSize && !session.intake.optionSetSent) {
    try {
      await sendTripOptionCarousel({
        tripId: session.tripId,
        participantId: session.participantId,
        to: from,
        destination: session.intake.destination,
        tripStyle: session.intake.tripStyle,
        traceId,
      });
      await saveSession({
        id: session.id,
        phoneNumber: session.phoneNumber,
        tripId: session.tripId,
        participantId: session.participantId,
        state: session.state,
        intake: { ...session.intake, optionSetSent: true },
      });
    } catch (error) {
      console.error("Rally option carousel failed", { traceId, message: error instanceof Error ? error.message : String(error) });
    }
  }
  if (db && inboundMessageId && participant) {
    await db.update(messages).set({ tripId: participant.tripId, participantId: participant.id }).where(eq(messages.id, inboundMessageId));
  } else if (db && inboundMessageId) {
    console.info("Rally inbound participant link skipped", { traceId, from });
  }

  try {
    await sendAndRecord(reply, "final_reply");
  } catch (error) {
    console.error("Sendblue outbound message failed", { traceId, message: error instanceof Error ? error.message : String(error) });
  }

  return NextResponse.json({ ok: true, traceId });
}
