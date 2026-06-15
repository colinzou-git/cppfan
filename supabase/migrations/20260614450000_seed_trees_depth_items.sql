-- Roadmap #74 / #114 (trees depth): learning items for iterative + level-order
-- traversal, tree reconstruction from traversals, and tree diameter.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'dsa.trees.traversal_techniques.lesson',
    'lesson',
    'Iterative and level-order traversal',
    'The three depth-first orders — preorder (node, left, right), inorder (left, node, right), postorder (left, right, node) — are most naturally written with recursion, where the call stack tracks where to resume. An iterative version makes that stack explicit: push nodes onto a std::stack and pop to visit, which avoids deep recursion overflowing the call stack on a skewed tree of height near n. A useful fact: an inorder traversal of a binary SEARCH tree visits keys in sorted order. Breadth-first / level-order traversal is different: it visits nodes level by level using a QUEUE — enqueue the root, then repeatedly dequeue a node, visit it, and enqueue its children. Recording the queue size before draining a level lets you process one level at a time, which answers per-level questions like depth, level sums, or zig-zag order. Rule of thumb: DFS orders (recursive or explicit-stack) for structural and subtree work; level-order (queue) for shortest-by-edges and per-level work.',
    'Pre/in/post-order are DFS, naturally recursive; an explicit std::stack makes the iteration non-recursive and avoids stack overflow on skewed trees. Inorder of a BST yields sorted keys. Level-order is BFS with a QUEUE, processing one level at a time — use it for depth and per-level questions.',
    'advanced',
    6,
    4770,
    true
  ),
  (
    'dsa.trees.traversal_techniques.mc_levelorder',
    'multiple_choice',
    'Driving a level-order traversal',
    'Which data structure drives a level-order (breadth-first) traversal of a binary tree?',
    'A queue: enqueue the root, then repeatedly dequeue a node, visit it, and enqueue its children — visiting nodes level by level. A stack would give a depth-first order instead.',
    'advanced',
    2,
    4780,
    true
  ),
  (
    'dsa.trees.traversal_reconstruction.lesson',
    'lesson',
    'Reconstructing a tree from traversals',
    'You can rebuild a unique binary tree from two traversals when one of them is INORDER. From preorder + inorder: the first element of preorder is the root; find that root in inorder — everything to its left is the left subtree, everything to its right is the right subtree; recurse on the two halves, using the left-subtree size to split the remaining preorder. Postorder + inorder works the same way, taking the root from the END of postorder. Inorder is required because it tells you where the split between left and right subtrees falls, which preorder or postorder alone cannot. In fact preorder + postorder do NOT determine a unique tree in general — a node with a single child is ambiguous, since you cannot tell whether that child is a left or right child. A BST gives more freedom: preorder (or postorder) alone reconstructs it, because the ordering property supplies the missing left/right split. When tracing by hand, keep a hash map from value to its inorder index so each root lookup is O(1).',
    'Inorder + (preorder or postorder) reconstructs a unique binary tree: take the root from the start of preorder (or end of postorder), split inorder at the root into left/right subtrees, recurse. Inorder supplies the left/right split. Preorder + postorder alone is NOT unique (single-child nodes are ambiguous). For a BST, preorder alone suffices.',
    'advanced',
    6,
    4790,
    true
  ),
  (
    'dsa.trees.traversal_reconstruction.mc_pair',
    'multiple_choice',
    'Which traversals fix a unique tree',
    'Which pair of traversals always reconstructs a UNIQUE binary tree?',
    'Preorder + inorder (equivalently postorder + inorder): inorder fixes where each root splits into left and right subtrees. Preorder + postorder alone is ambiguous for a node with a single child.',
    'advanced',
    2,
    4800,
    true
  ),
  (
    'dsa.trees.tree_diameter.lesson',
    'lesson',
    'Tree diameter and height-tracking DFS',
    'The diameter of a binary tree is the number of edges on the longest path between any two nodes; that path may or may not pass through the root. The efficient solution is a single post-order DFS that, for each node, returns its HEIGHT (edges down to the deepest leaf) while updating a running best diameter. At a node, the longest path that bends THROUGH it is leftHeight + rightHeight edges; compare that to the best seen so far, then return 1 + max(leftHeight, rightHeight) as this height to the parent. Because each node is visited once and does O(1) work, it is O(n) — far better than recomputing heights from every node (O(n^2)). The same pattern (return one value upward while separately updating a global answer that may combine both child results) solves related problems like maximum path sum and longest univalue path. Decide the edges-vs-nodes convention for the diameter up front, since some define it as a node count equal to edges + 1.',
    'Tree diameter = longest path (in edges) between two nodes, possibly not through the root. One post-order DFS returns each height and updates a global best = leftHeight + rightHeight at each node, returning 1 + max(left, right) upward. O(n), vs O(n^2) recomputing heights everywhere. Same return-one-value-track-a-global pattern as max path sum.',
    'advanced',
    6,
    4810,
    true
  ),
  (
    'dsa.trees.tree_diameter.mc_method',
    'multiple_choice',
    'Computing the diameter efficiently',
    'What is the efficient way to compute the diameter (longest path) of a binary tree?',
    'One post-order DFS: each call returns the height and updates a global best with leftHeight + rightHeight at that node. O(n). Recomputing height from every node is O(n^2); BFS levels give depth, not the longest bending path.',
    'advanced',
    2,
    4820,
    true
  )
on conflict (id) do update
set
  type = excluded.type,
  title = excluded.title,
  prompt = excluded.prompt,
  explanation = excluded.explanation,
  difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes,
  order_index = excluded.order_index,
  is_active = true,
  updated_at = now();

insert into public.learning_item_skills (learning_item_id, skill_id, is_primary)
values
  ('dsa.trees.traversal_techniques.lesson', 'dsa.trees.traversal_techniques', true),
  ('dsa.trees.traversal_techniques.mc_levelorder', 'dsa.trees.traversal_techniques', true),
  ('dsa.trees.traversal_reconstruction.lesson', 'dsa.trees.traversal_reconstruction', true),
  ('dsa.trees.traversal_reconstruction.mc_pair', 'dsa.trees.traversal_reconstruction', true),
  ('dsa.trees.tree_diameter.lesson', 'dsa.trees.tree_diameter', true),
  ('dsa.trees.tree_diameter.mc_method', 'dsa.trees.tree_diameter', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('dsa.trees.traversal_techniques.mc_levelorder.a', 'dsa.trees.traversal_techniques.mc_levelorder', 'A queue (FIFO)', true, 10),
  ('dsa.trees.traversal_techniques.mc_levelorder.b', 'dsa.trees.traversal_techniques.mc_levelorder', 'A stack (LIFO)', false, 20),
  ('dsa.trees.traversal_techniques.mc_levelorder.c', 'dsa.trees.traversal_techniques.mc_levelorder', 'A priority queue', false, 30),
  ('dsa.trees.traversal_techniques.mc_levelorder.d', 'dsa.trees.traversal_techniques.mc_levelorder', 'A hash set', false, 40),
  ('dsa.trees.traversal_reconstruction.mc_pair.a', 'dsa.trees.traversal_reconstruction.mc_pair', 'Preorder and inorder', true, 10),
  ('dsa.trees.traversal_reconstruction.mc_pair.b', 'dsa.trees.traversal_reconstruction.mc_pair', 'Preorder and postorder', false, 20),
  ('dsa.trees.traversal_reconstruction.mc_pair.c', 'dsa.trees.traversal_reconstruction.mc_pair', 'Level-order alone', false, 30),
  ('dsa.trees.traversal_reconstruction.mc_pair.d', 'dsa.trees.traversal_reconstruction.mc_pair', 'Postorder alone', false, 40),
  ('dsa.trees.tree_diameter.mc_method.a', 'dsa.trees.tree_diameter.mc_method', 'A single post-order DFS that returns height and tracks leftHeight + rightHeight at each node', true, 10),
  ('dsa.trees.tree_diameter.mc_method.b', 'dsa.trees.tree_diameter.mc_method', 'BFS level-order, taking the number of levels', false, 20),
  ('dsa.trees.tree_diameter.mc_method.c', 'dsa.trees.tree_diameter.mc_method', 'Recompute the height from every node and take the max', false, 30),
  ('dsa.trees.tree_diameter.mc_method.d', 'dsa.trees.tree_diameter.mc_method', 'Sort the node values and subtract', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
