# Android Testing (Unit, Integration, UI, Compose) — Senior

---

> **How to read this file**  
> Each **topic** is separated by a horizontal rule (`---`). Flow: **Question → Answer** → (optional **Code** / **Useful links**) → **Key takeaway** (in a blockquote).

---

### Question

Explain the **test pyramid** on mobile.

### Answer

- **Unit:** fast, deterministic—domain + ViewModels with fakes.
- **Integration:** DAO+DB, Retrofit with MockWebServer, navigation + fragment scenarios.
- **UI:** Espresso/Compose tests—few, high value; device labs for OEM quirks.
- **Image:** `assets/test_pyramid.png`

### Key takeaway

> Invert the pyramid only if you enjoy **3AM flakes**.

---

### Question

What does **unit testing** accomplish in CI?

### Answer

- Guards regressions on every PR; enables refactor confidence; pairs with static analysis.

### Key takeaway

> Unit tests are **change velocity insurance**.

---

### Question

**Espresso** basics & when it breaks down

### Answer

- Synchronous idling resources; flaky if animations/async ignored; use `CountingIdlingResource` carefully or architectural fixes.
- **Links:**
  - Official: https://developer.android.com/training/testing/ui-testing/espresso-testing.html  
  - Mindorks intro: https://medium.com/mindorks/android-testing-part-1-espresso-basics  

### Key takeaway

> Flakiness is usually **missing idling** or **shared mutable state**.

---

### Question

**Robolectric**

### Answer

- JVM-fast approximations of framework; great for logic near framework without devices.
- **Link:** http://robolectric.org/  

### Key takeaway

> Know limits vs **true device** behavior.

---

### Question

**UI Automator**

### Answer

- Cross-app UI testing; slower; use for flows spanning apps/settings.
- **Link:** https://developer.android.com/training/testing/ui-testing/uiautomator-testing.html  

### Key takeaway

> Reserve for **true E2E**, not everyday screens.

---

### Question

**Mockito** — why?

### Answer

- Stub collaborators; verify interactions; Kotlin needs inline mock maker / mockK alternative.
- **Link:** http://site.mockito.org/  

### Key takeaway

> Mocks document **expected collaborations**.

---

### Question

**JUnit** on Android

### Answer

- JUnit4/5 with AndroidX test runners; rules for temporary folders, instant exec.
- **Link:** https://devqa.io/junit-5-annotations/  

### Key takeaway

> Prefer **JUnit5** where toolchain allows.

---

### Question

**Screenshot testing**

### Answer

- Catch visual regressions in CI with deterministic fonts/locale.
- **Links:**
  - https://github.com/facebook/screenshot-tests-for-android  
  - https://facebook.github.io/screenshot-tests-for-android/#getting-started  

### Key takeaway

> Pair with **small golden set** to avoid maintenance hell.

---

### Question

**Compose testing** — how is it different from Espresso?

### Answer

- Semantic tree + matchers; synchronization differs; test `Modifier.testTag` discipline.
- **Guidance:** see Compose testing section in `android-architecture.md`.

### Key takeaway

> Compose rewards **semantic selectors**, not raw view IDs.

---

### Question (behavioral)

How do you test **MVP/MVVM/MVI** differently?

### Answer

- MVP: test presenter with fake view; MVVM: test VM outputs; MVI: test reducers + state transitions deterministically.

### Key takeaway

> Architecture choice changes **what you fake**.
