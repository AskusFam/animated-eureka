import { NextResponse } from "next/server";
import { z } from "zod";
import { saveTravelerProfile } from "@/lib/concierge/session";

const profileSchema = z.object({
  phoneNumber: z.string().min(7),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  homeBase: z.string().min(2).max(100),
  timeZone: z.string().min(1).max(80),
  travelStyles: z.array(z.string()).max(8),
  budgetRange: z.string().max(100).optional().default(""),
  typicalTripLength: z.string().max(100).optional().default(""),
  passportCountry: z.string().max(100).optional().default(""),
  accessibilityNeeds: z.string().max(500).optional().default(""),
  dietaryNeeds: z.string().max(500).optional().default(""),
  avoid: z.string().max(500).optional().default(""),
  planningStyle: z.enum(["flexible", "structured", "surprise_me"]),
  reminderStyle: z.enum(["light", "standard", "persistent"]),
  approvalPreference: z.enum(["ask_first", "suggest_and_move"]),
});

export async function POST(request: Request) {
  try {
    const input = profileSchema.parse(await request.json());
    const { phoneNumber, ...profile } = input;
    await saveTravelerProfile(phoneNumber, profile);
    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    if (error instanceof z.ZodError) console.error("Onboarding validation failed", error.issues);
    const message = error instanceof z.ZodError ? "Please check the required profile fields" : error instanceof Error ? error.message : "Unable to save profile";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
