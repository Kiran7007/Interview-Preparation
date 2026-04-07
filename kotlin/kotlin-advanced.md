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

**`inline`**, **`noinline`**, **`crossinline`**, and **`reified`**—what changes at compile time, and when do you use each?

### Answer

- **`inline`:** The compiler **copies** the function body (and usually each lambda parameter) into **call sites**. That cuts **FunctionN** allocations and call overhead for **higher-order** helpers—why **`forEach`**, **`let`**, **`measureTimeMillis`**, and much of **Compose** lean on it. Trade-off: **larger bytecode/DEX** if the body is big or called everywhere—keep `inline` APIs **small**.
- **`noinline`:** On a specific lambda parameter of an `inline` function, **do not** inline that lambda—needed when you **store** the lambda (field, list) or pass it to a **non-inline** API that needs a **real** function object.
- **`crossinline`:** Forbids **non-local `return`** from a lambda that might execute **later** (e.g. inside `Runnable { }` or another thread). Without it, `return` inside the lambda could **return from the enclosing function**; `crossinline` forces only **local** returns—common for **scheduling** / **callbacks**.
- **`reified`:** Only on **`inline`** functions: the **actual type** is known at each call site, so you can use **`T::class`**, **`is T`**, etc., where normal generics are **erased**. Typical pattern: JSON decode helper, `startActivity` extras, small DSLs—still mind **reflection** cost and **ProGuard** keep rules if you use `Class` names.

**Non-local return (interview trap):** Inside an `inline` lambda passed to an `inline` function, plain **`return`** returns from the **outer** function. That is powerful but surprising; **`crossinline`** blocks it when the lambda is not executed inline.

### Code example

```kotlin
inline fun <reified T> Gson.fromJsonReified(json: String): T =
    fromJson(json, T::class.java)

inline fun schedule(crossinline block: () -> Unit) {
    Handler(Looper.getMainLooper()).post { block() }
}

inline fun both(
    crossinline a: () -> Unit,
    noinline b: () -> Unit,
) {
    a()
    listOf(b).forEach { it() }
}
```

### Useful links

- https://kotlinlang.org/docs/inline-functions.html  

### Key takeaway

> **`inline`** cuts lambda overhead and unlocks **`reified`**; **`noinline`** keeps a real function value; **`crossinline`** blocks **non-local return** when the lambda escapes.
