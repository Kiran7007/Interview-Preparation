# Android Test Driven Development


* **What is test pyramid?**<br>
   <img src="assets/test_pyramid.png" alt="Test Pyramid" style="width:400px;" />

Unit tests, integration tests, and UI tests are all types of software testing, but they serve different purposes and operate at different levels of the application:
  - **Unit Tests**: These are the most granular tests and focus on testing individual components or functions of the code in isolation. They ensure that each part of the system performs as designed. Unit tests are typically written and run by developers and are used to test the functionality of specific sections of code, often using mock objects to simulate interactions with other parts of the system
  - **Integration Tests**: These tests check the interactions between different parts of the application, such as modules or services, to ensure they work together as expected. Integration tests are more complex than unit tests because they involve multiple components and their interactions. They can be used to detect issues in the interfaces and interaction between integrated units.
  - **UI Tests**: Also known as User Interface tests, these are designed to ensure that the application’s interface works as expected with user interactions. UI tests simulate user behavior and are often automated to perform tasks such as clicking buttons, entering text, and navigating through the application. They are crucial for verifying the end-to-end functionality of the application from the user’s perspective.

* **Explain unit test? What does Unit Testing suppose to do?**
   - Unit testing involves breaking your program into pieces and subjecting each piece to a series of tests.
   - These tests can run on a Continues Integration (CI) (namely GitHub actions, Circle Ci, or Travis Ci) and keep the code quality

* What is Espresso? [Link](https://developer.android.com/training/testing/ui-testing/espresso-testing.html)
* What is Robolectric? [Link](http://robolectric.org/)
* What is UI-Automator? [Link](https://developer.android.com/training/testing/ui-testing/uiautomator-testing.html)
* Have you done unit testing or automatic testing?
* Why Mockito is used? [Link](http://site.mockito.org/)
* Describe JUnit test. [Link](https://devqa.io/junit-5-annotations/)
