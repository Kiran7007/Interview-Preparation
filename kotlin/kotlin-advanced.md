# Kotlin Advanced (Senior Android)

---

### Question

Explain **`remember` vs `rememberSaveable`** in Compose at a staff-engineering level.

### Answer

- **remember:** Survives recomposition within the composition; lost on process death/configuration unless backed elsewhere.
- **rememberSaveable:** Persists small state via saved instance state mechanism—survives some configuration/process restarts with size limits.
- **What to watch for:** Don’t stash large lists in saveable; use ViewModel + repository for real state.
- **Example:** Text field scroll position vs selected tab index (saveable) vs fetched feed (ViewModel).

### Useful links

- https://outcomeschool.com/blog/remember-vs-remembersaveable  

### Key takeaway

> **Saveable for small UI chrome**, **ViewModel for truth**.

---

### Question

**Map vs flatMap**—give an Android example.

### Answer

- **map:** 1:1 transform (`List<UserDto>` → `List<User>`).
- **flatMap:** 1:many flatten (`List<Order>` → all `LineItem`s).
- **Example:** Flatten nested pagination envelopes into a single `Flow<List<Item>>` pipeline.

### Useful links

- https://www.linkedin.com/feed/update/urn:li:activity:6770786744422998017/  

### Key takeaway

> If inner collections exist, think **flatMap**.

---

### Question

**StateFlow vs SharedFlow**—when do you expose which from a ViewModel?

### Answer

- **StateFlow:** Hot, always has a value, conflates rapid updates—great for UI state snapshots.
- **SharedFlow:** Hot, no single value by default, configurable replay/extraBuffer—great for one-shot events *if* you accept buffering discipline.
- **What to watch for:** `SharedFlow` “events” are easy to mishandle (dropped/collected twice); many teams model events as state + `Channel`/`callbackFlow` patterns instead.
- **Example:** `StateFlow<UiState>` + `SharedFlow<SnackbarMessage>` with replay=0 and careful collection in `LaunchedEffect`.

### Useful links

- https://outcomeschool.com/blog/stateflow-and-sharedflow  

### Key takeaway

> **StateFlow for render truth**; be careful with “event” streams.

---

### Question

**Cold Flow vs hot Flow**—how do you explain this to a junior?

### Answer

- **Cold:** `flow { }` runs per collector; safe for per-UI subscriptions if scoped.
- **Hot:** `SharedFlow/StateFlow` emits independent of individual collectors (subject-like).
- **Example:** Cold for DB queries per screen; hot for global session ticker (rare).

### Useful links

- https://outcomeschool.com/blog/cold-flow-vs-hot-flow  

### Key takeaway

> Cold = **per collector producer**; hot = **broadcast**.

---

### Question

**Thread-safe methods and blocks** in Kotlin/Java interop on Android?

### Answer

- Synchronized methods/blocks, `Atomic*`, `ConcurrentHashMap`, structured coroutines with single-thread dispatchers for domain state.
- **Example:** Guard cache map updates in repository with `Mutex` in coroutines instead of scattered `synchronized`.

### Useful links

- https://proandroiddev.com/synchronization-and-thread-safety-techniques-in-java-and-kotlin-f63506370e6d  

### Key takeaway

> Prefer **one owner thread** + message passing over scattered locks.

---

### Question

How do **`inline`** functions help with **higher-order functions** in terms of **memory** and **performance**?

### Answer

- **In plain words:** When you pass a **lambda** to a normal function, Kotlin often allocates a **Function object** (and may capture variables in a **closure**). **`inline`** copies the function **body** into call sites so many of those allocations and **virtual calls** disappear.
- **How it works:** The compiler **inlines** both the `inline` function and typically the **lambda** body at compile time (unless marked `noinline`). **`reified`** type parameters are only possible with **`inline`** because there is no erased call-site class.
- **What to watch for:** **`inline`** **increases bytecode size** if used on large functions or very hot **many-call-site** APIs; use on **small** utilities (`let`, `use`, `measureTimeMillis` pattern). Don’t `inline` everything “because performance.”
- **Example:** `inline fun <T> T.applyIf(condition: Boolean, block: T.() -> Unit): T` on hot UI paths vs non-inline equivalent allocating `Function1` each time.

### Useful links

- https://kotlinlang.org/docs/inline-functions.html  

### Key takeaway

> **`inline` + lambdas** avoids **Function allocations** and enables **`reified`**—pay attention to **DEX size**.
