# System Design

---

## Mobile System Design Fundamentals

## How do you approach **mobile system design** differently from backend system design?

- **In plain words:** Mobile design is constrained by **battery, radio cost, storage, OS background limits, and UI thread jank**. You optimize for perceived performance and graceful degradation offline—not just raw throughput.
- **How it works:** You still clarify requirements, estimate scale, define APIs, choose storage (local DB/cache), sync strategy, auth, observability, and rollout.
- **What to watch for:** Strong consistency vs offline-first; push vs pull; client ML vs server inference; monolith module vs feature modules.
- **Example:** Designing a healthcare charting app—HIPAA logging, encrypted Room, background sync with WorkManager, conflict resolution, and certificate pinning.

### Useful links

- [System design Q&A PDF](assets/system_design_questions.pdf)
- [9 Architectural Patterns for Data and Communication Flow](https://www.linkedin.com/feed/update/urn:li:activity:7220454954266759168/)


> **Interview answer:** **Constraints-first architecture** wins interviews.

---

- [Learn more](https://www.linkedin.com/feed/update/urn:li:activity:7220454954266759168/)
## Walk me through **SOLID** and how it shows up in Android codebases.

- **S:** One reason to change per class (don’t mix navigation + analytics + JSON parsing in one god-object).
- **O:** Extend via interfaces/sealed contracts (feature plugins) vs editing core classes endlessly.
- **L:** Substitutable implementations for repositories/test doubles.
- **I:** Small interfaces for Room DAOs/repositories; avoid “god interfaces”.
- **D:** Depend on abstractions (`PaymentGateway`) not concrete SDK classes—critical for testability and vendor swaps.
- **Example:** Replacing an analytics SDK without touching feature modules by routing through an interface + DI graph.

### Useful links

- [SOLID:](https://lnkd.in/dafK6TzQ)  
- [DRY:](https://lnkd.in/dreUT7_h)  
- [KISS:](https://lnkd.in/d-nFYfdR)  
- [YAGNI:](https://lnkd.in/dHzEi__Y)  
- [SOLID in Android (Kotlin examples)](https://www.coderefer.com/blog/solid-principles-in-android-with-kotlin-examples/)


> **Interview answer:** SOLID is how you keep **large apps mergeable**.

---

- [Learn more](https://www.coderefer.com/blog/solid-principles-in-android-with-kotlin-examples/)
## Name core **design patterns** you’d use on mobile and anti-patterns you avoid.

- **Patterns:** Singleton (DI scope, not static god), Factory (create ViewModels w/ assisted injection), Adapter (UI + legacy APIs), Observer (Flow/LiveData), Strategy (payment/auth providers).
- **Anti-patterns:** Service locator hiding dependencies, “utils” package dumping ground, leaking `Context`, blocking main thread “just once”.
- **Example:** Strategy for remote config sources: Firebase vs static JSON fallback.

### Useful links

- [Singleton:](https://lnkd.in/dB5aDUXr)  
- [Factory:](https://lnkd.in/dvZtfe-k)  
- [Adapter:](https://lnkd.in/dKQpsTfe)  
- [Observer:](https://lnkd.in/dByc-whP)  
- [Strategy:](https://lnkd.in/d9dz8ER7)  


> **Interview answer:** Patterns are **dependency boundaries**, not trivia.

---

- [Learn more](https://lnkd.in/d9dz8ER7)
## Architecture, APIs, and Performance

## How do you document **class, sequence, and deployment** views for a mobile feature?

- **Class diagram:** Modules, key entities, repositories, and SDK boundaries.
- **Sequence diagram:** Login → token refresh → API retry → cache write → UI emission.
- **Deployment-ish on mobile:** Build flavors, feature flags, remote config, crash pipelines, staged rollouts, Play integrity checks.

### Useful links

- [Class diagrams:](https://lnkd.in/d8_8rYCp)  
- [Sequence diagrams:](https://lnkd.in/duPf_cJ2)  
- [Interfaces:](https://lnkd.in/d8NzSRgG)  


> **Interview answer:** Interviewers reward **clear diagrams** + explicit failure paths.

---

- [Learn more](https://lnkd.in/d8NzSRgG)
## What’s your **API design** checklist for mobile clients?

- Versioning + backward compatibility (feature flags, nullable fields).
- Pagination (cursor/keyset > deep offsets for feeds).
- Idempotency for retries (safe POST keys).
- Auth: OAuth2/OIDC, refresh rotation, certificate pinning strategy.
- Observability: correlation IDs in logs + server traces.

### Useful links

- [RESTful API:](https://lnkd.in/dqDrkbDS)  
- [Pagination:](https://lnkd.in/dJfwFqmd)  
- [Authentication:](https://lnkd.in/dQ94BgzQ)  


> **Interview answer:** Mobile clients **retry aggressively**—design APIs for that reality.

---

- [Learn more](https://lnkd.in/dQ94BgzQ)
## How do you discuss **scalability & performance** credibly as a mobile tech lead?

- Client-side: caching layers (memory/disk), image pipelines, DB indexes, pagination, background scheduling, startup profiling.
- Cross-team: CDN, edge caching, rate limits, backoff, gzip/br, binary payloads.
- **Example:** Feed scroll performance—prefetch window, diffutil, cancel stale requests, stabilize pagination cursors.

### Useful links

- [Caching:](https://lnkd.in/deMQvEJ9)  
- [Load balancing:](https://lnkd.in/dkeYMX74)  
- [Lazy loading:](https://lnkd.in/dvcdY_RX)  


> **Interview answer:** Show you can **partner with backend**—not blame it.

---

- [Learn more](https://lnkd.in/dvcdY_RX)
## Reliability, Data, and Operations

## Design **offline-first sync** for a notes app with multi-device edits.

- **Model:** CRDT vs last-write-wins vs server reconciliation; define conflict UX.
- **Transport:** incremental sync, etag/watermarks, push notifications to hint refresh.
- **Storage:** encrypted Room/SQLite; migrations; outbox pattern for pending writes.
- **Privacy:** encryption at rest, key in Keystore, secure network, audit logs.
- **Testing:** property tests for merge, integration tests for retry storms.


> **Interview answer:** State **conflict policy** explicitly—don’t hand-wave.

---

## How do you structure **error handling & logging** across mobile + backend?

- User-facing errors: actionable copy + non-sensitive codes.
- Internal: structured logs, breadcrumbs, remote logging with PII scrubbing.
- Post-mortems: timelines, blast radius, guardrails (feature flags).

### Useful links

- [Exception handling:](https://lnkd.in/dkUHDGBu)  
- [Logging strategies:](https://lnkd.in/dvikcadQ)  


> **Interview answer:** **PII discipline** is part of system design.

---

- [Learn more](https://lnkd.in/dvikcadQ)
## Concurrency on mobile—what do staff engineers emphasize?

- Main-thread discipline; structured concurrency; cancellation; backpressure for streams.
- Cross-process: binder thread limits, avoiding blocking IPC.

### Useful links

- [Thread safety:](https://lnkd.in/dNe6FpfS)  
- [Locks:](https://lnkd.in/dN2YdpvU)  
- [Atomic operations:](https://lnkd.in/dcfZF9Jb)  


> **Interview answer:** **Cancellation + backpressure** separate senior answers from junior ones.

---

- [Learn more](https://lnkd.in/dcfZF9Jb)
## **Database design** on device vs server—what changes?

- On-device: normalize vs denormalize for read patterns; migrations; FTS for search; page-size tuning.
- Server: ER modeling, normalization, sharding—not your day job, but you should understand consumption patterns.

### Useful links

- [ER diagrams:](https://lnkd.in/d6xygCrb)  
- [Normalization:](https://lnkd.in/dz7MCVaj)  
- [Relationships:](https://lnkd.in/da3YTaJN)  


> **Interview answer:** Optimize for **read latency** the UI actually needs.
- [Learn more](https://lnkd.in/da3YTaJN)
