-- Learning content for the STL sequence-container skills (#46, first slice).
-- Two items per skill; idempotent; mirrored in learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index)
values
  (
    'cpp.stl.vector.lesson',
    'lesson',
    'std::vector basics',
    'A `std::vector<T>` is a resizable array that owns its elements and frees them automatically. `push_back` appends to the end, `size()` returns the count, and elements are accessed with `v[i]` or `v.at(i)`. `at(i)` checks bounds and throws on an invalid index, while `v[i]` does not. Prefer vector over a raw `new[]` array.',
    'vector handles growth and cleanup for you, so you rarely need manual arrays. Use at() when an index might be out of range.',
    'intermediate',
    4,
    810
  ),
  (
    'cpp.stl.vector.mc_at',
    'multiple_choice',
    'Bounds-checked vector access',
    'Which `std::vector` access checks the index and throws if it is out of range?',
    '`v.at(i)` performs bounds checking and throws std::out_of_range for an invalid index. `v[i]` does not check and is undefined behavior when out of range.',
    'intermediate',
    2,
    820
  ),
  (
    'cpp.stl.string.code_reading',
    'code_reading',
    'Reading std::string operations',
    'Read this code:\n\n```cpp\nstd::string s = "cpp";\ns += "Fan";\nstd::size_t n = s.size();\n```\n\nWhat are the value of `s` and the value of `n`?',
    '`+=` appends, so `s` becomes "cppFan", and `size()` returns the number of characters, so `n` is 6.',
    'intermediate',
    3,
    830
  ),
  (
    'cpp.stl.string.mc_size',
    'multiple_choice',
    'Length of a std::string',
    'Which member returns the number of characters in a `std::string`?',
    '`size()` (equivalently `length()`) returns the character count. std::string manages its own storage, so you never compute length manually.',
    'intermediate',
    2,
    840
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
  ('cpp.stl.vector.lesson', 'cpp.stl.vector', true),
  ('cpp.stl.vector.mc_at', 'cpp.stl.vector', true),
  ('cpp.stl.string.code_reading', 'cpp.stl.string', true),
  ('cpp.stl.string.mc_size', 'cpp.stl.string', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.stl.vector.mc_at.a', 'cpp.stl.vector.mc_at', 'v.at(i)', true, 10),
  ('cpp.stl.vector.mc_at.b', 'cpp.stl.vector.mc_at', 'v[i]', false, 20),
  ('cpp.stl.vector.mc_at.c', 'cpp.stl.vector.mc_at', 'v.get(i)', false, 30),
  ('cpp.stl.vector.mc_at.d', 'cpp.stl.vector.mc_at', 'v.index(i)', false, 40),

  ('cpp.stl.string.mc_size.a', 'cpp.stl.string.mc_size', 'size()', true, 10),
  ('cpp.stl.string.mc_size.b', 'cpp.stl.string.mc_size', 'count()', false, 20),
  ('cpp.stl.string.mc_size.c', 'cpp.stl.string.mc_size', 'len()', false, 30),
  ('cpp.stl.string.mc_size.d', 'cpp.stl.string.mc_size', 'chars()', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
