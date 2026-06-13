-- Learning content for the STL associative-container skills (#46).
-- Two items per skill; idempotent; mirrored in learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index)
values
  (
    'cpp.stl.map.lesson',
    'lesson',
    'std::map and unordered_map',
    'A `std::map<K, V>` stores key-value pairs with unique keys, kept sorted by key (operations are O(log n)). A `std::unordered_map<K, V>` is a hash table: average O(1) lookups but no ordering. `m[k]` reads or inserts a default value when the key is missing, `m.at(k)` throws if the key is missing, and `m.contains(k)` (or `m.find(k) != m.end()`) checks for a key without inserting it.',
    'Reach for unordered_map when you just need fast lookup, and map when you need keys in sorted order. Beware that operator[] inserts.',
    'intermediate',
    4,
    1010
  ),
  (
    'cpp.stl.map.mc_check_key',
    'multiple_choice',
    'Checking a key without inserting',
    'How do you check whether key `k` is present in a `std::map m` WITHOUT inserting it?',
    '`m.contains(k)` (or `m.find(k) != m.end()`) checks for the key without modifying the map. `m[k]` inserts a default value when the key is missing, which is the classic accidental-insert bug.',
    'intermediate',
    2,
    1020
  ),
  (
    'cpp.stl.set.lesson',
    'lesson',
    'std::set and unordered_set',
    'A `std::set<T>` stores unique elements kept in sorted order; a `std::unordered_set<T>` stores unique elements with hashing and no order. `insert` adds an element (and is ignored if it is already present), `contains`/`count` tests membership, and `erase` removes. Sets are ideal for deduplicating values and for fast membership checks.',
    'Use a set when you care about uniqueness or membership. Choose unordered_set for speed and set when you also need sorted iteration.',
    'intermediate',
    4,
    1030
  ),
  (
    'cpp.stl.set.mc_insert_dup',
    'multiple_choice',
    'Inserting a duplicate into a set',
    'What happens when you `insert` a value that is already present in a `std::set`?',
    'Sets store unique elements, so inserting a value that is already present leaves the set unchanged (the insert reports that nothing new was added).',
    'intermediate',
    2,
    1040
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
  ('cpp.stl.map.lesson', 'cpp.stl.map', true),
  ('cpp.stl.map.mc_check_key', 'cpp.stl.map', true),
  ('cpp.stl.set.lesson', 'cpp.stl.set', true),
  ('cpp.stl.set.mc_insert_dup', 'cpp.stl.set', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.stl.map.mc_check_key.a', 'cpp.stl.map.mc_check_key', 'm.contains(k) (or m.find(k) != m.end())', true, 10),
  ('cpp.stl.map.mc_check_key.b', 'cpp.stl.map.mc_check_key', 'm[k]', false, 20),
  ('cpp.stl.map.mc_check_key.c', 'cpp.stl.map.mc_check_key', 'm.at(k)', false, 30),
  ('cpp.stl.map.mc_check_key.d', 'cpp.stl.map.mc_check_key', 'm.size()', false, 40),

  ('cpp.stl.set.mc_insert_dup.a', 'cpp.stl.set.mc_insert_dup', 'Nothing changes; sets store unique elements', true, 10),
  ('cpp.stl.set.mc_insert_dup.b', 'cpp.stl.set.mc_insert_dup', 'The value is stored a second time', false, 20),
  ('cpp.stl.set.mc_insert_dup.c', 'cpp.stl.set.mc_insert_dup', 'insert throws an exception', false, 30),
  ('cpp.stl.set.mc_insert_dup.d', 'cpp.stl.set.mc_insert_dup', 'The whole set is cleared', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
