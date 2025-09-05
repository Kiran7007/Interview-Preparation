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
