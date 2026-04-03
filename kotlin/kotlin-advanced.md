# Kotlin Advanced (Senior Android)

> Focus: concurrency touchpoints, Flow/State hot-cold conceptual bridges, Compose remember APIs (cross-linked with architecture files).

---

### Question

Explain **`remember` vs `rememberSaveable`** in Compose at a staff-engineering level.

### Answer

- **remember:** Survives recomposition within the composition; lost on process death/configuration unless backed elsewhere.
- **rememberSaveable:** Persists small state via saved instance state mechanism—survives some configuration/process restarts with size limits.
- **Trade-offs:** Don’t stash large lists in saveable; use ViewModel + repository for real state.
- **Real-world example:** Text field scroll position vs selected tab index (saveable) vs fetched feed (ViewModel).

### Useful links

- https://outcomeschool.com/blog/remember-vs-remembersaveable  

### Key Takeaway

**Saveable for small UI chrome**, **ViewModel for truth**.

---

### Question

**Map vs flatMap**—give an Android example.

### Answer

- **map:** 1:1 transform (`List<UserDto>` → `List<User>`).
- **flatMap:** 1:many flatten (`List<Order>` → all `LineItem`s).
- **Real-world example:** Flatten nested pagination envelopes into a single `Flow<List<Item>>` pipeline.

### Useful links

- https://www.linkedin.com/feed/update/urn:li:activity:6770786744422998017/  

### Key Takeaway

If inner collections exist, think **flatMap**.

---

### Question

**StateFlow vs SharedFlow**—when do you expose which from a ViewModel?

### Answer

- **StateFlow:** Hot, always has a value, conflates rapid updates—great for UI state snapshots.
- **SharedFlow:** Hot, no single value by default, configurable replay/extraBuffer—great for one-shot events *if* you accept buffering discipline.
- **Trade-offs:** `SharedFlow` “events” are easy to mishandle (dropped/collected twice); many teams model events as state + `Channel`/`callbackFlow` patterns instead.
- **Real-world example:** `StateFlow<UiState>` + `SharedFlow<SnackbarMessage>` with replay=0 and careful collection in `LaunchedEffect`.

### Useful links

- https://outcomeschool.com/blog/stateflow-and-sharedflow  

### Key Takeaway

**StateFlow for render truth**; be careful with “event” streams.

---

### Question

**Cold Flow vs hot Flow**—how do you explain this to a junior?

### Answer

- **Cold:** `flow { }` runs per collector; safe for per-UI subscriptions if scoped.
- **Hot:** `SharedFlow/StateFlow` emits independent of individual collectors (subject-like).
- **Real-world example:** Cold for DB queries per screen; hot for global session ticker (rare).

### Useful links

- https://outcomeschool.com/blog/cold-flow-vs-hot-flow  

### Key Takeaway

Cold = **per collector producer**; hot = **broadcast**.

---

### Question

**Thread-safe methods and blocks** in Kotlin/Java interop on Android?

### Answer

- Synchronized methods/blocks, `Atomic*`, `ConcurrentHashMap`, structured coroutines with single-thread dispatchers for domain state.
- **Real-world example:** Guard cache map updates in repository with `Mutex` in coroutines instead of scattered `synchronized`.

### Useful links

- https://proandroiddev.com/synchronization-and-thread-safety-techniques-in-java-and-kotlin-f63506370e6d  

### Key Takeaway

Prefer **one owner thread** + message passing over scattered locks.
