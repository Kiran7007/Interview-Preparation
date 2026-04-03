# DSA: Arrays, Sorting & Searching (Senior)

---

### Question

Why is quicksort preferred over mergesort for sorting **arrays** in practice?

### Answer

- **Deep explanation:** Quicksort is in-place for arrays (partitioning swaps within the array) and has excellent cache behavior on contiguous memory. Mergesort needs \(O(n)\) auxiliary space for merging, which increases memory traffic and allocator pressure.
- **Internal working:** Quicksort chooses a pivot, partitions into `< pivot` and `> pivot`, recurses. Mergesort divides halves, merges sorted subarrays.
- **Trade-offs:** Quicksort worst-case \(O(n^2)\) with bad pivots (mitigated by randomized pivot / introsort). Mergesort is stable and worst-case \(O(n \log n)\) but pays extra space.
- **Real-world example:** Sorting a large list of UI metrics in-memory on device—quicksort variants (e.g., `Arrays.sort` for primitives) are typical; mergesort appears when stability matters or for linked structures.

### Code example

See `patterns.md` → sorting implementations (quicksort/mergesort) in `DSA_Patterns_Cheatsheet.md` section.

### Key takeaway

> Pick mergesort when **stability** or **predictable worst case** matters; pick quicksort when **in-place + arrays + throughput** matters.

---

### Question

Why is mergesort often preferred over quicksort for **linked lists**?

### Answer

- **Deep explanation:** Linked lists support \(O(1)\) insertion in the middle after you’ve found the split point; mergesort’s merge step can splice nodes without allocating a separate array buffer like array mergesort often does.
- **Internal working:** Merge two sorted lists by pointer rewiring; divide list via slow/fast pointers.
- **Trade-offs:** Quicksort on lists is less standard; mergesort is stable and \(O(n \log n)\) worst case with appropriate implementation.
- **Real-world example:** Merging sorted event streams in a custom in-memory timeline buffer.

### Code example

See `patterns.md` → linked list merge / reversal templates.

### Key takeaway

> **Structure matters:** array algorithms ≠ list algorithms even for the same Big-O class.

---

### Question

Why is binary search usually preferred over ternary search for interview + production arrays?

### Answer

- **Deep explanation:** Each ternary split reduces the range by a factor of 3 but performs **more comparisons per step** than binary (which splits by 2). Constants dominate for typical \(n\).
- **Internal working:** Binary search maintains `lo/hi`, compares mid once per iteration.
- **Trade-offs:** Ternary may appear in numeric unimodal function optimization on **continuous** domains—not the same as classic discrete array search.
- **Real-world example:** Searching sorted remote config keys locally after sync.

### Code example

See `patterns.md` → binary search & rotated array variants.

### Key takeaway

> **Fewer comparisons per elimination step** usually wins on arrays.

---

### Question

Explain Big-O, Big-Omega, and how you communicate complexity in interviews.

### Answer

- **Deep explanation:** Big-O is an upper bound on growth; Big-Omega is a lower bound; Big-Theta is tight bound when both match. Interviewers care about **worst-case** unless they specify amortized/average.
- **Internal working:** Count nested loops, recurrence relations (master theorem), or aggregate analysis for amortized (e.g., union-find).
- **Trade-offs:** Optimize the metric the product cares about: CPU vs memory vs IO.
- **Real-world example:** Replacing \(O(n^2)\) diffing in a RecyclerView adapter update with \(O(n)\) using proper diffing utilities.

### Useful links

- [Big O cheat sheet (time complexity chart)](https://www.freecodecamp.org/news/big-o-cheat-sheet-time-complexity-chart/)
- [Complexity table (image)](https://github.com/anitaa1990/Android-Cheat-sheet/blob/master/media/4.png)

### Key takeaway

> Always state **what \(n\) is** (users, items, pixels, graph nodes).

---

## Practice index — Arrays

These paths reference a `src/` exercise tree (add locally if needed):

- [Find Maximum Sell Profit](/src/arrays/FindMaximumSellProfit.java)
- [Find Low & High Index of a key from a given array](/src/arrays/LowHighIndex.java)
- [Merge Overlapping Intervals](/src/arrays/MergeOverlappingIntervals.java)
- [Move all zeros in an array to the Left or Right](/src/arrays/MoveZeroesToLeft.java)
- [Rotate an array](/src/arrays/RotateArray.java)
- [Find the smallest common number in a given array](/src/arrays/SmallestCommonNumber.java)
- [Find the sum of two elements in a given array](/src/arrays/SumOfTwoValues.java)
- [Find the minimum distance between two numbers in an array](/src/arrays/MinimumDistanceBetweenTwoNumbers.java)
- [Find the maximum difference (largest after smallest)](/src/arrays/FindMaxDifference.java)
- [Find second largest element](/src/arrays/FindSecondLargestElement.java)
- [Find the 3 numbers that produce the max product](/src/arrays/FindMaxProduct.java)
- [Find missing number from an array](/src/arrays/FindMissingNumber.java)

### Sorting implementations in repo (`Data_Structure_Algorithm.md`)

- [BubbleSort](/src/sort/BubbleSort.java)
- [InsertionSort](/src/sort/InsertionSort.java)
- [SelectionSort](/src/sort/SelectionSort.java)
- [QuickSort](/src/sort/QuickSort.java)
- [MergeSort](/src/sort/MergeSort.java)
- [Count Sort (Kotlin article)](https://www.includehelp.com/kotlin/sorting-in-linear-time-and-program-for-count-sort.aspx)
- [Shell Sort](https://www.tutorialspoint.com/data_structures_algorithms/shell_sort_algorithm.htm)

### Searching in repo

- [Binary Search](/src/search/BinarySearch.java)
- [Rotated Binary Search](/src/search/RotatedBinarySearch.java)
- [Ternary Search](/src/search/TernarySearch.java)

### Additional links

- https://www.tutorialspoint.com/data_structures_algorithms/shell_sort_algorithm.htm  
- https://www.geeksforgeeks.org/learn-data-structures-and-algorithms-dsa-tutorial/  
- https://amitshekhar.me/blog/android-developer-should-know-these-data-structures-for-next-interview  
- https://afteracademy.com/tech-interview/ds-algo-concepts/  
- https://afteracademy.com/blogs/  
- https://www.linkedin.com/feed/update/urn:li:activity:7211903578356035584/

---

### Question (FAANG-style follow-up)

How do you choose between **prefix sums**, **difference array**, and **sliding window** for range queries on arrays?

### Answer

- **Prefix sums:** Static array, many `sum(l..r)` queries after \(O(n)\) preprocess.
- **Difference array:** Many range increments then finalize with prefix sum (scheduling, offline updates).
- **Sliding window:** Optimization over contiguous subarrays with monotonicity / bounded constraints.
- **Trade-offs:** Mutability + query mix determines structure; don’t pay \(O(n)\) per query if queries are hot.
- **Real-world example:** Analytics histogram buckets for session lengths (window), or precomputing cumulative spend for fraud rules (prefix).

### Key takeaway

> **Query vs update pattern** picks the tool.
