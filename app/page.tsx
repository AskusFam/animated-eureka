import Link from "next/link";

const conciergeNumber = process.env.NEXT_PUBLIC_CONCIERGE_NUMBER;
const smsHref = conciergeNumber
  ? `sms:${conciergeNumber}?body=${encodeURIComponent("PLAN")}`
  : "sms:";

export default function HomePage() {
  return (
    <main className="rally-site">
      <nav className="rally-nav" aria-label="Main navigation">
        <Link className="rally-logo" href="/" aria-label="Rally home">
          <span className="logo-mark" aria-hidden="true"><i /><i /><i /></span>
          Rally
        </Link>
        <div className="rally-nav-links">
          <a href="#how-it-works">How it works</a>
          <Link href="/dashboard">For organizers</Link>
          <a className="nav-text-link" href={smsHref}>Text us <span aria-hidden="true">↗</span></a>
        </div>
      </nav>
      <section className="rally-hero" aria-labelledby="hero-heading">
        <div className="hero-copy">
          <p className="hero-label"><span className="live-dot" /> Your group trip, on autopilot</p>
          <h1 id="hero-heading">Make plans.<br /><em>Keep friends.</em></h1>
          <p className="hero-description">Rally is the travel concierge that lives in your texts. It gathers the group, handles the details, and keeps the plan moving.</p>
          <div className="hero-actions">
            <a className="primary-action" href={smsHref}>Text Rally <span aria-hidden="true">↗</span></a>
            <a className="secondary-action" href="#how-it-works">See how it works <span aria-hidden="true">↓</span></a>
          </div>
          {!conciergeNumber && <p className="setup-note">The SMS line will appear here once configured.</p>}
        </div>
        <div className="phone-stage" aria-label="Example Rally text conversation">
          <div className="sun-shape sun-one" /><div className="sun-shape sun-two" />
          <div className="phone-card">
            <div className="phone-top"><span>9:41</span><span className="phone-signal">● ● ●</span></div>
            <div className="phone-header"><span className="back-arrow">‹</span><span><strong>Rally</strong><small>Trip concierge</small></span><span className="phone-menu">•••</span></div>
            <div className="conversation">
              <p className="day-stamp">TODAY</p>
              <div className="bubble bubble-in">Hey Rally — we’re thinking Lisbon in October. 5 people.</div>
              <div className="bubble bubble-out">Love it. I’ll get everyone’s dates, budget, and must-dos.</div>
              <div className="bubble bubble-in">Can you ask about food spots too?</div>
              <div className="bubble bubble-out">Already on it. I’ll bring you a plan when the group is aligned ✦</div>
              <span className="typing"><i /><i /><i /></span>
            </div>
          </div>
          <div className="stage-caption"><span>01</span><strong>The group chat<br />finally has a co-pilot.</strong></div>
        </div>
      </section>
      <section className="rally-strip" aria-label="Rally benefits">
        <span>One less thing to coordinate</span><span className="strip-dot">✳</span><span>Built for groups of any size</span><span className="strip-dot">✳</span><span>Works wherever you text</span>
      </section>
      <section className="how-section" id="how-it-works" aria-labelledby="how-heading">
        <div className="section-intro"><p className="eyebrow">The easy part</p><h2 id="how-heading">From “we should”<br /><span>to “we’re going.”</span></h2></div>
        <div className="step-list">
          <article className="step"><span className="step-number">01</span><div><h3>Start with a text</h3><p>Tell Rally where you want to go, when you’re free, and what kind of trip you want.</p></div></article>
          <article className="step"><span className="step-number">02</span><div><h3>Let Rally ask around</h3><p>Everyone replies privately by text. No new app, no spreadsheet, no group-chat avalanche.</p></div></article>
          <article className="step"><span className="step-number">03</span><div><h3>Get a plan everyone likes</h3><p>Rally turns preferences into an itinerary and nudges the right people when a decision is waiting.</p></div></article>
        </div>
      </section>
      <section className="rally-closer">
        <p className="eyebrow">Good trips take a little coordination</p><h2>Let Rally take<br />the little stuff.</h2>
        <a className="primary-action light-action" href={smsHref}>Text Rally <span aria-hidden="true">↗</span></a>
      </section>
      <footer className="rally-footer"><span className="rally-logo"><span className="logo-mark" aria-hidden="true"><i /><i /><i /></span>Rally</span><span>Trips, handled.</span><Link href="/dashboard">Organizer view ↗</Link></footer>
    </main>
  );
}
