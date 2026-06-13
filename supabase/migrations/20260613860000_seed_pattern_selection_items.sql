-- Roadmap #68 / #110 (pattern-selection follow-up): learning items for pattern
-- recognition, container selection, and recursion/backtracking choice.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'dsa.complexity.pattern_recognition.lesson',
    'lesson',
    'Recognizing the right pattern',
    'Most interview/competitive problems map to a small set of standard patterns; learning to read the cues saves you from reinventing one each time. "How many times does X appear / are there duplicates / group by key" points to a frequency map / counting (hash map). "Find a pair/subarray in a sorted array" or "longest/shortest window satisfying a condition" points to two pointers / sliding window. "Many range-sum queries" points to prefix sums. "Find pairs/closest/overlaps" often becomes easy after sorting then scanning once. The skill is matching the problem wording and structure to the pattern before coding — then you only need to recall how that one pattern works.',
    'Map cues to patterns: counting/duplicates/group-by -> frequency map; sorted-pair or longest/shortest window -> two pointers/sliding window; many range sums -> prefix sums; pairs/overlaps -> sort then scan.',
    'intermediate',
    5,
    3450,
    true
  ),
  (
    'dsa.complexity.pattern_recognition.mc_window',
    'multiple_choice',
    'Spotting a sliding window',
    '"Find the length of the longest contiguous subarray whose sum is at most K" most directly suggests which pattern?',
    'A longest/shortest contiguous-subarray-under-a-constraint problem is the canonical sliding-window cue: grow/shrink a window in O(n) rather than checking every subarray.',
    'intermediate',
    2,
    3460,
    true
  ),
  (
    'dsa.complexity.container_selection.lesson',
    'lesson',
    'Choosing a container from operations',
    'Pick the container from the operations a task actually needs, not by habit. Need indexed access and append at the back? std::vector (contiguous, cache-friendly). Need fast membership or keying by value with no order? std::unordered_set/std::unordered_map (average O(1)). Need keys kept in sorted order or range queries? std::map/std::set (O(log n), ordered). Need last-in-first-out? std::stack; first-in-first-out? std::queue; always pull the min/max? std::priority_queue (a heap). Write down the operations and their required complexity, then choose: "membership in O(1)" -> hash set; "ordered iteration" -> map/set; "LIFO" -> stack. The right container often makes the algorithm obvious.',
    'Match container to required ops: vector (index/append), unordered_map/set (O(1) membership), map/set (ordered/range, O(log n)), stack (LIFO), queue (FIFO), priority_queue (min/max).',
    'intermediate',
    5,
    3470,
    true
  ),
  (
    'dsa.complexity.container_selection.mc_membership',
    'multiple_choice',
    'Container for fast membership',
    'You need to repeatedly check whether a value has been seen, with no ordering requirement. Which container fits best?',
    'std::unordered_set gives average O(1) insert and membership checks. std::set is O(log n) and only needed when you also want sorted order; a vector would be O(n) per check.',
    'intermediate',
    2,
    3480,
    true
  ),
  (
    'dsa.complexity.recursion_choice.lesson',
    'lesson',
    'Recursion, iteration, and backtracking',
    'Reach for recursion when a problem is naturally defined in terms of smaller instances of itself: trees, divide-and-conquer (merge/quick sort, binary search), and "try each choice then recurse" search. Backtracking is recursion that builds a candidate incrementally and undoes the last choice when it cannot lead to a solution — the pattern behind permutations, subsets, N-queens, and maze/path search. Plain iteration is simpler and avoids call-stack overhead for linear scans and simple accumulation, and any recursion can be rewritten iteratively (sometimes with an explicit stack). The decision: if the structure or the set of choices is recursive, recursion/backtracking expresses it most clearly; if you are just walking a sequence once, a loop is better. Watch recursion depth — deep recursion on large inputs can overflow the stack.',
    'Use recursion for self-similar structure (trees, divide-and-conquer); backtracking for incremental choose/undo search (permutations, subsets, N-queens). Prefer iteration for linear scans; mind stack depth.',
    'advanced',
    5,
    3490,
    true
  ),
  (
    'dsa.complexity.recursion_choice.mc_backtracking',
    'multiple_choice',
    'When backtracking fits',
    'Generating all permutations of a set by choosing an element, recursing, then undoing the choice is an example of which technique?',
    'That choose / recurse / undo structure is backtracking — recursion that builds candidates incrementally and reverts a choice when exploring the next branch.',
    'advanced',
    2,
    3500,
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
  ('dsa.complexity.pattern_recognition.lesson', 'dsa.complexity.pattern_recognition', true),
  ('dsa.complexity.pattern_recognition.mc_window', 'dsa.complexity.pattern_recognition', true),
  ('dsa.complexity.container_selection.lesson', 'dsa.complexity.container_selection', true),
  ('dsa.complexity.container_selection.mc_membership', 'dsa.complexity.container_selection', true),
  ('dsa.complexity.recursion_choice.lesson', 'dsa.complexity.recursion_choice', true),
  ('dsa.complexity.recursion_choice.mc_backtracking', 'dsa.complexity.recursion_choice', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('dsa.complexity.pattern_recognition.mc_window.a', 'dsa.complexity.pattern_recognition.mc_window', 'Sliding window', true, 10),
  ('dsa.complexity.pattern_recognition.mc_window.b', 'dsa.complexity.pattern_recognition.mc_window', 'Binary search on the answer', false, 20),
  ('dsa.complexity.pattern_recognition.mc_window.c', 'dsa.complexity.pattern_recognition.mc_window', 'Depth-first search', false, 30),
  ('dsa.complexity.pattern_recognition.mc_window.d', 'dsa.complexity.pattern_recognition.mc_window', 'A frequency map', false, 40),
  ('dsa.complexity.container_selection.mc_membership.a', 'dsa.complexity.container_selection.mc_membership', 'std::unordered_set (average O(1) membership)', true, 10),
  ('dsa.complexity.container_selection.mc_membership.b', 'dsa.complexity.container_selection.mc_membership', 'std::vector (scan each time)', false, 20),
  ('dsa.complexity.container_selection.mc_membership.c', 'dsa.complexity.container_selection.mc_membership', 'std::stack', false, 30),
  ('dsa.complexity.container_selection.mc_membership.d', 'dsa.complexity.container_selection.mc_membership', 'std::priority_queue', false, 40),
  ('dsa.complexity.recursion_choice.mc_backtracking.a', 'dsa.complexity.recursion_choice.mc_backtracking', 'Backtracking', true, 10),
  ('dsa.complexity.recursion_choice.mc_backtracking.b', 'dsa.complexity.recursion_choice.mc_backtracking', 'Dynamic programming', false, 20),
  ('dsa.complexity.recursion_choice.mc_backtracking.c', 'dsa.complexity.recursion_choice.mc_backtracking', 'A greedy scan', false, 30),
  ('dsa.complexity.recursion_choice.mc_backtracking.d', 'dsa.complexity.recursion_choice.mc_backtracking', 'A single while loop', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
