# Android Engineering — Performance, Release & Leadership — Senior

## Performance & Battery

---

## What is **ANR** and how do you prevent it as a tech lead?

**ANR** means “Application Not Responding.” The system shows a dialog when your app stops responding for too long—about **5 seconds** on the main thread while the user is interacting. Broadcast receivers and services have their own time limits too.

The main thread draws the UI and handles touches. If it is busy parsing JSON, doing heavy database work, or waiting on locks, input piles up and you get an ANR.

What to do: move slow work off the main thread (background threads, coroutines with the right dispatcher), keep the UI path fast, and use profiling (Android Studio, Perfetto) instead of guessing.


> **Profile the main thread** with Android Studio or Perfetto—don’t guess where time goes.

---

## How does **RecyclerView** work internally, and what happens in `onBindViewHolder`?

`RecyclerView` keeps a **small pool** of row views instead of creating one for every item in a huge list. When you scroll, rows that move off screen are **recycled**: their views are reused for new data.

`onBindViewHolder` is where you **connect model data to that reused view** (set text, image, click listeners). It can run often during scrolls, so it should stay **light**. Heavy work here causes **jank** (stuttering animation).

Using stable IDs and `DiffUtil` helps update lists smoothly without flicker. For images, cancel or tag requests when a row is rebound so the wrong image does not flash.


> **`onBindViewHolder` should stay cheap** for a typical row—no heavy I/O or decoding there.

---

## **ListView vs RecyclerView**

`ListView` is the older list widget. **`RecyclerView` replaces it** for almost everything: it has pluggable layout (`LayoutManager`), item animations, better support for different row types, and a clearer recycling story.

In practice you use the **ViewHolder pattern** with `RecyclerView`; `ListView` could do something similar but the ecosystem and tooling all point to `RecyclerView` (including things like `ConcatAdapter` for headers and grids).


> Don’t start new features on **`ListView`**—use **`RecyclerView`**.

---

## **ArrayMap / SparseArray vs HashMap** on Android

`ArrayMap` and `SparseArray` are Android collections tuned for **small maps** with fewer allocations than `HashMap`. That can mean less garbage collection pressure when you create and drop maps often.

If the map grows **large**, the classic `HashMap` often wins on lookup and structure. So this is not a universal “always use ArrayMap” rule—you pick based on **size, churn, and whether you measured a problem**.

### Useful links

- https://blog.mindorks.com/android-app-optimization-using-arraymap-and-sparsearray-f2b4e2e3dc47  
- https://amitshekhar.me/blog/optimization-using-arraymap-and-sparsearray  


> **Measure** size and allocation churn before micro-optimizing map types.

---

## **Bitmap loading**, large images, and **bitmap pooling**

Large bitmaps blow the heap if you decode them at full resolution. Use **`inJustDecodeBounds`** first to read dimensions, then set **`inSampleSize`** (or use `ImageDecoder`, Coil, Glide) so the decoded bitmap matches the **on-screen size**.

**Bitmap pooling** reuses bitmap memory for another decode of the same size. It helps allocation pressure but you must respect **lifecycle** and dimensions—wrong reuse causes corruption or crashes.

### Useful links

- https://outcomeschool.com/blog/bitmap-pool  
- https://android.jlelse.eu/loading-large-bitmaps-efficiently-in-android-66826cd4ad53  


> **Read image size first**, then **downsample** to what the UI actually needs.

---

## **APK / app size reduction** and **build time** improvements

Smaller APKs download faster and use less storage. Common levers: **R8/ProGuard** (shrink code), **`shrinkResources`**, limit languages with **`resConfigs`**, use **WebP** or vectors where it helps, **dynamic feature modules** for rarely used pieces, and remove dead code. **APK Analyzer** shows what actually ships.

Faster builds: Gradle **build cache**, fewer modules touching every change, sensible **`implementation` vs `api`**, and CI that caches dependencies.

### Useful links

- https://medium.com/exploring-code/how-you-can-decrease-application-size-by-60-in-only-5-minutes-47eff3e7874e  
- https://blog.mindorks.com/how-to-reduce-apk-size-in-android-2f3713d2d662  
- https://medium.com/exploring-code/how-to-decrease-your-gradle-build-time-by-65-310b572b0c43  


> App size and build speed are **ongoing hygiene**, not one-off tasks.

---

## **StrictMode** — how do you use it without annoying everyone?

StrictMode warns (or crashes in debug) when you accidentally do **disk or network I/O on the main thread**, or leak **SQLite cursors** and **closable** objects. It is a **development** tool to catch mistakes early.

Turn it on for **debug builds** (and tests), not for production users. Pair it with team agreement so noisy policies do not block everyone—tune thread policies and penalty thresholds.

### Useful links

- https://blog.mindorks.com/use-strictmode-to-find-things-you-did-by-accident-in-android-development-4cf0e7c8d997  


> Use StrictMode in **debug and CI**, not as a hammer on real users.

---

## **RenderScript vs NDK** (legacy note)

RenderScript was meant for heavy parallel work on the GPU/CPU. It is **deprecated**; new code should use other options (NDK, GPU APIs, or higher-level libraries) depending on the problem.

### Useful links

- https://blog.mindorks.com/comparing-android-ndk-and-renderscript-1a718c01f6fe  


> Know the **deprecation story** if you maintain older apps that still mention RenderScript.

---

## **FlatBuffers vs JSON**

**JSON** is text: easy to read and debug, but parsing allocates and copies a lot. **FlatBuffers** is a binary layout that can be read with **minimal parsing** (useful with memory-mapped files and tight latency).

You trade **human readability and tooling** for **speed and battery** on the wire and in the client.

### Useful links

- https://blog.mindorks.com/why-consider-flatbuffer-over-json-2e4aa8d4ed07  


> Binary formats help **latency and battery** on slow or flaky networks when you own both ends.

---

## **Battery optimization** — engineering checklist

Radios (mobile data, Wi‑Fi) cost battery even after a small request because of **tail time**—the modem stays awake. **Batch** network work, avoid tight polling, and use **WorkManager** for deferrable jobs. Compress payloads when it helps.

For **location**, balance accuracy, interval, and max wait—higher accuracy and frequent updates drain faster. Follow current **background execution** rules.

### Useful links

- https://blog.mindorks.com/battery-optimization-for-android-apps-f4ef6170ff70  
- https://android-developers.googleblog.com/2018/10/modern-background-execution-in-android.html  


> **Batching network work** usually beats many tiny requests for battery.

---

## **Memory leaks** — create, avoid, detect

A leak keeps objects alive when they should be collected—often by holding a **`Context`** (especially an **Activity**) in a static field, a long-lived **listener**, a **Handler** tied to the Activity, or a thread that outlives the screen.

**Avoid** leaks by scoping work to **lifecycle** (clear listeners, cancel jobs, don’t store Activity in singletons). **WeakReference** is a last resort, not the default fix.

**LeakCanary** and the **Android Studio Profiler** help you find what is still referenced.

### Useful links

- https://www.geeksforgeeks.org/memory-leaks-in-android/  


> **Cancel work and drop references** when screens go away—especially for Activities and Fragments.

---

## **OOM** mitigation

**OutOfMemoryError** often comes from **bitmaps** and **unbounded caches**—not from “the heap number is too small.” Downsample images, cap cache size, and **evict** on memory pressure.

Profile with **heap dumps** when OOMs happen in production-like conditions. Native-heavy apps also need to watch **native** memory.

### Useful links

- https://blog.mindorks.com/practical-guide-to-solve-out-of-memory-error-in-android-application  


> OOM is usually **images and cache policy**, not “just increase the heap.”

---

## **onTrimMemory** — why implement it?

The system calls **`onTrimMemory`** (and related callbacks) when memory is tight. It is your chance to **drop caches** (thumbnails, parsed JSON, extra bitmaps) so the process is less likely to be killed.

Do **not** throw away data you need for correctness—only **recreatable** caches.

### Useful links

- https://developer.android.com/topic/performance/memory  


> Trim **caches**, not essential user data or app state you cannot rebuild.

---

## **Why apps exit** — process death vs finish

Android does not work like desktop “Quit.” The system may **kill your process** in the background under memory pressure. The user may also swipe the app away from recents, which behaves differently by version.

Crashes and **low-memory killer** are normal topics in interviews—**do not rely** on a guaranteed “app exit” hook for business logic.

### Useful links

- https://blog.mindorks.com/reason-of-exit-in-android-application/  


> There is **no reliable desktop-style “exit app”** model—design for **process death** and restoration.

---

## **Shimmer placeholders**

**Shimmer** (or skeleton placeholders) improves **perceived** performance: the user sees structure while content loads. Keep animations **light** so they do not steal GPU or CPU from real work.

### Useful links

- https://blog.mindorks.com/using-shimmer-effect-placeholder-in-android/  


> Skeleton UI should **match the final layout** so content does not jump when it arrives.

---

## **SnapHelper** in RecyclerView

**SnapHelper** snaps the list so an item lines up (carousel, pager-like rows). You attach it to the `RecyclerView` and pick **linear** or **pager** behavior.

Watch **measurement order** and test on **RTL** and different **screen densities**—snapping bugs often show up only in some configurations.

### Useful links

- https://blog.mindorks.com/using-snaphelper-in-recyclerview-fc616b6833e8  


> Test **RTL and density**—snap math is easy to get wrong on edge layouts.

---

## **Multi-touch**

Touch events carry **multiple pointers** (fingers). **`MotionEvent`** reports indices and IDs; pointer **indices** can change when fingers lift, so use **`getPointerId`** for tracking across events. **`GestureDetector`** helps with common patterns.

### Useful links

- https://arjun-sna.github.io/android/2016/07/20/multi-touch-android/  


> Track **pointer IDs**, not only indices—they are not the same across events.

---

## **Swipe animation XML example**

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


> For modern motion, prefer **physics or spring-based** animations when you can; XML tweens are fine for simple legacy Views.

---

## **Cold vs warm vs hot start** — how do you optimize **startup** with evidence?

**Cold:** process not running—**Zygote**, **`Application`**, **`ContentProvider` init**, first **Activity/Compose** frame. **Warm:** process lives, new **Activity**. **Hot:** resume from back stack. **Measure separately** (**Startup Profiler**, **Macrobenchmark**, **Play vitals** / **Firebase Performance**) because fixes differ.

**Levers:** **App Startup** library with explicit **dependencies**, **lazy** SDK init, move **I/O** to **background** dispatchers, remove dead **`ContentProvider`**, defer **non-critical** work until **after first frame** (`registerActivityLifecycleCallbacks` / `IdleHandler` patterns)—**do not** confuse “post to main `Handler`” with **off-main** work. Verify with **before/after traces** and **benchmark** CI.


> **Profile TTID/TTFCP** first—**`onCreate()`** piles up **fast**.

---

## **Main-thread blocking** and **jank** — how do you find and fix them?

**Jank** = missed **frame deadline** (~**16.7 ms** @ 60 Hz, ~**8 ms** @ 120 Hz). **Tools:** **CPU** / **System Trace (Perfetto)**, **Frame Timeline**, **Layout Inspector**, **StrictMode** in **debug** (see earlier card). Hunt **disk**, **network**, **JSON/XML parse**, **Room** on **main**, **synchronized** contention.

**Compose:** avoid creating **formatters** / **regex** / **heavy** objects **every recomposition**—cache with **`remember(keys)`** or **precompute** in **ViewModel**.

### Code example

```kotlin
@Composable
fun TxRow(tx: Tx) {
    val label = remember(tx.date) {
        SimpleDateFormat("dd MMM", Locale.US).format(tx.date)
    }
    Text(label)
}
```


> **Measure** the main thread—Compose jank is often **recomposition**, not **drawing**.

---

## **Large lists** — **RecyclerView** vs **Compose `LazyColumn`** at senior depth?

**RecyclerView:** **`ListAdapter` + `DiffUtil`**, **stable IDs**, **light** `onBind`, **Coil/Glide** with **request** lifecycle, **Paging 3**. **Compose:** **`items(..., key = { it.id })`**, **stable** parameter types (`@Stable` / **immutable** models), **`derivedStateOf`** for derived list state, **avoid** capturing **unstable** lambdas. Neither is “free”—**wrong state** makes Compose **worse** than a tuned **RV**.


> **Keys + stable models + diffing**—same physics, different **API**.

---

## **Network and database** work — what shows up in **profiling**?

Split **RTT** vs **parse** vs **DB insert** in **CPU trace**. Fixes: **pagination**, **batch** writes, **indexes** on **filter columns**, **background** parse, **Room** `@Transaction` where appropriate, **avoid** N+1 queries. UI reads **observe** DB **Flow** on **main** but **queries** run on **Room’s** executors—still watch **main-thread** `allowMainThreadQueries` abuse.


> **Scroll stutter** is often **JSON + DB** on the **wrong** dispatcher or **unbounded** queries.

---

## Which **profiling tools** do you use **day to day** vs **deep dives**?

**Daily:** **Android Studio Profiler** (CPU/memory), **Layout Inspector**, **logcat** / **FrameMetrics**. **Deep:** **Perfetto**, **Startup Profiler**, **Macrobenchmark** (startup/scroll), **LeakCanary** in **debug**, **Play Console vitals** (ANR, **excessive wakeups**) in **production**. **StrictMode** stays **non-release**.


> Staff answers name **traces** and **metrics**, not only “we profile sometimes.”

---

## **STAR** — performance or **ANR** incident?

Use **real** **Situation/Task/Action/Result** with **tools** (**trace**, **heap dump**, **fix**, **verification**). Replace **fabricated** percentages with **what you measured** or **qualitative** outcome unless you own the **number**.


> Tie stories to **artifacts** (trace file, **PR**, **dashboard**).

---

## **Doze** and **App Standby** — how do they affect your **features**?

**Doze** (device **idle**, screen **off**, often **unplugged**): defers **network**, **jobs**, **alarms** except **maintenance windows**. **App Standby** buckets (**Active → … → Restricted**) tighten **per-app** **background** work. **FGS**, **high-priority FCM**, and **user-visible** flows get **exceptions**—everything else should assume **delay**.


> Design **deferrable** work—**fight the OS** and users **uninstall**.

---

## **WorkManager** vs **foreground service** vs **AlarmManager** — pick rules?

| Need | Tool |
|------|------|
| Deferrable sync, constraints | **WorkManager** |
| User-visible long task (playback, live nav) | **Foreground service** + **notification** |
| **Exact** time (clock, calendar) | **AlarmManager** + **modern** **permissions** / **API** rules |

**Misuse:** **FGS** for **analytics** or **“keep alive”** → **policy** + **battery** risk. **Polling loops** → replace with **push** or **WorkManager** **`PeriodicWorkRequest`** with **sane** intervals.

### Code example

```kotlin
val work = OneTimeWorkRequestBuilder<SyncWorker>()
    .setConstraints(
        Constraints.Builder()
            .setRequiredNetworkType(NetworkType.UNMETERED)
            .build(),
    )
    .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
    .build()
WorkManager.getInstance(context).enqueueUniqueWork("sync", ExistingWorkPolicy.KEEP, work)
```


> **WorkManager** = **batch-friendly**; **FGS** = **user expects** it running; **Alarm** = **time-critical**.

---

## **Push (FCM)** and **location/sensors** — battery mistakes?

**FCM:** treat **high priority** as **expensive** (wakeups)—use for **user-visible** events; **collapse keys**; avoid **waking** for **pure analytics**. **Location:** lowest **acceptable** **accuracy/interval**, **stop** updates in **onPause** when possible, **fused** provider, **geofence** over **tight polling**. **Sensors:** **unregister** listeners; **batch** when API allows.


> Every **high-priority push** and **GPS fix** is **battery spend**—budget it.

---

## **Battery anti-patterns** you see in **production**?

**Tight polling**, **infinite retry** without **backoff**, **multiple SDKs** duplicating **sync**, **wake locks** left on, **implicit** **broadcast** **receivers**, **FGS** **abuse**, **WorkManager** **15-minute** spam. **Audit SDKs** with **Play vitals** / **Battery Historian**; **batch** **network**; **respect** **Doze**.


> Much drain is **integration**, not your **for-loop**—**inventory SDKs** like **prod code**.

---

## Release Engineering & CI/CD

---

## **ProGuard vs R8 vs DexGuard**

**ProGuard** was the classic **shrink + obfuscate** toolchain. **R8** is the default now: it **shrinks**, **obfuscates**, and ties into **desugaring** with generally **faster** builds. **DexGuard** adds **commercial hardening** (extra obfuscation, tamper resistance)—buy it when your **threat model** justifies cost.

**Example:** Turn on **R8 full mode** in release and maintain **keep rules** for **reflection** (Retrofit models, Gson types, etc.).


> Shrinking **breaks reflection**—**ProGuard/R8 rules** are part of your source tree.

---

## **Build types vs product flavors vs build variants**

- **Build type:** **debug** vs **release** (minify, signing, debuggable).
- **Product flavor:** different **products** (free/pro, region) along **dimensions**.
- **Variant:** one **flavor** × one **build type** (e.g. `prodRelease`).


> Many variants multiply **CI time**—delete what you do not ship.

---

## **Gradle `implementation` vs `api`**

**`implementation`** hides **transitive types** from **consumers** of your library → **faster compiles**. **`api`** **exports** those types → consumers see them on their classpath.

### Useful links

- https://medium.com/mindorks/implementation-vs-api-in-gradle-3-0-494c817a6fa  


> In libraries, default to **`implementation`** unless you intentionally expose types.

---

## **Gradle wrapper** purpose

The **wrapper** (`gradlew` + properties) pins the **Gradle version** so **CI** and every developer use the **same** build tool.


> **Commit the wrapper**—do not rely on “whatever Gradle is installed.”

---

## **AAPT2 / build pipeline** (high level)

**Resources** compile to **binary tables**; **Java/Kotlin** compiles to **DEX** via **D8/R8**; everything packs into **APK/AAB**. Incremental steps exist so small edits do not rebuild the world.


> Know enough to read **resource merge** and **AAPT** error output.

---

## **ABI splits / ABI filters**

**Native** `.so` files are **per CPU architecture**. **App Bundles** let Play deliver **split APKs** per ABI. Understand **which ABIs** you support—dropping **x86** in dev builds can speed iteration.

### Useful links

- https://developer.android.com/ndk/guides/abis  


> Native SDKs inflate **download size**—split and filter with intent.

---

## **CI/CD for Android**

Typical pieces: **GitHub Actions**, **Jenkins + Docker**, **Bitrise**, **Gradle caching**, **secure signing**, **Play internal tracks**, and **automated tests** (including **Firebase Test Lab**).

### Useful links

- https://blog.mindorks.com/github-actions-for-android/  
- https://www.unosquare.com/blog/how-to-setup-a-ci-cd-pipeline-for-android-using-jenkins-and-docker-part-2/  


> Cache **dependencies** and **build cache**—Android CI is I/O heavy.

---

## **CI/CD benefits & feature branching**

Automation gives **faster releases**, **consistent quality gates**, and **smaller rollout risk**. **Trunk-based** development with **feature flags** usually scales better than long-lived branches.


> **Short-lived branches + flags** beat months-long **integration branches**.

---

## **Signing, Play App Signing, key rotation**

Use **Play App Signing** so Google holds the **app signing key** and you manage an **upload key**. Document **recovery** if an upload key is lost.


> Losing **signing keys** is a **business continuity** problem—treat it seriously.

---

## How do you add **automated review gates** to CI/CD (lint, analysis, tests, coverage)—and where does an **LLM** fit without blocking merges on hallucinations?

**Gates (typical order, fail fast):** formatting (**ktlint** / **Spotless**), **Android Lint** + **Detekt**, **unit tests**, **coverage floor** (**JaCoCo** `jacocoTestCoverageVerification`), optional **instrumentation** on a **schedule** or **nightly** if full **`connectedCheck`** is too slow for every PR. **Static analysis** (**SonarQube** / **SonarCloud**, **CodeQL**) catches smells and security patterns **deterministically**. **Dependency** scanners (**OWASP Dependency-Check**, **Snyk**, **Dependabot**) belong in the same “hard gate” family as your policy allows.

**Branch protection:** require **green checks**, **at least one human** reviewer, **no direct push** to default branch—CI enforces **standards**, people judge **product risk**.

**LLM-assisted review:** Treat it as a **soft** layer after deterministic checks pass. Feed a **trimmed diff**, **title/description**, and **short team rules** (e.g. “no business logic in Composables”). Ask for **severity**, **actionable** bullets, and **missing tests**—post as **PR comments**. **Do not** fail the build solely on LLM output (noise, **hallucinations**, **secrets** in diffs—**redact** before sending). Cap **tokens** (skip generated files, limit lines), run **on PR** not every push, and use a **cheaper** model for huge diffs if cost matters.


> **Lint + tests + SCA** = **hard gates**; **LLM** = **extra reviewer voice**, not the **merge** decision by itself.

---

## **End-to-end release** from merge to Play — what are the control points?

**Merge** to protected branch → **CI** (lint, unit tests, optional instrumentation) → **versionCode** / **versionName** policy → **build variant** (flavor + type) → **sign** release **AAB** → archive **`mapping.txt`** / **native symbols** → **upload** (internal → closed → production) with **release notes** → **monitor** Crashlytics / ANR → **staged rollout** with **pause** plan. **Determinism:** pinned deps, same **JDK/AGP** on CI, no **manual** “works on my laptop” releases for prod.


> Interviewers listen for **artifact integrity**, **symbol upload**, and **blast-radius** control.

---

## **Keystores in CI** — how do mature teams avoid leaking signing material?

Prefer **Play App Signing**: Google holds **app signing key**; your **upload key** lives in **CI secrets** (Vault, GitHub Actions secrets, etc.), injected as **env vars** or **ephemeral** files—**never** commit. **Rotate** upload key on compromise without breaking installed apps. **Least privilege:** only release jobs can decrypt.

### Code example

```kotlin
signingConfigs {
    create("release") {
        storeFile = file(System.getenv("KEYSTORE_PATH") ?: error("KEYSTORE_PATH"))
        storePassword = System.getenv("KEYSTORE_PASSWORD")
        keyAlias = System.getenv("KEY_ALIAS")
        keyPassword = System.getenv("KEY_PASSWORD")
    }
}
```


> **Upload key** in secrets; **app signing key** with Play—know **what leaks** vs what **revokes**.

---

## **buildTypes** vs **productFlavors** — how do you avoid a variant explosion?

**buildTypes** = *how* built (**debug**, **release**, maybe **staging** with different minify/logging). **productFlavors** = *what* product (**dev** / **qa** / **prod** API, branding). **Dimensions** combine into variants (`devDebug`, `prodRelease`)—keep **matrix** small; use **remote config** for switches that do not need a separate APK.

### Code example

```kotlin
android {
    flavorDimensions += "env"
    productFlavors {
        create("dev") {
            dimension = "env"
            applicationIdSuffix = ".dev"
        }
        create("prod") {
            dimension = "env"
        }
    }
}
```


> Flavors for **environment/product**; build types for **build behavior**—don’t multiply both without reason.

---

## **Environment config** (`buildConfigField`, resources) vs **secrets** — what is safe to embed?

**Non-secret** endpoints and feature flags can go in **`buildConfigField`** or **flavor resources**, often fed by **CI env**. **Assume APK is extracted**: **API keys** should be **restricted** (package + signing cert), **rate-limited** server-side, and **never** the sole security control. **Fintech:** **mTLS**, **request signing**, **device binding**—not “hidden” base URLs.


> **Obfuscation ≠ secrecy**—backend must **assume** the client is **hostile**.

---

## **Fastlane** (or equivalent) — what do you automate for Android?

**Fastlane** wraps **Gradle** (`bundleProdRelease`), **upload_to_play_store** (track, rollout %, AAB path), **metadata**, and **Slack/Teams** notifications. **Maturity signals:** separate **lanes** per track, **manual approval** for production, **rollback** playbook. Same ideas map to **pure** Gradle + **Play Developer API** in CI without Fastlane.

### Code example

```ruby
lane :internal do
  gradle(task: "bundleProdRelease")
  upload_to_play_store(
    track: "internal",
    aab: "../app/build/outputs/bundle/prodRelease/app-prod-release.aab"
  )
end
```


> **Repeatable lane** + **staged rollout** beats **hand-upload** Friday night.

---

## **Play Store rollout** — how do you limit blast radius?

**Internal/closed** first; **production** with **percentage rollout** (e.g. 5% → 20% → 100%); watch **crash-free users** and **ANR**; **halt** rollout on thresholds. Upload **mapping** file with release. **AAB** (not side-loaded APK) for Play distribution.


> **Staged %** + **metrics** = production **judgment**, not hope.

---

## Can two builds from the **same commit** differ? Should they?

**Reproducible builds** aim for **bit-identical** or **functionally identical** artifacts: pinned **dependencies**, documented **JDK**, avoid **non-deterministic** steps in release (timestamp in `BuildConfig` if you care). **Practical:** same **inputs** → same **AAB** except where Play injects **signing**. Teams that need **supply-chain** proof track **hashes** and **SBOM**.


> Staff answers mention **pinning** and **traceability**, not “Gradle magic.”

---

## SDK & Third-Party Integration

---

## Integrating **Firebase** end-to-end — what do staff engineers watch?

- **Realtime Database vs Firestore:** different **consistency**, **offline**, and **security rules** ergonomics—pick for your **query patterns** and scale.
- **FCM:** **token** rotation, avoid **topic** abuse, know **background delivery** changes by Android version.
- **Analytics / Crashlytics:** **PII** boundaries, **sampling**, upload **mapping/dSYM** so stack traces deobfuscate.
- **Remote Config:** ship **safe defaults** and **kill switches** so bad values do not brick users.

**Example:** Regulated apps combine **auth**, **messaging**, and **analytics** with **compliance** reviews—not “drop in SDK and forget.”


> Firebase is **fast to adopt** and **easy to mis-govern** without rules, reviews, and ownership.

---

## **Google Maps** & geo features at scale

Plan for **marker clustering**, **geofencing**, **background location** policy, **billing**, and **API key restriction** (by app signing + package). Snapshot or **visual** tests help **map overlays** not drift.


> **Lock down API keys** and **respect Play policy**—non-negotiable for maps at scale.

---

## **Third-party SDK risk management**

Review **vendor security**, audit **data leaving the device**, measure **startup cost** of SDK init, watch **transitive permissions**, add **feature-flag kill switches**, and track an **SBOM**-style inventory of what you ship.


> Every SDK is **risk and bytes**—budget it like headcount.

---

## **CMS-driven mobile UI** — architecture?

Treat server payloads as **untrusted**: **version** your schema, ship **fallback** bundles, **sign** or **validate** payloads, support **incremental sync**, and guard **A/B** experiments. **Cache** templates for **offline**.


> CMS JSON is **input**—validate, version, and fail safe.

---

## **Headless CMS** (AEM, Contentful, Sanity, etc.) on Android — **content-driven** architecture?

**Headless** = content **authoring** separate from **presentation**; mobile consumes **JSON/GraphQL**. Flow: **fetch** payload → **map** to **domain** models (never bind **raw** JSON in UI) → **render** by **component type** using a **registry** (`"carousel"` → `CarouselRenderer`). **Business rules** stay in the **app**; CMS supplies **copy**, **ordering**, **visibility**—not **payment** logic.

**Failure handling:** **timeouts**, **partial JSON**, **unknown types** → **skip** component + **log** / **analytics**, **do not** crash. **Boot** from **disk** cache; **refresh** in background; **stale-but-usable** for marketing screens; **hardcoded** fallback for **critical** legal/onboarding if required.

**Versioning:** include **`contentVersion`/`schemaVersion`** in payloads; app supports **N** and **N−1**; **breaking** changes ship with **min app version** or **feature flag**.

**Security:** **HTTPS** + **pinning** when threat model requires; **sanitize** rich text (**no** raw `WebView` HTML from CMS without **server** cleaning); **allowlist** **CTA** actions to **app-defined** routes—**never** let CMS invent **arbitrary deep links** into **auth/payment** flows. Mitigate **cache poisoning** with **short TTL**, **signed** payloads, or **version hash** validation.

**Performance:** **prefetch** home/marketing, **compress**, **lazy** heavy blocks, **CDN** + **OkHttp** cache where safe; in **Compose**, stable **keys** and **avoid** recomposing whole trees on every CMS tick.


> CMS controls **content**, not **money or auth**; **registry + versioning + safe fallbacks** keep ships boring.

---

## **Play Billing / IAP** (add-on)

**Acknowledge** purchases, make the **backend idempotent**, run **fraud checks**, and use **server notifications**—never trust the client as the only source of truth for money.


> **Server validation** owns the business truth for purchases.

---

## **SDK initialization** — when do you run it, and what must not live in `Application.onCreate()`?

**Bucket SDKs:** (1) **crash/telemetry** you need from second one—init **early** but keep work **light**; (2) **feature** SDKs (maps, payments)—**lazy** init on first screen that needs them; (3) **analytics/marketing**—often **after** first frame or **after consent**. Use **App Startup** with explicit dependencies, **background** threads where safe, and **feature flags** to **disable** a bad SDK without shipping.

**Main-thread block** in init shows up in **startup traces** / **StrictMode**—profile and defer.


> **Default lazy**; **eager** only when the product truly needs it **before** first paint.

---

## How do you measure and **limit** third-party SDK **performance** cost?

**Startup** tracing (Android Studio, **Macrobenchmark**), **Systrace/Perfetto**, **memory** profiler, **network** inspector. Mitigate with **lazy** load, **turn off** unused SDK modules, **strip** verbose logging in **release**, and **BOM**/pinned versions so updates are **reviewed**, not accidental.


> If you cannot **measure** SDK cost, you cannot defend it in a **staff** review.

---

## **Privacy / consent** and third-party SDKs — practical checklist?

Treat each SDK as a **data processor**: read **what** it collects, **gate** init behind **consent** where law/product requires, disable **automatic** collection APIs when offered (**e.g.** `setAnalyticsCollectionEnabled`), prefer **server-side** aggregation for sensitive metrics, and **document** flows for **Play** / **audit**.


> **Consent + config flags** beat “vendor default ON.”

---

## **Version management** — BOMs, conflicts, and release discipline?

Centralize versions (**Gradle Version Catalog**, **Firebase BOM**). Read **changelogs** before bumps; **pin** hotfix branches; resolve **transitive** conflicts with **`constraints`**, **`exclude`**, or **isolation** (separate module / dynamic feature) when two vendors fight. Never **auto-upgrade** all SDKs the week before **freeze**.


> **One catalog** + **reviewed bumps** beats **mystery classpath**.

---

## **Failure isolation** and **SDK removal** — how do staff teams treat churn?

**Wrap** vendor APIs behind **your** interfaces; **try/catch** or **Result** at boundaries; **feature-flag** kill switch; **timeouts** on network SDKs. **Removing** an SDK: stop **new** usage, **dual-run** metrics if swapping analytics, delete **permissions** / **manifest** mergers / **init** code, verify **ProGuard** rules.


> **Adapter + flag** = you can **survive** Tuesday’s bad SDK release.

---

## **STAR** — SDK caused **compliance** or **instability** risk?

Use **STAR** with **real** numbers you own: **Situation** (what shipped / what alarm fired), **Task** (your ownership), **Action** (consent gating, vendor ticket, abstraction, rollback), **Result** (metric or audit outcome). Do **not** invent **RBI/PhonePe** specifics—speak to **your** regulatory context.


> Interviewers want **process + measurable** outcome, not **vendor blame** alone.

---

## SDLC, Leadership & Behavioral

---

## Tips & curated resources for interview preparation

Mix **consistent DSA practice**, **system design** drills, and **behavioral** stories with **real numbers** (latency saved, crash rate, team size). Use the links below as **starting points**, not a checklist to cram in one night.

### Useful links

- https://www.linkedin.com/feed/update/urn:li:activity:7256556738038882304/
- https://www.linkedin.com/feed/update/urn:li:activity:7246844257766981632/
- https://www.linkedin.com/feed/update/urn:li:activity:7221106724919738369/
- https://www.linkedin.com/feed/update/urn:li:activity:7220663449440161793/
- https://www.linkedin.com/feed/update/urn:li:activity:7219036304691388418/
- https://www.linkedin.com/feed/update/urn:li:activity:7217827106083266560/
- https://www.linkedin.com/feed/update/urn:li:activity:7213379334311448576/
- https://www.linkedin.com/feed/update/urn:li:activity:7194272210679705600/
- https://www.linkedin.com/feed/update/urn:li:activity:7177985319269502977/
- https://blog.sp3.in/dsa
- STAR method: https://www.testgorilla.com/blog/star-method-interviews/


> **STAR + metrics** beat a list of adjectives about how “passionate” you are.

---

## Describe a **performance troubleshooting** story on Android.

Use **STAR**: **Situation** (slow app, big APK, bad reviews). **Task** (find hotspots without guessing). **Action** (Android Studio CPU/memory/network profilers, main-thread audit, caching, async boundaries, R8/shrinkResources, image pipeline). **Result** (startup ms, jank frames, APK size, crash-free rate—**real numbers**).


> Interviewers want **how you thought** and **what improved**, with **numbers**.

---

## **Error monitoring & logging** for post-mortems

Use **structured logs** where they help, **Crashlytics** (or similar) for crashes and **non-fatals**, **breadcrumbs** around risky flows, **remote flags** to tune logging, and **PII scrubbing**. Dashboards should answer **“what broke for whom?”** not dump noise.


> Logs and dashboards should drive **action**, not scroll fatigue.

---

## **API security** with sensitive data

Cover **TLS**, **pinning** if needed, **token lifecycle**, **least privilege** scopes, **encryption at rest** on device, **OWASP Mobile** awareness, **key rotation**, and **abuse detection** on the server.


> Security is **process + design**, not one library you drop in once.

---

## **Firebase integration** experience (Realtime DB, FCM, Analytics)

Be ready to talk about **data modeling**, **indexes**, **security rules**, **notification** segments, **analytics** event design, **Crashlytics** triage, and **Remote Config** experiments—and how each choice affects **privacy** and **cost**.


> Tie Firebase decisions to **privacy, cost, and reliability**, not “we use Firebase.”

---

## Testing **MVP/MVVM/MVI** — strategy differences

**MVP:** test the **presenter** with a fake **view**. **MVVM:** test **ViewModel outputs** and fakes for repos. **MVI:** test **pure reducers** and **snapshots** of state where it helps.


> Your architecture picks **what you mock** and **what you assert**.

---

## **Tell me about yourself / hobbies / not on resume** (templates)

Keep a **tight spine**: domains, tech, scale, impact. Add **one human detail** if asked—avoid **rambling** or unrelated life story unless they invite it.


> Aim for about **two minutes**, clear structure.

---

## **Production incident handling**

Show **calm steps**: assess **user impact**, **mitigate** fast, **communicate**, then **root cause** and **prevention** (flags, tests, runbooks). **Blameless** postmortems build trust.


> They want **customer focus** and **clear communication**, not panic.

---

## **MVP/MVVM/MVI project examples** (banking/clinician/bus tracker narratives)

Prepare **a few real projects** with **different metrics** (latency, MAU, compliance, offline). Avoid repeating the **same story** with different buzzwords.


> Have **three solid stories**: scale, conflict, ambiguity.

---

## **Data security in databases**

Discuss **encryption**, **integrity**, **authenticated APIs**, **backup** protection, and **least privilege** access—on **client and server**.


> Defense in depth across **device + backend**.

---

## **Jetpack (Room, VM, LiveData)** usage story

Connect Jetpack to **outcomes**: offline cache, **safe migrations**, **lifecycle-aware** UI, fewer **over-fetch** bugs.


> Frame Jetpack as **business value**, not a feature list.

---

## **UI + unit testing strategy**

**Pyramid** shape, **deterministic CI**, **screenshots** for a small golden UI set, **MockWebServer** for APIs, **TDD** where it pays back.


> **Killing flakes** is a senior skill—not “rerun until green.”

---

## **Code optimization / APK size** narrative (25% claim in source)

Use **numbers you can defend**. Mention **R8**, **resource shrink**, **dynamic delivery**, and **profiling**—never invent **25%** without a real measurement.


> Do not quote **metrics** you cannot explain under follow-up questions.

---

## **Simple solution to complex problem**

Tell a story where you **reframed** the problem—e.g. **query + cache** instead of a **big rewrite**—and **measured** the win.


> **Simple** beats **clever** when it meets the requirement.

---

## **Git collaboration & branching**

Compare **trunk-based** vs **GitFlow** honestly; mention **PR** quality gates, **CODEOWNERS**, **protected** branches.


> Branching should match **release cadence** and **team size**.

---

## **Dependency injection frameworks (Dagger/Koin)**

**Dagger/Hilt:** compile-time graph, catches errors early. **Koin:** runtime, lighter setup. Pick for **graph size**, **build time**, and **test** needs—not fashion.


> Choose DI for **complexity you actually have**.

---

## **Google Maps / geo** experience

Balance **accuracy vs battery**, handle **geofence** imperfection, clear **privacy** prompts, and **enterprise** billing/API limits.


> Location is **policy + UX + engineering** together.

---

## **Code optimization impact** (deep narrative)

Walk through **profilers**, **structural** fixes, **data structures**, **caching**, and how you **measured before/after**.


> Always close with **before/after** evidence.

---

## **Code reviews** example

Share a review where you caught a **security** or **correctness** issue **constructively** and followed up after merge.


> Reviews shape **team culture**, not only code.

---

## **Roles & responsibilities**

Align your story with **scope**, **leadership**, **cross-functional** work, and **quality ownership** at your level.


> Match examples to the **job level** you are interviewing for.

---

## **Backward compatible API changes**

Prefer **additive** changes, **versioning**, **contract tests**, and patterns like **dual read/write** during migrations.


> Compatibility is **distributed systems** discipline, even for mobile clients.

---

## **Challenging project** (maps + realtime)

Highlight **concurrency**, **consistency**, **offline**, and **performance** trade-offs you navigated.


> Depth on **one** hard problem beats ten shallow ones.

---

## **Design patterns in practice** (Singleton/Observer/Factory)

Name patterns you **actually used** and **why**—including **downsides** (singletons and tests, overuse of observers).


> Patterns are **tools**, not tattoos.

---

## **Difficult bug / intermittent crash**

**Crashlytics** breadcrumbs, **repro** harness, **fix root cause** vs papering over with retries only.


> Intermittent bugs usually mean **missing signals**—add instrumentation.

---

## **Staying current with API integration trends**

**RFCs**, **conferences**, **secure coding** practice, **internal guilds**—learning should be **scheduled**, not vague “I read sometimes.”


> Show **habits**, not a one-time course list.

---

## **Refactoring definition + legacy refactor story**

Refactoring changes **structure** without changing **behavior**—done in **small steps** with **tests** and **stakeholder** communication.


> Big refactors need a **business sponsor** and a **plan**.


---

## **SDLC** as a **Tech Lead** — where do you actually spend ownership time?

Treat SDLC as **risk reduction**, not a poster: **discovery** (NFRs: security, perf, scale—push back on vague scope); **design** (contracts, diagrams, trade-offs); **build** (standards, branching, **quality gates**); **test** (meaningful coverage, not vanity %); **release** (flags, rollout %, rollback); **run** (debt and incidents on the **backlog**). When requirements **shift**, re-scope **explicitly**—time, risk, phased delivery—no silent creep.


> Leads **surface uncertainty early**; they do not pretend the plan is frozen.

---

## **Agile** in practice — how do you keep ceremonies from becoming theater?

Optimize for **outcomes**: planning uses **capacity + risk**, stories carry **acceptance criteria** and **tech notes**, blockers surface **without blame**. Standups coordinate **unblocking**, not status to the lead. **Metrics that matter:** defect **escape**, **cycle time**, **predictability**, **burnout** signals—**velocity** alone is noise without **quality**.


> Good Agile is **feedback and delivery**, not **ticket velocity** worship.

---

## **Technical debt** — how do you prioritize without stopping the roadmap?

Make debt **visible** and **classified**: **blocking** (fix now), **risky** (scheduled), **cosmetic** (only when touching the file). Tie asks to **business** language: slower delivery, **crash** / **security** exposure, **onboarding** cost. **Product** funds debt when it is **cost/risk**, not “I dislike this package.”


> **Debt is a portfolio**—trade-offs documented beat heroic weekend rewrites.

---

## **Mentoring** — how does it differ for junior / mid / senior?

**Junior:** small tasks, **pairing**, frequent feedback, fundamentals. **Mid:** **feature ownership**, design discussions, **trade-off** coaching. **Senior:** **system** scope, cross-team **initiatives**, decision **accountability**. Success = team needs you **less** for the same class of problem. **Underperformance:** diagnose (**skill vs clarity vs motivation**), written expectations, support window, **escalate** early if flat—compassionate and **fair**.


> Mentorship is **scaling people**, not **being the hero**.

---

## **Cross-team** delivery — backend / QA / product blocked you. What do you do?

**Early** alignment on **API contracts** and **mocks**; shared **ownership** of incidents, not blame ping-pong. If blocked: escalate with **context + options** (phased ship, temporary stub, scope cut)—not raw complaints. **Fintech/compliance:** release **checklists** (logging, monitoring, audit trail) as **gates**, not last-night panic.


> Leads **unblock** with **options** and **written** alignment.

---

## **Code reviews** — when a **senior** disagrees with your comment?

Welcome **debate** on **merits**; if their **risk** argument wins, **merge** and move on. If residual risk stays, **document** the decision (ADR / comment). **Authority ≠ correctness**—but **shipping** with known risk must be **explicit**.


> Reviews are **risk conversation**, not **ego**.

---

## **STAR** for **leadership** — what must be **real**?

Use **your** **Situation / Task / Action / Result**; **replace** LLM placeholders (“**zero** critical issues”, “**90%**”) with **numbers you own** or **honest qualitative** outcomes. Interviewers probe **depth**—fabricated metrics **fail**.


> One **true** story beats five **polished** fictions.

---

## Real-World Scenario Interview Questions

---

## **Scenario: Memory Leak Causing Gradual App Slowdown**

You are working on a large-scale social media app (~20M MAU). Users report: app becomes slow after 15–20 minutes, scrolling lags, eventually OOM-killed. Monitoring shows: memory grows continuously, GC frequency very high, issue prominent on feed screen. Recent changes: new feed redesign (RecyclerView), image loading optimizations, singleton analytics manager added. **How would you investigate and fix end-to-end?**

Treat this as a **progressive memory leak** (lifecycle mismanagement), not an immediate crash — degradation correlates with user interaction over time.

**1. Confirm Leak vs Expected Growth**
- Memory grows linearly without release → leak
- Memory grows then stabilizes → expected caching behavior (not a bug)
- Tools: **Android Studio Memory Profiler**, heap dumps at intervals, **LeakCanary** (auto-detection)
- If objects are retained after screen destruction → confirms leak

**2. Identify Leak Source via Heap Analysis**
- Capture heap dump → analyze **dominator tree** (which objects retain memory) and **reference chain** (why GC can't collect them)
- Typical suspects here: RecyclerView Adapter holding Activity/Fragment reference · ViewHolder retaining heavy objects · Singleton analytics manager holding `Context` · Image loader caching incorrectly

**3. Investigate RecyclerView Layer** _(issue prominent on feed screen)_
- Is adapter holding a strong reference to `Context`?
- Are listeners cleared in `onViewRecycled()`?
- Does ViewHolder store any long-lived references?
- Are new objects being created inside `onBindViewHolder()` on every scroll pass?

**4. Analyze Singleton / Shared Components** _(analytics manager is the prime suspect)_
- Is it storing Activity context instead of Application context?
- Is it holding references to views, callbacks, or lifecycle owners?
- **Fix:** Replace Activity context with `applicationContext`; never store UI references in a singleton

**5. Image Loading & Caching Layer**
- Are images cleared properly on view recycle?
- Is image loading lifecycle-aware (e.g. Glide tied to Fragment lifecycle)?
- Validate cache size and eviction policy — unbounded cache = leak

**6. GC Pressure Optimization** _(high GC frequency = excessive allocations)_
- Reduce object creation inside the scroll path
- Reuse objects where possible (object pools for frequent allocations)
- Avoid unnecessary boxing/unboxing

**7. Fix Strategy Summary**
- Remove strong references causing leaks
- Enforce proper lifecycle cleanup (`onViewRecycled`, `onDestroyView`)
- Optimize adapter and ViewHolder — no Context refs, no listeners left attached
- Fix singleton misuse — Application context, no UI refs
- Tune image caching — bounded, lifecycle-aware

**8. Validation**
- Compare heap dumps before and after fix
- Memory stabilizes over extended session
- GC frequency drops measurably
- Run long-session soak test (30–60 min on real device)

**9. Long-Term Prevention**
- LeakCanary integrated in all debug builds (CI gates on new leaks)
- Code review checklist: "Does this hold a Context longer than its scope?"
- Architectural boundary rule: no UI references in data layer components


> Memory leaks are **systemic lifecycle mismanagement** — fix at the architectural level, not one-off patches. LeakCanary in CI is your canary in the coal mine.

---

## **Scenario: Battery Drain Due to Background Work**

You are working on a fitness tracking app. Users report significant battery drain; the app appears at the top of battery usage. The app uses location tracking, background sync, and periodic API polling. **How would you diagnose and fix?**

Treat this as a **resource efficiency + background execution policy** problem, not a single bug.

**1. Measure Before Changing Anything**
- **Battery Historian** — visualize wake locks, alarms, wakeups over time
- **Android Profiler (CPU / Network)** — identify which code is running and when
- Identify: CPU wake-up frequency · network calls per hour · wake lock duration

**2. Identify Problematic Components**
- Frequent location updates (high accuracy at short intervals drains most)
- Continuous foreground service running even when not needed
- Aggressive periodic polling (pulling data every minute when push notifications could serve)

**3. Fix Strategy**

**a. Replace Services with WorkManager for deferrable tasks**
- WorkManager respects Doze, App Standby, and battery constraints
- Use `Constraints.Builder()` — run only on Wi-Fi, when charging, etc.
- Only use Foreground Service when **active user-facing** work is happening (e.g. live workout tracking)

**b. Optimize Location Updates**
- Switch from `PRIORITY_HIGH_ACCURACY` → `PRIORITY_BALANCED_POWER_ACCURACY` when precision not critical
- Reduce update interval; use geofencing for region-based triggers instead of continuous polling
- Use `FusedLocationProviderClient` (not raw GPS)

**c. Eliminate Polling — Use Push**
- Replace periodic API polling with FCM push notifications
- Batch network calls — consolidate multiple small requests into one scheduled job
- Use `WorkManager` periodic work (min 15 min interval) instead of `AlarmManager` for non-critical sync

**d. Respect Doze Mode**
- Do not use `WAKE_LOCK` unless absolutely necessary
- Use `setAndAllowWhileIdle()` only for critical alarms
- Never keep CPU awake for background work that can be deferred

**4. Validation**
- Measure battery stats before/after using Battery Historian
- Run 8-hour real-device soak test; compare mAh consumed
- Confirm app dropped from top battery consumers list


> Battery drain = **misusing background execution**. Align with Android's power management system — WorkManager, bounded location, and push over poll.

---

## **Scenario: Slow Build Time in Multi-Module Project**

Large Android codebase: 50+ modules, multiple teams, CI build ~25 minutes, local build ~10–12 minutes. Small changes trigger full rebuilds. Developers are losing productivity. **How would you optimize?**

Treat this as a **build system scalability problem**, not just "add more RAM to the CI box."

**1. Measure Build Bottlenecks First** _(data beats guessing)_
- Run `./gradlew build --scan` → get a **Gradle Build Scan** URL
- Identify: slowest tasks · which tasks are not incremental · cache miss rate
- Check if CI and local share any remote cache (often they don't)

**2. Identify Root Causes**
- Poor module boundaries → one change invalidates many modules
- Too many inter-module `implementation` dependencies → wide invalidation graph
- `KAPT` annotation processing → slow, non-incremental by nature
- Non-incremental tasks that run every time (e.g. custom Gradle tasks doing file I/O)

**3. Modularization Strategy**
- Feature-based module structure: `:feature:login`, `:feature:dashboard`, `:core:network`
- Reduce coupling: features should depend on `:core` interfaces, not each other
- Eliminate circular dependencies (use `./gradlew :module:dependencies` to audit)

**4. Incremental Build Optimization**
- Ensure `kapt.incremental.apt=true` in `gradle.properties`
- Avoid modifying shared/core modules frequently — changes ripple everywhere
- Enable `org.gradle.caching=true` in `gradle.properties`

**5. Replace KAPT with KSP**
- KAPT compiles Java stubs → slow and non-incremental
- KSP (Kotlin Symbol Processing) is 2× faster for supported libraries (Room, Hilt, Moshi)
- Migrate one library at a time; most major libs support KSP now

**6. Enable Build Cache**
```properties
# gradle.properties
org.gradle.caching=true
org.gradle.parallel=true
org.gradle.configureondemand=true
```
- Set up a **remote build cache** (Gradle Enterprise / self-hosted) so CI and developers share cached outputs

**7. Parallel Execution & Workers**
- `org.gradle.parallel=true` — build independent modules simultaneously
- Increase daemon heap: `org.gradle.jvmargs=-Xmx4g -XX:+UseParallelGC`

**8. Dependency Optimization**
- Audit with `./gradlew :app:dependencies` — remove unused transitive deps
- Avoid pulling in large libraries (e.g. full Guava) when you use 3 methods

**9. CI-Specific Optimization**
- Enable remote build cache (CI writes; developers read)
- Affected module detection — only run tests for changed modules (Gradle's `--affected` or custom scripts)
- Run full test suite nightly; PR builds run only affected-module tests


> Slow builds = **poor modular boundaries + missing incremental/caching config**. Fix both: architecture (module graph) and tooling (KSP, cache, parallel). Measure with Build Scan before every change.

---

## **Scenario: Large List Data Loading Causing OOM**

Marketplace app. Users report crashes when scrolling large product lists. Observations: entire dataset loaded at once, images are high-resolution, no pagination. **How would you fix?**

Treat this as a **memory management + data loading strategy** problem — you must never load unbounded data into memory.

**1. Identify Root Causes**
- Entire dataset in memory → linear memory growth → OOM
- High-res images decoded at original size → single image can be 10–20 MB in RAM
- No lazy loading → RecyclerView has nothing to throw away

**2. Introduce Pagination with Paging 3**
```kotlin
// PagingSource example
class ProductPagingSource(private val api: ProductApi) : PagingSource<Int, Product>() {
    override suspend fun load(params: LoadParams<Int>): LoadResult<Int, Product> {
        val page = params.key ?: 1
        return try {
            val response = api.getProducts(page, params.loadSize)
            LoadResult.Page(response.items, prevKey = if (page == 1) null else page - 1, nextKey = page + 1)
        } catch (e: Exception) { LoadResult.Error(e) }
    }
}
```
- Load data in pages (e.g. 20 items at a time)
- Paging 3 handles: loading states · retry · Room integration · LazyColumn/RecyclerView adapter

**3. Optimize Images**
- Never decode at original resolution for a thumbnail — use `inSampleSize` or image loaders
- Use Coil/Glide with explicit `size()` constraint matching the view dimensions
- Use WebP or AVIF format — same quality, 30–50% smaller than JPEG/PNG
- Implement placeholder + loading states so UI stays responsive

**4. RecyclerView Optimization**
- `setHasStableIds(true)` if IDs are stable — improves DiffUtil efficiency
- Use `DiffUtil.ItemCallback` for surgical updates (no `notifyDataSetChanged()`)
- Avoid creating new objects in `onBindViewHolder` — allocate in `onCreateViewHolder`

**5. Memory Cache Strategy**
- Use disk cache + bounded in-memory cache (Glide/Coil do this by default)
- Set explicit max memory cache size relative to available heap
- Clear cache on `onTrimMemory(TRIM_MEMORY_RUNNING_CRITICAL)`

**6. Validation**
- Profile with Android Studio Memory Profiler during scroll
- Confirm heap stays bounded (does not grow with list size)
- Test with 10,000-item dataset on a low-end device (2 GB RAM)


> OOM in lists = **unbounded data + unbounded images**. Paging 3 for data, downsized image loading, and bounded caches for memory — control flow at every layer.

---

## **What is CI/CD in Android development and why does it matter?**

**CI (Continuous Integration):** Every code push to the shared repo automatically triggers a build and test run. Catches regressions before they reach other developers.

**CD (Continuous Delivery):** Once code passes CI, it is automatically packaged (APK/AAB) and distributed to test environments (e.g. Firebase App Distribution, internal Play track).

**Continuous Deployment:** Automatically publishes to production (Google Play) after all quality checks pass — rare in mobile due to review cycles.

**Why it matters:**
- Faster feedback loops — broken builds caught in minutes, not at code review
- Consistent builds — no "it works on my machine"; scripted and version-controlled
- Reduced manual work — no manual test runs, APK generation, or Play uploads
- Early bug detection — tests run on every PR, not just before release

**Common Android CI/CD stack:**

| Tool | Role |
|------|------|
| **GitHub Actions / Bitrise / CircleCI** | Build orchestration |
| **Fastlane** | Sign, build flavors, upload to Play/TestFlight |
| **Firebase App Distribution** | Beta distribution |
| **Gradle Build Scan** | Build performance analysis |
| **Detekt / Ktlint** | Static analysis quality gates |


> CI/CD is not optional on team projects — it is the **safety net that makes refactoring and feature flags safe to ship**.

---

## **What is Gradle and how does project-level vs module-level `build.gradle` differ?**

**Gradle** is Android's build system: compiles Kotlin/Java, packages resources, runs ProGuard/R8, and resolves dependencies. Defined via `build.gradle` (Groovy) or `build.gradle.kts` (Kotlin DSL).

| | `build.gradle` (Project-level) | `build.gradle` (Module-level) |
|--|-------------------------------|-------------------------------|
| **Scope** | Entire project | Specific app or library module |
| **Contains** | Plugin classpath, repo URLs, Gradle version | `compileSdk`, `dependencies`, build types, product flavors |
| **Changes affect** | All modules | Only this module |

**Build Variants = Build Type + Product Flavor**
- **Build types:** `debug` (debuggable, no shrink) · `release` (minified, signed)
- **Product flavors:** `free` / `paid` · `staging` / `production`
- **Variant:** `freeDebug`, `paidRelease`

Use flavors for: different API base URLs · feature flags · white-label apps.


> Project-level = global plumbing; module-level = feature-specific wiring. Build variants = the matrix of every shipping artifact your pipeline must validate.

---
