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
