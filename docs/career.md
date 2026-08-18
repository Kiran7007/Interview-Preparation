# Interview practice — master prompts (technical mock + meta)

Use this file for **self-introduction framing**, **copy-paste LLM prompts**, and **interview simulation rules**. Keep **verifiable facts** (company names, metrics, dates) accurate—replace placeholders below with **your** real resume bullets.

---

## Personal / intro cheat sheet (fill in, then speak aloud)

**One-liner (who you are):** _[e.g. Senior Android engineer focused on scalable apps, healthcare/fintech experience, Jetpack Compose.]_

**Current role (product + stack):** _[App domain, architecture (MVVM/MVI), modules, team size.]_

**Two concrete wins (problem → action → metric):**  
1. _[…]_  
2. _[…]_

**Deep area you want asked about:** _[e.g. BLE + GATT lifecycle, offline-first + Room, performance/crash work.]_

**Regulated / compliance exposure (if any):** _[e.g. HIPAA awareness, IEC 62304 familiarity, secure SDLC documentation.]_

---

## Single-string master prompt — FAANG depth + Android + Kotlin + lead + BLE + compliance

Copy everything between the lines into a new chat:

```
You are a FAANG-level Senior Staff Android Engineer and interviewer (Google/Meta/medical-device style) with 12–15 years shipping large, secure, performant mobile apps.

Interview me for a Senior/Lead Android role.

RULES:
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

## Topic-specific prompts (shorter)

**Android security + API security + local storage (deep Q&A sheet):**  
Ask the model to produce 8–12 Q&A pairs each on: Keystore, EncryptedSharedPreferences, secure token storage, pinning, ProGuard, secure logout, Room/SQLCipher, cache vs sensitive data.

**Battery + performance:**  
Doze, App Standby, WorkManager constraints, FGS when justified, profiling (Android Studio), frame budget, memory.

**Espresso / UI tests:**  
Synchronization model, IdlingResource, fake repository injection, CI emulators / Firebase Test Lab, flakiness causes.

**AEM / headless CMS:**  
Content API versioning, caching, fallback when CMS fails, separation of presentation vs content IDs.

**RiseBird / enterprise JD style:**  
Combine: MVVM, Espresso, Fastlane/flavors/signing, Firebase/Maps/Analytics SDK lifecycle, Retrofit error mapping, AEM, SDLC, tech lead scenarios.

**LPL-style (Compose-heavy):**  
Compose state hoisting, LazyColumn at scale, coroutine test of ViewModel + StateFlow, modularization.

---

## Behavioral / lead prompts (STAR)

Ask the LLM:

```
Give me 6 behavioral questions for a Senior Android Tech Lead. For each, I will answer in STAR format. Grade clarity and leadership signals, then suggest a stronger rewrite. Topics: production incident, disagreeing with PM, mentoring a struggling engineer, improving code review culture, technical debt negotiation, regulatory/documentation pressure.
```

---

## Resume review prompt (generic)

```
You are a hiring manager. Review the following resume text for a Senior Android role. List strengths, red flags, and 10 likely deep interview questions tied to the claims. Do not invent experience—only reference what I paste below.

PASTE RESUME TEXT HERE
```

---

## Related technical notes in this repo

All Android topics now live in **4 files** (merged from 11):

| File | Sections |
|------|----------|
| [Android notes](android.md) | Lifecycle, components, views, threading, intents, services, IPC, Dagger, DSA stubs |
| [Android notes](android.md) | MVVM / MVP / MVI / Clean / DI / Compose / SOLID + Unit / UI / Espresso / Compose testing |
| [Android notes](android.md) | Retrofit / OkHttp / APIs + Keystore / pinning / auth / encryption + Room / SharedPrefs / storage + BLE |
| [Android notes](android.md) | Performance / battery / profiling + Release / CI-CD / Fastlane + SDK integration + SDLC / leadership / behavioral |

Kotlin: [kotlin.md](kotlin.md) — language fundamentals, advanced Kotlin, coroutines, and Flow

## Dedup policy

**We do not duplicate** content across files. When studying a PDF or course, **map each heading** to the matching `.md` section and add **only** gaps—prefer extending an existing **Question / Answer** entry instead of creating a parallel document. Use the table above to find the right file.

**Note:** Pasted "Amazon STAR" / "PhonePe scenario" **numbers** in LLM drafts are **placeholders**—replace with **your** real metrics in interviews.
