# Android Testing (Unit, Integration, UI, Compose) — Senior

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

**Espresso** basics & when it breaks down

### Answer

Espresso waits for the UI thread to be **idle** using **idling resources**. Tests get **flaky** when **animations**, **background work**, or **shared mutable state** are not accounted for—sometimes you fix the **architecture** instead of piling on idling hacks.

### Useful links

- https://developer.android.com/training/testing/ui-testing/espresso-testing.html  
- https://medium.com/mindorks/android-testing-part-1-espresso-basics  

### Key takeaway

> Flakes usually mean **missing synchronization** or **shared mutable state**.

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
