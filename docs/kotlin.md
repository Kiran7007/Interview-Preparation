# Kotlin Fundamentals

## What are the main features of Kotlin?
- **Concise:** Less boilerplate than Java
- **Null Safety:** Built-in null checks
- **Extension Functions:** Add functions to existing classes
- **Coroutines:** Lightweight concurrency
- **Smart Casts:** No need for explicit casting after type check
- **Data Classes:** Auto-generate `equals()`, `hashCode()`, `toString()`, etc.
- **Default & Named Arguments**
- **Higher-order functions & Lambdas**

---

## Why Kotlin over Java for Android?

- Kotlin provides null safety, concise syntax, extension functions, sealed
  classes, data classes, coroutines, and strong functional-programming
  support.
- It reduces boilerplate and makes asynchronous and state-driven Android
  development easier.

```kotlin
val name: String? = user?.name
```

## What is the difference between `==` and `===` in Kotlin?

- `==` checks structural equality using `equals()`.
- `===` checks whether two references point to the same object.

```kotlin
val a = String("Hello".toCharArray())
val b = String("Hello".toCharArray())

println(a == b)   // true
println(a === b)  // false
```

- Use `==` when comparing values.

---

## What is the difference between val, var, and const in Kotlin?
- `var` declares a mutable reference that can be reassigned.
- `val` declares a read-only reference that can be assigned once.
- `const val` is a compile-time constant for supported primitive or `String` values.
- `const val` must be top-level or declared inside an `object` or companion object.
- `val` does not make the referenced object immutable.

```kotlin
val name = "Kiran" // Cannot be changed later
var age = 30 // Can be updated
age = 31
```

---

## What are null safety features in Kotlin?
- Kotlin makes types non-nullable by default, but nullable values can still come from Java, platform APIs, or unsafe assertions.

#### Types
- **Non-nullable:** `var name: String = "Kiran"` → cannot hold null
- **Nullable:** `var name: String? = null` → can hold null

#### Safe operations
- **Safe call `?.`:** Skips execution if the object is null.
- **Elvis `?:`:** Provide default value if null.
- **Not-null Assertion `!!`:** Throws Null Pointer Exception if value is null.
- **Safe Cast `as?`:** Returns null instead of throwing ClassCastException.

---

## What is a data class in Kotlin?
- A data class is designed to hold data.
- The compiler generates `toString()`, `equals()`, `hashCode()`, `copy()`, and `componentN()` functions from primary-constructor properties.
- Only properties declared in the primary constructor participate in those generated functions.

```kotlin
data class User(val name: String, val age: Int)
```

---

## Why should data classes be immutable?
- Immutable data classes help keep state predictable in unidirectional data flow.
- Benefits include:

- Predictable UI state.
- Easier debugging.
- Thread-safe.
- Prevent accidental mutations.
- Compose can skip recomposition more effectively.
- Works naturally with `copy()` to create new state objects.
- Encourages functional programming patterns.

---

## Why are `equals()` and `hashCode()` important?
- Data classes automatically generate `equals()` and `hashCode()`.
- They support content equality, hash collections, state-change detection, and comparisons of copied objects.

- Content equality instead of reference equality.
- Collections like `HashMap`, `HashSet`.
- Detecting whether state actually changed.
- Comparing objects created using `copy()`.

```kotlin
data class User(val name: String, val age: Int)

val user1 = User("Monika", 30)
val user2 = user1.copy()
user1 == user2      // true
user1 === user2     // false
```

---

## What are Primary and Secondary Constructors in Kotlin?

| Primary Constructor  | Secondary Constructor                                                    |
| --- | --- |
| The main constructor of a class.                           | Optional additional constructors for different ways to create an object. |
| Defined in the class header.                               | Defined inside the class body using the `constructor` keyword.           |
| Can directly initialize properties.                        | Used for alternative initialization scenarios.                           |
| Pass data directly when creating an object.                | Can provide different ways to create an object.                          |
| There can be only one primary constructor.                 | You can have multiple secondary constructors.                            |
| Can include an `init` block for additional initialization. | Must delegate to the primary constructor using `: this(...)`.            |
| Best suited for the main required parameters.              | Useful for alternative initialization.                                   |

---

## What is an inline function?

- Compiler can substitute the function body at the call site.
- Useful for higher-order functions to reduce lambda allocation/call overhead.
- Can enable `reified` type parameters.
- Excessive use can increase generated code size.

## Why many Kotlin stdlib functions are inline?

- Many standard-library functions use lambdas heavily.
- Inlining can reduce lambda-object creation and call overhead at the call site.
- This is useful for `let`, `apply`, `run`, and `forEach`, but excessive inlining
  can increase generated code size.

```kotlin
listOf(1, 2, 3).forEach { value ->
    println(value)
}
```

---

## What are `noinline` and `crossinline`?

- `noinline`: prevents a function parameter from being inlined.
- `crossinline`: prevents non-local returns from an inlined lambda.

---

## What is a reified generic?

- Normally generic type information is erased at runtime.
- `reified` preserves access to the type inside an inline function.

```kotlin
inline fun <reified T> Gson.fromJson(json: String): T {
    return fromJson(json, T::class.java)
}
```

## Why inline required?

Generic type information is normally erased at runtime. `reified` works only with an inline function because the compiler can insert the actual type information at each call site.

```kotlin
inline fun <reified T> parse(json: String): T {
    return Gson().fromJson(json, T::class.java)
}
```

---

## Why Java cannot do this cleanly?

Java generics are erased at runtime, and Java does not provide Kotlin's inline mechanism for inserting the concrete generic type at the call site. Kotlin combines `inline` and `reified` to make this pattern concise.

```kotlin
inline fun <reified T> parse(json: String): T =
    Gson().fromJson(json, T::class.java)
```

---

## What is delegation?
- Delegates implementation to another object.
- `by lazy` is also property delegation.

```kotlin
class Repository(
    private val dataSource: DataSource
) : DataSource by dataSource
```

## `lazy` vs `lateinit`

- `lazy`: initializes on first access and supports immutable `val`.

```kotlin
val repository by lazy {
    UserRepository()
}
```

- `lateinit`: deferred initialization of a mutable non-null property, mainly reference types. Accessing an uninitialized `lateinit` property throws an exception.

---

## Sealed class vs sealed interface

| Feature | Sealed Class | Sealed Interface |
|---|---|---|
| **Purpose** | Models a restricted class hierarchy | Models a restricted interface hierarchy |
| **Inheritance** | A class can extend only one class | A class can implement multiple interfaces |
| **State / Constructor** | Can have constructors and maintain state | Interfaces generally don't hold instance state or constructors |
| **Multiple inheritance** | ❌ Cannot extend multiple classes | ✅ Can implement multiple interfaces |
| **Use case** | Best when subtypes share common state or implementation | Best for modeling states, capabilities, or orthogonal hierarchies |
| **Example** | `sealed class Result` | `sealed interface UiState` |

---

## Can sealed interface have enum implementations?

- Yes. An enum can implement a sealed interface, so each enum constant becomes
  one of the permitted implementations.

```kotlin
sealed interface ConnectionState

enum class Status : ConnectionState {
    CONNECTED,
    DISCONNECTED
}
```

---

## Can enum extend sealed class?

- No. An enum class already extends `Enum`, and Kotlin classes can extend only
  one class. Use a sealed interface when enum implementations are required.

```kotlin
sealed interface PaymentState

enum class PaymentStatus : PaymentState {
    SUCCESS,
    FAILED
}
```

---

## Why Google prefers sealed interface in modern Android?
- A sealed interface models UI states or capabilities while keeping
  implementations flexible.
- A state class can implement it without giving up its single class
  inheritance, which is useful for modern Android state models.

```kotlin
sealed interface UiState

data object Loading : UiState
data class Success(val value: String) : UiState
data class Error(val message: String) : UiState
```

---

## What is variance or Explain `out`, `in`, and `*`?

### `out` → Producer → Read

- Use `out` when a class produces or returns `T`.

```kotlin
interface Producer<out T> {
    fun get(): T
}
```

- Example:

```kotlin
Producer<Dog> → Producer<Animal> // ✅
```

- Remember: `out` = **read / output / producer**.

---

### `in` → Consumer → Write

- Use `in` when a class consumes or accepts `T`.

```kotlin
interface Consumer<in T> {
    fun consume(value: T)
}
```

- Example:

```kotlin
Consumer<Animal> → Consumer<Dog> // ✅
```

- Remember: `in` = **write / input / consumer**.

---

### `*` → Unknown Type

- Use `*` when you do not know or do not care about the exact generic type.

```kotlin
fun printList(list: List<*>) {
    list.forEach { println(it) }
}
```

- The list could be:

```kotlin
List<String>
List<Int>
List<Dog>
```

- You only know that the elements can safely be treated as `Any?`.

- Remember: `*` = **unknown type**.

---

## Why is `List<String>` assignable to `List<Any>`?
- Kotlin's `List` is read-only and covariant: `List<out T>`.

---

## Scope functions

| Function | Receiver | Returns | Typical use |
|---|---|---|---|
| `let` | `it` | lambda result | null transformation |
| `run` | `this` | lambda result | configure + compute |
| `with` | `this` | lambda result | group operations |
| `apply` | `this` | receiver | object configuration |
| `also` | `it` | receiver | side effect |

- Avoid chaining scope functions excessively because nested receivers and return values become hard to follow.

---

## What is the difference between `List`, `MutableList`, `Set`, and `Map` in Kotlin?

- `List` is ordered and read-only through its interface.
- `MutableList` allows adding, removing, and replacing items.
- `Set` stores unique items according to equality rules.
- `Map` stores key-value pairs and is not a subtype of `Collection`.

```kotlin
val names: List<String> = listOf("Kiran", "Asha")
val mutableNames = mutableListOf("Kiran")
mutableNames.add("Asha")

val uniqueTags = setOf("android", "kotlin")
val userMap = mapOf("id" to 1, "name" to "Kiran")
```

- Choose the collection based on the behavior you need: ordered access,
  uniqueness, or key-value lookups.

---

## What is destructuring in Kotlin and where is it unsafe?

- Destructuring unpacks values into variables using generated or declared `componentN()` functions.
- It is commonly used with data classes and pairs.
- It becomes unsafe when the component order is misunderstood or changed.

```kotlin
data class Employee(
    val name: String,
    val age: Int
)

val employee = Employee("Kiran", 30)

val (name, age) = employee
```

- The compiler effectively uses:

```kotlin
employee.component1()
employee.component2()
```

```kotlin
data class Employee(
    val name: String,
    val age: Int
)

val (age, name) = employee // Compiles, but meaning is wrong
```

---

## What does the `open` keyword mean in Kotlin?

- Kotlin classes and methods are final by default.
- `open` allows inheritance or overriding.
- This differs from Java, where classes are inheritable by default.

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

- Kotlin makes classes final by default to reduce accidental inheritance.

---

## What is an extension function?

- An extension function adds a function to an existing type without modifying that type.
- It is resolved statically; it does not override a member function polymorphically.

```kotlin
fun String.isValidAccountId(): Boolean {
    return length == 10 && all { it.isDigit() }
}

val valid = "1234567890".isValidAccountId()
```

- It is useful for small, reusable transformations.

---

## What is smart casting in Kotlin?

- Kotlin analyzes null checks and type checks to cast safely.
- After a check, the compiler can treat the value as a non-null type.
- This reduces boilerplate and keeps code safer.

```kotlin
fun printLength(value: Any?) {
    if (value is String) {
        println(value.length)
    }
}
```

- The compiler knows `value` is a `String` inside the `if` block.
- It is especially helpful when handling `Any?` from UI or network layers.

---

## What is a higher-order function?

- A higher-order function takes another function as a parameter or returns a function.
- Collection APIs such as `map`, `filter`, and `fold` heavily use higher-order functions.

```kotlin
fun execute(block: () -> Unit) {
    block()
}

execute {
    println("Done")
}
```

---

## What is a companion object?

- A companion object provides class-level members associated with a class.
- Kotlin does not have Java-style static members.
- A companion object can implement interfaces and expose factory methods.

```kotlin
class User private constructor() {
    companion object {
        fun create(): User = User()
    }
}
```

---

## What is `debounce`?

- `debounce` waits for a quiet period before emitting.
- It is useful for search input because it reduces work while the user is typing.

```kotlin
query
    .debounce(300)
```

- If the user types continuously, intermediate values are skipped.

---

## What is `distinctUntilChanged`?

- `distinctUntilChanged` prevents consecutive duplicate values.

```kotlin
query
    .distinctUntilChanged()
```

- Typing the same query twice does not trigger another identical downstream
  operation.

---

## What is `stateIn`?

- `stateIn` converts a Flow into `StateFlow`.
- It gives the stream a current value and shares collection according to the chosen `SharingStarted` policy.

```kotlin
val state = repository.users()
    .stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = emptyList()
    )
```

- It is useful when UI needs current state.

---

## What is `shareIn`?

- `shareIn` converts a cold Flow into `SharedFlow`.
- It shares one upstream execution among collectors according to the chosen start policy.

```kotlin
val events = repository.events()
    .shareIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5_000),
        replay = 0
    )
```

---

## What is operator overloading in Kotlin?

- Kotlin maps operators such as `+`, `-`, `[]`, and `invoke` to specially named functions.
- The corresponding function must be marked with `operator`.

```kotlin
data class Money(val amount: Int)

operator fun Money.plus(other: Money): Money {
    return Money(amount + other.amount)
}

val total = Money(100) + Money(50)
```

- Use operator overloading only when the meaning is obvious.

## Should operator overloading be overused?

- No. It can reduce readability when the operator does not have an obvious meaning.
- Use it for mathematical models, DSLs, or other intuitive operations.

```kotlin
data class Money(val amount: Int)

operator fun Money.plus(other: Money): Money =
    Money(amount + other.amount)
```

---

## What is a DSL in Kotlin?

- A DSL creates an API that reads like a small domain-specific language.
- Kotlin supports DSLs using lambdas with receivers, builders, and extension functions.

```kotlin
buildUser {
    name = "Kiran"
    age = 30
}
```

- DSLs are useful for readable configuration and builders.

---

## What is Kotlin Multiplatform?

- Kotlin Multiplatform allows sharing Kotlin code across platforms.
- Business logic, networking, data models, and other platform-neutral code can be shared.
- Platform-specific UI or APIs can remain native.

``` text
shared
 ├── domain
 ├── data
 └── common logic

Android → Android UI
iOS     → iOS UI
```

- Use it when code sharing provides enough value to justify the added complexity.

---

## Why Kotlin ideal for DSL?

- Kotlin supports DSLs through extension functions, trailing lambdas, lambdas with receivers, and operator overloading.
- These features make configuration and builder APIs readable while keeping them type-safe.

```kotlin
class UserBuilder {
    var name: String = ""
    var age: Int = 0
}

fun buildUser(block: UserBuilder.() -> Unit): UserBuilder =
    UserBuilder().apply(block)
```

---

## What should NOT be shared in KMP?

- Avoid sharing Android UI, platform-specific APIs, and lifecycle code unless an interop boundary is intentional.
- Share domain logic, repositories, networking, validation, and caching when the benefit justifies the build and interoperability complexity.

---

## What are Kotlin context parameters?

- Context parameters declare dependencies that are available implicitly in a surrounding context.
- They can reduce repeated parameter passing in scoped APIs and DSLs.
- They replace the older experimental context-receiver design.
- The feature is still experimental; do not use it as a default replacement for normal dependency injection.
- Multiple matching context values can cause an ambiguity error.

```kotlin
interface Logger {
    fun log(message: String)
}

context(logger: Logger)
fun saveUser() {
    logger.log("User saved")
}

// context(ConsoleLogger()) { saveUser() }
```

---

## What does `ensureActive()` do?

- `ensureActive()` checks whether the coroutine has been cancelled.
- If the coroutine is active, execution continues.
- If it is cancelled, `ensureActive()` throws `CancellationException`.
- It is useful inside CPU-heavy loops that do not naturally suspend.

```kotlin
val job = launch {

    for (i in 1..1_000_000) {

        ensureActive()

        heavyCalculation(i)
    }
}

job.cancel()
```

- After `job.cancel()`:

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

- Important:

```kotlin
for (i in 1..1_000_000) {
    heavyCalculation(i)
}
```

- If `heavyCalculation()` never suspends and there is no cancellation check,
  cancellation may not stop the loop immediately.

---

## What is the difference between `ensureActive()` and `isActive`?

- Both can be used to react to cancellation.
- `ensureActive()` throws `CancellationException`.
- `isActive` only returns a Boolean.
- `ensureActive()` is useful when you want normal coroutine cancellation to
  propagate automatically.

```kotlin
ensureActive()
```

- `ensureActive()` is similar to:

```kotlin
if (!isActive) {
    throw CancellationException()
}
```

- With `isActive`:

```kotlin
while (isActive) {
    doWork()
}
```

- With `ensureActive()`:

```kotlin
while (true) {
    ensureActive()
    doWork()
}
```

---

## What is the difference between `cancel()` and `cancelAndJoin()`?

- Instead of:

```kotlin
job.cancel()
job.join()
```

- You can use:

```kotlin
job.cancelAndJoin()
```

- It performs both operations.

``` text
cancelAndJoin()
      ↓
request cancellation
      ↓
wait for completion
```

- This is useful in tests and lifecycle-sensitive code.

---

## What happens when you call `join()` without cancelling?

```kotlin
val job = launch {
    delay(1000)
    println("Done")
}

job.join()

println("Finished waiting")
```

- Output:

``` text
Done
Finished waiting
```

- `join()` does not cancel anything.

- It simply waits for the job to complete.

---

## What is a common race condition with shared mutable state?

```kotlin
var count = 0

coroutineScope {

    repeat(1000) {

        launch(Dispatchers.Default) {
            count++
        }
    }
}
```

- The final value is not guaranteed to be 1000.

- Why?

- `count++` is not one atomic operation.

- Conceptually:

``` text
read count
   ↓
add 1
   ↓
write count
```

- Multiple threads can interleave these operations.

---

## How do you safely update shared mutable state?

- Use `Mutex` when multiple reads and writes must be one atomic coroutine operation.
- Use an atomic primitive for a simple single-value update.
- Use `ConcurrentHashMap` for concurrent map access, but remember that a sequence of map operations is not automatically atomic.

```kotlin
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

- Or use atomic primitives when appropriate:

```kotlin
val count = AtomicInteger(0)

count.incrementAndGet()
```

- For a simple concurrent cache:

```kotlin
private val cache = ConcurrentHashMap<String, User>()
```

---

## When should you use `Mutex` instead of `ConcurrentHashMap`?

- Use `Mutex` when several reads and writes must protect one shared invariant.
- Use `ConcurrentHashMap` when the shared state is naturally a key-value map.
- `ConcurrentHashMap` makes individual map operations thread-safe, not an entire multi-step workflow.
- A `Mutex` suspends waiting coroutines instead of blocking a thread while they wait for the lock.

---

## What is a common hidden question about sequential API calls?

- If the second call needs the first result, the calls are sequential.
- You cannot make them fully parallel when `loadOrders` needs `user.id`.
- Independent calls can run concurrently with separate `async` blocks.

```kotlin
val user = loadUser()
val orders = loadOrders(user.id)
```

- Independent-call example:

```kotlin
val user = async {
    loadUser()
}

val settings = async {
    loadSettings()
}

val finalUser = user.await()
val finalSettings = settings.await()
```

- The independent calls can run concurrently, and `await()` collects their results.

---

## What is the difference between `cancel()` and throwing an exception?

- Cancellation:

```kotlin
job.cancel()
```

- means:

- Normal exception:

```kotlin
throw IOException()
```

- means:

- Cancellation should normally not be treated as an application error.

```kotlin
catch (e: CancellationException) {
    throw e
}
```

---

## What is the `is` operator in Kotlin?

- `is` checks the type of an object.
- Kotlin automatically smart-casts the object after the check.

```kotlin
fun printValue(value: Any) {
    if (value is String) {
        println(value.length)
    }
}
```

- After `value is String`, Kotlin treats `value` as a `String`.

---

## What is the `as` operator in Kotlin?

- `as` performs an explicit type cast.
- If the object cannot be converted to that type, it throws `ClassCastException`.

```kotlin
val value: Any = "Kotlin"

val text = value as String

println(text.length)
```

---

## What is the `as?` safe-cast operator?

- `as?` safely casts an object.
- If the cast fails, it returns `null` instead of throwing an exception.

```kotlin
val value: Any = 10

val text = value as? String

println(text) // null
```

---

## What is the `in` operator?

- `in` checks whether a value exists inside a range or collection.
- `!in` checks that it does not exist.

```kotlin
val number = 5

if (number in 1..10) {
    println("Valid")
}
```

- With a collection:

```kotlin
val names = listOf("Kiran", "John")

if ("Kiran" in names) {
    println("Found")
}
```

---

## What is the range `..` operator?

- `..` creates a range including both start and end values.

```kotlin
for (i in 1..5) {
    println(i)
}
```

- Output:

```text
1
2
3
4
5
```

---

## What is the `..<` operator?

- `..<` creates a range that excludes the end value.
- It is called the open-ended range operator.

```kotlin
for (i in 1..<5) {
    println(i)
}
```

- Output:

```text
1
2
3
4
```

---

## What are `&&` and `||` operators?

- `&&` means logical AND.
- `||` means logical OR.
- They are commonly used in conditions.

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

## What is the `!` operator?

- `!` reverses a Boolean value.

```kotlin
val isLoggedIn = false

if (!isLoggedIn) {
    println("Please login")
}
```

---

## What is the `::` operator in Kotlin?

- `::` creates a reference to a function, property, or class.
- It is commonly used with higher-order functions.

```kotlin
fun printName(name: String) {
    println(name)
}

val action = ::printName

action("Kiran")
```

- It is also commonly used with Android/Compose callbacks:

```kotlin
Button(onClick = ::onButtonClick)
```

---

## Why are Kotlin classes `final` by default?

- Kotlin makes classes final by default to prevent accidental inheritance.
- It makes the class behavior easier to reason about.
- Use `open` only when inheritance is intentionally supported.

```kotlin
class User
```

- This cannot be inherited:

```kotlin
// class Admin : User() // Error
```

---

## What does the `override` keyword mean?

- `override` means a child class is replacing an `open` parent implementation.
- The parent member must be `open`.

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

## What does the `final` keyword mean?

- `final` prevents further overriding.
- Kotlin members are final by default.

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

## What is `noinline` in Kotlin?

- `noinline` prevents a lambda parameter from being inlined.
- It is useful when you need to store or pass the lambda as an object.

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

- Here:

- `block1` is inlined.
- `block2` remains a normal function object.

---

## What is `crossinline` in Kotlin?

- `crossinline` prevents a lambda from using a non-local `return`.
- It is useful when the lambda is executed from another execution context such as a callback.

```kotlin
inline fun execute(crossinline block: () -> Unit) {

    val runnable = Runnable {
        block()
    }

    runnable.run()
}
```

- Without `crossinline`, Kotlin cannot safely allow a non-local return because the lambda executes inside another function or callback.

---

## What is a non-local return in Kotlin?

- A lambda passed to an inline function can normally return from the surrounding function.
- This is called a non-local return.

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

- The `return` returns from `test()`, not just the lambda.

---

## Why does `crossinline` prevent non-local return?

- Consider:

```kotlin
inline fun execute(crossinline block: () -> Unit) {

    val runnable = Runnable {
        block()
    }

    runnable.run()
}
```

- Now this is not allowed:

```kotlin
execute {
    return
}
```

- Because the lambda is executed inside `Runnable`, Kotlin cannot allow the lambda to return from the outer function.

---

## What does the `object` keyword mean?

- `object` creates a singleton object.
- Only one instance of the object exists.

```kotlin
object Logger {

    fun log(message: String) {
        println(message)
    }
}
```

- Usage:

```kotlin
Logger.log("Hello")
```

- You don't need to create an instance:

```kotlin
// Logger() // Not allowed
```

---

## What is a `companion object`?

- A `companion object` provides class-level members.
- It is Kotlin's common alternative to Java's `static`.

```kotlin
class User {

    companion object {

        fun create(): User {
            return User()
        }
    }
}
```

- Usage:

```kotlin
val user = User.create()
```

---

## What is the difference between `object` and `companion object`?

`object` creates a standalone singleton:

```kotlin
object Logger
```

- A `companion object` belongs to a class:

```kotlin
class User {

    companion object {
        fun create() = User()
    }
}
```

---

## What does the `data` keyword mean?

- `data class` is mainly used to hold data.
- Kotlin automatically generates useful functions such as `equals()`, `hashCode()`, `toString()`, and `copy()`.

```kotlin
data class User(
    val id: Int,
    val name: String
)
```

- You can do:

```kotlin
val user1 = User(1, "Kiran")
val user2 = user1.copy(name = "John")
```

---

## What does the `abstract` keyword mean?

- `abstract` defines something that must be implemented by a child class.
- An abstract class cannot be instantiated directly.

```kotlin
abstract class Animal {

    abstract fun sound()
}
```

- Child class:

```kotlin
class Dog : Animal() {

    override fun sound() {
        println("Bark")
    }
}
```

---

## What is an interface in Kotlin?

- An interface defines a contract that classes can implement.
- A class can implement multiple interfaces.

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

## What does the `operator` keyword mean?

- `operator` allows a class to define custom behavior for operators such as `+`, `-`, `[]`, and `==`.

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

- Now:

```kotlin
val p1 = Point(10, 20)
val p2 = Point(5, 5)

val result = p1 + p2
```

- The `+` operator internally calls `plus()`.

---

## What does the `infix` keyword mean?

- `infix` allows a function to be called without parentheses and dot notation.
- It makes certain APIs more readable.

```kotlin
infix fun Int.add(value: Int): Int {
    return this + value
}
```

- Usage:

```kotlin
val result = 10 add 5
```

- Instead of:

```kotlin
val result = 10.add(5)
```

---

## What does `typealias` mean?

- `typealias` gives another name to an existing type.
- It does not create a new type.

```kotlin
typealias UserId = String

val id: UserId = "123"
```

- It is especially useful for complex function types:

```kotlin
typealias OnUserClick = (User) -> Unit
```

- Now:

```kotlin
fun setListener(listener: OnUserClick) {
}
```

- is easier to read.

---

## What does the `tailrec` keyword mean?

- `tailrec` tells the compiler that a recursive function can be optimized into a loop.
- It helps avoid stack overflow for supported tail-recursive functions.

```kotlin
tailrec fun countDown(value: Int) {

    if (value == 0) return

    println(value)

    countDown(value - 1)
}
```

- The compiler can optimize the recursion instead of creating a new stack frame for every call.

---

## What are custom `get` and `set` accessors?

- `get` controls how a property is read.
- `set` controls how a property is changed.

```kotlin
var name: String = ""
    get() = field.uppercase()
    set(value) {
        field = value.trim()
    }
```

- Usage:

```kotlin
name = " Kiran "

println(name) // KIRAN
```

---

## What does `this` mean in Kotlin?

- `this` refers to the current object.

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

## What does `super` mean in Kotlin?

- `super` refers to the parent class implementation.

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

- Output:

```text
Parent
Child
```

---

## What is the `when` expression in Kotlin?

- `when` is Kotlin's powerful replacement for many `if-else` and `switch` statements.
- It can return a value.

```kotlin
val result = when (status) {
    "SUCCESS" -> "Done"
    "ERROR" -> "Failed"
    else -> "Loading"
}
```

- It is especially useful with sealed classes:

```kotlin
when (result) {
    is Result.Success -> showData(result.data)
    is Result.Error -> showError(result.message)
    Result.Loading -> showLoading()
}
```

---

## What does `return` do?

- `return` exits a function and optionally returns a value.

```kotlin
fun getName(): String {
    return "Kiran"
}
```

---

## What does `break` do?

- `break` stops the current loop.

```kotlin
for (i in 1..10) {
    if (i == 5) break
    println(i)
}
```

- Output:

```text
1
2
3
4
```

---

## What does `continue` do?

- `continue` skips the current iteration and moves to the next one.

```kotlin
for (i in 1..5) {
    if (i == 3) continue
    println(i)
}
```

- Output:

```text
1
2
4
5
```

---
# Kotlin Advanced

## What is a Kotlin `value class` and when do you use it on Android?

- A `value class` creates a distinct type around one value.
- It gives compile-time type safety without necessarily creating a separate object at runtime.
- It is useful when two values have the same underlying type but different meanings.

```kotlin
@JvmInline
value class UserId(val value: String)

@JvmInline
value class OrderId(val value: String)
```

- Now this is type-safe:

```kotlin
fun loadUser(id: UserId) {
    // ...
}

val userId = UserId("123")

loadUser(userId)
```

- You cannot accidentally pass:

```kotlin
val orderId = OrderId("123")

// loadUser(orderId) // Compilation error
```

- Instead of:

```kotlin
fun loadUser(id: String)
fun loadOrder(id: String)
```

- You get:

```kotlin
fun loadUser(id: UserId)
fun loadOrder(id: OrderId)
```

- Important: value classes are not guaranteed to be allocation-free. They can be boxed when used with generics, nullable types, arrays, reflection, or certain APIs.

---

## Does `ConcurrentHashMap` make all operations thread-safe?

- Individual map operations are thread-safe.
- A sequence of operations can still have a race condition.

- For example:

```kotlin
if (!cache.containsKey(id)) {
    cache[id] = user
}
```

- Another thread can modify the map between `containsKey()` and `put()`.

- Prefer atomic operations when appropriate:

```kotlin
cache.putIfAbsent(id, user)
```

---
# Coroutine

## What are Kotlin coroutines?

- Coroutines are lightweight tasks that can suspend without blocking a thread.
- `launch` and `async` come from the `kotlinx.coroutines` library, not the Kotlin standard library.
- `async` and `await` are not Kotlin language keywords; Kotlin uses `Deferred` and `await()` from the library.
- A coroutine does not automatically run on a background thread; its context and dispatcher decide where it runs.

```kotlin
viewModelScope.launch {
    val user = withContext(Dispatchers.IO) { repository.loadUser() }
    uiState.value = user
}
```

---

## What is a Kotlin Channel?

- A `Channel` is a communication queue between coroutines.
- Each sent element is received by one receiver, unlike `SharedFlow`, which broadcasts to collectors.
- An unbuffered channel suspends the sender until a receiver is ready.
- A buffered channel lets the sender continue until the buffer is full.
- Close or cancel the channel when no more values will be sent.

```kotlin
val channel = Channel<String>(capacity = 1)

launch { channel.send("ready") }
launch { println(channel.receive()) }
```

- Use a `Flow` for a stream API and a `Channel` when coroutines need
  point-to-point coordination or work distribution.

---

## What is a `select` expression in coroutines?

- `select` waits for the first of several suspending operations to become available.
- It can select between channel receives, deferred results, sends, joins, or timeouts.
- It is an advanced and experimental coroutine feature; use simpler structured code when possible.

```kotlin
select<String> {
    firstResponse.onAwait { it }
    secondResponse.onAwait { it }
    onTimeout(1_000) { "Timed out" }
}
```

---

## `launch` vs `async`

- `launch` -> `Job`.
- `async` -> `Deferred<T>`.
- Use `async` when a result is required and concurrent execution provides value.
- Do not use `async` just because multiple calls exist.

## `withContext` vs `launch`
- `withContext` switches context and returns a result while remaining sequential.
- `launch` starts a new child coroutine and returns immediately with a `Job`.

---

## What are `Dispatchers`, and why should they be injectable?

- `Main`: UI work.
- `IO`: blocking I/O.
- `Default`: CPU-intensive work.
- Do not mechanically move every function to `IO`; understand the workload.
- Inject dispatchers into business code so tests can control execution and virtual time.
- Production can provide `Dispatchers.IO`.
- Tests can provide `StandardTestDispatcher(testScheduler)`.
- This makes asynchronous behavior deterministic.

```kotlin
class Repository(
    private val ioDispatcher: CoroutineDispatcher
)
```

---

## `SupervisorJob` vs `supervisorScope`

- Both provide supervisor-style failure behavior: one child failure does not automatically cancel siblings.
- `SupervisorJob` is a `Job` used for a long-lived supervisor-based `CoroutineScope`.
- `supervisorScope` is a temporary structured-concurrency scope function.
- `coroutineScope` normally cancels sibling children when one child fails; `supervisorScope` does not automatically do so.
- Neither one ignores exceptions or prevents cancellation from a parent.

```kotlin
val scope = CoroutineScope(
    SupervisorJob() + Dispatchers.IO
)

suspend fun loadDashboard() = supervisorScope {
    launch { loadUser() }
    launch { loadOrders() }
}
```

## Important: Supervisor does not mean "ignore exceptions"

`SupervisorJob` and `supervisorScope` prevent failure propagation to sibling children, but they do not automatically catch exceptions. Appropriate exception handling is still required.

```kotlin
scope.launch {
    try {
        loadData()
    } catch (e: Exception) {
        handleError(e)
    }
}
```

---

## Important: Parent cancellation still propagates

Supervisor semantics prevent a child failure from cancelling siblings. They do not prevent parent cancellation from cancelling children.

```kotlin
coroutineScope {
    supervisorScope {
        launch { loadUser() }
        launch { loadOrders() }
    }
}
```

---

## What is coroutine cancellation?

- Cancellation is cooperative.
- Suspending functions usually check cancellation automatically.
- CPU-heavy loops should check cancellation explicitly.

```kotlin
while (isActive) {
    doWork()
}
```

- Avoid swallowing `CancellationException`.

---

## What is exception handling in coroutines?

- Use `try/catch` around operations where the code can recover.
- `CoroutineExceptionHandler` is mainly for uncaught exceptions in root coroutines.
- Use `supervisorScope` when child failures should be isolated.

```kotlin
viewModelScope.launch {
    try {
        repository.loadUser()
    } catch (e: IOException) {
        showNetworkError()
    }
}
```

- Do not catch every `Throwable` blindly because cancellation must remain
  cancellable.

---
# Flow

## What is Flow?

- `Flow` represents an asynchronous stream of values.
- It is cold by default.
- The producer executes when a collector starts collecting.

```kotlin
fun users(): Flow<List<User>> = flow {
    emit(api.getUsers())
}
```

- Each collector can trigger the upstream flow independently.

---

## What is a cold Flow?

- A cold Flow does not start producing values until collected.
- Each collector gets its own execution.

```kotlin
val flow = flow {
    println("Started")
    emit(1)
}
```

- Collecting twice can execute the upstream twice.

---

## What is a hot Flow?

- A hot flow exists independently of collectors.
- `StateFlow` and `SharedFlow` are common hot flows.

```kotlin
val state: StateFlow<UiState>
```

- The producer can exist even when no UI is collecting.

---

## StateFlow vs SharedFlow

| StateFlow | SharedFlow |
|---|---|
| Represents current state | Broadcasts events/data |
| Requires initial value | Does not require one |
| Always has latest value | Configurable replay |
| Conflates updates | Configurable buffering/replay |

- Use for screen state:
```kotlin
data class UiState(
    val loading: Boolean = false,
    val data: List<Item> = emptyList(),
    val error: String? = null
)
```

- Use for events:

```kotlin
sealed interface UiEvent {
    data class ShowError(val message: String) : UiEvent
    data object NavigateBack : UiEvent
}
```

---

## What are the tricky Flow operators to remember?

- `flowOn` changes the context where upstream work runs; it does not move downstream collection.
- `buffer` lets producer and consumer work independently when temporary buffering is acceptable.
- `conflate` keeps the latest value and skips intermediate values.
- `collectLatest` cancels the previous collector block when a newer value arrives.
- `catch` handles upstream exceptions; it does not automatically catch exceptions thrown after the `catch` operator.
- Keep cancellation exceptions propagating instead of converting them into normal errors.

```kotlin
queryFlow
    .debounce(300)
    .distinctUntilChanged()
    .mapLatest { repository.search(it) }
    .catch { error -> emit(emptyList()) }
    .collectLatest { results -> render(results) }
```

---

## What is LiveData and how does it compare with StateFlow?

- LiveData is lifecycle-aware and Android-specific.
- StateFlow is Kotlin/coroutine based.
- StateFlow works outside Android.
- StateFlow provides Flow operators.

- For new coroutine-based applications, StateFlow is usually preferred.

---

## How do you convert a cold Flow to a hot Flow?

- Converts a cold `Flow` into `StateFlow`.

```kotlin
val uiState = repository.observe()
    .stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = UiState()
    )
```

- Converts a cold `Flow` into a `SharedFlow`.

```kotlin
val events = repository.observeEvents()
    .shareIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        replay = 1
    )
```

---

## How do you convert a hot Flow to a cold Flow?

- You normally cannot turn a hot stream into a truly equivalent cold stream without changing its semantics.
- If you need independent execution per collector, expose the underlying cold producer instead.
- For example:

```kotlin
fun users(): Flow<List<User>> = flow {
    emit(repository.loadUsers())
}
```

## Is this truly cold?

- No. Wrapping a hot Flow inside `flow { emitAll(...) }` makes downstream
  collection collector-dependent, but the upstream producer remains hot.
- Its lifecycle and replay behavior do not change.

```kotlin
val coldLikeFlow = flow {
    emitAll(sharedFlow)
}
```

---

## Why might wrapped hot flow still lose events?

- If a `MutableSharedFlow` has no replay and no collector is active, an
  emission can be lost before the wrapper starts collecting.
- Wrapping the Flow later cannot recover events that were already missed.

```kotlin
val shared = MutableSharedFlow<Int>(replay = 0)

// An emission without an active collector is not replayed.
shared.tryEmit(1)
```

---

## Can hot flow become truly cold?

Not by wrapping the existing hot producer. To get truly cold behavior, recreate the producer logic so each collector starts a fresh execution.

```kotlin
fun getColdFlow(): Flow<Data> = flow {
    emit(api.fetch())
}
```

---

## Why this feels cold?

`callbackFlow` ties registration and cleanup to collection. The listener is registered when a collector starts and removed when the collection is cancelled. This adapts callback-based APIs such as WebSocket, BLE, and listeners to a lifecycle-aware Flow.

```kotlin
fun observeEvents(): Flow<Int> = callbackFlow {
    val listener = Listener { value -> trySend(value) }
    register(listener)
    awaitClose { unregister(listener) }
}
```

---

## What is the difference between a suspend function and Flow?

- A `suspend` function usually returns one result.
- A Flow can emit multiple values over time.

```kotlin
suspend fun getUser(): User

fun observeUser(): Flow<User>
```

- Use a suspend function for one-shot work and Flow for streams or state.

---

# Tricky Coroutine Code Problems

---

## What happens if `searchRepositories(query)` is a suspend function?

- If it returns one result:

```kotlin
val repositories = query
    .debounce(300)
    .distinctUntilChanged()
    .mapLatest { query ->
        repository.searchRepositories(query)
    }
```

- `mapLatest` is useful because a new query cancels the previous suspend
  operation.

---

## What is `runBlocking`, and how does it compare with `runTest`?

- `runBlocking` blocks a real thread.
- `runTest` provides coroutine test scheduling and virtual time.
- Android unit tests should generally use `runTest` for coroutine code.
- Avoid `runBlocking` on Android's Main thread because it can cause an ANR.
- Use `runBlocking` mainly when bridging synchronous and coroutine code, not as the normal coroutine test tool.

```kotlin
@Test
fun testLoadUser() = runTest {
    viewModel.loadUser()
}
```

---

## Can `runBlocking` cause an Android ANR?

- Yes. `runBlocking` blocks the current thread until its coroutine completes.
- If it runs on Main, the UI cannot process input or draw frames.
- Prefer a lifecycle-aware `launch` for Android UI work.

```kotlin
lifecycleScope.launch {
    delay(5000)
}
```

---

## How do you test coroutine dispatchers?

- Inject dispatchers instead of hard-coding `Dispatchers.IO` or `Dispatchers.Default` in business code.
- Use `runTest` to control virtual time.
- Use `StandardTestDispatcher` when you want execution to advance explicitly.
- Use `UnconfinedTestDispatcher` only when its eager execution matches the test's intent.
- Use `Dispatchers.setMain` and `resetMain` when testing code that depends on `Dispatchers.Main`.

```kotlin
class UserLoader(
    private val ioDispatcher: CoroutineDispatcher
) {
    suspend fun load() = withContext(ioDispatcher) { "user" }
}

@Test
fun loadsUser() = runTest {
    val dispatcher = StandardTestDispatcher(testScheduler)
    val loader = UserLoader(ioDispatcher = dispatcher)

    loader.load()
    advanceUntilIdle()
}
```

---

## What is cooperative cancellation?

- Kotlin coroutine cancellation is cooperative.
- Cancelling a `Job` does not forcibly kill arbitrary CPU code.
- The coroutine must reach a suspension point or explicitly check cancellation.

```kotlin
val job = launch {

    while (true) {
        ensureActive()
        doWork()
    }
}

job.cancel()
```

- Cancellation-aware operations include `delay`, `yield`, `await`, and `withContext`.

```kotlin
delay(...)
yield()
await()
withContext(...)
```

- A CPU-only loop needs an explicit check:

```kotlin
while (isActive) {
    calculate()
}
```

---

## What happens when `job.cancel()` is called while `delay()` is running?

`delay()` is cancellation-aware.

```kotlin
val job = launch {

    println("Start")

    delay(5000)

    println("End")
}

job.cancel()
```

- `End` will not execute.
- The coroutine is cancelled while suspended.

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

- This is one reason `delay()` is safe for coroutine cancellation.

---

## Does `delay()` block the Main thread?

- No. `delay()` suspends the coroutine, not the thread.
- The Main thread can continue processing other work.
- `Thread.sleep()` blocks the Main thread and should not be used for coroutine delays.

```kotlin
viewModelScope.launch(Dispatchers.Main) {

    delay(5000)

    updateUi()
}
```

```kotlin
Thread.sleep(5000)
```

---

## What is `NonCancellable`?

- `NonCancellable` is a special `CoroutineContext` element.
- It prevents cancellation from stopping the block while that block is executing.
- It is mainly useful for cleanup or critical final operations.
- Use it narrowly; do not make normal business work ignore cancellation.

```kotlin
try {
    doWork()
} finally {

    withContext(NonCancellable) {
        saveState()
    }
}
```

- Without `NonCancellable`, a suspending operation in `finally` may immediately observe the cancelled state.
- Good use: suspending cleanup that must complete.

```kotlin
finally {
    withContext(NonCancellable) {
        closeResource()
    }
}
```

- Bad use: wrapping normal business or network work so it ignores cancellation.

```kotlin
withContext(NonCancellable) {
    apiCall()
}
```

- `NonCancellable` and `GlobalScope` solve different problems.
- `NonCancellable` is a context element for controlled cleanup and still belongs to the parent coroutine.
- `GlobalScope` is an independent scope that can outlive a feature lifecycle.
- The first example is controlled cleanup:

```kotlin
withContext(NonCancellable) {
    cleanup()
}
```

- The second example creates an independent coroutine:

```kotlin
GlobalScope.launch {
    cleanup()
}
```

---

## What is a common `finally` + cancellation interview question?

- `finally` normally executes during cancellation.
- A non-suspending cleanup statement can run normally.
- `Cleanup` is printed in the first example.
- A suspending call inside `finally` may immediately fail because the coroutine is already cancelled.

```kotlin
val job = launch {

    try {
        delay(5000)
    } finally {
        println("Cleanup")
    }
}

job.cancel()
```

```kotlin
finally {
    delay(1000)
}
```

- Use `withContext(NonCancellable)` only when the cleanup must suspend and complete.

```kotlin
finally {
    withContext(NonCancellable) {
        delay(1000)
        saveToDatabase()
    }
}
```

---

## Do two `async` calls execute if I never call `await()`?

- They can start and execute even if you never call `await()`.

```kotlin
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

- However, `async` is not a fire-and-forget replacement for `launch`.

- The enclosing structured scope still waits for its children.

- If the results are not needed, prefer `launch`:

```kotlin
launch {
    api1()
}

launch {
    api2()
}
```

- Another important point:

- If an `async` child fails, its exception can still cancel the parent in a
  normal `coroutineScope`, even if nobody calls `await()`.

---

## Are two `async` calls parallel or sequential?

- These two `async` blocks start before either result is awaited, so their
  work can overlap:

```kotlin
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

- Both operations are started before the first `await()`.
- Conceptually:

``` text
api1  ────────────────┐
                      ├── combine
api2  ────────────────┘
```

- This version is sequential:

```kotlin
val result1 = async {
    api1()
}.await()

val result2 = async {
    api2()
}.await()
```

- The second `async` is not created until the first operation completes.
- Conceptually:

``` text
api1 ──────> result1
                 ↓
api2 ──────> result2
```

---

## `combine` vs `merge`

- `combine`: emits using the latest value from each upstream.
- `merge`: forwards emissions from multiple flows as they arrive.

## `flatMapLatest`

- Cancels the previous inner flow when a new upstream value arrives.
- Excellent for search.

```kotlin
query
    .debounce(300)
    .distinctUntilChanged()
    .flatMapLatest { repository.search(it) }
```

---

## Does `async` always mean parallel execution?

- No. `async` means concurrent coroutine work, not guaranteed physical
  parallelism.

```kotlin
async {
    calculate()
}
```

- Whether it executes on multiple threads depends on the dispatcher.

- For example:

```kotlin
async(Dispatchers.Default) {
    calculate()
}
```

- `Dispatchers.Default` can execute CPU work on different worker threads.

- But:

```kotlin
async(Dispatchers.Main) {
    calculate()
}
```

- `Dispatchers.Main` runs on the Main dispatcher and does not magically
  create another UI thread.

---

## What happens if `await()` is called immediately after `async`?

```kotlin
val result1 = async {
    api1()
}.await()

val result2 = async {
    api2()
}.await()
```

- This is effectively sequential.
- The first operation must complete before the second `async` is created.

- To run concurrently:

```kotlin
val first = async {
    api1()
}

val second = async {
    api2()
}

val result1 = first.await()
val result2 = second.await()
```

- This is a very common interview trap: creating `async` and immediately
  awaiting it removes the intended overlap.

---

## What happens if one `async` fails inside `coroutineScope`?

```kotlin
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

- The failure cancels the parent scope.
- Therefore the other child is also cancelled.

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

- The exception is not made harmless simply because `await()` was not
  called.

---

## How does `supervisorScope` change exception propagation?

`supervisorScope` prevents one child failure from automatically
cancelling sibling children.

```kotlin
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

- The second child can continue.
- Compare:

``` text
coroutineScope

child A fails
     ↓
parent fails
     ↓
child B cancelled
```

- With:

``` text
supervisorScope

child A fails
     ↓
child B continues
```

- Use it when sibling operations should be independent.

---

## Does `launch` exception get caught by an outer `try-catch`?

- This does not work as many developers expect:

```kotlin
try {

    launch {
        throw Exception("Failed")
    }

} catch (e: Exception) {

    println("Caught")
}
```

- The `launch` body executes asynchronously.
- The outer `try-catch` does not surround the actual execution of the child.

- Instead, catch the exception inside the child:

```kotlin
launch {

    try {
        riskyOperation()
    } catch (e: Exception) {
        println("Caught")
    }
}
```

- For a root coroutine, a `CoroutineExceptionHandler` can also observe
  uncaught exceptions.

---

## What happens if an `async` exception is never awaited?

- Consider:

```kotlin
coroutineScope {

    val deferred = async {
        throw Exception("Failed")
    }

    delay(1000)

    println("Done")
}
```

- The failure still affects the structured scope.
- Missing `await()` does not make the exception harmless or completely
  ignored.
- The parent can be cancelled because the `async` child failed.
- This is a common senior-level interview correction.

---

## What happens when a child coroutine is cancelled?

```kotlin
launch {

    val child = launch {
        delay(1000)
        println("Child")
    }

    child.cancel()

    println("Parent")
}
```

- Output:

``` text
Parent
```

- The child is cancelled.
- Cancelling a child does not normally cancel its parent.
- Cancelling the parent cancels its children.

``` text
parent.cancel()
     ↓
child cancelled
```

- While:

``` text
child.cancel()
     ↓
parent continues
```

---

## What happens when a parent coroutine is cancelled?

```kotlin
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

- Both children are cancelled.
- This is structured concurrency.

---

## What happens with `launch` inside another `launch`?

```kotlin
launch {

    launch {
        delay(1000)
        println("Child")
    }

    println("Parent")
}
```

- The parent prints immediately, and the child prints later.
- The parent coroutine does not wait at that exact line, but the
  structured parent does not complete until its child completes.

---

## What happens if `GlobalScope.launch` is used inside a parent coroutine?

```kotlin
launch {

    GlobalScope.launch {
        delay(1000)
        println("Global child")
    }
}
```

- The `GlobalScope` coroutine is not a child of the surrounding `launch`.
- Therefore:

``` text
parent cancelled
     ↓
normal child → cancelled

GlobalScope child → continues
```

- This is why `GlobalScope` is usually avoided in Android feature code.

---

## Is `withContext` blocking?

- No, not in the thread-blocking sense.

```kotlin
withContext(Dispatchers.IO) {
    apiCall()
}
```

- The current coroutine suspends while the operation runs.
- The thread is not necessarily blocked.
- This distinction is important:

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

- For example:

```kotlin
launch(Dispatchers.Main.immediate) {
    println("A")
}

println("B")
```

- If this code is already executing on Main, `A` can execute immediately
  before `B`.

- With:

```kotlin
launch(Dispatchers.Main) {
    println("A")
}

println("B")
```

- With `Dispatchers.Main`, the coroutine may be dispatched, so `B` can
  execute before `A`.

---

## Why can `delay()` inside `Dispatchers.Main` be safe?

```kotlin
launch(Dispatchers.Main) {

    println("Before")

    delay(1000)

    println("After")
}
```

- During the delay:

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

- Compare:

```kotlin
launch(Dispatchers.Main) {
    Thread.sleep(1000)
}
```

- `Thread.sleep()` blocks Main and can cause an ANR.

---

## What is `yield()`?

`yield()` gives other ready coroutines an opportunity to execute.

```kotlin
launch {
    println("A")
    yield()
    println("B")
}

launch {
    println("C")
}
```

- A possible output is:

``` text
A
C
B
```

- The important point is not to promise an exact order.

- `yield()` is also cancellation-aware.

```kotlin
yield()
```

- `yield()` can detect cancellation and stop the coroutine.

---

## What is the difference between `delay()` and `yield()`?

- `delay()`:

```kotlin
delay(1000)
```

- `delay()` suspends for at least the requested delay period.

- `yield()`:

```kotlin
yield()
```

- `yield()` does not intentionally wait for a fixed amount of time. It
  gives the scheduler an opportunity to run other work.

- Both are suspension points.

---

## Can `withContext(Dispatchers.IO)` be nested inside `withContext(Dispatchers.IO)`?

- Technically yes:

```kotlin
withContext(Dispatchers.IO) {

    withContext(Dispatchers.IO) {
        repository.load()
    }
}
```

- It is usually unnecessary.
- A better design is:

```kotlin
withContext(Dispatchers.IO) {
    repository.load()
}
```

- Avoid unnecessary context switches because they make code harder to
  reason about.

---

## What happens with nested dispatcher switching?

```kotlin
withContext(Dispatchers.IO) {

    loadFromDatabase()

    withContext(Dispatchers.Main) {
        updateUi()
    }
}
```

- Execution moves:

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

- `withContext` is sequential: the outer block waits for the inner block
  to finish.

---

## What happens when `runBlocking` contains a normal child `launch`?

```kotlin
runBlocking {

    launch {
        delay(1000)
        println("Done")
    }

    println("Parent")
}
```

- Output is:

``` text
Parent
Done
```

- `runBlocking` waits for its structured children before returning.

---

## What happens when `runBlocking` contains `GlobalScope.launch`?

```kotlin
runBlocking {

    GlobalScope.launch {
        delay(1000)
        println("Done")
    }
}
```

- `runBlocking` does not wait for the `GlobalScope` coroutine.
- The program may finish before `Done` is printed.
- Why?

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

- Consider:

```kotlin
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

- When `cancel()` cancels the collecting coroutine, collection stops
  through cancellation.

- The important idea is that cancellation stops collection through
  coroutine cancellation.
- A safer way to stop collection based on a condition is often to use
  operators such as:

```kotlin
takeWhile { it != 1 }
```

- Or:

```kotlin
first { it == 1 }
```

- The choice depends on the requirement.

---

## What happens if you catch `CancellationException` incorrectly?

- This is dangerous:

```kotlin
try {
    doWork()
} catch (e: Exception) {
    println("Error")
}
```

- Because `CancellationException` is an `Exception`, this can accidentally
  catch cancellation.
- A coroutine may then continue executing after cancellation.

- Prefer:

```kotlin
try {
    doWork()
} catch (e: CancellationException) {
    throw e
} catch (e: Exception) {
    handleError(e)
}
```

---

## What is the tricky problem with `catch (Exception)` in coroutine code?

```kotlin
try {
    delay(5000)
} catch (e: Exception) {
    println("Something failed")
}
```

- If the coroutine is cancelled during `delay()`, the catch block can catch
  `CancellationException`.
- If you swallow it, the coroutine may continue.

- Better:

```kotlin
catch (e: CancellationException) {
    throw e
}
catch (e: Exception) {
    handleError(e)
}
```

- This is a very common senior-level interview question.

---

## What happens if `CancellationException` is thrown manually?

```kotlin
throw CancellationException()
```

- The coroutine becomes cancelled.
- It is treated differently from a normal application exception because
  cancellation is part of coroutine control flow.

- Usually, let cancellation propagate instead of converting it into
  another exception.

---

## What happens if a cancelled coroutine calls `withContext(Dispatchers.IO)`?

- Cancellation normally propagates.

```kotlin
job.cancel()

withContext(Dispatchers.IO) {
    doWork()
}
```

- A cancelled coroutine cannot normally use `withContext` to escape
  cancellation.
- Changing the dispatcher does not remove cancellation.

- To intentionally perform cancellation-safe cleanup:

```kotlin
withContext(NonCancellable) {
    withContext(Dispatchers.IO) {
        saveData()
    }
}
```

- This is a useful interview combination.

---

## Can `NonCancellable` make a coroutine immortal?

- No.

```kotlin
withContext(NonCancellable) {
    cleanup()
}
```

- `NonCancellable` only changes cancellation behavior for that block.
- It does not detach the coroutine from its parent.
- The parent can still control the coroutine lifecycle outside that block.

- Think:

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

```kotlin
job.cancel()
job.join()
```

- `cancel()` requests cancellation.
- `join()` suspends until the job has actually completed.
- This is useful when you need to wait for cancellation and cleanup to
  finish.

```kotlin
job.cancel()
job.join()

println("Job completely finished")
```

---

## What happens with `Job` cancellation and child jobs?

```kotlin
val parent = launch {

    val child = launch {
        delay(5000)
    }

    delay(1000)
}

parent.cancel()
```

- The child is cancelled because cancellation propagates from parent to
  child.

- But:

```kotlin
child.cancel()
```

- `child.cancel()` does not normally cancel the parent.
- Cancellation flows downward.

---

## What is the difference between cancellation propagation and exception propagation?

- Cancellation:

``` text
parent cancelled
     ↓
children cancelled
```

- Normal failure:

``` text
child throws exception
     ↓
parent fails
     ↓
siblings cancelled
```

- With supervision:

``` text
child throws exception
     ↓
sibling can continue
```

- This distinction is important when explaining `coroutineScope` vs
  `supervisorScope`.

---

## Can `Dispatchers.Default` execute multiple coroutines at the same time?

- Yes. `Dispatchers.Default` uses a shared pool of worker threads designed
  primarily for CPU-bound work.

```kotlin
coroutineScope {

    launch(Dispatchers.Default) {
        calculateA()
    }

    launch(Dispatchers.Default) {
        calculateB()
    }
}
```

- These coroutines may execute concurrently on different worker threads.
- For blocking I/O, prefer:

```kotlin
Dispatchers.IO
```

---

## Does switching to `Dispatchers.IO` automatically make blocking code safe?

- It protects the Main thread, but it does not make the operation magically
  non-blocking.

```kotlin
withContext(Dispatchers.IO) {
    blockingFileOperation()
}
```

- The worker thread is still blocked while the operation runs.
- The benefit is that you are blocking an I/O worker rather than the Main
  thread.

---

## What happens if you use `Dispatchers.Default` for blocking I/O?

```kotlin
withContext(Dispatchers.Default) {
    blockingNetworkCall()
}
```

- It can consume CPU dispatcher threads while they are waiting for blocking
  I/O.
- That can reduce the availability of threads for CPU work.
- Use the dispatcher that matches the operation:

``` text
CPU-heavy work → Default
Blocking I/O    → IO
UI work         → Main
```

---

## What is the hidden trap with `withContext` and cancellation?

- Changing dispatcher does not reset cancellation.

```kotlin
withContext(Dispatchers.IO) {
    doWork()
}
```

- The new context normally keeps the existing `Job`.
- Therefore:

``` text
Parent Job cancelled
       ↓
withContext(IO)
       ↓
still cancelled
```

- `withContext` changes context elements such as dispatcher, but it does
  not detach the coroutine from its parent.

---

## What is Structured Concurrency?

- Child coroutines have a clear parent and lifetime.
- The parent owns the children.
- Cancellation propagates predictably.
- A parent normally does not complete while its children are still active.
- It prevents work from escaping its lifecycle.

```kotlin
viewModelScope.launch {
    coroutineScope {
        launch { loadUser() }
        launch { loadOrders() }
    }
}
```

## Difference between Structured Concurrency and Parallelism
- Concurrency means tasks can make progress during overlapping time periods.
- Parallelism means tasks execute at the same time on multiple CPU cores.
- Coroutines provide concurrency; actual parallelism depends on the dispatcher and available threads.
- Concurrency does not guarantee parallelism, especially on a single-core CPU.
- Parallel tasks are concurrent, but concurrent tasks are not always parallel.

Example:

```kotlin
coroutineScope {
    launch {
        api1()
    }
    launch {
        api2()
    }
}
```

---

## What is the difference between `viewModelScope` and `lifecycleScope`?

- `viewModelScope` is tied to the ViewModel.

```kotlin
viewModelScope.launch {
    repository.load()
}
```

- It is cancelled when the ViewModel is cleared.

- `lifecycleScope` is tied to an Android LifecycleOwner.

```kotlin
lifecycleScope.launch {
    loadData()
}
```

- It is cancelled when the LifecycleOwner is destroyed.

---

## What happens if two `async` operations have different durations?

```kotlin
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

- `second` can finish first.
- The code waits for `first` first because:

```kotlin
first.await()
```

- `first.await()` is called first.
- This does not mean `second` stopped; it may already have completed.
- Conceptually:

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

- No.

```kotlin
val first = async { api1() }
val second = async { api2() }

val result = first.await()
```

- `first.await()` only waits for the first result.
- `second` continues unless the parent scope is cancelled or another
  failure causes cancellation.

---

## What happens if one `async` fails and another is still running?

In a normal `coroutineScope`:

```kotlin
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

- If `api1()` fails:

``` text
api1 fails
   ↓
scope fails
   ↓
api2 cancelled
```

- If the operations are independent and should not cancel each other,
  consider:

```kotlin
supervisorScope {
    ...
}
```

---

## What is the hidden trap with `supervisorScope` and `async`?

- `supervisorScope` prevents sibling cancellation, but you still need to
  handle the failed `Deferred`.

```kotlin
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

- Supervision does not automatically convert a failed operation into a
  successful result.

---

## What happens if a coroutine is cancelled before it starts executing?

```kotlin
val job = launch {
    println("Hello")
}

job.cancel()
```

- Depending on scheduling, the coroutine may be cancelled before its body
  gets a chance to execute.
- Do not rely on the body always running.
- If an operation must happen before cancellation can occur, structure the
  operation appropriately rather than assuming `launch` starts
  synchronously.

---

## Does calling `launch {}` execute the block immediately?

- Not necessarily.

```kotlin
launch {
    println("Child")
}

println("Parent")
```

- The exact output depends on the dispatcher and scheduling.
- Do not assume:

``` text
Child
Parent
```

- Or:

``` text
Parent
Child
```

- Without knowing the execution context, the exact order is not guaranteed.

- A senior answer should say: `launch` schedules work; it does not guarantee
  that the body runs before the next statement.

---

## What happens with `launch(start = CoroutineStart.LAZY)`?

- A lazy coroutine does not start until it is needed.

```kotlin
val job = launch(start = CoroutineStart.LAZY) {
    println("Work")
}

println("Created")

job.start()
```

- Output:

``` text
Created
Work
```

- For `async`:

```kotlin
val deferred = async(start = CoroutineStart.LAZY) {
    loadData()
}

val result = deferred.await()
```

- `await()` starts the lazy coroutine.

---

## What is the difference between `CoroutineStart.DEFAULT` and `LAZY`?

- Default:

```kotlin
launch {
    work()
}
```

- The coroutine is scheduled immediately.

- Lazy:

```kotlin
launch(start = CoroutineStart.LAZY) {
    work()
}
```

- The coroutine does not start until `start()`, `join()`, or another
  operation that starts it.

---

## Why should you not use `CoroutineExceptionHandler` for normal error handling?

`CoroutineExceptionHandler` is mainly for uncaught exceptions at
coroutine boundaries.

- It is not a replacement for normal business error handling.

Prefer:

```kotlin
viewModelScope.launch {

    try {
        repository.load()
    } catch (e: IOException) {
        updateUiWithError()
    }
}
```

- Use `CoroutineExceptionHandler` for last-resort handling or logging of
  uncaught exceptions.

---

## What is `CoroutineExceptionHandler` and `async`?

```kotlin
val handler = CoroutineExceptionHandler { _, exception ->
    println("Caught: $exception")
}

launch(handler) {
    throw Exception("Failed")
}
```

- The handler can observe an uncaught exception from `launch`.

- But:

```kotlin
async(handler) {
    throw Exception("Failed")
}
```

- `async` is different because it exposes failure through its `Deferred`.

- You should normally handle the failure when awaiting:

```kotlin
try {
    deferred.await()
} catch (e: Exception) {
    handleError(e)
}
```

---

## What is a `CoroutineScope` and how should Android apps structure scopes?

- `CoroutineScope` defines the lifetime of coroutines.
- It contains a `CoroutineContext`, including a `Job` and usually a dispatcher.
- When the scope is cancelled, its child coroutines are cancelled.
- Use `viewModelScope` for ViewModel work and `lifecycleScope` for UI-lifecycle work.
- For reusable components, explicitly own and cancel a scope; avoid `GlobalScope`.
- Use `viewModelScope` for work that should live as long as the ViewModel.

- Example:

```kotlin
viewModelScope.launch {
    repository.loadData()
}
```

- Use `lifecycleScope` for work tied to an Android `LifecycleOwner`.

- Example:

```kotlin
lifecycleScope.launch {
    // UI-related coroutine
}
```

- Avoid `GlobalScope` because its work can outlive the screen or feature that started it.

- Example:

```kotlin
GlobalScope.launch {
    repository.loadData()
}
```

---

## What is the difference between `CoroutineContext` and `CoroutineScope`?

### `CoroutineContext`

- A collection of elements that describes how a coroutine executes.
- It can contain:

    1. `Job`
    2. `CoroutineDispatcher`
    3. `CoroutineName`
    4. `CoroutineExceptionHandler`

```kotlin
val context =
    Dispatchers.IO + CoroutineName("NetworkRequest")
```

### `CoroutineScope`

- Owns the coroutine lifecycle.
- It uses a `CoroutineContext` to launch coroutines.

```kotlin
val scope = CoroutineScope(
    SupervisorJob() + Dispatchers.IO
)

scope.launch {
    // Work
}
```

- Remember: `CoroutineContext` describes execution; `CoroutineScope` owns lifetime.

---

## What does `withContext()` do?

- `withContext()` changes the coroutine context for a specific block.
- It is commonly used to switch dispatchers.
- It suspends the current coroutine until the block finishes.
- After the block completes, execution resumes in the original context.
- It does not detach the coroutine from its parent or reset cancellation.

```kotlin
suspend fun loadUser(): User {

    return withContext(Dispatchers.IO) {
        api.getUser()
    }
}
```

- Example:

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

- A `suspend` function can suspend execution without blocking the underlying thread.
- It can be called from another `suspend` function or coroutine.
- `suspend` does **not** automatically mean background execution.
- It does not automatically move the call to `Dispatchers.IO`.

```kotlin
suspend fun fetchUser(): User {
    return api.getUser()
}
```

- For blocking work, switch to an appropriate dispatcher explicitly.

```kotlin
suspend fun readFile(): String {
    return withContext(Dispatchers.IO) {
        file.readText()
    }
}
```

---

## How does a coroutine switch threads from Main to IO and back?

- A coroutine does not physically move its existing thread.
- At a suspension point, Kotlin saves the coroutine's state.
- The dispatcher decides where the continuation should resume.

```kotlin
viewModelScope.launch { // Main

    val user = withContext(Dispatchers.IO) {
        api.getUser()
    }

    // Main again
    updateUi(user)
}
```

- Conceptually:

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

- `Dispatchers.IO` chooses an appropriate thread from its pool.

```kotlin
suspend fun load() {
    api.getUser()
}
```

- This does not automatically mean IO.
- A suspend function can still execute on Main if called from Main.

---

## Why are coroutines lightweight compared to OS threads?

- A thread has its own stack and operating-system resources.
- A coroutine is a lightweight task managed by Kotlin's coroutine machinery.
- When a coroutine suspends, its thread can execute other work.
- Thousands of coroutines can wait without requiring thousands of threads.
- Coroutines still consume memory and CPU; blocking code such as `Thread.sleep()` blocks a thread.

- For example:

```kotlin
repeat(5000) {

    launch {
        delay(1000)
    }
}
```

- Conceptually:

```text
Many coroutines
       ↓
Suspend while waiting
       ↓
Small number of threads
       ↓
Threads perform other work
```

- Blocking code defeats much of the benefit:

```kotlin
launch {
    Thread.sleep(5000)
}
```

- Prefer `delay()` for a cancellable suspension instead of `Thread.sleep()`.

```kotlin
launch {
    delay(5000)
}
```

---
