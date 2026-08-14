import Link from "next/link";

export default function HomePage() {
  return (
    <main className="shell">
      <nav className="nav">
        <Link className="brand" href="/">Trip Concierge</Link>
        <span className="status"><span className="dot" /> Prototype</span>
      </nav>

      <section className="hero">
        <div className="eyebrow">Travel coordination, handled</div>
        <h1>Your group trip, without the group-project energy.</h1>
        <p>
          Trip Concierge collects everyone’s preferences by text, works through the tradeoffs,
          and keeps the itinerary moving so one person does not have to chase the whole group.
        </p>
        <Link className="button" href="/dashboard">Open prototype dashboard →</Link>
      </section>

      <section className="grid" aria-label="Product principles">
        <article className="card"><h3>Text first</h3><p>Participants can contribute from the messaging app they already use.</p></article>
        <article className="card"><h3>Private by default</h3><p>Personal constraints stay private while the group gets a useful summary.</p></article>
        <article className="card"><h3>Always moving</h3><p>Clear reminders keep decisions moving without making the organizer chase everyone.</p></article>
      </section>
    </main>
  );
}
