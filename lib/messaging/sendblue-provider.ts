export type SendblueMessage = {
  to: string;
  body: string;
  replyTo?: string;
  mediaUrl?: string;
};

export type SendblueMessageResult = {
  providerMessageId?: string;
  status?: string;
};

const sendblueUrl = "https://api.sendblue.co/api/send-message";
const sendblueCarouselUrl = "https://api.sendblue.co/api/send-carousel";

async function sendblueRequest(url: string, body: Record<string, unknown>) {
  const keyId = process.env.SENDBLUE_API_KEY_ID;
  const secret = process.env.SENDBLUE_API_SECRET;
  const from = process.env.SENDBLUE_FROM_NUMBER;
  if (!keyId || !secret || !from) throw new Error("Sendblue is not configured");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "sb-api-key-id": keyId,
      "sb-api-secret-key": secret,
    },
    body: JSON.stringify({ ...body, from_number: from }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Sendblue ${response.status}: ${payload.error_message ?? payload.message ?? "send failed"}`);
  }

  return { providerMessageId: payload.message_handle, status: payload.status };
}

export async function sendblueMessage({ to, body, mediaUrl }: SendblueMessage): Promise<SendblueMessageResult> {
  return sendblueRequest(sendblueUrl, { number: to, content: body, ...(mediaUrl ? { media_url: mediaUrl } : {}) });
}

export async function sendblueCarousel({ to, body, mediaUrls }: { to: string; body: string; mediaUrls: string[] }): Promise<SendblueMessageResult> {
  if (mediaUrls.length < 2 || mediaUrls.length > 20) throw new Error("Sendblue carousels require 2 to 20 images");
  if (mediaUrls.some((url) => !url.startsWith("https://"))) throw new Error("Sendblue carousel images must use HTTPS URLs");
  return sendblueRequest(sendblueCarouselUrl, { number: to, content: body, media_urls: mediaUrls });
}
