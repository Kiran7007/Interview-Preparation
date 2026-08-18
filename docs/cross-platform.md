# Flutter (Cross-platform) — Full Topic Coverage (Senior)

---

## What is Flutter?

- **In plain words:** Flutter is an open-source UI toolkit for building **natively compiled** apps across mobile/desktop/web from one Dart codebase, centered on a high-performance rendering pipeline.
- **How it works:** Widget composition → render objects → Skia/Impeller draw calls; framework schedules rebuilds and animations.
- **What to watch for:** Engine size + embedding complexity vs velocity of shared UI.
- **Example:** Internal ops apps where Android+iOS parity matters more than OEM-specific styling.


> Flutter is a **UI engine + framework**, not just a cross-platform API shim.

---

## How does Flutter differ from other mobile development frameworks?

- **In plain words:** Compared to RN-style bridges, Flutter paints pixels itself; compared to Kotlin Multiplatform, Flutter standardizes UI as well as logic (different trade-off).
- **What to watch for:** Less reliance on OEM widgets → different accessibility/integration considerations.
- **Example:** Brand-identical experiences across platforms.


> **Consistent rendering** is the differentiator.

---

## What is Dart?

- **In plain words:** Dart is the primary language for Flutter—optimized for JIT dev loops and AOT production builds.
- **What to watch for:** Smaller hiring pool than Kotlin/Swift for platform-specific modules.
- **Example:** Share parsers and validators between client and server (if you adopt Dart backend tooling).


> Dart exists to serve **fast iteration + AOT performance**.

---

## What are the main features of Flutter?

- Hot reload/hot restart, rich widget catalog, Impeller/Skia rendering, multi-platform targets, strong tooling (DevTools).
- **Example:** Rapid UX iteration with designers in the loop.


> **Tooling + rendering** enable the productivity story.

---

## Explain the widget tree in Flutter.

- **In plain words:** Immutable widgets describe configuration; the framework diffs trees to update render objects.
- **What to watch for:** Deep trees cost readability—compose smaller widgets.
- **Example:** Mirror feature modules in widget subtrees for test isolation.


> Widget tree = **declarative description**, not the final render graph.

---

## What is the difference between StatelessWidget and StatefulWidget?

- **Stateless:** Immutable; parent drives updates.
- **Stateful:** Mutable `State` object persists across rebuilds; `setState` schedules rebuild.
- **What to watch for:** Stateful widgets encourage local state—know when to lift state up.
- **Example:** `Stateless` icon row; `Stateful` text field with validation state.


> **Ephemeral UI state** → Stateful; **injected models** → Stateless.

---

## How do you use `setState()`?

- Call inside `State` to mutate fields and schedule rebuild; must be quick—no await inside without care.
- **What to watch for:** Overuse causes rebuild storms; extract subtrees or use memoization/`const`.
- **Example:** Toggle expand/collapse for a card.


> `setState` = **local mutation + schedule frame**.

---

## What are keys in Flutter, and when should you use them?

- Keys disambiguate widget identity across rebuilds (lists, reorder, state preservation).
- **What to watch for:** Wrong key worse than none—debug carefully.
- **Example:** `ValueKey(orderId)` in `ListView` of dynamic items.


> Keys fix **identity**, not layout.

---

## How do you handle navigation? What is a `Navigator` and what are routes?

- `Navigator` manages a stack of `Route` objects; imperative `push/pop` or declarative routers (go_router, etc.).
- **What to watch for:** Deep linking + state restoration needs a router strategy, not ad-hoc pushes.
- **Example:** Onboarding flow with guarded routes to home.


> Treat navigation as **app state**, not scattered calls.

---

## How do you pass data between screens?

- Constructor args, route settings/extras, global state (Provider), or deep links.
- **What to watch for:** Constructor coupling vs opaque maps—prefer typed args for compile safety.
- **Example:** Pass immutable `UserId` value class, not entire `User` graph.


> **Typed arguments** + **single source of truth** for shared data.

---

## Explain `Future` and `Stream` in Dart.

- **Future:** single completion.
- **Stream:** multiple events over time.
- **What to watch for:** Stream subscriptions need lifecycle disposal.
- **Example:** `Future` for login RPC; `Stream` for websocket ticker.


> Think **single-shot vs timeline**.

---

## What is the purpose of `async` and `await`?

- Syntax sugar over futures; keeps async code linear.
- **What to watch for:** Hidden thread hops—still avoid blocking isolates.
- **Example:** `await dio.get(...)` in repository.


> `async/await` improves **readability**, not magic parallelism.

---

## How do you handle and validate forms?

- `Form` + `GlobalKey<FormState>` + field validators; keep validation rules testable.
- **Example:** Multi-step KYC form with progressive disclosure.


> Validators = **pure functions** where possible.

---

## How do you handle gestures? What is `GestureDetector` for?

- Low-level: `GestureDetector`; advanced: raw recognizers when competing gestures exist.
- **What to watch for:** Hit testing order matters in layered UI.
- **Example:** Swipe actions on list tiles with proper arena resolution.


> Understand **gesture arena** when gestures fight.

---

## How do you create custom animations and use `AnimationController`?

- `AnimationController` (vsynced to `TickerProvider`) drives `Animation<T>` via `Tween`s; listenables rebuild animated widgets; dispose controllers in `dispose()`.
- **What to watch for:** For implicit animations prefer built-ins; controllers for interactive transitions.
- **Example:** Drag-to-dismiss sheet with spring simulation vs tween.

### Code example

```dart
late final AnimationController _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 300));
@override
void dispose() {
  _c.dispose();
  super.dispose();
}
```


> Always **`dispose` controllers**—this is a classic leak class.

---

## How do you handle network requests?

- `http`, `dio`, or platform channels for native stacks; add timeouts, retries with backoff, interceptors.
- **Example:** Certificate pinning via native channel if Dart stack insufficient.


> Mirror Android **OkHttp interceptor** thinking.

---

## How do you manage state?

- `setState` for local; Provider/Riverpod/BLoC/Redux/MobX for app scale.
- **What to watch for:** BLoC verbosity vs Provider simplicity; pick based on team skill and test needs.
- **Example:** Riverpod for testable async providers + scoped overrides in tests.


> **Scale the solution** to team and complexity.

---

## What is the purpose of the `build` method?

- Pure-ish description of UI from current state; may run often—no side effects.
- **What to watch for:** Side effects belong in controllers/listeners/effects.
- **Example:** Read `watch`ed provider, return widget tree.


> `build` should be a **projection**, not a worker.

---

## Explain the lifecycle of a Flutter widget.

- `createState` → `initState` → `didChangeDependencies` → `build` → (updates) → `deactivate` → `dispose`.
- **Example:** Start animations/listeners in `initState`, cancel in `dispose`.


> **Symmetric setup/teardown** prevents leaks.

---

## What is an `InheritedWidget`?

- Propagates data down the tree; `Provider` builds on this model.
- **What to watch for:** Prefer modern provider APIs for ergonomics unless framework-level needs.


> It’s the **primitive** for ambient dependencies.

---

## What are the different ways to handle asynchronous operations?

- Futures/streams/async-await; `FutureBuilder`/`StreamBuilder`; RxDart for complex event composition.
- **What to watch for:** Builders rebuild often—consider `AsyncValue` patterns (Riverpod) for finer control.


> Pick **builder** vs **listener** based on rebuild cost.

---

## How do you use `FutureBuilder` and `StreamBuilder`?

- Snapshot states: none/waiting/error/done; always handle errors explicitly.
- **Example:** Show shimmer while waiting, error panel with retry.


> Never leave **`connectionState` unhandled**.

---

## What is the BLoC pattern, and how is it used?

- Separates UI from business logic via events/states; great test seams.
- **What to watch for:** Boilerplate; consider Cubit for simpler cases.


> BLoC shines for **explicit state machines**.

---

## How do you implement dependency injection?

- `get_it`, `provider`, `riverpod`, compile-time DI where available.
- **Example:** Register singleton HTTP client + scoped feature modules.


> DI is **scopes + test doubles**, not just `get_it()`.

---

## What is the Provider package, and how is it used?

- Exposes `Listenable`/`InheritedWidget` values; `context.watch`/`read`.
- **What to watch for:** Misuse causes rebuild issues—keep providers granular.


> **Granular providers** > mega `AppState`.

---

## Tween animation vs physics-based animation?

- Tween: deterministic timing curves.
- Physics: interactive, natural motion (springs).
- **Example:** Page transitions tween; fling scroll physics sim.


> Match animation type to **interaction model**.

---

## How do you optimize performance of a Flutter app?

- Minimize rebuilds (`const`, keys, `Selector`/granular listens), split widgets, memoize expensive children, image cache discipline, avoid heavy synchronous work in build/layout, use DevTools timeline.
- **Example:** Replace full-list rebuild with `ListView.builder` + stable keys.


> **Measure jank** before micro-optimizing.

---

## How do you debug a Flutter app? What is the Flutter Inspector for?

- DevTools (performance, memory, network), logging, breakpoints, inspector for widget/layout diagnostics.
- **Example:** Track rebuild counts with performance overlay.


> Inspector answers **“what rebuilt and why”**.

---

## What is a `FutureProvider` (Riverpod) and how is it used?

- Async provider exposing `AsyncValue` states—great for one-shot remote fetches with caching/refetch policies.
- **What to watch for:** Understand invalidation and family keys for parameterized queries.


> Model async UI as **`AsyncValue` states**, not booleans.

---

## How do you handle errors?

- `try/catch` around awaits; `runZonedGuarded` for global hooks; `FlutterError.onError` for framework errors; user-friendly surfaces.
- **Example:** Map domain failures to UI snackbars without leaking stack traces.


> **Centralize** error translation, not string building in widgets.

---

## How do you implement localization? What is `intl` for?

- `flutter_localizations` + ARB files; `intl` formats dates/numbers/pluralization.
- **What to watch for:** Keep strings out of code; test RTL layouts.


> Localization is a **release gate**, not a string hunt.

---

## How do you access native features? What is a platform channel?

- MethodChannel/EventChannel to Kotlin/Swift; serialize simple types; version your channel API.
- **Example:** Biometrics, secure enclave use, OEM-specific sensors.


> Channels are **productized APIs**—version and test them.

---

## How do you integrate Firebase and use Firebase Authentication?

- FlutterFire plugins; initialize in `main`, use platform files (google-services/Gradle on Android).
- **What to watch for:** Understand token refresh, MFA, and Play Integrity interplay on Android.
- **Example:** Email link sign-in with dynamic links (careful with security).


> Mobile auth = **client + server rules + abuse prevention**.

---

## How do you store data locally — SharedPreferences and SQLite?

- Key-value: `shared_preferences` for small flags.
- Relational: `sqflite`/`drift` for structured data + migrations.
- **Example:** Encrypted storage for tokens (prefer platform keystore via plugins).


> Pick **schema + migrations** when data grows beyond flags.

---

## What are best practices for clean, maintainable Flutter code?

- Meaningful names, feature-first folders, separate UI from domain, DRY with judgment, tests for parsers and state reducers.
- **Example:** `features/checkout/{data,domain,ui}` layering.


> **Feature isolation** scales teams.
