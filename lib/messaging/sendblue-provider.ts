export type SendblueMessage = {
  to: string;
  body: string;
  replyTo?: string;
};

export type SendblueMessageResult = {
  providerMessageId?: string;
  status?: string;
};

const sendblueUrl = "https://api.sendblue.co/api/send-message";

export async function sendblueMessage({ to, body }: SendblueMessage): Promise<SendblueMessageResult> {
  const keyId = process.env.SENDBLUE_API_KEY_ID;
  const secret = process.env.SENDBLUE_API_SECRET;
  const from = process.env.SENDBLUE_FROM_NUMBER;
  if (!keyId || !secret || !from) throw new Error("Sendblue is not configured");

  const response = await fetch(sendblueUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "sb-api-key-id": keyId,
      "sb-api-secret-key": secret,
    },
    body: JSON.stringify({
      number: to,
      from_number: from,
      content: body,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Sendblue ${response.status}: ${payload.error_message ?? payload.message ?? "send failed"}`);
  }

  return { providerMessageId: payload.message_handle, status: payload.status };
}
