"use client";

import { useEffect, useState } from "react";

type TripWorkspace = {
  id: string;
  name: string;
  destination: string | null;
  status: string;
  participants: Array<{ id: string; name: string | null; phoneNumber: string; role: string; status: string }>;
};

export function TripWorkspaceView({ tripId }: { tripId: string }) {
  const [trip, setTrip] = useState<TripWorkspace | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/trips/${tripId}`).then(async (response) => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Trip not found");
      setTrip(result);
    }).catch((reason: Error) => setError(reason.message));
  }, [tripId]);

  if (error) return <main className="workspace-shell"><p>{error}</p><a className="text-link" href="/dashboard">Back to trips</a></main>;
  if (!trip) return <main className="workspace-shell"><p>Loading trip workspace…</p></main>;

  return (
    <main className="workspace-shell">
      <a className="text-link" href="/dashboard">← Organizer workspace</a>
      <div className="workspace-heading"><div><div className="workspace-kicker">Trip workspace</div><h1>{trip.name}</h1><p className="workspace-intro">{trip.destination ?? "Destination ideas are still open."}</p></div><span className="status-pill">{trip.status}</span></div>
      <div className="workspace-grid">
        <section className="workspace-card"><div className="card-kicker">RallyUp’s next move</div><h2>Align the group before the details pile up.</h2><p>RallyUp can collect private preferences, compare options, and bring the group a short recommendation when a decision is ready.</p><div className="workspace-actions"><a className="button" href={`/trips/${trip.id}/plan`}>Open decision page ↗</a><a className="button secondary-button" href={`/onboarding?phone=${encodeURIComponent(trip.participants.find((participant) => participant.role === "organizer")?.phoneNumber ?? "")}&tripId=${trip.id}`}>Set up your profile</a></div></section>
        <section className="workspace-card"><div className="card-kicker">People</div><h2>{trip.participants.length} traveler{trip.participants.length === 1 ? "" : "s"}</h2><div className="participant-list">{trip.participants.map((participant) => <div className="participant-row" key={participant.id}><span className="avatar">{(participant.name ?? participant.phoneNumber).slice(0, 1).toUpperCase()}</span><span><strong>{participant.name ?? "Traveler"}</strong><small>{participant.role} · {participant.status}</small></span></div>)}</div><p className="field-note">Participants can reply privately by text. RallyUp keeps their preferences attached to this trip.</p></section>
      </div>
      <section className="workspace-card workspace-roadmap"><div><div className="card-kicker">Trip plan</div><h2>What RallyUp will handle</h2></div><div className="roadmap-list"><div><span>01</span><p><strong>Discover</strong>Research destinations and options around the group’s intent.</p></div><div><span>02</span><p><strong>Coordinate</strong>Collect preferences privately and nudge only when a decision is waiting.</p></div><div><span>03</span><p><strong>Recommend</strong>Bring back a concise comparison page for approval.</p></div><div><span>04</span><p><strong>Finalize</strong>Turn the approved direction into an itinerary.</p></div></div></section>
    </main>
  );
}
