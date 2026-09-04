---
# Android Architecture
---
## What is Clean Architecture?
-   Clean Architecture separates responsibilities into layers.
-   It improves testability and maintainability.
-   It should be used according to project complexity, not as a rule for
    creating unnecessary classes.

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

For a small feature, several layers may be unnecessary. For a large
banking application, clear boundaries become more valuable.
---
## What is the Repository pattern?
-   A Repository hides where data comes from.
-   It can coordinate API, database, cache, and other sources.

```kotlin
interface UserRepository {
    fun observeUser(): Flow<User>
}
```

The ViewModel does not need to know whether data came from Room, REST,
GraphQL, or memory.
---
## What is a UseCase?
-   A UseCase represents a business operation.
-   It keeps business rules out of the ViewModel.

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

Do not create a UseCase for every trivial getter just to follow a
pattern.
---
## What is dependency injection?
-   Dependency Injection means an object receives dependencies instead
    of constructing them internally.
-   It improves testing and separation of concerns.

```kotlin
class UserViewModel(
    private val repository: UserRepository
)
```

The ViewModel does not create `UserRepository()` itself.
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

A dependency that is only needed by one ViewModel should not
automatically become a global singleton.
---
## How do you test Flow and StateFlow?
- Use a Flow testing library such as Turbine where appropriate.
- Test important state transitions rather than internal implementation details.
- Example:
```kotlin
viewModel.state.test {
    assertEquals(Loading, awaitItem())
    assertEquals(Success(user), awaitItem())
}
```
---
## You need to fetch data from both the local Room database and network. How do you design this?
Use Repository with a fallback logic:

-   First try Room DB (cached data).
-   If data is old/missing, fetch from API.
-   Save new data in the Room.

This ensures:

-   Fast response (local DB)
-   Always fresh data (network)
---
## In MVVM, who should handle click events and why?
- The ViewModel should handle logic, not the Activity/Fragment.
- Keeps code testable and follows separation of concerns.
- UI calls `viewModel.onLoginClicked()`
- ViewModel checks input, performs API call
- Emits success/error state via LiveData or StateFlowx
---
## How would you secure a local database?
-   Minimize sensitive data.
-   Encrypt sensitive database content when required.
-   Protect encryption keys using appropriate secure key-management
    mechanisms.
-   Restrict access.
-   Avoid logging database contents.
-   Consider backup behavior and logout/data-retention requirements.
---
## How do you handle search in a ViewModel?
- `mapLatest` cancels the previous suspend search when a newer query
arrives.
- For a Flow-returning search function, use `flatMapLatest`.
- Example:
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
-  A transaction groups operations so they succeed or fail together
    according to the database's transaction guarantees.
- This is important when multiple pieces of local state must remain
consistent.
```text
Update account
Update transaction
Update balance
        ↓
    Transaction
```
---
## Why we should use MVP / MVVM architectures?
- To avoid too much logic code in the UI layer and god activities
- Reusable code that's easier to test
- Avoid duplicated code between common views
- Easier to maintain
- We can test logic without using instrumentation tests.
---
## Why the View should be implemented with an interface in MVP?
- To decouple the code from the implementation view.
- To abstract the framework used to write our presentation layer, regardless of any external dependency.
- To be able to easily change the implementation of view if needed.
- To follow the SOLID dependency rule to improve unit testability and in order to follow the dependency rule, high-level concepts (such as the presenter implementation) can't depend on low-level details (like the implementation view).
---
## Difference between MVC & MVP & MVVM & MVI?
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
## Usecases of OkHttp Interceptor
- **Application interceptors** add headers, logging, or common request behavior.
- **Network interceptors** observe the actual network request and response.
- Keep authentication refresh logic in an `Authenticator` when a `401` response should trigger a token refresh.
---
## Usecases of HTTP Polling and WebSocket
- **Polling** repeatedly asks the server for updates and is simple but wasteful.
- **WebSocket** keeps a two-way connection for near real-time updates.
- Use **SSE** when the server mainly sends one-way events.
- Choose based on latency, battery, scale, and reconnect behavior.
---
## What is Android Architecture?
- It defines a way to structure code into layers.
- Helps separate UI, data, and business logic.
- Makes the code easy to maintain, test, and scale.
---
## What is Repository in MVVM?
- The Repository is responsible for fetching data.
- It abstracts the data sources (API, Room database, Firebase, etc.) from the ViewModel. This separation makes it easy to manage and test data logic.
---
## What are UseCases in Clean Architecture?
- A UseCase contains a single specific business logic (e.g., GetUserDetails).
- Keeps the ViewModel clean by handling complex logic inside it.
- Lies in the domain layer in Clean Architecture.
- Reusable and testable units of code.
---
# Android Fundamentals
---
## How would you implement offline-first behavior?
- I would design the application as offline-first, where Room acts as the local source of truth and the UI observes it using Flow. The repository coordinates Room and the remote API. All local mutations are written to Room immediately and also added to a persistent outbox or sync queue in the same database transaction. WorkManager performs synchronization when network connectivity is available.

- For conflict resolution, I would use optimistic concurrency with a server-generated version or revision number. When a client sends an update, it includes the version it last read. If the server version has changed, the server rejects the update as a conflict instead of silently overwriting the newer data. The conflict resolver can then apply last-write-wins, server-wins, client-wins, field-level merging, or business-specific rules depending on the data. For sensitive business operations, I would keep the server authoritative.

- I would also use idempotency keys so retries don't duplicate operations, exponential backoff for transient failures, and WorkManager for reliable background synchronization. In a multi-module architecture, feature modules depend on domain abstractions, while data modules own Room, networking, and synchronization. This keeps offline behavior, synchronization, and conflict handling isolated and testable."

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
- Never log authorization headers, tokens, or sensitive customer
information.
- Example:
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
-   Avoid plain SharedPreferences for sensitive credentials.
-   Minimize what is stored.
-   Use Android Keystore-backed mechanisms and approved secure storage
    approaches.
-   Clear sensitive state when required during logout.
-   Never log tokens.

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
-   `401 Unauthorized` generally means authentication is missing or
    invalid.
-   `403 Forbidden` means the caller is authenticated but not allowed to
    perform the operation.

```text
401 → "Who are you?"
403 → "I know who you are, but you cannot do this."
```
---
## What is `collectAsStateWithLifecycle()`?
-   It collects a Flow from Compose while respecting the lifecycle.
-   It avoids unnecessary collection while the UI is not active.
- It is generally preferred over manually collecting a Flow directly from
composition.
- Example:
```kotlin
val state by viewModel.state
    .collectAsStateWithLifecycle()
```
---
## What is process death?
-   Android can kill the application process when resources are needed.
-   A ViewModel does not survive process death.
-   Important state must be restored through saved-state mechanisms or
    recreated from persistent storage.
- Do not assume ViewModel means permanent state.
---
## What is the difference between Activity context and Application context?
-   Activity context is tied to an Activity lifecycle.
-   Application context lives as long as the application process.
- Do not store an Activity context in a long-lived singleton because it
can cause a memory leak.
- Use Application context for application-wide dependencies when
appropriate.
---
## How do you handle flaky tests?
-   Find the root cause instead of repeatedly rerunning.
-   Remove arbitrary sleeps.
-   Use deterministic synchronization.
-   Check test isolation.
-   Check race conditions.
-   Control coroutine dispatchers.
-   Separate product failures from environment failures.

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

-   Compilation
-   Unit tests
-   Instrumentation tests
-   Lint
-   Static analysis
-   Security scanning
-   Dependency checks
-   Required code review

A quality gate should prevent known high-risk problems from reaching
release.
---
## What is modularization?
-   Modularization divides a large codebase into meaningful modules.
-   It improves ownership, dependency boundaries, build performance, and
    reuse.
- Do not create modules for every small class.
- Example:
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
- Shared libraries contain functionality used by multiple features or
teams.
- They should have stable APIs and avoid unnecessary feature-specific
dependencies.
- Examples:
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
- Startup performance is the time needed before the application becomes
usable.
- Common problems:
    1.   Heavy Application initialization
    2.   Synchronous disk I/O
    3.   Large dependency initialization
    4.   Unnecessary SDK initialization
    5.   Expensive database work
- Use profiling and startup metrics before optimizing.
---
## What is Macrobenchmark?
-   Macrobenchmark measures larger user journeys on real Android devices
    or emulators.
-   It is useful for startup, scrolling, and other performance
    scenarios.
- Example:
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
-  A feature flag controls whether functionality is enabled.
-  It allows deployment and release to be separated.
-  It supports gradual rollout and quick disablement
- Example:
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
    1.   Crash rate
    2.   ANR
    3.   API errors
    4.   Performance
    5.   Business metrics
- Stop or roll back if important metrics degrade.
---
## What is operational readiness?
- Before release, define:
    1.   Monitoring
    2.   Alerts
    3.   Rollback process
    4.   Feature flag strategy
    5.   Ownership
    6.   Runbook
    7.   Known failure modes
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
-   It measures how many users or sessions complete without crashes.
-   It is a useful stability metric.
- Track it by:
```text
App version
Device
OS version
Feature
Release cohort
```
- A single overall percentage can hide problems affecting a specific
group.
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
- For Android, Paging 3 can manage loading, retry, refresh, and
presentation state.
---
## How do you handle configuration changes (like screen rotation) in Android without losing data?
- ViewModel stores UI-related data across configuration changes.
- When screen rotates:
```text
Activity/Fragment is destroyed and recreated
 ↓
ViewModel is not destroyed
 ↓
ViewModel retains the data and passes it again to the UI.
```
- Example: In a profile screen, if user scrolls halfway and rotates the screen, without ViewModel the screen will reload from start. But with ViewModel, the profile data and scroll position can be restored smoothly.
---
## What is the difference between retry and refresh?
-   Retry repeats a failed operation.
-   Refresh requests the latest state/data again.
- A retry should be used carefully with writes.
- For financial operations, use idempotency and server-side transaction
semantics before retrying.
---
## What is idempotency?
-   An operation is idempotent when repeating the same request does not
    create additional unintended effects.
-   It is critical for payment and transaction workflows.
```text
POST payment + idempotencyKey=ABC
POST payment + idempotencyKey=ABC
```
- The server can recognize that both requests represent the same
operation.
---
## How do you use AI coding assistants safely?
-   Use only organization-approved AI tools.
-   Do not provide confidential source code or customer data unless
    explicitly permitted.
-   Treat generated code as untrusted suggestions.
-   Review the code.
-   Run tests.
-   Run static analysis and security checks.
-   Validate behavior against requirements.
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
    1.   Incorrect APIs
    2.   Security vulnerabilities
    3.   Poor architecture
    4.   Hallucinated behavior
    5.   License/IP concerns
    6.   Sensitive data exposure
    7.   Hidden edge cases
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
- AI can accelerate implementation but cannot replace engineering
judgment.
---
## How do you handle an architecture disagreement?
-   Understand the other proposal.
-   Compare trade-offs.
-   Use requirements and measurable constraints.
-   Prototype when uncertainty is high.
-   Align with the team.
-   Document important decisions.
- Avoid making the discussion about who is technically right.
---
## What delivery metrics matter for an Android team?
- Important metrics include:
    1.   Cycle time
    2.   Deployment frequency
    3.   Defect escape rate
    4.   Crash-free users
    5.   ANR rate
    6.   Build duration
    7.   Test stability
    8.   Release rollback rate
- Do not optimize one metric alone.
- For example, reducing cycle time by skipping tests can increase
production defects.
---
## How would you reduce Android app startup time?
-   Remove unnecessary initialization from `Application`.
-   Lazy-load noncritical dependencies.
-   Avoid synchronous disk/database work on startup.
-   Defer analytics/SDK initialization where allowed.
-   Use Baseline Profiles.
-   Measure using startup benchmarks and production telemetry.
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
- Android can restrict screenshots for sensitive screens using appropriate
window flags.
```kotlin
window.setFlags(
    WindowManager.LayoutParams.FLAG_SECURE,
    WindowManager.LayoutParams.FLAG_SECURE
)
```
- Use it where the security requirement calls for preventing screenshots
or screen capture.
---
## How do you reduce memory usage?
-   Avoid holding Activity/View references in long-lived objects.
-   Load images at appropriate sizes.
-   Avoid unnecessary large collections.
-   Close resources appropriately.
-   Use lifecycle-aware components.
-   Profile before optimizing.
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
- Use an appropriate event stream such as SharedFlow and collect it
lifecycle-safely.
---
## How do you prevent duplicate navigation events after rotation?
-   Do not model navigation as a simple persistent Boolean.
-   Treat navigation as a transient event or derive navigation from
    durable state.
-   Ensure the event consumption model is lifecycle-aware.
---
## What is the role of Android SDK knowledge in modern Android?
-   Lifecycle
-   Context
-   Activity
-   Services
-   Permissions
-   Saved state
-   Background execution
-   Notifications
-   Configuration changes
-   OS behavior
---
## What is your approach when supporting multiple Android OS versions?
-   Use supported APIs according to min/target SDK.
-   Guard newer APIs with version checks when required.
-   Test behavior across important OS/device combinations.
-   Avoid assuming behavior is identical across versions.
-   Monitor production issues by OS version.

```kotlin
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.X) {
    // New API
}
```

Interview Answer:
> Use supported APIs according to min/target SDK.
---
## What does "high-quality user experience across devices and OS versions" mean?
It includes:

-   Responsive layouts
-   Accessibility
-   Correct lifecycle behavior
-   Reliable offline/error states
-   Good startup and rendering performance
-   Proper font scaling
-   Device/OS compatibility
-   Safe background behavior
-   Consistent navigation

Quality is more than visual correctness.

Interview Answer:
> It includes: Responsive layouts Accessibility Correct lifecycle behavior Reliable offline/error states Good startup and rendering performance Proper font scaling Device/OS compatibility Safe background behavior Consistent navigation Quality is more than visual correctness.
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

This demonstrates ownership beyond writing code.

Interview Answer:
> This demonstrates ownership beyond writing code.
---
## What is the `Application` class and how should teams use it safely?
The **`Application`** class is created once **per app process**, before your activities and most other components. It is the usual place to register **process-wide** setup: crash reporting, dependency injection roots, image loader singletons, and callbacks like **`onTrimMemory`**.

Because it lives as long as the process, **never store an `Activity` here** (that leaks the whole screen). Also avoid **heavy work in `onCreate`**—it slows **cold start**. Prefer **lazy** initialization and real background APIs for anything expensive.

**Examples that fit:** crash SDK init, DI container, bounded image pipeline. **Poor fit:** blocking feature-flag fetches on the main thread.

### Useful links

- [Project skeleton reference:](https://github.com/gbajaj/interviewready)


> `Application` is for **process scope**, not “hide globals”.
---
- [Learn more](https://github.com/gbajaj/interviewready)

Interview Answer:
> The **`Application`** class is created once **per app process**, before your activities and most other components.
---
## Describe classic Android application architecture components.
- **Activities:** foreground UI entry.
- **Services:** background work (with modern restrictions).
- **Broadcast receivers:** subscribe to events (explicit vs implicit carefully).
- **Content providers:** structured cross-app data with permissions.
- **Intents:** messaging between components.
- **Resources:** localization, density, configuration qualifiers.


> Modern apps still host these primitives—**Jetpack wraps**, doesn’t erase them.

Interview Answer:
> **Activities:** foreground UI entry.
---
## Intents: explicit vs implicit; Intent filters; PendingIntent; sticky broadcasts (legacy).
- **Explicit:** class + package—inside your app.
- **Implicit:** action + category + data—system resolves; declare `<intent-filter>` carefully to avoid exported surface surprises.
- **PendingIntent:** delegates future execution with original app identity; mind **mutability flags** (Android 12+), request codes, and **immutable** requirements.
- **Sticky:** historical `sendStickyBroadcast`—largely obsolete/restricted; prefer modern APIs.


> PendingIntents are **security boundaries**—treat them like public APIs.

Interview Answer:
> **Explicit:** class + package—inside your app.
---
## `START_NOT_STICKY` vs `START_STICKY` vs `START_REDELIVER_INTENT`
- **NOT_STICKY:** don’t resurrect unless pending work exists.
- **STICKY:** restart with `null` intent unless pending starts exist—good for long-lived “wait for work” services (still prefer modern alternatives).
- **REDELIVER_INTENT:** replay last intent after kill—downloads/uploads.


> Maps directly to **user-visible correctness** vs **cost**.

Interview Answer:
> **NOT_STICKY:** don’t resurrect unless pending work exists.
---
## Launch modes: `standard`, `singleTop`, `singleTask`, `singleInstance` (corrected interview explanation)
- **standard:** new instance per start (within task rules).
- **singleTop:** reuse top if same activity at top; otherwise new.
- **`singleTask`:** affinity + task rules: if an instance exists in the task, clears above it and routes via `onNewIntent` (simplified—verify manifest `taskAffinity` interactions).
- **`singleInstance`:** activity is alone in its task; subsequent launches route elsewhere—use rarely (widgets/VoIP entry points).
- **Correction note:** Some informal examples online confuse `singleTask` vs `singleInstance` stack pictures—always verify with official docs + logging in a sample app.


> Launch modes interact with **taskAffinity**, **intent flags**, and **deep links**—debug empirically.

Interview Answer:
> **standard:** new instance per start (within task rules).
---
## Processes vs threads vs tasks
- **Process:** isolated memory; components default same process; override with `android:process` for isolation (IPC cost).
- **Thread:** execution unit inside process; **main thread** is UI + event dispatch.
- **Task:** user-facing back stack of activities—NOT identical to process.


> “App in background” often means **activity stopped**, process may still live.

Interview Answer:
> **Process:** isolated memory; components default same process; override with `android:process` for isolation (IPC cost).
---
## Thread safety primitives (volatile/synchronized caveat)
- `volatile` does not compose arbitrary atomicity for read-modify-write; use `Atomic*` or synchronized blocks.
- **Example:** `boolean flag` toggled from multiple threads.


> Concurrency bugs are **intermittent**—design invariants.

Interview Answer:
> `volatile` does not compose arbitrary atomicity for read-modify-write; use `Atomic*` or synchronized blocks.
---
## AIDL vs Messenger (upgrade from oversimplified notes)
- **AIDL:** typed IPC for frequent, rich cross-process calls; generates stubs; requires threading discipline.
- **Messenger:** `Handler`-backed lightweight IPC using `Message` queues—great for simple command/response.
- AIDL complexity vs Messenger throughput limits.


> Pick Messenger unless you **need** a typed high-throughput IPC contract.

Interview Answer:
> **AIDL:** typed IPC for frequent, rich cross-process calls; generates stubs; requires threading discipline.
---
## Parcelable vs Serializable (performance & security framing)
- **Parcelable:** designed for Android IPC performance (prefer `@Parcelize`).
- **Serializable:** Java reflection; more allocations—avoid on hot paths.


> **Parcelize** reduces boilerplate and mistakes.

Interview Answer:
> **Parcelable:** designed for Android IPC performance (prefer `@Parcelize`).
---
## compileSdk vs targetSdk vs minSdk
- **compileSdk:** compile-time API surface.
- **targetSdk:** behavior toggles for compatibility modes; raising it triggers review of behavior changes.
- [**Link:**](https://stackoverflow.com/questions/26694108/what-is-the-difference-between-compilesdkversion-and-targetsdkversion)


> Raising **targetSdk** is a **QA project**, not a one-line change.

Interview Answer:
> **compileSdk:** compile-time API surface.
---
## AsyncTask pitfalls (legacy)
- Not lifecycle-aware; leaks + wrong activity updates on rotation; cancel + retain patterns are obsolete—use structured concurrency.

### Useful links

- [Retain fragment gist (legacy):](https://gist.github.com/vamsitallapudi/26030c15829d7be8118e42b1fcd0fa42)


> If you see AsyncTask in production, schedule **removal**.
---
- [Learn more](https://gist.github.com/vamsitallapudi/26030c15829d7be8118e42b1fcd0fa42)

Interview Answer:
> Not lifecycle-aware; leaks + wrong activity updates on rotation; cancel + retain patterns are obsolete—use structured concurrency.
---
## StrictMode, logging levels, Jetpack pointer
- StrictMode for dev-only main-thread violations.
- [Log level guidance:](https://stackoverflow.com/questions/7959263/android-log-v-log-d-log-i-log-w-log-e-when-to-use-each-one)
- [Jetpack overview:](https://blog.mindorks.com/what-is-android-jetpack-and-why-should-we-use-it)
- [Architecture components:](https://blog.mindorks.com/what-are-android-architecture-components/)


> Operational hygiene matters in **staff** interviews too.

Interview Answer:
> StrictMode for dev-only main-thread violations.
---
## Android code style links
- [Learn more](https://blog.mindorks.com/android-code-style-and-guidelines-d5f80453d5c7)
- [Architecture components LinkedIn post:](https://www.linkedin.com/feed/update/urn:li:activity:7244987022665252864)


> Consistency enables **scale**.

Interview Answer:
> [Learn more](https://blog.mindorks.com/android-code-style-and-guidelines-d5f80453d5c7) [Architecture components LinkedIn post:](https://www.linkedin.com/feed/update/urn:li:activity:7244987022665252864) Consistency enables **scale**.
---
## What is the Android Application Architecture?
- Activities - Provides the window in which the app draws its UI<br>
      - Services − It will perform background functionalities<br>
      - Intent − It will perform the inter connection between activities and the data passing mechanism<br>
      - Resource Externalization − strings and graphics<br>
      - Notification − light,sound,icon,notification,dialog box,and toast<br>
      - Content Providers − It will share the data between applications<br>

Interview Answer:
> Activities - Provides the window in which the app draws its UI<br>Services − It will perform background functionalities<br>Intent − It will perform the inter connection between activities and the data passing mechanism<br>Resource Externalization − strings and…
---
## What is an Activity?
An activity provides the window in which the app draws its UI. This window typically fills the screen, but may be smaller than the screen and float on top of other windows. Generally, one activity implements one screen in an app. For instance, one of an app’s activities may implement a Preferences screen, while another activity implements a Select Photo screen.



> An activity provides the window in which the app draws its UI.

Interview Answer:
> An activity provides the window in which the app draws its UI.
---
## What is `Fragment`?
A `Fragment` is a piece of an activity which enable more modular activity design. A fragment has its layout, its behavior, and its life cycle callbacks. You can add or remove fragments in an activity while the activity is running. You can combine multiple fragments in a single activity to build a multi-pane UI. A fragment can also be used in multiple activities. The fragment life cycle is closely related to its host activity which means when the activity is paused, all the fragments available in the activity will also be stopped.



> A `Fragment` is a piece of an activity which enable more modular activity design.

Interview Answer:
> A `Fragment` is a piece of an activity which enable more modular activity design.
---
## Fragment Lifecycle
<img src="../assets/fragment_lifecycle.png" width="200" alt="Android Fragment lifecycle"> <img src="../assets/fragment_lifecycle_2.png" width="400" alt="Android Fragment lifecycle details">

Interview Answer:
> This topic is answered with the key points above.
---
## What is the correlation between activity and fragment life cycle?
Here is how Activity's and Fragment's lifecyle are called together:<br/>
    <img src="../assets/activity-fragment-lifecycles.png" width="350">



> Here is how Activity's and Fragment's lifecyle are called together:

Interview Answer:
> Here is how Activity's and Fragment's lifecyle are called together:<br/Here is how Activity's and Fragment's lifecyle are called together:
---
## How to pass items to `fragment`?
Using `Bundle` you can pass items to the fragment.



> Using `Bundle` you can pass items to the fragment.

Interview Answer:
> Using `Bundle` you can pass items to the fragment.
---
## How would you communicate between two `fragments`?
There are several ways to communicate two fragments. Using `interfaces` are a common way to do that. You can connect two fragments through interfaces that are implemented in the parent activity.



> There are several ways to communicate two fragments.

Interview Answer:
> There are several ways to communicate two fragments.
---
## Difference between adding/replacing `fragment` in `backstack`?
- `replace` removes the existing `fragment` and adds a new `fragment`. This means when you press back button the fragment that got replaced will be created with its onCreateView being invoked.
- `add` retains the existing fragments and adds a new `fragment` that means existing fragment  will be active and they wont be in 'paused' state hence when a back button is pressed onCreateView is not called for the existing fragment(the fragment which was there before new fragment was added).
      In terms of fragment’s life cycle events `onPause()`, `onResume()`, `onCreateView()` and other life cycle events will be invoked in case of `replace` but they wont be invoked in case of `add`. <br>
     <img src="https://user-images.githubusercontent.com/18071333/109423939-88001a80-7a07-11eb-995e-b7d16c5e51bb.png" width="400"><br>
     <img src="https://user-images.githubusercontent.com/18071333/109423948-95b5a000-7a07-11eb-8aa6-840f01beb236.png" width="400"><br>
     <img src="https://user-images.githubusercontent.com/18071333/109423954-9d754480-7a07-11eb-9e45-ea95fa038feb.png" width="400"><br><br>
      <p align="center">
          <img src="https://user-images.githubusercontent.com/18071333/109424405-7ae42b00-7a09-11eb-94b1-a2d648d7d33e.png" width="400">
          <img src="https://user-images.githubusercontent.com/18071333/109424414-86cfed00-7a09-11eb-848c-0948dc8fceab.png" width="400">
      </p>
      <br>


### Useful links

- [Learn more](https://user-images.githubusercontent.com/18071333/109423939-88001a80-7a07-11eb-995e-b7d16c5e51bb.png)
- [Learn more](https://user-images.githubusercontent.com/18071333/109423948-95b5a000-7a07-11eb-8aa6-840f01beb236.png)
- [Learn more](https://user-images.githubusercontent.com/18071333/109423954-9d754480-7a07-11eb-9e45-ea95fa038feb.png)
- [Learn more](https://user-images.githubusercontent.com/18071333/109424405-7ae42b00-7a09-11eb-94b1-a2d648d7d33e.png)
- [Learn more](https://user-images.githubusercontent.com/18071333/109424414-86cfed00-7a09-11eb-848c-0948dc8fceab.png)
---
- [Learn more](https://user-images.githubusercontent.com/18071333/109424414-86cfed00-7a09-11eb-848c-0948dc8fceab.png)

Interview Answer:
> `replace` removes the existing `fragment` and adds a new `fragment`.
---
## What is the difference between Dialog and DialogFragment?
- **Dialog** is a small window that prompts the user to make a decision or enter additional information. Instead, `dialogFragment` is a fragment that displays a dialog windows and contains a dialog object. <br>
- **DialogFragment** does various things to keep the fragment's lifecycle driving it, instead of the Dialog. Dialogs are generally autonomous entities -- they are their own window, receiving their own input events, and often deciding on their own when to disappear. DialogFragment needs to ensure that what is happening with the Fragment and Dialog states remains consistent. To do this, it watches for dismiss events from the dialog and takes care of removing its own state when they happen.

Interview Answer:
> **Dialog** is a small window that prompts the user to make a decision or enter additional information.
---
## What is the difference between `apply()` and `commit()` in `sharedPreferences`?
- `commit()` writes the data **synchronously** and returns a boolean value of success or failure depending on the result immediately.
- `apply()` is **asynchronous** and it won’t return any boolean response. Also if there is an `apply()` outstanding and we perform another `commit()`, The `commit()` will be blocked until the `apply()` is not completed.

Interview Answer:
> `commit()` writes the data **synchronously** and returns a boolean value of success or failure depending on the result immediately.
---
## What is Pending Intent in Android?
Pending Intent is an intent which you want to trigger at some time in future, even when your application is not alive. This intent can be used by other application which allows it to execute that intent with the same permissions as of our application.  <br>


PendingIntent uses the following methods to handle the different types of intents:


### Code example

```kotlin
Intent intent = new Intent(this, AnyActivity.class);

// Creating a pending intent and wrapping our intent
PendingIntent pendingIntent = PendingIntent.getActivity(this, 1, intent, PendingIntent.FLAG_UPDATE_CURRENT);
try {
    // Perform the operation associated with our pendingIntent
    pendingIntent.send();
} catch (PendingIntent.CanceledException e) {
    e.printStackTrace();
}
```

```kotlin
PendingIntent.getActivity();   // Retrieves a PendingIntent to start an Activity
PendingIntent.getBroadcast(); // Retrieves a PendingIntent to perform a Broadcast
PendingIntent.getService();  // Retrieves a PendingIntent to start a Service
```


> Pending Intent is an intent which you want to trigger at some time in future, even when your application is not alive.

Interview Answer:
> Pending Intent is an intent which you want to trigger at some time in future, even when your application is not alive.
---
## What are Processes in Android?
Everytime an Android App starts, the Android System creates a New Process for this Application with a Single thread of Execution. By default all the components of the same application runs in the same process. While most apps donot change this behavior, some apps like games, might want to run in different processes. Then we can use *android:process* attribute in our AndroidManifest.xml to specify the process name.



> Everytime an Android App starts, the Android System creates a New Process for this Application with a Single thread of Execution.

Interview Answer:
> Everytime an Android App starts, the Android System creates a New Process for this Application with a Single thread of Execution.
---
## Compilesdkversion vs Targetsdkversion
- `compileSdk` is the API level used to compile the app.
- `targetSdk` opts the app into behavior changes for that API level.
- `minSdk` is the oldest Android version the app supports.


### Useful links

- [Learn more](https://stackoverflow.com/questions/26694108/what-is-the-difference-between-compilesdkversion-and-targetsdkversion)
---
- [Learn more](https://stackoverflow.com/questions/26694108/what-is-the-difference-between-compilesdkversion-and-targetsdkversion)

Interview Answer:
> `compileSdk` affects compilation, `targetSdk` affects platform behavior, and `minSdk` defines device compatibility.
---
## Which method in `fragment` runs only once?
According to the [documentation](https://developer.android.com/guide/components/fragments#Creating), the `onCreate()` method is called once a fragment is created. Within your implementation, you should initialize essential components of the fragment that you want to retain when the fragment is paused or stopped, then resumed.


### Useful links

- [documentation](https://developer.android.com/guide/components/fragments#Creating)



> According to the [documentation](https://developer.
---
- [Learn more](https://developer)

Interview Answer:
> According to the [documentation](https://developer.android.com/guide/components/fragments#Creating), the `onCreate()` method is called once a fragment is created.
---
## How to know `configChange` happens in `onDestroy()` function?
Once an activity is in the process of finishing then `isFinishing()` method is returned `true` value, otherwise `false` when the system is temporarily destroying the instance of the activity.



> Once an activity is in the process of finishing then `isFinishing()` method is returned `true` value, otherwise `false` when the system is temporarily destroying the instance of the activity.

Interview Answer:
> Once an activity is in the process of finishing then `isFinishing()` method is returned `true` value, otherwise `false` when the system is temporarily destroying the instance of the activity.
---
## How to handle crashing of AsyncTask during screen rotation?
One way is by cancelling the AsyncTask by using cancel() method on its instance. It will call onCancelled() method of AsyncTask where we can do some clean-up activities like hiding progress bar etc.  <br>
The best way to handle AsyncTask crash is to create a RetainFragment, i.e., a fragment without UI as shown in the list below: https://gist.github.com/vamsitallapudi/26030c15829d7be8118e42b1fcd0fa42  <br>
We can also avoid this crash by using 2 Alternatives -  <br>
1) Using RxJava by subscribing and unsubscribing at onResume() and onPause() methods respectively. <br>
2) Using LiveData - lifecycle aware component.


### Useful links

- [Learn more](https://gist.github.com/vamsitallapudi/26030c15829d7be8118e42b1fcd0fa42)



> One way is by cancelling the AsyncTask by using cancel() method on its instance.
---
- [Learn more](https://gist.github.com/vamsitallapudi/26030c15829d7be8118e42b1fcd0fa42)

Interview Answer:
> One way is by cancelling the AsyncTask by using cancel() method on its instance.
---
## How does the activity respond when orientation is changed?
According to the [documentation](https://developer.android.com/guide/topics/resources/runtime-changes), Some device configurations can change during runtime (such as screen orientation, keyboard availability, and when the user enables multi-window mode). When such a change occurs, Android restarts the running `Activity` ( `onDestroy()` is called, followed by `onCreate()`). The restart behavior is designed to help your application adapt to new configurations by automatically reloading your application with alternative resources that match the new device configuration.


### Useful links

- [documentation](https://developer.android.com/guide/topics/resources/runtime-changes)



> According to the [documentation](https://developer.
---
- [Learn more](https://developer)

Interview Answer:
> According to the [documentation](https://developer.android.com/guide/topics/resources/runtime-changes), Some device configurations can change during runtime (such as screen orientation, keyboard availability, and when the user enables multi-window mode).
---
## How to prevent the data from reloading when orientation is changed?
The most basic approach would be to use a combination of `ViewModels` and `onSaveInstanceState()`. A `ViewModel` is LifeCycle-Aware. In other words, a `ViewModel` will not be destroyed if its owner is destroyed for a configuration change (e.g. rotation). The new instance of the owner will just re-connected to the existing `ViewModel`. So if you rotate an `Activity` three times, you have just created three different `Activity` instances, but you only have one `ViewModel`. So the common practice is to store data in the `ViewModel` class (since it persists data during configuration changes) and use `OnSaveInstanceState()` to store small amounts of UI data.



> The most basic approach would be to use a combination of `ViewModels` and `onSaveInstanceState()`.

Interview Answer:
> The most basic approach would be to use a combination of `ViewModels` and `onSaveInstanceState()`.
---
## What is thread-safe mean? How we can make our code thread-safe?
Thread safety in java is the process to make our program safe to use in multithreaded environment, there are different ways through which we can make our program thread safe.
- Synchronization
- Use of Atomic Wrapper, For example AtomicInteger.
- Use of locks from java.util.concurrent.locks package.
- Using thread safe collection classes
- Using volatile keyword.

Note that if two threads are both reading and writing to a shared variable, then using the volatile keyword for that is not enough. You need to use a synchronized in that case to guarantee that the reading and writing of the variable is atomic. Reading or writing a volatile variable does not block threads reading or writing. For this to happen you must use the synchronized keyword around critical sections.



> Thread safety in java is the process to make our program safe to use in multithreaded environment, there are different ways through which we can make our program thread safe.

Interview Answer:
> Thread safety in java is the process to make our program safe to use in multithreaded environment, there are different ways through which we can make our program thread safe.
---
## AIDL vs Messenger Queue
* AIDL is for purpose when you've to go application level communication for data and control sharing, a scenario depicting it can be : An app requires list of all contacts from Contacts app (content part lies here) plus it also wants to show the call's duration and you can also disconnect it from that app (control part lies here).
* In Messenger queues you're more IN the application and working on threads and processes to manage the queue having messages so no Outside services interference here.
* Messenger is needed if you want to bind a remote service (e.g. running in another process).

Interview Answer:
> AIDL is for purpose when you've to go application level communication for data and control sharing, a scenario depicting it can be : An app requires list of all contacts from Contacts app (content part lies here) plus it also wants to show the call's duration and you can also…
---
## What is a ThreadPool? And is it more effective than using several separate Threads?
* Creating and destroying threads has a high CPU usage, so when we need to perform lots of small, simple tasks concurrently, the overhead of creating our own threads can take up a significant portion of the CPU cycles and severely affect the final response time.
* ThreadPool consists of a task queue and a group of worker threads, which allows it to run multiple parallel instances of a task.

Interview Answer:
> Creating and destroying threads has a high CPU usage, so when we need to perform lots of small, simple tasks concurrently, the overhead of creating our own threads can take up a significant portion of the CPU cycles and severely affect the final response time.
---
## What is a JobScheduler?
- JobScheduler schedules deferrable background work using conditions such as network or charging.
- The system controls the exact execution time to protect battery.
- Prefer WorkManager for most app-level persistent jobs.


### Useful links

- [Learn more](http://www.vogella.com/tutorials/AndroidTaskScheduling/article.html)
---
- [Learn more](http://www.vogella.com/tutorials/AndroidTaskScheduling/article.html)

Interview Answer:
> JobScheduler schedules constrained background jobs, while WorkManager is usually the modern app-level choice.
---
## Livedata Setvalue vs Postvalue
- `setValue()` updates LiveData immediately and must run on the main thread.
- `postValue()` schedules an update from a background thread.
- Several quick `postValue()` calls may be coalesced, so the latest value can win.


### Useful links

- [Learn more](https://medium.com/@shashankmohabia/livedata-setvalue-vs-postvalue-91ec550b4c80)
---
- [Learn more](https://medium.com/@shashankmohabia/livedata-setvalue-vs-postvalue-91ec550b4c80)

Interview Answer:
> Use `setValue()` on the main thread and `postValue()` from a background thread.
---
## What is renderscript?
- RenderScript was an Android API for compute-heavy operations.
- It is deprecated and should not be used for new code.
- Consider Kotlin, optimized libraries, GPU APIs, or the NDK for current needs.


### Useful links

- [Learn more](https://blog.mindorks.com/comparing-android-ndk-and-renderscript-1a718c01f6fe)
---
- [Learn more](https://blog.mindorks.com/comparing-android-ndk-and-renderscript-1a718c01f6fe)

Interview Answer:
> RenderScript is a deprecated compute API; use modern supported alternatives for new work.
---
## FlatBuffers vs JSON.
- JSON is text-based, human-readable, and easy to debug.
- FlatBuffers is a compact binary format with fast access and low parsing overhead.
- Use FlatBuffers for performance-sensitive structured data; use JSON for flexible APIs and readability.


### Useful links

- [Learn more](https://blog.mindorks.com/why-consider-flatbuffer-over-json-2e4aa8d4ed07)
---
- [Learn more](https://blog.mindorks.com/why-consider-flatbuffer-over-json-2e4aa8d4ed07)

Interview Answer:
> JSON favors readability and flexibility; FlatBuffers favors compact size and fast access.
---
## What is `contentProvider` and what is typically used for?
A `ContentProvider` provides data from one application to another, when requested. It manages access to a structured set of data. It provides mechanisms for defining data security. [Learn more](https://medium.com/@sanjeevy133/an-idiots-guide-to-android-content-providers-part-1-970cba5d7b42).
    For further reading see the [official android documentation]("https://developer.android.com/guide/topics/providers/content-provider-basics" "Android official documentation")

  <img src="../assets/content-provider-diagram.png" width="400">


### Useful links

- [Learn more](https://medium.com/@sanjeevy133/an-idiots-guide-to-android-content-providers-part-1-970cba5d7b42)
- [Learn more](https://developer.android.com/guide/topics/providers/content-provider-basics)



> A `ContentProvider` provides data from one application to another, when requested.

Interview Answer:
> A `ContentProvider` provides data from one application to another, when requested.
---
## Log.v(), Log.d(), Log.i(), Log.w(), Log.e() - When to use each one?
- `VERBOSE`: very detailed development diagnostics.
- `DEBUG`: developer troubleshooting.
- `INFO`: important normal application events.
- `WARN`: unexpected but recoverable conditions.
- `ERROR`: failures that need investigation.
- Never log tokens, passwords, or personal data.


### Useful links

- [Learn more](https://stackoverflow.com/questions/7959263/android-log-v-log-d-log-i-log-w-log-e-when-to-use-each-one)
---
- [Learn more](https://stackoverflow.com/questions/7959263/android-log-v-log-d-log-i-log-w-log-e-when-to-use-each-one)

Interview Answer:
> Choose log levels by severity and remove or protect sensitive data before release.
---
## Understanding scope storage in android
- Scoped storage limits broad access to shared external files.
- Use app-specific storage for private files.
- Use MediaStore for shared photos, videos, and audio.
- Use the Storage Access Framework when the user selects documents.


### Useful links

- [Learn more](https://blog.mindorks.com/understanding-the-scoped-storage-in-android)
---
- [Learn more](https://blog.mindorks.com/understanding-the-scoped-storage-in-android)

Interview Answer:
> Scoped storage protects shared files; use app storage, MediaStore, or the Storage Access Framework according to the file’s purpose.
---
## Solve out of memory error
- Capture a heap dump and identify the object retaining excessive memory.
- Load large images at the display size and use an image-loading library.
- Avoid holding Activity or View references in long-lived objects.
- Page large datasets and release caches when memory is low.


### Useful links

- [Learn more](https://blog.mindorks.com/practical-guide-to-solve-out-of-memory-error-in-android-application)
---
- [Learn more](https://blog.mindorks.com/practical-guide-to-solve-out-of-memory-error-in-android-application)

Interview Answer:
> Find the retaining object, reduce large allocations, page data, and release lifecycle-bound resources.
---
## Reason for the exit in Android Application
- The user may finish the Activity or remove the task.
- The system may kill the process to reclaim memory.
- A crash, force-stop, or device restart can also end the process.
- Save important state because process death can happen without a final callback.


### Useful links

- [Learn more](https://blog.mindorks.com/reason-of-exit-in-android-application/)
---
- [Learn more](https://blog.mindorks.com/reason-of-exit-in-android-application/)

Interview Answer:
> An app can exit because of user action, a crash, force-stop, restart, or system process reclamation.
---
## Android Jetpack component
- Jetpack is a collection of Android libraries and guidance.
- It includes lifecycle, ViewModel, Room, Navigation, WorkManager, Compose, and more.
- These components reduce boilerplate and encourage lifecycle-aware design.


### Useful links

- [Learn more](https://blog.mindorks.com/what-is-android-jetpack-and-why-should-we-use-it)
---
- [Learn more](https://blog.mindorks.com/what-is-android-jetpack-and-why-should-we-use-it)

Interview Answer:
> Jetpack provides compatible libraries that simplify modern Android architecture, UI, persistence, and background work.
---
## Android Architecture Component
- Architecture Components include lifecycle-aware APIs, ViewModel, Room, and observable data tools.
- They separate UI state from data and help screens survive configuration changes.
- Modern apps commonly use these with coroutines, Flow, and Compose.


### Useful links

- [Learn more](https://blog.mindorks.com/what-are-android-architecture-components/)
---
- [Learn more](https://blog.mindorks.com/what-are-android-architecture-components/)

Interview Answer:
> Android Architecture Components help separate UI, state, data, and lifecycle concerns in a testable way.
---
## Arraymap vs Sparsh Array
- `ArrayMap` stores key-value pairs with less memory than `HashMap` for small collections.
- `SparseArray` stores integer keys without boxing and is useful for small Android collections.
- `HashMap` is generally faster for large collections or frequent updates.


### Useful links

- [Learn more](https://blog.mindorks.com/android-app-optimization-using-arraymap-and-sparsearray-f2b4e2e3dc47)
---
- [Learn more](https://blog.mindorks.com/android-app-optimization-using-arraymap-and-sparsearray-f2b4e2e3dc47)

Interview Answer:
> Use `ArrayMap` or `SparseArray` for small Android collections; use `HashMap` for larger or heavily accessed maps.
---
## Java Android Multithreading programming
- Keep blocking work off the main thread.
- Use coroutines with structured concurrency for new Kotlin code.
- Use executors for controlled Java-style task pools.
- Protect shared mutable state with synchronization or atomic types.


### Useful links

- [Learn more](https://blog.mindorks.com/java-android-multithreaded-programming-runnable-callable-future-executor)
---
- [Learn more](https://blog.mindorks.com/java-android-multithreaded-programming-runnable-callable-future-executor)

Interview Answer:
> Use lifecycle-aware coroutines or bounded executors, and protect shared state from races.
---
## How can you prevent creating another instance of singleton using `clone()` method?
The preferred way to prevent creating another instance of a singleton is by not implementing Cloneable interface and if you do just throw an exception from `clone()` method "_not to create a clone of singleton class_".



> The preferred way to prevent creating another instance of a singleton is by not implementing Cloneable interface and if you do just throw an exception from `clone()` method "_not to create a clone of singleton class_".

Interview Answer:
> The preferred way to prevent creating another instance of a singleton is by not implementing Cloneable interface and if you do just throw an exception from `clone()` method "_not to create a clone of singleton class_".
---
## When will you prefer to use a Factory Pattern?
The factory pattern is preferred in the following cases:
      - A class does not know which class of objects it must create
      - Factory pattern can be used where we need to create an object of any one of sub-classes depending on the data provided
      - you can use factory pattern where you have to create an object of any one of sub-classes depending on the given data



> The factory pattern is preferred in the following cases: - A class does not know which class of objects it must create - Factory pattern can be used where we need to create an object of any one of sub-classes depending o…

Interview Answer:
> The factory pattern is preferred in the following cases: A class does not know which class of objects it must create Factory pattern can be used where we need to create an object of any one of sub-classes depending on the data provided you can use factory pattern where you have…
---
## Why use a factory class to instantiate a class when we can use new operator?
Factory classes provide flexibility in terms of design. Below are some of the
    benefits of factory class:
      - Factory design pattern results in more decoupled code as it allows us to
        hide creational logic from dependent code
      - It allows us to introduce an [Inversion of Control]("https://www.codeproject.com/Articles/592372/Dependency-Injection-DI-vs-Inversion-of-Control-IO" "What is IoC?") container
      - It gives you a lot more flexibility when it comes time to change the
        application as our creational logic is hidden from dependant code


### Useful links

- [Learn more](https://www.codeproject.com/Articles/592372/Dependency-Injection-DI-vs-Inversion-of-Control-IO)



> Factory classes provide flexibility in terms of design.
---
- [Learn more](https://www.codeproject.com/Articles/592372/Dependency-Injection-DI-vs-Inversion-of-Control-IO)

Interview Answer:
> Factory classes provide flexibility in terms of design.
---
## which pattern is used when we need to decouple an abstraction from its implementation?
When we want to decouple an abstraction from its implementation in order that two can vary independently we use **bridge pattern**.



> When we want to decouple an abstraction from its implementation in order that two can vary independently we use **bridge pattern**.

Interview Answer:
> When we want to decouple an abstraction from its implementation in order that two can vary independently we use **bridge pattern**.
---
## What is Manifest file and R.java file in Android?
* **Manifest**: Every application must have an AndroidManifest.xml file (with precisely that name) in its root directory. The manifest presents essential information about the application to the Android system, information the system must have before it can run any of the application's code. It contains information of your package, including components of the application such as activities, services, broadcast receivers, content providers etc.
 * **R.Java**: It is an auto-generated file by aapt (Android Asset Packaging Tool) that contains resource IDs for all the resources of res/ directory. <br>

* **How does the activity respond when the user rotates the screen?** <br>
     When the screen is rotated, the current instance of activity is destroyed a new instance of the Activity is created in the new orientation. The onRestart() method is invoked first when a screen is rotated. The other lifecycle methods get invoked in the similar flow as they were when the activity was first created.<br>

Interview Answer:
> **Manifest**: Every application must have an AndroidManifest.xml file (with precisely that name) in its root directory.
---
## Mention two ways to clear the back stack of Activities when a new Activity is called using intent
The first approach is to use a FLAG_ACTIVITY_CLEAR_TOP flag. The second way is by using FLAG_ACTIVITY_CLEAR_TASK and FLAG_ACTIVITY_NEW_TASK in conjunction.<br>



> The first approach is to use a FLAG_ACTIVITY_CLEAR_TOP flag.

Interview Answer:
> The first approach is to use a FLAG_ACTIVITY_CLEAR_TOP flag.
---
## Describe content providers
* A ContentProvider provides data from one application to another, when requested. It manages access to a structured set of data.  It provides mechanisms for defining data security. ContentProvider is the standard interface that connects data in one process with code running in another process.<br>
 * When you want to access data in a **ContentProvider**, you must instead use the ContentResolver object in your application’s Context to communicate with the provider as a client. The provider object receives data requests from clients, performs the requested action, and returns the results.<br>

Interview Answer:
> A ContentProvider provides data from one application to another, when requested.
---
## What is the onTrimMemory() method?
* ```onTrimMemory()```: Called when the operating system has determined that it is a good time for a process to trim unneeded memory from its process. This will happen for example when it goes in the background and there is not enough memory to keep as many background processes running as desired.
* Android can reclaim memory for from your app in several ways or kill your app entirely if necessary to free up memory for critical tasks. To help balance the system memory and avoid the system's need to kill your app process, you can implement the ```ComponentCallbacks2``` interface in your Activity classes. The provided onTrimMemory() callback method allows your app to listen for memory related events when your app is in either the foreground or the background, and then release objects in response to app lifecycle or system events that indicate the system needs to reclaim memory. [Reference](https://developer.android.com/topic/performance/memory)<br>


### Useful links

- [Reference](https://developer.android.com/topic/performance/memory)
---
- [Learn more](https://developer.android.com/topic/performance/memory)

Interview Answer:
> : Called when the operating system has determined that it is a good time for a process to trim unneeded memory from its process.
---
## What is an intent?
Intents are messages that can be used to pass information to the various components of android. For instance, launch an activity, open a webview etc.<br>
* Two types of intents-<br>
* Implicit: Implicit intent is when you call system default intent like send email, send SMS, dial number.<br>
* Explicit: Explicit intent is when you call an application activity from another activity of the same application.<br>

Interview Answer:
> Intents are messages that can be used to pass information to the various components of android.
---
## What is a Sticky Intent?
* Sticky Intents allows communication between a function and a service.
 * ```sendStickyBroadcast()``` performs a sendBroadcast(Intent) known as sticky, i.e. the Intent you are sending stays around after the broadcast is complete, so that others can quickly retrieve that data through the return value of ```registerReceiver(BroadcastReceiver, IntentFilter)```.
 * For example, if you take an intent for ACTION_BATTERY_CHANGED to get battery change events: When you call registerReceiver() for that action — even with a null BroadcastReceiver — you **get the Intent that was last Broadcast for that action**. Hence, you can use this to find the state of the battery without necessarily registering for all future state changes in the battery.<br>

Interview Answer:
> Sticky Intents allows communication between a function and a service.
---
## Describe fragments:
Fragment is a UI entity attached to Activity. Fragments can be reused by attaching in different activities. Activity can have multiple fragments attached to it. Fragment must be attached to an activity and its lifecycle will depend on its host activity.<br>



> Fragment is a UI entity attached to Activity.

Interview Answer:
> Fragment is a UI entity attached to Activity.
---
## What is the difference between fragments & activities. Explain the relationship between the two.
An Activity is an application component that provides a screen, with which users can interact in order to do something whereas a Fragment represents a behavior or a portion of user interface in an Activity (with its own lifecycle and input events, and which can be added or removed at will).<br>



> An Activity is an application component that provides a screen, with which users can interact in order to do something whereas a Fragment represents a behavior or a portion of user interface in an Activity (with its own lifecycle and input events, and which can be added or removed at will).

Interview Answer:
> An Activity is an application component that provides a screen, with which users can interact in order to do something whereas a Fragment represents a behavior or a portion of user interface in an Activity (with its own lifecycle and input events, and which can be added or…
---
## Why is it recommended to use only the default constructor to create a Fragment?
The reason why you should be passing parameters through bundle is because when the system restores a fragment (e.g on config change), it will automatically restore your bundle. This way you are guaranteed to restore the state of the fragment correctly to the same state the fragment was initialised with.<br>



> The reason why you should be passing parameters through bundle is because when the system restores a fragment (e.

Interview Answer:
> The reason why you should be passing parameters through bundle is because when the system restores a fragment (e.g on config change), it will automatically restore your bundle.
---
## You’re replacing one Fragment with another — how do you ensure that the user can return to the previous Fragment, by pressing the Back button?
We need to save each Fragment transaction to the backstack, by calling ```addToBackStack()``` before you ```commit()``` that transaction<br>

> We need to save each Fragment transaction to the backstack, by calling ```addToBackStack()``` before you ```commit()``` that transaction

Interview Answer:
> We need to save each Fragment transaction to the backstack, by calling before you that transaction<br>We need to save each Fragment transaction to the backstack, by calling before you that transaction
---
## Callbacks invoked during addition of a fragment to back stack and while popping back from back stack:
- *(No additional notes in source.)*


### Code example

`addOnBackStackChangedListener` is called when fragment is added or removed from the backstack. Use this [link](https://why-android.com/2016/03/29/learn-how-to-use-the-onbackstackchangedlistener/) for reference<br>
`addOnBackStackChangedListener` is called when fragment is added or removed from the backstack.

Interview Answer:
> *(No additional notes in source.)* is called when fragment is added or removed from the backstack.
---
## What are retained fragments
By default, Fragments are destroyed and recreated along with their parent Activity’s when a configuration change occurs. Calling ```setRetainInstance(true)``` allows us to bypass this destroy-and-recreate cycle, signaling the system to retain the current instance of the fragment when the activity is recreated.<br>

> By default, Fragments are destroyed and recreated along with their parent Activity’s when a configuration change occurs.

Interview Answer:
> By default, Fragments are destroyed and recreated along with their parent Activity’s when a configuration change occurs.
---
## What is Toast in Android?
Android Toast can be used to display information for the short period of time. A toast contains message to be displayed quickly and disappears after sometime.<br>



> Android Toast can be used to display information for the short period of time.

Interview Answer:
> Android Toast can be used to display information for the short period of time.
---
## What is the difference between a regular .png and a nine-patch image?
It is one of a resizable bitmap resource which is being used as backgrounds or other images on the device. The NinePatch class allows drawing a bitmap in nine sections. The four corners are unscaled; the middle of the image is scaled in both axes, the four edges are scaled into one axis.<br>



> It is one of a resizable bitmap resource which is being used as backgrounds or other images on the device.

Interview Answer:
> It is one of a resizable bitmap resource which is being used as backgrounds or other images on the device.
---
## Briefly describe some ways that you can optimize View usage
* Checking for excessive overdraw: install your app on an Android device, and then enable the "Debug GPU Overview" option.
* Flattening your view hierarchy: inspect your view hierarchy using Android Studio’s ‘Hierarchy Viewer’ tool.
* Measuring how long it takes each View to complete the measure, layout, and draw phases. You can also use Hierarchy Viewer to identify any parts of the rendering pipeline that you need to optimize.<br>

Interview Answer:
> Checking for excessive overdraw: install your app on an Android device, and then enable the "Debug GPU Overview" option.
---
## What is a singleton class in Android?
A singleton class is a class which can create only an object that can be shared all other classes.

### Code example

```kotlin
private static volatile RESTService instance;

protected RESTService(Context context) {
    super(context);
}

public static RESTService getInstance(Context context) {
    if (instance == null) {
        synchronized (RESTService.class) {
            if (instance == null) instance = new RESTService(context);
        }
    }
    return instance;
}
```


> A singleton class is a class which can create only an object that can be shared all other classes.

Interview Answer:
> A singleton class is a class which can create only an object that can be shared all other classes.
---
## How to handle multi-touch in android
- Handle pointer IDs, not only pointer indexes.
- Process `ACTION_DOWN`, `ACTION_POINTER_DOWN`, movement, and pointer-up events correctly.
- Use `scaleGestureDetector` for pinch-to-zoom.
- Test different pointer orders and cancellation events.


### Useful links

- [link](https://arjun-sna.github.io/android/2016/07/20/multi-touch-android/)
---
- [Learn more](https://arjun-sna.github.io/android/2016/07/20/multi-touch-android/)

Interview Answer:
> Multi-touch handling requires tracking each pointer ID and correctly processing pointer lifecycle events.
---
## What is Alarm Manager?
AlarmManager is a class which helps scheduling your Application code to run at some point of time or at particular time intervals in future. When an alarm goes off, the Intent that had been registered for it is broadcast by the system, automatically starting the target application if it is not already running. Registered alarms are retained while the device is asleep (and can optionally wake the device up if they go off during that time), but will be cleared if it is turned off and rebooted.



> AlarmManager is a class which helps scheduling your Application code to run at some point of time or at particular time intervals in future.

Interview Answer:
> AlarmManager is a class which helps scheduling your Application code to run at some point of time or at particular time intervals in future.
---
## How to Work With Geofences?
- Request location permission and explain the feature clearly.
- Register a geofence with latitude, longitude, radius, and transition types.
- Receive transitions through a `PendingIntent` and validate the event.
- Use reasonable expiration, debounce events, and respect battery limits.


### Useful links

- [Learn more](https://code.tutsplus.com/how-to-work-with-geofences-on-android--cms-26639t)
---
- [Learn more](https://code.tutsplus.com/how-to-work-with-geofences-on-android--cms-26639t)

Interview Answer:
> Geofences trigger a `PendingIntent` when a device enters or leaves a configured region; permissions and battery limits matter.
---
## How to save password safely in Android?
- [Learn more](https://developer.android.com/privacy-and-security/keystore)
      - [Learn more](https://medium.com/@josiassena/using-the-android-keystore-system-to-store-sensitive-information-3a56175a454b)
      - [Learn more](https://source.android.com/docs/security/features/keystore)
      - [Learn more](https://www.linkedin.com/feed/update/urn:li:activity:7240434808684716032/)


### Useful links

- [Learn more](https://developer.android.com/privacy-and-security/keystore)
- [Learn more](https://medium.com/@josiassena/using-the-android-keystore-system-to-store-sensitive-information-3a56175a454b)
- [Learn more](https://source.android.com/docs/security/features/keystore)
- [Learn more](https://www.linkedin.com/feed/update/urn:li:activity:7240434808684716032/)
---
- [Learn more](https://www.linkedin.com/feed/update/urn:li:activity:7240434808684716032/)

Interview Answer:
> [Learn more](https://developer.android.com/privacy-and-security/keystore) [Learn more](https://medium.com/@josiassena/using-the-android-keystore-system-to-store-sensitive-information-3a56175a454b) [Learn more](https://source.android.com/docs/security/features/keystore) [Learn…
---
## What is Anti-Pattern?
An anti-pattern are certain patterns in software development that are considered bad programming practices.<br/>
      For more, click [Here](https://stackoverflow.com/a/980616/3424919).


### Useful links

- [Here](https://stackoverflow.com/a/980616/3424919)



> An anti-pattern are certain patterns in software development that are considered bad programming practices.
---
- [Learn more](https://stackoverflow.com/a/980616/3424919)

Interview Answer:
> An anti-pattern are certain patterns in software development that are considered bad programming practices.<br/For more, click [Here](https://stackoverflow.com/a/980616/3424919).
---
## What is the use-case of @Module Annotation?
@Module is the Annotation used on the class for the Dagger to look inside it, to provide dependencies. We may be declaring methods inside the module class that are enclosed with @Provides annotation.



> @Module is the Annotation used on the class for the Dagger to look inside it, to provide dependencies.

Interview Answer:
> @Module is the Annotation used on the class for the Dagger to look inside it, to provide dependencies.
---
## Graphs
* [Clone a Directed Graph](/src/graphs/CloneDirectedGraph.java)
* [Minimum Spanning Tree](/src/graphs/MinimumSpanningTree.java)
* [Form circular chain by given list of words](/src/graphs/WordChaining.java)
     <br>

Interview Answer:
> [Clone a Directed Graph](/src/graphs/CloneDirectedGraph.java) [Minimum Spanning Tree](/src/graphs/MinimumSpanningTree.java) [Form circular chain by given list of words](/src/graphs/WordChaining.java) <br>
---
## Trees
* [Implements an InOrder Iterator on a Binary Tree](/src/trees/BinaryTreeIterator.java)
* [Convert a binary tree to a doubly linked list](/src/trees/BinaryTreeToLinkedList.java)
* [Connect a sibling pointer of a binary tree to next node in the same level](/src/trees/ConnectAllSiblings.java)
* [Given a binary tree, connect its siblings at each level](/src/trees/ConnectSiblings.java)
* [Delete any subtrees whose nodes sum up to zero](/src/trees/DeleteZeroSumSubTrees.java)
* [Given roots of two binary trees, determine if these trees are identical](/src/trees/IdenticalBinaryTree.java)
* [Find the Inorder successor of a node in binary Search Tree](/src/trees/InOrderSuccessor.java)
* [Algorithm to traverse the tree inorder](/src/trees/InOrderTraversal.java)
* [Check if a given tree is a binary search tree](/src/trees/IsBST.java)
* [Display node values at each level in a binary tree](/src/trees/LevelOrderTraversal.java)
* [Swap the 'left' and 'right' children for each node in a binary tree](/src/trees/MirrorBinaryTreeNodes.java)
* [Find nth highest node in a Binary Search Tree](/src/trees/NthHighestBST.java)
* [Print nodes forming the boundary of a Binary Search Tree](/src/trees/PrintTreePerimeter.java)
* [Serialize binary tree to a file and then deserialize back to tree](/src/trees/SerializeBinaryTree.java)
     <br>

Interview Answer:
> [Implements an InOrder Iterator on a Binary Tree](/src/trees/BinaryTreeIterator.java) [Convert a binary tree to a doubly linked list](/src/trees/BinaryTreeToLinkedList.java) [Connect a sibling pointer of a binary tree to next node in the same…
---
## Strings
* [Reverse String](/src/strings/ReverseString.java)
* [Palindrone String](/src/strings/PalindroneStrings.java)
* [Regular Expression](/src/strings/RegularExpression.java)
* [Remove Duplicates](/src/strings/RemoveDuplicates.java)
* [Remove White Spaces](/src/strings/RemoveWhiteSpaces.java)
* [Remove a String](/src/strings/ReverseString.java)
* [String Segmentation](/src/strings/StringSegmentation.java)
* [Find next highest permutation of a given string](/src/strings/NextHighestPermutation.java)
* [Check if two strings are anagrams](/src/strings/CheckIfAnagram.java)
     <br>

Interview Answer:
> [Reverse String](/src/strings/ReverseString.java) [Palindrone String](/src/strings/PalindroneStrings.java) [Regular Expression](/src/strings/RegularExpression.java) [Remove Duplicates](/src/strings/RemoveDuplicates.java) [Remove White Spaces](/src/strings/RemoveWhiteSpaces.java)…
---
## Integers
* [Reverse Integer](/src/math/ReverseInteger.java)
* [Find sum of digits of an integer](/src/math/FindSumOfInteger.java)
* [Find Next highest Number from a Integer](/src/math/NextHighestNumber.java)
* [Check if it is an Armstrong number](/src/math/CheckIfArmstrongNumber.java)
* [Find the factorial of a number](/src/math/FindFactorial.java)
* [Print all prime numbers upto the given number](/src/math/PrintPrimeNumbers.java)
* [Find all the prime factors of a given integer](/src/math/FindPrimeFactors.java)
* [Check if a given number is binary](/src/math/CheckIfBinary.java)
* [Find kth permutation](/src/math/KthPermutation.java)
* [Integer Division](/src/math/IntegerDivision.java)
* [Find Pythagorean Triplets](/src/math/FindPythagoreanTriplets.java)
* [Print all possible sum combinations using positive integers](/src/math/SumCombinations.java)
* [Find Missing Number](/src/math/FindMissingNumber.java)
* [Find all subsets of a given set of integers](/src/math/IntegerSubsets.java)
* [Given an input string, determine if it makes a valid number](/src/math/NumberValidity.java)
* [Calculate 'x' raised to the power 'n'](/src/math/PowerOfNumber.java)
* [Calculate square root of a number](/src/math/CalculateRoot.java)
* [Minimum Number of Platforms Required for a Railway/Bus Station](/src/math/MinimumPlatforms.java)
     <br>

Interview Answer:
> [Reverse Integer](/src/math/ReverseInteger.java) [Find sum of digits of an integer](/src/math/FindSumOfInteger.java) [Find Next highest Number from a Integer](/src/math/NextHighestNumber.java) [Check if it is an Armstrong number](/src/math/CheckIfArmstrongNumber.java) [Find the…
---
## Miscellaneous
* [Find three integers in the array with sum equal to the given value](/src/misc/SumOfThreeValues.java)
* [Find position of a given key in 2D matrix](/src/misc/SearchMatrix.java)
* [Determine the host byte order of any system](/src/misc/HostByteOrder.java)
* [Find the point that requires the least total distance covered by all the ​people to meet at that point](/src/misc/ClosestMeetingPoint.java)
* [Given a two dimensional array, if any element in it is zero make its whole row and column zero](/src/misc/SumOfThreeValues.java)
     <br>

Interview Answer:
> [Find three integers in the array with sum equal to the given value](/src/misc/SumOfThreeValues.java) [Find position of a given key in 2D matrix](/src/misc/SearchMatrix.java) [Determine the host byte order of any system](/src/misc/HostByteOrder.java) [Find the point that…
---
## Factory vs Abstract Factory (and when neither belongs in Android UI)
A **factory** creates **one kind of object**. An **abstract factory** creates **families** of related objects (think UI toolkits).

On Android you more often use **DI** or simple builders than textbook factories inside every Fragment—save factories for **SDK boundaries** and **test doubles**.

-- Useful links
- [Learn more](https://www.journaldev.com/1418/abstract-factory-design-pattern-in-java)
- [Learn more](https://www.baeldung.com/kotlin/builder-pattern)

Interview Answer:
> A **factory** creates **one kind of object**.
---
## 3. Fix State Design
**a. Hoist and Scope State — Don't Put Everything in One Place**
```kotlin
// Bad: one giant state object drives entire screen
data class ScreenState(val header: Header, val feed: List<Item>, val footer: Footer)

// Good: break into independent state holders per UI zone
@Composable fun FeedScreen(vm: FeedViewModel) {
    val headerState by vm.headerState.collectAsState()
    val feedState by vm.feedState.collectAsState()
    Header(headerState)  // only recomposes when headerState changes
    Feed(feedState)      // only recomposes when feedState changes
}
```

**c. Use `@Stable` / `@Immutable` for Data Classes**
```kotlin
@Immutable  // tells Compose this class never changes after creation
data class Product(val id: String, val name: String, val price: Double)
```
Without `@Immutable`, Compose assumes any data class *might* change → always recomposes. With it → Compose skips composables if all params are equal.

**4. Fix Multiple `collectAsState()` — Combine into One State**
```kotlin
// Bad: two separate flows → two separate recomposition triggers
val user by vm.user.collectAsState()
val posts by vm.posts.collectAsState()

// Good: combine in ViewModel → single emission → one recomposition
data class ScreenUiState(val user: User?, val posts: List<Post>)
val uiState by vm.uiState.collectAsState()  // ViewModel combines internally with combine()
```

**5. Use `remember` and `derivedStateOf` to Cache Computations**
```kotlin
// Without remember: filterApplied() runs on every recomposition
val filteredList = items.filter { it.isVisible }

// With derivedStateOf: only recalculates when items actually changes
val filteredList by remember { derivedStateOf { items.filter { it.isVisible } } }
```

**6. Prevent Lambda Recreation — `rememberUpdatedState`**
```kotlin
// Bad: new lambda on every recomposition → child never skips
LazyColumn {
    items(list) { item ->
        ProductCard(item, onClick = { handleClick(item) })  // new lambda each time
    }
}

// Good: stable callback reference
val onClick = remember<(Item) -> Unit> { { item -> handleClick(item) } }
```

**7. `key()` in Lazy Lists — Stable Identity**
```kotlin
LazyColumn {
    items(products, key = { it.id }) { product ->  // stable key = smart diff + correct animations
        ProductCard(product.name, product.price)
    }
}
```

**8. Break UI into Small, Focused Composables**
- Each composable should read only the state it needs
- A small composable that reads one field will only recompose when that one field changes
- Large composables that read everything recompose for everything

**9. Validation**
- Layout Inspector: recomposition counts should drop dramatically (ideally to 1–2 per user action, not 20+)
- FPS: scrolling should hit 60 fps consistently (no frames > 16ms in Profiler)
- CPU trace: composition phase time should reduce

> Compose recomposition problems = **state not scoped tightly enough + unstable parameters + single giant state object**. Fix: break state, annotate stability, combine flows in ViewModel, use `derivedStateOf` for derived reads.

Interview Answer:
> *a.
---
## What are SOLID principles and how do they apply in Android?
| Principle | Rule | Android Example |
|-----------|------|-----------------|
| **S** — Single Responsibility | One class, one reason to change | Activity for UI · ViewModel for logic · Repository for data — each has one job |
| **O** — Open/Closed | Open for extension, closed for modification | `PaymentProcessor` interface → `CardPayment`, `UPIPayment`, `WalletPayment` implement it — add payment type without changing existing code |
| **L** — Liskov Substitution | Subclass must be safely substitutable for parent | `LocalUserRepo` and `RemoteUserRepo` both implement `UserRepository` — ViewModel works with either without modification |
| **I** — Interface Segregation | Many small interfaces > one large one | Split `UserActions(login, logout, uploadPhoto)` into `AuthActions`, `ProfileActions`, `MediaActions` — classes only implement what they use |
| **D** — Dependency Inversion | Depend on abstractions, not implementations | ViewModel depends on `UserRepository` interface; Hilt injects `UserRepositoryImpl` at runtime |

**In practice — User Profile Screen example:**
- **SRP:** `ProfileActivity` → only layout. `ProfileViewModel` → only logic. `UserRepository` → only data.
- **OCP:** New API provider? Add `NewApiUserRepo` implementing `UserRepository` — zero changes to ViewModel.
- **LSP:** Swap `LocalUserRepository` with `RemoteUserRepository` in tests — ViewModel doesn't notice.
- **ISP:** `ProfileViewModel` injects only `ProfileRepository`, not a giant `AppRepository`.
- **DIP:** `@HiltViewModel class ProfileViewModel @Inject constructor(val repo: UserRepository)` — bound to interface via Hilt module.

> SOLID on Android = **testable boundaries** and **zero merge conflicts** between teams. DIP + Hilt is the most impactful pair: swap implementations without touching callers.
---
<!-- Source: docs/android/android-networking-security.md -->

Interview Answer:
> | Principle | Rule | Android Example | |-----------|------|-----------------| | **S** — Single Responsibility | One class, one reason to change | Activity for UI · ViewModel for logic · Repository for data — each has one job | | **O** — Open/Closed | Open for extension, closed…
---
## Volley advantages (when it still matters)
Older codebases may still use **Volley** for its **request queue** and **memory/disk cache** behavior. If you maintain that code, know **why** it was chosen and have a **migration** story (OkHttp cache, Coil for images, etc.).


> A calm **migration plan** beats arguing “our stack is always best.”

Interview Answer:
> Older codebases may still use **Volley** for its **request queue** and **memory/disk cache** behavior.
---
## HTTP polling vs WebSocket vs SSE
- **Polling:** simple but **wakes the radio** often—bad for battery if frequent.
- **WebSocket:** **two-way** channel; good for chat or live control—needs **reconnect** logic.
- **SSE:** **server → client** stream over HTTP; one-way updates.

Pick based on **direction**, **battery**, and what your **backend** supports.

### Useful links

- [Learn more](https://outcomeschool.com/blog/http-request-long-polling-websocket-sse)


> **Battery and radio cost** matter as much as “real-time” buzzwords.
---
- [Learn more](https://outcomeschool.com/blog/http-request-long-polling-websocket-sse)

Interview Answer:
> **Polling:** simple but **wakes the radio** often—bad for battery if frequent.
---
## Geofences
**Geofencing** fires when the user enters or leaves regions. Triggers can be **delayed** or **missed** by OS optimization—design **confirmation UX** (e.g. open app to refresh) instead of assuming perfect firing.

### Useful links

- [Learn more](https://code.tutsplus.com/how-to-work-with-geofences-on-android--cms-26639t)


> Treat geofences as **best-effort hints**, not hard real-time guarantees.
---
- [Learn more](https://code.tutsplus.com/how-to-work-with-geofences-on-android--cms-26639t)

Interview Answer:
> *Geofencing** fires when the user enters or leaves regions.
---
## Retry — what is safe to retry, and what is never retried blindly?
**Retry** (with **backoff** and **max attempts**): **timeouts**, **DNS/transient** failures, some **5xx** **GET**/**idempotent** reads. **Do not** blindly retry **POST** **payments** or **non-idempotent** writes—**double submit** risk; **4xx** (**401** aside from one **refresh** path) usually **no**. Prefer **idempotency keys** on the **server** if the client must **retry** money flows.


> **Retry** is a **business** decision for **writes**—default **off** for **payments**.

Interview Answer:
> *Retry** (with **backoff** and **max attempts**): **timeouts**, **DNS/transient** failures, some **5xx** **GET**/**idempotent** reads.
---
## How do you encrypt data in Java/Android?
Use **`javax.crypto.Cipher`** with a **modern mode** (prefer **AEAD** such as **GCM**), a **random IV** every time, and **keys you do not hardcode** in source. Store keys in **Android Keystore** when possible.

### Useful links

- [Learn more](https://github.com/vamsitallapudi/Coderefer-Java-Projects/commit/443c4f7700fd68391da2ccf40f85a7e3bccd573d#diff-25a6634263c1b1f6fc4697a04e2b9904ea4b042a89af59dc93ec1f5d44848a26)


> **Mode + IV + key storage** matter more than naming a cipher on slides.
---
- [Learn more](https://github.com/vamsitallapudi/Coderefer-Java-Projects/commit/443c4f7700fd68391da2ccf40f85a7e3bccd573d#diff-25a6634263c1b1f6fc4697a04e2b9904ea4b042a89af59dc93ec1f5d44848a26)

Interview Answer:
> Use **`javax.crypto.Cipher`** with a **modern mode** (prefer **AEAD** such as **GCM**), a **random IV** every time, and **keys you do not hardcode** in source.
---
## OAuth2 + PKCE and JWT on mobile — what does the client actually do?
Prefer **authorization code + PKCE** for third-party IdPs. **JWT** is often just the **access token shape**—**do not** “verify signature” with **embedded secrets** on device (secrets **extract**); **trust** **exp**/**nbf** only for **UX** hints, **enforce** authorization **server-side**. **Store** tokens in **EncryptedSharedPreferences** or equivalent (**android-storage.md**); **refresh** via **OkHttp `Authenticator`** with **single-flight** (**android-networking.md**). **Refresh failure** → **clear** session, **login** again—no **silent** loops.


> Mobile client is **not** a **JWT authority**—**backend** is.

Interview Answer:
> Prefer **authorization code + PKCE** for third-party IdPs.
---
## Exported components — common attack surface?
**Services**, **receivers**, **activities** with **`exported=true`** (or **implicit** intents) can be **invoked** by other packages—**default** **`exported=false`** unless needed; **permission**-protect **IPC**; **explicit** intents. **Deep links** validate **hosts/paths**; **WebView** **URL** allowlists.


> Every **export** is a **mini public API**—review like one.

Interview Answer:
> *Services**, **receivers**, **activities** with **`exported=true`** (or **implicit** intents) can be **invoked** by other packages—**default** **`exported=false`** unless needed; **permission**-protect **IPC**; **explicit** intents.
---
## APK tampering and integrity — beyond root checks?
**Play Integrity** / **SafetyNet** era patterns: **integrity** verdicts for **high-value** flows; **signature** checks for **debug** / **unexpected** installers where policy allows. **Expect** bypass on **root**—combine with **server** **risk** scoring, not **client-only** **block** unless compliance demands.


> **Client integrity** is **signal**, not **proof**.

Interview Answer:
> *Play Integrity** / **SafetyNet** era patterns: **integrity** verdicts for **high-value** flows; **signature** checks for **debug** / **unexpected** installers where policy allows.
---
## Google vs Amazon vs fintech — how do you pitch the same fact?
**Google-style:** go **deeper** on **internals** (Keystore, cipher modes, **why** not verify JWT locally). **Amazon-style:** **STAR** with **your** **incident** and **owned** metrics. **Fintech-style:** **threat** walkthrough (**replay**, **MITM**, **repackaged** APK)—**mitigation** + **server** role. **Do not** memorize **fake** **PCI**/**audit** outcomes.


> Match **depth**, **story**, or **attack** lens to the **panel**—same **engineering**, different **packaging**.

Interview Answer:
> *Google-style:** go **deeper** on **internals** (Keystore, cipher modes, **why** not verify JWT locally).
---
## `apply()` vs `commit()` in `SharedPreferences`
**`commit()`** writes **right away** (blocking) and returns **true/false** so you know if disk write succeeded. **`apply()`** saves **in the background**—better when you are on the **main thread** and do not need an immediate result.

If an **`apply()`** is still in flight and you call **`commit()`**, the **`commit()`** can **wait**—worth knowing in hot paths.

**Example:** Feature flags toggled from the UI → usually **`apply()`**. Tests that must read back immediately might use **`commit()`** in test doubles.


> Prefer **`apply()`** for normal UI saves; know **`commit()`** when you need a **confirmed** write.

Interview Answer:
> *`commit()`** writes **right away** (blocking) and returns **true/false** so you know if disk write succeeded.
---
## Scoped storage & MediaStore strategy
Avoid assuming **full filesystem** access. Use **MediaStore** for shared media, **SAF** when the user picks files, and **app-specific** directories for caches and internal files.

### Useful links

- [Learn more](https://blog.mindorks.com/understanding-the-scoped-storage-in-android)


> Separate **user-visible files** from **app-private cache**—privacy and UX depend on it.
---
- [Learn more](https://blog.mindorks.com/understanding-the-scoped-storage-in-android)

Interview Answer:
> Avoid assuming **full filesystem** access.
---
## Local storage threat model — why is “app sandbox” not enough for fintech / health?
Assume **root**, **backup extraction**, **physical access**, **malware**, and **debuggable** builds. **Plaintext** prefs/files, **HTTP cache** of **PII**, and **world-readable** paths are common leaks. **Defense:** encrypt **meaningful** data, **disable** risky **backup** for sensitive prefs, treat **cache** as **untrusted**.


> **Sandbox** stops normal apps—not **compromised** devices or **misconfig**.

Interview Answer:
> Assume **root**, **backup extraction**, **physical access**, **malware**, and **debuggable** builds.
---
## EncryptedFile for sensitive PDFs / exports?
Use **`EncryptedFile`** (AES-GCM, HKDF chunking) under **`filesDir`**, not **world-readable** external storage. **Delete** temp files after **share/upload**; **clear** on **logout**.


> Encrypt **before** write; assume **copied** files are **hostile** if plaintext.

Interview Answer:
> Use **`EncryptedFile`** (AES-GCM, HKDF chunking) under **`filesDir`**, not **world-readable** external storage.
---
## Cache vs persistent — what never belongs in cache?
**Http** / **image** / **Coil** caches can hold **tokens**, **account numbers**, **PHI** in JSON—**TTL**, **encryption**, or **exclude** sensitive endpoints. **Logout:** `cacheDir` cleanup (and **coil**/`OkHttp` cache **evict** where applicable). **Persistent** structured data → **Room** with policy; **sensitive** → **encrypted**.


> **Cache is readable**—design as if **postmortem** includes **strings** dump.

Interview Answer:
> *Http** / **image** / **Coil** caches can hold **tokens**, **account numbers**, **PHI** in JSON—**TTL**, **encryption**, or **exclude** sensitive endpoints.
---
## Secure logout — what do you clear, and `apply()` vs `commit()`?
**Server** revoke **refresh** first when possible; then **clear** **EncryptedSharedPreferences** (`commit()` if you must **guarantee** disk before showing logged-out UI), **delete** **Keystore** keys you use for local crypto, **clear** **Room**/encrypted DB or **user** tables, **cancel** **WorkManager** user jobs, **wipe** **cache**, drop **in-memory** singletons holding **PII**. **Partial** logout = **session restore** bugs and **audit** failures.


> Logout is **data destruction**, not **NavController** pop.

Interview Answer:
> *Server** revoke **refresh** first when possible; then **clear** **EncryptedSharedPreferences** (`commit()` if you must **guarantee** disk before showing logged-out UI), **delete** **Keystore** keys you use for local crypto, **clear** **Room**/encrypted DB or **user** tables,…
---
## Scan works on one phone, not another — what do you check?
- **Permissions** and **OS version** differences.
- **Scan mode** (`LOW_LATENCY` vs `LOW_POWER`) and **throttling** (especially **background**).
- **Filter** too strict (wrong service UUID).
- **Advertising interval** very long—user must wait.
- OEM **BLE stack** bugs—always have a **second device** and **firmware** version in bug reports.

**Stop scanning** as soon as you have a target device to save **battery** and avoid **rate limits**.


> **Permissions + scan settings + background limits + OEM**—verify on **real hardware matrix**.

Interview Answer:
> **Permissions** and **OS version** differences.
---
## Device found but connection fails — common causes?
- Peripheral **already connected** elsewhere (phone, hub).
- **Stale GATT** / need fresh **`connectGatt`** after **`close()`**.
- Wrong **transport** (LE vs dual-mode confusion).
- **Bonding** state mismatch or **encrypted** characteristic without bond.
- Firmware **connection parameter** refusal—needs **logs** and **sniffer** (HCI snoop / nRF Connect).


> **Connection** failures are often **bonding**, **transport**, **already connected**, or **stack/firmware**—prove with **logs** and a **second phone**.

Interview Answer:
> Peripheral **already connected** elsewhere (phone, hub).
---
## MTU — default size, how you negotiate it, and why throughput still stinks.
Default ATT MTU is **23 bytes** (effective payload **20 bytes** without negotiation). Call **`requestMtu(517)`** (or your max); handle **`onMtuChanged`**—the **negotiated** value is the **minimum** of what **both** sides support.

Even with a higher MTU, **connection interval**, **data length extension**, **write type** (`WRITE_TYPE_NO_RESPONSE` vs default), and **firmware buffering** cap real throughput. For **bulk sync** (e.g. 1 MB history), you combine **MTU**, **interval/priority** where appropriate, **chunking**, and **application-level flow control** (ACK every N blocks).


> **MTU** raises the ceiling; **interval**, **write mode**, and **firmware** determine actual **speed**.

Interview Answer:
> Default ATT MTU is **23 bytes** (effective payload **20 bytes** without negotiation).
---
## Callbacks run on which thread? How do you update UI safely?
**`BluetoothGattCallback`** methods run on a **Binder / background** thread **not** guaranteed to be main. **Marshal** to **Main** with **`Handler(Looper.getMainLooper())`**, **`runOnUiThread`**, or **coroutines** (`withContext(Main)`).

**Do not** do heavy parsing on the callback thread if it contends with **GATT** sequencing—**hand off** to a **parser** queue.


> Assume **callbacks ≠ main thread**; **hop** to **Main** for UI and keep **GATT** discipline.

Interview Answer:
> *`BluetoothGattCallback`** methods run on a **Binder / background** thread **not** guaranteed to be main.
---
## Pairing vs bonding — why does it matter for medical devices?
**Pairing** establishes keys for a session; **bonding** **persists** keys (e.g. **LTK**) so reconnects can **encrypt** without repeating UX. MedTech often needs **bonding** for **trusted** peripherals and **encrypted** characteristics.

**Implementation detail:** bonding flows can **fail** across **OEM** stacks—test **forgot device**, **re-pair**, and **key rotation** policies.


> **Bonding** = **encrypted reconnect** without constant user friction—critical for **regulated** products.

Interview Answer:
> *Pairing** establishes keys for a session; **bonding** **persists** keys (e.g.
---
## How do you securely store sensitive data in an Android app?
Never store sensitive data (passwords, tokens, keys) in plain text.

| Data Type | Correct Storage | Wrong Storage |
|-----------|----------------|---------------|
| Auth tokens | `EncryptedSharedPreferences` | `SharedPreferences` (plain) |
| Cryptographic keys | Android Keystore | Hardcoded strings / assets |
| Structured sensitive data | Encrypted Room (SQLCipher) | Plain Room / SQLite |
| API keys | Server-side; `BuildConfig` for non-secret config | `strings.xml`, source code |

**`EncryptedSharedPreferences` setup:**
```kotlin
val masterKey = MasterKey.Builder(context)
    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build()
val prefs = EncryptedSharedPreferences.create(
    context, "secure_prefs", masterKey,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
)
```

**Android Keystore:** generates and stores keys inside secure hardware (TEE/SE). Keys never leave the hardware in plaintext — even a root-level attacker cannot extract them.

**What to avoid:**
- Internal/external storage files for secrets (accessible to root and USB debugging)
- `Log.d` printing tokens (scraped from logcat)
- Sending credentials in URL query params (server logs capture them)


> Sensitive data storage = **Keystore for keys, EncryptedSharedPreferences for tokens, SQLCipher for structured data**. The rule: never plaintext, never in source code.

Interview Answer:
> Never store sensitive data (passwords, tokens, keys) in plain text.
---
## ArrayMap / SparseArray vs HashMap on Android
`ArrayMap` and `SparseArray` are Android collections tuned for **small maps** with fewer allocations than `HashMap`. That can mean less garbage collection pressure when you create and drop maps often.

If the map grows **large**, the classic `HashMap` often wins on lookup and structure. So this is not a universal “always use ArrayMap” rule—you pick based on **size, churn, and whether you measured a problem**.

### Useful links

- [Learn more](https://blog.mindorks.com/android-app-optimization-using-arraymap-and-sparsearray-f2b4e2e3dc47)
- [Learn more](https://amitshekhar.me/blog/optimization-using-arraymap-and-sparsearray)


> **Measure** size and allocation churn before micro-optimizing map types.
---
- [Learn more](https://amitshekhar.me/blog/optimization-using-arraymap-and-sparsearray)

Interview Answer:
> `ArrayMap` and `SparseArray` are Android collections tuned for **small maps** with fewer allocations than `HashMap`.
---
## RenderScript vs NDK (legacy note)
RenderScript was meant for heavy parallel work on the GPU/CPU. It is **deprecated**; new code should use other options (NDK, GPU APIs, or higher-level libraries) depending on the problem.

### Useful links

- [Learn more](https://blog.mindorks.com/comparing-android-ndk-and-renderscript-1a718c01f6fe)
---
- [Learn more](https://blog.mindorks.com/comparing-android-ndk-and-renderscript-1a718c01f6fe)

Interview Answer:
> RenderScript was meant for heavy parallel work on the GPU/CPU.
---
## onTrimMemory — why implement it?
The system calls **`onTrimMemory`** (and related callbacks) when memory is tight. It is your chance to **drop caches** (thumbnails, parsed JSON, extra bitmaps) so the process is less likely to be killed.

Do **not** throw away data you need for correctness—only **recreatable** caches.

### Useful links

- [Learn more](https://developer.android.com/topic/performance/memory)


> Trim **caches**, not essential user data or app state you cannot rebuild.
---
- [Learn more](https://developer.android.com/topic/performance/memory)

Interview Answer:
> The system calls **`onTrimMemory`** (and related callbacks) when memory is tight.
---
## Why apps exit — process death vs finish
Android does not work like desktop “Quit.” The system may **kill your process** in the background under memory pressure. The user may also swipe the app away from recents, which behaves differently by version.

Crashes and **low-memory killer** are normal topics in interviews—**do not rely** on a guaranteed “app exit” hook for business logic.

### Useful links

- [Learn more](https://blog.mindorks.com/reason-of-exit-in-android-application/)


> There is **no reliable desktop-style “exit app”** model—design for **process death** and restoration.
---
- [Learn more](https://blog.mindorks.com/reason-of-exit-in-android-application/)

Interview Answer:
> Android does not work like desktop “Quit.” The system may **kill your process** in the background under memory pressure.
---
## Multi-touch
Touch events carry **multiple pointers** (fingers). **`MotionEvent`** reports indices and IDs; pointer **indices** can change when fingers lift, so use **`getPointerId`** for tracking across events. **`GestureDetector`** helps with common patterns.

### Useful links

- [Learn more](https://arjun-sna.github.io/android/2016/07/20/multi-touch-android/)


> Track **pointer IDs**, not only indices—they are not the same across events.
---
- [Learn more](https://arjun-sna.github.io/android/2016/07/20/multi-touch-android/)

Interview Answer:
> Touch events carry **multiple pointers** (fingers).
---
## Doze and App Standby — how do they affect your features?
**Doze** (device **idle**, screen **off**, often **unplugged**): defers **network**, **jobs**, **alarms** except **maintenance windows**. **App Standby** buckets (**Active → … → Restricted**) tighten **per-app** **background** work. **FGS**, **high-priority FCM**, and **user-visible** flows get **exceptions**—everything else should assume **delay**.


> Design **deferrable** work—**fight the OS** and users **uninstall**.

Interview Answer:
> *Doze** (device **idle**, screen **off**, often **unplugged**): defers **network**, **jobs**, **alarms** except **maintenance windows**.
---
## Fastlane (or equivalent) — what do you automate for Android?
**Fastlane** wraps **Gradle** (`bundleProdRelease`), **upload_to_play_store** (track, rollout %, AAB path), **metadata**, and **Slack/Teams** notifications. **Maturity signals:** separate **lanes** per track, **manual approval** for production, **rollback** playbook. Same ideas map to **pure** Gradle + **Play Developer API** in CI without Fastlane.

### Code example

```ruby
lane :internal do
  gradle(task: "bundleProdRelease")
  upload_to_play_store(
    track: "internal",
    aab: "../app/build/outputs/bundle/prodRelease/app-prod-release.aab"
  )
end
```


> **Repeatable lane** + **staged rollout** beats **hand-upload** Friday night.

Interview Answer:
> *Fastlane** wraps **Gradle** (`bundleProdRelease`), **upload_to_play_store** (track, rollout %, AAB path), **metadata**, and **Slack/Teams** notifications.
---
## Play Store rollout — how do you limit blast radius?
**Internal/closed** first; **production** with **percentage rollout** (e.g. 5% → 20% → 100%); watch **crash-free users** and **ANR**; **halt** rollout on thresholds. Upload **mapping** file with release. **AAB** (not side-loaded APK) for Play distribution.


> **Staged %** + **metrics** = production **judgment**, not hope.

Interview Answer:
> *Internal/closed** first; **production** with **percentage rollout** (e.g.
---
## SDK initialization — when do you run it, and what must not live in `Application.onCreate()`?
**Bucket SDKs:** (1) **crash/telemetry** you need from second one—init **early** but keep work **light**; (2) **feature** SDKs (maps, payments)—**lazy** init on first screen that needs them; (3) **analytics/marketing**—often **after** first frame or **after consent**. Use **App Startup** with explicit dependencies, **background** threads where safe, and **feature flags** to **disable** a bad SDK without shipping.

**Main-thread block** in init shows up in **startup traces** / **StrictMode**—profile and defer.


> **Default lazy**; **eager** only when the product truly needs it **before** first paint.

Interview Answer:
> *Bucket SDKs:** (1) **crash/telemetry** you need from second one—init **early** but keep work **light**; (2) **feature** SDKs (maps, payments)—**lazy** init on first screen that needs them; (3) **analytics/marketing**—often **after** first frame or **after consent**.
---
## Failure isolation and SDK removal — how do staff teams treat churn?
**Wrap** vendor APIs behind **your** interfaces; **try/catch** or **Result** at boundaries; **feature-flag** kill switch; **timeouts** on network SDKs. **Removing** an SDK: stop **new** usage, **dual-run** metrics if swapping analytics, delete **permissions** / **manifest** mergers / **init** code, verify **ProGuard** rules.


> **Adapter + flag** = you can **survive** Tuesday’s bad SDK release.

Interview Answer:
> *Wrap** vendor APIs behind **your** interfaces; **try/catch** or **Result** at boundaries; **feature-flag** kill switch; **timeouts** on network SDKs.
---
## Tips & curated resources for interview preparation
Mix **consistent DSA practice**, **system design** drills, and **behavioral** stories with **real numbers** (latency saved, crash rate, team size). Use the links below as **starting points**, not a checklist to cram in one night.

### Useful links

- [Learn more](https://www.linkedin.com/feed/update/urn:li:activity:7256556738038882304/)
- [Learn more](https://www.linkedin.com/feed/update/urn:li:activity:7246844257766981632/)
- [Learn more](https://www.linkedin.com/feed/update/urn:li:activity:7221106724919738369/)
- [Learn more](https://www.linkedin.com/feed/update/urn:li:activity:7220663449440161793/)
- [Learn more](https://www.linkedin.com/feed/update/urn:li:activity:7219036304691388418/)
- [Learn more](https://www.linkedin.com/feed/update/urn:li:activity:7217827106083266560/)
- [Learn more](https://www.linkedin.com/feed/update/urn:li:activity:7213379334311448576/)
- [Learn more](https://www.linkedin.com/feed/update/urn:li:activity:7194272210679705600/)
- [Learn more](https://www.linkedin.com/feed/update/urn:li:activity:7177985319269502977/)
- [Learn more](https://blog.sp3.in/dsa)
- [STAR method:](https://www.testgorilla.com/blog/star-method-interviews/)


> **STAR + metrics** beat a list of adjectives about how “passionate” you are.
---
- [Learn more](https://www.testgorilla.com/blog/star-method-interviews/)

Interview Answer:
> Mix **consistent DSA practice**, **system design** drills, and **behavioral** stories with **real numbers** (latency saved, crash rate, team size).
---
## Error monitoring & logging for post-mortems
Use **structured logs** where they help, **Crashlytics** (or similar) for crashes and **non-fatals**, **breadcrumbs** around risky flows, **remote flags** to tune logging, and **PII scrubbing**. Dashboards should answer **“what broke for whom?”** not dump noise.


> Logs and dashboards should drive **action**, not scroll fatigue.

Interview Answer:
> Use **structured logs** where they help, **Crashlytics** (or similar) for crashes and **non-fatals**, **breadcrumbs** around risky flows, **remote flags** to tune logging, and **PII scrubbing**.
---
## Tell me about yourself / hobbies / not on resume (templates)
Keep a **tight spine**: domains, tech, scale, impact. Add **one human detail** if asked—avoid **rambling** or unrelated life story unless they invite it.


> Aim for about **two minutes**, clear structure.

Interview Answer:
> Keep a **tight spine**: domains, tech, scale, impact.
---
## Code optimization impact (deep narrative)
Walk through **profilers**, **structural** fixes, **data structures**, **caching**, and how you **measured before/after**.


> Always close with **before/after** evidence.

Interview Answer:
> Walk through **profilers**, **structural** fixes, **data structures**, **caching**, and how you **measured before/after**.
---
## Roles & responsibilities
Align your story with **scope**, **leadership**, **cross-functional** work, and **quality ownership** at your level.


> Match examples to the **job level** you are interviewing for.

Interview Answer:
> Align your story with **scope**, **leadership**, **cross-functional** work, and **quality ownership** at your level.
---
## Design patterns in practice (Singleton/Observer/Factory)
Name patterns you **actually used** and **why**—including **downsides** (singletons and tests, overuse of observers).


> Patterns are **tools**, not tattoos.

Interview Answer:
> Name patterns you **actually used** and **why**—including **downsides** (singletons and tests, overuse of observers).
---
## Difficult bug / intermittent crash
**Crashlytics** breadcrumbs, **repro** harness, **fix root cause** vs papering over with retries only.


> Intermittent bugs usually mean **missing signals**—add instrumentation.

Interview Answer:
> *Crashlytics** breadcrumbs, **repro** harness, **fix root cause** vs papering over with retries only.
---
## Refactoring definition + legacy refactor story
Refactoring changes **structure** without changing **behavior**—done in **small steps** with **tests** and **stakeholder** communication.


> Big refactors need a **business sponsor** and a **plan**.

Interview Answer:
> Refactoring changes **structure** without changing **behavior**—done in **small steps** with **tests** and **stakeholder** communication.
---
## Cross-team delivery — backend / QA / product blocked you. What do you do?
**Early** alignment on **API contracts** and **mocks**; shared **ownership** of incidents, not blame ping-pong. If blocked: escalate with **context + options** (phased ship, temporary stub, scope cut)—not raw complaints. **Fintech/compliance:** release **checklists** (logging, monitoring, audit trail) as **gates**, not last-night panic.


> Leads **unblock** with **options** and **written** alignment.

Interview Answer:
> *Early** alignment on **API contracts** and **mocks**; shared **ownership** of incidents, not blame ping-pong.
---
## What is a Class and Object in Android?
#### Class
- A class is like a blueprint or template for creating objects.
- It defines properties (variables) and behaviors (functions/methods).
- In Android (Kotlin/Java), you use classes to structure your app.

*Key Points:*
- Defines what an object will have and do.
- Doesn’t occupy memory by itself until an object is created.

#### Object
- An object is a real instance of a class.
- It occupies memory and can use the properties and functions defined in the class.

*Key Points:*
- Object is the actual entity created from the class blueprint.
- You can create multiple objects from the same class, each with different data.

Interview Answer:
> A class is like a blueprint or template for creating objects.
---
## Explain Inheritance in Android with an Example
- Inheritance is an OOP concept where one class (child/subclass) inherits properties and behaviors of another class (parent/superclass).
- Helps reuse code, reduce duplication, and create hierarchical relationships.

#### How It Works in Android
- Android apps are built using classes, so inheritance is common:
  - Activities and Fragments extend `AppCompatActivity` or `Fragment`.
  - Custom Views extend `View` or `TextView`.
  - Adapters can extend `RecyclerView.Adapter`.

Interview Answer:
> Inheritance is an OOP concept where one class (child/subclass) inherits properties and behaviors of another class (parent/superclass).
---
## Q4: What is Polymorphism in Android?
- Polymorphism is an OOP concept that allows an object to take many forms.

Interview Answer:
> Polymorphism is an OOP concept that allows an object to take many forms.
---
## What is LiveData?
- Lifecycle-aware observable data holder.
- UI observes LiveData to get automatic updates.
- Prevents memory leaks as it only updates when the UI is active.

Interview Answer:
> Lifecycle-aware observable data holder.
---
## Explain SOLID Principles in Android with examples
- SOLID is a set of five design principles that help in writing clean, scalable, and easy-to-maintain code.
- Each letter in SOLID stands for one principle:
  1. **S** – Single Responsibility
  2. **O** – Open/Closed
  3. **L** – Liskov Substitution
  4. **I** – Interface Segregation
  5. **D** – Dependency Inversion

Let’s understand them one by one:

#### S – Single Responsibility Principle (SRP)
- A class should have only one reason to change, meaning it should do only one job.
- *Example in Android:* Don’t mix UI logic and data logic inside an Activity. Use Activity for UI and ViewModel for business logic. Use Repository for data handling (API/Database). This makes code cleaner and easier to test or modify.

#### O – Open/Closed Principle (OCP)
- A class should be open for extension but closed for modification. You should add new features without changing existing code.
- *Example in Android:* Suppose you have a PaymentProcessor class. Instead of editing it for every new payment method (UPI, Card, Wallet), create new classes like CardPayment, UPIPayment that implement a PaymentInterface. This keeps the original class safe from future changes.

#### L – Liskov Substitution Principle (LSP)
- Subclasses should be usable in place of their parent class without breaking the app.
- *Example:* If you have a Bird class with fly() method, then any subclass like Sparrow or Eagle should also support flying. But if the Penguin can’t fly, it shouldn’t extend the bird. In Android, this means your subclasses should behave consistently with their base classes.

#### I – Interface Segregation Principle (ISP)
- Don’t create large, all-in-one interfaces. Instead, create smaller, specific interfaces that serve one purpose.
- *Example in Android:* One big UserActions interface with methods login(), logout(), uploadPhoto(). Split into smaller interfaces like AuthActions, ProfileActions, MediaActions. This keeps code flexible — classes only implement what they need.

#### D – Dependency Inversion Principle (DIP)
- High-level modules (like ViewModel) shouldn’t depend on low-level modules (like RepositoryImpl). Both should depend on an abstraction (interface).
- *Example in Android:* Create a UserRepository interface. Then have multiple implementations like RemoteUserRepo and LocalUserRepo. Inject it using Dagger/Hilt or manual dependency injection. This makes it easy to swap implementations (for example, in testing).

#### Real Example
Let’s say you have a User Profile Screen:
- **SRP:** Separate classes for UI (Activity), business logic (ViewModel), and data (Repository).
- **OCP:** Add a new API provider without changing existing data layer code.
- **LSP:** Replace LocalUserRepository with RemoteUserRepository safely.
- **ISP:** Create small interfaces for login, logout, and profile operations separately.
- **DIP:** ViewModel depends on UserRepository interface, not a concrete class.

Interview Answer:
> SOLID is a set of five design principles that help in writing clean, scalable, and easy-to-maintain code.
---
## How can you secure communication between app and server?
- Always use HTTPS (SSL/TLS) to encrypt data in transit.
- Use certificate pinning to verify the server.
- Avoid logging sensitive data (e.g., tokens or passwords).
- Use secure authentication methods like OAuth2 or JWT.

Interview Answer:
> Always use HTTPS (SSL/TLS) to encrypt data in transit.
---
## How do you build responsive Android UI?
-   Avoid hardcoded dimensions where possible.
-   Support different screen sizes and orientations.
-   Use adaptive layouts and window size information.
-   Design for phones, tablets, foldables, and landscape.

```text
Phone
  ↓
Single-column layout

Tablet
  ↓
Multi-pane layout
```

For XML, use resource qualifiers where appropriate.

Interview Answer:
> Avoid hardcoded dimensions where possible.
---
## What is CI/CD for Android?
A typical pipeline is:

```text
Pull Request
    ↓
Compile
    ↓
Lint / Static Analysis
    ↓
Unit Tests
    ↓
Instrumentation Tests
    ↓
Security Checks
    ↓
Build AAB
    ↓
Sign
    ↓
Release
```

The exact stages depend on the organization.

Interview Answer:
> A typical pipeline is: The exact stages depend on the organization.
---
## How can you improve Android build time?
Look at:

-   Gradle configuration
-   Build cache
-   Configuration cache
-   Parallel execution
-   Dependency graph
-   Modularization
-   Incremental builds
-   Avoiding unnecessary annotation processing
-   CI caching

Measure before changing the build system.

Interview Answer:
> Look at: Gradle configuration Build cache Configuration cache Parallel execution Dependency graph Modularization Incremental builds Avoiding unnecessary annotation processing CI caching Measure before changing the build system.
---
## How should Android signing be handled in CI/CD?
-   Keep signing credentials outside source control.
-   Use a secure secret manager.
-   Restrict access.
-   Separate debug and release credentials where appropriate.
-   Audit release access.

```text
CI
 ↓
Secure signing credentials
 ↓
Signed AAB
 ↓
Release
```

Interview Answer:
> Keep signing credentials outside source control.
---
## What are build variants?
Build variants allow different configurations such as:

```text
debug
release
staging
production
```

They can use different API endpoints, logging settings, and feature
configurations.

Never allow development configuration to accidentally ship in
production.

Interview Answer:
> Build variants allow different configurations such as: They can use different API endpoints, logging settings, and feature configurations.
---
## How would you improve app stability?
Use a loop:

```text
Monitor
 ↓
Identify top crashes/ANRs
 ↓
Prioritize by user impact
 ↓
Fix root cause
 ↓
Add regression test
 ↓
Release gradually
 ↓
Monitor again
```

Avoid fixing only the visible symptom.

Interview Answer:
> Use a loop: Avoid fixing only the visible symptom.
---
## What is release rollback?
Rollback means stopping or reversing a problematic release.

Use:

-   Phased rollout
-   Feature flags
-   Previous stable version
-   Server-side kill switches where available

The safest rollback strategy depends on whether the problem is in the
app, backend, or configuration.

Interview Answer:
> Rollback means stopping or reversing a problematic release.
---
## What is the difference between deployment and release?
-   Deployment means code is made available to an environment.
-   Release means functionality is made available to users.

Feature flags allow:

```text
Code deployed
     ↓
Feature disabled
     ↓
Feature validated
     ↓
Feature enabled gradually
```

This reduces release risk.

Interview Answer:
> Deployment means code is made available to an environment.
---
## What do you mean by Gradle wrapper?
The Gradle wrapper is the most suitable way to initiate a Gradle build. A Gradle wrapper is a Window’s batch script which has a shell script for the OS (operating system). Once you start the Gradle build via the wrapper, you will see an auto download which runs the build.



> The Gradle wrapper is the most suitable way to initiate a Gradle build.

Interview Answer:
> The Gradle wrapper is the most suitable way to initiate a Gradle build.
---
## What is ABI Management?
Different Android handsets use different CPUs, which in turn support different instruction sets. Each combination of CPU and instruction sets has its own Application Binary Interface, or ABI. The ABI defines, with great precision, how an  application's machine code is supposed to interact with the system at runtime. You must specify an ABI for each CPU  architecture you want your app to work with. You can checkout the full specifcations [here](https://developer.android.com/ndk/guides/abis)<br>


### Useful links

- [here](https://developer.android.com/ndk/guides/abis)



> Different Android handsets use different CPUs, which in turn support different instruction sets.
---
- [Learn more](https://developer.android.com/ndk/guides/abis)

Interview Answer:
> Different Android handsets use different CPUs, which in turn support different instruction sets.
---
## What is a BuildType in Gradle? And what can you use it for?
* Build types define properties that Gradle uses when building and packaging your Android app.
* A build type defines how a module is built, for example whether ProGuard is run.
* A product flavor defines what is built, such as which resources are included in the build.
* Gradle creates a build variant for every possible combination of your project’s product flavors and build types.<br>

Interview Answer:
> Build types define properties that Gradle uses when building and packaging your Android app.
---
## Are you familiar with ProGuard/DexGuard/R8 Minification?
ProGuard, DexGuard, and R8 are tools used in Android development to optimize and protect the application code. Here’s a brief overview of each:<br>

**ProGuard:** It is an open-source tool that shrinks, optimizes, and obfuscates Java code. It removes unused code and resources, making the APK smaller. ProGuard also makes the code more difficult to reverse-engineer by renaming classes, fields, and methods with non-descriptive names.<br>

**DexGuard:**: A commercial tool that offers more advanced protection features than ProGuard. It provides stronger encryption and obfuscation techniques, and it can also protect against static and dynamic analysis, making it harder for attackers to tamper with or reverse-engineer the application.<br>

**R8:** The latest official code shrinker and minifier from Google, which is integrated into Android Studio. R8 combines shrinking, desugaring, dexing, and obfuscation into one step. It’s designed to be backward-compatible with ProGuard, meaning it can use ProGuard configuration files. R8 improves build times and results in smaller APK sizes compared to ProGuard.



> ProGuard, DexGuard, and R8 are tools used in Android development to optimize and protect the application code.

Interview Answer:
> ProGuard, DexGuard, and R8 are tools used in Android development to optimize and protect the application code.
---
## What is AAPT?
AAPT2 (Android Asset Packaging Tool) is a build tool that Android Studio and Android Gradle Plugin use to compile and package your app’s resources. AAPT2 parses, indexes, and compiles the resources into a binary format that is optimized for the Android platform.



> AAPT2 (Android Asset Packaging Tool) is a build tool that Android Studio and Android Gradle Plugin use to compile and package your app’s resources.

Interview Answer:
> AAPT2 (Android Asset Packaging Tool) is a build tool that Android Studio and Android Gradle Plugin use to compile and package your app’s resources.
---
## Explain the build process in Android:
* First step involves compiling the resources folder (/res) using the aapt (android asset packaging tool) tool. These are compiled to a single class file called R.java. This is a class that just contains constants.
 * Second step involves the java source code being compiled to .class files by javac, and then the class files are converted to Dalvik bytecode by the "dx" tool, which is included in the sdk 'tools'. The output is classes.dex.
 * The final step involves the android apkbuilder which takes all the input and builds the apk (android packaging key) file.<br>

Interview Answer:
> First step involves compiling the resources folder (/res) using the aapt (android asset packaging tool) tool.
---
## How to reduce apk size?
* Enable proguard in your project by adding following lines to your release build type.
* Enable shrinkResources.
* Strip down all the unused locale resources by adding required resources name in “resConfigs”.
* Convert all the images to the webp or vector drawables.
     <br>


### Useful links

- [Learn more](https://medium.com/exploring-code/how-you-can-decrease-application-size-by-60-in-only-5-minutes-47eff3e7874e)
---
- [Learn more](https://medium.com/exploring-code/how-you-can-decrease-application-size-by-60-in-only-5-minutes-47eff3e7874e)

Interview Answer:
> Enable proguard in your project by adding following lines to your release build type.
---
## How to reduce build time of an Android app?
- Measure slow tasks with Gradle build scans or profiling.
- Enable build caching, configuration cache, and parallel execution where safe.
- Prefer incremental compilation and KSP where supported.
- Reduce unnecessary dependencies and avoid a large shared module.


### Useful links

- [Learn more](https://medium.com/exploring-code/how-to-decrease-your-gradle-build-time-by-65-310b572b0c43)
---
- [Learn more](https://medium.com/exploring-code/how-to-decrease-your-gradle-build-time-by-65-310b572b0c43)

Interview Answer:
> Measure Gradle bottlenecks, enable safe caching and parallelism, reduce dependencies, and improve module boundaries.
---
## What is a ContentProvider — when do you still build one?
A **ContentProvider** exposes **structured data** to other processes through **`content://` URIs** with **permissions**. The system routes queries/updates through **`ContentResolver`**.

They are **verbose** to build. For **data only your app uses**, **Room** is simpler. Providers still matter when you **share data securely** with another app or need the old **CursorLoader**-style patterns.

**Example:** Read-only health data shared with a partner app under a **signature-level** permission.

### Useful links

- [Learn more](https://medium.com/@sanjeevy133/an-idiots-guide-to-android-content-providers-part-1-970cba5d7b42)
- [Learn more](https://developer.android.com/guide/topics/providers/content-provider-basics)
- Diagram: `/assets/content-provider-diagram.png`


> Think of a provider as a **small public API** with **access control**, not “free database.”
---
- [Learn more](https://developer.android.com/guide/topics/providers/content-provider-basics)

Interview Answer:
> A **ContentProvider** exposes **structured data** to other processes through **`content://` URIs** with **permissions**.
---
## Release build behaves differently from debug for BLE — why?
**R8/ProGuard** can strip or rename code **reflectively** used by some SDKs—add **keep rules** for **Bluetooth** glue if needed. **Timing** changes (no debugger) expose **race** bugs: **service discovery** too early, **missing delay** before **`discoverServices()`** on some peripherals.


> **Test BLE on `release`** with **minify on**—timing and **shrinking** both break **fragile** stacks.

Interview Answer:
> *R8/ProGuard** can strip or rename code **reflectively** used by some SDKs—add **keep rules** for **Bluetooth** glue if needed.
---
## APK / app size reduction and build time improvements
Smaller APKs download faster and use less storage. Common levers: **R8/ProGuard** (shrink code), **`shrinkResources`**, limit languages with **`resConfigs`**, use **WebP** or vectors where it helps, **dynamic feature modules** for rarely used pieces, and remove dead code. **APK Analyzer** shows what actually ships.

Faster builds: Gradle **build cache**, fewer modules touching every change, sensible **`implementation` vs `api`**, and CI that caches dependencies.

### Useful links

- [Learn more](https://medium.com/exploring-code/how-you-can-decrease-application-size-by-60-in-only-5-minutes-47eff3e7874e)
- [Learn more](https://blog.mindorks.com/how-to-reduce-apk-size-in-android-2f3713d2d662)
- [Learn more](https://medium.com/exploring-code/how-to-decrease-your-gradle-build-time-by-65-310b572b0c43)


> App size and build speed are **ongoing hygiene**, not one-off tasks.
---
- [Learn more](https://medium.com/exploring-code/how-to-decrease-your-gradle-build-time-by-65-310b572b0c43)

Interview Answer:
> Smaller APKs download faster and use less storage.
---
## ProGuard vs R8 vs DexGuard
**ProGuard** was the classic **shrink + obfuscate** toolchain. **R8** is the default now: it **shrinks**, **obfuscates**, and ties into **desugaring** with generally **faster** builds. **DexGuard** adds **commercial hardening** (extra obfuscation, tamper resistance)—buy it when your **threat model** justifies cost.

**Example:** Turn on **R8 full mode** in release and maintain **keep rules** for **reflection** (Retrofit models, Gson types, etc.).


> Shrinking **breaks reflection**—**ProGuard/R8 rules** are part of your source tree.

Interview Answer:
> *ProGuard** was the classic **shrink + obfuscate** toolchain.
---
## Build types vs product flavors vs build variants
- **Build type:** **debug** vs **release** (minify, signing, debuggable).
- **Product flavor:** different **products** (free/pro, region) along **dimensions**.
- **Variant:** one **flavor** × one **build type** (e.g. `prodRelease`).


> Many variants multiply **CI time**—delete what you do not ship.

Interview Answer:
> **Build type:** **debug** vs **release** (minify, signing, debuggable).
---
## Gradle `implementation` vs `api`
**`implementation`** hides **transitive types** from **consumers** of your library → **faster compiles**. **`api`** **exports** those types → consumers see them on their classpath.

### Useful links

- [Learn more](https://medium.com/mindorks/implementation-vs-api-in-gradle-3-0-494c817a6fa)


> In libraries, default to **`implementation`** unless you intentionally expose types.
---
- [Learn more](https://medium.com/mindorks/implementation-vs-api-in-gradle-3-0-494c817a6fa)

Interview Answer:
> *`implementation`** hides **transitive types** from **consumers** of your library → **faster compiles**.
---
## Gradle wrapper purpose
The **wrapper** (`gradlew` + properties) pins the **Gradle version** so **CI** and every developer use the **same** build tool.


> **Commit the wrapper**—do not rely on “whatever Gradle is installed.”

Interview Answer:
> The **wrapper** (`gradlew` + properties) pins the **Gradle version** so **CI** and every developer use the **same** build tool.
---
## AAPT2 / build pipeline (high level)
**Resources** compile to **binary tables**; **Java/Kotlin** compiles to **DEX** via **D8/R8**; everything packs into **APK/AAB**. Incremental steps exist so small edits do not rebuild the world.

Interview Answer:
> *Resources** compile to **binary tables**; **Java/Kotlin** compiles to **DEX** via **D8/R8**; everything packs into **APK/AAB**.
---
## ABI splits / ABI filters
**Native** `.so` files are **per CPU architecture**. **App Bundles** let Play deliver **split APKs** per ABI. Understand **which ABIs** you support—dropping **x86** in dev builds can speed iteration.

### Useful links

- [Learn more](https://developer.android.com/ndk/guides/abis)


> Native SDKs inflate **download size**—split and filter with intent.
---
- [Learn more](https://developer.android.com/ndk/guides/abis)

Interview Answer:
> *Native** `.so` files are **per CPU architecture**.
---
## CI/CD for Android
Typical pieces: **GitHub Actions**, **Jenkins + Docker**, **Bitrise**, **Gradle caching**, **secure signing**, **Play internal tracks**, and **automated tests** (including **Firebase Test Lab**).

### Useful links

- [Learn more](https://blog.mindorks.com/github-actions-for-android/)
- [Learn more](https://www.unosquare.com/blog/how-to-setup-a-ci-cd-pipeline-for-android-using-jenkins-and-docker-part-2/)


> Cache **dependencies** and **build cache**—Android CI is I/O heavy.
---
- [Learn more](https://www.unosquare.com/blog/how-to-setup-a-ci-cd-pipeline-for-android-using-jenkins-and-docker-part-2/)

Interview Answer:
> Typical pieces: **GitHub Actions**, **Jenkins + Docker**, **Bitrise**, **Gradle caching**, **secure signing**, **Play internal tracks**, and **automated tests** (including **Firebase Test Lab**).
---
## CI/CD benefits & feature branching
Automation gives **faster releases**, **consistent quality gates**, and **smaller rollout risk**. **Trunk-based** development with **feature flags** usually scales better than long-lived branches.


> **Short-lived branches + flags** beat months-long **integration branches**.

Interview Answer:
> Automation gives **faster releases**, **consistent quality gates**, and **smaller rollout risk**.
---
## Signing, Play App Signing, key rotation
Use **Play App Signing** so Google holds the **app signing key** and you manage an **upload key**. Document **recovery** if an upload key is lost.


> Losing **signing keys** is a **business continuity** problem—treat it seriously.

Interview Answer:
> Use **Play App Signing** so Google holds the **app signing key** and you manage an **upload key**.
---
## How do you add automated review gates to CI/CD (lint, analysis, tests, coverage)—and where does an LLM fit without blocking merges on hallucinations?
**Gates (typical order, fail fast):** formatting (**ktlint** / **Spotless**), **Android Lint** + **Detekt**, **unit tests**, **coverage floor** (**JaCoCo** `jacocoTestCoverageVerification`), optional **instrumentation** on a **schedule** or **nightly** if full **`connectedCheck`** is too slow for every PR. **Static analysis** (**SonarQube** / **SonarCloud**, **CodeQL**) catches smells and security patterns **deterministically**. **Dependency** scanners (**OWASP Dependency-Check**, **Snyk**, **Dependabot**) belong in the same “hard gate” family as your policy allows.

**Branch protection:** require **green checks**, **at least one human** reviewer, **no direct push** to default branch—CI enforces **standards**, people judge **product risk**.

**LLM-assisted review:** Treat it as a **soft** layer after deterministic checks pass. Feed a **trimmed diff**, **title/description**, and **short team rules** (e.g. “no business logic in Composables”). Ask for **severity**, **actionable** bullets, and **missing tests**—post as **PR comments**. **Do not** fail the build solely on LLM output (noise, **hallucinations**, **secrets** in diffs—**redact** before sending). Cap **tokens** (skip generated files, limit lines), run **on PR** not every push, and use a **cheaper** model for huge diffs if cost matters.


> **Lint + tests + SCA** = **hard gates**; **LLM** = **extra reviewer voice**, not the **merge** decision by itself.

Interview Answer:
> *Gates (typical order, fail fast):** formatting (**ktlint** / **Spotless**), **Android Lint** + **Detekt**, **unit tests**, **coverage floor** (**JaCoCo** `jacocoTestCoverageVerification`), optional **instrumentation** on a **schedule** or **nightly** if full…
---
## End-to-end release from merge to Play — what are the control points?
**Merge** to protected branch → **CI** (lint, unit tests, optional instrumentation) → **versionCode** / **versionName** policy → **build variant** (flavor + type) → **sign** release **AAB** → archive **`mapping.txt`** / **native symbols** → **upload** (internal → closed → production) with **release notes** → **monitor** Crashlytics / ANR → **staged rollout** with **pause** plan. **Determinism:** pinned deps, same **JDK/AGP** on CI, no **manual** “works on my laptop” releases for prod.


> Interviewers listen for **artifact integrity**, **symbol upload**, and **blast-radius** control.

Interview Answer:
> *Merge** to protected branch → **CI** (lint, unit tests, optional instrumentation) → **versionCode** / **versionName** policy → **build variant** (flavor + type) → **sign** release **AAB** → archive **`mapping.txt`** / **native symbols** → **upload** (internal → closed →…
---
## buildTypes vs productFlavors — how do you avoid a variant explosion?
**buildTypes** = *how* built (**debug**, **release**, maybe **staging** with different minify/logging). **productFlavors** = *what* product (**dev** / **qa** / **prod** API, branding). **Dimensions** combine into variants (`devDebug`, `prodRelease`)—keep **matrix** small; use **remote config** for switches that do not need a separate APK.

### Code example

```kotlin
android {
    flavorDimensions += "env"
    productFlavors {
        create("dev") {
            dimension = "env"
            applicationIdSuffix = ".dev"
        }
        create("prod") {
            dimension = "env"
        }
    }
}
```


> Flavors for **environment/product**; build types for **build behavior**—don’t multiply both without reason.

Interview Answer:
> *buildTypes** = *how* built (**debug**, **release**, maybe **staging** with different minify/logging).
---
## Environment config (`buildConfigField`, resources) vs secrets — what is safe to embed?
**Non-secret** endpoints and feature flags can go in **`buildConfigField`** or **flavor resources**, often fed by **CI env**. **Assume APK is extracted**: **API keys** should be **restricted** (package + signing cert), **rate-limited** server-side, and **never** the sole security control. **Fintech:** **mTLS**, **request signing**, **device binding**—not “hidden” base URLs.


> **Obfuscation ≠ secrecy**—backend must **assume** the client is **hostile**.

Interview Answer:
> *Non-secret** endpoints and feature flags can go in **`buildConfigField`** or **flavor resources**, often fed by **CI env**.
---
## Can two builds from the same commit differ? Should they?
**Reproducible builds** aim for **bit-identical** or **functionally identical** artifacts: pinned **dependencies**, documented **JDK**, avoid **non-deterministic** steps in release (timestamp in `BuildConfig` if you care). **Practical:** same **inputs** → same **AAB** except where Play injects **signing**. Teams that need **supply-chain** proof track **hashes** and **SBOM**.


> Staff answers mention **pinning** and **traceability**, not “Gradle magic.”

Interview Answer:
> *Reproducible builds** aim for **bit-identical** or **functionally identical** artifacts: pinned **dependencies**, documented **JDK**, avoid **non-deterministic** steps in release (timestamp in `BuildConfig` if you care).
---
## Version management — BOMs, conflicts, and release discipline?
Centralize versions (**Gradle Version Catalog**, **Firebase BOM**). Read **changelogs** before bumps; **pin** hotfix branches; resolve **transitive** conflicts with **`constraints`**, **`exclude`**, or **isolation** (separate module / dynamic feature) when two vendors fight. Never **auto-upgrade** all SDKs the week before **freeze**.


> **One catalog** + **reviewed bumps** beats **mystery classpath**.

Interview Answer:
> Centralize versions (**Gradle Version Catalog**, **Firebase BOM**).
---
## Code optimization / APK size narrative (25% claim in source)
Use **numbers you can defend**. Mention **R8**, **resource shrink**, **dynamic delivery**, and **profiling**—never invent **25%** without a real measurement.


> Do not quote **metrics** you cannot explain under follow-up questions.

Interview Answer:
> Use **numbers you can defend**.
---
## gradle.properties
org.gradle.caching=true
org.gradle.parallel=true
org.gradle.configureondemand=true
```
- Set up a **remote build cache** (Gradle Enterprise / self-hosted) so CI and developers share cached outputs

**7. Parallel Execution & Workers**
- `org.gradle.parallel=true` — build independent modules simultaneously
- Increase daemon heap: `org.gradle.jvmargs=-Xmx4g -XX:+UseParallelGC`

**8. Dependency Optimization**
- Audit with `./gradlew :app:dependencies` — remove unused transitive deps
- Avoid pulling in large libraries (e.g. full Guava) when you use 3 methods

**9. CI-Specific Optimization**
- Enable remote build cache (CI writes; developers read)
- Affected module detection — only run tests for changed modules (Gradle's `--affected` or custom scripts)
- Run full test suite nightly; PR builds run only affected-module tests


> Slow builds = **poor modular boundaries + missing incremental/caching config**. Fix both: architecture (module graph) and tooling (KSP, cache, parallel). Measure with Build Scan before every change.

```
Interview Answer:
> org.gradle.caching=true org.gradle.parallel=true org.gradle.configureondemand=true ``` Set up a **remote build cache** (Gradle Enterprise / self-hosted) so CI and developers share cached outputs *7.
---
## What is CI/CD in Android development and why does it matter?
**CI (Continuous Integration):** Every code push to the shared repo automatically triggers a build and test run. Catches regressions before they reach other developers.

**CD (Continuous Delivery):** Once code passes CI, it is automatically packaged (APK/AAB) and distributed to test environments (e.g. Firebase App Distribution, internal Play track).

**Continuous Deployment:** Automatically publishes to production (Google Play) after all quality checks pass — rare in mobile due to review cycles.

**Why it matters:**
- Faster feedback loops — broken builds caught in minutes, not at code review
- Consistent builds — no "it works on my machine"; scripted and version-controlled
- Reduced manual work — no manual test runs, APK generation, or Play uploads
- Early bug detection — tests run on every PR, not just before release

**Common Android CI/CD stack:**

| Tool | Role |
|------|------|
| **GitHub Actions / Bitrise / CircleCI** | Build orchestration |
| **Fastlane** | Sign, build flavors, upload to Play/TestFlight |
| **Firebase App Distribution** | Beta distribution |
| **Gradle Build Scan** | Build performance analysis |
| **Detekt / Ktlint** | Static analysis quality gates |


> CI/CD is not optional on team projects — it is the **safety net that makes refactoring and feature flags safe to ship**.

Interview Answer:
> *CI (Continuous Integration):** Every code push to the shared repo automatically triggers a build and test run.
---
## What is Gradle and how does project-level vs module-level `build.gradle` differ?
**Gradle** is Android's build system: compiles Kotlin/Java, packages resources, runs ProGuard/R8, and resolves dependencies. Defined via `build.gradle` (Groovy) or `build.gradle.kts` (Kotlin DSL).

| | `build.gradle` (Project-level) | `build.gradle` (Module-level) |
|--|-------------------------------|-------------------------------|
| **Scope** | Entire project | Specific app or library module |
| **Contains** | Plugin classpath, repo URLs, Gradle version | `compileSdk`, `dependencies`, build types, product flavors |
| **Changes affect** | All modules | Only this module |

**Build Variants = Build Type + Product Flavor**
- **Build types:** `debug` (debuggable, no shrink) · `release` (minified, signed)
- **Product flavors:** `free` / `paid` · `staging` / `production`
- **Variant:** `freeDebug`, `paidRelease`

Use flavors for: different API base URLs · feature flags · white-label apps.


> Project-level = global plumbing; module-level = feature-specific wiring. Build variants = the matrix of every shipping artifact your pipeline must validate.
---
<!-- Source: docs/android/real-world-scenarios.md -->

Interview Answer:
> *Gradle** is Android's build system: compiles Kotlin/Java, packages resources, runs ProGuard/R8, and resolves dependencies.
---
## What are the core building blocks of an Android application?
Android apps are built using several essential components provided by the Android framework. These components work together to handle UI, background tasks, user interactions, and data sharing.

#### Core Building Blocks of an Android Application:
1. **Activities**
   - Represents a single screen with a user interface.
   - Acts as the entry point for user interaction.
   - Every screen in an app is usually an Activity.
2. **Fragments**
   - A modular piece of UI that lives inside an Activity.
   - Can be reused in multiple activities.
   - Useful for responsive layouts (e.g., tablets vs phones).
3. **Services**
   - Runs background operations without user interaction.
   - Useful for long-running tasks like downloading files, playing music, etc.
4. **Broadcast Receivers**
   - Listens to system-wide or app-wide broadcast messages.
   - Useful for responding to events like battery low, Wi-Fi connected, etc.
5. **Content Providers**
   - Used to share data between apps.
   - Acts as a data access interface, like a database that can be queried using URI.
6. **View:**
   - Every UI component like Button, TextView, etc.
   - Created in XML or code using Jetpack Compose.
7. **Layouts:**
   - Organize UI views. Examples: LinearLayout, ConstraintLayout, Compose Column/Row.
8. **Manifest File:**
   - Declares all components, permissions, and metadata.
   - It’s like the blueprint of your app.

Interview Answer:
> Android apps are built using several essential components provided by the Android framework.
---
## What is the use of ProGuard/R8 in Android?
ProGuard (now replaced by R8) is a tool that:
- Minifies code (removes unused code).
- Obfuscates names (changes class/method names to random characters).
- Makes it harder for attackers to reverse engineer the app.

Interview Answer:
> ProGuard (now replaced by R8) is a tool that: Minifies code (removes unused code).
---
## What is WorkManager?
-   WorkManager is used for deferrable, persistent background work.
-   It is useful when work should survive app restarts.

```kotlin
WorkManager
    ↓
Sync database
Upload logs
Periodic refresh
```

Do not use it for immediate UI-bound work.

Interview Answer:
> WorkManager is used for deferrable, persistent background work.
---
## Service vs WorkManager?
-   Service is for specific foreground/background service use cases.
-   WorkManager is for persistent deferrable work.
-   Foreground services require appropriate Android restrictions and
    user-visible notifications.

Choose based on the actual background execution requirement.

Interview Answer:
> Service is for specific foreground/background service use cases.
---
## BroadcastReceiver / LocalBroadcastManager legacy note
- System broadcasts for many OS events; **implicit broadcasts** heavily restricted.
- **LocalBroadcastManager** deprecated—use in-process flows (`Flow`, direct listeners, `LiveData` scoped properly).

### Useful links

- [BroadcastReceiver primer:](https://stackoverflow.com/questions/5296987/what-is-broadcastreceiver-and-when-we-use-it)
- [LocalBroadcastManager (deprecated reference):](https://developer.android.com/reference/android/support/v4/content/LocalBroadcastManager.html)


> Avoid **broadcast-as-eventbus** in new code.
---
- [Learn more](https://developer.android.com/reference/android/support/v4/content/LocalBroadcastManager.html)

Interview Answer:
> System broadcasts for many OS events; **implicit broadcasts** heavily restricted.
---
## Loader API?
- Deprecated; use **ViewModel + coroutines/Flow + repository**.


> If you maintain legacy loaders, plan **migration**.

Interview Answer:
> Deprecated; use **ViewModel + coroutines/Flow + repository**.
---
## What is RecyclerView optimization?
Important practices include:

-   Use `ListAdapter` and `DiffUtil`.
-   Use stable item identity.
-   Avoid heavy work in `onBindViewHolder`.
-   Avoid unnecessary nested layouts.
-   Load images efficiently.
-   Do not perform database/network work on the main thread.

```kotlin
submitList(newUsers)
```

`DiffUtil` calculates changes instead of blindly refreshing everything.

Interview Answer:
> Important practices include: Use `ListAdapter` and `DiffUtil`.
---
## View hierarchy & custom views & layouts
- `View` leaf, `ViewGroup` container; `ConstraintLayout` reduces depth; `FrameLayout` for overlays; `LinearLayout`/`RelativeLayout` legacy trade-offs.
- Custom view steps (attrs → constructors → measure/layout/draw) are covered in the legacy section below.
- **Links:**
  - [ConstraintLayout:](https://blog.mindorks.com/using-constraint-layout-in-android-531e68019cd)
  - [Sample:](https://github.com/anitaa1990/ConstraintLayout-Sample)
  - [Article:](https://android.jlelse.eu/learning-to-implement-constraintlayout-in-android-8ddc69fe0a1a)
  - [Custom views tutorial:](https://code.tutsplus.com/tutorials/android-sdk-creating-custom-views--mobile-14548)


> Depth == **measure/layout cost**—flatten aggressively.

Interview Answer:
> `View` leaf, `ViewGroup` container; `ConstraintLayout` reduces depth; `FrameLayout` for overlays; `LinearLayout`/`RelativeLayout` legacy trade-offs.
---
## ViewPager vs ViewPager2
- ViewPager2 built on RecyclerView; better for RTL + orientation + fragments.

### Useful links

- [Official migration:](https://developer.android.com/develop/ui/views/animations/vp2-migration)


> All new code: **ViewPager2**.
---
- [Learn more](https://developer.android.com/develop/ui/views/animations/vp2-migration)

Interview Answer:
> ViewPager2 built on RecyclerView; better for RTL + orientation + fragments.
---
## How to handle multiple screen sizes?
It's a long debate but in a very nutshell, you can do it in these ways:
- Use flexible layout like `ConstraintLayout` unless create alternative layout in different layout folders. (e.g. layout-sw480, layout-sw600, layout-sw720 ...)
- Provide different bitmap drawables for different screen densities or use vector assets.
- Be aware of the screen orientation change approach in your application.
If you don't want to handle it enforce to use just one orientation (portrait or landscape) through declaring it in the manifest file.

for complete reading, see the [official documentation](https://developer.android.com/training/multiscreen/screensizes).


### Useful links

- [official documentation](https://developer.android.com/training/multiscreen/screensizes)



> It's a long debate but in a very nutshell, you can do it in these ways: - Use flexible layout like `ConstraintLayout` unless create alternative layout in different layout folders.
---
- [Learn more](https://developer.android.com/training/multiscreen/screensizes)

Interview Answer:
> It's a long debate but in a very nutshell, you can do it in these ways: Use flexible layout like `ConstraintLayout` unless create alternative layout in different layout folders.
---
## What is the difference between margin and padding?
- **Padding** is space inside a view, between its content and its edge.
- **Margin** is space outside a view, between it and neighboring views.

Interview Answer:
> Padding is inside the view; margin is outside the view.
---
## What do `sw`, `w`, and `h` mean in Android resource qualifiers?
- `layout-sw600dp` means the smallest available width is at least 600dp.
- `layout-w600dp` checks the current available width.
- `layout-h600dp` checks the current available height.
- Prefer `sw` for layouts that should work across orientation changes.

Interview Answer:
> Use `sw` for stable device-size layouts, and `w` or `h` for the current available dimension.
---
## What are the major differences between `ListView` and `RecyclerView`?
- `RecyclerView` uses a `ViewHolder` by design and supports layout managers.
- It gives better control over animations, item decoration, and list types.
- `ListView` is simpler but is a legacy choice for most new screens.

Interview Answer:
> `RecyclerView` is more flexible and efficient for modern, changing lists.
---
## How do `Handler`, `Looper`, `MessageQueue`, and `HandlerThread` work together?
- A `Looper` reads work from a `MessageQueue`.
- A `Handler` posts messages or tasks to that queue.
- A `HandlerThread` is a background thread that owns its own looper.
- Remove callbacks and quit the looper when the work is no longer needed.

```kotlin
val thread = HandlerThread("worker").apply { start() }
val handler = Handler(thread.looper)
handler.post { /* background work */ }
```

Interview Answer:
> A looper processes a message queue, and a handler adds work to it; `HandlerThread` provides this on a background thread.
---
## What are `ExecutorService` and thread pools, and when should you use them?
- `ExecutorService` runs tasks using reusable worker threads.
- A bounded pool avoids creating too many threads and wasting battery.
- Shut down owned executors, or prefer structured coroutines for new Kotlin code.

```kotlin
val executor = Executors.newFixedThreadPool(2)
executor.execute { /* background work */ }
executor.shutdown()
```

Interview Answer:
> Use a bounded executor to reuse threads safely; use coroutines when structured cancellation is more suitable.
---
## How do started, bound, foreground, and background services differ?
- A **started service** continues until stopped or terminated.
- A **bound service** exposes work while a client is connected.
- A **foreground service** shows a notification and is used for user-visible ongoing work.
- Deferrable work should normally use WorkManager; `IntentService` is deprecated.

Interview Answer:
> Choose a service only for work that needs service behavior; use WorkManager for reliable deferrable work.
---
## When should you use a service, a thread, `AsyncTask`, or WorkManager?
- Use a thread or coroutine for short work owned by a current screen or scope.
- Do not use `AsyncTask` in new code; it is deprecated and not lifecycle-safe.
- Use a foreground service for user-visible ongoing work.
- Use WorkManager for deferrable, persistent work that should survive app restarts.

Interview Answer:
> Match the tool to lifetime: coroutine for scoped work, foreground service for visible ongoing work, and WorkManager for persistent deferrable work.
---
## What is the Adapter pattern, and when is it useful outside lists?
- An Adapter converts one interface into another expected by the caller.
- It is useful when integrating a legacy API, SDK, or incompatible data model.
- A `RecyclerView.Adapter` is a UI-specific use, but the design pattern is broader.

Interview Answer:
> Use an Adapter to hide an incompatible interface behind the interface your code expects.
---
## What is `SnapHelper` in `RecyclerView`?
- `SnapHelper` aligns an item after scrolling stops.
- `PagerSnapHelper` makes a list behave like a page-by-page carousel.
- It is useful for horizontal cards, onboarding, and media carousels.

Interview Answer:
> `SnapHelper` automatically aligns the nearest item after a scroll.
---
## What are WorkManager states, constraints, periodic work, and observation?
- Work can be `ENQUEUED`, `RUNNING`, `SUCCEEDED`, `FAILED`, `BLOCKED`, or `CANCELLED`.
- Constraints control conditions such as network availability or charging.
- `PeriodicWorkRequest` is for recurring work; its timing is inexact and has a platform minimum interval.
- Observe work with `WorkInfo` using LiveData or Flow.

```kotlin
val request = PeriodicWorkRequestBuilder<SyncWorker>(
    15, TimeUnit.MINUTES
).setConstraints(
    Constraints.Builder()
        .setRequiredNetworkType(NetworkType.CONNECTED)
        .build()
).build()
```

Interview Answer:
> WorkManager runs constrained, persistent jobs and exposes their state so the app can show progress or errors.
---
## What are the important Dagger/Hilt annotations?
- `@Inject` marks a constructor or field for injection.
- `@Module` groups dependency providers; `@Provides` creates an object and `@Binds` maps an implementation to an interface.
- `@Component` connects modules and injection targets.
- `@Scope` controls lifetime; `@Qualifier` distinguishes two objects of the same type.
- `@BindsInstance` supplies a runtime value when creating a component.

Interview Answer:
> Dagger/Hilt annotations describe how dependencies are created, connected, distinguished, and scoped.
---
## How do you upload multipart form data or an image with Retrofit?
- Use `@Multipart` and `MultipartBody.Part` for the file.
- Add text fields with `@Part`.
- Validate size and type before upload, and handle cancellation and retries.

```kotlin
@Multipart
@POST("profile/photo")
suspend fun uploadPhoto(
    @Part photo: MultipartBody.Part,
    @Part("caption") caption: RequestBody
): Response<Unit>
```

Interview Answer:
> Retrofit uploads files with a multipart request containing a file part and optional text parts.
---
## How do `FLAG_ACTIVITY_CLEAR_TOP` and `FLAG_ACTIVITY_CLEAR_TASK` differ?
- `CLEAR_TOP` returns to an existing activity and removes activities above it.
- `CLEAR_TASK` clears the whole task and must be used with `NEW_TASK` when starting the replacement activity.
- Use them deliberately for logout, deep links, and authentication flows.

Interview Answer:
> `CLEAR_TOP` trims part of the stack; `CLEAR_TASK` removes the complete task stack.
---
## How do you access data through a `ContentProvider`?
- A provider exposes data through URI-based `query`, `insert`, `update`, and `delete` operations.
- Use `ContentResolver` from the client app.
- Protect exported providers with permissions and validate all inputs.

```kotlin
val cursor = contentResolver.query(uri, projection, null, null, null)
```

Interview Answer:
> A client uses `ContentResolver` to access a provider through secure, URI-based operations.
---
## How do `FragmentPagerAdapter` and `FragmentStatePagerAdapter` differ?
- `FragmentPagerAdapter` keeps visited fragment instances and is suited to a small, mostly fixed number of pages.
- `FragmentStatePagerAdapter` saves state and removes fragment instances that are not needed, so it scales better for many pages.
- In new code, prefer ViewPager2 with its current adapter APIs.

Interview Answer:
> Keep fragment instances for a small fixed pager; save and recreate state for a large or changing pager.
---
## How do `ConstraintLayout`, `LinearLayout`, `RelativeLayout`, and `FrameLayout` differ?
- `ConstraintLayout` expresses relationships with constraints and can reduce nested layout depth.
- `LinearLayout` arranges children in a row or column and is simple for small groups.
- `RelativeLayout` is a legacy relationship-based layout; use it mainly when maintaining old code.
- `FrameLayout` is useful for a single child or overlays such as a loading layer.

Interview Answer:
> Choose the simplest layout that keeps the hierarchy shallow; use `FrameLayout` for overlays and `ConstraintLayout` for complex relationships.
---
## What are the main Android coding-problem topics in the source material?
The source also contains practice areas rather than Android framework questions:

- Arrays: two-sum, rotation, missing values, intervals, and maximum profit.
- Dynamic programming: Fibonacci, largest subarray sum, coin change, and edit distance.
- Queues and stacks: sliding-window maximum, queue using stacks, and expression evaluation.
- Linked lists: reversal, cycles, merging, sorting, and intersections.
- Backtracking: Boggle, N-Queens, parentheses, and subset-sum problems.
- Graphs and trees: cloning, traversal, spanning trees, BST checks, and serialization.
- Strings and integers: reversal, palindrome, anagrams, permutations, factorial, and Armstrong numbers.

Interview Answer:
> The coding section covers common array, dynamic-programming, queue, stack, linked-list, graph, tree, string, integer, and backtracking patterns.
---
## Handler, Looper, MessageQueue, HandlerThread
- **Main looper** pumps UI messages; `Handler` posts runnables/messages; misuse leaks activities via non-static inner classes.
- **HandlerThread** is a long-lived thread with its own looper—great for camera/pipeline work with explicit quit.

### Useful links

- [Looper/Handler deep dive:](https://medium.com/@ankit.sinhal/messagequeue-and-looper-in-android-3a18c7fc9181)
- [Mindorks core article:](https://blog.mindorks.com/android-core-looper-handler-and-handlerthread-bd54d69fe91a)


> Prefer **structured concurrency** for new code; understand Handlers to debug legacy.
---
- [Learn more](https://blog.mindorks.com/android-core-looper-handler-and-handlerthread-bd54d69fe91a)

Interview Answer:
> **Main looper** pumps UI messages; `Handler` posts runnables/messages; misuse leaks activities via non-static inner classes.
---
# Networking
---
## How should API errors be handled?
Different errors should have different behavior.

```text
401 → authentication problem
403 → authorization problem
404 → resource missing
429 → rate limit
5xx → server problem
timeout → network problem
```

For an initial load with no cache, show an error and retry.

For a refresh with cached data, keep existing data and show a
non-blocking error.

Interview Answer:
> Different errors should have different behavior.
---
## What happens when an API request times out?
-   The client does not necessarily know whether the server processed
    the request.
-   Retrying blindly can duplicate operations.
-   This is especially dangerous for payments.

For financial transactions, use an idempotency key or transaction
identifier.

```text
Client → Payment(idempotencyKey=ABC)
        ↓
Server processes payment
        ↓
Network timeout
        ↓
Client retries with same key
        ↓
Server recognizes duplicate
```

This prevents accidental duplicate processing when supported by the
backend design.

Interview Answer:
> The client does not necessarily know whether the server processed the request.
---
## What is REST?
-   REST commonly exposes resources through HTTP.
-   HTTP methods communicate intent.

```text
GET    /accounts/123
POST   /payments
PUT    /profile/123
PATCH  /profile/123
DELETE /saved-payee/123
```

REST is simple and widely supported.

Interview Answer:
> REST commonly exposes resources through HTTP.
---
## What is GraphQL?
-   GraphQL allows clients to request the fields they need.
-   It can reduce over-fetching and under-fetching.
-   It requires more consideration around caching, query complexity, and
    error handling.

```graphql
query {
    account(id: "123") {
        id
        balance
        transactions {
            id
            amount
        }
    }
}
```

Interview Answer:
> GraphQL allows clients to request the fields they need.
---
## What is secure networking?
-   Use HTTPS/TLS.
-   Validate certificates correctly.
-   Never disable hostname or certificate validation.
-   Avoid sensitive information in URLs when possible.
-   Protect authentication credentials.
-   Do not log secrets or PII.

```text
App
 ↓ HTTPS/TLS
API
```

Interview Answer:
> Use HTTPS/TLS.
---
## How do you prevent duplicate API requests?
Possible approaches:

-   `distinctUntilChanged`
-   `debounce`
-   `flatMapLatest`
-   Request deduplication
-   Caching
-   Coordinated token refresh
-   Idempotency on server-side write operations

The solution depends on whether the requests are reads, writes, or user
actions.

Interview Answer:
> Possible approaches: `distinctUntilChanged` `debounce` `flatMapLatest` Request deduplication Caching Coordinated token refresh Idempotency on server-side write operations The solution depends on whether the requests are reads, writes, or user actions.
---
## You have two API calls that must run in parallel and update UI when both complete. How do you implement this?
Use Kotlin Coroutines with `async` and `await`.

```kotlin
viewModelScope.launch {
    val userDeferred = async { api.getUser() }
    val postsDeferred = async { api.getPosts() }
    val user = userDeferred.await()
    val posts = postsDeferred.await()
    _uiState.value = Success(user, posts)
}
```
This way, both calls run in parallel and UI updates after both are done.

Interview Answer:
> Use Kotlin Coroutines with `async` and `await`.
---
## What is onSavedInstanceState() and onRestoreInstanceState() in activity?
- **onSavedInstanceState()** - This method is used to store data before pausing the activity.
- **onRestoreInstanceState()** - This method is used to recover the saved state of an activity when the activity is recreated after destruction. Both the ```onCreate()``` and ```onRestoreInstanceState()``` callback methods receive the same Bundle that contains the instance state information. But because the ```onCreate()``` method is called whether the system is creating a new instance of your activity or recreating a previous one, you must check whether the state Bundle is null before you attempt to read it. If it is null, then the system is creating a new instance of the activity, instead of restoring a previous one that was destroyed.

Interview Answer:
> **onSavedInstanceState()** - This method is used to store data before pausing the activity.
---
## How do we save and restore an activity's state during screen rotation?
We can use onSavedInstanceState(bundle:Bundle) to save the activity's state inside a bundle. Then we can use onRestoreInstanceState(bundle) to restore the state of activity.



> We can use onSavedInstanceState(bundle:Bundle) to save the activity's state inside a bundle.

Interview Answer:
> We can use onSavedInstanceState(bundle:Bundle) to save the activity's state inside a bundle.
---
## What is the difference between `implementation` and `api`?
These two keywords work the same when you want to add a new library but the main difference occurs when using it in the internal library. Let's explain it with an example. Consider your app has a library called 'libraryA'. This library is also dependant on another library called 'libraryB'. the dependency flow will be : `app -> libraryA -> libraryB` . If the libraryB is declared in libraryA with keyword `implementation`, so your app module does not know anything about the classes of libraryB. So you can't access and use any classes of libraryB. If you want to do that, you must declare libraryB in the libraryA Gradle file with keyword `api`. For more information read [this medium link]("https://medium.com/mindorks/implementation-vs-api-in-gradle-3-0-494c817a6fa").


### Useful links

- [Learn more](https://medium.com/mindorks/implementation-vs-api-in-gradle-3-0-494c817a6fa)



> These two keywords work the same when you want to add a new library but the main difference occurs when using it in the internal library.
---
- [Learn more](https://medium.com/mindorks/implementation-vs-api-in-gradle-3-0-494c817a6fa)

Interview Answer:
> These two keywords work the same when you want to add a new library but the main difference occurs when using it in the internal library.
---
## What is the advantage of using Retrofit over AsyncTask?
- **Lead:** [Stackoverflow](https://stackoverflow.com/a/16903205/3424919)
Retrofit reduces boiler plate code by internally using GSON library which helps parsing the json file automatically. trofit is a type safe library. This means - it checks if wrong data type is assigned to variables at compilation time itself.


### Useful links

- [Stackoverflow](https://stackoverflow.com/a/16903205/3424919)



> [Stackoverflow](https://stackoverflow.com/a/16903205/3424919) Retrofit reduces boiler plate code by internally using GSON library which helps parsing the json file automatically. trofit is a type safe library. This means…
---
- [Learn more](https://stackoverflow.com/a/16903205/3424919)

Interview Answer:
> **Lead:** [Stackoverflow](https://stackoverflow.com/a/16903205/3424919) Retrofit reduces boiler plate code by internally using GSON library which helps parsing the json file automatically.
---
## Advantage of Retrofit over Volley?
Retrofit is type-safe. Type safety means that the compiler will validate request and response objects' variable types while compiling, and throw an error if you try to assign the wrong type to a variable.



> Retrofit is type-safe. Type safety means that the compiler will validate request and response objects' variable types while compiling, and throw an error if you try to assign the wrong type to a variable.

Interview Answer:
> Retrofit is type-safe.
---
## Advantage of Volley over Retrofit?
Android Volley has a very elaborate and flexible cache mechanism. When a request is made through Volley, first the cache is checked for Response. If it is found, then it is fetched and parsed, else, it will hit Network to fetch the data. Retrofit does not support cache by default.



> Android Volley has a very elaborate and flexible cache mechanism.

Interview Answer:
> Android Volley has a very elaborate and flexible cache mechanism.
---
## How to handle multiple network calls using Retrofit?
In Retrofit, we can call the operations asynchronously by using enqueue() method where as to call operations synchronously, we can use execute() method. In addition, we can use zip() operator from RxJava to perform multiple network calls using Retrofit library.



> In Retrofit, we can call the operations asynchronously by using enqueue() method where as to call operations synchronously, we can use execute() method.

Interview Answer:
> In Retrofit, we can call the operations asynchronously by using enqueue() method where as to call operations synchronously, we can use execute() method.
---
## How to upload an image file in Retrofit 2?
- Use a `@Multipart` endpoint and send the image as `MultipartBody.Part`.
- Set the correct media type and validate size before upload.
- Handle progress, cancellation, authentication, and retry behavior.


### Useful links

- [Learn more](https://stackoverflow.com/questions/39953457/how-to-upload-an-image-file-in-retrofit-2)
---
- [Learn more](https://stackoverflow.com/questions/39953457/how-to-upload-an-image-file-in-retrofit-2)

Interview Answer:
> Retrofit uploads an image as a multipart file part with the correct media type and request validation.
---
## Retrofit vs AsyncTask — why Retrofit?
**AsyncTask** is deprecated and was never great for **cancellation**, **errors**, or **composition** of multiple calls. **Retrofit** gives you a **typed API** (interfaces), plugs into **OkHttp** (timeouts, interceptors, caching), and works cleanly with **coroutines** or **RxJava**.

### Useful links

- [Learn more](https://stackoverflow.com/a/16903205/3424919)


> Prefer **structured concurrency** and **cancellable** network calls—not **AsyncTask**.
---
- [Learn more](https://stackoverflow.com/a/16903205/3424919)

Interview Answer:
> *AsyncTask** is deprecated and was never great for **cancellation**, **errors**, or **composition** of multiple calls.
---
## Retrofit vs Volley
**Retrofit** pairs with **OkHttp** and shines when you want **typed endpoints**, **interceptors**, and modern **async** styles. **Volley** historically had a stronger **default cache story** for some workloads.

For **new apps**, Retrofit + OkHttp (with explicit cache policy) is the common default.


> In interviews, mention **caching** and **timeouts**, not only “we use Retrofit.”

Interview Answer:
> *Retrofit** pairs with **OkHttp** and shines when you want **typed endpoints**, **interceptors**, and modern **async** styles.
---
## Multiple network calls with Retrofit
With **coroutines**, use **`async`/`await`** or **`coroutineScope { awaitAll(...) }`** so calls run in parallel when safe, and still **cancel** with the same scope. With **RxJava**, **`zip`** is the classic pattern.

Always set **timeouts** and **cancellation** per screen so a slow endpoint does not strand the user.

**Example:** A dashboard that needs three endpoints—launch them together, fail fast with clear UX if one is required.


> Every screen should define **timeout + cancellation** for its network work.

Interview Answer:
> With **coroutines**, use **`async`/`await`** or **`coroutineScope { awaitAll(...) }`** so calls run in parallel when safe, and still **cancel** with the same scope.
---
## OkHttp interceptors — use cases
**Interceptors** sit in the OkHttp chain. Common uses: add **auth headers**, **retry** with backoff, **pinning**, **metrics**, and **debug logging** (usually **debug-only** or heavily redacted).

### Useful links

- [Learn more](https://outcomeschool.com/blog/okhttp-interceptor)


> Do not ship **verbose logging** of bodies/headers to production without **redaction**.
---
- [Learn more](https://outcomeschool.com/blog/okhttp-interceptor)

Interview Answer:
> *Interceptors** sit in the OkHttp chain.
---
## OkHttp `Interceptor` vs `Authenticator` — when do you refresh tokens, and how do you avoid infinite 401 loops?
**Interceptors** run on **every** request/response and are ideal for **adding** headers (e.g. `Authorization: Bearer …`), **logging** (redacted), **metrics**, and **generic** retries you fully control.

**`Authenticator`** is invoked when a response is **unauthorized** (typically **401**) so you can **obtain a new access token** and **retry the failed request** with a fresh header—this keeps **refresh** logic **centralized** instead of scattering it across call sites.

**Production safeguards:**
- **Single-flight refresh:** if ten calls get 401, only **one** refresh runs (mutex / synchronized / actor); others await the same result.
- **Retry cap:** if refresh fails or the **same** request already retried once, **stop**—return **`null`** from `Authenticator` or bubble **logout**.
- **Detect auth loops:** track **`responseCount`** / custom flag so you never apply a **new** token to the **same** failing endpoint forever.

**OkHttp cache:** attach a **`Cache`** to the client for **GET** responses honoring **`Cache-Control`** / **`ETag`**; separate **auth** from **cache policy** (many APIs disable caching on private resources).


> Use **`Authenticator`** for **401 refresh**, **`Interceptor`** for **always-on** headers; **single-flight** refresh + **hard stop** prevents **retry storms**.

Interview Answer:
> *Interceptors** run on **every** request/response and are ideal for **adding** headers (e.g.
---
## Retrofit — why return `Response<T>` (or `Result`) instead of bare `T`?
**`Response<T>`** exposes **HTTP status**, **headers**, and **error body**—needed when **200 ≠ business success** (envelope: `{ "success": false, "errorCode": "…" }`). Parse the body in the **data layer** and map to **`Result`/sealed** types; never push **raw HTTP** exceptions to Compose.

### Code example

```kotlin
@GET("user/{id}")
suspend fun getUser(@Path("id") id: String): Response<UserDto>
```


> Fintech and enterprise APIs often **lie in the body**—the **status code** is not enough.

Interview Answer:
> *`Response<T`** exposes **HTTP status**, **headers**, and **error body**—needed when **200 ≠ business success** (envelope: `{ "success": false, "errorCode": "…" }`).
---
## Application vs network interceptors — when does each run?
**Application interceptors** see the request first and the response last—good for **auth headers**, **logging**, **metrics**. **Network interceptors** sit closest to the wire—good for **rewriting cache headers**, **SSL pinning** visibility, sometimes **retry** (use carefully). **Token refresh** belongs in **`Authenticator`** (401 path) with **single-flight**, not an unbounded **interceptor** loop—see earlier **`Authenticator`** card.


> **Add headers** early; **pin/cache at the network edge**; **refresh** via **`Authenticator`**, not spaghetti **intercept** chains.

Interview Answer:
> *Application interceptors** see the request first and the response last—good for **auth headers**, **logging**, **metrics**.
---
## How do you map API errors for the UI (without leaking Retrofit)?
Catch **`IOException`** (no network), **`HttpException`** (4xx/5xx), **parse timeouts**, and map to a **domain sealed** type (`NoNetwork`, `Timeout`, `ApiError(code, message)`, `Unknown`). **Repository** returns **`Result`** or **`Flow`** of domain states; **ViewModel** turns that into **`UiState`**. For **business errors** inside **200**, parse the envelope and emit **`DomainError.InsufficientBalance`** etc.


> One **mapping function** at the repository boundary keeps **UI** stable when **transport** changes.

Interview Answer:
> Catch **`IOException`** (no network), **`HttpException`** (4xx/5xx), **parse timeouts**, and map to a **domain sealed** type (`NoNetwork`, `Timeout`, `ApiError(code, message)`, `Unknown`).
---
## Pagination with Retrofit — `PagingSource` and duplicate loads?
Use **backend-driven** pages or **cursors** (prefer **cursor** when lists are huge/unstable). **`PagingSource`** loads **`LoadParams`** and returns **`LoadResult.Page`**; **Paging 3** manages **prefetch** and **invalidation**. Avoid **double fetches** by not firing **manual** loads while **`LoadState`** is **`Loading`**, and design **idempotent** APIs where **retry** is safe.


> **Paging library** + **stable keys** beat hand-rolled “page++” **race** bugs.

Interview Answer:
> Use **backend-driven** pages or **cursors** (prefer **cursor** when lists are huge/unstable).
---
## Layered defense — how do you protect sensitive data at rest, in memory, and in transit?
**In transit:** **HTTPS** only, **TLS** modern config, **`networkSecurityConfig`** to block **cleartext**; consider **pinning** for high-risk apps. **Tokens** short-lived; **refresh** on server patterns you trust.

**At rest:** no secrets in **plain** `SharedPreferences` or world-readable files—**EncryptedSharedPreferences** / **EncryptedFile** (AndroidX Security) with **Keystore-backed** keys; **Room** encryption (**SQLCipher** / supported APIs) when the DB holds **PII**.

**In memory:** avoid logging **tokens**; clear **sensitive** buffers when done; be careful with **screenshots** on sensitive screens (`FLAG_SECURE`) in regulated UX.

**Third-party SDKs:** they often cause **leaks**—audit **data collection**, **init** timing, and **ProGuard** rules.


> Security is **layers**—**TLS + encrypted storage + no logging + SDK audit**, not one checkbox.

Interview Answer:
> *In transit:** **HTTPS** only, **TLS** modern config, **`networkSecurityConfig`** to block **cleartext**; consider **pinning** for high-risk apps.
---
## HTTP caching for authenticated APIs — rules?
Use **`Cache-Control: no-store`** (or equivalent) on **auth** and **PII** responses when **OkHttp** disk cache is enabled; **never** cache **refresh** endpoints. For **safe** public **GET**s, respect **server** **ETag**/**max-age**. **Sensitive** offline copies belong in **encrypted** storage you control, not **shared** HTTP cache dirs.


> **Disk cache** = **another** data store—**classify** endpoints.

Interview Answer:
> Use **`Cache-Control: no-store`** (or equivalent) on **auth** and **PII** responses when **OkHttp** disk cache is enabled; **never** cache **refresh** endpoints.
---
## Staying current with API integration trends
**RFCs**, **conferences**, **secure coding** practice, **internal guilds**—learning should be **scheduled**, not vague “I read sometimes.”


> Show **habits**, not a one-time course list.

Interview Answer:
> *RFCs**, **conferences**, **secure coding** practice, **internal guilds**—learning should be **scheduled**, not vague “I read sometimes.” Show **habits**, not a one-time course list.
---
# Android Security
---
## What is certificate pinning?
-   TLS normally validates the server certificate chain.
-   Certificate pinning adds an additional check against an expected
    certificate or public key.

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

The trade-off is operational complexity during certificate rotation. It
should be used according to the threat model and security policy.

Interview Answer:
> TLS normally validates the server certificate chain.
---
## What is the Android Keystore?
-   Android Keystore provides a secure mechanism for managing
    cryptographic keys.
-   Keys can be hardware-backed on supported devices.
-   Applications can use it for encryption/signing operations without
    exposing key material directly.

It is not a general database. It is a key-management mechanism.

Interview Answer:
> Android Keystore provides a secure mechanism for managing cryptographic keys.
---
## What is certificate transparency?
-   Certificate Transparency provides public logs of issued
    certificates.
-   It helps detect improperly issued certificates.
-   It complements, rather than replaces, normal TLS validation.

Interview Answer:
> Certificate Transparency provides public logs of issued certificates.
---
## Why do android apps need to ask permission like `INTERNET` or `LOCATION`?
The Android platform takes advantage of the Linux user-based protection to identify and isolate app resources called sandbox. This isolates apps from each other and protects apps and the system from malicious apps. If an app needs to use some system resources (like internet, or location sensor,..) or needs to connect other apps (like IAB library), it should request this access. Then android OS give this request and get permission to access the resource. If you want to use system resources, request the permission under the `<uses-permission>` tag in the `android-manifest.xml` file.



> The Android platform takes advantage of the Linux user-based protection to identify and isolate app resources called sandbox.

Interview Answer:
> The Android platform takes advantage of the Linux user-based protection to identify and isolate app resources called sandbox.
---
## What are the permission protection levels in Android?
* **Normal** - A lower-risk permission that gives requesting applications access to isolated application-level features, with minimal risk to other applications, the system, or the user. The system automatically grants this type of permission to a requesting application at installation, without asking for the user's explicit approval.
* **Dangerous** - A higher-risk permission. Any dangerous permissions requested by an application may be displayed to the user and require confirmation before proceeding, or some other approach may be taken to avoid the user automatically allowing the use of such facilities.
* **Signature** - A permission that the system grants only if the requesting application is signed with the same certificate as the application that declared the permission. If the certificates match, the system automatically grants the permission without notifying the user or asking for the user's explicit approval.
* **SignatureOrSystem** - A permission that the system grants only to applications that are in the Android system image or that are signed with the same certificate as the application that declared the permission.<br>

Interview Answer:
> **Normal** - A lower-risk permission that gives requesting applications access to isolated application-level features, with minimal risk to other applications, the system, or the user.
---
## Uses permission vs Permission
- `<uses-permission>` in the manifest requests an app capability.
- A runtime permission is requested from the user for dangerous permissions.
- Declare the permission, check its current state, request it when needed, and handle denial.


### Useful links

- [Learn more](https://stackoverflow.com/questions/14450839/uses-permission-vs-permission-for-android-permissions-in-the-manifest-xml-file)
---
- [Learn more](https://stackoverflow.com/questions/14450839/uses-permission-vs-permission-for-android-permissions-in-the-manifest-xml-file)

Interview Answer:
> `<uses-permission>` declares access in the manifest; dangerous permissions also require a runtime user decision.
---
## Why Do You Need SSL Certificate Pinning? How it works?
- [Learn more](https://medium.com/@anuj.rai2489/ssl-pinning-254fa8ca2109)
    - [Learn more](https://dzone.com/articles/encryption-and-signing)
    - [Learn more](https://www.netguru.com/codestories/3-ways-how-to-implement-certificate-pinning-on-android)
    - [Learn more](https://www.raywenderlich.com/10056112-securing-network-data-tutorial-for-android)
    - [Learn more](https://appmattus.medium.com/android-security-ssl-pinning-1db8acb6621e)


### Useful links

- [Learn more](https://medium.com/@anuj.rai2489/ssl-pinning-254fa8ca2109)
- [Learn more](https://dzone.com/articles/encryption-and-signing)
- [Learn more](https://www.netguru.com/codestories/3-ways-how-to-implement-certificate-pinning-on-android)
- [Learn more](https://www.raywenderlich.com/10056112-securing-network-data-tutorial-for-android)
- [Learn more](https://appmattus.medium.com/android-security-ssl-pinning-1db8acb6621e)
---
- [Learn more](https://appmattus.medium.com/android-security-ssl-pinning-1db8acb6621e)

Interview Answer:
> [Learn more](https://medium.com/@anuj.rai2489/ssl-pinning-254fa8ca2109) [Learn more](https://dzone.com/articles/encryption-and-signing) [Learn more](https://www.netguru.com/codestories/3-ways-how-to-implement-certificate-pinning-on-android) [Learn…
---
## How do you know if the device is rooted?
We can check if superUser apk is installed in the device or if it contains su file or xbin folder. <br>
  Alternatively you can use [RootBeer](https://github.com/scottyab/rootbeer) library available in GitHub. For code part, click [Here](https://stackoverflow.com/a/35628977/3424919).


### Useful links

- [RootBeer](https://github.com/scottyab/rootbeer)
- [Here](https://stackoverflow.com/a/35628977/3424919)



> We can check if superUser apk is installed in the device or if it contains su file or xbin folder.
---
- [Learn more](https://stackoverflow.com/a/35628977/3424919)

Interview Answer:
> We can check if superUser apk is installed in the device or if it contains su file or xbin folder.
---
## What is Symmetric Encryption?
Symmetric encryption deals with creating a passphrase and encrypting the file with it. Then the server needs to send this passphrase(key) to the client so that the client can decrypt. Here the problem is sending that key to decrypt the file. If Hackers can access that key, they can misuse the data.



> Symmetric encryption deals with creating a passphrase and encrypting the file with it.

Interview Answer:
> Symmetric encryption deals with creating a passphrase and encrypting the file with it.
---
## What is Asymmetric Encryption?
Using algorithms like RSA, AES256, etc., the server generates 2 keys - public key and private key. The server then gives public key to clients. Client then encrypts the sensitive data with that public key and send it back to server. Now as the server alone has the private key, only it can decrypt the data. This is the most efficient way of sending data across the client and server.

  Example of this Asymmetric encryption are HTTPS using SSL certificate, Blockchain technologies like Bitcoin, etc.

  For more info, refer to this [video](https://youtu.be/AQDCe585Lnc)


### Useful links

- [video](https://youtu.be/AQDCe585Lnc)



> Using algorithms like RSA, AES256, etc., the server generates 2 keys - public key and private key. The server then gives public key to clients. Client then encrypts the sensitive data with that public key and send it bac…
---
- [Learn more](https://youtu.be/AQDCe585Lnc)

Interview Answer:
> Using algorithms like RSA, AES256, etc., the server generates 2 keys - public key and private key.
---
## App Data encryption
- Use HTTPS/TLS for data in transit.
- Use Android Keystore-backed keys for encryption keys.
- Protect small secrets with Jetpack Security and encrypt sensitive files or databases when required.
- Minimize stored data and clear it during secure logout.


### Useful links

- [Learn more](https://blog.mindorks.com/how-to-encrypt-data-safely-on-device-and-use-the-androidkeystore)
---
- [Learn more](https://blog.mindorks.com/how-to-encrypt-data-safely-on-device-and-use-the-androidkeystore)

Interview Answer:
> Encrypt sensitive data with Keystore-backed keys, minimize retention, and protect both transport and local storage.
---
## Certificate pinning with OkHttp — what breaks in production?
Pin **SPKI hashes** (not only full cert) when possible and plan **rotation** (multiple pins, overlap with backend). A bad pin bricks **all** installs until an app update—**monitor** TLS changes and keep an **escape hatch** (remote config to disable pinning only if your threat model allows).


> Pinning is **strong MITM defense** with **operational risk**—design **rotation**, not a single hash forever.

Interview Answer:
> Pin **SPKI hashes** (not only full cert) when possible and plan **rotation** (multiple pins, overlap with backend).
---
## Why SSL certificate pinning — and how does it work?
**Pinning** means your app remembers the **expected server certificate** (or public key hash) and **rejects** connections if someone presents a different one—even if a **rogue certificate authority** on a compromised device would otherwise trust it.

You configure pins in the network stack (for example **OkHttp `CertificatePinner`**). You need a **rotation plan**: **backup pins** and a way to **update** pins (remote config, app update) so you do not brick clients when certs change.

**Example:** Banking apps often pin API gateways while still keeping **normal TLS** hygiene and **auth** strong.

### Useful links

- [Learn more](https://medium.com/@anuj.rai2489/ssl-pinning-254fa8ca2109)
- [Learn more](https://dzone.com/articles/encryption-and-signing)
- [Learn more](https://www.netguru.com/codestories/3-ways-how-to-implement-certificate-pinning-on-android)
- [Learn more](https://www.raywenderlich.com/10056112-securing-network-data-tutorial-for-android)
- [Learn more](https://appmattus.medium.com/android-security-ssl-pinning-1db8acb6621e)


> Pinning is **extra defense**—it does not replace **good auth** and **solid server design**.
---
- [Learn more](https://appmattus.medium.com/android-security-ssl-pinning-1db8acb6621e)

Interview Answer:
> *Pinning** means your app remembers the **expected server certificate** (or public key hash) and **rejects** connections if someone presents a different one—even if a **rogue certificate authority** on a compromised device would otherwise trust it.
---
## Symmetric vs asymmetric encryption — where does each belong?
**Symmetric** encryption uses one shared key; it is **fast** for bulk data but you must solve **how both sides get the key safely**. **Asymmetric** uses a public/private pair—great for **key exchange** and **signatures**, slower for huge payloads.

Real systems (like **TLS**) are usually **hybrid**: asymmetric to set up a session, symmetric for the heavy lifting.

### Useful links

- [Learn more](https://youtu.be/AQDCe585Lnc)


> Production setups are almost always **hybrid**, not “only RSA” or “only AES.”
---
- [Learn more](https://youtu.be/AQDCe585Lnc)

Interview Answer:
> *Symmetric** encryption uses one shared key; it is **fast** for bulk data but you must solve **how both sides get the key safely**.
---
## Android Keystore — how do you store passwords/secrets?
Put **keys** in the **Android Keystore** so raw key material is harder to extract. For **small secrets** at rest, use **EncryptedSharedPreferences** or **EncryptedFile** (AndroidX Security) instead of **plain SharedPreferences**.

### Useful links

- [Learn more](https://developer.android.com/privacy-and-security/keystore)
- [Learn more](https://medium.com/@josiassena/using-the-android-keystore-system-to-store-sensitive-information-3a56175a454b)
- [Learn more](https://source.android.com/docs/security/features/keystore)
- [Learn more](https://www.linkedin.com/feed/update/urn:li:activity:7240434808684716032/)
- [Learn more](https://blog.mindorks.com/how-to-encrypt-data-safely-on-device-and-use-the-androidkeystore)


> Keep **keys out of app data dirs**; add **biometric / passcode** gates when the threat model says so.
---
- [Learn more](https://blog.mindorks.com/how-to-encrypt-data-safely-on-device-and-use-the-androidkeystore)

Interview Answer:
> Put **keys** in the **Android Keystore** so raw key material is harder to extract.
---
## Detecting rooted/tampered devices?
**Heuristics** (e.g. **`su`**, unusual partitions) plus libraries like **RootBeer** can hint at **root** or **tampering**. Expect **false positives** and **false negatives**—many teams treat this as **risk scoring** on the server, not a hard block, unless policy requires otherwise.

### Useful links

- [Learn more](https://github.com/scottyab/rootbeer)
- [Learn more](https://stackoverflow.com/a/35628977/3424919)


> Root detection is usually **risk scoring**, not a perfect gate.
---
- [Learn more](https://stackoverflow.com/a/35628977/3424919)

Interview Answer:
> *Heuristics** (e.g.
---
## Permission protection levels (`normal`, `dangerous`, `signature`, `signature|privileged`)
- **Normal:** granted at install; low risk.
- **Dangerous:** needs **runtime** prompt and a **clear UX** reason.
- **Signature / privileged:** for **same signing key** or **system** partners—not for random third-party apps.

Know the difference between **`<uses-permission>`** (your app requests) and declaring a **custom `<permission>`** for other apps.

### Useful links

- [Learn more](https://stackoverflow.com/questions/14450839/uses-permission-vs-permission-for-android-permissions-in-the-manifest-xml-file)


> **Dangerous** permissions need **user trust** and a **fallback** if denied.
---
- [Learn more](https://stackoverflow.com/questions/14450839/uses-permission-vs-permission-for-android-permissions-in-the-manifest-xml-file)

Interview Answer:
> **Normal:** granted at install; low risk.
---
## WebView security checklist
Treat **WebView** like a small browser: **disable JavaScript bridges** you do not need, **validate** URLs before loading, avoid **mixed content**, **update** WebView/System WebView, and keep **file access** off unless required.


> WebView is a **real attack surface**—lock it down by default.

Interview Answer:
> Treat **WebView** like a small browser: **disable JavaScript bridges** you do not need, **validate** URLs before loading, avoid **mixed content**, **update** WebView/System WebView, and keep **file access** off unless required.
---
## Supply chain security for Gradle dependencies
Use **dependency locking** or reproducible resolution, verify **checksums** where possible, **private** artifact repos, bots for **updates**, and treat **R8 mapping** as sensitive. Know what **transitive** libraries you ship.


> Your **dependency graph** is part of the **threat model**.

Interview Answer:
> Use **dependency locking** or reproducible resolution, verify **checksums** where possible, **private** artifact repos, bots for **updates**, and treat **R8 mapping** as sensitive.
---
## Can you stop reverse engineering of an Android app?
You **cannot** make an APK impossible to inspect—you **raise cost**: **R8/ProGuard** (real rules, tested on release), **remove debug logs** in release, **no hardcoded secrets** (assume extraction), **server-side** validation of business rules, optional **tamper / signature checks** for **high-risk** apps knowing **false positives**.


> Goal is **deterrence + server truth**, not **perfect secrecy** on the client.

Interview Answer:
> You **cannot** make an APK impossible to inspect—you **raise cost**: **R8/ProGuard** (real rules, tested on release), **remove debug logs** in release, **no hardcoded secrets** (assume extraction), **server-side** validation of business rules, optional **tamper / signature…
---
## Android Keystore — KeyMint/Keymaster, TEE, StrongBox, and how do you know a key is hardware-backed?
Keystore is an API over **KeyMint/Keymaster**; crypto may run in **software**, **TEE**, or **StrongBox** (dedicated chip). **Hardware-backed** means key material does not leave that boundary for **private** ops. **Do not assume:** query **`KeyInfo.isInsideSecureHardware`** (and **StrongBox** availability if you require it) after creation; **telemetry** fragmentation on low-end devices. **Trade-off:** HW keys can be **slower** and **limited** count; handle **fallback** product policy.


> **Verify** backing—Android may **silently** use **software**.

Interview Answer:
> Keystore is an API over **KeyMint/Keymaster**; crypto may run in **software**, **TEE**, or **StrongBox** (dedicated chip).
---
## Keystore mistakes and biometric / lock screen changes?
Storing **tokens** in **plain** prefs; treating Keystore as “**storage**” instead of **crypto provider**; ignoring **invalidation**. Keys can be **invalidated** when biometrics **re-enroll** or policy changes—expect **`KeyPermanentlyInvalidatedException`**, **delete** alias, **wipe** dependent ciphertext, **force** re-auth. Use **`setInvalidatedByBiometricEnrollment`** / **`setUserAuthenticationRequired`** when product demands **step-up**.


> Keys can **disappear**—design **recovery**, not **crash**.

Interview Answer:
> Storing **tokens** in **plain** prefs; treating Keystore as “**storage**” instead of **crypto provider**; ignoring **invalidation**.
---
## MITM beyond TLS — what layers do high-risk apps add?
**Certificate pinning** (with **backup pins**—see earlier card). Optional **request signing** (**HMAC**, **nonce**, **timestamp**) for **anti-replay**—**server** validates. **Device binding** / **integrity** signals (**Play Integrity**) feed **risk** decisions **server-side**. **Cleartext** blocked in **`networkSecurityConfig`**.


> **TLS** is **baseline**, not the whole **fraud** story.

Interview Answer:
> *Certificate pinning** (with **backup pins**—see earlier card).
---
## Permissions — secure runtime habits?
**Just-in-time** requests with **clear** rationale; **re-check** before **sensitive** ops (user can **revoke** in settings); **degrade** gracefully. **Custom** permissions for **signature** **partners** only with **clear** docs.


> **Grant** state is **volatile**—never **cache “forever granted”** in your head.

Interview Answer:
> *Just-in-time** requests with **clear** rationale; **re-check** before **sensitive** ops (user can **revoke** in settings); **degrade** gracefully.
---
## Android security strategy in one layered picture?
**Keystore** + **encrypted** prefs/files/DB → **TLS** + optional **pinning** → **minimal** **secrets** on device → **R8** + **runtime** **hardening** where justified → **logout** and **revocation** → **manifest** **hygiene** → **server** **truth** for **money** and **authorization**. **Blast radius** reduction beats **perfect** **client**.


> Say **layers + failure modes**—staff interviews reward **honesty** about **limits**.

Interview Answer:
> *Keystore** + **encrypted** prefs/files/DB → **TLS** + optional **pinning** → **minimal** **secrets** on device → **R8** + **runtime** **hardening** where justified → **logout** and **revocation** → **manifest** **hygiene** → **server** **truth** for **money** and…
---
## How do you ensure DB security & integrity (health/finance examples)?
Use **encryption at rest** when required, **validate** inputs and schemas, enforce **auth** on the server (never trust the client alone), **encrypt backups**, and use **least privilege** for any shared providers.


> **Client-side encryption** pairs with **server authorization**—one without the other is weak.

Interview Answer:
> Use **encryption at rest** when required, **validate** inputs and schemas, enforce **auth** on the server (never trust the client alone), **encrypt backups**, and use **least privilege** for any shared providers.
---
## EncryptedSharedPreferences — when and how (Jetpack Security)?
For **small** secrets (tokens, flags) under ~**1–2 MB** total. **MasterKey** lives in **Android Keystore**; values use **AES-GCM** with random IVs; **keys** of entries use **SIV-style** deterministic encryption for lookup. **Slower** than plain prefs—do not store **large** blobs. **Never** log values.

### Code example

```kotlin
val masterKey = MasterKey.Builder(context)
    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
    .build()

val securePrefs = EncryptedSharedPreferences.create(
    context,
    "secure_prefs",
    masterKey,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
)
```


> Jetpack Crypto = **Keystore-wrapped keys** + **AES**—not a separate “magic vault.”

Interview Answer:
> For **small** secrets (tokens, flags) under ~**1–2 MB** total.
---
## Key rotation for local encryption?
**Version** key aliases (`storage_v2`); on upgrade **re-encrypt** data with **new** key or **wipe** and **resync** from server. Plan **Keystore** cleared (user cleared credentials)—**force** re-login and **reprovision**.


> Rotation is a **migration**—test **upgrade** path like any **schema** change.

Interview Answer:
> *Version** key aliases (`storage_v2`); on upgrade **re-encrypt** data with **new** key or **wipe** and **resync** from server.
---
## BLE permissions on Android 12+ — what breaks if you forget them?
You need runtime **`BLUETOOTH_SCAN`** and **`BLUETOOTH_CONNECT`** (and sometimes **`BLUETOOTH_ADVERTISE`** if you advertise). On **older** OS versions, **fine location** was often required for **scanning** because scan results could be abused for location—**know the version matrix** for your `targetSdk`.

**Manifest + runtime request** must match your use case (never scan on a permission you do not hold). **`neverForLocation`** flag on scan when applicable documents intent.


> **Android 12+** = explicit **`BLUETOOTH_*`** runtime grants; do not assume “location permission” alone.

Interview Answer:
> You need runtime **`BLUETOOTH_SCAN`** and **`BLUETOOTH_CONNECT`** (and sometimes **`BLUETOOTH_ADVERTISE`** if you advertise).
---
## What is certificate pinning and when do you use it?
**Certificate pinning** hardcodes your server's public key (or certificate hash) in the app so it only trusts *your* server, ignoring any CA-signed certificate that doesn't match.

**Without pinning:** A compromised CA or MITM proxy (even Burp Suite in corporate networks) can present a valid-looking certificate → your app accepts it → traffic decrypted.

**With pinning:** Even a valid CA-signed certificate from an attacker is rejected if the public key doesn't match the pinned value.

```kotlin
// OkHttp CertificatePinner
val pinner = CertificatePinner.Builder()
    .add("api.yourapp.com", "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=")
    .add("api.yourapp.com", "sha256/BBBBBBBBB...") // backup pin
    .build()
OkHttpClient.Builder().certificatePinner(pinner).build()
```

**Trade-offs to discuss in interviews:**
- **Pro:** Strong MITM protection in hostile networks
- **Con:** Certificate rotation requires app update or remote config for new pins; breaking change if not managed carefully
- **When to use:** Financial apps, healthcare, apps processing PII — when MITM is a real threat model
- **Alternative:** Network Security Config (`res/xml/network_security_config.xml`) for simpler pinning without code changes


> Pin the **public key hash** (not full cert) with a **backup pin** and a **rotation plan** — pinning without rotation is a future outage waiting to happen.

Interview Answer:
> *Certificate pinning** hardcodes your server's public key (or certificate hash) in the app so it only trusts *your* server, ignoring any CA-signed certificate that doesn't match.
---
## How do you protect API keys and prevent reverse engineering?
**API Key Protection — layers of defense:**
1. **Don't hardcode in source** — never in `strings.xml`, Kotlin constants, or git-committed config
2. **`BuildConfig` + Gradle** — inject from environment variables in CI; not in source control
3. **Server-side proxying** — app calls your backend; backend holds the real third-party key
4. **NDK (native code)** — harder to reverse than JVM bytecode, not impossible

**Prevent Reverse Engineering:**
- **ProGuard / R8** — obfuscates class/method names, removes dead code, shrinks APK
- **R8 full mode** — more aggressive than ProGuard; enabled in release builds by default in modern AGP
- **Tamper detection** — verify APK signature at runtime; detect rooted devices (SafetyNet → Play Integrity API)
- **Root detection** — use Play Integrity API; don't implement basic `su` file checks alone (trivially bypassed)

```kotlin
// build.gradle release block
buildTypes {
    release {
        isMinifyEnabled = true
        isShrinkResources = true
        proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
    }
}
```

**What ProGuard/R8 does NOT protect:**
- Logic that is still present in bytecode (just renamed)
- Plaintext strings, URLs, keys embedded in code
- SSL traffic before reaching your server


> API key security = **never in source + server proxying + obfuscation**. R8 is obfuscation, not encryption — pair it with key management and Play Integrity for defense-in-depth.
---
<!-- Source: docs/android/android-engineering.md -->

Interview Answer:
> *API Key Protection — layers of defense:** 1.
---
## Keystores in CI — how do mature teams avoid leaking signing material?
Prefer **Play App Signing**: Google holds **app signing key**; your **upload key** lives in **CI secrets** (Vault, GitHub Actions secrets, etc.), injected as **env vars** or **ephemeral** files—**never** commit. **Rotate** upload key on compromise without breaking installed apps. **Least privilege:** only release jobs can decrypt.

### Code example

```kotlin
signingConfigs {
    create("release") {
        storeFile = file(System.getenv("KEYSTORE_PATH") ?: error("KEYSTORE_PATH"))
        storePassword = System.getenv("KEYSTORE_PASSWORD")
        keyAlias = System.getenv("KEY_ALIAS")
        keyPassword = System.getenv("KEY_PASSWORD")
    }
}
```


> **Upload key** in secrets; **app signing key** with Play—know **what leaks** vs what **revokes**.

Interview Answer:
> Prefer **Play App Signing**: Google holds **app signing key**; your **upload key** lives in **CI secrets** (Vault, GitHub Actions secrets, etc.), injected as **env vars** or **ephemeral** files—**never** commit.
---
## API security with sensitive data
Cover **TLS**, **pinning** if needed, **token lifecycle**, **least privilege** scopes, **encryption at rest** on device, **OWASP Mobile** awareness, **key rotation**, and **abuse detection** on the server.


> Security is **process + design**, not one library you drop in once.

Interview Answer:
> Cover **TLS**, **pinning** if needed, **token lifecycle**, **least privilege** scopes, **encryption at rest** on device, **OWASP Mobile** awareness, **key rotation**, and **abuse detection** on the server.
---
## Data security in databases
Discuss **encryption**, **integrity**, **authenticated APIs**, **backup** protection, and **least privilege** access—on **client and server**.


> Defense in depth across **device + backend**.

Interview Answer:
> Discuss **encryption**, **integrity**, **authenticated APIs**, **backup** protection, and **least privilege** access—on **client and server**.
---
## What is Android Keystore and why is it used?
Android Keystore is a secure container that helps store cryptographic keys. These keys can be used for encryption, decryption, or signing without exposing them directly to the app.
It ensures that:
- Keys cannot be extracted.
- Operations happen in secure hardware (if available).
- Your app remains safe even if rooted.

Interview Answer:
> Android Keystore is a secure container that helps store cryptographic keys.
---
## What are common security risks in Android apps?
Some common risks:
- Storing data in plain text.
- Using HTTP instead of HTTPS.
- Hardcoding API keys in code.
- Not validating inputs (leading to injection attacks).
- Using outdated libraries with vulnerabilities.

Interview Answer:
> Some common risks: Storing data in plain text.
---
## How can you protect your API keys in Android?
- Don’t hardcode keys in code or strings.xml.
- Use BuildConfig with Gradle to store API keys.
- Store keys on the server and use token-based auth.
- Use NDK (native C++) for critical keys (not fully secure but harder to reverse).

Interview Answer:
> Don’t hardcode keys in code or strings.xml.
---
## How can you prevent reverse engineering of your APK?
- Use ProGuard or R8 to obfuscate the code.
- Remove unused code and classes.
- Avoid storing logic or secrets in the app.
- Sign APKs with release keystore.
- Monitor unauthorized APKs using Play Store Console.

Interview Answer:
> Use ProGuard or R8 to obfuscate the code.
---
# Jetpack Compose
---
## What are stable and unstable types in Compose?
-   Compose uses stability information to reason about whether
    parameters are likely to change.
-   Stable parameters can help Compose skip unnecessary recomposition.
-   Mutable or poorly designed types can make stability harder to
    determine.

Prefer immutable UI models where possible.

```kotlin
data class UserUiModel(
    val id: String,
    val name: String
)
```

The goal is not to add annotations blindly. The data model should
actually satisfy the stability contract.

Interview Answer:
> Compose uses stability information to reason about whether parameters are likely to change.
---
## How do you make a Compose screen accessible?
Use:

-   Meaningful semantics
-   Content descriptions where needed
-   Correct roles
-   Adequate touch targets
-   Good contrast
-   Font scaling support
-   Proper focus order
-   TalkBack validation

```kotlin
Modifier.semantics {
    contentDescription = "Account balance"
}
```

Do not add content descriptions to elements where the visible text
already provides the correct semantics.

Interview Answer:
> Use: Meaningful semantics Content descriptions where needed Correct roles Adequate touch targets Good contrast Font scaling support Proper focus order TalkBack validation Do not add content descriptions to elements where the visible text already provides the correct semantics.
---
## In Jetpack Compose, how do you preserve scroll position when the user navigates back?
Use `rememberLazyListState()` in Composable:

```kotlin
val listState = rememberLazyListState()
LazyColumn(state = listState) { ... }
```

Interview Answer:
> Use `rememberLazyListState()` in Composable:
---
## Jetpack Compose — declarative UI, recomposition, state, navigation, performance, testing
- **Compose** builds UI from **`@Composable`** functions that describe the screen from **state**. When state changes, Compose **recomposes** (re-runs) the affected parts of the tree—not the whole app.
- **State:** `remember` / `rememberSaveable` for local UI; **ViewModel + StateFlow** for screen truth. Keep **business rules** out of composables when possible.
- **Modifiers:** Ordered chains describe layout, clicks, semantics—order matters.
- **Interop:** `AndroidView` / `ComposeView` bridges **Views** and **Compose**.
- **Navigation:** Navigation-Compose with **routes** and **deep links**.
- **Performance:** Stable parameters, **keys** in lazy lists, **`derivedStateOf`**, and **recomposition counts** in debug.
- **Side effects:** `LaunchedEffect`, `DisposableEffect`, `SideEffect` tie work to lifecycle.
- **Theming:** `MaterialTheme` and composition locals.
- **A11y:** semantics, content descriptions, focus order.
- **Testing:** Compose test APIs and **semantics** (prefer **`testTag`** discipline).

Interview Answer:
> **Compose** builds UI from **`@Composable`** functions that describe the screen from **state**.
---
## Compose testing — how is it different from Espresso?
Compose tests use a **semantic tree** (roles, text, **`testTag`**) instead of **View IDs**. Synchronization differs from Espresso—follow **Compose testing** guidance (see `android-architecture.md`).

> Compose favors **semantic matchers**, not fragile **view hierarchy** IDs.

Interview Answer:
> Compose tests use a **semantic tree** (roles, text, **`testTag`**) instead of **View IDs**.
---
## Jetpack Compose Performance Issue — Excessive Recompositions
Modern app fully built in Jetpack Compose. Users report: UI feels laggy during interactions, animations stutter, CPU spikes during scrolling. Recomposition count is very high; even small state updates trigger full-screen recomposition. Recent changes: shared UI state in ViewModel, large data objects passed to composables, multiple `collectAsState()` calls added. **How would you debug and fix?**

> Treat this as a **state architecture problem**, not a UI rendering problem. Compose performance is directly tied to how state is structured and consumed.

#### Measure Recompositions Before Changing Code
- **Layout Inspector** (Android Studio) → "Recomposition counts" view — shows how many times each composable recomposed in a session
- **Composition tracing** — `Trace` calls + Perfetto to see recompositions in system trace
- **CPU Profiler** — confirm CPU spikes correlate with scrolls/interactions
- Goal: identify *which* composables recompose, and whether it is **localized** (good) or **cascading** (bad)

#### Identify Root Causes in This Scenario

| Root Cause | Symptom |
|-----------|---------|
| Unstable/large objects as params | Composable recomposes even when data hasn't changed |
| Shared state causing global recomposition | Scroll one item → whole screen redraws |
| Multiple `collectAsState()` | Each emission triggers separate recomposition wave |
| Missing `remember` | Expensive object re-created every recomposition |
| Lambdas recreated in composable body | Child composables never skip even with same params |

#### Identify Root Causes 
- Passing unstable or large objects as parameters 
- Shared state causing global recomposition 
- Multiple collectAsState() causing redundant updates 
- Missing remember or incorrect state scoping 

#### Fix State Design 
- Hoist and Scope State Properly 
- Avoid global state for entire screen 
- Break state into smaller, independent pieces 
- Use Stable Data Structures 
- Ensure models are immutable 
- Avoid passing mutable lists or objects 
- Avoid Passing Large Objects 
Instead of: 
- Passing full UI model 
Pass: 
- Only required fields 

#### Optimize State Collection
- collectAsState() calls 
Use: 
- Combine flows in ViewModel 
- Expose single UI state

#### Use remember and derivedStateOf 
- Cache expensive calculations 
- Avoid recomputation 

#### Reduce Recomposition Scope 
- Break UI into smaller composables 
- Ensure only affected composables recompose 

#### Advanced Optimization 
- Use key() for stable identity 
- Avoid lambda recreation inside composables 

#### Validation 
- Compare recomposition counts 
- Measure FPS improvement 
- Track CPU usage 

Interview Answer: 
> Compose performance issues are not UI problems — they are state architecture  problems, and solving them requires precise control over state flow and recomposition boundaries.
---
## What is Jetpack Compose?
Jetpack Compose is Android’s modern UI toolkit that lets you build UI using Kotlin code instead of XML.
- It’s declarative, meaning you describe what the UI should look like, and the system updates it automatically when the data changes.
- It replaces traditional XML + View-based UI system.
- Offers less boilerplate, better state handling, and Kotlin-first approach.

Interview Answer:
> Jetpack Compose is Android’s modern UI toolkit that lets you build UI using Kotlin code instead of XML.
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

Interview Answer:
> A Composable is a special Kotlin function marked with `@Composable` that describes part of the UI.
---
## What is recomposition in Jetpack Compose?
Recomposition is when Compose redraws parts of the UI because data/state has changed.
- Only the part of the UI where data changed is recomposed.
- Compose optimizes this to avoid redrawing everything.

*Example:* If you update a count value shown in a Text, only that Text composable will recompose.

Interview Answer:
> Recomposition is when Compose redraws parts of the UI because data/state has changed.
---
## What is State in Compose?
State holds data that changes over time and triggers recomposition.
You can use `remember` and `mutableStateOf`:
```kotlin
val count = remember { mutableStateOf(0) }
```
When `count.value` changes, any UI that depends on it will update automatically.

Interview Answer:
> State holds data that changes over time and triggers recomposition.
---
## What is remember and rememberSaveable?
- `remember` stores state during recomposition but resets on configuration changes (like rotation).
- `rememberSaveable` stores state across recomposition and configuration changes using Bundle.

Use `rememberSaveable` for things like text input or selection state that should survive screen rotation.

Interview Answer:
> `remember` stores state during recomposition but resets on configuration changes (like rotation).
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

Interview Answer:
> Modifier is used to modify or decorate a composable — like setting padding, background, size, click behavior, etc.
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

Interview Answer:
> Scaffold is a layout component that provides basic structure like: TopBar BottomBar FloatingActionButton Drawer SnackbarHost Example:* Useful for material design layouts.
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

Interview Answer:
> In Jetpack Compose, a SideEffect is any operation that affects something outside of the Compose UI tree.
---
# Unit and UI Testing
---
## What is unit testing?
-   Unit tests verify small pieces of logic.
-   They are usually fast and run on the JVM.

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

Interview Answer:
> Unit tests verify small pieces of logic.
---
## What is an instrumentation test?
-   It runs with Android framework/device support.
-   It is useful for integration with Android components, databases, and
    other platform behavior.

```text
Test
 ↓
Emulator/device
 ↓
Android framework
```

Interview Answer:
> It runs with Android framework/device support.
---
## What is a UI test?
-   UI tests verify user-visible behavior.
-   Compose provides testing APIs based on semantics.

```kotlin
composeTestRule
    .onNodeWithText("Pay")
    .performClick()
```

Test important user journeys rather than every internal implementation
detail.

Interview Answer:
> UI tests verify user-visible behavior.
---
## What is the difference between a mock and a fake?
-   Mock simulates behavior and often verifies interactions.
-   Fake is a simplified working implementation.

```kotlin
class FakeUserRepository : UserRepository {
    override suspend fun getUser() = User("1", "Kiran")
}
```

Fakes can make tests less coupled to implementation details.

Interview Answer:
> Mock simulates behavior and often verifies interactions.
---
## How do you test coroutines?
Use `runTest` and test dispatchers.

```kotlin
@Test
fun `load user updates state`() = runTest {
    viewModel.loadUser()

    // assert state
}
```

Avoid real delays and real background dispatchers in deterministic unit
tests.

Interview Answer:
> Use `runTest` and test dispatchers.
---
## What is the Android test pyramid?
A useful approach is:

```text
        UI tests
       /        \
 Integration tests
   /              \
       Unit tests
```

Use many fast unit tests, fewer integration tests, and a smaller number
of critical end-to-end UI tests.

Interview Answer:
> A useful approach is: Use many fast unit tests, fewer integration tests, and a smaller number of critical end-to-end UI tests.
---
## How do you decide what to UI test?
Prioritize:
-   Login
-   Payments
-   Navigation
-   Critical business journeys
-   Accessibility-critical behavior
-   Important regression scenarios

Do not put every business rule into UI tests. Keep most logic in fast
unit tests.

Interview Answer:
> Prioritize: Login Payments Navigation Critical business journeys Accessibility-critical behavior Important regression scenarios Do not put every business rule into UI tests.
---
## What is Espresso
- Espresso is an Android UI testing framework.
- It finds views through matchers and performs actions with `ViewActions`.
- It checks results with assertions and synchronizes with the UI thread.


### Useful links

- [Learn more](https://medium.com/mindorks/android-testing-part-1-espresso-basics)
---
- [Learn more](https://medium.com/mindorks/android-testing-part-1-espresso-basics)

Interview Answer:
> Espresso tests user-visible View-based UI interactions with synchronized actions and assertions.
---
## What is Screenshot testing
*  [Learn more](https://github.com/facebook/screenshot-tests-for-android)
*  [Learn more](https://facebook.github.io/screenshot-tests-for-android/#getting-started)


### Useful links

- [Learn more](https://github.com/facebook/screenshot-tests-for-android)
- [Learn more](https://facebook.github.io/screenshot-tests-for-android/#getting-started)
---
- [Learn more](https://facebook.github.io/screenshot-tests-for-android/#getting-started)

Interview Answer:
> [Learn more](https://github.com/facebook/screenshot-tests-for-android) [Learn more](https://facebook.github.io/screenshot-tests-for-android/#getting-started) [Learn more](https://github.com/facebook/screenshot-tests-for-android) [Learn…
---
## Explain the test pyramid on mobile.
Most tests should be **fast unit tests** (pure logic, ViewModels with fakes). Fewer **integration tests** hit real **Room**, **Retrofit + MockWebServer**, or navigation. **UI tests** (Espresso / Compose) are the smallest top—slow and flaky if overused—save them for **critical flows** and run on **labs** for OEM quirks.

Diagram: `assets/test_pyramid.png`

Interview Answer:
> Most tests should be **fast unit tests** (pure logic, ViewModels with fakes).
---
## Common Espresso failures and anti-patterns?
**Top causes:** missing sync for **real** async, **animations** on, **`Thread.sleep`**, **RecyclerView** binding races, **ambiguous** matchers, tests that **depend on order**. Replace sleeps with **idling**, **fakes**, or **architecture** fixes.

> **`Thread.sleep` in a UI test** is a **code-review fail** unless you document an impossible alternative (rare).

Interview Answer:
> *Top causes:** missing sync for **real** async, **animations** on, **`Thread.sleep`**, **RecyclerView** binding races, **ambiguous** matchers, tests that **depend on order**.
---
## Screenshot testing
**Screenshot tests** catch **visual** regressions in CI. You need **stable fonts, locale, and timing** so images are comparable. Keep the **golden set small** or maintenance hurts.

- Useful links
- [Learn more](https://github.com/facebook/screenshot-tests-for-android)
- [Learn more](https://facebook.github.io/screenshot-tests-for-android/#getting-started)

Interview Answer:
> *Screenshot tests** catch **visual** regressions in CI.
---
## UI + unit testing strategy
**Pyramid** shape, **deterministic CI**, **screenshots** for a small golden UI set, **MockWebServer** for APIs, **TDD** where it pays back.


> **Killing flakes** is a senior skill—not “rerun until green.”

Interview Answer:
> *Pyramid** shape, **deterministic CI**, **screenshots** for a small golden UI set, **MockWebServer** for APIs, **TDD** where it pays back.
---
## What is Unit Testing in Android?
Unit testing is the practice of testing individual components or functions in isolation to ensure they behave correctly.
- In Android, we typically use JUnit for unit testing.
- Unit tests run on the JVM and are fast because they don't require a device/emulator.

Interview Answer:
> Unit testing is the practice of testing individual components or functions in isolation to ensure they behave correctly.
---
## What is the difference between Unit Tests and Instrumentation Tests in Android?
| Unit Test | Instrumentation Test |
| :--- | :--- |
| Runs on JVM | Runs on a real device/emulator |
| Fast | Slower due to UI/device interaction |
| Tests logic in isolation | Tests integration, UI, and end-to-end |
| Uses JUnit/Mockito | Uses Espresso, UI Automator, etc. |

Interview Answer:
> | Unit Test | Instrumentation Test | | :--- | :--- | | Runs on JVM | Runs on a real device/emulator | | Fast | Slower due to UI/device interaction | | Tests logic in isolation | Tests integration, UI, and end-to-end | | Uses JUnit/Mockito | Uses Espresso, UI Automator, etc.
---
## Which tools/libraries are used for Unit Testing in Android?
- **JUnit** – Base library for writing tests.
- **Mockito / MockK** – For mocking dependencies.
- **Truth / AssertJ / Hamcrest** – Assertion libraries.
- **Robolectric** – Allows you to run Android SDK code in JVM unit tests.
- **Turbine** – For testing Kotlin Flow.
- **Kotlin Test DSL** – For idiomatic Kotlin test writing.

Interview Answer:
> **JUnit** – Base library for writing tests.
---
# Bluetooth Low Energy
---
## What is the problem with a huge common module?
A giant `common` module can become a dumping ground.

```text
feature A → common
feature B → common
feature C → common
```

Soon everything depends on everything.

Prefer focused modules such as:

```text
core-network
core-database
core-ui
core-security
```

with clear responsibilities.

Interview Answer:
> A giant `common` module can become a dumping ground.
---
# Performance and Reliability
---
## What is a memory leak?
-   A memory leak occurs when objects remain reachable even though they
    are no longer needed.
-   Android commonly sees leaks from lifecycle misuse.

Examples:

```text
Singleton
   ↓
Activity
   ↓
Activity cannot be collected
```

Use LeakCanary and Memory Profiler to investigate.

Interview Answer:
> A memory leak occurs when objects remain reachable even though they are no longer needed.
---
## What are Baseline Profiles?
-   Baseline Profiles tell Android which code paths are important.
-   They can improve startup and runtime performance by enabling
    ahead-of-time optimization for important paths.

For critical flows such as application startup and login, they can
provide measurable benefits.

Interview Answer:
> Baseline Profiles tell Android which code paths are important.
---
## What is ANR rate?
-   It measures application-not-responding events.
-   It is an important Android stability metric.
-   Monitor it together with startup, rendering, and crash metrics.

A release with good crash numbers can still be unhealthy if ANRs
increase.

Interview Answer:
> It measures application-not-responding events.
---
## What is overdraw?
-   Overdraw occurs when the same screen pixel is drawn multiple times.
-   Excessive overdraw can increase rendering cost.

Avoid unnecessary backgrounds and deeply nested layouts.

Use Android Studio's rendering/profiling tools to investigate.

Interview Answer:
> Overdraw occurs when the same screen pixel is drawn multiple times.
---
## What is the difference between a crash and an ANR?
-   Crash terminates the application process or component due to an
    unhandled failure.
-   ANR means the application is not responding to user/system
    interaction within required time limits.

```text
Crash → application failure
ANR   → application unresponsive
```

Both should be monitored in production.

Interview Answer:
> Crash terminates the application process or component due to an unhandled failure.
---
## Battery optimizationn for Android
- **Lead:** [Link](https://blog.mindorks.com/battery-optimization-for-android-apps-f4ef6170ff70)batteru
- **Resource:** See links below.


### Useful links

- [Learn more](https://blog.mindorks.com/battery-optimization-for-android-apps-f4ef6170ff70)



> [Link](https://blog.mindorks.com/battery-optimization-for-android-apps-f4ef6170ff70)batteru
---
- [Learn more](https://blog.mindorks.com/battery-optimization-for-android-apps-f4ef6170ff70)

Interview Answer:
> **Lead:** [Link](https://blog.mindorks.com/battery-optimization-for-android-apps-f4ef6170ff70)batteru **Resource:** See links below.
---
## Bitmap pooling in android?
Bitmap pooling is a simple technique, that aims to reuse bitmaps instead of creating new ones every time. When you need a bitmap, you check a bitmap stack to see if there are any bitmaps available. If there are not bitmaps available you create a new bitmap otherwise you pop a bitmap from the stack and reuse it. Then when you are done with the bitmap, you can put it on a stack.


### Useful links

- [Learn more](https://outcomeschool.com/blog/bitmap-pool)
---
- [Learn more](https://outcomeschool.com/blog/bitmap-pool)

Interview Answer:
> Bitmap pooling is a simple technique, that aims to reuse bitmaps instead of creating new ones every time.
---
## How you load your `Bitmaps`? What do you do for loading large bitmaps?
- Decode images close to their display size.
- Use an image library with memory and disk caching.
- Prefer thumbnails, sampling, and appropriate formats.
- Avoid keeping many full-resolution bitmaps in memory.


### Useful links

- [Learn more](https://android.jlelse.eu/loading-large-bitmaps-efficiently-in-android-66826cd4ad53)
---
- [Learn more](https://android.jlelse.eu/loading-large-bitmaps-efficiently-in-android-66826cd4ad53)

Interview Answer:
> Resize and sample large images, use caching, and load them only when needed.
---
## What is an Application Not Responding (ANR) error, and how can you prevent them from occurring in an app?
An ANR dialog appears when your UI has been unresponsive for more than 5 seconds, usually because you’ve blocked the main thread. To avoid encountering ANR errors, you should move as much work off the main thread as possible.<br>



> An ANR dialog appears when your UI has been unresponsive for more than 5 seconds, usually because you’ve blocked the main thread.

Interview Answer:
> An ANR dialog appears when your UI has been unresponsive for more than 5 seconds, usually because you’ve blocked the main thread.
---
## How would you implement swipe animation in Android
<br>


### Code example

```xml
<set xmlns:android="http://schemas.android.com/apk/res/android"
    android:shareInterpolator="false">
    <translate
        android:fromXDelta="-100%"
        android:toXDelta="0%"
        android:fromYDelta="0%"
        android:toYDelta="0%"
        android:duration="700" />
</set>
```

Interview Answer:
> <br>
---
## Shimmer effect animation placeholder
- Shimmer is a temporary loading effect shown while content is unavailable.
- Keep it lightweight and stop it when content or an error appears.
- Prefer clear skeleton layouts that resemble the final content.


### Useful links

- [Learn more](https://blog.mindorks.com/using-shimmer-effect-placeholder-in-android/)
---
- [Learn more](https://blog.mindorks.com/using-shimmer-effect-placeholder-in-android/)

Interview Answer:
> Use shimmer only as a short loading placeholder and remove it when loading finishes.
---
## How do you create a Memory Leak in Android?
By passing the context to static block (class or method), we can create a Memory Leak.



> By passing the context to static block (class or method), we can create a Memory Leak.

Interview Answer:
> By passing the context to static block (class or method), we can create a Memory Leak.
---
## How do you avoid a Memory Leak in Android?
By making the objects eligible for GC (Garbage Collection) after a class (Activity or Fragment) is destroyed. We can also use Weak References like WeakHashMaps to loosely hold the data and make it easily available to GC.



> By making the objects eligible for GC (Garbage Collection) after a class (Activity or Fragment) is destroyed.

Interview Answer:
> By making the objects eligible for GC (Garbage Collection) after a class (Activity or Fragment) is destroyed.
---
## How do you identify a Memory Leak in Android?
By using Profiler in Android Studio or by using LeakCanary Library in Android.



> By using Profiler in Android Studio or by using LeakCanary Library in Android.

Interview Answer:
> By using Profiler in Android Studio or by using LeakCanary Library in Android.
---
## How do you reduce battery consumption?
1. Never poll the server for updates.
    2. Sync only when required. Ideally, sync when phone is on Wi-Fi and plugged in.
    3. Defer your work using WorkManager.
    4. Compress your data
    5. Defer non immediate requests until the phone is plugged in or wifi is turned on. The Wi-Fi radio uses significantly less battery than the mobile radio.



> 1. Never poll the server for updates. 2. Sync only when required. Ideally, sync when phone is on Wi-Fi and plugged in. 3. Defer your work using WorkManager. 4. Compress your data 5. Defer non immediate requests until the…

Interview Answer:
> 1.
---
## How do you improve battery while fetching location for an app?
1. By changing Accuracy -> we can use setPriority() to PRIORITY_LOW_POWER
    2. By changing Frequency of fetching location -> we can use setInterval() to specify the time interval
    3. By increasing latency -> After our call, we can wait for longer time - we can use setMaxWaitTime() to set large timeout.

  ### Dagger 2 Related Questions:



> 1. By changing Accuracy -> we can use setPriority() to PRIORITY_LOW_POWER 2. By changing Frequency of fetching location -> we can use setInterval() to specify the time interval 3. By increasing latency -> After our call,…

Interview Answer:
> 1.
---
## What is ANR and how do you prevent it as a tech lead?
**ANR** means “Application Not Responding.” The system shows a dialog when your app stops responding for too long—about **5 seconds** on the main thread while the user is interacting. Broadcast receivers and services have their own time limits too.

The main thread draws the UI and handles touches. If it is busy parsing JSON, doing heavy database work, or waiting on locks, input piles up and you get an ANR.

What to do: move slow work off the main thread (background threads, coroutines with the right dispatcher), keep the UI path fast, and use profiling (Android Studio, Perfetto) instead of guessing.


> **Profile the main thread** with Android Studio or Perfetto—don’t guess where time goes.

Interview Answer:
> *ANR** means “Application Not Responding.” The system shows a dialog when your app stops responding for too long—about **5 seconds** on the main thread while the user is interacting.
---
## Bitmap loading, large images, and bitmap pooling
Large bitmaps blow the heap if you decode them at full resolution. Use **`inJustDecodeBounds`** first to read dimensions, then set **`inSampleSize`** (or use `ImageDecoder`, Coil, Glide) so the decoded bitmap matches the **on-screen size**.

**Bitmap pooling** reuses bitmap memory for another decode of the same size. It helps allocation pressure but you must respect **lifecycle** and dimensions—wrong reuse causes corruption or crashes.

### Useful links

- [Learn more](https://outcomeschool.com/blog/bitmap-pool)
- [Learn more](https://android.jlelse.eu/loading-large-bitmaps-efficiently-in-android-66826cd4ad53)


> **Read image size first**, then **downsample** to what the UI actually needs.
---
- [Learn more](https://android.jlelse.eu/loading-large-bitmaps-efficiently-in-android-66826cd4ad53)

Interview Answer:
> Large bitmaps blow the heap if you decode them at full resolution.
---
## Battery optimization — engineering checklist
Radios (mobile data, Wi‑Fi) cost battery even after a small request because of **tail time**—the modem stays awake. **Batch** network work, avoid tight polling, and use **WorkManager** for deferrable jobs. Compress payloads when it helps.

For **location**, balance accuracy, interval, and max wait—higher accuracy and frequent updates drain faster. Follow current **background execution** rules.

### Useful links

- [Learn more](https://blog.mindorks.com/battery-optimization-for-android-apps-f4ef6170ff70)
- [Learn more](https://android-developers.googleblog.com/2018/10/modern-background-execution-in-android.html)


> **Batching network work** usually beats many tiny requests for battery.
---
- [Learn more](https://android-developers.googleblog.com/2018/10/modern-background-execution-in-android.html)

Interview Answer:
> Radios (mobile data, Wi‑Fi) cost battery even after a small request because of **tail time**—the modem stays awake.
---
## Memory leaks — create, avoid, detect
A leak keeps objects alive when they should be collected—often by holding a **`Context`** (especially an **Activity**) in a static field, a long-lived **listener**, a **Handler** tied to the Activity, or a thread that outlives the screen.

**Avoid** leaks by scoping work to **lifecycle** (clear listeners, cancel jobs, don’t store Activity in singletons). **WeakReference** is a last resort, not the default fix.

**LeakCanary** and the **Android Studio Profiler** help you find what is still referenced.

### Useful links

- [Learn more](https://www.geeksforgeeks.org/memory-leaks-in-android/)


> **Cancel work and drop references** when screens go away—especially for Activities and Fragments.
---
- [Learn more](https://www.geeksforgeeks.org/memory-leaks-in-android/)

Interview Answer:
> A leak keeps objects alive when they should be collected—often by holding a **`Context`** (especially an **Activity**) in a static field, a long-lived **listener**, a **Handler** tied to the Activity, or a thread that outlives the screen.
---
## Shimmer placeholders
**Shimmer** (or skeleton placeholders) improves **perceived** performance: the user sees structure while content loads. Keep animations **light** so they do not steal GPU or CPU from real work.

### Useful links

- [Learn more](https://blog.mindorks.com/using-shimmer-effect-placeholder-in-android/)


> Skeleton UI should **match the final layout** so content does not jump when it arrives.
---
- [Learn more](https://blog.mindorks.com/using-shimmer-effect-placeholder-in-android/)

Interview Answer:
> *Shimmer** (or skeleton placeholders) improves **perceived** performance: the user sees structure while content loads.
---
## Swipe animation XML example
This **translate** animation slides content in from the left over **700 ms** (legacy `View` animation XML).

### Code example

```xml
<set xmlns:android="http://schemas.android.com/apk/res/android"
  android:shareInterpolator="false">
 <translate android:fromXDelta="-100%" android:toXDelta="0%"
          android:fromYDelta="0%" android:toYDelta="0%"
          android:duration="700"/>
 </set>
```


> For modern motion, prefer **physics or spring-based** animations when you can; XML tweens are fine for simple legacy Views.

Interview Answer:
> This **translate** animation slides content in from the left over **700 ms** (legacy `View` animation XML).
---
## Main-thread blocking and jank — how do you find and fix them?
**Jank** = missed **frame deadline** (~**16.7 ms** @ 60 Hz, ~**8 ms** @ 120 Hz). **Tools:** **CPU** / **System Trace (Perfetto)**, **Frame Timeline**, **Layout Inspector**, **StrictMode** in **debug** (see earlier card). Hunt **disk**, **network**, **JSON/XML parse**, **Room** on **main**, **synchronized** contention.

**Compose:** avoid creating **formatters** / **regex** / **heavy** objects **every recomposition**—cache with **`remember(keys)`** or **precompute** in **ViewModel**.

### Code example

```kotlin
@Composable
fun TxRow(tx: Tx) {
    val label = remember(tx.date) {
        SimpleDateFormat("dd MMM", Locale.US).format(tx.date)
    }
    Text(label)
}
```


> **Measure** the main thread—Compose jank is often **recomposition**, not **drawing**.

Interview Answer:
> *Jank** = missed **frame deadline** (~**16.7 ms** @ 60 Hz, ~**8 ms** @ 120 Hz).
---
## Network and database work — what shows up in profiling?
Split **RTT** vs **parse** vs **DB insert** in **CPU trace**. Fixes: **pagination**, **batch** writes, **indexes** on **filter columns**, **background** parse, **Room** `@Transaction` where appropriate, **avoid** N+1 queries. UI reads **observe** DB **Flow** on **main** but **queries** run on **Room’s** executors—still watch **main-thread** `allowMainThreadQueries` abuse.


> **Scroll stutter** is often **JSON + DB** on the **wrong** dispatcher or **unbounded** queries.

Interview Answer:
> Split **RTT** vs **parse** vs **DB insert** in **CPU trace**.
---
## Which profiling tools do you use day to day vs deep dives?
**Daily:** **Android Studio Profiler** (CPU/memory), **Layout Inspector**, **logcat** / **FrameMetrics**. **Deep:** **Perfetto**, **Startup Profiler**, **Macrobenchmark** (startup/scroll), **LeakCanary** in **debug**, **Play Console vitals** (ANR, **excessive wakeups**) in **production**. **StrictMode** stays **non-release**.


> Staff answers name **traces** and **metrics**, not only “we profile sometimes.”

Interview Answer:
> *Daily:** **Android Studio Profiler** (CPU/memory), **Layout Inspector**, **logcat** / **FrameMetrics**.
---
## Push (FCM) and location/sensors — battery mistakes?
**FCM:** treat **high priority** as **expensive** (wakeups)—use for **user-visible** events; **collapse keys**; avoid **waking** for **pure analytics**. **Location:** lowest **acceptable** **accuracy/interval**, **stop** updates in **onPause** when possible, **fused** provider, **geofence** over **tight polling**. **Sensors:** **unregister** listeners; **batch** when API allows.


> Every **high-priority push** and **GPS fix** is **battery spend**—budget it.

Interview Answer:
> *FCM:** treat **high priority** as **expensive** (wakeups)—use for **user-visible** events; **collapse keys**; avoid **waking** for **pure analytics**.
---
## Describe a performance troubleshooting story on Android.
Use **STAR**: **Situation** (slow app, big APK, bad reviews). **Task** (find hotspots without guessing). **Action** (Android Studio CPU/memory/network profilers, main-thread audit, caching, async boundaries, R8/shrinkResources, image pipeline). **Result** (startup ms, jank frames, APK size, crash-free rate—**real numbers**).


> Interviewers want **how you thought** and **what improved**, with **numbers**.

Interview Answer:
> Use **STAR**: **Situation** (slow app, big APK, bad reviews).
---
## How do you approach mentoring engineers?
-   Understand their current approach first.
-   Explain trade-offs rather than only giving the answer.
-   Pair when needed.
-   Give actionable code-review feedback.
-   Document repeated patterns.
-   Encourage ownership.

The goal is to improve both the immediate code and the engineer's future
decision-making.

Interview Answer:
> Understand their current approach first.
---
## How do you lead a moderately complex Android initiative?
```text
Requirements
 ↓
Technical risks
 ↓
Architecture
 ↓
Break into tasks
 ↓
Implementation
 ↓
Testing
 ↓
Code review
 ↓
Release
 ↓
Monitoring
```

A senior engineer should think beyond implementation and consider
reliability, security, testing, delivery, and operational support.

Interview Answer:
> A senior engineer should think beyond implementation and consider reliability, security, testing, delivery, and operational support.
---
## Git collaboration & branching
Compare **trunk-based** vs **GitFlow** honestly; mention **PR** quality gates, **CODEOWNERS**, **protected** branches.


> Branching should match **release cadence** and **team size**.

Interview Answer:
> Compare **trunk-based** vs **GitFlow** honestly; mention **PR** quality gates, **CODEOWNERS**, **protected** branches.
---
## Code reviews example
Share a review where you caught a **security** or **correctness** issue **constructively** and followed up after merge.


> Reviews shape **team culture**, not only code.

Interview Answer:
> Share a review where you caught a **security** or **correctness** issue **constructively** and followed up after merge.
---
## SDLC as a Tech Lead — where do you actually spend ownership time?
Treat SDLC as **risk reduction**, not a poster: **discovery** (NFRs: security, perf, scale—push back on vague scope); **design** (contracts, diagrams, trade-offs); **build** (standards, branching, **quality gates**); **test** (meaningful coverage, not vanity %); **release** (flags, rollout %, rollback); **run** (debt and incidents on the **backlog**). When requirements **shift**, re-scope **explicitly**—time, risk, phased delivery—no silent creep.


> Leads **surface uncertainty early**; they do not pretend the plan is frozen.

Interview Answer:
> Treat SDLC as **risk reduction**, not a poster: **discovery** (NFRs: security, perf, scale—push back on vague scope); **design** (contracts, diagrams, trade-offs); **build** (standards, branching, **quality gates**); **test** (meaningful coverage, not vanity %); **release**…
---
## Agile in practice — how do you keep ceremonies from becoming theater?
Optimize for **outcomes**: planning uses **capacity + risk**, stories carry **acceptance criteria** and **tech notes**, blockers surface **without blame**. Standups coordinate **unblocking**, not status to the lead. **Metrics that matter:** defect **escape**, **cycle time**, **predictability**, **burnout** signals—**velocity** alone is noise without **quality**.


> Good Agile is **feedback and delivery**, not **ticket velocity** worship.

Interview Answer:
> Optimize for **outcomes**: planning uses **capacity + risk**, stories carry **acceptance criteria** and **tech notes**, blockers surface **without blame**.
---
## Technical debt — how do you prioritize without stopping the roadmap?
Make debt **visible** and **classified**: **blocking** (fix now), **risky** (scheduled), **cosmetic** (only when touching the file). Tie asks to **business** language: slower delivery, **crash** / **security** exposure, **onboarding** cost. **Product** funds debt when it is **cost/risk**, not “I dislike this package.”


> **Debt is a portfolio**—trade-offs documented beat heroic weekend rewrites.

Interview Answer:
> Make debt **visible** and **classified**: **blocking** (fix now), **risky** (scheduled), **cosmetic** (only when touching the file).
---
## Mentoring — how does it differ for junior / mid / senior?
**Junior:** small tasks, **pairing**, frequent feedback, fundamentals. **Mid:** **feature ownership**, design discussions, **trade-off** coaching. **Senior:** **system** scope, cross-team **initiatives**, decision **accountability**. Success = team needs you **less** for the same class of problem. **Underperformance:** diagnose (**skill vs clarity vs motivation**), written expectations, support window, **escalate** early if flat—compassionate and **fair**.


> Mentorship is **scaling people**, not **being the hero**.

Interview Answer:
> *Junior:** small tasks, **pairing**, frequent feedback, fundamentals.
---
## Code reviews — when a senior disagrees with your comment?
Welcome **debate** on **merits**; if their **risk** argument wins, **merge** and move on. If residual risk stays, **document** the decision (ADR / comment). **Authority ≠ correctness**—but **shipping** with known risk must be **explicit**.


> Reviews are **risk conversation**, not **ego**.

Interview Answer:
> Welcome **debate** on **merits**; if their **risk** argument wins, **merge** and move on.
---
# SDK Integrations
---
## How can I get continuous location updates in android like in Google Maps?
- Use the Fused Location Provider.
- Choose interval and priority based on the feature’s accuracy need.
- Request background location only when clearly required.
- Stop updates when the lifecycle or feature no longer needs them.


### Useful links

- [Learn more](https://stackoverflow.com/a/41500910/3424919)
---
- [Learn more](https://stackoverflow.com/a/41500910/3424919)

Interview Answer:
> Use Fused Location Provider with an appropriate priority and lifecycle-aware start/stop behavior.
---
## Continuous location like Maps — constraints?
Use the **Fused Location Provider**, **batch** updates when you can, and use a **foreground service** when the platform requires it for continuous tracking. Be **transparent** in the UI about **why** you need location and respect **Play policy**.

### Useful links

- [Learn more](https://stackoverflow.com/a/41500910/3424919)


> Location is **trust + policy + UX**, not only an API call.
---
- [Learn more](https://stackoverflow.com/a/41500910/3424919)

Interview Answer:
> Use the **Fused Location Provider**, **batch** updates when you can, and use a **foreground service** when the platform requires it for continuous tracking.
---
## Integrating Firebase end-to-end — what do staff engineers watch?
- **Realtime Database vs Firestore:** different **consistency**, **offline**, and **security rules** ergonomics—pick for your **query patterns** and scale.
- **FCM:** **token** rotation, avoid **topic** abuse, know **background delivery** changes by Android version.
- **Analytics / Crashlytics:** **PII** boundaries, **sampling**, upload **mapping/dSYM** so stack traces deobfuscate.
- **Remote Config:** ship **safe defaults** and **kill switches** so bad values do not brick users.

**Example:** Regulated apps combine **auth**, **messaging**, and **analytics** with **compliance** reviews—not “drop in SDK and forget.”


> Firebase is **fast to adopt** and **easy to mis-govern** without rules, reviews, and ownership.

Interview Answer:
> **Realtime Database vs Firestore:** different **consistency**, **offline**, and **security rules** ergonomics—pick for your **query patterns** and scale.
---
## Google Maps & geo features at scale
Plan for **marker clustering**, **geofencing**, **background location** policy, **billing**, and **API key restriction** (by app signing + package). Snapshot or **visual** tests help **map overlays** not drift.


> **Lock down API keys** and **respect Play policy**—non-negotiable for maps at scale.

Interview Answer:
> Plan for **marker clustering**, **geofencing**, **background location** policy, **billing**, and **API key restriction** (by app signing + package).
---
## CMS-driven mobile UI — architecture?
Treat server payloads as **untrusted**: **version** your schema, ship **fallback** bundles, **sign** or **validate** payloads, support **incremental sync**, and guard **A/B** experiments. **Cache** templates for **offline**.


> CMS JSON is **input**—validate, version, and fail safe.

Interview Answer:
> Treat server payloads as **untrusted**: **version** your schema, ship **fallback** bundles, **sign** or **validate** payloads, support **incremental sync**, and guard **A/B** experiments.
---
## Headless CMS (AEM, Contentful, Sanity, etc.) on Android — content-driven architecture?
**Headless** = content **authoring** separate from **presentation**; mobile consumes **JSON/GraphQL**. Flow: **fetch** payload → **map** to **domain** models (never bind **raw** JSON in UI) → **render** by **component type** using a **registry** (`"carousel"` → `CarouselRenderer`). **Business rules** stay in the **app**; CMS supplies **copy**, **ordering**, **visibility**—not **payment** logic.

**Failure handling:** **timeouts**, **partial JSON**, **unknown types** → **skip** component + **log** / **analytics**, **do not** crash. **Boot** from **disk** cache; **refresh** in background; **stale-but-usable** for marketing screens; **hardcoded** fallback for **critical** legal/onboarding if required.

**Versioning:** include **`contentVersion`/`schemaVersion`** in payloads; app supports **N** and **N−1**; **breaking** changes ship with **min app version** or **feature flag**.

**Security:** **HTTPS** + **pinning** when threat model requires; **sanitize** rich text (**no** raw `WebView` HTML from CMS without **server** cleaning); **allowlist** **CTA** actions to **app-defined** routes—**never** let CMS invent **arbitrary deep links** into **auth/payment** flows. Mitigate **cache poisoning** with **short TTL**, **signed** payloads, or **version hash** validation.

**Performance:** **prefetch** home/marketing, **compress**, **lazy** heavy blocks, **CDN** + **OkHttp** cache where safe; in **Compose**, stable **keys** and **avoid** recomposing whole trees on every CMS tick.


> CMS controls **content**, not **money or auth**; **registry + versioning + safe fallbacks** keep ships boring.

Interview Answer:
> *Headless** = content **authoring** separate from **presentation**; mobile consumes **JSON/GraphQL**.
---
## Play Billing / IAP (add-on)
**Acknowledge** purchases, make the **backend idempotent**, run **fraud checks**, and use **server notifications**—never trust the client as the only source of truth for money.


> **Server validation** owns the business truth for purchases.

Interview Answer:
> *Acknowledge** purchases, make the **backend idempotent**, run **fraud checks**, and use **server notifications**—never trust the client as the only source of truth for money.
---
## Firebase integration experience (Realtime DB, FCM, Analytics)
Be ready to talk about **data modeling**, **indexes**, **security rules**, **notification** segments, **analytics** event design, **Crashlytics** triage, and **Remote Config** experiments—and how each choice affects **privacy** and **cost**.


> Tie Firebase decisions to **privacy, cost, and reliability**, not “we use Firebase.”

Interview Answer:
> Be ready to talk about **data modeling**, **indexes**, **security rules**, **notification** segments, **analytics** event design, **Crashlytics** triage, and **Remote Config** experiments—and how each choice affects **privacy** and **cost**.
---
## Google Maps / geo experience
Balance **accuracy vs battery**, handle **geofence** imperfection, clear **privacy** prompts, and **enterprise** billing/API limits.


> Location is **policy + UX + engineering** together.

Interview Answer:
> Balance **accuracy vs battery**, handle **geofence** imperfection, clear **privacy** prompts, and **enterprise** billing/API limits.
---
## Challenging project (maps + realtime)
Highlight **concurrency**, **consistency**, **offline**, and **performance** trade-offs you navigated.


> Depth on **one** hard problem beats ten shallow ones.

Interview Answer:
> Highlight **concurrency**, **consistency**, **offline**, and **performance** trade-offs you navigated.
---
# Scenario-Based Questions
---
## How would you handle network and database consistency?
A common approach is:

```text
API
 ↓
Repository
 ↓
Database
 ↓
UI
```

The database becomes the observable source of truth.

On successful API response, update the database in a transaction when
multiple related records must remain consistent.

Interview Answer:
> A common approach is: The database becomes the observable source of truth.
---
## How would you handle a server response that is successful but local database update fails?
-   Do not pretend the operation completed locally.
-   Capture the failure.
-   Retry or recover according to the feature's consistency
    requirements.
-   Keep the UI state accurate.
-   Log safe diagnostic information.
-   Consider transactional persistence for related writes.

The repository should define the consistency behavior rather than
leaving it to the UI.
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

-   UI observes immutable StateFlow.
-   Repository coordinates local and remote data.
-   Room can act as the local source of truth.
-   API refreshes local data.
-   Sensitive data is minimized and protected.
-   Errors are represented explicitly.
-   Tests cover business logic, integration, and critical UI flows.
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

Look for crash clustering rather than treating every stack trace
independently.
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

-   Authentication
-   Authorization
-   Input validation
-   Secure networking
-   Idempotency
-   Transaction state
-   Timeout handling
-   Error recovery
-   Auditability
-   Monitoring

Interview Answer:
> For payment requests, never blindly retry after an ambiguous timeout.
---
## How would you handle a token refresh?
Typical flow:

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

But concurrency matters.

If five requests receive `401` simultaneously, avoid launching five
refresh requests.

Use a coordinated refresh mechanism so only one refresh occurs and other
requests wait for the result.
---
## How would you design a large Android application for multiple teams?
Use modularization with clear ownership.

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

Define dependency rules so feature modules do not depend directly on
unrelated features.

Interview Answer:
> Use modularization with clear ownership.
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

For more complex screens, model partial states rather than forcing
everything into only Loading/Success/Error.
---
## Is there any scenario where onDestoy() will be called without calling onPause() and onStop()?
If we call finish() method inside onCreate() of our Activity, then onDestroy() will be called directly.

---
## Scenario: Crash Spike Due to Lifecycle Issues (Fragment + Coroutines) 
You are working on a modular app with multiple teams contributing. 
After a recent release: 
- Crash rate increased significantly 
- Common crash: 
IllegalStateException: Fragment not attached to a context 
Observations: 
- Occurs during navigation or screen rotation 
- App uses: 
○ Fragments 
○ Coroutines 
○ ViewBinding 
Recent changes: 
- Async API calls added inside fragments 
- Navigation refactoring 
How would you debug and fix this? 

> I would approach this as a lifecycle misalignment problem between UI components and async operations. 

#### Understand Crash Context
- When does crash occur? → navigation, rotation 
- Which thread? → usually main thread 
- What operation triggers it? → UI update after async call 
#### Root Cause Identification 
Typical issue: 
- Coroutine launched in Fragment scope 
- Fragment destroyed 
- Coroutine still running 
- On completion → tries to access UI or context 
#### Fix Strategy — Lifecycle Awareness 
a. Use viewLifecycleOwner Scope 
```kotlin
lifecycleScope.launch { ... } 
Use: 
viewLifecycleOwner.lifecycleScope.launch { ... } 
This ensures coroutine is cancelled when view is destroyed. 
```
b. Use repeatOnLifecycle 
```kotlin
For flows: 
viewLifecycleOwner.lifecycleScope.launch { 
repeatOnLifecycle(Lifecycle.State.STARTED) { 
flow.collect { ... } 
} 
}
```
#### Avoid Direct Context Usage Before accessing context: 
- Check if fragment is attached 
- Or use requireContext() only when safe 
- Cancel Jobs Properly 
- Store coroutine jobs
- Cancel them in onDestroyView() if needed 
#### Navigation Safety 
- Avoid triggering navigation after Fragment is destroyed 
- Use safe navigation patterns 
#### Architectural Fix 
- Move business logic to ViewModel 
- Fragment should only observe state 
#### Validation 
- Rapid navigation 
- Screen rotation 
- Background/foreground 
- Ensure no crashes 

Interview Answer: 
> This issue arises from mixing asynchronous work with lifecycle-unaware components, and the fix requires strict lifecycle-scoped execution. 
---
## Scenario: Deep Link Handling Breaking Navigation
E-commerce app. Users report: deep links open the wrong screen, app crashes when opened via link, back navigation behaves incorrectly. App uses Navigation Component, multiple entry points (home, product, offer pages), some deep links have query params. How would you fix?

> Treat this as a **navigation state reconstruction problem**. Deep links bypass normal user flow — the app must reconstruct a correct, coherent back stack from a cold or warm start.

#### Understand the Three Deep Link Entry Scenarios

Cold start (app not running)
```text
App process created
 ↓
deep link intent delivered
 ↓
must construct full back stack
```
Warm start (app in background)
```text
Existing task restored
 ↓
deep link intent delivered
 ↓
must navigate to correct
```
App already in foreground
```text
Current task active
 ↓
`onNewIntent()` called
 ↓
must navigate without duplicating back stack
```

#### Validate Deep Link Declaration in Manifest
-   `autoVerify="true"` enables **App Links** (no disambiguation dialog on Android 6+)
-   Without verified App Links, Android may show a chooser or open in browser
```xml
<activity android:name=".MainActivity">
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW"/>
        <category android:name="android.intent.category.DEFAULT"/>
        <category android:name="android.intent.category.BROWSABLE"/>
        <data android:scheme="https" android:host="www.yourapp.com"/>
    </intent-filter>
</activity>
```

#### Declare Deep Links in Navigation Graph
-   Navigation Component automatically constructs the back stack from `<deepLink>` declarations
-   Argument types are validated at build time (Safe Args)
```xml
<!-- nav_graph.xml -->
<fragment android:id="@+id/productDetailFragment" ...>
    <deepLink
        android:id="@+id/deepLink"
        app:uri="https://www.yourapp.com/product/{productId}"
        app:action="android.intent.action.VIEW"/>
    <argument android:name="productId" app:argType="string"/>
</fragment>
```

#### Validate Parameters Before Navigation
-   Deep link URLs from notifications, SMS, or QR codes can be malformed or tampered
-   Always validate: non-null, correct format, within expected range
```kotlin
// In NavController / ViewModel: never trust raw deep link params
val productId = args.productId
if (productId.isBlank() || productId.length > 50) {
    // navigate to error screen or fallback to home
    findNavController().navigate(R.id.homeFragment)
    return
}
```

#### Fix Back Stack for Cold Start
- `NavDeepLinkBuilder` adds Home → Category → Product to the back stack automatically
- User pressing Back from a cold-start deep link navigates correctly, not to empty task
```kotlin
// NavDeepLinkBuilder: manually construct back stack for cold-start deep links
val pendingIntent = NavDeepLinkBuilder(context)
    .setGraph(R.navigation.nav_graph)
    .setDestination(R.id.productDetailFragment)
    .setArguments(bundleOf("productId" to productId))
    .createPendingIntent()
```

#### Handle `onNewIntent` for Foreground Case
```kotlin
// MainActivity
override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    navController.handleDeepLink(intent)  // Navigation Component handles routing
}
```

#### Avoid Duplicate Fragments on Back Stack
```kotlin
// When navigating to deep link destination that may already be in stack
navController.navigate(deepLinkUri, NavOptions.Builder()
    .setPopUpTo(R.id.homeFragment, false)  // clear stack back to home first
    .build()
)
```

One-time events pattern:
```kotlin
// ViewModel
private val _events = Channel<UiEvent>(Channel.BUFFERED)
val events = _events.receiveAsFlow()

// Collect in Fragment (lifecycle-safe)
viewLifecycleOwner.lifecycleScope.launch {
    repeatOnLifecycle(Lifecycle.State.STARTED) {
        vm.events.collect { event -> handleEvent(event) }
    }
}
```

#### Prevent Crashes
- Validate data before navigation 
- Handle missing parameters gracefully 

#### Testing Strategy 
- App closed 
- App in background 
- App in foreground 

Interview Answer:
> Deep linking is not just routing — it’s about reconstructing app state correctly, and requires careful navigation and validation logic.
---
## Scenario: API Layer Instability — Retries, Failures, Token Expiry
You are on a fintech app with millions of daily transactions. Users report: random API failures, some requests succeed on retry, occasional logouts. Monitoring shows: HTTP 401 and 500 spikes, duplicate API calls, token refresh logic recently changed. Constraints: no duplicate financial transactions, backend has rate limits, network is unstable (Tier-2/3 cities). How would you design and fix this?

> Treat this as a **network reliability + distributed consistency** problem — not a simple "add retry" fix, especially with financial data.

#### Categorize Failures First
-   **Client-side:** timeouts, retry storms, duplication bugs
-   **Auth:** 401 → token expiry, refresh race condition
-   **Server-side:** 500 errors, rate limit responses (429)
-   Separating these prevents one fix masking another problem

#### Fix Token Refresh — Single-Flight Pattern
-   Multiple requests fail with 401 simultaneously → each independently triggers token refresh → **race condition** → multiple refresh calls → all fail or produce duplicate tokens
-   **Fix:** One active refresh request at a time; others suspend and wait for the result

```kotlin
class TokenAuthenticator(private val tokenRepo: TokenRepository) : Authenticator {
    private val refreshMutex = Mutex()

    override fun authenticate(route: Route?, response: Response): Request? {
        return runBlocking {
            refreshMutex.withLock {
                // Check if another coroutine already refreshed
                val currentToken = tokenRepo.getToken()
                if (currentToken != response.request.header("Authorization")) {
                    return@withLock response.request.newBuilder()
                        .header("Authorization", "Bearer $currentToken").build()
                }
                val newToken = tokenRepo.refreshToken() ?: return@withLock null
                response.request.newBuilder()
                    .header("Authorization", "Bearer $newToken").build()
            }
        }
    }
}
```

#### Prevent Duplicate Financial Transactions — Idempotency Keys
-   Generate a **UUID per transaction request** on the client side before the call
-   Include it as a header: `X-Idempotency-Key: <uuid>`
-   Server deduplicates: if same key received again → return cached result, do not re-process
-   Even on network retry, the transaction processes exactly once

#### Retry Strategy — Not All APIs Are Equal
-   **GET requests and safe POSTs:** retry with exponential backoff
-   **Financial mutation APIs:** only retry with idempotency key; never blind retry
-   Retry config: `maxRetries = 3`, backoff = 2^attempt seconds, jitter to spread load
-   Stop retry if: 4xx (except 401/408/429) → likely client error, not transient

#### OkHttp Network Layer Hardening
```kotlin
OkHttpClient.Builder()
    .connectTimeout(10, TimeUnit.SECONDS)
    .readTimeout(30, TimeUnit.SECONDS)
    .writeTimeout(15, TimeUnit.SECONDS)
    .addInterceptor(LoggingInterceptor())     // redacted in production
    .addInterceptor(RetryInterceptor(max = 3))
    .authenticator(TokenAuthenticator(tokenRepo))
    .build()
```

#### Rate Limit Awareness
-   On 429 response: read `Retry-After` header, back off that long before retrying
-   Queue pending requests in memory during rate-limit window
-   Exponential backoff prevents retry storms that amplify rate limit problems

#### Offline Request Queue _(for poor connectivity markets)_
-   Queue mutation requests locally in Room with status `PENDING`
-   WorkManager job retries with network constraint — sends when connected
-   Mark transaction as `SYNCING` in UI while queued

#### Observability
-   Structured logging per request: `requestId`, `attemptNumber`, `statusCode`, `durationMs`
-   Track metrics: retry rate · 401 frequency · duplicate request detection · token refresh cadence
-   Alert if retry rate exceeds 5% of requests — early warning of upstream issues

#### Validation
-   Simulate: 401 mid-session · network drop · concurrent requests all expiring at once
-   Verify: no duplicate charges in transaction log · correct token refresh exactly once
-   Load test: 1000 concurrent requests all expiring → single refresh, clean recovery

Interview Answer:
> Fintech API reliability = **idempotency + single-flight auth + controlled retry**. Every financial mutation must be safe to retry without side effects.
---
## Scenario: Slow Build Time in Multi-Module Project
Large Android codebase: 50+ modules, multiple teams, CI build ~25 minutes, local build ~10–12 minutes. Small changes trigger full rebuilds. Developers are losing productivity. **How would you optimize?**

Treat this as a **build system scalability problem**, not just "add more RAM to the CI box."

#### Measure Build Bottlenecks First _(data beats guessing)_
- Run `./gradlew build --scan` → get a **Gradle Build Scan** URL
- Identify: slowest tasks · which tasks are not incremental · cache miss rate
- Check if CI and local share any remote cache (often they don't)

#### Identify Root Causes
- Poor module boundaries → one change invalidates many modules
- Too many inter-module `implementation` dependencies → wide invalidation graph
- `KAPT` annotation processing → slow, non-incremental by nature
- Non-incremental tasks that run every time (e.g. custom Gradle tasks doing file I/O)

#### Modularization Strategy
- Feature-based module structure: `:feature:login`, `:feature:dashboard`, `:core:network`
- Reduce coupling: features should depend on `:core` interfaces, not each other
- Eliminate circular dependencies (use `./gradlew :module:dependencies` to audit)

#### Incremental Build Optimization
- Ensure `kapt.incremental.apt=true` in `gradle.properties`
- Avoid modifying shared/core modules frequently — changes ripple everywhere
- Enable `org.gradle.caching=true` in `gradle.properties`

#### Replace KAPT with KSP
- KAPT compiles Java stubs → slow and non-incremental
- KSP (Kotlin Symbol Processing) is 2× faster for supported libraries (Room, Hilt, Moshi)
- Migrate one library at a time; most major libs support KSP now

#### Enable Build Cache
- Local + Remote cache 
- Avoid recompilation of unchanged code 

#### Parallel Execution 
- Enable parallel builds 
- Optimize Gradle workers 

#### Dependency Optimization 
- Remove unused dependencies 
- Avoid large libraries 

#### CI Optimization 
- Use remote build cache 
- Run only affected modules 

Conclusion:
> Build time issues are usually due to poor modular boundaries and lack of incremental build optimization, and solving them requires both architectural and tooling improvements. 
---
## How do you investigate an ANR?
First determine what the main thread was doing.

Look at:

-   ANR traces
-   Android Vitals
-   Play Console
-   StrictMode
-   Perfetto
-   CPU profiler

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

Move appropriate work away from the main thread and fix the underlying
bottleneck.

Interview Answer:
> First determine what the main thread was doing.
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

Measure before and after the change.

Interview Answer:
> Measure before and after the change.
---
## How do you investigate UI jank?
Look for:

-   Long work on the main thread
-   Expensive composition
-   Excessive recomposition
-   Large list rendering
-   Image decoding
-   Layout complexity

Use:

```text
Compose/Layout Inspector
CPU profiler
Perfetto
Macrobenchmark
Frame timing
```

Interview Answer:
> Look for: Long work on the main thread Expensive composition Excessive recomposition Large list rendering Image decoding Layout complexity Use:
---
## OOM mitigation
**OutOfMemoryError** often comes from **bitmaps** and **unbounded caches**—not from “the heap number is too small.” Downsample images, cap cache size, and **evict** on memory pressure.

Profile with **heap dumps** when OOMs happen in production-like conditions. Native-heavy apps also need to watch **native** memory.

### Useful links

- [Learn more](https://blog.mindorks.com/practical-guide-to-solve-out-of-memory-error-in-android-application)


> OOM is usually **images and cache policy**, not “just increase the heap.”
---
- [Learn more](https://blog.mindorks.com/practical-guide-to-solve-out-of-memory-error-in-android-application)

Interview Answer:
> *OutOfMemoryError** often comes from **bitmaps** and **unbounded caches**—not from “the heap number is too small.” Downsample images, cap cache size, and **evict** on memory pressure.
---
## STAR — performance or ANR incident?
Use **real** **Situation/Task/Action/Result** with **tools** (**trace**, **heap dump**, **fix**, **verification**). Replace **fabricated** percentages with **what you measured** or **qualitative** outcome unless you own the **number**.


> Tie stories to **artifacts** (trace file, **PR**, **dashboard**).

Interview Answer:
> Use **real** **Situation/Task/Action/Result** with **tools** (**trace**, **heap dump**, **fix**, **verification**).
---
## Battery anti-patterns you see in production?
**Tight polling**, **infinite retry** without **backoff**, **multiple SDKs** duplicating **sync**, **wake locks** left on, **implicit** **broadcast** **receivers**, **FGS** **abuse**, **WorkManager** **15-minute** spam. **Audit SDKs** with **Play vitals** / **Battery Historian**; **batch** **network**; **respect** **Doze**.


> Much drain is **integration**, not your **for-loop**—**inventory SDKs** like **prod code**.

Interview Answer:
> *Tight polling**, **infinite retry** without **backoff**, **multiple SDKs** duplicating **sync**, **wake locks** left on, **implicit** **broadcast** **receivers**, **FGS** **abuse**, **WorkManager** **15-minute** spam.
---
## Scenario: Memory Leak Causing Gradual App Slowdown
You are working on a large-scale social media app (~20M MAU). Users report: app becomes slow after 15–20 minutes, scrolling lags, eventually OOM-killed. Monitoring shows: memory grows continuously, GC frequency very high, issue prominent on feed screen. Recent changes: new feed redesign (RecyclerView), image loading optimizations, singleton analytics manager added. **How would you investigate and fix end-to-end?**

Treat this as a **progressive memory leak** (lifecycle mismanagement), not an immediate crash — degradation correlates with user interaction over time.

#### Confirm Leak vs Expected Growth
- Memory grows linearly without release → leak
- Memory grows then stabilizes → expected caching behavior (not a bug)
- Tools: **Android Studio Memory Profiler**, heap dumps at intervals **LeakCanary** (auto-detection)
- If objects are retained after screen destruction → confirms leak

#### Identify Leak Source via Heap Analysis
- Capture heap dump → analyze **dominator tree** (which objects retain memory) and **reference chain** (why GC can't collect them)
- Typical suspects here: RecyclerView Adapter holding Activity/Fragment reference · ViewHolder retaining heavy objects · Singleton analytics manager holding `Context` · Image loader caching incorrectly

#### Investigate RecyclerView Layer
- Is adapter holding a strong reference to `Context`?
- Are listeners cleared in `onViewRecycled()`?
- Does ViewHolder store any long-lived references?
- Are new objects being created inside `onBindViewHolder()` on every scroll pass?

#### Analyze Singleton / Shared Components
- Is it storing Activity context instead of Application context?
- Is it holding references to views, callbacks, or lifecycle owners?
- **Fix:** Replace Activity context with `applicationContext`; never store UI references in a singleton

#### Image Loading & Caching Layer
- Are images cleared properly on view recycle?
- Is image loading lifecycle-aware (e.g. Glide tied to Fragment lifecycle)?
- Validate cache size and eviction policy — unbounded cache = leak

#### GC Pressure Optimization
- Reduce object creation inside the scroll path
- Reuse objects where possible (object pools for frequent allocations)
- Avoid unnecessary boxing/unboxing

#### Fix Strategy Summary
- Remove strong references causing leaks
- Enforce proper lifecycle cleanup (`onViewRecycled`, `onDestroyView`)
- Optimize adapter and ViewHolder — no Context refs, no listeners left attached
- Fix singleton misuse — Application context, no UI refs
- Tune image caching — bounded, lifecycle-aware

#### Validation
- Compare heap dumps before and after fix
- Memory stabilizes over extended session
- GC frequency drops measurably
- Run long-session soak test (30–60 min on real device)

#### Long-Term Prevention
- LeakCanary integrated in all debug builds (CI gates on new leaks)
- Code review checklist: "Does this hold a Context longer than its scope?"
- Architectural boundary rule: no UI references in data layer components

> Memory leaks are **systemic lifecycle mismanagement** — fix at the architectural level, not one-off patches. LeakCanary in CI is your canary in the coal mine.

Interview Answer:
> You are working on a large-scale social media app (~20M MAU).
---
## Scenario: Battery Drain Due to Background Work
You are working on a fitness tracking app. Users report significant battery drain; the app appears at the top of battery usage. The app uses location tracking, background sync, and periodic API polling. **How would you diagnose and fix?**

> Treat this as a **resource efficiency + background execution policy** problem, not a single bug.

#### Measure Before Changing Anything
- **Battery Historian** — visualize wake locks, alarms, wakeups over time
- **Android Profiler (CPU / Network)** — identify which code is running and when
- Identify: CPU wake-up frequency · network calls per hour · wake lock duration

#### Identify Problematic Components**
- Frequent location updates (high accuracy at short intervals drains most)
- Continuous foreground service running even when not needed
- Aggressive periodic polling (pulling data every minute when push notifications could serve)

#### Fix Strategy

### Replace Services with WorkManager for deferrable tasks
- WorkManager respects Doze, App Standby, and battery constraints
- Use `Constraints.Builder()` — run only on Wi-Fi, when charging, etc.
- Only use Foreground Service when **active user-facing** work is happening (e.g. live workout tracking)

### Optimize Location Updates
- Switch from `PRIORITY_HIGH_ACCURACY` → `PRIORITY_BALANCED_POWER_ACCURACY` when precision not critical
- Reduce update interval; use geofencing for region-based triggers instead of continuous polling
- Use `FusedLocationProviderClient` (not raw GPS)

### Eliminate Polling — Use Push
- Replace periodic API polling with FCM push notifications
- Batch network calls — consolidate multiple small requests into one scheduled job
- Use `WorkManager` periodic work (min 15 min interval) instead of `AlarmManager` for non-critical sync

### Respect Doze Mode
- Do not use `WAKE_LOCK` unless absolutely necessary
- Use `setAndAllowWhileIdle()` only for critical alarms
- Never keep CPU awake for background work that can be deferred

### Validation
- Measure battery stats before/after using Battery Historian
- Run 8-hour real-device soak test; compare mAh consumed
- Confirm app dropped from top battery consumers list

Interview Answer:
> Battery drain = **misusing background execution**. Align with Android's power management system — WorkManager, bounded location, and push over poll.
---
## Scenario: Large List Data Loading Causing OOM
Marketplace app. Users report crashes when scrolling large product lists. Observations: entire dataset loaded at once, images are high-resolution, no pagination. **How would you fix?**

> Treat this as a **memory management + data loading strategy** problem — you must never load unbounded data into memory.

#### Identify Root Causes
- Entire dataset in memory → linear memory growth → OOM
- High-res images decoded at original size → single image can be 10–20 MB in RAM
- No lazy loading → RecyclerView has nothing to throw away

#### Introduce Pagination with Paging 3
- Load data in pages (e.g. 20 items at a time)
- Paging 3 handles: loading states · retry · Room integration · LazyColumn/RecyclerView adapter
```kotlin
// PagingSource example
class ProductPagingSource(private val api: ProductApi) : PagingSource<Int, Product>() {
    override suspend fun load(params: LoadParams<Int>): LoadResult<Int, Product> {
        val page = params.key ?: 1
        return try {
            val response = api.getProducts(page, params.loadSize)
            LoadResult.Page(response.items, prevKey = if (page == 1) null else page - 1, nextKey = page + 1)
        } catch (e: Exception) { LoadResult.Error(e) }
    }
}
```

#### Optimize Images
- Never decode at original resolution for a thumbnail — use `inSampleSize` or image loaders
- Use Coil/Glide with explicit `size()` constraint matching the view dimensions
- Use WebP or AVIF format — same quality, 30–50% smaller than JPEG/PNG
- Implement placeholder + loading states so UI stays responsive

#### RecyclerView Optimization
- `setHasStableIds(true)` if IDs are stable — improves DiffUtil efficiency
- Use `DiffUtil.ItemCallback` for surgical updates (no `notifyDataSetChanged()`)
- Avoid creating new objects in `onBindViewHolder` — allocate in `onCreateViewHolder`

#### Memory Cache Strategy
- Use disk cache + bounded in-memory cache (Glide/Coil do this by default)
- Set explicit max memory cache size relative to available heap
- Clear cache on `onTrimMemory(TRIM_MEMORY_RUNNING_CRITICAL)`

#### Validation
- Profile with Android Studio Memory Profiler during scroll
- Confirm heap stays bounded (does not grow with list size)
- Test with 10,000-item dataset on a low-end device (2 GB RAM)

Interview Answer:
> OOM in lists = **unbounded data + unbounded images**. Paging 3 for data, downsized image loading, and bounded caches for memory — control flow at every layer.
---