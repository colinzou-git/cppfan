-- Learning content for the DSA two-pointers and recursion skills (#48).
-- Two items per skill; idempotent; mirrored in learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index)
values
  (
    'dsa.arrays.two_pointers.lesson',
    'lesson',
    'Two pointers and sliding window',
    'The two-pointer technique uses two indices moving through a sequence to solve pair and window problems in O(n) instead of O(n^2). On a sorted array you can find a pair summing to a target by starting one pointer at each end and moving inward based on the current sum. A sliding window keeps a moving range [left, right) and updates a running result as it grows and shrinks, which suits "longest/shortest subarray" style problems.',
    'Two pointers turn many nested-loop scans into a single linear pass. The array often needs to be sorted for the pair variant.',
    'intermediate',
    4,
    1610
  ),
  (
    'dsa.arrays.two_pointers.mc_complexity',
    'multiple_choice',
    'Two-pointer time complexity',
    'On a sorted array, finding a pair that sums to a target using two pointers from both ends runs in what time?',
    'Each step moves one pointer inward, so the pointers meet after at most n steps: O(n). A brute-force double loop would be O(n^2).',
    'intermediate',
    2,
    1620
  ),
  (
    'dsa.recursion.base_case.lesson',
    'lesson',
    'Recursion and base cases',
    'A recursive function solves a problem by calling itself on a smaller input. It needs a base case that stops the recursion (for example `n == 0`) and a recursive case that makes progress toward that base case. For example, `factorial(n)` returns 1 when `n == 0`, otherwise `n * factorial(n - 1)`. Without a reachable base case the calls never stop and the call stack overflows.',
    'Every recursion needs two things: a base case to stop, and a step that moves strictly toward it.',
    'intermediate',
    4,
    1630
  ),
  (
    'dsa.recursion.base_case.mc_no_base',
    'multiple_choice',
    'Missing base case',
    'What happens if a recursive function never reaches a base case?',
    'With no reachable base case the function calls itself forever, growing the call stack until it overflows (a crash), rather than returning a value.',
    'intermediate',
    2,
    1640
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
  ('dsa.arrays.two_pointers.lesson', 'dsa.arrays.two_pointers', true),
  ('dsa.arrays.two_pointers.mc_complexity', 'dsa.arrays.two_pointers', true),
  ('dsa.recursion.base_case.lesson', 'dsa.recursion.base_case', true),
  ('dsa.recursion.base_case.mc_no_base', 'dsa.recursion.base_case', true),
  ('dsa.arrays.two_pointers.mc_complexity', 'dsa.sorting.comparator', false)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('dsa.arrays.two_pointers.mc_complexity.a', 'dsa.arrays.two_pointers.mc_complexity', 'O(n)', true, 10),
  ('dsa.arrays.two_pointers.mc_complexity.b', 'dsa.arrays.two_pointers.mc_complexity', 'O(n^2)', false, 20),
  ('dsa.arrays.two_pointers.mc_complexity.c', 'dsa.arrays.two_pointers.mc_complexity', 'O(log n)', false, 30),
  ('dsa.arrays.two_pointers.mc_complexity.d', 'dsa.arrays.two_pointers.mc_complexity', 'O(1)', false, 40),

  ('dsa.recursion.base_case.mc_no_base.a', 'dsa.recursion.base_case.mc_no_base', 'It recurses forever and overflows the call stack', true, 10),
  ('dsa.recursion.base_case.mc_no_base.b', 'dsa.recursion.base_case.mc_no_base', 'It returns 0', false, 20),
  ('dsa.recursion.base_case.mc_no_base.c', 'dsa.recursion.base_case.mc_no_base', 'The compiler refuses to build it', false, 30),
  ('dsa.recursion.base_case.mc_no_base.d', 'dsa.recursion.base_case.mc_no_base', 'It runs once and stops', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
