# DSA: Trees & Heaps (Senior)

---

### Question

When do you use **DFS vs BFS** on trees, and what breaks if you pick the wrong one?

### Answer

- **In plain words:** DFS (pre/in/post-order) is natural for path problems, recursion structure, and many BST invariants. BFS (level-order) is natural for shortest path on **unweighted** tree edges, level-by-level aggregation, and width computations.
- **How it works:** DFS uses call stack or explicit stack; BFS uses queue.
- **What to watch for:** DFS depth can overflow stack on degenerate trees—iterate with explicit stack if needed. BFS uses \(O(w)\) memory where \(w\) is max width.
- **Example:** Computing UI tree depth for accessibility vs computing minimum taps to reach a node in a shallow navigation tree.

### Code example

See `patterns.md` → `levelOrder`, `maxDepth`, `isBalanced`, `lowestCommonAncestor`, `Codec serialize/deserialize`.

### Key takeaway

> **Path + structure** → DFS; **level / shortest steps** → BFS.

---

### Question

How do you validate a **BST** in an interview without carrying buggy global state?

### Answer

- **In plain words:** A BST requires all left subtree values `< node < all right subtree values (for strict definitions) — implement via valid `(min, max)` bounds per node, not only comparing immediate children.
- **How it works:** DFS with narrowing bounds; or inorder traversal must be strictly increasing for unique BST with no duplicates.
- **What to watch for:** Inorder check needs \(O(h)\) stack space; bounds DFS is usually clearest.
- **Example:** Validating a deserialized config tree where children carry numeric thresholds.

### Code example

See `patterns.md` → BST patterns / `isBST` references in repository tree exercises.

### Key takeaway

> **Global “previous node”** inorder works, but **bounded DFS** is easier to explain under pressure.

---

### Question (FAANG-level)

Explain how you’d implement **persistent immutable tree updates** (copy-on-write) for undo/redo in an editor-like UI model.

### Answer

- **In plain words:** Path copying updates only nodes along the path from root to changed leaf; unchanged subtrees are shared (structural sharing), giving \(O(h)\) time and small extra memory per operation.
- **How it works:** Clone nodes along the path; reuse old child pointers for untouched branches.
- **What to watch for:** More complex than mutable trees; great for concurrency + undo stacks.
- **Example:** Compose-like state snapshots or collaborative outline trees.

### Key takeaway

> Immutability + sharing beats deep-cloning entire trees.

---

## Practice index — Trees

- [InOrder Iterator on a Binary Tree](/src/trees/BinaryTreeIterator.java)
- [Convert binary tree to doubly linked list](/src/trees/BinaryTreeToLinkedList.java)
- [Connect sibling pointer to next node in same level](/src/trees/ConnectAllSiblings.java)
- [Connect siblings at each level](/src/trees/ConnectSiblings.java)
- [Delete subtrees whose nodes sum to zero](/src/trees/DeleteZeroSumSubTrees.java)
- [Identical binary trees](/src/trees/IdenticalBinaryTree.java)
- [Inorder successor in BST](/src/trees/InOrderSuccessor.java)
- [Inorder traversal](/src/trees/InOrderTraversal.java)
- [Is BST](/src/trees/IsBST.java)
- [Level order traversal](/src/trees/LevelOrderTraversal.java)
- [Mirror binary tree nodes](/src/trees/MirrorBinaryTreeNodes.java)
- [Nth highest node in BST](/src/trees/NthHighestBST.java)
- [Print BST perimeter](/src/trees/PrintTreePerimeter.java)
- [Serialize / deserialize binary tree](/src/trees/SerializeBinaryTree.java)

### Useful links

- [Minimum Spanning Tree exercise](/src/graphs/MinimumSpanningTree.java) *(also graph-family; kept for cross-link)*
