import { NextResponse } from "next/server";
import twilio from "twilio";
import { eq } from "drizzle-orm";
import { buildConciergeReply } from "@/lib/concierge/respond";
import { db } from "@/lib/db";
import { messages, participants } from "@/lib/db/schema";
import { messagingProvider } from "@/lib/messaging/provider";
import { parseAttribution } from "@/lib/messaging/attribution";
import { allowInbound } from "@/lib/messaging/rate-limit";

export async function POST(request: Request) {
  const form = await request.formData();
  const from = String(form.get("From") ?? "");
  const body = String(form.get("Body") ?? "");
  const providerMessageId = String(form.get("MessageSid") ?? "");
  const params = Object.fromEntries(form.entries()) as Record<string, string>;

  if (process.env.TWILIO_VALIDATE_SIGNATURE !== "false" && process.env.TWILIO_AUTH_TOKEN) {
    const signature = request.headers.get("x-twilio-signature");
    const valid = Boolean(signature && twilio.validateRequest(process.env.TWILIO_AUTH_TOKEN, signature, request.url, params));
    if (!valid) return new NextResponse("Forbidden", { status: 403 });
  }

  if (!from || !body) {
    return NextResponse.json({ error: "Missing From or Body" }, { status: 400 });
  }

  if (!allowInbound(from)) {
    return new NextResponse("<Response></Response>", { status: 200, headers: { "Content-Type": "text/xml" } });
  }

  const attribution = parseAttribution(body);
  const reply = buildConciergeReply(attribution.message);
  if (db) {
    const [participant] = await db.select({ id: participants.id, tripId: participants.tripId })
      .from(participants)
      .where(eq(participants.phoneNumber, from))
      .limit(1);
    await db.insert(messages).values({
      tripId: participant?.tripId,
      participantId: participant?.id,
      senderPhone: from,
      source: attribution.source,
      campaignCode: attribution.campaignCode,
      direction: "inbound",
      body: attribution.message,
      providerMessageId: providerMessageId || undefined,
    });
  }
  try {
    await messagingProvider.sendSms({ to: from, body: reply });
  } catch (error) {
    console.error("Outbound SMS failed", {
      to: from,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return new NextResponse("<Response></Response>", {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}
