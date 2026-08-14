export function buildConciergeReply(body: string) {
  const normalized = body.trim().toLowerCase();

  if (normalized === "stop") {
    return "You’re unsubscribed from Trip Concierge messages. Reply START to rejoin or HELP for help.";
  }

  if (normalized === "help") {
    return "Trip Concierge helps groups plan trips by text. Reply STOP to unsubscribe. Email support@example.com for help.";
  }

  if (normalized === "start") {
    return "Welcome back to Trip Concierge. Reply PLAN to start a trip or HELP for help.";
  }

  if (normalized === "plan") {
    return "Great. Where would you like to go, and roughly when? You can reply with a destination and date range in one message.";
  }

  return "I’m ready to help plan. Tell me the destination, dates, and how many people are going. Reply HELP for help or STOP to unsubscribe.";
}
