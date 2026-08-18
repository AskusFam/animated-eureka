import twilio from "twilio";

export type SendSmsInput = {
  to: string;
  body: string;
};

export interface MessagingProvider {
  sendSms(input: SendSmsInput): Promise<{ providerMessageId?: string }>;
}

class TwilioMessagingProvider implements MessagingProvider {
  async sendSms({ to, body }: SendSmsInput) {
    if (process.env.MESSAGING_PROVIDER !== "twilio") {
      console.info("Messaging preview", { provider: process.env.MESSAGING_PROVIDER ?? "preview", to, body });
      return {};
    }

    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_FROM_NUMBER) {
      console.info("SMS preview", { to, body });
      return {};
    }

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const message = await client.messages.create({
      to,
      from: process.env.TWILIO_FROM_NUMBER,
      body,
    });

    return { providerMessageId: message.sid };
  }
}

export const messagingProvider: MessagingProvider = new TwilioMessagingProvider();
