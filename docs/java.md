# Java Core (Senior Android / Backend-facing Java)

## Why does Android steer you away from Java Serializable for performance-critical IPC / state?

- **In plain words:** Java serialization uses reflection and creates many temporary objects → GC pressure + CPU. Android IPC favors Parcelable (code-generated with @Parcelize in Kotlin) or structured formats.
- **What to watch for:** Serializable is convenient for pure JVM server code; on Android it’s a common performance footgun.
- **Example:** Passing large lists between activities—use ViewModel + repository, not giant serialized blobs.


> **Parcelable for Android handoffs**; **Serializable** only with eyes open.

---

## JVM, collections & GC (senior interview deep-dives)

## How does **`HashSet`** work internally on the JVM?

- **In plain words:** `HashSet` is usually **backed by a `HashMap`**. The **set element** is the **map key**; the **value** is a **dummy** placeholder (a shared `Object` in OpenJDK). **Uniqueness** follows **map key** rules: **`hashCode()`** bucket + **`equals()`** for collisions.
- **How it works:** **Add** → map **`put(key, PRESENT)`**; **contains** → **`containsKey`**. Iteration order is **not** insertion order (unless **`LinkedHashSet`**).
- **What to watch for:** **Mutable** keys already in the set **break** the invariant if `hashCode` changes. **`null`** is allowed **once** in `HashSet` (one `null` key in backing map).
- **Example:** Wrong: add `mutable` DTO without stable `equals`/`hashCode` → mysterious duplicates/missing lookups.


> **`HashSet` ≈ `HashMap` keys only**—stable **`equals`/`hashCode`** are mandatory.

---

## How does **`ArrayList`** grow when you keep adding elements?

- **In plain words:** It keeps an **internal `Object[]`**. When **full**, it allocates a **larger array** and **copies** elements (**amortized** O(1) per add in typical analysis).
- **How it works:** **Default capacity** is **10** if you use the no-arg constructor (lazy allocation in some JDK versions until first add). Growth is **~1.5×** (newCapacity = oldCapacity + (oldCapacity >> 1)) in OpenJDK—**implementation detail**, not JLS-guaranteed.
- **What to watch for:** If you know **final size**, use **`ArrayList(initialCapacity)`** or **`ensureCapacity`** to avoid repeated **copy** churn on hot paths.
- **Example:** Parsing **100k** rows into list → construct with **`ArrayList(100_000)`**.


> Growth is **array replace + copy**—**presize** when you know **N**.

---

## **`String` vs `StringBuffer`** (and where does **`StringBuilder`** fit)?

- **In plain words:** **`String`** is **immutable**: “changes” create **new** objects. **`StringBuffer`** is **mutable** and **synchronized** (thread-safe, slower). **`StringBuilder`** is **mutable** and **not** synchronized—usual choice **inside** a single thread.
- **How it works:** Concatenation in loops on **`String`** builds many **intermediate** strings → **GC pressure**. **`StringBuilder`** appends into one **buffer** with **resize** like `ArrayList` of `char`/`byte` (encoding-dependent in modern JDK).
- **What to watch for:** Don’t use **`StringBuffer`** unless you truly share across threads; prefer **`StringBuilder`** or **`join`/formatters**.
- **Example:** Build SQL/debug blob in a **tight loop** → **`StringBuilder`**.


> **`String`** for **values**, **`StringBuilder`** for **single-thread assembly**, **`StringBuffer`** rarely.

---

## How does **`ConcurrentHashMap`** differ from a **`HashMap`** wrapped with **`synchronizedMap`**?

- **In plain words:** **`Collections.synchronizedMap`** uses **one lock** for **most** operations—simple but **coarse** contention. **`ConcurrentHashMap`** allows **high concurrency** with **finer-grained** locking / **CAS** (details **vary by JDK**).
- **How it works:** Readers and writers coordinate without locking the **entire** table in typical cases; **compound** actions (`putIfAbsent`, `compute`) are **atomic** for a **single** key.
- **What to watch for:** Still not a magic bullet for **multi-key** invariants—**check-then-act** across keys needs **extra** design (`ConcurrentHashMap` won’t fix that). **`null` keys/values** are **not** allowed (unlike `HashMap`).
- **Example:** **Shared** in-memory **cache** map updated from **many** threads.


> **`ConcurrentHashMap`** = **scalable concurrent map**; still design **atomicity** at **business** level.

---

## **When is my old `List` (or any object) eligible for garbage collection?** How does the **GC** “know”?

- **In plain words:** The GC doesn’t “know” your **intent**—it traces **strong reachability** from **GC roots** (running thread stacks, static fields, JNI roots, etc.). If your **list** (and its elements, if only reachable through it) is **not strongly reachable**, it can be collected.
- **How it works:** **Generational** collectors may **promote** long-lived objects to an **old** generation, but **eligibility** is still **unreachable from roots**. **`WeakReference`/`SoftReference`** change reachability rules for their **referents**.
- **What to watch for:** **Leaks** = **accidental** strong references (static, **anonymous inner** holding **Activity**, **listeners**). Clearing a field **`list = null`** only matters if that was the **last** strong ref.
- **Example:** Activity **finishes** but **`static`** holds the **adapter’s list** referencing **Views** → **not** collectable.


> GC collects what **cannot be reached** from **roots**—**break strong refs** to reclaim.

---

## **`equals` + `hashCode` contract**—why does it matter for **`HashMap`** / **`HashSet`**?

- **In plain words:** Equal objects (**`equals` true**) **must** have the **same** `hashCode` so buckets stay consistent. If you break it, **get/put** “lose” entries or duplicate logically-equal keys.
- **How it works:** **`put`** uses **`hashCode`** to pick a **bin**, then **`equals`** to disambiguate **collisions**. Changing a key **after insert** mutates **`hashCode`** → **lost** entry classic bug.
- **What to watch for:** **Data classes** help but **inheritance** + **equals** is tricky; prefer **composition** or **value types** for map keys.
- **Example:** Use **`userId: String`** or **`UUID`** as key, not **`User`** with **mutable** fields.


> **Equal → same hash**; **immutable** keys for **hash** collections.

---

## **`volatile` vs `AtomicInteger`**—when do you use which?

- **In plain words:** **`volatile`** gives **visibility** (happens-before) for **single** reads/writes of a variable—**not** atomic **`read-modify-write`** (e.g. `count++`). **`AtomicInteger`** (and friends) provides **CAS**-based **atomic** updates.
- **How it works:** **`volatile`** stops **CPU cache** surprises for that field; **`AtomicInteger.addAndGet`** is **one** atomic op from the caller’s perspective.
- **What to watch for:** **`volatile` + non-atomic compound logic** still races; for **counters** shared across threads, use **`Atomic*`** or **synchronization**.
- **Example:** **Flag** `volatile boolean running` for **shutdown** signal; **request counter** → **`LongAdder`/`AtomicLong`**.


> **`volatile` = visibility**; **`Atomic*`** = **atomic read-modify-write**.

---

## **WeakReference vs SoftReference vs PhantomReference** (Android/JVM interviews)

- **In plain words:** **`WeakReference`**: GC **may** clear referent when **only weakly** reachable—good for **caches** that should **not** keep memory alive. **`SoftReference`**: cleared **under memory pressure**—**softer** cache. **`PhantomReference`**: enqueued **after** finalization for **post-mortem** bookkeeping (rare in app code).
- **What to watch for:** **Weak** refs don’t replace **lifecycle** discipline; **Soft** cache behavior is **JVM-dependent**. **`Context`** in **`WeakReference`** is still a **smell** if you rely on it for **UI** correctness.
- **Example:** **`WeakReference<View>`** in image callbacks—still **cancel** work on **detach**.


> **Weak/soft** tweak **reachability** for **caches**—they don’t fix **lifecycle** bugs.

---

## Why can’t you pass a normal **object reference** to another **Android process**?

- **In plain words:** Each process has its **own heap** and **address space**. A **pointer** in process A is **meaningless** in process B. IPC copies **data** (`Parcelable`, `Bundle`, `AIDL`, `content://` streams)—not **live object graphs**.
- **What to watch for:** **Singletons** are **not** shared across processes; **`android:process`** duplicates **Application** instances.
- **Example:** Pass **`Bitmap`** via **`Parcelable`** (or URI + shared storage) across process boundaries—not a **reference**.


> **IPC = marshal data**, not **share heap pointers**.

---

## **Double-checked locking** for a singleton—what must you do for it to be safe?

- **In plain words:** First check **without** lock for speed; second check **inside** **`synchronized`** to avoid **two** instances. The **`instance` field must be `volatile`** (or other safe publication) so **partially constructed** objects aren’t visible.
- **What to watch for:** **Broken DCL** without **`volatile`** was a classic bug on older memory models. On Android/Kotlin prefer **DI-scoped** singletons.
- **Example:** `getInstance()` lazy singleton in **legacy** Java SDK glue.


> **DCL needs `volatile`** (or holder idiom)—prefer **DI** for app singletons.

---

## Core Java

## Explain OOP Concept.

- **In plain words:**

  Object-Oriented Programming is a methodology to design a program using classes, objects, [inheritance](https://en.wikipedia.org/wiki/Inheritance_(object-oriented_programming)), [polymorphism](https://en.wikipedia.org/wiki/Polymorphism_(computer_science)), [abstraction](https://en.wikipedia.org/wiki/Abstraction_(software_engineering)) and [encapsulation](https://en.wikipedia.org/wiki/Encapsulation_(computer_programming)).


### Useful links

- [inheritance](https://en.wikipedia.org/wiki/Inheritance_(object-oriented_programming)
- [polymorphism](https://en.wikipedia.org/wiki/Polymorphism_(computer_science)
- [abstraction](https://en.wikipedia.org/wiki/Abstraction_(software_engineering)
- [encapsulation](https://en.wikipedia.org/wiki/Encapsulation_(computer_programming)



> Object-Oriented Programming is a methodology to design a program using classes, objects, [inheritance](https://en.


---

## What is an Object?

- **In plain words:**

  An object is an instance of a class that has states and behaviors. A Class can be defined as a template that describes the behavior/state that the object of its type support.



> An object is an instance of a class that has states and behaviors.


---

## What is Inheritance?

- **In plain words:**

  Inheritance is the process by which objects of one class acquire the properties & objects of another class. The two most common reasons to use inheritance are:
    a) To promote code reuse.
    b) To use polymorphism.</br>



> Inheritance is the process by which objects of one class acquire the properties & objects of another class.


---

## Composition over inheritance?

- **In plain words:**

  Composition is typically "has a" or "uses a" relationship. In the below example, the Employee class has a Person. It does not inherit from Person but instead gets the Person object passed to it, which is why it is a "has a" Person.


### Code example

```
class Person {
   String Title;
   String Name;
   Int Age;

   public Person(String title, String name, String age) {
      this.Title = title;
      this.Name = name;
      this.Age = age;
   }
}

class Employee {
   Int Salary;
   private Person person;

   public Employee(Person p, Int salary) {
       this.person = p;
       this.Salary = salary;
   }
}
```


> Composition is typically "has a" or "uses a" relationship.


---

## What are Interfaces?

- **In plain words:**

  * Interfaces are only declared methods that an implementing class would need. 
     * Interfaces cannot be marked as final. Interface variables must be static or final. 
     * Interfaces cannot be instantiated directly.
     * **Marker Interfaces**: Marker interfaces are those which do not declare any required Methods. The java.io.Serializable interface is a typical marker interfaces. These do not contain any methods, but classes must implement this interface in order to be serialized and de-serialized.</br>



> Explain **What are Interfaces** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

## What is Functional Interface

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://www.geeksforgeeks.org/functional-interfaces-java/



> Bookmark **What is Functional Interface**, read the linked reference, and be ready to explain trade-offs with one example.


---

## What is Comparator Interface

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://www.geeksforgeeks.org/comparator-interface-java/



> Bookmark **What is Comparator Interface**, read the linked reference, and be ready to explain trade-offs with one example.


---

## Java 8 Changes in Interface

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://beginnersbook.com/2017/10/java-8-interface-changes-default-method-and-static-method/



> Bookmark **Java 8 Changes in Interface**, read the linked reference, and be ready to explain trade-offs with one example.


---

## Can Interfaces to be extended?

- **In plain words:**

  Yes, an interface can extend other interfaces. it supports multiple inheritances, which means it can extend more than one interface, but every class which wants to use an interface must add it by keyword `implements` and using the keyword `extends` for interfaces in classes is illegal and cause compile error.



> Yes, an interface can extend other interfaces.


---

## Difference between abstract and interface?

- **In plain words:**

  | Interface     | Abstract class     |
    | :------------- | :------------- |
    | Support multiple inheritances | Does not support multiple inheritances |
    | Can extends another interfaces only | Can extends another class and implement multiple interfaces |
    | Does not contain data member | Contains data member |
    | Does not contains constructors | contains constructors  |
    | In Java Contains only incomplete member (signature of member) | Contains both signature (abstract) of method and member functions |
    | Cannot have access modifiers by default and everything is assumed as public | Can has access modifiers for subs, methods and fields |



> | Interface | Abstract class | | :------------- | :------------- | | Support multiple inheritances | Does not support multiple inheritances | | Can extends another interfaces only | Can extends another class and implemen…


---

## Does Java support multiple inheritance?

- **In plain words:**

  Java supports multiple inheritance by interface only since it can implement multiple interfaces but can extend only one class.</br>



> Java supports multiple inheritance by interface only since it can implement multiple interfaces but can extend only one class.


---

## What is Encapsulation?

- **In plain words:**

  - Encapsulation involves binding code and data together as a single unit. 
     - Encapsulation is a technique used for hiding the properties and behaviors of an object and allowing outside access only as appropriate. It prevents other objects from directly altering or accessing the properties or methods of the encapsulated object. 
     - For instance, a class can be an encapsulated class if all the variables in it are defined as Private and by providing getter and setter methods.
     - The fields of a class can be made read-only or write-only.
     - A class can have total control over what is stored in its fields.



> Explain **What is Encapsulation** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

## What is Abstract class?

- **In plain words:**

  * Abstract classes are classes that contain one or more abstract methods. An abstract method is a method that is declared, but contains no implementation. 
     * If even a single method is abstract, the whole class must be declared abstract.
     * Abstract classes may not be instantiated, and require subclasses to provide implementations for the abstract methods.
     * You can’t mark a class as both abstract and final.
     * Non-abstract methods can access a method that you declare as abstract.</br>



> Explain **What is Abstract class** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

## What is Polymorphism?

- **In plain words:**

  The word polymorphism means having many forms. In simple words, we can define polymorphism as the ability of a message to be displayed in more than one form. In Java polymorphism is mainly divided into two types: compile-time and runtime polymorphism.



> The word polymorphism means having many forms.


---

## What is the difference between static and dynamic Polymorphism?

- **In plain words:**

  *method overloading* represents a *static* form of polymorphism. method overloading means using two or more functions with same name but with the different parameters. Static polymorphism is resolved on compile-time and that is why it's called static. An example of this would be as follow:


    *method overriding* represents a *dynamic* form of polymorphism. It is a process in which a function call to the overridden method is resolved at Runtime. It is also known as *Dynamic Method Dispatch*. dynamic polymorphism is resolved at runtime. An example of this would be as follow:


    Output:


### Code example

```java
    class StaticPolymorphismTest {

      public int multiply(int a, int b) {
        return a * b;
      }

      public double multiply(double a, double b) {
        return a * b;
      }

    }
  ```

  ```java
  class Parent {

    void Print()
    {
        System.out.println("parent class");
    }
  }

  class subclass1 extends Parent {

    void Print()
    {
        System.out.println("subclass1");
    }
  }

  class subclass2 extends Parent {

    void Print()
    {
        System.out.println("subclass2");
    }
  }

  class TestPolymorphism3 {

    public static void main(String[] args){

        Parent a;

        a = new subclass1();
        a.Print();

        a = new subclass2();
        a.Print();
    }
  }
  ```

  ```
  subclass1
  subclass2
  ```


> *method overloading* represents a *static* form of polymorphism.


---

## What is the difference between overriding and overloading?

- **In plain words:**

  | Method Overloading      | Method Overriding     |
    | :-------------   | :------------- |
    | Method overloading is a compile time polymorphism.         | Method overriding is a run time polymorphism.       |
    | It help to rise the readability of the program. | While it is used to grant the specific implementation of the method which is already provided by its parent class or super class. |
    | It is occur within the class.	 | 	While it is performed in two classes with inheritance relationship. |
    | Method overloading may or may not require inheritance. | While method overriding always needs inheritance. |
    | In this, methods must have same name and different signature. | While in this, methods must have same name and same signature. |
    | In method overloading, return type can or can not be be same, but we must have to change the parameter. | While in this, return type must be same or co-variant. |



> | Method Overloading | Method Overriding | | :------------- | :------------- | | Method overloading is a compile time polymorphism.


---

## Why would you not call abstract method in constructor?

- **In plain words:**

  The problem is that the class is not yet fully initialized and when the method is called in a subclass, it may cause trouble.</br>



> The problem is that the class is not yet fully initialized and when the method is called in a subclass, it may cause trouble.


---

## Difference between Encapsulation & Abstraction?

- **In plain words:**

  * **Abstraction** focuses on the outside view of an object (i.e. the interface) 
     * **Encapsulation** (information hiding) prevents clients from seeing it’s inside view. 
     * Abstraction solves the problem in the design side while Encapsulation is the Implementation.</br>



> Explain **Difference between Encapsulation & Abstraction** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

## What is serialization? How do you implement it?

- **In plain words:**

  Serialization is the process of converting an object into a stream of bytes in order to store an object into memory so that it can be recreated at a later time while still keeping the objects original state and data. In Java there are two methods of doing this, one is by implementing Serializable or Parcelable. In Android, however, Serializable should never be used in Android. Parcelable was created to be more efficient then Serializable, and performs about 10x faster then Serializable because Serializable uses reflection which is a slow process and tends to create a lot of temporary objects which may cause garbage collection to occur more often.



> Serialization is the process of converting an object into a stream of bytes in order to store an object into memory so that it can be recreated at a later time while still keeping the objects original state and data.


---

## What is Transient Keyword?

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://www.geeksforgeeks.org/transient-keyword-java/



> Bookmark **What is Transient Keyword**, read the linked reference, and be ready to explain trade-offs with one example.


---

## Why is Java said to be platform independent?

- **In plain words:**

  The execution of the code does not depend upon the OS



> The execution of the code does not depend upon the OS


---

## Difference between ‘throw’ and ‘throws’ in Java Exception Handling?

- *(No additional notes in source.)*


### Code example

```throw``` keyword is used to throw Exception from any method or static block whereas ```throws``` is used to indicate that which Exception can possibly be thrown by this method.


> ```throw``` keyword is used to throw Exception from any method or static block whereas ```throws``` is used to indicate that which Exception can possibly be thrown by this method.


---

## Is there ever a scenario where we can skip the finally block in a try catch?

- **In plain words:**

  By Calling System.exit(0) in try or catch block, we can skip the finally block. System.exit(int) method can throw a SecurityException. If System.exit(0) exits the JVM without throwing that exception then finally block will not execute. But, if System.exit(0) does throw security exception then finally block will be executed.</br>



> By Calling System.exit(0) in try or catch block, we can skip the finally block. System.exit(int) method can throw a SecurityException. If System.exit(0) exits the JVM without throwing that exception then finally block wi…


---

## What are anonymous classes?

- **In plain words:**

  * An anonymous class is just what its name implies -- it has no name. It combines the class declaration and the creation of an instance of the class in one step. Since anonymous classes have no name, objects can not be instantiated from outside the class in which the anonymous class is defined. In fact, an anonymous object can only be instantiated from within the same scope in which it is defined.
     * Rules:
        * An anonymous class must always extend a super class or implement an interface but it cannot have an explicit extends or implements clause.
        * An anonymous class must implement all the abstract methods in the super class or the interface.
        * An anonymous class always uses the default constructor from the super class to create an instance.
        * Example:


### Code example

``` 
      MyButton.setOnClickListener(new Button.OnClickListener {
             @override
                public void onClick(View view){
                    //some code
                }
         });
 </br>


> Explain **What are anonymous classes** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

## What is Java Try with Resources?

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- http://tutorials.jenkov.com/java-exception-handling/try-with-resources.html



> Bookmark **What is Java Try with Resources**, read the linked reference, and be ready to explain trade-offs with one example.


---

## What are the Java 8 Interface changes?

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://beginnersbook.com/2017/10/java-8-interface-changes-default-method-and-static-method/



> Bookmark **What are the Java 8 Interface changes**, read the linked reference, and be ready to explain trade-offs with one example.


---

## What is Function Interface?

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://www.geeksforgeeks.org/functional-interfaces-java/



> Bookmark **What is Function Interface**, read the linked reference, and be ready to explain trade-offs with one example.


---

## Why is the main method static in java?

- **In plain words:**

  * The method is static because otherwise there would be ambiguity on which method to be called. If static is removed from the main method, Program compiles successfully . But at runtime throws an error “NoSuchMethodError”.
     * We can overload the main method in Java. But the program doesn’t execute the overloaded main method when we run your program, we need to call the overloaded main method from the actual main method only. To run a method without calling this main method, we would need to execute a static block.
     * In order to avoid NoSuchMethodError, we can call System.exit(0) after the static method.
     * Note: Any method declared static will be executed even before the main class is executed.
     * Example:
     </br>


### Code example

```java
public class Hello {
    static {
        System.out.println("Hello, World!");
    }
}
```


> Explain **Why is the main method static in java** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

## What is garbage collector? How does it work?

- **In plain words:**

  All objects are allocated on the heap area managed by the JVM. As long as an object is being referenced, the JVM considers it alive. Once an object is no longer referenced and therefore is not reachable by the application code, the garbage collector removes it and reclaims the unused memory.</br>



> All objects are allocated on the heap area managed by the JVM.


---

## Difference between stack memory & heap memory?

- **In plain words:**

  * Stack is used for static memory allocation and Heap for dynamic memory allocation, both stored in the computer's RAM .
      * Heap memory is used by all the parts of the application whereas stack memory is used only by one thread of execution.
      * Whenever an object is created, it’s always stored in the Heap space and stack memory contains the reference to it. Stack memory only contains local primitive variables and reference variables to objects in heap space.
      * Objects stored in the heap are globally accessible whereas stack memory can’t be accessed by other threads.
      * Memory management in stack is done in LIFO manner whereas it’s more complex in Heap memory because it’s used globally. Heap memory is divided into Young-Generation, Old-Generation etc, more details at Java Garbage Collection.
      * Stack memory is short-lived whereas heap memory lives from the start till the end of application execution.
      * When stack memory is full, Java runtime throws java.lang.StackOverFlowError whereas if heap memory is full, it throws java.lang.OutOfMemoryError: Java Heap Space error.
      * Stack memory size is very less when compared to Heap memory. Because of simplicity in memory allocation (LIFO), stack memory is very fast when compared to heap memory.</br>



> Explain **Difference between stack memory & heap memory** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

## Constructors vs Methods?

- **In plain words:**

  * **Constructors** must have the name as the class name and does not have a return type. It can be used to instantiate any objects in the class whereas methods have no such rule and is another member of the class. Constructors cannot be inherited but a derived class can call the super constructor of parent class.
     * ```this()```: Constructors use this to refer to another constructor in the same class with a different parameter list.
     * ```super()```: Constructors use super to invoke the superclass's constructor.
     * **Methods**: Instance methods on the other hand require an instance of the class to exist before they can be called, so an instance of a class needs to be created by using the new keyword. Class methods are methods which are declared as static. The method can be called without creating an instance of the class</br>



> Explain **Constructors vs Methods** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

## What is the difference between instantiation and initialization of an object?

- **In plain words:**

  * **Initialization** is the process of the memory allocation, when a new variable is created. Variables should be explicitly given a value, otherwise they may contain a random value that remained from the previous variable that was using the same memory space. To avoid this problem, Java language assigns default values to data types.
     * **Instantiation** is the process of explicitly assigning definitive value to a declared variable.</br>



> Explain **What is the difference between instantiation and initialization of an object** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

## Do objects get passed by reference or value in Java? Elaborate on that.

- **In plain words:**

  * Java is always pass-by-value. When we pass the value of an object, we are passing the reference to it. 
     * Java creates a copy of the variable being passed in the method and then does the manipulations. Hence the change is not reflected in the main method.
     * But when you pass an object reference into a method, a copy of this reference is made, so it still points to the same object. This means, that any changes that you make to the insides of this object are retained, when the method exits.
     * Java copies and passes the reference by value, not the object. Thus, method manipulation will alter the objects, since the references point to the original objects. But since the references are copies, swaps will fail.</br>



> Explain **Do objects get passed by reference or value in Java? Elaborate on that** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

## Primitives in Java?

- **In plain words:**

  <a href="https://github.com/anitaa1990/Android-Cheat-sheet/blob/master/media/2.png" target="_blank"><img src="https://github.com/anitaa1990/Android-Cheat-sheet/blob/master/media/2.png"></a></br>


### Useful links

- https://github.com/anitaa1990/Android-Cheat-sheet/blob/master/media/2.png



> Bookmark **Primitives in Java**, read the linked reference, and be ready to explain trade-offs with one example.


---

## Difference between == and .equals() method in Java?

- **In plain words:**

  - The `equals()` method compares two strings, character by character, to determine equality.
    - The `==` operator checks to see whether two object references refer to the same instance of an object



> Explain **Difference between == and .equals() method in Java** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

## Why strings are Immutable?

- **In plain words:**

  Once a value is assigned to a string it cannot be changed. And if changed, it creates a new object of the String. This is not the case with StringBuffer.</br>



> Once a value is assigned to a string it cannot be changed.


---

## What is String.intern()? When and why should it be used?

- **In plain words:**

  * String.intern() method can be used to to deal with String duplication problem in Java. By carefully using the intern() method you can save a lot of memories consumed by duplicate String instances. A string is duplicate if it contains the same content as another string but occupied different memory location.
     * By calling  the intern() method on a string object, for instance “abc”, you can instruct JVM to put this String in the pool and whenever someone else creates "abc", this object will be returned instead of creating a new object. This way, you can save a lot of memory in Java, depending upon how many Strings are duplicated in your program.
     * When the intern method is invoked, if the String pool already contains that String object such that equals() return true, it will return the String object from the pool, otherwise it will add that object to the pool of unique String.</br>



> Explain **What is String.intern()? When and why should it be used** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

## String pool in Java:

- **In plain words:**

  * String Pool in java is a pool of Strings stored in Java Heap Memory. 
     * When we use double quotes to create a String, it first looks for String with same value in the String pool, if found it just returns the reference else it creates a new String in the pool and then returns the reference.
     * However using new operator, we force String class to create a new String object in heap space. We can use intern() method to put it into the pool or refer to other String object from string pool having same value.
     * For example, how many strings are getting created in below statement;


### Code example

``` String str = new String("Cat");```
   * In above statement, either 1 or 2 string will be created. If there is already a string literal “Cat” in the pool, then only one string “str” will be created in the pool. If there is no string literal “Cat” in the pool, then it will be first created in the pool and then in the heap space, so total 2 string objects will be created.</br>


> Explain **String pool in Java:** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

## <i>Final</i> modifier?

- **In plain words:**

  * Final modifiers - once declared cannot be modified. A blank final variable in Java is a final variable that is not initialized during declaration. 
        * final Classes- A final class cannot have subclasses.
        * final Variables- A final variable cannot be changed once it is initialized.
        * final Methods- A final method cannot be overridden by subclasses.</br>


### Code example

```java
   final public class CantOverrideClass {
     public final void cantOverrideMethod(){}
   }
   ```


> Explain **Final modifier** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

## <i>Finalize</i> keyword?

- **In plain words:**

  `finalize()` method is a protected and non-static method of java.lang.Object class. This method will be available in all objects you create in java. This method is used to perform clean up processing just before object is garbage collected. you can override the `finalize()` method to keep those operations you want to perform before an object is destroyed. Here is the general form of `finalize()` method.


### Code example

```java
  protected void finalize() throws Throwable {
    //Keep some resource closing operations here
  }
  ```


> `finalize()` method is a protected and non-static method of java.


---

## <i>Finally</i> keyword?

- **In plain words:**

  finally is a code block and is used to place important code, it will be executed whether exception is handled or not.</br>



> finally is a code block and is used to place important code, it will be executed whether exception is handled or not.


---

## What is a static variables in Java?

- **In plain words:**

  static is a non-access modifier in Java which is applicable for the following:
      - blocks
      - variables
      - methods
      - nested classes

    Variables that have only one copy per class are known as static variables. When a variable is declared as static, then a single copy of variable is created and shared among all objects at class level. Static variables are, essentially, global variables. </br>

    Important points for static variables:
      - We can create static variables at class-level only. See [here](https://www.geeksforgeeks.org/g-fact-47/)
      - static block and static variables are executed in order they are present in a program.


### Useful links

- [here](https://www.geeksforgeeks.org/g-fact-47/)



> static is a non-access modifier in Java which is applicable for the following: - blocks - variables - methods - nested classes Variables that have only one copy per class are known as static variables.


---

## Overriding for static method, possible?

- **In plain words:**

  quick response: no! </br>

    Inheritance comes from object-oriented principles, all of OOP principles needs objects to apply on. when we talk about inheritance, it means we deal with some objects which have relationships with each other. Besides, "overriding" is a feature of OOP principle which is related to run-time polymorphism. The implementation to be executed is decided at run-time and the decision is made according to the object used for the call.

    On the other hand, static methods belong to the class not object. So we use static methods without the need for creating an instance of a class. Besides, static methods are resolved in compile-time. Hence the answer is 'NO'.



> quick response: no! Inheritance comes from object-oriented principles, all of OOP principles needs objects to apply on.


---

## What is reflection?

- **In plain words:**

  Java Reflection makes it possible to inspect classes, interfaces, fields and methods at runtime, without knowing the names of the classes, methods etc. at compile time. It is also possible to instantiate new objects, invoke methods and get/set field values using reflection.</br>



> Java Reflection makes it possible to inspect classes, interfaces, fields and methods at runtime, without knowing the names of the classes, methods etc.


---

## Multi threading?

- **In plain words:**

  Multiple tasks are running concurrently in a program.</br>



> Multiple tasks are running concurrently in a program.


---

## What is a ThreadPoolExecutor?

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://blog.mindorks.com/threadpoolexecutor-in-android-8e9d22330ee3



> Bookmark **What is a ThreadPoolExecutor**, read the linked reference, and be ready to explain trade-offs with one example.


---

## Fail-fast & Fail-Safe?

- **In plain words:**

  * Fail-fast Iterators throws ConcurrentModificationException when one Thread is iterating over collection object and other thread structurally modify Collection either by adding, removing or modifying objects on underlying collection. They are called fail-fast because they try to immediately throw Exception when they encounter failure. 
     * On the other hand [fail-safe](http://javarevisited.blogspot.com/2011/10/java-iterator-tutorial-example-list.html) Iterators works on copy of collection instead of original collection.</br>


### Useful links

- [fail-safe](http://javarevisited.blogspot.com/2011/10/java-iterator-tutorial-example-list.html)



> Explain **Fail-fast & Fail-Safe** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

## What does the keyword synchronized mean?

- **In plain words:**

  * When you have two threads that are reading and writing to the same 'resource', say a variable named 'test', you need to ensure that these threads access the variable in an atomic way. Without the synchronized keyword, your thread 1 may not see the change thread 2 made to test.
     * **synchronized** blocks the next thread's call to method as long as the previous thread's execution is not finished. Threads can access this method one at a time.</br>



> Explain **What does the keyword synchronized mean** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

## What does the keyword volatile mean?

- **In plain words:**

  * Suppose two threads are working on a method. If two threads run on different processors each thread may have its own local copy of variable. If one thread modifies its value the change might not reflect in the original one in the main memory instantly. 
     * Now the other thread is not aware of the modified value which leads to data inconsistency.Essentially, volatile is used to indicate that a variable's value will be modified by different threads. “volatile” tells the compiler that the value of a variable must never be cached as its value may change outside of the scope of the program itself.
     * The value of this variable will never be cached thread-locally: all reads and writes will go straight to "main memory"
     * An access to a volatile variable never has the potential to block: we're only ever doing a simple read or write, so unlike a synchronized block we will never hold on to any lock.</br>



> Explain **What does the keyword volatile mean** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

## Optionals in Java?

- **In plain words:**

  Optional is a container object which is used to contain not-null objects. Optional object is used to represent null with absent value. This class has various utility methods to facilitate code to handle values as ‘available’ or ‘not available’ instead of checking null values.</br>



> Optional is a container object which is used to contain not-null objects.


---

## What is externalization?

- **In plain words:**

  * In serialization, the JVM is responsible for the process of writing and reading objects. This is useful in most cases, as the programmers do not have to care about the underlying details of the serialization process.
     * However, the default serialization does not protect sensitive information such as passwords and credentials.
     * Thus externalization comes to give the programmers full control in reading and writing objects during serialization.
     * Implement the java.io.Externalizable interface - then you implement your own code to write object’s states in the ```writeExternal()``` method and read object’s states in the ```readExternal()``` method.</br>



> Explain **What is externalization** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

## What is an object cloning? can you use clone() method of every object?

- **In plain words:**

  Object cloning refers to creation of exact copy of an object. It creates a new instance of the class of current object and initializes all its fields with exactly the contents of the corresponding fields of this object. Every class that implements `clone()` methods should call super.clone() to obtain the cloned object reference. Also it must implement java.lang.Cloneable interface otherwise it will throw CloneNotSupportedException when clone method is called on that class’s object.


### Code example

```java
protected Object clone() throws CloneNotSupportedException {
    return super.clone();
}
```


> Object cloning refers to creation of exact copy of an object.


---

## What is the difference between Shallow copy and deep copy?

- **In plain words:**

  - **Shallow copy**: is method of copying an object and is followed by default in cloning. In this method the fields of an old object X are copied to the new object Y. While copying the object type field the reference is copied to Y i.e object Y will point to same location as pointed out by X. If the field value is a primitive type it copies the value of the primitive type.
    Therefore, any changes made in referenced objects in object X or Y will be reflected in other object.
    Output:

    - **Deep Copy**: If we want to create a deep copy of object X and place it in a new object Y then new copy of any referenced objects fields are created and these references are placed in object Y. This means any changes made in referenced object fields in object X or Y will be reflected only in that object and not in the other.

      A deep copy copies all fields, and makes copies of dynamically allocated memory pointed to by the fields. A deep copy occurs when an object is copied along with the objects to which it refers.

      Output:


### Code example

Shallow copy (shared nested object):

```java
class Test {
    int x, y;
}

// Contains a reference of Test and implements clone with shallow copy.
class Test2 implements Cloneable {
    int a;
    int b;
    Test c = new Test();

    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}

public class Main {

    public static void main(String args[]) throws CloneNotSupportedException {
        Test2 t1 = new Test2();
        t1.a = 10;
        t1.b = 20;
        t1.c.x = 30;
        t1.c.y = 40;

        Test2 t2 = (Test2) t1.clone();
        t2.a = 100;
        t2.c.x = 300;

        System.out.println(t1.a + " " + t1.b + " " + t1.c.x + " " + t1.c.y);
        System.out.println(t2.a + " " + t2.b + " " + t2.c.x + " " + t2.c.y);
    }
}
```

```text
10 20 300 40
100 20 300 40
```

Deep copy (clone nested object):

```java
class Test {
    int x, y;
}

class Test2 implements Cloneable {
    int a, b;
    Test c = new Test();

    public Object clone() throws CloneNotSupportedException {
        Test2 t = (Test2) super.clone();
        t.c = new Test();
        return t;
    }
}

public class Main {

    public static void main(String args[]) throws CloneNotSupportedException {
        Test2 t1 = new Test2();
        t1.a = 10;
        t1.b = 20;
        t1.c.x = 30;
        t1.c.y = 40;

        Test2 t3 = (Test2) t1.clone();
        t3.a = 100;
        t3.c.x = 300;

        System.out.println(t1.a + " " + t1.b + " " + t1.c.x + " " + t1.c.y);
        System.out.println(t3.a + " " + t3.b + " " + t3.c.x + " " + t3.c.y);
    }
}
```

```text
10 20 30 40
100 20 300 0
```


> Explain **What is the difference between Shallow copy and deep copy** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

## Object scopes?

- **In plain words:**

  `public` , `protected` , default (no modifier) , `private`

    | Modifier     | Package     | Subclass     | World     |
    | :------------- | :------------- | :------------- | :------------- |
    | Public       | Yes       | Yes       | Yes       |
    | protected       | Yes      | Yes       | No       |
    | Default (no modifier)       | Yes       | No       | No       |
    | private       | No       | No       | No       |



> `public` , `protected` , default (no modifier) , `private` | Modifier | Package | Subclass | World | | :------------- | :------------- | :------------- | :------------- | | Public | Yes | Yes | Yes | | protected | Yes |…


---

## Override private methods, possible?

- **In plain words:**

  No, a private method cannot be overridden since it is not visible from any other class.



> No, a private method cannot be overridden since it is not visible from any other class.


---

## why access to the non-static variable is not allowed from static method in Java?

- **In plain words:**

  because non-static variable are associated with a specific instance of an object while static is not associated with any instance.



> because non-static variable are associated with a specific instance of an object while static is not associated with any instance.


---

## What is the difference between int and Integer?

- **In plain words:**

  `int` is a primitive type, while `Integer` is class with a single field of type `int`. Variables of type `int` store the avtual binary value for the integer. Variables of type `Integer` store references to `Integer` objects, just as with any other reference (object) type. The `Integer` class is used where you need an `int` to be treated like any other object, such as in generic types or situations where you need nullability.



> `int` is a primitive type, while `Integer` is class with a single field of type `int`.


---

## What are Autoboxing and unboxing?

- **In plain words:**

  - **Autoboxing:** Converting a primitive value into an object of the corresponding wrapper class is called autoboxing. For example, converting `int` to `Integer` class.
    - **Unboxing:**  Converting an object of a wrapper type to its corresponding primitive value is called unboxing. For example conversion of `Integer` to `int`.



> Explain **What are Autoboxing and unboxing** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

## What is the `hashCode()` used for?

- **In plain words:**

  `hashcode()` returns the hashcode value as an Integer. Hashcode value is mostly used in hashing based collections like HashMap, HashSet, HashTable….etc. According to the official documentation, The general contract of `hashCode()` is:
      - Whenever it is invoked on the same object more than once during an execution of a Java application, the hashCode method must consistently return the same integer, provided no information used in equals comparisons on the object is modified. This integer need not remain consistent from one execution of an application to another execution of the same application.
      - If two objects are equal according to the equals(Object) method, then calling the hashCode method on each of the two objects must produce the same integer result.
      - It is not required that if two objects are unequal according to the equals(java.lang.Object) method, then calling the hashCode method on each of the two objects must produce distinct integer results. However, the programmer should be aware that producing distinct integer results for unequal objects may improve the performance of hashtables.



> `hashcode()` returns the hashcode value as an Integer.


---

## What are "annotations"?

- **In plain words:**

  Java annotations are used to provide meta data for your Java code. Being meta data, Java annotations do not directly affect the execution of your code, although some types of annotations can actually be used for that purpose. [read more](http://tutorials.jenkov.com/java/annotations.html)


### Useful links

- [read more](http://tutorials.jenkov.com/java/annotations.html)



> Java annotations are used to provide meta data for your Java code.


---

## What is a deadlock in Java

- **In plain words:**

  * A deadlock occurs when a thread enters a waiting state because a requested system resource is held by another waiting process, which in turn is waiting for another resource held by another waiting process.
     * [Example on how deadlock occurs](/src/deadlock/ThreadLockDemo.java)
     * [Example on how to prevent deadlock](/src/deadlock/ThreadLockFixedDemo.java)</br>



> Explain **What is a deadlock in Java** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

## What is the List interface & Set interface?

- **In plain words:**

  * List interface supports for ordered collection of objects and it may contain duplicates. The Set interface provides methods for accessing the elements of a finite mathematical set. Sets do not allow duplicate elements</br>



> Explain **What is the List interface & Set interface** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

## Difference between ArrayList & Vectors?

- **In plain words:**

  * Vectors are thread safe (synchronized) whereas arraylists are not. So performance of arraylists are better than vectors.    * In ArrayList, you have to start searching for a particular element from the beginning of an Arraylist. But in the Vector, you can start searching for a particular element from a particular position in a vector. This makes the search operation in Vector faster than in ArrayList. Vectors have a default size of 10 whereas arraylists size can be dynamic. 
     * **Insertion and deletion in ArrayList is slow compared to LinkedList?**
         * ArrayList internally uses an array to store the elements, when that array gets filled by inserting elements a new array of roughly 1.5 times the size of the original array is created and all the data of old array is copied to new array.
         * During deletion, all elements present in the array after the deleted elements have to be moved one step back to fill the space created by deletion. In linked list data is stored in nodes that have reference to the previous node and the next node so adding element is simple as creating the node and updating the next pointer on the last node and the previous pointer on the new node. Deletion in linked list is fast because it involves only updating the next pointer in the node before the deleted node and updating the previous pointer in the node after the deleted node.</br>



> Explain **Difference between ArrayList & Vectors** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

## Implementations of Map?

- **In plain words:**

  * **TreeMap**: sorted based on ascending order of keys. For inserting, deleting, and locating elements in a Map, the HashMap offers the best alternative. If, however, you need to traverse the keys in a sorted order, then TreeMap is your better alternative.
     *	**HashTable**: Does not allow null values. It is not fail-safe and it is synchronized whereas 
     * **HashMap** allows null values and it is fail-safe and it is not synchronized. 
     * **LinkedHashMap**: This is a subclass of Hashmap. The order of insertion is preserved since it has a linkedList.</br>



> Explain **Implementations of Map** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

## `HashMap`, `ArrayMap` and `SparseArray`

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://blog.mindorks.com/android-app-optimization-using-arraymap-and-sparsearray-f2b4e2e3dc47



> Bookmark **`HashMap`, `ArrayMap` and `SparseArray`**, read the linked reference, and be ready to explain trade-offs with one example.


---

## Explain Looper, Handler and HandlerThread.

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://blog.mindorks.com/android-core-looper-handler-and-handlerthread-bd54d69fe91a



> Bookmark **Explain Looper, Handler and HandlerThread**, read the linked reference, and be ready to explain trade-offs with one example.


---

## Difference between Enumeration and Iterators?

- **In plain words:**

  * **Enumeration** does not include remove() method whereas iterators do. Enumerators act as read only interface as it provides methods to read and traverse through a collection. 
     * **ListIterator**: is just like an iterator except it allows access to the collection in either the forward or backward direction</br>



> Explain **Difference between Enumeration and Iterators** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

## How Hashmap works in Java?

- **In plain words:**

  * HashMap in Java works on hashing principle. It is a data structure which allows us to store object and retrieve it in constant time O(1) provided we know the key. When we call put method, ```hashcode()``` method of the key object is called so that hash function of the map can find a bucket location to store Entry object.
     * If two different objects have the same hashcode: in this case, a linked list is formed at that bucket location and a new entry is stored as next node. After finding bucket location, we will call ```keys.equals()``` method to identify a correct node in LinkedList and return associated value object for that key in Java HashMap</br>


### Useful links

- https://amitshekhar.me/blog/optimization-using-arraymap-and-sparsearray



> Bookmark **How Hashmap works in Java**, read the linked reference, and be ready to explain trade-offs with one example.


---

## Generics in Java

- **In plain words:**

  * Before generics, we can store any type of objects in collection i.e. non-generic. Now generics, forces the java programmer to store specific type of objects.
     * Type-safety : We can hold only a single type of objects in generics. It doesn’t allow to store other objects.
     * Type casting is not required: There is no need to typecast the object.
     * Compile-Time Checking: It is checked at compile time so problem will not occur at runtime. The good programming strategy says it is far better to handle the problem at compile time than runtime.
     * Before Generics, we need to type cast.
      * After Generics, we don't need to typecast the object.


### Code example

Before generics (requires cast):

```java
List list = new ArrayList();
list.add("hello");
String s = (String) list.get(0); // typecasting
```

With generics:

```java
List<String> list = new ArrayList<String>();
list.add("hello");
String s = list.get(0);
```


> Explain **Generics in Java** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

## Types of Observable in Rx-Java

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://blog.mindorks.com/understanding-types-of-observables-in-rxjava-6c3a2d0819c8



> Bookmark **Types of Observable in Rx-Java**, read the linked reference, and be ready to explain trade-offs with one example.


---

## Rx-Java Scheduler what, when, how?

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://medium.com/android-news/rxjava-schedulers-what-when-and-how-to-use-it-6cfc27293add



> Bookmark **Rx-Java Scheduler what, when, how**, read the linked reference, and be ready to explain trade-offs with one example.


---

## RxJava Subject - Publish, Replay, Behavior, and Async

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://amitshekhar.me/blog/rxjava-subject-publish-replay-behavior-async



> Bookmark **RxJava Subject - Publish, Replay, Behavior, and Async**, read the linked reference, and be ready to explain trade-offs with one example.


---

## Executor Service

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://www.javatpoint.com/java-executorservice



> Bookmark **Executor Service**, read the linked reference, and be ready to explain trade-offs with one example.


---

## What is an Observable in RXJava2?

- **In plain words:**

  An Observable  simply emits the data to those which subscribed to it. All the emission is done asynchronously to the subscribers. A simple Observable can be created as follows:


### Code example

```java
// RxAndroid Tutorial - Adding Observable
Observable<String> stringObservable = Observable.just("Hello Reactive Programming!");
```


> An Observable simply emits the data to those which subscribed to it.


---

## What is an Observer in RXJava2?

- **In plain words:**

  Observer consumes the data emitted by the Observable. To do this, Observer needs to subscribe to the Observable. Example shows how to create an Observable in RxJava2.


### Code example

```java
// RxAndroid Tutorial - Adding observer
Observer<String> stringObserver = new Observer<String>() {
    @Override
    public void onSubscribe(Disposable d) {
    }

    @Override
    public void onNext(String s) {
        Toast.makeText(MainActivity.this, s, Toast.LENGTH_SHORT).show();
    }

    @Override
    public void onError(Throwable e) {
    }

    @Override
    public void onComplete() {
    }
};
```


> Observer consumes the data emitted by the Observable.


---

## How to Subscribe / Unsubscribe in RXJava?

- **In plain words:**

  We can make an Observer to subscribe to Observable as follows:


### Code example

```java
// RxAndroid tutorial - observer subscribing to observable
stringObservable.subscribe(stringObserver);
```


> Attach the observer with `subscribe()`; dispose subscriptions when done to avoid leaks and stale callbacks.


---

## What is Back Pressure in RxJava?

- **In plain words:**

  Back Pressure is the state where your observable (publisher) is creating more events than your subscriber can handle.



> Back Pressure is the state where your observable (publisher) is creating more events than your subscriber can handle.


---

## What is a Cold Observable?

- **In plain words:**

  A Cold Observable is an Observable that does not emit items until a Subscriber subscribes. If we have more than one Subscriber, then the Cold Observable will emit each sequence of items to all Subscribers one by one.



> A Cold Observable is an Observable that does not emit items until a Subscriber subscribes.


---

## What is a Hot Observable?

- **In plain words:**

  A Hot observable is an Observer that will emit items



> A Hot observable is an Observer that will emit items


---

## What is Design Pattern?

- **In plain words:**

  - https://www.digitalocean.com/community/tutorials/java-design-patterns-example-tutorial
     - https://blog.mindorks.com/mastering-design-patterns-in-android-with-kotlin

      <img src="https://github.com/Kiran7007/Interview-Question/assets/18071333/4ca96de4-8701-41e6-ab58-10536aab7d09" alt="Lamp" width="600"> </br>


### Useful links

- https://www.digitalocean.com/community/tutorials/java-design-patterns-example-tutorial
- https://blog.mindorks.com/mastering-design-patterns-in-android-with-kotlin
- https://github.com/Kiran7007/Interview-Question/assets/18071333/4ca96de4-8701-41e6-ab58-10536aab7d09



> Explain **What is Design Pattern** in your own words—prioritize structure and trade-offs over raw bullet memorization.


---

## What is the difference between factory and abstract factory design pattern?

- **In plain words:**

  Both factory and abstract factory are creational design patterns. The majordifference between these two is, a factory pattern creates an object through inheritance and produces only one Product. On the other hand, an abstract factory pattern creates the object through composition and produce families of products. In other word an abstract factory is "factory of factories". You can find an example [___here___]("https://www.journaldev.com/1418/abstract-factory-design-pattern-in-java").


### Useful links

- https://www.journaldev.com/1418/abstract-factory-design-pattern-in-java



> Both factory and abstract factory are creational design patterns.


---

## What is Creational Design Patterns?

- **In plain words:** Use the links below as the primary source; rehearse a short spoken summary.


### Useful links

- https://www.baeldung.com/kotlin/builder-pattern



> Bookmark **What is Creational Design Patterns**, read the linked reference, and be ready to explain trade-offs with one example.


---

## What are the drawbacks of using singleton design pattern?

- **In plain words:**

  - **Testability issue:** The bad thing with singletons is that the `getInstance()` method is globally accessible. That means that you usually call it from within a class, instead of depending on an interface you can later mock. That's why it's impossible to replace it when you want to test the method or the class.
    - **Tight Coupling:** The singleton object is exposed globally and is available to a whole application. Thus, classes using this object become tightly coupled. So any change in the global object will impact all other classes using it.
    - **Violation issues:** Singleton principle can be violated by techniques such as cloning. If an application is running on multiple JVM’s, then, in this case, Singleton might be broken. </br>



> Explain **What are the drawbacks of using singleton design pattern** in your own words—prioritize structure and trade-offs over raw bullet memorization.
