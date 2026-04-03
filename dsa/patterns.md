# DSA: Patterns, Cheatsheets & Curated Links (Senior / FAANG)

## Starter resources

- [Coding Interview University (jwasham)](https://github.com/jwasham/coding-interview-university/blob/main/README.md)
- [Big O Cheat Sheet](https://www.bigocheatsheet.com/)
- [NeetCode practice (all)](https://neetcode.io/practice/practice/allNC)
- [NeetCode YouTube channel](https://www.youtube.com/@NeetCode/courses)
- [Striver DSA playlist](https://www.youtube.com/watch?v=0bHoB32fuj0&list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz)

# Data Structure and Algorithm

* **Sorting** </br>
   * [BubbleSort](/src/sort/BubbleSort.java)
   * [InsertionSort](/src/sort/InsertionSort.java)
   * [SelectionSort](/src/sort/SelectionSort.java)
   * [QuickSort](/src/sort/QuickSort.java)
   * [Count Sort](https://www.includehelp.com/kotlin/sorting-in-linear-time-and-program-for-count-sort.aspx)
   * [Shell Sort](https://www.tutorialspoint.com/data_structures_algorithms/shell_sort_algorithm.htm)
   * [MergeSort](/src/sort/MergeSort.java)

* **Question: Why is quicksort preferred over merge sort for sorting arrays?** </br>
    Quicksort does not require any extra storage whereas merge sort requires O(n) space allocation. Allocating/de-allocating memory space can increase the run time.</br>

* **Question: Why is merge sort preferred over quicksort for sorting linked lists?** </br>
    There is a difference in linked lists due to memory allocation. In linked lists we can insert items in the middle in O(n) space and time. There is no extra memory allocation required.     
   
* **Searching** </br>
   * [Binary Search](/src/search/BinarySearch.java)
   * [Rotated Binary Search](/src/search/RotatedBinarySearch.java)
   * [Ternary Search](/src/search/TernarySearch.java)  

* **Question: Why is binary search preferred over ternary search?** </br>
    When dividing an array by k ( 2(binary) or 3(ternary)), it reduces the array size to 1/k. But it increases the no of comparisons by k.
   
* **Runtime Complexity Table:** </br></br>
   <a href="https://github.com/anitaa1990/Android-Cheat-sheet/blob/master/media/4.png" target="_blank"><img src="https://github.com/anitaa1990/Android-Cheat-sheet/blob/master/media/4.png"></a></br>


* **Explain Big O Notation?** [Link](https://www.freecodecamp.org/news/big-o-cheat-sheet-time-complexity-chart/)</br>
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
  * https://www.linkedin.com/feed/update/urn:li:activity:7211903578356035584/

---



# Leetcode

* **Coding Patterns PDF** [Link](/assets/coding_patterns.pdf)

* **Coding Patterns Github** [Link](https://github.com/Chanda-Abdul/Several-Coding-Patterns-for-Solving-Data-Structures-and-Algorithms-Problems-during-Interviews)
  
* **Coding Interview Quetions** [Link](/assets/coding_interview_questions.pdf)

* **Video roadmap** [Link](https://takeuforward.org/interviews/blind-75-leetcode-problems-detailed-video-solutions)
  
* **Leetcode Roadmap**
  * Dynamic Programming [45 Problems](https://lnkd.in/gHYgRDSZ)
  * Greedy Algorithms [34 Problems](https://lnkd.in/gianQPuw)
  * Graphs [32 Problems](https://lnkd.in/gcHRz5-p)
  * Backtracking [17 Problems](https://lnkd.in/gersVnrz)
  * Linked List [13 Problems](https://lnkd.in/gT_FhqYa)
  * Bit Manipulation [21 Problems](https://lnkd.in/gtZZc6tR)
  * Hash Table and Map [46 Problems](https://lnkd.in/gPsUh6w5)
  * Disjoint Set Union (Union Find) [25 Problems](https://lnkd.in/gQx74mJc)
  * Bridges and Articulation Points [4 Problems](https://lnkd.in/gRpJ6qxN)
  * Dijkstra Algorithm [13 Problems](https://lnkd.in/gRsxH7Th)
  * Bellman Ford Algorithm [5 Problems](https://lnkd.in/gBN54_mc)
  * Floyd Warshall Algorithm [6 Problems](https://lnkd.in/g6zvRYbb)
  * Topological Sort [4 Problems](https://lnkd.in/gBaaZCbM)
  * Sliding Window [12 Problems](https://lnkd.in/gbMnsS8i)
  * Trie [8 Problems](https://lnkd.in/gDqU7Ypy)
  * Monotonic Queue and Priority Queue [13 Problems](https://lnkd.in/gzrcfZtj)
  * Heaps [22 Problems](https://lnkd.in/gNsjGw8p)
  * Trees [Top 26 Problems](https://lnkd.in/g5vXWFu3)
  * Binary Search [25 Problems](https://lnkd.in/gjykw7x2)
  * Two Pointers [30 Problems](https://lnkd.in/gZeG-PXb)

---



## Two Pointer:
```kotlin
fun twoPointers(arr: IntArray): Int {
    var left = 0
    var right = arr.size - 1
    
    while (left < right) {
        // Process current state
        val sum = arr[left] + arr[right]
        
        when {
            sum == target -> return // found solution
            sum < target -> left++
            else -> right--
        }
    }
    
    return -1 // not found
}
```

## Fixed Sliding Window:
```kotlin
fun fixedSlidingWindow(arr: IntArray, k: Int): Int {
    var windowSum = 0
    var maxSum = Int.MIN_VALUE
    
    // Calculate first window
    for (i in 0 until k) {
        windowSum += arr[i]
    }
    maxSum = windowSum
    
    // Slide the window
    for (i in k until arr.size) {
        windowSum += arr[i] - arr[i - k]
        maxSum = maxOf(maxSum, windowSum)
    }
    
    return maxSum
}
```

## Variable Size Sliding Window:
```kotlin
fun variableSlidingWindow(arr: IntArray, target: Int): Int {
    var left = 0
    var currentSum = 0
    var result = Int.MAX_VALUE
    
    for (right in arr.indices) {
        currentSum += arr[right]
        
        while (currentSum >= target) {
            result = minOf(result, right - left + 1)
            currentSum -= arr[left]
            left++
        }
    }
    
    return if (result == Int.MAX_VALUE) -1 else result
}
```

## Prefix Sum:
```kotlin
fun prefixSum(arr: IntArray): IntArray {
    val prefix = IntArray(arr.size)
    prefix[0] = arr[0]
    
    for (i in 1 until arr.size) {
        prefix[i] = prefix[i-1] + arr[i]
    }
    
    return prefix
}

// Range sum query
fun rangeSum(prefix: IntArray, left: Int, right: Int): Int {
    return if (left == 0) prefix[right] 
           else prefix[right] - prefix[left - 1]
}
```

## KMP Algorithm:
```kotlin
fun kmpSearch(text: String, pattern: String): List<Int> {
    if (needle.isEmpty()) return 0
    val lps = computeLPS(needle)

    var i = 0 // haystack pointer
    var j = 0 // needle pointer

    while (i < haystack.length) {
        when {
            haystack[i] == needle[j] -> {
                i++
                j++
                if (j == needle.length) return i - j // found match
            }
            j == 0 -> i++
            else -> j = lps[j - 1] // fallback in needle
        }
    }
    return -1
}

fun computeLPS(pattern: String): IntArray {
    val lps = IntArray(pattern.length)
    var len = 0
    var i = 1

    while (i < pattern.length) {
        when {
            pattern[i] == pattern[len] -> {
                lps[i] = len + 1
                len++
                i++
            }
            len == 0 -> {
                lps[i] = 0
                i++
            }
            else -> len = lps[len - 1]
        }
    }
    return lps
} 
```

## Palindrom Check:
```kotlin
fun isPalindrome(s: String): Boolean {
    var left = 0
    var right = s.length - 1
    
    while (left < right) {
        if (s[left] != s[right]) return false
        left++
        right--
    }
    
    return true
}
```

## Longest Palindromic Substring:
```kotlin
fun longestPalindrome(s: String): String {
    var start = 0
    var maxLen = 1
    
    for (i in s.indices) {
        // Odd length palindromes
        var len1 = expandAroundCenter(s, i, i)
        // Even length palindromes  
        var len2 = expandAroundCenter(s, i, i + 1)
        
        val len = maxOf(len1, len2)
        if (len > maxLen) {
            maxLen = len
            start = i - (len - 1) / 2
        }
    }
    
    return s.substring(start, start + maxLen)
}

fun expandAroundCenter(s: String, left: Int, right: Int): Int {
    var l = left
    var r = right
    
    while (l >= 0 && r < s.length && s[l] == s[r]) {
        l--
        r++
    }
    
    return r - l - 1
}
```

## Reversal Template:
```kotlin
fun reverseList(head: ListNode?): ListNode? {
    var prev: ListNode? = null
    var current = head
    
    while (current != null) {
        val next = current.next
        current.next = prev
        prev = current
        current = next
    }
    
    return prev
}
```

## Cycle Detection (Floyd's Algorithm):
```kotlin
fun hasCycle(head: ListNode?): Boolean {
    var slow = head
    var fast = head
    
    while (fast?.next != null) {
        slow = slow?.next
        fast = fast.next?.next
        
        if (slow == fast) return true
    }
    
    return false
}

fun detectCycle(head: ListNode?): ListNode? {
    var slow = head
    var fast = head
    
    // Find meeting point
    while (fast?.next != null) {
        slow = slow?.next
        fast = fast.next?.next
        
        if (slow == fast) break
    }
    
    if (fast?.next == null) return null
    
    // Find start of cycle
    slow = head
    while (slow != fast) {
        slow = slow?.next
        fast = fast?.next
    }
    
    return slow
}
```

# Merge Two Lists
```kotlin
fun mergeTwoLinkLists(l1: ListNode?, l2: ListNode?): ListNode? {
    val dummy = ListNode(0)
    var current = dummy
    var list1 = l1
    var list2 = l2
    
    while (list1 != null && list2 != null) {
        if (list1.`val` <= list2.`val`) {
            current.next = list1
            list1 = list1.next
        } else {
            current.next = list2
            list2 = list2.next
        }
        current = current.next!!
    }
    
    current.next = list1 ?: list2
    
    return dummy.next
}
```

### Stack Implementation:
```kotlin
class CustomStack {
    private val stack = mutableListOf<Int>()
    
    fun push(item: Int) = stack.add(item)
    fun pop(): Int? = if (stack.isEmpty()) null else stack.removeAt(stack.size - 1)
    fun peek(): Int? = stack.lastOrNull()
    fun isEmpty() = stack.isEmpty()
    fun size() = stack.size
}
```

### Queue Implementation:
```kotlin
class CustomQueue {
    private val queue = mutableListOf<Int>()
    
    fun enqueue(item: Int) = queue.add(item)
    fun dequeue(): Int? = if (queue.isEmpty()) null else queue.removeAt(0)
    fun front(): Int? = queue.firstOrNull()
    fun isEmpty() = queue.isEmpty()
    fun size() = queue.size
}
```

### Monotonic Stack:
```kotlin
fun nextGreaterElement(nums: IntArray): IntArray {
    val result = IntArray(nums.size)
    val stack = Stack<Int>() // stores indices
    
    for (i in nums.indices) {
        while (stack.isNotEmpty() && nums[i] > nums[stack.peek()]) {
            val index = stack.pop()
            result[index] = nums[i]
        }
        stack.add(i)
    }
    
    return result
}
```

### DFS Templates:
```kotlin
// Inorder: Left -> Root -> Right
fun inorderTraversal(root: TreeNode?): List<Int> {
    val result = mutableListOf<Int>()
    
    fun dfs(node: TreeNode?) {
        if (node == null) return
        
        dfs(node.left)
        result.add(node.`val`)
        dfs(node.right)
    }
    
    dfs(root)
    return result
}

// Preorder: Root -> Left -> Right
fun preorderTraversal(root: TreeNode?): List<Int> {
    val result = mutableListOf<Int>()
    
    fun dfs(node: TreeNode?) {
        if (node == null) return
        
        result.add(node.`val`)
        dfs(node.left)
        dfs(node.right)
    }
    
    dfs(root)
    return result
}

// Postorder: Left -> Right -> Root
fun postorderTraversal(root: TreeNode?): List<Int> {
    val result = mutableListOf<Int>()
    
    fun dfs(node: TreeNode?) {
        if (node == null) return
        
        dfs(node.left)
        dfs(node.right)
        result.add(node.`val`)
    }
    
    dfs(root)
    return result
}
```

### BFS:
```kotlin
fun levelOrder(root: TreeNode?): List<List<Int>> {
    val result = mutableListOf<List<Int>>()
    if (root == null) return result
    
    val queue = ArrayDeque<TreeNode>()
    queue.add(root)
    
    while (queue.isNotEmpty()) {
        val levelSize = queue.size
        val currentLevel = mutableListOf<Int>()
        
        repeat(levelSize) {
            val node = queue.removeFirst()
            currentLevel.add(node.`val`)
            
            node.left?.let { queue.add(it) }
            node.right?.let { queue.add(it) }
        }
        
        result.add(currentLevel)
    }
    
    return result
}
```

### Tree Properties:
```kotlin
// Maximum Depth
fun maxDepth(root: TreeNode?): Int {
    if (root == null) return 0
    return 1 + maxOf(maxDepth(root.left), maxDepth(root.right))
}

// Balanced Tree Check
fun isBalanced(root: TreeNode?): Boolean {
    fun height(node: TreeNode?): Int {
        if (node == null) return 0
        
        val leftHeight = height(node.left)
        val rightHeight = height(node.right)
        
        if (leftHeight == -1 || rightHeight == -1 || 
            kotlin.math.abs(leftHeight - rightHeight) > 1) {
            return -1
        }
        
        return 1 + maxOf(leftHeight, rightHeight)
    }
    
    return height(root) != -1
}
```

 DFS Template:
kotlinfun dfs(graph: Graph, start: Int, visited: MutableSet<Int>) {
    visited.add(start)
    
    graph[start]?.forEach { neighbor ->
        if (neighbor !in visited) {
            dfs(graph, neighbor, visited)
        }
    }
}

### DFS with path
```kotlin
fun dfsWithPath(graph: Graph, start: Int, target: Int, 
                visited: MutableSet<Int>, path: MutableList<Int>): Boolean {
    visited.add(start)
    path.add(start)
    
    if (start == target) return true
    
    graph[start]?.forEach { neighbor ->
        if (neighbor !in visited) {
            if (dfsWithPath(graph, neighbor, target, visited, path)) {
                return true
            }
        }
    }
    
    path.removeAt(path.size - 1)
    return false
}
```

### BFS:
```kotlin
kotlinfun bfs(graph: Graph, start: Int): List<Int> {
    val visited = mutableSetOf<Int>()
    val queue = ArrayDeque<Int>()
    val result = mutableListOf<Int>()
    
    queue.add(start)
    visited.add(start)
    
    while (queue.isNotEmpty()) {
        val node = queue.removeFirst()
        result.add(node)
        
        graph[node]?.forEach { neighbor ->
            if (neighbor !in visited) {
                visited.add(neighbor)
                queue.add(neighbor)
            }
        }
    }
    
    return result
}

// Shortest path in unweighted graph
fun shortestPath(graph: Graph, start: Int, target: Int): Int {
    val queue = ArrayDeque<Pair<Int, Int>>()
    val visited = mutableSetOf<Int>()
    
    queue.add(start to 0)
    visited.add(start)
    
    while (queue.isNotEmpty()) {
        val (node, distance) = queue.removeFirst()
        
        if (node == target) return distance
        
        graph[node]?.forEach { neighbor ->
            if (neighbor !in visited) {
                visited.add(neighbor)
                queue.add(neighbor to distance + 1)
            }
        }
    }
    
    return -1 // Path not found
}
```

### Dijkstra's Algorithm:
```kotlin
data class Edge(val to: Int, val weight: Int)

fun dijkstra(graph: Map<Int, List<Edge>>, start: Int): Map<Int, Int> {
    val distances = mutableMapOf<Int, Int>()
    val pq = PriorityQueue<Pair<Int, Int>>(compareBy { it.second })
    
    distances[start] = 0
    pq.add(start to 0)
    
    while (pq.isNotEmpty()) {
        val (node, currentDist) = pq.poll()
        
        if (currentDist > distances[node] ?: Int.MAX_VALUE) continue
        
        graph[node]?.forEach { edge ->
            val newDist = currentDist + edge.weight
            
            if (newDist < distances[edge.to] ?: Int.MAX_VALUE) {
                distances[edge.to] = newDist
                pq.add(edge.to to newDist)
            }
        }
    }
    
    return distances
}
```



---



# Kotlin Algorithm Patterns - Optimized Code Snippets

A comprehensive collection of the most common algorithms and data structures implemented in Kotlin with optimal time and space complexity.

## Array Algorithms

### Array Reverse
**Time Complexity:** O(n) | **Space Complexity:** O(1)

```kotlin
fun reverseArray(arr: IntArray) {
    var left = 0
    var right = arr.size - 1
    while (left < right) {
        val temp = arr[left]
        arr[left] = arr[right]
        arr[right] = temp
        left++
        right--
    }
}
```

### Maximum Subarray Sum (Kadane's Algorithm)
**Time Complexity:** O(n) | **Space Complexity:** O(1)

```kotlin
fun maxSubarraySum(arr: IntArray): Int {
    var maxSoFar = arr[0]
    var maxEndingHere = arr[0]
    
    for (i in 1 until arr.size) {
        maxEndingHere = maxOf(arr[i], maxEndingHere + arr[i])
        maxSoFar = maxOf(maxSoFar, maxEndingHere)
    }
    return maxSoFar
}
```

## String Algorithms

### Check Palindrome
**Time Complexity:** O(n) | **Space Complexity:** O(1)

```kotlin
fun isPalindrome(s: String): Boolean {
    var left = 0
    var right = s.length - 1
    
    while (left < right) {
        if (s[left] != s[right]) return false
        left++
        right--
    }
    return true
}
```

### Longest Substring Without Repeating Characters
**Time Complexity:** O(n) | **Space Complexity:** O(min(m,n))

```kotlin
fun lengthOfLongestSubstring(s: String): Int {
    val charSet = mutableSetOf<Char>()
    var left = 0
    var maxLength = 0
    
    for (right in s.indices) {
        while (s[right] in charSet) {
            charSet.remove(s[left])
            left++
        }
        charSet.add(s[right])
        maxLength = maxOf(maxLength, right - left + 1)
    }
    return maxLength
}
```

## Hash Table

### Two Sum
**Time Complexity:** O(n) | **Space Complexity:** O(n)

```kotlin
fun twoSum(nums: IntArray, target: Int): IntArray {
    val map = mutableMapOf<Int, Int>()
    
    for (i in nums.indices) {
        val complement = target - nums[i]
        if (complement in map) {
            return intArrayOf(map[complement]!!, i)
        }
        map[nums[i]] = i
    }
    return intArrayOf()
}
```

### Group Anagrams
**Time Complexity:** O(n*k*log(k)) | **Space Complexity:** O(n*k)

```kotlin
fun groupAnagrams(strs: Array<String>): List<List<String>> {
    val map = mutableMapOf<String, MutableList<String>>()
    
    for (str in strs) {
        val key = str.toCharArray().sorted().joinToString("")
        map.computeIfAbsent(key) { mutableListOf() }.add(str)
    }
    return map.values.toList()
}
```

## Dynamic Programming

### Fibonacci Sequence
**Time Complexity:** O(n) | **Space Complexity:** O(1)

```kotlin
fun fibonacci(n: Int): Int {
    if (n <= 1) return n
    
    var prev2 = 0
    var prev1 = 1
    
    for (i in 2..n) {
        val current = prev1 + prev2
        prev2 = prev1
        prev1 = current
    }
    return prev1
}
```

### Longest Increasing Subsequence
**Time Complexity:** O(n*log(n)) | **Space Complexity:** O(n)

```kotlin
fun lengthOfLIS(nums: IntArray): Int {
    val tails = mutableListOf<Int>()
    
    for (num in nums) {
        val pos = tails.binarySearch(num)
        val insertPos = if (pos < 0) -(pos + 1) else pos
        
        if (insertPos == tails.size) {
            tails.add(num)
        } else {
            tails[insertPos] = num
        }
    }
    return tails.size
}
```

## Sorting Algorithms

### Quick Sort
**Time Complexity:** O(n*log(n)) average, O(n²) worst | **Space Complexity:** O(log(n))

```kotlin
fun quickSort(arr: IntArray, low: Int = 0, high: Int = arr.size - 1) {
    if (low < high) {
        val pi = partition(arr, low, high)
        quickSort(arr, low, pi - 1)
        quickSort(arr, pi + 1, high)
    }
}

private fun partition(arr: IntArray, low: Int, high: Int): Int {
    val pivot = arr[high]
    var i = low - 1
    
    for (j in low until high) {
        if (arr[j] <= pivot) {
            i++
            swap(arr, i, j)
        }
    }
    swap(arr, i + 1, high)
    return i + 1
}

private fun swap(arr: IntArray, i: Int, j: Int) {
    val temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
}
```

### Merge Sort
**Time Complexity:** O(n*log(n)) | **Space Complexity:** O(n)

```kotlin
fun mergeSort(arr: IntArray, left: Int = 0, right: Int = arr.size - 1) {
    if (left < right) {
        val mid = left + (right - left) / 2
        mergeSort(arr, left, mid)
        mergeSort(arr, mid + 1, right)
        merge(arr, left, mid, right)
    }
}

private fun merge(arr: IntArray, left: Int, mid: Int, right: Int) {
    val leftArray = arr.copyOfRange(left, mid + 1)
    val rightArray = arr.copyOfRange(mid + 1, right + 1)
    
    var i = 0
    var j = 0
    var k = left
    
    while (i < leftArray.size && j < rightArray.size) {
        if (leftArray[i] <= rightArray[j]) {
            arr[k] = leftArray[i]
            i++
        } else {
            arr[k] = rightArray[j]
            j++
        }
        k++
    }
    
    while (i < leftArray.size) {
        arr[k] = leftArray[i]
        i++
        k++
    }
    
    while (j < rightArray.size) {
        arr[k] = rightArray[j]
        j++
        k++
    }
}
```

## Binary Search

### Basic Binary Search
**Time Complexity:** O(log(n)) | **Space Complexity:** O(1)

```kotlin
fun binarySearch(arr: IntArray, target: Int): Int {
    var left = 0
    var right = arr.size - 1
    
    while (left <= right) {
        val mid = left + (right - left) / 2
        
        when {
            arr[mid] == target -> return mid
            arr[mid] < target -> left = mid + 1
            else -> right = mid - 1
        }
    }
    return -1
}
```

### Search in Rotated Sorted Array
**Time Complexity:** O(log(n)) | **Space Complexity:** O(1)

```kotlin
fun searchRotated(nums: IntArray, target: Int): Int {
    var left = 0
    var right = nums.size - 1
    
    while (left <= right) {
        val mid = left + (right - left) / 2
        
        if (nums[mid] == target) return mid
        
        // Left half is sorted
        if (nums[left] <= nums[mid]) {
            if (target >= nums[left] && target < nums[mid]) {
                right = mid - 1
            } else {
                left = mid + 1
            }
        } else { // Right half is sorted
            if (target > nums[mid] && target <= nums[right]) {
                left = mid + 1
            } else {
                right = mid - 1
            }
        }
    }
    return -1
}
```

## Two Pointers

### Remove Duplicates from Sorted Array
**Time Complexity:** O(n) | **Space Complexity:** O(1)

```kotlin
fun removeDuplicates(nums: IntArray): Int {
    if (nums.isEmpty()) return 0
    
    var i = 0
    for (j in 1 until nums.size) {
        if (nums[j] != nums[i]) {
            i++
            nums[i] = nums[j]
        }
    }
    return i + 1
}
```

### Container With Most Water
**Time Complexity:** O(n) | **Space Complexity:** O(1)

```kotlin
fun maxArea(height: IntArray): Int {
    var left = 0
    var right = height.size - 1
    var maxWater = 0
    
    while (left < right) {
        val area = minOf(height[left], height[right]) * (right - left)
        maxWater = maxOf(maxWater, area)
        
        if (height[left] < height[right]) {
            left++
        } else {
            right--
        }
    }
    return maxWater
}
```

## Sliding Window

### Maximum Sum Subarray of Size K
**Time Complexity:** O(n) | **Space Complexity:** O(1)

```kotlin
fun maxSumSubarray(arr: IntArray, k: Int): Int {
    var windowSum = arr.take(k).sum()
    var maxSum = windowSum
    
    for (i in k until arr.size) {
        windowSum += arr[i] - arr[i - k]
        maxSum = maxOf(maxSum, windowSum)
    }
    return maxSum
}
```

## Tree Algorithms

### Tree Node Definition

```kotlin
class TreeNode(var `val`: Int) {
    var left: TreeNode? = null
    var right: TreeNode? = null
}
```

### Tree Inorder Traversal
**Time Complexity:** O(n) | **Space Complexity:** O(h)

```kotlin
fun inorderTraversal(root: TreeNode?): List<Int> {
    val result = mutableListOf<Int>()
    
    fun inorder(node: TreeNode?) {
        node?.let {
            inorder(it.left)
            result.add(it.`val`)
            inorder(it.right)
        }
    }
    
    inorder(root)
    return result
}
```

### Maximum Depth of Binary Tree
**Time Complexity:** O(n) | **Space Complexity:** O(h)

```kotlin
fun maxDepth(root: TreeNode?): Int {
    return if (root == null) 0
    else 1 + maxOf(maxDepth(root.left), maxDepth(root.right))
}
```

## Depth-First Search (DFS)

### DFS on Graph
**Time Complexity:** O(V + E) | **Space Complexity:** O(V)

```kotlin
fun dfs(graph: Array<MutableList<Int>>, start: Int): List<Int> {
    val visited = BooleanArray(graph.size)
    val result = mutableListOf<Int>()
    
    fun dfsHelper(node: Int) {
        visited[node] = true
        result.add(node)
        
        for (neighbor in graph[node]) {
            if (!visited[neighbor]) {
                dfsHelper(neighbor)
            }
        }
    }
    
    dfsHelper(start)
    return result
}
```

## Breadth-First Search (BFS)

### BFS on Graph
**Time Complexity:** O(V + E) | **Space Complexity:** O(V)

```kotlin
fun bfs(graph: Array<MutableList<Int>>, start: Int): List<Int> {
    val visited = BooleanArray(graph.size)
    val queue = ArrayDeque<Int>()
    val result = mutableListOf<Int>()
    
    queue.offer(start)
    visited[start] = true
    
    while (queue.isNotEmpty()) {
        val node = queue.poll()
        result.add(node)
        
        for (neighbor in graph[node]) {
            if (!visited[neighbor]) {
                visited[neighbor] = true
                queue.offer(neighbor)
            }
        }
    }
    return result
}
```

## Heap (Priority Queue)

### Kth Largest Element
**Time Complexity:** O(n*log(k)) | **Space Complexity:** O(k)

```kotlin
fun findKthLargest(nums: IntArray, k: Int): Int {
    val minHeap = java.util.PriorityQueue<Int>()
    
    for (num in nums) {
        minHeap.offer(num)
        if (minHeap.size > k) {
            minHeap.poll()
        }
    }
    return minHeap.peek()
}
```

## Stack

### Valid Parentheses
**Time Complexity:** O(n) | **Space Complexity:** O(n)

```kotlin
fun isValidParentheses(s: String): Boolean {
    val stack = ArrayDeque<Char>()
    val pairs = mapOf(')' to '(', '}' to '{', ']' to '[')
    
    for (char in s) {
        when (char) {
            '(', '{', '[' -> stack.push(char)
            ')', '}', ']' -> {
                if (stack.isEmpty() || stack.pop() != pairs[char]) {
                    return false
                }
            }
        }
    }
    return stack.isEmpty()
}
```

## Linked List

### ListNode Definition

```kotlin
class ListNode(var `val`: Int) {
    var next: ListNode? = null
}
```

### Reverse Linked List
**Time Complexity:** O(n) | **Space Complexity:** O(1)

```kotlin
fun reverseList(head: ListNode?): ListNode? {
    var prev: ListNode? = null
    var current = head
    
    while (current != null) {
        val nextTemp = current.next
        current.next = prev
        prev = current
        current = nextTemp
    }
    return prev
}
```

### Detect Cycle in Linked List
**Time Complexity:** O(n) | **Space Complexity:** O(1)

```kotlin
fun hasCycle(head: ListNode?): Boolean {
    var slow = head
    var fast = head
    
    while (fast?.next != null) {
        slow = slow?.next
        fast = fast.next?.next
        
        if (slow == fast) return true
    }
    return false
}
```

## Bit Manipulation

### Count Number of 1 Bits
**Time Complexity:** O(log(n)) | **Space Complexity:** O(1)

```kotlin
fun hammingWeight(n: Int): Int {
    var num = n
    var count = 0
    
    while (num != 0) {
        count += num and 1
        num = num ushr 1
    }
    return count
}
```

### Single Number (XOR)
**Time Complexity:** O(n) | **Space Complexity:** O(1)

```kotlin
fun singleNumber(nums: IntArray): Int {
    var result = 0
    for (num in nums) {
        result = result xor num
    }
    return result
}
```

## Backtracking

### Generate All Permutations
**Time Complexity:** O(n! * n) | **Space Complexity:** O(n)

```kotlin
fun permute(nums: IntArray): List<List<Int>> {
    val result = mutableListOf<List<Int>>()
    val current = mutableListOf<Int>()
    val used = BooleanArray(nums.size)
    
    fun backtrack() {
        if (current.size == nums.size) {
            result.add(current.toList())
            return
        }
        
        for (i in nums.indices) {
            if (!used[i]) {
                current.add(nums[i])
                used[i] = true
                backtrack()
                current.removeAt(current.size - 1)
                used[i] = false
            }
        }
    }
    
    backtrack()
    return result
}
```

## Trie

### Trie Data Structure
**Insert/Search Time Complexity:** O(m) | **Space Complexity:** O(ALPHABET_SIZE * N * M)

```kotlin
class Trie {
    class TrieNode {
        val children = Array<TrieNode?>(26) { null }
        var isEndOfWord = false
    }
    
    private val root = TrieNode()
    
    fun insert(word: String) {
        var current = root
        for (char in word) {
            val index = char - 'a'
            if (current.children[index] == null) {
                current.children[index] = TrieNode()
            }
            current = current.children[index]!!
        }
        current.isEndOfWord = true
    }
    
    fun search(word: String): Boolean {
        var current = root
        for (char in word) {
            val index = char - 'a'
            if (current.children[index] == null) {
                return false
            }
            current = current.children[index]!!
        }
        return current.isEndOfWord
    }
}
```

## Union Find (Disjoint Set)

### Union Find with Path Compression
**Time Complexity:** O(α(n)) amortized

```kotlin
class UnionFind(n: Int) {
    private val parent = IntArray(n) { it }
    private val rank = IntArray(n) { 0 }
    
    fun find(x: Int): Int {
        if (parent[x] != x) {
            parent[x] = find(parent[x]) // Path compression
        }
        return parent[x]
    }
    
    fun union(x: Int, y: Int): Boolean {
        val rootX = find(x)
        val rootY = find(y)
        
        if (rootX == rootY) return false
        
        // Union by rank
        when {
            rank[rootX] < rank[rootY] -> parent[rootX] = rootY
            rank[rootX] > rank[rootY] -> parent[rootY] = rootX
            else -> {
                parent[rootY] = rootX
                rank[rootX]++
            }
        }
        return true
    }
    
    fun connected(x: Int, y: Int): Boolean {
        return find(x) == find(y)
    }
}
```

---

## Summary

This collection provides optimized Kotlin implementations for the most common algorithmic patterns. Each algorithm is implemented with:

- **Optimal time and space complexity**
- **Kotlin-idiomatic code with null safety**
- **Clear, readable structure**
- **Production-ready implementations**

The patterns cover essential categories including arrays, strings, dynamic programming, graph algorithms, and advanced data structures. All implementations follow best practices and handle edge cases appropriately.

---



# LeetCode Algorithm Patterns & Templates - Kotlin

## 1. Arrays (5 Patterns)

### Pattern 1: Two Pointers
**Use when:** Finding pairs, palindromes, or working with sorted arrays
```kotlin
fun twoPointers(arr: IntArray): Int {
    var left = 0
    var right = arr.size - 1
    
    while (left < right) {
        when {
            conditionMet(arr[left], arr[right]) -> return result
            arr[left] + arr[right] < target -> left++
            else -> right--
        }
    }
    return -1
}

// Example: Two Sum II - Input array is sorted
fun twoSum(numbers: IntArray, target: Int): IntArray {
    var left = 0
    var right = numbers.size - 1
    
    while (left < right) {
        val sum = numbers[left] + numbers[right]
        when {
            sum == target -> return intArrayOf(left + 1, right + 1)
            sum < target -> left++
            else -> right--
        }
    }
    return intArrayOf()
}
```

### Pattern 2: Sliding Window
**Use when:** Subarray/substring problems with size constraints
```kotlin
fun slidingWindow(arr: IntArray, k: Int): Int {
    var windowStart = 0
    var maxSum = 0
    var windowSum = 0
    
    for (windowEnd in arr.indices) {
        windowSum += arr[windowEnd]
        
        if (windowEnd >= k - 1) {
            maxSum = maxOf(maxSum, windowSum)
            windowSum -= arr[windowStart]
            windowStart++
        }
    }
    return maxSum
}

// Variable size sliding window
fun lengthOfLongestSubstring(s: String): Int {
    val charSet = mutableSetOf<Char>()
    var left = 0
    var maxLength = 0
    
    for (right in s.indices) {
        while (s[right] in charSet) {
            charSet.remove(s[left])
            left++
        }
        charSet.add(s[right])
        maxLength = maxOf(maxLength, right - left + 1)
    }
    return maxLength
}
```

### Pattern 3: Fast & Slow Pointers
**Use when:** Cycle detection, finding middle element
```kotlin
fun fastSlowPointers(arr: IntArray): Boolean {
    var slow = 0
    var fast = 0
    
    while (fast < arr.size && arr[fast] != -1) {
        slow = arr[slow]
        fast = arr[arr[fast]]
        if (slow == fast) return true // Cycle found
    }
    return false
}

// Find middle of linked list
fun findMiddle(head: ListNode?): ListNode? {
    var slow = head
    var fast = head
    
    while (fast?.next != null) {
        slow = slow?.next
        fast = fast.next?.next
    }
    return slow
}
```

### Pattern 4: Merge Intervals
**Use when:** Overlapping intervals, scheduling problems
```kotlin
fun merge(intervals: Array<IntArray>): Array<IntArray> {
    if (intervals.isEmpty()) return arrayOf()
    
    intervals.sortBy { it[0] }
    val merged = mutableListOf<IntArray>()
    merged.add(intervals[0])
    
    for (i in 1 until intervals.size) {
        val current = intervals[i]
        val last = merged.last()
        
        if (current[0] <= last[1]) {
            last[1] = maxOf(last[1], current[1])
        } else {
            merged.add(current)
        }
    }
    return merged.toTypedArray()
}
```

### Pattern 5: Cyclic Sort
**Use when:** Array contains numbers in range [1, n]
```kotlin
fun cyclicSort(nums: IntArray) {
    var i = 0
    while (i < nums.size) {
        val j = nums[i] - 1
        if (nums[i] != nums[j]) {
            val temp = nums[i]
            nums[i] = nums[j]
            nums[j] = temp
        } else {
            i++
        }
    }
}

// Find missing number
fun findMissingNumber(nums: IntArray): Int {
    var i = 0
    while (i < nums.size) {
        if (nums[i] < nums.size && nums[i] != nums[nums[i]]) {
            val temp = nums[i]
            nums[i] = nums[nums[i]]
            nums[temp] = temp
        } else {
            i++
        }
    }
    
    for (j in nums.indices) {
        if (nums[j] != j) return j
    }
    return nums.size
}
```

## 2. Trees (6 Patterns)

### Pattern 1: Tree Traversal (DFS)
```kotlin
class TreeNode(var `val`: Int) {
    var left: TreeNode? = null
    var right: TreeNode? = null
}

fun preorderTraversal(root: TreeNode?): List<Int> {
    val result = mutableListOf<Int>()
    
    fun dfs(node: TreeNode?) {
        if (node == null) return
        result.add(node.`val`) // Process current
        dfs(node.left)
        dfs(node.right)
    }
    
    dfs(root)
    return result
}

fun inorderTraversal(root: TreeNode?): List<Int> {
    val result = mutableListOf<Int>()
    
    fun dfs(node: TreeNode?) {
        if (node == null) return
        dfs(node.left)
        result.add(node.`val`) // Process current
        dfs(node.right)
    }
    
    dfs(root)
    return result
}
```

### Pattern 2: Tree Traversal (BFS)
```kotlin
import java.util.*

fun levelOrder(root: TreeNode?): List<List<Int>> {
    if (root == null) return emptyList()
    
    val result = mutableListOf<List<Int>>()
    val queue: Queue<TreeNode> = LinkedList()
    queue.offer(root)
    
    while (queue.isNotEmpty()) {
        val levelSize = queue.size
        val currentLevel = mutableListOf<Int>()
        
        repeat(levelSize) {
            val node = queue.poll()
            currentLevel.add(node.`val`)
            
            node.left?.let { queue.offer(it) }
            node.right?.let { queue.offer(it) }
        }
        result.add(currentLevel)
    }
    return result
}
```

### Pattern 3: Tree Path Sum
```kotlin
fun hasPathSum(root: TreeNode?, targetSum: Int): Boolean {
    if (root == null) return false
    
    if (root.left == null && root.right == null) {
        return root.`val` == targetSum
    }
    
    return hasPathSum(root.left, targetSum - root.`val`) || 
           hasPathSum(root.right, targetSum - root.`val`)
}

// All root-to-leaf paths with target sum
fun pathSum(root: TreeNode?, targetSum: Int): List<List<Int>> {
    val result = mutableListOf<List<Int>>()
    
    fun dfs(node: TreeNode?, target: Int, path: MutableList<Int>) {
        if (node == null) return
        
        path.add(node.`val`)
        
        if (node.left == null && node.right == null && node.`val` == target) {
            result.add(ArrayList(path))
        } else {
            dfs(node.left, target - node.`val`, path)
            dfs(node.right, target - node.`val`, path)
        }
        
        path.removeAt(path.size - 1) // Backtrack
    }
    
    dfs(root, targetSum, mutableListOf())
    return result
}
```

### Pattern 4: Tree Diameter/Height
```kotlin
fun diameterOfBinaryTree(root: TreeNode?): Int {
    var diameter = 0
    
    fun dfs(node: TreeNode?): Int {
        if (node == null) return 0
        
        val leftHeight = dfs(node.left)
        val rightHeight = dfs(node.right)
        
        diameter = maxOf(diameter, leftHeight + rightHeight)
        
        return maxOf(leftHeight, rightHeight) + 1
    }
    
    dfs(root)
    return diameter
}

fun maxDepth(root: TreeNode?): Int {
    if (root == null) return 0
    return maxOf(maxDepth(root.left), maxDepth(root.right)) + 1
}
```

### Pattern 5: Lowest Common Ancestor
```kotlin
fun lowestCommonAncestor(root: TreeNode?, p: TreeNode?, q: TreeNode?): TreeNode? {
    if (root == null || root == p || root == q) return root
    
    val left = lowestCommonAncestor(root.left, p, q)
    val right = lowestCommonAncestor(root.right, p, q)
    
    return when {
        left != null && right != null -> root
        else -> left ?: right
    }
}

fun lowestCommonAncestorV2(root: TreeNode?, p: TreeNode?, q: TreeNode?): TreeNode? {
    var curr = root

    while(curr != null) {
        when {
            p.'val' > curr.'val' && q.'val' > curr.'val' -> {
                curr = curr.right
            }

            p.'val' < curr.'val' && q.'val' < curr.'val' -> {
                curr = curr.left
            }

            else -> return curr
        }
    }
}
```

### Pattern 6: Serialize/Deserialize
```kotlin
class Codec {
    fun serialize(root: TreeNode?): String {
        val result = mutableListOf<String>()
        
        fun dfs(node: TreeNode?) {
            if (node == null) {
                result.add("null")
            } else {
                result.add(node.`val`.toString())
                dfs(node.left)
                dfs(node.right)
            }
        }
        
        dfs(root)
        return result.joinToString(",")
    }
    
    fun deserialize(data: String): TreeNode? {
        val nodes = data.split(",").toMutableList()
        
        fun dfs(): TreeNode? {
            val value = nodes.removeAt(0)
            if (value == "null") return null
            
            val node = TreeNode(value.toInt())
            node.left = dfs()
            node.right = dfs()
            return node
        }
        
        return dfs()
    }
}
```

## 3. Heaps (2 Patterns)

### Pattern 1: Top K Elements
```kotlin
import java.util.*

fun findKLargest(nums: IntArray, k: Int): IntArray {
    val minHeap = PriorityQueue<Int>()
    
    for (num in nums) {
        minHeap.offer(num)
        if (minHeap.size > k) {
            minHeap.poll()
        }
    }
    
    return minHeap.toIntArray()
}

fun topKFrequent(nums: IntArray, k: Int): IntArray {
    val frequencyMap = mutableMapOf<Int, Int>()
    for (num in nums) {
        frequencyMap[num] = frequencyMap.getOrDefault(num, 0) + 1
    }
    
    val minHeap = PriorityQueue<Pair<Int, Int>>(compareBy { it.second })
    
    for ((num, freq) in frequencyMap) {
        minHeap.offer(Pair(num, freq))
        if (minHeap.size > k) {
            minHeap.poll()
        }
    }
    
    return minHeap.map { it.first }.toIntArray()
}
```

### Pattern 2: Two Heaps (Median)
```kotlin
class MedianFinder {
    private val maxHeap = PriorityQueue<Int>(reverseOrder()) // Left half
    private val minHeap = PriorityQueue<Int>() // Right half
    
    fun addNum(num: Int) {
        if (maxHeap.isEmpty() || num <= maxHeap.peek()) {
            maxHeap.offer(num)
        } else {
            minHeap.offer(num)
        }
        
        // Balance heaps
        when {
            maxHeap.size > minHeap.size + 1 -> {
                minHeap.offer(maxHeap.poll())
            }
            minHeap.size > maxHeap.size -> {
                maxHeap.offer(minHeap.poll())
            }
        }
    }
    
    fun findMedian(): Double {
        return when {
            maxHeap.size > minHeap.size -> maxHeap.peek().toDouble()
            else -> (maxHeap.peek() + minHeap.peek()) / 2.0
        }
    }
}
```

## 4. Graphs (7 Patterns)

### Pattern 1: DFS Traversal
```kotlin
fun dfs(graph: Map<Int, List<Int>>, start: Int, visited: MutableSet<Int> = mutableSetOf()) {
    visited.add(start)
    
    for (neighbor in graph[start] ?: emptyList()) {
        if (neighbor !in visited) {
            dfs(graph, neighbor, visited)
        }
    }
}

// Number of connected components
fun countComponents(n: Int, edges: Array<IntArray>): Int {
    val graph = mutableMapOf<Int, MutableList<Int>>()
    
    // Build adjacency list
    for (i in 0 until n) {
        graph[i] = mutableListOf()
    }
    for ((u, v) in edges) {
        graph[u]!!.add(v)
        graph[v]!!.add(u)
    }
    
    val visited = mutableSetOf<Int>()
    var components = 0
    
    for (i in 0 until n) {
        if (i !in visited) {
            dfs(graph, i, visited)
            components++
        }
    }
    return components
}
```

### Pattern 2: BFS Traversal
```kotlin
import java.util.*

fun bfs(graph: Map<Int, List<Int>>, start: Int): List<Int> {
    val visited = mutableSetOf<Int>()
    val queue: Queue<Int> = LinkedList()
    val result = mutableListOf<Int>()
    
    queue.offer(start)
    visited.add(start)
    
    while (queue.isNotEmpty()) {
        val vertex = queue.poll()
        result.add(vertex)
        
        for (neighbor in graph[vertex] ?: emptyList()) {
            if (neighbor !in visited) {
                visited.add(neighbor)
                queue.offer(neighbor)
            }
        }
    }
    return result
}
```

### Pattern 3: Union Find
```kotlin
class UnionFind(n: Int) {
    private val parent = IntArray(n) { it }
    private val rank = IntArray(n)
    
    fun find(x: Int): Int {
        if (parent[x] != x) {
            parent[x] = find(parent[x]) // Path compression
        }
        return parent[x]
    }
    
    fun union(x: Int, y: Int): Boolean {
        val rootX = find(x)
        val rootY = find(y)
        
        if (rootX == rootY) return false
        
        // Union by rank
        when {
            rank[rootX] < rank[rootY] -> parent[rootX] = rootY
            rank[rootX] > rank[rootY] -> parent[rootY] = rootX
            else -> {
                parent[rootY] = rootX
                rank[rootX]++
            }
        }
        return true
    }
}

// Number of islands using Union-Find
fun numIslands(grid: Array<CharArray>): Int {
    if (grid.isEmpty()) return 0
    
    val m = grid.size
    val n = grid[0].size
    val uf = UnionFind(m * n)
    var islands = 0
    
    for (i in 0 until m) {
        for (j in 0 until n) {
            if (grid[i][j] == '1') {
                islands++
                val directions = arrayOf(intArrayOf(0, 1), intArrayOf(1, 0), intArrayOf(0, -1), intArrayOf(-1, 0))
                
                for ((di, dj) in directions) {
                    val ni = i + di
                    val nj = j + dj
                    if (ni in 0 until m && nj in 0 until n && grid[ni][nj] == '1') {
                        if (uf.union(i * n + j, ni * n + nj)) {
                            islands--
                        }
                    }
                }
            }
        }
    }
    return islands
}
```

### Pattern 4: Topological Sort
```kotlin
fun findOrder(numCourses: Int, prerequisites: Array<IntArray>): IntArray {
    val graph = mutableMapOf<Int, MutableList<Int>>()
    val inDegree = IntArray(numCourses)
    
    // Initialize graph
    for (i in 0 until numCourses) {
        graph[i] = mutableListOf()
    }
    
    // Build graph and calculate in-degrees
    for ((course, prereq) in prerequisites) {
        graph[prereq]!!.add(course)
        inDegree[course]++
    }
    
    val queue: Queue<Int> = LinkedList()
    for (i in 0 until numCourses) {
        if (inDegree[i] == 0) {
            queue.offer(i)
        }
    }
    
    val result = mutableListOf<Int>()
    
    while (queue.isNotEmpty()) {
        val course = queue.poll()
        result.add(course)
        
        for (nextCourse in graph[course]!!) {
            inDegree[nextCourse]--
            if (inDegree[nextCourse] == 0) {
                queue.offer(nextCourse)
            }
        }
    }
    
    return if (result.size == numCourses) result.toIntArray() else intArrayOf()
}
```

### Pattern 5: Dijkstra's Algorithm
```kotlin
import java.util.*

fun dijkstra(graph: Map<Int, List<Pair<Int, Int>>>, start: Int): Map<Int, Int> {
    val distances = mutableMapOf<Int, Int>()
    val pq = PriorityQueue<Pair<Int, Int>>(compareBy { it.first }) // (distance, node)
    
    for (node in graph.keys) {
        distances[node] = Int.MAX_VALUE
    }
    distances[start] = 0
    pq.offer(Pair(0, start))
    
    while (pq.isNotEmpty()) {
        val (currentDist, current) = pq.poll()
        
        if (currentDist > distances[current]!!) continue
        
        for ((neighbor, weight) in graph[current] ?: emptyList()) {
            val distance = currentDist + weight
            if (distance < distances[neighbor]!!) {
                distances[neighbor] = distance
                pq.offer(Pair(distance, neighbor))
            }
        }
    }
    
    return distances
}
```

### Pattern 6: Cycle Detection
```kotlin
fun hasCycle(graph: Map<Int, List<Int>>): Boolean {
    val WHITE = 0
    val GRAY = 1
    val BLACK = 2
    val color = mutableMapOf<Int, Int>()
    
    for (node in graph.keys) {
        color[node] = WHITE
    }
    
    fun dfs(node: Int): Boolean {
        if (color[node] == GRAY) return true // Back edge found
        if (color[node] == BLACK) return false
        
        color[node] = GRAY
        for (neighbor in graph[node] ?: emptyList()) {
            if (dfs(neighbor)) return true
        }
        color[node] = BLACK
        return false
    }
    
    for (node in graph.keys) {
        if (color[node] == WHITE && dfs(node)) {
            return true
        }
    }
    return false
}
```

### Pattern 7: Matrix Traversal
```kotlin
fun numIslands(grid: Array<CharArray>): Int {
    if (grid.isEmpty()) return 0
    
    val m = grid.size
    val n = grid[0].size
    var islands = 0
    
    fun dfs(i: Int, j: Int) {
        if (i < 0 || i >= m || j < 0 || j >= n || grid[i][j] == '0') return
        
        grid[i][j] = '0' // Mark as visited
        
        // Visit all 4 directions
        dfs(i + 1, j)
        dfs(i - 1, j)
        dfs(i, j + 1)
        dfs(i, j - 1)
    }
    
    for (i in 0 until m) {
        for (j in 0 until n) {
            if (grid[i][j] == '1') {
                islands++
                dfs(i, j)
            }
        }
    }
    
    return islands
}
```

## 5. Strings (4 Patterns)

### Pattern 1: Sliding Window
```kotlin
fun lengthOfLongestSubstringKDistinct(s: String, k: Int): Int {
    var windowStart = 0
    var maxLength = 0
    val charFrequency = mutableMapOf<Char, Int>()
    
    for (windowEnd in s.indices) {
        val rightChar = s[windowEnd]
        charFrequency[rightChar] = charFrequency.getOrDefault(rightChar, 0) + 1
        
        while (charFrequency.size > k) {
            val leftChar = s[windowStart]
            charFrequency[leftChar] = charFrequency[leftChar]!! - 1
            if (charFrequency[leftChar] == 0) {
                charFrequency.remove(leftChar)
            }
            windowStart++
        }
        
        maxLength = maxOf(maxLength, windowEnd - windowStart + 1)
    }
    
    return maxLength
}

fun characterReplacement(s: String, k: Int): Int {
    var windowStart = 0
    var maxLength = 0
    var maxRepeatLetterCount = 0
    val letterCounts = mutableMapOf<Char, Int>()
    
    for (windowEnd in s.indices) {
        val rightChar = s[windowEnd]
        letterCounts[rightChar] = letterCounts.getOrDefault(rightChar, 0) + 1
        maxRepeatLetterCount = maxOf(maxRepeatLetterCount, letterCounts[rightChar]!!)
        
        if (windowEnd - windowStart + 1 - maxRepeatLetterCount > k) {
            val leftChar = s[windowStart]
            letterCounts[leftChar] = letterCounts[leftChar]!! - 1
            windowStart++
        }
        
        maxLength = maxOf(maxLength, windowEnd - windowStart + 1)
    }
    
    return maxLength
}
```

### Pattern 2: Two Pointers
```kotlin
fun isPalindrome(s: String): Boolean {
    var left = 0
    var right = s.length - 1
    
    while (left < right) {
        while (left < right && !s[left].isLetterOrDigit()) left++
        while (left < right && !s[right].isLetterOrDigit()) right--
        
        if (s[left].lowercaseChar() != s[right].lowercaseChar()) {
            return false
        }
        left++
        right--
    }
    return true
}

fun reverseWords(s: String): String {
    val words = s.trim().split("\\s+".toRegex())
    return words.reversed().joinToString(" ")
}
```

### Pattern 3: String Matching (KMP)
```kotlin
fun strStr(haystack: String, needle: String): Int {
    if (needle.isEmpty()) return 0
    
    fun computeLPS(pattern: String): IntArray {
        val lps = IntArray(pattern.length)
        var length = 0
        var i = 1
        
        while (i < pattern.length) {
            if (pattern[i] == pattern[length]) {
                length++
                lps[i] = length
                i++
            } else {
                if (length != 0) {
                    length = lps[length - 1]
                } else {
                    lps[i] = 0
                    i++
                }
            }
        }
        return lps
    }
    
    val lps = computeLPS(needle)
    var i = 0 // haystack index
    var j = 0 // needle index
    
    while (i < haystack.length) {
        if (haystack[i] == needle[j]) {
            i++
            j++
        }
        
        if (j == needle.length) {
            return i - j
        } else if (i < haystack.length && haystack[i] != needle[j]) {
            if (j != 0) {
                j = lps[j - 1]
            } else {
                i++
            }
        }
    }
    return -1
}
```

### Pattern 4: Anagram/Hash Map
```kotlin
fun groupAnagrams(strs: Array<String>): List<List<String>> {
    val anagramGroups = mutableMapOf<String, MutableList<String>>()
    
    for (str in strs) {
        val key = str.toCharArray().sorted().joinToString("")
        anagramGroups.computeIfAbsent(key) { mutableListOf() }.add(str)
    }
    
    return anagramGroups.values.toList()
}

fun isAnagram(s: String, t: String): Boolean {
    if (s.length != t.length) return false
    
    val charCount = IntArray(26)
    
    for (i in s.indices) {
        charCount[s[i] - 'a']++
        charCount[t[i] - 'a']--
    }
    
    return charCount.all { it == 0 }
}
```

## 6. Intervals (2 Patterns)

### Pattern 1: Merge Intervals
```kotlin
fun merge(intervals: Array<IntArray>): Array<IntArray> {
    if (intervals.isEmpty()) return arrayOf()
    
    intervals.sortBy { it[0] }
    val merged = mutableListOf<IntArray>()
    merged.add(intervals[0])
    
    for (i in 1 until intervals.size) {
        val current = intervals[i]
        val last = merged.last()
        
        if (current[0] <= last[1]) {
            last[1] = maxOf(last[1], current[1])
        } else {
            merged.add(current)
        }
    }
    
    return merged.toTypedArray()
}

fun insert(intervals: Array<IntArray>, newInterval: IntArray): Array<IntArray> {
    val result = mutableListOf<IntArray>()
    var i = 0
    
    // Add all intervals before newInterval
    while (i < intervals.size && intervals[i][1] < newInterval[0]) {
        result.add(intervals[i])
        i++
    }
    
    // Merge overlapping intervals
    while (i < intervals.size && intervals[i][0] <= newInterval[1]) {
        newInterval[0] = minOf(newInterval[0], intervals[i][0])
        newInterval[1] = maxOf(newInterval[1], intervals[i][1])
        i++
    }
    result.add(newInterval)
    
    // Add remaining intervals
    while (i < intervals.size) {
        result.add(intervals[i])
        i++
    }
    
    return result.toTypedArray()
}
```

### Pattern 2: Interval Intersection
```kotlin
fun intervalIntersection(firstList: Array<IntArray>, secondList: Array<IntArray>): Array<IntArray> {
    val result = mutableListOf<IntArray>()
    var i = 0
    var j = 0
    
    while (i < firstList.size && j < secondList.size) {
        val start = maxOf(firstList[i][0], secondList[j][0])
        val end = minOf(firstList[i][1], secondList[j][1])
        
        if (start <= end) {
            result.add(intArrayOf(start, end))
        }
        
        if (firstList[i][1] < secondList[j][1]) {
            i++
        } else {
            j++
        }
    }
    
    return result.toTypedArray()
}

fun eraseOverlapIntervals(intervals: Array<IntArray>): Int {
    if (intervals.isEmpty()) return 0
    
    intervals.sortBy { it[1] } // Sort by end time
    var count = 0
    var end = intervals[0][1]
    
    for (i in 1 until intervals.size) {
        if (intervals[i][0] < end) {
            count++ // Remove current interval
        } else {
            end = intervals[i][1]
        }
    }
    
    return count
}
```

## 7. Linked Lists (3 Patterns)

### Pattern 1: Two Pointers
```kotlin
class ListNode(var `val`: Int) {
    var next: ListNode? = null
}

fun findMiddle(head: ListNode?): ListNode? {
    var slow = head
    var fast = head
    
    while (fast?.next != null) {
        slow = slow?.next
        fast = fast.next?.next
    }
    return slow
}

fun hasCycle(head: ListNode?): Boolean {
    var slow = head
    var fast = head
    
    while (fast?.next != null) {
        slow = slow?.next
        fast = fast.next?.next
        if (slow == fast) return true
    }
    return false
}

fun detectCycle(head: ListNode?): ListNode? {
    var slow = head
    var fast = head
    
    // Detect cycle
    while (fast?.next != null) {
        slow = slow?.next
        fast = fast.next?.next
        if (slow == fast) break
    }
    
    if (fast?.next == null) return null
    
    // Find start of cycle
    slow = head
    while (slow != fast) {
        slow = slow?.next
        fast = fast?.next
    }
    
    return slow
}
```

### Pattern 2: Reverse Linked List
```kotlin
fun reverseList(head: ListNode?): ListNode? {
    var prev: ListNode? = null
    var current = head
    
    while (current != null) {
        val nextTemp = current.next
        current.next = prev
        prev = current
        current = nextTemp
    }
    
    return prev
}

fun reverseBetween(head: ListNode?, left: Int, right: Int): ListNode? {
    if (head == null || left == right) return head
    
    val dummy = ListNode
