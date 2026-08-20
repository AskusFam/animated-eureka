import { NextResponse } from "next/server";
import { getTripWorkspace } from "@/lib/trips/service";
import { getDecisionWorkspace } from "@/lib/trips/decisions";

export async function GET(request: Request, { params }: { params: { tripId: string } }) {
  const trip = await getTripWorkspace(params.tripId);
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  const voterKey = new URL(request.url).searchParams.get("voter") || trip.organizerId;
  return NextResponse.json({ trip, ...(await getDecisionWorkspace(trip.id, trip.destination, voterKey)) });
}
