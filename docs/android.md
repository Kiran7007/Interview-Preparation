---
# Android Architecture

## What is Clean Architecture?
- Clean Architecture separates responsibilities into layers.
- It improves testability, maintainability, and changeability.
- It is most valuable when the feature is complex or spans multiple data sources.

```text
UI
 ↓
ViewModel / Presenter
 ↓
UseCase / Interactor
 ↓
Repository
 ↓
Data Sources
```

Use the level of separation justified by the feature. A small screen does not need a large number of layers.

---

## What is the Repository pattern?
- A Repository hides data access details from the rest of the app.
- It can coordinate Room, API, cache, Firebase, and memory.
- The ViewModel should not know whether data came from a database, a REST API, or a cache.

```kotlin
interface UserRepository {
    fun observeUser(): Flow<User>
}
```

---

## What is a UseCase?
- A UseCase represents a business operation.
- It keeps business rules out of the ViewModel and UI layer.

```kotlin
class TransferMoneyUseCase(
    private val repository: PaymentRepository
) {
    suspend operator fun invoke(
        from: String,
        to: String,
        amount: Long
    ) = repository.transfer(from, to, amount)
}
```

Do not create a UseCase for every trivial getter just to follow a pattern.

---

## What is dependency injection?
- Dependency injection means dependencies are provided from the outside.
- This improves testability and separation of concerns.

```kotlin
class UserViewModel(
    private val repository: UserRepository
)
```

---

## What are Hilt scopes?
- Scope should match dependency lifetime.
- Common scopes include:

```text
SingletonComponent
ActivityRetainedComponent
ViewModelComponent
ActivityComponent
FragmentComponent
```

A dependency used only by one ViewModel should not become global by default.

---

## Difference between MVC, MVP, MVVM, and MVI?
| Pattern | Core idea | Android fit |
|---|---|---|
| MVC | View, controller, model | Legacy/simple apps |
| MVP | View is abstracted; presenter handles logic | Older Android apps |
| MVVM | ViewModel owns state and presentation logic | Most modern Android apps |
| MVI | Intent → reducer → state → UI | Good for complex state-heavy flows |

Modern Android usually defaults to MVVM, with MVI for more complex stateful screens.

---

## Why should we use MVVM or Clean Architecture?
- Keep the UI layer thin.
- Reuse core business logic.
- Make logic testable without UI instrumentation.
- Reduce duplicate code and simplify maintenance.

---

## What is modularization?
- Modularization divides a codebase into logical modules.
- It improves ownership, dependency boundaries, build speed, and reuse.

```text
:app
:feature-login
:feature-payments
:core-network
:core-database
:core-ui
```

Do not create modules for every small class. Use meaningful boundaries.

---

## How do you design a repository for local + remote data?
- Use Room as the source of truth for displayed data.
- Read from local DB first.
- If data is stale or missing, fetch from the API.
- Save fresh network data to Room.

```text
UI
 ↓
ViewModel
 ↓
Repository
 ↙      ↘
Room    API
```

This gives fast reads while still refreshing when needed.

---

## What is a database transaction?
- A transaction ensures multiple writes succeed or fail together.
- It preserves consistency when related local records must move as a unit.

```text
Update account
Update transaction
Update balance
        ↓
    Transaction
```

---

## How would you secure a local database?
- Minimize sensitive data.
- Encrypt sensitive database content when required.
- Protect cryptographic keys using secure key management.
- Restrict access and avoid logging database contents.

---

## How do you handle search in a ViewModel?
- Use `debounce` to avoid extra requests on every keystroke.
- Use `flatMapLatest` or `mapLatest` to cancel outdated searches.

```kotlin
private val query = MutableStateFlow("")

val results = query
    .debounce(300)
    .distinctUntilChanged()
    .flatMapLatest { text ->
        repository.search(text)
    }
```

---

# Android Fundamentals

## What is an HTTP interceptor?
- An interceptor can inspect, modify, or add behavior to requests and responses.
- Common uses include headers, logging, metrics, and auth logic.
- Never log authorization headers, tokens, or sensitive customer data.

```text
Request
  ↓
Interceptor
  ↓
Network
  ↓
Response
```

---

## What is the difference between interceptor and authenticator?
- Interceptor adds headers or transforms requests.
- Authenticator handles authentication challenges such as 401 and refreshes tokens.

---

## How should authentication tokens be stored?
- Avoid plain `SharedPreferences` for sensitive credentials.
- Prefer Android Keystore-backed secure storage for secrets.
- Minimize what is stored.
- Clear sensitive state on logout.

---

## What is the difference between 401 and 403?
- `401 Unauthorized` means authentication is missing or invalid.
- `403 Forbidden` means the user is authenticated but lacks permission.

```text
401 → "Who are you?"
403 → "I know who you are, but you cannot do this."
```

---

## What is `collectAsStateWithLifecycle()`?
- It collects a Flow while respecting the lifecycle.
- It prevents unnecessary collection while the UI is inactive.

```kotlin
val state by viewModel.state
    .collectAsStateWithLifecycle()
```

---

## What is process death?
- Android may kill the app process when resources are needed.
- A ViewModel does not survive process death.
- Important state should be restored via saved state or persisted storage.

---

## What is the difference between Activity context and Application context?
- Activity context is tied to an Activity lifecycle.
- Application context lives as long as the process.
- Do not store an Activity context in a long-lived singleton.

---

## How do you handle configuration changes without losing data?
- ViewModel retains UI-related state across configuration changes.
- Saved state is useful for small restorable UI data.

```text
Activity recreated
 ↓
ViewModel survives
 ↓
UI is rebuilt with retained state
```

---

## What is idempotency?
- Repeating the same request should not create unintended additional effects.
- It is critical for payments and other business-critical writes.

```text
POST payment + idempotencyKey=ABC
POST payment + idempotencyKey=ABC
```

---

## How do you handle pagination?
- Offset pagination is simple but can be less reliable at scale.
- Cursor pagination is often better for large datasets.
- Android Paging 3 can help with loading, retry, refresh, and UI state.

---

## What is feature flagging?
- A feature flag controls whether functionality is enabled.
- It allows phased rollout and rapid disablement.

```kotlin
if (featureFlags.newPaymentFlow) {
    NewPaymentScreen()
} else {
    OldPaymentScreen()
}
```

---

## What is a phased rollout?
- Release to a small percentage first, then increase gradually.
- Monitor crash rate, ANR, API errors, performance, and business metrics.

```text
1%
 ↓
5%
 ↓
10%
 ↓
25%
 ↓
50%
 ↓
100%
```

---

## What is operational readiness?
- Monitoring and alerts should be in place.
- Rollback plans and ownership must be defined.
- A feature is not production-ready simply because it works locally.

---

## What is a runbook?
- A runbook explains what to do in production incidents.
- It should cover detection, investigation, mitigation, rollback, and recovery.

---

## What is crash-free rate?
- It measures how many sessions complete without crashes.
- Track by app version, device, OS version, feature, and release cohort.

---

## How would you implement offline-first behavior?
- Keep Room as the local source of truth.
- Observe data through Flow or StateFlow.
- Queue local mutations and synchronize later with WorkManager.
- Use optimistic concurrency or version checks to handle conflicts.

```text
Offline First
      ↓
Room = Source of Truth
      ↓
Flow / StateFlow
      ↓
Repository
      ↓
Outbox Pattern
      ↓
WorkManager
      ↓
Push + Pull Sync
      ↓
Conflict Detection
      ↓
Retry + Backoff
```

This keeps local reads fast while the app syncs changes when connectivity is available.

---

## How do you handle one-time events such as navigation?
- Keep durable state separate from transient events.
- Use a `SharedFlow` or one-time event stream.

```kotlin
data class UiState(
    val account: Account? = null,
    val isLoading: Boolean = false
)

sealed interface UiEvent {
    data object NavigateBack : UiEvent
    data class ShowMessage(val text: String) : UiEvent
}
```

---

## How do you reduce memory usage?
- Avoid holding Activity or View references in long-lived objects.
- Load images at display size.
- Close resources appropriately.
- Profile before optimizing.

---

## What is the role of Android SDK knowledge?
- Lifecycle
- Context
- Activity/Fragment
- Services
- Permissions
- Saved state
- Background execution
- Notifications
- Configuration changes
- OS behavior

---

## Activity lifecycle
```text
onCreate
onStart
onResume
onPause
onStop
onDestroy
```

Key concepts:
- configuration changes
- process death
- saved state
- ViewModel retention
- back stack behavior

---

## Fragment lifecycle
- A Fragment has its own lifecycle.
- The Fragment view can be destroyed while the Fragment instance remains.
- Clear ViewBinding in `onDestroyView()`.

```kotlin
private var _binding: FragmentHomeBinding? = null

override fun onDestroyView() {
    _binding = null
    super.onDestroyView()
}
```

---

## Why collect Flow with `repeatOnLifecycle`?
- Prevents collection while the UI is stopped.
- Automatically starts and stops collection with lifecycle state.

---

## What are the building blocks of an Android app?
- Activity
- Fragment
- Service
- BroadcastReceiver
- ContentProvider
- Views and layouts
- AndroidManifest.xml

Choose the component whose lifecycle matches the work. Avoid running long-lived work from an Activity unnecessarily.

---

## How would you approach a moderately complex feature from requirements to production?
```text
Requirements
 ↓
Clarify edge cases
 ↓
Architecture/design
 ↓
Security review
 ↓
Implementation
 ↓
Unit tests
 ↓
Integration/UI tests
 ↓
CI quality gates
 ↓
Phased release
 ↓
Monitoring
 ↓
Post-release review
```

---

## What is the difference between Retrofit and OkHttp?
- Retrofit provides typed API abstractions.
- OkHttp handles HTTP transport, connection management, and interceptors.

---

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

Use a single-flight refresh strategy so concurrent requests do not race. Retry only transient failures with exponential backoff and jitter; avoid blindly retrying non-idempotent writes.

---

## What are shared libraries in Android?
- Shared libraries contain functionality used by multiple features or teams.
- Examples: networking, security utilities, design system, analytics, logging.

---

# Android Security

## What is certificate pinning?
- TLS validates the certificate chain by default.
- Certificate pinning adds a stricter check against expected certificates or public keys.
- It can reduce some MITM risks but increases operational complexity during rotation.

```text
App
 ↓
TLS validation
 ↓
Pinned cert/public key check
 ↓
Server
```

---

## What is the Android Keystore?
- Android Keystore provides a secure way to manage cryptographic keys.
- Keys can be hardware-backed on supported devices.
- It allows encryption and signing without exposing key material directly.

---

## What is certificate transparency?
- Certificate Transparency provides public logs of issued certificates.
- It helps detect improperly issued certificates.
- It complements normal TLS validation rather than replacing it.

---

## Why do Android apps need permissions like `INTERNET` or `LOCATION`?
- Android permissions protect sensitive resources and user privacy.
- Some permissions require runtime user approval.

| Permission | Why needed |
|---|---|
| `INTERNET` | Network access |
| `ACCESS_FINE_LOCATION` | Precise device location |
| `CAMERA` | Camera access |
| `READ_MEDIA_IMAGES` | Access to user photos |

---

## What are the permission protection levels in Android?
| Protection level | Meaning | Example |
|---|---|---|
| Normal | Low-risk, granted automatically | `INTERNET` |
| Dangerous | Sensitive resource, runtime approval | `CAMERA`, `ACCESS_FINE_LOCATION` |
| Signature | Only granted to apps signed with same cert | Custom IPC permission |

---

## How do you protect API keys and prevent reverse engineering?
- Do not hardcode keys in source code, `strings.xml`, or git-committed config.
- Use `BuildConfig` and CI-managed environment variables.
- Keep the real third-party key on the backend when possible.
- Use R8/ProGuard to obfuscate and remove unused code.
- Consider tamper detection and Play Integrity API for stronger defense.

```kotlin
buildTypes {
    release {
        isMinifyEnabled = true
        isShrinkResources = true
    }
}
```

---

## What are common security risks in Android apps?
- Storing data in plain text.
- Using HTTP instead of HTTPS.
- Hardcoding API keys in code.
- Weak input validation.
- Outdated dependencies with known vulnerabilities.

---

## How can you protect your API keys in Android?
- Do not hardcode keys in code or `strings.xml`.
- Use `BuildConfig` with Gradle.
- Store keys on the server and use token-based auth.
- Use NDK only as an additional defense, not as the primary security model.

---

## How can you prevent reverse engineering of your APK?
- Use ProGuard or R8.
- Remove unused code and classes.
- Avoid storing secrets or logic in the app.
- Sign with a release keystore.
- Monitor unauthorized APKs via Play Console.

---

## How can you secure communication between app and server?
- Use HTTPS/TLS.
- Validate certificates and consider pinning when appropriate.
- Never log sensitive data.
- Prefer secure authentication flows such as OAuth2 or JWT.

---

## What is OWASP MASVS?
- The Mobile Application Security Verification Standard.
- It is a structured baseline for secure mobile development.

---

## How do you securely store tokens?
- Use Android Keystore-backed secure storage where appropriate.
- Never log access or refresh tokens.
- Minimize token lifetime and scope.
- Clear credentials during logout.

---

# Jetpack Compose

## What is Jetpack Compose?
- Jetpack Compose is Android’s modern UI toolkit.
- It is declarative and built around Kotlin composable functions.
- It reduces boilerplate and improves state-driven UI development.

---

## What is a Composable function?
- A Composable is a function marked with `@Composable`.
- It describes part of the UI.

```kotlin
@Composable
fun Greeting(name: String) {
    Text(text = "Hello, $name")
}
```

---

## What is recomposition?
- Recomposition occurs when Compose recalculates UI because state changed.
- It only redraws the affected parts of the tree.

---

## What is State in Compose?
- State holds data that changes over time.
- UI updates automatically when the state changes.

```kotlin
val count = remember { mutableStateOf(0) }
```

---

## What is `remember` and `rememberSaveable`?
- `remember` retains state across recompositions.
- `rememberSaveable` retains state across configuration changes using a `Bundle`.

---

## What is a `Modifier` in Jetpack Compose?
- `Modifier` decorates a composable or changes behavior.
- Common uses include padding, background, size, click handling, and layout modifications.

```kotlin
Text(
    text = "Hello",
    modifier = Modifier.padding(16.dp)
)
```

---

## What is a `Scaffold` in Jetpack Compose?
- `Scaffold` provides a standard material layout structure.
- It includes top bars, bottom bars, floating action buttons, and snackbars.

---

## What is `SideEffect` in Jetpack Compose?
- `SideEffect` is for side effects that occur during recomposition.
- It is useful for analytics, logging, or external state updates that must happen when the composition runs.

---

## What are stable and unstable types in Compose?
- Compose uses stability information to reason about whether parameters are likely to change.
- Stable immutable models can reduce unnecessary recomposition.
- Prefer immutable UI models when possible.

---

## How do you preserve scroll position in Compose?
- Use `rememberLazyListState()`.
- Pass it to `LazyColumn` or `LazyRow`.

```kotlin
val listState = rememberLazyListState()
LazyColumn(state = listState) { /* items */ }
```

---

## How do you debug excessive recompositions?
- Use Layout Inspector and recomposition tracing.
- Look for unstable parameters, repeated `collectAsState()`, and missing `remember`.
- Break state into smaller units and pass only needed values.

---

## How do you make a Compose screen accessible?
- Use meaningful semantics and content descriptions.
- Ensure touch targets are large enough.
- Respect contrast, focus order, and TalkBack behavior.

---

## Compose Deep Dive

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

# Unit and UI Testing

## What is unit testing?
- Unit tests validate small pieces of logic in isolation.
- They are fast and usually run on the JVM.

```kotlin
@Test
fun `invalid amount returns error`() {
    // arrange
    // act
    // assert
}
```

---

## What is an instrumentation test?
- Instrumentation tests run on a device or emulator.
- They are useful for Android framework integration, Room behavior, and end-to-end device flows.

---

## What is a UI test?
- UI tests verify user-visible behavior.
- Prefer verifying actual user-visible outcomes rather than implementation details.

```kotlin
composeTestRule
    .onNodeWithText("Pay")
    .performClick()
```

---

## What is the Android test pyramid?
- Many unit tests
- Fewer integration tests
- A small set of critical UI tests

```text
UI tests
  ↓
Integration tests
  ↓
Unit tests
```

---

## Which libraries are commonly used?
- JUnit
- MockK or Mockito
- Truth, AssertJ, or Hamcrest
- Robolectric for JVM Android tests
- Turbine for Flow testing
- `runTest` for coroutine timing

---

## What is `runTest`?
- It provides a coroutine test environment with virtual time.
- It allows deterministic testing of delays and scheduling.

```kotlin
@Test
fun `search updates state`() = runTest {
    viewModel.search("android")
    advanceUntilIdle()
    assertEquals(expected, viewModel.uiState.value.data)
}
```

---

## What is Turbine?
- Turbine is useful for testing Flow emissions.
- It allows sequential assertions on state transitions.

---

## What should you UI test?
- Login
- Payments
- Navigation
- Critical user journeys
- Accessibility-sensitive behavior

Do not put every business rule into UI tests. Keep most logic in fast unit tests.

---

## What is a good testing strategy?
```text
Unit tests
   ↓
Business logic / ViewModel

Integration tests
   ↓
Repository / DB / networking boundaries

UI tests
   ↓
Critical user journeys
```

---

# Bluetooth Low Energy

## What is Bluetooth Low Energy?
- BLE is a low-power wireless technology for short-range communication.
- It is optimized for battery life and periodic data exchange.
- Common use cases include wearables, smart locks, sensors, and proximity features.

```text
Phone
  ↓
BLE GATT
  ↓
Peripheral / Sensor
```

Use BLE when low power and small payloads matter more than throughput.

---

## When should you use BLE instead of Wi-Fi or classic Bluetooth?
- Use BLE for low-power, low-bandwidth communication with nearby devices.
- Use Wi-Fi for internet-connected or high-bandwidth transfers.
- Use classic Bluetooth for larger streaming or audio-like workloads.

---

# Performance and Reliability

## What is a memory leak?
- A memory leak occurs when an object remains reachable even though it is no longer needed.
- Common Android causes include lifecycle misuse, singleton references, leaked views, and unbounded caches.

```text
Singleton
   ↓
Activity
   ↓
Activity cannot be collected
```

---

## What are Baseline Profiles?
- Baseline Profiles tell Android which code paths are important.
- They can improve startup and runtime performance by optimizing critical paths earlier.

---

## What is Android startup performance?
- Startup performance is how long it takes before the app becomes usable.
- Common problems: heavy `Application` initialization, disk work, large dependency setup, DB work.
- Measure before optimizing.

---

## What is Macrobenchmark?
- Macrobenchmark measures larger user journeys on real devices/emulators.
- It is useful for startup, scrolling, and other realistic performance tests.

---

## What is ANR rate?
- ANR rate measures application-not-responding events.
- It is a key stability metric alongside startup performance and crashes.

---

## What is overdraw?
- Overdraw occurs when the same pixels are drawn multiple times.
- Excessive overdraw can increase rendering cost.

---

## What is the difference between a crash and an ANR?
- Crash: the app or component fails and terminates.
- ANR: the app is blocked and does not respond in time.

```text
Crash → application failure
ANR   → application unresponsive
```

---

## How do you load large bitmaps?
- Decode images close to display size.
- Use an image library with caching.
- Prefer thumbnails, sampling, and appropriate formats.
- Avoid retaining many full-resolution images.

---

## What is an ANR, and how can you prevent it?
- An ANR happens when the UI thread is blocked for too long.
- Avoid long work on the main thread.
- Move heavy tasks to background threads and use lifecycle-aware APIs.

---

## How do you reduce battery consumption?
- Avoid unnecessary polling.
- Sync only when needed and under suitable constraints.
- Use WorkManager, batching, and Doze/Standby-aware logic.

---

## How do you investigate an ANR?
Look at:
- ANR traces
- Android Vitals
- Play Console
- Perfetto
- CPU profiler

Typical causes:
- disk I/O on main thread
- network calls on main thread
- large computations
- lock contention
- binder delays

---

## How do you investigate a production performance regression?
```text
Metric regression
 ↓
Identify affected version
 ↓
Compare with previous release
 ↓
Find affected devices/OS
 ↓
Inspect traces and telemetry
 ↓
Reproduce
 ↓
Fix
 ↓
Benchmark
 ↓
Gradual release
```

---

## How do you investigate UI jank?
Look for:
- long main-thread work
- expensive composition
- excessive recomposition
- large list rendering
- image decoding
- layout complexity

Use:
- Compose/Layout Inspector
- CPU profiler
- Perfetto
- Macrobenchmark
- Frame timing

---

## What are common Android leaks?
- Singleton holding Activity or Context
- Fragment retaining a binding after `onDestroyView`
- Long-lived listeners or callbacks
- Coroutine outliving required lifecycle
- Static references

---

## How do you detect leaks?
- LeakCanary
- Android Studio Memory Profiler
- Heap dumps
- Allocation tracking

---

# CI/CD

## What is CI/CD in Android?
- Continuous Integration automatically builds and tests changes in a shared repository.
- Continuous Delivery packages validated builds for internal or external testing.
- Continuous Deployment can publish automatically after quality gates.

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
Instrumented tests
 ↓
Security checks
 ↓
Build AAB/APK
 ↓
Sign
 ↓
Internal testing
 ↓
Staged rollout
 ↓
Monitor + rollback if needed
```

---

## Why is CI/CD important in Android development?
- Faster feedback and shorter release cycles.
- Earlier bug detection.
- Consistent builds.
- Reduced manual work.
- Better collaboration across teams.

---

## What is Gradle?
- Gradle is the Android build system.
- It manages project configuration, dependencies, and packaging.
- Project-level config applies broadly; module-level config is specific to a module.

---

## What are build variants and product flavors?
- Build variants combine build type and flavor.
- Example: `freeDebug` or `paidRelease`.
- Build types usually cover debug vs release behavior.

---

## How would you improve build time?
- Use Gradle build cache.
- Reduce unnecessary annotation processing.
- Keep module boundaries coherent.
- Use appropriate plugins and caching.
- Parallelize independent jobs.
- Run targeted tests locally and comprehensive checks in CI.

---

## What is a release strategy?
- Use feature flags.
- Stage rollout gradually.
- Validate with internal and beta testing.
- Monitor crash-free sessions, ANR rate, startup performance, and business metrics.
- Keep rollback paths ready.

---

## Git-related questions to be ready for
- How do you handle merge conflicts?
- What is the difference between merge and rebase?
- How do you structure branches for feature work and release work?
- How do you handle hotfixes?
- How do you keep branch hygiene and release stability consistent?

---

# AI-Assisted Development

## How do you use AI safely?
- Use approved tools only.
- Treat generated code as untrusted.
- Review it carefully and verify business logic.
- Run compile, tests, lint, and security checks.
- Do not expose confidential data or credentials to unapproved services.

```text
AI suggestion
 ↓
Human review
 ↓
Compile
 ↓
Tests
 ↓
Static/security analysis
 ↓
Code review
 ↓
Merge
```

---

## How do you validate AI-generated code?
- Check correctness against requirements.
- Verify compile and runtime behavior.
- Run unit and UI tests.
- Review for security and architecture issues.

---

## Your Android UI Automation Agent
- Search the project for the target Composable and existing test patterns.
- Inspect actual semantics, parameters, and state flows.
- Generate tests aligned to project conventions.
- Compile and run the tests.
- Correct issues and validate against real behavior.

```text
Developer request
 ↓
Agent searches project
 ↓
Find target UI and testing patterns
 ↓
Generate Compose UI test
 ↓
Compile/test
 ↓
Fix failures
 ↓
Final validation
```

The key is to validate against real source and actual behavior rather than trusting generated code blindly.

---

# Behavioral / Leadership / Scenario Based Questions

## How do you handle disagreement with Product or another engineer?
- Understand the goal and constraints.
- Discuss trade-offs using requirements and evidence.
- Present engineering impact clearly.
- Align on the final decision and document it.

---

## How do you handle sprint planning?
- Clarify the business outcome.
- Break work into testable slices.
- Identify risks, dependencies, and unknowns.
- Estimate with the team and define acceptance criteria.

---

## What do you look for in a code review?
- Correctness and edge cases
- Dependency direction and architecture
- Testability and maintainability
- Performance and security impact
- Clear naming and reasoning

---

## What metrics matter for delivery?
- Cycle time
- Lead time
- Deployment frequency
- Change failure rate
- Mean time to recovery
- Defect escape rate
- Crash-free users
- ANR rate
- Build time

Do not optimize one metric at the expense of quality or stability.

---

## How would you design a banking dashboard or payment flow?
```text
UI
 ↓
ViewModel
 ↓
UseCase
 ↓
Repository
 ↙      ↘
Room    API
```

Key concerns:
- Authentication and authorization
- Secure token handling
- Idempotency
- Loading/error/retry states
- Auditability
- Monitoring
- Feature flags and rollback support

---

## Scenario: Crash spike due to lifecycle issues
- Common issue: coroutine or callback survives a Fragment or Activity lifecycle.
- Fix: use lifecycle-aware collection and scopes.
- Use `viewLifecycleOwner.lifecycleScope` and `repeatOnLifecycle`.
- Cancel jobs properly and move business logic to the ViewModel when possible.

---

## Scenario: Deep link handling breaking navigation
- Validate deep link arguments before navigation.
- Declare deep links correctly in the manifest and navigation graph.
- Handle cold-start, warm-start, and `onNewIntent()` flows safely.
- Use a valid back stack and avoid duplicate navigation events.

---

## Scenario: API instability and token refresh issues
- Separate client-side, auth, and server-side failures.
- Use a single-flight token refresh path.
- Retry only transient errors.
- Respect `Retry-After` on 429.
- Use idempotency keys for financial writes.

---

## Scenario: Slow build time in a multi-module project
- Improve module boundaries.
- Reduce inter-module coupling.
- Use Gradle caching and remote cache.
- Enable parallel execution.
- Replace KAPT with KSP where possible.

---

## Scenario: Memory leak causing gradual slowdown
- Look for singleton or listener references to Activity/Fragment context.
- Investigate binding leaks, adapters, and unbounded caches.
- Use LeakCanary and Memory Profiler.
- Enforce lifecycle cleanup and validate with soak tests.

---

## Scenario: Battery drain due to background work
- Check polling, wake locks, high-frequency location updates, and background sync.
- Replace polling with push or batching when possible.
- Respect Doze and App Standby.
- Use WorkManager with constraints.

---

## Scenario: Large list causing OOM
- Use Paging 3.
- Load small chunks at a time.
- Decode images at display size.
- Use bounded caches and `DiffUtil` with stable IDs.

---

## Scenario: Offline-first product requirements
- Room is the local source of truth.
- Queue user mutations in an outbox.
- Synchronize when online.
- Handle conflict resolution explicitly and keep idempotency on retries.

---

## Release strategy checklist
- Feature flags
- Internal and beta testing
- Staged rollout
- Monitoring and rollback
- Crash-free sessions
- ANR rate
- Startup and performance checks

---