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



---

## What is the difference between latency and throughput?

- **Latency** is the time required to perform one action or produce one result.
- **Throughput** is the number of actions or results completed per unit of time.
- A good system aims for the highest throughput that still provides acceptable latency for the user and the business operation.

They are related but not interchangeable. A service can process many requests per second while one request still waits too long, or it can answer one user quickly but collapse under concurrent load. For example, an image-processing pipeline may increase throughput by batching work, but batching can increase
the latency of an individual image. State the target for both metrics and make the trade-off explicit.

```text
Request arrives ──► wait/queue ──► work ──► response
        └────────────── latency ──────────────┘

throughput = completed requests / unit of time
```

---

## How should I use this distinction in a mobile system design answer?

For an interactive search or booking request, optimize perceived latency with timeouts, caching, parallel independent calls, pagination, and a useful
partial result. For background synchronization, higher throughput may be more important than the latency of one item; batching, queues, and backpressure can reduce total cost. Always include capacity, tail latency (such as p95/p99), load-shedding, and the user-visible fallback when a dependency is slow.

### Source

- [System Design Primer — Latency vs Throughput](https://github.com/donnemartin/system-design-primer#latency-vs-throughput)

---

## Design a flight-inventory search platform backed by metered suppliers

This is a useful Agoda-style platform/system-design scenario. Multiple suppliers expose flight inventory through their own metered APIs. Customers search by origin, destination, travel dates, and other filters. Prices, departure times, and seat availability can change frequently. Suppliers do not provide a push stream, so the platform must refresh data through paid API calls.

### Requirements and constraints

- Support roughly 10–20 suppliers with different API contracts and limits.
- Serve user searches with low interactive latency.
- Avoid calling every supplier synchronously for every user request because the supplier APIs are metered and may be slow or unavailable.
- Show the cheapest offer for the same flight when several suppliers return equivalent inventory.
- Keep price, schedule, and availability sufficiently fresh, and clearly communicate that flight inventory can change between search and booking.
- Respect supplier rate limits, authentication, quotas, and per-supplier failures.

### High-level design

```text
User app
   │ search
   ▼
API gateway → Search service → normalized inventory cache/read model
                                  ▲          ▲
                                  │          │
                       refresh workers   change stream/events
                                  │
                 supplier adapters / rate limiters
                    │       │        │
                Supplier A  B  ...  N (metered APIs)
```

1. **Supplier adapters:** Hide different authentication, request formats, response schemas, pagination, retries, and error codes behind one internal interface.
2. **Refresh scheduler:** Poll suppliers according to route popularity, freshness requirements, observed volatility, quota, and time to departure. Use jitter, bounded retries, circuit breakers, and per-supplier rate limiting.
3. **Normalizer and deduplicator:** Convert supplier responses into a canonical flight/offer model. Build a stable identity from fields such as carrier, flight number, departure airport/time, arrival airport/time, and itinerary legs. Keep each supplier offer so the cheapest valid offer can be selected.
4. **Inventory store/read model:** Store the latest normalized offer, source, observed time, expiry/freshness deadline, price, and availability. Index by origin, destination, date, and cabin. A cache can serve hot searches, while a durable store or search index provides recovery and broader queries.
5. **Search service:** Read the local view, filter and rank results, merge equivalent flights, and return freshness metadata. If data is stale, trigger an asynchronous refresh or selectively fetch the highest-value suppliers; do not make every user wait for all metered calls.
6. **Booking revalidation:** Before payment or ticketing, re-check the selected supplier because search data is only a snapshot. Use an idempotency key so retries cannot create duplicate bookings.

---

## How do you keep the data fresh without overspending on supplier calls?

Use a hybrid strategy: scheduled polling for popular routes and departure windows, refresh-on-demand for a cache miss or stale result, and a short-lived stale-while-revalidate response when product requirements permit it. Prioritize routes with high search volume or rapidly changing prices. Track supplier quota, last successful refresh, freshness age, and error rate. The API response should include `lastUpdated` or a freshness indicator so the client does not mistake a cached result for a guaranteed price.

---

## How do you handle failures and scale the platform?

Queue supplier refresh work so user traffic does not directly multiply paid calls. Partition workers by supplier or region, use horizontal scaling for the
search API, and isolate a failing supplier with a circuit breaker. Cache responses where the business rules allow it, coalesce identical in-flight queries, and apply request quotas per client. Monitor supplier latency, quota usage, refresh age, error rate, duplicate rate, cache hit rate, price changes,
search p95, booking revalidation failures, and stale-result rate.

---

### What are the main trade-offs?

- **Freshness vs cost:** More polling improves freshness but consumes paid quota and increases load.
- **Fan-out vs latency:** Calling suppliers in parallel can reduce latency but raises cost and makes the slowest supplier part of the critical path.
- **Cache vs correctness:** A cache improves speed but must expose staleness and be followed by booking-time revalidation.
- **Strong consistency vs availability:** Search can tolerate a slightly stale read model; the booking step needs stronger confirmation and idempotency.
- **One shared model vs supplier-specific fields:** Normalize common fields for search but retain raw/source-specific data for debugging and booking rules.

---

## Reliability, Data, and Operations

## Design **offline-first sync** for a notes app with multi-device edits.

- **Model:** CRDT vs last-write-wins vs server reconciliation; define conflict UX.
- **Transport:** incremental sync, etag/watermarks, push notifications to hint refresh.
- **Storage:** encrypted Room/SQLite; migrations; outbox pattern for pending writes.
- **Privacy:** encryption at rest, key in Keystore, secure network, audit logs.
- **Testing:** property tests for merge, integration tests for retry storms.



---

## How do you structure **error handling & logging** across mobile + backend?

- User-facing errors: actionable copy + non-sensitive codes.
- Internal: structured logs, breadcrumbs, remote logging with PII scrubbing.
- Post-mortems: timelines, blast radius, guardrails (feature flags).

### Useful links

- [Exception handling:](https://lnkd.in/dkUHDGBu)  
- [Logging strategies:](https://lnkd.in/dvikcadQ)  



---

- [Learn more](https://lnkd.in/dvikcadQ)
## Concurrency on mobile—what do staff engineers emphasize?

- Main-thread discipline; structured concurrency; cancellation; backpressure for streams.
- Cross-process: binder thread limits, avoiding blocking IPC.

### Useful links

- [Thread safety:](https://lnkd.in/dNe6FpfS)  
- [Locks:](https://lnkd.in/dN2YdpvU)  
- [Atomic operations:](https://lnkd.in/dcfZF9Jb)  



---

- [Learn more](https://lnkd.in/dcfZF9Jb)
## **Database design** on device vs server—what changes?

- On-device: normalize vs denormalize for read patterns; migrations; FTS for search; page-size tuning.
- Server: ER modeling, normalization, sharding—not your day job, but you should understand consumption patterns.

### Useful links

- [ER diagrams:](https://lnkd.in/d6xygCrb)  
- [Normalization:](https://lnkd.in/dz7MCVaj)  
- [Relationships:](https://lnkd.in/da3YTaJN)  


- [Learn more](https://lnkd.in/da3YTaJN)
