# Java Interview Questions

## JVM, collections and memory

## Why does Android steer you away from Java Serializable for performance-critical IPC and state?

- Java serialization uses reflection and temporary allocations, increasing CPU and GC pressure. Android handoffs generally use `Parcelable`/`@Parcelize`, a small `Bundle`, a database, or a URI.
- Do not pass large object graphs through an `Intent`; pass an ID and reload data.

> **Interview answer:** "I avoid Java `Serializable` for large or performance-sensitive Android handoffs because it is reflection-heavy. I use `Parcelable` for small platform payloads and repository-backed state for larger data."

## How does `HashSet` work internally?

- `HashSet` is backed by a `HashMap`; the element is the key and a dummy value is stored. `hashCode()` selects a bucket and `equals()` resolves collisions.
- Order is not guaranteed. Mutating an element after insertion can make it unfindable if its hash changes. `null` is allowed once.

> **Interview answer:** "A `HashSet` is effectively a map of keys. Its expected `add` and `contains` cost is O(1), provided equality and hashing are stable."

## How does `ArrayList` grow?

- It stores elements in an array. When full, it allocates a larger array and copies elements. Appends are amortized O(1); middle insertion and removal are O(n).
- Growth policy is an implementation detail. Presize with `new ArrayList<>(capacity)` when the size is known.

> **Interview answer:** "`ArrayList` gives fast indexed access, but resizing occasionally costs O(n). I presize collections on hot paths when the expected size is predictable."

## `String`, `StringBuilder` and `StringBuffer`

- `String` is immutable. `StringBuilder` is mutable and unsynchronized, so it is the normal choice for single-threaded assembly. `StringBuffer` is synchronized and mainly legacy.
- Repeated concatenation in a loop creates intermediate strings; use a builder or join operation.

> **Interview answer:** "I use `String` for values, `StringBuilder` for repeated single-threaded assembly, and `StringBuffer` only when shared synchronization is genuinely required."

## `ConcurrentHashMap` vs `synchronizedMap`

- `synchronizedMap` uses one monitor for most operations. `ConcurrentHashMap` is designed for higher concurrency with finer-grained coordination and CAS where appropriate.
- Neither makes a multi-key workflow atomic, and `ConcurrentHashMap` rejects null keys and values.

> **Interview answer:** "I use `ConcurrentHashMap` for independent concurrent entries, but I design business-level atomicity separately for compound operations."

## When is an object eligible for garbage collection?

- It is eligible when no strong path reaches it from a GC root such as a live thread, static field, JNI reference, or another reachable object.
- Clearing a field helps only if it was the last strong reference. Static listeners and adapters commonly retain Activities and Views.

> **Interview answer:** "GC eligibility is based on reachability, not intent. I find the unexpected strong reference from a root and remove or scope it correctly."

## Why do `equals()` and `hashCode()` matter?

- Equal objects must return the same hash code. Hash collections use the hash to find a bucket and `equals()` to confirm the entry.
- Keep fields used by equality and hashing immutable while an object is a key.

> **Interview answer:** "The equality and hashing methods form one contract. Immutable keys prevent lost lookups and duplicate logical entries."

## `volatile` vs `AtomicInteger`

- `volatile` gives visibility and ordering for reads and writes, but not atomicity for `count++`. `AtomicInteger` provides atomic updates such as `incrementAndGet()`.
- **Example:** Use `volatile boolean running` as a stop flag and `AtomicInteger` for a shared counter.

> **Interview answer:** "`volatile` is for visibility; atomic types or locks are for read-modify-write operations and coordinated state changes."

## Weak, soft and phantom references

- Weak references do not keep objects alive. Soft references may be cleared under memory pressure but are not a reliable cache policy. Phantom references work with a queue for post-mortem tracking.
- They do not replace lifecycle ownership or cancellation.

> **Interview answer:** "These references alter reachability for specialized cases. I prefer explicit ownership and bounded caches over using them as a general leak fix."

## Why cannot an object reference cross Android processes?

- Processes have separate heaps and address spaces, so a pointer in one process is meaningless in another. IPC marshals data through `Parcelable`, `Bundle`, AIDL, or a content URI.
- Singletons and Application objects are not shared across processes.

> **Interview answer:** "Android IPC copies a representation of data, not a live heap reference. I keep payloads small and use a URI or durable storage for large data."

## How is double-checked locking made safe?

- Check outside the lock, check again inside it, and declare the instance `volatile` to prevent publication of a partially constructed object.
- In Android application code, dependency injection is usually easier to test and scope.

> **Interview answer:** "Correct double-checked locking needs a `volatile` instance and a second check under the lock. I normally prefer DI for application singletons."

## Core Java

## What are the main OOP concepts?

- Encapsulation protects state, abstraction exposes a useful contract, inheritance specializes a type, and polymorphism allows different implementations behind one contract.
- Inheritance should represent a genuine substitutable relationship, not just code reuse.

> **Interview answer:** "I use encapsulation and abstraction to protect invariants, polymorphism to vary behavior, and inheritance only when the subtype relationship is sound."

## What is an object?

- An object is a runtime instance with identity, state, and behavior defined by its class.

> **Interview answer:** "A class describes structure and behavior; an object is a concrete runtime instance of that class."

## What is inheritance?

- A subclass receives accessible behavior and state from a superclass and can specialize it. This supports polymorphism but couples the two types.
- Prefer composition when behavior should be replaceable independently.

> **Interview answer:** "Inheritance is useful for a stable is-a relationship and substitutability. I do not use it only as a reuse shortcut."

## What is composition over inheritance?

- Composition builds behavior from collaborating objects and models a has-a relationship. Dependencies can be replaced without changing a class hierarchy.
- **Example:** A `PaymentService` receives a `FraudChecker` instead of extending one concrete checker.

> **Interview answer:** "Composition reduces hierarchy coupling and works well with dependency injection and testing."

## What is an interface?

- An interface defines a contract that classes can implement. It cannot be instantiated, and a class can implement multiple interfaces. A marker interface has no abstract methods and communicates capability or metadata.

> **Interview answer:** "An interface expresses a capability or boundary without coupling clients to one implementation."

## What is a functional interface?

- It has exactly one abstract method, so it can be implemented with a lambda or method reference. `@FunctionalInterface` asks the compiler to enforce that rule.
- **Common types:** `Consumer` accepts input, `Predicate` returns a boolean, `Function` transforms a value, and `Supplier` produces a value.
- **Example:** `Predicate<String> valid = value -> !value.isBlank();`

> **Interview answer:** "A functional interface is a single-abstract-method contract used to pass behavior as a value."

## What is `Comparator`?

- `Comparator<T>` defines external ordering through `compare(a, b)`: negative means first, zero means equivalent for that ordering, and positive means second.
- Comparison must be transitive. Compose rules with `Comparator.comparing(...).thenComparing(...)`.

> **Interview answer:** "I use `Comparator` when a type needs multiple orderings or sorting logic should stay outside the model."

## What changed in interfaces in Java 8?

- Default methods let existing implementations inherit new behavior, helping evolve interfaces compatibly. Static interface methods belong to the interface and are not overridden.
- Conflicting default methods from two interfaces must be resolved by the implementing class.

> **Interview answer:** "Java 8 made interfaces more evolvable with default methods and added interface static methods. I keep defaults small because conflicts and hidden behavior can reduce clarity."

## Can interfaces be extended?

- Yes. An interface can extend one or more interfaces; a class uses `implements`. A class can extend only one class.

> **Interview answer:** "Interfaces support multiple inheritance of contracts, while Java avoids multiple inheritance of class state and implementation."

## Interface vs abstract class

| Interface | Abstract class |
|---|---|
| Contract or capability | Shared base type and partial implementation |
| A class can implement several | A class can extend one |
| No instance constructor | Can have constructors and state |
| Abstract, default and static methods | Concrete and abstract methods |

> **Interview answer:** "I choose an interface for a replaceable boundary and an abstract class when related subclasses need shared state or construction."

## What is encapsulation?

- Encapsulation keeps state and the operations that protect its invariants together, exposing only the access callers need.
- **Example:** Keep a balance private and expose `deposit` and `withdraw` methods that reject invalid transitions.

> **Interview answer:** "Encapsulation is not only private fields; it prevents callers from putting an object into an invalid state."

## What is polymorphism?

- Polymorphism lets one contract work with different implementations. Overloading is commonly compile-time polymorphism; overriding is runtime polymorphism.

> **Interview answer:** "Polymorphism lets callers depend on what an object can do rather than its concrete type, reducing coupling."

## Overriding vs overloading

| Overloading | Overriding |
|---|---|
| Same name, different parameters | Same compatible signature in a subtype |
| Resolved at compile time | Resolved at runtime |
| Does not require inheritance | Requires inheritance or implementation |
| Return type alone cannot distinguish it | Return type may be covariant |

> **Interview answer:** "Overloading adds compile-time entry points; overriding replaces inherited behavior while preserving a polymorphic contract."

## Why avoid calling an overridable method from a constructor?

- A subclass override can run before subclass fields and invariants are initialized, observing invalid state or calling methods that assume construction is complete.

> **Interview answer:** "Construction must establish the base before subclass behavior runs, so constructors should call private or final initialization helpers."

## Abstraction vs encapsulation

- Abstraction decides what the caller needs to know and exposes a simpler contract. Encapsulation controls access to the implementation and protects its state.

> **Interview answer:** "Abstraction is the external model; encapsulation is the boundary protecting the internal representation."

## What are serialization and `transient`?

- Serialization converts object state into a storable or transferable representation. `transient` excludes an instance field from default Java serialization; it receives its default value during deserialization unless restored explicitly.
- Static fields are class state and are not serialized as object state. Do not treat `transient` as encryption, and do not serialize secrets or untrusted object graphs.

> **Interview answer:** "I choose serialization based on the boundary. For Android IPC I prefer `Parcelable` or a URI, and for persistence I prefer an explicit schema. `transient` is only a field-inclusion rule."

## Why is Java platform independent?

- Java source compiles to platform-neutral bytecode, and a compatible JVM executes that bytecode on the target operating system.
- The JVM and native dependencies still need to exist, so portability is not identical behavior everywhere.

> **Interview answer:** "Java separates compilation from execution through bytecode and a platform-specific JVM."

## `throw` vs `throws`

- `throw` raises an exception object. `throws` declares checked exceptions a method may pass to its caller.
- **Example:** `throw new IllegalArgumentException("invalid");` versus `void read() throws IOException`.

> **Interview answer:** "`throw` is an action inside a method; `throws` is part of the method contract."

## Can `finally` be skipped?

- Normally it runs after `try` or `catch`, including normal returns. It may not run if the process terminates, for example through `System.exit`, or the runtime fails abruptly.

> **Interview answer:** "`finally` is best-effort cleanup. I use try-with-resources for closeable resources and persist critical state before termination."

## What are anonymous classes?

- An anonymous class declares and creates one object in the same expression. It is useful when an implementation needs multiple methods or state; lambdas are clearer for one-method contracts.

> **Interview answer:** "Anonymous classes are one-off implementations. I use a named class when behavior has meaningful identity or reuse."

## What is try-with-resources?

- It automatically closes each `AutoCloseable` declared in the `try` header, even when the body throws. Close failures are retained as suppressed exceptions.
- **Example:** `try (InputStream input = source.openStream()) { return input.read(); }`

> **Interview answer:** "Try-with-resources makes ownership explicit and prevents resource leaks more reliably than manual `finally` cleanup."

## Why is `main` static?

- The JVM needs an entry point before an application object exists, so it invokes `public static void main(String[] args)` without constructing the class.

> **Interview answer:** "`main` is static because it is the startup boundary and must be callable without an instance."

## What is garbage collection?

- The JVM reclaims objects unreachable from GC roots. Collection timing is controlled by the runtime, and GC does not close resources or fix leaks.

> **Interview answer:** "GC reclaims unreachable heap objects, but resource lifetime and lifecycle ownership must be explicit."

## Stack vs heap

- Each thread has its own call stack for frames and local references. The heap is shared by the process and stores objects and arrays.
- Deep recursion can overflow a stack; excessive allocation or retention can exhaust the heap. Exact layout is runtime-dependent.

> **Interview answer:** "Stack memory is thread-local execution state; heap memory holds shared object data."

## Constructors vs methods

- A constructor initializes a new instance and has no return type. A method performs behavior afterward and may be instance or static. Constructors are not inherited, though subclasses can call `super()`.

> **Interview answer:** "A constructor establishes initial invariants; a method represents an operation on the object or class."

## Instantiation vs initialization

- Instantiation creates an object instance. Initialization assigns fields and establishes its initial valid state, including constructor execution.

> **Interview answer:** "Instantiation answers which object was created; initialization answers what valid state it started with."

## Are Java objects passed by reference or value?

- Java always passes by value. For an object, the copied value is a reference, so a method can mutate the same object but cannot replace the caller's reference.

> **Interview answer:** "Java passes a copy of every argument. An object argument copy points to the same object, which explains visible mutations but failed reference swaps."

## `int` vs `Integer`, autoboxing and unboxing

- `int` is a primitive. `Integer` is a nullable wrapper used by generics and object APIs. Autoboxing converts `int` to `Integer`; unboxing does the reverse.
- Unboxing null throws `NullPointerException`, and unnecessary boxing can add allocation or overhead.

> **Interview answer:** "I use `int` for non-null numeric values and `Integer` when nullability or an object-based API is required."

## `==` vs `equals()`

- For primitives, `==` compares values. For object references, it compares identity. `equals()` compares logical equality according to the class contract.

> **Interview answer:** "I use `==` for primitives or intentional identity checks and `equals()` for object value equality."

## Why are strings immutable, and what is the string pool?

- A `String` cannot change after creation. Immutability supports safe sharing, stable hash codes, pooling, and simpler concurrency. The pool stores canonical literals and interned strings.
- `intern()` can reduce duplicates in a bounded set but can increase pool pressure. It never makes `==` a general content comparison.

> **Interview answer:** "String immutability improves safety and reuse. I use interning only when profiling supports it and use `equals()` for content."

## What does `final` mean, and what is `finalize()`?

- A final variable is assigned once, a final method cannot be overridden, and a final class cannot be extended. A final reference may still point to a mutable object. `finalize()` is an unreliable deprecated cleanup hook and should not manage resources.

> **Interview answer:** "`final` restricts reassignment or inheritance; it does not guarantee deep immutability. I use try-with-resources or explicit lifecycle methods instead of finalization."

## Static members and static method hiding

- Static members belong to the class, not an instance. Static methods cannot directly access instance state and cannot be overridden; a same-signature subclass method hides the parent method.
- Static mutable state behaves like global state and harms test isolation.

> **Interview answer:** "I use static members for stateless utilities or true class-wide constants. Application dependencies are usually clearer as injected, scoped objects."

## What is reflection?

- Reflection inspects classes, fields, methods, and constructors at runtime and can invoke them dynamically.
- It reduces compile-time safety and may add startup/runtime cost, especially on Android hot paths.

> **Interview answer:** "Reflection enables frameworks and tooling, but I prefer compile-time generation when safety, performance, or shrinker compatibility matters."

## What are multithreading and `ThreadPoolExecutor`?

- Multithreading runs execution paths concurrently. `ThreadPoolExecutor` reuses worker threads and manages a queue, core/max sizes, keep-alive time, and rejection behavior.
- Bound queues when overload matters, define cancellation and rejection, and shut down owned pools.

> **Interview answer:** "A pool separates task submission from thread management. I size it for the workload, make overload visible, and define shutdown and failure behavior."

## Fail-fast vs fail-safe iteration

- Many standard iterators are fail-fast on a best-effort basis and may throw `ConcurrentModificationException` after structural modification. Snapshot or concurrent collections provide a separate or weakly consistent view.

> **Interview answer:** "Fail-fast behavior exposes accidental modification, but it is not synchronization. Correctness needs a snapshot, lock, or concurrent collection."

## What does `synchronized` mean?

- It provides mutual exclusion through a monitor and visibility around lock acquisition and release. Only one thread can hold that monitor at a time.
- Keep critical sections small and use consistent lock ordering.

> **Interview answer:** "`synchronized` protects a critical section and provides visibility. I avoid nested locks where possible and consider higher-level concurrency tools."

## What is `Optional`?

- `Optional<T>` makes a possibly absent return value explicit and supports transformations and fallbacks without unchecked null handling.
- Avoid it for every field or local variable, and do not call `get()` without proving presence.

> **Interview answer:** "I mainly use `Optional` for return values where absence is expected, making the API contract explicit."

## What is externalization?

- `Externalizable` gives a class explicit control over serialized state through `writeExternal` and `readExternal`.
- It shifts compatibility, validation, and security responsibility to the developer, so explicit schemas are often clearer.

> **Interview answer:** "Externalization can control the serialized representation, but I use it only when that control justifies its maintenance cost."

## Cloning and shallow vs deep copy

- Cloning copies field values; a shallow copy shares nested references, while a deep copy recursively creates independent mutable state. The legacy `Cloneable` protocol is awkward, so copy constructors or factories are usually clearer.
- Deep copying can be expensive and ambiguous for shared resources; immutable nested data often removes the need.

> **Interview answer:** "The choice depends on ownership. I use shallow copies for immutable or intentionally shared children and deep copies when the new object must own independent mutable state."

## What are Java access scopes?

| Modifier | Same class | Same package | Subclass elsewhere | Other code |
|---|---|---|---|---|
| `public` | Yes | Yes | Yes | Yes |
| `protected` | Yes | Yes | Yes, through inheritance | No |
| package-private | Yes | Yes | No | No |
| `private` | Yes | No | No | No |

> **Interview answer:** "I default to the narrowest visibility that preserves the design because smaller visibility reduces coupling."

## Can private methods be overridden?

- No. Private methods are not inherited or visible to subclasses, so a same-named subclass method is unrelated.

> **Interview answer:** "Runtime overriding applies to inherited visible methods, not private implementation details."

## Why cannot a static method directly access an instance variable?

- A static method can run without an object, while an instance variable belongs to a particular object. It needs an explicit instance reference to read that value.

> **Interview answer:** "The class context has no implicit receiver; a static method can access instance state only through a supplied object."

## What is a deadlock?

- Threads deadlock when each waits forever for a lock held by another. Consistent lock ordering, small critical sections, timeouts, and higher-level primitives reduce the risk.

> **Interview answer:** "I prevent deadlocks by defining lock order, avoiding nested locks, and using thread dumps to confirm circular waiting."

## `List` vs `Set`

- A `List` preserves sequence and allows duplicates. A `Set` models unique membership according to its equality rules.

> **Interview answer:** "The collection should express the invariant: sequence implies `List`; uniqueness implies `Set`."

## `ArrayList` vs `Vector`

- Both are resizable arrays, but `Vector` synchronizes legacy methods while `ArrayList` does not. `ArrayList` is normally preferred; concurrency needs an appropriate concurrent collection or explicit lock.

> **Interview answer:** "I use `ArrayList` by default and choose synchronization based on the actual shared workflow, not merely the collection class."

## Common `Map` implementations

| Type | Ordering | Typical use |
|---|---|---|
| `HashMap` | No guaranteed order | Expected fast lookup |
| `LinkedHashMap` | Insertion/access order | Predictable iteration or LRU-like logic |
| `TreeMap` | Sorted by key | Ordered navigation and ranges |
| `Hashtable` | Legacy synchronized map | Compatibility only; no nulls |

> **Interview answer:** "I choose the map from the invariant: hashing for lookup, linked order for iteration, and a tree for sorted operations."

## `HashMap`, `ArrayMap` and `SparseArray` on Android

- `HashMap` is general-purpose. `ArrayMap` can use less memory for small maps but may be slower as the map grows. `SparseArray` avoids boxing for integer keys and suits small collections.
- Choose from measured size and access patterns rather than replacing every map mechanically.

> **Interview answer:** "I consider `ArrayMap` for small maps and `SparseArray` for integer keys, while keeping `HashMap` when scale or general keys matter. I verify with profiling."

## What are Looper, Handler and HandlerThread?

- A `Looper` processes a thread's message queue. A `Handler` posts work to a Looper. A `HandlerThread` is a thread that creates and runs its own Looper.
- A Handler does not create a thread. Remove callbacks and stop a HandlerThread when its owner is destroyed.

> **Interview answer:** "The Looper is the event loop, the Handler is the posting API, and HandlerThread packages a background thread with a Looper. New work often fits coroutines or executors better."

## Enumeration vs Iterator

- `Enumeration` is a legacy read-oriented API. `Iterator` is the modern traversal API and supports optional removal; `ListIterator` also moves in both directions and can update a list.

> **Interview answer:** "I use `Iterator` or modern collection APIs; `Enumeration` mainly appears in older APIs such as `Hashtable`."

## How does `HashMap` work?

- A key hash selects a bucket and equality identifies the matching entry among collisions. Modern implementations may treeify heavily collided buckets, but exact internals are implementation details.
- Expected lookup is O(1), but poor hashes, resizing, collisions, and mutable keys hurt performance or correctness.

> **Interview answer:** "`HashMap` combines hashing for fast candidate selection with equality for correctness. I use stable keys and a suitable initial capacity."

## Why use generics?

- Generics provide compile-time type safety and remove most casts. Type erasure means generic type information is limited at runtime.

> **Interview answer:** "Generics move type errors to compile time and make APIs self-documenting, while I remember that primitives need wrappers and runtime type checks are limited."

## RxJava observable types

- `Observable` is a stream without backpressure. `Flowable` supports backpressure. `Single` emits one success/error, `Maybe` emits zero or one value, and `Completable` emits completion/error only.
- Choose the smallest semantic type and dispose subscriptions at the lifecycle boundary.

> **Interview answer:** "RxJava types communicate cardinality and failure behavior. I use `Flowable` when a producer can outpace a consumer."

## What are RxJava schedulers?

- Schedulers choose execution contexts. `io()` suits blocking I/O, `computation()` bounded CPU work, `single()` serial work, and a main-thread scheduler UI work. `subscribeOn` affects upstream subscription; `observeOn` changes downstream execution.

> **Interview answer:** "Schedulers are execution policy, not a magic speed switch. I match them to the workload and trace the result."

## What are RxJava subjects?

- A Subject is both observer and observable. `PublishSubject` sends to current subscribers, `BehaviorSubject` retains the latest value, `ReplaySubject` replays history, and `AsyncSubject` emits its final value after completion.
- Subjects introduce shared mutable state, so replay, threading, termination, and lifecycle must be explicit.

> **Interview answer:** "Subjects are deliberate hot bridges, not a default state-management solution. I choose replay semantics from the consumer contract."

## What is backpressure?

- It is a producer-consumer capacity mismatch. `Flowable` can buffer, drop, keep the latest item, sample, or fail according to the chosen policy.

> **Interview answer:** "Backpressure needs a business policy: preserve every event, discard stale data, sample, or fail visibly."

## Cold vs hot observable

- A cold source starts work for each subscriber. A hot source exists independently and broadcasts according to replay and buffering rules.

> **Interview answer:** "Cold streams model per-subscriber work; hot streams model shared ongoing state or events."

## What is `ExecutorService`?

- It accepts tasks and manages their execution through worker threads. It supports `Future` results, cancellation, and explicit shutdown.
- Define queueing, rejection, cancellation, and shutdown; do not leave owned pools running forever.

> **Interview answer:** "An executor separates task submission from thread management. I size it deliberately and propagate failure and cancellation."

## What is a design pattern?

- A design pattern is a named, reusable approach to a recurring design problem. Patterns are often grouped as creational, structural, and behavioral.
- Patterns are vocabulary and trade-offs, not mandatory templates; overuse creates indirection.

> **Interview answer:** "I start with the simplest design and introduce a pattern only when it clarifies a recurring constraint or makes change safer."

## Factory vs abstract factory

- A factory creates or selects one product implementation. An abstract factory creates a family of related products that should work together.

> **Interview answer:** "Factory centralizes one creation decision; abstract factory keeps a compatible product family together. I avoid the latter without a real family."

## What are creational patterns?

- They control object construction and separate clients from concrete creation details. Factory, Builder, Prototype, and Singleton are common examples.
- Builder helps with many optional parameters; Factory helps with selection; neither is automatically required.

> **Interview answer:** "Creational patterns protect construction invariants or hide selection when direct construction has become difficult to evolve."

## What are the drawbacks of Singleton?

- Global access hides dependencies, complicates tests, encourages process-lifetime state, and can create separate instances in separate processes.
- Thread-safe construction does not make global state a good architecture.

> **Interview answer:** "A singleton can suit a truly process-wide resource, but I prefer dependency injection because it exposes dependencies, improves testability, and makes scope explicit."
