# DSA: Graphs (Senior)

---

## How do you represent a graph for mobile interview problems—**adjacency list vs matrix**—and when does either fail?

- **In plain words:** Adjacency list is default for sparse graphs (\(|E| \ll |V|^2\)); matrix helps dense graphs or grid problems where neighbors are implicit.
- **How it works:** List: `Map<Int, List<Neighbor>>`; matrix: `grid[i][j]` with 4-neighbor DFS/BFS.
- **What to watch for:** Matrix flood-fill mutates input unless you copy—clarify in interviews. List representation saves memory for social/dependency graphs.
- **Example:** Module dependency graph for feature flags (list) vs image region labeling (grid DFS).

### Code example

See `patterns.md` → `countComponents`, `bfs`, `dfs`, `numIslands` (matrix), `UnionFind`, `dijkstra`, topological sort.


> **Sparsity + API** → adjacency list; **2D spatial** → grid traversal.

---

## Explain **Union-Find** and a production pitfall you’d call out in a staff review.

- **In plain words:** Disjoint-set structure supports near-constant-time `union`/`find` with path compression + union by rank/size.
- **How it works:** Parent array + rank; find compresses paths; union attaches smaller tree under larger root.
- **What to watch for:** Doesn’t naturally give shortest path lengths unless weights are trivial; offline dynamic connectivity only.
- **Example:** Kruskal MST, percolation, grouping equivalent identifiers in analytics pipelines.


> Always mention **path compression** + **union by rank**—interviewers listen for both.

---

## Compare **Dijkstra**, **Bellman-Ford**, and **0-1 BFS** in one minute.

- **Dijkstra:** Non-negative edges; greedy with PQ; \(O(E \log V)\) typical.
- **Bellman-Ford:** Handles negative edges (no negative cycles); \(O(VE)\); used when negatives exist or for SPFA variants in contests.
- **0-1 BFS:** Edge weights in `{0,1}`; deque trick \(O(V+E)\).
- **Example:** Latency-cost routing with non-negative weights (maps); risk-adjusted edges with negatives might need Bellman-Ford (rare in Android interviews).

### Useful links

- [Graphs — curated problem list](https://lnkd.in/gcHRz5-p)
- [Dijkstra — curated list](https://lnkd.in/gRsxH7Th)
- [Bellman Ford — curated list](https://lnkd.in/gBN54_mc)
- [Floyd Warshall — curated list](https://lnkd.in/g6zvRYbb)
- [Topological sort — curated list](https://lnkd.in/gBaaZCbM)
- [Bridges / articulation points — curated list](https://lnkd.in/gRpJ6qxN)


> **Negative weights** changes the algorithm family completely.

---

## Practice index — Graphs

- [Clone a Directed Graph](/src/graphs/CloneDirectedGraph.java)
- [Minimum Spanning Tree](/src/graphs/MinimumSpanningTree.java)
- [Circular chain from list of words](/src/graphs/WordChaining.java)
