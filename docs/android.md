---
# Android Architecture

## What is Clean Architecture?

- It defines a way to structure code into layers.
- It helps separate UI, data, and business logic.
- It makes the code easier to maintain, test, and scale.
- It is most valuable when the feature is complex or spans multiple data sources.

```kotlin
class UserViewModel(
    private val repository: UserRepository
) : ViewModel()
```

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

---

## What are MVVM, ViewModel, LiveData, StateFlow?

- **MVVM:** The UI renders state exposed by a ViewModel; the ViewModel coordinates use cases; repositories abstract data sources.
- **ViewModel:** Retains screen state across configuration changes and must not hold Activity/View references. It does not survive process death by itself.
- **LiveData:** A lifecycle-aware observable value, especially useful in legacy XML/View screens.
- **StateFlow:** A coroutine-based hot stream representing current state; collect it with `repeatOnLifecycle` in Views or Compose lifecycle APIs.

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

## Explain Tight Coupling vs Loose Coupling

Tight Coupling:

```kotlin
class UserRepository {
    private val api = UserApi()
}
```

Repository directly depends on a concrete implementation.

Loose Coupling:

```kotlin
class UserRepository(
    private val api: UserService
)
```

Dependency is injected via an interface.

Benefits of Loose Coupling over Tight Coupling:

- Easier unit testing
- Easy mocking
- Better maintainability
- Follows Dependency Inversion Principle
- Easier to replace implementations

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

## What the use of hilt qualifier?

A Hilt qualifier distinguishes between multiple bindings that have the same type. For example, it can distinguish an authenticated API from a public API.

```kotlin
@Qualifier
@Retention(AnnotationRetention.BINARY)
annotation class AuthApi
```

---

## Which Retrofit should I inject?

Inject the Retrofit or API client whose qualifier matches the responsibility of the class. A qualifier prevents Hilt from selecting the wrong client when several clients have the same type.

```kotlin
class UserRepository @Inject constructor(
    @AuthApi private val api: UserApi
)
```

---

## Why use custom qualifier instead of Named?

Both approaches distinguish bindings. A custom qualifier is usually safer because the compiler checks the annotation type instead of relying on a string that can contain a typo.

```kotlin
@AuthApi
@Provides
fun provideAuthApi(retrofit: Retrofit): UserApi =
    retrofit.create(UserApi::class.java)
```

---

## Can we use multiple qualifiers together?

Use one qualifier to identify one binding key. If a dependency needs more detail, create a meaningful custom qualifier or model that detail in the dependency itself instead of stacking qualifiers.

---

## What happens if qualifier is missing during injection?

Hilt normally reports a compile-time missing-binding error. The requested qualified binding and the provided binding do not have the same key, so Hilt cannot choose one safely.

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

- SOLID is a set of five design principles that help in writing clean, scalable, and easy-to-maintain code. Let’s understand them one by one.

### S - Single Responsibility Principle (SRP)

- A class should have only one reason to change, meaning it should do only one job.
- This makes code cleaner and easier to test or modify.
- For example, Do not mix UI logic and data logic inside an Activity. Use Activity for UI and ViewModel for business logic. Use Repository for data handling such as API or database work.

### O - Open/Closed Principle (OCP)

- A class should be open for extension but closed for modification.
- You should add new features without changing existing code.
- This keeps the original class safe from future changes.
- For example, Suppose you have a PaymentProcessor class. Instead of editing it for every new payment method such as UPI, Card, or Wallet, create new classes such as CardPayment and UPIPayment that implement a PaymentInterface.

### L - Liskov Substitution Principle (LSP)

- Subclasses should be usable in place of their parent class without breaking the app.
- In Android, this means subclasses should behave consistently with their base classes.
- For example, If you have a Bird class with a `fly()` method, any subclass such as Sparrow or Eagle should also support flying. If a Penguin cannot fly, it should not extend that Bird class.

### I - Interface Segregation Principle (ISP)

- Do not create large, all-in-one interfaces.
- Instead, create smaller, specific interfaces that serve one purpose.
- This keeps code flexible because classes only implement what they need.
- For example, split one large UserActions interface with login, logout, and uploadPhoto methods into smaller interfaces such as AuthActions, ProfileActions, and MediaActions.

### D - Dependency Inversion Principle (DIP)

- High-level modules such as ViewModel should not depend on low-level modules such as RepositoryImpl.
- Both should depend on an abstraction such as an interface.
- This makes it easy to swap implementations, for example, in testing.
- For example, Create a UserRepository interface. Have multiple implementations such as RemoteUserRepo and LocalUserRepo. Inject it using Dagger/Hilt or manual dependency injection.

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

## What is `SavedStateHandle`?

`SavedStateHandle` stores small pieces of screen state that should be restored after configuration changes and, where supported, process recreation. It is commonly provided to a ViewModel and is not a replacement for a database.

```kotlin
class AccountViewModel(
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {
    val accountId = savedStateHandle.getStateFlow("accountId", "")
}
```

---

## What is the ViewModel lifecycle?

A ViewModel survives configuration changes such as rotation while the screen's owner is recreated. It is cleared when the owner is permanently removed, and its `viewModelScope` is cancelled. A ViewModel does not survive process death.

```kotlin
class AccountViewModel : ViewModel() {
    val state = MutableStateFlow(AccountState())

    override fun onCleared() {
        super.onCleared()
    }
}
```

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
- This keeps local reads fast while the app syncs changes when connectivity is available.

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

```kotlin
class OrderRepository(
    private val dao: OrderDao
) {
    fun observeOrders(): Flow<List<Order>> =
        dao.observeOrders().map { entities ->
            entities.map { it.toDomain() }
        }
}
```

---

## How do you detect conflicts?

I would not rely only on timestamps. Instead, I would preferably use a server-generated version or revision. The client sends the version it last read with its update. If the server's current version is different, the server returns a conflict instead of silently overwriting newer data.

```kotlin
data class OrderEntity(
    val id: String,
    val status: String,
    val serverVersion: Long,
    val syncStatus: SyncStatus
)
```

---

## What does "client sends the version it last read" mean?

When the app comes online, it sends the version that it previously downloaded with the update. The meaning is: "I am modifying Order 101 based on the version 5 that I previously downloaded."

The server compares the client's version with its current version. If they match, the update is accepted and the server increments the version. If they do not match, another client changed the data and the update becomes a conflict.

```kotlin
data class UpdateOrderRequest(
    val orderId: Int,
    val status: String,
    val version: Long
)
```

Imagine two phones both download Order 101 at version 5. Phone A changes the order to `CANCELLED` and synchronizes first, so the server changes its version to 6. Phone B later sends its update using version 5. The server sees that the client is trying to modify an old version, because `5 != 6`. That is a conflict.

```kotlin
val clientVersion = 5L
val serverVersion = 6L

val hasConflict = clientVersion != serverVersion
```

Suppose the server blindly accepts Phone B. Phone A's change would be lost, and the server would not know whether `COMPLETED` should replace `CANCELLED`. That is why we detect the conflict first.

---

## What is Last-Write-Wins?

This is one possible conflict resolution strategy. It means whichever update is considered the latest wins.

For example, Phone A changes the order to `CANCELLED` at 10:00 and Phone B changes it to `COMPLETED` at 10:05. The final server value becomes `COMPLETED`.

It is very simple, but you can lose someone's changes. For an important banking application, blindly using Last-Write-Wins can be dangerous.

---

## What is Server-Wins?

Server-Wins means that if there is a conflict, the server's current value is kept.

For example, if the server has `CANCELLED` and Phone B sends `COMPLETED`, Server-Wins keeps `CANCELLED` and discards `COMPLETED`. This is useful when the server is considered the authoritative source.

---

## What is Client-Wins?

Client-Wins means that if there is a conflict, the client's latest local value is accepted.

For example, if the server has `CANCELLED` and Phone B sends `COMPLETED`, `COMPLETED` becomes the final value. This can overwrite another user's change.

---

## What is Field-Level Merging?

Field-level merging compares which fields changed instead of treating the entire object as one thing. If Phone A changes the name and Phone B changes the email, both changes can be merged rather than throwing away one of them.

```kotlin
data class UserProfile(
    val name: String,
    val email: String
)

val merged = remote.copy(
    name = local.name,
    email = remote.email
)
```

---

## What are Business-Specific Rules?

This is especially important for a company like JPMorgan. Some data cannot simply use Last-Write-Wins. For example, account balance, payment status, transaction state, and transfer amount require server-side validation and domain-specific rules.

The server or business rules decide whether the transaction is valid, whether there is sufficient balance, whether the transaction was already processed, and whether the account is allowed to perform the operation. For banking operations, the server should be authoritative and validate the business operation.

---

## What happens after a conflict?

The sync layer detects the conflict and returns both the local and remote values. A conflict resolver can then use the local value, the remote value, a merge, or ask the user to decide.

```kotlin
sealed interface SyncResult {
    data object Success : SyncResult
    data class Conflict(
        val local: Order,
        val remote: Order
    ) : SyncResult
}

interface ConflictResolver<T> {
    fun resolve(local: T, remote: T): ConflictResolution<T>
}

sealed interface ConflictResolution<T> {
    data class UseLocal<T>(val value: T) : ConflictResolution<T>
    data class UseRemote<T>(val value: T) : ConflictResolution<T>
    data class Merge<T>(val value: T) : ConflictResolution<T>
    data class RequiresUser<T>(
        val local: T,
        val remote: T
    ) : ConflictResolution<T>
}
```

---

## What happens when the device comes online?

The sync layer sends pending local changes through WorkManager, handles successful updates or conflicts, and then updates Room. The UI reflects the result because it observes Room.

```kotlin
WorkManager.getInstance(context).enqueue(
    OneTimeWorkRequestBuilder<SyncWorker>()
        .setConstraints(
            Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()
        )
        .build()
)
```

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

## What is the difference between WorkManager and a Service?

Use WorkManager for deferrable, guaranteed background work that can follow constraints such as network availability or charging. Use a Service for work that needs to run immediately or for an ongoing operation; a foreground service is appropriate when the user must be informed about that ongoing work. Do not use a Service when WorkManager is sufficient.

```kotlin
WorkManager.getInstance(context).enqueue(
    OneTimeWorkRequestBuilder<SyncWorker>().build()
)
```

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
- It should cover

```text
    1. Symptoms.
    2. Detection/alerts.
    3. Impact.
    4. Investigation steps.
    5. Mitigation.
    6. Rollback/feature flag.
    7. Escalation path.
    8. Recovery verification.
    9. Post-incident actions.
```

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

## Would you use EncryptedSharedPreferences for auth tokens?

For a small, short-lived access token it can be acceptable. For a refresh token or other long-lived credential, use a Keystore-protected design, minimize its lifetime and scope, and support server-side revocation. No client storage makes an extracted token harmless.

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

## How do permissions affect app security over time?

Permission state can change after installation, settings changes, OS upgrades, or user decisions. Check permission state at the point of use, handle revocation without crashing, and reduce the feature gracefully when access is unavailable.

```kotlin
val cameraAllowed = ContextCompat.checkSelfPermission(
    context,
    Manifest.permission.CAMERA
) == PackageManager.PERMISSION_GRANTED
```

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

## How does certificate pinning actually protect against MITM?

Normal TLS trusts any valid certificate chain from a trusted CA. Pinning adds an application check for an expected certificate or public key, so a proxy certificate signed by another trusted CA is rejected. Backup pins and a rotation plan are required to avoid outages.

---

## What Exactly Gets Pinned?

An app can pin a leaf certificate, an intermediate certificate, or the server public key hash. Public-key pinning is generally less sensitive to certificate renewal, but it still requires backup pins and a tested rotation process.

---

## Can SSL Pinning Be Bypassed?

On a compromised or instrumented device, an attacker may hook the networking code, patch the APK, or bypass client checks. Pinning remains useful against ordinary network interception, but it is not a replacement for server-side authentication, authorization, and fraud detection.

---

## How do both sides create encryption keys securely?

With an ephemeral key exchange such as ECDHE, the client and server exchange public values and independently derive the same shared secret. Private key material is not sent over the network. TLS then derives symmetric session keys from that exchange for application data.

---

## How does trust get established before any API data is exchanged?

The server presents a certificate during the TLS handshake. Android verifies its chain, hostname, and validity period, and certificate pinning can add an expected public-key check. Only after these checks succeed does the client send application data through the encrypted session.

---

## What Happens During MITM Attack?

Without pinning, a device that trusts an attacker-controlled certificate authority may accept a proxy certificate. With pinning, the proxy key does not match the expected pin and the connection is rejected. A compromised device can still bypass client-side checks, so the server must remain authoritative.

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

## How do you handle a rooted device?

A rooted device may allow local protections to be bypassed, so the client must be treated as untrusted. Keep authorization and transaction validation on the server, minimize sensitive data on the device, and use Play Integrity as an additional risk signal when the product's threat model requires it. It should not be the only security control.

---

## Can an app reliably detect rooted devices?

No. Root detection is heuristic because an attacker can hide or bypass individual signals. Combine signals for risk scoring and let the backend decide which sensitive operations require stronger integrity.

---
## How do you handle sensitive logging?

Never log tokens, passwords, account numbers, or unnecessary personal data. Log only the minimum safe diagnostic information needed to investigate an issue, and review logging in release builds.

```kotlin
Log.d("Payment", "Payment request started: id=$paymentId")
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

## How does Android Keystore work internally, and what does “hardware-backed” really mean?

Android Keystore delegates key operations to KeyMint or its supported software implementation. With a hardware-backed key, the private key material stays inside the device's secure hardware, such as the TEE or StrongBox, while the app requests operations through the Keystore API. Hardware backing must be checked because support varies by device.

```kotlin
val keyStore = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
val secretKey = keyStore.getKey("auth_key", null) as SecretKey
val factory = SecretKeyFactory.getInstance("AES", "AndroidKeyStore")
val keyInfo = factory.getKeySpec(secretKey, KeyInfo::class.java)
val hardwareBacked = keyInfo.isInsideSecureHardware
```

---

## What are common mistakes teams make when using Android Keystore?

Common mistakes include:

- Storing the token instead of encrypting it.
- Treating Keystore as a general database.
- Ignoring key invalidation after biometric or lock-screen changes.
- Assuming every device provides hardware backing. 

A secure app handles key failure by clearing unusable encrypted state and requiring re-authentication.

---

## How does Jetpack Security work under the hood?

- Jetpack Security is a convenience layer over cryptographic primitives and Android Keystore.
- `EncryptedSharedPreferences` protects preference keys and values separately, using a Keystore-protected master key. It is suitable for small secrets, not large or frequently changing data.

```kotlin
val masterKey = MasterKey.Builder(context)
    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
    .build()

val prefs = EncryptedSharedPreferences.create(
    context,
    "secure_prefs",
    masterKey,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
)
```

---

## When should you use EncryptedSharedPreferences?

Use `EncryptedSharedPreferences` when:

- The data is small, such as a token, preference, or feature credential.
- The value does not change frequently.
- Convenience is more important than using a custom storage layer.

Avoid it when:

- You need to store large data or a collection of records.
- You need frequent updates; use a database instead.
- You are designing new code without a compatibility requirement.

Remember:

- The API is deprecated in current AndroidX Security Crypto.
- Prefer a supported Keystore-backed design for new code.
- Give stored secrets a short lifetime and revoke them server-side when possible.

```kotlin
val masterKey = MasterKey.Builder(context)
    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
    .build()

val securePrefs = EncryptedSharedPreferences.create(
    context,
    "auth_prefs",
    masterKey,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
)

securePrefs.edit()
    .putString("access_token", accessToken)
    .apply()
```

---

## How do you secure a local database using Room?

Secure a Room database by:

- Using SQLCipher or another reviewed database-encryption solution.
- Generating a random database key and protecting it with Android Keystore.
- Keeping database access inside the app process.
- Disabling or restricting backups when the threat model requires it.
- Clearing the database and deleting its key during secure logout.

Remember:

- Never hard-code or log the database passphrase.
- Test encrypted-database migrations before release.
- Choose backup and recovery behavior based on the sensitivity of the data.

```kotlin
// databaseKeyStore returns a random 32-byte key protected by Android Keystore.
val databaseKey: ByteArray = databaseKeyStore.getOrCreate("room-db-key")
val openHelperFactory = SupportOpenHelperFactory(databaseKey)

val database = Room.databaseBuilder(
    context,
    AppDatabase::class.java,
    "app.db"
)
    .openHelperFactory(openHelperFactory)
    .build()
```

---

## How do you encrypt files stored on device?

To encrypt a file:

- Generate or unwrap the key through Android Keystore.
- Use authenticated encryption such as AES-GCM.
- Store the IV together with the ciphertext; the IV is not secret.
- Keep plaintext files short-lived.
- Delete temporary plaintext after encryption completes.

Remember:

- The GCM authentication tag detects tampering during decryption.
- Never reuse an IV with the same key.
- Store only ciphertext in the final device file.

```kotlin
private const val FILE_KEY_ALIAS = "file-encryption-key"

private fun fileKey(): SecretKey {
    val keyStore = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
    return (keyStore.getKey(FILE_KEY_ALIAS, null) as? SecretKey)
        ?: KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
            .apply {
                init(
                    KeyGenParameterSpec.Builder(
                        FILE_KEY_ALIAS,
                        KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
                    )
                        .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                        .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                        .setKeySize(256)
                        .build()
                )
            }
            .generateKey()
}

fun encryptFile(input: File, encryptedOutput: File) {
    val cipher = Cipher.getInstance("AES/GCM/NoPadding")
    cipher.init(Cipher.ENCRYPT_MODE, fileKey())

    encryptedOutput.outputStream().use { output ->
        output.write(cipher.iv) // Store the non-secret IV with the ciphertext.
        CipherOutputStream(output, cipher).use { encrypted ->
            input.inputStream().use { it.copyTo(encrypted) }
        }
    }
}
```

---

## Cache vs Persistent Storage – what’s safe?

Neither location should be assumed safe on a compromised device. A cache may be deleted by the system but can still contain sensitive data, while persistent storage survives longer. Do not cache secrets unnecessarily; encrypt data that must be retained and clear sensitive cache entries on logout.

---

## Why is local storage a security risk in Android apps?

App sandboxing reduces access from other ordinary apps, but local data can still be exposed through backups, logs, debugging, rooted devices, malware, screenshots, or a compromised process. Store the minimum data, encrypt sensitive values, protect keys with Keystore, and define cleanup and backup policies.

---

## How do you handle secure logout?

Secure logout should:

1. Revoke the session or refresh token on the server.
2. Clear sensitive databases and close them.
3. Clear encrypted preferences synchronously.
4. Delete sensitive cache files and pending user data.
5. Cancel user-specific WorkManager jobs and notifications.
6. Delete or invalidate local encryption keys.
7. Reset in-memory session state.
8. Show the signed-out UI only after cleanup completes.
9. Also remove pending deep-link data and any user-specific in-memory state.
10. If server revocation fails, keep the local session unusable and retry revocation safely later.

```kotlin
suspend fun logout(userId: String) {
    try {
        // Best effort: local cleanup must still happen if the network is unavailable.
        authApi.revokeSession()
    } finally {
        userDatabase.clearAllTables()
        userDatabase.close()

        val keyStore = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }

        securePrefs.edit().clear().commit() // Synchronous before showing signed-out UI.
        context.cacheDir.resolve("user-$userId").deleteRecursively()
        WorkManager.getInstance(context).cancelAllWorkByTag("user:$userId")

        keyStore.deleteEntry("room-db-key")
        keyStore.deleteEntry("file-encryption-key")
        sessionState.reset()
    }
}
```

---

## Why not rely on full-disk encryption?

Full-disk or file-based encryption protects data primarily when the device is locked. After the user unlocks the device, an app can access its permitted data. App-level encryption adds another layer and allows sensitive keys or data to be invalidated independently.

---

## What happens if Keystore is wiped?

Ciphertext that depends on the missing key may no longer be decryptable. The app should fail securely, remove unusable encrypted state, require the user to authenticate again, and provision a new key rather than falling back to plaintext storage.

---

## How do you generate and manage encryption keys?

Generate keys in Android Keystore, never export key material, choose authentication and purpose settings according to the threat model, version keys for rotation, and handle invalidation by requiring re-authentication and re-provisioning.

```kotlin
val generator = KeyGenerator.getInstance(
    KeyProperties.KEY_ALGORITHM_AES,
    "AndroidKeyStore"
)
generator.init(
    KeyGenParameterSpec.Builder(
        "storage_key_v1",
        KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
    )
        .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
        .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
        .build()
)
val key = generator.generateKey()
```

---

## How do you prevent reverse engineering beyond basic obfuscation?

Use multiple layers:

- Use R8 to shrink, optimize, and obfuscate the app.
- Never hard-code API keys, passwords, or signing secrets.
- Keep authorization and sensitive business decisions on the server.
- Add Play Integrity and tamper signals where appropriate.
- Treat runtime checks as risk signals, not as a complete security boundary.

Remember: client code can eventually be inspected, so the backend must remain authoritative.

---

## Why should you pin public keys instead of certificates?

Public-key pinning is useful because:

- Certificates expire and are renewed frequently.
- The same public key can remain valid across certificate renewals.
- Pinning the key can reduce unnecessary outages during certificate rotation.

Always add:

- At least one backup pin.
- A tested key-rotation plan.
- A recovery plan for a bad or expired pin.

---

## How do you detect rooted or tampered devices?

Check several signals instead of trusting one check:

- Suspicious root files or binaries.
- Test keys in the system build.
- A debuggable or unexpectedly modified app.
- An unexpected signing certificate.
- Play Integrity results.

Important:

- These checks are heuristics and can produce false positives.
- Use them for risk-based restrictions.
- Enforce sensitive authorization on the server.

```kotlin
val hasTestKeys = Build.TAGS?.contains("test-keys") == true
```

---

## How do you detect APK tampering?

To detect APK tampering:

- Verify the runtime signing certificate.
- Check the package identity and installer source.
- Check an integrity verdict when available.
- Treat a changed or resigned APK as untrusted.
- Send the result to the backend for policy decisions.

Client checks reduce risk; they cannot replace server-side verification.

---

## How should permissions be handled securely?

Handle permissions securely by:

- Requesting permission just before the feature needs it.
- Asking only for the minimum permission or scope.
- Checking the permission every time the operation runs.
- Handling denial and permanent denial gracefully.
- Supporting revocation after the user has previously granted access.

A previous grant is not a permanent guarantee.

```kotlin
if (ContextCompat.checkSelfPermission(
        context,
        Manifest.permission.CAMERA
    ) != PackageManager.PERMISSION_GRANTED
) {
    // Request permission at the point of use.
}
```

---

## How do you secure background work and services?

Secure background work by:

- Setting components to `exported=false` unless external access is required.
- Using explicit intents for internal communication.
- Protecting required IPC with permissions.
- Validating every incoming intent and its extras.
- Using WorkManager for deferrable background work.
- Using a foreground service only for user-visible, ongoing work.

```xml
<service
    android:name=".SecureService"
    android:exported="false" />
```

---

## If you had to summarize Android security strategy as a Tech Lead, what would it be?

As a Tech Lead, I would use layered controls:

- Protect keys with Android Keystore.
- Encrypt sensitive local data.
- Use TLS and carefully managed public-key pinning where justified.
- Detect integrity and tamper risks.
- Secure exported components and IPC.
- Revoke credentials during logout.
- Keep final authorization on the server.

The goal is to reduce the blast radius and fail safely, not to assume the client is impossible to compromise.

---

## Additional Security Interview Questions

### How does Android Keystore work under the hood? How do you know if a key is hardware-backed?

The flow is:

- The app asks Android Keystore to create or use a key.
- Android delegates the operation to KeyMint hardware when available.
- Otherwise, Android uses a software-backed implementation.
- Check `KeyInfo.isInsideSecureHardware()` after key creation.
- Do not assume every device has hardware-backed keys.

### How would you securely store encryption keys on an Android device? What are failure cases?

Store encryption keys by following these rules:

- Generate them inside Android Keystore.
- Never export or log raw key material.
- Give keys a clear purpose and lifecycle.
- Handle biometric, lock-screen, and device changes that invalidate keys.
- Require re-authentication instead of falling back to plaintext.

### How do you protect cryptographic keys from root or malware attacks?

Protect keys by:

- Using hardware-backed Keystore when available.
- Requiring user authentication for high-risk operations.
- Using integrity signals to adjust risk.
- Keeping final authorization on the server.

Treat a rooted device as untrusted even when Keystore is used.

### What happens to Keystore keys when biometrics change?

When biometrics change:

- A key configured for biometric invalidation may become unusable.
- Catch the Keystore or decryption exception.
- Delete ciphertext that cannot be recovered safely.
- Ask the user to authenticate again.
- Provision a new key and encrypt new data with it.

### Users report login failures after fingerprint reset. What went wrong?

The likely cause is key invalidation after the fingerprint change.

Recovery should:

- Detect the key or decryption failure.
- Clear the dependent encrypted state.
- Require a fresh login or re-authentication.
- Provision a replacement key.

Do not treat this as an ordinary network failure.

### How does EncryptedSharedPreferences work internally?

Internally it:

- Uses a Keystore-protected master key.
- Encrypts preference keys separately from preference values.
- Uses authenticated encryption for values.
- Fits small secrets, not large or frequently changing data.

For new code, also check the current AndroidX API status because this API is deprecated.

### Is EncryptedSharedPreferences enough for sensitive data?

It helps, but it is not complete protection:

- It protects stored values, not a compromised running process.
- It does not stop token replay if an attacker obtains a usable token.
- It does not replace server-side revocation.
- It does not replace key lifecycle, backup, and logout controls.

### Why would you or wouldn’t you use Jetpack Security for tokens?

Use Jetpack Security when:

- The secret is small and short-lived.
- The storage lifecycle fits the product.
- Existing-app compatibility makes it practical.

For long-lived refresh tokens, also require:

- Keystore-backed protection.
- Token rotation and explicit invalidation.
- Server-side revocation.

Avoid treating client-side encryption as a guarantee that a token cannot be stolen.

### How would you store access and refresh tokens securely?

Store tokens securely by:

- Keeping access tokens short-lived.
- Protecting refresh tokens with Keystore-backed encryption.
- Giving tokens the minimum scope and audience.
- Never logging tokens or placing them in URLs.
- Supporting server-side revocation and rotation.
- Clearing tokens during logout.

### What happens if an attacker extracts app data?

If app data is extracted, an attacker may obtain:

- Ciphertext.
- File names and metadata.
- Cached or temporary data.
- Tokens that were stored or left in memory unsafely.

Reduce the impact by:

- Separating keys from ciphertext.
- Minimizing local data.
- Clearing caches and temporary files.
- Detecting and revoking suspicious sessions on the server.

### How do you protect refresh tokens on a rooted device?

On a rooted device:

- Use Keystore-backed encryption where available.
- Bind sessions and sensitive actions to the device and session context.
- Use short token lifetimes.
- Apply integrity and risk signals.
- Support immediate server-side revocation.

Treat the client as untrusted and restrict high-value actions when risk is high.

### What does a secure logout mean on Android?

Secure logout means:

- Revoke server credentials.
- Delete or invalidate local encryption keys.
- Clear encrypted preferences and sensitive databases.
- Remove files, caches, cookies, and pending work.
- Reset in-memory authentication state.

Show the signed-out UI only after the cleanup policy completes.

### How do you ensure customer data is removed after logout?

To verify customer data removal:

- List every user-scoped database, file, preference, cache, cookie, and worker.
- Revoke the server session.
- Clear local data synchronously or expose a controlled cleanup state.
- Cancel user-specific work and notifications.
- Add tests that confirm each storage location is empty or inaccessible.

### What exactly do you clear when a user logs out?

At logout, clear or invalidate:

- Keystore keys.
- Encrypted preferences.
- User databases.
- Sensitive files and cache entries.
- Pending WorkManager jobs and notifications.
- Cookies and session headers.
- In-memory authentication and user state.

### How do you protect business logic from reverse engineering?

Protect business logic by:

- Using R8 to increase the cost of analysis.
- Keeping secrets and authorization on the backend.
- Minimizing sensitive logic on the client.
- Adding integrity checks when they support the threat model.
- Rechecking important actions on the server.

### How do you slow down attackers analyzing your app?

Increase attacker effort by:

- Enabling shrinking, optimization, and obfuscation.
- Avoiding hardcoded secrets.
- Adding runtime and integrity checks.
- Separating sensitive decisions across client and server.
- Validating important actions independently on the server.

### When would you use certificate pinning, and when would you avoid it?

Use certificate pinning when:

- The threat model justifies the operational cost.
- You control certificate or key rotation.
- You can ship backup pins and test recovery.

Avoid or limit it when:

- Certificate ownership is unclear.
- Rotation cannot be controlled reliably.
- A pin failure would lock out users without a recovery path.

### How do you protect against MITM attacks?

Protect against MITM attacks by:

- Using HTTPS with hostname and certificate-chain validation.
- Considering public-key pinning when the threat model requires it.
- Preventing downgrade and unsafe proxy configurations.
- Using short-lived credentials and replay protection.
- Keeping authorization decisions on the server.

### How do you ensure API calls aren’t intercepted?

Reduce API interception risk by:

- Using TLS correctly.
- Adding carefully managed pinning only when appropriate.
- Authenticating every request.
- Signing sensitive requests when replay or tampering is a concern.
- Using short-lived credentials.
- Detecting unusual activity on the server.

### How do you handle security on compromised devices?

On a compromised device:

- Treat the client as untrusted.
- Minimize stored secrets and sensitive data.
- Use risk-based restrictions for high-value actions.
- Ask for step-up authentication when needed.
- Enforce the final decision on the backend.

### What happens if PhonePe runs on a rooted phone?

If PhonePe runs on a rooted phone:

- Collect root and integrity signals.
- Allow normal low-risk functionality when policy permits.
- Require stronger verification for sensitive actions.
- Let the server approve, restrict, or block high-value transactions.

Do not rely on the client alone to approve a payment.

### How do you know your APK hasn’t been modified?

Check:

- The expected signing certificate.
- The package identity.
- The installer source.
- Play Integrity or another attestation verdict.
- Server-side attestation and session signals.

These checks reduce risk but cannot make a client unpatchable.

### How would you detect a repackaged app?

To detect a repackaged app:

- Verify the expected package identity.
- Verify the expected signing certificate.
- Inspect the installer source.
- Check integrity signals.
- Reject or restrict suspicious clients through backend policy.

### How do you prevent fake apps with your branding?

To reduce fake-app risk:

- Protect release-signing keys.
- Monitor app stores and distribution channels.
- Verify package and certificate identity.
- Use Play Integrity where appropriate.
- Keep account and transaction authorization on the backend.

### What happens if a user revokes permission at runtime?

When permission is revoked:

- Check it again before the next sensitive operation.
- Stop or reduce the feature safely.
- Explain why the permission is needed.
- Offer a useful fallback when possible.
- Avoid crashes and never assume an earlier grant still exists.

### How do you safely handle camera or SMS permissions?

For camera or SMS permissions:

- Request permission only at the point of use.
- Request the minimum required permission.
- Check the result every time the feature runs.
- Handle denial, permanent denial, and later revocation.
- Provide a safe fallback when possible.

### What Android components are common attack vectors?

Common IPC attack surfaces include:

- Exported activities.
- Exported services.
- Exported broadcast receivers.
- Exported content providers.
- Implicit intents and unvalidated input.

### How can one app exploit another app?

One app may attack another by:

- Invoking an exported component.
- Sending a crafted intent.
- Reading a weakly protected provider.
- Abusing an unsafe IPC contract.

Prevent this by restricting exports, validating input, and protecting required components with permissions.

### How do you secure services and receivers?

Secure services and receivers by:

- Setting `exported=false` unless external access is required.
- Using explicit intents for internal calls.
- Protecting exported entry points with permissions.
- Validating every action, caller, and input value.
- Limiting the work performed by a received request.

### How would you design Android security for a large-scale app?

For a large-scale app:

1. Start with threat modeling.
2. Protect keys with Keystore.
3. Encrypt sensitive local storage.
4. Secure TLS, IPC, and exported components.
5. Add integrity and abuse detection.
6. Keep authorization on the server.
7. Add observability and incident response.
8. Use staged rollout and rapid rollback controls.

### How do you balance security with customer experience?

Balance security and user experience by:

- Keeping low-risk actions convenient.
- Adding step-up authentication for risky actions.
- Considering transaction value and device signals.
- Providing recovery paths for legitimate users.
- Avoiding blanket blocks when a smaller restriction is sufficient.

### How would you secure a fintech Android app?

For a fintech app, use:

- Device controls: Keystore and integrity signals.
- Application controls: secure storage, R8, and safe IPC.
- Network controls: TLS, authentication, and replay protection.
- Session controls: short-lived tokens, rotation, and revocation.
- Transaction controls: bind actions to the user, session, amount, and destination.
- Backend controls: make the server authoritative for every financial decision.

---

## How connection established between client and server how key exchanges?

The connection flow is:

1. The app resolves the server's domain name.
2. The app opens a TCP connection, or a suitable modern transport.
3. The TLS handshake begins.
4. The server sends its certificate.
5. The client validates the certificate chain and hostname.
6. Both sides perform an ephemeral key exchange such as ECDHE.
7. Both sides derive the same symmetric session keys.
8. HTTP requests and responses are encrypted with those session keys.

The private keys are not sent over the network.

---

## End to end flow form mobile app to backend SSL pinning lfow and public key flow, how it works, do not explain with code

The end-to-end flow is:

1. The mobile app sends an HTTPS request.
2. TLS validates the server certificate chain and hostname.
3. Public-key pinning, if enabled, checks the expected certificate or public key.
4. The TLS handshake derives symmetric session keys.
5. The request and response travel encrypted over the TLS session.
6. The backend authenticates the client and authorizes the action.
7. The backend applies replay, fraud, and transaction checks.

Pinning verifies the expected server identity; it does not replace backend authorization.

---

## Why use ECDHE instead of RSA key exchange?

ECDHE is preferred because:

- It creates a fresh shared secret for each handshake.
- Ephemeral keys provide forward secrecy.
- A later compromise of the server's private key does not automatically reveal old sessions.
- RSA key exchange does not provide the same forward-secrecy property.
- Modern TLS uses ephemeral Diffie-Hellman-style key exchange instead of RSA key exchange.

---

## Why Symmetric Key?

Symmetric encryption is much faster than public-key encryption for large amounts of data. TLS uses asymmetric cryptography to authenticate and establish a shared secret, then uses the symmetric session key for normal request and response traffic.

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

## Advantages of XML over Jetpack Compose — How would you convince your manager(who is from a non-technical background) to choose Jetpack Compose over XML?

XML still has a few advantages:

- Mature ecosystem with years of production stability.
- Faster preview rendering for very large legacy projects.
- Easier gradual migration in existing applications.
- Less recomposition knowledge required.
- Works well with ViewBinding/DataBinding.
- Better choice when maintaining legacy apps with thousands of XML screens.

For greenfield projects, Compose is generally preferred.

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

## When does recomposition happen in Compose?

Recomposition occurs whenever observed state changes.

Compose re-executes only the affected composables to update the UI.

To minimise recomposition:

- Keep state as low as possible in the UI tree.
- Pass only the required state to child composables.
- Use immutable models (`val` properties).
- Compose skips recomposition when parameters are stable and unchanged.
- Use `@Stable` and `@Immutable` where appropriate.
- Provide `key()` in LazyLists to maintain stable item identity.

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

## Why should composables be stateless?

Stateless composables receive their state and callbacks from the caller instead of owning the state internally. They are easier to test, reusable, predictable, and support state hoisting.

```kotlin
@Composable
fun UserCard(
    user: User,
    onClick: () -> Unit
) {
    Text(
        text = user.name,
        modifier = Modifier.clickable(onClick = onClick)
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

## Explain Side Effects in Jetpack Compose

Compose UI should ideally be side-effect free. Side-effect APIs execute work outside recomposition.

- `LaunchedEffect` → launch coroutines
- `DisposableEffect` → register/unregister listeners
- `SideEffect` → update non-Compose objects after successful recomposition
- `produceState` → convert callback/Flow into State
- `rememberUpdatedState` → avoid restarting effects when lambdas change
- `derivedStateOf` → compute expensive derived state only when dependencies change

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

## How do you avoid unnecessary recomposition?

The most common mistake is reading state too high in the composable tree.

Rule: Move state down to the composable that actually needs it.

Also:

- Use immutable UI models.
- Annotate models with `@Immutable` / `@Stable` when appropriate.
- Use `remember` for expensive calculations.
- Use `derivedStateOf` for derived values.
- Use `key()` inside LazyColumn.
- Hoist state only when multiple composables need it.

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

## What is a Spy in Android Unit Testing?
- A mock does not run the real implementation by default; you define its behavior.
- A spy wraps a real object, so real methods run by default and selected methods can be stubbed or verified.
- Mocks are usually better for isolated unit tests. Spies are useful when most real behavior is needed.

```kotlin
class UserRepository {
    fun getUserName() = "Kiran"
}

val mockRepository = mockk<UserRepository>()
every { mockRepository.getUserName() } returns "Test User"

val spyRepository = spyk(UserRepository())
every { spyRepository.getUserName() } returns "Test User"
```

## When should you use Mock?

For Android unit testing, a mock is usually the default choice when testing a class in isolation. You do not want the test to depend on Retrofit, Room, the network, authentication, or real repository logic.

```kotlin
coEvery {
    repository.getUser()
} returns User("1", "Kiran")
```

## When should you use Spy?

Use a spy when you want most of the real behavior, need to override only a specific method, or need to verify interactions with a real object. Replacing the whole object with a mock would otherwise make the test unnecessarily complicated.

```kotlin
val calculator = spyk(Calculator())

every {
    calculator.getTaxRate()
} returns 0.10

val result = calculator.calculatePrice(100)
```

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

## What should not be UI tested?

Do not put every business rule or implementation detail into UI tests. Keep most business logic, ViewModel behavior, use cases, validators, and mappers in unit tests. Use UI tests for critical user journeys and user-visible behavior.

---

## How do you handle flaky tests?

First identify whether the issue is timing, synchronization, environment, test isolation, or product behavior. Avoid arbitrary sleeps and use deterministic synchronization. Track flaky tests separately instead of repeatedly rerunning them until they pass.

```kotlin
runTest {
    viewModel.load()
    advanceUntilIdle()
    assertEquals(expected, viewModel.uiState.value)
}
```

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

## Why coEvery and coVerify not used instead of whenever?

`coEvery` and `coVerify` are MockK APIs for suspend functions. `whenever` and `verify` are Mockito-style APIs. The test should use the syntax that matches the mocking library configured for the project.

```kotlin
coEvery { api.getUser() } returns User("Kiran")
repository.getUser()
coVerify(exactly = 1) { api.getUser() }
```

---

## How to mock Singletone object or Objects which are created inside Function?

MockK can replace a Kotlin `object` with `mockkObject`. For a class constructed inside the function, `mockkConstructor` and `anyConstructed` can intercept that instance. Dependency injection is preferable for new code because it keeps tests simpler.

```kotlin
mockkObject(AnalyticsManager)
every { AnalyticsManager.track("login") } just Runs

mockkConstructor(HttpClient::class)
every { anyConstructed<HttpClient>().getUser() } returns User("Kiran")
```

---

## What if constructor has parameters?

Constructor mocking still intercepts the constructed instance regardless of its constructor arguments. Configure `anyConstructed<T>()` when the exact arguments are not important, or inject the dependency when the production code can be changed.

```kotlin
mockkConstructor(ApiClient::class)
every { anyConstructed<ApiClient>().getData() } returns "Mocked Data"
```

---

## How do you mock objects created inside a function?

With MockK, use constructor mocking for legacy code that creates the dependency internally. For new code, dependency injection is easier to test and keeps the production dependency explicit.

```kotlin
mockkConstructor(HttpClient::class)
every { anyConstructed<HttpClient>().getUser() } returns User("Kiran")
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

The test runs important user flows, and Android generates `baseline-prof.txt` from them. You normally do not write that file manually.

```kotlin
@RunWith(AndroidJUnit4::class)
class BaselineProfileGenerator {
    @get:Rule
    val rule = BaselineProfileRule()

    @Test
    fun generate() = rule.collect(
        packageName = "com.example.app"
    ) {
        pressHome()
        startActivityAndWait()
        device.waitForIdle()
        // Exercise important startup, login, navigation, and scrolling flows.
    }
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

Macrobenchmark tests usually run in a separate benchmark module. They measure the complete app flow, such as cold startup or scrolling.

```kotlin
plugins {
    id("com.android.test")
}

android {
    namespace = "com.example.benchmark"
    targetProjectPath = ":app"
    defaultConfig {
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }
}

dependencies {
    implementation("androidx.benchmark:benchmark-macro-junit4:1.4.0")
    implementation("androidx.test.uiautomator:uiautomator:2.3.0")
}
```

Macrobenchmark measures performance, while a Baseline Profile tells Android which frequently used code should be optimized. Run the benchmark before and after adding the profile to check the improvement.

```kotlin
@Test
fun coldStartupBenchmark() = benchmarkRule.measureRepeated(
    packageName = "com.example.app",
    metrics = listOf(StartupTimingMetric()),
    iterations = 10,
    startupMode = StartupMode.COLD
) {
    pressHome()
    startActivityAndWait()
    device.waitForIdle()
}

@Test
fun scrollBenchmark() = benchmarkRule.measureRepeated(
    packageName = "com.example.app",
    metrics = listOf(FrameTimingMetric()),
    iterations = 5
) {
    startActivityAndWait()
    device.findObject(By.res("com.example.app", "recycler_view"))
        .swipe(Direction.UP, 1.0f)
    device.waitForIdle()
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

## When do memory leaks happen in Android?

The most common memory leak occurs when an Activity or Fragment is referenced by a longer-lived object.

Common causes:

- Activity/Fragment Context stored inside a Singleton (use Application Context instead)
- Fragment ViewBinding not cleared in `onDestroyView()`
- Inner classes or anonymous listeners holding Activity references
- Listeners registered but never unregistered
- Delayed Handlers or Runnables capturing Activity
- Coroutines launched in GlobalScope instead of lifecycle-aware scopes

Prevention

- Use `applicationContext` for singletons.
- Set `binding = null` in `onDestroyView()`.
- Register/unregister listeners in matching lifecycle callbacks.
- Use `lifecycleScope` and `viewModelScope`.
- Avoid `GlobalScope`.
- Detect leaks using LeakCanary and Android Studio Memory Profiler.

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

## What causes ANRs?

An ANR occurs when:

- Main thread is blocked for more than 5 seconds during user interaction.
- `BroadcastReceiver.onReceive()` takes more than 10 seconds.

Common causes:

- Network or database work on Main Thread
- Disk I/O
- Lock contention
- Long-running BroadcastReceivers
- Heavy layout inflation
- Large JSON parsing or bitmap decoding on UI thread

Prevention

- Keep UI thread lightweight.
- Move expensive work to `Dispatchers.IO` or `Dispatchers.Default`.
- Enable StrictMode in debug builds.
- Monitor Android Vitals and analyze `/data/anr/traces.txt`.

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

## How do you investigate high CPU usage?

First measure the issue with the CPU profiler and identify the hot code path. Then check for expensive loops, repeated parsing, unnecessary recomposition, excessive polling, or work running on the wrong dispatcher. Fix the bottleneck and validate the result with the same workload.

```kotlin
val result = withContext(Dispatchers.Default) {
    records.sortedBy { it.timestamp }
}
```

---

## How do you detect and fix main thread blocking?

I would enable StrictMode, inspect the main-thread trace in CPU Profiler or Perfetto, and look for disk I/O, database work, network calls, parsing, or expensive rendering. I would move blocking work to an appropriate dispatcher and measure the same user flow again.

```kotlin
val user = withContext(Dispatchers.IO) {
    repository.loadUser()
}
```

---

## How do you reduce a large APK?

Use APK Analyzer to find large files and remove unused resources or dependencies. Enable code and resource shrinking for release builds, and use appropriate ABI splits when the distribution strategy supports them.

```kotlin
buildTypes {
    release {
        isMinifyEnabled = true
        isShrinkResources = true
    }
}
```

---

## How do you investigate database performance?

Inspect slow queries and database traces. Check indexes, avoid loading unnecessary columns or rows, use pagination for large data sets, keep database work off the main thread, and use transactions when multiple related writes must be atomic.

```kotlin
@Query("SELECT id, name FROM users ORDER BY name LIMIT :limit OFFSET :offset")
suspend fun loadUsers(limit: Int, offset: Int): List<UserRow>
```

---

## How do you handle a crash spike after release?

First identify the affected version, devices, and crash cluster. Pause or reduce the rollout, disable the feature with a flag when possible, investigate the root cause, and release a validated fix or rollback. Continue monitoring after the mitigation.

---

## Your app has become slow. How would you investigate?

This question can mean different things, so I’d first clarify whether the issue is:

- Cold startup
- Warm startup
- Frame drops / UI Jank
- Scrolling performance
- Memory issues
- Network latency

Then I’d use:

- Macrobenchmark
- Baseline Profiles
- Perfetto
- JankStats
- Android Studio Profiler
- StrictMode

The investigation always starts with measuring first, then optimising the identified bottleneck.

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

## Q: How do you verify startup improvements didn’t break behavior?

I would run the existing unit, integration, and UI tests, then compare startup benchmarks with the same device, build type, and user flow. I would also monitor crashes, ANRs, startup timing, and key business metrics during a staged rollout.

---

## Q: How do you verify jank reduction?

I would compare frame timing and frozen-frame metrics before and after the change using the same device and workload. I would verify the result with Macrobenchmark or Perfetto and confirm that scrolling and critical interactions still behave correctly.

```kotlin
@Test
fun scrollBenchmark() = benchmarkRule.measureRepeated(
    packageName = "com.example.app",
    metrics = listOf(FrameTimingMetric()),
    iterations = 5
) {
    startActivityAndWait()
    device.waitForIdle()
}
```

---

## Which profiling tools do you actually use day-to-day?

I use Android Studio CPU, Memory, and Network Profiler, Layout Inspector, Compose tooling, StrictMode, Perfetto, Android Vitals, LeakCanary, JankStats, and Macrobenchmark. I choose the tool based on the symptom and measure before and after the fix.

---

## How do you optimize large lists?

Use pagination or incremental loading, stable item identity, view reuse, lightweight binding, appropriately sized images, and one source of truth for list state. For Compose, use stable keys and avoid passing changing large objects unnecessarily.

```kotlin
LazyColumn {
    items(
        items = users,
        key = { user -> user.id }
    ) { user ->
        UserRow(user)
    }
}
```

---

## How do you optimize network and DB access?

Measure request and query latency, avoid duplicate calls, cache data at the correct layer, paginate large results, select only required columns, batch compatible work, and keep I/O off the main thread. The repository should expose a predictable source of truth and a clear retry policy.

```kotlin
@Query("SELECT id, name FROM users LIMIT :limit OFFSET :offset")
suspend fun loadUsers(limit: Int, offset: Int): List<UserRow>
```

---

## How do you analyze and optimize Android app startup, especially cold start?

Measure cold, warm, and hot startup with Macrobenchmark and production telemetry. Inspect initialization and the main-thread trace, remove or defer noncritical work, avoid synchronous I/O, and validate the result with the same startup flow.

---

## How do you diagnose and eliminate UI jank?

Use frame timing, Perfetto, CPU Profiler, Layout Inspector, and Compose tooling to find long main-thread work, expensive layout or composition, image decoding, and large-list rendering. Fix the measured bottleneck and compare frame metrics before and after.

---

## How do you detect memory leaks in production-scale apps?

Look for retained Activities, Fragments, views, callbacks, and long-lived jobs after lifecycle destruction. Reproduce navigation cycles with heap dumps and LeakCanary, inspect retained paths, fix ownership or cancellation, and monitor memory and OOM trends after rollout.

---

## How does Android OS manage background work, and why do background limits exist?

Android schedules background work based on app state, device state, battery, and user visibility. Limits exist to prevent apps from keeping the CPU, radio, and sensors active continuously. Use lifecycle-aware and constraint-aware APIs instead of assuming immediate execution.

---

## Explain Doze Mode and App Standby. How do they differ?

Doze Mode reduces background activity when the device is unused and stationary. App Standby limits apps that the user has not recently used. Both defer non-urgent work, but Doze is primarily device-state based while App Standby is primarily app-usage based.

---

## WorkManager vs Foreground Service vs AlarmManager: when to use what?

- Use WorkManager for deferrable, persistent work with constraints.
- Use a Foreground Service only for user-visible work that must continue immediately, with an ongoing notification.
- Use AlarmManager for precise time-based alarms when the use case truly requires an alarm.

```kotlin
val request = OneTimeWorkRequestBuilder<SyncWorker>()
    .setConstraints(
        Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()
    )
    .build()
```

---

## What are common background execution limit violations in production apps?

Common violations include starting an unbounded background service, doing long work from a receiver, scheduling frequent alarms, polling continuously, and starting a foreground service without a clear user-visible reason. Replace these with WorkManager, bounded work, push messaging, or a correctly scoped foreground service.

---

## How should push notifications be optimized for battery?

Use push messages for events instead of frequent polling. Batch non-urgent synchronization, avoid high priority unless the user must be notified immediately, and do only small work from the message callback. Schedule larger work with WorkManager.

---

## Location and sensor usage: what kills battery fastest?

High-frequency location updates, continuous high-accuracy tracking, frequent sensor sampling, and scans that never stop are expensive. Match accuracy and frequency to the user-visible feature, stop updates when they are no longer needed, and use batching where possible.

```kotlin
fusedLocationClient.removeLocationUpdates(locationCallback)
```

---

## How does network batching and scheduling reduce battery drain?

Each radio wake-up has setup and tail energy cost. Batching compatible requests reduces wake-ups, and scheduling work with network and charging constraints avoids unnecessary retries and radio activity.

---

## What are the most dangerous battery anti-patterns seen in real apps?

- Frequent polling instead of push or scheduled sync.
- Unbounded location or sensor listeners.
- Repeated wake locks.
- High-priority notifications for ordinary events.
- Retry loops without backoff.
- Work that ignores Doze and connectivity constraints.

---

## Q: Why is WorkManager preferred even if execution timing is unpredictable?

WorkManager is preferred for deferrable work because it persists work across process death and lets Android schedule it according to constraints and battery state. Exact timing is not guaranteed, so it should not be used for work that must happen at a precise instant.

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

## Why does BLE require a GATT operation queue?

Most GATT operations are asynchronous and should be serialized per connection. A queue prevents overlapping reads, writes, and descriptor operations from producing unreliable callbacks or platform errors.

```kotlin
private val queue = ArrayDeque<() -> Unit>()

fun enqueue(operation: () -> Unit) {
    queue.add(operation)
    if (queue.size == 1) operation()
}
```

---

## What is GATT error 133 and how do you handle it?

Error 133 is a generic Android GATT failure rather than one precise root cause. I close the connection, avoid overlapping operations, wait briefly before retrying, and collect device, OS, RSSI, and connection-state telemetry. Repeated failures should use bounded retry and a clean reconnect path.

---

## How do you design BLE for scalability (multiple devices)?

Give each device its own connection state, operation queue, callback, timeout, and retry policy. Limit simultaneous connections according to device capability and expose a per-device state stream to the UI.

---

## How do you convert BLE callbacks into reactive streams?

Wrap callbacks in `callbackFlow`, close the flow when the connection is released, and use `awaitClose` to unregister callbacks. This gives collection and cancellation a clear lifecycle.

```kotlin
fun notifications(
    register: (BluetoothGattCallback) -> Unit,
    unregister: (BluetoothGattCallback) -> Unit
): Flow<ByteArray> = callbackFlow {
    val callback = object : BluetoothGattCallback() {
        override fun onCharacteristicChanged(
            gatt: BluetoothGatt,
            characteristic: BluetoothGattCharacteristic,
            value: ByteArray
        ) {
            trySend(value)
        }
    }
    register(callback)
    awaitClose { unregister(callback) }
}
```

---

## How do you handle lifecycle safely?

The connection owner should have a lifecycle longer than the screen only when the product requires it. Cancel collection and remove callbacks when the owner is destroyed, and never retain an Activity or Fragment in a long-lived BLE manager.

---

## How do notifications work internally?

The central subscribes by writing the Client Characteristic Configuration Descriptor on the peripheral. The peripheral then sends characteristic updates asynchronously; the app receives them through `BluetoothGattCallback`.

---

## Difference between Notify vs Indicate?

Notify sends updates without a link-layer acknowledgement and is faster. Indicate requires acknowledgement and is more reliable but slower. Use Indicate when delivery confirmation matters and Notify when throughput is more important.

---

## How do you handle large data transfer?

Negotiate a suitable MTU, split the payload into chunks, include sequence information when needed, and acknowledge or retry chunks at the application layer. Reassemble only after validating ordering and completeness.

```kotlin
gatt?.requestMtu(247)
```

---

## Why BLE behaves differently on different devices?

Android BLE behavior depends on chipset, vendor firmware, Android version, permissions, Bluetooth state, and peripheral implementation. Test representative devices, add timeouts and retries, and collect structured connection telemetry instead of assuming one device defines platform behavior.

---

## How do you debug BLE issues in production?

Record sanitized state transitions, operation names, status codes, timing, device model, Android version, MTU, and retry count. Reproduce with Bluetooth HCI snoop logs when available, and correlate failures with firmware and device versions.

---

## How do you secure BLE communication?

Do not treat BLE pairing alone as application authorization. Authenticate the device, protect sensitive payloads with an application-level protocol when required, validate nonces or counters, and reject unexpected device identities or message formats.

---

## What causes memory leaks in BLE?

Common causes are a manager retaining an Activity, callbacks not being cleared, repeated `BluetoothGatt` objects, and flows or coroutines surviving their owner. Close the GATT, unregister callbacks, cancel jobs, and keep only application-safe references.

---

## How do you ensure reliability?

Serialize operations, add timeouts, retry only bounded and recoverable failures, reconnect cleanly, validate payloads, and make the state machine explicit. The UI should observe state rather than infer connection status from one callback.

---

## How would you design BLE for testability?

Hide Android Bluetooth classes behind interfaces, inject a clock and dispatchers, and test the state machine with a fake adapter. Test disconnects, timeouts, retries, malformed data, and cancellation without requiring a physical device for every unit test.

---

## What are the biggest real-world issues you faced?

The most common issues are vendor-specific disconnects, GATT error 133, overlapping operations, incomplete packets, background restrictions, stale callbacks, and battery drain. I address them with an explicit state machine, serialized operations, bounded retries, lifecycle ownership, and production telemetry.

---

## Devices disconnect randomly. How do you debug and fix it?

I would log the complete connection state sequence, status code, timing, device model, RSSI, and operation in progress. Then I would check Bluetooth state, distance, firmware, permissions, concurrent GATT operations, and lifecycle cancellation before applying a bounded reconnect with backoff.

```kotlin
if (newState == BluetoothProfile.STATE_DISCONNECTED) {
    gatt.close()
    scheduleReconnectWithBackoff()
}
```

---

## BLE scan works on some devices but not others. Why?

Differences commonly come from Android version, runtime permissions, location or Bluetooth state, vendor behavior, and scan settings. Check the required permissions for the device version, verify Bluetooth is enabled, stop scans when finished, and test on representative devices.

---

## Why are you receiving incomplete BLE data?

A characteristic notification may contain only one packet of a larger application message. Respect the negotiated MTU, accumulate chunks, use length or sequence metadata, and emit the message only after reassembly is complete.

---

## BLE drains battery. How do you optimize?

Stop scanning and notifications when they are not needed, avoid continuous reconnect loops, reduce connection and polling frequency, use suitable connection priorities, and batch data. Measure radio activity and wakeups before and after the change.

---

## Why BLE callbacks cause bugs?

Callbacks arrive asynchronously and may be delayed, duplicated, or delivered after a screen has gone away. Route them through one state owner, serialize operations, check the current connection, and cancel or ignore callbacks after cleanup.

---

## Why BLE slow?

BLE is optimized for low power rather than high throughput. Small MTU, acknowledged writes, connection intervals, notification frequency, radio interference, and application-level delays can all reduce speed. Measure each stage before changing parameters.

---

## What is GATT 133 and how do you fix it?

GATT 133 is a generic Android Bluetooth failure. Fix the connection lifecycle first: close stale GATT objects, serialize operations, wait before reconnecting, use bounded retries, and collect device-specific diagnostics rather than assuming one universal cause.

---

## How do you manage multiple BLE connections?

Maintain independent state, queues, callbacks, timeouts, and retry policies for each device. Limit concurrency based on device capability and prevent one device's failure from corrupting another device's state.

---

## How do you keep BLE working in background?

Use a lifecycle appropriate to the product requirement. For an ongoing user-visible connection, use a correctly declared foreground service; for deferrable synchronization, use WorkManager. Stop work and release resources when the feature no longer needs the connection.

---

## How do you make BLE reliable?

Use an explicit connection state machine, serialized GATT operations, timeouts, bounded retries, clean reconnects, payload validation, and production telemetry. Do not infer reliability from a single successful callback.

---

## How would you design BLE module?

Separate scanning, connection management, GATT operations, protocol parsing, state, and UI adapters. Hide Android Bluetooth classes behind interfaces so the state machine can be unit-tested with fakes.

---

## What is MTU?

MTU is the maximum transmission unit negotiated for an ATT packet. A larger MTU can reduce application-level fragmentation, but the usable payload is smaller than the negotiated value because protocol bytes are reserved.

---

## What is GATT vs GAP?

GAP describes discovery, advertising, roles, and connection behavior. GATT describes the data model and operations used after connection, including services, characteristics, descriptors, reads, writes, and notifications.

---

## What is Characteristic vs Service?

A service groups related functionality. A characteristic is a value inside that service with properties such as read, write, notify, or indicate.

---

## Indication vs Notification?

Notification is sent without an application-level acknowledgement from the central. Indication requires acknowledgement and is slower but provides stronger delivery confirmation.

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

## What should fail a PR?

A PR should fail for compilation errors, unit-test failures, lint or static-analysis failures, security-scan failures, and important instrumentation-test failures. Coverage should support meaningful tests rather than being enforced as an arbitrary number.

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

## How would you integrate an LLM into automated review?

Run the LLM after the diff, tests, lint, and security checks are available. Give it the changed files, relevant surrounding code, project rules, and test results. Treat its output as review suggestions, require human ownership of the decision, and never send secrets or unnecessary production data to the model.

```text
Pull Request
 ↓
Build + tests + static analysis
 ↓
LLM review of the diff and failures
 ↓
Human review
 ↓
Merge or request changes
```

---

## What should an LLM review and what should remain human-owned?

An LLM can point out missing tests, suspicious edge cases, duplicated logic, unsafe API usage, and deviations from documented conventions. Humans must own requirements, security risk acceptance, architecture decisions, privacy, and whether the change is safe to release.

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

## Where can AI help?

AI can help with refactoring, unit-test generation, boilerplate, documentation, code explanation, migration assistance, and bug investigation. The generated result still needs human review and validation.

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

## AI generates code that stores a token in SharedPreferences. What do you do?

I would not merge it directly. I would identify the security issue, replace it with an approved secure-storage approach, add tests, run static and security checks, and review whether the generated code introduced any other security concerns.

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

## How do you lead a moderately complex initiative?

I would understand the requirements, identify technical risks, design the architecture, break the work into deliverables, align with stakeholders, implement the critical pieces, support code review and mentoring, test the result, release it safely, and monitor it in production.

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

## How do you perform a Pull Request (PR) review?

I categorise my review comments into four buckets:

  * Architecture — SOLID, Clean Architecture, scalability, maintainability.
  * Functionality — Missing business logic, edge cases, incorrect implementation.
  * Coding Standards — Naming, formatting, Kotlin best practices, readability.
  * Documentation — Missing KDocs, README updates, copyright headers, comments.

My review strategy

  * If major functionality is missing but architectural improvements are relatively small, I recommend finishing the functionality first (especially if the PR is blocking a release), merging it, and taking architecture improvements as a separate refactoring task.
  * If architectural issues affect the core implementation, I recommend addressing architecture first since functionality built on a poor design usually creates more technical debt.
  * Syntax, formatting, documentation and copyright changes are usually lightweight and should be completed within the same PR.

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

## Two requests update the same account data. How do you handle it?

Use a single source of truth and coordinate updates through the repository. Depending on the requirement, use database transactions and optimistic or pessimistic concurrency. The server must enforce consistency, and the UI should not display stale state as the final result.

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

## How do you handle pressure and deadlines?

I clarify the outcome, separate must-have work from nice-to-have work, make risks visible early, and agree on a realistic plan with stakeholders. I keep quality gates for security and correctness, while reducing scope or sequencing work when the deadline cannot move.

---

## How do you ensure code quality in a large team?

I use clear conventions, automated build and test checks, focused PR reviews, ownership boundaries, documentation for important decisions, and monitoring after release. Quality should be part of the development workflow rather than a final manual step.

---

## How do you prioritize technical debt?

I prioritize debt by user impact, security and reliability risk, delivery cost, and how much it slows future work. I make the trade-off visible, connect the work to a measurable outcome, and schedule small improvements alongside feature delivery when possible.

---

## How do you handle underperforming team members?

I first understand whether the issue is clarity, skill, workload, or support. I agree on specific expectations and a time-bound improvement plan, provide coaching and feedback, and involve the appropriate manager or process when the problem continues.

---

## Why do you want to move into a Lead role?

I want to increase my impact through technical direction, better decisions, mentoring, and alignment across teams. A Lead role is not only about making architectural choices; it also requires ownership of delivery, communication, and team growth.

---

## What if your team ignores your technical suggestion?

I would understand the concerns, explain the trade-offs with evidence, and invite alternatives. If the team chooses another reasonable approach, I commit to the decision and help make it successful. I escalate only when there is a material risk to users, security, or delivery.

---

## How do you handle ambiguity?

I clarify the desired outcome, identify assumptions and unknowns, speak with the relevant stakeholders, and choose a small step that produces useful feedback. I document decisions and revisit them when new information changes the trade-off.

---

## What makes a strong engineering team?

A strong team has shared goals, psychological safety, clear ownership, useful feedback, reliable engineering practices, and accountability for outcomes. People should be able to disagree respectfully, learn from failures, and deliver without depending on one person.

---

## What kind of leader are you?

I am a calm, outcome-focused, and transparent leader. I provide context, make decisions when needed, give people ownership, remove blockers, and stay accountable for both technical quality and team delivery.
