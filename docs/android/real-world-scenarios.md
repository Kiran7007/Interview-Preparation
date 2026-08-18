# Real-World Scenario-Based Interview Questions

### 1. Scenario: Memory Leak Causing Gradual App Slowdown

You are working on a large-scale social media app (~20M MAU).
Users are reporting that:
- App becomes slow after 15–20 minutes of usage
- Scrolling starts lagging
- Eventually app gets killed by system (OOM)

Observations from monitoring tools:
- Memory usage continuously increases over time
- GC frequency is very high
- Issue is more prominent on feed screen

Recent changes include:
- New feed redesign using RecyclerView
- Image loading optimizations
- Introduction of a shared singleton analytics manager

How would you investigate and fix this issue end-to-end?

#### Answer:
First, I would treat this as a progressive memory leak issue, not an immediate crash problem, because the degradation happens over time and correlates with user interaction.

##### 1. Confirm Whether It’s a Leak or Expected Growth
Before jumping to conclusions, I would validate:
- Is memory growing linearly without release → indicates leak
- Or growing and stabilizing → expected caching behavior

Using:
- Android Studio Memory Profiler
- Heap dumps at intervals
- LeakCanary for automatic detection

If objects are retained after screen destruction, it confirms a leak.

##### 2. Identify Leak Source Using Heap Analysis
I would capture heap dump and analyze:
- Dominator tree → which objects are retaining memory
- Reference chain → why they are not getting garbage collected

Typical suspects in this scenario:
- RecyclerView Adapter holding reference to Activity/Fragment
- ViewHolder retaining heavy objects
- Singleton analytics manager holding Context
- Image loader caching incorrectly

##### 3. Investigate RecyclerView Layer
Since issue is prominent on feed screen:
- Check if adapter is holding strong reference to Context
- Verify if listeners are being cleared in onViewRecycled()
- Ensure ViewHolder does not store long-lived references

Also check:
- Are we creating new objects inside onBindViewHolder() repeatedly?

##### 4. Analyze Singleton / Shared Components
The analytics manager is a strong suspect.
I would verify:
- Is it storing Activity context instead of Application context?
- Is it holding references to views, callbacks, or lifecycle owners?

Fix:
- Replace Activity context with Application context
- Avoid storing UI references inside singleton

##### 5. Image Loading & Caching Layer
- Check if images are being cleared properly
- Ensure lifecycle-aware image loading (e.g., Glide tied to Fragment)
- Validate cache size and eviction policy

##### 6. GC Pressure Optimization
High GC frequency indicates excessive allocations.
I would:
- Reduce object creation inside scroll path
- Reuse objects where possible
- Avoid unnecessary boxing/unboxing

##### 7. Fix Strategy Summary
- Remove strong references causing leaks
- Ensure proper lifecycle cleanup
- Optimize adapter and ViewHolder usage
- Fix singleton misuse
- Tune image caching

##### 8. Validation
- Compare heap dumps before and after fix
- Ensure memory stabilizes over time
- Monitor GC frequency reduction
- Run long-session testing (30–60 mins)

##### 9. Long-Term Prevention
- Integrate LeakCanary in debug builds
- Add code review checklist for memory safety
- Avoid passing Context blindly
- Introduce architectural boundaries (no UI reference in data layer)

#### Conclusion
This issue is not just a bug but a systemic lifecycle mismanagement problem, and solving it requires discipline across UI, architecture, and shared components.

---

### 2. Scenario: API Layer Instability (Retries, Failures, Token Expiry)

You are working on a fintech app with millions of daily transactions.
Users report:
- Random API failures
- Some requests succeed on retry
- Occasional logout issues

Observations:
- Increased HTTP 401 and 500 errors
- Multiple duplicate API calls
- Token refresh logic recently modified

Constraints:
- Must ensure no duplicate financial transactions
- Backend has rate limits
- Network conditions are unstable (India Tier-2/Tier-3 cities)

How would you design and fix this system?

#### Answer:
I would approach this as a network reliability and consistency problem, especially critical because it involves financial transactions.

##### 1. Categorize Failures
First, I would classify failures into:
- Client-side issues (timeouts, retries, duplication)
- Auth issues (token expiry, refresh race conditions)
- Server issues (500 errors, rate limiting)

This helps avoid mixing multiple root causes.

##### 2. Analyze Token Refresh Flow
Given logout issues and 401 spikes, token handling is a key suspect.
Common issue:
- Multiple requests fail with 401 simultaneously
- Each triggers token refresh → race condition

Fix:
- Implement single-flight token refresh

Only one refresh request should execute, others should wait.

##### 3. Prevent Duplicate Requests
Critical for fintech.
I would introduce:
- Idempotency keys per request
- Unique transaction IDs generated on client

So even if retry happens:
- Server processes request only once

##### 4. Retry Strategy Design
Not all APIs should retry.
- Safe APIs → retry (GET, non-critical POST)
- Financial APIs → controlled retry with idempotency

Use:
- Exponential backoff
- Network-aware retries

##### 5. Network Layer Improvements
- Add OkHttp interceptors:
  - Logging
  - Retry handler
  - Auth handler
- Set proper timeouts:
  - Connection timeout
  - Read timeout

##### 6. Rate Limiting Awareness
If backend has limits:
- Avoid aggressive retries
- Queue requests if needed
- Use backoff strategy

##### 7. Offline Handling
- Queue requests locally (Room DB)
- Execute when network is available

##### 8. Observability
- Add structured logging
- Track:
  - Retry count
  - Failure rate
  - Token refresh frequency

##### 9. Validation
- Simulate poor network conditions
- Test token expiry edge cases
- Ensure no duplicate transactions

#### Conclusion
This is not just an API bug — it’s a distributed system reliability issue, requiring idempotency, synchronization, and controlled retries.

---

### 3. Scenario: Offline-First Sync Failure (Message Duplication & Data Loss)

You are building a chat/messaging feature for a large app (~10M DAU), similar to WhatsApp.
Users report:
- Messages sometimes appear duplicated
- Some messages are missing after network recovery
- Message order is inconsistent across devices

Observations:
- App supports offline mode
- Messages are stored locally using Room
- Sync happens via WorkManager
- Backend is eventually consistent

Constraints:
- Messages must never be lost
- Duplicate messages are unacceptable
- App must work reliably in poor network conditions

How would you design and fix this system?

#### Answer:
I would approach this as a distributed data consistency problem, not just a mobile bug, because we are dealing with offline-first architecture and eventual consistency.

##### 1. Clarify Data Flow and Failure Points
First, I would map the full lifecycle of a message:
- User sends message → stored locally
- Message marked as PENDING
- Sync worker sends to server
- Server responds → message marked as SENT

I would identify where duplication or loss can occur:
- Retry logic without idempotency
- Multiple sync workers running concurrently
- Server sending duplicate responses
- Improper merge logic when syncing back

##### 2. Root Cause Analysis
Likely causes:
- No idempotency key → same message sent multiple times
- Sync worker running multiple times → race conditions
- No proper conflict resolution strategy
- Local DB not acting as single source of truth

##### 3. Fix Strategy — Strong Data Guarantees

###### a. Introduce Idempotency
Every message must have:
- A unique client-generated ID (UUID)

Server must:
- Treat duplicate requests with same ID as same message

###### b. Single Source of Truth (SSOT)
- UI should read only from local database
- Server sync should only update DB, not UI directly

###### c. Sync Queue Design
- Maintain a queue of pending messages
- Ensure only one worker processes queue at a time

Use:
- WorkManager with unique work + KEEP policy

###### d. Conflict Resolution
- Use server timestamp as source of truth
- Merge messages carefully to avoid duplication

###### e. Ordering Guarantee
- Maintain logical ordering using:
  - Local timestamp (temporary)
  - Server timestamp (final ordering)

##### 4. Retry Strategy
- Use exponential backoff
- Retry only failed messages
- Avoid retry storms

##### 5. Edge Case Handling
- App killed during sync → WorkManager resumes
- Network fluctuation → retry safely
- Partial success → update only successful messages

##### 6. Validation
- Simulate:
  - Network drop mid-send
  - Duplicate sends
  - App restarts
- Ensure:
  - No duplicates
  - No message loss
  - Correct ordering

#### Conclusion
This is fundamentally a data consistency and synchronization problem, and the correct solution requires idempotency, queue control, and strong local-first architecture.

---

### 4. Scenario: Crash Spike Due to Lifecycle Issues (Fragment + Coroutines)

You are working on a modular app with multiple teams contributing.
After a recent release:
- Crash rate increased significantly
- Common crash: `IllegalStateException: Fragment not attached to a context`

Observations:
- Occurs during navigation or screen rotation
- App uses:
  - Fragments
  - Coroutines
  - ViewBinding

Recent changes:
- Async API calls added inside fragments
- Navigation refactoring

How would you debug and fix this?

#### Answer:
I would approach this as a lifecycle misalignment problem between UI components and async operations.

##### 1. Understand Crash Context
First, I would analyze:
- When does crash occur? → navigation, rotation
- Which thread? → usually main thread
- What operation triggers it? → UI update after async call

This suggests:
- Coroutine completes after Fragment is destroyed

##### 2. Root Cause Identification
Typical issue:
- Coroutine launched in Fragment scope
- Fragment destroyed
- Coroutine still running
- On completion → tries to access UI or context

##### 3. Fix Strategy — Lifecycle Awareness

###### a. Use viewLifecycleOwner Scope
Instead of:
```kotlin
lifecycleScope.launch { ... }
```
Use:
```kotlin
viewLifecycleOwner.lifecycleScope.launch { ... }
```
This ensures coroutine is cancelled when view is destroyed.

###### b. Use repeatOnLifecycle
For flows:
```kotlin
viewLifecycleOwner.lifecycleScope.launch {
    repeatOnLifecycle(Lifecycle.State.STARTED) {
        flow.collect { ... }
    }
}
```

###### c. Avoid Direct Context Usage
Before accessing context:
- Check if fragment is attached
- Or use `requireContext()` only when safe

###### d. Cancel Jobs Properly
- Store coroutine jobs
- Cancel them in `onDestroyView()` if needed

##### 4. Navigation Safety
- Avoid triggering navigation after Fragment is destroyed
- Use safe navigation patterns

##### 5. Architectural Fix
- Move business logic to ViewModel
- Fragment should only observe state

##### 6. Validation
- Test:
  - Rapid navigation
  - Screen rotation
  - Background/foreground
- Ensure no crashes

#### Conclusion
This issue arises from mixing asynchronous work with lifecycle-unaware components, and the fix requires strict lifecycle-scoped execution.

---

### 5. Scenario: Slow Build Time in Multi-Module Project

You are working on a large Android codebase:
- 50+ modules
- Multiple teams
- CI build time ~25 minutes
- Local build time ~10–12 minutes

Problems:
- Developers complain about productivity
- Small changes trigger full rebuilds

How would you optimize this?

#### Answer:
I would treat this as a build system scalability problem, not just Gradle tuning.

##### 1. Measure Build Bottlenecks
First, I would collect data:
- Use Gradle Build Scan
- Identify:
  - Longest tasks
  - Non-incremental builds
  - Cache misses

##### 2. Identify Root Causes
Common issues:
- Poor module boundaries
- Too many dependencies between modules
- Annotation processors (KAPT)
- Non-incremental tasks

##### 3. Modularization Strategy
- Ensure feature-based modules
- Reduce inter-module dependencies
- Avoid circular dependencies

##### 4. Incremental Build Optimization
- Enable incremental compilation
- Avoid changing shared modules frequently

##### 5. Replace KAPT with KSP
- KAPT is slow
- Migrate to KSP where possible

##### 6. Enable Build Cache
- Local + Remote cache
- Avoid recompilation of unchanged code

##### 7. Parallel Execution
- Enable parallel builds
- Optimize Gradle workers

##### 8. Dependency Optimization
- Remove unused dependencies
- Avoid large libraries

##### 9. CI Optimization
- Use remote build cache
- Run only affected modules

#### Conclusion
Build time issues are usually due to poor modular boundaries and lack of incremental build optimization, and solving them requires both architectural and tooling improvements.

---

### 6. Scenario: Battery Drain Due to Background Work

You are working on a fitness tracking app.
Users report:
- Significant battery drain
- App appears in top battery usage list

Observations:
- App uses:
  - Location tracking
  - Background sync
  - Periodic API polling

How would you fix this?

#### Answer:
I would approach this as a resource efficiency and background execution problem.

##### 1. Analyze Battery Usage
Use:
- Battery Historian
- Android Profiler

Identify:
- CPU usage
- Wake locks
- Network usage

##### 2. Identify Problematic Components
Likely causes:
- Frequent location updates
- Continuous background services
- Aggressive polling

##### 3. Fix Strategy

###### a. Replace Services with WorkManager
- Use WorkManager for deferrable tasks
- Respect system scheduling

###### b. Optimize Location Updates
- Use balanced accuracy
- Reduce frequency

###### c. Reduce Polling
- Use push notifications instead of polling
- Batch network calls

###### d. Respect Doze Mode
- Avoid waking device unnecessarily

##### 4. Validation
- Measure battery usage before/after
- Test long usage scenarios

#### Conclusion
Battery drain issues come from misuse of background execution, and the solution is to align with Android’s power management system.

---

### 7. Scenario: Jetpack Compose Performance Issue (Excessive Recompositions)

You are working on a modern Android app fully built using Jetpack Compose.
Users report:
- UI feels laggy during interactions
- Animations stutter
- CPU usage spikes during scrolling

Observations:
- Recomposition count is very high
- Even small state updates trigger full screen recomposition
- App uses complex UI with nested composables

Recent changes:
- Introduced shared UI state in ViewModel
- Passing large data objects to composables
- Added multiple `collectAsState()` calls

How would you debug and fix this?

#### Answer:
I would approach this as a state management and recomposition scope problem, since Compose performance is tightly coupled with how state is structured and consumed.

##### 1. Measure and Visualize Recompositions
First, I would confirm the issue using:
- Layout Inspector → recomposition count
- Compose tooling (Recomposition highlights)
- CPU profiler

Goal:
- Identify which composables are recomposing frequently
- Check if recomposition is localized or cascading

##### 2. Identify Root Causes
Based on the scenario, likely causes are:
- Passing unstable or large objects as parameters
- Shared state causing global recomposition
- Multiple `collectAsState()` causing redundant updates
- Missing `remember` or incorrect state scoping

##### 3. Fix State Design

###### a. Hoist and Scope State Properly
- Avoid global state for entire screen
- Break state into smaller, independent pieces

###### b. Use Stable Data Structures
- Ensure models are immutable
- Avoid passing mutable lists or objects

###### c. Avoid Passing Large Objects
Instead of:
- Passing full UI model
Pass:
- Only required fields

##### 4. Optimize State Collection
Instead of multiple:
- `collectAsState()` calls
Use:
- Combine flows in ViewModel
- Expose single UI state

##### 5. Use `remember` and `derivedStateOf`
- Cache expensive calculations
- Avoid recomputation

##### 6. Reduce Recomposition Scope
- Break UI into smaller composables
- Ensure only affected composables recompose

##### 7. Advanced Optimization
- Use `key()` for stable identity
- Avoid lambda recreation inside composables

##### 8. Validation
- Compare recomposition counts
- Measure FPS improvement
- Track CPU usage

#### Conclusion
Compose performance issues are not UI problems — they are state architecture problems, and solving them requires precise control over state flow and recomposition boundaries.

---

### 8. Scenario: API Layer Overload (Thundering Herd Problem)

You are working on a news app with millions of users.
At 9 AM daily:
- All users open app
- App triggers API calls for feed

Problems:
- Backend gets overloaded
- Many requests fail
- App shows errors or empty data

Observations:
- No caching strategy
- All users hit API simultaneously
- Retry logic increases load

How would you fix this?

#### Answer:
I would approach this as a system-level load management problem, not just an API issue.

##### 1. Identify Root Cause
This is a classic thundering herd problem:
- Simultaneous requests from millions of clients
- No staggering or caching
- Retry amplifies load

##### 2. Introduce Caching Strategy

###### a. Local Cache (Client-side)
- Store last successful response
- Show cached data immediately

###### b. Cache Expiry Policy
- Define TTL (e.g., 5–10 minutes)
- Avoid unnecessary API calls

##### 3. Stagger Requests
- Introduce random delay before API call
- Prevent all clients hitting server at once

##### 4. Improve Retry Logic
- Use exponential backoff
- Avoid immediate retries

##### 5. Backend Coordination
- Use CDN caching
- Implement server-side rate limiting

##### 6. Smart Fetching
- Fetch only delta updates
- Avoid full refresh

##### 7. Validation
- Simulate peak traffic
- Monitor API success rate

#### Conclusion
This is not just a mobile issue — it’s a distributed load balancing problem, requiring both client and server optimizations.

---

### 9. Scenario: Deep Link Handling Breaking Navigation

You are working on an e-commerce app.
Users report:
- Deep links sometimes open wrong screen
- App crashes when opened via link
- Back navigation behaves incorrectly

Observations:
- App uses Navigation Component
- Multiple entry points (home, product, offer pages)
- Some deep links contain query parameters

How would you fix this?

#### Answer:
I would approach this as a navigation state consistency problem, especially because deep links bypass normal navigation flow.

##### 1. Understand Deep Link Types
- Cold start deep link
- Warm start deep link
- App already in foreground

Each case behaves differently.

##### 2. Validate Deep Link Parsing
- Ensure URI parsing is correct
- Validate parameters before using

##### 3. Fix Navigation Graph
- Define proper deep link destinations
- Ensure arguments are correctly mapped

##### 4. Handle Back Stack Properly
- Build correct navigation stack manually if needed
- Avoid duplicate fragments

##### 5. Prevent Crashes
- Validate data before navigation
- Handle missing parameters gracefully

##### 6. Testing Strategy
- Test:
  - App closed
  - App in background
  - App in foreground

#### Conclusion
Deep linking is not just routing — it’s about reconstructing app state correctly, and requires careful navigation and validation logic.

---

### 10. Scenario: Large List Data Loading Causing OOM

You are building a marketplace app.
Users report:
- App crashes when scrolling large product lists

Observations:
- App loads entire dataset at once
- Images are high resolution
- No pagination implemented

How would you fix this?

#### Answer:
I would approach this as a memory management and data loading strategy problem.

##### 1. Identify Root Cause
- Loading entire dataset → high memory usage
- Large images → memory spikes
- No lazy loading

##### 2. Introduce Pagination
Use:
- Paging 3 library

Benefits:
- Load data incrementally
- Reduce memory footprint

##### 3. Optimize Images
- Resize images before loading
- Use thumbnails

##### 4. RecyclerView Optimization
- Reuse views efficiently
- Avoid unnecessary object creation

##### 5. Cache Strategy
- Use disk + memory cache
- Avoid reloading images

##### 6. Validation
- Monitor memory usage
- Test with large datasets

#### Conclusion
OOM issues are typically due to unbounded data loading, and the solution is controlled, incremental data flow.

---

## 1. Android Core Concepts

### Q:1) What are the core building blocks of an Android application?
Android apps are built using several essential components provided by the Android framework. These components work together to handle UI, background tasks, user interactions, and data sharing.

#### Core Building Blocks of an Android Application:
1. **Activities**
   - Represents a single screen with a user interface.
   - Acts as the entry point for user interaction.
   - Every screen in an app is usually an Activity.
2. **Fragments**
   - A modular piece of UI that lives inside an Activity.
   - Can be reused in multiple activities.
   - Useful for responsive layouts (e.g., tablets vs phones).
3. **Services**
   - Runs background operations without user interaction.
   - Useful for long-running tasks like downloading files, playing music, etc.
4. **Broadcast Receivers**
   - Listens to system-wide or app-wide broadcast messages.
   - Useful for responding to events like battery low, Wi-Fi connected, etc.
5. **Content Providers**
   - Used to share data between apps.
   - Acts as a data access interface, like a database that can be queried using URI.
6. **View:**
   - Every UI component like Button, TextView, etc.
   - Created in XML or code using Jetpack Compose.
7. **Layouts:**
   - Organize UI views. Examples: LinearLayout, ConstraintLayout, Compose Column/Row.
8. **Manifest File:**
   - Declares all components, permissions, and metadata.
   - It’s like the blueprint of your app.

---

### Q:2) What is the intent?
Intent is a messaging object used to request an action from another app component (activity, service, or broadcast receiver). It allows communication between components and even across different applications.

There are two types of intents in Android:

1. **Explicit Intent**
   - Used to launch a specific component (e.g., another activity within the same app or in another app, if the component name is known).
   - You define the class name or component name directly.

Example:
```kotlin
val intent = Intent(this, SecondActivity::class.java)
startActivity(intent)
```

2. **Implicit Intent**
   - Used to perform an action without specifying the exact component.
   - The Android system will match the intent with the appropriate component using intent filters.

```kotlin
val intent = Intent(Intent.ACTION_VIEW)
intent.data = Uri.parse("https://www.google.com")
startActivity(intent)
```

---

### Q:3) What is the Android Application Lifecycle?
The Android Application Lifecycle is the process your entire app goes through — from the moment it starts running to the moment it's closed or killed by the system.
This lifecycle is managed by the Application class.

#### Key Steps in the Application Lifecycle:
- `onCreate()`
  - Called once when the app is first launched
  - Best place to initialize global things like Firebase, logging, or any SDKs
- `onTerminate()`
  - Called when the app is about to close (only in emulators or rare cases)
  - Not reliable on real devices
- `onLowMemory()` / `onTrimMemory()`
  - Called when the system is running low on memory
  - Use this to free up memory (like clearing image cache)

#### Activity Lifecycle Methods:
- `onCreate()`: Activity creation and initialization
- `onStart()`: Activity becomes visible
- `onResume()`: Activity in foreground and interactive
- `onPause()`: Activity partially obscured
- `onStop()`: Activity fully concealed
- `onRestart()`: Activity starting preparation
- `onDestroy()`: Final exit Before Destruction

---

### Q:4) What is the Scenario in which only onDestroy is called for an activity without onPause() and onStop()?
If `finish()` is called in the `onCreate` method of an activity, the system will invoke `onDestroy()` method directly.

Commonly used in:
- Notifications – to open an activity when user taps it
- AlarmManager – to run something at a scheduled time
- Broadcasts – to send data in the future

---

### Q:26) What are Intent Filters?
- Intent Filters are used to tell Android which intents an activity, service, or broadcast receiver can handle.
- They are defined in the `AndroidManifest.xml` file.
- The system uses intent filters to decide which component should respond to a specific intent.
- For example, if a user clicks on a web link, the system checks the intent filters to find an app that can handle it.
- An intent filter includes:
  - `action` – what kind of action (like view, send, etc.)
  - `category` – extra information (like default)
  - `data` – type of data (like http, tel, etc.)

---

### Q:27) What is a BroadcastReceiver in Android?
- A BroadcastReceiver is a component in Android that listens for system-wide or app-specific broadcast messages (called Intents).
- It helps your app respond to events, even if your app is not currently open.
- You can use it to listen to system events like:
  - Phone is charging
  - Battery is low
  - Internet connectivity changes
  - Device boot completed
- You can also create and send custom broadcasts within your own app.
- It does not show any UI, but you can use it to start a service, show a notification, or launch an activity.

---

### Q:28) What are Loaders in Android?
- Loaders are used to load data in the background from a data source (like a database or content provider).
- They were introduced in API level 11 (Android 3.0).
- Loaders help to avoid running long tasks on the main thread (which can freeze the UI).
- They are commonly used with CursorAdapters to load data into list-based views.
- Loaders can automatically reconnect to the last loaded data after a configuration change (like screen rotation), so they prevent duplicate queries.
- Loaders are managed by LoaderManager, which handles the lifecycle.

---

### Q:29) What are Launch Modes in Android ?
In Android, launch modes decide how activities are created and managed in the back stack when you open or reopen them.

- **Standard (Default)**
  - A new activity instance is always created, even if it's already in the stack.
  - You can have multiple copies of the same activity.
  - *Example:* If current stack is: A → B → C. You launch B again with standard, new stack becomes: A → B → C → B.
  - *Use Case:* Chat screen in a messaging app (like WhatsApp). Suppose you're chatting with the same person and open their chat screen multiple times using different paths. Each time, a new instance of the chat screen (activity) is created.

- **SingleTop**
  - Works like standard, but if the same activity is already on top, it won't create a new one.
  - It will reuse the existing one by calling `onNewIntent()`.
  - *Example:* Stack: A → B → C. Launch C again with singleTop → still: A → B → C (no duplicate). But if stack is A → B → C, and you launch B again with singleTop, new stack becomes: A → B → C → B (because B was not on top).
  - *Use Case:* Notifications in Gmail. You tap on a Gmail notification, and it opens the Email Detail screen. If the user is already on that same screen (top of stack), no new instance is created. Instead, the existing screen is updated with new data using `onNewIntent()`.

- **SingleTask**
  - Only one instance of the activity exists at a time in the task.
  - If it's already in the stack, all activities above it are removed, and that activity is reused.
  - *Example:* Stack: A → B → C → D. Launch B with singleTask → stack becomes: A → B (C and D are removed).
  - *Use Case:* Splash screen or Login screen. You log into an app, and the login activity is launched with singleTask. Now after login, you go to the main dashboard. If you accidentally launch the login activity again (like by deep link), all screens above it are removed, and you're brought back to login.

- **SingleInstance**
  - Same as singleTask, but the activity is launched in its own separate task.
  - No other activities will be in this task.
  - *Example:* Stack: A → B → C → D. Launch B with singleInstance → Task 1: A, Task 2: B (in its own task).
  - *Use Case:* Video player or call screen (like Zoom, Google Meet, or YouTube PiP). You open a video or a call screen that should run in a separate task. No other activity should be part of this task. If you press Home and come back to the app, the video/call continues in the separate task.

---

### Q:30) What is ConstraintLayout?
- ConstraintLayout is a layout in Android that lets you design complex UIs without nesting multiple layouts.
- It helps to create flat and efficient layouts, which means better performance.
- Similar to RelativeLayout, but more powerful and flexible.
- You position views by creating constraints between:
  - one view and another view
  - or a view and the parent layout
- It supports advanced features like:
  - Chains (for evenly spaced items)
  - Guidelines (for alignment)
  - Barriers (for dynamic layout)

---

### Q:66) What is PeriodicWorkRequest and when to use it?
- A PeriodicWorkRequest is used in WorkManager to run background tasks repeatedly at a fixed time interval.
- It’s ideal for work that needs to happen regularly, even if the app is closed or the device restarts.

#### Example Use Cases
You should use PeriodicWorkRequest for tasks like:
- Syncing app data with the server every few hours
- Uploading logs or analytics daily
- Checking for app or content updates
- Cleaning cache or temporary files at intervals

#### Important Rules
- The minimum repeat interval allowed is 15 minutes — you cannot set it lower than that.
- WorkManager will try to run the task as close to the interval as possible, but exact timing is not guaranteed (for battery optimization).
- You can add constraints (like run only on Wi-Fi or when charging).

---

### Q:67) What are the different states of Work in WorkManager?
- In WorkManager, every task (WorkRequest) can be in one of several states.
- These states help you track progress, handle retries, or debug issues in background work.

#### Work States
- **(A) ENQUEUED**
  - The work has been added to the queue, but has not started yet.
  - WorkManager is waiting for constraints (like Wi-Fi, charging) to be satisfied.
- **(B) RUNNING**
  - WorkManager has started executing the work on a background thread.
  - The work is currently being processed.
- **(C) SUCCEEDED**
  - Work completed successfully.
  - WorkManager marks it as done.
- **(D) FAILED**
  - Work failed permanently.
  - WorkManager will not retry unless you specify `setBackoffCriteria()` for retries.
- **(E) BLOCKED**
  - Work is blocked because it depends on other work that has not finished yet.
  - Example: Work B depends on Work A — Work B will be BLOCKED until Work A finishes.
- **(F) CANCELLED**
  - Work was manually cancelled using `WorkManager.cancelWorkById()` or related methods.

#### Key Points
- Use LiveData or Flow to observe real-time state changes of work.
- WorkManager handles automatic retries for failed work if configured.
- These states help in debugging and updating UI about background task progress.

---

### Q:68) What are Constraints in WorkManager and how to use them?
Constraints control when the work should run.
Example: Only run when the device is charging and connected to the network.

---

## 2. OOPS Concepts

### Q:1) What is a Class and Object in Android?

#### Class
- A class is like a blueprint or template for creating objects.
- It defines properties (variables) and behaviors (functions/methods).
- In Android (Kotlin/Java), you use classes to structure your app.

*Key Points:*
- Defines what an object will have and do.
- Doesn’t occupy memory by itself until an object is created.

#### Object
- An object is a real instance of a class.
- It occupies memory and can use the properties and functions defined in the class.

*Key Points:*
- Object is the actual entity created from the class blueprint.
- You can create multiple objects from the same class, each with different data.

---

### Q:2) What are Primary and Secondary Constructors in Kotlin?

#### Primary Constructor
- The main constructor of a class.
- Defined in the class header.
- Can directly initialize properties.

*Usage in Android:*
- Pass data directly when creating an object.

*Key Points:*
- There can be only one primary constructor.
- Can include `init` block for additional initialization.

#### Secondary Constructor
- Optional additional constructors for different ways to create an object.
- Defined inside the class body with a `constructor` keyword.
- Must delegate to the primary constructor (if primary exists) using `: this(...)`.

*Usage in Android:*
- Useful when you want flexible object creation in different scenarios.

*Key Points:*
- You can have multiple secondary constructors.
- Helps when default values or alternative initialization is needed.

---

### Q:3) Explain Inheritance in Android with an Example
- Inheritance is an OOP concept where one class (child/subclass) inherits properties and behaviors of another class (parent/superclass).
- Helps reuse code, reduce duplication, and create hierarchical relationships.

#### How It Works in Android
- Android apps are built using classes, so inheritance is common:
  - Activities and Fragments extend `AppCompatActivity` or `Fragment`.
  - Custom Views extend `View` or `TextView`.
  - Adapters can extend `RecyclerView.Adapter`.

---

### Q4: What is Polymorphism in Android?
- Polymorphism is an OOP concept that allows an object to take many forms.

---

## 3. Kotlin Concepts

### Q:1) What are the main features of Kotlin?
- **Concise:** Less boilerplate than Java
- **Null Safety:** Built-in null checks
- **Extension Functions:** Add functions to existing classes
- **Coroutines:** Lightweight concurrency
- **Smart Casts:** No need for explicit casting after type check
- **Data Classes:** Auto-generate `equals()`, `hashCode()`, `toString()`, etc.
- **Default & Named Arguments**
- **Higher-order functions & Lambdas**

---

### Q:2) What is the difference between val, var, and const in Kotlin?
In Kotlin, `val` and `var` are used to declare variables, but they behave differently:

1. **var (Variable)**
   - A mutable variable.
   - You can change its value after it's assigned.
   - Stored in memory at runtime.

2. **val (Value)**
   - An immutable variable (like `final` in Java).
   - You can assign only once.
   - Value is also stored at runtime, but can’t be reassigned.

3. **const val (Constant)**
   - A compile-time constant.
   - Can only be used with top-level properties or inside objects or companion objects.
   - Must be of a primitive type or String, and value must be known at compile time.

```kotlin
val name = "Anand" // Cannot be changed later
var age = 30 // Can be updated
age = 31
```

---

### Q:3) What are null safety features in Kotlin?
Kotlin eliminates `NullPointerException` (NPE) by making all types non-nullable by default.

#### Types:
- **Non-nullable:** `var name: String = "Anand"` → cannot hold null
- **Nullable:** `var name: String? = null` → can hold null

#### Safe Operations:
- **Safe call `?.`:** Skips execution if the object is null.
- **Elvis `?:`:** Provide default value if null.
- **Not-null Assertion `!!`:** Throws Null Pointer Exception if value is null.
- **Safe Cast `as?`:** Returns null instead of throwing ClassCastException.

---

### Q:4) What is a data class in Kotlin?
A data class is a special class made specifically for storing data. It automatically gives you useful methods like:
- `toString()` – so you can print the object easily
- `equals()` and `hashCode()` – to compare objects or use in HashMap/Set
- `copy()` – to create a new object with some properties changed
- `componentN()` – to access values using destructuring (like `val (a, b) = obj`)

*Syntax:*
```kotlin
data class User(val name: String, val age: Int)
```

---

## 4. Android Architecture

### Q:1) What is Android Architecture?
- It defines a way to structure code into layers.
- Helps separate UI, data, and business logic.
- Makes the code easy to maintain, test, and scale.

---

### Q:2) What is MVVM Architecture?
- MVVM stands for Model-View-ViewModel.
- **Model:** Manages data (e.g., from API or database).
- **View:** UI layer (Activity, Fragment, or Compose).
- **ViewModel:** Holds UI data and business logic, survives screen rotation.
- Helps reduce code in Activity/Fragment.

---

### Q:3) What is ViewModel?
- Part of Android Architecture Components.
- Stores UI-related data across configuration changes.
- Provides data to the View using LiveData or StateFlow.
- Doesn’t contain references to View (Activity/Fragment).

---

### Q:4) What is LiveData?
- Lifecycle-aware observable data holder.
- UI observes LiveData to get automatic updates.
- Prevents memory leaks as it only updates when the UI is active.

---

### Q:5) What is the difference between LiveData and StateFlow?
- LiveData is lifecycle-aware, works well with XML-based UIs.
- StateFlow is not lifecycle-aware, works better with Kotlin Coroutines and Jetpack Compose.
- StateFlow is a part of Kotlin Flow and used for modern reactive UIs.

---

### Q:6) What is Repository in MVVM?
The Repository is responsible for fetching data. It abstracts the data sources (API, Room database, Firebase, etc.) from the ViewModel. This separation makes it easy to manage and test data logic.

---

### Q:7) What are UseCases in Clean Architecture?
- A UseCase contains a single specific business logic (e.g., GetUserDetails).
- Keeps the ViewModel clean by handling complex logic inside it.
- Lies in the domain layer in Clean Architecture.
- Reusable and testable units of code.

---

### Q:8) What is Clean Architecture?
- Divides app into three layers:
  - **Presentation:** ViewModel, UI
  - **Domain:** Business logic (UseCases)
  - **Data:** API, Room, Repositories
- Makes code modular, testable, and maintainable.
- Helps in scaling large applications.

---

### Q:9) What is Room in Android Architecture?
- Room is a library that provides an easy way to use SQLite.

```kotlin
data class User(
    @PrimaryKey val id: Int,
    @Embedded val address: Address
)
```

---

### Q:78) How to update only specific fields in Room?
You can write a custom `@Query` to update only one or two fields:

```kotlin
@Query("UPDATE user SET name = :name WHERE id = :id")
suspend fun updateName(id: Int, name: String)
```
Avoid using `@Update` if partial update is needed.

---

### Q:79) Explain SOLID Principles in Android with examples
- SOLID is a set of five design principles that help in writing clean, scalable, and easy-to-maintain code.
- Each letter in SOLID stands for one principle:
  1. **S** – Single Responsibility
  2. **O** – Open/Closed
  3. **L** – Liskov Substitution
  4. **I** – Interface Segregation
  5. **D** – Dependency Inversion

Let’s understand them one by one:

#### S – Single Responsibility Principle (SRP)
- A class should have only one reason to change, meaning it should do only one job.
- *Example in Android:* Don’t mix UI logic and data logic inside an Activity. Use Activity for UI and ViewModel for business logic. Use Repository for data handling (API/Database). This makes code cleaner and easier to test or modify.

#### O – Open/Closed Principle (OCP)
- A class should be open for extension but closed for modification. You should add new features without changing existing code.
- *Example in Android:* Suppose you have a PaymentProcessor class. Instead of editing it for every new payment method (UPI, Card, Wallet), create new classes like CardPayment, UPIPayment that implement a PaymentInterface. This keeps the original class safe from future changes.

#### L – Liskov Substitution Principle (LSP)
- Subclasses should be usable in place of their parent class without breaking the app.
- *Example:* If you have a Bird class with fly() method, then any subclass like Sparrow or Eagle should also support flying. But if the Penguin can’t fly, it shouldn’t extend the bird. In Android, this means your subclasses should behave consistently with their base classes.

#### I – Interface Segregation Principle (ISP)
- Don’t create large, all-in-one interfaces. Instead, create smaller, specific interfaces that serve one purpose.
- *Example in Android:* One big UserActions interface with methods login(), logout(), uploadPhoto(). Split into smaller interfaces like AuthActions, ProfileActions, MediaActions. This keeps code flexible — classes only implement what they need.

#### D – Dependency Inversion Principle (DIP)
- High-level modules (like ViewModel) shouldn’t depend on low-level modules (like RepositoryImpl). Both should depend on an abstraction (interface).
- *Example in Android:* Create a UserRepository interface. Then have multiple implementations like RemoteUserRepo and LocalUserRepo. Inject it using Dagger/Hilt or manual dependency injection. This makes it easy to swap implementations (for example, in testing).

#### Real Example
Let’s say you have a User Profile Screen:
- **SRP:** Separate classes for UI (Activity), business logic (ViewModel), and data (Repository).
- **OCP:** Add a new API provider without changing existing data layer code.
- **LSP:** Replace LocalUserRepository with RemoteUserRepository safely.
- **ISP:** Create small interfaces for login, logout, and profile operations separately.
- **DIP:** ViewModel depends on UserRepository interface, not a concrete class.

---

### Q:80) How does Dagger Hilt facilitate the application of the Dependency Inversion Principle in Android?
- Dagger Hilt automatically injects dependencies instead of manually creating them.
- It allows your classes (like ViewModels) to depend on interfaces instead of concrete classes.
- *Example:* Define an interface `UserRepository`. Bind `UserRepositoryImpl` using `@Binds` in a module. Hilt provides the implementation automatically wherever needed.

---

## 5. Jetpack Compose

### Q:1) What is Jetpack Compose?
Jetpack Compose is Android’s modern UI toolkit that lets you build UI using Kotlin code instead of XML.
- It’s declarative, meaning you describe what the UI should look like, and the system updates it automatically when the data changes.
- It replaces traditional XML + View-based UI system.
- Offers less boilerplate, better state handling, and Kotlin-first approach.

---

### Q:2) What is a Composable function?
A Composable is a special Kotlin function marked with `@Composable` that describes part of the UI.

*Example:*
```kotlin
@Composable
fun Greeting(name: String) {
    Text(text = "Hello, $name")
}
```
You can call one composable inside another to build complex UIs.

---

### Q:3) What is recomposition in Jetpack Compose?
Recomposition is when Compose redraws parts of the UI because data/state has changed.
- Only the part of the UI where data changed is recomposed.
- Compose optimizes this to avoid redrawing everything.

*Example:* If you update a count value shown in a Text, only that Text composable will recompose.

---

### Q:4) What is State in Compose?
State holds data that changes over time and triggers recomposition.
You can use `remember` and `mutableStateOf`:
```kotlin
val count = remember { mutableStateOf(0) }
```
When `count.value` changes, any UI that depends on it will update automatically.

---

### Q:5) What is remember and rememberSaveable?
- `remember` stores state during recomposition but resets on configuration changes (like rotation).
- `rememberSaveable` stores state across recomposition and configuration changes using Bundle.

Use `rememberSaveable` for things like text input or selection state that should survive screen rotation.

---

### Q:6) What is Modifier in Jetpack Compose?
Modifier is used to modify or decorate a composable — like setting padding, background, size, click behavior, etc.

*Example:*
```kotlin
Text(
    text = "Hello",
    modifier = Modifier
        .padding(16.dp)
        .background(Color.Yellow)
)
```
Modifiers are chained and read from left to right.

---

### Q:7) What is a Scaffold in Jetpack Compose?
Scaffold is a layout component that provides basic structure like:
- TopBar
- BottomBar
- FloatingActionButton
- Drawer
- SnackbarHost

*Example:*
```kotlin
Scaffold(
    topBar = { TopAppBar(title = { Text("Home") }) },
    floatingActionButton = { FloatingActionButton(onClick = {}) { Text("+") } }
) {
    // Content
}
```
Useful for material design layouts.

---

### Q:8) What is SideEffect in Jetpack Compose?
- In Jetpack Compose, a SideEffect is any operation that affects something outside of the Compose UI tree.
- Compose functions are pure by default, meaning they should not change anything outside themselves.
- SideEffect lets you perform actions that interact with external systems safely during recomposition.

#### Why It’s Needed
- Compose functions can recompose multiple times, so directly performing side-effects (like updating a variable, logging, or showing a toast) can cause bugs or repeated actions.
- SideEffect APIs provide a safe way to run external operations exactly when Compose recomposes.

#### Common Examples of SideEffects
- Updating a state in ViewModel
- Showing a Toast message
- Logging events
- Triggering analytics events

---

## 6. Unit Testing

### Q:1) What is Unit Testing in Android?
Unit testing is the practice of testing individual components or functions in isolation to ensure they behave correctly.
- In Android, we typically use JUnit for unit testing.
- Unit tests run on the JVM and are fast because they don't require a device/emulator.

---

### Q:2) What is the difference between Unit Tests and Instrumentation Tests in Android?

| Unit Test | Instrumentation Test |
| :--- | :--- |
| Runs on JVM | Runs on a real device/emulator |
| Fast | Slower due to UI/device interaction |
| Tests logic in isolation | Tests integration, UI, and end-to-end |
| Uses JUnit/Mockito | Uses Espresso, UI Automator, etc. |

---

### Q:3) Which tools/libraries are used for Unit Testing in Android?
- **JUnit** – Base library for writing tests.
- **Mockito / MockK** – For mocking dependencies.
- **Truth / AssertJ / Hamcrest** – Assertion libraries.
- **Robolectric** – Allows you to run Android SDK code in JVM unit tests.
- **Turbine** – For testing Kotlin Flow.
- **Kotlin Test DSL** – For idiomatic Kotlin test writing.

---

### Q:4) How do you test ViewModel in Android?
- ViewModels are easy to test because they don’t depend on Android Framework.
- You can write plain JUnit tests and verify outputs by observing LiveData or StateFlow.

---

## 7. Android Security

### Q:1) How can you securely store sensitive data in an Android app?
You should never store sensitive data (like passwords or tokens) in plain text. Instead:
- Use EncryptedSharedPreferences for small data like tokens.
- Use Android Keystore to store cryptographic keys securely.
- Avoid storing sensitive info in internal or external storage.

---

### Q:2) What is Android Keystore and why is it used?
Android Keystore is a secure container that helps store cryptographic keys. These keys can be used for encryption, decryption, or signing without exposing them directly to the app.
It ensures that:
- Keys cannot be extracted.
- Operations happen in secure hardware (if available).
- Your app remains safe even if rooted.

---

### Q:3) What are common security risks in Android apps?
Some common risks:
- Storing data in plain text.
- Using HTTP instead of HTTPS.
- Hardcoding API keys in code.
- Not validating inputs (leading to injection attacks).
- Using outdated libraries with vulnerabilities.

---

### Q:4) How can you protect your API keys in Android?
- Don’t hardcode keys in code or strings.xml.
- Use BuildConfig with Gradle to store API keys.
- Store keys on the server and use token-based auth.
- Use NDK (native C++) for critical keys (not fully secure but harder to reverse).

---

### Q:5) How can you prevent reverse engineering of your APK?
- Use ProGuard or R8 to obfuscate the code.
- Remove unused code and classes.
- Avoid storing logic or secrets in the app.
- Sign APKs with release keystore.
- Monitor unauthorized APKs using Play Store Console.

---

### Q:6) What is the use of ProGuard/R8 in Android?
ProGuard (now replaced by R8) is a tool that:
- Minifies code (removes unused code).
- Obfuscates names (changes class/method names to random characters).
- Makes it harder for attackers to reverse engineer the app.

---

### Q:7) How can you secure communication between app and server?
- Always use HTTPS (SSL/TLS) to encrypt data in transit.
- Use certificate pinning to verify the server.
- Avoid logging sensitive data (e.g., tokens or passwords).
- Use secure authentication methods like OAuth2 or JWT.

---

### Q:8) What is certificate pinning?
Certificate pinning is a technique where you hardcode your server’s public certificate or key in the app. It ensures:
- The app only trusts your server.

---

## 8. Scenario Based Questions

### Q:1) How do you handle configuration changes (like screen rotation) in Android without losing data?
ViewModel stores UI-related data across configuration changes.
When screen rotates:
- Activity/Fragment is destroyed and recreated.
- ViewModel is not destroyed.
- ViewModel retains the data and passes it again to the UI.

*Example:* In a profile screen, if user scrolls halfway and rotates the screen, without ViewModel the screen will reload from start. But with ViewModel, the profile data and scroll position can be restored smoothly.

---

### Q:2) You have two API calls that must run in parallel and update UI when both complete. How do you implement this?
Use Kotlin Coroutines with `async` and `await`.

```kotlin
viewModelScope.launch {
    val userDeferred = async { api.getUser() }
    val postsDeferred = async { api.getPosts() }
    val user = userDeferred.await()
    val posts = postsDeferred.await()
    _uiState.value = Success(user, posts)
}
```
This way, both calls run in parallel and UI updates after both are done.

---

### Q:3) You need to fetch data from both the local Room database and network. How do you design this?
Use Repository with a fallback logic:
1. First try Room DB (cached data).
2. If data is old/missing, fetch from API.
3. Save new data in the Room.

This ensures:
- Fast response (local DB)
- Always fresh data (network)

---

### Q:4) A user opens an app with no internet. How do you show offline data?
Use Room as the local cache.
- Repository checks connectivity.
- If offline, fetch from Room.
- If online, fetch from API and update Room.

Show “You’re offline” toast/snackbar while loading cached data.

---

### Q:5) In MVVM, who should handle click events and why?
The ViewModel should handle logic, not the Activity/Fragment.
- UI calls `viewModel.onLoginClicked()`
- ViewModel checks input, performs API call
- Emits success/error state via LiveData or StateFlow

Keeps code testable and follows separation of concerns.

---

### Q:6) In Jetpack Compose, how do you preserve scroll position when the user navigates back?
Use `rememberLazyListState()` in Composable:

```kotlin
val listState = rememberLazyListState()
LazyColumn(state = listState) { ... }
```

---

## 9. DevOps in Android

### Q:1) What is CI/CD in Android?
CI/CD in Android development refers to Continuous Integration and Continuous Delivery/Deployment, a set of practices that automate the building, testing, and delivery of Android applications.

- **Continuous Integration (CI)** means that developers regularly push code to a shared repository (like GitHub), and every push automatically triggers a build and test. This helps catch errors early.
- **Continuous Delivery (CD)** means that once code is tested and validated, it can be automatically packaged (APK or AAB) and delivered to testing environments (like Firebase App Distribution).
- **Continuous Deployment** goes one step further and automatically publishes the app to production like Google Play once it passes all quality checks.

CI/CD improves team collaboration, reduces manual errors, and speeds up release cycles.

---

### Q:2) Why is CI/CD important in Android development?
CI/CD helps in:
- Faster development cycles by automating build and testing.
- Early bug detection due to frequent code integration and automated tests.
- Better team collaboration, as code is constantly merged and verified.
- Reduced manual work — no need to manually run tests, generate APKs, or upload to Play Store.
- Consistent builds because the process is scripted and version-controlled.

---

### Q:3) Which tools are commonly used for CI/CD in Android?
Some commonly used CI/CD tools are:
- **GitHub Actions** – Integrated with GitHub, good for open-source and personal projects.
- **Bitrise** – Android and iOS friendly, no setup needed, GUI-based.

---

## 10. Gradle Concepts & Issues

### Q:1) What is Gradle in Android?
- Gradle is the build system used in Android.
- It automates compiling code, packaging APKs, and managing dependencies.
- Think of it as a recipe that tells Android Studio how to build your app.
- It’s fast, flexible, and supports custom build configurations.

---

### Q:2) What is the difference between Project-level and Module-level build.gradle?

#### Project-level build.gradle
- Applies to the entire project.
- Defines global configurations such as:
  - Gradle version
  - Repositories
  - Classpath for plugins

#### Module-level build.gradle
- Specific to each app/module.
- Defines module-specific settings such as:
  - Dependencies (`implementation`, `api`, etc.)
  - Build types (`debug`/`release`)
  - Product flavors
  - Android SDK version

*Key Point:* Project-level is for general setup affecting all modules, while Module-level is for app/module-specific configurations.

---

### Q:3) What are Build Variants and Product Flavors?
- **Build Variants:** Combination of build type (debug/release) + flavor. Example: `freeDebug`, `paidRelease`.

