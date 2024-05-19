# Interview-Question

## Contents
 * [Core Java](#core-java)
 * [Kotlin](#kotlin)
 * [Core Android](#core-android)
 * [Architecture](#architecture)
 * [Data Structures And Algorithms](#data-structures-and-algorithms)
 * [Design Problem](#design-problem)
 * [Tools And Technologies](#tools-and-technologies)
 * [Android Test Driven Development](#android-test-driven-development)
 * [Others](#others)


### Core JAVA

- **Explain OOP Concept.** <br/>
  Object-Oriented Programming is a methodology to design a program using classes, objects, [inheritance](https://en.wikipedia.org/wiki/Inheritance_(object-oriented_programming)), [polymorphism](https://en.wikipedia.org/wiki/Polymorphism_(computer_science)), [abstraction](https://en.wikipedia.org/wiki/Abstraction_(software_engineering)) and [encapsulation](https://en.wikipedia.org/wiki/Encapsulation_(computer_programming)).

- **What is an Object?** <br/>
  An object is an instance of a class that has states and behaviors. A Class
  can be defined as a template that describes the behavior/state that the object
  of its type support.

* **What is Inheritance?** </br>
  Inheritance is the process by which objects of one class acquire the properties & objects of another class. The two most common reasons to use inheritance are: a) To promote code reuse. b) To use polymorphism.</br>

* **Composition over inheritance?** </br>
  Composition is typically "has a" or "uses a" relationship. In the below example, the Employee class has a Person. It does not inherit from Person but instead gets the Person object passed to it, which is why it is a "has a" Person.
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
   
* **What are Interfaces?** </br>
   * Interfaces are only declared methods that an implementing class would need. 
   * Interfaces cannot be marked as final. Interface variables must be static or final. 
   * Interfaces cannot be instantiated directly.
   * **Marker Interfaces**: Marker interfaces are those which do not declare any required Methods. The java.io.Serializable interface is a typical marker interfaces. These do not contain any methods, but classes must implement this interface in order to be serialized and de-serialized.</br>

* **What is Functional Interface** [Link](https://www.geeksforgeeks.org/functional-interfaces-java/)

* **What is Comparator Interface** [Link](https://www.geeksforgeeks.org/comparator-interface-java/)
  
* **Java 8 Changes in Interface** [Link](https://beginnersbook.com/2017/10/java-8-interface-changes-default-method-and-static-method/)

- **Can Interfaces to be extended?** </br>
  Yes, an interface can extend other interfaces. it supports multiple inheritances, which means it can extend more than one interface. But every class which wants to use an interface must add it by keyword `implements` and using the keyword `extends` for interfaces in classes is illegal and cause compile error.
  
- **Difference between abstract and interface?** </br>
  | Interface     | Abstract class     |
  | :------------- | :------------- |
  | Support multiple inheritances | Does not support multiple inheritances |
  | Can extends another interfaces only | Can extends another class and implement multiple interfaces |
  | Does not contain data member | Contains data member |
  | Does not contains constructors | contains constructors  |
  | In Java Contains only incomplete member (signature of member) | Contains both signature (abstract) of method and member functions |
  | Cannot have access modifiers by default and everything is assumed as public | Can has access modifiers for subs, methods and fields |

* **Does Java support multiple inheritance?** </br>
  Java supports multiple inheritance by interface only since it can implement multiple interfaces but can extend only one class.</br>
   
* **What is Encapsulation?**
   - Encapsulation involves binding code and data together as a single unit. 
   - Encapsulation is a technique used for hiding the properties and behaviors of an object and allowing outside access only as appropriate. It prevents other objects from directly altering or accessing the properties or methods of the encapsulated object. 
   - For instance, a class can be an encapsulated class if all the variables in it are defined as Private and by providing getter and setter methods.
   - The fields of a class can be made read-only or write-only.
   - A class can have total control over what is stored in its fields.

* **What is Abstract class?**
   * Abstract classes are classes that contain one or more abstract methods. An abstract method is a method that is declared, but contains no implementation. 
   * If even a single method is abstract, the whole class must be declared abstract.
   * Abstract classes may not be instantiated, and require subclasses to provide implementations for the abstract methods.
   * You can’t mark a class as both abstract and final.
   * Non-abstract methods can access a method that you declare as abstract.</br>
   
- **What is Polymorphism?** </br>
  The word polymorphism means having many forms. In simple words, we can define polymorphism as the ability of a message to be displayed in more than one form. In Java polymorphism is mainly divided into two types: compile-time and runtime polymorphism.

- **What is the difference between static and dynamic Polymorphism?** </br>
  *method overloading* represents a *static* form of polymorphism. method overloading means using two or more functions with same name but with the different parameters. Static polymorphism is resolved on compile-time and that is why it's called static. An example of this would be as follow:

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

  *method overriding* represents a *dynamic* form of polymorphism. It is a process in which a function call to the overridden method is resolved at Runtime. It is also known as *Dynamic Method Dispatch*. dynamic polymorphism is resolved at runtime. An example of this would be as follow:

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

  Output:
  ```
  subclass1
  subclass2
  ```
  
- **What is the difference between overriding and overloading?** </br>

  | Method Overloading      | Method Overriding     |
  | :-------------   | :------------- |
  | Method overloading is a compile time polymorphism.         | Method overriding is a run time polymorphism.       |
  | It help to rise the readability of the program. | While it is used to grant the specific implementation of the method which is already provided by its parent class or super class. |
  | It is occur within the class.	 | 	While it is performed in two classes with inheritance relationship. |
  | Method overloading may or may not require inheritance. | While method overriding always needs inheritance. |
  | In this, methods must have same name and different signature. | While in this, methods must have same name and same signature. |
  | In method overloading, return type can or can not be be same, but we must have to change the parameter. | While in this, return type must be same or co-variant. |
   
* **Why would you not call abstract method in constructor?** </br>
  The problem is that the class is not yet fully initialized, and when the method is called in a subclass, it may cause trouble.</br>
       
* **Difference between Encapsulation & Abstraction?** </br>
   * **Abstraction** focuses on the outside view of an object (i.e. the interface) 
   * **Encapsulation** (information hiding) prevents clients from seeing it’s inside view. 
   * Abstraction solves the problem in the design side while Encapsulation is the Implementation.</br>

* **What is serialization? How do you implement it?** </br>
    Serialization is the process of converting an object into a stream of bytes in order to store an object into memory so that it can be recreated at a later time while still keeping the objects original state and data. In Java there are two methods of doing this, one is by implementing Serializable or Parcelable. In Android, however, Serializable should never be used in Android. Parcelable was created to be more efficient then Serializable, and performs about 10x faster then Serializable because Serializable uses reflection which is a slow process and tends to create a lot of temporary objects which may cause garbage collection to occur more often.

* **What is Transient Keyword?** [Link](https://www.geeksforgeeks.org/transient-keyword-java/)

* **Why is Java said to be platform independent?** </br>
  The execution of the code does not depend upon the OS
   
* **Difference between ‘throw’ and ‘throws’ in Java Exception Handling?** </br>
  ```throw``` keyword is used to throw Exception from any method or static block whereas ```throws``` is used to indicate that which Exception can possibly be thrown by this method.
   
* **Is there ever a scenario where we can skip the finally block in a try catch?** </br>
  By Calling System.exit(0) in try or catch block, we can skip the finally block. System.exit(int) method can throw a SecurityException. If System.exit(0) exits the JVM without throwing that exception then finally block will not execute. But, if System.exit(0) does throw security exception then finally block will be executed.</br>

* **What are anonymous classes?** </br>
   * An anonymous class is just what its name implies -- it has no name. It combines the class declaration and the creation of an instance of the class in one step. Since anonymous classes have no name, objects can not be instantiated from outside the class in which the anonymous class is defined. In fact, an anonymous object can only be instantiated from within the same scope in which it is defined.
   * Rules:
      * An anonymous class must always extend a super class or implement an interface but it cannot have an explicit extends or implements clause.
      * An anonymous class must implement all the abstract methods in the super class or the interface.
      * An anonymous class always uses the default constructor from the super class to create an instance.
      * Example: 
      ``` 
      MyButton.setOnClickListener(new Button.OnClickListener {
             @override
                public void onClick(View view){
                    //some code
                }
         });
 </br>

- **What is Java Try with Resources?** [Link](http://tutorials.jenkov.com/java-exception-handling/try-with-resources.html)

- **What are the Java 8 Interface changes?** [Link](https://beginnersbook.com/2017/10/java-8-interface-changes-default-method-and-static-method/)

- **What is Function Interface?** [Link](https://www.geeksforgeeks.org/functional-interfaces-java/)
      
* **Why is the main method static in java?** </br>
   * The method is static because otherwise there would be ambiguity on which method to be called. If static is removed from the main method, Program compiles successfully . But at runtime throws an error “NoSuchMethodError”.
   * We can overload the main method in Java. But the program doesn’t execute the overloaded main method when we run your program, we need to call the overloaded main method from the actual main method only. To run a method without calling this main method, we would need to execute a static block.
   * In order to avoid NoSuchMethodError, we can call System.exit(0) after the static method.
   * Note: Any method declared static will be executed even before the main class is executed.
   * Example:
   ```
   public class Hello { 
       static { 
        System.out.println("Hello, World!"); 
       } 
     }
     ```
   </br>
   
      
* **What is garbage collector? How does it work?** </br>
  All objects are allocated on the heap area managed by the JVM. As long as an object is being referenced, the JVM considers it alive. Once an object is no longer referenced and therefore is not reachable by the application code, the garbage collector removes it and reclaims the unused memory.</br>
   
* **Difference between stack memory & heap memory?** </br>
   * Stack is used for static memory allocation and Heap for dynamic memory allocation, both stored in the computer's RAM .
   * Variables allocated on the stack are stored directly to the memory and access to this memory is very fast, and it's allocation is dealt with when the program is compiled. When a function or a method calls another function which in turns calls another function etc., the execution of all those functions remains suspended until the very last function returns its value. The stack is always reserved in a LIFO order, the most recently reserved block is always the next block to be freed. This makes it really simple to keep track of the stack, freeing a block from the stack is nothing more than adjusting one pointer.
   * Variables allocated on the heap have their memory allocated at run time and accessing this memory is a bit slower, but the heap size is only limited by the size of virtual memory . Element of the heap have no dependencies with each other and can always be accessed randomly at any time. You can allocate a block at any time and free it at any time. This makes it much more complex to keep track of which parts of the heap are allocated or free at any given time.
   * You can use the stack if you know exactly how much data you need to allocate before compile time and it is not too big. You can use heap if you don't know exactly how much data you will need at runtime or if you need to allocate a lot of data.
   * In a multi-threaded situation each thread will have its own completely independent stack but they will share the heap. Stack is thread specific and Heap is application specific. The stack is important to consider in exception handling and thread executions.
       * Heap memory is used by all the parts of the application whereas stack memory is used only by one thread of execution.
       * Whenever an object is created, it’s always stored in the Heap space and stack memory contains the reference to it. Stack memory only contains local primitive variables and reference variables to objects in heap space.
       * Objects stored in the heap are globally accessible whereas stack memory can’t be accessed by other threads.
       * Memory management in stack is done in LIFO manner whereas it’s more complex in Heap memory because it’s used globally. Heap memory is divided into Young-Generation, Old-Generation etc, more details at Java Garbage Collection.
       * Stack memory is short-lived whereas heap memory lives from the start till the end of application execution.
       * When stack memory is full, Java runtime throws java.lang.StackOverFlowError whereas if heap memory is full, it throws java.lang.OutOfMemoryError: Java Heap Space error.
       * Stack memory size is very less when compared to Heap memory. Because of simplicity in memory allocation (LIFO), stack memory is very fast when compared to heap memory.</br>   
   
* **Constructors vs Methods?** </br>
   * **Constructors** must have the name as the class name and does not have a return type. It can be used to instantiate any objects in the class whereas methods have no such rule and is another member of the class. Constructors cannot be inherited but a derived class can call the super constructor of parent class.
   * ```this()```: Constructors use this to refer to another constructor in the same class with a different parameter list.
   * ```super()```: Constructors use super to invoke the superclass's constructor.
   * **Methods**: Instance methods on the other hand require an instance of the class to exist before they can be called, so an instance of a class needs to be created by using the new keyword. Class methods are methods which are declared as static. The method can be called without creating an instance of the class</br>
   
* **What is the difference between instantiation and initialization of an object?** </br>
   * **Initialization** is the process of the memory allocation, when a new variable is created. Variables should be explicitly given a value, otherwise they may contain a random value that remained from the previous variable that was using the same memory space. To avoid this problem, Java language assigns default values to data types.
   * **Instantiation** is the process of explicitly assigning definitive value to a declared variable.</br>
  
* **Do objects get passed by reference or value in Java? Elaborate on that.** </br>
   * Java is always pass-by-value. When we pass the value of an object, we are passing the reference to it. 
   * Java creates a copy of the variable being passed in the method and then does the manipulations. Hence the change is not reflected in the main method.
   * But when you pass an object reference into a method, a copy of this reference is made, so it still points to the same object. This means, that any changes that you make to the insides of this object are retained, when the method exits.
   * Java copies and passes the reference by value, not the object. Thus, method manipulation will alter the objects, since the references point to the original objects. But since the references are copies, swaps will fail.</br>
   
* **Primitives in Java?** </br>
  <a href="https://github.com/anitaa1990/Android-Cheat-sheet/blob/master/media/2.png" target="_blank"><img src="https://github.com/anitaa1990/Android-Cheat-sheet/blob/master/media/2.png"></a></br>

* **Difference between == and .equals() method in Java?** </br>
  - The `equals()` method compares two strings, character by character, to determine equality.
  - The `==` operator checks to see whether two object references refer to the same instance of an object
   
* **Why strings are Immutable?** </br>
  Once a value is assigned to a string it cannot be changed. And if changed, it creates a new object of the String. This is not the case with StringBuffer.</br>
   
* **What is String.intern()? When and why should it be used?** </br>
   * String.intern() method can be used to to deal with String duplication problem in Java. By carefully using the intern() method you can save a lot of memories consumed by duplicate String instances. A string is duplicate if it contains the same content as another string but occupied different memory location.
   * By calling  the intern() method on a string object, for instance “abc”, you can instruct JVM to put this String in the pool and whenever someone else creates "abc", this object will be returned instead of creating a new object. This way, you can save a lot of memory in Java, depending upon how many Strings are duplicated in your program.
   * When the intern method is invoked, if the String pool already contains that String object such that equals() return true, it will return the String object from the pool, otherwise it will add that object to the pool of unique String.</br>
   
* **String pool in Java:** </br>
   * String Pool in java is a pool of Strings stored in Java Heap Memory. 
   * When we use double quotes to create a String, it first looks for String with same value in the String pool, if found it just returns the reference else it creates a new String in the pool and then returns the reference.
   * However using new operator, we force String class to create a new String object in heap space. We can use intern() method to put it into the pool or refer to other String object from string pool having same value.
   * For example, how many strings are getting created in below statement;
  ``` String str = new String("Cat");```
   * In above statement, either 1 or 2 string will be created. If there is already a string literal “Cat” in the pool, then only one string “str” will be created in the pool. If there is no string literal “Cat” in the pool, then it will be first created in the pool and then in the heap space, so total 2 string objects will be created.</br>

* **<i>Final</i> modifier?** </br>
   * Final modifiers - once declared cannot be modified. A blank final variable in Java is a final variable that is not initialized during declaration. 
      * final Classes- A final class cannot have subclasses.
      * final Variables- A final variable cannot be changed once it is initialized.
      * final Methods- A final method cannot be overridden by subclasses.</br>

   ```java
   final public class CantOverrideClass {
     public final void cantOverrideMethod(){}
   }
   ```
      
* **<i>Finalize</i> keyword?** </br>
  `finalize()` method is a protected and non-static method of java.lang.Object class. This method will be available in all objects you create in java. This method is used to perform clean up processing just before object is garbage collected. you can override the `finalize()` method to keep those operations you want to perform before an object is destroyed. Here is the general form of `finalize()` method.

  ```java
  protected void finalize() throws Throwable {
    //Keep some resource closing operations here
  }
  ```
   
* **<i>Finally</i> keyword?** </br>
  finally is a code block and is used to place important code, it will be executed whether exception is handled or not.</br>

- **What is a static variables in Java?** </br>
  static is a non-access modifier in Java which is applicable for the following:
    - blocks
    - variables
    - methods
    - nested classes

  Variables that have only one copy per class are known as static variables. When a variable is declared as static, then a single copy of variable is created and shared among all objects at class level. Static variables are, essentially, global variables. </br>

  Important points for static variables:
    - We can create static variables at class-level only. See [here](https://www.geeksforgeeks.org/g-fact-47/)
    - static block and static variables are executed in order they are present in a program.

- **Overriding for static method, possible?** </br>
  quick response: no! </br>

  Inheritance comes from object-oriented principles, all of OOP principles needs objects to apply on. when we talk about inheritance, it means we deal with some objects which have relationships with each other. Besides, "overriding" is a feature of OOP principle which is related to run-time polymorphism. The implementation to be executed is decided at run-time and the decision is made according to the object used for the call.

  On the other hand, static methods belong to the class not object. So we use static methods without the need for creating an instance of a class. Besides, static methods are resolved in compile-time. Hence the answer is 'NO'.
  
* **What is reflection?** </br>
  Java Reflection makes it possible to inspect classes, interfaces, fields and methods at runtime, without knowing the names of the classes, methods etc. at compile time. It is also possible to instantiate new objects, invoke methods and get/set field values using reflection.</br> 
   
* **Multi threading?** </br>
  Multiple tasks are running concurrently in a program.</br>
   
* **Fail-fast & Fail-Safe?** </br>
   * Fail-fast Iterators throws ConcurrentModificationException when one Thread is iterating over collection object and other thread structurally modify Collection either by adding, removing or modifying objects on underlying collection. They are called fail-fast because they try to immediately throw Exception when they encounter failure. 
   * On the other hand [fail-safe](http://javarevisited.blogspot.com/2011/10/java-iterator-tutorial-example-list.html) Iterators works on copy of collection instead of original collection.</br>
   
* **What does the keyword synchronized mean?** </br>
   * When you have two threads that are reading and writing to the same 'resource', say a variable named 'test', you need to ensure that these threads access the variable in an atomic way. Without the synchronized keyword, your thread 1 may not see the change thread 2 made to test.
   * **synchronized** blocks the next thread's call to method as long as the previous thread's execution is not finished. Threads can access this method one at a time.</br>
   
* **What does the keyword volatile mean?** </br>
   * Suppose two threads are working on a method. If two threads run on different processors each thread may have its own local copy of variable. If one thread modifies its value the change might not reflect in the original one in the main memory instantly. 
   * Now the other thread is not aware of the modified value which leads to data inconsistency.Essentially, volatile is used to indicate that a variable's value will be modified by different threads. “volatile” tells the compiler that the value of a variable must never be cached as its value may change outside of the scope of the program itself.
   * The value of this variable will never be cached thread-locally: all reads and writes will go straight to "main memory"
   * An access to a volatile variable never has the potential to block: we're only ever doing a simple read or write, so unlike a synchronized block we will never hold on to any lock.</br>
   
* **Optionals in Java?** </br>
  Optional is a container object which is used to contain not-null objects. Optional object is used to represent null with absent value. This class has various utility methods to facilitate code to handle values as ‘available’ or ‘not available’ instead of checking null values.</br>
   
* **What is externalization?** </br>
   * In serialization, the JVM is responsible for the process of writing and reading objects. This is useful in most cases, as the programmers do not have to care about the underlying details of the serialization process.
   * However, the default serialization does not protect sensitive information such as passwords and credentials.
   * Thus externalization comes to give the programmers full control in reading and writing objects during serialization.
   * Implement the java.io.Externalizable interface - then you implement your own code to write object’s states in the ```writeExternal()``` method and read object’s states in the ```readExternal()``` method.</br>

- **What is an object cloning? can you use clone() method of every object?** </br>
  Object cloning refers to creation of exact copy of an object. It creates a new instance of the class of current object and initializes all its fields with exactly the contents of the corresponding fields of this object. Every class that implements `clone()` methods should call super.clone() to obtain the cloned object reference. Also it must implement java.lang.Cloneable interface otherwise it will throw CloneNotSupportedException when clone method is called on that class’s object.
  ```java
  protected Object clone() throws CloneNotSupportedException
  ```

- **What is the difference between Shallow copy and deep copy?** </br>
  - **Shallow copy**: is method of copying an object and is followed by default in cloning. In this method the fields of an old object X are copied to the new object Y. While copying the object type field the reference is copied to Y i.e object Y will point to same location as pointed out by X. If the field value is a primitive type it copies the value of the primitive type.
  Therefore, any changes made in referenced objects in object X or Y will be reflected in other object.
  ```java
  class Test  {
      int x, y;
  }   
  // Contains a reference of Test and implements
  // clone with shallow copy.
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

        Test2 t2 = (Test2)t1.clone();

        // Creating a copy of object t1 and passing
        //  it to t2
        t2.a = 100;

        // Change in primitive type of t2 will not
        // be reflected in t1 field
        t2.c.x = 300;

        // Change in object type field will be
        // reflected in both t2 and t1(shallow copy)
        System.out.println(t1.a + " " + t1.b + " " +
                          t1.c.x + " " + t1.c.y);
        System.out.println(t2.a + " " + t2.b + " " +
                          t2.c.x + " " + t2.c.y);
      }
  }
  ```
  Output:
  ```
  10 20 300 40
  100 20 300 40
  ```

  - **Deep Copy**: If we want to create a deep copy of object X and place it in a new object Y then new copy of any referenced objects fields are created and these references are placed in object Y. This means any changes made in referenced object fields in object X or Y will be reflected only in that object and not in the other.

    A deep copy copies all fields, and makes copies of dynamically allocated memory pointed to by the fields. A deep copy occurs when an object is copied along with the objects to which it refers.

    ```java
    class Test {
      int x, y;
    }   
    // Contains a reference of Test and implements
    // clone with deep copy.
    class Test2 implements Cloneable {
      int a, b;

      Test c = new Test();

      public Object clone() throws CloneNotSupportedException {
        // Assign the shallow copy to new reference variable t
        Test2 t = (Test2)super.clone();

        t.c = new Test();

        // Create a new object for the field c
        // and assign it to shallow copy obtained,
        // to make it a deep copy
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

        Test2 t3 = (Test2)t1.clone();
        t3.a = 100;

        // Change in primitive type of t2 will not
        // be reflected in t1 field
        t3.c.x = 300;

        // Change in object type field of t2 will not
        // be reflected in t1(deep copy)
        System.out.println(t1.a + " " + t1.b + " " +
                          t1.c.x + " " + t1.c.y);
        System.out.println(t3.a + " " + t3.b + " " +
                          t3.c.x + " " + t3.c.y);
      }
    }

    ```
    Output:
    ```
    10 20 30 40
    100 20 300 0
    ```

- **Multiple inheritances? Possible? How can we do that?** </br>
  Multiple inheritance in Java programming is achieved or implemented using interfaces. Java does not support multiple inheritance using classes. In simple term, a class can inherit only one class and multiple interfaces in a java programs.

- **Object scopes?** </br>
  `public` , `protected` , default (no modifier) , `private`

  | Modifier     | Package     | Subclass     | World     |
  | :------------- | :------------- | :------------- | :------------- |
  | Public       | Yes       | Yes       | Yes       |
  | protected       | Yes      | Yes       | No       |
  | Default (no modifier)       | Yes       | No       | No       |
  | private       | No       | No       | No       |


- **Override private methods, possible?** </br>
  No, a private method cannot be overridden since it is not visible from any other class.

- **why access to the non-static variable is not allowed from static method in Java?** </br>
  because non-static variable are associated with a specific instance of an object while static is not associated with any instance.

- **What is the difference between int and Integer?** </br>
  `int` is a primitive type, while `Integer` is class with a single field of type `int`. Variables of type `int` store the avtual binary value for the integer. Variables of type `Integer` store references to `Integer` objects, just as with any other reference (object) type. The `Integer` class is used where you need an `int` to be treated like any other object, such as in generic types or situations where you need nullability.

- **What are Autoboxing and unboxing?** </br>
  - **Autoboxing:** Converting a primitive value into an object of the corresponding wrapper class is called autoboxing. For example, converting `int` to `Integer` class.
  - **Unboxing:**  Converting an object of a wrapper type to its corresponding primitive value is called unboxing. For example conversion of `Integer` to `int`.

- **What is `transient` modifier? What does it come for?** </br>
  [complete explanation](https://www.geeksforgeeks.org/transient-keyword-java/)

- **What is the `hashCode()` used for?** </br>
  `hashcode()` returns the hashcode value as an Integer. Hashcode value is mostly used in hashing based collections like HashMap, HashSet, HashTable….etc. According to the official documentation, The general contract of `hashCode()` is:
    - Whenever it is invoked on the same object more than once during an execution of a Java application, the hashCode method must consistently return the same integer, provided no information used in equals comparisons on the object is modified. This integer need not remain consistent from one execution of an application to another execution of the same application.
    - If two objects are equal according to the equals(Object) method, then calling the hashCode method on each of the two objects must produce the same integer result.
    - It is not required that if two objects are unequal according to the equals(java.lang.Object) method, then calling the hashCode method on each of the two objects must produce distinct integer results. However, the programmer should be aware that producing distinct integer results for unequal objects may improve the performance of hashtables.

- **What are "annotations"?** </br>
  Java annotations are used to provide meta data for your Java code. Being meta data, Java annotations do not directly affect the execution of your code, although some types of annotations can actually be used for that purpose. [read more](http://tutorials.jenkov.com/java/annotations.html)

- **What is Java ExecutorService** [Link](https://www.javatpoint.com/java-executorservice)

- **What is thread-safe mean? How we can make our code thread-safe?** </br>
  Thread safety in java is the process to make our program safe to use in multithreaded environment, there are different ways through which we can make our program thread safe.
    - Synchronization
    - Use of Atomic Wrapper, For example AtomicInteger.
    - Use of locks from java.util.concurrent.locks package.
    - Using thread safe collection classes
    - Using volatile keyword.

  Note that if two threads are both reading and writing to a shared variable, then using the volatile keyword for that is not enough. You need to use a synchronized in that case to guarantee that the reading and writing of the variable is atomic. Reading or writing a volatile variable does not block threads reading or writing. For this to happen you must use the synchronized keyword around critical sections.

- **what is the difference between `throw` and `throws`?** </br>
  Keyword `throw` is used to explicitly throw as an exception in the body of function, while `throws` is utilized to handle checked exceptions for re-intimating the compiler that exceptions are being handled. The throws need to be used in the function’s signature and also while invoking the method that raises checked exceptions.

* **What is a deadlock in Java** </br>
   * A deadlock occurs when a thread enters a waiting state because a requested system resource is held by another waiting process, which in turn is waiting for another resource held by another waiting process.
   * [Example on how deadlock occurs](/src/deadlock/ThreadLockDemo.java)
   * [Example on how to prevent deadlock](/src/deadlock/ThreadLockFixedDemo.java)</br>
   
* **What is the List interface & Set interface?** </br>
   * List interface supports for ordered collection of objects and it may contain duplicates. The Set interface provides methods for accessing the elements of a finite mathematical set. Sets do not allow duplicate elements</br>

* **Difference between ArrayList & Vectors?** </br>
   * Vectors are thread safe (synchronized) whereas arraylists are not. So performance of arraylists are better than vectors.    * In ArrayList, you have to start searching for a particular element from the beginning of an Arraylist. But in the Vector, you can start searching for a particular element from a particular position in a vector. This makes the search operation in Vector faster than in ArrayList. Vectors have a default size of 10 whereas arraylists size can be dynamic. 
   * **Insertion and deletion in ArrayList is slow compared to LinkedList?**
       * ArrayList internally uses an array to store the elements, when that array gets filled by inserting elements a new array of roughly 1.5 times the size of the original array is created and all the data of old array is copied to new array.
       * During deletion, all elements present in the array after the deleted elements have to be moved one step back to fill the space created by deletion. In linked list data is stored in nodes that have reference to the previous node and the next node so adding element is simple as creating the node and updating the next pointer on the last node and the previous pointer on the new node. Deletion in linked list is fast because it involves only updating the next pointer in the node before the deleted node and updating the previous pointer in the node after the deleted node.</br>      
      
* **Implementations of Map?** </br>
   * **TreeMap**: sorted based on ascending order of keys. For inserting, deleting, and locating elements in a Map, the HashMap offers the best alternative. If, however, you need to traverse the keys in a sorted order, then TreeMap is your better alternative.
   *	**HashTable**: Does not allow null values. It is not fail-safe and it is synchronized whereas 
   * **HashMap** allows null values and it is fail-safe and it is not synchronized. 
   * **LinkedHashMap**: This is a subclass of Hashmap. The order of insertion is preserved since it has a linkedList.</br>
   
* **Difference between Enumeration and Iterators?** </br>
   * **Enumeration** does not include remove() method whereas iterators do. Enumerators act as read only interface as it provides methods to read and traverse through a collection. 
   * **ListIterator**: is just like an iterator except it allows access to the collection in either the forward or backward direction</br>
   
* **How Hashmap works in Java?** </br>
   * HashMap in Java works on hashing principle. It is a data structure which allows us to store object and retrieve it in constant time O(1) provided we know the key. When we call put method, ```hashcode()``` method of the key object is called so that hash function of the map can find a bucket location to store Entry object.
   * If two different objects have the same hashcode: in this case, a linked list is formed at that bucket location and a new entry is stored as next node. After finding bucket location, we will call ```keys.equals()``` method to identify a correct node in LinkedList and return associated value object for that key in Java HashMap</br>
   
* **Generics in Java** </br>
   * Before generics, we can store any type of objects in collection i.e. non-generic. Now generics, forces the java programmer to store specific type of objects.
   * Type-safety : We can hold only a single type of objects in generics. It doesn’t allow to store other objects.
   * Type casting is not required: There is no need to typecast the object.
   * Compile-Time Checking: It is checked at compile time so problem will not occur at runtime. The good programming strategy says it is far better to handle the problem at compile time than runtime.
   * Before Generics, we need to type cast.
   ```
   List list = new ArrayList();  
   list.add("hello");  
   String s = (String) list.get(0); //typecasting  
   ```
    * After Generics, we don't need to typecast the object.
    ```
    List<String> list = new ArrayList<String>();  
    list.add("hello");  
    String s = list.get(0);  
    ```

*  **Types of Observable in Rx-Java** [Link](https://blog.mindorks.com/understanding-types-of-observables-in-rxjava-6c3a2d0819c8)

*  **Rx-Java Scheduler what, when, how?** [Link](https://medium.com/android-news/rxjava-schedulers-what-when-and-how-to-use-it-6cfc27293add)
   
* **RxJava Subject - Publish, Replay, Behavior, and Async** [Link](https://amitshekhar.me/blog/rxjava-subject-publish-replay-behavior-async)

*  **Executor Service** [Link](https://www.javatpoint.com/java-executorservice)
     
*  **What is an Observable in RXJava2?** <br/>
    An Observable  simply emits the data to those which subscribed to it. All the emission is done asynchronously to the subscribers. A simple Observable can be created as follows:

    ```java
    // RxAndroid Tutorial - Adding Observable
    Observable<String> stringObservable = Observable.just("Hello Reactive Programming!");
    ```
*  **What is an Observer in RXJava2?** <br/>
    Observer consumes the data emitted by the Observable. To do this, Observer needs to subscribe to the Observable. Example shows how to create an Observable in RxJava2.
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

*  **How to Subscribe / Unsubscribe in RXJava?** <br/>
    We can make an Observer to subscribe to Observable as follows:
    ```java
    // RxAndroid tutorial - observer subscribing to observable
    stringObservable.subscribe(stringObserver);
    ```
    
*  **What are the different types of Observables in RxJava?** [Link](https://amitshekhar.me/blog/types-of-observables-in-rxjava)<br/>
    1) single
    2) Maybe
    3) Completable
    4) Observable
    5) Flowable

*  **What is a Single in RxJava?** <br/>
    A Single in RxJava is an Observable which emits only one item if completed or returns error.

*  **What is Maybe in RxJava?** <br/>
    A Maybe in RxJava is used when the Observable needs to emit a value or a no value or an error.

*  **What is Completable in RxJava?** <br/>
    A Completable in RxJava is an Observable which just completes the task and does not emit anything if completed. It returns an error if anything fails.
    It is similar to reactive concept of runnable.

*  **What is Back Pressure in RxJava?** <br/>
    Back Pressure is the state where your observable (publisher) is creating more events than your subscriber can handle.

*  **What is Flowable in RxJava?** <br/>
    A Flowable in RxJava is used when the Observable emits more data than the Observer can consume. In Other words, Flowable can handle back pressure where as an Observable cannot.

*  **What is a Cold Observable?** <br/>
    A Cold Observable is an Observable that does not emit items until a Subscriber subscribes. If we have more than one Subscriber, then the Cold Observable will emit each sequence of items to all Subscribers one by one.

*  **What is a Hot Observable?** <br/>
    A Hot observable is an Observer that will emit items

*  **What is Design Pattern?**
   - https://www.digitalocean.com/community/tutorials/java-design-patterns-example-tutorial
   - https://www.journaldev.com/1827/java-design-patterns-example-tutorial#singleton-pattern
   - https://blog.mindorks.com/mastering-design-patterns-in-android-with-kotlin
   - https://github.com/iluwatar/java-design-patterns
   - https://github.com/Kiran7007/Interview-Question/edit/main/README.md
   
    <img src="https://github.com/Kiran7007/Interview-Question/assets/18071333/4ca96de4-8701-41e6-ab58-10536aab7d09" alt="Lamp" width="600"> </br>

- **What is the difference between factory and abstract factory design pattern?** </br>
  Both factory and abstract factory are creational design patterns. The majordifference between these two is, a factory pattern creates an object through inheritance and produces only one Product. On the other hand, an abstract factory pattern creates the object through composition and produce families of products. In other word an abstract factory is "factory of factories". You can find an example [___here___]("https://www.journaldev.com/1418/abstract-factory-design-pattern-in-java").

- **What is Creational Design Patterns?** [Link](https://www.baeldung.com/kotlin/builder-pattern)

- **What are the drawbacks of using singleton design pattern?**
  - **Testability issue:** The bad thing with singletons is that the `getInstance()` method is globally accessible. That means that you usually call it from within a class, instead of depending on an interface you can later mock. That's why it's impossible to replace it when you want to test the method or the class.
  - **Tight Coupling:** The singleton object is exposed globally and is available to a whole application. Thus, classes using this object become tightly coupled. So any change in the global object will impact all other classes using it.
  - **Violation issues:** Singleton principle can be violated by techniques such as cloning. If an application is running on multiple JVM’s, then, in this case, Singleton might be broken. </br>
    
### Kotlin

* **Kotlin interview Questions**
   - https://blog.mindorks.com/kotlin-android-interview-questions
   - https://www.ubuntupit.com/frequently-asked-kotlin-interview-questions-and-answers/
   - https://www.fullstack.cafe/blog/kotlin-interview-questions

* **Companion Object** [Link](https://blog.mindorks.com/what-is-the-equivalent-of-java-static-methods-in-kotlin/)

* **Understanding Open keyword in Kotlin** [Link](https://blog.mindorks.com/understanding-open-keyword-in-kotlin)

* **Bitwise and Bitshift Operations** [Link](https://www.programiz.com/kotlin-programming/bitwise)

* **Kotlin Collection Functions** [Link](https://blog.mindorks.com/kotlin-collection-functions)
 
* **Map vs Flatmap** [Link](https://www.linkedin.com/feed/update/urn:li:activity:6770786744422998017/)
 
* **Understanding Suspend function** [Link](https://medium.com/mobile-app-development-publication/understanding-suspend-function-of-coroutines-de26b070c5ed)

* **Coroutine runblocking** [Link](https://www.geeksforgeeks.org/runblocking-in-kotlin-coroutines-with-example)

* **Thread Safe mthods and blocks** [Link](https://proandroiddev.com/synchronization-and-thread-safety-techniques-in-java-and-kotlin-f63506370e6d) </br>

### Core Android

* **What is `Application` class?** <br/>
  The Application class in Android is the base class within an Android app that contains all other components such as activities and services. The Application class, or any subclass of the Application class, is instantiated before any other class when the process for your application/package is created.

* **What is Context?** </br>
  A Context is a handle to the system; it provides services like resolving resources, obtaining access to databases and preferences, and so on. An Android app has activities. Context is like a handle to the environment your application is currently running in.</br>
**Application Context:** This context is tied to the lifecycle of an application. The application context can be used where you need a context whose lifecycle is separate from the current context or when you are passing a context beyond the scope of an activity.</br>
**Activity Context:** This context is available in an activity. This context is tied to the lifecycle of an activity. The activity context should be used when you are passing the context in the scope of an activity or you need the context whose lifecycle is attached to the current context.</br>

*  **Compilesdkversion vs Targetsdkversion** [Link](https://stackoverflow.com/questions/26694108/what-is-the-difference-between-compilesdkversion-and-targetsdkversion)

- **What is onSavedInstanceState() and onRestoreInstanceState() in activity?** <br/>
    - **onSavedInstanceState()** - This method is used to store data before pausing the activity.
    - **onRestoreInstanceState()** - This method is used to recover the saved state of an activity when the activity is recreated after destruction. Both the ```onCreate()``` and ```onRestoreInstanceState()``` callback methods receive the same Bundle that contains the instance state information. But because the ```onCreate()``` method is called whether the system is creating a new instance of your activity or recreating a previous one, you must check whether the state Bundle is null before you attempt to read it. If it is null, then the system is creating a new instance of the activity, instead of restoring a previous one that was destroyed.

- **When should you use a Fragment rather than an Activity?**
    - When there are ui components that are going to be used across multiple activities.
    - When there are multiple views that can be displayed side by side (viewPager tabs)
    - When you have data that needs to be persisted across Activity restarts (such as retained fragments)</br>

* **ViewPager vs ViewPager2**
   - https://developer.android.com/training/animation/vp2-migration
   - https://developer.android.com/develop/ui/views/animations/vp2-migration

- **What is the difference between FragmentPagerAdapter vs FragmentStatePagerAdapter?**
    - **FragmentPagerAdapter:** Each fragment visited by the user will be stored in the memory but the view will be destroyed. When the page is revisited, then the view will be recreated not the instance of the fragment. This can result in a significant amount of memory being used. FragmentPagerAdapter should be used when we need to store the whole fragment in memory. FragmentPagerAdapter calls ```detach(Fragment)``` on the transaction instead of ```remove(Fragment)```.
    - **FragmentStatePagerAdapter:** the fragment instance is destroyed when it is not visible to the User, except the saved state of the fragment. This results in using only a small amount of Memory and can be useful for handling larger data sets. Should be used when we have to use dynamic fragments, like fragments with widgets, as their data could be stored in the savedInstanceState.Also it won't affect the performance even if there are large number of fragments.</br>  

- **What is the difference between adding/replacing fragment in backstack?** </br>
    ![image](https://user-images.githubusercontent.com/18071333/109423939-88001a80-7a07-11eb-995e-b7d16c5e51bb.png)
    ![image](https://user-images.githubusercontent.com/18071333/109423948-95b5a000-7a07-11eb-8aa6-840f01beb236.png)
    ![image](https://user-images.githubusercontent.com/18071333/109423954-9d754480-7a07-11eb-9e45-ea95fa038feb.png)
    <br>
    <p align="center">
        <img src="https://user-images.githubusercontent.com/18071333/109424405-7ae42b00-7a09-11eb-94b1-a2d648d7d33e.png" width="400">
        <img src="https://user-images.githubusercontent.com/18071333/109424414-86cfed00-7a09-11eb-848c-0948dc8fceab.png" width="400">
    </p>
    <br>

- **View & ViewGroup**
   - **View**: View objects are the basic building blocks of User Interface(UI) elements in Android. View is a simple rectangle box which responds to the user's actions. Examples are EditText, Button, CheckBox etc. View refers to the ```android.view.View``` class, which is the base class of all UI classes.
   - **ViewGroup**: ViewGroup is the invisible container. It holds View and ViewGroup. For example, LinearLayout is the ViewGroup that contains Button(View), and other Layouts also. ViewGroup is the base class for Layouts.</br> 

- **Why do android apps need to ask permission like `INTERNET` or `LOCATION`?** </br>
  The Android platform takes advantage of the Linux user-based protection to identify and isolate app resources called sandbox. This isolates apps from each other and protects apps and the system from malicious apps. If an app needs to use some system resources (like internet, or location sensor,..) or needs to connect other apps (like IAB library), it should request this access. Then android OS give this request and get permission to access the resource. If you want to use system resources, request the permission under the `<uses-permission>` tag in the `android-manifest.xml` file.

- **Differences between `serializable` and `Parcelable`?** </br>
  Serializable is a standard java interface but not a part of the Android SDK. Just by implementating this interface your POJO will be ready to jump from one activity to another. So what's the problem with Serializable? Serializable use reflection during the process and lots of additional temp objects created along the way and it may cause garbage collection to occue more often. That is why the serializable is more than 10x slower than Parcelable.

- **Why `serializable` body is empty? How is it doing?** </br>
  Yes, It's empty because the Java reflection API is performed for marshaling operations (by JVM). This helps identify the Java object's member and behavior but also ends up creating a lot of garbage objects.

- **Which method in `fragment` runs only once?** </br>
  According to the [documentation](https://developer.android.com/guide/components/fragments#Creating), the `onCreate()` method is called once a fragment is created. Within your implementation, you should initialize essential components of the fragment that you want to retain when the fragment is paused or stopped, then resumed.

- **How does the activity respond when orientation is changed?**  </br>
  According to the [documentation](https://developer.android.com/guide/topics/resources/runtime-changes), Some device configurations can change during runtime (such as screen orientation, keyboard availability, and when the user enables multi-window mode). When such a change occurs, Android restarts the running `Activity` ( `onDestroy()` is called, followed by `onCreate()`). The restart behavior is designed to help your application adapt to new configurations by automatically reloading your application with alternative resources that match the new device configuration.

- **How to know `configChange` happens in `onDestroy()` function?**  </br>
  Once an activity is in the process of finishing then `isFinishing()` method is returned `true` value, otherwise `false` when the system is temporarily destroying the instance of the activity.

- **How to prevent the data from reloading when orientation is changed?**  </br>
  The most basic approach would be to use a combination of `ViewModels` and `onSaveInstanceState()`. A `ViewModel` is LifeCycle-Aware. In other words,
  a `ViewModel` will not be destroyed if its owner is destroyed for a
  configuration change (e.g. rotation). The new instance of the owner will
  just re-connected to the existing `ViewModel`. So if you rotate an `Activity`
  three times, you have just created three different `Activity` instances, but
  you only have one `ViewModel`. So the common practice is to store data in the
  `ViewModel` class (since it persists data during configuration changes) and
  use `OnSaveInstanceState()` to store small amounts of UI data.

- **How to handle multiple screen sizes?**  </br>
  It's a long debate but in a very nutshell, you can do it in these ways:
    - Use flexible layout like `ConstraintLayout` unless create alternative layout in different layout folders. (e.g. layout-sw480, layout-sw600, layout-sw720 ...)    
    - Provide different bitmap drawables for different screen densities or use vector assets.
    - Be aware of the screen orientation change approach in your application.
      If you don't want to handle it enforce to use just one orientation (portrait or landscape) through declaring it in the manifest file.

 for complete reading, see the [official documentation](https://developer.android.com/training/multiscreen/screensizes).

- **What is the difference between margin and padding?**
  - **Padding** will be space added inside the container, for instance, if it is a button, padding will be added inside the button.       
  - **Margin** will be space added outside the container.

- **What is `sw` keyword in `layout-sw600` folder meaning?** </br>
  The `sw` keywrod which stands on "smallest width" is an screen size qualifier that allow you to provide alternative layouts for screens that have a minimum width measured in dp.
  The smallest width qualifier specifies the smallest of the screen's two sides, regardless of the device's current orientation, so it's a simple way to specify the overall screen size available for your layout. Here is some useful values:

    - **320dp:** a typical phone screen (240x320 ldpi, 320x480 mdpi, 480x800 hdpi, etc).
    - **480dp:** a large phone screen ~5" (480x800 mdpi).
    - **600dp:** a 7” tablet (600x1024 mdpi).
    - **720dp:** a 10” tablet (720x1280 mdpi, 800x1280 mdpi, etc).

  Figure below provides a more detailed view of how different screen dp widths generally correspond to different screen sizes and orientations.

  ![](/assets/images/layout-adaptive-breakpoints_2x.png)

- **What is the difference between `sw` and `w` and `h` as postfix in order to define the resources folder?**
    - `sw`: The smallest width qualifier specifies the smallest of the screen's two sides, regardless of the device's current orientation,
    - `w`: The width qualifier specifies the available width. For example, if you have a two-pane layout, you might want to use that whenever the screen provides at least 600dp of width, which might change depending on whether the device is in landscape or portrait orientation. Notice that this qualifier is orientation related.
    - `h`: The height qualifier specifies the available height. This is equivalent to `w` qualifier but is used when the available height is a concern.

  The major difference between these qualifiers is responding to orientation change. The `sw` isn't orientation sensitive but the two others are orientation sensitive. It means that if the screen is 480*800 in dp, then in `sw` always `layout-sw480` folder is loaded but in `w`, for portrait mode, `layout-w480`, and landscape mode, `layout-w800` folder is loaded.

- **What are the major differences between `ListView` and `RecyclerView`?**

  - **ViewHolder Pattern**: `Recyclerview` implements the ViewHolders pattern whereas it is not mandatory in a ListView. A `ViewHolder` object stores each of the component views inside the tag field of the Layout, so you can immediately access them without the need to look them up repeatedly. In `ListView`, the code might call `findViewById()` frequently during the scrolling of `ListView`, which can slow down performance. Even when the `Adapter` returns an inflated view for recycling, you still need to look up
    the elements and update them. A way around repeated use of `findViewById()`  is to use the "view holder" design pattern.

  - **LayoutManager**: In a `ListView`, the only type of view available is the `vertical` ListView. A `RecyclerView` decouples list from its container so we can put list items easily at run time in the different containers (linearLayout, gridLayout) by setting LayoutManager.

  - **Item Animator**: `ListViews` are lacking in support of good animations,
    but the `RecyclerView` brings a whole new dimension to it.

- **Difference between `Intent` and `IntentService`?**
  - `Service` is the base class for Android services that can be extended to create any service. A class that directly extends `Service` runs on the main thread so it will block the UI (if there is one) and should therefore either be used only for short tasks or should make use of other threads for longer tasks.

  - `IntentService` is a subclass of `Service` that handles asynchronous requests (expressed as `Intents`) on demand. Clients send requests through `startService(Intent)` calls. The service is started as needed, handles each `Intent` in turn using a worker thread, and stops itself when it runs out of work. [Read More on Mindorks's blog]("https://blog.mindorks.com/service-vs-intentservice-in-android")

- **What is `Fragment`?** </br>
  A `Fragment` is a piece of an activity which enable more modular activity design. A fragment has its layout, its behavior, and its life cycle callbacks. You can add or remove fragments in an activity while the activity is running. You can combine multiple fragments in a single activity to build a multi-pane UI. A fragment can also be used in multiple activities. The fragment life cycle is closely related to its host activity which means when the activity is paused, all the fragments available in the activity will also be stopped.

- **How to pass items to `fragment`?**

  Using `Bundle` you can pass items to the fragment.

- **How would you communicate between two `fragments`?** </br>
  There are several ways to communicate two fragments. Using `interfaces` are a common way to do that. You can connect two fragments through interfaces that are implemented in the parent activity.

- **Difference between adding/replacing `fragment` in `backstack`?**
  - `replace` removes the existing `fragment` and adds a new `fragment`. This means when you press back button the fragment that got replaced will be created with its onCreateView being invoked.

  - `add` retains the existing fragments and adds a new `fragment` that means existing fragment  will be active and they wont be in 'paused' state hence when a back button is pressed onCreateView is not called for the existing fragment(the fragment which was there before new fragment was added).

    In terms of fragment’s life cycle events `onPause()`, `onResume()`, `onCreateView()` and other life cycle events will be invoked in case of `replace` but they wont be invoked in case of `add`.

- **What is the difference between `dialog` and `dialogFragment`?**

  THe `dialog` is a small window that prompts the user to make a decision or enter additional information. Instead, `dialogFragment` is a fragment that displays a dialog windows and contains a dialog object.

  DialogFragment does various things to keep the fragment's lifecycle driving it, instead of the Dialog. Dialogs are generally autonomous entities -- they are their own window, receiving their own input events, and often deciding on their own when to disappear. DialogFragment needs to ensure that what is happening with the Fragment and Dialog states remains consistent. To do this, it watches for dismiss events from the dialog and takes care of removing its own state when they happen.

- **What is the difference between `Thread` and `AsyncTask`?**

- **What is the relationship between the life cycle of an `AsyncTask` and an `Activity`? What problems can this result in? How can these problems be avoided?**

  An AsyncTask is not tied to the life cycle of the Activity that contains it. So, for example, if you start an AsyncTask inside an Activity and the user rotates the device, the Activity will be destroyed (and a new Activity instance will be created) but the AsyncTask will not die but instead goes on living until it completes.

  Then, when the AsyncTask does complete, rather than updating the UI of the new Activity, it updates the former instance of the Activity (i.e., the one in which it was created but that is not displayed anymore!). This can lead to an Exception (of the type java.lang.IllegalArgumentException: View not attached to window manager if you use, for instance, findViewById to retrieve a view inside the Activity).

  There’s also the potential for this to result in a memory leak since the AsyncTask maintains a reference to the Activity, which prevents the Activity from being garbage collected as long as the AsyncTask remains alive.

  For these reasons, using AsyncTasks for long-running background tasks is generally a bad idea . Rather, for long-running background tasks, a different mechanism (such as a service) should be employed.

- **What are Handlers?** </br>
  Handlers are objects for managing threads. It receives messages and writes code on how to handle the message. They run outside of the activity’s lifecycle, so they need to be cleaned up properly or else you will have thread leaks. Handlers allow communicating between the background thread and the main thread.

- **What is the difference between `Foreground` and `Background` and `Bounded` service?**
  - **Foreground Service:** A foreground `service` performs some operation that is noticeable to the user. For example, we can use a foreground service to play an audio track. A `Notification` must be displayed to the user.

  - **Background Service:** A background `service` performs an operation that isn’t directly noticed by the user. In Android API level 26 and above, there are restrictions to using background services and it is recommended to use WorkManager in these cases

  - **Bound Service:** A `service` is bound when an application component binds to it by calling `bindService()`. A bound service offers a client-server interface that allows components to interact with the `service`, send requests, receive results. A bound service runs only as long as another application component is bound to it. [Read More](https://developer.android.com/guide/components/services)

- **What is `contentProvider` and what is typically used for?** </br>
  A `ContentProvider` provides data from one application to another, when requested. It manages access to a structured set of data. It provides mechanisms for defining data security. [Learn more]("https://medium.com/@sanjeevy133/an-idiots-guide-to-android-content-providers-part-1-970cba5d7b42" "An idiot guide to android content providers").
  For further reading see the [official android documentation]("https://developer.android.com/guide/topics/providers/content-provider-basics" "Android official documentation")

  ![Conent Provider diagram](/assets/images/content-provider-diagram.png)

- **What is the difference between `apply()` and `commit()` in `sharedPreferences`?**
  - `commit()` writes the data **synchronously** and returns a boolean value of success or failure depending on the result immediately.
  - `apply()` is **asynchronous** and it won’t return any boolean response. Also if there is an `apply()` outstanding and we perform another `commit()`, The `commit()` will be blocked until the `apply()` is not completed.

- **How you load your `Bitmaps`? What do you do for loading large bitmaps?** [Link](https://android.jlelse.eu/loading-large-bitmaps-efficiently-in-android-66826cd4ad53 "Loading Large Bitmaps Efficiently in Android")

* **Stateflow vs LiveData** [Link](https://scalereal.com/android/2020/05/22/stateflow-end-of-livedata.html)

* **Livedata vs ObservableField** [Link](https://blog.mindorks.com/livedata-vs-observable-in-android)
     
- **How Android apps compiled and run?**
  1. First step involves compiling the resources folder (/res) using the aapt
    (android asset packaging tool) tool. These are compiled to a single class
    file called R.java. This is a class that just contains constants.

  2. Second step involves the java source code being compiled to .class files
    by javac, and then the class files are converted to Dalvik bytecode by the
    “dx” tool, which is included in the sdk ‘tools’. The output is classes.dex.

  3. The final step involves the android apkbuilder which takes all the input
    and builds the apk (android packaging key) file.
<br>

- **What is the difference between `implementation` and `api`?** </br>
  These two keywords work the same when you want to add a new library but the main difference occurs when using it in the internal library. Let's explain it with an example. Consider your app has a library called 'libraryA'. This library is also dependant on another library called 'libraryB'. the dependency flow will be : `app -> libraryA -> libraryB` . If the libraryB is declared in libraryA with keyword `implementation`, so your app module does not know anything about the classes of libraryB. So you can't access and use any classes of libraryB. If you want to do that, you must declare libraryB in the libraryA Gradle file with keyword `api`. For more information read [this medium link]("https://medium.com/mindorks/implementation-vs-api-in-gradle-3-0-494c817a6fa").

- **What do you mean by Gradle wrapper?** </br>
  The Gradle wrapper is the most suitable way to initiate a Gradle build. A Gradle wrapper is a Window’s batch script which has a shell script for the OS (operating system). Once you start the Gradle build via the wrapper, you will see an auto download which runs the build.
  
- **When to use Adapter pattern? (Not for RecyclerView or ListView)** </br>
  Use Adapter pattern when you need to make two class work with incompatible interfaces. Adapter pattern can also be used to encapsulate third party code so that your application only depends upon Adapter, which can adapt itself when third party code changes or you moved to a different third party library.

- **In singleton pattern whether it is better to make the whole `getInstance()` method synchronized or just critical section is enough? Which one is preferable?** </br>
  Synchronization of whole `getInstance()` method is costly and is only needed during the initialization on singleton instance, to stop creating another instance of Singleton.  Therefore it is better to only synchronize critical section and not the whole method.

- **How many ways can you write singleton class in Java?** </br>
  One can write singleton class in Java in five ways

    - Classic Java Singleton pattern
    ```java
    Public class Singleton{

        private static Singleton instance;

        private Singleton(){          
        }

        public static Singleton getInstance(){
          if(instance == null)
            instance = new Singleton();
          return instance;
        }

    }

    ```

    - A thread-safe singleton pattern in java using Synchronization

    ```java
    public class Singleton{

        private static final Singleton instance = null;

        private Singleton(){}

        public synchronized static Singleton getInstance(){
            if(instance == null)
                instance = new Singleton();

            return instance;
        }
    }
    ```

    - Double-checked locking with volatile keyword

    ```java
    public class Singleton {

        private volatile static Singleton instance;

        private Singleton (){}

        public static Singleton getSingleton() {          
          if (instance == null) {                                     
            synchronized (Singleton.class) {              
                if (instance == null)                    
                    instance = new Singleton();                                    
                }            
          }          
          return instance;        
        }

    }    
    ```

    - Initialization-on-demand with singleton holder

    ```java
    // Correct lazy initialization in Java
    @ThreadSafe
    class Singleton {

        private Singleton() {}

        private static class SingletonHolder {
            public static Singleton instance = new Singleton();
        }

        public static Singleton getInstance() {
            return SingletonHolder.instance;
        }
    }
    ```

    - Using Enum

    ```java
    enum Color {

        RED(1), GREEN(2), YELLOW(3);

        private int nCode ;

        private Color( int _nCode) {
          this.nCode = _nCode;
        }

        @Override
        public String toString() {
          return String.valueOf ( this . nCode );
        }

    }

    public class ColorTest {
        public static void main(String[] args) {
            Color red = Color.RED;
            Color red2 = Color.RED;

            System.out.println(red == red2); // return true
        }
    }
    ```
<br>

* **Log.v(), Log.d(), Log.i(), Log.w(), Log.e() - When to use each one?** [Link](https://stackoverflow.com/questions/7959263/android-log-v-log-d-log-i-log-w-log-e-when-to-use-each-one)

* **Understanding scope storage in android** [Link](https://blog.mindorks.com/understanding-the-scoped-storage-in-android)

* **App Data encryption** [Link](https://blog.mindorks.com/how-to-encrypt-data-safely-on-device-and-use-the-androidkeystore)
     
* **Solve out of memory error** [Link](https://blog.mindorks.com/practical-guide-to-solve-out-of-memory-error-in-android-application)

*  **What is ART? Difference between ART and Dalvik** [Link](https://blog.mindorks.com/what-are-the-differences-between-dalvik-and-art/#:~:text=What%20is%20ART%3F,like%20in%20case%20of%20Dalvik)

* **Battery optimizationn for Android** [Link](https://blog.mindorks.com/battery-optimization-for-android-apps-f4ef6170ff70)

* **Reason for the exit in Android Application** [Link](https://blog.mindorks.com/reason-of-exit-in-android-application/)
   
* **Android Jetpack component** [Link](https://blog.mindorks.com/what-is-android-jetpack-and-why-should-we-use-it)

* **Android Architecture Component** [Link](https://blog.mindorks.com/what-are-android-architecture-components/)

* **How ViewModel work internally?** [Link](https://blog.mindorks.com/android-viewmodels-under-the-hood)

* **What is Work Manager?** [Link](https://blog.mindorks.com/integrating-work-manager-in-android)

* **Arraymap vs Sparsh Array** [Link](https://blog.mindorks.com/android-app-optimization-using-arraymap-and-sparsearray-f2b4e2e3dc47)

* **Java Android Multithreading programming** [Link](https://blog.mindorks.com/java-android-multithreaded-programming-runnable-callable-future-executor)

- **How can you prevent creating another instance of singleton using `clone()` method?** </br>
  The preferred way to prevent creating another instance of a singleton is by not implementing Cloneable interface and if you do just throw an exception from `clone()` method "_not to create a clone of singleton class_".

- **When will you prefer to use a Factory Pattern?** </br>
  The factory pattern is preferred in the following cases:
    - A class does not know which class of objects it must create
    - Factory pattern can be used where we need to create an object of any one of sub-classes depending on the data provided
    - you can use factory pattern where you have to create an object of any one of sub-classes depending on the given data

- **Why use a factory class to instantiate a class when we can use new operator?** </br>
  Factory classes provide flexibility in terms of design. Below are some of the
  benefits of factory class:
    - Factory design pattern results in more decoupled code as it allows us to
      hide creational logic from dependent code
    - It allows us to introduce an [Inversion of Control]("https://www.codeproject.com/Articles/592372/Dependency-Injection-DI-vs-Inversion-of-Control-IO" "What is IoC?") container
    - It gives you a lot more flexibility when it comes time to change the
      application as our creational logic is hidden from dependant code

- **which pattern is used when we need to decouple an abstraction from its implementation?**  </br>
  When we want to decouple an abstraction from its implementation in order that two can vary independently we use **bridge pattern**.

* **What is ABI Management?** </br>
  Different Android handsets use different CPUs, which in turn support different instruction sets. Each combination of CPU and instruction sets has its own Application Binary Interface, or ABI. The ABI defines, with great precision, how an  application's machine code is supposed to interact with the system at runtime. You must specify an ABI for each CPU  architecture you want your app to work with. You can checkout the full specifcations [here](https://developer.android.com/ndk/guides/abis)</br>
  
* **Why bytecode cannot be run in Android?** </br>
  Android uses DVM (Dalvik Virtual Machine ) rather using JVM(Java Virtual Machine).</br>
  
* **What is a BuildType in Gradle? And what can you use it for?** </br>
   * Build types define properties that Gradle uses when building and packaging your Android app.
   * A build type defines how a module is built, for example whether ProGuard is run.
   * A product flavor defines what is built, such as which resources are included in the build.
   * Gradle creates a build variant for every possible combination of your project’s product flavors and build types.</br> 
 
* **Explain the build process in Android:** </br>
  * First step involves compiling the resources folder (/res) using the aapt (android asset packaging tool) tool. These are compiled to a single class file called R.java. This is a class that just contains constants.
  * Second step involves the java source code being compiled to .class files by javac, and then the class files are converted to Dalvik bytecode by the "dx" tool, which is included in the sdk 'tools'. The output is classes.dex. 
  * The final step involves the android apkbuilder which takes all the input and builds the apk (android packaging key) file.</br>

* **What is the Android Application Architecture?** </br>
    * Android application architecture has the following components:</br>
    a. Activities - Provides the window in which the app draws its UI</br>
    b. Services − It will perform background functionalities</br>
    c. Intent − It will perform the inter connection between activities and the data passing mechanism</br>
    d. Resource Externalization − strings and graphics</br>
    e. Notification − light,sound,icon,notification,dialog box,and toast</br>
    f. Content Providers − It will share the data between applications</br>
    
* **What is Manifest file and R.java file in Android?** </br>
    * **Manifest**: Every application must have an AndroidManifest.xml file (with precisely that name) in its root directory. The manifest presents essential information about the application to the Android system, information the system must have before it can run any of the application's code. It contains information of your package, including components of the application such as activities, services, broadcast receivers, content providers etc.
    * **R.Java**: It is an auto-generated file by aapt (Android Asset Packaging Tool) that contains resource IDs for all the resources of res/ directory. </br>
  
* **Describe activities** </br>
  Activities are basically containers or windows to the user interface.</br>
  
* **Lifecycle of an Activity** </br>
  * ```OnCreate()```: This is when the view is first created. This is normally where we create views, get data from bundles etc.</br>
  * ```OnStart()```: Called when the activity is becoming visible to the user. Followed by onResume() if the activity comes to the foreground, or onStop() if it becomes hidden.</br>
  * ```OnResume()```: Called when the activity will start interacting with the user. At this point your activity is at the top of the activity stack, with user input going to it.</br>
  * ```OnPause()```: Called as part of the activity lifecycle when an activity is going into the background, but has not (yet) been killed.</br>
  * ```OnStop()```: Called when you are no longer visible to the user.</br>
  * ```OnDestroy()```: Called when the activity is finishing</br>
  * ```OnRestart()```: Called after your activity has been stopped, prior to it being started again</br>
  
* **What’s the difference between onCreate() and onStart()?** </br>
  * The onCreate() method is called once during the Activity lifecycle, either when the application starts, or when the Activity has been destroyed and then recreated, for example during a configuration change.</br>
  * The onStart() method is called whenever the Activity becomes visible to the user, typically after onCreate() or onRestart().</br>
  
* **Scenario in which only onDestroy is called for an activity without onPause() and onStop()?** </br>
  If finish() is called in the OnCreate method of an activity, the system will invoke onDestroy() method directly.</br>

* **Why would you do the setContentView() in onCreate() of Activity class?** </br>
  * As onCreate() of an Activity is called only once, this is the point where most initialization should go. It is inefficient to set the content in onResume() or onStart() (which are called multiple times) as the setContentView() is a heavy operation.</br>
   
 * **Launch modes in Android?** </br>
   * **Standard**: It creates a new instance of an activity in the task from which it was started. Multiple instances of the activity can be created and multiple instances can be added to the same or different tasks. 
     * Example: Suppose there is an activity stack of A -> B -> C. Now if we launch B again with the launch mode as “standard”, the new stack will be A -> B -> C -> B.
   * **SingleTop**: It is the same as the standard, except if there is a previous instance of the activity that exists in the top of the stack, then it will not create a new instance but rather send the intent to the existing instance of the activity. 
     * Example: Suppose there is an activity stack of A -> B. Now if we launch C with the launch mode as “singleTop”, the new stack will be A -> B -> C as usual. 
     * Now if there is an activity stack of A -> B -> C. If we launch C again with the launch mode as “singleTop”, the new stack will still be A -> B -> C.
   * **SingleTask**: A new task will always be created and a new instance will be pushed to the task as the root one. So if the activity is already in the task, the intent will be redirected to onNewIntent() else a new instance will be created. At a time only one instance of activity will exist. 
     * Example: Suppose there is an activity stack of A -> B -> C -> D. Now if we launch D with the launch mode as “singleTask”, the new stack will be A -> B -> C -> D as usual. 
     * Now if there is an activity stack of A -> B -> C -> D.  If we launch activity B again with the launch mode as “singleTask”, the new activity stack will be A -> B. Activities C and D will be destroyed.
   * **SingleInstance**: Same as single task but the system does not launch any activities in the same task as this activity. If new activities are launched, they are done so in a separate task. 
     * Eg: Suppose there is an activity stack of A -> B -> C -> D. If we launch activity B again with the launch mode as “singleTask”, the new activity stack will be: 
     * Task1 — A -> B -> C  and Task2 — D</br>
 
 * **How does the activity respond when the user rotates the screen?** </br>
   When the screen is rotated, the current instance of activity is destroyed a new instance of the Activity is created in the new orientation. The onRestart() method is invoked first when a screen is rotated. The other lifecycle methods get invoked in the similar flow as they were when the activity was first created.</br>
  
 * **How to prevent the data from reloading and resetting when the screen is rotated?** </br>
   * The most common approach these days would be to use a combination of ViewModels and onSaveInstanceState(). So how we do we that?
   * Basics of [ViewModel](https://developer.android.com/reference/android/arch/lifecycle/ViewModel): A ViewModel is LifeCycle-Aware. In other words, a ViewModel will not be destroyed if its owner is destroyed for a configuration change (e.g. rotation). The new instance of the owner will just re-connected to the existing ViewModel. So if you rotate an Activity three times, you have just created three different Activity instances, but you only have one ViewModel.
   * So the common practice is to store data in the ViewModel class (since it persists data during configuration changes) and use OnSaveInstanceState to store small amounts of UI data.
   * For instance, let’s say we have a search screen and the user has entered a query in the Edittext. This results in a list of items being displayed in the RecyclerView. Now if the screen is rotated, the ideal way to prevent resetting of data would be to store the list of search items in the ViewModel and the query text user has entered in the OnSaveInstanceState method of the activity.</br>
  
* **Mention two ways to clear the back stack of Activities when a new Activity is called using intent** </br>
  The first approach is to use a FLAG_ACTIVITY_CLEAR_TOP flag. The second way is by using FLAG_ACTIVITY_CLEAR_TASK and FLAG_ACTIVITY_NEW_TASK in conjunction.</br>
  
* **What’s the difference between FLAG_ACTIVITY_CLEAR_TASK and FLAG_ACTIVITY_CLEAR_TOP?** </br>
  * **FLAG_ACTIVITY_CLEAR_TASK** is used to clear all the activities from the task including any existing instances of the class invoked. The Activity launched by intent becomes the new root of the otherwise empty task list. This flag has to be used in conjunction with FLAG_ ACTIVITY_NEW_TASK.</br>
  * **FLAG_ACTIVITY_CLEAR_TOP** on the other hand, if set and if an old instance of this Activity exists in the task list then barring that all the other activities are removed and that old activity becomes the root of the task list. Else if there’s no instance of that activity then a new instance of it is made the root of the task list. Using FLAG_ACTIVITY_NEW_TASK in conjunction is a good practice, though not necessary.</br>  
  
* **Describe content providers** </br>
  * A ContentProvider provides data from one application to another, when requested. It manages access to a structured set of data.  It provides mechanisms for defining data security. ContentProvider is the standard interface that connects data in one process with code running in another process.</br>  
  * When you want to access data in a **ContentProvider**, you must instead use the ContentResolver object in your application’s Context to communicate with the provider as a client. The provider object receives data requests from clients, performs the requested action, and returns the results.</br>
  
* **Access data using Content Provider:** </br>
  * Start by making sure your Android application has the necessary read access permissions. Then, get access to the ContentResolver object by calling getContentResolver() on the Context object, and retrieving the data by constructing a query using ContentResolver.query().</br>
  * The ContentResolver.query() method returns a Cursor, so you can retrieve data from each column using Cursor methods.</br> 
  
* **Describe services** </br>
  * A Service is an application component that can perform long-running operations in the background, and it doesn't provide a user interface. It can run in the background, even when the user is not interacting with your application. These are the three different types of services:
    * Foreground Service: A foreground service performs some operation that is noticeable to the user. For example, we can use a foreground service to play an audio track. A [Notification](https://developer.android.com/guide/topics/ui/notifiers/notifications.html) must be displayed to the user.
    * Background Service: A background service performs an operation that isn’t directly noticed by the user. In Android API level 26 and above, there are restrictions to using background services and it is recommended to use [WorkManager](https://developer.android.com/topic/libraries/architecture/workmanager) in these cases.
    * Bound Service: A service is bound when an application component binds to it by calling bindService(). A bound service offers a client-server interface that allows components to interact with the service, send requests, receive results. A bound service runs only as long as another application component is bound to it.</br>

*  **How Workmanager works?** [Link](https://www.kodeco.com/20689637-scheduling-tasks-with-android-workmanager)
   
* **Difference between Service, Intent Service, AsyncTask & Threads** </br>
  * **Android service** is a component that is used to perform operations on the background such as playing music. It doesn’t has any UI (user interface). The service runs in the background indefinitely even if application is destroyed. A class that directly extends Service runs on the main thread so it will block the UI (if there is one) and should therefore either be used only for short tasks or should make use of other threads for longer tasks.</br>
  * **AsyncTask** allows you to perform asynchronous work on your user interface. It performs the blocking operations in a worker thread and then publishes the results on the UI thread, without requiring you to handle threads and/or handlers yourself.</br>
  * **IntentService** is a base class for Services that handle asynchronous requests (expressed as Intents) on demand. Clients send requests through startService(Intent) calls; the service is started as needed, handles each Intent in turn using a worker thread, and stops itself when it runs out of work.</br>
  * A **thread** is a single sequential flow of control within a program. it should be used to separate long running operations from main thread so that performance is improved. But it can't be cancelled elegantly and it can't handle configuration changes of Android. You can't update UI from Thread. </br>
  
 * **What is a Job Scheduling?** </br>
   * Job Scheduling api, as the name suggests, allows to schedule jobs while letting the system optimize based on memory, power, and connectivity conditions.
   * The JobScheduler supports batch scheduling of jobs. The Android system can combine jobs so that battery consumption is reduced. JobManager makes handling uploads easier as it handles automatically the unreliability of the network. It also survives application restarts. 
   * Scenarios:
     * Tasks that should be done once the device is connect to a power supply
     * Tasks that require network access or a Wi-Fi connection.
     * Task that are not critical or user facing
     * Tasks that should be running on a regular basis as batch where the timing is not critical
     * [Reference](http://www.vogella.com/tutorials/AndroidTaskScheduling/article.html#schedulingtasks) </br>
  
* **What is the relationship between the life cycle of an AsyncTask and an Activity? What problems can this result in? How can these problems be avoided?** </br>
   * An AsyncTask is not tied to the life cycle of the Activity that contains it. So, for example, if you start an AsyncTask inside an Activity and the user rotates the device, the Activity will be destroyed (and a new Activity instance will be created) but the AsyncTask will not die but instead goes on living until it completes.
   * Then, when the AsyncTask does complete, rather than updating the UI of the new Activity, it updates the former instance of the Activity (i.e., the one in which it was created but that is not displayed anymore!). This can lead to an Exception (of the type java.lang.IllegalArgumentException: View not attached to window manager if you use, for instance, findViewById to retrieve a view inside the Activity).
   * There’s also the potential for this to result in a memory leak since the AsyncTask maintains a reference to the Activity, which prevents the Activity from being garbage collected as long as the AsyncTask remains alive.
   * For these reasons, using AsyncTasks for long-running background tasks is generally a bad idea . Rather, for long-running background tasks, a different mechanism (such as a service) should be employed.
   * Note: AsyncTasks by default run on a single thread using a serial executor, meaning it has only 1 thread and each task runs one after the other.</br>

* **What is the onTrimMemory() method?** </br>
   * ```onTrimMemory()```: Called when the operating system has determined that it is a good time for a process to trim unneeded memory from its process. This will happen for example when it goes in the background and there is not enough memory to keep as many background processes running as desired.
   * Android can reclaim memory for from your app in several ways or kill your app entirely if necessary to free up memory for critical tasks. To help balance the system memory and avoid the system's need to kill your app process, you can implement the ```ComponentCallbacks2``` interface in your Activity classes. The provided onTrimMemory() callback method allows your app to listen for memory related events when your app is in either the foreground or the background, and then release objects in response to app lifecycle or system events that indicate the system needs to reclaim memory. [Reference](https://developer.android.com/topic/performance/memory)</br>

* **AIDL vs Messenger Queue** </br>
  * AIDL is for purpose when you've to go application level communication for data and control sharing, a scenario depicting it can be : An app requires list of all contacts from Contacts app (content part lies here) plus it also wants to show the call's duration and you can also disconnect it from that app (control part lies here).
  * In Messenger queues you're more IN the application and working on threads and processes to manage the queue having messages so no Outside services interference here.</br>
  * Messenger is needed if you want to bind a remote service (e.g. running in another process).</br>

* **What is a ThreadPool? And is it more effective than using several separate Threads?** </br>
  * Creating and destroying threads has a high CPU usage, so when we need to perform lots of small, simple tasks concurrently, the overhead of creating our own threads can take up a significant portion of the CPU cycles and severely affect the final response time.</br>
  * ThreadPool consists of a task queue and a group of worker threads, which allows it to run multiple parallel instances of a task.</br>

- **Difference between `Activity` and `Service`?**
  - **Activity:** An activity is the entry point for interacting with the user. It represents a single screen with a user interface.
  - **Service:** A service is a general-purpose entry point for keeping an app running in the background for all kinds of reasons. It is a component that runs in the background to perform long-running operations or to perform work for remote processes. A service does not provide a user interface.
    
* **How would you update the UI of an activity from a background service** </br>
  We need to register a LocalBroadcastReceiver in the activity. And send a broadcast with the data using intents from the background service. As long as the activity is in the foreground, the UI will be updated from the background. Ensure to unregister the broadcast receiver in the onStop() method of the activity to avoid memory leaks. 
We can also register a Handler and pass data using Handlers. I have detailed a sample implementation on this. You can check it out [here](https://medium.com/@anitaa_1990/how-to-update-an-activity-from-background-service-or-a-broadcastreceiver-6dabdb5cef74)</br>

* **What is an intent?** </br>
  * Intents are messages that can be used to pass information to the various components of android. For instance, launch an activity, open a webview etc.</br>
  * Two types of intents-</br> 
    * Implicit: Implicit intent is when you call system default intent like send email, send SMS, dial number.</br>
    * Explicit: Explicit intent is when you call an application activity from another activity of the same application.</br>

* **What is a Sticky Intent?** </br>
  * Sticky Intents allows communication between a function and a service. 
  * ```sendStickyBroadcast()``` performs a sendBroadcast(Intent) known as sticky, i.e. the Intent you are sending stays around after the broadcast is complete, so that others can quickly retrieve that data through the return value of ```registerReceiver(BroadcastReceiver, IntentFilter)```.
  * For example, if you take an intent for ACTION_BATTERY_CHANGED to get battery change events: When you call registerReceiver() for that action — even with a null BroadcastReceiver — you **get the Intent that was last Broadcast for that action**. Hence, you can use this to find the state of the battery without necessarily registering for all future state changes in the battery.</br>

* **What is a Pending Intent?** </br>
  If you want someone to perform any Intent operation at future point of time on behalf of you, then we will use Pending Intent. </br>
  
* **What is an Action?** </br>
  Description of the intent. For instance, ACTION_CALL - used to perform calls</br>
  
* **What are intent Filters?** </br>
  * Specifies the type of intent that the activity/service can respond to.</br>
  
* **Describe fragments:** </br>
  Fragment is a UI entity attached to Activity. Fragments can be reused by attaching in different activities. Activity can have multiple fragments attached to it. Fragment must be attached to an activity and its lifecycle will depend on its host activity.</br>
  
* **Describe fragment lifecycle** </br>
  * ```onAttach()``` : The fragment instance is associated with an activity instance.The fragment and the activity is not fully initialized. Typically you get in this method a reference to the activity which uses the fragment for further initialization work.
  * ```onCreate()``` : The system calls this method when creating the fragment. You should initialize essential components of the fragment that you want to retain when the fragment is paused or stopped, then resumed.
  * ```onCreateView()``` : The system calls this callback when it’s time for the fragment to draw its user interface for the first time. To draw a UI for your fragment, you must return a View component from this method that is the root of your fragment’s layout. You can return null if the fragment does not provide a UI.
  * ```onActivityCreated()``` : The onActivityCreated() is called after the onCreateView() method when the host activity is created. Activity and fragment instance have been created as well as the view hierarchy of the activity. At this point, view can be accessed with the findViewById() method. example. In this method you can instantiate objects which require a Context object
  * ```onStart()``` : The onStart() method is called once the fragment gets visible.
  * ```onResume()``` : Fragment becomes active.
  * ```onPause()``` : The system calls this method as the first indication that the user is leaving the fragment. This is usually where you should commit any changes that should be persisted beyond the current user session.
  * ```onStop()``` : Fragment going to be stopped by calling onStop()
  * ```onDestroyView()``` : Fragment view will destroy after call this method
  * ```onDestroy()``` :called to do final clean up of the fragment’s state but Not guaranteed to be called by the Android platform.</br>  
  
* **What is the difference between fragments & activities. Explain the relationship between the two.** </br>
  An Activity is an application component that provides a screen, with which users can interact in order to do something whereas a Fragment represents a behavior or a portion of user interface in an Activity (with its own lifecycle and input events, and which can be added or removed at will).</br>
  
* **Why is it recommended to use only the default constructor to create a Fragment?** </br>
  The reason why you should be passing parameters through bundle is because when the system restores a fragment (e.g on config change), it will automatically restore your bundle. This way you are guaranteed to restore the state of the fragment correctly to the same state the fragment was initialised with.</br>
  
* **You’re replacing one Fragment with another — how do you ensure that the user can return to the previous Fragment, by pressing the Back button?** </br>
  We need to save each Fragment transaction to the backstack, by calling ```addToBackStack()``` before you ```commit()``` that transaction</br>
 
* **Callbacks invoked during addition of a fragment to back stack and while popping back from back stack:** </br>
  * ```addOnBackStackChangedListener``` is called when fragment is added or removed from the backstack. Use this [link](https://why-android.com/2016/03/29/learn-how-to-use-the-onbackstackchangedlistener/) for reference</br>
  
* **What are retained fragments** </br>
  * By default, Fragments are destroyed and recreated along with their parent Activity’s when a configuration change occurs. Calling ```setRetainInstance(true)``` allows us to bypass this destroy-and-recreate cycle, signaling the system to retain the current instance of the fragment when the activity is recreated.</br>
  
* **What is Toast in Android?** </br>
  Android Toast can be used to display information for the short period of time. A toast contains message to be displayed quickly and disappears after sometime.</br>
  
* **What are Loaders in Android?** </br>
   * Loader API was introduced in API level 11 and is used to load data from a data source to display in an activity or fragment. Loaders persist and cache results across configuration changes to prevent duplicate queries.
   * [Sample Implementation](https://medium.com/mindorks/a-journey-to-the-world-of-mvp-and-loaders-part-2-e176200e5866) </br>
   
* **What is the difference between Dialog & DialogFragment?** </br>
  A fragment that displays a dialog window, floating on top of its activity's window. This fragment contains a Dialog object, which it displays as appropriate based on the fragment's state. Dialogs are entirely dependent on Activities. If the screen is rotated, the dialog is dismissed. Dialog fragments take care of orientation, configuration changes as well.</br>
   
* **What is the difference between a regular .png and a nine-patch image?** </br>
   * It is one of a resizable bitmap resource which is being used as backgrounds or other images on the device. The NinePatch class allows drawing a bitmap in nine sections. The four corners are unscaled; the middle of the image is scaled in both axes, the four edges are scaled into one axis.</br>
     
* **Difference between RelativeLayout and LinearLayout?** </br>
   * **Linear Layout** - Arranges elements either vertically or horizontally. i.e. in a row or column. 
   * **Relative Layout** - Arranges elements relative to parent or other elements.</br>
   
* **What is ConstraintLayout?** </br>
   * It allows you to create large and complex layouts with a flat view hierarchy (no nested view groups). It's similar to RelativeLayout in that all views are laid out according to relationships between sibling views and the parent layout, but it's more flexible than RelativeLayout and easier to use with Android Studio's Layout Editor.
   * [Sample Implementation](https://github.com/anitaa1990/ConstraintLayout-Sample) 
   * You can read more about how to implement a simple app with ConstraintLayout [here](https://android.jlelse.eu/learning-to-implement-constraintlayout-in-android-8ddc69fe0a1a), by yours truly :)</br>
   
* **When might you use a FrameLayout?** </br>
   * Frame Layouts are designed to contain a single item, making them an efficient choice when you need to display a single View.
   * If you add multiple Views to a FrameLayout then it’ll stack them one above the other, so FrameLayouts are also useful if you need overlapping Views, for example if you’re implementing an overlay or a HUD element.</br> 
   
* **What is Adapters?** </br>
  An adapter responsible for converting each data entry into a View that can then be added to the AdapterView (ListView/RecyclerView).</br>

* **How to support different screen sizes?** </br>
   * Create a flexible layout - The best way to create a responsive layout for different screen sizes is to use ConstraintLayout as the base layout in your UI. ConstraintLayout allows you to specify the position and size for each view according to spatial relationships with other views in the layout. This way, all the views can move and stretch together as the screen size changes.
   * Create stretchable nine-patch bitmaps
   * Avoid hard-coded layout sizes - Use wrap_content or match_parent. Create alternative layouts - The app should provide alternative layouts to optimize the UI design for certain screen sizes. For eg: different UI for tablets
   * Use the smallest width qualifier.  For example, you can create a layout named main_activity that's optimized for handsets and tablets by creating different versions of the file in directories as follows:			
      * res/layout/main_activity.xml           # For handsets (smaller than 600dp available width)						
      * res/layout-sw600dp/main_activity.xml   # For 7” tablets (600dp wide and bigger). 
      * The smallest width qualifier specifies the smallest of the screen's two sides, regardless of the device's current orientation, so it's a simple way to specify the overall screen size available for your layout.</br>
  
* **Outline the process of creating custom Views:** </br>
   * Create a class that Subclass a view
   * Create a res/values/attrs.xml file and declare the attributes you want to use with your custom View.
   * In your View class, add a constructor method, instantiate the Paint object, and retrieve your custom attributes.
   * Override either onSizeChanged() or onMeasure().
   * Draw your View by overriding onDraw().
   * [Sample Implementation](https://code.tutsplus.com/tutorials/android-sdk-creating-custom-views--mobile-14548) </br>
   
* **Briefly describe some ways that you can optimize View usage** </br>
   * Checking for excessive overdraw: install your app on an Android device, and then enable the "Debug GPU Overview" option.
   * Flattening your view hierarchy: inspect your view hierarchy using Android Studio’s ‘Hierarchy Viewer’ tool.
   * Measuring how long it takes each View to complete the measure, layout, and draw phases. You can also use Hierarchy Viewer to identify any parts of the rendering pipeline that you need to optimize.</br>
   
* **Bitmap pooling in android?** </br>
   * Bitmap pooling is a simple technique, that aims to reuse bitmaps instead of creating new ones every time. When you need a bitmap, you check a bitmap stack to see if there are any bitmaps available. If there are not bitmaps available you create a new bitmap otherwise you pop a bitmap from the stack and reuse it. Then when you are done with the bitmap, you can put it on a stack. [Find more info here](https://www.linkedin.com/pulse/performance-improvement-bitmap-pooling-android-ali-muzaffar/)</br>
   
* **How to load bitmap to memory?** </br>
  [Find more info here](https://android.jlelse.eu/loading-large-bitmaps-efficiently-in-android-66826cd4ad53)</br>   
  
* **What are the permission protection levels in Android?** </br>
   * **Normal** - A lower-risk permission that gives requesting applications access to isolated application-level features, with minimal risk to other applications, the system, or the user. The system automatically grants this type of permission to a requesting application at installation, without asking for the user's explicit approval.
   * **Dangerous** - A higher-risk permission. Any dangerous permissions requested by an application may be displayed to the user and require confirmation before proceeding, or some other approach may be taken to avoid the user automatically allowing the use of such facilities.
   * **Signature** - A permission that the system grants only if the requesting application is signed with the same certificate as the application that declared the permission. If the certificates match, the system automatically grants the permission without notifying the user or asking for the user's explicit approval.
   * **SignatureOrSystem** - A permission that the system grants only to applications that are in the Android system image or that are signed with the same certificate as the application that declared the permission.</br>  
  
* **What is an Application Not Responding (ANR) error, and how can you prevent them from occurring in an app?** </br>
  An ANR dialog appears when your UI has been unresponsive for more than 5 seconds, usually because you’ve blocked the main thread. To avoid encountering ANR errors, you should move as much work off the main thread as possible.</br>
   
* **What is a singleton class in Android?** </br>
  A singleton class is a class which can create only an object that can be shared all other classes.
   ```
   private static volatile RESTService instance;
    protected RESTService(Context context) {
        super(context);
    }
    
    public static RESTService getInstance(Context context) {
    if (instance == null) {
       synchronized (RESTService.class) {
          if (instance == null) instance = new RESTService(context);
            }
        }
        return instance;
    }
    ```
   </br>
    
* **How does RecyclerView work?** </br>
   * Let's start with some background on RecyclerView which is needed to understand ```onBindViewHolder()``` method inside RecyclerView.</br>
   * RecyclerView is designed to display long lists (or grids) of items. Say you want to display 100 rows of something. A simple approach would be to just create 100 views, one for each row and lay all of them out. But that would be wasteful because at any point of time, only 10 or so items could fit on screen and the remaining items would be off screen. So RecyclerView instead creates only the 10 or so views that are on screen. This way you get 10x better speed and memory usage. 
   * **But what happens when you start scrolling and need to start showing next views?**
     * Again a simple approach would be to create a new view for each new row that you need to show. But this way by the time you reach the end of the list you will have created 100 views and your memory usage would be the same as in the first approach. And creating views takes time, so your scrolling most probably wouldn't be smooth. This is why RecyclerView takes advantage of the fact that as you scroll, **new rows come on screen also old rows disappear off screen**. Instead of creating new view for each new row, an old view is recycled and reused by binding new data to it.
     * This happens inside the ```onBindViewHolder()``` method. Initially you will get new unused view holders and you have to fill them with data you want to display. But as you scroll you will start getting view holders that were used for rows that went off screen and you have to replace old data that they held with new data.</br>

* **How does RecyclerView differ from ListView?** </br>
   * **ViewHolder Pattern**:  Recyclerview implements the ViewHolders pattern whereas it is not mandatory in a ListView. A RecyclerView recycles and reuses cells when scrolling. 
   * **What is a ViewHolder Pattern?** - A ViewHolder object stores each of the component views inside the tag field of the Layout, so you can immediately access them without the need to look them up repeatedly. In ListView, the code might call ```findViewById()``` frequently during the scrolling of ListView, which can slow down performance. Even when the Adapter returns an inflated view for recycling, you still need to look up the elements and update them. A way around repeated use of ```findViewById()``` is to use the "view holder" design pattern.
   * **LayoutManager**: In a ListView, the only type of view available is the vertical ListView.  A RecyclerView decouples list from its container so we can put list items easily at run time in the different containers (linearLayout, gridLayout) by setting LayoutManager.
   * **Item Animator**: ListViews are lacking in support of good animations, but the RecyclerView brings a whole new dimension to it.</br> 
   
* **How would you implement swipe animation in Android** </br> 
   ```
   <set xmlns:android="http://schemas.android.com/apk/res/android"
     android:shareInterpolator="false">
    <translate android:fromXDelta="-100%" android:toXDelta="0%"
             android:fromYDelta="0%" android:toYDelta="0%"
             android:duration="700"/>
    </set>
    ```
</br>

* **Shimmer effect animation placeholder** [Link](https://blog.mindorks.com/using-shimmer-effect-placeholder-in-android/)
  
* **Arraymap/SparseArray vs HashMap in Android?** </br>
   * [Article 1 on the subject](https://android.jlelse.eu/app-optimization-with-arraymap-sparsearray-in-android-c0b7de22541a)
   * [Article 2 on the subject](https://medium.com/@mohom.r/optimising-android-app-performance-with-arraymap-9296f4a1f9eb) </br>
   
* **How to reduce apk size?** </br>
   * Enable proguard in your project by adding following lines to your release build type.
   * Enable shrinkResources.
   * Strip down all the unused locale resources by adding required resources name in “resConfigs”.
   * Convert all the images to the webp or vector drawables.
   * [Article on the subject](https://medium.com/exploring-code/how-you-can-decrease-application-size-by-60-in-only-5-minutes-47eff3e7874e)
   </br>   
   
* **How to reduce build time of an Android app?** </br>
   * Check out this awesome [article](https://medium.com/exploring-code/how-to-decrease-your-gradle-build-time-by-65-310b572b0c43) on it. 
   * What I got from the article: A few commands we can add to the gradle.properties file:
     * ```org.gradle.configureondemand=true``` - This command will tell gradle to only build the projects that it really needs to build.
     * Use Daemon - ```org.gradle.daemon=true``` - Daemon keeps the instance of the gradle up and running in the background even after your build finishes. This will remove the time required to initialize the gradle and decrease your build timing significantly.
     * ```org.gradle.parallel=true``` - Allow gradle to build your project in parallel. If you have multiple modules in you project, then by enabling this, gradle can run build operations for independent modules parallelly.
     * Increase Heap Size - ```org.gradle.jvmargs=-Xmx3072m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8``` - Since android studio 2.0, gradle uses dex in the process to decrease the build timings for the project. Generally, while building the applications, multiple dx processes runs on different VM instances. But starting from the Android Studio 2.0, all these dx processes runs in the single VM and that VM is also shared with the gradle. This decreases the build time significantly as all the dex process runs on the same VM instances. But this requires larger memory to accommodate all the dex processes and gradle. That means you need to increase the heap size required by the gradle daemon. By default, the heap size for the daemon is about 1GB. 
  * Ensure that dynamic dependency is not used. i.e. do not use 
  </br>```implementation 'com.android.support:appcompat-v7:27.0.+'```. </br>
  This command means gradle will go online and check for the latest version every time it builds the app.</br> 
  Instead use fixed versions i.e. ```'com.android.support:appcompat-v7:27.0.2'```    
   </br>   
   
* **Android Architecture Components?** </br>
   * A collection of libraries that help you design robust, testable, and maintainable apps. [Official documentation](https://developer.android.com/topic/libraries/architecture/)
      * **Room**
        * [Official documentation](https://developer.android.com/topic/libraries/architecture/room)   
        * [Article on how to implement Room Db](https://medium.com/@anitaa_1990/5-steps-to-implement-room-persistence-library-in-android-47b10cd47b24)  
        * [Sample  implementation](https://github.com/anitaa1990/RoomDb-Sample)
        * [Securing a Room Database With Passcode-Based Encryption](https://medium.com/vmware-end-user-computing/securing-a-room-database-with-passcode-based-encryption-82ec670961e)
        
      * **Live Data**
        * [Official documentation](https://developer.android.com/topic/libraries/architecture/livedata)
        * [Sample  implementation](https://github.com/anitaa1990/GameOfThronesTrivia)
        
      * **ViewModel**
        * [Official documentation](https://developer.android.com/topic/libraries/architecture/viewmodel)
        * [Sample  implementation](https://github.com/anitaa1990/GameOfThronesTrivia)
        
      * **Data Binding**
        * [Official documentation](https://developer.android.com/topic/libraries/data-binding/)
        * [Sample  implementation](https://github.com/anitaa1990/DataBindingExample)        
        
      * **Lifecycles** - [Official documentation](https://developer.android.com/topic/libraries/architecture/lifecycle)
  </br> 
  
* **Difference between MVC & MVP & MVVM?** </br>
   * **MVC** is the Model-View-Controller architecture where model refers to the data model classes. The view refers to the xml files and the controller handles the business logic. The issue with this architecture is unit testing. The model can be easily tested since it is not tied to anything. The controller is tightly coupled with the android apis making it difficult to unit test. Modularity & flexibility is a problem since the view and the controller are tightly coupled. If we change the view, the controller logic should also be changed. Maintenance is also an issues.
   * **MVP architecture**: Model-View-Presenter architecture. The View includes the xml and the activity/fragment classes. So the activity would ideally implement a view interface making it easier for unit testing (since this will work without a view). [Sample Implementation](https://github.com/anitaa1990/Inshorts) 
   * **MVVM**: Model-View-ViewModel Architecture. The Model comprises data, tools for data processing, business logic.  The View Model is responsible for wrapping the model data and preparing the data for the view. IT also provides a hook to pass events from the view to the model.  [Sample Implementation](https://github.com/anitaa1990/Trailers)</br></br>
   * **MVI**: [Link](https://proandroiddev.com/android-model-view-intent-with-kotlin-flow-ca5945316ec)

*  **What is the role of Presenter in MVP?** <br/>
    The Presenter is responsible to act as the middle man between View and Model. It retrieves data from the Model and returns it formatted to the View. But unlike the typical MVC, it also decides what happens when you interact with the View.

*  **What is the advantage of MVVM over MVP?** <br/>
    In MVP, Presenter is responsible for view data updates as well as data operations where as in MVVM, ViewModel does not hold any reference to View. It is the View's responsibility to pick the changes from ViewModel. This helps in writing more maintainable test cases since ViewModel does not depend upon View.

*  **What is Espresso** [Link](https://medium.com/mindorks/android-testing-part-1-espresso-basics)

*  **What are SOLID Principles? How they are applicable in Android?** <br/>
    SOLID unites all the best practices of software development over the years to deliver good quality apps. Understanding SOLID Principles will help us write clean and elegant code. It helps us write the code with SOC (Separation of Concerns).
    SOLID Principles is an acronym for:
    1. S stands for Single Responsibility Principle(SRP) - A class should have only one reason to change
    2. O stands for Open Closed Principle - Software entities such as classes, functions, modules should be open for extension but closed for modification.
    3. L stands for Liskov Substitution Principle - Derived class must be usable through the base class interface, without the need for user to know the difference.
    4. I stands for Interface Segregation - No client should be forced to depend on methods that it doesn't use.
    5. D stands for Dependency Inversion - 
       1. High Level Modules should not directly depend on Low level modules. Instead both should depend on abstractions.
       2. Abstractions should not depend on details. Details should depend on abstractions.

    [Learn More about SOLID principles with Android Examples Here.](https://www.coderefer.com/blog/solid-principles-in-android-with-kotlin-examples/)

*  **What are Android Components?** <br/>
    1) Activities,
    2) Intent and broadcast receivers,
    3) Services,
    4) Content Providers,
    5) Widgets and Notifications

*  **What is an Application class?** <br/>
    An Application class is a base class in your Application that starts before all other classes like Activities or services are called. You can maintain your application's global state here. While it is NOT mandatory that you need to extend Application class, you can do so by providing your own implementation by creating a subclass and specifying the fully-qualified name of this subclass as the "android:name" attribute in your AndroidManifest.xml's <application> tag.

*  **What is a Context? What are different types of Contexts?** <br/>
    As the name says, its the context of the current application or object. Context is like a handle to the environment your application is currently running in.
    We mainly use two types of context. Application context - whose scope is throughout the application and Activity Context - whose scope depends on the Activity Lifecycle.

*  **What is an Activity?** <br/>
    An activity provides the window in which the app draws its UI. This window typically fills the screen, but may be smaller than the screen and float on top of other windows. Generally, one activity implements one screen in an app. For instance, one of an app’s activities may implement a Preferences screen, while another activity implements a Select Photo screen.

*  **Activity Lifecycle** <br/>
    ![Activity Lifecycle Image](/assets/activity_lifecycle.png)

*  **Fragment Lifecycle** <br/>
    ![Fragment Lifecycle Image](/assets/fragment_lifecycle.png)

*  **Service Lifecycle** <br/>
    ![Fragment Lifecycle Image](/assets/service_lifecycle.png)

*  **What is the correlation between activity and fragment life cycle?** <br/>
    Here is how Activity's and Fragment's lifecyle are called together:
    ![Activity Fragment Lifecycle](/assets/activity-fragment-lifecycles.png)

*  **Is there any scenario where onDestoy() will be called without calling onPause() and onStop()?** <br/>
    If we call finish() method inside onCreate() of our Activity, then onDestroy() will be called directly.

*  **What are Processes in Android?** <br/>
    Everytime an Android App starts, the Android System creates a New Process for this Application with a Single thread of Execution. By default all the components of the same application runs in the same process. While most apps donot change this behavior, some apps like games, might want to run in different processes. Then we can use *android:process* attribute in our AndroidManifest.xml to specify the process name.

*  **How do we save and restore an activity's state during screen screen rotation?** <br/>
    We can use onSavedInstanceState(bundle:Bundle) to save the activity's state inside a bundle. Then we can use onRestoreInstanceState(bundle) to restore the state of activity.

*  **What is a Loader in Android?** <br/>
    Note: (Loader is Deprecated. We Have to use combination of ViewModels and LiveData instead of using Loaders) A Loader is used to fetch the data from a Content provider and cache the results across the configuration changes to avoid duplicate queries. Loader does it by running on separate threads and handling the lifecycle changes (so no need of asynctasks or new thread creations or manual handling of life cycle changes). Few implementations of Loaders like CursorLoader can implement an observer (called ContentObserver) to monitor any data changes and can then trigger a reload.

*  **What is an Intent Filter?** <br/>
    Intent filters are a very powerful feature of the Android platform. They provide the ability to launch an activity based not only on an explicit request, but also an implicit one. For example, an explicit request might tell the system to “Start the Send Email activity in the Gmail app". By contrast, an implicit request tells the system to “Start a Send Email screen in any activity that can do the job." When the system UI asks a user which app to use in performing a task, that’s an intent filter at work. Here's an example of how to declare Intent Filter in AndroidManifest:
    ```xml
    <activity android:name=".ExampleActivity" android:icon="@drawable/app_icon">
      <intent-filter>
          <action android:name="android.intent.action.SEND" />
          <category android:name="android.intent.category.DEFAULT" />
          <data android:mimeType="text/plain" />
      </intent-filter>
    </activity>
    ```

*  **What is AAPT?** <br/>
    AAPT2 (Android Asset Packaging Tool) is a build tool that Android Studio and Android Gradle Plugin use to compile and package your app’s resources. AAPT2 parses, indexes, and compiles the resources into a binary format that is optimized for the Android platform.

*  **What is an Intent? What are the different types of Intents?** <br/>
    It is a kind of message or information that is passed between different components of Android. It is used to launch an activity, display a web page, send SMS, send email, etc. There are two types of intents in android:
    There are two types of intents:
    a)**Implicit Intent** - Implicit intents do not name a specific component, but instead declare a general action to perform, which allows a component from another app to handle it. For example, if you want to show the user a location on a map, you can use an implicit intent to request that another capable app show a specified location on a map.
    b)**Explicit Intent** - Explicit intents specify which application will satisfy the intent, by supplying either the target app's package name or a fully-qualified component class name. You'll typically use an explicit intent to start a component in your own app, because you know the class name of the activity or service you want to start. For example, you might start a new activity within your app in response to a user action, or start a service to download a file in the background.

*  **What is HandlerThread?** <br/>
    HandlerThread is a Handy class to start a thread that has a Looper.

*  **What is a Looper?** <br/>
    A Looper is a class used to loop through the Message Queue attached to the Thread. Any thread consists of only one looper. You can access message queue of current thread by using **Looper.myQueue()**.
    
    By default, a thread halts when the execution completes. But, for Example, if we take Android's Main thread, it should not halt upon execution.

    Normally thread cannot be reused once its job is completed. But thread with Looper is kept alive until you call quit method so you don’t need to create a new instance each time you want to run a job in background. ther it should loop through the runnables(Messages) that its assigned in order to work properly. For more info, refer to this [link](https://stackoverflow.com/a/34522758/3424919).

*  **What is a Message Queue?** <br/>
    MessageQueue is a queue that has list of messages which should be processed. Android maintains a MessageQueue on the main thread.
    [More Info](https://medium.com/@ankit.sinhal/messagequeue-and-looper-in-android-3a18c7fc9181)

*  **What is a Message?** <br/>
    Message contains a description and arbitrary data object that can be sent to a Handler. Basically its used to process / send some data across threads.

*  **What is a Service?** <br/>
    A service is a component which doesn't have UI and can perform long running operations like downloading stuff, playing music etc.. which can run even exiting the application. By default service runs on main thread. This might cause ANR errors. To avoid this, we can Start service by creating a new background thread or use an IntentService that can do work in background. [Read More.](https://developer.android.com/guide/components/services)

*  **How to Stop a Service?** <br/>
    To stop a service from an activity we can call stopService(Intent intent) method. To Stop a service from itself, we can call stopSelf() method.

*  **Bound Service vs UnBounded service?** <br/>
    A Bound service is started by using method bindService(). As mentioned above system destroys bound service when no application component is accessing it.
    Unbounded service (started service) is started by using a method called startService(). Once started, it will run indefinitely even if the application component that started it is destroyed.

*  **When does a Bound Service stops?** <br/>
    A Bound Service will stop automatically by the system when all the Application Components bound to it are unbinded.
    
*  **How to start a Foreground Service?**
    We can start a foreground service by using startForegroundService(Intent intent) or by internally calling startForeground() on the service.
    For Example, [Click Here](https://github.com/vamsitallapudi/Coderefer-Android-Projects/tree/main/ServicesExample)

*  **What is Sticky Intent in Android?**  </br>
    Sticks with Android, for future broadcast listeners. For example if BATTERY_LOW event occurs then that Intent will stick with Android so that any future requests for BATTERY_LOW, will return the Intent.

*  **What is Pending Intent in Android?**<br>
    Pending Intent is an intent which you want to trigger at some time in future, even when your application is not alive. This intent can be used by other application which allows it to execute that intent with the same permissions as of our application.

    ```java
    Intent intent = new Intent(this, AnyActivity.class);

    // Creating a pending intent and wrapping our intent
    PendingIntent pendingIntent = PendingIntent.getActivity(this, 1, intent, PendingIntent.FLAG_UPDATE_CURRENT);
    try {
        // Perform the operation associated with our pendingIntent
        pendingIntent.send();
    } catch (PendingIntent.CanceledException e) {
        e.printStackTrace();
    }
    ```

    PendingIntent uses the following methods to handle the different types of intents:

    ```java
    PendingIntent.getActivity();//Retrieves a PendingIntent to start an Activity
    PendingIntent.getBroadcast();// Retrieves a PendingIntent to perform a Broadcast
    PendingIntent.getService();// Retrieves a PendingIntent to start a Service
    ```

*  **What is the difference between START_NOT_STICKY, START_STICKY AND START_REDELIVER_INTENT?** </br>
    **START_NOT_STICKY:**<br>
    If the system kills the service after onStartCommand() returns, do not recreate the service unless there are pending intents to deliver. This is the safest option to avoid running your service when not necessary and when your application can simply restart any unfinished jobs.
    
    **START_STICKY:**<br>
    If the system kills the service after onStartCommand() returns, recreate the service and call onStartCommand(), but do not redeliver the last intent. Instead, the system calls onStartCommand() with a null intent unless there are pending intents to start the service. In that case, those intents are delivered. This is suitable for media players (or similar services) that are not executing commands but are running indefinitely and waiting for a job.

    **START_REDELIVER_INTENT:**<br>
    If the system kills the service after onStartCommand() returns, recreate the service and call onStartCommand() with the last intent that was delivered to the service. Any pending intents are delivered in turn. This is *suitable for services that are actively performing a job that should be immediately resumed, such as downloading a file.*

*  **What is an Intent Service? What is the method that differentiates it to make Service run in background?**  </br>
    IntentService is a subclass of Service that can perform tasks using worker thread unlike service that blocks main thread. The additional method of IntentService is -
    **<i>onHandleIntent(Intent)</i>** which helps the IntentService to run a particular code block declared inside it, in worker/background thread. The speciality of Intent Service is if there are more tasks given to it, IntentService will pass those intents one by one to the Worker thread. So if there are multiple download operations to be handled, They will be performed in a sequential order. Only one request will be processed at a time.

    **Note:** IntentService is deprecated from API 30. This is due to background restrictions imposed from API level 26. It is now recommended to use WorkManager or JobIntentService. For more Info, [Click Here](https://developer.android.com/reference/android/app/IntentService)

*  **How to Stop an IntentService?** <br/>
    An IntentService automatically stops itself after its job is done. We do not need to explicitly call any methods to stop an IntentService unlike Service which requires stopSelf() or StopService(intent:Intent).

*  **When Intent Service is Useful?** <br/>
    The IntentService can be used in long tasks usually with no communication to Main Thread. If communication is required, can use Main Thread handler or broadcast intents. Another case of use is when callbacks are needed (Intent triggered tasks).

*  **Advantage of Retrofit over Volley?** <br/>
    Retrofit is type-safe. Type safety means that the compiler will validate request and response objects' variable types while compiling, and throw an error if you try to assign the wrong type to a variable.

*  **Advantage of Volley over Retrofit?** <br/>
    Android Volley has a very elaborate and flexible cache mechanism. When a request is made through Volley, first the cache is checked for Response. If it is found, then it is fetched and parsed, else, it will hit Network to fetch the data. Retrofit does not support cache by default.

*  **What are different launch modes available in Android?** <br/>
    There are four launch modes for an Activity in Android as follows:

    1) **standard** : Creates a new instance of an activity in the task from which it is started every single time. It is the default mode if not declared. 
    <br/>Eg: If we have an activity stack of A->B->C, If we launch Activity C again using standard Mode, the activity stack will now be A->B->C->C. We can see that two instances of C are present in the activity stack.

    1) **singleTop** : Same as standard except that if the activity is at the top of the stack, then the same instance will be used. Now the existing Activity at the top will receive the intent through a call to its onNewIntent() method.
     <br/>Eg: If we have an activity stack of A->B->C, If we launch Activity C again using singleTop Mode, the activity stack remains to be A->B->C. However if we launch B, then B will be added as new Instance to the stack (A->B->C->B).

    2) **singleTask** : A new task will be created and activity will be created at the root of this new task whenever we use launch mode as singleTask. However, if there is already a separate task with same instance, the system will call that activity's onNewIntent() method to route the intent. There can only be one instance of activity existing at a time.
    <br/>Eg: If our activity stack is A->B->C and if we launch D using singleTask, it will be A->B->C->[D]. Here braces represents the stack in separate task. If we call E using standard mode, then it will be A->B->C->[D->E].<br/>
    If we have A->B->C and if we call B again using singleTask launch Mode, the stack will now be A->[B] with B in a separate task. Activity C will be destroyed.

    1) **singleInstance** : Same as Single Task except it creates a new activity in a task and no other activities can then launched into that task. That task will forever contains only that activity. If we use standard or singleTop to launch another activities, they are launched into another tasks.
    <br/>Eg: if the Activity stack is A->B and now we launched C using singleInstance Launch Mode, the new stack will be A->B->[C]. Now if we call a new activity D from C, it will be launched into separate task. Now the new stack will be A->B->[C]->[D].  Now if we launch E from activity B, Then new stack will be A->B->E [C]->[D]. If we call C again, onNewIntent() of C will be called and new stack will be A->B->E->[C] [D].

    You can read more about them [here](https://developer.android.com/guide/components/activities/tasks-and-back-stack#ManifestForTasks).

*  **How do you declare the launch mode in your application?** <br/>
    via manifest, in activity's tag. For Eg., -> android:launchMode="singleTask"


*  **How to handle crashing of AsyncTask during screen rotation?** <br/>
    One way is by cancelling the AsyncTask by using cancel() method on its instance. It will call onCancelled() method of AsyncTask where we can do some clean-up activities like hiding progress bar etc.
    The best way to handle AsyncTask crash is to create a RetainFragment, i.e., a fragment without UI as shown in the gist below: https://gist.github.com/vamsitallapudi/26030c15829d7be8118e42b1fcd0fa42
    We can also avoid this crash by using 2 Alternatives -  1) Using RxJava by subscribing and unsubscribing at onResume() and onPause() methods respectively, 2) Using LiveData - lifecycle aware component.

*  **What is a RetainFragment / Headless Fragment?** <br/>
    Generally, Fragments are destroyed and recreated along with their parent Activity’s whenever a configuration change occurs. Calling setRetainInstance(true) allows us to bypass this destroy-and-recreate cycle, notifying the system to retain the current instance of the fragment when the activity is recreated.

*  **What is Reflection?** <br/>
    Reflection is an API that is used to examine or modify the behaviour of methods, classes and interfaces at runtime. The required classes for reflection are present in java.lang.reflect package.

*  **How to reduce your app size?** <br/>
    1. setting minifyEnabled to true
    2. setting shrinkResources to true
    3. using bundle instead of apk in developer console
    4. converting the images to vector drawables.

*  **What is the advantage of using Retrofit over AsyncTask?** <br/>
    Retrofit reduces boiler plate code by internally using GSON library which helps parsing the json file automatically. trofit is a type safe library. This means - it checks if wrong data type is assigned to variables at compilation time itself. More use-cases at: https://stackoverflow.com/a/16903205/3424919

*  **How to handle multiple network calls using Retrofit?** <br/>
    In Retrofit, we can call the operations asynchronously by using enqueue() method where as to call operations synchronously, we can use execute() method. In addition, we can use zip() operator from RxJava to perform multiple network calls using Retrofit library.

*  **When to use AsyncTask and when to use services?** <br/>
    Services are useful when you want to run code even when your application's Activity isn't open. AsyncTask is a helper class used to run some code in a separate thread and publish results in main thread. Usually AsyncTask is used for small operations and services are used for long running operations.

*  **When to use a service and when to use a thread?** <br/>
    We will use a Thread when we want to perform background operations when application is running in foreground. We will use a service even when the application is not running.

*  **What is a Handler?** <br/>
    A Handler allows you to send and process Message and Runnable objects associated with a thread's MessageQueue. Each Handler instance is associated with a single thread and that thread's message queue. When you create a new Handler, it is bound to the thread / message queue of the thread that is creating it -- from that point on, it will deliver messages and runnables to that message queue and execute them as they come out of the message queue. We will generally use handler class when we want to repeat task every few seconds.

*  **How to save password safely in Android?** <br/>
    Using Android Keystore<br/>
    <https://medium.com/@josiassena/using-the-android-keystore-system-to-store-sensitive-information-3a56175a454b>

*  **What is Alarm Manager?** <br/>
    AlarmManager is a class which helps scheduling your Application code to run at some point of time or at particular time intervals in future. When an alarm goes off, the Intent that had been registered for it is broadcast by the system, automatically starting the target application if it is not already running. Registered alarms are retained while the device is asleep (and can optionally wake the device up if they go off during that time), but will be cleared if it is turned off and rebooted.

*  **How can I get continuous location updates in android like in Google Maps?** <br/>
    We can use Fused location provider in Android set our interval in that. [More](https://stackoverflow.com/a/41500910/3424919)

*   **How to Work With Geofences?** [Link](https://code.tutsplus.com/how-to-work-with-geofences-on-android--cms-26639t)

### Android Security Related
-   * **SSL Pinning**
   - Generally SSL Certificates are issued by CAs (Certificate Authorities). SSL Certificates are used to secure a connection between a Client and a Server. But there might be some chances that if any CA is breached, our app becomes vulnerable to MITM (Man in the Middle Attack). To mitigate this problem, we can pin our Server's SSL Certificate in our Application as an additional security layer so that we can check if the certificate is really from our server or not. In few words, SSL Pinning is to increase security. Disadvantages is if the server changes the certificate, Client app needs a software update.
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

    **How do you implement it in Android?** </br>
    SSL Pinning can be done using OkHttpClient's Builder methods as follows:
    ```Kotlin
        val certificatePinner = CertificatePinner.Builder()
        .add(
            "www.coderefer.com",
    "sha256/ZCOF65ADBWPDK8P2V7+mqodtvbsTRR/D74FCU+CEEA="
        )
        .build()
    val okHttpClient = OkHttpClient.Builder()
        .certificatePinner(certificatePinner)
        .build()
    ```
    Then you supply this generated okHttpClient object to Retrofit.
    For more info, click on this [link](https://appmattus.medium.com/android-security-ssl-pinning-1db8acb6621e).
    
*  **How do you know if the device is rooted?** <br/>
    We can check if superUser apk is installed in the device or if it contains su file or xbin folder. Alternatively you can use [RootBeer](https://github.com/scottyab/rootbeer) library available in GitHub. For code part, click [Here](https://stackoverflow.com/a/35628977/3424919).
    
*  **What is Symmetric Encryption?** </br>
    Symmetric encryption deals with creating a passphrase and encrypting the file with it. Then the server needs to send this passphrase(key) to the client so that the client can decrypt. Here the problem is sending that key to decrypt the file. If Hackers can access that key, they can misuse the data.

*  **What is Asymmetric Encryption?** </br>
    Using algorithms like RSA, AES256, etc., the server generates 2 keys - public key and private key. The server then gives public key to clients. Client then encrypts the sensitive data with that public key and send it back to server. Now as the server alone has the private key, only it can decrypt the data. This is the most efficient way of sending data across the client and server.
    
    Example of this Asymmetric encryption are HTTPS using SSL certificate, Blockchain technologies like Bitcoin, etc.

    For more info, refer to this [video](https://youtu.be/AQDCe585Lnc)

*  **How do you encrypt the Data in Java?** </br>
    Using javax.crypto package's Cipher class. We can call the methods such as encrypt() or decrypt() from the Cipher class to encode or decode our data.

    To see Cipher in action, see the following [code commit](https://github.com/vamsitallapudi/Coderefer-Java-Projects/commit/443c4f7700fd68391da2ccf40f85a7e3bccd573d#diff-25a6634263c1b1f6fc4697a04e2b9904ea4b042a89af59dc93ec1f5d44848a26).

### Android Memory Related

*  **How do you create a Memory Leak in Android?** <br/>
    By passing the context to static block (class or method), we can create a Memory Leak.

*  **How do you avoid a Memory Leak in Android?** <br/>
    By making the objects eligible for GC (Garbage Collection) after a class (Activity or Fragment) is destroyed. We can also use Weak References like WeakHashMaps to loosely hold the data and make it easily available to GC.

*  **How do you identify a Memory Leak in Android?** <br/>
    By using Profiler in Android Studio or by using LeakCanary Library in Android.

* **Github Actions for Android** [Link](https://blog.mindorks.com/github-actions-for-android/)

### Android Battery Related
*  **How do you reduce battery consumption?** <br/>
    1. Never poll the server for updates.
    2. Sync only when required. Ideally, sync when phone is on Wi-Fi and plugged in.
    3. Defer your work using WorkManager.
    4. Compress your data
    5. Defer non immediate requests until the phone is plugged in or wifi is turned on. The Wi-Fi radio uses significantly less battery than the mobile radio.

*  **How do you improve battery while fetching location for an app?** <br/> 
    1. By changing Accuracy -> we can use setPriority() to PRIORITY_LOW_POWER
    2. By changing Frequency of fetching location -> we can use setInterval() to specify the time interval
    3. By increasing latency -> After our call, we can wait for longer time - we can use setMaxWaitTime() to set large timeout.
   
### Dagger 2 Related Questions:

*  **What is Dependency Injection Pattern?** <br/>
    Dependency Injection pattern is where if our object requires other object, it will be passed to our object instead of us having to create that object. This other object is called as dependency.

*  **What is Service Locator Pattern?** <br/>
    Service Locator Pattern uses central Registry known as Service Locator which upon request provides objects for our class. This pattern has severe criticism that its an Anti-Pattern.

*  **What is Anti-Pattern?** <br/>
    An anti-pattern are certain patterns in software development that are considered bad programming practices.<br/>
    For more, click [Here](https://stackoverflow.com/a/980616/3424919).

*  **What is the use-case of @BindsInstance Annotation?** <br/>
    @BindsInstance is used to bind the available data at the time of building the Component. For example, while I needed to build dagger graph and username is already available to me, then I can bind that username to that dagger dependency graph as follows:
    
    ```java
        @Component.Builder
        interface Builder {
            @BindsInstance Builder userName(@UserName String userName);
            AppComponent build();
        }
    ```


*  **What is the use-case of @Module Annotation?** <br/>
    @Module is the Annotation used on the class for the Dagger to look inside it, to provide dependencies. We may be declaring methods inside the module class that are enclosed with @Provides annotation.

*  **What is the use-case of @Provides Annotation?** <br/>
    @Provides annotation is used on a method in Module class and can return / provide a Dependency object.

*  **What is the use-case of @Component Annotation?** <br/>
    @Component is used on Interface or abstract class. Dagger uses this interface to generate an implementation class with fully formed, dependency injected implementation, using the modules declared along with it. This generated class will be preceded by Dagger. For example if i create an interface named ProgramComponent with @Component annotation, Dagger will generate a Class named 'DaggerProgramComponent' implementing the  ProgramComponent interface.

*  **What is the use-case of @Scope Annotation?** <br/>
    @Scope is an annotation used on Interface to create a new Custom Scope. A Scope declaration helps to keep single instance of a class as long as its scope exists. For example, in Android, we can use @ApplicationScope for the object to live as long as the Application is live or @ActivityScope for the object to be available till the activity is killed.

*  **What is the use of Qualifier in Dagger?** <br/>
    We are often in a situation where we will be needing multiple objects with different instance values. For example, we need declare Student("Vamsi") and Student("Krishna"). In such case we can use a Qualifier to tell Dagger that we need multiple instances of same class. The default implementation of Qualifier is using @Named annotation, for eg., @Named("student_vamsi") and @Named("student_krishna")
    If we want to create a Custom Qualifier we would be using @Qualifier to declare a custom Qualifier interface.

*  **What is the use-case of @Inject Annotation in Dagger?** <br/>
    @Inject annotation is used to request dagger to provide the respective Object. We use @Inject on Constructor, Fields (mostly where constructor is not accessible like Activities, Fragments, etc.) and Methods.

### Common Coding Programs
* **Arrays** </br>
  * [Find Maximum Sell Profit](/src/arrays/FindMaximumSellProfit.java)
  * [Find Low & High Index of a key from a given array](/src/arrays/LowHighIndex.java)
  * [Merge Overlapping Intervals](/src/arrays/MergeOverlappingIntervals.java)
  * [Move all zeros in an array to the Left or Right](/src/arrays/MoveZeroesToLeft.java)
  * [Rotate an array](/src/arrays/RotateArray.java)
  * [Find the smallest common number in a given array](/src/arrays/SmallestCommonNumber.java)
  * [Find the sum of two elements in a given array](/src/arrays/SumOfTwoValues.java)
  * [Find the minimum distance between two numbers in an array](/src/arrays/MinimumDistanceBetweenTwoNumbers.java)
  * [Find the maximum difference between the values in an array such that the largest values always comes after the smallest value](/src/arrays/FindMaxDifference.java)
  * [Find second largest element in an array](/src/arrays/FindSecondLargestElement.java)
  * [Find the 3 numbers in an array that produce the max product](/src/arrays/FindMaxProduct.java)
  * [Find missing number from an array](/src/arrays/FindMissingNumber.java)  
  </br>



* **Dynamic Programming** </br>
   * [Fibonacci Series](/src/dynamicprogramming/FibonacciSeries.java)
   * [Given an array, find the contiguous subarray with the largest sum](/src/dynamicprogramming/LargestSumSubarray.java)
   * [Find the maximum sum of a subsequence such that no consecutive elements are part of the subsequence](/src/dynamicprogramming/MaxSumSubsequenceOfNonadjacentElements.java)
   * [Given a score "n", find the total number of ways score "n" can be reached](/src/dynamicprogramming/GameScoring.java)
   * [Compute Levenshtein distance between two strings](/src/dynamicprogramming/LevenshteinDistance.java)
   * [Given coin denominations and the total amount, find out the number​ of ways to make the change](/src/dynamicprogramming/CoinChangingProblem.java)   
   </br>
   
* **Queues** </br>
   * [Find the Maximum in a Sliding Window](/src/queue/Dequeue.java)
   * [Implement a queue using stack](/src/queue/QueuesUsingStack.java)
   </br>
   
* **LinkedList** </br>
   * [Reverse a Linked List](/src/linkedlist/ReverseLinkedList.java)
   * [Remove duplicates from a Linked List](/src/linkedlist/RemoveDuplicates.java)
   * [Delete Node of a given key from a Linked List](/src/linkedlist/DeleteNodeWithKey.java)   
   * [Find the Middle Node of a Linked List](/src/linkedlist/FindMiddleNode.java)
   * [Find the Nth Node of a Linked List](/src/linkedlist/FindNthNode.java)
   * [Check if a Linked List is cyclic](/src/linkedlist/CheckIfContainsCycle.java)
   * [Insertion Sort of a Linked List](/src/linkedlist/InsertSortLinkedList.java)
   * [Intersection Point of Two Lists](/src/linkedlist/IntersectionPoints.java)
   * [Nth from last node](/src/linkedlist/NthFromLastNode.java)
   * [Swap Nth Node with Head](/src/linkedlist/SwapNthNodeWithHead.java)
   * [Merge Two Sorted Linked Lists](/src/linkedlist/MergeLinkedList.java)
   * [Sorting LinkedList using merge sort](/src/linkedlist/MergeSortList.java)
   * [Reverse nodes at even indices](/src/linkedlist/ReverseEvenNodes.java)
   * [Rotate linked list by n](/src/linkedlist/RotateLinkedList.java)
   * [Reverse every 'k' elements in a linked list](/src/linkedlist/ReversekElements.java)
   * [Add the head pointers of two linked lists](/src/linkedlist/AddTwoIntegers.java)   
   </br>   
   
* **Stacks** </br>
   * [Evaluate an expression](/src/stacks/EvaluationExpression.java)
   * [Implement a stack using queues](/src/stacks/StacksUsingQueues.java)
   * [Check if paranthesis are equal](/src/stacks/EqualDelimiters.java)
   * [Tower of Hanoi](/src/stacks/TowerOfHanoi.java)
   * [ReverseAStack](/src/stacks/ReverseStack.java)
   </br>
   
* **Back Tracking** </br>
   * [Solve Boggle](/src/backtracks/Boggle.java)
   * [Print paranthesis combination for a given value](/src/backtracks/Parenthesis.java)
   * [Solve N queen problem](/src/backtracks/NQueenProblem.java)
   * [find all the subsets of the given array that sum up to the number K](/src/backtracks/KSumSubsets.java)
   </br>
   
* **Graphs** </br>
   * [Clone a Directed Graph](/src/graphs/CloneDirectedGraph.java)
   * [Minimum Spanning Tree](/src/graphs/MinimumSpanningTree.java)
   * [Form circular chain by given list of words](/src/graphs/WordChaining.java)   
   </br> 
   
* **Trees** </br>
   * [Implements an InOrder Iterator on a Binary Tree](/src/trees/BinaryTreeIterator.java)
   * [Convert a binary tree to a doubly linked list](/src/trees/BinaryTreeToLinkedList.java)
   * [Connect a sibling pointer of a binary tree to next node in the same level](/src/trees/ConnectAllSiblings.java)
   * [Given a binary tree, connect its siblings at each level](/src/trees/ConnectSiblings.java)
   * [Delete any subtrees whose nodes sum up to zero](/src/trees/DeleteZeroSumSubTrees.java)
   * [Given roots of two binary trees, determine if these trees are identical](/src/trees/IdenticalBinaryTree.java)
   * [Find the Inorder successor of a node in binary Search Tree](/src/trees/InOrderSuccessor.java)
   * [Algorithm to traverse the tree inorder](/src/trees/InOrderTraversal.java)
   * [Check if a given tree is a binary search tree](/src/trees/IsBST.java)
   * [Display node values at each level in a binary tree](/src/trees/LevelOrderTraversal.java)
   * [Swap the 'left' and 'right' children for each node in a binary tree](/src/trees/MirrorBinaryTreeNodes.java)
   * [Find nth highest node in a Binary Search Tree](/src/trees/NthHighestBST.java)
   * [Print nodes forming the boundary of a Binary Search Tree](/src/trees/PrintTreePerimeter.java)
   * [Serialize binary tree to a file and then deserialize back to tree](/src/trees/SerializeBinaryTree.java)   
   </br>

* **Strings** </br>
   * [Reverse String](/src/strings/ReverseString.java)
   * [Palindrone String](/src/strings/PalindroneStrings.java)
   * [Regular Expression](/src/strings/RegularExpression.java)
   * [Remove Duplicates](/src/strings/RemoveDuplicates.java)
   * [Remove White Spaces](/src/strings/RemoveWhiteSpaces.java)
   * [Remove a String](/src/strings/ReverseString.java)
   * [String Segmentation](/src/strings/StringSegmentation.java)
   * [Find next highest permutation of a given string](/src/strings/NextHighestPermutation.java)
   * [Check if two strings are anagrams](/src/strings/CheckIfAnagram.java)   
   </br>
   
* **Integers** </br>
   * [Reverse Integer](/src/math/ReverseInteger.java)
   * [Find sum of digits of an integer](/src/math/FindSumOfInteger.java)   
   * [Find Next highest Number from a Integer](/src/math/NextHighestNumber.java)
   * [Check if it is an Armstrong number](/src/math/CheckIfArmstrongNumber.java)
   * [Find the factorial of a number](/src/math/FindFactorial.java)
   * [Print all prime numbers upto the given number](/src/math/PrintPrimeNumbers.java)
   * [Find all the prime factors of a given integer](/src/math/FindPrimeFactors.java)
   * [Check if a given number is binary](/src/math/CheckIfBinary.java)
   * [Find kth permutation](/src/math/KthPermutation.java)
   * [Integer Division](/src/math/IntegerDivision.java)
   * [Find Pythagorean Triplets](/src/math/FindPythagoreanTriplets.java)
   * [Print all possible sum combinations using positive integers](/src/math/SumCombinations.java)
   * [Find Missing Number](/src/math/FindMissingNumber.java)   
   * [Find all subsets of a given set of integers](/src/math/IntegerSubsets.java)
   * [Given an input string, determine if it makes a valid number](/src/math/NumberValidity.java)
   * [Calculate 'x' raised to the power 'n'](/src/math/PowerOfNumber.java)
   * [Calculate square root of a number](/src/math/CalculateRoot.java)
   * [Minimum Number of Platforms Required for a Railway/Bus Station](/src/math/MinimumPlatforms.java)   
   </br>   
   
* **Miscellaneous** </br>
   * [Find three integers in the array with sum equal to the given value](/src/misc/SumOfThreeValues.java)
   * [Find position of a given key in 2D matrix](/src/misc/SearchMatrix.java)
   * [Determine the host byte order of any system](/src/misc/HostByteOrder.java)
   * [Find the point that requires the least total distance covered by all the ​people to meet at that point](/src/misc/ClosestMeetingPoint.java)
   * [Given a two dimensional array, if any element in it is zero make its whole row and column zero](/src/misc/SumOfThreeValues.java)
   </br>   
  
### Data Structure Coding Programs
* **Sorting** </br>
   * [BubbleSort](/src/sort/BubbleSort.java)
   * [InsertionSort](/src/sort/InsertionSort.java)
   * [SelectionSort](/src/sort/SelectionSort.java)
   * [QuickSort](/src/sort/QuickSort.java)
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


### Java

* What are the access modifiers you know? What does each one do?
* What is the difference between an Integer and int?
* Do objects get passed by reference or value in Java? Elaborate on that.
* What is a ThreadPoolExecutor? [Link](https://blog.mindorks.com/threadpoolexecutor-in-android-8e9d22330ee3)
* What the difference between local, instance and class variables?
* What is reflection? [Link](http://tutorials.jenkov.com/java-reflection/index.html)
* What are strong, soft and weak references in Java?
* What is dependency injection? Can you name few libraries? Have you used any?
* What does it means to say that a `String` is immutable?
* What are `transient` and `volatile` modifiers?
* What is the `finalize()` method?
* How does the `try{}finally{}` works?
* What is the difference between instantiation and initialization of an object?
* When is a `static` block run?
* Explain Generics in Java?
* Difference between `StringBuffer` and `StringBuilder`?
* How is a `StringBuilder` implemented to avoid the immutable string allocation problem?
* What’s the difference between an Enumeration and an Iterator?
* What is the difference between fail-fast and fail safe in Java?
* What is Java priority queue?

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
* Do you know what is the view tree? How can you optimize its depth?
* What is the `onTrimMemory` method?
* Is it possible to run an Android app in multiple processes? How?
* How does the OutOfMemory happens?
* What is a `spannable`?
* What is renderscript? [Link](https://blog.mindorks.com/comparing-android-ndk-and-renderscript-1a718c01f6fe)
* What are the differences between Dalvik and ART?
* FlatBuffers vs JSON. [Link](https://blog.mindorks.com/why-consider-flatbuffer-over-json-2e4aa8d4ed07)
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

### Data Structures And Algorithms

* **Explain Big O Notation?** </br>
   * The notation Ο(n) is the formal way to express the upper bound of an algorithm's running time. It measures the worst case time complexity or the longest amount of time an algorithm can possibly take to complete. 
   * Note: **O(1)** means that it takes a constant time, like three minutes no matter the amount of data in the set.
**O(n)** means it takes an amount of time linear with the size of the set.</br>

* **Explain Big Omega Notation** </br>
   * The Big Omega Notation is used to describe the best case running time for a given algorithm.</br>

* **Sorting Techniques** </br>
  - Count Sort [Link](https://www.includehelp.com/kotlin/sorting-in-linear-time-and-program-for-count-sort.aspx)
  - Shell Sort [Link](https://www.tutorialspoint.com/data_structures_algorithms/shell_sort_algorithm.htm)
   
* **Difference between stacks & queues?** </br>
  <a href="https://github.com/anitaa1990/Android-Cheat-sheet/blob/master/media/3.png" target="_blank"><img src="https://github.com/anitaa1990/Android-Cheat-sheet/blob/master/media/3.png"></a></br>

* **Data Structure and Algorithms** </br>
  * https://www.tutorialspoint.com/data_structures_algorithms/shell_sort_algorithm.htm
  * https://www.geeksforgeeks.org/learn-data-structures-and-algorithms-dsa-tutorial/
  * https://amitshekhar.me/blog/android-developer-should-know-these-data-structures-for-next-interview
  * https://afteracademy.com/tech-interview/ds-algo-concepts/
  * https://afteracademy.com/blogs/
  
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
* APK Size Reduction. [Link](https://blog.mindorks.com/how-to-reduce-apk-size-in-android-2f3713d2d662)
* Android Development Best Practices. [Link](https://blog.mindorks.com/android-development-best-practices-83c94b027fd3)
* Android Code Style And Guidelines. [Link](https://blog.mindorks.com/android-code-style-and-guidelines-d5f80453d5c7)
* Have you tried Kotlin? [Link](https://medium.com/p/why-you-must-try-kotlin-for-android-development-e14d00c8084b)
* What are the metrics that you should measure continuously while android application development? [Link](https://blog.mindorks.com/android-app-performance-metrics-a1176334186e)

### Contributing to Android Interview Questions
Just make pull request. You are in!


