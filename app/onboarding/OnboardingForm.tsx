"use client";

import { FormEvent, useState } from "react";

const styles = ["Relaxed", "Food and culture", "Outdoors", "Nightlife", "Luxury", "Budget-conscious", "Family-friendly", "Beaches", "Adventure"];

export function OnboardingForm({ phoneNumber, tripId }: { phoneNumber: string; tripId?: string }) {
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  function toggleStyle(style: string) {
    setSelectedStyles((current) => current.includes(style) ? current.filter((item) => item !== style) : [...current, style]);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...Object.fromEntries(form.entries()), phoneNumber, travelStyles: selectedStyles }),
    });
    const result = await response.json();
    setBusy(false);
    if (!response.ok) { setMessage(result.error); return; }
    setMessage("Saved. RallyUp will use this when it plans for you.");
  }

  return (
    <form className="workspace-card profile-form" onSubmit={submit}>
      <input type="hidden" name="phoneNumber" value={phoneNumber} readOnly />
      <section><div className="form-section-heading"><span>01</span><h2>Basics</h2></div>
        <div className="form-grid"><label>Name<input name="name" required placeholder="Alex Morgan" /></label><label>Email<input name="email" type="email" required placeholder="alex@example.com" /></label><label>Home base<input name="homeBase" required placeholder="Boston, MA" /></label><label>Time zone<input name="timeZone" required defaultValue="America/New_York" /></label></div>
      </section>
      <section><div className="form-section-heading"><span>02</span><h2>Your travel energy</h2></div>
        <p className="field-note">Choose what sounds like you. RallyUp can adjust per trip.</p><div className="chip-list">{styles.map((style) => <button className={`chip ${selectedStyles.includes(style) ? "chip-selected" : ""}`} key={style} type="button" onClick={() => toggleStyle(style)}>{style}</button>)}</div>
        <div className="form-grid"><label>Typical budget<select name="budgetRange" defaultValue=""><option value="" disabled>Choose a range</option><option>Under $1,000 per person</option><option>$1,000–$2,500 per person</option><option>$2,500–$5,000 per person</option><option>$5,000+ per person</option><option>It depends on the trip</option></select></label><label>Typical trip length<select name="typicalTripLength" defaultValue=""><option value="" disabled>Choose a length</option><option>Weekend</option><option>4–7 days</option><option>1–2 weeks</option><option>More than 2 weeks</option></select></label></div>
      </section>
      <section><div className="form-section-heading"><span>03</span><h2>Useful constraints</h2></div>
        <div className="form-grid"><label>Passport country<input name="passportCountry" placeholder="Optional" /></label><label>Dietary needs<input name="dietaryNeeds" placeholder="Optional" /></label><label className="wide">Accessibility or mobility needs<input name="accessibilityNeeds" placeholder="Optional" /></label><label className="wide">Things to avoid<input name="avoid" placeholder="Places, activities, or deal-breakers" /></label></div>
      </section>
      <section><div className="form-section-heading"><span>04</span><h2>How RallyUp should work</h2></div>
        <div className="form-grid"><label>Planning style<select name="planningStyle" defaultValue="flexible"><option value="flexible">Keep it flexible</option><option value="structured">Give me a clear plan</option><option value="surprise_me">Surprise me with ideas</option></select></label><label>Reminder style<select name="reminderStyle" defaultValue="standard"><option value="light">Light</option><option value="standard">Standard</option><option value="persistent">Persistent</option></select></label><label className="wide">Approvals<select name="approvalPreference" defaultValue="ask_first"><option value="ask_first">Ask before contacting the group or spending money</option><option value="suggest_and_move">Suggest options and keep things moving</option></select></label></div>
      </section>
      <div className="form-footer"><button className="button" type="submit" disabled={busy}>{busy ? "Saving…" : "Save profile"}</button>{tripId && <a href={`/trips/${tripId}`} className="text-link">Back to trip workspace ↗</a>}<span role="status">{message}</span></div>
    </form>
  );
}
