-- Roadmap #74 / #114 final coverage: applied tree traversal, reconstruction,
-- diameter, heap-selection, and union-find trace items.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'dsa.trees.traversal_techniques.code_level_trace',
    'code_reading',
    'Trace level-order by queue',
    $prompt$Trace this level-order traversal. Diagram:

```text
        A
       / \
      B   C
     /   / \
    D   E   F
```

Text equivalent: A is the root; A's children are B and C; B has left child D; C has children E and F. If the queue enqueues left child before right child, what visit order is printed?$prompt$,
    $explanation$Level-order uses a FIFO queue. Start with A, then enqueue B and C. Visit B before C, enqueue D, then visit C and enqueue E then F. The printed order is A B C D E F.$explanation$,
    'advanced',
    3,
    4822,
    true
  ),
  (
    'dsa.trees.traversal_reconstruction.code_pre_in_trace',
    'code_reading',
    'Reconstruct preorder plus inorder',
    $prompt$Given preorder `A B D C E F` and inorder `D B A E C F`, trace the reconstruction. The first preorder value is the root. What tree shape is produced? Include left/right child relationships.$prompt$,
    $explanation$Preorder starts with root A. In inorder, D B is left of A and E C F is right of A, so the left subtree uses preorder B D and the right subtree uses C E F. B has left child D. C has left child E and right child F. Diagram:

```text
        A
       / \
      B   C
     /   / \
    D   E   F
```

Text equivalent: A is root; A left B; A right C; B left D; C left E; C right F.$explanation$,
    'advanced',
    4,
    4824,
    true
  ),
  (
    'dsa.trees.tree_diameter.code_trace',
    'code_reading',
    'Trace a diameter update',
    $prompt$For this tree, using diameter measured in edges, what value should the post-order DFS record as the best diameter?

```text
        1
       / \
      2   3
     / \
    4   5
```

Text equivalent: 1 is root; 1 has children 2 and 3; 2 has children 4 and 5. The DFS returns each node's height upward and updates best with leftHeight + rightHeight.$prompt$,
    $explanation$At node 2, the path 4-2-5 has 2 edges, so best becomes 2. At root 1, the left subtree height is 2 edges to leaf 4 or 5 and the right subtree height is 1 edge to node 3, so the path 4-2-1-3 (or 5-2-1-3) has 3 edges. The best diameter is 3.$explanation$,
    'advanced',
    3,
    4826,
    true
  ),
  (
    'dsa.trees.heap_applications.mc_choose_structure',
    'multiple_choice',
    'Heap, sorted vector, or map',
    $prompt$A scheduler repeatedly receives tasks with a due time, inserts new tasks, and always runs the task with the earliest due time next. It does not need sorted iteration over all tasks. Which structure fits best?$prompt$,
    $explanation$A min-heap fits repeated insert plus extract-min: O(log n) push/pop and O(1) peek at the earliest task. A sorted vector makes each insertion expensive, and a map is useful when you also need fully sorted keyed iteration or range queries.$explanation$,
    'advanced',
    2,
    4828,
    true
  ),
  (
    'dsa.trees.dsu_internals.code_union_trace',
    'code_reading',
    'Trace union-find parents',
    $prompt$Trace this DSU state. Parent table before `find(4)`:

```text
index:  0 1 2 3 4 5
parent: 0 0 1 2 3 5
rank:   3 0 0 0 0 0
```

Text equivalent: 4 points to 3, 3 to 2, 2 to 1, 1 to 0, and 0 is the representative. With path compression, what parent entries change after `find(4)`, and what representative is returned?$prompt$,
    $explanation$`find(4)` follows 4 -> 3 -> 2 -> 1 -> 0, so the representative is 0. Path compression rewrites every visited non-root node to point directly at 0: parent[4], parent[3], parent[2], and parent[1] become 0. Future connectivity checks on those nodes are near-constant.$explanation$,
    'advanced',
    3,
    4830,
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
  ('dsa.trees.traversal_techniques.code_level_trace', 'dsa.trees.traversal_techniques', true),
  ('dsa.trees.traversal_reconstruction.code_pre_in_trace', 'dsa.trees.traversal_reconstruction', true),
  ('dsa.trees.tree_diameter.code_trace', 'dsa.trees.tree_diameter', true),
  ('dsa.trees.heap_applications.mc_choose_structure', 'dsa.trees.heap_applications', true),
  ('dsa.trees.dsu_internals.code_union_trace', 'dsa.trees.dsu_internals', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('dsa.trees.heap_applications.mc_choose_structure.a', 'dsa.trees.heap_applications.mc_choose_structure', 'A min-heap keyed by due time', true, 10),
  ('dsa.trees.heap_applications.mc_choose_structure.b', 'dsa.trees.heap_applications.mc_choose_structure', 'A sorted vector that shifts elements on every insert', false, 20),
  ('dsa.trees.heap_applications.mc_choose_structure.c', 'dsa.trees.heap_applications.mc_choose_structure', 'A map because every task must be range-queried by key', false, 30),
  ('dsa.trees.heap_applications.mc_choose_structure.d', 'dsa.trees.heap_applications.mc_choose_structure', 'A plain queue, ignoring due times after insertion', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
