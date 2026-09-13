# Java Language and OOP

## `String`, `StringBuilder` and `StringBuffer`

- `String` is immutable. `StringBuilder` is mutable and unsynchronized, so it is the normal choice for single-threaded assembly. `StringBuffer` is synchronized and mainly legacy.
- Repeated concatenation in a loop creates intermediate strings; use a builder or join operation.

---

## Why do `equals()` and `hashCode()` matter?

- Equal objects must return the same hash code. Hash collections use the hash to find a bucket and `equals()` to confirm the entry.
- Keep fields used by equality and hashing immutable while an object is a key.

---

## Weak, soft and phantom references

- Weak references do not keep objects alive. Soft references may be cleared under memory pressure but are not a reliable cache policy. Phantom references work with a queue for post-mortem tracking.
- They do not replace lifecycle ownership or cancellation.

---

## How is double-checked locking made safe?

- Check outside the lock, check again inside it, and declare the instance `volatile` to prevent publication of a partially constructed object.
- In Android application code, dependency injection is usually easier to test and scope.

---

## What are the main OOP concepts?

- Encapsulation protects state, abstraction exposes a useful contract, inheritance specializes a type, and polymorphism allows different implementations behind one contract.
- Inheritance should represent a genuine substitutable relationship, not just code reuse.

---

## What is an object?

- An object is a runtime instance with identity, state, and behavior defined by its class.

---

## What is inheritance?

- A subclass receives accessible behavior and state from a superclass and can specialize it. This supports polymorphism but couples the two types.
- Prefer composition when behavior should be replaceable independently.

---

## What is composition over inheritance?

- Composition builds behavior from collaborating objects and models a has-a relationship. Dependencies can be replaced without changing a class hierarchy.

```java
class PaymentService {
    private final FraudChecker fraudChecker;

    PaymentService(FraudChecker fraudChecker) {
        this.fraudChecker = fraudChecker;
    }
}
```

---

## What is an interface?

- An interface defines a contract that classes can implement. It cannot be instantiated, and a class can implement multiple interfaces. A marker interface has no abstract methods and communicates capability or metadata.

---

## What is a functional interface?

- It has exactly one abstract method, so it can be implemented with a lambda or method reference. `@FunctionalInterface` asks the compiler to enforce that rule.
- **Common types:** `Consumer` accepts input, `Predicate` returns a boolean, `Function` transforms a value, and `Supplier` produces a value.

```java
Predicate<String> valid = value -> !value.isBlank();
```

---

## What changed in interfaces in Java 8?

- Default methods let existing implementations inherit new behavior, helping evolve interfaces compatibly. Static interface methods belong to the interface and are not overridden.
- Conflicting default methods from two interfaces must be resolved by the implementing class.

---

## Can interfaces be extended?

- Yes. An interface can extend one or more interfaces; a class uses `implements`. A class can extend only one class.

---

## Interface vs abstract class

| Interface | Abstract class |
|---|---|
| Contract or capability | Shared base type and partial implementation |
| A class can implement several | A class can extend one |
| No instance constructor | Can have constructors and state |
| Abstract, default and static methods | Concrete and abstract methods |

---

## What is encapsulation?

- Encapsulation keeps state and the operations that protect its invariants together, exposing only the access callers need.

```java
class Account {
    private long balance;

    void deposit(long amount) {
        if (amount > 0) balance += amount;
    }

    void withdraw(long amount) {
        if (amount > 0 && amount <= balance) balance -= amount;
    }
}
```

---

## What is polymorphism?

- Polymorphism lets one contract work with different implementations. Overloading is commonly compile-time polymorphism; overriding is runtime polymorphism.

---

## Overriding vs overloading

| Overloading | Overriding |
|---|---|
| Same name, different parameters | Same compatible signature in a subtype |
| Resolved at compile time | Resolved at runtime |
| Does not require inheritance | Requires inheritance or implementation |
| Return type alone cannot distinguish it | Return type may be covariant |

---

## Why avoid calling an overridable method from a constructor?

- A subclass override can run before subclass fields and invariants are initialized, observing invalid state or calling methods that assume construction is complete.

---

## Abstraction vs encapsulation

- Abstraction decides what the caller needs to know and exposes a simpler contract. Encapsulation controls access to the implementation and protects its state.

---

## What are anonymous classes?

- An anonymous class declares and creates one object in the same expression. It is useful when an implementation needs multiple methods or state; lambdas are clearer for one-method contracts.

---

## Constructors vs methods

- A constructor initializes a new instance and has no return type. A method performs behavior afterward and may be instance or static. Constructors are not inherited, though subclasses can call `super()`.

---

## Instantiation vs initialization

- Instantiation creates an object instance. Initialization assigns fields and establishes its initial valid state, including constructor execution.

---

## Are Java objects passed by reference or value?

- Java always passes by value. For an object, the copied value is a reference, so a method can mutate the same object but cannot replace the caller's reference.

---

## `int` vs `Integer`, autoboxing and unboxing

- `int` is a primitive. `Integer` is a nullable wrapper used by generics and object APIs. Autoboxing converts `int` to `Integer`; unboxing does the reverse.
- Unboxing null throws `NullPointerException`, and unnecessary boxing can add allocation or overhead.

---

## `==` vs `equals()`

- For primitives, `==` compares values. For object references, it compares identity. `equals()` compares logical equality according to the class contract.

---

## Why are strings immutable, and what is the string pool?

- A `String` cannot change after creation. Immutability supports safe sharing, stable hash codes, pooling, and simpler concurrency. The pool stores canonical literals and interned strings.
- `intern()` can reduce duplicates in a bounded set but can increase pool pressure. It never makes `==` a general content comparison.

---

## What does `final` mean, and what is `finalize()`?

- A final variable is assigned once, a final method cannot be overridden, and a final class cannot be extended. A final reference may still point to a mutable object. `finalize()` is an unreliable deprecated cleanup hook and should not manage resources.

---

## Static members and static method hiding

- Static members belong to the class, not an instance. Static methods cannot directly access instance state and cannot be overridden; a same-signature subclass method hides the parent method.
- Static mutable state behaves like global state and harms test isolation.

---

## Fail-fast vs fail-safe iteration

- Many standard iterators are fail-fast on a best-effort basis and may throw `ConcurrentModificationException` after structural modification. Snapshot or concurrent collections provide a separate or weakly consistent view.

---

## What is `Optional`?

- `Optional<T>` makes a possibly absent return value explicit and supports transformations and fallbacks without unchecked null handling.
- Avoid it for every field or local variable, and do not call `get()` without proving presence.

---

## Cloning and shallow vs deep copy

- Cloning copies field values; a shallow copy shares nested references, while a deep copy recursively creates independent mutable state. The legacy `Cloneable` protocol is awkward, so copy constructors or factories are usually clearer.
- Deep copying can be expensive and ambiguous for shared resources; immutable nested data often removes the need.

---

## What are Java access scopes?

| Modifier | Same class | Same package | Subclass elsewhere | Other code |
|---|---|---|---|---|
| `public` | Yes | Yes | Yes | Yes |
| `protected` | Yes | Yes | Yes, through inheritance | No |
| package-private | Yes | Yes | No | No |
| `private` | Yes | No | No | No |

---

## Can private methods be overridden?

- No. Private methods are not inherited or visible to subclasses, so a same-named subclass method is unrelated.

---

## Why cannot a static method directly access an instance variable?

- A static method can run without an object, while an instance variable belongs to a particular object. It needs an explicit instance reference to read that value.

---

# Collections and Generics

## How does `HashSet` work internally?

- `HashSet` is backed by a `HashMap`; the element is the key and a dummy value is stored. `hashCode()` selects a bucket and `equals()` resolves collisions.
- Order is not guaranteed. Mutating an element after insertion can make it unfindable if its hash changes. `null` is allowed once.

---

## How does `ArrayList` grow?

- It stores elements in an array. When full, it allocates a larger array and copies elements. Appends are amortized O(1); middle insertion and removal are O(n).
- Growth policy is an implementation detail. Presize with `new ArrayList<>(capacity)` when the size is known.

---

## `ConcurrentHashMap` vs `synchronizedMap`

- `synchronizedMap` uses one monitor for most operations. `ConcurrentHashMap` is designed for higher concurrency with finer-grained coordination and CAS where appropriate.
- Neither makes a multi-key workflow atomic, and `ConcurrentHashMap` rejects null keys and values.

---

## What is `Comparator`?

- `Comparator<T>` defines external ordering through `compare(a, b)`: negative means first, zero means equivalent for that ordering, and positive means second.
- Comparison must be transitive. Compose rules with `Comparator.comparing(...).thenComparing(...)`.

---

## `List` vs `Set`

- A `List` preserves sequence and allows duplicates. A `Set` models unique membership according to its equality rules.

---

## `ArrayList` vs `Vector`

- Both are resizable arrays, but `Vector` synchronizes legacy methods while `ArrayList` does not. `ArrayList` is normally preferred; concurrency needs an appropriate concurrent collection or explicit lock.

---

## Common `Map` implementations

| Type | Ordering | Typical use |
|---|---|---|
| `HashMap` | No guaranteed order | Expected fast lookup |
| `LinkedHashMap` | Insertion/access order | Predictable iteration or LRU-like logic |
| `TreeMap` | Sorted by key | Ordered navigation and ranges |
| `Hashtable` | Legacy synchronized map | Compatibility only; no nulls |

---

## Enumeration vs Iterator

- `Enumeration` is a legacy read-oriented API. `Iterator` is the modern traversal API and supports optional removal; `ListIterator` also moves in both directions and can update a list.

---

## How does `HashMap` work?

- A key hash selects a bucket and equality identifies the matching entry among collisions. Modern implementations may treeify heavily collided buckets, but exact internals are implementation details.
- Expected lookup is O(1), but poor hashes, resizing, collisions, and mutable keys hurt performance or correctness.

---

## Why use generics?

- Generics provide compile-time type safety and remove most casts. Type erasure means generic type information is limited at runtime.

---

# JVM, Memory, and Runtime

## When is an object eligible for garbage collection?

- It is eligible when no strong path reaches it from a GC root such as a live thread, static field, JNI reference, or another reachable object.
- Clearing a field helps only if it was the last strong reference. Static listeners and adapters commonly retain Activities and Views.

---

## Why is Java platform independent?

- Java source compiles to platform-neutral bytecode, and a compatible JVM executes that bytecode on the target operating system.
- The JVM and native dependencies still need to exist, so portability is not identical behavior everywhere.

---

## Why is `main` static?

- The JVM needs an entry point before an application object exists, so it invokes `public static void main(String[] args)` without constructing the class.

---

## What is garbage collection?

- The JVM reclaims objects unreachable from GC roots. Collection timing is controlled by the runtime, and GC does not close resources or fix leaks.

---

## Stack vs heap

- Each thread has its own call stack for frames and local references. The heap is shared by the process and stores objects and arrays.
- Deep recursion can overflow a stack; excessive allocation or retention can exhaust the heap. Exact layout is runtime-dependent.

---

## What is reflection?

- Reflection inspects classes, fields, methods, and constructors at runtime and can invoke them dynamically.
- It reduces compile-time safety and may add startup/runtime cost, especially on Android hot paths.

---

# Exceptions, I/O, and Serialization

## What are serialization and `transient`?

- Serialization converts object state into a storable or transferable representation. `transient` excludes an instance field from default Java serialization; it receives its default value during deserialization unless restored explicitly.
- Static fields are class state and are not serialized as object state. Do not treat `transient` as encryption, and do not serialize secrets or untrusted object graphs.

---

## `throw` vs `throws`

- `throw` raises an exception object. `throws` declares checked exceptions a method may pass to its caller.

```java
throw new IllegalArgumentException("invalid");

void read() throws IOException { }
```

---

## Can `finally` be skipped?

- Normally it runs after `try` or `catch`, including normal returns. It may not run if the process terminates, for example through `System.exit`, or the runtime fails abruptly.

---

## What is try-with-resources?

- It automatically closes each `AutoCloseable` declared in the `try` header, even when the body throws. Close failures are retained as suppressed exceptions.

```java
try (InputStream input = source.openStream()) {
    return input.read();
}
```

---

## What is externalization?

- `Externalizable` gives a class explicit control over serialized state through `writeExternal` and `readExternal`.
- It shifts compatibility, validation, and security responsibility to the developer, so explicit schemas are often clearer.

---

# Concurrency and Reactive Java

## `volatile` vs `AtomicInteger`

- `volatile` gives visibility and ordering for reads and writes, but not atomicity for `count++`. `AtomicInteger` provides atomic updates such as `incrementAndGet()`.

```java
volatile boolean running = true;
AtomicInteger count = new AtomicInteger();
```

---

## What are multithreading and `ThreadPoolExecutor`?

- Multithreading runs execution paths concurrently. `ThreadPoolExecutor` reuses worker threads and manages a queue, core/max sizes, keep-alive time, and rejection behavior.
- Bound queues when overload matters, define cancellation and rejection, and shut down owned pools.

---

## What does `synchronized` mean?

- It provides mutual exclusion through a monitor and visibility around lock acquisition and release. Only one thread can hold that monitor at a time.
- Keep critical sections small and use consistent lock ordering.

---

## What is a deadlock?

- Threads deadlock when each waits forever for a lock held by another. Consistent lock ordering, small critical sections, timeouts, and higher-level primitives reduce the risk.

---

## What are Looper, Handler and HandlerThread?

- A `Looper` processes a thread's message queue. A `Handler` posts work to a Looper. A `HandlerThread` is a thread that creates and runs its own Looper.
- A Handler does not create a thread. Remove callbacks and stop a HandlerThread when its owner is destroyed.

---

## RxJava observable types

- `Observable` is a stream without backpressure. `Flowable` supports backpressure. `Single` emits one success/error, `Maybe` emits zero or one value, and `Completable` emits completion/error only.
- Choose the smallest semantic type and dispose subscriptions at the lifecycle boundary.

---

## What are RxJava schedulers?

- Schedulers choose execution contexts. `io()` suits blocking I/O, `computation()` bounded CPU work, `single()` serial work, and a main-thread scheduler UI work. `subscribeOn` affects upstream subscription; `observeOn` changes downstream execution.

---

## What are RxJava subjects?

- A Subject is both observer and observable. `PublishSubject` sends to current subscribers, `BehaviorSubject` retains the latest value, `ReplaySubject` replays history, and `AsyncSubject` emits its final value after completion.
- Subjects introduce shared mutable state, so replay, threading, termination, and lifecycle must be explicit.

---

## What is backpressure?

- It is a producer-consumer capacity mismatch. `Flowable` can buffer, drop, keep the latest item, sample, or fail according to the chosen policy.

---

## Cold vs hot observable

- A cold source starts work for each subscriber. A hot source exists independently and broadcasts according to replay and buffering rules.

---

## What is `ExecutorService`?

- It accepts tasks and manages their execution through worker threads. It supports `Future` results, cancellation, and explicit shutdown.
- Define queueing, rejection, cancellation, and shutdown; do not leave owned pools running forever.

---

# Android and Java Interoperability

## `HashMap`, `ArrayMap` and `SparseArray` on Android

- `HashMap` is general-purpose. `ArrayMap` can use less memory for small maps but may be slower as the map grows. `SparseArray` avoids boxing for integer keys and suits small collections.
- Choose from measured size and access patterns rather than replacing every map mechanically.

---

## Why cannot an object reference cross Android processes?

- Processes have separate heaps and address spaces, so a pointer in one process is meaningless in another. IPC marshals data through `Parcelable`, `Bundle`, AIDL, or a content URI.
- Singletons and Application objects are not shared across processes.

---

## Why does Android steer you away from Java Serializable for performance-critical IPC and state?

- Java serialization uses reflection and temporary allocations, increasing CPU and GC pressure. Android handoffs generally use `Parcelable`/`@Parcelize`, a small `Bundle`, a database, or a URI.
- Do not pass large object graphs through an `Intent`; pass an ID and reload data.

---

# Design Patterns

## What is a design pattern?

- A design pattern is a named, reusable approach to a recurring design problem. Patterns are often grouped as creational, structural, and behavioral.
- Patterns are vocabulary and trade-offs, not mandatory templates; overuse creates indirection.

---

## Factory vs abstract factory

- A factory creates or selects one product implementation. An abstract factory creates a family of related products that should work together.

---

## What are creational patterns?

- They control object construction and separate clients from concrete creation details. Factory, Builder, Prototype, and Singleton are common examples.
- Builder helps with many optional parameters; Factory helps with selection; neither is automatically required.

---

## What are the drawbacks of Singleton?

- Global access hides dependencies, complicates tests, encourages process-lifetime state, and can create separate instances in separate processes.
- Thread-safe construction does not make global state a good architecture.

---
