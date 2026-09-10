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

## What are MVVM, ViewModel, LiveData, StateFlow, Repository, and UseCase?

- **MVVM:** The UI renders state exposed by a ViewModel; the ViewModel coordinates use cases; repositories abstract data sources.
- **ViewModel:** Retains screen state across configuration changes and must not hold Activity/View references. It does not survive process death by itself.
- **LiveData:** A lifecycle-aware observable value, especially useful in legacy XML/View screens.
- **StateFlow:** A coroutine-based hot stream representing current state; collect it with `repeatOnLifecycle` in Views or Compose lifecycle APIs.
- **Repository:** Owns data access and hides API, Room, Firebase or cache details from callers.
- **UseCase:** Encapsulates one meaningful business operation and is valuable when logic is reused or complex; it is not mandatory ceremony for every trivial operation.

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
Benefits:

- Faster incremental builds.
- Clear ownership.
- Better dependency boundaries.
- Parallel team development.
- Reusable libraries.
- Easier testing.

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

---

## What is the difference between Activity context and Application context?
- Activity context is tied to an Activity lifecycle.
- Application context lives as long as the process.
- Do not store an Activity context in a long-lived singleton.

---


## What is Gradle?
- Gradle is the Android build system.
- It manages project configuration, dependencies, and packaging.
- Project-level config applies broadly; module-level config is specific to a module.

---

## What is the difference between Project-level and Module-level build.gradle?

#### **Project-level build.gradle** 
- Applies to the entire project.
- Gradle version
- Repositories
- Classpath for plugins

#### **Module-level build.gradle** 
- Specific to each app/module.
- Dependencies (`implementation`, `api`, etc.)
- Build types (`debug`/`release`)
- Product flavors
- Android SDK version

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

## HTTP Polling and WebSocket
| Feature          | HTTP Polling                 | WebSocket                            |
| ---------------- | ---------------------------- | ------------------------------------ |
| Connection       | New HTTP request repeatedly  | One persistent connection            |
| Communication    | Client → Server              | **Bidirectional**                    |
| Server can push? | ❌ Not directly               | ✅ Yes                                |
| Real-time        | ❌ Near real-time             | ✅ Real-time                          |
| Network overhead | Higher                       | Lower after connection               |
| Latency          | Depends on polling interval  | Very low                             |
| Battery impact   | Higher, especially on mobile | Generally lower for frequent updates |
| Implementation   | Simple                       | More complex                         |
| Best for         | Infrequent updates           | Frequent real-time updates           |


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

## What is process death?
- Android may kill the app process when resources are needed.
- A ViewModel does not survive process death.
- Important state should be restored via saved state or persisted storage.

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
- Before release, define:
    1. Monitoring
    2. Alerts
    3. Rollback process
    4. Feature flag strategy
    5. Ownership
    6. Runbook
    7. Known failure modes
- A feature is not production-ready simply because the code works locally.

---

## What is a release strategy checklist?
- Feature flags.
- Staged/phased rollout.
- Internal/beta testing.
- Monitoring.
- Rollback/disable mechanisms.
- Crash-free sessions/users.
- ANR rate.
- startup performance.
- defect escape rate.

---

## What is a runbook?
- A runbook explains what to do in production incidents.
- It should cover detection, investigation, mitigation, rollback, and recovery.

---

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

## What is `PeriodicWorkRequest`, and what are WorkManager states and constraints?

- `PeriodicWorkRequest` is for deferrable recurring work such as synchronization, log upload, cache cleanup, or periodic content refresh. 
- Its minimum interval is 15 minutes and execution is inexact because WorkManager respects constraints and system battery policy. 
- It is not suitable for exact alarms or immediate user-visible work.

WorkManager states are:

- `ENQUEUED`: waiting to run or waiting for constraints.
- `RUNNING`: currently executing.
- `SUCCEEDED`: completed successfully.
- `FAILED`: permanently failed.
- `BLOCKED`: waiting for prerequisite work.
- `CANCELLED`: explicitly cancelled.

Constraints can require network availability, charging, battery-not-low, or storage-not-low. Observe work with `WorkInfo` through LiveData or Flow, and configure retry/backoff in the Worker for transient failures. Do not promise exact timing to product stakeholders.

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
- Use lifecycle-aware components.

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

## Can `onDestroy()` be called without `onPause()` and `onStop()`?

Yes. If an Activity calls `finish()` during `onCreate()`, it may be destroyed without becoming visible, so `onPause()` and `onStop()` are not necessarily called. Code must not assume every lifecycle callback pair occurs for an Activity that never reaches the started or resumed state.

---

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

---

## Explain the Android application and Activity lifecycles.

- `Application.onCreate()` runs once when the process is created and is appropriate for lightweight, process-wide initialization.
- `onTerminate()` is not a reliable production-device callback. 
- `onTrimMemory()` communicates memory pressure and is the useful callback for releasing caches or other reclaimable resources.

- An Activity commonly moves through:

```text
onCreate -> onStart -> onResume -> onPause -> onStop -> onDestroy
```

- Use `onCreate()` for initial setup, `onStart()`/`onStop()` for visibility, and `onResume()`/`onPause()` for foreground interaction. 
- Configuration changes recreate the Activity, while process death can remove both the Activity and its ViewModel.
- Use ViewModel for screen state and saved state mechanisms for small restorable UI state.

---

## What are intent filters?

- Intent filters declare the actions, categories and data types a component can handle. Android uses them to resolve implicit intents. A web-link filter, for example, may declare `ACTION_VIEW`, the `DEFAULT` category and HTTP/HTTPS data schemes.
- Do not use filters as an authorization mechanism: any matching application may be offered the intent, and incoming data must still be validated.

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

## What are the building blocks of an Android app?

- **Activity:** A screen-level entry point for user interaction and lifecycle management.
- **Fragment:** A reusable UI and lifecycle component hosted by an Activity or another Fragment.
- **Service:** A component for work that should continue without a visible UI. Modern apps should prefer WorkManager for deferrable, guaranteed work and foreground services only when user-visible ongoing work is required.
- **BroadcastReceiver:** A short-lived handler for system or application broadcasts.
- **ContentProvider:** A controlled, URI-based data-sharing boundary between applications.
- **Views and layouts:** The traditional UI hierarchy, created in XML or code. Compose provides a declarative alternative using composables and layout primitives.
- **AndroidManifest.xml:** Declares components, capabilities, permissions, intent filters and application metadata.

---

## What are Loaders in Android?

- Loaders were lifecycle-aware APIs introduced in API 11 for asynchronous data loading, commonly with `CursorAdapter` and `LoaderManager`. They could reconnect after configuration changes and avoid repeated queries.
- They are legacy APIs today; use Room with `Flow`, ViewModel, and lifecycle-aware collection for new code. 
- The underlying principle remains valid: database or provider work must not block the main thread and collection should follow the UI lifecycle.

---

## How would you approach a moderately complex feature from requirements to production?
- Clarify expected behavior.
- Identify edge cases.
- Write acceptance criteria.
- Create a spike for technical uncertainty.
- Document assumptions.
- Avoid starting implementation based on ambiguous requirements.

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

## What are Activity launch modes?

- **standard:** Creates a new instance for every launch.
- **singleTop:** Reuses the instance only when it is already at the top and delivers the Intent through `onNewIntent()`.
- **singleTask:** Reuses an existing instance in the task, removes the activities above it, and calls `onNewIntent()`.
- **singleInstance:** Places the Activity in its own task, isolating it from other Activities.

Choose launch modes deliberately. For most navigation, standard behavior plus an explicit back-stack policy is easier to reason about. Notification and deep-link flows often use flags such as `FLAG_ACTIVITY_CLEAR_TOP` or a suitable navigation graph policy instead of broadly applying `singleTask`.

---

## What is ConstraintLayout?

- ConstraintLayout positions views through relationships to the parent or other views. 
- Chains support distribution, guidelines support alignment, and barriers respond to dynamic content. It can reduce deeply nested hierarchies, but it is not automatically faster than every alternative; measure layout cost and choose the simplest hierarchy that expresses the UI.

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

## What is screenshot protection?
- Android can restrict screenshots for sensitive screens using appropriate window flags.
- Use it where the security requirement calls for preventing screenshots or screen capture.

```kotlin
window.setFlags(
    WindowManager.LayoutParams.FLAG_SECURE,
    WindowManager.LayoutParams.FLAG_SECURE
)
```

---

## How can you securely store sensitive data in an Android app?
You should never store sensitive data (like passwords or tokens) in plain text. Instead:

- Use EncryptedSharedPreferences for small data like tokens.
- Use Android Keystore to store cryptographic keys securely.
- Avoid storing sensitive info in internal or external storage.

---

## What are common security risks in Android apps?
Some common risks:

- Storing data in plain text.
- Using HTTP instead of HTTPS.
- Hardcoding API keys in code.
- Not validating inputs (leading to injection attacks).
- Using outdated libraries with vulnerabilities.

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

---

## What causes recomposition?

- A composable reads Compose state and that state changes.
- A parent recomposes and passes changed parameters.
- A state holder emits a new value observed by the composable.
- Unstable/changed parameters can prevent skipping.
- Incorrect state placement can cause a much larger subtree to recompose than necessary.

---

## What is the difference between recomposition, layout and drawing?

```text
Composition -> What UI exists
Layout       -> Where/how large UI is
Drawing      -> How pixels are drawn
```

- Recomposition can lead to layout/draw, but they are separate phases.
- Optimizing composition does not automatically solve every layout or rendering problem.

---

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

---

## `remember` vs `rememberSaveable`

- `remember` survives recomposition while the composition remains alive.
- `rememberSaveable` uses saved-state mechanisms to restore supported values after recreation.
- Business/domain state should generally belong in a ViewModel or other state holder.

```kotlin
var query by remember { mutableStateOf("") }

var selectedTab by rememberSaveable { mutableIntStateOf(0) }
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

## Why did you create a separate Fragment for Compose?

Strong answer:


Be ready to discuss:
- ComposeView inside an existing Fragment
- Fragment hosting a Compose screen
- Full Compose navigation
- Migration strategy
- Lifecycle ownership
- Back navigation
- ViewBinding/XML coexistence

---

## Why collect Flow with `repeatOnLifecycle`?
- Prevents collection while the UI is stopped.
- Automatically starts and stops collection with lifecycle state.

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

## What are stable and unstable types in Compose?
- Compose uses stability information to reason about whether parameters are likely to change.
- Stable parameters can help Compose skip unnecessary recomposition.
- Mutable or poorly designed types can make stability harder to determine.
- Prefer immutable UI models where possible.

```kotlin
data class UserUiModel(
    val id: String,
    val name: String
)
```

- The goal is not to add annotations blindly. The data model should actually satisfy the stability contract.

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
- Use composition tracing and CPU profiling.
- Look for unstable parameters, repeated `collectAsState()`, and missing `remember`.
- Break state into smaller units and pass only needed values.
- Use `derivedStateOf`, `remember`, and stable immutable models.

---

## How do you make a Compose screen accessible?
- Use meaningful semantics and content descriptions.
- Ensure touch targets are large enough.
- Respect contrast, focus order, and TalkBack behavior.

```kotlin
Modifier.semantics {
    contentDescription = "Account balance"
}
```

---

## Compose Deep Dive

## What is state in Compose?

- State is data that can change over time and can cause UI updates.
- Compose observes state reads and invalidates affected scopes when the value changes.

```kotlin
var count by remember { mutableIntStateOf(0) }
```

- When `count.value` changes, any UI that depends on it updates automatically.

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

## What is SideEffect in Jetpack Compose?
- Publishes Compose state to non-Compose code after successful composition.
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

## What is `produceState`?

- Bridges external asynchronous/callback-style data into Compose `State`.

---

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
- Know:
    1. semantic tree
    2. `testTag`
    3. text/content description
    4. node matchers
    5. actions
    6. assertions
    7. accessibility semantics

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

## What is the difference between Unit Tests and Instrumentation Tests in Android?

| Unit Test | Instrumentation Test |
| :--- | :--- |
| Runs on JVM | Runs on a real device/emulator |
| Fast | Slower due to UI/device interaction |
| Tests logic in isolation | Tests integration, UI, and end-to-end |
| Uses JUnit/Mockito | Uses Espresso, UI Automator, etc. |

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

## Unit vs instrumentation vs UI tests

- `Unit` - Fast, JVM-based, business logic/ViewModel/use case. It runs on the JVM and are fast because they don't require a device/emulator.
- `Instrumentation` - Runs on Android environment and is useful for framework/integration behavior.
- `UI` - Verifies actual user interaction and UI behavior.

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

## Which tools/libraries are used for Unit Testing in Android?
- **JUnit** – Base library for writing tests.
- **Mockito / MockK** – For mocking dependencies.
- **Truth / AssertJ / Hamcrest** – Assertion libraries.
- **Robolectric** – Allows you to run Android SDK code in JVM unit tests.
- **Turbine** – For testing Kotlin Flow.
- **Kotlin Test DSL** – For idiomatic Kotlin test writing.

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
```

```text
Integration tests
   ↓
Repository / DB / networking boundaries
```

```text
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
- Singleton holding Activity/Context.
- Fragment retaining binding after `onDestroyView`.
- Long-lived listener/callback.
- Handler/Runnable retaining an object.
- Coroutine running beyond the required lifecycle.
- Static references.
- Incorrect lifecycle ownership.

```text
Singleton
   ↓
Activity
   ↓
Activity cannot be collected
```

---

## How do you detect leaks?

- LeakCanary.
- Android Studio Memory Profiler.
- Heap dumps.
- Allocation tracking.
- Reproduce navigation cycles and inspect retained objects.

---

## What are Baseline Profiles?
- Baseline Profiles tell Android which code paths are important.
- They can improve startup and runtime performance by optimizing critical paths earlier.

---

## What is Android startup performance?
- Startup performance is how long it takes before the app becomes usable.
- Common problems: 
    1. Remove unnecessary initialization from `Application`.
    2. Lazy-load noncritical dependencies.
    3. Avoid synchronous disk/database work on startup.
    4. Defer analytics/SDK initialization where allowed.
    5. Use Baseline Profiles.
    6. Measure using startup benchmarks and production telemetry.
    7. The first step should be profiling, not guessing.

## How would you reduce Android app startup time?
- Remove unnecessary initialization from `Application`.
- Lazy-load noncritical dependencies.
- Avoid synchronous disk/database work on startup.
- Defer analytics/SDK initialization where allowed.
- Use Baseline Profiles.
- Measure using startup benchmarks and production telemetry.
- The first step should be profiling, not guessing.

---

## What is Macrobenchmark?
- Macrobenchmark measures larger user journeys on real devices/emulators.
- It is useful for startup, scrolling, and other realistic performance tests.

```text
Launch app
 ↓
Navigate
 ↓
Scroll
 ↓
Measure performance
```

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

## What does `high-quality user experience across devices and OS versions` mean?
- Responsive layouts
- Accessibility
- Correct lifecycle behavior
- Reliable offline/error states
- Good startup and rendering performance
- Proper font scaling
- Device/OS compatibility
- Safe background behavior
- Consistent navigation

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

## What are the risks of AI-generated code?
- Possible risks:
    1. Incorrect APIs
    2. Security vulnerabilities
    3. Poor architecture
    4. Hallucinated behavior
    5. License/IP concerns
    6. Sensitive data exposure
    7. Hidden edge cases
- The developer remains responsible for the final code.

--- 

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

# Behavioral / Leadership / Scenario Based Questions

## How do you handle an architecture disagreement?
- Understand the other proposal.
- Compare trade-offs.
- Use requirements and measurable constraints.
- Prototype when uncertainty is high.
- Align with the team.
- Document important decisions.
- Avoid making the discussion about who is technically right.

---

## How would you handle a server response that is successful but the local database update fails?
- Do not pretend the operation completed locally.
- Capture the failure.
- Retry or recover according to the feature’s consistency requirements.
- Keep the UI state accurate.
- Log safe diagnostic information.
- Consider transactional persistence for related writes.

---

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

---

## How do you mentor junior developers?

- Give context, not only instructions.
- Start with small ownership.
- Review code with explanations.
- Encourage design discussions.
- Pair on difficult problems.
- Define measurable growth goals.
- Gradually increase responsibility.

---

## How do you measure whether mentoring worked?

- Increased independent ownership.
- Better PR quality.
- Reduced repeated defects.
- Faster delivery of appropriately scoped work.
- Engineer can explain design decisions independently.

---

## How do you handle a disagreement with another senior engineer?

- Understand their reasoning first.
- Compare against requirements/data.
- Prototype or benchmark if uncertain.
- Focus on trade-offs rather than authority.
- Escalate only when necessary.
- Commit to the final team decision.

---

## How do you handle a PR from a junior engineer with problems?

- Do not rewrite everything yourself.
- Explain the reasoning.
- Identify high-risk issues clearly.
- Separate blocking issues from suggestions.
- Pair when useful.
- Encourage the engineer to make the change.
- Follow up to ensure learning.

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

## How would you prevent double payment?

- Disable duplicate UI submission.
- Generate a client/request idempotency key.
- Send it with the request.
- Server guarantees idempotent processing.
- Persist pending transaction state when necessary.
- Reconcile status rather than blindly retrying an unknown result.

**Important:** UI-level disabling alone is not enough.

---

## What is your approach when supporting multiple Android OS versions?
- Use supported APIs according to min/target SDK.
- Guard newer APIs with version checks when required.
- Test behavior across important OS/device combinations.
- Avoid assuming behavior is identical across versions.
- Monitor production issues by OS version.

```kotlin
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.X) {
    // New API
}
```

---

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


## How do you investigate a crash?
```text
Crash report
 ↓
Stack trace
 ↓
Affected version/device
 ↓
Reproduction
 ↓
Root cause
 ↓
Fix
 ↓
Regression test
 ↓
Monitor release
```

---

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

---

## Scenario: Crash spike due to lifecycle issues
You are working on a modular app with multiple teams contributing. After a recent release:

- Crash rate increased significantly.
- Common crash: `IllegalStateException: Fragment not attached to a context`.
- Occurs during navigation or screen rotation.
- App uses Fragments, coroutines, and ViewBinding.

How would you debug and fix this?

> I would approach this as a lifecycle misalignment problem between UI components and async operations.

### Root cause identification
Typical issue:

- Coroutine launched in Fragment scope
- Fragment destroyed
- Coroutine still running
- On completion, it tries to access UI or context

### Fix strategy
- Use `viewLifecycleOwner.lifecycleScope` instead of fragment scope.
- Use `repeatOnLifecycle` when collecting flows.
- Check if the fragment is attached before accessing context.
- Cancel jobs properly in `onDestroyView()`.
- Move business logic to the ViewModel where possible.

--- 

## Scenario: Deep link handling breaking navigation
E-commerce app. Users report deep links open the wrong screen, the app crashes when opened via link, and back navigation behaves incorrectly. The app uses the Navigation Component and multiple entry points. How would you fix?

> Treat this as a navigation state reconstruction problem.

### Understand the three deep link entry scenarios
- Cold start
- Warm start
- Foreground case with `onNewIntent()`

### Fixes
- Validate deep-link parameters before navigation.
- Declare deep links in the navigation graph.
- Use `NavDeepLinkBuilder` to construct a valid back stack.
- Handle duplication carefully when a destination is already in the stack.

---

## Scenario: API instability and token refresh issues
You are on a fintech app with millions of daily transactions. Users report random API failures, some requests succeed on retry, and occasional logouts. Monitoring shows HTTP 401 and 500 spikes, duplicate API calls, and token refresh logic recently changed. How would you design and fix this?

> Treat this as a network reliability and consistency problem, not a simple retry fix.

### Key fixes
- Separate client-side, auth, and server-side failure categories.
- Use a single-flight token refresh pattern so multiple concurrent 401 requests do not race.
- Use idempotency keys for financial writes.
- Only retry transient failures, not all failures.
- Respect `Retry-After` on 429 responses.
- Queue local mutation requests with WorkManager when offline.
- Add observability around retry rate, 401 frequency, and duplicate request detection.

---

## Scenario: Slow build time in a multi-module project
Large Android codebase: 50+ modules, multiple teams, CI build ~25 minutes, local build ~10-12 minutes. Small changes trigger full rebuilds. How would you optimize?

> Treat this as a build system scalability problem, not just a hardware issue.

### Root causes
- Poor module boundaries
- Too many inter-module dependencies
- KAPT overhead
- Non-incremental custom tasks

### Improvements
- Feature-based module design
- Reduce coupling between modules
- Use Gradle caching and remote build cache
- Enable parallel execution
- Replace KAPT with KSP where possible
- Run only affected modules in CI

---

## Scenario: Memory leak causing gradual slowdown
You are working on a large social media app. Users report the app becomes slow after 15-20 minutes and eventually is OOM-killed. Monitoring shows memory grows continuously. How would you investigate and fix end-to-end?

> Treat this as a progressive memory leak, not an immediate crash.

### Confirm leak vs expected growth
- Memory grows linearly without release → leak
- Memory grows then stabilizes → expected caching behavior
- Tools: Memory Profiler, heap dumps, LeakCanary

### Typical suspects
- Activity or Fragment references retained by singletons
- RecyclerView adapters retaining old contexts
- ViewHolder or listener references not being cleared
- Unbounded image cache

### Fix strategy
- Remove strong references causing leaks
- Enforce proper lifecycle cleanup
- Use Application context in long-lived objects
- Tune image caching and remove stale listeners
- Validate with long soak tests

---

## Scenario: Battery drain due to background work
You are working on a fitness tracking app. Users report significant battery drain. The app uses location tracking, background sync, and periodic API polling. How would you diagnose and fix?

> Treat this as a resource efficiency and background execution problem, not a single bug.

### Measure before changing anything
- Battery Historian
- Android Profiler
- Wake lock and alarm frequency

### Likely causes
- Frequent location updates at high accuracy
- Background polling using network aggressively
- Foreground services running when not needed

### Fixes
- Replace polling with push or batch sync where possible
- Use WorkManager and battery constraints
- Reduce location update frequency or use geofencing
- Respect Doze and App Standby
- Stop wake locks for non-critical work

---

## Scenario: Large list causing OOM
Users report crashes when scrolling large product lists. Observations: the entire dataset loads at once, images are high-resolution, and there is no pagination. How would you fix?

> Treat this as a memory management and data loading strategy problem.

### Root causes
- Entire dataset in memory
- High-resolution images decoded at original size
- No lazy loading


### Fix strategy
- Use Paging 3
- Page data in small chunks
- Decode images at display size
- Use bounded caches
- Use `DiffUtil` and stable IDs for adapters
- Clear caches on memory pressure

---

## Scenario: Offline-first product requirements
- Room is the local source of truth.
- Queue user mutations in an outbox.
- Synchronize when online.
- Handle conflict resolution explicitly and keep idempotency on retries.

---

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

---
