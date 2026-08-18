# RallyUp

RallyUp is a text-first trip concierge for individuals and groups. It uses iMessage/SMS to move a trip from a rough idea to a coordinated plan, with web pages used only when they make the next step easier.

## Project guide

The living product and architecture document is here:

- [Trip Concierge Product Document](docs/trip-concierge-product.md) — product decisions, roadmap, user flows, data model, messaging behavior, and implementation status.

Key sections:

- [Agentic experience model](docs/trip-concierge-product.md#10-agentic-experience-model)
- [Carousel voting and cached visual options](docs/trip-concierge-product.md#13-in-message-carousel-voting-and-asset-cache)
- [Database model](docs/trip-concierge-product.md#14-carousel-data-model)
- [Implementation roadmap](docs/trip-concierge-product.md#15-next-implementation-slices)

## Local development

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run typecheck
npm run test:unit
npm run test:e2e
npm run build
```

The app runs in preview mode when `MESSAGING_PROVIDER` is not `sendblue`. Configure Sendblue only in server-side environment variables; never expose API credentials to the browser.
