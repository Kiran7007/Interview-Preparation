# 1. Basic Questions

## What are Kotlin coroutine builder functions?

- Common coroutine builders/concurrency primitives include `launch`, `async`, `runBlocking`, `coroutineScope` and `supervisorScope`.
- `launch` returns `Job` and is used when no result is required.
- `async` returns `Deferred<T>` and is used when a result is required, especially for concurrent work.
- `runBlocking` blocks the current thread and is mainly appropriate at synchronous boundaries or tests, not Android UI code.
- `coroutineScope` creates a structured child scope where failure normally cancels siblings.
- `supervisorScope` isolates child failures so one child failing does not automatically cancel siblings.

```kotlin
viewModelScope.launch {
    val user = async { repository.getUser() }
    val orders = async { repository.getOrders() }

    val result = user.await() to orders.await()
}
```

## What is structured concurrency?

- Child coroutines have a clear parent and lifetime.
- The parent owns the children.
- Cancellation propagates predictably.
- A parent normally does not complete while its children are still active.
- It prevents work from escaping its lifecycle.

```kotlin
viewModelScope.launch {
    coroutineScope {
        launch { loadUser() }
        launch { loadOrders() }
    }
}
```

## `coroutineScope` vs `supervisorScope`

| `coroutineScope` | `supervisorScope` |
|---|---|
| Child failure normally cancels scope/siblings | Child failure does not automatically cancel siblings |
| Good when operations are interdependent | Good when operations are independent |
| Failure is propagated | Failures can be handled independently |

## What is the XML/View equivalent of `LaunchedEffect`?

- There is no exact one-to-one equivalent.
- `LaunchedEffect` starts a coroutine tied to Compose composition and restarts it when its keys change.
- In View-based UI, use lifecycle-aware APIs according to the requirement:
  - `lifecycleScope`
  - `viewLifecycleOwner.lifecycleScope`
  - `repeatOnLifecycle`
  - `viewModelScope` for business work

``` kotlin
LaunchedEffect(userId) {
    viewModel.loadUser(userId)
}
```

```kotlin
viewLifecycleOwner.lifecycleScope.launch {
    viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
        viewModel.uiState.collect { state ->
            render(state)
        }
    }
}
```

## How does Compose recomposition work?

- Compose executes composables during **composition** and records state reads.
- When observed state changes, affected scopes are invalidated.
- Compose schedules recomposition for those scopes.
- It may skip composables whose inputs are stable and unchanged.
- Recomposition does **not** mean the entire screen is redrawn.

```text
State change
    ↓
Snapshot/state observation
    ↓
Affected scope invalidated
    ↓
Recomposition
    ↓
Parameter/stability checks
    ↓
Unchanged stable subtrees may be skipped
```

## What causes recomposition?

- A composable reads Compose state and that state changes.
- A parent recomposes and passes changed parameters.
- A state holder emits a new value observed by the composable.
- Unstable/changed parameters can prevent skipping.
- Incorrect state placement can cause a much larger subtree to recompose than necessary.

## What is the difference between recomposition, layout and drawing?

```text
Composition -> What UI exists
Layout       -> Where/how large UI is
Drawing      -> How pixels are drawn
```

- Recomposition can lead to layout/draw, but they are separate phases.
- Optimizing composition does not automatically solve every layout or rendering problem.

## Why is `LazyColumn` key important?

- A key provides stable identity for each item.
- Compose can preserve item-specific composition and state when items are inserted, removed or reordered.
- It is especially important when rows contain remembered state, animations, text input or expanded/collapsed state.

```kotlin
LazyColumn {
    items(
        users,
        key = { it.id }
    ) { user ->
        UserRow(user)
    }
}
```

## `remember` vs `rememberSaveable`

- `remember` survives recomposition while the composition remains alive.
- `rememberSaveable` uses saved-state mechanisms to restore supported values after recreation.
- Business/domain state should generally belong in a ViewModel or other state holder.

```kotlin
var query by remember { mutableStateOf("") }

var selectedTab by rememberSaveable { mutableIntStateOf(0) }
```

## Why did you create a separate Fragment for Compose?

Strong answer:

> "The application was already Fragment/XML based. I used the Fragment as the navigation and lifecycle boundary and hosted Compose inside it so we could migrate incrementally without rewriting the existing navigation and surrounding screens. It also allowed us to isolate the Compose screen and control the migration risk."

Be ready to discuss:
- ComposeView inside an existing Fragment
- Fragment hosting a Compose screen
- Full Compose navigation
- Migration strategy
- Lifecycle ownership
- Back navigation
- ViewBinding/XML coexistence

---

# 2. Compose Deep Dive

## What is state in Compose?

- State is data that can change over time and can cause UI updates.
- Compose observes state reads and invalidates affected scopes when the value changes.

```kotlin
var count by remember { mutableIntStateOf(0) }
```

## What is state hoisting?

- Move state to the lowest common owner that needs to control it.
- Child composables receive state and callbacks.
- Makes composables reusable and testable.

```kotlin
@Composable
fun SearchBox(
    query: String,
    onQueryChange: (String) -> Unit
) {
    TextField(
        value = query,
        onValueChange = onQueryChange
    )
}
```

---

## What is `derivedStateOf`?

-   It creates state derived from other state.
-   It can prevent unnecessary recompositions when the derived result
    has not changed.

``` kotlin
val showButton by remember {
    derivedStateOf {
        listState.firstVisibleItemIndex > 0
    }
}
```
Use it when derived state changes less frequently than its inputs.

---

## `LaunchedEffect` vs `DisposableEffect`

- `LaunchedEffect`: coroutine-based side effect tied to composition.
- `DisposableEffect`: setup/cleanup for lifecycle-like subscriptions.

```kotlin
DisposableEffect(lifecycleOwner) {
    val observer = LifecycleEventObserver { _, event ->
        // handle event
    }

    lifecycleOwner.lifecycle.addObserver(observer)

    onDispose {
        lifecycleOwner.lifecycle.removeObserver(observer)
    }
}
```

## What is `rememberUpdatedState`?

- Keeps the latest value available to an effect without restarting the effect because the value changed.

Useful for long-lived effects where the callback/value should be current.

## What is `snapshotFlow`?

- Converts Compose snapshot state reads into a Flow.

```kotlin
LaunchedEffect(listState) {
    snapshotFlow {
        listState.firstVisibleItemIndex
    }.collect { index ->
        // react to scroll position
    }
}
```

## What is `SideEffect`?

- Publishes Compose state to non-Compose code after successful composition.

## What is `produceState`?

- Bridges external asynchronous/callback-style data into Compose `State`.

## What is Compose stability?

- Stability helps the Compose compiler determine whether a composable can be skipped when inputs have not meaningfully changed.
- Stable types have predictable observable behavior.
- Immutable data does not change after construction.

## `@Stable` vs `@Immutable`

### `@Immutable`

- Claims the object is deeply immutable from Compose's perspective.
- Public properties should not change after construction.

### `@Stable`

- Makes a stronger statement about how Compose can observe the object's changes.
- A stable type may be mutable, but changes must be observable in a way Compose understands.

**Important:** Do not add these annotations just to force performance. Incorrect annotations can cause stale UI because Compose may make incorrect skipping assumptions.

## How do you reduce unnecessary recomposition?

- Keep state close to where it is consumed.
- Use stable keys.
- Avoid creating unstable objects unnecessarily.
- Use immutable UI models where appropriate.
- Split large composables.
- Use `remember` for expensive object creation.
- Use `derivedStateOf` only when it reduces meaningful invalidations.
- Avoid passing changing state through large subtrees when only a small child needs it.
- Measure before optimizing.

---

# 3. Kotlin Interview Questions

## What are the main features of Kotlin?
- **Concise:** Less boilerplate than Java
- **Null Safety:** Built-in null checks
- **Extension Functions:** Add functions to existing classes
- **Coroutines:** Lightweight concurrency
- **Smart Casts:** No need for explicit casting after type check
- **Data Classes:** Auto-generate `equals()`, `hashCode()`, `toString()`, etc.
- **Default & Named Arguments**
- **Higher-order functions & Lambdas**

---

## What is the difference between val, var, and const in Kotlin?
In Kotlin, `val` and `var` are used to declare variables, but they behave differently:

1. **var (Variable)**
   - A mutable variable.
   - You can change its value after it's assigned.
   - Stored in memory at runtime.

2. **val (Value)**
   - An immutable variable (like `final` in Java).
   - You can assign only once.
   - Value is also stored at runtime, but can’t be reassigned.

3. **const val (Constant)**
   - A compile-time constant.
   - Can only be used with top-level properties or inside objects or companion objects.
   - Must be of a primitive type or String, and value must be known at compile time.

```kotlin
val name = "Kiran" // Cannot be changed later
var age = 30 // Can be updated
age = 31
```

---

## What are null safety features in Kotlin?
Kotlin eliminates `NullPointerException` (NPE) by making all types non-nullable by default.

#### Types:
- **Non-nullable:** `var name: String = "Kiran"` → cannot hold null
- **Nullable:** `var name: String? = null` → can hold null

#### Safe Operations:
- **Safe call `?.`:** Skips execution if the object is null.
- **Elvis `?:`:** Provide default value if null.
- **Not-null Assertion `!!`:** Throws Null Pointer Exception if value is null.
- **Safe Cast `as?`:** Returns null instead of throwing ClassCastException.

---

## What is a data class in Kotlin?
A data class is a special class made specifically for storing data. It automatically gives you useful methods like:
- `toString()` – so you can print the object easily
- `equals()` and `hashCode()` – to compare objects or use in HashMap/Set
- `copy()` – to create a new object with some properties changed
- `componentN()` – to access values using destructuring (like `val (a, b) = obj`)

*Syntax:*
```kotlin
data class User(val name: String, val age: Int)
```

---

## What are Primary and Secondary Constructors in Kotlin?

#### Primary Constructor
- The main constructor of a class.
- Defined in the class header.
- Can directly initialize properties.

*Usage in Android:*
- Pass data directly when creating an object.

*Key Points:*
- There can be only one primary constructor.
- Can include `init` block for additional initialization.

#### Secondary Constructor
- Optional additional constructors for different ways to create an object.
- Defined inside the class body with a `constructor` keyword.
- Must delegate to the primary constructor (if primary exists) using `: this(...)`.

*Usage in Android:*
- Useful when you want flexible object creation in different scenarios.

*Key Points:*
- You can have multiple secondary constructors.
- Helps when default values or alternative initialization is needed.

---

## What is an inline function?

- Compiler can substitute the function body at the call site.
- Useful for higher-order functions to reduce lambda allocation/call overhead.
- Can enable `reified` type parameters.
- Excessive use can increase generated code size.

## What are `noinline` and `crossinline`?

- `noinline`: prevents a function parameter from being inlined.
- `crossinline`: prevents non-local returns from an inlined lambda.

## What is a reified generic?

- Normally generic type information is erased at runtime.
- `reified` preserves access to the type inside an inline function.

```kotlin
inline fun <reified T> Gson.fromJson(json: String): T {
    return fromJson(json, T::class.java)
}
```

## What is delegation?

```kotlin
class Repository(
    private val dataSource: DataSource
) : DataSource by dataSource
```

- Delegates implementation to another object.
- `by lazy` is also property delegation.

## `lazy` vs `lateinit`

- `lazy`: initializes on first access and supports immutable `val`.
- `lateinit`: deferred initialization of a mutable non-null property, mainly reference types.
- Accessing an uninitialized `lateinit` property throws an exception.

## Sealed class vs sealed interface

- Both restrict known direct subtypes.
- Sealed class can carry constructor/state and allows only one superclass.
- Sealed interface allows a class to implement multiple interfaces and is useful for modeling orthogonal state/capability hierarchies.

```kotlin
sealed interface UiState {
    data object Loading : UiState
    data class Success(val data: List<Item>) : UiState
    data class Error(val message: String) : UiState
}
```

## What is variance?

- `out` = producer/covariant.
- `in` = consumer/contravariant.
- `*` = star projection when exact type argument is unknown.

## Why is `List<String>` assignable to `List<Any>`?

- Kotlin's `List` is read-only and covariant: `List<out T>`.

## Scope functions

| Function | Receiver | Returns | Typical use |
|---|---|---|---|
| `let` | `it` | lambda result | null transformation |
| `run` | `this` | lambda result | configure + compute |
| `with` | `this` | lambda result | group operations |
| `apply` | `this` | receiver | object configuration |
| `also` | `it` | receiver | side effect |

Avoid chaining them excessively.

---

# 4. Coroutines Deep Dive

## `launch` vs `async`

- `launch` -> `Job`.
- `async` -> `Deferred<T>`.
- Use `async` when a result is required and concurrent execution provides value.
- Do not use `async` just because multiple calls exist.

## What is cancellation?

- Cancellation is cooperative.
- Suspending functions normally check cancellation.
- CPU-heavy loops should check `isActive` or call `ensureActive()`.

```kotlin
while (isActive) {
    processNext()
}
```

## `withContext` vs `launch`

- `withContext` switches context and returns a result while remaining sequential.
- `launch` starts a new child coroutine and returns immediately with a `Job`.

## `Dispatchers.Main`, `IO`, `Default`

- `Main`: UI work.
- `IO`: blocking I/O.
- `Default`: CPU-intensive work.
- Do not mechanically move every function to `IO`; understand the workload.

## `SupervisorJob` vs `supervisorScope`

- `SupervisorJob` is a Job implementation that gives supervisor-style child failure behavior.
- `supervisorScope` creates a structured scope with supervisor semantics.

## Exception handling

- `CoroutineExceptionHandler` is primarily for uncaught exceptions in root/launch-style coroutines.
- For `async`, exceptions are normally observed through `await`.
- Prefer local `try/catch` where the failure is expected and needs a business response.

---

# 5. Flow

## Cold Flow vs Hot Flow

### Cold Flow

- Starts execution for each collector.
- Example: a regular `flow {}`.

### Hot Flow

- Exists independently of collectors.
- Examples: `StateFlow`, `SharedFlow`.

## StateFlow vs SharedFlow

| StateFlow | SharedFlow |
|---|---|
| Represents current state | Broadcasts events/data |
| Requires initial value | Does not require one |
| Always has latest value | Configurable replay |
| Conflates updates | Configurable buffering/replay |

## When use StateFlow?

Use for screen state:

```kotlin
data class UiState(
    val loading: Boolean = false,
    val data: List<Item> = emptyList(),
    val error: String? = null
)
```

## When use SharedFlow?

Use for events:

```kotlin
sealed interface UiEvent {
    data class ShowError(val message: String) : UiEvent
    data object NavigateBack : UiEvent
}
```

## `stateIn`

Converts a cold Flow into StateFlow.

```kotlin
val uiState = repository.observe()
    .stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = UiState()
    )
```

## `shareIn`

Converts a cold Flow into SharedFlow.

## `combine` vs `merge`

- `combine`: emits using the latest value from each upstream.
- `merge`: forwards emissions from multiple flows as they arrive.

## `flatMapLatest`

- Cancels the previous inner flow when a new upstream value arrives.
- Excellent for search.

```kotlin
query
    .debounce(300)
    .distinctUntilChanged()
    .flatMapLatest { repository.search(it) }
```

---

# 6. Android Lifecycle

## Activity lifecycle

```text
onCreate
onStart
onResume
onPause
onStop
onDestroy
```

Know:
- configuration changes
- process death
- saved instance state
- ViewModel retention
- task/back stack

## Fragment lifecycle

Understand the difference between:

- Fragment lifecycle
- Fragment View lifecycle

Important because views can be destroyed while the Fragment object remains.

```kotlin
private var _binding: FragmentHomeBinding? = null

override fun onDestroyView() {
    _binding = null
    super.onDestroyView()
}
```

## Why collect Flow with `repeatOnLifecycle`?

- Prevents collecting when the UI is stopped.
- Automatically starts/stops collection according to lifecycle.

---

# 7. Clean Architecture

## What is Clean Architecture?

Typical dependency direction:

```text
Presentation
     ↓
Domain
     ↑
Data
```

A cleaner conceptual model is:

```text
UI → ViewModel → UseCase → Repository(interface)
                              ↑
                       RepositoryImpl
                         ↙       ↘
                       Room     Network
```

- Domain should contain business rules.
- Data implements repository contracts.
- Presentation should not directly depend on Retrofit/Room details.

## Is Clean Architecture always required?

No.

Strong answer:

> "I use the level of separation justified by the complexity of the feature. For a small feature, too many use cases and layers can add ceremony. For a large banking application with multiple data sources, business rules, testing requirements and multiple teams, the boundaries become valuable."

## MVVM vs MVI

### MVVM

- View observes state from ViewModel.
- Simple and widely adopted.
- Multiple state mutation paths can become harder to control if poorly designed.

### MVI

- Intent/action -> reducer/state transition -> single UI state.
- Predictable state transitions.
- Can become verbose for simple screens.

Choose based on complexity, team conventions and maintainability.

---

# 8. Offline-First Architecture

## How would you design offline-first?

```text
Compose UI
    ↓
ViewModel
    ↓
UseCase
    ↓
Repository
   ↙       ↘
 Room     Network
   ↓         ↑
 Local ← Sync Worker
```

Principles:

- Local database as source of truth for displayed data.
- Network synchronizes remote state.
- WorkManager handles durable background synchronization.
- Queue pending mutations.
- Retry transient failures with backoff.
- Make mutations idempotent.
- Track sync state.
- Handle conflicts explicitly.

## How do you resolve conflicts?

Possible approaches:

- Server version/revision.
- Optimistic concurrency.
- Last-write-wins where acceptable.
- Server-wins/client-wins where business rules permit.
- Field-level merge.
- Domain-specific conflict rules.
- User-visible conflict resolution.

For financial/business-critical operations, the server should remain authoritative and mutation APIs should be designed for idempotency and concurrency control.

---

# 9. Networking

## Retrofit vs OkHttp

- Retrofit provides a typed API abstraction.
- OkHttp provides HTTP transport, connection management, interceptors and networking primitives.

## Interceptor vs Authenticator

- Interceptor can add headers/log/request transformations.
- `Authenticator` is designed to react to authentication challenges such as 401 and attempt credential refresh.

## How would you implement token refresh?

```text
Request
 ↓
401
 ↓
Authenticator
 ↓
Refresh token
 ↓
Store new access token securely
 ↓
Retry original request
```

Avoid multiple simultaneous refresh requests. Coordinate refresh so concurrent requests share one refresh operation.

## Retry strategy

- Retry only transient failures.
- Use exponential backoff with jitter.
- Avoid blindly retrying non-idempotent operations.
- Respect server retry information where applicable.
- Cap retries.

---

# 10. Security

## How can you securely store sensitive data in an Android app?
You should never store sensitive data (like passwords or tokens) in plain text. Instead:
- Use EncryptedSharedPreferences for small data like tokens.
- Use Android Keystore to store cryptographic keys securely.
- Avoid storing sensitive info in internal or external storage.

---

## What is Android Keystore and why is it used?
Android Keystore is a secure container that helps store cryptographic keys. These keys can be used for encryption, decryption, or signing without exposing them directly to the app.
It ensures that:
- Keys cannot be extracted.
- Operations happen in secure hardware (if available).
- Your app remains safe even if rooted.

---

## What are common security risks in Android apps?
Some common risks:
- Storing data in plain text.
- Using HTTP instead of HTTPS.
- Hardcoding API keys in code.
- Not validating inputs (leading to injection attacks).
- Using outdated libraries with vulnerabilities.

---

## How can you protect your API keys in Android?
- Don’t hardcode keys in code or strings.xml.
- Use BuildConfig with Gradle to store API keys.
- Store keys on the server and use token-based auth.
- Use NDK (native C++) for critical keys (not fully secure but harder to reverse).

---

## How can you prevent reverse engineering of your APK?
- Use ProGuard or R8 to obfuscate the code.
- Remove unused code and classes.
- Avoid storing logic or secrets in the app.
- Sign APKs with release keystore.
- Monitor unauthorized APKs using Play Store Console.

---

## What is the use of ProGuard/R8 in Android?
ProGuard (now replaced by R8) is a tool that:
- Minifies code (removes unused code).
- Obfuscates names (changes class/method names to random characters).
- Makes it harder for attackers to reverse engineer the app.

---

## How can you secure communication between app and server?
- Always use HTTPS (SSL/TLS) to encrypt data in transit.
- Use certificate pinning to verify the server.
- Avoid logging sensitive data (e.g., tokens or passwords).
- Use secure authentication methods like OAuth2 or JWT.

---

## What is certificate pinning?
Certificate pinning is a technique where you hardcode your server’s public certificate or key in the app. It ensures:
- The app only trusts your server.

---

## How do you securely store tokens?

- Use Android Keystore-backed secure mechanisms where appropriate.
- Do not hardcode secrets.
- Never log access/refresh tokens.
- Minimize token lifetime and scope.
- Clear credentials on logout.
- Follow organizational security policies.

## What is certificate pinning?

- Restricts accepted certificates/public keys to expected identities.
- Can reduce certain MITM risks.
- Creates operational risks during certificate rotation.
- Must have a safe rotation and recovery strategy.

## What is OWASP MASVS?

- Mobile Application Security Verification Standard.
- Use it as a structured security baseline for mobile applications.

---

# 11. Performance

## How do you investigate a slow Android app?

Use measurement first:

```text
Problem
 ↓
Reproduce
 ↓
Metrics / traces
 ↓
Identify bottleneck
 ↓
Fix
 ↓
Benchmark
 ↓
Monitor in production
```

Tools:
- Android Studio Profiler
- CPU profiler
- Memory profiler
- Perfetto
- StrictMode
- Macrobenchmark
- Baseline Profiles
- Android Vitals
- Crash/ANR analytics

## What causes ANRs?

- Long work on main thread.
- Blocking I/O.
- Expensive computation.
- Lock contention/deadlock.
- Slow binder operations.
- Excessive rendering/layout work.

## How do you investigate an ANR?

- Check Android Vitals/ANR traces.
- Inspect main thread stack.
- Look for blocking calls and lock contention.
- Reproduce if possible.
- Add tracing/metrics.
- Move appropriate work off main.
- Fix synchronization problems.
- Verify with benchmarks and production metrics.

## What is Baseline Profile?

- A profile of important code paths used by the app.
- Allows Android runtime to optimize frequently executed paths earlier.
- Often improves startup and runtime performance.

## What is jank?

- Frames missing their rendering deadlines, resulting in visibly stuttery UI.
- Investigate expensive composition, layout, drawing, main-thread work and rendering bottlenecks.

---

# 12. Memory Leaks

## Common Android leaks

- Singleton holding Activity/Context.
- Fragment retaining binding after `onDestroyView`.
- Long-lived listener/callback.
- Handler/Runnable retaining an object.
- Coroutine running beyond the required lifecycle.
- Static references.
- Incorrect lifecycle ownership.

## How do you detect leaks?

- LeakCanary.
- Android Studio Memory Profiler.
- Heap dumps.
- Allocation tracking.
- Reproduce navigation cycles and inspect retained objects.

---

# 13. Testing

## Unit vs instrumentation vs UI tests

### Unit

Fast, JVM-based, business logic/ViewModel/use case.

### Instrumentation

Runs on Android environment and is useful for framework/integration behavior.

### UI

Verifies actual user interaction and UI behavior.

## What is Unit Testing in Android?
Unit testing is the practice of testing individual components or functions in isolation to ensure they behave correctly.
- In Android, we typically use JUnit for unit testing.
- Unit tests run on the JVM and are fast because they don't require a device/emulator.

---

## What is the difference between Unit Tests and Instrumentation Tests in Android?

| Unit Test | Instrumentation Test |
| :--- | :--- |
| Runs on JVM | Runs on a real device/emulator |
| Fast | Slower due to UI/device interaction |
| Tests logic in isolation | Tests integration, UI, and end-to-end |
| Uses JUnit/Mockito | Uses Espresso, UI Automator, etc. |

---

## Which tools/libraries are used for Unit Testing in Android?
- **JUnit** – Base library for writing tests.
- **Mockito / MockK** – For mocking dependencies.
- **Truth / AssertJ / Hamcrest** – Assertion libraries.
- **Robolectric** – Allows you to run Android SDK code in JVM unit tests.
- **Turbine** – For testing Kotlin Flow.
- **Kotlin Test DSL** – For idiomatic Kotlin test writing.

---

## How do you test ViewModel in Android?
- ViewModels are easy to test because they don’t depend on Android Framework.
- You can write plain JUnit tests and verify outputs by observing LiveData or StateFlow.

---

## What is `runTest`?

- Provides a coroutine test environment with virtual time support.
- Allows deterministic testing of delays and coroutine scheduling.

```kotlin
@Test
fun `search updates state`() = runTest {
    viewModel.search("android")
    advanceUntilIdle()

    assertEquals(expected, viewModel.uiState.value.data)
}
```

## Why `advanceTimeBy` instead of `delay` in tests?

- `delay` waits real time.
- `advanceTimeBy` advances virtual test time.
- Tests become fast and deterministic.

## Turbine

Useful for testing Flow emissions:

```kotlin
flow.test {
    assertEquals(UiState(), awaitItem())
    viewModel.load()
    assertEquals(true, awaitItem().loading)
}
```

---

# 14. Compose UI Testing

Know:

- semantic tree
- `testTag`
- text/content description
- node matchers
- actions
- assertions
- accessibility semantics

```kotlin
composeTestRule
    .onNodeWithText("Login")
    .performClick()
```

Good UI tests should verify user-visible behavior rather than implementation details.

---

# 15. Modularization

Example:

```text
:app
:core:common
:core:network
:core:database
:core:designsystem
:feature:login
:feature:home
:feature:payments
```

Benefits:

- Faster incremental builds.
- Clear ownership.
- Better dependency boundaries.
- Parallel team development.
- Reusable libraries.
- Easier testing.

Be ready for:
- feature vs layer modules
- dependency cycles
- public APIs
- navigation ownership
- Gradle convention plugins
- build performance

---

# 16. CI/CD

Typical pipeline:

```text
Pull Request
 ↓
Compile
 ↓
Lint
 ↓
Static analysis
 ↓
Unit tests
 ↓
UI/instrumentation tests
 ↓
Security checks
 ↓
Build AAB
 ↓
Sign
 ↓
Internal testing
 ↓
Staged rollout
 ↓
Production monitoring
```

Know:
- Gradle build variants
- product flavors
- signing
- keystore/security
- caching
- parallel jobs
- quality gates
- release automation
- rollback

## 9. DevOps in Android

## What is CI/CD in Android?
CI/CD in Android development refers to Continuous Integration and Continuous Delivery/Deployment, a set of practices that automate the building, testing, and delivery of Android applications.

- **Continuous Integration (CI)** means that developers regularly push code to a shared repository (like GitHub), and every push automatically triggers a build and test. This helps catch errors early.
- **Continuous Delivery (CD)** means that once code is tested and validated, it can be automatically packaged (APK or AAB) and delivered to testing environments (like Firebase App Distribution).
- **Continuous Deployment** goes one step further and automatically publishes the app to production like Google Play once it passes all quality checks.

CI/CD improves team collaboration, reduces manual errors, and speeds up release cycles.

---

## Why is CI/CD important in Android development?
CI/CD helps in:
- Faster development cycles by automating build and testing.
- Early bug detection due to frequent code integration and automated tests.
- Better team collaboration, as code is constantly merged and verified.
- Reduced manual work — no need to manually run tests, generate APKs, or upload to Play Store.
- Consistent builds because the process is scripted and version-controlled.

---

## Which tools are commonly used for CI/CD in Android?
Some commonly used CI/CD tools are:
- **GitHub Actions** – Integrated with GitHub, good for open-source and personal projects.
- **Bitrise** – Android and iOS friendly, no setup needed, GUI-based.

---

## 10. Gradle Concepts & Issues

## What is Gradle in Android?
- Gradle is the build system used in Android.
- It automates compiling code, packaging APKs, and managing dependencies.
- Think of it as a recipe that tells Android Studio how to build your app.
- It’s fast, flexible, and supports custom build configurations.

---

## What is the difference between Project-level and Module-level build.gradle?

#### Project-level build.gradle
- Applies to the entire project.
- Defines global configurations such as:
  - Gradle version
  - Repositories
  - Classpath for plugins

#### Module-level build.gradle
- Specific to each app/module.
- Defines module-specific settings such as:
  - Dependencies (`implementation`, `api`, etc.)
  - Build types (`debug`/`release`)
  - Product flavors
  - Android SDK version

*Key Point:* Project-level is for general setup affecting all modules, while Module-level is for app/module-specific configurations.

---

## What are Build Variants and Product Flavors?
- **Build Variants:** Combination of build type (debug/release) + flavor. Example: `freeDebug`, `paidRelease`.

---

## How would you improve build time?

- Gradle build cache.
- Configuration/build optimization.
- Modularization.
- Avoid unnecessary annotation processing.
- Use appropriate Kotlin/Gradle plugins.
- Parallelize independent CI jobs.
- Run targeted tests locally and comprehensive gates in CI.
- Measure before/after.

---

# 17. Release Strategy

Know:

- Feature flags.
- Staged/phased rollout.
- Internal/beta testing.
- Monitoring.
- Rollback/disable mechanisms.
- Crash-free sessions/users.
- ANR rate.
- startup performance.
- defect escape rate.

For banking features, operational readiness is important before rollout.

---

# 18. Lead-Level Architecture Questions

## Design a banking transaction screen

Discuss:

```text
UI
 ↓
ViewModel
 ↓
UseCase
 ↓
Repository
 ↓
API
```

Then add:

- Authentication.
- Secure token handling.
- Idempotency key.
- Local state.
- Loading/error/retry.
- Duplicate submission protection.
- Auditability.
- Server-authoritative transaction result.
- Analytics/monitoring without sensitive data.
- Feature flags.
- Rollout and rollback.

## How would you prevent double payment?

- Disable duplicate UI submission.
- Generate a client/request idempotency key.
- Send it with the request.
- Server guarantees idempotent processing.
- Persist pending transaction state when necessary.
- Reconcile status rather than blindly retrying an unknown result.

**Important:** UI-level disabling alone is not enough.

---

# 19. System Design Questions

Prepare these end-to-end:

1. Design an offline-first banking app.
2. Design a transaction history screen.
3. Design a payment flow.
4. Design a search screen with debounce and caching.
5. Design a notification system.
6. Design a secure login flow.
7. Design a multi-module Android application.
8. Design a reusable design system.
9. Design an app that supports poor connectivity.
10. Design a synchronization engine.
11. Design an image/document upload system.
12. Design feature flags.
13. Design crash/ANR monitoring.
14. Design an Android CI/CD pipeline.
15. Design a scalable Compose architecture.

For every system design answer cover:

```text
Requirements
Architecture
Data flow
State management
Error handling
Offline behavior
Concurrency
Security
Testing
Observability
Scalability
Trade-offs
```

---

# 20. Lead-Level Agile Questions

## How do you handle sprint planning?

Strong answer:

> "I start by clarifying the business outcome, then break the feature into technical and testable slices. I identify dependencies, risks, API readiness, design dependencies and unknowns. I estimate with the team rather than assigning estimates individually, and I make sure acceptance criteria and non-functional requirements are explicit."

## How do you handle unclear requirements?

- Clarify expected behavior.
- Identify edge cases.
- Write acceptance criteria.
- Create a spike for technical uncertainty.
- Document assumptions.
- Avoid starting implementation based on ambiguous requirements.

## What if product wants a feature urgently?

Answer:

> "I first understand the business deadline and impact. Then I separate must-have scope from nice-to-have scope, identify technical risks, and propose the smallest safe deliverable. I would not trade away security, data integrity or critical quality gates just to meet a date."

## How do you handle disagreement with Product?

Use:

```text
Understand goal
 ↓
Present engineering impact
 ↓
Quantify risk
 ↓
Offer alternatives
 ↓
Agree on decision
 ↓
Document it
```

Do not make it personal.

## How do you handle a disagreement with another senior engineer?

- Understand their reasoning first.
- Compare against requirements/data.
- Prototype or benchmark if uncertain.
- Focus on trade-offs rather than authority.
- Escalate only when necessary.
- Commit to the final team decision.

---

# 21. Lead-Level Code Review Questions

## What do you look for in a PR?

### Correctness

- Does behavior meet requirements?
- Edge cases?
- Concurrency?

### Architecture

- Correct dependency direction?
- Appropriate abstraction?
- No unnecessary complexity?

### Maintainability

- Naming?
- Cohesion?
- Duplication?
- Testability?

### Performance

- Main-thread work?
- Allocation?
- Unnecessary recomposition?
- Database/network efficiency?

### Security

- Sensitive logging?
- Credentials?
- Input validation?
- Unsafe storage?

### Testing

- Happy path?
- Error path?
- Regression test?
- Lifecycle/concurrency cases?

## How do you handle a PR from a junior engineer with problems?

- Do not rewrite everything yourself.
- Explain the reasoning.
- Identify high-risk issues clearly.
- Separate blocking issues from suggestions.
- Pair when useful.
- Encourage the engineer to make the change.
- Follow up to ensure learning.

---

# 22. Mentoring Questions

## How do you mentor junior developers?

- Give context, not only instructions.
- Start with small ownership.
- Review code with explanations.
- Encourage design discussions.
- Pair on difficult problems.
- Define measurable growth goals.
- Gradually increase responsibility.

## How do you measure whether mentoring worked?

- Increased independent ownership.
- Better PR quality.
- Reduced repeated defects.
- Faster delivery of appropriately scoped work.
- Engineer can explain design decisions independently.

---

# 23. Delivery Metrics

The JD mentions delivery metrics, so know:

- Cycle time.
- Lead time.
- Deployment frequency.
- Change failure rate.
- Mean time to recovery.
- Defect escape rate.
- Crash-free users/sessions.
- ANR rate.
- Build time.
- Test pass rate.

Do not optimize metrics blindly.

Example:

> "Reducing cycle time by skipping review or tests is not a real improvement. I would optimize the entire delivery system while protecting quality and security."

---

# 24. Production Incident Questions

## Production crash increased after release. What do you do?

```text
Detect
 ↓
Assess severity/blast radius
 ↓
Stop/slow rollout if needed
 ↓
Identify affected versions/devices/features
 ↓
Find root cause
 ↓
Mitigate
 ↓
Release fix
 ↓
Monitor
 ↓
Post-incident review
```

## What should a runbook contain?

- Symptoms.
- Detection/alerts.
- Impact.
- Investigation steps.
- Mitigation.
- Rollback/feature flag.
- Escalation path.
- Recovery verification.
- Post-incident actions.

---

# 25. AI-Assisted Development

## How do you use Claude/AI safely in enterprise development?

Strong answer:

> "I use approved AI tools for boilerplate, test generation, refactoring ideas, documentation and exploring alternatives. I treat the output as untrusted generated code. I review it, compile it, run unit/UI tests, run static analysis and verify security and business behavior. I follow the organization's approved-tool and data-handling policies and never expose customer data, credentials or restricted source code to an unapproved service."

## How do you validate AI-generated code?

```text
AI suggestion
 ↓
Human review
 ↓
Compile
 ↓
Unit tests
 ↓
Integration/UI tests
 ↓
Lint/static analysis
 ↓
Security review
 ↓
Code review
 ↓
Production monitoring
```

---

# 26. Your Android UI Automation Agent

Be ready to explain your agent as a senior engineering project.

## Problem

- UI tests are expensive to create manually.
- Developers may miss coverage for new Compose components.
- Existing project context is important.

## Approach

```text
Developer request
 ↓
Agent
 ↓
Search project
 ↓
Identify target Composable
 ↓
Inspect parameters/state/semantics
 ↓
Find existing test patterns
 ↓
Generate Compose UI test
 ↓
Compile/test
 ↓
Fix failures
 ↓
Final test
```

## How do you prevent hallucinated tests?

- Search actual source code.
- Reuse existing project conventions.
- Inspect actual Composable names and semantics.
- Generate only against available APIs.
- Compile generated code.
- Execute tests.
- Validate failures.
- Require human review for sensitive/high-risk changes.

---

# 27. Behavioral / Leadership Questions

Prepare STAR stories for:

1. Biggest technical challenge.
2. Production incident.
3. Major performance improvement.
4. Architecture decision you owned.
5. Disagreement with another engineer.
6. Disagreement with Product.
7. Mentoring someone.
8. Missed deadline.
9. Technical debt you reduced.
10. Difficult legacy codebase.
11. Migration from XML to Compose.
12. Modularization.
13. CI/CD improvement.
14. Testing improvement.
15. Automation/AI project.
16. Failure and what you learned.
17. Taking ownership outside your assigned task.
18. Handling multiple priorities.
19. Convincing stakeholders.
20. Delivering under pressure.

## STAR structure

```text
Situation
Task
Action
Result
Learning
```

For senior-level answers, emphasize:

- Your decision.
- Why you made it.
- How you influenced others.
- Trade-offs.
- Measurable result.
- What you would do differently.

---

# 28. "Tell me about yourself"

Use a 60-90 second structure:

> "I'm an Android engineer with around 9 years of experience building mobile applications, primarily with Kotlin, Android and Jetpack Compose. I've worked across domains including healthcare, fintech and banking, and I've owned features from architecture and implementation through testing, CI/CD and production support.  
>
> My strongest areas are Kotlin, Coroutines/Flow, Compose, scalable architecture and engineering quality. More recently I've also worked on automation and AI-assisted developer tooling, including an Android UI testing agent that searches a project and generates Compose UI tests.  
>
> At this stage I'm looking for a role where I can combine hands-on Android development with technical leadership, architecture, mentoring and improving engineering practices at scale."

---

# 29. Questions You Should Ask the VP

Ask 2-3, not all.

## Technical

- "What are the biggest technical challenges the Android team is currently solving?"
- "How is the Android codebase structured across feature and shared modules?"
- "How much of the application is Compose versus XML, and what is the migration strategy?"

## Leadership

- "What does strong performance look like for an SE III in the first six months?"
- "How much ownership does an SE III have over architecture and technical decisions?"
- "How do engineers participate in technical strategy across teams?"

## Engineering quality

- "What are the team's biggest stability or performance challenges today?"
- "How do you measure engineering quality and delivery effectiveness?"

## AI

- "How is the organization using approved AI tools in the mobile engineering workflow, and what validation standards are expected?"

## What are the core building blocks of an Android application?

- **Activity:** A screen-level entry point for user interaction and lifecycle management.
- **Fragment:** A reusable UI and lifecycle component hosted by an Activity or another Fragment.
- **Service:** A component for work that should continue without a visible UI. Modern apps should prefer WorkManager for deferrable, guaranteed work and foreground services only when user-visible ongoing work is required.
- **BroadcastReceiver:** A short-lived handler for system or application broadcasts.
- **ContentProvider:** A controlled, URI-based data-sharing boundary between applications.
- **Views and layouts:** The traditional UI hierarchy, created in XML or code. Compose provides a declarative alternative using composables and layout primitives.
- **AndroidManifest.xml:** Declares components, capabilities, permissions, intent filters and application metadata.

The important production distinction is that these components have different lifetimes. Work should be placed in the component whose lifecycle and guarantees match the requirement rather than started from an Activity indiscriminately.

## What is an Intent?

An Intent is a message describing an action for another Android component. It can carry data in extras and, for implicit intents, data such as a URI or MIME type.

- **Explicit intent:** Names the target component, commonly for navigation inside the application.
- **Implicit intent:** Describes an action and lets Android resolve a capable component through intent filters.

```kotlin
val explicit = Intent(this, SecondActivity::class.java)
startActivity(explicit)

val browser = Intent(Intent.ACTION_VIEW, Uri.parse("https://www.google.com"))
startActivity(browser)
```

Validate external intent data and use explicit intents for sensitive internal flows. Deep links should also validate authentication and authorization before displaying protected content.

## Explain the Android application and Activity lifecycles.

`Application.onCreate()` runs once when the process is created and is appropriate for lightweight, process-wide initialization. `onTerminate()` is not a reliable production-device callback. `onTrimMemory()` communicates memory pressure and is the useful callback for releasing caches or other reclaimable resources.

An Activity commonly moves through:

```text
onCreate -> onStart -> onResume -> onPause -> onStop -> onDestroy
```

Use `onCreate()` for initial setup, `onStart()`/`onStop()` for visibility, and `onResume()`/`onPause()` for foreground interaction. Configuration changes recreate the Activity, while process death can remove both the Activity and its ViewModel. Use ViewModel for screen state and saved state mechanisms for small restorable UI state. See also [Android Lifecycle](#6-android-lifecycle) and [offline-first architecture](#8-offline-first-architecture).

## Can `onDestroy()` be called without `onPause()` and `onStop()`?

Yes. If an Activity calls `finish()` during `onCreate()`, it may be destroyed without becoming visible, so `onPause()` and `onStop()` are not necessarily called. Code must not assume every lifecycle callback pair occurs for an Activity that never reaches the started or resumed state.

## What are intent filters?

Intent filters declare the actions, categories and data types a component can handle. Android uses them to resolve implicit intents. A web-link filter, for example, may declare `ACTION_VIEW`, the `DEFAULT` category and HTTP/HTTPS data schemes.

Do not use filters as an authorization mechanism: any matching application may be offered the intent, and incoming data must still be validated.

## What is a BroadcastReceiver?

A BroadcastReceiver handles a broadcast Intent and is intended for short, bounded work. It has no UI and should return quickly. For longer work, enqueue WorkManager work or start an appropriately declared foreground service rather than blocking `onReceive()`.

Examples include reacting to charging state, low battery, boot completion, or an app-specific event. On modern Android versions, background execution and implicit-broadcast restrictions apply, so register only broadcasts that the platform permits and scope dynamic receivers to the required lifecycle.

## What are Loaders in Android?

Loaders were lifecycle-aware APIs introduced in API 11 for asynchronous data loading, commonly with `CursorAdapter` and `LoaderManager`. They could reconnect after configuration changes and avoid repeated queries. They are legacy APIs today; use Room with `Flow`, ViewModel, and lifecycle-aware collection for new code. The underlying principle remains valid: database or provider work must not block the main thread and collection should follow the UI lifecycle.

## What are Activity launch modes?

- **standard:** Creates a new instance for every launch.
- **singleTop:** Reuses the instance only when it is already at the top and delivers the Intent through `onNewIntent()`.
- **singleTask:** Reuses an existing instance in the task, removes the activities above it, and calls `onNewIntent()`.
- **singleInstance:** Places the Activity in its own task, isolating it from other Activities.

Choose launch modes deliberately. For most navigation, standard behavior plus an explicit back-stack policy is easier to reason about. Notification and deep-link flows often use flags such as `FLAG_ACTIVITY_CLEAR_TOP` or a suitable navigation graph policy instead of broadly applying `singleTask`.

## What is ConstraintLayout?

ConstraintLayout positions views through relationships to the parent or other views. Chains support distribution, guidelines support alignment, and barriers respond to dynamic content. It can reduce deeply nested hierarchies, but it is not automatically faster than every alternative; measure layout cost and choose the simplest hierarchy that expresses the UI.

## What is a Class and Object in Kotlin?

A class defines state and behavior; an object is a runtime instance of that class with its own state. Classes support encapsulation, reuse and testable boundaries. Creating an object allocates runtime state, whereas the class declaration itself is a type definition.

## What are primary and secondary constructors?

The primary constructor is declared in the class header and is the normal way to initialize required properties. An `init` block performs additional initialization. Secondary constructors are optional alternatives inside the class body and must delegate to the primary constructor when one exists.

```kotlin
class User(val id: Long, val name: String) {
    init { require(id > 0) }

    constructor(id: Long) : this(id, "Unknown")
}
```

Prefer default and named arguments over many secondary constructors when they make the API clearer.

## Explain inheritance and polymorphism in Android.

Inheritance lets a subclass reuse and specialize a superclass, such as an Activity extending `ComponentActivity`, a Fragment extending `Fragment`, or a custom view extending `View`. Polymorphism lets code depend on an abstraction while receiving different implementations, such as a repository interface backed by a network or fake data source.

Favor composition and interfaces when behavior varies independently. Inheritance is appropriate when the subtype genuinely satisfies the parent contract; otherwise it can create fragile coupling and violate substitutability.

## What are the main Kotlin features used in Android?

Kotlin provides concise syntax, null safety, extension functions, coroutines, smart casts, data classes, default and named arguments, lambdas, and higher-order functions. These reduce boilerplate, but they do not replace design discipline: nullable boundaries, coroutine cancellation, API stability and testability still need explicit decisions.

## What is the difference between `var`, `val`, and `const val`?

- `var` is a reassignable runtime property.
- `val` is assigned once, but the referenced object may still be mutable.
- `const val` is a compile-time constant of a supported primitive or `String` type and must be top-level or in an object/companion object.

```kotlin
var retryCount = 0
val userId = "user-123"
const val MAX_RETRIES = 3
```

## What are Kotlin null-safety features?

Non-nullable types cannot hold `null`; nullable types use `?`. Use `?.` for a safe call, `?:` for a fallback, `as?` for a safe cast, and `!!` only when the invariant is proven because it can still throw `NullPointerException`. Keep null handling at boundaries such as network parsing and user input rather than spreading assertions through the application.

## What is a data class?

A data class models values and generates useful `equals()`, `hashCode()`, `toString()`, `copy()`, and component functions from its primary-constructor properties.

```kotlin
data class User(val name: String, val age: Int)
```

It is useful for immutable UI state and DTOs, but `copy()` is shallow and does not make nested mutable objects immutable.

## What are MVVM, ViewModel, LiveData, StateFlow, Repository, and UseCase?

- **MVVM:** The UI renders state exposed by a ViewModel; the ViewModel coordinates use cases; repositories abstract data sources.
- **ViewModel:** Retains screen state across configuration changes and must not hold Activity/View references. It does not survive process death by itself.
- **LiveData:** A lifecycle-aware observable value, especially useful in legacy XML/View screens.
- **StateFlow:** A coroutine-based hot stream representing current state; collect it with `repeatOnLifecycle` in Views or Compose lifecycle APIs.
- **Repository:** Owns data access and hides API, Room, Firebase or cache details from callers.
- **UseCase:** Encapsulates one meaningful business operation and is valuable when logic is reused or complex; it is not mandatory ceremony for every trivial operation.

The existing [Clean Architecture](#7-clean-architecture), [Flow](#5-flow), and [offline-first](#8-offline-first-architecture) sections provide the deeper trade-offs and data-flow examples.

## What is Room, and how should it be used?

Room is an abstraction over SQLite that provides entities, DAOs, compile-time query verification, migrations, and observable queries through `Flow`. A production repository commonly treats Room as the source of truth for displayed offline-capable data and synchronizes it with the network.

```kotlin
@Entity
data class User(
    @PrimaryKey val id: Int,
    val name: String
)

@Dao
interface UserDao {
    @Query("SELECT * FROM User ORDER BY name")
    fun observeUsers(): Flow<List<User>>

    @Query("UPDATE User SET name = :name WHERE id = :id")
    suspend fun updateName(id: Int, name: String)
}
```

Use a custom `@Query` for a partial update instead of replacing the full entity with `@Update`. `@Embedded` can flatten a value object into an entity, but define column names carefully to avoid collisions. Test migrations and keep database work off the main thread.

## What are the SOLID principles, and how does Hilt support DIP?

- **Single Responsibility:** Keep UI, business logic and data access in separate responsibilities.
- **Open/Closed:** Add a payment implementation behind an abstraction instead of modifying a growing conditional processor.
- **Liskov Substitution:** An implementation must honor the behavior promised by its abstraction.
- **Interface Segregation:** Prefer focused interfaces over one large interface that forces unused methods.
- **Dependency Inversion:** High-level code depends on repository interfaces, not concrete Retrofit or Room implementations.

Hilt supports DIP by constructing object graphs and binding an implementation to an interface with `@Binds` or `@Provides`. This makes production wiring and test fakes replaceable; dependency injection does not by itself make a poor abstraction good.

## What is Jetpack Compose?
Jetpack Compose is Android’s modern UI toolkit that lets you build UI using Kotlin code instead of XML.
- It’s declarative, meaning you describe what the UI should look like, and the system updates it automatically when the data changes.
- It replaces traditional XML + View-based UI system.
- Offers less boilerplate, better state handling, and Kotlin-first approach.

---

## What is a Composable function?
A Composable is a special Kotlin function marked with `@Composable` that describes part of the UI.

*Example:*
```kotlin
@Composable
fun Greeting(name: String) {
    Text(text = "Hello, $name")
}
```
You can call one composable inside another to build complex UIs.

---

## What is recomposition in Jetpack Compose?
Recomposition is when Compose redraws parts of the UI because data/state has changed.
- Only the part of the UI where data changed is recomposed.
- Compose optimizes this to avoid redrawing everything.

*Example:* If you update a count value shown in a Text, only that Text composable will recompose.

---

## What is State in Compose?
State holds data that changes over time and triggers recomposition.
You can use `remember` and `mutableStateOf`:
```kotlin
val count = remember { mutableStateOf(0) }
```
When `count.value` changes, any UI that depends on it will update automatically.

---

## What is remember and rememberSaveable?
- `remember` stores state during recomposition but resets on configuration changes (like rotation).
- `rememberSaveable` stores state across recomposition and configuration changes using Bundle.

Use `rememberSaveable` for things like text input or selection state that should survive screen rotation.

---

## What is Modifier in Jetpack Compose?
Modifier is used to modify or decorate a composable — like setting padding, background, size, click behavior, etc.

*Example:*
```kotlin
Text(
    text = "Hello",
    modifier = Modifier
        .padding(16.dp)
        .background(Color.Yellow)
)
```
Modifiers are chained and read from left to right.

---

## What is a Scaffold in Jetpack Compose?
Scaffold is a layout component that provides basic structure like:
- TopBar
- BottomBar
- FloatingActionButton
- Drawer
- SnackbarHost

*Example:*
```kotlin
Scaffold(
    topBar = { TopAppBar(title = { Text("Home") }) },
    floatingActionButton = { FloatingActionButton(onClick = {}) { Text("+") } }
) {
    // Content
}
```
Useful for material design layouts.

---

## What is SideEffect in Jetpack Compose?
- In Jetpack Compose, a SideEffect is any operation that affects something outside of the Compose UI tree.
- Compose functions are pure by default, meaning they should not change anything outside themselves.
- SideEffect lets you perform actions that interact with external systems safely during recomposition.

#### Why It’s Needed
- Compose functions can recompose multiple times, so directly performing side-effects (like updating a variable, logging, or showing a toast) can cause bugs or repeated actions.
- SideEffect APIs provide a safe way to run external operations exactly when Compose recomposes.

#### Common Examples of SideEffects
- Updating a state in ViewModel
- Showing a Toast message
- Logging events
- Triggering analytics events

---

## What is Jetpack Compose, and what are its basic concepts?

Compose is Kotlin's declarative UI toolkit. A `@Composable` describes UI from state and parameters; when observed state changes, Compose recomposes affected scopes. `Modifier` composes layout, drawing and interaction behavior from left to right. `Scaffold` provides common Material slots such as top bar, bottom bar, FAB and snackbar host.

```kotlin
@Composable
fun Greeting(name: String) {
    Text(
        text = "Hello, $name",
        modifier = Modifier.padding(16.dp)
    )
}
```

Hoist state to the lowest common owner, use `remember` for composition-local state, and use `rememberSaveable` for supported small UI values that should survive recreation. The existing [Compose Deep Dive](#2-compose-deep-dive) covers effects, stability, keys and recomposition optimization.

## What is a side effect in Compose?

A side effect changes something outside the Compose UI tree. Use the effect API that matches the lifetime and behavior required: `LaunchedEffect` for a coroutine keyed to composition, `DisposableEffect` for setup and cleanup, `SideEffect` to publish state after successful composition, and `produceState` to bridge asynchronous sources into Compose state. Do not show toasts, start requests, or mutate external state directly on every recomposition.

## What is `PeriodicWorkRequest`, and what are WorkManager states and constraints?

`PeriodicWorkRequest` is for deferrable recurring work such as synchronization, log upload, cache cleanup, or periodic content refresh. Its minimum interval is 15 minutes and execution is inexact because WorkManager respects constraints and system battery policy. It is not suitable for exact alarms or immediate user-visible work.

WorkManager states are:

- `ENQUEUED`: waiting to run or waiting for constraints.
- `RUNNING`: currently executing.
- `SUCCEEDED`: completed successfully.
- `FAILED`: permanently failed.
- `BLOCKED`: waiting for prerequisite work.
- `CANCELLED`: explicitly cancelled.

Constraints can require network availability, charging, battery-not-low, or storage-not-low. Observe work with `WorkInfo` through LiveData or Flow, and configure retry/backoff in the Worker for transient failures. Do not promise exact timing to product stakeholders.

## How should unit tests and instrumentation tests be chosen?

Unit tests run on the JVM and are fast, so use them for pure Kotlin, ViewModels, use cases, reducers and repository policies. Instrumentation tests run on a device or emulator and are appropriate for Android framework integration, Room behavior and UI. Compose UI tests should assert user-visible semantics and interactions, not implementation details.

Common tools include JUnit, MockK or Mockito, Truth/AssertJ/Hamcrest, Robolectric where appropriate, Turbine for Flow, and `runTest` with virtual time for coroutine behavior. A ViewModel test should verify loading, success, error, cancellation and state transitions rather than merely checking that a method was called.

## How do you securely store data and protect an Android application?

Use Keystore-backed mechanisms for cryptographic keys and an approved encrypted storage mechanism for small sensitive values such as tokens. Never log credentials, use HTTPS/TLS, validate inputs, keep dependencies updated, and avoid putting secrets in the APK. R8 can shrink and obfuscate code, but obfuscation is not secret storage and cannot protect a secret shipped to a client.

Certificate pinning can reduce some MITM risk, but requires planned key rotation and recovery. For API keys, assume anything in the app can be extracted; keep sensitive authority on the server and use scoped, short-lived credentials. The existing [Security](#10-security) section covers MASVS, token handling and pinning trade-offs.

## How do you handle common Android scenarios?

### Two API calls must complete before updating the UI

Use structured concurrency and `async` only when the calls are independent and parallelism reduces latency:

```kotlin
viewModelScope.launch {
    runCatching {
        coroutineScope {
            val user = async { api.getUser() }
            val posts = async { api.getPosts() }
            user.await() to posts.await()
        }
    }.onSuccess { (user, posts) ->
        _uiState.value = UiState.Success(user, posts)
    }.onFailure { error ->
        _uiState.value = UiState.Error(error)
    }
}
```

Use `supervisorScope` only when the results are independent and one failure should not cancel the other operation.

### Room and network data are both required

Expose Room as the observable source of truth, render cached data immediately, and synchronize from the network when data is stale or missing. Save successful network results transactionally. Represent freshness, sync status and errors explicitly so offline data is not confused with fresh data.

### The user opens the app offline

Render the last valid Room snapshot, expose an offline indicator, and allow retry when connectivity returns. Do not block the UI waiting for a network timeout. WorkManager can reconcile queued mutations later, with idempotency and conflict handling for business-critical data.

### Who handles click events in MVVM?

The UI owns the event wiring and calls a ViewModel intent such as `onLoginClicked()`. The ViewModel validates input and coordinates business work; it emits state or one-time events for the UI to render. This keeps Activities and composables thin and makes behavior testable.

### How do you preserve a Compose list's scroll position?

Use `rememberLazyListState()` and pass the state to `LazyColumn`. Use stable item keys so insertion, removal and reordering do not attach remembered row state to the wrong item. For navigation or process recreation, place the required state in an appropriate saved-state or navigation owner rather than assuming `remember` survives everything.

## What are CI/CD, Gradle, build variants, and product flavors?

CI automatically compiles, tests, lint-checks and analyzes changes on shared infrastructure. CD packages validated builds for internal testing or release; continuous deployment may publish automatically after quality gates. A reliable Android pipeline also handles signing securely, artifact retention, security checks, staged rollout and rollback.

Gradle is the Android build and dependency automation system. Project-level configuration establishes shared plugin/repository setup; module-level configuration defines SDK settings, dependencies, build types and flavors. A build variant is the combination of a build type and flavor, such as `freeDebug` or `paidRelease`. Use flavors for meaningful product dimensions and build types for concerns such as debug versus release behavior.

Improve build time through measurement, build caching, appropriate modularization, avoiding unnecessary annotation processing, configuration optimization and parallel CI jobs. Never store signing credentials in source control; use protected CI secrets and restricted signing steps.