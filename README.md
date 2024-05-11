# Interview-Question

## Contents
 * [Data Structures And Algorithms](#data-structures-and-algorithms)
 * [Core Java](#core-java)
 * [Core Android](#core-android)
 * [Architecture](#architecture)
 * [Design Problem](#design-problem)
 * [Tools And Technologies](#tools-and-technologies)
 * [Android Test Driven Development](#android-test-driven-development)
 * [Others](#others)
    
* **What is `Application` class?**
    - The Application class in Android is the base class within an Android app that contains all other components such as activities and services. The Application class, or any subclass of the Application class, is instantiated before any other class when the process for your application/package is created.

#### Activity and Fragment
* **What is onSavedInstanceState() and onRestoreInstanceState() in activity?**
    - onSavedInstanceState() - This method is used to store data before pausing the activity.
    - onRestoreInstanceState() - This method is used to recover the saved state of an activity when the activity is recreated after destruction. So, the onRestoreInstanceState() receive the bundle that contains the instance state information.

* **When should you use a Fragment rather than an Activity?**
    - When you have some UI components to be used across various activities
    - When multiple view can be displayed side by side just like viewPager

* **What is the difference between FragmentPagerAdapter vs FragmentStatePagerAdapter?**
    - FragmentPagerAdapter: Each fragment visited by the user will be stored in the memory but the view will be destroyed. When the page is revisited, then the view will be created not the instance of the fragment.
    - FragmentStatePagerAdapter: Here, the fragment instance will be destroyed when it is not visible to the user, except the saved state of the fragment.

* **What is the difference between adding/replacing fragment in backstack?**
    ![image](https://user-images.githubusercontent.com/18071333/109423939-88001a80-7a07-11eb-995e-b7d16c5e51bb.png)
    ![image](https://user-images.githubusercontent.com/18071333/109423948-95b5a000-7a07-11eb-8aa6-840f01beb236.png)
    ![image](https://user-images.githubusercontent.com/18071333/109423954-9d754480-7a07-11eb-9e45-ea95fa038feb.png)
    <br>
    <p align="center">
        <img src="https://user-images.githubusercontent.com/18071333/109424405-7ae42b00-7a09-11eb-94b1-a2d648d7d33e.png" width="400">
        <img src="https://user-images.githubusercontent.com/18071333/109424414-86cfed00-7a09-11eb-848c-0948dc8fceab.png" width="400">
    </p>
    <br>

* **View & ViewGroup**
   - ConstraintLayout combines a simple, expressive and flexible layout system with the powerful features built into the Android Studio Designer tool.
   - It makes it easier to create responsive user interface layouts that adapt automatically to different screen sizes and changing device orientations.
   - This has the benefit of avoiding many problems inherent in nesting layouts. It allows designing so-called flat or shallow layout hierarchies. This leads to less complex layouts and improved user interface rendering performance at runtime.

* **SSL Pinning**
   - When an client application such as mobile app or web browser begins secure session with the server there is the 3 things client and server must be agree on.
        - How will the key exchanged
        - How will be the data encrypted
        - How will messages marked as authentic

    - The server may decide AES256 encrypted data, SHA1 to sign messages. if client can support this messages the client request for the the certificate exchange from the server once client has validate the certificate chainning the public key is extracked from the server.

    - Developer can compile the public key into the application code this is essecially pins the key into the appliction. when client receives the public key from the server, it compare this key with the pinned key in apllciation. the key should should match. if the key dont match. the client terminates the session.

    - Types of SSL Pinning
        - Public key pinning
        - Certificate pinning
            - https://dzone.com/articles/encryption-and-signing
            - https://www.netguru.com/codestories/3-ways-how-to-implement-certificate-pinning-on-android
            - https://www.raywenderlich.com/10056112-securing-network-data-tutorial-for-android
        - SPKI pinning

* **Design Pattern**
   - https://www.journaldev.com/1827/java-design-patterns-example-tutorial#singleton-pattern
   - https://blog.mindorks.com/mastering-design-patterns-in-android-with-kotlin

* **Java Try with Resources**
   - http://tutorials.jenkov.com/java-exception-handling/try-with-resources.html

* **Java 8 Interface changes**
   - https://beginnersbook.com/2017/10/java-8-interface-changes-default-method-and-static-method/

* **Function Interface**
   - https://www.geeksforgeeks.org/functional-interfaces-java/

* **Types of Observable in Rx-Java**
   - https://blog.mindorks.com/understanding-types-of-observables-in-rxjava-6c3a2d0819c8

* **Rx-Java Scheduler what, when, how?**
   - https://medium.com/android-news/rxjava-schedulers-what-when-and-how-to-use-it-6cfc27293add

* **Executor Service**
   - https://www.javatpoint.com/java-executorservice

* **Kotlin interview Questions**
   - https://blog.mindorks.com/kotlin-android-interview-questions
   - https://www.ubuntupit.com/frequently-asked-kotlin-interview-questions-and-answers/

* **Kotlin Collection Functions**
   - https://blog.mindorks.com/kotlin-collection-functions

* **Map vs Flatmap**
   - https://www.linkedin.com/feed/update/urn:li:activity:6770786744422998017/
 
* **Stateflow vs LiveData**
   - https://scalereal.com/android/2020/05/22/stateflow-end-of-livedata.html

* **Livedata vs ObservableField**
   - https://blog.mindorks.com/livedata-vs-observable-in-android

* **ViewPager vs ViewPager2**
   - https://developer.android.com/training/animation/vp2-migration

* **Understanding Suspend function**
   - https://medium.com/mobile-app-development-publication/understanding-suspend-function-of-coroutines-de26b070c5ed

* **Coroutine runblocking**
   - https://www.geeksforgeeks.org/runblocking-in-kotlin-coroutines-with-example

* **Thread Safe mthods and blocks**
   - https://proandroiddev.com/synchronization-and-thread-safety-techniques-in-java-and-kotlin-f63506370e6d

* **App Data encryption**
   - https://blog.mindorks.com/how-to-encrypt-data-safely-on-device-and-use-the-androidkeystore

* **Data Structure and Algorithms**
   - https://www.tutorialspoint.com/data_structures_algorithms/shell_sort_algorithm.htm

* **Understanding scope storage in android**
   - https://blog.mindorks.com/understanding-the-scoped-storage-in-android

* **Solve out of memory error**
   - https://blog.mindorks.com/practical-guide-to-solve-out-of-memory-error-in-android-application

* **Battery optimizationn for Android**
   - https://blog.mindorks.com/battery-optimization-for-android-apps-f4ef6170ff70
   
* **Android Jetpack component**
   - https://blog.mindorks.com/what-is-android-jetpack-and-why-should-we-use-it

* **Android ViewModel under the hood**
   - https://blog.mindorks.com/android-viewmodels-under-the-hood

* **Workmanager**
   - https://blog.mindorks.com/integrating-work-manager-in-android

* **Arraymap vs Sparsh Array**
   - https://blog.mindorks.com/android-app-optimization-using-arraymap-and-sparsearray-f2b4e2e3dc47

* **Java Android Multithreading programming**
   - https://blog.mindorks.com/java-android-multithreaded-programming-runnable-callable-future-executor

* **Understanding Open keyword in Kotlin**
   - https://blog.mindorks.com/understanding-open-keyword-in-kotlin

<p align="center">
<img alt="AndroidInterviewQuestions" src="https://raw.githubusercontent.com/MindorksOpenSource/android-interview-questions/master/assets/android_interview_questions.png">
</p>

### Data Structures And Algorithms

> The level of questions asked on Data Structures And Algorithms totally depends on the company for which you are applying.

* Array
* LinkedList
    - A LinkedList, just like a tree and unlike an array, consists of a group of nodes which 
    together represent a sequence. Each node contains data and a pointer. The data in a node can be 
    anything, but the pointer is a reference to the next item in the LinkedList. A LinkedList 
    contains both a head and a tail. The Head is the first item in the LinkedList, and the Tail is 
    the last item. A LinkedList is not a circular data structure, so the tail does not have its 
    pointer pointing at the Head, the pointer is just null. The run time complexity for each of 
    the base methods are as follows:

        | Algorithm | Average | Worst Case |
        |:---------:|:-------:|:----------:|
        | Space     | O(n)    | O(n)       |
        | Search    | O(n)    | O(n)       |
        | Insert    | O(1)    | O(1)       |
        | Delete    | O(1)    | O(1)       |
* DoublyLinkedList
* Stack
    - A Stack is a basic data structure with a "Last-in-First-out" methodology. Which means that 
    the last item that was added to the stack, is the first item that comes out of the stack. A 
    Stack is like a stack of books. In order to get to the first book that was added in the stack 
    (the bottom book), all of the books that were added after need to be removed first. Adding to a 
    Stack is called a Push, removing from a stack is called a Pop, and getting the last item 
    inserted into the stack without removing it is called Top. [The most common way to implement a
     stack is by using a LinkedList, but there are also StackArray (implemented with an array) 
     which does not replace null entries, and there is also a Vector implementation that does 
     replace null entries.](https://en.wikibooks.org/wiki/Data_Structures/Stacks_and_Queues#Performance_Analysis)
     
        <table>
            <tr>
                <th>Algorithm</th>
                <th>Average</th>
                <th>Worst Case</th>
                <th>Image representation</th>
            </tr>
            <tr>
                <td>Space</td>
                <td>O(n)</td>
                <td>O(n)</td>
                <td rowspan="5">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Data_stack.svg/250px-Data_stack.svg.png"/>
                </td>
            </tr>
            <tr>
                <td>Search</td>
                <td>O(n)</td>
                <td>O(n)</td>
            </tr>
            <tr>
                <td>Insert (Push)</td>
                <td>O(1)</td>
                <td>O(1)</td>
            </tr>
            <tr>
                <td>Delete (Pop)</td>
                <td>O(1)</td>
                <td>O(1)</td>
            </tr>
            <tr>
              <td>Top</td>
              <td>O(1)</td>
              <td>O(1)</td>
            </tr>
        </table>
* Queue
* PriorityQueue
* Dynamic Programming
* String Manipulation
* Binary Tree
* Binary Search Tree
* Sorting Algorithms
* Hash Table or Hash Map
* Breadth First Search
* Depth First Search
* Greedy Algorithm


### Core Java

* Explain OOP Concept.
    - Object-Oriented Programming is a methodology to design a program using classes, objects, 
    [inheritance](https://en.wikipedia.org/wiki/Inheritance_(object-oriented_programming)),
    [polymorphism](https://en.wikipedia.org/wiki/Polymorphism_(computer_science)),
    [abstraction](https://en.wikipedia.org/wiki/Abstraction_(software_engineering)), and
    [encapsulation](https://en.wikipedia.org/wiki/Encapsulation_(computer_programming)).
* Differences between abstract classes and interfaces? [link](https://arjun-sna.github.io/java/2017/02/02/abstractvsinterface/)
    - An abstract class, is a class that contains both concrete and abstract methods 
    (methods without implementations). An abstract method must be implemented by the abstract class
     sub-classes. Abstract classes are extended.
    - An interface is like a blueprint/contract of a class. It contains empty methods that 
    represent what all of its subclasses should have in common. The subclasses provide the 
    implementation for each of these methods. Interfaces are implemented.
* What is serialization? How do you implement it?
    - Serialization is the process of converting an object into a stream of bytes in order to store 
    an object into memory so that it can be recreated at a later time while still keeping the 
    objects original state and data. In Java there are two methods of doing this, one is by 
    implementing Serializable or Parcelable. In Android, however, Serializable should never be used 
    in Android. Parcelable was created to be more efficient then Serializable, and performs about 
    10x faster then Serializable because Serializable uses reflection which is a slow process and 
    tends to create a lot of temporary objects which may cause garbage collection to occur more often.
* What is Singleton class?
    - A singleton is a class that can only be instantiated once.[This singleton pattern restricts 
    the instantiation of a class to one object. This is useful when exactly one object is needed 
    to coordinate actions across the system. The concept is sometimes generalized to systems 
    that operate more efficiently when only one object exists, or that restrict the instantiation 
    to a certain number of objects.](https://en.wikipedia.org/wiki/Singleton_pattern)
* What are anonymous classes?
* What is the difference between using `==` and `.equals` on a string?
* What is the `hashCode()` and `equals()` used for?
* What are these `final`, `finally` and `finalize`?
* What is memory leak and how does Java handle it?
* What is garbage collector? How it works?
  -All objects are allocated on the heap area managed by the JVM. 
  As long as an object is being referenced, the JVM considers it  alive. 
  Once an object is no longer referenced and therefore is not reachable by the application code,
  the garbage collector removes it and reclaims the unused memory.
* `Arrays` vs `ArrayLists`.
* `HashSet` vs `TreeSet`.
* Typecast in Java.
* Difference between method overloading and overriding.
<p align="center">
<img alt="Overloading and Overriding" src="https://github.com/codeshef/android-interview-questions/blob/master/assets/overloading-vs-overriding.png">
</p>

Overloading happens at compile-time while Overriding happens at runtime: The binding of overloaded method call to its definition has happens at compile-time however binding of overridden method call to its definition happens at runtime.

Static methods can be overloaded which means a class can have more than one static method of same name. Static methods cannot be overridden, even if you declare a same static method in child class it has nothing to do with the same method of parent class.

The most basic difference is that overloading is being done in the same class while for overriding base and child classes are required. Overriding is all about giving a specific implementation to the inherited method of parent class.

Static binding is being used for overloaded methods and dynamic binding is being used for overridden/overriding methods.
Performance: Overloading gives better performance compared to overriding. The reason is that the binding of overridden methods is being done at runtime.

Private and final methods can be overloaded but they cannot be overridden. It means a class can have more than one private/final methods of same name but a child class cannot override the private/final methods of their base class.

Return type of method does not matter in case of method overloading, it can be same or different. However in case of method overriding the overriding method can have more specific return type (refer this).

Argument list should be different while doing method overloading. Argument list should be same in method Overriding.

* What are the access modifiers you know? What does each one do?
* Can an Interface extend another Interface?
* What does the `static` word mean in Java?
* Can a `static` method be overridden in Java?
* What is Polymorphism? What about Inheritance?
* What is the difference between an Integer and int?
* Do objects get passed by reference or value in Java? Elaborate on that.
* What is a ThreadPoolExecutor? [Link](https://blog.mindorks.com/threadpoolexecutor-in-android-8e9d22330ee3)
* What the difference between local, instance and class variables?
* What is reflection? [Link](http://tutorials.jenkov.com/java-reflection/index.html)
* What are strong, soft and weak references in Java?
* What is dependency injection? Can you name few libraries? Have you used any?
* What does the keyword `synchronized` mean?
* What does it means to say that a `String` is immutable?
* What are `transient` and `volatile` modifiers?
* What is the `finalize()` method?
* How does the `try{}finally{}` works?
* What is the difference between instantiation and initialization of an object?
* When is a `static` block run?
* Explain Generics in Java?
* Difference between `StringBuffer` and `StringBuilder`?
* How is a `StringBuilder` implemented to avoid the immutable string allocation problem?
* What is Autoboxing and Unboxing?
* What’s the difference between an Enumeration and an Iterator?
* What is the difference between fail-fast and fail safe in Java?
* What is Java priority queue?
* What are the design patterns? [Link](https://github.com/iluwatar/java-design-patterns)


### Core Android

* Explain activity lifecycle.
* Tell all the Android application components.
* Service vs IntentService. [Link](https://stackoverflow.com/a/15772151/5153275)
* What is the structure of an Android Application?
* How to persist data in an Android app?
* How would you perform a long-running operation in an application?
* How would you communicate between two Fragments?
* Explain Android notification system?
* How can two distinct Android apps interact?
* What is Fragment?
* Why is it recommended to use only the default constructor to create a fragment? [Link](https://stackoverflow.com/a/16042750/2809326)
* Why Bundle class is used for data passing and why cannot we use simple Map data structure
* Explain the lifecycle of a Fragment. [Link](https://www.techsfo.com/blog/wp-content/uploads/2014/08/complete_android_fragment_lifecycle.png)
* What is Dialog in Android?
* What is View in Android?
* Can you create custom views? How?
* What are ViewGroups and how they are different from the views?
* What is the difference between a fragment and an activity? Explain the relationship between the two.
* What is the difference between Serializable and Parcelable? Which is the best approach in Android?
* What are "launch modes"? [Link](https://blog.mindorks.com/android-activity-launchmode-explained-cbc6cf996802)
* What are Intents? [Link](https://stackoverflow.com/questions/6578051/what-is-an-intent-in-android)
* What is an Implicit Intent?
* What is an Explicit Intent?
* What is an AsyncTask?
* What is a BroadcastReceiver? [Link](https://stackoverflow.com/questions/5296987/what-is-broadcastreceiver-and-when-we-use-it)
* What is a LocalBroadcastManager? [Link](https://developer.android.com/reference/android/support/v4/content/LocalBroadcastManager.html)
* What is a JobScheduler? [Link](http://www.vogella.com/tutorials/AndroidTaskScheduling/article.html)
* What is DDMS and what can you do with it?
* What is the support library? Why was it introduced?[Link](http://martiancraft.com/blog/2015/06/android-support-library/)
* What is a ContentProvider and what is it typically used for?
* What is Android Data Binding? [Link](https://developer.android.com/topic/libraries/data-binding/index.html)
* What are Android Architecture Components? [Link](https://developer.android.com/topic/libraries/architecture/index.html)
* What is ADB?
* What is ANR? How can the ANR be prevented?
* What is `AndroidManifest.xml`?
* Describe how broadcasts and intents work to be able to pass messages around your app?
* How do you handle `Bitmaps` in Android as it takes too much memory?
* What are different ways to store data in your Android app?
* What is the Dalvik Virtual Machine?
* What is the relationship between the life cycle of an AsyncTask and an Activity? What problems can this result in? How can these problems be avoided?
* What is the function of an intent filter?
* What is a Sticky Intent? [Link](http://www.androidinterview.com/what-is-a-sticky-intent/)
* What is AIDL? Enumerate the steps in creating a bounded service through AIDL.
* What are the different protection levels in permission?
* How would you preserve Activity state during a screen rotation? [Link](https://stackoverflow.com/questions/3915952/how-to-save-state-during-orientation-change-in-android-if-the-state-is-made-of-m)
* Relative Layout vs Linear Layout.
* How to implement XML namespaces?
* Difference between `View.GONE` and `View.INVISIBLE`?
* What is the difference between a regular bitmap and a nine-patch image?
* Tell about the bitmap pool. [Link](https://blog.mindorks.com/how-to-use-bitmap-pool-in-android-56c71a55533c)
* How to avoid memory leaks in Android?
* What are widgets on Home-Screen in Android?
* What is AAPT?
* How do you find memory leaks in Android applications?
* How do you troubleshoot a crashing application?
* Why should you avoid to run non-ui code on the main thread?
* How did you support different types of resolutions?
* What is Doze? What about App Standby?
* What can you use for background processing in Android?
* What is ORM? How does it work?
* What is a Loader?
* What is the NDK and why is it useful?
* What is the StrictMode? [Link](https://blog.mindorks.com/use-strictmode-to-find-things-you-did-by-accident-in-android-development-4cf0e7c8d997)
* What is Lint? What is it used for?
* What is a `SurfaceView`?
* What is the difference between `ListView` and `RecyclerView`?
* What is the ViewHolder pattern? Why should we use it?
* What is a PendingIntent?
* Can you manually call the Garbage collector?
* What is the best way to update the screen periodically?
* What are the different types of Broadcasts?
* Have you developed widgets? Describe. [Link](https://blog.mindorks.com/android-widgets-ad3d166458d3)
* What is Context? How is it used? [Link](https://medium.com/p/understanding-context-in-android-application-330913e32514)
* Do you know what is the view tree? How can you optimize its depth?
* What is the `onTrimMemory` method?
* Is it possible to run an Android app in multiple processes? How?
* How does the OutOfMemory happens?
* What is a `spannable`?
* What is renderscript? [Link](https://blog.mindorks.com/comparing-android-ndk-and-renderscript-1a718c01f6fe)
* What are the differences between Dalvik and ART?
* FlatBuffers vs JSON. [Link](https://blog.mindorks.com/why-consider-flatbuffer-over-json-2e4aa8d4ed07)
* What are Annotations? [Link](https://blog.mindorks.com/creating-custom-annotations-in-android-a855c5b43ed9), [Link](https://blog.mindorks.com/improve-your-android-coding-through-annotations-26b3273c137a)
* Tell about Constraint Layout [Link](https://blog.mindorks.com/using-constraint-layout-in-android-531e68019cd)
* `HashMap`, `ArrayMap` and `SparseArray` [Link](https://blog.mindorks.com/android-app-optimization-using-arraymap-and-sparsearray-f2b4e2e3dc47)
* Explain Looper, Handler and HandlerThread. [Link](https://blog.mindorks.com/android-core-looper-handler-and-handlerthread-bd54d69fe91a)
* How to reduce battery usage in an android application? [Link](https://blog.mindorks.com/battery-optimization-for-android-apps-f4ef6170ff70)
* What is `SnapHelper`? [Link](https://blog.mindorks.com/using-snaphelper-in-recyclerview-fc616b6833e8)
* How to handle multi-touch in android [link](https://arjun-sna.github.io/android/2016/07/20/multi-touch-android/)


### Architecture

* Describe the architecture of your last app.
* Describe MVP. [Link](https://blog.mindorks.com/essential-guide-for-designing-your-android-app-architecture-mvp-part-1-74efaf1cda40)
* What is presenter?
* What is model?
* Describe MVC.
* What is controller?
* Describe MVVM. [Link](https://github.com/MindorksOpenSource/android-mvvm-architecture)
* Tell something about clean code [Link](https://blog.mindorks.com/every-programmer-should-read-this-book-6755dedec78d)


### Design Problem

* Design Uber App.
* Design Facebook App.
* Design Facebook Near-By Friends App.
* Design WhatsApp.
* Design SnapChat.
* Design problems based on location based app.


### Tools And Technologies

* Git. [Link](https://github.com/git-tips/tips)
* RxJava. [Link](https://blog.mindorks.com/a-complete-guide-to-learn-rxjava-b55c0cea3631)
* Dagger 2. [Link](https://medium.com/p/a-complete-guide-to-learn-dagger-2-b4c7a570d99c)
* Android Development Useful Tools. [Link](https://blog.mindorks.com/android-development-useful-tools-fd73283e82e3)
* Firebase. [Link](https://firebase.google.com/)


### Android Test Driven Development

* What is Espresso? [Link](https://developer.android.com/training/testing/ui-testing/espresso-testing.html)
* What is Robolectric? [Link](http://robolectric.org/)
* What is UI-Automator? [Link](https://developer.android.com/training/testing/ui-testing/uiautomator-testing.html)
* Explain unit test.
* Explain instrumented test.
* Have you done unit testing or automatic testing?
* Why Mockito is used? [Link](http://site.mockito.org/)
* Describe JUnit test.


### Others

* Describe how REST APIs work.
* Describe SQLite.
* Describe database.
* Project Management tool - trello, basecamp, kanban, jira, asana.
* About build System - gradle, ant, buck. 
* Reverse Engineering an APK.
* What is proguard used for?
* What is obfuscation? What is it used for? What about minification?
* How do you build your apps for release?
* How do you control the application version update to specific number of users?
* Can we identify users who have uninstalled our application?
* APK Size Reduction. [Link](https://blog.mindorks.com/how-to-reduce-apk-size-in-android-2f3713d2d662)
* Android Development Best Practices. [Link](https://blog.mindorks.com/android-development-best-practices-83c94b027fd3)
* Android Code Style And Guidelines. [Link](https://blog.mindorks.com/android-code-style-and-guidelines-d5f80453d5c7)
* Have you tried Kotlin? [Link](https://medium.com/p/why-you-must-try-kotlin-for-android-development-e14d00c8084b)
* What are the metrics that you should measure continuously while android application development? [Link](https://blog.mindorks.com/android-app-performance-metrics-a1176334186e)


### Found this project useful :heart:
* Support by clicking the :star: button on the upper right of this page. :v:

[Check out Mindorks awesome open source projects here](https://mindorks.com/open-source-projects)


### License
```
   Copyright (C) 2017 MINDORKS NEXTGEN PRIVATE LIMITED

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
```

### Contributing to Android Interview Questions
Just make pull request. You are in!


