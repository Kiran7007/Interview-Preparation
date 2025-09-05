## Two Pointer
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

## Fixed Sliding Window
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

## Variable Size Sliding Window
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

## Prefix Sum
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

## KMP Algorithm
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

## Palindrom Check
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

// Longest Palindromic Substring
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

