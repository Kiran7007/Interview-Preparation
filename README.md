# Interview-Question
    
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




