import { NextResponse } from "next/server";
import { buildConciergeReply } from "@/lib/concierge/respond";
import { messagingProvider } from "@/lib/messaging/provider";

export async function POST(request: Request) {
  const form = await request.formData();
  const from = String(form.get("From") ?? "");
  const body = String(form.get("Body") ?? "");

  if (!from || !body) {
    return NextResponse.json({ error: "Missing From or Body" }, { status: 400 });
  }

  const reply = buildConciergeReply(body);
  await messagingProvider.sendSms({ to: from, body: reply });

  return new NextResponse("<Response></Response>", {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}
