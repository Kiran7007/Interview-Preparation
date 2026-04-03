# Android Performance & Battery — Senior

> Sources: `Android.md` performance/battery/ANR/RecyclerView/build-time/APK sections + `Mock_Interview.md` performance stories.

---

### Question

What is **ANR** and how do you prevent it as a tech lead?

### Answer

- **Deep explanation:** Main thread blocked ~5s (foreground) triggers ANR dialog; system also tracks broadcast/service timeouts.
- **Internal working:** Choreographer frame deadlines + input dispatch queue stall.
- **Trade-offs:** Moving work off main is necessary but watch thread explosion—use structured concurrency + bounded pools.
- **Real-world example:** JSON parsing on main during login → move to `Dispatchers.Default` + streaming parser.

### Key Takeaway

**Profile main thread** with Android Studio + Perfetto, don’t guess.

---

### Question

How does **RecyclerView** work internally, and what happens in `onBindViewHolder`?

### Answer

- **Deep explanation:** Fixed pool of ViewHolders; scroll recycles off-screen views; bind attaches new model data.
- **Trade-offs:** Stable IDs + DiffUtil reduce flicker; heavy work in bind causes jank.
- **Real-world example:** Image loading cancelled on rebind via request tags.

### Key Takeaway

**Bind should be O(1)** for typical rows.

---

### Question

**ListView vs RecyclerView** (merged duplicates)

### Answer

- ViewHolder pattern mandatory in practice; `LayoutManager` + `ItemAnimator`; better extensibility.
- **Real-world example:** Grid + headers via `ConcatAdapter` vs custom `ListView` hacks.

### Key Takeaway

No new `ListView` code in 2026.

---

### Question

**ArrayMap / SparseArray vs HashMap** on Android

### Answer

- **ArrayMap/SparseArray:** fewer allocations for small maps; worse asymptotics for large N.
- **Link:** https://blog.mindorks.com/android-app-optimization-using-arraymap-and-sparsearray-f2b4e2e3dc47  
- Also see Java discussion: https://amitshekhar.me/blog/optimization-using-arraymap-and-sparsearray  

### Key Takeaway

Measure **size + churn** before micro-optimizing maps.

---

### Question

**Bitmap loading**, large images, and **bitmap pooling**

### Answer

- Use `BitmapFactory.Options` inSampleSize; `ImageDecoder`/Coil/Glide for sane defaults.
- **Pooling:** reuse bitmaps carefully—respect lifecycle and dimensions.
- **Link:** https://outcomeschool.com/blog/bitmap-pool  
- **Large bitmaps:** https://android.jlelse.eu/loading-large-bitmaps-efficiently-in-android-66826cd4ad53  

### Key Takeaway

**Decode bounds first**, then sample.

---

### Question

**APK / app size reduction** and **build time** improvements

### Answer

- R8/ProGuard, `shrinkResources`, `resConfigs`, WebP/vectors, dynamic feature modules, remove dead code, analyze APK analyzer.
- **Links:**
  - https://medium.com/exploring-code/how-you-can-decrease-application-size-by-60-in-only-5-minutes-47eff3e7874e  
  - https://blog.mindorks.com/how-to-reduce-apk-size-in-android-2f3713d2d662  
  - Build time: https://medium.com/exploring-code/how-to-decrease-your-gradle-build-time-by-65-310b572b0c43  

### Key Takeaway

Size work is **release hygiene**, not one-time.

---

### Question

**StrictMode** — how do you use it without annoying everyone?

### Answer

- Detect accidental disk/network on main in debug; pair with CI lint checks.
- **Link:** https://blog.mindorks.com/use-strictmode-to-find-things-you-did-by-accident-in-android-development-4cf0e7c8d997  

### Key Takeaway

StrictMode belongs in **debug + tests**, gated.

---

### Question

**RenderScript vs NDK** (legacy note)

### Answer

- RenderScript deprecated; prefer GPU/NDK or framework APIs for compute.
- **Link:** https://blog.mindorks.com/comparing-android-ndk-and-renderscript-1a718c01f6fe  

### Key Takeaway

Know **deprecation** story for legacy maintenance interviews.

---

### Question

**FlatBuffers vs JSON**

### Answer

- Zero-copy / mmap friendly binary vs text JSON; trade readability and tooling.
- **Link:** https://blog.mindorks.com/why-consider-flatbuffer-over-json-2e4aa8d4ed07  

### Key Takeaway

Binary payloads help **latency + battery** on flaky networks.

---

### Question

**Battery optimization** — engineering checklist

### Answer

- No aggressive polling; batch network; defer via WorkManager; compress payloads; location APIs: accuracy/interval/maxWait trade-offs.
- **Links:**
  - https://blog.mindorks.com/battery-optimization-for-android-apps-f4ef6170ff70  
  - Modern background: https://android-developers.googleblog.com/2018/10/modern-background-execution-in-android.html  

### Key Takeaway

**Radio tail time** dominates—batch to amortize.

---

### Question

**Memory leaks** — create, avoid, detect

### Answer

- Leaks via static `Context`, listeners, Handlers, anonymous threads.
- Avoid with lifecycle scopes, weak references only as last resort, cancel work.
- Detect with LeakCanary + Android Studio Profiler.
- **Link:** https://www.geeksforgeeks.org/memory-leaks-in-android/  

### Key Takeaway

**Cancel + clear references** at lifecycle boundaries.

---

### Question

**OOM** mitigation

### Answer

- Downsampling, reuse, avoid giant in-memory caches, profile heap dumps, watch native memory in image-heavy apps.
- **Link:** https://blog.mindorks.com/practical-guide-to-solve-out-of-memory-error-in-android-application  

### Key Takeaway

OOM is often **bitmap + cache policy**, not “increase heap”.

---

### Question

**onTrimMemory** — why implement it?

### Answer

- Cooperative memory release when system under pressure; reduces kills.
- **Link:** https://developer.android.com/topic/performance/memory  

### Key Takeaway

Free **caches**, not correctness state.

---

### Question

**Why apps exit** — process death vs finish

### Answer

- Understand low-memory killer, crashes, and user expectations—don’t “exit app” artificially.
- **Link:** https://blog.mindorks.com/reason-of-exit-in-android-application/  

### Key Takeaway

Android **doesn’t have a desktop quit model**.

---

### Question

**Shimmer placeholders**

### Answer

- Perceived performance; keep lightweight.
- **Link:** https://blog.mindorks.com/using-shimmer-effect-placeholder-in-android/  

### Key Takeaway

Skeleton UI must match **final layout** to avoid CLS-like jumps.

---

### Question

**SnapHelper** in RecyclerView

### Answer

- Snaps items for carousel UX; watch measurement order.
- **Link:** https://blog.mindorks.com/using-snaphelper-in-recyclerview-fc616b6833e8  

### Key Takeaway

Test on **RTL + different densities**.

---

### Question

**Multi-touch**

### Answer

- `MotionEvent` pointers; gesture detectors.
- **Link:** https://arjun-sna.github.io/android/2016/07/20/multi-touch-android/  

### Key Takeaway

Handle **pointer index** changes correctly.

---

### Question

**Swipe animation XML example** (preserved)

### Answer

```xml
<set xmlns:android="http://schemas.android.com/apk/res/android"
  android:shareInterpolator="false">
 <translate android:fromXDelta="-100%" android:toXDelta="0%"
          android:fromYDelta="0%" android:toYDelta="0%"
          android:duration="700"/>
 </set>
```

### Key Takeaway

Prefer **physics/spring** for modern motion unless legacy Views.
