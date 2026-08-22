# 1. Basic Questions

## What are Kotlin coroutine builder functions?

**Answer**

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

**Answer**

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

**Answer**

- There is no exact one-to-one equivalent.
- `LaunchedEffect` starts a coroutine tied to Compose composition and restarts it when its keys change.
- In View-based UI, use lifecycle-aware APIs according to the requirement:
  - `lifecycleScope`
  - `viewLifecycleOwner.lifecycleScope`
  - `repeatOnLifecycle`
  - `viewModelScope` for business work

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

**Answer**

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

**Answer**

- A composable reads Compose state and that state changes.
- A parent recomposes and passes changed parameters.
- A state holder emits a new value observed by the composable.
- Unstable/changed parameters can prevent skipping.
- Incorrect state placement can cause a much larger subtree to recompose than necessary.

## What is the difference between recomposition, layout and drawing?

**Answer**

```text
Composition -> What UI exists
Layout       -> Where/how large UI is
Drawing      -> How pixels are drawn
```

- Recomposition can lead to layout/draw, but they are separate phases.
- Optimizing composition does not automatically solve every layout or rendering problem.

## Why is `LazyColumn` key important?

**Answer**

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

**Answer**

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

**Answer**

- State is data that can change over time and can cause UI updates.
- Compose observes state reads and invalidates affected scopes when the value changes.

```kotlin
var count by remember { mutableIntStateOf(0) }
```

## What is state hoisting?

**Answer**

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

## What is `derivedStateOf`?

**Answer**

- Use it when a derived value depends on frequently changing state but should only invalidate consumers when the derived result changes.

```kotlin
val showButton by remember {
    derivedStateOf { listState.firstVisibleItemIndex > 0 }
}
```

- Do not use it everywhere.
- It adds complexity and should solve a real invalidation problem.

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

**Answer**

- Keeps the latest value available to an effect without restarting the effect because the value changed.

Useful for long-lived effects where the callback/value should be current.

## What is `snapshotFlow`?

**Answer**

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

**Answer**

- Publishes Compose state to non-Compose code after successful composition.

## What is `produceState`?

**Answer**

- Bridges external asynchronous/callback-style data into Compose `State`.

## What is Compose stability?

**Answer**

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

**Answer**

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

## What is an inline function?

**Answer**

- Compiler can substitute the function body at the call site.
- Useful for higher-order functions to reduce lambda allocation/call overhead.
- Can enable `reified` type parameters.
- Excessive use can increase generated code size.

## What are `noinline` and `crossinline`?

**Answer**

- `noinline`: prevents a function parameter from being inlined.
- `crossinline`: prevents non-local returns from an inlined lambda.

## What is a reified generic?

**Answer**

- Normally generic type information is erased at runtime.
- `reified` preserves access to the type inside an inline function.

```kotlin
inline fun <reified T> Gson.fromJson(json: String): T {
    return fromJson(json, T::class.java)
}
```

## What is delegation?

**Answer**

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

**Answer**

- `out` = producer/covariant.
- `in` = consumer/contravariant.
- `*` = star projection when exact type argument is unknown.

## Why is `List<String>` assignable to `List<Any>`?

**Answer**

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

**Answer**

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

**Answer**

Use for screen state:

```kotlin
data class UiState(
    val loading: Boolean = false,
    val data: List<Item> = emptyList(),
    val error: String? = null
)
```

## When use SharedFlow?

**Answer**

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

**Answer**

- Prevents collecting when the UI is stopped.
- Automatically starts/stops collection according to lifecycle.

---

# 7. Clean Architecture

## What is Clean Architecture?

**Answer**

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

**Answer**

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

**Answer**

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

**Answer**

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

**Answer**

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

## How do you securely store tokens?

**Answer**

- Use Android Keystore-backed secure mechanisms where appropriate.
- Do not hardcode secrets.
- Never log access/refresh tokens.
- Minimize token lifetime and scope.
- Clear credentials on logout.
- Follow organizational security policies.

## What is certificate pinning?

**Answer**

- Restricts accepted certificates/public keys to expected identities.
- Can reduce certain MITM risks.
- Creates operational risks during certificate rotation.
- Must have a safe rotation and recovery strategy.

## What is OWASP MASVS?

**Answer**

- Mobile Application Security Verification Standard.
- Use it as a structured security baseline for mobile applications.

---

# 11. Performance

## How do you investigate a slow Android app?

**Answer**

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

**Answer**

- Long work on main thread.
- Blocking I/O.
- Expensive computation.
- Lock contention/deadlock.
- Slow binder operations.
- Excessive rendering/layout work.

## How do you investigate an ANR?

**Answer**

- Check Android Vitals/ANR traces.
- Inspect main thread stack.
- Look for blocking calls and lock contention.
- Reproduce if possible.
- Add tracing/metrics.
- Move appropriate work off main.
- Fix synchronization problems.
- Verify with benchmarks and production metrics.

## What is Baseline Profile?

**Answer**

- A profile of important code paths used by the app.
- Allows Android runtime to optimize frequently executed paths earlier.
- Often improves startup and runtime performance.

## What is jank?

**Answer**

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

**Answer**

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

## What is `runTest`?

**Answer**

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

**Answer**

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

## How would you improve build time?

**Answer**

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

**Answer**

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

**Answer**

Strong answer:

> "I start by clarifying the business outcome, then break the feature into technical and testable slices. I identify dependencies, risks, API readiness, design dependencies and unknowns. I estimate with the team rather than assigning estimates individually, and I make sure acceptance criteria and non-functional requirements are explicit."

## How do you handle unclear requirements?

**Answer**

- Clarify expected behavior.
- Identify edge cases.
- Write acceptance criteria.
- Create a spike for technical uncertainty.
- Document assumptions.
- Avoid starting implementation based on ambiguous requirements.

## What if product wants a feature urgently?

**Answer**

Answer:

> "I first understand the business deadline and impact. Then I separate must-have scope from nice-to-have scope, identify technical risks, and propose the smallest safe deliverable. I would not trade away security, data integrity or critical quality gates just to meet a date."

## How do you handle disagreement with Product?

**Answer**

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

**Answer**

- Understand their reasoning first.
- Compare against requirements/data.
- Prototype or benchmark if uncertain.
- Focus on trade-offs rather than authority.
- Escalate only when necessary.
- Commit to the final team decision.

---

# 21. Lead-Level Code Review Questions

## What do you look for in a PR?

**Answer**

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

**Answer**

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

**Answer**

- Give context, not only instructions.
- Start with small ownership.
- Review code with explanations.
- Encourage design discussions.
- Pair on difficult problems.
- Define measurable growth goals.
- Gradually increase responsibility.

## How do you measure whether mentoring worked?

**Answer**

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

**Answer**

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

**Answer**

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

**Answer**

Strong answer:

> "I use approved AI tools for boilerplate, test generation, refactoring ideas, documentation and exploring alternatives. I treat the output as untrusted generated code. I review it, compile it, run unit/UI tests, run static analysis and verify security and business behavior. I follow the organization's approved-tool and data-handling policies and never expose customer data, credentials or restricted source code to an unapproved service."

## How do you validate AI-generated code?

**Answer**

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

**Answer**

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

---

# 30. Rapid Revision Sheet

## Kotlin

- `inline`
- `reified`
- `noinline`
- `crossinline`
- delegation
- variance
- sealed class/interface
- data class
- scope functions
- null safety

## Coroutines

- builders
- structured concurrency
- cancellation
- exception propagation
- supervisor
- dispatchers
- `withContext`
- `async/await`

## Flow

- cold/hot
- StateFlow
- SharedFlow
- Channel
- `stateIn`
- `shareIn`
- combine/merge
- debounce
- flatMapLatest

## Compose

- composition
- recomposition
- skipping
- stability
- snapshots
- state
- state hoisting
- remember
- rememberSaveable
- effects
- keys
- layout/draw

## Android

- lifecycle
- process death
- configuration change
- ViewModel
- WorkManager
- permissions
- background work
- navigation

## Architecture

- MVVM
- MVI
- Clean Architecture
- repository
- UDF
- modularization
- offline-first
- synchronization

## Networking

- Retrofit
- OkHttp
- interceptor
- authenticator
- OAuth
- token refresh
- retry
- caching

## Security

- Keystore
- secure storage
- TLS
- pinning
- MASVS
- secrets
- secure logging

## Performance

- ANR
- memory leaks
- startup
- jank
- Perfetto
- Profiler
- Baseline Profile
- Macrobenchmark

## Testing

- JUnit
- MockK/Mockito
- Turbine
- `runTest`
- virtual time
- Compose UI testing
- instrumentation
- integration tests

## CI/CD

- Gradle
- flavors
- signing
- lint
- static analysis
- test automation
- staged rollout
- feature flags
- rollback

## Leadership

- Agile
- estimation
- planning
- prioritization
- mentoring
- code review
- stakeholder management
- conflict resolution
- incident management
- metrics

## AI

- approved tools
- prompt/context safety
- code review
- testing
- security validation
- sensitive-data handling

---

# 31. Final Interview Mindset

For every technical answer, think:

```text
What?
 ↓
Why?
 ↓
When?
 ↓
Trade-off?
 ↓
Production example?
 ↓
How would I measure it?
```

For every leadership answer:

```text
Problem
 ↓
Ownership
 ↓
Decision
 ↓
Influence
 ↓
Trade-off
 ↓
Result
 ↓
Learning
```

For architecture:

```text
Requirements
 ↓
Constraints
 ↓
Architecture
 ↓
Data/state flow
 ↓
Failure handling
 ↓
Security
 ↓
Testing
 ↓
Observability
 ↓
Rollout
 ↓
Trade-offs
```

## The most important rule

Do not try to sound like you memorized Android documentation.

Sound like an engineer who has **operated a production Android application**.

When asked "Why?", explain the trade-off.

When asked "What if it fails?", explain recovery.

When asked "How do you know?", explain metrics/testing.

When asked "Why this architecture?", explain alternatives and constraints.

When asked "How would you lead it?", explain communication, ownership and delivery.

That combination is what separates an SE III/lead-level answer from a framework-level answer.

---

# 32. Final 30-Minute Revision Checklist

## 1. Kotlin
- Explain `inline`, `reified`, `noinline`, `crossinline`.
- Explain delegation, variance and sealed hierarchies.
- Know scope functions and their return/receiver behavior.

## 2. Coroutines and Flow
- `launch` vs `async` vs `withContext`.
- Structured concurrency and cancellation.
- `coroutineScope` vs `supervisorScope`.
- Cold vs hot Flow.
- `StateFlow` vs `SharedFlow` vs `Channel`.
- `stateIn`, `shareIn`, `combine`, `merge`, `flatMapLatest`.

## 3. Compose
- Composition vs recomposition vs layout vs drawing.
- Stability, `@Stable`, `@Immutable`.
- State hoisting, `remember`, `rememberSaveable`.
- Effect APIs and `snapshotFlow`.
- `LazyColumn` keys and performance.

## 4. Architecture
- MVVM vs MVI.
- Repository and use-case boundaries.
- When Clean Architecture is useful and when it is over-engineering.
- Offline-first and source-of-truth decisions.
- Conflict resolution and synchronization.

## 5. Production Android
- ANR investigation.
- Memory leak investigation.
- Startup and jank investigation.
- Baseline Profiles and Macrobenchmark.
- Lifecycle/process death/configuration changes.

## 6. Networking and Security
- Retrofit vs OkHttp.
- Interceptor vs Authenticator.
- Token refresh concurrency.
- Retry/backoff/idempotency.
- Keystore, secure storage, TLS and certificate pinning.

## 7. Testing and CI/CD
- `runTest`, virtual time and Turbine.
- Unit vs instrumentation vs UI tests.
- Compose semantics and user-visible behavior.
- Gradle build performance.
- CI quality gates, signing, staged rollout and rollback.

## 8. SE III / Lead
- Sprint planning and estimation.
- Ambiguous requirements.
- Product disagreement.
- Senior-engineer disagreement.
- PR/code review.
- Mentoring.
- Production incidents.
- Delivery metrics.

## 9. AI-assisted development
- Approved tools only.
- Never expose customer data, credentials or restricted code to unapproved services.
- Treat AI output as untrusted.
- Compile, test, lint, security-review and human-review generated code.

# 33. Interviewer Follow-Up Drill

For every major answer, practice these five follow-ups:

1. **Why did you choose this?**
2. **What alternatives did you consider?**
3. **What happens when it fails?**
4. **How would you test it?**
5. **How would you measure whether it worked?**

For architecture questions, add:

6. **How does this behave offline?**
7. **What happens under concurrency?**
8. **How do you secure it?**
9. **How would you roll it out or roll it back?**
10. **How would you operate it in production?**