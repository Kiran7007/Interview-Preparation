# Android Architecture
---

### Why use **MVP / MVVM / MVI** instead of “god Activities”?
When all logic lives inside huge **Activities**, tests are painful, reviews are noisy, and teams step on each other. Splitting **UI**, **presentation logic**, and **data** makes changes safer and lets you **unit test** without spinning up the full framework.

The cost is more **files and wiring**—and **MVI** can feel heavy on small screens. Pick a style that matches team size and how complex the screen state really is.

**Example:** A banking app keeps payment rules out of Activities so compliance-friendly tests can run on the JVM without Espresso for every rule.

---

### What is the **role of Presenter in MVP** and **advantage of MVVM over MVP**?
In **MVP**, the **presenter** handles user actions, talks to the model, and tells the **view interface** what to render. Some teams also put **navigation** decisions there.

**MVVM** usually means the **ViewModel does not hold a reference to the view**, which **reduces leak risk** and fits **LiveData/Flow** observation. Rotation is easier when state lives in a **scoped ViewModel** instead of a presenter that must reattach.
---

### Why **Dependency Injection (Dagger/Hilt/Koin)** on large apps?
Large apps need **clear ownership** of dependencies: who creates **Retrofit**, who gets a **user-scoped** object, what lives for one **Activity** vs the whole app. **DI** (Dagger/Hilt compile-time, Koin runtime) wires that graph instead of `new` everywhere.

**Trade-off:** compile-time graphs catch mistakes early but need **build time**; runtime DI is flexible but errors may appear **at runtime**.
---

### Explain **Jetpack Architecture Components** and how **Room / LiveData / ViewModel / Lifecycle / Data Binding** fit together.
- Architecture: https://developer.android.com/topic/libraries/architecture/  
- Room: https://developer.android.com/topic/libraries/architecture/room  
- LiveData: https://developer.android.com/topic/libraries/architecture/livedata  
- ViewModel: https://developer.android.com/topic/libraries/architecture/viewmodel  
- Lifecycle: https://developer.android.com/topic/libraries/architecture/lifecycle  
- Data binding: https://developer.android.com/topic/libraries/data-binding/  
- Room article: https://medium.com/@anitaa_1990/5-steps-to-implement-room-persistence-library-in-android-47b10cd47b24  
- Room sample: https://github.com/anitaa1990/RoomDb-Sample  
- LiveData sample: https://github.com/anitaa1990/GameOfThronesTrivia  
- Data binding sample: https://github.com/anitaa1990/DataBindingExample  
- Room encryption: https://medium.com/vmware-end-user-computing/securing-a-room-database-with-passcode-based-encryption-82ec670961e  
- Data binding vs view binding: https://stackoverflow.com/questions/58040778/android-difference-between-databinding-and-viewbinding  
---

### How does **ViewModel** work internally (high level) and why not put `Context` in it?
A **ViewModel** is stored in a **ViewModelStore** tied to a lifecycle owner (Activity, Fragment, or navigation back stack entry). It is **cleared** when that scope is **finished for good**—not on every **rotation**.

Putting an **Activity `Context`** in a ViewModel is risky: the ViewModel can **outlive** the Activity configuration, which **leaks** the old Activity. Use **`Application`** context only for truly app-wide things, and prefer **Hilt/AndroidEntryPoint** patterns over stashing contexts.

- Useful links - https://blog.mindorks.com/android-viewmodels-under-the-hood  

---

### **LiveData vs ObservableField** and **`setValue` vs `postValue`**

**ObservableField** comes from the **data binding** era; it still works but is less **lifecycle-aware** than **LiveData**.

- **`setValue`:** must run on the **main thread**; updates observers immediately.
- **`postValue`:** safe from **background** threads—it posts the update to the main thread. Calling **`postValue` many times in a row** can mean **only the last value** is delivered (coalescing), which surprises people in tests.

### Useful links

- https://blog.mindorks.com/livedata-vs-observable-in-android  
- https://medium.com/@shashankmohabia/livedata-setvalue-vs-postvalue-91ec550b4c80  
---

### **StateFlow vs LiveData** (and when either is wrong)
**StateFlow** is Kotlin-first and works naturally with **coroutines**; it **always has a current value**. You must **collect** it with lifecycle in mind (`repeatOnLifecycle`, etc.) so you do not leak or run work when the screen is off.

**LiveData** is **lifecycle-aware** out of the box and is still useful for **Java** interop.

When collecting **Flow**, use **`repeatOnLifecycle`** (or equivalent) so work stops when the UI is not active.

- Useful links - https://scalereal.com/android/2020/05/22/stateflow-end-of-livedata.html  

---

### **Jetpack Compose** — declarative UI, recomposition, state, navigation, performance, testing
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
---

### **Dagger 2** annotations: `@Component`, `@Module`, `@Provides`, `@Binds`, `@Inject`, `@Scope`, `@Qualifier/@Named`, `@BindsInstance`
- **`@Component`:** Root of the object graph; Dagger generates **`DaggerYourComponent`**.
- **`@Module`:** Methods that **provide** or **bind** dependencies. **`@Binds`** for interfaces (implementation class), **`@Provides`** for construction you control.
- **`@Inject`:** Marks **constructor / field / method** injection sites.
- **`@Scope`:** Ties lifetime to a scope (`@Singleton`, custom feature scope).
- **`@Qualifier` / `@Named`:** Tell two bindings of the **same type** apart (`@Named("prod")`).
- **`@BindsInstance`:** Pass **runtime values** (e.g. `userId`) into the builder—powerful but easy to make **tests** painful if overused.
---

### **Factory vs Abstract Factory** (and when neither belongs in Android UI)
A **factory** creates **one kind of object**. An **abstract factory** creates **families** of related objects (think UI toolkits).

On Android you more often use **DI** or simple builders than textbook factories inside every Fragment—save factories for **SDK boundaries** and **test doubles**.

-- Useful links
- https://www.journaldev.com/1418/abstract-factory-design-pattern-in-java  
- https://www.baeldung.com/kotlin/builder-pattern  
---

###  Explain the **test pyramid** on mobile.
Most tests should be **fast unit tests** (pure logic, ViewModels with fakes). Fewer **integration tests** hit real **Room**, **Retrofit + MockWebServer**, or navigation. **UI tests** (Espresso / Compose) are the smallest top—slow and flaky if overused—save them for **critical flows** and run on **labs** for OEM quirks.

Diagram: `assets/test_pyramid.png`
---

### Common **Espresso** failures and anti-patterns?
**Top causes:** missing sync for **real** async, **animations** on, **`Thread.sleep`**, **RecyclerView** binding races, **ambiguous** matchers, tests that **depend on order**. Replace sleeps with **idling**, **fakes**, or **architecture** fixes.

- Key takeaway

> **`Thread.sleep` in a UI test** is a **code-review fail** unless you document an impossible alternative (rare).

---

### **Screenshot testing**
**Screenshot tests** catch **visual** regressions in CI. You need **stable fonts, locale, and timing** so images are comparable. Keep the **golden set small** or maintenance hurts.

- Useful links
- https://github.com/facebook/screenshot-tests-for-android  
- https://facebook.github.io/screenshot-tests-for-android/#getting-started  
---

### **Compose testing** — how is it different from Espresso?
Compose tests use a **semantic tree** (roles, text, **`testTag`**) instead of **View IDs**. Synchronization differs from Espresso—follow **Compose testing** guidance (see `android-architecture.md`).

- Key takeaway
> Compose favors **semantic matchers**, not fragile **view hierarchy** IDs.

---

## Real-World Scenario Interview Questions

---

### Jetpack Compose Performance Issue — Excessive Recompositions**
Modern app fully built in Jetpack Compose. Users report: UI feels laggy during interactions, animations stutter, CPU spikes during scrolling. Recomposition count is very high; even small state updates trigger full-screen recomposition. Recent changes: shared UI state in ViewModel, large data objects passed to composables, multiple `collectAsState()` calls added. **How would you debug and fix?**

Treat this as a **state architecture problem**, not a UI rendering problem. Compose performance is directly tied to how state is structured and consumed.

**1. Measure Recompositions Before Changing Code**
- **Layout Inspector** (Android Studio) → "Recomposition counts" view — shows how many times each composable recomposed in a session
- **Composition tracing** — `Trace` calls + Perfetto to see recompositions in system trace
- **CPU Profiler** — confirm CPU spikes correlate with scrolls/interactions
- Goal: identify *which* composables recompose, and whether it is **localized** (good) or **cascading** (bad)

**2. Identify Root Causes in This Scenario**

| Root Cause | Symptom |
|-----------|---------|
| Unstable/large objects as params | Composable recomposes even when data hasn't changed |
| Shared state causing global recomposition | Scroll one item → whole screen redraws |
| Multiple `collectAsState()` | Each emission triggers separate recomposition wave |
| Missing `remember` | Expensive object re-created every recomposition |
| Lambdas recreated in composable body | Child composables never skip even with same params |

### 3. Fix State Design**

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

### Key takeaway

> Compose recomposition problems = **state not scoped tightly enough + unstable parameters + single giant state object**. Fix: break state, annotate stability, combine flows in ViewModel, use `derivedStateOf` for derived reads.

---

### **Scenario: Deep Link Handling Breaking Navigation**
E-commerce app. Users report: deep links open the wrong screen, app crashes when opened via link, back navigation behaves incorrectly. App uses Navigation Component, multiple entry points (home, product, offer pages), some deep links have query params. **How would you fix?**
Treat this as a **navigation state reconstruction problem**. Deep links bypass normal user flow — the app must reconstruct a correct, coherent back stack from a cold or warm start.

**1. Understand the Three Deep Link Entry Scenarios**
Each behaves differently and must be tested separately:
- **Cold start (app not running):** App process created → deep link intent delivered → must construct full back stack
- **Warm start (app in background):** Existing task restored → deep link intent delivered → must navigate to correct destination
- **App already in foreground:** Current task active → `onNewIntent()` called → must navigate without duplicating back stack

**2. Validate Deep Link Declaration in Manifest**
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
- `autoVerify="true"` enables **App Links** (no disambiguation dialog on Android 6+)
- Without verified App Links, Android may show a chooser or open in browser

**3. Declare Deep Links in Navigation Graph**
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
- Navigation Component automatically constructs the back stack from `<deepLink>` declarations
- Argument types are validated at build time (Safe Args)

**4. Validate Parameters Before Navigation** _(prevent crashes)_
```kotlin
// In NavController / ViewModel: never trust raw deep link params
val productId = args.productId
if (productId.isBlank() || productId.length > 50) {
    // navigate to error screen or fallback to home
    findNavController().navigate(R.id.homeFragment)
    return
}
```
- Deep link URLs from notifications, SMS, or QR codes can be malformed or tampered
- Always validate: non-null, correct format, within expected range

**5. Fix Back Stack for Cold Start**
```kotlin
// NavDeepLinkBuilder: manually construct back stack for cold-start deep links
val pendingIntent = NavDeepLinkBuilder(context)
    .setGraph(R.navigation.nav_graph)
    .setDestination(R.id.productDetailFragment)
    .setArguments(bundleOf("productId" to productId))
    .createPendingIntent()
```
- `NavDeepLinkBuilder` adds Home → Category → Product to the back stack automatically
- User pressing Back from a cold-start deep link navigates correctly, not to empty task

**6. Handle `onNewIntent` for Foreground Case**
```kotlin
// MainActivity
override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    navController.handleDeepLink(intent)  // Navigation Component handles routing
}
```

**7. Avoid Duplicate Fragments on Back Stack**
```kotlin
// When navigating to deep link destination that may already be in stack
navController.navigate(deepLinkUri, NavOptions.Builder()
    .setPopUpTo(R.id.homeFragment, false)  // clear stack back to home first
    .build()
)
```

**One-time events pattern:**
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
---

### **What are SOLID principles and how do they apply in Android?**

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

### Key takeaway

> SOLID on Android = **testable boundaries** and **zero merge conflicts** between teams. DIP + Hilt is the most impactful pair: swap implementations without touching callers.

---
