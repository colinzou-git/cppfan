-- Learning content for the dsa.arrays skills (#48, first slice).
-- Two items per skill; idempotent; mirrored in learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index)
values
  (
    'dsa.arrays.indexing.lesson',
    'lesson',
    'Zero-based indexing',
    'Arrays and vectors are zero-indexed: for a sequence of size `n`, the valid indices are `0` through `n - 1`. Reading or writing index `n` (or a negative index) is out of bounds and is undefined behavior with `operator[]`. Most off-by-one bugs come from looping while `i <= n` instead of `i < n`.',
    'Always reason about the half-open range [0, n): the first valid index is 0 and the last is n - 1.',
    'beginner',
    3,
    910
  ),
  (
    'dsa.arrays.indexing.mc_last_index',
    'multiple_choice',
    'Last valid index',
    'For a vector with `n` elements, what is the last valid index?',
    'Indices run from 0 to n - 1, so the last valid index is n - 1. Index n is one past the end and is out of bounds.',
    'beginner',
    2,
    920
  ),
  (
    'dsa.arrays.traversal.code_reading',
    'code_reading',
    'Reading a traversal loop',
    'Read this code:\n\n```cpp\nint sum = 0;\nfor (int x : v) {\n  sum += x;\n}\n```\n\nWhat does `sum` hold after the loop, for a vector `v`?',
    'The range-based for loop visits every element of `v` once, so `sum` holds the total of all elements in `v`.',
    'beginner',
    2,
    930
  ),
  (
    'dsa.arrays.traversal.mc_safe_loop',
    'multiple_choice',
    'A correct traversal',
    'Which loop visits every element of a vector `v` exactly once, with no out-of-bounds access?',
    'A range-based for loop (`for (int x : v)`) visits each element exactly once and cannot run off the end. The index loop must use `i < v.size()` (not `<=`) and start at 0.',
    'beginner',
    2,
    940
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
  ('dsa.arrays.indexing.lesson', 'dsa.arrays.indexing', true),
  ('dsa.arrays.indexing.mc_last_index', 'dsa.arrays.indexing', true),
  ('dsa.arrays.traversal.code_reading', 'dsa.arrays.traversal', true),
  ('dsa.arrays.traversal.mc_safe_loop', 'dsa.arrays.traversal', true),
  ('dsa.arrays.traversal.mc_safe_loop', 'dsa.arrays.indexing', false)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('dsa.arrays.indexing.mc_last_index.a', 'dsa.arrays.indexing.mc_last_index', 'n - 1', true, 10),
  ('dsa.arrays.indexing.mc_last_index.b', 'dsa.arrays.indexing.mc_last_index', 'n', false, 20),
  ('dsa.arrays.indexing.mc_last_index.c', 'dsa.arrays.indexing.mc_last_index', 'n + 1', false, 30),
  ('dsa.arrays.indexing.mc_last_index.d', 'dsa.arrays.indexing.mc_last_index', '1', false, 40),

  ('dsa.arrays.traversal.mc_safe_loop.a', 'dsa.arrays.traversal.mc_safe_loop', 'for (int x : v) { ... }', true, 10),
  ('dsa.arrays.traversal.mc_safe_loop.b', 'dsa.arrays.traversal.mc_safe_loop', 'for (int i = 0; i <= v.size(); i++) { ... }', false, 20),
  ('dsa.arrays.traversal.mc_safe_loop.c', 'dsa.arrays.traversal.mc_safe_loop', 'for (int i = 1; i < v.size(); i++) { ... }', false, 30),
  ('dsa.arrays.traversal.mc_safe_loop.d', 'dsa.arrays.traversal.mc_safe_loop', 'while (true) { ... }', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
