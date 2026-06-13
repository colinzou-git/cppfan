-- Learning content for the DSA searching and sorting skills (#48).
-- Two items per skill; idempotent; mirrored in learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index)
values
  (
    'dsa.searching.binary_search.lesson',
    'lesson',
    'Binary search',
    'Binary search finds a target in a sorted sequence in O(log n) by repeatedly halving the search range: compare the middle element, then keep the left or right half. It only works when the data is sorted. In C++, `std::binary_search(begin, end, value)` returns a bool, and `std::lower_bound(begin, end, value)` returns the first position not less than value.',
    'The key precondition is sorted input. On unsorted data, binary search gives wrong answers.',
    'intermediate',
    4,
    1310
  ),
  (
    'dsa.searching.binary_search.mc_precondition',
    'multiple_choice',
    'Binary search precondition',
    'What must be true about the data for binary search to work correctly?',
    'Binary search relies on order: each comparison discards half the range, which is only valid when the sequence is sorted.',
    'intermediate',
    2,
    1320
  ),
  (
    'dsa.sorting.comparator.lesson',
    'lesson',
    'Sorting with a comparator',
    '`std::sort` orders elements with `<` by default (ascending). To sort by a custom order, pass a comparator: `std::sort(v.begin(), v.end(), [](int a, int b){ return a > b; })` sorts descending. The comparator returns `true` when `a` should come before `b`. The same idea sorts structs by a chosen field.',
    'A comparator is a small function or lambda. Keep it a strict weak ordering: it must return false when a and b are equivalent.',
    'intermediate',
    4,
    1330
  ),
  (
    'dsa.sorting.comparator.mc_descending',
    'multiple_choice',
    'Sorting descending',
    'Which comparator passed to `std::sort` orders a `std::vector<int>` from largest to smallest?',
    'A comparator returns true when its first argument should come first. `a > b` puts larger values first, giving descending order.',
    'intermediate',
    2,
    1340
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
  ('dsa.searching.binary_search.lesson', 'dsa.searching.binary_search', true),
  ('dsa.searching.binary_search.mc_precondition', 'dsa.searching.binary_search', true),
  ('dsa.sorting.comparator.lesson', 'dsa.sorting.comparator', true),
  ('dsa.sorting.comparator.mc_descending', 'dsa.sorting.comparator', true),
  ('dsa.searching.binary_search.lesson', 'dsa.sorting.comparator', false)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('dsa.searching.binary_search.mc_precondition.a', 'dsa.searching.binary_search.mc_precondition', 'The sequence must be sorted', true, 10),
  ('dsa.searching.binary_search.mc_precondition.b', 'dsa.searching.binary_search.mc_precondition', 'The sequence must contain only unique values', false, 20),
  ('dsa.searching.binary_search.mc_precondition.c', 'dsa.searching.binary_search.mc_precondition', 'The sequence must be a std::vector', false, 30),
  ('dsa.searching.binary_search.mc_precondition.d', 'dsa.searching.binary_search.mc_precondition', 'The sequence must be small', false, 40),

  ('dsa.sorting.comparator.mc_descending.a', 'dsa.sorting.comparator.mc_descending', '[](int a, int b){ return a > b; }', true, 10),
  ('dsa.sorting.comparator.mc_descending.b', 'dsa.sorting.comparator.mc_descending', '[](int a, int b){ return a < b; }', false, 20),
  ('dsa.sorting.comparator.mc_descending.c', 'dsa.sorting.comparator.mc_descending', '[](int a, int b){ return a == b; }', false, 30),
  ('dsa.sorting.comparator.mc_descending.d', 'dsa.sorting.comparator.mc_descending', 'No comparator; std::sort detects it automatically', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
