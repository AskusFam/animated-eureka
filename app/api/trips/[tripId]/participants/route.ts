import { NextResponse } from "next/server";
import { z } from "zod";
import { inviteParticipant } from "@/lib/trips/service";

const inviteSchema = z.object({
  name: z.string().optional(),
  phoneNumber: z.string().min(7),
});

export async function POST(request: Request, { params }: { params: { tripId: string } }) {
  try {
    const input = inviteSchema.parse(await request.json());
    return NextResponse.json(await inviteParticipant({ ...input, tripId: params.tripId }), { status: 201 });
  } catch (error) {
    const message = error instanceof z.ZodError ? "Invalid participant details" : error instanceof Error ? error.message : "Unable to invite participant";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
