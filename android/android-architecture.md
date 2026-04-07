# Android Architecture (MVVM, MVP, MVI, Jetpack, DI) — Senior

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
