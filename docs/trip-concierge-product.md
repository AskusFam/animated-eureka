# Trip Concierge Product Document

Status: Phase 3 implementation — Agentic concierge MVP

Last updated: 2026-08-17

This is the living product, architecture, and validation document for a text-first trip-planning concierge.

## 1. Product thesis

Trip Concierge helps an individual or group plan a trip through SMS. It acts like a coordinating concierge: it collects preferences, remembers relevant history, proposes plans, resolves tradeoffs, and keeps the itinerary current.

The primary customer problem is not finding travel information. It is the coordination burden that usually falls on one person in the group.

## 2. Product principles

- Conversation is the primary interface.
- The platform should reduce coordination work, not create another inbox to manage.
- AI proposes, interprets, summarizes, and communicates; application logic records and validates decisions.
- Private information is private by default.
- Participants should be able to contribute without creating accounts or downloading an app.
- Web pages are used when SMS is too limited, especially for forms, comparisons, itineraries, and payments.
- The system should be transparent about uncertainty, stale information, and recommendations that have not been booked or verified.

## 3. Product modes

### Default: private concierge mode

The organizer and each participant communicate one-to-one with the concierge number. The platform combines their responses into a trip workspace without exposing private responses to the rest of the group.

Benefits:

- Protects budgets, dietary needs, accessibility needs, and interpersonal preferences.
- Avoids group-chat noise.
- Lets the system route every reply to the correct trip and participant.
- Allows the concierge to summarize disagreement neutrally.

### Alternate: shared group-chat mode

The concierge participates in one large group conversation with the organizer and participants. It can post questions, proposals, reminders, and decisions into the shared thread.

Benefits:

- Feels social and transparent.
- Makes discussion and shared decisions visible.
- Could become especially useful during the trip itself.

Risks:

- Sensitive preferences may be exposed.
- Group messages can become noisy.
- SMS threading and participant identity are harder to control.
- The platform may need to support different carrier and messaging behaviors.

Decision for MVP: build private concierge mode first and preserve shared group-chat mode as an explicit alternate path or feature flag.

## 4. Initial MVP

The MVP supports one organizer creating a domestic or international leisure trip for approximately 4–8 people. The concierge gathers requirements by SMS, uses a web page when useful, generates two or three itinerary concepts, collects feedback, and publishes a shared itinerary page. The first pilot may still begin with destinations and participant phone numbers that are easiest for the selected messaging provider to support.

### Included

- Trip creation by SMS and/or a lightweight web page.
- Participant invitations by SMS.
- Explicit participant opt-in and opt-out.
- Structured collection of dates, destination, budget, preferences, and constraints.
- Private participant conversations with the concierge.
- Itinerary proposals with explanations and cost ranges.
- SMS voting and confirmation.
- A mobile-friendly shared itinerary page.
- Trip history and manually confirmed group or individual preferences.
- Reminders and status updates.

### Excluded from MVP

- Direct booking.
- Holding or pooling funds.
- Expense settlement and reimbursements.
- Complex international travel.
- Native mobile apps.
- Large-scale social discovery.
- Fully autonomous decisions.

## 5. Initial user journey

1. An organizer texts the concierge number: “Plan a trip to Charleston for five people.”
2. The concierge collects destination, dates, budget, and trip style.
3. The organizer invites participants.
4. Each participant opts in and answers a short preference flow.
5. The concierge summarizes requirements and identifies conflicts.
6. The planner generates two or three itinerary concepts.
7. Participants vote or respond through SMS; richer comparisons open on the web.
8. The organizer confirms the selected plan.
9. Everyone receives the current itinerary page and key SMS reminders.
10. After the trip, the concierge asks for feedback and requests permission to remember useful preferences.

## 6. Phase roadmap

### Phase 0 — Product and compliance foundation

Define the target user, trip scope, interaction modes, permissions, consent model, and MVP success criteria. Produce message-flow maps and prepare the SMS compliance requirements.

### Phase 1 — Concierge prototype

Use a real SMS number and manual or semi-manual planning to test the experience with 5–10 trips before automating the full workflow.

### Phase 2 — Technical foundation

Build the messaging webhook, outbound messaging, message logging, user identity, trip records, consent records, conversation state, configurable reminder scheduler, secure web links, and a basic internal dashboard. Keep the messaging layer abstract enough to support different country routes and future channels.

### Phase 3 — Trip creation and onboarding

Automate organizer setup, participant invitations, opt-in, preference collection, and trip brief generation.

### Phase 4 — Itinerary generation

Generate itinerary concepts from structured requirements, with constraints, tradeoffs, source links, timestamps, and confidence indicators.

### Phase 5 — Group decision-making

Support voting, preference summaries, conflict resolution, organizer approval, and final itinerary publication. Test shared group-chat mode as an alternate experience.

### Phase 6 — Shared itinerary page

Provide a mobile-friendly source of truth with schedule, locations, costs, participants, decisions, and calendar/map links.

### Phase 7 — Memory and post-trip learning

Capture feedback and save only preferences that users confirm should persist.

### Phase 8 — Pilot hardening

Run a 10–20 group pilot and address delivery, identity, time-zone, ambiguity, stale-data, privacy, and reminder issues before a broader launch.

## 7. Phase 0 objectives

Phase 0 is complete when we have a narrow product definition that can be tested without building unnecessary booking, payment, or social-network functionality.

### 7.1 Target customer

Working hypothesis: the first customer is the person who regularly organizes friend-group or family weekend trips and is tired of chasing everyone for dates, preferences, payments, and decisions.

Questions to validate:

- Which group is most painful to coordinate: friends, families, couples, or work groups?
- How far in advance do they plan?
- What part of coordination consumes the most time?
- Would they trust an AI concierge with private preferences?
- Would participants respond to an unfamiliar SMS number?

### 7.2 Initial trip scope

Working decision:

- Geography: domestic and international leisure travel.
- Initial operating scope: support travelers and destinations that the selected messaging provider can reliably serve, then expand country coverage deliberately.
- Trip type: weekend, short leisure, and longer leisure trips.
- Group size: 4–8 participants.
- Planning horizon: approximately 2 weeks to 12 months.
- Planning content: destination, lodging area, activities, meals, transportation suggestions, and itinerary coordination.
- Booking: links or recommendations only; no transaction execution.

International trips add requirements that should be represented in the intake flow, including passport or visa considerations, entry requirements, currency, time zones, international transportation, travel insurance, and local emergency information. The concierge should provide links to authoritative government or provider sources and avoid presenting immigration or legal guidance as definitive advice.

### 7.3 Hard constraints and preferences

Hard constraints must not be violated without explicit acknowledgment. Examples include dates, maximum budget, accessibility requirements, dietary restrictions, and participant availability.

Preferences can be traded off. Examples include hotel style, nightlife, walking tolerance, activity level, food interests, and preferred neighborhood.

The system must ask when it cannot distinguish a hard constraint from a preference.

### 7.4 Roles and permissions

Working model:

- Organizer: creates the trip, invites participants, approves major decisions, and can close the trip.
- Participant: consents, provides preferences, votes, and views the itinerary.
- Concierge: coordinates communication and proposes plans.
- Internal operator: can review or assist with a trip during the prototype phase.

The organizer should not automatically see private participant responses unless the participant chooses to share them or the system presents an anonymized summary.

### 7.5 SMS number decision

Working decision: use a platform-owned US toll-free number for the first production-like prototype, likely through Twilio. A local 10-digit A2P number remains a future option if the product benefits from a more personal or local identity. A short code is out of scope.

The number must support two-way SMS, inbound webhooks, delivery status, opt-out handling, and international routing where available. The messaging layer should not assume that one US number will provide the same deliverability, sender identity, or reply behavior in every destination country.

US application-to-person messaging requires the appropriate registration or verification process. The onboarding and invitation flows must document consent, message frequency, message-and-data-rate disclosures, `STOP`, `START`, and `HELP` behavior.

### 7.6 Privacy and trust decisions

Phase 0 must define:

- What information is visible to the organizer.
- What information is visible to other participants.
- Whether the concierge may summarize a private preference.
- How long messages and trip history are retained.
- How participants leave a trip.
- How a user deletes their data.
- How persistent preferences are confirmed.
- When human review is allowed during the prototype.

### 7.7 Reminder philosophy

Recommendation: make reminders a core product capability rather than an afterthought. The concierge should actively move a trip forward by reminding the right person about the right decision at the right time.

Reminders should be:

- Consent-based and tied to a specific trip or action.
- Configurable by the organizer and adjustable by each participant.
- Sent in the recipient’s local time where the system can determine it.
- Suppressed during user-defined quiet hours.
- Escalated when an important deadline is approaching.
- Stopped immediately when a user replies, completes the action, leaves the trip, or opts out.
- Logged so the team can measure whether reminders reduce organizer work.

Suggested reminder policy:

1. Send the initial request with a clear action and deadline.
2. Send a friendly reminder after 12–24 hours if there is no response.
3. Send a more prominent reminder after another 24–48 hours.
4. Send a final deadline reminder before the trip or decision is blocked.
5. Notify the organizer about outstanding actions and offer a decision: extend, proceed with assumptions, or remove the participant from that decision.

The system should support reminder intensity settings such as standard, persistent, and minimal. Persistent should mean more frequent and clearer, not unlimited or coercive. A participant must always be able to pause trip reminders, change quiet hours, or leave the trip without contacting the organizer.

### 7.8 MVP success criteria

The MVP should be considered successful if a test organizer can:

- Start a trip in under five minutes.
- Invite participants without manually coordinating every person.
- Collect enough responses to create a useful group brief.
- Reach a group decision with materially fewer organizer follow-ups.
- Publish one current itinerary page for the group.
- Move the trip forward through reminders without requiring the organizer to chase every participant manually.

Initial pilot metrics:

- Participant opt-in rate.
- Preference-completion rate.
- Time from trip creation to itinerary approval.
- Number of organizer follow-ups.
- Number of itinerary revisions.
- SMS delivery failures and opt-outs.
- Percentage of groups willing to use the service again.
- Percentage of outstanding actions completed after a reminder.
- Organizer follow-ups replaced by concierge reminders.
- Reminder opt-outs, pauses, and complaints.

## 8. Proposed technical shape

Start with a modular monolith and a relational database. The system should have clear modules for messaging, identity and consent, trips, participants, preferences, planning, decisions, itinerary publication, reminders, and memory.

```text
SMS provider
    -> inbound webhook
    -> message and identity service
    -> conversation state machine
    -> trip and participant records
    -> planning and decision services
    -> SMS response or secure web link
```

The LLM can interpret messages, draft language, summarize responses, and generate candidate plans. Deterministic application logic must control permissions, consent, trip membership, voting, confirmed decisions, and stored preferences.

## 9. Phase 0 deliverables

- Product brief and target-user definition.
- MVP scope and explicit non-goals.
- Private-mode and group-mode conversation diagrams.
- Organizer and participant permission matrix.
- SMS consent, invitation, opt-out, and help scripts.
- First-pass privacy and data-retention decisions.
- Initial message taxonomy and trip-state model.
- Pilot interview/test plan.
- Decision on the first SMS provider and number type.
- Phase 1 prototype plan.

## 10. Agentic experience model

Rally should behave like a bounded agent with an objective, a next action, and a stop condition. It should infer intent from natural language, take useful actions, and ask only for information that blocks the next action.

Primary objectives:

- Discover: explore destinations or trip concepts from a loose idea.
- Plan a known trip: turn a destination, dates, and travelers into an itinerary.
- Coordinate a group: collect private preferences, resolve tradeoffs, and move decisions forward.

Agent actions:

- Research destinations.
- Collect the minimum missing trip detail.
- Create a review workspace.
- Collect participant preferences privately.
- Build an itinerary draft.
- Request organizer or group approval.

Application logic remains responsible for permissions, consent, trip membership, stored preferences, reminders, spending, and booking. The model can choose language and recommend the next action, but it cannot independently contact a participant, spend money, or finalize a decision without the relevant permission.

## 11. Progressive profile and web workspace

The first profile page should collect only durable information that improves future planning:

- Name, email, home base, and time zone.
- Travel styles such as food, outdoors, relaxed, luxury, nightlife, or budget-conscious.
- Typical budget range and trip length.
- Passport country, accessibility needs, dietary needs, and things to avoid.
- Planning style, reminder intensity, and whether Rally should ask before contacting the group.

All fields except name, email, home base, and time zone are optional. Profile data should be used as a default, not treated as a permanent rule; the traveler can override it per trip.

The webpage should be introduced after Rally understands the user’s intent, especially when the user is the planner or when a group trip has enough detail to create a workspace. It should feel like a helpful setup page, not a prerequisite form.

The trip workspace is the source of truth for the organizer. It shows Rally’s next move, participants, current trip status, and the four-step plan: discover, coordinate, recommend, and finalize. A future version will add comparisons, approvals, source links, and the shared itinerary.

## 12. Prototype implementation status

Implemented in the current prototype:

- Persistent phone-based conversation sessions with explicit `NEW`, `RESET`, and `START OVER` commands.
- Intent and flow classification for group, solo, discovery, research, and participant paths.
- Multi-provider AI routing with curated Gemini, Mistral, OpenRouter, and deterministic fallback candidates.
- Traveler onboarding page and profile persistence alongside the conversation session.
- Organizer trip workspace with participant view and agent roadmap.
- Agent plan selection with bounded actions and onboarding-link handoff.
- Sendblue inbound idempotency claims to prevent duplicate webhook replies, with a database uniqueness guard and an in-memory fallback.
- Trace IDs across inbound messages, model/provider timing, outbound sends, and Sendblue delivery callbacks.
- Conditional progress acknowledgements for slow model calls plus a bounded user-facing fallback when intake times out.
- Unit coverage for agent decisions and E2E coverage for landing, trip creation, onboarding, invitations, and workspace rendering.

Next implementation slice:

- Add the Groq provider key and verify cross-provider fallback with forced test failures.
- Add research tools with source capture and freshness timestamps.
- Add participant-specific preference pages and private response summaries.
- Add review pages with approve, revise, and ask-the-group actions.
- Add reminder jobs tied to outstanding agent actions and local quiet hours.

## 10. Open decisions

The following recommendations are the current working decisions. They should be validated during Phase 1 rather than treated as permanent commitments.

### 10.1 Product name in SMS messages

Recommendation: use a clear temporary name such as “Trip Concierge” until user research produces a stronger brand. Every first message should identify the service and explain why the recipient is receiving the text.

Example:

> Trip Concierge: Alex invited you to help plan a Charleston trip. Reply YES to join or NO to decline. Msg & data rates may apply. Reply STOP to opt out or HELP for help.

Rationale: clarity and trust matter more than brand polish during the prototype. Avoid presenting the service as a person or implying that a human is responding when the message is automated.

### 10.2 First target segment

Recommendation: start with friend groups planning domestic or international leisure trips, especially groups of 4–8 adults where one person normally coordinates the trip.

Rationale:

- The pain is frequent and recognizable.
- The product can demonstrate value on both familiar domestic trips and higher-friction international trips.
- Participants are likely to tolerate SMS-based coordination.
- The organizer can recruit the whole pilot group.
- Success can be measured through reduced follow-up effort.

Families and work groups should remain secondary research segments, not equal MVP targets. For the first pilot, use a mix of domestic and international trips only if the messaging provider can reliably reach the participants.

### 10.3 Final approval authority

Recommendation: the organizer has final approval authority for the trip plan, but participants retain control over their own consent, private information, and participation.

The organizer can approve the itinerary, but cannot:

- Opt another participant into SMS.
- View private responses without permission.
- Override a hard personal constraint.
- Commit another participant to a cost or booking.

Rationale: one accountable decision-maker keeps the workflow from stalling, while participant autonomy prevents trust and privacy problems.

### 10.4 What participants see

Recommendation: participants see their own private conversation and a shared, anonymized group summary. They should not see named private responses by default.

Example summary:

> Four people prefer a relaxed pace, two people want nightlife, and the group budget ranges from $600–$900 per person. One accessibility requirement is being accounted for privately.

Named attribution should require explicit permission. The organizer can receive more detailed status information, such as who has not responded, without seeing the content of private responses.

Rationale: anonymous summaries support honest input while still making tradeoffs visible.

### 10.5 Human review during the prototype

Recommendation: use human-in-the-loop review for every itinerary before it is sent as a final recommendation during Phase 1.

The operator should review:

- Hard-constraint satisfaction.
- Budget arithmetic.
- Travel times and sequencing.
- Accessibility and dietary considerations.
- Source freshness.
- Tone and clarity.

The operator should not silently alter private preferences or make undisclosed decisions. Review activity should be logged.

Rationale: the first objective is to learn the workflow and protect pilot users, not to prove full autonomy.

### 10.6 Onboarding channel

Recommendation: use SMS for the initial invite and short preference questions, with a secure web page for the longer intake and itinerary review.

The first SMS flow should ask only enough questions to establish engagement. A web page should handle:

- Longer preference forms.
- Budget ranges.
- Accessibility or dietary details.
- Comparing itinerary options.
- Reviewing the shared itinerary.

Rationale: SMS is the low-friction entry point, while the web is better for structured and sensitive information.

### 10.7 Travel data sources for the pilot

Recommendation: begin with a small, curated set of sources and human verification rather than attempting universal travel coverage.

The pilot should use:

- Official attraction and venue websites for hours, policies, and accessibility information.
- Reputable map and routing data for travel times.
- A limited lodging/activity source for discovery and links.
- Direct source URLs and retrieval timestamps for every recommendation.

The system should label each item as an idea, researched recommendation, checked option, or confirmed booking. No item should be represented as booked unless a user completes the booking independently or a future booking integration confirms it.

### 10.8 Nonresponsive participants and reminders

Recommendation: use persistent, configurable reminders with a clear stopping point and participant controls.

Suggested policy:

1. Send the initial invitation.
2. Send a reminder after 12–24 hours if there is no response.
3. Send a second reminder after another 24–48 hours.
4. Send a deadline reminder before the decision or trip milestone is blocked.
5. Tell the organizer which action is outstanding, without exposing private information.
6. Continue planning using the responses received, clearly marking assumptions, or ask the organizer whether to extend the deadline.

Participants can select standard, persistent, or minimal reminders; pause reminders; set quiet hours; or leave the trip. The organizer can proceed without a participant, extend the deadline, or remove the participant from a decision. The system must never send unlimited reminders or continue after an opt-out.

### 10.9 Shared group-chat timing

Recommendation: reserve a full shared group-chat implementation for after the private-mode pilot, but test the concept manually during Phase 1 with one or two groups.

The manual test can use a controlled shared thread for:

- Announcing itinerary options.
- Collecting final votes.
- Sending trip reminders.
- Coordinating during the trip.

Rationale: private mode is the safer foundation for consent and preference collection. A small manual test will show whether the group-chat experience adds value before we build its routing and privacy model.

### 10.10 Recommended Phase 0 decision set

For planning purposes, Phase 0 should close with these decisions:

- Target: friend groups planning domestic or international leisure trips.
- Default interaction: private SMS conversations with the concierge.
- Alternate interaction: shared group chat, tested manually and built later.
- Authority: organizer approves the final itinerary; participants control their own data and consent.
- Visibility: anonymized group summaries by default.
- Quality control: human review of every itinerary during the initial pilot.
- Onboarding: SMS first, web for detailed input and review.
- Data: curated, source-linked, timestamped recommendations.
- Reminders: persistent, configurable, local-time-aware, quiet-hour-aware, and stopped after completion, pause, leave, or opt-out.
- MVP number: platform-owned US toll-free number, subject to provider verification.

## 11. Current decisions log

| Date | Decision | Rationale |
|---|---|---|
| 2026-08-14 | Private concierge mode is the MVP default | Protects sensitive information and reduces group noise |
| 2026-08-14 | Shared group-chat mode remains an explicit alternate path | Preserves the original vision and may be valuable for shared decisions and live trips |
| 2026-08-14 | Use SMS as the primary interface | Low friction and no app download for participants |
| 2026-08-14 | Use web pages for rich interactions | Better for forms, comparisons, itineraries, and future payments |
| 2026-08-14 | Defer direct booking and pooled money | Avoids a large compliance, liability, and operational expansion before core value is proven |
| 2026-08-14 | Support domestic and international leisure trips | International planning increases value; country coverage will expand according to messaging and travel-data reliability |
| 2026-08-14 | Make reminders a core product capability | Persistent, well-timed reminders can directly reduce the organizer’s coordination workload |
| 2026-08-14 | Start with a US toll-free number for the prototype | Neutral US identity and appropriate two-way business messaging path; international reach requires provider and country validation |

## 12. Prototype technical stack

### 12.1 Recommendation

Use a TypeScript modular monolith with a separate background worker. Package both processes as Docker containers so the same images can run locally, in a simple prototype host, or on Azure Container Apps.

```text
Next.js web/API app
        |
        +--> PostgreSQL
        +--> Twilio adapter
        +--> LLM adapter
        +--> travel-data adapters
        +--> job table / queue adapter

Background worker
        |
        +--> reminders
        +--> message delivery retries
        +--> itinerary generation
        +--> post-trip follow-ups
```

### 12.2 Components

| Concern | Prototype choice | Azure path later |
|---|---|---|
| Language/runtime | TypeScript on Node.js | Azure Container Apps or App Service running the same container |
| Web and API | Next.js with server-rendered web pages and API routes | Azure Container Apps or App Service |
| Database | PostgreSQL | Azure Database for PostgreSQL Flexible Server |
| Database access | Drizzle ORM with SQL migrations | Same PostgreSQL schema and connection model |
| Background work | Separate Node worker using a PostgreSQL-backed job table/queue | Azure Service Bus queues or Container Apps Jobs behind a queue adapter |
| SMS | Twilio Messaging adapter | Keep Twilio initially; replaceable through the messaging interface |
| AI | OpenAI SDK behind an internal LLM provider interface | OpenAI API or an Azure-hosted model behind the same interface |
| Travel information | Provider adapters plus source URLs and retrieval timestamps | Same interfaces; add managed search or additional providers later |
| Authentication | Signed, expiring participant links; magic-link organizer access | Microsoft Entra External ID or another identity provider later |
| Secrets | Environment variables locally; never commit secrets | Azure Key Vault and managed identity |
| Observability | Structured JSON logs, request IDs, and OpenTelemetry instrumentation | Azure Monitor and Application Insights |
| Local development | Docker Compose with PostgreSQL and the app/worker | Same containers deployed through Azure tooling |

### 12.3 Architectural boundaries to establish immediately

- `MessagingProvider`: send SMS, parse inbound messages, retrieve delivery status, and handle provider-specific behavior.
- `LLMProvider`: classify intent, extract structured data, draft messages, summarize groups, and generate itinerary candidates.
- `TravelDataProvider`: search, retrieve, normalize, and timestamp travel information.
- `JobQueue`: schedule, claim, retry, cancel, and deduplicate background work.
- `IdentityService`: map phone numbers and secure links to users, trips, and permissions.
- `ReminderPolicy`: calculate when and how reminders should be sent based on consent, urgency, local time, quiet hours, and completion state.

These interfaces are more important than prematurely splitting the application into microservices. The first implementation should keep modules in one repository and one deployable web application plus one worker.

### 12.4 Initial data model

Start with relational tables for:

- Users and phone numbers.
- Trips and trip participants.
- Consent events.
- Conversations and messages.
- Preferences and constraints.
- Proposals and itinerary items.
- Votes and decisions.
- Reminders and reminder attempts.
- Learned preferences and feedback.
- Source records and retrieval timestamps.

## 13. Phase 1 implementation plan — useful end to end

Phase 1 should prove one complete loop with a real organizer and a small group:

```text
Organizer texts Rally
    -> Rally creates a trip brief
    -> Rally asks focused follow-up questions
    -> Organizer invites participants
    -> Participants answer privately
    -> Rally summarizes constraints and gaps
    -> Research service gathers source-backed options
    -> Rally sends two or three proposals
    -> Group gives feedback or votes
    -> Organizer approves
    -> Rally publishes a shared itinerary page
    -> Reminder service moves the group through the next actions
```

### 13.1 Build order

1. Replace the current keyword reply with a persisted conversation state machine: `new`, `collecting_trip_brief`, `inviting_participants`, `collecting_preferences`, `researching`, `awaiting_feedback`, `approved`, and `completed`.
2. Make `RALLY WEB PLAN` create or resume a trip for the sender and ask the first useful question.
3. Add structured extraction for destination, dates, group size, budget, pace, and trip type. Store uncertain fields as candidates until confirmed.
4. Add participant invitations with explicit `YES`, `NO`, `STOP`, and `HELP` handling.
5. Add a secure web intake link for longer preferences and a proposal-review page.
6. Add a research job that searches a small set of approved sources, stores URLs and retrieval timestamps, and returns normalized options.
7. Add a proposal model with cost range, tradeoffs, source links, confidence, and an explicit `idea`, `researched`, `checked`, or `confirmed` status.
8. Add SMS feedback commands such as `1`, `2`, `3`, `MORE`, `CHANGE`, and `APPROVE`.
9. Add the shared itinerary page as the source of truth, then add reminders tied to incomplete actions.
10. Add an operator review queue before a proposal is marked final.

### 13.2 AI and research boundary

The AI should ask, interpret, summarize, and draft. It should not be the system of record. Deterministic application code owns consent, identity, permissions, state transitions, voting, reminder suppression, and confirmed itinerary data.

The research flow should be:

```text
Trip requirements
    -> search query planner
    -> approved source adapters
    -> fetch and normalize results
    -> freshness and constraint checks
    -> LLM synthesis with citations
    -> operator or organizer approval
```

Every researched recommendation must retain its source URL, retrieval time, destination, price context, and uncertainty. International travel information must link to authoritative government or provider sources and be presented as information to verify, not legal or immigration advice.

### 13.3 Model integration decision

Use an `LLMProvider` interface so Rally can call an API model from the backend without coupling product logic to one vendor. The first implementation uses Gemini’s Interactions API from the backend, requesting a strict JSON shape for intent and field extraction, with deterministic validation after every model call. The integration uses the REST endpoint so the current Node 18 deployment does not need a runtime upgrade.

The model provider is intentionally replaceable. Gemini credentials belong in `GEMINI_API_KEY` as a server-only environment variable, and the model is selected with `GEMINI_MODEL`. This does not prevent using other models later for operator review or specialized research tasks.

### 13.4 Carousel concept

Carousels should be used as a decision surface, not as the primary conversation. After research, Rally can send a short text followed by a visual comparison:

> I found three good directions for Lisbon. Swipe through them and reply 1, 2, or 3. I can revise any option.

Each card should represent one coherent plan, for example:

- `1 · Alfama + slow mornings` — lower cost, more walking, food-forward.
- `2 · Baixa + central nights` — easiest logistics, mid-range cost.
- `3 · Cascais extension` — more space and beach time, longer transfers.

The image should be a destination or neighborhood image; the message text remains the canonical place for prices, caveats, and source links. The web proposal page remains the richer comparison view.

Sendblue carousels require a V2 line and 2–20 HTTPS image URLs, so the current free shared line should use ordinary text plus single-image links until a V2 line is available. [Sendblue carousel requirements](https://docs.sendblue.com/api-v2/carousel)

### 13.5 Phase 1 definition of done

- An organizer can create a trip and receive a meaningful next question.
- At least two participants can join privately and complete the core preference flow.
- Rally can distinguish hard constraints from preferences and ask for clarification.
- Research results include source links, timestamps, cost context, and caveats.
- Rally produces two or three proposals and records feedback.
- An organizer can approve one proposal and publish an itinerary page.
- Reminders advance incomplete actions and stop after completion, pause, leave, or opt-out.
- An operator can inspect the full trip timeline and intervene before final approval.
- The full flow is covered by unit tests and one end-to-end test using mocked Sendblue and research providers.

Use explicit status fields and an append-only message/event history. Do not rely on the latest LLM conversation transcript as the authoritative trip state.

### 12.5 Deployment strategy

For the prototype:

1. Run the app, worker, and PostgreSQL locally with Docker Compose.
2. Use a shared managed PostgreSQL database for a pilot environment.
3. Deploy the same Docker images to a simple container host or Azure Container Apps.
4. Move background work to Azure Service Bus when delivery volume or reliability requirements justify it.
5. Add Azure Key Vault, managed identity, Application Insights, and infrastructure-as-code as the pilot becomes a production service.

Azure Container Apps is a good target because it supports HTTP applications, background processing, scheduled or event-driven jobs, autoscaling, revisions, and scale-to-zero behavior. Azure Database for PostgreSQL Flexible Server preserves the open-source PostgreSQL engine and supports managed backups, scaling, and connection pooling. Azure Service Bus provides durable queues, publish/subscribe topics, retries, and dead-letter handling for later reliable processing.

### 12.6 Deliberate non-choices

- Do not start with microservices.
- Do not start with Kubernetes or AKS.
- Do not make the LLM responsible for database state transitions.
- Do not add Redis unless measurement shows that PostgreSQL-backed jobs are insufficient.
- Do not make Azure-specific SDKs part of the core domain logic.
- Do not build direct booking or payments into the first deployment.
