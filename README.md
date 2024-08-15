# Interview Preparation

## Contents
 * [Core Java](Core_Java.md)
 * [Kotlin](Kotlin.md)
 * [Core Android](#core-android)
 * [Data Structures And Algorithms](#data-structures-and-algorithms)
 * [Design Problem](#design-problem)
 * [Tools And Technologies](#tools-and-technologies)
 * [Android Test Driven Development](#android-test-driven-development)
 * [Others](#others)
 * 
 * [How to Prepare for the Interview](PREPARATIONS.md)
 * [General Questions](GENERAL.md)
 * [Object Oriented Programming Quesions](OOP.md)
 * [Java Programming Questions](JAVA.md)
 * [Kotlin Programming Quesions](KOTLIN.md)
 * [Android Foundations Quesions](ANDROID_FOUNDATIONS.md)
 * [Android UI Design Quesions](ANDROID_UI.md)
 * [Android Libraries Quesions](ANDROID_LIBRARIES.md)
 * [Architecture Design Quesions](ARCHITECTURE_DESIGN.md)
 * [Tests Quesions](TESTS.md)
 * [Time Complexity](COMPLEXITY.md)

## Android Mock Interviews

* [Mock interview](ANDROID_MOCK1.md)

## References
* [Interview questions on Android Jetpack Compose](https://medium.com/@sujathamudadla1213/interview-questions-on-android-jetpack-compose-a9a28759ef11)
* [Android interview prep in 2023](https://levelup.gitconnected.com/android-interview-prep-in-2023-part-1-40e38b2531b)
* [Kotlin Android Interview Questions](https://blog.mindorks.com/kotlin-android-interview-questions)
* [Big O Cheat Sheet – Time Complexity Chart](https://www.freecodecamp.org/news/big-o-cheat-sheet-time-complexity-chart/)
* [How to use the STAR method for interviews](https://www.testgorilla.com/blog/star-method-interviews/)

  
### Data Structure Coding Programs
* **Sorting** </br>
   * [BubbleSort](/src/sort/BubbleSort.java)
   * [InsertionSort](/src/sort/InsertionSort.java)
   * [SelectionSort](/src/sort/SelectionSort.java)
   * [QuickSort](/src/sort/QuickSort.java)
   * [Count Sort](https://www.includehelp.com/kotlin/sorting-in-linear-time-and-program-for-count-sort.aspx)
   * [Shell Sort](https://www.tutorialspoint.com/data_structures_algorithms/shell_sort_algorithm.htm)
   * [MergeSort](/src/sort/MergeSort.java)
     * **Question: Why is quicksort preferred over merge sort for sorting arrays?** </br>
         * Quicksort does not require any extra storage whereas merge sort requires O(n) space allocation. Allocating/de-allocating memory space can increase the run time.</br>
     * **Question: Why is merge sort preferred over quicksort for sorting linked lists?** </br>
         * There is a difference in linked lists due to memory allocation. In linked lists we can insert items in the middle in O(n) space and time. There is no extra memory allocation required.     
   </br>
   
* **Searching** </br>
   * [Binary Search](/src/search/BinarySearch.java)
   * [Rotated Binary Search](/src/search/RotatedBinarySearch.java)
   * [Ternary Search](/src/search/TernarySearch.java)  
     * **Question: Why is binary search preferred over ternary search?** </br>
         * When dividing an array by k ( 2(binary) or 3(ternary)), it reduces the array size to 1/k. But it increases the no of comparisons by k.
   </br>
   
* **Runtime Complexity Table:** </br></br>
   <a href="https://github.com/anitaa1990/Android-Cheat-sheet/blob/master/media/4.png" target="_blank"><img src="https://github.com/anitaa1990/Android-Cheat-sheet/blob/master/media/4.png"></a></br>


* **Explain Big O Notation?** </br>
   * The notation Ο(n) is the formal way to express the upper bound of an algorithm's running time. It measures the worst case time complexity or the longest amount of time an algorithm can possibly take to complete. 
   * Note: **O(1)** means that it takes a constant time, like three minutes no matter the amount of data in the set.
    **O(n)** means it takes an amount of time linear with the size of the set.</br>

* **Explain Big Omega Notation** </br>
   The Big Omega Notation is used to describe the best case running time for a given algorithm.</br>
   
* **Difference between stacks & queues?** </br>
  <a href="https://github.com/anitaa1990/Android-Cheat-sheet/blob/master/media/3.png" target="_blank"><img src="https://github.com/anitaa1990/Android-Cheat-sheet/blob/master/media/3.png"></a></br>

* **Data Structure and Algorithms** </br>
  * https://www.tutorialspoint.com/data_structures_algorithms/shell_sort_algorithm.htm
  * https://www.geeksforgeeks.org/learn-data-structures-and-algorithms-dsa-tutorial/
  * https://amitshekhar.me/blog/android-developer-should-know-these-data-structures-for-next-interview
  * https://afteracademy.com/tech-interview/ds-algo-concepts/
  * https://afteracademy.com/blogs/

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
* Describe JUnit test. [Link](https://devqa.io/junit-5-annotations/)


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

* Android Development Best Practices. [Link](https://blog.mindorks.com/android-development-best-practices-83c94b027fd3)



