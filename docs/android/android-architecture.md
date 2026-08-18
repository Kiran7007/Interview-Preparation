# Android Architecture, Testing & Patterns — Senior

## Architecture (MVVM, MVP, MVI, Clean, DI, Compose)

---

### Question

Why use **MVP / MVVM / MVI** instead of “god Activities”?

### Answer

When all logic lives inside huge **Activities**, tests are painful, reviews are noisy, and teams step on each other. Splitting **UI**, **presentation logic**, and **data** makes changes safer and lets you **unit test** without spinning up the full framework.

The cost is more **files and wiring**—and **MVI** can feel heavy on small screens. Pick a style that matches team size and how complex the screen state really is.

**Example:** A banking app keeps payment rules out of Activities so compliance-friendly tests can run on the JVM without Espresso for every rule.

### Key takeaway

> Good architecture gives you **test seams** and **clear boundaries** between UI and logic.

---

### Question

Why should the **View be an interface in MVP**?

### Answer

The **presenter** talks to the **view through an interface** (what to show, which errors to display) instead of holding a concrete `Activity`. That makes it easy to **fake the view in tests** and to swap implementations (phone vs tablet, or later **Compose**).

The downside is another layer: the interface must describe **user-facing intents**, not random widget methods, or it becomes useless.

### Key takeaway

> **Depend on abstractions** so the presenter can be tested without a real screen.

---

### Question

**MVC vs MVP vs MVVM vs MVI** — compare as a tech lead.

### Answer

- **MVC:** On Android the “controller” often collapses into the Activity, so **view and logic stay tangled**—hard to test.
- **MVP:** The **presenter** sits in the middle; the view is dumb. Strong **test story** for presentation rules.
- **MVVM:** **ViewModel** holds UI-ready state; views observe. Survives **configuration changes** when scoped correctly. Less “presenter calls view” glue.
- **MVI:** One **state tree** and **reducers/events**—great when many things update the same screen, more **ceremony** for simple forms.

### Useful links

- MVI: https://proandroiddev.com/android-model-view-intent-with-kotlin-flow-ca5945316ec  

### Key takeaway

> **MVVM (+ clear state)** fits most new apps; **MVI** when shared screen state gets hard to reason about.

---

### Question

**Repository pattern** in MVVM — what does “good” look like (and what is a dump class)?

### Answer

A **repository** is the **boundary** between **domain/UI-facing** APIs and **data sources** (network, Room, DataStore). It **chooses** cache vs remote, maps **DTO → domain**, and hides Retrofit/Room types from the **ViewModel**. A **bad** repository is a thin **pass-through** of API responses or **god object** that knows about **Activities**.

**Fintech note:** keep **token refresh** and **raw credentials** in the **data layer**; expose **safe** domain results (success / auth required / network error) to the **ViewModel**—the UI should not see **Bearer** strings.

### Code example

```kotlin
class AccountRepository(
    private val api: AccountApi,
    private val dao: AccountDao,
) {
    suspend fun getAccount(): Account =
        dao.getAccount() ?: api.fetchAccount().also { dao.insert(it) }
}
```

### Key takeaway

> Repository = **policy + mapping**, not “where we called Retrofit.”

---

### Question

**MVVM** — common mistakes and **one-time events** (navigation, toast)?

### Answer

**Mistakes:** **fat ViewModels** (parsing JSON, Android APIs), many **uncoordinated** `LiveData`s per screen, using ViewModel as **long-term cache** for everything, holding **`Activity` Context**, leaking **jobs**. Prefer **one `UiState` data class** (or sealed hierarchy) per screen and **`StateFlow`** with **`update { it.copy(...) }`** for UDF.

**One-time events:** **`SharedFlow`**, **`Channel`**, or **event state** consumed once—avoid **`LiveData`** `postValue` hacks for “fire once” navigation; be explicit about **replay** and **collection** in Compose.

### Key takeaway

> MVVM fails from **layer leaks** and **split brain state**—not from the **label** on the slide.

---

### Question

How do you **test** MVVM in the **pyramid** (without duplicating Espresso everywhere)?

### Answer

**Most:** `runTest` + **fake repos** + **`StandardTestDispatcher`** for **ViewModel** and use cases. **Some:** Room **in-memory** or **MockWebServer** integration. **Little:** Espresso/Compose for **critical** journeys. If dependencies are **injected**, tests stay **fast** and **deterministic**.

### Code example

```kotlin
@Test
fun loginSuccess() = runTest {
    val fake = FakeAuthRepository(Result.success(Unit))
    val vm = LoginViewModel(fake)
    vm.login("a@b.com", "x")
    assertTrue(vm.uiState.value.success)
}
```

### Key takeaway

> **Injectable graph** = MVVM you can actually **prove** in CI.

---

### Question

What is the **role of Presenter in MVP** and **advantage of MVVM over MVP**?

### Answer

In **MVP**, the **presenter** handles user actions, talks to the model, and tells the **view interface** what to render. Some teams also put **navigation** decisions there.

**MVVM** usually means the **ViewModel does not hold a reference to the view**, which **reduces leak risk** and fits **LiveData/Flow** observation. Rotation is easier when state lives in a **scoped ViewModel** instead of a presenter that must reattach.

### Key takeaway

> MVVM **decouples** the view more; you still need clear **domain** boundaries.

---

### Question

Why **Dependency Injection (Dagger/Hilt/Koin)** on large apps?

### Answer

Large apps need **clear ownership** of dependencies: who creates **Retrofit**, who gets a **user-scoped** object, what lives for one **Activity** vs the whole app. **DI** (Dagger/Hilt compile-time, Koin runtime) wires that graph instead of `new` everywhere.

**Trade-off:** compile-time graphs catch mistakes early but need **build time**; runtime DI is flexible but errors may appear **at runtime**.

**Example:** Swap a **payment SDK** implementation in QA builds using test modules and bindings.

### Useful links

- https://www.codeproject.com/Articles/592372/Dependency-Injection-DI-vs-Inversion-of-Control-IO  

### Key takeaway

> DI keeps **feature flags, test doubles, and SDK swaps** manageable as the app grows.

---

### Question

Explain **Jetpack Architecture Components** and how **Room / LiveData / ViewModel / Lifecycle / Data Binding** fit together.

### Answer

- **Room:** SQLite with **compile-time checks** and **migrations**—your local source of truth for structured data.
- **LiveData:** Observes data and respects **lifecycle** (stops when the screen is gone). On new Kotlin codebases many teams prefer **Flow** with explicit collection rules.
- **ViewModel:** Holds **UI state and use cases** for a scope (often a Fragment/Activity); **survives rotation** when scoped correctly.
- **Lifecycle:** Common vocabulary for **when** to start and stop work (observers, `LifecycleOwner`).
- **Data / View binding:** Less findViewById glue; **view binding** is simpler if you do not need two-way binding or expressions in XML.

### Useful links

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

### Key takeaway

> Typical modern stack: **Room + ViewModel + coroutines/Flow + lifecycle-aware collection**.

---

### Question

How does **ViewModel** work internally (high level) and why not put `Context` in it?

### Answer

A **ViewModel** is stored in a **ViewModelStore** tied to a lifecycle owner (Activity, Fragment, or navigation back stack entry). It is **cleared** when that scope is **finished for good**—not on every **rotation**.

Putting an **Activity `Context`** in a ViewModel is risky: the ViewModel can **outlive** the Activity configuration, which **leaks** the old Activity. Use **`Application`** context only for truly app-wide things, and prefer **Hilt/AndroidEntryPoint** patterns over stashing contexts.

### Useful links

- https://blog.mindorks.com/android-viewmodels-under-the-hood  

### Key takeaway

> Treat ViewModel as **state + coordinators**, not as another **Activity helper**.

---

### Question

**LiveData vs ObservableField** and **`setValue` vs `postValue`**

### Answer

**ObservableField** comes from the **data binding** era; it still works but is less **lifecycle-aware** than **LiveData**.

- **`setValue`:** must run on the **main thread**; updates observers immediately.
- **`postValue`:** safe from **background** threads—it posts the update to the main thread. Calling **`postValue` many times in a row** can mean **only the last value** is delivered (coalescing), which surprises people in tests.

### Useful links

- https://blog.mindorks.com/livedata-vs-observable-in-android  
- https://medium.com/@shashankmohabia/livedata-setvalue-vs-postvalue-91ec550b4c80  

### Key takeaway

> On coroutine-first code, **StateFlow** plus clear **main vs background** rules is often simpler.

---

### Question

**StateFlow vs LiveData** (and when either is wrong)

### Answer

**StateFlow** is Kotlin-first and works naturally with **coroutines**; it **always has a current value**. You must **collect** it with lifecycle in mind (`repeatOnLifecycle`, etc.) so you do not leak or run work when the screen is off.

**LiveData** is **lifecycle-aware** out of the box and is still useful for **Java** interop.

### Useful links

- https://scalereal.com/android/2020/05/22/stateflow-end-of-livedata.html  

### Key takeaway

> When collecting **Flow**, use **`repeatOnLifecycle`** (or equivalent) so work stops when the UI is not active.

---

### Question

**SOLID on Android** — give concrete examples.

### Answer

**SOLID** is five design habits (single responsibility, open/closed, Liskov substitution, interface segregation, dependency inversion). On Android you see them in **feature modules**, **repository interfaces** hiding Room vs network, and **navigation** boundaries so one team does not own the whole graph.

### Useful links

- https://www.coderefer.com/blog/solid-principles-in-android-with-kotlin-examples/  

### Key takeaway

> SOLID is less about buzzwords and more about **smaller, testable pieces** and fewer merge fights.

---

### Question

**Jetpack Compose** — declarative UI, recomposition, state, navigation, performance, testing

### Answer

**Compose** builds UI from **`@Composable`** functions that describe the screen from **state**. When state changes, Compose **recomposes** (re-runs) the affected parts of the tree—not the whole app.

- **State:** `remember` / `rememberSaveable` for local UI; **ViewModel + StateFlow** for screen truth. Keep **business rules** out of composables when possible.
- **Modifiers:** Ordered chains describe layout, clicks, semantics—order matters.
- **Interop:** `AndroidView` / `ComposeView` bridges **Views** and **Compose**.
- **Navigation:** Navigation-Compose with **routes** and **deep links**.
- **Performance:** Stable parameters, **keys** in lazy lists, **`derivedStateOf`**, and **recomposition counts** in debug.
- **Side effects:** `LaunchedEffect`, `DisposableEffect`, `SideEffect` tie work to lifecycle.
- **Theming:** `MaterialTheme` and composition locals.
- **A11y:** semantics, content descriptions, focus order.
- **Testing:** Compose test APIs and **semantics** (prefer **`testTag`** discipline).

**Example:** Migrate a payments SDK screen to Compose behind **screenshot tests** so regressions are visible.

### Key takeaway

> Compose works best when **state ownership is obvious** and **side effects** are explicit—not hidden in random composables.

---

### Question

**Dagger 2** annotations: `@Component`, `@Module`, `@Provides`, `@Binds`, `@Inject`, `@Scope`, `@Qualifier/@Named`, `@BindsInstance`

### Answer

- **`@Component`:** Root of the object graph; Dagger generates **`DaggerYourComponent`**.
- **`@Module`:** Methods that **provide** or **bind** dependencies. **`@Binds`** for interfaces (implementation class), **`@Provides`** for construction you control.
- **`@Inject`:** Marks **constructor / field / method** injection sites.
- **`@Scope`:** Ties lifetime to a scope (`@Singleton`, custom feature scope).
- **`@Qualifier` / `@Named`:** Tell two bindings of the **same type** apart (`@Named("prod")`).
- **`@BindsInstance`:** Pass **runtime values** (e.g. `userId`) into the builder—powerful but easy to make **tests** painful if overused.

**Service locator** (global `getX()`) is harder to test than **constructor injection**.

### Useful links

- https://stackoverflow.com/a/980616/3424919  
- https://github.com/user-attachments/assets/dbce5c43-8ec4-4143-a68c-28462d5442d7  

### Key takeaway

> If the **graph is hard to test**, your **scopes** or **modules** are probably wrong.

---

### Question

**Factory vs Abstract Factory** (and when neither belongs in Android UI)

### Answer

A **factory** creates **one kind of object**. An **abstract factory** creates **families** of related objects (think UI toolkits).

On Android you more often use **DI** or simple builders than textbook factories inside every Fragment—save factories for **SDK boundaries** and **test doubles**.

### Useful links

- https://www.journaldev.com/1418/abstract-factory-design-pattern-in-java  
- https://www.baeldung.com/kotlin/builder-pattern  

### Key takeaway

> Use factories at **integration boundaries** and in **tests**, not as wallpaper in UI code.

---

### Question

**Adapter pattern (non-UI)** on Android integrations

### Answer

Wrap a **third-party SDK** behind **your own interface**. When the vendor changes APIs or you swap vendors, you change **one adapter** instead of every call site.

**Example:** An **analytics** interface with implementations for Firebase vs an internal pipeline.

### Key takeaway

> Adapters are **insurance** when external SDKs churn.

---

### Question

**Singleton `getInstance()`** — synchronize whole method vs double-checked locking?

### Answer

Synchronizing the **entire `getInstance()`** is simple but can be slow under contention. **Double-checked locking** with a **`volatile`** field is the usual **lazy** singleton pattern.

On Android, **prefer DI scopes** (singleton in the graph) instead of hand-rolled globals.

### Key takeaway

> Prefer **scoped singletons from DI** over static **`getInstance()`** everywhere.

---

### Question

Why do people call **Android** (or a classic Android app) **“monolithic”** in system-design or staff interviews?

### Answer

- **In plain words:** **Platform sense:** Android is often described as a **monolithic stack**—**Linux kernel + HAL + framework + system services** shipped as one **coherent platform**, not a microkernel where every driver is a tiny isolated service. **App sense:** a **single-module APK**, one **Gradle project**, and **Activities** holding **too much logic** is called a **monolithic app** (hard to scale teams, test, or ship incrementally).
- **How it works:** The **framework** couples **UI, lifecycle, IPC, permissions** in one world; teams fight **monolith pain** with **feature modules**, **Clean layers**, **multi-module Gradle**, **dynamic features**, and **stricter boundaries**.
- **What to watch for:** Interviewers may mean **either** OS architecture **or** app modularity—**clarify** which “monolith” they mean before answering.
- **Example:** Move from **god Activities** to **modules per feature** + **shared core**; keep **IPC boundaries** explicit (`AIDL`, **content providers**, **app links**).

### Key takeaway

> **“Monolithic Android”** is usually about **tight platform coupling** or **under-modularized apps**—answer **which layer** you’re discussing.

## Testing (Unit, Integration, UI, Compose)

---

### Question

Explain the **test pyramid** on mobile.

### Answer

Most tests should be **fast unit tests** (pure logic, ViewModels with fakes). Fewer **integration tests** hit real **Room**, **Retrofit + MockWebServer**, or navigation. **UI tests** (Espresso / Compose) are the smallest top—slow and flaky if overused—save them for **critical flows** and run on **labs** for OEM quirks.

Diagram: `assets/test_pyramid.png`

### Key takeaway

> A **top-heavy** pyramid means **slow CI** and **flaky nights**.

---

### Question

What does **unit testing** accomplish in CI?

### Answer

Unit tests run on **every PR** and catch **regressions** in logic before merge. They also make **refactors** safer because you have a **safety net** when behavior is specified.

### Key takeaway

> Unit tests are **cheap insurance** for change.

---

### Question

**Espresso** architecture — how does it stay in sync without `Thread.sleep()`?

### Answer

Espresso is **white-box** instrumentation: tests run **in-process** with the app. Before **ViewActions** and **ViewAssertions**, it waits until the **main looper** is **idle** and built-in hooks (legacy **AsyncTask**, **Loader** idling, etc.) say the framework is quiet—so you do not poll or sleep. That is why it is **fast** when async is visible to the main thread; **custom** async (Retrofit, Rx, coroutines on other threads, WorkManager) is **not** waited for automatically.

**Flow:** `onView(matcher)` → wait for **idle** → `perform` / `check`.

### Code example

```kotlin
onView(withId(R.id.login_button)).perform(click())
onView(withText("Welcome")).check(matches(isDisplayed()))
```

### Useful links

- https://developer.android.com/training/testing/ui-testing/espresso-testing.html  
- https://medium.com/mindorks/android-testing-part-1-espresso-basics  

### Key takeaway

> Espresso = **idle main thread + registered idling**—flakes mean **your work finished off-book**.

---

### Question

**ViewMatchers**, **ViewActions**, and ambiguous matches — what breaks?

### Answer

**Matchers** find views (`withId`, `withText`, `isDisplayed`, `withContentDescription`); **actions** interact (`click`, `typeText`, `scrollTo`); **assertions** validate (`matches(...)`). Combine **`allOf`**, **`withParent`**, or hierarchy constraints when **several** views match—otherwise Espresso throws **`AmbiguousViewMatcherException`**. Prefer **ids** and **content descriptions** over **volatile copy** when you can.

### Key takeaway

> Never “fix” ambiguity with **sleep**—**narrow the matcher**.

---

### Question

**Custom `IdlingResource`** — when do you need it, and when is it overkill?

### Answer

Use it when UI updates depend on work Espresso **does not** track: **OkHttp/Retrofit**, **coroutines** off main, **RxJava**, **handlers** on other threads. **`CountingIdlingResource`** (increment while busy, decrement when done) is the usual pattern—**register** in test setup and **unregister** after.

**Smell:** idling around **every** coroutine—couples tests to implementation and slows CI. Often better to inject a **fake repository** that returns immediately and assert **rendered state**, reserving idling for **true** integration boundaries.

### Code example

```kotlin
val idle = CountingIdlingResource("api")
IdlingRegistry.getInstance().register(idle)
idle.increment()
// trigger work; in production code: decrement when UI is updated / request completes
```

### Key takeaway

> **IdlingResource** answers “is the app still busy?”—prefer **fakes** when you only need **deterministic** UI.

---

### Question

**MVVM** — what belongs in **Espresso** vs **ViewModel unit tests**?

### Answer

**Unit-test** the **ViewModel** (and use cases) with **fakes**: state transitions, validation, error mapping. **Espresso** checks **what users see**: correct screen, errors, navigation—drive state via **Hilt test modules**, **`ActivityScenario`**, or **test-only** `ViewModel` factories. Avoid **mocking LiveData** “internals”; use a **real** observable with **controlled** emissions from fakes.

### Key takeaway

> **Logic** on the JVM; **pixels and flows** on device—with **injected** doubles, not **production** APIs.

---

### Question

**Mocking HTTP** for UI tests — recommended approach?

### Answer

**MockWebServer** enqueues **status codes**, **JSON bodies**, and **delays** so you exercise success, slow network, and errors **deterministically**. Keep fixtures in **`androidTest`** resources; never depend on **staging** availability for merge gates.

### Key takeaway

> UI tests should not need **Wi‑Fi** or **backend uptime**.

---

### Question

**Espresso in CI** — how do you keep runs reliable?

### Answer

Turn **animations off** (`adb shell settings put global window_animation_scale 0` etc. on the runner), use **stable** system images (**Gradle Managed Devices**, **Firebase Test Lab**), **shard** heavy suites, and run **full** `connectedCheck` **nightly** if PR time is tight. Capture **logcat** / screenshots on failure.

### Key takeaway

> **Animations + real network + shared state** = flaky pipelines—remove them **by policy**.

---

### Question

Common **Espresso** failures and anti-patterns?

### Answer

**Top causes:** missing sync for **real** async, **animations** on, **`Thread.sleep`**, **RecyclerView** binding races, **ambiguous** matchers, tests that **depend on order**. Replace sleeps with **idling**, **fakes**, or **architecture** fixes.

### Key takeaway

> **`Thread.sleep` in a UI test** is a **code-review fail** unless you document an impossible alternative (rare).

---

### Question

**Robolectric**

### Answer

**Robolectric** runs Android framework–ish code on the **JVM** quickly. Great for logic that sits **near** Android APIs without needing a device. It is still an **approximation**—know when you need a **real device** or emulator.

### Useful links

- http://robolectric.org/  

### Key takeaway

> Robolectric is **fast**, not **identical** to every device behavior.

---

### Question

**UI Automator**

### Answer

**UI Automator** drives UI **across apps** and **system screens** (settings, permissions). It is **slower** than Espresso—use for **true end-to-end** flows, not every screen.

### Useful links

- https://developer.android.com/training/testing/ui-testing/uiautomator-testing.html  

### Key takeaway

> Save UI Automator for **cross-app** journeys, not daily feature tests.

---

### Question

**Mockito** — why?

### Answer

**Mockito** builds **test doubles** so you can **stub** dependencies and **verify** interactions. On **Kotlin**, you may need the **inline mock maker** or prefer **MockK** for some patterns.

### Useful links

- http://site.mockito.org/  

### Key takeaway

> Mocks show **what you expect collaborators to do**—they document design.

---

### Question

**JUnit** on Android

### Answer

Use **JUnit 4 or 5** with AndroidX test **runners** and **rules** (temp files, instant apps where relevant). Pick **JUnit 5** when your toolchain supports it cleanly.

### Useful links

- https://devqa.io/junit-5-annotations/  

### Key takeaway

> Prefer **JUnit 5** when your build and plugins allow it.

---

### Question

**Screenshot testing**

### Answer

**Screenshot tests** catch **visual** regressions in CI. You need **stable fonts, locale, and timing** so images are comparable. Keep the **golden set small** or maintenance hurts.

### Useful links

- https://github.com/facebook/screenshot-tests-for-android  
- https://facebook.github.io/screenshot-tests-for-android/#getting-started  

### Key takeaway

> A **small, high-value** golden set beats screenshotting everything.

---

### Question

**Compose testing** — how is it different from Espresso?

### Answer

Compose tests use a **semantic tree** (roles, text, **`testTag`**) instead of **View IDs**. Synchronization differs from Espresso—follow **Compose testing** guidance (see `android-architecture.md`).

### Key takeaway

> Compose favors **semantic matchers**, not fragile **view hierarchy** IDs.

---

### Question (behavioral)

How do you test **MVP/MVVM/MVI** differently?

### Answer

- **MVP:** Fake the **view interface**; drive the **presenter**.
- **MVVM:** Assert **ViewModel outputs** (state, events) with fakes for repositories.
- **MVI:** Test **reducers** and **state transitions** as **pure functions** where possible.

### Key takeaway

> Architecture changes **what you fake** and **what you assert**.

---

## Real-World Scenario Interview Questions

---

### Question

**Scenario: Jetpack Compose Performance Issue — Excessive Recompositions**
Modern app fully built in Jetpack Compose. Users report: UI feels laggy during interactions, animations stutter, CPU spikes during scrolling. Recomposition count is very high; even small state updates trigger full-screen recomposition. Recent changes: shared UI state in ViewModel, large data objects passed to composables, multiple `collectAsState()` calls added. **How would you debug and fix?**

### Answer

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

**3. Fix State Design**

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

**b. Pass Only What Each Composable Needs** _(parameter stability)_
```kotlin
// Bad: pass the whole model — any field change recomposes this
@Composable fun ProductCard(product: Product) { ... }

// Good: pass only needed fields — more stable, narrower recomposition
@Composable fun ProductCard(name: String, price: String, imageUrl: String) { ... }
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

### Question

**Scenario: Deep Link Handling Breaking Navigation**
E-commerce app. Users report: deep links open the wrong screen, app crashes when opened via link, back navigation behaves incorrectly. App uses Navigation Component, multiple entry points (home, product, offer pages), some deep links have query params. **How would you fix?**

### Answer

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

**8. Testing Strategy — All Three Entry Points**
```kotlin
// Espresso deep link test
@Test fun deepLinkToProductOpensCorrectScreen() {
    val scenario = ActivityScenario.launch<MainActivity>(
        Intent(Intent.ACTION_VIEW, Uri.parse("https://yourapp.com/product/123"))
    )
    onView(withId(R.id.productTitle)).check(matches(isDisplayed()))
    Espresso.pressBack()
    onView(withId(R.id.homeScreen)).check(matches(isDisplayed())) // correct back stack
}
```
Test: app closed · app in background · app in foreground — each has different behavior.

### Key takeaway

> Deep links = **reconstruct correct app state, not just navigate to a screen**. Declare in nav graph, validate params, use `NavDeepLinkBuilder` for back stack, test all three entry scenarios.

---

### Question

**What is MVVM and what are its common mistakes?**

### Answer

**MVVM = Model → ViewModel → View**

| Layer | Responsibility | Android Component |
|-------|---------------|-------------------|
| **Model** | Data + business rules | Repository, Room, API |
| **ViewModel** | UI state + coordination | `ViewModel`, `StateFlow` |
| **View** | Render state, forward events | Activity, Fragment, Compose |

**Data flows one way:** View observes ViewModel state → ViewModel calls Repository → Repository returns data → ViewModel updates state → View redraws.

**Common Mistakes:**

| Mistake | Impact | Fix |
|---------|--------|-----|
| Fat ViewModel (parsing JSON, calling `Context` APIs) | Hard to test; couples to Android | Move to Repository/UseCase |
| Multiple independent `LiveData`/`StateFlow` per screen | Inconsistent state; hard to reason about | One `UiState` data class per screen |
| Holding `Activity` context in ViewModel | Memory leak across rotation | Use `Application` context or none |
| Using `LiveData` for one-time events (navigation, toast) | Events replayed on rotation | Use `Channel` or `SharedFlow(replay=0)` |
| ViewModel doing coroutine work without SupervisorJob | One failure cancels all work | Use `viewModelScope` (has SupervisorJob built in) |

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

### Key takeaway

> MVVM fails from **layer leaks** (logic in View, Android in ViewModel) and **split-brain state** (too many LiveDatas). Fix: one `UiState`, unidirectional data flow, events via `Channel`.

---

### Question

**What are SOLID principles and how do they apply in Android?**

### Answer

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