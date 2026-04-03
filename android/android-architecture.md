# Android Architecture (MVVM, MVP, MVI, Jetpack, DI) — Senior

---

### Question

Why use **MVP / MVVM / MVI** instead of “god Activities”?

### Answer

- **Deep explanation:** Separate concerns for testability, merge velocity, and parallel team work; avoid lifecycle-tangled business rules.
- **Trade-offs:** More boilerplate without tooling; MVI can be heavy for simple screens.
- **Real-world example:** Banking apps isolating presentation from domain to pass compliance reviews + unit tests without Espresso.

### Key takeaway

> Architecture buys **test seams** and **change isolation**.

---

### Question

Why should the **View be an interface in MVP**?

### Answer

- Presenter depends on abstraction; enables JVM tests and alternate UIs (tablet/compose migration).
- **Trade-offs:** Extra indirection; still ensure interface reflects real user intents, not widgets.

### Key takeaway

> **Invert dependency** toward the presenter.

---

### Question

**MVC vs MVP vs MVVM vs MVI** — compare as a tech lead.

### Answer

- **MVC:** View + Controller coupling hurts testing on Android.
- **MVP:** Presenter mediates; view passive; good test story.
- **MVVM:** Data binding / observable state; ViewModel survives config; presenter-less.
- **MVI:** Single state reducer; great for complex UX, more ceremony.
- **Useful links / samples:**
  - MVP sample: https://github.com/anitaa1990/Inshorts  
  - MVVM sample: https://github.com/anitaa1990/Trailers  
  - MVI: https://proandroiddev.com/android-model-view-intent-with-kotlin-flow-ca5945316ec  

### Key takeaway

> Pick **MVVM+UDF** for most greenfield; **MVI** when state explosion demands it.

---

### Question

What is the **role of Presenter in MVP** and **advantage of MVVM over MVP**?

### Answer

- **Presenter:** orchestrates view events + model; decides navigation side-effects in some teams.
- **MVVM advantage:** ViewModel typically has **no view reference**—less leak risk, easier rotation handling with correct scope.

### Key takeaway

> MVVM reduces **view coupling**; still need clear domain boundaries.

---

### Question

Why **Dependency Injection (Dagger/Hilt/Koin)** on large apps?

### Answer

- **Inversion of control** for testability, scoping (`Singleton`, `@ActivityRetainedScoped`), and modular builds.
- **Trade-offs:** Compile-time graphs (Dagger) vs runtime DSL (Koin)—choose based on graph complexity and CI time budgets.
- **Real-world example:** Swap payment SDK implementation in QA builds via test modules.

### Useful links

- IoC discussion: https://www.codeproject.com/Articles/592372/Dependency-Injection-DI-vs-Inversion-of-Control-IO  

### Key takeaway

> DI is how you keep **feature flags + SDK swaps** sane.

---

### Question

Explain **Jetpack Architecture Components** and how **Room / LiveData / ViewModel / Lifecycle / Data Binding** fit together.

### Answer

- **Room:** typed persistence + migrations + (optional) encryption.
- **LiveData:** lifecycle-aware observer (prefer Flow in greenfield).
- **ViewModel:** UI state + survives config change when scoped correctly.
- **Lifecycle:** repeatable startup/teardown contracts.
- **Data/View Binding:** reduces boilerplate; view binding is simpler when you don’t need two-way binding.
- **Official docs:**
  - Architecture: https://developer.android.com/topic/libraries/architecture/  
  - Room: https://developer.android.com/topic/libraries/architecture/room  
  - LiveData: https://developer.android.com/topic/libraries/architecture/livedata  
  - ViewModel: https://developer.android.com/topic/libraries/architecture/viewmodel  
  - Lifecycle: https://developer.android.com/topic/libraries/architecture/lifecycle  
  - Data binding: https://developer.android.com/topic/libraries/data-binding/  
- **Samples:**
  - Room article: https://medium.com/@anitaa_1990/5-steps-to-implement-room-persistence-library-in-android-47b10cd47b24  
  - Room sample: https://github.com/anitaa1990/RoomDb-Sample  
  - LiveData sample: https://github.com/anitaa1990/GameOfThronesTrivia  
  - Data binding sample: https://github.com/anitaa1990/DataBindingExample  
  - Room encryption: https://medium.com/vmware-end-user-computing/securing-a-room-database-with-passcode-based-encryption-82ec670961e  
  - Data binding vs view binding: https://stackoverflow.com/questions/58040778/android-difference-between-databinding-and-viewbinding  

### Key takeaway

> Modern stack = **persistence + structured concurrency + lifecycle-aware collection**.

---

### Question

How does **ViewModel** work internally (high level) and why not put `Context` in it?

### Answer

- **Internal:** `ViewModelStore` + `SavedStateHandle` + factory; cleared when owner scope ends (not on rotation).
- **Context risk:** memory leaks + testability; use `Application` context only for app-scoped dependencies via Hilt if truly needed.
- **Useful link:** https://blog.mindorks.com/android-viewmodels-under-the-hood  

### Key takeaway

> ViewModel is a **state bucket + use-case host**, not a UI class.

---

### Question

**LiveData vs ObservableField** and **`setValue` vs `postValue`**

### Answer

- **ObservableField:** data binding era; still works but less lifecycle-aware than LiveData.
- **`setValue`:** main thread; **`postValue`** marshals to main—racey if called back-to-back (last wins/coalescing surprises).
- **Links:**
  - https://blog.mindorks.com/livedata-vs-observable-in-android  
  - https://medium.com/@shashankmohabia/livedata-setvalue-vs-postvalue-91ec550b4c80  

### Key takeaway

> On Kotlin coroutines-first codebases, prefer **StateFlow** with explicit dispatch rules.

---

### Question

**StateFlow vs LiveData** (and when either is wrong)

### Answer

- **StateFlow:** Kotlin-first, integrates with coroutines; always has value; careful with collectors + lifecycle.
- **LiveData:** lifecycle-aware out of the box; Java interop.
- **Link:** https://scalereal.com/android/2020/05/22/stateflow-end-of-livedata.html  

### Key takeaway

> Use **`repeatOnLifecycle`** patterns when collecting flows.

---

### Question

**SOLID on Android** — give concrete examples.

### Answer

- Tie each principle to modules (feature vs core), repository interfaces, and navigation boundaries.
- **Link:** https://www.coderefer.com/blog/solid-principles-in-android-with-kotlin-examples/  

### Key takeaway

> SOLID is **merge conflict reduction**.

---

### Question

**Jetpack Compose** — declarative UI, recomposition, state, navigation, performance, testing

### Answer

- **What it is:** Compose builds UI as `@Composable` functions of state; recomposition updates invalidated subtrees.
- **State:** `remember` / `rememberSaveable` for local; ViewModel + `StateFlow` for screen truth; avoid business logic in composables.
- **Modifiers:** ordered, immutable chains describing layout/semantics/behavior.
- **InterOp:** `AndroidView`/`ComposeView` bridge legacy Views.
- **Navigation:** Navigation-Compose with typed routes (type safety plugins) + deep links.
- **Performance:** stabilize parameters (`stable` lists), keys, avoid lazy list allocations, use `derivedStateOf`, profile recomposition counts.
- **Side effects:** `LaunchedEffect`/`DisposableEffect`/`SideEffect` for lifecycle-aligned work.
- **Theming:** `MaterialTheme` + composition locals.
- **Accessibility:** semantics, content descriptions, focus order.
- **Testing:** compose test rules, semantics matchers, idle synchronization.
- **Real-world example:** Incremental Compose adoption in payments SDK screens with strict regression screenshot tests.

### Key takeaway

> Compose rewards **explicit state ownership** and punishes **hidden side effects**.

---

### Question

**Dagger 2** annotations: `@Component`, `@Module`, `@Provides`, `@Binds`, `@Inject`, `@Scope`, `@Qualifier/@Named`, `@BindsInstance`

### Answer

- **Component:** graph root; generates `DaggerX`.
- **Module:** supplies bindings; `@Binds` for interfaces, `@Provides` for construction.
- **Inject:** constructor/field/method injection sites.
- **Scope:** lifetime boundary (`@Singleton`, custom `@FeatureScope`).
- **Qualifier:** disambiguate multiple bindings of same type (`@Named("prod")`).
- **BindsInstance:** pass runtime values (e.g., `userId`) into builder—use carefully to avoid test pain.
- **DI pattern vs Service Locator:** prefer DI; service locator is test-hostile global lookup.
- **Anti-pattern link:** https://stackoverflow.com/a/980616/3424919  
- Diagram: `https://github.com/user-attachments/assets/dbce5c43-8ec4-4143-a68c-28462d5442d7`

### Key takeaway

> If you can’t **test** your graph, your scopes are wrong.

---

### Question

**Factory vs Abstract Factory** (and when neither belongs in Android UI)

### Answer

- **Factory:** create one product type.
- **Abstract factory:** families of related objects (toolkits).
- **Example:** https://www.journaldev.com/1418/abstract-factory-design-pattern-in-java  
- **Creational patterns link:** https://www.baeldung.com/kotlin/builder-pattern  

### Key takeaway

> Use factories at **SDK boundaries** and **test doubles**.

---

### Question

**Adapter pattern (non-UI)** on Android integrations

### Answer

- Wrap third-party SDKs behind your interfaces to absorb breaking changes.
- **Real-world example:** Analytics adapter swapping Firebase ↔ internal pipeline.

### Key takeaway

> Adapters are **migration insurance**.

---

### Question

**Singleton `getInstance()`** — synchronize whole method vs double-checked locking?

### Answer

- Synchronizing entire method is coarse; **double-checked locking with `volatile`** is standard pattern for lazy singleton initialization.
- **Android note:** Prefer DI scopes over hand-rolled singletons.

### Key takeaway

> **Scope singletons**, don’t “static them everywhere”.
