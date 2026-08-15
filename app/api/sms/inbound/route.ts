import { NextResponse } from "next/server";
import twilio from "twilio";
import { eq } from "drizzle-orm";
import { buildConciergeReply } from "@/lib/concierge/respond";
import { db } from "@/lib/db";
import { messages, participants } from "@/lib/db/schema";
import { messagingProvider } from "@/lib/messaging/provider";

export async function POST(request: Request) {
  const form = await request.formData();
  const from = String(form.get("From") ?? "");
  const body = String(form.get("Body") ?? "");
  const params = Object.fromEntries(form.entries()) as Record<string, string>;

  if (process.env.TWILIO_VALIDATE_SIGNATURE !== "false" && process.env.TWILIO_AUTH_TOKEN) {
    const signature = request.headers.get("x-twilio-signature");
    const valid = Boolean(signature && twilio.validateRequest(process.env.TWILIO_AUTH_TOKEN, signature, request.url, params));
    if (!valid) return new NextResponse("Forbidden", { status: 403 });
  }

  if (!from || !body) {
    return NextResponse.json({ error: "Missing From or Body" }, { status: 400 });
  }

  const reply = buildConciergeReply(body);
  if (db) {
    const [participant] = await db.select({ id: participants.id, tripId: participants.tripId })
      .from(participants)
      .where(eq(participants.phoneNumber, from))
      .limit(1);
    await db.insert(messages).values({
      tripId: participant?.tripId,
      participantId: participant?.id,
      direction: "inbound",
      body,
    });
  }
  await messagingProvider.sendSms({ to: from, body: reply });

  return new NextResponse("<Response></Response>", {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}
