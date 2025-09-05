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


