# Career

---

## Tell me about yourself

Use a 60-90 second structure:

> "I'm an Android engineer with around 9 years of experience building mobile applications, primarily with Kotlin, Android, and Jetpack Compose. I've worked across domains including healthcare, fintech, and banking, and I've owned features from architecture and implementation through testing, CI/CD, and production support.
>
> My strongest areas are Kotlin, Coroutines/Flow, Compose, scalable architecture, and engineering quality. More recently I've also worked on automation and AI-assisted developer tooling, including an Android UI testing agent that searches a project and generates Compose UI tests.
>
> At this stage I'm looking for a role where I can combine hands-on Android development with technical leadership, architecture, mentoring, and improving engineering practices at scale."

---

## Tell me about a technical collaboration that solved a production problem

In a banking project, we had unreliable synchronization between the backend and local database when devices went offline and later reconnected.

- I investigated logs and reproduced the issue under different network conditions.
- I worked with the Android and backend teams to review the API, caching, and synchronization behavior.
- We introduced a more reliable offline-first approach using Room, Flow, and controlled synchronization.
- I added tests for offline mode, retries, and conflict scenarios.

As a result, synchronization became more reliable, unnecessary API calls decreased, and the edge cases were less likely to regress.

---

## Tell me about a time when you faced ambiguity in a project

While working on an AI-based Android test-automation agent, the requirement was broad: generate automation scripts from natural-language test steps, without clearly defining how UI elements should be identified or how accuracy would be measured.

- I worked with the QA team to understand the existing manual process and identify the main pain points.
- I broke the problem into input parsing, UI-element identification, script generation, and validation.
- I evaluated real application locators and Compose semantics against representative test cases.
- I helped define measurable accuracy criteria and a smaller prototype scope.

The outcome was a working prototype, a clearer scope, and objective criteria for deciding which areas needed further improvement.

---

## Questions You Should Ask the VP

Ask 2-3, not all.

### Technical
- "What are the biggest technical challenges the Android team is currently solving?"
- "How is the Android codebase structured across feature and shared modules?"
- "How much of the application is Compose versus XML, and what is the migration strategy?"

### Leadership
- "What does strong performance look like for an SE III in the first six months?"
- "How much ownership does an SE III have over architecture and technical decisions?"
- "How do engineers participate in technical strategy across teams?"

### Engineering quality
- "What are the team's biggest stability or performance challenges today?"
- "How do you measure engineering quality and delivery effectiveness?"

### AI
- "How is the organization using approved AI tools in the mobile engineering workflow, and what validation standards are expected?"

---

## Interview Prompts

```
1) Ask ONLY ONE technical question at a time. Wait for my answer.
2) After each answer: (a) evaluate correctness, (b) list mistakes/gaps, (c) rewrite my answer to senior/staff quality, (d) rate 0–10 with brief rubric, (e) ask 2–3 follow-ups that go deeper.
3) Increase difficulty over time: basic Kotlin → Android internals → architecture/system design → performance/security → BLE/IoT → testing/CI → leadership/SDLC/regulatory.
4) Push on trade-offs, failure modes, production debugging, and real metrics. Reject vague answers.

COVERAGE (rotate across the interview):
- Kotlin: val/var + reference vs object mutability, data class + shallow copy, sealed class vs sealed interface, inline/crossinline/noinline, suspend + continuation, structured concurrency, launch vs async exceptions, SupervisorJob, dispatchers, Flow vs StateFlow vs SharedFlow, stateIn/WhileSubscribed.
- Android: lifecycle, process death, ANR, memory leaks (LeakCanary), Context misuse, WorkManager vs FGS vs AlarmManager, background limits, Doze.
- Architecture: Clean Architecture, MVVM vs MVI, repository, offline-first + SSOT, modularization, DI.
- SOLID: examples from Android code, violations and fixes.
- Performance: cold/warm start, jank, Compose recomposition (remember, derivedStateOf, keys, stability), list performance.
- Security: Keystore, EncryptedSharedPreferences, Room encryption, TLS, pinning trade-offs, secure logout, SDK supply chain.
- Networking: Retrofit + OkHttp, Interceptor vs Authenticator, 401 refresh single-flight, infinite retry prevention, caching headers.
- BLE: scan/connect permissions 12+, GATT 133, MTU, CCCD + notifications vs indications, sequential GATT queue, multi-device, background/FGS, bonding vs pairing, throughput/OTA pitfalls.
- Testing: JVM unit tests, coroutine test dispatchers, ViewModel testing, Espresso + IdlingResource, flaky tests (animations off), mock/fake repos.
- CI/CD: Gradle flavors, signing, Jenkins/GitHub Actions, quality gates.
- Leadership: code review, mentoring, incident response, crash spikes, cross-team communication, technical debt.
- SDLC/Agile: Scrum, milestones, documentation, risk/assessment, continuous improvement.
- Regulatory (if relevant): design controls, traceability, risk management, IEC 62304 vocabulary at least at "familiar" level.

START with: "Explain the difference between val and var in Kotlin, then go deeper: reference immutability vs object mutability and thread-safety implications in Android."

Optional second arc: "Design a healthcare app that collects real-time data over BLE and syncs to a backend—then stress-test threading, offline storage, security, and failure handling."
```

---
