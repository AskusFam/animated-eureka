"use client";

import { useEffect, useMemo, useState } from "react";

type Stage = "place" | "stay" | "activities";
type Option = { id: string; stage: Stage; code: string; title: string; summary: string; detail: string; imageUrl: string; selected: boolean; votes: number };
type StageData = { stage: Stage; label: string; options: Option[] };
type Trip = { id: string; name: string; destination: string | null; participants: Array<{ id: string; name: string | null; role: string }> };
type Itinerary = { title: string; destination: string; days: Array<{ day: string; morning: string; afternoon: string; evening: string; notes: string }>; assumptions: string[] };

const stageCopy: Record<Stage, { eyebrow: string; title: string; description: string }> = {
  place: { eyebrow: "01 / WHERE", title: "Pick the direction", description: "Three places, one easy choice. Choose the direction that feels most like your group." },
  stay: { eyebrow: "02 / STAY", title: "Choose the base", description: "Now that the place is clear, pick the kind of home that will make the weekend work." },
  activities: { eyebrow: "03 / DO", title: "Set the rhythm", description: "Pick the shared anchor. RallyUp will build the day around it without overbooking everyone." },
};

export function DecisionWorkspaceView({ tripId }: { tripId: string }) {
  const [voterKey, setVoterKey] = useState("organizer");
  const [trip, setTrip] = useState<Trip | null>(null);
  const [stages, setStages] = useState<StageData[]>([]);
  const [activeStage, setActiveStage] = useState<Stage>("place");
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const stored = window.localStorage.getItem("rallyup-voter-key");
    if (stored) setVoterKey(stored);
    else {
      const next = `web-${crypto.randomUUID()}`;
      window.localStorage.setItem("rallyup-voter-key", next);
      setVoterKey(next);
    }
  }, []);

  useEffect(() => {
    fetch(`/api/trips/${tripId}/decisions?voter=${encodeURIComponent(voterKey)}`).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to load the decision page");
      setTrip(data.trip);
      setStages(data.stages);
      setItinerary(data.itinerary);
    }).catch((error: Error) => setMessage(error.message)).finally(() => setLoading(false));
  }, [tripId, voterKey]);

  const active = stages.find((stage) => stage.stage === activeStage);
  const selected = useMemo(() => Object.fromEntries(stages.flatMap((stage) => stage.options.filter((option) => option.selected).map((option) => [stage.stage, option.title]))) as Partial<Record<Stage, string>>, [stages]);
  const allSelected = Boolean(selected.place && selected.stay && selected.activities);

  async function vote(option: Option) {
    setMessage("Saving your pick…");
    const response = await fetch(`/api/trips/${tripId}/decisions/vote`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stage: option.stage, optionId: option.id, voterKey }) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error ?? "Unable to save your pick");
    setStages((current) => current.map((stage) => stage.stage === option.stage ? { ...stage, options: stage.options.map((item) => ({ ...item, selected: item.id === option.id })) } : stage));
    const nextStage = option.stage === "place" ? "stay" : option.stage === "stay" ? "activities" : null;
    setActiveStage(nextStage ?? "activities");
    setMessage("Saved. RallyUp will carry this choice into the next stage.");
  }

  async function buildItinerary() {
    setMessage("Building the detailed day-by-day plan…");
    const response = await fetch(`/api/trips/${tripId}/itinerary`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(selected) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error ?? "Unable to build the itinerary");
    setItinerary(data.itinerary);
    setMessage("Your first itinerary draft is ready.");
  }

  if (loading) return <main className="decision-shell"><p>Loading your trip plan…</p></main>;
  if (!trip) return <main className="decision-shell"><p>{message || "Trip not found"}</p><a className="text-link" href="/dashboard">Back to trips</a></main>;

  return (
    <main className="decision-shell">
      <header className="decision-header"><a className="text-link" href={`/trips/${tripId}`}>← Trip workspace</a><div className="decision-kicker">RallyUp / shared decisions</div><h1>{trip.name}</h1><p>{trip.destination ? `Planning around ${trip.destination}.` : "A few good directions, then a plan everyone can live with."}</p></header>
      <section className="decision-progress" aria-label="Planning stages">
        {stages.map((stage, index) => <button className={stage.stage === activeStage ? "decision-step is-active" : "decision-step"} key={stage.stage} type="button" onClick={() => setActiveStage(stage.stage)}><span>0{index + 1}</span><strong>{stage.label}</strong><small>{stage.options.some((option) => option.selected) ? "picked" : "open"}</small></button>)}
      </section>
      {active && <section className="decision-stage"><div className="decision-stage-heading"><div><div className="decision-kicker">{stageCopy[active.stage].eyebrow}</div><h2>{stageCopy[active.stage].title}</h2><p>{stageCopy[active.stage].description}</p></div><span className="decision-count">{active.options.length} directions</span></div><div className="decision-options">{active.options.map((option) => <article className={option.selected ? "decision-option is-selected" : "decision-option"} key={option.id}><div className="decision-image" style={{ backgroundImage: `linear-gradient(135deg, rgba(23,24,27,.05), rgba(23,24,27,.38)), url(${option.imageUrl})` }}><span>{option.code}</span></div><div className="decision-option-copy"><div className="decision-option-title"><h3>{option.title}</h3>{option.selected && <span>Selected</span>}</div><p>{option.summary}</p><small>{option.detail}</small><button className={option.selected ? "decision-pick is-picked" : "decision-pick"} type="button" onClick={() => vote(option)}>{option.selected ? "Your pick" : "Pick this direction"}</button></div></article>)}</div></section>}
      <section className="decision-footer"><div><div className="decision-kicker">A plan with a point of view</div><h2>{allSelected ? "Ready to make it real?" : "No group chat debate required."}</h2><p>{allSelected ? "RallyUp has enough to draft the detailed itinerary. You can change any choice before sharing it." : "Make one choice at a time. RallyUp keeps the context and moves the plan forward."}</p></div>{allSelected && <button className="decision-build" type="button" onClick={buildItinerary}>Build the daily itinerary ↗</button>}</section>
      {itinerary && <section className="itinerary-card" aria-labelledby="itinerary-title"><div className="decision-kicker">RallyUp / first draft</div><h2 id="itinerary-title">{itinerary.title}</h2><div className="itinerary-days">{itinerary.days.map((day) => <article key={day.day}><span>{day.day}</span><h3>{day.morning}</h3><p><strong>Afternoon</strong>{day.afternoon}</p><p><strong>Evening</strong>{day.evening}</p><small>{day.notes}</small></article>)}</div><div className="itinerary-assumptions"><strong>Working assumptions</strong>{itinerary.assumptions.map((assumption) => <span key={assumption}>{assumption}</span>)}</div></section>}
      {message && <p className="decision-status" role="status">{message}</p>}
    </main>
  );
}
