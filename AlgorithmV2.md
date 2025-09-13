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
