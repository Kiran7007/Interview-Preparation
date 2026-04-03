# Android Performance & Battery — Senior

---

### Question

What is **ANR** and how do you prevent it as a tech lead?

### Answer

**ANR** means “Application Not Responding.” The system shows a dialog when your app stops responding for too long—about **5 seconds** on the main thread while the user is interacting. Broadcast receivers and services have their own time limits too.

The main thread draws the UI and handles touches. If it is busy parsing JSON, doing heavy database work, or waiting on locks, input piles up and you get an ANR.

What to do: move slow work off the main thread (background threads, coroutines with the right dispatcher), keep the UI path fast, and use profiling (Android Studio, Perfetto) instead of guessing.

### Key takeaway

> **Profile the main thread** with Android Studio or Perfetto—don’t guess where time goes.

---

### Question

How does **RecyclerView** work internally, and what happens in `onBindViewHolder`?

### Answer

`RecyclerView` keeps a **small pool** of row views instead of creating one for every item in a huge list. When you scroll, rows that move off screen are **recycled**: their views are reused for new data.

`onBindViewHolder` is where you **connect model data to that reused view** (set text, image, click listeners). It can run often during scrolls, so it should stay **light**. Heavy work here causes **jank** (stuttering animation).

Using stable IDs and `DiffUtil` helps update lists smoothly without flicker. For images, cancel or tag requests when a row is rebound so the wrong image does not flash.

### Key takeaway

> **`onBindViewHolder` should stay cheap** for a typical row—no heavy I/O or decoding there.

---

### Question

**ListView vs RecyclerView**

### Answer

`ListView` is the older list widget. **`RecyclerView` replaces it** for almost everything: it has pluggable layout (`LayoutManager`), item animations, better support for different row types, and a clearer recycling story.

In practice you use the **ViewHolder pattern** with `RecyclerView`; `ListView` could do something similar but the ecosystem and tooling all point to `RecyclerView` (including things like `ConcatAdapter` for headers and grids).

### Key takeaway

> Don’t start new features on **`ListView`**—use **`RecyclerView`**.

---

### Question

**ArrayMap / SparseArray vs HashMap** on Android

### Answer

`ArrayMap` and `SparseArray` are Android collections tuned for **small maps** with fewer allocations than `HashMap`. That can mean less garbage collection pressure when you create and drop maps often.

If the map grows **large**, the classic `HashMap` often wins on lookup and structure. So this is not a universal “always use ArrayMap” rule—you pick based on **size, churn, and whether you measured a problem**.

### Useful links

- https://blog.mindorks.com/android-app-optimization-using-arraymap-and-sparsearray-f2b4e2e3dc47  
- https://amitshekhar.me/blog/optimization-using-arraymap-and-sparsearray  

### Key takeaway

> **Measure** size and allocation churn before micro-optimizing map types.

---

### Question

**Bitmap loading**, large images, and **bitmap pooling**

### Answer

Large bitmaps blow the heap if you decode them at full resolution. Use **`inJustDecodeBounds`** first to read dimensions, then set **`inSampleSize`** (or use `ImageDecoder`, Coil, Glide) so the decoded bitmap matches the **on-screen size**.

**Bitmap pooling** reuses bitmap memory for another decode of the same size. It helps allocation pressure but you must respect **lifecycle** and dimensions—wrong reuse causes corruption or crashes.

### Useful links

- https://outcomeschool.com/blog/bitmap-pool  
- https://android.jlelse.eu/loading-large-bitmaps-efficiently-in-android-66826cd4ad53  

### Key takeaway

> **Read image size first**, then **downsample** to what the UI actually needs.

---

### Question

**APK / app size reduction** and **build time** improvements

### Answer

Smaller APKs download faster and use less storage. Common levers: **R8/ProGuard** (shrink code), **`shrinkResources`**, limit languages with **`resConfigs`**, use **WebP** or vectors where it helps, **dynamic feature modules** for rarely used pieces, and remove dead code. **APK Analyzer** shows what actually ships.

Faster builds: Gradle **build cache**, fewer modules touching every change, sensible **`implementation` vs `api`**, and CI that caches dependencies.

### Useful links

- https://medium.com/exploring-code/how-you-can-decrease-application-size-by-60-in-only-5-minutes-47eff3e7874e  
- https://blog.mindorks.com/how-to-reduce-apk-size-in-android-2f3713d2d662  
- https://medium.com/exploring-code/how-to-decrease-your-gradle-build-time-by-65-310b572b0c43  

### Key takeaway

> App size and build speed are **ongoing hygiene**, not one-off tasks.

---

### Question

**StrictMode** — how do you use it without annoying everyone?

### Answer

StrictMode warns (or crashes in debug) when you accidentally do **disk or network I/O on the main thread**, or leak **SQLite cursors** and **closable** objects. It is a **development** tool to catch mistakes early.

Turn it on for **debug builds** (and tests), not for production users. Pair it with team agreement so noisy policies do not block everyone—tune thread policies and penalty thresholds.

### Useful links

- https://blog.mindorks.com/use-strictmode-to-find-things-you-did-by-accident-in-android-development-4cf0e7c8d997  

### Key takeaway

> Use StrictMode in **debug and CI**, not as a hammer on real users.

---

### Question

**RenderScript vs NDK** (legacy note)

### Answer

RenderScript was meant for heavy parallel work on the GPU/CPU. It is **deprecated**; new code should use other options (NDK, GPU APIs, or higher-level libraries) depending on the problem.

### Useful links

- https://blog.mindorks.com/comparing-android-ndk-and-renderscript-1a718c01f6fe  

### Key takeaway

> Know the **deprecation story** if you maintain older apps that still mention RenderScript.

---

### Question

**FlatBuffers vs JSON**

### Answer

**JSON** is text: easy to read and debug, but parsing allocates and copies a lot. **FlatBuffers** is a binary layout that can be read with **minimal parsing** (useful with memory-mapped files and tight latency).

You trade **human readability and tooling** for **speed and battery** on the wire and in the client.

### Useful links

- https://blog.mindorks.com/why-consider-flatbuffer-over-json-2e4aa8d4ed07  

### Key takeaway

> Binary formats help **latency and battery** on slow or flaky networks when you own both ends.

---

### Question

**Battery optimization** — engineering checklist

### Answer

Radios (mobile data, Wi‑Fi) cost battery even after a small request because of **tail time**—the modem stays awake. **Batch** network work, avoid tight polling, and use **WorkManager** for deferrable jobs. Compress payloads when it helps.

For **location**, balance accuracy, interval, and max wait—higher accuracy and frequent updates drain faster. Follow current **background execution** rules.

### Useful links

- https://blog.mindorks.com/battery-optimization-for-android-apps-f4ef6170ff70  
- https://android-developers.googleblog.com/2018/10/modern-background-execution-in-android.html  

### Key takeaway

> **Batching network work** usually beats many tiny requests for battery.

---

### Question

**Memory leaks** — create, avoid, detect

### Answer

A leak keeps objects alive when they should be collected—often by holding a **`Context`** (especially an **Activity**) in a static field, a long-lived **listener**, a **Handler** tied to the Activity, or a thread that outlives the screen.

**Avoid** leaks by scoping work to **lifecycle** (clear listeners, cancel jobs, don’t store Activity in singletons). **WeakReference** is a last resort, not the default fix.

**LeakCanary** and the **Android Studio Profiler** help you find what is still referenced.

### Useful links

- https://www.geeksforgeeks.org/memory-leaks-in-android/  

### Key takeaway

> **Cancel work and drop references** when screens go away—especially for Activities and Fragments.

---

### Question

**OOM** mitigation

### Answer

**OutOfMemoryError** often comes from **bitmaps** and **unbounded caches**—not from “the heap number is too small.” Downsample images, cap cache size, and **evict** on memory pressure.

Profile with **heap dumps** when OOMs happen in production-like conditions. Native-heavy apps also need to watch **native** memory.

### Useful links

- https://blog.mindorks.com/practical-guide-to-solve-out-of-memory-error-in-android-application  

### Key takeaway

> OOM is usually **images and cache policy**, not “just increase the heap.”

---

### Question

**onTrimMemory** — why implement it?

### Answer

The system calls **`onTrimMemory`** (and related callbacks) when memory is tight. It is your chance to **drop caches** (thumbnails, parsed JSON, extra bitmaps) so the process is less likely to be killed.

Do **not** throw away data you need for correctness—only **recreatable** caches.

### Useful links

- https://developer.android.com/topic/performance/memory  

### Key takeaway

> Trim **caches**, not essential user data or app state you cannot rebuild.

---

### Question

**Why apps exit** — process death vs finish

### Answer

Android does not work like desktop “Quit.” The system may **kill your process** in the background under memory pressure. The user may also swipe the app away from recents, which behaves differently by version.

Crashes and **low-memory killer** are normal topics in interviews—**do not rely** on a guaranteed “app exit” hook for business logic.

### Useful links

- https://blog.mindorks.com/reason-of-exit-in-android-application/  

### Key takeaway

> There is **no reliable desktop-style “exit app”** model—design for **process death** and restoration.

---

### Question

**Shimmer placeholders**

### Answer

**Shimmer** (or skeleton placeholders) improves **perceived** performance: the user sees structure while content loads. Keep animations **light** so they do not steal GPU or CPU from real work.

### Useful links

- https://blog.mindorks.com/using-shimmer-effect-placeholder-in-android/  

### Key takeaway

> Skeleton UI should **match the final layout** so content does not jump when it arrives.

---

### Question

**SnapHelper** in RecyclerView

### Answer

**SnapHelper** snaps the list so an item lines up (carousel, pager-like rows). You attach it to the `RecyclerView` and pick **linear** or **pager** behavior.

Watch **measurement order** and test on **RTL** and different **screen densities**—snapping bugs often show up only in some configurations.

### Useful links

- https://blog.mindorks.com/using-snaphelper-in-recyclerview-fc616b6833e8  

### Key takeaway

> Test **RTL and density**—snap math is easy to get wrong on edge layouts.

---

### Question

**Multi-touch**

### Answer

Touch events carry **multiple pointers** (fingers). **`MotionEvent`** reports indices and IDs; pointer **indices** can change when fingers lift, so use **`getPointerId`** for tracking across events. **`GestureDetector`** helps with common patterns.

### Useful links

- https://arjun-sna.github.io/android/2016/07/20/multi-touch-android/  

### Key takeaway

> Track **pointer IDs**, not only indices—they are not the same across events.

---

### Question

**Swipe animation XML example**

### Answer

This **translate** animation slides content in from the left over **700 ms** (legacy `View` animation XML).

### Code example

```xml
<set xmlns:android="http://schemas.android.com/apk/res/android"
  android:shareInterpolator="false">
 <translate android:fromXDelta="-100%" android:toXDelta="0%"
          android:fromYDelta="0%" android:toYDelta="0%"
          android:duration="700"/>
 </set>
```

### Key takeaway

> For modern motion, prefer **physics or spring-based** animations when you can; XML tweens are fine for simple legacy Views.
