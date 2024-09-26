# Kotlin


* **Kotlin interview Questions**
   - https://blog.mindorks.com/kotlin-android-interview-questions
   - https://www.ubuntupit.com/frequently-asked-kotlin-interview-questions-and-answers/
   - https://www.fullstack.cafe/blog/kotlin-interview-questions

* **What is the use of `@JvmStatic`, `@JvmOverloads`, and` @JvmFiled` annotations in Kotlin?**<br>
   **@JvmStatic:** This annotation is used to tell the compiler that the method is a static method and can be used in Java code.
   **@JvmOverloads:** To use the default values passed as an argument in Kotlin code from the Java code, we need to use the `@JvmOverloads` annotation.
   **@JvmField:** To access the fields of a Kotlin class from Java code without using any getters and setters, we need to use the `@JvmField` in the Kotlin code.

* **What do you mean by destructuring in Kotlin?**<br>
    **Destructuring** is a convenient way of extracting multiple values from data stored in(possibly nested) objects and Arrays. It can be used in locations that receive data (such as the left-hand side of an assignment). Sometimes it is convenient to *destructure* an object into several variables, for example:
    ```kotlin
    val (name, age) = employee
    ```

    Now, we can use name and age independently like below:
    ```kotlin
    println(name)
    println(age)

* **What is the difference between lateinit and lazy in Kotlin?**<br>
    - lazy can only be used for val properties, whereas lateinit can only be applied to var because it can’t be compiled to a final field, thus no immutability can be guaranteed.
    - If you want your property to be initialized from outside in a way probably unknown beforehand, use lateinit.

* **Is there any difference between == operator and === operator?**<br>
    Yes. The `==` operator is used to compare the values stored in variables and the `===` operator is used to check if the reference of the variables are equal or not. But in the case of primitive types, the `===` operator also checks for the value and not reference.

* **What is the forEach in Kotlin?**<br>
    In Kotlin, to use the functionality of a for-each loop just like in Java, we use a `forEach` function.

* **What is a `CoroutineScope`?**<br>
    A `CoroutineScope` defines the scope for new coroutines. Every coroutine builder is an extension of `CoroutineScope` and inherits its context.
    - Scopes in Kotlin Coroutines are very useful because we need to cancel the background task as soon as the activity is destroyed.
    - In Android-specific projects, we should go with the custom scopes created by considering the LifeCycle of Activity, ViewModel, etc.
    - The scopes are present under the Kotlin extension libraries. Make sure to add the required dependencies to your project.

* **What is a `Flow` in Kotlin and how is it related to coroutines?**<br>
    `Flow` is a type that can emit multiple values sequentially, as opposed to `suspend` functions that return only a single value. `Flow` builds upon coroutines and provides a way to handle a stream of data asynchronously.

* **What is the difference between coroutine context and coroutine scope?**<br>
    The difference between coroutine context and coroutine scope in Kotlin is fundamental to understanding how coroutines work and are managed. Here’s a concise explanation:
    - **Coroutine Context**: It is a set of rules and configurations that define the behavior of a coroutine, including its job, dispatcher, and other elements. The context controls where the coroutine runs (e.g., on which thread or threads), what job it’s associated with, and other aspects of its execution environment.
    - **Coroutine Scope**: It provides a structured way to launch coroutines. It defines the lifecycle of coroutines; all coroutines launched within a scope are bound by its lifecycle. This means when the scope is canceled, all coroutines within it are also canceled. It’s a way to manage and control the execution of coroutines, ensuring that they don’t leak and are properly cleaned up when no longer needed.

* **What are lambdas expressions?**<br>
    Lambdas expressions are anonymous functions that can be treated as values i.e. we can pass the lambdas expressions as arguments to a function return them, or do any other thing we could do with a normal object.

* **Companion Object** [Link](https://blog.mindorks.com/what-is-the-equivalent-of-java-static-methods-in-kotlin/)

* **Understanding Open keyword in Kotlin** [Link](https://blog.mindorks.com/understanding-open-keyword-in-kotlin)

* **Bitwise and Bitshift Operations** [Link](https://www.programiz.com/kotlin-programming/bitwise)

* **Kotlin Collection Functions** [Link](https://blog.mindorks.com/kotlin-collection-functions)

* **Stateflow vs Sharedflow** [Link](https://outcomeschool.com/blog/stateflow-and-sharedflow)

* **Cold flow vs Hot flow** [Link](https://outcomeschool.com/blog/cold-flow-vs-hot-flow)

* **Map vs Flatmap** [Link](https://www.linkedin.com/feed/update/urn:li:activity:6770786744422998017/)
 
* **Understanding Suspend function** [Link](https://medium.com/mobile-app-development-publication/understanding-suspend-function-of-coroutines-de26b070c5ed)

* **Coroutine runblocking** [Link](https://www.geeksforgeeks.org/runblocking-in-kotlin-coroutines-with-example)

* **Thread Safe mthods and blocks** [Link](https://proandroiddev.com/synchronization-and-thread-safety-techniques-in-java-and-kotlin-f63506370e6d) </br>
