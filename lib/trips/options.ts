import { db } from "@/lib/db";
import { mediaAssets, tripOptionAssets, tripOptions } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export type TripOptionDraft = {
  code: string;
  title: string;
  summary: string;
  imageUrl: string;
  cacheKey: string;
};

const fallbackImages = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=82",
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=82",
  "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1400&q=82",
];

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "trip";
}

export function optionAssetCacheKey(destination: string, title: string, style = "v1") {
  return `trip-option:${slug(destination)}:${slug(title)}:${style}`;
}

export function buildTripOptionDrafts(destination: string, tripStyle?: string | null): TripOptionDraft[] {
  const style = tripStyle?.trim() || "good food and a relaxed pace";
  const ideas = [
    ["01", "Slow + beautiful", `A relaxed ${destination} base with easy mornings, a strong neighborhood, and room for the group to wander.`],
    ["02", "Food + character", `A more local-feeling ${destination} route built around great meals, markets, and a little nightlife.`],
    ["03", "Out + about", `A higher-energy ${destination} plan with a memorable day out and flexible time to follow the group's mood.`],
  ] as const;

  return ideas.map(([code, title, summary], index) => ({
    code,
    title,
    summary: `${summary} Best fit for: ${style}.`,
    imageUrl: process.env[`RALLY_OPTION_IMAGE_URL_${index + 1}`] || fallbackImages[index],
    cacheKey: optionAssetCacheKey(destination, title),
  }));
}

export async function persistTripOptionAssets(tripId: string, drafts: TripOptionDraft[]) {
  if (!db) return [];
  const persisted = [] as Array<{ id: string; draft: TripOptionDraft }>;
  for (const draft of drafts) {
    const [option] = await db.insert(tripOptions).values({
      tripId,
      code: draft.code,
      title: draft.title,
      summary: draft.summary,
      destination: null,
      metadata: { cacheKey: draft.cacheKey },
    }).onConflictDoNothing({ target: [tripOptions.tripId, tripOptions.code] }).returning({ id: tripOptions.id });
    const [storedOption] = option
      ? [option]
      : await db.select({ id: tripOptions.id }).from(tripOptions).where(and(eq(tripOptions.tripId, tripId), eq(tripOptions.code, draft.code))).limit(1);
    if (!storedOption) continue;
    const [asset] = await db.insert(mediaAssets).values({
      cacheKey: draft.cacheKey,
      url: draft.imageUrl,
      source: draft.imageUrl.startsWith("https://images.unsplash.com/") ? "curated_fallback" : "generated",
    }).onConflictDoNothing({ target: mediaAssets.cacheKey }).returning({ id: mediaAssets.id });
    const [storedAsset] = asset
      ? [asset]
      : await db.select({ id: mediaAssets.id }).from(mediaAssets).where(eq(mediaAssets.cacheKey, draft.cacheKey)).limit(1);
    if (storedAsset) await db.insert(tripOptionAssets).values({ tripOptionId: storedOption.id, mediaAssetId: storedAsset.id }).onConflictDoNothing();
    persisted.push({ id: storedOption.id, draft });
  }
  return persisted;
}
