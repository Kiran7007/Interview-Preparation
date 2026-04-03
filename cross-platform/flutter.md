# Flutter (Cross-platform) — Full Topic Coverage (Senior)

---

> **How to read this file**  
> Each **topic** is separated by a horizontal rule (`---`). Flow: **Question → Answer** → (optional **Code** / **Useful links**) → **Key takeaway** (in a blockquote).

---

### Question

What is Flutter?

### Answer

- **Deep explanation:** Flutter is an open-source UI toolkit for building **natively compiled** apps across mobile/desktop/web from one Dart codebase, centered on a high-performance rendering pipeline.
- **Internal working:** Widget composition → render objects → Skia/Impeller draw calls; framework schedules rebuilds and animations.
- **Trade-offs:** Engine size + embedding complexity vs velocity of shared UI.
- **Real-world example:** Internal ops apps where Android+iOS parity matters more than OEM-specific styling.

### Key takeaway

> Flutter is a **UI engine + framework**, not just a cross-platform API shim.

---

### Question

How does Flutter differ from other mobile development frameworks?

### Answer

- **Deep explanation:** Compared to RN-style bridges, Flutter paints pixels itself; compared to Kotlin Multiplatform, Flutter standardizes UI as well as logic (different trade-off).
- **Trade-offs:** Less reliance on OEM widgets → different accessibility/integration considerations.
- **Real-world example:** Brand-identical experiences across platforms.

### Key takeaway

> **Consistent rendering** is the differentiator.

---

### Question

What is Dart?

### Answer

- **Deep explanation:** Dart is the primary language for Flutter—optimized for JIT dev loops and AOT production builds.
- **Trade-offs:** Smaller hiring pool than Kotlin/Swift for platform-specific modules.
- **Real-world example:** Share parsers and validators between client and server (if you adopt Dart backend tooling).

### Key takeaway

> Dart exists to serve **fast iteration + AOT performance**.

---

### Question

What are the main features of Flutter?

### Answer

- Hot reload/hot restart, rich widget catalog, Impeller/Skia rendering, multi-platform targets, strong tooling (DevTools).
- **Real-world example:** Rapid UX iteration with designers in the loop.

### Key takeaway

> **Tooling + rendering** enable the productivity story.

---

### Question

Explain the widget tree in Flutter.

### Answer

- **Deep explanation:** Immutable widgets describe configuration; the framework diffs trees to update render objects.
- **Trade-offs:** Deep trees cost readability—compose smaller widgets.
- **Real-world example:** Mirror feature modules in widget subtrees for test isolation.

### Key takeaway

> Widget tree = **declarative description**, not the final render graph.

---

### Question

What is the difference between StatelessWidget and StatefulWidget?

### Answer

- **Stateless:** Immutable; parent drives updates.
- **Stateful:** Mutable `State` object persists across rebuilds; `setState` schedules rebuild.
- **Trade-offs:** Stateful widgets encourage local state—know when to lift state up.
- **Real-world example:** `Stateless` icon row; `Stateful` text field with validation state.

### Key takeaway

> **Ephemeral UI state** → Stateful; **injected models** → Stateless.

---

### Question

How do you use `setState()`?

### Answer

- Call inside `State` to mutate fields and schedule rebuild; must be quick—no await inside without care.
- **Trade-offs:** Overuse causes rebuild storms; extract subtrees or use memoization/`const`.
- **Real-world example:** Toggle expand/collapse for a card.

### Key takeaway

> `setState` = **local mutation + schedule frame**.

---

### Question

What are keys in Flutter, and when should you use them?

### Answer

- Keys disambiguate widget identity across rebuilds (lists, reorder, state preservation).
- **Trade-offs:** Wrong key worse than none—debug carefully.
- **Real-world example:** `ValueKey(orderId)` in `ListView` of dynamic items.

### Key takeaway

> Keys fix **identity**, not layout.

---

### Question

How do you handle navigation? What is a `Navigator` and what are routes?

### Answer

- `Navigator` manages a stack of `Route` objects; imperative `push/pop` or declarative routers (go_router, etc.).
- **Trade-offs:** Deep linking + state restoration needs a router strategy, not ad-hoc pushes.
- **Real-world example:** Onboarding flow with guarded routes to home.

### Key takeaway

> Treat navigation as **app state**, not scattered calls.

---

### Question

How do you pass data between screens?

### Answer

- Constructor args, route settings/extras, global state (Provider), or deep links.
- **Trade-offs:** Constructor coupling vs opaque maps—prefer typed args for compile safety.
- **Real-world example:** Pass immutable `UserId` value class, not entire `User` graph.

### Key takeaway

> **Typed arguments** + **single source of truth** for shared data.

---

### Question

Explain `Future` and `Stream` in Dart.

### Answer

- **Future:** single completion.
- **Stream:** multiple events over time.
- **Trade-offs:** Stream subscriptions need lifecycle disposal.
- **Real-world example:** `Future` for login RPC; `Stream` for websocket ticker.

### Key takeaway

> Think **single-shot vs timeline**.

---

### Question

What is the purpose of `async` and `await`?

### Answer

- Syntax sugar over futures; keeps async code linear.
- **Trade-offs:** Hidden thread hops—still avoid blocking isolates.
- **Real-world example:** `await dio.get(...)` in repository.

### Key takeaway

> `async/await` improves **readability**, not magic parallelism.

---

### Question

How do you handle and validate forms?

### Answer

- `Form` + `GlobalKey<FormState>` + field validators; keep validation rules testable.
- **Real-world example:** Multi-step KYC form with progressive disclosure.

### Key takeaway

> Validators = **pure functions** where possible.

---

### Question

How do you handle gestures? What is `GestureDetector` for?

### Answer

- Low-level: `GestureDetector`; advanced: raw recognizers when competing gestures exist.
- **Trade-offs:** Hit testing order matters in layered UI.
- **Real-world example:** Swipe actions on list tiles with proper arena resolution.

### Key takeaway

> Understand **gesture arena** when gestures fight.

---

### Question

How do you create custom animations and use `AnimationController`?

### Answer

- `AnimationController` (vsynced to `TickerProvider`) drives `Animation<T>` via `Tween`s; listenables rebuild animated widgets; dispose controllers in `dispose()`.
- **Trade-offs:** For implicit animations prefer built-ins; controllers for interactive transitions.
- **Real-world example:** Drag-to-dismiss sheet with spring simulation vs tween.

### Code example

```dart
late final AnimationController _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 300));
@override
void dispose() {
  _c.dispose();
  super.dispose();
}
```

### Key takeaway

> Always **`dispose` controllers**—this is a classic leak class.

---

### Question

How do you handle network requests?

### Answer

- `http`, `dio`, or platform channels for native stacks; add timeouts, retries with backoff, interceptors.
- **Real-world example:** Certificate pinning via native channel if Dart stack insufficient.

### Key takeaway

> Mirror Android **OkHttp interceptor** thinking.

---

### Question

How do you manage state?

### Answer

- `setState` for local; Provider/Riverpod/BLoC/Redux/MobX for app scale.
- **Trade-offs:** BLoC verbosity vs Provider simplicity; pick based on team skill and test needs.
- **Real-world example:** Riverpod for testable async providers + scoped overrides in tests.

### Key takeaway

> **Scale the solution** to team and complexity.

---

### Question

What is the purpose of the `build` method?

### Answer

- Pure-ish description of UI from current state; may run often—no side effects.
- **Trade-offs:** Side effects belong in controllers/listeners/effects.
- **Real-world example:** Read `watch`ed provider, return widget tree.

### Key takeaway

> `build` should be a **projection**, not a worker.

---

### Question

Explain the lifecycle of a Flutter widget.

### Answer

- `createState` → `initState` → `didChangeDependencies` → `build` → (updates) → `deactivate` → `dispose`.
- **Real-world example:** Start animations/listeners in `initState`, cancel in `dispose`.

### Key takeaway

> **Symmetric setup/teardown** prevents leaks.

---

### Question

What is an `InheritedWidget`?

### Answer

- Propagates data down the tree; `Provider` builds on this model.
- **Trade-offs:** Prefer modern provider APIs for ergonomics unless framework-level needs.

### Key takeaway

> It’s the **primitive** for ambient dependencies.

---

### Question

What are the different ways to handle asynchronous operations?

### Answer

- Futures/streams/async-await; `FutureBuilder`/`StreamBuilder`; RxDart for complex event composition.
- **Trade-offs:** Builders rebuild often—consider `AsyncValue` patterns (Riverpod) for finer control.

### Key takeaway

> Pick **builder** vs **listener** based on rebuild cost.

---

### Question

How do you use `FutureBuilder` and `StreamBuilder`?

### Answer

- Snapshot states: none/waiting/error/done; always handle errors explicitly.
- **Real-world example:** Show shimmer while waiting, error panel with retry.

### Key takeaway

> Never leave **`connectionState` unhandled**.

---

### Question

What is the BLoC pattern, and how is it used?

### Answer

- Separates UI from business logic via events/states; great test seams.
- **Trade-offs:** Boilerplate; consider Cubit for simpler cases.

### Key takeaway

> BLoC shines for **explicit state machines**.

---

### Question

How do you implement dependency injection?

### Answer

- `get_it`, `provider`, `riverpod`, compile-time DI where available.
- **Real-world example:** Register singleton HTTP client + scoped feature modules.

### Key takeaway

> DI is **scopes + test doubles**, not just `get_it()`.

---

### Question

What is the Provider package, and how is it used?

### Answer

- Exposes `Listenable`/`InheritedWidget` values; `context.watch`/`read`.
- **Trade-offs:** Misuse causes rebuild issues—keep providers granular.

### Key takeaway

> **Granular providers** > mega `AppState`.

---

### Question

Tween animation vs physics-based animation?

### Answer

- Tween: deterministic timing curves.
- Physics: interactive, natural motion (springs).
- **Real-world example:** Page transitions tween; fling scroll physics sim.

### Key takeaway

> Match animation type to **interaction model**.

---

### Question

How do you optimize performance of a Flutter app?

### Answer

- Minimize rebuilds (`const`, keys, `Selector`/granular listens), split widgets, memoize expensive children, image cache discipline, avoid heavy synchronous work in build/layout, use DevTools timeline.
- **Real-world example:** Replace full-list rebuild with `ListView.builder` + stable keys.

### Key takeaway

> **Measure jank** before micro-optimizing.

---

### Question

How do you debug a Flutter app? What is the Flutter Inspector for?

### Answer

- DevTools (performance, memory, network), logging, breakpoints, inspector for widget/layout diagnostics.
- **Real-world example:** Track rebuild counts with performance overlay.

### Key takeaway

> Inspector answers **“what rebuilt and why”**.

---

### Question

What is a `FutureProvider` (Riverpod) and how is it used?

### Answer

- Async provider exposing `AsyncValue` states—great for one-shot remote fetches with caching/refetch policies.
- **Trade-offs:** Understand invalidation and family keys for parameterized queries.

### Key takeaway

> Model async UI as **`AsyncValue` states**, not booleans.

---

### Question

How do you handle errors?

### Answer

- `try/catch` around awaits; `runZonedGuarded` for global hooks; `FlutterError.onError` for framework errors; user-friendly surfaces.
- **Real-world example:** Map domain failures to UI snackbars without leaking stack traces.

### Key takeaway

> **Centralize** error translation, not string building in widgets.

---

### Question

How do you implement localization? What is `intl` for?

### Answer

- `flutter_localizations` + ARB files; `intl` formats dates/numbers/pluralization.
- **Trade-offs:** Keep strings out of code; test RTL layouts.

### Key takeaway

> Localization is a **release gate**, not a string hunt.

---

### Question

How do you access native features? What is a platform channel?

### Answer

- MethodChannel/EventChannel to Kotlin/Swift; serialize simple types; version your channel API.
- **Real-world example:** Biometrics, secure enclave use, OEM-specific sensors.

### Key takeaway

> Channels are **productized APIs**—version and test them.

---

### Question

How do you integrate Firebase and use Firebase Authentication?

### Answer

- FlutterFire plugins; initialize in `main`, use platform files (google-services/Gradle on Android).
- **Trade-offs:** Understand token refresh, MFA, and Play Integrity interplay on Android.
- **Real-world example:** Email link sign-in with dynamic links (careful with security).

### Key takeaway

> Mobile auth = **client + server rules + abuse prevention**.

---

### Question

How do you store data locally — SharedPreferences and SQLite?

### Answer

- Key-value: `shared_preferences` for small flags.
- Relational: `sqflite`/`drift` for structured data + migrations.
- **Real-world example:** Encrypted storage for tokens (prefer platform keystore via plugins).

### Key takeaway

> Pick **schema + migrations** when data grows beyond flags.

---

### Question

What are best practices for clean, maintainable Flutter code?

### Answer

- Meaningful names, feature-first folders, separate UI from domain, DRY with judgment, tests for parsers and state reducers.
- **Real-world example:** `features/checkout/{data,domain,ui}` layering.

### Key takeaway

> **Feature isolation** scales teams.
