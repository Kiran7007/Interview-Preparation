# Android SDLC, Leadership & Behavioral (Senior / Staff)

---

> **How to read this file**  
> Each **topic** is separated by a horizontal rule (`---`). Flow: **Question → Answer** → (optional **Code** / **Useful links**) → **Key takeaway** (in a blockquote).

---

### Question

Tips & curated resources for interview preparation

### Answer

- Use consistent DSA practice + system design drills + behavioral stories with metrics.
- **Links:**
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
- **STAR method reference:** https://www.testgorilla.com/blog/star-method-interviews/

### Key takeaway

> **STAR + metrics** beats adjective soup.

---

### Question (behavioral)

Describe a **performance troubleshooting** story on Android.

### Answer

- **Situation:** Large banking app sluggish + bloated binary.
- **Task:** Identify CPU/mem/network hotspots and reduce ship risk.
- **Action:** Android Studio profilers, flamegraphs, main-thread audits, caching, async boundaries, R8/shrinkResources, image pipeline tuning.
- **Result:** Quantify startup, jank frames, APK delta, crash-free rate.
### Key takeaway

> Interviewers want **methodology + numbers**.

---

### Question

**Error monitoring & logging** for post-mortems

### Answer

- Logcat structured logging, Crashlytics/non-fatals, breadcrumbs, remote config to toggle logging, PII scrubbing, on-call runbooks.

### Key takeaway

> **Actionable dashboards**, not log spam.

---

### Question

**API security** with sensitive data

### Answer

- TLS, pinning strategy, token lifecycle, least privilege scopes, encryption at rest, OWASP Mobile Top 10 awareness, regular key rotation, abuse detection.

### Key takeaway

> Security is **process + architecture**, not one library.

---

### Question

**Firebase integration** experience (Realtime DB, FCM, Analytics)

### Answer

- Discuss data modeling, indexing, security rules, notification segmentation, analytics event design, Crashlytics triage, Remote Config experimentation.

### Key takeaway

> Connect Firebase choices to **privacy + cost**.

---

### Question

Testing **MVP/MVVM/MVI** — strategy differences

### Answer

- Presenter interfaces, ViewModel output contracts, MVI pure reducers + snapshot tests.

### Key takeaway

> Architecture dictates **test doubles**.

---

### Question

**Tell me about yourself / hobbies / not on resume** (templates)

### Answer

- Keep professional spine (domains, tech, scale) + authentic human note; avoid rambling.

### Key takeaway

> **2 minutes**, structured.

---

### Question

**Production incident handling**

### Answer

- Communicate impact, mitigate, root cause, preventive controls, feature flags, postmortem blameless culture.

### Key takeaway

> Show **calm command** + **customer focus**.

---

### Question

**MVP/MVVM/MVI project examples** (banking/clinician/bus tracker narratives)

### Answer

- Original file repeats similar answer—merge into one story bank with **different metrics per domain**.

### Key takeaway

> Prepare **3 stories** spanning scale, conflict, and ambiguity.

---

### Question

**Data security in databases**

### Answer

- Encryption, integrity constraints, authenticated APIs, backups, least privilege.

### Key takeaway

> Defense in depth across **client + server**.

---

### Question

**Jetpack (Room, VM, LiveData)** usage story

### Answer

- Offline cache, migration safety, lifecycle-aware UI, reduced overfetch.

### Key takeaway

> Tie Jetpack to **business outcomes**.

---

### Question

**UI + unit testing strategy**

### Answer

- Pyramid, deterministic CI, screenshot goldens for UI, MockWebServer, TDD where ROI positive.

### Key takeaway

> Flake elimination is a **staff-level skill**.

---

### Question

**Code optimization / APK size** narrative (25% claim in source)

### Answer

- Use your own verified numbers; mention R8, resource shrink, dynamic delivery, profiling.

### Key takeaway

> Never fabricate **metrics you can’t defend**.

---

### Question

**Simple solution to complex problem**

### Answer

- Show how you reframed problem—query optimization + caching vs microservices rewrite.

### Key takeaway

> **Elegance** wins over buzzwords.

---

### Question

**Git collaboration & branching**

### Answer

- Trunk-based vs GitFlow, PR quality gates, CODEOWNERS, protected branches.

### Key takeaway

> Branch strategy serves **release cadence**.

---

### Question

**Dependency injection frameworks (Dagger/Koin)**

### Answer

- Compile-time safety vs simplicity; testing strategy; module boundaries.

### Key takeaway

> Pick DI for **graph complexity**, not fashion.

---

### Question

**Google Maps / geo** experience

### Answer

- Accuracy vs battery, geofencing reliability, privacy prompts, enterprise billing.

### Key takeaway

> Location is **policy + UX + tech**.

---

### Question

**Code optimization impact** (deep narrative)

### Answer

- Profilers, structural improvements, data structure choices, caching, measurement loops.

### Key takeaway

> Always close loop with **before/after**.

---

### Question

**Code reviews** example

### Answer

- Security review anecdote with constructive feedback + follow-up.

### Key takeaway

> Reviews teach **culture**.

---

### Question

**Roles & responsibilities**

### Answer

- Scope, leadership, cross-functional work, quality ownership.

### Key takeaway

> Align with **job ladder**.

---

### Question

**Backward compatible API changes**

### Answer

- Versioning, additive changes, contract tests, dual-read/dual-write patterns.

### Key takeaway

> Compatibility is **distributed systems** discipline.

---

### Question

**Challenging project** (maps + realtime)

### Answer

- Concurrency, consistency, offline, performance.

### Key takeaway

> Show **depth over breadth**.

---

### Question

**Design patterns in practice** (Singleton/Observer/Factory)

### Answer

- Justify with constraints; acknowledge singleton test issues.

### Key takeaway

> Patterns are **tools**, not tattoos.

---

### Question

**Difficult bug / intermittent crash**

### Answer

- Crashlytics breadcrumbs, repro harness, architectural fix vs patch.

### Key takeaway

> Intermittent == **missing instrumentation**.

---

### Question

**Staying current with API integration trends**

### Answer

- RFC reading, conferences, secure coding labs, internal guilds.

### Key takeaway

> Continuous learning is **scheduled**, not aspirational.

---

### Question

**Refactoring definition + legacy refactor story**

### Answer

- Risk reduction strategy, incremental steps, tests-first, stakeholder comms.

### Key takeaway

> Refactor needs **business sponsor**.

---

### Question

**CI/CD setup** (Gradle + GH Actions/Jenkins + Test Lab + Fastlane)

### Answer

- Caching, signing, tracks, automated UI, release notes.

### Key takeaway

> Pipeline mirrors **product quality**.

---

### Question

**Concurrent development in CI/CD**

### Answer

- Feature flags, small PRs, merge queues, integration branches.

### Key takeaway

> Reduce **integration pain** mechanically.

---

### Question

**Tools used for CI/CD**

### Answer

- Jenkins, Bitrise, CircleCI, Fastlane, Play Console, Firebase Test Lab, Espresso.

### Key takeaway

> Name **what you measured** with each tool.

---

### Question

**Code quality in CI/CD**

### Answer

- Lint, static analysis, coverage gates (carefully), formatting, CODEOWNERS.

### Key takeaway

> Gates should be **high-signal** to avoid bypass culture.
