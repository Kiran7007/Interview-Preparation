# DSA: Graphs (Senior)

> **Full templates:** See [`patterns.md`](./patterns.md) for DFS/BFS, Union-Find, topological sort, Dijkstra, matrix traversal (`numIslands`), cycle detection (directed), and more (from `AlgorithmV2.md` + `Algorithms.md`).

---

### Question

How do you represent a graph for mobile interview problems—**adjacency list vs matrix**—and when does either fail?

### Answer

- **Deep explanation:** Adjacency list is default for sparse graphs (\(|E| \ll |V|^2\)); matrix helps dense graphs or grid problems where neighbors are implicit.
- **Internal working:** List: `Map<Int, List<Neighbor>>`; matrix: `grid[i][j]` with 4-neighbor DFS/BFS.
- **Trade-offs:** Matrix flood-fill mutates input unless you copy—clarify in interviews. List representation saves memory for social/dependency graphs.
- **Real-world example:** Module dependency graph for feature flags (list) vs image region labeling (grid DFS).

### Code Example (if applicable)

See `patterns.md` → `countComponents`, `bfs`, `dfs`, `numIslands` (matrix), `UnionFind`, `dijkstra`, topological sort.

### Key Takeaway

**Sparsity + API** → adjacency list; **2D spatial** → grid traversal.

---

### Question

Explain **Union-Find** and a production pitfall you’d call out in a staff review.

### Answer

- **Deep explanation:** Disjoint-set structure supports near-constant-time `union`/`find` with path compression + union by rank/size.
- **Internal working:** Parent array + rank; find compresses paths; union attaches smaller tree under larger root.
- **Trade-offs:** Doesn’t naturally give shortest path lengths unless weights are trivial; offline dynamic connectivity only.
- **Real-world example:** Kruskal MST, percolation, grouping equivalent identifiers in analytics pipelines.

### Key Takeaway

Always mention **path compression** + **union by rank**—interviewers listen for both.

---

### Question (FAANG-level)

Compare **Dijkstra**, **Bellman-Ford**, and **0-1 BFS** in one minute.

### Answer

- **Dijkstra:** Non-negative edges; greedy with PQ; \(O(E \log V)\) typical.
- **Bellman-Ford:** Handles negative edges (no negative cycles); \(O(VE)\); used when negatives exist or for SPFA variants in contests.
- **0-1 BFS:** Edge weights in `{0,1}`; deque trick \(O(V+E)\).
- **Real-world example:** Latency-cost routing with non-negative weights (maps); risk-adjusted edges with negatives might need Bellman-Ford (rare in Android interviews).

### Useful links (from `Leetcode.md` graph topic lists)

- [Graphs — curated problem list](https://lnkd.in/gcHRz5-p)
- [Dijkstra — curated list](https://lnkd.in/gRsxH7Th)
- [Bellman Ford — curated list](https://lnkd.in/gBN54_mc)
- [Floyd Warshall — curated list](https://lnkd.in/g6zvRYbb)
- [Topological sort — curated list](https://lnkd.in/gBaaZCbM)
- [Bridges / articulation points — curated list](https://lnkd.in/gRpJ6qxN)

### Key Takeaway

**Negative weights** changes the algorithm family completely.

---

## Repository practice index — Graphs (from `Android.md`)

- [Clone a Directed Graph](/src/graphs/CloneDirectedGraph.java)
- [Minimum Spanning Tree](/src/graphs/MinimumSpanningTree.java)
- [Circular chain from list of words](/src/graphs/WordChaining.java)
