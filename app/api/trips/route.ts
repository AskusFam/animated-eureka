import { NextResponse } from "next/server";
import { z } from "zod";
import { createTrip } from "@/lib/trips/service";

const createTripSchema = z.object({
  name: z.string().min(1),
  destination: z.string().optional(),
  organizerName: z.string().min(1),
  organizerPhone: z.string().min(7),
});

export async function POST(request: Request) {
  try {
    const input = createTripSchema.parse(await request.json());
    return NextResponse.json(await createTrip(input), { status: 201 });
  } catch (error) {
    const message = error instanceof z.ZodError ? "Invalid trip details" : error instanceof Error ? error.message : "Unable to create trip";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
