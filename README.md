# Interview-Question


## Contents

* [Core Android](#core-android)
* [Android Libraries](#android-libraries)
* [Android Architecture](#android-architecture)
* [Android Design Problem](#android-design-problem)
* [Android Unit Testing](#android-unit-testing)
* [Android Tools And Technologies](#android-tools-and-technologies)
* [Java and Kotlin](#java-and-kotlin)
* [Data Structures And Algorithms](#data-structures-and-algorithms)
* [Other Topics](#other-topics)

### Core Android

#### Base
* **Tell all the Android application components.**
    - App components are the essential building blocks of an Android app. Each component is an entry point through which the system or a user can enter your app. Some components depend on others.
    - There are four different types of app components:
        - Activities(#activity)
        - Services(#services)
        - Broadcast receivers(#broadcast_receiver)
        - Content providers(#content_provider)

* **What is the project structure of an Android Application?**
    <img src="https://developer.android.com/images/tools/projectview-p1.png" width="400"  
style='display:wrap;'>
**manifests :** Contains the AndroidManifest.xml file.
**java :** Contains the Java source code files, separated by package names, including JUnit test code.
**res :** Contains all non-code resources, such as XML layouts, UI strings, and bitmap images, divided into corresponding sub-directories
======================================================
 <img src="https://developer.android.com/images/tools/projectview-p2.png" width="400"  
style='display:inline;'>
`module-name/`
**build:** Contains build outputs.
**libs:** Contains private libraries.
**src:** Contains all code and resource files for the module in the following 
**androidTest:** Contains code for instrumentation tests that run on an Android device. 
**main:** The Android code and resources shared by all build variants (files for other build variants reside in sibling directories, such as  `src/debug/`  for the debug build type).
**AndroidManifest.xml:** Describes the nature of the application and each of its components.
**java:** Contains Java code sources.
**jni:** Contains native code using the Java Native Interface (JNI). 
**gen:** Contains the Java files generated by Android Studio, such as your  `R.java`  file and interfaces created from AIDL files.
**res:** Contains application resources, such as drawable files, layout files, and UI string.
**assets:** Contains file that should be compiled into an  `.apk`  file as-is. You can navigate this directory in the same way as a typical file system using URIs and read files as a stream of bytes using the  `[AssetManager](https://developer.android.com/reference/android/content/res/AssetManager)` . For example, this is a good location for textures and game data.
**test:** Contains code for local tests that run on your host JVM.
**build.gradle (module):** This defines the module-specific build configurations.
**build.gradle (project):** This defines your build configuration that apply to all modules. This file is integral to the project, so you should maintain them in revision control with all other source code.
    
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
            - Certificate pinning is the pinning entire certificate instead of  pinning just public key.
        - SPKI pinning


