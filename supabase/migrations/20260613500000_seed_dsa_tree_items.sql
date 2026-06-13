-- Roadmap #65 / #74 (stage 7): learning items for trees, heaps, and disjoint-set.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'dsa.trees.traversal.lesson',
    'lesson',
    'Binary tree traversal',
    'A binary tree node holds a value and links to a left and right child. Depth-first traversals visit nodes recursively in one of three orders: preorder (node, left, right), inorder (left, node, right), and postorder (left, right, node). Breadth-first (level-order) traversal visits nodes level by level using a queue. On a binary search tree, an inorder traversal visits values in sorted ascending order, which is why inorder is the go-to for printing or validating a BST.',
    'Preorder, inorder, and postorder differ only in when the node itself is visited relative to its children; inorder on a BST yields sorted order.',
    'intermediate',
    5,
    2010,
    true
  ),
  (
    'dsa.trees.traversal.mc_inorder_bst',
    'multiple_choice',
    'Inorder on a BST',
    'On a binary search tree, what order does an inorder traversal visit the values in?',
    'Inorder visits left subtree, then the node, then the right subtree. Because a BST keeps smaller values left and larger values right, this produces ascending sorted order.',
    'intermediate',
    2,
    2020,
    true
  ),
  (
    'dsa.trees.heap.lesson',
    'lesson',
    'Heaps and priority queues',
    'A binary heap is a complete binary tree stored in an array where every parent compares ahead of its children: a max-heap keeps the largest value at the root, a min-heap the smallest. This makes reading the top element O(1), while pushing or popping reshuffles the heap in O(log n). In C++ the std::priority_queue adapter is a heap, and std::make_heap/push_heap/pop_heap operate on a range directly. Reach for a heap when you repeatedly need the current best element, such as in Dijkstra''s algorithm or merging sorted streams.',
    'A heap gives O(1) access to the min or max and O(log n) insert/remove, which is ideal when you keep pulling the best remaining element.',
    'intermediate',
    5,
    2030,
    true
  ),
  (
    'dsa.trees.heap.mc_top_cost',
    'multiple_choice',
    'Reading the heap top',
    'What is the time complexity of reading the maximum element from a max-heap?',
    'The largest element is always at the root of a max-heap, so reading it (the top() of a priority_queue) is O(1). Removing it costs O(log n) to restore the heap.',
    'intermediate',
    2,
    2040,
    true
  ),
  (
    'dsa.trees.disjoint_set.lesson',
    'lesson',
    'Disjoint set (union-find)',
    'A disjoint-set (union-find) structure tracks elements partitioned into non-overlapping groups. It supports two operations: find(x) returns a representative for x''s group, and union(a, b) merges the two groups. With path compression and union by rank, both run in near-constant amortized time. Union-find shines for connected-components questions and cycle detection — for example, Kruskal''s minimum spanning tree algorithm uses it to reject an edge whose endpoints already share a group.',
    'Union-find answers "are these two elements in the same group?" and merges groups in near-constant time, which is why it powers connectivity and cycle-detection problems.',
    'advanced',
    5,
    2050,
    true
  ),
  (
    'dsa.trees.disjoint_set.mc_use_case',
    'multiple_choice',
    'When to use union-find',
    'Which task is union-find (disjoint set) best suited for?',
    'Union-find is built for grouping and connectivity: detecting whether adding an edge connects two already-connected vertices (a cycle), tracking connected components, and merging groups efficiently.',
    'advanced',
    2,
    2060,
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
  ('dsa.trees.traversal.lesson', 'dsa.trees.traversal', true),
  ('dsa.trees.traversal.mc_inorder_bst', 'dsa.trees.traversal', true),
  ('dsa.trees.heap.lesson', 'dsa.trees.heap', true),
  ('dsa.trees.heap.mc_top_cost', 'dsa.trees.heap', true),
  ('dsa.trees.disjoint_set.lesson', 'dsa.trees.disjoint_set', true),
  ('dsa.trees.disjoint_set.mc_use_case', 'dsa.trees.disjoint_set', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('dsa.trees.traversal.mc_inorder_bst.a', 'dsa.trees.traversal.mc_inorder_bst', 'Ascending sorted order', true, 10),
  ('dsa.trees.traversal.mc_inorder_bst.b', 'dsa.trees.traversal.mc_inorder_bst', 'Descending sorted order', false, 20),
  ('dsa.trees.traversal.mc_inorder_bst.c', 'dsa.trees.traversal.mc_inorder_bst', 'Level by level from the root', false, 30),
  ('dsa.trees.traversal.mc_inorder_bst.d', 'dsa.trees.traversal.mc_inorder_bst', 'Random order', false, 40),
  ('dsa.trees.heap.mc_top_cost.a', 'dsa.trees.heap.mc_top_cost', 'O(1)', true, 10),
  ('dsa.trees.heap.mc_top_cost.b', 'dsa.trees.heap.mc_top_cost', 'O(log n)', false, 20),
  ('dsa.trees.heap.mc_top_cost.c', 'dsa.trees.heap.mc_top_cost', 'O(n)', false, 30),
  ('dsa.trees.heap.mc_top_cost.d', 'dsa.trees.heap.mc_top_cost', 'O(n log n)', false, 40),
  ('dsa.trees.disjoint_set.mc_use_case.a', 'dsa.trees.disjoint_set.mc_use_case', 'Detecting whether adding an edge forms a cycle in a graph', true, 10),
  ('dsa.trees.disjoint_set.mc_use_case.b', 'dsa.trees.disjoint_set.mc_use_case', 'Sorting an array in place', false, 20),
  ('dsa.trees.disjoint_set.mc_use_case.c', 'dsa.trees.disjoint_set.mc_use_case', 'Finding the shortest string in a list', false, 30),
  ('dsa.trees.disjoint_set.mc_use_case.d', 'dsa.trees.disjoint_set.mc_use_case', 'Reversing a linked list', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
