# Kotlin
---

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

### What does the `open` keyword mean in Kotlin?

* Kotlin classes and functions are `final` by default.
* `open` allows a class or function to be inherited or overridden.
* This is different from Java, where classes and methods are inheritable by default.

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

## What is destructuring in Kotlin and where is it unsafe?

* Destructuring lets you unpack an object into multiple variables.
* Kotlin uses `component1()`, `component2()`, etc. behind the scenes.
* It is most commonly used with `data class`, pairs, maps, and collections.
* It can become unsafe or confusing when the component order changes or when the type does not clearly communicate what each value means.

```kotlin
data class Employee(
    val name: String,
    val age: Int
)

val employee = Employee("Kiran", 30)

val (name, age) = employee

println(name) // Kiran
println(age)  // 30
```

Conceptually, Kotlin does:

```kotlin
val name = employee.component1()
val age = employee.component2()
```

**Interview point:** Destructuring is positional, not name-based.

```kotlin
val (name, age) = employee
```

If the property order changes, the meaning of the destructured variables can change too.

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

## What is structured concurrency in Kotlin?

* Structured concurrency ensures that child coroutines have a clear parent.
* The parent controls the lifetime of its children.
* Cancellation and failures can propagate predictably.

```kotlin
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

```text
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

```kotlin
GlobalScope.launch {
    loadUser()
}
```

because there is no feature-level owner controlling its lifetime.

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