<h1>
  <img src="./public/images/circles-logo.png" width="70" style="vertical-align: middle; margin-right: 10px;" />
  Thursday Circles
</h1>

## Table of Contents

- [Overview](#what-is-thursday-circles)
- [Core User Loop](#how-thursday-circles-works)
- [Product Experience](#product-experience)
- [Technical Design](#technical-tour)
- [Product & UX Decisions](#ux-decisions)
- [Production Considerations](#production-considerations)
- [Next Steps](#potential-mvp2--next-steps)
- [Running Locally](#running-locally)

---

## What is Thursday Circles?

Demo MVP exploring a ‘Thursday Circles’ feature: a lightweight community layer that keeps singles connected through small interest-based meetups between official Thursday events.

---

## Why build Thursday Circles?

After my initial conversation with Simon, I kept thinking about something he said about how dating is inherently private, which makes it difficult to get meaningful analytics on how people are actually engaging within in-person events. That led me to a question: How could we create a system (without relying on swiping) where engagement can be better observed through behavior, not just feedback?

As I thought more about it, that question expanded. It wasn’t just about measuring engagement, it was about creating more opportunities for it to happen, in a way that feels natural and low-pressure.

Additionally, I built this project as a way to explore that idea while showcasing how I think about product and engineering: how I approach problems, how I structure systems, and how I translate real-world behavior into a technical solution. This project is a fast, focused way of showing how I turn an idea into something tangible.

---

## Where did the idea for Thursday Circles come from?

A big part of this idea came from my own life experiences.

In my apartment building, it’s common for something small to turn into a group. First someone decides to work outside, a friend joins, someone walking by stops to chat, someone else spots it from their balcony, and before long there’s an organic group formed around a shared activity.

To add to that, I’ve noticed that even within friend groups, people are often in different seasons of life — some single, some not — and that changes how and where you meet people. There’s real value in being able to easily find others who are in a similar stage and open to the same kinds of interactions.

In other phases of life, this kind of grouping happens more naturally, like students who have built-in communities, or new parents who have organized meetups and support circles. For singles, though, the primary path is often one-on-one dating, rather than being embedded in a broader social environment of people in the same stage of life.

That made me think there’s an opportunity to create a more ambient, group-based way for people to meet, where connection happens through shared activity rather than direct intention.

This led to the idea of translating that behavior into a product experience: something where it feels easy to see something happening and just jump in, surrounded by people who are aligned in both interest and context.

---

## How Thursday Circles works:

I intentionally scoped this around the smallest, cleanest loop that would actually drive real-world interaction:

```
discover circles → see something happening → join → show up
```

Rather than building a full platform upfront, I focused on making this loop work end-to-end — reducing friction between interest and action, and prioritizing real-world participation over feature complexity.

To support this loop, I implemented a focused set of features that make it easy for users to move between each step:

* join or leave circles based on interests  
* explore events within those circles  
* RSVP to events or cancel RSVP  
* host new events or cancel events as a host  
* view and manage upcoming events in one place  
* switch cities to discover events while maintaining the same circles of interest  

Each of these is designed to reinforce the core flow without adding unnecessary complexity.

---
## Product Experience

![Core flow](./public/gifs/small-core-flow.gif)  
*Discover circles, explore events, and RSVP in a few clicks.*

![Create event](./public/gifs/small-create-event.gif)  
*Propose events with built-in validation and real-world location autocomplete.*

![AI moderation (guidelines)](./public/gifs/small-ai-moderation-guidelines.gif)  
*AI moderation evaluates whether an event is safe and appropriate before allowing submission.*

![AI moderation (context)](./public/gifs/small-ai-moderation-context.gif)  
*Moderation includes contextual matching to ensure locations for events align with their selected activity.*

---

## Technical tour

### Stack

* Next.js (App Router, React-based)  
* React  
* TypeScript  
* Tailwind CSS  
* Prisma ORM  
* PostgreSQL (Supabase)  
* Zod  
* Google Places API  
* Gemini API  

I chose this stack to balance speed with structure — strong typing (TypeScript), clear relational data modeling (Postgres + Prisma), and fast iteration with a full-stack React framework (Next.js), while aligning closely with the stack in the role description.

I used AI tools throughout development — including ChatGPT, Gemini, and Google Antigravity — to accelerate iteration and explore different implementation approaches.

I also used this project as an opportunity to quickly ramp on new tools (like Antigravity), while still making deliberate decisions around system structure, validation, and data modeling to ensure correctness, safety, and maintainability.

---

### API structure (designed for clarity and scalability)

The backend is split into focused API routes:

* /api/circles  
* /api/join-circle  
* /api/activity-events  
* /api/activity-metrics  
* /api/upcoming-events  
* /api/event-details  
* /api/rsvp  
* /api/cancel-rsvp  
* /api/propose-event  
* /api/cancel-event  

Each route is designed around a specific domain boundary (circles, events, RSVP), which keeps logic localized and easier to evolve. Routes are stateless and domain-focused, with clear request/response contracts that support predictable client behavior and easier future service separation.

This structure allows:

* clear separation of concerns  
* independent iteration  
* easier debugging and reasoning about failures due to localized logic  
* clearer ownership boundaries as the system grows  
* future scaling into separate services  

Validation is enforced on write operations at the API boundary using Zod to prevent invalid state from entering the system, rather than relying on downstream checks.

---

### Data modeling

I modeled a circle as a unique city + activity pair, which makes something like “Pickleball in Raleigh-Durham” a first-class entity in the system and prevents duplicate circles for the same context.

![Prisma ER diagram showing the core Thursday Circles data model](./public/images/prisma-er-diagram.png)

*Core entities and relationships across cities, activities, circles, events, memberships, and RSVPs.*

User membership is intentionally modeled at the activity level rather than the circle level. That keeps a user’s interest state stable while allowing circles to be resolved dynamically by city context, which supports real-world behavior like travel without duplicating user state across cities.

I also used database-level constraints to enforce data integrity and prevent invalid or duplicate state, including:

* one circle per city/activity pair  
* one membership per user/activity  
* one RSVP per user/event  

For events, hosting is modeled explicitly rather than treating a host as just another attendee. That makes host-specific permissions, analytics, and trust features easier to support.

Finally, I separated current RSVP state from RSVP change history, which keeps the operational model simple while preserving a clean audit trail for future analytics and product decisions.

This circle model also introduces some tradeoffs as the system scales. Because circles are derived from a city + activity join, queries rely on relational lookups and popular circles could become hotspots under heavy load. It also constrains flexibility if circles later evolve into more dynamic or user-defined groupings.

That said, this structure keeps the model simple and consistent for the current scope, and could be extended or refactored (for example, introducing circle-level membership or sharding strategies) if product requirements shift.

---

### RSVP tracking (analytics insight)

RSVP changes are tracked instead of overwritten.

![RSVP state vs change history](./public/images/rsvp-tables.png)

*Current RSVP state is stored separately from RSVP change history to support both product logic and future analytics.*

This enables analysis like:

* when users drop off before events  
* which events convert to attendance  
* host effectiveness  

This was intentional to support future product and growth decisions, rather than treating RSVP as a simple mutable state.

---

### Role-based behavior

Different capabilities exist for:

* attendees  
* hosts  

For example:

* attendees can RSVP and cancel RSVP  
* hosts can cancel events  

This is reflected directly in the UI.

---

### AI moderation and safety

AI is used as an assistive layer, not a source of truth.

Event creation uses:

* Gemini → checks content appropriateness and contextual match between description and location  
* Google Places → ensures locations are real  

Safeguards include:

* structured prompts  
* validation before and after AI calls  
* basic prompt injection resistance  

![AI moderation prompt with safety rules and prompt-injection safeguards](./public/images/ai-mod.png)

*Gemini is used as an assistive moderation layer, with explicit rules for safety, contextual matching, and protection against prompt injection attacks.*

I intentionally layered validation before and after the AI call to avoid over-reliance on model output.

I also tested moderation behavior across multiple languages, which is important for a product with international reach.

---

### Performance

* sessionStorage caching on the circles page  
* reduces reload flicker, avoids unnecessary re-fetching during navigation, and improves perceived performance  

---

### External services

* Google Places API  
  https://developers.google.com/maps/documentation/places/web-service/overview  

* Gemini API  
  https://ai.google.dev/  

These are used to ensure real-world grounding (location validation) and safe, scalable content moderation.

---

### Infrastructure / managed services

* Supabase (managed PostgreSQL)  
  https://supabase.com  

Used to provide the relational database layer for the application.

---

## UX decisions

I focused on designing an experience that minimizes friction, builds trust quickly, and makes it easy for users to move from interest to real-world interaction.

### State-driven onboarding

* The initial experience is state-driven  
* Users who haven’t joined any circles see a discovery-focused onboarding view  
* Once a user joins a circle, the UI shifts into a personalized experience centered around their circles and upcoming events  

This was intentional to reduce friction for new users while quickly reinforcing engagement for returning users.

---

### Reducing friction

* RSVP can be managed from multiple places  
* Validation happens early to avoid wasted effort  
* Friendly, lightweight error messaging  
* Required inputs (like host photos and valid locations) are enforced upfront rather than at the end of a flow

**Fail fast, not late**

Users are required to upload a profile photo before hosting an event.  
This ensures hosts are identifiable in real-world settings and prevents users from getting all the way through event creation only to be blocked at submission.

<img src="./public/images/no-host-photo.png" alt="Host photo required before hosting" width="300" />

The goal was to minimize the steps between interest → commitment → showing up, and to prevent users from investing time into actions that would ultimately fail validation to prevent user frustration.

---

### Reducing decision anxiety

* Events are centered around shared activities (circles) rather than open-ended social browsing  
* Group context lowers pressure compared to 1:1 interactions  

This makes it easier for users to commit without overthinking or evaluating every attendee.

---

### Making events feel real

* Hosts are required to have profile photos  
* Host images are zoomable for real-world identification  

This helps bridge the gap between digital coordination and real-world interaction, making it easier for users to actually find and recognize each other at events.

![Host interaction](./public/gifs/small-host-pic.gif)  
*Only host profiles are prioritized for real-world identification, with expandable images for clarity and trust.*

---

### Balancing trust and friction

* Hosts are required to have profile photos  
* Attendees are not  

This creates enough trust for users to feel comfortable attending, while keeping the barrier to entry low.


---

### Avoiding swipe behavior

* Attendee photos are intentionally small  
* The experience avoids encouraging evaluation or comparison  

The goal is to keep the focus on participation, not judgment.

---

### Centering the user

* “You” is used instead of names where appropriate  
* The current user appears at the top of RSVP lists  
* Clear “Hosting” and “Going” indicators communicate user state  
* A combined summary view of upcoming events allows users to quickly see everything they’ve committed to in one place  
* Events are visually differentiated (e.g. color-coded) to highlight which ones the user is hosting  

This reinforces a sense of ownership, reduces cognitive load, and makes it easier for users to keep track of their commitments.

---

## Production Considerations

If this were taken beyond a demo, I would approach productionizing it with a focus on fast iteration, easy recovery, and maintaining user trust, especially with a small technical team. The goal is not to over-engineer early, but to ensure the system can evolve safely as usage grows.

### Mobile strategy

* This demo was built using Next.js and React to optimize for speed of iteration and ease of testing and the UI was intentionally designed to mirror a mobile experience. For production of the actual mobile app, I would transition to React Native, which aligns with the existing stack and allows for shared logic across platforms  
* The core business logic (API layer, validation, data models) is already structured in a way that can be reused, while the UI layer would be refactored into more targeted, reusable components for mobile  

### Infrastructure

* Dockerize the application for consistent local, staging, and production environments  
* Deploy to a cloud provider (e.g. AWS, GCP, or Vercel depending on needs)  
* Use managed Postgres for reliability and operational simplicity  
* Keep the application stateless where possible to simplify scaling and deployment  

### CI/CD

* Set up CI/CD for linting, type checking, automated tests, and build/deploy pipelines  
* Build versioned Docker images as part of the pipeline so deploys are consistent and rollbacks are straightforward  
* Use GitHub Actions, paired with GitHub Advanced Security for secret detection and dependency vulnerability scanning  
* The same flow could be implemented in something like Tekton depending on broader infrastructure choices, though GitHub Actions is a strong default given its tight integration with GitHub-based workflows  

### Testing

* Add automated tests for:  
  * API routes  
  * validation logic  
  * role-based permissions  
  * RSVP state transitions  
* Include integration tests for core flows (e.g. RSVP + event creation lifecycle)  
* Add coverage for multilingual moderation flows  

### Monitoring and reliability

* Add monitoring and alerting for logs, errors, and key API flows (e.g. failed RSVPs, event creation errors)  
* Prioritize fast detection and recovery over heavy upfront complexity  
* This is especially important for maintaining user trust with a small team  

Using TypeScript helps reduce runtime errors and makes logs more actionable, since data structures and contracts are more predictable — supporting faster debugging and remediation.

---

### Authentication, trust, and abuse prevention

* Add authentication, likely starting with Google SSO  
* Store additional account-level information (e.g. phone number, profile metadata) to support trust, moderation, and abuse prevention  
* Reduce the ability for banned users to immediately re-enter the system using only a new email  

---

### Safety, moderation, and privacy

* Expand the AI moderation layer with richer policy checks, multilingual handling, confidence thresholds, and human-review fallbacks  
* Continue strengthening safeguards against prompt injection, malformed inputs, and abuse patterns  
* Extend role-based access control to backend and data layers to ensure users can only access or modify authorized data  
* Be intentional about data privacy, retention, and compliance requirements such as GDPR  

---

### API reliability and idempotency

* Design write endpoints (e.g. RSVP, event creation) to be idempotent where appropriate to handle retries and prevent duplicate state changes  
* Introduce idempotency keys or request deduplication for operations like event creation  
* Ensure state-transition endpoints (e.g. cancel RSVP, cancel event) behave consistently under repeated requests  
* Add rate limiting on write endpoints to prevent spam and abuse (e.g. RSVP or event creation)  
* Apply stricter limits to sensitive routes like event proposals  
* Add structured logging and request tracing to make debugging production issues faster and more reliable  

---

### Scaling considerations

* The current API structure supports separation into services if usage patterns justify it  
* I would not introduce Kubernetes unless the system’s complexity or traffic profile changes significantly, since at this stage it would add more overhead than value  

The goal throughout is to maintain a system that is simple, reliable, and easy to evolve as real usage patterns emerge.

---

## Potential MVP2 / Next steps

If this were extended beyond the initial MVP, I would focus on strengthening scheduling integrity, coordination, and personalization while maintaining a lightweight user experience. These are intentionally scoped as incremental improvements rather than foundational changes.

### Scheduling integrity

* Prevent users from double-booking events at the same time  
* Prevent hosts from creating or joining events that overlap with events they are already hosting  
* Add optional event capacity limits and waitlists  

These constraints help maintain reliability and avoid confusing or invalid states in the system.

---

### Trust and reliability

* Add safeguards around host behavior, such as limiting the number of events a user can host within a given time window  
* Require confirmation before canceling an event (e.g. “Are you sure?”)  
* Allow hosts to request a replacement host if they can no longer attend  

These features help prevent spam, reduce last-minute cancellations, and maintain trust in the platform.

---

### Event coordination

* Add lightweight event-level messaging (e.g. “running 3 minutes late”)  

This would improve coordination between attendees, though it introduces tradeoffs around moderation, storage, and real-time infrastructure, so it would need to be scoped carefully.

---

### Discovery and expansion

* Allow users to request new circles for their city or activity  
* Expand discovery based on user behavior and engagement patterns  

This helps the system grow organically while staying aligned with user demand.

---

### Location and logistics

* Add “Open in Apple Maps / Google Maps” integrations for event locations  
* Introduce a map-based view to browse nearby events  

This reduces friction between committing to an event and actually getting there.

---

### Personalization

* Use behavioral data (e.g. past RSVPs, attendance patterns) to surface recommended or featured events  

This helps reduce decision fatigue and increases the likelihood of engagement.

---

## Running Locally

### 1. Install dependencies

```bash
npm install
```

---

### 2. Create a .env file

Create a `.env` file in the root of the project:

```env
DATABASE_URL=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
GEMINI_API_KEY=
```

---

### 3. Set up required services

#### Database (DATABASE_URL)

This project uses PostgreSQL via Supabase.

To get a database URL:

1. Create a project at https://supabase.com  
2. Go to Project Settings → Database → Connection string  
3. Copy the URI connection string  
4. Paste it into your `.env`  

```
DATABASE_URL=postgresql://...
```

For local testing, any PostgreSQL instance will work — Supabase is just what was used for this demo.

---

#### Gemini API (GEMINI_API_KEY)

Used for event moderation and validation.

Create an API key here:  
https://ai.google.dev/gemini-api/docs/api-key

---

#### Google Maps / Places (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)

Used for location autocomplete and validation.

To create a key:

1. Go to https://console.cloud.google.com/  
2. Create or select a project  
3. Enable the Places API  
4. Create an API key under APIs & Services → Credentials  
5. (Recommended) Restrict the key for security  

Docs:

* https://developers.google.com/maps/get-started  
* https://developers.google.com/maps/documentation/places/web-service/overview  

---

### Optional: Run PostgreSQL locally with Docker

If you prefer not to use Supabase, you can run a local PostgreSQL instance:

```bash
docker run -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres
```

Then use:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
```

This is useful for quick local testing or a fully local development setup.

---

### 4. Set up the database

```bash
npx prisma generate
npx prisma migrate dev
npm run seed
```

---

### 5. Start the app

```bash
npm run dev
```

Open:

```
http://localhost:3000/circles?user=britt&city=raleigh-durham
```

---

## Demo users

The seeded database includes three users to demonstrate different product states:

* newcirclesuser  
  A brand new user in Raleigh-Durham with no profile photo and no joined circles.  
  Best for testing the onboarding and discovery flow.

* britt  
  An existing user with joined circles and upcoming events.  
  Represents a typical returning user experience.

* francesca  
  An active user/host who participates in and hosts events across cities.  
  Useful for testing hosting behavior and travel between cities.