-- Roadmap #74 / #114 (trees depth): learning items for BST search, heap
-- applications/selection, and union-find internals.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'dsa.trees.bst_search.lesson',
    'lesson',
    'Binary search tree search',
    'A binary search tree keeps an ordering invariant at every node: all keys in the left subtree are smaller, all keys in the right subtree are larger. That lets you search like binary search on a sorted array: compare the target to the current node, go left if smaller or right if larger, and stop when you match or hit null. Each step drops a level, so search, insert, and delete cost O(h) where h is the height. The catch is balance: a BST built from already-sorted inputs degenerates into a linked list with h = n, making operations O(n). Self-balancing trees (std::map/std::set use red-black trees) keep h ~ O(log n) automatically, which is why you rarely hand-roll a raw BST in production. An inorder traversal of a BST visits keys in sorted order.',
    'A BST keeps smaller keys left, larger right, so search/insert/delete are O(h) by comparing and descending. Unbalanced (e.g. sorted input) degenerates to O(n); std::map/std::set stay balanced at O(log n).',
    'intermediate',
    5,
    3690,
    true
  ),
  (
    'dsa.trees.bst_search.mc_cost',
    'multiple_choice',
    'BST search cost',
    'What is the time complexity of searching a binary search tree of height h?',
    'Each comparison descends one level, so search is O(h). For a balanced tree h is O(log n); for a degenerate (list-like) tree h is n, giving O(n).',
    'intermediate',
    2,
    3700,
    true
  ),
  (
    'dsa.trees.heap_applications.lesson',
    'lesson',
    'Heap applications and selection',
    'A heap (std::priority_queue) shines whenever you repeatedly need the current best element. Top-k: to keep the k largest of a stream, maintain a min-heap of size k — push each element and pop the smallest when the size exceeds k, giving O(n log k) and O(k) space instead of sorting everything. Scheduling / merging: a heap keyed by next-available-time or next-smallest-element drives event simulation, Dijkstra, and merging sorted streams. Choose a heap over the alternatives by the operations: if you need the min/max repeatedly but not full ordering, a heap O(log n) push/pop and O(1) peek beat re-sorting a std::vector each time; if you need keys kept fully sorted or range queries, use a std::map/std::set; if you only sort once and then read, a sorted vector is simplest. The cue is "repeatedly extract the best."',
    'Use a heap when you repeatedly need the best element: top-k with a size-k min-heap (O(n log k)), scheduling/merging, Dijkstra. Prefer it over re-sorting a vector; use map/set for full ordering/range queries.',
    'advanced',
    5,
    3710,
    true
  ),
  (
    'dsa.trees.heap_applications.mc_topk',
    'multiple_choice',
    'Top-k with a heap',
    'To keep the k largest elements of a large stream efficiently, what should you maintain?',
    'A min-heap of size k: push each element and pop the smallest whenever the size exceeds k, so the heap always holds the k largest seen — O(n log k) time and O(k) space, without sorting the whole stream.',
    'advanced',
    2,
    3720,
    true
  ),
  (
    'dsa.trees.dsu_internals.lesson',
    'lesson',
    'Union-find internals',
    'Union-find stores each element parent; the representative of a set is the root you reach by following parents. Two optimizations make it nearly free. Union by rank/size always attaches the smaller (or shallower) tree under the larger root, keeping trees shallow instead of letting them grow into chains. Path compression points every node visited during a find directly at the root, so future finds are flat. Used together, m operations on n elements run in O(m * alpha(n)), where alpha is the inverse Ackermann function — effectively a small constant (< 5) for any realistic n, so each operation is "near-constant amortized." Without these, naive union-find can degrade to O(n) per operation. This is what makes union-find the tool of choice for connected components and Kruskal MST.',
    'Union by rank/size keeps trees shallow; path compression flattens the path to the root on each find. Together they give O(alpha(n)) ~ near-constant amortized per operation, vs O(n) for naive union-find.',
    'advanced',
    5,
    3730,
    true
  ),
  (
    'dsa.trees.dsu_internals.mc_compression',
    'multiple_choice',
    'What path compression does',
    'What does path compression do during a union-find find operation?',
    'It repoints the nodes visited on the way to the root directly at the root, flattening the tree so subsequent finds on those nodes are nearly O(1). Combined with union by rank it yields near-constant amortized cost.',
    'advanced',
    2,
    3740,
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
  ('dsa.trees.bst_search.lesson', 'dsa.trees.bst_search', true),
  ('dsa.trees.bst_search.mc_cost', 'dsa.trees.bst_search', true),
  ('dsa.trees.heap_applications.lesson', 'dsa.trees.heap_applications', true),
  ('dsa.trees.heap_applications.mc_topk', 'dsa.trees.heap_applications', true),
  ('dsa.trees.dsu_internals.lesson', 'dsa.trees.dsu_internals', true),
  ('dsa.trees.dsu_internals.mc_compression', 'dsa.trees.dsu_internals', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('dsa.trees.bst_search.mc_cost.a', 'dsa.trees.bst_search.mc_cost', 'O(h), the tree height', true, 10),
  ('dsa.trees.bst_search.mc_cost.b', 'dsa.trees.bst_search.mc_cost', 'O(n) always', false, 20),
  ('dsa.trees.bst_search.mc_cost.c', 'dsa.trees.bst_search.mc_cost', 'O(1)', false, 30),
  ('dsa.trees.bst_search.mc_cost.d', 'dsa.trees.bst_search.mc_cost', 'O(n log n)', false, 40),
  ('dsa.trees.heap_applications.mc_topk.a', 'dsa.trees.heap_applications.mc_topk', 'A min-heap of size k', true, 10),
  ('dsa.trees.heap_applications.mc_topk.b', 'dsa.trees.heap_applications.mc_topk', 'A max-heap holding every element', false, 20),
  ('dsa.trees.heap_applications.mc_topk.c', 'dsa.trees.heap_applications.mc_topk', 'A fully sorted copy of the whole stream', false, 30),
  ('dsa.trees.heap_applications.mc_topk.d', 'dsa.trees.heap_applications.mc_topk', 'A hash set of all elements', false, 40),
  ('dsa.trees.dsu_internals.mc_compression.a', 'dsa.trees.dsu_internals.mc_compression', 'Repoints visited nodes directly at the root, flattening the tree', true, 10),
  ('dsa.trees.dsu_internals.mc_compression.b', 'dsa.trees.dsu_internals.mc_compression', 'Sorts the elements by rank', false, 20),
  ('dsa.trees.dsu_internals.mc_compression.c', 'dsa.trees.dsu_internals.mc_compression', 'Deletes elements from the set', false, 30),
  ('dsa.trees.dsu_internals.mc_compression.d', 'dsa.trees.dsu_internals.mc_compression', 'Balances the tree by rotating nodes', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
