"use client";

import { FormEvent, useState } from "react";

export function CreateTripForm() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    const result = await response.json();
    setBusy(false);
    setMessage(response.ok ? `Trip created: ${result.name}` : result.error);
    if (response.ok) event.currentTarget.reset();
  }

  return (
    <form className="card form" onSubmit={submit}>
      <h2>Start a trip</h2>
      <label>Trip name<input name="name" placeholder="Fall in Lisbon" required /></label>
      <label>Destination<input name="destination" placeholder="Lisbon, Portugal" /></label>
      <label>Your name<input name="organizerName" placeholder="Alex" required /></label>
      <label>Your phone<input name="organizerPhone" placeholder="+1 555 123 4567" required /></label>
      <button className="button" type="submit" disabled={busy}>{busy ? "Creating…" : "Create trip"}</button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
