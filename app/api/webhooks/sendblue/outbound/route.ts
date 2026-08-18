import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { isValidSendblueWebhook } from "@/lib/messaging/sendblue-webhook";

export async function POST(request: Request) {
  if (!isValidSendblueWebhook(process.env.SENDBLUE_WEBHOOK_SECRET, request.headers.get("sb-signing-secret"))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const payload = await request.json();
  const messageHandle = String(payload.message_handle ?? "");
  const [message] = db && messageHandle
    ? await db.select({ traceId: messages.traceId }).from(messages).where(eq(messages.providerMessageId, messageHandle)).limit(1)
    : [];
  console.info("Sendblue outbound status", {
    traceId: message?.traceId,
    messageHandle,
    status: payload.status,
    errorCode: payload.error_code,
    errorMessage: payload.error_message,
    errorReason: payload.error_reason,
    errorDetail: payload.error_detail,
    service: payload.service,
  });
  return NextResponse.json({ ok: true });
}
