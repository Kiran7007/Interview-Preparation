# Android SDLC, Leadership & Behavioral (Senior / Staff)

---

### Question

Tips & curated resources for interview preparation

### Answer

Mix **consistent DSA practice**, **system design** drills, and **behavioral** stories with **real numbers** (latency saved, crash rate, team size). Use the links below as **starting points**, not a checklist to cram in one night.

### Useful links

- https://www.linkedin.com/feed/update/urn:li:activity:7256556738038882304/
- https://www.linkedin.com/feed/update/urn:li:activity:7246844257766981632/
- https://www.linkedin.com/feed/update/urn:li:activity:7221106724919738369/
- https://www.linkedin.com/feed/update/urn:li:activity:7220663449440161793/
- https://www.linkedin.com/feed/update/urn:li:activity:7219036304691388418/
- https://www.linkedin.com/feed/update/urn:li:activity:7217827106083266560/
- https://www.linkedin.com/feed/update/urn:li:activity:7213379334311448576/
- https://www.linkedin.com/feed/update/urn:li:activity:7194272210679705600/
- https://www.linkedin.com/feed/update/urn:li:activity:7177985319269502977/
- https://blog.sp3.in/dsa
- STAR method: https://www.testgorilla.com/blog/star-method-interviews/

### Key takeaway

> **STAR + metrics** beat a list of adjectives about how “passionate” you are.

---

### Question (behavioral)

Describe a **performance troubleshooting** story on Android.

### Answer

Use **STAR**: **Situation** (slow app, big APK, bad reviews). **Task** (find hotspots without guessing). **Action** (Android Studio CPU/memory/network profilers, main-thread audit, caching, async boundaries, R8/shrinkResources, image pipeline). **Result** (startup ms, jank frames, APK size, crash-free rate—**real numbers**).

### Key takeaway

> Interviewers want **how you thought** and **what improved**, with **numbers**.

---

### Question

**Error monitoring & logging** for post-mortems

### Answer

Use **structured logs** where they help, **Crashlytics** (or similar) for crashes and **non-fatals**, **breadcrumbs** around risky flows, **remote flags** to tune logging, and **PII scrubbing**. Dashboards should answer **“what broke for whom?”** not dump noise.

### Key takeaway

> Logs and dashboards should drive **action**, not scroll fatigue.

---

### Question

**API security** with sensitive data

### Answer

Cover **TLS**, **pinning** if needed, **token lifecycle**, **least privilege** scopes, **encryption at rest** on device, **OWASP Mobile** awareness, **key rotation**, and **abuse detection** on the server.

### Key takeaway

> Security is **process + design**, not one library you drop in once.

---

### Question

**Firebase integration** experience (Realtime DB, FCM, Analytics)

### Answer

Be ready to talk about **data modeling**, **indexes**, **security rules**, **notification** segments, **analytics** event design, **Crashlytics** triage, and **Remote Config** experiments—and how each choice affects **privacy** and **cost**.

### Key takeaway

> Tie Firebase decisions to **privacy, cost, and reliability**, not “we use Firebase.”

---

### Question

Testing **MVP/MVVM/MVI** — strategy differences

### Answer

**MVP:** test the **presenter** with a fake **view**. **MVVM:** test **ViewModel outputs** and fakes for repos. **MVI:** test **pure reducers** and **snapshots** of state where it helps.

### Key takeaway

> Your architecture picks **what you mock** and **what you assert**.

---

### Question

**Tell me about yourself / hobbies / not on resume** (templates)

### Answer

Keep a **tight spine**: domains, tech, scale, impact. Add **one human detail** if asked—avoid **rambling** or unrelated life story unless they invite it.

### Key takeaway

> Aim for about **two minutes**, clear structure.

---

### Question

**Production incident handling**

### Answer

Show **calm steps**: assess **user impact**, **mitigate** fast, **communicate**, then **root cause** and **prevention** (flags, tests, runbooks). **Blameless** postmortems build trust.

### Key takeaway

> They want **customer focus** and **clear communication**, not panic.

---

### Question

**MVP/MVVM/MVI project examples** (banking/clinician/bus tracker narratives)

### Answer

Prepare **a few real projects** with **different metrics** (latency, MAU, compliance, offline). Avoid repeating the **same story** with different buzzwords.

### Key takeaway

> Have **three solid stories**: scale, conflict, ambiguity.

---

### Question

**Data security in databases**

### Answer

Discuss **encryption**, **integrity**, **authenticated APIs**, **backup** protection, and **least privilege** access—on **client and server**.

### Key takeaway

> Defense in depth across **device + backend**.

---

### Question

**Jetpack (Room, VM, LiveData)** usage story

### Answer

Connect Jetpack to **outcomes**: offline cache, **safe migrations**, **lifecycle-aware** UI, fewer **over-fetch** bugs.

### Key takeaway

> Frame Jetpack as **business value**, not a feature list.

---

### Question

**UI + unit testing strategy**

### Answer

**Pyramid** shape, **deterministic CI**, **screenshots** for a small golden UI set, **MockWebServer** for APIs, **TDD** where it pays back.

### Key takeaway

> **Killing flakes** is a senior skill—not “rerun until green.”

---

### Question

**Code optimization / APK size** narrative (25% claim in source)

### Answer

Use **numbers you can defend**. Mention **R8**, **resource shrink**, **dynamic delivery**, and **profiling**—never invent **25%** without a real measurement.

### Key takeaway

> Do not quote **metrics** you cannot explain under follow-up questions.

---

### Question

**Simple solution to complex problem**

### Answer

Tell a story where you **reframed** the problem—e.g. **query + cache** instead of a **big rewrite**—and **measured** the win.

### Key takeaway

> **Simple** beats **clever** when it meets the requirement.

---

### Question

**Git collaboration & branching**

### Answer

Compare **trunk-based** vs **GitFlow** honestly; mention **PR** quality gates, **CODEOWNERS**, **protected** branches.

### Key takeaway

> Branching should match **release cadence** and **team size**.

---

### Question

**Dependency injection frameworks (Dagger/Koin)**

### Answer

**Dagger/Hilt:** compile-time graph, catches errors early. **Koin:** runtime, lighter setup. Pick for **graph size**, **build time**, and **test** needs—not fashion.

### Key takeaway

> Choose DI for **complexity you actually have**.

---

### Question

**Google Maps / geo** experience

### Answer

Balance **accuracy vs battery**, handle **geofence** imperfection, clear **privacy** prompts, and **enterprise** billing/API limits.

### Key takeaway

> Location is **policy + UX + engineering** together.

---

### Question

**Code optimization impact** (deep narrative)

### Answer

Walk through **profilers**, **structural** fixes, **data structures**, **caching**, and how you **measured before/after**.

### Key takeaway

> Always close with **before/after** evidence.

---

### Question

**Code reviews** example

### Answer

Share a review where you caught a **security** or **correctness** issue **constructively** and followed up after merge.

### Key takeaway

> Reviews shape **team culture**, not only code.

---

### Question

**Roles & responsibilities**

### Answer

Align your story with **scope**, **leadership**, **cross-functional** work, and **quality ownership** at your level.

### Key takeaway

> Match examples to the **job level** you are interviewing for.

---

### Question

**Backward compatible API changes**

### Answer

Prefer **additive** changes, **versioning**, **contract tests**, and patterns like **dual read/write** during migrations.

### Key takeaway

> Compatibility is **distributed systems** discipline, even for mobile clients.

---

### Question

**Challenging project** (maps + realtime)

### Answer

Highlight **concurrency**, **consistency**, **offline**, and **performance** trade-offs you navigated.

### Key takeaway

> Depth on **one** hard problem beats ten shallow ones.

---

### Question

**Design patterns in practice** (Singleton/Observer/Factory)

### Answer

Name patterns you **actually used** and **why**—including **downsides** (singletons and tests, overuse of observers).

### Key takeaway

> Patterns are **tools**, not tattoos.

---

### Question

**Difficult bug / intermittent crash**

### Answer

**Crashlytics** breadcrumbs, **repro** harness, **fix root cause** vs papering over with retries only.

### Key takeaway

> Intermittent bugs usually mean **missing signals**—add instrumentation.

---

### Question

**Staying current with API integration trends**

### Answer

**RFCs**, **conferences**, **secure coding** practice, **internal guilds**—learning should be **scheduled**, not vague “I read sometimes.”

### Key takeaway

> Show **habits**, not a one-time course list.

---

### Question

**Refactoring definition + legacy refactor story**

### Answer

Refactoring changes **structure** without changing **behavior**—done in **small steps** with **tests** and **stakeholder** communication.

### Key takeaway

> Big refactors need a **business sponsor** and a **plan**.

---

### Question

**CI/CD setup** (Gradle + GH Actions/Jenkins + Test Lab + Fastlane)

### Answer

Cover **caching**, **signing**, **tracks**, **automated UI**, **release notes**—tie each piece to **quality** or **speed**.

### Key takeaway

> Pipeline design should mirror **product quality goals**.

---

### Question

**Concurrent development in CI/CD**

### Answer

**Feature flags**, **small PRs**, **merge queues**, **integration** branches when needed—reduce **big-bang** merges.

### Key takeaway

> Reduce **integration pain** with mechanics, not heroics.

---

### Question

**Tools used for CI/CD**

### Answer

Name tools you **actually used** and **what you measured** with each (build time, flake rate, rollout time).

### Key takeaway

> Tools without **metrics** are just names on a slide.

---

### Question

**Code quality in CI/CD**

### Answer

**Lint**, **static analysis**, **coverage** gates (use carefully), **formatting**, **CODEOWNERS**—gates must stay **high signal** or people bypass them.

### Key takeaway

> Noisy gates create a **culture of overrides**.
