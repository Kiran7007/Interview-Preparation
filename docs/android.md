# Android Architecture

## What is Clean Architecture?
- Clean Architecture separates responsibilities into layers.
- It improves testability and maintainability.
- It should be used according to project complexity, not as a rule for creating unnecessary classes.

```text
UI
 ↓
ViewModel
 ↓
UseCase
 ↓
Repository
 ↓
Data Sources
```

For a small feature, several layers may be unnecessary. For a large banking application, clear boundaries become more valuable.

---

## What is the Repository pattern?
- A Repository hides where data comes from.
- It can coordinate API, database, cache, and other sources.

```kotlin
interface UserRepository {
    fun observeUser(): Flow<User>
}
```

The ViewModel does not need to know whether data came from Room, REST, GraphQL, or memory.

---

## What is a UseCase?
- A UseCase represents a business operation.
- It keeps business rules out of the ViewModel.

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
- Dependency Injection means an object receives dependencies instead of constructing them internally.
- It improves testing and separation of concerns.

```kotlin
class UserViewModel(
    private val repository: UserRepository
)
```

---

## What are Hilt scopes?
The scope should match the required lifetime. Common scopes include:

```text
SingletonComponent
ActivityRetainedComponent
ViewModelComponent
ActivityComponent
FragmentComponent
```

A dependency that is only needed by one ViewModel should not automatically become a global singleton.

---

## How do you test Flow and StateFlow?
- Use a Flow testing library such as Turbine where appropriate.
- Test important state transitions rather than internal implementation details.

```kotlin
viewModel.state.test {
    assertEquals(Loading, awaitItem())
    assertEquals(Success(user), awaitItem())
}
```

---

## You need to fetch data from both the local Room database and network. How do you design this?
Use a Repository with fallback logic:

- First try Room DB (cached data).
- If data is old or missing, fetch from the API.
- Save new data in Room.

This ensures:

- Fast response (local DB)
- Always fresh data (network)

---

## In MVVM, who should handle click events and why?
- The ViewModel should handle logic, not the Activity or Fragment.
- Keeps the code testable and follows separation of concerns.
- UI calls `viewModel.onLoginClicked()`.
- ViewModel checks input, performs the API call, and emits success or error state via LiveData or StateFlow.

---

## How would you secure a local database?
- Minimize sensitive data.
- Encrypt sensitive database content when required.
- Protect encryption keys using appropriate secure key-management mechanisms.
- Restrict access.
- Avoid logging database contents.
- Consider backup behavior and logout/data-retention requirements.

---

## How do you handle search in a ViewModel?
- `mapLatest` cancels the previous suspend search when a newer query arrives.
- For a Flow-returning search function, use `flatMapLatest`.

```kotlin
private val query = MutableStateFlow("")

val results = query
    .debounce(300)
    .distinctUntilChanged()
    .mapLatest { text ->
        repository.search(text)
    }
```

---

## What is a database transaction?
- A transaction groups operations so they succeed or fail together according to the database transaction guarantees.
- This is important when multiple pieces of local state must remain consistent.

```text
Update account
Update transaction
Update balance
        ↓
    Transaction
```

---

## Why should we use MVP or MVVM architectures?
- To avoid too much logic code in the UI layer and god activities.
- Reusable code that is easier to test.
- Avoid duplicate code between common views.
- Easier to maintain.
- We can test logic without using instrumentation tests.

---

## Why should the View be implemented with an interface in MVP?
- To decouple the code from the implementation view.
- To abstract the framework used to write the presentation layer.
- To easily change the implementation of the view if needed.
- To follow the SOLID dependency rule and keep high-level concepts from depending on low-level details.

---

## Difference between MVC, MVP, MVVM, and MVI?
| Factor | MVC | MVP | MVVM | MVI |
|---|---|---|---|---|
| Full Name | Model-View-Controller | Model-View-Presenter | Model-View-ViewModel | Model-View-Intent |
| Main Goal | Separate UI, input handling, and data | Move presentation logic out of View | Separate UI from presentation state/logic | Unidirectional, predictable state management |
| Data Flow | Usually mixed / flexible | View ↔ Presenter ↔ Model | View ↔ ViewModel ↔ Model | Intent → ViewModel/Reducer → State → View |
| Direction | Often bidirectional | Mostly bidirectional | Mostly View → VM → View | Strictly unidirectional |
| UI State | Usually held by View | Presenter manages some state | ViewModel owns UI state | Single source of truth in State |
| Business/UI Logic | Controller/View | Presenter | ViewModel | ViewModel + Reducer/State logic |
| Android Fit | Legacy/simple apps | Legacy Android apps | Very common | Excellent for complex stateful UIs |
| Lifecycle Handling | Usually manual | Presenter lifecycle must be handled | ViewModel survives configuration changes | ViewModel + StateFlow handles lifecycle well |
| Testability | Low to medium | High | High | Very high |
| Complexity | Low | Medium | Medium | Higher |
| Boilerplate | Low | Medium | Medium | Medium to high |
| Predictability | Low to medium | Medium | High | Very high |
| State Management | Weak | Manual | Strong | Very strong |
| Recommended for New Android Apps | Usually no | Usually no | Yes | Yes for complex state |
| Best For | Small/legacy applications | Separating presentation logic | Most modern Android apps | Complex state-driven applications |

---

## Use cases of OkHttp Interceptor
- Application interceptors add headers, logging, or common request behavior.
- Network interceptors observe the actual network request and response.
- Keep authentication refresh logic in an `Authenticator` when a `401` response should trigger a token refresh.

---

## Use cases of HTTP Polling and WebSocket
- Polling repeatedly asks the server for updates and is simple but wasteful.
- WebSocket keeps a two-way connection for near real-time updates.
- Use SSE when the server mainly sends one-way events.
- Choose based on latency, battery, scale, and reconnect behavior.

---

## What is Android Architecture?
- It defines a way to structure code into layers.
- Helps separate UI, data, and business logic.
- Makes the code easy to maintain, test, and scale.

---

## What is Repository in MVVM?
- The Repository is responsible for fetching data.
- It abstracts the data sources (API, Room database, Firebase, etc.) from the ViewModel.
- This separation makes it easy to manage and test data logic.

---

## What are UseCases in Clean Architecture?
- A UseCase contains a single specific business logic such as `GetUserDetails`.
- Keeps the ViewModel clean by handling complex logic inside it.
- Lies in the domain layer in Clean Architecture.
- Reusable and testable units of code.

# Android Fundamentals

## How would you implement offline-first behavior?
- I would design the application as offline-first, where Room acts as the local source of truth and the UI observes it using Flow. The repository coordinates Room and the remote API. All local mutations are written to Room immediately and also added to a persistent outbox or sync queue in the same database transaction. WorkManager performs synchronization when network connectivity is available.

- For conflict resolution, I would use optimistic concurrency with a server-generated version or revision number. When a client sends an update, it includes the version it last read. If the server version has changed, the server rejects the update as a conflict instead of silently overwriting the newer data. The conflict resolver can then apply last-write-wins, server-wins, client-wins, field-level merging, or business-specific rules depending on the data. For sensitive business operations, I would keep the server authoritative.

- I would also use idempotency keys so retries do not duplicate operations, exponential backoff for transient failures, and WorkManager for reliable background synchronization. In a multi-module architecture, feature modules depend on domain abstractions, while data modules own Room, networking, and synchronization. This keeps offline behavior, synchronization, and conflict handling isolated and testable.

```text
Interview keywords to remember
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
Optimistic Concurrency
      ↓
Version / Revision
      ↓
Conflict Detection
      ↓
Conflict Resolution
      ↓
Idempotency
      ↓
Retry + Exponential Backoff
```

---

## What is an HTTP interceptor?
- An interceptor can inspect or modify requests and responses.
- Common uses include headers, authentication, logging, and metrics.
- Never log authorization headers, tokens, or sensitive customer information.

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

## How should authentication tokens be stored?
- Avoid plain `SharedPreferences` for sensitive credentials.
- Minimize what is stored.
- Use Android Keystore-backed mechanisms and approved secure storage approaches.
- Clear sensitive state when required during logout.
- Never log tokens.

```text
Login
 ↓
Authentication server
 ↓
Access token
 ↓
Secure storage
 ↓
API request
```

---

## What is the difference between 401 and 403?
- `401 Unauthorized` generally means authentication is missing or invalid.
- `403 Forbidden` means the caller is authenticated but not allowed to perform the operation.

```text
401 → "Who are you?"
403 → "I know who you are, but you cannot do this."
```

---

## What is `collectAsStateWithLifecycle()`?
- It collects a Flow from Compose while respecting the lifecycle.
- It avoids unnecessary collection while the UI is not active.
- It is generally preferred over manually collecting a Flow directly from composition.

```kotlin
val state by viewModel.state
    .collectAsStateWithLifecycle()
```

---

## What is process death?
- Android can kill the application process when resources are needed.
- A ViewModel does not survive process death.
- Important state must be restored through saved-state mechanisms or recreated from persistent storage.
- Do not assume ViewModel means permanent state.

---

## What is the difference between Activity context and Application context?
- Activity context is tied to an Activity lifecycle.
- Application context lives as long as the application process.
- Do not store an Activity context in a long-lived singleton because it can cause a memory leak.
- Use Application context for application-wide dependencies when appropriate.

---

## How do you handle flaky tests?
- Find the root cause instead of repeatedly rerunning.
- Remove arbitrary sleeps.
- Use deterministic synchronization.
- Check test isolation.
- Check race conditions.
- Control coroutine dispatchers.
- Separate product failures from environment failures.

```text
Flaky test
   ↓
Timing?
Isolation?
Environment?
Concurrency?
Product bug?
   ↓
Fix root cause
```

---

## What are CI quality gates?
Possible gates include:

- Compilation
- Unit tests
- Instrumentation tests
- Lint
- Static analysis
- Security scanning
- Dependency checks
- Required code review

A quality gate should prevent known high-risk problems from reaching release.

---

## What is modularization?
- Modularization divides a large codebase into meaningful modules.
- It improves ownership, dependency boundaries, build performance, and reuse.
- Do not create modules for every small class.

```text
:app

:feature-login
:feature-dashboard
:feature-payments

:core-network
:core-database
:core-ui
:core-security
```

---

## What are shared libraries in Android?
- Shared libraries contain functionality used by multiple features or teams.
- They should have stable APIs and avoid unnecessary feature-specific dependencies.

```text
Design system
Networking
Authentication
Logging
Analytics
Security utilities
```

---

## What is Android startup performance?
- Startup performance is the time needed before the application becomes usable.
- Common problems:
    1. Heavy Application initialization
    2. Synchronous disk I/O
    3. Large dependency initialization
    4. Unnecessary SDK initialization
    5. Expensive database work
- Use profiling and startup metrics before optimizing.

---

## What is Macrobenchmark?
- Macrobenchmark measures larger user journeys on real Android devices or emulators.
- It is useful for startup, scrolling, and other performance scenarios.

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

## What is feature flagging?
- A feature flag controls whether functionality is enabled.
- It allows deployment and release to be separated.
- It supports gradual rollout and quick disablement.

```kotlin
if (featureFlags.newPaymentFlow) {
    NewPaymentScreen()
} else {
    OldPaymentScreen()
}
```

---

## What is a phased rollout?
- Instead of releasing to everyone immediately:

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

- Monitor:
    1. Crash rate
    2. ANR
    3. API errors
    4. Performance
    5. Business metrics
- Stop or roll back if important metrics degrade.

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

## What is a runbook?
- A runbook explains what to do when an operational problem occurs.

```text
Problem
 ↓
Detection
 ↓
Investigation
 ↓
Mitigation
 ↓
Rollback
 ↓
Recovery
```

- For example, a crash spike after release should have a documented rollback or feature-disable procedure.

---

## What is crash-free rate?
- It measures how many users or sessions complete without crashes.
- It is a useful stability metric.
- Track it by:

```text
App version
Device
OS version
Feature
Release cohort
```

- A single overall percentage can hide problems affecting a specific group.

---

## How do you handle pagination?
- For simple offset pagination:

```text
page=1
page=2
page=3
```

- For more reliable APIs, cursor pagination can be better:

```text
cursor=A
 ↓
nextCursor=B
 ↓
nextCursor=C
```

- For Android, Paging 3 can manage loading, retry, refresh, and presentation state.

---

## How do you handle configuration changes without losing data?
- ViewModel stores UI-related data across configuration changes.
- When the screen rotates:

```text
Activity/Fragment is destroyed and recreated
 ↓
ViewModel is not destroyed
 ↓
ViewModel retains the data and passes it again to the UI.
```

- Example: in a profile screen, if the user scrolls halfway and rotates the screen, without ViewModel the screen will reload from the start. With ViewModel, the data and scroll position can be restored smoothly.

---

## What is the difference between retry and refresh?
- Retry repeats a failed operation.
- Refresh requests the latest state or data again.
- A retry should be used carefully with writes.
- For financial operations, use idempotency and server-side transaction semantics before retrying.

---

## What is idempotency?
- An operation is idempotent when repeating the same request does not create additional unintended effects.
- It is critical for payment and transaction workflows.

```text
POST payment + idempotencyKey=ABC
POST payment + idempotencyKey=ABC
```

- The server can recognize that both requests represent the same operation.

---

## How do you use AI coding assistants safely?
- Use only organization-approved AI tools.
- Do not provide confidential source code or customer data unless explicitly permitted.
- Treat generated code as untrusted suggestions.
- Review the code.
- Run tests.
- Run static analysis and security checks.
- Validate behavior against requirements.

```text
AI suggestion
    ↓
Developer review
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

## How would you respond if AI generated insecure token storage?
- Do not merge it.

```text
Generated code
 ↓
Security review
 ↓
Identify insecure storage
 ↓
Replace with approved secure approach
 ↓
Add tests
 ↓
Run security/static checks
 ↓
Code review
```

- AI can accelerate implementation but cannot replace engineering judgment.

---

## How do you handle an architecture disagreement?
- Understand the other proposal.
- Compare trade-offs.
- Use requirements and measurable constraints.
- Prototype when uncertainty is high.
- Align with the team.
- Document important decisions.
- Avoid making the discussion about who is technically right.

---

## What delivery metrics matter for an Android team?
- Important metrics include:
    1. Cycle time
    2. Deployment frequency
    3. Defect escape rate
    4. Crash-free users
    5. ANR rate
    6. Build duration
    7. Test stability
    8. Release rollback rate
- Do not optimize one metric alone.
- For example, reducing cycle time by skipping tests can increase production defects.

---

## How would you reduce Android app startup time?
- Remove unnecessary initialization from `Application`.
- Lazy-load noncritical dependencies.
- Avoid synchronous disk/database work on startup.
- Defer analytics/SDK initialization where allowed.
- Use Baseline Profiles.
- Measure using startup benchmarks and production telemetry.
- The first step should be profiling, not guessing.

---

## How do you handle sensitive data in logs?
- Never log:

```text
Passwords
Access tokens
Refresh tokens
PINs
Full account numbers
Sensitive customer data
```

- Use safe identifiers and structured logging where appropriate.
- Production logging should follow security and privacy policies.

---

## What is screenshot protection?
- Android can restrict screenshots for sensitive screens using appropriate window flags.

```kotlin
window.setFlags(
    WindowManager.LayoutParams.FLAG_SECURE,
    WindowManager.LayoutParams.FLAG_SECURE
)
```

- Use it where the security requirement calls for preventing screenshots or screen capture.

---

## How do you reduce memory usage?
- Avoid holding Activity/View references in long-lived objects.
- Load images at appropriate sizes.
- Avoid unnecessary large collections.
- Close resources appropriately.
- Use lifecycle-aware components.
- Profile before optimizing.

---

## What is a good Android testing strategy?

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

## What is a quality gate you would add to CI?

```text
Compile
 ↓
Lint
 ↓
Static analysis
 ↓
Unit tests
 ↓
Security/dependency checks
```

For release:

```text
Instrumentation/UI tests
 ↓
Release build
 ↓
Signing
 ↓
Artifact verification
 ↓
Deployment
```

---

## How do you avoid overengineering?

```text
What problem does this abstraction solve?
Will the project need it?
Does it improve testability or maintainability?
Does the complexity justify the benefit?
```

---

## How do you handle one-time events such as navigation?
- Keep durable screen state separate from transient events.

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

- Use an appropriate event stream such as `SharedFlow` and collect it lifecycle-safely.

---

## How do you prevent duplicate navigation events after rotation?
- Do not model navigation as a simple persistent Boolean.
- Treat navigation as a transient event or derive navigation from durable state.
- Ensure the event consumption model is lifecycle-aware.

---

## What is the role of Android SDK knowledge in modern Android?
- Lifecycle
- Context
- Activity
- Services
- Permissions
- Saved state
- Background execution
- Notifications
- Configuration changes
- OS behavior

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

## What does "high-quality user experience across devices and OS versions" mean?
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

# Android Security

## What is certificate pinning?
- TLS normally validates the server certificate chain.
- Certificate pinning adds an additional check against an expected certificate or public key.

```text
App
 ↓
TLS validation
 ↓
Pinned certificate/public key check
 ↓
Server
```

It can reduce certain MITM risks.

The trade-off is operational complexity during certificate rotation. It should be used according to the threat model and security policy.

---

## What is the Android Keystore?
- Android Keystore provides a secure mechanism for managing cryptographic keys.
- Keys can be hardware-backed on supported devices.
- Applications can use it for encryption and signing operations without exposing key material directly.

---

## What is certificate transparency?
- Certificate Transparency provides public logs of issued certificates.
- It helps detect improperly issued certificates.
- It complements, rather than replaces, normal TLS validation.

---

## Why do Android apps need to ask permission like `INTERNET` or `LOCATION`?
- Android permissions protect sensitive resources and user privacy. Apps must declare what they need in the manifest, and some permissions also require runtime user approval.

| Permission | Why needed |
|---|---|
| `INTERNET` | Allows the app to communicate with network servers |
| `ACCESS_FINE_LOCATION` | Allows precise device location |
| `CAMERA` | Allows camera access |
| `READ_MEDIA_IMAGES` | Allows access to user photos |

---

## What are the permission protection levels in Android?
| Protection Level | Meaning | Example |
|---|---|---|
| Normal | Low-risk permission, automatically granted | `INTERNET` |
| Dangerous | Accesses sensitive data or features and requires runtime approval | `CAMERA`, `ACCESS_FINE_LOCATION` |
| Signature | Granted only if the requesting app is signed with the same certificate as the app defining the permission | Custom IPC permission |

---

## How do you protect API keys and prevent reverse engineering?
### API key protection - layers of defense
- Do not hardcode keys in source code, `strings.xml`, or git-committed config.
- Use `BuildConfig` and Gradle with environment variables in CI.
- Keep the real third-party key on the backend via a server-side proxy.
- Use the NDK for critical secrets to make reverse engineering harder, though not impossible.

### Prevent reverse engineering
- Use ProGuard or R8 to obfuscate code and remove dead code.
- Use R8 full mode in release builds.
- Add tamper detection and verify APK signature at runtime.
- Use Play Integrity API instead of only simple root checks.

```kotlin
buildTypes {
    release {
        isMinifyEnabled = true
        isShrinkResources = true
        proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
    }
}
```

---

## What are common security risks in Android apps?
- Storing data in plain text.
- Using HTTP instead of HTTPS.
- Hardcoding API keys in code.
- Not validating inputs.
- Using outdated libraries with vulnerabilities.

---

## How can you protect your API keys in Android?
- Do not hardcode keys in code or `strings.xml`.
- Use `BuildConfig` with Gradle to store API keys.
- Store keys on the server and use token-based auth.
- Use NDK for critical keys as an additional layer of defense.

---

## How can you prevent reverse engineering of your APK?
- Use ProGuard or R8 to obfuscate the code.
- Remove unused code and classes.
- Avoid storing logic or secrets in the app.
- Sign APKs with a release keystore.
- Monitor unauthorized APKs using the Play Store Console.

# Jetpack Compose

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

## How do you make a Compose screen accessible?
Use:

- Meaningful semantics
- Content descriptions where needed
- Correct roles
- Adequate touch targets
- Good contrast
- Font scaling support
- Proper focus order
- TalkBack validation

```kotlin
Modifier.semantics {
    contentDescription = "Account balance"
}
```

---

## In Jetpack Compose, how do you preserve scroll position when the user navigates back?
Use `rememberLazyListState()` in a composable:

```kotlin
val listState = rememberLazyListState()
LazyColumn(state = listState) { ... }
```

---

## How would you debug excessive recompositions in Jetpack Compose?
- Use Layout Inspector and recomposition counts.
- Use composition tracing and CPU profiling.
- Look for unstable parameters, global state, repeated `collectAsState()`, and missing `remember`.
- Break state into smaller pieces and pass only required fields.
- Use `derivedStateOf`, `remember`, and stable immutable models.

---

## What is Jetpack Compose?
- Jetpack Compose is Android’s modern UI toolkit that lets you build UI using Kotlin code instead of XML.
- It is declarative, meaning you describe what the UI should look like and the system updates it automatically when the data changes.
- It offers less boilerplate, better state handling, and a Kotlin-first approach.

---

## What is a Composable function?
- A Composable is a special Kotlin function marked with `@Composable` that describes part of the UI.
- You can call one composable inside another to build complex UIs.

```kotlin
@Composable
fun Greeting(name: String) {
    Text(text = "Hello, $name")
}
```

---

## What is recomposition in Jetpack Compose?
- Recomposition is when Compose redraws parts of the UI because data or state has changed.
- Only the part of the UI where data changed is recomposed.
- Compose optimizes this to avoid redrawing everything.

---

## What is State in Compose?
- State holds data that changes over time and triggers recomposition.
- You can use `remember` and `mutableStateOf`:

```kotlin
val count = remember { mutableStateOf(0) }
```

- When `count.value` changes, any UI that depends on it updates automatically.

---

## What is `remember` and `rememberSaveable`?
- `remember` stores state during recomposition but resets on configuration changes such as rotation.
- `rememberSaveable` stores state across recomposition and configuration changes using a `Bundle`.

---

## What is a `Modifier` in Jetpack Compose?
- `Modifier` is used to modify or decorate a composable, such as setting padding, background, size, or click behavior.

```kotlin
Text(
    text = "Hello",
    modifier = Modifier
        .padding(16.dp)
        .background(Color.Yellow)
)
```

---

## What is a `Scaffold` in Jetpack Compose?
`Scaffold` is a layout component that provides structure like top bar, bottom bar, floating action button, and snackbar host.

```kotlin
Scaffold(
    topBar = { TopAppBar(title = { Text("Home") }) },
    floatingActionButton = { FloatingActionButton(onClick = {}) { Text("+") } }
) {
    // Content
}
```

---

## What is `SideEffect` in Jetpack Compose?
- A `SideEffect` is any operation that affects something outside the Compose UI tree.
- Compose functions are pure by default, meaning they should not change anything outside themselves.
- `SideEffect` provides a safe way to run external operations exactly when Compose recomposes.

# Unit and UI Testing

## What is unit testing?
- Unit tests verify small pieces of logic.
- They are usually fast and run on the JVM.

Good candidates:

```text
ViewModel
UseCase
Mapper
Validator
Business rules
```

Example:

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
- It runs with Android framework and device support.
- It is useful for integration with Android components, databases, and other platform behavior.

```text
Test
 ↓
Emulator/device
 ↓
Android framework
```

---

## What is a UI test?
- UI tests verify user-visible behavior.
- Compose provides testing APIs based on semantics.
- Test important user journeys rather than every internal implementation detail.

```kotlin
composeTestRule
    .onNodeWithText("Pay")
    .performClick()
```

---

## What is the Android test pyramid?
- Use many fast unit tests, fewer integration tests, and a smaller number of critical end-to-end UI tests.

```text
        UI tests
       /        \
 Integration tests
   /              \
       Unit tests
```

---

## How do you decide what to UI test?
Prioritize:

- Login
- Payments
- Navigation
- Critical business journeys
- Accessibility-critical behavior
- Important regression scenarios

Do not put every business rule into UI tests. Keep most logic in fast unit tests.

---

## What is Unit Testing in Android?
- Unit testing is the practice of testing individual components or functions in isolation to ensure they behave correctly.
- In Android, we typically use JUnit for unit testing.
- Unit tests run on the JVM and are fast because they do not require a device or emulator.

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
- JUnit for writing tests.
- MockK or Mockito for mocking dependencies.
- Truth, AssertJ, or Hamcrest for assertions.
- Robolectric to run Android SDK code in JVM tests.
- Turbine for testing Kotlin Flow.
- Kotlin Test DSL for idiomatic Kotlin testing.

# Bluetooth Low Energy

## What is Bluetooth Low Energy?
- BLE is a low-power wireless technology designed for short-range communication between nearby devices.
- It is optimized for battery life and periodic data exchange.
- Common use cases include wearables, smart locks, sensors, and proximity-based features.

```text
Phone
  ↓
BLE GATT
  ↓
Peripheral / Sensor
```

- Use BLE when low power and small payloads matter more than raw throughput.

---

## When should you use BLE instead of Wi-Fi or classic Bluetooth?
- Use BLE for low-energy, periodic communication with nearby devices.
- Use Wi-Fi for high-bandwidth or internet-connected transfers.
- Use classic Bluetooth for larger streaming or audio-like workloads.
- For wearables and sensors, BLE is usually the best trade-off for battery life.

# Performance and Reliability

## What is a memory leak?
- A memory leak occurs when objects remain reachable even though they are no longer needed.
- Android commonly sees leaks from lifecycle misuse.

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
- They can improve startup and runtime performance by enabling ahead-of-time optimization for critical paths.
- For flows such as app startup and login, they can provide measurable benefits.

---

## What is ANR rate?
- ANR rate measures application-not-responding events.
- It is an important Android stability metric.
- Monitor it together with startup, rendering, and crash metrics.
- A release with good crash numbers can still be unhealthy if ANRs increase.

---

## What is overdraw?
- Overdraw occurs when the same screen pixel is drawn multiple times.
- Excessive overdraw can increase rendering cost.
- Avoid unnecessary backgrounds and deeply nested layouts.
- Use Android Studio rendering and profiling tools to investigate.

---

## What is the difference between a crash and an ANR?
- Crash terminates the application process or component due to an unhandled failure.
- ANR means the application is not responding to user or system interaction within required time limits.

```text
Crash → application failure
ANR   → application unresponsive
```

---

## How do you load large bitmaps?
- Decode images close to their display size.
- Use an image library with memory and disk caching.
- Prefer thumbnails, sampling, and appropriate formats.
- Avoid keeping many full-resolution bitmaps in memory.

---

## What is an Application Not Responding (ANR) error, and how can you prevent it?
- An ANR dialog appears when the UI has been unresponsive for more than 5 seconds, usually because the main thread was blocked.
- To avoid ANRs, move as much work off the main thread as possible.

---

## How do you reduce battery consumption?
- Never poll the server for updates unless needed.
- Sync only when required, ideally when the phone is on Wi-Fi and plugged in.
- Defer work using WorkManager.
- Compress data.
- Avoid unnecessary background work and wake-ups.

---

## How do you investigate an ANR?
Look at:

- ANR traces
- Android Vitals
- Play Console
- StrictMode
- Perfetto
- CPU profiler

Typical causes:

```text
Main thread
   ↓
Disk I/O
Network
Large computation
Lock contention
Binder call
```

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

- Long work on the main thread
- Expensive composition
- Excessive recomposition
- Large list rendering
- Image decoding
- Layout complexity

Use:

```text
Compose/Layout Inspector
CPU profiler
Perfetto
Macrobenchmark
Frame timing
```

# Scenario Based Questions

## How would you handle network and database consistency?
- The database becomes the observable source of truth.
- On successful API response, update the database in a transaction when multiple related records must remain consistent.

```text
API
 ↓
Repository
 ↓
Database
 ↓
UI
```

---

## How would you handle a server response that is successful but the local database update fails?
- Do not pretend the operation completed locally.
- Capture the failure.
- Retry or recover according to the feature’s consistency requirements.
- Keep the UI state accurate.
- Log safe diagnostic information.
- Consider transactional persistence for related writes.

---

## How would you design a banking account dashboard?
```text
Compose/XML
    ↓
ViewModel
    ↓
UseCase
    ↓
Repository
   ↙    ↘
Room    API
```

- UI observes immutable StateFlow.
- Repository coordinates local and remote data.
- Room can act as the local source of truth.
- API refreshes local data.
- Sensitive data is minimized and protected.
- Errors are represented explicitly.
- Tests cover business logic, integration, and critical UI flows.

---

## How do you investigate a crash?
A good process is:

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

Look for crash clustering rather than treating every stack trace independently.

---

## How would you design an Android payment flow?
```text
UI
 ↓
ViewModel
 ↓
UseCase
 ↓
Repository
 ↓
Payment API
```

Important considerations:

- Authentication
- Authorization
- Input validation
- Secure networking
- Idempotency
- Transaction state
- Timeout handling
- Error recovery
- Auditability
- Monitoring

---

## How would you handle a token refresh?

```text
API request
 ↓
401
 ↓
Refresh token
 ↓
New access token
 ↓
Retry original request
```

---

## How would you design a large Android application for multiple teams?
- Use modularization with clear ownership.
- Define dependency rules so feature modules do not depend directly on unrelated features.

```text
app
 ├── feature-login
 ├── feature-accounts
 ├── feature-payments
 ├── feature-profile
 │
 ├── core-network
 ├── core-database
 ├── core-security
 └── core-ui
```

---

## How would you design error states in Android UI?
Use explicit state.

```kotlin
sealed interface UiState {
    data object Loading : UiState
    data class Success(val data: Account) : UiState
    data class Error(val message: String) : UiState
}
```

For more complex screens, model partial states rather than forcing everything into only Loading/Success/Error.

---

## Is there any scenario where `onDestroy()` is called without calling `onPause()` and `onStop()`?
If we call `finish()` inside `onCreate()` of an Activity, then `onDestroy()` will be called directly.

---

## Scenario: Crash Spike Due to Lifecycle Issues (Fragment + Coroutines)
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

## Scenario: Deep Link Handling Breaking Navigation
E-commerce app. Users report deep links open the wrong screen, the app crashes when opened via link, and back navigation behaves incorrectly. The app uses Navigation Component and multiple entry points. How would you fix?

> Treat this as a navigation state reconstruction problem.

### Understand the three deep link entry scenarios
- Cold start: app not running
- Warm start: app in background
- Foreground case: app already active and `onNewIntent()` fires

### Validate deep link declaration in the manifest
- `autoVerify="true"` enables App Links.
- Without verified App Links, Android may show a chooser or open in a browser.

### Handle parameters safely
- Always validate deep-link arguments before navigation.
- Fallback to a safe destination if the data is invalid.

### Fix back stack for cold starts
- Use `NavDeepLinkBuilder` to construct a valid back stack.
- Ensure the user can press Back and return through a sensible flow.

### Use lifecycle-safe event handling
- Treat navigation as a transient event rather than a persistent flag.

---

## Scenario: API Layer Instability - Retries, Failures, Token Expiry
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

## Scenario: Slow Build Time in Multi-Module Project
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

## How do you investigate an ANR?
Look at:

- ANR traces
- Android Vitals
- Play Console
- StrictMode
- Perfetto
- CPU profiler

Typical causes:

```text
Main thread
   ↓
Disk I/O
Network
Large computation
Lock contention
Binder call
```

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

- Long work on the main thread
- Expensive composition
- Excessive recomposition
- Large list rendering
- Image decoding
- Layout complexity

Use:

```text
Compose/Layout Inspector
CPU profiler
Perfetto
Macrobenchmark
Frame timing
```

---

## Scenario: Memory Leak Causing Gradual App Slowdown
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

## Scenario: Battery Drain Due to Background Work
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

## Scenario: Large List Data Loading Causing OOM
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

## Scenario: Deep Link Handling Breaking Navigation
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

## Scenario: API Layer Instability - Retries, Failures, Token Expiry
You are on a fintech app with millions of daily transactions. Users report random API failures and occasional logouts. Monitoring shows HTTP 401 and 500 spikes, duplicate API calls, and token refresh issues. How would you design and fix this?

> Treat this as a network reliability and distributed consistency problem.

### Key principles
- Separate client, auth, and server failures.
- Use single-flight refresh logic.
- Use idempotency keys for financial writes.
- Retry only transient failures.
- Respect `Retry-After` on `429`.
- Queue mutation requests locally when offline.

---
