## KMP Algorithm

class Solution {
    fun strStr(haystack: String, needle: String): Int {
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
}
