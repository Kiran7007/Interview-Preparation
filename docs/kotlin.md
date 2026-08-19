# Kotlin
---

## Kotlin Fundamentals


## What is `val` vs `var` in Kotlin?

-   `val` means the reference cannot be reassigned.
-   `var` means the reference can be reassigned.
-   `val` does not make a mutable object immutable.

``` kotlin
val users = mutableListOf<String>()
users.add("Kiran")

var count = 0
count++
```

`users` cannot point to another list, but the list itself can still
change.

---

## What is the difference between `==` and `===` in Kotlin?

-   `==` checks structural equality using `equals()`.
-   `===` checks whether two references point to the same object.

``` kotlin
val a = String("Hello".toCharArray())
val b = String("Hello".toCharArray())

println(a == b)   // true
println(a === b)  // false
```

Use `==` when comparing values.

---

## What is a data class in Kotlin?

-   A data class is mainly used to hold data.
-   Kotlin automatically provides useful functions such as `equals()`,
    `hashCode()`, `toString()`, `copy()`, and `componentN()`.

``` kotlin
data class User(
    val id: String,
    val name: String
)

val user2 = user1.copy(name = "John")
```

It is commonly used for API models, UI state, and domain models.

---

## What is destructuring in Kotlin and where is it unsafe?

-   Destructuring allows values to be unpacked into variables.
-   It uses generated or declared `componentN()` functions.
-   It is commonly used with data classes.

``` kotlin
data class Employee(
    val name: String,
    val age: Int
)

val employee = Employee("Kiran", 30)

val (name, age) = employee
```

The compiler effectively uses:

``` kotlin
employee.component1()
employee.component2()
```

It can become unsafe when the component order is misunderstood or
changes.

``` kotlin
data class Employee(
    val name: String,
    val age: Int
)

val (age, name) = employee // Compiles, but meaning is wrong
```

---

## What does the `open` keyword mean in Kotlin?

-   Kotlin classes and methods are final by default.
-   `open` allows inheritance or overriding.
-   This is different from Java, where classes are inheritable by
    default.

``` kotlin
open class Animal {
    open fun sound() {
        println("Animal sound")
    }
}

class Dog : Animal() {
    override fun sound() {
        println("Bark")
    }
}
```

Kotlin makes classes final by default to reduce accidental inheritance.

---

## What is a sealed class?

-   A sealed class represents a restricted hierarchy.
-   The compiler knows the possible subclasses.
-   It is useful for UI states and result types.

``` kotlin
sealed class UiState {
    data object Loading : UiState
    data class Success(val users: List<User>) : UiState
    data class Error(val message: String) : UiState
}
```

It works well with exhaustive `when`.

---

## What is a sealed interface?

-   Both restrict the hierarchy.
-   A class can implement multiple interfaces.
-   A sealed interface is useful when different types need the same
    restricted contract.

``` kotlin
sealed interface UiEvent

data object NavigateBack : UiEvent
data class ShowError(val message: String) : UiEvent
```

It works well with exhaustive `when` expressions.

---

## What is the difference between a sealed class and a sealed interface?

-   A sealed class can provide shared state or implementation.
-   A class can extend only one sealed class.
-   A class can implement multiple sealed interfaces.
-   Use a sealed class for a closely related state hierarchy.
-   Use a sealed interface when different class hierarchies need the
    same restricted contract.

``` kotlin
sealed class Result {
    data class Success(val value: String) : Result()
    data class Error(val message: String) : Result()
}

sealed interface UiEvent
data object NavigateBack : UiEvent
```

---

## What is an extension function?

-   An extension function adds a function to an existing type without
    modifying that type.
-   It is resolved statically.

``` kotlin
fun String.isValidAccountId(): Boolean {
    return length == 10 && all { it.isDigit() }
}

val valid = "1234567890".isValidAccountId()
```

It is useful for small, reusable transformations.

---

## What is a higher-order function?

-   A higher-order function takes another function as a parameter or
    returns a function.

``` kotlin
fun execute(block: () -> Unit) {
    block()
}

execute {
    println("Done")
}
```

Collection APIs such as `map`, `filter`, and `fold` heavily use
higher-order functions.

---

## What is an inline function?

-   `inline` asks the compiler to inline the function body at the call
    site.
-   It can reduce lambda allocation overhead in suitable cases.
-   It is especially useful for small higher-order functions.

``` kotlin
inline fun measure(block: () -> Unit) {
    val start = System.currentTimeMillis()
    block()
    println(System.currentTimeMillis() - start)
}
```

Do not use `inline` everywhere. Large functions can increase generated
code size.

---

## What is a reified generic?

-   Normally generic type information is erased at runtime.
-   `reified` allows an inline function to access the generic type at
    runtime.

``` kotlin
inline fun <reified T> isType(value: Any): Boolean {
    return value is T
}

isType<String>("Hello")
```

It is useful for type-safe APIs such as JSON parsing and dependency
helpers.

---

## What is delegation in Kotlin?

-   Delegation allows one object to delegate behavior to another.
-   Kotlin supports class delegation and property delegation.

``` kotlin
interface Logger {
    fun log(message: String)
}

class ConsoleLogger : Logger {
    override fun log(message: String) {
        println(message)
    }
}

class UserLogger(
    logger: Logger
) : Logger by logger
```

The compiler generates forwarding methods.

---

## What is property delegation?

-   Property delegation moves getter/setter behavior to another object.
-   Common examples are `lazy` and Android-specific delegates.

``` kotlin
val database by lazy {
    createDatabase()
}
```

The value is created only when first accessed.

---

## What is `by lazy`?

-   `lazy` initializes a value only when it is first accessed.
-   The default implementation is thread-safe.

``` kotlin
val repository by lazy {
    UserRepository()
}
```

It is useful for expensive objects that are not needed immediately.

---

## What is `lateinit`?

-   `lateinit` allows a non-null `var` to be initialized later.
-   It works mainly with reference types.
-   Accessing it before initialization throws an exception.

``` kotlin
lateinit var repository: UserRepository
```

Use it carefully. Constructor injection is usually safer.

---

## What is an `object` in Kotlin?

-   `object` creates a singleton object.
-   It is initialized when first accessed.

``` kotlin
object AppLogger {
    fun log(message: String) {
        println(message)
    }
}
```

Avoid using global singletons for dependencies that need easy
replacement in tests.

---

## What is a companion object?

-   A companion object provides class-level members.
-   Kotlin does not have Java-style static members.

``` kotlin
class User private constructor() {
    companion object {
        fun create(): User = User()
    }
}
```

It can also implement interfaces.

---

## Coroutines: Builders and Structured Concurrency

## What are coroutine builders in Kotlin?

Common builders are:

-   `launch` returns a `Job`.
-   `async` returns a `Deferred<T>`.
-   `runBlocking` blocks the current thread.
-   `coroutineScope` creates a structured child scope.
-   `supervisorScope` isolates child failures.

``` kotlin
viewModelScope.launch {
    val result = async {
        repository.loadUser()
    }.await()
}
```

---

## What is structured concurrency in Kotlin?

-   Structured concurrency ensures that child coroutines have a clear
    parent.
-   The parent controls the lifetime of its children.
-   Cancellation and failures can propagate predictably.

``` kotlin
viewModelScope.launch {

    coroutineScope {

        launch {
            loadUser()
        }

        launch {
            loadOrders()
        }
    }
}
```

The child coroutines belong to the parent.

When the ViewModel is cleared:

``` text
viewModelScope
      ↓
parent coroutine
      ↓
child coroutine
      ↓
child coroutine
```

They are cancelled together.

Avoid:

``` kotlin
GlobalScope.launch {
    loadUser()
}
```

because there is no feature-level owner controlling its lifetime.

---

## What is the difference between `launch` and `async`?

-   `launch` is used when you do not need a return value.
-   `async` is used when you need a result.
-   `launch` returns `Job`.
-   `async` returns `Deferred<T>`.

``` kotlin
launch {
    saveUser()
}

val user = async {
    loadUser()
}.await()
```

Use `async` only when the result is actually needed.

---

## What is `SupervisorJob`?

-   `SupervisorJob` creates a parent job where failure of one child does
    not automatically cancel sibling children.
-   It is useful when independent tasks should continue independently.

``` kotlin
val scope = CoroutineScope(
    SupervisorJob() + Dispatchers.Main
)
```

In Android, prefer lifecycle-aware scopes such as `viewModelScope`
rather than creating unmanaged scopes.

---

## What is coroutine cancellation?

-   Cancellation is cooperative.
-   Suspending functions usually check cancellation automatically.
-   CPU-heavy loops should check cancellation explicitly.

``` kotlin
while (isActive) {
    doWork()
}
```

Avoid swallowing `CancellationException`.

---

## What is the difference between `Dispatchers.Main`, `IO`, and `Default`?

-   `Main` is for UI work.
-   `IO` is for blocking I/O such as files, database, and network
    operations.
-   `Default` is for CPU-intensive work.

``` kotlin
withContext(Dispatchers.IO) {
    database.loadUsers()
}
```

Use the dispatcher based on the work, not simply because it is a
background operation.

---

## What is exception handling in coroutines?

-   Use `try/catch` around operations where you can recover.
-   `CoroutineExceptionHandler` is mainly for uncaught exceptions in
    root coroutines.
-   `supervisorScope` is useful when child failures should be isolated.

``` kotlin
viewModelScope.launch {
    try {
        repository.loadUser()
    } catch (e: IOException) {
        showNetworkError()
    }
}
```

Do not catch every `Throwable` blindly because cancellation must remain
cancellable.

---

## Flow and Reactive Streams

## What is Flow?

-   `Flow` represents an asynchronous stream of values.
-   It is cold by default.
-   The producer executes when a collector starts collecting.

``` kotlin
fun users(): Flow<List<User>> = flow {
    emit(api.getUsers())
}
```

Each collector can trigger the upstream flow independently.

---

## What is a cold Flow?

-   A cold Flow does not start producing values until collected.
-   Each collector gets its own execution.

``` kotlin
val flow = flow {
    println("Started")
    emit(1)
}
```

Collecting twice can execute the upstream twice.

---

## What is a hot Flow?

-   A hot flow exists independently of collectors.
-   `StateFlow` and `SharedFlow` are common hot flows.

``` kotlin
val state: StateFlow<UiState>
```

The producer can exist even when no UI is collecting.

---

## What is StateFlow?

-   `StateFlow` represents current state.
-   It always has a current value.
-   It replays the latest value to a new collector.

``` kotlin
private val _state = MutableStateFlow(UiState.Loading)
val state = _state.asStateFlow()
```

It is ideal for ViewModel UI state.

---

## What is SharedFlow?

-   `SharedFlow` is a hot stream for shared events or values.
-   It supports replay and buffering configuration.

``` kotlin
private val _events = MutableSharedFlow<UiEvent>()
val events = _events.asSharedFlow()
```

It is useful for events such as navigation or snackbar messages.

---

## StateFlow vs SharedFlow

  StateFlow                  SharedFlow
  -------------------------- ---------------------------
  Represents state           Represents events/streams
  Requires initial value     Does not require one
  Always has current value   May have no current value
  Replays latest state       Replay is configurable

Example:

``` kotlin
StateFlow<ScreenState>
SharedFlow<UiEvent>
```

---

## What is LiveData and how does it compare with StateFlow?

-   LiveData is lifecycle-aware and Android-specific.
-   StateFlow is Kotlin/Coroutine based.
-   StateFlow works outside Android.
-   StateFlow provides Flow operators.

For new coroutine-based applications, StateFlow is usually preferred.

---

## What is `combine` vs `merge`?

-   `merge` forwards emissions from multiple flows.
-   `combine` combines the latest value from each flow.

``` kotlin
combine(userFlow, accountFlow) { user, account ->
    Dashboard(user, account)
}
```

Use `combine` when the output needs the latest value from multiple
sources.

---

## What is `flatMapLatest`?

-   It switches to the latest flow and cancels the previous one.
-   It is useful for search.

``` kotlin
query
    .debounce(300)
    .distinctUntilChanged()
    .flatMapLatest {
        repository.search(it)
    }
```

If the user types again, the previous search is cancelled.

---

## What is `debounce`?

-   `debounce` waits for a quiet period before emitting.
-   It is useful for search input.

``` kotlin
query
    .debounce(300)
```

If the user types continuously, intermediate values are skipped.

---

## What is `distinctUntilChanged`?

-   It prevents consecutive duplicate values.

``` kotlin
query
    .distinctUntilChanged()
```

Typing the same query twice does not trigger another identical
downstream operation.

---

## How do you convert a cold Flow to a hot Flow?

Use `stateIn` or `shareIn`.

``` kotlin
val users = repository.users()
    .stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5_000),
        emptyList()
    )
```

`stateIn` creates StateFlow.

`shareIn` creates SharedFlow.

---

## How do you convert a hot Flow to a cold Flow?

You normally cannot turn a hot stream into a truly equivalent cold
stream without changing its semantics.

If you need independent execution per collector, expose the underlying
cold producer instead.

For example:

``` kotlin
fun users(): Flow<List<User>> = flow {
    emit(repository.loadUsers())
}
```

A `StateFlow` itself remains hot.

---

## What is `stateIn`?

-   `stateIn` converts a Flow into StateFlow.
-   It gives the stream a current value.

``` kotlin
val state = repository.users()
    .stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = emptyList()
    )
```

It is useful when UI needs current state.

---

## What is `shareIn`?

-   `shareIn` converts a cold Flow into SharedFlow.
-   It shares one upstream execution among collectors.

``` kotlin
val events = repository.events()
    .shareIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5_000),
        replay = 0
    )
```

---

## Advanced Kotlin

## What is an inline function useful for in Android?

-   It can reduce lambda allocation overhead.
-   It enables `reified` type parameters.
-   It is useful for small utility APIs.

Do not inline large functions unnecessarily because generated code can
increase.

---

## What is operator overloading in Kotlin?

-   Kotlin allows operators such as `+`, `-`, `[]`, and `invoke` to map
    to functions.

``` kotlin
data class Money(val amount: Int)

operator fun Money.plus(other: Money): Money {
    return Money(amount + other.amount)
}

val total = Money(100) + Money(50)
```

Use it only when the operator meaning is obvious.

---

## What is a DSL in Kotlin?

-   A DSL creates an API that reads like a small domain-specific
    language.
-   Kotlin supports DSLs using lambdas with receivers, builders, and
    extension functions.

``` kotlin
buildUser {
    name = "Kiran"
    age = 30
}
```

DSLs are useful for readable configuration and builders.

---

## What is Kotlin Multiplatform?

-   Kotlin Multiplatform allows sharing Kotlin code across platforms.
-   Business logic, networking, data models, and other code can be
    shared.
-   Platform-specific UI or APIs can remain native.

``` text
shared
 ├── domain
 ├── data
 └── common logic

Android → Android UI
iOS     → iOS UI
```

Use it when code sharing provides enough value to justify the added
complexity.

---

## What is the difference between a suspend function and Flow?

-   A `suspend` function usually returns one result.
-   A Flow can emit multiple values over time.

``` kotlin
suspend fun getUser(): User

fun observeUser(): Flow<User>
```

Use a suspend function for one-shot work and Flow for streams/state.

---

## What happens if `searchRepositories(query)` is a suspend function?

If it returns one result:

``` kotlin
val repositories = query
    .debounce(300)
    .distinctUntilChanged()
    .mapLatest { query ->
        repository.searchRepositories(query)
    }
```

`mapLatest` is useful because a new query cancels the previous suspend
operation.

---

## What is `runBlocking` vs `runTest`?

-   `runBlocking` blocks a real thread.
-   `runTest` provides coroutine test scheduling and virtual time.
-   Android unit tests should generally use `runTest` for coroutine
    code.

``` kotlin
@Test
fun testLoadUser() = runTest {
    viewModel.loadUser()
}
```

Use `runBlocking` mainly when bridging synchronous and coroutine code,
not as the normal coroutine test tool.

---

## Why should you avoid `GlobalScope`?

-   It is not lifecycle-aware.
-   Work can outlive the feature that started it.
-   It makes cancellation and testing harder.

Prefer:

``` kotlin
viewModelScope.launch { ... }
```

or an injected application-level scope when work truly belongs to the
application lifecycle.
---

## What does `ensureActive()` do?

-   `ensureActive()` checks whether the coroutine has been cancelled.
-   If the coroutine is active, execution continues.
-   If it is cancelled, `ensureActive()` throws `CancellationException`.
-   It is useful inside CPU-heavy loops that do not naturally suspend.

``` kotlin
val job = launch {

    for (i in 1..1_000_000) {

        ensureActive()

        heavyCalculation(i)
    }
}

job.cancel()
```

After `job.cancel()`:

``` text
job.cancel()
     ↓
coroutine becomes cancelled
     ↓
next ensureActive()
     ↓
CancellationException
     ↓
loop stops
```

Important:

``` kotlin
for (i in 1..1_000_000) {
    heavyCalculation(i)
}
```

If `heavyCalculation()` never suspends and there is no cancellation
check, cancellation may not stop the loop immediately.

Interview answer:

> `ensureActive()` does not keep a cancelled coroutine running. It
> detects cancellation and throws `CancellationException`.

---

## What is the difference between `ensureActive()` and `isActive`?

-   Both can be used to react to cancellation.
-   `ensureActive()` throws `CancellationException`.
-   `isActive` only returns a Boolean.
-   `ensureActive()` is useful when you want normal coroutine
    cancellation to propagate automatically.

``` kotlin
ensureActive()
```

is similar to:

``` kotlin
if (!isActive) {
    throw CancellationException()
}
```

With `isActive`:

``` kotlin
while (isActive) {
    doWork()
}
```

With `ensureActive()`:

``` kotlin
while (true) {
    ensureActive()
    doWork()
}
```

Interview answer:

> Use `isActive` when you want to decide what to do when cancellation
> happens. Use `ensureActive()` when cancellation should immediately
> abort the operation.

---

## What is cooperative cancellation?

-   Kotlin coroutine cancellation is cooperative.
-   Cancelling a `Job` does not forcibly kill arbitrary CPU code.
-   The coroutine must reach a suspension point or explicitly check
    cancellation.

``` kotlin
val job = launch {

    while (true) {
        ensureActive()
        doWork()
    }
}

job.cancel()
```

Common cancellation-aware operations include:

``` kotlin
delay(...)
yield()
await()
withContext(...)
```

A CPU-only loop needs an explicit check:

``` kotlin
while (isActive) {
    calculate()
}
```

Interview answer:

> Coroutine cancellation is cooperative, not forceful. The code must
> cooperate by reaching a cancellation-aware suspension point or
> checking its active state.

---

## What happens when `job.cancel()` is called while `delay()` is running?

`delay()` is cancellation-aware.

``` kotlin
val job = launch {

    println("Start")

    delay(5000)

    println("End")
}

job.cancel()
```

`End` will not execute.

The coroutine is cancelled while suspended.

``` text
Start
  ↓
delay(5000)
  ↓
job.cancel()
  ↓
CancellationException
  ↓
coroutine ends
```

This is one reason `delay()` is safe for coroutine cancellation.

---

## Does `delay()` block the Main thread?

No.

``` kotlin
viewModelScope.launch(Dispatchers.Main) {

    delay(5000)

    updateUi()
}
```

`delay()` suspends the coroutine, not the thread.

The Main thread can continue processing other work.

Compare this with:

``` kotlin
Thread.sleep(5000)
```

`Thread.sleep()` blocks the Main thread.

Interview answer:

> `delay()` is non-blocking suspension. `Thread.sleep()` is blocking and
> can cause UI freezes or ANRs on Main.

---

## What is `NonCancellable`?

-   `NonCancellable` is a special `CoroutineContext` element.
-   It prevents cancellation from stopping the block while that block is
    executing.
-   It is mainly useful for cleanup or critical final operations.

``` kotlin
try {
    doWork()
} finally {

    withContext(NonCancellable) {
        saveState()
    }
}
```

Without `NonCancellable`, a suspending operation in `finally` may
immediately observe the cancelled state.

Use it carefully.

Good use:

``` kotlin
finally {
    withContext(NonCancellable) {
        closeResource()
    }
}
```

Bad use:

``` kotlin
withContext(NonCancellable) {
    apiCall()
}
```

Do not use it simply to make normal business work ignore cancellation.

---

## Is `NonCancellable` the same as `GlobalScope`?

No. They solve completely different problems.

`NonCancellable`:

-   Is a coroutine context element.
-   Temporarily prevents cancellation inside a specific block.
-   Still belongs to the original coroutine and parent lifecycle.

`GlobalScope`:

-   Is a coroutine scope.
-   Is not automatically tied to the current feature lifecycle.
-   Can outlive an Activity, Fragment, ViewModel, or screen.

``` kotlin
withContext(NonCancellable) {
    cleanup()
}
```

versus:

``` kotlin
GlobalScope.launch {
    cleanup()
}
```

The first is controlled cleanup.

The second creates an independent coroutine.

Interview answer:

> `NonCancellable` changes cancellation behavior inside a block.
> `GlobalScope` changes coroutine ownership and lifetime.

---

## What happens to `finally` when a coroutine is cancelled?

`finally` normally executes during cancellation.

``` kotlin
val job = launch {

    try {
        delay(5000)
    } finally {
        println("Cleanup")
    }
}

job.cancel()
```

`Cleanup` is printed.

But this is tricky:

``` kotlin
finally {
    delay(1000)
}
```

The coroutine is already cancelled, so the suspending call may
immediately fail with `CancellationException`.

For cleanup that must suspend:

``` kotlin
finally {
    withContext(NonCancellable) {
        delay(1000)
        saveToDatabase()
    }
}
```

---

## Do two `async` calls execute if I never call `await()`?

They can start and execute even if you never call `await()`.

``` kotlin
coroutineScope {

    val first = async {
        api1()
    }

    val second = async {
        api2()
    }

    // No await()
}
```

However, `async` is not a fire-and-forget replacement for `launch`.

The enclosing structured scope still waits for its children.

If the results are not needed, prefer:

``` kotlin
launch {
    api1()
}

launch {
    api2()
}
```

Another important point:

If an `async` child fails, its exception can still cancel the parent in
a normal `coroutineScope`, even if nobody calls `await()`.

Interview answer:

> `async` starts a child coroutine, but its purpose is to produce a
> result. Not calling `await()` does not make it independent or detach
> it from structured concurrency.

---

## Are two `async` calls parallel or sequential?

This is parallel/concurrent:

``` kotlin
coroutineScope {

    val first = async {
        api1()
    }

    val second = async {
        api2()
    }

    val result1 = first.await()
    val result2 = second.await()
}
```

Both operations are started before the first `await()`.

Conceptually:

``` text
api1  ────────────────┐
                      ├── combine
api2  ────────────────┘
```

But this is sequential:

``` kotlin
val result1 = async {
    api1()
}.await()

val result2 = async {
    api2()
}.await()
```

The second `async` is not created until the first operation completes.

``` text
api1 ──────> result1
                 ↓
api2 ──────> result2
```

Interview answer:

> Create both `async` operations first and then await their results to
> allow them to run concurrently.

---

## Does `async` always mean parallel execution?

No.

`async` means concurrent coroutine work, not guaranteed physical
parallelism.

``` kotlin
async {
    calculate()
}
```

Whether it executes on multiple threads depends on the dispatcher.

For example:

``` kotlin
async(Dispatchers.Default) {
    calculate()
}
```

can execute CPU work on different worker threads.

But:

``` kotlin
async(Dispatchers.Main) {
    calculate()
}
```

runs on the Main dispatcher and does not magically create another UI
thread.

Interview answer:

> `async` provides concurrency. Actual parallel execution depends on the
> dispatcher and available threads.

---

## What happens if `await()` is called immediately after `async`?

Example:

``` kotlin
val result1 = async {
    api1()
}.await()

val result2 = async {
    api2()
}.await()
```

This is effectively sequential.

The first operation must complete before the second `async` is created.

To run concurrently:

``` kotlin
val first = async {
    api1()
}

val second = async {
    api2()
}

val result1 = first.await()
val result2 = second.await()
```

This is a very common interview trap.

---

## What happens if one `async` fails inside `coroutineScope`?

``` kotlin
coroutineScope {

    val first = async {
        api1()
    }

    val second = async {
        throw Exception("API failed")
    }

    first.await()
    second.await()
}
```

The failure cancels the parent scope.

Therefore the other child is also cancelled.

``` text
coroutineScope
      ↓
   ┌──┴──┐
 async1 async2
          ↓
        fails
          ↓
 parent cancelled
          ↓
 async1 cancelled
```

The exception is not made harmless simply because `await()` was not
called.

---

## How does `supervisorScope` change exception propagation?

`supervisorScope` prevents one child failure from automatically
cancelling sibling children.

``` kotlin
supervisorScope {

    launch {
        throw Exception("Failed")
    }

    launch {
        delay(1000)
        println("Still running")
    }
}
```

The second child can continue.

Compare:

``` text
coroutineScope

child A fails
     ↓
parent fails
     ↓
child B cancelled
```

With:

``` text
supervisorScope

child A fails
     ↓
child B continues
```

Use it when sibling operations should be independent.

---

## Does `launch` exception get caught by an outer `try-catch`?

This does not work as many developers expect:

``` kotlin
try {

    launch {
        throw Exception("Failed")
    }

} catch (e: Exception) {

    println("Caught")
}
```

The `launch` body executes asynchronously.

The outer `try-catch` does not surround the actual execution of the
child.

Instead:

``` kotlin
launch {

    try {
        riskyOperation()
    } catch (e: Exception) {
        println("Caught")
    }
}
```

For a root coroutine, a `CoroutineExceptionHandler` can also observe
uncaught exceptions.

Interview answer:

> `try-catch` must normally be inside the coroutine that executes the
> failing code, or the exception must be handled through structured
> concurrency.

---

## How are exceptions different between `launch` and `async`?

`launch` returns a `Job` and does not provide a result.

``` kotlin
launch {
    throw Exception("Failed")
}
```

The exception is propagated to its parent.

`async` returns a `Deferred`.

``` kotlin
val deferred = async {
    throw Exception("Failed")
}
```

There is an important nuance:

Inside a normal `coroutineScope`, the failure can still cancel the
parent immediately.

If the `Deferred` is independently supervised, the exception becomes
observable when its result is awaited.

So avoid saying:

> "async always stores the exception until await."

The more accurate answer is:

> `async` exposes the result and exception through `Deferred`, but
> structured concurrency still controls exception propagation. `await()`
> is where the caller receives the failed result.

---

## What happens if an `async` exception is never awaited?

Consider:

``` kotlin
coroutineScope {

    val deferred = async {
        throw Exception("Failed")
    }

    delay(1000)

    println("Done")
}
```

The failure still affects the structured scope.

It is incorrect to assume that because `await()` is missing, the
exception is completely ignored.

The parent can be cancelled because the `async` child failed.

This is a common senior-level interview correction.

---

## What happens when a child coroutine is cancelled?

``` kotlin
launch {

    val child = launch {
        delay(1000)
        println("Child")
    }

    child.cancel()

    println("Parent")
}
```

Output:

``` text
Parent
```

The child is cancelled.

Cancelling a child does not normally cancel its parent.

But cancelling the parent cancels its children.

``` text
parent.cancel()
     ↓
child cancelled
```

while:

``` text
child.cancel()
     ↓
parent continues
```

---

## What happens when a parent coroutine is cancelled?

``` kotlin
val parent = launch {

    launch {
        delay(5000)
        println("Child 1")
    }

    launch {
        delay(5000)
        println("Child 2")
    }
}

parent.cancel()
```

Both children are cancelled.

This is structured concurrency.

---

## What happens with `launch` inside another `launch`?

``` kotlin
launch {

    launch {
        delay(1000)
        println("Child")
    }

    println("Parent")
}
```

The parent prints immediately.

Then the child prints later.

The important point is that the parent coroutine does not necessarily
wait at that exact line, but the structured parent does not complete
until its child completes.

---

## What happens if `GlobalScope.launch` is used inside a parent coroutine?

``` kotlin
launch {

    GlobalScope.launch {
        delay(1000)
        println("Global child")
    }
}
```

The `GlobalScope` coroutine is not a child of the surrounding `launch`.

Therefore:

``` text
parent cancelled
     ↓
normal child → cancelled

GlobalScope child → continues
```

This is why `GlobalScope` is usually avoided in Android feature code.

---

## What is the difference between `withContext` and `launch`?

`withContext`:

-   Changes context.
-   Suspends the current coroutine until the block completes.
-   Returns a result.

``` kotlin
val user = withContext(Dispatchers.IO) {
    repository.loadUser()
}

println(user)
```

The `println()` happens after `loadUser()` completes.

`launch`:

-   Creates a child coroutine.
-   Returns immediately with a `Job`.
-   Does not return the block result.

``` kotlin
launch(Dispatchers.IO) {
    repository.loadUser()
}

println("This can execute before loadUser finishes")
```

Interview answer:

> `withContext` is for switching context and waiting for the result.
> `launch` creates a concurrent child operation.

---

## Is `withContext` blocking?

No, not in the thread-blocking sense.

``` kotlin
withContext(Dispatchers.IO) {
    apiCall()
}
```

The current coroutine suspends while the operation runs.

The thread is not necessarily blocked.

This distinction is important:

``` text
Thread blocking:
Thread.sleep()
     ↓
thread cannot do other work

Coroutine suspension:
delay()
     ↓
coroutine pauses
     ↓
thread can do other work
```

---

## What is `Dispatchers.Main.immediate`?

`Dispatchers.Main.immediate` can execute immediately when the coroutine
is already running on the Main dispatcher.

For example:

``` kotlin
launch(Dispatchers.Main.immediate) {
    println("A")
}

println("B")
```

If this code is already executing on Main, `A` can execute immediately
before `B`.

With:

``` kotlin
launch(Dispatchers.Main) {
    println("A")
}

println("B")
```

the coroutine may be dispatched, so `B` can execute before `A`.

Important:

> `Main.immediate` does not mean "always synchronous." It avoids an
> unnecessary dispatch when already on the Main dispatcher.

---

## Why can `delay()` inside `Dispatchers.Main` be safe?

``` kotlin
launch(Dispatchers.Main) {

    println("Before")

    delay(1000)

    println("After")
}
```

During the delay:

``` text
Main thread
   ↓
coroutine suspended
   ↓
Main thread available
   ↓
other UI work can execute
   ↓
coroutine resumes later
```

Compare:

``` kotlin
launch(Dispatchers.Main) {
    Thread.sleep(1000)
}
```

This blocks Main and can cause an ANR.

---

## What is `yield()`?

`yield()` gives other ready coroutines an opportunity to execute.

``` kotlin
launch {
    println("A")
    yield()
    println("B")
}

launch {
    println("C")
}
```

A possible output is:

``` text
A
C
B
```

The important point is not to promise an exact order.

`yield()` is also cancellation-aware.

``` kotlin
yield()
```

can detect cancellation and stop the coroutine.

Interview answer:

> `yield()` suspends the current coroutine and gives other coroutines a
> chance to run. It does not guarantee a specific execution order.

---

## What is the difference between `delay()` and `yield()`?

`delay()`:

``` kotlin
delay(1000)
```

suspends for at least the requested delay period.

`yield()`:

``` kotlin
yield()
```

does not intentionally wait for a fixed amount of time. It gives the
scheduler an opportunity to run other work.

Both are suspension points.

---

## Can `withContext(Dispatchers.IO)` be nested inside `withContext(Dispatchers.IO)`?

Technically yes:

``` kotlin
withContext(Dispatchers.IO) {

    withContext(Dispatchers.IO) {
        repository.load()
    }
}
```

But it is usually unnecessary.

A better design is:

``` kotlin
withContext(Dispatchers.IO) {
    repository.load()
}
```

Avoid unnecessary context switches because they make code harder to
reason about.

---

## What happens with nested dispatcher switching?

``` kotlin
withContext(Dispatchers.IO) {

    loadFromDatabase()

    withContext(Dispatchers.Main) {
        updateUi()
    }
}
```

Execution moves:

``` text
Current dispatcher
       ↓
IO
       ↓
Main
       ↓
return to IO
       ↓
return to original context
```

`withContext` is sequential. The outer block waits for the inner block
to finish.

---

## Can `runBlocking` cause an Android ANR?

Yes.

`runBlocking` blocks the current thread until its coroutine completes.

Bad Android example:

``` kotlin
fun onClick() {

    runBlocking {
        delay(5000)
    }
}
```

If this executes on Main:

``` text
Main thread
    ↓
runBlocking
    ↓
thread blocked for 5 seconds
    ↓
UI cannot process events
```

Prefer:

``` kotlin
lifecycleScope.launch {
    delay(5000)
}
```

Interview answer:

> `runBlocking` is useful for bridging blocking code and coroutine code,
> especially in tests or `main()` examples, but it should not be used to
> block Android's Main thread.

---

## What happens when `runBlocking` contains a normal child `launch`?

``` kotlin
runBlocking {

    launch {
        delay(1000)
        println("Done")
    }

    println("Parent")
}
```

Output is:

``` text
Parent
Done
```

`runBlocking` waits for its structured children before returning.

---

## What happens when `runBlocking` contains `GlobalScope.launch`?

``` kotlin
runBlocking {

    GlobalScope.launch {
        delay(1000)
        println("Done")
    }
}
```

`runBlocking` does not wait for the `GlobalScope` coroutine.

The program may finish before `Done` is printed.

Why?

``` text
runBlocking
   ↓
waits for its children

GlobalScope.launch
   ↓
not a child
```

---

## What is a common `Flow` cancellation trap?

Consider:

``` kotlin
flow {
    emit(1)
    emit(2)
}.collect {
    if (it == 1) {
        cancel()
    }

    println(it)
}
```

When `cancel()` cancels the collecting coroutine, collection stops
through cancellation.

The important idea is:

> Flow collection is cooperative and follows coroutine cancellation.

A safer way to stop collection based on a condition is often to use
operators such as:

``` kotlin
takeWhile { it != 1 }
```

or:

``` kotlin
first { it == 1 }
```

depending on the requirement.

---

## What happens if you catch `CancellationException` incorrectly?

This is dangerous:

``` kotlin
try {
    doWork()
} catch (e: Exception) {
    println("Error")
}
```

Because `CancellationException` is an `Exception`, this can accidentally
catch cancellation.

A coroutine may then continue executing after cancellation.

Prefer:

``` kotlin
try {
    doWork()
} catch (e: CancellationException) {
    throw e
} catch (e: Exception) {
    handleError(e)
}
```

Interview answer:

> Never swallow `CancellationException`. Cancellation is a control
> signal, not a normal business failure.

---

## What is the tricky problem with `catch (Exception)` in coroutine code?

Example:

``` kotlin
try {
    delay(5000)
} catch (e: Exception) {
    println("Something failed")
}
```

If the coroutine is cancelled during `delay()`, the catch block can
catch `CancellationException`.

If you swallow it, the coroutine may continue.

Better:

``` kotlin
catch (e: CancellationException) {
    throw e
}
catch (e: Exception) {
    handleError(e)
}
```

This is a very common senior-level interview question.

---

## What happens if `CancellationException` is thrown manually?

``` kotlin
throw CancellationException()
```

The coroutine becomes cancelled.

It is treated differently from a normal application exception because
cancellation is part of coroutine control flow.

Usually you should let cancellation propagate instead of converting it
into another exception.

---

## What happens if a cancelled coroutine calls `withContext(Dispatchers.IO)`?

Cancellation normally propagates.

``` kotlin
job.cancel()

withContext(Dispatchers.IO) {
    doWork()
}
```

A cancelled coroutine cannot normally use `withContext` to escape
cancellation.

Changing the dispatcher does not remove cancellation.

To intentionally perform cancellation-safe cleanup:

``` kotlin
withContext(NonCancellable) {
    withContext(Dispatchers.IO) {
        saveData()
    }
}
```

This is a useful interview combination.

---

## Can `NonCancellable` make a coroutine immortal?

No.

``` kotlin
withContext(NonCancellable) {
    cleanup()
}
```

It only changes cancellation behavior for that block.

It does not detach the coroutine from its parent.

The parent can still control the coroutine lifecycle outside that block.

Think:

``` text
Parent cancellation
       ↓
Coroutine cancelled
       ↓
finally
       ↓
NonCancellable cleanup
       ↓
cleanup finishes
       ↓
coroutine completes
```

---

## What happens if you call `job.cancel()` and immediately call `job.join()`?

``` kotlin
job.cancel()
job.join()
```

`cancel()` requests cancellation.

`join()` suspends until the job has actually completed.

This is useful when you need to wait for cancellation and cleanup to
finish.

``` kotlin
job.cancel()
job.join()

println("Job completely finished")
```

Interview answer:

> `cancel()` requests cancellation. `join()` waits for the coroutine to
> finish.

---

## What is the difference between `cancel()` and `cancelAndJoin()`?

Instead of:

``` kotlin
job.cancel()
job.join()
```

you can use:

``` kotlin
job.cancelAndJoin()
```

It performs both operations.

``` text
cancelAndJoin()
      ↓
request cancellation
      ↓
wait for completion
```

This is useful in tests and lifecycle-sensitive code.

---

## What happens when you call `join()` without cancelling?

``` kotlin
val job = launch {
    delay(1000)
    println("Done")
}

job.join()

println("Finished waiting")
```

Output:

``` text
Done
Finished waiting
```

`join()` does not cancel anything.

It simply waits for the job to complete.

---

## What happens with `Job` cancellation and child jobs?

``` kotlin
val parent = launch {

    val child = launch {
        delay(5000)
    }

    delay(1000)
}

parent.cancel()
```

The child is cancelled because cancellation propagates from parent to
child.

But:

``` kotlin
child.cancel()
```

does not normally cancel the parent.

Cancellation flows downward.

---

## What is the difference between cancellation propagation and exception propagation?

Cancellation:

``` text
parent cancelled
     ↓
children cancelled
```

Normal failure:

``` text
child throws exception
     ↓
parent fails
     ↓
siblings cancelled
```

With supervision:

``` text
child throws exception
     ↓
sibling can continue
```

This distinction is important when explaining `coroutineScope` vs
`supervisorScope`.

---

## What is a common race condition with shared mutable state?

Example:

``` kotlin
var count = 0

coroutineScope {

    repeat(1000) {

        launch(Dispatchers.Default) {
            count++
        }
    }
}
```

The final value is not guaranteed to be 1000.

Why?

`count++` is not one atomic operation.

Conceptually:

``` text
read count
   ↓
add 1
   ↓
write count
```

Multiple threads can interleave these operations.

---

## How do you safely update shared mutable state?

Use `Mutex`:

``` kotlin
val mutex = Mutex()
var count = 0

coroutineScope {

    repeat(1000) {

        launch(Dispatchers.Default) {

            mutex.withLock {
                count++
            }
        }
    }
}
```

Or use atomic primitives when appropriate:

``` kotlin
val count = AtomicInteger(0)

count.incrementAndGet()
```

Interview answer:

> Coroutines do not automatically make shared mutable state thread-safe.

---

## Can `Dispatchers.Default` execute multiple coroutines at the same time?

Yes.

`Dispatchers.Default` uses a shared pool of worker threads designed
primarily for CPU-bound work.

``` kotlin
coroutineScope {

    launch(Dispatchers.Default) {
        calculateA()
    }

    launch(Dispatchers.Default) {
        calculateB()
    }
}
```

These coroutines may execute concurrently on different worker threads.

For blocking I/O, prefer:

``` kotlin
Dispatchers.IO
```

---

## Does switching to `Dispatchers.IO` automatically make blocking code safe?

It protects the Main thread, but it does not make the operation
magically non-blocking.

``` kotlin
withContext(Dispatchers.IO) {
    blockingFileOperation()
}
```

The worker thread is still blocked while the operation runs.

The benefit is that you are blocking an I/O worker rather than the Main
thread.

---

## What happens if you use `Dispatchers.Default` for blocking I/O?

``` kotlin
withContext(Dispatchers.Default) {
    blockingNetworkCall()
}
```

It can consume CPU dispatcher threads while they are waiting for
blocking I/O.

That can reduce the availability of threads for CPU work.

Use the dispatcher that matches the operation:

``` text
CPU-heavy work → Default
Blocking I/O    → IO
UI work         → Main
```

---

## What is the hidden trap with `withContext` and cancellation?

Changing dispatcher does not reset cancellation.

``` kotlin
withContext(Dispatchers.IO) {
    doWork()
}
```

The new context normally keeps the existing `Job`.

Therefore:

``` text
Parent Job cancelled
       ↓
withContext(IO)
       ↓
still cancelled
```

`withContext` changes context elements such as dispatcher, but it does
not detach the coroutine from its parent.

---

## What is the difference between `coroutineScope` and `GlobalScope` in Android?

`coroutineScope`:

``` kotlin
coroutineScope {
    launch {
        loadData()
    }
}
```

The child has a clear parent and lifecycle.

`GlobalScope`:

``` kotlin
GlobalScope.launch {
    loadData()
}
```

The coroutine is independent of the current feature lifecycle.

For Android, prefer lifecycle-aware scopes such as:

``` kotlin
viewModelScope.launch {
    loadData()
}
```

or:

``` kotlin
lifecycleScope.launch {
    loadData()
}
```

---

## What is the difference between `viewModelScope` and `lifecycleScope`?

`viewModelScope` is tied to the ViewModel.

``` kotlin
viewModelScope.launch {
    repository.load()
}
```

It is cancelled when the ViewModel is cleared.

`lifecycleScope` is tied to an Android LifecycleOwner.

``` kotlin
lifecycleScope.launch {
    loadData()
}
```

It is cancelled when the LifecycleOwner is destroyed.

Interview answer:

> Choose the scope based on ownership. UI lifecycle work belongs to the
> UI lifecycle; business/state work owned by the ViewModel belongs in
> `viewModelScope`.

---

## What is the difference between `launch`, `async`, and `withContext`?

  -----------------------------------------------------------------------
  API                     Returns                 Main purpose
  ----------------------- ----------------------- -----------------------
  `launch`                `Job`                   Start concurrent work
                                                  without a result

  `async`                 `Deferred<T>`           Start concurrent work
                                                  that produces a result

  `withContext`           `T`                     Switch context and wait
                                                  for result
  -----------------------------------------------------------------------

Example:

``` kotlin
launch {
    saveUser()
}
```

``` kotlin
val user = async {
    loadUser()
}.await()
```

``` kotlin
val user = withContext(Dispatchers.IO) {
    loadUser()
}
```

---

## What is a common hidden question about sequential API calls?

Suppose you have:

``` kotlin
val user = loadUser()
val orders = loadOrders(user.id)
```

This is sequential because the second call depends on the first result.

You cannot make it fully parallel if `orders` needs `user.id`.

But if the calls are independent:

``` kotlin
val user = async {
    loadUser()
}

val settings = async {
    loadSettings()
}

val finalUser = user.await()
val finalSettings = settings.await()
```

They can run concurrently.

Interview answer:

> Parallelism should be based on data dependencies, not simply on using
> `async`.

---

## What happens if two `async` operations have different durations?

``` kotlin
val first = async {
    delay(3000)
    "A"
}

val second = async {
    delay(1000)
    "B"
}

println(first.await())
println(second.await())
```

`second` can finish first.

But the code waits for `first` first because:

``` kotlin
first.await()
```

is called first.

This does not mean `second` stopped. It may already have completed.

Conceptually:

``` text
first  ─────────────── 3 sec
second ─── 1 sec

await(first)
        ↓
waits until 3 sec
        ↓
await(second)
        ↓
already completed
```

---

## Does calling `await()` cancel other `async` operations?

No.

``` kotlin
val first = async { api1() }
val second = async { api2() }

val result = first.await()
```

Calling `first.await()` only waits for the first result.

`second` continues unless the parent scope is cancelled or another
failure causes cancellation.

---

## What happens if one `async` fails and another is still running?

In a normal `coroutineScope`:

``` kotlin
coroutineScope {

    val first = async {
        api1()
    }

    val second = async {
        api2()
    }

    first.await()
    second.await()
}
```

If `api1()` fails:

``` text
api1 fails
   ↓
scope fails
   ↓
api2 cancelled
```

If the operations are independent and should not cancel each other,
consider:

``` kotlin
supervisorScope {
    ...
}
```

---

## What is the hidden trap with `supervisorScope` and `async`?

`supervisorScope` prevents sibling cancellation, but you still need to
handle the failed `Deferred`.

``` kotlin
supervisorScope {

    val first = async {
        throw Exception("Failed")
    }

    val second = async {
        loadData()
    }

    try {
        first.await()
    } catch (e: Exception) {
        handleError(e)
    }

    val result = second.await()
}
```

Supervision does not automatically convert a failed operation into a
successful result.

---

## What happens if a coroutine is cancelled before it starts executing?

``` kotlin
val job = launch {
    println("Hello")
}

job.cancel()
```

Depending on scheduling, the coroutine may be cancelled before its body
gets a chance to execute.

Do not rely on the body always running.

If an operation must happen before cancellation can occur, structure the
operation appropriately rather than assuming `launch` starts
synchronously.

---

## Does calling `launch {}` execute the block immediately?

Not necessarily.

``` kotlin
launch {
    println("Child")
}

println("Parent")
```

The exact output depends on the dispatcher and scheduling.

Do not assume:

``` text
Child
Parent
```

or:

``` text
Parent
Child
```

without knowing the execution context.

A senior answer should say:

> Coroutine scheduling is not the same as normal sequential function
> invocation. The dispatcher determines when the coroutine gets
> execution.

---

## What happens with `launch(start = CoroutineStart.LAZY)`?

A lazy coroutine does not start until it is needed.

``` kotlin
val job = launch(start = CoroutineStart.LAZY) {
    println("Work")
}

println("Created")

job.start()
```

Output:

``` text
Created
Work
```

For `async`:

``` kotlin
val deferred = async(start = CoroutineStart.LAZY) {
    loadData()
}

val result = deferred.await()
```

`await()` starts the lazy coroutine.

---

## What is the difference between `CoroutineStart.DEFAULT` and `LAZY`?

Default:

``` kotlin
launch {
    work()
}
```

The coroutine is scheduled immediately.

Lazy:

``` kotlin
launch(start = CoroutineStart.LAZY) {
    work()
}
```

The coroutine does not start until `start()`, `join()`, or another
operation that starts it.

Interview answer:

> Lazy start is useful when you want to create a coroutine now but
> decide later whether and when to start it.

---

## What is a common `finally` + cancellation interview question?

``` kotlin
val job = launch {

    try {
        delay(5000)
    } finally {
        println("Cleanup")
    }
}

job.cancel()
```

Question:

> Will `Cleanup` execute?

Yes.

Then:

``` kotlin
finally {
    delay(1000)
}
```

Question:

> Will the delay complete normally?

No, because the coroutine is already cancelled.

Use:

``` kotlin
finally {
    withContext(NonCancellable) {
        delay(1000)
    }
}
```

if the cleanup must suspend and complete.

---

## What is the difference between `cancel()` and throwing an exception?

Cancellation:

``` kotlin
job.cancel()
```

means:

> This operation is no longer needed.

Normal exception:

``` kotlin
throw IOException()
```

means:

> The operation failed.

Cancellation should normally not be treated as an application error.

``` kotlin
catch (e: CancellationException) {
    throw e
}
```

---

## Why should you not use `CoroutineExceptionHandler` for normal error handling?

`CoroutineExceptionHandler` is mainly for uncaught exceptions at
coroutine boundaries.

It is not a replacement for normal business error handling.

Prefer:

``` kotlin
viewModelScope.launch {

    try {
        repository.load()
    } catch (e: IOException) {
        updateUiWithError()
    }
}
```

Use `CoroutineExceptionHandler` for last-resort handling/logging of
uncaught exceptions.

---

## What is `CoroutineExceptionHandler` and `async`?

Example:

``` kotlin
val handler = CoroutineExceptionHandler { _, exception ->
    println("Caught: $exception")
}

launch(handler) {
    throw Exception("Failed")
}
```

The handler can observe an uncaught exception from `launch`.

But:

``` kotlin
async(handler) {
    throw Exception("Failed")
}
```

is different because `async` exposes failure through its `Deferred`.

You should normally handle the failure when awaiting:

``` kotlin
try {
    deferred.await()
} catch (e: Exception) {
    handleError(e)
}
```

---

## Kotlin Operators and Language Keywords

### What is the safe-call `?.` operator in Kotlin?

* `?.` safely accesses a property or function when the object can be `null`.
* If the object is `null`, the expression returns `null` instead of throwing an exception.
* Very common when handling API responses and nullable Android data.

```kotlin
val name: String? = null

val length = name?.length

println(length) // null
```

---

### What is the Elvis `?:` operator in Kotlin?

* `?:` provides a default value when the left side is `null`.
* It is useful for setting fallback values.

```kotlin
val name: String? = null

val displayName = name ?: "Guest"

println(displayName) // Guest
```

---

### What is the not-null assertion `!!` operator?

* `!!` tells Kotlin that a nullable value is definitely not `null`.
* If the value is actually `null`, it throws `NullPointerException`.
* Avoid it when possible.

```kotlin
val name: String? = null

val length = name!!.length // NullPointerException
```

---

### What is the `==` operator in Kotlin?

* `==` checks structural equality.
* It internally uses `equals()`.

```kotlin
val user1 = User("Kiran")
val user2 = User("Kiran")

println(user1 == user2)
```

For a `data class`, this returns `true` because the values are equal.

```kotlin
data class User(val name: String)
```

---

### What is the `===` operator in Kotlin?

* `===` checks whether two references point to the exact same object.
* `==` checks values, while `===` checks references.

```kotlin
val a = String(charArrayOf('H', 'i'))
val b = String(charArrayOf('H', 'i'))

println(a == b)   // true
println(a === b)  // false
```

---

### What is the `is` operator in Kotlin?

* `is` checks the type of an object.
* Kotlin automatically smart-casts the object after the check.

```kotlin
fun printValue(value: Any) {
    if (value is String) {
        println(value.length)
    }
}
```

After `value is String`, Kotlin treats `value` as a `String`.

---

### What is the `as` operator in Kotlin?

* `as` performs an explicit type cast.
* If the object cannot be converted to that type, it throws `ClassCastException`.

```kotlin
val value: Any = "Kotlin"

val text = value as String

println(text.length)
```

---

### What is the `as?` safe-cast operator?

* `as?` safely casts an object.
* If the cast fails, it returns `null` instead of throwing an exception.

```kotlin
val value: Any = 10

val text = value as? String

println(text) // null
```

---

### What is the `in` operator?

* `in` checks whether a value exists inside a range or collection.
* `!in` checks that it does not exist.

```kotlin
val number = 5

if (number in 1..10) {
    println("Valid")
}
```

With a collection:

```kotlin
val names = listOf("Kiran", "John")

if ("Kiran" in names) {
    println("Found")
}
```

---

### What is the range `..` operator?

* `..` creates a range including both start and end values.

```kotlin
for (i in 1..5) {
    println(i)
}
```

Output:

```text
1
2
3
4
5
```

---

### What is the `..<` operator?

* `..<` creates a range that excludes the end value.
* It is called the open-ended range operator.

```kotlin
for (i in 1..<5) {
    println(i)
}
```

Output:

```text
1
2
3
4
```

---

### What are `&&` and `||` operators?

* `&&` means logical AND.
* `||` means logical OR.
* They are commonly used in conditions.

```kotlin
if (age >= 18 && isVerified) {
    println("Allowed")
}
```

```kotlin
if (isAdmin || isManager) {
    println("Access granted")
}
```

---

### What is the `!` operator?

* `!` reverses a Boolean value.

```kotlin
val isLoggedIn = false

if (!isLoggedIn) {
    println("Please login")
}
```

---

### What is the `::` operator in Kotlin?

* `::` creates a reference to a function, property, or class.
* It is commonly used with higher-order functions.

```kotlin
fun printName(name: String) {
    println(name)
}

val action = ::printName

action("Kiran")
```

It is also commonly used with Android/Compose callbacks:

```kotlin
Button(onClick = ::onButtonClick)
```
---

### Why are Kotlin classes `final` by default?

* Kotlin makes classes final by default to prevent accidental inheritance.
* It makes the class behavior easier to reason about.
* Use `open` only when inheritance is intentionally supported.

```kotlin
class User
```

This cannot be inherited:

```kotlin
// class Admin : User() // Error
```

---

### What does the `override` keyword mean?

* `override` means a child class is replacing an `open` parent implementation.
* The parent member must be `open`.

```kotlin
open class Parent {
    open fun show() {
        println("Parent")
    }
}

class Child : Parent() {
    override fun show() {
        println("Child")
    }
}
```

---

### What does the `final` keyword mean?

* `final` prevents further overriding.
* Kotlin members are final by default.

```kotlin
open class Parent {

    open fun test() {}
}

class Child : Parent() {

    final override fun test() {}
}

class GrandChild : Child() {

    // Cannot override test()
}
```

---
### What does the `inline` keyword mean in Kotlin?

* `inline` tells the compiler to replace the function call with the function body.
* It is mainly useful for higher-order functions.
* It can reduce lambda/object allocation overhead.

```kotlin
inline fun execute(block: () -> Unit) {
    block()
}

execute {
    println("Hello")
}
```

Conceptually, the compiler can place the lambda code directly at the call site.

---

### Why is `inline` useful with higher-order functions?

Without inline:

```kotlin
fun execute(block: () -> Unit) {
    block()
}
```

The lambda may require an object/function instance.

With inline:

```kotlin
inline fun execute(block: () -> Unit) {
    block()
}
```

The compiler can inline the function and lambda at the call site.

---

### What is `noinline` in Kotlin?

* `noinline` prevents a lambda parameter from being inlined.
* It is useful when you need to store or pass the lambda as an object.

```kotlin
inline fun execute(
    block1: () -> Unit,
    noinline block2: () -> Unit
) {
    block1()

    val savedBlock = block2
    savedBlock()
}
```

Here:

* `block1` is inlined.
* `block2` remains a normal function object.

---

### What is `crossinline` in Kotlin?

* `crossinline` prevents a lambda from using a non-local `return`.
* It is useful when the lambda is executed from another execution context such as a callback.

```kotlin
inline fun execute(crossinline block: () -> Unit) {

    val runnable = Runnable {
        block()
    }

    runnable.run()
}
```

Without `crossinline`, Kotlin cannot safely allow a non-local return because the lambda executes inside another function/callback.

---

### What is a non-local return in Kotlin?

* A lambda passed to an inline function can normally return from the surrounding function.
* This is called a non-local return.

```kotlin
inline fun execute(block: () -> Unit) {
    block()
}

fun test() {

    execute {
        return
    }

    println("This will not execute")
}
```

The `return` returns from `test()`, not just the lambda.

---

### Why does `crossinline` prevent non-local return?

Consider:

```kotlin
inline fun execute(crossinline block: () -> Unit) {

    val runnable = Runnable {
        block()
    }

    runnable.run()
}
```

Now this is not allowed:

```kotlin
execute {
    return
}
```

Because the lambda is executed inside `Runnable`, Kotlin cannot allow the lambda to return from the outer function.

---

### What is `reified` in Kotlin?

* `reified` allows an inline generic function to access the generic type at runtime.
* Normally generic types are erased at runtime.
* `reified` is therefore commonly used for type checks and reflection.

```kotlin
inline fun <reified T> isType(value: Any): Boolean {
    return value is T
}
```

Usage:

```kotlin
println(isType<String>("Kotlin")) // true
println(isType<Int>("Kotlin"))    // false
```

---

### Why must `reified` be used with `inline`?

Normally:

```kotlin
fun <T> check(value: Any): Boolean {
    // value is T // Not allowed
    return false
}
```

The type `T` is erased at runtime.

With `reified`:

```kotlin
inline fun <reified T> check(value: Any): Boolean {
    return value is T
}
```

The compiler knows the actual type at the call site.

---

### What is a practical use case for `reified`?

A common use case is avoiding `Class<T>` parameters.

```kotlin
inline fun <reified T> create(): T {
    return T::class.java.getDeclaredConstructor().newInstance()
}
```

Usage:

```kotlin
val user = create<User>()
```

Instead of:

```kotlin
val user = create(User::class.java)
```

---

### What does `lateinit` mean in Kotlin?

* `lateinit` allows you to initialize a non-null variable later.
* It can only be used with mutable properties.
* It is commonly used with dependency injection and Android view binding.

```kotlin
lateinit var repository: UserRepository
```

Later:

```kotlin
repository = UserRepository()
```

If you access it before initialization, Kotlin throws:

```text
UninitializedPropertyAccessException
```

---

### What is the difference between `lateinit` and `lazy`?

| `lateinit`                                    | `lazy`                              |
| --------------------------------------------- | ----------------------------------- |
| Usually used with `var`                       | Used with `val`                     |
| You initialize it manually                    | Kotlin initializes it automatically |
| No default value                              | Has initialization block            |
| Access before initialization causes exception | Initializes on first access         |

Example:

```kotlin
lateinit var repository: UserRepository

val database by lazy {
    createDatabase()
}
```

---

### What does `lazy` do in Kotlin?

* `lazy` delays initialization until the property is accessed for the first time.
* The value is then cached.

```kotlin
val database by lazy {
    println("Creating database")
    createDatabase()
}
```

The database is not created until:

```kotlin
database
```

is accessed.

---

### What does the `object` keyword mean?

* `object` creates a singleton object.
* Only one instance of the object exists.

```kotlin
object Logger {

    fun log(message: String) {
        println(message)
    }
}
```

Usage:

```kotlin
Logger.log("Hello")
```

You don't need to create an instance:

```kotlin
// Logger() // Not allowed
```

---

### What is a `companion object`?

* A `companion object` provides class-level members.
* It is Kotlin's common alternative to Java's `static`.

```kotlin
class User {

    companion object {

        fun create(): User {
            return User()
        }
    }
}
```

Usage:

```kotlin
val user = User.create()
```

---

### What is the difference between `object` and `companion object`?

`object` creates a standalone singleton:

```kotlin
object Logger
```

`companion object` belongs to a class:

```kotlin
class User {

    companion object {
        fun create() = User()
    }
}
```

---

### What does the `data` keyword mean?

* `data class` is mainly used to hold data.
* Kotlin automatically generates useful functions such as `equals()`, `hashCode()`, `toString()`, and `copy()`.

```kotlin
data class User(
    val id: Int,
    val name: String
)
```

You can do:

```kotlin
val user1 = User(1, "Kiran")
val user2 = user1.copy(name = "John")
```

---

### What is a `sealed class`?

* A sealed class represents a restricted hierarchy.
* The compiler knows all direct subclasses.
* It is very useful for UI state and API results.

```kotlin
sealed class Result {

    data class Success(val data: String) : Result()

    data class Error(val message: String) : Result()

    data object Loading : Result()
}
```

Usage:

```kotlin
when (result) {
    is Result.Success -> println(result.data)
    is Result.Error -> println(result.message)
    Result.Loading -> println("Loading")
}
```

The compiler can check that all states are handled.

---

### What is the difference between `sealed class` and `enum class`?

* `enum` represents a fixed set of constants.
* `sealed` represents a fixed hierarchy of different types/states.

Enum:

```kotlin
enum class Status {
    LOADING,
    SUCCESS,
    ERROR
}
```

Sealed class:

```kotlin
sealed class Result {
    data object Loading : Result()
    data class Success(val data: String) : Result()
    data class Error(val message: String) : Result()
}
```

Use sealed classes when different states need different data.

---

### What does the `abstract` keyword mean?

* `abstract` defines something that must be implemented by a child class.
* An abstract class cannot be instantiated directly.

```kotlin
abstract class Animal {

    abstract fun sound()
}
```

Child class:

```kotlin
class Dog : Animal() {

    override fun sound() {
        println("Bark")
    }
}
```

---

### What is an interface in Kotlin?

* An interface defines a contract that classes can implement.
* A class can implement multiple interfaces.

```kotlin
interface ClickListener {

    fun onClick()
}

class Button : ClickListener {

    override fun onClick() {
        println("Clicked")
    }
}
```

---

### What does the `by` keyword mean in Kotlin?

* `by` is used for delegation.
* It allows another object to handle implementation.

```kotlin
interface Repository {
    fun getData()
}

class RepositoryImpl : Repository {
    override fun getData() {
        println("Data")
    }
}

class ViewModel(
    private val repository: Repository
) : Repository by repository
```

Now `ViewModel` automatically delegates `getData()` to `repository`.

---

### What is property delegation using `by lazy`?

```kotlin
val database by lazy {
    createDatabase()
}
```

Here, `lazy` controls how the property is initialized.

The `by` keyword connects the property to the delegate.

---

### What does the `operator` keyword mean?

* `operator` allows a class to define custom behavior for operators such as `+`, `-`, `[]`, and `==`.

```kotlin
data class Point(
    val x: Int,
    val y: Int
) {
    operator fun plus(other: Point): Point {
        return Point(
            x + other.x,
            y + other.y
        )
    }
}
```

Now:

```kotlin
val p1 = Point(10, 20)
val p2 = Point(5, 5)

val result = p1 + p2
```

The `+` operator internally calls `plus()`.

---

### What does the `infix` keyword mean?

* `infix` allows a function to be called without parentheses and dot notation.
* It makes certain APIs more readable.

```kotlin
infix fun Int.add(value: Int): Int {
    return this + value
}
```

Usage:

```kotlin
val result = 10 add 5
```

Instead of:

```kotlin
val result = 10.add(5)
```
---

### What does the `const` keyword mean?

* `const` defines a compile-time constant.
* It can be used only with primitive types and `String`.
* It must be a top-level property or inside an `object`/`companion object`.

```kotlin
const val BASE_URL = "https://example.com"
```

Another example:

```kotlin
object Constants {
    const val TIMEOUT = 30
}
```

---

### What is the difference between `const val` and normal `val`?

```kotlin
const val API_VERSION = "v1"

val currentTime = System.currentTimeMillis()
```

`const val` is known at compile time.

`val` is read-only after initialization but its value can be determined at runtime.

---

### What does `typealias` mean?

* `typealias` gives another name to an existing type.
* It does not create a new type.

```kotlin
typealias UserId = String

val id: UserId = "123"
```

It is especially useful for complex function types:

```kotlin
typealias OnUserClick = (User) -> Unit
```

Now:

```kotlin
fun setListener(listener: OnUserClick) {
}
```

is easier to read.

---

### What does the `tailrec` keyword mean?

* `tailrec` tells the compiler that a recursive function can be optimized into a loop.
* It helps avoid stack overflow for supported tail-recursive functions.

```kotlin
tailrec fun countDown(value: Int) {

    if (value == 0) return

    println(value)

    countDown(value - 1)
}
```

The compiler can optimize the recursion instead of creating a new stack frame for every call.

---

### What are custom `get` and `set` accessors?

* `get` controls how a property is read.
* `set` controls how a property is changed.

```kotlin
var name: String = ""
    get() = field.uppercase()
    set(value) {
        field = value.trim()
    }
```

Usage:

```kotlin
name = " Kiran "

println(name) // KIRAN
```

---

### What does `this` mean in Kotlin?

* `this` refers to the current object.

```kotlin
class User(
    private val name: String
) {

    fun printName() {
        println(this.name)
    }
}
```

---

### What does `super` mean in Kotlin?

* `super` refers to the parent class implementation.

```kotlin
open class Parent {
    open fun show() {
        println("Parent")
    }
}

class Child : Parent() {

    override fun show() {
        super.show()
        println("Child")
    }
}
```

Output:

```text
Parent
Child
```

---

### What is the `when` expression in Kotlin?

* `when` is Kotlin's powerful replacement for many `if-else` and `switch` statements.
* It can return a value.

```kotlin
val result = when (status) {
    "SUCCESS" -> "Done"
    "ERROR" -> "Failed"
    else -> "Loading"
}
```

It is especially useful with sealed classes:

```kotlin
when (result) {
    is Result.Success -> showData(result.data)
    is Result.Error -> showError(result.message)
    Result.Loading -> showLoading()
}
```

---

### What does `return` do?

* `return` exits a function and optionally returns a value.

```kotlin
fun getName(): String {
    return "Kiran"
}
```

---

### What does `break` do?

* `break` stops the current loop.

```kotlin
for (i in 1..10) {
    if (i == 5) break
    println(i)
}
```

Output:

```text
1
2
3
4
```

---

### What does `continue` do?

* `continue` skips the current iteration and moves to the next one.

```kotlin
for (i in 1..5) {
    if (i == 3) continue
    println(i)
}
```

Output:

```text
1
2
4
5
```

---

## What does the `open` keyword mean in Kotlin and why is it the default opposite of Java?

* Kotlin classes and members are `final` by default.
* `open` explicitly allows inheritance or overriding.
* This makes inheritance intentional instead of accidental.
* Java classes and methods are inheritable by default unless marked `final`.

```kotlin
open class Animal {

    open fun sound() {
        println("Animal sound")
    }
}

class Dog : Animal() {

    override fun sound() {
        println("Bark")
    }
}
```

Without `open`:

```kotlin
class Animal
```

This cannot be inherited.

**Android interview point:** Some mocking frameworks or Android frameworks may require classes to be open. Plugins such as Kotlin's all-open plugin can also make selected classes open automatically.

---

## What is a Kotlin `value class` and when do you use it on Android?

* A `value class` creates a distinct type around one value.
* It gives compile-time type safety without necessarily creating a separate object at runtime.
* It is useful when two values have the same underlying type but different meanings.

```kotlin
@JvmInline
value class UserId(val value: String)

@JvmInline
value class OrderId(val value: String)
```

Now this is type-safe:

```kotlin
fun loadUser(id: UserId) {
    // ...
}

val userId = UserId("123")

loadUser(userId)
```

You cannot accidentally pass:

```kotlin
val orderId = OrderId("123")

// loadUser(orderId) // Compilation error
```

Instead of:

```kotlin
fun loadUser(id: String)
fun loadOrder(id: String)
```

you get:

```kotlin
fun loadUser(id: UserId)
fun loadOrder(id: OrderId)
```

**Important:** Value classes are not guaranteed to be allocation-free in every situation. They can be boxed when used with generics, nullable types, arrays, reflection, or certain APIs.

---

## Coroutine Cancellation, Context, and Concurrency

## What is a `CoroutineScope` and how should Android apps structure scopes?

* `CoroutineScope` defines the lifetime of coroutines.
* It contains a `CoroutineContext`, including a `Job` and usually a dispatcher.
* When the scope is cancelled, its child coroutines are cancelled.

Common Android scopes:

```kotlin
viewModelScope.launch {
    repository.loadData()
}
```

`viewModelScope` is appropriate for work that should live as long as the ViewModel.

For UI lifecycle work:

```kotlin
lifecycleScope.launch {
    // UI-related coroutine
}
```

For reusable components, prefer an explicitly owned scope rather than creating a global scope.

Avoid:

```kotlin
GlobalScope.launch {
    repository.loadData()
}
```

because the work can outlive the screen or feature that started it.

**Interview point:** Scope answers **"How long should this coroutine live?"**

---

## What is `Flow` and how does it relate to coroutines?

* `Flow` represents an asynchronous stream of values.
* It is built around coroutines and suspension.
* A `Flow` is normally cold, meaning its code starts executing when collected.

```kotlin
fun observeUsers(): Flow<List<User>> {
    return repository.users
}
```

Collect it:

```kotlin
viewModelScope.launch {
    repository.observeUsers().collect { users ->
        // Update UI
    }
}
```

For Android UI, use lifecycle-aware collection:

```kotlin
lifecycleScope.launch {
    repeatOnLifecycle(Lifecycle.State.STARTED) {
        viewModel.users.collect { users ->
            // Update UI
        }
    }
}
```

**Interview point:** Coroutines provide the asynchronous execution model; `Flow` provides a stream of asynchronous values.

---

## What is the difference between `CoroutineContext` and `CoroutineScope`?

### `CoroutineContext`

* A collection of elements that describes how a coroutine executes.
* It can contain:

  * `Job`
  * `CoroutineDispatcher`
  * `CoroutineName`
  * `CoroutineExceptionHandler`

Example:

```kotlin
val context =
    Dispatchers.IO + CoroutineName("NetworkRequest")
```

### `CoroutineScope`

* Owns the coroutine lifecycle.
* It uses a `CoroutineContext` to launch coroutines.

```kotlin
val scope = CoroutineScope(
    SupervisorJob() + Dispatchers.IO
)

scope.launch {
    // Work
}
```

Simple way to remember:

> **Context = configuration**
> **Scope = ownership/lifecycle**

---

## What does `withContext()` do?

* `withContext()` changes the coroutine context for a specific block.
* It is commonly used to switch dispatchers.
* It suspends the current coroutine until the block finishes.

```kotlin
suspend fun loadUser(): User {

    return withContext(Dispatchers.IO) {
        api.getUser()
    }
}
```

After the block completes, execution resumes in the original context.

For example:

```kotlin
viewModelScope.launch { // Main

    val user = withContext(Dispatchers.IO) {
        repository.loadUser()
    }

    // Back on Main
    updateUi(user)
}
```

---

## What is a `suspend` function?

* A `suspend` function can suspend execution without blocking the underlying thread.
* It can be called from another `suspend` function or coroutine.
* `suspend` does **not** automatically mean background execution.

```kotlin
suspend fun fetchUser(): User {
    return api.getUser()
}
```

This does not automatically move the call to `Dispatchers.IO`.

For blocking work:

```kotlin
suspend fun readFile(): String {
    return withContext(Dispatchers.IO) {
        file.readText()
    }
}
```

**Important interview point:**

> `suspend` means the function can suspend. It does not mean the function runs on a background thread.

---

## What is `runBlocking` and why is it disliked in Android app code?

* `runBlocking` blocks the current thread until the coroutine finishes.
* It is useful for bridging regular blocking code and coroutine code.
* It should generally not be used on Android's Main thread.

```kotlin
runBlocking {
    val result = fetchUser()
}
```

The calling thread is blocked.

Bad Android example:

```kotlin
fun onCreate() {

    runBlocking {
        api.getUser()
    }
}
```

This can block the Main thread and potentially cause an ANR.

For coroutine tests, prefer:

```kotlin
@Test
fun `loads user`() = runTest {
    val result = repository.loadUser()
}
```

**Interview point:**

> `runBlocking` blocks a thread; `runTest` provides coroutine-aware testing with virtual time.

---

## How do you handle cancellation and structured concurrency in a multi-layer app?

* Cancellation should flow from the owner of the work down through the layers.
* Avoid launching independent coroutines that outlive their owner.
* Use structured concurrency so child coroutines belong to a parent.

Example:

```kotlin
viewModelScope.launch {

    repository.loadUser()
}
```

When the ViewModel is cleared:

```text
ViewModel cancelled
       ↓
Coroutine cancelled
       ↓
Repository operation cancelled
       ↓
Network operation can be cancelled
```

For parallel work:

```kotlin
viewModelScope.launch {

    coroutineScope {
        val user = async {
            repository.getUser()
        }

        val orders = async {
            repository.getOrders()
        }

        showData(user.await(), orders.await())
    }
}
```

Both `async` operations belong to the parent coroutine.

Use `NonCancellable` only when an operation genuinely must finish:

```kotlin
withContext(NonCancellable) {
    saveCriticalData()
}
```

Do not use it simply to ignore normal cancellation.

---

## How does a coroutine switch threads from Main to IO and back?

* A coroutine does not physically move its existing thread.
* At a suspension point, Kotlin saves the coroutine's state.
* The dispatcher decides where the continuation should resume.

Example:

```kotlin
viewModelScope.launch { // Main

    val user = withContext(Dispatchers.IO) {
        api.getUser()
    }

    // Main again
    updateUi(user)
}
```

Conceptually:

```text
Main thread
    ↓
withContext(IO)
    ↓
IO thread
    ↓
suspension/completion
    ↓
Main thread
    ↓
updateUi()
```

`Dispatchers.IO` chooses an appropriate thread from its pool.

**Important:**

```kotlin
suspend fun load() {
    api.getUser()
}
```

does not automatically mean IO.

A suspend function can still execute on Main if called from Main.

---

## Why are coroutines lightweight compared to OS threads?

* A thread has its own stack and operating-system resources.
* A coroutine is a lightweight task managed by Kotlin's coroutine machinery.
* When a coroutine suspends, its thread can execute other work.

For example:

```kotlin
repeat(5000) {

    launch {
        delay(1000)
    }
}
```

Thousands of coroutines can wait without requiring thousands of threads.

Conceptually:

```text
Many coroutines
       ↓
Suspend while waiting
       ↓
Small number of threads
       ↓
Threads perform other work
```

A coroutine is not free, though.

Thousands of coroutines can still consume memory and CPU.

Also, blocking code defeats much of the benefit:

```kotlin
launch {
    Thread.sleep(5000)
}
```

This blocks a thread instead of suspending the coroutine.

Prefer:

```kotlin
launch {
    delay(5000)
}
```

---

## What is the difference between `coroutineScope` and `supervisorScope`?

* `coroutineScope` propagates child failure to the parent and can cancel sibling work.
* `supervisorScope` allows children to fail independently.

Example:

```kotlin
coroutineScope {

    launch {
        throw Exception("Failed")
    }

    launch {
        loadOrders()
    }
}
```

If the first child fails, the scope fails and the sibling is cancelled.

With:

```kotlin
supervisorScope {

    launch {
        throw Exception("Failed")
    }

    launch {
        loadOrders()
    }
}
```

the second child can continue.

**Interview point:**

> Use `coroutineScope` when child tasks are dependent on each other. Use `supervisorScope` when they should fail independently.

---

## What is the difference between structured concurrency and `ConcurrentHashMap`?

These solve completely different problems.

### Structured concurrency

Controls:

* Coroutine lifetime
* Cancellation
* Parent-child relationships
* Failure propagation

```kotlin
viewModelScope.launch {
    repository.loadData()
}
```

### `ConcurrentHashMap`

Controls:

* Concurrent access to a shared map
* Thread-safe reads and updates

```kotlin
val cache = ConcurrentHashMap<String, User>()

cache["123"] = user
```

Think of it as:

```text
Structured concurrency
→ "Who owns this work?"

ConcurrentHashMap
→ "How can multiple threads safely access this map?"
```

They are not alternatives.

---

## Does `ConcurrentHashMap` make all operations thread-safe?

* Individual map operations are thread-safe.
* A sequence of operations can still have a race condition.

For example:

```kotlin
if (!cache.containsKey(id)) {
    cache[id] = user
}
```

Another thread can modify the map between `containsKey()` and `put()`.

Prefer atomic operations when appropriate:

```kotlin
cache.putIfAbsent(id, user)
```

**Interview point:** Thread-safe collection does not automatically make a multi-step business operation atomic.

---

## When should you use `Mutex` instead of `ConcurrentHashMap`?

* Use `Mutex` when multiple operations must be treated as one atomic coroutine operation.
* Use `ConcurrentHashMap` when you need concurrent map access.

Example:

```kotlin
private val mutex = Mutex()

suspend fun updateBalance() {
    mutex.withLock {
        balance -= 100
        balance += 50
    }
}
```

The entire critical section is protected.

For a simple cache:

```kotlin
private val cache = ConcurrentHashMap<String, User>()
```

---