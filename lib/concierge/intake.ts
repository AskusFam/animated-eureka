import { z } from "zod";

export const tripIntakeSchema = z.object({
  objective: z.enum(["group_trip", "solo_trip", "destination_ideas", "research", "join_trip", "unknown"]),
  flowVariant: z.enum(["planner", "participant", "solo", "explorer"]),
  destination: z.string().nullable(),
  dates: z.string().nullable(),
  groupSize: z.number().int().positive().nullable(),
  budget: z.string().nullable(),
  tripStyle: z.string().nullable(),
  hardConstraints: z.array(z.string()),
  preferences: z.array(z.string()),
  nextQuestion: z.string(),
  reply: z.string().min(1).max(320),
});

export type TripIntake = z.infer<typeof tripIntakeSchema>;

const geminiEndpoint = "https://generativelanguage.googleapis.com/v1beta/interactions";
const openaiEndpoint = "https://api.openai.com/v1/responses";
const openAiCompatibleEndpoint = {
  groq: "https://api.groq.com/openai/v1/chat/completions",
  mistral: "https://api.mistral.ai/v1/chat/completions",
  openrouter: "https://openrouter.ai/api/v1/chat/completions",
} as const;

type ProviderCandidate = {
  provider: string;
  model: string;
  request: (prompt: string) => Promise<string>;
};

class ProviderRequestError extends Error {
  constructor(public readonly provider: string, public readonly model: string, public readonly status: number, message: string) {
    super(`${provider}/${model} ${status}: ${message}`);
  }
}

const tripIntakeJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    objective: { type: "string", enum: ["group_trip", "solo_trip", "destination_ideas", "research", "join_trip", "unknown"] },
    flowVariant: { type: "string", enum: ["planner", "participant", "solo", "explorer"] },
    destination: { type: ["string", "null"] },
    dates: { type: ["string", "null"] },
    groupSize: { type: ["integer", "null"] },
    budget: { type: ["string", "null"] },
    tripStyle: { type: ["string", "null"] },
    hardConstraints: { type: "array", items: { type: "string" } },
    preferences: { type: "array", items: { type: "string" } },
    nextQuestion: { type: "string" },
    reply: { type: "string" },
  },
  required: ["objective", "flowVariant", "destination", "dates", "groupSize", "budget", "tripStyle", "hardConstraints", "preferences", "nextQuestion", "reply"],
};

function compactReply(reply: string) {
  const compact = reply.replace(/\s+/g, " ").trim();
  return compact.length <= 240 ? compact : `${compact.slice(0, 237).trimEnd()}...`;
}

function configuredModels(variable: string, primary: string, defaults: string[]) {
  const configured = process.env[variable]?.split(",").map((model) => model.trim()).filter(Boolean);
  return [...new Set(configured?.length ? configured : [process.env[primary] ?? defaults[0], ...defaults])];
}

function parseProviderOutput(output: string) {
  const cleaned = output.replace(/^```json\s*|\s*```$/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  return JSON.parse(start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned);
}

async function requestGemini(model: string, prompt: string) {
  const response = await fetch(geminiEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": process.env.GEMINI_API_KEY!,
    },
    body: JSON.stringify({
      model,
      input: prompt,
      system_instruction: "Return only valid JSON. Do not include markdown fences.",
    }),
    signal: AbortSignal.timeout(12_000),
  });
  const payload = await response.json() as { output_text?: string; steps?: Array<{ content?: Array<{ type?: string; text?: string }> }>; error?: { message?: string } };
  if (!response.ok) throw new ProviderRequestError("gemini", model, response.status, payload.error?.message ?? "request failed");
  const output = payload.output_text ?? payload.steps?.flatMap((step) => step.content ?? []).find((part) => part.type === "text")?.text;
  if (!output) throw new ProviderRequestError("gemini", model, 502, "no text output");
  return output;
}

function extractResponsesText(payload: { output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>; output_text?: string }) {
  return payload.output_text ?? payload.output
    ?.filter((item) => item.type === "message")
    .flatMap((item) => item.content ?? [])
    .filter((part) => part.type === "output_text")
    .map((part) => part.text ?? "")
    .join("");
}

async function requestOpenAI(model: string, prompt: string) {
  const response = await fetch(openaiEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      reasoning: { effort: "low" },
      instructions: "Return only the requested structured JSON. Do not include markdown fences or commentary outside the JSON.",
      input: prompt,
      max_output_tokens: 900,
      text: { format: { type: "json_schema", name: "trip_intake", strict: true, schema: tripIntakeJsonSchema } },
    }),
    signal: AbortSignal.timeout(12_000),
  });
  const payload = await response.json() as { output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>; output_text?: string; error?: { message?: string } };
  if (!response.ok) throw new ProviderRequestError("openai", model, response.status, payload.error?.message ?? "request failed");
  const output = extractResponsesText(payload);
  if (!output) throw new ProviderRequestError("openai", model, 502, "no text output");
  return output;
}

async function requestOpenAiCompatible(provider: keyof typeof openAiCompatibleEndpoint, model: string, prompt: string) {
  const key = provider === "groq" ? process.env.GROQ_API_KEY : provider === "mistral" ? process.env.MISTRAL_API_KEY : process.env.OPENROUTER_API_KEY;
  const response = await fetch(openAiCompatibleEndpoint[provider], {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      ...(provider === "openrouter" ? { "HTTP-Referer": process.env.PUBLIC_APP_URL ?? "https://tryrallyup.com", "X-Title": "RallyUp" } : {}),
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: "Return only valid JSON. Do not include markdown fences." }, { role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
      response_format: provider === "groq"
        ? { type: "json_schema", json_schema: { name: "trip_intake", strict: true, schema: tripIntakeJsonSchema } }
        : { type: "json_object" },
    }),
    signal: AbortSignal.timeout(12_000),
  });
  const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } };
  if (!response.ok) throw new ProviderRequestError(provider, model, response.status, payload.error?.message ?? "request failed");
  const output = payload.choices?.[0]?.message?.content;
  if (!output) throw new ProviderRequestError(provider, model, 502, "no text output");
  return output;
}

function providerCandidates(): ProviderCandidate[] {
  const candidates: ProviderCandidate[] = [];
  if (process.env.OPENAI_API_KEY) {
    for (const model of configuredModels("OPENAI_MODELS", "OPENAI_MODEL", ["gpt-5.6"])) {
      candidates.push({ provider: "openai", model, request: (prompt) => requestOpenAI(model, prompt) });
    }
  }
  if (process.env.GEMINI_API_KEY) {
    for (const model of configuredModels("GEMINI_MODELS", "GEMINI_MODEL", ["gemini-3.6-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"])) {
      candidates.push({ provider: "gemini", model, request: (prompt) => requestGemini(model, prompt) });
    }
  }
  if (process.env.GROQ_API_KEY) {
    for (const model of configuredModels("GROQ_MODELS", "GROQ_MODEL", ["openai/gpt-oss-20b", "llama-3.3-70b-versatile"])) {
      candidates.push({ provider: "groq", model, request: (prompt) => requestOpenAiCompatible("groq", model, prompt) });
    }
  }
  if (process.env.MISTRAL_API_KEY) {
    for (const model of configuredModels("MISTRAL_MODELS", "MISTRAL_MODEL", ["mistral-small-latest"])) {
      candidates.push({ provider: "mistral", model, request: (prompt) => requestOpenAiCompatible("mistral", model, prompt) });
    }
  }
  if (process.env.OPENROUTER_API_KEY) {
    candidates.push({ provider: "openrouter", model: "openrouter/free", request: (prompt) => requestOpenAiCompatible("openrouter", "openrouter/free", prompt) });
  }
  return candidates;
}

export function fallbackTripIntake(message: string, current: Partial<TripIntake>): TripIntake {
  const normalized = message.trim();
  const groupTrip = /\b(group|friends|mates|people|everyone|family)\b/i.test(normalized);
  const soloTrip = /\b(solo|alone|just me|by myself)\b/i.test(normalized);
  const objective = current.objective ?? (groupTrip ? "group_trip" : soloTrip ? "solo_trip" : normalized === "PLAN" ? "unknown" : "destination_ideas");
  const flowVariant = current.flowVariant ?? (objective === "group_trip" ? "planner" : objective === "solo_trip" ? "solo" : "explorer");
  const groupSize = normalized.match(/\b(\d+)\s*(?:people|persons|travelers|of us)\b/i)?.[1];
  const destinationCandidate = normalized.match(/(?:to|in)\s+([A-Z][A-Za-z .'-]{2,})(?:\s+(?:in|on|for)\b|[,.]|$)/)?.[1]?.trim();
  const monthNames = /^(january|february|march|april|may|june|july|august|september|october|november|december)$/i;
  const destination = destinationCandidate && !monthNames.test(destinationCandidate) ? destinationCandidate : current.destination ?? null;
  const merged = {
    objective,
    flowVariant,
    destination,
    dates: current.dates ?? null,
    groupSize: groupSize ? Number(groupSize) : current.groupSize ?? null,
    budget: current.budget ?? null,
    tripStyle: current.tripStyle ?? null,
    hardConstraints: current.hardConstraints ?? [],
    preferences: current.preferences ?? [],
  };
  const nextQuestion = !merged.destination
    ? "Any place in mind, or should I suggest a few directions?"
    : !merged.dates
      ? `What timing are you imagining for ${merged.destination}? A rough month works.`
      : !merged.groupSize
        ? "Who are you imagining bringing along? A rough headcount is enough."
        : "What should it feel like: slow, food-focused, outdoorsy, or lively?";
  const reply = normalized === "plan"
    ? "Absolutely. Any place in mind, or should I suggest a few directions?"
    : nextQuestion;
  return { ...merged, nextQuestion, reply };
}

export async function extractTripIntake(message: string, current: Partial<TripIntake>, context = "", traceId?: string): Promise<TripIntake> {
  const candidates = providerCandidates();
  if (!candidates.length) return fallbackTripIntake(message, current);

  const prompt = `You are RallyUp, a warm, perceptive travel concierge having a real text conversation. Do not sound like an intake form. Classify the user's objective and choose the best path: group_trip, solo_trip, destination_ideas, research, join_trip, or unknown; and planner, participant, solo, or explorer. Respond to what they just said, acknowledge the human meaning, and ask at most one natural follow-up question. Keep the conversation moving down the most useful path. Extract critical trip details silently and preserve existing fields unless the new message clearly changes them. Never invent dates, budgets, people, or constraints. Keep the reply under 240 characters, use no more than two short sentences, and do not use numbered lists, field labels, or phrases like 'I need to collect'. Return ONLY valid JSON matching this shape: {"objective":"group_trip|solo_trip|destination_ideas|research|join_trip|unknown","flowVariant":"planner|participant|solo|explorer","destination":string|null,"dates":string|null,"groupSize":number|null,"budget":string|null,"tripStyle":string|null,"hardConstraints":string[],"preferences":string[],"nextQuestion":string,"reply":string}.\n\nCurrent intake: ${JSON.stringify(current)}\nRecent conversation: ${context || "(first message)"}\nNew message: ${message}`;

  for (const candidate of candidates) {
    const startedAt = Date.now();
    try {
      const parsed = tripIntakeSchema.parse(parseProviderOutput(await candidate.request(prompt)));
      console.info("AI intake extraction succeeded", { traceId, provider: candidate.provider, model: candidate.model, durationMs: Date.now() - startedAt });
      return { ...parsed, reply: compactReply(parsed.reply) };
    } catch (error) {
      console.warn("AI intake provider failed; trying next candidate", {
        traceId,
        provider: candidate.provider,
        model: candidate.model,
        status: error instanceof ProviderRequestError ? error.status : undefined,
        durationMs: Date.now() - startedAt,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  console.error("All AI intake providers failed; using deterministic fallback");
  return fallbackTripIntake(message, current);
}

export function hasCoreTripBrief(intake: Partial<TripIntake>) {
  return Boolean(intake.destination && intake.dates && intake.groupSize);
}

export function intakeReply(intake: TripIntake, state: string) {
  return intake.reply;
}
