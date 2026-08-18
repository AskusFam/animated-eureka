"use client";

import Link from "next/link";
import { useState } from "react";

const conciergeNumber = process.env.NEXT_PUBLIC_CONCIERGE_NUMBER ?? "+16033691048";
const smsHref = `sms:${conciergeNumber}?body=${encodeURIComponent("RALLY WEB PLAN")}`;

const scenes = [
  {
    label: "Group trip",
    headline: "Five people. One plan.",
    user: "We keep talking about Lisbon in October.",
    reply: "I’ll turn the group chat into a real decision.",
    followUp: "I’m checking dates, pace, and what everyone wants to eat.",
    cards: [
      { title: "Lisbon", detail: "Late dinners · tiled streets", color: "orange" },
      { title: "San Sebastián", detail: "Basque bites · sea air", color: "blue" },
      { title: "Bologna", detail: "Pasta lessons · porticos", color: "green" },
    ],
  },
  {
    label: "Birthday trip",
    headline: "Make it feel like her.",
    user: "Can you make my sister’s 30th special?",
    reply: "Yes. I’ll find the memorable version that stays easy.",
    followUp: "I’m listening for design, dancing, and a little surprise.",
    cards: [
      { title: "Mexico City", detail: "Big flavors · brilliant design", color: "orange" },
      { title: "Marrakech", detail: "Courtyards · a little drama", color: "red" },
      { title: "Copenhagen", detail: "Good taste · all weekend", color: "blue" },
    ],
  },
  {
    label: "Solo escape",
    headline: "A reset, not a retreat.",
    user: "I need a long weekend for myself.",
    reply: "I know the kind of quiet that gives energy back.",
    followUp: "I’m looking for good food, long walks, and no logistics.",
    cards: [
      { title: "Kyoto", detail: "Slow mornings · considered beauty", color: "blue" },
      { title: "Madeira", detail: "Cliff walks · ocean air", color: "green" },
      { title: "Paris", detail: "A table for one · gladly", color: "orange" },
    ],
  },
] as const;

const storySteps = [
  { number: "01", title: "Start with the feeling", copy: "Say the loose version out loud. RallyUp hears the destination, the occasion, and the thing you actually want from the trip." },
  { number: "02", title: "RallyUp checks around", copy: "Your friends answer privately. Dates, budgets, energy levels, and strong opinions come back without another group-chat pileup." },
  { number: "03", title: "A few good directions", copy: "RallyUp does the research, makes the tradeoffs visible, and brings the group something worth reacting to." },
  { number: "04", title: "The plan keeps moving", copy: "When a decision is waiting, RallyUp nudges the right person. The planner gets to be in the trip again." },
];

export default function HomePage() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const scene = scenes[sceneIndex];
  const card = scene.cards[cardIndex];

  function chooseScene(index: number) {
    setSceneIndex(index);
    setCardIndex(0);
  }

  function moveCard(direction: 1 | -1) {
    setCardIndex((current) => (current + direction + scene.cards.length) % scene.cards.length);
  }

  return (
    <main className="rally-v2-site">
      <nav className="v2-nav" aria-label="Main navigation">
        <Link className="v2-brand" href="/" aria-label="RallyUp home"><span className="v2-mark" aria-hidden="true"><i /><i /><i /></span>RallyUp</Link>
        <div className="v2-nav-links"><a href="#story">How it works</a><a href="#try-it">Try it</a><Link href="/dashboard">Organizer view</Link></div>
        <a className="v2-nav-cta" href={smsHref}>Text RallyUp <span aria-hidden="true">↗︎</span></a>
      </nav>

      <section className="v2-hero" aria-labelledby="v2-hero-title">
        <div className="v2-hero-copy">
          <p className="v2-kicker"><span /> Text-first travel concierge</p>
          <h1 id="v2-hero-title">Trips worth<br /><em>the group chat.</em></h1>
          <p className="v2-hero-subtitle">RallyUp takes the trip from “we should” to “we’re going”—by text, with everyone’s preferences in the plan.</p>
          <div className="v2-hero-actions"><a className="v2-button v2-button-dark" href={smsHref}>Start with a text <span>↗︎</span></a><a className="v2-underlink" href="#story">See the whole thing <span>↓︎</span></a></div>
          <div className="v2-trust-line"><span>iMessage first</span><b>·</b><span>No app to download</span><b>·</b><span>Built for real groups</span></div>
        </div>
        <div className="v2-hero-art" aria-label="RallyUp conversation preview">
          <div className="hero-grid-lines" />
          <div className="hero-orbit hero-orbit-one" /><div className="hero-orbit hero-orbit-two" />
          <div className="v2-hero-note note-left"><span>01</span><strong>Tell it<br /><em>the messy version.</em></strong></div>
          <div className="v2-phone v2-phone-hero">
            <div className="v2-phone-status"><span>9:41</span><span>●︎ ●︎ ●︎</span></div>
            <div className="v2-phone-bar"><span>‹︎</span><strong>RallyUp<small>Trip concierge</small></strong><span>•︎•︎•︎</span></div>
            <div className="v2-phone-body"><small className="v2-phone-day">TODAY</small><div className="v2-bubble v2-bubble-in">{scene.user}</div><div className="v2-bubble v2-bubble-out">{scene.reply}</div><div className="v2-bubble v2-bubble-out v2-bubble-soft">{scene.followUp}</div><span className="v2-typing"><i /><i /><i /></span></div>
          </div>
          <div className="v2-hero-note note-right"><span>✳︎</span><strong>Then it<br /><em>keeps going.</em></strong></div>
        </div>
      </section>

      <section className="v2-marquee" aria-label="RallyUp principles"><div><span>Less chasing</span><i>✳︎</i><span>More going</span><i>✳︎</i><span>Plans with a pulse</span><i>✳︎</i><span>Less chasing</span><i>✳︎</i><span>More going</span></div></section>

      <section className="v2-story" id="story" aria-labelledby="story-title">
        <div className="v2-story-intro"><p className="v2-kicker"><span /> The simple version</p><h2 id="story-title">A better way<br /><em>to make plans.</em></h2><p>There is always one person who becomes the trip planner by accident. RallyUp gives the work back to the group—and stays close enough to keep it moving.</p></div>
        <div className="v2-story-grid">
          <div className="v2-story-list">
            {storySteps.map((step) => <article className="v2-story-step" key={step.number}><span>{step.number}</span><div><h3>{step.title}</h3><p>{step.copy}</p></div></article>)}
          </div>
          <div className="v2-sticky-wrap"><div className="v2-sticky-card"><div className="v2-sticky-label">RallyUp, in the thread</div><div className="v2-sticky-quote">“I’ll ask around and bring you back something everyone can say yes to.”</div><div className="v2-sticky-line"><span /><small>gathering the good stuff</small></div><div className="v2-sticky-footer"><span>RallyUp</span><span>•︎•︎•︎</span></div></div><p className="v2-sticky-caption">The group chat<br /><em>finally has a co-pilot.</em></p></div>
        </div>
      </section>

      <section className="v2-choice" id="try-it" aria-labelledby="choice-title">
        <div className="v2-choice-heading"><p className="v2-kicker"><span /> See yourself here</p><h2 id="choice-title">Start wherever<br /><em>you are.</em></h2><p>Every trip has a different first text. Pick one to see how RallyUp finds the thread.</p></div>
        <div className="v2-choice-tabs" role="tablist" aria-label="Trip examples">{scenes.map((item, index) => <button key={item.label} type="button" role="tab" aria-selected={sceneIndex === index} className={sceneIndex === index ? "v2-choice-tab is-active" : "v2-choice-tab"} onClick={() => chooseScene(index)}><span>0{index + 1}</span>{item.label}<b>↗︎</b></button>)}</div>
        <div className="v2-experience"><div className="v2-experience-copy"><p className="v2-kicker"><span /> {scene.label}</p><h3>{scene.headline}</h3><p>RallyUp turns a half-formed idea into a few directions with a point of view.</p><a className="v2-underlink" href={smsHref}>Try this with RallyUp <span>↗︎</span></a></div><div className="v2-carousel-card"><div className={`v2-carousel-image color-${card.color}`}><span>{card.title.slice(0, 1)}</span><small>RALLYUP / {String(cardIndex + 1).padStart(2, "0")}</small></div><div className="v2-carousel-details"><div><strong>{card.title}</strong><small>{card.detail}</small></div><div className="v2-carousel-controls"><button type="button" onClick={() => moveCard(-1)} aria-label="Previous trip direction">←︎</button><span>{cardIndex + 1} / {scene.cards.length}</span><button type="button" onClick={() => moveCard(1)} aria-label="Next trip direction">→︎</button></div></div></div></div>
      </section>

      <section className="v2-final"><p className="v2-kicker"><span /> Good trips take coordination</p><h2>Give RallyUp<br /><em>the group chat.</em></h2><a className="v2-button v2-button-coral" href={smsHref}>Text RallyUp <span>↗︎</span></a></section>
      <footer className="v2-footer"><Link className="v2-brand" href="/"><span className="v2-mark" aria-hidden="true"><i /><i /><i /></span>RallyUp</Link><span>Trips, handled.</span><Link href="/dashboard">Organizer view ↗︎</Link></footer>
    </main>
  );
}
