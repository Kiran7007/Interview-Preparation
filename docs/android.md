---
# Android Architecture

## What is Android Architecture?

- It defines a way to structure code into layers.
- It helps separate UI, data, and business logic.
- It makes the code easier to maintain, test, and scale.

```kotlin
class UserViewModel(
    private val repository: UserRepository
) : ViewModel()
```

---

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

## How does Dagger Hilt facilitate the application of the Dependency Inversion Principle in Android?

- Dagger Hilt automatically injects dependencies instead of manually creating them.
- It allows classes such as ViewModels to depend on interfaces instead of concrete classes.
- Define a `UserRepository` interface, bind `UserRepositoryImpl` using `@Binds` in a module, and let Hilt provide the implementation wherever it is needed.

```kotlin
@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @Binds
    abstract fun bindUserRepository(
        implementation: UserRepositoryImpl
    ): UserRepository
}
```

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

## How to update only specific fields in Room?

You can write a custom `@Query` to update only one or two fields. Avoid using `@Update` if a partial update is needed.

```kotlin
@Query("UPDATE user SET name = :name WHERE id = :id")
suspend fun updateName(id: Int, name: String)
```

---

## Explain SOLID Principles in Android with examples

- SOLID is a set of five design principles that help in writing clean, scalable, and easy-to-maintain code.
- Each letter in SOLID stands for one principle:
  1. S - Single Responsibility
  2. O - Open/Closed
  3. L - Liskov Substitution
  4. I - Interface Segregation
  5. D - Dependency Inversion

Let’s understand them one by one.

### S - Single Responsibility Principle (SRP)

- A class should have only one reason to change, meaning it should do only one job.
- Example in Android:
  - Do not mix UI logic and data logic inside an Activity.
  - Use Activity for UI and ViewModel for business logic.
  - Use Repository for data handling such as API or database work.
- This makes code cleaner and easier to test or modify.

### O - Open/Closed Principle (OCP)

- A class should be open for extension but closed for modification.
- You should add new features without changing existing code.
- Example in Android:
  - Suppose you have a PaymentProcessor class.
  - Instead of editing it for every new payment method such as UPI, Card, or Wallet, create new classes such as CardPayment and UPIPayment that implement a PaymentInterface.
- This keeps the original class safe from future changes.

### L - Liskov Substitution Principle (LSP)

- Subclasses should be usable in place of their parent class without breaking the app.
- Example:
  - If you have a Bird class with a `fly()` method, any subclass such as Sparrow or Eagle should also support flying.
  - If a Penguin cannot fly, it should not extend that Bird class.
- In Android, this means subclasses should behave consistently with their base classes.

### I - Interface Segregation Principle (ISP)

- Do not create large, all-in-one interfaces.
- Instead, create smaller, specific interfaces that serve one purpose.
- Example in Android:
  - Split one large UserActions interface with login, logout, and uploadPhoto methods into smaller interfaces such as AuthActions, ProfileActions, and MediaActions.
- This keeps code flexible because classes only implement what they need.

### D - Dependency Inversion Principle (DIP)

- High-level modules such as ViewModel should not depend on low-level modules such as RepositoryImpl.
- Both should depend on an abstraction such as an interface.
- Example in Android:
  - Create a UserRepository interface.
  - Have multiple implementations such as RemoteUserRepo and LocalUserRepo.
  - Inject it using Dagger/Hilt or manual dependency injection.
- This makes it easy to swap implementations, for example, in testing.

### Real Example

For a User Profile screen:

- SRP: Separate classes for UI (Activity), business logic (ViewModel), and data (Repository).
- OCP: Add a new API provider without changing existing data layer code.
- LSP: Replace LocalUserRepository with RemoteUserRepository safely.
- ISP: Create small interfaces for login, logout, and profile operations separately.
- DIP: ViewModel depends on the UserRepository interface, not a concrete class.

```kotlin
interface PaymentMethod {
    fun pay()
}

class PaymentProcessor(
    private val method: PaymentMethod
) {
    fun process() = method.pay()
}
```

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

## What are the building blocks of an Android app?

- **Activity:** A screen-level entry point for user interaction and lifecycle management.
- **Fragment:** A reusable UI and lifecycle component hosted by an Activity or another Fragment.
- **Service:** A component for work that should continue without a visible UI. Modern apps should prefer WorkManager for deferrable, guaranteed work and foreground services only when user-visible ongoing work is required.
- **BroadcastReceiver:** A short-lived handler for system or application broadcasts.
- **ContentProvider:** A controlled, URI-based data-sharing boundary between applications.
- **Views and layouts:** The traditional UI hierarchy, created in XML or code. Compose provides a declarative alternative using composables and layout primitives.
- **AndroidManifest.xml:** Declares components, capabilities, permissions, intent filters and application metadata.

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

## Can `onDestroy()` be called without `onPause()` and `onStop()`?

Yes. If an Activity calls `finish()` during `onCreate()`, it may be destroyed without becoming visible, so `onPause()` and `onStop()` are not necessarily called. Code must not assume every lifecycle callback pair occurs for an Activity that never reaches the started or resumed state.

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

## What are intent filters?

- Intent filters declare the actions, categories and data types a component can handle. Android uses them to resolve implicit intents. A web-link filter, for example, may declare `ACTION_VIEW`, the `DEFAULT` category and HTTP/HTTPS data schemes.
- Do not use filters as an authorization mechanism: any matching application may be offered the intent, and incoming data must still be validated.

---

## What is a BroadcastReceiver in Android?

- A BroadcastReceiver is a component in Android that listens for system-wide or app-specific broadcast messages called Intents.
- It helps the app respond to events even if the app is not currently open.
- It can listen for events such as charging, low battery, connectivity changes, and device boot completion.
- You can also create and send custom broadcasts within your own app.
- It does not show UI, but it can start work, show a notification, or launch an Activity when appropriate.

```kotlin
class BatteryReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BATTERY_LOW) {
            Log.d("BatteryReceiver", "Battery is low")
        }
    }
}
```

---

## What are Activity launch modes?

- **standard:** Creates a new instance for every launch.
- **singleTop:** Reuses the instance only when it is already at the top and delivers the Intent through `onNewIntent()`.
- **singleTask:** Reuses an existing instance in the task, removes the activities above it, and calls `onNewIntent()`.
- **singleInstance:** Places the Activity in its own task, isolating it from other Activities.

Choose launch modes deliberately. For most navigation, standard behavior plus an explicit back-stack policy is easier to reason about. Notification and deep-link flows often use flags such as `FLAG_ACTIVITY_CLEAR_TOP` or a suitable navigation graph policy instead of broadly applying `singleTask`.

---

## What are Loaders in Android?

- Loaders were lifecycle-aware APIs introduced in API 11 for asynchronous data loading, commonly with `CursorAdapter` and `LoaderManager`. They could reconnect after configuration changes and avoid repeated queries.
- They are legacy APIs today; use Room with `Flow`, ViewModel, and lifecycle-aware collection for new code.
- The underlying principle remains valid: database or provider work must not block the main thread and collection should follow the UI lifecycle.

---

## What is ConstraintLayout?

- ConstraintLayout positions views through relationships to the parent or other views.
- Chains support distribution, guidelines support alignment, and barriers respond to dynamic content. It can reduce deeply nested hierarchies, but it is not automatically faster than every alternative; measure layout cost and choose the simplest hierarchy that expresses the UI.

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

## What are shared libraries in Android?
- Shared libraries contain functionality used by multiple features or teams.
- Examples: networking, security utilities, design system, analytics, logging.

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

# Android Security

## What are common security risks in Android apps?
- Storing data in plain text.
- Using HTTP instead of HTTPS.
- Hardcoding API keys in code.
- Weak input validation.
- Outdated dependencies with known vulnerabilities.

---

## What is the Android Keystore?
- Android Keystore provides a secure way to manage cryptographic keys.
- Keys can be hardware-backed on supported devices.
- It allows encryption and signing without exposing key material directly.

---

## How can you securely store sensitive data in an Android app?
You should never store sensitive data (like passwords or tokens) in plain text. Instead:

- Use EncryptedSharedPreferences for small data like tokens.
- Use Android Keystore to store cryptographic keys securely.
- Avoid storing sensitive info in internal or external storage.

---

## How do you securely store tokens?
- Use Android Keystore-backed secure storage where appropriate.
- Never log access or refresh tokens.
- Minimize token lifetime and scope.
- Clear credentials during logout.

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

## What is hooking in Android security?

Hooking intercepts or replaces method behavior while the app is running. It can help with debugging, but attackers may use it to bypass client-side checks. Sensitive authorization decisions must still be enforced on the server.

```kotlin
interface DeviceTrust {
    fun isTrusted(): Boolean
}

class PaymentRepository(
    private val trust: DeviceTrust,
    private val api: PaymentApi
) {
    suspend fun pay(request: PaymentRequest) {
        check(trust.isTrusted())
        api.pay(request)
    }
}
```

---

## What is certificate transparency?
- Certificate Transparency provides public logs of issued certificates.
- It helps detect improperly issued certificates.
- It complements normal TLS validation rather than replacing it.

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

## What is the use of ProGuard/R8 in Android?

ProGuard, now replaced by R8, is a tool that:

- Minifies code by removing unused code.
- Obfuscates names by changing class and method names.
- Makes it harder for attackers to reverse engineer the app.

```kotlin
android {
    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
}
```

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

```kotlin
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

```kotlin
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

## How do you test ViewModel in Android?

- ViewModels are easy to test because they do not depend on the Android Framework.
- You can write plain JUnit tests and verify outputs by observing LiveData or StateFlow.

```kotlin
class CounterViewModel : ViewModel() {
    private val _count = MutableStateFlow(0)
    val count: StateFlow<Int> = _count

    fun increment() {
        _count.value++
    }
}

@Test
fun increment_updatesCount() = runTest {
    val viewModel = CounterViewModel()

    viewModel.increment()

    assertEquals(1, viewModel.count.value)
}
```

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

# Performance and Reliability

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

## What are Baseline Profiles?
- Baseline Profiles tell Android which code paths are important.
- They can improve startup and runtime performance by optimizing critical paths earlier.

In simple terms, they tell Android which code to optimize first.

```kotlin
@Test
fun collectBaselineProfile() = baselineProfileRule.collect(
    packageName = "com.example.app"
) {
    startActivityAndWait()
}
```

---

## What is Macrobenchmark?
- Macrobenchmark measures larger user journeys on real devices/emulators.
- It is useful for startup, scrolling, and other realistic performance tests.

In simple terms, it measures a real user flow instead of only measuring one function.

```text
Launch app
 ↓
Navigate
 ↓
Scroll
 ↓
Measure performance
```

```kotlin
@Test
fun startupBenchmark() = benchmarkRule.measureRepeated(
    packageName = "com.example.app",
    metrics = listOf(StartupTimingMetric()),
    iterations = 5
) {
    pressHome()
    startActivityAndWait()
}
```

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

- Analysis Tool:
    1. LeakCanary.
    2. Android Studio Memory Profiler.
    3. Heap dumps.
    4. Allocation tracking.
    5. Reproduce navigation cycles and inspect retained objects.

---

## What are common Android leaks?
- Singleton holding Activity or Context
- Fragment retaining a binding after `onDestroyView`
- Long-lived listeners or callbacks
- Coroutine outliving required lifecycle
- Static references

---

## How do you load large bitmaps?
- Decode images close to display size.
- Use an image library with caching.
- Prefer thumbnails, sampling, and appropriate formats.
- Avoid retaining many full-resolution images.

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

## What is ANR rate?
- ANR rate measures application-not-responding events.
- It is a key stability metric alongside startup performance and crashes.

---

## What is an ANR, and how can you prevent it?
- An ANR happens when the UI thread is blocked for too long.
- Avoid long work on the main thread.
- Move heavy tasks to background threads and use lifecycle-aware APIs.

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

## How do you reduce battery consumption?
- Avoid unnecessary polling.
- Sync only when needed and under suitable constraints.
- Use WorkManager, batching, and Doze/Standby-aware logic.

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

## Which tools are commonly used for CI/CD in Android?

Some commonly used CI/CD tools are:

- GitHub Actions - Integrated with GitHub, good for open-source and personal projects.
- Bitrise - Android and iOS friendly, with no setup needed and a GUI-based workflow.

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

## Scenario: Memory leak causing gradual slowdown

You are working on a large-scale social media app (~20M MAU).

Users are reporting that:

- App becomes slow after 15–20 minutes of usage
- Scrolling starts lagging
- Eventually app gets killed by system (OOM)

Observations from monitoring tools:

- Memory usage continuously increases over time
- GC frequency is very high
- Issue is more prominent on feed screen

Recent changes include:

- New feed redesign using RecyclerView
- Image loading optimizations
- Introduction of a shared singleton analytics manager

How would you investigate and fix this issue end-to-end?

> First, I would treat this as a progressive memory leak issue, not an immediate crash problem, because the degradation happens over time and correlates with user interaction.

### 1. Confirm Whether It’s a Leak or Expected Growth

Before jumping to conclusions, I would validate:

- Is memory growing linearly without release → indicates leak
- Or growing and stabilizing → expected caching behavior

Using:

- Android Studio Memory Profiler
- Heap dumps at intervals
- LeakCanary for automatic detection

If objects are retained after screen destruction, it confirms a leak.

### 2. Identify Leak Source Using Heap Analysis

I would capture heap dump and analyze:

- Dominator tree → which objects are retaining memory
- Reference chain → why they are not getting garbage collected

Typical suspects in this scenario:

- RecyclerView Adapter holding reference to Activity/Fragment
- ViewHolder retaining heavy objects
- Singleton analytics manager holding Context
- Image loader caching incorrectly

### 3. Investigate RecyclerView Layer

Since issue is prominent on feed screen:

- Check if adapter is holding strong reference to Context
- Verify if listeners are being cleared in `onViewRecycled()`
- Ensure ViewHolder does not store long-lived references

Also check:

- Are we creating new objects inside `onBindViewHolder()` repeatedly?

### 4. Analyze Singleton / Shared Components

The analytics manager is a strong suspect.

I would verify:

- Is it storing Activity context instead of Application context?
- Is it holding references to views, callbacks, or lifecycle owners?

Fix:

- Replace Activity context with Application context
- Avoid storing UI references inside singleton

### 5. Image Loading & Caching Layer

- Check if images are being cleared properly
- Ensure lifecycle-aware image loading (e.g., Glide tied to Fragment)
- Validate cache size and eviction policy

### 6. GC Pressure Optimization

High GC frequency indicates excessive allocations.

I would:

- Reduce object creation inside scroll path
- Reuse objects where possible
- Avoid unnecessary boxing/unboxing

### 7. Fix Strategy Summary

- Remove strong references causing leaks
- Ensure proper lifecycle cleanup
- Optimize adapter and ViewHolder usage
- Fix singleton misuse
- Tune image caching

### 8. Validation

- Compare heap dumps before and after fix
- Ensure memory stabilizes over time
- Monitor GC frequency reduction
- Run long-session testing (30–60 mins)

### 9. Long-Term Prevention

- Integrate LeakCanary in debug builds
- Add code review checklist for memory safety
- Avoid passing Context blindly
- Introduce architectural boundaries (no UI reference in data layer)

### Conclusion

> This issue is not just a bug but a systemic lifecycle mismanagement problem, and solving it requires discipline across UI, architecture, and shared components.

---

## Scenario: API layer instability (Retries, Failures, Token Expiry)

You are working on a fintech app with millions of daily transactions.

Users report:

- Random API failures
- Some requests succeed on retry
- Occasional logout issues

Observations:

- Increased HTTP 401 and 500 errors
- Multiple duplicate API calls
- Token refresh logic recently modified

Constraints:

- Must ensure no duplicate financial transactions
- Backend has rate limits
- Network conditions are unstable (India Tier-2/Tier-3 cities)

How would you design and fix this system?

> I would approach this as a network reliability and consistency problem, especially critical because it involves financial transactions.

### 1. Categorize Failures

First, I would classify failures into:

- Client-side issues (timeouts, retries, duplication)
- Auth issues (token expiry, refresh race conditions)
- Server issues (500 errors, rate limiting)

This helps avoid mixing multiple root causes.

### 2. Analyze Token Refresh Flow

Given logout issues and 401 spikes, token handling is a key suspect.

Common issue:

- Multiple requests fail with 401 simultaneously
- Each triggers token refresh → race condition

Fix:

- Implement single-flight token refresh

Only one refresh request should execute, others should wait.

### 3. Prevent Duplicate Requests

Critical for fintech.

I would introduce:

- Idempotency keys per request
- Unique transaction IDs generated on client

So even if retry happens:

- Server processes request only once

### 4. Retry Strategy Design

Not all APIs should retry.

- Safe APIs → retry (GET, non-critical POST)
- Financial APIs → controlled retry with idempotency

Use:

- Exponential backoff
- Network-aware retries

### 5. Network Layer Improvements

- Add OkHttp interceptors:
  - Logging
  - Retry handler
  - Auth handler
- Set proper timeouts:
  - Connection timeout
  - Read timeout

### 6. Rate Limiting Awareness

If backend has limits:

- Avoid aggressive retries
- Queue requests if needed
- Use backoff strategy

### 7. Offline Handling

- Queue requests locally (Room DB)
- Execute when network is available

### 8. Observability

- Add structured logging
- Track:
  - Retry count
  - Failure rate
  - Token refresh frequency

### 9. Validation

- Simulate poor network conditions
- Test token expiry edge cases
- Ensure no duplicate transactions

### Conclusion

> This is not just an API bug — it’s a distributed system reliability issue, requiring idempotency, synchronization, and controlled retries.

---

## Scenario: Offline-first sync failure (Message Duplication & Data Loss)

You are building a chat/messaging feature for a large app (~10M DAU), similar to WhatsApp.

Users report:

- Messages sometimes appear duplicated
- Some messages are missing after network recovery
- Message order is inconsistent across devices

Observations:

- App supports offline mode
- Messages are stored locally using Room
- Sync happens via WorkManager
- Backend is eventually consistent

Constraints:

- Messages must never be lost
- Duplicate messages are unacceptable
- App must work reliably in poor network conditions

How would you design and fix this system?

> I would approach this as a distributed data consistency problem, not just a mobile bug, because we are dealing with offline-first architecture and eventual consistency.

### 1. Clarify Data Flow and Failure Points

First, I would map the full lifecycle of a message:

- User sends message → stored locally
- Message marked as PENDING
- Sync worker sends to server
- Server responds → message marked as SENT

I would identify where duplication or loss can occur:

- Retry logic without idempotency
- Multiple sync workers running concurrently
- Server sending duplicate responses
- Improper merge logic when syncing back

### 2. Root Cause Analysis

Likely causes:

- No idempotency key → same message sent multiple times
- Sync worker running multiple times → race conditions
- No proper conflict resolution strategy
- Local DB not acting as single source of truth

### 3. Fix Strategy — Strong Data Guarantees

#### a. Introduce Idempotency

Every message must have:

- A unique client-generated ID (UUID)

Server must:

- Treat duplicate requests with same ID as same message

#### b. Single Source of Truth (SSOT)

- UI should read only from local database
- Server sync should only update DB, not UI directly

#### c. Sync Queue Design

- Maintain a queue of pending messages
- Ensure only one worker processes queue at a time

Use:

- WorkManager with unique work + KEEP policy

#### d. Conflict Resolution

- Use server timestamp as source of truth
- Merge messages carefully to avoid duplication

#### e. Ordering Guarantee

Maintain logical ordering using:

- Local timestamp (temporary)
- Server timestamp (final ordering)

### 4. Retry Strategy

- Use exponential backoff
- Retry only failed messages
- Avoid retry storms

### 5. Edge Case Handling

- App killed during sync → WorkManager resumes
- Network fluctuation → retry safely
- Partial success → update only successful messages

### 6. Validation

Simulate:

- Network drop mid-send
- Duplicate sends
- App restarts

Ensure:

- No duplicates
- No message loss
- Correct ordering

### Conclusion

> This is fundamentally a data consistency and synchronization problem, and the correct solution requires idempotency, queue control, and strong local-first architecture.

---

## Scenario: Crash spike due to lifecycle issues (Fragment + Coroutines)

You are working on a modular app with multiple teams contributing.

After a recent release:

- Crash rate increased significantly
- Common crash:
  - `IllegalStateException: Fragment not attached to a context`

Observations:

- Occurs during navigation or screen rotation
- App uses:
  - Fragments
  - Coroutines
  - ViewBinding

Recent changes:

- Async API calls added inside fragments
- Navigation refactoring

How would you debug and fix this?

> I would approach this as a lifecycle misalignment problem between UI components and async operations.

### 1. Understand Crash Context

First, I would analyze:

- When does crash occur? → navigation, rotation
- Which thread? → usually main thread
- What operation triggers it? → UI update after async call

This suggests:

- Coroutine completes after Fragment is destroyed

### 2. Root Cause Identification

Typical issue:

- Coroutine launched in Fragment scope
- Fragment destroyed
- Coroutine still running
- On completion → tries to access UI or context

### 3. Fix Strategy — Lifecycle Awareness

#### a. Use viewLifecycleOwner Scope

Instead of:

`lifecycleScope.launch { ... }`

Use:

`viewLifecycleOwner.lifecycleScope.launch { ... }`

This ensures coroutine is cancelled when view is destroyed.

#### b. Use repeatOnLifecycle

For flows:

`viewLifecycleOwner.lifecycleScope.launch { repeatOnLifecycle(Lifecycle.State.STARTED) { flow.collect { ... } } }`

#### c. Avoid Direct Context Usage

Before accessing context:

- Check if fragment is attached
- Or use `requireContext()` only when safe

#### d. Cancel Jobs Properly

- Store coroutine jobs
- Cancel them in `onDestroyView()` if needed

### 4. Navigation Safety

- Avoid triggering navigation after Fragment is destroyed
- Use safe navigation patterns

### 5. Architectural Fix

- Move business logic to ViewModel
- Fragment should only observe state

### 6. Validation

Test:

- Rapid navigation
- Screen rotation
- Background/foreground

Ensure no crashes.

### Conclusion

> This issue arises from mixing asynchronous work with lifecycle-unaware components, and the fix requires strict lifecycle-scoped execution.

---

## Scenario: Slow build time in a multi-module project

You are working on a large Android codebase:

- 50+ modules
- Multiple teams
- CI build time ~25 minutes
- Local build time ~10–12 minutes

Problems:

- Developers complain about productivity
- Small changes trigger full rebuilds

How would you optimize this?

> I would treat this as a build system scalability problem, not just Gradle tuning.

### 1. Measure Build Bottlenecks

First, I would collect data:

- Use Gradle Build Scan
- Identify:
  - Longest tasks
  - Non-incremental builds
  - Cache misses

### 2. Identify Root Causes

Common issues:

- Poor module boundaries
- Too many dependencies between modules
- Annotation processors (KAPT)
- Non-incremental tasks

### 3. Modularization Strategy

- Ensure feature-based modules
- Reduce inter-module dependencies
- Avoid circular dependencies

### 4. Incremental Build Optimization

- Enable incremental compilation
- Avoid changing shared modules frequently

### 5. Replace KAPT with KSP

- KAPT is slow
- Migrate to KSP where possible

### 6. Enable Build Cache

- Local + Remote cache
- Avoid recompilation of unchanged code

### 7. Parallel Execution

- Enable parallel builds
- Optimize Gradle workers

### 8. Dependency Optimization

- Remove unused dependencies
- Avoid large libraries

### 9. CI Optimization

- Use remote build cache
- Run only affected modules

### Conclusion

> Build time issues are usually due to poor modular boundaries and lack of incremental build optimization, and solving them requires both architectural and tooling improvements.

---

## Scenario: Battery drain due to background work

You are working on a fitness tracking app.

Users report:

- Significant battery drain
- App appears in top battery usage list

Observations:

- App uses:
  - Location tracking
  - Background sync
  - Periodic API polling

How would you fix this?

> I would approach this as a resource efficiency and background execution problem.

### 1. Analyze Battery Usage

Use:

- Battery Historian
- Android Profiler

Identify:

- CPU usage
- Wake locks
- Network usage

### 2. Identify Problematic Components

Likely causes:

- Frequent location updates
- Continuous background services
- Aggressive polling

### 3. Fix Strategy

#### a. Replace Services with WorkManager

- Use WorkManager for deferrable tasks
- Respect system scheduling

#### b. Optimize Location Updates

- Use balanced accuracy
- Reduce frequency

#### c. Reduce Polling

- Use push notifications instead of polling
- Batch network calls

#### d. Respect Doze Mode

- Avoid waking device unnecessarily

### 4. Validation

- Measure battery usage before/after
- Test long usage scenarios

### Conclusion

> Battery drain issues come from misuse of background execution, and the solution is to align with Android’s power management system.

---

## Scenario: Jetpack Compose performance issue (Excessive Recompositions)

You are working on a modern Android app fully built using Jetpack Compose.

Users report:

- UI feels laggy during interactions
- Animations stutter
- CPU usage spikes during scrolling

Observations:

- Recomposition count is very high
- Even small state updates trigger full screen recomposition
- App uses complex UI with nested composables

Recent changes:

- Introduced shared UI state in ViewModel
- Passing large data objects to composables
- Added multiple `collectAsState()` calls

How would you debug and fix this?

> I would approach this as a state management and recomposition scope problem, since Compose performance is tightly coupled with how state is structured and consumed.

### 1. Measure and Visualize Recompositions

First, I would confirm the issue using:

- Layout Inspector → recomposition count
- Compose tooling (Recomposition highlights)
- CPU profiler

Goal:

- Identify which composables are recomposing frequently
- Check if recomposition is localized or cascading

### 2. Identify Root Causes

Based on the scenario, likely causes are:

- Passing unstable or large objects as parameters
- Shared state causing global recomposition
- Multiple `collectAsState()` causing redundant updates
- Missing `remember` or incorrect state scoping

### 3. Fix State Design

#### a. Hoist and Scope State Properly

- Avoid global state for entire screen
- Break state into smaller, independent pieces

#### b. Use Stable Data Structures

- Ensure models are immutable
- Avoid passing mutable lists or objects

#### c. Avoid Passing Large Objects

Instead of:

- Passing full UI model

Pass:

- Only required fields

### 4. Optimize State Collection

Instead of multiple:

- `collectAsState()` calls

Use:

- Combine flows in ViewModel
- Expose single UI state

### 5. Use remember and derivedStateOf

- Cache expensive calculations
- Avoid recomputation

### 6. Reduce Recomposition Scope

- Break UI into smaller composables
- Ensure only affected composables recompose

### 7. Advanced Optimization

- Use `key()` for stable identity
- Avoid lambda recreation inside composables

### 8. Validation

- Compare recomposition counts
- Measure FPS improvement
- Track CPU usage

### Conclusion

> Compose performance issues are not UI problems — they are state architecture problems, and solving them requires precise control over state flow and recomposition boundaries.

---

## Scenario: API layer overload (Thundering Herd Problem)

You are working on a news app with millions of users.

At 9 AM daily:

- All users open app
- App triggers API calls for feed

Problems:

- Backend gets overloaded
- Many requests fail
- App shows errors or empty data

Observations:

- No caching strategy
- All users hit API simultaneously
- Retry logic increases load

How would you fix this?

> I would approach this as a system-level load management problem, not just an API issue.

### 1. Identify Root Cause

This is a classic thundering herd problem:

- Simultaneous requests from millions of clients
- No staggering or caching
- Retry amplifies load

### 2. Introduce Caching Strategy

#### a. Local Cache (Client-side)

- Store last successful response
- Show cached data immediately

#### b. Cache Expiry Policy

- Define TTL (e.g., 5–10 minutes)
- Avoid unnecessary API calls

### 3. Stagger Requests

- Introduce random delay before API call
- Prevent all clients hitting server at once

### 4. Improve Retry Logic

- Use exponential backoff
- Avoid immediate retries

### 5. Backend Coordination

- Use CDN caching
- Implement server-side rate limiting

### 6. Smart Fetching

- Fetch only delta updates
- Avoid full refresh

### 7. Validation

- Simulate peak traffic
- Monitor API success rate

### Conclusion

> This is not just a mobile issue — it’s a distributed load balancing problem, requiring both client and server optimizations.

---

## Scenario: Deep link handling breaking navigation

You are working on an e-commerce app.

Users report:

- Deep links sometimes open wrong screen
- App crashes when opened via link
- Back navigation behaves incorrectly

Observations:

- App uses Navigation Component
- Multiple entry points (home, product, offer pages)
- Some deep links contain query parameters

How would you fix this?

> I would approach this as a navigation state consistency problem, especially because deep links bypass normal navigation flow.

### 1. Understand Deep Link Types

- Cold start deep link
- Warm start deep link
- App already in foreground

Each case behaves differently.

### 2. Validate Deep Link Parsing

- Ensure URI parsing is correct
- Validate parameters before using

### 3. Fix Navigation Graph

- Define proper deep link destinations
- Ensure arguments are correctly mapped

### 4. Handle Back Stack Properly

- Build correct navigation stack manually if needed
- Avoid duplicate fragments

### 5. Prevent Crashes

- Validate data before navigation
- Handle missing parameters gracefully

### 6. Testing Strategy

Test:

- App closed
- App in background
- App in foreground

### Conclusion

> Deep linking is not just routing — it’s about reconstructing app state correctly, and requires careful navigation and validation logic.

---

## Scenario: Large list data loading causing OOM

You are building a marketplace app.

Users report:

- App crashes when scrolling large product lists

Observations:

- App loads entire dataset at once
- Images are high resolution
- No pagination implemented

How would you fix this?

> I would approach this as a memory management and data loading strategy problem.

### 1. Identify Root Cause

- Loading entire dataset → high memory usage
- Large images → memory spikes
- No lazy loading

### 2. Introduce Pagination

Use:

- Paging 3 library

Benefits:

- Load data incrementally
- Reduce memory footprint

### 3. Optimize Images

- Resize images before loading
- Use thumbnails

### 4. RecyclerView Optimization

- Reuse views efficiently
- Avoid unnecessary object creation

### 5. Cache Strategy

- Use disk + memory cache
- Avoid reloading images

### 6. Validation

- Monitor memory usage
- Test with large datasets

### Conclusion

> OOM issues are typically due to unbounded data loading, and the solution is controlled, incremental data flow.

---
