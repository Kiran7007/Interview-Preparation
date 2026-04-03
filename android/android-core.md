# Android Core Platform (Components, Lifecycle, Concurrency Primitives) — Senior

---

### Question

What is the **`Application` class** and how should teams use it safely?

### Answer

The **`Application`** class is created once **per app process**, before your activities and most other components. It is the usual place to register **process-wide** setup: crash reporting, dependency injection roots, image loader singletons, and callbacks like **`onTrimMemory`**.

Because it lives as long as the process, **never store an `Activity` here** (that leaks the whole screen). Also avoid **heavy work in `onCreate`**—it slows **cold start**. Prefer **lazy** initialization and real background APIs for anything expensive.

**Examples that fit:** crash SDK init, DI container, bounded image pipeline. **Poor fit:** blocking feature-flag fetches on the main thread.

### Useful links

- Project skeleton reference: https://github.com/gbajaj/interviewready  

### Key takeaway

> `Application` is for **process scope**, not “hide globals”.

---

### Question

What is **`Context`** — compare **Activity / Application / Service** contexts.

### Answer

**`Context`** is Android’s handle to the environment: **resources**, **package name**, **SharedPreferences**, starting **components**, and more. You almost always receive one from the framework.

**Activity `Context`** is tied to a **screen** and carries **UI theme** information—you need it for things like **`AlertDialog`**. **`applicationContext`** lives for the **whole app** and is safer for **long-lived** objects (for example a singleton image loader), but it is **not** a substitute when the UI needs a real **Activity** context.

**Rule of thumb:** keep references as **short-lived** as possible. Storing the wrong `Context` in a static field is a classic **memory leak**.

### Useful links

- https://amitshekhar.me/blog/context-in-android-application  

### Key takeaway

> **Scope your context** to the shortest correct lifetime.

---

### Question

Describe classic **Android application architecture components**.

### Answer

- **Activities:** foreground UI entry.
- **Services:** background work (with modern restrictions).
- **Broadcast receivers:** subscribe to events (explicit vs implicit carefully).
- **Content providers:** structured cross-app data with permissions.
- **Intents:** messaging between components.
- **Resources:** localization, density, configuration qualifiers.

### Key takeaway

> Modern apps still host these primitives—**Jetpack wraps**, doesn’t erase them.

---

### Question

Explain **`Activity` lifecycle**, **`onCreate` vs `onStart`**, and **`setContentView` placement**.

### Answer

- **Lifecycle:** `onCreate` → `onStart` → `onResume` (foreground interactive) → `onPause` → `onStop` → `onDestroy`; `onRestart` when returning from stopped.
- **`onCreate` vs `onStart`:** `onCreate` once per creation; `onStart` whenever user-visible again.
- **`setContentView`:** expensive inflation—do in `onCreate` (or `setContent` in Compose activity) not on every resume.
- **Edge case:** `finish()` inside `onCreate` can skip intermediate callbacks—know ordering for teardown hooks.

### Code example

Lifecycle diagrams:

- `/assets/activity_lifecycle.png`

### Key takeaway

> Lifecycle is a **contract** with the system—don’t fight it with silent work in `onResume`.

---

### Question

**Fragments:** lifecycle, correlation with Activity, default constructor rule, back stack, `add` vs `replace`, `DialogFragment` vs `Dialog`.

### Answer

- **Why fragments:** reusable panes, master/detail, modular screens within one activity.
- **Lifecycle:** `onAttach` → `onCreate` → `onCreateView` → `onViewCreated` → `onStart` → `onResume` → … → `onDestroyView` → `onDestroy` → `onDetach`.
- **Host correlation:** fragment transitions interleave with activity lifecycle—test configuration changes.
- **Default constructor + args:** system recreates fragments; use `arguments` `Bundle` for params.
- **Back stack:** `addToBackStack()` for back navigation expectations.
- **`add` vs `replace`:** `replace` typically tears down replaced fragment views; `add` stacks fragments—back behavior and lifecycle callbacks differ (see diagrams linked above).
- **`DialogFragment`:** lifecycle-aware dialog hosting; survives rotation better than raw `Dialog`.

### Useful links / diagrams

- Fragment lifecycle images: `/assets/fragment_lifecycle.png`, `/assets/fragment_lifecycle_2.png`
- Combined lifecycle diagram: `/assets/activity-fragment-lifecycles.png`
- Back stack diagrams:
  - https://user-images.githubusercontent.com/18071333/109423939-88001a80-7a07-11eb-995e-b7d16c5e51bb.png
  - https://user-images.githubusercontent.com/18071333/109423948-95b5a000-7a07-11eb-8aa6-840f01beb236.png
  - https://user-images.githubusercontent.com/18071333/109423954-9d754480-7a07-11eb-9e45-ea95fa038feb.png
  - https://user-images.githubusercontent.com/18071333/109424405-7ae42b00-7a09-11eb-94b1-a2d648d7d33e.png
  - https://user-images.githubusercontent.com/18071333/109424414-86cfed00-7a09-11eb-848c-0948dc8fceab.png
- Fragment back stack listener: https://why-android.com/2016/03/29/learn-how-to-use-the-onbackstackchangedlistener/
- Official fragment creation doc: https://developer.android.com/guide/components/fragments#Creating

### Key takeaway

> If back navigation feels random, your **transactions** are inconsistent.

---

### Question

**Intents:** explicit vs implicit; **Intent filters**; **PendingIntent**; **sticky broadcasts** (legacy).

### Answer

- **Explicit:** class + package—inside your app.
- **Implicit:** action + category + data—system resolves; declare `<intent-filter>` carefully to avoid exported surface surprises.
- **PendingIntent:** delegates future execution with original app identity; mind **mutability flags** (Android 12+), request codes, and **immutable** requirements.
- **Sticky:** historical `sendStickyBroadcast`—largely obsolete/restricted; prefer modern APIs.

### Key takeaway

> PendingIntents are **security boundaries**—treat them like public APIs.

---

### Question

`START_NOT_STICKY` vs `START_STICKY` vs `START_REDELIVER_INTENT`

### Answer

- **NOT_STICKY:** don’t resurrect unless pending work exists.
- **STICKY:** restart with `null` intent unless pending starts exist—good for long-lived “wait for work” services (still prefer modern alternatives).
- **REDELIVER_INTENT:** replay last intent after kill—downloads/uploads.

### Key takeaway

> Maps directly to **user-visible correctness** vs **cost**.

---

### Question

**Launch modes:** `standard`, `singleTop`, `singleTask`, `singleInstance` (corrected interview explanation)

### Answer

- **standard:** new instance per start (within task rules).
- **singleTop:** reuse top if same activity at top; otherwise new.
- **`singleTask`:** affinity + task rules: if an instance exists in the task, clears above it and routes via `onNewIntent` (simplified—verify manifest `taskAffinity` interactions).
- **`singleInstance`:** activity is alone in its task; subsequent launches route elsewhere—use rarely (widgets/VoIP entry points).
- **Correction note:** Some informal examples online confuse `singleTask` vs `singleInstance` stack pictures—always verify with official docs + logging in a sample app.

### Key takeaway

> Launch modes interact with **taskAffinity**, **intent flags**, and **deep links**—debug empirically.

---

### Question

**Processes vs threads vs tasks**

### Answer

- **Process:** isolated memory; components default same process; override with `android:process` for isolation (IPC cost).
- **Thread:** execution unit inside process; **main thread** is UI + event dispatch.
- **Task:** user-facing back stack of activities—NOT identical to process.

### Key takeaway

> “App in background” often means **activity stopped**, process may still live.

---

### Question

**Services:** started vs bound; foreground vs background; **IntentService** deprecation; **threads**.

### Answer

- **Started service:** `startService`—runs until stopped; on main thread unless you offload.
- **Bound service:** client-server interface while bound.
- **Foreground:** notification + user-visible; required for many long tasks.
- **Background restrictions:** post-O, prefer **WorkManager** for deferrable work.
- **IntentService:** serial worker thread service—**deprecated**; migrate to WorkManager / coroutines + foreground where needed.
- **Threads:** manual threads lack lifecycle—coroutines/executors with cancellation policies.

### Useful links

- Services overview: https://developer.android.com/guide/components/services  
- IntentService deprecation: https://developer.android.com/reference/android/app/IntentService  
- Service vs IntentService blog: https://blog.mindorks.com/service-vs-intentservice-in-android  
- Modern background: https://android-developers.googleblog.com/2018/10/modern-background-execution-in-android.html  
- Headless fragment vs Service: https://stackoverflow.com/questions/22799759/what-is-the-difference-between-a-headless-fragment-and-a-service-in-android  
- Update UI from background service: https://medium.com/@anitaa_1990/how-to-update-an-activity-from-background-service-or-a-broadcastreceiver-6dabdb5cef74  

### Key takeaway

> If it must outlive UI, justify **foreground** or **WorkManager**.

---

### Question

**Handler, Looper, MessageQueue, HandlerThread**

### Answer

- **Main looper** pumps UI messages; `Handler` posts runnables/messages; misuse leaks activities via non-static inner classes.
- **HandlerThread** is a long-lived thread with its own looper—great for camera/pipeline work with explicit quit.

### Useful links

- Looper/Handler deep dive: https://medium.com/@ankit.sinhal/messagequeue-and-looper-in-android-3a18c7fc9181  
- Mindorks core article: https://blog.mindorks.com/android-core-looper-handler-and-handlerthread-bd54d69fe91a  

### Key takeaway

> Prefer **structured concurrency** for new code; understand Handlers to debug legacy.

---

### Question

**Thread safety** primitives (volatile/synchronized caveat)

### Answer

- `volatile` does not compose arbitrary atomicity for read-modify-write; use `Atomic*` or synchronized blocks.
- **Example:** `boolean flag` toggled from multiple threads.

### Key takeaway

> Concurrency bugs are **intermittent**—design invariants.

---

### Question

**ExecutorService / thread pools**

### Answer

- Reuse pools; bounded queues; shutdown gracefully on process teardown.

### Useful links

- https://www.javatpoint.com/java-executorservice  
- Java multithreading on Android: https://blog.mindorks.com/java-android-multithreaded-programming-runnable-callable-future-executor  

### Key takeaway

> Unbounded thread creation is a **battery + latency** trap.

---

### Question

**AIDL vs Messenger** (upgrade from oversimplified notes)

### Answer

- **AIDL:** typed IPC for frequent, rich cross-process calls; generates stubs; requires threading discipline.
- **Messenger:** `Handler`-backed lightweight IPC using `Message` queues—great for simple command/response.
- **What to watch for:** AIDL complexity vs Messenger throughput limits.

### Key takeaway

> Pick Messenger unless you **need** a typed high-throughput IPC contract.

---

### Question

**BroadcastReceiver** / **LocalBroadcastManager** legacy note

### Answer

- System broadcasts for many OS events; **implicit broadcasts** heavily restricted.
- **LocalBroadcastManager** deprecated—use in-process flows (`Flow`, direct listeners, `LiveData` scoped properly).

### Useful links

- BroadcastReceiver primer: https://stackoverflow.com/questions/5296987/what-is-broadcastreceiver-and-when-we-use-it  
- LocalBroadcastManager (deprecated reference): https://developer.android.com/reference/android/support/v4/content/LocalBroadcastManager.html  

### Key takeaway

> Avoid **broadcast-as-eventbus** in new code.

---

### Question

**Loader** API?

### Answer

- Deprecated; use **ViewModel + coroutines/Flow + repository**.

### Key takeaway

> If you maintain legacy loaders, plan **migration**.

---

### Question

**WorkManager** — when and links

### Answer

- Deferrable guaranteed work with constraints; not for immediate UI-critical async.
- **Links:**
  - https://flexiple.com/android/android-workmanager-tutorial-getting-started  
  - https://blog.mindorks.com/integrating-work-manager-in-android  
  - How it works: https://www.kodeco.com/20689637-scheduling-tasks-with-android-workmanager  

### Key takeaway

> WorkManager is **not a replacement** for foreground music playback.

---

### Question

**Parcelable vs Serializable** (performance & security framing)

### Answer

- **Parcelable:** designed for Android IPC performance (prefer `@Parcelize`).
- **Serializable:** Java reflection; more allocations—avoid on hot paths.

### Key takeaway

> **Parcelize** reduces boilerplate and mistakes.

---

### Question

**Saved state**, rotation, **`ViewModel` + `SavedStateHandle`**, `onSaveInstanceState`

### Answer

- ViewModel survives config change but **not** process death; persist small UI in saved state; large data in storage.
- **Runtime changes:** official doc: https://developer.android.com/guide/topics/resources/runtime-changes  

### Key takeaway

> **Process death** always wins—design idempotent restoration.

---

### Question

**compileSdk vs targetSdk vs minSdk**

### Answer

- **compileSdk:** compile-time API surface.
- **targetSdk:** behavior toggles for compatibility modes; raising it triggers review of behavior changes.
- **Link:** https://stackoverflow.com/questions/26694108/what-is-the-difference-between-compilesdkversion-and-targetsdkversion  

### Key takeaway

> Raising **targetSdk** is a **QA project**, not a one-line change.

---

### Question

**View hierarchy & custom views & layouts**

### Answer

- `View` leaf, `ViewGroup` container; `ConstraintLayout` reduces depth; `FrameLayout` for overlays; `LinearLayout`/`RelativeLayout` legacy trade-offs.
- Custom view steps (attrs → constructors → measure/layout/draw) are covered in the legacy section below.
- **Links:**
  - ConstraintLayout: https://blog.mindorks.com/using-constraint-layout-in-android-531e68019cd  
  - Sample: https://github.com/anitaa1990/ConstraintLayout-Sample  
  - Article: https://android.jlelse.eu/learning-to-implement-constraintlayout-in-android-8ddc69fe0a1a  
  - Custom views tutorial: https://code.tutsplus.com/tutorials/android-sdk-creating-custom-views--mobile-14548  

### Key takeaway

> Depth == **measure/layout cost**—flatten aggressively.

---

### Question

**ViewPager vs ViewPager2**

### Answer

- ViewPager2 built on RecyclerView; better for RTL + orientation + fragments.

### Useful links

- Official migration: https://developer.android.com/develop/ui/views/animations/vp2-migration  

### Key takeaway

> All new code: **ViewPager2**.

---

### Question

**AsyncTask** pitfalls (legacy)

### Answer

- Not lifecycle-aware; leaks + wrong activity updates on rotation; cancel + retain patterns are obsolete—use structured concurrency.

### Useful links

- Retain fragment gist (legacy): https://gist.github.com/vamsitallapudi/26030c15829d7be8118e42b1fcd0fa42  

### Key takeaway

> If you see AsyncTask in production, schedule **removal**.

---

### Question

**ART vs Dalvik / why Java bytecode isn’t executed directly**

### Answer

- Android executes **DEX** on ART; historically JIT/AOT evolution—know profiles, baseline profiles, R8 impact.

### Useful links

- ART vs Dalvik: https://blog.mindorks.com/what-are-the-differences-between-dalvik-and-art/#:~:text=What%20is%20ART%3F,like%20in%20case%20of%20Dalvik  

### Key takeaway

> Performance story today includes **baseline profiles + R8**.

---

### Question

**StrictMode, logging levels, Jetpack pointer**

### Answer

- StrictMode for dev-only main-thread violations.
- Log level guidance: https://stackoverflow.com/questions/7959263/android-log-v-log-d-log-i-log-w-log-e-when-to-use-each-one  
- Jetpack overview: https://blog.mindorks.com/what-is-android-jetpack-and-why-should-we-use-it  
- Architecture components: https://blog.mindorks.com/what-are-android-architecture-components/  

### Key takeaway

> Operational hygiene matters in **staff** interviews too.

---

### Question

Android **code style** links

### Answer

- https://blog.mindorks.com/android-code-style-and-guidelines-d5f80453d5c7  
- Architecture components LinkedIn post: https://www.linkedin.com/feed/update/urn:li:activity:7244987022665252864  

### Key takeaway

> Consistency enables **scale**.

---

## Android

### Question

Android project skeleton

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://github.com/gbajaj/interviewready


### Key takeaway

> Bookmark **Android project skeleton**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

Android Code Style And Guidelines.

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://blog.mindorks.com/android-code-style-and-guidelines-d5f80453d5c7


### Key takeaway

> Bookmark **Android Code Style And Guidelines**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

Android Architecture Components

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://www.linkedin.com/feed/update/urn:li:activity:7244987022665252864


### Key takeaway

> Bookmark **Android Architecture Components**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

What is an Application class?

### Answer

- **In plain words:**

  The Application class in Android is the base class within an Android app that contains all other components such as activities and services. The Application class, or any subclass of the Application class, is instantiated before any other class when the process for your application/package is created.


### Key takeaway

> The Application class in Android is the base class within an Android app that contains all other components such as activities and services.


---

### Question

What is Context?

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://amitshekhar.me/blog/context-in-android-application


### Key takeaway

> Bookmark **What is Context**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

What is the Android Application Architecture?

### Answer

- **In plain words:**

  - Activities - Provides the window in which the app draws its UI</br>
      - Services − It will perform background functionalities</br>
      - Intent − It will perform the inter connection between activities and the data passing mechanism</br>
      - Resource Externalization − strings and graphics</br>
      - Notification − light,sound,icon,notification,dialog box,and toast</br>
      - Content Providers − It will share the data between applications</br>


### Key takeaway

> Explain **What is the Android Application Architecture** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

What is an Activity?

### Answer

- **In plain words:**

  An activity provides the window in which the app draws its UI. This window typically fills the screen, but may be smaller than the screen and float on top of other windows. Generally, one activity implements one screen in an app. For instance, one of an app’s activities may implement a Preferences screen, while another activity implements a Select Photo screen.


### Key takeaway

> An activity provides the window in which the app draws its UI.


---

### Question

Activity Lifecycle

### Answer

- **In plain words:**

  <img src="/assets/activity_lifecycle.png" width="350">


### Key takeaway

> Know **Activity Lifecycle** cold for interviews—add one production example.


---

### Question

Lifecycle of an Activity

### Answer

- **In plain words:**

  * ```OnCreate()```: This is when the view is first created. This is normally where we create views, get data from bundles etc.</br>
    * ```OnStart()```: Called when the activity is becoming visible to the user. Followed by onResume() if the activity comes to the foreground, or onStop() if it becomes hidden.</br>
    * ```OnResume()```: Called when the activity will start interacting with the user. At this point your activity is at the top of the activity stack, with user input going to it.</br>
    * ```OnPause()```: Called as part of the activity lifecycle when an activity is going into the background, but has not (yet) been killed.</br>
    * ```OnStop()```: Called when you are no longer visible to the user.</br>
    * ```OnDestroy()```: Called when the activity is finishing</br>
    * ```OnRestart()```: Called after your activity has been stopped, prior to it being started again</br>


### Key takeaway

> Explain **Lifecycle of an Activity** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

Is there any scenario where onDestoy() will be called without calling onPause() and onStop()?

### Answer

- **In plain words:**

  If we call finish() method inside onCreate() of our Activity, then onDestroy() will be called directly.


### Key takeaway

> If we call finish() method inside onCreate() of our Activity, then onDestroy() will be called directly.


---

### Question

What’s the difference between onCreate() and onStart()?

### Answer

- **In plain words:**

  * The onCreate() method is called once during the Activity lifecycle, either when the application starts, or when the Activity has been destroyed and then recreated, for example during a configuration change.</br>
    * The onStart() method is called whenever the Activity becomes visible to the user, typically after onCreate() or onRestart().</br>


### Key takeaway

> Explain **What’s the difference between onCreate() and onStart()** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

Why would you do the setContentView() in onCreate() of Activity class?

### Answer

- **In plain words:**

  As onCreate() of an Activity is called only once, this is the point where most initialization should go. It is inefficient to set the content in onResume() or onStart() (which are called multiple times) as the setContentView() is a heavy operation.</br>


### Key takeaway

> As onCreate() of an Activity is called only once, this is the point where most initialization should go.


---

### Question

What is `Fragment`?

### Answer

- **In plain words:**

  A `Fragment` is a piece of an activity which enable more modular activity design. A fragment has its layout, its behavior, and its life cycle callbacks. You can add or remove fragments in an activity while the activity is running. You can combine multiple fragments in a single activity to build a multi-pane UI. A fragment can also be used in multiple activities. The fragment life cycle is closely related to its host activity which means when the activity is paused, all the fragments available in the activity will also be stopped.


### Key takeaway

> A `Fragment` is a piece of an activity which enable more modular activity design.


---

### Question

Fragment Lifecycle

### Answer

- **In plain words:**

  <img src="/assets/fragment_lifecycle.png" width="200"> <img src="/assets/fragment_lifecycle_2.png" width="400">


### Key takeaway

> Know **Fragment Lifecycle** cold for interviews—add one production example.


---

### Question

What is the correlation between activity and fragment life cycle?

### Answer

- **In plain words:**

  Here is how Activity's and Fragment's lifecyle are called together:<br/>
     <img src="/assets/activity-fragment-lifecycles.png" width="350">


### Key takeaway

> Here is how Activity's and Fragment's lifecyle are called together:


---

### Question

How to pass items to `fragment`?

### Answer

- **In plain words:**

  Using `Bundle` you can pass items to the fragment.


### Key takeaway

> Using `Bundle` you can pass items to the fragment.


---

### Question

How would you communicate between two `fragments`?

### Answer

- **In plain words:**

  There are several ways to communicate two fragments. Using `interfaces` are a common way to do that. You can connect two fragments through interfaces that are implemented in the parent activity.


### Key takeaway

> There are several ways to communicate two fragments.


---

### Question

Difference between adding/replacing `fragment` in `backstack`?

### Answer

- **In plain words:**

  - `replace` removes the existing `fragment` and adds a new `fragment`. This means when you press back button the fragment that got replaced will be created with its onCreateView being invoked.
    - `add` retains the existing fragments and adds a new `fragment` that means existing fragment  will be active and they wont be in 'paused' state hence when a back button is pressed onCreateView is not called for the existing fragment(the fragment which was there before new fragment was added).
      In terms of fragment’s life cycle events `onPause()`, `onResume()`, `onCreateView()` and other life cycle events will be invoked in case of `replace` but they wont be invoked in case of `add`. </br>
     <img src="https://user-images.githubusercontent.com/18071333/109423939-88001a80-7a07-11eb-995e-b7d16c5e51bb.png" width="400"><br>
     <img src="https://user-images.githubusercontent.com/18071333/109423948-95b5a000-7a07-11eb-8aa6-840f01beb236.png" width="400"><br>
     <img src="https://user-images.githubusercontent.com/18071333/109423954-9d754480-7a07-11eb-9e45-ea95fa038feb.png" width="400"><br><br>
      <p align="center">
          <img src="https://user-images.githubusercontent.com/18071333/109424405-7ae42b00-7a09-11eb-94b1-a2d648d7d33e.png" width="400">
          <img src="https://user-images.githubusercontent.com/18071333/109424414-86cfed00-7a09-11eb-848c-0948dc8fceab.png" width="400">
      </p>
      <br>


### Useful links

- https://user-images.githubusercontent.com/18071333/109423939-88001a80-7a07-11eb-995e-b7d16c5e51bb.png
- https://user-images.githubusercontent.com/18071333/109423948-95b5a000-7a07-11eb-8aa6-840f01beb236.png
- https://user-images.githubusercontent.com/18071333/109423954-9d754480-7a07-11eb-9e45-ea95fa038feb.png
- https://user-images.githubusercontent.com/18071333/109424405-7ae42b00-7a09-11eb-94b1-a2d648d7d33e.png
- https://user-images.githubusercontent.com/18071333/109424414-86cfed00-7a09-11eb-848c-0948dc8fceab.png


### Key takeaway

> Explain **Difference between adding/replacing `fragment` in `backstack`** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

What is the difference between Dialog and DialogFragment?

### Answer

- **In plain words:**

  - **Dialog** is a small window that prompts the user to make a decision or enter additional information. Instead, `dialogFragment` is a fragment that displays a dialog windows and contains a dialog object. </br>
    - **DialogFragment** does various things to keep the fragment's lifecycle driving it, instead of the Dialog. Dialogs are generally autonomous entities -- they are their own window, receiving their own input events, and often deciding on their own when to disappear. DialogFragment needs to ensure that what is happening with the Fragment and Dialog states remains consistent. To do this, it watches for dismiss events from the dialog and takes care of removing its own state when they happen.


### Key takeaway

> Explain **What is the difference between Dialog and DialogFragment** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

What is the difference between `apply()` and `commit()` in `sharedPreferences`?

### Answer

- **In plain words:**

  - `commit()` writes the data **synchronously** and returns a boolean value of success or failure depending on the result immediately.
    - `apply()` is **asynchronous** and it won’t return any boolean response. Also if there is an `apply()` outstanding and we perform another `commit()`, The `commit()` will be blocked until the `apply()` is not completed.


### Key takeaway

> Explain **What is the difference between `apply()` and `commit()` in `sharedPreferences`** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

What is a Loader in Android?

### Answer

- **In plain words:**

  Note: (Loader is Deprecated. We Have to use combination of ViewModels and LiveData instead of using Loaders) A Loader is used to fetch the data from a Content provider and cache the results across the configuration changes to avoid duplicate queries. Loader does it by running on separate threads and handling the lifecycle changes (so no need of asynctasks or new thread creations or manual handling of life cycle changes). Few implementations of Loaders like CursorLoader can implement an observer (called ContentObserver) to monitor any data changes and can then trigger a reload.


### Key takeaway

> Note: (Loader is Deprecated. We Have to use combination of ViewModels and LiveData instead of using Loaders) A Loader is used to fetch the data from a Content provider and cache the results across the configuration chang…


---

### Question

What is an Intent Filter?

### Answer

- **In plain words:**

  Intent filters are a very powerful feature of the Android platform. They provide the ability to launch an activity based not only on an explicit request, but also an implicit one. For example, an explicit request might tell the system to “Start the Send Email activity in the Gmail app". By contrast, an implicit request tells the system to “Start a Send Email screen in any activity that can do the job." When the system UI asks a user which app to use in performing a task, that’s an intent filter at work. Here's an example of how to declare Intent Filter in AndroidManifest:


### Code example

```xml
<activity android:name=".ExampleActivity" android:icon="@drawable/app_icon">
    <intent-filter>
        <action android:name="android.intent.action.SEND" />
        <category android:name="android.intent.category.DEFAULT" />
        <data android:mimeType="text/plain" />
    </intent-filter>
</activity>
```

### Key takeaway

> Intent filters are a very powerful feature of the Android platform.


---

### Question

What is an Intent? What are the different types of Intents?

### Answer

- **In plain words:**

  It is a kind of message or information that is passed between different components of Android. It is used to launch an activity, display a web page, send SMS, send email, etc. There are two types of intents in android: </br>

      There are two types of intents: </br>
      a) **Implicit Intent** - Implicit intents do not name a specific component, but instead declare a general action to perform, which allows a component from another app to handle it. For example, if you want to show the user a location on a map, you can use an implicit intent to request that another capable app show a specified location on a map. </br>

      b) **Explicit Intent** - Explicit intents specify which application will satisfy the intent, by supplying either the target app's package name or a fully-qualified component class name. You'll typically use an explicit intent to start a component in your own app, because you know the class name of the activity or service you want to start. For example, you might start a new activity within your app in response to a user action, or start a service to download a file in the background.


### Key takeaway

> It is a kind of message or information that is passed between different components of Android.


---

### Question

What is Pending Intent in Android?

### Answer

- **In plain words:**

  Pending Intent is an intent which you want to trigger at some time in future, even when your application is not alive. This intent can be used by other application which allows it to execute that intent with the same permissions as of our application.  </br>


      PendingIntent uses the following methods to handle the different types of intents:


### Code example

```java
Intent intent = new Intent(this, AnyActivity.class);

// Creating a pending intent and wrapping our intent
PendingIntent pendingIntent = PendingIntent.getActivity(this, 1, intent, PendingIntent.FLAG_UPDATE_CURRENT);
try {
    // Perform the operation associated with our pendingIntent
    pendingIntent.send();
} catch (PendingIntent.CanceledException e) {
    e.printStackTrace();
}
```

```java
PendingIntent.getActivity();   // Retrieves a PendingIntent to start an Activity
PendingIntent.getBroadcast(); // Retrieves a PendingIntent to perform a Broadcast
PendingIntent.getService();  // Retrieves a PendingIntent to start a Service
```

### Key takeaway

> Pending Intent is an intent which you want to trigger at some time in future, even when your application is not alive.


---

### Question

What is the difference between START_NOT_STICKY, START_STICKY AND START_REDELIVER_INTENT?

### Answer

- **In plain words:**

  **START_NOT_STICKY:** <br>
      If the system kills the service after onStartCommand() returns, do not recreate the service unless there are pending intents to deliver. This is the safest option to avoid running your service when not necessary and when your application can simply restart any unfinished jobs.

      **START_STICKY:** <br>
      If the system kills the service after onStartCommand() returns, recreate the service and call onStartCommand(), but do not redeliver the last intent. Instead, the system calls onStartCommand() with a null intent unless there are pending intents to start the service. In that case, those intents are delivered. This is suitable for media players (or similar services) that are not executing commands but are running indefinitely and waiting for a job.

      **START_REDELIVER_INTENT:** <br>
      If the system kills the service after onStartCommand() returns, recreate the service and call onStartCommand() with the last intent that was delivered to the service. Any pending intents are delivered in turn. This is *suitable for services that are actively performing a job that should be immediately resumed, such as downloading a file.*


### Key takeaway

> **NOT_STICKY** avoids resurrecting the service without pending work; **STICKY** restarts and often delivers a `null` intent; **REDELIVER_INTENT** replays the last intent—use it when a job must resume after process death.


---

### Question

What is the StrictMode?

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://blog.mindorks.com/use-strictmode-to-find-things-you-did-by-accident-in-android-development-4cf0e7c8d997


### Key takeaway

> Bookmark **What is the StrictMode**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

Launch modes in Android?

### Answer

- **In plain words:**

  **Standard**:  </br>It creates a new instance of an activity in the task from which it was started. Multiple instances of the activity can be created and multiple instances can be added to the same or different tasks.  </br>
    Example: Suppose there is an activity stack of A -> B -> C. Now if we launch B again with the launch mode as “standard”, the new stack will be A -> B -> C -> B.  </br>

    **SingleTop**:  </br>It is the same as the standard, except if there is a previous instance of the activity that exists in the top of the stack, then it will not create a new instance but rather send the intent to the existing instance of the activity. </br>
       Example: Suppose there is an activity stack of A -> B. Now if we launch C with the launch mode as “singleTop”, the new stack will be A -> B -> C as usual. Now if there is an activity stack of A -> B -> C. If we launch C again with the launch mode as “singleTop”, the new stack will still be A -> B -> C.  </br>

    **SingleTask**:  </br>A new task will always be created and a new instance will be pushed to the task as the root one. So if the activity is already in the task, the intent will be redirected to onNewIntent() else a new instance will be created. At a time only one instance of activity will exist.  </br>
       Example: Suppose there is an activity stack of A -> B -> C -> D. Now if we launch D with the launch mode as “singleTask”, the new stack will be A -> B -> C -> D as usual. Now if there is an activity stack of A -> B -> C -> D.  If we launch activity B again with the launch mode as “singleTask”, the new activity stack will be A -> B. Activities C and D will be destroyed.  </br>

    **SingleInstance**:  </br>Same as single task but the system does not launch any activities in the same task as this activity. If new activities are launched, they are done so in a separate task.  </br>
       Example: Suppose there is an activity stack of A -> B -> C -> D. If we launch activity B again with the launch mode as “singleTask”, the new activity stack will be: Task1 — A -> B -> C  and Task2 — D </br>


### Key takeaway

> **Standard**: It creates a new instance of an activity in the task from which it was started.


---

### Question

How do you declare the launch mode in your application?

### Answer

- **In plain words:**

  via manifest, in activity's tag. For Eg., -> android:launchMode="singleTask"


### Key takeaway

> via manifest, in activity's tag. For Eg., -> android:launchMode="singleTask"


---

### Question

What is a RetainFragment / Headless Fragment?

### Answer

- **In plain words:**

  Generally, Fragments are destroyed and recreated along with their parent Activity’s whenever a configuration change occurs. Calling setRetainInstance(true) allows us to bypass this destroy-and-recreate cycle, notifying the system to retain the current instance of the fragment when the activity is recreated.


### Key takeaway

> Generally, Fragments are destroyed and recreated along with their parent Activity’s whenever a configuration change occurs.


---

### Question

What are Processes in Android?

### Answer

- **In plain words:**

  Everytime an Android App starts, the Android System creates a New Process for this Application with a Single thread of Execution. By default all the components of the same application runs in the same process. While most apps donot change this behavior, some apps like games, might want to run in different processes. Then we can use *android:process* attribute in our AndroidManifest.xml to specify the process name.


### Key takeaway

> Everytime an Android App starts, the Android System creates a New Process for this Application with a Single thread of Execution.


---

### Question

Compilesdkversion vs Targetsdkversion

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://stackoverflow.com/questions/26694108/what-is-the-difference-between-compilesdkversion-and-targetsdkversion


### Key takeaway

> Bookmark **Compilesdkversion vs Targetsdkversion**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

What is onSavedInstanceState() and onRestoreInstanceState() in activity?

### Answer

- **In plain words:**

  - **onSavedInstanceState()** - This method is used to store data before pausing the activity.
      - **onRestoreInstanceState()** - This method is used to recover the saved state of an activity when the activity is recreated after destruction. Both the ```onCreate()``` and ```onRestoreInstanceState()``` callback methods receive the same Bundle that contains the instance state information. But because the ```onCreate()``` method is called whether the system is creating a new instance of your activity or recreating a previous one, you must check whether the state Bundle is null before you attempt to read it. If it is null, then the system is creating a new instance of the activity, instead of restoring a previous one that was destroyed.


### Key takeaway

> Explain **What is onSavedInstanceState() and onRestoreInstanceState() in activity** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

When should you use a Fragment rather than an Activity?

### Answer

- **In plain words:**

  - When there are ui components that are going to be used across multiple activities.
      - When there are multiple views that can be displayed side by side (viewPager tabs)
      - When you have data that needs to be persisted across Activity restarts (such as retained fragments)</br>


### Key takeaway

> Explain **When should you use a Fragment rather than an Activity** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

ViewPager vs ViewPager2

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://developer.android.com/develop/ui/views/animations/vp2-migration


### Key takeaway

> Bookmark **ViewPager vs ViewPager2**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

What is the difference between FragmentPagerAdapter vs FragmentStatePagerAdapter?

### Answer

- **In plain words:**

  - **FragmentPagerAdapter:** Each fragment visited by the user will be stored in the memory but the view will be destroyed. When the page is revisited, then the view will be recreated not the instance of the fragment. This can result in a significant amount of memory being used. FragmentPagerAdapter should be used when we need to store the whole fragment in memory. FragmentPagerAdapter calls ```detach(Fragment)``` on the transaction instead of ```remove(Fragment)```.
      - **FragmentStatePagerAdapter:** the fragment instance is destroyed when it is not visible to the User, except the saved state of the fragment. This results in using only a small amount of Memory and can be useful for handling larger data sets. Should be used when we have to use dynamic fragments, like fragments with widgets, as their data could be stored in the savedInstanceState.Also it won't affect the performance even if there are large number of fragments.</br>


### Key takeaway

> Explain **What is the difference between FragmentPagerAdapter vs FragmentStatePagerAdapter** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

View & ViewGroup

### Answer

- **In plain words:**

  - **View**: View objects are the basic building blocks of User Interface(UI) elements in Android. View is a simple rectangle box which responds to the user's actions. Examples are EditText, Button, CheckBox etc. View refers to the ```android.view.View``` class, which is the base class of all UI classes.
     - **ViewGroup**: ViewGroup is the invisible container. It holds View and ViewGroup. For example, LinearLayout is the ViewGroup that contains Button(View), and other Layouts also. ViewGroup is the base class for Layouts.</br>


### Key takeaway

> Explain **View & ViewGroup** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

Why do android apps need to ask permission like `INTERNET` or `LOCATION`?

### Answer

- **In plain words:**

  The Android platform takes advantage of the Linux user-based protection to identify and isolate app resources called sandbox. This isolates apps from each other and protects apps and the system from malicious apps. If an app needs to use some system resources (like internet, or location sensor,..) or needs to connect other apps (like IAB library), it should request this access. Then android OS give this request and get permission to access the resource. If you want to use system resources, request the permission under the `<uses-permission>` tag in the `android-manifest.xml` file.


### Key takeaway

> The Android platform takes advantage of the Linux user-based protection to identify and isolate app resources called sandbox.


---

### Question

Differences between `serializable` and `Parcelable`?

### Answer

- **In plain words:**

  Serializable is a standard java interface but not a part of the Android SDK. Just by implementating this interface your POJO will be ready to jump from one activity to another. So what's the problem with Serializable? Serializable use reflection during the process and lots of additional temp objects created along the way and it may cause garbage collection to occue more often. That is why the serializable is more than 10x slower than Parcelable.


### Key takeaway

> Serializable is a standard java interface but not a part of the Android SDK.


---

### Question

Why `serializable` body is empty? How is it doing?

### Answer

- **In plain words:**

  Yes, It's empty because the Java reflection API is performed for marshaling operations (by JVM). This helps identify the Java object's member and behavior but also ends up creating a lot of garbage objects.


### Key takeaway

> Yes, It's empty because the Java reflection API is performed for marshaling operations (by JVM).


---

### Question

Which method in `fragment` runs only once?

### Answer

- **In plain words:**

  According to the [documentation](https://developer.android.com/guide/components/fragments#Creating), the `onCreate()` method is called once a fragment is created. Within your implementation, you should initialize essential components of the fragment that you want to retain when the fragment is paused or stopped, then resumed.


### Useful links

- [documentation](https://developer.android.com/guide/components/fragments#Creating)


### Key takeaway

> According to the [documentation](https://developer.


---

### Question

How to know `configChange` happens in `onDestroy()` function?

### Answer

- **In plain words:**

  Once an activity is in the process of finishing then `isFinishing()` method is returned `true` value, otherwise `false` when the system is temporarily destroying the instance of the activity.


### Key takeaway

> Once an activity is in the process of finishing then `isFinishing()` method is returned `true` value, otherwise `false` when the system is temporarily destroying the instance of the activity.


---

### Question

How to handle multiple screen sizes?

### Answer

- **In plain words:**

  It's a long debate but in a very nutshell, you can do it in these ways:
      - Use flexible layout like `ConstraintLayout` unless create alternative layout in different layout folders. (e.g. layout-sw480, layout-sw600, layout-sw720 ...)    
      - Provide different bitmap drawables for different screen densities or use vector assets.
      - Be aware of the screen orientation change approach in your application.
        If you don't want to handle it enforce to use just one orientation (portrait or landscape) through declaring it in the manifest file.

   for complete reading, see the [official documentation](https://developer.android.com/training/multiscreen/screensizes).


### Useful links

- [official documentation](https://developer.android.com/training/multiscreen/screensizes)


### Key takeaway

> It's a long debate but in a very nutshell, you can do it in these ways: - Use flexible layout like `ConstraintLayout` unless create alternative layout in different layout folders.


---

### Question

What is the difference between margin and padding?

### Answer

- **In plain words:**

  - **Padding** will be space added inside the container, for instance, if it is a button, padding will be added inside the button.       
    - **Margin** will be space added outside the container.


### Key takeaway

> Explain **What is the difference between margin and padding** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

What is `sw` keyword in `layout-sw600` folder meaning?

### Answer

- **In plain words:**

  The `sw` keywrod which stands on "smallest width" is an screen size qualifier that allow you to provide alternative layouts for screens that have a minimum width measured in dp.
    The smallest width qualifier specifies the smallest of the screen's two sides, regardless of the device's current orientation, so it's a simple way to specify the overall screen size available for your layout. Here is some useful values:

      - **320dp:** a typical phone screen (240x320 ldpi, 320x480 mdpi, 480x800 hdpi, etc).
      - **480dp:** a large phone screen ~5" (480x800 mdpi).
      - **600dp:** a 7” tablet (600x1024 mdpi).
      - **720dp:** a 10” tablet (720x1280 mdpi, 800x1280 mdpi, etc).


### Key takeaway

> The `sw` keywrod which stands on "smallest width" is an screen size qualifier that allow you to provide alternative layouts for screens that have a minimum width measured in dp.


---

### Question

What is the difference between `sw` and `w` and `h` as postfix in order to define the resources folder?

### Answer

- **In plain words:**

  - `sw`: The smallest width qualifier specifies the smallest of the screen's two sides, regardless of the device's current orientation,
      - `w`: The width qualifier specifies the available width. For example, if you have a two-pane layout, you might want to use that whenever the screen provides at least 600dp of width, which might change depending on whether the device is in landscape or portrait orientation. Notice that this qualifier is orientation related.
      - `h`: The height qualifier specifies the available height. This is equivalent to `w` qualifier but is used when the available height is a concern.

    The major difference between these qualifiers is responding to orientation change. The `sw` isn't orientation sensitive but the two others are orientation sensitive. It means that if the screen is 480*800 in dp, then in `sw` always `layout-sw480` folder is loaded but in `w`, for portrait mode, `layout-w480`, and landscape mode, `layout-w800` folder is loaded.


### Key takeaway

> Explain **What is the difference between `sw` and `w` and `h` as postfix in order to define the resour…** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

What are the major differences between `ListView` and `RecyclerView`?

### Answer

- **In plain words:**

  - **ViewHolder Pattern**: `Recyclerview` implements the ViewHolders pattern whereas it is not mandatory in a ListView. A `ViewHolder` object stores each of the component views inside the tag field of the Layout, so you can immediately access them without the need to look them up repeatedly. In `ListView`, the code might call `findViewById()` frequently during the scrolling of `ListView`, which can slow down performance. Even when the `Adapter` returns an inflated view for recycling, you still need to look up
      the elements and update them. A way around repeated use of `findViewById()`  is to use the "view holder" design pattern.

    - **LayoutManager**: In a `ListView`, the only type of view available is the `vertical` ListView. A `RecyclerView` decouples list from its container so we can put list items easily at run time in the different containers (linearLayout, gridLayout) by setting LayoutManager.

    - **Item Animator**: `ListViews` are lacking in support of good animations,
      but the `RecyclerView` brings a whole new dimension to it.


### Key takeaway

> Explain **What are the major differences between `ListView` and `RecyclerView`** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

How do we save and restore an activity's state during screen rotation?

### Answer

- **In plain words:**

  We can use onSavedInstanceState(bundle:Bundle) to save the activity's state inside a bundle. Then we can use onRestoreInstanceState(bundle) to restore the state of activity.


### Key takeaway

> We can use onSavedInstanceState(bundle:Bundle) to save the activity's state inside a bundle.


---

### Question

How to handle crashing of AsyncTask during screen rotation?

### Answer

- **In plain words:**

  One way is by cancelling the AsyncTask by using cancel() method on its instance. It will call onCancelled() method of AsyncTask where we can do some clean-up activities like hiding progress bar etc.  </br>
      The best way to handle AsyncTask crash is to create a RetainFragment, i.e., a fragment without UI as shown in the list below: https://gist.github.com/vamsitallapudi/26030c15829d7be8118e42b1fcd0fa42  </br>
      We can also avoid this crash by using 2 Alternatives -  </br>
      1) Using RxJava by subscribing and unsubscribing at onResume() and onPause() methods respectively. </br>
      2) Using LiveData - lifecycle aware component.


### Useful links

- https://gist.github.com/vamsitallapudi/26030c15829d7be8118e42b1fcd0fa42


### Key takeaway

> One way is by cancelling the AsyncTask by using cancel() method on its instance.


---

### Question

How does the activity respond when orientation is changed?

### Answer

- **In plain words:**

  According to the [documentation](https://developer.android.com/guide/topics/resources/runtime-changes), Some device configurations can change during runtime (such as screen orientation, keyboard availability, and when the user enables multi-window mode). When such a change occurs, Android restarts the running `Activity` ( `onDestroy()` is called, followed by `onCreate()`). The restart behavior is designed to help your application adapt to new configurations by automatically reloading your application with alternative resources that match the new device configuration.


### Useful links

- [documentation](https://developer.android.com/guide/topics/resources/runtime-changes)


### Key takeaway

> According to the [documentation](https://developer.


---

### Question

How to prevent the data from reloading when orientation is changed?

### Answer

- **In plain words:**

  The most basic approach would be to use a combination of `ViewModels` and `onSaveInstanceState()`. A `ViewModel` is LifeCycle-Aware. In other words, a `ViewModel` will not be destroyed if its owner is destroyed for a configuration change (e.g. rotation). The new instance of the owner will just re-connected to the existing `ViewModel`. So if you rotate an `Activity` three times, you have just created three different `Activity` instances, but you only have one `ViewModel`. So the common practice is to store data in the `ViewModel` class (since it persists data during configuration changes) and use `OnSaveInstanceState()` to store small amounts of UI data.


### Key takeaway

> The most basic approach would be to use a combination of `ViewModels` and `onSaveInstanceState()`.


---

### Question

What is the relationship between the life cycle of an `AsyncTask` and an `Activity`? What problems can this result in? How can these problems be avoided?

### Answer

- **In plain words:**

  An AsyncTask is not tied to the life cycle of the Activity that contains it. So, for example, if you start an AsyncTask inside an Activity and the user rotates the device, the Activity will be destroyed (and a new Activity instance will be created) but the AsyncTask will not die but instead goes on living until it completes.  </br>
    Then, when the AsyncTask does complete, rather than updating the UI of the new Activity, it updates the former instance of the Activity (i.e. the one in which it was created but that is not displayed anymore!). This can lead to an Exception (of the type java.lang.IllegalArgumentException: View not attached to window manager if you use, for instance, findViewById to retrieve a view inside the Activity).  </br>
    There’s also the potential for this to result in a memory leak since the AsyncTask maintains a reference to the Activity, which prevents the Activity from being garbage collected as long as the AsyncTask remains alive. </br>
    For these reasons, using AsyncTasks for long-running background tasks is generally a bad idea. Rather, for long-running background tasks, a different mechanism (such as a service) should be employed.


### Key takeaway

> An AsyncTask is not tied to the life cycle of the Activity that contains it.


---

### Question

Headless fragment vs Service

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://stackoverflow.com/questions/22799759/what-is-the-difference-between-a-headless-fragment-and-a-service-in-android


### Key takeaway

> Bookmark **Headless fragment vs Service**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

Service Lifecycle

### Answer

- **In plain words:**

  <img src="/assets/service_lifecycle.png" width="250">


### Key takeaway

> Know **Service Lifecycle** cold for interviews—add one production example.


---

### Question

Difference between `Activity` and `Service`?

### Answer

- **In plain words:**

  - **Activity:** An activity is the entry point for interacting with the user. It represents a single screen with a user interface.
    - **Service:** A service is a general-purpose entry point for keeping an app running in the background for all kinds of reasons. It is a component that runs in the background to perform long-running operations or to perform work for remote processes. A service does not provide a user interface.


### Key takeaway

> Explain **Difference between `Activity` and `Service`** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

How would you update the UI of an activity from a background service

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://medium.com/@anitaa_1990/how-to-update-an-activity-from-background-service-or-a-broadcastreceiver-6dabdb5cef74


### Key takeaway

> Bookmark **How would you update the UI of an activity from a background service**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

What is thread-safe mean? How we can make our code thread-safe?

### Answer

- **In plain words:**

  Thread safety in java is the process to make our program safe to use in multithreaded environment, there are different ways through which we can make our program thread safe.
      - Synchronization
      - Use of Atomic Wrapper, For example AtomicInteger.
      - Use of locks from java.util.concurrent.locks package.
      - Using thread safe collection classes
      - Using volatile keyword.  </br>

    Note that if two threads are both reading and writing to a shared variable, then using the volatile keyword for that is not enough. You need to use a synchronized in that case to guarantee that the reading and writing of the variable is atomic. Reading or writing a volatile variable does not block threads reading or writing. For this to happen you must use the synchronized keyword around critical sections.


### Key takeaway

> Thread safety in java is the process to make our program safe to use in multithreaded environment, there are different ways through which we can make our program thread safe.


---

### Question

What are Handlers?

### Answer

- **In plain words:**

  Handlers are objects for managing threads. It receives messages and writes code on how to handle the message. They run outside of the activity’s lifecycle, so they need to be cleaned up properly or else you will have thread leaks. Handlers allow communicating between the background thread and the main thread. Handler delivers messages and runnables to the message queue and execute them as they come out of the message queue. We will generally use handler class when we want to repeat task every few seconds.


### Key takeaway

> Handlers are objects for managing threads.


---

### Question

What is HandlerThread?

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://medium.com/@ankit.sinhal/messagequeue-and-looper-in-android-3a18c7fc9181


### Key takeaway

> Bookmark **What is HandlerThread**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

What is a Message?

### Answer

- **In plain words:**

  Message contains a description and arbitrary data object that can be sent to a Handler. Basically its used to process / send some data across threads.


### Key takeaway

> Message contains a description and arbitrary data object that can be sent to a Handler.


---

### Question

AIDL vs Messenger Queue

### Answer

- **In plain words:**

  * AIDL is for purpose when you've to go application level communication for data and control sharing, a scenario depicting it can be : An app requires list of all contacts from Contacts app (content part lies here) plus it also wants to show the call's duration and you can also disconnect it from that app (control part lies here).
    * In Messenger queues you're more IN the application and working on threads and processes to manage the queue having messages so no Outside services interference here.</br>
    * Messenger is needed if you want to bind a remote service (e.g. running in another process).</br>


### Key takeaway

> Explain **AIDL vs Messenger Queue** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

What is the difference between `Foreground` and `Background` and `Bounded` service?

### Answer

- **In plain words:**

  - **Foreground Service:** A foreground `service` performs some operation that is noticeable to the user. For example, we can use a foreground service to play an audio track. A `Notification` must be displayed to the user.
    - **Background Service:** A background `service` performs an operation that isn’t directly noticed by the user. In Android API level 26 and above, there are restrictions to using background services and it is recommended to use WorkManager in these cases
    - **Bound Service:** A `service` is bound when an application component binds to it by calling `bindService()`. A bound service offers a client-server interface that allows components to interact with the `service`, send requests, receive results. A bound service runs only as long as another application component is bound to it. [Read More](https://developer.android.com/guide/components/services)


### Useful links

- [Read More](https://developer.android.com/guide/components/services)


### Key takeaway

> Explain **What is the difference between `Foreground` and `Background` and `Bounded` service** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

Bound Service vs UnBounded service?

### Answer

- **In plain words:**

  **A Bound service** is started by using method bindService(). As mentioned above system destroys bound service when no application component is accessing it. A Bound Service will stop automatically by the system when all the Application Components bound to it are unbinded.</br>
      **Unbounded service (started service)** is started by using a method called startService(). Once started, it will run indefinitely even if the application component that started it is destroyed.


### Key takeaway

> **A Bound service** is started by using method bindService().


---

### Question

Difference between `Intent` and `IntentService`?

### Answer

- **In plain words:**

  - `Service` is the base class for Android services that can be extended to create any service. A class that directly extends `Service` runs on the main thread so it will block the UI (if there is one) and should therefore either be used only for short tasks or should make use of other threads for longer tasks.

    - `IntentService` is a subclass of `Service` that handles asynchronous requests (expressed as `Intents`) on demand. Clients send requests through `startService(Intent)` calls. The service is started as needed, handles each `Intent` in turn using a worker thread, and stops itself when it runs out of work. [Read More on Mindorks's blog]("https://blog.mindorks.com/service-vs-intentservice-in-android")


### Useful links

- https://blog.mindorks.com/service-vs-intentservice-in-android


### Key takeaway

> Explain **Difference between `Intent` and `IntentService`** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

Difference between Service, Intent Service, AsyncTask & Threads

### Answer

- **In plain words:**

  * **Android service** is a component that is used to perform operations on the background such as playing music. It doesn’t has any UI (user interface). The service runs in the background indefinitely even if application is destroyed. A class that directly extends Service runs on the main thread so it will block the UI (if there is one). This might cause ANR errors and hould therefore either be used only for short tasks or should make use of other threads for longer tasks. To stop a service from an activity we can call stopService(Intent intent) method. To Stop a service from itself, we can call stopSelf() method.</br>
    * **AsyncTask** allows you to perform asynchronous work on your user interface. It performs the blocking operations in a worker thread and then publishes the results on the UI thread, without requiring you to handle threads and/or handlers yourself.</br>
    * **IntentService** is a base class for Services that handle asynchronous requests (expressed as Intents) on demand. Clients send requests through startService(Intent) calls; the service is started as needed, handles each Intent in turn using a worker thread, and stops itself after its job is done. The IntentService can be used in long tasks usually with no communication to Main Thread. If communication is required, can use Main Thread handler or broadcast intents. Another case of use is when callbacks are needed (Intent triggered tasks).</br>
    * A **thread** is a single sequential flow of control within a program. it should be used to separate long running operations from main thread so that performance is improved. But it can't be cancelled elegantly and it can't handle configuration changes of Android. You can't update UI from Thread. </br>


### Key takeaway

> Explain **Difference between Service, Intent Service, AsyncTask & Threads** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

When to use AsyncTask and when to use services?

### Answer

- **In plain words:**

  Services are useful when you want to run code even when your application's Activity isn't open. AsyncTask is a helper class used to run some code in a separate thread and publish results in main thread. Usually AsyncTask is used for small operations and services are used for long running operations.


### Key takeaway

> Services are useful when you want to run code even when your application's Activity isn't open.


---

### Question

What is an Intent Service? What is the method that differentiates it to make Service run in background?

### Answer

- **In plain words:**

  IntentService is a subclass of Service that can perform tasks using worker thread unlike service that blocks main thread. The additional method of IntentService is -
      **<i>onHandleIntent(Intent)</i>** which helps the IntentService to run a particular code block declared inside it, in worker/background thread. The speciality of Intent Service is if there are more tasks given to it, IntentService will pass those intents one by one to the Worker thread. So if there are multiple download operations to be handled, They will be performed in a sequential order. Only one request will be processed at a time.
      **Note:** IntentService is deprecated from API 30. This is due to background restrictions imposed from API level 26. It is now recommended to use WorkManager or JobIntentService. For more Info, [Click Here](https://developer.android.com/reference/android/app/IntentService)


### Useful links

- [Click Here](https://developer.android.com/reference/android/app/IntentService)


### Key takeaway

> IntentService is a subclass of Service that can perform tasks using worker thread unlike service that blocks main thread.


---

### Question

When to use a service and when to use a thread?

### Answer

- **In plain words:**

  We will use a Thread when we want to perform background operations when application is running in foreground. We will use a service even when the application is not running.


### Key takeaway

> We will use a Thread when we want to perform background operations when application is running in foreground.


---

### Question

What is Java ExecutorService

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://www.javatpoint.com/java-executorservice


### Key takeaway

> Bookmark **What is Java ExecutorService**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

What is a ThreadPool? And is it more effective than using several separate Threads?

### Answer

- **In plain words:**

  * Creating and destroying threads has a high CPU usage, so when we need to perform lots of small, simple tasks concurrently, the overhead of creating our own threads can take up a significant portion of the CPU cycles and severely affect the final response time.</br>
    * ThreadPool consists of a task queue and a group of worker threads, which allows it to run multiple parallel instances of a task.</br>


### Key takeaway

> Explain **What is a ThreadPool? And is it more effective than using several separate Threads** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

Modern background execution

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://android-developers.googleblog.com/2018/10/modern-background-execution-in-android.html


### Key takeaway

> Bookmark **Modern background execution**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

What is a Job Scheduling?

### Answer

- **In plain words:**

  * Job Scheduling api, as the name suggests, allows to schedule jobs while letting the system optimize based on memory, power, and connectivity conditions.
     * The JobScheduler supports batch scheduling of jobs. The Android system can combine jobs so that battery consumption is reduced. JobManager makes handling uploads easier as it handles automatically the unreliability of the network. It also survives application restarts. 
     * Scenarios:
       * Tasks that should be done once the device is connect to a power supply
       * Tasks that require network access or a Wi-Fi connection.
       * Task that are not critical or user facing
       * Tasks that should be running on a regular basis as batch where the timing is not critical
       * [Reference](http://www.vogella.com/tutorials/AndroidTaskScheduling/article.html#schedulingtasks) </br>


### Useful links

- [Reference](http://www.vogella.com/tutorials/AndroidTaskScheduling/article.html#schedulingtasks)


### Key takeaway

> Explain **What is a Job Scheduling** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

What is a BroadcastReceiver?

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://stackoverflow.com/questions/5296987/what-is-broadcastreceiver-and-when-we-use-it


### Key takeaway

> Bookmark **What is a BroadcastReceiver**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

What is a LocalBroadcastManager?

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://developer.android.com/reference/android/support/v4/content/LocalBroadcastManager.html


### Key takeaway

> Bookmark **What is a LocalBroadcastManager**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

What is a JobScheduler?

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- http://www.vogella.com/tutorials/AndroidTaskScheduling/article.html


### Key takeaway

> Bookmark **What is a JobScheduler**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

What is Workmanager?

### Answer

- **In plain words:**

  *  https://flexiple.com/android/android-workmanager-tutorial-getting-started
    *  https://blog.mindorks.com/integrating-work-manager-in-android


### Useful links

- https://flexiple.com/android/android-workmanager-tutorial-getting-started
- https://blog.mindorks.com/integrating-work-manager-in-android


### Key takeaway

> Explain **What is Workmanager** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

How Workmanager works?

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://www.kodeco.com/20689637-scheduling-tasks-with-android-workmanager


### Key takeaway

> Bookmark **How Workmanager works**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

Stateflow vs LiveData

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://scalereal.com/android/2020/05/22/stateflow-end-of-livedata.html


### Key takeaway

> Bookmark **Stateflow vs LiveData**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

Livedata vs ObservableField

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://blog.mindorks.com/livedata-vs-observable-in-android


### Key takeaway

> Bookmark **Livedata vs ObservableField**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

Livedata Setvalue vs Postvalue

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://medium.com/@shashankmohabia/livedata-setvalue-vs-postvalue-91ec550b4c80


### Key takeaway

> Bookmark **Livedata Setvalue vs Postvalue**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

What is renderscript?

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://blog.mindorks.com/comparing-android-ndk-and-renderscript-1a718c01f6fe


### Key takeaway

> Bookmark **What is renderscript**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

FlatBuffers vs JSON.

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://blog.mindorks.com/why-consider-flatbuffer-over-json-2e4aa8d4ed07


### Key takeaway

> Bookmark **FlatBuffers vs JSON**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

What is `contentProvider` and what is typically used for?

### Answer

- **In plain words:**

  A `ContentProvider` provides data from one application to another, when requested. It manages access to a structured set of data. It provides mechanisms for defining data security. [Learn more](https://medium.com/@sanjeevy133/an-idiots-guide-to-android-content-providers-part-1-970cba5d7b42).
    For further reading see the [official android documentation]("https://developer.android.com/guide/topics/providers/content-provider-basics" "Android official documentation")

  <img src="/assets/content-provider-diagram.png" width="400">


### Useful links

- [Learn more](https://medium.com/@sanjeevy133/an-idiots-guide-to-android-content-providers-part-1-970cba5d7b42)
- https://developer.android.com/guide/topics/providers/content-provider-basics


### Key takeaway

> A `ContentProvider` provides data from one application to another, when requested.


---

### Question

What is the difference between `implementation` and `api`?

### Answer

- **In plain words:**

  These two keywords work the same when you want to add a new library but the main difference occurs when using it in the internal library. Let's explain it with an example. Consider your app has a library called 'libraryA'. This library is also dependant on another library called 'libraryB'. the dependency flow will be : `app -> libraryA -> libraryB` . If the libraryB is declared in libraryA with keyword `implementation`, so your app module does not know anything about the classes of libraryB. So you can't access and use any classes of libraryB. If you want to do that, you must declare libraryB in the libraryA Gradle file with keyword `api`. For more information read [this medium link]("https://medium.com/mindorks/implementation-vs-api-in-gradle-3-0-494c817a6fa").


### Useful links

- https://medium.com/mindorks/implementation-vs-api-in-gradle-3-0-494c817a6fa


### Key takeaway

> These two keywords work the same when you want to add a new library but the main difference occurs when using it in the internal library.


---

### Question

What do you mean by Gradle wrapper?

### Answer

- **In plain words:**

  The Gradle wrapper is the most suitable way to initiate a Gradle build. A Gradle wrapper is a Window’s batch script which has a shell script for the OS (operating system). Once you start the Gradle build via the wrapper, you will see an auto download which runs the build.


### Key takeaway

> The Gradle wrapper is the most suitable way to initiate a Gradle build.


---

### Question

When to use Adapter pattern? (Not for RecyclerView or ListView)

### Answer

- **In plain words:**

  Use Adapter pattern when you need to make two class work with incompatible interfaces. Adapter pattern can also be used to encapsulate third party code so that your application only depends upon Adapter, which can adapt itself when third party code changes or you moved to a different third party library.


### Key takeaway

> Use Adapter pattern when you need to make two class work with incompatible interfaces.


---

### Question

In singleton pattern whether it is better to make the whole `getInstance()` method synchronized or just critical section is enough? Which one is preferable?

### Answer

- **In plain words:**

  Synchronization of whole `getInstance()` method is costly and is only needed during the initialization on singleton instance, to stop creating another instance of Singleton.  Therefore it is better to only synchronize critical section and not the whole method.


### Key takeaway

> Synchronization of whole `getInstance()` method is costly and is only needed during the initialization on singleton instance, to stop creating another instance of Singleton.


---

### Question

Log.v(), Log.d(), Log.i(), Log.w(), Log.e() - When to use each one?

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://stackoverflow.com/questions/7959263/android-log-v-log-d-log-i-log-w-log-e-when-to-use-each-one


### Key takeaway

> Bookmark **Log.v(), Log.d(), Log.i(), Log.w(), Log.e() - When to use each one**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

Understanding scope storage in android

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://blog.mindorks.com/understanding-the-scoped-storage-in-android


### Key takeaway

> Bookmark **Understanding scope storage in android**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

Solve out of memory error

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://blog.mindorks.com/practical-guide-to-solve-out-of-memory-error-in-android-application


### Key takeaway

> Bookmark **Solve out of memory error**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

What is ART? Difference between ART and Dalvik

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://blog.mindorks.com/what-are-the-differences-between-dalvik-and-art/#:~:text=What%20is%20ART%3F,like%20in%20case%20of%20Dalvik


### Key takeaway

> Bookmark **What is ART? Difference between ART and Dalvik**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

Battery optimizationn for Android

### Answer

- **Lead:** [Link](https://blog.mindorks.com/battery-optimization-for-android-apps-f4ef6170ff70)batteru
- **Resource:** See links below.


### Useful links

- https://blog.mindorks.com/battery-optimization-for-android-apps-f4ef6170ff70


### Key takeaway

> [Link](https://blog.mindorks.com/battery-optimization-for-android-apps-f4ef6170ff70)batteru


---

### Question

Reason for the exit in Android Application

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://blog.mindorks.com/reason-of-exit-in-android-application/


### Key takeaway

> Bookmark **Reason for the exit in Android Application**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

Android Jetpack component

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://blog.mindorks.com/what-is-android-jetpack-and-why-should-we-use-it


### Key takeaway

> Bookmark **Android Jetpack component**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

Android Architecture Component

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://blog.mindorks.com/what-are-android-architecture-components/


### Key takeaway

> Bookmark **Android Architecture Component**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

How ViewModel work internally?

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://blog.mindorks.com/android-viewmodels-under-the-hood


### Key takeaway

> Bookmark **How ViewModel work internally**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

Arraymap vs Sparsh Array

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://blog.mindorks.com/android-app-optimization-using-arraymap-and-sparsearray-f2b4e2e3dc47


### Key takeaway

> Bookmark **Arraymap vs Sparsh Array**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

Java Android Multithreading programming

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://blog.mindorks.com/java-android-multithreaded-programming-runnable-callable-future-executor


### Key takeaway

> Bookmark **Java Android Multithreading programming**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

How can you prevent creating another instance of singleton using `clone()` method?

### Answer

- **In plain words:**

  The preferred way to prevent creating another instance of a singleton is by not implementing Cloneable interface and if you do just throw an exception from `clone()` method "_not to create a clone of singleton class_".


### Key takeaway

> The preferred way to prevent creating another instance of a singleton is by not implementing Cloneable interface and if you do just throw an exception from `clone()` method "_not to create a clone of singleton class_".


---

### Question

When will you prefer to use a Factory Pattern?

### Answer

- **In plain words:**

  The factory pattern is preferred in the following cases:
      - A class does not know which class of objects it must create
      - Factory pattern can be used where we need to create an object of any one of sub-classes depending on the data provided
      - you can use factory pattern where you have to create an object of any one of sub-classes depending on the given data


### Key takeaway

> The factory pattern is preferred in the following cases: - A class does not know which class of objects it must create - Factory pattern can be used where we need to create an object of any one of sub-classes depending o…


---

### Question

Why use a factory class to instantiate a class when we can use new operator?

### Answer

- **In plain words:**

  Factory classes provide flexibility in terms of design. Below are some of the
    benefits of factory class:
      - Factory design pattern results in more decoupled code as it allows us to
        hide creational logic from dependent code
      - It allows us to introduce an [Inversion of Control]("https://www.codeproject.com/Articles/592372/Dependency-Injection-DI-vs-Inversion-of-Control-IO" "What is IoC?") container
      - It gives you a lot more flexibility when it comes time to change the
        application as our creational logic is hidden from dependant code


### Useful links

- https://www.codeproject.com/Articles/592372/Dependency-Injection-DI-vs-Inversion-of-Control-IO


### Key takeaway

> Factory classes provide flexibility in terms of design.


---

### Question

which pattern is used when we need to decouple an abstraction from its implementation?

### Answer

- **In plain words:**

  When we want to decouple an abstraction from its implementation in order that two can vary independently we use **bridge pattern**.


### Key takeaway

> When we want to decouple an abstraction from its implementation in order that two can vary independently we use **bridge pattern**.


---

### Question

What is ABI Management?

### Answer

- **In plain words:**

  Different Android handsets use different CPUs, which in turn support different instruction sets. Each combination of CPU and instruction sets has its own Application Binary Interface, or ABI. The ABI defines, with great precision, how an  application's machine code is supposed to interact with the system at runtime. You must specify an ABI for each CPU  architecture you want your app to work with. You can checkout the full specifcations [here](https://developer.android.com/ndk/guides/abis)</br>


### Useful links

- [here](https://developer.android.com/ndk/guides/abis)


### Key takeaway

> Different Android handsets use different CPUs, which in turn support different instruction sets.


---

### Question

Why bytecode cannot be run in Android?

### Answer

- **In plain words:**

  Android uses DVM (Dalvik Virtual Machine ) rather using JVM(Java Virtual Machine).</br>


### Key takeaway

> Android uses DVM (Dalvik Virtual Machine ) rather using JVM(Java Virtual Machine).


---

### Question

What are Android Runtime (ART) and Dalvik?

### Answer

- **In plain words:**

  Android Runtime (ART) and Dalvik are both execution environments for running Android applications, but they have some key differences:<br>

      **Dalvik:** It was the default runtime environment used by Android devices up until version 4.4 KitKat. Dalvik utilizes a Just-In-Time (JIT) compiler, which means it compiles the code at runtime, as needed. This approach is efficient in terms of memory usage because only the parts of the code that are needed are compiled.<br>
      **ART:** Introduced as an experimental feature in KitKat and later becoming the default runtime in Android 5.0 Lollipop, ART uses an Ahead-Of-Time (AOT) compiler. With AOT, the entire application code is compiled during installation, which improves app performance, especially startup times, because the code is already compiled to native instructions that the device’s CPU can execute directly.<br>

      Here are some of the features and differences between ART and Dalvik:
      **Compilation Approach**:
        - **Dalvik** compiles only the necessary parts of the code at runtime (JIT).
        - **ART** compiles the entire application code at install time (AOT).<br>

      **Performance**:
        - **Dalvik** may experience lag during execution as it compiles code on the fly.
        - **ART** provides faster execution of applications due to pre-compilation.<br>

      **Storage and Booting Time**:
        - **Dalvik** has a smaller memory footprint and boots faster compared to ART.
        - **ART** requires more storage space because it compiles the entire code during installation.<br>

      **Battery Performance and Garbage Collection**:
        - **ART** improves battery performance and has better garbage collection capabilities, leading to improved memory management<br>

      Both ART and Dalvik are compatible with running DEX (Dalvik Executable) bytecode, which is the format Android apps are compiled into. This means apps developed for Dalvik should generally work when running with ART, although some techniques that work on Dalvik do not work on ART.


### Key takeaway

> Android Runtime (ART) and Dalvik are both execution environments for running Android applications, but they have some key differences: **Dalvik:** It was the default runtime environment used by Android devices up until version 4.


---

### Question

What is a BuildType in Gradle? And what can you use it for?

### Answer

- **In plain words:**

  * Build types define properties that Gradle uses when building and packaging your Android app.
     * A build type defines how a module is built, for example whether ProGuard is run.
     * A product flavor defines what is built, such as which resources are included in the build.
     * Gradle creates a build variant for every possible combination of your project’s product flavors and build types.</br>


### Key takeaway

> Explain **What is a BuildType in Gradle? And what can you use it for** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

Are you familiar with ProGuard/DexGuard/R8 Minification?

### Answer

- **In plain words:**

  ProGuard, DexGuard, and R8 are tools used in Android development to optimize and protect the application code. Here’s a brief overview of each:<br>

     **ProGuard:** It is an open-source tool that shrinks, optimizes, and obfuscates Java code. It removes unused code and resources, making the APK smaller. ProGuard also makes the code more difficult to reverse-engineer by renaming classes, fields, and methods with non-descriptive names.<br>

     **DexGuard:**: A commercial tool that offers more advanced protection features than ProGuard. It provides stronger encryption and obfuscation techniques, and it can also protect against static and dynamic analysis, making it harder for attackers to tamper with or reverse-engineer the application.<br>

     **R8:** The latest official code shrinker and minifier from Google, which is integrated into Android Studio. R8 combines shrinking, desugaring, dexing, and obfuscation into one step. It’s designed to be backward-compatible with ProGuard, meaning it can use ProGuard configuration files. R8 improves build times and results in smaller APK sizes compared to ProGuard.


### Key takeaway

> ProGuard, DexGuard, and R8 are tools used in Android development to optimize and protect the application code.


---

### Question

What is the difference between a process and a thread?

### Answer

- **In plain words:**

  **Process**:
          - Runs in its own instance of the virtual machine.
          - Contains components like activities, services, and broadcast receivers.
          - Can be specified to run certain components in separate processes via `AndroidManifest.xml`.
          - Managed by the Android system, which may shut down processes to conserve resources.
          - Each process is isolated from others, ensuring that one process does not interfere with another.<br>

      **Thread**:
          - The smallest unit of execution within a process.
          - The main thread handles UI and event dispatching.
          - Additional threads can be created for background work.
          - Threads within the same process share the same memory space


### Key takeaway

> **Process**: - Runs in its own instance of the virtual machine.


---

### Question

What is the difference between a process and a task?

### Answer

- **In plain words:**

  - A **process** is about the execution and management of resources at the system level.
      - A **task** is about the user’s journey through a sequence of activities within or across applications.


### Key takeaway

> Explain **What is the difference between a process and a task** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

What is AAPT?

### Answer

- **In plain words:**

  AAPT2 (Android Asset Packaging Tool) is a build tool that Android Studio and Android Gradle Plugin use to compile and package your app’s resources. AAPT2 parses, indexes, and compiles the resources into a binary format that is optimized for the Android platform.


### Key takeaway

> AAPT2 (Android Asset Packaging Tool) is a build tool that Android Studio and Android Gradle Plugin use to compile and package your app’s resources.


---

### Question

Explain the build process in Android:

### Answer

- **In plain words:**

  * First step involves compiling the resources folder (/res) using the aapt (android asset packaging tool) tool. These are compiled to a single class file called R.java. This is a class that just contains constants.
    * Second step involves the java source code being compiled to .class files by javac, and then the class files are converted to Dalvik bytecode by the "dx" tool, which is included in the sdk 'tools'. The output is classes.dex. 
    * The final step involves the android apkbuilder which takes all the input and builds the apk (android packaging key) file.</br>


### Key takeaway

> Explain **Explain the build process in Android:** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

What is Manifest file and R.java file in Android?

### Answer

- **In plain words:**

  * **Manifest**: Every application must have an AndroidManifest.xml file (with precisely that name) in its root directory. The manifest presents essential information about the application to the Android system, information the system must have before it can run any of the application's code. It contains information of your package, including components of the application such as activities, services, broadcast receivers, content providers etc.
      * **R.Java**: It is an auto-generated file by aapt (Android Asset Packaging Tool) that contains resource IDs for all the resources of res/ directory. </br>

   * **How does the activity respond when the user rotates the screen?** </br>
     When the screen is rotated, the current instance of activity is destroyed a new instance of the Activity is created in the new orientation. The onRestart() method is invoked first when a screen is rotated. The other lifecycle methods get invoked in the similar flow as they were when the activity was first created.</br>


### Key takeaway

> Explain **What is Manifest file and R.java file in Android** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

Mention two ways to clear the back stack of Activities when a new Activity is called using intent

### Answer

- **In plain words:**

  The first approach is to use a FLAG_ACTIVITY_CLEAR_TOP flag. The second way is by using FLAG_ACTIVITY_CLEAR_TASK and FLAG_ACTIVITY_NEW_TASK in conjunction.</br>


### Key takeaway

> The first approach is to use a FLAG_ACTIVITY_CLEAR_TOP flag.


---

### Question

What’s the difference between FLAG_ACTIVITY_CLEAR_TASK and FLAG_ACTIVITY_CLEAR_TOP?

### Answer

- **In plain words:**

  * **FLAG_ACTIVITY_CLEAR_TASK** is used to clear all the activities from the task including any existing instances of the class invoked. The Activity launched by intent becomes the new root of the otherwise empty task list. This flag has to be used in conjunction with FLAG_ ACTIVITY_NEW_TASK.</br>
    * **FLAG_ACTIVITY_CLEAR_TOP** on the other hand, if set and if an old instance of this Activity exists in the task list then barring that all the other activities are removed and that old activity becomes the root of the task list. Else if there’s no instance of that activity then a new instance of it is made the root of the task list. Using FLAG_ACTIVITY_NEW_TASK in conjunction is a good practice, though not necessary.</br>


### Key takeaway

> Explain **What’s the difference between FLAG_ACTIVITY_CLEAR_TASK and FLAG_ACTIVITY_CLEAR_TOP** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

Describe content providers

### Answer

- **In plain words:**

  * A ContentProvider provides data from one application to another, when requested. It manages access to a structured set of data.  It provides mechanisms for defining data security. ContentProvider is the standard interface that connects data in one process with code running in another process.</br>  
    * When you want to access data in a **ContentProvider**, you must instead use the ContentResolver object in your application’s Context to communicate with the provider as a client. The provider object receives data requests from clients, performs the requested action, and returns the results.</br>


### Key takeaway

> Explain **Describe content providers** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

Access data using Content Provider:

### Answer

- **In plain words:**

  * Start by making sure your Android application has the necessary read access permissions. Then, get access to the ContentResolver object by calling getContentResolver() on the Context object, and retrieving the data by constructing a query using ContentResolver.query().</br>
    * The ContentResolver.query() method returns a Cursor, so you can retrieve data from each column using Cursor methods.</br>


### Key takeaway

> Explain **Access data using Content Provider:** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

What is the onTrimMemory() method?

### Answer

- **In plain words:**

  * ```onTrimMemory()```: Called when the operating system has determined that it is a good time for a process to trim unneeded memory from its process. This will happen for example when it goes in the background and there is not enough memory to keep as many background processes running as desired.
     * Android can reclaim memory for from your app in several ways or kill your app entirely if necessary to free up memory for critical tasks. To help balance the system memory and avoid the system's need to kill your app process, you can implement the ```ComponentCallbacks2``` interface in your Activity classes. The provided onTrimMemory() callback method allows your app to listen for memory related events when your app is in either the foreground or the background, and then release objects in response to app lifecycle or system events that indicate the system needs to reclaim memory. [Reference](https://developer.android.com/topic/performance/memory)</br>


### Useful links

- [Reference](https://developer.android.com/topic/performance/memory)


### Key takeaway

> Explain **What is the onTrimMemory() method** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

What is an intent?

### Answer

- **In plain words:**

  * Intents are messages that can be used to pass information to the various components of android. For instance, launch an activity, open a webview etc.</br>
    * Two types of intents-</br> 
      * Implicit: Implicit intent is when you call system default intent like send email, send SMS, dial number.</br>
      * Explicit: Explicit intent is when you call an application activity from another activity of the same application.</br>


### Key takeaway

> Explain **What is an intent** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

What is a Sticky Intent?

### Answer

- **In plain words:**

  * Sticky Intents allows communication between a function and a service. 
    * ```sendStickyBroadcast()``` performs a sendBroadcast(Intent) known as sticky, i.e. the Intent you are sending stays around after the broadcast is complete, so that others can quickly retrieve that data through the return value of ```registerReceiver(BroadcastReceiver, IntentFilter)```.
    * For example, if you take an intent for ACTION_BATTERY_CHANGED to get battery change events: When you call registerReceiver() for that action — even with a null BroadcastReceiver — you **get the Intent that was last Broadcast for that action**. Hence, you can use this to find the state of the battery without necessarily registering for all future state changes in the battery.</br>


### Key takeaway

> Explain **What is a Sticky Intent** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

What is a Pending Intent?

### Answer

- **In plain words:**

  If you want someone to perform any Intent operation at future point of time on behalf of you, then we will use Pending Intent. </br>


### Key takeaway

> If you want someone to perform any Intent operation at future point of time on behalf of you, then we will use Pending Intent.


---

### Question

Describe fragments:

### Answer

- **In plain words:**

  Fragment is a UI entity attached to Activity. Fragments can be reused by attaching in different activities. Activity can have multiple fragments attached to it. Fragment must be attached to an activity and its lifecycle will depend on its host activity.</br>


### Key takeaway

> Fragment is a UI entity attached to Activity.


---

### Question

Describe fragment lifecycle

### Answer

- **In plain words:**

  * ```onAttach()``` : The fragment instance is associated with an activity instance.The fragment and the activity is not fully initialized. Typically you get in this method a reference to the activity which uses the fragment for further initialization work.
    * ```onCreate()``` : The system calls this method when creating the fragment. You should initialize essential components of the fragment that you want to retain when the fragment is paused or stopped, then resumed.
    * ```onCreateView()``` : The system calls this callback when it’s time for the fragment to draw its user interface for the first time. To draw a UI for your fragment, you must return a View component from this method that is the root of your fragment’s layout. You can return null if the fragment does not provide a UI.
    * ```onActivityCreated()``` : The onActivityCreated() is called after the onCreateView() method when the host activity is created. Activity and fragment instance have been created as well as the view hierarchy of the activity. At this point, view can be accessed with the findViewById() method. example. In this method you can instantiate objects which require a Context object
    * ```onStart()``` : The onStart() method is called once the fragment gets visible.
    * ```onResume()``` : Fragment becomes active.
    * ```onPause()``` : The system calls this method as the first indication that the user is leaving the fragment. This is usually where you should commit any changes that should be persisted beyond the current user session.
    * ```onStop()``` : Fragment going to be stopped by calling onStop()
    * ```onDestroyView()``` : Fragment view will destroy after call this method
    * ```onDestroy()``` :called to do final clean up of the fragment’s state but Not guaranteed to be called by the Android platform.</br>


### Key takeaway

> Explain **Describe fragment lifecycle** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

What is the difference between fragments & activities. Explain the relationship between the two.

### Answer

- **In plain words:**

  An Activity is an application component that provides a screen, with which users can interact in order to do something whereas a Fragment represents a behavior or a portion of user interface in an Activity (with its own lifecycle and input events, and which can be added or removed at will).</br>


### Key takeaway

> An Activity is an application component that provides a screen, with which users can interact in order to do something whereas a Fragment represents a behavior or a portion of user interface in an Activity (with its own lifecycle and input events, and which can be added or removed at will).


---

### Question

Why is it recommended to use only the default constructor to create a Fragment?

### Answer

- **In plain words:**

  The reason why you should be passing parameters through bundle is because when the system restores a fragment (e.g on config change), it will automatically restore your bundle. This way you are guaranteed to restore the state of the fragment correctly to the same state the fragment was initialised with.</br>


### Key takeaway

> The reason why you should be passing parameters through bundle is because when the system restores a fragment (e.


---

### Question

You’re replacing one Fragment with another — how do you ensure that the user can return to the previous Fragment, by pressing the Back button?

### Answer

- **In plain words:**

  We need to save each Fragment transaction to the backstack, by calling ```addToBackStack()``` before you ```commit()``` that transaction</br>


### Key takeaway

> We need to save each Fragment transaction to the backstack, by calling ```addToBackStack()``` before you ```commit()``` that transaction


---

### Question

Callbacks invoked during addition of a fragment to back stack and while popping back from back stack:

### Answer

- *(No additional notes in source.)*


### Code example

```addOnBackStackChangedListener``` is called when fragment is added or removed from the backstack. Use this [link](https://why-android.com/2016/03/29/learn-how-to-use-the-onbackstackchangedlistener/) for reference</br>

### Key takeaway

> ```addOnBackStackChangedListener``` is called when fragment is added or removed from the backstack.


---

### Question

What are retained fragments

### Answer

- **In plain words:**

  By default, Fragments are destroyed and recreated along with their parent Activity’s when a configuration change occurs. Calling ```setRetainInstance(true)``` allows us to bypass this destroy-and-recreate cycle, signaling the system to retain the current instance of the fragment when the activity is recreated.</br>


### Key takeaway

> By default, Fragments are destroyed and recreated along with their parent Activity’s when a configuration change occurs.


---

### Question

What is Toast in Android?

### Answer

- **In plain words:**

  Android Toast can be used to display information for the short period of time. A toast contains message to be displayed quickly and disappears after sometime.</br>


### Key takeaway

> Android Toast can be used to display information for the short period of time.


---

### Question

What are Loaders in Android?

### Answer

- **In plain words:**

  * Loader API was introduced in API level 11 and is used to load data from a data source to display in an activity or fragment. Loaders persist and cache results across configuration changes to prevent duplicate queries.
     * [Sample Implementation](https://medium.com/mindorks/a-journey-to-the-world-of-mvp-and-loaders-part-2-e176200e5866) </br>


### Useful links

- [Sample Implementation](https://medium.com/mindorks/a-journey-to-the-world-of-mvp-and-loaders-part-2-e176200e5866)


### Key takeaway

> Explain **What are Loaders in Android** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

What is the difference between a regular .png and a nine-patch image?

### Answer

- **In plain words:**

  It is one of a resizable bitmap resource which is being used as backgrounds or other images on the device. The NinePatch class allows drawing a bitmap in nine sections. The four corners are unscaled; the middle of the image is scaled in both axes, the four edges are scaled into one axis.</br>


### Key takeaway

> It is one of a resizable bitmap resource which is being used as backgrounds or other images on the device.


---

### Question

Difference between RelativeLayout and LinearLayout?

### Answer

- **In plain words:**

  * **Linear Layout** - Arranges elements either vertically or horizontally. i.e. in a row or column. 
     * **Relative Layout** - Arranges elements relative to parent or other elements.</br>


### Key takeaway

> Explain **Difference between RelativeLayout and LinearLayout** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

What is ConstraintLayout?

### Answer

- **In plain words:**

  * It allows you to create large and complex layouts with a flat view hierarchy (no nested view groups). It's similar to RelativeLayout in that all views are laid out according to relationships between sibling views and the parent layout, but it's more flexible than RelativeLayout and easier to use with Android Studio's Layout Editor.
     * [Sample Implementation](https://github.com/anitaa1990/ConstraintLayout-Sample) 
     * You can read more about how to implement a simple app with ConstraintLayout [here](https://android.jlelse.eu/learning-to-implement-constraintlayout-in-android-8ddc69fe0a1a), by yours truly :)</br>


### Useful links

- https://blog.mindorks.com/using-constraint-layout-in-android-531e68019cd
- [Sample Implementation](https://github.com/anitaa1990/ConstraintLayout-Sample)
- [here](https://android.jlelse.eu/learning-to-implement-constraintlayout-in-android-8ddc69fe0a1a)


### Key takeaway

> Bookmark **What is ConstraintLayout**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

When might you use a FrameLayout?

### Answer

- **In plain words:**

  * Frame Layouts are designed to contain a single item, making them an efficient choice when you need to display a single View.
     * If you add multiple Views to a FrameLayout then it’ll stack them one above the other, so FrameLayouts are also useful if you need overlapping Views, for example if you’re implementing an overlay or a HUD element.</br>


### Key takeaway

> Explain **When might you use a FrameLayout** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

What is Adapters?

### Answer

- **In plain words:**

  An adapter responsible for converting each data entry into a View that can then be added to the AdapterView (ListView/RecyclerView).</br>


### Key takeaway

> An adapter responsible for converting each data entry into a View that can then be added to the AdapterView (ListView/RecyclerView).


---

### Question

How to support different screen sizes?

### Answer

- **In plain words:**

  * Create a flexible layout - The best way to create a responsive layout for different screen sizes is to use ConstraintLayout as the base layout in your UI. ConstraintLayout allows you to specify the position and size for each view according to spatial relationships with other views in the layout. This way, all the views can move and stretch together as the screen size changes.
     * Create stretchable nine-patch bitmaps
     * Avoid hard-coded layout sizes - Use wrap_content or match_parent. Create alternative layouts - The app should provide alternative layouts to optimize the UI design for certain screen sizes. For eg: different UI for tablets
     * Use the smallest width qualifier.  For example, you can create a layout named main_activity that's optimized for handsets and tablets by creating different versions of the file in directories as follows:			
        * res/layout/main_activity.xml           # For handsets (smaller than 600dp available width)						
        * res/layout-sw600dp/main_activity.xml   # For 7” tablets (600dp wide and bigger). 
        * The smallest width qualifier specifies the smallest of the screen's two sides, regardless of the device's current orientation, so it's a simple way to specify the overall screen size available for your layout.</br>


### Key takeaway

> Explain **How to support different screen sizes** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

Outline the process of creating custom Views:

### Answer

- **In plain words:**

  * Create a class that Subclass a view
     * Create a res/values/attrs.xml file and declare the attributes you want to use with your custom View.
     * In your View class, add a constructor method, instantiate the Paint object, and retrieve your custom attributes.
     * Override either onSizeChanged() or onMeasure().
     * Draw your View by overriding onDraw().
     * [Sample Implementation](https://code.tutsplus.com/tutorials/android-sdk-creating-custom-views--mobile-14548) </br>


### Useful links

- [Sample Implementation](https://code.tutsplus.com/tutorials/android-sdk-creating-custom-views--mobile-14548)


### Key takeaway

> Explain **Outline the process of creating custom Views:** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

Briefly describe some ways that you can optimize View usage

### Answer

- **In plain words:**

  * Checking for excessive overdraw: install your app on an Android device, and then enable the "Debug GPU Overview" option.
     * Flattening your view hierarchy: inspect your view hierarchy using Android Studio’s ‘Hierarchy Viewer’ tool.
     * Measuring how long it takes each View to complete the measure, layout, and draw phases. You can also use Hierarchy Viewer to identify any parts of the rendering pipeline that you need to optimize.</br>


### Key takeaway

> Explain **Briefly describe some ways that you can optimize View usage** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

Bitmap pooling in android?

### Answer

- **In plain words:**

  Bitmap pooling is a simple technique, that aims to reuse bitmaps instead of creating new ones every time. When you need a bitmap, you check a bitmap stack to see if there are any bitmaps available. If there are not bitmaps available you create a new bitmap otherwise you pop a bitmap from the stack and reuse it. Then when you are done with the bitmap, you can put it on a stack.


### Useful links

- https://outcomeschool.com/blog/bitmap-pool


### Key takeaway

> Bookmark **Bitmap pooling in android**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

How you load your `Bitmaps`? What do you do for loading large bitmaps?

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://android.jlelse.eu/loading-large-bitmaps-efficiently-in-android-66826cd4ad53


### Key takeaway

> Bookmark **How you load your `Bitmaps`? What do you do for loading large bitmaps**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

What are the permission protection levels in Android?

### Answer

- **In plain words:**

  * **Normal** - A lower-risk permission that gives requesting applications access to isolated application-level features, with minimal risk to other applications, the system, or the user. The system automatically grants this type of permission to a requesting application at installation, without asking for the user's explicit approval.
     * **Dangerous** - A higher-risk permission. Any dangerous permissions requested by an application may be displayed to the user and require confirmation before proceeding, or some other approach may be taken to avoid the user automatically allowing the use of such facilities.
     * **Signature** - A permission that the system grants only if the requesting application is signed with the same certificate as the application that declared the permission. If the certificates match, the system automatically grants the permission without notifying the user or asking for the user's explicit approval.
     * **SignatureOrSystem** - A permission that the system grants only to applications that are in the Android system image or that are signed with the same certificate as the application that declared the permission.</br>


### Key takeaway

> Explain **What are the permission protection levels in Android** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

Uses permission vs Permission

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://stackoverflow.com/questions/14450839/uses-permission-vs-permission-for-android-permissions-in-the-manifest-xml-file


### Key takeaway

> Bookmark **Uses permission vs Permission**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

What is an Application Not Responding (ANR) error, and how can you prevent them from occurring in an app?

### Answer

- **In plain words:**

  An ANR dialog appears when your UI has been unresponsive for more than 5 seconds, usually because you’ve blocked the main thread. To avoid encountering ANR errors, you should move as much work off the main thread as possible.</br>


### Key takeaway

> An ANR dialog appears when your UI has been unresponsive for more than 5 seconds, usually because you’ve blocked the main thread.


---

### Question

What is a singleton class in Android?

### Answer

- **In plain words:**

  A singleton class is a class which can create only an object that can be shared all other classes.
     </br>


### Code example

```java
private static volatile RESTService instance;

protected RESTService(Context context) {
    super(context);
}

public static RESTService getInstance(Context context) {
    if (instance == null) {
        synchronized (RESTService.class) {
            if (instance == null) instance = new RESTService(context);
        }
    }
    return instance;
}
```

### Key takeaway

> A singleton class is a class which can create only an object that can be shared all other classes.


---

### Question

What is `SnapHelper`?

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://blog.mindorks.com/using-snaphelper-in-recyclerview-fc616b6833e8


### Key takeaway

> Bookmark **What is `SnapHelper`**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

How to handle multi-touch in android

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- [link](https://arjun-sna.github.io/android/2016/07/20/multi-touch-android/)


### Key takeaway

> Bookmark **How to handle multi-touch in android**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

How does RecyclerView work?

### Answer

- **In plain words:**

  * Let's start with some background on RecyclerView which is needed to understand ```onBindViewHolder()``` method inside RecyclerView.</br>
     * RecyclerView is designed to display long lists (or grids) of items. Say you want to display 100 rows of something. A simple approach would be to just create 100 views, one for each row and lay all of them out. But that would be wasteful because at any point of time, only 10 or so items could fit on screen and the remaining items would be off screen. So RecyclerView instead creates only the 10 or so views that are on screen. This way you get 10x better speed and memory usage. 
     * **But what happens when you start scrolling and need to start showing next views?**
       * Again a simple approach would be to create a new view for each new row that you need to show. But this way by the time you reach the end of the list you will have created 100 views and your memory usage would be the same as in the first approach. And creating views takes time, so your scrolling most probably wouldn't be smooth. This is why RecyclerView takes advantage of the fact that as you scroll, **new rows come on screen also old rows disappear off screen**. Instead of creating new view for each new row, an old view is recycled and reused by binding new data to it.
       * This happens inside the ```onBindViewHolder()``` method. Initially you will get new unused view holders and you have to fill them with data you want to display. But as you scroll you will start getting view holders that were used for rows that went off screen and you have to replace old data that they held with new data.</br>


### Key takeaway

> Explain **How does RecyclerView work** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

How does RecyclerView differ from ListView?

### Answer

- **In plain words:**

  * **ViewHolder Pattern**:  Recyclerview implements the ViewHolders pattern whereas it is not mandatory in a ListView. A RecyclerView recycles and reuses cells when scrolling. 
     * **What is a ViewHolder Pattern?** - A ViewHolder object stores each of the component views inside the tag field of the Layout, so you can immediately access them without the need to look them up repeatedly. In ListView, the code might call ```findViewById()``` frequently during the scrolling of ListView, which can slow down performance. Even when the Adapter returns an inflated view for recycling, you still need to look up the elements and update them. A way around repeated use of ```findViewById()``` is to use the "view holder" design pattern.
     * **LayoutManager**: In a ListView, the only type of view available is the vertical ListView.  A RecyclerView decouples list from its container so we can put list items easily at run time in the different containers (linearLayout, gridLayout) by setting LayoutManager.
     * **Item Animator**: ListViews are lacking in support of good animations, but the RecyclerView brings a whole new dimension to it.</br>


### Key takeaway

> Explain **How does RecyclerView differ from ListView** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

How would you implement swipe animation in Android

### Answer

- **In plain words:**

  </br>


### Code example

```xml
<set xmlns:android="http://schemas.android.com/apk/res/android"
    android:shareInterpolator="false">
    <translate
        android:fromXDelta="-100%"
        android:toXDelta="0%"
        android:fromYDelta="0%"
        android:toYDelta="0%"
        android:duration="700" />
</set>
```

### Key takeaway

> Bookmark **How would you implement swipe animation in Android**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

Shimmer effect animation placeholder

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://blog.mindorks.com/using-shimmer-effect-placeholder-in-android/


### Key takeaway

> Bookmark **Shimmer effect animation placeholder**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

Arraymap/SparseArray vs HashMap in Android?

### Answer

- **In plain words:**

  * [Article 1 on the subject](https://android.jlelse.eu/app-optimization-with-arraymap-sparsearray-in-android-c0b7de22541a)
     * [Article 2 on the subject](https://medium.com/@mohom.r/optimising-android-app-performance-with-arraymap-9296f4a1f9eb) </br>


### Useful links

- [Article 1 on the subject](https://android.jlelse.eu/app-optimization-with-arraymap-sparsearray-in-android-c0b7de22541a)
- [Article 2 on the subject](https://medium.com/@mohom.r/optimising-android-app-performance-with-arraymap-9296f4a1f9eb)


### Key takeaway

> Explain **Arraymap/SparseArray vs HashMap in Android** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

How to reduce apk size?

### Answer

- **In plain words:**

  * Enable proguard in your project by adding following lines to your release build type.
     * Enable shrinkResources.
     * Strip down all the unused locale resources by adding required resources name in “resConfigs”.
     * Convert all the images to the webp or vector drawables.
     </br>


### Useful links

- https://medium.com/exploring-code/how-you-can-decrease-application-size-by-60-in-only-5-minutes-47eff3e7874e


### Key takeaway

> Bookmark **How to reduce apk size**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

How to reduce build time of an Android app?

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://medium.com/exploring-code/how-to-decrease-your-gradle-build-time-by-65-310b572b0c43


### Key takeaway

> Bookmark **How to reduce build time of an Android app**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

Android Architecture Components?

### Answer

- **In plain words:**

  A collection of libraries that help you design robust, testable, and maintainable apps. [Official documentation](https://developer.android.com/topic/libraries/architecture/)</br>
    **Room**:
      - [Official documentation](https://developer.android.com/topic/libraries/architecture/room)
      - [Article on how to implement Room Db](https://medium.com/@anitaa_1990/5-steps-to-implement-room-persistence-library-in-android-47b10cd47b24)
      - [Sample  implementation](https://github.com/anitaa1990/RoomDb-Sample)
      - [Securing a Room Database With Passcode-Based Encryption](https://medium.com/vmware-end-user-computing/securing-a-room-database-with-passcode-based-encryption-82ec670961e)</br>

    **Live Data**:
      - [Official documentation](https://developer.android.com/topic/libraries/architecture/livedata)
      - [Sample  implementation](https://github.com/anitaa1990/GameOfThronesTrivia)</br>

    **ViewModel**:
      - [Official documentation](https://developer.android.com/topic/libraries/architecture/viewmodel)
      - [Sample  implementation](https://github.com/anitaa1990/GameOfThronesTrivia)</br>

    **Data Binding & View Binding**:
      - [Official documentation](https://developer.android.com/topic/libraries/data-binding/)
      - [Sample  implementation](https://github.com/anitaa1990/DataBindingExample)
      - [Data Binding vs View Binding](https://stackoverflow.com/questions/58040778/android-difference-between-databinding-and-viewbinding)</br>

    **Lifecycles**:
      - [Official documentation](https://developer.android.com/topic/libraries/architecture/lifecycle)</br>


### Useful links

- [Official documentation](https://developer.android.com/topic/libraries/architecture/)
- [Official documentation](https://developer.android.com/topic/libraries/architecture/room)
- [Article on how to implement Room Db](https://medium.com/@anitaa_1990/5-steps-to-implement-room-persistence-library-in-android-47b10cd47b24)
- [Sample  implementation](https://github.com/anitaa1990/RoomDb-Sample)
- [Securing a Room Database With Passcode-Based Encryption](https://medium.com/vmware-end-user-computing/securing-a-room-database-with-passcode-based-encryption-82ec670961e)
- [Official documentation](https://developer.android.com/topic/libraries/architecture/livedata)
- [Sample  implementation](https://github.com/anitaa1990/GameOfThronesTrivia)
- [Official documentation](https://developer.android.com/topic/libraries/architecture/viewmodel)
- [Official documentation](https://developer.android.com/topic/libraries/data-binding/)
- [Sample  implementation](https://github.com/anitaa1990/DataBindingExample)
- [Data Binding vs View Binding](https://stackoverflow.com/questions/58040778/android-difference-between-databinding-and-viewbinding)
- [Official documentation](https://developer.android.com/topic/libraries/architecture/lifecycle)


### Key takeaway

> A collection of libraries that help you design robust, testable, and maintainable apps.


---

### Question

Why we should use MVP / MVVM architectures?

### Answer

- **In plain words:**

  - to avoid too much logic code in the UI layer and god activities
     - reusable code that's easier to test
     - avoid duplicated code between common views
     - Easier to maintain
     - we can test logic without using instrumentation tests


### Key takeaway

> Explain **Why we should use MVP / MVVM architectures** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

Why the View should be implemented with an interface in MVP?

### Answer

- **In plain words:**

  - Because we want to decouple the code from the implementation view.
     - We want to abstract the framework used to write our presentation layer, regardless of any external dependency.
     - We want to be able to easily change the implementation of view if needed.
     - We want to follow the SOLID dependency rule to improve unit testability and in order to follow the dependency rule, high-level concepts (such as the presenter implementation) can't depend on low-level details (like the implementation view).


### Key takeaway

> Explain **Why the View should be implemented with an interface in MVP** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

Why do you use dependency injection (DI / Dagger)?

### Answer

- **In plain words:**

  According to this concept a class should not configure its dependencies statically but should be configured from the outside = Inversion of Control
     - useful for decoupling the whole system
     - allow easier unit testing
     - much easier moving things around and keeping classes small and simple
     - help wiring different elements


### Key takeaway

> According to this concept a class should not configure its dependencies statically but should be configured from the outside = Inversion of Control - useful for decoupling the whole system - allow easier unit testing - m…


---

### Question

Difference between MVC & MVP & MVVM?

### Answer

- **In plain words:**

  * **MVC** is the Model-View-Controller architecture where model refers to the data model classes. The view refers to the xml files and the controller handles the business logic. The issue with this architecture is unit testing. The model can be easily tested since it is not tied to anything. The controller is tightly coupled with the android apis making it difficult to unit test. Modularity & flexibility is a problem since the view and the controller are tightly coupled. If we change the view, the controller logic should also be changed. Maintenance is also an issues.
     * **MVP architecture**: Model-View-Presenter architecture. The View includes the xml and the activity/fragment classes. So the activity would ideally implement a view interface making it easier for unit testing (since this will work without a view). [Sample Implementation](https://github.com/anitaa1990/Inshorts) 
     * **MVVM**: Model-View-ViewModel Architecture. The Model comprises data, tools for data processing, business logic.  The View Model is responsible for wrapping the model data and preparing the data for the view. IT also provides a hook to pass events from the view to the model.  [Sample Implementation](https://github.com/anitaa1990/Trailers)
     * **MVI**: [Link](https://proandroiddev.com/android-model-view-intent-with-kotlin-flow-ca5945316ec)


### Useful links

- [Sample Implementation](https://github.com/anitaa1990/Inshorts)
- [Sample Implementation](https://github.com/anitaa1990/Trailers)
- https://proandroiddev.com/android-model-view-intent-with-kotlin-flow-ca5945316ec


### Key takeaway

> Explain **Difference between MVC & MVP & MVVM** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

What is the role of Presenter in MVP?

### Answer

- **In plain words:**

  The Presenter is responsible to act as the middle man between View and Model. It retrieves data from the Model and returns it formatted to the View. But unlike the typical MVC, it also decides what happens when you interact with the View.


### Key takeaway

> The Presenter is responsible to act as the middle man between View and Model.


---

### Question

What is the advantage of MVVM over MVP?

### Answer

- **In plain words:**

  In MVP, Presenter is responsible for view data updates as well as data operations where as in MVVM, ViewModel does not hold any reference to View. It is the View's responsibility to pick the changes from ViewModel. This helps in writing more maintainable test cases since ViewModel does not depend upon View.


### Key takeaway

> In MVP, Presenter is responsible for view data updates as well as data operations where as in MVVM, ViewModel does not hold any reference to View.


---

### Question

What is Espresso

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://medium.com/mindorks/android-testing-part-1-espresso-basics


### Key takeaway

> Bookmark **What is Espresso**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

What is Screenshot testing

### Answer

- **In plain words:**

  *  https://github.com/facebook/screenshot-tests-for-android
     *  https://facebook.github.io/screenshot-tests-for-android/#getting-started


### Useful links

- https://github.com/facebook/screenshot-tests-for-android
- https://facebook.github.io/screenshot-tests-for-android/#getting-started


### Key takeaway

> Explain **What is Screenshot testing** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

What are SOLID Principles? How they are applicable in Android?

### Answer

- **In plain words:**

  SOLID unites all the best practices of software development over the years to deliver good quality apps. Understanding SOLID Principles will help us write clean and elegant code. It helps us write the code with SOC (Separation of Concerns).
      SOLID Principles is an acronym for:
      1. S stands for Single Responsibility Principle(SRP) - A class should have only one reason to change
      2. O stands for Open Closed Principle - Software entities such as classes, functions, modules should be open for extension but closed for modification.
      3. L stands for Liskov Substitution Principle - Derived class must be usable through the base class interface, without the need for user to know the difference.
      4. I stands for Interface Segregation - No client should be forced to depend on methods that it doesn't use.
      5. D stands for Dependency Inversion - 
         1. High Level Modules should not directly depend on Low level modules. Instead both should depend on abstractions.
         2. Abstractions should not depend on details. Details should depend on abstractions.


### Useful links

- https://www.coderefer.com/blog/solid-principles-in-android-with-kotlin-examples/


### Key takeaway

> Bookmark **What are SOLID Principles? How they are applicable in Android**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

What is Reflection?

### Answer

- **In plain words:**

  Reflection is an API that is used to examine or modify the behaviour of methods, classes and interfaces at runtime. The required classes for reflection are present in java.lang.reflect package.


### Key takeaway

> Reflection is an API that is used to examine or modify the behaviour of methods, classes and interfaces at runtime.


---

### Question

How to reduce your app size?

### Answer

- **In plain words:**

  1. setting minifyEnabled to true
      2. setting shrinkResources to true
      3. using bundle instead of apk in developer console
      4. converting the images to vector drawables.


### Key takeaway

> 1. setting minifyEnabled to true 2. setting shrinkResources to true 3. using bundle instead of apk in developer console 4. converting the images to vector drawables.


---

### Question

What is the advantage of using Retrofit over AsyncTask?

### Answer

- **Lead:** [Stackoverflow](https://stackoverflow.com/a/16903205/3424919)
- **In plain words:**

  Retrofit reduces boiler plate code by internally using GSON library which helps parsing the json file automatically. trofit is a type safe library. This means - it checks if wrong data type is assigned to variables at compilation time itself.


### Useful links

- [Stackoverflow](https://stackoverflow.com/a/16903205/3424919)


### Key takeaway

> [Stackoverflow](https://stackoverflow.com/a/16903205/3424919) Retrofit reduces boiler plate code by internally using GSON library which helps parsing the json file automatically. trofit is a type safe library. This means…


---

### Question

Advantage of Retrofit over Volley?

### Answer

- **In plain words:**

  Retrofit is type-safe. Type safety means that the compiler will validate request and response objects' variable types while compiling, and throw an error if you try to assign the wrong type to a variable.


### Key takeaway

> Retrofit is type-safe. Type safety means that the compiler will validate request and response objects' variable types while compiling, and throw an error if you try to assign the wrong type to a variable.


---

### Question

Advantage of Volley over Retrofit?

### Answer

- **In plain words:**

  Android Volley has a very elaborate and flexible cache mechanism. When a request is made through Volley, first the cache is checked for Response. If it is found, then it is fetched and parsed, else, it will hit Network to fetch the data. Retrofit does not support cache by default.


### Key takeaway

> Android Volley has a very elaborate and flexible cache mechanism.


---

### Question

How to handle multiple network calls using Retrofit?

### Answer

- **In plain words:**

  In Retrofit, we can call the operations asynchronously by using enqueue() method where as to call operations synchronously, we can use execute() method. In addition, we can use zip() operator from RxJava to perform multiple network calls using Retrofit library.


### Key takeaway

> In Retrofit, we can call the operations asynchronously by using enqueue() method where as to call operations synchronously, we can use execute() method.


---

### Question

How to post multipart form data using Retrofit?

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://stackoverflow.com/questions/34562950/post-multipart-form-data-using-retrofit-2-0-including-image


### Key takeaway

> Bookmark **How to post multipart form data using Retrofit**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

How to upload an image file in Retrofit 2?

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://stackoverflow.com/questions/39953457/how-to-upload-an-image-file-in-retrofit-2


### Key takeaway

> Bookmark **How to upload an image file in Retrofit 2**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

Usecases of OkHttp Interceptor

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://outcomeschool.com/blog/okhttp-interceptor


### Key takeaway

> Bookmark **Usecases of OkHttp Interceptor**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

What is Alarm Manager?

### Answer

- **In plain words:**

  AlarmManager is a class which helps scheduling your Application code to run at some point of time or at particular time intervals in future. When an alarm goes off, the Intent that had been registered for it is broadcast by the system, automatically starting the target application if it is not already running. Registered alarms are retained while the device is asleep (and can optionally wake the device up if they go off during that time), but will be cleared if it is turned off and rebooted.


### Key takeaway

> AlarmManager is a class which helps scheduling your Application code to run at some point of time or at particular time intervals in future.


---

### Question

How can I get continuous location updates in android like in Google Maps?

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://stackoverflow.com/a/41500910/3424919


### Key takeaway

> Bookmark **How can I get continuous location updates in android like in Google Maps**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

How to Work With Geofences?

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://code.tutsplus.com/how-to-work-with-geofences-on-android--cms-26639t


### Key takeaway

> Bookmark **How to Work With Geofences**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

Why Do You Need SSL Certificate Pinning? How it works?

### Answer

- **In plain words:**

  - https://medium.com/@anuj.rai2489/ssl-pinning-254fa8ca2109
      - https://dzone.com/articles/encryption-and-signing
      - https://www.netguru.com/codestories/3-ways-how-to-implement-certificate-pinning-on-android
      - https://www.raywenderlich.com/10056112-securing-network-data-tutorial-for-android
      - https://appmattus.medium.com/android-security-ssl-pinning-1db8acb6621e


### Useful links

- https://medium.com/@anuj.rai2489/ssl-pinning-254fa8ca2109
- https://dzone.com/articles/encryption-and-signing
- https://www.netguru.com/codestories/3-ways-how-to-implement-certificate-pinning-on-android
- https://www.raywenderlich.com/10056112-securing-network-data-tutorial-for-android
- https://appmattus.medium.com/android-security-ssl-pinning-1db8acb6621e


### Key takeaway

> Explain **Why Do You Need SSL Certificate Pinning? How it works** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

How do you know if the device is rooted?

### Answer

- **In plain words:**

  We can check if superUser apk is installed in the device or if it contains su file or xbin folder. </br>
     Alternatively you can use [RootBeer](https://github.com/scottyab/rootbeer) library available in GitHub. For code part, click [Here](https://stackoverflow.com/a/35628977/3424919).


### Useful links

- [RootBeer](https://github.com/scottyab/rootbeer)
- [Here](https://stackoverflow.com/a/35628977/3424919)


### Key takeaway

> We can check if superUser apk is installed in the device or if it contains su file or xbin folder.


---

### Question

What is Symmetric Encryption?

### Answer

- **In plain words:**

  Symmetric encryption deals with creating a passphrase and encrypting the file with it. Then the server needs to send this passphrase(key) to the client so that the client can decrypt. Here the problem is sending that key to decrypt the file. If Hackers can access that key, they can misuse the data.


### Key takeaway

> Symmetric encryption deals with creating a passphrase and encrypting the file with it.


---

### Question

What is Asymmetric Encryption?

### Answer

- **In plain words:**

  Using algorithms like RSA, AES256, etc., the server generates 2 keys - public key and private key. The server then gives public key to clients. Client then encrypts the sensitive data with that public key and send it back to server. Now as the server alone has the private key, only it can decrypt the data. This is the most efficient way of sending data across the client and server.

      Example of this Asymmetric encryption are HTTPS using SSL certificate, Blockchain technologies like Bitcoin, etc.

      For more info, refer to this [video](https://youtu.be/AQDCe585Lnc)


### Useful links

- [video](https://youtu.be/AQDCe585Lnc)


### Key takeaway

> Using algorithms like RSA, AES256, etc., the server generates 2 keys - public key and private key. The server then gives public key to clients. Client then encrypts the sensitive data with that public key and send it bac…


---

### Question

How do you encrypt the Data in Java?

### Answer

- **In plain words:**

  Using javax.crypto package's Cipher class. We can call the methods such as encrypt() or decrypt() from the Cipher class to encode or decode our data.

      To see Cipher in action, see the following [code commit](https://github.com/vamsitallapudi/Coderefer-Java-Projects/commit/443c4f7700fd68391da2ccf40f85a7e3bccd573d#diff-25a6634263c1b1f6fc4697a04e2b9904ea4b042a89af59dc93ec1f5d44848a26).


### Useful links

- [code commit](https://github.com/vamsitallapudi/Coderefer-Java-Projects/commit/443c4f7700fd68391da2ccf40f85a7e3bccd573d#diff-25a6634263c1b1f6fc4697a04e2b9904ea4b042a89af59dc93ec1f5d44848a26)


### Key takeaway

> Using javax.crypto package's Cipher class. We can call the methods such as encrypt() or decrypt() from the Cipher class to encode or decode our data. To see Cipher in action, see the following [code commit](https://githu…


---

### Question

App Data encryption

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://blog.mindorks.com/how-to-encrypt-data-safely-on-device-and-use-the-androidkeystore


### Key takeaway

> Bookmark **App Data encryption**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

How to save password safely in Android?

### Answer

- **In plain words:**

  - https://developer.android.com/privacy-and-security/keystore
      - https://medium.com/@josiassena/using-the-android-keystore-system-to-store-sensitive-information-3a56175a454b
      - https://source.android.com/docs/security/features/keystore
      - https://www.linkedin.com/feed/update/urn:li:activity:7240434808684716032/


### Useful links

- https://developer.android.com/privacy-and-security/keystore
- https://medium.com/@josiassena/using-the-android-keystore-system-to-store-sensitive-information-3a56175a454b
- https://source.android.com/docs/security/features/keystore
- https://www.linkedin.com/feed/update/urn:li:activity:7240434808684716032/


### Key takeaway

> Explain **How to save password safely in Android** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

How to avoid memory leaks in Android?

### Answer

- **In plain words:**

  ### Android Memory Related


### Useful links

- https://www.geeksforgeeks.org/memory-leaks-in-android/


### Key takeaway

> Bookmark **How to avoid memory leaks in Android**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

How do you create a Memory Leak in Android?

### Answer

- **In plain words:**

  By passing the context to static block (class or method), we can create a Memory Leak.


### Key takeaway

> By passing the context to static block (class or method), we can create a Memory Leak.


---

### Question

How do you avoid a Memory Leak in Android?

### Answer

- **In plain words:**

  By making the objects eligible for GC (Garbage Collection) after a class (Activity or Fragment) is destroyed. We can also use Weak References like WeakHashMaps to loosely hold the data and make it easily available to GC.


### Key takeaway

> By making the objects eligible for GC (Garbage Collection) after a class (Activity or Fragment) is destroyed.


---

### Question

How do you identify a Memory Leak in Android?

### Answer

- **In plain words:**

  By using Profiler in Android Studio or by using LeakCanary Library in Android.


### Key takeaway

> By using Profiler in Android Studio or by using LeakCanary Library in Android.


---

### Question

APK Size Reduction.

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://blog.mindorks.com/how-to-reduce-apk-size-in-android-2f3713d2d662


### Key takeaway

> Bookmark **APK Size Reduction**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

CICD for Android

### Answer

- **In plain words:**

  * [Using Workflow](https://blog.mindorks.com/github-actions-for-android/)
    * [Using Jenkins and Docker](https://www.unosquare.com/blog/how-to-setup-a-ci-cd-pipeline-for-android-using-jenkins-and-docker-part-2/

  ### Android Battery Related


### Useful links

- [Using Workflow](https://blog.mindorks.com/github-actions-for-android/)
- https://www.unosquare.com/blog/how-to-setup-a-ci-cd-pipeline-for-android-using-jenkins-and-docker-part-2/


### Key takeaway

> Explain **CICD for Android** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

How do you reduce battery consumption?

### Answer

- **In plain words:**

  1. Never poll the server for updates.
      2. Sync only when required. Ideally, sync when phone is on Wi-Fi and plugged in.
      3. Defer your work using WorkManager.
      4. Compress your data
      5. Defer non immediate requests until the phone is plugged in or wifi is turned on. The Wi-Fi radio uses significantly less battery than the mobile radio.


### Key takeaway

> 1. Never poll the server for updates. 2. Sync only when required. Ideally, sync when phone is on Wi-Fi and plugged in. 3. Defer your work using WorkManager. 4. Compress your data 5. Defer non immediate requests until the…


---

### Question

How do you improve battery while fetching location for an app?

### Answer

- **In plain words:**

  1. By changing Accuracy -> we can use setPriority() to PRIORITY_LOW_POWER
      2. By changing Frequency of fetching location -> we can use setInterval() to specify the time interval
      3. By increasing latency -> After our call, we can wait for longer time - we can use setMaxWaitTime() to set large timeout.

  ### Dagger 2 Related Questions:


### Key takeaway

> 1. By changing Accuracy -> we can use setPriority() to PRIORITY_LOW_POWER 2. By changing Frequency of fetching location -> we can use setInterval() to specify the time interval 3. By increasing latency -> After our call,…


---

### Question

What is Dependency Injection Pattern?

### Answer

- **In plain words:**

  <img src="https://github.com/user-attachments/assets/dbce5c43-8ec4-4143-a68c-28462d5442d7" width="400">


### Useful links

- https://github.com/user-attachments/assets/dbce5c43-8ec4-4143-a68c-28462d5442d7


### Key takeaway

> Bookmark **What is Dependency Injection Pattern**, read the linked reference, and be ready to explain trade-offs with one example.


---

### Question

What is Dependency Injection Pattern?

### Answer

- **In plain words:**

  Dependency Injection pattern is where if our object requires other object, it will be passed to our object instead of us having to create that object. This other object is called as dependency.


### Key takeaway

> Dependency Injection pattern is where if our object requires other object, it will be passed to our object instead of us having to create that object.


---

### Question

What is Service Locator Pattern?

### Answer

- **In plain words:**

  Service Locator Pattern uses central Registry known as Service Locator which upon request provides objects for our class. This pattern has severe criticism that its an Anti-Pattern.


### Key takeaway

> Service Locator Pattern uses central Registry known as Service Locator which upon request provides objects for our class.


---

### Question

What is Anti-Pattern?

### Answer

- **In plain words:**

  An anti-pattern are certain patterns in software development that are considered bad programming practices.<br/>
      For more, click [Here](https://stackoverflow.com/a/980616/3424919).


### Useful links

- [Here](https://stackoverflow.com/a/980616/3424919)


### Key takeaway

> An anti-pattern are certain patterns in software development that are considered bad programming practices.


---

### Question

What is the use-case of @BindsInstance Annotation?

### Answer

- **In plain words:**

  @BindsInstance is used to bind the available data at the time of building the Component. For example, while I needed to build dagger graph and username is already available to me, then I can bind that username to that dagger dependency graph as follows:


### Code example

```java
@Component.Builder
interface Builder {
    @BindsInstance Builder userName(@UserName String userName);
    AppComponent build();
}
```

### Key takeaway

> @BindsInstance is used to bind the available data at the time of building the Component.


---

### Question

What is the use-case of @Module Annotation?

### Answer

- **In plain words:**

  @Module is the Annotation used on the class for the Dagger to look inside it, to provide dependencies. We may be declaring methods inside the module class that are enclosed with @Provides annotation.


### Key takeaway

> @Module is the Annotation used on the class for the Dagger to look inside it, to provide dependencies.


---

### Question

What is the use-case of @Provides Annotation?

### Answer

- **In plain words:**

  @Provides annotation is used on a method in Module class and can return / provide a Dependency object.


### Key takeaway

> @Provides annotation is used on a method in Module class and can return / provide a Dependency object.


---

### Question

What is the use-case of @Component Annotation?

### Answer

- **In plain words:**

  @Component is used on Interface or abstract class. Dagger uses this interface to generate an implementation class with fully formed, dependency injected implementation, using the modules declared along with it. This generated class will be preceded by Dagger. For example if i create an interface named ProgramComponent with @Component annotation, Dagger will generate a Class named 'DaggerProgramComponent' implementing the  ProgramComponent interface.


### Key takeaway

> @Component is used on Interface or abstract class.


---

### Question

What is the use-case of @Scope Annotation?

### Answer

- **In plain words:**

  @Scope is an annotation used on Interface to create a new Custom Scope. A Scope declaration helps to keep single instance of a class as long as its scope exists. For example, in Android, we can use @ApplicationScope for the object to live as long as the Application is live or @ActivityScope for the object to be available till the activity is killed.


### Key takeaway

> @Scope is an annotation used on Interface to create a new Custom Scope.


---

### Question

What is the use of Qualifier in Dagger?

### Answer

- **In plain words:**

  We are often in a situation where we will be needing multiple objects with different instance values. For example, we need declare Student("Vamsi") and Student("Krishna"). In such case we can use a Qualifier to tell Dagger that we need multiple instances of same class. The default implementation of Qualifier is using @Named annotation, for eg., @Named("student_vamsi") and @Named("student_krishna")
      If we want to create a Custom Qualifier we would be using @Qualifier to declare a custom Qualifier interface.


### Key takeaway

> We are often in a situation where we will be needing multiple objects with different instance values.


---

### Question

What is the use-case of @Inject Annotation in Dagger?

### Answer

- **In plain words:**

  @Inject annotation is used to request dagger to provide the respective Object. We use @Inject on Constructor, Fields (mostly where constructor is not accessible like Activities, Fragments, etc.) and Methods.

  ### Common Coding Programs


### Key takeaway

> @Inject annotation is used to request dagger to provide the respective Object.


---

### Question

Arrays

### Answer

- **In plain words:**

  * [Find Maximum Sell Profit](/src/arrays/FindMaximumSellProfit.java)
    * [Find Low & High Index of a key from a given array](/src/arrays/LowHighIndex.java)
    * [Merge Overlapping Intervals](/src/arrays/MergeOverlappingIntervals.java)
    * [Move all zeros in an array to the Left or Right](/src/arrays/MoveZeroesToLeft.java)
    * [Rotate an array](/src/arrays/RotateArray.java)
    * [Find the smallest common number in a given array](/src/arrays/SmallestCommonNumber.java)
    * [Find the sum of two elements in a given array](/src/arrays/SumOfTwoValues.java)
    * [Find the minimum distance between two numbers in an array](/src/arrays/MinimumDistanceBetweenTwoNumbers.java)
    * [Find the maximum difference between the values in an array such that the largest values always comes after the smallest value](/src/arrays/FindMaxDifference.java)
    * [Find second largest element in an array](/src/arrays/FindSecondLargestElement.java)
    * [Find the 3 numbers in an array that produce the max product](/src/arrays/FindMaxProduct.java)
    * [Find missing number from an array](/src/arrays/FindMissingNumber.java)  
    </br>


### Key takeaway

> Explain **Arrays** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

Dynamic Programming

### Answer

- **In plain words:**

  * [Fibonacci Series](/src/dynamicprogramming/FibonacciSeries.java)
     * [Given an array, find the contiguous subarray with the largest sum](/src/dynamicprogramming/LargestSumSubarray.java)
     * [Find the maximum sum of a subsequence such that no consecutive elements are part of the subsequence](/src/dynamicprogramming/MaxSumSubsequenceOfNonadjacentElements.java)
     * [Given a score "n", find the total number of ways score "n" can be reached](/src/dynamicprogramming/GameScoring.java)
     * [Compute Levenshtein distance between two strings](/src/dynamicprogramming/LevenshteinDistance.java)
     * [Given coin denominations and the total amount, find out the number​ of ways to make the change](/src/dynamicprogramming/CoinChangingProblem.java)   
     </br>


### Key takeaway

> Explain **Dynamic Programming** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

Queues

### Answer

- **In plain words:**

  * [Find the Maximum in a Sliding Window](/src/queue/Dequeue.java)
     * [Implement a queue using stack](/src/queue/QueuesUsingStack.java)
     </br>


### Key takeaway

> Explain **Queues** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

LinkedList

### Answer

- **In plain words:**

  * [Reverse a Linked List](/src/linkedlist/ReverseLinkedList.java)
     * [Remove duplicates from a Linked List](/src/linkedlist/RemoveDuplicates.java)
     * [Delete Node of a given key from a Linked List](/src/linkedlist/DeleteNodeWithKey.java)   
     * [Find the Middle Node of a Linked List](/src/linkedlist/FindMiddleNode.java)
     * [Find the Nth Node of a Linked List](/src/linkedlist/FindNthNode.java)
     * [Check if a Linked List is cyclic](/src/linkedlist/CheckIfContainsCycle.java)
     * [Insertion Sort of a Linked List](/src/linkedlist/InsertSortLinkedList.java)
     * [Intersection Point of Two Lists](/src/linkedlist/IntersectionPoints.java)
     * [Nth from last node](/src/linkedlist/NthFromLastNode.java)
     * [Swap Nth Node with Head](/src/linkedlist/SwapNthNodeWithHead.java)
     * [Merge Two Sorted Linked Lists](/src/linkedlist/MergeLinkedList.java)
     * [Sorting LinkedList using merge sort](/src/linkedlist/MergeSortList.java)
     * [Reverse nodes at even indices](/src/linkedlist/ReverseEvenNodes.java)
     * [Rotate linked list by n](/src/linkedlist/RotateLinkedList.java)
     * [Reverse every 'k' elements in a linked list](/src/linkedlist/ReversekElements.java)
     * [Add the head pointers of two linked lists](/src/linkedlist/AddTwoIntegers.java)   
     </br>


### Key takeaway

> Explain **LinkedList** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

Stacks

### Answer

- **In plain words:**

  * [Evaluate an expression](/src/stacks/EvaluationExpression.java)
     * [Implement a stack using queues](/src/stacks/StacksUsingQueues.java)
     * [Check if paranthesis are equal](/src/stacks/EqualDelimiters.java)
     * [Tower of Hanoi](/src/stacks/TowerOfHanoi.java)
     * [ReverseAStack](/src/stacks/ReverseStack.java)
     </br>


### Key takeaway

> Explain **Stacks** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

Back Tracking

### Answer

- **In plain words:**

  * [Solve Boggle](/src/backtracks/Boggle.java)
     * [Print paranthesis combination for a given value](/src/backtracks/Parenthesis.java)
     * [Solve N queen problem](/src/backtracks/NQueenProblem.java)
     * [find all the subsets of the given array that sum up to the number K](/src/backtracks/KSumSubsets.java)
     </br>


### Key takeaway

> Explain **Back Tracking** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

Graphs

### Answer

- **In plain words:**

  * [Clone a Directed Graph](/src/graphs/CloneDirectedGraph.java)
     * [Minimum Spanning Tree](/src/graphs/MinimumSpanningTree.java)
     * [Form circular chain by given list of words](/src/graphs/WordChaining.java)   
     </br>


### Key takeaway

> Explain **Graphs** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

Trees

### Answer

- **In plain words:**

  * [Implements an InOrder Iterator on a Binary Tree](/src/trees/BinaryTreeIterator.java)
     * [Convert a binary tree to a doubly linked list](/src/trees/BinaryTreeToLinkedList.java)
     * [Connect a sibling pointer of a binary tree to next node in the same level](/src/trees/ConnectAllSiblings.java)
     * [Given a binary tree, connect its siblings at each level](/src/trees/ConnectSiblings.java)
     * [Delete any subtrees whose nodes sum up to zero](/src/trees/DeleteZeroSumSubTrees.java)
     * [Given roots of two binary trees, determine if these trees are identical](/src/trees/IdenticalBinaryTree.java)
     * [Find the Inorder successor of a node in binary Search Tree](/src/trees/InOrderSuccessor.java)
     * [Algorithm to traverse the tree inorder](/src/trees/InOrderTraversal.java)
     * [Check if a given tree is a binary search tree](/src/trees/IsBST.java)
     * [Display node values at each level in a binary tree](/src/trees/LevelOrderTraversal.java)
     * [Swap the 'left' and 'right' children for each node in a binary tree](/src/trees/MirrorBinaryTreeNodes.java)
     * [Find nth highest node in a Binary Search Tree](/src/trees/NthHighestBST.java)
     * [Print nodes forming the boundary of a Binary Search Tree](/src/trees/PrintTreePerimeter.java)
     * [Serialize binary tree to a file and then deserialize back to tree](/src/trees/SerializeBinaryTree.java)   
     </br>


### Key takeaway

> Explain **Trees** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

Strings

### Answer

- **In plain words:**

  * [Reverse String](/src/strings/ReverseString.java)
     * [Palindrone String](/src/strings/PalindroneStrings.java)
     * [Regular Expression](/src/strings/RegularExpression.java)
     * [Remove Duplicates](/src/strings/RemoveDuplicates.java)
     * [Remove White Spaces](/src/strings/RemoveWhiteSpaces.java)
     * [Remove a String](/src/strings/ReverseString.java)
     * [String Segmentation](/src/strings/StringSegmentation.java)
     * [Find next highest permutation of a given string](/src/strings/NextHighestPermutation.java)
     * [Check if two strings are anagrams](/src/strings/CheckIfAnagram.java)   
     </br>


### Key takeaway

> Explain **Strings** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

Integers

### Answer

- **In plain words:**

  * [Reverse Integer](/src/math/ReverseInteger.java)
     * [Find sum of digits of an integer](/src/math/FindSumOfInteger.java)   
     * [Find Next highest Number from a Integer](/src/math/NextHighestNumber.java)
     * [Check if it is an Armstrong number](/src/math/CheckIfArmstrongNumber.java)
     * [Find the factorial of a number](/src/math/FindFactorial.java)
     * [Print all prime numbers upto the given number](/src/math/PrintPrimeNumbers.java)
     * [Find all the prime factors of a given integer](/src/math/FindPrimeFactors.java)
     * [Check if a given number is binary](/src/math/CheckIfBinary.java)
     * [Find kth permutation](/src/math/KthPermutation.java)
     * [Integer Division](/src/math/IntegerDivision.java)
     * [Find Pythagorean Triplets](/src/math/FindPythagoreanTriplets.java)
     * [Print all possible sum combinations using positive integers](/src/math/SumCombinations.java)
     * [Find Missing Number](/src/math/FindMissingNumber.java)   
     * [Find all subsets of a given set of integers](/src/math/IntegerSubsets.java)
     * [Given an input string, determine if it makes a valid number](/src/math/NumberValidity.java)
     * [Calculate 'x' raised to the power 'n'](/src/math/PowerOfNumber.java)
     * [Calculate square root of a number](/src/math/CalculateRoot.java)
     * [Minimum Number of Platforms Required for a Railway/Bus Station](/src/math/MinimumPlatforms.java)   
     </br>


### Key takeaway

> Explain **Integers** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

Miscellaneous

### Answer

- **In plain words:**

  * [Find three integers in the array with sum equal to the given value](/src/misc/SumOfThreeValues.java)
     * [Find position of a given key in 2D matrix](/src/misc/SearchMatrix.java)
     * [Determine the host byte order of any system](/src/misc/HostByteOrder.java)
     * [Find the point that requires the least total distance covered by all the ​people to meet at that point](/src/misc/ClosestMeetingPoint.java)
     * [Given a two dimensional array, if any element in it is zero make its whole row and column zero](/src/misc/SumOfThreeValues.java)
     </br>


### Key takeaway

> Explain **Miscellaneous** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

### Question

Usecases of HTTP Polling and WebSocket

### Answer

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://outcomeschool.com/blog/http-request-long-polling-websocket-sse


### Key takeaway

> Bookmark **Usecases of HTTP Polling and WebSocket**, read the linked reference, and be ready to explain trade-offs with one example.
