# Kotlin Basics (Senior Android)

---

### Question

What are `@JvmStatic`, `@JvmOverloads`, and `@JvmField`—and when do they matter in a mixed Kotlin/Java codebase?

### Answer

- **Deep explanation:** Kotlin generates instance methods and accessors by default; Java callers sometimes need static facades, overload bridges, or direct field access for frameworks (e.g., DI, serialization glue, Android callbacks).
- **Internal working:** `@JvmStatic` exposes static methods from `companion object`; `@JvmOverloads` generates overload stubs for default parameters; `@JvmField` exposes a field without accessors.
- **Trade-offs:** `@JvmField` breaks encapsulation; `@JvmOverloads` can explode generated methods for large parameter lists; static interop can hide lifecycle context—prefer Kotlin-only modules when possible.
- **Real-world example:** Dagger/annotation processors expecting Java static creators; legacy Java UI calling Kotlin utilities.

### Code example

```kotlin
@JvmField val profileId: String = "anon" // Java: instance.profileId

companion object {
    @JvmStatic
    fun from(id: String) = User(id)
}
```

### Useful links

- https://blog.mindorks.com/kotlin-android-interview-questions  
- https://www.ubuntupit.com/frequently-asked-kotlin-interview-questions-and-answers/  
- https://www.fullstack.cafe/blog/kotlin-interview-questions  

### Key takeaway

> Interop annotations are **ABI tools**, not style preferences.

---

### Question

What is **destructuring** in Kotlin and where is it unsafe?

### Answer

- **Deep explanation:** Destructuring maps component functions `componentN()` for data-like types, letting you unpack values in one step.
- **Internal working:** Compiler expands `val (a,b) = x` into `component1/2` calls.
- **Trade-offs:** Breaks silently if field order changes in non-data classes; avoid on wide tuples—name fields explicitly for stable APIs.
- **Real-world example:** Unpacking network DTO pairs in UI state mappers.

### Code example

```kotlin
val (name, age) = employee
```

### Key takeaway

> Great for **local ergonomics**, risky for **cross-module contracts**.

---

### Question

`lateinit` vs `lazy`—when do you pick each on Android?

### Answer

- **lateinit:** `var` only; for injection or lifecycle init you don’t have at construction; must ensure assignment before use or catch `UninitializedPropertyAccessException`.
- **lazy:** `val` only; thread-safety modes (`SYNCHRONIZED`, `PUBLICATION`, `NONE`); good for expensive pure initialization.
- **Trade-offs:** `lateinit` is not for primitives; `lazy` holds a lambda and can accidentally capture `Context` if written carelessly.
- **Real-world example:** `lateinit` navigator/session; `lazy` for regex or parser used on first access.

### Key takeaway

> **Mutable post-construct** → `lateinit`; **expensive immutable** → `lazy`.

---

### Question

Difference between `==` and `===` in Kotlin?

### Answer

- **`==`:** Structural equality → compiles to `equals()` (nullable-safe).
- **`===`:** Referential equality (same object), with note that for many primitives you still reason about values but boxed identity can surprise you across platforms.
- **Real-world example:** Compare UI state data classes with `==`; compare shared `Mutex` instance with `===` if ever needed.

### Key takeaway

> Default to **`==`** for business equality.

---

### Question

What is `forEach` in Kotlin and when should you avoid it?

### Answer

- **Deep explanation:** Higher-order iteration with inline contracts; readable for simple actions.
- **Trade-offs:** Non-express `return` (unless labeled); can hide performance costs in hot paths vs indexed `for`.
- **Real-world example:** Logging during debug; avoid in tight animation loops.

### Key takeaway

> Prefer **`for`** when you need **performance or control flow**.

---

### Question

What are **lambdas** and how do they relate to SAM conversion on Android?

### Answer

- **Deep explanation:** Lambdas are function values; Kotlin supports SAM conversion for Java single-abstract-method interfaces (listeners).
- **Trade-offs:** Capturing lambdas retain references → memory leaks if they capture `Activity` views; use `WeakReference` patterns only as last resort—fix lifecycle instead.
- **Real-world example:** `setOnClickListener { }` SAM to `View.OnClickListener`.

### Key takeaway

> Watch **capture lists** in UI listeners.

---

### Question

What is a **companion object** and how does it differ from Java `static`?

### Answer

- **Deep explanation:** A singleton object scoped to the class; can implement interfaces; Kotlin uses it instead of static blocks.
- **Trade-offs:** Still an object—can hold state; misuse becomes hidden global state.
- **Real-world example:** Factory methods + constants colocated with class.

### Useful links

- https://blog.mindorks.com/what-is-the-equivalent-of-java-static-methods-in-kotlin/  

### Key takeaway

> **Companion** ≈ namespace + singleton, not “free functions”.

---

### Question

What does the **`open`** keyword mean in Kotlin—and why is it the default opposite of Java?

### Answer

- **Deep explanation:** Kotlin classes/members are **final by default** for safe reasoning and performance; `open` opts into inheritance.
- **Trade-offs:** Frameworks needing inheritance (some test doubles) require `open` or all-open plugins.
- **Real-world example:** Base `UiModel` sealed/open only where extension is intentional.

### Useful links

- https://blog.mindorks.com/understanding-open-keyword-in-kotlin  

### Key takeaway

> **Design for composition**; use `open` deliberately.

---

### Question

Where do **bitwise and bit-shift** operations show up in Android engineering?

### Answer

- **Deep explanation:** Flags in `PendingIntent`, `Intent`, `MotionEvent`, `View` visibility/state, packed protobuf fields, image channel masks.
- **Trade-offs:** Readability suffers—centralize flag math in named functions and tests.
- **Real-world example:** Combining `PendingIntent` mutability flags correctly for Android 12+.

### Useful links

- https://www.programiz.com/kotlin-programming/bitwise  

### Key takeaway

> Isolate **flag math** behind well-named helpers.

---

### Question

Why are **Kotlin collection operators** (`map`, `filter`, `flatMap`) both loved and criticized?

### Answer

- **Deep explanation:** Expressive chain transforms; each step may allocate intermediate collections.
- **Trade-offs:** Use sequences for large pipelines; choose `buildList` for imperative clarity.
- **Real-world example:** Mapping DTO → domain in repository with `map` is fine; repeated mega-chains on hot paths → sequence.

### Useful links

- https://blog.mindorks.com/kotlin-collection-functions  
- [Map vs FlatMap (LinkedIn)](https://www.linkedin.com/feed/update/urn:li:activity:6770786744422998017/)  

### Key takeaway

> **Measure** hot paths; default to clarity in cold paths.
