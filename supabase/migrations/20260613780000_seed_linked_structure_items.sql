-- Roadmap #74 / #114 (trees follow-up): learning items for singly linked lists,
-- list-vs-vector tradeoffs, and tree terminology.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'dsa.trees.linked_list.lesson',
    'lesson',
    'Singly linked lists',
    'A singly linked list is a chain of nodes, each holding a value and a pointer to the next node; the last node''s next is null. Unlike an array, the elements are not contiguous — you reach the k-th element by following k pointers from the head, so indexed access is O(n). Its strength is O(1) insertion or deletion once you already hold the node before the spot: you splice by rewiring prev->next. Traverse with for (Node* p = head; p != nullptr; p = p->next). The safety traps are real: to delete a node you must keep a handle to its predecessor and free the removed node, and after freeing you must not touch it (dangling). In modern C++ you would own nodes with std::unique_ptr<Node> so the chain cleans itself up, avoiding manual delete and leaks.',
    'A singly linked list chains value+next nodes ending in null. Indexed access is O(n); splice insert/delete is O(1) with the predecessor in hand. Own nodes (e.g. unique_ptr) to avoid leaks/dangling.',
    'intermediate',
    5,
    3210,
    true
  ),
  (
    'dsa.trees.linked_list.mc_access',
    'multiple_choice',
    'Indexed access cost',
    'What is the time complexity of reaching the k-th element of a singly linked list?',
    'Nodes are not contiguous, so you must follow next pointers from the head k times — O(n) in the worst case. Arrays/vectors give O(1) indexed access instead.',
    'intermediate',
    2,
    3220,
    true
  ),
  (
    'dsa.trees.list_vs_vector.lesson',
    'lesson',
    'List vs vector tradeoffs',
    'std::vector is the right default container and std::list (a doubly linked list) is rarely worth it. The reason is memory locality: a vector stores elements contiguously, so iterating it streams through cache and is dramatically faster than chasing a linked list''s scattered node pointers — even for workloads with mid-sequence inserts, the vector''s cheap traversal usually wins. A linked list''s theoretical advantage is O(1) insertion/deletion given an iterator to the position and stable references that survive insertions elsewhere; it pays off only when you frequently splice in the middle while holding that position, or must keep node addresses stable. For appends and scans, vector::push_back (amortized O(1)) plus contiguous storage beats it. Rule of thumb: reach for vector first; justify list with a concrete locality-or-stability reason.',
    'Prefer std::vector: contiguous storage gives cache-friendly traversal that usually beats a linked list. std::list only helps for frequent mid-sequence splicing with a held position or stable node references.',
    'intermediate',
    5,
    3230,
    true
  ),
  (
    'dsa.trees.list_vs_vector.mc_default',
    'multiple_choice',
    'Why vector is the default',
    'Why is std::vector usually preferred over std::list even when there are some insertions?',
    'Vector stores elements contiguously, so it is cache-friendly and fast to traverse, whereas a linked list chases scattered pointers. That locality advantage usually outweighs list''s O(1) mid-sequence splice.',
    'intermediate',
    2,
    3240,
    true
  ),
  (
    'dsa.trees.tree_terminology.lesson',
    'lesson',
    'Tree terminology and shape',
    'A tree is a hierarchy of nodes with one root (no parent); every other node has exactly one parent, and nodes with no children are leaves. An edge connects a parent and child. Any node plus all its descendants form a subtree — which is why trees are naturally recursive: a tree is a root whose children are themselves trees. Two measures matter: the depth of a node is the number of edges from the root down to it (the root has depth 0), and the height of a node is the number of edges on the longest path down to a leaf (a leaf has height 0); the height of the tree is the height of its root. This recursive view is what lets traversals and most tree algorithms be written as a base case (null/leaf) plus a combination of the results on each child subtree.',
    'Root (no parent), leaves (no children), subtree (a node + its descendants). Depth counts edges from the root down; height counts edges down to the farthest leaf. Trees are recursive: children are subtrees.',
    'intermediate',
    5,
    3250,
    true
  ),
  (
    'dsa.trees.tree_terminology.mc_height',
    'multiple_choice',
    'Height of a leaf',
    'Using the convention that height counts edges to the farthest leaf, what is the height of a leaf node?',
    'A leaf has no children, so the longest downward path from it has zero edges — height 0. Its depth, by contrast, is however many edges separate it from the root.',
    'intermediate',
    2,
    3260,
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
  ('dsa.trees.linked_list.lesson', 'dsa.trees.linked_list', true),
  ('dsa.trees.linked_list.mc_access', 'dsa.trees.linked_list', true),
  ('dsa.trees.list_vs_vector.lesson', 'dsa.trees.list_vs_vector', true),
  ('dsa.trees.list_vs_vector.mc_default', 'dsa.trees.list_vs_vector', true),
  ('dsa.trees.tree_terminology.lesson', 'dsa.trees.tree_terminology', true),
  ('dsa.trees.tree_terminology.mc_height', 'dsa.trees.tree_terminology', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('dsa.trees.linked_list.mc_access.a', 'dsa.trees.linked_list.mc_access', 'O(n)', true, 10),
  ('dsa.trees.linked_list.mc_access.b', 'dsa.trees.linked_list.mc_access', 'O(1)', false, 20),
  ('dsa.trees.linked_list.mc_access.c', 'dsa.trees.linked_list.mc_access', 'O(log n)', false, 30),
  ('dsa.trees.linked_list.mc_access.d', 'dsa.trees.linked_list.mc_access', 'O(n log n)', false, 40),
  ('dsa.trees.list_vs_vector.mc_default.a', 'dsa.trees.list_vs_vector.mc_default', 'Contiguous storage makes vector cache-friendly and fast to traverse', true, 10),
  ('dsa.trees.list_vs_vector.mc_default.b', 'dsa.trees.list_vs_vector.mc_default', 'std::list cannot store more than 100 elements', false, 20),
  ('dsa.trees.list_vs_vector.mc_default.c', 'dsa.trees.list_vs_vector.mc_default', 'std::vector gives O(1) mid-sequence insertion', false, 30),
  ('dsa.trees.list_vs_vector.mc_default.d', 'dsa.trees.list_vs_vector.mc_default', 'std::list cannot be iterated', false, 40),
  ('dsa.trees.tree_terminology.mc_height.a', 'dsa.trees.tree_terminology.mc_height', '0', true, 10),
  ('dsa.trees.tree_terminology.mc_height.b', 'dsa.trees.tree_terminology.mc_height', '1', false, 20),
  ('dsa.trees.tree_terminology.mc_height.c', 'dsa.trees.tree_terminology.mc_height', 'Its depth from the root', false, 30),
  ('dsa.trees.tree_terminology.mc_height.d', 'dsa.trees.tree_terminology.mc_height', 'The number of nodes in the tree', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
