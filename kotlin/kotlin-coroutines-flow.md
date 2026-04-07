# Kotlin Coroutines & Flow (Senior Android)

---

### Question

What is a **`CoroutineScope`** and how should Android apps structure scopes?

### Answer

- **In plain words:** A scope ties coroutines to a lifecycle boundary via a `Job` + context; cancellation cascades to children.
- **How it works:** `SupervisorJob` vs plain `Job` changes failure propagation—supervisor avoids one child cancelling siblings.
- **What to watch for:** Global `CoroutineScope(Dispatchers.IO)` is an anti-pattern for feature work; prefer `viewModelScope`, `lifecycleScope`, or explicit scopes in use cases.
- **Example:** `viewModelScope` for network tied to VM; `lifecycleScope` for UI effects that must stop when UI disappears.

### Key takeaway

> **Scope = ownership**; match it to lifecycle or use-case boundary.

---

### Question

What is **`Flow`** and how does it relate to coroutines?

### Answer

- **In plain words:** Async stream type built on suspension; supports operators similar to reactive streams with structured concurrency.
- **How it works:** Collectors drive cold flows; hot flows use `SharedFlow`/`StateFlow`.
- **What to watch for:** Backpressure differs from Rx; combine `flowOn`, `catch`, `retryWhen` carefully to avoid hiding failures.
- **Example:** Expose `Flow<PagingData<Item>>` from repository; collect in UI with lifecycle repeat-on-lifecycle.

### Key takeaway

> **Flow for streams**, **`suspend` for single-shot**.

---

### Question

**CoroutineContext vs CoroutineScope**—what’s the difference?

### Answer

- **Context:** Set of elements: `Job`, `Dispatcher`, exception handler, user-defined keys.
- **Scope:** Carrier of a job + context used to launch children.
- **Example:** `withContext(Dispatchers.IO)` switches dispatcher for a block without leaking scope.

### Key takeaway

> **Scope launches; context configures**.

---

### Question

What is a **`suspend` function**—what can and can’t you do?

### Answer

- **In plain words:** A function that may suspend without blocking a thread; continuation-based.
- **What to watch for:** Don’t call blocking APIs without `withContext`; don’t perform heavy work on `Main`.
- **Example:** Retrofit suspend endpoints + repository mapping.

### Useful links

- https://medium.com/mobile-app-development-publication/understanding-suspend-function-of-coroutines-de26b070c5ed  

### Key takeaway

> **Suspend ≠ background thread automatically**.

---

### Question

What is **`runBlocking`**—why is it disliked in Android app code?

### Answer

- **In plain words:** Blocks the calling thread to wait for coroutines inside—useful in tests/main-safe CLI, disastrous on UI thread.
- **What to watch for:** Can cause ANRs; prefer structured tests with `runTest`.
- **Example:** OK in `@Test`, not OK in `Activity.onCreate`.

### Useful links

- https://www.geeksforgeeks.org/runblocking-in-kotlin-coroutines-with-example  

### Key takeaway

> **Tests/debug only** (almost always).

---

### Question (FAANG-level)

How do you handle **cancellation** and **structured concurrency** in a multi-layer app?

### Answer

- Propagate cancellation from UI → ViewModel → repository; use `NonCancellable` only for critical flush operations.
- Never `async` without a parent scope tied to work ownership.
- **Example:** User navigates away → cancel image decode + network; still persist draft with `withContext(NonCancellable)` if product demands it.

### Key takeaway

> **Default cooperative cancellation**; exceptions to policy must be explicit.

---

### Question

How does a coroutine **switch threads** (e.g. from Main to IO and back)?

### Answer

- **In plain words:** The runtime **suspends** your function, stores progress in a **continuation**, and **schedules** the next segment on another **dispatcher**’s thread pool (or the main looper). No magic “moving” of stack—**resume** runs on the new thread.
- **How it works:** `withContext(Dispatchers.IO) { ... }` **dispatches** the block; when done, it **resumes** the caller on the **original** context (unless you chain more `withContext`). `launch(Main) { … }` posts work to the **main** handler.
- **What to watch for:** **Suspend** does not imply a background thread—only **`withContext` / flow operators / custom dispatchers** move work. Blocking calls on **Main** still cause **ANRs**.
- **Example:** Repository `withContext(Dispatchers.IO)` around disk/HTTP; UI updates on **Main**.

### Key takeaway

> Thread switches are **explicit dispatch + resume**, not “the coroutine travels with a thread.”

---

### Question

`coroutineScope { val d = async { … throw … }; d.await() }` **without** `try/catch` around `await()`—will the app **crash** if `async` throws?

### Answer

- **In plain words:** The exception is **stored** in the **`Deferred`**. Calling **`await()` rethrows** it. If nothing catches it, it behaves like an **uncaught exception in that coroutine context**—often propagated to the **parent `Job`** and your **`CoroutineExceptionHandler`** (if any), or can surface as a **crash** on Android if you launched on **GlobalScope** / wrong scope without a handler.
- **How it works:** Under **`coroutineScope`**, a failed child typically **fails the scope** after you observe the failure (e.g. at `await()`). **`supervisorScope`** changes propagation—siblings keep running; you handle failures **per child**.
- **What to watch for:** **`async` + forgotten `await`**: `coroutineScope` still **waits for children**; an **unhandled** failed `async` can still **complete the scope exceptionally** when the child finishes. Don’t fire-and-forget **`async`** unless you **handle** the `Deferred`.
- **Example:** Wrap **`await()`** in **`try/catch`**, or use **`runCatching { d.await() }`**, or **`supervisorScope` + individual** handling.

### Code example

```kotlin
coroutineScope {
    val d = async { error("boom") }
    d.await() // throws; if uncaught, fails scope
}
```

### Key takeaway

> **`await()` propagates failure**—use **`try/catch`**, **`Result`**, **`supervisorScope`**, or a **CoroutineExceptionHandler** by design.

---

### Question

Why are coroutines considered **lightweight** compared to OS threads?

### Answer

- **In plain words:** A thread **always** consumes a large **stack** (≈ MB class) and kernel bookkeeping. Many coroutines **time-share** a small pool of threads; when one **suspends**, the thread does other work.
- **How it works:** Suspend points compile to a **state machine**; **thousands** of concurrent **logical** tasks can map to **few** threads without blocking them on I/O.
- **What to watch for:** **Lightweight ≠ free**—massive fan-out still costs **memory** (continuations, channels) and **CPU**; **blocking** APIs negate the benefit unless moved to a **blocking** dispatcher with limits.
- **Example:** 5k concurrent **network** waits on **few IO** threads vs 5k **platform threads** (usually impractical).

### Key takeaway

> Coroutines are cheap because they **multiplex many tasks onto few threads** via **suspension**.

---

### Question

Do coroutines live on the **heap** or the **stack**?

### Answer

- **In plain words:** The **continuation** objects (state machine instances, closures) live on the **heap**, like other objects. The **thread** that runs your code still uses its normal **call stack** for the **current** activation frames while executing.
- **How it works:** After **suspend**, locals are stored in the **continuation** on the heap; **resume** reconstructs execution on **whichever** thread the dispatcher uses.
- **What to watch for:** Interview trick: “coroutine has no stack of its own”—**logical** stack is **continuation chain** on heap; **physical** stack is the **worker thread’s**.
- **Example:** Deep **recursive** suspend without **tail** transformation can still **deepen** logical state—prefer **iteration** or **trampolining** for huge depth.

### Key takeaway

> **Heap** holds **continuation/state**; **threads** still use a **real stack** while running.

---

### Question

**Structured concurrency** in Kotlin vs **`ConcurrentHashMap`**—what problem does each solve?

### Answer

- **In plain words:** **Structured concurrency** ties child coroutines to a **parent scope** so **cancellation** and **errors** propagate predictably (no stray background work). **`ConcurrentHashMap`** is a **thread-safe** hash map for **concurrent reads/writes** without locking the **whole** table like `Collections.synchronizedMap` often does.
- **How it works:** Scopes (`coroutineScope`, `supervisorScope`, `viewModelScope`) own **Jobs**; **`ConcurrentHashMap`** uses **striped / node-level** CAS and careful publication rules (JDK version–specific details).
- **What to watch for:** Don’t confuse them—**concurrency structure** vs **shared mutable map**. In coroutine code, still prefer **single-threaded** contexts or **`Mutex`** for complex invariants; **`ConcurrentHashMap`** doesn’t fix **check-then-act** races across keys without **atomic** compound ops.
- **Example:** **ViewModel** scope cancels repo work on clear; **cache** map keyed by id with **`ConcurrentHashMap`** for thread-safe **get/put** from multiple threads.

### Key takeaway

> **Structured concurrency** manages **task lifetime**; **`ConcurrentHashMap`** manages **safe concurrent map access**—orthogonal tools.
