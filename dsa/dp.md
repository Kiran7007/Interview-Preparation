# DSA: Dynamic Programming & Backtracking (Senior)

> **Templates:** See [`patterns.md`](./patterns.md) for knapsack-family, interval DP, LIS, string DP, and backtracking templates from `AlgorithmV2.md` + `DSA_Patterns_Cheatsheet.md`.

---

### Question

How do you decide between **top-down memoization** vs **bottom-up DP** in interviews?

### Answer

- **Deep explanation:** Same math, different engineering. Top-down mirrors recursive structure + pruning; bottom-up often gives tighter constant factors and easier space rolling.
- **Internal working:** Memoization stores `dp[state]` on first visit; tabulation fills in topological order of states.
- **Trade-offs:** Top-down can skip unreachable states; bottom-up can be \(O(1)\) space for many 1D recurrences.
- **Real-world example:** Computing minimal edit distance for offline subtitle corrections (string DP); feature rollout combinatorics with constraints (bounded knapsack style).

### Code Example (if applicable)

See `patterns.md` → DP sections in `DSA_Patterns_Cheatsheet.md` + `AlgorithmV2.md` (intervals, strings, LIS, etc.).

### Key Takeaway

State = **`(index, constraint, parity, …)`** — define it explicitly first.

---

### Question

What’s the difference between **backtracking** and **DP**—when can you not memoize?

### Answer

- **Deep explanation:** Backtracking explores combinatorial choices; DP applies when subproblems **overlap** and optimal substructure holds. Pure permutation generation often doesn’t benefit from memo without extra state.
- **Internal working:** Backtracking = DFS + prune; DP adds memo/table when repeated substates appear.
- **Trade-offs:** DP memory vs time; backtracking can explode if pruning is weak.
- **Real-world example:** Sudoku/CSP-style search vs counting distinct paths in a grid with obstacles.

### Key Takeaway

If your state repeats, **memoize**; if not, **prune hard**.

---

## Repository practice index — Dynamic Programming (from `Android.md`)

- [Fibonacci Series](/src/dynamicprogramming/FibonacciSeries.java)
- [Largest sum contiguous subarray](/src/dynamicprogramming/LargestSumSubarray.java)
- [Max sum subsequence with no adjacent elements](/src/dynamicprogramming/MaxSumSubsequenceOfNonadjacentElements.java)
- [Game scoring ways](/src/dynamicprogramming/GameScoring.java)
- [Levenshtein distance](/src/dynamicprogramming/LevenshteinDistance.java)
- [Coin change — number of ways](/src/dynamicprogramming/CoinChangingProblem.java)

## Repository practice index — Backtracking (from `Android.md`)

- [Solve Boggle](/src/backtracks/Boggle.java)
- [Parenthesis combinations](/src/backtracks/Parenthesis.java)
- [N Queen problem](/src/backtracks/NQueenProblem.java)
- [K-sum subsets](/src/backtracks/KSumSubsets.java)

### Useful links

- [LeetCode roadmap — Dynamic Programming (45 problems)](https://lnkd.in/gHYgRDSZ)
- [LeetCode roadmap — Backtracking (17 problems)](https://lnkd.in/gersVnrz)
