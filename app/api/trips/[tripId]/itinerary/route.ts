import { NextResponse } from "next/server";
import { z } from "zod";
import { buildDailyItinerary, saveItinerary } from "@/lib/trips/decisions";
import { getTripWorkspace } from "@/lib/trips/service";

const itinerarySchema = z.object({ place: z.string().optional(), stay: z.string().optional(), activities: z.string().optional() });

export async function POST(request: Request, { params }: { params: { tripId: string } }) {
  const trip = await getTripWorkspace(params.tripId);
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  try {
    const selected = itinerarySchema.parse(await request.json());
    return NextResponse.json({ itinerary: await saveItinerary(params.tripId, buildDailyItinerary(trip.destination, selected)) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to build itinerary" }, { status: 400 });
  }
}
