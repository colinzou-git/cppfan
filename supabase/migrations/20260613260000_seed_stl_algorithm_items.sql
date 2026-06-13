-- Learning content for the STL algorithms and iterators skills (#46).
-- Two items per skill; idempotent; mirrored in learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index)
values
  (
    'cpp.stl.algorithms.lesson',
    'lesson',
    'Standard algorithms',
    'The `<algorithm>` and `<numeric>` headers provide reusable operations that take iterator ranges. `std::sort(v.begin(), v.end())` sorts in place; `std::find(v.begin(), v.end(), value)` returns an iterator (or `end()` if not found); `std::count` counts matches; `std::accumulate(v.begin(), v.end(), 0)` sums; `std::min_element` and `std::max_element` return iterators to the smallest and largest elements. Prefer these over writing the loop by hand.',
    'Standard algorithms are tested, expressive, and hard to get wrong. Pass a custom comparator or lambda when you need ordering other than the default.',
    'intermediate',
    4,
    1110
  ),
  (
    'cpp.stl.algorithms.mc_sort',
    'multiple_choice',
    'Sorting a vector',
    'Which expression sorts a `std::vector<int> v` into ascending order in place?',
    '`std::sort(v.begin(), v.end())` sorts the range in place using `<` by default. vector has no `.sort()` member (that is std::list); the others are not real functions.',
    'intermediate',
    2,
    1120
  ),
  (
    'cpp.stl.iterators.lesson',
    'lesson',
    'Iterators and range-based for',
    'An iterator points into a container. `begin()` refers to the first element and `end()` refers to one position past the last, so a range is the half-open interval `[begin, end)`. Range-based for (`for (auto& x : v)`) walks every element without manual iterators. Algorithms operate on `[begin, end)` ranges, and search functions like `find` return `end()` to mean "not found".',
    'end() is a sentinel, not a real element — never dereference it. Compare an iterator to end() to test whether a search succeeded.',
    'intermediate',
    4,
    1130
  ),
  (
    'cpp.stl.iterators.mc_end',
    'multiple_choice',
    'What end() refers to',
    'In a standard container, what does `container.end()` refer to?',
    '`end()` is a sentinel one position past the last element. It is not a real element and must not be dereferenced; it marks the end of the `[begin, end)` range.',
    'intermediate',
    2,
    1140
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
  ('cpp.stl.algorithms.lesson', 'cpp.stl.algorithms', true),
  ('cpp.stl.algorithms.mc_sort', 'cpp.stl.algorithms', true),
  ('cpp.stl.iterators.lesson', 'cpp.stl.iterators', true),
  ('cpp.stl.iterators.mc_end', 'cpp.stl.iterators', true),
  ('cpp.stl.algorithms.lesson', 'cpp.stl.iterators', false)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.stl.algorithms.mc_sort.a', 'cpp.stl.algorithms.mc_sort', 'std::sort(v.begin(), v.end())', true, 10),
  ('cpp.stl.algorithms.mc_sort.b', 'cpp.stl.algorithms.mc_sort', 'v.sort()', false, 20),
  ('cpp.stl.algorithms.mc_sort.c', 'cpp.stl.algorithms.mc_sort', 'std::order(v)', false, 30),
  ('cpp.stl.algorithms.mc_sort.d', 'cpp.stl.algorithms.mc_sort', 'sort(v, ascending)', false, 40),

  ('cpp.stl.iterators.mc_end.a', 'cpp.stl.iterators.mc_end', 'One position past the last element (a sentinel, not a real element)', true, 10),
  ('cpp.stl.iterators.mc_end.b', 'cpp.stl.iterators.mc_end', 'The last element of the container', false, 20),
  ('cpp.stl.iterators.mc_end.c', 'cpp.stl.iterators.mc_end', 'The first element of the container', false, 30),
  ('cpp.stl.iterators.mc_end.d', 'cpp.stl.iterators.mc_end', 'A null pointer', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
