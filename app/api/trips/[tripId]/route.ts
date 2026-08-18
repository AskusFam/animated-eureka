import { NextResponse } from "next/server";
import { getTripWorkspace } from "@/lib/trips/service";

export async function GET(_request: Request, { params }: { params: { tripId: string } }) {
  const trip = await getTripWorkspace(params.tripId);
  return trip ? NextResponse.json(trip) : NextResponse.json({ error: "Trip not found" }, { status: 404 });
}
