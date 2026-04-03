# DSA: Dynamic Programming & Backtracking (Senior)

---

### Question

How do you decide between **top-down memoization** vs **bottom-up DP** in interviews?

### Answer

- **In plain words:** Same math, different engineering. Top-down mirrors recursive structure + pruning; bottom-up often gives tighter constant factors and easier space rolling.
- **How it works:** Memoization stores `dp[state]` on first visit; tabulation fills in topological order of states.
- **What to watch for:** Top-down can skip unreachable states; bottom-up can be \(O(1)\) space for many 1D recurrences.
- **Example:** Computing minimal edit distance for offline subtitle corrections (string DP); feature rollout combinatorics with constraints (bounded knapsack style).

### Code example

See `patterns.md` → DP sections in `DSA_Patterns_Cheatsheet.md` + `AlgorithmV2.md` (intervals, strings, LIS, etc.).

### Key takeaway

> State = **`(index, constraint, parity, …)`** — define it explicitly first.

---

### Question

What’s the difference between **backtracking** and **DP**—when can you not memoize?

### Answer

- **In plain words:** Backtracking explores combinatorial choices; DP applies when subproblems **overlap** and optimal substructure holds. Pure permutation generation often doesn’t benefit from memo without extra state.
- **How it works:** Backtracking = DFS + prune; DP adds memo/table when repeated substates appear.
- **What to watch for:** DP memory vs time; backtracking can explode if pruning is weak.
- **Example:** Sudoku/CSP-style search vs counting distinct paths in a grid with obstacles.

### Key takeaway

> If your state repeats, **memoize**; if not, **prune hard**.

---

## Practice index — Dynamic Programming

- [Fibonacci Series](/src/dynamicprogramming/FibonacciSeries.java)
- [Largest sum contiguous subarray](/src/dynamicprogramming/LargestSumSubarray.java)
- [Max sum subsequence with no adjacent elements](/src/dynamicprogramming/MaxSumSubsequenceOfNonadjacentElements.java)
- [Game scoring ways](/src/dynamicprogramming/GameScoring.java)
- [Levenshtein distance](/src/dynamicprogramming/LevenshteinDistance.java)
- [Coin change — number of ways](/src/dynamicprogramming/CoinChangingProblem.java)

## Practice index — Backtracking

- [Solve Boggle](/src/backtracks/Boggle.java)
- [Parenthesis combinations](/src/backtracks/Parenthesis.java)
- [N Queen problem](/src/backtracks/NQueenProblem.java)
- [K-sum subsets](/src/backtracks/KSumSubsets.java)

### Useful links

- [LeetCode roadmap — Dynamic Programming (45 problems)](https://lnkd.in/gHYgRDSZ)
- [LeetCode roadmap — Backtracking (17 problems)](https://lnkd.in/gersVnrz)
