import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { itineraries, tripOptions, tripVotes } from "@/lib/db/schema";

export const decisionStages = ["place", "stay", "activities"] as const;
export type DecisionStage = (typeof decisionStages)[number];

export type DecisionOption = {
  id: string;
  stage: DecisionStage;
  code: string;
  title: string;
  summary: string;
  imageUrl: string;
  detail: string;
};

export type DailyItinerary = {
  title: string;
  destination: string;
  days: Array<{ day: string; morning: string; afternoon: string; evening: string; notes: string }>;
  assumptions: string[];
};

const fallbackImages = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=82",
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=82",
  "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1400&q=82",
];

const stageLabels: Record<DecisionStage, string> = { place: "Where", stay: "Stay", activities: "Do" };

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 42) || "trip";
}

function draftsForStage(stage: DecisionStage, destination: string) {
  const place = [
    ["01", destination, `The most direct fit for the group, with a strong center and plenty of room to shape the weekend.`, "Best match for the brief"],
    ["02", "Nashville", "Easy flights, live music everywhere, and a relaxed social rhythm that works for mixed preferences.", "Best for easy logistics"],
    ["03", "New Orleans", "Big food, late nights, and a compact city where the group can do a lot without constant transit.", "Best for character"],
  ] as const;
  const stay = [
    ["01", "Design-led central base", `A walkable ${destination} base with a shared social space and quick access to the first-night plan.`, "Best for togetherness"],
    ["02", "Comfortable neighborhood stay", `A quieter neighborhood with more room, better value, and an easy route into the center.`, "Best for value"],
    ["03", "Boutique hotel cluster", `A polished hotel option for a group that wants a simple check-in and a little more service.`, "Best for ease"],
  ] as const;
  const activities = [
    ["01", "Food first", "Market walk, a standout dinner, and a low-pressure nightcap that lets the group settle in.", "Best for a relaxed pace"],
    ["02", "Big night out", "A signature daytime experience followed by the strongest nightlife route in the city.", "Best for energy"],
    ["03", "One memorable day", "A flexible morning, a high-point activity, and an unhurried final dinner together.", "Best for a shared story"],
  ] as const;
  const selected = stage === "place" ? place : stage === "stay" ? stay : activities;
  return selected.map(([code, title, summary, detail], index) => ({
    stage,
    code,
    title,
    summary,
    detail,
    imageUrl: fallbackImages[index],
  }));
}

const memory = globalThis as typeof globalThis & { __rallyDecisionStore?: Map<string, DecisionOption[]> };
const memoryStore = memory.__rallyDecisionStore ??= new Map();

export async function getDecisionWorkspace(tripId: string, destination: string | null, voterKey: string) {
  if (!db) {
    const existing: DecisionOption[] = memoryStore.get(tripId) ?? decisionStages.flatMap((stage) => draftsForStage(stage, destination ?? "your trip")).map((option) => ({ ...option, id: `${tripId}-${option.stage}-${option.code}` }));
    memoryStore.set(tripId, existing);
    return { stages: decisionStages.map((stage) => ({ stage, label: stageLabels[stage], options: existing.filter((option) => option.stage === stage).map((option) => ({ ...option, votes: 0, selected: false })) })), itinerary: null };
  }

  let stored = await db.select().from(tripOptions).where(eq(tripOptions.tripId, tripId));
  if (!stored.length) {
    const drafts = decisionStages.flatMap((stage) => draftsForStage(stage, destination ?? "your trip"));
    await db.insert(tripOptions).values(drafts.map((draft) => ({ tripId, ...draft, destination, metadata: { imageUrl: draft.imageUrl, detail: draft.detail } }))).onConflictDoNothing({ target: [tripOptions.tripId, tripOptions.stage, tripOptions.code] });
    stored = await db.select().from(tripOptions).where(eq(tripOptions.tripId, tripId));
  }
  const votes = await db.select().from(tripVotes).where(and(eq(tripVotes.tripId, tripId), eq(tripVotes.voterKey, voterKey)));
  const itinerary = await db.select().from(itineraries).where(eq(itineraries.tripId, tripId)).limit(1);
  return {
    stages: decisionStages.map((stage) => ({
      stage,
      label: stageLabels[stage],
      options: stored.filter((option) => option.stage === stage).map((option) => ({
        id: option.id,
        stage: option.stage as DecisionStage,
        code: option.code,
        title: option.title,
        summary: option.summary,
        imageUrl: String((option.metadata as Record<string, unknown>).imageUrl ?? fallbackImages[0]),
        detail: String((option.metadata as Record<string, unknown>).detail ?? "A considered fit for the group."),
        votes: 0,
        selected: votes.some((vote) => vote.optionId === option.id),
      })),
    })),
    itinerary: itinerary[0]?.content ?? null,
  };
}

export async function castDecisionVote(tripId: string, stage: DecisionStage, optionId: string, voterKey: string) {
  if (!db) return { ok: true, stage, optionId, voterKey };
  const [option] = await db.select().from(tripOptions).where(and(eq(tripOptions.id, optionId), eq(tripOptions.tripId, tripId), eq(tripOptions.stage, stage))).limit(1);
  if (!option) throw new Error("That option is no longer available");
  await db.insert(tripVotes).values({ tripId, stage, optionId, voterKey, updatedAt: new Date() }).onConflictDoUpdate({
    target: [tripVotes.tripId, tripVotes.stage, tripVotes.voterKey],
    set: { optionId, updatedAt: new Date() },
  });
  return { ok: true, stage, optionId };
}

export function buildDailyItinerary(destination: string | null, selectedTitles: Partial<Record<DecisionStage, string>>): DailyItinerary {
  const place = selectedTitles.place ?? destination ?? "your destination";
  const stay = selectedTitles.stay ?? "your selected stay";
  const activities = selectedTitles.activities ?? "your selected experience";
  return {
    title: `${place}: a considered group itinerary`,
    destination: place,
    days: [
      { day: "Day 1", morning: "Arrive, settle into the stay, and keep the first meal close by.", afternoon: `Explore the best first impression of ${place} at an easy pace.`, evening: `Anchor dinner around the group's shared pick, then leave room for an optional nightcap.`, notes: `Base: ${stay}. Keep arrival day flexible around flights.` },
      { day: "Day 2", morning: "Start with coffee and a neighborhood walk before the day gets busy.", afternoon: `Make ${activities} the day's anchor, with a clear meeting point and a simple backup.`, evening: "Use the group's energy in the moment: a booked dinner, then an optional second stop.", notes: "The planner can swap the evening without breaking the rest of the day." },
      { day: "Day 3", morning: "Give everyone a slower start and a last local favorite.", afternoon: "Keep the final shared activity close to the route home and leave buffer for checkout.", evening: "Final dinner, expense check, and a clean plan for departures.", notes: "Do not overbook the final day; the best ending has breathing room." },
    ],
    assumptions: ["Three-night trip", "The group prefers one shared anchor per day", "Exact opening hours and bookings will be confirmed before purchase"],
  };
}

export async function saveItinerary(tripId: string, content: DailyItinerary) {
  if (!db) return content;
  const [saved] = await db.insert(itineraries).values({ tripId, content, updatedAt: new Date() }).onConflictDoUpdate({ target: itineraries.tripId, set: { content, updatedAt: new Date() } }).returning();
  return saved.content;
}

export function stageLabel(stage: DecisionStage) {
  return stageLabels[stage];
}

export function decisionSlug(destination: string) {
  return slug(destination);
}
