# Kotlin Basics (Senior Android)

---

### Question

What are `@JvmStatic`, `@JvmOverloads`, and `@JvmField`—and when do they matter in a mixed Kotlin/Java codebase?

### Answer

- **In plain words:** Kotlin generates instance methods and accessors by default; Java callers sometimes need static facades, overload bridges, or direct field access for frameworks (e.g., DI, serialization glue, Android callbacks).
- **How it works:** `@JvmStatic` exposes static methods from `companion object`; `@JvmOverloads` generates overload stubs for default parameters; `@JvmField` exposes a field without accessors.
- **What to watch for:** `@JvmField` breaks encapsulation; `@JvmOverloads` can explode generated methods for large parameter lists; static interop can hide lifecycle context—prefer Kotlin-only modules when possible.
- **Example:** Dagger/annotation processors expecting Java static creators; legacy Java UI calling Kotlin utilities.

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

- **In plain words:** Destructuring maps component functions `componentN()` for data-like types, letting you unpack values in one step.
- **How it works:** Compiler expands `val (a,b) = x` into `component1/2` calls.
- **What to watch for:** Breaks silently if field order changes in non-data classes; avoid on wide tuples—name fields explicitly for stable APIs.
- **Example:** Unpacking network DTO pairs in UI state mappers.

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
- **What to watch for:** `lateinit` is not for primitives; `lazy` holds a lambda and can accidentally capture `Context` if written carelessly.
- **Example:** `lateinit` navigator/session; `lazy` for regex or parser used on first access.

### Key takeaway

> **Mutable post-construct** → `lateinit`; **expensive immutable** → `lazy`.

---

### Question

Difference between `==` and `===` in Kotlin?

### Answer

- **`==`:** Structural equality → compiles to `equals()` (nullable-safe).
- **`===`:** Referential equality (same object), with note that for many primitives you still reason about values but boxed identity can surprise you across platforms.
- **Example:** Compare UI state data classes with `==`; compare shared `Mutex` instance with `===` if ever needed.

### Key takeaway

> Default to **`==`** for business equality.

---

### Question

What is `forEach` in Kotlin and when should you avoid it?

### Answer

- **In plain words:** Higher-order iteration with inline contracts; readable for simple actions.
- **What to watch for:** Non-express `return` (unless labeled); can hide performance costs in hot paths vs indexed `for`.
- **Example:** Logging during debug; avoid in tight animation loops.

### Key takeaway

> Prefer **`for`** when you need **performance or control flow**.

---

### Question

What are **lambdas** and how do they relate to SAM conversion on Android?

### Answer

- **In plain words:** Lambdas are function values; Kotlin supports SAM conversion for Java single-abstract-method interfaces (listeners).
- **What to watch for:** Capturing lambdas retain references → memory leaks if they capture `Activity` views; use `WeakReference` patterns only as last resort—fix lifecycle instead.
- **Example:** `setOnClickListener { }` SAM to `View.OnClickListener`.

### Key takeaway

> Watch **capture lists** in UI listeners.

---

### Question

What is a **companion object** and how does it differ from Java `static`?

### Answer

- **In plain words:** A singleton object scoped to the class; can implement interfaces; Kotlin uses it instead of static blocks.
- **What to watch for:** Still an object—can hold state; misuse becomes hidden global state.
- **Example:** Factory methods + constants colocated with class.

### Useful links

- https://blog.mindorks.com/what-is-the-equivalent-of-java-static-methods-in-kotlin/  

### Key takeaway

> **Companion** ≈ namespace + singleton, not “free functions”.

---

### Question

What does the **`open`** keyword mean in Kotlin—and why is it the default opposite of Java?

### Answer

- **In plain words:** Kotlin classes/members are **final by default** for safe reasoning and performance; `open` opts into inheritance.
- **What to watch for:** Frameworks needing inheritance (some test doubles) require `open` or all-open plugins.
- **Example:** Base `UiModel` sealed/open only where extension is intentional.

### Useful links

- https://blog.mindorks.com/understanding-open-keyword-in-kotlin  

### Key takeaway

> **Design for composition**; use `open` deliberately.

---

### Question

Where do **bitwise and bit-shift** operations show up in Android engineering?

### Answer

- **In plain words:** Flags in `PendingIntent`, `Intent`, `MotionEvent`, `View` visibility/state, packed protobuf fields, image channel masks.
- **What to watch for:** Readability suffers—centralize flag math in named functions and tests.
- **Example:** Combining `PendingIntent` mutability flags correctly for Android 12+.

### Useful links

- https://www.programiz.com/kotlin-programming/bitwise  

### Key takeaway

> Isolate **flag math** behind well-named helpers.

---

### Question

Why are **Kotlin collection operators** (`map`, `filter`, `flatMap`) both loved and criticized?

### Answer

- **In plain words:** Expressive chain transforms; each step may allocate intermediate collections.
- **What to watch for:** Use sequences for large pipelines; choose `buildList` for imperative clarity.
- **Example:** Mapping DTO → domain in repository with `map` is fine; repeated mega-chains on hot paths → sequence.

### Useful links

- https://blog.mindorks.com/kotlin-collection-functions  
- [Map vs FlatMap (LinkedIn)](https://www.linkedin.com/feed/update/urn:li:activity:6770786744422998017/)  

### Key takeaway

> **Measure** hot paths; default to clarity in cold paths.

---

### Question

What is a Kotlin **`value class`** (`value class` / `@JvmInline`) and when do you use it on Android?

### Answer

- **In plain words:** A **value class** wraps one stored value (or a small fixed set in future Kotlin versions) but aims to give it a **distinct type** at compile time without always allocating a wrapper object on the JVM (`@JvmInline` = underlying value is used at runtime where possible).
- **How it works:** The compiler generates a **thin wrapper** with **no identity** semantics like a normal class; you get **type safety** (e.g. `UserId` vs `String`) and can add **methods** without paying for a full object in many cases.
- **What to watch for:** JVM rules: single **read-only** `val` backing property for `@JvmInline`; **no universal** “free” allocation guarantees in every ABI corner (reflection, generics, arrays can box). Not a replacement for **domain modeling** when you need **identity** or many fields.
- **Example:** `@JvmInline value class UserId(val raw: String)` in public APIs instead of passing bare strings.

### Useful links

- https://kotlinlang.org/docs/inline-classes.html  

### Key takeaway

> Use **value classes** for **cheap, typed wrappers**—know **JVM boxing** edges.
