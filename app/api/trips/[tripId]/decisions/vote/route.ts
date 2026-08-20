import { NextResponse } from "next/server";
import { z } from "zod";
import { castDecisionVote } from "@/lib/trips/decisions";

const voteSchema = z.object({ stage: z.enum(["place", "stay", "activities"]), optionId: z.string().min(1), voterKey: z.string().min(1).max(200) });

export async function POST(request: Request, { params }: { params: { tripId: string } }) {
  try {
    const input = voteSchema.parse(await request.json());
    return NextResponse.json(await castDecisionVote(params.tripId, input.stage, input.optionId, input.voterKey));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save vote" }, { status: 400 });
  }
}
