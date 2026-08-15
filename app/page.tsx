import Link from "next/link";

const conciergeNumber = process.env.NEXT_PUBLIC_CONCIERGE_NUMBER;
const smsHref = conciergeNumber
  ? `sms:${conciergeNumber}?body=${encodeURIComponent("PLAN")}`
  : "sms:";

export default function HomePage() {
  return (
    <main className="rally-home">
      <nav className="rally-nav">
        <Link className="rally-brand" href="/">Rally</Link>
        <Link className="nav-link" href="/dashboard">Organizer view</Link>
      </nav>

      <section className="rally-hero">
        <div className="rally-kicker">A trip concierge in your texts</div>
        <h1>Text Rally.<br />Get your trip moving.</h1>
        <p>Rally gathers the group’s preferences, makes the plan, and keeps everyone on track — without making one person do all the work.</p>
        <a className="text-button" href={smsHref}>Text Rally <span aria-hidden="true">↗</span></a>
        {!conciergeNumber && <small className="setup-note">Add NEXT_PUBLIC_CONCIERGE_NUMBER to activate the text link.</small>}
      </section>

      <section className="rally-proof" aria-label="How Rally helps">
        <div><span>01</span><strong>Tell us the trip.</strong><p>Dates, destination, budget, and what matters to you.</p></div>
        <div><span>02</span><strong>We ask the group.</strong><p>Everyone can reply by text, in their own time.</p></div>
        <div><span>03</span><strong>Rally keeps it moving.</strong><p>Plans, decisions, and reminders arrive where people already are.</p></div>
      </section>
    </main>
  );
}
