# Kotlin (Senior Android) — merged

Combined from `kotlin-basics.md`, `kotlin-advanced.md`, and `kotlin-coroutines-flow.md`.

---

# Kotlin Basics (Senior Android)

---

### Question

What are `@JvmStatic`, `@JvmOverloads`, and `@JvmField`—and when do they matter in a mixed Kotlin/Java codebase?

### Answer

- **In plain words:** Kotlin generates instance methods and accessors by default; Java callers sometimes need static facades, overload bridges, or direct field access for frameworks (e.g., DI, serialization glue, Android callbacks).
- **How it works:** `@JvmStatic` exposes static methods from `companion object`; `@JvmOverloads` generates overload stubs for default parameters; `@JvmField` exposes a field without accessors.
- **What to watch for:** `@JvmField` breaks encapsulation; `@JvmOverloads` can explode generated methods for large parameter lists; static interop can hide lifecycle context—prefer Kotlin-only modules when possible.
- **Example:** Dagger/annotation processors expecting Java static creators; legacy Java UI calling Kotlin utilities.

### Code example

```kotlin
@JvmField val profileId: String = "anon" // Java: instance.profileId

companion object {
    @JvmStatic
    fun from(id: String) = User(id)
}
```

### Useful links

- https://blog.mindorks.com/kotlin-android-interview-questions  
- https://www.ubuntupit.com/frequently-asked-kotlin-interview-questions-and-answers/  
- https://www.fullstack.cafe/blog/kotlin-interview-questions  

### Key takeaway

> Interop annotations are **ABI tools**, not style preferences.

---

### Question

What is **destructuring** in Kotlin and where is it unsafe?

### Answer

- **In plain words:** Destructuring maps component functions `componentN()` for data-like types, letting you unpack values in one step.
- **How it works:** Compiler expands `val (a,b) = x` into `component1/2` calls.
- **What to watch for:** Breaks silently if field order changes in non-data classes; avoid on wide tuples—name fields explicitly for stable APIs.
- **Example:** Unpacking network DTO pairs in UI state mappers.

### Code example

```kotlin
val (name, age) = employee
```

### Key takeaway

> Great for **local ergonomics**, risky for **cross-module contracts**.

---

### Question

`lateinit` vs `lazy`—when do you pick each on Android?

### Answer

- **lateinit:** `var` only; for injection or lifecycle init you don’t have at construction; must ensure assignment before use or catch `UninitializedPropertyAccessException`.
- **lazy:** `val` only; thread-safety modes (`SYNCHRONIZED`, `PUBLICATION`, `NONE`); good for expensive pure initialization.
- **What to watch for:** `lateinit` is not for primitives; `lazy` holds a lambda and can accidentally capture `Context` if written carelessly.
- **Example:** `lateinit` navigator/session; `lazy` for regex or parser used on first access.

### Key takeaway

> **Mutable post-construct** → `lateinit`; **expensive immutable** → `lazy`.

---

### Question

Difference between `==` and `===` in Kotlin?

### Answer

- **`==`:** Structural equality → compiles to `equals()` (nullable-safe).
- **`===`:** Referential equality (same object), with note that for many primitives you still reason about values but boxed identity can surprise you across platforms.
- **Example:** Compare UI state data classes with `==`; compare shared `Mutex` instance with `===` if ever needed.

### Key takeaway

> Default to **`==`** for business equality.

---

### Question

**Null-safety and type operators**—`?.`, `?:`, `!!`, smart cast, `as` / `as?`, and `::` (how do you use them safely on Android)?

### Answer

- **`?.` (safe call):** Runs the call only if the receiver is non-null; type becomes nullable result—default for **API/JSON** fields.
- **`?:` (Elvis):** Right-hand side when the left is **null**—use for **defaults** (`name ?: "Guest"`), not to hide bugs.
- **`!!` (not-null assertion):** Crashes with **NPE** if null—avoid in production UI; prefer **early return**, **`requireNotNull`**, or **sealed** error states.
- **`is` / smart cast:** After **`x is String`**, the compiler treats **`x`** as **`String`** in the right scope—cleaner than repeated casts.
- **`as`:** **Unsafe** cast—throws **`ClassCastException`** if wrong; use when you are **sure** (e.g. after **`is`** in another branch you should not need it).
- **`as?`:** **Safe** cast—wrong type yields **null**; pair with **`?:`** or **`?.`** for recovery.
- **`::` (callable reference):** **`::println`**, **`User::from`**—higher-order APIs, **reflection**-heavy paths need care on **R8** (keep rules).

**Android angle:** Nullable **Intent** extras, **ViewBinding** before init, and **Parcelable** edges are where **`?.`/`?:`** shine; **`!!`** is a **code-review red flag** unless immediately preceded by a **null check** the compiler cannot see.

### Code example

```kotlin
val len = name?.length ?: 0
val s = any as? String ?: return
items.forEach(::processItem)
```

### Key takeaway

> Prefer **`?.` / `as?` / smart casts**; treat **`!!`** as **last resort** with a comment why it is safe.

---

### Question

What is `forEach` in Kotlin and when should you avoid it?

### Answer

- **In plain words:** Higher-order iteration with inline contracts; readable for simple actions.
- **What to watch for:** Non-express `return` (unless labeled); can hide performance costs in hot paths vs indexed `for`.
- **Example:** Logging during debug; avoid in tight animation loops.

### Key takeaway

> Prefer **`for`** when you need **performance or control flow**.

---

### Question

What are **lambdas** and how do they relate to SAM conversion on Android?

### Answer

- **In plain words:** Lambdas are function values; Kotlin supports SAM conversion for Java single-abstract-method interfaces (listeners).
- **What to watch for:** Capturing lambdas retain references → memory leaks if they capture `Activity` views; use `WeakReference` patterns only as last resort—fix lifecycle instead.
- **Example:** `setOnClickListener { }` SAM to `View.OnClickListener`.

### Key takeaway

> Watch **capture lists** in UI listeners.

---

### Question

What is a **companion object** and how does it differ from Java `static`?

### Answer

- **In plain words:** A singleton object scoped to the class; can implement interfaces; Kotlin uses it instead of static blocks.
- **What to watch for:** Still an object—can hold state; misuse becomes hidden global state.
- **Example:** Factory methods + constants colocated with class.

### Useful links

- https://blog.mindorks.com/what-is-the-equivalent-of-java-static-methods-in-kotlin/  

### Key takeaway

> **Companion** ≈ namespace + singleton, not “free functions”.

---

### Question

What does the **`open`** keyword mean in Kotlin—and why is it the default opposite of Java?

### Answer

- **In plain words:** Kotlin classes/members are **final by default** for safe reasoning and performance; `open` opts into inheritance.
- **What to watch for:** Frameworks needing inheritance (some test doubles) require `open` or all-open plugins.
- **Example:** Base `UiModel` sealed/open only where extension is intentional.

### Useful links

- https://blog.mindorks.com/understanding-open-keyword-in-kotlin  

### Key takeaway

> **Design for composition**; use `open` deliberately.

---

### Question

Where do **bitwise and bit-shift** operations show up in Android engineering?

### Answer

- **In plain words:** Flags in `PendingIntent`, `Intent`, `MotionEvent`, `View` visibility/state, packed protobuf fields, image channel masks.
- **What to watch for:** Readability suffers—centralize flag math in named functions and tests.
- **Example:** Combining `PendingIntent` mutability flags correctly for Android 12+.

### Useful links

- https://www.programiz.com/kotlin-programming/bitwise  

### Key takeaway

> Isolate **flag math** behind well-named helpers.

---

### Question

Why are **Kotlin collection operators** (`map`, `filter`, `flatMap`) both loved and criticized?

### Answer

- **In plain words:** Expressive chain transforms; each step may allocate intermediate collections.
- **What to watch for:** Use sequences for large pipelines; choose `buildList` for imperative clarity.
- **Example:** Mapping DTO → domain in repository with `map` is fine; repeated mega-chains on hot paths → sequence.

### Useful links

- https://blog.mindorks.com/kotlin-collection-functions  
- [Map vs FlatMap (LinkedIn)](https://www.linkedin.com/feed/update/urn:li:activity:6770786744422998017/)  

### Key takeaway

> **Measure** hot paths; default to clarity in cold paths.

---

### Question

What is a Kotlin **`value class`** (`value class` / `@JvmInline`) and when do you use it on Android?

### Answer

- **In plain words:** A **value class** wraps one stored value (or a small fixed set in future Kotlin versions) but aims to give it a **distinct type** at compile time without always allocating a wrapper object on the JVM (`@JvmInline` = underlying value is used at runtime where possible).
- **How it works:** The compiler generates a **thin wrapper** with **no identity** semantics like a normal class; you get **type safety** (e.g. `UserId` vs `String`) and can add **methods** without paying for a full object in many cases.
- **What to watch for:** JVM rules: single **read-only** `val` backing property for `@JvmInline`; **no universal** “free” allocation guarantees in every ABI corner (reflection, generics, arrays can box). Not a replacement for **domain modeling** when you need **identity** or many fields.
- **Example:** `@JvmInline value class UserId(val raw: String)` in public APIs instead of passing bare strings.

### Useful links

- https://kotlinlang.org/docs/inline-classes.html  

### Key takeaway

> Use **value classes** for **cheap, typed wrappers**—know **JVM boxing** edges.


---

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


---

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
